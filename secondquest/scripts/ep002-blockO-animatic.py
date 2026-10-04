#!/usr/bin/env python3
"""EP002 animatic, block O (planning only): l109 "So maybe changing Ocarina of Time is not disrespecting it." ->
l114 "And then find a way to make someone feel that again." (block P starts on l115 "Which brings us back...").

Producer approved, 2026-10-04 ("Prosigue"). A new place: a pantry shelf of preserving jars (the script's "preserve").
  O0  (N's improvement) the CHILD | ADULT split of block N dissolves into the shelf.
  O1  "So maybe changing Ocarina of Time is not disrespecting it."  The golden cartridge sealed in a jar, clamp lid,
                                          label DO NOT OPEN; the lid twitches on "not disrespecting".
  O2  "Maybe refusing to change anything would be."  The glass fogs up, the cartridge loses its shine and greys.
  O3  "Because the goal should not be to preserve every limitation from 1998."  Pull back: the whole shelf of 1998
                                          limitations, each in its jar: FOG, LOW POLY, BLURRY TEXTURES, FIXED CAMERA;
                                          a PRESERVED SINCE 1998 tag on the shelf.
  O4  "The goal should be to understand... what those limitations made you feel."  The FOG jar pops open: the fog
                                          curls out into a "?" and its label flips to MYSTERY; the LOW POLY jar opens,
                                          a ghost of a great castle rises from its few polygons: IMAGINATION.
                                          Then the cartridge jar itself opens and pours out golden light.
  O5  "And then find a way to make someone feel that again."  The fog fills the frame and clears on today's forest:
                                          the same "?" travels from the fog jar to Pixie (new player, her tunic), who
                                          looks up into the mist in awe.
HUD: hidden on the shelf (real life), on in the forest (in game; Pixie's FILE 2 has 3 hearts). Stand-ins: Pixie in her
tunic, awe (MISSING #2d), forest (#12). Sounds: none (all at the end).
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, W, H, FPS, T, ease, lin, subtitle, tag, F  # noqa
from icons import camera_icon  # noqa
import fairy as fairy_fx  # noqa
import hud  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BN = load('blockN', 'scripts/ep002-blockN-animatic.py')          # the two eras, the cartridge
BM = load('blockM', 'scripts/ep002-blockM-animatic.py')          # the forest
CART = BN.CART
comp, sized, fade, ctext = BN.comp, BN.sized, BN.fade, BN.ctext
P2_AWE = BN.BL.BK.BJ.P2_AWE                                                  # MISSING #2d: Pixie in her tunic, awe (stand-in)

T0 = T('l109') - 0.05                   # block N ends here
T_NOTDIS = T('l109.w8')                 # "not disrespecting"
T_REFUSE = T('l110') - .05
T_WOULD = T('l110.w6')                  # "would be"
T_PRES = T('l111') - .05
T_PRESW = T('l111.w8')                  # "preserve"
T_UND = T('l112.w6')                    # "understand"
T_LIM = T('l113.w3')                    # "limitations": FOG -> MYSTERY
T_MADE = T('l113.w4')                   # LOW POLY opens
T_FEEL = T('l113.w6')                   # -> IMAGINATION
T_AGAIN = T('l114') - .05
T_FEEL2 = T('l114.w9')                  # "feel (that again)"
T_END = T('l115') - 0.05                # block P starts on l115
T_OPEN = T_FEEL + .1                    # the cartridge jar opens (Producer improvement)
Q_TRAVEL0, Q_TRAVEL1 = T('l114') - .25, T('l114') + 1.0
Q_SIZE = 90
INK = (20, 14, 18, 255)
SHELF_Y = H * .66                                                            # top of the shelf board (jar bottoms)
Q_FROM = (W * .13 + 10, SHELF_Y - 210 - 175)                                 # the "?" over the FOG jar...
Q_TO = (W * .42 + 20, H * .95 - H * .52 - 120)                                # ...and over Pixie's head


def qmark(d, cx, y, size):
    """The one "?" of this block: the fog's mystery, the same mark over Pixie."""
    f = F(int(size))
    d.text((cx - d.textlength('?', font=f) / 2, y), '?', font=f, fill=(255, 255, 255), stroke_width=5, stroke_fill=(70, 80, 110))


# ------------------------------------------------------------------ the pantry
def _pantry():
    a = np.zeros((H, W, 3), np.float32)
    yy = np.linspace(0, 1, H)[:, None, None]; xx = np.linspace(0, 1, W)[None, :, None]
    a[:] = np.array([116, 88, 62]) * (1 - .35 * yy) * (1 - .25 * np.abs(xx - .45))
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    for x in range(0, W, 96):                                               # wood panelling
        d.line((x, 0, x, SHELF_Y), fill=(96, 72, 50), width=3)
    d.rectangle((0, SHELF_Y, W, SHELF_Y + 26), fill=(150, 104, 62)); d.line((0, SHELF_Y, W, SHELF_Y), fill=(200, 150, 96), width=3)
    d.rectangle((0, SHELF_Y + 26, W, SHELF_Y + 40), fill=(90, 60, 38))
    d.rectangle((0, SHELF_Y + 40, W, H), fill=(70, 52, 38))
    for x in (W * .05, W * .95):                                            # brackets
        d.polygon(((x - 8, SHELF_Y + 40), (x + 8, SHELF_Y + 40), (x + 8, SHELF_Y + 120), (x - 8, SHELF_Y + 70)), fill=(60, 40, 28))
    return CART.glow(im, W * .12, H * .1, 520, (255, 220, 160), .35)


PANTRY = _pantry()

# contents
_cart = BN.CARTRIDGE


def c_cart(w, h, k_grey):
    c = sized(_cart, h * .62)
    if k_grey > 0:
        a = np.asarray(c).astype(np.float32); g = a[..., :3].mean(2, keepdims=True)
        a[..., :3] = a[..., :3] + (g * .8 - a[..., :3]) * k_grey
        c = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return c


def c_fog(w, h, t, k=1.0):
    g = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(g)
    for i in range(10):
        a = t * .8 + i * .63
        x = w * .5 + math.cos(a) * w * .22; y = h * .55 + math.sin(a * 1.3) * h * .18
        r = w * (.16 + .05 * math.sin(i))
        d.ellipse((x - r, y - r * .7, x + r, y + r * .7), fill=(236, 240, 246, int(200 * k)))
    return g.filter(ImageFilter.GaussianBlur(6))


def c_lowpoly(w, h):
    g = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(g)
    cx, by = w * .5, h * .86
    d.rectangle((cx - 8, by - 50, cx + 8, by), fill=(110, 74, 44, 255), outline=INK, width=3)
    for (pts, col) in ((((cx - 56, by - 46), (cx, by - 160), (cx, by - 46)), (40, 120, 50)), (((cx, by - 46), (cx, by - 160), (cx + 56, by - 46)), (60, 150, 60)),
                       (((cx - 40, by - 100), (cx, by - 200), (cx, by - 100)), (50, 136, 56)), (((cx, by - 100), (cx, by - 200), (cx + 40, by - 100)), (74, 170, 70))):
        d.polygon(pts, fill=col + (255,), outline=INK)
    return g


def c_blurry(w, h):
    g = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(g)
    s = 22
    for y in range(int(h * .25), int(h * .9), s):
        for x in range(int(w * .12), int(w * .88), s):
            col = (150, 120, 80) if (x // s + y // s) % 2 else (110, 150, 80)
            d.rectangle((x, y, x + s, y + s), fill=col + (255,))
    return g.filter(ImageFilter.GaussianBlur(5))


def c_camera(w, h):
    c = camera_icon(False, int(w * .62)).rotate(-18, resample=Image.BICUBIC, expand=True)
    g = Image.new('RGBA', (w, h)); g.alpha_composite(c, (int(w * .5 - c.width / 2), int(h * .58 - c.height / 2)))
    d = ImageDraw.Draw(g)                                                   # glued in place: a strip of tape
    d.polygon(((w * .2, h * .74), (w * .8, h * .66), (w * .82, h * .72), (w * .22, h * .80)), fill=(235, 225, 190, 220), outline=INK)
    return g


def jar(w, h, content, label, lid_open=0.0, fogged=0.0, label_flip=None, clamp=False, t=0.0):
    """A preserving jar: glass, the content inside, a metal lid (clamped for the cartridge), a paper label.
    label_flip = (new_label, k): the label flips over to new text."""
    pad = 60
    g = Image.new('RGBA', (w + 2 * pad, h + 2 * pad)); d = ImageDraw.Draw(g)
    x0, y0, x1, y1 = pad, pad + 26, pad + w, pad + h
    body = Image.new('L', g.size, 0); ImageDraw.Draw(body).rounded_rectangle((x0, y0, x1, y1), 30, fill=255)
    inner = Image.new('RGBA', g.size)
    if content is not None:
        inner.alpha_composite(content, (int(x0 + (w - content.width) / 2), int(y1 - content.height - 8)))
    inner.putalpha(Image.fromarray(np.minimum(np.asarray(inner.getchannel('A')), np.asarray(body))))
    g.alpha_composite(inner)
    glass = Image.new('RGBA', g.size); gd = ImageDraw.Draw(glass)
    gd.rounded_rectangle((x0, y0, x1, y1), 30, fill=(210, 235, 240, int(40 + 150 * fogged)), outline=(230, 245, 250, 230), width=4)
    gd.line((x0 + 18, y0 + 30, x0 + 18, y1 - 30), fill=(255, 255, 255, 120), width=8)
    gd.line((x1 - 26, y0 + 50, x1 - 26, y0 + 110), fill=(255, 255, 255, 90), width=5)
    g.alpha_composite(glass)
    d = ImageDraw.Draw(g)
    d.rounded_rectangle((x0, y0, x1, y1), 30, outline=INK, width=3)
    d.rectangle((x0 + 14, y0 - 16, x1 - 14, y0 + 4), fill=(210, 225, 230, 160), outline=INK, width=3)    # neck
    lift = 60 * ease(lid_open); tilt = 25 * ease(lid_open)
    lid = Image.new('RGBA', (w - 8, 34)); ld = ImageDraw.Draw(lid)
    ld.rounded_rectangle((0, 0, w - 9, 33), 8, fill=(176, 172, 160, 255), outline=INK, width=3)
    for i in range(1, 6):
        ld.line((i * (w - 8) / 6, 6, i * (w - 8) / 6, 27), fill=(140, 136, 126, 255), width=2)
    lid = lid.rotate(tilt, resample=Image.BICUBIC, expand=True)
    g.alpha_composite(lid, (int(x0 + 4 - (lid.width - (w - 8)) / 2 + 20 * ease(lid_open)), int(y0 - 46 - lift)))
    if clamp:                                                                # the wire clamp of the sealed jar
        d.line((x0 + 10, y0 - 34, x0 + 4, y0 + 40), fill=(90, 90, 96), width=4); d.line((x1 - 10, y0 - 34, x1 - 4, y0 + 40), fill=(90, 90, 96), width=4)
        d.line((x0 + 10, y0 - 34, x1 - 10, y0 - 34), fill=(90, 90, 96), width=4)
    # label (it can flip over to new text)
    lw, lh = int(w * .8), 46
    text, sq = label, 1.0
    if label_flip is not None:
        new, k = label_flip
        if k > 0:
            sq = abs(math.cos(math.pi * min(1, k)))
            text = label if k < .5 else new
    lab = Image.new('RGBA', (lw, lh)); lbd = ImageDraw.Draw(lab)
    flipped = label_flip is not None and label_flip[1] >= .5
    lbd.rectangle((0, 0, lw - 1, lh - 1), fill=(255, 238, 170, 255) if flipped else (240, 232, 208, 255), outline=(110, 90, 60, 255), width=2)
    fs = 22
    while fs > 10 and lbd.textlength(text, font=F(fs)) > lw - 12:
        fs -= 1
    lbd.text((lw / 2 - lbd.textlength(text, font=F(fs)) / 2, lh / 2 - fs * .62), text, font=F(fs), fill=(150, 40, 40, 255) if text == 'DO NOT OPEN' else (50, 40, 30, 255))
    lab = lab.resize((lw, max(1, int(lh * sq))), Image.LANCZOS)
    g.alpha_composite(lab, (int(x0 + (w - lw) / 2), int(y0 + (y1 - y0) * .80 - lab.height / 2)))     # low on the glass, clear of the contents
    return g, pad


JARS = {  # name: (cx, w, h)
    'fog': (W * .13, 170, 210), 'poly': (W * .31, 170, 210), 'cart': (W * .5, 230, 270), 'blur': (W * .69, 170, 210), 'cam': (W * .87, 170, 210),
}


def shelf(t):
    fr = PANTRY.copy()
    kopen = ease(min(1, max(0, (t - T_OPEN) / .35)))                          # Producer improvement: at last the cartridge jar opens
    grey = ease(min(1, max(0, (t - T_REFUSE - .3) / 2.0))) * (1 - kopen)       # O2: refusing to change: fog and grey
    for name in ('fog', 'poly', 'blur', 'cam', 'cart'):
        cx, w, h = JARS[name]
        lid, flip, content, fogged, clamp = 0.0, None, None, 0.0, False
        if name == 'cart':
            content = c_cart(w, h, grey); fogged = .75 * grey; clamp = True; label = 'DO NOT OPEN'
            if T_NOTDIS - .1 < t < T_REFUSE:                                 # the lid twitches: it wants to open
                lid = .08 * abs(math.sin((t - T_NOTDIS) * 22)) * (1 - (t - T_NOTDIS) / (T_REFUSE - T_NOTDIS))
            lid = max(lid, kopen); clamp = kopen < .3
        elif name == 'fog':
            label = 'FOG'
            lid = min(1, max(0, (t - T_UND) / .35))
            content = c_fog(w, h, t, 1 - .7 * lid)
            flip = ('MYSTERY', min(1, max(0, (t - T_LIM) / .4)))
        elif name == 'poly':
            label = 'LOW POLY'; content = c_lowpoly(w, h)
            lid = min(1, max(0, (t - T_MADE) / .35))
            flip = ('IMAGINATION', min(1, max(0, (t - T_FEEL) / .4)))
        elif name == 'blur':
            label = 'BLURRY TEXTURES'; content = c_blurry(w, h)
        else:
            label = 'FIXED CAMERA'; content = c_camera(w, h)
        if name != 'cart':                                                   # the other jars come in one by one on the pull back
            order = ['fog', 'poly', 'blur', 'cam'].index(name)
            ka = ease(min(1, max(0, (t - T_PRES - .3 - order * .35) / .4)))
            if ka <= 0:
                continue
        else:
            ka = 1
        g, pad = jar(w, h, content, label, lid, fogged, flip, clamp, t)
        g = fade(g, ka)
        fr = comp(fr, g, cx - w / 2 - pad, SHELF_Y - h - pad + 20 * (1 - ka))
        if name == 'cart' and grey > 0:                                      # condensation drips
            dd = ImageDraw.Draw(fr)
            for i in range(5):
                x = cx - w * .35 + i * w * .17; y = SHELF_Y - h + 40 + (t * 30 + i * 37) % (h - 60) * grey
                dd.line((x, SHELF_Y - h + 40, x, y), fill=(200, 220, 225), width=2)
    # the shelf tag
    kt = min(1, max(0, (t - T_PRESW + .1) / .3))
    if kt > 0:
        g = Image.new('RGBA', (300, 40)); gd = ImageDraw.Draw(g)
        gd.rectangle((0, 0, 299, 39), fill=(236, 226, 196, 255), outline=(110, 90, 60, 255), width=2)
        s = 'PRESERVED SINCE 1998'; gd.text((150 - gd.textlength(s, font=F(18)) / 2, 9), s, font=F(18), fill=(70, 50, 30, 255))
        fr = comp(fr, fade(g, kt), W * .5 - 150, SHELF_Y + 2 - 10 * (1 - kt))
    if t >= T_OPEN:                                                          # the open cartridge jar pours out golden light
        cx, w, h = JARS['cart']
        ko = ease(min(1, (t - T_OPEN) / .4))
        fr = CART.glow(fr, cx, SHELF_Y - h - 20, int(260 * ko) + 1, (255, 214, 110), .75 * ko)
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        for i in range(7):
            a = -math.pi / 2 + (i - 3) * .22
            L = 380 * ko
            d.polygon(((cx - 30, SHELF_Y - h), (cx + 30, SHELF_Y - h), (cx + L * math.cos(a + .05), SHELF_Y - h + L * math.sin(a + .05)), (cx + L * math.cos(a - .05), SHELF_Y - h + L * math.sin(a - .05))),
                      fill=(255, 226, 140, int(70 * ko)))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(6))).convert('RGB')
    # O4: the fog curls out into a "?", the low-poly tree dreams of a castle
    if t >= T_UND:
        cx, w, h = JARS['fog']
        k = min(1, (t - T_UND) / 1.4)
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        for i in range(16):
            u = (k * 1.4 - i * .06)
            if u <= 0:
                continue
            u = min(1, u)
            x = cx + 30 * math.sin(i * 1.7 + t) + 120 * u * math.sin(i); y = SHELF_Y - h - 20 - 220 * u * (.4 + .6 * (i % 4) / 3)
            r = 30 + 40 * u
            d.ellipse((x - r, y - r * .7, x + r, y + r * .7), fill=(236, 240, 246, int(170 * (1 - .3 * u))))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(10))).convert('RGB')
        kq = min(1, max(0, (t - T_LIM + .3) / .5))
        if kq > 0 and t < Q_TRAVEL0:                                         # (then it travels to Pixie)
            d = ImageDraw.Draw(fr)
            qmark(d, Q_FROM[0], Q_FROM[1], Q_SIZE + 10 * math.sin(t * 3))
    if t >= T_MADE:
        cx, w, h = JARS['poly']
        k = ease(min(1, (t - T_MADE) / .8))
        ghost = sized(CASTLE, 120 * k + 1)
        a = np.asarray(ghost).astype(np.float32)
        a[..., :3] = a[..., :3] * .3 + np.array([200, 225, 255]) * .7; a[..., 3] *= .75
        ghost = Image.fromarray(a.astype(np.uint8))
        fr = CART.glow(fr, cx + 30, SHELF_Y - h - 110, int(160 * k) + 1, (200, 225, 255), .4 * k)
        fr = comp(fr, ghost, cx + 30 - ghost.width / 2, SHELF_Y - h - 30 - ghost.height)
        dd = ImageDraw.Draw(fr)
        for j in range(8):                                                   # sparkles rising from the polygons
            ph = ((t - T_MADE) * .8 + j / 8) % 1
            x, y = cx - 50 + j * 14, SHELF_Y - h * .5 - 200 * ph
            r = 5 * (1 - ph) + 1
            dd.line((x - r, y, x + r, y), fill=(255, 250, 210), width=2); dd.line((x, y - r, x, y + r), fill=(255, 250, 210), width=2)
    return fr


CASTLE = Image.open(ROOT / 'public/art/ep002/props3d/castle_far.png').convert('RGBA')


def camera(fr, t):
    """O1-O2 close on the sealed jar; O3 pulls back to the whole shelf."""
    kz = 1 - ease(min(1, max(0, (t - T_PRES) / 1.0)))
    z = 1 + .6 * kz
    if z <= 1.001:
        return fr
    cx, cy = W * .5, SHELF_Y - 120
    cw, ch = W / z, H / z
    x0 = min(max(cx - cw / 2, 0), W - cw); y0 = min(max(cy - ch * .55, 0), H - ch)
    return fr.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BILINEAR)


# ------------------------------------------------------------------ O5: someone feels it again
FOREST = BM.forest_frame(BM.T_DIST - .1, BM.T_DIST - .1)[0]


def forest(t):
    fr = FOREST.copy()
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)                      # drifting mist
    for i in range(14):
        x = (i * 140 + t * 30 * (1 + i % 3)) % (W + 300) - 150; y = H * (.35 + .05 * (i % 5))
        d.ellipse((x - 160, y - 50, x + 160, y + 50), fill=(235, 240, 246, 150))
    fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(18))).convert('RGB')
    p = sized(P2_AWE, H * .52)
    px, feet = W * .42, H * .95
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((px - p.width * .35, feet - 10, px + p.width * .35, feet + 8), fill=(0, 0, 0, 80))
    fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(5))).convert('RGB')
    fr = comp(fr, p, px - p.width / 2, feet - p.height)
    kq = 1.0 if t >= Q_TRAVEL1 else 0.0                                      # the "?" that travelled from the fog jar
    if kq > 0:                                                               # the same "?" - now over her
        glow = .3 + (.5 if t >= T_FEEL2 else 0) * min(1, (t - T_FEEL2) / .3) if t >= T_FEEL2 else .3
        fr = CART.glow(fr, px + 20, feet - p.height - 60, 90, (255, 255, 220), glow * kq)
        d = ImageDraw.Draw(fr)
        qmark(d, Q_TO[0], Q_TO[1], Q_SIZE + 10 * math.sin(t * 3))
    fr = hud.draw(fr, hearts=3.0, max_hearts=3, t=t)
    d = ImageDraw.Draw(fr)
    lab = 'MISSING · Pixie in her tunic, awe (#2d) · forest (#12) · planning stand-ins'
    tw = d.textlength(lab, font=F(13))
    d.rectangle((W * .03, H * .17, W * .03 + tw + 12, H * .17 + 20), fill=(150, 20, 30)); d.text((W * .03 + 6, H * .17 + 2), lab, font=F(13), fill=(255, 235, 235))
    return fr


# ------------------------------------------------------------------ render
N_LAST = None


def render(t):
    global N_LAST
    if t < T_AGAIN + .5:
        fr = camera(shelf(t), t)
        lab = ('O1 changing is not disrespecting' if t < T_REFUSE else 'O2 refusing to change would be' if t < T_PRES
               else 'O3 preserve every limitation' if t < T('l112') - .05 else 'O4 what they made you feel')
        if t < T0 + .6:                                                      # N's improvement: dissolve from the two eras
            if N_LAST is None:
                N_LAST = BN.n7(BN.T_END - .05)[0]
            fr = Image.blend(N_LAST, fr, ease((t - T0) / .6))
        if t > T_AGAIN - .2:                                                 # O5: the fog fills the frame...
            k = min(1, (t - T_AGAIN + .2) / .7)
            cx, w, h = JARS['fog']
            g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
            r = 60 + 1500 * ease(k)
            d.ellipse((cx - r, SHELF_Y - h - 100 - r * .8, cx + r, SHELF_Y - h - 100 + r * .8), fill=(238, 242, 248, 255))
            fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(40))).convert('RGB')
    else:
        fr = forest(t)                                                       # ...and clears on today's forest
        k = min(1, (t - T_AGAIN - .5) / .8)
        fr = Image.blend(Image.new('RGB', fr.size, (238, 242, 248)), fr, ease(k))
        lab = 'O5 make someone feel that again'
    if Q_TRAVEL0 <= t < Q_TRAVEL1:                                           # Producer improvement: the same "?" travels to her
        k = ease((t - Q_TRAVEL0) / (Q_TRAVEL1 - Q_TRAVEL0))
        x = lin(Q_FROM[0], Q_TO[0], k); y = lin(Q_FROM[1], Q_TO[1], k) - 60 * math.sin(math.pi * k)
        fr = CART.glow(fr, x, y + Q_SIZE * .5, 80, (255, 255, 230), .35)
        qmark(ImageDraw.Draw(fr), x, y, Q_SIZE + 10 * math.sin(t * 3))
    keys = [(T0, .40, .30), (T_PRES, .42, .26), (T_UND, .20, .30), (T_MADE, .34, .28), (T_AGAIN, .30, .30), (T_END, .62, .36)]
    fr = fairy_fx.draw(fr, keys, t, size=.04)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 21 PRESERVED · {lab} · BLOCK O v2 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('o0', T0 + .3), ('o1', T_NOTDIS + .3), ('o2', T_WOULD + .3), ('o3', T('l111.w11') + .3), ('o4a', T_LIM + .5), ('o4b', T_FEEL + .5), ('o4c', T_AGAIN - .25), ('o5q', T('l114') + .5),
          ('o5a', T_AGAIN + .3), ('o5', T_END - .3))


def main():
    out = ROOT / 'docs/ep002/EP002_blockO_animatic_v2.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockO_v2_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockO_v2_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
