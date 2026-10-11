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


def prop(name):
    im = Image.open(PROPS / f'{name}.png').convert('RGBA')
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


def boat_scene(base, cx, wl, boat_w, who, t=0.0, bob=1.0):
    """The rowboat on the water at (cx, wl) (plate px: centre x, waterline y), width boat_w, with people in it.
    who: [(spec, dx, h, flip)] — spec 'quest:...'/'pixie:...' or ('sil', 'quest2:...'); dx as a fraction of boat_w,
    h in plate px (full-body height; the hull hides the legs)."""
    boat = sized(prop('rowboat_side'), w=boat_w)
    dy = P(4) * bob * math.sin(t * 1.7)
    top = wl - boat.height * .72 + dy                                   # the hull sits ~28 % under... the waterline
    for spec, dx, h, flip in who:
        im = silhouette(spec[1]) if isinstance(spec, tuple) else cutout(spec)
        im = sized(im, h=h)
        if flip:
            im = im.transpose(Image.FLIP_LEFT_RIGHT)
        x = cx + dx * boat_w - im.width / 2
        y = top + boat.height * .30 - im.height * .55 + P(3) * math.sin(t * 1.7 + dx * 4)
        cut = top + boat.height * .6 - y                                # seated: nothing of them below the hull
        im = im.crop((0, 0, im.width, max(1, int(cut))))
        base.alpha_composite(im, (int(x), int(y)))
    base.alpha_composite(boat, (int(cx - boat.width / 2), int(top)))
    # the water line in front of the hull
    d = ImageDraw.Draw(base)
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
            render(t).save(out_path(ROOT / f'docs/ep003/block{name}_v{version}_{sn}.jpg'), quality=85)
    if '--stills' in sys.argv:
        save_stills(); print('stills'); return
    narr = ROOT / 'public/episodes/ep003/audio/narration.wav'
    p = subprocess.Popen([ff, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{t0:.3f}', '-t', f'{t1 - t0:.3f}', '-i', str(narr), '-map', '0:v', '-map', '1:a',
                          *video_args(), *audio_args(), '-shortest', str(out)], stdin=subprocess.PIPE)
    for n in range(int((t1 - t0) * FPS)):
        p.stdin.write(render(t0 + n / FPS).convert('RGB').tobytes())
    p.stdin.close(); p.wait()
    save_stills()
    print(out.relative_to(ROOT), f'{t1 - t0:.2f}s')


def crop_cam(plate, cam):
    """cam = (zoom, x, y) in plate fractions -> the output frame."""
    from lib import cam_box
    box = cam_box((cam, cam), 0)
    return plate.crop(tuple(int(v) for v in box)).resize((W, H), Image.BICUBIC)


def cam_lerp(a, b, k):
    e = ease(k)
    return (a[0] * (b[0] / a[0]) ** e, lin(a[1], b[1], e), lin(a[2], b[2], e))


def marker_at(fr, text, x, y, size=26, k=1.0, paper=False):
    """The channel's real-life marker label (family C) at output-fraction (x, y), popping in with k."""
    g = UI.marker(text, size=size, paper=paper)
    if k < 1:
        sc = .6 + .4 * ease(k)
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
