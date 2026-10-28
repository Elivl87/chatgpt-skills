#!/usr/bin/env python3
"""A/B for the Producer: Ryan v4 (cut from the approved narration) vs Ryan v5 (direction_v5.py, Bram-study rules).

Passages: hook (beats 01-04), comedic beat 13 («la razón ya se fue a cenar»), explanatory beat 17 («Ser paciente no es
ir lento…»). v5 rows are rendered with the same rule as the episode (WER 0 per sentence, highest-energy correct take) into
their own take cache (/tmp/claude-0/qwen_ep001_v5/takes; the v4 cache is never touched).

NO Bram audio is used here or in the MP3: Bram was only measured (voice/BRAM_ESTILO_ESTUDIO.md).

    TQDM_DISABLE=1 OMP_NUM_THREADS=1 nice -n 10 /tmp/claude-0/cbnat/venv/bin/python -I \
        ep/001/audio/qwen/ab_bram_estilo.py [render|assemble|mp3|all]
Server as in build_voice_qwen.py (port 8091). Output: voice/bram_estilo_AB.mp3 (48 kbps), qwen/v5/ab/ (wav + json, not in git).
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

os.environ["QWEN_DIRECTION"] = "direction_v5"
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build_voice_qwen as B  # noqa: E402
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402

cbn, SR = B.cbn, B.SR
NC = HERE.parents[3]
AB = HERE / "v5" / "ab"
MP3 = NC / "voice" / "bram_estilo_AB.mp3"
V4_WAV = HERE / "narration_es.wav"
V4_SEG = HERE / "segments_es.json"
PASSAGES = [("gancho", ("01", "02", "03", "04")), ("comico_b13", ("13",)), ("explicativo_b17", ("17",))]
TAIL_MAX = 0.6          # the last row's scripted pause (e.g. 5 s wordmark after the hook question) is capped in the A/B
LEVEL = -16.0


def passage_rows(beats):
    return [r for r in B.rows() if r["beat"] in beats]


def render():
    for _, beats in PASSAGES:
        rs = passage_rows(beats)
        B.render(B.TAKES, (rs[0]["idx"], rs[-1]["idx"]))


def assemble_v5(beats):
    rs = passage_rows(beats)
    parts, t, pieces = [], 0.0, []
    for i, r in enumerate(rs):
        last = i == len(rs) - 1
        if r["voiced"]:
            a, _ = sf.read(B.TMP / "takes" / f"row{r['idx']:03d}.wav", dtype="float32")
            a, f, w0, w1 = B.pace_fix(a, r["tts"], B.DV.pace_window(r))
            a = cbn.level(a, B.SEG_LUFS + B.GAIN[r["speaker"]])
            pre = r["pre"] if i else 0.0
            parts.append(np.zeros(int(round(pre * SR)), np.float32))
            t += pre
            pieces.append({"text": r["text"], "speaker": r["speaker"], "start": round(t, 4), "dur": round(len(a) / SR, 4),
                           "after": r["after"], "pace_fix": f, "wpm_take": w0, "wpm_final": w1, "tag": r["tag"]})
            parts.append(a.astype(np.float32))
            t += len(a) / SR
        else:
            parts.append(np.zeros(int(round(r["slot"] * SR)), np.float32))
            t += r["slot"]
        after = min(r["after"], TAIL_MAX) if last else r["after"]
        parts.append(np.zeros(int(round(after * SR)), np.float32))
        t += after
    return np.concatenate(parts), pieces


def chain(x, sr_in):
    """Same HPF + compression as the episode stem (build_voice_qwen.finish), 48 kHz, no loudness yet."""
    ch = "highpass=f=70:poles=2,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:knee=4"
    p = subprocess.run([cbn.FF, "-v", "error", "-f", "f32le", "-ar", str(sr_in), "-ac", "1", "-i", "-", "-af",
                        f"{ch},aresample=48000:resampler=soxr", "-f", "f32le", "-"],
                       input=x.astype(np.float32).tobytes(), capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).copy()


def loud(x, target=LEVEL, sr=48000):
    import pyloudnorm as pyln
    m = pyln.Meter(sr)
    g = target - m.integrated_loudness(x.astype(np.float64))
    y = x * 10 ** (g / 20)
    pk = np.abs(y).max()
    return (y / pk * 0.89 if pk > 0.89 else y).astype(np.float32)


def v4_cut(beats):
    segs = [s for s in json.loads(V4_SEG.read_text())["segments"] if s["beat"] in beats]
    t0 = segs[0]["start"] - 0.1
    t1 = segs[-1]["start"] + segs[-1]["dur"] + min(segs[-1]["after"], TAIL_MAX)
    x, s = sf.read(V4_WAV, dtype="float32", start=int(t0 * 48000), stop=int(t1 * 48000))
    return x, t0


def assemble():
    AB.mkdir(parents=True, exist_ok=True)
    track, segs, t, info = [], [], 0.0, {}
    gap = np.zeros(int(1.5 * 48000), np.float32)
    for name, beats in PASSAGES:
        x, pieces = assemble_v5(beats)
        y = loud(chain(x, SR))
        sf.write(AB / f"v5_{name}.wav", y, 48000, subtype="PCM_24")
        v4, v4_t0 = v4_cut(beats)
        v4 = loud(v4)
        sf.write(AB / f"v4_{name}.wav", v4, 48000, subtype="PCM_24")
        info[name] = {"v4_s": round(len(v4) / 48000, 2), "v5_s": round(len(y) / 48000, 2),
                      "v5_pace_fix": [p["pace_fix"] for p in pieces]}
        segs.append({"beat": name, "voiced": True, "speaker": "narrator",
                     "pieces": [dict(p, start=round(p["start"] + t, 4)) for p in pieces]})
        track += [y, gap]
        t += len(y) / 48000 + 1.5
    tr = np.concatenate(track)
    sf.write(AB / "passages_v5.wav", tr, 48000, subtype="PCM_24")
    # analysis manifest (same schema the study script reads: segments -> pieces with start/dur/text/after)
    man = [{"beat": s["beat"], "voiced": True, "speaker": p["speaker"], "pieces": [p]} for s in segs for p in s["pieces"]]
    (AB / "passages_v5_segments.json").write_text(json.dumps({"segments": man}, ensure_ascii=False, indent=1))
    (AB / "ab_info.json").write_text(json.dumps(info, ensure_ascii=False, indent=1))
    print(json.dumps(info, ensure_ascii=False))


def tone(n):
    t = np.arange(int(0.14 * 48000)) / 48000
    b = (0.25 * np.sin(2 * np.pi * 880 * t) * np.minimum(1, np.minimum(t, t[::-1]) / 0.01)).astype(np.float32)
    out = []
    for _ in range(n):
        out += [b, np.zeros(int(0.12 * 48000), np.float32)]
    return np.concatenate(out)


def mp3():
    sil = lambda s: np.zeros(int(s * 48000), np.float32)   # noqa: E731
    parts = []
    for name, _ in PASSAGES:
        v4, _ = sf.read(AB / f"v4_{name}.wav", dtype="float32")
        v5, _ = sf.read(AB / f"v5_{name}.wav", dtype="float32")
        parts += [tone(1), sil(0.35), v4, sil(1.0), tone(2), sil(0.35), v5, sil(1.4)]
    x = np.concatenate(parts)
    print("A/B length", round(len(x) / 48000, 1), "s")
    p = subprocess.run([cbn.FF, "-v", "error", "-y", "-f", "f32le", "-ar", "48000", "-ac", "1", "-i", "-", "-ar", "44100",
                        "-c:a", "libmp3lame", "-b:a", "48k", str(MP3)], input=x.tobytes(), check=True)
    print(MP3, round(MP3.stat().st_size / 1e6, 2), "MB")


if __name__ == "__main__":
    st = sys.argv[1] if len(sys.argv) > 1 else "all"
    if st in ("render", "all"):
        render()
    if st in ("assemble", "all"):
        assemble()
    if st in ("mp3", "all"):
        mp3()
