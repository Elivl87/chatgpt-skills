#!/usr/bin/env python3
"""EP002 animatic, block M (planning only): l94 "Ocarina of Time was not important because it felt familiar." ->
l101 "time mattered." (block N starts on l102 "You were a child.").

Producer approved, 2026-10-04 ("Sí, constrúyelo así"). Not Hyrule Field (Producer rule: vary the places): the forest.
  M1  "...not important because it felt familiar. / It was important because it felt new."  Block L's cracked case:
                                          on "familiar" the glass bursts, the camera dives into the green light of the
                                          crack; white on "new".
  M2  "A world people understood in two dimensions suddenly became somewhere they could stand."  A flat top-down 8-bit
                                          forest map; on "suddenly" it tilts into a ground plane like a pop-up book, the
                                          trees grow up out of their tiles, and on "stand" Quest (tunic, from behind)
                                          lands on it with a puff of dust. The HUD comes on (in game from here).
  M3  "Distance mattered."                A misty mountain far beyond the trees; a measuring line runs out to it.
  M4  "Where you looked mattered."        His gaze sweeps the clearing and a yellow target marker locks on a chest
                                          (evokes the game's targeting, not a copy); the chest opens with a glow.
v2 (Producer improvements): the case trembles harder until it bursts; on "stand" the 8-bit hero of the map grows into
Quest (pixels -> smooth) instead of Quest dropping in; the chest opens.
  M5  "Music mattered."                   The ocarina (our 3D) plays, notes rise, flowers open round him, leaves sway.
  M6  "And most importantly..."           Everything freezes and drains of colour; Navi flies to the centre.
  M7  "time mattered."                    One sweep of a clock dial: the sun sets, the moon rises, night and stars.
v5: final art. The pop-up world becomes the forest village (#12) as the tilt completes; young Quest from behind (#3).
M3's line runs to the far waterfall (the plate has no mountain); the chest sits on the grass, lower left; at night the
village's windows and lanterns light up. Sounds: none (all at the end).
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, W, H, FPS, T, ease, lin, final, final_plate, subtitle, tag, F, S, Si, P, out_path, video_args, audio_args  # noqa
import fairy as fairy_fx  # noqa
import ui_kit as UI  # noqa: the approved on-screen text style (2026-10-06)
import hud  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BL = load('blockL', 'scripts/ep002-blockL-animatic.py')          # the cracked case, helpers
CART = BL.CART
comp, sized, fade, ctext = BL.comp, BL.sized, BL.fade, BL.ctext

T0 = T('l94') - 0.05                    # block L ends here
T_BURST = T('l94.w10')                  # "familiar": the glass bursts
T_NEW = T('l95.w7')                     # "new": white
T_MAP = T('l96') - .05
T_TILT = T('l96.w8')                    # "suddenly"
T_STAND = T('l96.w13')                  # "stand"
T_DIST = T('l97') - .05
T_LOOK = T('l98') - .05
T_LOCK = T('l98.w3')                    # "looked"
T_MUSIC = T('l99') - .05
T_FREEZE = T('l100') - .05
T_TIME = T('l101') - .05
T_END = T('l102') - 0.05                # block N starts on l102
INK = (20, 14, 18, 255)
HEARTS = 2.5                            # carried over (blocks F-H)

# ------------------------------------------------------------------ M1: into the crack
_LZ = 1.07                                                                  # block L's final framing (zoom, anchor)
_cw, _ch = W / _LZ, H / _LZ
CRACK_SCREEN = ((BL.CRACK_PT[0] - (W - _cw) / 2) * _LZ, (BL.CRACK_PT[1] - (H * .42 - _ch * .5)) * _LZ)


def m1(t):
    fr, _ = BL.frame(min(t, BL.T_END - .05) if t < T_BURST else BL.T_END - .05)
    if t < T_BURST:                                                          # Producer improvement: the case trembles, harder and harder
        k = ease(min(1, max(0, (t - T0) / (T_BURST - T0))))
        amp = .8 + 4.5 * k
        dx, dy = amp * math.sin(t * 61), amp * .6 * math.sin(t * 47 + 1)
        big = fr.resize((int(W * 1.02), int(H * 1.02)), Image.BILINEAR)
        fr = big.crop((int(W * .01 + dx), int(H * .01 + dy), int(W * .01 + dx) + W, int(H * .01 + dy) + H))
        fr = CART.glow(fr, CRACK_SCREEN[0], CRACK_SCREEN[1], int(120 + 60 * k), (170, 255, 170), (.25 + .35 * k) * (.7 + .3 * math.sin(t * 9)))
    if t >= T_BURST:
        k = (t - T_BURST) / (T_NEW - T_BURST)
        z = 1 + 5 * ease(min(1, k)) ** 1.6                                  # dive into the crack
        cx, cy = CRACK_SCREEN
        cw, ch = W / z, H / z
        x0 = min(max(cx - cw / 2, 0), W - cw); y0 = min(max(cy - ch / 2, 0), H - ch)
        fr = fr.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BILINEAR)
        sx, sy = (cx - x0) * z, (cy - y0) * z
        fr = CART.glow(fr, sx, sy, int(200 + 900 * ease(min(1, k))), (170, 255, 170), min(1, .5 + .8 * k))
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        r = np.random.default_rng(5)
        u = t - T_BURST
        for i in range(26):                                                  # glass shards fly at the camera
            ang = r.random() * 2 * math.pi; sp = 300 + 700 * r.random(); s = (8 + 22 * r.random()) * (1 + 2.5 * u)
            px, py = sx + math.cos(ang) * sp * u, sy + math.sin(ang) * sp * u
            a0 = r.random() * 6 + u * (4 * r.random() - 2)
            pts = [(px + s * math.cos(a0 + j * 2.2 + r.random() * .4), py + s * math.sin(a0 + j * 2.2)) for j in range(3)]
            d.polygon(pts, fill=(235, 250, 255, int(200 * max(0, 1 - u / 1.6))), outline=(120, 160, 170, int(200 * max(0, 1 - u / 1.6))))
        fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
        if t > T_NEW - .45:                                                  # ...white on "new"
            fr = Image.blend(fr, Image.new('RGB', fr.size, (250, 255, 245)), min(1, (t - T_NEW + .45) / .45))
    return fr, 'M1 it felt new' if t >= T('l95') - .05 else 'M1 not because it felt familiar'


# ------------------------------------------------------------------ M2: the 8-bit forest map
TS = 32                                                                     # tile size: 40 x 23 tiles
MC, MR = W // TS, (H + TS - 1) // TS


def _map_layout():
    r = np.random.default_rng(14)
    g = np.zeros((MR, MC), np.uint8)                                         # 0 grass, 1 tree, 2 path, 3 water, 4 chest
    for y in range(MR):
        for x in range(MC):
            dx, dy = (x - MC / 2) / (MC * .30), (y - MR * .55) / (MR * .30)
            clearing = dx * dx + dy * dy < 1
            if not clearing and r.random() < .62:
                g[y, x] = 1
    for y in range(MR):                                                      # a path from the bottom up through the clearing
        x = int(MC / 2 + 2.5 * math.sin(y * .45))
        g[y, x - 1:x + 1] = 2
    g[3:7, 4:9] = 3                                                          # a pond, top left
    g[int(MR * .50), int(MC * .30)] = 4                                       # the chest (left, clear of the distance line)
    return g


LAYOUT = _map_layout()
TREES = [(x, y) for y in range(MR) for x in range(MC) if LAYOUT[y, x] == 1]
CHEST_TILE = tuple(int(v) for v in np.argwhere(LAYOUT == 4)[0][::-1])       # (x, y)


HERO_SPR = ((10, 4, 22, 14, (60, 150, 60)), (8, 14, 24, 26, (40, 120, 50)), (12, 8, 20, 14, (240, 200, 160)), (10, 26, 14, 30, (90, 60, 30)), (18, 26, 22, 30, (90, 60, 30)))
_HR = int(MR * .70)
HERO_XY = (int(MC / 2 + 2.5 * math.sin(_HR * .45)) * TS - 32, _HR * TS)      # the little 8-bit hero, on the path, in view after the tilt


def _tile_map(hero=True):
    im = Image.new('RGB', (MC * TS, MR * TS), (92, 172, 72)); d = ImageDraw.Draw(im)
    for y in range(MR):
        for x in range(MC):
            x0, y0 = x * TS, y * TS; v = LAYOUT[y, x]
            if v == 0 and (x * 7 + y * 3) % 5 == 0:
                d.rectangle((x0 + 10, y0 + 12, x0 + 14, y0 + 16), fill=(70, 140, 56)); d.rectangle((x0 + 20, y0 + 20, x0 + 24, y0 + 24), fill=(70, 140, 56))
            elif v == 1:                                                     # round tree, seen from above, 8-bit
                d.rectangle((x0 + 2, y0 + 6, x0 + 29, y0 + 25), fill=(30, 96, 40)); d.rectangle((x0 + 6, y0 + 2, x0 + 25, y0 + 29), fill=(30, 96, 40))
                d.rectangle((x0 + 8, y0 + 8, x0 + 16, y0 + 14), fill=(56, 140, 56))
            elif v == 2:
                d.rectangle((x0, y0, x0 + TS, y0 + TS), fill=(214, 180, 112))
            elif v == 3:
                d.rectangle((x0, y0, x0 + TS, y0 + TS), fill=(60, 120, 220)); d.rectangle((x0 + 6, y0 + 10, x0 + 18, y0 + 13), fill=(150, 200, 255))
            elif v == 4:
                d.rectangle((x0 + 6, y0 + 10, x0 + 26, y0 + 26), fill=(150, 90, 40)); d.rectangle((x0 + 6, y0 + 16, x0 + 26, y0 + 18), fill=(230, 190, 70))
    hx, hy = HERO_XY
    for (x0, y0, x1, y1, c) in HERO_SPR if hero else ():
        d.rectangle((hx + x0, hy + y0, hx + x1, hy + y1), fill=c)
    return im.crop((0, 0, W, H))


def _hero():
    g = Image.new('RGBA', (32, 32)); d = ImageDraw.Draw(g)
    for (x0, y0, x1, y1, c) in HERO_SPR:
        d.rectangle((x0, y0, x1, y1), fill=c + (255,))
    return g.crop(g.getchannel('A').getbbox())


HERO = _hero()


MAP = _tile_map()
MAP_NOHERO = _tile_map(hero=False)                                          # once the hero has become Quest
HORIZON = H * .40


def quad(k):
    """The map's corners on screen: full-screen (k=0) -> a ground plane running to the horizon (k=1)."""
    e = ease(k)
    tl = (lin(0, W * .30, e), lin(0, HORIZON, e)); tr = (lin(W, W * .70, e), lin(0, HORIZON, e))
    br = (lin(W, W * 2.2, e), H * 1.0 + lin(0, H * .25, e)); bl = (lin(0, -W * 1.2, e), H * 1.0 + lin(0, H * .25, e))
    return np.float32([tl, tr, br, bl])


def homography(k):
    return cv2.getPerspectiveTransform(np.float32([[0, 0], [W, 0], [W, H], [0, H]]), quad(k))


def project(M, x, y):
    p = cv2.perspectiveTransform(np.float32([[[x, y]]]), M)[0, 0]
    return float(p[0]), float(p[1])


def local_scale(M, x, y):
    a = project(M, x - TS / 2, y); b = project(M, x + TS / 2, y)
    return abs(b[0] - a[0]) / TS


def _tree_sprite():
    g = Image.new('RGBA', (180, 260)); d = ImageDraw.Draw(g)
    d.rectangle((78, 170, 102, 258), fill=(110, 74, 44), outline=INK, width=4)
    for (cx, cy, rx, ry, col) in ((90, 150, 78, 48, (36, 104, 44)), (90, 104, 64, 44, (46, 124, 52)), (90, 62, 46, 40, (62, 146, 62))):
        d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=col + (255,), outline=INK, width=4)
    d.arc((60, 40, 110, 80), 200, 290, fill=(120, 190, 110, 255), width=5)
    return g


TREE = _tree_sprite()


def _sky(night):
    a = np.zeros((H, W, 3), np.float32); yy = np.linspace(0, 1, H)[:, None, None]
    day = np.array([120, 185, 245]) * (1 - yy) + np.array([215, 235, 250]) * yy
    nt = np.array([12, 18, 52]) * (1 - yy) + np.array([40, 46, 96]) * yy
    a[:] = day * (1 - night) + nt * night
    return Image.fromarray(a.astype(np.uint8))


def mountain(fr, a, night):
    if a <= 0:
        return fr
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    base = HORIZON + 6; mx = W * .63                                          # tall enough to rise over the far trees
    col = tuple(int(lin(c0, c1, night)) for c0, c1 in zip((150, 150, 180), (50, 54, 90)))
    d.polygon(((mx - 300, base), (mx - 50, base - 200), (mx, base - 235), (mx + 70, base - 190), (mx + 320, base)), fill=col + (int(255 * a),))
    d.polygon(((mx - 50, base - 200), (mx, base - 235), (mx + 70, base - 190), (mx + 24, base - 172), (mx - 12, base - 186)), fill=(240, 240, 250, int(220 * a * (1 - .6 * night))))
    g = g.filter(ImageFilter.GaussianBlur(1.2))
    fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    fog = Image.new('RGBA', (W, H)); fd = ImageDraw.Draw(fog)                 # distance fog over its foot
    fd.rectangle((0, base - 60, W, base + 10), fill=(230, 236, 245, int(110 * a * (1 - .7 * night))))
    return Image.alpha_composite(fr.convert('RGBA'), fog.filter(ImageFilter.GaussianBlur(16))).convert('RGB')


QB = final('quest_young_back')                                              # final art #3: young Quest in his tunic, from behind (he stands)
FOREST_P = final_plate('forest').resize((W, H), Image.LANCZOS)              # final art #12: the forest village
FAR_PT = (W * .755, H * .50)                                                # the far waterfall beyond the tree houses (M3)
LANTERNS = ((.085, .085), (.19, .14), (.53, .20), (.575, .20), (.62, .37), (.515, .48), (.595, .48), (.94, .20), (.86, .23), (.47, .38))   # lit windows / lanterns of #12
OCA = BL.BK.BJ.BI.OCA
QX, QFEET, QH = W * .5, H * .95, H * .44


def forest_frame(t, tc):
    """tc = the clock that drives motion (it stops while everything is frozen)."""
    kt = min(1, max(0, (t - T_TILT) / (T_STAND - T_TILT - .25)))           # the tilt (pop-up)
    night = ease(min(1, max(0, (t - T_TIME) / 1.0)))
    M = homography(kt)
    kp = ease(min(1, max(0, (kt - .55) / .45)))                            # the pop-up world becomes the real forest (#12)
    if kt <= 0:
        fr = MAP.copy()
    elif kp >= 1:
        fr = FOREST_P.copy()
    else:
        fr = _sky(night)
        fr = mountain(fr, ease(min(1, max(0, (kt - .5) / .5))), night)
        ground = cv2.warpPerspective(np.asarray(MAP if t < T_STAND - .5 else MAP_NOHERO), M, (W, H), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
        mask = cv2.warpPerspective(np.full((H, W), 255, np.uint8), M, (W, H), flags=cv2.INTER_NEAREST)
        gimg = Image.fromarray(ground)
        if kt > .3:                                                          # the 8-bit tiles soften as the world becomes a place
            gimg = Image.blend(gimg, gimg.filter(ImageFilter.GaussianBlur(3)), min(1, (kt - .3) / .7) * .7)
        fr.paste(gimg, (0, 0), Image.fromarray(mask))
        # the trees grow up out of their tiles (far ones first), swaying a little
        trees = []
        for (x, y) in TREES:
            px, py = project(M, x * TS + TS / 2, y * TS + TS * .8)
            if -200 < px < W + 200 and HORIZON - 5 < py < H * 1.02:
                trees.append((py, px, x, y))
        trees.sort()
        for (py, px, x, y) in trees:
            grow = ease(min(1, max(0, (kt - .25 - .35 * (1 - (py - HORIZON) / (H - HORIZON))) / .4)))
            if grow <= 0:
                continue
            tw = int(local_scale(M, x * TS, y * TS) * TS * 1.25)              # a tree is about one tile wide
            th = int(tw * TREE.height / TREE.width * grow)
            if th < 4 or tw < 2:
                continue
            spr = TREE.resize((tw, th), Image.BILINEAR)
            sway = 2.5 * math.sin(tc * 1.7 + x) * (1 + 2 * kmusic(t))
            if abs(sway) > .3:
                spr = spr.rotate(sway, resample=Image.BICUBIC, center=(tw / 2, th), expand=False)
            fr = comp(fr, spr, px - tw / 2, py - th)
        if kp > 0:
            fr = Image.blend(fr, FOREST_P, kp)
    if night > 0:                                                            # the forest goes to night too
        fr = Image.blend(fr, Image.new('RGB', fr.size, (14, 20, 54)), .55 * night)
        for (lx, ly) in LANTERNS:                                            # ...and its windows and lanterns light up
            fr = CART.glow(fr, W * lx, H * ly, 46, (255, 200, 110), .55 * night)
    return fr, M, kt, night


def kmusic(t):
    return min(1, max(0, (t - T_MUSIC) / .4)) * (1 - min(1, max(0, (t - T_FREEZE) / .3)))


T_OPEN = T('l98.w4') + .35                                                 # Producer improvement: the chest opens


CHEST_POS = (W * .22, H * .76)                                             # on the grass, lower left of #12


def chest(fr, M, t):
    px, py = CHEST_POS
    s = 2.0
    w, h = int(40 * s), int(30 * s)
    if w < 6:
        return fr, (px, py)
    ko = ease(min(1, max(0, (t - T_OPEN) / .35)))
    if ko > 0:                                                               # light pours out of it
        fr = CART.glow(fr, px, py - h * .9, int(70 * s) + 10, (255, 236, 150), .8 * ko)
    g = Image.new('RGBA', (w + 4, h + int(h * .9) + 4)); d = ImageDraw.Draw(g)
    oy = int(h * .9)                                                         # room above for the open lid
    lw = max(2, int(3 * s))
    box_top = oy + int(h * .4)
    d.rectangle((2, box_top, w, oy + h), fill=(150, 92, 42, 255), outline=INK, width=lw)
    lid_h = h * .45
    lift = lid_h * 1.6 * ko                                                  # the lid swings up and back
    d.polygon(((2, box_top), (w, box_top), (w - w * .08 * ko, box_top - lid_h - lift), (2 + w * .08 * ko, box_top - lid_h - lift)),
              fill=(170, 106, 50, 255) if ko < .5 else (120, 72, 34, 255), outline=INK)
    d.rectangle((2, box_top - 2, w, box_top + max(2, int(h * .08))), fill=(230, 190, 70, 255))
    if ko > .3:                                                              # the open mouth, full of light
        d.rectangle((4 + w * .06, box_top - h * .12 * ko, w - 2 - w * .06, box_top), fill=(255, 238, 160, 255))
    d.rectangle((w / 2 - 3 * s, box_top - h * .06, w / 2 + 3 * s, box_top + h * .2), fill=(230, 190, 70, 255), outline=INK)
    fr = comp(fr, g, px - w / 2, py - h - oy)
    if ko > 0:                                                               # sparkles rise
        sp = Image.new('RGBA', (W, H)); sd = ImageDraw.Draw(sp)
        for j in range(6):
            ph = ((t - T_OPEN) * .9 + j / 6) % 1
            sx, sy = px + (j - 2.5) * 9 * s * .4, py - h - 60 * s * ph
            r = 5 * s * .5 * (1 - ph) + 1
            sd.line((sx - r, sy, sx + r, sy), fill=(255, 250, 200, int(255 * ko * (1 - ph))), width=2); sd.line((sx, sy - r, sx, sy + r), fill=(255, 250, 200, int(255 * ko * (1 - ph))), width=2)
        fr = Image.alpha_composite(fr.convert('RGBA'), sp).convert('RGB')
    return fr, (px, py - h / 2)


def target_marker(fr, cx, cy, k, tc):
    if k <= 0:
        return fr
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    r = lin(120, 46, ease(k)) + 4 * math.sin(tc * 8)
    a = int(255 * min(1, k * 2))
    for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):                     # four corner brackets close in
        x, y = cx + sx * r, cy + sy * r
        d.line((x, y, x - sx * 18, y), fill=(255, 214, 40, a), width=5); d.line((x, y, x, y - sy * 18), fill=(255, 214, 40, a), width=5)
    by = cy - r - 34 + 6 * math.sin(tc * 6)                                   # the bouncing arrow above
    d.polygon(((cx - 16, by), (cx + 16, by), (cx, by + 22)), fill=(255, 214, 40, a), outline=(80, 50, 10, a))
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


FLOWERS = [(MC / 2 + dx, MR * .55 + dy) for dx, dy in ((-6, 3), (-4, 6), (4, 5), (6, 2), (-8, 0), (8, 6), (-2, 8), (3, 9), (-5, -2), (5, -3))]


FLOWER_PTS = ((.30, .82), (.36, .90), (.66, .86), (.72, .78), (.24, .70), (.79, .90), (.40, .74), (.62, .72), (.15, .86), (.86, .80))   # on the grass round him


def flowers(fr, M, t):
    k0 = T_MUSIC + .15
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    for i, (fx, fy) in enumerate(FLOWER_PTS):
        k = ease(min(1, max(0, (t - k0 - i * .07) / .35)))
        if k <= 0:
            continue
        px, py = W * fx, H * fy
        s = (5 + 9 * (fy - .65) / .3) * k                                    # nearer = bigger
        col = ((255, 140, 180), (255, 240, 120), (190, 160, 255))[i % 3]
        for j in range(5):
            a = j * 2 * math.pi / 5
            d.ellipse((px + math.cos(a) * s - s * .6, py + math.sin(a) * s * .6 - s * .6, px + math.cos(a) * s + s * .6, py + math.sin(a) * s * .6 + s * .6), fill=col + (255,), outline=INK)
        d.ellipse((px - s * .45, py - s * .45, px + s * .45, py + s * .45), fill=(255, 220, 80, 255))
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


def notes(fr, t, tc):
    k = min(1, max(0, (t - T_MUSIC) / .3))
    if k <= 0:
        return fr
    o = OCA[int(tc * 10) % len(OCA)]
    s = sized(o, 70)
    ox, oy = QX + 120, QFEET - QH * .78
    fr = CART.glow(fr, ox, oy, 90, (150, 200, 255), .3 * k)
    fr = comp(fr, fade(s, k), ox - s.width / 2, oy - s.height / 2)
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    for j in range(7):
        ph = ((tc - T_MUSIC) * .8 + j / 7) % 1
        x = ox + 60 * math.sin(j * 1.7 + ph * 3) + 40 * ph; y = oy - 30 - 190 * ph
        d.text((x, y), '♪' if j % 2 else '♫', font=F(30 + (j % 3) * 8), fill=(255, 236, 170, int(255 * (1 - ph) * k)), stroke_width=2, stroke_fill=(70, 45, 15))
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


def clock_and_sky(fr, t):
    k = min(1, max(0, (t - T_TIME) / 1.1))
    if k <= 0:
        return fr
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    # sun sets to the right, moon rises from the left
    ang_s = lin(-.35, .9, ease(k)); sx, sy = W * .5 + W * .42 * math.sin(ang_s), HORIZON - 230 * math.cos(ang_s)
    d.ellipse((sx - 34, sy - 34, sx + 34, sy + 34), fill=(255, 220, 110, int(255 * (1 - k))), outline=INK)
    ang_m = lin(-1.0, -.35, ease(k)); mx, my = W * .5 + W * .42 * math.sin(ang_m), HORIZON - 230 * math.cos(ang_m)
    d.ellipse((mx - 26, my - 26, mx + 26, my + 26), fill=(235, 238, 255, int(255 * k)), outline=INK)
    d.ellipse((mx - 14, my - 30, mx + 34, my + 18), fill=(0, 0, 0, 0))
    r = np.random.default_rng(9)
    for _ in range(60):
        x, y = r.random() * W, r.random() * HORIZON
        d.ellipse((x - 1.5, y - 1.5, x + 1.5, y + 1.5), fill=(255, 255, 230, int(220 * max(0, k - .3) / .7)))
    # one sweep of a clock dial over the sky
    cx, cy, R = W * .5, H * .22, 92
    ka = math.sin(math.pi * min(1, k * 1.1)) if k < .91 else 0
    if ka > 0:
        d.ellipse((cx - R, cy - R, cx + R, cy + R), outline=(255, 245, 210, int(230 * ka)), width=5)
        for i in range(12):
            a = i * math.pi / 6
            d.line((cx + math.cos(a) * (R - 12), cy + math.sin(a) * (R - 12), cx + math.cos(a) * (R - 2), cy + math.sin(a) * (R - 2)), fill=(255, 245, 210, int(230 * ka)), width=4)
        a = -math.pi / 2 + 2 * math.pi * ease(k)
        d.line((cx, cy, cx + math.cos(a) * (R - 18), cy + math.sin(a) * (R - 18)), fill=(255, 245, 210, int(255 * ka)), width=6)
        d.ellipse((cx - 7, cy - 7, cx + 7, cy + 7), fill=(255, 245, 210, int(255 * ka)))
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


def m2_7(t):
    tc = min(t, T_FREEZE + .25) if t < T_TIME else t - (T_TIME - T_FREEZE - .25)   # motion stops while frozen
    fr, M, kt, night = forest_frame(t, tc)
    if kt >= 1:
        fr = clock_and_sky(fr, t) if t >= T_TIME else fr
        fr, cpos = chest(fr, M, t)
        fr = flowers(fr, M, t)
    # Quest lands on "stand"
    kq = min(1, max(0, (t - T_STAND + .5) / .6))                             # Producer improvement: the 8-bit hero becomes Quest
    if kq > 0:
        q = sized(QB, QH)
        e = ease(kq)
        hx, hy = project(M, HERO_XY[0] + 16, HERO_XY[1] + 30)                  # the hero's feet on the tilted map
        hh = max(8, local_scale(M, HERO_XY[0], HERO_XY[1] + 30) * 26)
        h_now = lin(hh, QH, e); fx, fy = lin(hx, QX, e), lin(hy, QFEET, e)
        q_now = sized(QB, h_now)
        px_q = sized(sized(QB, 26).resize((max(1, int(26 * QB.width / QB.height)), 26), Image.NEAREST), h_now)   # Quest, still in pixels
        hero = HERO.resize((max(1, int(HERO.width * h_now / HERO.height)), max(1, int(h_now))), Image.NEAREST)
        if e < .45:
            spr = Image.blend(hero.resize(px_q.size, Image.NEAREST), px_q, e / .45)
        else:
            spr = Image.blend(px_q.resize(q_now.size, Image.NEAREST), q_now, min(1, (e - .45) / .45))
        sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((fx - spr.width * .4, fy - 12, fx + spr.width * .4, fy + 10), fill=(0, 0, 0, int(90 * kq)))
        fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(6))).convert('RGB')
        if kq < 1:
            fr = CART.glow(fr, fx, fy - h_now * .5, int(h_now * .8) + 10, (255, 250, 210), .55 * math.sin(math.pi * kq))
        fr = comp(fr, spr, fx - spr.width / 2, fy - spr.height)
        kd = (t - T_STAND) / .7                                              # the puff of dust as he lands
        if 0 < kd < 1:
            g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
            for i in range(9):
                a = math.pi * (i / 8); rr = 30 + 120 * ease(kd)
                x, y = QX + math.cos(a) * rr * (1 if i % 2 else -1), QFEET - 8 - 20 * kd * math.sin(a)
                s = 18 + 18 * kd
                d.ellipse((x - s, y - s * .6, x + s, y + s * .6), fill=(230, 215, 180, int(200 * (1 - kd))))
            fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(3))).convert('RGB')
    # M3: the distance
    if T_DIST <= t < T_LOOK + .3:
        k = ease(min(1, (t - T_DIST) / .7)); a = 1 - min(1, max(0, (t - T_LOOK) / .3))
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        x0, y0 = QX + 40, QFEET - QH * .3; x1, y1 = FAR_PT                    # out to the far waterfall
        xe, ye = lin(x0, x1, k), lin(y0, y1, k)
        n = 16
        for i in range(n):
            u0, u1 = i / n, (i + .55) / n
            if u0 > k:
                break
            d.line((lin(x0, x1, u0), lin(y0, y1, u0), lin(x0, x1, min(u1, k)), lin(y0, y1, min(u1, k))), fill=(255, 255, 255, int(235 * a)), width=4)
        d.line((x1 - 12, y1, x1 + 12, y1), fill=(255, 255, 255, int(235 * a * k)), width=4)
        if k > .6:
            s = 'FAR AWAY'
            bx, by = lin(x0, x1, .55) + 30, lin(y0, y1, .55) - 20
            g.alpha_composite(UI.fade(UI.sq_tag(s, 18), a), (int(bx) - 8, int(by) - 8))   # our game tag (family A)
        fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    # M4: where you looked
    if T_LOOK <= t < T_MUSIC + .2 and kt >= 1:
        k = min(1, max(0, (t - T_LOOK) / (T_LOCK - T_LOOK)))
        a = 1 - min(1, max(0, (t - T_MUSIC) / .2))
        hx, hy = QX, QFEET - QH * .86
        tx, ty = cpos
        ang0 = math.atan2(ty - hy, (W * .85) - hx); ang1 = math.atan2(ty - hy, tx - hx)
        ang = lin(ang0, ang1, ease(k)); L = math.hypot(tx - hx, ty - hy) + 30
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        d.polygon(((hx, hy), (hx + L * math.cos(ang - .13), hy + L * math.sin(ang - .13)), (hx + L * math.cos(ang + .13), hy + L * math.sin(ang + .13))), fill=(255, 240, 150, int(70 * a)))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(5))).convert('RGB')
        fr = target_marker(fr, tx, ty, ((t - T_LOCK + .15) / .3) * a, tc)
    # M5: music
    if T_MUSIC <= t:
        fr = notes(fr, t, tc)
    # M6: freeze and drain
    kf = min(1, max(0, (t - T_FREEZE) / .4)) * (1 - min(1, max(0, (t - T_TIME) / .5)))
    if kf > 0:
        a = np.asarray(fr).astype(np.float32); g = a.mean(2, keepdims=True)
        a = a + (g - a) * .75 * kf
        fr = Image.fromarray(a.astype(np.uint8))
    if t >= T_STAND:
        fr = hud.draw(fr, hearts=HEARTS, t=t, alpha=min(1, (t - T_STAND) / .4))
    # Navi: over the map, then by his shoulder, then to the centre on "most importantly"
    keys = [(T_MAP, .62, .30), (T_STAND, .58, .42), (T_LOOK, .60, .40), (T_FREEZE, .58, .42), (T_FREEZE + .9, .50, .36), (T_END, .50, .34)]
    fr = fairy_fx.draw(fr, keys, t, size=.05 if t < T_FREEZE else .05 + .02 * min(1, (t - T_FREEZE) / .9))
    if kt < 1 and t >= T_NEW:
        d = ImageDraw.Draw(fr)
        if kt <= 0:                                                          # the flat world: a 2D label
            g2 = UI.area_title('2D', retro=True, size=40)                  # the flat world's era card: square pixels
            fr = fr.convert('RGBA'); fr.alpha_composite(g2, (int(W * .04), int(H * .11))); fr = fr.convert('RGB')
    lab = ('M1 it felt new' if t < T_MAP else 'M2 two dimensions -> somewhere to stand' if t < T_DIST else 'M3 distance mattered' if t < T_LOOK else 'M4 where you looked mattered'
           if t < T_MUSIC else 'M5 music mattered' if t < T_FREEZE else 'M6 and most importantly...' if t < T_TIME else 'M7 time mattered')
    return fr, lab


def render(t):
    if t < T_NEW:
        fr, lab = m1(t)
    else:
        fr, lab = m2_7(t)
        if t < T_NEW + .5:                                                   # out of the white, straight onto the map
            fr = Image.blend(Image.new('RGB', fr.size, (250, 255, 245)), fr, (t - T_NEW) / .5)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 19 IT FELT NEW · {lab} · BLOCK M v5 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('m0', T_BURST - .3), ('m1', T_BURST + .9), ('m2_map', T_TILT - .3), ('m2_tilt', T_TILT + .9), ('m2_grow', T_STAND - .15), ('m2_stand', T_STAND + .4), ('m3', T('l97.w2') + .3),
          ('m4', T('l98.w4') + .3), ('m4_open', T_OPEN + .6), ('m5', T('l99.w2') + .4), ('m6', T('l100.w3') + .5), ('m7', T_END - .2))


def main():
    out = out_path(ROOT / 'docs/ep002/EP002_blockM_animatic_v5.mp4')
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          *video_args(), *audio_args(), '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(out_path(ROOT / f'docs/ep002/blockM_v5_{name}.jpg'), quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(out_path(ROOT / f'docs/ep002/blockM_v5_{name}.jpg'), quality=85)
        print('stills')
    else:
        main()
