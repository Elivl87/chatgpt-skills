#!/usr/bin/env python3
"""EP002 animatic, block E (planning only): l28 "Which creates a problem." -> l37 "Modernized controls and camera movement."

  E1  "Which creates a problem."                       Back to today: Quest in the living room, thinking; Navi beside him.
  E2  "Because Nintendo can remake Ocarina of Time."   The cartridge (own 3D) on dark: it can be rebuilt.
  E3  "But part of the thing people want back... was never inside Ocarina of Time."
                                                       The room, the TV and the friend (from block C) circle the cartridge,
                                                       try to go in and bounce off: they were never inside it.
  E4  "The new version is being rebuilt for Switch 2." Hyrule redrawn as a blueprint, a scan line rebuilds it brighter.
  E5  "New visuals. Voiced cutscenes. Expanded dialogue. An orchestral score. Modernized controls and camera movement."
                                                       A checklist on the left ticks each item in time with Bram, with a
                                                       small visual for each on the right; nothing covers the hero.

No console/brand logos are drawn for the new version (generic, labelled). Hyrule = final field plate #11 with young
Quest #3 (final art). Sounds: Bram only.
Framing checked with scripts/animatic/framing_qc.py before sending.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, plate, place, cam_box, to_screen, subtitle, tag, F, PLANNING, S, Si, P, out_path, video_args, audio_args  # noqa
import fairy as fairy_fx  # noqa
import hud  # noqa: in-game HUD in every Hyrule shot (Producer)
import ui_kit as UI  # noqa: the approved on-screen text style (2026-10-06)
from icons import camera_icon  # noqa: the episode's game-camera icon (repeats wherever the script says camera)

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


CART = load('cart', 'scripts/ep002-cartridge-animatic.py')
BB = load('blockB', 'scripts/ep002-blockB-animatic.py')
BC = load('blockC', 'scripts/ep002-blockC-animatic.py')
BD = load('blockD', 'scripts/ep002-blockD-animatic.py')

T0 = BD.T_END
T_REMAKE, T_WANT, T_NEVER = T('l29') - .05, T('l30') - .05, T('l31') - .05
T_SW2 = T('l32') - .05
ITEMS = [('New visuals', T('l33')), ('Voiced cutscenes', T('l34')), ('Expanded dialogue', T('l35')),
         ('An orchestral score', T('l36')), ('Modernized controls and camera', T('l37'))]
T_LIST = ITEMS[0][1] - .05
T_END = T('l38') - 0.05                # block F starts on l38 "On paper, the job sounds easy."
PROPS = ROOT / 'public/art/ep002/props3d'


def comp(fr, im, x, y):
    base = fr.convert('RGBA'); base.alpha_composite(im, (int(x), int(y))); return base.convert('RGB')


# ------------------------------------------------------------------ E1: back to today
LIV = Image.open(ROOT / 'public/art/core/backgrounds/living_room_night_gaming.png').convert('RGBA').resize((PW, PH), Image.LANCZOS)
SETUP = Image.open(ROOT / 'public/art/ep002/seq01/room_n64_setup_cart_in.png').convert('RGBA').resize((PW, PH), Image.LANCZOS)
ROOM = Image.alpha_composite(LIV, SETUP)
place(ROOM, dict(char='quest2:thinking_chin', x=.42, y=.97, h=.66, label=None))
ROOM = ROOM.convert('RGB')


def frame_e1(t):
    k = (t - T0) / (T_REMAKE - T0)
    box = cam_box(((1.15, .45, .55), (1.3, .44, .5)), k)
    fr = ROOM.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)
    if t < T0 + .35:                                                    # out of block D's dim
        fr = Image.blend(Image.new('RGB', fr.size, (10, 8, 10)), fr, (t - T0) / .35)
    keys = [(T0, .62, .3), (T0 + .7, .58, .27), (T_REMAKE, .6, .3)]
    fr = fairy_fx.draw(fr, keys, t, size=.06)
    d = ImageDraw.Draw(fr)
    tag(d, 'SEQ 10 THE PROBLEM · E1 "Which creates a problem." · back to today · BLOCK E v8 · PLANNING ONLY')
    return fr


# ------------------------------------------------------------------ E2-E3: the cartridge and what was never inside
_c = Image.open(PROPS / 'cart_spin/f012.png').convert('RGBA')
CARTIMG = _c.crop(_c.getchannel('A').getbbox())
CARTIMG = CARTIMG.resize((int(W * .3), int(CARTIMG.height * W * .3 / CARTIMG.width)), Image.LANCZOS)


def memory_cards():
    """Three polaroids from block C: the TV, the friend, the Saturday light."""
    room = BC.room_plate(BC.T_SAT + 3, BC.PIXIE_SIT).convert('RGB')
    crops = [(int(.74 * PW), int(.42 * PH), int(.99 * PW), int(.7 * PH)),        # the CRT
             (int(.12 * PW), int(.45 * PH), int(.66 * PW), int(1.0 * PH)),       # the two kids
             (int(.3 * PW), int(.0 * PH), int(.55 * PW), int(.3 * PH))]          # the window light
    cards = []
    for (x0, y0, x1, y1), lab in zip(crops, ('the TV', 'the friend', 'the afternoon')):
        im = room.crop((x0, y0, x1, y1)); im.thumbnail((Si(200), Si(150)))
        im = Image.blend(im, Image.new('RGB', im.size, (255, 200, 130)), .12)
        c = Image.new('RGBA', (im.width + Si(20), im.height + Si(46)), (250, 246, 236, 255)); c.paste(im, (Si(10), Si(10)))
        d = ImageDraw.Draw(c); d.text((S(12), im.height + S(16)), lab, font=F(18), fill=(70, 55, 40))
        cards.append(c)
    return cards


CARDS = memory_cards()


def frame_e23(t):
    fr = Image.new('RGB', (W, H), (14, 10, 12))
    fr = BB.dust(fr, t, seed=21)
    fr = CART.glow(fr, W / 2, H * .45, S(330), (255, 200, 120), .45)
    cx, cy = W / 2, H * .42
    fr = comp(fr, CARTIMG, cx - CARTIMG.width / 2, cy - CARTIMG.height / 2)
    d = ImageDraw.Draw(fr)
    if t < T_WANT:                                                      # E2: it can be rebuilt (blueprint outline)
        k = ease(min(1, (t - T_REMAKE) / 1.2))
        g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
        pad = S(30) + S(20) * k
        x0, y0 = cx - CARTIMG.width / 2 - pad, cy - CARTIMG.height / 2 - pad
        x1, y1 = cx + CARTIMG.width / 2 + pad, cy + CARTIMG.height / 2 + pad
        n = int(40 * k)
        for i in range(n):                                              # dashed blueprint frame drawing itself
            u0, u1 = i / 40, (i + .5) / 40
            for (ax, ay, bx, by) in ((x0, y0, x1, y0), (x1, y0, x1, y1), (x1, y1, x0, y1), (x0, y1, x0, y0)):
                gd.line((lin(ax, bx, u0), lin(ay, by, u0), lin(ax, bx, u1), lin(ay, by, u1)), fill=(120, 190, 255, 230), width=Si(3))
        lab = 'REMAKE'
        gd.text((cx - gd.textlength(lab, font=F(24)) / 2, y0 - S(36)), lab, font=F(24), fill=(120, 190, 255, int(255 * k)))
        fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    else:                                                               # E3: memories orbit, try to get in, bounce off
        for i, c in enumerate(CARDS):
            ang = (t - T_WANT) * .6 + i * 2 * math.pi / 3
            r = S(300)
            if t >= T_NEVER:                                            # dive in... and bounce off the cartridge
                u = (t - T_NEVER - i * .25)
                if 0 <= u < 1.1:
                    r = S(300) - S(170) * math.sin(min(1, u / 1.1) * math.pi)
                    if u > .5:
                        d.text((cx - S(10), cy - CARTIMG.height / 2 - S(60)), '', font=F(20))
            x = cx + r * math.cos(ang) * 1.25 - c.width / 2
            y = cy + r * .5 * math.sin(ang) - c.height / 2                  # stays above the subtitle zone
            cc = c.rotate(8 * math.sin(ang), expand=True, resample=Image.BICUBIC)
            fr = comp(fr, cc, x, y)
        if t >= T_NEVER + .5:                                           # the cartridge edge flashes where they bounce
            a = .5 + .5 * math.sin((t - T_NEVER) * 8)
            fr = CART.glow(fr, cx, cy, S(200), (255, 120, 90), .18 * a)
    d = ImageDraw.Draw(fr)
    lab = 'E2 "Nintendo can remake Ocarina of Time."' if t < T_WANT else 'E3 what people want back was never inside'
    tag(d, f'SEQ 10 THE PROBLEM · {lab} · BLOCK E v8 · PLANNING ONLY')
    PLANNING and d.text((S(20), S(40)), 'memories = block C stills (TV, the friend, the afternoon) · cartridge = own 3D', font=F(15), fill=(255, 220, 160))
    return fr


# ------------------------------------------------------------------ E4-E5: rebuilt (blueprint -> new) + the checklist
OLD = plate(('final', 'field'))                                       # final plate #11
place_hero = OLD.convert('RGBA'); place(place_hero, dict(art='quest_young_back', x=.66, y=.97, h=.42))   # young Quest #3
OLD = place_hero.convert('RGB')


def blueprint(img):
    """The painted plate (#11) has fine texture everywhere: edges are taken on a small, median-smoothed copy so only the
    shapes (hills, clouds, castle, road, fence, Quest) become lines; a faint blue duotone keeps the masses readable."""
    small = img.resize((480, 270), Image.LANCZOS).filter(ImageFilter.MedianFilter(7))
    e = small.convert('L').filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 16 else 0)
    e = e.resize(img.size, Image.BILINEAR).point(lambda v: 255 if v > 90 else 0)
    lum = np.asarray(img.convert('L').filter(ImageFilter.GaussianBlur(P(3)))).astype(np.float32) / 255
    bp = Image.fromarray(np.stack([18 + 30 * lum, 46 + 50 * lum, 92 + 70 * lum], -1).astype(np.uint8)); d = ImageDraw.Draw(bp)
    for gx in range(0, img.width, round(P(48))):
        d.line((gx, 0, gx, img.height), fill=(30, 66, 120))
    for gy in range(0, img.height, round(P(48))):
        d.line((0, gy, img.width, gy), fill=(30, 66, 120))
    bp.paste((170, 215, 255), (0, 0), e)
    return bp


def remastered(img):
    """'New visuals' preview: richer colour, light bloom, sharper. Planning only."""
    a = np.asarray(img).astype(np.float32)
    a = (a - 128) * 1.15 + 128; a[..., 1] *= 1.04
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    glow = im.filter(ImageFilter.GaussianBlur(P(18)))
    return Image.blend(im, glow, .18)


BP = blueprint(OLD)
NEW = remastered(OLD)
LIST_W = int(W * .4)


def checklist(fr, t):
    """Left column, a rolled parchment ticked off by pen as Bram names each item (approved style, family B); the hero
    walks on the right third, never under it."""
    k_in = ease(min(1, max(0, (t - T_LIST + .3) / .4)))
    ticks = [ease(min(1, max(0, (t - ti + .05) / .35))) if t >= ti - .05 else 0 for _, ti in ITEMS]
    g = UI.parchment_list([txt for txt, _ in ITEMS], ticks)
    out = fr.convert('RGBA'); out.alpha_composite(g, (int(S(22) - (g.width + S(60)) * (1 - k_in)), Si(104)))
    return out.convert('RGB')


def item_visual(fr, t):
    """A small visual for the item being said (right side, above the hero)."""
    cur = None
    for i, (txt, ti) in enumerate(ITEMS):
        if t >= ti - .05:
            cur = i
    if cur is None:
        return fr
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    cx, cy = W * .58, H * .36                                           # below the HUD buttons, left of the castle (#11)
    k = ease(min(1, (t - ITEMS[cur][1] + .05) / .3))
    if cur == 1:                                                        # voiced cutscenes: speech bubble + waveform
        d.rounded_rectangle((cx - S(120), cy - S(50), cx + S(120), cy + S(50)), S(22), fill=(250, 250, 250, int(235 * k)), outline=(30, 30, 40, 255), width=Si(3))
        for j in range(18):
            hh = S(8) + S(26) * abs(math.sin(t * 12 + j * .9))
            d.line((cx - S(95) + j * S(11), cy - hh / 2, cx - S(95) + j * S(11), cy + hh / 2), fill=(60, 120, 220, 255), width=Si(5))
    elif cur == 2:                                                      # expanded dialogue: a text box that grows
        w = 120 + 60 * k                                                # stays clear of the checklist
        bx = UI.sq_box(int(2 * w), 92)                                  # our game text box (family A), growing
        g.alpha_composite(bx, (int(cx - S(w) - S(8)), int(cy - S(46) - S(8))))
        for j in range(3):
            d.line((cx - S(w) + S(24), cy - S(22) + j * S(22), cx - S(w) + S(24) + S(2 * w - 48) * (1 if j < 2 else .6) * k, cy - S(22) + j * S(22)), fill=(240, 236, 220, 255), width=Si(6))
    elif cur == 3:                                                      # orchestral score: notes rise on the right only
        for j in range(8):
            ph = ((t - ITEMS[3][1]) * .7 + j / 8) % 1
            x = W * (.6 + .3 * ((j * .37) % 1)) + S(20) * math.sin(ph * 6 + j)
            y = H * (.5 - .4 * ph)
            d.text((x, y), '♪' if j % 2 else '♫', font=F(40 + (j % 3) * 8), fill=(255, 236, 170, int(255 * min(1, (1 - ph) * 2))),
                   stroke_width=Si(2), stroke_fill=(70, 45, 15))
    elif cur == 4:                                                      # modern controls + camera: a pad and an orbiting camera
        d.rounded_rectangle((cx - S(80), cy - S(30), cx + S(80), cy + S(34)), S(26), fill=(40, 42, 50, 240), outline=(200, 200, 210, 255), width=Si(3))
        d.ellipse((cx - S(52), cy - S(10), cx - S(28), cy + S(14)), fill=(160, 160, 170, 255)); d.ellipse((cx + S(26), cy - S(4), cx + S(50), cy + S(20)), fill=(160, 160, 170, 255))
        a = t * 2.4
        px, py = cx + S(140) * math.cos(a), cy + S(40) * math.sin(a)
        d.arc((cx - S(140), cy - S(40), cx + S(140), cy + S(40)), 0, 360, fill=(160, 200, 255, 160), width=Si(2))
        ci = camera_icon(rec=int(t * 2) % 2 == 0, width=int(84 + 18 * math.sin(a)))   # nearer = bigger as it orbits
        if math.sin(a) < 0:                                             # behind the pad on the far side of the orbit
            g.alpha_composite(ci, (int(px - ci.width / 2), int(py - ci.height / 2)))
            d.rounded_rectangle((cx - S(80), cy - S(30), cx + S(80), cy + S(34)), S(26), fill=(40, 42, 50, 240), outline=(200, 200, 210, 255), width=Si(3))
            d.ellipse((cx - S(52), cy - S(10), cx - S(28), cy + S(14)), fill=(160, 160, 170, 255)); d.ellipse((cx + S(26), cy - S(4), cx + S(50), cy + S(20)), fill=(160, 160, 170, 255))
        else:
            g.alpha_composite(ci, (int(px - ci.width / 2), int(py - ci.height / 2)))
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


def frame_e45(t):
    box = cam_box(((1.05, .5, .55), (1.15, .44, .58)), (t - T_SW2) / (T_END - T_SW2))   # castle right of the checklist, never behind it
    crop = lambda im: im.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)
    old, bp, new = crop(OLD), crop(BP), crop(NEW)
    # E4: old -> blueprint (quick), then a scan line rebuilds it; "New visuals" finishes the rebuild
    if t < T_SW2 + .5:
        fr = Image.blend(old, bp, ease((t - T_SW2) / .5))
    else:
        k = ease(min(1, (t - T_SW2 - .5) / (ITEMS[0][1] + .6 - T_SW2 - .5)))
        sx = int(W * k)
        fr = bp.copy(); fr.paste(new.crop((0, 0, sx, H)), (0, 0))
        if 0 < k < 1:
            d = ImageDraw.Draw(fr); d.line((sx, 0, sx, H), fill=(200, 240, 255), width=Si(4))
            fr = CART.glow(fr, sx, H / 2, S(200), (160, 220, 255), .35)
    hero_x = to_screen(.66, .6, box)
    fr = fairy_fx.draw(fr, [(T_SW2, .7, .5), (T_END, .68, .46)], t, size=.05)
    if t >= T_LIST - .3:
        fr = checklist(fr, t)
        fr = item_visual(fr, t)
    d = ImageDraw.Draw(fr)
    lab = 'E4 "rebuilt for Switch 2" (generic, no logos)' if t < T_LIST else 'E5 the feature list'
    tag(d, f'SEQ 11 THE REMAKE · {lab} · BLOCK E v8 · PLANNING ONLY')
    return fr


# ------------------------------------------------------------------ frame
def render(t):
    if t < T_REMAKE:
        fr = frame_e1(t)
    elif t < T_SW2:
        fr = frame_e23(t)
    else:
        fr = hud.draw(frame_e45(t), alpha=ease(min(1, max(0, (t - T_SW2 - .5) / 1.0))), t=t)   # the HUD returns as Hyrule is rebuilt
    d = ImageDraw.Draw(fr)
    subtitle(d, t)
    return fr


STILLS = (('e1', T0 + .8), ('e2', T_WANT - .3), ('e3', T_NEVER - .5), ('e3_bounce', T_NEVER + .8), ('e4', T_SW2 + 1.4),
          ('e5_visuals', ITEMS[0][1] + .4), ('e5_voiced', ITEMS[1][1] + .4), ('e5_dialogue', ITEMS[2][1] + .4),
          ('e5_score', ITEMS[3][1] + .5), ('e5_controls', ITEMS[4][1] + 1.0))


def main():
    out = out_path(ROOT / 'docs/ep002/EP002_blockE_animatic_v8.mp4')
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          *video_args(), *audio_args(), '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(out_path(ROOT / f'docs/ep002/blockE_v8_{name}.jpg'), quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer, 2026-10-04)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(out_path(ROOT / f'docs/ep002/blockE_v8_{name}.jpg'), quality=85)
        print('stills')
    else:
        main()
