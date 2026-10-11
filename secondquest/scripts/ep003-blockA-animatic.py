#!/usr/bin/env python3
"""EP003 animatic, block A (planning): the hook, l01 "There is a game called How to Fish..." -> l07 "Why?".

The thumbnail made real (Producer-approved package: four friends crammed in a rowboat, an unimpressed fish), so the
first seconds pay off the thumbnail's promise.
  A1 l01  The lake at dusk, empty. "HOW TO FISH" marker. "A boat." the rowboat glides in; "A rod." the rod drops in;
          "A lot of fish." three fish jump around it.
  A2 l02  "And almost nobody seems to be fishing." Cut to the four of them in the boat, laughing (stand-in for NEW_ART #1;
          the two friends are grey silhouettes), the fish surfaces at the front and stares at camera.
  A3 l03  Three flashes, one per phrase: SLAP (comic hit mark), the fish money (chips on the bench), a scope over the water.
  A4 l04  The numbers: $7.99 tag; "THEY HOPED: 200,000" then a counter rolling past 10,000,000+ (estimate, early Oct.,
          source on screen).
  A5 l05  "Millions of people bought a fishing game": the lake fills with tiny boats. "To do everything else."
  A6 l06  "Together." back to the four, slow push in.
  A7 l07  "Why?": the SecondQuest wordmark lands with its gold bar (EP001/EP002 signature) and holds through 1.5 s of
          silence before block B (Producer rule, 2026-10-11).
HUD: off (real-life framing; How to Fish's world is drawn as ours). Music off. No subtitles (SUBS=1 for review only).
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
from lib import W, H, PW, PH, T, ease, lin, S, Si, P, F, subtitle, tag  # noqa
import ep003_kit as K  # noqa
import ui_kit as UI  # noqa

T0, T_END = 0.0, T('l08') - .05
T_BOAT, T_ROD, T_FISH = T('l01.w9'), T('l01.w11'), T('l01.w13')
T_A2 = T('l02') - .1
T_SLAP, T_MONEY, T_SNIPE = T('l03') - .05, T('l03.w9'), T('l03.w13')
T_A4 = T('l04') - .1
T_GOAL = T('l04.w6')            # "Its makers hoped..."
T_EST = T('l04.w16')            # "By early October..."
T_A5 = T('l05') - .1
T_ELSE = T('l05.w8')            # "To do everything else."
T_TOG = T('l06') - .1
T_WHY = T('l07') - .05

LAKE = K.plate_lake('dusk')
WL = PH * .70                                                     # the boat's waterline (plate px)
FRIENDS = [(('sil', 'quest2:laughing_pointing'), -.30, P(430), False), ('pixie:laughing_pointing', -.1, P(420), True),
           ('quest2:laughing_pointing', .12, P(440), False), (('sil', 'quest2:wave_happy'), .32, P(430), True)]


def fish_jump(base, t, t0, x, size, side=1):
    k = (t - t0) / .9
    if not 0 <= k <= 1:
        return
    f = K.sized(K.prop('fish_side'), h=size)
    f = f.rotate(side * (60 - 120 * k), expand=True, resample=Image.BICUBIC)
    if side < 0:
        f = f.transpose(Image.FLIP_LEFT_RIGHT)
    y = WL - P(260) * math.sin(math.pi * k)
    base.alpha_composite(f, (int(x + side * P(160) * k - f.width / 2), int(y - f.height / 2)))
    d = ImageDraw.Draw(base)
    for kk in (0, 1):                                                 # splash at take-off and landing
        if abs(k - kk) < .25:
            sx = x + side * P(160) * kk
            for i in range(5):
                a = math.pi * (.15 + .7 * i / 4)
                r = P(40) * (1 - abs(k - kk) * 4)
                d.line((sx, WL, sx + r * math.cos(a) * (1 if i % 2 else -1), WL - r * math.sin(a)), fill=(255, 255, 255, 200), width=Si(4))


def a1(t):
    base = LAKE.convert('RGBA')
    if t >= T_BOAT - .2:                                             # the empty boat glides in from the right
        k = ease(min(1, (t - T_BOAT + .2) / .8))
        boat = K.sized(K.prop('rowboat_side'), w=P(900))
        x = lin(PW * 1.1, PW * .5, k)
        base.alpha_composite(boat, (int(x - boat.width / 2), int(WL - boat.height * .72)))
        if t >= T_ROD - .1:                                           # the rod drops into it
            kr = ease(min(1, (t - T_ROD + .1) / .35))
            rod = K.sized(K.prop('rod'), h=P(520)).rotate(-58, expand=True, resample=Image.BICUBIC)
            base.alpha_composite(rod, (int(x - P(120)), int(lin(-rod.height, WL - boat.height * .45 - rod.height * .8, kr))))
    fish_jump(base, t, T_FISH, PW * .22, P(110), 1)
    fish_jump(base, t, T_FISH + .25, PW * .80, P(90), -1)
    fish_jump(base, t, T_FISH + .5, PW * .63, P(80), 1)
    fr = K.crop_cam(base, (1.08, .5, .52))
    if t > T0 + .3:
        fr = K.marker_at(fr, 'How to Fish', .5, .14, size=30, k=min(1, (t - T0 - .3) / .4))
    return fr


def boat4(t, cam):
    base = LAKE.convert('RGBA')
    K.boat_scene(base, PW * .5, WL, P(900), FRIENDS, t)
    return base


def a2(t):
    base = boat4(t, None)
    k = ease(min(1, (t - T_A2) / .6))                                 # the fish surfaces at the front and stares
    f = K.sized(K.prop('fish_34'), h=P(150))
    base.alpha_composite(f, (int(PW * .74), int(lin(PH * 1.02, PH * .74, k))))
    return K.crop_cam(base, K.cam_lerp((1.25, .5, .55), (1.05, .5, .55), (t - T_A2) / 2.2))


def flash(t):
    """A3: one flash per phrase (comic panels on the boat, in our style)."""
    base = boat4(t, None)
    fr = K.crop_cam(base, (1.6, .5, .5))
    d = ImageDraw.Draw(fr, 'RGBA')
    if t < T_MONEY:                                                    # SLAP
        k = min(1, (t - T_SLAP) / .15)
        cx, cy = W * .24, H * .30
        pts = [(cx + S(110 + 40 * (i % 2)) * k * math.cos(i * math.pi / 8), cy + S(90 + 30 * (i % 2)) * k * math.sin(i * math.pi / 8)) for i in range(16)]
        d.polygon(pts, fill=(255, 200, 61, 255), outline=UI.INK + (255,))
        fr = K.punch(fr, 'SLAP!', (t - T_SLAP), size=70, y=.30, col=(214, 57, 47), x=.24)
    elif t < T_SNIPE:                                                   # the fish money
        ch = K.sized(K.prop('chips'), h=S(170))
        k = ease(min(1, (t - T_MONEY) / .2))
        fr = fr.convert('RGBA'); fr.alpha_composite(ch, (int(W * .5 - ch.width / 2), int(lin(H, H * .52, k))))
        fr = K.marker_at(fr, 'the fish money', .5, .86, size=24, k=k)
    else:                                                               # the scope over the water
        fr = K.crop_cam(LAKE.convert('RGBA'), (2.2, .62, .70))
        d = ImageDraw.Draw(fr, 'RGBA')
        k = ease(min(1, (t - T_SNIPE) / .3))
        r = S(230) * (1.4 - .4 * k)
        mask = Image.new('L', (W, H), 255); ImageDraw.Draw(mask).ellipse((W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r), fill=0)
        black = Image.new('RGB', (W, H), (8, 8, 12)); fr.paste(black, (0, 0), mask)
        d = ImageDraw.Draw(fr)
        d.line((W / 2 - r, H / 2, W / 2 + r, H / 2), fill=(8, 8, 12), width=Si(3)); d.line((W / 2, H / 2 - r, W / 2, H / 2 + r), fill=(8, 8, 12), width=Si(3))
        f = K.sized(K.prop('fish_34'), h=S(70)); fr = fr.convert('RGBA'); fr.alpha_composite(f, (int(W / 2 + S(30)), int(H / 2 + S(10))))
    return fr


def a4(t):
    fr = K.crop_cam(LAKE.convert('RGBA'), (1.0, .5, .5))
    fr = Image.blend(fr.convert('RGB'), Image.new('RGB', fr.size, (20, 20, 30)), .45).convert('RGBA')
    fr = K.marker_at(fr, '$7.99', .5, .30, size=46, k=min(1, (t - T_A4) / .3))
    if t >= T_GOAL:
        g = UI.sq_tag('They hoped: 200,000', 26)
        k = min(1, (t - T_GOAL) / .3)
        fr.alpha_composite(UI.fade(g, k), (int(W / 2 - g.width / 2), int(H * .44)))
        if t >= T_EST:                                                   # crossed out
            d = ImageDraw.Draw(fr)
            kk = ease(min(1, (t - T_EST) / .25))
            y = H * .44 + g.height / 2
            d.line((W / 2 - g.width / 2 + S(14), y, W / 2 - g.width / 2 + S(14) + (g.width - S(28)) * kk, y), fill=(234, 75, 75), width=Si(6))
    if t >= T_EST:
        k = min(1, (t - T_EST) / 1.6)
        n = int(200000 + (10_000_000 - 200000) * ease(k) ** 2)
        txt = f'{n:,}' + ('+' if k >= 1 else '')
        fr = K.punch(fr, txt, (t - T_EST), size=96, y=.66, col=(255, 200, 61))
        d = ImageDraw.Draw(fr)
        d.text((W * .5 - S(170), H * .80), 'estimate · Alinea Analytics · early Oct. 2026', font=F(15), fill=(230, 230, 236))
    return fr


def a5(t):
    base = LAKE.convert('RGBA')
    n = int(min(60, 4 + 70 * ease(min(1, (t - T_A5) / 2.0))))
    import numpy as np
    rng = np.random.default_rng(9)
    spots = sorted(((rng.uniform(.04, .96), rng.uniform(.50, .98)) for _ in range(60)), key=lambda s: s[1])
    boat = K.prop('rowboat_side')
    for i, (x, y) in enumerate(spots):
        if i % 60 >= n:
            continue
        w = P(60 + 300 * (y - .5) ** 1.4 * 2)
        b = K.sized(boat, w=w)
        base.alpha_composite(b, (int(x * PW - b.width / 2), int(y * PH - b.height * .7)))
    fr = K.crop_cam(base, (1.0, .5, .5))
    if t >= T_ELSE:
        fr = K.marker_at(fr, 'to do everything else', .5, .2, size=26, k=min(1, (t - T_ELSE) / .3))
    return fr


def a6(t):
    base = boat4(t, None)
    f = K.sized(K.prop('fish_34'), h=P(150)); base.alpha_composite(f, (int(PW * .66), int(PH * .70)))
    return K.crop_cam(base, K.cam_lerp((1.05, .5, .55), (1.35, .5, .5), (t - T_TOG) / (T_END - T_TOG)))


def render(t):
    if t < T_A2:
        fr = a1(t)
    elif t < T_SLAP:
        fr = a2(t)
    elif t < T_A4:
        fr = flash(t)
    elif t < T_A5:
        fr = a4(t)
    elif t < T_TOG:
        fr = a5(t)
    else:
        fr = a6(t)
        if t >= T_WHY:                                                  # the wordmark on "Why?", held 1.5 s (Producer rule)
            fr = K.wordmark(fr, t - T_WHY)
    fr = fr.convert('RGB')
    d = ImageDraw.Draw(fr)
    tag(d, 'EP003 BLOCK A · THE HOOK · v1 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('a1', T_FISH + .4), ('a2', T_A2 + 1.2), ('a3s', T_SLAP + .3), ('a3m', T_MONEY + .4), ('a3x', T_SNIPE + .5),
          ('a4', T_EST + 1.8), ('a5', T_ELSE + .5), ('a7', T_WHY + .6), ('a7b', T_END - .1))

if __name__ == '__main__':
    K.run_block('A', T0, T_END, render, STILLS)
