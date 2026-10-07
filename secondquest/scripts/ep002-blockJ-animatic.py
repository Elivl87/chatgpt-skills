#!/usr/bin/env python3
"""EP002 animatic, block J (planning only): l71 "Player two?" -> l77 "No twenty-eight years of expectations."
(block K starts on l78 "So the remake has two completely different jobs.").

Same game-menu language as block I (the new player's side now):
  J1  "Player two? Player two knows none of this."    The NEW PLAYER card lights up; FILE 2 opens: 3 hearts, 000:00,
                                                      three empty item slots with "?", 0%.
  J2  "They meet the Great Deku Tree and think: That is an extremely large tree with an extremely personal problem."
                                                      The giant old tree with a kind face (final art #14); the new player
                                                      (#2d, tunic), tiny on the open ground, looks up in awe (new-player HUD:
                                                      3 hearts, 0 rupees). On "personal problem" the tree looks unwell
                                                      (a thermometer, a spider's shadow, sweat drops) and she tilts her
                                                      head (#2e, hand at the chin): "?".
  J3  "For them, Hyrule has no nostalgia. No childhood attached to it. No twenty-eight years of expectations."
                                                      A side-by-side sheet, VETERAN | NEW PLAYER, one row per line:
                                                      NOSTALGIA (the heart bar from block F: full | empty), CHILDHOOD
                                                      (the "Saturday, 1998" photo | a blank photo), EXPECTATIONS
                                                      (28 YEARS, heavy | 0).
v7: final art (#2c, #2d, #2e Pixie in her tunic; #14 the tree). HUD: on in the forest only. Sounds: none (all sounds at the end, Producer). Framing QC before sending.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, final, final_plate, subtitle, tag, F, S, Si, P, U, out_path, video_args, audio_args  # noqa
import fairy as fairy_fx  # noqa
import ui_kit as UI  # noqa: the approved on-screen text style (2026-10-06)
import hud  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BI = load('blockI', 'scripts/ep002-blockI-animatic.py')          # menus, cards, panel style, the veteran
HB, G, CART = BI.HB, BI.G, BI.CART
comp, sized, fade, panel, ctext = BI.comp, BI.sized, BI.fade, BI.panel, BI.ctext

T0 = T('l71') - 0.05                    # block I ends here
T_NONE = T('l72') - .05
T_TREE = T('l73') - .05
T_LARGE = T('l74.w5')
T_PROB = T('l74.w10')                   # "personal problem"
T_NOST = T('l75') - .05
T_NOST_W = T('l75.w6')
T_CHILD = T('l76') - .05
T_EXP = T('l77') - .05
T_END = T('l78') - 0.05                 # block K starts on l78
INK = (20, 14, 18, 255)
GOLD, BLUE = (232, 196, 90), (120, 200, 255)
P2 = BI.P2
P2_T = final('pixie_tunic_wave')                                      # final art #2c: Pixie in her hero tunic, waving
BI.FACE[id(P2_T)] = .135                                               # its face width (fraction of the art's height), as #2a in block I's cards
P2_AWE = final('pixie_tunic_awe')                                     # #2d: looking up in awe
P2_HMM = final('pixie_tunic_think')                                   # #2e: hand at the chin
PIX_TAG = ''                                                          # (was the MISSING tag of the recoloured stand-in)
P1 = final('quest_veteran')                                           # final art #1: veteran Quest in his tunic (was block I's recolour)


# ------------------------------------------------------------------ J1: the new player's file
def new_file(fr, t, a):
    g = panel(560, 410, a, outline=BLUE + (255,)); d = ImageDraw.Draw(g)
    d.text((S(30), S(20)), 'FILE 2 · NEW PLAYER', font=F(28), fill=BLUE + (int(255 * a),))
    for i in range(3):                                                    # 3 hearts: a brand-new file
        hud._heart(d, S(46 + i * 34), S(82), S(11), (232, 44, 52, int(255 * a)))
    d.text((S(30), S(140)), 'TIME  000:00', font=F(26), fill=(230, 230, 245, int(255 * a)))
    out = comp(fr, g, W * .5 - S(120), H * .1)
    d2 = ImageDraw.Draw(out, 'RGBA')
    for i, sx in enumerate(BI.SLOT_X):                                    # three empty slots, a "?" in each
        d2.rounded_rectangle((sx - S(52), BI.SLOT_Y - S(52), sx + S(52), BI.SLOT_Y + S(52)), S(14), fill=(30, 36, 80, int(230 * a)), outline=(235, 235, 250, int(255 * a)), width=Si(3))
        k = min(1, max(0, (t - T('l72.w4') - .12 * i) / .25))             # "none": the "?" pop in, one by one
        if k > 0:
            ctext(d2, sx, BI.SLOT_Y - S(30) - S(8) * (1 - k), '?', int(52 + 10 * (1 - k)), (150, 160, 200, int(255 * a * k)))
    d2.text((S(800), S(404)), '0%', font=F(40), fill=(150, 160, 200, int(255 * a)))
    return out


def frame_j1(t):
    fr = BI.MENU_BG.copy()
    k = ease(min(1, (t - T0) / .45))                                      # the waiting card grows into the NEW PLAYER card
    if t < T0 + .2:
        fr = Image.blend(BI.eras_shot(T0), fr, (t - T0) / .2)
    suited = t >= T_NONE - .15                                           # FILE 2 opens = she starts playing: the tunic
    c = BI.card(P2_T if suited else P2, 'NEW PLAYER', BLUE, alpha=1, pixie=True, missing=PIX_TAG if suited else '')
    s = lin(.38, 1, k)
    c = c.resize((int(c.width * s), int(c.height * s)), Image.LANCZOS)
    x = lin(W - S(64 + 120), W * .07, k); y = lin(S(44), H * .12, k)
    fr = CART.glow(fr, x + c.width / 2, y + c.height / 2, int(S(260) * k) + 1, BLUE, .25 * k)
    fr = comp(fr, c, x, y)
    if T_NONE - .15 <= t < T_NONE + .35:                                  # a flash as the new game starts
        f = 1 - (t - T_NONE + .15) / .5
        fr = CART.glow(fr, x + c.width / 2, y + c.height / 2, S(240), (255, 255, 240), .8 * f)
    if t < T_NONE:                                                        # "Player two?"
        d = ImageDraw.Draw(fr)
        kq = min(1, max(0, (t - T('l71.w2')) / .25))
        if kq > 0:
            d.text((W * .07 + S(250), H * .12 + S(40)), '?', font=F(int(60 + 20 * (1 - kq))), fill=BLUE, stroke_width=Si(5), stroke_fill=(20, 14, 18))
    fa = ease(min(1, max(0, (t - T_NONE + .15) / .4)))
    if fa > 0:
        fr = new_file(fr, t, fa)
    return fr, 'J1 player two? knows none of this'


# ------------------------------------------------------------------ J2: the giant tree
TREE = final_plate('tree').resize((W, H), Image.LANCZOS)                 # final art #14: the giant tree with a kind face
FACE = (W * .65, H * .17)                                              # its face (eyes), frame px of the plate
PX, PFEET, PHH = W * .24, H * .88, H * .40                             # Pixie on the open ground, lower left (tiny next to it)
_m = Image.new('L', (W, H), 0)
ImageDraw.Draw(_m).polygon([(W * .44, 0), (W, 0), (W, H * .82), (W * .30, H * .78), (W * .42, H * .55), (W * .47, H * .25)], fill=255)
TREE_MASK = _m.filter(ImageFilter.GaussianBlur(S(30)))                    # roughly the trunk and the face (for the "unwell" tint)


# The "unwell" gag props, drawn in-house in the toon style (supersampled fill + ink outline; Producer, 2026-10-07:
# the old thermometer read as a cigarette and the spider was a blob). Each is built once at design size x4, then sized.
_GAG = {}
_X4 = 4                                                                 # supersampling: sprite px per design px


def _ink_shape(mask, fill, outline=_X4 * 3):
    """A flat toon shape: `fill` (RGBA or an RGBA image) inside the mask, an ink outline around it."""
    out = Image.new('RGBA', mask.size, INK[:3] + (0,))
    out.putalpha(mask.filter(ImageFilter.MaxFilter(outline * 2 + 1)))
    f = fill if isinstance(fill, Image.Image) else Image.new('RGBA', mask.size, fill)
    f = f.copy(); f.putalpha(Image.fromarray(np.minimum(np.asarray(f.getchannel('A')), np.asarray(mask))))
    return Image.alpha_composite(out, f)


def _sized(g, w_design):
    return g.resize((Si(w_design), max(1, round(Si(w_design) * g.height / g.width))), Image.LANCZOS)


def _thermometer(level):
    """A glass clinical thermometer, bulb end cut flat (it sits in the mouth), red column at `level` (0-1), scale
    ticks. Horizontal, mouth end on the left. Design size 170 x 40."""
    q = round(level * 20) / 20
    if ('th', q) not in _GAG:
        X = _X4; w, h = 170 * X, 40 * X
        m = Image.new('L', (w, h)); md = ImageDraw.Draw(m)
        md.rounded_rectangle((-40 * X, 12 * X, w - 6 * X, 28 * X), 8 * X, fill=255)    # the tube; its left end runs off the sprite
        glass = Image.new('RGBA', (w, h), (226, 240, 252, 235))
        g = _ink_shape(m, glass)
        d = ImageDraw.Draw(g)
        d.rounded_rectangle((0, 17 * X, max(6 * X, (8 + 136 * q) * X), 23 * X), 3 * X, fill=(222, 38, 44, 255))   # the red column
        for i in range(15):                                             # the scale, printed on the glass
            x = (40 + i * 8.5) * X
            d.line((x, 12 * X + 4, x, (17 if i % 5 else 19) * X), fill=INK[:3] + (200,), width=max(2, X // 2 + 1))
        d.line((14 * X, 14.5 * X, (w - 16 * X), 14.5 * X), fill=(255, 255, 255, 230), width=X + 2)   # the glint
        _GAG[('th', q)] = _sized(g, 170)
    return _GAG[('th', q)]


def _spider(t):
    """A cartoon spider: round plum body, big eyes looking up at the tree, eight bent legs that wiggle. Design 110 x 100."""
    X = _X4; w, h = 110 * X, 100 * X
    legs = Image.new('RGBA', (w, h))
    ld = ImageDraw.Draw(legs)
    cx, cy = w / 2, 52 * X
    for side in (-1, 1):
        for j in range(4):
            wig = 5 * X * math.sin(t * 14 + j * 1.3 + side)
            a0 = math.radians(-50 + j * 30)
            kx, ky = cx + side * 34 * X * math.cos(a0), cy - 22 * X + j * 12 * X + wig * .4      # the knee, up and out
            fx, fy = cx + side * (48 + j * 2) * X, cy + (6 + j * 11) * X + wig                    # the foot, down
            pts = [(cx + side * 12 * X, cy - 4 * X + j * 6 * X), (kx, ky), (fx, fy)]
            ld.line(pts, fill=INK, width=7 * X, joint='curve')
            ld.line(pts, fill=(84, 58, 96, 255), width=3 * X, joint='curve')
    m = Image.new('L', (w, h)); md = ImageDraw.Draw(m)
    md.ellipse((cx - 26 * X, cy - 30 * X, cx + 26 * X, cy + 20 * X), fill=255)                    # abdomen
    md.ellipse((cx - 19 * X, cy + 4 * X, cx + 19 * X, cy + 36 * X), fill=255)                     # head
    ys = np.linspace(0, 1, h)[:, None, None]
    grad = (np.array((112, 78, 128))[None, None] * (1 - ys) + np.array((58, 38, 70))[None, None] * ys).repeat(w, 1)
    body = Image.fromarray(np.concatenate([grad, np.full((h, w, 1), 255)], 2).astype(np.uint8), 'RGBA')
    g = Image.alpha_composite(legs, _ink_shape(m, body))
    d = ImageDraw.Draw(g)
    d.ellipse((cx - 14 * X, cy - 24 * X, cx - 2 * X, cy - 14 * X), fill=(200, 170, 215, 160))   # body sheen
    for ex in (-9, 9):                                                  # big eyes, looking up-right at the tree's face
        d.ellipse((cx + (ex - 9) * X, cy + 6 * X, cx + (ex + 9) * X, cy + 26 * X), fill=(255, 255, 255, 255), outline=INK, width=X * 2)
        d.ellipse((cx + (ex - 1) * X, cy + 8 * X, cx + (ex + 7) * X, cy + 18 * X), fill=INK)
        d.ellipse((cx + (ex + 1) * X, cy + 9 * X, cx + (ex + 4) * X, cy + 12 * X), fill=(255, 255, 255, 255))
    d.arc((cx - 6 * X, cy + 24 * X, cx + 6 * X, cy + 32 * X), 20, 160, fill=INK, width=X * 2)       # a nervous little smile
    return _sized(g, 110)


def _icebag():
    """A cartoon ice bag: a puffy pale-blue pouch with ice lumps showing through and a red screw cap. Design 150 x 96."""
    if 'ice' not in _GAG:
        X = _X4; w, h = 150 * X, 96 * X
        m = Image.new('L', (w, h)); md = ImageDraw.Draw(m)
        md.ellipse((24 * X, 22 * X, 146 * X, 92 * X), fill=255)                                   # the pouch
        for bx, by, br in ((50, 30, 22), (82, 26, 24), (114, 32, 22), (130, 58, 16)):              # lumpy top (ice inside)
            md.ellipse(((bx - br) * X, (by - br) * X, (bx + br) * X, (by + br) * X), fill=255)
        md.polygon([(8 * X, 40 * X), (32 * X, 34 * X), (34 * X, 70 * X), (8 * X, 62 * X)], fill=255)   # the neck
        ys = np.linspace(0, 1, h)[:, None, None]
        grad = (np.array((176, 222, 250))[None, None] * (1 - ys) + np.array((92, 156, 224))[None, None] * ys).repeat(w, 1)
        pouch = Image.fromarray(np.concatenate([grad, np.full((h, w, 1), 255)], 2).astype(np.uint8), 'RGBA')
        g = _ink_shape(m, pouch)
        d = ImageDraw.Draw(g)
        for bx, by in ((54, 44), (84, 40), (112, 48), (76, 66)):                                  # cubes showing through
            d.rounded_rectangle(((bx - 11) * X, (by - 9) * X, (bx + 11) * X, (by + 9) * X), 4 * X, fill=(232, 246, 255, 150), outline=(70, 120, 190, 170), width=X)
        d.arc((44 * X, 30 * X, 126 * X, 84 * X), 200, 250, fill=(255, 255, 255, 220), width=3 * X)   # sheen
        cm = Image.new('L', (w, h)); ImageDraw.Draw(cm).rounded_rectangle((0, 34 * X, 16 * X, 68 * X), 4 * X, fill=255)
        cap = _ink_shape(cm, (214, 52, 52, 255))
        ImageDraw.Draw(cap).line((5 * X, 38 * X, 5 * X, 64 * X), fill=(255, 150, 150, 220), width=2 * X)
        g = Image.alpha_composite(g, cap)
        _GAG['ice'] = _sized(g, 150)
    return _GAG['ice']


def _place(g, im, cx, cy, ang=0.0, alpha=1.0):
    """Paste `im` centred on (cx, cy), rotated by `ang` degrees (counter-clockwise), faded by `alpha`."""
    if ang:
        im = im.rotate(ang, resample=Image.BICUBIC, expand=True)
    if alpha < 1:
        im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * max(0, alpha))))
    g.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))


SPIDER_MODE = 'thread'      # 'thread' (v8: drops on its thread) · 'moustache' (a small one crawls on the moustache) · 'web' (in a cobweb)
ICE_MODE = 'bag'            # 'bag' (v8: pale-blue rubber bag) · 'plaid' (classic plaid cloth ice bag, silver cap) · 'towel' (wet towel)


def _icebag_plaid():
    """The classic cartoon ice bag: a round cloth bag in red-and-white plaid, a silver screw cap on top. Design 150 x 100."""
    if 'plaid' not in _GAG:
        X = _X4; w, h = 150 * X, 100 * X
        m = Image.new('L', (w, h)); md = ImageDraw.Draw(m)
        md.ellipse((8 * X, 30 * X, 142 * X, 96 * X), fill=255)                                     # the bag, lying flat
        md.polygon([(58 * X, 36 * X), (66 * X, 20 * X), (84 * X, 20 * X), (92 * X, 36 * X)], fill=255)   # its gathered neck
        cloth = Image.new('RGBA', (w, h), (248, 244, 238, 255)); cd = ImageDraw.Draw(cloth, 'RGBA')
        for i in range(0, w, 30 * X):                                                              # plaid: crossing red bands
            cd.rectangle((i, 0, i + 9 * X, h), fill=(220, 50, 56, 110))
        for j in range(0, h, 30 * X):
            cd.rectangle((0, j, w, j + 9 * X), fill=(220, 50, 56, 110))
        ys = np.linspace(0, 1, h)[:, None, None]
        shade = Image.fromarray(np.concatenate([np.zeros((h, w, 3)), (ys ** 2 * 45).repeat(w, 1)], 2).astype(np.uint8), 'RGBA')
        cloth.alpha_composite(shade)
        g = _ink_shape(m, cloth)
        d = ImageDraw.Draw(g)
        d.arc((30 * X, 44 * X, 120 * X, 90 * X), 200, 260, fill=(255, 255, 255, 200), width=3 * X)       # sheen
        cm = Image.new('L', (w, h)); ImageDraw.Draw(cm).rounded_rectangle((62 * X, 2 * X, 88 * X, 22 * X), 4 * X, fill=255)
        cap = _ink_shape(cm, (196, 202, 214, 255)); cdd = ImageDraw.Draw(cap)
        for k in range(4):                                                                          # the cap's ridges
            x = (66 + 6 * k) * X; cdd.line((x, 5 * X, x, 19 * X), fill=(120, 126, 140, 255), width=X)
        cdd.line((64 * X, 6 * X, 86 * X, 6 * X), fill=(255, 255, 255, 220), width=X)
        g = Image.alpha_composite(g, cap)
        _GAG['plaid'] = _sized(g, 150)
    return _GAG['plaid']


def _towel():
    """A folded wet towel across the brow: white with two blue stripes, a soft sag, a wet shine. Design 170 x 56."""
    if 'towel' not in _GAG:
        X = _X4; w, h = 170 * X, 56 * X
        m = Image.new('L', (w, h)); md = ImageDraw.Draw(m)
        top = [(8 * X + i * X, 10 * X + 5 * X * math.sin(i / 160 * math.pi)) for i in range(0, 155, 5)]
        bot = [(8 * X + i * X, 40 * X + 9 * X * math.sin(i / 160 * math.pi)) for i in range(150, -5, -5)]
        md.polygon(top + bot, fill=255)
        cloth = Image.new('RGBA', (w, h), (246, 248, 252, 255)); cd = ImageDraw.Draw(cloth)
        for x0 in (26, 132):                                                                        # the stripes near each end
            cd.rectangle((x0 * X, 0, (x0 + 8) * X, h), fill=(70, 130, 210, 255)); cd.rectangle(((x0 + 11) * X, 0, (x0 + 14) * X, h), fill=(70, 130, 210, 255))
        g = _ink_shape(m, cloth)
        d = ImageDraw.Draw(g)
        d.line([(30 * X + i * X, 18 * X + 5 * X * math.sin((i + 22) / 160 * math.pi)) for i in range(0, 90, 5)], fill=(255, 255, 255, 230), width=3 * X)
        for i in range(0, 150, 18):                                                                 # the fold's soft creases
            d.line(((14 + i) * X, 30 * X, (20 + i) * X, 44 * X), fill=(200, 208, 222, 200), width=X)
        _GAG['towel'] = _sized(g, 170)
    return _GAG['towel']


def _cobweb(g, cx, cy, r, a, t):
    """A cobweb hung between the moustache and the bark: radial threads and a spiral, catching the light."""
    lay = Image.new('RGBA', g.size); d = ImageDraw.Draw(lay)
    angs = [math.radians(v) for v in (-150, -105, -60, -15, 30, 80, 125, 170)]
    ends = [(cx + r * math.cos(q) * (1 + .12 * math.sin(i * 2.1)), cy + r * math.sin(q) * (1 + .12 * math.sin(i * 2.1))) for i, q in enumerate(angs)]
    col = (240, 244, 255, int(a * .85))
    for ex, ey in ends:
        d.line((cx, cy, ex, ey), fill=col, width=max(1, Si(2)))
    for ring in range(1, 6):
        f = ring / 6
        pts = [(cx + (ex - cx) * f, cy + (ey - cy) * f + S(3) * f) for ex, ey in ends]
        d.line(pts + [pts[0]], fill=col, width=max(1, Si(1.5)))
    g.alpha_composite(lay)


def sick_fx(g, t, sick):
    """On "personal problem" the tree looks unwell: a purple tinge, a glass thermometer in its mouth (the column
    climbs, a red "!"), an ice bag plopped on its brow, a cartoon spider dropping on its thread, sweat drops."""
    tint = Image.new('RGBA', (W, H), (110, 60, 150, 0))
    tint.putalpha(TREE_MASK.point(lambda v: int(v * .30 * sick)))
    g = Image.alpha_composite(g.convert('RGBA'), tint)
    d = ImageDraw.Draw(g)
    a = int(255 * sick)
    tt = t - T_PROB + .1                                                 # the gag's own clock
    # the thermometer: in the mouth under the moustache, sticking out and down; the column climbs
    mx, my = W * .618, H * .335
    d.ellipse((mx - S(16), my - S(9), mx + S(16), my + S(9)), fill=(48, 22, 26, a))           # the mouth it sits in
    kt = ease(min(1, max(0, tt / .3)))
    level = .25 + .7 * ease(min(1, max(0, (tt - .2) / .6)))
    th = _thermometer(level)
    ang = -13                                                            # tilted down and out, under the moustache
    off = (th.width / 2) * (1 - .25 * (1 - kt))                           # slides out of the mouth
    cx, cy = mx + off * math.cos(math.radians(ang)), my - off * math.sin(math.radians(ang))
    _place(g, th, cx, cy, ang, sick * kt)
    d.arc((mx - S(16), my - S(9), mx + S(16), my + S(9)), 0, 180, fill=(48, 22, 26, a), width=Si(6))   # lower lip over the tube
    tip = (mx + th.width * math.cos(math.radians(ang)), my - th.width * math.sin(math.radians(ang)))
    kx = min(1, max(0, (tt - .6) / .2))                                   # the reading tops out: "!"
    if kx > 0:
        sc = 1 + .4 * (1 - kx) + .06 * math.sin(t * 18)
        d.text((tip[0] + S(14), tip[1] - S(44)), '!', font=F(int(46 * sc)), fill=(232, 44, 44, int(a * kx)), stroke_width=Si(4), stroke_fill=INK[:3] + (int(a * kx),), anchor='mm')
        for j in range(3):                                               # heat wiggles off the tip
            x0 = tip[0] - S(18) + S(16) * j; y0 = tip[1] - S(14)
            pts = [(x0 + S(4) * math.sin(t * 9 + j + i * 1.6), y0 - S(6) * i) for i in range(5)]
            d.line(pts, fill=(255, 120, 90, int(a * kx * .8)), width=Si(3))
    # the ice bag: plops onto the brow, squashes, settles
    ki = min(1, max(0, (tt - .15) / .3))
    if ki > 0:
        ice = {'bag': _icebag, 'plaid': _icebag_plaid, 'towel': _towel}[ICE_MODE]()
        drop = (1 - ease(ki)) * S(150)
        sq = 1 - .14 * math.sin(math.pi * min(1, max(0, (tt - .45) / .25)))
        ice2 = ice.resize((max(1, int(ice.width * (2 - sq))), max(1, int(ice.height * sq))), Image.LANCZOS)
        _place(g, ice2, W * .578, H * .09 - drop + ice.height * (1 - sq) / 2, -6, sick)
        for j in range(2):                                               # meltwater drips off it
            dy = ((t * 1.1 + j * .5) % 1) * S(46)
            x = W * .545 + S(j * 62); y = H * .15 + dy
            aa = int(a * ki * (1 - dy / S(46)))
            d.ellipse((x - S(4), y - S(4), x + S(4), y + S(6)), fill=(170, 220, 255, aa), outline=INK[:3] + (aa // 2,))
    # the spider (SPIDER_MODE): drops on its thread / crawls along the moustache / sits in a cobweb
    ks = min(1, max(0, (tt - .3) / .35))
    if ks > 0 and SPIDER_MODE == 'thread':
        L = S(300) * (ease(ks) + .06 * math.sin(math.pi * min(1, (tt - .3) / .6)) * (1 - ks)) + S(10) * math.sin(t * 3.1)
        th_ang = math.radians(9 * math.sin(t * 2.3))
        ax, ay = W * .488, -S(14)
        sx, sy = ax + L * math.sin(th_ang), ay + L * math.cos(th_ang)
        d.line((ax, ay, sx, sy - S(26)), fill=(236, 236, 244, int(a * .9)), width=max(1, Si(2)))
        _place(g, _spider(t), sx, sy + S(14), -math.degrees(th_ang), sick)
    elif ks > 0 and SPIDER_MODE == 'moustache':                         # a small one tiptoes along the moustache's top
        u = ease(min(1, (tt - .3) / 1.4))
        sx, sy = W * (.505 + .075 * u), H * (.300 - .040 * u) - S(4) * abs(math.sin(t * 9))
        sp = _spider(t); sp = sp.resize((int(sp.width * .6), int(sp.height * .6)), Image.LANCZOS)
        _place(g, sp, sx, sy, -22, sick * ks)
    elif ks > 0 and SPIDER_MODE == 'web':                               # a cobweb in the corner of the moustache, its spider bobbing
        wx, wy = W * .470, H * .335
        _cobweb(g, wx, wy, S(78) * ease(ks), a, t)
        d = ImageDraw.Draw(g)
        sp = _spider(t); sp = sp.resize((int(sp.width * .75), int(sp.height * .75)), Image.LANCZOS)
        _place(g, sp, wx, wy + S(4) * math.sin(t * 3), 0, sick * ks)
    for j in range(2):                                                  # sweat drops at the temples
        dy = ((t * 1.5 + j / 2) % 1) * S(40)
        x = (W * .535, W * .72)[j]; y = H * .15 + dy
        aa = int(a * (1 - dy / S(40)))
        d.polygon([(x, y - S(12)), (x - S(8), y + S(4)), (x + S(8), y + S(4))], fill=(150, 210, 255, aa))
        d.ellipse((x - S(8), y - S(4), x + S(8), y + S(12)), fill=(150, 210, 255, aa))
    return g.convert('RGB')


def frame_j2(t):
    sick = ease(min(1, max(0, (t - T_PROB + .1) / .4)))
    push = ease(min(1, (t - T_TREE) / (T_NOST - T_TREE)))
    fr = TREE.copy()
    breathe = .5 + .5 * math.sin((t - T_TREE) * 1.6)                     # the old tree breathes: its light swells softly
    fr = CART.glow(fr, FACE[0], FACE[1] + S(40), S(260), (255, 236, 170), .10 + .08 * breathe)
    if sick > 0:
        fr = sick_fx(fr, t, sick)
    who = P2_HMM if t >= T_PROB else P2_AWE
    q = sized(who, PHH)
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((PX - q.width * .4, PFEET - S(10), PX + q.width * .4, PFEET + S(10)), fill=(0, 0, 0, 90))
    fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(S(6)))).convert('RGB')
    fr = comp(fr, q, PX - q.width / 2, PFEET - PHH)
    if t >= T_PROB:
        kq = min(1, (t - T_PROB) / .25)
        d = ImageDraw.Draw(fr)
        d.text((PX + q.width * .45, PFEET - PHH - S(30) - S(10) * (1 - kq)), '?', font=F(int(56 + 14 * (1 - kq))), fill=(255, 255, 255), stroke_width=Si(4), stroke_fill=(20, 14, 18))
    fr = fairy_fx.draw(fr, [(T_TREE, .40, .45), (T_LARGE, .48, .30), (T_PROB, .40, .42), (T_NOST, .38, .40)], t, size=.04)
    z = 1 + .06 * push                                                    # a slow push in, towards the face and her
    cx, cy = W * .45, H * .30                                             # anchored high: the face stays clear of the HUD
    cw, ch = W / z, H / z
    x0 = min(max(cx - cw / 2, 0), W - cw); y0 = min(max(cy - ch / 2, 0), H - ch)
    fr = fr.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BILINEAR)
    fr = hud.draw(fr, hearts=3, max_hearts=3, magic=0.0, rupees=0, t=None, alpha=min(1, (t - T_TREE) / .4))   # a new player's HUD
    if t < T_TREE + .3:
        fr = Image.blend(Image.new('RGB', fr.size, (255, 255, 255)), fr, (t - T_TREE) / .3)
    return fr, 'J2 the giant tree: an extremely personal problem'


# ------------------------------------------------------------------ J3: veteran | new player, three rows
ROWS = [('NOSTALGIA', T_NOST_W - .4), ('CHILDHOOD', T_CHILD + .1), ('EXPECTATIONS', T_EXP + .2)]


def heart_bar(d, x, y, w, v, a):
    d.rounded_rectangle((x, y, x + w, y + S(22)), S(8), fill=(20, 20, 30, int(220 * a)), outline=(235, 235, 250, int(255 * a)), width=Si(2))
    if v > 0:
        d.rounded_rectangle((x + S(3), y + S(3), x + S(3) + (w - S(6)) * v, y + S(19)), S(6), fill=(232, 60, 80, int(255 * a)))
    hud._heart(d, x + w + S(22), y + S(11), S(11), (232, 44, 52, int(255 * a)) if v > 0 else (60, 40, 50, int(200 * a)))


def frame_j3(t):
    fr = BI.MENU_BG.copy()
    a0 = ease(min(1, (t - T_NOST) / .4))
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    cxL, cxR = W * .40, W * .73                                            # two columns
    g.alpha_composite(UI.fade(UI.sq_box(int(W * .75 / U), int(H * .68 / U), r=18), a0), (int(W * .18) - Si(8), int(H * .06) - Si(8)))   # our game text box (family A)
    ctext(d, cxL, H * .09, 'VETERAN PLAYER', 26, GOLD + (int(255 * a0),))
    ctext(d, cxR, H * .09, 'NEW PLAYER', 26, BLUE + (int(255 * a0),))
    fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    small1 = sized(P1, H * .25); small2 = sized(P2_T, H * .25 * .95)       # the two of them, heading each column
    fr = comp(fr, fade(small1, a0), cxL - small1.width / 2 + S(40), H * .135)
    fr = comp(fr, fade(small2, a0), cxR - small2.width / 2, H * .135 + H * .25 * .05)
    d = ImageDraw.Draw(fr, 'RGBA')
    for i, (name, ti) in enumerate(ROWS):
        k = ease(min(1, max(0, (t - ti) / .35)))
        if k <= 0:
            continue
        y = H * (.43 + .1 * i)
        d.text((W * .2, y - S(2)), name, font=F(22), fill=(200, 205, 230, int(255 * k)))
        if name == 'NOSTALGIA':                                            # the heart bar from block F: full | empty
            heart_bar(d, cxL - S(50), y, S(230), 1.0, k); heart_bar(d, cxR - S(120), y, S(230), 0.0, k)
        elif name == 'CHILDHOOD':                                          # the 1998 photo | a blank photo
            ph = HB.FB.polaroid(-99, 0)
            ph = ph.resize((int(ph.width * .42), int(ph.height * .42)), Image.LANCZOS).rotate(4, expand=True, resample=Image.BICUBIC)
            fr = comp(fr, fade(ph, k), cxL + S(10) - ph.width / 2, y - S(30))
            blank = Image.new('RGBA', ph.size); bd = ImageDraw.Draw(blank)
            bd.rectangle((S(4), S(4), ph.width - S(6), ph.height - S(6)), fill=(250, 246, 236, 255)); bd.rectangle((S(10), S(10), ph.width - S(12), ph.height - S(26)), fill=(225, 222, 214, 255))
            fr = comp(fr, fade(blank.rotate(-3, expand=True), k), cxR - ph.width / 2, y - S(30))
            d = ImageDraw.Draw(fr, 'RGBA')
        else:                                                              # 28 YEARS (heavy) | 0
            u = (t - ti) / .35                                             # it weighs: drops in, lands with a thud, a little dust
            drop = -S(60) * (1 - min(1, u) ** 2) if u < 1 else S(5) * math.sin(min(1, (u - 1) / .4) * math.pi) * (1 - min(1, (u - 1) / .4))
            yy = y + drop
            d.rounded_rectangle((cxL - S(70), yy - S(8), cxL + S(150), yy + S(36)), S(10), fill=(120, 60, 30, 240), outline=INK, width=Si(3))
            ctext(d, cxL + S(40), yy - S(3), '28 YEARS', 30, (255, 230, 170, 255))
            if 1 <= u < 2.2:
                kd = (u - 1) / 1.2
                for side in (-1, 1):
                    for j in range(3):
                        px = cxL + S(40) + side * S(90 + 22 * j + 20 * kd); py = y + S(40 - 6 * kd - 4 * j)
                        r = S(5 + 4 * kd)
                        d.ellipse((px - r, py - r, px + r, py + r), fill=(200, 190, 210, int(150 * (1 - kd))))
            ctext(d, cxR, y - S(8), '0', 40, (150, 160, 200, int(255 * k)))
    return fr, 'J3 veteran | new player: nostalgia, childhood, expectations'


def render(t):
    if t < T_TREE:
        fr, lab = frame_j1(t)
    elif t < T_NOST:
        fr, lab = frame_j2(t)
    else:
        fr, lab = frame_j3(t)
        if t < T_NOST + .3:
            fr = Image.blend(Image.new('RGB', fr.size, (255, 255, 255)), fr, (t - T_NOST) / .3)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 16 PLAYER TWO · {lab} · BLOCK J v9 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('j1', T('l72.w6')), ('j2a', T_LARGE + .3), ('j2b', T_PROB + .6), ('j3', T_END - .3))



_render_shot = render


def render(t):
    """The shot, plus the place's name card the first time we enter it (Producer, 2026-10-06: video-game detail 1)."""
    return UI.area_enter(_render_shot(t), t, T_TREE + .3, 'THE GREAT TREE')


def main():
    out = out_path(ROOT / 'docs/ep002/EP002_blockJ_animatic_v9.mp4')
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          *video_args(), *audio_args(), '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(out_path(ROOT / f'docs/ep002/blockJ_v9_{name}.jpg'), quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(out_path(ROOT / f'docs/ep002/blockJ_v9_{name}.jpg'), quality=85)
        print('stills')
    else:
        main()
