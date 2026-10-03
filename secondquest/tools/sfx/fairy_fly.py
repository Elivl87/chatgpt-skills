#!/usr/bin/env python3
"""Fairy flight sound variants, synthesised from scratch (no samples): the Producer compares them by ear with the
reference he knows and picks the closest; the winner is then tuned and ported to scripts/placeholder-audio.ts.

  python3 tools/sfx/fairy_fly.py      -> public/shared/sfx/own/fairy_fly_{a..f}.wav (2.0 s each, 48 kHz)
"""
from pathlib import Path
import numpy as np
import soundfile as sf

SR, D = 48000, 2.0
OUT = Path(__file__).resolve().parents[2] / 'public/shared/sfx/own'
t = np.arange(int(SR * D)) / SR
rng = np.random.default_rng(7)
fade = np.minimum(1, np.minimum(t / 0.08, (D - t) / 0.25))


def tone(f, phase_mod=0):
    return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, t.shape)) / SR + phase_mod)


def bell(at, f, dec=0.12, amp=1.0):
    out = np.zeros_like(t)
    m = t >= at
    tt = t[m] - at
    env = np.exp(-tt / dec) * np.minimum(1, tt / 0.002)
    out[m] = amp * env * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.76 * f * tt) + 0.12 * np.sin(2 * np.pi * 5.4 * f * tt))
    return out


def norm(x, peak=0.8):
    return x * peak / (np.abs(x).max() + 1e-9)


V = {}
# A: fast two-note trill (high, sweet), like a tiny whistle fluttering
alt = (np.sin(2 * np.pi * 18 * t) > 0)
V['a'] = norm(tone(np.where(alt, 2637, 3136)) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t)) * fade)
# B: shimmering bell cloud: random high bells, dense, with tremolo
x = sum(bell(a, f, 0.09, 0.5) for a, f in zip(rng.uniform(0, D - 0.2, 70), rng.choice([2093, 2349, 2637, 3136, 3520, 4186], 70)))
V['b'] = norm(x * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * t)) * fade)
# C: wing buzz (airy amplitude-modulated noise) + sparse tinkles
n = rng.standard_normal(len(t))
spec = np.fft.rfft(n); fr = np.fft.rfftfreq(len(n), 1 / SR); spec *= np.exp(-((fr - 3200) / 1500) ** 2)
buzz = np.fft.irfft(spec, len(n)) * (0.55 + 0.45 * np.sin(2 * np.pi * 38 * t))
tink = sum(bell(a, f, 0.06, 0.6) for a, f in zip(np.arange(0.05, D - 0.2, 0.16), rng.choice([3136, 3520, 4186], 12)))
V['c'] = norm((norm(buzz, 0.5) + norm(tink, 0.6)) * fade)
# D: vibrato whistle: a pure high tone with fast vibrato and slow pitch wander (a "singing" light)
f = 2800 + 260 * np.sin(2 * np.pi * 14 * t) + 300 * np.sin(2 * np.pi * 0.7 * t)
V['d'] = norm((tone(f) + 0.25 * tone(2 * f)) * (0.75 + 0.25 * np.sin(2 * np.pi * 14 * t)) * fade)
# E: twinkle arpeggio loop (pentatonic, very high, quick), music-box like
notes = [2637, 3136, 3520, 4186, 3520, 3136]
V['e'] = norm(sum(bell(k * 0.085, notes[k % 6], 0.1, 0.7) for k in range(int((D - 0.2) / 0.085))) * fade)
# F: soft chirp loop: rising micro-glides repeating (each 0.12 s), airy
ph = (t % 0.12) / 0.12
chirp = tone(2400 + 1600 * ph) * np.sin(np.pi * ph) ** 2
V['f'] = norm((chirp + 0.2 * norm(buzz, 1)) * fade)

OUT.mkdir(parents=True, exist_ok=True)
for k, x in V.items():
    sf.write(OUT / f'fairy_fly_{k}.wav', x.astype(np.float32), SR)
print('wrote', ', '.join(f'fairy_fly_{k}.wav' for k in V))
