#!/usr/bin/env python3
"""EP002 animatic, block L (planning only): l87 "The safest remake imaginable would change almost nothing." ->
l93 "But there is a problem." (Act 4 opens; block M starts on l94).

The safe remake as a museum (Producer approved, 2026-10-04: "con las manos del restaurador").
  L1  "The safest remake imaginable would change almost nothing."  A museum hall. The spotlight finds a glass case on a
                                          plinth behind a velvet rope: the 1998 Hyrule field (dusty) and the N64 pad.
                                          The wall card: REMAKE 2026 · CHANGES: 0.01%.
  L2  "Sharper textures."                 A white-gloved restorer's hand sweeps a soft brush across the picture: behind it
                                          the dust and blur are gone.
  L3  "Better resolution."                The blocky pixels split, twice, into finer ones: the same field, same layout.
  L4  "Cleaner controls."                 The other gloved hand polishes the pad with a cloth; it comes up bright.
  L5  "Everything exactly where you remember it."  Tracing paper with the 1998 outline slides over the picture and
                                          lands exactly on it: corner marks turn green, a 100% MATCH stamp.
  L6  "And that sounds respectful."       A gold plaque on the plinth: RESPECTFUL, with a shine.
  L7  "But there is a problem."           The glass of the case cracks; Navi flushes red with a "!".
Restorer: hands only (white cotton gloves), no new art. HUD: hidden (a museum, not the game). Sounds: none (all at
the end). Framing QC before sending.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, W, H, FPS, T, ease, lin, subtitle, tag, F  # noqa
import fairy as fairy_fx  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, ROOT / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


BK = load('blockK', 'scripts/ep002-blockK-animatic.py')          # helpers, block G's 1998 field
G, CART = BK.G, BK.CART
comp, sized, fade, ctext = BK.comp, BK.sized, BK.fade, BK.ctext

T0 = T('l87') - 0.05                    # block K ends here
T_SAFE = T('l87.w2')                    # "safest": the spotlight
T_NOTHING = T('l87.w7')                 # "almost nothing": CHANGES 0.01%
T_TEX = T('l88') - .05
T_RES = T('l89') - .05
T_CTL = T('l90') - .05
T_SAME = T('l91') - .05
T_RESP = T('l92') - .05
T_PROB = T('l93') - .05
T_CRACK = T('l93.w5')                   # "problem"
T_END = T('l94') - 0.05                 # block M starts on l94
INK = (20, 14, 18, 255)
GOLD = (232, 196, 90)

# ------------------------------------------------------------------ the museum
PIC_W, PIC_H = 300, 225                                                     # 4:3, the 1998 picture inside the case
CASE = (W * .5 - 210, H * .13, W * .5 + 210, H * .655)                      # glass case (x0, y0, x1, y1)
PIC_X, PIC_Y = W * .5 - PIC_W / 2, H * .17
PAD_C = (W * .5, H * .575)                                                  # the pad, in front of the picture


def _hall():
    yy = np.mgrid[0:H, 0:W][0].astype(np.float32) / H
    xx = np.mgrid[0:H, 0:W][1].astype(np.float32) / W
    wall = np.array([34, 46, 54], np.float32) * (1 - .35 * yy[..., None]) + 4
    floor = np.array([70, 56, 50], np.float32) * (.75 + .35 * (yy[..., None] - .76) / .24)
    a = np.where(yy[..., None] < .76, wall, floor)
    a[(yy > .70) & (yy < .76)] *= .82                                       # wainscot band
    stripes = ((xx * 18) % 1 < .04) & (yy < .70)                            # wall panelling
    a[stripes] *= .9
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    d.line((0, H * .70, W, H * .70), fill=(22, 28, 34), width=3); d.line((0, H * .76, W, H * .76), fill=(30, 24, 22), width=3)
    ctext(d, W * .5, H * .075, 'HALL OF CLASSICS', 22, (200, 190, 160))
    return im


HALL = _hall()


def field_1998(res):
    """Block G's field with the 1998 look at a given resolution: same layout, only the pixel size changes."""
    src = G.crop(G.FIELD, (1.3, .5, .6))
    rw = int(56 * res); rh = int(32 * res)
    b = src.resize((rw, rh), Image.BILINEAR).resize((W, H), Image.NEAREST)
    a = np.asarray(b).astype(np.float32); g = a.mean(2, keepdims=True); a = g + (a - g) * (.7 + .1 * (res - 1))
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    ch = H * .9                                                              # leaves out the plate's planning label
    x0 = (W - ch * 4 / 3) / 2
    return im.crop((int(x0), 0, int(x0 + ch * 4 / 3), int(ch))).resize((PIC_W, PIC_H), Image.NEAREST)


PIC1 = field_1998(1)
PIC2 = field_1998(2)
PIC4 = field_1998(4)


def dusty(im):
    a = np.asarray(im.filter(ImageFilter.GaussianBlur(2.2))).astype(np.float32)
    a = a * .72 + np.array([150, 140, 120]) * .28
    r = np.random.default_rng(7)
    for _ in range(140):
        x, y = r.integers(0, im.width), r.integers(0, im.height)
        a[max(0, y - 1):y + 1, max(0, x - 1):x + 2] = a[max(0, y - 1):y + 1, max(0, x - 1):x + 2] * .5 + 110
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


PIC0 = dusty(PIC1)
OUTLINE = PIC1.convert('L').filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 18 else 0)

_pad = Image.open(ROOT / 'public/art/ep002/props3d/n64_pad_room.png').convert('RGBA')
PAD = sized(_pad, 104)


def _dusty_pad(p):
    a = np.asarray(p).astype(np.float32)
    rgb = a[..., :3]; g = rgb.mean(2, keepdims=True)
    rgb = g + (rgb - g) * .25
    rgb = rgb * .7 + np.array([165, 155, 140]) * .3
    a[..., :3] = rgb
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


PAD_DUSTY = _dusty_pad(PAD)


# ------------------------------------------------------------------ the restorer's gloved hands
GLOVE = (246, 246, 240, 255)
GLOVE_SH = (214, 214, 206, 255)
SLEEVE = (44, 52, 84, 255)


def _capsule(d, x0, y0, x1, y1, fill):
    r = min(x1 - x0, y1 - y0) / 2
    d.rounded_rectangle((x0, y0, x1, y1), r, fill=fill, outline=INK, width=3)


def brush_hand():
    """Right hand from the right edge, pencil grip on a soft restoration brush (bristles pointing left)."""
    g = Image.new('RGBA', (430, 170)); d = ImageDraw.Draw(g)
    d.polygon(((20, 74), (70, 58), (70, 106), (20, 92)), fill=(222, 196, 140, 255), outline=INK)       # bristles
    for y in range(64, 102, 7):
        d.line((26, 76 + (y - 82) * .3, 68, y), fill=(180, 150, 100, 255), width=1)
    d.rectangle((70, 66, 96, 98), fill=(190, 194, 204, 255), outline=INK, width=3)                      # ferrule
    d.rounded_rectangle((94, 72, 250, 92), 9, fill=(150, 96, 54, 255), outline=INK, width=3)            # handle
    d.rectangle((300, 40, 430, 136), fill=SLEEVE, outline=INK, width=3)                                # sleeve
    d.rounded_rectangle((282, 36, 312, 140), 10, fill=GLOVE, outline=INK, width=3)                     # cuff
    d.rounded_rectangle((196, 44, 296, 132), 34, fill=GLOVE, outline=INK, width=3)                     # palm
    _capsule(d, 186, 98, 236, 122, GLOVE_SH)                                                             # curled fingers below
    _capsule(d, 176, 104, 226, 128, GLOVE)
    _capsule(d, 150, 92, 222, 110, GLOVE)                                                               # thumb under the handle
    _capsule(d, 136, 58, 236, 80, GLOVE)                                                                # index along the handle
    _capsule(d, 156, 74, 232, 96, GLOVE)                                                                # middle
    d.arc((214, 60, 270, 116), 200, 300, fill=GLOVE_SH, width=3)                                         # knuckle shading
    return g


def cloth_hand():
    """Left hand from the lower left, flat on a yellow polishing cloth."""
    g = Image.new('RGBA', (300, 230)); d = ImageDraw.Draw(g)
    d.polygon(((12, 40), (150, 18), (190, 80), (120, 130), (30, 110)), fill=(240, 202, 84, 255), outline=INK)   # cloth
    d.line((40, 60, 140, 40), fill=(205, 168, 60, 255), width=3); d.line((44, 90, 150, 70), fill=(205, 168, 60, 255), width=3)
    d.polygon(((150, 150), (220, 110), (300, 200), (300, 230), (220, 230)), fill=SLEEVE, outline=INK)          # sleeve
    d.rounded_rectangle((132, 118, 214, 172), 20, fill=GLOVE, outline=INK, width=3)                          # cuff
    d.ellipse((70, 56, 176, 150), fill=GLOVE, outline=INK, width=3)                                          # back of the hand
    for i, (x0, y0, x1, y1) in enumerate(((40, 44, 104, 66), (34, 66, 98, 88), (38, 88, 98, 108), (52, 106, 104, 124))):
        _capsule(d, x0, y0, x1, y1, GLOVE)                                                                   # fingers, flat
    _capsule(d, 120, 30, 170, 54, GLOVE)                                                                     # thumb
    d.arc((90, 70, 160, 140), 120, 220, fill=GLOVE_SH, width=3)
    return g


BRUSH = brush_hand()
CLOTH = cloth_hand()


def rot(im, deg):
    return im.rotate(deg, resample=Image.BICUBIC, expand=True)


# ------------------------------------------------------------------ pieces
def picture(t):
    """The 1998 picture as it gets restored: dust and blur brushed off, then finer pixels, same layout."""
    if t < T_TEX:
        return PIC0.copy(), None
    kb = min(1, max(0, (t - T_TEX) / (T_RES - T_TEX - .1)))
    if kb < 1:                                                              # the brush sweep: clean left of the bristles
        edge = int(PIC_W * ease(kb))
        out = PIC0.copy(); out.paste(PIC1.crop((0, 0, edge, PIC_H)), (0, 0))
        return out, kb
    pic = PIC1
    if t >= T_RES:                                                          # resolution steps: 1 -> 2 -> 4
        s1, s2 = T_RES + .25, T_RES + .7
        if t >= s2:
            pic = PIC4
        elif t >= s1:
            pic = PIC2
    return pic.copy(), None


def flash_line(pic, k):
    """A bright scan line sweeping down as the pixels split."""
    if not 0 < k < 1:
        return pic
    d = ImageDraw.Draw(pic); y = int(PIC_H * k)
    d.rectangle((0, y - 3, PIC_W, y + 3), fill=(255, 255, 240))
    return pic


def case_glass(fr, crack):
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    x0, y0, x1, y1 = CASE
    d.rectangle((x0, y0, x1, y1), fill=(190, 220, 235, 26), outline=(210, 230, 240, 200), width=3)
    d.line((x0 + 14, y0 + 14, x1 - 14, y0 + 14), fill=(230, 245, 250, 120), width=2)                     # top edge depth
    for k, (a, b) in enumerate(((.12, .30), (.22, .27), (.70, .80))):                                   # glass streaks
        d.line((x0 + (x1 - x0) * a, y0 + 10, x0 + (x1 - x0) * (a + b * .5), y1 - 10), fill=(255, 255, 255, 46 if k < 2 else 30), width=8 if k == 0 else 4)
    if crack > 0:
        cx, cy = x0 + (x1 - x0) * .66, y0 + (y1 - y0) * .34
        r = np.random.default_rng(11)
        for i in range(9):
            ang = i * 2 * math.pi / 9 + r.random() * .5
            L = (60 + 140 * r.random()) * ease(min(1, crack * 1.3))
            px, py = cx, cy
            n = 5
            for s in range(n):
                nx = cx + math.cos(ang + (r.random() - .5) * .5) * L * (s + 1) / n
                ny = cy + math.sin(ang + (r.random() - .5) * .5) * L * (s + 1) / n
                nx = min(max(nx, x0 + 4), x1 - 4); ny = min(max(ny, y0 + 4), y1 - 4)
                d.line((px, py, nx, ny), fill=(250, 252, 255, 235), width=3); d.line((px + 1, py + 1, nx + 1, ny + 1), fill=(30, 40, 50, 150), width=1)
                px, py = nx, ny
        rr = 22 * ease(min(1, crack * 2))
        d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline=(250, 252, 255, 220), width=3)
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


def plinth(fr):
    d = ImageDraw.Draw(fr)
    x0, x1 = CASE[0] - 26, CASE[2] + 26
    d.rectangle((x0, CASE[3], x1, CASE[3] + 18), fill=(70, 62, 58), outline=INK[:3], width=3)
    d.rectangle((x0 + 18, CASE[3] + 18, x1 - 18, H), fill=(58, 50, 48), outline=INK[:3], width=3)
    return fr


def plaque(fr, k, t):
    if k <= 0:
        return fr
    w, h = 270, 48
    g = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((0, 0, w - 1, h - 1), 6, fill=(196, 160, 70, 255), outline=(110, 82, 30, 255), width=3)
    d.rounded_rectangle((5, 5, w - 6, h - 6), 4, outline=(240, 214, 130, 255), width=1)
    s = 'RESPECTFUL'
    d.text((w / 2 - d.textlength(s, font=F(24)) / 2 - 14, 9), s, font=F(24), fill=(70, 50, 16, 255))
    cx0 = w / 2 + d.textlength(s, font=F(24)) / 2 - 4
    d.line((cx0, 26, cx0 + 8, 34, cx0 + 22, 14), fill=(70, 50, 16, 255), width=4)
    sh = (t - T_RESP - .35) / .6                                                                            # one shine across
    if 0 < sh < 1:
        m = Image.new('RGBA', (w, h)); md = ImageDraw.Draw(m)
        x = -40 + (w + 80) * sh
        md.polygon(((x, 0), (x + 26, 0), (x + 6, h), (x - 20, h)), fill=(255, 250, 220, 150))
        g.alpha_composite(m)
        g.putalpha(Image.fromarray(np.minimum(np.asarray(g.getchannel('A')), np.asarray(Image.new('L', (w, h), 255)))))
    y = H * .40 + 20 * (1 - ease(k))                                         # on the wall, left of the case (clear of subtitles)
    return comp(fr, fade(g, k), W * .19 - w / 2, y)


def rope(fr, t):
    d = ImageDraw.Draw(fr)
    posts = (W * .2, W * .8); top = H * .64
    sway = 4 * math.sin(t * 1.6)
    pts = []
    for i in range(21):
        u = i / 20
        x = lin(posts[0], posts[1], u); y = top + 6 + 46 * 4 * u * (1 - u) + sway * math.sin(math.pi * u)
        pts.append((x, y))
    d.line(pts, fill=(120, 18, 30), width=11, joint='curve'); d.line([(x, y - 3) for x, y in pts], fill=(170, 40, 50), width=3)
    for x in posts:
        d.rectangle((x - 6, top, x + 6, H * .82), fill=(196, 160, 70), outline=INK[:3], width=2)
        d.ellipse((x - 13, top - 14, x + 13, top + 10), fill=(214, 180, 90), outline=INK[:3], width=2)
        d.ellipse((x - 22, H * .81, x + 22, H * .83), fill=(150, 120, 50), outline=INK[:3], width=2)
    return fr


CHECKS = (('TEXTURES', T_RES - .15), ('RESOLUTION', T_CTL - .1), ('CONTROLS', T_SAME - .1), ('LAYOUT 100%', T('l91.w6') + .2))


def wall_card(fr, t):
    k = min(1, max(0, (t - T_SAFE - .3) / .4))
    if k <= 0:
        return fr
    w, h = 230, 214
    g = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(g)
    d.rectangle((0, 0, w - 1, h - 1), fill=(236, 230, 214, 255), outline=(120, 110, 90, 255), width=2)
    d.text((14, 12), 'OCARINA OF TIME', font=F(17), fill=(40, 34, 30, 255))
    d.text((14, 34), 'REMAKE · 2026', font=F(14), fill=(90, 80, 70, 255))
    if t >= T_NOTHING:
        d.text((14, 58), 'CHANGES:', font=F(14), fill=(90, 80, 70, 255))
        d.text((92, 54), '0.01%', font=F(19), fill=(150, 30, 40, 255))
    d.line((14, 84, w - 14, 84), fill=(170, 160, 140, 255), width=1)
    for i, (s, tc) in enumerate(CHECKS):
        y = 94 + i * 28
        d.rectangle((14, y + 2, 32, y + 20), outline=(90, 80, 70, 255), width=2)
        d.text((42, y + 1), s, font=F(15), fill=(60, 52, 46, 255))
        if t >= tc:
            d.line((16, y + 11, 23, y + 18, 34, y), fill=(40, 150, 70, 255), width=4)
    return comp(fr, fade(g, k), W * .79 - w / 2, H * .22)


def tracing(fr, t):
    """L5: tracing paper with the 1998 outline slides down onto the picture and lands exactly on it."""
    k = ease(min(1, max(0, (t - T_SAME) / .9)))
    if k <= 0:
        return fr
    out = (1 - min(1, max(0, (t - T_RESP - .2) / .4)))                       # leaves as the plaque arrives
    if out <= 0:
        return fr
    paper = Image.new('RGBA', (PIC_W + 30, PIC_H + 30), (240, 244, 250, 120))
    ink = Image.new('RGBA', (PIC_W, PIC_H), (40, 90, 210, 255)); ink.putalpha(OUTLINE.point(lambda v: int(v * .85)))
    paper.alpha_composite(ink, (15, 15))
    d = ImageDraw.Draw(paper)
    locked = k >= 1 and t >= T('l91.w4')                                     # "where you remember": registration locks
    col = (60, 170, 90, 255) if locked else (40, 90, 210, 255)
    for (x, y) in ((15, 15), (PIC_W + 15, 15), (15, PIC_H + 15), (PIC_W + 15, PIC_H + 15)):
        d.line((x - 11, y, x + 11, y), fill=col, width=3); d.line((x, y - 11, x, y + 11), fill=col, width=3)
        d.ellipse((x - 6, y - 6, x + 6, y + 6), outline=col, width=2)
    off = (1 - k) * -260 + (0 if k >= 1 else 6 * math.sin(t * 9))
    fr = comp(fr, fade(paper, out), PIC_X - 15, PIC_Y - 15 + off)
    ks = min(1, max(0, (t - T('l91.w6') - .1) / .25))
    if ks > 0:                                                               # the 100% MATCH stamp
        st = Image.new('RGBA', (220, 70)); sd = ImageDraw.Draw(st)
        sd.rounded_rectangle((3, 3, 216, 66), 8, outline=(60, 170, 90, 255), width=5)
        s = '100% MATCH'; sd.text((110 - sd.textlength(s, font=F(30)) / 2, 14), s, font=F(30), fill=(60, 170, 90, 255))
        st = rot(st, 12)
        sc = 1.6 - .6 * ease(ks)
        st = st.resize((int(st.width * sc), int(st.height * sc)), Image.LANCZOS)
        fr = comp(fr, fade(st, ks * out), PIC_X + PIC_W * .62 - st.width / 2, PIC_Y + PIC_H * .78 - st.height / 2)
    return fr


def frame(t):
    fr = HALL.copy()
    ksp = ease(min(1, max(0, (t - T_SAFE + .2) / .6)))                      # L1: the spotlight finds the case
    warm = .25 * ease(min(1, max(0, (t - T_RESP) / .5)))
    if ksp > 0:
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        d.polygon(((W * .44, 0), (W * .56, 0), (CASE[2] + 70, H * .80), (CASE[0] - 70, H * .80)), fill=(255, 238, 200, int((52 + 40 * warm) * ksp)))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(26))).convert('RGB')
    else:
        fr = Image.blend(fr, Image.new('RGB', fr.size, (8, 10, 14)), .35)
    fr = plinth(fr)
    pic, kb = picture(t)
    if T_RES <= t < T_RES + 1.0:
        for s0 in (T_RES + .25, T_RES + .7):
            pic = flash_line(pic, (t - s0 + .2) / .25)
    d = ImageDraw.Draw(fr)
    d.rectangle((PIC_X - 12, PIC_Y - 12, PIC_X + PIC_W + 12, PIC_Y + PIC_H + 12), fill=(40, 30, 26), outline=GOLD, width=4)
    fr.paste(pic, (int(PIC_X), int(PIC_Y)))
    d.rectangle((PIC_X + PIC_W - 64, PIC_Y + PIC_H + 2, PIC_X + PIC_W + 8, PIC_Y + PIC_H + 24), fill=(40, 30, 26))
    ctext(d, PIC_X + PIC_W - 28, PIC_Y + PIC_H + 3, '1998', 16, (232, 196, 90))
    kc = ease(min(1, max(0, (t - T_CTL - .1) / (T_SAME - T_CTL - .2))))     # L4: the pad comes up bright
    pad = Image.blend(PAD_DUSTY, PAD, kc) if 0 < kc < 1 else (PAD if kc >= 1 else PAD_DUSTY)
    fr = comp(fr, pad, PAD_C[0] - pad.width / 2, PAD_C[1] - pad.height / 2)
    if T_CTL < t < T_SAME + .4:                                              # glints as the dust comes off
        for j, (ox, oy, ph) in enumerate(((-40, -20, 0), (30, -28, .35), (52, 4, .7))):
            q = ((t - T_CTL) * 2.2 + ph) % 1
            if kc > .2 and q < .5:
                s = 12 * math.sin(math.pi * q / .5)
                cx, cy = PAD_C[0] + ox, PAD_C[1] + oy
                d = ImageDraw.Draw(fr)
                d.line((cx - s, cy, cx + s, cy), fill=(255, 255, 235), width=3); d.line((cx, cy - s, cx, cy + s), fill=(255, 255, 235), width=3)
    fr = tracing(fr, t)
    crack = min(1, max(0, (t - T_CRACK + .1) / .35))
    fr = case_glass(fr, crack)
    fr = plaque(fr, ease(min(1, max(0, (t - T('l92.w4') + .15) / .4))), t)
    fr = wall_card(fr, t)
    fr = rope(fr, t)
    # L2: the brush hand sweeps the picture
    if T_TEX - .35 < t < T_RES + .25:
        kin = ease(min(1, (t - T_TEX + .35) / .35)); kout = ease(min(1, max(0, (t - T_RES + .05) / .3)))
        kb = min(1, max(0, (t - T_TEX) / (T_RES - T_TEX - .1)))
        hb = rot(BRUSH, -8)
        tipx = PIC_X + PIC_W * ease(kb) - 14
        x = lin(W + 40, tipx, kin) + 400 * kout
        y = PIC_Y + PIC_H * .55 + 12 * math.sin(t * 14) - hb.height / 2
        fr = comp(fr, hb, x, y)
    # L4: the cloth hand polishes the pad
    if T_CTL - .35 < t < T_SAME + .2:
        kin = ease(min(1, (t - T_CTL + .35) / .35)); kout = ease(min(1, max(0, (t - T_SAME + .1) / .3)))
        a = (t - T_CTL) * 9
        cx = PAD_C[0] - 120 + 22 * math.cos(a) - 300 * (1 - kin) - 300 * kout
        cy = PAD_C[1] - 70 + 12 * math.sin(a) + 200 * (1 - kin) + 200 * kout
        fr = comp(fr, CLOTH, cx, cy)
    # Navi: hovers by the case, then flushes red on "problem"
    keys = [(T0, .30, .30), (T_TEX, .30, .22), (T_SAME, .28, .25), (T_RESP, .25, .30), (T_PROB, .31, .26), (T_END, .32, .25)]
    red = min(1, max(0, (t - T_CRACK) / .25))
    col = tuple(int(lin(c0, c1, red)) for c0, c1 in zip((170, 225, 255), (255, 80, 80)))
    fr = fairy_fx.draw(fr, keys, t, size=.045, color=col)
    if red > 0:
        x, y = fairy_fx.at(keys, t)
        d = ImageDraw.Draw(fr)
        d.text((x * W + 20, y * H - 58), '!', font=F(46), fill=(255, 90, 80), stroke_width=4, stroke_fill=(20, 14, 18))
        fr = Image.blend(fr, Image.new('RGB', fr.size, (120, 0, 0)), .10 * red * (.6 + .4 * math.sin(t * 12)))
    zoom = lin(1.0, 1.07, ease(min(1, (t - T0) / (T_TEX - T0))))             # L1: a slow push in on the case
    shake = 6 * math.exp(-(t - T_CRACK) * 8) * math.sin(t * 90) if t > T_CRACK else 0   # the crack jolts the shot
    if zoom > 1:
        cw, ch = W / zoom, H / zoom; cx0, cy0 = (W - cw) / 2 + shake, (H * .42) - ch * .42
        fr = fr.crop((int(cx0), int(cy0), int(cx0 + cw), int(cy0 + ch))).resize((W, H), Image.BILINEAR)
    lab = ('L1 the safest remake' if t < T_TEX else 'L2 sharper textures' if t < T_RES else 'L3 better resolution' if t < T_CTL
           else 'L4 cleaner controls' if t < T_SAME else 'L5 exactly where you remember it' if t < T_RESP
           else 'L6 respectful' if t < T_PROB else 'L7 but there is a problem')
    return fr, lab


def render(t):
    fr, lab = frame(t)
    if t < T0 + .3:                                                          # out of block K's glow
        fr = Image.blend(Image.new('RGB', fr.size, (255, 245, 215)), fr, (t - T0) / .3)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 18 THE SAFE REMAKE · {lab} · BLOCK L v1 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('l1', T_NOTHING + .8), ('l2', T_TEX + .5), ('l3', T_RES + 1.0), ('l4', T_CTL + .7), ('l5', T('l91.w6') + .5),
          ('l6', T_RESP + 1.0), ('l7', T_END - .2))


def main():
    out = ROOT / 'docs/ep002/EP002_blockL_animatic_v1.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockL_v1_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockL_v1_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
