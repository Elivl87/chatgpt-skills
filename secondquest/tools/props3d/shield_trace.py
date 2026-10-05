#!/usr/bin/env python3
"""Trace the hero shield from the Producer's reference into layered polygons for the 3D model (free, local).

  python3 tools/props3d/shield_trace.py      # -> tools/props3d/shield_layers.json + docs/ep002/shield_trace_check.png

Source: docs/ep002/source/shield_reference_producer.jpg (Producer, 2026-10-05: "así debería verse en la espalda de Quest").
The shield is symmetric about its vertical axis; the reference has the sword crossing behind it (top right, bottom left)
and painted shading on the right, so only the LEFT half is traced and mirrored. Layers, back to front:
  body    the whole silhouette (silver)            rim     silhouette minus the field (raised silver frame)
  field   the blue face                            horns   the two silver horn shapes on the field
  tri     the three gold triangles                 bird    the red bird crest (also the royal crest, #16)
Small details measured by hand on the reference (top and corner triangles, rivets) are added in scene.ts.
Coordinates are reference pixels relative to the axis (x right, y up), centre of the silhouette's bounding box.
"""
import json
from pathlib import Path
import cv2
import numpy as np
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'docs/ep002/source/shield_reference_producer.jpg'
OUT = Path(__file__).resolve().parent / 'shield_layers.json'
AXIS = 360                     # x of the top and bottom points (232 and 970 in reference pixels)


def sym(m):
    """Left half mirrored onto the right."""
    out = np.zeros_like(m)
    out[:, :AXIS + 1] = m[:, :AXIS + 1]
    w = min(AXIS, m.shape[1] - AXIS - 1)
    out[:, AXIS + 1:AXIS + 1 + w] = m[:, AXIS - w:AXIS][:, ::-1]
    return out


def clean(m, close=2, open_=1, min_area=60):
    k = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
    m = m.astype(np.uint8)
    if close: m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k(close))
    if open_: m = cv2.morphologyEx(m, cv2.MORPH_OPEN, k(open_))
    lab, n = ndimage.label(m)
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= min_area])
    return keep


def polys(m, cx, cy, eps=0.6, up=4):
    """Outer contours with their holes, in centred y-up coordinates. The mask is blurred and traced at 4x so the
    edges come out smooth (no pixel staircase in the 3D outlines)."""
    f = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.6)
    f = cv2.resize(f, None, fx=up, fy=up, interpolation=cv2.INTER_CUBIC)
    cs, hier = cv2.findContours((f > .5).astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    cs = [c.astype(np.float32) / up for c in cs]
    out = []
    if hier is None:
        return out
    conv = lambda c: [[round(float(x - cx), 2), round(float(cy - y), 2)] for x, y in cv2.approxPolyDP(c, eps, True)[:, 0]]
    for i, c in enumerate(cs):
        if hier[0][i][3] != -1 or cv2.contourArea(c) < 40:
            continue
        holes, j = [], hier[0][i][2]
        while j != -1:
            if cv2.contourArea(cs[j]) >= 25:
                holes.append(conv(cs[j]))
            j = hier[0][j][0]
        out.append({'outer': conv(c), 'holes': holes})
    return out


def main():
    im = cv2.imread(str(SRC))
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV).astype(int)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    blue = (H >= 100) & (H <= 130) & (S > 120) & (V > 60)
    red = ((H <= 8) | (H >= 170)) & (S > 110) & (V > 60)
    gold = (H >= 18) & (H <= 35) & (S > 90) & (V > 100)
    grey = (S < 45) & (V < 248)                       # silver, its shading and the ink lines
    # silhouette: the silver ring and everything it encloses; the blade is saturated blue, so it stays out
    ring = clean(grey, 1, 0, 20000)
    body = sym(clean(ndimage.binary_fill_holes(ring), 0, 2, 20000))
    ys, xs = np.nonzero(body)
    cx, cy = AXIS, (ys.min() + ys.max()) / 2
    # field = the region enclosed by the rim: blue plus whatever sits on it (horns, triangles, bird)
    field = clean(ndimage.binary_fill_holes(clean(blue & body, 2, 1, 4000)), 1, 1, 4000)
    field = sym(field)
    rim = body & ~field
    horns = sym(clean(field & grey & ~ndimage.binary_dilation(red | gold, iterations=2), 2, 1, 400))
    horns = ndimage.binary_fill_holes(horns)
    tri = sym(clean(gold & field, 1, 0, 150))
    bird = sym(clean(red & field, 1, 0, 30))
    layers = {k: polys(v, cx, cy) for k, v in
              {'body': body, 'rim': rim, 'field': field, 'horns': horns, 'tri': tri, 'bird': bird}.items()}
    layers['meta'] = {'width': int(xs.max() - xs.min()), 'height': int(ys.max() - ys.min()), 'cx': cx, 'cy': cy,
                      'source': str(SRC.relative_to(ROOT))}
    OUT.write_text(json.dumps(layers))
    vis = np.full(im.shape, 255, np.uint8)
    for m, c in ((body, (190, 190, 190)), (field, (200, 60, 40)), (horns, (225, 225, 225)), (tri, (40, 210, 235)), (bird, (40, 40, 210))):
        vis[m] = c
    cv2.imwrite(str(ROOT / 'docs/ep002/shield_trace_check.png'), np.concatenate([im, vis], axis=1))
    print(OUT.relative_to(ROOT), {k: len(v) for k, v in layers.items() if k != 'meta'}, layers['meta'])


if __name__ == '__main__':
    main()
