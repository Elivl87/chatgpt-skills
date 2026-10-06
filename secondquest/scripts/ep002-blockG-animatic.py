#!/usr/bin/env python3
"""EP002 animatic, block G (planning only): l48 "An empty field in 1998 could feel enormous." -> l58 "Probably."

All in Hyrule, so the in-game HUD stays on (hearts carry over from block F: 2.5).
  G1  "An empty field in 1998 could feel enormous."     The old N64 field (blocky, fog): young Quest tiny, the camera
                                                        pulls back; a "1998" tag.
  G2  "Rebuild it too literally today... and it might just feel empty."  A scan rebuilds the same field crisp and
                                                        bright; on "empty" it widens: a big, sharp, silent field; a gust.
  G3  "A silent character once left space for your imagination."  Young hero Quest (final art #3b) faces us; his speech bubble is empty "...",
                                                        and doodles of imagination float out of it.
  G4  "Give that character a voice... somebody has to decide what that silence sounded like."  The bubble fills with a
                                                        waveform; a VOICE CASTING card with three takes, one gets picked.
  G5  "A camera you once fought with was part of learning the game."  The view swings, tilts and clips like the old
                                                        camera; a C-camera icon wobbles.
  G6  "Fix it... and the game becomes easier to inhabit."  A steel wrench taps the camera icon, a green check badge pops; the camera settles smoothly behind Quest.
  G7  "Which is good. Probably."                         The camera's small check jumps off and lands big... then tilts into a question mark.
Final art (v10): the field is final plate #11 (`final_plate('field')`); young Quest walking away is #3 alternating with
#3 mirrored (#9, the opposite step); the silent hero facing us is young Quest front, smiling (#3b). Nothing MISSING left.
Sounds: Bram only. Framing QC before sending.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, plate, final, final_plate, cam_box, subtitle, tag, F, STEP_RATE, SLOW_RATE, SLOW_STRIDE, road_walk, plate_to_screen, S, Si, P, out_path, video_args, audio_args  # noqa
import fairy as fairy_fx  # noqa
import hud  # noqa
import ui_kit as UI  # noqa: the approved on-screen text style (2026-10-06)
from icons import wrench_icon, camera_icon  # noqa: shared HUD-style icons (the camera repeats across the episode)

FF = imageio_ffmpeg.get_ffmpeg_exe()
sp = importlib.util.spec_from_file_location('cart', ROOT / 'scripts/ep002-cartridge-animatic.py'); CART = importlib.util.module_from_spec(sp); sp.loader.exec_module(CART)

T0 = T('l48') - 0.05
T_REB, T_EMPTY = T('l49') - .05, T('l50.w6')
T_SILENT, T_IMAG = T('l51') - .05, T('l51.w9')
T_VOICE, T_DECIDE = T('l52') - .05, T('l53.w6')
T_CAM = T('l54') - .05
T_FIX, T_EASY = T('l55') - .05, T('l56') - .05
T_GOOD, T_PROB = T('l57') - .05, T('l58') - .05
T_END = T('l59') - 0.05                # block H starts on l59 "But every improvement quietly changes the memory..."
HEARTS = 2.5                           # carried over from block F

FIELD = final_plate('field')                                           # final art #11: the road, the castle far away, the volcano
WALK = (final('quest_young_back'), final('quest_young_back_b'))         # final art #3 and #3 mirrored (#9): the two steps
YOUNG = WALK[0]                                                         # young Quest from behind, standing (final #3)
HERO_FRONT = final('quest_young_front')                                 # final art #3b: the silent young hero faces us


AREA_1998 = UI.area_title('1998', retro=True, size=48)                  # the era cards (R1 option 2, 2026-10-06)
AREA_TODAY = UI.area_title('TODAY', size=48)


def young(t, walking=True, rate=SLOW_RATE):
    """Young Quest from behind; walking alternates the two steps, one per bob."""
    return WALK[int(t * rate / math.pi) % 2] if walking else YOUNG


# G5-G7 and H1-H3 (Producer, 2026-10-06): young Quest walks down the field road itself, slowly, from G5 through H3 (one
# continuous walk: H continues G's last framing), instead of walking in place while the camera moved.
WALK_H0, WALK_Y0 = .336, .944                                          # where he sets off: .42 of the frame at zoom 1.25


def road_quest(t, cam):
    """Young Quest walking down the road at time t, seen through camera (zoom, x, y): (sprite, screen x, feet y)."""
    x, y, h = road_walk(t - T_CAM, WALK_H0, WALK_Y0, height_m=1.3, stride_m=SLOW_STRIDE, rate=SLOW_RATE)
    sx, sy, sh = plate_to_screen(x, y - .006 * abs(math.sin(t * SLOW_RATE)) * h / WALK_H0, h, cam_box((cam, cam), 0))
    return sized(young(t), sh), sx, sy


def comp(fr, im, x, y):
    base = fr.convert('RGBA'); base.alpha_composite(im, (int(x), int(y))); return base.convert('RGB')


def sized(im, h):
    return im.resize((max(1, int(im.width * h / im.height)), max(1, int(h))), Image.LANCZOS)


def crop(img, cam):
    box = cam_box((cam, cam), 0)
    return img.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)


def old_look(fr):
    """The 1998 look: blocky geometry, flat light, distance fog."""
    b = fr.resize((56, 32), Image.BILINEAR).resize((W, H), Image.NEAREST)
    a = np.asarray(b).astype(np.float32); g = a.mean(2, keepdims=True); a = g + (a - g) * .7
    yy = np.mgrid[0:H, 0:W][0] / H
    fog = np.clip(1 - np.abs(yy - .45) / .22, 0, 1)[..., None] * .35
    a = a * (1 - fog) + np.array([205, 215, 225]) * fog
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def new_look(fr):
    a = np.asarray(fr).astype(np.float32); g = a.mean(2, keepdims=True); a = g + (a - g) * 1.15
    return CART.glow(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), W * .85, H * .1, 520, (255, 230, 170), .3)


# ------------------------------------------------------------------ G1-G2: 1998 field, rebuilt, empty
def frame_g12(t):
    if t < T_EMPTY:
        cam = ((1.5 * (1.0 / 1.5) ** ease(min(1, (t - T0) / (T_REB - T0)))), .5, .6)
    else:
        k = ease(min(1, (t - T_EMPTY) / 1.0)); cam = (1.0 * (1 - .0 * k), .5, .55)
    base = crop(FIELD, cam)
    hero_h = H * .3 / cam[0] * 1.0                                      # young Quest small in the field, always sharp
    hero = sized(YOUNG, hero_h)                                         # standing, looking out at the field
    old = comp(old_look(base), hero, W * .5 - hero.width / 2, H * .93 - hero_h)
    new = comp(new_look(base), hero, W * .5 - hero.width / 2, H * .93 - hero_h)
    if t < T_REB:
        fr = old
    else:                                                               # a scan line rebuilds it, today
        k = ease(min(1, (t - T_REB) / 1.4)); sx = int(W * k)
        fr = old.copy(); fr.paste(new.crop((0, 0, sx, H)), (0, 0))
        if 0 < k < 1:
            ImageDraw.Draw(fr).line((sx, 0, sx, H), fill=(200, 240, 255), width=4)
    if t >= T_EMPTY:                                                    # empty: a gust across a sharp, silent field
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        for i in range(6):
            ph = ((t - T_EMPTY) * .7 + i / 6) % 1
            x = -200 + (W + 400) * ph; y = H * (.55 + .06 * i)
            d.arc((x - 90, y - 12, x + 90, y + 12), 200, 340, fill=(255, 255, 255, int(150 * math.sin(ph * math.pi))), width=3)
        fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    if t < T_EMPTY:                                                     # the era, as an area title card (approved R1 option 2)
        retro = t < T_REB + .3
        g = AREA_1998 if retro else AREA_TODAY
        fr = comp(fr, g, W * .5 - g.width / 2, H * .13)
    fr = fairy_fx.draw(fr, [(T0, .56, .55), (T_REB, .54, .5), (T_SILENT, .56, .5)], t, size=.045)
    return fr, ('G1 "An empty field in 1998..."' if t < T_REB else 'G2 rebuilt too literally -> empty')


# ------------------------------------------------------------------ G3-G4: the silent hero, then a voice
BUBBLE = (W * .56, H * .26, W * .88, H * .46)                     # under the HUD buttons, above the subtitles


def frame_g34(t):
    base = new_look(crop(FIELD, (1.25, .5, .6)))
    h = H * .78; hero = sized(HERO_FRONT, h)
    fr = comp(base, hero, W * .36 - hero.width / 2, H * .99 - h)
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    x0, y0, x1, y1 = BUBBLE
    k = ease(min(1, (t - T_SILENT) / .35))
    m = Image.new('L', (W, H), 0); md = ImageDraw.Draw(m)                 # one shape: bubble + tail, one outline
    md.rounded_rectangle((x0, y0, x0 + (x1 - x0) * k, y1), 28, fill=255)
    if k > .3:
        md.polygon([(x0 + 2, y1 - 26), (x0 + 2, y1 - 62), (W * .398, H * .352)], fill=255)   # tail towards Quest's mouth (#3b)
    edge = m.filter(ImageFilter.MaxFilter(9))
    g.paste((30, 30, 40, 255), (0, 0), edge); g.paste((252, 252, 250, 245), (0, 0), m)
    d = ImageDraw.Draw(g)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    if t < T_VOICE:                                                     # silence: "..." and imagination drifting out
        n = 1 + int((t - T_SILENT) * 3) % 3
        d.text((cx - 40, y0 + 6), '.' * n, font=F(56), fill=(60, 60, 70, 255))
        if t >= T_IMAG - .6:
            for i, (sym, col) in enumerate((('★', (240, 190, 40)), ('♥', (230, 70, 80)), ('?', (70, 120, 220)), ('♪', (80, 170, 90)))):
                ph = ((t - T_IMAG + .6) * .5 + i / 4) % 1
                d.text((cx - 100 + i * 60 + 20 * math.sin(ph * 6 + i), y1 - 60 - 70 * ph), sym, font=F(40),          # rising inside the bubble
                       fill=col + (int(255 * min(1, (1 - ph) * 2)),))
    else:                                                               # a voice: the bubble fills with a waveform
        for j in range(26):
            hh = 10 + 46 * abs(math.sin(t * 11 + j * .7)) * min(1, (t - T_VOICE) / .4)
            xx = x0 + 30 + j * (x1 - x0 - 60) / 25
            d.line((xx, cy - hh / 2, xx, cy + hh / 2), fill=(60, 110, 210, 255), width=6)
    fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    if t >= T('l53.w3') - .1:                                           # "somebody has to decide": a casting card
        kk = ease(min(1, (t - T('l53.w3') + .1) / .4))
        card = UI.sq_box(344, 152); cd = ImageDraw.Draw(card)          # our game text box (family A)
        UI.spaced(cd, (20, 12), 'VOICE CASTING', F(20), (255, 214, 90, 255), 2)
        for i in range(3):
            y = 48 + i * 38
            cd.text((20, y), f'TAKE {i + 1}', font=F(20), fill=(230, 235, 250, 255))
            for j in range(14):
                hh = 6 + 20 * abs(math.sin(j * (1.3 + i * .6) + i))
                cd.line((120 + j * 12, y + 12 - hh / 2, 120 + j * 12, y + 12 + hh / 2), fill=(120, 170, 240, 255), width=4)
            if i == 1 and t >= T_DECIDE:                                # someone decides
                cd.rounded_rectangle((300, y - 4, 344, y + 30), 6, outline=(90, 220, 120, 255), width=4)
                cd.line((308, y + 12, 318, y + 22, 336, y + 2), fill=(90, 220, 120, 255), width=5)
        fr = comp(fr, card, W * .58 + (1 - kk) * 500, H * .49)                 # ends above the subtitle zone
    fr = fairy_fx.draw(fr, [(T_SILENT, .5, .3), (T_CAM, .48, .28)], t, size=.045)
    return fr, ('G3 the silent hero' if t < T_VOICE else 'G4 a voice: somebody decides')


# ------------------------------------------------------------------ G5-G7: the old camera, fixed; good... probably
def frame_g57(t):
    if t < T_FIX:                                                       # the camera you fought: lags, swings, gets stuck behind a tree
        u = t - T_CAM
        settle = ease(min(1, u / .6))                                   # eases in from the previous shot, no jump
        zx = .5 + .11 * math.sin(u * 1.3) * settle
        zz = 1.25 + .12 * math.sin(u * 1.7) * settle
        ang = 4.5 * math.sin(u * 1.5) * settle
        base = crop(FIELD, (zz, zx, .6))
        q, sx, sy = road_quest(t, (zz, zx, .6))                         # he walks on; the camera swings and catches up late
        base = comp(base, q, sx - q.width / 2, sy - q.height)
        big = base.resize((int(W * 1.12), int(H * 1.12)), Image.BILINEAR).rotate(ang, resample=Image.BICUBIC)
        fr = big.crop((int(W * .06), int(H * .06), int(W * .06) + W, int(H * .06) + H))   # rotate inside a margin: no black corners
        tk = (u - 1.0) / 1.8                                            # a tree trunk passes in front, close to the camera
        if 0 < tk < 1:
            tx = W * (1.15 - 1.5 * ease(tk))
            tr = Image.new('RGBA', (W, H)); td = ImageDraw.Draw(tr)
            td.rounded_rectangle((tx - 110, -40, tx + 110, H + 40), 60, fill=(92, 66, 44, 255))
            for i in range(9):
                yy = 40 + i * 80
                td.arc((tx - 90, yy, tx + 30, yy + 60), 200, 340, fill=(70, 50, 34, 255), width=6)
            td.ellipse((tx - 260, -220, tx + 260, 120), fill=(60, 120, 50, 255))
            tr = tr.filter(ImageFilter.GaussianBlur(7))                 # out of focus: it is right at the lens
            fr = Image.alpha_composite(fr.convert('RGBA'), tr).convert('RGB')
        cam_icon_ang = 14 * math.sin(u * 4)
    else:                                                               # fixed: smooth, steady, behind Quest
        k = ease(min(1, (t - T_FIX) / 1.0))
        base = crop(FIELD, (1.25, .5, .6))
        q, sx, sy = road_quest(t, (1.25, .5, .6))                       # steady behind him while he walks down the road
        fr = comp(new_look(base), q, sx - q.width / 2, sy - q.height)
        cam_icon_ang = 0
    # the camera icon (bottom-right of the HUD buttons)
    g = camera_icon(rec=t >= T_FIX and int(t * 2) % 2 == 0)              # the REC light blinks once the camera works
    g = g.rotate(cam_icon_ang, expand=True, resample=Image.BICUBIC)
    fr = comp(fr, g, W * .84, H * .2)
    if T_FIX - .15 <= t < T_FIX + .75:                                  # the wrench: swings in, one tap on the camera, leaves
        u = t - T_FIX + .15
        ang = -70 + 70 * ease(min(1, u / .3)) - (12 * math.sin(min(1, (u - .3) / .15) * math.pi) if .3 <= u < .45 else 0)
        a = 1 - max(0, (u - .55) / .35)
        fr = comp(fr, wrench_icon(ang, a), W * .80 - 50, H * .27 - 80)
        if .3 <= u < .7:                                                # the tap: a glint on the camera
            fr = CART.glow(fr, W * .885, H * .26, 110, (255, 255, 220), .5 * (1 - (u - .3) / .4))
    if T_FIX + .15 <= t < T_GOOD:                                       # a small green check badge stays on the fixed camera
        k = ease(min(1, (t - T_FIX - .15) / .25)); s_ = .5 + .5 * k + .15 * math.sin(min(1, (t - T_FIX - .15) / .25) * math.pi)
        b = Image.new('RGBA', (60, 60)); bd = ImageDraw.Draw(b)
        bd.ellipse((3, 3, 57, 57), fill=(70, 190, 100, 255), outline=(20, 14, 18, 255), width=4)
        bd.line((17, 31, 26, 40, 43, 21), fill=(255, 255, 255, 255), width=7)
        b = b.resize((int(60 * s_), int(60 * s_)), Image.LANCZOS)
        fr = comp(fr, b, W * .84 + 112 - b.width / 2, H * .2 + 4 - b.height / 2)
    if t >= T_GOOD:                                                     # good... the small check jumps off the camera and lands big
        k = min(1, (t - T_GOOD) / .45)
        tilt = 0 if t < T_PROB else 25 * ease(min(1, (t - T_PROB) / .35))
        g = Image.new('RGBA', (180, 180)); d = ImageDraw.Draw(g)
        d.ellipse((10, 10, 170, 170), fill=(70, 190, 100, 235), outline=(20, 14, 18, 255), width=5)
        if t < T_PROB:
            d.line((50, 92, 78, 120, 132, 62), fill=(255, 255, 255, 255), width=14)
        else:
            d.text((62, 36), '?', font=F(96), fill=(255, 255, 255, 255))
        g = g.rotate(tilt + 18 * math.sin(math.pi * k), expand=True, resample=Image.BICUBIC)       # leans into the hop, stays readable
        bx, by = W * .84 + 112, H * .2 + 4                               # where the badge sat on the camera
        ex, ey = W * .74, H * .5
        x, y = lin(bx, ex, ease(k)), lin(by, ey, ease(k)) - H * .04 * math.sin(math.pi * k)    # a low hop, clear of the HUD buttons
        s = lin(.33, 1, ease(k)) + .12 * math.sin(math.pi * min(1, max(0, (k - .75) / .25)))   # a little bounce on landing
        g = g.resize((max(1, int(g.width * s)), max(1, int(g.height * s))), Image.LANCZOS)
        fr = comp(fr, g, x - g.width / 2, y - g.height / 2)
    fr = fairy_fx.draw(fr, [(T_CAM, .56, .5), (T_FIX, .55, .48), (T_END, .56, .5)], t, size=.045)
    lab = 'G5 the camera you fought' if t < T_FIX else 'G6 fixed: easier to inhabit' if t < T_GOOD else 'G7 "Which is good. Probably."'
    return fr, lab


def render(t):
    if t < T_SILENT:
        fr, lab = frame_g12(t)
    elif t < T_CAM:
        fr, lab = frame_g34(t)
    else:
        fr, lab = frame_g57(t)
    fr = hud.draw(fr, hearts=HEARTS, t=t)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 13 WHAT A REMAKE CHANGES · {lab} · BLOCK G v10 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('g1', T0 + 1.2), ('g2', T_EMPTY + .5), ('g3', T_IMAG), ('g4', T_DECIDE + .6), ('g5', T_CAM + 1.5), ('g6', T_EASY + .8), ('g7', T_PROB + .4))


def main():
    out = out_path(ROOT / 'docs/ep002/EP002_blockG_animatic_v10.mp4')
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          *video_args(), *audio_args(), '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(out_path(ROOT / f'docs/ep002/blockG_v10_{name}.jpg'), quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(out_path(ROOT / f'docs/ep002/blockG_v10_{name}.jpg'), quality=85)
        print('stills')
    else:
        main()
