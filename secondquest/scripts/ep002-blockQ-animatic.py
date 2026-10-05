#!/usr/bin/env python3
"""EP002 animatic, block Q (planning only): l121 "The forest is still there." ->
l129 "is coming back to people who did exactly that." (block R starts on l130).

v1, "everything is still there... except you" (Producer, 2026-10-05: "Sí, constrúyelo así").
  Q1  "The forest is still there."           the forest of block M: 1998 pixels -> today (HUD on: in game).
  Q2  "The ocarina is still there."          our 3D ocarina turning over the forest, pixels -> today, notes.
  Q3  "The Master Sword is still waiting."   the temple of block N, the sword in its pedestal, pixels -> today.
  Q4  "The Triforce still means wisdom, power and courage."  our 3D Triforce; it pulses on each word and the three
                                             words line up under it (no triangle-to-word mapping: no lore nitpicks).
  Q5  "But the person holding the controller is different."  Pull back: it was all on the CRT of his room (day).
                                             Quest on the floor with the pad (Q008); beside him, the faint kid he was
                                             (block P's memory) holds the same pad: 1998 / 2026.
  Q6  "And for this particular game... that is almost too perfect."  The cartridge with the temple on its label
                                             (block N) glows; an ALMOST TOO PERFECT stamp lands, a little crooked.
  Q7  "A story about a child becoming an adult... is coming back to people who did exactly that."  Two mirrored strips:
                                             GAME (young hero -> adult hero with shield and sword) and LIFE (the kid of
                                             the 1998 mark -> Quest at 2026); both arrows light up together and "=".
HUD: on in Q1-Q4 (in game), hidden from Q5 (real life).
v2 (final art, 2026-10-05): "today" in Q1-Q2 is the final forest #12 (a slow push in), Q3 the final temple #13 with
our 3D sword v2 standing in the pedestal's slot (push in on it; also on the cartridge label in Q6 and behind the GAME
strip in Q7); the GAME strip's young / adult hero are #3 and #4 (shield and sword); in Q5 the faint kid he was is #6a
(kid Quest seated with his pad, a memory tint) instead of a scaled copy of Q008. The room stays his childhood bedroom
(block P's room_plate: block H v8 moved its own night shot to adult Quest's room #15).
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
from lib import ROOT, W, H, PW, PH, FPS, T, ease, lin, subtitle, tag, F, cam_box, final, final_plate  # noqa
import fairy as fairy_fx  # noqa
import hud  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BP = load('blockP', 'scripts/ep002-blockP-animatic.py')          # the room by day, the marks, the kid he was
BO, BN, HB, BC, CART = BP.BO, BP.BN, BP.HB, BP.BC, BP.CART
comp, sized, fade, ctext = BN.comp, BN.sized, BN.fade, BN.ctext

T0 = T('l121') - 0.05                   # block P ends here
T_OCA = T('l122') - .05
T_SWD = T('l123') - .05
T_TRI = T('l124') - .05
T_WORDS = (T('l124.w5'), T('l124.w6'), T('l124.w8'))   # wisdom, power, courage
T_PERSON = T('l125') - .05
T_HOLD = T('l125.w5')                   # "holding": the kid he was appears
T_DIFF = T('l125.w8')                   # "different": 1998 / 2026
T_GAME = T('l126') - .05
T_PERF = T('l127.w5')                   # "perfect"
T_STORY = T('l128') - .05
T_CHILD = T('l128.w4')                  # "child"
T_ADULT = T('l128.w7')                  # "adult"
T_PEOPLE = T('l129') - .05
T_EXACT = T('l129.w8')                  # "exactly"
T_END = T('l130') - 0.05                # block R starts on l130
INK = (20, 14, 18)
HEARTS = dict(hearts=3.0, max_hearts=3)


def pix_to_now(fr, k):
    """1998 -> today: chunky N64 pixels and a small palette resolve into the smooth picture."""
    if k >= 1:
        return fr
    e = ease(max(0, k))
    old = fr.resize((W // 10, H // 10), Image.BILINEAR).quantize(24).convert('RGB').resize((W, H), Image.NEAREST)
    a = np.asarray(old).astype(np.float32); a[::4] *= .8
    return Image.blend(Image.fromarray(a.astype(np.uint8)), fr, e)


def still_tag(fr, k, text='STILL THERE'):
    if k <= 0:
        return fr
    g = Image.new('RGBA', (300, 54)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((2, 2, 297, 51), 10, fill=(20, 22, 30, 225), outline=(232, 196, 90, 255), width=3)
    ctext(d, 150, 10, text, 28, (255, 230, 160, 255))
    return comp(fr, fade(g, k), W * .5 - 150, H * .14)


# ------------------------------------------------------------------ Q1-Q3: still there
FOREST_NOW = final_plate('forest')                                           # #12 the forest village (final)
CAM_FOREST = ((1.0, .5, .5), (1.07, .52, .52))                               # a slow push in over the shot (Q1, Q2)


def forest(t):
    box = cam_box(CAM_FOREST, min(1, max(0, (t - T0) / (T_SWD - T0))))
    fr = FOREST_NOW.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)                      # drifting mist (block O), lighter on the sunny plate
    for i in range(14):
        x = (i * 140 + t * 30 * (1 + i % 3)) % (W + 300) - 150; y = H * (.35 + .05 * (i % 5))
        d.ellipse((x - 160, y - 50, x + 160, y + 50), fill=(250, 240, 220, 55))
    return Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(18))).convert('RGB')


# the temple (final #13) with our 3D sword (v2) in the pedestal's slot, composed at plate size
TEMPLE_NOW = final_plate('temple')
SLOT = (960, 393)                                                            # the slot on top of the pedestal (plate px)
_sw = BN.BL.SWD[12].transpose(Image.FLIP_TOP_BOTTOM)
SWORD_P = sized(_sw.crop(_sw.getchannel('A').getbbox()), 330)               # point down; 78% shows above the stone
CAM_SWORD = ((1.45, .5, .40), (1.6, .5, .39))


def temple_now(sword=True):
    im = TEMPLE_NOW.copy()
    if sword:
        vis = int(SWORD_P.height * .78)
        s2 = SWORD_P.crop((0, 0, SWORD_P.width, vis))
        im = CART.glow(im, SLOT[0], SLOT[1] - 120, 200, (200, 230, 255), .35)
        im = comp(im, s2, SLOT[0] - SWORD_P.width / 2, SLOT[1] + 3 - vis)
    return im


OCA = [Image.open(f).convert('RGBA') for f in sorted((ROOT / 'public/art/ep002/props3d/ocarina_spin').glob('f*.png'))]
OCA = [o.crop((150, 250, 780, 860)) for o in OCA]


def ocarina(t):
    fr = forest(t).filter(ImageFilter.GaussianBlur(9))
    fr = Image.blend(fr, Image.new('RGB', (W, H), (16, 20, 40)), .35)
    fr = CART.glow(fr, W * .5, H * .48, 330, (150, 190, 255), .45)
    o = OCA[int((t - T_OCA) * 10) % len(OCA)]
    o = sized(o, H * .62)
    fr = comp(fr, o, W * .5 - o.width / 2, H * .50 - o.height / 2 + 8 * math.sin(t * 2.2))
    d = ImageDraw.Draw(fr)
    for i in range(5):                                                          # notes drifting up
        k = ((t - T_OCA) * .55 + i * .2) % 1
        x = W * (.66 + .05 * math.sin(i * 2.1 + k * 4)) + i * 22; y = H * (.62 - .45 * k)
        c = (210, 230, 255) if i % 2 else (255, 236, 150)
        d.ellipse((x - 9, y - 6, x + 9, y + 6), fill=c); d.line((x + 8, y, x + 8, y - 34), fill=c, width=4)
    return fr


TEMPLE_SW = None


def sword(t):
    global TEMPLE_SW
    if TEMPLE_SW is None:
        TEMPLE_SW = temple_now(True)
    box = cam_box(CAM_SWORD, min(1, max(0, (t - T_SWD) / (T_TRI - T_SWD))))
    fr = TEMPLE_SW.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)
    k = .5 + .5 * math.sin((t - T_SWD) * 3)                                      # the sword waits, a slow pulse
    sx, sy = to_frame(SLOT[0], SLOT[1] - SWORD_P.height * .55, box)
    return CART.glow(fr, sx, sy, 150, (200, 230, 255), .2 + .2 * k)


def to_frame(px, py, box):
    return (px - box[0]) * W / (box[2] - box[0]), (py - box[1]) * H / (box[3] - box[1])


# ------------------------------------------------------------------ Q4: the Triforce
TRI = Image.open(ROOT / 'public/art/ep002/props3d/triforce_front.png').convert('RGBA')
TRI = TRI.crop(TRI.getchannel('A').getbbox())


def triforce(t):
    fr = Image.new('RGB', (W, H), (14, 16, 30))
    fr = CART.glow(fr, W * .5, H * .40, 520, (255, 220, 120), .30)
    pulse = 0
    for tw in T_WORDS:                                                          # a pulse on each word
        dt = t - tw
        if -.05 < dt < .6:
            pulse = max(pulse, math.sin(min(1, (dt + .05) / .6) * math.pi))
    tr = sized(TRI, H * (.50 + .03 * pulse))
    fr = CART.glow(fr, W * .5, H * .38, 300, (255, 236, 160), .25 + .45 * pulse)
    fr = comp(fr, tr, W * .5 - tr.width / 2, H * .38 - tr.height / 2)
    d = ImageDraw.Draw(fr)
    words = ('WISDOM', 'POWER', 'COURAGE')
    f = F(40)
    widths = [d.textlength(w, font=f) for w in words]
    gap = 70; x = W / 2 - (sum(widths) + gap * 2) / 2
    for w, tw, wd in zip(words, T_WORDS, widths):
        ka = min(1, max(0, (t - tw + .05) / .25))
        if ka > 0:
            y = H * .68 + 16 * (1 - ease(ka))
            col = tuple(int(lin(60, c, ka)) for c in (255, 226, 140))
            d.text((x, y), w, font=f, fill=col, stroke_width=4, stroke_fill=INK)
        x += wd + gap
    return fr


def game(t):
    """Q1-Q4 in game (HUD on)."""
    if t < T_OCA:
        fr = pix_to_now(forest(t), (t - T0 - .5) / .7); lab = 'Q1 the forest is still there'
    elif t < T_SWD:
        fr = pix_to_now(ocarina(t), (t - T_OCA - .4) / .6); lab = 'Q2 the ocarina is still there'
    elif t < T_TRI:
        fr = pix_to_now(sword(t), (t - T_SWD - .4) / .6); lab = 'Q3 the Master Sword is still waiting'
    else:
        fr = triforce(t); lab = 'Q4 wisdom, power and courage'
    if t < T_TRI:
        fr = still_tag(fr, min(1, max(0, (t - (T0 if t < T_OCA else T_OCA if t < T_SWD else T_SWD) - 1.1) / .25)),
                       'STILL WAITING' if t >= T_SWD else 'STILL THERE')
    fr = hud.draw(fr, t=t, **HEARTS)
    return fr, lab


# ------------------------------------------------------------------ Q5: the person holding the controller
QIMG = sized(HB.QPROF, int(BP.QSPEC[2] * PH))                                  # Q008 on the floor (the childhood room's scale)
SCREEN = BO.SCREEN
SX0, SX1, SY0, SY1 = BO.SX0, BO.SX1, BO.SY0, BO.SY1
CAM_SCR = (PW / (SX1 - SX0) * .92, (SX0 + SX1) / 2 / PW, (SY0 + SY1) / 2 / PH)
CAM_ROOM = (1.25, .62, .60)                                                     # him, the kid he was and the TV
GX = BP.QSPEC[0] * PW + QIMG.width * .62                                        # the kid he was (plate px, centre)
GHOST = None


def _ghost():
    global GHOST
    if GHOST is None:
        g = sized(final('kid_quest_play'), QIMG.height * .62)                 # #6a: the kid he was, seated with his pad, facing the TV
        a = np.asarray(g).astype(np.float32); a[..., :3] = a[..., :3] * .45 + np.array([190, 215, 255]) * .55; a[..., 3] *= .55
        GHOST = Image.fromarray(a.astype(np.uint8))
    return GHOST


def room(t, pic):
    base = BP.room_plate(t, pic)
    rgb = CART.glow(base.convert('RGB'), BC.SCR_C[0] * PW, BC.SCR_C[1] * PH, 380, (170, 210, 255), .3)
    base = rgb.convert('RGBA')
    qx, qf = BP.QSPEC[0] * PW, BP.QSPEC[1] * PH
    sh = Image.new('RGBA', base.size); ImageDraw.Draw(sh).ellipse((qx - QIMG.width * .45, qf - 24, qx + QIMG.width * .45, qf + 14), fill=(0, 0, 0, 90))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    base.alpha_composite(QIMG, (int(qx - QIMG.width / 2), int(qf - QIMG.height)))
    kg = min(1, max(0, (t - T_HOLD) / .5))
    if kg > 0:                                                                  # the kid he was, closer to the TV (as kids sit), same pad
        g = _ghost()
        base.alpha_composite(fade(g, kg), (int(GX - g.width / 2), int(qf - g.height)))
    return base.convert('RGB')


def person(t, last_game):
    k = ease(min(1, max(0, (t - T_PERSON) / 1.6)))
    pic = last_game.crop((int((W - H * 4 / 3) / 2), 0, int((W + H * 4 / 3) / 2), H)).resize((320, 240), Image.BILINEAR)
    box = cam_box((CAM_SCR, CAM_ROOM), k)
    fr = room(t, pic).crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)
    if t < T_PERSON + .25:                                                      # the full-frame game hands over to the glass
        fr = Image.blend(last_game, fr, ease((t - T_PERSON) / .25))
    kd = min(1, max(0, (t - T_DIFF + .1) / .3))
    if kd > 0:
        d = ImageDraw.Draw(fr)
        qx, qf = BP.QSPEC[0] * PW, BP.QSPEC[1] * PH
        for lab, px, py, col in (('1998', GX, qf - QIMG.height * .80, (190, 215, 255)),
                                 ('2026', qx - QIMG.width * .05, qf - QIMG.height * 1.06, (255, 226, 140))):
            x = (px - box[0]) * W / (box[2] - box[0]); y = (py - box[1]) * H / (box[3] - box[1])
            g = Image.new('RGBA', (130, 50)); gd = ImageDraw.Draw(g)
            gd.rounded_rectangle((2, 2, 127, 47), 10, fill=(20, 22, 30, 230), outline=col + (255,), width=3)
            ctext(gd, 65, 8, lab, 28, col + (255,))
            fr = comp(fr, fade(g, kd), x - 65, y - 25)
    return fr


# ------------------------------------------------------------------ Q6: almost too perfect
def perfect(t):
    k = ease(min(1, (t - T_GAME) / .8))
    tn = temple_now(True).crop(tuple(int(v) for v in cam_box((CAM_SWORD[0], CAM_SWORD[0]), 0)))
    cs = lin(380, 520, k)
    cart = BN.CARTRIDGE.resize((int(cs), int(cs * BN.CARTRIDGE.height / BN.CARTRIDGE.width)), Image.LANCZOS)
    cx, cy = W * .5, H * .42
    L = BN.LABEL
    lx0, ly0 = cx - cart.width / 2 + cart.width * L[0], cy - cart.height / 2 + cart.height * L[1]
    lw, lh = cart.width * (L[2] - L[0]), cart.height * (L[3] - L[1])
    fr = Image.new('RGB', (W, H), (16, 14, 22))
    fr = CART.glow(fr, cx, cy, 420, (255, 215, 120), .25 + .15 * math.sin((t - T_GAME) * 4))
    fr = comp(fr, cart, cx - cart.width / 2, cy - cart.height / 2)
    fr.paste(tn.resize((max(1, int(lw)), max(1, int(lh))), Image.BILINEAR), (int(lx0), int(ly0)))
    ks = min(1, max(0, (t - T_PERF + .1) / .2))
    if ks > 0:                                                                  # ALMOST TOO PERFECT, a little crooked
        st = Image.new('RGBA', (680, 96)); sd = ImageDraw.Draw(st)
        sd.rounded_rectangle((4, 4, 675, 91), 12, outline=(232, 196, 90, 255), width=7, fill=(20, 18, 28, 220))
        s = 'ALMOST TOO PERFECT'; sd.text((340 - sd.textlength(s, font=F(44)) / 2, 20), s, font=F(44), fill=(255, 226, 140, 255))
        st = st.rotate(-6, resample=Image.BICUBIC, expand=True)
        sc = 1.4 - .5 * ease(ks)
        st = st.resize((int(st.width * sc), int(st.height * sc)), Image.LANCZOS)
        fr = comp(fr, fade(st, ks), cx - st.width / 2, cy + 175 - st.height / 2)
    return fr


# ------------------------------------------------------------------ Q7: the game and the life, mirrored
STRIP_H = H * .33
TOP_Y, BOT_Y = H * .07, H * .43
SMILE = BP.SMILE


def kid_ghost(h):
    g = sized(SMILE, h)
    a = np.asarray(g).astype(np.float32); a[..., :3] = a[..., :3] * .55 + np.array([190, 215, 255]) * .45
    return Image.fromarray(a.astype(np.uint8))


def strip(fr, y0, kind, k_in, k_arrow, k_lit):
    if k_in <= 0:
        return fr
    x0, x1 = W * .17, W * .95
    off = (1 - ease(k_in)) * (W if kind == 'LIFE' else -W)
    if kind == 'GAME':
        bg = TEMPLE_NOW.crop((0, int(PH * .30), PW, int(PH * .30 + PH * .55))).resize((int(x1 - x0), int(STRIP_H)), Image.BILINEAR)
        a, b = final('quest_young_back'), final('quest_adult_back')   # #3, #4 (final)
        ha, hb = STRIP_H * .62, STRIP_H * .88
        la, lb = 'CHILD', 'ADULT'
    else:
        bg = BP.frame_wall(T_PEOPLE).crop((0, int(H * .1), int(W * .5), int(H * .98))).resize((int(x1 - x0), int(STRIP_H)), Image.BILINEAR)
        a, b = kid_ghost(STRIP_H * .9 * BP.MARKS[-1][1]), SMILE
        ha, hb = STRIP_H * .9 * BP.MARKS[-1][1], STRIP_H * .9
        la, lb = '1998', '2026'
    card = Image.new('RGB', (int(x1 - x0), int(STRIP_H))); card.paste(bg, (0, 0))
    ia, ib = sized(a, ha), sized(b, hb)
    cw = card.width
    card = comp(card, ia, cw * .22 - ia.width / 2, STRIP_H * .97 - ia.height)
    card = comp(card, ib, cw * .78 - ib.width / 2, STRIP_H * .97 - ib.height)
    d = ImageDraw.Draw(card)
    if k_arrow > 0:                                                             # the arrow from one to the other
        col = (255, 214, 40) if k_lit > 0 else (240, 240, 240)
        xa, xb, y = cw * .34, cw * .34 + (cw * .32) * ease(k_arrow), STRIP_H * .55
        d.line((xa, y, xb, y), fill=INK, width=16); d.line((xa, y, xb, y), fill=col, width=9)
        if k_arrow >= 1:
            d.polygon([(xb + 34, y), (xb - 4, y - 26), (xb - 4, y + 26)], fill=col, outline=INK, width=3)
    for lab, cx in ((la, cw * .22), (lb, cw * .78)):
        d.text((cx - d.textlength(lab, font=F(26)) / 2, 10), lab, font=F(26), fill=(255, 255, 255), stroke_width=4, stroke_fill=INK)
    d.rectangle((0, 0, cw - 1, STRIP_H - 1), outline=INK, width=5)
    fr = comp(fr, card.convert('RGBA'), x0 + off, y0)
    if k_lit > 0:
        fr = CART.glow(fr, x0 + off + cw * .5, y0 + STRIP_H * .55, 260, (255, 220, 120), .35 * k_lit)
    d = ImageDraw.Draw(fr)                                                      # the strip's name, left
    d.text((W * .085 + off - d.textlength(kind, font=F(34)) / 2, y0 + STRIP_H * .42), kind, font=F(34), fill=(255, 236, 170), stroke_width=5, stroke_fill=INK)
    return fr


def mirror(t):
    fr = Image.new('RGB', (W, H), (22, 20, 30))
    k_lit = min(1, max(0, (t - T_EXACT) / .3))
    fr = strip(fr, TOP_Y, 'GAME', min(1, (t - T_STORY) / .5), min(1, max(0, (t - T_CHILD - .2) / (T_ADULT - T_CHILD))), k_lit)
    fr = strip(fr, BOT_Y, 'LIFE', min(1, max(0, (t - T_PEOPLE) / .5)), min(1, max(0, (t - T_PEOPLE - .5) / 1.2)), k_lit)
    if k_lit > 0:                                                               # the same story: "="
        d = ImageDraw.Draw(fr); s = '='; f = F(int(90 * (1.4 - .4 * ease(k_lit))))
        d.text((W * .085 - d.textlength(s, font=f) / 2, (TOP_Y + STRIP_H + BOT_Y) / 2 - f.size * .62), s, font=f, fill=(255, 214, 40), stroke_width=6, stroke_fill=INK)
    return fr


# ------------------------------------------------------------------ render
LAST_GAME = None


def render(t):
    global LAST_GAME
    if t < T_PERSON:
        fr, lab = game(t)
        if t > T0 and t < T0 + .3:
            fr = Image.blend(Image.new('RGB', (W, H), (255, 255, 255)), fr, (t - T0) / .3)     # out of the door frame: a flash in
    elif t < T_GAME:
        if LAST_GAME is None:
            LAST_GAME = game(T_PERSON - .02)[0]
        fr = person(t, LAST_GAME); lab = 'Q5 the person holding the controller is different'
    elif t < T_STORY:
        fr = perfect(t); lab = 'Q6 almost too perfect'
        if t < T_GAME + .3:
            fr = Image.blend(person(T_GAME - .01, LAST_GAME or game(T_PERSON - .02)[0]), fr, ease((t - T_GAME) / .3))
    else:
        fr = mirror(t); lab = 'Q7 a child becoming an adult'
    keys = [(T0, .70, .26), (T_TRI, .74, .22), (T_PERSON, .60, .30), (T_GAME, .72, .28), (T_STORY, .08, .82), (T_END, .10, .82)]
    fr = fairy_fx.draw(fr, keys, t, size=.04)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 23 STILL THERE · {lab} · BLOCK Q v2 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('q1', T('l121.w4') + .3), ('q2', T('l122.w4') + .3), ('q3', T('l123.w5')), ('q4', T_WORDS[2] + .5), ('q5a', T_PERSON + .8),
          ('q5', T_DIFF + .5), ('q6', T_PERF + .5), ('q7a', T_ADULT + .4), ('q7', T_END - .3))


def main():
    out = ROOT / 'docs/ep002/EP002_blockQ_animatic_v2.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockQ_v2_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockQ_v2_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
