#!/usr/bin/env python3
"""EP002 animatic, block S (planning only): l137 "So... can you remake a memory?" ->
l144 "Or the exact version of you who walked into Hyrule for the first time." (block T starts on l145).

v1, "the blueprint that cannot copy it" (Producer, 2026-10-05: "Sí, constrúyelo así"). The Saturday room of 1998
(block C): warm afternoon, kid Quest and kid Pixie on the floor in front of the CRT.
  S1  "So... can you remake a memory?"  A blue REMAKE scan bar sweeps the room; behind it the room turns into a
                                        technical blueprint (cyan lines on blue).
  S2  "Probably not."                   A small error: CANNOT REMAKE A MEMORY? (the "?" wobbles).
  S3  "Nintendo cannot rebuild the room... the television. The Saturday afternoon. The friend sitting next to you."
                                        Each one is marked on the blueprint as it is named: a red X and CANNOT
                                        REBUILD - the room's outline, the CRT, the afternoon (a SAT 4:00 PM clock where
                                        the sunbeam was), Pixie.
  S4  "Or the exact version of you who walked into Hyrule for the first time."  The scan tries to trace kid Quest,
                                        glitches and fails: he stays in full colour, the only real thing in the blue
                                        blueprint - 1 OF 1.
HUD: hidden (real life). Stand-ins: the kids (#6). Sounds: none (all at the end). Free.
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
from lib import ROOT, W, H, PW, PH, FPS, T, ease, lin, subtitle, tag, F, cam_box, place  # noqa
import fairy as fairy_fx  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


C = load('blockC', 'scripts/ep002-blockC-animatic.py')           # the Saturday room of 1998, the kids
CART = C.CART

T0 = T('l137') - 0.05                   # block R ends here
T_SCAN0, T_SCAN1 = T('l137') + .1, T('l138.w5') + .3
T_NOT = T('l139') - .05                 # "Probably not."
T_MARKS = (('ROOM', T('l140.w5')), ('TELEVISION', T('l141.w5')), ('SATURDAY AFTERNOON', T('l142.w2')), ('FRIEND', T('l143.w2')))
T_YOU = T('l144') - .05                 # the scan tries him...
T_FAIL = T('l144.w6')                   # ..."you": it fails, he stays in colour
T_ONE = T('l144.w13')                   # "first (time)": 1 OF 1
T_END = T('l145') - 0.05                # block T starts on l145
INK = (20, 14, 18)
RED = (225, 45, 55)


# ------------------------------------------------------------------ the room: colour, blueprint, Quest alone
def _room_layers():
    base = C.BED.copy()
    tv = C.CRT_34.resize((C.tvw, int(C.CRT_34.height * C.TV_SCALE)), Image.LANCZOS)
    qs = [(x * C.TV_SCALE, y * C.TV_SCALE) for x, y in C.Q34]
    ms = np.asarray(Image.fromarray((C.M34 * 255).astype(np.uint8)).resize(tv.size, Image.NEAREST)) > 127
    xs = [p[0] for p in qs]; ys = [p[1] for p in qs]
    tv = C.fill_screen(tv, qs, ms, C.game_picture(C.T_SAT, (int(max(xs) - min(xs)), int(max(ys) - min(ys)))))
    base.alpha_composite(tv, C.TV_POS)
    base.alpha_composite(C.N64_IMG, C.N64_POS)
    place(base, C.PIXIE_SIT)
    q = Image.new('RGBA', base.size)
    place(q, C.QUEST_K)
    C.cable(base)
    full = base.copy(); full.alpha_composite(q)
    return full.convert('RGB'), q


def _warm(im, q_alpha=None):
    """Saturday, late afternoon (block C's grade): warm, a sunbeam across the floor."""
    im = Image.blend(im, Image.new('RGB', im.size, (255, 150, 70)), .2)
    g = Image.new('RGBA', im.size); d = ImageDraw.Draw(g)
    bx = .55 * PW
    d.polygon([(bx - 180, PH * .62), (bx + 90, PH * .62), (bx + 390, PH), (bx - 30, PH)], fill=(255, 190, 110, 70))
    return Image.alpha_composite(im.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(40))).convert('RGB')


def blueprint(im):
    g = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2GRAY)
    e = cv2.Canny(cv2.GaussianBlur(g, (5, 5), 0), 40, 110)
    e = cv2.dilate(e, np.ones((2, 2), np.uint8)) > 0
    out = np.zeros((*g.shape, 3), np.float32) + np.array([20, 56, 118], np.float32)
    out += (g[..., None] / 255.0) * np.array([20, 40, 60], np.float32)        # faint shading so the shapes still read
    yy, xx = np.mgrid[0:g.shape[0], 0:g.shape[1]]
    grid = (yy % 48 == 0) | (xx % 48 == 0)
    out[grid] = out[grid] * .7 + np.array([90, 140, 200]) * .3
    out[e] = (165, 225, 255)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


FULL, QLAYER = _room_layers()
COLOR = _warm(FULL)
BP = blueprint(COLOR)
QCOL = Image.composite(COLOR, Image.new('RGB', COLOR.size), QLAYER.getchannel('A'))   # Quest in the warm colour
QCOL = QCOL.convert('RGBA'); QCOL.putalpha(QLAYER.getchannel('A'))
QBOX = QLAYER.getchannel('A').getbbox()

CAM = ((1.06, .52, .55), (1.1, .52, .56))                                          # TV whole on the right, both kids whole


def cam(t):
    return cam_box(CAM, min(1, max(0, (t - T0) / (T_END - T0))))


def crop(im, box):
    return im.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)


def to_fr(px, py, box):
    return (px - box[0]) * W / (box[2] - box[0]), (py - box[1]) * H / (box[3] - box[1])


# ------------------------------------------------------------------ marks
def fade(im, k):
    im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * k))); return im


def rebuild_tag(fr, x, y, text, k, ok=False):
    f = F(20)
    tw = int(ImageDraw.Draw(Image.new('RGB', (1, 1))).textlength(text, font=f))
    sub = '1 OF 1' if ok else ('CANNOT TRACE' if text.startswith('YOU') else 'CANNOT REBUILD')
    sw = int(ImageDraw.Draw(Image.new('RGB', (1, 1))).textlength(sub, font=F(16)))
    w = max(tw, sw) + 64
    g = Image.new('RGBA', (w, 62)); d = ImageDraw.Draw(g)
    col = (255, 214, 40) if ok else RED
    d.rounded_rectangle((2, 2, w - 3, 59), 8, fill=(14, 18, 34, 235), outline=col + (255,), width=3)
    if ok:
        d.ellipse((12, 17, 40, 45), outline=col + (255,), width=4)
    else:
        d.line((14, 18, 38, 44), fill=col + (255,), width=5); d.line((38, 18, 14, 44), fill=col + (255,), width=5)
    d.text((52, 6), text, font=f, fill=(255, 255, 255, 255))
    d.text((52, 34), sub, font=F(16), fill=col + (255,))
    sc = 1.25 - .25 * ease(k)
    g = g.resize((int(g.width * sc), int(g.height * sc)), Image.LANCZOS)
    x = min(max(x, 24), W - g.width - 24); y = min(max(y, 46), H * .72 - g.height)
    return C.comp(fr, fade(g, k), x, y)


def big_x(d, x0, y0, x1, y1, k):
    if k <= 0:
        return
    m = (x0 + x1) / 2, (y0 + y1) / 2
    for (ax, ay, bx, by) in ((x0, y0, x1, y1), (x1, y0, x0, y1)):
        d.line((ax, ay, lin(ax, bx, k), lin(ay, by, k)), fill=RED, width=9)
    d.rectangle((x0, y0, x1, y1), outline=RED, width=4)


def clock(fr, cx, cy, k):
    """SAT 4:00 PM, where the sunbeam was."""
    g = Image.new('RGBA', (210, 210)); d = ImageDraw.Draw(g)
    d.ellipse((10, 10, 200, 200), fill=(14, 18, 34, 230), outline=(165, 225, 255, 255), width=5)
    for i in range(12):
        a = i * math.pi / 6
        d.line((105 + 80 * math.cos(a), 105 + 80 * math.sin(a), 105 + 90 * math.cos(a), 105 + 90 * math.sin(a)), fill=(165, 225, 255, 255), width=4)
    d.line((105, 105, 105 + 45 * math.cos(math.pi / 6), 105 + 45 * math.sin(math.pi / 6)), fill=(255, 255, 255, 255), width=7)   # 4 o'clock
    d.line((105, 105, 105, 35), fill=(255, 255, 255, 255), width=5)
    d.text((105 - d.textlength('SAT', font=F(22)) / 2, 130), 'SAT', font=F(22), fill=(255, 214, 40, 255))
    g = g.resize((int(150 * (.6 + .4 * ease(k))),) * 2, Image.LANCZOS)
    return C.comp(fr, g, cx - g.width / 2, cy - g.height / 2)


# ------------------------------------------------------------------ render
def render(t):
    box = cam(t)
    col, bp = crop(COLOR, box), crop(BP, box)
    ks = (t - T_SCAN0) / (T_SCAN1 - T_SCAN0)
    if ks <= 0:
        fr = col
    elif ks < 1:                                                               # S1: the REMAKE scan
        sx = int(W * ease(ks))
        fr = col.copy(); fr.paste(bp.crop((0, 0, sx, H)), (0, 0))
        g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
        gd.rectangle((sx - 40, 0, sx + 6, H), fill=(120, 200, 255, 90)); gd.line((sx, 0, sx, H), fill=(210, 245, 255, 255), width=5)
        fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
        d = ImageDraw.Draw(fr)
        d.text((min(sx + 14, W - 140), H * .10), 'REMAKE', font=F(26), fill=(210, 245, 255), stroke_width=4, stroke_fill=INK)
    else:
        fr = bp.copy()
    # S4: the scan cannot trace him - he stays in colour
    kq = min(1, max(0, (t - T_FAIL) / .4))
    qx0, qy0 = to_fr(QBOX[0], QBOX[1], box); qx1, qy1 = to_fr(QBOX[2], QBOX[3], box)
    if T_YOU <= t < T_FAIL + .4:                                               # it tries: a glitch over him
        qc = crop(QCOL, box)
        on = int((t - T_YOU) * 14) % 3 == 0 or kq > 0
        if on:
            sl = qc.copy()
            off = int(18 * math.sin(t * 40)) if kq < 1 else 0
            fr = C.comp(fr, sl, off, 0)
        d = ImageDraw.Draw(fr)
        yb = lin(qy1, qy0, ((t - T_YOU) * 1.6) % 1)
        d.line((qx0 - 20, yb, qx1 + 20, yb), fill=(210, 245, 255), width=4)
    if t >= T_FAIL:
        fr = C.comp(fr, crop(QCOL, box), 0, 0)
        fr = CART.glow(fr, (qx0 + qx1) / 2, (qy0 + qy1) / 2, int((qx1 - qx0) * .9), (255, 214, 140), .25 * kq)
    # S2: Probably not
    ke = min(1, max(0, (t - T_NOT) / .25)) * (1 - min(1, max(0, (t - T_MARKS[0][1] + .6) / .3)))
    if ke > 0:
        g = Image.new('RGBA', (560, 92)); gd = ImageDraw.Draw(g)
        gd.rounded_rectangle((3, 3, 556, 88), 10, fill=(14, 18, 34, 235), outline=RED + (255,), width=4)
        gd.text((22, 10), 'ERROR', font=F(20), fill=RED + (255,))
        s = 'CANNOT REMAKE A MEMORY'; gd.text((22, 40), s, font=F(30), fill=(255, 255, 255, 255))
        qx = 22 + gd.textlength(s, font=F(30)) + 6
        gd.text((qx, 38 + 4 * math.sin(t * 9)), '?', font=F(34), fill=(255, 214, 40, 255))
        g = g.rotate(3 * math.sin(t * 5), resample=Image.BICUBIC, expand=True)
        fr = C.comp(fr, fade(g, ke), W / 2 - g.width / 2, H * .12)
    # S3: the marks, each on its word (they stay)
    for name, tm in T_MARKS:
        k = min(1, max(0, (t - tm + .1) / .3))
        if k <= 0:
            continue
        d = ImageDraw.Draw(fr)
        if name == 'ROOM':
            big_x(d, W * .03, H * .07, W * .97, H * .93, 0)
            d.rectangle((W * .025, H * .065, W * .975, H * .935), outline=RED, width=5)
            fr = rebuild_tag(fr, W * .04, H * .09, 'THE ROOM', k)
        elif name == 'TELEVISION':
            x0, y0 = to_fr(C.TV_BOX[0] * PW, (C.TV_BOX[1] - .02) * PH, box); x1, y1 = to_fr(C.TV_BOX[2] * PW, C.TV_BOX[3] * PH, box)
            big_x(d, x0, y0, x1, y1, k)
            fr = rebuild_tag(fr, W * .70, y0 - 80, 'THE TELEVISION', k)
        elif name == 'SATURDAY AFTERNOON':
            cx, cy = W * .40, H * .21
            fr = clock(fr, cx, cy, k)
            big_x(ImageDraw.Draw(fr), cx - 42, cy - 42, cx + 42, cy + 42, k)
            fr = rebuild_tag(fr, cx + 62, cy - 34, 'SATURDAY AFTERNOON', k)
        elif name == 'FRIEND':
            ph = C.PIXIE_SIT['h'] * PH
            px0, py0 = to_fr(C.PIXIE_SIT['x'] * PW - ph * .32, C.PIXIE_SIT['y'] * PH - ph, box)
            px1, py1 = to_fr(C.PIXIE_SIT['x'] * PW + ph * .32, min(PH, C.PIXIE_SIT['y'] * PH), box)
            cxp, cyp, r = (px0 + px1) / 2, py0 + (py1 - py0) * .34, (px1 - px0) * .30     # a red ring and a strike over her
            d.ellipse((cxp - r, cyp - r * 1.25, cxp + r, cyp + r * 1.25), outline=RED, width=6)
            d.line((cxp - r * .7, cyp + r * .9, lin(cxp - r * .7, cxp + r * .7, k), lin(cyp + r * .9, cyp - r * .9, k)), fill=RED, width=9)
            fr = rebuild_tag(fr, cxp + r + 8, cyp - r * .4, 'THE FRIEND', k)
    if t >= T_FAIL:                                                            # the one thing it cannot trace
        ko = min(1, max(0, (t - T_ONE + .2) / .3))
        fr = rebuild_tag(fr, W * .04, qy0 - 80, 'YOU, 1998', max(.01, min(1, (t - T_FAIL) / .3)), ok=ko > 0)
    if t < T0 + .3:                                                            # out of Hyrule: a soft white cut
        fr = Image.blend(Image.new('RGB', (W, H), (250, 246, 236)), fr, (t - T0) / .3)
    lab = ('S1 can you remake a memory?' if t < T_NOT else 'S2 probably not' if t < T_MARKS[0][1] - .5
           else 'S3 cannot rebuild' if t < T_YOU else 'S4 the exact version of you')
    keys = [(T0, .60, .40), (T_NOT, .55, .30), (T_YOU, .45, .45), (T_END, .40, .40)]
    fr = fairy_fx.draw(fr, keys, t, size=.04)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 25 CANNOT REBUILD · {lab} · BLOCK S v1 · PLANNING ONLY')
    lab2 = 'MISSING · young Quest / young Pixie (#6) · planning stand-ins'
    tw = d.textlength(lab2, font=F(13)); d.rectangle((W * .03, H * .935, W * .03 + tw + 12, H * .935 + 20), fill=(150, 20, 30)); d.text((W * .03 + 6, H * .935 + 2), lab2, font=F(13), fill=(255, 235, 235))
    subtitle(d, t)
    return fr


STILLS = (('s1', (T_SCAN0 + T_SCAN1) / 2), ('s2', T_NOT + .5), ('s3a', T_MARKS[1][1] + .5), ('s3', T_MARKS[3][1] + .8),
          ('s4a', T_YOU + .5), ('s4', T_END - .3))


def main():
    out = ROOT / 'docs/ep002/EP002_blockS_animatic_v1.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockS_v1_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockS_v1_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
