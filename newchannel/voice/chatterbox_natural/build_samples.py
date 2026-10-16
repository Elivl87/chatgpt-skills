"""Join rendered variants into one listening MP3: N short beeps before variant N (or given counts), each variant
levelled to -16 LUFS. usage: build_samples.py OUT.mp3 WAV1[:beeps] WAV2[:beeps] ... (beeps default = position)"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402

import cbn  # noqa: E402

SR = 44100


def beeps(n, f=880.0, d=0.12, gap=0.13):
    t = np.arange(int(d * SR)) / SR
    b = 0.25 * np.sin(2 * np.pi * f * t) * np.minimum(1, np.minimum(t, d - t) / 0.01)
    out = []
    for k in range(n):
        out += [b, np.zeros(int(gap * SR))]
    return np.concatenate(out + [np.zeros(int(0.6 * SR))]).astype(np.float32)


def main():
    out = Path(sys.argv[1])
    parts = [np.zeros(int(0.3 * SR), np.float32)]
    for i, spec in enumerate(sys.argv[2:]):
        path, _, n = spec.partition(":")
        n = int(n) if n else i + 1
        import librosa
        x, sr = sf.read(path, dtype="float32")
        x = librosa.resample(x, orig_sr=sr, target_sr=SR)
        x = cbn.level(x, -16.0, SR)
        pk = np.abs(x).max()
        if pk > 0.89:
            x *= 0.89 / pk
        parts += [beeps(n), x, np.zeros(int(1.4 * SR), np.float32)]
    y = np.concatenate(parts)
    p = subprocess.run([cbn.FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a",
                        "libmp3lame", "-b:a", "96k", "-threads", "2", str(out)], input=y.tobytes(), check=True)
    print(out, round(len(y) / SR, 1), "s", round(out.stat().st_size / 1e6, 2), "MB")


if __name__ == "__main__":
    main()
