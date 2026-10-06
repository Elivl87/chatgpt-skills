#!/usr/bin/env python3
"""EP002 animatic, block O (planning only): l109 "So maybe changing Ocarina of Time is not disrespecting it." ->
l114 "And then find a way to make someone feel that again." (block P starts on l115 "Which brings us back...").

v3, option B (Producer, 2026-10-05: "Vamos con B"): instead of the pantry jars (v2), the 1998 limitations are seen
through Quest's own memory - his childhood room at night (blocks C and H), the CRT playing 1998 Hyrule.
  O0  (N's improvement) the CHILD | ADULT split of block N dissolves into the room.
  O1  "So maybe changing Ocarina of Time is not disrespecting it."  Night, his room: Quest on the floor (Q008 profile,
                                          as in block H) watches 1998 Hyrule on the CRT.
  O2  "Maybe refusing to change anything would be."  The picture freezes: a PAUSE bar, the colour drains, the screen
                                          light on him dims.
  O3  "Because the goal should not be to preserve every limitation from 1998."  Push in on the screen: technician
                                          callouts pin each limitation - FOG, LOW POLY, BLURRY TEXTURES, FIXED CAMERA;
                                          a KEEP EXACTLY AS IT WAS stamp on "preserve".
  O4  "The goal should be to understand... what those limitations made you feel."  Pull back to Quest's face: a
                                          thought bubble; the FOG tag flies into it and flips to MYSTERY (a "?" in the
                                          mist), then LOW POLY flips to IMAGINATION (a great castle he imagined).
  O5  "And then find a way to make someone feel that again."  The bubble's "?" travels out; white; a Switch 2-like
                                          handheld today, its screen on the forest where Pixie (tunic) looks up into
                                          the mist; the "?" lands over her and the camera dives into the screen.
HUD: hidden in the room (real life) and on the handheld shot; on in the forest (in game; Pixie's FILE 2 has 3 hearts).
v7: final art #2d (Pixie in her tunic, awe) in the forest village #12 (via block M). Sounds: none (all at the end).
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, W, H, PW, PH, FPS, T, ease, lin, subtitle, tag, F, cam_box  # noqa
from icons import camera_icon  # noqa
import fairy as fairy_fx  # noqa
import ui_kit as UI  # noqa: the approved on-screen text style (2026-10-06)
import hud  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BN = load('blockN', 'scripts/ep002-blockN-animatic.py')          # the two eras
BM = load('blockM', 'scripts/ep002-blockM-animatic.py')          # the forest
BL = BN.BL                                                       # the Switch 2-like handheld
HB = BL.BK.HB                                                    # block H: his room, the CRT, Q008
CART = BN.CART
comp, sized, fade, ctext = BN.comp, BN.sized, BN.fade, BN.ctext
P2_AWE = BL.BK.BJ.P2_AWE                                                     # final art #2d: Pixie in her tunic, awe

T0 = T('l109') - 0.05                   # block N ends here
T_REFUSE = T('l110') - .05
T_PRES = T('l111') - .05
T_PRESW = T('l111.w8')                  # "preserve"
T_UNDL = T('l112') - .05
T_LIM = T('l113.w3')                    # "limitations": FOG -> MYSTERY
T_FEEL = T('l113.w6')                   # LOW POLY -> IMAGINATION
T_AGAIN = T('l114') - .05
T_FEEL2 = T('l114.w9')                  # "feel (that again)"
T_END = T('l115') - 0.05                # block P starts on l115
INK = (20, 14, 18, 255)
Q_SIZE = 90


def qmark(d, cx, y, size):
    """The one "?" of this block: his mystery, the same mark over Pixie."""
    f = F(int(size))
    d.text((cx - d.textlength('?', font=f) / 2, y), '?', font=f, fill=(255, 255, 255), stroke_width=5, stroke_fill=(70, 80, 110))


# ------------------------------------------------------------------ the room (block H's plate, his CRT)
BC = HB.BC
QPROF = HB.QPROF
ROOM_C = HB._room('child')                   # his childhood room (block C), as approved for O; block H v8's H4 is his adult room #15
QSPEC = ROOM_C['q']
QH = int(QSPEC[2] * PH)
QIMG = QPROF.resize((int(QPROF.width * QH / QPROF.height), QH), Image.LANCZOS)
SCREEN = [(BC.TV_POS[0] + x * BC.TV_SCALE, BC.TV_POS[1] + y * BC.TV_SCALE) for x, y in BC.Q34]   # screen corners (plate px)
SX0, SX1 = min(p[0] for p in SCREEN), max(p[0] for p in SCREEN)
SY0, SY1 = min(p[1] for p in SCREEN), max(p[1] for p in SCREEN)
HEAD = (QSPEC[0] * PW + QIMG.width * .12, QSPEC[1] * PH - QH * .80)  # his head (plate px)

CAM_A = (1.45, .655, .64)                                                    # both of them, whole (block H's framing)
CAM_TV = (3.6, (SX0 + SX1) / 2 / PW, (SY0 + SY1) / 2 / PH + .02)              # the screen, big
CAM_Q = (1.75, HEAD[0] / PW - .06, HEAD[1] / PH + .08)                       # his face, room for the bubble


def picture(t):
    pic = HB.old_picture(min(t, T_REFUSE + .3) if t >= T_REFUSE else t, (320, 240))
    kp = ease(min(1, max(0, (t - T_REFUSE - .2) / .8)))                       # O2: frozen, drained
    if kp > 0:
        a = np.asarray(pic).astype(np.float32); g = a.mean(2, keepdims=True)
        pic = Image.fromarray(np.clip(a + (g * .9 - a) * kp * .65, 0, 255).astype(np.uint8))
        if kp > .3 and t < T_PRES + .9:                                       # the PAUSE bar (gone before the callouts)
            d = ImageDraw.Draw(pic)
            d.rectangle((0, 104, 320, 136), fill=(10, 10, 14)); d.text((160 - d.textlength('PAUSE', font=F(22)) / 2, 108), 'PAUSE', font=F(22), fill=(255, 230, 120))
    return pic, kp


def room_plate(pic):
    """Block H's room_plate, on the childhood room (block H now defaults to the adult room #15)."""
    R = ROOM_C
    base = R['plate'].copy().convert('RGBA')
    sc = R['tv_scale']
    tv = BC.CRT_34.resize((R['tvw'], int(BC.CRT_34.height * sc)), Image.LANCZOS)
    qs = [(x * sc, y * sc) for x, y in BC.Q34]
    ms = np.asarray(Image.fromarray((BC.M34 * 255).astype(np.uint8)).resize(tv.size, Image.NEAREST)) > 127
    xs = [p[0] for p in qs]; ys = [p[1] for p in qs]
    scr = pic.resize((max(1, int(max(xs) - min(xs))), max(1, int(max(ys) - min(ys)))), Image.NEAREST)
    tv = BC.fill_screen(tv, qs, ms, scr)
    sh = Image.new('RGBA', base.size)
    ImageDraw.Draw(sh).ellipse((R['tv_pos'][0] + 10, R['tv_pos'][1] + tv.height - 14, R['tv_pos'][0] + tv.width - 10, R['tv_pos'][1] + tv.height + 6), fill=(0, 0, 0, 120))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(5)))
    base.alpha_composite(tv, R['tv_pos'])
    base.alpha_composite(R['n64'], R['n64_pos'])
    return base


def room(t):
    pic, kp = picture(t)
    glow = 1 - .6 * kp
    base = room_plate(pic)
    rgb = Image.blend(base.convert('RGB'), Image.new('RGB', base.size, (14, 18, 38)), ROOM_C['night'] + .18 * (1 - glow))
    sx, sy = BC.SCR_C[0] * PW, BC.SCR_C[1] * PH
    rgb = CART.glow(rgb, sx - 120, sy + 60, 900, (140, 190, 255), .35 * glow)
    base = rgb.convert('RGBA')
    q = QIMG
    ql = Image.blend(q.convert('RGB'), Image.new('RGB', q.size, (18, 22, 44)), .30 + .30 * (1 - glow)).convert('RGBA'); ql.putalpha(q.getchannel('A'))
    sh = Image.new('RGBA', base.size); ImageDraw.Draw(sh).ellipse((QSPEC[0] * PW - q.width * .45, QSPEC[1] * PH - 24, QSPEC[0] * PW + q.width * .45, QSPEC[1] * PH + 14), fill=(0, 0, 0, 120))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    base.alpha_composite(ql, (int(QSPEC[0] * PW - q.width / 2), int(QSPEC[1] * PH - QH)))
    rim = Image.new('RGBA', base.size); rd = ImageDraw.Draw(rim)
    fx = QSPEC[0] * PW + q.width * .22; fy = QSPEC[1] * PH - QH * .72
    rd.ellipse((fx - 120, fy - 140, fx + 160, fy + 260), fill=(120, 170, 255, int(60 * glow)))
    base.alpha_composite(rim.filter(ImageFilter.GaussianBlur(40)))
    return base.convert('RGB')


def cam_at(t):
    if t < T_PRES:                                                           # O1-O2: a slow push on both of them
        a, b, k = CAM_A, (1.55, .66, .64), (t - T0) / (T_PRES - T0)
    elif t < T_UNDL:                                                         # O3: in on the screen
        a, b, k = (1.55, .66, .64), CAM_TV, (t - T_PRES) / .9
    else:                                                                    # O4: across to his face
        a, b, k = CAM_TV, CAM_Q, (t - T_UNDL) / .9
    return (a, b), min(1, max(0, k))


def to_frame(px, py, box):
    return (px - box[0]) * W / (box[2] - box[0]), (py - box[1]) * H / (box[3] - box[1])


def scr_pt(u, v, box):
    """A point on the CRT screen (u, v in 0..1) in frame coordinates - on the real (tilted) glass, not its bounding box."""
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = SCREEN                          # tl, tr, br, bl
    tx, ty = lin(x0, x1, u), lin(y0, y1, u); bx, by = lin(x3, x2, u), lin(y3, y2, u)
    return to_frame(lin(tx, bx, v), lin(ty, by, v), box)


def tagbox(text, col=(255, 214, 40), flipped=False, k_flip=None):
    """Real life: EP001's gold marker (approved style, family C); flipped = its cream side."""
    return UI.marker(text, 19, paper=flipped)


CALLOUTS = (('FOG', (.45, .41), (-170, -160)), ('LOW POLY', (.75, .34), (110, -150)), ('BLURRY TEXTURES', (.22, .72), (-330, -70)),
            ('FIXED CAMERA', (.53, .78), (230, -20)))                         # v7, re-pinned on block H's new 1998 picture (#11 + #3): the horizon
                                                                              # haze, the blocky castle, the grass, the hero seen from the fixed camera


def callouts(fr, t, box, hide=()):
    d = ImageDraw.Draw(fr)
    for i, (name, (u, v), (ox, oy)) in enumerate(CALLOUTS):
        if name in hide:
            continue
        ka = min(1, max(0, (t - T_PRES - .9 - i * .35) / .3))
        if ka <= 0:
            continue
        x, y = scr_pt(u, v, box)
        g = tagbox(name)
        tx, ty = x + ox, y + oy
        tx = min(max(tx, 30), W - g.width - 30); ty = min(max(ty, 40), H * .74 - g.height)
        d.line((x, y, tx + g.width / 2, ty + g.height / 2), fill=(255, 214, 40), width=3)
        d.ellipse((x - 7, y - 7, x + 7, y + 7), outline=(255, 214, 40), width=3)
        if name == 'FIXED CAMERA':
            ic = camera_icon(False, 70)
            fr = comp(fr, fade(ic, ka), tx + g.width / 2 - 35, ty - 58)
            d = ImageDraw.Draw(fr)
        fr = comp(fr, fade(g, ka), tx, ty)
        d = ImageDraw.Draw(fr)
    return fr


def stamp(fr, t):
    ks = min(1, max(0, (t - T_PRESW) / .25)) * (1 - min(1, max(0, (t - T_UNDL) / .3)))
    if ks <= 0:
        return fr
    st = Image.new('RGBA', (460, 70)); sd = ImageDraw.Draw(st)
    sd.rounded_rectangle((3, 3, 456, 66), 8, outline=(210, 40, 50, 255), width=6)
    s = 'KEEP EXACTLY AS IT WAS'; sd.text((230 - sd.textlength(s, font=F(30)) / 2, 14), s, font=F(30), fill=(210, 40, 50, 255))
    st = st.rotate(-8, resample=Image.BICUBIC, expand=True)
    sc = 1.5 - .5 * ease(ks)
    st = st.resize((int(st.width * sc), int(st.height * sc)), Image.LANCZOS)
    return comp(fr, fade(st, ks), W * .5 - st.width / 2, H * .63 - st.height / 2)   # on the bezel, clear of the pins


CASTLE = Image.open(ROOT / 'public/art/ep002/props3d/castle_far.png').convert('RGBA')
BUBBLE_C = (W * .30, H * .30)                                                # the thought bubble (frame px, on CAM_Q)


def bubble(fr, t, box):
    kb = ease(min(1, max(0, (t - T_UNDL - .5) / .5)))
    if kb <= .05:                                                            # (too small to draw yet)
        return fr
    hx, hy = to_frame(*HEAD, box)
    bx, by = BUBBLE_C
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    R = 170 * kb
    for (ox, oy, r) in ((-110, -10, .55), (0, -50, .66), (110, -10, .55), (-60, 55, .5), (60, 55, .5)):
        d.ellipse((bx + ox * kb - R * r, by + oy * kb - R * r, bx + ox * kb + R * r, by + oy * kb + R * r), fill=(236, 240, 248, 235), outline=(20, 14, 18, 255), width=4)
    for (ox, oy, r) in ((-110, -10, .55), (0, -50, .66), (110, -10, .55), (-60, 55, .5), (60, 55, .5)):
        d.ellipse((bx + ox * kb - R * r + 4, by + oy * kb - R * r + 4, bx + ox * kb + R * r - 4, by + oy * kb + R * r - 4), fill=(236, 240, 248, 235))
    for i, s in enumerate((14, 10)):                                          # little bubbles down to his head
        x, y = lin(bx + 120, hx, .45 + .25 * i), lin(by + 120, hy, .45 + .25 * i)
        d.ellipse((x - s * kb, y - s * kb, x + s * kb, y + s * kb), fill=(236, 240, 248, 235), outline=(20, 14, 18, 255), width=3)
    fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    # inside: mist and a "?" (mystery), then a great castle (imagination)
    km = min(1, max(0, (t - T_LIM) / .4))
    kmist = kb                                                               # the mist is there as soon as the bubble opens
    if kmist > 0:
        mist = Image.new('RGBA', (W, H)); md = ImageDraw.Draw(mist)
        for i in range(8):
            a = t * .7 + i * .8
            x = bx - 60 + 120 * (i / 7) + 10 * math.sin(a); y = by + 20 + 18 * math.cos(a)
            md.ellipse((x - 50, y - 22, x + 50, y + 22), fill=(190, 200, 220, int(150 * kmist)))
        fr = Image.alpha_composite(fr.convert('RGBA'), mist.filter(ImageFilter.GaussianBlur(8))).convert('RGB')
        if t < Q_TRAVEL0 and km > 0:                                       # the "?" forms on "limitations"
            qmark(ImageDraw.Draw(fr), bx - 70, by - 70, Q_SIZE * (.6 + .4 * km) + 6 * math.sin(t * 3))
    kc = ease(min(1, max(0, (t - T_FEEL) / .5)))
    if kc > 0:
        gh = sized(CASTLE, 110 * kc + 1)
        a = np.asarray(gh).astype(np.float32); a[..., :3] = a[..., :3] * .4 + np.array([200, 225, 255]) * .6
        fr = comp(fr, Image.fromarray(a.astype(np.uint8)), bx + 70 - gh.width / 2, by + 10 - gh.height)
    # the two tags that came from the screen, flipping to what they made him feel
    for name, new, tk, (ox, oy) in (('FOG', 'MYSTERY', T_LIM, (-250, 130)), ('LOW POLY', 'IMAGINATION', T_FEEL, (-60, 165))):
        kf = min(1, max(0, (t - tk) / .4))
        sq = abs(math.cos(math.pi * kf)) if kf < 1 else 1
        g = tagbox(new if kf >= .5 else name, flipped=kf >= .5)
        g = g.resize((g.width, max(1, int(g.height * sq))), Image.LANCZOS)
        fr = comp(fr, fade(g, kb), bx + ox, by + oy + (36 - g.height) / 2)
    return fr


# ------------------------------------------------------------------ O5: today, someone feels it again
FOREST = BM.forest_frame(BM.T_DIST - .1, BM.T_DIST - .1)[0]                 # block M's forest: final art #12
PX, PFEET, PHH = W * .42, H * .95, H * .52
Q_TO = (PX + 20, PFEET - PHH - 120)                                          # the "?" over Pixie (forest frame px)
Q_TRAVEL0, Q_TRAVEL1 = T_AGAIN - .25, T_AGAIN + 1.0
T_DIVE0, T_DIVE1 = T_FEEL2 - .9, T_FEEL2 - .1


def forest(t, with_q=True):
    fr = FOREST.copy()
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)                      # drifting mist
    for i in range(14):
        x = (i * 140 + t * 30 * (1 + i % 3)) % (W + 300) - 150; y = H * (.35 + .05 * (i % 5))
        d.ellipse((x - 160, y - 50, x + 160, y + 50), fill=(235, 240, 246, 150))
    fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(18))).convert('RGB')
    p = sized(P2_AWE, PHH)
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((PX - p.width * .35, PFEET - 10, PX + p.width * .35, PFEET + 8), fill=(0, 0, 0, 80))
    fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(5))).convert('RGB')
    fr = comp(fr, p, PX - p.width / 2, PFEET - p.height)
    if with_q:
        glow = .3 + .5 * min(1, max(0, (t - T_FEEL2) / .3))
        fr = CART.glow(fr, Q_TO[0], Q_TO[1] + 60, 90, (255, 255, 220), glow)
        qmark(ImageDraw.Draw(fr), Q_TO[0], Q_TO[1], Q_SIZE + 10 * math.sin(t * 3))
    return fr


SW_W = 820
SW = BL.SW2.resize((SW_W, int(BL.SW2.height * SW_W / BL.SW2.width)), Image.LANCZOS)
_sq = BL.SW2_QUAD * (SW_W / BL.SW2.width)
SW_MASK = np.asarray(Image.fromarray(BL.SW2_MASK.astype(np.uint8) * 255).resize(SW.size, Image.NEAREST)) > 127
SW_POS = (W * .5 - SW.width / 2, H * .47 - SW.height / 2)
_SRC = np.float32([[0, 0], [W, 0], [W, H], [0, H]])
SW_M = cv2.getPerspectiveTransform(_SRC, _sq.astype(np.float32))


def handheld(t, screen):
    """Today: the Switch 2-like handheld (our 3D, block L) on a bright table; `screen` plays on it."""
    bg = Image.new('RGB', (W, H), (226, 214, 196)); d = ImageDraw.Draw(bg)
    d.rectangle((0, H * .62, W, H), fill=(170, 130, 96)); d.line((0, H * .62, W, H * .62), fill=(120, 90, 66), width=4)
    bg = CART.glow(bg, W * .82, H * .12, 600, (255, 248, 220), .45)                # daylight from a window
    ph = Image.new('RGBA', (150, 290)); pd = ImageDraw.Draw(ph)                   # Producer improvement: a phone - it is today
    pd.rounded_rectangle((2, 2, 147, 287), 22, fill=(28, 30, 36, 255), outline=(20, 14, 18, 255), width=4)
    pd.rounded_rectangle((10, 12, 139, 277), 16, fill=(40, 70, 120, 255))
    pd.text((75 - pd.textlength('20:26', font=F(30)) / 2, 40), '20:26', font=F(30), fill=(240, 245, 255, 255))
    pd.rounded_rectangle((18, 110, 131, 150), 8, fill=(235, 240, 248, 220))
    pd.rounded_rectangle((60, 262, 90, 267), 2, fill=(200, 210, 230, 255))
    ph = ph.rotate(-62, resample=Image.BICUBIC, expand=True)
    ph = ph.resize((ph.width, int(ph.height * .55)), Image.LANCZOS)                 # lying on the table, in perspective
    sh2 = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh2).ellipse((W * .86 - ph.width * .45, H * .86 - 18, W * .86 + ph.width * .45, H * .86 + 26), fill=(0, 0, 0, 60))
    bg = Image.alpha_composite(bg.convert('RGBA'), sh2.filter(ImageFilter.GaussianBlur(10))).convert('RGB')
    bg = comp(bg, ph, W * .86 - ph.width / 2, H * .82 - ph.height / 2)
    pic = cv2.warpPerspective(np.asarray(screen).astype(np.float32), SW_M, SW.size)
    s = np.asarray(SW).copy(); s[SW_MASK, :3] = np.clip(pic[SW_MASK], 0, 255).astype(np.uint8)
    sw = Image.fromarray(s)
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((W * .5 - SW_W * .48, SW_POS[1] + SW.height * .78, W * .5 + SW_W * .48, SW_POS[1] + SW.height * 1.0), fill=(0, 0, 0, 70))
    bg = Image.alpha_composite(bg.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(14))).convert('RGB')
    return comp(bg, sw, *SW_POS)


def q_on_handheld():
    """Where the forest's "?" sits on the handheld's screen (frame px)."""
    p = cv2.perspectiveTransform(np.float32([[[Q_TO[0], Q_TO[1] + 40]]]), SW_M)[0, 0]
    return SW_POS[0] + float(p[0]), SW_POS[1] + float(p[1])


def dive(fr_hand, fr_forest, k):
    """Push into the handheld's screen until the game fills the frame."""
    e = ease(k)
    cx = SW_POS[0] + float(_sq[:, 0].mean()); cy = SW_POS[1] + float(_sq[:, 1].mean())
    sw_w = float(_sq[:, 0].max() - _sq[:, 0].min())
    z = lin(1, W / sw_w, e)
    cw, ch = W / z, H / z
    x0, y0 = lin(0, cx - cw / 2, e), lin(0, cy - ch / 2, e)
    zoomed = fr_hand.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BILINEAR)
    return Image.blend(zoomed, fr_forest, max(0, (e - .6) / .4))


# ------------------------------------------------------------------ render
N_LAST = None


def render(t):
    global N_LAST
    hud_on = False
    if t < T_AGAIN + .45:
        base = room(t)
        cam, k = cam_at(t)
        box = cam_box(cam, k)
        fr = base.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)
        if T_PRES + .9 <= t < T_UNDL + .45:                                   # O3: the callouts on the screen
            fr = callouts(fr, t, box, hide=('FOG', 'LOW POLY') if t >= T_UNDL else ())
            fr = stamp(fr, t)
        if t >= T_UNDL:
            fr = bubble(fr, t, box)
        lab = ('O1 changing is not disrespecting' if t < T_REFUSE else 'O2 refusing to change would be' if t < T_PRES
               else 'O3 preserve every limitation' if t < T_UNDL else 'O4 what they made you feel')
        if t < T0 + .6:                                                      # N's improvement: dissolve from the two eras
            if N_LAST is None:
                N_LAST = BN.n7(BN.T_END - .05)[0]
            fr = Image.blend(N_LAST, fr, ease((t - T0) / .6))
        if t > T_AGAIN - .1:                                                 # O5: white...
            fr = Image.blend(fr, Image.new('RGB', fr.size, (246, 246, 240)), min(1, (t - T_AGAIN + .1) / .5))
    else:
        lab = 'O5 make someone feel that again'
        if t < T_DIVE0:                                                      # ...today, the handheld, the forest on it
            fr = handheld(t, forest(t, with_q=t >= Q_TRAVEL1))
            fr = Image.blend(Image.new('RGB', fr.size, (246, 246, 240)), fr, ease(min(1, (t - T_AGAIN - .45) / .5)))
        elif t < T_DIVE1:
            fr = dive(handheld(t, forest(t)), hud.draw(forest(t), hearts=3.0, max_hearts=3, magic=0.0, rupees=0, t=t), (t - T_DIVE0) / (T_DIVE1 - T_DIVE0))
        else:
            fr = forest(t); hud_on = True
    if Q_TRAVEL0 <= t < Q_TRAVEL1:                                           # the same "?" travels from his bubble to her
        k = ease((t - Q_TRAVEL0) / (Q_TRAVEL1 - Q_TRAVEL0))
        x0, y0 = BUBBLE_C[0] - 70, BUBBLE_C[1] - 70
        x1, y1 = q_on_handheld()
        size = lin(Q_SIZE, Q_SIZE * .45, k)
        x = lin(x0, x1, k); y = lin(y0, y1 - size * .6, k) - 80 * math.sin(math.pi * k)
        tr = Image.new('RGBA', (W, H)); td = ImageDraw.Draw(tr)                # Producer improvement: a trail (Navi's colour) to follow it
        for i in range(1, 14):
            kk = ease(max(0, (t - i * .035 - Q_TRAVEL0) / (Q_TRAVEL1 - Q_TRAVEL0)))
            sz = lin(Q_SIZE, Q_SIZE * .45, kk)
            px = lin(x0, x1, kk); py = lin(y0, y1 - sz * .6, kk) - 80 * math.sin(math.pi * kk) + sz * .55
            r = 7 * (1 - i / 14) + 2
            td.ellipse((px - r, py - r, px + r, py + r), fill=(170, 225, 255, int(200 * (1 - i / 14))))
        fr = Image.alpha_composite(fr.convert('RGBA'), tr.filter(ImageFilter.GaussianBlur(2))).convert('RGB')
        fr = CART.glow(fr, x, y + size * .5, 80, (255, 255, 230), .35)
        qmark(ImageDraw.Draw(fr), x, y, size)
    if hud_on:
        fr = hud.draw(fr, hearts=3.0, max_hearts=3, magic=0.0, rupees=0, t=t)   # her new FILE 2 (block J): 0 rupees
    keys = [(T0, .30, .28), (T_PRES, .22, .30), (T_UNDL, .60, .30), (T_AGAIN, .62, .30), (T_END, .62, .36)]
    fr = fairy_fx.draw(fr, keys, t, size=.04)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 21 WHAT IT MADE YOU FEEL · {lab} · BLOCK O v7 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('o0', T0 + .3), ('o1', T('l109.w8') + .3), ('o2', T('l110.w6') + .3), ('o3', T('l111.w11') + .3), ('o4a', T_LIM + .5),
          ('o4b', T_FEEL + .5), ('o5q', T_AGAIN + .7), ('o5h', T_DIVE0 - .2), ('o5', T_END - .3))


def main():
    out = ROOT / 'docs/ep002/EP002_blockO_animatic_v7.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockO_v7_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockO_v7_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
