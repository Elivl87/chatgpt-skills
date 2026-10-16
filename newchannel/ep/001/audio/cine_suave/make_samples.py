#!/usr/bin/env python3
"""EP001 · "Cine suave" samples for the Producer, built with the same code as the animatic sound builder
(engine/cine_suave.py via animatic/sound_block.py --sound cine_suave), keyed to the page events + timings_es.json.

    python3 make_samples.py [--events-a A.json] [--events-night C2.json] [--tmp DIR]

Without --events-*, the events are exported from the animatic page (art/render/render.mjs, one still, no frames).
Outputs (this folder):
    sample_hook.mp3         block A: hook + wordmark (0:00 -> first word of beat 06), character lines muted
    sample_night_hill.mp3   ~30 s from the first night-hill shot (beat 13)
    samples_measurements.json
Each is mastered on its own to -14 LUFS integrated, TP <= -1 dBTP (measured on the mp3).
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
NC = HERE.parents[3]
AUD = HERE.parent
sys.path.insert(0, str(NC / "engine"))
sys.path.insert(0, str(AUD / "music"))
import numpy as np  # noqa: E402
import cine_suave as CS  # noqa: E402
import sound as S  # noqa: E402
from compose_score import ensure_score  # noqa: E402

TIM, SEG = AUD / "timings_es.json", AUD / "segments_es.json"


def export_events(scene, tmp):
    out = Path(tmp) / f"events_{scene}.json"
    subprocess.run(["node", str(NC / "art/render/render.mjs"), "--page", "ep/001/animatic/index.html", "--scene",
                    f"ep001_{scene}", "--query", "out=854x480", "--events", str(out), "--still", "0", "--png",
                    str(Path(tmp) / f"_ev_{scene}.png")], check=True, cwd=str(NC), capture_output=True)
    return json.load(open(out))


def narration(tmp):
    p = AUD / "narration_es.wav"
    if p.exists():
        return p
    p = Path(tmp) / "narration_es.wav"
    if not p.exists():
        subprocess.run([sys.executable, "build_voice.py", "from-flac", str(p)], check=True, cwd=str(AUD))
    return p


def to_mp3(wav, mp3, mix, ceiling=-1.5):
    for c in (ceiling, ceiling - 0.5, ceiling - 1.0):
        S.master(mix, wav, target=-13.75, ceiling=c, fade_in=0.02, fade_out=1.2)
        subprocess.run([S.FFMPEG, "-v", "error", "-y", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "192k", str(mp3)],
                       check=True)
        m = S.measure_file(mp3)
        if m["TP"] <= -1.0:
            m["ceiling"] = c
            return m
    return m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--events-a")
    ap.add_argument("--events-night")
    ap.add_argument("--tmp", default=os.environ.get("TTD_TMP", "/tmp/claude-0/cine_suave_samples"))
    a = ap.parse_args()
    os.makedirs(a.tmp, exist_ok=True)
    os.environ.setdefault("TTD_TMP", a.tmp)
    nar = narration(a.tmp)
    evA = json.load(open(a.events_a)) if a.events_a else export_events("A", a.tmp)
    evN = json.load(open(a.events_night)) if a.events_night else export_events("C2", a.tmp)
    meas = {}
    # hook + wordmark
    rep = CS.build_block(evA, str(nar), None, str(TIM), str(SEG), ensure_score, master=False)
    mix = rep.pop("mix")
    meas["sample_hook.mp3"] = {"range_s": [evA["t0"], evA["t0"] + evA["duration"]], **to_mp3(
        Path(a.tmp) / "sample_hook.wav", HERE / "sample_hook.mp3", mix), "mix": rep}
    # night hill: ~30 s from the first night-hill shot
    rep = CS.build_block(evN, str(nar), None, str(TIM), str(SEG), ensure_score, master=False)
    mix = rep.pop("mix")
    t_night = next(x for x, y, s in rep["scenes"] if s == "night_hill")
    i0 = int(max(0.0, t_night - 1.0) * S.SR)
    i1 = min(len(mix), i0 + int(31.0 * S.SR))
    meas["sample_night_hill.mp3"] = {"range_s": [round(evN["t0"] + i0 / S.SR, 2), round(evN["t0"] + i1 / S.SR, 2)],
                                     **to_mp3(Path(a.tmp) / "sample_night.wav", HERE / "sample_night_hill.mp3",
                                              mix[i0:i1]), "mix": rep}
    json.dump(meas, open(HERE / "samples_measurements.json", "w"), indent=1, default=float)
    for k, v in meas.items():
        print(k, v["range_s"], "I", v["I"], "TP", v["TP"])


if __name__ == "__main__":
    main()
