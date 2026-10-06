#!/usr/bin/env python3
"""EP002 animatic, block C (planning only): l11 "Because the Ocarina of Time people remember..." -> l16 "...particular miracle."

  C1  "...is not exactly the game that came on the cartridge."  The cartridge (own 3D, approved mock) turns on dark;
      on "not exactly" its warm glow cools; on "came on the cartridge" Navi and the camera dive into the label.
  C2  "It is the game..."        The game on a 90s CRT (own 3D TV, free), front on, screen filling the frame.
  C3  "plus the room."            Match-dissolve to the childhood bedroom: the camera pulls back from the TV.
  C4  "Plus the television."      The camera keeps going (no snap back): push towards the TV, its light pulses.
  C5  "Plus the friend who somehow knew where to go."  Pan to the kids; Pixie points at the screen; Navi slips out of
      the TV and circles her (the friend who knew the way) before going back in.
  C6  "Plus an entire Saturday afternoon... particular miracle."  Slow pull out while the light turns to late afternoon;
      a smartphone tries to slide in and is struck out.

Kids = final art #6a kid Quest playing (seated, faces right), #6b kid Pixie pointing, #6c kid Pixie sitting, sized by
face width (Pixie's face = 0.9 x Quest's). Game picture = final field plate #11 with young Quest #3. Bedroom = core
quest_bedroom_morning.
Sounds: Bram only (seq-01 and block B mixes are their own files; nothing new is added here).
"""
import importlib.util, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sys.path.insert(0, str(HERE.parent / 'tools/fx'))
from lib import ROOT, PW, PH, W, H, FPS, T, ease, lin, plate, place, cam_box, to_screen, subtitle, tag, F, FSUB, CUES, final, PLANNING  # noqa
import fairy as fairy_fx  # noqa

FF = imageio_ffmpeg.get_ffmpeg_exe()
spec = importlib.util.spec_from_file_location('cart', ROOT / 'scripts/ep002-cartridge-animatic.py')
CART = importlib.util.module_from_spec(spec); spec.loader.exec_module(CART)
spec = importlib.util.spec_from_file_location('blockB', ROOT / 'scripts/ep002-blockB-animatic.py')
BB = importlib.util.module_from_spec(spec); spec.loader.exec_module(BB)

T0 = BB.T_END                          # block B ends just before l11
T_NOT = T('l11.w9')                    # "not exactly"
T_CAME = T('l11.w14')                  # "came on the cartridge"
T_SCR = T('l12') - 0.1                 # "It is the game..."
T_ROOM = T('l13') - 0.05               # "plus the room."
T_TV = T('l14') - 0.05                 # "Plus the television."
T_FR = T('l15') - 0.05                 # "Plus the friend..."
T_KNEW = T('l15.w6')                   # "knew where to go"
T_PIX_IN = T('l14') - 0.3               # Pixie enters after the dissolve (clean exit from the TV)
T_SAT = T('l16') - 0.05                # "Plus an entire Saturday afternoon..."
T_PHONE = T('l16.w12')                 # "smartphones"
T_END = T('l17') - 0.05                # block D starts on l17
PROPS = ROOT / 'public/art/ep002/props3d'
SAT_END = T('l16.w19')


def rgba(p):
    return Image.open(p).convert('RGBA')


def comp(fr, im, x, y):
    base = fr.convert('RGBA'); base.alpha_composite(im, (int(x), int(y))); return base.convert('RGB')


# ------------------------------------------------------------------ the game picture (shown inside the CRT)
GAME = plate(('final', 'field')).convert('RGBA')
_hero = final('quest_young_back')                                       # the player on screen: young Quest #3 on the road
_hero = _hero.resize((int(_hero.width * PH * .2 / _hero.height), int(PH * .2)), Image.LANCZOS)
GAME.alpha_composite(_hero, (int(PW * .5 - _hero.width / 2), int(PH * .93 - _hero.height)))


def game_picture(t, size):
    """The game on the tube: slow drift across Hyrule, scanlines, a little flicker."""
    w, h = size
    k = (t - T_SCR) * 0.02
    z = 1.25
    cw, ch = PW / z, PH / z
    x0 = (PW - cw) * (0.5 + 0.4 * math.sin(k * 2)); y0 = (PH - ch) * 0.55
    im = GAME.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((w, h), Image.BILINEAR)
    a = np.asarray(im).astype(np.float32)
    a[::3, :, :3] *= 0.82                                               # scanlines
    a[..., :3] *= 0.97 + 0.03 * math.sin(t * 40)                        # flicker
    yy, xx = np.mgrid[0:h, 0:w]; v = 1 - 0.35 * (((xx / w - .5) ** 2 + (yy / h - .5) ** 2) * 2.2)
    a[..., :3] *= v[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def key_quad(im):
    """Corners (tl, tr, br, bl) of the #00ff00 screen key in a CRT render."""
    a = np.asarray(im).astype(int)
    m = (a[..., 1] > 200) & (a[..., 0] < 90) & (a[..., 2] < 90)
    ys, xs = np.nonzero(m)
    s, d = xs + ys, xs - ys
    return [(xs[s.argmin()], ys[s.argmin()]), (xs[d.argmax()], ys[d.argmax()]), (xs[s.argmax()], ys[s.argmax()]), (xs[d.argmin()], ys[d.argmin()])], m


def persp_coeffs(dst, src):
    """PIL PERSPECTIVE coefficients mapping output (dst) points to input (src) points."""
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; B += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()


def fill_screen(tv, quad, mask, pic):
    """Warp the picture onto the key quad and keep it only where the key was."""
    pw_, ph_ = pic.size
    c = persp_coeffs(quad, [(0, 0), (pw_, 0), (pw_, ph_), (0, ph_)])
    warped = pic.transform(tv.size, Image.PERSPECTIVE, c, Image.BILINEAR)
    m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))
    out = tv.copy(); out.paste(warped, (0, 0), m)
    return out


CRT_FRONT = rgba(PROPS / 'crt_front.png')
CRT_34 = rgba(PROPS / 'crt_34.png')
QF, MF = key_quad(CRT_FRONT)
Q34, M34 = key_quad(CRT_34)

# ------------------------------------------------------------------ C1: the cartridge
CARTS = []
for f in sorted((PROPS / 'cart_spin').glob('f*.png')):
    im = rgba(f); CARTS.append(im.crop(im.getchannel('A').getbbox()))


def frame_c1(t):
    fr = Image.new('RGB', (W, H), (12, 8, 10))
    fr = BB.dust(fr, t, seed=5)
    k = (t - T0) / (T_SCR - T0)
    cool = ease(min(1, max(0, (t - T_NOT) / .6)))
    col = tuple(int(lin(a, b, cool)) for a, b in zip((255, 190, 110), (150, 170, 210)))
    fr = CART.glow(fr, W / 2, H / 2, 360, col, lin(.6, .4, cool))
    im = CARTS[min(len(CARTS) - 1, int(k * len(CARTS)))]
    dive = ease(min(1, max(0, (t - T_CAME - .25) / (T_SCR - T_CAME - .25))))
    s = lin(1.0, 1.12, ease(k)) * (1 + 6 * dive ** 2)
    im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    if cool > 0:                                                        # "not exactly": the memory cools a little
        g = im.convert('LA').convert('RGBA'); g.putalpha(im.getchannel('A'))
        im = Image.blend(im, g, .35 * cool * (1 - dive))
    lx, ly = W / 2, H / 2 + 20 * dive                                   # dive towards the label centre
    fr = comp(fr, im, lx - im.width / 2, ly - im.height * .55)
    # Navi circles the cartridge, then leads the dive into the label
    keys = [(T0, .7, .3), (T0 + 1.2, .66, .62), (T0 + 2.4, .3, .6), (T_NOT, .32, .32), (T_CAME, .6, .34), (T_SCR - .3, .5, .5)]
    fr = fairy_fx.draw(fr, keys, t, size=.07 * (1 + 2 * dive))
    if dive > .6:
        fr = Image.blend(fr, Image.new('RGB', fr.size, (255, 246, 225)), (dive - .6) / .4)
    d = ImageDraw.Draw(fr)
    tag(d, 'SEQ 05 THE GAME + THE ROOM · C1 the cartridge · BLOCK C v9 · PLANNING ONLY')
    PLANNING and d.text((20, 40), 'C1 cartridge = own 3D (approved mock) · Navi dives into the label', font=F(15), fill=(255, 220, 160))
    return fr


# ------------------------------------------------------------------ C2: the game on the CRT, front on
def frame_c2(t):
    k = ease((t - T_SCR) / (T_ROOM + .45 - T_SCR))
    x0, y0, x1, y1 = QF[0][0], QF[0][1], QF[2][0], QF[2][1]
    pic = game_picture(t, (x1 - x0, y1 - y0))
    tv = fill_screen(CRT_FRONT, QF, MF, pic)
    bg = Image.new('RGB', (W, H), (26, 18, 14))
    # start with the screen filling the frame, pull back a little so the bezel shows
    sc = lin(W / (x1 - x0) * 1.04, W / tv.width * .9, k)
    tvs = tv.resize((int(tv.width * sc), int(tv.height * sc)), Image.LANCZOS)
    cx, cy = (x0 + x1) / 2 * sc, (y0 + y1) / 2 * sc
    fr = comp(bg, tvs, W / 2 - cx, H / 2 - cy)
    if t < T_SCR + .35:                                                 # out of the white from the dive
        fr = Image.blend(Image.new('RGB', fr.size, (255, 246, 225)), fr, (t - T_SCR) / .35)
    d = ImageDraw.Draw(fr)
    tag(d, 'SEQ 05 · C2 "It is the game..." · CRT = own 3D (free) · screen = final field plate #11 · BLOCK C v9')
    return fr


# ------------------------------------------------------------------ C3-C6: the childhood bedroom
BED = rgba(ROOT / 'public/art/core/backgrounds/quest_bedroom_morning.png').resize((PW, PH), Image.LANCZOS)
TV_BOX = (.78, .47, .955, .675)                                         # a ~21" CRT that fits on the bedside table (Producer: smaller)
tvw = int((TV_BOX[2] - TV_BOX[0]) * PW)
TV_SCALE = tvw / CRT_34.width
TV_POS = (int(TV_BOX[0] * PW), int(TV_BOX[3] * PH - CRT_34.height * TV_SCALE))
Q34P = [(TV_POS[0] + x * TV_SCALE, TV_POS[1] + y * TV_SCALE) for x, y in Q34]
SCR_C = (sum(p[0] for p in Q34P) / 4 / PW, sum(p[1] for p in Q34P) / 4 / PH)   # screen centre (plate fractions)
# Character scale is set by face width (the one measure that does not change with the pose), measured on the library art
# as a fraction of each cut-out's height. Pixie's face = 0.9 x Quest's (she is a little smaller; Producer: never exaggerate).
FACE = {'kid_quest_play': .231, 'kid_pixie_point': .156, 'kid_pixie_sit': .2}  # final art #6a/#6b/#6c, cheek to cheek
QUEST_FACE, PIXIE_RATIO = .13, .9                                       # Quest's face width in plate heights (kids close to camera)
def sized(char, x, y, who_ratio=1.0, depth=1.0):
    """depth < 1: further from the camera (higher on the floor), smaller by perspective only."""
    return dict(art=char, x=x, y=y, h=QUEST_FACE * who_ratio * depth / FACE[char], label=None)
QUEST_K = sized('kid_quest_play', .28, .985)                            # seated on the floor, shoes on the boards
PIXIE_PT = dict(sized('kid_pixie_point', .5, .95, PIXIE_RATIO, depth=.8), rot=-9)   # a step behind him, leaning in: her finger on the TV
PIXIE_SIT = sized('kid_pixie_sit', .55, .985, PIXIE_RATIO)


N64_IMG = rgba(PROPS / 'n64_34.png')
N64_IMG = N64_IMG.resize((int(PW * .13), int(N64_IMG.height * PW * .13 / N64_IMG.width)), Image.LANCZOS)
N64_POS = (int(PW * .64), int(PH * .955 - N64_IMG.height))


def cable(base):
    """Controller cable: from the N64's first port, slack along the floor, to where the cable drawn in #6a ends (it
    already runs from his controller to the floor at his right, bottom corner of the art)."""
    im = final('kid_quest_play'); qh = QUEST_K['h'] * PH; qw = qh * im.width / im.height
    hx, hy = QUEST_K['x'] * PW + qw * .46, QUEST_K['y'] * PH - qh * .012    # the art's cable end
    px, py = N64_POS[0] + N64_IMG.width * .06, N64_POS[1] + N64_IMG.height * .78
    pts = []
    for i in range(41):
        u = i / 40
        x = (1 - u) ** 3 * px + 3 * (1 - u) ** 2 * u * (px - 60) + 3 * (1 - u) * u * u * (hx + 40) + u ** 3 * hx
        y = (1 - u) ** 3 * py + 3 * (1 - u) ** 2 * u * (PH * .99) + 3 * (1 - u) * u * u * hy + u ** 3 * hy
        pts.append((x, y))
    d = ImageDraw.Draw(base)
    d.line(pts, fill=(22, 22, 31, 255), width=9, joint='curve'); d.line(pts, fill=(70, 70, 78, 255), width=4, joint='curve')


def room_plate(t, pixie):
    base = BED.copy()
    tv = CRT_34.resize((tvw, int(CRT_34.height * TV_SCALE)), Image.LANCZOS)
    qs = [(x * TV_SCALE, y * TV_SCALE) for x, y in Q34]
    ms = np.asarray(Image.fromarray((M34 * 255).astype(np.uint8)).resize(tv.size, Image.NEAREST)) > 127
    xs = [p[0] for p in qs]; ys = [p[1] for p in qs]
    pic = game_picture(t, (int(max(xs) - min(xs)), int(max(ys) - min(ys))))
    tv = fill_screen(tv, qs, ms, pic)
    base.alpha_composite(tv, TV_POS)
    base.alpha_composite(N64_IMG, N64_POS)                               # the approved N64, cartridge in, on the floor
    if pixie is PIXIE_PT:                                               # she walks in from frame left once the pull-back settles
        k = ease(min(1, max(0, (t - T_PIX_IN) / .7)))
        hop = .012 * abs(math.sin((t - T_PIX_IN) * 11)) * (1 - k) if k < 1 else 0   # her steps: a bounce per stride, settling as she arrives
        pixie = dict(pixie, x=lin(-.12, pixie['x'], k), y=pixie['y'] - hop) if k > 0 else None
    if pixie and pixie.get('rot'):                                      # standing a step behind him: drawn before Quest
        place_leaning(base, pixie)
    place(base, QUEST_K)
    cable(base)
    if pixie and not pixie.get('rot'):                                  # sitting beside him
        place(base, pixie)
    return base


def place_leaning(base, spec):
    """#6b points straight ahead (a little up); the CRT sits low on the bedside table, so she leans in towards it: the
    cut-out turns about her feet at load time (the art file is untouched)."""
    im = final(spec['art']); h = int(spec['h'] * PH)
    im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    pad = Image.new('RGBA', (im.width, im.height * 2)); pad.alpha_composite(im, (0, 0))      # pivot = bottom centre
    pad = pad.rotate(spec['rot'], resample=Image.BICUBIC, expand=True)          # pivot = centre = her feet
    x, y = spec['x'] * PW, spec['y'] * PH
    sh = Image.new('RGBA', base.size)
    ImageDraw.Draw(sh).ellipse((x - im.width * .4, y - 12, x + im.width * .4, y + 10), fill=(15, 10, 8, 110))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
    base.alpha_composite(pad, (int(x - pad.width / 2), int(y - pad.height / 2)))


# continuous camera through C3-C6 (same background: never snaps back)
CAM_KEYS = [(T_ROOM, (3.0, SCR_C[0] - .02, SCR_C[1])), (T_TV - .1, (1.12, .565, .56)),
            (T_FR - .1, (1.2, .57, .57)),                               # "the television": push in keeping Quest whole (never half cut)
            (T_FR + .45, (1.25, .44, .585)),                             # quick pan back: Quest is never held half cut
            (T_KNEW, (1.25, .44, .585)),                                 # both kids whole, Pixie's head inside title-safe
            (T_SAT, (1.25, .46, .585)), (T_END, (1.1, .5, .56))]


def room_cam(t):
    for (ta, a), (tb, b) in zip(CAM_KEYS, CAM_KEYS[1:]):
        if t <= tb:
            k = ease(max(0, (t - ta) / (tb - ta)))
            z = a[0] * (b[0] / a[0]) ** k
            return (z, lin(a[1], b[1], k), lin(a[2], b[2], k))
    return CAM_KEYS[-1][1]


def light(fr, box, t):
    """TV light on the kids (cool, pulsing) and the afternoon turning late (warm, low) as the line runs."""
    tx, ty = to_screen(*SCR_C, box)
    pulse = .5 + .5 * math.sin(t * 9) * (1 if T_TV <= t < T_FR else .3)
    fr = CART.glow(fr, tx - 80, ty + 40, 520, (150, 200, 255), .22 + .1 * pulse + (.12 if T_TV <= t < T_TV + .6 else 0))
    late = ease(min(1, max(0, (t - T_SAT) / (SAT_END - T_SAT))))
    warm = Image.new('RGB', fr.size, (255, 150, 70))
    fr = Image.blend(fr, warm, .06 + .16 * late)
    if late > 0:                                                        # the sun beam slides across the floor
        g = Image.new('RGBA', fr.size); gd = ImageDraw.Draw(g)
        bx = lin(.15, .62, late) * W
        gd.polygon([(bx - 120, H * .62), (bx + 60, H * .62), (bx + 260, H), (bx - 20, H)], fill=(255, 190, 110, int(70 * late)))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(30))).convert('RGB')
    return fr


def smartphone(fr, t):
    """'...because smartphones had not yet ruined that particular miracle': a phone slides in and gets struck out."""
    if not (T_PHONE - .1 <= t <= SAT_END + .2):
        return fr
    k_in = ease(min(1, (t - T_PHONE + .1) / .35)); k_out = ease(min(1, max(0, (t - SAT_END + .15) / .35)))
    x = W * .16; y = H * .1 - 300 * (1 - k_in) - 300 * k_out          # drops in over the wall, away from the TV
    g = Image.new('RGBA', fr.size); d = ImageDraw.Draw(g)
    d.rounded_rectangle((x, y, x + 110, y + 200), 16, fill=(30, 32, 40, 240), outline=(220, 220, 230, 255), width=4)
    d.rounded_rectangle((x + 10, y + 18, x + 100, y + 172), 8, fill=(70, 130, 220, 255))
    d.ellipse((x + 47, y + 178, x + 63, y + 194), outline=(200, 200, 210, 255), width=2)
    if t >= T('l16.w14') - .05:                                         # "not yet ruined": struck out
        d.ellipse((x - 30, y + 10, x + 140, y + 190), outline=(230, 50, 50, 255), width=10)
        d.line((x - 10, y + 160, x + 120, y + 40), fill=(230, 50, 50, 255), width=10)
    return Image.alpha_composite(fr.convert('RGBA'), g).convert('RGB')


def frame_room(t):
    pixie = PIXIE_PT if t < T_SAT + .4 else PIXIE_SIT                   # she sits down for the long afternoon
    cam = room_cam(t)
    box = cam_box((cam, cam), 0)
    fr = room_plate(t, pixie).convert('RGB').crop(tuple(int(v) for v in box)).resize((W, H), Image.BILINEAR)
    fr = light(fr, box, t)
    # Navi slips out of the TV on "knew where to go", circles Pixie, goes back in
    if T_KNEW - .3 <= t <= T_SAT + 1.0:
        sx, sy = SCR_C; px, py = .5, .62
        keys = [(T_KNEW - .3, sx, sy), (T_KNEW + .3, px + .06, py - .08), (T_KNEW + .8, px - .07, py - .02), (T_KNEW + 1.3, px + .02, py - .12),
                (T_SAT + .4, px + .08, py - .06), (T_SAT + 1.0, sx, sy)]
        kk = [(a, *to_screen(x, y, box)) for a, x, y in keys]
        kk = [(a, x / W, y / H) for a, x, y in kk]
        fr = fairy_fx.draw(fr, kk, t, size=.06, opacity=min(1, (t - T_KNEW + .3) / .3, (T_SAT + 1.0 - t) / .3))
    fr = smartphone(fr, t)
    if t < T_ROOM + .45:                                                # match-dissolve from the front-on TV
        fr = Image.blend(frame_c2(t), fr, (t - T_ROOM) / .45)
    d = ImageDraw.Draw(fr)
    lab = ('C3 "plus the room."' if t < T_TV else 'C4 "Plus the television."' if t < T_FR else
           'C5 the friend who knew where to go' if t < T_SAT else 'C6 a whole Saturday afternoon')
    tag(d, f'SEQ 05 THE GAME + THE ROOM · {lab} · BLOCK C v9 · PLANNING ONLY')
    PLANNING and d.text((20, 40), 'kids = final art #6a / #6b / #6c · CRT = own 3D (free)', font=F(15), fill=(255, 220, 160))
    return fr


# ------------------------------------------------------------------ frame
def render(t):
    if t < T_SCR:
        fr = frame_c1(t)
    elif t < T_ROOM:
        fr = frame_c2(t)
    else:
        fr = frame_room(t)
    d = ImageDraw.Draw(fr)
    subtitle(d, t, lift=40 if t >= T_ROOM else 0)# room shots: above the kids
    return fr


def main():
    out = ROOT / 'docs/ep002/EP002_blockC_animatic_v9.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in (('c1', T0 + 2.0), ('c1_dive', T_SCR - .25), ('c2', T_SCR + .6), ('c3', T_ROOM + 1.0), ('c4', T_TV + .5),
                    ('c5', T_KNEW + .7), ('c6', T_SAT + 3.0), ('c6_phone', T('l16.w16'))):
        render(t).save(ROOT / f'docs/ep002/blockC_v9_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer, 2026-10-04): no joined preview


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in (('c1', T0 + 2.0), ('c1_dive', T_SCR - .25), ('c2', T_SCR + .6), ('c3', T_ROOM + 1.0), ('c4', T_TV + .5),
                        ('c5', T_KNEW + .7), ('c6', T_SAT + 3.0), ('c6_phone', T('l16.w16'))):
            render(t).save(ROOT / f'docs/ep002/blockC_v9_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
