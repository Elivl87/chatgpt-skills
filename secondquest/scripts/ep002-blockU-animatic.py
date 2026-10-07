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
HUD: off (they speak to the viewer; the end screen needs the room). Sounds: Navi's trail (NAVI_SFX_01 at 0.14) from
the start of her circle (v2, approved).
v2 (approved): Pixie looks at the castle, then turns to Quest on "Maybe"; Navi circles them, flies up, around the
wordmark and into its star on "next".
v3 (final art, 2026-10-05): the whole shot is the final illustration #17+18 (characters baked in, 3D shield overlay),
so the separate character layers and the procedural vista are gone. Re-aimed on the plate: the camera starts close
behind them with their heads in frame (CAM0) and pulls back to the whole plate; Navi hovers between them, circles
them at their waists, then the wordmark as before; the wordmark sits a little smaller and higher (above Quest's hat);
the birds cross the sun right of Pixie. Beat change: the plate is a still and Pixie is already turned to him,
smiling, so her turn on "Maybe" is replaced by a soft warm light that swells over the two of them (and the sun).
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, W, H, PW, PH, FPS, T, ease, lin, subtitle, tag, F, cam_box, final_plate, PLANNING, S, Si, P, out_path, video_args, audio_args  # noqa
import fairy as fairy_fx  # noqa
import ui_kit as UI  # noqa: the approved on-screen text style (2026-10-06)

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
T_TURN = T('l157.w6')                   # "Maybe (that's our next quest)": Pixie turns to Quest
T_ORB0, T_ORB1 = T_WHY + .5, T_WHY + 2.1  # improvement 2: Navi circles them (her trail sound starts here)...
T_UP1, T_LOOP1 = T_ORB1 + .5, T_ORB1 + 1.4  # ...flies up and around the wordmark...
T_STAR = T('l157.w9')                   # ...and goes into its four-point star on "next (quest)"
WM_Y, WM_H = .03, .11                   # the wordmark, smaller and higher than v2 (.07, .14): Quest's hat tops out at y .20
STAR = (.5 + (.413 - .5) * WM_H / .14, WM_Y + 10 / 720 + (.157 - .07 - 10 / 720) * WM_H / .14)   # the star in its "o" (frame fractions, at rest; v2: (.413, .157))
SFX = ROOT / 'public/episodes/ep002/sfx/navi_original/NAVI_SFX_01.wav'   # her trail, as at her first appearance (level 0.14)
T_END = 412.9                           # the end of the narration (6:53)
RNG = np.random.default_rng(11)


# ------------------------------------------------------------------ the vista: final #17+18 (plate, 1920x1080)
# Quest (hero, 3D shield and sword) and Pixie (princess, turned to him, smiling) are baked into the plate at golden
# hour; the castle sits low in the valley right of centre with the sun right behind it. Measured on the plate
# (fractions): Quest x .30-.46, hat top y .20, feet .91; Pixie x .45-.64, head top .30, face ~(.50, .36); castle
# (.69, .45), sun (.67, .41), the plate's own birds (.77, .37). Left and right thirds calm (end screen).
VISTA = final_plate('outcrop')
DUO = (.47, .60)                                                              # the middle of the two of them (plate fractions)
SUN = (.67, .41)
HEADS = (.45, .32)                                                            # between their faces: where her look lands


def scene(t):
    """The vista (plate px). The plate is a still: Pixie is already turned to Quest, smiling. Her approved turn on
    "Maybe" (T_TURN) becomes a soft warm light that swells over the two of them on that word (beat change)."""
    im = VISTA
    kl = min(1, max(0, (t - T_TURN) / .6))
    if kl > 0:
        e = ease(kl)
        im = CART.glow(im, HEADS[0] * PW, HEADS[1] * PH, P(420), (255, 214, 150), .22 * e)
        im = CART.glow(im, SUN[0] * PW, SUN[1] * PH, P(300), (255, 236, 190), .18 * e)
    return im


CAM0 = (1.5, .47, .48)                                                        # close behind them, heads in frame (the cut from block T)
CAM1 = (1.0, .5, .5)                                                          # the whole vista


def cam(t):
    return cam_box((CAM0, CAM1), ease(min(1, max(0, (t - T0 - .2) / 4.2))))  # U1: rise and pull back to the whole vista


def to_frame(px, py, box):
    """Plate fractions -> frame fractions for the camera box."""
    return (px * PW - box[0]) / (box[2] - box[0]), (py * PH - box[1]) / (box[3] - box[1])


def birds(fr, t, box):
    """A few birds crossing the sun, right of Pixie (plate positions, through the camera); the plate has its own."""
    d = ImageDraw.Draw(fr)
    for i in range(5):
        k = ((t - T_WHY + 1.0) * .06 + i * .07) % 1
        px = .62 + .40 * k + .015 * i; py = .30 + .02 * math.sin(i * 1.7) - .05 * k
        x, y = to_frame(px, py, box); x *= W; y *= H
        f = math.sin(t * 9 + i) * S(5)
        d.line((x - S(9), y - f, x, y, x + S(9), y - f), fill=(70, 46, 46), width=Si(3))
    return fr


def wordmark(fr, dt):
    """The SecondQuest wordmark (EP001's brand image + gold bar), up in the sky."""
    wm = BBm.WORDMARK
    wh = int(H * WM_H); ww = int(wm.width * wh / wm.height)
    g = Image.new('RGBA', (max(ww, Si(420)) + Si(40), wh + Si(50)))
    g.alpha_composite(wm.resize((ww, wh), Image.LANCZOS), ((g.width - ww) // 2, Si(10)))
    bar = S(400) * WM_H / .14 * BBm._in_out_cubic(min(1, max(0, (dt - .25) / .45)))
    if bar > S(1):
        d = ImageDraw.Draw(g); y = Si(10) + wh + S(12); x0 = (g.width - bar) / 2
        d.rounded_rectangle((x0, y + S(2), x0 + bar, y + S(9)), S(3), fill=(22, 22, 31, 255))
        d.rounded_rectangle((x0, y, x0 + bar, y + S(7)), S(3), fill=(255, 200, 61, 255))
    x = min(1, dt / .28); e = BBm._out_back(x)
    sc = 1.3 + (1 - 1.3) * e
    g = g.resize((max(1, int(g.width * sc)), max(1, int(g.height * sc))), Image.LANCZOS)
    return comp(fr, fade(g, min(1, x * 4)), W / 2 - g.width / 2, H * WM_Y)


def navi_at(t):
    """Navi's path (plate fractions): hovering in the sky between them, circling them, up to the wordmark, around it,
    into the star. Once the pull-back ends the plate fills the frame, so the wordmark part is in frame fractions too."""
    cx, cy, rx, ry = DUO[0], DUO[1], .21, .05
    if t < T_ORB0:
        return .50 + .01 * math.sin(t * 2), .24 + .01 * math.cos(t * 2.4)
    if t < T_ORB1:                                                          # around the two of them (1.25 turns)
        a = 2 * math.pi * 1.25 * ease((t - T_ORB0) / (T_ORB1 - T_ORB0))
        return cx + rx * math.sin(a), cy - ry * math.cos(a)
    ex, ey = cx + rx * math.sin(2.5 * math.pi), cy - ry * math.cos(2.5 * math.pi)
    wx, wy, wrx, wry = .5, WM_Y + WM_H * .55, .27 * WM_H / .14, .085 * WM_H / .14
    if t < T_UP1:                                                           # up to the wordmark's right end
        k = ease((t - T_ORB1) / (T_UP1 - T_ORB1))
        return lin(ex, wx + wrx, k), lin(ey, wy, k) - .05 * math.sin(math.pi * k)
    if t < T_LOOP1:                                                         # around the wordmark (one and a half turns)
        a = 3 * math.pi * ((t - T_UP1) / (T_LOOP1 - T_UP1))
        return wx + wrx * math.cos(a), wy - wry * math.sin(a)
    k = ease(min(1, (t - T_LOOP1) / max(.05, T_STAR - T_LOOP1)))            # into the star
    return lin(wx - wrx, STAR[0], k), lin(wy, STAR[1], k) - .03 * math.sin(math.pi * k)


NAVI_KEYS = [(T0 + i * .04, *to_frame(*navi_at(T0 + i * .04), cam(T0 + i * .04))) for i in range(int((T_END - T0) / .04) + 2)]


def star_twinkle(fr, dt):
    if dt > .9:
        return fr
    k = math.sin(min(1, dt / .9) * math.pi)
    x, y = STAR[0] * W, STAR[1] * H
    fr = CART.glow(fr, x, y, S(70), (255, 240, 200), .7 * k)
    d = ImageDraw.Draw(fr)
    L = S(34) * k
    d.polygon([(x, y - L), (x + L * .18, y - L * .18), (x + L, y), (x + L * .18, y + L * .18), (x, y + L), (x - L * .18, y + L * .18),
               (x - L, y), (x - L * .18, y - L * .18)], fill=(255, 250, 230))
    return fr


def continue_menu(fr, t, a):
    """The end as a game's CONTINUE? menu (Producer, 2026-10-06, video-game detail 9): over YouTube's end-screen slots,
    NEXT QUEST (the video) and JOIN THE PARTY (subscribe); the cursor hops between them."""
    items = (('NEXT QUEST', W * .04, H * .34 - S(50), False), ('JOIN THE PARTY', W * .95, H * .56 - S(50), True))
    sel = int(max(0, t - T_COMM - .6) / 1.4) % 2
    out = fr.convert('RGBA')
    title = UI.fade(UI.area_title('CONTINUE?', size=34, band=True, rules=False), a)
    out.alpha_composite(title, (int(W * .04), int(H * .34 - S(112))))
    for i, (txt, x, y, right) in enumerate(items):
        g = UI.sq_tag(txt, 20, col=UI.GOLD if sel == i else (225, 228, 240))
        gx = x - g.width if right else x
        out.alpha_composite(UI.fade(g, a), (int(gx), int(y)))
        if sel == i:                                                          # the cursor, bobbing at the item's left
            cx, cy = gx - S(4) + S(3) * math.sin(t * 8), y + g.height / 2
            ImageDraw.Draw(out).polygon([(cx - S(16), cy - S(11)), (cx, cy), (cx - S(16), cy + S(11))], fill=UI.GOLD + (int(255 * a),), outline=UI.INK + (int(255 * a),))
    return out.convert('RGB')


def render(t):
    box = cam(t)
    fr = scene(t).crop(tuple(int(v) for v in box)).resize((W, H), Image.BICUBIC)
    if t < T0 + .5:                                                           # out of block T: a soft dissolve
        last = BT.render(T0 - .02)
        fr = Image.blend(last, fr, ease((t - T0) / .5))
    fr = birds(fr, t, box)
    if t >= T_WHY:
        fr = wordmark(fr, t - T_WHY)
    lab = 'U1 what game would you go back to?' if t < T_WHY - .3 else 'U2 what deserves a why? next' if t < T_COMM else 'U3 tell me in the comments · end screen room'
    op = 1.0 if t < T_STAR - .15 else max(0.0, (T_STAR - t) / .15)
    if op > 0:
        fr = fairy_fx.draw(fr, NAVI_KEYS, t, size=.03, opacity=op)
    if t >= T_STAR - .05:                                                     # she goes into the star: it twinkles
        fr = star_twinkle(fr, t - T_STAR + .05)
    d = ImageDraw.Draw(fr)
    if t >= T_COMM:                                                           # the CONTINUE? menu; the dashed slot guides only with PLANNING=1
        a = min(1, (t - T_COMM) / .5)
        for (x0, y0, x1, y1, s) in (() if not PLANNING else ((W * .04, H * .34, W * .27, H * .62, 'END SCREEN · video'), (W * .79, H * .56, W * .95, H * .80, 'END SCREEN · subscribe'))):
            for i in range(0, int(x1 - x0), Si(14)):
                d.line((x0 + i, y0, x0 + i + S(7), y0), fill=(255, 255, 255), width=Si(2)); d.line((x0 + i, y1, x0 + i + S(7), y1), fill=(255, 255, 255), width=Si(2))
            for i in range(0, int(y1 - y0), Si(14)):
                d.line((x0, y0 + i, x0, y0 + i + S(7)), fill=(255, 255, 255), width=Si(2)); d.line((x1, y0 + i, x1, y0 + i + S(7)), fill=(255, 255, 255), width=Si(2))
            d.text((x0 + S(8), y0 + S(6)), s, font=F(14), fill=(255, 255, 255), stroke_width=Si(2), stroke_fill=(20, 14, 18))
        fr = continue_menu(fr, t, a)
        d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 27 OUR NEXT QUEST · {lab} · BLOCK U v8 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('u1a', T0 + .8), ('u1', T0 + 3.0), ('u2', T_WHY + .8), ('u2o', (T_ORB0 + T_ORB1) / 2), ('u2w', (T_UP1 + T_LOOP1) / 2), ('u3s', T_STAR + .3), ('u3', T_END - .3))



# (Producer, 2026-10-06: no area card here - this last view stays clean)


def main():
    out = out_path(ROOT / 'docs/ep002/EP002_blockU_animatic_v8.mp4')
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr), '-i', str(SFX),
                          '-filter_complex', f'[2:a]adelay={int((T_ORB0 - T0) * 1000)}:all=1,volume=0.14[s];[1:a][s]amix=inputs=2:duration=first:normalize=0[a]',
                          '-map', '0:v', '-map', '[a]',
                          *video_args(), *audio_args(), '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(out_path(ROOT / f'docs/ep002/blockU_v8_{name}.jpg'), quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(out_path(ROOT / f'docs/ep002/blockU_v8_{name}.jpg'), quality=85)
        print('stills')
    else:
        main()
