#!/usr/bin/env python3
"""EP002 animatic, block R (planning only): l130 "Somebody who first crossed Hyrule Field in 1998..." ->
l136 "and see if it still recognizes us." (block S starts on l137).

v1, "same road, different person" (Producer, 2026-10-05: "Sí, constrúyelo así"). Hyrule Field is used here because
the script is about the field.
  R1  "Somebody who first crossed Hyrule Field in 1998 can now cross it again with almost three decades between those
       two versions of themselves."  Split screen, the same road and the same camera: left, the 1998 field (pixels,
       fog) with young hero Quest walking; right, today's field with adult Quest (shield and sword on his back). A time
       ruler 1998 -> 2026 stretches under them and reads 28 YEARS on "three decades".
  R2  "Same road. Different person."  The divider dissolves: one road, both of them on it (the young one still in
       1998 pixels). SAME ROAD on the road; DIFFERENT PERSON between them.
  R3  "And maybe that is what we actually want. Not the old game back."  Navi flies between them; the 1998 look tries
       to creep back over the screen, stops and retreats; OLD GAME BACK is struck out.
  R4  "A chance to stand beside an old memory... and see if it still recognizes us."  Adult Quest stops on the road,
       facing the castle; the young one turns into the memory (translucent, as in blocks P and Q) beside him; on
       "recognizes" a "?" over the memory flips to "!", a Navi-blue glow links them.
HUD: hidden on the R1 split (a comparison of two eras, Producer), fades in on the one road (in game).
v5 (final art, 2026-10-05): the field is the final #11; the young hero walks with #3 and #9 (#3 mirrored) alternating;
adult Quest is #4 (3D shield and sword); in R4 the young one turns into #3a mirrored (looking up to the right, at
adult Quest) as he becomes the memory. No stand-ins left in R.
Sounds: none (all at the end). Free.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, W, H, PW, PH, FPS, T, ease, lin, subtitle, tag, F, cam_box, final, final_plate, walk_adult, STEP_RATE, SLOW_RATE, SLOW_STRIDE, road_walk, plate_to_screen  # noqa
import fairy as fairy_fx  # noqa
import ui_kit as UI  # noqa: the approved on-screen text style (2026-10-06)
import hud  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BQ = load('blockQ', 'scripts/ep002-blockQ-animatic.py')
BN, CART = BQ.BN, BQ.CART
G = load('blockG', 'scripts/ep002-blockG-animatic.py')               # the field, the 1998 and today looks
comp, sized, fade, ctext = BN.comp, BN.sized, BN.fade, BN.ctext

T0 = T('l130') - 0.05                   # block Q ends here
T_1998 = T('l130.w8')                   # "1998": the ruler starts
T_DEC = T('l130.w16')                   # "three (decades)": 28 YEARS
T_SAME = T('l131') - .05
T_DIFF = T('l132') - .05
T_WANT = T('l133') - .05
T_NOT = T('l134') - .05
T_BESIDE = T('l135') - .05
T_RECOG = T('l136.w6')                  # "recognizes"
T_END = T('l137') - 0.05                # block S starts on l137
INK = (20, 14, 18)
HEARTS = dict(hearts=3.0, max_hearts=3)

FIELD = final_plate('field')                                                 # #11 the day field: road, castle far away, volcano
YOUNG = final('quest_young_back')                                             # #3 young hero, back; #9 = #3 mirrored, the other step
YOUNG_B = final('quest_young_back_b')
ADULT = final('quest_adult_back')                                             # #4 adult hero, back, 3D shield + sword (exported: blocks T, U)
LOOKUP = final('quest_young_lookup', flip=True)                               # #3a mirrored: looks up to the RIGHT, at adult Quest


def pixelated(im, f=6):
    """The young hero in 1998 pixels."""
    s = im.resize((max(1, im.width // f), max(1, im.height // f)), Image.NEAREST)
    return s.resize(im.size, Image.NEAREST)


def memory(im):
    a = np.asarray(im).astype(np.float32); a[..., :3] = a[..., :3] * .55 + np.array([200, 225, 255]) * .45; a[..., 3] *= .82
    return Image.fromarray(a.astype(np.uint8))


# R1-R3 (Producer, 2026-10-06): the two of them walk down the field road itself, slowly, side by side and in step, all the
# way from R1 to "beside" (R4), instead of walking in place; the camera follows a little. Plate fractions, at R1's start:
A_H0, Y_FEET0 = .36, .93                                                      # adult Quest's height and feet (young: .26)
Y_OFF, A_OFF = -.075, .065                                                    # on the one road: young left, adult right of its centre


def duo(t):
    """Where they are on the road (plate fractions): road centre x, feet y, adult height, young height, perspective
    scale. They stop on "beside"."""
    x, y, h = road_walk(min(t, T_BESIDE) - T0, A_H0, Y_FEET0, stride_m=SLOW_STRIDE, rate=SLOW_RATE)
    return x, y, h, h * .26 / .36, h / A_H0


def young_px(t, h, phase=0.0, walking=True):
    """The young hero's walk in 1998 pixels, h pixels tall: #3 and #9 alternate in time with the bob."""
    return pixelated(sized(YOUNG_B if walking and int((t * SLOW_RATE + phase) / math.pi) % 2 else YOUNG, h))
ICON_CART = sized(BN.CARTRIDGE, 46)                                          # ruler milestones: the cartridge (1998), the Switch 2 (2026)


def _sw2_chill():
    """The Switch 2 milestone with a calm picture on its screen (Producer: no green key): today's field at sunset."""
    import cv2
    BL = BN.BL
    scr = FIELD.resize((W, H), Image.BILINEAR)
    scr = Image.blend(scr, Image.new('RGB', (W, H), (255, 170, 110)), .28).filter(ImageFilter.GaussianBlur(2))
    scr = CART.glow(scr, W * .5, H * .38, 420, (255, 220, 160), .45)
    src = np.float32([[0, 0], [W, 0], [W, H], [0, H]])
    M = cv2.getPerspectiveTransform(src, BL.SW2_QUAD.astype(np.float32))
    pic = cv2.warpPerspective(np.asarray(scr), M, BL.SW2.size)
    a = np.asarray(BL.SW2).copy()
    c = a[..., :3].astype(np.int16)
    key = (c[..., 1] > c[..., 0] + 30) & (c[..., 1] > c[..., 2] + 30)          # the key's anti-aliased fringe too
    m = cv2.dilate((BL.SW2_MASK | key).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    m &= BL.SW2_MASK | key | cv2.dilate(BL.SW2_MASK.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    pic = cv2.warpPerspective(np.asarray(scr), M, BL.SW2.size, borderMode=cv2.BORDER_REPLICATE)
    a[m, :3] = pic[m]
    return Image.fromarray(a)


ICON_SW2 = sized(_sw2_chill(), 46)


def _xfade(a, b, k):
    """Cross-fade two cut-outs of the same height (different widths), bottom-centred."""
    w = max(a.width, b.width); out = Image.new('RGBA', (w, a.height))
    out.alpha_composite(fade(a, 1 - k), ((w - a.width) // 2, 0)); out.alpha_composite(fade(b, k), ((w - b.width) // 2, 0))
    return out


def field_box(t, z0=1.0, z1=1.25, t0=None, t1=None):
    k = min(1, max(0, (t - (t0 or T0)) / ((t1 or T_END) - (t0 or T0))))
    return cam_box(((z0, .5, .6), (z1, .5, .6)), k)


def field_view(t, z0=1.0, z1=1.25, t0=None, t1=None):
    """The road ahead, the camera slowly following them down it."""
    box = field_box(t, z0, z1, t0, t1)
    return FIELD.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)


def walker(fr, im, x, feet, h, t, phase=0.0, walking=True):
    q = sized(im, h) if im.height != int(h) else im
    bob = 4 * abs(math.sin(t * SLOW_RATE + phase)) * h / (H * .36) if walking else 0
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((x - q.width * .4, feet - 8, x + q.width * .4, feet + 8), fill=(0, 0, 0, 70))
    fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(5))).convert('RGB')
    return comp(fr, q, x - q.width / 2, feet - q.height - bob)


AREA = {'1998': UI.area_title('1998', retro=True, size=46), '2026': UI.area_title('2026', size=46)}


def year_tag(fr, cx, text, col, k=1.0):
    """Each era's area title card (Producer, 2026-10-06: option 2): 1998 in square pixels, 2026 in Anton."""
    g = AREA[text]
    return comp(fr, fade(g, k), cx - g.width / 2, H * .13)


# ------------------------------------------------------------------ R1: two crossings, one road
def split(t):
    full = field_view(t, t1=T_SAME)
    left = G.old_look(full).crop((W // 4, 0, W // 4 + W // 2, H))
    right = G.new_look(full).crop((W // 4, 0, W // 4 + W // 2, H))
    fr = Image.new('RGB', (W, H)); fr.paste(left, (0, 0)); fr.paste(right, (W // 2, 0))
    x, y, ha, hy, _ = duo(t)                                                   # each on his own era's road, in step
    sx, sy, sa = plate_to_screen(x, y, ha, field_box(t, t1=T_SAME)); sy_ = sa * hy / ha
    fr = walker(fr, young_px(t, sy_), sx - W / 4, sy, sy_, t)
    fr = walker(fr, walk_adult(t, rate=SLOW_RATE), sx + W / 4, sy, sa, t)
    d = ImageDraw.Draw(fr); d.line((W / 2, 0, W / 2, H), fill=(255, 255, 255), width=4)
    ky0 = 1 - min(1, max(0, (t - T_1998) / .3))                               # the year tags hand over to the ruler
    fr = year_tag(fr, W * .25, '1998', (232, 196, 90), ky0)
    fr = year_tag(fr, W * .75, '2026', (120, 190, 255), ky0)
    kr = min(1, max(0, (t - T_1998) / (T_DEC - T_1998)))                       # the ruler, 1998 -> 2026
    if kr > 0:
        y = H * .30; x0, x1 = W * .12, W * .88
        g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
        xe = lin(x0, x1, ease(kr))
        gd.line((x0, y, xe, y), fill=(20, 14, 18, 255), width=12); gd.line((x0, y, xe, y), fill=(255, 236, 170, 255), width=6)
        for i in range(29):                                                    # a tick per year
            x = lin(x0, x1, i / 28)
            if x <= xe:
                hh = 16 if i % 7 == 0 else 8
                gd.line((x, y - hh, x, y + hh), fill=(255, 236, 170, 255), width=3)
        for lab, x in (('1998', x0), ('2026', x1)):
            if x <= xe + 1:
                gd.text((x - gd.textlength(lab, font=F(24)) / 2, y - 50), lab, font=F(24), fill=(255, 255, 255, 255), stroke_width=4, stroke_fill=INK + (255,))
        fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
        for icon, cap, x in ((ICON_CART, 'FIRST TIME', x0), (ICON_SW2, 'AGAIN', x1)):   # Producer improvement 2: milestones
            if x <= xe + 1:
                ki = 1
                fr = comp(fr, fade(icon, ki), x - icon.width / 2, y + 18)
                dd = ImageDraw.Draw(fr)
                dd.text((x - dd.textlength(cap, font=F(18)) / 2, y + 22 + icon.height), cap, font=F(18), fill=(255, 255, 255), stroke_width=3, stroke_fill=INK)
        ky = min(1, max(0, (t - T_DEC) / .3))
        if ky > 0:
            s = '28 YEARS'; f = F(int(44 * (1.3 - .3 * ease(ky))))
            d = ImageDraw.Draw(fr)
            d.text((W / 2 - d.textlength(s, font=f) / 2, y - 16 - f.size * 1.6), s, font=f, fill=(255, 214, 40), stroke_width=6, stroke_fill=INK)
    return fr


# ------------------------------------------------------------------ R2-R4: one road
R2_CAM = dict(z0=1.25, z1=1.4, t0=T_SAME, t1=T_BESIDE)                       # continues R1's camera, following them
x_, y_, ha_, hy_, k_ = duo(T_BESIDE)                                          # where they stop: R4's memory is drawn this size
YOUNG_REAL = sized(LOOKUP, plate_to_screen(x_, y_, hy_, field_box(T_BESIDE, **R2_CAM))[2])   # R4: he turns and looks up at him (#3a)
YOUNG_MEM = memory(YOUNG_REAL)


def spots(t):
    """Screen positions on the one road: young x, adult x, feet y, young height, adult height (pixels)."""
    x, y, ha, hy, k = duo(t)
    box = field_box(t, **R2_CAM)
    yx, feet, sa = plate_to_screen(x + Y_OFF * k, y, ha, box)
    ax = plate_to_screen(x + A_OFF * k, y, ha, box)[0]
    return yx, ax, feet, sa * hy / ha, sa


def one_road(t):
    fr = G.new_look(field_view(t, **R2_CAM))
    YX, AX, FEET, YH, AH = spots(t)
    if T_NOT <= t < T_BESIDE:                                                  # R3: the 1998 look creeps back, then retreats
        k = (t - T_NOT) / (T_BESIDE - T_NOT)
        reach = .45 * math.sin(min(1, k / .7) * math.pi)
        sx = int(W * reach)
        if sx > 2:
            fr.paste(G.old_look(fr).crop((0, 0, sx, H)), (0, 0))
            ImageDraw.Draw(fr).line((sx, 0, sx, H), fill=(200, 240, 255), width=4)
    walking = t < T_BESIDE
    km = min(1, max(0, (t - T_BESIDE) / .6))                                   # R4: the young one becomes the memory
    ypx = young_px(t, YOUNG_MEM.height if not walking else YH, walking=walking)
    if 0 < km < 1:                                                             # he turns: the 1998 back view dissolves into #3a
        young = _xfade(ypx, YOUNG_MEM, km)
    else:
        young = YOUNG_MEM if km >= 1 else ypx
    kc = math.sin(min(1, max(0, (t - T_RECOG) / 1.2)) * math.pi)              # Producer improvement 3: recognised, his colour comes back for a moment
    if kc > 0 and km >= 1:
        young = Image.blend(YOUNG_MEM, YOUNG_REAL, kc)
    if km > 0:                                                                 # a soft light around the memory, so it reads on the grass
        fr = CART.glow(fr, YX, FEET - YH * .5, int(YH * .7), (190, 220, 255), .45 * km)
    fr = walker(fr, young, YX, FEET, YH, t, walking=walking)
    fr = walker(fr, walk_adult(t, rate=SLOW_RATE) if walking else ADULT, AX, FEET, AH, t, walking=walking)
    d = ImageDraw.Draw(fr)
    ks = min(1, max(0, (t - T_SAME - .1) / .3)) * (1 - min(1, max(0, (t - T_WANT) / .3)))
    if ks > 0:                                                                 # SAME ROAD, on the road
        # a short signpost on the left verge, just behind them; Producer (2026-10-06): never over Quest. Its right edge
        # stays clear of the young one's left side.
        x_, y_, ha_, _, k_ = duo(t)
        px, py, ph = plate_to_screen(x_, y_ - .02, ha_ * .62, field_box(t, **R2_CAM))
        sp = UI.signpost_compact(['SAME', 'ROAD'], h_px=int(ph))
        rise = ease(ks)                                                        # it pops up out of the grass
        sp = sp.resize((sp.width, max(1, int(sp.height * (.4 + .6 * rise)))), Image.LANCZOS)
        right = YX - YH * .42 - 24                                             # the young one's left side, with a gap
        fr = comp(fr, fade(sp, min(1, ks * 2)), right - sp.width, py - sp.height)
    kd = min(1, max(0, (t - T_DIFF - .05) / .3)) * (1 - min(1, max(0, (t - T_WANT) / .3)))
    if kd > 0:                                                                 # DIFFERENT PERSON, between them
        g = UI.sq_tag('DIFFERENT PERSON', 20)                                 # our game tag (family A)
        ty = FEET - AH - H * .11
        fr = comp(fr, fade(g, kd), W * .5 - g.width / 2, ty)
        d = ImageDraw.Draw(fr)
        for x, top in ((YX, FEET - YH), (AX, FEET - AH)):
            d.line((W * .5, ty + 36, x, top + 4), fill=(255, 150, 150), width=3)
    if T_NOT + .3 <= t < T_BESIDE:                                             # OLD GAME BACK, struck out
        kk = min(1, (t - T_NOT - .3) / .25)
        st = UI.sq_box(384, 54); sd = ImageDraw.Draw(st)                     # a quest-log entry in our game box (family A)
        UI.spaced(sd, (30, 20), 'QUEST', UI.inter(14), (255, 214, 90, 255), 2)
        sd.text((100, 12), 'Old game back', font=UI.inter(34), fill=(255, 240, 210, 255))
        kx = min(1, max(0, (t - T('l134.w4')) / .3))                           # struck on "back", in pen
        if kx > 0:
            pts = [(96 + i * 3.1, 40 - 6 * (i / 100) + 2 * math.sin(i * .5)) for i in range(int(100 * kx) + 1)]
            if len(pts) > 1:
                sd.line(pts, fill=(220, 40, 50, 255), width=7, joint='curve')
        fr = comp(fr, fade(st, kk), W * .5 - st.width / 2, H * .16)
    if t >= T_BESIDE:
        kq = min(1, max(0, (t - T_BESIDE - 1.0) / .3))
        hx, hy = YX, FEET - YH - 70
        if kq > 0:                                                             # "?" ... "!" over the memory
            kf = min(1, max(0, (t - T_RECOG) / .3))
            sq = abs(math.cos(math.pi * kf)) if kf < 1 else 1
            s = '!' if kf >= .5 else '?'
            f = F(70)
            g = Image.new('RGBA', (90, 100)); gd = ImageDraw.Draw(g)
            gd.text((45 - gd.textlength(s, font=f) / 2, 6), s, font=f, fill=(255, 255, 255, 255), stroke_width=5, stroke_fill=(70, 80, 110, 255))
            g = g.resize((max(1, int(g.width * sq)), g.height), Image.LANCZOS)
            fr = comp(fr, fade(g, kq), hx - g.width / 2, hy - 60)
        kl = min(1, max(0, (t - T_RECOG - .2) / .5))
        if kl > 0:                                                             # recognised: a Navi-blue glow links them
            g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
            y0, y1 = FEET - YH * .8, FEET - AH * .8
            gd.line((YX + 20, y0, lin(YX + 20, AX - 20, ease(kl)), lin(y0, y1, ease(kl))), fill=(170, 225, 255, 230), width=8)
            fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(3))).convert('RGB')
            fr = CART.glow(fr, W * .5, FEET - AH * .6, 260, (255, 226, 160), .35 * kl)
    return fr


# ------------------------------------------------------------------ render
def render(t):
    if t < T_SAME:
        fr = split(t); lab = 'R1 1998 and today, the same field'
    else:
        fr = one_road(t)
        if t < T_SAME + .6:                                                     # the divider dissolves
            fr = Image.blend(split(T_SAME - .01), fr, ease((t - T_SAME) / .6))
        lab = ('R2 same road, different person' if t < T_WANT else 'R3 not the old game back' if t < T_BESIDE
               else 'R4 beside an old memory')
    kz = ease(min(1, max(0, (t - (T_END - 2.0)) / 2.0)))                       # Producer improvement 4: a slow push in on the two of them
    if kz > 0:
        _, _, feet, _, ah = spots(t)
        z = 1 + .28 * kz; cx, cy = W * .5, feet - ah * .55
        cw, ch = W / z, H / z
        x0 = min(max(cx - cw / 2, 0), W - cw); y0 = min(max(cy - ch / 2, 0), H - ch)
        fr = fr.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BICUBIC)
    ha = min(1, max(0, (t - T_SAME - .2) / .6))                                # Producer: no HUD on the split (a comparison, two eras); it fades in on the one road
    fr = hud.draw(fr, t=t, alpha=ha, **HEARTS)
    keys = [(T0, .52, .40), (T_SAME, .50, .42), (T_WANT, .50, .50), (T_NOT, .56, .46), (T_BESIDE, .50, .52), (T_END, .50, .55)]
    fr = fairy_fx.draw(fr, keys, t, size=.04)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 24 SAME ROAD · {lab} · BLOCK R v11 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('r1a', T0 + 1.0), ('r1', T_DEC + .6), ('r2a', T_SAME + 1.0), ('r2', T_DIFF + .8), ('r3a', T_WANT + 1.0), ('r3', T('l134.w4') + .4),
          ('r4a', T_BESIDE + 1.5), ('r4c', T_RECOG + .6), ('r4', T_END - .3))


def main():
    out = ROOT / 'docs/ep002/EP002_blockR_animatic_v11.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockR_v11_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockR_v11_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
