#!/usr/bin/env python3
"""EP002 animatic, block L (planning only): l87 "The safest remake imaginable would change almost nothing." ->
l93 "But there is a problem." (Act 4 opens; block M starts on l94).

The safe remake as a museum (Producer approved, 2026-10-04: "con las manos del restaurador").
  L1  "The safest remake imaginable would change almost nothing."  A museum hall. The spotlight finds a glass case on a
                                          plinth behind a velvet rope: the sword's temple in 1998 (dusty) and the N64 pad.
                                          The wall card: REMAKE 2026 · CHANGES: 0.01%.
  L2  "Sharper textures."                 A band of light sweeps the picture: behind it the dust and blur are gone.
  L3  "Better resolution."                The blocky pixels split, twice, into finer ones: the same field, same layout.
  L4  "Cleaner controls."                 The camera leans in on the pad; a shine sweeps it, and in a flash the N64 pad
                                          becomes today's handheld (our 3D Switch 2-like console), its screen waking up
                                          on the same temple in full detail (Producer idea).
  L5  "Everything exactly where you remember it."  Tracing paper with the 1998 outline slides over the picture and
                                          lands exactly on it: corner marks turn green, a 100% MATCH stamp.
  L6  "And that sounds respectful."       A gold plaque on the plinth: RESPECTFUL, with a shine.
  L7  "But there is a problem."           The glass of the case cracks; Navi flushes red with a "!".
v2 (Producer): no restorer's hands (they did not read as hands); the case holds a new place, the sword's temple
(not block G's field again); zoom on the pad while it is cleaned; green light leaks through the crack; a
PLEASE DO NOT TOUCH sign tilts when the glass cracks. HUD: hidden (a museum, not the game). Sounds: none (all at
the end). Framing QC before sending.
v6: the picture in the case is the final temple plate (#13) with our 3D sword v2 in its pedestal slot (was a procedural
temple); the 3D sword frames are v2.
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, W, H, PW, PH, FPS, T, ease, lin, final_plate, subtitle, tag, F  # noqa
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


SWD = [Image.open(f).convert('RGBA') for f in sorted((ROOT / 'public/art/ep002/props3d/sword_spin').glob('f*.png'))]


TEMPLE_SLOT = (960, 395)                                                    # the slot on the pedestal of plate #13 (plate px, 1920x1080)
TEMPLE_SWORD_H = 210                                                        # our 3D sword v2 at plate scale: the blade fills the slot


def temple_plate():
    """The sword's temple: final art #13 (temple hall, light shafts, the crest banners) with our 3D sword v2 planted in
    the slot on its pedestal (the plate itself is never modified: the sword is a layer)."""
    im = final_plate('temple').convert('RGBA')
    sw = SWD[12].transpose(Image.FLIP_TOP_BOTTOM)
    sw = sw.crop(sw.getchannel('A').getbbox())
    sw = sw.resize((max(1, int(sw.width * TEMPLE_SWORD_H / sw.height)), TEMPLE_SWORD_H), Image.LANCZOS)
    vis = int(sw.height * .78)                                              # the tip is in the stone
    sw = sw.crop((0, 0, sw.width, vis))
    im = CART.glow(im.convert('RGB'), TEMPLE_SLOT[0], TEMPLE_SLOT[1] - 90, 160, (200, 230, 255), .45).convert('RGBA')
    im.alpha_composite(sw, (int(TEMPLE_SLOT[0] - sw.width / 2), int(TEMPLE_SLOT[1] + 3 - vis)))
    return im.convert('RGB')


TEMPLE_FULL = temple_plate()
TEMPLE = TEMPLE_FULL.crop((240, 0, 1680, 1080)).resize((800, 600), Image.LANCZOS)   # 4:3, centred on the pedestal



def field_1998(res):
    """The temple with the 1998 look at a given resolution: same layout, only the pixel size changes."""
    rw, rh = int(80 * res), int(60 * res)
    b = TEMPLE.resize((rw, rh), Image.BILINEAR).quantize(32 if res < 2 else 96).convert('RGB')
    a = np.asarray(b).astype(np.float32); g = a.mean(2, keepdims=True); a = g + (a - g) * (.8 + .08 * (res - 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((PIC_W, PIC_H), Image.NEAREST)


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
PAD = sized(_pad, 80)                                                    # Producer: smaller


_sw = Image.open(ROOT / 'public/art/ep002/props3d/switch2_room.png').convert('RGBA')
SW2 = _sw.resize((200, int(_sw.height * 200 / _sw.width)), Image.LANCZOS)   # our 3D Switch 2-like handheld, screen = green key


def _screen_quad(im):
    import cv2
    a = np.asarray(im).astype(np.int16)
    m = ((a[..., 1] > 180) & (a[..., 0] < 120) & (a[..., 2] < 120) & (a[..., 3] > 0)).astype(np.uint8)
    c, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = max(c, key=cv2.contourArea)
    q = cv2.approxPolyDP(c, .04 * cv2.arcLength(c, True), True)[:, 0].astype(np.float32)
    s = q.sum(1); d = np.diff(q, axis=1)[:, 0]
    quad = np.array([q[np.argmin(s)], q[np.argmin(d)], q[np.argmax(s)], q[np.argmax(d)]], np.float32)   # tl, tr, br, bl
    return quad, m.astype(bool)


SW2_QUAD, SW2_MASK = _screen_quad(SW2)
TEMPLE_HD = TEMPLE_FULL.resize((800, 450), Image.LANCZOS)                  # 16:9, today's picture: same temple, full detail


def switch2(k, t):
    """The handheld with its screen: off (dark glass) -> today's temple, k = how awake the screen is."""
    import cv2
    w, h = SW2.size
    src = np.asarray(TEMPLE_HD.convert('RGB')).astype(np.float32)
    sh, sw_ = src.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [sw_, 0], [sw_, sh], [0, sh]]), SW2_QUAD)
    pic = cv2.warpPerspective(src, M, (w, h))
    dark = np.array([16, 18, 24], np.float32)
    pic = dark + (pic - dark) * k
    out = np.asarray(SW2).copy()
    out[SW2_MASK, :3] = np.clip(pic[SW2_MASK], 0, 255).astype(np.uint8)
    return Image.fromarray(out)


def _dusty_pad(p):
    a = np.asarray(p).astype(np.float32)
    rgb = a[..., :3]; g = rgb.mean(2, keepdims=True)
    rgb = g + (rgb - g) * .25
    rgb = rgb * .7 + np.array([165, 155, 140]) * .3
    a[..., :3] = rgb
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


PAD_DUSTY = _dusty_pad(PAD)


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


CRACK_PT = (CASE[0] + (CASE[2] - CASE[0]) * .66, CASE[1] + (CASE[3] - CASE[1]) * .34)


def case_glass(fr, crack):
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    x0, y0, x1, y1 = CASE
    d.rectangle((x0, y0, x1, y1), fill=(190, 220, 235, 26), outline=(210, 230, 240, 200), width=3)
    d.line((x0 + 14, y0 + 14, x1 - 14, y0 + 14), fill=(230, 245, 250, 120), width=2)                     # top edge depth
    for k, (a, b) in enumerate(((.12, .30), (.22, .27), (.70, .80))):                                   # glass streaks
        d.line((x0 + (x1 - x0) * a, y0 + 10, x0 + (x1 - x0) * (a + b * .5), y1 - 10), fill=(255, 255, 255, 46 if k < 2 else 30), width=8 if k == 0 else 4)
    if crack > 0:
        cx, cy = CRACK_PT
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


def sign(fr, t):
    """Producer improvement: a PLEASE DO NOT TOUCH sign on the wall; when the glass cracks it loses a nail and swings."""
    w, h = 236, 46
    g = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(g)
    d.rectangle((0, 0, w - 1, h - 1), fill=(236, 230, 214, 255), outline=(120, 110, 90, 255), width=2)
    s1 = 'PLEASE DO NOT TOUCH'
    d.text((w / 2 - d.textlength(s1, font=F(15)) / 2, 13), s1, font=F(15), fill=(160, 30, 40, 255))
    d.ellipse((8, 6, 16, 14), fill=(120, 110, 90, 255))
    ang = 0
    if t > T_CRACK:                                                          # hangs from the left nail, damped swing
        u = t - T_CRACK
        ang = -(9 + 7 * math.exp(-u * 3) * math.cos(u * 11))
    else:
        d.ellipse((w - 16, 6, w - 8, 14), fill=(120, 110, 90, 255))
    pivot = (W * .19 - w / 2 + 12, H * .53 + 10)
    big = Image.new('RGBA', (w * 2 + 40, w * 2 + 40)); big.paste(g, (w + 20 - 12, w + 20 - 10))
    big = big.rotate(ang, resample=Image.BICUBIC, center=(w + 20, w + 20))
    return comp(fr, big, pivot[0] - (w + 20), pivot[1] - (w + 20))


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
    kc = ease(min(1, max(0, (t - T_CTL - .1) / (T_SAME - T_CTL - .2))))     # L4: cleaned... and it becomes today's console
    km = min(1, max(0, (kc - .55) / .25))                                     # Producer idea: N64 pad -> Switch 2
    if km < 1:
        k1 = min(1, kc / .55)
        pad = Image.blend(PAD_DUSTY, PAD, k1) if 0 < k1 < 1 else (PAD if k1 >= 1 else PAD_DUSTY)
        if 0 < k1 < 1:                                                       # a shine sweeps the pad, twice
            for s0 in (.05, .5):
                q = (k1 - s0) / .45
                if 0 < q < 1:
                    sh = Image.new('L', pad.size, 0); x = -30 + (pad.width + 60) * q
                    ImageDraw.Draw(sh).polygon(((x, 0), (x + 22, 0), (x - 8, pad.height), (x - 30, pad.height)), fill=170)
                    sh = Image.fromarray(np.minimum(np.asarray(sh), np.asarray(pad.getchannel('A'))))
                    pad = pad.copy(); pad.paste(Image.new('RGBA', pad.size, (255, 255, 245, 255)), (0, 0), sh)
        pad = fade(pad, 1 - km)
        fr = comp(fr, pad, PAD_C[0] - pad.width / 2, PAD_C[1] - pad.height / 2)
    if km > 0:
        ks = min(1, max(0, (kc - .8) / .2))                                  # the screen wakes up on today's temple
        sw = switch2(ks if t < T_SAME + 2 else 1, t)
        sc = .8 + .2 * ease(km) + .06 * math.sin(math.pi * km)
        sw = sw.resize((int(sw.width * sc), int(sw.height * sc)), Image.LANCZOS)
        fr = comp(fr, fade(sw, km), PAD_C[0] - sw.width / 2, PAD_C[1] - sw.height / 2)
    if 0 < km < 1:                                                           # the flash of the swap
        fr = CART.glow(fr, PAD_C[0], PAD_C[1], 130, (255, 255, 240), .9 * math.sin(math.pi * km))
    fr = tracing(fr, t)
    crack = min(1, max(0, (t - T_CRACK + .1) / .35))
    fr = case_glass(fr, crack)
    if crack > 0:                                                            # Producer improvement: the light of something new leaks out
        kg = ease(min(1, (t - T_CRACK) / .6))
        fr = CART.glow(fr, CRACK_PT[0], CRACK_PT[1], int(70 + 60 * kg), (150, 255, 160), .75 * kg)
        g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
        for i in range(7):
            ang = -2.6 + i * .55 + .05 * math.sin(t * 3 + i)
            L = (90 + 40 * (i % 3)) * kg
            gd.polygon(((CRACK_PT[0], CRACK_PT[1]), (CRACK_PT[0] + L * math.cos(ang - .05), CRACK_PT[1] + L * math.sin(ang - .05)),
                        (CRACK_PT[0] + L * math.cos(ang + .05), CRACK_PT[1] + L * math.sin(ang + .05))), fill=(190, 255, 190, int(120 * kg)))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(3))).convert('RGB')
    fr = sign(fr, t)
    fr = plaque(fr, ease(min(1, max(0, (t - T('l92.w4') + .15) / .4))), t)
    fr = wall_card(fr, t)
    fr = rope(fr, t)
    # L2 (no hands, Producer): a band of light sweeps the picture and the dust flies off it
    if T_TEX - .05 < t < T_RES:
        kb = min(1, max(0, (t - T_TEX) / (T_RES - T_TEX - .1)))
        ex = PIC_X + PIC_W * ease(kb)
        g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
        gd.rectangle((ex - 10, PIC_Y - 6, ex + 10, PIC_Y + PIC_H + 6), fill=(255, 250, 225, 170))
        r = np.random.default_rng(int(t * 24))
        for _ in range(26):                                                   # dust motes blown off to the right
            dx, dy = r.random() * 90, r.random() * PIC_H
            gd.ellipse((ex + dx - 2, PIC_Y + dy - 2, ex + dx + 2, PIC_Y + dy + 2), fill=(225, 215, 190, int(220 * (1 - dx / 90))))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(1.5))).convert('RGB')
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
    kz = ease(min(1, max(0, (t - T_CTL + .1) / .45))) * (1 - ease(min(1, max(0, (t - T_SAME + .25) / .45))))
    zoom *= 1 + .6 * kz                                                     # Producer improvement: lean in on the pad
    ax, ay = lin(W * .5, PAD_C[0], kz), lin(H * .42, PAD_C[1], kz)
    shake = 6 * math.exp(-(t - T_CRACK) * 8) * math.sin(t * 90) if t > T_CRACK else 0   # the crack jolts the shot
    if zoom > 1:
        cw, ch = W / zoom, H / zoom; cx0, cy0 = ax - cw / 2 + shake, ay - ch * .5 * (1 + .16 * (1 - kz)) + ch * .08 * (1 - kz)
        cx0 = min(max(cx0, 0), W - cw); cy0 = min(max(cy0, 0), H - ch)
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
    tag(d, f'SEQ 18 THE SAFE REMAKE · {lab} · BLOCK L v6 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('l1', T_NOTHING + .8), ('l2', T_TEX + .5), ('l3', T_RES + 1.0), ('l4', T_CTL + .5), ('l4b', T_SAME - .1), ('l5', T('l91.w6') + .5),
          ('l6', T_RESP + 1.0), ('l7', T_END - .2))


def main():
    out = ROOT / 'docs/ep002/EP002_blockL_animatic_v6.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockL_v6_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockL_v6_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
