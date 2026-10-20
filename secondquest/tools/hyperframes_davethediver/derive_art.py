#!/usr/bin/env python3
"""Derived copies of Dave the Diver art (the originals are never edited; public/art is archived, not versioned).
p01_quest_swim_A had a black suit: the Producer asked for it in the blue of the other dive poses (2026-10-20). Its grey
suit pixels are mapped, by luminance rank, onto the navy ramp sampled from p02_quest_swim_B. Only writes missing files."""
from pathlib import Path
import numpy as np
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
PX = ROOT / 'public/art/davethediver/pixel'


def lum(p):
    return 0.299 * p[..., 0] + 0.587 * p[..., 1] + 0.114 * p[..., 2]


def blue_suit(src, ref, out):
    if out.exists():
        return
    a = np.array(Image.open(src).convert('RGBA')).astype(int)
    b = np.array(Image.open(ref).convert('RGBA')).astype(int)
    bm = (b[..., 3] > 0) & (b[..., 2] > b[..., 0] + 20) & (b[..., 2] > b[..., 1] + 10) & (lum(b) < 140)
    bp = b[bm][:, :3]; bp = bp[np.argsort(lum(bp))]
    am = (a[..., 3] > 0) & (np.abs(a[..., 0] - a[..., 1]) < 14) & (np.abs(a[..., 1] - a[..., 2]) < 14) & (lum(a) >= 22) & (lum(a) <= 105)
    al = lum(a)[am]; q = np.searchsorted(np.sort(al), al) / max(len(al) - 1, 1)
    a[am, :3] = bp[np.clip((q * (len(bp) - 1)).astype(int), 0, len(bp) - 1)]
    out.parent.mkdir(exist_ok=True)
    Image.fromarray(a.astype(np.uint8)).save(out)
    print('derived', out.relative_to(ROOT))


if __name__ == '__main__':
    blue_suit(PX / 'p01_quest_swim_A.png', PX / 'p02_quest_swim_B.png', PX / 'derived/p01_quest_swim_A_blue.png')
