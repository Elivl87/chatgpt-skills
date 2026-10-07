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
from lib import ROOT, W, H, PW, PH, FPS, T, ease, lin, subtitle, tag, F, cam_box, S, Si, P, U, out_path, video_args, audio_args  # noqa
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
    d.text((cx - d.textlength('?', font=f) / 2, y), '?', font=f, fill=(255, 255, 255), stroke_width=Si(5), stroke_fill=(70, 80, 110))


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
            d.rectangle((0, 104, 320, 136), fill=(10, 10, 14)); d.text((160 - d.textlength('PAUSE', font=F(22 / U)) / 2, 108), 'PAUSE', font=F(22 / U), fill=(255, 230, 120))   # picture px (the 320x240 tube picture), not design px
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
    ImageDraw.Draw(sh).ellipse((R['tv_pos'][0] + P(10), R['tv_pos'][1] + tv.height - P(14), R['tv_pos'][0] + tv.width - P(10), R['tv_pos'][1] + tv.height + P(6)), fill=(0, 0, 0, 120))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(P(5))))
    base.alpha_composite(tv, R['tv_pos'])
    base.alpha_composite(R['n64'], R['n64_pos'])
    return base


def room(t):
    pic, kp = picture(t)
    glow = 1 - .6 * kp
    base = room_plate(pic)
    rgb = Image.blend(base.convert('RGB'), Image.new('RGB', base.size, (14, 18, 38)), ROOM_C['night'] + .18 * (1 - glow))
    sx, sy = BC.SCR_C[0] * PW, BC.SCR_C[1] * PH
    rgb = CART.glow(rgb, sx - P(120), sy + P(60), P(900), (140, 190, 255), .35 * glow)
    base = rgb.convert('RGBA')
    q = QIMG
    ql = Image.blend(q.convert('RGB'), Image.new('RGB', q.size, (18, 22, 44)), .30 + .30 * (1 - glow)).convert('RGBA'); ql.putalpha(q.getchannel('A'))
    sh = Image.new('RGBA', base.size); ImageDraw.Draw(sh).ellipse((QSPEC[0] * PW - q.width * .45, QSPEC[1] * PH - P(24), QSPEC[0] * PW + q.width * .45, QSPEC[1] * PH + P(14)), fill=(0, 0, 0, 120))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(P(10))))
    base.alpha_composite(ql, (int(QSPEC[0] * PW - q.width / 2), int(QSPEC[1] * PH - QH)))
    rim = Image.new('RGBA', base.size); rd = ImageDraw.Draw(rim)
    fx = QSPEC[0] * PW + q.width * .22; fy = QSPEC[1] * PH - QH * .72
    rd.ellipse((fx - P(120), fy - P(140), fx + P(160), fy + P(260)), fill=(120, 170, 255, int(60 * glow)))
    base.alpha_composite(rim.filter(ImageFilter.GaussianBlur(P(40))))
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
        tx, ty = x + S(ox), y + S(oy)
        tx = min(max(tx, S(30)), W - g.width - S(30)); ty = min(max(ty, S(40)), H * .74 - g.height)
        d.line((x, y, tx + g.width / 2, ty + g.height / 2), fill=(255, 214, 40), width=Si(3))
        d.ellipse((x - S(7), y - S(7), x + S(7), y + S(7)), outline=(255, 214, 40), width=Si(3))
        if name == 'FIXED CAMERA':
            ic = camera_icon(False, 70)
            fr = comp(fr, fade(ic, ka), tx + g.width / 2 - S(35), ty - S(58))
            d = ImageDraw.Draw(fr)
        fr = comp(fr, fade(g, ka), tx, ty)
        d = ImageDraw.Draw(fr)
    return fr


def stamp(fr, t):
    ks = min(1, max(0, (t - T_PRESW) / .25)) * (1 - min(1, max(0, (t - T_UNDL) / .3)))
    if ks <= 0:
        return fr
    st = Image.new('RGBA', (Si(460), Si(70))); sd = ImageDraw.Draw(st)
    sd.rounded_rectangle((S(3), S(3), S(456), S(66)), S(8), outline=(210, 40, 50, 255), width=Si(6))
    s = 'KEEP EXACTLY AS IT WAS'; sd.text((S(230) - sd.textlength(s, font=F(30)) / 2, S(14)), s, font=F(30), fill=(210, 40, 50, 255))
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
    R = S(170) * kb
    for (ox, oy, r) in ((-110, -10, .55), (0, -50, .66), (110, -10, .55), (-60, 55, .5), (60, 55, .5)):
        ox, oy = S(ox), S(oy)
        d.ellipse((bx + ox * kb - R * r, by + oy * kb - R * r, bx + ox * kb + R * r, by + oy * kb + R * r), fill=(236, 240, 248, 235), outline=(20, 14, 18, 255), width=Si(4))
    for (ox, oy, r) in ((-110, -10, .55), (0, -50, .66), (110, -10, .55), (-60, 55, .5), (60, 55, .5)):
        ox, oy = S(ox), S(oy)
        d.ellipse((bx + ox * kb - R * r + S(4), by + oy * kb - R * r + S(4), bx + ox * kb + R * r - S(4), by + oy * kb + R * r - S(4)), fill=(236, 240, 248, 235))
    for i, s in enumerate((14, 10)):                                          # little bubbles down to his head
        x, y = lin(bx + S(120), hx, .45 + .25 * i), lin(by + S(120), hy, .45 + .25 * i); s = S(s)
        d.ellipse((x - s * kb, y - s * kb, x + s * kb, y + s * kb), fill=(236, 240, 248, 235), outline=(20, 14, 18, 255), width=Si(3))
    fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    # inside: mist and a "?" (mystery), then a great castle (imagination)
    km = min(1, max(0, (t - T_LIM) / .4))
    kmist = kb                                                               # the mist is there as soon as the bubble opens
    if kmist > 0:
        mist = Image.new('RGBA', (W, H)); md = ImageDraw.Draw(mist)
        for i in range(8):
            a = t * .7 + i * .8
            x = bx - S(60) + S(120) * (i / 7) + S(10) * math.sin(a); y = by + S(20) + S(18) * math.cos(a)
            md.ellipse((x - S(50), y - S(22), x + S(50), y + S(22)), fill=(190, 200, 220, int(150 * kmist)))
        fr = Image.alpha_composite(fr.convert('RGBA'), mist.filter(ImageFilter.GaussianBlur(S(8)))).convert('RGB')
        if t < Q_TRAVEL0 and km > 0:                                       # the "?" forms on "limitations"
            qmark(ImageDraw.Draw(fr), bx - S(70), by - S(70), Q_SIZE * (.6 + .4 * km) + 6 * math.sin(t * 3))
    kc = ease(min(1, max(0, (t - T_FEEL) / .5)))
    if kc > 0:
        gh = sized(CASTLE, S(110) * kc + 1)
        a = np.asarray(gh).astype(np.float32); a[..., :3] = a[..., :3] * .4 + np.array([200, 225, 255]) * .6
        fr = comp(fr, Image.fromarray(a.astype(np.uint8)), bx + S(70) - gh.width / 2, by + S(10) - gh.height)
    # the two tags that came from the screen, flipping to what they made him feel
    for name, new, tk, (ox, oy) in (('FOG', 'MYSTERY', T_LIM, (-250, 130)), ('LOW POLY', 'IMAGINATION', T_FEEL, (-60, 165))):
        kf = min(1, max(0, (t - tk) / .4))
        sq = abs(math.cos(math.pi * kf)) if kf < 1 else 1
        g = tagbox(new if kf >= .5 else name, flipped=kf >= .5)
        g = g.resize((g.width, max(1, int(g.height * sq))), Image.LANCZOS)
        fr = comp(fr, fade(g, kb), bx + S(ox), by + S(oy) + (S(36) - g.height) / 2)
    return fr


# ------------------------------------------------------------------ O5: today, someone feels it again
FOREST = BM.forest_frame(BM.T_DIST - .1, BM.T_DIST - .1)[0]                 # block M's forest: final art #12
PX, PFEET, PHH = W * .42, H * .95, H * .52
Q_TO = (PX + S(20), PFEET - PHH - S(120))                                          # the "?" over Pixie (forest frame px)
Q_TRAVEL0, Q_TRAVEL1 = T_AGAIN - .25, T_AGAIN + 1.0
T_DIVE0, T_DIVE1 = T_FEEL2 - .9, T_FEEL2 - .1


def forest(t, with_q=True):
    fr = FOREST.copy()
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)                      # drifting mist
    for i in range(14):
        x = (i * S(140) + t * S(30) * (1 + i % 3)) % (W + S(300)) - S(150); y = H * (.35 + .05 * (i % 5))
        d.ellipse((x - S(160), y - S(50), x + S(160), y + S(50)), fill=(235, 240, 246, 150))
    fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(S(18)))).convert('RGB')
    p = sized(P2_AWE, PHH)
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((PX - p.width * .35, PFEET - S(10), PX + p.width * .35, PFEET + S(8)), fill=(0, 0, 0, 80))
    fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(S(5)))).convert('RGB')
    fr = comp(fr, p, PX - p.width / 2, PFEET - p.height)
    if with_q:
        glow = .3 + .5 * min(1, max(0, (t - T_FEEL2) / .3))
        fr = CART.glow(fr, Q_TO[0], Q_TO[1] + S(60), S(90), (255, 255, 220), glow)
        qmark(ImageDraw.Draw(fr), Q_TO[0], Q_TO[1], Q_SIZE + 10 * math.sin(t * 3))
    return fr


SW_W = Si(820)
_SW_HD = Image.open(ROOT / 'public/art/ep002/props3d/switch2_room_hd.png').convert('RGBA')   # 2K-ready render (2026-10-07)
SW = _SW_HD.resize((SW_W, int(_SW_HD.height * SW_W / _SW_HD.width)), Image.LANCZOS)
_sq, _key = BL._screen_quad(SW)
# the screen key and its anti-aliased green fringe (Producer, 2026-10-07: a green frame showed round the screen)
_a = np.asarray(SW).astype(np.int16)
_fringe = (_a[..., 1] > _a[..., 0] + 25) & (_a[..., 1] > _a[..., 2] + 25) & (_a[..., 3] > 0)
SW_MASK = cv2.dilate((_key | _fringe).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
SW_MASK &= cv2.dilate(_key.astype(np.uint8), np.ones((Si(9) | 1, Si(9) | 1), np.uint8)) > 0   # only next to the screen
SW_POS = (W * .5 - SW.width / 2, H * .47 - SW.height / 2)
_SRC = np.float32([[0, 0], [W, 0], [W, H], [0, H]])
SW_M = cv2.getPerspectiveTransform(_SRC, _sq.astype(np.float32))

# the table round it (Producer, 2026-10-07): our 3D phone, a coffee mug, headphones and a game box, no brands
_DESK = {n: Image.open(ROOT / f'public/art/ep002/props3d/desk_{n}.png').convert('RGBA') for n in ('phone', 'mug', 'headphones', 'gamebox')}


def _desk(name, h):
    im = _DESK[name]
    return im.resize((max(1, Si(h * im.width / im.height)), Si(h)), Image.LANCZOS)


def _keyed(im, key, pic):
    """Fill the key colour of a 3D prop with a picture, in the prop's perspective."""
    a = np.asarray(im).astype(np.int16)
    k = (np.abs(a[..., 0] - key[0]) < 60) & (np.abs(a[..., 1] - key[1]) < 60) & (np.abs(a[..., 2] - key[2]) < 60) & (a[..., 3] > 0)
    c, _ = cv2.findContours(k.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    q = cv2.approxPolyDP(max(c, key=cv2.contourArea), .04 * cv2.arcLength(max(c, key=cv2.contourArea), True), True)[:, 0].astype(np.float32)
    s_, d_ = q.sum(1), np.diff(q, axis=1)[:, 0]
    quad = np.float32([q[np.argmin(s_)], q[np.argmin(d_)], q[np.argmax(s_)], q[np.argmax(d_)]])
    pw_, ph_ = pic.size
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [pw_, 0], [pw_, ph_], [0, ph_]]), quad)
    warped = cv2.warpPerspective(np.asarray(pic.convert('RGB')).astype(np.float32), M, im.size, borderMode=cv2.BORDER_REPLICATE)
    m = cv2.dilate(k.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    m &= cv2.dilate(k.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
    out = np.asarray(im).copy(); out[m, :3] = np.clip(warped[m], 0, 255).astype(np.uint8)
    return Image.fromarray(out)


def _lock_screen():
    g = Image.new('RGB', (Si(330), Si(720)), (40, 70, 120)); d = ImageDraw.Draw(g)
    for y in range(g.height):                                           # a calm dusk wallpaper
        k = y / g.height
        d.line((0, y, g.width, y), fill=(int(lin(42, 236, k ** 2)), int(lin(66, 150, k ** 2)), int(lin(128, 120, k))))
    d.text((g.width / 2 - d.textlength('20:26', font=F(84)) / 2, S(90)), '20:26', font=F(84), fill=(250, 250, 255))
    d.rounded_rectangle((S(30), S(250), g.width - S(30), S(330)), S(18), fill=(250, 250, 255))
    d.rounded_rectangle((S(50), S(272), S(90), S(308)), S(8), fill=(214, 57, 47))
    d.rounded_rectangle((S(105), S(276), S(260), S(290)), S(5), fill=(120, 124, 134))
    d.rounded_rectangle((S(105), S(296), S(220), S(306)), S(4), fill=(180, 184, 192))
    return g


def _cover():
    """Our own cover for the new game: today's field (#11), the castle centred; no logo, no name."""
    f = HB.G.FIELD
    w_ = int(f.height * 500 / 560)
    return f.crop((f.width // 2 - w_ // 2, 0, f.width // 2 + w_ // 2, f.height)).resize((Si(500), Si(560)), Image.LANCZOS)


PHONE = _keyed(_desk('phone', 150), (255, 0, 255), _lock_screen())
MUG = _desk('mug', 150)
PHONES_H = _desk('headphones', 105)
GAMEBOX = _keyed(_desk('gamebox', 185), (0, 255, 255), _cover())


def _steam(fr, t, x, y):
    """Coffee steam: three soft curls rising and fading."""
    lay = Image.new('RGBA', fr.size); d = ImageDraw.Draw(lay)
    for i in range(3):
        for k in range(14):
            u = ((t * .5 + i / 3) % 1)
            yy = y - S(10) - k * S(7) - u * S(40)
            xx = x + (i - 1) * S(16) + S(9) * math.sin(k * .7 + t * 2 + i)
            a = int(110 * (1 - k / 14) * math.sin(math.pi * u))
            d.ellipse((xx - S(5), yy - S(5), xx + S(5), yy + S(5)), fill=(255, 255, 255, max(0, a)))
    return Image.alpha_composite(fr.convert('RGBA'), lay.filter(ImageFilter.GaussianBlur(S(3)))).convert('RGB')


def _shadowed(bg, im, x, y, spread=.45):
    sh = Image.new('RGBA', bg.size)
    ImageDraw.Draw(sh).ellipse((x + im.width * (.5 - spread), y + im.height * .82, x + im.width * (.5 + spread), y + im.height * 1.02), fill=(0, 0, 0, 60))
    bg = Image.alpha_composite(bg.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(S(10))))
    bg.alpha_composite(im, (int(x), int(y)))
    return bg.convert('RGB')


def handheld(t, screen):
    """Today: the Switch 2-like handheld (our 3D, block L) on a bright table, an adult's things round it; `screen`
    plays on it."""
    bg = Image.new('RGB', (W, H), (226, 214, 196)); d = ImageDraw.Draw(bg)
    d.rectangle((0, H * .62, W, H), fill=(170, 130, 96)); d.line((0, H * .62, W, H * .62), fill=(120, 90, 66), width=Si(4))
    bg = CART.glow(bg, W * .82, H * .12, S(600), (255, 248, 220), .45)                # daylight from a window
    bg = _shadowed(bg, GAMEBOX, W * .02, H * .66)                                      # front left, half out of the light
    bg = _shadowed(bg, MUG, W * .11, H * .40)                                          # back left
    bg = _steam(bg, t, W * .11 + MUG.width * .42, H * .40 + MUG.height * .12)
    bg = _shadowed(bg, PHONES_H, W * .835, H * .45)                                    # back right, clear of the handheld
    bg = _shadowed(bg, PHONE, W * .84, H * .63, spread=.35)                            # front right, today: 20:26
    pic = cv2.warpPerspective(np.asarray(screen).astype(np.float32), SW_M, SW.size, borderMode=cv2.BORDER_REPLICATE)
    s = np.asarray(SW).copy(); s[SW_MASK, :3] = np.clip(pic[SW_MASK], 0, 255).astype(np.uint8)
    sw = Image.fromarray(s)
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((W * .5 - SW_W * .48, SW_POS[1] + SW.height * .78, W * .5 + SW_W * .48, SW_POS[1] + SW.height * 1.0), fill=(0, 0, 0, 70))
    bg = Image.alpha_composite(bg.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(S(14)))).convert('RGB')
    return comp(bg, sw, *SW_POS)


def q_on_handheld():
    """Where the forest's "?" sits on the handheld's screen (frame px)."""
    p = cv2.perspectiveTransform(np.float32([[[Q_TO[0], Q_TO[1] + S(40)]]]), SW_M)[0, 0]
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
        x0, y0 = BUBBLE_C[0] - S(70), BUBBLE_C[1] - S(70)
        x1, y1 = q_on_handheld()
        size = lin(Q_SIZE, Q_SIZE * .45, k)
        x = lin(x0, x1, k); y = lin(y0, y1 - S(size) * .6, k) - S(80) * math.sin(math.pi * k)
        tr = Image.new('RGBA', (W, H)); td = ImageDraw.Draw(tr)                # Producer improvement: a trail (Navi's colour) to follow it
        for i in range(1, 14):
            kk = ease(max(0, (t - i * .035 - Q_TRAVEL0) / (Q_TRAVEL1 - Q_TRAVEL0)))
            sz = S(lin(Q_SIZE, Q_SIZE * .45, kk))
            px = lin(x0, x1, kk); py = lin(y0, y1 - sz * .6, kk) - S(80) * math.sin(math.pi * kk) + sz * .55
            r = S(7 * (1 - i / 14) + 2)
            td.ellipse((px - r, py - r, px + r, py + r), fill=(170, 225, 255, int(200 * (1 - i / 14))))
        fr = Image.alpha_composite(fr.convert('RGBA'), tr.filter(ImageFilter.GaussianBlur(S(2)))).convert('RGB')
        fr = CART.glow(fr, x, y + S(size) * .5, S(80), (255, 255, 230), .35)
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
    out = out_path(ROOT / 'docs/ep002/EP002_blockO_animatic_v8.mp4')
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          *video_args(), *audio_args(), '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(out_path(ROOT / f'docs/ep002/blockO_v8_{name}.jpg'), quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(out_path(ROOT / f'docs/ep002/blockO_v8_{name}.jpg'), quality=85)
        print('stills')
    else:
        main()
