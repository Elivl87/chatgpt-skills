#!/usr/bin/env python3
"""Assemble AB_voces.mp3 from the -16 LUFS clips (no announcer, only tones).

    python3 build_ab.py CLIPDIR/norm

Pattern, per test line (order = table in VOICE_AB.md):
    line marker   two soft rising tones (G5 -> D6), then 0.6 s
    A  = Kokoro (current production recipe)         1 short beep  (1000 Hz)
    B  = Chatterbox Multilingual, exaggeration 0.5   2 short beeps ( 600 Hz)
    B+ = Chatterbox Multilingual, exaggeration 0.8   3 short beeps ( 600 Hz)
    C  = Chatterbox LatAm pack,   exaggeration 0.5   2 long beeps  ( 400 Hz)
Each clip is followed by 0.9 s of silence; 1.4 s between lines.
"""
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
SR = 48000
LINES = ["N1", "N2", "E1", "E2", "E3", "M1", "M2", "M3"]
VERSIONS = [("kokoro", 1, 1000, 0.09), ("cb_base_x05", 2, 600, 0.09), ("cb_base_x08", 3, 600, 0.09),
            ("cb_latam_x05", 2, 400, 0.28)]


def tone(f, d, amp=0.12):
    t = np.arange(int(d * SR)) / SR
    e = np.minimum(1, t / 0.005) * np.minimum(1, (d - t) / 0.015)
    return (amp * np.sin(2 * np.pi * f * t) * e).astype(np.float32)


def sil(d):
    return np.zeros(int(d * SR), np.float32)


def beeps(n, f, d):
    out = []
    for k in range(n):
        out += [tone(f, d), sil(0.09)]
    return np.concatenate(out + [sil(0.35)])


def main():
    src = Path(sys.argv[1])
    parts = [sil(0.4)]
    for lid in LINES:
        parts += [tone(784, 0.16, 0.08), sil(0.03), tone(1175, 0.24, 0.08), sil(0.6)]
        for stem, n, f, d in VERSIONS:
            x, sr = sf.read(src / f"{stem}_{lid}.wav", dtype="float32")
            assert sr == SR
            parts += [beeps(n, f, d), x, sil(0.9)]
        parts.append(sil(0.5))
    y = np.concatenate(parts)
    wav = HERE / "AB_voces.wav"
    sf.write(wav, y, SR, subtype="PCM_16")
    out = HERE / "AB_voces.mp3"
    subprocess.run(["/usr/bin/ffmpeg", "-v", "error", "-y", "-i", str(wav), "-ac", "1", "-c:a", "libmp3lame",
                    "-b:a", "128k", str(out)], check=True)
    wav.unlink()
    print(out, f"{len(y) / SR:.1f} s", f"{out.stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
