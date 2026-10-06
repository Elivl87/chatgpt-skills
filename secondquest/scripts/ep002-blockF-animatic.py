#!/usr/bin/env python3
"""EP002 animatic, block F (planning only): l38 "On paper, the job sounds easy." -> l47 "But familiar is not measurable."

All on one notebook page (same background, the camera keeps drifting: no snap back):
  F1  "On paper, the job sounds easy."              A plan written on paper: 1. take the beloved game 2. make it better.
  F2  "Take something beloved... and make everything better."   The ocarina (own 3D) with a heart; arrows: BETTER.
  F3  "Except that is where remakes become dangerous."  Caution tape slides across the page; Navi turns warning-yellow.
  F4  "Because better is measurable."               Chart axes draw themselves.
  F5  "More polygons. Better lighting. Better animation. Better sound."  One bar rises on each word, with its icon.
  F6  "But familiar is not measurable."             The last slot: the kids' afternoon (block C) - the ruler reads "???".

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
from lib import ROOT, W, H, FPS, T, ease, lin, subtitle, tag, F, S, Si, P, out_path, video_args, audio_args  # noqa
import fairy as fairy_fx  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BE = load('blockE', 'scripts/ep002-blockE-animatic.py')

T0 = BE.T_END
T_BELOVED, T_BETTER, T_DANGER, T_MEAS = T('l39') - .05, T('l40') - .05, T('l41') - .05, T('l42') - .05
BARS = [('POLYGONS', T('l43')), ('LIGHTING', T('l44')), ('ANIMATION', T('l45')), ('SOUND', T('l46'))]
T_FAM = T('l47') - .05
T_END = T('l48') - 0.05                # block G starts on l48 "An empty field in 1998..."
PROPS = ROOT / 'public/art/ep002/props3d'
INK, RED, BLUE = (40, 44, 70), (200, 50, 50), (60, 110, 200)
PW2, PH2 = int(W * 1.25), int(H * 1.6)  # the page is a little bigger than the frame so the camera can drift


def comp(fr, im, x, y):
    base = fr.convert('RGBA'); base.alpha_composite(im, (int(x), int(y))); return base.convert('RGB')


def page():
    p = Image.new('RGB', (PW2, PH2), (246, 240, 224)); d = ImageDraw.Draw(p)
    for y in range(70, PH2, 44):
        d.line((0, y, PW2, y), fill=(190, 210, 235), width=2)
    d.line((150, 0, 150, PH2), fill=(230, 150, 150), width=3)
    a = np.asarray(p).astype(np.float32)
    yy, xx = np.mgrid[0:PH2, 0:PW2]; v = 1 - .18 * (((xx / PW2 - .5) ** 2 + (yy / PH2 - .5) ** 2) * 2)
    return Image.fromarray((a * v[..., None]).clip(0, 255).astype(np.uint8))


PAGE = page()
_o = Image.open(PROPS / 'ocarina_spin/f012.png').convert('RGBA')
OCA = _o.crop(_o.getchannel('A').getbbox()); OCA.thumbnail((240, 240))
KIDS = BE.CARDS[1]


def wobble_line(d, pts, fill, width=4, seed=0):
    """Hand-drawn feel: a slightly wavy line."""
    r = np.random.default_rng(seed); out = []
    for (a, b), (c, e) in zip(pts, pts[1:]):
        for i in range(12):
            u = i / 12
            out.append((lin(a, c, u) + r.normal(0, .8), lin(b, e, u) + r.normal(0, .8)))
    out.append(pts[-1]); d.line(out, fill=fill, width=width, joint='curve')


def write(d, xy, text, t, t0, size=34, fill=INK, speed=22):
    """Text that writes itself on, letter by letter."""
    n = int(max(0, (t - t0) * speed))
    if n > 0:
        d.text(xy, text[:n], font=F(size), fill=fill)


def draw_page(t):
    p = PAGE.copy(); d = ImageDraw.Draw(p)
    ox, oy = 210, 60                                                    # page content origin (page px)
    # F1: the plan
    write(d, (ox, oy + 30), 'THE PLAN', t, T0, 40, BLUE)
    write(d, (ox, oy + 100), '1. Take the beloved game', t, T0 + .5, 32, speed=40)
    write(d, (ox, oy + 150), '2. Make everything better', t, T0 + 1.1, 32, speed=40)   # written before 'easy' lands
    t_easy = max(T('l38.w5'), T0 + 1.1 + 25 / 40 + .05)                 # "easy" tick, once line 2 is written
    if t >= t_easy:
        k = ease(min(1, (t - t_easy) / .3))
        d.text((ox + 520, oy + 148), 'easy!', font=F(30), fill=(60, 150, 70))
        wobble_line(d, [(ox + 478, oy + 172), (ox + 490, oy + 184), (ox + 490 + 24 * k, oy + 156)], (60, 150, 70), 5, 3)
    # F2: the ocarina + heart, arrow to BETTER
    if t >= T_BELOVED:
        k = ease(min(1, (t - T_BELOVED) / .4))
        o = OCA.resize((max(1, int(OCA.width * k)), max(1, int(OCA.height * k))), Image.LANCZOS)
        p = comp(p, o, ox + 680 + (OCA.width - o.width) / 2, oy + 30 + (OCA.height - o.height) / 2); d = ImageDraw.Draw(p)
        hx, hy = ox + 950, oy + 60
        d.polygon([(hx, hy + 18), (hx - 22, hy - 2), (hx - 14, hy - 16), (hx, hy - 6), (hx + 14, hy - 16), (hx + 22, hy - 2)], fill=RED)
    if t >= T_BETTER:
        k = ease(min(1, (t - T_BETTER) / .5))
        x0, y0 = ox + 640, oy + 300
        wobble_line(d, [(x0, y0), (x0 + 160 * k, y0)], INK, 5, 5)
        if k > .9:
            d.polygon([(x0 + 170, y0), (x0 + 150, y0 - 12), (x0 + 150, y0 + 12)], fill=INK)
            d.text((x0 + 190, y0 - 22), 'BETTER', font=F(38), fill=(60, 150, 70))
            for i in range(5):                                          # sparkles
                a = t * 3 + i * 1.3
                sx, sy = x0 + 270 + 70 * math.cos(a), y0 - 40 + 26 * math.sin(a)
                d.line((sx - 6, sy, sx + 6, sy), fill=(230, 180, 40), width=3); d.line((sx, sy - 6, sx, sy + 6), fill=(230, 180, 40), width=3)
    # F3: the DANGER stamp slams onto the plan
    if t >= T_DANGER:
        k = min(1, (t - T_DANGER) / .18)
        st = stamp('DANGER')
        sc = 1.8 - .8 * ease(k)
        st = st.resize((int(st.width * sc), int(st.height * sc)), Image.LANCZOS)
        if k < 1:
            st.putalpha(st.getchannel('A').point(lambda v: int(v * k)))
        p = comp(p, st, ox + 330 - st.width / 2, oy + 130 - st.height / 2); d = ImageDraw.Draw(p)
    # F4-F6: the chart (lower half of the page)
    if t >= T_MEAS:
        k = ease(min(1, (t - T_MEAS) / .6))
        bx0, by0, bx1 = ox + 60, oy + 840, ox + 60 + 960 * k
        wobble_line(d, [(ox + 60, by0), (bx1, by0)], INK, 5, 7)
        wobble_line(d, [(ox + 60, by0), (ox + 60, by0 - 290 * k)], INK, 5, 8)
        if k > .8:
            d.text((ox + 80, by0 - 320), 'BETTER IS MEASURABLE', font=F(26), fill=BLUE)
        for i, (lab, ti) in enumerate(BARS):
            kk = ease(min(1, max(0, (t - ti + .05) / .35)))
            if kk <= 0:
                continue
            x = ox + 100 + i * 170; hgt = (140 + 30 * i) * kk
            d.rectangle((x, by0 - hgt, x + 110, by0), fill=(110, 170, 230), outline=INK, width=4)
            d.text((x + 55 - d.textlength(lab, font=F(20)) / 2, by0 + 12), lab, font=F(20), fill=INK)
            d.text((x + 55 - d.textlength('+', font=F(30)) / 2, by0 - hgt - 40), '+', font=F(30), fill=(60, 150, 70))
            icon(d, i, x + 55, by0 - hgt / 2, t)
        if t >= T_FAM:                                                  # the slot that cannot be measured
            kf = ease(min(1, (t - T_FAM) / .5))
            x = ox + 100 + 4 * 170 + 10
            kid = KIDS.rotate(-4, expand=True, resample=Image.BICUBIC)
            s = .72 * kf + .01; kid = kid.resize((max(1, int(kid.width * s)), max(1, int(kid.height * s))), Image.LANCZOS)
            p = comp(p, kid, x, by0 - 10 - kid.height); d = ImageDraw.Draw(p)
            lab = 'FAMILIAR'
            d.text((x + 80 - d.textlength(lab, font=F(20)) / 2, by0 + 12), lab, font=F(20), fill=RED)
            if kf > .6:                                                 # the ruler gives up
                rx = x + 180
                d.rectangle((rx, by0 - 200, rx + 26, by0), fill=(240, 210, 90), outline=INK, width=3)
                for j in range(10):
                    d.line((rx, by0 - 20 * j, rx + (14 if j % 2 else 22), by0 - 20 * j), fill=INK, width=2)
                d.text((rx - 6, by0 - 250), '???', font=F(34), fill=RED)
    return p


def stamp(text):
    """A rubber stamp: red double frame, heavy letters, slightly rough, tilted."""
    f = F(84); w = int(ImageDraw.Draw(Image.new('L', (1, 1))).textlength(text, font=f)) + 70
    im = Image.new('RGBA', (w, 150)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((4, 4, w - 5, 145), 14, outline=(205, 35, 35, 235), width=9)
    d.rounded_rectangle((18, 18, w - 19, 131), 8, outline=(205, 35, 35, 235), width=3)
    d.text((35, 22), text, font=f, fill=(205, 35, 35, 235))
    a = np.asarray(im).copy(); r = np.random.default_rng(2).random(a.shape[:2])
    a[..., 3] = (a[..., 3] * np.where(r < .12, .35, 1)).astype(np.uint8)           # ink texture
    return Image.fromarray(a, 'RGBA').rotate(9, expand=True, resample=Image.BICUBIC)


def icon(d, i, cx, cy, t):
    if i == 0:                                                          # polygons: a circle gaining sides
        n = 6 + int(10 * (.5 + .5 * math.sin(t * 2)))
        d.polygon([(cx + 30 * math.cos(2 * math.pi * k / n), cy + 30 * math.sin(2 * math.pi * k / n)) for k in range(n)], outline=INK, width=3)
    elif i == 1:                                                        # lighting: a bulb with rays
        d.ellipse((cx - 18, cy - 26, cx + 18, cy + 10), fill=(255, 230, 120), outline=INK, width=3)
        d.rectangle((cx - 9, cy + 10, cx + 9, cy + 22), fill=(150, 150, 160), outline=INK, width=2)
    elif i == 2:                                                        # animation: a little runner, legs swinging
        a = math.sin(t * 10) * .6
        d.ellipse((cx - 8, cy - 34, cx + 8, cy - 18), outline=INK, width=3); d.line((cx, cy - 18, cx, cy + 4), fill=INK, width=3)
        d.line((cx, cy + 4, cx + 18 * math.sin(a), cy + 26), fill=INK, width=3); d.line((cx, cy + 4, cx - 18 * math.sin(a), cy + 26), fill=INK, width=3)
    else:                                                               # sound: a waveform
        for j in range(9):
            h = 6 + 22 * abs(math.sin(t * 9 + j))
            d.line((cx - 36 + j * 9, cy - h / 2, cx - 36 + j * 9, cy + h / 2), fill=INK, width=4)


def render(t):
    p = draw_page(t)
    # one continuous camera over the page: plan (top) -> chart (bottom)
    keys = [(T0, (0, 0)), (T_DANGER, (50, 20)), (T_MEAS + .6, (40, 420)), (T_END, (60, 420))]   # chart sits above the subtitle zone
    for (ta, a), (tb, b) in zip(keys, keys[1:]):
        if t <= tb:
            k = ease(max(0, (t - ta) / (tb - ta))); cx, cy = lin(a[0], b[0], k), lin(a[1], b[1], k); break
    else:
        cx, cy = keys[-1][1]
    fr = p.crop((int(cx), int(cy), int(cx) + W, int(cy) + H))
    if t < T0 + .3:
        fr = Image.blend(Image.new('RGB', fr.size, (255, 255, 255)), fr, (t - T0) / .3)
    # F3: Navi in warning yellow (the DANGER stamp itself is drawn on the page, so it moves with the plan)
    if T_DANGER <= t < T_MEAS + .5:
        k = ease(min(1, (t - T_DANGER) / .3)); out = ease(min(1, max(0, (t - T_MEAS) / .5)))
        fr = Image.blend(fr, Image.new('RGB', fr.size, (200, 40, 30)), .06 * k * (1 - out))
    if T_DANGER - .3 <= t < T_MEAS + .4:
        keys = [(T_DANGER - .3, .9, .2), (T_DANGER + .4, .8, .2), (T_MEAS, .86, .16), (T_MEAS + .4, 1.05, .1)]
        fr = fairy_fx.draw(fr, keys, t, size=.06, color=(255, 225, 90))
    d = ImageDraw.Draw(fr)
    lab = ('F1 "On paper..."' if t < T_BELOVED else 'F2 beloved -> better' if t < T_DANGER else 'F3 "remakes become dangerous" (DANGER stamp)' if t < T_MEAS
           else 'F4-F5 better is measurable' if t < T_FAM else 'F6 "familiar is not measurable"')
    tag(d, f'SEQ 12 ON PAPER · {lab} · BLOCK F v2 (option A) · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('f1', T_BELOVED - .2), ('f2', T_DANGER - .2), ('f3', T_DANGER + .9), ('f4', T_MEAS + .8), ('f5', BARS[3][1] + .4), ('f6', T_END - .4))


def main():
    out = out_path(ROOT / 'docs/ep002/EP002_blockF_animatic_v2.mp4')
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          *video_args(), *audio_args(), '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(out_path(ROOT / f'docs/ep002/blockF_v2_{name}.jpg'), quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(out_path(ROOT / f'docs/ep002/blockF_v2_{name}.jpg'), quality=85)
        print('stills')
    else:
        main()
