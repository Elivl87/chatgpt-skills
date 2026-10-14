#!/usr/bin/env python3
"""Own-synth sound for the vector test (no samples): lake ambience + SFX keyed to the scene timeline.
Every instance is varied (seeded pitch/filter/length), so no sound repeats identically. Master -14 LUFS.
  audio.py <events.json> <out.wav>
"""
import json, sys
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR, DUR = 48000, 15.0
N = int(SR * DUR)
ev = json.load(open(sys.argv[1]))
rng = np.random.default_rng(2026)
L, Rch = np.zeros(N), np.zeros(N)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[:N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2) * 1.414
    Rch[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2) * 1.414


def env(n, a, d):  # attack/decay seconds
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def tt(sec):
    return np.arange(int(sec * SR)) / SR


# ---------- ambience ----------
t = np.arange(N) / SR
noise = rng.standard_normal(N)
lap_mod = 0.55 + 0.45 * np.sin(2 * np.pi * 0.31 * t + 1) * np.sin(2 * np.pi * 0.17 * t)
lap = lp(bp(noise, 120, 900), 700) * lap_mod
lap2 = bp(rng.standard_normal(N), 900, 2600) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.43 * t) ** 8) * 0.25   # small wavelets
wind = bp(rng.standard_normal(N), 250, 1200) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t + 2))
L += (lap * 0.9 + lap2 + wind * 0.35) * 0.05
Rch += (np.roll(lap, 9000) * 0.9 + np.roll(lap2, 4000) + np.roll(wind, 30000) * 0.35) * 0.05
# crickets fading in at dusk (two individuals, different pitch/rhythm)
for f0, rate, pan, start, g in [(4300, 2.6, -0.6, 4.0, 0.010), (4750, 3.3, 0.55, 6.5, 0.008)]:
    tone = np.sin(2 * np.pi * f0 * t) * (np.sin(2 * np.pi * 34 * t) > 0.2)
    gate = (np.sin(2 * np.pi * rate * t) > 0.55).astype(float)
    gate = lp(gate, 60)
    fade = np.clip((t - start) / 3, 0, 1)
    add(tone * gate * fade, 0, g, pan)
# a few distant bird chirps early on
for tc, f, pan in [(0.6, 3200, -0.4), (0.82, 3500, -0.35), (2.4, 2900, 0.3), (2.55, 3100, 0.32), (4.9, 3300, 0.5)]:
    x = tt(0.09); fr = f * (1 + 0.35 * np.sin(np.pi * x / 0.09))
    add(np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(len(x), .005, .03), tc, 0.025, pan)


# ---------- SFX ----------
def knock(seed, f=140, dur=0.18):        # foot on wooden plank
    r = np.random.default_rng(seed); x = tt(dur); f = f * r.uniform(.88, 1.15)
    body = np.sin(2 * np.pi * f * x) * env(len(x), .002, .045) + 0.6 * np.sin(2 * np.pi * f * 2.3 * x) * env(len(x), .001, .02)
    click = bp(r.standard_normal(len(x)), 1500, 5000) * env(len(x), .0005, .006) * 0.5
    scuff = bp(r.standard_normal(len(x)), 2500, 7000) * env(len(x), .01, .04) * 0.15
    return body + click + scuff


def pan_of(x):  # screen x (design) -> pan
    return float(np.clip((x - 960) / 960, -0.8, 0.8))


for k, (ts, spd) in enumerate(ev['steps']):
    add(knock(100 + k), ts, 0.30 * (0.5 + 0.5 * spd), -0.6 + 0.5 * ts / 3.4)
# settle + sit on the dock edge
add(knock(500, 110, .3), 3.42, 0.22, -0.05)
add(bp(rng.standard_normal(int(.35 * SR)), 800, 4000) * env(int(.35 * SR), .08, .12), 3.75, 0.05, 0)   # hoodie rustle
add(knock(501, 92, .35), 4.28, 0.42, 0.05)
add(knock(502, 180, .2), 4.38, 0.12, 0.05)
# cast: anticipation rustle, whoosh, reel spin "zzz"
add(bp(rng.standard_normal(int(.3 * SR)), 900, 3500) * env(int(.3 * SR), .1, .08), 4.85, 0.05, 0.1)
x = tt(0.42); sweep = np.zeros(len(x)); nn = rng.standard_normal(len(x))
for i0 in range(0, len(x), 480):                                     # sweeping band-pass whoosh
    u = i0 / len(x); fc = 500 + 2600 * u ** 1.5
    seg = bp(nn[max(0, i0 - 2000):i0 + 480], fc * .7, fc * 1.3)[-480:]
    sweep[i0:i0 + len(seg)] = seg
add(sweep * np.sin(np.pi * x / 0.42) ** 2, 5.12, 0.55, 0.2)
x = tt(0.5); zz = np.sign(np.sin(2 * np.pi * (60 - 40 * x) * x)) * env(len(x), .005, .25)
add(bp(zz * rng.uniform(.8, 1, len(x)), 2000, 6000), 5.36, 0.08, 0.3)


def plop(seed, f0=900, f1=220, dur=.09, g=1.0):
    r = np.random.default_rng(seed); x = tt(dur + .25); f0 *= r.uniform(.9, 1.1)
    fr = f1 + (f0 - f1) * np.exp(-x / (dur / 3))
    tone = np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(len(x), .001, dur * .7)
    spl = bp(r.standard_normal(len(x)), 1200, 6000) * env(len(x), .002, .06) * 0.35
    drops = np.zeros(len(x))
    for _ in range(4):
        i = int(r.uniform(.04, .22) * SR); n = int(.03 * SR); ff = r.uniform(1800, 3200)
        if i + n < len(x):
            drops[i:i + n] += np.sin(2 * np.pi * ff * tt(.03)[:n] * (1 - tt(.03)[:n] * 8)) * env(n, .001, .008) * 0.25
    return (tone + spl + drops) * g


add(plop(1), 5.86, 0.55, 0.45)
add(plop(2, 1300, 400, .05), 8.32, 0.28, 0.45)                         # nibble
add(plop(3, 1150, 380, .05), 8.56, 0.32, 0.45)                         # nibble
add(plop(4, 700, 140, .14), 8.75, 0.75, 0.45)                          # the big dip "bloop"
add(bp(rng.standard_normal(int(.25 * SR)), 600, 3000) * env(int(.25 * SR), .01, .08), 8.78, 0.12, 0.05)   # jolt rustle
add(knock(503, 120, .25), 8.8, 0.18, 0.05)                              # bum bounces on the plank
# reel clicks while reeling (varied spacing/pitch, slight accel)
tc, k = 9.18, 0
while tc < 10.56:
    r = np.random.default_rng(900 + k); n = int(.012 * SR)
    clk = bp(r.standard_normal(n), r.uniform(3000, 4200), r.uniform(6000, 8000)) * env(n, .0003, .0025)
    clk += np.sin(2 * np.pi * r.uniform(2200, 2600) * tt(.012)[:n]) * env(n, .0003, .002) * 0.6
    add(clk, tc, 0.32 * r.uniform(.7, 1.0), 0.15)
    tc += r.uniform(.055, .075) * (1 - 0.15 * (tc - 9.18) / 1.4); k += 1
# line strain whine during the fight
x = tt(1.4); add(np.sin(2 * np.pi * (520 + 40 * np.sin(2 * np.pi * 3 * x)) * x) * np.sin(np.pi * x / 1.4) ** 2 * 0.5 *
                 (0.6 + 0.4 * np.sin(2 * np.pi * 7 * x)), 9.15, 0.02, 0.3)
# splash as the fish comes out
x = tt(0.9); r = np.random.default_rng(77)
spl = lp(r.standard_normal(len(x)), 3500) * env(len(x), .004, .18) + bp(r.standard_normal(len(x)), 300, 1200) * env(len(x), .002, .1) * 0.8
for i in range(10):
    i0 = int(r.uniform(.12, .8) * SR); n = int(.04 * SR)
    if i0 + n < len(x):
        spl[i0:i0 + n] += np.sin(2 * np.pi * r.uniform(1500, 3500) * tt(.04)[:n]) * env(n, .001, .01) * 0.3
add(spl, 10.58, 0.6, 0.35)
add(plop(5, 600, 160, .12), 10.6, 0.35, 0.35)
# drips from the fish (each one different)
for k, t0 in enumerate([11.0, 11.6, 12.2, 12.9, 13.6, 14.3]):
    add(plop(40 + k, 2600, 1400, .02, 1.0), t0 + .38, 0.10, 0.35)
# the fish's slow blink: a tiny dry lid "tick" (deadpan beat)
add(bp(np.random.default_rng(7).standard_normal(int(.02 * SR)), 1500, 4000) * env(int(.02 * SR), .001, .004), 12.13, 0.05, 0.3)
# sheepish beat: hoodie rustle as he scratches his head
add(bp(rng.standard_normal(int(.6 * SR)), 1500, 5000) * env(int(.6 * SR), .05, .2) * (0.6 + 0.4 * np.sin(2 * np.pi * 8 * tt(.6))), 13.0, 0.05, -0.1)

# ---------- master: fades, -14 LUFS, peak guard ----------
st = np.stack([L, Rch], 1)
fade = np.ones(N); fi, fo = int(.25 * SR), int(.6 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
st *= fade[:, None]
meter = pyln.Meter(SR)
st = pyln.normalize.loudness(st, meter.integrated_loudness(st), -14.0)
pk = np.abs(st).max()
if pk > 0.89:                                    # soft-knee guard instead of clipping
    st = np.tanh(st / 0.89) * 0.89
    st = pyln.normalize.loudness(st, meter.integrated_loudness(st), -14.0)
    st = np.clip(st, -0.97, 0.97)
print('LUFS %.2f  peak %.2f dBFS' % (meter.integrated_loudness(st), 20 * np.log10(np.abs(st).max())))
wavfile.write(sys.argv[2], SR, (st * 32767).astype(np.int16))
