#!/usr/bin/env python3
"""EP002 animatic, block J (planning only): l71 "Player two?" -> l77 "No twenty-eight years of expectations."
(block K starts on l78 "So the remake has two completely different jobs.").

Same game-menu language as block I (the new player's side now):
  J1  "Player two? Player two knows none of this."    The NEW PLAYER card lights up; FILE 2 opens: 3 hearts, 000:00,
                                                      three empty item slots with "?", 0%.
  J2  "They meet the Great Deku Tree and think: That is an extremely large tree with an extremely personal problem."
                                                      The giant old tree with a kind face (final art #14); the new player
                                                      (#2d, tunic), tiny on the open ground, looks up in awe (new-player HUD:
                                                      3 hearts, 0 rupees). On "personal problem" the tree looks unwell
                                                      (a thermometer, a spider's shadow, sweat drops) and she tilts her
                                                      head (#2e, hand at the chin): "?".
  J3  "For them, Hyrule has no nostalgia. No childhood attached to it. No twenty-eight years of expectations."
                                                      A side-by-side sheet, VETERAN | NEW PLAYER, one row per line:
                                                      NOSTALGIA (the heart bar from block F: full | empty), CHILDHOOD
                                                      (the "Saturday, 1998" photo | a blank photo), EXPECTATIONS
                                                      (28 YEARS, heavy | 0).
v7: final art (#2c, #2d, #2e Pixie in her tunic; #14 the tree). HUD: on in the forest only. Sounds: none (all sounds at the end, Producer). Framing QC before sending.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, final, final_plate, subtitle, tag, F, S, Si, P, out_path, video_args, audio_args  # noqa
import fairy as fairy_fx  # noqa
import ui_kit as UI  # noqa: the approved on-screen text style (2026-10-06)
import hud  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BI = load('blockI', 'scripts/ep002-blockI-animatic.py')          # menus, cards, panel style, the veteran
HB, G, CART = BI.HB, BI.G, BI.CART
comp, sized, fade, panel, ctext = BI.comp, BI.sized, BI.fade, BI.panel, BI.ctext

T0 = T('l71') - 0.05                    # block I ends here
T_NONE = T('l72') - .05
T_TREE = T('l73') - .05
T_LARGE = T('l74.w5')
T_PROB = T('l74.w10')                   # "personal problem"
T_NOST = T('l75') - .05
T_NOST_W = T('l75.w6')
T_CHILD = T('l76') - .05
T_EXP = T('l77') - .05
T_END = T('l78') - 0.05                 # block K starts on l78
INK = (20, 14, 18, 255)
GOLD, BLUE = (232, 196, 90), (120, 200, 255)
P2 = BI.P2
P2_T = final('pixie_tunic_wave')                                      # final art #2c: Pixie in her hero tunic, waving
BI.FACE[id(P2_T)] = .135                                               # its face width (fraction of the art's height), as #2a in block I's cards
P2_AWE = final('pixie_tunic_awe')                                     # #2d: looking up in awe
P2_HMM = final('pixie_tunic_think')                                   # #2e: hand at the chin
PIX_TAG = ''                                                          # (was the MISSING tag of the recoloured stand-in)
P1 = final('quest_veteran')                                           # final art #1: veteran Quest in his tunic (was block I's recolour)


# ------------------------------------------------------------------ J1: the new player's file
def new_file(fr, t, a):
    g = panel(560, 410, a, outline=BLUE + (255,)); d = ImageDraw.Draw(g)
    d.text((30, 20), 'FILE 2 · NEW PLAYER', font=F(28), fill=BLUE + (int(255 * a),))
    for i in range(3):                                                    # 3 hearts: a brand-new file
        hud._heart(d, 46 + i * 34, 82, 11, (232, 44, 52, int(255 * a)))
    d.text((30, 140), 'TIME  000:00', font=F(26), fill=(230, 230, 245, int(255 * a)))
    out = comp(fr, g, W * .5 - 120, H * .1)
    d2 = ImageDraw.Draw(out, 'RGBA')
    for i, sx in enumerate(BI.SLOT_X):                                    # three empty slots, a "?" in each
        d2.rounded_rectangle((sx - 52, BI.SLOT_Y - 52, sx + 52, BI.SLOT_Y + 52), 14, fill=(30, 36, 80, int(230 * a)), outline=(235, 235, 250, int(255 * a)), width=3)
        k = min(1, max(0, (t - T('l72.w4') - .12 * i) / .25))             # "none": the "?" pop in, one by one
        if k > 0:
            ctext(d2, sx, BI.SLOT_Y - 30 - 8 * (1 - k), '?', int(52 + 10 * (1 - k)), (150, 160, 200, int(255 * a * k)))
    d2.text((800, 404), '0%', font=F(40), fill=(150, 160, 200, int(255 * a)))
    return out


def frame_j1(t):
    fr = BI.MENU_BG.copy()
    k = ease(min(1, (t - T0) / .45))                                      # the waiting card grows into the NEW PLAYER card
    if t < T0 + .2:
        fr = Image.blend(BI.eras_shot(T0), fr, (t - T0) / .2)
    suited = t >= T_NONE - .15                                           # FILE 2 opens = she starts playing: the tunic
    c = BI.card(P2_T if suited else P2, 'NEW PLAYER', BLUE, alpha=1, pixie=True, missing=PIX_TAG if suited else '')
    s = lin(.38, 1, k)
    c = c.resize((int(c.width * s), int(c.height * s)), Image.LANCZOS)
    x = lin(W - 64 - 120, W * .07, k); y = lin(44, H * .12, k)
    fr = CART.glow(fr, x + c.width / 2, y + c.height / 2, int(260 * k) + 1, BLUE, .25 * k)
    fr = comp(fr, c, x, y)
    if T_NONE - .15 <= t < T_NONE + .35:                                  # a flash as the new game starts
        f = 1 - (t - T_NONE + .15) / .5
        fr = CART.glow(fr, x + c.width / 2, y + c.height / 2, 240, (255, 255, 240), .8 * f)
    if t < T_NONE:                                                        # "Player two?"
        d = ImageDraw.Draw(fr)
        kq = min(1, max(0, (t - T('l71.w2')) / .25))
        if kq > 0:
            d.text((W * .07 + 250, H * .12 + 40), '?', font=F(int(60 + 20 * (1 - kq))), fill=BLUE, stroke_width=5, stroke_fill=(20, 14, 18))
    fa = ease(min(1, max(0, (t - T_NONE + .15) / .4)))
    if fa > 0:
        fr = new_file(fr, t, fa)
    return fr, 'J1 player two? knows none of this'


# ------------------------------------------------------------------ J2: the giant tree
TREE = final_plate('tree').resize((W, H), Image.LANCZOS)                 # final art #14: the giant tree with a kind face
FACE = (W * .65, H * .17)                                              # its face (eyes), frame px of the plate
PX, PFEET, PHH = W * .24, H * .88, H * .40                             # Pixie on the open ground, lower left (tiny next to it)
_m = Image.new('L', (W, H), 0)
ImageDraw.Draw(_m).polygon([(W * .44, 0), (W, 0), (W, H * .82), (W * .30, H * .78), (W * .42, H * .55), (W * .47, H * .25)], fill=255)
TREE_MASK = _m.filter(ImageFilter.GaussianBlur(30))                    # roughly the trunk and the face (for the "unwell" tint)


def sick_fx(g, t, sick):
    """On "personal problem" the tree looks unwell: a purple tinge, a thermometer under the moustache, a spider's
    shadow crawling on the trunk, sweat drops on the brow."""
    tint = Image.new('RGBA', (W, H), (110, 60, 150, 0))
    tint.putalpha(TREE_MASK.point(lambda v: int(v * .30 * sick)))
    g = Image.alpha_composite(g.convert('RGBA'), tint)
    d = ImageDraw.Draw(g)
    a = int(255 * sick)
    mx, my = W * .615, H * .335                                          # the thermometer pokes out under the moustache
    d.line((mx, my, mx + 120, my + 46), fill=(20, 14, 18, a), width=14); d.line((mx, my, mx + 120, my + 46), fill=(245, 245, 250, a), width=9)
    d.line((mx + 60, my + 23, mx + 116, my + 44), fill=(230, 40, 40, a), width=4)
    d.ellipse((mx + 108, my + 34, mx + 132, my + 58), fill=(230, 40, 40, a), outline=INK, width=3)
    sx, sy = W * .53, H * .55 - 26 * math.sin(t * 2)                     # a spider's shadow crawling on the trunk
    d.ellipse((sx - 22, sy - 16, sx + 22, sy + 16), fill=(20, 14, 18, a))
    for j in range(4):
        for sgn in (-1, 1):
            d.line((sx, sy, sx + sgn * (34 + 6 * j), sy - 18 + 12 * j + 4 * math.sin(t * 12 + j)), fill=(20, 14, 18, a), width=4)
    for j in range(3):                                                  # sweat drops on the brow
        dy = ((t * 1.5 + j / 3) % 1) * 40
        x = W * .56 + j * 34 + (60 if j == 2 else 0); y = H * .09 + dy
        aa = int(a * (1 - dy / 40))
        d.polygon([(x, y - 12), (x - 8, y + 4), (x + 8, y + 4)], fill=(150, 210, 255, aa))
        d.ellipse((x - 8, y - 4, x + 8, y + 12), fill=(150, 210, 255, aa))
    return g.convert('RGB')


def frame_j2(t):
    sick = ease(min(1, max(0, (t - T_PROB + .1) / .4)))
    push = ease(min(1, (t - T_TREE) / (T_NOST - T_TREE)))
    fr = TREE.copy()
    breathe = .5 + .5 * math.sin((t - T_TREE) * 1.6)                     # the old tree breathes: its light swells softly
    fr = CART.glow(fr, FACE[0], FACE[1] + 40, 260, (255, 236, 170), .10 + .08 * breathe)
    if sick > 0:
        fr = sick_fx(fr, t, sick)
    who = P2_HMM if t >= T_PROB else P2_AWE
    q = sized(who, PHH)
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((PX - q.width * .4, PFEET - 10, PX + q.width * .4, PFEET + 10), fill=(0, 0, 0, 90))
    fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(6))).convert('RGB')
    fr = comp(fr, q, PX - q.width / 2, PFEET - PHH)
    if t >= T_PROB:
        kq = min(1, (t - T_PROB) / .25)
        d = ImageDraw.Draw(fr)
        d.text((PX + q.width * .45, PFEET - PHH - 30 - 10 * (1 - kq)), '?', font=F(int(56 + 14 * (1 - kq))), fill=(255, 255, 255), stroke_width=4, stroke_fill=(20, 14, 18))
    fr = fairy_fx.draw(fr, [(T_TREE, .40, .45), (T_LARGE, .48, .30), (T_PROB, .40, .42), (T_NOST, .38, .40)], t, size=.04)
    z = 1 + .06 * push                                                    # a slow push in, towards the face and her
    cx, cy = W * .45, H * .30                                             # anchored high: the face stays clear of the HUD
    cw, ch = W / z, H / z
    x0 = min(max(cx - cw / 2, 0), W - cw); y0 = min(max(cy - ch / 2, 0), H - ch)
    fr = fr.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BILINEAR)
    fr = hud.draw(fr, hearts=3, max_hearts=3, magic=0.0, rupees=0, t=None, alpha=min(1, (t - T_TREE) / .4))   # a new player's HUD
    if t < T_TREE + .3:
        fr = Image.blend(Image.new('RGB', fr.size, (255, 255, 255)), fr, (t - T_TREE) / .3)
    return fr, 'J2 the giant tree: an extremely personal problem'


# ------------------------------------------------------------------ J3: veteran | new player, three rows
ROWS = [('NOSTALGIA', T_NOST_W - .4), ('CHILDHOOD', T_CHILD + .1), ('EXPECTATIONS', T_EXP + .2)]


def heart_bar(d, x, y, w, v, a):
    d.rounded_rectangle((x, y, x + w, y + 22), 8, fill=(20, 20, 30, int(220 * a)), outline=(235, 235, 250, int(255 * a)), width=2)
    if v > 0:
        d.rounded_rectangle((x + 3, y + 3, x + 3 + (w - 6) * v, y + 19), 6, fill=(232, 60, 80, int(255 * a)))
    hud._heart(d, x + w + 22, y + 11, 11, (232, 44, 52, int(255 * a)) if v > 0 else (60, 40, 50, int(200 * a)))


def frame_j3(t):
    fr = BI.MENU_BG.copy()
    a0 = ease(min(1, (t - T_NOST) / .4))
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    cxL, cxR = W * .40, W * .73                                            # two columns
    g.alpha_composite(UI.fade(UI.sq_box(int(W * .75), int(H * .68), r=18), a0), (int(W * .18) - 8, int(H * .06) - 8))   # our game text box (family A)
    ctext(d, cxL, H * .09, 'VETERAN PLAYER', 26, GOLD + (int(255 * a0),))
    ctext(d, cxR, H * .09, 'NEW PLAYER', 26, BLUE + (int(255 * a0),))
    fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    small1 = sized(P1, H * .25); small2 = sized(P2_T, H * .25 * .95)       # the two of them, heading each column
    fr = comp(fr, fade(small1, a0), cxL - small1.width / 2 + 40, H * .135)
    fr = comp(fr, fade(small2, a0), cxR - small2.width / 2, H * .135 + H * .25 * .05)
    d = ImageDraw.Draw(fr, 'RGBA')
    for i, (name, ti) in enumerate(ROWS):
        k = ease(min(1, max(0, (t - ti) / .35)))
        if k <= 0:
            continue
        y = H * (.43 + .1 * i)
        d.text((W * .2, y - 2), name, font=F(22), fill=(200, 205, 230, int(255 * k)))
        if name == 'NOSTALGIA':                                            # the heart bar from block F: full | empty
            heart_bar(d, cxL - 50, y, 230, 1.0, k); heart_bar(d, cxR - 120, y, 230, 0.0, k)
        elif name == 'CHILDHOOD':                                          # the 1998 photo | a blank photo
            ph = HB.FB.polaroid(-99, 0)
            ph = ph.resize((int(ph.width * .42), int(ph.height * .42)), Image.LANCZOS).rotate(4, expand=True, resample=Image.BICUBIC)
            fr = comp(fr, fade(ph, k), cxL + 10 - ph.width / 2, y - 30)
            blank = Image.new('RGBA', ph.size); bd = ImageDraw.Draw(blank)
            bd.rectangle((4, 4, ph.width - 6, ph.height - 6), fill=(250, 246, 236, 255)); bd.rectangle((10, 10, ph.width - 12, ph.height - 26), fill=(225, 222, 214, 255))
            fr = comp(fr, fade(blank.rotate(-3, expand=True), k), cxR - ph.width / 2, y - 30)
            d = ImageDraw.Draw(fr, 'RGBA')
        else:                                                              # 28 YEARS (heavy) | 0
            u = (t - ti) / .35                                             # it weighs: drops in, lands with a thud, a little dust
            drop = -60 * (1 - min(1, u) ** 2) if u < 1 else 5 * math.sin(min(1, (u - 1) / .4) * math.pi) * (1 - min(1, (u - 1) / .4))
            yy = y + drop
            d.rounded_rectangle((cxL - 70, yy - 8, cxL + 150, yy + 36), 10, fill=(120, 60, 30, 240), outline=INK, width=3)
            ctext(d, cxL + 40, yy - 3, '28 YEARS', 30, (255, 230, 170, 255))
            if 1 <= u < 2.2:
                kd = (u - 1) / 1.2
                for side in (-1, 1):
                    for j in range(3):
                        px = cxL + 40 + side * (90 + 22 * j + 20 * kd); py = y + 40 - 6 * kd - 4 * j
                        r = 5 + 4 * kd
                        d.ellipse((px - r, py - r, px + r, py + r), fill=(200, 190, 210, int(150 * (1 - kd))))
            ctext(d, cxR, y - 8, '0', 40, (150, 160, 200, int(255 * k)))
    return fr, 'J3 veteran | new player: nostalgia, childhood, expectations'


def render(t):
    if t < T_TREE:
        fr, lab = frame_j1(t)
    elif t < T_NOST:
        fr, lab = frame_j2(t)
    else:
        fr, lab = frame_j3(t)
        if t < T_NOST + .3:
            fr = Image.blend(Image.new('RGB', fr.size, (255, 255, 255)), fr, (t - T_NOST) / .3)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 16 PLAYER TWO · {lab} · BLOCK J v7 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('j1', T('l72.w6')), ('j2a', T_LARGE + .3), ('j2b', T_PROB + .6), ('j3', T_END - .3))



_render_shot = render


def render(t):
    """The shot, plus the place's name card the first time we enter it (Producer, 2026-10-06: video-game detail 1)."""
    return UI.area_enter(_render_shot(t), t, T_TREE + .3, 'THE GREAT TREE')


def main():
    out = out_path(ROOT / 'docs/ep002/EP002_blockJ_animatic_v7.mp4')
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          *video_args(), *audio_args(), '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(out_path(ROOT / f'docs/ep002/blockJ_v7_{name}.jpg'), quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(out_path(ROOT / f'docs/ep002/blockJ_v7_{name}.jpg'), quality=85)
        print('stills')
    else:
        main()
