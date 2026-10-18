#!/usr/bin/env python3
"""EP004 placeholder-voice A/B samples (free, Kokoro). Hook ¶01-¶08 of the LOCKED script A v2.3, verbatim.

A = the EP003 approved chain: am_fenrir @0.94 + long-term EQ toward Bram (EP002) + 1 semitone.
B = the same chain @0.88 with longer pauses: a slower, more restrained read for this episode's grief tone.
Usage: python3 scripts/ep004-voice-samples.py <kokoro_model_dir>
"""
import re, subprocess, sys, tempfile
from pathlib import Path
import numpy as np, soundfile, scipy.signal as ss
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/expedition33/voice_test'
SR = 24000
sys.path.insert(0, str(ROOT / 'scripts'))
eq_to = __import__('importlib').import_module('ep003-placeholder-narration').eq_to

lines = re.findall(r'^¶0([1-8]) (.*)$', (ROOT / 'docs/expedition33/scripts/A_v2_3_EN.txt').read_text(), re.M)
k = Kokoro(str(Path(sys.argv[1]) / 'kokoro-v1.0.int8.onnx'), str(Path(sys.argv[1]) / 'voices-v1.0.bin'))
ff = __import__('imageio_ffmpeg').get_ffmpeg_exe()
ref = np.frombuffer(subprocess.run([ff, '-v', 'error', '-ss', '29.26', '-t', '19.6', '-i',
                    str(ROOT / 'public/episodes/ep002/audio/narration.wav'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                    capture_output=True, check=True).stdout, np.float32)
OUT.mkdir(parents=True, exist_ok=True)
for name, speed, gap in [('A_fenrir_EP003_0.94', 0.94, 0.45), ('B_fenrir_lento_0.88', 0.88, 0.7)]:
    parts = [np.zeros(int(.3 * SR), np.float32)]
    for pid, text in lines:
        a, sr = k.create(text, voice='am_fenrir', speed=speed, lang='en-us')
        a = np.asarray(a, np.float32)
        if sr != SR:
            a = ss.resample_poly(a, SR, sr).astype(np.float32)
        loud = np.where(np.abs(a) > 0.01)[0]
        a = a[max(0, loud[0] - int(.03 * SR)): loud[-1] + int(.05 * SR)]
        p = 1.5 if pid == '8' else (gap * 1.6 if text.endswith(('?', '...')) or len(text.split()) <= 3 else gap)
        parts += [a, np.zeros(int(p * SR), np.float32)]
    x = eq_to(np.concatenate(parts), ref)
    with tempfile.TemporaryDirectory() as td:
        soundfile.write(f'{td}/a.wav', x, SR)
        subprocess.run([ff, '-v', 'error', '-y', '-i', f'{td}/a.wav', '-af', f'rubberband=pitch={2 ** (1 / 12):.6f}',
                        '-ar', '48000', '-b:a', '160k', str(OUT / f'{name}.mp3')], check=True)
    print(name, round(sum(len(p) for p in parts) / SR, 1), 's')
