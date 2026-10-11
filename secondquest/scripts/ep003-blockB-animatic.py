#!/usr/bin/env python3
"""EP003 animatic, block B (planning): the invitation, l08 "Start with the price..." -> l11 "...He will not get it later."

  B1 l08  Night living room (REUSE living_room_night_gaming). The $7.99 tag flips into a cream invitation card:
          "YOU'RE INVITED" on "It's an invitation."
  B2 l09  "not really a game you play alone": four avatars in a row, each gets its own game box ("their own copy").
          "A message in a group chat": the phone slides up; A friend: "It's eight dollars. Just get it."
  B3 l10  "Bought. Bought. Bought." stickers pop on each word (Pixie, Quest, A friend).
  B4 l11  B friend: "I'll get it later." The chat holds; on "He will not get it later." his avatar greys out and a tiny
          "last seen: 3 weeks ago" appears (deadpan).
HUD off (real life). Music off.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
from lib import ROOT, W, H, PW, PH, T, ease, lin, S, Si, P, F, subtitle, tag  # noqa
import ep003_kit as K  # noqa
import ui_kit as UI  # noqa

T0, T_END = T('l08') - .05, T('l12') - .05
T_INV = T('l08.w12')
T_B2 = T('l09') - .05
T_COPY = T('l09.w11')
T_CHAT = T('l09.w26')
T_MSG = T('l09.w32')
T_BOUGHT = [T('l10.w6'), T('l10.w7'), T('l10.w8')]
T_LATER = T('l11.w6')
T_NOT = T('l11.w10')

ROOM = Image.open(ROOT / 'public/art/core/backgrounds/living_room_night_gaming.png').convert('RGB').resize((PW, PH), Image.LANCZOS)
ROOM_BLUR = ROOM.filter(ImageFilter.GaussianBlur(P(10)))
BOX = K.gamebox()


def msgs():
    m = [(T_MSG, 'A', "It's eight dollars. Just get it.", 'msg')]
    m += [(t, w, 'Bought.', 'sticker') for t, w in zip(T_BOUGHT, 'PQA')]
    m += [(T_LATER, 'B', "I'll get it later.", 'msg')]
    return m


def b1(t):
    fr = K.crop_cam(ROOM.convert('RGBA'), K.cam_lerp((1.0, .5, .5), (1.12, .5, .5), (t - T0) / 4))
    if t < T_INV - .15:
        return K.marker_at(fr, '$7.99', .5, .45, size=54, k=min(1, (t - T0) / .3))
    k = min(1, (t - T_INV + .15) / .35)
    sq = abs(1 - 2 * k)                                                   # a card flip: squash to 0 and back
    g = UI.marker('$7.99', size=54) if k < .5 else UI.marker("You're invited", size=40, paper=True)
    g = g.resize((max(1, int(g.width * max(.02, sq))), g.height), Image.LANCZOS)
    fr = fr.convert('RGBA'); fr.alpha_composite(g, (int(W / 2 - g.width / 2), int(H * .45 - g.height / 2)))
    return fr


def b2(t):
    fr = K.crop_cam(ROOM_BLUR.convert('RGBA'), (1.12, .5, .5))
    fr = Image.blend(fr.convert('RGB'), Image.new('RGB', fr.size, (14, 14, 22)), .35).convert('RGBA')
    if t < T_CHAT:                                                        # four avatars, each with its own copy
        d = ImageDraw.Draw(fr)
        for i, who in enumerate('QPAB'):
            x, y = W * (.2 + .2 * i), H * .42
            k = ease(min(1, (t - T_B2 - i * .12) / .3))
            if k <= 0:
                continue
            col, _ = K.NAMES[who]
            r = S(46) * k
            d.ellipse((x - r, y - r, x + r, y + r), fill=col, outline=UI.INK, width=Si(3))
            f = UI.inter(40 * k); lab = 'QPAB'[i]
            d.text((x - d.textlength(lab, font=f) / 2, y - S(25) * k), lab, font=f, fill=(255, 255, 255))
            if t >= T_COPY + i * .15:
                kb = ease(min(1, (t - T_COPY - i * .15) / .3))
                b = K.sized(BOX, h=S(90) * kb + 1)
                fr.alpha_composite(b, (int(x - b.width / 2), int(y + S(60))))
                d = ImageDraw.Draw(fr)
        if t >= T_COPY:
            fr = K.marker_at(fr, 'everyone buys their own copy', .5, .82, size=22, k=min(1, (t - T_COPY) / .3))
        return fr
    k = ease(min(1, (t - T_CHAT) / .45))
    ph = K.phone_chat(msgs(), t, typing=T_CHAT + .2 if t < T_MSG else None)
    fr.alpha_composite(ph, (int(W / 2 - ph.width / 2), int(lin(H, H * .5 - ph.height / 2, k))))
    return fr


def b4(t):
    fr = b2(t)
    if t >= T_NOT:                                                        # he greys out; "last seen"
        k = min(1, (t - T_NOT) / .4)
        fr = K.marker_at(fr, 'last seen: 3 weeks ago', .80, .78, size=18, k=k, paper=True)
    return fr


def render(t):
    fr = b1(t) if t < T_B2 else b2(t) if t < T_LATER else b4(t)
    fr = fr.convert('RGB')
    d = ImageDraw.Draw(fr)
    tag(d, 'EP003 BLOCK B · THE INVITATION · v1 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('b1', T_INV + .6), ('b2', T_COPY + 1.0), ('b2c', T_MSG + .6), ('b3', T_BOUGHT[2] + .4), ('b4', T_NOT + .8))

if __name__ == '__main__':
    K.run_block('B', T0, T_END, render, STILLS)
