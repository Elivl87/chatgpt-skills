#!/usr/bin/env python3
"""EP001 thumbnails v2 · "phantom traffic jams" · 3 concepts x EN / ES-419 + preview sheet.

Three compositions that share nothing but the inks:
  A  "WHO DID THIS?"  paper sky + halftone road, HUGE squashed face, queue of dots to a vanishing point
  B  "BE THIS DOT."   full-bleed ink, a cream ring arc with a jam, the vermilion companion alone in its gap
  C  "BACKWARDS?!"    the ring track from above filling the frame, teal arrow running backwards, words inside

Deterministic (fixed seeds), numpy + Pillow only. Imports the brand kit (newchannel/brand/src/brandkit)
for paper, grain, ink texture, halftone and the companion SDF.

    python3 thumbs.py              # 6 thumbnails + preview_sheet.png
    python3 thumbs.py --only B     # one concept (both languages), no sheet
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
OUT = HERE.parent
BRAND = HERE.parents[3] / "brand"
sys.path.insert(0, str(BRAND / "src"))

from brandkit import mascot as M    # noqa: E402
from brandkit import printfx as P   # noqa: E402

PAL = {k: v for k, v in json.loads((BRAND / "palette.json").read_text()).items()
       if isinstance(v, str) and v.startswith("#")}
MONO = BRAND / "fonts/MartianMono/MartianMono[wdth,wght].ttf"
GROT = BRAND / "fonts/SpaceGrotesk/SpaceGrotesk[wght].ttf"
W, H = 1280, 720
SEED = 20261013

COPY = {
    "A": {"en": ["WHO DID", "THIS?"], "es": ["¿QUIÉN", "FUE?"]},
    "B": {"en": ["BE", "THIS", "DOT."], "es": ["SÉ", "ESTE", "PUNTO."]},
    "C": {"en": ["BACK", "WARDS?!"], "es": ["¡AL", "REVÉS!"]},
}

# --------------------------------------------------------------------------- one extra face
# "annoyed" (concept A) is not among the 12 brand expressions. It is built from the same primitives and
# proportions (lidded half-disc eyes, brows angled down to the middle, a frown) and registered on top of
# brandkit.mascot.expression so M.render() draws it through the normal SDF pipeline.
_brand_expression = M.expression


def _expression(name):
    if name == "annoyed":
        face = [("halfdisc", -M.EX, M.EY - 0.03, 0.15), ("halfdisc", M.EX, M.EY - 0.03, 0.15),
                ("line", [(-0.54, -0.44), (-0.15, -0.27)], 0.062),
                ("line", [(0.15, -0.27), (0.54, -0.44)], 0.062),
                ("line", M.arc_pts(0, M.MY + 0.20, 0.19, 222, 318, 14), M.LW)]
        return face, []
    if name == "calm":   # closed, content eyes + small smile (confident, not smug)
        face = [("line", M.arc_pts(-M.EX, M.EY + 0.04, 0.12, 200, 340, 12), M.LW),
                ("line", M.arc_pts(M.EX, M.EY + 0.04, 0.12, 200, 340, 12), M.LW),
                ("line", M.arc_pts(0, M.MY - 0.12, 0.17, 35, 145, 14), M.LW)]
        return face, []
    return _brand_expression(name)


M.expression = _expression

# --------------------------------------------------------------------------- geometry
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32) + 0.5


def cov(d, aa=1.0):
    return np.clip(0.5 - d / aa, 0, 1).astype(np.float32)


def sd_circle(cx, cy, r):
    return np.hypot(XX - cx, YY - cy) - r


def sd_capsule(cx, cy, L, wd, ang):
    """Capsule (stadium) of length L, width wd, axis at `ang` degrees."""
    a = math.radians(ang)
    hx, hy = math.cos(a) * (L - wd) / 2, math.sin(a) * (L - wd) / 2
    return M._seg(XX, YY, cx - hx, cy - hy, cx + hx, cy + hy) - wd / 2


def sd_poly(pts):
    """Signed distance to a convex/concave polygon (negative inside)."""
    d = np.full((H, W), 1e9, np.float32)
    inside = np.zeros((H, W), bool)
    n = len(pts)
    for i in range(n):
        (ax, ay), (bx, by) = pts[i], pts[(i + 1) % n]
        d = np.minimum(d, M._seg(XX, YY, ax, ay, bx, by))
        cond = ((ay > YY) != (by > YY)) & (XX < (bx - ax) * (YY - ay) / (by - ay + 1e-9) + ax)
        inside ^= cond
    return np.where(inside, -d, d)


def polyline_mask(pts, w):
    d = np.full((H, W), 1e9, np.float32)
    for (ax, ay), (bx, by) in zip(pts[:-1], pts[1:]):
        d = np.minimum(d, M._seg(XX, YY, ax, ay, bx, by))
    return cov(d - w / 2)


def dilate(mask, px):
    if px <= 0:
        return mask
    img = Image.fromarray((np.clip(mask, 0, 1) * 255).astype(np.uint8), "L").filter(
        ImageFilter.MaxFilter(int(px) * 2 + 1))
    return np.asarray(img, np.float32) / 255.0


def font(path, size, axes):
    f = ImageFont.truetype(str(path), int(size))
    f.set_variation_by_axes(axes)
    return f


# --------------------------------------------------------------------------- painter + print model
class Scene:
    """Painter's model on grained stock. Each `paint` is one ink pass: 'over' covers what is below
    (opaque screen ink, needed for cream and vermilion on the dark ground), 'mul' overprints (multiply,
    the brand's riso model). Every pass carries the brand ink texture."""

    def __init__(self, ground, seed, grain=1.0):
        self.seed = seed
        self.rgb = P.paper(W, H, ground, seed, grain)
        self.n = 0

    def paint(self, mask, color, mode="over", off=(0, 0), texture=0.07):
        if mask is None or not mask.any():
            return
        a = P.shift(np.clip(mask, 0, 1), *off)
        if texture:
            a = a * P.ink_texture(H, W, self.seed + 31 * self.n, texture)
        self.n += 1
        c = P.hex2rgb(color)
        if mode == "mul":
            self.rgb *= 1.0 - a[..., None] * (1.0 - c)
        else:
            self.rgb = self.rgb * (1.0 - a[..., None]) + c * a[..., None]

    def mascot(self, cx, cy, d, expr, sx=1.0, sy=1.0, look=(0.0, 0.0), extras=True, extra_ink=None,
               misreg=(2, 1)):
        r = M.render(d, expr, cx=cx, cy=cy, shape=(H, W), look=look, extras=extras, sx=sx, sy=sy)
        self.paint(r["body"], PAL["accent"], "over", texture=0.05)
        self.paint(r["face"], PAL["ink"], "mul", off=misreg)
        if r["ink"].any():
            self.paint(r["ink"], extra_ink or PAL["ink"], "over")
        if r["second"].any():
            self.paint(r["second"], PAL["second"], "over")
        return r["body"]

    def image(self):
        return P.to_image(self.rgb)


# --------------------------------------------------------------------------- type
WORD_SPACE = 0.55   # brand: word spaces tightened to 0.55 of a monospace cell


def _period_box(f):
    img = Image.new("L", (f.size * 2, f.size * 2), 0)
    ImageDraw.Draw(img).text((f.size // 2, f.size * 3 // 2), ".", font=f, fill=255, anchor="ls")
    x0, y0, x1, y1 = img.getbbox()
    return (x0 - f.size // 2, y0 - f.size * 3 // 2, x1 - f.size // 2, y1 - f.size * 3 // 2)


def text_mask(lines, x, y, size, align="left", box_w=None, lead=1.28, true_dots=True):
    """Martian Mono ExtraBold (wght 800, wdth 100). Lines stacked by cap height. Full stops are swapped
    for true discs (brand rule). `y` is the cap top of the first line. Returns (mask, bbox, dots)."""
    f = font(MONO, size, [800, 100])
    img = Image.new("L", (W, H), 0)
    dr = ImageDraw.Draw(img)
    cap = f.getbbox("H")[3] - f.getbbox("H")[1]
    step = cap * lead
    pb = _period_box(f)
    dots = []
    widths = [f.getlength(s) for s in lines]
    for i, s in enumerate(lines):
        lw = widths[i]
        xx = x if align == "left" else (x + (box_w - lw) / 2 if align == "center" else x + box_w - lw)
        base = y + i * step + cap
        for ch in s:
            if ch == "." and true_dots:
                cxp, cyp = xx + (pb[0] + pb[2]) / 2, base + (pb[1] + pb[3]) / 2
                r = max(pb[2] - pb[0], pb[3] - pb[1]) * 0.60
                dots.append((cxp, cyp - r * 0.12, r))
            elif ch != " ":
                dr.text((xx, base), ch, font=f, fill=255, anchor="ls")
            xx += f.getlength(ch) * (WORD_SPACE if ch == " " else 1.0)
    m = np.asarray(img, np.float32) / 255.0
    for cxp, cyp, r in dots:
        m = np.maximum(m, cov(sd_circle(cxp, cyp, r)))
    return m, (x, y, x + max(widths), y + (len(lines) - 1) * step + cap), dots


def fit_size(lines, box_w, box_h, lead=1.28, smax=300):
    for s in range(smax, 30, -2):
        f = font(MONO, s, [800, 100])
        cap = f.getbbox("H")[3] - f.getbbox("H")[1]
        if max(f.getlength(t) for t in lines) <= box_w and cap + (len(lines) - 1) * cap * lead <= box_h:
            return s
    return 30


def tone_halftone(tone, cell, angle):
    return P.halftone(np.clip(tone, 0, 1).astype(np.float32), cell, angle)


# =========================================================================== A · WHO DID THIS?
def concept_A(lang):
    S = Scene(PAL["paper"], SEED + 1)
    hy = 296.0                 # horizon
    vx = 1118.0                # vanishing point x
    # sky: a light ink halftone that thickens toward the top edge (frames the top on a white feed)
    sky = np.clip((hy - YY) / hy, 0, 1) ** 1.6 * 0.20
    S.paint(tone_halftone(sky * (YY < hy), 9, 15), PAL["ink"], "mul")
    # ground: everything below the horizon is mid halftone; the road wedge is darker; dashed centre line
    ground = (YY >= hy).astype(np.float32)
    road = cov(sd_poly([(vx - 6, hy), (vx + 6, hy), (1720, H + 40), (-760, H + 40)]))
    depth = np.clip((YY - hy) / (H - hy), 0, 1)
    tone = ground * (0.20 + 0.10 * depth) + road * (0.30 + 0.12 * depth)
    # the queue: upright ink discs receding to the vanishing point (each with a paper trap)
    fx, fy, fr = 668.0, 664.0, 176.0          # the car in front of the companion (ground contact, radius)
    cars = []
    for k in range(16):
        s = 0.79 ** k
        gx, gy, r = vx + (fx - vx) * s, hy + (fy - hy) * s, fr * s
        cars.append((gx, gy - r, r, s))
    # contact shadows (flat ellipses, brand rule) go into the same tone map -> one screen, no moire
    for gx, cy, r, s in cars:
        tone = np.maximum(tone, cov((np.hypot((XX - gx - 0.25 * r) / (1.15 * r), (YY - cy - r) / (0.16 * r)) - 1) * r) * 0.78)
    mx, d, sx, sy = 322.0, 500.0, 0.85, 1.07
    tone = np.maximum(tone, cov((np.hypot((XX - mx) / (d * 0.52), (YY - 690) / 26) - 1) * 26) * 0.78)
    S.paint(tone_halftone(tone, 10, 15), PAL["ink"], "mul")
    S.paint(cov(np.abs(YY - hy) - 1.3), PAL["ink"], "mul")          # horizon rule
    for gx, cy, r, s in reversed(cars):
        trap = cov(sd_circle(gx, cy, r + max(2.0, 6 * s)))
        S.paint(trap, PAL["paper"], "over", texture=0.0)
        S.paint(cov(sd_circle(gx, cy, r)), PAL["ink"], "over")
    # the car behind (nearest the camera), huge and cropped by the left edge
    bx, by, br = -175.0, 470.0, 318.0
    # the companion, squashed sideways between them, annoyed
    my = 684.0 - d / 2 * sy
    body = cov((np.hypot((XX - mx) / (d / 2 * sx), (YY - my) / (d / 2 * sy)) - 1) * d / 2 * sx)
    S.paint(dilate(body, 7), PAL["paper"], "over", texture=0.0)
    S.mascot(mx, my, d, "annoyed", sx=sx, sy=sy, look=(0.07, 0.03), extras=False, misreg=(2, 2))
    S.paint(cov(sd_circle(bx, by, br + 7)), PAL["paper"], "over", texture=0.0)
    S.paint(cov(sd_circle(bx, by, br)), PAL["ink"], "over")
    # pressure ticks at both contacts + a little steam above the head (ink, outside the disc)
    ticks = np.zeros((H, W), np.float32)
    lx = mx - d / 2 * sx
    rx = mx + d / 2 * sx
    for dy_, ln in ((-120, 46), (-60, 58), (0, 46)):
        ticks = np.maximum(ticks, polyline_mask([(lx + 8, my + dy_ - 70), (lx + 8 + ln * 0.7, my + dy_ - 70 - ln * 0.7)], 9))
    for dy_, ln in ((-150, 50), (-95, 62), (-40, 50)):
        ticks = np.maximum(ticks, polyline_mask([(rx - 10, my + dy_), (rx - 10 + ln * 0.75, my + dy_ - ln * 0.66)], 9))
    for i, a in enumerate((-128, -106, -84)):
        ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
        r0, r1 = d / 2 * 1.10, d / 2 * (1.30 if i != 1 else 1.36)
        ticks = np.maximum(ticks, polyline_mask([(mx + ca * r0 * sx, my + sa * r0 * sy),
                                                 (mx + ca * r1 * sx, my + sa * r1 * sy)], 10))
    S.paint(ticks * (1 - body), PAL["ink"], "over")

    # words: top right, in the sky above the vanishing point
    lines = COPY["A"][lang]
    bx0, bx1, by0, by1 = 610, 1244, 46, 262
    size = fit_size(lines, bx1 - bx0, by1 - by0, lead=1.30)
    tm, bb, _ = text_mask(lines, bx0, by0, size, align="right", box_w=bx1 - bx0, lead=1.30)
    S.paint(tm, PAL["ink"], "over", texture=0.04)
    return S.image()


# =========================================================================== B · BE THIS DOT.
def concept_B(lang):
    S = Scene(PAL["ink"], SEED + 2, grain=1.6)
    cream = PAL["paper"]
    cx, cy, R = 1188.0, 360.0, 492.0          # ring centre/radius: only the left arc is in frame
    rr = np.hypot(XX - cx, YY - cy)
    th = np.degrees(np.arctan2(YY - cy, XX - cx)) % 360
    # the road: a faint cream halftone band with two hairline kerbs
    band = cov(np.abs(rr - R) - 56)
    S.paint(tone_halftone(band * 0.13, 9, 75), cream, "over", texture=0.03)
    S.paint(cov(np.abs(rr - (R - 58)) - 1.6) + cov(np.abs(rr - (R + 58)) - 1.6), cream, "over", texture=0.03)

    # cars: cream discs. Flow is counter-clockwise on screen (down the left side), so "ahead" of the
    # companion is BELOW it. The jam sits ahead; behind it, normal spacing.
    m_th = 199.0                              # companion's angle (just above the leftmost point)
    pos = lambda t, rad=R: (cx + rad * math.cos(math.radians(t)), cy + rad * math.sin(math.radians(t)))
    cars = []
    t = 156.0                                 # jam: packed, nose to tail, from here down/out of frame
    while t > 120:
        cars.append((t, 32.0, 0.66))
        t -= 5.4
    for t in (222.0, 236.0, 250.0, 264.0):            # behind: free-flowing spacing
        cars.append((t, 32.0, 1.0))
    carm = np.zeros((H, W), np.float32)
    trap = np.zeros((H, W), np.float32)
    for t, r, sq in cars:
        x, y = pos(t)
        ang = t + 90
        L = 2 * r * (sq if sq < 1 else 1.0)
        d = sd_capsule(x, y, max(L, 2 * r * 0.8), 2 * r, ang) if sq < 1 else sd_circle(x, y, r)
        if sq < 1:   # squeezed cars: flattened along the road (squash, like the companion)
            a = math.radians(ang)
            u = (XX - x) * math.cos(a) + (YY - y) * math.sin(a)
            v = -(XX - x) * math.sin(a) + (YY - y) * math.cos(a)
            d = (np.hypot(u / (r * sq), v / (r * 1.12)) - 1) * r * sq
        trap = np.maximum(trap, cov(d - 5))
        carm = np.maximum(carm, cov(d))
    S.paint(trap, PAL["ink"], "over", texture=0.0)
    S.paint(carm, cream, "over", texture=0.05)
    # the companion, alone in the gap
    mxp, myp = pos(m_th)
    md = 290.0
    S.paint(cov(sd_circle(mxp, myp, md / 2 + 9)), PAL["ink"], "over", texture=0.0)
    S.mascot(mxp, myp, md, "calm", look=(-0.05, 0.02), extras=False)

    # words: a left column, cream, full stop = true disc
    lines = COPY["B"][lang]
    x0, y0, bw, bh = 62, 70, 500, 580
    size = fit_size(lines, bw, bh, lead=1.26)
    f = font(MONO, size, [800, 100])
    cap = f.getbbox("H")[3] - f.getbbox("H")[1]
    th_ = cap + (len(lines) - 1) * cap * 1.26
    tm, bb, dots = text_mask(lines, x0, (H - th_) / 2, size, lead=1.26)
    S.paint(tm, cream, "over", texture=0.04)
    return S.image()


# =========================================================================== C · BACKWARDS?!
def track_sd(cx, cy, half, r):
    """Distance to the centre line of a stadium track (straights of length 2*half, curve radius r)."""
    return M._seg(XX, YY, cx - half, cy, cx + half, cy) - r


def track_point(cx, cy, half, r, s):
    """Point + tangent angle at arclength s along the centre line, counter-clockwise on screen,
    starting at the top-right end of the top straight and running left."""
    L = 4 * half + 2 * math.pi * r
    s %= L
    if s < 2 * half:                                   # top straight, leftwards
        return cx + half - s, cy - r, 180.0
    s -= 2 * half
    if s < math.pi * r:                                # left curve, downwards
        a = -90.0 - math.degrees(s / r)
        return cx - half + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)), a - 90.0
    s -= math.pi * r
    if s < 2 * half:                                   # bottom straight, rightwards
        return cx - half + s, cy + r, 0.0
    s -= 2 * half
    a = 90.0 - math.degrees(s / r)                     # right curve, upwards
    return cx + half + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)), a - 90.0


def concept_C(lang):
    S = Scene(PAL["paper"], SEED + 3)
    cx, cy = 640.0, 362.0
    rc, rw = 282.0, 128.0                       # centre-line radius, road width
    half = 352.0
    dc = track_sd(cx, cy, half, rc)
    road = cov(np.abs(dc) - rw / 2)
    outside = cov(-(dc - rw / 2 - 14))
    # outside the track: a solid-feeling halftone frame (holds the edges on any feed)
    S.paint(tone_halftone(outside * 0.42, 10, 15), PAL["ink"], "mul")
    S.paint(road, PAL["ink"], "over")
    L = 4 * half + 2 * math.pi * rc
    # cars: paper capsules on the road. The jam sits on the top straight, right of centre (1 o'clock).
    jam_c = 250.0                               # arclength of the jam's middle (from the top-right end)
    cars = []
    s = jam_c - 205
    while s < jam_c + 175:                      # packed
        cars.append((s, 42.0))
        s += 46.0
    s_free = jam_c + 175 + 70
    while s_free < L + jam_c - 205 - 60:
        cars.append((s_free, 66.0))
        s_free += 150.0
    carm = np.zeros((H, W), np.float32)
    for s, ln in cars:
        x, y, a = track_point(cx, cy, half, rc, s)
        carm = np.maximum(carm, cov(sd_capsule(x, y, ln, 44 if ln > 45 else 46, a)))
    # chevrons between free-flowing cars show the direction of travel (counter-clockwise)
    chev = np.zeros((H, W), np.float32)
    for s, ln in cars:
        if ln < 60:
            continue
        x, y, a = track_point(cx, cy, half, rc, s + 62)
        ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
        tip = (x + ca * 10, y + sa * 10)
        for sgn in (-1, 1):
            back = (x - ca * 8 - sa * 14 * sgn, y - sa * 8 + ca * 14 * sgn)
            chev = np.maximum(chev, polyline_mask([back, tip], 7))
    S.paint(carm, PAL["paper"], "over", texture=0.04)
    S.paint(chev, PAL["paper"], "over", texture=0.04)

    # the teal arrow: on the infield, hugging the inner kerb, from under the jam clockwise round the
    # right-hand curve (the wave travels backwards, against the cars)
    ri = rc - rw / 2 - 44                       # arrow centre-line radius (inside)
    pts = []
    for x in np.linspace(cx - 40, cx + half, 30):
        pts.append((x, cy - ri))
    for a in np.linspace(-90, 52, 40):
        pts.append((cx + half + ri * math.cos(math.radians(a)), cy + ri * math.sin(math.radians(a))))
    shaft = polyline_mask(pts, 40)
    ea = math.radians(52)
    ex, ey = cx + half + ri * math.cos(ea), cy + ri * math.sin(ea)
    tx, ty = -math.sin(ea), math.cos(ea)       # clockwise tangent
    nx, ny = math.cos(ea), math.sin(ea)
    head = cov(sd_poly([(ex + tx * 74, ey + ty * 74), (ex + nx * 50 - tx * 6, ey + ny * 50 - ty * 6),
                        (ex - nx * 50 - tx * 6, ey - ny * 50 - ty * 6)]))
    tail = cov(sd_circle(pts[0][0], pts[0][1], 20))
    S.paint(np.maximum(np.maximum(shaft, head), tail), PAL["second"], "over")

    # the companion in the jam, surprised, breaking the outer kerb toward the infield
    mxp, myp, _ = track_point(cx, cy, half, rc, jam_c)
    md = 196.0
    myp += 22
    S.paint(cov(sd_circle(mxp, myp, md / 2 + 8)), PAL["paper"], "over", texture=0.0)
    S.mascot(mxp, myp, md, "surprised", extras=False)
    # words inside the ring, left of the arrow
    lines = COPY["C"][lang]
    bx0, bx1 = 196, 900
    by0, by1 = cy - ri + 46, cy + rc - rw / 2 - 30
    size = fit_size(lines, bx1 - bx0, by1 - by0, lead=1.24)
    f = font(MONO, size, [800, 100])
    cap = f.getbbox("H")[3] - f.getbbox("H")[1]
    th_ = cap + (len(lines) - 1) * cap * 1.24
    tm, bb, _ = text_mask(lines, bx0, (by0 + by1 - th_) / 2 + 6, size, align="left", lead=1.24)
    S.paint(tm, PAL["ink"], "over", texture=0.04)
    return S.image()


CONCEPTS = {"A": concept_A, "B": concept_B, "C": concept_C}


# =========================================================================== preview sheet
def preview_sheet(paths):
    thumbs = {k: Image.open(p).convert("RGB") for k, p in paths.items()}
    order = [(c, l) for l in ("en", "es") for c in ("A", "B", "C")]
    pad, big_w, big_h = 40, 640, 360
    SW = pad * 4 + big_w * 3
    lab = font(GROT, 26, [700])
    small = font(GROT, 20, [500])
    cw, ch = 168, 94
    row_h = ch + 26
    feed_h = 60 + 6 * row_h + 20
    SH = 90 + 2 * (big_h + 54) + 40 + feed_h + pad
    sheet = Image.new("RGB", (SW, SH), (226, 226, 226))
    dr = ImageDraw.Draw(sheet)
    dr.text((pad, 30), "EP001 thumbnails v2  ·  Phantom traffic jams  ·  1280x720, shown at 50 %",
            font=lab, fill=PAL["ink"])
    y0 = 90
    for i, (c, l) in enumerate(order):
        col, row = i % 3, i // 3
        x = pad + col * (big_w + pad)
        y = y0 + row * (big_h + 54)
        dr.text((x, y), f"{c} · {l.upper()} · \"{' '.join(COPY[c][l])}\"", font=small, fill=PAL["ink"])
        sheet.paste(thumbs[(c, l)].resize((big_w, big_h), Image.LANCZOS), (x, y + 28))
    fy = y0 + 2 * (big_h + 54) + 40
    panel_w = (SW - pad * 3) // 2
    titles = {"A": (0.92, 0.55), "B": (0.80, 0.70), "C": (0.95, 0.40)}
    chipf = font(GROT, 11, [700])
    for j, (bgc, bar, bar2, name) in enumerate((((255, 255, 255), (200, 200, 200), (225, 225, 225), "light feed"),
                                                 ((15, 15, 15), (85, 85, 85), (55, 55, 55), "dark feed  #0F0F0F"))):
        px0 = pad + j * (panel_w + pad)
        dr.rectangle([px0, fy, px0 + panel_w, fy + feed_h], fill=bgc)
        dr.text((px0 + 20, fy + 18), f"phone · {name} · 168x94", font=small,
                fill=(120, 120, 120) if j == 0 else (150, 150, 150))
        for i, (c, l) in enumerate(order):
            x, y = px0 + 20, fy + 60 + i * row_h
            t = thumbs[(c, l)].resize((cw, ch), Image.LANCZOS)
            msk = Image.new("L", (cw * 4, ch * 4), 0)
            ImageDraw.Draw(msk).rounded_rectangle([0, 0, cw * 4 - 1, ch * 4 - 1], radius=24, fill=255)
            sheet.paste(t, (x, y), msk.resize((cw, ch), Image.LANCZOS))
            dr.rounded_rectangle([x + cw - 36, y + ch - 19, x + cw - 4, y + ch - 5], radius=3, fill=(10, 10, 10))
            dr.text((x + cw - 20, y + ch - 12), "11:42", font=chipf, fill=(240, 240, 240), anchor="mm")
            tx = x + cw + 16
            a, b = titles[c]
            tw = panel_w - cw - 60
            dr.rounded_rectangle([tx, y + 6, tx + int(tw * a), y + 20], radius=7, fill=bar)
            dr.rounded_rectangle([tx, y + 28, tx + int(tw * b), y + 42], radius=7, fill=bar)
            dr.rounded_rectangle([tx, y + 54, tx + int(tw * 0.35), y + 64], radius=5, fill=bar2)
            dr.text((tx + int(tw * 0.35) + 14, y + 50), f"{c} {l.upper()}", font=small, fill=bar)
    return sheet


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default=None)
    ap.add_argument("--no-sheet", action="store_true")
    a = ap.parse_args()
    paths = {}
    for c, fn in CONCEPTS.items():
        for lang in ("en", "es"):
            p = OUT / f"thumb_{c}_{lang}.png"
            paths[(c, lang)] = p
            if a.only and a.only != c:
                continue
            img = fn(lang)
            P.save_png(img, p)
            print(p.name, img.size, f"{p.stat().st_size / 1e6:.2f} MB")
    if not a.only and not a.no_sheet:
        sp = OUT / "preview_sheet.png"
        P.save_png(preview_sheet(paths), sp, colors=256)
        print(sp.name, f"{sp.stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
