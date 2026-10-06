"""SecondQuest on-screen text kit for the animatic (proposal, 2026-10-06; not applied to any block until approved).

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

ROOT = Path(__file__).resolve().parents[2]
INK = (22, 22, 31)
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
    return ImageFont.truetype(str(ROOT / f'public/shared/fonts/Inter-{weight}.woff2'), size)


@lru_cache(maxsize=None)
def anton(size):
    return ImageFont.truetype(str(ROOT / 'public/shared/fonts/Anton-Regular.woff2'), size)


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
def sq_box(w, h, r=14, glass=212):
    """Ink glass, an outer gold rule and a thin inner one, a diamond on each corner, a faint sheen on top."""
    pad = 8
    g = Image.new('RGBA', (w + 2 * pad, h + 2 * pad)); d = ImageDraw.Draw(g)
    sh = Image.new('RGBA', g.size); ImageDraw.Draw(sh).rounded_rectangle((pad, pad + 4, pad + w, pad + h + 4), r, fill=(0, 0, 0, 110))
    g.alpha_composite(sh.filter(ImageFilter.GaussianBlur(5)))
    d.rounded_rectangle((pad, pad, pad + w, pad + h), r, fill=INK + (glass,), outline=GOLD + (255,), width=3)
    d.rounded_rectangle((pad + 6, pad + 6, pad + w - 6, pad + h - 6), max(2, r - 6), outline=GOLD_DIM + (170,), width=1)
    sheen = Image.new('RGBA', g.size); sd = ImageDraw.Draw(sheen)
    sd.rounded_rectangle((pad + 3, pad + 3, pad + w - 3, pad + h * .45), r, fill=(255, 255, 255, 16))
    g.alpha_composite(sheen)
    for cx, cy in ((pad, pad), (pad + w, pad), (pad, pad + h), (pad + w, pad + h)):
        s = 6
        d.polygon([(cx, cy - s), (cx + s, cy), (cx, cy + s), (cx - s, cy)], fill=GOLD + (255,), outline=INK + (255,))
    return g


def sq_tag(text, size=22, col=WHITE):
    """1-3 words: SAME ROAD, 7 YEARS, CHILD / ADULT."""
    f = inter(size); tr = size * .12
    tw = int(spaced_len(ImageDraw.Draw(Image.new('RGB', (1, 1))), text.upper(), f, tr))
    g = sq_box(tw + 2 * int(size * 1.0), int(size * 2.0), r=int(size * .5))
    spaced(ImageDraw.Draw(g), (8 + size, 8 + size * .42), text.upper(), f, col + (255,), tr)
    return g


def sq_banner(kicker, title, n=None, done_blink=True, t=0.0, w=470):
    """A quest notice: a small scroll icon, the kicker in gold, the title typing out, a sparkle when it is done."""
    h = 108
    g = sq_box(w, h); d = ImageDraw.Draw(g)
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
    """A small plank on a post, the text carved: '1998', 'TODAY', '2026'. h_px = the whole sign's height."""
    s = h_px / 150
    f = anton(int(40 * s)); tw = ImageDraw.Draw(Image.new('RGB', (1, 1))).textlength(text, font=f)
    pw, ph = int(tw + 40 * s), int(62 * s)
    W_, H_ = pw + 20, h_px + 10
    g = Image.new('RGBA', (W_, H_)); d = ImageDraw.Draw(g)
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
    f = anton(int(30 * s)); tw = ImageDraw.Draw(Image.new('RGB', (1, 1))).textlength(text, font=f)
    pw, ph = int(tw + 70 * s), int(50 * s)
    W_, H_ = pw + 30, h_px + 10
    g = Image.new('RGBA', (W_, H_)); d = ImageDraw.Draw(g)
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
    g = Image.new('RGBA', (W_, H_)); d = ImageDraw.Draw(g)
    sh = Image.new('RGBA', g.size); ImageDraw.Draw(sh).rectangle((18, 24, w + 18, h + 24), fill=(0, 0, 0, 90))
    g.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
    d.rectangle((15, 18, w + 15, h + 18), fill=(244, 230, 200, 255))
    edge = Image.new('RGBA', g.size); ed = ImageDraw.Draw(edge)                # aged edges
    ed.rectangle((15, 18, w + 15, h + 18), outline=(196, 160, 110, 160), width=10)
    g.alpha_composite(edge.filter(ImageFilter.GaussianBlur(5)))
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
    d0 = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    tw = int(spaced_len(d0, text.upper(), f, tr))
    pw, ph = tw + int(size * 1.4), int(size * 1.9)
    g = Image.new('RGBA', (pw + 6, ph + 8)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((2, 5, pw + 2, ph + 5), int(size * .3), fill=INK + (255,))                 # ink drop, as EP001
    d.rounded_rectangle((2, 2, pw + 2, ph + 2), int(size * .3), fill=(PAPER if paper else GOLD) + (255,), outline=INK + (255,), width=max(2, int(size * .1)))
    spaced(d, (2 + size * .7, 2 + size * .38), text.upper(), f, INK + (255,), tr)
    return g


# ------------------------------------------------------------------ the 1998 versions (R1, Producer 2026-10-06: the sharp
# wooden sign did not belong in the blocky 1998 half)
def _retro_text(text, px_h, fill, scale=4):
    """Text as a 1998 game drew it: rasterised small without anti-aliasing, then blown up in square pixels."""
    f = anton(max(6, px_h // scale))
    d0 = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    w = int(d0.textlength(text, font=f)) + 4
    small = Image.new('RGBA', (w, f.size + 6)); d = ImageDraw.Draw(small)
    d.fontmode = '1'
    d.text((2, 0), text, font=f, fill=fill + (255,))
    return small.resize((small.width * scale, small.height * scale), Image.NEAREST)


def wood_sign_1998(text, h_px=150, fog=(205, 215, 225), fog_k=.14):
    """The same sign as a 1998 game would have modelled it: two flat-shaded boxes (no grain, no nails), a coarse texture,
    blocky digits, washed out by the distance fog of the 1998 look."""
    q = 3                                                               # one texel = 3 screen pixels
    s = h_px / 150
    lab = _retro_text(text, int(48 * s), (52, 34, 20), scale=q)
    pw, ph = lab.width + int(28 * s), int(64 * s)
    W_, H_ = pw + 8, h_px + 8
    g = Image.new('RGBA', (W_ // q + 1, H_ // q + 1)); d = ImageDraw.Draw(g)
    cx = W_ / 2 / q
    d.rectangle((cx - 2, ph / q * .6, cx + 2, h_px / q), fill=(96, 66, 40, 255))           # the post: one flat colour
    d.rectangle((4 / q, 4 / q, (4 + pw) / q, (4 + ph) / q), fill=(132, 90, 52, 255))         # the plank, lit face
    d.rectangle((4 / q, (4 + ph) / q - 2, (4 + pw) / q, (4 + ph) / q), fill=(98, 66, 38, 255))   # its underside
    g = g.resize((g.width * q, g.height * q), Image.NEAREST)
    g.alpha_composite(lab, (int(4 + (pw - lab.width) / 2), int(4 + (ph - lab.height) / 2 + 4 * s)))
    a = g.getchannel('A')
    fogged = Image.blend(g.convert('RGB'), Image.new('RGB', g.size, fog), fog_k)
    grey = fogged.convert('L').convert('RGB')
    out = Image.blend(fogged, grey, .1)                                 # the 1998 look's flatter colour
    out.putalpha(a)
    return out


def area_title(text, retro=False, size=46):
    """An area name card, as a game shows when you enter a place: the name between two thin rules.
    retro=True: 1998 square pixels; False: today's Anton with the channel's gold rule."""
    if retro:
        lab = _retro_text(text, size, (255, 236, 190), scale=3)
        sh = _retro_text(text, size, INK, scale=3)
    else:
        f = anton(size)
        w = int(ImageDraw.Draw(Image.new('RGB', (1, 1))).textlength(text, font=f)) + 8
        lab = Image.new('RGBA', (w, int(size * 1.45))); ImageDraw.Draw(lab).text((4, 0), text, font=f, fill=WHITE + (255,))
        sh = Image.new('RGBA', lab.size); ImageDraw.Draw(sh).text((4, 0), text, font=f, fill=INK + (255,))
    rule = int(lab.width * .9)
    g = Image.new('RGBA', (lab.width + 2 * rule + 40, lab.height + 12)); d = ImageDraw.Draw(g)
    y = g.height / 2
    for x0, x1 in ((0, rule), (g.width - rule, g.width)):
        if retro:
            for xx in range(int(x0), int(x1), 8):                       # a dotted rule in square pixels
                d.rectangle((xx, y - 2, xx + 4, y + 2), fill=(255, 236, 190, 220))
        else:
            d.line((x0, y + 2, x1, y + 2), fill=INK + (200,), width=4)
            d.line((x0, y, x1, y), fill=GOLD + (255,), width=3)
    g.alpha_composite(sh, (rule + 20 + 3, 6 + 4))
    g.alpha_composite(lab, (rule + 20, 6))
    return g
