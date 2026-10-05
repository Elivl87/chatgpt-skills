#!/usr/bin/env python3
"""EP002 animatic, block U (planning only): l155 "So what game would you go back to?" -> l157 "...Maybe that's our
next quest." - the end of the episode (6:53).

v1 (Producer, 2026-10-05): the ending keeps EP001's identity (there Quest sat on a fence looking at the big farm):
here Quest and Pixie, in their hero and princess costumes, stand on top of a rock outcrop looking at the horizon -
the whole of Hyrule and the castle far away at golden hour. A Breath-of-the-Wild key art was given only as a
composition reference (evoked, never copied).
  U1  "So what game would you go back to?"  Out of block T's road: the camera rises and pulls back from the two of them
                                          on the outcrop, from behind, to the whole vista.
  U2  "And what game deserves a 'why?' next?"  The SecondQuest wordmark lands in the sky on "why?" (as EP001 and
                                          block B did); birds cross the sun.
  U3  "Tell me in the comments. Maybe that's our next quest."  Hold on the vista; the left and right thirds stay clean
                                          for YouTube's end screen (subscribe + a video) - publishing standard.
HUD: off (they speak to the viewer; the end screen needs the room). Stand-ins: Quest and Pixie on the outcrop from
behind, hero and princess (MISSING #17, new art). Sounds: none (all at the end). Free.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, W, H, PW, PH, FPS, T, ease, lin, subtitle, tag, F, cam_box, cutout  # noqa
import fairy as fairy_fx  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BT = load('blockT', 'scripts/ep002-blockT-animatic.py')          # the road (the cut out of it), the adult with his gear
BBm = load('blockB', 'scripts/ep002-blockB-animatic.py')         # the SecondQuest wordmark (as EP001)
CART = BT.CART
comp, sized, fade = BT.comp, BT.sized, BT.fade

T0 = T('l155') - 0.05                   # block T ends here
T_WHY = T('l156.w6')                    # "why?": the wordmark
T_COMM = T('l157') - .05
T_END = 412.9                           # the end of the narration (6:53)
RNG = np.random.default_rng(11)


# ------------------------------------------------------------------ the vista (plate, 1920x1080), golden hour
def _vista():
    im = Image.new('RGB', (PW, PH)); d = ImageDraw.Draw(im)
    for y in range(PH):                                                       # sky: warm gold at the sun, teal above
        k = y / PH
        top, mid = np.array([70, 140, 170]), np.array([255, 196, 120])
        c = top * (1 - min(1, k / .55)) + mid * min(1, k / .55)
        d.line((0, y, PW, y), fill=tuple(int(v) for v in c))
    im = CART.glow(im, PW * .70, PH * .46, 760, (255, 236, 180), .9)         # the sun, low, behind the castle
    g = Image.new('RGBA', (PW, PH)); gd = ImageDraw.Draw(g)                  # clouds lit from below
    for i in range(16):
        x = RNG.uniform(-100, PW); y = RNG.uniform(PH * .05, PH * .32); w = RNG.uniform(220, 520)
        gd.ellipse((x, y, x + w, y + w * .28), fill=(255, 226, 190, 120))
        gd.ellipse((x + w * .15, y - w * .06, x + w * .7, y + w * .18), fill=(255, 240, 215, 110))
    im = Image.alpha_composite(im.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(22))).convert('RGB')
    for j, (base, amp, col) in enumerate(((.50, 60, (120, 150, 175)), (.55, 50, (88, 122, 150)), (.62, 40, (62, 98, 120)))):
        d = ImageDraw.Draw(im)                                                # mountain ranges, bluer with distance
        pts = [(0, PH)]
        for x in range(0, PW + 40, 40):
            y = PH * base - amp * (math.sin(x / (230 - j * 40) + j) + .6 * math.sin(x / 97 + 2 * j)) - (90 if j == 0 and 1200 < x < 1500 else 0) * math.sin((x - 1200) / 300 * math.pi) * (j == 0)
            pts.append((x, y))
        pts.append((PW, PH))
        d.polygon(pts, fill=col)
    g = Image.new('RGBA', (PW, PH)); gd = ImageDraw.Draw(g)                  # valley mist
    for i in range(14):
        x = RNG.uniform(-200, PW); y = RNG.uniform(PH * .6, PH * .74)
        gd.ellipse((x, y, x + 520, y + 70), fill=(255, 235, 215, 110))
    im = Image.alpha_composite(im.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(30))).convert('RGB')
    castle = Image.open(ROOT / 'public/art/ep002/props3d/castle_far.png').convert('RGBA')
    castle = sized(castle, PH * .07)
    a = np.asarray(castle).astype(np.float32); a[..., :3] = a[..., :3] * .7 + np.array([255, 220, 170]) * .3     # in the haze
    im = comp(im, Image.fromarray(a.astype(np.uint8)), PW * .70 - castle.width / 2, PH * .705 - castle.height)   # far, down in the valley
    d = ImageDraw.Draw(im)                                                    # the field far below
    d.polygon([(0, PH * .74), (PW * .3, PH * .70), (PW * .7, PH * .72), (PW, PH * .69), (PW, PH), (0, PH)], fill=(92, 130, 80))
    # the outcrop: a flat-topped rock with grass, the two of them stand on its top edge
    rock = [(PW * .30, PH), (PW * .36, PH * .86), (PW * .40, PH * .80), (PW * .60, PH * .79), (PW * .66, PH * .84), (PW * .72, PH)]
    d.polygon(rock, fill=(112, 86, 66), outline=(40, 30, 26), width=6)
    d.polygon([(PW * .40, PH * .80), (PW * .60, PH * .79), (PW * .58, PH * .83), (PW * .42, PH * .84)], fill=(138, 108, 82))
    for i in range(70):                                                       # grass tufts in the foreground
        x = RNG.uniform(0, PW); y = PH - RNG.uniform(0, PH * .12)
        if PW * .32 < x < PW * .70 and y < PH * .9:
            continue
        h = RNG.uniform(30, 90)
        d.line((x, y, x + RNG.uniform(-14, 14), y - h), fill=(70, 120, 60), width=5)
    d.polygon([(0, PH), (0, PH * .9), (PW * .32, PH * .94), (PW * .30, PH)], fill=(64, 104, 56))
    d.polygon([(PW, PH), (PW, PH * .9), (PW * .70, PH * .95), (PW * .72, PH)], fill=(64, 104, 56))
    return im


VISTA = _vista()
TOP_Y = PH * .80                                                              # the outcrop's top edge (plate px)
QUEST = BT.ADULT                                                              # hero, shield and sword on his back (Producer rule)
PIXIE = cutout('pixie:walking_back', 'princess')                              # MISSING #17: Pixie as the princess, from behind
CH = PH * .30


def scene(t):
    """The vista with the two of them, plate px (the rim light from the sun on their edges)."""
    im = VISTA.copy()
    for img, x, h in ((PIXIE, PW * .545, CH * .97), (QUEST, PW * .465, CH)):
        q = sized(img, h)
        sh = Image.new('RGBA', (PW, PH)); ImageDraw.Draw(sh).ellipse((x - q.width * .4, TOP_Y - 10, x + q.width * .4, TOP_Y + 10), fill=(0, 0, 0, 90))
        im = Image.alpha_composite(im.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(6))).convert('RGB')
        sway = 2 * math.sin(t * 1.3 + x)                                     # breathing, the wind
        im = comp(im, q, x - q.width / 2 + sway, TOP_Y - q.height + 4)
    return im


CAM0 = (2.0, .505, .66)                                                       # close behind them (the cut from block T)
CAM1 = (1.0, .5, .5)                                                          # the whole vista


def birds(fr, t):
    d = ImageDraw.Draw(fr)
    for i in range(6):
        k = ((t - T_WHY + 1.0) * .07 + i * .05) % 1
        x = W * (.2 + .7 * k) + 30 * i; y = H * (.22 + .03 * math.sin(i * 1.7)) - 40 * k
        f = math.sin(t * 9 + i) * 6
        d.line((x - 10, y - f, x, y, x + 10, y - f), fill=(70, 50, 50), width=3)
    return fr


def wordmark(fr, dt):
    """The SecondQuest wordmark (EP001's brand image + gold bar), up in the sky."""
    wm = BBm.WORDMARK
    wh = int(H * .14); ww = int(wm.width * wh / wm.height)
    g = Image.new('RGBA', (max(ww, 420) + 40, wh + 50))
    g.alpha_composite(wm.resize((ww, wh), Image.LANCZOS), ((g.width - ww) // 2, 10))
    bar = 400 * BBm._in_out_cubic(min(1, max(0, (dt - .25) / .45)))
    if bar > 1:
        d = ImageDraw.Draw(g); y = 10 + wh + 12; x0 = (g.width - bar) / 2
        d.rounded_rectangle((x0, y + 2, x0 + bar, y + 9), 3, fill=(22, 22, 31, 255))
        d.rounded_rectangle((x0, y, x0 + bar, y + 7), 3, fill=(255, 200, 61, 255))
    x = min(1, dt / .28); e = BBm._out_back(x)
    sc = 1.3 + (1 - 1.3) * e
    g = g.resize((max(1, int(g.width * sc)), max(1, int(g.height * sc))), Image.LANCZOS)
    return comp(fr, fade(g, min(1, x * 4)), W / 2 - g.width / 2, H * .07)


def render(t):
    k = ease(min(1, max(0, (t - T0 - .2) / 4.2)))                             # U1: rise and pull back to the whole vista
    box = cam_box((CAM0, CAM1), k)
    fr = scene(t).crop(tuple(int(v) for v in box)).resize((W, H), Image.BICUBIC)
    if t < T0 + .5:                                                           # out of block T: a soft dissolve
        last = BT.render(T0 - .02)
        fr = Image.blend(last, fr, ease((t - T0) / .5))
    fr = birds(fr, t)
    if t >= T_WHY:
        fr = wordmark(fr, t - T_WHY)
    lab = 'U1 what game would you go back to?' if t < T_WHY - .3 else 'U2 what deserves a why? next' if t < T_COMM else 'U3 tell me in the comments · end screen room'
    keys = [(T0, .52, .40), (T0 + 2.5, .55, .55), (T_WHY, .53, .62), (T_END, .52, .63)]
    fr = fairy_fx.draw(fr, keys, t, size=.03)
    d = ImageDraw.Draw(fr)
    if t >= T_COMM:                                                           # planning guides: where the end screen goes
        a = min(1, (t - T_COMM) / .5)
        for (x0, y0, x1, y1, s) in ((W * .05, H * .32, W * .30, H * .62, 'END SCREEN · video'), (W * .72, H * .36, W * .92, H * .58, 'END SCREEN · subscribe')):
            for i in range(0, int(x1 - x0), 14):
                d.line((x0 + i, y0, x0 + i + 7, y0), fill=(255, 255, 255), width=2); d.line((x0 + i, y1, x0 + i + 7, y1), fill=(255, 255, 255), width=2)
            for i in range(0, int(y1 - y0), 14):
                d.line((x0, y0 + i, x0, y0 + i + 7), fill=(255, 255, 255), width=2); d.line((x1, y0 + i, x1, y0 + i + 7), fill=(255, 255, 255), width=2)
            d.text((x0 + 8, y0 + 6), s, font=F(14), fill=(255, 255, 255), stroke_width=2, stroke_fill=(20, 14, 18))
    lab2 = 'MISSING · Quest (hero) and Pixie (princess) on the outcrop, from behind (#17) · vista (#18) · planning stand-ins'
    tw = d.textlength(lab2, font=F(13)); d.rectangle((W * .03, H * .935, W * .03 + tw + 12, H * .935 + 20), fill=(150, 20, 30)); d.text((W * .03 + 6, H * .935 + 2), lab2, font=F(13), fill=(255, 235, 235))
    tag(d, f'SEQ 27 OUR NEXT QUEST · {lab} · BLOCK U v1 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('u1a', T0 + .8), ('u1', T0 + 3.0), ('u2', T_WHY + .8), ('u3', T_END - .3))


def main():
    out = ROOT / 'docs/ep002/EP002_blockU_animatic_v1.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockU_v1_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockU_v1_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
