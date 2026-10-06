#!/usr/bin/env python3
"""EP002 animatic, block H (planning only): l59 "But every improvement quietly changes the memory attached to it." ->
l62 "...without making people wonder where their game went." (end of Act 2, plus the pause before Act 3).

All in Hyrule, so the in-game HUD stays on (hearts 2.5 from blocks F/G). The camera continues block G's last framing.
  H1  "But every improvement quietly changes the memory attached to it."  The "Saturday, 1998" polaroid from block F
                                                        floats back in. Upgrades (HD, our camera icon, a note, a voice)
                                                        drift quietly into it one by one: each one cools and sharpens the
                                                        photo a little, and the handwritten date fades.
  H2  "That is the impossible job."                     A game-style message box types out: NEW QUEST / The Impossible Job.
  H3  "Make it different enough to justify existing..." A balance slider (FAMILIAR <-> DIFFERENT, our ocarina as the
                                                        knob) slides to DIFFERENT and Hyrule restyles with it.
  H4  "...without making people wonder where their game went."  Night, Quest's grown-up bedroom (final plate #15; the
                                                        v7 childhood bedroom of block C stays available with H4_ROOM=child):
                                                        our 3D CRT on the empty bedside table plays 1998 Hyrule (chunky
                                                        pixels, pixel hearts); Quest, grown up, sits on the floor in profile
                                                        (new art Q008). The camera eases in to the TV. On "where" it switches
                                                        off; in the dark glass his reflection, pensive (final #10, mirrored);
                                                        black. Out of the black, today's Hyrule: Quest rides away on his own
                                                        chestnut horse (final #5b, from behind, trotting) towards the castle,
                                                        under l63.
Final art (v8): field #11 (via block G), young Quest walking #3/#3 mirrored, room #15, reflection #10, rider #5b.
Nothing MISSING left in this block.
Sounds: Bram only. Framing QC before sending.
"""
import colorsys, importlib.util, math, os, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, final, final_plate, cam_box, to_screen, subtitle, tag, F, SHIELD_SWAY, STEP_RATE  # noqa
import fairy as fairy_fx  # noqa
import hud  # noqa: in-game HUD in every Hyrule shot (Producer)
from icons import camera_icon  # noqa: the episode's game-camera icon

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


G = load('blockG', 'scripts/ep002-blockG-animatic.py')           # field, looks, Quest, the camera G ends on
FB = load('blockF_B', 'scripts/ep002-blockF-B-animatic.py')      # the "Saturday, 1998" polaroid
CART = G.CART
comp, sized, crop = G.comp, G.sized, G.crop

T0 = T('l59') - 0.05
T_JOB = T('l60') - .05
T_DIFF = T('l61') - .05
T_WONDER = T('l62') - .05
T_END = T('l64') - 0.05                # the gallop runs under l63 "And Nintendo has another problem."; block I starts on l64
HEARTS = 2.5                           # carried over from blocks F and G
UPGRADES = [('hd', T('l59.w3')), ('camera', T('l59.w4')), ('note', T('l59.w5')), ('voice', T('l59.w7'))]
FLY = .55
INK = (20, 14, 18, 255)


# ------------------------------------------------------------------ the polaroid that changes quietly
POLA_OLD = FB.POLA_IMG
_new = ImageEnhance.Sharpness(ImageEnhance.Contrast(ImageEnhance.Color(POLA_OLD).enhance(1.7)).enhance(1.3)).enhance(2.5)
POLA_NEW = Image.blend(_new, Image.new('RGB', _new.size, (150, 200, 255)), .12)          # the warm afternoon goes cool and crisp


def changes(t):
    """How many upgrades have landed in the photo (fractional while one is settling)."""
    return sum(min(1, max(0, (t - (ti + FLY)) / .5)) for _, ti in UPGRADES)


def polaroid(t):
    c = changes(t) / len(UPGRADES)
    img = Image.blend(POLA_OLD, POLA_NEW, c)
    card = Image.new('RGBA', (img.width + 20, img.height + 46), (250, 246, 236, 255)); card.paste(img, (10, 10))
    d = ImageDraw.Draw(card)
    d.text((12, img.height + 16), FB.POLA_CAP, font=F(18), fill=(70, 55, 40, int(255 * (1 - .8 * c))))   # the date fades
    return card


POLA_REST = (W * .07, H * .22)
POLA_SCALE = 1.05


def pola_center():
    w, h = (POLA_OLD.width + 20) * POLA_SCALE, (POLA_OLD.height + 46) * POLA_SCALE
    return POLA_REST[0] + w / 2, POLA_REST[1] + h * .42


def chip(kind):
    if kind == 'camera':
        return camera_icon(rec=True, width=70)
    g = Image.new('RGBA', (80, 56)); d = ImageDraw.Draw(g)
    if kind == 'hd':
        d.rounded_rectangle((4, 6, 76, 50), 10, fill=(30, 36, 60, 240), outline=INK, width=3)
        d.text((16, 10), 'HD', font=F(30), fill=(150, 220, 255, 255))
    elif kind == 'note':
        d.ellipse((12, 4, 68, 52), fill=(232, 196, 90, 240), outline=INK, width=3)
        d.text((26, 6), '♪', font=F(36), fill=(255, 255, 255, 255), stroke_width=2, stroke_fill=(70, 45, 15))
    else:                                                               # voice: a little bubble with a waveform
        d.rounded_rectangle((4, 6, 76, 46), 14, fill=(250, 250, 250, 245), outline=INK, width=3)
        d.polygon([(18, 44), (14, 54), (28, 45)], fill=(250, 250, 250, 245), outline=INK)
        for j in range(8):
            hh = 6 + 18 * abs(math.sin(j * 1.3))
            d.line((16 + j * 7, 26 - hh / 2, 16 + j * 7, 26 + hh / 2), fill=(60, 120, 220, 255), width=4)
    return g


def upgrades_fly(fr, t):
    ex, ey = pola_center()
    for j, (kind, ti) in enumerate(UPGRADES):
        u = (t - ti) / FLY
        if 0 <= u < 1:                                                  # drifts in quietly from the right, shrinking into the photo
            sx, sy = W * (.78 + .03 * j), H * (.42 + .03 * (j % 2))        # from the right, arcing high over the castle
            x = lin(sx, ex, ease(u)); y = lin(sy, ey, ease(u)) - H * .27 * math.sin(math.pi * ease(u))
            g = chip(kind); s = lin(1.3, .35, ease(u))
            g = g.resize((max(1, int(g.width * s)), max(1, int(g.height * s))), Image.LANCZOS)
            if u > .8:
                g.putalpha(g.getchannel('A').point(lambda v: int(v * (1 - u) / .2)))
            fr = comp(fr, g, x - g.width / 2, y - g.height / 2)
        if 1 <= u < 1 + .5 / FLY:                                       # a soft ripple where it lands, no flash
            k = (u - 1) * FLY / .5
            fr = CART.glow(fr, ex, ey, int(60 + 80 * k), (200, 230, 255), .25 * (1 - k))
    return fr


# ------------------------------------------------------------------ H2: the message box
def message_box(fr, t, alpha=1.0):
    bw, bh = 450, 104
    x0, y0 = W * .035, H * .30                                          # where the photo was: left of the castle
    g = Image.new('RGBA', (bw + 8, bh + 8)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((4, 4, bw + 4, bh + 4), 18, fill=(10, 14, 48, 205), outline=(235, 235, 250, 255), width=3)
    d.text((28, 16), 'NEW QUEST', font=F(18), fill=(232, 196, 90, 255))
    full = 'The Impossible Job'
    n = int(len(full) * min(1, max(0, (t - T_JOB - .15) / (T('l60.w5') + .25 - T_JOB - .15))))   # types out like the game's text
    d.text((28, 44), full[:n], font=F(36), fill=(255, 255, 255, 255))
    if n == len(full) and int(t * 3) % 2 == 0:                          # the blinking "next" arrow
        d.polygon([(bw - 30, bh - 22), (bw - 10, bh - 22), (bw - 20, bh - 8)], fill=(90, 220, 120, 255))
    if alpha < 1:
        g.putalpha(g.getchannel('A').point(lambda v: int(v * alpha)))
    return comp(fr, g, x0, y0)


# ------------------------------------------------------------------ H3-H4: the balance slider
SWEET = .05                                                             # half-width of the green sweet spot


def knob_at(t):
    if t < T('l61.w3'):
        return .5
    if t < T_WONDER:                                                    # "different enough to justify existing"
        return lin(.5, .88, ease(min(1, (t - T('l61.w3')) / (T('l61.w7') - T('l61.w3')))))
    u = t - T_WONDER                                                    # "without..." swings back, wobbles around the middle
    return .5 + .38 * math.exp(-u * .9) * math.cos(u * 3.4)


def slider(fr, t, y, alpha):
    if alpha <= 0:
        return fr
    x0, x1 = W * .34, W * .63
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((x0 - 14, y - 46, x1 + 14, y + 26), 16, fill=(10, 14, 48, 175), outline=(235, 235, 250, 200), width=2)
    d.rounded_rectangle((x0, y - 6, x1, y + 6), 6, fill=(30, 30, 40, 255), outline=INK, width=2)
    for i in range(40):                                                 # amber (familiar) -> cyan (different)
        k = i / 39; c = tuple(int(lin(a, b, k)) for a, b in zip((240, 170, 80), (90, 210, 250)))
        d.rectangle((lin(x0 + 3, x1 - 3, k), y - 3, lin(x0 + 3, x1 - 3, k) + (x1 - x0) / 40, y + 3), fill=c + (255,))
    sx0, sx1 = lin(x0, x1, .5 - SWEET), lin(x0, x1, .5 + SWEET)
    d.rounded_rectangle((sx0, y - 9, sx1, y + 9), 5, outline=(90, 230, 120, 255), width=3)    # the narrow sweet spot
    p = knob_at(t)
    hot = min(1, max(0, (p - .6) / .25))
    d.text((x0, y - 38), 'FAMILIAR', font=F(18), fill=(240, 190, 110, 255))
    tw = d.textlength('DIFFERENT', font=F(18))
    d.text((x1 - tw, y - 38), 'DIFFERENT', font=F(18), fill=tuple(int(lin(a, b, hot)) for a, b in zip((140, 200, 230), (200, 245, 255))) + (255,))
    if alpha < 1:
        g.putalpha(g.getchannel('A').point(lambda v: int(v * alpha)))
    fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    o = hud._icon('ocarina', 46)                                        # our ocarina is the knob: the game itself on the scale
    if alpha < 1:
        o = o.copy(); o.putalpha(o.getchannel('A').point(lambda v: int(v * alpha)))
    kx = lin(x0, x1, p)
    if abs(p - .5) < SWEET:
        fr = CART.glow(fr, kx, y, 40, (120, 255, 150), .35 * alpha)
    return comp(fr, o, kx - o.width / 2, y - o.height / 2)


def restyle_v1(fr, e):
    """v1-v6 'Different': hue + saturation + contrast (read as a colour error; kept for comparison)."""
    if e <= 0:
        return fr
    hsv = np.asarray(fr.convert('HSV')).astype(np.float32)
    hsv[..., 0] = (hsv[..., 0] + 8 * e) % 256
    hsv[..., 1] = np.clip(hsv[..., 1] * (1 + .18 * e), 0, 255)
    out = Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')
    out = ImageEnhance.Contrast(out).enhance(1 + .12 * e)
    return out


_YY = np.mgrid[0:H, 0:W][0] / H


def restyle(fr, e):
    """'Different enough to justify existing': the same Hyrule given a new art direction, the way a remake would:
    a dramatic golden-hour sky, cinematic teal/orange grade, a low sun with light shafts, a soft vignette.
    Same place, same path, same castle; only the look changes."""
    if e <= 0:
        return fr
    a = np.asarray(fr).astype(np.float32)
    R, G_, B = a[..., 0], a[..., 1], a[..., 2]
    skym = ((B > R + 15) & (_YY < .5)).astype(np.float32)                          # only the sky pixels
    skym = np.asarray(Image.fromarray((skym * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32)[..., None] / 255
    top, low = np.array([38, 62, 150]), np.array([255, 168, 96])
    grad = top + (low - top) * (_YY[..., None] / .45).clip(0, 1) ** 1.4           # deep blue above, gold at the horizon
    a = a * (1 - .85 * e * skym) + grad * .85 * e * skym
    L = a.mean(2, keepdims=True) / 255
    a = a + e * (np.array([-16, 2, 22]) * (1 - L) + np.array([30, 12, -20]) * L)   # teal shadows, warm highlights
    a = (a - 128) * (1 + .18 * e) + 128                                            # more contrast
    yy, xx = _YY, np.mgrid[0:H, 0:W][1] / W
    vig = 1 - .35 * e * (((xx - .5) ** 2 + (yy - .5) ** 2) * 1.8)                  # vignette
    a = a * vig[..., None]
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    out = CART.glow(out, W * .80, H * .30, 420, (255, 200, 130), .5 * e)           # a low sun behind the hill
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    for i in range(6):                                                             # light shafts across the field
        a0 = math.radians(150 + i * 8)
        d.polygon([(W * .8, H * .3), (W * .8 + 1700 * math.cos(a0), H * .3 + 1700 * math.sin(a0)),
                   (W * .8 + 1700 * math.cos(a0 + .04), H * .3 + 1700 * math.sin(a0 + .04))], fill=(255, 220, 160, int(40 * e)))
    return Image.alpha_composite(out.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(12))).convert('RGB')


RESTYLE = restyle_v1 if os.environ.get('H3_STYLE') == 'v1' else restyle   # new art direction (Producer approved, 2026-10-04)


def sparkles(fr, t, e):
    if e <= .05:
        return fr
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g); r = np.random.default_rng(4)
    for i in range(26):
        x, y = r.random() * W, H * (.18 + .5 * r.random())
        ph = (t * 1.3 + r.random()) % 1
        s = 4 + 7 * math.sin(math.pi * ph)
        a = int(220 * e * math.sin(math.pi * ph))
        d.line((x - s, y, x + s, y), fill=(255, 255, 255, a), width=2); d.line((x, y - s, x, y + s), fill=(255, 255, 255, a), width=2)
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


def restyle_amount(t):
    return max(0.0, (knob_at(t) - .5) / .38)


# ------------------------------------------------------------------ shots
def back_shot(t):
    """H1-H3: block G's last framing (behind Quest, walking), a slow push in."""
    z = lin(1.25, 1.33, ease((t - T0) / (T_WONDER - T0)))
    walk = 1 + .04 * min(1, max(0, (t - T0) / (T_WONDER - T0))) ** 1.3  # he walks: the road ahead keeps coming (no treadmill)
    base = G.new_look(crop(G.FIELD, (z * walk, .5, .6)))
    hero_h = H * .42 * z / 1.25
    q = sized(G.young(t), hero_h)                                       # walking: the two steps of #3 alternate
    e = restyle_amount(t)
    base = RESTYLE(base, e)
    return comp(base, q, W * .5 - q.width / 2, H * .93 - hero_h + 4 * abs(math.sin(t * STEP_RATE))), e


BC = FB.A.BE.BC                                                         # block C: our 3D CRT, its screen key and the 1998 game picture
T_OFF = T('l62.w5') - .05                                               # "where": the TV switches off
T_REFL = T_OFF + .45                                                    # dark glass: his reflection
T_BLACK = T_REFL + 1.4                                                  # his reflection holds (Producer: longer), then black...
T_NOW = T_BLACK + .25                                                   # ...and today's Hyrule opens, a horse gallops through
RIDER = final('quest_horse_back')                                        # final art #5b: Quest on his chestnut horse, from behind (3D shield baked in)
_qp = Image.open(ROOT / 'docs/art_orders/quest/ep002_tv/results/09_floor_profile_tv_n64pad.png').convert('RGBA')   # our 3D N64 pad in his hands (tools/fx/pad_swap_q008.py)
QPROF = _qp.crop(_qp.getchannel('A').getbbox())                          # new art (Q008): Quest on the floor, profile, facing the TV
REFL = final('quest_profile_think', flip=True)                          # final art #10, pensive, mirrored: his reflection in the glass
REFL = REFL.crop((0, 0, REFL.width, int(REFL.height * .5)))              # head, shoulders and the hand at his chin (no pad)
GAME98 = final_plate('field').convert('RGBA')                            # the 1998 game on the tube: the episode's field (#11)...
_y = final('quest_young_back'); _y = _y.resize((int(_y.width * PH * .22 / _y.height), int(PH * .22)), Image.LANCZOS)
GAME98.alpha_composite(_y, (int(PW * .5 - _y.width / 2), int(PH * .97 - _y.height)))   # ...with the young hero (#3) on the road


def _pixel_heart(d, x, y, s, fill):
    for r, row in enumerate(['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...']):
        for c, ch in enumerate(row):
            if ch == 'X':
                d.rectangle((x + c * s, y + r * s, x + c * s + s - 1, y + r * s + s - 1), fill=fill)


def old_picture(t, size, pan=False):
    """1998 on the tube, unmistakably: chunky pixels, few colours, 4:3, the old pixel hearts, scanlines."""
    w, h = size
    z = 1.35; cw, ch = PW / z, PW / z * .75
    if pan:                                                             # Producer improvement 1 (H only): a slow pan across 1998 Hyrule
        k = ease(min(1, max(0, (t - T_WONDER + .6) / 3.6)))
        x0 = (PW - cw) * (.22 + .5 * k)
    else:                                                               # K, O, P keep their framing (O pins callouts on it)
        x0 = (PW - cw) * (.5 + .1 * math.sin((t - T_WONDER) * .04))
    y0 = (PH - ch) * .62
    im = GAME98.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).convert('RGB')
    small = im.resize((96, 72), Image.BILINEAR).quantize(24).convert('RGB')    # N64-era: low res, a small palette
    d = ImageDraw.Draw(small)
    for i in range(3):
        _pixel_heart(d, 4 + i * 9, 4, 1, (220, 40, 40))
    pic = small.resize((w, h), Image.NEAREST)
    a = np.asarray(pic).astype(np.float32)
    a[::4] *= .72                                                       # scanlines
    a *= .96 + .04 * math.sin(t * 40)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def tv_off(pic, k):
    """The old CRT switch-off: the picture squeezes to a bright line, then a dot, then dark glass."""
    w, h = pic.size
    out = Image.new('RGB', (w, h), (14, 16, 20))
    if k < .45:
        sh = max(2, int(h * (1 - k / .45) ** 2))
        line = pic.resize((w, sh), Image.BILINEAR)
        line = Image.blend(line, Image.new('RGB', line.size, (255, 255, 255)), min(1, k / .3))
        out.paste(line, (0, (h - sh) // 2))
    elif k < .8:
        kk = (k - .45) / .35
        r = max(1, int(w * .5 * (1 - kk) ** 2)); d = ImageDraw.Draw(out)
        d.rectangle((w / 2 - r, h / 2 - 1, w / 2 + r, h / 2 + 1), fill=(255, 255, 255))
        d.ellipse((w / 2 - 5, h / 2 - 5, w / 2 + 5, h / 2 + 5), fill=(255, 255, 255))
    elif k < 1:
        d = ImageDraw.Draw(out); g = int(255 * (1 - (k - .8) / .2))
        d.ellipse((w / 2 - 4, h / 2 - 4, w / 2 + 4, h / 2 + 4), fill=(g, g, g))
    return out


def _night(im, k):
    """Night grade for the bedroom plate: dark, cool; k = how much the TV still lights the room (#15 is already a night
    plate, so it takes a lighter grade than the morning childhood bedroom)."""
    dark = Image.blend(im, Image.new('RGB', im.size, (14, 18, 38)), ROOM['night'] + .18 * (1 - k))
    return dark


def _room(kind):
    """H4's bedroom. 'adult' (v8 default): Quest's grown-up bedroom at night, final plate #15, our 3D CRT on its empty
    bedside table, the N64 on the floor in front of the shelf. 'child' (v7, approved): his childhood bedroom of block C."""
    if kind == 'child':
        return dict(plate=BC.BED.convert('RGB'), tv_pos=BC.TV_POS, tv_scale=BC.TV_SCALE, tvw=BC.tvw,
                    n64=BC.N64_IMG, n64_pos=BC.N64_POS, q=(.47, .985, .50), night=.62, c2z=3.0,
                    c0=(1.35, .63, .615), c1=(1.45, .655, .64))
    box = (.699, .255, .812, .447)                                         # on the bedside table of #15 (top at y .44, x .705-.80)
    tvw = int((box[2] - box[0]) * PW); sc = tvw / BC.CRT_34.width
    n64 = BC.N64_IMG.resize((int(PW * .062), int(BC.N64_IMG.height * PW * .062 / BC.N64_IMG.width)), Image.LANCZOS)
    return dict(plate=final_plate('adult_room'), tv_pos=(int(box[0] * PW), int(box[3] * PH - BC.CRT_34.height * sc)), tv_scale=sc,
                tvw=tvw, n64=n64, n64_pos=(int(PW * .632), int(PH * .705 - n64.height)), q=(.565, .735, .40), night=.30, c2z=4.0,
                c0=(1.62, .625, .47), c1=(1.72, .64, .465))


ROOM = _room(os.environ.get('H4_ROOM', 'adult'))
QSPEC = ROOM['q']                                                        # Quest on the floor, facing the TV (x, feet y, h)
SCR_QUAD = [(ROOM['tv_pos'][0] + x * ROOM['tv_scale'], ROOM['tv_pos'][1] + y * ROOM['tv_scale']) for x, y in BC.Q34]
SCR_C = (sum(p[0] for p in SCR_QUAD) / 4 / PW, sum(p[1] for p in SCR_QUAD) / 4 / PH)   # screen centre (plate fractions)


def room_plate(t, pic):
    """His bedroom at night: the CRT on the bedside table plays `pic`; the N64 on the floor; Quest, grown up, sits on
    the floor in profile, looking at the screen."""
    base = ROOM['plate'].copy().convert('RGBA')
    sc = ROOM['tv_scale']
    tv = BC.CRT_34.resize((ROOM['tvw'], int(BC.CRT_34.height * sc)), Image.LANCZOS)
    qs = [(x * sc, y * sc) for x, y in BC.Q34]
    ms = np.asarray(Image.fromarray((BC.M34 * 255).astype(np.uint8)).resize(tv.size, Image.NEAREST)) > 127
    xs = [p[0] for p in qs]; ys = [p[1] for p in qs]
    scr = pic.resize((max(1, int(max(xs) - min(xs))), max(1, int(max(ys) - min(ys)))), Image.NEAREST)
    tv = BC.fill_screen(tv, qs, ms, scr)
    sh = Image.new('RGBA', base.size)                                    # contact shadow on the table top
    ImageDraw.Draw(sh).ellipse((ROOM['tv_pos'][0] + 10, ROOM['tv_pos'][1] + tv.height - 14, ROOM['tv_pos'][0] + tv.width - 10, ROOM['tv_pos'][1] + tv.height + 6), fill=(0, 0, 0, 120))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(5)))
    base.alpha_composite(tv, ROOM['tv_pos'])
    base.alpha_composite(ROOM['n64'], ROOM['n64_pos'])
    return base


def room_shot(t):
    """H4a: night, his room. The CRT plays 1998 Hyrule; Quest watches from the floor, lit by the screen. The camera
    eases in to the TV; on "where" it switches off; in the dark glass, his reflection (the same profile, mirrored);
    then black. Real life: no HUD."""
    on = t < T_OFF
    pic = old_picture(t, (320, 240), pan=True)
    if not on:
        pic = tv_off(pic, min(1, (t - T_OFF) / .5))
    glow = 1.0 if on else max(0.0, 1 - (t - T_OFF) / .35)
    base = room_plate(t, pic)
    rgb = _night(base.convert('RGB'), glow)
    sx, sy = SCR_C[0] * PW, SCR_C[1] * PH
    if glow > 0:                                                        # the screen lights the room and him
        rgb = CART.glow(rgb, sx - 120, sy + 60, 900, (140, 190, 255), .35 * glow)
    base = rgb.convert('RGBA')
    qh = int(QSPEC[2] * PH)
    q = QPROF.resize((int(QPROF.width * qh / QPROF.height), qh), Image.LANCZOS)
    ql = Image.blend(q.convert('RGB'), Image.new('RGB', q.size, (18, 22, 44)), .30 + .30 * (1 - glow)).convert('RGBA'); ql.putalpha(q.getchannel('A'))
    sh = Image.new('RGBA', base.size); ImageDraw.Draw(sh).ellipse((QSPEC[0] * PW - q.width * .45, QSPEC[1] * PH - 24, QSPEC[0] * PW + q.width * .45, QSPEC[1] * PH + 14), fill=(0, 0, 0, 120))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    base.alpha_composite(ql, (int(QSPEC[0] * PW - q.width / 2), int(QSPEC[1] * PH - qh)))
    if glow > 0:                                                        # cool rim of screen light on his face and hands
        rim = Image.new('RGBA', base.size); rd = ImageDraw.Draw(rim)
        fx = QSPEC[0] * PW + q.width * .22; fy = QSPEC[1] * PH - qh * .72
        rd.ellipse((fx - 120, fy - 140, fx + 160, fy + 260), fill=(120, 170, 255, int(60 * glow)))
        base.alpha_composite(rim.filter(ImageFilter.GaussianBlur(40)))
    # his reflection in the dark glass: Quest pensive (#10), mirrored, faint and cool, inside the screen
    kr = min(1, max(0, (t - T_REFL) / .25)) * (1 - min(1, max(0, (t - T_BLACK) / .25)))
    if kr > 0:
        qsP = SCR_QUAD
        x0, x1 = min(p[0] for p in qsP), max(p[0] for p in qsP); y0, y1 = min(p[1] for p in qsP), max(p[1] for p in qsP)
        f = REFL
        fh = int((y1 - y0) * .95); f = f.resize((int(f.width * fh / f.height), fh), Image.LANCZOS)
        g = Image.blend(f.convert('RGB'), Image.new('RGB', f.size, (140, 170, 210)), .4).convert('RGBA')
        g.putalpha(f.getchannel('A').point(lambda v: int(v * .45 * kr)))
        m = Image.new('L', base.size, 0); ImageDraw.Draw(m).polygon(qsP, fill=255)                  # only on the glass
        layer = Image.new('RGBA', base.size); layer.alpha_composite(g, (int((x0 + x1) / 2 - g.width * .55), int(y1 - fh)))
        layer.putalpha(Image.fromarray(np.minimum(np.asarray(layer.getchannel('A')), np.asarray(m))))
        base.alpha_composite(layer)
    # camera: both of them whole, then a slow push in to the screen; after "where" it closes on the dark glass
    c0, c1 = ROOM['c0'], ROOM['c1']                                     # close to the TV, Quest whole; a gentle push, Quest stays whole
    c2 = (ROOM['c2z'], SCR_C[0] - .006, SCR_C[1] + .006)               # the same screen size in frame for both rooms
    if t < T_OFF:
        k = ease((t - T_WONDER) / (T_OFF - T_WONDER)); a, b = c0, c1
    else:
        k = ease(min(1, (t - T_OFF) / (T_REFL + .2 - T_OFF))); a, b = c1, c2
    cam = (a[0] * (b[0] / a[0]) ** k, lin(a[1], b[1], k), lin(a[2], b[2], k))
    fr = crop(base.convert('RGB'), cam)
    if t >= T_BLACK:
        fr = Image.blend(fr, Image.new('RGB', fr.size, (0, 0, 0)), min(1, (t - T_BLACK) / .25))
    if t < T_WONDER + .2:                                               # a quick dip from the bright field into the night room
        fr = Image.blend(Image.new('RGB', fr.size, (0, 0, 0)), fr, (t - T_WONDER) / .2)
    return fr


RIDE = [(.49, .985), (.58, .81), (.605, .73), (.645, .69), (.665, .668), (.652, .648)]   # the road towards the castle (plate fractions, hooves)
RIDE_H = (.42, .135)                                                   # rider + horse height on screen (fraction of H): near -> far
NOW_CAM = lambda u: (lin(1.15, 1.25, ease(u)), .5, .6)                  # ends on block G/I's framing (1.25, .5, .6)


def _ride_point(k):
    """Hooves position along RIDE (plate fractions), k in 0..1, by path length."""
    seg = [math.dist(a, b) for a, b in zip(RIDE, RIDE[1:])]; d = k * sum(seg)
    for (a, b), L in zip(zip(RIDE, RIDE[1:]), seg):
        if d <= L:
            return lin(a[0], b[0], d / L), lin(a[1], b[1], d / L)
        d -= L
    return RIDE[-1]


def ride(fr, t, k, cam, alpha=1.0, dust=True):
    """Quest on his own chestnut horse (#5b) from behind, trotting away along the road: a trot bob, a little roll,
    smaller with distance. k = progress (0 near, 1 near the castle). Also used by block I's opening (k = 1)."""
    box = cam_box((cam, cam), 0)
    fx, fy = to_screen(*_ride_point(k), box)
    hh = H * lin(RIDE_H[0], RIDE_H[1], 1 - (1 - k) ** 1.6)               # perspective: shrinks fast at first, then slowly
    trot = abs(math.sin(t * 2 * math.pi * 1.9))                          # two beats a second
    sway = round(SHIELD_SWAY * math.sin(t * 2 * math.pi * 1.9) * 4) / 4      # the shield swings with the trot
    im = sized(final('quest_horse_back', sway=sway) if sway else RIDER, hh)
    im = im.rotate(1.6 * math.sin(t * 2 * math.pi * .95), resample=Image.BICUBIC, expand=True, center=(im.width / 2, im.height))
    if alpha < 1:
        im.putalpha(im.getchannel('A').point(lambda v: int(v * alpha)))
    if dust and alpha > 0:                                              # a little dust behind the hooves
        g = Image.new('RGBA', fr.size); d = ImageDraw.Draw(g)
        for j in range(6):
            ph = (t * 2.2 + j / 6) % 1
            rr = hh * (.04 + .09 * ph)
            x = fx + (j - 2.5) * hh * .045; y = fy - hh * .02 + hh * .05 * ph
            d.ellipse((x - rr, y - rr * .6, x + rr, y + rr * .6), fill=(214, 190, 150, int(110 * (1 - ph) * alpha)))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(4))).convert('RGB')
    sh = Image.new('RGBA', fr.size)                                     # contact shadow
    ImageDraw.Draw(sh).ellipse((fx - im.width * .38, fy - hh * .03, fx + im.width * .38, fy + hh * .03), fill=(30, 25, 10, int(90 * alpha)))
    fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(3))).convert('RGB')
    return comp(fr, im, fx - im.width / 2, fy - im.height - hh * .012 * trot)


def now_shot(t):
    """H4b: out of the black, today's Hyrule, golden and moving. Seen from behind, Quest rides away on his own chestnut
    horse (#5b), down the road towards the castle: off into the new game. HUD back on."""
    u = (t - T_NOW) / (T_END - T_NOW)
    cam = NOW_CAM(u)
    base = G.new_look(crop(G.FIELD, cam))
    base = CART.glow(base, W * .82, H * .12, 640, (255, 214, 140), .35)   # golden hour
    fr = FB.grass(base, t, 1.0)
    fr = ride(fr, t, ease(min(1, u * 1.05)), cam)
    if t < T_NOW + .4:
        fr = Image.blend(Image.new('RGB', fr.size, (0, 0, 0)), fr, (t - T_NOW) / .4)
    return fr


def fading_question(fr, t):
    """Block G ends on the tilted '?' badge: it shrinks away as H begins (no pop at the join)."""
    k = (t - T0) / .35
    if k >= 1:
        return fr
    g = Image.new('RGBA', (180, 180)); d = ImageDraw.Draw(g)
    d.ellipse((10, 10, 170, 170), fill=(70, 190, 100, 235), outline=INK, width=5)
    d.text((62, 36), '?', font=F(96), fill=(255, 255, 255, 255))
    g = g.rotate(25, expand=True, resample=Image.BICUBIC)
    s = 1 - ease(k)
    g = g.resize((max(1, int(g.width * s)), max(1, int(g.height * s))), Image.LANCZOS)
    return comp(fr, g, W * .74 - g.width / 2, H * .5 - g.height / 2)


def render(t):
    if t >= T_WONDER:                                                   # H4: the room, the TV dies, today's Hyrule
        fr = room_shot(t) if t < T_NOW else now_shot(t)
        if t >= T_NOW:
            fr = fairy_fx.draw(fr, [(T_NOW, .3, .3), (T_NOW + 1.5, .47, .4), (T_END, .5, .45)], t, size=.045)
            fr = hud.draw(fr, hearts=HEARTS, t=t, alpha=min(1, (t - T_NOW - .2) / .4))   # back in the game: the HUD returns
        lab = 'H4 the TV switches off' if t < T_NOW else 'H4 today: a new Hyrule'
        d = ImageDraw.Draw(fr)
        tag(d, f'SEQ 14 THE IMPOSSIBLE JOB · {lab} · BLOCK H v11 · PLANNING ONLY')
        subtitle(d, t)
        return fr
    fr, e = back_shot(t)
    fr = sparkles(fr, t, e)
    fr = fading_question(fr, t)
    if t < T_JOB + .6:                                                  # H1: the polaroid comes back and quietly changes
        u = min(1, (t - T0) / 1.0)
        out = ease(max(0, (t - T_JOB) / .6))
        card = polaroid(t).rotate(5 + 12 * math.sin((t - T0) * 5) * (1 - u), expand=True, resample=Image.BICUBIC)
        card = card.resize((int(card.width * POLA_SCALE), int(card.height * POLA_SCALE)), Image.LANCZOS)
        if u < .25:
            card.putalpha(card.getchannel('A').point(lambda v: int(v * u / .25)))
        fr = comp(fr, card, POLA_REST[0] - W * .3 * (1 - ease(u)) - W * .35 * out, POLA_REST[1] + 20 * math.sin(math.pi * u) * (1 - u))   # slides in from the left, under the hearts
        fr = upgrades_fly(fr, t)
    if T_JOB <= t < T_DIFF + .4:                                        # H2
        a = min(1, (t - T_JOB) / .25) * (1 - min(1, max(0, (t - T_DIFF) / .4)))
        fr = message_box(fr, t, a)
    if t >= T_DIFF:                                                     # H3: the slider (leaves before the cut, so the ending breathes)
        fr = slider(fr, t, H * .16, min(1, (t - T_DIFF) / .3) * (1 - min(1, max(0, (t - T_WONDER + .3) / .3))))
    navi = [(T0, .56, .5), (T_JOB, .5, .26), (T_DIFF, .44, .3), (T_WONDER, .62, .32)]
    fr = fairy_fx.draw(fr, navi, t, size=.045)
    fr = hud.draw(fr, hearts=HEARTS, t=t)
    d = ImageDraw.Draw(fr)
    lab = 'H1 every improvement changes the memory' if t < T_JOB else 'H2 the impossible job' if t < T_DIFF else 'H3 different enough...'
    tag(d, f'SEQ 14 THE IMPOSSIBLE JOB · {lab} · BLOCK H v11 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('h1', T('l59.w8')), ('h2', T('l60.w5') + .4), ('h3', T('l61.w7') + .2), ('h4_tv', T('l62.w4')), ('h4_reflection', T_REFL + .4), ('h4_now', T_NOW + 1.2))


def main():
    out = ROOT / 'docs/ep002/EP002_blockH_animatic_v11.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockH_v11_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer, 2026-10-04)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockH_v11_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
