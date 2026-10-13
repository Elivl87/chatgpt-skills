#!/usr/bin/env python3
"""Pilot thumbnails: "Why do buses come in threes?" - 3 concepts x EN / ES-419 + preview sheet.

Deterministic (fixed seeds), numpy + Pillow only. Uses the brand kit in newchannel/brand/src
(print model, paper, halftone, mascot SDF) instead of redrawing anything.

    python3 thumbs.py                 # 6 thumbnails + preview_sheet.png
    python3 thumbs.py --only 1        # concept 1 only (both languages), no sheet
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
BRAND = HERE.parents[2] / "brand"
sys.path.insert(0, str(BRAND / "src"))

from brandkit import mascot as M    # noqa: E402
from brandkit import printfx as P   # noqa: E402

PAL = {k: v for k, v in json.loads((BRAND / "palette.json").read_text()).items()
       if isinstance(v, str) and v.startswith("#")}
MONO = BRAND / "fonts/MartianMono/MartianMono[wdth,wght].ttf"
GROT = BRAND / "fonts/SpaceGrotesk/SpaceGrotesk[wght].ttf"
W, H = 1280, 720
SEED = 20261013

# --------------------------------------------------------------------------- copy (1-3 words each)
COPY = {
    1: {"en": ["1 SECOND", "APART"], "es": ["A 1", "SEGUNDO"]},
    2: {"en": ["THEN", "THREE"], "es": ["Y LUEGO", "TRES"]},
    3: {"en": ["JUST", "WAIT."], "es": ["ESPERA."]},
}

# --------------------------------------------------------------------------- mascot: one extra face
# "Deadpan, one eye open" (concept 1) is not one of the 12 brand expressions; it is built from the
# same primitives and proportions (sleepy eye + open eye + neutral mouth) and registered on top of
# brandkit.mascot.expression so M.render() draws it with the normal SDF pipeline.
_brand_expression = M.expression


def _expression(name):
    if name == "peek":
        face = [("line", M.arc_pts(-M.EX, M.EY - 0.02, 0.125, 15, 165, 12), M.LW),
                ("dot", M.EX, M.EY, M.ER * 1.08),
                ("line", [(-0.18, M.MY + 0.02), (0.18, M.MY + 0.02)], M.LW)]
        return face, []
    return _brand_expression(name)


M.expression = _expression


# --------------------------------------------------------------------------- geometry helpers
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32) + 0.5


def cov(d, aa=1.0):
    return np.clip(0.5 - d / aa, 0, 1).astype(np.float32)


def local(cx, cy, ang):
    """Canvas -> local frame (u along `ang` degrees, v perpendicular, y-down)."""
    a = math.radians(ang)
    dx, dy = XX - cx, YY - cy
    return dx * math.cos(a) + dy * math.sin(a), -dx * math.sin(a) + dy * math.cos(a)


def sd_rrect(u, v, cu, cv_, w, h, r):
    qx = np.abs(u - cu) - (w / 2 - r)
    qy = np.abs(v - cv_) - (h / 2 - r)
    return np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - r


def sd_circle(u, v, cu, cv_, r):
    return np.hypot(u - cu, v - cv_) - r


def seg_mask(p1, p2, w):
    return cov(M._seg(XX, YY, p1[0], p1[1], p2[0], p2[1]) - w / 2)


def dilate(mask, px):
    if px <= 0:
        return mask
    size = int(px) * 2 + 1
    img = Image.fromarray((np.clip(mask, 0, 1) * 255).astype(np.uint8), "L").filter(ImageFilter.MaxFilter(size))
    return np.asarray(img, np.float32) / 255.0


def font(path, size, axes):
    f = ImageFont.truetype(str(path), int(size))
    f.set_variation_by_axes(axes)
    return f


# --------------------------------------------------------------------------- scene (painter + print)
ROLES = ("shadow", "second", "body", "face", "ink")


class Scene:
    """Per-ink coverage masks. `put` paints an object on top: everything underneath is knocked out
    inside the object's silhouette grown by `halo` px (a paper trap, like a sticker), so stacked
    objects stay separate in the multiply print model."""

    def __init__(self, seed):
        self.seed = seed
        self.m = {k: np.zeros((H, W), np.float32) for k in ROLES}

    def put(self, masks: dict, halo=0, silhouette=None):
        sil = silhouette
        if sil is None:
            sil = np.zeros((H, W), np.float32)
            for v in masks.values():
                sil = np.maximum(sil, v)
        if halo >= 0:
            keep = 1.0 - dilate(sil, halo)
            for k in ROLES:
                self.m[k] *= keep
        for k, v in masks.items():
            np.maximum(self.m[k], v, out=self.m[k])

    def render(self, misreg=(1, 1), grain=1.0):
        p = PAL
        layers = [(self.m["shadow"], p["paper_shadow"]), (self.m["second"], p["second"]),
                  (self.m["body"], p["accent"]), (self.m["face"], p["ink"], misreg), (self.m["ink"], p["ink"])]
        base = P.paper(W, H, p["paper"], self.seed, grain)
        return P.to_image(P.composite(base, layers, self.seed + 5, 0.06))


def mascot(cx, cy, d, expr, look=(0.0, 0.0), extras=True, sx=1.0, sy=1.0):
    r = M.render(d, expr, cx=cx, cy=cy, shape=(H, W), look=look, extras=extras, sx=sx, sy=sy)
    return {"body": r["body"], "face": r["face"], "ink": r["ink"], "second": r["second"]}


WORD_SPACE = 0.55   # brand: word spaces tightened to 0.55 of a monospace cell


def line_width(f, s):
    words = s.split(" ")
    return sum(f.getlength(w) for w in words) + (len(words) - 1) * WORD_SPACE * f.getlength(" ")


def text_mask(lines, x, y, size, wdth=100, lead=0.98):
    """Martian Mono ExtraBold (wght 800), lines stacked by cap height, tightened word spaces.
    Returns (mask, bbox)."""
    f = font(MONO, size, [800, wdth])
    img = Image.new("L", (W, H), 0)
    dr = ImageDraw.Draw(img)
    cap = f.getbbox("H")[3] - f.getbbox("H")[1]
    step = cap * 1.32 * lead
    sp = WORD_SPACE * f.getlength(" ")
    for i, s in enumerate(lines):
        xx = x
        for w in s.split(" "):
            dr.text((xx, y + i * step + cap), w, font=f, fill=255, anchor="ls")
            xx += f.getlength(w) + sp
    m = np.asarray(img, np.float32) / 255.0
    maxw = max(line_width(f, s) for s in lines)
    return m, (x, y, x + maxw, y + (len(lines) - 1) * step + cap)


def fit_size(lines, box_w, box_h, wdth=100, lead=0.98, smax=260):
    for s in range(smax, 40, -2):
        f = font(MONO, s, [800, wdth])
        cap = f.getbbox("H")[3] - f.getbbox("H")[1]
        hh = cap + (len(lines) - 1) * cap * 1.32 * lead
        ww = max(line_width(f, t) for t in lines)
        if ww <= box_w and hh <= box_h:
            return s
    return 40


# --------------------------------------------------------------------------- the bus
def bus(cx, cy, L, Hh, ang=0.0, facing=1, door_open=False, tone=None, windows=True):
    """A generic rounded-capsule bus in ink (side view, no brand, no lettering).
    Returns (masks, silhouette). `tone` -> halftone ink at that tone (for faint background buses)."""
    u, v = local(cx, cy, ang)
    u = u * facing                       # front is +u
    body_d = sd_rrect(u, v, 0, 0, L, Hh, Hh * 0.46)
    body = cov(body_d)
    hole = np.zeros_like(body)
    if windows:
        # passenger windows: a row of rounded squares
        n = 5 if L / Hh > 2.4 else 4
        x0, x1 = -0.40 * L, 0.20 * L
        ww = (x1 - x0) / n
        for i in range(n):
            c = x0 + ww * (i + 0.5)
            hole = np.maximum(hole, cov(sd_rrect(u, v, c, -0.12 * Hh, ww * 0.78, 0.34 * Hh, 0.10 * Hh)))
        # windscreen: follows the rounded nose
        ws = np.maximum(sd_rrect(u, v, 0.43 * L, -0.11 * Hh, 0.16 * L, 0.38 * Hh, 0.12 * Hh), body_d + 0.10 * Hh)
        hole = np.maximum(hole, cov(ws))
        # door (front, just behind the windscreen)
        dc, dw = 0.285 * L, 0.085 * L
        if door_open:
            hole = np.maximum(hole, cov(sd_rrect(u, v, dc, 0.03 * Hh, dw, 0.70 * Hh, 0.04 * Hh)))
        else:
            ring = np.abs(sd_rrect(u, v, dc, 0.03 * Hh, dw, 0.70 * Hh, 0.04 * Hh)) - 0.018 * Hh
            hole = np.maximum(hole, cov(ring))
            hole = np.maximum(hole, cov(np.maximum(np.abs(u - dc) - 0.012 * Hh,
                                                   np.abs(v - 0.03 * Hh) - 0.33 * Hh)))
        # headlight
        hole = np.maximum(hole, cov(sd_circle(u, v, 0.465 * L, 0.24 * Hh, 0.055 * Hh)))
    # wheels with an arch gap and a paper hub
    wheels = np.zeros_like(body)
    for wu in (-0.30 * L, 0.18 * L):
        hole = np.maximum(hole, cov(sd_circle(u, v, wu, 0.47 * Hh, 0.25 * Hh)))
        wheels = np.maximum(wheels, cov(sd_circle(u, v, wu, 0.47 * Hh, 0.19 * Hh)))
        wheels = wheels * (1 - cov(sd_circle(u, v, wu, 0.47 * Hh, 0.075 * Hh)))
    ink = np.maximum(body * (1 - hole), wheels)
    sil = np.maximum(body, cov(sd_circle(u, v, -0.30 * L, 0.47 * Hh, 0.19 * Hh)))
    sil = np.maximum(sil, cov(sd_circle(u, v, 0.18 * L, 0.47 * Hh, 0.19 * Hh)))
    if tone is not None:
        a = 15.0
        ink = np.minimum(ink, P.halftone(np.full((H, W), tone, np.float32) * ink, cell=5, angle=a))
    return {"ink": ink}, sil


def shadow_ellipse(cx, cy, rx, ry, tone=0.28, cell=9):
    d = np.hypot((XX - cx) / rx, (YY - cy) / ry) - 1
    m = cov(d * min(rx, ry))
    return P.halftone(m * tone, cell=cell, angle=15)


def halftone_band(y0, y1, tone, cell=10, x0=0, x1=W, angle=15):
    m = np.zeros((H, W), np.float32)
    m[int(y0):int(y1), int(x0):int(x1)] = tone
    return P.halftone(m, cell=cell, angle=angle)


def passengers(rng, cx, cy, rx, ry, n, rmin, rmax, avoid=None, second_share=0.3):
    """A heap of waiting dots (ink + second), packed by rejection sampling."""
    pts = []
    tries = 0
    while len(pts) < n and tries < 20000:
        tries += 1
        x = cx + (rng.random() * 2 - 1) * rx
        y = cy + (rng.random() * 2 - 1) * ry
        if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1:
            continue
        r = rmin + (rmax - rmin) * rng.random()
        if avoid and any(math.hypot(x - ax, y - ay) < ar + r for ax, ay, ar in avoid):
            continue
        if any(math.hypot(x - px, y - py) < pr + r + 3 for px, py, pr in pts):
            continue
        pts.append((x, y, r))
    ink = np.zeros((H, W), np.float32)
    sec = np.zeros((H, W), np.float32)
    for x, y, r in pts:
        tgt = sec if rng.random() < second_share else ink
        M.disc((H, W), x, y, r, tgt)
    return {"ink": ink, "second": sec}, pts


def speed_lines(x0, x1, ys, w=7):
    m = np.zeros((H, W), np.float32)
    for (y, a, b) in ys:
        m = np.maximum(m, seg_mask((x0 + a, y), (x1 - b, y), w))
    return m


# --------------------------------------------------------------------------- concept 1
def concept1(lang):
    sc = Scene(SEED + 1)
    rng = np.random.default_rng(SEED + 11)
    ang = -8.0
    L, Hh, gap = 520, 186, -4
    # three buses nose to tail along a rising diagonal, the lead one entering frame right
    a = math.radians(ang)
    ux, uy = math.cos(a), math.sin(a)
    lead = np.array([1110.0, 445.0])
    centres = [lead - k * (L + gap) * np.array([ux, uy]) for k in range(3)]
    sc.put({"ink": halftone_band(0, 0, 0)}, halo=-1)
    for c in centres:
        sc.put({"ink": shadow_ellipse(c[0], c[1] + Hh * 0.62, L * 0.52, 18, 0.30)}, halo=-1)
    for k, c in enumerate(reversed(centres)):      # back to front: each nose overlaps the next tail
        m, sil = bus(c[0], c[1], L, Hh, ang)
        sc.put(m, halo=7, silhouette=sil)
    # the mascot, buried under a heap of waiting dots, bottom right (in front of the buses)
    mx, my, md = 925, 588, 214
    heap, _ = passengers(rng, mx, 712, 260, 110, 90, 15, 27, avoid=[(mx, my, md * 0.5 + 4)], second_share=0.32)
    sc.put(heap, halo=5)
    sc.put(mascot(mx, my, md, "peek", look=(-0.12, -0.04), extras=False), halo=9)
    # dots in front of the mascot's lower rim (it is buried up to the chin)
    front, _ = passengers(np.random.default_rng(SEED + 12), mx, my + 112, 150, 30, 18, 14, 24, second_share=0.3)
    sc.put(front, halo=5)
    # headline
    lines = COPY[1][lang]
    size = fit_size(lines, 900 if lang == "en" else 820, 300)
    tm, bb = text_mask(lines, 58, 44, size)
    sc.put({"ink": tm}, halo=12)
    return sc.render()


# --------------------------------------------------------------------------- concept 2
def clock(cx, cy, r, hh=7.75):
    ring = cov(np.abs(sd_circle(XX, YY, cx, cy, r - r * 0.08)) - r * 0.08)
    disc_ = cov(sd_circle(XX, YY, cx, cy, r))
    hands = np.zeros((H, W), np.float32)
    mins = (hh % 1) * 60
    for ang, ln, wd in ((math.radians((hh % 12) / 12 * 360 - 90), 0.48 * r, 0.12 * r),
                        (math.radians(mins / 60 * 360 - 90), 0.72 * r, 0.09 * r)):
        hands = np.maximum(hands, seg_mask((cx, cy), (cx + ln * math.cos(ang), cy + ln * math.sin(ang)), wd))
    hands = np.maximum(hands, cov(sd_circle(XX, YY, cx, cy, 0.09 * r)))
    for i in range(12):
        t = math.radians(i * 30)
        p1 = (cx + 0.80 * r * math.cos(t), cy + 0.80 * r * math.sin(t))
        p2 = (cx + 0.70 * r * math.cos(t), cy + 0.70 * r * math.sin(t))
        if i % 3 == 0:
            hands = np.maximum(hands, seg_mask(p1, p2, 0.07 * r))
    return np.maximum(ring, hands), disc_


def concept2(lang):
    sc = Scene(SEED + 2)
    road_y = 612
    sc.put({"ink": halftone_band(road_y, H, 0.20, cell=10)}, halo=-1)
    # kerb line
    sc.put({"ink": seg_mask((0, road_y), (W, road_y), 6)}, halo=-1)
    # three buses bursting in from the right, cascading towards the viewer
    specs = [(1190, 318, 0.62), (1105, 430, 0.80), (1010, 560, 1.0)]
    L0, H0 = 640, 220
    for (cx, cy, s) in specs:
        sc.put({"ink": shadow_ellipse(cx, cy + H0 * s * 0.62, L0 * s * 0.5, 14 * s, 0.32)}, halo=-1)
        m, sil = bus(cx, cy, L0 * s, H0 * s, 0, facing=-1)
        sc.put(m, halo=8, silhouette=sil)
    # speed ticks behind (right edge) and a burst at the lead nose
    sl = np.zeros((H, W), np.float32)
    # impact ticks in front of the lead bus
    nose = (1010 - L0 * 0.5, 560)
    ticks = np.zeros((H, W), np.float32)
    for k, a in enumerate((-150, -180, 150)):
        t = math.radians(a)
        p1 = (nose[0] + 30 * math.cos(t), nose[1] + 30 * math.sin(t) - 10)
        p2 = (nose[0] + 70 * math.cos(t), nose[1] + 70 * math.sin(t) - 10)
        ticks = np.maximum(ticks, seg_mask(p1, p2, 9))
    sc.put({"ink": np.maximum(ticks, sl)}, halo=4)
    # the stop: a pole topped by a clock (it has been 19:45 minutes; hands read 7:45)
    px, ptop = 440, 430
    pole = seg_mask((px, ptop), (px, road_y + 4), 12)
    ring, disc_ = clock(px, ptop - 50, 62, hh=7.75)
    sc.put({"ink": pole}, halo=0)
    sc.put({"ink": ring}, halo=6, silhouette=disc_)
    # the mascot alone at the stop, looking right at the buses, surprised
    sc.put({"ink": shadow_ellipse(220, road_y + 4, 120, 13, 0.35)}, halo=-1)
    sc.put(mascot(220, road_y - 116, 232, "surprised", look=(0.14, 0.0), extras=True), halo=8)
    lines = COPY[2][lang]
    size = fit_size(lines, 700, 250)
    tm, bb = text_mask(lines, 58, 40, size)
    sc.put({"ink": tm}, halo=12)
    return sc.render()


# --------------------------------------------------------------------------- concept 3
def paddle(cx, cy, r, stick_to):
    disc_ = cov(sd_circle(XX, YY, cx, cy, r))
    ring = cov(np.abs(sd_circle(XX, YY, cx, cy, r - r * 0.12)) - r * 0.12)
    bars = np.maximum(cov(sd_rrect(XX, YY, cx - r * 0.24, cy, r * 0.24, r * 0.92, r * 0.06)),
                      cov(sd_rrect(XX, YY, cx + r * 0.24, cy, r * 0.24, r * 0.92, r * 0.06)))
    stick = seg_mask((cx, cy + r * 0.9), stick_to, r * 0.20)
    return np.maximum(np.maximum(ring, bars), stick), np.maximum(disc_, stick)


def concept3(lang):
    sc = Scene(SEED + 3)
    road_y = 640
    sc.put({"ink": halftone_band(road_y, H, 0.20, cell=10)}, halo=-1)
    sc.put({"ink": seg_mask((0, road_y), (W, road_y), 6)}, halo=-1)
    # background: a faint bunch of small buses pulling apart (halftone ink)
    hy, k = (232, 1.0) if lang == "en" else (272, 0.8)
    bg = np.zeros((H, W), np.float32)
    xs = [1010 - 200 * k, 1010, 1010 + 200 * k]
    for x in xs:
        m, _ = bus(x, hy, 150 * k, 54 * k, 0, facing=1, tone=0.55, windows=False)
        bg = np.maximum(bg, m["ink"])
    arr = np.zeros((H, W), np.float32)
    for x0 in ((xs[0] + xs[1]) / 2, (xs[1] + xs[2]) / 2):
        for s in (-1, 1):
            arr = np.maximum(arr, seg_mask((x0 + 22 * k * s, hy), (x0 + 4 * s, hy), 5))
            arr = np.maximum(arr, seg_mask((x0 + 22 * k * s, hy), (x0 + 13 * k * s, hy - 8 * k), 5))
            arr = np.maximum(arr, seg_mask((x0 + 22 * k * s, hy), (x0 + 13 * k * s, hy + 8 * k), 5))
    sc.put({"ink": np.maximum(bg, arr * 0.85)}, halo=-1)
    # the parked bus, doors open, facing left
    L, Hh = 820, 270
    bx, by = 965, road_y - 0.66 * Hh + 2
    sc.put({"ink": shadow_ellipse(bx, road_y + 6, L * 0.5, 16, 0.32)}, halo=-1)
    m, sil = bus(bx, by, L, Hh, 0, facing=-1, door_open=True)
    sc.put(m, halo=10, silhouette=sil)
    # a late rider stepping in through the open door (they make it because the bus waits)
    dx = bx - 0.285 * L
    riders = {"second": M.disc((H, W), dx, by + 0.03 * Hh + 0.35 * Hh - 27, 25)}
    sc.put(riders, halo=0)
    # the mascot in front of the open door, smug, holding up a "hold" paddle
    mx, md = 300, 220
    my = road_y - md * 0.5
    sc.put({"ink": shadow_ellipse(mx, road_y + 4, md * 0.55, 12, 0.35)}, halo=-1)
    pm, psil = paddle(mx + 108, my - 152, 68, (mx + 108, road_y - 6))
    sc.put({"ink": pm}, halo=8, silhouette=psil)
    sc.put(mascot(mx, my, md, "smug", look=(0.06, 0.0), extras=False), halo=9)
    lines = COPY[3][lang]
    if lang == "en":
        size = fit_size(lines, 500, 262)
    else:
        size = fit_size(lines, 1000, 200)
    tm, bb = text_mask(lines, 58, 40, size)
    sc.put({"ink": tm}, halo=12)
    return sc.render()


CONCEPTS = {1: concept1, 2: concept2, 3: concept3}


# --------------------------------------------------------------------------- preview sheet
def preview_sheet(paths):
    thumbs = {k: Image.open(p).convert("RGB") for k, p in paths.items()}
    order = [(c, l) for l in ("en", "es") for c in (1, 2, 3)]
    pad = 40
    big_w, big_h = 640, 360
    SW = pad * 4 + big_w * 3
    lab = font(GROT, 26, [700])
    small = font(GROT, 20, [500])
    # feed panel geometry
    cw, ch = 168, 94
    row_h = ch + 26
    feed_h = 60 + 6 * row_h + 20
    SH = 90 + 2 * (big_h + 54) + 40 + feed_h + pad
    sheet = Image.new("RGB", (SW, SH), (243, 236, 221))
    dr = ImageDraw.Draw(sheet)
    dr.text((pad, 30), "Pilot thumbnails  ·  Why do buses come in threes?  ·  1280x720, shown at 50 %",
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
    titles = {1: (0.92, 0.55), 2: (0.80, 0.70), 3: (0.95, 0.40)}
    for j, (bgc, bar, bar2, name) in enumerate((((255, 255, 255), (200, 200, 200), (225, 225, 225), "light feed"),
                                                 ((15, 15, 15), (85, 85, 85), (55, 55, 55), "dark feed  #0F0F0F"))):
        px0 = pad + j * (panel_w + pad)
        dr.rectangle([px0, fy, px0 + panel_w, fy + feed_h], fill=bgc)
        dr.text((px0 + 20, fy + 18), f"phone · {name} · 168x94", font=small,
                fill=(120, 120, 120) if j == 0 else (150, 150, 150))
        for i, (c, l) in enumerate(order):
            x = px0 + 20
            y = fy + 60 + i * row_h
            t = thumbs[(c, l)].resize((cw, ch), Image.LANCZOS)
            # rounded corners like the app
            msk = Image.new("L", (cw * 4, ch * 4), 0)
            ImageDraw.Draw(msk).rounded_rectangle([0, 0, cw * 4 - 1, ch * 4 - 1], radius=24, fill=255)
            sheet.paste(t, (x, y), msk.resize((cw, ch), Image.LANCZOS))
            # duration chip (generic)
            dr.rounded_rectangle([x + cw - 40, y + ch - 20, x + cw - 4, y + ch - 5], radius=3, fill=(20, 20, 20))
            tx = x + cw + 16
            a, b = titles[c]
            tw = panel_w - cw - 60
            dr.rounded_rectangle([tx, y + 6, tx + int(tw * a), y + 20], radius=7, fill=bar)
            dr.rounded_rectangle([tx, y + 28, tx + int(tw * b), y + 42], radius=7, fill=bar)
            dr.rounded_rectangle([tx, y + 54, tx + int(tw * 0.35), y + 64], radius=5, fill=bar2)
            dr.text((tx + int(tw * 0.35) + 14, y + 50), f"{c}{l.upper()}", font=small, fill=bar)
    return sheet


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", type=int, default=None)
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
