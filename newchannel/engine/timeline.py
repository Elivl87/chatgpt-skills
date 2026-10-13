"""Shots tied to narration words -> per-frame shot state.

`timings.json` comes from voice.py: [{"word", "text", "start", "end", "i", "conf"}, ...], seconds from the start of
narration.wav. The narration is placed at `offset` seconds into the video; `Timings.at()` returns VIDEO seconds.

    T = Timings.load("ep/001/audio/timings.json", offset=0.35)
    T.at("tap")                    # start of the 1st "tap"
    T.at("the", 2, edge="end")     # end of the 2nd "the"
    T.at("brakes", after=0.2)      # 0.2 s after "brakes" starts
    T.phrase("nobody caused")      # (start of "nobody", end of "caused")

    shots = [
        Shot("wide",  start=0.0,               bg="split", frame=(960, 540, 1.0), draw=draw_split),
        Shot("ring",  start=T.at("Twenty-two") - 0.1, bg="ring", frame=(500, 560, 1.42), draw=draw_ring),
        Shot("hero",  start=T.at("rolling"),   bg="hero", follow=lambda t: mascot_xy(t), zoom=2.3, draw=draw_ring),
    ]
    tl = Timeline(shots, duration=18.0, fps=30, overlay=draw_labels)
    rgb = tl.render(fi)            # Frame -> shot.draw(ctx, fr) -> overlay -> look.finish

Every shot's `draw(ctx, fr)` gets a `Ctx` (t, fi, local time, progress, camera, shot, timeline). Camera rules live
in camera.py: consecutive shots with the same `bg` share one camera setup (no framing reset), each setup breathes.
`tl.report()` lists shots with durations and flags any shot longer than 4 s (README section 7).
"""
from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Optional

import look as L
from camera import CameraTrack, Cam, Move


def _norm(w: str) -> str:
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^\w]+", "", w)


class Timings:
    def __init__(self, words: list, offset: float = 0.0):
        self.words = words
        self.offset = offset

    @classmethod
    def load(cls, path, offset=0.0):
        return cls(json.loads(Path(path).read_text(encoding="utf-8")), offset)

    def find(self, word, n=1):
        key = _norm(word)
        hits = [w for w in self.words if _norm(w["word"]) == key]
        if len(hits) < n:
            near = sorted({w["word"] for w in self.words if key[:3] and _norm(w["word"]).startswith(key[:3])})
            raise KeyError(f"word {word!r} #{n} not in timings ({len(hits)} found). Similar: {near[:8]}")
        return hits[n - 1]

    def at(self, word, n=1, edge="start", after=0.0):
        w = self.find(word, n)
        t = {"start": w["start"], "end": w["end"], "mid": (w["start"] + w["end"]) / 2}[edge]
        return t + self.offset + after

    def phrase(self, text, n=1):
        """(start of first word, end of last word) of a consecutive phrase, n-th occurrence."""
        keys = [_norm(x) for x in text.split()]
        seen = 0
        for i in range(len(self.words) - len(keys) + 1):
            if all(_norm(self.words[i + k]["word"]) == keys[k] for k in range(len(keys))):
                seen += 1
                if seen == n:
                    return self.words[i]["start"] + self.offset, self.words[i + len(keys) - 1]["end"] + self.offset
        raise KeyError(f"phrase {text!r} #{n} not found")

    @property
    def start(self):
        return self.words[0]["start"] + self.offset

    @property
    def end(self):
        return self.words[-1]["end"] + self.offset

    def word_at(self, t):
        for w in self.words:
            if w["start"] + self.offset <= t < w["end"] + self.offset:
                return w
        return None


@dataclass
class Shot:
    name: str
    start: float
    draw: Callable = None                  # draw(ctx, frame)
    bg: str = ""                           # same bg as the previous shot -> camera continues (no reset)
    frame: tuple = (960.0, 540.0, 1.0)     # (cx, cy, zoom) world framing at the start of the shot
    follow: Optional[Callable] = None      # t -> (x, y) world point to track (spring-smoothed)
    zoom: Optional[float] = None           # zoom when following
    follow_offset: tuple = (0.0, 0.0)
    moves: list = field(default_factory=list)   # camera.Move list (absolute times)
    push: Optional[float] = None
    drift: Optional[float] = None
    end: Optional[float] = None            # filled by Timeline
    data: dict = field(default_factory=dict)


@dataclass
class Ctx:
    t: float
    fi: int
    shot: Shot
    index: int
    lt: float              # seconds since the shot started
    u: float               # 0..1 progress through the shot
    cam: Cam
    tl: "Timeline"

    def since(self, t0):
        return self.t - t0

    def env(self, t0, t1, fade_in=0.25, fade_out=0.25):
        return L.window(self.t, t0, t1, fade_in, fade_out)


class Timeline:
    def __init__(self, shots, duration, fps=30, W=1920, H=1080, seed=7, overlay=None, look=L.DEFAULT, ss=2):
        self.shots = sorted(shots, key=lambda s: s.start)
        self.duration, self.fps, self.W, self.H, self.ss = duration, fps, W, H, ss
        self.n_frames = int(round(duration * fps))
        self.overlay = overlay
        self.look = look
        for a, b in zip(self.shots[:-1], self.shots[1:]):
            a.end = b.start
        self.shots[-1].end = duration
        self.camera = CameraTrack(W, H, seed, fps)
        for s in self.shots:
            frame = s.frame if s.follow is None else (s.frame[0], s.frame[1], s.zoom or s.frame[2])
            self.camera.add_setup(s.start, s.end, frame, s.bg or s.name, s.moves, s.push, s.drift, s.follow,
                                  follow_offset=s.follow_offset)

    def shot_at(self, t):
        for i, s in enumerate(self.shots):
            if s.start <= t < s.end:
                return i, s
        return len(self.shots) - 1, self.shots[-1]

    def ctx(self, fi):
        t = fi / self.fps
        i, s = self.shot_at(t)
        lt = t - s.start
        return Ctx(t, fi, s, i, lt, lt / max(1e-6, s.end - s.start), self.camera.at(t), self)

    def render(self, fi):
        c = self.ctx(fi)
        fr = L.Frame(self.W, self.H, self.ss)
        if c.shot.draw:
            c.shot.draw(c, fr)
        if self.overlay:
            self.overlay(c, fr)
        return L.finish(fr, fi, self.look)

    def cuts(self):
        return self.camera.cuts()

    def report(self, max_shot=4.0):
        lines = [f"{'#':>2} {'shot':14s} {'start':>6} {'end':>6} {'dur':>5}  bg"]
        for i, s in enumerate(self.shots):
            d = s.end - s.start
            flag = "  <-- longer than %.0f s" % max_shot if d > max_shot + 1e-6 else ""
            lines.append(f"{i:2d} {s.name:14s} {s.start:6.2f} {s.end:6.2f} {d:5.2f}  {s.bg}{flag}")
        n_cuts = len(self.cuts())
        lines.append(f"{len(self.shots)} shots, {n_cuts} camera cuts, {n_cuts / self.duration * 60:.1f} cuts/min "
                     f"over {self.duration:.1f} s")
        return "\n".join(lines)


if __name__ == "__main__":        # example shot list against the demo narration
    T = Timings.load(L.ENGINE / "demo" / "audio" / "timings.json", offset=0.35)
    example = [
        Shot("wide_tap", 0.0, bg="split", frame=(960, 540, 1.0)),
        Shot("ring_count", T.at("Twenty-two", after=-0.12), bg="ring", frame=(500, 560, 1.42)),
        Shot("wide_jam", T.at("And", after=-0.12), bg="split", frame=(960, 540, 1.0)),
        Shot("hero", T.at("rolling"), bg="hero", follow=lambda t: (500 + 300 * t / 20, 300), zoom=2.3),
        Shot("sting", 15.0, bg="sting"),
    ]
    tl = Timeline(example, 18.5)
    print(tl.report())
    print("tap at %.2f s, 'nobody caused' = %.2f-%.2f s" % ((T.at("tap"),) + T.phrase("nobody caused")))
