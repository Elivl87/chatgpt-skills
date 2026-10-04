#!/usr/bin/env python3
"""EP002 animatic, block J (planning only): l71 "Player two?" -> l77 "No twenty-eight years of expectations."
(block K starts on l78 "So the remake has two completely different jobs.").

Same game-menu language as block I (the new player's side now):
  J1  "Player two? Player two knows none of this."    The NEW PLAYER card lights up; FILE 2 opens: 3 hearts, 000:00,
                                                      three empty item slots with "?", 0%.
  J2  "They meet the Great Deku Tree and think: That is an extremely large tree with an extremely personal problem."
                                                      A forest; a giant old tree with a face (planning stand-in, MISSING
                                                      #14); the new player, tiny, looks up in awe (new-player HUD:
                                                      3 hearts, 0 rupees). On "personal problem" the tree looks unwell
                                                      (a thermometer, a spider's shadow, sweat drops) and she tilts her
                                                      head: "?".
  J3  "For them, Hyrule has no nostalgia. No childhood attached to it. No twenty-eight years of expectations."
                                                      A side-by-side sheet, VETERAN | NEW PLAYER, one row per line:
                                                      NOSTALGIA (the heart bar from block F: full | empty), CHILDHOOD
                                                      (the "Saturday, 1998" photo | a blank photo), EXPECTATIONS
                                                      (28 YEARS, heavy | 0).
HUD: on in the forest only. Sounds: none (all sounds at the end, Producer). Framing QC before sending.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, cutout, subtitle, tag, F  # noqa
import fairy as fairy_fx  # noqa
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
P2_T = cutout('pixie:wave_happy', 'forest')                           # MISSING: Pixie in her hero tunic (green, teal accents)
P2_AWE = cutout('pixie:looking_up_awe', 'forest')
P2_HMM = cutout('pixie:thinking_chin', 'forest')
PIX_TAG = 'MISSING · Pixie hero tunic'
P1 = BI.P1


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
def _forest():
    g = Image.new('RGB', (W, H)); d = ImageDraw.Draw(g)
    for y in range(H):                                                    # green-gold light through the canopy
        k = y / H
        d.line((0, y, W, y), fill=(int(lin(60, 40, k)), int(lin(110, 80, k)), int(lin(70, 40, k))))
    r = np.random.default_rng(7)
    for i in range(14):                                                   # trees behind, out of focus
        x = r.random() * W; w = 40 + 50 * r.random()
        d.rectangle((x - w / 2, 0, x + w / 2, H * .82), fill=(38, 52, 34))
    d.ellipse((-200, H * .72, W + 200, H * 1.3), fill=(70, 110, 50))      # the clearing
    g = g.filter(ImageFilter.GaussianBlur(6))
    for i in range(8):                                                    # shafts of light
        x = W * (.1 + .1 * i)
        ray = Image.new('RGBA', (W, H)); rd = ImageDraw.Draw(ray)
        rd.polygon([(x, 0), (x + 60, 0), (x - 120, H), (x - 200, H)], fill=(255, 240, 180, 26))
        g = Image.alpha_composite(g.convert('RGBA'), ray.filter(ImageFilter.GaussianBlur(10))).convert('RGB')
    return g


FOREST = _forest()


def giant_tree(t, sick):
    """Planning stand-in for the giant ancient tree (MISSING #14): a huge trunk with an old face, a dark canopy."""
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    cx = W * .36
    for (ox, oy, rx, ry) in ((-260, 60, 260, 150), (180, 40, 300, 170), (-40, -20, 340, 190), (-380, 150, 180, 110), (360, 150, 200, 120)):
        d.ellipse((cx + ox - rx, oy - ry, cx + ox + rx, oy + ry), fill=(48, 92, 44, 255), outline=INK, width=4)    # canopy
    d.polygon([(cx - 210, H * .9), (cx - 170, H * .35), (cx - 120, 120), (cx + 120, 120), (cx + 170, H * .35), (cx + 230, H * .9)],
              fill=(120, 84, 52, 255), outline=INK)                       # trunk
    for (x0, x1) in ((-300, -200), (210, 330)):                           # roots
        d.polygon([(cx + x0, H * .92), (cx + x0 + 40, H * .82), (cx + x1, H * .86), (cx + x1 + 30, H * .93)], fill=(110, 76, 46, 255), outline=INK)
    for i in range(7):                                                    # bark lines
        x = cx - 150 + i * 50
        d.line((x, 150, x + 10 * math.sin(i), H * .88), fill=(90, 60, 38, 255), width=4)
    ey = H * .42
    for ex in (cx - 70, cx + 70):                                         # old, half-closed eyes; a heavy brow
        d.ellipse((ex - 36, ey - 16, ex + 36, ey + 16), fill=(40, 26, 18, 255))
        d.arc((ex - 50, ey - 46, ex + 50, ey + 6), 200, 340, fill=(70, 46, 28, 255), width=10)
    d.ellipse((cx - 60, H * .56, cx + 60, H * .66), fill=(40, 26, 18, 255))   # mouth
    for k in range(9):                                                    # a mustache of roots
        a0 = math.radians(200 + k * 17)
        d.line((cx, H * .53, cx + 130 * math.cos(a0) * (1 if k < 5 else -1) * .9, H * .53 - 40 * math.sin(a0) + 30), fill=(95, 66, 40, 255), width=8)
    if sick > 0:                                                          # an extremely personal problem
        tint = Image.new('RGBA', (W, H), (110, 60, 150, int(70 * sick)))
        g = Image.alpha_composite(g, Image.composite(tint, Image.new('RGBA', (W, H)), g.getchannel('A')))
        d = ImageDraw.Draw(g)
        a = int(255 * sick)
        d.line((cx + 30, H * .61, cx + 150, H * .55), fill=(245, 245, 250, a), width=10)       # a thermometer
        d.ellipse((cx + 140, H * .53, cx + 164, H * .57), fill=(230, 40, 40, a), outline=INK)
        sx, sy = cx - 110, H * .66 - 26 * math.sin(t * 2)                  # a spider's shadow crawling on the trunk
        d.ellipse((sx - 22, sy - 16, sx + 22, sy + 16), fill=(20, 14, 18, a))
        for j in range(4):
            for sgn in (-1, 1):
                d.line((sx, sy, sx + sgn * (34 + 6 * j), sy - 18 + 12 * j + 4 * math.sin(t * 12 + j)), fill=(20, 14, 18, a), width=4)
        for j in range(3):                                                # sweat drops
            dy = ((t * 1.5 + j / 3) % 1) * 40
            x = cx + 120 + j * 26; y = H * .30 + dy
            d.polygon([(x, y - 12), (x - 8, y + 4), (x + 8, y + 4)], fill=(150, 210, 255, int(a * (1 - dy / 40))))
            d.ellipse((x - 8, y - 4, x + 8, y + 12), fill=(150, 210, 255, int(a * (1 - dy / 40))))
    return g


def frame_j2(t):
    fr = FOREST.copy()
    sick = ease(min(1, max(0, (t - T_PROB + .1) / .4)))
    push = ease(min(1, (t - T_TREE) / (T_NOST - T_TREE)))
    fr = Image.alpha_composite(fr.convert('RGBA'), giant_tree(t, sick)).convert('RGB')
    z = 1 + .06 * push                                                    # a slow push in on the tree
    fr = fr.resize((int(W * z), int(H * z)), Image.BILINEAR).crop((int(W * (z - 1) * .4), int(H * (z - 1) * .5), int(W * (z - 1) * .4) + W, int(H * (z - 1) * .5) + H))
    who = P2_HMM if t >= T_PROB else P2_AWE
    ph = H * .40                                                          # tiny next to the tree
    q = sized(who, ph)
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((W * .74 - q.width * .45, H * .9 - 10, W * .74 + q.width * .45, H * .9 + 10), fill=(0, 0, 0, 90))
    fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(6))).convert('RGB')
    fr = comp(fr, q, W * .74 - q.width / 2, H * .9 - ph)
    if t >= T_PROB:
        kq = min(1, (t - T_PROB) / .25)
        d = ImageDraw.Draw(fr)
        d.text((W * .74 + 50, H * .9 - ph - 20 - 10 * (1 - kq)), '?', font=F(int(56 + 14 * (1 - kq))), fill=(255, 255, 255), stroke_width=4, stroke_fill=(20, 14, 18))
    d = ImageDraw.Draw(fr)
    lab = 'MISSING · giant ancient tree (#14) · Pixie hero tunic · planning stand-ins'
    tw = d.textlength(lab, font=F(13))
    d.rectangle((W * .03, H * .17, W * .03 + tw + 12, H * .17 + 20), fill=(150, 20, 30)); d.text((W * .03 + 6, H * .17 + 2), lab, font=F(13), fill=(255, 235, 235))
    fr = fairy_fx.draw(fr, [(T_TREE, .64, .5), (T_LARGE, .5, .3), (T_PROB, .62, .45), (T_NOST, .66, .42)], t, size=.04)
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
    d.rounded_rectangle((W * .18, H * .06, W * .93, H * .74), 18, fill=(10, 14, 48, int(215 * a0)), outline=(235, 235, 250, int(255 * a0)), width=3)
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
            d.rounded_rectangle((cxL - 70, y - 8, cxL + 150, y + 36), 10, fill=(120, 60, 30, int(240 * k)), outline=INK, width=3)
            ctext(d, cxL + 40, y - 3, '28 YEARS', 30, (255, 230, 170, int(255 * k)))
            for j in range(3):                                             # it weighs: little weight lines under it
                d.line((cxL - 50 + j * 80, y + 44, cxL - 20 + j * 80, y + 44), fill=(255, 230, 170, int(160 * k)), width=3)
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
    tag(d, f'SEQ 16 PLAYER TWO · {lab} · BLOCK J v2 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('j1', T('l72.w6')), ('j2a', T_LARGE + .3), ('j2b', T_PROB + .6), ('j3', T_END - .3))


def main():
    out = ROOT / 'docs/ep002/EP002_blockJ_animatic_v2.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockJ_v2_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockJ_v2_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
