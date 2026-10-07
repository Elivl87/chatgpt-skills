#!/usr/bin/env python3
"""EP002 block K: thought-bubble proposals (Producer, 2026-10-07: "esa nube de pensamiento… se ve como rara").

  QUALITY=review python3 scripts/ep002-bubble-proposals.py    # -> docs/ep002/EP002_bubble_proposals.jpg

The current bubble is overlapping circles each with its own outline (seams inside, a lumpy edge) on a canvas too
small for them (its top is cut flat). Three replacements, same size and place, same 1998 picture inside:
  A  classic cloud, polished: one silhouette, one ink line, soft shadow, a little shade at the bottom, a growing trail
  B  memory: no ink line, a soft warm glow whose edge dissolves, the picture fading into it, sparkles
  C  8-bit cloud: the cloud drawn in big square pixels with a pixel outline and square trail, like the 1998 title cards
"""
import importlib.util, math, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sp = importlib.util.spec_from_file_location('K', HERE / 'ep002-blockK-animatic.py')
K = importlib.util.module_from_spec(sp); sp.loader.exec_module(K)
from lib import ROOT, S, Si, ease, T  # noqa: E402

INK = (20, 14, 18)
CIRCLES = ((60, 70, 60), (140, 50, 70), (230, 55, 70), (300, 90, 55), (90, 150, 60), (190, 160, 70), (280, 150, 55))
OFF = 20                                                       # margin so no circle is cut by the canvas (the v8 flat top)
CW, CHh = 370 + 2 * OFF, 290 + 2 * OFF                         # design px


def _picture(t):
    pic = K.crt_flicker(K.HB.old_picture(t, (250, 150)).resize((Si(250), Si(150)), Image.NEAREST), t)
    return pic


def _union(scale=1.0, grow=0, pad=0):
    """The cloud's silhouette as one shape (design px * scale); pad adds room all round (design px)."""
    m = Image.new('L', (int(Si(CW + 2 * pad) * scale), int(Si(CHh + 2 * pad) * scale)), 0); d = ImageDraw.Draw(m)
    for x, y, r in CIRCLES:
        x, y, r = (x + 10 + OFF + pad) * scale, (y + 10 + OFF + pad) * scale, (r + grow) * scale
        d.ellipse((S(x - r), S(y - r), S(x + r), S(y + r)), fill=255)
    return m


def _place_picture(g, pic, mask=None):
    m = Image.new('L', pic.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, pic.width - 1, pic.height - 1), S(22), fill=255)
    if mask is not None:
        m = Image.fromarray(np.minimum(np.asarray(m), np.asarray(mask)))
    g.paste(pic, (Si(55 + OFF), Si(40 + OFF)), m)


def bubble_a(t):
    """A: one silhouette, one even ink line, soft shadow, a cool shade at the bottom, a trail that grows to the cloud."""
    X = 3; big = _union(X)                                        # supersampled
    ink = big.filter(ImageFilter.MaxFilter(2 * Si(4 * X / 2) + 1))
    g = Image.new('RGBA', big.size)
    sh = Image.new('RGBA', big.size, (0, 0, 0, 0)); sh.putalpha(ink.point(lambda v: int(v * .28)))
    g.alpha_composite(sh.filter(ImageFilter.GaussianBlur(S(8) * X)), (Si(5) * X, Si(8) * X))
    inkl = Image.new('RGBA', big.size, INK + (0,)); inkl.putalpha(ink); g.alpha_composite(inkl)
    ys = np.linspace(0, 1, big.height)[:, None, None]
    grad = (np.array((255, 255, 255)) * (1 - ys ** 3) + np.array((214, 224, 242)) * ys ** 3).repeat(big.width, 1)
    fill = Image.fromarray(np.concatenate([grad, np.asarray(big)[..., None]], 2).astype(np.uint8), 'RGBA')
    g.alpha_composite(fill)
    g = g.resize((Si(CW), Si(CHh)), Image.LANCZOS)
    pic = _picture(t)
    frame = Image.new('RGBA', (pic.width + Si(8), pic.height + Si(8)))
    ImageDraw.Draw(frame).rounded_rectangle((0, 0, frame.width - 1, frame.height - 1), S(26), fill=INK + (255,))
    g.alpha_composite(frame, (Si(55 + OFF) - Si(4), Si(40 + OFF) - Si(4)))
    _place_picture(g, pic)
    d = ImageDraw.Draw(g)
    for x, y, r in ((122, 266, 13), (98, 292, 9), (80, 312, 6)):  # the trail, smallest nearest his head
        x, y = x + OFF, y + OFF - 8
        d.ellipse((S(x - r - 3), S(y - r - 3), S(x + r + 3), S(y + r + 3)), fill=INK + (255,))
        d.ellipse((S(x - r), S(y - r), S(x + r), S(y + r)), fill=(250, 251, 255, 255))
    return g


def bubble_b(t):
    """B: a memory. No ink line: a warm glow whose edge dissolves, the picture fading into it, a few sparkles."""
    PAD = 60                                                        # room for the glow to fade out (no box edge)
    m = _union(1, grow=6, pad=PAD).filter(ImageFilter.GaussianBlur(S(16)))
    g = Image.new('RGBA', m.size, (255, 246, 226, 0)); g.putalpha(m.point(lambda v: int(min(255, v * 1.15))))
    halo = Image.new('RGBA', m.size, (255, 236, 190, 0)); halo.putalpha(_union(1, grow=26, pad=PAD).filter(ImageFilter.GaussianBlur(S(30))).point(lambda v: int(v * .55)))
    out = Image.new('RGBA', m.size); out.alpha_composite(halo); out.alpha_composite(g)
    pic = _picture(t).convert('RGBA')
    pm = Image.new('L', pic.size, 0); ImageDraw.Draw(pm).ellipse((S(-20), S(-14), pic.width + S(20), pic.height + S(14)), fill=255)
    pm = pm.filter(ImageFilter.GaussianBlur(S(14)))
    warm = Image.blend(pic.convert('RGB'), Image.new('RGB', pic.size, (255, 214, 150)), .16).convert('RGBA'); warm.putalpha(pm)
    out.alpha_composite(warm, (Si(55 + OFF + PAD), Si(40 + OFF + PAD)))
    d = ImageDraw.Draw(out)
    for i, (x, y) in enumerate(((70, 60), (330, 80), (300, 205), (60, 190), (200, 30))):
        s = S(5 + 3 * (0.5 + 0.5 * math.sin(t * 4 + i * 1.7)))
        x, y = S(x + OFF + PAD), S(y + OFF + PAD)
        d.polygon([(x, y - s), (x + s * .25, y - s * .25), (x + s, y), (x + s * .25, y + s * .25), (x, y + s), (x - s * .25, y + s * .25), (x - s, y), (x - s * .25, y - s * .25)], fill=(255, 250, 225, 230))
    for x, y, r in ((122, 266, 9), (98, 290, 6), (80, 308, 4)):   # glowing dots down to his head
        x, y = S(x + OFF + PAD), S(y + OFF + PAD - 8)
        gl = Image.new('RGBA', out.size); ImageDraw.Draw(gl).ellipse((x - S(r * 2), y - S(r * 2), x + S(r * 2), y + S(r * 2)), fill=(255, 240, 200, 150))
        out.alpha_composite(gl.filter(ImageFilter.GaussianBlur(S(r))))
        d.ellipse((x - S(r), y - S(r), x + S(r), y + S(r)), fill=(255, 252, 240, 255))
    return out.crop((Si(PAD) // 2, Si(PAD) // 2, out.width - Si(PAD) // 2, out.height - Si(PAD) // 2))


def bubble_c(t):
    """C: an 8-bit cloud: the silhouette in big square pixels, a pixel outline, square trail (the 1998 cards' look)."""
    px = Si(10)                                                     # one "pixel" = 10 design px
    m = _union(1)
    small = m.resize((max(1, m.width // px), max(1, m.height // px)), Image.BILINEAR).point(lambda v: 255 if v > 110 else 0)
    outline = small.filter(ImageFilter.MaxFilter(3))
    up = lambda im: im.resize((small.width * px, small.height * px), Image.NEAREST)
    g = Image.new('RGBA', (small.width * px, small.height * px))
    inkl = Image.new('RGBA', g.size, INK + (0,)); inkl.putalpha(up(outline)); g.alpha_composite(inkl)
    shade = Image.new('RGBA', g.size, (206, 218, 240, 0)); shade.putalpha(up(small)); g.alpha_composite(shade)
    hi = Image.new('RGBA', g.size, (255, 255, 255, 0))
    hs = Image.fromarray(np.roll(np.asarray(small), (-1, -1), (0, 1)) & np.asarray(small)); hi.putalpha(up(hs)); g.alpha_composite(hi)
    pic = _picture(t)
    frame = Image.new('RGBA', (pic.width + 2 * px // 2, pic.height + 2 * px // 2), INK + (255,))
    g.alpha_composite(frame, (Si(55 + OFF) - px // 2, Si(40 + OFF) - px // 2))
    g.paste(pic, (Si(55 + OFF), Si(40 + OFF)))
    d = ImageDraw.Draw(g)
    for x, y, n in ((120, 266, 2), (98, 292, 1)):                   # square trail
        x, y = Si(x + OFF), Si(y + OFF - 8); s = n * px
        d.rectangle((x - s - px // 2, y - s - px // 2, x + s + px // 2, y + s + px // 2), fill=INK + (255,))
        d.rectangle((x - s, y - s, x + s, y + s), fill=(250, 251, 255, 255))
    return g


def frame_with(fn, t):
    """Block K's frame at t with the bubble replaced (the original only when fn is None)."""
    orig = K.thought_bubble
    if fn is not None:
        def tb(t_, k, cloud=1.0):
            g = fn(t_)
            s = (.4 + .6 * ease(k)) * .85
            g = g.resize((int(g.width * s), int(g.height * s)), Image.LANCZOS)
            return K.fade(g, min(1, k * 1.5))
        K.thought_bubble = tb
    fr = K.render(t)
    K.thought_bubble = orig
    return fr.convert('RGB')


def main():
    t = T('l85.w4') + 1.2
    t = min(t, K.T_MERGE - .1)
    rows = [('ACTUAL (v8)', None), ('A · nube clásica pulida', bubble_a), ('B · recuerdo (brillo cálido)', bubble_b), ('C · nube de 8 bits', bubble_c)]
    imgs = [(lab, frame_with(fn, t)) for lab, fn in rows]
    W, H = imgs[0][1].size
    tw, th = 640, 360
    f = ImageFont.truetype(str(ROOT / 'public/shared/fonts/Inter-800.woff2'), 22)
    sh = Image.new('RGB', (2 * tw + 60, 2 * (th + 44) + 20), (24, 24, 30)); d = ImageDraw.Draw(sh)
    for i, (lab, im) in enumerate(imgs):
        x, y = 20 + (i % 2) * (tw + 20), 10 + (i // 2) * (th + 44)
        d.text((x, y), lab, font=f, fill=(255, 200, 61) if i else (220, 220, 230))
        sh.paste(im.resize((tw, th), Image.LANCZOS), (x, y + 34))
    out = ROOT / 'docs/ep002/EP002_bubble_proposals.jpg'
    sh.save(out, quality=90)
    zoom = Image.new('RGB', (4 * 440 + 50, 300), (24, 24, 30))
    for i, (lab, im) in enumerate(imgs):
        c = im.crop((int(W * .52), int(H * .02), int(W * .98), int(H * .62))).resize((440, 280), Image.LANCZOS)
        zoom.paste(c, (10 + i * 450, 10))
    zoom.save(ROOT / 'docs/ep002/EP002_bubble_proposals_zoom.jpg', quality=90)
    print(out.relative_to(ROOT), f't={t:.2f}')


if __name__ == '__main__':
    main()
