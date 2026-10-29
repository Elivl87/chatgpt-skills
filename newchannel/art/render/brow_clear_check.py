#!/usr/bin/env python3
"""brow_clear_check.py OUTDIR [options...] -- Guardian check (2026-10-29): Eli's brows never touch the headwear.

For each headwear option (eli_hat_lab n=1..7), expression (happy / surprised / furious), hat hit (0 / 1) and view
(front, 3/4, profile, beside Mila), renders the lab twice with the brows painted pure red (&probe=1): once with the
headwear and once without (&nohat=1). The ring 2-5 px around the red brows must show the same skin in both renders (ink outlines and rim light, which follow the silhouette, are ignored): any
pixel the headwear (hat, brim, band, lens, hair) changes inside that ring = the brows touch it (FAIL).
Writes OUTDIR/brow_clear.json and prints one line per option. Exit 1 if any option fails (except the listed --ref ones).
"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
opts = [int(a) for a in sys.argv[2:] if a.isdigit()] or list(range(1, 8))
EXPRS, HITS, VIEWS = ["happy", "surprised", "furious"], [0, 1], [0, 1, 2, 4]


def render(q, png):
    if not os.path.exists(png):
        subprocess.run(["node", os.path.join(HERE, "render.mjs"), "--scene", "eli_hat_lab", "--still", "1", "--png", png, "--query", q],
                       check=True, stdout=subprocess.DEVNULL)
    return png


jobs = []
for n in opts:
    for e in EXPRS:
        for h in HITS:
            for v in VIEWS:
                base = f"n={n}&expr={e}&hit={h}&solo={v}&probe=1"
                jobs.append((n, e, h, v, (base, f"{out}/n{n}_{e}_h{h}_v{v}.png"), (base + "&nohat=1", f"{out}/n{n}_{e}_h{h}_v{v}_x.png")))
with ThreadPoolExecutor(8) as ex:
    list(ex.map(lambda j: (render(*j[4]), render(*j[5])), jobs))

res, worst = {}, {}
for n, e, h, v, (_, pa), (_, pb) in jobs:
    a = np.asarray(Image.open(pa).convert("RGB")).astype(int); b = np.asarray(Image.open(pb).convert("RGB")).astype(int)
    if v == 4: a, b = a[:, :960], b[:, :960]                       # beside Mila: Eli only
    red = (b[..., 0] > 170) & (b[..., 1] < 90) & (b[..., 2] < 90)
    ys, xs = np.where(red); y0, x0 = max(0, ys.min() - 20), max(0, xs.min() - 20)   # work on the brow box only
    a, b, red = a[y0:ys.max() + 20, x0:xs.max() + 20], b[y0:ys.max() + 20, x0:xs.max() + 20], red[y0:ys.max() + 20, x0:xs.max() + 20]
    m = Image.fromarray((red * 255).astype(np.uint8))
    outer = np.asarray(m.filter(ImageFilter.MaxFilter(11))) > 0; inner = np.asarray(m.filter(ImageFilter.MaxFilter(5))) > 0
    ring = outer & ~inner
    skin = (b[..., 0] > 140) & (b[..., 0] - b[..., 2] > 40) & ~red     # forehead skin in the no-hat render
    skin = np.asarray(Image.fromarray((skin * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(9))) > 0   # 4 px off the head outline / rim light
    diff = (np.abs(a - b).sum(2) > 60) & ring & skin
    k = int(diff.sum()); res[f"n{n}_{e}_h{h}_v{v}"] = {"touch_px": k, "brow_px": int(red.sum())}
    worst.setdefault(n, []).append((k, e, h, v))
fails = []
for n in opts:
    bad = [w for w in worst[n] if w[0] > 4]
    print(f"option {n}: {'FAIL' if bad else 'PASS'}" + (f"  {len(bad)} cases, worst {max(bad)}" if bad else ""))
    if bad: fails.append(n)
json.dump(res, open(f"{out}/brow_clear.json", "w"), indent=1)
sys.exit(1 if fails else 0)
