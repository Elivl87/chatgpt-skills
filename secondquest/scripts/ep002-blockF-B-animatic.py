#!/usr/bin/env python3
"""EP002 animatic, block F, OPTION B (planning only): same lines as option A (l38 -> l47), told inside Hyrule.

The field (final plate #11; young Quest = final art #3, walking #3 / #3 mirrored) starts "old": blocky, flat light, nothing moves. Each "better" is applied live:
  F1  "On paper, the job sounds easy."     A blueprint sheet slides in over the sky: THE PLAN ... easy!
  F2  "Take something beloved... and make everything better."   The ocarina on the sheet; BETTER.
  F3  "Except that is where remakes become dangerous."           DANGER stamp on the sheet; Navi turns warning-yellow.
  F4  "Because better is measurable."       The sheet leaves; a game-style meter panel slides in (top right).
  F5  "More polygons."  the blocks smooth out   "Better lighting."  sun and rays   "Better animation."  grass sways,
      Quest starts walking   "Better sound."  sound rings and notes. Each word fills its bar.
  F6  "But familiar is not measurable."     FAMILIAR row flickers "???"; the kids' afternoon (block C) appears.
Option A (the notebook) stays as scripts/ep002-blockF-animatic.py. Sounds: Bram only. Framing QC before sending.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, plate, final, cam_box, subtitle, tag, F, STEP_RATE  # noqa
import fairy as fairy_fx  # noqa
import hud  # noqa: in-game HUD in every Hyrule shot (Producer)
import ui_kit as UI  # noqa: the approved on-screen text style (2026-10-06)

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


A = load('blockF_A', 'scripts/ep002-blockF-animatic.py')         # timings, stamp, ocarina, the kids' card
CART = A.BE.CART
T0, T_BELOVED, T_BETTER, T_DANGER, T_MEAS, T_FAM, T_END = A.T0, A.T_BELOVED, A.T_BETTER, A.T_DANGER, A.T_MEAS, A.T_FAM, A.T_END
BARS = A.BARS
FIELD = plate(('final', 'field'))                                 # final plate #11
def memory_polaroid(caption='Saturday, 1998'):
    room = A.BE.BC.room_plate(A.BE.BC.T_SAT + 3, A.BE.BC.PIXIE_SIT).convert('RGB')
    im = room.crop((int(.12 * PW), int(.45 * PH), int(.66 * PW), int(1.0 * PH))); im.thumbnail((200, 150))
    im = Image.blend(im, Image.new('RGB', im.size, (255, 200, 130)), .12)
    return im, caption


POLA_IMG, POLA_CAP = memory_polaroid()


def polaroid(t0, t):
    """Develops from white like an instant photo (memory, not measurement)."""
    dev = ease(min(1, max(0, (t - t0 - .2) / 1.4)))
    img = Image.blend(Image.new('RGB', POLA_IMG.size, (238, 236, 228)), POLA_IMG, dev)
    c = Image.new('RGBA', (img.width + 20, img.height + 46), (250, 246, 236, 255)); c.paste(img, (10, 10))
    d = ImageDraw.Draw(c); d.text((12, img.height + 16), POLA_CAP, font=F(18), fill=(70, 55, 40, int(255 * dev)))
    return c


HEROES = {k: final(k).resize((int(final(k).width * H * .36 / final(k).height), int(H * .36)), Image.LANCZOS)
          for k in ('quest_young_back', 'quest_young_back_b')}            # young Quest #3 and #3 mirrored (#9): the walk cycle
HERO = HEROES['quest_young_back']
GOLD, PANEL = (232, 196, 90), (14, 18, 30)
import os
FAM_MODE = os.environ.get('FAM_MODE', 'card_heart')   # Producer's pick: card + heart bar (v1 options: card | window | heart)


def comp(fr, im, x, y):
    base = fr.convert('RGBA'); base.alpha_composite(im, (int(x), int(y))); return base.convert('RGB')


def k_at(t, ti, dur=.6):
    return ease(min(1, max(0, (t - ti + .05) / dur)))


def field_frame(t):
    z = 1.08 * (1.16 / 1.08) ** ease(min(1, max(0, (t - T0) / (T_END - T0))))   # as before: the slow push
    if t > BARS[2][1]:                                                  # he walks: the road ahead keeps coming (no treadmill)
        z *= 1 + .035 * min(1, (t - BARS[2][1]) / (T_END - BARS[2][1])) ** 1.3
    box = cam_box(((z, .5, .56), (z, .5, .56)), 0)
    smooth = FIELD.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)
    kp, kl = k_at(t, BARS[0][1]), k_at(t, BARS[1][1])
    blocky = smooth.resize((56, 32), Image.BILINEAR).resize((W, H), Image.NEAREST)          # the "old", fewer-polygon look
    fr = Image.blend(blocky, smooth, kp)
    a = np.asarray(fr).astype(np.float32)
    grey = a.mean(2, keepdims=True)
    a = grey + (a - grey) * (0.65 + 0.55 * kl)                                               # flat -> rich light
    a = (a - 128) * (0.9 + 0.2 * kl) + 128
    fr = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if kl > 0:                                                                                # sun + rays
        fr = CART.glow(fr, W * .86, H * .1, 560, (255, 228, 160), .4 * kl)
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        for i in range(5):
            a0 = math.radians(120 + i * 12 + 2 * math.sin(t + i))
            d.polygon([(W * .86, H * .1), (W * .86 + 1600 * math.cos(a0), H * .1 + 1600 * math.sin(a0)),
                       (W * .86 + 1600 * math.cos(a0 + .05), H * .1 + 1600 * math.sin(a0 + .05))], fill=(255, 240, 200, int(40 * kl)))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(12))).convert('RGB')
    return fr


def grass(fr, t, k):
    if k <= 0:
        return fr
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g); r = np.random.default_rng(9)
    for i in range(170):
        x = r.random() * W; y = H * (.8 + .2 * r.random()); h = 14 + 22 * r.random()
        sw = math.sin(t * 3 + x * .02) * 7 * k
        c = (60 + int(40 * r.random()), 130 + int(50 * r.random()), 50, int(220 * k))
        d.line((x, y, x + sw, y - h), fill=c, width=3)
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


def sound_fx(fr, t, k):
    if k <= 0:
        return fr
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    cx, cy = W * .5, H * .55
    for j in range(3):
        ph = ((t - BARS[3][1]) * .8 + j / 3) % 1
        r = 40 + 260 * ph
        d.ellipse((cx - r, cy - r * .5, cx + r, cy + r * .5), outline=(255, 255, 255, int(150 * (1 - ph) * k)), width=3)
    for j in range(5):
        ph = ((t - BARS[3][1]) * .6 + j / 5) % 1
        x, y = W * (.3 + .08 * j), H * (.62 - .3 * ph)
        d.text((x, y), '♪' if j % 2 else '♫', font=F(40), fill=(255, 236, 170, int(255 * min(1, (1 - ph) * 2) * k)), stroke_width=2, stroke_fill=(70, 45, 15))
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


def hero(fr, t):
    ka = k_at(t, BARS[2][1])
    bob = 5 * abs(math.sin(t * STEP_RATE)) * ka                                # stiff until "Better animation"
    im = HEROES['quest_young_back_b' if ka > .5 and int(t * STEP_RATE / math.pi) % 2 else 'quest_young_back']   # then he walks: #3 / #3 mirrored
    return comp(fr, im, W * .5 - im.width / 2, H * .93 - im.height - bob)


def blueprint_sheet(fr, t):
    if t >= T_MEAS + .6:
        return fr
    k_in = ease(min(1, (t - T0) / .5)); k_out = ease(min(1, max(0, (t - T_MEAS) / .5)))
    sw, sh = int(W * .47), int(H * .38)
    sht = Image.new('RGBA', (sw, sh), (24, 70, 140, 235)); d = ImageDraw.Draw(sht)
    for gx in range(0, sw, 28):
        d.line((gx, 0, gx, sh), fill=(50, 100, 170, 255))
    for gy in range(0, sh, 28):
        d.line((0, gy, sw, gy), fill=(50, 100, 170, 255))
    d.rectangle((0, 0, sw - 1, sh - 1), outline=(230, 240, 255, 255), width=3)
    wc = (235, 242, 255, 255)
    A.write(d, (24, 18), 'THE PLAN', t, T0, 30, wc)
    A.write(d, (24, 70), '1. Take the beloved game', t, T0 + .5, 25, wc, speed=40)
    A.write(d, (24, 110), '2. Make everything better', t, T0 + 1.1, 25, wc, speed=40)
    t_easy = max(T('l38.w5'), T0 + 1.1 + 25 / 40 + .05)
    if t >= t_easy:
        d.text((24 + d.textlength('2. Make everything better', font=F(25)) + 16, 108), 'easy!', font=F(26), fill=(130, 240, 150, 255))      # right after line 2
    if t >= T_BELOVED:
        o = A.OCA.copy(); o.thumbnail((120, 120)); sht.alpha_composite(o, (sw - 140, 150)); d = ImageDraw.Draw(sht)   # clear of the text
    if t >= T_BETTER:
        d.line((24, 250, 120, 250), fill=wc, width=4); d.polygon([(130, 250), (116, 242), (116, 258)], fill=wc)
        d.text((140, 234), 'BETTER', font=F(24), fill=(130, 240, 150, 255))
    if t >= T_DANGER:
        kk = min(1, (t - T_DANGER) / .18); st = A.stamp('DANGER'); sc = (1.2 - .5 * ease(kk))
        st = st.resize((int(st.width * sc), int(st.height * sc)), Image.LANCZOS)
        if kk < 1:
            st.putalpha(st.getchannel('A').point(lambda v: int(v * kk)))
        sht.alpha_composite(st, (int(sw * .42 - st.width / 2), int(sh * .5 - st.height / 2)))
    x = W * .04 - (sw + 80) * (1 - k_in) - (sw + 120) * k_out
    return comp(fr, sht, x, H * .17)                                    # below the HUD hearts


def meter_panel(fr, t):
    if t < T_MEAS - .05:
        return fr
    k_in = ease(min(1, (t - T_MEAS + .05) / .5))
    pw, ph = int(W * .33), int(H * .42)
    pan = UI.sq_box(pw - 16, ph - 16); d = ImageDraw.Draw(pan)        # our game text box (approved style, family A)
    rows = [(lab, ti) for lab, ti in BARS] + [('FAMILIAR', T_FAM + .1)]
    for i, (lab, ti) in enumerate(rows):
        y = 18 + i * 54
        fam = lab == 'FAMILIAR'
        UI.spaced(d, (22, y), lab, F(19), (240, 120, 110, 255) if fam else (235, 238, 250, 255), 2)
        bx0, bx1 = 22, pw - 70
        d.rounded_rectangle((bx0, y + 26, bx1, y + 42), 6, fill=(40, 46, 64, 255), outline=(120, 130, 160, 255), width=2)
        if fam and FAM_MODE == 'card_heart':
            if t >= ti:                                                 # full at first, then slowly draining; the heart blinks at its tip
                v = .5 - .25 * ease(min(1, (t - ti) / (T_END - ti + .5)))         # starts at half, drains slowly (Producer)
                fx = bx0 + 2 + (bx1 - bx0 - 4) * v
                d.rounded_rectangle((bx0 + 2, y + 28, fx, y + 40), 5, fill=(240, 120, 110, 255))
                if int((t - ti) * 6) % 2 == 0:                          # blinks a little faster (Producer)
                    hx, hy, hr = fx, y + 34, 13
                    d.polygon([(hx, hy + hr), (hx - 1.6 * hr, hy - .2 * hr), (hx - hr, hy - 1.1 * hr), (hx, hy - .5 * hr), (hx + hr, hy - 1.1 * hr), (hx + 1.6 * hr, hy - .2 * hr)],
                              fill=(255, 90, 100, 255), outline=(255, 235, 235, 255))
        elif fam and FAM_MODE == 'heart':
            if t >= ti:                                                 # no bar can hold it: a heart beats where the bar would be
                pulse = 1 + .18 * max(0, math.sin((t - ti) * 7))
                hx, hy, hr = (bx0 + bx1) / 2, y + 34, 12 * pulse
                d.polygon([(hx, hy + hr), (hx - 1.6 * hr, hy - .2 * hr), (hx - hr, hy - 1.1 * hr), (hx, hy - .5 * hr), (hx + hr, hy - 1.1 * hr), (hx + 1.6 * hr, hy - .2 * hr)], fill=(240, 120, 110, 255))
                d.text((bx1 + 10, y + 18), '?', font=F(22), fill=(240, 120, 110, 255))
        elif fam:
            if t >= ti:
                v = abs(math.sin(t * 13)) * .9 if int(t * 6) % 2 else abs(math.sin(t * 7)) * .3      # it cannot settle
                d.rounded_rectangle((bx0 + 2, y + 28, bx0 + 2 + (bx1 - bx0 - 4) * v, y + 40), 5, fill=(240, 120, 110, 255))
                d.text((bx1 + 10, y + 18), '???', font=F(22), fill=(240, 120, 110, 255))
        else:
            v = k_at(t, ti, .5)
            if v > 0:
                d.rounded_rectangle((bx0 + 2, y + 28, bx0 + 2 + (bx1 - bx0 - 4) * v, y + 40), 5, fill=(110, 220, 140, 255))
                d.text((bx1 + 12, y + 18), '+', font=F(24), fill=(110, 220, 140, 255))
    pan = pan.resize((int(pw * .72), int(ph * .72)), Image.LANCZOS)     # Producer (v11): smaller and lower right, clear of the castle
    x = W * .71 + (pan.width + 80) * (1 - k_in)
    return comp(fr, pan, x, H * .425)                                   # under the castle's line, above the subtitles


def familiar_window(fr, t):
    if not (t >= T_FAM and FAM_MODE in ('window', 'heart')):
        return fr
    if True:                 # the old field shows through around Quest: what you remember
        kf = ease(min(1, (t - T_FAM) / .8))
        box = cam_box(((1.08, .5, .56), (1.16, .5, .56)), (t - T0) / (T_END - T0))
        old = FIELD.crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR).resize((56, 32), Image.BILINEAR).resize((W, H), Image.NEAREST)
        old = Image.blend(old, Image.new('RGB', old.size, (255, 190, 110)), .22)
        old = comp(old, HERO, W * .5 - HERO.width / 2, H * .93 - HERO.height)
        m = Image.new('L', (W, H), 0); md = ImageDraw.Draw(m)
        r = 260 * kf; cx, cy = W * .5, H * .7
        md.ellipse((cx - r * 1.3, cy - r, cx + r * 1.3, cy + r), fill=255)
        fr = Image.composite(old, fr, m.filter(ImageFilter.GaussianBlur(30)))
        fr = CART.glow(fr, cx, cy, int(r * 1.4) + 1, (255, 210, 140), .2 * kf)
    return fr


def render(t):
    fr = field_frame(t)
    fr = grass(fr, t, k_at(t, BARS[2][1]))
    fr = hero(fr, t)
    fade = 1 - ease(min(1, max(0, (t - T_FAM) / .8)))                  # the sound fades out as 'familiar' takes over (Producer: a bit faster)
    fr = sound_fx(fr, t, k_at(t, BARS[3][1]) * fade)
    navi_col = (255, 225, 90) if T_DANGER - .2 <= t < T_MEAS + .4 else (170, 220, 255)
    fr = fairy_fx.draw(fr, [(T0, .58, .5), (T_DANGER, .56, .45), (T_MEAS, .6, .5), (T_END, .56, .48)], t, size=.05, color=navi_col)
    fr = familiar_window(fr, t)                                       # under the UI, never over it
    fr = blueprint_sheet(fr, t)
    fr = meter_panel(fr, t)
    if t >= T_FAM and FAM_MODE in ('card', 'card_heart'):            # floats down swaying to rest, developing like an instant photo
        u = min(1, (t - T_FAM) / 1.3)
        fall = ease(u)
        sway = 14 * math.sin((t - T_FAM) * 5) * (1 - u)
        card = polaroid(T_FAM, t).rotate(5 + sway, expand=True, resample=Image.BICUBIC)
        card = card.resize((int(card.width * .85), int(card.height * .85)), Image.LANCZOS)
        if u < .25:
            card.putalpha(card.getchannel('A').point(lambda v: int(v * u / .25)))
        fr = comp(fr, card, W * .17 + 30 * math.sin((t - T_FAM) * 2.5) * (1 - u), H * .3 - H * .35 * (1 - fall))   # a little more to the right (Producer)
    hearts = 5.0 if t < T_FAM + .2 else max(2.5, 5.0 - .5 * (1 + int((t - T_FAM - .2) / .35)))   # 'familiar': loses half a heart at a time
    fr = hud.draw(fr, hearts=hearts, t=t)
    if t < T0 + .3:
        fr = Image.blend(Image.new('RGB', fr.size, (255, 255, 255)), fr, (t - T0) / .3)
    d = ImageDraw.Draw(fr)
    lab = ('F1 "On paper..."' if t < T_BELOVED else 'F2 beloved -> better' if t < T_DANGER else 'F3 DANGER stamp' if t < T_MEAS
           else 'F4-F5 each "better" applied to Hyrule' if t < T_FAM else 'F6 familiar: ???')
    tag(d, f'SEQ 12 · OPTION B (in Hyrule) · {lab} · BLOCK F-B v11 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('f1', T_BELOVED - .2), ('f3', T_DANGER + .6), ('f4_old', T_MEAS + .7), ('f5_poly', BARS[0][1] + .6), ('f5_light', BARS[1][1] + .5),
          ('f5_anim', BARS[2][1] + .5), ('f5_sound', BARS[3][1] + .5), ('f6', T_END - .4))


def main():
    out = ROOT / 'docs/ep002/EP002_blockF_B_animatic_v11.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockF_B_v11_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockF_B_v11_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
