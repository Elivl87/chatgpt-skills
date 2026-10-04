"""In-game HUD for every Hyrule shot (Producer idea, 2026-10-04): hearts + green magic bar top-left, rupee counter
bottom-left. Own drawing in the spirit of the classic HUD (no game sprites). Planning-only layer for the animatic.

  draw(frame, hearts=5.0, max_hearts=5, magic=1.0, rupees=23, alpha=1.0)
hearts counts in halves (4.5 = four and a half). Everything sits inside title-safe and above the subtitle zone.
"""
import math
from PIL import Image, ImageDraw, ImageFont

FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
INK = (20, 14, 18, 255)


def _heart(d, cx, cy, s, fill, outline=INK, highlight=True):
    pts = []
    for i in range(48):
        a = 2 * math.pi * i / 48
        x = 16 * math.sin(a) ** 3
        y = -(13 * math.cos(a) - 5 * math.cos(2 * a) - 2 * math.cos(3 * a) - math.cos(4 * a))
        pts.append((cx + x * s / 17, cy + y * s / 17))
    d.polygon(pts, fill=fill, outline=outline, width=max(2, int(s / 7)))
    if highlight and fill[3] > 200:
        d.ellipse((cx - s * .55, cy - s * .55, cx - s * .25, cy - s * .25), fill=(255, 220, 220, 200))


def _rupee(d, cx, cy, s):
    w, h = s * .55, s
    outer = [(cx, cy - h), (cx + w, cy - h * .45), (cx + w, cy + h * .45), (cx, cy + h), (cx - w, cy + h * .45), (cx - w, cy - h * .45)]
    d.polygon(outer, fill=(40, 190, 90, 255), outline=INK, width=3)
    d.polygon([(cx, cy - h * .55), (cx + w * .45, cy - h * .2), (cx + w * .45, cy + h * .2), (cx, cy + h * .55),
               (cx - w * .45, cy + h * .2), (cx - w * .45, cy - h * .2)], fill=(120, 240, 150, 255))


_OCA = None


_ICONS = {}


def _icon(name, size, rot=0):
    """Our own 3D props as HUD icons: ocarina, master sword, bomb, boomerang."""
    if name not in _ICONS:
        from pathlib import Path
        props = Path(__file__).resolve().parents[2] / 'public/art/ep002/props3d'
        path = {'ocarina': props / 'ocarina_spin/f012.png', 'sword': props / 'sword_spin/f012.png',
                'bomb': props / 'icon_bomb.png', 'boomerang': props / 'icon_boomerang.png'}[name]
        im = Image.open(path).convert('RGBA'); _ICONS[name] = im.crop(im.getchannel('A').getbbox())
    o = _ICONS[name]
    if rot:
        o = o.rotate(rot, expand=True, resample=Image.BICUBIC); o = o.crop(o.getchannel('A').getbbox())
    o = o.copy(); o.thumbnail((size, size), Image.LANCZOS); return o


def _ocarina_icon(size):
    return _icon('ocarina', size)


def _buttons(lay, d, W, a_text='Attack'):
    """Top-right action buttons: B (green, sword), A (blue, label), three yellow C buttons with items."""
    ox = W - 1280                                                       # layout drawn for 1280 wide
    B, A_, CL, CD, CR = (ox + 905, 70, 32), (ox + 978, 84, 32), (ox + 1062, 60, 27), (ox + 1116, 104, 27), (ox + 1170, 60, 27)
    def btn(c, fill):
        x, y, r = c; d.ellipse((x - r, y - r, x + r, y + r), fill=fill, outline=INK, width=3)
        d.ellipse((x - r * .7, y - r * .8, x + r * .2, y - r * .3), fill=(255, 255, 255, 70))
    btn(B, (40, 150, 70, 235)); btn(A_, (50, 90, 200, 235))
    for c in (CL, CD, CR):
        btn(c, (230, 175, 40, 235))
    x, y, r = B                                                         # our 3D master sword, diagonal like the classic B icon
    o = _icon('sword', 54, rot=-45); lay.alpha_composite(o, (int(x - o.width / 2), int(y - o.height / 2)))
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
    x, y, r = A_; tw = d.textlength(a_text, font=f)
    d.text((x - tw / 2, y - 9), a_text, font=f, fill=(255, 255, 255, 255), stroke_width=2, stroke_fill=INK)
    x, y, r = CL                                                        # our 3D bomb
    o = _icon('bomb', 36); lay.alpha_composite(o, (int(x - o.width / 2), int(y - o.height / 2)))
    x, y, r = CD                                                        # our 3D boomerang
    o = _icon('boomerang', 40); lay.alpha_composite(o, (int(x - o.width / 2), int(y - o.height / 2)))
    x, y, r = CR                                                        # our ocarina
    o = _ocarina_icon(40); lay.alpha_composite(o, (int(x - o.width / 2), int(y - o.height / 2)))


# Rupees picked up along the episode (narration seconds): the counter ticks up while Quest walks (Producer).
RUPEE_EVENTS = [22.6, 24.2, 55.6, 58.1, 61.0, 63.4, 72.4, 77.6, 79.1, 80.6, 96.6, 99.4, 101.6, 117.6, 119.4, 142.6, 143.8, 147.6, 150.4, 153.0]
# The A button reads like the game: what you could do in that moment (Producer).
A_LABELS = [(0, 49.0, 'Navi'), (49.0, 54.0, 'Check'), (54.0, 71.6, 'Navi'), (71.6, 74.2, 'Navi'), (74.2, 76.1, 'Check'),
            (76.1, 81.5, 'Attack'), (81.5, 109.0, 'Check'), (109.0, 112.4, 'Navi'), (112.4, 129.2, 'Check'),
            (129.2, 137.9, 'Speak'), (137.9, 144.3, 'Check'), (144.3, 999, 'Navi')]   # block G: the silent hero speaks


def rupees_at(t, base=23):
    return base + sum(1 for e in RUPEE_EVENTS if e <= t)


def a_label(t):
    return next((lab for a, b, lab in A_LABELS if a <= t < b), 'Attack')


def draw(frame, hearts=5.0, max_hearts=5, magic=1.0, rupees=None, alpha=1.0, W=None, H=None, buttons=True, t=None):
    if alpha <= 0:
        return frame
    W, H = frame.size
    lay = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(lay)
    s, x0, y0 = 15, 40, 58                                              # below the planning tag line
    for i in range(max_hearts):
        cx = x0 + i * 2.35 * s
        _heart(d, cx, y0, s, (40, 20, 24, 150), highlight=False)                         # empty container
        v = max(0, min(1, hearts - i))
        if v >= 1:
            _heart(d, cx, y0, s, (232, 44, 52, 255))
        elif v >= .5:                                                   # half heart: left half filled
            half = Image.new('RGBA', (W, H)); hd = ImageDraw.Draw(half)
            _heart(hd, cx, y0, s, (232, 44, 52, 255), highlight=False)
            m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle((0, 0, int(cx), H), fill=255)
            lay.paste(half, (0, 0), Image.composite(half.getchannel('A'), m, m).point(lambda v_: v_))
    by = y0 + s + 14
    bw = 170
    d.rounded_rectangle((x0 - s, by, x0 - s + bw, by + 13), 6, fill=(20, 20, 30, 190), outline=INK, width=3)
    if magic > 0:
        d.rounded_rectangle((x0 - s + 3, by + 3, x0 - s + 3 + (bw - 6) * magic, by + 10), 4, fill=(60, 205, 80, 255))
    if buttons:
        _buttons(lay, d, W, a_label(t) if t is not None else 'Attack')
    rx, ry = 52, H - 132                                                # rupees: bottom-left, above the subtitle zone and the plate label
    if rupees is None:
        rupees = rupees_at(t) if t is not None else 23
    pop = 0.0
    if t is not None:                                                   # a little pop + glint when one is picked up
        last = max([e for e in RUPEE_EVENTS if e <= t] or [-9])
        pop = max(0.0, 1 - (t - last) / .35)
    _rupee(d, rx, ry - 6 * pop, 18 * (1 + .3 * pop))
    txt = f'{rupees:03d}'
    d.text((rx + 22, ry - 15), txt, font=FONT, fill=(255, 255, 255, 255) if pop <= 0 else (180, 255, 190, 255), stroke_width=3, stroke_fill=INK)
    if alpha < 1:
        lay.putalpha(lay.getchannel('A').point(lambda v_: int(v_ * alpha)))
    out = frame.convert('RGBA'); out.alpha_composite(lay)
    return out.convert('RGB')
