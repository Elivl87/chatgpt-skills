#!/usr/bin/env python3
"""EP002 thumbnail sketches, built only from the episode's existing art (no generation, no credits). Planning only.

  python3 scripts/ep002-thumb-sketches.py    # -> docs/publish/EP002/thumbnails/sketches/*.jpg + review sheet

Three concepts, each following docs/THUMBNAIL_RULES.md (the MrBeast / Galloway standard): Quest's face big in the left
third with one extreme emotion, one hero subject, 1-3 extreme words in Fredoka Bold (white + #FFD600, thick ink outline,
soft shadow) on a clean area, never over the face. No Nintendo logos, key art or box art (M8). The review sheet shows
each at YouTube's phone sizes (246x138, 168x94). Once a concept is chosen, its 3 Test & Compare variants keep the scene
and change only the emotion or the words.
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/publish/EP002/thumbnails/sketches'
TW, TH = 1280, 720
INK = (20, 14, 18)
YELLOW, WHITE = (255, 214, 0), (255, 255, 255)
FONT = ROOT / 'public/shared/fonts/Fredoka.ttf'
FIELD = ROOT / 'docs/art_orders/ep002_final/11_field.png'
TEMPLE = ROOT / 'docs/art_orders/ep002_final/13_temple_pedestal.png'
TEMPLE_CREST = ROOT / 'public/art/ep002/overlays/13_temple_crest.png'
Q_AWE = ROOT / 'public/art/core/quest/looking_up_awe.png'                       # red hoodie, looking up, mouth open
Q_KID = ROOT / 'docs/art_orders/quest/ep002_costume/06a_kid_playing_seated.png'  # 1998: the kid with the pad, joy
Q_SCARED = ROOT / 'docs/art_orders/quest/ep002_costume/02_tunic_scared.png'     # tunic, disbelief, hands up
OCARINA = ROOT / 'public/art/ep002/props3d/ocarina_spin/f000.png'               # our 3D ocarina
TRI_PLATES = [ROOT / f'docs/ep002/triforce/plate_{n}.png' for n in ('power', 'wisdom', 'courage', 'crest')]   # the episode's golden Triforce (block B)


def font(size):
    f = ImageFont.truetype(str(FONT), size)
    f.set_variation_by_name('Bold')
    return f


def cover(path, focus=(.5, .5), zoom=1.0):
    """The plate scaled to fill 1280x720 (times zoom), cropped around `focus` (fractions of the plate)."""
    im = Image.open(path).convert('RGB')
    s = max(TW / im.width, TH / im.height) * zoom
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = min(max(0, im.width * focus[0] - TW / 2), im.width - TW)
    y = min(max(0, im.height * focus[1] - TH / 2), im.height - TH)
    return im.crop((int(x), int(y), int(x) + TW, int(y) + TH))


def grade(im, sat=1.3, con=1.12, bri=1.0):
    """Thumbnail punch: more saturation and contrast (THUMBNAIL_RULES 6)."""
    im = ImageEnhance.Color(im).enhance(sat)
    im = ImageEnhance.Contrast(im).enhance(con)
    return ImageEnhance.Brightness(im).enhance(bri)


def glow(im, cx, cy, r, col, k=.8):
    g = Image.new('RGBA', im.size)
    ImageDraw.Draw(g).ellipse((cx - r, cy - r, cx + r, cy + r), fill=col + (int(255 * k),))
    g = g.filter(ImageFilter.GaussianBlur(r * .45))
    return Image.alpha_composite(im.convert('RGBA'), g).convert('RGB')


def sparkles(im, pts, col=(255, 250, 220)):
    d = ImageDraw.Draw(im)
    for x, y, s in pts:
        d.polygon([(x, y - s), (x + s * .22, y - s * .22), (x + s, y), (x + s * .22, y + s * .22), (x, y + s),
                   (x - s * .22, y + s * .22), (x - s, y), (x - s * .22, y - s * .22)], fill=col)
    return im


def cutout(path, top=0.0, bottom=1.0, flip=False):
    """The figure cropped to its own bounds, then to the band top..bottom of its height."""
    im = Image.open(path).convert('RGBA')
    a = im.getchannel('A').point(lambda v: 255 if v > 24 else 0)
    im = im.crop(a.getbbox())
    im = im.crop((0, int(im.height * top), im.width, int(im.height * bottom)))
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im


def place(bg, fig, x, h, bottom=TH, shadow=True, rim=None):
    """Paste `fig` scaled to height h with its bottom at `bottom`; a soft dark shadow (and optional rim glow) behind it."""
    fig = fig.resize((round(fig.width * h / fig.height), round(h)), Image.LANCZOS)
    y = bottom - fig.height
    out = bg.convert('RGBA')
    if rim:
        pad = 60                                                        # room for the glow: unclipped, no box edge
        m = Image.new('L', (fig.width + 2 * pad, fig.height + 2 * pad)); m.paste(fig.getchannel('A'), (pad, pad))
        r = Image.new('RGBA', m.size, rim + (0,)); r.putalpha(m.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.GaussianBlur(16)))
        lay = Image.new('RGBA', out.size); lay.paste(r, (int(x) - pad, int(y) - pad), r)
        out.alpha_composite(lay)
    if shadow:
        pad = 50
        m = Image.new('L', (fig.width + 2 * pad, fig.height + 2 * pad)); m.paste(fig.getchannel('A').point(lambda v: int(v * .55)), (pad, pad))
        s = Image.new('RGBA', m.size, INK + (0,)); s.putalpha(m.filter(ImageFilter.GaussianBlur(14)))
        sh = Image.new('RGBA', out.size); sh.paste(s, (int(x) + 14 - pad, int(y) + 10 - pad), s)
        out.alpha_composite(sh)
    out.alpha_composite(fig, (int(x), int(y)))
    return out.convert('RGB')


def prop(bg, path, cx, cy, w, ang=0.0):
    im = path if isinstance(path, Image.Image) else Image.open(path).convert('RGBA')
    im = im.crop(im.getchannel('A').getbbox())
    im = im.resize((round(w), round(w * im.height / im.width)), Image.LANCZOS)
    if ang:
        im = im.rotate(ang, resample=Image.BICUBIC, expand=True)
    out = bg.convert('RGBA'); out.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))
    return out.convert('RGB')


def words(im, lines, box, align='right'):
    """1-3 extreme words: Fredoka Bold, each line (text, colour, relative size) fitted to the box width, thick ink
    outline + soft shadow (THUMBNAIL_RULES 5)."""
    x0, y0, x1, y1 = box
    s = 400                                                             # one base size: every line fits the width
    while s > 20 and any(font(int(s * rel)).getlength(text) > (x1 - x0) for text, _, rel in lines):
        s -= 4
    sizes = [int(s * rel) for _, _, rel in lines]
    k = min(1.0, (y1 - y0) / sum(sz * .98 for sz in sizes))
    sizes = [int(s * k) for s in sizes]
    lay = Image.new('RGBA', im.size); d = ImageDraw.Draw(lay)
    sh = Image.new('RGBA', im.size); ds = ImageDraw.Draw(sh)
    y = y0
    for (text, col, _), sz in zip(lines, sizes):
        f = font(sz); w = f.getlength(text)
        x = x1 - w if align == 'right' else x0 if align == 'left' else (x0 + x1 - w) / 2
        st = max(6, sz // 9)
        ds.text((x + sz * .05, y + sz * .07), text, font=f, fill=INK + (170,), stroke_width=st, stroke_fill=INK + (170,))
        d.text((x, y), text, font=f, fill=col, stroke_width=st, stroke_fill=INK)
        y += sz * .98
    out = im.convert('RGBA')
    out.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    out.alpha_composite(lay)
    return out.convert('RGB')


def pixelate(im, block=14, levels=24):
    """1998: the same place in big square pixels and fewer colours."""
    sm = im.resize((max(1, im.width // block), max(1, im.height // block)), Image.BILINEAR)
    sm = sm.quantize(levels, method=Image.Quantize.MEDIANCUT).convert('RGB')
    return sm.resize(im.size, Image.NEAREST)


# ---------------------------------------------------------------- the three concepts
def t1_its_back():
    """A · "IT'S BACK": Quest (red hoodie) looks up in awe at the ocarina rising glowing over Hyrule Field."""
    bg = grade(cover(FIELD, focus=(.62, .42), zoom=1.15), sat=1.35, con=1.15)
    warm = Image.new('RGB', bg.size, (255, 170, 80)); bg = Image.blend(bg, warm, .12)          # warm sky (rule 6)
    bg = glow(bg, 880, 470, 330, (120, 190, 255), 1.0)
    bg = glow(bg, 880, 470, 170, (255, 255, 255), .85)
    bg = prop(bg, OCARINA, 880, 470, 470, ang=8)
    bg = sparkles(bg, [(690, 330, 22), (1090, 600, 28), (1060, 360, 16), (730, 640, 14)])
    bg = place(bg, cutout(Q_AWE, 0, .5), -40, 760, bottom=TH + 30, rim=(255, 240, 200))
    return words(bg, [("IT'S", YELLOW, .62), ('BACK', WHITE, 1.0)], (650, 26, 1250, 300))


def t2_1998_2026():
    """B · "1998 / 2026": young Quest with his pad, all joy; the same castle and road, half in 1998 pixels, half today."""
    hd = grade(cover(FIELD, focus=(.6, .45), zoom=1.25), sat=1.3, con=1.12)
    px = pixelate(hd)
    m = Image.new('L', hd.size, 0)
    ImageDraw.Draw(m).polygon([(0, 0), (790, 0), (710, TH), (0, TH)], fill=255)               # the 1998 side, left
    bg = Image.composite(px, hd, m)
    d = ImageDraw.Draw(bg); d.line((790, 0, 710, TH), fill=WHITE, width=10); d.line((790, 0, 710, TH), fill=INK, width=4)
    bg = place(bg, cutout(Q_KID, 0, .62), -40, 690, rim=(255, 240, 200))
    bg = words(bg, [('1998', WHITE, 1.0)], (500, 30, 760, 160), align='center')
    return words(bg, [('2026', YELLOW, 1.0)], (850, 30, 1240, 210), align='center')


def t3_too_perfect():
    """C · "TOO PERFECT?": Quest in the tunic recoils in disbelief before the Triforce, glowing in the temple."""
    tp = Image.open(TEMPLE).convert('RGBA'); tp.alpha_composite(Image.open(TEMPLE_CREST).convert('RGBA'))
    tmp = OUT / '_temple.png'; tp.convert('RGB').save(tmp)
    bg = grade(cover(tmp, focus=(.5, .5), zoom=1.1), sat=1.25, con=1.15, bri=.8)
    tmp.unlink()
    bg = glow(bg, 900, 440, 330, (255, 200, 90), .9)
    bg = glow(bg, 900, 440, 150, (255, 250, 220), .55)
    tri = Image.new('RGBA', Image.open(TRI_PLATES[0]).size)
    for p in TRI_PLATES:
        tri.alpha_composite(Image.open(p).convert('RGBA'))
    bg = prop(bg, tri, 900, 450, 520)
    bg = sparkles(bg, [(660, 260, 20), (1150, 560, 26), (1120, 250, 18)])
    bg = place(bg, cutout(Q_SCARED, 0, .52), -50, 790, rim=(255, 230, 170))
    return words(bg, [('TOO', WHITE, .75), ('PERFECT?', YELLOW, 1.0)], (600, 22, 1255, 260))


CONCEPTS = [('A_its_back', t1_its_back), ('B_1998_2026', t2_1998_2026), ('C_too_perfect', t3_too_perfect)]


def review(thumbs):
    """Each concept full size and at YouTube's phone sizes (THUMBNAIL_RULES 7)."""
    pad = 24
    sh = Image.new('RGB', (pad * 4 + 640 + 246 + 168, pad + len(thumbs) * (360 + pad) + 40), (28, 28, 34))
    d = ImageDraw.Draw(sh); f = font(26)
    d.text((pad, 10), 'EP002 · bocetos de miniatura (arte existente) · tamaño real / móvil 246x138 / 168x94', font=font(20), fill=WHITE)
    y = 50
    for name, im in thumbs:
        sh.paste(im.resize((640, 360), Image.LANCZOS), (pad, y))
        sh.paste(im.resize((246, 138), Image.LANCZOS), (pad * 2 + 640, y))
        sh.paste(im.resize((168, 94), Image.LANCZOS), (pad * 3 + 640 + 246, y))
        d.text((pad * 2 + 640, y + 160), name.split('_')[0], font=f, fill=YELLOW)
        y += 360 + pad
    return sh


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    thumbs = []
    for name, fn in CONCEPTS:
        im = fn()
        im.save(OUT / f'EP002_thumb_sketch_{name}.jpg', quality=92)
        thumbs.append((name, im))
    review(thumbs).save(OUT / 'EP002_thumb_sketches_review.jpg', quality=90)
    print(OUT.relative_to(ROOT))


if __name__ == '__main__':
    main()
