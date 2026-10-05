#!/usr/bin/env python3
"""The royal crest painted on the temple's banners (#13), as an engine overlay (free; the plate is not modified).

  python3 tools/fx/crest_banners.py   # -> public/art/ep002/overlays/13_temple_crest.png + docs/ep002/13_temple_crest_preview.jpg

The crest (red bird, gold triangles, ink outlines) comes from the Producer's shield reference
(tools/props3d/shield_layers.json). On each banner it takes the cloth's own light and shade (the plate's luminance
there), so it reads as woven into the fabric under the same light shafts.
"""
import json
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
PLATE = ROOT / 'docs/art_orders/ep002_final/13_temple_pedestal.png'
INK = (34, 24, 22)
# banner centre x, crest centre y, crest width (plate pixels), measured on the plate: the navy cloth above the chevrons
BANNERS = [(220, 175, 100), (535, 215, 116), (2155, 215, 116), (2457, 175, 100)]


def crest_rgba(width):
    L = json.loads((ROOT / 'tools/props3d/shield_layers.json').read_text())
    pts = np.float32([p for k in ('bird', 'tri') for poly in L[k] for p in poly['outer']])
    x0, y0 = pts[:, 0].min(), pts[:, 1].min(); x1, y1 = pts[:, 0].max(), pts[:, 1].max()
    ss = 4; k = width * ss / (x1 - x0); pad = 6 * ss
    W, H = int((x1 - x0) * k) + 2 * pad, int((y1 - y0) * k) + 2 * pad
    img = np.zeros((H, W, 4), np.uint8)
    tf = lambda poly: np.int32([[(x - x0) * k + pad, (y1 - y) * k + pad] for x, y in poly])
    for key, col in (('tri', (40, 196, 236)), ('bird', (44, 32, 200))):   # BGR: gold, red
        for poly in L[key]:
            cv2.fillPoly(img, [tf(poly['outer'])], (*col, 255))
            for h in poly['holes']:
                cv2.fillPoly(img, [tf(h)], (0, 0, 0, 0))
            cv2.polylines(img, [tf(poly['outer'])], True, (*INK[::-1], 255), max(2, int(1.2 * ss)), cv2.LINE_AA)
    return cv2.resize(img, (W // ss, H // ss), interpolation=cv2.INTER_AREA)


def main():
    plate = cv2.imread(str(PLATE))
    lum = cv2.cvtColor(plate, cv2.COLOR_BGR2GRAY).astype(np.float32)
    over = np.zeros(plate.shape[:2] + (4,), np.float32)
    for cx, cy, w in BANNERS:
        c = crest_rgba(w).astype(np.float32)
        h, ww = c.shape[:2]
        x, y = int(cx - ww / 2), int(cy - h / 2)
        shade = lum[y:y + h, x:x + ww] / max(1.0, np.median(lum[y:y + h, x:x + ww]))
        c[..., :3] *= np.clip(shade, .55, 1.6)[..., None] * .9          # the cloth's light and folds
        a = c[..., 3:] / 255.0 * .92                                    # woven, not printed on top
        region = over[y:y + h, x:x + ww]
        region[..., :3] = c[..., :3] * a + region[..., :3] * (1 - a)
        region[..., 3] = np.maximum(region[..., 3], a[..., 0] * 255)
    out = ROOT / 'public/art/ep002/overlays/13_temple_crest.png'
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), np.clip(over, 0, 255).astype(np.uint8))
    a = over[..., 3:] / 255.0
    comp = (over[..., :3] * a + plate * (1 - a)).astype(np.uint8)
    crop = lambda im: im[0:620, :]
    cv2.imwrite(str(ROOT / 'docs/ep002/13_temple_crest_preview.jpg'), cv2.resize(np.concatenate([crop(plate), crop(comp)], 0), None, fx=.5, fy=.5), [cv2.IMWRITE_JPEG_QUALITY, 90])
    print(out.relative_to(ROOT), 'docs/ep002/13_temple_crest_preview.jpg')


if __name__ == '__main__':
    main()
