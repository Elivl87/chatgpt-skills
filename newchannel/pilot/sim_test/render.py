"""Render the 20 s phantom-jam style test: print look (paper, 3 inks, halftone shadows, grain, misregistration).

    python3 render.py [--frames DIR] [--only 0,150,300] [--workers 2]

Frames are drawn at 2x (3840x2160) with Pillow and box-reduced to 1920x1080 (2x2 supersampling).
Palette is re-read from newchannel/brand/palette.json at render time.
"""
import argparse, json, math, os, sys
from functools import lru_cache
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sim  # noqa: E402

W, H = 1920, 1080
SS = 2                                     # supersampling factor
CW, CH = W * SS, H * SS
FPS = sim.FPS
NF = int(round(sim.DUR * FPS))

PAL_PATH = os.path.join(HERE, '..', '..', 'brand', 'palette.json')

# ---- layout (1x pixels) ----
CX, CY = 960.0, 546.0                      # ring centre
R = 398.0                                  # road centreline radius
ROAD = 54.0                                # road width
DOT_R = 13.0                               # car dot radius
MASCOT_R = 21.5
SHADOW_OFF = (4.0, 5.0)
REG_COLOR = (1.5, 1.0)                     # misregistration of the colour plate vs ink plate (1x px)
TRAIL_R0 = R - ROAD / 2 - 22               # newest space-time ring
TRAIL_SPEED = 16.0                         # px per video second the history drifts inward
TRAIL_AGE = 12.0                           # seconds of history kept
TRAIL_STEP = 3                             # sample every N frames

BG_M = 40                                  # background margin (1x px) so the camera drift never leaves it
TAP_LABEL = 'one tap of the brakes'


def hex2rgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def load_palette():
    with open(PAL_PATH) as f:
        p = json.load(f)
    return {k: hex2rgb(v) for k, v in p.items() if isinstance(v, str) and v.startswith('#')}


def find_font(weight='SemiBold'):
    brand_fonts = os.path.join(HERE, '..', '..', 'brand', 'fonts')
    if os.path.isdir(brand_fonts):
        for fn in sorted(os.listdir(brand_fonts)):
            if fn.lower().endswith(('.ttf', '.otf')) and weight.lower() in fn.lower():
                return os.path.join(brand_fonts, fn)
    for c in ['/usr/share/fonts/opentype/inter/Inter-%s.otf' % weight,
              '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(c):
            return c
    raise FileNotFoundError('no font')


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def ease(t):
    t = min(max(t, 0.0), 1.0); return t * t * (3 - 2 * t)


# ------------------------------------------------------------------ textures
def halftone(w, h, cell, coverage, angle_deg=45.0, ss=1):
    """Anti-aliased halftone dot screen as float alpha (0..1)."""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    a = math.radians(angle_deg)
    u = (x * math.cos(a) + y * math.sin(a)) / cell
    v = (-x * math.sin(a) + y * math.cos(a)) / cell
    du = u - np.floor(u) - .5; dv = v - np.floor(v) - .5
    d = np.sqrt(du * du + dv * dv) * cell            # distance to cell centre in px
    rad = math.sqrt(coverage / math.pi) * cell
    return np.clip(rad - d + .5 * ss, 0, ss) / ss


@lru_cache(maxsize=1)
def paper_texture():
    """Static paper fibre (multiplicative, ~ +-3 %), 1x."""
    rng = np.random.default_rng(7)
    lo = rng.normal(0, 1, (H // 8 + 2, W // 8 + 2)).astype(np.float32)
    lo = np.asarray(Image.fromarray(((lo * 40) + 128).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) - 128
    hi = rng.normal(0, 1, (H, W)).astype(np.float32)
    fib = rng.normal(0, 1, (H // 2, W)).astype(np.float32)      # horizontal fibres
    fib = np.asarray(Image.fromarray(((fib * 30) + 128).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), np.float32) - 128
    tex = 1 + lo / 128 * .022 + hi * .010 + fib / 128 * .012
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)
    vig = 1 - .07 * np.clip(r - .6, 0, None) ** 1.5
    return (tex * vig)[..., None].astype(np.float32)


@lru_cache(maxsize=4)
def live_grain(k):
    rng = np.random.default_rng(100 + k)
    return rng.normal(0, 2.2, (H, W, 1)).astype(np.float32)


@lru_cache(maxsize=1)
def shadow_screen():
    a = halftone(CW, CH, 3.6 * SS, 0.50, 45, SS)
    return Image.fromarray((a * 255).astype(np.uint8), 'L')


# ------------------------------------------------------------------ static world (2x, slightly oversized)
@lru_cache(maxsize=1)
def world_background():
    P = load_palette()
    s = SS
    BW, BH = CW + 2 * BG_M * s, CH + 2 * BG_M * s
    img = Image.new('RGB', (BW, BH), P['paper'])
    cx, cy = (CX + BG_M) * s, (CY + BG_M) * s
    # road fill (paper_shadow) on the colour plate, slightly misregistered
    fill = Image.new('L', (BW, BH), 0); d = ImageDraw.Draw(fill)
    ro, ri = (R + ROAD / 2) * s, (R - ROAD / 2) * s
    ox, oy = -1.0 * s, 0.8 * s
    d.ellipse([cx - ro + ox, cy - ro + oy, cx + ro + ox, cy + ro + oy], fill=255)
    d.ellipse([cx - ri + ox, cy - ri + oy, cx + ri + ox, cy + ri + oy], fill=0)
    img.paste(P['paper_shadow'], mask=fill)
    # halftone in the road "shadow" (fine screen, ink)
    ht = halftone(BW, BH, 5.0 * s, 0.10, 15, s)
    m = (np.asarray(fill, np.float32) / 255 * ht * .55 * 255).astype(np.uint8)
    img.paste(P['ink'], mask=Image.fromarray(m, 'L'))
    # inner soft halftone ring shading along the inner edge (gives the road a printed bevel)
    yy, xx = np.mgrid[0:BH, 0:BW].astype(np.float32)
    rr = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    band = np.clip(1 - np.abs(rr - (ro + 9 * s)) / (9 * s), 0, 1) ** 1.5
    ht2 = halftone(BW, BH, 5.0 * s, 0.30, 45, s)
    img.paste(P['ink'], mask=Image.fromarray((band * ht2 * .55 * 255).astype(np.uint8), 'L'))
    # edge lines (ink plate)
    d = ImageDraw.Draw(img)
    for rad, wdt in ((ro, 3.0), (ri, 3.0)):
        d.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], outline=P['ink'], width=int(wdt * s))
    # faint start line on the road (where the lap tick sounds), top of the ring
    for k in range(3):
        xk = cx - 3 * s + k * 3 * s
        d.line([xk, cy - ro + 6 * s, xk, cy - ri - 6 * s], fill=lerp(P['paper_shadow'], P['ink'], .35), width=s)
    return img


# ------------------------------------------------------------------ precomputed story
_S = None


def story():
    global _S
    if _S is None:
        s = sim.simulate()
        s['expr'] = sim.mascot_expressions(s)
        v, v_eq = s['v'], s['v_eq']
        # tint: 0 = cruising ink, 1 = stuck accent
        s['tint'] = smoothstep(4.2, 1.0, v)
        # jam centroid angle (smoothed) for the backwards arrow
        w = np.clip((v_eq - v) / v_eq, 0, 1) ** 2
        ph = np.exp(1j * 2 * np.pi * s['x'] / s['L'])
        z = (w * ph).sum(1)
        out = np.zeros(len(z), complex); acc = z[0]
        for i, zi in enumerate(z):
            acc = acc * .9 + zi * .1; out[i] = acc
        s['jam_phase'] = np.unwrap(np.angle(out))
        s['jam_mass'] = w.sum(1)
        # rotate the world so the braking car sits upper-left when it taps
        f_tap = int(s['tap_t'] * FPS)
        s['theta0'] = math.radians(138) - 2 * math.pi * s['x'][f_tap, s['braker']] / s['L']
        _S = s
    return _S


def car_angle(s, f, i):
    return s['theta0'] + 2 * math.pi * s['x'][f, i] / s['L']


def camera(t):
    z = 1.0 + 0.026 * ease(t / sim.DUR)
    dx = 13.0 * math.sin(2 * math.pi * t / 26 + .4)       # <= 0.7 % of width
    dy = 7.0 * math.sin(2 * math.pi * t / 19 + 1.7)
    return z, dx, dy


class Cam:
    def __init__(self, t):
        self.z, self.dx, self.dy = camera(t)

    def pt(self, x, y):      # world 1x -> screen 2x
        return ((x - W / 2 - self.dx) * self.z + W / 2) * SS, ((y - H / 2 - self.dy) * self.z + H / 2) * SS

    def r(self, r):
        return r * self.z * SS

    def box(self, x0, y0, x1, y1):  # world 1x -> screen 2x box (for resizing the background)
        a = (W / 2 + self.dx + (0 - W / 2) / self.z, H / 2 + self.dy + (0 - H / 2) / self.z)
        a = (a[0] + BG_M, a[1] + BG_M)
        return (a[0] * SS, a[1] * SS, (a[0] + W / self.z) * SS, (a[1] + H / self.z) * SS)


def disc(d, c, r, fill):
    d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=fill)


# ------------------------------------------------------------------ mascot
def draw_mascot(d, cam, P, pos, heading, expr, pop, f):
    s = SS * cam.z
    rb = MASCOT_R * s * (1 + pop)
    ox, oy = REG_COLOR[0] * s, REG_COLOR[1] * s
    disc(d, (pos[0] + ox, pos[1] + oy), rb, P['second'])
    ink = P['ink']
    cx, cy = pos
    lx, ly = heading[0] * 2.2 * s, heading[1] * 1.6 * s       # eyes look where it is going
    ex = 6.2 * s
    blink = (f % 97) in (0, 1, 2) and expr == sim.NEUTRAL
    if expr == sim.NEUTRAL:
        for sx in (-1, 1):
            if blink:
                d.line([cx + sx * ex + lx - 2.4 * s, cy - 3 * s + ly, cx + sx * ex + lx + 2.4 * s, cy - 3 * s + ly], fill=ink, width=int(1.8 * s))
            else:
                disc(d, (cx + sx * ex + lx, cy - 3 * s + ly), 2.5 * s, ink)
        d.line([cx - 4 * s + lx, cy + 6 * s + ly * .5, cx + 4 * s + lx, cy + 6 * s + ly * .5], fill=ink, width=int(2.0 * s))
    elif expr == sim.SURPRISED:
        for sx in (-1, 1):
            disc(d, (cx + sx * ex + lx, cy - 4.5 * s + ly), 3.3 * s, ink)
        r0 = 3.6 * s
        d.ellipse([cx - r0 + lx, cy + 7 * s - r0, cx + r0 + lx, cy + 7 * s + r0], outline=ink, width=int(1.8 * s))
    elif expr == sim.ANNOYED:
        for sx in (-1, 1):
            exx = cx + sx * ex + lx * .4
            disc(d, (exx, cy - 2.5 * s), 2.4 * s, ink)
            # brows slant down toward the middle
            d.line([exx + sx * 4.2 * s, cy - 10.5 * s, exx - sx * 2.6 * s, cy - 7.0 * s], fill=ink, width=int(2.3 * s))
        # frown
        d.arc([cx - 5 * s, cy + 6 * s, cx + 5 * s, cy + 12 * s], 200, 340, fill=ink, width=int(2.0 * s))
    else:  # RELIEVED: closed happy eyes + smile
        for sx in (-1, 1):
            exx = cx + sx * ex + lx * .4
            d.arc([exx - 3.4 * s, cy - 6.5 * s, exx + 3.4 * s, cy - 0.5 * s], 200, 340, fill=ink, width=int(2.4 * s))
        d.arc([cx - 6 * s, cy + 0.5 * s, cx + 6 * s, cy + 10 * s], 25, 155, fill=ink, width=int(2.5 * s))


# ------------------------------------------------------------------ frame
def render_frame(f):
    s = story(); P = load_palette_cached()
    t = f / FPS
    cam = Cam(t)
    img = world_background().resize((CW, CH), Image.BICUBIC, box=cam.box(0, 0, W, H))
    d = ImageDraw.Draw(img)
    n = s['n']

    # --- polar space-time trail inside the ring: every car leaves a faint ink mark, stuck cars an accent mark
    for fs in range(f - (f % TRAIL_STEP), max(-1, f - int(TRAIL_AGE * FPS)), -TRAIL_STEP):
        age = (f - fs) / FPS
        rr = TRAIL_R0 - age * TRAIL_SPEED
        fade = (1 - age / TRAIL_AGE) ** 1.2
        if rr < 60:
            break
        for i in range(n):
            th = car_angle(s, fs, i)
            px, py = CX + rr * math.cos(th), CY - rr * math.sin(th)
            q = cam.pt(px, py)
            tn = s['tint'][fs, i]
            if tn > .15:
                col = lerp(P['paper'], P['accent'], min(1, .25 + .75 * tn) * fade)
                disc(d, (q[0] + REG_COLOR[0] * SS, q[1] + REG_COLOR[1] * SS), cam.r(2.6 + 1.0 * tn), col)
            else:
                col = lerp(P['paper'], P['ink'], .22 * fade)
                disc(d, q, cam.r(1.3), col)

    # --- shadows (halftone, ink plate)
    pos = []
    for i in range(n):
        th = car_angle(s, f, i)
        pos.append((CX + R * math.cos(th), CY - R * math.sin(th), th))
    sm = Image.new('L', (CW, CH), 0); sd = ImageDraw.Draw(sm)
    m = s['mascot']
    for i, (x, y, th) in enumerate(pos):
        rr = MASCOT_R if i == m else DOT_R
        q = cam.pt(x + SHADOW_OFF[0], y + SHADOW_OFF[1])
        disc(sd, q, cam.r(rr), 255)
    img.paste(P['ink'], mask=ImageChops.multiply(sm, shadow_screen()))

    # --- brake marker (world) during the break
    tap_t = s['tap_t']
    mk = ease((t - (tap_t - .25)) / .35) * (1 - ease((t - (tap_t + 3.4)) / .5))
    if mk > 0:
        x, y, th = pos[s['braker']]
        q = cam.pt(x, y)
        pulse = 1 + .18 * math.sin(max(0, t - tap_t) * 2 * math.pi * 1.6) * math.exp(-max(0, t - tap_t) * .6)
        rr = cam.r((DOT_R + 10) * pulse)
        col = lerp(P['paper'], P['accent'], mk)
        d.ellipse([q[0] - rr, q[1] - rr, q[0] + rr, q[1] + rr], outline=col, width=int(3 * SS))

    # --- cars (colour plate: ink -> accent as they slow down)
    for i, (x, y, th) in enumerate(pos):
        if i == m:
            continue
        tn = float(s['tint'][f, i])
        q = cam.pt(x, y)
        if tn < .02:
            disc(d, q, cam.r(DOT_R), P['ink'])
        else:
            # accent plate grows as the car slows; the ink core shrinks away (two inks, never a muddy mix)
            disc(d, cam.pt(x + REG_COLOR[0], y + REG_COLOR[1]), cam.r(DOT_R), P['accent'])
            core = DOT_R * (1 - tn) ** .8
            if core > .8:
                disc(d, q, cam.r(core), P['ink'])

    # --- backwards arrow riding just outside the road, following the jam (clockwise)
    ar = ease((t - (s['tap_t'] + 5.5)) / .6) * (1 - ease((t - 18.4) / .6))
    if ar > 0 and s['jam_mass'][f] > .5:
        ph = s['theta0'] + s['jam_phase'][f]
        ra = R + ROAD / 2 + 26
        a0, a1 = ph + .10, ph - .55
        pts = [cam.pt(CX + ra * math.cos(a0 + (a1 - a0) * k / 40), CY - ra * math.sin(a0 + (a1 - a0) * k / 40)) for k in range(41)]
        col = lerp(P['paper'], P['accent'], ar)
        d.line(pts, fill=col, width=int(4 * SS), joint='curve')
        # arrow head pointing clockwise (tangent direction of decreasing angle)
        tip = pts[-1]
        tx, ty = math.sin(a1), math.cos(a1)            # d/dθ of (cos, -sin) is (-sin, -cos); clockwise = +
        nx, ny = -ty, tx
        hl, hw = cam.r(16), cam.r(9)
        tipf = (tip[0] + tx * hl * .35, tip[1] + ty * hl * .35)
        d.polygon([tipf, (tip[0] - tx * hl * .65 + nx * hw, tip[1] - ty * hl * .65 + ny * hw),
                   (tip[0] - tx * hl * .65 - nx * hw, tip[1] - ty * hl * .65 - ny * hw)], fill=col)
        # small ink arrow inside, the way the cars go (counter-clockwise), for contrast
        ri = R - ROAD / 2 - 12
        b0, b1 = ph - .25, ph + .30
        pts2 = [cam.pt(CX + ri * math.cos(b0 + (b1 - b0) * k / 30), CY - ri * math.sin(b0 + (b1 - b0) * k / 30)) for k in range(31)]
        col2 = lerp(P['paper'], P['ink'], ar * .55)
        d.line(pts2, fill=col2, width=int(2.5 * SS), joint='curve')
        tip = pts2[-1]; tx, ty = -math.sin(b1), -math.cos(b1); nx, ny = -ty, tx
        hl, hw = cam.r(11), cam.r(6)
        d.polygon([(tip[0] + tx * hl * .35, tip[1] + ty * hl * .35),
                   (tip[0] - tx * hl * .65 + nx * hw, tip[1] - ty * hl * .65 + ny * hw),
                   (tip[0] - tx * hl * .65 - nx * hw, tip[1] - ty * hl * .65 - ny * hw)], fill=col2)

    # --- mascot on top
    x, y, th = pos[m]
    e = int(s['expr'][f])
    ch = np.flatnonzero(np.diff(s['expr'][:f + 1])) if f > 0 else []
    since = (f - (ch[-1] + 1)) / FPS if len(ch) else 99
    pop = .12 * math.exp(-since * 9) * math.cos(since * 30) if since < 1 else 0
    heading = (-math.sin(th), -math.cos(th))
    draw_mascot(d, cam, P, cam.pt(x, y), heading, e, pop, f)

    # --- label (screen space, crisp) at the break
    la = ease((t - tap_t) / .35) * (1 - ease((t - (tap_t + 3.3)) / .45))
    if la > 0:
        font = label_font()
        txt = TAP_LABEL
        lx, ly = 150 * SS, (128 - 12 * (1 - la)) * SS
        col = lerp(P['paper'], P['ink'], la)
        d.text((lx, ly), txt, font=font, fill=col)
        bb = d.textbbox((lx, ly), txt, font=font)
        # accent underline, drawn on like a pen stroke
        ul = ease((t - tap_t - .15) / .5)
        d.line([bb[0], bb[3] + 12 * SS, bb[0] + (bb[2] - bb[0]) * ul, bb[3] + 12 * SS],
               fill=lerp(P['paper'], P['accent'], la), width=int(5 * SS))
        # leader from the label to the braking dot
        x, y, th = pos[s['braker']]
        q = cam.pt(x, y)
        a = (bb[2] + 4 * SS, bb[3] + 12 * SS)        # starts where the underline ends
        vx, vy = q[0] - a[0], q[1] - a[1]; L = math.hypot(vx, vy)
        rr = cam.r(DOT_R + 16)
        if L > rr + 20:
            b = (q[0] - vx / L * rr, q[1] - vy / L * rr)
            k = ease((t - tap_t - .3) / .4)
            d.line([a, (a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k)], fill=lerp(P['paper'], P['ink'], la * .8), width=int(2.5 * SS))

    out = img.reduce(SS)
    a = np.asarray(out, np.float32)
    a = a * paper_texture() + live_grain((f // 2) % 4)
    return np.clip(a + .5, 0, 255).astype(np.uint8)


_P = None


def load_palette_cached():
    global _P
    if _P is None:
        _P = load_palette()
    return _P


@lru_cache(maxsize=1)
def label_font():
    return ImageFont.truetype(find_font('SemiBold'), int(50 * SS))


def _work(args):
    f, outdir = args
    Image.fromarray(render_frame(f)).save(os.path.join(outdir, 'f%04d.png' % f), compress_level=1)
    return f


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--frames', default='/tmp/claude-0/sim_test_frames')
    ap.add_argument('--only', default='')
    ap.add_argument('--workers', type=int, default=2)
    a = ap.parse_args()
    os.makedirs(a.frames, exist_ok=True)
    todo = [int(x) for x in a.only.split(',')] if a.only else list(range(NF))
    jobs = [(f, a.frames) for f in todo]
    if a.workers <= 1:
        for j in jobs:
            _work(j)
    else:
        with Pool(min(2, a.workers)) as pool:
            for k, f in enumerate(pool.imap_unordered(_work, jobs, chunksize=4)):
                if k % 60 == 0:
                    print('frame', k, '/', len(jobs), flush=True)
    print('done', len(jobs))
