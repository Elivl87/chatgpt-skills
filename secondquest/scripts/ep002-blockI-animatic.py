#!/usr/bin/env python3
"""EP002 animatic, block I (planning only): l64 "This remake is not really being made for one audience." ->
l70 "...Link's journey spans Hyrule across two different eras." (Act 3 opens; block J starts on l71 "Player two?").

Told as the game's own menus (Navi is the menu cursor, as on the classic file select):
  I1  "This remake is not really being made for one audience."  Block H's last shot continues (today's Hyrule, the
                                                        rider gone into the distance); on "one" the field dims and a
                                                        menu asks HOW MANY PLAYERS? Navi rests on 1 PLAYER.
  I2  "It is being made for two."                       Navi moves to 2 PLAYERS; on "two" it confirms: two player cards
                                                        join: PLAYER 1 = Quest (the veteran), PLAYER 2 = Pixie (new).
  I3  "Player one already knows everything."            Player 2 steps back; Player 1's save file opens: 20 hearts,
                                                        999:59 played, three item slots full, 100% COMPLETE.
  I4  "They know what that ocarina means."              The ocarina leaves its slot, big, turning, with notes.
  I5  "...what happens when Link pulls the Master Sword."  The sword rises from its pedestal; on "Sword" a white flash
                                                        and the game's text: SEVEN YEARS LATER...
  I6  "They see three golden triangles ... a very bad decision."  The golden triangles glow; a "!" over Player 1; the
                                                        game asks MAKE A WISH?  YES / NO; Navi drifts from NO to YES on
                                                        "bad decision": a red pulse.
  I7  "The Triforce represents wisdom, power and courage, and Link's journey spans Hyrule across two different eras."
                                                        Our three plates part and name themselves (Wisdom, Power,
                                                        Courage); then Hyrule splits into its two eras: CHILD (bright)
                                                        and ADULT (dark), seven years apart.
HUD: on in plain Hyrule shots; menus and diagrams hide it (as the game does in its menus). Sounds: Bram only.
Framing QC before sending.
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
import hud  # noqa: in-game HUD in Hyrule shots (Producer)

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


HB = load('blockH', 'scripts/ep002-blockH-animatic.py')          # today's Hyrule look, the horse, G's helpers
G, CART = HB.G, HB.CART
comp, sized, crop = G.comp, G.sized, G.crop

T0 = T('l64') - 0.05                    # block H ends here
T_ONE = T('l64.w9')                     # "one": the menu
T_TWOL = T('l65') - .05
T_TWO = T('l65.w6')                     # "two": confirm
T_P1 = T('l66') - .05
T_ALL = T('l66.w5')                     # "everything"
T_OC = T('l67') - .05
T_SW = T('l68') - .05
T_PULL, T_SWORD = T('l68.w7'), T('l68.w10')
T_TRI = T('l69') - .05
T_KNOW = T('l69.w7')                    # "immediately"
T_WISH = T('l69.w10')                   # "somebody"
T_BAD = T('l69.w17')                    # "bad"
T_TF = T('l70') - .05
T_WIS, T_POW, T_COU = T('l70.w4'), T('l70.w5'), T('l70.w7')
T_ERAS = T('l70.w8')                    # "and Link's journey..."
T_TWOERAS = T('l70.w14')                # "two different eras"
T_END = T('l71') - 0.05                 # block J starts on l71 "Player two?"
HEARTS = 2.5

INK = (20, 14, 18, 255)
PANEL, GOLD, WHITE = (10, 14, 48, 215), (232, 196, 90, 255), (255, 255, 255, 255)
P1 = cutout('quest2:nostalgic_smile')
P2 = cutout('pixie:wave_happy')
PROPS = ROOT / 'public/art/ep002/props3d'
OCA = [Image.open(f).convert('RGBA') for f in sorted((PROPS / 'ocarina_spin').glob('f*.png'))]
SWD = [Image.open(f).convert('RGBA') for f in sorted((PROPS / 'sword_spin').glob('f*.png'))]
OCA = [o.crop(o.getchannel('A').getbbox()) for o in OCA]
SWD = [s.crop(s.getchannel('A').getbbox()) for s in SWD]
TRI = ROOT / 'docs/ep002/triforce'
PLATE = {n: Image.open(TRI / f'plate_{n}.png').convert('RGBA').resize((560, 560), Image.LANCZOS) for n in ('power', 'wisdom', 'courage')}
TRI_ICON = Image.open(TRI / 'triforce_alpha.png').convert('RGBA'); TRI_ICON = TRI_ICON.crop(TRI_ICON.getchannel('A').getbbox())


def _today():
    base = G.new_look(crop(G.FIELD, (1.25, .5, .6)))
    return CART.glow(base, W * .82, H * .12, 640, (255, 214, 140), .35)      # block H's golden hour


TODAY = _today()
MENU_BG = Image.blend(TODAY.filter(ImageFilter.GaussianBlur(8)), Image.new('RGB', (W, H), (8, 10, 30)), .6)


def panel(w, h, alpha=1.0, outline=(235, 235, 250, 255)):
    g = Image.new('RGBA', (w + 8, h + 8)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((4, 4, w + 4, h + 4), 18, fill=PANEL, outline=outline, width=3)
    if alpha < 1:
        g.putalpha(g.getchannel('A').point(lambda v: int(v * alpha)))
    return g


def fade(im, a):
    if a >= 1:
        return im
    im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * max(0, a)))); return im


def ctext(d, cx, y, s, size, fill):
    f = F(size); d.text((cx - d.textlength(s, font=f) / 2, y), s, font=f, fill=fill)


# ------------------------------------------------------------------ I1: today's Hyrule, then the menu
def field_shot(t):
    """Block H's last frame, continued: the rider is a speck at the castle, fading into it."""
    fr = HB.FB.grass(TODAY.copy(), t, 1.0)
    k = min(1, (t - T0) / .6)
    if k < 1:
        hf = HB.HORSE[int(t * 18) % len(HB.HORSE)]
        hh = H * .14
        hs = fade(hf.resize((int(hf.width * hh / hf.height), int(hh)), Image.LANCZOS), 1 - k)
        fr = comp(fr, hs, W * .5 - hs.width / 2, H * .58 - hh)
    return fr


def players_menu(fr, t):
    """HOW MANY PLAYERS?  1 PLAYER / 2 PLAYERS; Navi is the cursor; on "two" it confirms."""
    a = min(1, (t - T_ONE) / .3) * (1 - min(1, max(0, (t - T_TWO - .3) / .25)))
    if a <= 0:
        return fr
    g = panel(520, 300, a); d = ImageDraw.Draw(g)
    ctext(d, 264, 30, 'HOW MANY PLAYERS?', 30, GOLD[:3] + (int(255 * a),))
    sel2 = t >= T_TWO - .25
    flash = max(0, 1 - (t - T_TWO) / .3) if t >= T_TWO else 0
    for i, s in enumerate(('1 PLAYER', '2 PLAYERS')):
        on = (i == 1) == sel2
        y = 110 + i * 80
        if on:
            d.rounded_rectangle((90, y - 8, 438, y + 50), 12, fill=(255, 255, 255, int((40 + 160 * flash) * a)))
        ctext(d, 264, y, s, 40, (255, 255, 255, int(255 * a)) if on else (150, 155, 180, int(255 * a)))
    return comp(fr, g, W * .5 - 264, H * .2)


def menu_cursor(t):
    """Navi as the menu cursor (left of the highlighted option), as on the classic file select."""
    y1, y2 = (H * .2 + 110 + 24) / H, (H * .2 + 190 + 24) / H
    return [(T_ONE, .27, y1), (T_TWOL + .3, .27, y1), (T_TWO - .2, .27, y2), (T_TWO + .5, .27, y2)]


# ------------------------------------------------------------------ I2-I3: the player cards, Player 1's save file
def card(who, label, col, w=300, h=400, alpha=1.0, dim=0.0):
    g = panel(w, h, alpha, outline=col + (255,)); d = ImageDraw.Draw(g)
    ctext(d, w / 2 + 4, 18, label, 28, col + (int(255 * alpha),))
    ph = int((h - 90) * (1.0 if who is P1 else .95))                     # Pixie ~95% of Quest's height (spec)
    im = sized(who, ph)
    if dim:
        im = Image.blend(im.convert('RGB'), Image.new('RGB', im.size, (10, 14, 48)), .6 * dim).convert('RGBA'); im.putalpha(sized(who, ph).getchannel('A'))
    g.alpha_composite(fade(im, alpha), (int(w / 2 + 4 - im.width / 2), int(h - 8 - im.height)))
    return g


SLOT_X = [690, 830, 970]                                                 # the three item slots of the save file (screen x)
SLOT_Y = 330


def save_file(fr, t, a):
    """Player 1's file: 20 hearts, time played, the three items, 100% COMPLETE."""
    g = panel(560, 410, a); d = ImageDraw.Draw(g)
    d.text((30, 20), 'FILE 1 · QUEST', font=F(28), fill=GOLD[:3] + (int(255 * a),))
    for i in range(20):                                                  # 20 hearts in two rows
        x, y = 34 + (i % 10) * 34, 70 + (i // 10) * 30
        hud._heart(d, x + 12, y + 12, 11, (232, 44, 52, int(255 * a)))
    d.text((30, 140), 'TIME  999:59', font=F(26), fill=(230, 230, 245, int(255 * a)))
    out = comp(fr, g, W * .5 - 120, H * .1)
    d2 = ImageDraw.Draw(out, 'RGBA')
    for i, sx in enumerate(SLOT_X):
        d2.rounded_rectangle((sx - 52, SLOT_Y - 52, sx + 52, SLOT_Y + 52), 14, fill=(30, 36, 80, int(230 * a)), outline=(235, 235, 250, int(255 * a)), width=3)
    if t >= T_ALL:                                                       # "everything": 100% COMPLETE
        k = min(1, (t - T_ALL) / .25)
        s = 1 + .4 * (1 - k)
        st = Image.new('RGBA', (360, 70)); sd = ImageDraw.Draw(st)
        sd.rounded_rectangle((3, 3, 357, 67), 12, outline=(90, 220, 120, 255), width=5)
        ctext(sd, 180, 12, '100% COMPLETE', 34, (90, 220, 120, 255))
        st = st.rotate(-6, expand=True, resample=Image.BICUBIC)
        st = fade(st.resize((int(st.width * s), int(st.height * s)), Image.LANCZOS), k * a)
        out = comp(out, st, 830 - st.width / 2, 440 - st.height / 2)
    return out


def slot_items(fr, t, a):
    """The three items sit in their slots; each one leaves its slot when its line comes."""
    big = None
    oc = OCA[int(t * 10) % len(OCA)]
    sw = SWD[int(t * 10) % len(SWD)]
    tri = TRI_ICON
    for i, (im, ti, t1) in enumerate(((oc, T_OC, T_SW), (sw, T_SW, T_TRI + .7), (tri, T_TRI + .7, T_TF))):   # SEVEN YEARS LATER holds into l69
        out_k = ease(min(1, max(0, (t - ti) / .45))) * (1 - ease(min(1, max(0, (t - t1 + .35) / .35))))
        small = im.copy(); small.thumbnail((84, 84), Image.LANCZOS)
        if out_k < 1:
            fr = comp(fr, fade(small, a * (1 - out_k)), SLOT_X[i] - small.width / 2, SLOT_Y - small.height / 2)
        if out_k > 0:
            big = (i, im, out_k)
    return fr, big


def p1_portrait(fr, t, a, alert=0.0):
    c = card(P1, 'PLAYER 1', (232, 196, 90), alpha=a)
    fr = comp(fr, c, W * .07, H * .12)
    if alert > 0:                                                       # "!" over Player 1: he knows what comes next
        d = ImageDraw.Draw(fr)
        s = int(70 + 20 * math.sin(math.pi * min(1, alert)))
        d.text((W * .07 + 250, H * .12 - 10), '!', font=F(s), fill=(255, 80, 70), stroke_width=5, stroke_fill=(20, 14, 18))
    return fr


# ------------------------------------------------------------------ I4-I6: the items, one by one
def stage_ocarina(fr, t, k):
    o = OCA[int(t * 10) % len(OCA)]
    s = sized(o, lin(84, 300, k))
    cx, cy = lin(SLOT_X[0], 830, k), lin(SLOT_Y, 300, k)
    fr = CART.glow(fr, cx, cy, int(220 * k) + 1, (150, 200, 255), .35 * k)
    fr = comp(fr, s, cx - s.width / 2, cy - s.height / 2)
    if k > .6:                                                          # the notes it carries
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        for j in range(7):
            ph = ((t - T_OC) * .7 + j / 7) % 1
            x = cx + 200 * math.cos(j * 1.3) * (.6 + .4 * ph); y = cy - 40 - 170 * ph
            d.text((x, y), '♪' if j % 2 else '♫', font=F(38 + (j % 3) * 8), fill=(255, 236, 170, int(255 * (1 - ph) * k)), stroke_width=2, stroke_fill=(70, 45, 15))
        fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    return fr


def stage_sword(fr, t, k):
    cx, base_y = 830, 455
    d = ImageDraw.Draw(fr, 'RGBA')
    pa = k                                                               # the pedestal
    d.polygon([(cx - 120, base_y + 40), (cx + 120, base_y + 40), (cx + 90, base_y - 10), (cx - 90, base_y - 10)], fill=(110, 112, 130, int(255 * pa)), outline=(20, 14, 18, int(255 * pa)))
    d.rectangle((cx - 90, base_y - 30, cx + 90, base_y - 10), fill=(140, 142, 160, int(255 * pa)), outline=(20, 14, 18, int(255 * pa)))
    rise = ease(min(1, max(0, (t - T_PULL) / (T_SWORD - T_PULL + .2))))
    sw = SWD[12].transpose(Image.FLIP_TOP_BOTTOM)                       # hilt up, the blade down into the stone
    s = sized(sw, 380)
    fr = CART.glow(fr, cx, base_y - 150 - 80 * rise, int(240 * k) + 1, (190, 220, 255), .35 * k + .3 * rise)
    y = base_y - 20 - s.height * (.55 + .4 * rise)
    clip = Image.new('L', s.size, 0); ImageDraw.Draw(clip).rectangle((0, 0, s.width, int(base_y - 30 - y)), fill=255)   # the blade is inside the stone
    m = Image.fromarray(np.minimum(np.asarray(s.getchannel('A')), np.asarray(clip))); s2 = s.copy(); s2.putalpha(m)
    fr = comp(fr, fade(s2, k), cx - s.width / 2, y)
    if t >= T_SWORD:                                                    # white flash, then SEVEN YEARS LATER...
        f = max(0, 1 - (t - T_SWORD) / .5)
        if f > 0:
            fr = Image.blend(fr, Image.new('RGB', fr.size, (255, 255, 255)), .85 * f)
        ka = min(1, max(0, (t - T_SWORD - .2) / .3)) * (1 - min(1, max(0, (t - T_TRI - .3) / .3)))
        if ka > 0:
            g = panel(470, 80, ka); gd = ImageDraw.Draw(g)
            ctext(gd, 239, 22, 'SEVEN YEARS LATER...', 32, (255, 255, 255, int(255 * ka)))
            fr = comp(fr, g, 830 - 239, 70)
    return fr


def stage_triforce(fr, t, k):
    cx, cy = 830, 235
    s = sized(TRI_ICON, lin(84, 230, k))
    pulse = .5 + .5 * math.sin(t * 6)
    fr = CART.glow(fr, cx, cy, int(260 * k) + 1, (255, 214, 120), (.35 + .15 * pulse) * k)
    fr = comp(fr, fade(s, k), cx - s.width / 2, cy - s.height / 2)
    if t >= T_WISH:                                                     # the game asks; Navi drifts from NO to YES
        a = min(1, (t - T_WISH) / .3) * (1 - min(1, max(0, (t - T_TF + .25) / .25)))
        g = panel(520, 120, a); d = ImageDraw.Draw(g)
        ctext(d, 264, 14, 'MAKE A WISH?', 32, (255, 255, 255, int(255 * a)))
        yes = t >= T_BAD
        d.text((120, 62), 'YES', font=F(34), fill=((255, 120, 110) if yes else (150, 155, 180)) + (int(255 * a),))
        d.text((330, 62), 'NO', font=F(34), fill=((150, 155, 180) if yes else (255, 255, 255)) + (int(255 * a),))
        fr = comp(fr, g, 830 - 264, 385)
    if t >= T_BAD:                                                      # the very bad decision: a red pulse
        r = max(0, 1 - (t - T('l69.w18')) / .6) if t >= T('l69.w18') else .4
        fr = Image.blend(fr, Image.new('RGB', fr.size, (160, 10, 20)), .35 * r)
    return fr


def wish_cursor():
    y = (385 + 62 + 20) / H
    return [(T_WISH + .2, (830 - 264 + 330 - 30) / W, y), (T_BAD - .3, (830 - 264 + 330 - 30) / W, y), (T_BAD, (830 - 264 + 120 - 30) / W, y), (T_TF - .3, (830 - 264 + 120 - 30) / W, y)]


# ------------------------------------------------------------------ I7: wisdom, power, courage; two eras
PLATE_OFF = {'power': (0, -1), 'wisdom': (-.87, .5), 'courage': (.87, .5)}


def triforce_plates(fr, t):
    cx, cy = W * .5, H * .44
    split = ease(min(1, max(0, (t - T_WIS + .3) / .6)))
    for n in ('wisdom', 'power', 'courage'):
        ti = {'wisdom': T_WIS, 'power': T_POW, 'courage': T_COU}[n]
        ox, oy = PLATE_OFF[n]
        p = PLATE[n]
        x = cx - p.width / 2 + ox * 70 * split; y = cy - p.height / 2 + oy * 70 * split
        lit = min(1, max(0, (t - ti) / .3))
        fr = CART.glow(fr, cx + ox * 150, cy + oy * 110, 160, (255, 214, 120), .3 * lit)
        fr = comp(fr, p, x, y)
        if lit > 0:                                                     # it names itself
            d = ImageDraw.Draw(fr)
            lx, ly = {'power': (cx - 200, cy - 150), 'wisdom': (cx - 330, cy + 120), 'courage': (cx + 290, cy + 120)}[n]
            ctext(d, lx, ly, n.upper(), int(30 + 6 * (1 - lit)), (255, 230, 160))
    return fr


def eras_shot(t):
    """Hyrule across two eras: CHILD (bright) | ADULT (dark, stormy), seven years apart."""
    k = ease(min(1, (t - T_ERAS) / .6))
    child = G.new_look(crop(G.FIELD, (1.5, .5, .6)))
    adult = crop(G.FIELD, (1.5, .5, .6))
    a = np.asarray(adult).astype(np.float32)
    yy = np.mgrid[0:H, 0:W][0][..., None] / H
    a = a * .45 + np.array([40, 20, 40]) * .55
    a = a * (1 - (yy < .45) * .5) + np.array([150, 40, 50]) * (yy < .45) * .5 * (1 - yy / .45)    # a red, stormy sky
    adult = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    young = cutout('quest:walking_back', 'hero')
    yq = sized(young, H * .30); aq = sized(young, H * .42)
    child = comp(child, yq, W * .5 - yq.width / 2, H * .92 - yq.height)
    adult = comp(adult, aq, W * .5 - aq.width / 2, H * .92 - aq.height)
    fr = Image.new('RGB', (W, H), (10, 10, 20))
    half = int(W / 2)
    sl = lin(W, half, k)                                                 # the dark era slides in from the right
    fr.paste(child.crop((W // 4, 0, W // 4 + half, H)), (0, 0))
    fr.paste(adult.crop((W // 4, 0, W // 4 + half, H)), (int(sl), 0))
    d = ImageDraw.Draw(fr)
    d.line((sl, 0, sl, H), fill=(255, 255, 255), width=4)
    for cx, s, gold in ((W * .25, 'CHILD', True), (W * .75, 'ADULT', False)):
        f = F(30); tw = d.textlength(s, font=f)
        d.rounded_rectangle((cx - tw / 2 - 18, H * .1, cx + tw / 2 + 18, H * .17), 10, fill=(20, 22, 30), outline=(232, 196, 90) if gold else (200, 80, 90), width=3)
        d.text((cx - tw / 2, H * .107), s, font=f, fill=(255, 230, 160) if gold else (255, 190, 190))
    if t >= T_TWOERAS - .1:                                              # seven years between them
        ka = min(1, (t - T_TWOERAS + .1) / .3)
        g = panel(170, 56, ka); gd = ImageDraw.Draw(g)
        ctext(gd, 89, 14, '7 YEARS', 26, (255, 255, 255, int(255 * ka)))
        fr = comp(fr, g, W / 2 - 89, H * .3)
    return fr


# ------------------------------------------------------------------ render
def render(t):
    hud_a = 0.0
    if t < T_ONE:                                                       # I1: today's Hyrule (HUD on)
        fr = field_shot(t); hud_a = 1.0; lab = 'I1 one audience?'
    elif t < T_P1:                                                      # I1-I2: the players menu, then the cards
        k = min(1, (t - T_ONE) / .3)
        fr = Image.blend(field_shot(t), MENU_BG, k); hud_a = 1 - k
        fr = players_menu(fr, t)
        if t >= T_TWO + .6:                                              # two cards join (after the menu has gone)
            kc = ease(min(1, (t - T_TWO - .6) / .35))
            c1 = card(P1, 'PLAYER 1', (232, 196, 90), alpha=kc)
            c2 = card(P2, 'PLAYER 2', (120, 200, 255), alpha=kc)
            fr = comp(fr, c1, W * .5 - 330 - 40 * (1 - kc), H * .12)
            fr = comp(fr, c2, W * .5 + 22 + 40 * (1 - kc), H * .12)
        lab = 'I1-I2 how many players? two'
    elif t < T_TF:                                                      # I3-I6: Player 1's save file and the items
        fr = MENU_BG.copy()
        kc = ease(min(1, (t - T_P1) / .45))
        if kc < 1:                                                      # Player 2 steps back, out to the right
            c2 = card(P2, 'PLAYER 2', (120, 200, 255), alpha=1 - kc, dim=kc)
            fr = comp(fr, c2, W * .5 + 22 + 300 * kc, H * .12)
        x1 = lin(W * .5 - 330, W * .07, kc)
        alert = min(1, max(0, (t - T_KNOW) / .3)) if T_KNOW <= t < T_TF else 0
        fr = comp(fr, card(P1, 'PLAYER 1', (232, 196, 90)), x1, H * .12) if kc < 1 else p1_portrait(fr, t, 1, alert)
        fa = ease(min(1, max(0, (t - T_P1 - .25) / .4)))
        if fa > 0:
            fr = save_file(fr, t, fa)
            fr, big = slot_items(fr, t, fa)
            if big:
                i, im, k = big
                veil = Image.new('RGBA', (W, H)); ImageDraw.Draw(veil).rounded_rectangle((W * .5 - 120, H * .1, W * .5 + 448, H * .1 + 418), 18, fill=(8, 10, 30, int(170 * k)))
                fr = Image.alpha_composite(fr.convert('RGBA'), veil).convert('RGB')
                fr = (stage_ocarina, stage_sword, stage_triforce)[i](fr, t, k)
        lab = ('I3 player one knows everything' if t < T_OC else 'I4 the ocarina' if t < T_SW else 'I5 the sword (seven years later)'
               if t < T_TRI else 'I6 three golden triangles: a very bad decision')
    elif t < T_ERAS:                                                    # I7a: the plates name themselves
        fr = Image.blend(MENU_BG, Image.new('RGB', (W, H), (8, 6, 4)), .5)
        fr = triforce_plates(fr, t)
        if t < T_TF + .3:
            fr = Image.blend(Image.new('RGB', fr.size, (255, 230, 170)), fr, (t - T_TF) / .3)
        lab = 'I7 wisdom, power, courage'
    else:                                                               # I7b: two eras
        fr = eras_shot(t)
        if t < T_ERAS + .3:
            fr = Image.blend(Image.new('RGB', fr.size, (255, 230, 170)), fr, (t - T_ERAS) / .3)
        lab = 'I7 two different eras'
    if T_ONE <= t < T_P1:
        fr = fairy_fx.draw(fr, menu_cursor(t), t, size=.04)
    elif T_WISH + .2 <= t < T_TF:
        fr = fairy_fx.draw(fr, wish_cursor(), t, size=.04)
    elif t < T_ONE:
        fr = fairy_fx.draw(fr, [(T0, .5, .45), (T_ONE, .27, (H * .2 + 134) / H)], t, size=.045)
    if hud_a > 0:
        fr = hud.draw(fr, hearts=HEARTS, t=t, alpha=hud_a)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 15 TWO AUDIENCES · {lab} · BLOCK I v1 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('i1', T_ONE + .6), ('i2', T_TWO + .9), ('i3', T_ALL + .3), ('i4', T_OC + 1.0), ('i5', T_SWORD + .5), ('i6', T_BAD + .2),
          ('i7a', T_COU + .4), ('i7b', T_TWOERAS + .5))


def main():
    out = ROOT / 'docs/ep002/EP002_blockI_animatic_v1.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockI_v1_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockI_v1_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
