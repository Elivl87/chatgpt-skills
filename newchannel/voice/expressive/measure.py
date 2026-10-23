"""Expressiveness measurements for a narration wav (Diez Mil Puntos voice tests).

    python -I measure.py FILE.wav [--ref REF.wav] [--json OUT.json]

pitch_range_st  = p95 - p5 of the voiced f0 contour, in semitones (pyin, 60-400 Hz)
pitch_std_st    = standard deviation of the f0 contour in semitones around its median
energy_std_db   = std of the RMS level (50 ms frames) over speech frames, in dB (loudness variety)
pauses          = silences >= 0.15 s inside the take: count, mean, std (pause variety)
speech_rate     = words / speech seconds (if --words given)
similarity      = Resemblyzer cosine similarity to --ref (speaker identity), if given
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf


def load(path, sr=24000):
    import librosa
    x, s = sf.read(str(path), dtype="float32")
    if x.ndim > 1:
        x = x.mean(1)
    if s != sr:
        x = librosa.resample(x, orig_sr=s, target_sr=sr)
    return x, sr


def measure(x, sr=24000, words=None, ref=None):
    import librosa
    out = {"dur_s": round(len(x) / sr, 2)}
    f0, vf, _ = librosa.pyin(x, fmin=60, fmax=400, sr=sr, frame_length=2048, hop_length=480)
    v = f0[vf & np.isfinite(f0)]
    st = 12 * np.log2(v / np.median(v))
    out["f0_median_hz"] = round(float(np.median(v)), 1)
    out["pitch_range_st"] = round(float(np.percentile(st, 95) - np.percentile(st, 5)), 2)
    out["pitch_std_st"] = round(float(st.std()), 2)
    # per-second pitch movement: how much the median f0 moves from one second to the next (melody, not jitter)
    hop = 480 / sr
    secs = []
    for i in range(0, len(f0), int(1 / hop)):
        seg, vv = f0[i:i + int(1 / hop)], vf[i:i + int(1 / hop)]
        if vv.sum() > 10:
            secs.append(12 * np.log2(np.median(seg[vv]) / np.median(v)))
    out["melody_std_st"] = round(float(np.std(secs)), 2) if len(secs) > 2 else None
    h = int(0.05 * sr)
    rms = np.array([np.sqrt((x[i:i + h] ** 2).mean()) for i in range(0, len(x) - h + 1, h)])
    db = 20 * np.log10(rms + 1e-9)
    speech = db > db.max() - 35
    out["energy_std_db"] = round(float(db[speech].std()), 2)
    out["energy_range_db"] = round(float(np.percentile(db[speech], 95) - np.percentile(db[speech], 5)), 2)
    # pauses: runs of non-speech frames >= 0.15 s, excluding head/tail
    runs, k = [], 0
    idx = np.flatnonzero(speech)
    for i in range(idx[0], idx[-1]):
        if not speech[i]:
            k += 1
        else:
            if k * 0.05 >= 0.15:
                runs.append(k * 0.05)
            k = 0
    out["pauses_n"] = len(runs)
    out["pause_mean_s"] = round(float(np.mean(runs)), 2) if runs else None
    out["pause_std_s"] = round(float(np.std(runs)), 2) if runs else None
    out["speech_s"] = round(float(speech[idx[0]:idx[-1] + 1].sum() * 0.05), 2)
    if words:
        out["wpm_in_speech"] = round(words / out["speech_s"] * 60, 1)
    if ref:
        from resemblyzer import VoiceEncoder, preprocess_wav
        ve = VoiceEncoder("cpu", verbose=False)
        r, rsr = sf.read(str(ref), dtype="float32")
        if r.ndim > 1:
            r = r.mean(1)
        e1 = ve.embed_utterance(preprocess_wav(librosa.resample(x, orig_sr=sr, target_sr=16000), 16000))
        e2 = ve.embed_utterance(preprocess_wav(librosa.resample(r, orig_sr=rsr, target_sr=16000), 16000))
        out["similarity"] = round(float(np.dot(e1, e2)), 3)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+")
    ap.add_argument("--ref")
    ap.add_argument("--words", type=int)
    ap.add_argument("--json")
    a = ap.parse_args()
    res = {}
    for f in a.files:
        x, sr = load(f)
        res[Path(f).name] = measure(x, sr, a.words, a.ref)
        print(Path(f).name, json.dumps(res[Path(f).name]), flush=True)
    if a.json:
        Path(a.json).write_text(json.dumps(res, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
