"""Sound direction "Cine suave" (Producer, 2026-10-16): a constant warm music bed under everything, real-sounding
ambience, and a few soft effects that never distract from the narration. Characters are silent (text boxes only).

numpy only (runs with the system python of the animatic builder). Every sound is synthesised here, seeded and
deterministic: no recordings, no stock, nothing to license beyond our own code (the score uses FluidSynth + FluidR3_GM,
MIT, see ep/<n>/audio/music/compose_score.py).

Ambience (one bed per scene type, `BEDS`), built from:
    wind()      spectral noise whose cutoff and level follow slow random gusts, plus a grass/leaf rustle band
    birds()     songbird phrases: FM syllables (descending whistles, trills, two-tone calls, chips), per-bird pitch,
                natural variation per syllable, distance (level + darkening), outdoor early reflections
    traffic()   distant road: low brown rumble with slow swells and passing cars (Doppler-like spectral bump, panned)
    crickets()  several individuals (carrier 4.2-5.4 kHz, 3-5 pulses per chirp, own rate), plus a faint far chorus
    crowd()     babble of many talkers: speech-shaped spectrum with syllabic flutter and slow swells
    engines()   idling cars (low harmonic hum with jitter), for the toll plaza
Effects (`SFX`, few and soft): soft_squeak (key brakes only), soft_thud (suspension), whoosh (big camera moves),
paper_pop (text boxes), sting (wordmark: the 3-note motif on FluidSynth celesta + harp), bike_bell, crowd_swell.

Levels (relative to the narration of the same block): music -12 LU (ducked 7 dB and carved a further -3 dB at
2-3.5 kHz while the narrator speaks), ambience -21 LU (ducked 4 dB), effects -13 dB (400 ms RMS vs. the narration's
median 400 ms RMS; brakes/whoosh -14, paper pop -19, sting -6: it plays where nobody speaks). Master -14 LUFS, TP <= -1.5 dBTP.
"""
from __future__ import annotations

import hashlib
import json
import math
import os
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sound as S  # noqa: E402

SR = S.SR
FR, HOP = 2048, 512
FREQS = np.fft.rfftfreq(FR, 1 / SR).astype(np.float32)

LEVELS = {"music_rel": -12.0, "music_duck": 7.0, "music_carve": 3.0, "amb_rel": -21.0, "amb_duck": 4.0,
          "sfx_rel": -13.0}
SFX_REL = {"soft_squeak": -14.0, "soft_thud": -14.0, "whoosh": -14.0, "paper_pop": -19.0, "sting": -6.0,
           "bike_bell": -15.0, "crowd_swell": -15.0, "gust": -16.0}


# ------------------------------------------------------------------------------------------------ helpers

def smooth_random(n, rate, seed, lo=0.0, hi=1.0, power=1.0):
    """A slow random curve (n samples): control points every 1/rate s, cosine-interpolated, mapped to [lo, hi]."""
    rng = np.random.default_rng(seed)
    k = int(n / SR * rate) + 3
    pts = rng.random(k) ** power
    x = np.arange(n) / SR * rate
    i = np.floor(x).astype(int)
    fr = x - i
    w = (1 - np.cos(np.pi * fr)) / 2
    y = pts[i] * (1 - w) + pts[i + 1] * w
    return (lo + (hi - lo) * y).astype(np.float32)


def at_frames(curve, nfr):
    idx = np.minimum(np.arange(nfr) * HOP, len(curve) - 1)
    return curve[idx]


def spectral_noise(n, mag, seed, chunk=1500):
    """Noise with a time-varying magnitude spectrum: mag(frame_times[s], freqs[Hz]) -> (frames, bins).
    Random-phase frames, Hann window, 4x overlap-add (chunked, stateless -> continuous)."""
    rng = np.random.default_rng(seed)
    nfr = n // HOP + 4
    out = np.zeros(nfr * HOP + FR, np.float32)
    win = np.hanning(FR).astype(np.float32)
    for c0 in range(0, nfr, chunk):
        c1 = min(nfr, c0 + chunk)
        tt = (np.arange(c0, c1) * HOP / SR).astype(np.float32)
        M = mag(tt, FREQS).astype(np.float32)
        ph = rng.uniform(0, 2 * np.pi, M.shape).astype(np.float32)
        fr = np.fft.irfft(M * np.exp(1j * ph), FR, axis=1).astype(np.float32) * win
        for k in range(c1 - c0):
            i0 = (c0 + k) * HOP
            out[i0:i0 + FR] += fr[k]
    y = out[FR // 2: FR // 2 + n]
    return y / (np.sqrt(np.mean(y ** 2)) + 1e-9) * 0.1


def fft_filter(x, gain_fn):
    """Static filter by FFT: gain_fn(freqs) -> gain. x mono or stereo."""
    n = len(x)
    X = np.fft.rfft(x, axis=0)
    g = gain_fn(np.fft.rfftfreq(n, 1 / SR)).astype(np.float32)
    return np.fft.irfft(X * (g[:, None] if x.ndim > 1 else g), n, axis=0).astype(np.float32)


def lp(fc, order=2):
    return lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * order))


def hp(fc, order=2):
    return lambda f: 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** (2 * order))


def bell(fc, oct_bw, gain_db):
    return lambda f: S.db(gain_db * np.exp(-0.5 * (np.log2(np.maximum(f, 1) / fc) / (oct_bw / 2)) ** 2))


def pan2(x, pan):
    """mono -> stereo with constant-power pan (pan scalar or per-sample array, -1..1)."""
    p = np.clip(pan, -1, 1)
    l, r = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
    return np.stack([x * l, x * r], 1).astype(np.float32)


def reverb_ir(rt60, seed, predelay=0.012, bright_t=0.25, er=()):
    """Stereo IR: early reflections (delay s, gain) + exponentially decaying noise that darkens with time."""
    n = int(rt60 * 1.1 * SR) + int(predelay * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(seed)
    out = np.zeros((n, 2), np.float32)
    env = np.exp(-6.9 * np.maximum(t - predelay, 0) / rt60) * (t >= predelay)
    for ch in range(2):
        w = rng.standard_normal(n).astype(np.float32)
        dark = fft_filter(w, lp(1800, 1))
        mixw = np.exp(-np.maximum(t - predelay, 0) / bright_t)
        out[:, ch] = env * (mixw * w + (1 - mixw) * dark * 1.6)
    for d, g in er:
        i = int(d * SR)
        if i < n:
            out[i, 0] += g
            out[min(n - 1, i + int(0.0007 * SR)), 1] += g * 0.9
    return out / (np.sqrt((out ** 2).sum(0).mean()) + 1e-9)


def convolve(x, ir, wet=0.3):
    """x stereo (n,2) or mono -> stereo; FFT convolution, wet/dry by energy."""
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    n, m = len(x), len(ir)
    L = 1 << int(math.ceil(math.log2(n + m)))
    y = np.zeros((n, 2), np.float32)
    for ch in range(2):
        Y = np.fft.irfft(np.fft.rfft(x[:, ch], L) * np.fft.rfft(ir[:, ch], L), L)[:n]
        y[:, ch] = Y
    rx = np.sqrt(np.mean(x ** 2)) + 1e-9
    ry = np.sqrt(np.mean(y ** 2)) + 1e-9
    return ((1 - wet) * x + wet * y * (rx / ry)).astype(np.float32)


OUTDOOR = dict(rt60=0.9, predelay=0.02, bright_t=0.08, er=((0.031, 0.35), (0.047, 0.22), (0.083, 0.12)))
DOME = dict(rt60=3.2, predelay=0.04, bright_t=0.4, er=((0.06, 0.4), (0.11, 0.3), (0.19, 0.2)))


# ------------------------------------------------------------------------------------------------ ambience sources

def wind(n, seed, strength=1.0, rustle=1.0, gust_rate=0.14):
    """Wind through grass: low air (cutoff/level follow gusts) + a leaf/grass rustle band that flutters in gusts."""
    g = smooth_random(n, gust_rate, seed, 0.0, 1.0, 1.4) * 0.7 + smooth_random(n, gust_rate * 3.1, seed + 1, 0, 0.3)
    nfr = n // HOP + 4

    def air(tt, f):
        gf = at_frames(g, nfr)[: len(tt), None]
        fc = 380 + 1500 * gf                     # the "shhh" opens up in a gust
        m = 1 / np.sqrt(f + 60) * (1 / np.sqrt(1 + (f / fc) ** 4)) * (1 / np.sqrt(1 + (110 / np.maximum(f, 1)) ** 4))
        return m * (0.2 + 0.8 * gf)

    flick = smooth_random(n, 9.0, seed + 2, 0.4, 1.0)

    def leaves(tt, f):
        gf = at_frames(g, nfr)[: len(tt), None]
        fl = at_frames(flick, nfr)[: len(tt), None]
        m = np.exp(-0.5 * (np.log2(np.maximum(f, 1) / 2600) / 1.1) ** 2)
        return m * (0.15 + gf ** 1.6) * fl

    out = np.zeros((n, 2), np.float32)
    for ch, s in enumerate((seed * 7 + 11, seed * 7 + 12)):
        a = spectral_noise(n, air, s)
        b = spectral_noise(n, leaves, s + 100)
        out[:, ch] = a * strength + b * 0.55 * rustle
    mid = out.mean(1, keepdims=True)
    return (0.55 * out + 0.45 * mid).astype(np.float32)   # partly correlated (wide, not two random channels)


def _syllable(kind, f0, dur, rng):
    m = max(8, int(dur * SR))
    t = np.arange(m) / SR
    u = t / dur
    if kind == "down":       # descending whistle
        f = f0 * (1.25 - 0.4 * u)
    elif kind == "up":
        f = f0 * (0.85 + 0.35 * u)
    elif kind == "arch":
        f = f0 * (0.9 + 0.3 * np.sin(np.pi * u))
    elif kind == "flat":
        f = f0 * (1.0 - 0.06 * u)
    else:                    # chip: fast down-sweep
        f = f0 * (1.4 - 0.7 * u)
    f = f * (1 + 0.012 * np.sin(2 * np.pi * rng.uniform(25, 45) * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.sin(np.pi * np.clip(u, 0, 1)) ** 1.5
    return ((np.sin(ph) + 0.12 * np.sin(2 * ph)) * env).astype(np.float32)


SPECIES = ("whistler", "trill", "feebee", "chips")


def bird_phrase(species, base, rng):
    out = []
    if species == "whistler":            # meadowlark-like: 3-6 slurred, descending notes
        for j in range(rng.integers(3, 7)):
            out.append((_syllable(rng.choice(["down", "arch", "flat"]), base * (1.15 - 0.07 * j) * rng.uniform(0.95, 1.05),
                                  rng.uniform(0.07, 0.22), rng), rng.uniform(0.02, 0.07)))
    elif species == "trill":             # finch/sparrow: a few intro notes then a fast trill
        for _ in range(rng.integers(1, 3)):
            out.append((_syllable("arch", base * rng.uniform(0.9, 1.1), rng.uniform(0.08, 0.14), rng), 0.06))
        d = rng.uniform(0.025, 0.04)
        f = base * rng.uniform(1.0, 1.3)
        for _ in range(rng.integers(8, 20)):
            out.append((_syllable("up", f * rng.uniform(0.98, 1.02), d, rng), d * 0.35))
    elif species == "feebee":            # two-tone call
        out.append((_syllable("flat", base * 1.18, rng.uniform(0.25, 0.35), rng), 0.05))
        out.append((_syllable("down", base * rng.uniform(0.95, 1.0), rng.uniform(0.22, 0.32), rng), 0.0))
    else:                                # chips
        for _ in range(rng.integers(2, 5)):
            out.append((_syllable("chip", base * rng.uniform(1.2, 1.5), rng.uniform(0.03, 0.05), rng), rng.uniform(0.08, 0.2)))
    m = sum(len(s) + int(g * SR) for s, g in out)
    y = np.zeros(m, np.float32)
    i = 0
    for s, gap in out:
        y[i:i + len(s)] += s
        i += len(s) + int(gap * SR)
    return y


def birds(n, seed, n_birds=4, rate=(4.0, 11.0), level=1.0):
    """Several individual birds, each with its own species, pitch, distance, pan and song interval."""
    rng = np.random.default_rng(seed)
    out = np.zeros((n, 2), np.float32)
    for b in range(n_birds):
        sp = SPECIES[rng.integers(0, len(SPECIES))]
        base = {"whistler": 2900, "trill": 3600, "feebee": 3300, "chips": 3800}[sp] * rng.uniform(0.85, 1.15)
        dist = rng.uniform(0.25, 1.0)                     # 1 = near
        pan = rng.uniform(-0.85, 0.85)
        t = rng.uniform(0, rate[1])
        mono = np.zeros(n, np.float32)
        while t < n / SR:
            ph = bird_phrase(sp, base, rng) * rng.uniform(0.7, 1.0)
            i0 = int(t * SR)
            seg = ph[: max(0, n - i0)]
            mono[i0:i0 + len(seg)] += seg
            t += len(ph) / SR + rng.uniform(*rate)
        if dist < 0.6:                                    # far birds lose their top end
            mono = fft_filter(mono, lp(3000 + 6000 * dist, 1))
        out += pan2(mono * dist ** 1.2, pan)
    return convolve(out * level, reverb_ir(seed=seed + 5, **OUTDOOR), wet=0.35)


def traffic(n, seed, level=1.0, passes_per_min=6.0, near=0.0):
    """Distant road: brown rumble with slow swells + passing cars (spectral bump that brightens at the pass, panned)."""
    sw = smooth_random(n, 0.06, seed, 0.55, 1.0)
    nfr = n // HOP + 4

    def rumble(tt, f):
        s = at_frames(sw, nfr)[: len(tt), None]
        fc = 220 + 500 * near
        return (1 / (f + 25)) * (1 / np.sqrt(1 + (f / fc) ** 4)) * (1 / np.sqrt(1 + (30 / np.maximum(f, 1)) ** 4)) * s

    out = np.zeros((n, 2), np.float32)
    for ch in range(2):
        out[:, ch] = spectral_noise(n, rumble, seed * 13 + ch)
    out = 0.6 * out + 0.4 * out.mean(1, keepdims=True)
    rng = np.random.default_rng(seed + 3)
    t = rng.uniform(0, 8)
    while t < n / SR:
        d = rng.uniform(4.0, 9.0)                         # pass-by length
        m = int(d * SR)
        u = np.arange(m) / m
        peak = np.exp(-0.5 * ((u - 0.5) / 0.16) ** 2)
        pk_f = at_frames(peak.astype(np.float32), m // HOP + 4)

        def car(tt, f, pk_f=pk_f):
            p = pk_f[: len(tt), None]
            fc = 250 + (700 + 1600 * near) * p           # brighter as it passes (tyres)
            return (1 / (f + 40)) * (1 / np.sqrt(1 + (f / fc) ** 4)) * (1 / np.sqrt(1 + (40 / np.maximum(f, 1)) ** 4))

        x = spectral_noise(m, car, int(rng.integers(1 << 30))) * peak * rng.uniform(0.6, 1.3) * (1.0 + 1.5 * near)
        direction = rng.choice([-1, 1])
        st = pan2(x, direction * (u - 0.5) * 1.6)
        i0 = int(t * SR)
        seg = st[: max(0, n - i0)]
        out[i0:i0 + len(seg)] += seg
        t += rng.exponential(60.0 / passes_per_min) + 1.5
    return out * level


def crickets(n, seed, n_crickets=6, level=1.0):
    rng = np.random.default_rng(seed)
    out = np.zeros((n, 2), np.float32)
    for c in range(n_crickets):
        fc = rng.uniform(4200, 5400)
        pulse = rng.uniform(0.012, 0.018)
        per = rng.uniform(0.026, 0.038)
        npulse = int(rng.integers(3, 6))
        chirp_T = rng.uniform(0.45, 0.95)
        dist = rng.uniform(0.2, 1.0)
        pan = rng.uniform(-0.9, 0.9)
        m = int((per * npulse + 0.02) * SR)
        tt = np.arange(m) / SR
        tmpl = np.zeros(m, np.float32)
        for k in range(npulse):
            u = (tt - k * per) / pulse
            env = np.where((u >= 0) & (u <= 1), np.sin(np.pi * np.clip(u, 0, 1)) ** 2, 0)
            tmpl += (env * np.sin(2 * np.pi * fc * tt + 0.3 * np.sin(2 * np.pi * 180 * tt))).astype(np.float32) * (0.85 + 0.15 * (k == 0))
        mono = np.zeros(n, np.float32)
        t = rng.uniform(0, chirp_T)
        while t < n / SR - 0.2:
            i0 = int(t * SR)
            g = rng.uniform(0.8, 1.0)
            mono[i0:i0 + m] += tmpl[: max(0, n - i0)] * g
            t += chirp_T * rng.uniform(0.94, 1.06)
            if rng.random() < 0.04:
                t += rng.uniform(1.0, 3.0)                 # an occasional pause
        if dist < 0.6:
            mono = fft_filter(mono, lp(5500 + 4000 * dist, 2))
        out += pan2(mono * dist ** 1.5, pan)
    # far chorus: a faint pulsing band around 4.8 kHz
    am = (0.6 + 0.4 * np.sin(2 * np.pi * 31 * np.arange(n) / SR)).astype(np.float32)
    chorus = S._bandnoise(n, 4300, 5300, seed + 9) * am * smooth_random(n, 0.2, seed + 10, 0.5, 1.0)
    out += pan2(chorus * 0.06, 0.0)
    return convolve(out * level, reverb_ir(seed=seed + 4, **OUTDOOR), wet=0.4)


def crowd(n, seed, level=1.0, talkers_flutter=0.25):
    """Murmur of a crowd: speech-shaped spectrum, per-band syllabic flutter (many talkers), slow swells."""
    nfr = n // HOP + 4
    swell = smooth_random(n, 0.08, seed, 0.65, 1.0)
    rng = np.random.default_rng(seed + 1)
    nb = 10
    bands_c = np.geomspace(180, 3500, nb)
    flut = np.stack([smooth_random(n // 64 + 2, 4.5 * 64, int(rng.integers(1 << 30)), 1 - talkers_flutter, 1.0)
                     for _ in range(nb)], 1)     # control rate (every 64 samples)

    def mag(tt, f):
        k = len(tt)
        fi = np.minimum(((np.arange(k) + int(tt[0] * SR / HOP)) * HOP) // 64, len(flut) - 1)
        fl = flut[fi]                                                # (k, nb)
        w = np.exp(-0.5 * (np.log2(np.maximum(f[None, :, None], 1) / bands_c[None, None, :]) / 0.45) ** 2)
        shape = np.exp(-0.5 * (np.log2(np.maximum(f, 1) / 520) / 1.15) ** 2) * (1 / np.sqrt(1 + (120 / np.maximum(f, 1)) ** 4))
        gm = (w * fl[:, None, :]).sum(2) / (w.sum(2) + 1e-6)
        return shape[None, :] * gm * at_frames(swell, nfr)[:k, None]

    out = np.zeros((n, 2), np.float32)
    for ch in range(2):
        out[:, ch] = spectral_noise(n, mag, seed * 17 + ch, chunk=400)
    return out * level


def engines(n, seed, n_cars=4, level=1.0):
    """Idling cars: low harmonic hum (firing ~ 24-32 Hz) with jitter, darkened, spread."""
    rng = np.random.default_rng(seed)
    t = np.arange(n) / SR
    out = np.zeros((n, 2), np.float32)
    for c in range(n_cars):
        f0 = rng.uniform(24, 32)
        wob = 1 + 0.015 * smooth_random(n, 2.0, int(rng.integers(1 << 30)), -1, 1)
        ph = 2 * np.pi * np.cumsum(f0 * wob) / SR
        x = sum((0.8 / k) * np.sin(k * ph + rng.uniform(0, 6)) for k in range(1, 7))
        x = x * (0.8 + 0.2 * smooth_random(n, 6.0, int(rng.integers(1 << 30))))
        x = x + 0.25 * S._bandnoise(n, 60, 400, int(rng.integers(1 << 30))) * 0.3
        out += pan2(fft_filter(x.astype(np.float32), lp(260, 2)) * rng.uniform(0.4, 1.0), rng.uniform(-0.8, 0.8))
    return out * level


def room_tone(n, seed, level=1.0):
    """Big indoor space: ventilation hum + faint air."""
    x = S._bandnoise(n, 60, 500, seed) * 0.6 + S._bandnoise(n, 500, 2500, seed + 1) * 0.08
    t = np.arange(n) / SR
    x = x + 0.15 * np.sin(2 * np.pi * 120 * t) * smooth_random(n, 0.1, seed + 2, 0.6, 1.0)
    return pan2(x.astype(np.float32), 0.0) * level


# ------------------------------------------------------------------------------------------------ scene beds

def _rms(x):
    return float(np.sqrt(np.mean(x ** 2)) + 1e-12)


def _norm(x, db_):
    return x * (S.db(db_) * 0.1 / _rms(x))


def bed(scene, n, seed=1):
    """One ambience bed per scene type -> (n, 2). Internal balance only; the mixer sets the bed level."""
    s = seed
    if scene == "golden_highway":       # open road at golden hour: wind in the roadside grass, birds, the road
        x = _norm(wind(n, s, 1.0, 0.9), 0) + _norm(birds(n, s + 1, 3, (5, 12)), -9) + _norm(traffic(n, s + 2, passes_per_min=5), -4)
    elif scene == "ring_field":         # the test track in a field: grass wind, more birds, very distant road
        x = _norm(wind(n, s, 0.9, 1.0), 0) + _norm(birds(n, s + 1, 5, (3, 9)), -7) + _norm(traffic(n, s + 2, passes_per_min=3), -14)
    elif scene == "cloudy_field":       # the straight queue under clouds: more wind, fewer birds
        x = _norm(wind(n, s, 1.1, 0.7, 0.18), 0) + _norm(birds(n, s + 1, 2, (8, 16)), -12) + _norm(traffic(n, s + 2, passes_per_min=3), -12)
    elif scene == "stadium":            # open stands: crowd murmur + a little wind
        x = _norm(crowd(n, s), 0) + _norm(wind(n, s + 1, 0.6, 0.3), -12)
    elif scene == "dome":               # indoor stadium: softer murmur in a big room
        x = convolve(_norm(crowd(n, s, talkers_flutter=0.2), 0), reverb_ir(seed=s + 3, **DOME), wet=0.55)
        x = _norm(x, 0) + _norm(room_tone(n, s + 4), -10)
    elif scene == "night_hill":         # crickets, a faint breeze, the highway hum far down in the valley
        x = _norm(crickets(n, s, 7), -5) + _norm(wind(n, s + 1, 0.5, 0.25, 0.08), -7) + _norm(traffic(n, s + 2, passes_per_min=4), -6)
    elif scene == "toll_plaza":         # overcast queue: idling engines, gusty wind, road behind
        x = _norm(engines(n, s), -3) + _norm(wind(n, s + 1, 1.1, 0.6, 0.2), -2) + _norm(traffic(n, s + 2, passes_per_min=4), -8)
    elif scene == "footbridge":         # above a wide highway: steady roar + pass-bys, wind, a bird or two
        x = _norm(traffic(n, s, passes_per_min=14, near=0.6), 0) + _norm(wind(n, s + 1, 0.8, 0.4), -6) + _norm(birds(n, s + 3, 2, (8, 18)), -14)
    elif scene == "wordmark":           # title at dusk: just warm air
        x = _norm(wind(n, s, 0.5, 0.2, 0.08), 0)
    else:
        x = _norm(wind(n, s, 0.6, 0.4), 0)
    return fft_filter(x, hp(35, 2)).astype(np.float32)


# shot background -> scene type (first matching prefix wins). None = an insert (diagram, paper, hands...):
# it keeps the ambience of the shot before it.
SCENE_PREFIX = [
    ("close9", "ring_field"), ("wm", "wordmark"), ("night", "night_hill"), ("window", "night_hill"),
    ("stadium", "stadium"), ("dome", "dome"), ("toll", "toll_plaza"), ("bridge", "footbridge"),
    ("busstop", "footbridge"), ("i24", "footbridge"),   # act 4: the real highway, seen from above / the bridge
    ("hw", "golden_highway"), ("close", "golden_highway"),
    ("glovebox", "golden_highway"), ("ring", "ring_field"), ("field", "ring_field"), ("two", "ring_field"),
    ("line", "cloudy_field"),
]
INSERTS = ("paper", "graph", "hands", "plate", "laptop", "split", "bird", "profile")


def scene_of(bg):
    if bg.startswith(INSERTS):
        return None
    for p, s in SCENE_PREFIX:
        if bg.startswith(p):
            return s
    return None


def scene_segments(ev):
    """-> [(t0, t1, scene)] from the block's shots (local seconds)."""
    shots = sorted(ev["shots"], key=lambda s: s.get("start", 0))
    segs, cur = [], None
    first = next((scene_of(s.get("bg", "")) for s in shots if scene_of(s.get("bg", ""))), "ring_field")
    for s in shots:
        bg = s.get("bg", "")
        sc = scene_of(bg)
        if bg.startswith("line") and cur not in (None, "ring_field", "cloudy_field"):
            sc = None             # the line diagrams of act 4 keep the highway / bridge ambience
        sc = sc or cur or first
        t = max(0.0, s.get("start", 0.0))
        if sc != cur:
            segs.append([t, None, sc])
            cur = sc
    for i in range(len(segs)):
        segs[i][1] = segs[i + 1][0] if i + 1 < len(segs) else ev["duration"]
    if segs:
        segs[0][0] = 0.0
    return [tuple(s) for s in segs if s[1] > s[0]]


def ambience_track(ev, xfade=0.6, seed=7):
    n = int(round(ev["duration"] * SR))
    t = np.arange(n) / SR
    out = np.zeros((n, 2), np.float32)
    beds = {}
    segs = scene_segments(ev)
    for a, b, sc in segs:
        if sc not in beds:
            beds[sc] = bed(sc, n, seed + 31 * len(beds) + int(ev["t0"]))
        w = np.clip((t - (a - xfade / 2)) / xfade, 0, 1) * np.clip(((b + xfade / 2) - t) / xfade, 0, 1)
        if a <= 0:
            w = np.clip(((b + xfade / 2) - t) / xfade, 0, 1)
        if b >= ev["duration"]:
            w = np.clip((t - (a - xfade / 2)) / xfade, 0, 1) if a > 0 else np.ones(n, np.float32)
        out += beds[sc] * w[:, None].astype(np.float32)
    # the script's own ambience accents that suit the direction: daytime crickets for «allá no hay nada»
    for amb in ev.get("ambience", []):
        if amb["kind"] == "crickets" and not any(sc == "night_hill" for a, b, sc in segs if a <= amb["t0"] < b):
            m0, m1 = amb["t0"], amb["t1"]
            c = crickets(n, seed + 77, 4)
            w = np.clip((t - m0) / 0.8, 0, 1) * np.clip((m1 - t) / 0.8, 0, 1)
            out += _norm(c, -6) * w[:, None]
    return out, segs


# ------------------------------------------------------------------------------------------------ soft effects

def soft_squeak(seed=1):
    """Brake: a low, soft rubbery squeak (~700-900 Hz, short) over a little tyre scrub."""
    rng = np.random.default_rng(seed)
    d = 0.55
    m = int(d * SR)
    t = np.arange(m) / SR
    f = rng.uniform(680, 820) * (1 + 0.05 * (1 - t / d)) * (1 + 0.01 * np.sin(2 * np.pi * 9 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.minimum(1, t / 0.06) * np.exp(-t / 0.22)
    tone = (np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)) * env
    scrub = S._bandnoise(m, 200, 1400, seed + 3) * np.minimum(1, t / 0.03) * np.exp(-t / 0.18) * 0.5
    return fft_filter((tone * 0.6 + scrub).astype(np.float32), lp(2200, 2))


def soft_thud(seed=2):
    """Suspension settling: a soft low bump (60-90 Hz) with a little body."""
    m = int(0.45 * SR)
    t = np.arange(m) / SR
    f = 85 * np.exp(-t / 0.15) + 55
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.008) * np.exp(-t / 0.12)
    x += S._bandnoise(m, 80, 500, seed) * np.exp(-t / 0.05) * 0.25
    return x.astype(np.float32)


def whoosh(dur=1.2, seed=5, lo=250, hi=1400):
    """A gentle air move: noise whose band glides up and back down, smooth envelope (no hiss, no zip)."""
    m = int(dur * SR)
    u = np.linspace(0, 1, m // HOP + 4, dtype=np.float32)
    fc = lo + (hi - lo) * np.clip(np.sin(np.pi * u), 0, 1) ** 1.5

    def mag(tt, f):
        k = len(tt)
        c = fc[:k, None]
        return np.exp(-0.5 * (np.log2(np.maximum(f, 1) / c) / 1.1) ** 2)

    x = spectral_noise(m, mag, seed)
    env = np.sin(np.pi * np.linspace(0, 1, m)) ** 2
    return fft_filter((x * env).astype(np.float32), lp(3000, 2))


def paper_pop(seed=9):
    """A text box appearing: a tiny paper flick (soft, short, no pitch)."""
    m = int(0.09 * SR)
    t = np.arange(m) / SR
    x = S._bandnoise(m, 1200, 5000, seed) * np.exp(-t / 0.012) * 0.6
    x += np.sin(2 * np.pi * (380 - 1500 * t) * t) * np.exp(-t / 0.02) * 0.5
    return fft_filter(x.astype(np.float32), lp(4500, 2))


def bike_bell(seed=11):
    m = int(1.2 * SR)
    t = np.arange(m) / SR
    x = np.zeros(m, np.float32)
    for k, dt in enumerate((0.0, 0.17)):
        i0 = int(dt * SR)
        tt = t[: m - i0]
        y = sum(a * np.sin(2 * np.pi * 2350 * r * tt) * np.exp(-tt / d) for r, a, d in ((1, 1, 0.35), (2.76, 0.35, 0.15), (5.4, 0.12, 0.06)))
        x[i0:] += (y * np.minimum(1, tt / 0.002) * (1 - 0.2 * k)).astype(np.float32)
    return fft_filter(x, lp(5000, 1))


def crowd_swell(dur, seed=13):
    m = int(dur * SR)
    x = crowd(m, seed, talkers_flutter=0.35).mean(1)
    x = fft_filter(x, bell(700, 1.2, 5))   # an "ooh" vowel colour
    return (x * np.sin(np.pi * np.linspace(0, 1, m)) ** 2).astype(np.float32)


_STING_CACHE = {}


def _fluid_notes(notes, cache_dir):
    """Render [(program, midi_pitch, vel, dur)] one by one with FluidSynth (cached wavs) -> list of mono arrays."""
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    out = []
    os.makedirs(cache_dir, exist_ok=True)
    for prog, p, vel, dur in notes:
        key = f"n_{prog}_{p}_{vel}_{dur}"
        wav = Path(cache_dir) / f"{key}.wav"
        if not wav.exists():
            import struct
            ticks = int(dur * 1920)
            trk = bytes([0, 0xC0, prog, 0, 0xB0, 91, 70, 0, 0x90, p, vel]) + _vlq(ticks) + bytes([0x80, p, 0]) + b"\x00\xff\x2f\x00"
            mid = Path(cache_dir) / f"{key}.mid"
            with open(mid, "wb") as f:
                f.write(b"MThd" + struct.pack(">IHHH", 6, 0, 1, 960) + b"MTrk" + struct.pack(">I", len(trk)) + trk)
            raw = Path(cache_dir) / f"{key}.raw.wav"
            subprocess.run(["nice", "-n", "10", "fluidsynth", "-ni", "-q", "-T", "wav", "-F", str(raw), "-r", str(SR), "-g", "0.6",
                            "-o", "synth.cpu-cores=1", "-o", "synth.reverb.level=0.6", "-o", "synth.chorus.active=0",
                            "/usr/share/sounds/sf2/FluidR3_GM.sf2", str(mid)], check=True, capture_output=True)
            os.replace(raw, wav)
        out.append(S.load_audio(wav, channels=1)[:, 0])
    return out


def _vlq(x):
    o = [x & 0x7F]
    x >>= 7
    while x:
        o.append(0x80 | (x & 0x7F))
        x >>= 7
    return bytes(reversed(o))


def sting_notes(cache_dir):
    """The wordmark sting: the 3-note channel motif D5 -> A5 -> G5 on celesta (+ harp doubling), and a warm low G
    (harp G2 + cello G2) under the landing note. -> dict(bounce1, bounce2, land) of mono arrays."""
    if cache_dir not in _STING_CACHE:
        N = {"D5": 74, "A5": 81, "G5": 79, "G2": 43, "D3": 50, "G3": 55}
        c = _fluid_notes([(8, N["D5"], 70, 1.0), (8, N["A5"], 70, 1.0), (8, N["G5"], 78, 2.5),
                          (46, N["D5"], 50, 1.0), (46, N["A5"], 50, 1.0), (46, N["G5"], 56, 2.5),
                          (46, N["G2"], 64, 3.0), (42, N["G3"], 46, 2.5), (46, N["D3"], 50, 3.0)], cache_dir)

        def add(parts):
            m = max(len(x) for x, _ in parts)
            y = np.zeros(m, np.float32)
            for x, g in parts:
                y[: len(x)] += x * g
            return y

        _STING_CACHE[cache_dir] = {
            "bounce1": add([(c[0], 1.0), (c[3], 0.5)]),
            "bounce2": add([(c[1], 1.0), (c[4], 0.5)]),
            "land": add([(c[2], 1.0), (c[5], 0.5), (c[6], 0.7), (c[7], 0.35), (c[8], 0.4)]),
        }
    return _STING_CACHE[cache_dir]


# ------------------------------------------------------------------------------------------------ cue list

WHOOSH_CUES = {"whoosh_turn", "spin", "whoosh_wm"}   # camera moves only (not a character standing up / swishing)
MIN_WHOOSH_GAP = 8.0


def cue_list(ev, char_slots):
    """Rebuild the effects as "few and soft" from the block's cues/shots (+ the silent characters' text-box slots).
    -> list of dict(t, kind, pan, **). Everything cartoony, loud or repetitive is dropped."""
    out = []
    cues = sorted(ev.get("cues", []), key=lambda c: c["t"])
    wm = [(a - 0.5, b) for a, b, sc in scene_segments(ev) if sc == "wordmark"]
    in_wm = lambda t: any(a <= t < b for a, b in wm)  # noqa: E731
    # key brakes only: Eli's hard brake (squeal) and the full stop (stop_thunk); never the cascade of brake notes
    for c in cues:
        k = c["kind"]
        if k == "squeal":
            out.append({"t": c["t"], "kind": "soft_squeak", "pan": 0.0})
        elif k == "stop_thunk":
            out.append({"t": c["t"], "kind": "soft_thud", "pan": 0.0})
        elif k in ("flick", "boink", "tin") and in_wm(c["t"]):
            out.append({"t": c["t"], "kind": "sting", "part": {"flick": "bounce1", "boink": "bounce2", "tin": "land"}[k], "pan": 0.0})
        elif k == "bell":
            out.append({"t": c["t"], "kind": "bike_bell", "pan": 0.3})
        elif k == "crowd_wave":
            out.append({"t": c["t"], "kind": "crowd_swell", "dur": max(1.0, c.get("t1", c["t"] + 2.0) - c["t"]), "pan": 0.0})
        elif k == "wind_gust":
            out.append({"t": c["t"], "kind": "gust", "pan": -0.2})
        elif k == "pop" and not in_wm(c["t"]):
            out.append({"t": c["t"], "kind": "paper_pop", "pan": 0.15})
    # gentle whooshes on big camera moves: the whoosh cues + crane shots, never closer than MIN_WHOOSH_GAP
    cand = [c["t"] - 0.35 for c in cues if c["kind"] in WHOOSH_CUES]
    cand += [s["start"] - 0.5 for s in ev.get("shots", []) if "crane" in s.get("id", "") and s.get("start", 0) > 0.5]
    last = -1e9
    for t in sorted(cand):
        if t - last >= MIN_WHOOSH_GAP:
            out.append({"t": max(0.0, t), "kind": "whoosh", "pan": 0.0})
            last = t
    # silent characters: a text box can carry a very soft paper pop (one per line, not if a pop is already there)
    pops = [c["t"] for c in out if c["kind"] == "paper_pop"]
    for t in char_slots:
        if not in_wm(t) and all(abs(t - p) > 0.8 for p in pops):
            out.append({"t": max(0.0, t - 0.05), "kind": "paper_pop", "pan": 0.1})
            pops.append(t)
    return sorted(out, key=lambda c: c["t"])


def render_sfx(cue, cache_dir, seed):
    k = cue["kind"]
    if k == "soft_squeak":
        return soft_squeak(seed)
    if k == "soft_thud":
        return soft_thud(seed)
    if k == "whoosh":
        return whoosh(1.2, seed)
    if k == "paper_pop":
        return paper_pop(seed)
    if k == "bike_bell":
        return bike_bell(seed)
    if k == "crowd_swell":
        return crowd_swell(cue["dur"], seed)
    if k == "gust":
        return wind(int(2.2 * SR), seed, 1.0, 0.8, 0.6).mean(1) * np.sin(np.pi * np.linspace(0, 1, int(2.2 * SR))) ** 2
    if k == "sting":
        return sting_notes(cache_dir)[cue["part"]]
    raise KeyError(k)


# ------------------------------------------------------------------------------------------------ voice + mix

def char_spans(t0, t1, segments_path=None, timings_path=None):
    """Character (non-narrator) line spans inside [t0, t1], absolute seconds. segments_es.json (start + dur) first,
    timings_es.json word spans as a fallback."""
    spans = []
    if segments_path and os.path.exists(segments_path):
        for s in json.load(open(segments_path)).get("segments", []):
            if s.get("speaker", "narrator") != "narrator" and "start" in s and "dur" in s:
                spans.append((s["start"], s["start"] + s["dur"]))
    if not spans and timings_path and os.path.exists(timings_path):
        lines = {}
        for w in json.load(open(timings_path)):
            if w.get("speaker", "narrator") != "narrator":
                a, b = lines.get(w["line"], (w["start"], w["end"]))
                lines[w["line"]] = (min(a, w["start"]), max(b, w["end"]))
        spans = list(lines.values())
    return sorted((a, b) for a, b in spans if b > t0 and a < t1)


def mute_spans(voice, spans_local, pad=0.06, fade=0.03):
    n = len(voice)
    t = np.arange(n) / SR
    g = np.ones(n, np.float32)
    for a, b in spans_local:
        a, b = a - pad, b + pad
        w = np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1)
        g = np.minimum(g, 1 - w)
    return voice * g[:, None]


def win_rms_db(x, win=0.4, hop=0.1):
    m = np.abs(x).mean(1) if x.ndim > 1 else np.abs(x)
    m2 = (x ** 2).mean(1) if x.ndim > 1 else x ** 2
    w, h = int(win * SR), int(hop * SR)
    if len(m2) < w:
        return np.array([10 * np.log10(m2.mean() + 1e-12)])
    c = np.concatenate([[0], np.cumsum(m2)])
    idx = np.arange(0, len(m2) - w + 1, h)
    return 10 * np.log10((c[idx + w] - c[idx]) / w + 1e-12)


def voice_ref_db(voice):
    """Median 400 ms RMS (dB) of the narration where it speaks."""
    r = win_rms_db(voice)
    act = r[r > r.max() - 30]
    return float(np.median(act)) if len(act) else -30.0


def band_split(x, lo=2000.0, hi=3500.0):
    g = lambda f: np.clip(np.minimum((f - lo * 0.85) / (lo * 0.15), (hi * 1.15 - f) / (hi * 0.15)), 0, 1)
    b = fft_filter(x, g)
    return x - b, b


def level_ride(x, win=3.0, keep=0.45, max_up=8.0, max_down=4.0):
    """Slow leveler for the score: quiet sections (hush, sting hold, night) come up, loud ones down a little; keeps
    `keep` of the original act-to-act dynamics, so the bed stays continuous under silent text-box slots."""
    r = win_rms_db(x, win=win, hop=0.25)
    ref = np.median(r[r > r.max() - 40]) if (r > r.max() - 40).any() else r.max()
    g = np.clip((ref - r) * (1 - keep), -max_down, max_up)
    tc = np.arange(len(g)) * 0.25 + win / 2
    gs = np.interp(np.arange(len(x)) / SR, tc, g).astype(np.float32)
    return x * S.db(gs)[:, None]


def mix_block(voice, music, amb, sfx_list, levels=LEVELS):
    """voice/music/amb: (n,2); sfx_list: [(t, mono, pan, rel_db)]. -> (mix (n,2), report dict)."""
    n = len(voice)
    Lv = S.measure(voice)["I"]
    env = S.envelope(voice, attack=0.08, release=0.6)[:n]
    rep = {"voice_I": round(Lv, 2)}
    mu = level_ride(music.copy())
    Lm = S.measure(mu)["I"]
    if np.isfinite(Lm):
        mu *= S.db(Lv + levels["music_rel"] - Lm)
    rest, band = band_split(mu)
    mu = rest + band * S.db(-levels["music_carve"] * env)[:, None]
    mu *= (1 - (1 - S.db(-levels["music_duck"])) * env)[:, None]
    am = amb.copy()
    La = S.measure(am)["I"]
    if np.isfinite(La):
        am *= S.db(Lv + levels["amb_rel"] - La)
    am *= (1 - (1 - S.db(-levels["amb_duck"])) * env)[:, None]
    vref = voice_ref_db(voice)
    sfx = np.zeros((n, 2), np.float32)
    rep["sfx"] = []
    for t, x, pan, rel in sfx_list:
        if len(x) == 0:
            continue
        lvl = float(win_rms_db(x).max())
        g = S.db(vref + rel - lvl)
        i0 = int(round(t * SR))
        if i0 >= n:
            continue
        seg = pan2(x * g, pan)[: n - i0]
        if i0 < 0:
            seg, i0 = seg[-i0:], 0
        sfx[i0:i0 + len(seg)] += seg
        rep["sfx"].append(round(rel, 1))
    out = voice + mu + am + sfx
    rep["music_rel_LU"] = round(S.measure(mu)["I"] - Lv, 1)
    rep["amb_rel_LU"] = round(S.measure(am)["I"] - Lv, 1)
    rep["voice_ref_rms_db"] = round(vref, 1)
    return out, rep


# ------------------------------------------------------------------------------------------------ the block builder

def build_block(ev, nar_path, out, timings_path, segments_path, score_fn, cache_dir=None, master=True,
                target=-14.0, ceiling=-1.5):
    """The Cine suave sound for one animatic block. ev: events.json dict (t0, duration, shots, cues, ambience).
    score_fn(timings_path) -> (score wav path, plan). Returns the measurement/report dict."""
    cache_dir = cache_dir or os.environ.get("TTD_SCORE_CACHE", "/tmp/claude-0/cine_suave_cache")
    t0, dur = ev["t0"], ev["duration"]
    n = int(round(dur * SR))
    # narration (characters muted: they speak through text boxes now)
    nar = S.load_audio(nar_path)
    a = int(round(t0 * SR))
    voice = np.zeros((n, 2), np.float32)
    seg = nar[a:a + n]
    voice[: len(seg)] = seg
    spans = char_spans(t0, t0 + dur, segments_path, timings_path)
    voice = mute_spans(voice, [(x - t0, y - t0) for x, y in spans])
    # score (episode-long, keyed to the timings) cut to the block
    wav, plan = score_fn(timings_path)
    sc = S.load_audio(wav)
    music = np.zeros((n, 2), np.float32)
    seg = sc[a:a + n]
    music[: len(seg)] = seg
    # ambience
    amb, segs = ambience_track(ev)
    # effects
    cl = cue_list(ev, [x - t0 for x, y in spans])
    sfx = [(c["t"], render_sfx(c, cache_dir, 100 + i), c.get("pan", 0.0), SFX_REL.get(c["kind"], LEVELS["sfx_rel"]))
           for i, c in enumerate(cl)]
    mix, rep = mix_block(voice, music, amb, sfx)
    rep.update({"scenes": [(round(x, 2), round(y, 2), s) for x, y, s in segs],
                "cues": [(round(c["t"], 2), c["kind"]) for c in cl], "char_slots_muted": len(spans)})
    if master:
        m = S.master(mix, out, target=target, ceiling=ceiling, fade_in=0.01, fade_out=0.05)
        rep.update(m)
    else:
        rep["mix"] = mix
    return rep
