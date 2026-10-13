"""Sonification of the phantom-jam sim, pure numpy (no samples, no stock audio).

    python3 sound.py OUT.wav          -> 48 kHz stereo 16-bit master: gain + look-ahead true-peak limiter (-1.6 dB)
                                         iterated against ffmpeg ebur128 until -14 LUFS integrated.
Layers
  lap ticks   each car plucks a soft note when it crosses the start line at the top of the ring: steady flow = a
              steady pulse; the jam breaks the rhythm (and slow cars pluck softer)
  brake ticks a dry tick every time a car brakes harder than sim.HARD_BRAKE (panned to where it is on screen)
  the tap     one low thunk when the first dot taps the brakes
  hum         a low drone whose voice count / beating follows how many cars are stuck
  pad         a quiet warm bed (fades in)
  mascot      tiny chirps on its expression changes (surprised up-glide, annoyed grumble, relieved sigh)
"""
import math, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sim  # noqa: E402
import render  # noqa: E402  (shares the ring geometry so pans match the picture)

SR = 48000
RNG = np.random.default_rng(2008)       # fixed seed: noise bursts are deterministic


def env_exp(n, attack, decay):
    t = np.arange(n) / SR
    a = np.minimum(1, t / max(attack, 1e-4))
    return a * np.exp(-t / decay)


def add(buf, start_s, sig, pan=0.0, gain=1.0):
    i0 = int(round(start_s * SR))
    if i0 >= buf.shape[0]:
        return
    sig = sig[:buf.shape[0] - i0] * gain
    l = math.cos((pan + 1) * math.pi / 4); r = math.sin((pan + 1) * math.pi / 4)
    buf[i0:i0 + len(sig), 0] += sig * l
    buf[i0:i0 + len(sig), 1] += sig * r


def pluck(freq, dur=0.5, decay=0.16):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + .28 * np.sin(2 * np.pi * 2.005 * freq * t) * np.exp(-t / .05) \
        + .10 * np.sin(2 * np.pi * 3.01 * freq * t) * np.exp(-t / .03)
    return s * env_exp(n, .003, decay)


def tick(bright=2400.0):
    n = int(.06 * SR); t = np.arange(n) / SR
    noise = RNG.normal(0, 1, n)
    # crude band-pass: difference of two one-pole lowpasses
    def lp(x, fc):
        a = math.exp(-2 * math.pi * fc / SR); y = np.zeros_like(x); acc = 0.0
        for i in range(len(x)):
            acc = (1 - a) * x[i] + a * acc; y[i] = acc
        return y
    bp = lp(noise, bright * 1.6) - lp(noise, bright * .6)
    s = bp * 3.0 * np.exp(-t / .010) + .5 * np.sin(2 * np.pi * bright * .75 * t) * np.exp(-t / .018)
    return s


def thunk():
    n = int(.9 * SR); t = np.arange(n) / SR
    f = 70 + 120 * np.exp(-t / .07)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env_exp(n, .004, .28) + .25 * np.sin(2 * ph) * env_exp(n, .004, .12)
    s += .35 * RNG.normal(0, 1, n) * np.exp(-t / .02)
    return s


def glide(f0, f1, dur, decay):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + .2 * np.sin(2 * ph)) * env_exp(n, .01, decay)


def grumble():
    n = int(.45 * SR); t = np.arange(n) / SR
    f = 150 - 20 * t
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.tanh(2.2 * np.sin(ph)) * (.6 + .4 * np.sin(2 * np.pi * 22 * t))
    return s * env_exp(n, .03, .18) * .7


def sigh():
    n = int(.6 * SR); t = np.arange(n) / SR
    g = glide(880, 520, .6, .22)
    br = RNG.normal(0, 1, n); k = np.ones(40) / 40
    br = np.convolve(br, k, 'same') * np.sin(np.pi * np.clip(t / .55, 0, 1)) ** 2
    return g + .5 * br


PENTA = [392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0]   # G major pentatonic, gentle register


def screen_pan(s, f, i):
    th = render.car_angle(s, f, i)
    x = render.CX + render.R * math.cos(th)
    return float(np.clip((x - 960) / 520, -.85, .85))


def build():
    s = render.story()
    fps = s['fps']; nf = s['x'].shape[0]; dur = nf / fps
    N = int(dur * SR)
    out = np.zeros((N, 2))
    n = s['n']; v_eq = s['v_eq']

    # ---- lap ticks: crossing the top of the ring (screen angle 90 deg)
    for i in range(n):
        th = s['theta0'] + 2 * np.pi * s['x'][:, i] / s['L'] - np.pi / 2
        k = np.floor(th / (2 * np.pi))
        for f in np.flatnonzero(np.diff(k) > 0):
            frac = ((k[f + 1]) * 2 * np.pi - th[f]) / (th[f + 1] - th[f])
            t0 = (f + frac) / fps
            vel = min(1.0, s['v'][f, i] / v_eq)
            if i == s['mascot']:
                sig = pluck(1046.5, .6, .2) * .9 + pluck(1568, .6, .08) * .25
            else:
                sig = pluck(PENTA[(i * 3) % len(PENTA)], .5, .14)
            add(out, t0, sig, pan=0.0, gain=.16 * (.35 + .65 * vel))

    # ---- brake ticks
    A = s['a']; last = np.full(n, -9.0)
    for f in range(1, nf):
        for i in np.flatnonzero((A[f] < -sim.HARD_BRAKE) & (A[f - 1] >= -sim.HARD_BRAKE)):
            t0 = f / fps
            if t0 - last[i] < .45:
                continue
            last[i] = t0
            strength = min(1.0, -A[f, i] / 3.0)
            add(out, t0, tick(2000 + 90 * (i % 7)), pan=screen_pan(s, f, i), gain=.10 + .12 * strength)

    # ---- the tap
    add(out, s['tap_t'], thunk(), pan=screen_pan(s, int(s['tap_t'] * fps), s['braker']), gain=.38)

    # ---- hum: voices follow the (smoothed) number of stuck cars
    t = np.arange(N) / SR
    stuck = (s['v'] < sim.SLOW_V).sum(1).astype(float)
    sm = np.zeros_like(stuck); acc = 0.0
    for f in range(nf):
        acc += (stuck[f] - acc) * .06; sm[f] = acc
    jam = np.interp(t, np.arange(nf) / fps, sm)
    hum = np.zeros(N)
    for k in range(1, 9):
        amp = np.clip(jam - (k - 1), 0, 1)                  # voice k appears when k cars are stuck
        if amp.max() <= 0:
            continue
        f0 = 82.41 * (1 + .0045 * k * (-1) ** k)            # E2, each extra voice detuned a little more -> beating
        ph = 2 * np.pi * f0 * t + k
        hum += amp * (np.sin(ph) + .45 * np.sin(2 * ph) + .25 * np.sin(3 * ph) + .12 * np.sin(4 * ph))
    hum *= .040
    out[:, 0] += hum; out[:, 1] += hum * .96

    # ---- pad (quiet, warm), dips slightly as the jam grows
    pad = np.zeros(N)
    for j, f0 in enumerate([196.0, 293.66, 392.0, 493.88]):
        lfo = .6 + .4 * np.sin(2 * np.pi * (.07 + .03 * j) * t + j)
        pad += lfo * (np.sin(2 * np.pi * f0 * t) + .15 * np.sin(2 * np.pi * 2 * f0 * t + .3))
    pad *= .026 * np.clip(t / 1.2, 0, 1) * (1 - .35 * np.clip(jam / 6, 0, 1))
    out[:, 0] += pad; out[:, 1] += pad

    # ---- mascot chirps
    e = s['expr']
    for f in np.flatnonzero(np.diff(e)) + 1:
        pan = screen_pan(s, f, s['mascot'])
        if e[f] == sim.SURPRISED:
            add(out, f / fps, glide(620, 1180, .16, .07), pan, .22)
        elif e[f] == sim.ANNOYED:
            add(out, f / fps, grumble(), pan, .20)
        elif e[f] == sim.RELIEVED:
            add(out, f / fps, sigh(), pan, .18)

    # fades
    fi = np.clip(t / .25, 0, 1); fo = np.clip((dur - t) / .5, 0, 1)
    out *= (fi * fo)[:, None]
    return out


def write_wav(path, x):
    import wave
    x = np.clip(x, -1, 1)
    pcm = (x * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def measure(path):
    """Integrated loudness (LUFS) and true peak (dBTP) via ffmpeg ebur128."""
    import re, subprocess
    r = subprocess.run(['/usr/bin/ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true',
                        '-f', 'null', '-'], capture_output=True, text=True).stderr
    summ = r[r.rfind('Summary:'):]
    I = float(re.search(r'I:\s+(-?[\d.]+) LUFS', summ).group(1))
    TP = float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', summ).group(1))
    return I, TP


def limit(x, ceiling_db, look_ms=3.0, release_ms=80.0):
    """Look-ahead peak limiter on a 4x oversampled peak estimate (keeps true peak under the ceiling)."""
    c = 10 ** (ceiling_db / 20)
    # 4x oversampled magnitude via linear interpolation of the band-limited signal (cheap estimate, padded margin)
    n = x.shape[0]
    up = np.abs(np.fft.irfft(np.pad(np.fft.rfft(x, axis=0), ((0, n * 3 // 2), (0, 0))), n=n * 4, axis=0) * 4)
    pk = up.reshape(n, 4, 2).max(axis=(1, 2))
    need = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    la = int(look_ms * SR / 1000)
    # minimum over the look-ahead window (so gain is down before the peak arrives)
    from numpy.lib.stride_tricks import sliding_window_view
    padded = np.pad(need, (0, la), constant_values=1.0)
    g = sliding_window_view(padded, la + 1).min(axis=1)
    # smooth: instant attack (already looked ahead), exponential release
    a = math.exp(-1 / (release_ms * SR / 1000)); out = np.empty_like(g); acc = 1.0
    for i in range(len(g)):
        acc = g[i] if g[i] < acc else a * acc + (1 - a) * g[i]; out[i] = acc
    return x * out[:, None]


def master(x, path, target=-14.0, ceiling=-1.6):
    tmp = path + '.tmp.wav'
    gain_db = 0.0
    for it in range(6):
        y = limit(x * 10 ** (gain_db / 20), ceiling)
        write_wav(tmp, y)
        I, TP = measure(tmp)
        print('  pass %d: gain %+.2f dB -> I %.2f LUFS, TP %.2f dBTP' % (it, gain_db, I, TP))
        if abs(I - target) < .15 and TP <= -1.0:
            break
        gain_db += target - I
    os.replace(tmp, path)
    return I, TP


if __name__ == '__main__':
    out = build()
    out = out / np.abs(out).max() * .5
    path = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/sim_test_mix.wav'
    I, TP = master(out, path)
    print('master: %.2f LUFS integrated, %.2f dBTP true peak -> %s' % (I, TP, path))
