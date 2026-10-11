#!/usr/bin/env python3
"""EP003 animatic, block F (planning): friendslop and the Tuesday night, l36 "The internet even invented a name..." ->
l43 "And millions of people answered the same group chat."

  F1 l36  A genre card in the channel's style: FRIENDSLOP (Anton), our 3D trash can beside it; "half a joke, half an
          insult" / "cheap, chaotic co-op" markers.
  F2 l37  "the word for garbage": the trash-can lid pops; "then we invited our friends to it": the four wave at it.
  F3 l38  "this year's summer hit": a summer calendar page, sun sticker.
  F4 l39  "fishing trips end too": the boat drifting at dusk, slow pull back.
  F5 l40  "a Tuesday night": TUESDAY · 9:00 PM chip; the four in the boat; "the plan was to fish" (rod), "always" (rod
          again, untouched).
  F6 l41  The night living room (REUSE), Quest gaming (REUSE), the clock: 1:00 AM; "last round." — the clock jumps to 1:47.
  F7 l42  A yearbook-style card: two silhouettes (no faces, no real people drawn), "met in high school"; "first paid game:
          did not do well" (a small falling chart); "a small game about friends doing something silly together".
  F8 l43  The group chat count explodes: notifications stacking up (millions answered).
Music off. HUD off.
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
from lib import ROOT, W, H, PW, PH, T, ease, lin, S, Si, P, F, cutout, subtitle, tag  # noqa
import ep003_kit as K  # noqa
import ui_kit as UI  # noqa

T0, T_END = T('l36') - .05, T('l44') - .05
T_NAME, T_HALF, T_CHEAP = T('l36.w11'), T('l36.w12'), T('l36.w18')
T_F2, T_INV = T('l37') - .05, T('l37.w11')
T_F3 = T('l38') - .05
T_F4 = T('l39') - .05
T_F5, T_TUE, T_PLAN, T_ALWAYS = T('l40') - .05, T('l40.w16'), T('l40.w18'), T('l40.w23')
T_F6, T_LAST, T_NEVER = T('l41') - .05, T('l41.w12'), T('l41.w14')
T_F7, T_SCHOOL, T_FIRST, T_SMALL = T('l42') - .05, T('l42.w11'), T('l42.w16'), T('l42.w24')
T_F8 = T('l43') - .05

LAKE = K.plate_lake('dusk')
NIGHT = K.plate_lake('night')
WL = PH * .70
ROOM = Image.open(ROOT / 'public/art/core/backgrounds/living_room_night_gaming.png').convert('RGB').resize((PW, PH), Image.LANCZOS)
CAL = Image.open(ROOT / 'public/art/core/objects/calendar_friday.png').convert('RGBA')
FOUR = [(('sil', 'quest2:laughing_pointing'), -.30, P(430), False), ('pixie:laughing_pointing', -.1, P(420), True),
        ('quest2:laughing_pointing', .12, P(440), False), (('sil', 'quest2:wave_happy'), .32, P(430), True)]


def card_bg():
    fr = Image.new('RGB', (W, H))
    K._grad(fr, (34, 30, 52), (16, 14, 26), 0, H)
    return K.dust(fr, K.NOW[0])


def f1(t):
    fr = card_bg()
    if t >= T_NAME - .1:
        fr = K.punch(fr, 'FRIENDSLOP', t - T_NAME + .1, size=110, y=.36, col=(255, 200, 61), x=.44)
        can = K.sized(K.prop('trashcan'), h=S(220))
        if t >= T_F2 + .4:                                                 # the lid pops on "garbage"
            pass
        fr.alpha_composite(can, (int(W * .80 - can.width / 2), int(H * .36 - can.height / 2)))
    if t >= T_HALF:
        fr = K.marker_at(fr, 'half a joke, half an insult', .44, .60, size=22, k=min(1, (t - T_HALF) / .3), paper=True)
    if t >= T_CHEAP:
        fr = K.marker_at(fr, 'cheap · chaotic · co-op · with friends', .44, .72, size=22, k=min(1, (t - T_CHEAP) / .3))
    return fr


def f2(t):
    fr = card_bg()
    fr = K.punch(fr, 'FRIENDSLOP', 1, size=110, y=.30, col=(255, 200, 61), x=.44)
    can = K.sized(K.prop('trashcan'), h=S(220))
    hop = S(16) * abs(math.sin((t - T_F2) * 9)) if t - T_F2 < 1.2 else 0
    T_GARB = T('l37.w10')
    if t >= T_GARB:                                                       # the companion inside the trash can, deadpan
        f = K.buddy(S(90), blink=K.blink_at(t - T_GARB, every=2.4, phase=-.6), rot=20)
        ky = ease(min(1, (t - T_GARB) / .35))
        fr.alpha_composite(f, (int(W * .80 - f.width / 2), int(H * .30 - can.height / 2 - f.height * .55 * ky)))
    fr.alpha_composite(can, (int(W * .80 - can.width / 2), int(H * .30 - can.height / 2 - hop)))
    fr = K.marker_at(fr, '"slop" = garbage', .44, .52, size=22, k=min(1, (t - T_F2) / .3), paper=True)
    if t >= T_INV:
        for i, (who, sil) in enumerate((('quest2:wave_happy', False), ('pixie:wave_happy', False), ('quest2:wave_happy', True), ('pixie:wave_happy', True))):
            k = ease(min(1, (t - T_INV - i * .1) / .35))
            im = K.sized(K.silhouette(who) if sil else cutout(who), h=S(250))
            fr.alpha_composite(im, (int(W * (.2 + .2 * i) - im.width / 2), int(lin(H, H - im.height, k))))
    return fr


def f3(t):
    fr = card_bg()
    c = K.sized(CAL, h=S(330))
    fr.alpha_composite(c, (int(W / 2 - c.width / 2), int(H * .42 - c.height / 2)))
    d = ImageDraw.Draw(fr)
    cx, cy = W * .5 + S(130), H * .25
    d.ellipse((cx - S(40), cy - S(40), cx + S(40), cy + S(40)), fill=(255, 210, 80), outline=UI.INK, width=Si(3))
    return K.marker_at(fr, "this year's summer hit?", .5, .86, size=24, k=min(1, (t - T_F3 - .3) / .3), paper=True)


def boat_at(t, plate, cam):
    base = K.lake_at(plate, t)
    K.boat_scene(base, PW * .5, WL, P(900), FOUR, t)
    return K.crop_cam(base, cam)


def f4(t):
    return boat_at(t, 'dusk', K.cam_lerp((1.4, .5, .55), (1.0, .5, .55), (t - T_F4) / (T_F5 - T_F4)))


def f5(t):
    fr = boat_at(t, 'night', K.cam_lerp((1.0, .5, .55), (1.25, .5, .55), (t - T_F5) / (T_F6 - T_F5)))
    if t >= T_TUE - .2:
        g = UI.sq_tag('Tuesday · 9:00 PM', 24)
        fr.alpha_composite(UI.fade(g, min(1, (t - T_TUE + .2) / .3)), (int(W * .5 - g.width / 2), int(H * .08)))
    if t >= T_PLAN:
        fr = K.marker_at(fr, 'the plan: fish', .5, .86, size=22, k=min(1, (t - T_PLAN) / .3), paper=True)
    if t >= T_ALWAYS:
        fr = K.marker_at(fr, 'always', .78, .74, size=20, k=min(1, (t - T_ALWAYS) / .3))
    return fr


def clock(fr, txt, k=1.0):
    g = UI._new(250, 100); d = UI._D(g)
    d.rounded_rectangle((5, 5, 245, 95), 16, fill=(16, 16, 22, 255), outline=UI.INK + (255,), width=3)
    d.text((26, 14), txt, font=UI.anton(64), fill=(255, 80, 70, 255))
    fr.alpha_composite(UI.fade(g, k), (int(W * .78 - g.width / 2), int(H * .12)))
    return fr


def f6(t):
    base = K.dolly('living_room_night_gaming', t, T_F6, T_F7, amp=-P(46))
    q = K.sized(cutout('quest:gaming_excited'), h=PH * .62)
    base.alpha_composite(q, (int(PW * .32 - q.width / 2), int(PH * .97 - q.height)))
    fr = K.crop_cam(base, K.cam_lerp((1.0, .5, .5), (1.12, .45, .55), (t - T_F6) / (T_F7 - T_F6)))
    fr = clock(fr, '1:47' if t >= T_NEVER else '1:00', min(1, (t - T_F6) / .3))
    if t >= T_LAST:
        fr = K.marker_at(fr, '"last round."', .3, .2, size=24, k=min(1, (t - T_LAST) / .3), paper=True)
    return fr


def f7(t):
    fr = Image.new('RGBA', (W, H), (236, 228, 210, 255))
    d = ImageDraw.Draw(fr)
    d.rectangle((S(40), S(40), W - S(40), H - S(40)), outline=(120, 100, 70), width=Si(4))
    UI.spaced(UI._D(fr), (80, 60), 'YEARBOOK', UI.inter(26), (120, 100, 70, 255), 3)
    for i in range(2):                                                     # two silhouettes, no faces, no real people
        x = W * (.30 + .2 * i)
        d.rectangle((x - S(80), H * .22, x + S(80), H * .58), fill=(200, 192, 176), outline=(120, 100, 70), width=Si(3))
        d.ellipse((x - S(36), H * .27, x + S(36), H * .27 + S(72)), fill=(90, 86, 96))
        d.pieslice((x - S(70), H * .40, x + S(70), H * .66), 180, 360, fill=(90, 86, 96))
    if t >= T_SCHOOL:
        fr = K.marker_at(fr, 'met in high school', .40, .68, size=22, k=min(1, (t - T_SCHOOL) / .3))
    if t >= T_FIRST:                                                       # the first paid game: a falling chart
        d = ImageDraw.Draw(fr)
        k = ease(min(1, (t - T_FIRST) / .8))
        x0, y0 = W * .66, H * .26
        pts = [(x0 + S(40) * i, y0 + S(20) + S(26) * i ** 1.3) for i in range(int(1 + 5 * k))]
        if len(pts) > 1:
            d.line(pts, fill=(234, 75, 75), width=Si(6))
        fr = K.marker_at(fr, 'first paid game: did not do well', .76, .60, size=18, k=min(1, (t - T_FIRST) / .3), paper=True)
    if t >= T_SMALL:
        fr = K.marker_at(fr, 'a small game about friends', .5, .84, size=24, k=min(1, (t - T_SMALL) / .3))
    if T_FIRST + .3 <= t < T_FIRST + 1.8:                                   # coverage: close on the falling chart
        fr = K.insert_close(fr, True, .74, .42, 1.7)
    elif T_SCHOOL <= t < T_SCHOOL + 1.4:
        fr = K.insert_close(fr, True, .40, .45, 1.5)
    return fr


def f8(t):
    fr = Image.blend(K.crop_cam(K.lake_at('night', t), (1.0, .5, .5)).convert('RGB'), Image.new('RGB', (W, H), (14, 14, 22)), .4).convert('RGBA')
    import numpy as np
    rng = np.random.default_rng(4)
    n = int(70 * ease(min(1, (t - T_F8) / 2.4)))
    for i in range(n):                                                     # notifications everywhere
        x, y = rng.uniform(.05, .95) * W, rng.uniform(.08, .92) * H
        g = UI._new(170, 46); d = UI._D(g)
        d.rounded_rectangle((3, 3, 167, 43), 14, fill=(250, 248, 244, 235), outline=UI.INK + (255,), width=2)
        d.text((14, 11), rng.choice(['Bought.', "I'm in", 'tonight?', 'get it', 'Bought.']), font=UI.inter(18), fill=UI.INK + (255,))
        fr.alpha_composite(g, (int(x - g.width / 2), int(y - g.height / 2)))
    return K.punch(fr, 'MILLIONS', max(0, t - T('l43.w2')), size=96, y=.5, col=(255, 200, 61)) if t >= T('l43.w2') else fr


REFR = [(T_PLAN - .05, T_ALWAYS - .05, 1.6, .5, .5), (T_LAST - .05, T_NEVER - .05, 1.55, .32, .5),
        (T_F4 + 1.8, T_F5 - .05, 1.5, .5, .55)]


def render(t):
    K.NOW[0] = t
    K.REFRAMES[:] = REFR
    fr = (f1 if t < T_F2 else f2 if t < T_F3 else f3 if t < T_F4 else f4 if t < T_F5 else f5 if t < T_F6 else f6 if t < T_F7 else f7 if t < T_F8 else f8)(t)
    fr = fr.convert('RGB')
    d = ImageDraw.Draw(fr)
    tag(d, 'EP003 BLOCK F · FRIENDSLOP · v1 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('f1', T_CHEAP + .6), ('f2', T_INV + .8), ('f3', T_F3 + 1.0), ('f4', T_F4 + 1.5), ('f5', T_ALWAYS + .5), ('f6', T_NEVER + .5),
          ('f7', T_SMALL + .6), ('f8', T_END - .3))

if __name__ == '__main__':
    K.run_block('F', T0, T_END, render, STILLS, version=3)
