"""The animated wordmark sting (2.5 s): the companion drops in, bounces along the name and lands as its last dot.

EN "Ten Thousand Dots."  -> bounce on the T of "Thousand", on the D of "Dots", lands as the FULL STOP.
ES "Diez Mil Puntos"     -> bounce on the plain i-dot of "Diez", on the M of "Mil", lands on the i stem of "Mil" and
                            rebounds up into its floating TITTLE position.

The path is brand's own (brand/src/build_brand.py: `_contacts`, `_path`, `_seg_pos`; config in brand_config.json),
and the 8 storyboard keyframes are the timing anchors (f06 drop, f14 first bounce, f22 hop, f30 second bounce, f37 aim,
f42 impact, f47 rebound, f60 settle, at 24 fps). Expressions follow the storyboard: surprised -> worried -> delighted
-> laughing -> curious -> surprised -> curious -> wink. The dotted trail is second ink; ticks mark each contact.

The three contacts are the three notes of the channel motif (sound.sting_motif); `Sting.events` gives their times.

    st = Sting("en")
    st.draw(frame, t)              # t in seconds from the sting start; holds (wink, blinks) after 2.5 s
    python3 wordmark.py            # renders demo/wordmark_en.mp4 and demo/wordmark_es.mp4 (with the motif)
"""
from __future__ import annotations

import json
import math
from functools import lru_cache

import numpy as np
from PIL import Image, ImageChops

import look as L
import mascot as MS
from brandkit import wordmark as WM  # noqa: E402  (on sys.path via look)
import build_brand as BB  # noqa: E402  (brand/src; read-only reuse of the storyboard path)

CFG = json.loads((L.BRAND / "src" / "brand_config.json").read_text())
NAMES = {n["lang"].split("-")[0]: n for n in CFG["names"]}
DUR = 2.5
# storyboard keyframes: (segment, t-in-segment, frame@24fps, expression)   (build_brand.build_storyboards)
_KEYS = [(0, 0.00, 0, "surprised"), (0, 0.45, 6, "surprised"), (1, 0.00, 14, "worried"), (1, 0.50, 22, "delighted"),
         (2, 0.00, 30, "laughing"), ("land", 0.70, 37, "curious"), ("last", 0.00, 42, "surprised"),
         ("last", 0.50, 47, "curious"), ("last", 1.00, 60, "wink")]
_SQUASH = {14: 0.30, 30: 0.28, 42: 0.36}      # contact frame -> squash amount


@lru_cache(maxsize=4)
def _layout(lang, ss, width):
    name = NAMES[lang]
    spec = CFG["fonts"]["display"]
    path = (L.BRAND / "src" / spec["path"]).resolve()
    # fit the EN name to `width`, then use the same type size for every language (brand banners do the same)
    ref = NAMES["en"]

    def lay_at(n, size):
        f = L.ImageFont.truetype(str(path), int(size))
        f.set_variation_by_axes(spec["axes"])
        return WM.layout([n["text"]], f, n["anchor"])

    probe = lay_at(ref, 200)
    x0, _, x1, _ = WM.crop_to_content(probe, 0)
    size = 200 * width * ss / (x1 - x0)
    return name, lay_at(name, size)


class Sting:
    def __init__(self, lang="en", W=1920, H=1080, ss=2, center=(960, 570), width=1700, seed=11):
        self.lang, self.W, self.H, self.ss = lang, W, H, ss
        name, lay = _layout(lang, ss, width)
        self.name, self.lay = name, lay
        x0, y0, x1, y1 = WM.crop_to_content(lay, 0)
        # layout offset (plate px) so the content box is centred on `center`
        self.ox = int(center[0] * ss - (x0 + x1) / 2)
        self.oy = int(center[1] * ss - (y0 + y1) / 2)
        self.d = lay.mascot_d                                        # plate px
        contacts, rest = BB._contacts(lay, name, self.ox, self.oy)
        stem = None
        if name["anchor"] != "period":
            stem = (rest[0], lay.surface + self.oy - self.d / 2)
        segs = BB._path(contacts, rest, self.d, stem)
        k, a, b, hgt = segs[0]
        segs[0] = (k, (a[0], -1.3 * self.d), b, hgt)                 # drop in from above the frame
        self.segs = segs
        n = len(segs)
        self.keys = []
        for si, tt, f24, expr in _KEYS:
            si = n - 2 if si == "land" else n - 1 if si == "last" else si
            self.keys.append((si + tt, f24 / 24.0, expr))
        self.contact_t = [f / 24.0 for f in sorted(_SQUASH)]
        self.events = [{"t": t, "kind": k} for t, k in zip(self.contact_t, ("bounce1", "bounce2", "land"))]
        self.mascot = MS.Mascot(seed=seed, t_end=60)
        for _, t, expr in self.keys:
            self.mascot.set_expr(t - 0.05 if t > 0 else -1, expr)
        self.mascot.set_expr(DUR + 0.75, "neutral")                  # after the wink, alive with blinks
        self._ink = Image.fromarray((np.clip(lay.ink, 0, 1) * 255 + 0.5).astype(np.uint8), "L")

    # -- path evaluation (plate px)
    def _u(self, t):
        ks = self.keys
        if t <= ks[0][1]:
            return ks[0][0]
        for (u0, t0, _), (u1, t1, _) in zip(ks[:-1], ks[1:]):
            if t <= t1:
                return u0 + (u1 - u0) * (t - t0) / (t1 - t0)
        return ks[-1][0]

    def _pos(self, u):
        n = len(self.segs)
        si = min(n - 1, int(math.floor(u)))
        return BB._seg_pos(self.segs[si], min(1.0, u - si))

    def state(self, t):
        """-> (cx, cy, sx, sy) of the companion in plate px (centre, before ground correction)."""
        u = self._u(t)
        x, y = self._pos(u)
        x2, y2 = self._pos(self._u(t + 1 / 60))
        vy = (y2 - y) * 60 / self.d                                  # diameters per second
        st = min(0.16, 0.012 * abs(vy))
        sx, sy = 1 - st * 0.6, 1 + st
        for ct in self.contact_t:
            since = t - ct
            if 0 <= since < 0.3:
                amt = _SQUASH[int(round(ct * 24))]
                if self.name["anchor"] != "period" and ct == self.contact_t[-1]:
                    amt *= 0.4                                       # narrow stem between tall letters
                q = amt * math.exp(-since / 0.055) * math.cos(since * 26)
                sx, sy = 1 + q, 1 - q
                if ct == self.contact_t[-1] and self.name["anchor"] == "period" and q > 0:
                    x += self.d / 2 * q * 0.7                        # spread right, away from the last letter
        return x, y, sx, sy

    def _trail(self, t):
        u = self._u(t)
        pts, acc, last = [], 0.0, None
        for sj in range(min(len(self.segs), int(math.floor(u)) + 1)):
            end = min(1.0, u - sj)
            steps = max(2, int(60 * end))
            for k in range(steps + 1):
                p = BB._seg_pos(self.segs[sj], end * k / steps)
                if last is not None:
                    acc += math.hypot(p[0] - last[0], p[1] - last[1])
                if last is None or acc >= 0.42 * self.d:
                    pts.append(p)
                    acc = 0.0
                last = p
        return pts

    def draw(self, fr, t, reveal=0.42, trail_fade=(2.9, 3.4), tagline_at=None):
        ss = self.ss
        # letters: printed by a soft left-to-right wipe in the first `reveal` seconds
        ink = self._ink
        if t < reveal:
            w = ink.width
            edge = (t / reveal) * (w * 1.15) - w * 0.08
            ramp = np.clip((edge - np.arange(w)) / (w * 0.08), 0, 1).astype(np.float32)
            g = Image.fromarray((np.tile(ramp, (ink.height, 1)) * 255).astype(np.uint8), "L")
            ink = ImageChops.multiply(ink, g)
        fr.mask("ink", ink, self.ox / ss, self.oy / ss)
        cx, cy, sx, sy = self.state(t)
        # dotted trail in second ink
        fade = 1.0 - L.smooth((t - trail_fade[0]) / (trail_fade[1] - trail_fade[0]))
        if fade > 0:
            pts = self._trail(min(t, DUR))
            r = self.d / 2
            for k, (px, py) in enumerate(pts):
                if math.hypot(px - cx, py - cy) < 0.95 * self.d:
                    continue
                f = (k + 1) / len(pts)
                fr.disc("second", px / ss, py / ss, r * (0.07 + 0.13 * f) / ss, 255 * fade)
        # contact ticks (ink), 0.18 s after each contact
        for ct in self.contact_t:
            since = t - ct
            if 0 <= since < 0.18:
                gx, gy, gsx, _ = self.state(ct + 0.01)
                r = self.d / 2 * max(1.0, gsx)
                grow = 0.75 + 0.5 * L.smooth(since / 0.1)
                for a in (-150, -120, -60, -30):
                    ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
                    bx, by = gx, gy + r
                    p1 = (bx + ca * r * 1.45 * grow, by + sa * r * 0.85 * grow)
                    p2 = (bx + ca * r * 1.9 * grow, by + sa * r * 1.2 * grow)
                    fr.line("ink", [(p1[0] / ss, p1[1] / ss), (p2[0] / ss, p2[1] / ss)], max(2.0, self.d * 0.035) / ss)
        extras = t < 0.45                                            # surprise burst only on the drop
        self.mascot.draw(fr, cx / ss, cy / ss, self.d / ss, t, sx=sx, sy=sy, extras=extras, ground=True)
        if tagline_at is not None and t >= tagline_at:
            a = L.smooth((t - tagline_at) / 0.35)
            x0, y0, x1, y1 = WM.crop_to_content(self.lay, 0)
            ty = (self.oy + y1) / ss + 70 + 12 * (1 - a)
            fr.text("ink", (self.W / 2, ty), self.name["tagline"], "body", 44, anchor="ma", v=255 * a)
            fr.text("second", (self.W / 2, ty + 66), self.name["handle"], "label", 30, anchor="ma", v=255 * a)

    def rest_px(self):
        """Resting centre of the companion in output px (for cross-cutting to/from the sting)."""
        return (self.lay.mascot_c[0] + self.ox) / self.ss, (self.lay.mascot_c[1] + self.oy) / self.ss


# ------------------------------------------------------------------------------------------------ test clips

def episode(lang="en", hold=1.0, fps=30):
    """A render.py episode: the sting alone on paper, with the channel motif. Used for the test clips."""
    import sound as SND

    class _Ep:
        W, H = 1920, 1080

        def __init__(self):
            self.fps = fps
            self.duration = DUR + hold
            self.n_frames = int(round(self.duration * fps))
            self.sting = None

        def frame(self, fi):
            if self.sting is None:
                self.sting = Sting(lang)
            fr = L.Frame()
            self.sting.draw(fr, fi / self.fps, tagline_at=DUR + 0.1 if hold >= 0.6 else None)
            return L.finish(fr, fi)

        def audio(self, path):
            st = Sting(lang)
            n = int(self.duration * SND.SR)
            sfx = SND.Bus(n)
            SND.sting_sfx(sfx, st.events, drop_t=0.0)
            music = SND.Bus(n)
            mix = SND.mix(voice=None, music=music.buf, sfx=sfx.buf)
            SND.master(mix, path)

    return _Ep()


if __name__ == "__main__":
    import render as R
    for lang in ("en", "es"):
        out = L.ENGINE / "demo" / f"wordmark_{lang}.mp4"
        R.render_episode(episode(lang), out, preview=False)
