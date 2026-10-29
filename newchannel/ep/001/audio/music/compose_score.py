#!/usr/bin/env python3
"""EP001 · "Cine suave" score: one continuous, warm music bed for the whole episode, composed in code and keyed to the
narration timings (no typed seconds: every section starts from a beat's first word in timings_es.json, so a new voice
take re-times the score automatically).

    python3 compose_score.py [--timings ../timings_es.json] [--mid score_es.mid] [--wav OUT.wav]

Dependencies: numpy + the fluidsynth binary + FluidR3_GM.sf2 (MIT). The MIDI writer is our own (no mido/pretty_midi),
so it runs with the same system python as the animatic sound builder. Key G major; channel motif D5 -> A5 -> G5.

Sections (beat ids from the script; the score follows the acts):
    hook   beats 01-02   "Ruta dorada": nylon guitar fingerpicking, acoustic bass, warm pad + slow strings, glock motif
    hush   beat 03 -> «Entonces» (04)   the guitar drops out: pad + strings + a few harmonics ("allá no hay nada")
    ask    «Entonces» -> wordmark   a Dsus4 that swells under the question and hangs
    sting  wordmark (no narration)  Dsus4 held softly (the motif itself is the sting effect, keyed to the cues)
    act 1-2 beats 06-12   "Curiosidad": pizzicato + marimba / harp / celesta, light and curious, 4 rotating variants
    night  beat 13        "Noche": slow, piano + harp + warm strings, the motif once on the piano
    act 3  beats 14-19    curious again, warmer (piano/guitar) from beat 18 "una persona paciente"
    act 4  beats 20-21    "Ruta dorada" again, fuller (cello line)
    act 5  beats 22-23    "Ruta dorada", softer
    lift   beat 24 + end card   the small lift: strings open up, glock + celesta motif, final cadence on G (v5: the
           end card is the title scene held after beat 24; the closing section starts 2.5 s after «Puntos»)

Voice band: no sustained part above ~1 kHz except the sparse glock/celesta motif; the render is high-passed at 40 Hz and
carved -2.5 dB at 2-3.5 kHz here (the mixer carves a further -3 dB while the narrator speaks and ducks the bed).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import struct
import subprocess
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
NC = HERE.parents[3]
sys.path.insert(0, str(NC / "engine"))
import sound as S  # noqa: E402

SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
SR = S.SR
CACHE = os.environ.get("TTD_SCORE_CACHE", "/tmp/claude-0/cine_suave_cache")
TIMINGS = HERE.parent / "timings_es.json"
WM_LAND = 0.32 + 2.02   # wordmark: the dot lands 2.34 s after «aparente» ends (mirrors shots_blockA.js tWM + WM.land)
END_CARD = 20.0         # end card length after the last beat's first word (script v4: "Pantalla final ... 20 s")
END_HOLD = 21.9         # script v5 (no end-card beat): the title scene holds from the last word to tagline (+1.9 s) + 20 s
END_RESOLVE = 2.5       # v5: the closing section (bars, then the long G) starts this long after the last word

# ------------------------------------------------------------------------------------------------ notes / chords

_PC = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def N(name: str) -> int:
    """'F#3' -> MIDI number (C4 = 60)."""
    p = _PC[name[0]]
    i = 1
    while i < len(name) and name[i] in "#b":
        p += 1 if name[i] == "#" else -1
        i += 1
    return p + 12 * (int(name[i:]) + 1)


CH = {  # bass root, 4 chord tones (low-mid register: keeps the bed under ~1 kHz)
    "G": ("G2", ["G3", "B3", "D4", "G4"]), "Gadd9": ("G2", ["G3", "A3", "B3", "D4"]),
    "Em7": ("E2", ["E3", "G3", "B3", "D4"]), "Em9": ("E2", ["G3", "B3", "D4", "F#4"]),
    "Cmaj7": ("C3", ["C3", "E3", "G3", "B3"]), "Cadd9": ("C2", ["C3", "G3", "D4", "E4"]),
    "D": ("D2", ["D3", "F#3", "A3", "D4"]), "Dsus4": ("D2", ["D3", "G3", "A3", "D4"]),
    "Bm7": ("B1", ["B2", "D3", "F#3", "A3"]), "G/B": ("B1", ["G3", "B3", "D4", "G4"]),
    "Am7": ("A1", ["A2", "E3", "G3", "C4"]), "D7sus4": ("D2", ["D3", "G3", "A3", "C4"]),
    "C": ("C2", ["C3", "E3", "G3", "C4"]),
}
FIFTH = {"G": "D3", "Gadd9": "D3", "Em7": "B2", "Em9": "B2", "Cmaj7": "G2", "Cadd9": "G2", "D": "A2", "Dsus4": "A2",
         "Bm7": "F#2", "G/B": "D3", "Am7": "E2", "D7sus4": "A2", "C": "G2"}
MOTIF = ("D5", "A5", "G5")

# ------------------------------------------------------------------------------------------------ MIDI (own writer)

TPS = 1920  # ticks per second at 120 bpm, 960 tpq: notes are placed in absolute seconds
PROGRAMS = {  # channel: (GM program, CC7 volume, CC10 pan, CC91 reverb)
    0: (89, 72, 64, 70),    # warm pad
    1: (49, 84, 70, 80),    # slow strings
    2: (24, 96, 54, 50),    # nylon guitar
    3: (32, 92, 64, 30),    # acoustic bass
    4: (9, 56, 74, 90),     # glockenspiel (motif)
    5: (46, 78, 44, 80),    # harp
    6: (45, 86, 60, 60),    # pizzicato strings
    7: (12, 70, 80, 70),    # marimba
    8: (8, 60, 84, 90),     # celesta
    10: (0, 80, 58, 70),    # piano
    11: (42, 74, 50, 70),   # cello
}


class Score:
    def __init__(self, seed=20261016):
        self.ev = []          # (tick, order, channel, bytes)
        self.rng = np.random.default_rng(seed)
        for ch, (prog, vol, pan, rev) in PROGRAMS.items():
            self.ev += [(0, 0, ch, bytes([0xC0 | ch, prog])), (0, 0, ch, bytes([0xB0 | ch, 7, vol])),
                        (0, 0, ch, bytes([0xB0 | ch, 10, pan])), (0, 0, ch, bytes([0xB0 | ch, 91, rev])),
                        (0, 0, ch, bytes([0xB0 | ch, 93, 30])), (0, 0, ch, bytes([0xB0 | ch, 11, 100]))]

    def note(self, ch, pitch, t, dur, vel, jitter=0.006):
        if isinstance(pitch, str):
            pitch = N(pitch)
        t = max(0.0, t + (self.rng.normal(0, jitter) if jitter else 0.0))
        vel = int(np.clip(round(vel * (1 + self.rng.normal(0, 0.04))), 1, 127))
        a, b = int(round(t * TPS)), int(round((t + max(0.03, dur)) * TPS))
        self.ev.append((a, 2, ch, bytes([0x90 | ch, pitch, vel])))
        self.ev.append((b, 1, ch, bytes([0x80 | ch, pitch, 0])))

    def cc(self, ch, num, val, t):
        self.ev.append((int(round(max(0.0, t) * TPS)), 1, ch, bytes([0xB0 | ch, num, int(np.clip(val, 0, 127))])))

    def ramp(self, ch, num, v0, v1, t0, t1, steps=None):
        steps = steps or max(2, int((t1 - t0) * 8))
        for k in range(steps + 1):
            self.cc(ch, num, v0 + (v1 - v0) * k / steps, t0 + (t1 - t0) * k / steps)

    def write(self, path):
        def vlq(x):
            out = [x & 0x7F]
            x >>= 7
            while x:
                out.append(0x80 | (x & 0x7F))
                x >>= 7
            return bytes(reversed(out))

        tracks = []
        tempo = b"\x00\xff\x51\x03" + (500000).to_bytes(3, "big") + b"\x00\xff\x58\x04\x04\x02\x18\x08"
        tracks.append(tempo + b"\x00\xff\x2f\x00")
        for ch in sorted({e[2] for e in self.ev}):
            evs = sorted((e for e in self.ev if e[2] == ch), key=lambda e: (e[0], e[1]))
            data, last = bytearray(), 0
            for tick, _, _, msg in evs:
                data += vlq(tick - last) + msg
                last = tick
            data += b"\x00\xff\x2f\x00"
            tracks.append(bytes(data))
        with open(path, "wb") as f:
            f.write(b"MThd" + struct.pack(">IHHH", 6, 1, len(tracks), 960))
            for tr in tracks:
                f.write(b"MTrk" + struct.pack(">I", len(tr)) + tr)


# ------------------------------------------------------------------------------------------------ timings -> sections

def beats_from_timings(path):
    W = json.load(open(path))
    order, first, last = [], {}, {}
    for w in W:
        b = w["beat"]
        if b not in first:
            order.append(b)
            first[b] = w["start"]
        last[b] = w["end"]
    return W, order, first, last


def word_time(W, word, beat, n=1, edge="start"):
    k = 0
    for w in W:
        if w["beat"] == beat and w["word"].strip("¡!¿?.,;:…«»\"'").lower() == word.lower():
            k += 1
            if k == n:
                return w[edge]
    raise KeyError(f"{word} #{n} not in beat {beat}")


def sections(timings_path):
    """-> list of (name, t0, t1, variant) covering 0 .. episode end. Every boundary comes from the timings."""
    W, order, first, last = beats_from_timings(timings_path)

    def lead(b):   # a section starts a little before its beat's first word (never before the previous word ends)
        i = order.index(b)
        prev_end = last[order[i - 1]] if i else 0.0
        return max(prev_end + 0.1, first[b] - 0.9) if i else 0.0

    def beat_or_next(b):
        if b in first:
            return lead(b)
        later = [x for x in order if x.isdigit() and int(x) > int(b)]
        return lead(later[0])

    t_ent = word_time(W, "Entonces", "04") - 0.3
    t_wm = last["04"] + 0.32
    has_card = order[-1] == "end"            # v4 had an end-card beat; v5 ends on the title scene (animatic E2 t1)
    end = first[order[-1]] + END_CARD if has_card else last[order[-1]] + END_HOLD
    marks = [("hook", 0.0, "01"), ("hush", beat_or_next("03"), "03"), ("ask", t_ent, "04"), ("sting", t_wm, "05")]
    for b in order:
        if not b.isdigit() or int(b) < 6:
            continue
        marks.append(("beat", lead(b), b))
    marks.append(("end", lead(order[-1]), order[-1]) if has_card else ("end", last[order[-1]] + END_RESOLVE, "end"))
    marks.sort(key=lambda m: m[1])
    out = []
    for i, (kind, t0, b) in enumerate(marks):
        t1 = marks[i + 1][1] if i + 1 < len(marks) else end
        out.append((kind, t0, t1, b))
    return out, end, t_wm + 2.02


STYLE = {  # beat -> (style, variant, intensity 0..1)
    "06": ("curious", 0, 0.55), "07": ("curious", 1, 0.6), "08": ("curious", 2, 0.6),
    "09": ("curious", 3, 0.55), "10": ("curious", 1, 0.6), "11": ("curious", 0, 0.65), "12": ("curious", 2, 0.62),
    "13": ("night", 0, 0.45),
    "14": ("curious", 3, 0.55), "15": ("curious", 0, 0.55), "16": ("curious", 2, 0.6), "17": ("curious", 1, 0.62),
    "18": ("warm", 0, 0.58), "19": ("warm", 1, 0.6),
    "20": ("road", 1, 0.75), "21": ("road", 2, 0.78),
    "22": ("road", 3, 0.6), "23": ("road", 0, 0.62),
    "24": ("lift", 0, 0.8), "end": ("lift_end", 0, 0.82),
}

PROG = {
    "road": [["G", "Cmaj7", "Em7", "D"], ["G", "D", "Em7", "Cmaj7"], ["Cmaj7", "G", "Am7", "D"], ["Em7", "Cmaj7", "G", "Dsus4"]],
    "curious": [["G", "Em7", "Cmaj7", "D"], ["Cmaj7", "D", "Bm7", "Em7"], ["Am7", "D7sus4", "G", "G/B"], ["Em7", "Cmaj7", "G", "D"]],
    "night": [["Em9", "Cmaj7", "G/B", "Dsus4"]],
    "warm": [["Cadd9", "G/B", "Am7", "D"], ["G", "Em7", "Cadd9", "D"]],
    "lift": [["Cmaj7", "D", "Em7", "G/B", "Cmaj7", "D", "G", "G"]],
}
BPM = {"road": 92, "curious": 100, "night": 66, "warm": 88, "lift": 90, "hush": 92, "ask": 92, "sting": 92}


def bar_grid(t0, t1, bpm, beats_per_bar=4):
    """Fit an integer number of bars in [t0, t1) with the tempo stretched by at most ~8 %; returns bar starts + beat."""
    dur = t1 - t0
    bar = beats_per_bar * 60.0 / bpm
    nb = max(1, int(round(dur / bar)))
    bar = dur / nb
    return [t0 + k * bar for k in range(nb)], bar / beats_per_bar


# ------------------------------------------------------------------------------------------------ layers

def pad_layer(sc, bars, beat, chords, inten, t_end):
    for k, bt in enumerate(bars):
        ch = chords[k % len(chords)]
        root, tones = CH[ch]
        d = (bars[k + 1] if k + 1 < len(bars) else t_end) - bt
        for p in tones[:3]:
            sc.note(0, p, bt, d + 0.05, 38 + 22 * inten, jitter=0)
        for p in tones[1:]:
            sc.note(1, N(p), bt + 0.02, d + 0.1, 34 + 30 * inten, jitter=0.01)
        sc.note(1, N(root) + 12, bt, d + 0.1, 30 + 26 * inten, jitter=0.01)


def guitar_layer(sc, bars, beat, chords, inten, fade_first=False):
    for k, bt in enumerate(bars):
        ch = chords[k % len(chords)]
        root, tones = CH[ch]
        c = [N(x) for x in tones]
        bass = N(root) + 12 if N(root) < N("E2") + 12 else N(root)
        pat = [bass, c[1], c[2], c[1] + 12 if c[1] + 12 < N("A4") else c[3], N(FIFTH[ch]) + 12, c[1], c[2], c[3]]
        f = 0.6 if (fade_first and k == 0) else 1.0
        for j, p in enumerate(pat):
            acc = 1.12 if j in (0, 4) else 0.92
            sc.note(2, p, bt + j * beat / 2, beat * (1.6 if j in (0, 4) else 0.9), (54 + 26 * inten) * acc * f)


def bass_layer(sc, bars, beat, chords, inten, style="half"):
    for k, bt in enumerate(bars):
        ch = chords[k % len(chords)]
        root = N(CH[ch][0])
        fifth = N(FIFTH[ch]) - (12 if N(FIFTH[ch]) - root > 12 else 0)
        if style == "half":
            sc.note(3, root, bt, beat * 1.9, 60 + 20 * inten)
            sc.note(3, fifth, bt + 2 * beat, beat * 1.9, 52 + 18 * inten)
        else:   # quarter walk
            for j, p in enumerate((root, root, fifth, fifth)):
                sc.note(3, p, bt + j * beat, beat * 0.85, (58 if j == 0 else 48) + 16 * inten)


def motif(sc, ch, t, step, vel, octave=0, hold=1.6):
    for j, nm in enumerate(MOTIF):
        sc.note(ch, N(nm) + 12 * octave, t + j * step, hold if j == 2 else step * 1.2, vel * (1.1 if j == 2 else 1.0))


def curious_layer(sc, bars, beat, chords, inten, variant):
    for k, bt in enumerate(bars):
        ch = chords[k % len(chords)]
        root, tones = CH[ch]
        c = [N(x) for x in tones]
        f = 0.65 if k == 0 else 1.0
        # pizzicato ostinato (8ths): root-fifth-third shapes, octave 3-4 (well under the voice band)
        if variant in (0, 1, 3):
            pat = [c[0], c[2], c[1], c[2], c[0] + 12 if c[0] + 12 <= N("D5") else c[3], c[2], c[1], c[2]]
            for j, p in enumerate(pat):
                if variant == 1 and j % 2:
                    continue
                sc.note(6, p, bt + j * beat / 2, beat * 0.4, (50 + 26 * inten) * (1.15 if j % 4 == 0 else 0.9) * f)
        # marimba on the offbeats (2-bar shape)
        if variant in (0, 2):
            for j in (1, 3) if k % 2 == 0 else (1, 2.5, 3.5):
                sc.note(7, c[(j * 2) % 4 if isinstance(j, int) else 3] + 12, bt + j * beat, beat * 0.8, (40 + 22 * inten) * f)
        # harp arpeggio rising (variants 2, 3)
        if variant in (2, 3):
            for j, p in enumerate(c + [c[1] + 12]):
                sc.note(5, p, bt + j * beat * 0.5, beat * 2.5, (36 + 20 * inten) * f)
        # acoustic bass: half notes
        sc.note(3, N(root), bt, beat * 1.8, 54 + 18 * inten)
        sc.note(3, N(FIFTH[ch]) - (12 if N(FIFTH[ch]) - N(root) > 12 else 0), bt + 2 * beat, beat * 1.8, 46 + 16 * inten)
    # a soft celesta quote of the motif in the 2nd bar (sparkle, low velocity, only where there is room)
    if len(bars) >= 3:
        motif(sc, 8, bars[1] + 2 * beat, beat * 0.5, 30 + 14 * inten, octave=0, hold=1.2)


def night_layer(sc, bars, beat, chords, inten):
    for k, bt in enumerate(bars):
        ch = chords[k % len(chords)]
        root, tones = CH[ch]
        c = [N(x) for x in tones]
        sc.note(11, N(root) + 12, bt, beat * 4.2, 40 + 16 * inten)                    # cello, long
        for j, p in enumerate((c[0], c[2], c[3], c[1] + 12 if c[1] + 12 < N("G4") else c[2])):   # sparse piano
            sc.note(10, p, bt + j * beat, beat * 2.5, 30 + 18 * inten + (6 if j == 0 else 0), jitter=0.02)
        if k % 2 == 1:
            for j, p in enumerate(c):                                                 # a slow harp roll
                sc.note(5, p + 12, bt + 2 * beat + j * 0.09, beat * 3, 28 + 14 * inten)
    if len(bars) >= 4:
        motif(sc, 10, bars[2] + beat, beat * 0.9, 34 + 10 * inten, hold=2.4)


def warm_layer(sc, bars, beat, chords, inten):
    for k, bt in enumerate(bars):
        ch = chords[k % len(chords)]
        root, tones = CH[ch]
        c = [N(x) for x in tones]
        for j, p in enumerate((c[0], c[2], c[1], c[3])):
            sc.note(10, p, bt + j * beat, beat * 1.8, 36 + 20 * inten, jitter=0.012)
    guitar_layer(sc, bars[1:], beat, chords[1:] + chords[:1], inten * 0.75)
    for k, bt in enumerate(bars):
        ch = chords[k % len(chords)]
        sc.note(3, N(CH[ch][0]), bt, beat * 3.6, 52 + 16 * inten)


# ------------------------------------------------------------------------------------------------ the score

def compose(timings_path=TIMINGS):
    secs, end, t_land = sections(timings_path)
    sc = Score()
    plan = []
    for kind, t0, t1, b in secs:
        if kind == "hook":
            st, var, inten = "road", 0, 0.7
        elif kind in ("hush", "ask", "sting"):
            st, var, inten = kind, 0, 0.4
        else:
            st, var, inten = STYLE.get(b, ("curious", 0, 0.55))
        plan.append({"section": kind, "beat": b, "style": st, "variant": var, "t0": round(t0, 3), "t1": round(t1, 3),
                     "intensity": inten})
        if st == "road":
            chords = PROG["road"][var % 4]
            bars, beat = bar_grid(t0, t1, BPM["road"])
            pad_layer(sc, bars, beat, chords, inten, t1)
            guitar_layer(sc, bars, beat, chords, inten, fade_first=kind != "hook")
            bass_layer(sc, bars, beat, chords, inten)
            if kind == "hook" or var in (1, 2):
                motif(sc, 4, bars[min(1, len(bars) - 1)] + 2 * beat, beat * 0.5, 38 + 16 * inten)
            if var in (1, 2):   # act 4: a cello line underneath, long notes
                for k, bt in enumerate(bars):
                    sc.note(11, N(CH[chords[k % 4]][0]) + 12, bt, beat * 4, 44 + 18 * inten)
        elif st == "hush":
            chords = ["Em7", "Cmaj7"]
            bars, beat = bar_grid(t0, t1, BPM["hush"])
            pad_layer(sc, bars, beat, chords, 0.62, t1)
            for k, bt in enumerate(bars):
                sc.note(3, N(CH[chords[k % 2]][0]), bt, beat * 3.8, 50)
                if k % 2 == 0:
                    sc.note(2, "B4" if k % 4 == 0 else "G4", bt + beat, beat * 3, 50)
                    sc.note(5, "E3" if k % 4 == 0 else "C3", bt, beat * 4, 44)
        elif st == "ask":      # Dsus4 swell under the question, through the wordmark
            sc.note(0, "D3", t0, t1 - t0 + 0.2, 50, jitter=0)
            for p in ("D3", "G3", "A3", "D4"):
                sc.note(1, p, t0, t1 - t0 + 0.2, 70, jitter=0)
            sc.note(3, "D2", t0, t1 - t0, 50, jitter=0)
            sc.ramp(1, 11, 45, 112, t0, t1)
            sc.ramp(0, 11, 70, 105, t0, t1)
        elif st == "sting":    # hold the suspension softly under the sting; it resolves on act 1's first G
            for p in ("D3", "G3", "A3"):
                sc.note(0, p, t0, t1 - t0 + 0.4, 58, jitter=0)
            for p in ("D3", "G3", "A3", "D4"):
                sc.note(1, p, t0, t1 - t0 + 0.4, 72, jitter=0)
            sc.note(3, "D2", t0, t1 - t0, 46, jitter=0)
            sc.ramp(1, 11, 112, 60, t0, t0 + 1.2)
            sc.ramp(0, 11, 105, 80, t0, t0 + 1.2)
            sc.cc(1, 11, 100, t1 - 0.05)
            sc.cc(0, 11, 100, t1 - 0.05)
        elif st == "curious":
            chords = PROG["curious"][var % 4]
            bars, beat = bar_grid(t0, t1, BPM["curious"])
            pad_layer(sc, bars, beat, chords, inten * 0.8, t1)
            curious_layer(sc, bars, beat, chords, inten, var)
        elif st == "night":
            chords = PROG["night"][0]
            bars, beat = bar_grid(t0, t1, BPM["night"])
            pad_layer(sc, bars, beat, chords, inten * 0.8, t1)
            night_layer(sc, bars, beat, chords, inten)
        elif st == "warm":
            chords = PROG["warm"][var % 2]
            bars, beat = bar_grid(t0, t1, BPM["warm"])
            pad_layer(sc, bars, beat, chords, inten * 0.85, t1)
            warm_layer(sc, bars, beat, chords, inten)
        elif st in ("lift", "lift_end"):
            chords = PROG["lift"][0]
            if st == "lift_end":   # the end card closes on a long G: bars up to 4 s before the end, then the chord
                bars, beat = bar_grid(t0, max(t0 + 2.0, t1 - 4.5), BPM["lift"])
            else:
                bars, beat = bar_grid(t0, t1, BPM["lift"])
            pad_layer(sc, bars, beat, chords, inten, bars[-1] + 4 * beat)
            guitar_layer(sc, bars, beat, chords, inten)
            bass_layer(sc, bars, beat, chords, inten, style="half")
            for k, bt in enumerate(bars):   # strings open up an octave (still under 1 kHz)
                for p in CH[chords[k % len(chords)]][1][1:]:
                    sc.note(1, N(p) + 12 if N(p) + 12 <= N("B4") else N(p), bt + 0.03, 4 * beat, 40 + 26 * inten)
                sc.note(11, N(CH[chords[k % len(chords)]][0]) + 12, bt, 4 * beat, 46 + 18 * inten)
            motif(sc, 4, bars[0] + 2 * beat, beat * 0.5, 44 + 14 * inten)
            if len(bars) > 4:
                motif(sc, 8, bars[4] + 2 * beat, beat * 0.5, 34 + 12 * inten)
            if st == "lift_end":   # final G (add9) with a harp roll and the motif on the glock, ringing out
                tf = bars[-1] + 4 * beat
                ring = max(3.5, end - tf)
                for p in ("G2", "D3", "G3", "B3", "D4"):
                    sc.note(0, p, tf, ring, 52, jitter=0)
                    sc.note(1, p, tf + 0.02, ring, 58, jitter=0)
                sc.note(3, "G1", tf, ring * 0.8, 62, jitter=0)
                for j, p in enumerate(("G3", "B3", "D4", "G4", "A4", "B4", "D5")):
                    sc.note(5, p, tf + j * 0.08, ring, 46, jitter=0)
                motif(sc, 4, tf + 0.9, 0.42, 42, hold=2.6)
                sc.ramp(0, 11, 100, 0, end - 3.0, end)
                sc.ramp(1, 11, 100, 0, end - 3.0, end)
    return sc, plan, end


# ------------------------------------------------------------------------------------------------ render

def _fft_eq(x, lo_cut=40.0, carve=(2000.0, 3500.0, -2.5)):
    n = len(x)
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = 1.0 / np.sqrt(1 + (lo_cut / np.maximum(f, 1e-3)) ** 8)          # HPF ~ 4th order
    a, b, d = carve
    fc, bw = np.sqrt(a * b), np.log2(b / a)
    bell = np.exp(-0.5 * (np.log2(np.maximum(f, 1) / fc) / (bw / 2)) ** 2)
    g = g * S.db(d * bell)
    return np.fft.irfft(X * g[:, None], n, axis=0).astype(np.float32)


def render(mid, wav, dur):
    raw = Path(str(wav) + ".raw.wav")
    subprocess.run(["nice", "-n", "10", "fluidsynth", "-ni", "-q", "-T", "wav", "-F", str(raw), "-r", str(SR),
                    "-g", "0.5", "-o", "synth.cpu-cores=1", "-o", "synth.reverb.room-size=0.62",
                    "-o", "synth.reverb.damp=0.35", "-o", "synth.reverb.width=0.9", "-o", "synth.reverb.level=0.75",
                    "-o", "synth.chorus.active=0", SF2, str(mid)], check=True, capture_output=True)
    x = S.load_audio(raw)
    os.remove(raw)
    n = int(round(dur * SR))
    y = np.zeros((n, 2), np.float32)
    y[: min(n, len(x))] = x[:n]
    y = _fft_eq(y)
    y *= 0.5 / (np.abs(y).max() + 1e-9)
    tmp = Path(str(wav) + ".part.wav")
    S.write_wav(tmp, y, bits=16)
    os.replace(tmp, wav)
    return wav


def score_key(timings_path):
    h = hashlib.sha1(Path(timings_path).read_bytes() + Path(__file__).read_bytes())
    return h.hexdigest()[:12]


def ensure_score(timings_path=TIMINGS, cache=CACHE):
    """The rendered score for these timings (cached by hash of timings + this file). -> (wav path, plan)."""
    os.makedirs(cache, exist_ok=True)
    key = score_key(timings_path)
    wav = Path(cache) / f"score_{key}.wav"
    pj = Path(cache) / f"score_{key}.json"
    if not wav.exists() or not pj.exists():
        sc, plan, end = compose(timings_path)
        mid = Path(cache) / f"score_{key}.mid"
        sc.write(mid)
        render(mid, wav, end)
        json.dump({"end": end, "sections": plan}, open(pj, "w"), indent=1)
    return wav, json.load(open(pj))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--timings", default=str(TIMINGS))
    ap.add_argument("--mid", default=str(HERE / "score_es.mid"))
    ap.add_argument("--wav", default=None)
    a = ap.parse_args()
    sc, plan, end = compose(a.timings)
    sc.write(a.mid)
    json.dump({"end": round(end, 3), "sections": plan}, open(HERE / "score_es_plan.json", "w"), indent=1)
    print(f"score: {end:.1f} s, {len(plan)} sections -> {a.mid}")
    if a.wav:
        render(a.mid, a.wav, end)
        print(json.dumps(S.measure_file(a.wav)))


if __name__ == "__main__":
    main()
