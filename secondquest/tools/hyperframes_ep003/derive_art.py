#!/usr/bin/env python3
"""Derived copies of the EP003 new art v1 (docs/art_orders/ep003/new_art_v1/): the generated originals are NEVER
edited (channel rule); grades and crops are written as NEW files in new_art_v1/derived/. Deterministic, idempotent.

  python3 derive_art.py            # writes only the missing files
  python3 derive_art.py --force    # rewrites them

- lake_dusk.png         the plate as is (RGB -> PNG copy, so every block stages one name)
- lake_bluehour.png     the plate pulled toward blue hour (block F l39: "fishing trips end too")
- lake_night.png        the night grade (block G): sky and water cool and dark, the low sun reads as a pale moon,
                        its glitter path as moonlight
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SRC = ROOT / 'docs/art_orders/ep003/new_art_v1'
OUT = SRC / 'derived'


def lum(a):
    return a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114


def grade(a, sat, tint, gamma, lift, hi_keep, hi_tint):
    """a float 0..1 RGB. Desaturate, tint, gamma; the brightest pixels (the sun, its path) keep a pale highlight."""
    L = lum(a)[..., None]
    g = L + (a - L) * sat
    g = np.clip(g * np.array(tint), 0, 1) ** gamma + np.array(lift)
    hi = np.clip((L - hi_keep) / (1 - hi_keep), 0, 1) ** 1.5
    g = g * (1 - hi) + np.array(hi_tint) * L * hi
    return np.clip(g, 0, 1)


def main():
    force = '--force' in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    plate = Image.open(SRC / '01_lake_dusk_plate.png').convert('RGB')
    a = np.asarray(plate).astype(np.float32) / 255
    jobs = {
        'lake_dusk.png': lambda: a,
        'lake_bluehour.png': lambda: grade(a, .55, (.62, .70, 1.0), 1.12, (.015, .02, .05), .80, (1.0, .86, .72)),
        'lake_night.png': lambda: grade(a, .30, (.30, .40, .78), 1.45, (.008, .012, .035), .78, (.93, .96, 1.0)),
    }
    for name, f in jobs.items():
        p = OUT / name
        if p.exists() and not force:
            continue
        im = Image.fromarray((f() * 255 + .5).astype(np.uint8))
        if name == 'lake_night.png':                      # a soft bloom round the moon so it glows, not clips
            m = Image.fromarray((np.clip((lum(np.asarray(im) / 255) - .55) / .45, 0, 1) * 255).astype(np.uint8))
            glow = Image.new('RGB', im.size, (205, 220, 255))
            im = Image.composite(glow, im, m.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * .45)))
        im.save(p, optimize=True)
        print('wrote', p.relative_to(ROOT))


if __name__ == '__main__':
    main()
