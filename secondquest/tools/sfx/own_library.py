#!/usr/bin/env python3
"""Our own synthesised SFX library (numpy only, no samples): fills the categories the free libraries are thin on.

  python3 tools/sfx/own_library.py      -> public/shared/sfx/own/<family>/<family>_NN.ogg (48 kHz, stereo, Vorbis)

Families (10-14 variations each, every one a different seed / pitch / shape, so the picker never repeats):
  boing         cartoon spring: a plucked tone with a decaying pitch wobble + metallic partials + a little body
  slide_up/down slide whistle: breathy sine glide with vibrato (comedy rise / fall)
  bloop         bubbly pop: fast upward sine chirp, round and wet (UI pops, things appearing)
  chime_soft    soft magical chime: FM bells in a gentle arpeggio + shimmer tail (reveals, magic, "idea")
  sparkle       tiny glittering high bells scattered over 0.6-1.2 s (twinkles, stars)
  whoosh_soft   premium air whoosh: band-passed noise with a swept centre, a stereo pass and a soft tail
  whoosh_fast   short swish: brighter, 0.18-0.35 s (fast cuts, card slides)
  riser         tension/reveal riser: noise + detuned saws rising 1.5-3 s, ending in air (no hit)
  tap_marimba   soft wooden UI tap (marimba-ish), pleasant clicks for counters and lists
  pluck_pizz    pizzicato comedy pluck (sneaking, small steps, "tip-toe")
  swell_reverse reverse-cymbal-like swell into a cut (0.8-1.6 s)
  thump_soft    soft sub thump (cartoon landing, box placed) with a felt click on top
  impact_deep   heavy cinematic hit: sub drop + body + crack + debris ticks (title slams, big reveals)

All renders: peak-normalised to -1 dBFS, 3 ms in / short out fades, a small synthetic room (exponential noise IR)
where it helps. Re-run is deterministic (seeded).
"""
from pathlib import Path
import numpy as np
import scipy.signal as ss
import soundfile as sf

SR = 48000
OUT = Path(__file__).resolve().parents[2] / 'public/shared/sfx/own'


# ---------------------------------------------------------------- helpers
def tt(d):
    return np.arange(int(d * SR)) / SR


def osc(freq):
    """sine from an instantaneous-frequency array"""
    return np.sin(2 * np.pi * np.cumsum(freq) / SR)


def adsr(n, a=.003, r=.05):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def bp(x, lo, hi, order=2):
    lo, hi = max(20, lo), min(SR / 2 * .98, hi)
    b, a = ss.butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return ss.lfilter(b, a, x)


def lp(x, f, order=2):
    b, a = ss.butter(order, min(.98, f / (SR / 2)))
    return ss.lfilter(b, a, x)


def hp(x, f, order=2):
    b, a = ss.butter(order, f / (SR / 2), 'high')
    return ss.lfilter(b, a, x)


def swept_bp(noise, centres, q=1.5, block=256):
    """band-pass noise whose centre follows `centres` (one value per sample), block by block with state"""
    out = np.zeros_like(noise)
    zi = None
    for i in range(0, len(noise), block):
        c = float(np.clip(centres[i], 60, SR / 2 * .8))
        bw = c / q
        b, a = ss.butter(2, [max(20, c - bw / 2) / (SR / 2), min(.98, (c + bw / 2) / (SR / 2))], 'band')
        if zi is None or len(zi) != max(len(a), len(b)) - 1:
            zi = ss.lfilter_zi(b, a) * 0
        out[i:i + block], zi = ss.lfilter(b, a, noise[i:i + block], zi=zi)
    return out


def room(x, rng, rt=.35, wet=.18, bright=6000):
    """small synthetic room: decaying stereo noise IR"""
    n = int(rt * SR)
    t = np.arange(n) / SR
    irs = []
    for _ in range(2):
        ir = rng.standard_normal(n) * np.exp(-6.9 * t / rt)
        ir = lp(ir, bright)
        ir[:int(.008 * SR)] = 0
        irs.append(ir / np.sqrt(np.sum(ir ** 2)))
    if x.ndim == 1:
        x = np.stack([x, x])
    fo = min(int(.04 * SR), x.shape[1] // 4)                          # no click where the dry signal ends
    x = x.copy()
    x[:, -fo:] *= np.linspace(1, 0, fo) ** 2
    pad = np.zeros((2, x.shape[1] + n))
    for c in range(2):
        pad[c, :x.shape[1]] += x[c] * (1 - wet)
        w = ss.fftconvolve(x[c], irs[c])[:pad.shape[1]]
        pad[c, :len(w)] += w * wet * 2.2
    return pad


def stereo(x, pan=0.0, width=0.0, rng=None):
    if x.ndim == 2:
        return x
    l, r = x * np.sqrt((1 - pan) / 2) * np.sqrt(2), x * np.sqrt((1 + pan) / 2) * np.sqrt(2)
    if width and rng is not None:
        d = int(rng.uniform(.0004, .0012) * SR)
        r = np.concatenate([np.zeros(d), r])[:len(r)] * (1 - width) + r * width
    return np.stack([l, r])


def finish(x, tail=.03):
    if x.ndim == 1:
        x = np.stack([x, x])
    # trim trailing near-silence
    env = np.max(np.abs(x), axis=0)
    thr = env.max() * 10 ** (-60 / 20)
    idx = np.where(env > thr)[0]
    x = x[:, :idx[-1] + int(.02 * SR)] if len(idx) else x
    n = x.shape[1]
    x = x * adsr(n, .002, min(tail, n / SR / 3))[None]
    x = x - x.mean(axis=1, keepdims=True) * 0  # (dc is filtered per family)
    return x / (np.max(np.abs(x)) + 1e-9) * 10 ** (-1 / 20)


# ---------------------------------------------------------------- families
def boing(rng, i):
    d = rng.uniform(.45, .85)
    t = tt(d)
    f0 = rng.uniform(140, 330)
    wob = rng.uniform(9, 16)
    depth = rng.uniform(.18, .35)
    fr = f0 * (1 + depth * np.exp(-t * rng.uniform(4, 8)) * np.sin(2 * np.pi * wob * t)) * (1 + .15 * np.exp(-t * 30))
    x = osc(fr) + .35 * osc(fr * 2.01) + .18 * osc(fr * 3.03) + .08 * osc(fr * 5.4)
    x *= np.exp(-t * rng.uniform(4, 7)) * adsr(len(t), .001, .05)
    click = bp(rng.standard_normal(len(t)), 1500, 5000) * np.exp(-t * 300) * .4
    return room(lp(x + click, 7000), rng, .25, .12)


def slide(rng, i, up=True):
    d = rng.uniform(.45, .9)
    t = tt(d)
    a, b = rng.uniform(420, 620), rng.uniform(1300, 1900)
    if not up:
        a, b = b, a
    shape = rng.uniform(.6, 1.6)
    fr = a + (b - a) * (t / d) ** shape
    fr *= 1 + .012 * np.sin(2 * np.pi * rng.uniform(5, 7) * t) * np.minimum(1, t / .15)
    x = osc(fr) + .08 * osc(fr * 2) + .03 * osc(fr * 3)
    breath = bp(rng.standard_normal(len(t)), 1500, 6000) * .06
    x = (x + breath) * adsr(len(t), .03, .08)
    return room(x, rng, .3, .15)


def bloop(rng, i):
    d = rng.uniform(.09, .18)
    t = tt(d)
    f0, f1 = rng.uniform(250, 500), rng.uniform(900, 1800)
    fr = f0 + (f1 - f0) * (1 - np.exp(-t * rng.uniform(25, 45)))
    x = osc(fr) * np.exp(-t * rng.uniform(22, 35)) + .2 * osc(fr * 2) * np.exp(-t * 60)
    x *= adsr(len(t), .001, .02)
    x = np.concatenate([x, np.zeros(int(.12 * SR))])
    return room(lp(x, 9000), rng, .2, .1)


def bell(t, f, dec, amp=1.0, ratio=None, index=None, rng=None):
    ratio = ratio or 3.5
    index = index or 1.2
    m = np.sin(2 * np.pi * f * ratio * t) * index * np.exp(-t / (dec * .5))
    return amp * np.sin(2 * np.pi * f * t + m) * np.exp(-t / dec) * np.minimum(1, t / .002)


def chime_soft(rng, i):
    root = rng.choice([523.25, 587.33, 659.25, 698.46, 783.99, 880.0])
    scales = [[0, 4, 7, 12], [0, 7, 12, 16], [0, 4, 7, 11, 14], [0, 2, 7, 12], [12, 7, 4, 0], [0, 5, 9, 12]]
    sc = scales[i % len(scales)]
    gap = rng.uniform(.045, .09)
    d = gap * len(sc) + 1.6
    t = tt(d)
    x = np.zeros(len(t))
    for k, st in enumerate(sc):
        at = int(k * gap * SR)
        f = root * 2 ** (st / 12) * rng.uniform(.997, 1.003)
        x[at:] += bell(t[:len(t) - at], f, rng.uniform(.5, .9), .8 - .07 * k, ratio=rng.choice([2.0, 3.5, 4.0]), index=rng.uniform(.4, 1.0))
    sh = hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * 3) * np.minimum(1, t / .05) * .025
    return room(stereo(x + sh, 0, .6, rng), rng, .9, .3, 9000)


def sparkle(rng, i):
    d = rng.uniform(.6, 1.2)
    t = tt(d + .6)
    out = np.zeros((2, len(t)))
    n = rng.integers(7, 15)
    for k in range(n):
        at = int(rng.uniform(0, d) * SR)
        f = rng.uniform(2200, 6000)
        b = bell(t[:len(t) - at], f, rng.uniform(.06, .18), rng.uniform(.3, 1) * (1 - .5 * at / len(t)), ratio=rng.uniform(1.4, 2.8), index=.6)
        p = rng.uniform(-.8, .8)
        out[0, at:] += b * np.sqrt((1 - p) / 2)
        out[1, at:] += b * np.sqrt((1 + p) / 2)
    return room(out, rng, .6, .25, 11000)


def whoosh(rng, i, fast=False):
    d = rng.uniform(.18, .35) if fast else rng.uniform(.5, 1.1)
    t = tt(d)
    peak = rng.uniform(.4, .65)
    shape = np.exp(-((t / d - peak) ** 2) / (2 * (rng.uniform(.12, .2) if not fast else .14) ** 2))
    c0, c1 = (rng.uniform(600, 1200), rng.uniform(2500, 5000)) if fast else (rng.uniform(250, 500), rng.uniform(900, 2200))
    if rng.random() < .5:
        c0, c1 = c1, c0                                        # some go dark->bright, some bright->dark
    centres = c0 + (c1 - c0) * np.clip(t / d / peak, 0, 1) if rng.random() < .5 else c0 * (c1 / c0) ** (t / d)
    n = rng.standard_normal(len(t))
    x = swept_bp(n, centres, q=rng.uniform(1.0, 2.2)) * shape
    x += lp(rng.standard_normal(len(t)), 300) * shape ** 2 * .35          # body
    x = hp(x, 70)
    pan = np.clip((t / d - peak) * rng.uniform(1.5, 2.5) * rng.choice([-1, 1]), -.9, .9)
    st = np.stack([x * np.sqrt((1 - pan) / 2), x * np.sqrt((1 + pan) / 2)]) * np.sqrt(2)
    return room(st, rng, .25 if fast else .4, .1)


def riser(rng, i):
    d = rng.uniform(1.5, 3.0)
    t = tt(d)
    env = (t / d) ** rng.uniform(1.5, 2.5)
    n = swept_bp(rng.standard_normal(len(t)), 400 * (20 ** (t / d)), q=1.2) * env
    f = rng.uniform(90, 160) * (2 ** (rng.uniform(1, 2) * t / d))
    saws = sum(ss.sawtooth(2 * np.pi * np.cumsum(f * (1 + det)) / SR) for det in (-.006, 0, .007)) / 3
    saws = lp(saws, 2500) * env * .4
    x = (n + saws) * adsr(len(t), .2, .015)
    return room(stereo(x, 0, .5, rng), rng, .8, .25)


def tap_marimba(rng, i):
    f = rng.choice([392, 440, 494, 523, 587, 659, 698, 784, 880, 988, 1047, 1175])
    t = tt(.5)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * rng.uniform(14, 22)) + .25 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 60) \
        + .1 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 120)
    x += bp(rng.standard_normal(len(t)), 2000, 6000) * np.exp(-t * 600) * .25
    return room(x * adsr(len(t), .0008, .05), rng, .3, .14)


def pluck_pizz(rng, i):
    f = rng.choice([196, 220, 247, 262, 294, 330, 349, 392, 440])
    d = .6
    n = int(SR / f)
    # Karplus-Strong
    buf = lp(rng.standard_normal(n), rng.uniform(2500, 5000))
    out = np.zeros(int(d * SR))
    for k in range(len(out)):
        out[k] = buf[k % n]
        buf[k % n] = .5 * (buf[k % n] + buf[(k + 1) % n]) * .996
    out *= np.exp(-tt(d) * rng.uniform(5, 9))
    return room(out * adsr(len(out), .001, .05), rng, .4, .2)


def swell_reverse(rng, i):
    d = rng.uniform(.8, 1.6)
    t = tt(d)
    n = hp(rng.standard_normal(len(t)), rng.uniform(2500, 5000)) + .3 * bp(rng.standard_normal(len(t)), 600, 3000)
    env = np.exp((t - d) * rng.uniform(3, 6))
    x = n * env * adsr(len(t), .05, .006)
    return stereo(x, 0, .5, rng)


def thump_soft(rng, i):
    d = .45
    t = tt(d)
    f = rng.uniform(55, 95) * (1 + 1.5 * np.exp(-t * 40))
    x = osc(f) * np.exp(-t * rng.uniform(9, 15))
    x += bp(rng.standard_normal(len(t)), 800, 3000) * np.exp(-t * rng.uniform(120, 250)) * rng.uniform(.15, .35)
    return room(x * adsr(len(t), .001, .05), rng, .3, .1)


def impact_deep(rng, i):
    """heavy cinematic hit: pitched sub drop + felt/wood transient + short noisy debris tail"""
    d = rng.uniform(.9, 1.6)
    t = tt(d)
    f = rng.uniform(42, 70) * (1 + rng.uniform(1.5, 3) * np.exp(-t * rng.uniform(25, 45)))
    sub = osc(f) * np.exp(-t * rng.uniform(3.5, 6))
    body = bp(rng.standard_normal(len(t)), rng.uniform(150, 300), rng.uniform(900, 1800)) * np.exp(-t * rng.uniform(18, 30)) * .9
    crack = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * rng.uniform(70, 140)) * rng.uniform(.25, .5)
    deb = np.zeros(len(t))
    for _ in range(rng.integers(4, 10)):                                # small debris ticks after the hit
        at = int(rng.uniform(.04, .45) * SR)
        n = int(.012 * SR)
        if at + n < len(t):
            deb[at:at + n] += bp(rng.standard_normal(n), 1500, 6000) * np.exp(-np.arange(n) / (n / 4)) * rng.uniform(.03, .1)
    x = np.tanh((sub * 1.1 + body + crack + deb) * 1.4) * adsr(len(t), .0005, .1)
    return room(stereo(x, 0, .4, rng), rng, .6, .16)


FAMILIES = {
    'boing': (boing, 12), 'slide_up': (lambda r, i: slide(r, i, True), 10), 'slide_down': (lambda r, i: slide(r, i, False), 10),
    'bloop': (bloop, 14), 'chime_soft': (chime_soft, 12), 'sparkle': (sparkle, 12),
    'whoosh_soft': (whoosh, 14), 'whoosh_fast': (lambda r, i: whoosh(r, i, True), 14), 'riser': (riser, 8),
    'tap_marimba': (tap_marimba, 12), 'pluck_pizz': (pluck_pizz, 9), 'swell_reverse': (swell_reverse, 8),
    'thump_soft': (thump_soft, 10), 'impact_deep': (impact_deep, 12),
}


def main():
    total = 0
    for fam, (fn, n) in FAMILIES.items():
        d = OUT / fam
        d.mkdir(parents=True, exist_ok=True)
        for i in range(n):
            rng = np.random.default_rng(sum(map(ord, fam)) * 101 + i)
            x = finish(fn(rng, i))
            with sf.SoundFile(str(d / f'{fam}_{i + 1:02d}.ogg'), 'w', SR, 2, format='OGG', subtype='VORBIS') as f:
                for k in range(0, x.shape[1], SR):
                    f.write(np.ascontiguousarray(x[:, k:k + SR].T))
            total += 1
    print('rendered', total, 'files into', OUT)


if __name__ == '__main__':
    main()
