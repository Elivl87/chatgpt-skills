#!/usr/bin/env python3
"""EP002 animatic, block P (planning only): l115 "Which brings us back to the strange part." ->
l120 "...one of the few ways you can measure how much you changed." (block Q starts on l121).

v1, "back to the room" (Producer, 2026-10-05: "Sí, constrúyelo así"): Quest of today goes back to his childhood room
(blocks C, H, O), now in daylight.
  P1  "Which brings us back to the strange part."  The door opens from the hallway; Quest walks into his room.
  P2  "The original game still exists. We did not lose it."  Push in to the bedside table: the CRT (off), and the golden
                                          cartridge lying there, dusty; a sunbeam lands on it, the dust glitters.
  P3  "Nobody needs Nintendo to rescue Ocarina of Time from history."  Quest blows into the cartridge (a dust puff),
                                          slots it into the N64 (our 3D insert) and the CRT powers on at the first try.
  P4  "So why do we want it again?"  Quest between the 1998 CRT (glowing) and today's Switch 2-like handheld; the
                                          channel's big WHY?.
  P5  "Because going back to something you loved is one of the few ways you can measure how much you changed."
                                          The door frame of the same room: pencil height marks (1996, 1997, 1998 - kid
                                          height). Quest stands against it, his head far above; a new line "2026"; the
                                          gap between 1998 and 2026 lights up.
HUD: hidden (real life). Sounds: none (all at the end).
v2 (approved): the blow in profile (head and shoulders), a whip pan from P4 to the door frame.
v3 (final art, 2026-10-05): the profile blow is now the final #10a (red hoodie, profile right, blowing the gold
cartridge; the cartridge in his hands is part of the art), head and chest, he comes up into the shot and a slow push
in; the approved cartoon dust cloud still blasts out of the cartridge's far end. Profile stand-in (Q008 crop) and its
MISSING label removed.
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
from lib import ROOT, W, H, PW, PH, FPS, T, ease, lin, subtitle, tag, F, cam_box, cutout, final, step, STEP_RATE  # noqa
import fairy as fairy_fx  # noqa
import ui_kit as UI  # noqa: the approved on-screen text style (2026-10-06)

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BO = load('blockO', 'scripts/ep002-blockO-animatic.py')          # the room, the handheld, the forest
BN, BL, HB, BC, CART = BO.BN, BO.BL, BO.HB, BO.BC, BO.CART
comp, sized, fade = BN.comp, BN.sized, BN.fade

T0 = T('l115') - 0.05                   # block O ends here
T_ORIG = T('l116') - .05                # P2
T_LOSE = T('l117') - .05
T_NOBODY = T('l118') - .05              # P3: blow...
T_INS = T('l118.w5') - .15              # ...insert ("rescue")...
T_ON = T('l118.w8') - .1                # ...on ("Time")
T_WHY = T('l119') - .05                 # P4
T_WHYW = T('l119.w2')                   # "why"
T_BEC = T('l120') - .05                 # P5
T_LOVED = T('l120.w7')                  # he steps against the frame
T_MEAS = T('l120.w16')                  # "measure": the new line
T_CHG = T('l120.w17')                   # "how much you changed": the gap lights up
T_END = T('l121') - 0.05                # block Q starts on l121
INK = (20, 14, 18)
SCR = 'scratch'

# ------------------------------------------------------------------ props
_ins = sorted((ROOT / 'public/art/ep002/props3d/n64_insert').glob('f*.png'))
INSERT = [Image.open(f).convert('RGBA') for f in _ins]
CONSOLE = INSERT[0].crop((420, 314, 892, 628))                              # our 3D N64, no cartridge in it
CONSOLE = CONSOLE.crop(CONSOLE.getchannel('A').getbbox())
CONSOLE = CONSOLE.resize((BC.N64_IMG.width, int(CONSOLE.height * BC.N64_IMG.width / CONSOLE.width)), Image.LANCZOS)
CARTRIDGE = BN.CARTRIDGE
CART_PT = (1610, 778)                                                       # the cartridge on the bedside table (plate px, bottom-centre)
CART_W = 120


def dusty(im, k):
    """A layer of dust over our 3D cartridge (an overlay, k = how dusty)."""
    a = np.asarray(im).astype(np.float32)
    rng = np.random.default_rng(7)
    n = rng.random(a.shape[:2])[..., None]
    dust = np.array([170, 160, 140], np.float32)
    a[..., :3] = a[..., :3] * (1 - .55 * k) + dust * .55 * k * (.8 + .4 * n)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


CART_ROOM = sized(dusty(CARTRIDGE, .55), CART_W * CARTRIDGE.height / CARTRIDGE.width)
CART_ROOM = CART_ROOM.resize((CART_ROOM.width, int(CART_ROOM.height * .78)), Image.LANCZOS)   # lying down, a little foreshortened


# His childhood bedroom (block C), as block H v7 drew it (block H v8 moved its night shot to adult Quest's room #15;
# P and Q stay in the childhood room, by day): the CRT on the bedside table plays `pic`, the N64 on the floor.
ROOM_N = BC.BED.convert('RGB')
QSPEC = (.47, .985, .50)                                                    # Quest on the floor in front of the bedside table (x, feet y, h)


def room_plate(t, pic):
    base = ROOM_N.copy().convert('RGBA')
    tv = BC.CRT_34.resize((BC.tvw, int(BC.CRT_34.height * BC.TV_SCALE)), Image.LANCZOS)
    qs = [(x * BC.TV_SCALE, y * BC.TV_SCALE) for x, y in BC.Q34]
    ms = np.asarray(Image.fromarray((BC.M34 * 255).astype(np.uint8)).resize(tv.size, Image.NEAREST)) > 127
    xs = [p[0] for p in qs]; ys = [p[1] for p in qs]
    scr = pic.resize((int(max(xs) - min(xs)), int(max(ys) - min(ys))), Image.NEAREST)
    tv = BC.fill_screen(tv, qs, ms, scr)
    base.alpha_composite(tv, BC.TV_POS)
    base.alpha_composite(BC.N64_IMG, BC.N64_POS)
    return base


def screen_on(t, k_on):
    """The CRT picture: dark glass, then the old power-on (a dot, a line, the picture)."""
    w, h = 320, 240
    pic = HB.old_picture(t, (w, h))
    if k_on >= 1:
        return pic
    out = Image.new('RGB', (w, h), (22, 26, 30)); d = ImageDraw.Draw(out)
    if k_on <= 0:
        d.line((20, 30, 120, 10), fill=(60, 66, 74), width=10)            # a window reflection on the dark glass
        return out
    if k_on < .25:
        r = 2 + 6 * k_on / .25; d.ellipse((w / 2 - r, h / 2 - r, w / 2 + r, h / 2 + r), fill=(255, 255, 255))
    elif k_on < .55:
        kk = (k_on - .25) / .3; d.rectangle((w / 2 - w / 2 * kk, h / 2 - 2, w / 2 + w / 2 * kk, h / 2 + 2), fill=(255, 255, 255))
    else:
        kk = ease((k_on - .55) / .45); sh = max(4, int(h * kk))
        band = Image.blend(pic.resize((w, sh), Image.BILINEAR), Image.new('RGB', (w, sh), (255, 255, 255)), 1 - kk)
        out.paste(band, (0, (h - sh) // 2))
    return out


def plate(t, k_on=0.0, cart=True, sun=0.0):
    """His room by day: the CRT (off unless k_on), the N64 on the floor without its cartridge, the cartridge on the table."""
    base = room_plate(t, screen_on(t, k_on)).convert('RGBA')
    nx, ny = BC.N64_POS
    patch = ROOM_N.crop((nx, ny, nx + BC.N64_IMG.width, ny + BC.N64_IMG.height))   # remove the cartridge-in console...
    base.paste(patch, (nx, ny))
    base.alpha_composite(CONSOLE, (nx, ny + BC.N64_IMG.height - CONSOLE.height))       # ...and put the empty one back
    if sun > 0:                                                              # a sunbeam from the window onto the cartridge
        g = Image.new('RGBA', base.size); d = ImageDraw.Draw(g)
        cx, cy = CART_PT
        d.polygon([(760, 60), (900, 60), (cx + 80, cy - 10), (cx - 70, cy - 10)], fill=(255, 236, 170, int(105 * sun)))
        base.alpha_composite(g.filter(ImageFilter.GaussianBlur(18)))
    if cart:
        sh = Image.new('RGBA', base.size); ImageDraw.Draw(sh).ellipse((CART_PT[0] - CART_W * .55, CART_PT[1] - 8, CART_PT[0] + CART_W * .55, CART_PT[1] + 6), fill=(0, 0, 0, 90))
        base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(4)))
        base.alpha_composite(CART_ROOM, (int(CART_PT[0] - CART_ROOM.width / 2), int(CART_PT[1] - CART_ROOM.height)))
    rgb = base.convert('RGB')
    if sun > 0:
        rgb = CART.glow(rgb, CART_PT[0], CART_PT[1] - 30, 120, (255, 240, 190), .25 * sun)
    if k_on > 0:
        rgb = CART.glow(rgb, BC.SCR_C[0] * PW, BC.SCR_C[1] * PH, 380, (170, 210, 255), .4 * min(1, k_on))
    return rgb


def motes(fr, t, cx, cy, k, n=26, spread=150):
    """Dust glittering in the sunbeam (frame px)."""
    if k <= 0:
        return fr
    g = Image.new('RGBA', fr.size); d = ImageDraw.Draw(g)
    for i in range(n):
        a = i * 2.39 + t * .6
        x = cx + spread * math.sin(a * 1.3 + i) * .8; y = cy - (t * 25 + i * 37) % (spread * 1.6) + spread * .3
        r = 1.5 + 1.5 * (i % 3); tw = .5 + .5 * math.sin(t * 6 + i)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 245, 210, int(220 * k * tw)))
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


# ------------------------------------------------------------------ P1: the door opens, he walks in
WALKER = cutout('quest:walking_back')
CAM_DOOR = (1.05, .50, .52)
CAM_TABLE = (2.3, CART_PT[0] / PW - .02, CART_PT[1] / PH - .06)
DOOR_C = (122, 92, 64)


def door_open(fr, k):
    """We are in the hallway: the door swings inward on its left hinge, the frame stays (frame px)."""
    out = Image.new('RGB', (W, H), (70, 56, 44)); d = ImageDraw.Draw(out)   # the hallway wall around the frame
    ox0, oy0, ox1, oy1 = W * .08, H * .04, W * .92, H * 1.0                   # the doorway
    room = fr.resize((int(ox1 - ox0), int(oy1 - oy0)), Image.BILINEAR)
    out.paste(room, (int(ox0), int(oy0)))
    d.rectangle((ox0 - 26, oy0 - 26, ox0, oy1), fill=(150, 118, 84)); d.rectangle((ox1, oy0 - 26, ox1 + 26, oy1), fill=(150, 118, 84))
    d.rectangle((ox0 - 26, oy0 - 26, ox1 + 26, oy0), fill=(150, 118, 84))
    e = ease(k)
    if e < .98:                                                                # the door leaf, swinging (perspective: its free edge narrows)
        wd = max(6, (ox1 - ox0) * math.cos(e * math.pi / 2 * 1.05))
        sk = 40 * math.sin(e * math.pi / 2)
        poly = [(ox0, oy0), (ox0 + wd, oy0 + sk), (ox0 + wd, oy1 - sk * .3), (ox0, oy1)]
        d.polygon(poly, fill=DOOR_C, outline=INK, width=4)
        for (a, b) in ((.12, .45), (.55, .9)):                                 # two panels
            px0, px1 = ox0 + wd * .14, ox0 + wd * .86
            d.rectangle((px0, lin(oy0, oy1, a), px1, lin(oy0, oy1, b)), outline=(90, 66, 44), width=5)
        d.ellipse((ox0 + wd * .9 - 12, H * .55 - 12, ox0 + wd * .9 + 12, H * .55 + 12), fill=(210, 180, 90), outline=INK, width=3)
    return out


def p1(t):
    k_open = (t - T0 - .15) / 1.1
    k_cam = (t - (T0 + 1.6)) / (T_ORIG + 1.2 - (T0 + 1.6))
    box = cam_box((CAM_DOOR, CAM_TABLE), min(1, max(0, k_cam)))
    fr = plate(t, sun=min(1, max(0, (t - T_ORIG) / .6))).crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)
    kw = min(1, max(0, (t - T0 - .5) / 2.6))                                  # he walks in, away from us, smaller (2.6 s: Producer, 2026-10-06)
    if kw > 0 and t < T_ORIG + .6:
        walker = step(WALKER, ((STEP_RATE * t) / math.pi) % 2 / 2) if kw < 1 else WALKER   # a step per bob while he walks in
        hh = lin(H * 1.15, H * .55, ease(kw)); q = sized(walker, hh)
        x = lin(W * .42, W * .62, ease(kw)) - q.width / 2; y = lin(H * 1.35, H * .97, ease(kw)) - q.height + 6 * abs(math.sin(t * STEP_RATE))
        fr = comp(fr, fade(q, 1 - min(1, max(0, (t - T_ORIG - .2) / .4))), x, y)
    if k_open < 1.2:
        fr = door_open(fr, min(1, max(0, k_open))) if k_open < 1 else fr
    return fr, box


# ------------------------------------------------------------------ P3: blow, insert, power on
INS_BG = Image.blend(plate(T0).crop((1150, 760, 1560, 990)).resize((W, H)).filter(ImageFilter.GaussianBlur(16)), Image.new('RGB', (W, H), (14, 10, 12)), .3)
CAM_TV = (3.4, BC.SCR_C[0] - .02, BC.SCR_C[1] + .02)


BLOW = final('quest_blow')                                                   # #10a: red hoodie, profile right, blowing the gold cartridge
BLOW = BLOW.crop((0, 0, BLOW.width, 1100))                                   # head and chest (the approved P v2 framing)
BLOW_END = (800, 360)                                                        # the cartridge's far end, where the dust comes out (art px)


def blow(t):
    """Improvement 1 (Producer), final art #10a: in profile, the cartridge at his lips - he blows into the connector
    and a cartoon dust cloud blasts out of the far end (the old ritual). The art's own small puff is where it starts."""
    bg = plate(t, sun=1).crop((1250, 300, 1920, 677)).resize((W, H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(10))
    bg = Image.blend(bg, Image.new('RGB', (W, H), (46, 34, 30)), .45)        # darker, so the light dust reads
    ku = ease(min(1, max(0, (t - T_NOBODY) / .35)))                         # he comes up into the shot, cartridge at his lips
    kp = min(1, max(0, (t - T_NOBODY) / (T_INS - T_NOBODY)))                 # a slow push in
    sc = H * 1.05 / BLOW.height * (1 + .04 * kp)
    q = BLOW.resize((int(BLOW.width * sc), int(BLOW.height * sc)), Image.LANCZOS)
    x, y = W * .10 - 10 * kp, H * .06 + 60 * (1 - ku) - 8 * kp
    fr = comp(bg, q, x, y)
    ex, ey = x + BLOW_END[0] * sc, y + BLOW_END[1] * sc                       # the far end of the cartridge
    kb = (t - T_NOBODY - .35) / .9
    if 0 < kb < 1.8:
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        for i in range(3):                                                     # wind streaks through it
            yy = ey - 30 + i * 30; kk = min(1, kb * 2)
            d.line((ex + 10, yy, ex + 10 + 220 * kk, yy + (i - 1) * 20 * kk), fill=(255, 255, 255, int(230 * max(0, 1 - kb / 1.2))), width=6)
        rng = np.random.default_rng(3)
        fade_k = max(0, 1 - max(0, kb - .8) / 1.0)
        for i in range(40):                                                    # the dust cloud, a cartoon puff with an ink edge
            a = rng.uniform(-.55, .55); r = 20 + 380 * min(1, kb) * rng.uniform(.35, 1)
            px, py = ex + r * math.cos(a), ey + r * math.sin(a)
            s = rng.uniform(18, 46) * (.5 + min(1, kb))
            d.ellipse((px - s - 3, py - s - 3, px + s + 3, py + s + 3), fill=(60, 46, 36, int(200 * fade_k)))
        rng = np.random.default_rng(3)
        for i in range(40):
            a = rng.uniform(-.55, .55); r = 20 + 380 * min(1, kb) * rng.uniform(.35, 1)
            px, py = ex + r * math.cos(a), ey + r * math.sin(a)
            s = rng.uniform(18, 46) * (.5 + min(1, kb))
            d.ellipse((px - s, py - s, px + s, py + s), fill=(236, 224, 196, int(240 * fade_k)))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(2))).convert('RGB')
    return fr


def insert(t):
    k = min(1, max(0, (t - T_INS) / .75))
    f = INSERT[min(len(INSERT) - 1, int(ease(k) * (len(INSERT) - 1)))]
    fr = comp(INS_BG, f, 0, 0)
    if k >= 1:
        fr = CART.glow(fr, W * .5, H * .38, 140, (255, 236, 160), .4 * max(0, 1 - (t - T_INS - .75) / .4))
    return fr


def tv_on(t):
    k_on = min(1, (t - T_ON) / .6)
    box = cam_box((CAM_TV, (3.0, BC.SCR_C[0] - .02, BC.SCR_C[1] + .03)), min(1, (t - T_ON) / (T_WHY - T_ON)))
    fr = plate(t, k_on=k_on, cart=False, sun=1).crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)
    kt = min(1, max(0, (t - T_ON - .7) / .25))
    if kt > 0:                                                                 # it works, at the first try
        st = Image.new('RGBA', (300, 64)); sd = ImageDraw.Draw(st)
        sd.rounded_rectangle((3, 3, 296, 60), 8, outline=(40, 160, 70, 255), width=6)
        s = 'FIRST TRY'; sd.text((150 - sd.textlength(s, font=F(30)) / 2, 12), s, font=F(30), fill=(40, 160, 70, 255))
        st = st.rotate(6, resample=Image.BICUBIC, expand=True)
        sc = 1.4 - .4 * ease(kt); st = st.resize((int(st.width * sc), int(st.height * sc)), Image.LANCZOS)
        fr = comp(fr, fade(st, kt), W * .2 - st.width / 2, H * .62 - st.height / 2)
    return fr


# ------------------------------------------------------------------ P4: the 1998 CRT, today's handheld, WHY?
THINK = cutout('quest2:thinking_chin')
_hx, _hy = BO.SW_POS
HANDHELD = BO.handheld(T('l114.w9'), BO.forest(T('l114.w9'))).crop((int(_hx - 40), int(_hy - 60), int(_hx + BO.SW.width + 40), int(_hy + BO.SW.height + 60)))   # block O's handheld, the forest on it


def why(t):
    bg = plate(t, k_on=1, cart=False, sun=1)
    box = cam_box(((1.5, .62, .55), (1.6, .62, .55)), (t - T_WHY) / (T_BEC - T_WHY))
    fr = bg.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(3))
    fr = Image.blend(fr, Image.new('RGB', (W, H), (40, 34, 30)), .25)
    q = sized(THINK, H * .70)
    fr = comp(fr, q, W * .5 - q.width / 2, H * .99 - q.height)
    # left: the CRT glowing (1998) - a card; right: today's handheld - a card
    look = math.sin((t - T_WHY) * 2.4)                                        # his attention swings between the two
    for side, (lab, col) in enumerate((('1998', (255, 214, 120)), ('2026', (170, 220, 255)))):
        kk = min(1, max(0, (t - T_WHY - .1 - side * .25) / .3))
        if kk <= 0:
            continue
        hi = .5 + .5 * (look if side else -look)
        cw, ch = 330, 250
        card = Image.new('RGBA', (cw, ch + 44)); cd = ImageDraw.Draw(card)
        cd.rounded_rectangle((0, 0, cw - 1, ch + 43), 14, fill=(250, 246, 236, 255), outline=INK + (255,), width=4)
        if side == 0:
            pic = HB.old_picture(t, (cw - 30, ch - 30))
        else:
            pic = HANDHELD.resize((cw - 30, ch - 30), Image.LANCZOS)
        card.paste(pic, (15, 15))
        cd.text((cw / 2 - cd.textlength(lab, font=F(26)) / 2, ch + 4), lab, font=F(26), fill=INK + (255,))
        sc = .9 + .12 * hi
        card = card.resize((int(card.width * sc), int(card.height * sc)), Image.LANCZOS).rotate(4 if side == 0 else -4, resample=Image.BICUBIC, expand=True)
        cx = W * (.18 if side == 0 else .82)
        fr = CART.glow(fr, cx, H * .42, 230, col, .25 + .35 * hi * kk)
        fr = comp(fr, fade(card, kk), cx - card.width / 2, H * .42 - card.height / 2)
    kw = min(1, max(0, (t - T_WHYW) / .25))                                   # the channel's big WHY?
    if kw > 0:
        s = 'WHY?'; f = UI.anton(int(150 * (1.3 - .3 * ease(kw))))   # EP001 punch type
        d = ImageDraw.Draw(fr)
        d.text((W / 2 - d.textlength(s, font=f) / 2, H * .03), s, font=f, fill=(255, 214, 40), stroke_width=9, stroke_fill=INK)
    return fr


# ------------------------------------------------------------------ P5: the door frame, the pencil marks
SMILE = cutout('quest2:nostalgic_smile')
FLOOR_Y = H * .96
Q_H = H * .80                                                                 # his height today (frame px)
MARKS = (('1996', .55), ('1997', .60), ('1998', .65))                         # kid heights, as a share of his height today
JAMB_X = W * .50


def frame_wall(t):
    fr = Image.new('RGB', (W, H), (232, 214, 182)); d = ImageDraw.Draw(fr)
    for y in range(0, H, 6):                                                   # warm wall, sunlit from the left
        d.line((0, y, W, y), fill=(int(236 - y * .03), int(218 - y * .03), int(186 - y * .03)))
    fr = CART.glow(fr, W * .2, H * .25, 700, (255, 240, 200), .35)
    d = ImageDraw.Draw(fr)
    d.rectangle((JAMB_X, 0, JAMB_X + 120, H), fill=(178, 136, 92), outline=INK, width=4)       # the door frame (jamb)
    d.line((JAMB_X + 18, 0, JAMB_X + 18, H), fill=(140, 104, 70), width=3)
    d.rectangle((JAMB_X + 120, 0, W, H), fill=(92, 72, 56))                                   # the dark hallway past it
    d.rectangle((0, FLOOR_Y, W, H), fill=(150, 104, 64)); d.line((0, FLOOR_Y, W, FLOOR_Y), fill=INK, width=4)
    return fr


def pencil_mark(d, y, lab, k, col=(70, 60, 70), big=False):
    x0 = JAMB_X - 4; x1 = x0 + 128 * k
    d.line((x0, y, x1, y), fill=col, width=5 if big else 3)
    if k >= 1:
        f = F(30 if big else 20)
        d.text((x0 + 26, y - (36 if big else 26)), lab, font=f, fill=col)


def marks(t):
    fr = frame_wall(t)
    ks = min(1, max(0, (t - T_LOVED + .3) / .6))                              # he steps against the frame
    kg0 = min(1, max(0, (t - T_BEC) / .4)) * (1 - ks)                        # first, the kid he was, a memory at the 1998 mark
    if kg0 > 0:
        kid = sized(SMILE, Q_H * MARKS[-1][1])
        a = np.asarray(kid).astype(np.float32); a[..., :3] = a[..., :3] * .45 + np.array([190, 215, 255]) * .55; a[..., 3] *= .6
        kid = Image.fromarray(a.astype(np.uint8))
        fr = comp(fr, fade(kid, kg0), JAMB_X - kid.width * .82, FLOOR_Y - kid.height + 2)
    q = sized(SMILE, Q_H)
    qx = lin(W * .18, JAMB_X - q.width * .82, ease(ks))
    fr = comp(fr, fade(q, min(1, ks * 3) if ks > 0 else 0), qx, FLOOR_Y - q.height + 4)
    d = ImageDraw.Draw(fr)
    for lab, h in MARKS:                                                      # the old marks stay on top of him: they are on the frame
        pencil_mark(d, FLOOR_Y - Q_H * h, lab, 1)
    y98 = FLOOR_Y - Q_H * MARKS[-1][1]
    y26 = FLOOR_Y - Q_H * .985
    kn = min(1, max(0, (t - T_MEAS) / .45))
    if kn > 0:                                                                 # the pencil draws today's line over his head
        pencil_mark(d, y26, '2026', kn, col=(200, 40, 50), big=True)
        px = JAMB_X - 4 + 128 * kn
        d.line((px, y26, px + 40, y26 - 50), fill=(240, 200, 60), width=10); d.line((px, y26, px + 8, y26 - 10), fill=INK, width=4)
    kg = min(1, max(0, (t - T_CHG) / .5))
    if kg > 0:                                                                 # the gap between 1998 and today lights up
        g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
        gd.rectangle((JAMB_X + 4, y26 + 6, JAMB_X + 116, y98 - 6), fill=(255, 220, 90, int(150 * kg)))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(6))).convert('RGB')
        d = ImageDraw.Draw(fr)
        bx = JAMB_X + 150
        d.line((bx, y26, bx, y26 + (y98 - y26) * ease(kg)), fill=(255, 214, 40), width=6)
        for yy in (y26, y98):
            d.line((bx - 14, yy, bx + 14, yy), fill=(255, 214, 40), width=6)
        if kg >= 1:
            f = F(34)
            for i, s in enumerate(('HOW MUCH', 'YOU CHANGED')):
                d.text((bx + 26, (y26 + y98) / 2 - 42 + i * 44), s, font=f, fill=(255, 236, 170), stroke_width=4, stroke_fill=INK)
    return fr


WHIP = .45


def whip(a, b, k):
    """Improvement 3 (Producer): a whip pan across the same room, from Quest by the bed to the door frame."""
    e = ease(min(1, max(0, k)))
    off = int(W * e)
    out = Image.new('RGB', (W, H)); out.paste(a, (-off, 0)); out.paste(b, (W - off, 0))
    n = int(90 * math.sin(math.pi * e)) // 2 * 2 + 1
    if n > 1:
        out = Image.fromarray(cv2.blur(np.asarray(out), (n, 1)))
    return out


# ------------------------------------------------------------------ render
def render(t):
    if t < T_NOBODY:
        fr, box = p1(t)
        if t >= T_ORIG:
            mx, my = BO.to_frame(CART_PT[0], CART_PT[1] - 40, box)
            fr = motes(fr, t, mx, my, min(1, (t - T_ORIG) / .6) * (1 + .6 * (t > T('l116.w4'))))
        lab = 'P1 back to the strange part' if t < T_ORIG else 'P2 the original game still exists'
    elif t < T_INS:
        fr = blow(t); lab = 'P3 nobody needs Nintendo to rescue it'
    elif t < T_ON:
        fr = insert(t); lab = 'P3 nobody needs Nintendo to rescue it'
    elif t < T_WHY:
        fr = tv_on(t); lab = 'P3 ...from history'
    elif t < T_BEC:
        fr = why(t); lab = 'P4 so why do we want it again?'
    else:
        fr = marks(t); lab = 'P5 measure how much you changed'
        if t < T_BEC + WHIP:
            fr = whip(why(T_BEC - .01), fr, (t - T_BEC) / WHIP)
    keys = [(T0, .62, .30), (T_ORIG, .70, .30), (T_WHY, .62, .26), (T_BEC, .30, .30), (T_END, .34, .26)]
    fr = fairy_fx.draw(fr, keys, t, size=.04)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 22 BACK TO THE ROOM · {lab} · BLOCK P v6 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('p1a', T0 + .6), ('p1b', T('l115.w7')), ('p2', T('l117.w3')), ('p3a', T_NOBODY + .9), ('p3a2', T_NOBODY + .5), ('p5w', T_BEC + .2), ('p3b', T_INS + .6), ('p3c', T_ON + 1.0),
          ('p4', T_WHYW + .5), ('p5k', T_BEC + .8), ('p5a', T_LOVED + .5), ('p5b', T_END - .2))


def main():
    out = ROOT / 'docs/ep002/EP002_blockP_animatic_v6.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockP_v6_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockP_v6_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
