#!/usr/bin/env python3
"""EP002 animatic, block T (planning only): l145 "But it can rebuild Hyrule." -> l154 "you both grew up."
(block U, the call to action, starts on l155).

Option B, "the meeting on the road" (Producer, 2026-10-05: "Vamos con B, constrúyelo así").
  T1  "But it can rebuild Hyrule. And maybe that is enough."  Block S's engine, the grey room filling the frame: a
                                        green scan runs the other way and Hyrule builds itself around kid Quest
                                        (green checks: field, castle, sky); BUILD SUCCEEDED.
  T2  "Because a remake does not have to take you back. It can let two different moments meet."  The road of block R.
                                        Down the road, the kid he was (the memory, facing us); adult Quest (shield and
                                        sword) walks in, from behind, and stops facing him. A REWIND icon flickers out
                                        on "take you back"; a Navi-blue glow links them on "meet".
  T3  "The game you remember... and the person you became."  The far field and castle drop to their 1998 look - THE
                                        GAME YOU REMEMBER; THE PERSON YOU BECAME on adult Quest.
  T4  "You cannot play Ocarina of Time for the first time again."  The kid fades away, sparkles rising.
  T5  "But maybe you can meet it again."  Adult Quest takes a step towards the castle; Navi flies ahead.
  T6  "And this time... you both grew up."  The 1998 castle and field resolve into today's - the game grew up too;
                                        a heart container: his hearts go from 3 to 4. Warm hold to the end.
HUD: off in the engine (T1), on in Hyrule. Sounds: none (all at the end). Free.
v4 (final art, 2026-10-05): the memory down the road is #3b (young hero, front, warm smile), adult Quest is #4 (3D
shield and sword, from block R), the field is #11 (from block R); the kids in the engine are block C's #6.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, W, H, PW, PH, FPS, T, ease, lin, subtitle, tag, F, cam_box, final, walk_adult, STEP_RATE, S, Si, P, out_path, video_args, audio_args  # noqa
import fairy as fairy_fx  # noqa
import ui_kit as UI  # noqa: the approved on-screen text style (2026-10-06)
import hud  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


SA = load('blockS_A', 'scripts/ep002-blockS-A-animatic.py')      # the remake engine, the grey room
BR = load('blockR', 'scripts/ep002-blockR-animatic.py')          # the road, the field, the two eras
G, BN, CART = BR.G, BR.BN, BR.CART
comp, sized, fade = BN.comp, BN.sized, BN.fade

T0 = T('l145') - 0.05                   # block S ends here
T_REB = T('l145.w4')                    # "rebuild": the green scan
T_ENOUGH = T('l146') - .05              # BUILD SUCCEEDED
T_ROAD = T('l147') - .05                # the road
T_BACK = T('l147.w8')                   # "take you back": REWIND flickers out
T_MEET = T('l148.w7')                   # "meet"
T_GAME = T('l149.w2')                   # "game (you remember)"
T_PERSON = T('l150.w3')                 # "person (you became)"
T_FIRST = T('l151') - .05               # the kid fades
T_AGAIN = T('l152') - .05               # a step forward
T_GREW = T('l154.w3')                   # "grew": the game grows up
T_UP = T('l154.w4')                     # "up": a heart container
T_END = T('l155') - 0.05                # block U starts on l155
T_POP0, POP_DT = T_GREW + .05, .18                                          # Producer: 3 -> 8 hearts, one empty container after another,
T_FILL0, FILL_DT = T_POP0 + 5 * POP_DT + .15, .05                           # then they refill a quarter at a time (as in the 1998 game)
INK = (20, 14, 18)
GREEN, GOLD = (90, 210, 120), (255, 214, 40)

def life_meter(fr, t, alpha):
    """The hearts, as the 1998 game shows them: new containers appear empty at the end of the row, one after another,
    then the meter refills left to right a quarter heart at a time; the last filled heart beats."""
    n_max = 3 + sum(1 for i in range(5) if t >= T_POP0 + i * POP_DT)
    hearts = 3.0 + (min(20, int(max(0, t - T_FILL0) / FILL_DT)) / 4 if t >= T_FILL0 else 0)
    lay = Image.new('RGBA', fr.size); d = ImageDraw.Draw(lay)
    s0, x0, y0 = S(15), S(40), S(58)                                                 # same place and size as the HUD's meter
    last = math.ceil(hearts) - 1
    for i in range(n_max):
        cx = x0 + i * 2.35 * s0
        s = s0
        if i >= 3:                                                           # a new container pops in
            kp = min(1, (t - (T_POP0 + (i - 3) * POP_DT)) / .2)
            s = s0 * (1.35 - .35 * kp if kp >= .5 else 2.7 * kp)
            if kp < 1:
                d.ellipse((cx - s0 * 1.6, y0 - s0 * 1.6, cx + s0 * 1.6, y0 + s0 * 1.6), outline=(255, 255, 255, int(200 * (1 - kp))), width=Si(3))
        if t >= T_POP0 and i == last:                                         # the current heart beats
            s = s * (1 + .12 * abs(math.sin((t - T_POP0) * 5)))
        hud._heart(d, cx, y0, s, (40, 20, 24, 150), highlight=False)
        v = max(0.0, min(1.0, hearts - i))
        if v >= 1:
            hud._heart(d, cx, y0, s, (232, 44, 52, 255))
        elif v > 0:                                                          # quarters, clockwise from the top
            full = Image.new('RGBA', fr.size); hud._heart(ImageDraw.Draw(full), cx, y0, s, (232, 44, 52, 255), highlight=False)
            m = Image.new('L', fr.size, 0)
            ImageDraw.Draw(m).pieslice((cx - s * 2, y0 - s * 2, cx + s * 2, y0 + s * 2), -90, -90 + 360 * v, fill=255)
            lay.paste(full, (0, 0), Image.composite(full.getchannel('A'), Image.new('L', fr.size, 0), m))
    if alpha < 1:
        lay.putalpha(lay.getchannel('A').point(lambda v_: int(v_ * alpha)))
    out = fr.convert('RGBA'); out.alpha_composite(lay)
    return out.convert('RGB')


# ------------------------------------------------------------------ T1: the engine builds Hyrule
HY = G.new_look(BR.FIELD.resize((W, H), Image.LANCZOS))
CHECKS = (('field', .25), ('castle', .5), ('sky', .75))


def check_chip(text):
    g = Image.new('RGBA', (Si(180), Si(40))); d = ImageDraw.Draw(g)
    d.rounded_rectangle((S(2), S(2), S(177), S(37)), S(8), fill=(14, 30, 20, 230), outline=GREEN + (255,), width=Si(3))
    d.line((S(14), S(21), S(21), S(29)), fill=GREEN, width=Si(4)); d.line((S(21), S(29), S(33), S(12)), fill=GREEN, width=Si(4))
    d.text((S(44), S(8)), text, font=F(20), fill=(230, 255, 235))
    return g


def engine(t):
    sf = SA.SF
    k = ease(min(1, max(0, (t - T_REB + .3) / 1.1)))
    room = SA.viewport(SA.T_END - .05, sf)                                     # where block S ends: grey room, him in colour...
    if k < .6:                                                                # ...still tagged CANNOT EXPORT · 1 OF 1 (improvement 1),
        room = Image.blend(SA.full_view(SA.T_END - .05), room, k / .6)        # the tag fades as the green scan passes
    sx = int(W * k)
    fr = room.copy()
    if sx > 0:
        hy = HY.copy().convert('RGBA'); hy.alpha_composite(sf['L']['you_1998'])   # Hyrule builds around him
        fr.paste(hy.convert('RGB').crop((0, 0, sx, H)), (0, 0))
    if 0 < k < 1:
        g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
        gd.rectangle((sx - S(6), 0, sx + S(40), H), fill=(120, 255, 160, 80)); gd.line((sx, 0, sx, H), fill=(200, 255, 215), width=Si(5))
        fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    for i, (name, x) in enumerate(CHECKS):                                    # a green check as the scan passes
        if k * W > x * W:
            ka = min(1, (k * W - x * W) / S(120))
            fr = comp(fr, fade(check_chip(name), ka), x * W - S(90), H * (.16 + .07 * i))
    kb = min(1, max(0, (t - T_ENOUGH) / .3))
    if kb > 0:                                                                # BUILD SUCCEEDED
        g = Image.new('RGBA', (Si(420), Si(70))); gd = ImageDraw.Draw(g)
        gd.rounded_rectangle((S(3), S(3), S(416), S(66)), S(10), fill=(14, 30, 20, 235), outline=GREEN + (255,), width=Si(4))
        s = 'BUILD SUCCEEDED'; gd.text((S(210) - gd.textlength(s, font=F(34)) / 2, S(14)), s, font=F(34), fill=(200, 255, 215, 255))
        sc = 1.3 - .3 * ease(kb)
        g = g.resize((int(g.width * sc), int(g.height * sc)), Image.LANCZOS)
        fr = comp(fr, fade(g, kb), W / 2 - g.width / 2, H * .40)
    return fr


# ------------------------------------------------------------------ T2-T6: the meeting on the road
KID = final('quest_young_front')                                             # #3b young hero, front, warm smile (the memory)
KID_H, KID_X, KID_FEET = H * .27, W * .55, H * .74                          # on the road of #11, down from adult Quest
ADULT = BR.ADULT
AD_H, AD_X, AD_FEET = H * .52, W * .70, H * .98


def memory(im):
    a = np.asarray(im).astype(np.float32); a[..., :3] = a[..., :3] * .55 + np.array([200, 225, 255]) * .45; a[..., 3] *= .85
    return Image.fromarray(a.astype(np.uint8))


KID_MEM = memory(sized(KID, KID_H))


def person(fr, im, x, feet, h, t, walking=False, phase=0.0, alpha=1.0):
    q = im if im.height == int(h) else sized(im, h)
    bob = S(5) * abs(math.sin(t * STEP_RATE + phase)) if walking else 0
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((x - q.width * .4, feet - S(8), x + q.width * .4, feet + S(8)), fill=(0, 0, 0, int(70 * alpha)))
    fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(S(5)))).convert('RGB')
    return comp(fr, fade(q, alpha) if alpha < 1 else q, x - q.width / 2, feet - q.height - bob)


def label(fr, text, cx, y, k, col=GOLD):
    if k <= 0:
        return fr
    g = UI.sq_tag(text, 22, col=col)                                    # our game tag (family A)
    return comp(fr, fade(g, k), cx - g.width / 2, y)


def road(t):
    zk = min(1, max(0, (t - T_ROAD) / (T_END - T_ROAD)))
    box = cam_box(((1.12, .5, .6), (1.25, .5, .6)), zk)                        # one slow push for the whole meeting
    bg = G.new_look(BR.FIELD.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR))
    k98 = min(1, max(0, (t - T_GAME + .1) / .4)) * (1 - min(1, max(0, (t - T_GREW) / .8)))
    if k98 > 0:                                                               # the game you remember: the field in its 1998 look
        old = G.old_look(bg)
        if t >= T_GREW:                                                        # ...and it grows up: pixels resolve into today
            bg = BR.BQ.pix_to_now(bg, (t - T_GREW) / .8)
        else:
            bg = Image.blend(bg, old, k98)
    if t >= T_GREW:
        bg = CART.glow(bg, W * .5, H * .38, S(520), (255, 226, 160), .35 * min(1, (t - T_GREW) / .8))
    fr = bg
    # the kid he was, down the road, facing us; he fades on "cannot play it for the first time again"
    kf = 1 - min(1, max(0, (t - T('l151.w2')) / (T('l151.w11') - T('l151.w2') + .3)))
    if kf > 0:
        fr = BR.CART.glow(fr, KID_X, KID_FEET - KID_H * .5, int(KID_H * .7), (190, 220, 255), .35 * kf)
        fr = person(fr, KID_MEM, KID_X, KID_FEET, KID_H, t, alpha=kf)
        if kf < 1:                                                            # sparkles rising as he goes
            d = ImageDraw.Draw(fr)
            for i in range(16):
                ph = ((t - T_FIRST) * .6 + i / 16) % 1
                x = KID_X + S(60) * math.sin(i * 2.3 + t); y = KID_FEET - KID_H * ph * 1.4
                r = S(2 + (i % 3))
                d.ellipse((x - r, y - r, x + r, y + r), fill=(220, 240, 255))
    # adult Quest walks in from the right and stops facing him; then a step towards the castle
    ka = ease(min(1, max(0, (t - T_ROAD) / 1.4)))
    ks = ease(min(1, max(0, (t - T_AGAIN - .1) / 1.2)))
    ax = lin(W * 1.15, AD_X, ka) - W * .08 * ks
    ah = AD_H * (1 - .14 * ks); af = AD_FEET - H * .07 * ks
    walking = ka < 1 or 0 < ks < 1
    fr = person(fr, walk_adult(t, phase=1.3) if walking else ADULT, ax, af, ah, t, walking=walking, phase=1.3)   # a step per bob
    if T_BACK - .1 <= t < T_BACK + 1.0:                                        # REWIND flickers out: no need to go back
        kr = (t - T_BACK + .1) / 1.1
        a = (1 - kr) * (1 if int(t * 12) % 2 else .5)
        g = Image.new('RGBA', (Si(220), Si(70))); gd = ImageDraw.Draw(g)
        gd.rounded_rectangle((S(2), S(2), S(217), S(67)), S(10), fill=(20, 22, 30, 220), outline=(200, 200, 210, 255), width=Si(3))
        for dx in (0, 34):
            gd.polygon([(S(60 + dx), S(16)), (S(60 + dx), S(54)), (S(30 + dx), S(35))], fill=(230, 230, 240, 255))
        gd.text((S(112), S(20)), '1998', font=F(26), fill=(230, 230, 240, 255))
        gd.line((S(14), S(60), S(206), S(10)), fill=(225, 45, 55, 255), width=Si(6))
        fr = comp(fr, fade(g, max(0, a)), W / 2 - S(110), H * .15)
    km = min(1, max(0, (t - T_MEET) / .5)) * (1 if t < T_FIRST else max(0, 1 - (t - T_FIRST) / 1.0))
    if km > 0:                                                                # two moments meet: a Navi-blue glow links them
        g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
        x0, y0 = KID_X + S(20), KID_FEET - KID_H * .6
        x1, y1 = ax - S(30), af - ah * .6
        gd.line((x0, y0, lin(x0, x1, km), lin(y0, y1, km)), fill=(170, 225, 255, 220), width=Si(8))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(S(3)))).convert('RGB')
    kg = min(1, max(0, (t - T_GAME) / .3)) * (1 - min(1, max(0, (t - T_FIRST) / .4)))
    fr = label(fr, 'THE GAME YOU REMEMBER', W * .5, H * .17, kg)
    kp = min(1, max(0, (t - T_PERSON) / .3)) * (1 - min(1, max(0, (t - T_FIRST) / .4)))
    fr = label(fr, 'THE PERSON YOU BECAME', min(W - S(240), ax), af - ah - S(70), kp, col=(170, 220, 255))
    return fr


def render(t):
    if t < T_ROAD:
        fr = engine(t); lab = 'T1 it can rebuild Hyrule' if t < T_ENOUGH else 'T1 maybe that is enough'
        hud_a = 0.0
    else:
        fr = road(t)
        if t < T_ROAD + .4:
            fr = Image.blend(engine(T_ROAD - .01), fr, ease((t - T_ROAD) / .4))
        lab = ('T2 two different moments meet' if t < T_GAME - .1 else 'T3 the game you remember, the person you became' if t < T_FIRST
               else 'T4 not for the first time again' if t < T_AGAIN else 'T5 meet it again' if t < T('l153') - .05 else 'T6 you both grew up')
        hud_a = min(1, (t - T_ROAD) / .5)
    if hud_a > 0:                                                             # the life meter is drawn here (life_meter), the rest by the HUD
        fr = hud.draw(fr, hearts=0, max_hearts=0, alpha=hud_a, t=t)
        fr = life_meter(fr, t, hud_a)
    keys = [(T0, .30, .40), (T_ROAD, .58, .42), (T_MEET, .56, .48), (T_AGAIN, .66, .44),     # improvement 3: Navi's twirl around him,
            (T_AGAIN + .25, .60, .38), (T_AGAIN + .5, .55, .46), (T_AGAIN + .75, .61, .54), (T_AGAIN + 1.0, .68, .45),   # then ahead
            (T_AGAIN + 1.6, .56, .36), (T_GREW, .50, .32), (T_END, .52, .30)]
    fr = fairy_fx.draw(fr, keys, t, size=.04)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 26 YOU BOTH GREW UP · {lab} · BLOCK T v10 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('t1', T_REB + .5), ('t1b', T_ENOUGH + .6), ('t2', T_MEET + .4), ('t3', T_PERSON + .6), ('t4', T('l151.w8')),
          ('t5', T_AGAIN + 1.2), ('t6p', T_POP0 + 3 * POP_DT + .05), ('t6f', T_FILL0 + .45), ('t6', T_FILL0 + 1.3), ('t6b', T_END - .3))


def main():
    out = out_path(ROOT / 'docs/ep002/EP002_blockT_animatic_v10.mp4')
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          *video_args(), *audio_args(), '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(out_path(ROOT / f'docs/ep002/blockT_v10_{name}.jpg'), quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(out_path(ROOT / f'docs/ep002/blockT_v10_{name}.jpg'), quality=85)
        print('stills')
    else:
        main()
