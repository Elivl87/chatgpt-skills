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


def _ocarina_icon(size):
    global _OCA
    if _OCA is None:
        from pathlib import Path
        im = Image.open(Path(__file__).resolve().parents[2] / 'public/art/ep002/props3d/ocarina_spin/f012.png').convert('RGBA')
        _OCA = im.crop(im.getchannel('A').getbbox())
    o = _OCA.copy(); o.thumbnail((size, size)); return o


def _buttons(lay, d, W):
    """Top-right action buttons: B (green, sword), A (blue, label), three yellow C buttons with items."""
    ox = W - 1280                                                       # layout drawn for 1280 wide
    B, A_, CL, CD, CR = (ox + 905, 70, 32), (ox + 978, 84, 32), (ox + 1062, 60, 27), (ox + 1116, 104, 27), (ox + 1170, 60, 27)
    def btn(c, fill):
        x, y, r = c; d.ellipse((x - r, y - r, x + r, y + r), fill=fill, outline=INK, width=3)
        d.ellipse((x - r * .7, y - r * .8, x + r * .2, y - r * .3), fill=(255, 255, 255, 70))
    btn(B, (40, 150, 70, 235)); btn(A_, (50, 90, 200, 235))
    for c in (CL, CD, CR):
        btn(c, (230, 175, 40, 235))
    x, y, r = B                                                         # sword
    d.line((x - 14, y + 14, x + 12, y - 12), fill=(225, 230, 240, 255), width=6); d.line((x - 14, y + 14, x + 12, y - 12), fill=INK, width=1)
    d.line((x - 16, y + 6, x - 6, y + 16), fill=(120, 80, 160, 255), width=5)
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
    x, y, r = A_; t = 'Attack'; tw = d.textlength(t, font=f)
    d.text((x - tw / 2, y - 9), t, font=f, fill=(255, 255, 255, 255), stroke_width=2, stroke_fill=INK)
    x, y, r = CL                                                        # bomb
    d.ellipse((x - 12, y - 8, x + 12, y + 16), fill=(40, 50, 120, 255), outline=INK, width=2); d.line((x, y - 8, x + 6, y - 16), fill=(240, 200, 80, 255), width=3)
    x, y, r = CD                                                        # boomerang
    d.line((x - 14, y + 8, x, y - 10, x + 14, y + 8), fill=(200, 60, 60, 255), width=7, joint='curve')
    x, y, r = CR                                                        # our ocarina
    o = _ocarina_icon(40); lay.alpha_composite(o, (int(x - o.width / 2), int(y - o.height / 2)))


def draw(frame, hearts=5.0, max_hearts=5, magic=1.0, rupees=23, alpha=1.0, W=None, H=None, buttons=True):
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
        _buttons(lay, d, W)
    rx, ry = 52, H - 132                                                # rupees: bottom-left, above the subtitle zone and the plate label
    _rupee(d, rx, ry, 18)
    txt = f'{rupees:03d}'
    d.text((rx + 22, ry - 15), txt, font=FONT, fill=(255, 255, 255, 255), stroke_width=3, stroke_fill=INK)
    if alpha < 1:
        lay.putalpha(lay.getchannel('A').point(lambda v_: int(v_ * alpha)))
    out = frame.convert('RGBA'); out.alpha_composite(lay)
    return out.convert('RGB')
