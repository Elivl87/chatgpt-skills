#!/usr/bin/env python3
"""EP002 animatic, block N (planning only): l102 "You were a child." -> l108 "...across two distinct eras."
(block O starts on l109 "So maybe changing Ocarina of Time is not disrespecting it.").

Producer approved, 2026-10-04 ("Sí, constrúyelo así"). Place: inside the sword's temple (seen in 1998 in block L's case),
not Hyrule Field. Block I already used the SEVEN YEARS LATER caption and a field split CHILD | ADULT, so here the seven
years are told without text (a time-lapse in the empty temple) and the eras are the temple's own window.
  N1  "You were a child."                 Young Quest (tunic, from behind) before the pedestal, the sword in the stone.
  N2  "Then you were not."                The sword comes up a little out of the stone; on "not" a white flash: adult Quest
                                          stands in the same spot, the sword raised above the pedestal.
  N3  "You disappeared..."                He and the sword dissolve together into rising motes of light.
  N4  "...and the world changed without you."  The empty temple in time-lapse: the window light sweeps round and round,
                                          the sky outside goes from blue to a red storm, the village roofs fall to ruins,
                                          cobwebs grow, the walls crack, and by the pedestal a flower
                                          sprouts, blooms and withers (Producer: "sería un hit").
  N5  "That is not some side detail of Ocarina of Time."  The camera pulls out: the temple shrinks into the label of the
                                          golden cartridge; a sticky note "side detail?" is crossed out.
  N6  "That is the game."                 The cartridge pulses gold; a THE GAME stamp lands.
  N7  "Link's adventure is a journey through Hyrule across two distinct eras."  The temple again, split down the middle:
                                          CHILD (day window, young Quest, Navi bright) | ADULT (storm window, adult Quest
                                          with shield and sword on his back, Navi dim).
HUD: hidden (a story beat, not play). v8: final art #13 (the temple; our 3D sword v2 in its pedestal slot, the storm
seen through its windows), #3 young Quest and #4 adult Quest (3D shield + sword) from behind. Still a stand-in: adult
Quest with no gear right after he pulls the sword (N2-N3, Producer N v5). Sounds: none (all at the end).
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, W, H, FPS, T, ease, lin, final, final_plate, subtitle, tag, F  # noqa
import fairy as fairy_fx  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BL = load('blockL', 'scripts/ep002-blockL-animatic.py')          # helpers, the sword, the glow
CART = BL.CART
comp, sized, fade, ctext = BL.comp, BL.sized, BL.fade, BL.ctext

T0 = T('l102') - 0.05                   # block M ends here
T_NOT = T('l103.w4')                    # "not": the flash
T_GONE = T('l104') - .05
T_WORLD = T('l105') - .05
T_SIDE = T('l106') - .05
T_DETAIL = T('l106.w5')                 # "side detail"
T_GAME = T('l107') - .05
T_STAMP = T('l107.w4')                  # "game"
T_ERAS = T('l108') - .05
T_TWO = T('l108.w9')                    # "two"
T_END = T('l109') - 0.05                # block O starts on l109
INK = (20, 14, 18, 255)

YOUNG = final('quest_young_back')                                           # final art #3: young Quest in the tunic, from behind
ADULT = final('quest_adult_back')                                           # final art #4: adult Quest from behind, 3D shield + sword on his back
ADULT_PULL = YOUNG                # Producer (N v5): no gear on his back right after he pulls the sword (#4 has it baked in):
PULL_TAG = 'MISSING · adult Quest back, no gear (stand-in: #3 scaled)'   # until a gear-less adult back exists
QX, QFEET = W * .5, H * .93
YH, AH = H * .30, H * .44
SW_PLATE = 1280 / 1920                                                      # plate px -> frame px
SWORD = BL.SWD[12].transpose(Image.FLIP_TOP_BOTTOM)
SWORD = sized(SWORD.crop(SWORD.getchannel('A').getbbox()), int(BL.TEMPLE_SWORD_H * SW_PLATE))   # same size as in block L's picture
PED_X = BL.TEMPLE_SLOT[0] * SW_PLATE                                        # the slot on the pedestal of plate #13
PED_TOP = BL.TEMPLE_SLOT[1] * SW_PLATE                                      # (top of the pedestal: the blade goes in here)
TEMPLE_P = final_plate('temple').resize((W, H), Image.LANCZOS)              # final art #13 (with the crest banners)
_a = np.asarray(TEMPLE_P).astype(np.int16)
_yy = np.mgrid[0:H, 0:W][0]
_xx = np.mgrid[0:H, 0:W][1]
SKY = ((_a[..., 2] >= _a[..., 0] - 4) & (_a[..., 2] > 150) & (_yy < H * .44) & (_xx > W * .32) & (_xx < W * .69)).astype(np.uint8) * 255
SKY = Image.fromarray(SKY).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(2))   # the windows' sky (for the storm)


# ------------------------------------------------------------------ the temple, inside (final art #13)
def storm_sky(t):
    """What the windows show in the adult era: a red storm with lightning (the plate's day sky is the child's)."""
    a = np.zeros((H, W, 3), np.float32); yy = np.linspace(0, 1, H)[:, None, None]
    a[:] = np.array([60, 14, 26]) * (1 - yy * 2.2).clip(0, 1) + np.array([170, 60, 50]) * (yy * 2.2).clip(0, 1)
    im = Image.fromarray(a.clip(0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    if (t * 3.1) % 1 < .07:                                                 # lightning in the central window
        d.line((W * .52, H * .03, W * .48, H * .15, W * .51, H * .18, W * .47, H * .32), fill=(255, 240, 255), width=4)
    return im


def temple(t, storm=0.0, light_ang=0.0, age=0.0, sword=True, sword_rise=0.0, sword_a=1.0):
    im = TEMPLE_P.copy()
    if storm > 0:                                                           # the seven years: storm outside, the hall darkens
        st = storm_sky(t)
        im.paste(Image.blend(im, st, min(1, storm)), (0, 0), SKY)
        a = np.asarray(im).astype(np.float32)
        a = a * (1 - .45 * storm) + np.array([80, 40, 60]) * .45 * storm * .5
        im = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im, 'RGBA')
    if light_ang:                                                           # the window light swings round in the time-lapse
        lc = (255, 240, 205) if storm < .5 else (255, 120, 100)
        sx = W * .5 + math.sin(light_ang) * W * .25
        sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).polygon(((W * .47, H * .05), (W * .53, H * .05), (sx + 130, H * .62), (sx - 130, H * .62)), fill=lc + (int(60 * (1 - .4 * storm)),))
        im = Image.alpha_composite(im.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(12))).convert('RGB')
        d = ImageDraw.Draw(im, 'RGBA')
    if age > 0:                                                             # the years: cobwebs and cracks
        a = int(200 * age)
        for (cx, cy, sxn, syn) in ((W * .235, 0, 1, 1), (W * .765, 0, -1, 1)):
            for k in range(5):
                rr = 30 + 26 * k * age
                d.arc((cx - rr, cy - rr, cx + rr, cy + rr), 0 if sxn > 0 else 90, 90 if sxn > 0 else 180, fill=(235, 235, 240, a), width=2)
            for k in range(4):
                ang = math.pi / 2 * (k / 3) if sxn > 0 else math.pi / 2 + math.pi / 2 * (k / 3)
                d.line((cx, cy, cx + math.cos(ang) * 140 * age, cy + math.sin(ang) * 140 * age), fill=(235, 235, 240, a), width=2)
        r = np.random.default_rng(21)
        for (x, y) in ((W * .27, H * .16), (W * .62, H * .10), (W * .86, H * .30)):
            pts = [(x, y)]
            for s_ in range(5):
                x += (r.random() - .5) * 40; y += 26 * age
                pts.append((x, y))
            d.line(pts, fill=(50, 40, 50, a), width=3)
    im = CART.glow(im, PED_X, PED_TOP - 60, 140, (200, 230, 255) if storm < .5 else (255, 140, 120), .35)
    if sword and sword_a > 0:                                               # sword_rise: drawn up out of the stone (px)
        vis = int(SWORD.height * .78 + sword_rise)
        clip = Image.new('L', SWORD.size, 0); ImageDraw.Draw(clip).rectangle((0, 0, SWORD.width, vis), fill=255)
        s2 = SWORD.copy(); s2.putalpha(Image.fromarray(np.minimum(np.asarray(SWORD.getchannel('A')), np.asarray(clip))))
        if sword_rise > 0:
            im = CART.glow(im, PED_X, PED_TOP - 60 - sword_rise, 110, (220, 240, 255), min(.7, sword_rise / 40))
        im = comp(im, fade(s2, sword_a), PED_X - SWORD.width / 2, PED_TOP + 2 - vis)
    if storm > 0:
        im = Image.blend(im, Image.new('RGB', im.size, (60, 10, 20)), .15 * storm)
    return im


def quest(fr, h, a=1.0, x=QX, feet=QFEET, adult=False):
    q = sized(ADULT_PULL if adult == 'pull' else ADULT if adult else YOUNG, h)
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((x - q.width * .4, feet - 10, x + q.width * .4, feet + 8), fill=(0, 0, 0, int(80 * a)))
    fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(5))).convert('RGB')
    return comp(fr, fade(q, a), x - q.width / 2, feet - q.height)


RISE = 30                                                                   # how far the sword comes up out of the stone (px)
STEP0, STEP_D = T('l103') - .05, .45                                        # his step up to the pedestal


def flower(fr, k):
    """Producer improvement: by the pedestal a flower sprouts, blooms and withers - a clock for the seven years.
    v6 (Producer: "más pequeña y bonita"): smaller, two rings of soft petals, two leaves, a curved stem; drawn at 3x and
    scaled down for clean edges."""
    if k <= 0:
        return fr
    S = 3                                                                    # supersampling
    gw, gh = 90 * S, 120 * S
    g = Image.new('RGBA', (gw, gh)); d = ImageDraw.Draw(g)
    bx, by = gw * .5, gh - 6 * S                                             # root, in the sprite
    grow = ease(min(1, k / .35)); bloom = ease(min(1, max(0, (k - .25) / .25))); wilt = ease(min(1, max(0, (k - .62) / .38)))
    L = 64 * S * grow
    droop = 1.4 * wilt
    pts = [(bx, by)]
    for i in range(1, 11):                                                   # a gently curved stem that bends over as it dies
        u = i / 10
        a = -math.pi / 2 + .25 * math.sin(u * 2.4) + droop * u * u
        x, y = pts[-1]
        pts.append((x + L / 10 * math.cos(a), y + L / 10 * math.sin(a)))
    stem = tuple(int(lin(c0, c1, wilt)) for c0, c1 in zip((86, 160, 70), (130, 100, 56)))
    ink = (40, 30, 34, 255)
    if L > 2 * S:
        d.line(pts, fill=ink, width=5 * S, joint='curve'); d.line(pts, fill=stem + (255,), width=3 * S, joint='curve')
        for j, side in ((3, -1), (5, 1)):                                   # two little leaves
            lx, ly = pts[j]; sz = 11 * S * grow * (1 - .3 * wilt)
            leaf = [(lx, ly), (lx + side * sz * .6, ly - sz * .7), (lx + side * sz * 1.2, ly - sz * .2 + 8 * S * wilt), (lx + side * sz * .5, ly + sz * .15)]
            d.polygon(leaf, fill=stem + (255,), outline=ink, width=S)
    hx, hy = pts[-1]
    if bloom > 0:
        outer = tuple(int(lin(c0, c1, wilt)) for c0, c1 in zip((246, 128, 172), (150, 100, 80)))
        inner = tuple(int(lin(c0, c1, wilt)) for c0, c1 in zip((255, 196, 220), (170, 130, 100)))
        R = 9 * S * bloom * (1 - .25 * wilt)
        n = 8 - int(5 * wilt)                                                # petals fall as it withers
        for ring, (rr, col, off) in enumerate(((R, outer, 0.0), (R * .62, inner, math.pi / 8))):
            for j in range(n if ring == 0 else max(0, n - 2)):
                a = j * 2 * math.pi / 8 + off
                px, py = hx + math.cos(a) * rr, hy + math.sin(a) * rr * .85
                d.ellipse((px - rr * .62, py - rr * .5, px + rr * .62, py + rr * .5), fill=col + (255,), outline=ink, width=S)
        d.ellipse((hx - R * .32, hy - R * .32, hx + R * .32, hy + R * .32), fill=(252, 214, 96, 255), outline=ink, width=S)
        d.ellipse((hx - R * .12, hy - R * .2, hx + R * .04, hy - R * .05), fill=(255, 245, 200, 255))      # a little highlight
        for j in range(4 if wilt > .25 else 0):                              # fallen petals on the floor
            fx = bx + (j - 1.5) * 12 * S + 10 * S
            d.ellipse((fx - 5 * S, by - 3 * S, fx + 5 * S, by + 2 * S), fill=outer + (int(255 * min(1, wilt * 2)),), outline=ink, width=S)
    g = g.resize((gw // S, gh // S), Image.LANCZOS)
    return comp(fr, g, W * .40 - gw / S / 2, H * .585 - gh / S + 6)   # on the dais, by the pedestal


# ------------------------------------------------------------------ N1-N4
def n1_4(t):
    if t < T_NOT:                                                           # N1-N2: the child, the sword in the stone
        step = ease(min(1, max(0, (t - STEP0) / STEP_D)))                   # "then...": he steps up to it
        kr = ease(min(1, max(0, (t - STEP0 - STEP_D) / (T_NOT - STEP0 - STEP_D))))   # Producer: the sword comes up once he is there
        fr = temple(t, sword_rise=RISE * kr)
        fr = quest(fr, YH * (1 + .08 * step), feet=QFEET - 26 * step)
        lab = 'N1 you were a child' if t < T('l103') - .05 else 'N2 then you were not'
    elif t < T_WORLD:                                                       # N2-N3: the adult, then he disappears
        kd = min(1, max(0, (t - T('l104.w2')) / .7))                         # "disappeared"
        fr = temple(t, storm=0, sword=True, sword_rise=RISE, sword_a=1 - kd)   # ...and the sword goes with him, the same way
        fr = quest(fr, AH, a=1 - kd, adult='pull')                          # Producer: just pulled the sword - no gear on his back yet
        if kd < 1:
            d = ImageDraw.Draw(fr); tw = d.textlength(PULL_TAG, font=F(13))
            d.rectangle((QX - tw / 2 - 6, QFEET - AH - 28, QX + tw / 2 + 6, QFEET - AH - 8), fill=(150, 20, 30)); d.text((QX - tw / 2, QFEET - AH - 26), PULL_TAG, font=F(13), fill=(255, 235, 235))
        if kd > 0:                                                          # motes of light rise from him and from the sword
            g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
            r = np.random.default_rng(8)
            sw_top, sw_bot = PED_TOP - SWORD.height * .78 - RISE, PED_TOP
            for i in range(64):
                if i < 40:
                    x = QX + (r.random() - .5) * 120; y0 = QFEET - r.random() * AH
                else:
                    x = QX + (r.random() - .5) * 40; y0 = lin(sw_top, sw_bot, r.random())
                y = y0 - 140 * kd * (.5 + r.random()); s = 2 + 3 * r.random()
                d.ellipse((x - s, y - s, x + s, y + s), fill=(255, 250, 210, int(230 * (1 - kd ** 2))))
            fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(1))).convert('RGB')
        f = max(0, 1 - (t - T_NOT) / .45)                                   # the white flash on "not"
        if f > 0:
            fr = Image.blend(fr, Image.new('RGB', fr.size, (255, 255, 255)), .9 * f)
        lab = 'N2 then you were not' if t < T_GONE else 'N3 you disappeared...'
    else:                                                                   # N4: the empty temple, seven years in time-lapse
        k = min(1, (t - T_WORLD) / (T_SIDE - T_WORLD - .1))
        e = ease(k)
        fr = temple(t, storm=e, light_ang=k * 6 * math.pi, age=e, sword=False)
        flick = .12 * abs(math.sin(k * 6 * math.pi))                        # day / night flickering by
        fr = Image.blend(fr, Image.new('RGB', fr.size, (10, 10, 30)), flick)
        fr = flower(fr, k)
        lab = 'N4 the world changed without you'
    return push(fr, t), lab


def push(fr, t):
    """Producer improvement 2: a gentle push in on the pedestal through N1, held through N2-N3, easing back out over
    the start of the time-lapse (one continuous camera, never a snap)."""
    if t < T_NOT:
        z = 1 + .12 * ease(min(1, max(0, (t - T0) / (T_NOT - T0))))
    elif t < T_WORLD:
        z = 1.12
    else:
        z = 1 + .12 * (1 - ease(min(1, (t - T_WORLD) / 1.6)))
    if z < 1.001:
        return fr
    cx, cy = PED_X, PED_TOP - 60
    w, h = W / z, H / z
    x0 = min(max(cx - w / 2, 0), W - w); y0 = min(max(cy - h * .55, 0), H - h)
    return fr.crop((int(x0), int(y0), int(x0 + w), int(y0 + h))).resize((W, H), Image.BICUBIC)


# ------------------------------------------------------------------ N5-N6: the cartridge
CARTRIDGE = Image.open(ROOT / 'public/art/ep002/props3d/cart_spin/f000.png').convert('RGBA')
CARTRIDGE = CARTRIDGE.crop(CARTRIDGE.getchannel('A').getbbox())
LABEL = (.17, .31, .92, .87)                                                # the label area on the cartridge (fractions)


def n5_6(t):
    k = ease(min(1, (t - T_SIDE) / 1.2))
    temple_now = temple(T_SIDE, storm=1, age=1, sword=False)
    cs = lin(W * 2.9, 520, k)                                               # the cartridge comes in from the label outwards
    cart = CARTRIDGE.resize((int(cs), int(cs * CARTRIDGE.height / CARTRIDGE.width)), Image.LANCZOS)
    cx, cy = W * .5, H * .44
    lx0, ly0 = cx - cart.width / 2 + cart.width * LABEL[0], cy - cart.height / 2 + cart.height * LABEL[1]
    lw, lh = cart.width * (LABEL[2] - LABEL[0]), cart.height * (LABEL[3] - LABEL[1])
    fr = Image.new('RGB', (W, H), (16, 14, 22))
    fr = CART.glow(fr, cx, cy, int(420 * k) + 1, (255, 215, 120), .35 * k)
    fr = comp(fr, cart, cx - cart.width / 2, cy - cart.height / 2)
    tl = temple_now.resize((max(1, int(lw)), max(1, int(lh))), Image.BILINEAR)   # the temple is the label's picture
    fr.paste(tl, (int(lx0), int(ly0)))
    if t >= T_DETAIL - .1 and t < T_GAME + .3:                              # the sticky note: "side detail?" crossed out
        ka = min(1, (t - T_DETAIL + .1) / .25) * (1 - min(1, max(0, (t - T_GAME) / .3)))
        g = Image.new('RGBA', (230, 90)); gd = ImageDraw.Draw(g)
        gd.rectangle((0, 0, 229, 89), fill=(255, 236, 120, 255), outline=(170, 140, 40, 255), width=2)
        gd.text((14, 26), 'side detail?', font=F(25), fill=(60, 50, 30, 255))
        kx = min(1, max(0, (t - T('l106.w6') - .2) / .3))                    # struck through after "detail"
        if kx > 0:
            gd.line((10, 46, 10 + 210 * kx, 40), fill=(210, 30, 40, 255), width=6)
        g = g.rotate(-7, resample=Image.BICUBIC, expand=True)
        fr = comp(fr, fade(g, ka), cx + 160, cy + 120)
    lab = 'N5 not some side detail'
    if t >= T_GAME:
        kp = (t - T_GAME)
        fr = CART.glow(fr, cx, cy, 380, (255, 225, 140), .35 + .25 * math.sin(kp * 7))
        ks = min(1, max(0, (t - T_STAMP + .1) / .2))
        if ks > 0:                                                          # THE GAME stamp lands
            st = Image.new('RGBA', (420, 110)); sd = ImageDraw.Draw(st)
            sd.rounded_rectangle((4, 4, 415, 105), 12, outline=(232, 196, 90, 255), width=7, fill=(20, 18, 28, 220))
            s = 'THE GAME'; sd.text((210 - sd.textlength(s, font=F(64)) / 2, 14), s, font=F(64), fill=(255, 226, 140, 255))
            st = st.rotate(-4, resample=Image.BICUBIC, expand=True)
            sc = 1.7 - .7 * ease(ks)
            st = st.resize((int(st.width * sc), int(st.height * sc)), Image.LANCZOS)
            fr = comp(fr, fade(st, ks), cx - st.width / 2, cy + 150 - st.height / 2)
        lab = 'N6 that is the game'
    return fr, lab


# ------------------------------------------------------------------ N7: two eras
def n7(t):
    k = ease(min(1, (t - T_ERAS) / .45))
    child = quest(temple(t, storm=0, sword=True), YH, x=W * .5)          # no flower here (Producer: it only marked the time passing)
    adult = quest(temple(t, storm=1, age=1, sword=False), AH, x=W * .5, adult=True)
    tw = t - T_ERAS                                                         # Producer: Navi in both: bright as a child, dim as an adult
    child = fairy_fx.draw(child, [(0, .62, .36), (6, .64, .33)], tw, size=.045)
    adult = fairy_fx.draw(adult, [(0, .64, .40), (6, .62, .42)], tw, size=.035, color=(120, 130, 150), glow=.3, opacity=.55)
    half = W // 2
    fr = Image.new('RGB', (W, H))
    fr.paste(child.crop((W // 4, 0, W, H)), (0, 0))                        # the child's temple fills the frame until the adult slides in
    sl = int(lin(W, half, k))                                               # the adult era slides in from the right
    fr.paste(adult.crop((W // 4, 0, W // 4 + half, H)), (sl, 0))
    d = ImageDraw.Draw(fr)
    d.line((sl, 0, sl, H), fill=(255, 255, 255), width=4)
    for cx, s, gold, tk in ((W * .25, 'CHILD', True, T_TWO), (W * .75, 'ADULT', False, T('l108.w10'))):
        ka = min(1, max(0, (t - tk + .1) / .25))
        if ka <= 0:
            continue
        g = Image.new('RGBA', (220, 60)); gd = ImageDraw.Draw(g)
        gd.rounded_rectangle((2, 2, 217, 57), 10, fill=(20, 22, 30, 235), outline=((232, 196, 90) if gold else (200, 80, 90)) + (255,), width=3)
        ctext(gd, 110, 12, s, 30, ((255, 230, 160) if gold else (255, 190, 190)) + (255,))
        sc = 1.25 - .25 * ease(ka)
        g = g.resize((int(220 * sc), int(60 * sc)), Image.LANCZOS)
        fr = comp(fr, fade(g, ka), cx - g.width / 2, H * .12)
    return fr, 'N7 two distinct eras'


def render(t):
    if t < T_SIDE:
        fr, lab = n1_4(t)
        if t < T0 + .35:                                                    # in from block M's night
            fr = Image.blend(Image.new('RGB', fr.size, (10, 14, 40)), fr, (t - T0) / .35)
    elif t < T_ERAS:
        fr, lab = n5_6(t)
    else:
        fr, lab = n7(t)
        if t < T_ERAS + .3:
            fr = Image.blend(Image.new('RGB', fr.size, (255, 236, 170)), fr, (t - T_ERAS) / .3)
    keys = [(T0, .66, .30), (T_NOT, .60, .36), (T_WORLD, .30, .24), (T_SIDE - .1, .26, .22), (T_SIDE, .20, .30), (T_ERAS, .22, .30), (T_END, .78, .30)]
    if t < T_ERAS:                                                          # N7 draws its own two Navis
        fr = fairy_fx.draw(fr, keys, t, size=.04)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 20 TIME MATTERED · {lab} · BLOCK N v8 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('n1', T('l102.w4') + .2), ('n1b', T_NOT - .1), ('n2', T_NOT + .6), ('n3', T('l104.w2') + .35), ('n4a', T('l105.w3')), ('n4', T('l105.w5')), ('n4b', T_SIDE - .3),
          ('n5', T('l106.w6') + .6), ('n6', T_STAMP + .4), ('n7', T_END - .3))


def main():
    out = ROOT / 'docs/ep002/EP002_blockN_animatic_v9.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockN_v8_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockN_v8_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
