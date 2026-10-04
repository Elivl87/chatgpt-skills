#!/usr/bin/env python3
"""EP002 animatic, block H (planning only): l59 "But every improvement quietly changes the memory attached to it." ->
l62 "...without making people wonder where their game went." (end of Act 2, plus the pause before Act 3).

All in Hyrule, so the in-game HUD stays on (hearts 2.5 from blocks F/G). The camera continues block G's last framing.
  H1  "But every improvement quietly changes the memory attached to it."  The "Saturday, 1998" polaroid from block F
                                                        floats back in. Upgrades (HD, our camera icon, a note, a voice)
                                                        drift quietly into it one by one: each one cools and sharpens the
                                                        photo a little, and the handwritten date fades.
  H2  "That is the impossible job."                     A game-style message box types out: NEW QUEST / The Impossible Job.
  H3  "Make it different enough to justify existing..." A balance slider (FAMILIAR <-> DIFFERENT, our ocarina as the
                                                        knob) slides to DIFFERENT and Hyrule restyles with it.
  H4  "...without making people wonder where their game went."  Cut to hero Quest facing us, hand on chin, "?";
                                                        a faint 1998 memory of the field flickers beside him; the knob
                                                        swings back and wobbles around the narrow sweet spot.
Sounds: Bram only. Framing QC before sending.
"""
import colorsys, importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, cutout, subtitle, tag, F  # noqa
import fairy as fairy_fx  # noqa
import hud  # noqa: in-game HUD in every Hyrule shot (Producer)
from icons import camera_icon  # noqa: the episode's game-camera icon

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


G = load('blockG', 'scripts/ep002-blockG-animatic.py')           # field, looks, Quest, the camera G ends on
FB = load('blockF_B', 'scripts/ep002-blockF-B-animatic.py')      # the "Saturday, 1998" polaroid
CART = G.CART
comp, sized, crop = G.comp, G.sized, G.crop

T0 = T('l59') - 0.05
T_JOB = T('l60') - .05
T_DIFF = T('l61') - .05
T_WONDER = T('l62') - .05
T_END = T('l63') - 0.05                # block I starts on l63 "And Nintendo has another problem."
HEARTS = 2.5                           # carried over from blocks F and G
UPGRADES = [('hd', T('l59.w3')), ('camera', T('l59.w4')), ('note', T('l59.w5')), ('voice', T('l59.w7'))]
FLY = .55
THINK = cutout('quest2:thinking_chin', 'hero')
INK = (20, 14, 18, 255)


# ------------------------------------------------------------------ the polaroid that changes quietly
POLA_OLD = FB.POLA_IMG
_new = ImageEnhance.Sharpness(ImageEnhance.Contrast(ImageEnhance.Color(POLA_OLD).enhance(1.7)).enhance(1.3)).enhance(2.5)
POLA_NEW = Image.blend(_new, Image.new('RGB', _new.size, (150, 200, 255)), .12)          # the warm afternoon goes cool and crisp


def changes(t):
    """How many upgrades have landed in the photo (fractional while one is settling)."""
    return sum(min(1, max(0, (t - (ti + FLY)) / .5)) for _, ti in UPGRADES)


def polaroid(t):
    c = changes(t) / len(UPGRADES)
    img = Image.blend(POLA_OLD, POLA_NEW, c)
    card = Image.new('RGBA', (img.width + 20, img.height + 46), (250, 246, 236, 255)); card.paste(img, (10, 10))
    d = ImageDraw.Draw(card)
    d.text((12, img.height + 16), FB.POLA_CAP, font=F(18), fill=(70, 55, 40, int(255 * (1 - .8 * c))))   # the date fades
    return card


POLA_REST = (W * .07, H * .22)
POLA_SCALE = 1.05


def pola_center():
    w, h = (POLA_OLD.width + 20) * POLA_SCALE, (POLA_OLD.height + 46) * POLA_SCALE
    return POLA_REST[0] + w / 2, POLA_REST[1] + h * .42


def chip(kind):
    if kind == 'camera':
        return camera_icon(rec=True, width=70)
    g = Image.new('RGBA', (80, 56)); d = ImageDraw.Draw(g)
    if kind == 'hd':
        d.rounded_rectangle((4, 6, 76, 50), 10, fill=(30, 36, 60, 240), outline=INK, width=3)
        d.text((16, 10), 'HD', font=F(30), fill=(150, 220, 255, 255))
    elif kind == 'note':
        d.ellipse((12, 4, 68, 52), fill=(232, 196, 90, 240), outline=INK, width=3)
        d.text((26, 6), '♪', font=F(36), fill=(255, 255, 255, 255), stroke_width=2, stroke_fill=(70, 45, 15))
    else:                                                               # voice: a little bubble with a waveform
        d.rounded_rectangle((4, 6, 76, 46), 14, fill=(250, 250, 250, 245), outline=INK, width=3)
        d.polygon([(18, 44), (14, 54), (28, 45)], fill=(250, 250, 250, 245), outline=INK)
        for j in range(8):
            hh = 6 + 18 * abs(math.sin(j * 1.3))
            d.line((16 + j * 7, 26 - hh / 2, 16 + j * 7, 26 + hh / 2), fill=(60, 120, 220, 255), width=4)
    return g


def upgrades_fly(fr, t):
    ex, ey = pola_center()
    for j, (kind, ti) in enumerate(UPGRADES):
        u = (t - ti) / FLY
        if 0 <= u < 1:                                                  # drifts in quietly from the right, shrinking into the photo
            sx, sy = W * (.78 + .03 * j), H * (.42 + .03 * (j % 2))        # from the right, arcing high over the castle
            x = lin(sx, ex, ease(u)); y = lin(sy, ey, ease(u)) - H * .27 * math.sin(math.pi * ease(u))
            g = chip(kind); s = lin(1.3, .35, ease(u))
            g = g.resize((max(1, int(g.width * s)), max(1, int(g.height * s))), Image.LANCZOS)
            if u > .8:
                g.putalpha(g.getchannel('A').point(lambda v: int(v * (1 - u) / .2)))
            fr = comp(fr, g, x - g.width / 2, y - g.height / 2)
        if 1 <= u < 1 + .5 / FLY:                                       # a soft ripple where it lands, no flash
            k = (u - 1) * FLY / .5
            fr = CART.glow(fr, ex, ey, int(60 + 80 * k), (200, 230, 255), .25 * (1 - k))
    return fr


# ------------------------------------------------------------------ H2: the message box
def message_box(fr, t, alpha=1.0):
    bw, bh = 450, 104
    x0, y0 = W * .035, H * .30                                          # where the photo was: left of the castle
    g = Image.new('RGBA', (bw + 8, bh + 8)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((4, 4, bw + 4, bh + 4), 18, fill=(10, 14, 48, 205), outline=(235, 235, 250, 255), width=3)
    d.text((28, 16), 'NEW QUEST', font=F(18), fill=(232, 196, 90, 255))
    full = 'The Impossible Job'
    n = int(len(full) * min(1, max(0, (t - T_JOB - .15) / (T('l60.w5') + .25 - T_JOB - .15))))   # types out like the game's text
    d.text((28, 44), full[:n], font=F(36), fill=(255, 255, 255, 255))
    if n == len(full) and int(t * 3) % 2 == 0:                          # the blinking "next" arrow
        d.polygon([(bw - 30, bh - 22), (bw - 10, bh - 22), (bw - 20, bh - 8)], fill=(90, 220, 120, 255))
    if alpha < 1:
        g.putalpha(g.getchannel('A').point(lambda v: int(v * alpha)))
    return comp(fr, g, x0, y0)


# ------------------------------------------------------------------ H3-H4: the balance slider
SWEET = .05                                                             # half-width of the green sweet spot


def knob_at(t):
    if t < T('l61.w3'):
        return .5
    if t < T_WONDER:                                                    # "different enough to justify existing"
        return lin(.5, .88, ease(min(1, (t - T('l61.w3')) / (T('l61.w7') - T('l61.w3')))))
    u = t - T_WONDER                                                    # "without..." swings back, wobbles around the middle
    return .5 + .38 * math.exp(-u * .9) * math.cos(u * 3.4)


def slider(fr, t, y, alpha):
    if alpha <= 0:
        return fr
    x0, x1 = W * .34, W * .63
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((x0 - 14, y - 46, x1 + 14, y + 26), 16, fill=(10, 14, 48, 175), outline=(235, 235, 250, 200), width=2)
    d.rounded_rectangle((x0, y - 6, x1, y + 6), 6, fill=(30, 30, 40, 255), outline=INK, width=2)
    for i in range(40):                                                 # amber (familiar) -> cyan (different)
        k = i / 39; c = tuple(int(lin(a, b, k)) for a, b in zip((240, 170, 80), (90, 210, 250)))
        d.rectangle((lin(x0 + 3, x1 - 3, k), y - 3, lin(x0 + 3, x1 - 3, k) + (x1 - x0) / 40, y + 3), fill=c + (255,))
    sx0, sx1 = lin(x0, x1, .5 - SWEET), lin(x0, x1, .5 + SWEET)
    d.rounded_rectangle((sx0, y - 9, sx1, y + 9), 5, outline=(90, 230, 120, 255), width=3)    # the narrow sweet spot
    p = knob_at(t)
    hot = min(1, max(0, (p - .6) / .25))
    d.text((x0, y - 38), 'FAMILIAR', font=F(18), fill=(240, 190, 110, 255))
    tw = d.textlength('DIFFERENT', font=F(18))
    d.text((x1 - tw, y - 38), 'DIFFERENT', font=F(18), fill=tuple(int(lin(a, b, hot)) for a, b in zip((140, 200, 230), (200, 245, 255))) + (255,))
    if alpha < 1:
        g.putalpha(g.getchannel('A').point(lambda v: int(v * alpha)))
    fr = Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')
    o = hud._icon('ocarina', 46)                                        # our ocarina is the knob: the game itself on the scale
    if alpha < 1:
        o = o.copy(); o.putalpha(o.getchannel('A').point(lambda v: int(v * alpha)))
    kx = lin(x0, x1, p)
    if abs(p - .5) < SWEET:
        fr = CART.glow(fr, kx, y, 40, (120, 255, 150), .35 * alpha)
    return comp(fr, o, kx - o.width / 2, y - o.height / 2)


def restyle(fr, e):
    """'Different': Hyrule pushed toward a new style (hue + saturation + crisp light) as the knob goes right."""
    if e <= 0:
        return fr
    hsv = np.asarray(fr.convert('HSV')).astype(np.float32)
    hsv[..., 0] = (hsv[..., 0] + 8 * e) % 256
    hsv[..., 1] = np.clip(hsv[..., 1] * (1 + .18 * e), 0, 255)
    out = Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')
    out = ImageEnhance.Contrast(out).enhance(1 + .12 * e)
    return out


def sparkles(fr, t, e):
    if e <= .05:
        return fr
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g); r = np.random.default_rng(4)
    for i in range(26):
        x, y = r.random() * W, H * (.18 + .5 * r.random())
        ph = (t * 1.3 + r.random()) % 1
        s = 4 + 7 * math.sin(math.pi * ph)
        a = int(220 * e * math.sin(math.pi * ph))
        d.line((x - s, y, x + s, y), fill=(255, 255, 255, a), width=2); d.line((x, y - s, x, y + s), fill=(255, 255, 255, a), width=2)
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


def restyle_amount(t):
    return max(0.0, (knob_at(t) - .5) / .38)


# ------------------------------------------------------------------ shots
def back_shot(t):
    """H1-H3: block G's last framing (behind Quest, walking), a slow push in."""
    z = lin(1.25, 1.33, ease((t - T0) / (T_WONDER - T0)))
    base = G.new_look(crop(G.FIELD, (z, .5, .6)))
    hero_h = H * .42 * z / 1.25
    q = sized(G.YOUNG, hero_h)
    e = restyle_amount(t)
    base = restyle(base, e)
    return comp(base, q, W * .5 - q.width / 2, H * .93 - hero_h + 4 * math.sin(t * 9)), e


def front_shot(t):
    """H4: a clearly different shot (Quest facing us), the restyled field behind him."""
    base = G.new_look(crop(G.FIELD, (1.6, .22, .62)))                  # away from the castle: the slider sits above
    e = restyle_amount(t)
    base = restyle(base, e)
    u = t - T_WONDER
    # a faint 1998 memory of the field flickers beside him: "where did my game go?"
    km = min(1, max(0, (t - T('l62.w5') + .1) / .4)) * (1 - min(1, max(0, (t - T('l62.w8') - .5) / .5)))
    if km > 0:
        mem = G.old_look(crop(G.FIELD, (1.25, .5, .6)))
        mem = Image.blend(mem, Image.new('RGB', mem.size, (255, 190, 110)), .2)
        m = Image.new('L', (W, H), 0); md = ImageDraw.Draw(m)
        cx, cy, r = W * .70, H * .44, 190
        md.ellipse((cx - r * 1.3, cy - r, cx + r * 1.3, cy + r), fill=int(170 * km * (.85 + .15 * math.sin(t * 23))))
        base = Image.composite(mem, base, m.filter(ImageFilter.GaussianBlur(28)))
    hero_h = H * .72
    q = sized(THINK, hero_h)
    qx = W * .34 - q.width / 2 + 6 * math.sin(u * 1.4)                 # glances about: a small sway
    fr = comp(base, q, qx, H * .96 - hero_h)
    for j, tw in enumerate((T('l62.w4'), T('l62.w5'))):                 # "?" pops beside his head
        k = min(1, max(0, (t - tw) / .25))
        if k > 0:
            s = int(46 + 14 * j + 10 * math.sin(math.pi * k) * (k < 1))
            d = ImageDraw.Draw(fr)
            d.text((W * .34 + 95 + 50 * j, H * .30 - 34 * j - 8 * k), '?', font=F(s), fill=(255, 255, 255), stroke_width=4, stroke_fill=(20, 14, 18))
    return fr, e


def fading_question(fr, t):
    """Block G ends on the tilted '?' badge: it shrinks away as H begins (no pop at the join)."""
    k = (t - T0) / .35
    if k >= 1:
        return fr
    g = Image.new('RGBA', (180, 180)); d = ImageDraw.Draw(g)
    d.ellipse((10, 10, 170, 170), fill=(70, 190, 100, 235), outline=INK, width=5)
    d.text((62, 36), '?', font=F(96), fill=(255, 255, 255, 255))
    g = g.rotate(25, expand=True, resample=Image.BICUBIC)
    s = 1 - ease(k)
    g = g.resize((max(1, int(g.width * s)), max(1, int(g.height * s))), Image.LANCZOS)
    return comp(fr, g, W * .74 - g.width / 2, H * .5 - g.height / 2)


def render(t):
    if t < T_WONDER:
        fr, e = back_shot(t)
    else:
        fr, e = front_shot(t)
    fr = sparkles(fr, t, e)
    fr = fading_question(fr, t)
    if t < T_JOB + .6:                                                  # H1: the polaroid comes back and quietly changes
        u = min(1, (t - T0) / 1.0)
        out = ease(max(0, (t - T_JOB) / .6))
        card = polaroid(t).rotate(5 + 12 * math.sin((t - T0) * 5) * (1 - u), expand=True, resample=Image.BICUBIC)
        card = card.resize((int(card.width * POLA_SCALE), int(card.height * POLA_SCALE)), Image.LANCZOS)
        if u < .25:
            card.putalpha(card.getchannel('A').point(lambda v: int(v * u / .25)))
        fr = comp(fr, card, POLA_REST[0] - W * .3 * (1 - ease(u)) - W * .35 * out, POLA_REST[1] + 20 * math.sin(math.pi * u) * (1 - u))   # slides in from the left, under the hearts
        fr = upgrades_fly(fr, t)
    if T_JOB <= t < T_DIFF + .4:                                        # H2
        a = min(1, (t - T_JOB) / .25) * (1 - min(1, max(0, (t - T_DIFF) / .4)))
        fr = message_box(fr, t, a)
    if t >= T_DIFF:                                                     # H3-H4: the slider
        fr = slider(fr, t, H * .16, min(1, (t - T_DIFF) / .3))       # top centre: above the castle, between hearts and buttons
    navi = [(T0, .56, .5), (T_JOB, .5, .26), (T_DIFF, .44, .3), (T_WONDER, .62, .32), (T_END, .58, .3)]
    fr = fairy_fx.draw(fr, navi, t, size=.045)
    fr = hud.draw(fr, hearts=HEARTS, t=t)
    d = ImageDraw.Draw(fr)
    lab = ('H1 every improvement changes the memory' if t < T_JOB else 'H2 the impossible job' if t < T_DIFF
           else 'H3 different enough...' if t < T_WONDER else 'H4 ...where did their game go?')
    tag(d, f'SEQ 14 THE IMPOSSIBLE JOB · {lab} · BLOCK H v1 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('h1', T('l59.w8')), ('h2', T('l60.w5') + .4), ('h3', T('l61.w7') + .2), ('h4', T('l62.w7')))


def main():
    out = ROOT / 'docs/ep002/EP002_blockH_animatic_v1.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockH_v1_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer, 2026-10-04)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockH_v1_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
