#!/usr/bin/env python3
"""EP003 animatic, block D (planning): why fishing, l21 "But why fishing?" -> l26 "It fits in a group chat."

  D1 l21      The lake by day, empty; a rod leaning out of frame over the water. Marker "why fishing?".
  D2 l22      Two cards: "1 · how to meet" (ticked by the $7.99 tag) and "2 · what to do once you're there".
  D3 l23      A snapshot of the boat (polaroid, the four of them, stand-in): the fish in it is blurred and cut off;
              "who was in the boat" circles the faces.
  D4 l24      Quest and Pixie side by side in the boat, both looking at the water, not at each other. A slow, long
              push in; the line in the water. "a reason" / "a job" markers on the last phrase.
  D5 l25      The alibis, one panel each: a golf course drawn by code + our 3D flag; poker night (3D chips under a lamp); the garage
              (workshop + Quest with a wrench). "Nobody... for the golf, the cards or the car": each crossed. "Every
              generation...": the three panels side by side.
  D6 l26      "The newest one": the phone, our game box in a bubble: "It fits in a group chat."
HUD off. Music off.
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
from lib import ROOT, W, H, PW, PH, T, ease, lin, S, Si, P, F, cutout, subtitle, tag  # noqa
import ep003_kit as K  # noqa
import ui_kit as UI  # noqa

T0, T_END = T('l21') - .05, T('l27') - .05
T_D2 = T('l22') - .05
T_MEET, T_THERE = T('l22.w7'), T('l22.w11')
T_D3 = T('l23') - .05
T_WHO = T('l23.w14')
T_D4 = T('l24') - .05
T_REASON, T_JOB = T('l24.w33'), T('l24.w40')
T_D5 = T('l25') - .05
T_GOLF, T_POKER, T_CAR = T('l25.w11'), T('l25.w14'), T('l25.w17')
T_NOBODY, T_GEN = T('l25.w27'), T('l25.w42')
T_D6 = T('l26') - .05
T_FITS = T('l26.w9')

LAKE_DAY = K.plate_lake('day')
LAKE = K.plate_lake('dusk')
WL = PH * .70


def golf_green():
    """A golf course drawn by code (the farm field read as farmland): sky, rolling fairway stripes, the green."""
    img = Image.new('RGB', (PW, PH))
    K._grad(img, (120, 175, 225), (215, 232, 240), 0, PH * .45)
    d = ImageDraw.Draw(img)
    import math as m
    for i, col in enumerate(((96, 150, 80), (110, 168, 86), (122, 182, 92))):
        y0 = PH * (.40 + .06 * i)
        d.polygon([(0, PH)] + [(x, y0 - P(30) * m.sin(x / PW * 5 + i)) for x in range(0, PW + 1, 40)] + [(PW, PH)], fill=col)
    for j in range(6):                                                       # mowing stripes
        y = PH * (.62 + .07 * j)
        d.rectangle((0, y, PW, y + PH * .035), fill=(132, 192, 100))
    d.ellipse((PW * .40, PH * .70, PW * .80, PH * .86), fill=(150, 205, 110))     # the green
    d.ellipse((PW * .575, PH * .775, PW * .595, PH * .79), fill=(30, 30, 30))
    return img


FIELD = golf_green()
SHOP = Image.open(ROOT / 'public/art/genres/farming/backgrounds/workshop.png').convert('RGB').resize((PW, PH), Image.LANCZOS)
WRENCH = cutout('quest:wrench_fixing')
DUO = [('quest2:nostalgic_smile', -.12, P(470), False), ('pixie:sitting_relaxed', .14, P(470), True)]
FOUR = [(('sil', 'quest2:laughing_pointing'), -.30, P(430), False), ('pixie:laughing_pointing', -.1, P(420), True),
        ('quest2:laughing_pointing', .12, P(440), False), (('sil', 'quest2:wave_happy'), .32, P(430), True)]


def d1(t):
    base = LAKE_DAY.convert('RGBA')
    rod = K.sized(K.prop('rod'), h=PH * .9).rotate(-62, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(rod, (int(-rod.width * .15), int(PH * .35)))
    dd = ImageDraw.Draw(base)
    dd.line((PW * .62, PH * .40, PW * .64, WL), fill=(240, 240, 240), width=max(1, int(P(2))))   # the line into the water
    fr = K.crop_cam(base, K.cam_lerp((1.0, .5, .5), (1.1, .55, .5), (t - T0) / 3))
    return K.marker_at(fr, 'why fishing?', .5, .15, size=28, k=min(1, (t - T0 - .3) / .3))


def d2(t):
    fr = Image.blend(K.crop_cam(LAKE_DAY.convert('RGBA'), (1.1, .55, .5)).convert('RGB'), Image.new('RGB', (W, H), (14, 14, 22)), .5).convert('RGBA')
    if t >= T_MEET - .2:
        g = UI.sq_tag('1 · how to meet', 26)
        fr.alpha_composite(UI.fade(g, min(1, (t - T_MEET + .2) / .3)), (int(W * .5 - g.width / 2), int(H * .30)))
        fr = K.marker_at(fr, '$7.99 ✔'.replace(' ✔', ''), .78, .34, size=22, k=min(1, (t - T_MEET) / .3))
    if t >= T_THERE - .2:
        g = UI.sq_tag("2 · what to do once you're there", 26, col=UI.GOLD)
        fr.alpha_composite(UI.fade(g, min(1, (t - T_THERE + .2) / .3)), (int(W * .5 - g.width / 2), int(H * .52)))
    return fr


def d3(t):
    fr = Image.new('RGBA', (W, H), (40, 34, 30, 255))
    base = LAKE.convert('RGBA')
    K.boat_scene(base, PW * .5, WL, P(900), FOUR, 0)
    photo = K.crop_cam(base, (1.5, .5, .5)).resize((Si(620), Si(349)))
    f = K.sized(K.prop('fish_side'), h=S(120)).filter(ImageFilter.GaussianBlur(S(5)))
    photo.alpha_composite(f, (photo.width - f.width // 2, photo.height - f.height))
    pol = Image.new('RGBA', (photo.width + Si(36), photo.height + Si(110)), (250, 248, 240, 255))
    pol.alpha_composite(photo, (Si(18), Si(18)))
    ImageDraw.Draw(pol).text((Si(30), photo.height + Si(40)), 'the lake, that summer', font=UI.inter(26, 600), fill=(70, 66, 60))
    k = ease(min(1, (t - T_D3) / .5))
    pol = pol.rotate(-4 + 2 * k, expand=True, resample=Image.BICUBIC)
    fr.alpha_composite(pol, (int(W / 2 - pol.width / 2), int(lin(H, H * .47 - pol.height / 2, k))))
    if t >= T_WHO:
        d = ImageDraw.Draw(fr)
        kk = ease(min(1, (t - T_WHO) / .5))
        cx, cy, rx, ry = W * .5, H * .36, S(250), S(90)
        d.arc((cx - rx, cy - ry, cx + rx, cy + ry), -90, -90 + 360 * kk, fill=(234, 75, 75), width=Si(6))
        fr = K.marker_at(fr, 'who was in the boat', .5, .90, size=24, k=kk)
    return fr


def d4(t):
    base = LAKE.convert('RGBA')
    K.boat_scene(base, PW * .5, WL, P(760), DUO, t, bob=.5)
    dd = ImageDraw.Draw(base)
    dd.line((PW * .62, PH * .45, PW * .70, WL + P(30)), fill=(240, 240, 240), width=max(1, int(P(2))))
    fr = K.crop_cam(base, K.cam_lerp((1.0, .5, .55), (1.5, .5, .5), (t - T_D4) / (T_D5 - T_D4)))
    if t >= T_REASON:
        fr = K.marker_at(fr, 'a reason', .30, .82, size=24, k=min(1, (t - T_REASON) / .3), paper=True)
    if t >= T_JOB:
        fr = K.marker_at(fr, 'a job', .70, .82, size=24, k=min(1, (t - T_JOB) / .3))
    return fr


def panel(which, t):
    if which == 'golf':
        base = FIELD.convert('RGBA')
        fl = K.sized(K.prop('golf_flag'), h=PH * .45); base.alpha_composite(fl, (int(PW * .585 - P(4)), int(PH * .785 - fl.height)))
        return K.crop_cam(base, (1.1, .55, .55))
    if which == 'poker':
        fr = Image.new('RGBA', (W, H), (16, 40, 28, 255))
        d = ImageDraw.Draw(fr)
        d.ellipse((W * .1, H * .45, W * .9, H * 1.3), fill=(30, 100, 60))
        lamp = Image.new('RGBA', (W, H)); ImageDraw.Draw(lamp).polygon([(W * .45, 0), (W * .55, 0), (W * .85, H), (W * .15, H)], fill=(255, 236, 190, 60))
        fr.alpha_composite(lamp.filter(ImageFilter.GaussianBlur(S(20))))
        ch = K.sized(K.prop('chips'), h=S(220)); fr.alpha_composite(ch, (int(W / 2 - ch.width / 2), int(H * .6 - ch.height / 2)))
        return fr
    base = SHOP.convert('RGBA')
    q = K.sized(WRENCH, h=PH * .7); base.alpha_composite(q, (int(PW * .5 - q.width / 2), int(PH * .95 - q.height)))
    return K.crop_cam(base, (1.0, .5, .5))


def d5(t):
    if t < T_GEN:
        which = 'golf' if t < T_POKER else 'poker' if t < T_CAR else 'car'
        if t < T_GOLF:
            which = 'golf'
        fr = panel(which, t)
        if t >= T_NOBODY:                                                  # nobody is there for it
            fr = K.marker_at(fr, {'golf': 'not for the golf', 'poker': 'not for the cards', 'car': 'not for the car'}[which], .5, .15, size=24, k=1, paper=True)
        return fr
    fr = Image.new('RGBA', (W, H), (20, 20, 30, 255))                     # the three, side by side
    k = ease(min(1, (t - T_GEN) / .5))
    for i, which in enumerate(('golf', 'poker', 'car')):
        p = panel(which, t).resize((Si(400), Si(225)))
        x = W * (.18 + .32 * i) - p.width / 2
        fr.alpha_composite(p, (int(x), int(lin(H, H * .38, ease(min(1, k * 1.5 - i * .25))))))
    return K.marker_at(fr, 'an excuse to sit next to each other', .5, .78, size=24, k=min(1, (t - T_GEN - .4) / .3))


def d6(t):
    fr = Image.blend(K.crop_cam(LAKE.convert('RGBA'), (1.0, .5, .5)).convert('RGB'), Image.new('RGB', (W, H), (14, 14, 22)), .5).convert('RGBA')
    ph = K.phone_chat([(T_D6 + .3, 'A', 'new one. $7.99. tonight?', 'msg'), (T_FITS, 'Q', 'in.', 'sticker')], t, title='THE BOAT')
    fr.alpha_composite(ph, (int(W / 2 - ph.width / 2), int(H * .5 - ph.height / 2)))
    b = K.sized(K.gamebox(), h=S(120))
    if t >= T_D6 + .5:
        fr.alpha_composite(b, (int(W * .5 - S(150)), int(H * .5 - S(10))))
    return fr


def render(t):
    fr = (d1 if t < T_D2 else d2 if t < T_D3 else d3 if t < T_D4 else d4 if t < T_D5 else d5 if t < T_D6 else d6)(t)
    fr = fr.convert('RGB')
    d = ImageDraw.Draw(fr)
    tag(d, 'EP003 BLOCK D · WHY FISHING · v1 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('d1', T0 + 1.5), ('d2', T_THERE + .6), ('d3', T_WHO + .8), ('d4', T_D4 + 4), ('d4j', T_JOB + .5), ('d5g', T_GOLF + .6),
          ('d5p', T_POKER + .5), ('d5c', T_NOBODY + .5), ('d5all', T_GEN + 1.2), ('d6', T_FITS + .5))

if __name__ == '__main__':
    K.run_block('D', T0, T_END, render, STILLS)
