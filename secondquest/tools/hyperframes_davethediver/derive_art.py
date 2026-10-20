#!/usr/bin/env python3
"""Derived copies of Dave the Diver art (the originals are never edited; public/art is archived, not versioned).
p01_quest_swim_A had a black suit: the Producer asked for it in the blue of the other dive poses (2026-10-20). Only its suit
palette colour is swapped for p02_quest_swim_B's suit navy (gloves, mask, regulator keep their colours). Only writes missing files."""
from pathlib import Path
import numpy as np
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
PX = ROOT / 'public/art/davethediver/pixel'


def blue_suit(src, ref, out, zones=()):
    """the suit is ONE palette colour in the source sprite: swap exactly that colour for the reference's dominant suit
    navy; gloves, regulator, straps, fin pockets and mask (other palette entries) stay untouched"""
    a = np.array(Image.open(src).convert('RGBA'))
    b = np.array(Image.open(ref).convert('RGBA')).astype(int)
    bm = (b[..., 3] > 0) & (b[..., 2] > b[..., 0] + 20)
    v, c = np.unique(b[bm][:, :3], axis=0, return_counts=True)
    navy = v[np.argmax(c)]
    rgb = a[..., :3].astype(int); vs, cs = np.unique(rgb[a[..., 3] > 0].reshape(-1, 3), axis=0, return_counts=True)
    grey = [x for x, n in sorted(zip(map(tuple, vs), cs), key=lambda t: -t[1]) if abs(x[0] - x[1]) < 14 and abs(x[1] - x[2]) < 14 and 40 < sum(x) / 3 < 110][0]
    m = (a[..., 3] > 0) & np.all(rgb == grey, axis=-1)
    a[m, :3] = navy
    # gloves and fin-foot pockets share the suit colour in this sprite: the reference draws them dark brown
    brown = (60, 47, 0)
    for x0, y0, x1, y1 in zones:
        z = np.zeros(m.shape, bool); z[y0:y1, x0:x1] = True
        a[m & z, :3] = brown
    out.parent.mkdir(exist_ok=True)
    Image.fromarray(a).save(out)
    print('derived', out.relative_to(ROOT), 'suit', grey, '->', tuple(navy), int(m.sum()), 'px')


if __name__ == '__main__':
    (PX / 'derived/p01_quest_swim_A_blue.png').unlink(missing_ok=True) if '--force' in __import__('sys').argv else None
    blue_suit(PX / 'p01_quest_swim_A.png', PX / 'p02_quest_swim_B.png', PX / 'derived/p01_quest_swim_A_blue.png',
              zones=[(206, 50, 240, 80), (36, 34, 58, 52), (44, 98, 66, 118)])   # glove, two fin pockets (px)
