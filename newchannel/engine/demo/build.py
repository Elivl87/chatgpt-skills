#!/usr/bin/env python3
"""Build the engine demo end to end:  python3 engine/demo/build.py [--skip-voice] [--preview-only]

1. narration (channel voice EN G) + timings, only if audio/timings.json is missing (needs the voice venv)
2. render demo.mp4 (1080p, crf 18) and demo_480p.mp4 from one pass of frames
3. QC: contact sheet, black/freeze/silence, loudness, pacing -> QC_demo.md
"""
import argparse
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ENGINE = HERE.parent
sys.path.insert(0, str(ENGINE))
sys.path.insert(0, str(HERE))
LINE = "One tap of the brakes. Twenty-two drivers. And a jam that nobody caused, rolling backwards."

ap = argparse.ArgumentParser()
ap.add_argument("--skip-voice", action="store_true")
ap.add_argument("--workers", type=int, default=2)
a = ap.parse_args()
if not (HERE / "audio" / "timings.json").exists() and not a.skip_voice:
    venv = os.environ.get("TTD_VENV", "/tmp/claude-0/ttdenv/venv")
    subprocess.run([f"{venv}/bin/python", str(ENGINE / "voice.py"), "--lang", "en", "--text", LINE,
                    "--out", str(HERE / "audio"), "--gap-sentence", "0.42"], check=True)

import render as R  # noqa: E402
import qc  # noqa: E402
import episode as E  # noqa: E402

ep = E.episode()
print(ep.tl.report())
R.render_episode(ep, HERE / "demo.mp4", also_preview=HERE / "demo_480p.mp4", workers=a.workers)
sting_land = ep.t_sting - E.STING_SKIP + 1.75
qc.run(HERE / "demo.mp4", HERE, timings=None, every=0.5, name="demo",
       declared={"freeze": [(ep.t_sting - E.STING_SKIP + 2.4, ep.duration)], "silence": [(sting_land, ep.duration)]},
       notes="Freeze/silence after the wordmark lands are by design (1 s of air after the sting, README section 6).\n\n"
             "Real shot list (timeline.py; style_bible's frame-difference detector misses cuts between two mostly-paper "
             "framings, so its cuts/min under-counts):\n\n```\n" + ep.tl.report() + "\n```")
