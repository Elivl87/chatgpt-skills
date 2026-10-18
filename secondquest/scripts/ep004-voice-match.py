#!/usr/bin/env python3
"""EP004: search the free Kokoro chain closest to Bram's TIMBRE (Producer, 2026-10-18).

Bram reference = his real EP002 + EP003 narrations (~10 min). Each candidate (voice blend, pitch, formant handling) reads
the same EP004 hook text, then goes through the EQ-to-Bram step; the score is a timbre distance on voiced frames:
MFCC 1-19 mean + std (z-scored by Bram's own spread) + spectral centroid/tilt + median pitch. Lower = closer.
Usage: python3 scripts/ep004-voice-match.py <kokoro_dir> [--quick]
Writes docs/expedition33/voice_test/voice_match.json.
"""
import itertools, json, re, subprocess, sys, tempfile
from pathlib import Path
import numpy as np, soundfile, librosa, scipy.signal as ss
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
SR = 24000
sys.path.insert(0, str(ROOT / 'scripts'))
eq_to = __import__('importlib').import_module('ep003-placeholder-narration').eq_to
ff = __import__('imageio_ffmpeg').get_ffmpeg_exe()


def load(path, ss_=None, t=None):
    cmd = [ff, '-v', 'error'] + (['-ss', str(ss_)] if ss_ else []) + (['-t', str(t)] if t else []) + \
          ['-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).copy()


def feats(x):
    rms = librosa.feature.rms(y=x, frame_length=1024, hop_length=256)[0]
    m = librosa.feature.mfcc(y=x, sr=SR, n_mfcc=20, n_fft=1024, hop_length=256)[1:]
    cen = librosa.feature.spectral_centroid(y=x, sr=SR, n_fft=1024, hop_length=256)[0]
    n = min(len(rms), m.shape[1], len(cen)); v = rms[:n] > np.percentile(rms[:n], 40)
    f0 = librosa.yin(x, fmin=60, fmax=300, sr=SR, frame_length=2048, hop_length=256)
    f0 = f0[: n][v[: len(f0)]] if len(f0) >= n else f0
    return {'mu': m[:, :n][:, v].mean(1), 'sd': m[:, :n][:, v].std(1), 'cen': float(np.median(cen[:n][v])),
            'f0': float(np.median(f0))}


def dist(a, b):
    d = np.sqrt(np.mean(((a['mu'] - b['mu']) / b['sd']) ** 2)) + 0.5 * np.sqrt(np.mean(((a['sd'] - b['sd']) / b['sd']) ** 2))
    d += abs(np.log(a['cen'] / b['cen'])) * 2 + abs(12 * np.log2(a['f0'] / b['f0'])) * 0.15
    return round(float(d), 3)


def chain(k, text_lines, style, speed, pitch, formant, ref):
    parts = []
    for t in text_lines:
        a, sr = k.create(t, voice=style, speed=speed, lang='en-us')
        a = np.asarray(a, np.float32)
        if sr != SR:
            a = ss.resample_poly(a, SR, sr).astype(np.float32)
        parts += [a, np.zeros(int(.45 * SR), np.float32)]
    x = eq_to(np.concatenate(parts), ref)
    with tempfile.TemporaryDirectory() as td:
        soundfile.write(f'{td}/a.wav', x, SR)
        af = f'rubberband=pitch={2 ** (pitch / 12):.6f}:formant={formant}' if pitch else 'anull'
        subprocess.run([ff, '-v', 'error', '-y', '-i', f'{td}/a.wav', '-af', af, f'{td}/b.wav'], check=True)
        y, _ = soundfile.read(f'{td}/b.wav', dtype='float32')
    return eq_to(y, ref) if pitch else y


def main():
    kd = Path(sys.argv[1]); quick = '--quick' in sys.argv
    k = Kokoro(str(kd / 'kokoro-v1.0.int8.onnx'), str(kd / 'voices-v1.0.bin'))
    bram = np.concatenate([load(ROOT / 'public/episodes/ep002/audio/narration.wav', 20, 300),
                           load(ROOT / 'public/episodes/ep003/audio/narration_bram.wav', 5, 240)])
    ref_eq = load(ROOT / 'public/episodes/ep002/audio/narration.wav', 29.26, 19.6)      # the EP003 chain's EQ target
    fb = feats(bram)
    print(f"Bram: f0 {fb['f0']:.0f} Hz, centroid {fb['cen']:.0f} Hz", flush=True)
    lines = re.findall(r'^¶0[1-7] (.*)$', (ROOT / 'docs/expedition33/scripts/A_v2_3_EN.txt').read_text(), re.M)
    st = {v: k.get_voice_style(v) for v in ['am_fenrir', 'am_santa', 'am_liam', 'am_michael', 'am_adam', 'bm_lewis', 'am_puck']}
    blends = [('am_fenrir', None, 0)] + [('am_fenrir', o, w) for o in st if o != 'am_fenrir' for w in (0.2, 0.35)]
    pitches = [0, 1] if quick else [-1, 0, 1, 2]
    res = []
    for (base, other, w), p, fm in itertools.product(blends, pitches, ['shifted', 'preserved']):
        if p == 0 and fm == 'preserved':
            continue
        style = st[base] if not other else (1 - w) * st[base] + w * st[other]
        y = chain(k, lines, style, 0.94, p, fm, ref_eq)
        f = feats(y); d = dist(f, fb)
        name = base + (f'+{w:.2f}{other}' if other else '') + f' p{p:+d} {fm if p else ""}'
        res.append({'name': name, 'other': other, 'w': w, 'pitch': p, 'formant': fm, 'dist': d,
                    'f0': round(f['f0']), 'cen': round(f['cen'])})
        print(f'{d:6.3f}  f0 {f["f0"]:5.0f}  cen {f["cen"]:5.0f}  {name}', flush=True)
    res.sort(key=lambda r: r['dist'])
    out = ROOT / 'docs/expedition33/voice_test/voice_match.json'
    out.write_text(json.dumps({'bram': {'f0': round(fb['f0']), 'cen': round(fb['cen'])}, 'ranking': res}, indent=1))
    print('best:', res[:5])


if __name__ == '__main__':
    main()
