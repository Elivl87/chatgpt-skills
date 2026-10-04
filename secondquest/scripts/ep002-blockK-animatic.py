#!/usr/bin/env python3
"""EP002 animatic, block K (planning only): l78 "So the remake has two completely different jobs." ->
l86 "And somehow Nintendo has to build both." (end of Act 3; block L / Act 4 starts on l87).

  K1  "So the remake has two completely different jobs."  Block J's VETERAN | NEW PLAYER sheet becomes the scoreboard:
                                                      its rows clear and an empty QUEST box opens under each player.
  K2  "For the new player: Make a game from 1998 feel natural in 2026."  The NEW PLAYER column lights: a mini screen
                                                      turns the blocky 1998 field into today's (a 1998 -> 2026 tag);
                                                      her QUEST box types it out; a check.
  K3  "For the returning player: Make something they already know... feel like discovery again."  The VETERAN column
                                                      lights: his familiar field fogs over, then a gap opens on
                                                      something new that sparkles; his QUEST box; a check.
  K4  "One person is looking at Hyrule. The other is looking for the Hyrule in their head."  Today's Hyrule, the two of
                                                      them from behind (both in their tunics): she looks at the real
                                                      castle; over him a thought bubble with the blocky 1998 Hyrule.
  K5  "And somehow Nintendo has to build both."      A blueprint grid (block F's plan) sweeps over both: the real
                                                      Hyrule and the one in his head.
HUD: hidden (a scoreboard, then a shot of two players at once, which the single-player game never shows). Sounds:
none (all at the end). Framing QC before sending.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, cutout, subtitle, tag, F  # noqa
import fairy as fairy_fx  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BJ = load('blockJ', 'scripts/ep002-blockJ-animatic.py')          # the sheet, Pixie in her tunic, block I's menus
BI, HB, G, CART = BJ.BI, BJ.HB, BJ.G, BJ.CART
comp, sized, fade, panel, ctext = BJ.comp, BJ.sized, BJ.fade, BJ.panel, BJ.ctext

T0 = T('l78') - 0.05                    # block J ends here
T_JOBS = T('l78.w5')                    # "two ... jobs"
T_NEW = T('l79') - .05
T_NEW_DO = T('l80') - .05
T_OLD = T('l81') - .05
T_OLD_DO = T('l82') - .05
T_DISC = T('l83.w3')                    # "discovery"
T_LOOK = T('l84') - .05
T_HEAD = T('l85') - .05
T_BUILD = T('l86') - .05
T_END = T('l87') - 0.05                 # Act 4 starts on l87
T_MERGE = T_END - 1.35                  # the two Hyrules fuse just before the cut
INK = (20, 14, 18, 255)
GOLD, BLUE = BJ.GOLD, BJ.BLUE
cxL, cxR = W * .40, W * .73                                                  # the sheet's two columns (block J)
P1, P2_T = BJ.P1, BJ.P2_T
SCR_W, SCR_H = 290, 160
SCR_Y = H * .35


def _field(z, x):
    return crop_(G.FIELD, (z, x, .6))


def crop_(img, cam):
    return G.crop(img, cam)


OLD_SMALL = G.old_look(_field(1.3, .5)).resize((SCR_W, SCR_H), Image.BILINEAR)
NEW_SMALL = G.new_look(_field(1.3, .5)).resize((SCR_W, SCR_H), Image.BILINEAR)


def mini_screen(im, a, lit):
    g = Image.new('RGBA', (SCR_W + 12, SCR_H + 12)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((0, 0, SCR_W + 11, SCR_H + 11), 10, fill=(10, 10, 16, 255), outline=(235, 235, 250, 255) if lit else (110, 115, 140, 255), width=3)
    g.paste(im, (6, 6))
    return fade(g, a)


def quest_box(fr, cx, y, lines, n, col, a):
    """A NEW QUEST box (block H's style) under a column; types out n characters of its text."""
    w, h = 340, 78
    g = panel(w, h, a, outline=col + (255,)); d = ImageDraw.Draw(g)
    d.text((16, 8), 'QUEST', font=F(14), fill=col + (int(255 * a),))
    left = n
    for i, ln in enumerate(lines):
        s = ln[:max(0, left)]; left -= len(ln)
        d.text((16, 26 + i * 24), s, font=F(18), fill=(255, 255, 255, int(255 * a)))
    return comp(fr, g, cx - w / 2 - 4, y)


def check(fr, cx, y, k):
    if k <= 0:
        return fr
    g = Image.new('RGBA', (70, 70)); d = ImageDraw.Draw(g)
    d.ellipse((4, 4, 66, 66), fill=(70, 190, 100, 240), outline=INK, width=4)
    d.line((20, 36, 31, 48, 51, 24), fill=(255, 255, 255, 255), width=7)
    s = .6 + .4 * ease(k) + .15 * math.sin(math.pi * min(1, k))
    g = g.resize((int(70 * s), int(70 * s)), Image.LANCZOS)
    return comp(fr, g, cx - g.width / 2, y - g.height / 2)


NEW_TXT = ('MAKE 1998 FEEL', 'NATURAL IN 2026')
OLD_TXT = ('MAKE THE KNOWN FEEL', 'LIKE DISCOVERY AGAIN')


def frame_k13(t):
    fr = BI.MENU_BG.copy()
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((W * .18, H * .06, W * .93, H * .74), 18, fill=(10, 14, 48, 215), outline=(235, 235, 250, 255), width=3)
    ctext(d, cxL, H * .09, 'VETERAN PLAYER', 26, GOLD + (255,))
    ctext(d, cxR, H * .09, 'NEW PLAYER', 26, BLUE + (255,))
    fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    lit_new = T_NEW <= t < T_OLD
    lit_old = t >= T_OLD
    dimL = .55 if lit_new else 0
    dimR = .55 if lit_old else 0
    for im, cx, dim, ratio in ((P1, cxL + 40, dimL, 1.0), (P2_T, cxR, dimR, .95)):
        s = sized(im, H * .25 * ratio)
        if dim:
            s2 = Image.blend(s.convert('RGB'), Image.new('RGB', s.size, (10, 14, 48)), dim).convert('RGBA'); s2.putalpha(s.getchannel('A')); s = s2
        fr = comp(fr, s, cx - s.width / 2, H * .135 + H * .25 * (1 - ratio))
    # K1: block J's rows clear away
    kr = 1 - ease(min(1, (t - T0) / .5))
    if kr > 0:
        jf, _ = BJ.frame_j3(BJ.T_END - .05)
        m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle((W * .18, H * .40, W * .93, H * .74), fill=int(255 * kr))
        fr = Image.composite(jf, fr, m)
    # the two QUEST boxes (empty on "two ... jobs"), the mini screens, the checks
    ka = ease(min(1, max(0, (t - T_JOBS) / .4)))
    if ka > 0:
        # NEW PLAYER: 1998 -> 2026
        if t >= T_NEW:
            km = ease(min(1, max(0, (t - T('l80.w5')) / (T('l80.w9') - T('l80.w5') + .3))))
            scr = Image.blend(OLD_SMALL, NEW_SMALL, km)
            fr = comp(fr, mini_screen(scr, min(1, (t - T_NEW) / .3), lit_new), cxR - SCR_W / 2 - 6, SCR_Y)
            d = ImageDraw.Draw(fr)
            yr = '1998' if km < .5 else '2026'
            d.rounded_rectangle((cxR + SCR_W / 2 - 80, SCR_Y + 12, cxR + SCR_W / 2 - 10, SCR_Y + 40), 6, fill=(20, 22, 30), outline=(232, 196, 90) if km < .5 else (120, 190, 255), width=2)
            ctext(d, cxR + SCR_W / 2 - 45, SCR_Y + 15, yr, 18, (255, 230, 160) if km < .5 else (190, 225, 255))
        # VETERAN: the known, fogged over, then a gap on something new
        if t >= T_OLD:
            scr = NEW_SMALL.copy().convert('RGBA')
            kf = ease(min(1, max(0, (t - T_OLD_DO) / .8)))
            kc = ease(min(1, max(0, (t - T_DISC + .2) / .6)))
            fog = Image.new('RGBA', scr.size); fd = ImageDraw.Draw(fog)
            r = np.random.default_rng(3)
            for i in range(14):
                x, y = r.random() * SCR_W, r.random() * SCR_H; rr = 30 + 40 * r.random()
                fd.ellipse((x - rr, y - rr * .7, x + rr, y + rr * .7), fill=(225, 228, 238, int(230 * kf)))
            hole = Image.new('L', scr.size, 0); ImageDraw.Draw(hole).ellipse((SCR_W * .5 - 70 * kc, SCR_H * .45 - 46 * kc, SCR_W * .5 + 70 * kc, SCR_H * .45 + 46 * kc), fill=255)
            fog = fog.filter(ImageFilter.GaussianBlur(6))
            fog.putalpha(Image.fromarray(np.minimum(np.asarray(fog.getchannel('A')), 255 - np.asarray(hole.filter(ImageFilter.GaussianBlur(8))))))
            scr.alpha_composite(fog)
            if kc > 0:                                                    # something new, sparkling
                sd = ImageDraw.Draw(scr)
                sx, sy = SCR_W * .5, SCR_H * .45
                for j in range(4):
                    a0 = j * math.pi / 2 + t * 2
                    L = 22 * kc
                    sd.line((sx - L * math.cos(a0), sy - L * math.sin(a0), sx + L * math.cos(a0), sy + L * math.sin(a0)), fill=(255, 245, 180, 255), width=3)
                sd.text((sx - 8, sy - 20), '!', font=F(30), fill=(255, 220, 90, int(255 * kc)), stroke_width=3, stroke_fill=(20, 14, 18))
            fr = comp(fr, mini_screen(scr.convert('RGB'), min(1, (t - T_OLD) / .3), lit_old), cxL + 40 - SCR_W / 2 - 6, SCR_Y)
        qy = H * .605
        nN = int(len(''.join(NEW_TXT)) * min(1, max(0, (t - T_NEW_DO) / (T('l80.w9') + .2 - T_NEW_DO))))
        nO = int(len(''.join(OLD_TXT)) * min(1, max(0, (t - T_OLD_DO) / (T('l83.w4') + .2 - T_OLD_DO))))
        fr = quest_box(fr, cxR, qy, NEW_TXT, nN, BLUE, ka * (.5 if lit_old else 1))
        fr = quest_box(fr, cxL + 40, qy, OLD_TXT, nO, GOLD, ka * (.5 if lit_new else 1))
        fr = check(fr, cxR + 150, qy + 4, (t - T('l80.w9') - .3) / .3)
        fr = check(fr, cxL + 190, qy + 4, (t - T('l83.w4') - .2) / .3)
    lab = ('K1 two different jobs' if t < T_NEW else 'K2 the new player: 1998 -> natural in 2026' if t < T_OLD
           else 'K3 the returning player: discovery again')
    return fr, lab


# ------------------------------------------------------------------ K4-K5: one looks at Hyrule, one looks for it
TODAY = BI.TODAY
QB = cutout('quest:walking_back', 'hero')
PB = cutout('pixie:walking_back', 'forest')


def crt_flicker(pic, t):
    """Producer improvement (K v2): the 1998 picture flickers like the block-H tube: uneven brightness, a slow rolling
    bright band, a hair of colour fringe and darker glass corners."""
    a = np.asarray(pic).astype(np.float32); h, w = a.shape[:2]
    a *= .9 + .07 * math.sin(t * 23) + .05 * math.sin(t * 61 + 1.3)
    yy = np.arange(h, dtype=np.float32)[:, None]
    band = (t * .35 % 1.0) * (h + 40) - 20
    a += 26 * np.exp(-((yy - band) / 9) ** 2)[..., None]
    a[:, 2:, 0] = a[:, :-2, 0]                                          # red fringe 2 px to the right
    xx = np.linspace(-1, 1, w)[None, :]; y2 = np.linspace(-1, 1, h)[:, None]
    a *= (1 - .28 * (xx ** 2 * y2 ** 2) ** .5)[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def thought_bubble(t, k, cloud=1.0):
    """A cloud bubble with the blocky 1998 Hyrule inside (his Hyrule). cloud < 1 fades the cloud, keeping the picture."""
    w, h = 330, 200
    g = Image.new('RGBA', (w + 40, h + 90)); d = ImageDraw.Draw(g)
    for (x, y, r) in ((60, 70, 60), (140, 50, 70), (230, 55, 70), (300, 90, 55), (90, 150, 60), (190, 160, 70), (280, 150, 55)):
        d.ellipse((x - r + 10, y - r + 10, x + r + 10, y + r + 10), fill=(255, 255, 255, 250), outline=INK, width=4)
    for (x, y, r) in ((60, 70, 56), (140, 50, 66), (230, 55, 66), (300, 90, 51), (90, 150, 56), (190, 160, 66), (280, 150, 51)):
        d.ellipse((x - r + 10, y - r + 10, x + r + 10, y + r + 10), fill=(255, 255, 255, 255))
    pic = crt_flicker(HB.old_picture(t, (250, 150)), t)
    m = Image.new('L', (250, 150), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, 249, 149), 30, fill=255)
    g.paste(pic, (55, 40), m)
    for i, (x, y, r) in enumerate(((110, 248, 16), (82, 272, 10))):       # the trail of little bubbles down to his head
        d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, 255), outline=INK, width=3)
    if cloud < 1:                                                       # the cloud melts away, the picture stays
        a = np.asarray(g).copy(); keep = np.zeros(a.shape[:2], bool); keep[40:190, 55:305] = np.asarray(m) > 0
        a[..., 3] = np.where(keep, a[..., 3], (a[..., 3] * cloud).astype(np.uint8)); g = Image.fromarray(a)
    s = (.4 + .6 * ease(k)) * .85                                       # stays inside the safe area
    g = g.resize((int(g.width * s), int(g.height * s)), Image.LANCZOS)
    return fade(g, min(1, k * 1.5))


def frame_k45(t):
    u = (t - T_LOOK) / (T_END - T_LOOK)
    z = lin(1.0, 1.06, ease(u))
    fr = TODAY.resize((int(W * z), int(H * z)), Image.BILINEAR).crop((int(W * (z - 1) / 2), int(H * (z - 1) / 2), int(W * (z - 1) / 2) + W, int(H * (z - 1) / 2) + H))
    fr = HB.FB.grass(fr, t, 1.0)
    qh = H * .46
    q = sized(QB, qh); p = sized(PB, qh * .95)
    for im, x in ((p, W * .40), (q, W * .60)):
        sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((x - im.width * .45, H * .95 - 10, x + im.width * .45, H * .95 + 10), fill=(0, 0, 0, 80))
        fr = Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(6))).convert('RGB')
        fr = comp(fr, im, x - im.width / 2, H * .95 - im.height)
    kp = min(1, max(0, (t - T('l84.w4')) / .4)) * (1 - min(1, max(0, (t - T_HEAD) / .4)))
    if kp > 0:                                                            # she looks at the real one: the castle glints
        fr = CART.glow(fr, W * .5, H * .32, 160, (255, 240, 200), .45 * kp)
    kb = min(1, max(0, (t - T('l85.w4')) / .5))
    km = ease(min(1, max(0, (t - T_MERGE) / 1.0)))                       # Producer improvement (K v2): both Hyrules
    if kb > 0 and km < 1:                                                 # he looks for the one in his head
        b = thought_bubble(t, kb, cloud=1 - km)
        if km > 0:                                                        # the bubble is drawn into the real castle
            sc = 1 - .8 * km
            b = b.resize((max(1, int(b.width * sc)), max(1, int(b.height * sc))), Image.LANCZOS)
            b = fade(b, 1 - km ** 3)
        bx0, by0 = W * .60 + 10, H * .95 - qh - b.height + 30
        bx1, by1 = W * .5 - b.width / 2, H * .32 - b.height * .55
        fr = comp(fr, b, lin(bx0, bx1, km), lin(by0, by1, km))
    if t >= T_BUILD:                                                      # build both: a blueprint sweeps over everything
        kbp = ease(min(1, (t - T_BUILD) / 1.6))
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        edge = W * kbp
        d.rectangle((0, 0, edge, H), fill=(30, 70, 150, 90))
        for x in range(0, int(edge), 40):
            d.line((x, 0, x, H), fill=(170, 210, 255, 90), width=1)
        for y in range(0, H, 40):
            d.line((0, y, edge, y), fill=(170, 210, 255, 90), width=1)
        d.line((edge, 0, edge, H), fill=(220, 240, 255, 220), width=4)
        if kbp > .6:                                                      # measurement marks on the castle and the bubble
            a = int(255 * (kbp - .6) / .4); d = ImageDraw.Draw(g, 'RGBA')   # blend, never punch holes in the tint
            for j, (x0, x1, y) in enumerate(((W * .40, W * .60, H * .16), (W * .60 + 40, W * .60 + 290, H * .14))):
                if j == 1:                                                # the bubble's mark leaves with the bubble
                    a = int(a * (1 - km))
                d.line((x0, y, x1, y), fill=(230, 245, 255, a), width=2)
                d.line((x0, y - 8, x0, y + 8), fill=(230, 245, 255, a), width=2); d.line((x1, y - 8, x1, y + 8), fill=(230, 245, 255, a), width=2)
        fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    if km > .55:                                                          # ...and the two fuse into one for an instant
        kf = (km - .55) / .45
        fr = CART.glow(fr, W * .5, H * .30, 240, (255, 245, 215), .8 * math.sin(math.pi * min(1, kf * 1.4)) + .25 * kf)
    d = ImageDraw.Draw(fr)
    lab = 'MISSING · Quest and Pixie hero tunics (back views) · planning stand-ins'
    tw = d.textlength(lab, font=F(13))
    d.rectangle((W * .03, H * .06, W * .03 + tw + 12, H * .06 + 20), fill=(150, 20, 30)); d.text((W * .03 + 6, H * .06 + 2), lab, font=F(13), fill=(255, 235, 235))
    fr = fairy_fx.draw(fr, [(T_LOOK, .5, .5), (T_HEAD, .52, .45), (T_END, .5, .4)], t, size=.04)
    lab = 'K4 one looks at Hyrule, one looks for it' if t < T_BUILD else 'K5 build both'
    return fr, lab


def render(t):
    if t < T_LOOK:
        fr, lab = frame_k13(t)
    else:
        fr, lab = frame_k45(t)
        if t < T_LOOK + .3:
            fr = Image.blend(Image.new('RGB', fr.size, (255, 255, 255)), fr, (t - T_LOOK) / .3)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 17 TWO JOBS · {lab} · BLOCK K v2 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('k1', T_JOBS + .6), ('k2', T('l80.w9') + .4), ('k3', T('l83.w4') + .3), ('k4', T('l85.w10')), ('k5', T_BUILD + 1.8), ('k5merge', T_MERGE + .6), ('k5end', T_END - .2))


def main():
    out = ROOT / 'docs/ep002/EP002_blockK_animatic_v2.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockK_v2_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockK_v2_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
