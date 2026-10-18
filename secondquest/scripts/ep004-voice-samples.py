#!/usr/bin/env python3
"""EP004 placeholder-voice A/B samples (free, Kokoro). Hook ¶01-¶08 of the LOCKED script A v2.3, verbatim.

Round 1 (2026-10-18): A = the EP003 approved chain (am_fenrir @0.94 + EQ toward Bram + 1 semitone); B = same @0.88.
Round 2 (Producer: "más parecido a Bram en su timbre"): the winners of scripts/ep004-voice-match.py (timbre distance to
Bram's real EP002+EP003 narration, lower = closer): C = fenrir 50 % + santa 50 %, +2 st (0.676); D = fenrir 65 % +
santa 35 %, +3 st (0.693); A again as the baseline. Script text: v3.1 hook. Bram's own reference clip is cut too.
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

lines = re.findall(r'^¶0([1-8]) (.*)$', (ROOT / 'docs/expedition33/scripts/A_v3_1_EN.txt').read_text(), re.M)
k = Kokoro(str(Path(sys.argv[1]) / 'kokoro-v1.0.int8.onnx'), str(Path(sys.argv[1]) / 'voices-v1.0.bin'))
ff = __import__('imageio_ffmpeg').get_ffmpeg_exe()
ref = np.frombuffer(subprocess.run([ff, '-v', 'error', '-ss', '29.26', '-t', '19.6', '-i',
                    str(ROOT / 'public/episodes/ep002/audio/narration.wav'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                    capture_output=True, check=True).stdout, np.float32)
OUT.mkdir(parents=True, exist_ok=True)
fen, san = k.get_voice_style('am_fenrir'), k.get_voice_style('am_santa')
VARIANTS = [('r2_A_fenrir_EP003', fen, 1), ('r2_C_fenrir50_santa50_+2', .5 * fen + .5 * san, 2),
            ('r2_D_fenrir65_santa35_+3', .65 * fen + .35 * san, 3)]
subprocess.run([ff, '-v', 'error', '-y', '-ss', '29.26', '-t', '19.6', '-i', str(ROOT / 'public/episodes/ep002/audio/narration.wav'),
                '-b:a', '160k', str(OUT / 'r2_0_BRAM_referencia.mp3')], check=True)
for name, style, pitch in VARIANTS:
    speed, gap = 0.94, 0.45
    parts = [np.zeros(int(.3 * SR), np.float32)]
    for pid, text in lines:
        a, sr = k.create(text, voice=style, speed=speed, lang='en-us')
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
        subprocess.run([ff, '-v', 'error', '-y', '-i', f'{td}/a.wav', '-af', f'rubberband=pitch={2 ** (pitch / 12):.6f}',
                        '-ar', '48000', '-b:a', '160k', str(OUT / f'{name}.mp3')], check=True)
    print(name, round(sum(len(p) for p in parts) / SR, 1), 's')
