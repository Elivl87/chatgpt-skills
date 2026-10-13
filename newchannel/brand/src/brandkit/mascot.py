"""The companion dot: a flat printed disc with a minimal face (two dots + a line).

Drawn analytically with signed distance fields, so it is crisp at any size (24 px to 4K) and can
squash/stretch for animation. Coordinates of an expression are in "dot units": the body is the unit
circle, +x right, +y DOWN. Rendering returns separate coverage masks per ink so the caller composites
them with the print model (body = accent ink, face = ink, extras = ink or second ink).
"""
from __future__ import annotations

import math

import numpy as np

# ----------------------------------------------------------------------------------------- SDF bits

def _seg(px, py, ax, ay, bx, by):
    abx, aby = bx - ax, by - ay
    l2 = abx * abx + aby * aby or 1e-9
    t = np.clip(((px - ax) * abx + (py - ay) * aby) / l2, 0, 1)
    return np.hypot(px - ax - t * abx, py - ay - t * aby)


def _polyline(px, py, pts, w):
    d = np.full(px.shape, 1e9, np.float32)
    for (ax, ay), (bx, by) in zip(pts[:-1], pts[1:]):
        d = np.minimum(d, _seg(px, py, ax, ay, bx, by))
    return d - w


def arc_pts(cx, cy, r, a0, a1, n=24):
    """Angles in degrees, y-down screen convention (0 = right, 90 = down)."""
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def bez_pts(p0, p1, p2, n=20):
    out = []
    for i in range(n + 1):
        t = i / n
        out.append(((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
                    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]))
    return out


def wave_pts(x0, x1, y, amp, cycles, n=40):
    return [(x0 + (x1 - x0) * i / n, y + amp * math.sin(2 * math.pi * cycles * i / n)) for i in range(n + 1)]


def spiral_pts(cx, cy, r, turns=1.75, n=60):
    return [(cx + r * (i / n) * math.cos(2 * math.pi * turns * i / n),
             cy + r * (i / n) * math.sin(2 * math.pi * turns * i / n)) for i in range(n + 1)]


def zee_pts(x, y, s):
    return [(x, y), (x + s, y), (x, y + s), (x + s, y + s)]


def prim_sdf(px, py, p):
    k = p[0]
    if k == "dot":
        _, x, y, r = p[:4]
        return np.hypot(px - x, py - y) - r
    if k == "line":
        return _polyline(px, py, p[1], p[2])
    if k == "ring":
        _, x, y, r, w = p[:5]
        return np.abs(np.hypot(px - x, py - y) - r) - w
    if k == "halfdisc":  # lower half of a disc (open mouth / smug eye), flat edge at y
        _, x, y, r = p[:4]
        return np.maximum(np.hypot(px - x, py - y) - r, y - py)
    if k == "drop":  # teardrop pointing up, bottom circle at (x, y)
        _, x, y, r = p[:4]
        d = np.hypot(px - x, py - y) - r
        for i in range(1, 12):
            t = i / 11
            d = np.minimum(d, np.hypot(px - x, py - (y - 1.9 * r * t)) - r * (1 - t) ** 1.25)
        return d
    if k == "spark":  # four-point print sparkle (astroid), s = tip radius
        _, x, y, s = p[:4]
        f = np.sqrt(np.abs(px - x)) + np.sqrt(np.abs(py - y)) - math.sqrt(s)
        return f * 2.0 * math.sqrt(s) * 0.5
    raise ValueError(k)


# ---------------------------------------------------------------------------------- expressions

EY, EX, ER = -0.14, 0.32, 0.135     # eye row, eye half-spacing, eye radius
MY, LW = 0.30, 0.072                # mouth row, line half-width (stroke = 2*LW)


def _eyes(dx=0.0, dy=0.0, r=ER, rl=None, rr=None):
    return [("dot", -EX + dx, EY + dy, rl or r), ("dot", EX + dx, EY + dy, rr or r)]


def expression(name: str):
    """Returns (face_prims, extras) where extras = list of (prim, ink_role)."""
    e = name
    if e == "neutral":
        return _eyes() + [("line", [(-0.19, MY), (0.19, MY)], LW)], []
    if e == "curious":
        face = _eyes(0.10, -0.07, rl=0.125, rr=0.155) + [("line", [(-0.06, MY - 0.01), (0.22, MY - 0.06)], LW)]
        q = arc_pts(1.12, -1.02, 0.17, 200, 430, 16) + [(1.12, -0.70)]
        return face, [(("line", q, 0.06), "ink"), (("dot", 1.12, -0.50, 0.065), "ink")]
    if e == "surprised":
        face = _eyes(0, -0.06, r=0.16) + [("ring", 0, MY + 0.04, 0.11, 0.06)]
        ex = [(("line", [(math.cos(math.radians(a)) * 1.22, math.sin(math.radians(a)) * 1.22),
                         (math.cos(math.radians(a)) * 1.48, math.sin(math.radians(a)) * 1.48)], 0.06), "ink")
              for a in (-125, -90, -55)]
        return face, ex
    if e == "worried":
        face = _eyes(0, 0.03) + [
            ("line", [(-0.50, -0.34), (-0.20, -0.45)], 0.055), ("line", [(0.20, -0.45), (0.50, -0.34)], 0.055),
            ("line", wave_pts(-0.22, 0.22, MY + 0.03, 0.045, 1.5), LW * 0.9)]
        return face, [(("drop", 0.98, -0.62, 0.12), "second")]
    if e == "delighted":
        face = [("line", arc_pts(-EX, EY + 0.05, 0.13, 195, 345, 12), LW),
                ("line", arc_pts(EX, EY + 0.05, 0.13, 195, 345, 12), LW),
                ("halfdisc", 0, MY - 0.06, 0.25)]
        return face, [(("spark", 1.05, -0.80, 0.26), "second"), (("spark", 1.34, -0.36, 0.15), "second"),
                      (("spark", -1.12, -0.74, 0.17), "second")]
    if e == "smug":
        face = [("halfdisc", -EX, EY + 0.02, 0.14), ("halfdisc", EX, EY + 0.02, 0.14),
                ("line", [(-EX - 0.17, EY + 0.02), (-EX + 0.16, EY + 0.02)], 0.05),
                ("line", [(EX - 0.16, EY + 0.02), (EX + 0.17, EY + 0.02)], 0.05),
                ("line", bez_pts((-0.20, MY + 0.02), (0.08, MY + 0.08), (0.24, MY - 0.08)), LW)]
        return face, []
    if e == "sleepy":
        face = [("line", arc_pts(-EX, EY - 0.04, 0.12, 20, 160, 12), LW),
                ("line", arc_pts(EX, EY - 0.04, 0.12, 20, 160, 12), LW),
                ("ring", 0.02, MY + 0.03, 0.07, 0.05)]
        return face, [(("line", zee_pts(0.95, -1.05, 0.22), 0.05), "ink"),
                      (("line", zee_pts(1.30, -1.40, 0.15), 0.04), "ink")]
    if e == "dizzy":
        face = [("line", spiral_pts(-EX - 0.02, EY, 0.21, 2.0), 0.045), ("line", spiral_pts(EX + 0.02, EY, 0.21, 2.0), 0.045),
                ("line", wave_pts(-0.24, 0.24, MY + 0.02, 0.06, 2.0), LW * 0.85)]
        ex = []
        for i in range(7):
            a = math.radians(-180 + i * 180 / 6)
            ex.append((("dot", 0.95 * math.cos(a), -1.18 + 0.20 * math.sin(a), 0.045 + 0.035 * (i % 2)), "second"))
        return face, ex
    if e == "wink":
        face = [("dot", -EX, EY, ER), ("line", [(EX - 0.15, EY + 0.01), (EX + 0.13, EY - 0.03)], LW),
                ("line", arc_pts(0, MY - 0.17, 0.21, 30, 150, 14), LW)]
        return face, []
    if e == "sad":
        face = _eyes(0, 0.04) + [("line", arc_pts(0, MY + 0.17, 0.17, 215, 325, 12), LW),
                                 ("line", [(-0.48, -0.30), (-0.22, -0.40)], 0.05), ("line", [(0.22, -0.40), (0.48, -0.30)], 0.05)]
        return face, [(("drop", -EX - 0.06, 0.16, 0.07), "second")]
    if e == "focused":
        face = [("halfdisc", -EX, EY - 0.02, 0.14), ("halfdisc", EX, EY - 0.02, 0.14),
                ("line", [(-0.48, EY - 0.17), (-0.18, EY - 0.10)], 0.055),
                ("line", [(0.18, EY - 0.10), (0.48, EY - 0.17)], 0.055),
                ("line", [(-0.12, MY), (0.12, MY)], LW)]
        return face, []
    if e == "laughing":
        face = [("line", [(-EX - 0.13, EY - 0.10), (-EX + 0.08, EY), (-EX - 0.13, EY + 0.10)], LW * 0.9),
                ("line", [(EX + 0.13, EY - 0.10), (EX - 0.08, EY), (EX + 0.13, EY + 0.10)], LW * 0.9),
                ("halfdisc", 0, MY - 0.08, 0.29)]
        ex = [(("line", [(1.10, -0.20), (1.38, -0.30)], 0.05), "ink"), (("line", [(1.08, 0.08), (1.36, 0.10)], 0.05), "ink"),
              (("line", [(-1.10, -0.20), (-1.38, -0.30)], 0.05), "ink"), (("line", [(-1.08, 0.08), (-1.36, 0.10)], 0.05), "ink")]
        return face, ex
    if e == "blank":
        return [], []
    raise KeyError(name)


EXPRESSIONS = ["neutral", "curious", "surprised", "worried", "delighted", "smug",
               "sleepy", "dizzy", "wink", "sad", "focused", "laughing"]


# ------------------------------------------------------------------------------------- rendering

def render(diameter: float, expr: str = "neutral", sx: float = 1.0, sy: float = 1.0,
           look=(0.0, 0.0), extras: bool = True, canvas: float = 3.2, cx=None, cy=None, shape=None):
    """Render masks. Either into a fresh square canvas (side = canvas*diameter/2*2) or, when `shape`
    and centre (cx, cy) are given, into a full-size canvas of that shape (only the local box is computed).

    sx/sy squash-stretch the body (and the face with it); `look` offsets the face in dot units.
    Returns dict(body=, face=, ink=, second=) float32 masks.
    """
    R = diameter / 2.0
    if shape is None:
        side = int(math.ceil(canvas * R)) * 2
        shape = (side, side)
        cx = cy = side / 2.0
    H, W = shape
    out = {k: np.zeros(shape, np.float32) for k in ("body", "face", "ink", "second")}
    ext = 1.6 if extras else 1.05
    x0, x1 = int(max(0, cx - ext * R * max(sx, 1) - 2)), int(min(W, cx + ext * R * max(sx, 1) + 3))
    y0, y1 = int(max(0, cy - ext * R * max(sy, 1) * 1.05 - 2)), int(min(H, cy + ext * R * max(sy, 1) + 3))
    if x1 <= x0 or y1 <= y0:
        return out
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    # pixel centres -> dot units
    u = (xx + 0.5 - cx) / R
    v = (yy + 0.5 - cy) / R
    px = 1.0 / R  # one pixel in dot units (for anti-aliasing)

    def cov(d, scale=1.0):
        return np.clip(0.5 - d / (px * scale), 0, 1)

    # body: ellipse (approximate SDF, good enough for AA)
    bu, bv = u / sx, v / sy
    db = (np.hypot(bu, bv) - 1.0) * min(sx, sy)
    out["body"][y0:y1, x0:x1] = cov(db)

    face, ex = expression(expr)
    fu, fv = bu - look[0], bv - look[1]
    if face:
        d = np.full(fu.shape, 1e9, np.float32)
        for p in face:
            d = np.minimum(d, prim_sdf(fu, fv, p))
        out["face"][y0:y1, x0:x1] = cov(d * min(sx, sy)) * np.clip(out["body"][y0:y1, x0:x1] * 1.0, 0, 1)
    if extras and ex:
        for role in ("ink", "second"):
            d = np.full(u.shape, 1e9, np.float32)
            for p, r in ex:
                if r == role:
                    d = np.minimum(d, prim_sdf(u, v, p))
            out[role][y0:y1, x0:x1] = np.maximum(out[role][y0:y1, x0:x1], cov(d))
    return out


def disc(shape, cx, cy, r, mask=None):
    """Anti-aliased flat disc stamped (max) into `mask` (created if None)."""
    H, W = shape
    if mask is None:
        mask = np.zeros(shape, np.float32)
    x0, x1 = int(max(0, cx - r - 2)), int(min(W, cx + r + 3))
    y0, y1 = int(max(0, cy - r - 2)), int(min(H, cy + r + 3))
    if x1 <= x0 or y1 <= y0:
        return mask
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    d = np.hypot(xx + 0.5 - cx, yy + 0.5 - cy) - r
    np.maximum(mask[y0:y1, x0:x1], np.clip(0.5 - d, 0, 1), out=mask[y0:y1, x0:x1])
    return mask
