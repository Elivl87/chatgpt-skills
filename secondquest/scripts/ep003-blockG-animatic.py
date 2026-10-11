#!/usr/bin/env python3
"""EP003 animatic, block G (planning): the payoff and the end, l44 "So... why did millions..." -> l52 "...our next quest."

  G1 l44      The night lake, the boat drifting, a lantern on the bench (3D). The question as a quiet card.
  G2 l45-l46  "nobody in that boat came for the fish": the fish surfaces next to the boat, waits, nobody looks; it
              swims away. "the thing you could say out loud": marker.
  G3 l47-l48  A tutorial card "HOW TO FISH" (our type, no game logo); on "Just not for fishing" FISH is struck out.
  G4 l49-l50  "the thing adults are worst at": the card's last word is erased and rewritten, letter by letter,
              "say I miss you"; then the card fades and leaves Quest and Pixie, small, in the boat under the stars.
  G5 l51-l52  CTA: "who would you put in your boat?" — the boat's empty seats glow one by one; the SecondQuest wordmark
              lands on "why?"; the CONTINUE? end-screen menu as EP002 (end-screen thirds kept clean).
Music off. HUD off.
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
from lib import ROOT, W, H, PW, PH, T, ease, lin, S, Si, P, F, cutout, subtitle, tag, PLANNING  # noqa
import ep003_kit as K  # noqa
import ui_kit as UI  # noqa

T0 = T('l44') - .05
T_END = T('l52.end') + 2.5
T_G2, T_LOUD = T('l45') - .05, T('l46') - .05
T_G3, T_NOT = T('l47') - .05, T('l48') - .05
T_G4, T_MISS = T('l49') - .05, T('l50') - .05
T_G5, T_WHY, T_COMM = T('l51') - .05, T('l51.w14'), T('l51.w16')
T_FADE = T('l50.w7')

NIGHT = K.plate_lake('night')
WL = PH * .70
DUO = [('quest2:nostalgic_smile', -.12, P(470), False), ('pixie:sitting_relaxed', .14, P(470), True)]
WORDMARK = Image.open(ROOT / 'public/art/core/brand/secondquest_wordmark.png').convert('RGBA')


def scene(t, fish=None, seats=0.0):
    base = NIGHT.convert('RGBA')
    K.boat_scene(base, PW * .5, WL, P(760), DUO, t, bob=.6)
    ln = K.sized(K.prop('lantern'), h=P(70))
    base.alpha_composite(ln, (int(PW * .5 - P(20)), int(WL - P(150))))
    glow = Image.new('RGBA', base.size); ImageDraw.Draw(glow).ellipse((PW * .5 - P(160), WL - P(260), PW * .5 + P(160), WL + P(10)), fill=(255, 210, 120, 60))
    base.alpha_composite(glow.filter(ImageFilter.GaussianBlur(P(40))))
    if fish is not None:                                                  # the fish: surfaces, waits, leaves
        k_up, k_go = fish
        f = K.buddy(P(120), blink=K.blink_at(t, every=2.8))
        x = PW * .80 + P(500) * ease(k_go); y = WL + P(40) - P(80) * ease(k_up) + P(120) * ease(k_go)
        base.alpha_composite(f, (int(x), int(y)))
    if seats > 0:                                                         # empty seats glow, one by one
        gl = Image.new('RGBA', base.size); d = ImageDraw.Draw(gl)
        for i in range(2):
            k = max(0, min(1, seats * 2 - i))
            if k <= 0:
                continue
            x = PW * .5 + (-.34 if i == 0 else .36) * P(760)
            d.ellipse((x - P(70) * k, WL - P(190), x + P(70) * k, WL - P(60)), fill=(255, 220, 120, int(170 * k)))
        base.alpha_composite(gl.filter(ImageFilter.GaussianBlur(P(22))))
    return base


def g1(t):
    fr = K.crop_cam(scene(t), K.cam_lerp((1.0, .5, .5), (1.15, .5, .52), (t - T0) / (T_G2 - T0)))
    return fr


def g2(t):
    k_up = min(1, (t - T_G2) / .8); k_go = max(0, min(1, (t - T_LOUD - .4) / 1.5))
    fr = K.crop_cam(scene(t, (k_up, k_go)), (1.15, .55, .55))
    if t >= T_LOUD:
        fr = K.marker_at(fr, 'the thing you could say out loud', .5, .16, size=22, k=min(1, (t - T_LOUD) / .3), paper=True)
    return fr


def tutorial(last, strike=0.0, cursor=False):
    g = UI.sq_box(640, 150, r=20)
    d = UI._D(g)
    UI.spaced(d, (40, 26), 'TUTORIAL', UI.inter(16), UI.GOLD + (255,), 3)
    txt = 'HOW TO ' + last
    d.text((40, 56), txt, font=UI.anton(60), fill=(255, 255, 255, 255))
    if strike > 0:
        x0 = 40 + d.textlength('HOW TO ', font=UI.anton(60))
        x1 = x0 + d.textlength(last, font=UI.anton(60)) * strike
        d.line((x0, 98, x1, 98), fill=(234, 75, 75, 255), width=7)
    if cursor:
        x = 40 + d.textlength(txt, font=UI.anton(60)) + 6
        d.rectangle((x, 64, x + 5, 126), fill=(255, 255, 255, 255))
    return g


def g3(t):
    fr = Image.blend(K.crop_cam(scene(t), (1.15, .55, .55)).convert('RGB'), Image.new('RGB', (W, H), (10, 10, 20)), .45).convert('RGBA')
    strike = ease(min(1, (t - T_NOT - .2) / .4)) if t >= T_NOT else 0
    g = tutorial('FISH', strike)
    fr.alpha_composite(UI.fade(g, min(1, (t - T_G3) / .3)), (int(W / 2 - g.width / 2), int(H * .40 - g.height / 2)))
    return fr


def g4(t):
    fr = Image.blend(K.crop_cam(scene(t), K.cam_lerp((1.15, .55, .55), (1.0, .5, .5), (t - T_FADE) / 2.5)).convert('RGB'), Image.new('RGB', (W, H), (10, 10, 20)), .45 * (1 - max(0, min(1, (t - T_FADE) / 1.5)))).convert('RGBA')
    if t < T_MISS:
        g = tutorial('FISH', 1.0)
    else:                                                                 # erased, then written: say "I miss you"
        target = 'SAY "I MISS YOU"'
        n = int(len(target) * min(1, (t - T_MISS - .2) / 1.2))
        g = tutorial(target[:n], 0, cursor=int(t * 3) % 2 == 0)
    a = 1 - max(0, min(1, (t - T_FADE - .5) / 1.2))
    fr.alpha_composite(UI.fade(g, a), (int(W / 2 - g.width / 2), int(H * .40 - g.height / 2)))
    return fr


def wordmark(fr, dt):
    wh = int(H * .11); ww = int(WORDMARK.width * wh / WORDMARK.height)
    wm = WORDMARK.resize((ww, wh), Image.LANCZOS)
    x = min(1, dt / .28); c = 1.70158
    e = 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
    sc = 1.3 + (1 - 1.3) * e
    wm = wm.resize((max(1, int(ww * sc)), max(1, int(wh * sc))), Image.LANCZOS)
    fr.alpha_composite(UI.fade(wm, min(1, x * 4)), (int(W / 2 - wm.width / 2), int(H * .06)))
    return fr


def continue_menu(fr, t, a):
    """The end as a game's CONTINUE? menu (as EP002): NEXT QUEST (video) and JOIN THE PARTY (subscribe)."""
    items = (('NEXT QUEST', W * .04, H * .34 - S(50), False), ('JOIN THE PARTY', W * .95, H * .56 - S(50), True))
    sel = int(max(0, t - T_COMM - .6) / 1.4) % 2
    title = UI.fade(UI.area_title('CONTINUE?', size=34, band=True, rules=False), a)
    fr.alpha_composite(title, (int(W * .04), int(H * .34 - S(112))))
    for i, (txt, x, y, right) in enumerate(items):
        g = UI.sq_tag(txt, 20, col=UI.GOLD if sel == i else (225, 228, 240))
        gx = x - g.width if right else x
        fr.alpha_composite(UI.fade(g, a), (int(gx), int(y)))
        if sel == i:
            cx, cy = gx - S(4) + S(3) * math.sin(t * 8), y + g.height / 2
            ImageDraw.Draw(fr).polygon([(cx - S(16), cy - S(11)), (cx, cy), (cx - S(16), cy + S(11))], fill=UI.GOLD + (int(255 * a),), outline=UI.INK + (int(255 * a),))
    return fr


def g5(t):
    seats = min(1, (t - T_G5 - .6) / 1.6)
    fr = K.crop_cam(scene(t, seats=seats), K.cam_lerp((1.0, .5, .5), (1.0, .5, .58), (t - T_G5) / 3))
    if t >= T_WHY:
        fr = K.wordmark(fr, t - T_WHY, y=.06, h=.11)
    fr = K.fish_into_star(fr, t, T_WHY + .6, start=(.88, .95), y=.06, h=.11)   # the companion's book-end (RULE)
    if t >= T_COMM:
        fr = continue_menu(fr, t, min(1, (t - T_COMM) / .5))
    return fr


def render(t):
    fr = (g1 if t < T_G2 else g2 if t < T_G3 else g3 if t < T_G4 else g4 if t < T_G5 else g5)(t)
    fr = fr.convert('RGB')
    d = ImageDraw.Draw(fr)
    tag(d, 'EP003 BLOCK G · PAYOFF + END · v1 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('g1', T0 + 1.5), ('g2', T_LOUD + 1.0), ('g3', T_NOT + .9), ('g4', T_MISS + 1.6), ('g4b', T_FADE + 2.0), ('g5', T_WHY + .3),
          ('g5m', T_END - .3))

if __name__ == '__main__':
    K.run_block('G', T0, T_END, render, STILLS)
