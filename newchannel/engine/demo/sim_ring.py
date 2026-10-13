"""Phantom jam on a ring road (Sugiyama et al. 2008 setup: 22 cars, 230 m), Intelligent Driver Model.

Same model as pilot/sim_test/sim.py, reorganised for the engine: the brake tap is a parameter (the demo ties it to the
narrated word "tap"), the run has a pre-roll so the space-time diagram is already full on frame 0, and the clock is
sped up x TIME_SCALE (said on screen). Deterministic: no randomness at all; the scripted tap is the only disturbance.

    s = simulate(duration=18.0, tap_t=0.6, fps=30, preroll=7.0)
    s.x[k], s.v[k], s.a[k]   for video frame index k (k may be negative down to -preroll*fps): use s.at(k)
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np

N, L, CAR = 22, 230.0, 4.5
V0, T_HW, A_MAX, B_CMF, S0, DELTA = 15.0, 0.7, 1.5, 1.5, 1.5, 4      # string-unstable at ~29 km/h
TIME_SCALE = 3.0           # sim seconds per video second (shown on screen as "sped up x3")
DT = 0.02
TAP_SIM_DUR, TAP_DECEL = 2.2, 4.0
SLOW_V = 2.0               # m/s: "stopped / in the jam"
BRAKER = 0


def idm_acc(x, v):
    lead = np.roll(np.arange(N), -1)
    gap = (x[lead] - x) % L - CAR
    dv = v - v[lead]
    s_star = S0 + np.maximum(0.0, v * T_HW + v * dv / (2 * np.sqrt(A_MAX * B_CMF)))
    return A_MAX * (1 - (v / V0) ** DELTA - (s_star / np.maximum(gap, 0.1)) ** 2)


def equilibrium_speed():
    gap = L / N - CAR
    lo, hi = 0.0, V0
    for _ in range(60):
        v = (lo + hi) / 2
        f = 1 - (v / V0) ** DELTA - ((S0 + v * T_HW) / gap) ** 2
        lo, hi = (v, hi) if f > 0 else (lo, v)
    return v


@dataclass
class Run:
    x: np.ndarray          # (frames, N) unwrapped positions [m]
    v: np.ndarray          # speeds [m/s]
    a: np.ndarray          # strongest acceleration within the frame [m/s^2]
    k0: int                # array index of video frame 0
    fps: int
    v_eq: float
    tap_t: float

    def at(self, k):
        """Array index for video frame k (clamped)."""
        return int(min(max(k + self.k0, 0), len(self.x) - 1))

    def t_of(self, idx):
        return (idx - self.k0) / self.fps


def simulate(duration, tap_t, fps=30, preroll=7.0):
    n_pre = int(round(preroll * fps))
    n = n_pre + int(round(duration * fps)) + 2
    v_eq = equilibrium_speed()
    x = np.arange(N) * (L / N)
    v = np.full(N, v_eq)
    spf = int(round(TIME_SCALE / fps / DT))
    tap0 = (tap_t + preroll) * TIME_SCALE
    X = np.zeros((n, N))
    V = np.zeros_like(X)
    A = np.zeros_like(X)
    t = 0.0
    for f in range(n):
        af = np.zeros(N)
        for _ in range(spf):
            a = idm_acc(x, v)
            if tap0 <= t < tap0 + TAP_SIM_DUR:
                a[BRAKER] = min(a[BRAKER], -TAP_DECEL)
            vn = np.maximum(v + a * DT, 0.0)
            x = x + (v + vn) / 2 * DT
            af = np.minimum(af, (vn - v) / DT)
            v = vn
            t += DT
        X[f], V[f], A[f] = x, v, af
    return Run(X, V, A, n_pre, fps, v_eq, tap_t)


def stuck_intervals(run: Run, i, on=1.6, off=2.6):
    """[(t_start, t_end)] video seconds when car i is stuck (hysteresis, never flickers)."""
    out, st, s0 = [], False, None
    for idx in range(len(run.v)):
        vv = run.v[idx, i]
        if not st and vv < on:
            st, s0 = True, run.t_of(idx)
        elif st and vv > off:
            st = False
            out.append((s0, run.t_of(idx)))
    if st:
        out.append((s0, run.t_of(len(run.v) - 1)))
    return out


if __name__ == "__main__":
    r = simulate(18.0, 0.63)
    print("v_eq %.2f m/s = %.0f km/h" % (r.v_eq, r.v_eq * 3.6))
    for i in range(N):
        print(i, [(round(a, 2), round(b, 2)) for a, b in stuck_intervals(r, i) if b > 0])
    for s in range(0, 18):
        k = r.at(s * 30)
        print("%2ds stopped %2d  min %.1f" % (s, (r.v[k] < SLOW_V).sum(), r.v[k].min()))
