#!/usr/bin/env python3
"""EP003 animatic, block C (planning): the adult way, l12 "Now compare that..." -> l20 "Eight dollars removes the asking."

  C1 l12      City apartments at evening (REUSE): adult life. Marker "the other way".
  C2 l13-l16  Another chat, THE GROUP: "We should hang out." / "Yes! Definitely." / "I'm free in three weeks." /
              "Three weeks works." — each bubble on its line.
  C3 l17      "three weeks later": the calendar (REUSE calendar_friday) with three pages tearing off; "kid is sick": a
              thermometer card (no child on screen); "car ... new noise": Quest stressed at the wheel in traffic (REUSE)
              with a "clunk?" marker; "the plan quietly dies": the chat greys out and sinks.
  C4 l18      An empty message box, the cursor blinking. markers: "not distance", "not even time" (cream), "asking" (gold).
              "Proposing a plan means admitting you want one": the cursor keeps blinking, nothing typed.
  C5 l19      A sunny doorway (drawn by code): "Want to play?" handwritten in the light; "we lost that sentence": the
              words drift away; "nobody told us what replaced it": the door closes to the dim room.
  C6 l20      Back to the empty message box: a $7.99 stamp lands on it: "removes the asking".
HUD off (real life). Music off.
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
from lib import ROOT, W, H, PW, PH, T, ease, lin, S, Si, P, F, cutout, subtitle, tag  # noqa
import ep003_kit as K  # noqa
import ui_kit as UI  # noqa

T0, T_END = T('l12') - .05, T('l21') - .05
T_C2 = T('l13') - .1
T_LINES = [T('l13'), T('l14'), T('l15'), T('l16')]
T_C3 = T('l17') - .05
T_KID, T_CAR, T_DIES = T('l17.w5'), T('l17.w9'), T('l17.w16')
T_C4 = T('l18') - .05
T_DIST, T_TIME, T_ASK, T_PROP = T('l18.w12'), T('l18.w14'), T('l18.w18'), T('l18.w20')
T_C5 = T('l19') - .05
T_WANT, T_LOST, T_NOBODY = T('l19.w16'), T('l19.w19'), T('l19.w26')
T_C6 = T('l20') - .05

PLATE = lambda name: Image.open(ROOT / f'public/art/core/backgrounds/{name}.png').convert('RGB').resize((PW, PH), Image.LANCZOS)
CITY = PLATE('city_apartments_evening')
TRAFFIC = PLATE('city_traffic')
ROOM_N = PLATE('home_living_night')
CAL = Image.open(ROOT / 'public/art/core/objects/calendar_friday.png').convert('RGBA')
DRIVE = cutout('quest:drive_stressed')


def group_msgs():
    return [(T_LINES[0], 'Q', 'We should hang out.', 'msg'), (T_LINES[1], 'P', 'Yes! Definitely.', 'msg'),
            (T_LINES[2], 'A', "I'm free in three weeks.", 'msg'), (T_LINES[3], 'Q', 'Three weeks works.', 'msg')]


def dark(fr, k=.4):
    return Image.blend(fr.convert('RGB'), Image.new('RGB', fr.size, (14, 14, 22)), k).convert('RGBA')


def c1(t):
    fr = K.crop_cam(CITY.convert('RGBA'), K.cam_lerp((1.0, .5, .5), (1.15, .55, .45), (t - T0) / 4))
    return K.marker_at(fr, 'the other way', .5, .15, size=26, k=min(1, (t - T0 - .4) / .3))


def c2(t, grey=0.0, sink=0.0):
    fr = dark(K.crop_cam(CITY.filter(ImageFilter.GaussianBlur(P(9))).convert('RGBA'), (1.15, .55, .45)))
    ph = K.phone_chat(group_msgs(), t, title='THE GROUP', grey=grey)
    k = ease(min(1, (t - T_C2) / .4))
    if k < 1 or sink > 0:
        fr.alpha_composite(ph, (int(W / 2 - ph.width / 2), int(lin(H, H * .5 - ph.height / 2, k) + sink * H)))
    else:                                                                 # coverage: close-up on each new line
        fr = K.place_phone(fr, ph, t, T_LINES)
    return fr


def thermometer(h):
    g = UI._new(h * .5, h); d = UI._D(g)
    w = h * .5
    d.rounded_rectangle((w * .38, 4, w * .62, h * .78), w * .12, fill=(255, 255, 255, 255), outline=UI.INK + (255,), width=3)
    d.ellipse((w * .2, h * .66, w * .8, h - 4), fill=(234, 75, 75, 255), outline=UI.INK + (255,), width=3)
    d.rectangle((w * .45, h * .25, w * .55, h * .75), fill=(234, 75, 75, 255))
    return g


def c3(t):
    if t < T_KID:                                                          # three weeks: the calendar pages tear off
        fr = dark(K.crop_cam(ROOM_N.convert('RGBA'), (1.1, .5, .5)), .3)
        c = K.sized(CAL, h=S(380))
        n = int(min(3, (t - T_C3) / .35))
        for i in range(3 - n):
            fr.alpha_composite(c, (int(W / 2 - c.width / 2 + S(4) * i), int(H * .45 - c.height / 2 + S(4) * i)))
        if n < 3:
            k = ((t - T_C3) / .35) % 1
            p = c.rotate(-25 * k, expand=True); p = UI.fade(p, 1 - k)
            fr.alpha_composite(p, (int(W / 2 - c.width / 2 + S(260) * k), int(H * .45 - c.height / 2 - S(80) * k)))
        else:
            fr.alpha_composite(c, (int(W / 2 - c.width / 2), int(H * .45 - c.height / 2)))
        return K.marker_at(fr, '3 weeks later', .5, .88, size=26, k=min(1, (t - T_C3) / .3))
    if t < T_CAR:                                                          # somebody's kid is sick
        fr = dark(K.crop_cam(ROOM_N.convert('RGBA'), (1.2, .5, .55)), .2)
        th = thermometer(S(260) / (W / 1280))
        th = K.sized(th, h=S(260))
        fr.alpha_composite(th, (int(W * .5 - th.width / 2), int(H * .42 - th.height / 2)))
        return K.marker_at(fr, "sorry, kid's sick", .5, .82, size=24, k=min(1, (t - T_KID) / .3), paper=True)
    if t < T_DIES:                                                         # the car's new noise
        base = TRAFFIC.convert('RGBA')
        q = K.sized(DRIVE, h=PH * .78)
        base.alpha_composite(q, (int(PW * .5 - q.width / 2), int(PH - q.height)))
        fr = K.crop_cam(base, K.cam_lerp((1.05, .5, .5), (1.2, .5, .45), (t - T_CAR) / 3))
        shake = S(4) * math.sin(t * 40) if int(t * 3) % 2 == 0 else 0
        return K.marker_at(fr, 'clunk... clunk?', .78 + shake / W, .25, size=24, k=min(1, (t - T_CAR - .3) / .3), paper=True)
    k = min(1, (t - T_DIES) / 2.2)                                         # the plan dies in the chat
    return c2(t, grey=k, sink=.15 * ease(max(0, k - .5) * 2))


def cursor_box(fr, t, stamp=None):
    """An empty message box, the cursor blinking."""
    g = UI._new(760, 120); d = UI._D(g)
    d.rounded_rectangle((10, 10, 750, 110), 50, fill=(255, 255, 255, 255), outline=UI.INK + (255,), width=4)
    d.text((60, 42), 'Message...', font=UI.inter(30, 600), fill=(170, 166, 160, 255))
    if int(t * 2.2) % 2 == 0:
        d.rectangle((52, 34, 56, 86), fill=UI.INK + (255,))
    fr = fr.convert('RGBA'); fr.alpha_composite(g, (int(W / 2 - g.width / 2), int(H * .45 - g.height / 2)))
    return fr


def c4(t):
    fr = dark(K.crop_cam(ROOM_N.convert('RGBA'), (1.0, .5, .5)), .5)
    fr = cursor_box(fr, t)
    for t0, txt, x, ok in ((T_DIST, 'not distance', .22, False), (T_TIME, 'not even time', .5, False), (T_ASK, 'asking', .78, True)):
        if t >= t0:
            fr = K.marker_at(fr, txt, x, .72, size=26 if ok else 22, k=min(1, (t - t0) / .25), paper=not ok)
    return fr


def doorway(t):
    """C5: a sunny doorway seen from a dim hall; the door swings shut on 'nobody told us'."""
    fr = Image.new('RGB', (W, H), (52, 46, 44))
    d = ImageDraw.Draw(fr, 'RGBA')
    dx0, dy0, dx1, dy1 = W * .36, H * .12, W * .64, H * .95
    out = Image.new('RGB', (int(dx1 - dx0), int(dy1 - dy0)))
    K._grad(out, (150, 205, 245), (255, 236, 190), 0, out.height * .55)
    od = ImageDraw.Draw(out); od.rectangle((0, out.height * .55, out.width, out.height), fill=(110, 170, 90))
    od.ellipse((out.width * .55, out.height * .1, out.width * .8, out.height * .25), fill=(255, 245, 210))
    fr.paste(out, (int(dx0), int(dy0)))
    glow = Image.new('RGBA', (W, H)); ImageDraw.Draw(glow).polygon([(dx0, dy1), (dx1, dy1), (W * .82, H), (W * .18, H)], fill=(255, 236, 190, 90))
    fr = fr.convert('RGBA'); fr.alpha_composite(glow.filter(ImageFilter.GaussianBlur(S(12))))
    d = ImageDraw.Draw(fr)
    d.rectangle((dx0 - S(16), dy0 - S(16), dx1 + S(16), dy1), outline=(120, 84, 52), width=Si(16))
    if t >= T_NOBODY:                                                       # the door swings shut
        k = ease(min(1, (t - T_NOBODY) / .9))
        x = lin(dx0, dx1, 1 - k)
        d.polygon([(dx0, dy0), (dx0 + (dx1 - dx0) * k, dy0 + S(10) * (1 - k)), (dx0 + (dx1 - dx0) * k, dy1 - S(10) * (1 - k)), (dx0, dy1)], fill=(96, 64, 40), outline=UI.INK)
    if T_WANT <= t:
        k = min(1, (t - T_WANT) / .4)
        drift = max(0, t - T_LOST)
        g = UI._new(420, 90); gd = UI._D(g)
        gd.text((10, 6), 'Want to play?', font=UI.inter(52, 800), fill=(255, 255, 255, 255), stroke_width=4, stroke_fill=UI.INK + (255,))
        g = UI.fade(g, k * max(0, 1 - drift / 2.5))
        fr.alpha_composite(g, (int(W / 2 - g.width / 2 + S(120) * drift), int(H * .48 - g.height / 2 - S(60) * drift)))
    return fr


def c6(t):
    fr = c4(t)
    k = min(1, (t - T_C6 - .1) / .25)
    fr = K.punch(fr, '$7.99', max(0, t - T_C6 - .1), size=110, y=.45, col=(255, 200, 61))
    return fr


REFR = [(T_DIST - .05, T_TIME - .05, 1.35, .3, .5), (T_ASK - .05, T_PROP - .05, 1.5, .7, .55)]


def render(t):
    K.NOW[0] = t
    K.REFRAMES[:] = REFR
    if t < T_C2:
        fr = c1(t)
    elif t < T_C3:
        fr = c2(t)
    elif t < T_C4:
        fr = c3(t)
    elif t < T_C5:
        fr = c4(t)
    elif t < T_C6:
        fr = doorway(t)
    else:
        fr = c6(t)
    fr = fr.convert('RGB')
    d = ImageDraw.Draw(fr)
    tag(d, 'EP003 BLOCK C · THE ADULT WAY · v1 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('c1', T0 + 1.5), ('c2', T_LINES[3] + .6), ('c3a', T_C3 + 1.3), ('c3k', T_KID + .6), ('c3c', T_CAR + 1.0), ('c3d', T_DIES + 1.8),
          ('c4', T_ASK + .6), ('c5', T_WANT + .5), ('c5b', T_NOBODY + 1.0), ('c6', T_C6 + .6))

if __name__ == '__main__':
    K.run_block('C', T0, T_END, render, STILLS, version=2)
