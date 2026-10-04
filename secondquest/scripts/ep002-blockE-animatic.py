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

No console/brand logos are drawn for the new version (generic, labelled). Sounds: Bram only.
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
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, plate, place, cam_box, to_screen, subtitle, tag, F, cutout  # noqa
import fairy as fairy_fx  # noqa
import hud  # noqa: in-game HUD in every Hyrule shot (Producer)

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
    tag(d, 'SEQ 10 THE PROBLEM · E1 "Which creates a problem." · back to today · BLOCK E v4 · PLANNING ONLY')
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
        im = room.crop((x0, y0, x1, y1)); im.thumbnail((200, 150))
        im = Image.blend(im, Image.new('RGB', im.size, (255, 200, 130)), .12)
        c = Image.new('RGBA', (im.width + 20, im.height + 46), (250, 246, 236, 255)); c.paste(im, (10, 10))
        d = ImageDraw.Draw(c); d.text((12, im.height + 16), lab, font=F(18), fill=(70, 55, 40))
        cards.append(c)
    return cards


CARDS = memory_cards()


def frame_e23(t):
    fr = Image.new('RGB', (W, H), (14, 10, 12))
    fr = BB.dust(fr, t, seed=21)
    fr = CART.glow(fr, W / 2, H * .45, 330, (255, 200, 120), .45)
    cx, cy = W / 2, H * .42
    fr = comp(fr, CARTIMG, cx - CARTIMG.width / 2, cy - CARTIMG.height / 2)
    d = ImageDraw.Draw(fr)
    if t < T_WANT:                                                      # E2: it can be rebuilt (blueprint outline)
        k = ease(min(1, (t - T_REMAKE) / 1.2))
        g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
        pad = 30 + 20 * k
        x0, y0 = cx - CARTIMG.width / 2 - pad, cy - CARTIMG.height / 2 - pad
        x1, y1 = cx + CARTIMG.width / 2 + pad, cy + CARTIMG.height / 2 + pad
        n = int(40 * k)
        for i in range(n):                                              # dashed blueprint frame drawing itself
            u0, u1 = i / 40, (i + .5) / 40
            for (ax, ay, bx, by) in ((x0, y0, x1, y0), (x1, y0, x1, y1), (x1, y1, x0, y1), (x0, y1, x0, y0)):
                gd.line((lin(ax, bx, u0), lin(ay, by, u0), lin(ax, bx, u1), lin(ay, by, u1)), fill=(120, 190, 255, 230), width=3)
        lab = 'REMAKE'
        gd.text((cx - gd.textlength(lab, font=F(24)) / 2, y0 - 36), lab, font=F(24), fill=(120, 190, 255, int(255 * k)))
        fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    else:                                                               # E3: memories orbit, try to get in, bounce off
        for i, c in enumerate(CARDS):
            ang = (t - T_WANT) * .6 + i * 2 * math.pi / 3
            r = 300
            if t >= T_NEVER:                                            # dive in... and bounce off the cartridge
                u = (t - T_NEVER - i * .25)
                if 0 <= u < 1.1:
                    r = 300 - 170 * math.sin(min(1, u / 1.1) * math.pi)
                    if u > .5:
                        d.text((cx - 10, cy - CARTIMG.height / 2 - 60), '', font=F(20))
            x = cx + r * math.cos(ang) * 1.25 - c.width / 2
            y = cy + r * .5 * math.sin(ang) - c.height / 2                  # stays above the subtitle zone
            cc = c.rotate(8 * math.sin(ang), expand=True, resample=Image.BICUBIC)
            fr = comp(fr, cc, x, y)
        if t >= T_NEVER + .5:                                           # the cartridge edge flashes where they bounce
            a = .5 + .5 * math.sin((t - T_NEVER) * 8)
            fr = CART.glow(fr, cx, cy, 200, (255, 120, 90), .18 * a)
    d = ImageDraw.Draw(fr)
    lab = 'E2 "Nintendo can remake Ocarina of Time."' if t < T_WANT else 'E3 what people want back was never inside'
    tag(d, f'SEQ 10 THE PROBLEM · {lab} · BLOCK E v4 · PLANNING ONLY')
    d.text((20, 40), 'memories = block C stills (TV, the friend, the afternoon) · cartridge = own 3D', font=F(15), fill=(255, 220, 160))
    return fr


# ------------------------------------------------------------------ E4-E5: rebuilt (blueprint -> new) + the checklist
OLD = plate(('proc', 'field', (('time', 'day'), ('label', False), ('castle', '3d')))).convert('RGB')
place_hero = OLD.convert('RGBA'); place(place_hero, dict(char='quest:walking_back', costume='hero', x=.66, y=.97, h=.42, label=None))
OLD = place_hero.convert('RGB')


def blueprint(img):
    e = img.convert('L').filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 18 else 0)
    bp = Image.new('RGB', img.size, (18, 46, 92)); d = ImageDraw.Draw(bp)
    for gx in range(0, img.width, 48):
        d.line((gx, 0, gx, img.height), fill=(30, 66, 120))
    for gy in range(0, img.height, 48):
        d.line((0, gy, img.width, gy), fill=(30, 66, 120))
    bp.paste((170, 215, 255), (0, 0), e.filter(ImageFilter.MaxFilter(3)))
    return bp


def remastered(img):
    """'New visuals' preview: richer colour, light bloom, sharper. Planning only."""
    a = np.asarray(img).astype(np.float32)
    a = (a - 128) * 1.15 + 128; a[..., 1] *= 1.04
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    glow = im.filter(ImageFilter.GaussianBlur(18))
    return Image.blend(im, glow, .18)


BP = blueprint(OLD)
NEW = remastered(OLD)
LIST_W = int(W * .4)


def checklist(fr, t):
    """Left column; the hero walks on the right third, never under it."""
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    k_in = ease(min(1, max(0, (t - T_LIST + .3) / .4)))
    x0 = 40 - (LIST_W + 60) * (1 - k_in)
    d.rounded_rectangle((x0, 120, x0 + LIST_W, 120 + 64 * len(ITEMS) + 30), 14, fill=(12, 18, 30, 210), outline=(140, 180, 240, 255), width=2)
    for i, (txt, ti) in enumerate(ITEMS):
        y = 142 + i * 64                                                # below the HUD hearts
        on = t >= ti - .05
        kk = ease(min(1, max(0, (t - ti + .05) / .25)))
        d.rounded_rectangle((x0 + 18, y + 4, x0 + 46, y + 32), 5, outline=(160, 200, 255, 255), width=3)
        if on:
            d.line((x0 + 22, y + 18, x0 + 30, y + 27, x0 + 44, y + 6 + 22 * (1 - kk)), fill=(110, 230, 140, 255), width=5)
        d.text((x0 + 60, y + 2), txt, font=F(24), fill=(240, 245, 255, 255 if on else 120))
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


def item_visual(fr, t):
    """A small visual for the item being said (right side, above the hero)."""
    cur = None
    for i, (txt, ti) in enumerate(ITEMS):
        if t >= ti - .05:
            cur = i
    if cur is None:
        return fr
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    cx, cy = W * .7, H * .36                                            # below the HUD buttons
    k = ease(min(1, (t - ITEMS[cur][1] + .05) / .3))
    if cur == 1:                                                        # voiced cutscenes: speech bubble + waveform
        d.rounded_rectangle((cx - 120, cy - 50, cx + 120, cy + 50), 22, fill=(250, 250, 250, int(235 * k)), outline=(30, 30, 40, 255), width=3)
        for j in range(18):
            hh = 8 + 26 * abs(math.sin(t * 12 + j * .9))
            d.line((cx - 95 + j * 11, cy - hh / 2, cx - 95 + j * 11, cy + hh / 2), fill=(60, 120, 220, 255), width=5)
    elif cur == 2:                                                      # expanded dialogue: a text box that grows
        w = 120 + 140 * k
        d.rounded_rectangle((cx - w, cy - 46, cx + w, cy + 46), 10, fill=(20, 24, 60, 230), outline=(240, 240, 255, 255), width=3)
        for j in range(3):
            d.line((cx - w + 24, cy - 22 + j * 22, cx - w + 24 + (2 * w - 48) * (1 if j < 2 else .6) * k, cy - 22 + j * 22), fill=(230, 230, 255, 255), width=6)
    elif cur == 3:                                                      # orchestral score: notes rise on the right only
        for j in range(8):
            ph = ((t - ITEMS[3][1]) * .7 + j / 8) % 1
            x = W * (.6 + .3 * ((j * .37) % 1)) + 20 * math.sin(ph * 6 + j)
            y = H * (.5 - .4 * ph)
            d.text((x, y), '♪' if j % 2 else '♫', font=F(40 + (j % 3) * 8), fill=(255, 236, 170, int(255 * min(1, (1 - ph) * 2))),
                   stroke_width=2, stroke_fill=(70, 45, 15))
    elif cur == 4:                                                      # modern controls + camera: a pad and an orbiting camera
        d.rounded_rectangle((cx - 80, cy - 30, cx + 80, cy + 34), 26, fill=(40, 42, 50, 240), outline=(200, 200, 210, 255), width=3)
        d.ellipse((cx - 52, cy - 10, cx - 28, cy + 14), fill=(160, 160, 170, 255)); d.ellipse((cx + 26, cy - 4, cx + 50, cy + 20), fill=(160, 160, 170, 255))
        a = t * 2.4
        px, py = cx + 140 * math.cos(a), cy + 40 * math.sin(a)
        d.rectangle((px - 18, py - 12, px + 18, py + 12), fill=(230, 230, 240, 255)); d.polygon([(px + 18, py), (px + 32, py - 10), (px + 32, py + 10)], fill=(230, 230, 240, 255))
        d.arc((cx - 140, cy - 40, cx + 140, cy + 40), 0, 360, fill=(160, 200, 255, 160), width=2)
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
            d = ImageDraw.Draw(fr); d.line((sx, 0, sx, H), fill=(200, 240, 255), width=4)
            fr = CART.glow(fr, sx, H / 2, 200, (160, 220, 255), .35)
    hero_x = to_screen(.66, .6, box)
    fr = fairy_fx.draw(fr, [(T_SW2, .7, .5), (T_END, .68, .46)], t, size=.05)
    if t >= T_LIST - .3:
        fr = checklist(fr, t)
        fr = item_visual(fr, t)
    d = ImageDraw.Draw(fr)
    lab = 'E4 "rebuilt for Switch 2" (generic, no logos)' if t < T_LIST else 'E5 the feature list'
    tag(d, f'SEQ 11 THE REMAKE · {lab} · BLOCK E v4 · PLANNING ONLY')
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
    out = ROOT / 'docs/ep002/EP002_blockE_animatic_v4.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockE_v4_{name}.jpg', quality=85)
    joined = ROOT / 'docs/ep002/EP002_seq01_to_blockE_v4.mp4'
    lst = ROOT / 'renders/tmp/concat.txt'; lst.parent.mkdir(parents=True, exist_ok=True)
    lst.write_text(''.join(f"file '{ROOT / 'docs/ep002' / n}'\n" for n in ('EP002_cartridge_animatic_v12.mp4', 'EP002_blockB_animatic_v5.mp4',
                                                                          'EP002_blockC_animatic_v5.mp4', 'EP002_blockD_animatic_v5.mp4')) + f"file '{out}'\n")
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c:v', 'libx264', '-crf', '20', '-preset', 'medium',
                    '-c:a', 'aac', '-b:a', '160k', str(joined)], check=True)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s;', joined.relative_to(ROOT))


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockE_v4_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
