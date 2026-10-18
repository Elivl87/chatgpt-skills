#!/usr/bin/env python3
"""EP004: free female placeholder-voice samples (Kokoro), v3.1 hook ¶01-¶08 verbatim (Producer asked "¿Y hay de mujer?").
Best-rated Kokoro female voices, raw timbre (no EQ toward Bram, who is male), speed 0.94, loudness matched to Bram.
Usage: python3 scripts/ep004-voice-female.py <kokoro_model_dir>
"""
import re, subprocess, sys
from pathlib import Path
import numpy as np, soundfile, scipy.signal as ss
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/expedition33/voice_test'
SR = 24000
lines = re.findall(r'^¶0([1-8]) (.*)$', (ROOT / 'docs/expedition33/scripts/A_v3_1_EN.txt').read_text(), re.M)
k = Kokoro(str(Path(sys.argv[1]) / 'kokoro-v1.0.int8.onnx'), str(Path(sys.argv[1]) / 'voices-v1.0.bin'))
ff = __import__('imageio_ffmpeg').get_ffmpeg_exe()
for voice, lang in [('af_heart', 'en-us'), ('af_bella', 'en-us'), ('af_nicole', 'en-us'), ('bf_emma', 'en-gb')]:
    parts = [np.zeros(int(.3 * SR), np.float32)]
    for pid, text in lines:
        a, sr = k.create(text, voice=voice, speed=0.94, lang=lang)
        a = np.asarray(a, np.float32)
        if sr != SR:
            a = ss.resample_poly(a, SR, sr).astype(np.float32)
        loud = np.where(np.abs(a) > 0.01)[0]
        a = a[max(0, loud[0] - int(.03 * SR)): loud[-1] + int(.05 * SR)]
        p = 1.5 if pid == '8' else (0.7 if text.endswith(('?', '...')) or len(text.split()) <= 3 else 0.45)
        parts += [a, np.zeros(int(p * SR), np.float32)]
    x = np.concatenate(parts)
    x = np.clip(x * 0.12 / np.sqrt(np.mean(x[np.abs(x) > .01] ** 2)), -0.98, 0.98)
    soundfile.write('/tmp/_f.wav', x, SR)
    subprocess.run([ff, '-v', 'error', '-y', '-i', '/tmp/_f.wav', '-ar', '48000', '-b:a', '160k',
                    str(OUT / f'r3_mujer_{voice}.mp3')], check=True)
    print(voice, round(len(x) / SR, 1), 's')
