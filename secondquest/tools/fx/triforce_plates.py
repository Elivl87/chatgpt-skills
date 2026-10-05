#!/usr/bin/env python3
"""Golden Triforce-like plates, engraved, at the detail level of the Producer's reference (2026-10-03). Free, local.

  python3 tools/fx/triforce_plates.py

Three upright plates + one inverted centre plate, each a gold plate with engraved borders, a patterned band, hatching,
a character silhouette with its own ink detail, a symbol medallion and a line of invented glyphs:
  POWER    (top)          the villain           -> placeholder silhouette until the villain art exists
  WISDOM   (bottom left)  Pixie (princess role) -> her thinking pose for now
  COURAGE  (bottom right) Quest (hero role)     -> his determined pose for now
  centre   (inverted)     the royal crest, faithful (Producer), traced from the Producer's shield reference
Silhouettes come from the characters' cut-outs (alpha + ink lines), so re-running after new art updates them.
Symbols and glyphs are original designs; the crest is the Producer's faithful one. Labels use Cinzel (SIL OFL, tools/fx/fonts/).

Outputs docs/ep002/triforce/: triforce_{en,es,nolabel}.png (dark background) and triforce_alpha.png (transparent),
plus one transparent PNG per plate (power, wisdom, courage, crest) for animation in the animatic/engine.
"""
import json, math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/ep002/triforce'
FONT = Path(__file__).resolve().parent / 'fonts/cinzel-700.woff'
N = 4096
INK = (28, 17, 8)
RNG = np.random.default_rng(64)

SIL = {
    'courage': ROOT / 'docs/art_orders/quest/library_v2/results/06_determined_fist.png',
    'wisdom': ROOT / 'docs/art_orders/pixie/library/results/05_thinking_chin.png',
    'power': None,  # villain not generated yet: procedural placeholder
}


# ------------------------------------------------------------------ geometry
def up_tri(apex, side):
    x, y = apex
    h = side * math.sqrt(3) / 2
    return [(x, y), (x + side / 2, y + h), (x - side / 2, y + h)]


def down_tri(top_y, x0, x1):
    w = x1 - x0
    return [(x0, top_y), (x1, top_y), ((x0 + x1) / 2, top_y + w * math.sqrt(3) / 2)]


def inset(poly, d):
    """Shrink a triangle towards its incentre by distance d."""
    p = np.array(poly, float)
    a, b, c = (np.linalg.norm(p[(i + 1) % 3] - p[(i + 2) % 3]) for i in range(3))
    inc = (a * p[0] + b * p[1] + c * p[2]) / (a + b + c)
    area = abs(np.cross(p[1] - p[0], p[2] - p[0])) / 2
    r = 2 * area / (a + b + c)
    k = (r - d) / r
    return [tuple(inc + (q - inc) * k) for q in p]


def mask_of(poly):
    m = Image.new('L', (N, N))
    ImageDraw.Draw(m).polygon(poly, fill=255)
    return np.asarray(m) > 127


# ------------------------------------------------------------------ gold
def gold_texture(poly):
    """Brushed, grainy gold with a soft highlight towards the upper left and darker edges."""
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
    p = np.array(poly)
    cx, cy = p[:, 0].mean(), p[:, 1].mean()
    span = np.ptp(p[:, 0])
    d = np.hypot((xx - (cx - span * 0.18)) / span, (yy - (cy - span * 0.2)) / span)
    light = np.clip(1.15 - d * 1.05, 0.25, 1.15)
    base = np.array([196, 160, 82], np.float32)
    col = base[None, None, :] * light[..., None]
    grain = RNG.normal(0, 13, (N, N)).astype(np.float32)
    brushed = ndimage.uniform_filter1d(RNG.normal(0, 10, (N, N)).astype(np.float32), 31, axis=1)
    col += (grain * 0.6 + brushed)[..., None]
    sp = RNG.random((N, N)) > 0.9985          # tiny sparkles
    col[sp] = [255, 238, 190]
    return np.clip(col, 0, 255)


# ------------------------------------------------------------------ engraving helpers (all draw INK on an L mask)
def edge_points(poly, step):
    pts = []
    for i in range(3):
        a, b = np.array(poly[i]), np.array(poly[(i + 1) % 3])
        n = int(np.linalg.norm(b - a) // step)
        for k in range(n):
            pts.append((a + (b - a) * (k + 0.5) / n, (b - a) / np.linalg.norm(b - a)))
    return pts


def band_pattern(d, outer, inner, kind):
    """Decorative band between two inset triangles."""
    mid = inset(outer, (np.linalg.norm(np.array(outer[0]) - np.array(inset(outer, 1)[0])) * 0) + 0)
    if kind == 'power':          # Greek key meander
        for (c, t) in edge_points(inset(outer, 32), 64):
            n_ = np.array([-t[1], t[0]]) * -1
            P = lambda u, v: tuple(c + t * u + n_ * v)
            d.line([P(-24, -18), P(24, -18), P(24, 18), P(-12, 18), P(-12, -4), P(8, -4), P(8, 6)], fill=255, width=7, joint='curve')
    elif kind == 'wisdom':       # beads and small arcs
        for k, (c, t) in enumerate(edge_points(inset(outer, 32), 46)):
            r = 9 if k % 2 else 5
            d.ellipse((c[0] - r, c[1] - r, c[0] + r, c[1] + r), fill=255)
    else:                        # courage: saw teeth
        for (c, t) in edge_points(inset(outer, 32), 52):
            n_ = np.array([-t[1], t[0]]) * -1
            P = lambda u, v: tuple(c + t * u + n_ * v)
            d.polygon([P(-22, 20), P(22, 20), P(0, -20)], fill=255)


def hatch(mask_region, spacing=30, width=8, angle=-35):
    yy, xx = np.mgrid[0:N, 0:N]
    a = math.radians(angle)
    s = (xx * math.cos(a) + yy * math.sin(a)) % spacing
    return mask_region & (s < width)


def glyph_row(d, x0, y0, x1, size, seed):
    r = np.random.default_rng(seed)
    x = x0
    while x < x1 - size:
        kind = r.integers(0, 6)
        X, Y, s = x, y0, size
        if kind == 0:
            d.line([(X, Y), (X + s * .5, Y + s), (X + s, Y)], fill=255, width=6)
        elif kind == 1:
            d.ellipse((X, Y + s * .2, X + s * .8, Y + s), outline=255, width=6); d.line([(X + s * .4, Y), (X + s * .4, Y + s)], fill=255, width=6)
        elif kind == 2:
            d.line([(X, Y + s), (X + s * .5, Y), (X + s, Y + s), (X + s * .2, Y + s * .55), (X + s * .8, Y + s * .55)], fill=255, width=6)
        elif kind == 3:
            d.arc((X, Y, X + s, Y + s), 200, 520, fill=255, width=6); d.point((X + s / 2, Y + s / 2), fill=255)
        elif kind == 4:
            d.line([(X, Y), (X, Y + s), (X + s * .8, Y + s)], fill=255, width=6); d.line([(X + s * .4, Y + s * .2), (X + s * .8, Y + s * .5)], fill=255, width=6)
        else:
            d.polygon([(X + s / 2, Y), (X + s, Y + s / 2), (X + s / 2, Y + s), (X, Y + s / 2)], outline=255, width=6)
        x += size * 1.25


def medallion(d, c, r, kind):
    """Dark disc with a gold symbol knocked out (original symbols)."""
    x, y = c
    d.ellipse((x - r, y - r, x + r, y + r), fill=255)
    hole = []  # drawn with 0 to show gold
    if kind == 'power':      # rising flame waves
        for k in (-1, 0, 1):
            pts = [(x - r * .6 + t * r * 1.2, y + k * r * .32 + math.sin(t * math.pi * 2) * r * .12) for t in np.linspace(0, 1, 40)]
            d.line(pts, fill=0, width=int(r * .14))
    elif kind == 'wisdom':   # three drops in a triad around a dot
        for a in (90, 210, 330):
            ax, ay = x + math.cos(math.radians(a)) * r * .42, y - math.sin(math.radians(a)) * r * .42
            d.ellipse((ax - r * .24, ay - r * .24, ax + r * .24, ay + r * .24), outline=0, width=int(r * .1))
        d.ellipse((x - r * .1, y - r * .1, x + r * .1, y + r * .1), fill=0)
    else:                    # courage: crescent with a leaf-like swirl
        d.ellipse((x - r * .62, y - r * .62, x + r * .62, y + r * .62), fill=0)
        d.ellipse((x - r * .38, y - r * .7, x + r * .62, y + r * .3), fill=255)
        d.arc((x - r * .3, y - r * .3, x + r * .3, y + r * .3), 30, 300, fill=0, width=int(r * .09))


def silhouette(kind, h):
    """Gold figure with engraved ink detail: (figure mask, detail-line mask) at height h."""
    if SIL[kind] is not None:
        im = Image.open(SIL[kind]).convert('RGBA')
        im = im.crop(im.getchannel('A').getbbox())
        im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
        a = np.asarray(im)
        fig = a[..., 3] > 128
        lum = ndimage.uniform_filter(a[..., :3].mean(2), 3)
        yy, xx = np.mgrid[0:fig.shape[0], 0:fig.shape[1]]
        h1 = ((xx + yy) % 9) < 3                                # 45-degree engraving lines
        h2 = ((xx - yy) % 9) < 3                                # cross-hatch for the darkest tones
        ink = lum < 42                                          # the art's own ink outlines stay solid
        lines = fig & (ink | ((lum < 150) & h1) | ((lum < 95) & h2))
        return fig, lines
    # power placeholder (until the villain art exists): crowned warlord, spiked pauldrons, wide cape, arms crossed
    w = int(h * .7)
    m = Image.new('L', (w, h)); dd = ImageDraw.Draw(m)
    cx = w / 2
    dd.polygon([(cx - w * .5, h), (cx - w * .3, h * .26), (cx + w * .3, h * .26), (cx + w * .5, h)], fill=255)          # cape
    dd.polygon([(cx - w * .2, h * .22), (cx + w * .2, h * .22), (cx + w * .15, h * .66), (cx - w * .15, h * .66)], fill=255)  # torso
    for sx in (-1, 1):                                                                                                  # pauldrons
        dd.polygon([(cx + sx * w * .12, h * .2), (cx + sx * w * .42, h * .17), (cx + sx * w * .47, h * .1), (cx + sx * w * .36, h * .27), (cx + sx * w * .14, h * .3)], fill=255)
    dd.rectangle((cx - w * .04, h * .15, cx + w * .04, h * .22), fill=255)                                               # neck
    dd.ellipse((cx - w * .085, h * .05, cx + w * .085, h * .17), fill=255)                                              # head
    for k in (-1, 0, 1):                                                                                                # crown
        dd.polygon([(cx + k * w * .05 - w * .025, h * .07), (cx + k * w * .05 + w * .025, h * .07), (cx + k * w * .05, h * .0)], fill=255)
    dd.polygon([(cx - w * .13, h * .66), (cx + w * .13, h * .66), (cx + w * .1, h), (cx - w * .1, h)], fill=255)        # legs
    fig = np.asarray(m) > 127
    l = Image.new('L', (w, h)); ld = ImageDraw.Draw(l)
    ld.line([(cx - w * .2, h * .38), (cx + w * .2, h * .44)], fill=255, width=10)                                      # crossed arms
    ld.line([(cx - w * .2, h * .44), (cx + w * .2, h * .38)], fill=255, width=10)
    ld.ellipse((cx - w * .03, h * .52, cx + w * .03, h * .56), fill=255)                                                 # belt gem
    ld.line([(cx - w * .15, h * .54), (cx + w * .15, h * .54)], fill=255, width=6)
    for k in range(7):                                                                                                  # cape folds
        ld.line([(cx - w * .28 + k * w * .093, h * .4), (cx - w * .46 + k * w * .153, h)], fill=255, width=5)
    ld.ellipse((cx - w * .04, h * .09, cx - w * .015, h * .11), fill=255); ld.ellipse((cx + w * .015, h * .09, cx + w * .04, h * .11), fill=255)  # eyes
    return fig, (np.asarray(l) > 127) & fig


def crest(d, c, s):
    """The royal crest, faithful (Producer, 2026-10-03 and 2026-10-05): the red bird and the three triangles traced from
    the Producer's shield reference (tools/props3d/shield_layers.json). The bird is cut as ink; the triangles only as
    outlines, so they stay gold."""
    L = json.loads((ROOT / 'tools/props3d/shield_layers.json').read_text())
    pts = [p for k in ('bird', 'tri') for poly in L[k] for p in poly['outer']]
    xs_, ys_ = [p[0] for p in pts], [p[1] for p in pts]
    k = 1.9 * s / (max(xs_) - min(xs_))
    my = (max(ys_) + min(ys_)) / 2
    tf = lambda p: (c[0] + p[0] * k, c[1] - (p[1] - my) * k + s * .15)
    for poly in L['bird']:
        d.polygon([tf(p) for p in poly['outer']], fill=255)
        for h in poly['holes']:
            d.polygon([tf(p) for p in h], fill=0)
    for poly in L['tri']:
        d.line([tf(p) for p in poly['outer'] + poly['outer'][:1]], fill=255, width=max(6, int(s * .025)), joint='curve')


# ------------------------------------------------------------------ plate builder
def plate(poly, kind, up=True):
    m = mask_of(poly)
    col = gold_texture(poly)
    ink = Image.new('L', (N, N)); d = ImageDraw.Draw(ink)
    d.polygon(inset(poly, 20), outline=255, width=12)
    d.polygon(inset(poly, 44), outline=255, width=5)
    if kind != 'crest':
        band_pattern(d, inset(poly, 44), inset(poly, 112), kind)
    else:
        for (c, t) in edge_points(inset(poly, 78), 40):
            d.ellipse((c[0] - 5, c[1] - 5, c[0] + 5, c[1] + 5), fill=255)
    d.polygon(inset(poly, 116), outline=255, width=6)
    inner = inset(poly, 140)
    p = np.array(inner)
    xs, ys = p[:, 0], p[:, 1]
    inner_m = mask_of(inner)
    ink_a = np.asarray(ink) > 127
    if kind == 'crest':
        cr = Image.new('L', (N, N)); crest(ImageDraw.Draw(cr), (xs.mean(), ys.min() + (ys.max() - ys.min()) * .38), (xs.max() - xs.min()) * .44)
        ink_a |= (np.asarray(cr) > 127) & inner_m
        # small corner scrolls
        for q in inner:
            d2 = ImageDraw.Draw(ink); d2.arc((q[0] - 40, q[1] - 40, q[0] + 40, q[1] + 40), 0, 300, fill=255, width=6)
        ink_a |= (np.asarray(ink) > 127)
    else:
        h = int((ys.max() - ys.min()) * .78)
        fig, lines = silhouette(kind, h)
        fh, fw = fig.shape
        side_off = {'wisdom': -.05, 'courage': .07, 'power': .02}[kind]
        fx = int(xs.mean() - fw / 2 + (xs.max() - xs.min()) * side_off)
        fy = int(ys.max() - fh - 26)
        figm = np.zeros((N, N), bool); linm = np.zeros((N, N), bool)
        figm[fy:fy + fh, fx:fx + fw] = fig; linm[fy:fy + fh, fx:fx + fw] = lines
        figm &= inner_m; linm &= inner_m
        outline = ndimage.binary_dilation(figm, iterations=9) & ~figm & inner_m
        band = hatch(inner_m, 34, 9, -35)
        # hatching only on the lower-left half of the plate, fading under the figure (like an engraved backdrop)
        yy, xx = np.mgrid[0:N, 0:N]
        diag = (xx - xs.mean()) * .5 + (yy - ys.mean()) > -40
        ink_a |= (band & diag & ~ndimage.binary_dilation(figm, iterations=18)) | outline | linm
        # medallion + glyphs
        med = Image.new('L', (N, N)); md = ImageDraw.Draw(med)
        r = (xs.max() - xs.min()) * .085
        mx = xs.min() + (xs.max() - xs.min()) * (.25 if kind != 'wisdom' else .75)
        medallion(md, (mx, ys.max() - r * 1.9), r, kind)
        medm = (np.asarray(med) > 127) & inner_m
        ink_a |= medm & ~ndimage.binary_dilation(figm, iterations=6)
        gl = Image.new('L', (N, N)); glyph_row(ImageDraw.Draw(gl), xs.min() + (xs.max() - xs.min()) * .52, ys.max() - 70, xs.max() - (xs.max() - xs.min()) * .18, 34, hash(kind) % 999)
        ink_a |= (np.asarray(gl) > 127) & inner_m & ~figm
        # stars at the three corners inside the border
        for q in inset(poly, 80):
            sd = ImageDraw.Draw(ink); sd.regular_polygon((q[0], q[1], 16), 4, rotation=45, fill=255)
        ink_a |= np.asarray(ink) > 127
    # engraved ink: dark, with a 1-px light catch below each cut (depth)
    rgb = col.copy()
    catch = np.roll(ink_a, 3, axis=0) & ~ink_a & m
    rgb[catch] = np.minimum(255, rgb[catch] * 1.25)
    rgb[ink_a & m] = INK
    # bevel: darker rim, light inner edge
    dist = ndimage.distance_transform_edt(m)
    rim = np.clip(1 - dist / 14, 0, 1)[..., None]
    rgb = rgb * (1 - rim * .45)
    alpha = (m * 255).astype(np.uint8)
    out = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), alpha])
    return Image.fromarray(out, 'RGBA')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    side, gap = 1380, 96
    hgt = side * math.sqrt(3) / 2
    y0 = (N - (2 * hgt + gap)) / 2
    top = up_tri((N / 2, y0), side)
    by = y0 + hgt + gap
    left = up_tri((N / 2 - side / 2 - gap * .62, by), side)
    right = up_tri((N / 2 + side / 2 + gap * .62, by), side)
    centre = down_tri(by + gap * .2, left[0][0] + gap * .9, right[0][0] - gap * .9)
    plates = {'power': (top, 'power'), 'wisdom': (left, 'wisdom'), 'courage': (right, 'courage'), 'crest': (centre, 'crest')}
    layers = {}
    for name, (poly, kind) in plates.items():
        im = plate(poly, kind)
        im.save(OUT / f'plate_{name}.png', optimize=True)
        layers[name] = im
        print('plate', name)
    alpha = Image.new('RGBA', (N, N))
    for im in layers.values():
        alpha.alpha_composite(im)
    # soft gold glow behind the plates
    glow = alpha.getchannel('A').filter(ImageFilter.GaussianBlur(60))
    g = Image.new('RGBA', (N, N), (230, 180, 80, 0)); g.putalpha(glow.point(lambda v: int(v * .35)))
    alpha.save(OUT / 'triforce_alpha.png', optimize=True)
    bg = Image.new('RGBA', (N, N), (20, 9, 7, 255)); bg.alpha_composite(g); bg.alpha_composite(alpha)
    bg.convert('RGB').save(OUT / 'triforce_nolabel.png', optimize=True)
    font = ImageFont.truetype(str(FONT), 150)
    for lang, (p_, w_, c_) in {'en': ('POWER', 'WISDOM', 'COURAGE'), 'es': ('PODER', 'SABIDURÍA', 'VALOR')}.items():
        im = bg.copy(); d = ImageDraw.Draw(im)
        mid_top, mid_bot = top[0][1] + hgt * .5, left[0][1] + hgt * .55
        spots = ((p_, 'right_end', N / 2 - side / 4 - 40, mid_top), (w_, 'right_end', left[0][0] - side / 4 - 30, mid_bot),
                 (c_, 'left_start', right[0][0] + side / 4 + 30, mid_bot))
        for txt, mode, x, y in spots:
            tw = d.textlength(txt, font=font)
            x = x - tw if mode == 'right_end' else x
            x = min(max(x, 30), N - tw - 30)
            d.text((x + 8, y - 75 + 8), txt, font=font, fill=(0, 0, 0, 200))
            d.text((x, y - 75), txt, font=font, fill=(244, 232, 200))
        im.convert('RGB').save(OUT / f'triforce_{lang}.png', optimize=True)
    prev = Image.open(OUT / 'triforce_es.png'); prev.thumbnail((1400, 1400)); prev.save(OUT / 'preview_es.jpg', quality=90)
    print('docs/ep002/triforce: triforce_{en,es,nolabel}.png, triforce_alpha.png, plate_*.png')


if __name__ == '__main__':
    main()
