#!/usr/bin/env python3
"""extras_clear_check.py OUTDIR [keys...] [--outfit=3bB] -- Guardian check (2026-10-29): the expression extras (surprise
ticks, anger mark, laugh lines) never touch Eli's headwear / hair.

For each round-2 headwear key (eli_hat2_lab k=1a..6), expression (surprised / furious / laugh / happy), hat hit (0 / 1) and
view (front, 3/4, profile, back), renders the lab alone (&solo=) twice: normal and with &noextras=1. Pixels that differ =
the extras. Any extra pixel within GAP px of a non-background pixel of the character render = touching (FAIL).
Writes OUTDIR/extras_clear.json; exit 1 on any FAIL.
"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
OUTFIT = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--outfit=")), "3bB")
keys = [a for a in sys.argv[2:] if not a.startswith("--")] or ["1a", "1b", "1c", "2", "3", "4", "5", "6"]
EXPRS, HITS, VIEWS, GAP = ["surprised", "furious", "laugh", "happy"], [0, 1], [0, 1, 2, 3], 6
BG = np.array([0xec, 0xe3, 0xd3])


def render(q, png):
    if not os.path.exists(png):
        subprocess.run(["node", os.path.join(HERE, "render.mjs"), "--scene", "eli_hat2_lab", "--still", "1", "--png", png, "--query", q],
                       check=True, stdout=subprocess.DEVNULL)
    return png


jobs = []
for k in keys:
    for e in EXPRS:
        for h in HITS:
            for v in VIEWS:
                q = f"k={k}&outfit={OUTFIT}&expr={e}&hit={h}&solo={v}"; f = f"{out}/{k}{OUTFIT}_{e}_h{h}_v{v}"
                jobs.append((k, e, h, v, (q, f + ".png"), (q + "&noextras=1", f + "_x.png")))
with ThreadPoolExecutor(8) as ex:
    list(ex.map(lambda j: (render(*j[4]), render(*j[5])), jobs))

res, bad = {}, {}
for k, e, h, v, (_, pa), (_, pb) in jobs:
    a = np.asarray(Image.open(pa).convert("RGB")).astype(int)[:560]; b = np.asarray(Image.open(pb).convert("RGB")).astype(int)[:560]
    extra = np.abs(a - b).sum(2) > 60
    body = np.abs(b - BG).sum(2) > 40
    near = np.asarray(Image.fromarray((body * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * GAP + 1))) > 0
    t = int((extra & near).sum()); res[f"{k}_{e}_h{h}_v{v}"] = {"touch_px": t, "extra_px": int(extra.sum())}
    if t > 3: bad.setdefault(k, []).append((t, e, h, v))
for k in keys:
    b = bad.get(k, [])
    print(f"option {k}: {'FAIL' if b else 'PASS'}" + (f"  {len(b)} cases, worst {max(b)}" if b else ""))
json.dump(res, open(f"{out}/extras_clear.json", "w"), indent=1)
sys.exit(1 if bad else 0)
