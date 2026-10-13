"""The companion, animated. Wraps brandkit's SDF mascot (brand/src/brandkit/mascot.py, read-only) and adds:

* blinks on a seeded schedule (every 2.2-5.5 s, 130 ms, sometimes a double blink), partial eyelids via the SDF;
* expression transitions: a 0.22 s squash "pop" with a blink, the face swaps at the bottom of the squash;
* eye direction (`look`, dot units, clamped to +-0.12 R as BRAND.md says), optionally toward a world point;
* squash & stretch that keeps the bottom on the surface (`ground=True`);
* hops along a path (`HopPath`): parabolic arcs between contact points, contact squash, flight stretch;
* size rules for phones: hero shots must show the body at >= 70 px diameter at 1080p (`MIN_HERO_D`); the
  43 px of the first style test was too small. Below 48 px extras are dropped (BRAND.md section 4).

    m = Mascot(seed=3)
    m.set_expr(0.0, "neutral"); m.set_expr(2.4, "surprised"); m.set_expr(3.0, "worried")
    m.draw(frame, x, y, d=84, t=t, look=(0.1, 0), hero=True)       # x, y = centre in output px
"""
from __future__ import annotations

import math
import warnings
from dataclasses import dataclass

import numpy as np

import look as L  # noqa: F401  (puts brand/src on sys.path)
from brandkit import mascot as BM  # noqa: E402

MIN_HERO_D = 70.0          # px at 1080p: minimum body diameter in a hero shot (phone legibility)
MIN_D = 24.0               # absolute brand minimum
EXTRAS_MIN_D = 48.0        # below this, no extras
LOOK_MAX = 0.12            # dot units
EXPRESSIONS = BM.EXPRESSIONS


# ------------------------------------------------------------------------------------------------ rendering

def _is_eye(p):
    return p[0] == "dot" and abs(p[2] - BM.EY) < 0.12 and abs(abs(p[1]) - BM.EX) < 0.16


def render_masks(d: float, expr="neutral", sx=1.0, sy=1.0, look=(0.0, 0.0), blink=0.0, extras=True,
                 fx=0.0, fy=0.0):
    """Masks for a companion of diameter d (px at the target resolution), centred at (side/2 + fx, side/2 + fy) of a
    square patch. Returns (masks dict(body, face, ink, second), side). Eyes are drawn as ellipses that close with
    `blink` (0 open .. 1 closed = a short ink line); everything else comes from brandkit's expression table."""
    R = d / 2.0
    ext = 1.65 if extras else 1.08
    side = int(math.ceil(R * ext * max(sx, sy, 1.0) * 2 + 6))
    side += side % 2
    cx, cy = side / 2 + fx, side / 2 + fy
    yy, xx = np.mgrid[0:side, 0:side].astype(np.float32)
    u = (xx + 0.5 - cx) / R
    v = (yy + 0.5 - cy) / R
    px = 1.0 / R

    def cov(dist):
        return np.clip(0.5 - dist / px, 0, 1)

    bu, bv = u / sx, v / sy
    body = cov((np.hypot(bu, bv) - 1.0) * min(sx, sy))
    face_p, ex = BM.expression(expr)
    fu, fv = bu - look[0], bv - look[1]
    dmin = np.full(u.shape, 1e9, np.float32)
    k = max(1.0 - blink, 0.0)
    for p in face_p:
        if _is_eye(p) and blink > 0.02:
            _, ex_, ey_, r = p[:4]
            kk = max(k, 0.42 * BM.LW / r)            # closed eye = a line as thick as the mouth stroke
            dist = (np.hypot(fu - ex_, (fv - ey_) / kk) - r) * kk
            dmin = np.minimum(dmin, dist)
        else:
            dmin = np.minimum(dmin, BM.prim_sdf(fu, fv, p))
    face = cov(dmin * min(sx, sy)) * body if face_p else np.zeros_like(body)
    out = {"body": body, "face": face, "ink": None, "second": None}
    if extras and ex:
        for role in ("ink", "second"):
            dd = np.full(u.shape, 1e9, np.float32)
            for p, r in ex:
                if r == role:
                    dd = np.minimum(dd, BM.prim_sdf(u, v, p))
            m = cov(dd)
            out[role] = m if m.any() else None
    return out, side


# ------------------------------------------------------------------------------------------------ schedules

def blink_schedule(seed, t_end, every=(2.2, 5.5), double_p=0.2):
    """Deterministic list of blink start times in [0, t_end)."""
    rng = np.random.default_rng(seed * 104729 + 17)
    t, out = rng.uniform(0.4, every[0]), []
    while t < t_end:
        out.append(t)
        if rng.random() < double_p:
            out.append(t + 0.24)
        t += rng.uniform(*every)
    return out


def blink_amount(t, starts, dur=0.13):
    """0..1 eyelid closure: closes in 40 % of dur, opens in 60 %."""
    b = 0.0
    for s in starts:
        if s - 0.01 <= t <= s + dur:
            x = (t - s) / dur
            b = max(b, x / 0.4 if x < 0.4 else 1 - (x - 0.4) / 0.6)
    return max(0.0, min(1.0, b))


@dataclass
class ExprKey:
    t: float
    expr: str


class Mascot:
    """Stateless-per-frame companion animator (all state comes from t, so frames render in any order)."""

    POP = 0.22      # s, duration of an expression-change pop

    def __init__(self, seed=1, t_end=3600.0, blinks=True):
        self.seed = seed
        self.keys: list[ExprKey] = [ExprKey(-1e9, "neutral")]
        self.blinks = blink_schedule(seed, t_end) if blinks else []
        self.extra_blinks: list[float] = []

    # -- authoring
    def set_expr(self, t, expr):
        if expr not in EXPRESSIONS and expr != "blank":
            raise KeyError(f"{expr!r} not in {EXPRESSIONS}")
        self.keys.append(ExprKey(float(t), expr))
        self.keys.sort(key=lambda k: k.t)
        return self

    def blink_at(self, t):
        self.extra_blinks.append(float(t))
        return self

    # -- evaluation
    def expr_at(self, t):
        """-> (expression shown, seconds since the last change, previous expression)."""
        cur, prev, since = self.keys[0], self.keys[0], 1e9
        for k in self.keys:
            if k.t <= t:
                prev, cur = cur, k
        since = t - cur.t
        # the face swaps at the middle of the pop
        if since < self.POP * 0.45 and prev is not cur:
            return prev.expr, since, prev.expr
        return cur.expr, since, prev.expr

    def pop(self, since):
        """Squash multiplier during an expression change: (sx, sy)."""
        if since >= self.POP or since < 0:
            return 1.0, 1.0
        x = since / self.POP
        a = math.sin(math.pi * x) * (1 - x) * 0.9
        return 1 + 0.16 * a, 1 - 0.16 * a

    def blink(self, t, expr):
        if expr in ("sleepy", "delighted", "laughing", "wink", "dizzy", "blank"):
            return 0.0              # closed/stylised eyes: no blink
        b = blink_amount(t, self.blinks) if self.blinks else 0.0
        b = max(b, blink_amount(t, self.extra_blinks))
        e, since, _ = self.expr_at(t)
        if since < self.POP:     # blink through the expression change
            b = max(b, blink_amount(since, [self.POP * 0.25], self.POP * 0.5))
        return b

    def draw(self, fr, x, y, d, t, expr=None, look=(0.0, 0.0), sx=1.0, sy=1.0, extras=None, hero=False,
             ground=True, look_at=None):
        """Draw into an engine `look.Frame`. (x, y) = centre at rest, d = diameter in output px.
        look_at: (wx, wy) screen point to look toward (overrides `look`)."""
        if hero and d < MIN_HERO_D:
            warnings.warn(f"hero mascot d={d:.0f}px < {MIN_HERO_D:.0f}px: enlarged to the phone minimum")
            d = MIN_HERO_D
        d = max(d, MIN_D)
        if expr is None:
            expr, since, _ = self.expr_at(t)
        else:
            since = 1e9
        psx, psy = self.pop(since)
        sx, sy = sx * psx, sy * psy
        if look_at is not None:
            vx, vy = look_at[0] - x, look_at[1] - y
            n = math.hypot(vx, vy) or 1.0
            look = (vx / n * LOOK_MAX, vy / n * LOOK_MAX * 0.8)
        lx, ly = look
        n = math.hypot(lx, ly)
        if n > LOOK_MAX:
            lx, ly = lx / n * LOOK_MAX, ly / n * LOOK_MAX
        if extras is None:
            extras = d >= 110
        extras = extras and d >= EXTRAS_MIN_D
        cy = y + (d / 2) * (1 - sy) if ground and sy < 1 else y
        ss = fr.ss
        X, Y = x * ss, cy * ss
        ix, iy = math.floor(X), math.floor(Y)
        masks, side = render_masks(d * ss, expr, sx, sy, (lx, ly), self.blink(t, expr), extras, X - ix, Y - iy)
        fr.stamp(masks, (ix - side / 2) / ss, (iy - side / 2) / ss)
        return d


def draw_static(fr, x, y, d, expr="neutral", **kw):
    """One-off companion without animation state (e.g. thumbnails)."""
    return Mascot(blinks=False).draw(fr, x, y, d, 0.0, expr=expr, **kw)


# ------------------------------------------------------------------------------------------------ hopping

class HopPath:
    """Hops through contact points. points: [(x, y), ...] = positions of the CENTRE at contact (body resting on the
    surface); times: contact times (same length). heights: arc height per hop (px, default 1.2 d).

    state(t) -> (x, y, sx, sy, airborne, since_contact). Before times[0] the mascot sits at points[0]; after the last
    contact it rests at points[-1]. Contact squash ~0.12 s, flight stretch from vertical speed.
    """

    def __init__(self, points, times, d, heights=None, squash=0.32):
        assert len(points) == len(times) >= 1
        self.p, self.t, self.d = [tuple(p) for p in points], list(times), d
        self.h = list(heights) if heights is not None else [1.2 * d] * (len(points) - 1)
        self.squash = squash

    def contacts(self):
        return list(self.t)

    def state(self, t):
        p, T = self.p, self.t
        if t <= T[0] or len(p) == 1:
            k, since = 0, t - T[0]
            x, y = p[0]
            air = False
        elif t >= T[-1]:
            x, y = p[-1]
            since = t - T[-1]
            air = False
        else:
            i = max(j for j in range(len(T) - 1) if T[j] <= t)
            u = (t - T[i]) / (T[i + 1] - T[i])
            (x0, y0), (x1, y1) = p[i], p[i + 1]
            x = x0 + (x1 - x0) * u
            y = y0 + (y1 - y0) * u - 4 * self.h[i] * u * (1 - u)
            since = t - T[i]
            air = True
            # flight stretch from vertical speed (normalised)
            vy = ((y1 - y0) - 4 * self.h[i] * (1 - 2 * u)) / max(1e-6, self.h[i] * 4)
            st = min(0.18, 0.18 * abs(vy))
            sx, sy = 1 - st * 0.6, 1 + st
            # land squash wins in the first 0.12 s after a contact
            if since < 0.12:
                q = self._squash(since)
                sx, sy = sx * (1 + q), sy * (1 - q)
            return x, y, sx, sy, air, since
        q = self._squash(since) if since >= 0 else 0.0
        return x, y, 1 + q, 1 - q, air, since

    def _squash(self, since):
        if since < 0 or since > 0.3:
            return 0.0
        return self.squash * math.exp(-since / 0.05) * math.cos(since * 28)
