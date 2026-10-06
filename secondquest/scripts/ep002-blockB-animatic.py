#!/usr/bin/env python3
"""EP002 animatic · block B (planning only): from "An orchestra." to the cut into Act 1 (l03 rest -> l10, + silence).

  python3 scripts/ep002-blockB-animatic.py     # docs/ep002/EP002_blockB_animatic_v9.mp4

Scene Book v2, sequences 02-04:
  B1  "An orchestra. Voices. Modern controls."  living room from behind Quest, facing the TV; Navi comes back and circles
      him; music notes leave the TV; the N64 controller lights up on "controls".
  B2  "A new camera."  Navi leads the flight into the TV screen (camera freedom) -> white (v7: no camera icon, Producer).
  B3  "The same ocarina / sword / Triforce."  each relic turns in the dark (own 3D props, engraved Triforce plates);
      Navi leads the eye.
  B4  "But there is one thing..."  Hero Quest (final art #4: adult, back, shield + sword) + Navi facing Hyrule (final plate #11).
  B5  "You."  hold, no movement.
  B6  "And somehow... So, why?"  Navi starts forward, Quest follows down the path; SecondQuest wordmark on "why?" (as EP001), cut to Act 1.
Free sounds only: Bram (no new SFX in this block).
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, plate, place, cam_box, to_screen, subtitle, tag, F, FLAB, walk_adult  # noqa
import fairy as fairy_fx  # noqa
import hud  # noqa: in-game HUD in every Hyrule shot (Producer)
from icons import camera_icon  # noqa: the episode's game-camera icon (repeats wherever the script says camera)

FF = imageio_ffmpeg.get_ffmpeg_exe()
spec = importlib.util.spec_from_file_location('cart', ROOT / 'scripts/ep002-cartridge-animatic.py')
CART = importlib.util.module_from_spec(spec); spec.loader.exec_module(CART)

T0 = CART.T_END                       # block starts where the approved seq 01 ends (after "New graphics.")
T_CAM = T('l03.w8') - 0.05            # "A new camera."
T_REL = T('l04') - 0.08               # relics
T_OC, T_SW, T_TF = T('l04'), T('l05'), T('l06')
T_FIELD = T('l07') - 0.1
T_YOU = T('l08') - 0.05
T_GO = T('l09') - 0.1
T_WHY = T('l10')
T_END = T('l11') - 0.05               # Act 1 starts on l11
PROPS = ROOT / 'public/art/ep002/props3d'
TRI = ROOT / 'docs/ep002/triforce'
WORDMARK = Image.open(ROOT / 'public/art/core/brand/secondquest_wordmark.png').convert('RGBA')
T_WM = T('l10.w2')                     # "why?": the wordmark lands here, as in EP001 (l19)

# ------------------------------------------------------------------ B1/B2: living room from behind Quest
LIV = Image.open(ROOT / 'public/art/core/backgrounds/living_room_night_gaming.png').convert('RGBA').resize((PW, PH), Image.LANCZOS)
setup = Image.open(ROOT / 'public/art/ep002/seq01/room_n64_setup_cart_in.png').convert('RGBA').resize((PW, PH), Image.LANCZOS)
room = Image.alpha_composite(LIV, setup)
place(room, dict(char='quest:arms_up_back', x=.62, y=.95, h=.6))       # Quest from behind, arms up at the music
ROOM = room.convert('RGB')
TV = (.9, .25)                                                          # TV screen centre (plate fractions)
PAD = (.66, .79)                                                        # N64 controller on the rug
CAM_B1 = ((1.25, .7, .48), (1.4, .76, .42))


def frame_plate(img, cam, k):
    box = cam_box(cam, k)
    return img.crop(box).resize((W, H), Image.BILINEAR), box


def notes(fr, t, t0, src):
    d = ImageDraw.Draw(fr)
    for i in range(9):
        ph = (t - t0) * 0.55 + i / 9
        if ph < 0:
            continue
        k = ph % 1
        x = src[0] - k * W * (.35 + .25 * ((i * .37) % 1)) + math.sin(k * 7 + i) * 30
        y = src[1] - k * H * .25 + math.cos(k * 5 + i) * 25
        a = int(255 * min(1, (1 - k) * 2))
        d.text((x, y), '♪' if i % 2 else '♫', font=F(40 + (i % 3) * 8), fill=(255, 236, 170), stroke_width=2, stroke_fill=(70, 45, 15))
    return fr


# ------------------------------------------------------------------ B3: relics
def spin_frames(name):
    return [Image.open(f).convert('RGBA') for f in sorted((PROPS / name).glob('f*.png'))]
OCA, SWD = spin_frames('ocarina_spin'), spin_frames('sword_spin')
PLATES = {n: Image.open(TRI / f'plate_{n}.png').convert('RGBA').resize((640, 640), Image.LANCZOS) for n in ('power', 'wisdom', 'courage', 'crest')}


def dust(fr, t, seed=3):
    r = np.random.default_rng(seed)
    d = ImageDraw.Draw(fr)
    for i in range(60):
        x0, y0, sp = r.random() * W, r.random() * H, .2 + r.random() * .6
        x = (x0 + t * 12 * sp) % W; y = (y0 - t * 20 * sp) % H
        a = int(120 + 120 * math.sin(t * 3 + i))
        d.point((x, y), fill=(255, 220, 140))
        if i % 6 == 0:
            d.ellipse((x - 1.5, y - 1.5, x + 1.5, y + 1.5), fill=(255, 230, 160))
    return fr


def relic_frame(t):
    fr = Image.new('RGB', (W, H), (12, 8, 10))
    fr = dust(fr, t)
    if t < T_SW - 0.08:
        k = (t - T_REL) / (T_SW - T_REL)
        fr = CART.glow(fr, W / 2, H / 2, 330, (120, 160, 255), .55)
        im = OCA[min(len(OCA) - 1, int(k * len(OCA)))]
        s = lin(.62, .7, ease(k)); im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
        base = fr.convert('RGBA'); base.alpha_composite(im, ((W - im.width) // 2, (H - im.height) // 2 - 20)); fr = base.convert('RGB')
    elif t < T_TF - 0.08:
        k = (t - T_SW) / (T_TF - T_SW)
        fr = CART.glow(fr, W / 2, H / 2, 330, (200, 210, 255), .5)
        im = SWD[min(len(SWD) - 1, int(k * len(SWD)))]
        s = lin(.66, .74, ease(k)); im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
        base = fr.convert('RGBA'); base.alpha_composite(im, ((W - im.width) // 2, (H - im.height) // 2 - 10)); fr = base.convert('RGB')
        if 0 <= t - T('l05.w3') < .25:                                   # glint on "sword"
            fr = CART.glow(fr, W / 2 + 10, H * .2, 90, (255, 255, 255), .8 * (1 - (t - T('l05.w3')) / .25))
    else:
        k = ease((t - T_TF + .08) / 0.9)
        fr = CART.glow(fr, W / 2, H / 2 - 10, 380, (240, 190, 90), .5)
        tri = Image.new('RGBA', (640, 640))
        offs = {'power': (0, -300), 'wisdom': (-340, 220), 'courage': (340, 220), 'crest': (0, 340)}
        for n, im in PLATES.items():
            ox, oy = offs[n]
            tri.alpha_composite(im, (int(ox * (1 - k)), int(oy * (1 - k))))
        tri = tri.crop((80, 80, 560, 560)).resize((540, 540), Image.LANCZOS)
        base = fr.convert('RGBA'); base.alpha_composite(tri, (W // 2 - 270, H // 2 - 290)); fr = base.convert('RGB')
        if 0 <= t - (T_TF + .8) < .3:                                    # click-together flash
            fr = CART.glow(fr, W / 2, H / 2 - 40, 300, (255, 240, 200), .7 * (1 - (t - T_TF - .8) / .3))
    # Navi leads the eye: ocarina -> sword tip -> Triforce apex
    keys = [(T_REL, .75, .42), (T_OC + .4, .62, .36), (T_SW, .58, .2), (T_SW + .7, .55, .16), (T_TF, .5, .18), (T_FIELD - .1, .5, .12)]
    fr = fairy_fx.draw(fr, keys, t, size=.075)
    d = ImageDraw.Draw(fr)
    d.text((20, 40), 'B3 relics · ocarina + sword = own 3D props (free) · Triforce = engraved plates', font=F(15), fill=(255, 220, 160))
    return fr


# ------------------------------------------------------------------ B4-B6: Hyrule (final plate #11) with Hero Quest
# "You." is today's player going back: adult Quest from behind (#4, with the 3D shield and the sword on his back).
FIELD = plate(('final', 'field')).convert('RGBA')
FIELD_RGB = FIELD.convert('RGB')
CAM_B4 = ((1.18, .5, .64), (1.3, .5, .62))
HERO = dict(art='quest_adult_back', x=.5, y=.97, h=.46)


def field_frame(t):
    if t < T_YOU:                                                         # B4: slow push
        k = (t - T_FIELD) / (T_YOU - T_FIELD); cam = CAM_B4
    elif t < T_GO:                                                        # B5: "You." hold, no movement
        k = 1; cam = CAM_B4
    else:                                                                 # B6: continue from the hold, tilt up the path
        k = (t - T_GO) / (T_END - T_GO); cam = (CAM_B4[1], (1.3, .5, .56))
    lay = FIELD.copy()
    if t < T_GO:
        place(lay, HERO)
    else:
        kk = ease((t - T_GO) / (T_WHY + .5 - T_GO))
        walk = dict(im=walk_adult(t, rate=9)) if kk < .995 else {}         # he walks (a step per bob, the shield swinging)
        place(lay, dict(HERO, x=lin(.5, .555, kk), y=lin(.97, .72, kk) + .004 * math.sin(t * 9) * (1 - kk), h=lin(.46, .1, kk), **walk))   # down the road
    fr, box = frame_plate(lay.convert('RGB'), cam, k)
    # Navi beside him, then ahead down the path
    keys = [(T_FIELD, .6, .48), (T_YOU, .57, .46), (T_GO, .57, .46), (T_GO + 1.2, .54, .4), (T_WHY + .6, .51, .3)]
    s = .07 if t < T_GO else lin(.07, .035, min(1, (t - T_GO) / (T_WHY + .6 - T_GO)))
    fr = fairy_fx.draw(fr, keys, t, size=s)
    if t >= T_WHY + .3:                                                   # dim the field; SecondQuest wordmark on "why?" (as EP001)
        k2 = min(1, (t - T_WHY - .3) / .8)
        fr = Image.blend(fr, Image.new('RGB', fr.size, (8, 6, 10)), k2 * .6)
    if t >= T_WM:
        fr = wordmark(fr, t - T_WM)
    return fr



def _out_back(x, c=1.70158):
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2


def _in_out_cubic(x):
    return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2


def wordmark(fr, dt):
    """Twin of the engine's WordmarkLayerView as EP001 used it (s15, at "why?"):
    brand image 180 px tall @1080, gold bar 520x8 growing from the centre (+0.25 s, 0.45 s inOutCubic),
    punch_in intensity .35 / .28 s (scale 1.315 -> 1 outBack, fade x4, blur 14 -> 0, tilt 8*.35 deg)."""
    u = H / 1080
    wh = int(180 * u); ww = int(WORDMARK.width * wh / WORDMARK.height)
    bar_w, bar_h, gap = 520 * u * _in_out_cubic(min(1, max(0, (dt - .25) / .45))), max(2, round(8 * u)), int(18 * u)
    gw, gh = max(ww, int(520 * u)) + 40, wh + gap + bar_h + 40
    g = Image.new('RGBA', (gw, gh))
    g.alpha_composite(WORDMARK.resize((ww, wh), Image.LANCZOS), ((gw - ww) // 2, 20))
    if bar_w > 1:
        d = ImageDraw.Draw(g); y = 20 + wh + gap; x0 = (gw - bar_w) / 2; r = bar_h / 2
        d.rounded_rectangle((x0, y + 3 * u, x0 + bar_w, y + bar_h + 3 * u), r, fill=(22, 22, 31, 255))   # ink shadow
        d.rounded_rectangle((x0, y, x0 + bar_w, y + bar_h), r, fill=(255, 200, 61, 255))                 # theme gold #ffc83d
    x = min(1, dt / .28); e = _out_back(x)
    sc = 1.315 + (1 - 1.315) * e
    g = g.rotate(8 * .35 * (1 - e), resample=Image.BICUBIC, expand=True)
    g = g.resize((max(1, int(g.width * sc)), max(1, int(g.height * sc))), Image.LANCZOS)
    blur = (1 - min(1, x * 2.5)) * 14 * u
    if blur > .3:
        g = g.filter(ImageFilter.GaussianBlur(float(blur)))
    op = min(1, x * 4)
    if op < 1:
        g.putalpha(g.getchannel('A').point(lambda v: int(v * op)))
    base = fr.convert('RGBA'); base.alpha_composite(g, ((W - g.width) // 2, (H - g.height) // 2))
    return base.convert('RGB')

# ------------------------------------------------------------------ frame
def render(t):
    if t < T_CAM:                                                         # B1
        k = (t - T0) / (T_CAM - T0)
        fr, box = frame_plate(ROOM, CAM_B1, k)
        tx, ty = to_screen(*TV, box)
        if t >= T('l03.w4'):
            fr = CART.glow(fr, tx, ty, 300, (200, 235, 255), .35 + .1 * math.sin(t * 6))
            fr = notes(fr, t, T('l03.w4'), (tx - 40, ty))
        if t >= T('l03.w6'):                                              # "Modern controls."
            px, py = to_screen(*PAD, box)
            fr = CART.glow(fr, px, py, 90, (150, 230, 255), .6 * min(1, (t - T('l03.w6')) / .3))
        qx, qy = to_screen(.62, .55, box)
        keys = [(T0, -.05, .5), (T0 + .7, qx / W - .12, qy / H - .05), (T('l03.w5'), qx / W + .1, qy / H - .12),
                (T('l03.w6'), qx / W - .08, qy / H - .2), (T_CAM, tx / W - .05, ty / H)]
        fr = fairy_fx.draw(fr, keys, t, size=.065)
        d = ImageDraw.Draw(fr); tag(d, 'SEQ 02 QUEST ENTERS OCARINA · B1 orchestra / voices / controls · BLOCK B v8 · PLANNING ONLY')
    elif t < T_REL:                                                       # B2: "A new camera." fly into the screen
        k = ease((t - T_CAM) / (T_REL - T_CAM))
        z = 1.4 * (7.5 / 1.4) ** k
        cam = ((z, lin(.76, TV[0], k), lin(.42, TV[1], k)), (z, lin(.76, TV[0], k), lin(.42, TV[1], k)))
        fr, box = frame_plate(ROOM, cam, 0)
        tx, ty = to_screen(*TV, box)                                      # no camera icon here (Producer, 2026-10-05): Navi, already at
        fr = fairy_fx.draw(fr, [(T_CAM, tx / W - .05, ty / H), (T_REL, tx / W, ty / H)], t, size=.065)   # the TV, leads us into the screen
        fr = Image.blend(fr, Image.new('RGB', fr.size, (255, 255, 255)), max(0, (k - .55) / .45))
        d = ImageDraw.Draw(fr); tag(d, 'SEQ 02 · B2 "A new camera." · flight into the screen · BLOCK B v8 · PLANNING ONLY')
    elif t < T_FIELD:                                                     # B3
        fr = relic_frame(t)
        if t - T_REL < .25:
            fr = Image.blend(fr, Image.new('RGB', fr.size, 'white'), 1 - (t - T_REL) / .25)
        d = ImageDraw.Draw(fr); tag(d, 'SEQ 03 THE THREE ANCHORS · BLOCK B v8 · PLANNING ONLY')
    else:                                                                 # B4-B6
        fr = field_frame(t)
        a_hud = min(1, (t - T_FIELD) / .4) * (1 - min(1, max(0, (t - T_WHY - .3) / .5)))   # in with Hyrule, out before the wordmark
        fr = hud.draw(fr, alpha=a_hud, t=t)
        lab = 'B4 one thing' if t < T_YOU else ('B5 "You." HOLD' if t < T_GO else 'B6 Navi leads, Quest follows · "So, why?"')
        d = ImageDraw.Draw(fr); tag(d, f'SEQ 04 YOU · {lab} · BLOCK B v8 · PLANNING ONLY')
    d = ImageDraw.Draw(fr)
    subtitle(d, t)
    return fr


def main():
    out = ROOT / 'docs/ep002/EP002_blockB_animatic_v9.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in (('b1', T('l03.w6') + .3), ('b2', T_CAM + .5), ('b3_ocarina', T_OC + .5), ('b3_sword', T_SW + .5), ('b3_triforce', T_TF + 1.1),
                    ('b4', T_FIELD + 1.5), ('b6', T_GO + 2.0), ('title', T_END - .5)):
        render(t).save(ROOT / f'docs/ep002/blockB_v8_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer, 2026-10-04)


if __name__ == '__main__':
    main()
