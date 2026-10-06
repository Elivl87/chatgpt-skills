"""SecondQuest on-screen text kit for the animatic (approved 2026-10-06). Sizes in design px (1280x720); images come
back in output px, crisp at any QUALITY.

Three families, one type system (the EP001 engine's: Anton for punch, Inter 800 uppercase for labels; tokens from
src/styles/theme.ts):
  A  in Hyrule (HUD on): our own game text box - ink glass, a double gold rule, small corner diamonds; text types out
     like a game's dialogue and a fairy sparkle blinks when it is done. Evokes adventure-game text boxes, copies none.
       sq_tag, sq_banner, sq_panel
  B  in the world itself: things Quest could walk past - a carved wooden sign, a signpost, a parchment list.
       wood_sign, signpost, parchment_list
  C  real life and commentary (room, museum, editor): EP001's gold marker with an ink border.
       marker
Everything here is drawn by code, free.
"""
import math
from functools import lru_cache
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from lib import U  # noqa: E402  (design px -> output px)

ROOT = Path(__file__).resolve().parents[2]
INK = (22, 22, 31)


# ------------------------------------------------------------------ design units (1280x720) on output-size canvases
# Every size and coordinate in this kit is in design px; _new() makes a canvas of the output size and _D draws on it in
# design units, so the kit is crisp at any QUALITY (draft 480p ... final 1440p). Returned images are in output px.
def _s(v):
    return v * U


def _pts(xy):
    if isinstance(xy, (list, tuple)) and xy and isinstance(xy[0], (list, tuple)):
        return [(x * U, y * U) for x, y in xy]
    return [v * U for v in xy]


def _wd(v):
    return max(1, int(round(v * U)))


class _D:
    def __init__(self, im):
        self.d = ImageDraw.Draw(im)

    def rectangle(self, xy, fill=None, outline=None, width=1):
        self.d.rectangle(_pts(xy), fill=fill, outline=outline, width=_wd(width))

    def rounded_rectangle(self, xy, radius=0, fill=None, outline=None, width=1):
        self.d.rounded_rectangle(_pts(xy), _s(radius), fill=fill, outline=outline, width=_wd(width))

    def ellipse(self, xy, fill=None, outline=None, width=1):
        self.d.ellipse(_pts(xy), fill=fill, outline=outline, width=_wd(width))

    def line(self, xy, fill=None, width=1, joint=None):
        self.d.line(_pts(xy), fill=fill, width=_wd(width), joint=joint)

    def polygon(self, xy, fill=None, outline=None, width=1):
        self.d.polygon(_pts(xy), fill=fill, outline=outline, width=_wd(width))

    def text(self, xy, text, font=None, fill=None, **kw):
        if 'stroke_width' in kw:
            kw['stroke_width'] = _wd(kw['stroke_width'])
        self.d.text(_pts(xy), text, font=font, fill=fill, **kw)

    def textlength(self, text, font=None):
        return self.d.textlength(text, font=font) / U

    @property
    def fontmode(self):
        return self.d.fontmode

    @fontmode.setter
    def fontmode(self, v):
        self.d.fontmode = v


def _new(w, h):
    return Image.new('RGBA', (max(1, int(round(w * U))), max(1, int(round(h * U)))))


def _dw(im):
    """An output-size image's width in design px."""
    return im.width / U


def _dh(im):
    return im.height / U


def _paste(dst, src, x, y):
    dst.alpha_composite(src, (int(round(x * U)), int(round(y * U))))


_TMP = None


def _measure():
    global _TMP
    if _TMP is None:
        _TMP = _D(Image.new('RGB', (1, 1)))
    return _TMP
PAPER = (255, 248, 236)
GOLD = (255, 200, 61)
GOLD_DIM = (196, 150, 52)
GREEN = (53, 194, 107)
DANGER = (234, 75, 75)
WHITE = (255, 255, 255)
WOOD = (122, 84, 52)
WOOD_D = (78, 52, 32)
WOOD_L = (160, 116, 74)


@lru_cache(maxsize=None)
def inter(size, weight=800):
    """Inter at a design size."""
    return ImageFont.truetype(str(ROOT / f'public/shared/fonts/Inter-{weight}.woff2'), max(1, round(size * U)))


@lru_cache(maxsize=None)
def anton(size):
    """Anton at a design size."""
    return ImageFont.truetype(str(ROOT / 'public/shared/fonts/Anton-Regular.woff2'), max(1, round(size * U)))


def spaced_len(d, text, font, track):
    return sum(d.textlength(c, font=font) for c in text) + track * max(0, len(text) - 1)


def spaced(d, xy, text, font, fill, track, **kw):
    """Text with letter spacing (EP001 labels use .1-.12 em)."""
    x, y = xy
    for c in text:
        d.text((x, y), c, font=font, fill=fill, **kw)
        x += d.textlength(c, font=font) + track
    return x


def sparkle(d, cx, cy, r, fill, a=255):
    """Our fairy's four-point sparkle: the 'next' cursor of family A."""
    pts = []
    for i in range(8):
        ang = math.pi / 4 * i - math.pi / 2
        rr = r if i % 2 == 0 else r * .32
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    d.polygon(pts, fill=fill + (a,))


# ------------------------------------------------------------------ A: the game text box
def sq_box(w, h, r=14, glass=212, pad=8, rule=GOLD):
    """Ink glass, an outer gold rule and a thin inner one, a diamond on each corner, a faint sheen on top. pad = the
    transparent margin around it (its soft shadow); rule = the outer rule's colour (gold; a highlight may tint it).
    All in design px; the image is in output px (its margin is S(pad))."""
    g = _new(w + 2 * pad, h + 2 * pad); d = _D(g)
    sh = _new(w + 2 * pad, h + 2 * pad); _D(sh).rounded_rectangle((pad, pad + 4, pad + w, pad + h + 4), r, fill=(0, 0, 0, 110))
    g.alpha_composite(sh.filter(ImageFilter.GaussianBlur(_s(5))))
    d.rounded_rectangle((pad, pad, pad + w, pad + h), r, fill=INK + (glass,), outline=tuple(rule[:3]) + (255,), width=3)
    d.rounded_rectangle((pad + 6, pad + 6, pad + w - 6, pad + h - 6), max(2, r - 6), outline=GOLD_DIM + (170,), width=1)
    sheen = _new(w + 2 * pad, h + 2 * pad)
    _D(sheen).rounded_rectangle((pad + 3, pad + 3, pad + w - 3, pad + h * .45), r, fill=(255, 255, 255, 16))
    g.alpha_composite(sheen)
    for cx, cy in ((pad, pad), (pad + w, pad), (pad, pad + h), (pad + w, pad + h)):
        k = 6
        d.polygon([(cx, cy - k), (cx + k, cy), (cx, cy + k), (cx - k, cy)], fill=tuple(rule[:3]) + (255,), outline=INK + (255,))
    return g


def fade(im, k):
    """The same image, k times as opaque."""
    if k >= 1:
        return im
    im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * max(0, k)))); return im


def sq_tag(text, size=22, col=WHITE):
    """1-3 words: SAME ROAD, 7 YEARS, CHILD / ADULT."""
    f = inter(size); tr = size * .12
    tw = spaced_len(_measure(), text.upper(), f, tr)
    g = sq_box(tw + 2 * size, size * 2.0, r=int(size * .5))
    spaced(_D(g), (8 + size, 8 + size * .42), text.upper(), f, col + (255,), tr)
    return g


def sq_banner(kicker, title, n=None, done_blink=True, t=0.0, w=470):
    """A quest notice: a small scroll icon, the kicker in gold, the title typing out, a sparkle when it is done."""
    h = 108
    g = sq_box(w, h); d = _D(g)
    ox, oy = 8, 8
    sx, sy = ox + 26, oy + 30                                           # the scroll icon
    d.rounded_rectangle((sx, sy, sx + 34, sy + 46), 4, fill=PAPER + (255,), outline=INK + (255,), width=2)
    for yy in (sy, sy + 46):
        d.ellipse((sx - 5, yy - 6, sx + 39, yy + 6), fill=(232, 214, 176, 255), outline=INK + (255,), width=2)
    for i in range(3):
        d.line((sx + 7, sy + 14 + i * 9, sx + 27, sy + 14 + i * 9), fill=(150, 120, 80, 255), width=2)
    spaced(d, (ox + 82, oy + 16), kicker.upper(), inter(16), GOLD + (255,), 2.2)
    n = len(title) if n is None else n
    d.text((ox + 82, oy + 42), title[:n], font=inter(34), fill=WHITE + (255,))
    if n >= len(title) and done_blink and int(t * 3) % 2 == 0:
        sparkle(d, ox + w - 24, oy + h - 22, 10, (190, 235, 255))
    return g


def sq_panel(w, h):
    return sq_box(w, h)


# ------------------------------------------------------------------ B: in the world
def _grain(d, box, base, n=7, seed=3):
    x0, y0, x1, y1 = box
    import random
    rnd = random.Random(seed)
    for i in range(n):
        y = y0 + (y1 - y0) * (i + .5) / n + rnd.uniform(-2, 2)
        d.line((x0 + 6, y, x1 - 6, y + rnd.uniform(-3, 3)), fill=tuple(max(0, c - 22) for c in base) + (150,), width=2)


def _carve(d, xy, text, font, track=0):
    """Letters cut into wood: dark groove, a light lip below."""
    x, y = xy
    spaced(d, (x, y + 2), text, font, WOOD_L + (255,), track)
    spaced(d, (x, y), text, font, (46, 30, 18, 255), track)


def wood_sign(text, h_px=150):
    """A small plank on a post, the text carved: '1998', 'TODAY', '2026'. h_px = the whole sign's height (design px)."""
    s = h_px / 150
    f = anton(int(40 * s)); tw = _measure().textlength(text, font=f)
    pw, ph = int(tw + 40 * s), int(62 * s)
    W_, H_ = pw + 20, h_px + 10
    g = _new(W_, H_); d = _D(g)
    cx = W_ / 2
    d.rectangle((cx - 7 * s, ph * .6, cx + 7 * s, h_px), fill=WOOD_D + (255,), outline=(40, 26, 16, 255), width=2)   # the post
    d.rounded_rectangle((10, 6, 10 + pw, 6 + ph), int(6 * s), fill=WOOD + (255,), outline=(40, 26, 16, 255), width=3)
    _grain(d, (10, 6, 10 + pw, 6 + ph), WOOD, n=4)
    for nx in (20 * s, pw - 4 * s):                                     # two nails
        d.ellipse((nx - 3, 6 + ph / 2 - 3, nx + 3, 6 + ph / 2 + 3), fill=(70, 70, 76, 255))
    _carve(d, (10 + (pw - tw) / 2, 6 + ph * .08), text, f)
    return g


def signpost(text, h_px=200, right=True):
    """A signpost at the roadside, its plank an arrow pointing down the road: 'SAME ROAD'."""
    s = h_px / 200
    f = anton(int(30 * s)); tw = _measure().textlength(text, font=f)
    pw, ph = int(tw + 70 * s), int(50 * s)
    W_, H_ = pw + 30, h_px + 10
    g = _new(W_, H_); d = _D(g)
    px = W_ * (.3 if right else .7)
    d.rectangle((px - 8 * s, 10, px + 8 * s, h_px), fill=WOOD_D + (255,), outline=(40, 26, 16, 255), width=2)
    d.polygon([(px - 9 * s, 6), (px, 0), (px + 9 * s, 6)], fill=WOOD_D + (255,))
    x0, y0 = 10, int(26 * s)
    tip = int(26 * s)
    if right:
        poly = [(x0, y0), (x0 + pw - tip, y0), (x0 + pw, y0 + ph / 2), (x0 + pw - tip, y0 + ph), (x0, y0 + ph)]
        tx = x0 + 18 * s
    else:
        poly = [(x0 + tip, y0), (x0 + pw, y0), (x0 + pw, y0 + ph), (x0 + tip, y0 + ph), (x0, y0 + ph / 2)]
        tx = x0 + tip + 12 * s
    d.polygon(poly, fill=WOOD + (255,), outline=(40, 26, 16, 255))
    d.line(poly + [poly[0]], fill=(40, 26, 16, 255), width=3)
    _grain(d, (x0, y0, x0 + pw - tip, y0 + ph), WOOD, n=3, seed=7)
    _carve(d, (tx, y0 + ph * .1), text, f, track=1)
    for k in (.18, .55, .85):                                           # grass tufts at its foot
        bx = px + (k - .5) * 50 * s
        d.line((bx, h_px, bx - 6 * s, h_px - 16 * s), fill=(70, 120, 50, 255), width=3)
        d.line((bx, h_px, bx + 5 * s, h_px - 13 * s), fill=(90, 140, 60, 255), width=3)
    return g


def parchment_list(items, ticks, w=505, row=58):
    """A rolled parchment, items inked in, ticked off by pen: 'New visuals', 'Voiced cutscenes', ..."""
    h = row * len(items) + 44
    W_, H_ = w + 30, h + 40
    g = _new(W_, H_); d = _D(g)
    sh = _new(W_, H_); _D(sh).rectangle((18, 24, w + 18, h + 24), fill=(0, 0, 0, 90))
    g.alpha_composite(sh.filter(ImageFilter.GaussianBlur(_s(6))))
    d.rectangle((15, 18, w + 15, h + 18), fill=(244, 230, 200, 255))
    edge = _new(W_, H_)                                                 # aged edges
    _D(edge).rectangle((15, 18, w + 15, h + 18), outline=(196, 160, 110, 160), width=10)
    g.alpha_composite(edge.filter(ImageFilter.GaussianBlur(_s(5))))
    for yy in (14, h + 22):                                             # the two rolls
        d.rounded_rectangle((5, yy - 10, w + 25, yy + 10), 10, fill=(226, 204, 160, 255), outline=(120, 90, 54, 255), width=2)
        d.line((14, yy - 3, w + 16, yy - 3), fill=(250, 240, 214, 255), width=2)
    ink = (70, 44, 26)
    for i, (txt, k) in enumerate(zip(items, ticks)):
        y = 40 + i * row
        bx = 40
        d.rectangle((bx, y + 6, bx + 26, y + 32), outline=ink + (255,), width=3)
        if k > 0:                                                       # a pen tick, drawn in
            p0, p1, p2 = (bx + 4, y + 18), (bx + 12, y + 28), (bx + 34, y - 2)
            if k < .4:
                e = k / .4; d.line((p0, (p0[0] + (p1[0] - p0[0]) * e, p0[1] + (p1[1] - p0[1]) * e)), fill=(160, 40, 30, 255), width=5)
            else:
                e = min(1, (k - .4) / .6)
                d.line((p0, p1, (p1[0] + (p2[0] - p1[0]) * e, p1[1] + (p2[1] - p1[1]) * e)), fill=(160, 40, 30, 255), width=5, joint='curve')
        d.text((bx + 44, y + 4), txt, font=inter(25), fill=ink + (255 if k > 0 else 150,))
    return g


# ------------------------------------------------------------------ C: real life / commentary (EP001 marker)
def marker(text, size=18, paper=False):
    """EP001's marker: gold, an ink border, Inter 800 uppercase, letter-spaced. paper=True: the cream variant."""
    f = inter(size); tr = size * .1
    tw = spaced_len(_measure(), text.upper(), f, tr)
    pw, ph = tw + size * 1.4, size * 1.9
    g = _new(pw + 6, ph + 8); d = _D(g)
    d.rounded_rectangle((2, 5, pw + 2, ph + 5), size * .3, fill=INK + (255,))                    # ink drop, as EP001
    d.rounded_rectangle((2, 2, pw + 2, ph + 2), size * .3, fill=(PAPER if paper else GOLD) + (255,), outline=INK + (255,), width=max(2, size * .1))
    spaced(d, (2 + size * .7, 2 + size * .38), text.upper(), f, INK + (255,), tr)
    return g


# ------------------------------------------------------------------ the 1998 versions (R1, Producer 2026-10-06: the sharp
# wooden sign did not belong in the blocky 1998 half)
# our own 5x7 pixel font for the 1998 cards (square pixels, crisp at any size; no third-party font)
PIXEL_GLYPHS = {
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
    'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    'B': ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    'C': ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
    'D': ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    'F': ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    'G': ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
    'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    'I': ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
    'J': ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
    'K': ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    'L': ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    'M': ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    'N': ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    'P': ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    'Q': ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    'T': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    'U': ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    'V': ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    'W': ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    'X': ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    'Y': ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    'Z': ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
    ' ': ['00000'] * 7,
    '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
    '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
    '?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100'],
    '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
    '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
}


def pixel_text(text, px, fill, shadow=None):
    """Text in our 5x7 pixel font, each font pixel px design px square (whole output pixels, so it stays crisp); an
    optional hard drop shadow."""
    text = text.upper()
    q = max(1, int(round(px * U)))                                      # one font pixel, in output pixels
    cw = 6 * q
    g = Image.new('RGBA', (max(1, len(text) * cw), 8 * q))
    d = ImageDraw.Draw(g)
    for dx, col in (((q, shadow),) if shadow else ()) + ((0, fill),):
        for i, ch in enumerate(text):
            for ry, row in enumerate(PIXEL_GLYPHS.get(ch, PIXEL_GLYPHS['?'])):
                for rx, bit in enumerate(row):
                    if bit == '1':
                        x, y = i * cw + rx * q + dx, ry * q + dx
                        d.rectangle((x, y, x + q - 1, y + q - 1), fill=col + (255,))
    return g


def wood_sign_1998(text, h_px=150, fog=(205, 215, 225), fog_k=.14):
    """The same sign as a 1998 game would have modelled it (not used: the Producer chose the area cards)."""
    s = h_px / 150
    lab = pixel_text(text, max(2, int(5 * s)), (52, 34, 20))
    pw, ph = _dw(lab) + 28 * s, 64 * s
    g = _new(pw + 8, h_px + 8); d = _D(g)
    cx = (pw + 8) / 2
    d.rectangle((cx - 6, ph * .6, cx + 6, h_px), fill=(96, 66, 40, 255))
    d.rectangle((4, 4, 4 + pw, 4 + ph), fill=(132, 90, 52, 255))
    d.rectangle((4, 4 + ph - 6, 4 + pw, 4 + ph), fill=(98, 66, 38, 255))
    _paste(g, lab, 4 + (pw - _dw(lab)) / 2, 4 + (ph - _dh(lab)) / 2 + 4 * s)
    a = g.getchannel('A')
    fogged = Image.blend(g.convert('RGB'), Image.new('RGB', g.size, fog), fog_k)
    out = Image.blend(fogged, fogged.convert('L').convert('RGB'), .1)
    out.putalpha(a)
    return out


def area_title(text, retro=False, size=46, band=False, rules=True):
    """An area name card, as a game shows when you enter a place: the name between two thin rules.
    retro=True: 1998 square pixels; False: today's Anton with the channel's gold rule."""
    if retro:
        px = max(2, round(size / 7.5))
        lab = pixel_text(text, px, (255, 236, 190))
        sh = pixel_text(text, px, INK)
    else:
        f = anton(size)
        w = _measure().textlength(text, font=f) + 8
        lab = _new(w, size * 1.45); _D(lab).text((4, 0), text, font=f, fill=WHITE + (255,))
        sh = _new(w, size * 1.45); _D(sh).text((4, 0), text, font=f, fill=INK + (255,))
    lw, lh = _dw(lab), _dh(lab)
    rule = min(lw * .9, 110 + size) if rules else 0                     # short rules: the card must not cross the frame
    gw, gh = lw + 2 * rule + 40, lh + 12
    g = _new(gw, gh); d = _D(g)
    y = gh / 2
    for x0, x1 in (((0, rule), (gw - rule, gw)) if rules else ()):
        if retro:
            xx = x0
            while xx < x1:                                              # a dotted rule in square pixels
                d.rectangle((xx, y - 2, xx + 4, y + 2), fill=(255, 236, 190, 220))
                xx += 8
        else:
            d.line((x0, y + 2, x1, y + 2), fill=INK + (200,), width=4)
            d.line((x0, y, x1, y), fill=GOLD + (255,), width=3)
    if band:                                                            # a soft ink band behind it, for bright scenes
        bd = Image.new('RGBA', g.size); bdd = ImageDraw.Draw(bd)
        for x in range(g.width):
            e = min(1, x / (g.width * .25), (g.width - x) / (g.width * .25))
            bdd.line((x, 0, x, g.height), fill=INK + (int(170 * e),))
        bd.alpha_composite(g); g = bd
    _paste(g, sh, rule + 20 + 3, 6 + 4)
    _paste(g, lab, rule + 20, 6)
    return g


def era_tag(text, retro=False, size=26):
    """A small year / era chip in our game box: 1998 in our square pixels, today in Anton (the area cards, small)."""
    if retro:
        lab = pixel_text(text, max(2, round(size / 7.5)), (255, 236, 190), shadow=INK)
    else:
        f = anton(size)
        w = _measure().textlength(text, font=f) + 6
        lab = _new(w, size * 1.35); _D(lab).text((3, -size * .08), text, font=f, fill=WHITE + (255,))
    g = sq_box(_dw(lab) + size * 1.1, _dh(lab) + size * .6, r=int(size * .4))
    _paste(g, lab, 8 + size * .55, 8 + size * .3)
    return g


def signpost_compact(lines, h_px=160):
    """A short signpost with the words stacked on a small plank pointing ahead (up the road): 'SAME' / 'ROAD'. Narrow,
    so it stands on the verge without reaching the people on the road. h_px in design px."""
    s = h_px / 160
    f = anton(int(28 * s))
    tw = max(_measure().textlength(t, font=f) for t in lines)
    lh = 30 * s
    pw, ph = tw + 30 * s, lh * len(lines) + 14 * s
    tip = 18 * s
    W_, H_ = pw + 20, h_px + tip + 10
    g = _new(W_, H_); d = _D(g)
    cx = W_ / 2
    d.rectangle((cx - 6 * s, tip + ph * .5, cx + 6 * s, H_ - 2), fill=WOOD_D + (255,), outline=(40, 26, 16, 255), width=2)
    x0, y0 = (W_ - pw) / 2, tip + 2
    poly = [(x0, y0), (cx, y0 - tip), (x0 + pw, y0), (x0 + pw, y0 + ph), (x0, y0 + ph)]   # the plank, its point up the road
    d.polygon(poly, fill=WOOD + (255,))
    d.line(poly + [poly[0]], fill=(40, 26, 16, 255), width=3)
    _grain(d, (x0, y0, x0 + pw, y0 + ph), WOOD, n=3, seed=9)
    for i, t in enumerate(lines):
        _carve(d, (cx - d.textlength(t, font=f) / 2, y0 + 5 * s + i * lh), t, f)
    for k in (.3, .5, .7):                                              # grass tufts at its foot
        bx = cx + (k - .5) * 40 * s
        d.line((bx, H_ - 2, bx - 5 * s, H_ - 15 * s), fill=(70, 120, 50, 255), width=3)
        d.line((bx, H_ - 2, bx + 4 * s, H_ - 12 * s), fill=(90, 140, 60, 255), width=3)
    return g


_AREA_CACHE = {}


def area_enter(fr, t, t0, name, dur=2.4, y=.12):  # y: the card's top, as a fraction of the height
    """The first time we enter a place: its name card fades in under the HUD, holds, rises a touch and fades
    (Producer, 2026-10-06, video-game detail 1). Generic names only (no game's place names)."""
    u = t - t0
    if u < 0 or u > dur:
        return fr
    if name not in _AREA_CACHE:
        _AREA_CACHE[name] = area_title(name, size=40, band=True)
    g = _AREA_CACHE[name]
    k = min(1, u / .4) * min(1, (dur - u) / .5)
    W_, H_ = fr.size
    out = fr.convert('RGBA')
    out.alpha_composite(fade(g, k), (int(W_ / 2 - g.width / 2), int(H_ * y - _s(6) * max(0, u - (dur - .5)) / .5)))
    return out.convert('RGB')


def lockon(fr, cx, cy, w, h, k, t=0.0):
    """Our lock-on: four gold arrowheads close in on the corners of what Bram is talking about, then breathe
    (Producer, 2026-10-06, video-game detail 3). cx, cy, w, h in output px; k: 0 -> 1 as it locks."""
    if k <= 0:
        return fr
    e = 1 - (1 - min(1, k)) ** 3                                        # fast in, soft landing
    sc = 1.7 - .7 * e + (.03 * math.sin(t * 5) if k >= 1 else 0)
    a = int(255 * min(1, k * 2))
    out = fr.convert('RGBA'); lay = Image.new('RGBA', out.size); d = ImageDraw.Draw(lay)
    s = max(_s(18), min(w, h) * .09)
    o2, o3 = _s(2), _s(3)
    for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
        px, py = cx + sx * w / 2 * sc, cy + sy * h / 2 * sc
        tip = (px - sx * s * .2, py - sy * s * .2)                      # points in, towards the centre
        b1 = (px + sx * s * 1.1, py + sy * s * .25)
        b2 = (px + sx * s * .25, py + sy * s * 1.1)
        d.polygon([(tip[0] + o2, tip[1] + o3), (b1[0] + o2, b1[1] + o3), (b2[0] + o2, b2[1] + o3)], fill=INK + (int(a * .6),))
        d.polygon([tip, b1, b2], fill=GOLD + (a,), outline=INK + (a,))
    out.alpha_composite(lay)
    return out.convert('RGB')


def choice_box(question, options, cursor, chosen=None, t=0.0, w=430):
    """A game prompt with options and a cursor (Producer, 2026-10-06, video-game detail 4). cursor: the option index
    the cursor is on (a float slides it between two); chosen: the picked index (it flashes)."""
    h = 64 + 46 * len(options)
    g = sq_box(w, h); d = _D(g)
    d.text((8 + 28, 8 + 16), question, font=inter(24), fill=WHITE + (255,))
    for i, opt in enumerate(options):
        y = 8 + 60 + i * 44
        lit = chosen == i and int(t * 10) % 2 == 0
        col = GOLD if (chosen == i) else (225, 228, 240)
        if lit:
            d.rounded_rectangle((8 + 50, y - 4, 8 + w - 30, y + 34), 8, fill=GOLD + (60,))
        d.text((8 + 70, y), opt, font=inter(26), fill=col + (255,))
    cy = 8 + 60 + cursor * 44 + 15
    cx = 8 + 44 + 3 * math.sin(t * 8)                                   # the cursor: a gold triangle that bobs
    d.polygon([(cx, cy - 10), (cx + 14, cy), (cx, cy + 10)], fill=GOLD + (255,), outline=INK + (255,))
    return g
