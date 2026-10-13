"""Sound for the channel, numpy only (no samples, no stock audio): sonification voices, the channel motif, mixing with
ducking, and mastering to YouTube loudness.

Synths (mono float arrays at SR = 48 kHz; every noise source is seeded -> deterministic):
    pluck(f)        soft plucked note (lap ticks, counting)          tick(bright)   dry filtered click (events)
    thunk()         low pitched thump (a hit, a brake tap)            chime(f)       bell partials (reveal, landing)
    glide(f0, f1)   pitch sweep (mascot chirps, drop-in whistle)      whoosh(dur)    filtered noise swell (cuts)
    hum(n, f, amount_curve)  drone whose voice count follows a curve (e.g. how many cars are stuck)
    pad(n, chord)   quiet warm bed                                    pop()          tiny mouth-pop (mascot)

Channel motif (`STING_NOTES`): three notes composed for the brand, D5 -> A5 -> G5 (up a fifth, settle a step down onto
the tonic). It is played by the three contacts of the wordmark sting (bounce, bounce, land); the landing note gets a
chime and a low G2 under it. Use `motif_notes()` to quote it elsewhere (end card, transitions), in any octave.

Mixing (`mix`): voice is the reference. SFX bus is set ~7 dB under the voice (integrated loudness, measured with
ffmpeg ebur128), music ~17 dB under the voice and ducked a further 6 dB while the voice speaks (attack 60 ms,
release 450 ms). `master` then sets the whole mix to -14 LUFS integrated with a look-ahead limiter on a 4x
oversampled peak estimate, iterating against ffmpeg's ebur128 until |I + 14| < 0.15 LU and true peak <= -1.5 dBTP
(margin for the AAC encode; the final mp4 is measured again by qc.py).
"""
from __future__ import annotations

import math
import os
import re
import subprocess
import tempfile
import wave
from functools import lru_cache

import numpy as np

SR = 48000
FFMPEG = "/usr/bin/ffmpeg"
TMP = os.environ.get("TTD_TMP", "/tmp/claude-0")

# ------------------------------------------------------------------------------------------------ notes

A4 = 440.0
_NAMES = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}


def note(name: str) -> float:
    """'A4', 'F#3', 'Bb5' -> Hz (equal temperament)."""
    m = re.fullmatch(r"([A-G])([#b]?)(-?\d)", name)
    k = _NAMES[m.group(1)] + {"#": 1, "b": -1, "": 0}[m.group(2)] + 12 * (int(m.group(3)) - 4)
    return A4 * 2 ** (k / 12)


PENTA = [note(n) for n in ("G4", "A4", "B4", "D5", "E5", "G5", "A5")]     # G major pentatonic (channel key: G)
STING_NOTES = ("D5", "A5", "G5")


def motif_notes(octave_shift=0):
    return [note(n) * 2 ** octave_shift for n in STING_NOTES]


# ------------------------------------------------------------------------------------------------ synths

def _t(n):
    return np.arange(n, dtype=np.float32) / SR


def env(n, attack=0.004, decay=0.2):
    t = _t(n)
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


def pluck(freq, dur=0.55, decay=0.16, bright=0.3):
    n = int(dur * SR)
    t = _t(n)
    s = (np.sin(2 * np.pi * freq * t) + bright * np.sin(2 * np.pi * 2.003 * freq * t) * np.exp(-t / 0.05)
         + 0.35 * bright * np.sin(2 * np.pi * 3.01 * freq * t) * np.exp(-t / 0.03))
    return (s * env(n, 0.003, decay)).astype(np.float32)


def marimba(freq, dur=0.8, decay=0.22):
    """Woody mallet: fundamental + the 4x and 10x partials of a marimba bar, fast-decaying."""
    n = int(dur * SR)
    t = _t(n)
    s = (np.sin(2 * np.pi * freq * t) * np.exp(-t / decay)
         + 0.35 * np.sin(2 * np.pi * 3.93 * freq * t) * np.exp(-t / (decay * 0.25))
         + 0.12 * np.sin(2 * np.pi * 9.2 * freq * t) * np.exp(-t / (decay * 0.08)))
    return (s * np.minimum(1, t / 0.0015)).astype(np.float32)


def _bandnoise(n, lo, hi, seed):
    rng = np.random.default_rng(seed)
    x = rng.standard_normal(n).astype(np.float32)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X *= ((f >= lo) & (f <= hi)).astype(np.float32) * 1.0
    y = np.fft.irfft(X, n).astype(np.float32)
    return y / (np.abs(y).max() + 1e-9)


@lru_cache(maxsize=64)
def tick(bright=2400.0, seed=1):
    n = int(0.06 * SR)
    t = _t(n)
    bp = _bandnoise(n, bright * 0.6, bright * 1.6, seed)
    s = bp * np.exp(-t / 0.009) + 0.45 * np.sin(2 * np.pi * bright * 0.75 * t) * np.exp(-t / 0.016)
    return s.astype(np.float32)


@lru_cache(maxsize=8)
def thunk(seed=2, f_hi=190.0, f_lo=62.0):
    n = int(0.9 * SR)
    t = _t(n)
    f = f_lo + (f_hi - f_lo) * np.exp(-t / 0.07)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, 0.004, 0.28) + 0.25 * np.sin(2 * ph) * env(n, 0.004, 0.12)
    s += 0.3 * _bandnoise(n, 200, 2500, seed) * np.exp(-t / 0.018)
    return s.astype(np.float32)


def chime(freq, dur=2.2, decay=0.9):
    n = int(dur * SR)
    t = _t(n)
    parts = [(1.0, 1.0, 1.0), (2.0, 0.45, 0.6), (2.76, 0.30, 0.45), (5.40, 0.16, 0.25), (8.93, 0.07, 0.12)]
    s = sum(a * np.sin(2 * np.pi * freq * r * t + r) * np.exp(-t / (decay * dk)) for r, a, dk in parts)
    return (s * np.minimum(1, t / 0.002)).astype(np.float32)


def glide(f0, f1, dur, decay=None, harm=0.2):
    n = int(dur * SR)
    t = _t(n)
    f = f0 * (f1 / f0) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    e = env(n, 0.01, decay or dur * 0.6)
    return ((np.sin(ph) + harm * np.sin(2 * ph)) * e).astype(np.float32)


def whoosh(dur=0.5, lo=300, hi=3000, seed=5):
    """Noise swell with a rising band (a soft 'fff' for camera moves / cuts)."""
    n = int(dur * SR)
    t = _t(n)
    out = np.zeros(n, np.float32)
    k = 6
    for i in range(k):                                   # band sweeps in steps (cheap, smooth enough)
        f0 = lo * (hi / lo) ** (i / k)
        seg = _bandnoise(n, f0, f0 * 1.8, seed + i)
        w = np.exp(-((t / dur - (i + 0.5) / k) ** 2) / 0.02)
        out += seg * w
    return (out * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5 / k * 2).astype(np.float32)


def pop(freq=900.0):
    n = int(0.07 * SR)
    t = _t(n)
    f = freq * (1 + 0.8 * np.exp(-t / 0.01))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.018)).astype(np.float32)


def hum(n, f0, amount, voices=8, detune=0.0045):
    """Drone: voice k (1..voices) fades in when `amount` (per-sample curve, e.g. stuck-car count) exceeds k-1.
    Each extra voice is detuned a little more -> slow beating that thickens as amount grows."""
    t = _t(n)
    out = np.zeros(n, np.float32)
    for k in range(1, voices + 1):
        a = np.clip(amount - (k - 1), 0, 1).astype(np.float32)
        if a.max() <= 0:
            continue
        f = f0 * (1 + detune * k * (-1) ** k)
        ph = 2 * np.pi * f * t + k
        out += a * (np.sin(ph) + 0.45 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph) + 0.12 * np.sin(4 * ph))
    return out / voices


def pad(n, chord=("G3", "D4", "G4", "B4"), lfo=0.07):
    t = _t(n)
    out = np.zeros(n, np.float32)
    for j, nm in enumerate(chord):
        f = note(nm)
        l = 0.6 + 0.4 * np.sin(2 * np.pi * (lfo + 0.03 * j) * t + j)
        out += l * (np.sin(2 * np.pi * f * t) + 0.15 * np.sin(2 * np.pi * 2 * f * t + 0.3))
    return out / len(chord)


# ------------------------------------------------------------------------------------------------ buses

class Bus:
    """Stereo buffer you drop sounds into: bus.add(t_seconds, mono_signal, pan=-1..1, gain=1)."""

    def __init__(self, n_samples):
        self.buf = np.zeros((int(n_samples), 2), np.float32)

    @classmethod
    def seconds(cls, dur):
        return cls(int(round(dur * SR)))

    def add(self, t, sig, pan=0.0, gain=1.0):
        i0 = int(round(t * SR))
        if i0 >= len(self.buf) or len(sig) == 0:
            return
        if i0 < 0:
            sig = sig[-i0:]
            i0 = 0
        sig = sig[: len(self.buf) - i0] * gain
        pan = max(-1.0, min(1.0, pan))
        l, r = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
        self.buf[i0:i0 + len(sig), 0] += sig * l
        self.buf[i0:i0 + len(sig), 1] += sig * r

    def add_stereo(self, t, st, gain=1.0):
        i0 = int(round(t * SR))
        st = st[: max(0, len(self.buf) - i0)]
        self.buf[i0:i0 + len(st)] += st * gain


# ------------------------------------------------------------------------------------------------ the motif

def sting_sfx(bus: Bus, events, drop_t=0.0, offset=0.0, gain=1.0):
    """Channel sting: whistle-down on the drop, then the 3-note motif on the 3 contacts of wordmark.Sting.events
    (bounce1, bounce2, land); the landing note gets a chime + low G2 and a soft thump."""
    bus.add(offset + drop_t, glide(1500, 700, 0.55, 0.3, 0.1), 0.0, 0.10 * gain)
    for ev, nm in zip(events, STING_NOTES):
        t = offset + ev["t"]
        f = note(nm)
        if ev["kind"] != "land":
            bus.add(t, marimba(f, 0.9, 0.25), 0.0, 0.42 * gain)
            bus.add(t, tick(3200, 7), 0.0, 0.08 * gain)
        else:
            bus.add(t, marimba(f, 1.4, 0.35), 0.0, 0.46 * gain)
            bus.add(t, chime(f * 2, 2.4, 0.8), 0.0, 0.10 * gain)
            bus.add(t, chime(note("D6"), 2.0, 0.6), 0.15, 0.05 * gain)
            bus.add(t, pluck(note("G2"), 1.6, 0.6, 0.15), 0.0, 0.45 * gain)
            bus.add(t, thunk(3, 140, 55), 0.0, 0.18 * gain)


# ------------------------------------------------------------------------------------------------ I/O, measurement

def write_wav(path, x, sr=SR, bits=16):
    x = np.clip(np.asarray(x, np.float32), -1, 1)
    if x.ndim == 1:
        x = x[:, None]
    with wave.open(str(path), "wb") as w:
        w.setnchannels(x.shape[1])
        w.setframerate(sr)
        if bits == 16:
            w.setsampwidth(2)
            w.writeframes((x * 32767).astype("<i2").tobytes())
        else:
            w.setsampwidth(3)
            i = (x * 8388607).astype("<i4")
            b = i.view(np.uint8).reshape(-1, 4)[:, :3]
            w.writeframes(b.tobytes())


def load_audio(path, sr=SR, channels=2):
    """Any audio file -> float32 (n, channels) at sr (via ffmpeg)."""
    raw = subprocess.run([FFMPEG, "-v", "error", "-i", str(path), "-ac", str(channels), "-ar", str(sr),
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, channels).copy()


def measure_file(path):
    """-> dict(I LUFS integrated, TP dBTP true peak, LRA) from ffmpeg ebur128."""
    r = subprocess.run([FFMPEG, "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
    s = r[r.rfind("Summary:"):]
    I = float(re.search(r"I:\s+(-?[\d.]+|-inf) LUFS", s).group(1))
    lra = float(re.search(r"LRA:\s+(-?[\d.]+) LU", s).group(1))
    tp = re.search(r"Peak:\s+(-?[\d.]+|-inf) dBFS", s).group(1)
    return {"I": I, "TP": float(tp), "LRA": lra}


def measure(x):
    """Loudness of an in-memory signal (writes a temp wav)."""
    os.makedirs(TMP, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".wav", dir=TMP, delete=False) as f:
        p = f.name
    try:
        write_wav(p, x, bits=24)
        return measure_file(p)
    finally:
        os.remove(p)


def db(x):
    return 10 ** (x / 20)


# ------------------------------------------------------------------------------------------------ mixing

def envelope(x, block=0.01, attack=0.06, release=0.45):
    """Smoothed activity envelope (0..1 normalised) of a signal, per sample. Used as a ducking side-chain."""
    m = np.abs(x).mean(1) if x.ndim > 1 else np.abs(x)
    n = int(block * SR)
    nb = int(math.ceil(len(m) / n))
    pad_ = np.pad(m, (0, nb * n - len(m)))
    rms = np.sqrt((pad_.reshape(nb, n) ** 2).mean(1))
    thr = np.percentile(rms[rms > 0], 90) * 0.12 if (rms > 0).any() else 1.0
    act = np.clip(rms / thr, 0, 1)
    a_att, a_rel = math.exp(-block / attack), math.exp(-block / release)
    out = np.empty_like(act)
    acc = 0.0
    for i, v in enumerate(act):
        a = a_att if v > acc else a_rel
        acc = a * acc + (1 - a) * v
        out[i] = acc
    return np.repeat(out, n)[: len(m)]


def mix(voice=None, music=None, sfx=None, sfx_rel_db=-7.0, music_rel_db=-17.0, duck_db=6.0, voice_offset=0.0,
        n=None):
    """Mix stereo float buffers. voice: (n,2) or (n,) at SR (placed at voice_offset seconds).
    Without voice, sfx is the reference (music sits 10 dB under it). Returns (n, 2) float32 (not mastered)."""
    lens = [len(b) for b in (music, sfx) if b is not None]
    if voice is not None:
        if voice.ndim == 1:
            voice = np.stack([voice, voice], 1)
        lens.append(len(voice) + int(voice_offset * SR))
    n = n or max(lens)
    out = np.zeros((n, 2), np.float32)
    v = None
    if voice is not None:
        v = np.zeros((n, 2), np.float32)
        i0 = int(round(voice_offset * SR))
        v[i0:i0 + len(voice)] = voice[: n - i0]
        Lv = measure(v)["I"]
        out += v
    else:
        Lv = None

    def fit(b):
        b2 = np.zeros((n, 2), np.float32)
        b2[: min(n, len(b))] = b[:n]
        return b2

    if sfx is not None and np.abs(sfx).max() > 0:
        s = fit(sfx)
        Ls = measure(s)["I"]
        if Lv is not None and np.isfinite(Ls):
            s *= db((Lv + sfx_rel_db) - Ls)
        ref = Lv if Lv is not None else Ls
        out += s
    else:
        ref = Lv
    if music is not None and np.abs(music).max() > 0:
        mu = fit(music)
        Lm = measure(mu)["I"]
        if ref is not None and np.isfinite(Lm):
            rel = music_rel_db if Lv is not None else -10.0
            mu *= db((ref + rel) - Lm)
        if v is not None:
            e = envelope(v)
            mu *= (1 - (1 - db(-duck_db)) * e)[:, None]
        out += mu
    return out


# ------------------------------------------------------------------------------------------------ mastering

def _true_peak_env(x, chunk=1 << 18, over=4):
    """Per-sample max |x| of a 4x oversampled (FFT-interpolated) signal, chunked with overlap."""
    n = len(x)
    out = np.zeros(n, np.float32)
    ov = 512
    for s in range(0, n, chunk):
        a, b = max(0, s - ov), min(n, s + chunk + ov)
        seg = x[a:b]
        m = len(seg)
        X = np.fft.rfft(seg, axis=0)
        Xp = np.zeros((m * over // 2 + 1, seg.shape[1]), complex)
        Xp[: X.shape[0]] = X
        up = np.abs(np.fft.irfft(Xp, n=m * over, axis=0)) * over
        pk = up[: (m * over // over) * over].reshape(m, over, -1).max(axis=(1, 2))
        out[s:min(n, s + chunk)] = pk[s - a: s - a + min(chunk, n - s)]
    return np.maximum(out, np.abs(x).max(1))


def limit(x, ceiling_db=-1.5, look_ms=3.0, release_ms=90.0, block=32):
    c = db(ceiling_db)
    pk = _true_peak_env(x)
    need = np.minimum(1.0, c / np.maximum(pk, 1e-9)).astype(np.float32)
    la = int(look_ms * SR / 1000)
    # look-ahead minimum (gain is down before the peak arrives)
    from numpy.lib.stride_tricks import sliding_window_view
    g = sliding_window_view(np.pad(need, (0, la), constant_values=1.0), la + 1).min(axis=1)
    # release smoothing on blocks (fast), never above the required gain
    nb = int(math.ceil(len(g) / block))
    gb = np.pad(g, (0, nb * block - len(g)), constant_values=1.0).reshape(nb, block).min(1)
    a = math.exp(-block / (release_ms * SR / 1000))
    sm = np.empty_like(gb)
    acc = 1.0
    for i, v in enumerate(gb):
        acc = v if v < acc else a * acc + (1 - a) * v
        sm[i] = acc
    # block-hold then interpolate (a gain step every `block` samples would buzz)
    xs = (np.arange(nb) + 0.5) * block
    smooth_g = np.interp(np.arange(len(g)), xs, sm).astype(np.float32)
    return x * np.minimum(g, smooth_g)[:, None]


def master(x, path, target=-14.0, ceiling=-1.5, fade_in=0.02, fade_out=0.3, bits=16):
    """Gain + limiter iterated until -14 LUFS integrated and TP <= -1.5 dBTP (ffmpeg ebur128). Writes `path`.
    Returns the measurement dict."""
    x = np.asarray(x, np.float32).copy()
    n = len(x)
    t = np.arange(n) / SR
    x *= np.clip(t / max(fade_in, 1e-4), 0, 1)[:, None] * np.clip((n / SR - t) / max(fade_out, 1e-4), 0, 1)[:, None]
    pk = np.abs(x).max()
    if pk > 0:
        x /= pk / 0.5
    gain = 0.0
    m = None
    for it in range(8):
        y = limit(x * db(gain), ceiling)
        m = measure(y)
        if abs(m["I"] - target) < 0.15 and m["TP"] <= ceiling + 0.05:
            break
        gain += target - m["I"]
    write_wav(path, y, bits=bits)
    m = measure_file(path)
    m["gain_db"] = round(gain, 2)
    print(f"master: I {m['I']:.1f} LUFS, TP {m['TP']:.1f} dBTP, LRA {m['LRA']:.1f} LU -> {path}")
    return m


if __name__ == "__main__":       # motif audition: python3 sound.py /tmp/claude-0/motif.wav
    import sys
    b = Bus.seconds(3.5)
    sting_sfx(b, [{"t": 0.58, "kind": "bounce1"}, {"t": 1.25, "kind": "bounce2"}, {"t": 1.75, "kind": "land"}])
    master(b.buf, sys.argv[1] if len(sys.argv) > 1 else os.path.join(TMP, "motif.wav"))
