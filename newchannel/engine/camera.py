"""Breathing camera: world px -> screen px, with slow push, small drift, eased moves, follow, and cuts.

Rules it enforces (README section 7):
* every setup breathes: a slow push of 2-3 % over the setup (direction alternates per setup), plus a drift of at most
  1.5 % of the frame on each axis, with its own phase per setup (seeded, deterministic);
* big moves only when asked (`Move`), eased (smootherstep by default);
* framing is NEVER reset between two consecutive shots that share a background: they are merged into one camera
  "setup", so push, drift and framing continue through the cut.

World coordinates are the scene's own pixels at zoom 1 (usually the 1920x1080 layout). A framing is
(cx, cy, zoom): the world point shown at the centre of the screen and the magnification.

    track = CameraTrack(W, H, seed=7)
    track.add_setup(t0=0, t1=4.2, frame=(960, 540, 1.0), bg="split")
    track.add_setup(t0=4.2, t1=8, frame=(520, 560, 1.4), bg="ring", moves=[Move(5.0, 6.0, (600, 500, 1.8))])
    cam = track.at(t)          # -> Cam
    x, y = cam.pt(wx, wy); r = cam.s(10)
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Callable, Optional

import numpy as np


def smoother(t):
    t = 0.0 if t < 0 else 1.0 if t > 1 else t
    return t * t * t * (t * (6 * t - 15) + 10)


def ease_in_out_sine(t):
    t = 0.0 if t < 0 else 1.0 if t > 1 else t
    return 0.5 - 0.5 * math.cos(math.pi * t)


EASES = {"smoother": smoother, "sine": ease_in_out_sine, "linear": lambda t: max(0.0, min(1.0, t))}


@dataclass
class Cam:
    """A resolved camera for one frame."""
    cx: float
    cy: float
    zoom: float
    W: int = 1920
    H: int = 1080

    def pt(self, x, y):
        return (x - self.cx) * self.zoom + self.W / 2, (y - self.cy) * self.zoom + self.H / 2

    def pts(self, pts):
        return [self.pt(x, y) for x, y in pts]

    def s(self, r):
        return r * self.zoom

    def inv(self, sx, sy):
        return (sx - self.W / 2) / self.zoom + self.cx, (sy - self.H / 2) / self.zoom + self.cy

    def visible(self, x, y, margin=0):
        X, Y = self.pt(x, y)
        return -margin <= X <= self.W + margin and -margin <= Y <= self.H + margin


@dataclass
class Move:
    """Eased move to a new framing between t0 and t1 (absolute seconds). target = (cx, cy, zoom); None keeps."""
    t0: float
    t1: float
    target: tuple
    ease: str = "smoother"


@dataclass
class Setup:
    t0: float
    t1: float
    frame: tuple                      # (cx, cy, zoom) at t0
    bg: str = ""
    moves: list = field(default_factory=list)
    push: float = 0.025               # fraction of zoom over the setup (sign = direction)
    drift: float = 0.010              # max fraction of frame width/height (<= 0.015)
    phase: float = 0.0
    follow: Optional[Callable] = None  # t -> (x, y) world point to keep near centre (spring-smoothed)
    follow_lag: float = 0.35          # seconds (time constant of the follow spring)
    follow_offset: tuple = (0.0, 0.0)  # world offset of the followed point from screen centre


class CameraTrack:
    MAX_DRIFT = 0.015
    MAX_PUSH = 0.03

    def __init__(self, W=1920, H=1080, seed=7, fps=30):
        self.W, self.H, self.seed, self.fps = W, H, seed, fps
        self.setups: list[Setup] = []
        self._follow_cache: dict = {}

    def add_setup(self, t0, t1, frame, bg="", moves=None, push=None, drift=None, follow=None, follow_lag=0.35,
                  follow_offset=(0.0, 0.0)):
        """Append a setup. If it has the same bg as the previous one, it MERGES: the previous setup is extended and
        this one's framing becomes an eased move (only if it differs), so the framing never resets."""
        k = len(self.setups)
        rng = np.random.default_rng(self.seed * 7919 + k)
        if self.setups and bg and self.setups[-1].bg == bg:
            prev = self.setups[-1]
            prev.t1 = t1
            if frame is not None and tuple(frame) != tuple(self._frame_at(prev, t0)):
                prev.moves.append(Move(t0, t0 + min(1.2, (t1 - t0) * 0.6), tuple(frame)))
            prev.moves.extend(moves or [])
            if follow is not None:
                prev.follow = follow
            return prev
        if push is None:
            push = (0.022 + 0.008 * rng.random()) * (1 if k % 2 == 0 else -1)
        push = max(-self.MAX_PUSH, min(self.MAX_PUSH, push))
        drift = min(self.MAX_DRIFT, 0.006 + 0.006 * rng.random() if drift is None else drift)
        s = Setup(t0, t1, tuple(frame), bg, list(moves or []), push, drift, float(rng.uniform(0, 2 * math.pi)),
                  follow, follow_lag, follow_offset)
        self.setups.append(s)
        return s

    def setup_at(self, t) -> Setup:
        for s in self.setups:
            if s.t0 <= t < s.t1:
                return s
        return self.setups[-1] if t >= self.setups[-1].t1 else self.setups[0]

    @staticmethod
    def _frame_at(s: Setup, t):
        cx, cy, z = s.frame
        for m in sorted(s.moves, key=lambda m: m.t0):
            if t <= m.t0:
                break
            tx, ty, tz = m.target
            tx = cx if tx is None else tx
            ty = cy if ty is None else ty
            tz = z if tz is None else tz
            u = EASES[m.ease]((t - m.t0) / max(1e-6, m.t1 - m.t0))
            cx, cy, z = cx + (tx - cx) * u, cy + (ty - cy) * u, z * (tz / z) ** u
        return cx, cy, z

    def _follow(self, s: Setup, t):
        """Critically damped spring toward follow(t), integrated from the setup start (deterministic per frame)."""
        dt = 1.0 / self.fps
        key = id(s)
        cache = self._follow_cache.setdefault(key, {})
        n = max(0, int(round((t - s.t0) * self.fps)))
        if n in cache:
            return cache[n]
        # resume from the nearest cached step
        k0 = max([k for k in cache if k <= n], default=None)
        if k0 is None:
            x, y = s.follow(s.t0)
            vx = vy = 0.0
            k0 = 0
            cache[0] = (x, y, vx, vy)
        x, y, vx, vy = cache[k0]
        w = 2.0 / max(1e-3, s.follow_lag)
        for k in range(k0 + 1, n + 1):
            tx, ty = s.follow(s.t0 + k * dt)
            ax = w * w * (tx - x) - 2 * w * vx
            ay = w * w * (ty - y) - 2 * w * vy
            vx += ax * dt
            vy += ay * dt
            x += vx * dt
            y += vy * dt
            cache[k] = (x, y, vx, vy)
        return cache[n]

    def at(self, t) -> Cam:
        s = self.setup_at(t)
        cx, cy, z = self._frame_at(s, t)
        if s.follow is not None:
            fx, fy, _, _ = self._follow(s, t)
            cx, cy = fx - s.follow_offset[0], fy - s.follow_offset[1]
        dur = max(1e-6, s.t1 - s.t0)
        u = (t - s.t0) / dur
        z *= 1.0 + s.push * ease_in_out_sine(u)                         # slow push (or pull)
        p = s.phase
        dx = s.drift * self.W * (0.7 * math.sin(2 * math.pi * t / 11.0 + p) + 0.3 * math.sin(2 * math.pi * t / 4.7 + 2 * p))
        dy = s.drift * self.H * (0.7 * math.sin(2 * math.pi * t / 9.0 + 1.3 * p) + 0.3 * math.sin(2 * math.pi * t / 5.3 + p))
        return Cam(cx + dx / z, cy + dy / z, z, self.W, self.H)

    def cuts(self):
        """Times where the picture cuts (setup boundaries)."""
        return [s.t0 for s in self.setups[1:]]
