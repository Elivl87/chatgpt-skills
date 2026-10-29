#!/usr/bin/env python3
"""collar_face_check.py OUTDIR [who ...] -- Guardian check (2026-10-29): no garment reaches Eli's / Mila's mouth.

For each outfit (outfit_lab who=eli|mila, n=1..6) and expression (happy, surprised, furious; the arms-up cell is always
'laugh'), renders the lab twice: normally and with &headover=1 (head drawn over the clothes). Every pixel that differs is
a garment (collar, hood, turtleneck, lapel, or the torso itself) lying on the head. The mouth is found in the headover
render (lips / mouth interior / tongue: R > G + 30 and B > G + 5). Per view cell the distance between the mouth
and the nearest garment-on-head pixel (2D distance; -1 = it covers the mouth) must be >= GAP px (6 px at u = 820,
~0.007 height units). Outfit 1 (the current outfits, kit reference) is reported but not gated; an outfit cell where the
reference itself is under GAP must be no worse than the reference.
Writes OUTDIR/collar_face.json; prints one line per outfit; exit 1 on any failure (outfits 2-6).
"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
whos = [a for a in sys.argv[2:] if a in ("eli", "mila")] or ["eli", "mila"]
EXPRS, GAP = ["happy", "surprised", "furious"], 6
CELLS = {"front": (20, 325), "3/4": (330, 630), "profile": (630, 930), "sitting": (1240, 1560), "arms up": (1560, 1900)}


def render(q, png):
    if not os.path.exists(png):
        subprocess.run(["node", os.path.join(HERE, "render.mjs"), "--scene", "outfit_lab", "--still", "0", "--png", png, "--query", q],
                       check=True, stdout=subprocess.DEVNULL)
    return png


jobs = [(w, n, e) for w in whos for n in range(1, 7) for e in EXPRS]
def run(j):
    w, n, e = j; base = f"who={w}&n={n}&expr={e}"
    return render(base, f"{out}/{w}{n}_{e}.png"), render(base + "&headover=1", f"{out}/{w}{n}_{e}_ho.png")
with ThreadPoolExecutor(6) as ex:
    files = dict(zip(jobs, ex.map(run, jobs)))

res, bad = {}, 0
for (w, n, e), (pa, pb) in files.items():
    a = np.asarray(Image.open(pa).convert("RGB")).astype(int); b = np.asarray(Image.open(pb).convert("RGB")).astype(int)
    diff = np.abs(a - b).max(axis=2) > 24
    R, G, B = b[..., 0], b[..., 1], b[..., 2]; mouth = (R > G + 30) & (B > G + 5)
    for cell, (x0, x1) in CELLS.items():
        m = mouth[:760, x0:x1]; ys, xs = np.nonzero(m)
        if len(ys) < 15: res.setdefault(f"{w}{n}", {})[f"{e}/{cell}"] = "no mouth"; continue
        R0 = 40; yA, yB, xA, xB = max(0, ys.min() - R0), ys.max() + R0, max(0, xs.min() - R0), xs.max() + R0
        dy, dx = np.nonzero(diff[yA:yB, x0:x1][:, xA:xB]); dy = dy + yA; dx = dx + xA
        if len(dy):   # 2D: the nearest garment-on-head pixel to any mouth pixel (px); negative = it covers the mouth
            dd = np.sqrt((ys[:, None] - dy[None, :]) ** 2 + (xs[:, None] - dx[None, :]) ** 2).min()
            k = dy < 760; cover = bool(m[dy[k], dx[k]].any())
            gap = -1 if cover else int(dd)
        else: gap = 999
        res.setdefault(f"{w}{n}", {})[f"{e}/{cell}"] = gap
for (w, n, e) in files:
    if n == 1: continue
    for cell in CELLS:
        g, r = res[f"{w}{n}"].get(f"{e}/{cell}"), res[f"{w}1"].get(f"{e}/{cell}")
        if isinstance(g, int) and g < GAP and not (isinstance(r, int) and r < GAP and g >= r): bad += 1; res[f"{w}{n}"][f"{e}/{cell}"] = f"FAIL {g}"
        elif isinstance(g, int) and g < GAP: res[f"{w}{n}"][f"{e}/{cell}"] = f"ref {g}"   # as the kit reference (outfit 1)
for k, v in res.items():
    gaps = [int(str(g).split()[-1]) for g in v.values() if g != "no mouth"]
    worst = min(gaps) if gaps else None
    fails = [f"{c}:{g}" for c, g in v.items() if str(g).startswith("FAIL") or (k.endswith("1") and isinstance(g, int) and g < GAP)]
    print(f"{k}: min gap {worst}px  {'PASS' if not fails else 'FAIL ' + ' '.join(fails)}{'  (reference)' if k.endswith('1') else ''}")
json.dump(res, open(f"{out}/collar_face.json", "w"), indent=1)
sys.exit(1 if bad else 0)
