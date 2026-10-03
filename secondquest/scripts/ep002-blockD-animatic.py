#!/usr/bin/env python3
"""EP002 animatic, block D (planning only): l17 "For some players, walking into Hyrule Field felt enormous." ->
l27 "...the world might continue forever."

  D1  "...Hyrule Field felt enormous."        Young Hero Quest looks up in awe; the camera pulls out until he is tiny.
  D2  "Not because it actually was."          Keep pulling out: the whole field is a small tile, measured "actual size".
  D3  "Because you were smaller."             Back in the field: young Quest walks, his adult outline beside him.
  D4  "And memory is very good at preserving feelings..."   The same view, warm and soft like a memory.
  D5  "...terrible at preserving technical specifications."  A spec card slides in and crumbles to dust.
  D6  "Nobody wakes up thinking: Man... I really miss Nintendo 64 texture filtering."
                                              Quest wakes up in bed; his thought bubble is a smeared N64 texture.
  D7  "You remember the forest."              Forest (MISSING plate), young Quest + Navi.
  D8  "The music."                            Same forest, the camera keeps going; notes rise.
  D9  "The castle in the distance."           Field: push in to the tiny castle on the horizon.
  D10 "That strange feeling... might continue forever."  The camera comes back down the same path (continuous);
                                              young Quest keeps walking while the world keeps coming: forever.

Young Hero Quest = MISSING young Hero-of-Time outfit (planning: recoloured current pose, young scale).
Sounds: Bram only. Framing checked with scripts/animatic/framing_qc.py before sending.
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

FF = imageio_ffmpeg.get_ffmpeg_exe()
spec = importlib.util.spec_from_file_location('cart', ROOT / 'scripts/ep002-cartridge-animatic.py')
CART = importlib.util.module_from_spec(spec); spec.loader.exec_module(CART)
spec = importlib.util.spec_from_file_location('blockB', ROOT / 'scripts/ep002-blockB-animatic.py')
BB = importlib.util.module_from_spec(spec); spec.loader.exec_module(BB)

T0 = T('l17') - 0.05
T_NOT, T_SMALL, T_MEM, T_SPEC = T('l18') - .05, T('l19') - .05, T('l20') - .05, T('l21') - .05
T_TERR = T('l21.w4')                   # "terrible"
T_WAKE, T_MAN = T('l22') - .05, T('l23') - .05
T_FOREST, T_MUSIC, T_CASTLE, T_FOREVER = T('l24') - .05, T('l25') - .05, T('l26') - .05, T('l27') - .05
T_KEEP = T('l27.w8')                   # "kept walking"
T_END = T('l28') - 0.05                # block E starts on l28 "Which creates a problem."

FIELD = plate(('proc', 'field', (('time', 'day'),))).convert('RGBA')
FOREST = plate(('proc', 'forest')).convert('RGBA')
BED = Image.open(ROOT / 'public/art/core/backgrounds/quest_bedroom_morning.png').convert('RGB').resize((PW, PH), Image.LANCZOS)
CASTLE = (980 / PW, .5)                # the tiny castle on the field plate's horizon


def comp(fr, im, x, y):
    base = fr.convert('RGBA'); base.alpha_composite(im, (int(x), int(y))); return base.convert('RGB')


def keyed(keys, t):
    """Camera (zoom, x, y) through eased keys; holds outside them."""
    if t <= keys[0][0]:
        return keys[0][1]
    for (ta, a), (tb, b) in zip(keys, keys[1:]):
        if t <= tb:
            k = ease(max(0, (t - ta) / (tb - ta)))
            return (a[0] * (b[0] / a[0]) ** k, lin(a[1], b[1], k), lin(a[2], b[2], k))
    return keys[-1][1]


def shoot(img, cam):
    box = cam_box((cam, cam), 0)
    return img.convert('RGB').crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR), box


def navi(fr, box, keys, t, size=.06):
    kk = [(a, *(v / s for v, s in zip(to_screen(x, y, box), (W, H)))) for a, x, y in keys]
    return fairy_fx.draw(fr, kk, t, size=size)


HERO_AWE = dict(char='quest:looking_up_awe', costume='hero', young=True, x=.36, y=.97, h=.62)
HERO_WALK = dict(char='quest:walking_back', costume='hero', young=True, x=.47, y=.97, h=.62)


# ------------------------------------------------------------------ D1-D2: enormous / actual size
F_AWE = FIELD.copy(); place(F_AWE, HERO_AWE)


def frame_d12(t):
    cam = keyed([(T0, (1.7, .38, .71)), (T_NOT, (1.0, .5, .5))], t)   # headroom above the awe-struck face
    fr, box = shoot(F_AWE, cam)
    fr = navi(fr, box, [(T0, .44, .5), (T0 + 1.8, .3, .46), (T_NOT, .42, .42)], t)
    if t >= T_NOT:                                                      # keep pulling out: the field is a small tile
        k = ease(min(1, (t - T_NOT) / 1.1))
        bg = Image.new('RGB', (W, H), (20, 26, 40)); d = ImageDraw.Draw(bg)
        for gx in range(0, W, 40):
            d.line((gx, 0, gx, H), fill=(32, 40, 60))
        for gy in range(0, H, 40):
            d.line((0, gy, W, gy), fill=(32, 40, 60))
        s = lin(1.0, .42, k)
        tile = fr.resize((int(W * s), int(H * s)), Image.LANCZOS)
        x0, y0 = (W - tile.width) / 2, (H - tile.height) / 2 - 20 * k + 40 * k
        bg.paste(tile, (int(x0), int(y0)))
        d = ImageDraw.Draw(bg)
        d.rectangle((x0, y0, x0 + tile.width, y0 + tile.height), outline=(230, 230, 240), width=3)
        if k > .7:                                                      # the measure
            a = (k - .7) / .3; c = tuple(int(v * a) for v in (255, 220, 120))
            yb = y0 - 22                                                # measure above the tile, clear of the subtitles
            d.line((x0, yb, x0 + tile.width, yb), fill=c, width=3)
            for xe in (x0, x0 + tile.width):
                d.line((xe, yb - 10, xe, yb + 10), fill=c, width=3)
            lab = 'ACTUAL SIZE'
            d.text((W / 2 - d.textlength(lab, font=F(26)) / 2, yb - 42), lab, font=F(26), fill=c)
        fr = bg
    d = ImageDraw.Draw(fr)
    tag(d, 'SEQ 07 BECAUSE YOU WERE SMALLER · ' + ('D1 "felt enormous"' if t < T_NOT else 'D2 "Not because it actually was."') + ' · BLOCK D v1 · PLANNING ONLY')
    return fr


# ------------------------------------------------------------------ D3-D5: smaller / memory / specs (same field, continuous)
F_WALK = FIELD.copy(); place(F_WALK, HERO_WALK)
ADULT = cutout('quest:walking_back', 'hero')


def ghost(base, t):
    """The adult outline beside the child (how big he is now)."""
    h = int(HERO_WALK['h'] * PH); im = ADULT.resize((int(ADULT.width * h / ADULT.height), h), Image.LANCZOS)
    a = np.asarray(im.getchannel('A')) > 40
    edge = a & ~np.asarray(Image.fromarray(a.astype(np.uint8) * 255).filter(ImageFilter.MinFilter(9))).astype(bool)
    lay = np.zeros((im.height, im.width, 4), np.uint8)
    lay[a] = (255, 255, 255, 45); lay[edge] = (255, 255, 255, 220)
    k = ease(min(1, (t - T('l19.w4') + .1) / .4))
    lay[..., 3] = (lay[..., 3] * k).astype(np.uint8)
    g = Image.fromarray(lay, 'RGBA')
    base.alpha_composite(g, (int(.6 * PW - g.width / 2), int(.97 * PH - g.height)))


SPEC_LINES = ['NINTENDO 64 · 1996', 'CPU  93.75 MHz', 'RAM  4 MB', 'RESOLUTION  320 x 240', 'TEXTURES  4 KB cache · bilinear filtering']


def spec_card(fr, t):
    k_in = ease(min(1, max(0, (t - T_SPEC) / .45)))
    crumble = min(1, max(0, (t - T_TERR) / 2.4))
    if k_in <= 0 or crumble >= 1:
        return fr
    card = Image.new('RGBA', (640, 250)); d = ImageDraw.Draw(card)
    d.rounded_rectangle((0, 0, 639, 249), 14, fill=(18, 22, 34, 235), outline=(150, 170, 220, 255), width=3)
    for i, ln in enumerate(SPEC_LINES):
        d.text((26, 22 + i * 44), ln, font=F(23 if i else 26), fill=(255, 220, 120) if i == 0 else (220, 230, 255))
    if crumble > 0:                                                     # the specs fall apart: pixels drift and fade
        a = np.asarray(card).copy(); hh, ww = a.shape[:2]
        rng = np.random.default_rng(4)
        thr = rng.random((hh // 6 + 1, ww // 6 + 1)).repeat(6, 0).repeat(6, 1)[:hh, :ww]
        gone = thr < crumble * 1.15 - (np.arange(ww)[None, :] / ww) * .15
        a[gone, 3] = 0
        card = Image.fromarray(a, 'RGBA')
        dust = Image.new('RGBA', card.size); dd = ImageDraw.Draw(dust)
        for i in range(160):
            x, y = rng.random() * ww, rng.random() * hh
            if thr[int(y), int(x)] < crumble * 1.15:
                dx = (crumble * 140) * (0.5 + rng.random()); dy = -(crumble * 90) * rng.random()
                dd.rectangle((x + dx, y + dy, x + dx + 3, y + dy + 3), fill=(220, 230, 255, int(200 * (1 - crumble))))
        card.alpha_composite(dust)
    x = W - 700 + 760 * (1 - k_in)
    return comp(fr, card, x, 70)


def frame_d345(t):
    keys = [(T_SMALL, (1.25, .5, .62)), (T_MEM, (1.3, .5, .6)), (T_WAKE, (1.42, .5, .58))]
    cam = keyed(keys, t)
    base = F_WALK.copy()
    if t >= T('l19.w4') - .1:
        ghost(base, t)
    fr, box = shoot(base, cam)
    fr = navi(fr, box, [(T_SMALL, .55, .55), (T_MEM, .52, .5), (T_WAKE, .54, .48)], t)
    warm = ease(min(1, max(0, (t - T_MEM) / .8)))
    if warm > 0:                                                        # memory: warm, soft, glowing edges
        soft = fr.filter(ImageFilter.GaussianBlur(6))
        yy, xx = np.mgrid[0:H, 0:W]; r = np.sqrt(((xx / W - .5) * 1.3) ** 2 + (yy / H - .55) ** 2)
        m = Image.fromarray((np.clip((r - .25) / .35, 0, 1) * 255 * warm).astype(np.uint8))
        fr = Image.composite(soft, fr, m)
        fr = Image.blend(fr, Image.new('RGB', fr.size, (255, 190, 110)), .14 * warm)
        fr = CART.glow(fr, W * .5, H * .35, 520, (255, 220, 160), .25 * warm)
        fr = BB.dust(fr, t, seed=11)
    fr = spec_card(fr, t)
    d = ImageDraw.Draw(fr)
    lab = ('D3 "Because you were smaller." · outline = adult Quest' if t < T_MEM else 'D4 memory keeps the feelings' if t < T_SPEC
           else 'D5 ...and drops the specifications')
    tag(d, f'SEQ 07-08 · {lab} · BLOCK D v1 · PLANNING ONLY')
    return fr


# ------------------------------------------------------------------ D6: nobody wakes up thinking...
BEDSOFT = Image.blend(BED.filter(ImageFilter.GaussianBlur(10)), Image.new('RGB', (PW, PH), (40, 30, 30)), .25).convert('RGBA')
place(BEDSOFT, dict(char='quest:bed_awake', x=.36, y=.95, h=.7, label=None))
SMEAR = None


def n64_texture(size):
    """A low-res texture blown up with soft (bilinear) filtering: the famous N64 smear."""
    rng = np.random.default_rng(7)
    a = np.zeros((8, 8, 3), np.uint8)
    for i in range(8):
        for j in range(8):
            a[i, j] = (90, 140, 60) if (i // 2 + j // 2) % 2 else (130, 95, 60)
            a[i, j] = np.clip(a[i, j].astype(int) + rng.integers(-25, 25, 3), 0, 255)
    return Image.fromarray(a).resize(size, Image.BILINEAR).filter(ImageFilter.GaussianBlur(2))


def frame_d6(t):
    cam = keyed([(T_WAKE, (1.15, .45, .55)), (T_FOREST, (1.3, .46, .52))], t)
    fr, box = shoot(BEDSOFT, cam)
    k = ease(min(1, max(0, (t - T_MAN + .1) / .35)))
    if k > 0:                                                           # thought bubble
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        cx, cy, rw, rh = W * .72, H * .33, 230 * k, 150 * k
        for i, (bx, by, br) in enumerate(((W * .5, H * .5, 10), (W * .55, H * .44, 16), (W * .6, H * .4, 22))):
            if k > .3 * i:
                d.ellipse((bx - br, by - br, bx + br, by + br), fill=(250, 250, 250, 245), outline=(30, 30, 40, 255), width=3)
        d.ellipse((cx - rw, cy - rh, cx + rw, cy + rh), fill=(250, 250, 250, 245), outline=(30, 30, 40, 255), width=4)
        fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
        if k > .6:
            tex = n64_texture((int(260 * k), int(150 * k)))
            m = Image.new('L', tex.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, tex.width - 1, tex.height - 1), 16, fill=255)
            fr.paste(tex, (int(cx - tex.width / 2), int(cy - tex.height / 2 - 10)), m)
            d = ImageDraw.Draw(fr); lab = 'N64 texture filtering'
            d.text((cx - d.textlength(lab, font=F(18)) / 2, cy + tex.height / 2 - 2), lab, font=F(18), fill=(40, 40, 50))
    d = ImageDraw.Draw(fr)
    tag(d, 'SEQ 08 MEMORY VS SPECS · D6 "Nobody wakes up thinking..." · BLOCK D v1 · PLANNING ONLY')
    return fr


# ------------------------------------------------------------------ D7-D8: forest + music (same background, continuous)
F_FOREST = FOREST.copy(); place(F_FOREST, dict(HERO_WALK, x=.5, y=.97))


def frame_d78(t):
    cam = keyed([(T_FOREST, (1.08, .5, .55)), (T_MUSIC, (1.18, .5, .58)), (T_CASTLE, (1.26, .5, .6))], t)
    fr, box = shoot(F_FOREST, cam)
    fr = navi(fr, box, [(T_FOREST, .56, .55), (T_MUSIC, .52, .5), (T_CASTLE, .55, .48)], t)
    if t >= T_MUSIC - .05:
        fr = BB.notes(fr, t, T_MUSIC - .05, (W * .55, H * .65))
    d = ImageDraw.Draw(fr)
    tag(d, 'SEQ 09 WHAT YOU REMEMBER · ' + ('D7 the forest' if t < T_MUSIC else 'D8 the music') + ' · BLOCK D v1 · PLANNING ONLY')
    return fr


# ------------------------------------------------------------------ D9-D10: castle, then forever (same field, continuous)
F_ROAD = FIELD.copy(); place(F_ROAD, dict(HERO_WALK, x=.5, y=.99, h=.5))


HERO_SCR = None


def hero_screen(fr, t):
    """Young Quest walking, drawn in screen space: feet inside title-safe, constant size while the world keeps coming."""
    global HERO_SCR
    if HERO_SCR is None:
        im = cutout('quest:walking_back', 'hero'); h = int(H * .42)
        HERO_SCR = im.resize((int(im.width * h / im.height), h), Image.LANCZOS)
    rise = ease(min(1, max(0, (t - T_FOREVER - .2) / 1.4)))           # walks up into the shot as the camera comes down
    y = H * .93 - HERO_SCR.height + (1 - rise) * H * .5 + 4 * math.sin(t * 9)
    fr = comp(fr, HERO_SCR, W / 2 - HERO_SCR.width / 2, y)
    d = ImageDraw.Draw(fr); lab = 'MISSING · Hero-of-Time outfit · young'
    d.rectangle((W / 2 - 150, y - 24, W / 2 + 150, y - 4), fill=(120, 20, 20)); d.text((W / 2 - 142, y - 22), lab, font=F(14), fill=(255, 220, 220))
    return fr


def frame_d910(t):
    keys = [(T_CASTLE, (1.15, .5, .6)), (T_FOREVER - .1, (2.6, CASTLE[0], CASTLE[1] - .02)), (T_FOREVER + 1.6, (1.25, .5, .6))]
    cam = keyed(keys, t)
    if t > T_FOREVER + 1.6:                                             # "kept walking": the world keeps coming, forever
        k = (t - T_FOREVER - 1.6) / (T_END - T_FOREVER - 1.6)
        cam = (1.25 * (1 + .6 * k), .5, lin(.6, .55, k))
    fr, box = shoot(FIELD, cam)
    if t >= T_FOREVER:
        fr = hero_screen(fr, t)
    fr = navi(fr, box, [(T_FOREVER, .53, .6), (T_FOREVER + 1.6, .55, .57), (T_END, .51, .52)], t)
    if T_CASTLE <= t < T_FOREVER:
        fr = CART.glow(fr, *to_screen(CASTLE[0], CASTLE[1] - .04, box), 120, (255, 240, 200), .35)
    if t > T_END - .5:
        fr = Image.blend(fr, Image.new('RGB', fr.size, (10, 8, 10)), (t - T_END + .5) / .5 * .6)
    d = ImageDraw.Draw(fr)
    tag(d, 'SEQ 09 · ' + ('D9 "The castle in the distance."' if t < T_FOREVER else 'D10 "...the world might continue forever."') + ' · BLOCK D v1 · PLANNING ONLY')
    return fr


# ------------------------------------------------------------------ frame
def render(t):
    if t < T_SMALL:
        fr = frame_d12(t)
    elif t < T_WAKE:
        fr = frame_d345(t)
    elif t < T_FOREST:
        fr = frame_d6(t)
    elif t < T_CASTLE:
        fr = frame_d78(t)
    else:
        fr = frame_d910(t)
    d = ImageDraw.Draw(fr)
    subtitle(d, t)
    return fr


STILLS = (('d1', T0 + 1.0), ('d2', T_SMALL - .3), ('d3', T_MEM - .4), ('d4', T_SPEC - .5), ('d5', T_TERR + .6), ('d6', T('l23.w8')),
          ('d7', T_MUSIC - .2), ('d8', T_CASTLE - .3), ('d9', T_FOREVER - .2), ('d10', T_END - 1.0))


def main():
    out = ROOT / 'docs/ep002/EP002_blockD_animatic_v1.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockD_v1_{name}.jpg', quality=85)
    joined = ROOT / 'docs/ep002/EP002_seq01_to_blockD_v1.mp4'
    lst = ROOT / 'renders/tmp/concat.txt'; lst.parent.mkdir(parents=True, exist_ok=True)
    lst.write_text(''.join(f"file '{ROOT / 'docs/ep002' / n}'\n" for n in ('EP002_cartridge_animatic_v12.mp4', 'EP002_blockB_animatic_v4.mp4',
                                                                          'EP002_blockC_animatic_v5.mp4')) + f"file '{out}'\n")
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c:v', 'libx264', '-crf', '20', '-preset', 'medium',
                    '-c:a', 'aac', '-b:a', '160k', str(joined)], check=True)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s;', joined.relative_to(ROOT))


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockD_v1_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
