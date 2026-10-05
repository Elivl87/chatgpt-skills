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
HUD: off in the engine (T1), on in Hyrule. Stand-ins: young hero front, smiling (#3b, new), adult back (#4), field
plate (#11). Sounds: none (all at the end). Free.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, W, H, PW, PH, FPS, T, ease, lin, subtitle, tag, F, cam_box, cutout  # noqa
import fairy as fairy_fx  # noqa
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
T_HEART0, T_HEART1 = T_GREW + .1, T_UP + .35
INK = (20, 14, 18)
GREEN, GOLD = (90, 210, 120), (255, 214, 40)

def heart(d, x, y, s):
    """A heart container, flying."""
    d.ellipse((x - s, y - s * .6, x, y + s * .3), fill=(230, 50, 60), outline=INK, width=2)
    d.ellipse((x, y - s * .6, x + s, y + s * .3), fill=(230, 50, 60), outline=INK, width=2)
    d.polygon([(x - s * .95, y - s * .05), (x + s * .95, y - s * .05), (x, y + s)], fill=(230, 50, 60), outline=INK)
    d.rectangle((x - s * .5, y - s * .1, x + s * .5, y + s * .05), fill=(230, 50, 60))


# ------------------------------------------------------------------ T1: the engine builds Hyrule
HY = G.new_look(BR.FIELD.resize((W, H), Image.LANCZOS))
CHECKS = (('field', .25), ('castle', .5), ('sky', .75))


def check_chip(text):
    g = Image.new('RGBA', (180, 40)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((2, 2, 177, 37), 8, fill=(14, 30, 20, 230), outline=GREEN + (255,), width=3)
    d.line((14, 21, 21, 29), fill=GREEN, width=4); d.line((21, 29, 33, 12), fill=GREEN, width=4)
    d.text((44, 8), text, font=F(20), fill=(230, 255, 235))
    return g


def engine(t):
    S = SA.SF
    k = ease(min(1, max(0, (t - T_REB + .3) / 1.1)))
    room = SA.viewport(SA.T_END - .05, S)                                     # where block S ends: grey room, him in colour...
    if k < .6:                                                                # ...still tagged CANNOT EXPORT · 1 OF 1 (improvement 1),
        room = Image.blend(SA.full_view(SA.T_END - .05), room, k / .6)        # the tag fades as the green scan passes
    sx = int(W * k)
    fr = room.copy()
    if sx > 0:
        hy = HY.copy().convert('RGBA'); hy.alpha_composite(S['L']['you_1998'])   # Hyrule builds around him
        fr.paste(hy.convert('RGB').crop((0, 0, sx, H)), (0, 0))
    if 0 < k < 1:
        g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
        gd.rectangle((sx - 6, 0, sx + 40, H), fill=(120, 255, 160, 80)); gd.line((sx, 0, sx, H), fill=(200, 255, 215), width=5)
        fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    for i, (name, x) in enumerate(CHECKS):                                    # a green check as the scan passes
        if k * W > x * W:
            ka = min(1, (k * W - x * W) / 120)
            fr = comp(fr, fade(check_chip(name), ka), x * W - 90, H * (.16 + .07 * i))
    kb = min(1, max(0, (t - T_ENOUGH) / .3))
    if kb > 0:                                                                # BUILD SUCCEEDED
        g = Image.new('RGBA', (420, 70)); gd = ImageDraw.Draw(g)
        gd.rounded_rectangle((3, 3, 416, 66), 10, fill=(14, 30, 20, 235), outline=GREEN + (255,), width=4)
        s = 'BUILD SUCCEEDED'; gd.text((210 - gd.textlength(s, font=F(34)) / 2, 14), s, font=F(34), fill=(200, 255, 215, 255))
        sc = 1.3 - .3 * ease(kb)
        g = g.resize((int(g.width * sc), int(g.height * sc)), Image.LANCZOS)
        fr = comp(fr, fade(g, kb), W / 2 - g.width / 2, H * .40)
    return fr


# ------------------------------------------------------------------ T2-T6: the meeting on the road
KID = cutout('quest2:nostalgic_smile', 'hero')                               # MISSING #3b: young hero, front, smiling (stand-in)
KID_H, KID_X, KID_FEET = H * .27, W * .47, H * .74
ADULT = BR.ADULT
AD_H, AD_X, AD_FEET = H * .52, W * .70, H * .98


def memory(im):
    a = np.asarray(im).astype(np.float32); a[..., :3] = a[..., :3] * .55 + np.array([200, 225, 255]) * .45; a[..., 3] *= .85
    return Image.fromarray(a.astype(np.uint8))


KID_MEM = memory(sized(KID, KID_H))


def person(fr, im, x, feet, h, t, walking=False, phase=0.0, alpha=1.0):
    q = im if im.height == int(h) else sized(im, h)
    bob = 5 * abs(math.sin(t * 7 + phase)) if walking else 0
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((x - q.width * .4, feet - 8, x + q.width * .4, feet + 8), fill=(0, 0, 0, int(70 * alpha)))
    fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(5))).convert('RGB')
    return comp(fr, fade(q, alpha) if alpha < 1 else q, x - q.width / 2, feet - q.height - bob)


def label(fr, text, cx, y, k, col=GOLD):
    if k <= 0:
        return fr
    g = Image.new('RGBA', (440, 52)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((2, 2, 437, 49), 10, fill=(20, 22, 30, 225), outline=col + (255,), width=3)
    s = text; d.text((220 - d.textlength(s, font=F(26)) / 2, 10), s, font=F(26), fill=col + (255,))
    return comp(fr, fade(g, k), cx - 220, y)


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
        bg = CART.glow(bg, W * .5, H * .38, 520, (255, 226, 160), .35 * min(1, (t - T_GREW) / .8))
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
                x = KID_X + 60 * math.sin(i * 2.3 + t); y = KID_FEET - KID_H * ph * 1.4
                r = 2 + (i % 3)
                d.ellipse((x - r, y - r, x + r, y + r), fill=(220, 240, 255))
    # adult Quest walks in from the right and stops facing him; then a step towards the castle
    ka = ease(min(1, max(0, (t - T_ROAD) / 1.4)))
    ks = ease(min(1, max(0, (t - T_AGAIN - .1) / 1.2)))
    ax = lin(W * 1.15, AD_X, ka) - W * .08 * ks
    ah = AD_H * (1 - .14 * ks); af = AD_FEET - H * .07 * ks
    walking = ka < 1 or 0 < ks < 1
    fr = person(fr, ADULT, ax, af, ah, t, walking=walking, phase=1.3)
    if T_BACK - .1 <= t < T_BACK + 1.0:                                        # REWIND flickers out: no need to go back
        kr = (t - T_BACK + .1) / 1.1
        a = (1 - kr) * (1 if int(t * 12) % 2 else .5)
        g = Image.new('RGBA', (220, 70)); gd = ImageDraw.Draw(g)
        gd.rounded_rectangle((2, 2, 217, 67), 10, fill=(20, 22, 30, 220), outline=(200, 200, 210, 255), width=3)
        for dx in (0, 34):
            gd.polygon([(60 + dx, 16), (60 + dx, 54), (30 + dx, 35)], fill=(230, 230, 240, 255))
        gd.text((112, 20), '1998', font=F(26), fill=(230, 230, 240, 255))
        gd.line((14, 60, 206, 10), fill=(225, 45, 55, 255), width=6)
        fr = comp(fr, fade(g, max(0, a)), W / 2 - 110, H * .15)
    km = min(1, max(0, (t - T_MEET) / .5)) * (1 if t < T_FIRST else max(0, 1 - (t - T_FIRST) / 1.0))
    if km > 0:                                                                # two moments meet: a Navi-blue glow links them
        g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
        x0, y0 = KID_X + 20, KID_FEET - KID_H * .6
        x1, y1 = ax - 30, af - ah * .6
        gd.line((x0, y0, lin(x0, x1, km), lin(y0, y1, km)), fill=(170, 225, 255, 220), width=8)
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(3))).convert('RGB')
    kg = min(1, max(0, (t - T_GAME) / .3)) * (1 - min(1, max(0, (t - T_FIRST) / .4)))
    fr = label(fr, 'THE GAME YOU REMEMBER', W * .5, H * .17, kg)
    kp = min(1, max(0, (t - T_PERSON) / .3)) * (1 - min(1, max(0, (t - T_FIRST) / .4)))
    fr = label(fr, 'THE PERSON YOU BECAME', min(W - 240, ax), af - ah - 70, kp, col=(170, 220, 255))
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
    if T_HEART0 <= t < T_HEART1:                                              # improvement 4: the heart container flies from the castle
        k = ease((t - T_HEART0) / (T_HEART1 - T_HEART0))
        x = lin(W * .5, W * .135, k); y = lin(H * .30, H * .055, k) - 60 * math.sin(math.pi * k)
        fr = CART.glow(fr, x, y, 60, (255, 140, 140), .5)
        d = ImageDraw.Draw(fr)
        for i in range(1, 8):                                                 # a sparkle trail
            kk = ease(max(0, (t - i * .03 - T_HEART0) / (T_HEART1 - T_HEART0)))
            px = lin(W * .5, W * .135, kk); py = lin(H * .30, H * .055, kk) - 60 * math.sin(math.pi * kk)
            r = 5 * (1 - i / 8) + 1
            d.ellipse((px - r, py - r, px + r, py + r), fill=(255, 230, 200))
        heart(d, x, y, lin(30, 14, k))
    if hud_a > 0:                                                             # a heart container on "up": 3 -> 4 hearts
        grown = t >= T_HEART1
        fr = hud.draw(fr, hearts=4.0 if grown else 3.0, max_hearts=4 if grown else 3, alpha=hud_a, t=t)
        if T_HEART1 <= t < T_HEART1 + 1.2:
            fr = CART.glow(fr, W * .135, H * .055, 70, (255, 120, 120), .6 * (1 - (t - T_HEART1) / 1.2))
    if t >= T_ROAD:
        d = ImageDraw.Draw(fr)
        lab2 = 'MISSING · young hero front, smiling (#3b) · adult back (#4) · field (#11) · stand-ins'
        tw = d.textlength(lab2, font=F(13)); d.rectangle((W * .03, H * .935, W * .03 + tw + 12, H * .935 + 20), fill=(150, 20, 30)); d.text((W * .03 + 6, H * .935 + 2), lab2, font=F(13), fill=(255, 235, 235))
    keys = [(T0, .30, .40), (T_ROAD, .58, .42), (T_MEET, .56, .48), (T_AGAIN, .66, .44),     # improvement 3: Navi's twirl around him,
            (T_AGAIN + .25, .60, .38), (T_AGAIN + .5, .55, .46), (T_AGAIN + .75, .61, .54), (T_AGAIN + 1.0, .68, .45),   # then ahead
            (T_AGAIN + 1.6, .56, .36), (T_GREW, .50, .32), (T_END, .52, .30)]
    fr = fairy_fx.draw(fr, keys, t, size=.04)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 26 YOU BOTH GREW UP · {lab} · BLOCK T v2 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('t1', T_REB + .5), ('t1b', T_ENOUGH + .6), ('t2', T_MEET + .4), ('t3', T_PERSON + .6), ('t4', T('l151.w8')),
          ('t5', T_AGAIN + 1.2), ('t6h', (T_HEART0 + T_HEART1) / 2), ('t6', T_UP + .6), ('t6b', T_END - .3))


def main():
    out = ROOT / 'docs/ep002/EP002_blockT_animatic_v2.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockT_v2_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockT_v2_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
