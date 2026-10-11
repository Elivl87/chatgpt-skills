"""EP003 (How to Fish) animatic kit: shared stand-ins and real-life UI, all free and drawn by code.

- plate_lake(time): the lake plate STAND-IN (NEW_ART #2 is the real one): sky, far shore with a small island, calm water.
- boat_scene(...): the four friends in the rowboat (NEW_ART #1 stand-in): 3D rowboat + Quest/Pixie cut-outs, the two
  friends that do not exist yet drawn as flat grey silhouettes of Quest poses (MISSING, labelled with PLANNING=1).
- phone_chat(...): our own group chat (no app UI copied): bubbles, "Bought." stickers, typing dots, a seen tick.
Sizes: plates in working-plate pixels (PW x PH, 1920x1080 grid via P()), UI in design px through S().
"""
import math
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

from lib import ROOT, W, H, PW, PH, S, Si, P, F, ease, lin, cutout, PLANNING  # noqa
import ui_kit as UI

PROPS = ROOT / 'public/art/ep003/props3d'
INK = (22, 22, 31)


FISH_V2 = {'fish_34': 'fish2_34_deadpan', 'fish_side': 'fish2_side_deadpan'}   # companion fish v2 (Producer, 2026-10-12)


@lru_cache(maxsize=64)
def _prop_img(name):
    name = FISH_V2.get(name, name)
    return Image.open(PROPS / f'{name}.png').convert('RGBA')


def prop(name):
    im = _prop_img(name)
    return im.crop(im.getchannel('A').getbbox())


def sized(im, h=None, w=None):
    if h:
        return im.resize((max(1, round(im.width * h / im.height)), max(1, round(h))), Image.LANCZOS)
    return im.resize((max(1, round(w)), max(1, round(im.height * w / im.width))), Image.LANCZOS)


def _grad(img, top, bottom, y0, y1):
    d = ImageDraw.Draw(img)
    for y in range(int(y0), int(y1)):
        k = (y - y0) / max(1, y1 - y0)
        d.line((0, y, img.width, y), fill=tuple(int(lin(a, b, k)) for a, b in zip(top, bottom)))


SKIES = {'dusk': ((74, 92, 160), (250, 170, 120), (255, 214, 150)),
         'day': ((120, 175, 225), (200, 225, 240), (240, 240, 230)),
         'night': ((10, 14, 38), (34, 44, 86), (60, 70, 110))}
WATER = {'dusk': ((118, 110, 150), (52, 70, 110)), 'day': ((110, 160, 190), (50, 100, 140)), 'night': ((28, 36, 66), (10, 14, 32))}


@lru_cache(maxsize=4)
def plate_lake(time='dusk'):
    """Lake stand-in (planning): horizon at 46 %, a far shore of soft hills with a small island, sun glow at dusk."""
    img = Image.new('RGB', (PW, PH))
    top, mid, low = SKIES[time]
    hz = PH * .46
    _grad(img, top, mid, 0, hz * .75); _grad(img, mid, low, hz * .75, hz)
    d = ImageDraw.Draw(img, 'RGBA')
    if time == 'night':
        rng = np.random.default_rng(3)
        for _ in range(160):
            x, y, r = rng.uniform(0, PW), rng.uniform(0, hz * .9), rng.uniform(.6, 2.2) * PW / 1920
            d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 250, 230, int(rng.uniform(90, 230))))
        d.ellipse((PW * .87 - P(34), PH * .16 - P(34), PW * .87 + P(34), PH * .16 + P(34)), fill=(245, 240, 215, 255))
    elif time == 'dusk':
        g = Image.new('RGBA', img.size)
        ImageDraw.Draw(g).ellipse((PW * .58, hz - P(160), PW * .58 + P(300), hz + P(140)), fill=(255, 220, 160, 150))
        img.paste(g.filter(ImageFilter.GaussianBlur(P(70))), (0, 0), g.filter(ImageFilter.GaussianBlur(P(70))))
        d = ImageDraw.Draw(img, 'RGBA')
        d.ellipse((PW * .68, hz - P(62), PW * .68 + P(110), hz + P(48)), fill=(255, 226, 170, 255))
    hill = {'dusk': (70, 70, 105), 'day': (80, 120, 95), 'night': (16, 20, 40)}[time]
    hill2 = tuple(int(c * .8) for c in hill)
    pts = [(0, hz)] + [(x, hz - P(30) - P(26) * math.sin(x / PW * 7.3) - P(18) * math.sin(x / PW * 17 + 1)) for x in np.linspace(0, PW, 60)] + [(PW, hz)]
    d.polygon(pts, fill=hill2)
    d.ellipse((PW * .18, hz - P(46), PW * .34, hz + P(18)), fill=hill)                       # the island
    for i in range(5):                                                                      # a few trees on it
        x = PW * (.21 + i * .025); d.polygon([(x, hz - P(80) + P(8) * (i % 2)), (x - P(16), hz - P(20)), (x + P(16), hz - P(20))], fill=tuple(int(c * .7) for c in hill))
    wt, wb = WATER[time]
    wat = Image.new('RGB', (PW, int(PH - hz)))
    _grad(wat, wt, wb, 0, wat.height)
    img.paste(wat, (0, int(hz)))
    d = ImageDraw.Draw(img, 'RGBA')
    rng = np.random.default_rng(5)
    for _ in range(90):                                                                     # ripples
        y = hz + (PH - hz) * rng.uniform(.02, 1) ** 1.6
        x = rng.uniform(0, PW); w = P(20) + P(90) * (y - hz) / (PH - hz)
        d.line((x - w, y, x + w, y), fill=(255, 255, 255, int(28 + 30 * (y - hz) / (PH - hz))), width=max(1, int(P(2))))
    if time == 'dusk':                                                                       # the sun's path on the water
        for i in range(26):
            y = hz + P(8) + i * P(14); w = P(70) - i * P(1.6)
            d.line((PW * .705 - w, y, PW * .705 + w, y), fill=(255, 220, 160, 120 - i * 4), width=max(1, int(P(4))))
    if PLANNING:
        d.rectangle((P(14), PH - P(52), P(560), PH - P(22)), fill=(120, 20, 20, 230))
        d.text((P(24), PH - P(48)), 'MISSING · lake plate (NEW_ART #2) · planning stand-in', font=F(15), fill=(255, 220, 220))
    return img


def silhouette(name, tone=(96, 100, 112)):
    """A friend who does not exist yet: a flat grey silhouette of an existing pose (MISSING, planning only)."""
    im = cutout(name)
    a = im.getchannel('A')
    out = Image.new('RGBA', im.size, tone + (255,)); out.putalpha(a)
    edge = a.filter(ImageFilter.MaxFilter(5))
    ring = Image.new('RGBA', im.size, INK + (255,)); ring.putalpha(edge)
    ring.alpha_composite(out)
    return ring


def _rim(im, col, side=1, w=None):
    """A warm rim light on the edge of a cutout that faces the light (side=1: light from the right)."""
    a = im.getchannel('A')
    w = w or max(2, int(im.width * .018))
    shifted = Image.new('L', a.size, 0); shifted.paste(a, (-side * w, 0))
    edge = Image.fromarray(np.clip(np.asarray(a, np.int16) - np.asarray(shifted, np.int16), 0, 255).astype(np.uint8))
    edge = edge.filter(ImageFilter.GaussianBlur(w * .6)).point(lambda v: int(v * .75))
    lay = Image.new('RGBA', im.size, col + (0,)); lay.putalpha(edge)
    out = im.copy(); out.alpha_composite(lay)
    return out


def boat_scene(base, cx, wl, boat_w, who, t=0.0, bob=1.0, light=None):
    """The rowboat on the water at (cx, wl) (plate px: centre x, waterline y), width boat_w, with people in it.
    who: [(spec, dx, h, flip)] — spec 'quest:...'/'pixie:...' or ('sil', 'quest2:...'); dx as a fraction of boat_w,
    h in plate px (full-body height; the hull hides the legs).
    Boat upgrade (2026-10-12): the boat and the people are reflected in the lake (rippled, faded), the hull casts a
    shadow on the water, ring ripples spread from the hull, and the people get a rim light from the sun (or the
    lantern at night). light: 'sunset' | 'night' | None (guessed from the sky)."""
    if light is None:
        sky = np.asarray(base.crop((0, 0, base.width, int(base.height * .15))).convert('L')).mean()
        light = 'night' if sky < 70 else 'sunset'
    rim_col = (255, 196, 120) if light == 'sunset' else (255, 214, 140)
    boat = sized(prop('rowboat_side'), w=boat_w)
    dy = P(4) * bob * math.sin(t * 1.7)
    top = wl - boat.height * .72 + dy                                   # the hull sits ~28 % under... the waterline
    grp = Image.new('RGBA', base.size)                                  # people + boat on their own layer
    for spec, dx, h, flip in who:
        sil = isinstance(spec, tuple)
        im = silhouette(spec[1]) if sil else cutout(spec)
        im = breathe(sized(im, h=h), t, phase=dx * 7)
        if flip:
            im = im.transpose(Image.FLIP_LEFT_RIGHT)
        if not sil:                                                     # after the flip, so the light side stays true
            im = _rim(im, rim_col, side=1 if light == 'sunset' else (1 if dx < 0 else -1))
        x = cx + dx * boat_w - im.width / 2
        y = top + boat.height * .30 - im.height * .55 + P(3) * math.sin(t * 1.7 + dx * 4)
        cut = top + boat.height * .6 - y                                # seated: nothing of them below the hull
        im = im.crop((0, 0, im.width, max(1, int(cut))))
        grp.alpha_composite(im, (int(x), int(y)))
    grp.alpha_composite(boat, (int(cx - boat.width / 2), int(top)))
    wy = int(wl + dy)
    # shadow of the hull on the water
    sh = Image.new('RGBA', base.size); ImageDraw.Draw(sh).ellipse((cx - boat_w * .55, wy - P(10), cx + boat_w * .55, wy + P(46)), fill=(10, 12, 30, 90))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(P(18))))
    # reflection: the layer flipped about the waterline, rippled row by row, faded with depth
    above = grp.crop((0, 0, base.width, wy))
    ref = above.transpose(Image.FLIP_TOP_BOTTOM)
    rh = min(ref.height, base.height - wy, int(boat.height * 1.6 + P(200)))
    if rh > 0:
        ra = np.asarray(ref.crop((0, 0, ref.width, rh))).copy()
        rows = np.arange(rh)
        shift = (P(5) * np.sin(rows / P(7) + t * 3.1) * (.4 + rows / max(1, rh))).astype(int)
        for i in range(0, rh):
            if shift[i]:
                ra[i] = np.roll(ra[i], shift[i], axis=0)
        fade = np.clip(.38 * (1 - rows / rh) ** 1.4, 0, 1)
        ra[..., 3] = (ra[..., 3] * fade[:, None]).astype(np.uint8)
        ra[..., :3] = (ra[..., :3] * .55 + np.array((40, 50, 90)) * .45).astype(np.uint8)
        base.alpha_composite(Image.fromarray(ra).filter(ImageFilter.GaussianBlur(P(1.5))), (0, wy))
    base.alpha_composite(grp)
    # ring ripples spreading from the hull, and the water line in front of it
    d = ImageDraw.Draw(base)
    for i in range(3):
        k = ((t * .35) + i / 3) % 1
        rx = boat_w * (.52 + .35 * k); ry = P(14) + P(26) * k
        d.ellipse((cx - rx, wy + P(4) - ry * .4, cx + rx, wy + P(4) + ry), outline=(255, 255, 255, int(80 * (1 - k))), width=max(1, int(P(2))))
    for i in range(3):
        y = wl + dy + P(6) + i * P(9)
        w = boat_w * (.52 + .06 * i)
        d.line((cx - w, y, cx + w, y), fill=(255, 255, 255, 70 - i * 18), width=max(1, int(P(3))))
    return base


# ------------------------------------------------------------------ the group chat (our own design)
CHAT_BG = (238, 234, 226)
ME = (214, 57, 47)          # the channel red for our side
THEM = (255, 255, 255)
NAMES = {'Q': ((214, 57, 47), 'Quest'), 'P': ((22, 120, 128), 'Pixie'), 'A': ((120, 96, 190), 'A friend'), 'B': ((214, 150, 40), 'B friend')}


def _avatar(d, x, y, r, who):
    col, name = NAMES[who]
    d.ellipse((x - r, y - r, x + r, y + r), fill=col + (255,), outline=INK + (255,), width=2)
    f = UI.inter(r * 1.05)
    tw = d.textlength(name[0], font=f)
    d.text((x - tw / 2, y - r * .62), name[0], font=f, fill=(255, 255, 255, 255))


def phone_chat(msgs, now, w=390, h=580, title='THE BOAT', typing=None, grey=0.0):
    """A phone showing a group chat. msgs: [(t_show, who, text, kind)] kind 'msg' | 'sticker'; who 'Q' is us (right).
    Messages pop in at t_show; the newest stay at the bottom. Returns an output-px RGBA image (design size w x h)."""
    g = UI._new(w + 30, h + 30); d = UI._D(g)
    d.rounded_rectangle((15, 15, 15 + w, 15 + h), 46, fill=(28, 30, 36, 255), outline=INK + (255,), width=3)
    sx0, sy0, sx1, sy1 = 29, 29, 1 + w, 1 + h
    d.rounded_rectangle((sx0, sy0, sx1, sy1), 36, fill=CHAT_BG + (255,))
    d.rounded_rectangle((sx0 + (sx1 - sx0) / 2 - 50, sy0 + 10, sx0 + (sx1 - sx0) / 2 + 50, sy0 + 30), 10, fill=(28, 30, 36, 255))
    hy = sy0 + 44
    d.rectangle((sx0, hy, sx1, hy + 64), fill=(250, 248, 244, 255))
    d.line((sx0, hy + 64, sx1, hy + 64), fill=(210, 205, 196, 255), width=2)
    for i, k in enumerate('QPAB'):
        _avatar(d, sx0 + 34 + i * 22, hy + 32, 15, k)
    d.text((sx0 + 132, hy + 10), title, font=UI.inter(22), fill=INK + (255,))
    d.text((sx0 + 132, hy + 38), '4 members', font=UI.inter(13, 600), fill=(120, 116, 110, 255))
    shown = [m for m in msgs if m[0] <= now]
    y = sy1 - 26
    if typing is not None and typing <= now:
        d.rounded_rectangle((sx0 + 56, y - 40, sx0 + 136, y), 18, fill=THEM + (255,))
        for i in range(3):
            k = .5 + .5 * math.sin(now * 8 - i)
            d.ellipse((sx0 + 76 + i * 18 - 5, y - 26 - 4 * k, sx0 + 76 + i * 18 + 5, y - 16 - 4 * k), fill=(150, 146, 140, 255))
        y -= 52
    f = UI.inter(21, 800)
    for t0, who, text, kind in reversed(shown):
        pop = ease(min(1, (now - t0) / .18))
        mine = who == 'Q'
        if kind == 'sticker':
            bw, bh = d.textlength(text, font=UI.inter(26)) + 40, 54
        else:
            lines, ln = [], ''
            for wd in text.split():
                if d.textlength((ln + ' ' + wd).strip(), font=f) > w * .58 and ln:
                    lines.append(ln); ln = wd
                else:
                    ln = (ln + ' ' + wd).strip()
            lines.append(ln)
            bw = max(d.textlength(l, font=f) for l in lines) + 36; bh = 30 * len(lines) + 22
        x1 = sx1 - 18 if mine else sx0 + 56 + bw
        x0 = x1 - bw
        y0 = y - bh
        if y0 < hy + 72:
            break
        sc = .7 + .3 * pop
        cx, cy = (x0 + x1) / 2, (y0 + y) / 2
        bx0, by0, bx1, by1 = cx - bw / 2 * sc, cy - bh / 2 * sc, cx + bw / 2 * sc, cy + bh / 2 * sc
        if kind == 'sticker':
            d.rounded_rectangle((bx0, by0, bx1, by1), 14, fill=(255, 200, 61, 255), outline=INK + (255,), width=3)
            d.text((bx0 + 20 * sc, by0 + 10 * sc), text, font=UI.inter(26 * sc), fill=INK + (255,))
        else:
            d.rounded_rectangle((bx0, by0, bx1, by1), 20, fill=(ME if mine else THEM) + (255,), outline=(0, 0, 0, 40), width=1)
            for i, l in enumerate(lines):
                d.text((bx0 + 18 * sc, by0 + (11 + 30 * i) * sc), l, font=UI.inter(21 * sc, 800), fill=((255, 255, 255) if mine else INK) + (255,))
        if not mine:
            _avatar(d, sx0 + 32, y - 18, 15, who)
        y = y0 - 14
    if grey > 0:
        ov = UI._new(w + 30, h + 30); UI._D(ov).rounded_rectangle((sx0, sy0, sx1, sy1), 36, fill=(120, 120, 124, int(170 * grey)))
        g.alpha_composite(ov)
    return g


def screen_paste(fr, im, x, y):
    """Paste an output-px RGBA image on an RGB frame at output px (x, y)."""
    out = fr.convert('RGBA'); out.alpha_composite(im, (int(x), int(y))); return out.convert('RGB')


# ------------------------------------------------------------------ block output (as the EP002 blocks: video + stills)
def _fin(fr, t):
    """The approved finish pass (Producer, 2026-10-11), the last step on every frame."""
    from finish import finish
    return finish(fr.convert('RGB'), t)


def run_block(name, t0, t1, render, stills, version=1):
    """Render frames t0..t1 with the narration slice, plus stills. Output: docs/ep003/EP003_block<name>_animatic_v<N>.mp4."""
    import subprocess, sys
    import imageio_ffmpeg
    from lib import FPS, out_path, video_args, audio_args
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    out = out_path(ROOT / f'docs/ep003/EP003_block{name}_animatic_v{version}.mp4')
    out.parent.mkdir(parents=True, exist_ok=True)

    def save_stills():
        for sn, t in stills:
            NOW[0] = t; _fin(render(t), t).save(out_path(ROOT / f'docs/ep003/block{name}_v{version}_{sn}.jpg'), quality=85)
    if '--stills' in sys.argv:
        save_stills(); print('stills'); return
    narr = ROOT / 'public/episodes/ep003/audio/mix.wav'                 # narration + the free SFX pass (scripts/ep003-sfx.py)
    if not narr.exists():
        narr = ROOT / 'public/episodes/ep003/audio/narration.wav'
    p = subprocess.Popen([ff, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{t0:.3f}', '-t', f'{t1 - t0:.3f}', '-i', str(narr), '-map', '0:v', '-map', '1:a',
                          *video_args(), *audio_args(), '-shortest', str(out)], stdin=subprocess.PIPE)
    for n in range(int((t1 - t0) * FPS)):
        NOW[0] = t0 + n / FPS
        p.stdin.write(_fin(render(t0 + n / FPS), t0 + n / FPS).convert('RGB').tobytes())
    p.stdin.close(); p.wait()
    save_stills()
    print(out.relative_to(ROOT), f'{t1 - t0:.2f}s')


NOW = [0.0]          # the frame being drawn (set by each block's render): drives reframes and idle motion
REFRAMES = []         # per block: (t0, t1, zoom_mul, x or None, y or None) — hard cuts to a different framing (coverage)


def reframe_at(t):
    for r in REFRAMES:
        if r[0] <= t < r[1]:
            return r
    return None


def crop_cam(plate, cam):
    """cam = (zoom, x, y) in plate fractions -> the output frame. A coverage reframe active at NOW multiplies the zoom
    and may move the centre: a cut to a medium/close shot of the same scene (camera-continuity rule: a clearly
    different shot), so long holds get coverage like EP002 (style bible: >= 12 cuts/min)."""
    from lib import cam_box
    r = reframe_at(NOW[0])
    if r:
        cam = (cam[0] * r[2], cam[1] if r[3] is None else r[3], cam[2] if r[4] is None else r[4])
    t = NOW[0]                                                        # the camera is never locked off (style bible):
    cam = (cam[0] * (1.06 + .06 * math.sin(2 * math.pi * t / 11)),    # a slow breathing push and a drift, like a
           cam[1] + .022 * math.sin(2 * math.pi * t / 15),             # handheld documentary camera
           cam[2] + .014 * math.sin(2 * math.pi * t / 13 + 1))
    box = cam_box((cam, cam), 0)
    return plate.crop(tuple(int(v) for v in box)).resize((W, H), Image.BICUBIC)


def spring(k, f=2.2, damp=5.5):
    """0 -> 1 with a little overshoot and settle (entrances)."""
    k = max(0.0, k)
    return 1 - math.exp(-damp * k) * math.cos(2 * math.pi * f * k)


def breathe(im, t, phase=0.0, amp=.012):
    """Idle motion for a cut-out: a slow breath (vertical scale from the feet) and a slight sway."""
    s = 1 + amp * math.sin(t * 2.1 + phase)
    h = max(1, int(im.height * s))
    im = im.resize((im.width, h), Image.BICUBIC)
    sh = .012 * math.sin(t * 1.3 + phase * 1.7)
    return im.transform(im.size, Image.AFFINE, (1, sh, -sh * im.height, 0, 1, 0), resample=Image.BICUBIC)


def lake_at(time, t):
    """The lake plate with life: ripples that drift, clouds that slide, glints that twinkle (all procedural, free)."""
    base = plate_lake(time).convert('RGBA')
    hz = PH * .46
    lay = Image.new('RGBA', base.size); d = ImageDraw.Draw(lay)
    rng = np.random.default_rng(21)
    for i in range(70):                                               # drifting ripple dashes
        y0 = hz + (PH - hz) * rng.uniform(.03, 1) ** 1.5
        sp = P(8) + P(14) * (y0 - hz) / (PH - hz)
        x = (rng.uniform(0, PW) + sp * t * (1 if i % 2 else -.6)) % (PW + P(200)) - P(100)
        w = P(16) + P(70) * (y0 - hz) / (PH - hz)
        a = int((40 + 50 * (y0 - hz) / (PH - hz)) * (.6 + .4 * math.sin(t * 1.5 + i)))
        d.line((x - w, y0, x + w, y0), fill=(255, 255, 255, a), width=max(1, int(P(2))))
    if time != 'night':                                               # clouds sliding
        for i in range(4):
            cx = (PW * (.15 + .27 * i) + P(10) * t) % (PW * 1.2) - PW * .1
            cy = PH * (.10 + .07 * (i % 2))
            for j in range(4):
                r = P(46) + P(18) * j
                d.ellipse((cx + j * P(52) - r, cy - r * .55, cx + j * P(52) + r, cy + r * .55), fill=(255, 245, 235, 60 if time == 'dusk' else 120))
    for i in range(14):                                               # sun/moon glints on the water
        k = (math.sin(t * 3 + i * 1.9) + 1) / 2
        if k > .7:
            gx = PW * (.70 if time == 'dusk' else .87) + P(60) * math.sin(i * 2.3)
            gy = hz + P(18) + i * P(12)
            d.line((gx - P(10) * k, gy, gx + P(10) * k, gy), fill=(255, 240, 200, int(200 * k)), width=max(1, int(P(3))))
    base.alpha_composite(lay)
    return base


def cam_lerp(a, b, k):
    e = ease(k)
    return (a[0] * (b[0] / a[0]) ** e, lin(a[1], b[1], e), lin(a[2], b[2], e))


def marker_at(fr, text, x, y, size=26, k=1.0, paper=False):
    """The channel's real-life marker label (family C) at output-fraction (x, y), popping in with k."""
    g = UI.marker(text, size=size, paper=paper)
    if k < 1:
        sc = .6 + .4 * spring(k * 1.6)
        g = g.resize((max(1, int(g.width * sc)), max(1, int(g.height * sc))), Image.LANCZOS)
        g = UI.fade(g, min(1, k * 3))
    out = fr.convert('RGBA'); out.alpha_composite(g, (int(x * W - g.width / 2), int(y * H - g.height / 2))); return out


def punch(fr, text, k, size=120, y=.5, col=(255, 255, 255), x=.5):
    """A big Anton word punching in (WHY?)."""
    f = UI.anton(size)
    tw = UI._measure().textlength(text, font=f)
    g = UI._new(tw + 40, size * 1.5); d = UI._D(g)
    d.text((20 + 6, 6), text, font=f, fill=INK + (255,))
    d.text((20, 0), text, font=f, fill=col + (255,), stroke_width=4, stroke_fill=INK + (255,))
    sc = 1.35 - .35 * ease(min(1, k / .25))
    g = g.resize((max(1, int(g.width * sc)), max(1, int(g.height * sc))), Image.LANCZOS)
    g = UI.fade(g, min(1, k / .12))
    out = fr.convert('RGBA'); out.alpha_composite(g, (int(x * W - g.width / 2), int(y * H - g.height / 2))); return out


@lru_cache(maxsize=2)
def gamebox():
    """The ep002 3D game box with OUR generic cover (no game art): its cyan cover key filled with water + our fish."""
    im = Image.open(ROOT / 'public/art/ep002/props3d/desk_gamebox.png').convert('RGBA')
    a = np.asarray(im).astype(np.int16)
    key = (a[..., 0] < 90) & (a[..., 1] > 170) & (a[..., 2] > 170) & (a[..., 3] > 0)
    ys, xs = np.where(key)
    cover = Image.new('RGBA', im.size)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max(), ys.max()
    c = Image.new('RGB', (x1 - x0 + 1, y1 - y0 + 1))
    _grad(c, (250, 180, 120), (60, 90, 150), 0, c.height)
    f = sized(prop('fish_34'), w=c.width * .6).rotate(12, expand=True, resample=Image.BICUBIC)
    c = c.convert('RGBA'); c.alpha_composite(f, (int(c.width * .2), int(c.height * .35)))
    cover.paste(c, (x0, y0))
    m = Image.fromarray((key * 255).astype(np.uint8))
    out = im.copy(); out.paste(cover, (0, 0), m)
    return out


# ------------------------------------------------------------------ the channel's wordmark (EP001/EP002 signature)
WORDMARK = ROOT / 'public/art/core/brand/secondquest_wordmark.png'


def _out_back(x, c=1.70158):
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2


def _in_out_cubic(x):
    return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2


def wordmark(fr, dt, y=.07, h=.14, twinkle=True):
    """The SecondQuest wordmark landing with its gold bar (as EP001 and EP002 block B), dt seconds after it lands.
    Producer rule: it lands on the hook's "Why?" and holds through the 1.5 s of silence that follows."""
    wm = Image.open(WORDMARK).convert('RGBA')
    wh = int(H * h); ww = int(wm.width * wh / wm.height)
    g = Image.new('RGBA', (max(ww, Si(420)) + Si(40), wh + Si(50)))
    g.alpha_composite(wm.resize((ww, wh), Image.LANCZOS), ((g.width - ww) // 2, Si(10)))
    bar = S(400) * h / .14 * _in_out_cubic(min(1, max(0, (dt - .25) / .45)))
    if bar > S(1):
        d = ImageDraw.Draw(g); yy = Si(10) + wh + S(12); x0 = (g.width - bar) / 2
        d.rounded_rectangle((x0, yy + S(2), x0 + bar, yy + S(9)), S(3), fill=INK + (255,))
        d.rounded_rectangle((x0, yy, x0 + bar, yy + S(7)), S(3), fill=(255, 200, 61, 255))
    x = min(1, dt / .28); sc = 1.3 + (1 - 1.3) * _out_back(x)
    g = g.resize((max(1, int(g.width * sc)), max(1, int(g.height * sc))), Image.LANCZOS)
    out = fr.convert('RGBA'); out.alpha_composite(UI.fade(g, min(1, x * 4)), (int(W / 2 - g.width / 2), int(H * y)))
    if twinkle and .7 < dt < 1.6:                                      # the star in the "o" twinkles once
        k = math.sin((dt - .7) / .9 * math.pi)
        sx, sy = W * (.5 + (.413 - .5) * h / .14), H * (y + 10 / 720 + (.157 - .07 - 10 / 720) * h / .14)
        UI.sparkle(ImageDraw.Draw(out), sx, sy, S(30) * k, (255, 250, 230), int(255 * k))
    return out


# ------------------------------------------------------------------ the companion: the unimpressed fish (RULE, docs/ep003/COMPANION.md)


def buddy(h, blink=0.0, mirror=False, sweat=0.0, rot=0, expr=None):
    """The fish companion (v2) at height h (output px). expr: deadpan | blink | wide | lookup | yawn | sweat | wince
    (rendered 3D expressions); blink 0..1 (a blink closes the eye past .5), sweat > 0 shows the sweating face."""
    e = expr or 'deadpan'
    if sweat > 0:
        e = 'sweat'
    if blink > .5:
        e = 'blink'
    f = sized(prop(f'fish2_34_{e}'), h=h).copy()
    if rot:
        f = f.rotate(rot, expand=True, resample=Image.BICUBIC)
    return f.transpose(Image.FLIP_LEFT_RIGHT) if mirror else f


def blink_at(t, every=3.1, phase=0.0):
    """A slow deadpan blink every few seconds (0..1..0 over .35 s)."""
    k = ((t + phase) % every) / .35
    return math.sin(math.pi * k) if k < 1 else 0.0


def star_pos(y=.07, h=.14):
    """The star in the wordmark's "o" (output px) for a wordmark at (y, h)."""
    return W * (.5 + (.413 - .5) * h / .14), H * (y + 10 / 720 + (.157 - .07 - 10 / 720) * h / .14)


def fish_into_star(fr, t, t_land, start=(.86, 1.08), y=.07, h=.14, dur=.9):
    """The companion's wordmark moment: it leaps from the water in an arc and dives into the star of the "o", landing at
    t_land (the wordmark's own twinkle follows). Returns the frame."""
    t0 = t_land - dur
    if t < t0 or t > t_land + .5:
        return fr
    out = fr.convert('RGBA')
    sx, sy = star_pos(y, h)
    if t <= t_land:
        k = (t - t0) / dur
        x = lin(start[0] * W, sx, k); yy = lin(start[1] * H, sy, k) - S(220) * math.sin(math.pi * k)
        size = lin(S(150), S(34), k ** 1.4)
        f = buddy(size, rot=lin(35, -60, k))
        out.alpha_composite(f, (int(x - f.width / 2), int(yy - f.height / 2)))
        d = ImageDraw.Draw(out)
        for i in range(1, 7):                                         # a trail of water drops
            kk = max(0, k - i * .04)
            dx = lin(start[0] * W, sx, kk); dy = lin(start[1] * H, sy, kk) - S(220) * math.sin(math.pi * kk)
            r = S(5) * (1 - i / 8)
            d.ellipse((dx - r, dy - r, dx + r, dy + r), fill=(200, 235, 255, 200 - i * 25))
    else:                                                             # a burst of sparkles where it went in
        k = (t - t_land) / .5
        d = ImageDraw.Draw(out)
        for i in range(8):
            a = i * math.pi / 4
            r = S(16) + S(46) * k
            UI.sparkle(d, sx + r * math.cos(a), sy + r * math.sin(a), S(9) * (1 - k), (190, 235, 255), int(255 * (1 - k)))
    return out


def place_phone(fr, ph, t, events, hold=1.1, zoom=1.45):
    """Put the phone on screen; for `hold` s after each new message the shot cuts to a close-up on the newest bubble
    (coverage for chat scenes), then back to the full phone."""
    out = fr.convert('RGBA')
    last = max([e for e in events if e <= t], default=None)
    if last is not None and t - last < hold:
        big = ph.resize((int(ph.width * zoom), int(ph.height * zoom)), Image.LANCZOS)
        out.alpha_composite(big, (int(W / 2 - big.width / 2), int(H * .55 - big.height * .82)))
    else:
        out.alpha_composite(ph, (int(W / 2 - ph.width / 2), int(H * .5 - ph.height / 2)))
    return out


def insert_close(fr, k_on, cx, cy, zoom=1.6):
    """A close-up insert of a drawn card (digital crop of the composed frame around (cx, cy) frame fractions)."""
    if not k_on:
        return fr
    cw, ch = W / zoom, H / zoom
    x0 = min(max(cx * W - cw / 2, 0), W - cw); y0 = min(max(cy * H - ch / 2, 0), H - ch)
    return fr.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BICUBIC)


# ------------------------------------------------------------------ 2.5D parallax on painted/photo plates (depth maps from
# tools/depth/depth_maps.py, Depth Anything V2 Small, Apache-2.0). The plate is never edited: pixels are displaced by depth.
PLATES = {'living_room_night_gaming': 'public/art/core/backgrounds/living_room_night_gaming.png',
          'city_apartments_evening': 'public/art/core/backgrounds/city_apartments_evening.png',
          'city_traffic': 'public/art/core/backgrounds/city_traffic.png',
          'home_living_night': 'public/art/core/backgrounds/home_living_night.png',
          'workshop': 'public/art/genres/farming/backgrounds/workshop.png'}


@lru_cache(maxsize=8)
def _plate_depth(name):
    import cv2
    img = np.asarray(Image.open(ROOT / PLATES[name]).convert('RGB').resize((PW, PH), Image.LANCZOS))
    d = np.asarray(Image.open(ROOT / f'public/art/ep003/depth/{name}_depth.png'), np.float32) / 65535
    d = cv2.resize(cv2.GaussianBlur(d, (0, 0), 3), (PW, PH))
    return img, d


def parallax(name, dx, dy=0.0):
    """The plate seen from a camera moved by (dx, dy) plate px: near things shift more than far ones."""
    import cv2
    img, d = _plate_depth(name)
    if abs(dx) < .5 and abs(dy) < .5:
        return Image.fromarray(img).convert('RGBA')
    yy, xx = np.mgrid[0:PH, 0:PW].astype(np.float32)
    k = (d - .35)
    out = cv2.remap(img, xx + dx * k, yy + dy * k, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    return Image.fromarray(out).convert('RGBA')


def dolly(name, t, t0, t1, amp=None, vertical=0.0):
    """A slow lateral 2.5D camera move over a shot (t0..t1): the parallax shifts from -amp/2 to +amp/2."""
    amp = P(46) if amp is None else amp
    k = ease(min(1, max(0, (t - t0) / max(.1, t1 - t0))))
    return parallax(name, amp * (k - .5), vertical * amp * (k - .5))


def dust(fr, t, n=40, seed=5, col=(255, 240, 210)):
    """Floating motes over plain card backgrounds, so drawn cards are never dead still."""
    out = fr.convert('RGBA'); lay = Image.new('RGBA', out.size); d = ImageDraw.Draw(lay)
    rng = np.random.default_rng(seed)
    for i in range(n):
        x = (rng.uniform(0, W) + S(14) * t * rng.uniform(.3, 1)) % W
        y = (rng.uniform(0, H) - S(9) * t * rng.uniform(.3, 1)) % H
        r = S(rng.uniform(1.5, 4)); a = int(60 + 60 * math.sin(t * 2 + i))
        d.ellipse((x - r, y - r, x + r, y + r), fill=col + (a,))
    out.alpha_composite(lay.filter(ImageFilter.GaussianBlur(S(1))))
    return out


# ------------------------------------------------------------------ EP003 wordmark moments (Producer, 2026-10-12)
def _wm_image(h):
    """The wordmark with its full gold bar, at height h (fraction of H); the image itself is never edited."""
    wm = Image.open(WORDMARK).convert('RGBA')
    wh = int(H * h); ww = int(wm.width * wh / wm.height)
    g = Image.new('RGBA', (max(ww, Si(420)) + Si(40), wh + Si(50)))
    g.alpha_composite(wm.resize((ww, wh), Image.LANCZOS), ((g.width - ww) // 2, Si(10)))
    d = ImageDraw.Draw(g); bar = S(400) * h / .14; yy = Si(10) + wh + S(12); x0 = (g.width - bar) / 2
    d.rounded_rectangle((x0, yy + S(2), x0 + bar, yy + S(9)), S(3), fill=INK + (255,))
    d.rounded_rectangle((x0, yy, x0 + bar, yy + S(7)), S(3), fill=(255, 200, 61, 255))
    return g, yy


def wordmark_catch(fr, dt, y=.07, h=.14):
    """Option 1 "The catch" (hook): a fishing line drops from the top, the hook snags the gold bar of the wordmark
    waiting just under the frame and reels it up through the shot into place; one bobber bounce; then the line goes slack and leaves."""
    g, bar_y = _wm_image(h)
    out = fr.convert('RGBA'); d = ImageDraw.Draw(out)
    low, top = H * 1.02, H * y                                        # the logo waits just under the frame
    hx = W / 2
    if dt < .35:                                                      # the line drops through the frame to it
        k = ease(dt / .35)
        wy = low; a = 1
        hook_y = lin(-S(20), wy + bar_y, k)
    elif dt < 1.05:                                                   # reeled up with one bobber bounce
        k = (dt - .35) / .7
        arrive = min(1, k / .55)
        bob = S(30) * math.exp(-5 * max(0, k - .55)) * math.sin(2 * math.pi * 1.6 * max(0, k - .55))
        wy = lin(low, top, 1 - (1 - arrive) ** 3) + bob; a = 1          # eases in, then one bobber dip (never above top)
        hook_y = wy + bar_y
    else:                                                             # slack line pulls out of frame
        wy = top; a = 1
        hook_y = wy + bar_y - S(260) * ease(min(1, (dt - 1.05) / .4))
    out.alpha_composite(UI.fade(g, a), (int(hx - g.width / 2), int(wy)))
    if hook_y > -S(10):
        sag = S(10) * math.sin(min(1, dt) * math.pi) if dt > 1.05 else 0
        d.line([(hx + S(4), -S(5)), (hx + S(4) + sag, hook_y - S(16))], fill=INK + (200,), width=max(2, Si(4)))
        d.line([(hx + S(4), -S(5)), (hx + S(4) + sag, hook_y - S(16))], fill=(240, 242, 248, 255), width=max(1, Si(2)))
        d.arc((hx - S(13), hook_y - S(22), hx + S(15), hook_y + S(10)), 0, 210, fill=INK + (255,), width=Si(6))
        d.arc((hx - S(13), hook_y - S(22), hx + S(15), hook_y + S(10)), 0, 210, fill=(205, 210, 220, 255), width=Si(3))
    return out


def wordmark_rise(fr, dt, y=.06, h=.11, water_y=.70):
    """Option 2 "Rising from the lake" (end): the wordmark rises out of the water, water streams and drips off it."""
    g, _ = _wm_image(h)
    out = fr.convert('RGBA')
    k = min(1, dt / .9); k = 1 - (1 - k) ** 3                        # rises and settles (never above its place)
    wy = lin(H * water_y, H * y, k) + S(10) * math.exp(-4 * max(0, dt - .9)) * math.sin(2 * math.pi * 1.2 * max(0, dt - .9))
    vis = max(0, int(H * water_y - wy))                               # only the part above the water line shows
    if vis > 0:
        part = g.crop((0, 0, g.width, min(g.height, vis)))
        wet = max(0.0, 1 - dt / 1.6)                                   # a wet blue sheen that dries off
        if wet > 0:
            tint = Image.new('RGBA', part.size, (140, 200, 255, int(70 * wet))); tint.putalpha(part.getchannel('A').point(lambda v: int(v * .3 * wet)))
            part = part.copy(); part.alpha_composite(tint)
        out.alpha_composite(part, (int(W / 2 - g.width / 2), int(wy)))
    d = ImageDraw.Draw(out)
    rng = np.random.default_rng(13)
    for i in range(26):                                               # drips falling from the letters
        x0 = W / 2 + rng.uniform(-.42, .42) * g.width; t0 = rng.uniform(.3, 1.6)
        if dt > t0:
            fall = (dt - t0) ** 2 * S(900)
            yy = wy + g.height * .62 + fall
            if yy < H * water_y:
                r = S(3) * rng.uniform(.7, 1.3)
                d.ellipse((x0 - r, yy - r * 1.6, x0 + r, yy + r), fill=(200, 230, 255, 200))
    if dt < 1.4:                                                      # the splash ring where it came out
        rr = S(60) + S(150) * dt
        d.ellipse((W / 2 - rr, H * water_y - rr * .12, W / 2 + rr, H * water_y + rr * .12), outline=(230, 245, 255, int(200 * (1 - dt / 1.4))), width=Si(3))
    return out
