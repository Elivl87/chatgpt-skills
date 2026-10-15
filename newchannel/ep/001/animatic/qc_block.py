"""QC for an animatic block: engine/qc.py (stream checks, loudness, black / freeze / silence, SecondQuest style_bible +
pacing_qc on the block with its own word timings), a light contact sheet (1 frame/s, <= 400 KB) and the shot table
from the page's events (cuts/min, longest shot, every shot <= ~4 s).
    python3 qc_block.py block.mp4 events.json <animatic dir> <block> <WxH>
"""
import json
import os
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[2] / "engine"))
import qc  # noqa: E402

mp4, evp, outd, blk, size = sys.argv[1:6]
ev = json.load(open(evp))
W, H = map(int, size.split("x"))
outd = Path(outd)
qdir = outd / "qc"
qdir.mkdir(exist_ok=True)
# word timings of the block, block-relative
words = json.load(open(HERE.parent / "audio" / "timings_es.json"))
bw = [dict(w, start=round(w["start"] - ev["t0"], 3), end=round(w["end"] - ev["t0"], 3)) for w in words if ev["t0"] <= w["start"] < ev["t1"]]
tj = qdir / f"timings_block{blk}.json"
tj.write_text(json.dumps(bw, ensure_ascii=False))
declared = {"silence": [(a["t0"] - 0.3, a["t1"]) for a in ev["ambience"] if a["kind"] == "silence"]}
res = qc.run(mp4, qdir, timings=str(tj), every=1.0, name=f"block{blk}", expect=(W, H), declared=declared)
os.remove(qdir / f"contact_sheet_block{blk}.jpg")
# light contact sheet
small = outd / f"block{blk}_contact_small.jpg"
for q in (80, 70, 60, 50):
    qc.contact_sheet(mp4, small, every=1.0, cols=7, tile_w=232)
    subprocess.run(["python3", "-c", f"from PIL import Image; im=Image.open('{small}'); im.save('{small}', quality={q})"], check=True)
    if small.stat().st_size <= 400_000:
        break
# shot table
shots = ev["shots"]
durs = [s["end"] - s["start"] for s in shots]
cuts = len(shots) - 1
lines = ["| # | shot | start | end | dur (s) | label |", "|---|---|---|---|---|---|"]
for i, s in enumerate(shots):
    lines.append(f"| {i + 1} | {s['id']} | {s['start']:.2f} | {s['end']:.2f} | {s['end'] - s['start']:.2f}{' **>4**' if s['end'] - s['start'] > 4.05 else ''} | {s['label'] or ''} |")
summary = {"duration": ev["duration"], "shots": len(shots), "cuts": cuts, "cuts_per_min": round(cuts / ev["duration"] * 60, 1),
           "longest_shot": round(max(durs), 2), "longest_id": shots[durs.index(max(durs))]["id"], "avg_shot": round(sum(durs) / len(durs), 2),
           "size_mb": round(os.path.getsize(mp4) / 1e6, 2), "contact_kb": round(small.stat().st_size / 1e3)}
(qdir / f"shots_block{blk}.md").write_text("\n".join(lines) + "\n\n```\n" + json.dumps(summary, indent=1) + "\n```\n")
(qdir / f"summary_block{blk}.json").write_text(json.dumps(summary, indent=1))
print(json.dumps(summary, indent=1))
