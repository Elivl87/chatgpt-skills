"""Shared planning overlays for character stand-ins.

Producer rule (2026-10-04): adult Quest always carries the shield and the sword on his back (not while he is still
pulling the sword out). Used by blocks I and N until the real back-view art (MISSING #4) exists.
"""
import math
from PIL import ImageDraw
from lib import lin


def adult_back(q):
    """Producer rule (2026-10-04): adult Quest always carries the shield and the sword on his back. Planning overlay on
    the stand-in (sheathed sword across the back, hilt over the right shoulder; a kite shield over the backpack)."""
    q = q.copy(); w, h = q.size; d = ImageDraw.Draw(q)
    lw = max(4, int(w * .012)); ink = (20, 14, 18, 255)
    hx, hy, tx, ty = w * .76, h * .245, w * .26, h * .66                     # hilt end -> scabbard tip
    ang = math.atan2(ty - hy, tx - hx); nx, ny = -math.sin(ang), math.cos(ang)
    def band(t0, t1, half, col):
        x0, y0 = lin(hx, tx, t0), lin(hy, ty, t0); x1, y1 = lin(hx, tx, t1), lin(hy, ty, t1)
        d.polygon(((x0 + nx * half, y0 + ny * half), (x1 + nx * half, y1 + ny * half), (x1 - nx * half, y1 - ny * half), (x0 - nx * half, y0 - ny * half)), fill=col, outline=ink, width=lw)
    band(.17, 1.0, w * .035, (90, 60, 120, 255))                             # scabbard
    band(0, .14, w * .018, (110, 70, 150, 255))                               # grip
    cx, cy = lin(hx, tx, .15), lin(hy, ty, .15)                               # crossguard
    d.polygon(((cx + nx * w * .085, cy + ny * w * .085), (cx + nx * w * .085 + math.cos(ang) * 14, cy + ny * w * .085 + math.sin(ang) * 14),
               (cx - nx * w * .085 + math.cos(ang) * 14, cy - ny * w * .085 + math.sin(ang) * 14), (cx - nx * w * .085, cy - ny * w * .085)), fill=(120, 80, 170, 255), outline=ink, width=lw)
    d.ellipse((hx - w * .025, hy - w * .025, hx + w * .025, hy + w * .025), fill=(230, 200, 90, 255), outline=ink, width=lw)   # pommel
    sx0, sx1, sy0, sy1 = w * .30, w * .70, h * .315, h * .64                  # kite shield over the backpack
    pts = ((sx0, sy0 + h * .02), (w * .5, sy0 - h * .012), (sx1, sy0 + h * .02), (sx1 - w * .02, sy0 + (sy1 - sy0) * .55), (w * .5, sy1), (sx0 + w * .02, sy0 + (sy1 - sy0) * .55))
    d.polygon(pts, fill=(190, 196, 212, 255), outline=ink, width=lw)
    inner = [(w * .5 + (x - w * .5) * .86, sy0 + (y - sy0) * .9 + h * .012) for x, y in pts]
    d.polygon(inner, fill=(44, 84, 170, 255), outline=ink, width=max(2, lw // 2))
    d.ellipse((w * .5 - w * .045, h * .43 - w * .045, w * .5 + w * .045, h * .43 + w * .045), fill=(200, 205, 220, 255), outline=ink, width=lw)   # boss
    return q
