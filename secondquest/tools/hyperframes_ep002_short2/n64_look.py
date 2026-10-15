"""The 1998 look of Hyrule field for EP002 Short #2 (critic v2, issue 3: "reads as a censor mosaic, not as an N64 world").

N64-era geometry instead of pixelation: a smooth skybox gradient above the mountain line of plate #11, the terrain as
flat-shaded low-poly facets (big near the camera, smaller far away, finer on the castle so its silhouette survives),
and distance fog at the horizon. Built from the final plate #11 at load time; the art file itself is never modified.
"""
import numpy as np, cv2
from PIL import Image


def build(plate):
    """plate: PIL RGB image of #11 at plate size -> (old, mid): the 1998 look and a halfway step for "More polygons"."""
    global src, H, W
    src = np.asarray(plate.convert('RGB')).astype(np.float32)
    H, W = src.shape[:2]
    return n64(None), lowpoly(30, seed=11, fog=.12, sat=.92)


def lowpoly(cell, seed=3, fog=.45, sat=.8):
    rng = np.random.default_rng(seed)
    # rows denser towards the horizon (y ~ .55 H) so the far field keeps its shapes (castle, hills)
    ys = [0.]
    y = 0.
    while y < H:
        d = abs(y / H - .55); step = cell * (.45 + 1.4 * d); y = min(H, y + step); ys.append(y)
    pts = []
    for r, y in enumerate(ys):
        step = cell * (.45 + 1.4 * abs(y / H - .55))
        xs = np.arange(0, W + step, step)
        for x in xs:
            jx = 0 if x in (0,) or x >= W else rng.uniform(-.35, .35) * step
            jy = 0 if r in (0, len(ys) - 1) else rng.uniform(-.3, .3) * step
            pts.append((min(W, max(0, x + jx)), min(H, max(0, y + jy))))
    pts = np.array(pts, np.float32)
    sub = cv2.Subdiv2D((0, 0, W + 1, H + 1))
    for p in pts: sub.insert((float(min(W, p[0])), float(min(H, p[1]))))
    tris = sub.getTriangleList().reshape(-1, 3, 2)
    lab = np.full((H, W), -1, np.int32)
    for i, t in enumerate(tris):
        cv2.fillConvexPoly(lab, np.round(t).astype(np.int32), i)
    m = lab >= 0; idx = lab[m]
    n = len(tris)
    cnt = np.bincount(idx, minlength=n).astype(np.float32) + 1e-6
    col = np.stack([np.bincount(idx, weights=src[..., c][m], minlength=n) for c in range(3)], 1) / cnt[:, None]
    g = col.mean(1, keepdims=True); col = g + (col - g) * sat
    shade = 1 + rng.uniform(-.07, .07, n)[:, None]                       # flat shading: each facet its own light
    col = col * shade
    out = src.copy(); out[m] = col[idx]
    yy = np.mgrid[0:H, 0:W][0] / H
    f = np.clip(1 - np.abs(yy - .5) / .28, 0, 1)[..., None] * fog          # distance fog around the horizon
    out = out * (1 - f) + np.array([200, 212, 224]) * f
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

def n64(src_img):
    """1998 look: N64 skybox (smooth gradient above the ridge line), low-poly flat-shaded terrain (big facets near,
    smaller far, finer on the castle so its silhouette survives), fog at the horizon."""
    far = np.asarray(lowpoly(46, seed=5, fog=0, sat=.78)).astype(np.float32)
    near = np.asarray(lowpoly(96, seed=7, fog=0, sat=.78)).astype(np.float32)
    fine = np.asarray(lowpoly(20, seed=9, fog=0, sat=.8)).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None]
    k = np.clip((yy - .58) / .06, 0, 1)[..., None]
    out = far * (1 - k) + near * k
    cast = (xx > .6) & (xx < .745) & (yy > .27) & (yy < .46)
    out[cast] = fine[cast]
    RIDGE = [(0, .33), (.05, .31), (.1, .28), (.15, .29), (.2, .30), (.25, .31), (.3, .33), (.4, .34), (.45, .35), (.6, .35),
             (.75, .34), (.8, .33), (.85, .27), (.88, .25), (.92, .27), (.95, .31), (1, .33)]   # the mountain line of plate #11
    ridge = np.interp(np.arange(W) / W, [p[0] for p in RIDGE], [p[1] for p in RIDGE]) * H
    above = np.arange(H)[:, None] < ridge[None, :]
    bluesky = (src[..., 2] - src[..., 0] > 55) & (yy < .36)                  # inside the castle box: only real blue sky goes
    sky = (above & ~cast) | (cast & bluesky)
    sky = cv2.morphologyEx(sky.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)).astype(bool)
    top, hor = np.array([70, 130, 215], np.float32), np.array([196, 210, 226], np.float32)
    grad = top + (hor - top) * np.clip(yy / .36, 0, 1)[..., None]
    out[sky] = grad[sky]
    f = np.clip(1 - np.abs(yy - .5) / .2, 0, 1)[..., None] * .45
    out = out * (1 - f) + hor * f
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def build_generic(plate, dark=1.0):
    """Any plate: (old, mid). v3.2 (retention critic: the tree must READ): the N64 way, not a mosaic: low-poly geometry
    with a low-res, bilinear-filtered texture on it. Old = the plate at 1/12 resolution blown back up (soft, blurry
    texture: the face still reads), with flat per-facet shading over big triangles and a little fog; mid = 1/5."""
    global src, H, W
    src0 = np.asarray(plate.convert('RGB')).astype(np.float32)
    H, W = src0.shape[:2]
    def tex(k):
        small = cv2.resize(src0, (W // k, H // k), interpolation=cv2.INTER_AREA)
        return cv2.resize(small, (W, H), interpolation=cv2.INTER_LINEAR)
    def facets(img, cell, amp, seed):
        global src
        src = np.full((H, W, 3), 128, np.float32)
        lp = np.asarray(lowpoly(cell, seed=seed, fog=0, sat=1.0)).astype(np.float32)   # flat grey + per-facet light
        rng = np.random.default_rng(seed)
        sh = lp[..., :1] / 128.0
        sh = 1 + (sh - 1) * (amp / .07)
        return img * sh
    old = facets(tex(14), 80, .17, 31)
    g = old.mean(2, keepdims=True); old = (g + (old - g) * .82) * dark * 1.04
    mid = facets(tex(5), 45, .05, 33)
    return (Image.fromarray(np.clip(old, 0, 255).astype(np.uint8)), Image.fromarray(np.clip(mid, 0, 255).astype(np.uint8)))
