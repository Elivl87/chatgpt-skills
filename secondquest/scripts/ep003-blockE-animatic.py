#!/usr/bin/env python3
"""EP003 animatic, block E (planning): the alibi falls apart, l27 "And like every good alibi..." -> l35 "...who wasn't there."

  E1 l27  A parchment list on the boat's bench: "A boat" / "A rod" / "A goal", ticked on each word.
  E2 l28  "gets rid of it almost immediately": the list flies overboard, splash.
  E3 l29  A shop strip, one item per phrase: "nothing" (empty slot) -> guns + dynamite -> sell the catch (fish -> coin) ->
          gamble (chips) -> bosses (a huge fish shadow under the boat). Then the Steam quote, verbatim, in our own card
          (no store UI), credited "developer description, Steam store page".
  E4 l30  "The goal is still there": GOAL: CATCH FISH, then "the goal is the alibi": the word GOAL is stamped ALIBI.
  E5 l31  "mostly failure": the boat at dusk, a deadpan FAILURE stamp.
  E6 l32  Failure montage, one gag per phrase: Quest falls in (splash); Pixie with dynamite "not designed for fish";
          the savings gone, everyone points at someone else; someone launched across the island in an arc (comic
          exaggeration, our drawing).
  E7 l33  KO: Quest flat in the boat with stars; picked up... SLAP (comic hit mark), he is back.
  E8 l34  Deadpan two-shot, marker "how most friendships handle feelings".
  E9 l35  Years later, the group chat: "remember the dynamite night" / "who gambled the savings" / a new member: "what?".
Music off. HUD off (How to Fish's world is drawn as ours; the in-game HUD is the Hyrule rule only).
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
from lib import ROOT, W, H, PW, PH, T, ease, lin, S, Si, P, F, cutout, subtitle, tag  # noqa
import ep003_kit as K  # noqa
import ui_kit as UI  # noqa

T0, T_END = T('l27') - .05, T('l36') - .05
T_ITEMS = [T('l27.w10'), T('l27.w12'), T('l27.w14')]
T_E2 = T('l28') - .05
T_E3 = T('l29') - .05
T_GUNS, T_SELL, T_GAMB, T_BOSS, T_QUOTE = T('l29.w6'), T('l29.w12'), T('l29.w16'), T('l29.w20'), T('l29.w23')
T_E4 = T('l30') - .05
T_ALIBI = T('l30.w13')
T_E5 = T('l31') - .05
T_E6 = T('l32') - .05
T_WEAP, T_SAV, T_LAUNCH = T('l32.w6'), T('l32.w17'), T('l32.w29')
T_E7 = T('l33') - .05
T_PICK, T_SLAP = T('l33.w15'), T('l33.w19')
T_E8 = T('l34') - .05
T_E9 = T('l35') - .05
T_YEARS = T('l35.w16')

LAKE = K.plate_lake('dusk')
WL = PH * .70
FOUR = [(('sil', 'quest2:laughing_pointing'), -.30, P(430), False), ('pixie:laughing_pointing', -.1, P(420), True),
        ('quest2:laughing_pointing', .12, P(440), False), (('sil', 'quest2:wave_happy'), .32, P(430), True)]


def boat(t, who=FOUR, w=P(900)):
    base = K.lake_at('dusk', t)
    K.boat_scene(base, PW * .5, WL, w, who, t)
    return base


def splash(d, x, y, k, size):
    for i in range(9):
        a = math.pi * (.1 + .8 * i / 8)
        r = size * math.sin(math.pi * min(1, k))
        d.line((x, y, x + r * math.cos(a) * (1 if i % 2 else -1) * .8, y - r * math.sin(a)), fill=(255, 255, 255, 220), width=Si(5))


def e1(t):
    fr = K.crop_cam(boat(t), (1.25, .5, .55))
    if t < T_E2:
        ticks = [max(0, min(1, (t - x) / .3)) for x in T_ITEMS]
        g = UI.parchment_list(['A boat', 'A rod', 'A goal'], ticks)
        fr.alpha_composite(g, (int(W * .5 - g.width / 2), int(H * .12)))
        return fr
    k = min(1, (t - T_E2) / .9)                                             # overboard
    g = UI.parchment_list(['A boat', 'A rod', 'A goal'], [1, 1, 1]).rotate(-160 * k, expand=True, resample=Image.BICUBIC)
    g = UI.fade(g, 1 - max(0, k - .7) / .3)
    x = W * .5 + S(420) * k - g.width / 2; y = H * .12 - S(160) * math.sin(math.pi * k) + S(260) * k
    fr.alpha_composite(g, (int(x), int(y)))
    if k > .8:
        splash(ImageDraw.Draw(fr), W * .5 + S(420), H * .75, (k - .8) / .2, S(70))
    return fr


def rifle(h):
    """A cartoon rifle silhouette (generic, drawn by code)."""
    g = UI._new(h * 3.2, h); d = UI._D(g)
    w = h * 3.2
    d.rounded_rectangle((w * .05, h * .40, w * .95, h * .55), h * .06, fill=(60, 62, 70, 255), outline=UI.INK + (255,), width=3)
    d.polygon([(w * .05, h * .45), (w * .25, h * .45), (w * .32, h * .95), (w * .14, h * .95)], fill=(130, 84, 50, 255), outline=UI.INK + (255,))
    d.rounded_rectangle((w * .45, h * .18, w * .70, h * .36), h * .08, fill=(40, 42, 50, 255), outline=UI.INK + (255,), width=3)
    return g


def slot(fr, x, label, im, k):
    g = UI.sq_box(190, 190, r=18)
    fr.alpha_composite(UI.fade(g, k), (int(x - g.width / 2), int(H * .26)))
    if im is not None:
        im = K.sized(im, h=S(120)) if im.height > im.width else K.sized(im, w=S(150))
        fr.alpha_composite(UI.fade(im, k), (int(x - im.width / 2), int(H * .26 + g.height / 2 - im.height / 2)))
    lab = UI.marker(label, 18, paper=True)
    fr.alpha_composite(UI.fade(lab, k), (int(x - lab.width / 2), int(H * .26 + g.height - S(6))))


def _strip(t, upto):
    fr = Image.blend(K.crop_cam(boat(t), (1.0, .5, .5)).convert('RGB'), Image.new('RGB', (W, H), (14, 14, 22)), .55).convert('RGBA')
    items = [(T_E3, 'nothing', None), (T_GUNS, 'guns + dynamite', None), (T_SELL, 'sell the catch', K.prop('fish_side')),
             (T_GAMB, 'gamble it', K.prop('chips')), (T_BOSS, 'bosses', None)]
    for i, (t0, lab, im) in enumerate(items[:upto + 1]):
        x = W * (.12 + .19 * i)
        slot(fr, x, lab, im, 1)
        if lab == 'guns + dynamite':
            r = rifle(S(52)); fr.alpha_composite(r, (int(x - r.width / 2), int(H * .26 + S(30))))
            dy = K.sized(K.prop('dynamite'), h=S(70)); fr.alpha_composite(dy, (int(x - dy.width / 2), int(H * .26 + S(100))))
        if lab == 'bosses':
            d = ImageDraw.Draw(fr)
            d.ellipse((x - S(70), H * .26 + S(60), x + S(70), H * .26 + S(130)), fill=(10, 20, 40, 230))
            d.ellipse((x + S(20), H * .26 + S(80), x + S(34), H * .26 + S(94)), fill=(255, 220, 90, 255))
    return fr


def e3(t):
    fr = Image.blend(K.crop_cam(boat(t), (1.0, .5, .5)).convert('RGB'), Image.new('RGB', (W, H), (14, 14, 22)), .55).convert('RGBA')
    if t < T_QUOTE:
        items = [(T_E3, 'nothing', None), (T_GUNS, 'guns + dynamite', None), (T_SELL, 'sell the catch', K.prop('fish_side')),
                 (T_GAMB, 'gamble it', K.prop('chips')), (T_BOSS, 'bosses', None)]
        for i, (t0, lab, im) in enumerate(items):
            if t < t0:
                continue
            x = W * (.12 + .19 * i)
            k = min(1, (t - t0) / .25)
            slot(fr, x, lab, im, k)
            if 0 <= t - t0 < .9 and i > 0:                                 # coverage: a close insert on the new item
                return K.insert_close(_strip(t, i), True, (.12 + .19 * i), .40, 1.9)
            if lab == 'guns + dynamite':
                r = rifle(S(52)); fr.alpha_composite(UI.fade(r, k), (int(x - r.width / 2), int(H * .26 + S(30))))
                dy = K.sized(K.prop('dynamite'), h=S(70)); fr.alpha_composite(UI.fade(dy, k), (int(x - dy.width / 2), int(H * .26 + S(100))))
            if lab == 'bosses':
                d = ImageDraw.Draw(fr)
                d.ellipse((x - S(70), H * .26 + S(60), x + S(70), H * .26 + S(130)), fill=(10, 20, 40, 230))
                d.ellipse((x + S(20), H * .26 + S(80), x + S(34), H * .26 + S(94)), fill=(255, 220, 90, 255))
        return fr
    k = min(1, (t - T_QUOTE) / .3)                                           # the developers' own words, verbatim
    g = UI.sq_box(820, 230, r=20)
    d = UI._D(g)
    UI.spaced(d, (40, 30), 'DEVELOPER DESCRIPTION · STEAM STORE PAGE', UI.inter(15), UI.GOLD + (255,), 2.0)
    q = '“cartoon violence towards fish and gambling with fish (no real money).”'
    lines, ln = [], ''
    for w_ in q.split():
        if d.textlength((ln + ' ' + w_).strip(), font=UI.inter(32, 800)) > 740 and ln:
            lines.append(ln); ln = w_
        else:
            ln = (ln + ' ' + w_).strip()
    lines.append(ln)
    for i, l in enumerate(lines):
        d.text((40, 70 + 46 * i), l, font=UI.inter(32, 800), fill=(255, 255, 255, 255))
    fr.alpha_composite(UI.fade(g, k), (int(W / 2 - g.width / 2), int(H * .45 - g.height / 2)))
    return fr


def e4(t):
    fr = Image.blend(K.crop_cam(boat(t), (1.2, .5, .55)).convert('RGB'), Image.new('RGB', (W, H), (14, 14, 22)), .35).convert('RGBA')
    g = UI.sq_tag('GOAL: catch fish', 30)
    fr.alpha_composite(g, (int(W / 2 - g.width / 2), int(H * .14)))
    kgo = max(0, min(1, (t - T_ALIBI - .4) / 1.0))                          # the companion reads the tag, sweats, swims off
    f = K.buddy(S(120), blink=K.blink_at(t, every=2.6), sweat=min(1, max(0, (t - T_E4 - .8) / .8)), mirror=kgo > 0)
    fr.alpha_composite(f, (int(W * .70 + S(500) * ease(kgo)), int(H * .62)))
    if t >= T_ALIBI:                                                        # the goal, renamed
        fr = K.punch(fr, '= ALIBI', t - T_ALIBI, size=80, y=.34, col=(255, 200, 61))
    return fr


def e5(t):
    fr = K.crop_cam(boat(t), K.cam_lerp((1.2, .5, .55), (1.0, .5, .55), (t - T_E5) / 2))
    if t >= T('l31.w9') - .05:
        fr = K.punch(fr, 'FAILURE', t - T('l31.w9') + .05, size=90, y=.2, col=(234, 75, 75))
    return fr


def e6(t):
    if t < T_WEAP:                                                          # Quest falls in
        base = boat(t, [w for w in FOUR if w[0] != 'quest2:laughing_pointing'])
        k = min(1, (t - T_E6) / .8)
        q = K.sized(cutout('quest2:surprised_shocked'), h=P(380)).rotate(-80 * k, expand=True, resample=Image.BICUBIC)
        base.alpha_composite(q, (int(PW * .62 + P(200) * k), int(WL - P(380) + P(330) * k - q.height / 2 + P(150))))
        if k > .6:
            splash(ImageDraw.Draw(base), PW * .72, WL + P(20), (k - .6) / .4, P(140))
        return K.crop_cam(base, (1.15, .55, .55))
    if t < T_SAV:                                                           # a weapon not designed for fish
        base = boat(t)
        dy = K.sized(K.prop('dynamite'), h=P(170)); base.alpha_composite(dy, (int(PW * .42), int(PH * .30)))
        fr = K.crop_cam(base, (1.6, .47, .45))
        return K.marker_at(fr, 'not designed for fish', .5, .86, size=22, k=min(1, (t - T_WEAP - .6) / .3), paper=True)
    if t < T_LAUNCH:                                                        # the savings: everyone points at someone else
        fr = Image.new('RGBA', (W, H), (30, 30, 42, 255))
        for i, (who, flip) in enumerate((('quest2:laughing_pointing', False), ('pixie:laughing_pointing', True), ('quest2:laughing_pointing', True), ('pixie:laughing_pointing', False))):
            im = K.sized(cutout(who), h=S(330))
            if flip:
                im = im.transpose(Image.FLIP_LEFT_RIGHT)
            if i in (2, 3):
                im = K.sized(K.silhouette(who), h=S(330)).transpose(Image.FLIP_LEFT_RIGHT) if flip else K.sized(K.silhouette(who), h=S(330))
            fr.alpha_composite(im, (int(W * (.14 + .24 * i) - im.width / 2), int(H * .95 - im.height)))
        ch = K.sized(K.prop('chips'), h=S(90)); fr.alpha_composite(UI.fade(ch, .35), (int(W / 2 - ch.width / 2), int(H * .1)))
        return K.marker_at(fr, 'savings: 0', .5, .12, size=26, k=1)
    k = min(1, (t - T_LAUNCH) / 1.4)                                        # launched across the island
    base = K.lake_at('dusk', t)
    q = K.sized(cutout('quest:arms_up_back'), h=P(220) * (1 - .6 * k)).rotate(360 * k, expand=True, resample=Image.BICUBIC)
    x = lin(PW * .7, PW * .26, k); y = PH * .62 - PH * .45 * math.sin(math.pi * k)
    d = ImageDraw.Draw(base)
    for i in range(1, 10):                                                  # motion trail
        kk = max(0, k - i * .03)
        d.ellipse((lin(PW * .7, PW * .26, kk) - P(6), PH * .62 - PH * .45 * math.sin(math.pi * kk) - P(6), lin(PW * .7, PW * .26, kk) + P(6), PH * .62 - PH * .45 * math.sin(math.pi * kk) + P(6)), fill=(255, 255, 255, 160 - i * 15))
    base.alpha_composite(q, (int(x - q.width / 2), int(y - q.height / 2)))
    return K.crop_cam(base, (1.0, .5, .5))


def e7(t):
    base = K.lake_at('dusk', t)
    if t < T_PICK:
        q = K.sized(cutout('quest:exhausted_slumped'), h=P(360)).rotate(80, expand=True, resample=Image.BICUBIC)
        b = K.sized(K.prop('rowboat_side'), w=P(900))
        top = WL - b.height * .72
        base.alpha_composite(q, (int(PW * .5 - q.width / 2), int(top + b.height * .25 - q.height * .75)))
        base.alpha_composite(b, (int(PW * .5 - b.width / 2), int(top)))
        fr = K.crop_cam(base, (1.4, .5, .55))
        d = ImageDraw.Draw(fr)
        for i in range(3):                                                   # KO stars
            a = t * 4 + i * 2.1
            UI.sparkle(d, W * .5 + S(70) * math.cos(a), H * .32 + S(20) * math.sin(a), S(14), (255, 220, 90))
        return fr
    base = boat(t)
    fr = K.crop_cam(base, (1.5, .5, .5))
    if t >= T_SLAP:
        d = ImageDraw.Draw(fr)
        k = min(1, (t - T_SLAP) / .15)
        cx, cy = W * .58, H * .32
        pts = [(cx + S(110 + 40 * (i % 2)) * k * math.cos(i * math.pi / 8), cy + S(90 + 30 * (i % 2)) * k * math.sin(i * math.pi / 8)) for i in range(16)]
        d.polygon(pts, fill=(255, 200, 61), outline=UI.INK)
        fr = K.punch(fr, 'SLAP!', t - T_SLAP, size=70, y=.32, col=(214, 57, 47), x=.58)
        f = K.buddy(S(100), blink=1.0 if t - T_SLAP < 1.2 else 0.0, rot=-10)   # the companion winces
        fr.alpha_composite(f, (int(W * .84), int(H * .72)))
    return fr


def e8(t):
    fr = K.crop_cam(boat(t), K.cam_lerp((1.5, .5, .5), (1.6, .5, .48), (t - T_E8) / 3))
    return K.marker_at(fr, 'how most friendships handle feelings', .5, .86, size=22, k=min(1, (t - T_E8 - 1.0) / .3), paper=True)


def e9(t):
    fr = Image.blend(K.crop_cam(K.lake_at('dusk', t), (1.0, .5, .5)).convert('RGB'), Image.new('RGB', (W, H), (14, 14, 22)), .55).convert('RGBA')
    m = [(T_E9 + .5, 'A', 'remember the dynamite night', 'msg'), (T_E9 + 1.8, 'P', 'who gambled the savings', 'msg'),
         (T_YEARS + .6, 'Q', 'never forget', 'sticker'), (T_YEARS + 1.8, 'B', 'what?', 'msg')]
    ph = K.phone_chat(m, t, title='THE BOAT')
    fr = K.place_phone(fr, ph, t, [x[0] for x in m])
    if t >= T_YEARS - .1:
        fr = K.marker_at(fr, 'years later', .82, .2, size=22, k=min(1, (t - T_YEARS + .1) / .3), paper=True)
    return fr


REFR = [(T_E8 + .9, T_E9 - .05, 1.6, .5, .45)]                              # the deadpan close


def render(t):
    K.NOW[0] = t
    K.REFRAMES[:] = REFR
    fr = (e1 if t < T_E3 else e3 if t < T_E4 else e4 if t < T_E5 else e5 if t < T_E6 else e6 if t < T_E7 else e7 if t < T_E8 else e8 if t < T_E9 else e9)(t)
    fr = fr.convert('RGB')
    d = ImageDraw.Draw(fr)
    tag(d, 'EP003 BLOCK E · THE ALIBI FALLS APART · v1 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('e1', T_ITEMS[2] + .4), ('e2', T_E2 + .7), ('e3', T_BOSS + .5), ('e3q', T_QUOTE + 1.0), ('e4', T_ALIBI + .5), ('e5', T_E6 - .3),
          ('e6a', T_E6 + .7), ('e6b', T_WEAP + 1.0), ('e6c', T_SAV + .6), ('e6d', T_LAUNCH + .7), ('e7a', T_E7 + .8), ('e7b', T_SLAP + .3),
          ('e8', T_E8 + 1.6), ('e9', T_YEARS + 3.4))

if __name__ == '__main__':
    K.run_block('E', T0, T_END, render, STILLS, version=2)
