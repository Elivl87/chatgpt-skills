"""Engine proof: the 20 s phantom-jam test rebuilt with the engine (sim module + word-tied shot list -> video).

Fixes the style test's weaknesses (pilot/sim_test/QC.md):
* fills the frame: ring road left + a LIVE space-time diagram right (every dot is a car at one moment; the jam is the
  dense teal band that slides backwards), plus a live readout inside the ring;
* the companion is big: 56 px in wide shots, 129 px in the hero shot (>= 70 px rule), with blinks and expressions;
* no calm opening: frame 0 is already moving and the brake tap lands on the narrated word "tap" (0.6 s);
* "sped up x3" on screen the whole time the sim runs;
* narration in the channel voice (EN G), every beat tied to its word; wordmark sting at the end + 1 s of air.

    python3 engine/demo/build.py          # voice (if missing) -> render -> QC
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
sys.path.insert(0, str(HERE))

import look as L                    # noqa: E402
import mascot as MS                 # noqa: E402
import sound as S                   # noqa: E402
import wordmark as WMK              # noqa: E402
from camera import Move             # noqa: E402
from timeline import Shot, Timeline, Timings  # noqa: E402
import sim_ring as SIM              # noqa: E402

FPS = 30
VOICE_OFFSET = 0.35
AUDIO = HERE / "audio"

# ---- world layout (px at zoom 1)
RC = (505.0, 560.0)          # ring centre
R = 318.0                    # road centreline radius
ROAD = 58.0
CAR_R = 13.5
MD_WIDE = 56.0               # companion diameter in world px (wide = 56 px on screen, hero = 56 x 2.3)
DIA = (1000.0, 228.0, 1795.0, 880.0)    # space-time diagram plot box x0, y0, x1, y1
TW = 7.0                     # seconds of history shown in the diagram
THETA_TOP = math.pi / 2
STING_SKIP = 0.12            # enter the sting 0.12 s in, so the cut never lands on blank paper


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


class Demo:
    W, H = 1920, 1080

    def __init__(self):
        self.fps = FPS
        T = self.T = Timings.load(AUDIO / "timings.json", VOICE_OFFSET)
        self.t_tap = T.at("tap")
        self.t_count0, self.t_count1 = T.at("Twenty-two"), T.at("drivers", edge="end")
        self.t_and, self.t_jam = T.at("And"), T.at("jam")
        self.t_back = T.at("backwards")
        hero0 = T.at("rolling", after=-0.05)
        hero1 = hero0 + 3.4
        dia1 = hero1 + 2.7
        self.t_sting = dia1 + 3.0
        self.duration = self.t_sting + WMK.DUR - STING_SKIP + 1.1
        self.n_frames = int(round(self.duration * FPS))
        # ---- simulation (tap tied to the word "tap")
        self.run = SIM.simulate(self.duration + 0.5, self.t_tap, FPS, preroll=TW + 0.5)
        run = self.run
        self.tint = smoothstep(4.2, 1.0, run.v)                       # 0 cruising .. 1 stopped
        self.stopped = (run.v < SIM.SLOW_V).sum(1)
        # rotate the world so the braking car sits upper-left at the tap
        k_tap = run.at(int(self.t_tap * FPS))
        self.theta0 = math.radians(142) - 2 * math.pi * run.x[k_tap, SIM.BRAKER] / SIM.L
        # jam centroid (unwrapped metres) per sim sample, for arrows
        w = np.clip((run.v_eq - run.v) / run.v_eq, 0, 1) ** 2
        ph = np.exp(1j * 2 * np.pi * run.x / SIM.L)
        z = (w * ph).sum(1)
        sm = np.zeros(len(z), complex)
        acc = z[0]
        for i, zi in enumerate(z):
            acc = acc * 0.88 + zi * 0.12
            sm[i] = acc
        self.jam_x = np.unwrap(np.angle(sm)) / (2 * np.pi) * SIM.L
        self.jam_mass = w.sum(1)
        # ---- the companion: the car that gets caught ~0.5 s into the hero shot
        best, self.m = 1e9, 1
        for i in range(1, SIM.N):
            for s0, s1 in SIM.stuck_intervals(run, i):
                if s0 > 3.0 and abs(s0 - (hero0 + 0.55)) < best:
                    best, self.m = abs(s0 - (hero0 + 0.55)), i
        self.mascot = MS.Mascot(seed=5, t_end=self.duration)
        self.expr_events = []
        for s0, s1 in SIM.stuck_intervals(run, self.m):
            if s1 < 0:
                continue
            for t, e in ((s0 - 0.45, "surprised"), (s0, "worried"), (s1, "delighted"), (s1 + 1.5, "neutral")):
                self.mascot.set_expr(t, e)
                self.expr_events.append((t, e))
        self.mascot.set_expr(self.t_count1 - 0.35, "curious").set_expr(self.t_and - 0.1, "neutral")
        self.expr_events += [(self.t_count1 - 0.35, "curious")]
        self.expr_events.sort()
        # counting order: from the braker, around the ring
        self.count_t = [self.t_count0 + (self.t_count1 - 0.25 - self.t_count0) * k / (SIM.N - 1) for k in range(SIM.N)]
        # ---- shots
        sh = [
            Shot("wide_tap", 0.0, self.draw_world, "split", (960, 545, 1.0)),
            Shot("ring_count", self.t_count0 - 0.12, self.draw_world, "ring", (RC[0] + 10, RC[1] + 60, 1.22)),
            Shot("wide_jam", self.t_and - 0.12, self.draw_world, "split", (960, 545, 1.0)),
            Shot("hero_mascot", hero0, self.draw_world, "hero", follow=self.mascot_world, zoom=2.3,
                 follow_offset=(-40, 30)),
            Shot("diagram", hero1, self.draw_world, "dia", (1395, 562, 1.14),
                 moves=[Move(hero1 + 0.2, dia1, (1385, 568, 1.19), "sine")]),
            Shot("wide_end", dia1, self.draw_world, "split", (960, 545, 1.0)),
            Shot("sting", self.t_sting, self.draw_sting, "sting", (960, 540, 1.0), push=0.0, drift=0.0),
        ]
        self.tl = Timeline(sh, self.duration, FPS, overlay=self.overlay, seed=11)
        self.sting = None

    # ------------------------------------------------------------------------------------------ geometry
    def ang(self, xm):
        return self.theta0 + 2 * math.pi * xm / SIM.L

    def ring_xy(self, xm, r=R):
        a = self.ang(xm)
        return RC[0] + r * math.cos(a), RC[1] - r * math.sin(a)

    def mascot_world(self, t):
        k = self.run.at(int(round(t * FPS)))
        return self.ring_xy(self.run.x[k, self.m])

    def dia_xy(self, xm, ts, tnow):
        x0, y0, x1, y1 = DIA
        a = (self.ang(xm) - THETA_TOP) % (2 * math.pi) / (2 * math.pi)        # 0 at the top of the ring, CCW
        return x0 + a * (x1 - x0), y1 - (tnow - ts) / TW * (y1 - y0)

    # ------------------------------------------------------------------------------------------ drawing
    def draw_world(self, c, fr):
        cam, t, fi = c.cam, c.t, c.fi
        k = self.run.at(fi)
        z = cam.zoom
        ink_w = max(2.0, 3.0 * min(z, 1.6))
        # -- road
        ro, ri = R + ROAD / 2, R - ROAD / 2
        cx, cy = cam.pt(*RC)
        fr.disc("shade", cx, cy, cam.s(ro + 15), 70)
        fr.disc("shade", cx, cy, cam.s(ro), 0)
        fr.disc("tint", cx, cy, cam.s(ro), 210)
        fr.disc("tint", cx, cy, cam.s(ri), 0)
        fr.ring("ink", cx, cy, cam.s(ro), ink_w)
        fr.ring("ink", cx, cy, cam.s(ri), ink_w)
        for dx in (-5, 0, 5):                       # start line at the top
            a = (RC[0] + dx, RC[1] - ro + 8)
            b = (RC[0] + dx, RC[1] - ri - 8)
            fr.line("ink", [cam.pt(*a), cam.pt(*b)], max(1.2, 1.6 * z), 150)
        # -- the diagram
        self.draw_diagram(c, fr, k)
        # -- readout inside the ring
        self.draw_readout(c, fr, k)
        # -- cars
        n = SIM.N
        pos = [self.ring_xy(self.run.x[k, i]) for i in range(n)]
        for i in range(n):
            if i == self.m:
                continue
            x, y = cam.pt(pos[i][0] + 3.5, pos[i][1] + 4.5)
            fr.disc("shade", x, y, cam.s(CAR_R), 110)
        # shadows never print on a body: knock the shade plate out under every car and the companion
        for i in range(n):
            x, y = cam.pt(*pos[i])
            fr.disc("shade", x, y, cam.s(MD_WIDE / 2 + 1.5 if i == self.m else CAR_R + 1.0), 0)
        for i in range(n):
            if i == self.m:
                continue
            x, y = cam.pt(*pos[i])
            tn = float(self.tint[k, i])
            r = cam.s(CAR_R)
            if tn < 0.02:
                fr.disc("ink", x, y, r)
            else:
                fr.disc("second", x, y, r)
                core = r * (1 - tn) ** 0.8
                if core > 0.8:
                    fr.disc("ink", x, y, core)
            # counting highlight
            if self.t_count0 - 0.1 <= t <= self.t_count1 + 0.4:
                order = (SIM.BRAKER - i) % n            # count backwards from the braker = along the queue
                tk = self.count_t[order]
                if 0 <= t - tk < 0.28:
                    p = (t - tk) / 0.28
                    fr.ring("ink", x, y, r + cam.s(5 + 9 * p), max(1.5, 2.5 * z), 255 * (1 - p))
        # -- the tap: pulsing ring on the braker + small label
        tb = t - self.t_tap
        if -0.15 <= tb <= 2.6:
            x, y = cam.pt(*pos[SIM.BRAKER])
            a = L.smooth((tb + 0.15) / 0.2) * (1 - L.smooth((t - (self.t_count0 - 0.35)) / 0.2))
            pulse = 1 + 0.25 * math.sin(max(0, tb) * 2 * math.pi * 1.7) * math.exp(-max(0, tb) * 0.8)
            fr.ring("ink", x, y, cam.s((CAR_R + 11) * pulse), max(2, 3 * z), 255 * a)
            if c.shot.bg != "hero":
                ccx, ccy = cam.pt(*RC)
                ux, uy = x - ccx, y - ccy
                nn = math.hypot(ux, uy) or 1.0
                ux, uy = ux / nn, uy / nn
                size = 30 * min(z, 1.4)
                tw, _ = fr.text_size("brake", "label_bold", size)
                lx, ly = x + ux * cam.s(70), y + uy * cam.s(70) - 14
                right = ux < 0                                    # text sits on the outer side of the dot
                if right:
                    lx = max(lx, 28 + tw)
                bb = fr.text("ink", (lx, ly), "brake", "label_bold", size, anchor="rm" if right else "lm", v=255 * a)
                sx_ = bb[2] + 8 if right else bb[0] - 8
                r_ = cam.s(CAR_R + 15)
                fr.line("ink", [(sx_, ly), (x + ux * r_, y + uy * r_)], 2.2, 230 * a)
        # -- backwards arrow on the ring (after "backwards")
        aa = L.smooth((t - (self.t_back - 0.25)) / 0.4) * (1 - L.smooth((t - (self.t_sting - 0.6)) / 0.4))
        if aa > 0 and self.jam_mass[k] > 0.5:
            self.draw_ring_arrows(cam, fr, k, aa)
        # -- the companion
        mx, my = cam.pt(*pos[self.m])
        a = self.ang(self.run.x[k, self.m])
        head = (-math.sin(a), -math.cos(a))
        e, since, _ = self.mascot.expr_at(t)
        look = (head[0] * 0.12, head[1] * 0.10)
        if e == "curious":
            look = (0.02, 0.02)                         # looks at us when counted
        d = MD_WIDE * z
        sx, sy = 1.0, 1.0
        if self.tint[k, self.m] > 0.5:                   # squeezed in the queue
            sx, sy = 1.0 - 0.06 * self.tint[k, self.m], 1.0 + 0.04 * self.tint[k, self.m]
        fr.disc("shade", mx + cam.s(4), my + cam.s(5), d / 2, 110)
        fr.disc("shade", mx, my, d / 2 + 2, 0)
        self.mascot.draw(fr, mx, my, d, t, look=look, sx=sx, sy=sy, ground=False, hero=(c.shot.bg == "hero"))

    def draw_ring_arrows(self, cam, fr, k, a):
        ph = self.ang(self.jam_x[k])
        ra = R + ROAD / 2 + 30
        a0, a1 = ph + 0.18, ph - 0.62                  # clockwise = backwards
        pts = [cam.pt(RC[0] + ra * math.cos(a0 + (a1 - a0) * j / 30), RC[1] - ra * math.sin(a0 + (a1 - a0) * j / 30))
               for j in range(31)]
        fr.arrow("second", pts, max(3.0, 4.5 * cam.zoom ** 0.6), v=255 * a)
        ri = R - ROAD / 2 - 22
        b0, b1 = ph - 0.30, ph + 0.30
        pts2 = [cam.pt(RC[0] + ri * math.cos(b0 + (b1 - b0) * j / 24), RC[1] - ri * math.sin(b0 + (b1 - b0) * j / 24))
                for j in range(25)]
        fr.arrow("ink", pts2, max(2.0, 3.0 * cam.zoom ** 0.6), v=200 * a)
        if cam.zoom > 1.6:                             # hero shot: words next to the arrows
            p = pts[18]
            nx, ny = p[0] - cam.pt(*RC)[0], p[1] - cam.pt(*RC)[1]
            nn = math.hypot(nx, ny) or 1
            q = (p[0] + nx / nn * 70, p[1] + ny / nn * 70)
            fr.text("second", q, "jam", "label_bold", 40, anchor="mm", v=255 * a)
            p2 = pts2[12]
            q2 = (p2[0] - nx / nn * 60, p2[1] - ny / nn * 60)
            fr.text("ink", q2, "cars", "label_bold", 34, anchor="mm", v=230 * a)

    def draw_readout(self, c, fr, k):
        cam, t = c.cam, c.t
        z = cam.zoom
        cx, cy = cam.pt(RC[0], RC[1] - 12)
        if c.shot.bg == "hero":                        # close-up: the readout moves into the empty paper, screen space
            a = L.smooth(c.lt / 0.3)
            nst = int(self.stopped[k])
            fr.text("second", (330, 560), f"{nst}", "display", 190, anchor="ms", v=255 * a)
            fr.text("ink", (330, 600), "cars stopped", "label", 36, anchor="ma", v=255 * a)
            return
        if not cam.visible(RC[0], RC[1], 200) or c.shot.bg == "dia":
            return
        big = 132 * z
        small = 30 * z
        if t < self.t_count0 - 0.12:
            v = float(self.run.v[k].mean() * 3.6)
            fr.text("ink", (cx, cy), f"{v:.0f}", "display", big, anchor="ms")
            fr.text("ink", (cx, cy + 24 * z), "km/h average", "label", small, anchor="ma")
        elif t < self.t_and - 0.12:
            nshow = sum(1 for tk in self.count_t if t >= tk)
            fr.text("ink", (cx, cy), f"{max(1, nshow)}", "display", big, anchor="ms")
            fr.text("ink", (cx, cy + 24 * z), "drivers", "label", small, anchor="ma")
        else:
            nst = int(self.stopped[k])
            a = L.smooth((t - (self.t_and - 0.12)) / 0.25)
            fr.text("second", (cx, cy), f"{nst}", "display", big, anchor="ms", v=255 * a)
            fr.text("ink", (cx, cy + 24 * z), "stopped", "label", small, anchor="ma", v=255 * a)
            v = float(self.run.v[k].mean() * 3.6)
            fr.text("ink", (cx, cy + 64 * z), f"avg {v:.0f} km/h", "label", small * 0.85, anchor="ma", v=200 * a)

    def draw_diagram(self, c, fr, k):
        cam, t = c.cam, c.t
        x0, y0, x1, y1 = DIA
        if not (cam.visible(x0, y0, 400) or cam.visible(x1, y1, 400)):
            return
        z = cam.zoom
        p0, p1 = cam.pt(x0 - 24, y0 - 24), cam.pt(x1 + 24, y1 + 18)
        fr.rect("tint", p0[0], p0[1], p1[0], p1[1], 105)
        # axes
        ax = cam.pt(x0 - 44, y0 - 4)
        ay = cam.pt(x0 - 44, y1 + 4)
        fr.arrow("ink", [ax, ay], max(2.0, 2.6 * z))
        fr.text("ink", cam.pt(x0 - 44, y0 - 18), "time", "label_bold", 26 * z, anchor="ms")
        nl0, nl1 = cam.pt(x0 - 24, y1 + 18), cam.pt(x1 + 24, y1 + 18)
        fr.line("ink", [nl0, nl1], max(2.0, 2.6 * z))
        fr.text("ink", cam.pt(x1 + 24, y1 + 56), "now", "label_bold", 26 * z, anchor="rs")
        fr.text("ink", cam.pt(x0 - 24, y1 + 56), "position on the ring  →", "label", 26 * z, anchor="ls")
        fr.text("ink", cam.pt(x1 + 24, y0 - 46), "every dot = one car at one moment", "label", 24 * z, anchor="rs",
                v=210)
        # dots: sample every 2nd frame (aligned to absolute frame parity so dots don't shimmer)
        run = self.run
        kmin = run.at(int(round((t - TW) * FPS)))
        start = k - (k % 2)
        r_ink, r_sec, r_m = cam.s(2.7), cam.s(3.5), cam.s(4.0)
        for idx in range(start, kmin - 1, -2):
            ts = run.t_of(idx)
            if t - ts > TW:
                break
            for i in range(SIM.N):
                x, y = self.dia_xy(run.x[idx, i], ts, t)
                X, Y = cam.pt(x, y)
                if X < -10 or X > fr.w + 10 or Y < -10 or Y > fr.h + 10:
                    continue
                if self.tint[idx, i] > 0.5:
                    fr.disc("second", X, Y, r_m if i == self.m else r_sec)
                else:
                    fr.disc("ink", X, Y, r_m if i == self.m else r_ink)
        # "now" markers on the time axis: the companion's column
        # jam annotation
        ja = L.smooth((t - (self.t_jam - 0.1)) / 0.35) * (1 - L.smooth((t - (self.t_sting - 0.6)) / 0.4))
        if ja > 0:
            pts = []
            for dt in np.arange(3.0, 0.15, -0.15):
                idx = run.at(int(round((t - dt) * FPS)))
                if self.jam_mass[idx] < 0.5:
                    pts = []
                    continue
                x, y = self.dia_xy(self.jam_x[idx], t - dt, t)
                if pts and abs(x - pts[-1][0]) > (x1 - x0) / 2:      # wrapped around: restart
                    pts = []
                pts.append((x + 34, y))
            if len(pts) >= 4:
                spts = [cam.pt(*p) for p in pts]
                fr.arrow("second", spts, max(3.0, 4.2 * z ** 0.7), v=255 * ja)
                lab = "jam" if c.shot.name != "diagram" else "the jam moves backwards"
                tx, ty = spts[0]
                fr.label("second", (tx + 14 * z, ty - 8 * z), lab, "label_bold", 30 * z, anchor="ls", v=255 * ja)
        # companion's trajectory: "cars move forwards" (diagram close-up only)
        if c.shot.name == "diagram":
            ca = L.smooth(c.lt / 0.5)
            pts = []
            for dt in np.arange(2.2, 0.0, -0.1):
                idx = run.at(int(round((t - dt) * FPS)))
                x, y = self.dia_xy(run.x[idx, self.m], t - dt, t)
                if pts and abs(x - pts[-1][0]) > (x1 - x0) / 2:
                    pts = []
                pts.append((x - 30, y))
            if len(pts) >= 4:
                spts = [cam.pt(*p) for p in pts]
                fr.arrow("ink", spts, max(2.5, 3.2 * z ** 0.7), v=230 * ca)
                bx, by = spts[0]
                fr.label("ink", (bx - 12 * z, by - 8 * z), "the cars move forwards", "label_bold", 28 * z, anchor="rs",
                         v=230 * ca)

    def draw_sting(self, c, fr):
        if self.sting is None:
            self.sting = WMK.Sting("en")
        self.sting.draw(fr, c.t - self.t_sting + STING_SKIP, tagline_at=WMK.DUR + 0.05)

    def overlay(self, c, fr):
        if c.shot.name == "sting":
            return
        x, y = 92, 74
        s = 1.0
        fr.polygon("ink", [(x, y - 13 * s), (x + 17 * s, y), (x, y + 13 * s)])
        fr.polygon("ink", [(x + 17 * s, y - 13 * s), (x + 34 * s, y), (x + 17 * s, y + 13 * s)])
        fr.text("ink", (x + 48, y + 1), "sped up ×3", "label_bold", 32, anchor="lm")

    def frame(self, fi):
        return self.tl.render(fi)

    # ------------------------------------------------------------------------------------------ sound
    def pan_of(self, t, wx, wy):
        cam = self.tl.camera.at(t)
        return float(np.clip((cam.pt(wx, wy)[0] - 960) / 1000, -0.85, 0.85))

    def audio(self, path):
        run, n = self.run, SIM.N
        N = int(round(self.duration * S.SR))
        sfx, music = S.Bus(N), S.Bus(N)
        end_sim = self.t_sting
        # lap plucks: a car crossing the start line (top of the ring) plucks its note -> steady pulse breaks in the jam
        k_lo, k_hi = run.at(0), run.at(int(end_sim * FPS))
        for i in range(n):
            th = (self.theta0 + 2 * np.pi * run.x[k_lo:k_hi, i] / SIM.L - THETA_TOP) / (2 * np.pi)
            lap = np.floor(th)
            for j in np.flatnonzero(np.diff(lap) > 0):
                idx = k_lo + j
                frac = (lap[j + 1] - th[j]) / (th[j + 1] - th[j])
                t0 = run.t_of(idx) + frac / FPS
                vel = min(1.0, run.v[idx, i] / run.v_eq)
                if i == self.m:
                    sig = S.pluck(S.note("C6"), 0.6, 0.2) * 0.9 + S.pluck(S.note("G6"), 0.6, 0.08) * 0.25
                else:
                    sig = S.pluck(S.PENTA[(i * 3) % len(S.PENTA)], 0.5, 0.14)
                sfx.add(t0, sig, self.pan_of(t0, RC[0], RC[1] - R), 0.15 * (0.35 + 0.65 * vel))
        # brake ticks
        A = run.a
        last = np.full(n, -9.0)
        for idx in range(k_lo + 1, k_hi):
            for i in np.flatnonzero((A[idx] < -1.0) & (A[idx - 1] >= -1.0)):
                t0 = run.t_of(idx)
                if t0 - last[i] < 0.45:
                    continue
                last[i] = t0
                st = min(1.0, -A[idx, i] / 3.0)
                x, y = self.ring_xy(run.x[idx, i])
                sfx.add(t0, S.tick(2000 + 90 * (i % 7), i), self.pan_of(t0, x, y), 0.10 + 0.12 * st)
        # the tap
        xb, yb = self.ring_xy(run.x[run.at(int(self.t_tap * FPS)), SIM.BRAKER])
        sfx.add(self.t_tap, S.thunk(), self.pan_of(self.t_tap, xb, yb), 0.42)
        # counting: 22 rising plucks
        for kk, tk in enumerate(self.count_t):
            f = S.PENTA[kk % 7] * (2 ** (kk // 7)) / 2
            sfx.add(tk, S.pluck(f, 0.35, 0.09, 0.5), 0.0, 0.16)
        # hum follows the number of stopped cars
        t = np.arange(N) / S.SR
        idxs = np.arange(k_lo, k_hi)
        stuck = self.stopped[idxs].astype(float)
        sm = np.zeros_like(stuck)
        acc = 0.0
        for j, v in enumerate(stuck):
            acc += (v - acc) * 0.06
            sm[j] = acc
        amount = np.interp(t, (idxs - run.k0) / FPS, sm, right=0.0)
        amount *= np.clip((end_sim - t) / 0.5, 0, 1)
        h = S.hum(N, S.note("E2"), amount)
        sfx.buf[:, 0] += h * 0.30
        sfx.buf[:, 1] += h * 0.28
        # companion chirps
        for te, e in self.expr_events:
            if not (0 <= te < end_sim):
                continue
            x, y = self.mascot_world(te)
            p = self.pan_of(te, x, y)
            if e == "surprised":
                sfx.add(te, S.glide(620, 1180, 0.16, 0.07), p, 0.22)
            elif e == "worried":
                sfx.add(te, S.glide(420, 300, 0.35, 0.18, 0.5), p, 0.16)
            elif e == "delighted":
                sfx.add(te, S.pluck(S.note("D6"), 0.3, 0.08), p, 0.16)
                sfx.add(te + 0.09, S.pluck(S.note("G6"), 0.4, 0.12), p, 0.16)
            elif e == "curious":
                sfx.add(te, S.glide(700, 980, 0.2, 0.1), p, 0.16)
        # cuts: soft air on each camera cut, a pop into the sting
        for tc in self.tl.cuts():
            if abs(tc - self.t_sting) < 1e-3:
                sfx.add(tc - 0.25, S.whoosh(0.4, 500, 4000, 9), 0.0, 0.10)
            else:
                sfx.add(tc - 0.18, S.whoosh(0.36, 300, 2500, int(tc * 10)), 0.0, 0.05)
        # the sting
        sting = WMK.Sting("en")
        S.sting_sfx(sfx, sting.events, drop_t=0.0, offset=self.t_sting - STING_SKIP, gain=1.6)
        # music bed: quiet G pad that lifts at the sting and fades after the landing
        land = self.t_sting - STING_SKIP + sting.events[-1]["t"]
        bed = S.pad(N, ("G3", "D4", "G4", "B4"))
        env = np.clip(t / 0.6, 0, 1) * np.clip((land + 0.8 - t) / 0.8, 0, 1)
        music.buf[:, 0] += bed * env
        music.buf[:, 1] += bed * env
        voice = S.load_audio(AUDIO / "narration.wav", channels=1)[:, 0]
        mixed = S.mix(voice=voice, music=music.buf, sfx=sfx.buf, voice_offset=VOICE_OFFSET, n=N)
        return S.master(mixed, path, fade_out=0.4)


def episode():
    return Demo()


if __name__ == "__main__":
    d = Demo()
    print(d.tl.report())
    print("companion = car", d.m, " tap at %.2f s" % d.t_tap, " duration %.2f s" % d.duration)
