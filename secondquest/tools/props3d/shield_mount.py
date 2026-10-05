#!/usr/bin/env python3
"""Lay the 3D hero shield over the shield adult Quest already wears in generated art (engine layer, free).

  python3 tools/props3d/shield_mount.py          # every target below

Producer, 2026-10-05: "así debería verse en la espalda de Quest ... montarlo sobre Quest donde tiene el escudo".
The generated art is never modified: each target gets a separate transparent overlay with the art's own canvas size
(public/art/ep002/props3d/shield_on_<name>.png) that the engine composites on top, plus a preview for the Producer.
The shield is rendered at its final pixel size (so its ink lines match the art), fitted with a similarity transform
(rotation + one scale, so its proportions stay faithful) to four landmarks of the old shield, scaled until it covers
the old one completely, warmed slightly to the art's palette and given a soft contact shadow.
"""
import importlib.util, json, sys
from pathlib import Path
import cv2
import numpy as np
from scipy import ndimage

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
spec = importlib.util.spec_from_file_location('r3d', HERE / 'render.py'); R = importlib.util.module_from_spec(spec); spec.loader.exec_module(R)

# our shield's landmarks in reference pixels: peak, top-left corner, top-right corner, bottom point
REF = np.float32([[360, 232], [60, 397], [660, 397], [360, 970]])
TARGETS = {   # name: (art, the old shield's landmarks in the same order measured on the art, BGR light tint)
    '04_adult_back': ('docs/art_orders/quest/ep002_costume/04_adult_back_gear.png', [[700, 464], [484, 600], [894, 636], [676, 1096]], (0.93, 0.97, 1.02)),
    '05b_horse_back': ('docs/art_orders/quest/ep002_costume/05b_adult_horse_back_chestnut.png', [[920, 334], [764, 452], [1070, 462], [912, 772]], (0.93, 0.97, 1.02)),
    # golden hour, the sun ahead of them: the shield's face is in their shadow, warm and a little darker
    '17_18_outcrop': ('docs/art_orders/ep002_final/17_18_outcrop_vista.png', [[1030, 555], [910, 630], [1160, 640], [1028, 880]], (0.70, 0.80, 0.95)),
}


def old_mask(art, land):
    """The old shield: the blue face around the landmarks (a box, so a blue sky never counts), plus its silver rim."""
    hsv = cv2.cvtColor(art[..., :3], cv2.COLOR_BGR2HSV).astype(int)
    roi = np.zeros(art.shape[:2], bool)
    x0, y0 = land.min(axis=0).astype(int); x1, y1 = land.max(axis=0).astype(int)
    roi[y0:y1, x0:x1] = True
    blue = (hsv[..., 0] >= 100) & (hsv[..., 0] <= 130) & (hsv[..., 1] > 80) & (art[..., 3] > 200) & roi
    lab, n = ndimage.label(blue)
    b = lab == (np.argmax(ndimage.sum(blue, lab, range(1, n + 1))) + 1)
    rim = max(6, int(round(0.06 * (y1 - y0))))
    return ndimage.binary_dilation(ndimage.binary_fill_holes(b), iterations=rim) & (art[..., 3] > 200)


def old_silhouette(art, land):
    """The old shield's full silhouette, out to its outer ink line: the convex hull of its blue face and the silver
    rim touching it (both colours that the tunic, hair and sky do not have near it), grown by the ink width."""
    hsv = cv2.cvtColor(art[..., :3], cv2.COLOR_BGR2HSV).astype(int)
    x0, y0 = land.min(axis=0).astype(int); x1, y1 = land.max(axis=0).astype(int); h = y1 - y0
    roi = np.zeros(art.shape[:2], bool); roi[max(0, y0 - h // 6):y1 + h // 6, max(0, x0 - h // 6):x1 + h // 6] = True
    blue = (hsv[..., 0] >= 100) & (hsv[..., 0] <= 130) & (hsv[..., 1] > 80) & roi
    lab, n = ndimage.label(blue)
    b = ndimage.binary_fill_holes(lab == (np.argmax(ndimage.sum(blue, lab, range(1, n + 1))) + 1))
    silver = (hsv[..., 1] < 60) & (hsv[..., 2] > 120) & roi & (ndimage.distance_transform_edt(~b) < h * .12)
    lab, n = ndimage.label(silver)
    touch = np.unique(lab[ndimage.binary_dilation(b, iterations=int(h * .02) + 3) & silver])
    rim = np.isin(lab, touch[touch > 0])
    pts = np.argwhere(b | rim)[:, ::-1].astype(np.int32)
    hull = np.zeros(art.shape[:2], np.uint8)
    cv2.fillConvexPoly(hull, cv2.convexHull(pts), 1)
    ink = max(3, int(round(h * .012)))
    return cv2.dilate(hull, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * ink + 1, 2 * ink + 1))) > 0


def shield_px(height):
    """Front render whose shield is `height` px tall, with ink lines as thick as the art's."""
    layers = json.loads((HERE / 'shield_layers.json').read_text())
    side = int(height / 0.84) + 8                                   # the shield fills 84% of the frame at this camera
    img = R.render({'props': ['shield'], 'shield': layers, 'light': 'neutral',
                    'shots': [{'camera': R.orbit(0, 0, 2600, [0, 0, 0]), 'target': [0, 0, 0], 'fov': 20, 'cart': None}]},
                   side, side, line=4.0)[0]
    ys, xs = np.nonzero(img[..., 3] > 8)
    # map the reference landmarks into this render (the shield's bbox = the reference silhouette's bbox)
    sx = (xs.max() - xs.min()) / 602.0; sy = (ys.max() - ys.min()) / 743.0
    pts = np.float32([[xs.min() + (x - 59) * sx, ys.min() + (y - 230) * sy] for x, y in REF])
    return img, pts


def mount(name, art_path, land, tint):
    art = cv2.imread(str(ROOT / art_path), cv2.IMREAD_UNCHANGED)
    if art.shape[2] == 3:                                            # a full illustration: opaque everywhere
        art = np.dstack([art, np.full(art.shape[:2], 255, np.uint8)])
    land = np.float32(land)
    old = old_mask(art, land)
    h_target = np.linalg.norm(land[3] - land[0])
    img, pts = shield_px(h_target * 1.12)                            # one render near the final size
    M0, _ = cv2.estimateAffinePartial2D(pts, land)                  # rotation + uniform scale + shift
    c = land.mean(axis=0)
    for grow in np.arange(1.0, 1.45, 0.01):                          # grow about the centre until the old one is hidden
        M = M0.copy(); M[:, :2] *= grow
        M[:, 2] = c - M[:, :2] @ pts.mean(axis=0)
        warped = cv2.warpAffine(img, M, (art.shape[1], art.shape[0]), flags=cv2.INTER_AREA, borderValue=(0, 0, 0, 0))
        left = (old & ~(warped[..., 3] > 200)).sum()
        if left < 40:
            break
    print(name, f'grow {grow:.2f}', f'old shield pixels left uncovered: {left}')
    # warm it a touch towards the art's palette, and a soft contact shadow on the tunic
    w = warped.astype(np.float32)
    w[..., :3] *= np.float32(tint)                                   # BGR: the art's light on it
    a = w[..., 3:] / 255.0
    sh = cv2.GaussianBlur(cv2.warpAffine((warped[..., 3] > 8).astype(np.float32), np.float32([[1, 0, -10], [0, 1, 14]]), (art.shape[1], art.shape[0])), (0, 0), 9)
    sh = np.clip(sh - a[..., 0], 0, 1) * 0.35 * (art[..., 3] / 255.0)
    over = np.zeros_like(w)
    # the art is painted with soft light from the upper left: the same gentle falloff across the shield
    ys, xs = np.nonzero(warped[..., 3] > 8)
    gy, gx = np.mgrid[0:art.shape[0], 0:art.shape[1]].astype(np.float32)
    u = ((gx - xs.min()) / max(1, xs.max() - xs.min()) * .45 + (gy - ys.min()) / max(1, ys.max() - ys.min()) * .55)
    w[..., :3] *= np.clip(1.05 - .2 * u, .8, 1.05)[..., None]
    over[..., :3] = np.where(a > 0.02, w[..., :3], 20)              # straight alpha; the shadow is near-black
    over[..., 3] = np.maximum(w[..., 3], sh * 255)
    # whatever of the old shield still peeks out (its sharp peak can reach past ours): fill it with what is around it
    # (tunic, strap, hair or sky), sampled only from outside the old shield
    sil = old_silhouette(art, land)
    peek = ndimage.binary_dilation(sil & ~(warped[..., 3] > 230), iterations=2) & ~(warped[..., 3] > 250)
    if peek.any():
        ys, xs = np.nonzero(sil); pad = 40
        ya, yb, xa, xb = max(0, ys.min() - pad), ys.max() + pad, max(0, xs.min() - pad), xs.max() + pad
        fill = cv2.inpaint(art[ya:yb, xa:xb, :3], (sil[ya:yb, xa:xb] | peek[ya:yb, xa:xb]).astype(np.uint8), 7, cv2.INPAINT_TELEA)
        patch = np.zeros_like(over); patch[ya:yb, xa:xb, :3] = fill
        k = peek & (art[..., 3] > 0)
        over[k, :3] = over[k, :3] * (over[k, 3:] / 255.0) + patch[k, :3] * (1 - over[k, 3:] / 255.0)
        over[k, 3] = 255
    print(name, f'old shield pixels patched: {int(peek.sum())}')
    out = ROOT / f'public/art/ep002/props3d/shield_on_{name}.png'
    cv2.imwrite(str(out), np.clip(over, 0, 255).astype(np.uint8))
    # placement for the engine: the strap holds the shield near its peak, so the sway turns it about that point
    pivot = (M @ np.float32([*pts[0], 1])).tolist()
    (ROOT / f'tools/props3d/shield_on_{name}.json').write_text(json.dumps({'art': art_path, 'overlay': str(out.relative_to(ROOT)),
                                                                          'pivot': pivot, 'grow': round(float(grow), 2)}))
    # preview: art + overlay, beside the art alone
    def comp(fg, bg):
        al = fg[..., 3:] / 255.0
        return (fg[..., :3] * al + bg * (1 - al)).astype(np.uint8)
    bg = np.full(art.shape[:2] + (3,), 236, np.uint8)
    base = comp(art.astype(np.float32), bg.astype(np.float32))
    withs = comp(np.clip(over, 0, 255), base.astype(np.float32))
    prev = np.concatenate([base, withs], axis=1)
    cv2.imwrite(str(ROOT / f'docs/ep002/shield_on_{name}_preview.jpg'), cv2.resize(prev, None, fx=.5, fy=.5, interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 90])
    print(out.relative_to(ROOT), f'docs/ep002/shield_on_{name}_preview.jpg')


def sway(overlay, pivot, t, step_hz=1.6, deg=2.2):
    """Engine helper: the overlay turned a little about the strap point in time with Quest's walk (or the horse's
    trot); 0 at rest. `overlay` is the PIL image from shield_on_<name>.png, `pivot` from shield_on_<name>.json."""
    import math
    return overlay.rotate(deg * math.sin(2 * math.pi * step_hz * t), resample=3, center=tuple(pivot))


if __name__ == '__main__':
    for n in (sys.argv[1:] or TARGETS):
        mount(n, *TARGETS[n])
