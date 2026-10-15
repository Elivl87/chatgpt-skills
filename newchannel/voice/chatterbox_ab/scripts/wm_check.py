"""Perth watermark detection on raw Chatterbox WAVs, after -16 LUFS normalisation, and after MP3 128k; Kokoro as control.
usage: wm_check.py CLIPDIR"""
import json, subprocess, sys, os
from pathlib import Path
import librosa, numpy as np, perth
D = Path(sys.argv[1]); W = perth.PerthImplicitWatermarker()
out = {}
def det(x, sr):
    return round(float(W.get_watermark(x, sample_rate=sr)), 3)
for f in sorted(D.glob("cb_*_x05_N*.wav")) + sorted(D.glob("kokoro_N*.wav")) + sorted(D.glob("cb_*_x05_M2.wav")):
    x, sr = librosa.load(f, sr=None)
    n, _ = librosa.load(D / "norm" / f.name, sr=None)
    mp3 = D / (f.stem + "_wm.mp3")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(D / "norm" / f.name), "-b:a", "128k", str(mp3)], check=True)
    m, msr = librosa.load(mp3, sr=None)
    out[f.stem] = {"raw": det(x, sr), "norm_48k": det(n, 48000), "mp3_128k": det(m, msr)}
    print(f.stem, out[f.stem], flush=True)
(D / "watermark.json").write_text(json.dumps(out, indent=1))
