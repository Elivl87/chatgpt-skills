"""Phantom traffic jam on a ring road (Sugiyama et al. 2008 style), Intelligent Driver Model.

Deterministic: no randomness in the dynamics; the only "noise" is the single scripted brake tap.
    simulate() -> dict of arrays sampled at every video frame (positions, speeds, accelerations, events)

Units: metres, seconds (sim time). Video time = sim time / TIME_SCALE.
"""
import numpy as np

# ---- experiment (Sugiyama 2008: 22 cars, 230 m circuit) ----
N = 22                 # cars
L = 230.0              # ring circumference [m]
CAR = 4.5              # car length [m]

# ---- IDM parameters (tuned so uniform flow ~25 km/h is string-unstable) ----
V0 = 15.0              # desired speed [m/s]
T_HW = 0.7             # safe time headway [s]
A_MAX = 1.5            # max acceleration [m/s^2]
B_CMF = 1.5            # comfortable deceleration [m/s^2]
S0 = 1.5               # jam distance [m]
DELTA = 4

# ---- video mapping ----
FPS = 30
DUR = 20.0             # video seconds
TIME_SCALE = 2.4       # sim seconds per video second
DT = 0.02              # integration step [s]

# ---- the break ----
BRAKER = 0             # index of the car that taps the brakes
TAP_VIDEO_T = 4.0      # video second the tap starts
TAP_SIM_DUR = 2.2      # sim seconds of braking
TAP_DECEL = 4.0        # m/s^2 hard tap (clamped at v >= 0)
HARD_BRAKE = 1.0       # m/s^2: decel above this counts as a "brake" event (sound tick)
SLOW_V = 2.0           # m/s: below this a car is "in the jam"
MASCOT = 13            # caught at ~8.6 s, free ~10.2 s, caught again ~16.5 s, free ~18.6 s


def idm_acc(x, v):
    lead = np.roll(np.arange(N), -1)            # car i follows car i+1 (higher x)
    gap = (x[lead] - x) % L - CAR
    dv = v - v[lead]
    s_star = S0 + np.maximum(0.0, v * T_HW + v * dv / (2 * np.sqrt(A_MAX * B_CMF)))
    return A_MAX * (1 - (v / V0) ** DELTA - (s_star / np.maximum(gap, 0.1)) ** 2), gap


def equilibrium_speed():
    gap = L / N - CAR
    lo, hi = 0.0, V0
    for _ in range(60):
        v = (lo + hi) / 2
        f = 1 - (v / V0) ** DELTA - ((S0 + v * T_HW) / gap) ** 2
        lo, hi = (v, hi) if f > 0 else (lo, v)
    return v


def simulate():
    n_frames = int(round(DUR * FPS))
    v_eq = equilibrium_speed()
    x = np.arange(N) * (L / N)                  # perfectly uniform start
    v = np.full(N, v_eq)
    steps_per_frame = int(round(TIME_SCALE / FPS / DT))
    tap0 = TAP_VIDEO_T * TIME_SCALE
    X = np.zeros((n_frames, N)); V = np.zeros_like(X); A = np.zeros_like(X)
    t = 0.0
    for f in range(n_frames):
        a_frame = np.zeros(N)
        for _ in range(steps_per_frame):
            a, gap = idm_acc(x, v)
            if tap0 <= t < tap0 + TAP_SIM_DUR:
                a[BRAKER] = min(a[BRAKER], -TAP_DECEL)
            v_new = np.maximum(v + a * DT, 0.0)
            x = x + (v + v_new) / 2 * DT
            a_eff = (v_new - v) / DT
            v = v_new
            a_frame = np.minimum(a_frame, a_eff)
            t += DT
        X[f], V[f], A[f] = x, v, a_frame        # A = strongest decel within the frame
    return dict(x=X, v=V, a=A, v_eq=v_eq, fps=FPS, n=N, L=L, braker=BRAKER,
                tap_t=TAP_VIDEO_T, mascot=MASCOT, tap_end=TAP_VIDEO_T + TAP_SIM_DUR / TIME_SCALE,
                time_scale=TIME_SCALE, slow_v=SLOW_V, hard=HARD_BRAKE)


NEUTRAL, SURPRISED, ANNOYED, RELIEVED = 0, 1, 2, 3
EXPR_NAMES = ['neutral', 'surprised', 'annoyed', 'relieved']


def mascot_expressions(s, m=None):
    """Per-frame expression of the mascot: neutral -> surprised (just before it gets stuck) -> annoyed (stuck)
    -> relieved (just freed) -> neutral. Hysteresis on speed so it never flickers."""
    m = s['mascot'] if m is None else m
    v = s['v'][:, m]; fps = s['fps']; n = len(v)
    stuck = np.zeros(n, bool); on = False
    for f in range(n):
        on = (v[f] < 1.6) if not on else (v[f] < 2.6)
        stuck[f] = on
    e = np.full(n, NEUTRAL)
    edges = np.flatnonzero(np.diff(stuck.astype(int))) + 1
    starts = [f for f in edges if stuck[f]]; ends = [f for f in edges if not stuck[f]]
    for f0 in starts:
        e[max(0, f0 - int(0.7 * fps)):f0] = SURPRISED
    for f1 in ends:
        e[f1:min(n, f1 + int(2.2 * fps))] = RELIEVED
    e[stuck] = ANNOYED
    return e


if __name__ == '__main__':
    s = simulate()
    V = s['v']
    print('v_eq %.2f m/s (%.0f km/h)' % (s['v_eq'], s['v_eq'] * 3.6))
    for sec in range(0, 20):
        f = sec * FPS
        pass
    e = mascot_expressions(s)
    ch = np.flatnonzero(np.diff(e)) + 1
    print('mascot:', ', '.join('%.2fs %s' % (f / FPS, EXPR_NAMES[e[f]]) for f in ch))
    for sec in range(0, 20):
        f = sec * FPS
        print('%2ds  min %.2f  max %.2f  jam %2d' % (sec, V[f].min(), V[f].max(), (V[f] < SLOW_V).sum()))
