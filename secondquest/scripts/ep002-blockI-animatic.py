#!/usr/bin/env python3
"""EP002 animatic, block I (planning only): l64 "This remake is not really being made for one audience." ->
l70 "...Link's journey spans Hyrule across two different eras." (Act 3 opens; block J starts on l71 "Player two?").

Told as the game's own menus (Navi is the menu cursor, as on the classic file select):
  I1  "This remake is not really being made for one audience."  Block H's last shot continues (today's Hyrule, the
                                                        rider gone into the distance); on "one" the field dims to the
                                                        classic file select: FILE 1 · VETERAN PLAYER (100%), Navi on it.
  I2  "It is being made for two."                       Navi moves to FILE 2 · NEW PLAYER (NEW GAME); on "two" it confirms:
                                                        two cards: VETERAN PLAYER = Quest, NEW PLAYER = Pixie. (Zelda is
                                                        single-player: two kinds of player, not two players at once.)
  I3  "Player one already knows everything."            Player 2 steps back; Player 1's save file opens: 20 hearts,
                                                        999:59 played, three item slots full, 100% COMPLETE.
  I4  "They know what that ocarina means."              The ocarina leaves its slot, big, turning, with notes.
  I5  "...what happens when Link pulls the Master Sword."  The sword rises from its pedestal; on "Sword" a white flash
                                                        and the game's text: SEVEN YEARS LATER...
  I6  "They see three golden triangles ... a very bad decision."  The golden triangles glow; a "!" over the veteran;
                                                        a hooded shadow with red eyes rises behind them and reaches for
                                                        them; the veteran: "NO, NO, NO!"; a red pulse on "bad decision".
  I7  "The Triforce represents wisdom, power and courage, and Link's journey spans Hyrule across two different eras."
                                                        Our three plates part and name themselves (Wisdom, Power,
                                                        Courage); then Hyrule splits into its two eras: CHILD (bright)
                                                        and ADULT (dark), seven years apart.
Final art (v6): veteran Quest in his tunic #1 (scared #2 when the shadow grabs the Triforce); the waiting NEW PLAYER
alternates impatient Pixie #2a / #2b (her normal hoodie: she has not been picked yet); the sword rises from the temple
pedestal of plate #13 (our own 3D sword v2 in its slot); CHILD | ADULT eras: young Quest #3, adult Quest #4 (shield and
sword already on his back); I1's rider fading at the castle is block H's #5b. Cards size people by face width (Pixie's
face = 0.9 x Quest's). The villain is final art #8 (hooded), graded to a shadow with glowing eyes and gem.
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
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, cutout, final, final_plate, subtitle, tag, F  # noqa
import fairy as fairy_fx  # noqa
import hud  # noqa: in-game HUD in Hyrule shots (Producer)
import ui_kit as UI  # noqa: the approved on-screen text style (2026-10-06)

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
P1 = final('quest_veteran')                                             # final #1: veteran Quest in his tunic, confident
P1_SCARED = final('quest_scared')                                      # final #2: tunic Quest, scared, as the shadow grabs them
P2 = cutout('pixie:wave_happy')                                        # Pixie v1 library, her normal hoodie (not picked yet)
P2_WAIT = (final('pixie_impatient'), final('pixie_bored'))             # final #2a arms crossed / #2b imaginary watch, yawn
# face width (cheek to cheek, ears out) as a fraction of each cut-out's height, measured on the art: the cards size people
# by face so the scared pose (hunched) matches the confident one, and Pixie's face = 0.9 x Quest's (Producer rule)
FACE = {id(P1): .123, id(P1_SCARED): .112, id(P2): .135}
CARD_FACE, PIXIE_RATIO = 37, .9                                        # Quest's face width in the 300x400 cards (px)
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


def panel(w, h, alpha=1.0, outline=None):
    """Our game text box (approved style, family A); a coloured outline tints its rule (a highlight)."""
    g = UI.sq_box(w, h, r=16, pad=4, rule=outline[:3] if outline else UI.GOLD)
    if alpha < 1:
        g.putalpha(g.getchannel('A').point(lambda v: int(v * alpha)))
    return g


SEVEN_YEARS = UI.area_title('SEVEN YEARS LATER...', size=40, band=True)
AREA_CHILD = UI.area_title('CHILD', size=36)
AREA_ADULT = UI.area_title('ADULT', size=36)
TAG_7Y = UI.sq_tag('7 YEARS', 22)


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
    if k < 1:                                                           # block H's last frame: the rider (#5b) near the castle
        fr = HB.ride(fr, t, 1.0, (1.25, .5, .6), alpha=1 - k)
    return fr


def players_menu(fr, t):
    """The classic file select (a single-player game, two kinds of player): FILE 1 · VETERAN PLAYER (100%) and
    FILE 2 · NEW PLAYER (NEW GAME). Navi is the cursor; on "two" it moves to FILE 2 and confirms."""
    a = min(1, (t - T_ONE) / .3) * (1 - min(1, max(0, (t - T_TWO - .3) / .25)))
    if a <= 0:
        return fr
    pw, ph = 640, 300
    g = panel(pw, ph, a); d = ImageDraw.Draw(g)
    ctext(d, pw / 2 + 4, 24, 'SELECT A FILE', 30, GOLD[:3] + (int(255 * a),))
    sel2 = t >= T_TWO - .25
    flash = max(0, 1 - (t - T_TWO) / .3) if t >= T_TWO else 0
    for i in range(2):
        on = (i == 1) == sel2
        y = 86 + i * 100
        box = (40, y, pw - 32, y + 84)
        d.rounded_rectangle(box, 12, fill=(255, 255, 255, int((26 + (150 * flash if on else 0)) * a)) if on else (30, 36, 80, int(200 * a)),
                            outline=(235, 235, 250, int((255 if on else 120) * a)), width=3)
        col = (255, 255, 255, int(255 * a)) if on else (170, 175, 200, int(255 * a))
        if i == 0:
            d.text((60, y + 10), 'FILE 1 · VETERAN PLAYER', font=F(26), fill=col)
            for h_ in range(10):
                hud._heart(d, 70 + h_ * 22, y + 58, 8, (232, 44, 52, int(255 * a)))
            d.text((pw - 140, y + 42), '100%', font=F(28), fill=(90, 220, 120, int(255 * a)))
        else:
            d.text((60, y + 10), 'FILE 2 · NEW PLAYER', font=F(26), fill=col)
            d.text((60, y + 46), 'NEW GAME', font=F(24), fill=(120, 200, 255, int(255 * a)))
    return comp(fr, g, W * .5 - pw / 2 - 4, H * .17)


def menu_cursor(t):
    """Navi as the file-select cursor, left of the highlighted file, as on the classic screen."""
    y1, y2 = (H * .17 + 86 + 42) / H, (H * .17 + 186 + 42) / H
    x = (W * .5 - 320 - 34) / W
    return [(T_ONE, x, y1), (T_TWOL + .3, x, y1), (T_TWO - .2, x, y2), (T_TWO + .5, x, y2)]


# ------------------------------------------------------------------ I2-I3: the player cards, Player 1's save file
def card(who, label, col, w=300, h=400, alpha=1.0, dim=0.0, pixie=None, missing=None):
    g = panel(w, h, alpha, outline=col + (255,)); d = ImageDraw.Draw(g)
    ctext(d, w / 2 + 4, 20, label, 24, col + (int(255 * alpha),))
    if pixie is None:
        pixie = who is P2
    ph = int(CARD_FACE * (PIXIE_RATIO if pixie else 1.0) / FACE[id(who)])   # sized by face width
    im = sized(who, ph)
    if dim:
        im = Image.blend(im.convert('RGB'), Image.new('RGB', im.size, (10, 14, 48)), .6 * dim).convert('RGBA'); im.putalpha(sized(who, ph).getchannel('A'))
    g.alpha_composite(fade(im, alpha), (int(w / 2 + 4 - im.width / 2), int(h - 8 - im.height)))
    if missing:
        lab = missing
        f = F(12); tw = d.textlength(lab, font=f)
        d.rectangle((w / 2 + 4 - tw / 2 - 6, h - 26, w / 2 + 4 + tw / 2 + 6, h - 8), fill=(150, 20, 30, int(230 * alpha)))
        d.text((w / 2 + 4 - tw / 2, h - 24), lab, font=f, fill=(255, 235, 235, int(255 * alpha)))
    return g


SLOT_X = [690, 830, 970]                                                 # the three item slots of the save file (screen x)
SLOT_Y = 330


def save_file(fr, t, a):
    """Player 1's file: 20 hearts, time played, the three items, 100% COMPLETE."""
    g = panel(560, 410, a); d = ImageDraw.Draw(g)
    d.text((30, 20), 'FILE 1 · VETERAN PLAYER', font=F(28), fill=GOLD[:3] + (int(255 * a),))
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
    who = P1_SCARED if T_WISH + .2 <= t < T_TF else P1               # the shadow appears: he is scared
    c = card(who, 'VETERAN PLAYER', (232, 196, 90), alpha=a)
    fr = comp(fr, c, W * .07, H * .12)
    if alert > 0:                                                       # "!" over Player 1: he knows what comes next
        d = ImageDraw.Draw(fr)
        s = int(70 + 20 * math.sin(math.pi * min(1, alert)))
        d.text((W * .07 + 262, H * .12 + 52), '!', font=F(s), fill=(255, 80, 70), stroke_width=5, stroke_fill=(20, 14, 18))
    return fr


def waiting_card(fr, t):
    """The NEW PLAYER waits her turn, small and dim, top right (free while the HUD is hidden in the menus)."""
    a = ease(min(1, max(0, (t - T_P1 - .3) / .5))) * (1 - ease(min(1, max(0, (t - T_TF + .3) / .3))))
    if a <= 0:
        return fr
    w, h = 112, 172
    g = panel(w, h, a, outline=(120, 200, 255, 200)); d = ImageDraw.Draw(g)
    ctext(d, w / 2 + 4, 10, 'NEW PLAYER', 13, (120, 200, 255, int(255 * a)))
    ph = int(t / .7) % 2                                               # two poses alternate: she is impatient, not frozen
    im = sized(P2_WAIT[ph], h - 40)
    bob = abs(math.sin(t * 9)) * 3 if ph == 0 else 0                  # a foot tap
    sway = math.sin(t * 3) * 2 if ph == 1 else 0
    dim = Image.blend(im.convert('RGB'), Image.new('RGB', im.size, (10, 14, 48)), .35).convert('RGBA'); dim.putalpha(im.getchannel('A'))
    g.alpha_composite(fade(dim, a), (int(w / 2 + 4 - im.width / 2 + sway), int(h - 4 - im.height - bob)))
    return comp(fr, g, W - 64 - w - 8, 44)


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


STAGE = (int(W * .5 - 120), int(H * .1), int(W * .5 + 448), int(H * .1) + 418)   # the save file's panel (screen px)
SLOT = (960, 395)                                                        # the empty slot on top of the pedestal in plate #13 (plate px)
SLOT_SCR = (804, 330)                                                    # where that slot sits on screen (1:1 crop of the plate)
_tx, _ty = SLOT[0] - (SLOT_SCR[0] - STAGE[0]), SLOT[1] - (SLOT_SCR[1] - STAGE[1])
TEMPLE_PLATE = final_plate('temple')
TEMPLE = TEMPLE_PLATE.crop((_tx, _ty, _tx + STAGE[2] - STAGE[0], _ty + STAGE[3] - STAGE[1])).convert('RGBA')   # final #13
_m = Image.new('L', TEMPLE.size, 0); ImageDraw.Draw(_m).rounded_rectangle((0, 0, TEMPLE.width - 1, TEMPLE.height - 1), 18, fill=255)
TEMPLE.putalpha(_m)
SWORD_H = 270                                                            # ~1.8 x the pedestal top's width: a real sword in that stone


def stage_sword(fr, t, k):
    """The sword in its pedestal: the temple of plate #13 opens in the save file's panel; our 3D sword (v2) stands in
    the pedestal's empty slot and rises on "pulls"."""
    cx, base_y = SLOT_SCR
    z = 1 + .24 * ease(min(1, max(0, (t - T_SW - .3) / max(.5, T_PULL - T_SW - .3))))   # Producer improvement 2: a slow push into the temple
    if z > 1.001:                                                       # the slot stays put on screen, the hall grows around it
        pw_, ph_ = (STAGE[2] - STAGE[0]) / z, (STAGE[3] - STAGE[1]) / z
        x0 = SLOT[0] - (SLOT_SCR[0] - STAGE[0]) / z; y0 = SLOT[1] - (SLOT_SCR[1] - STAGE[1]) / z
        tp = TEMPLE_PLATE.crop((int(x0), int(y0), int(x0 + pw_), int(y0 + ph_))).resize(TEMPLE.size, Image.BICUBIC).convert('RGBA')
        tp.putalpha(TEMPLE.getchannel('A'))
    else:
        tp = TEMPLE
    fr = comp(fr, fade(tp, k), STAGE[0], STAGE[1])
    d = ImageDraw.Draw(fr, 'RGBA')
    d.rounded_rectangle(STAGE, 18, outline=(235, 235, 250, int(255 * k)), width=3)
    rise = ease(min(1, max(0, (t - T_PULL) / (T_SWORD - T_PULL + .2))))
    sw = SWD[12].transpose(Image.ROTATE_180)                            # hilt up, the blade down into the stone
    s = sized(sw, SWORD_H * z)
    fr = CART.glow(fr, cx, base_y - 110 * z - 60 * rise, int(200 * k) + 1, (190, 220, 255), .3 * k + .3 * rise)
    y = base_y - s.height * (.55 + .4 * rise)
    clip = Image.new('L', s.size, 0); ImageDraw.Draw(clip).rectangle((0, 0, s.width, int(base_y - y)), fill=255)   # the blade is inside the stone
    m = Image.fromarray(np.minimum(np.asarray(s.getchannel('A')), np.asarray(clip))); s2 = s.copy(); s2.putalpha(m)
    fr = comp(fr, fade(s2, k), cx - s.width / 2, y)
    if t >= T_SWORD:                                                    # white flash, then SEVEN YEARS LATER...
        f = max(0, 1 - (t - T_SWORD) / .5)
        if f > 0:
            fr = Image.blend(fr, Image.new('RGB', fr.size, (255, 255, 255)), .85 * f)
        ka = min(1, max(0, (t - T_SWORD - .2) / .3)) * (1 - min(1, max(0, (t - T_TRI - .3) / .3)))
        if ka > 0:
            g = fade(SEVEN_YEARS, ka)                                     # a game's time card (area title style)
            fr = comp(fr, g, cx - g.width / 2, 70)
    return fr


T_REACH = T('l69.w14')                  # "make": the hand reaches for the triangles


VILLAIN = final('villain_hooded')                                       # final art #8: the villain, hooded, claw reaching left
VILLAIN_HAND = (.137, .30)                                              # his open claw (fractions of the cut-out)


def _villain_shade():
    """The villain as a shadow out of the dark: graded deep violet-black, only his eyes and the forehead gem keep
    their glow (the brightest red/amber pixels)."""
    a = np.asarray(VILLAIN).astype(np.float32)
    rgb = a[..., :3]
    mx = rgb.max(2); mn = rgb.min(2)
    glow = (rgb[..., 0] > 150) & (mx - mn > 90)                         # the red eyes and the amber gem
    dark = rgb * .42 + np.array([14, 4, 22], np.float32)
    out = np.where(glow[..., None], rgb, dark)
    return Image.fromarray(np.dstack([out, a[..., 3]]).clip(0, 255).astype(np.uint8), 'RGBA')


VILLAIN_SHADE = _villain_shade()


def villain_shadow(t):
    """The villain (#8, final art) rising behind the triangles as a shadow, red eyes glowing."""
    kv = ease(min(1, max(0, (t - T_WISH + .2) / .8)))
    if kv <= 0:
        return None, kv
    return VILLAIN_SHADE, kv


def shadow_hand(curl=0.0):
    """A clawed hand of shadow, pointing left, wrist at the canvas centre (220, 180): palm, four two-joint fingers
    with claws, a thumb; a faint purple rim so it reads against the dark. curl 0 = open, reaching; 1 = gripping."""
    g = Image.new('RGBA', (440, 360)); d = ImageDraw.Draw(g)
    dark, rim = (26, 10, 34, 245), (110, 50, 140, 220)

    def limb(pts, w0, w1, col):
        for (xa, ya), (xb, yb), k in zip(pts, pts[1:], range(len(pts))):
            wa = lin(w0, w1, k / (len(pts) - 1)); wb = lin(w0, w1, (k + 1) / (len(pts) - 1))
            n = 8
            for i in range(n + 1):
                u = i / n; x = lin(xa, xb, u); y = lin(ya, yb, u); r = lin(wa, wb, u) / 2
                d.ellipse((x - r, y - r, x + r, y + r), fill=col)

    def hand(col, dx=0, dy=0):
        palm = [(222 + dx, 150 + dy), (222 + dx, 212 + dy), (160 + dx, 222 + dy), (138 + dx, 186 + dy), (158 + dx, 146 + dy)]
        d.polygon(palm, fill=col)
        for j, fy in enumerate((148, 168, 188, 208)):                                   # four fingers fanned out, two joints and a claw
            sp = (-30, -10, 10, 30)[j] * (1 - curl)
            base = (154 + dx, fy + dy)
            k1 = (lin(108, 124, curl) + dx + j * 4, fy + sp * .45 + lin(0, 14, curl) + dy)
            k2 = (lin(68, 110, curl) + dx + j * 4, fy + sp * .85 + lin(0, 50, curl) + dy)
            tip = (lin(40, 132, curl) + dx + j * 4, fy + sp + lin(4, 70, curl) + dy)
            limb([base, k1, k2, tip], 21 - j * 1.5, 5, col)
        limb([(186 + dx, 216 + dy), (158 + dx, 246 + dy), (lin(126, 150, curl) + dx, lin(262, 252, curl) + dy)], 18, 7, col)   # thumb

    hand(rim, -2, -3)
    hand(dark)
    return g


def sleeve_and_hand(fr, shoulder, wrist, curl):
    """The cloak's sleeve, widening from the wrist to the shoulder, and the clawed hand at its end."""
    (x0, y0), (wx, wy) = shoulder, wrist
    ang = math.atan2(wy - y0, wx - x0)                                                  # arm direction
    nx, ny = -math.sin(ang), math.cos(ang)
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    d.polygon([(x0 + nx * 46, y0 + ny * 46), (x0 - nx * 46, y0 - ny * 46), (wx - nx * 26, wy - ny * 26), (wx + nx * 26, wy + ny * 26)],
              fill=(22, 8, 30, 240))
    d.ellipse((wx - 30, wy - 30, wx + 30, wy + 30), fill=(22, 8, 30, 240))           # the cuff
    fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(1.2))).convert('RGB')
    h = shadow_hand(curl).rotate(-math.degrees(ang) + 180, resample=Image.BICUBIC)   # canvas points left: turn it along the arm
    h = h.resize((int(h.width * .8), int(h.height * .8)), Image.LANCZOS)
    return comp(fr, h, wx - h.width / 2, wy - h.height / 2)


def stage_triforce(fr, t, k):
    cx, cy = 830, 235
    shadow, kv = villain_shadow(t)
    s = sized(TRI_ICON, lin(84, 230, k))
    pulse = .5 + .5 * math.sin(t * 6)
    kr = ease(min(1, max(0, (t - T_REACH + .3) / .8))) * k if shadow is not None else 0
    if shadow is not None:                                              # he rises behind them out of the dark, then leans in
        vh = int(480 * (1 + .1 * kr))
        v = fade(sized(shadow, vh), k * kv)
        hx, hy = cx + lin(110, 30, kr), cy + 10                         # where his open claw goes: over the triangles on "reach"
        vx = hx - VILLAIN_HAND[0] * v.width; vy = hy - VILLAIN_HAND[1] * v.height + (1 - kv) * 300
        fr = CART.glow(fr, vx + v.width * .55, vy + v.height * .35, 320, (120, 30, 140), .35 * kv * k)
        fr = comp(fr, v, vx, vy)
    fr = CART.glow(fr, cx, cy, int(260 * k) + 1, (255, 214, 120), (.35 + .15 * pulse) * k)
    if t >= T('l69.w18'):                                               # "decision": caught in his claw, the gold dims
        kd = ease(min(1, (t - T('l69.w18')) / .35))
        s = Image.blend(s, Image.new('RGBA', s.size, (90, 30, 60, 0)), .0) if kd <= 0 else s
        sd = np.asarray(s).astype(np.float32); sd[..., :3] *= 1 - .35 * kd; s = Image.fromarray(sd.astype(np.uint8), 'RGBA')
    fr = comp(fr, fade(s, k), cx - s.width / 2, cy - s.height / 2)
    if shadow is not None and kr > .4:                                  # his claw comes over them (the hand drawn once more, on top)
        m = Image.new('L', v.size, 0)                                   # a soft oval around the claw only
        hcx, hcy = VILLAIN_HAND[0] * v.width, VILLAIN_HAND[1] * v.height
        ImageDraw.Draw(m).ellipse((hcx - v.width * .16, hcy - v.height * .12, hcx + v.width * .2, hcy + v.height * .12), fill=255)
        m = m.filter(ImageFilter.GaussianBlur(10))
        hand = v.copy(); hand.putalpha(Image.fromarray((np.asarray(v.getchannel('A')).astype(np.float32) * np.asarray(m) / 255).astype(np.uint8)))
        fr = comp(fr, fade(hand, min(1, (kr - .4) / .3)), vx, vy)
    if t >= T_BAD:                                                      # the very bad decision: a red pulse
        r = max(0, 1 - (t - T('l69.w18')) / .6) if t >= T('l69.w18') else .4
        fr = Image.blend(fr, Image.new('RGB', fr.size, (160, 10, 20)), .35 * r)
    return fr


def no_bubble(fr, t):
    """The veteran sees it coming: "NO, NO, NO!" """
    if not (T_WISH + .3 <= t < T_TF):
        return fr
    a = min(1, (t - T_WISH - .3) / .2)
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    x0, y0, x1, y1 = 300, 46, 512, 104
    d.polygon([(x0 + 20, y1 - 4), (x0 + 52, y1 - 4), (262, 150)], fill=(255, 255, 255, int(250 * a)), outline=INK)
    d.rounded_rectangle((x0, y0, x1, y1), 20, fill=(255, 255, 255, int(250 * a)), outline=INK, width=3)
    d.polygon([(x0 + 22, y1 - 2), (x0 + 50, y1 - 2), (x0 + 36, y1 + 4)], fill=(255, 255, 255, int(250 * a)))
    jit = 2 * math.sin(t * 40)
    ctext(d, (x0 + x1) / 2 + jit, y0 + 12, 'NO, NO, NO!', 28, (200, 30, 40, int(255 * a)))
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


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
    cam = (1.5, .6, .6)                                                 # each half shows the road and the castle (#11) of the same place
    child = G.new_look(crop(G.FIELD, cam))
    adult = crop(G.FIELD, cam)
    a = np.asarray(adult).astype(np.float32)
    yy = np.mgrid[0:H, 0:W][0][..., None] / H
    a = a * .45 + np.array([40, 20, 40]) * .55
    sky = np.clip((.48 - yy) / .12, 0, 1)                               # feathered: no hard line across the detailed plate
    a = a * (1 - sky * .5) + np.array([150, 40, 50]) * sky * .5 * (1 - yy / .48)    # a red, stormy sky
    adult = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    yq = sized(final('quest_young_back'), H * .30)                      # final #3: young Quest from behind
    aq = sized(final('quest_adult_back'), H * .42)                      # final #4: adult, shield and sword on his back (Producer rule)
    child = comp(child, yq, W * .43 - yq.width / 2, H * .92 - yq.height)    # on the road
    adult = comp(adult, aq, W * .43 - aq.width / 2, H * .92 - aq.height)
    fr = Image.new('RGB', (W, H), (10, 10, 20))
    half = int(W / 2)
    sl = lin(W, half, k)                                                 # the dark era slides in from the right
    fr.paste(child.crop((W // 4, 0, W // 4 + half, H)), (0, 0))
    fr.paste(adult.crop((W // 4, 0, W // 4 + half, H)), (int(sl), 0))
    d = ImageDraw.Draw(fr)
    d.line((sl, 0, sl, H), fill=(255, 255, 255), width=4)
    for cx, g in ((W * .25, AREA_CHILD), (W * .75, AREA_ADULT)):          # each era's title card (approved style)
        fr = comp(fr, g, cx - g.width / 2, H * .09)
    if t >= T_TWOERAS - .1:                                              # seven years between them
        ka = min(1, (t - T_TWOERAS + .1) / .3)
        g = fade(TAG_7Y, ka)
        fr = comp(fr, g, W / 2 - g.width / 2, H * .3)
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
            c1 = card(P1, 'VETERAN PLAYER', (232, 196, 90), alpha=kc)
            c2 = card(P2, 'NEW PLAYER', (120, 200, 255), alpha=kc)
            fr = comp(fr, c1, W * .5 - 330 - 40 * (1 - kc), H * .12)
            fr = comp(fr, c2, W * .5 + 22 + 40 * (1 - kc), H * .12)
        lab = 'I1-I2 how many players? two'
    elif t < T_TF:                                                      # I3-I6: Player 1's save file and the items
        fr = MENU_BG.copy()
        kc = ease(min(1, (t - T_P1) / .45))
        if kc < 1:                                                      # Player 2 steps back, out to the right
            c2 = card(P2, 'NEW PLAYER', (120, 200, 255), alpha=1 - kc, dim=kc)
            fr = comp(fr, c2, W * .5 + 22 + 300 * kc, H * .12)
        x1 = lin(W * .5 - 330, W * .07, kc)
        alert = min(1, max(0, (t - T_KNOW) / .3)) if T_KNOW <= t < T_WISH + .3 else 0   # then the "NO, NO, NO!" takes over
        fr = comp(fr, card(P1, 'VETERAN PLAYER', (232, 196, 90)), x1, H * .12) if kc < 1 else p1_portrait(fr, t, 1, alert)
        fa = ease(min(1, max(0, (t - T_P1 - .25) / .4)))
        if fa > 0:
            fr = save_file(fr, t, fa)
            fr, big = slot_items(fr, t, fa)
            if big:
                i, im, k = big
                veil = Image.new('RGBA', (W, H)); ImageDraw.Draw(veil).rounded_rectangle((W * .5 - 120, H * .1, W * .5 + 448, H * .1 + 418), 18, fill=(8, 10, 30, int(170 * k)))
                fr = Image.alpha_composite(fr.convert('RGBA'), veil).convert('RGB')
                fr = (stage_ocarina, stage_sword, stage_triforce)[i](fr, t, k)
            fr = no_bubble(fr, t)
        fr = waiting_card(fr, t)
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
    elif t < T_ONE:
        fr = fairy_fx.draw(fr, [(T0, .5, .45), (T_ONE, menu_cursor(t)[0][1], menu_cursor(t)[0][2])], t, size=.045)
    if hud_a > 0:
        fr = hud.draw(fr, hearts=HEARTS, t=t, alpha=hud_a)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 15 TWO AUDIENCES · {lab} · BLOCK I v12 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('i1', T_ONE + .6), ('i2', T_TWO + .9), ('i3', T_ALL + .3), ('i4', T_OC + 1.0), ('i5', T_SWORD + .5), ('i6', T_BAD + .2),
          ('i7a', T_COU + .4), ('i7b', T_TWOERAS + .5))


def main():
    out = ROOT / 'docs/ep002/EP002_blockI_animatic_v12.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockI_v12_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockI_v12_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
