#!/usr/bin/env python3
"""EP001 · 5 alternative scores for the HOOK (block A, 0-47.1 s: hook + question + wordmark sting), for the Producer to
pick from ("Quiero cambiar la música. No me gusta la que tiene", 2026-10-29).

    python3 -I compose_options.py --events <block A events.json> [--only 1,3] [--out-dir .]

Instruments are REAL recorded samples, all CC0 (no attribution needed, commercial use OK):
    VSCO-2 Community Edition (Versilian Studios)      https://github.com/sgossner/VSCO-2-CE   CC0-1.0
    Versilian Community Sample Library (VCSL)         https://github.com/sgossner/VCSL        CC0-1.0
They are DATA read from TTD_MUSIC_LIBS (default /tmp/claude-0/music_libs; never committed, never executed). Our own
code (this file) is the sampler: nearest-sample pick by pitch/velocity layer/round robin, band-limited FFT pitch shift,
envelopes, panning, our own reverb, a lo-fi chain (wow, saturation, vinyl crackle synthesised here).

Every option is keyed to the narration (timings_es.json) of block A: the car's stop («quieto: Eli.»), the muted
«¡¿Quién fue?!» slot, «Pero allá no hay nada» (hush, three ticks on «ni choque, ni conos, ni semáforo»), the bird,
Mila looking back, the swell into «¿Qué?», the question hanging, and a sting on the wordmark's three dot bounces
(the channel motif D5 -> A5 -> G5, here played by each option's own instruments). The mix is the episode's own
(engine/cine_suave.build_block: Cine suave ambience, ducking + 2-3.5 kHz carve under the narrator, -14 LUFS, TP <= -1.5).
"""
from __future__ import annotations

import argparse
import glob
import json
import math
import os
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
NC = HERE.parents[4]
AUD = HERE.parents[1]
sys.path.insert(0, str(NC / "engine"))
import sound as S  # noqa: E402
import cine_suave as CS  # noqa: E402

SR = S.SR
LIB = os.environ.get("TTD_MUSIC_LIBS", "/tmp/claude-0/music_libs")
CACHE = os.environ.get("TTD_SCORE_CACHE", "/tmp/claude-0/cine_suave_cache")
DUR = 47.085 + 0.4

# name: (folder under LIB, octave offset in semitones (file name -> real pitch, measured), sustained?, release s,
#        max length s, file-name filter regex)
VS, VC, VP = "vsco2ce/repo", "vcsl/repo", "vcsl_piano/repo"
INSTR = {
    "vln_pizz": (f"{VS}/Strings/Violin Section/Pizz", 12, False, 0.15, 1.2, None),
    "vla_pizz": (f"{VS}/Strings/Viola Section/pizz", 12, False, 0.15, 1.2, None),
    "vc_pizz": (f"{VS}/Strings/Cello Section/pizzT", 12, False, 0.2, 1.8, None),
    "vln_sus": (f"{VS}/Strings/Violin Section/susVib", 12, True, 0.9, 11, None),
    "vla_sus": (f"{VS}/Strings/Viola Section/susvib", 12, True, 0.9, 11, None),
    "vc_sus": (f"{VS}/Strings/Cello Section/susvib", 12, True, 0.9, 11, None),
    "harp": (f"{VS}/Strings/Harp", 0, False, 0.3, 4.0, None),
    "fl_stac": (f"{VS}/Woodwinds/Flute/stac", 12, False, 0.08, 0.6, None),
    "fl_sus": (f"{VS}/Woodwinds/Flute/susvib", 12, True, 0.25, 6, None),
    "cl_stac": (f"{VS}/Woodwinds/Clarinet/stac", 12, False, 0.08, 0.6, None),
    "cl_sus": (f"{VS}/Woodwinds/Clarinet/susLong", 12, True, 0.3, 8, None),
    "ob_stac": (f"{VS}/Woodwinds/Oboe/Stacc", 12, False, 0.08, 0.6, None),
    "bsn_stac": (f"{VS}/Woodwinds/Bassoon/stac", 12, False, 0.1, 0.7, None),
    "fm_piano": (f"{VC}/Electrophones/TX81Z/FM Piano", 0, True, 0.5, 6, None),
    "piano": (f"{VP}/Chordophones/Zithers/Grand Piano, Steinway B/Sus", 12, True, 0.7, 7, None),
    "strum": (f"{VC}/Chordophones/Composite Chordophones/Strumstick/Finger", 12, False, 0.3, 3.0, None),
    "vibes": (f"{VC}/Idiophones/Struck Idiophones/Vibraphone/Soft Mallets", 12, False, 0.6, 4.0, None),
    "glock": (f"{VC}/Idiophones/Struck Idiophones/Glockenspiel", 12, False, 0.4, 2.5, r"(soft|medium)"),
}
PERC = {   # unpitched: folder, filter regex
    "clap": (f"{VC}/Idiophones/Struck Idiophones/Claps", r"^Clap_rr"),
    "shaker": (f"{VC}/Idiophones/Struck Idiophones/Shaker, Small", r"Double"),
    "wood": (f"{VC}/Idiophones/Struck Idiophones/Woodblock", r"click_(mp|pp|f_)"),
    "hat": (f"{VC}/Idiophones/Struck Idiophones/Hi-Hat Cymbal", r"HitC"),
    "cajon": (f"{VC}/Idiophones/Struck Idiophones/Cajon", r"hit1_(mp|f)_"),
    "cajon_slap": (f"{VC}/Idiophones/Struck Idiophones/Cajon", r"hit2_(mp|f)_"),
    "kick": (f"{VC}/Membranophones/Struck Membranophones/Bass Drum 1", r"v[23]"),
    "tri": (f"{VC}/Idiophones/Struck Idiophones/Triangles", r"^Triangle1_HitM"),
}

_PC = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def N(name):
    m = re.fullmatch(r"([A-G])([#b]?)(-?\d)", name)
    return 12 * (int(m.group(3)) + 1) + _PC[m.group(1)] + {"#": 1, "b": -1, "": 0}[m.group(2)]


# ------------------------------------------------------------------------------------------------ sampler

_AUDIO, _SHIFT = {}, {}


def _load(path):
    if path not in _AUDIO:
        x = S.load_audio(path, SR, 2)
        pk = np.abs(x).max() + 1e-9
        i = int(np.argmax(np.abs(x).max(1) > pk * 0.03))
        _AUDIO[path] = x[max(0, i - int(0.002 * SR)):]
    return _AUDIO[path]


def _index(folder, rx=None):
    out = []
    for p in sorted(glob.glob(os.path.join(LIB, folder, "*.wav"))):
        b = os.path.basename(p)
        if rx and not re.search(rx, b):
            continue
        m = re.search(r"_([A-G])(#?)(-?\d)(?=[_.])", b)
        midi = None if not m else 12 * (int(m.group(3)) + 1) + _PC[m.group(1)] + (1 if m.group(2) else 0)
        lv = re.search(r"_(?:v|vl|dyn)(\d)", b)
        lay = int(lv.group(1)) if lv else {"soft": 1, "medium": 2, "loud": 3, "pp": 1, "mp": 2, "mf": 2, "f": 3}.get(
            (re.search(r"_(soft|medium|loud|pp|mp|mf|f)_", b) or [None, None])[1], 2)
        out.append((midi, lay, p))
    if not out:
        raise FileNotFoundError(f"no samples in {folder} (set TTD_MUSIC_LIBS; see OPCIONES.md)")
    return out


class Inst:
    def __init__(self, name):
        folder, self.off, self.sus, self.rel, self.maxlen, rx = INSTR[name]
        self.s = [(m + self.off, l, p) for m, l, p in _index(folder, rx)]
        self.layers = sorted({l for _, l, _ in self.s})
        self.rr = 0

    def render(self, midi, dur, vel):
        best = min(abs(m - midi) for m, _, _ in self.s)
        cand = [x for x in self.s if abs(x[0] - midi) == best]
        want = self.layers[int(round(np.clip(vel, 0, 1) * (len(self.layers) - 1)))]
        lb = min(abs(l - want) for _, l, _ in cand)
        cand = [x for x in cand if abs(x[1] - want) == lb]
        self.rr += 1
        sm, _, p = cand[self.rr % len(cand)]
        ratio = 2 ** ((midi - sm) / 12)
        length = min(self.maxlen, dur + self.rel) if self.sus else self.maxlen
        key = (p, midi, round(length, 2))
        if key not in _SHIFT:
            x = _load(p)[: int((length * ratio + 0.05) * SR)]
            if abs(ratio - 1) > 1e-4:
                n2 = max(16, int(round(len(x) / ratio)))
                x = np.stack([np.fft.irfft(np.fft.rfft(x[:, c]), n2) * (n2 / len(x)) for c in range(2)], 1)
            x = x[: int(length * SR)].astype(np.float32)
            n = len(x)
            env = np.ones(n, np.float32)
            if self.sus:
                h = int(min(dur, length) * SR)
                r = n - h
                if r > 0:
                    env[h:] = np.cos(np.linspace(0, np.pi / 2, r)) ** 2
            f = min(n, int(0.06 * SR))
            env[n - f:] *= np.linspace(1, 0, f)
            _SHIFT[key] = x * env[:, None]
        return _SHIFT[key]


class Perc:
    def __init__(self, name):
        folder, rx = PERC[name]
        self.s = [p for _, _, p in _index(folder, rx)]
        self.rr = 0

    def render(self):
        self.rr += 1
        return _load(self.s[self.rr % len(self.s)])[: int(2.5 * SR)]


class Band:
    """Stereo buses per instrument; notes in absolute seconds."""

    def __init__(self, seed):
        self.n = int(DUR * SR)
        self.bus, self.inst = {}, {}
        self.rng = np.random.default_rng(seed)

    def _get(self, name):
        if name not in self.inst:
            self.inst[name] = Inst(name) if name in INSTR else Perc(name)
        return self.inst[name]

    def _put(self, bus, x, t, gain, pan):
        if bus not in self.bus:
            self.bus[bus] = np.zeros((self.n, 2), np.float32)
        i = int(round(t * SR))
        if i >= self.n or i + len(x) <= 0:
            return
        l, r = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
        seg = x[: self.n - i] if i >= 0 else x[-i: self.n - i]
        i = max(i, 0)
        self.bus[bus][i:i + len(seg), 0] += seg[:, 0] * gain * l * 1.41
        self.bus[bus][i:i + len(seg), 1] += seg[:, 1] * gain * r * 1.41

    def note(self, name, midi, t, dur, vel, pan=0.0, gain=1.0, bus=None, human=0.008):
        if isinstance(midi, str):
            midi = N(midi)
        t += float(self.rng.normal(0, human))
        v = float(np.clip(vel + self.rng.normal(0, 0.04), 0.05, 1))
        x = self._get(name).render(midi, dur, v)
        self._put(bus or name, x, t, gain * (0.25 + 0.75 * v) ** 1.5, pan)

    def chord(self, name, notes, t, dur, vel, pan=0.0, gain=1.0, spread=0.0, bus=None, roll=0.0):
        for j, m in enumerate(notes):
            p = pan + spread * ((j / max(1, len(notes) - 1)) * 2 - 1)
            self.note(name, m, t + j * roll, dur - j * roll, vel, p, gain / math.sqrt(len(notes)), bus)

    def hit(self, name, t, vel, pan=0.0, gain=1.0, bus=None):
        t += float(self.rng.normal(0, 0.005))
        self._put(bus or name, self._get(name).render(), t, gain * vel ** 1.5, pan)


def ffilt(x, fn):
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * fn(f)[:, None], len(x), axis=0).astype(np.float32)


def room(x, rt=1.6, wet=0.25, seed=3):
    if wet <= 0:
        return x
    ir = CS.reverb_ir(rt, seed, predelay=0.018, bright_t=0.18, er=((0.023, 0.3), (0.041, 0.2), (0.067, 0.12)))
    return CS.convolve(x, ir, wet)


def lofi(x, seed=5):
    """Tape/vinyl: gentle wow + flutter (variable delay), soft saturation, band limit, crackle + hiss (ours)."""
    n = len(x)
    t = np.arange(n) / SR
    d = 0.0022 * (1 + np.sin(2 * np.pi * 0.55 * t)) + 0.0003 * np.sin(2 * np.pi * 6.1 * t)
    src = np.clip(t - d, 0, None)
    y = np.stack([np.interp(src, t, x[:, c]) for c in range(2)], 1).astype(np.float32)
    pk = np.abs(y).max() + 1e-9
    y = np.tanh(1.6 * y / pk) / np.tanh(1.6) * pk
    y = ffilt(y, lambda f: CS.lp(5200, 2)(f) * CS.hp(70, 1)(f))
    rng = np.random.default_rng(seed)
    cr = np.zeros(n, np.float32)
    k = rng.random(n) < 9.0 / SR
    cr[k] = rng.standard_normal(k.sum()) * rng.random(k.sum()) ** 3
    cr = ffilt(np.stack([cr, np.roll(cr, 37)], 1), CS.bell(3000, 2.0, 0))
    hiss = ffilt(rng.standard_normal((n, 2)).astype(np.float32), CS.lp(4000, 1))
    r = np.sqrt(np.mean(y ** 2)) + 1e-9
    return y + cr * (r * 0.9 / (np.abs(cr).max() + 1e-9)) + hiss * r * 0.012


# ------------------------------------------------------------------------------------------------ the form (block A)

def form(timings):
    """Hit points from the narration (seconds). Fallbacks are the 2026-10-28 take."""
    w = json.load(open(timings))

    def at(word, beat=None, nth=0, default=0.0, end=False):
        hits = [x for x in w if x["text"].strip("¡¿?!.,:;…") == word and (beat is None or x["beat"] == beat)]
        return (hits[nth]["end"] if end else hits[nth]["start"]) if len(hits) > nth else default

    T = {"stop": at("quieto", "02", end=True, default=15.47) - 0.27, "eli": at("Eli", "02", default=15.74),
         "quien": at("Quién", "03", default=16.77), "seguro": at("Eli", "03", default=18.04),
         "pero": at("Pero", "03", default=24.05), "ni1": at("choque", default=25.37), "ni2": at("conos", default=26.31),
         "ni3": at("semáforo", default=27.09), "no": at("No", "03", default=29.68),
         "pajarito": at("pajarito", default=30.86), "mila": at("Mila", "04", default=32.52),
         "va": at("va", "04", default=35.8), "que": at("Qué", "04", default=39.26), "entonces": at("Entonces", default=41.3),
         "pregunta": at("por", "04", default=42.29), "fin": at("aparente", end=True, default=44.57)}
    T.update({"swell": T["que"] - 0.65, "wm": 42.22, "b1": 43.34, "b2": 43.80, "land": 44.24, "end": 47.085})
    return T


G = {"G": (N("G2"), [N("G3"), N("B3"), N("D4")]), "D/F#": (N("F#2"), [N("A3"), N("D4"), N("F#4")]),
     "Em": (N("E2"), [N("G3"), N("B3"), N("E4")]), "C": (N("C3"), [N("G3"), N("C4"), N("E4")]),
     "Am": (N("A2"), [N("A3"), N("C4"), N("E4")]), "D": (N("D3"), [N("A3"), N("D4"), N("F#4")]),
     "G/B": (N("B2"), [N("G3"), N("B3"), N("D4")]), "Bm": (N("B2"), [N("F#3"), N("B3"), N("D4")]),
     "B7": (N("B2"), [N("A3"), N("D#4"), N("F#4")]), "Bb": (N("Bb2"), [N("F3"), N("Bb3"), N("D4")]),
     "Cmaj7": (N("C3"), [N("G3"), N("B3"), N("E4")]), "Dsus4": (N("D3"), [N("A3"), N("D4"), N("G4")]),
     "Am7": (N("A2"), [N("G3"), N("C4"), N("E4")]), "Em7": (N("E2"), [N("G3"), N("B3"), N("D4")]),
     "Cadd9": (N("C3"), [N("G3"), N("D4"), N("E4")]), "Gadd9": (N("G2"), [N("D4"), N("G4"), N("A4"), N("B4")])}


def bars(t0, t1, bpm, beats=4):
    """Integer number of bars in [t0, t1), tempo stretched to fit -> (bar starts, beat length)."""
    bl = beats * 60 / bpm
    k = max(1, round((t1 - t0) / bl))
    bl = (t1 - t0) / k
    return [t0 + i * bl for i in range(k)], bl / beats


def sections(T):
    """(name, t0, t1, chord cycle, energy 0..1)."""
    return [("road", 0.0, T["stop"], ["G", "D/F#", "Em", "C"], 0.6),
            ("sure", T["seguro"] - 0.25, T["pero"] - 0.1, ["C", "G/B", "Am", "D"], 0.55),
            ("bird", T["no"] - 0.1, T["mila"] - 0.1, ["C", "D"], 0.35),
            ("look", T["mila"] - 0.1, T["swell"], ["Em", "C", "Am", "B7"], 0.5)]


# ------------------------------------------------------------------------------------------------ 5 options

def opt_pizz(T, b):
    """(1) Pizzicato curioso: string-section pizzicato, clarinet staccato, woodblock + shaker, glockenspiel motif."""
    for name, t0, t1, cyc, en in sections(T):
        bs, bt = bars(t0, t1, 104)
        for i, t in enumerate(bs):
            root, tri = G[cyc[i % len(cyc)]]
            ramp = en + (0.25 * i / max(1, len(bs) - 1) if name == "road" else 0)
            b.note("vc_pizz", root, t, 0.4, ramp, -0.25)
            b.note("vc_pizz", root + 7, t + 2 * bt, 0.4, ramp * 0.8, -0.25)
            for k in (1, 3):                                   # off-beat chord plucks (violas)
                b.chord("vla_pizz", tri[:2], t + k * bt, 0.3, ramp * 0.75, 0.15, spread=0.1)
            if name != "bird":                                 # violin 8th-note tune on the chord tones
                pat = [tri[2] + 12, tri[1] + 12, tri[2] + 12, tri[0] + 12, tri[1] + 12, tri[2] + 12, tri[0] + 12, tri[1] + 12]
                for k, m in enumerate(pat):
                    if (i + k) % 3 != 2 or name == "road":
                        b.note("vln_pizz", m, t + k * bt / 2, 0.25, ramp * (0.85 if k % 2 == 0 else 0.6), 0.35)
            if name in ("sure", "look") and i % 2 == 1:        # clarinet answers
                for k, m in enumerate([tri[2] + 12, tri[1] + 12, tri[0] + 12]):
                    b.note("cl_stac", m, t + (2.5 + k * 0.5) * bt, 0.2, 0.5, -0.4)
            for k in range(8):
                b.hit("shaker", t + k * bt / 2, 0.35 + 0.25 * (k % 2 == 0) * ramp, 0.45, 0.5)
            b.hit("wood", t + 3.5 * bt, 0.35, -0.5, 0.6)
            if name == "road" and i % 2 == 1:
                b.chord("glock", [N(m) for m in ("D5", "A5", "G5")][:1], t + 2 * bt, 1.0, 0.45, 0.2)
    _common(T, b, pluck="vla_pizz", low="vc_pizz", sparkle="glock", pad="vln_sus")


def opt_folk(T, b):
    """(2) Acústico de madera: strumstick fingerpicking, cello pizz bass, claps + cajón + shaker, harp sparkle."""
    for name, t0, t1, cyc, en in sections(T):
        bs, bt = bars(t0, t1, 96)
        for i, t in enumerate(bs):
            root, tri = G[cyc[i % len(cyc)]]
            ramp = en + (0.2 * i / max(1, len(bs) - 1) if name == "road" else 0)
            b.note("vc_pizz", root, t, 0.5, ramp * 0.9, -0.15)
            b.note("vc_pizz", root + 7 if root < N("D3") else root - 5, t + 2.5 * bt, 0.4, ramp * 0.7, -0.15)
            pat = [tri[0], tri[2], tri[1] + 12, tri[2], tri[0] + 12, tri[2], tri[1] + 12, tri[2]]
            for k, m in enumerate(pat):                        # Travis-like picking, swung 16th feel
                sw = 0.04 if k % 2 else 0.0
                b.note("strum", m, t + k * bt / 2 + sw, 1.2, ramp * (0.8 if k in (0, 4) else 0.55), 0.25 + 0.15 * (k % 2))
            if name != "bird":
                b.hit("clap", t + bt, 0.45 * ramp + 0.15, -0.2, 0.7)
                b.hit("clap", t + 3 * bt, 0.45 * ramp + 0.15, 0.2, 0.7)
                b.hit("cajon", t, 0.6, 0.0, 0.9)
                b.hit("cajon", t + 2.5 * bt, 0.45, 0.0, 0.7)
            for k in range(8):
                b.hit("shaker", t + k * bt / 2, 0.3 + 0.15 * (k % 2 == 1), 0.5, 0.4)
            if name == "sure" and i % 2 == 1:
                b.chord("harp", [tri[1] + 12, tri[2] + 12, tri[0] + 24], t + 3 * bt, 2.0, 0.5, 0.3, roll=0.06)
    _common(T, b, pluck="strum", low="vc_pizz", sparkle="harp", pad="vc_sus")


def opt_lofi(T, b):
    """(3) Lo-fi de estudio: FM electric piano (7th/9th chords), sub bass, soft kick + cajón + hats, tape + vinyl."""
    jazz = {"G": [N("F#3"), N("A3"), N("B3"), N("D4")], "D/F#": [N("E3"), N("A3"), N("C#4"), N("F#4")],
            "Em": [N("D3"), N("F#3"), N("G3"), N("B3")], "C": [N("E3"), N("G3"), N("B3"), N("D4")],
            "G/B": [N("F#3"), N("A3"), N("B3"), N("D4")], "Am": [N("G3"), N("B3"), N("C4"), N("E4")],
            "D": [N("C4"), N("E4"), N("F#4"), N("A4")], "B7": [N("A3"), N("D#4"), N("F#4"), N("G4")]}
    for name, t0, t1, cyc, en in sections(T):
        bs, bt = bars(t0, t1, 80)
        for i, t in enumerate(bs):
            ch = cyc[i % len(cyc)]
            root = G[ch][0]
            sw = bt * 0.17                                     # swing on the off 8ths
            b.chord("fm_piano", jazz[ch], t + 0.02, 2.6 * bt, 0.55, 0.0, spread=0.25, roll=0.018)
            b.chord("fm_piano", jazz[ch][1:], t + 2.5 * bt + sw, 1.2 * bt, 0.4, 0.0, spread=0.25, roll=0.012)
            if name in ("sure", "look") and i % 2 == 1:
                for k, m in enumerate([jazz[ch][-1] + 12, jazz[ch][-2] + 12, jazz[ch][-1] + 12 + 2]):
                    b.note("fm_piano", m, t + (3 + k * 0.33) * bt, 0.3, 0.38, 0.3)
            b.note("vc_pizz", root - 12 if root >= N("D3") else root, t, 0.9, 0.7, 0.0, bus="sub")
            b.note("vc_pizz", root, t + 2.5 * bt + sw, 0.5, 0.5, 0.0, bus="sub")
            if name != "bird":
                b.hit("kick", t, 0.75, 0.0, 1.0, bus="drums")
                b.hit("kick", t + 2.5 * bt + sw, 0.55, 0.0, 0.8, bus="drums")
                b.hit("cajon_slap", t + bt, 0.6, 0.05, 0.9, bus="drums")
                b.hit("cajon_slap", t + 3 * bt, 0.6, 0.05, 0.9, bus="drums")
            for k in range(8):
                b.hit("hat", t + k * bt / 2 + (sw if k % 2 else 0), 0.3 + 0.12 * (k % 2 == 0), 0.3, 0.45, bus="drums")
    _common(T, b, pluck="fm_piano", low="vc_pizz", sparkle="vibes", pad="fm_piano")


def opt_cuento(T, b):
    """(4) Orquesta de cuento: flute + clarinet + oboe tune, bassoon staccato bass, harp, glockenspiel + vibraphone,
    triangle (light woodwind-and-harp storybook)."""
    tune = {"road": ["D5", "E5", "D5", "B4", "G4", "A4", "B4", "D5"], "sure": ["E5", "D5", "C5", "B4", "A4", "B4", "C5", "A4"],
            "look": ["B4", "G4", "E4", "G4", "C5", "B4", "A4", "F#4"]}
    for name, t0, t1, cyc, en in sections(T):
        bs, bt = bars(t0, t1, 112)
        for i, t in enumerate(bs):
            root, tri = G[cyc[i % len(cyc)]]
            ramp = en + (0.25 * i / max(1, len(bs) - 1) if name == "road" else 0)
            b.note("bsn_stac", root, t, 0.3, ramp * 0.8, -0.3)
            b.note("bsn_stac", root + 7, t + 2 * bt, 0.3, ramp * 0.65, -0.3)
            for k in (1, 3):
                b.chord("cl_stac", tri[:2], t + k * bt, 0.2, ramp * 0.55, -0.1, spread=0.1)
            b.chord("harp", [root + 12] + tri, t, 2.5, ramp * 0.55, 0.2, spread=0.2, roll=0.045)
            if name in tune:                                   # the tune, alternating flute and oboe per bar
                inst = "fl_stac" if i % 2 == 0 else "ob_stac"
                ph = tune[name][(i % 2) * 4:(i % 2) * 4 + 4]
                for k, m in enumerate(ph):
                    if not (name == "road" and i < 1):
                        b.note(inst, m, t + k * bt, 0.3, ramp * 0.7, 0.3 if inst == "fl_stac" else -0.2)
            if name == "bird":
                b.chord("vibes", [tri[1] + 12, tri[2] + 12], t, 2.0, 0.45, 0.2)
            if i % 2 == 0:
                b.hit("tri", t, 0.35, 0.5, 0.4)
            if name == "road" and i % 4 == 3:
                b.note("glock", "D6", t + 2 * bt, 1.0, 0.4, 0.3)
                b.note("glock", "A6", t + 2.5 * bt, 1.0, 0.4, 0.3)
                b.note("glock", "G6", t + 3 * bt, 1.4, 0.45, 0.3)
    _common(T, b, pluck="harp", low="bsn_stac", sparkle="glock", pad="cl_sus", bird="fl_stac")


def opt_cine(T, b):
    """(5) Piano y cuerdas de cine: grand piano 8th-note ostinato, string sections (violins/violas/celli), cello pizz
    pulse, soft kick on the downbeats."""
    for name, t0, t1, cyc, en in sections(T):
        bs, bt = bars(t0, t1, 92)
        for i, t in enumerate(bs):
            root, tri = G[cyc[i % len(cyc)]]
            ramp = en + (0.3 * i / max(1, len(bs) - 1) if name in ("road", "look") else 0)
            pat = [tri[0] + 12, tri[2] + 12, tri[1] + 12, tri[2] + 12] * 2
            for k, m in enumerate(pat):
                b.note("piano", m, t + k * bt / 2, bt / 2 + 0.3, ramp * (0.6 if k % 4 == 0 else 0.45), 0.15)
            b.note("piano", root, t, 4 * bt, ramp * 0.6, -0.1)
            if name != "bird":
                b.chord("vla_sus", tri, t, 4 * bt + 0.2, ramp * 0.55, 0.1, spread=0.3)
                b.note("vc_sus", root if root >= N("C2") else root + 12, t, 4 * bt + 0.2, ramp * 0.6, -0.35)
                for k in range(4):
                    b.note("vc_pizz", root, t + k * bt, 0.3, ramp * 0.5, -0.2, bus="pulse")
                b.hit("kick", t, 0.4 + 0.3 * ramp, 0.0, 0.5, bus="pulse")
            if name in ("road", "look") and i >= len(bs) - 2:
                b.note("vln_sus", tri[2] + 12, t, 4 * bt + 0.3, ramp * 0.55, 0.35)
    _common(T, b, pluck="piano", low="vc_sus", sparkle="piano", pad="vln_sus")


def _common(T, b, pluck, low, sparkle, pad, bird="fl_stac"):
    """The shared hit points, played by each option's own instruments."""
    # the car stops: a short downbeat with the stop, then «Eli.» gets one low note
    b.chord(pluck, G["D"][1], T["stop"], 0.6, 0.7, 0.0, spread=0.3)
    b.note(low, "D2" if low != "bsn_stac" else "D2", T["stop"], 0.6, 0.75, -0.2)
    b.note(low, "G2", T["eli"] + 0.05, 0.9, 0.55, -0.2)
    # «¡¿Quién fue?!» (muted line, text box): a surprised Bb stab and a little falling run
    b.chord(pluck, G["Bb"][1], T["quien"] - 0.02, 0.7, 0.85, 0.0, spread=0.35)
    b.note(low, "Bb1" if low in ("vc_pizz", "bsn_stac", "vc_sus") else "Bb2", T["quien"] - 0.02, 0.7, 0.8, -0.2)
    for k, m in enumerate(("F5", "D5", "C5", "A4")):
        b.note(sparkle, m, T["quien"] + 0.45 + k * 0.11, 0.3, 0.45, 0.3)
    # «Pero allá no hay nada»: hush on Am7, then ticks on «ni choque, ni conos, ni semáforo», hold on Dsus4
    t0, t1 = T["pero"] - 0.1, T["no"] - 0.1
    b.chord(pad, G["Am7"][1], t0, T["ni3"] + 0.8 - t0, 0.35, 0.0, spread=0.4)
    b.note(low, "A2", t0, 1.2, 0.4, -0.2)
    for k, key in enumerate(("ni1", "ni2", "ni3")):
        b.note(sparkle, ("E5", "F#5", "G5")[k], T[key] + 0.02, 0.6, 0.45 + 0.08 * k, 0.25)
    b.chord(pad, G["Dsus4"][1], T["ni3"] + 0.8, t1 - T["ni3"] - 0.6, 0.35, 0.0, spread=0.4)
    # the bird («el pajarito tampoco»): a tiny trill
    for k in range(5):
        b.note(bird, ("A5", "B5")[k % 2], T["pajarito"] + 0.55 + k * 0.07, 0.12, 0.4, 0.45)
    # the swell into «¿Qué?» (Mila: «va para atrás»): Cmaj7 rising to a D stab right on «¿Qué?»
    b.chord(pad, G["Cmaj7"][1] + [N("E5")], T["swell"], T["que"] - T["swell"] + 0.3, 0.5, 0.0, spread=0.4)
    b.chord(pluck, G["D"][1] + [N("D5")], T["que"] - 0.02, 0.8, 0.8, 0.0, spread=0.35)
    b.note(low, "D2", T["que"] - 0.02, 1.0, 0.8, -0.2)
    # «Entonces, ¿por qué...?»: the question hangs on Cadd9 -> Dsus4 (soft), then lands on G(add9) with the dot
    b.chord(pad, G["Cadd9"][1], T["entonces"] - 0.2, T["pregunta"] - T["entonces"] + 0.4, 0.4, 0.0, spread=0.4)
    b.note(low, "C2" if low != "bsn_stac" else "C2", T["entonces"] - 0.2, 1.4, 0.45, -0.2)
    b.chord(pad, G["Dsus4"][1], T["pregunta"], T["land"] - T["pregunta"] + 0.15, 0.42, 0.0, spread=0.4)
    b.chord(pad, G["Gadd9"][1], T["land"], T["end"] - T["land"] - 0.3, 0.5, 0.0, spread=0.4)
    b.note(low, "G1" if low in ("vc_pizz", "vc_sus", "bsn_stac") else "G2", T["land"], 2.6, 0.6, -0.2)


def sting_parts(opt, b0):
    """The wordmark sting: motif D5 -> A5 -> G5 (+ a G chord under the landing), mono, by the option's instruments."""
    by = {1: (["vln_pizz", "glock"], ["vc_pizz", "vla_pizz"]), 2: (["strum", "harp"], ["vc_pizz", "strum"]),
          3: (["fm_piano", "vibes"], ["vc_pizz", "fm_piano"]), 4: (["fl_stac", "glock"], ["harp", "bsn_stac"]),
          5: (["piano", "glock"], ["vc_sus", "vla_sus"])}[opt]
    out = {}
    for part, m, hold in (("bounce1", "D5", 0.9), ("bounce2", "A5", 0.9), ("land", "G5", 2.8)):
        b = Band(77)
        b.n = int(3.2 * SR)
        for j, inst in enumerate(by[0]):
            b.note(inst, m if inst != "glock" else N(m) + 12, 0.0, hold, 0.75 - 0.25 * j, 0.0, 1.0 - 0.45 * j, bus="s", human=0)
        if part == "land":
            b.note(by[1][0], "G2", 0.0, 2.8, 0.7, 0.0, 0.8, bus="s", human=0)
            b.chord(by[1][1], [N("G3"), N("B3"), N("D4")], 0.0, 2.6, 0.5, 0.0, 0.7, bus="s")
        x = room(b.bus["s"], 1.4, 0.2).mean(1)
        f = int(0.3 * SR)
        x[-f:] *= np.linspace(1, 0, f)
        out[part] = x.astype(np.float32)
    return out


OPTS = {1: ("Pizzicato curioso", opt_pizz, dict(rt=1.3, wet=0.22)),
        2: ("Acústico de madera", opt_folk, dict(rt=1.1, wet=0.18)),
        3: ("Lo-fi de estudio", opt_lofi, dict(rt=0.9, wet=0.15)),
        4: ("Orquesta de cuento", opt_cuento, dict(rt=1.8, wet=0.28)),
        5: ("Piano y cuerdas de cine", opt_cine, dict(rt=2.4, wet=0.32))}

LEVEL = {   # per-bus balance (dB) per option
    1: {"vln_pizz": -2, "vla_pizz": -4, "vc_pizz": 0, "cl_stac": -5, "shaker": -15, "wood": -12, "glock": -10, "vln_sus": -6},
    2: {"strum": 0, "vc_pizz": -2, "clap": -10, "cajon": -6, "shaker": -16, "harp": -6, "vc_sus": -6, "fl_stac": -6},
    3: {"fm_piano": 0, "sub": -3, "drums": -7, "vibes": -6, "vc_pizz": -3, "fl_stac": -8},
    4: {"bsn_stac": -2, "cl_stac": -5, "harp": -3, "fl_stac": -2, "ob_stac": -4, "vibes": -6, "tri": -16, "glock": -9, "cl_sus": -5},
    5: {"piano": 0, "vla_sus": -4, "vc_sus": -4, "vln_sus": -6, "pulse": -8, "glock": -10},
}


def render_option(opt, timings):
    title, fn, rv = OPTS[opt]
    T = form(timings)
    b = Band(10 + opt)
    fn(T, b)
    mix = np.zeros((b.n, 2), np.float32)
    for name, x in b.bus.items():
        r = np.sqrt(np.mean(x ** 2)) + 1e-9
        g = S.db(LEVEL[opt].get(name, -6)) * 0.05 / r if name not in ("sub",) else S.db(LEVEL[opt].get(name, -6)) * 0.05 / r
        if name == "sub":
            x = ffilt(x, CS.lp(220, 2))
        mix += x * g
    mix = room(mix, rv["rt"], rv["wet"], seed=opt)
    if opt == 3:
        mix = lofi(mix)
    mix = ffilt(mix, CS.hp(40, 2))
    return mix / (np.abs(mix).max() + 1e-9) * 0.7, T


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--events", required=True, help="block A events.json (from the animatic build)")
    ap.add_argument("--narration", default=str(AUD / "narration_es.wav"))
    ap.add_argument("--timings", default=str(AUD / "timings_es.json"))
    ap.add_argument("--out-dir", default=str(HERE))
    ap.add_argument("--work", default="/tmp/claude-0/music_opts")
    ap.add_argument("--only", default="1,2,3,4,5")
    a = ap.parse_args()
    os.makedirs(a.work, exist_ok=True)
    ev = json.load(open(a.events))
    report = {}
    for opt in [int(x) for x in a.only.split(",")]:
        mus, T = render_option(opt, a.timings)
        mw = os.path.join(a.work, f"music_{opt}.wav")
        S.write_wav(mw, mus, bits=24)
        st = sting_parts(opt, None)
        CS.sting_notes = lambda cache_dir, st=st: st          # the wordmark sting cues play this option's sting
        wav = os.path.join(a.work, f"opcion_{opt}.wav")
        rep = CS.build_block(ev, a.narration, wav, a.timings, str(AUD / "segments_es.json"),
                             lambda tp, mw=mw: (mw, {}), target=-14.0, ceiling=-1.5)
        rep = {k: v for k, v in rep.items() if k in ("voice_I", "music_rel_LU", "amb_rel_LU", "I", "TP", "LRA")}
        report[opt] = dict(title=OPTS[opt][0], **rep)
        print(opt, report[opt])
    json.dump(report, open(os.path.join(a.work, "report.json"), "w"), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main()
