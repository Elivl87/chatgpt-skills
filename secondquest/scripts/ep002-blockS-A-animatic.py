#!/usr/bin/env python3
"""EP002 animatic, block S, option A (planning only): l137 "So... can you remake a memory?" ->
l144 "Or the exact version of you who walked into Hyrule for the first time." (block T starts on l145).

Option A, "the remake engine" (Producer, 2026-10-05: "Construye y comparamos" - against v1, the blueprint). The memory
is imported into a game editor (evoked, not any real tool): the Saturday room of 1998 in the viewport, a hierarchy of
its assets on the left, a console on the right, an IMPORTING MEMORY... bar under the viewport.
  S1  "So... can you remake a memory?"  The editor opens; the assets load into the hierarchy; the bar fills.
  S2  "Probably not."                   The bar stalls at 99%, amber: WARNING, 5 assets could not be rebuilt.
  S3  "...the room... the television. The Saturday afternoon. The friend sitting next to you."  On each word its asset
                                        fails (red X in the hierarchy, the error in the console) and turns into a
                                        grey, untextured placeholder in the viewport: room MISSING TEXTURE, television
                                        FILE NOT FOUND, saturday_afternoon.light CANNOT BAKE (the warm light goes
                                        flat), friend.npc NOT FOUND.
  S4  "Or the exact version of you..."  you_1998 cannot even become a placeholder: CANNOT EXPORT - he stays in full
                                        colour in the grey room, 1 OF 1.
Sets up block T: the same editor imports Hyrule and it all comes back green.
HUD: hidden (real life). Sounds: none (all at the end). Free.
v4 (final art, 2026-10-05): the kids are block C's final #6a (kid Quest playing, red hoodie, controller with its cable)
and #6c (kid Pixie sitting), sized by face width (Pixie's face = 0.9 x Quest's); their stand-in label is gone. The
in-story MISSING TEXTURE / FILE NOT FOUND errors are the editor's gag and stay.
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
T_OPEN = T0 + .3
T_LOAD1 = T('l138.w5') + .2             # the bar reaches 99% on "memory?"
T_NOT = T('l139') - .05                 # "Probably not."
T_YOU = T('l144') - .05
T_FAIL = T('l144.w6')                   # "you"
T_ONE = T('l144.w13')                   # "first (time)"
T_END = T('l145') - 0.05                # block T starts on l145
ASSETS = [('room', 'MISSING TEXTURE', T('l140.w5')), ('television', 'FILE NOT FOUND', T('l141.w5')),
          ('saturday_afternoon.light', 'CANNOT BAKE', T('l142.w2')), ('friend.npc', 'NOT FOUND', T('l143.w2')),
          ('you_1998', 'CANNOT EXPORT', T_FAIL)]
INK = (20, 14, 18)
RED, AMBER, GREEN, GOLD = (235, 70, 75), (255, 180, 60), (90, 210, 120), (255, 214, 40)
UI_BG, UI_PANEL, UI_LINE, UI_TEXT, UI_DIM = (24, 26, 32), (34, 37, 45), (58, 62, 74), (220, 224, 232), (140, 146, 160)

# editor layout (frame px)
VX0, VY0, VX1 = 232, 64, 968
VY1 = VY0 + int((VX1 - VX0) * 9 / 16)                                       # 16:9 viewport
VW, VH = VX1 - VX0, VY1 - VY0
BAR_Y = VY1 + 18


# ------------------------------------------------------------------ the room, by layers (colour and placeholder)
def _layers():
    bg = C.BED.copy()
    tv = Image.new('RGBA', bg.size)
    crt = C.CRT_34.resize((C.tvw, int(C.CRT_34.height * C.TV_SCALE)), Image.LANCZOS)
    qs = [(x * C.TV_SCALE, y * C.TV_SCALE) for x, y in C.Q34]
    ms = np.asarray(Image.fromarray((C.M34 * 255).astype(np.uint8)).resize(crt.size, Image.NEAREST)) > 127
    xs = [p[0] for p in qs]; ys = [p[1] for p in qs]
    crt = C.fill_screen(crt, qs, ms, C.game_picture(C.T_SAT, (int(max(xs) - min(xs)), int(max(ys) - min(ys)))))
    tv.alpha_composite(crt, C.TV_POS)
    crt_only = tv.copy()
    tv.alpha_composite(C.N64_IMG, C.N64_POS)
    C.cable(tv)
    px = Image.new('RGBA', bg.size); place(px, C.PIXIE_SIT)
    q = Image.new('RGBA', bg.size); place(q, C.QUEST_K)
    return bg, tv, px, q, crt_only


BOX = tuple(int(v) for v in cam_box(((1.06, .52, .55), (1.06, .52, .55)), 0))


def vp(im):
    return im.crop(BOX).resize((VW, VH), Image.LANCZOS)


def clay(im):
    """An untextured placeholder: flat grey, shape kept by soft shading and dark edges."""
    a = np.asarray(im.convert('RGBA')).astype(np.float32)
    g = a[..., :3].mean(2)
    e = cv2.Canny(g.astype(np.uint8), 40, 110) > 0
    v = 120 + (g - 128) * .35
    v[e] = 70
    out = np.dstack([v, v, v * 1.03, a[..., 3]])
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


_bg, _tv, _px, _q, _crt = _layers()


def layer_set(f):
    L = {'room': f(_bg).convert('RGBA'), 'television': f(_tv), 'friend.npc': f(_px), 'you_1998': f(_q)}
    bb = {k: v.getchannel('A').getbbox() for k, v in L.items() if k != 'room'}
    bb['television'] = f(_crt).getchannel('A').getbbox()                    # the CRT itself, not the cable
    return dict(L=L, LC={k: clay(v) for k, v in L.items()}, LW={k: wire(v, k == 'room') for k, v in L.items()}, BBOX=bb, s=L['room'].width / VW)


def wire(im, opaque=False):
    """Improvement 4: the first step of the failure - the object drops to its wireframe."""
    a = np.asarray(im.convert('RGBA'))
    e = cv2.Canny(cv2.cvtColor(a[..., :3], cv2.COLOR_RGB2GRAY), 40, 110)
    e = cv2.dilate(e, np.ones((2, 2), np.uint8)) > 0
    e &= a[..., 3] > 20
    out = np.zeros_like(a)
    if opaque:
        out[...] = (16, 22, 34, 255)
    out[e] = (150, 220, 255, 255)
    return Image.fromarray(out)


SV = layer_set(vp)                                                          # in the editor's viewport
SF = layer_set(lambda im: im.crop(BOX).resize((W, H), Image.LANCZOS))       # full frame, for the push into the viewport
BBOX = SV['BBOX']
T_Z0, T_Z1 = T_FAIL + .55, T_FAIL + 1.5                                     # Producer improvement: push into the viewport


def warm(im, k):
    if k <= 0:
        return im
    im = Image.blend(im, Image.new('RGB', im.size, (255, 150, 70)), .2 * k)
    g = Image.new('RGBA', im.size); d = ImageDraw.Draw(g)
    w, h = im.size; s = w / VW
    bx = w * .52
    d.polygon([(bx - 90 * s, h * .62), (bx + 45 * s, h * .62), (bx + 190 * s, h), (bx - 15 * s, h)], fill=(255, 190, 110, int(80 * k)))
    return Image.alpha_composite(im.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(20 * s))).convert('RGB')


def k_fail(name, t):
    tm = [a[2] for a in ASSETS if a[0] == name][0]
    return min(1, max(0, (t - tm) / .35))


def viewport(t, S=None):
    S = S or SV
    L, LC, BBOX, sc = S['L'], S['LC'], S['BBOX'], S['s']

    LW = S['LW']

    def mix(name):
        if name == 'you_1998':                                               # he never turns into a placeholder:
            if T_YOU <= t < T_FAIL and int((t - T_YOU) * 12) % 4 == 0:       # the engine tries his wireframe and loses it
                return LW[name]
            return L[name]
        tm = [a[2] for a in ASSETS if a[0] == name][0]
        k = (t - tm) / .8                                                    # colour -> wireframe -> grey placeholder
        if k <= 0:
            return L[name]
        if k < .4:
            return Image.blend(L[name], LW[name], k / .4)
        return Image.blend(LW[name], LC[name], min(1, (k - .4) / .6))
    im = mix('room').copy()
    for n in ('television', 'friend.npc', 'you_1998'):
        im.alpha_composite(mix(n))
    im = warm(im.convert('RGB'), 1 - k_fail('saturday_afternoon.light', t))
    if t >= T_FAIL:                                                            # the one thing it cannot export
        x0, y0, x1, y1 = BBOX['you_1998']
        im = CART.glow(im, (x0 + x1) / 2, (y0 + y1) / 2, int((x1 - x0) * .8), (255, 214, 140), .3 * min(1, (t - T_FAIL) / .4))
    if T_YOU <= t < T_FAIL:                                                    # it tries: a scan line over him
        x0, y0, x1, y1 = BBOX['you_1998']
        d = ImageDraw.Draw(im); yb = lin(y1, y0, ((t - T_YOU) * 1.4) % 1)
        d.line((x0 - 10, yb, x1 + 10, yb), fill=(160, 220, 255), width=int(3 * sc))
    # selection outline + a small error pinned on the object as it fails
    d = ImageDraw.Draw(im)
    for name, err, tm in ASSETS:
        if name in ('room', 'saturday_afternoon.light') or not (tm - .1 <= t < tm + 1.3 or (name == 'you_1998' and t >= tm - .1)):
            continue
        x0, y0, x1, y1 = BBOX[name]
        col = GOLD if name == 'you_1998' else (255, 150, 40)
        d.rectangle((x0, y0, x1, y1), outline=col, width=int(3 * sc))
        if name != 'you_1998':                                                 # never over his face (the closing shot)
            gizmo(d, (x0 + x1) / 2, (y0 + y1) / 2, sc)
    if ASSETS[2][2] - .1 <= t < ASSETS[2][2] + 1.3:                             # the light: a sun gizmo where the beam was
        gx, gy = im.width * .47, im.height * .14                                 # at the window, where the light came from
        r = 16 * sc
        d.ellipse((gx - r, gy - r, gx + r, gy + r), outline=(255, 214, 40), width=int(3 * sc))
        for i in range(8):
            a = i * math.pi / 4
            d.line((gx + r * 1.3 * math.cos(a), gy + r * 1.3 * math.sin(a), gx + r * 1.9 * math.cos(a), gy + r * 1.9 * math.sin(a)), fill=(255, 214, 40), width=int(3 * sc))
        gizmo(d, gx, gy, sc)
    return im


def gizmo(d, x, y, sc):
    """Improvement 2: the move gizmo of any 3D editor (X red, Y green, Z blue)."""
    L_ = 46 * sc; w = max(2, int(4 * sc))
    for (dx, dy, col) in ((1, 0, (235, 70, 75)), (0, -1, (90, 210, 120)), (-.6, .55, (80, 150, 255))):
        ex, ey = x + dx * L_, y + dy * L_
        d.line((x, y, ex, ey), fill=col, width=w)
        a = math.atan2(ey - y, ex - x); h = 11 * sc
        d.polygon([(ex + math.cos(a) * h, ey + math.sin(a) * h), (ex + math.cos(a + 2.4) * h, ey + math.sin(a + 2.4) * h),
                   (ex + math.cos(a - 2.4) * h, ey + math.sin(a - 2.4) * h)], fill=col)
    d.rectangle((x - 5 * sc, y - 5 * sc, x + 5 * sc, y + 5 * sc), fill=(240, 240, 240), outline=INK)


# ------------------------------------------------------------------ the editor
INSPECT = {                                                                  # Producer improvement 1: what the engine cannot read
    'room': [('room', 'h'), ('Mesh: OK', 'ok'), ('Textures: MISSING', 'bad'), ('Afternoons spent here:', 'ok'), ('  NOT SUPPORTED', 'bad')],
    'television': [('television', 'h'), ('Model: CRT 21"', 'ok'), ('Hum: static', 'ok'), ('Warmth: -', 'bad'), ('Who sat in front:', 'ok'), ('  NOT SUPPORTED', 'bad')],
    'saturday_afternoon.light': [('saturday_aft.light', 'h'), ('Time: 4:00 PM', 'ok'), ('Colour: golden', 'ok'), ('Smell of popcorn:', 'ok'), ('  NOT SUPPORTED', 'bad')],
    'friend.npc': [('friend.npc', 'h'), ('Knew where to go: YES', 'ok'), ('Can be cloned: NO', 'bad')],
    'you_1998': [('you_1998', 'h'), ('First time: YES', 'gold'), ('Copies: 1 of 1', 'gold'), ('Export: DISABLED', 'bad')],
}


def editor(t):
    fr = Image.new('RGB', (W, H), UI_BG); d = ImageDraw.Draw(fr)
    d.rectangle((0, 28, W, 56), fill=UI_PANEL)                                 # menu + title
    x = 14
    for m in ('File', 'Edit', 'Assets', 'Build'):
        d.text((x, 33), m, font=F(17), fill=UI_DIM); x += d.textlength(m, font=F(17)) + 22
    s = 'REMAKE ENGINE  ·  memory_saturday_1998.scene'
    d.text((W / 2 - d.textlength(s, font=F(17)) / 2 + 60, 33), s, font=F(17), fill=UI_TEXT)
    # hierarchy
    d.rectangle((8, VY0, VX0 - 12, VY1), fill=UI_PANEL, outline=UI_LINE)
    d.text((18, VY0 + 8), 'HIERARCHY', font=F(15), fill=UI_DIM)
    for i, (name, err, tm) in enumerate(ASSETS):
        ka = min(1, max(0, (t - T_OPEN - .25 - i * .3) / .2))
        if ka <= 0:
            continue
        y = VY0 + 40 + i * 40
        failed = t >= tm
        sel = tm - .1 <= t < tm + 1.3 or (name == 'you_1998' and t >= tm - .1)
        if sel:
            d.rectangle((12, y - 4, VX0 - 16, y + 28), fill=(60, 52, 40) if name != 'you_1998' else (70, 60, 20))
        col = (GOLD if name == 'you_1998' else RED) if failed else UI_TEXT
        if failed and name != 'you_1998':
            d.line((20, y + 6, 32, y + 20), fill=RED, width=3); d.line((32, y + 6, 20, y + 20), fill=RED, width=3)
        elif failed:
            d.ellipse((19, y + 5, 33, y + 19), outline=GOLD, width=3)
        else:
            ph = (t * 6 + i) % (2 * math.pi)                                  # loading spinner
            d.arc((19, y + 5, 33, y + 19), math.degrees(ph), math.degrees(ph) + 270, fill=UI_DIM, width=3)
        nm = name if len(name) < 19 else name[:17] + '…'
        d.text((42, y + 2), nm, font=F(16), fill=col)
    # viewport
    d.rectangle((VX0 - 2, VY0 - 2, VX1 + 2, VY1 + 2), outline=UI_LINE, width=2)
    fr.paste(viewport(t), (VX0, VY0))
    d = ImageDraw.Draw(fr)
    d.text((VX0 + 8, VY0 + 6), 'VIEWPORT · PERSPECTIVE', font=F(13), fill=(240, 240, 240), stroke_width=2, stroke_fill=INK)
    # inspector (improvement 1): the selected asset's properties the engine cannot read
    cx0 = VX1 + 14; IY1 = VY0 + 214
    d.rectangle((cx0, VY0, W - 8, IY1), fill=UI_PANEL, outline=UI_LINE)
    d.text((cx0 + 10, VY0 + 8), 'INSPECTOR', font=F(15), fill=UI_DIM)
    cur = [a for a in ASSETS if t >= a[2] - .05]
    if not cur:
        d.text((cx0 + 10, VY0 + 40), '(nothing selected)', font=F(15), fill=UI_DIM)
    else:
        name, err, tm = cur[-1]
        y = VY0 + 36
        for i, (txt, kind) in enumerate(INSPECT[name]):
            if t < tm + .1 + i * .14:                                         # the properties appear one by one
                break
            col = {'h': (255, 255, 255), 'ok': UI_TEXT, 'bad': RED, 'gold': GOLD}[kind]
            d.text((cx0 + 10 + (0 if kind == 'h' else 4), y), txt, font=F(17 if kind == 'h' else 15), fill=col)
            y += 26 if kind == 'h' else 21
    # console (the last lines)
    d.rectangle((cx0, IY1 + 8, W - 8, VY1), fill=(18, 19, 24), outline=UI_LINE)
    d.text((cx0 + 10, IY1 + 14), 'CONSOLE', font=F(15), fill=UI_DIM)
    lines = [(T_OPEN, '> import memory', UI_DIM), (T_OPEN + .6, 'loading assets...', UI_DIM)]
    if t >= T_NOT:
        lines.append((T_NOT, '! 5 assets could not', AMBER)); lines.append((T_NOT, '  be rebuilt', AMBER))
    for name, err, tm in ASSETS:
        short = name.split('.')[0].replace('saturday_afternoon', 'saturday_aft.')
        lines.append((tm, f'x {short}:', GOLD if name == 'you_1998' else RED)); lines.append((tm, f'  {err}', GOLD if name == 'you_1998' else RED))
    if t >= T_ONE:
        lines.append((T_ONE, '  (1 of 1)', GOLD))
    shown = [l for l in lines if t >= l[0]][-7:]
    y = IY1 + 40
    for tm, s, col in shown:
        d.text((cx0 + 10, y), s, font=F(15), fill=col); y += 22
    # the import bar
    kb = ease(min(1, max(0, (t - T_OPEN - .3) / (T_LOAD1 - T_OPEN - .3)))) * .99
    bx0, bx1 = VX0, VX1
    d.rounded_rectangle((bx0, BAR_Y, bx1, BAR_Y + 22), 6, fill=(40, 43, 52), outline=UI_LINE)
    bcol = AMBER if t >= T_NOT else (80, 160, 255)
    d.rounded_rectangle((bx0 + 3, BAR_Y + 3, bx0 + 3 + (bx1 - bx0 - 6) * kb, BAR_Y + 19), 5, fill=bcol)
    lab = f'IMPORTING MEMORY...  {int(kb * 100)}%' if t < T_NOT else 'IMPORT STALLED  99%  ·  WARNING'
    d.text((bx0, BAR_Y + 28), lab, font=F(15), fill=AMBER if t >= T_NOT else UI_TEXT)
    # the big result tag for him
    if t >= T_FAIL:
        x0, y0, x1, y1 = BBOX['you_1998']
        fr = C.comp(fr, you_tag(t, 1.0), VX0 + x1 + 8, VY0 + y0 + 10)
    return fr


def you_tag(t, sc):
    k = min(1, (t - T_FAIL) / .3)
    g = Image.new('RGBA', (300, 66)); gd = ImageDraw.Draw(g)
    gd.rounded_rectangle((2, 2, 297, 63), 8, fill=(14, 18, 34, 235), outline=GOLD + (255,), width=3)
    gd.text((14, 6), 'you_1998', font=F(20), fill=(255, 255, 255, 255))
    gd.text((14, 36), 'CANNOT EXPORT' if t < T_ONE else 'CANNOT EXPORT · 1 OF 1', font=F(17), fill=GOLD + (255,))
    g.putalpha(g.getchannel('A').point(lambda v: int(v * k)))
    return g if sc == 1 else g.resize((int(g.width * sc), int(g.height * sc)), Image.LANCZOS)


def full_view(t):
    """The viewport filling the frame: the grey room, him in colour."""
    fr = viewport(t, SF)
    x0, y0, x1, y1 = SF['BBOX']['you_1998']
    return C.comp(fr, you_tag(t, 1.35), x1 + 14, y0 + 20)


def render(t):
    if t < T_Z0:
        fr = editor(t)
    else:                                                                      # S4: the push into the viewport
        k = ease(min(1, (t - T_Z0) / (T_Z1 - T_Z0)))
        if k < 1:
            ed = editor(t)
            box = (lin(0, VX0, k), lin(0, VY0, k), lin(W, VX1, k), lin(H, VY1, k))
            fr = ed.crop(tuple(int(v) for v in box)).resize((W, H), Image.BICUBIC)
            if k > .7:
                fr = Image.blend(fr, full_view(t), (k - .7) / .3)
        else:
            fr = full_view(t)
    if t < T_OPEN:                                                             # out of Hyrule: a soft white cut
        fr = Image.blend(Image.new('RGB', (W, H), (250, 246, 236)), fr, max(0, (t - T0) / (T_OPEN - T0)))
    lab = ('S1 can you remake a memory?' if t < T_NOT else 'S2 probably not' if t < ASSETS[0][2] - .5
           else 'S3 cannot rebuild' if t < T_YOU else 'S4 the exact version of you')
    keys = [(T0, (VX0 + VW * .6) / W, (VY0 + VH * .35) / H), (T_YOU, (VX0 + VW * .35) / W, (VY0 + VH * .45) / H), (T_END, (VX0 + VW * .3) / W, (VY0 + VH * .4) / H)]
    fr = fairy_fx.draw(fr, keys, t, size=.035)
    d = ImageDraw.Draw(fr)
    tag(d, f'SEQ 25 CANNOT REBUILD · {lab} · BLOCK S option A v4 · PLANNING ONLY')
    subtitle(d, t)
    return fr


STILLS = (('s1', T_LOAD1 - .4), ('s2', T_NOT + .5), ('s3a', ASSETS[1][2] + .5), ('s3', ASSETS[3][2] + .8), ('s4a', T_YOU + .5), ('s4z', (T_Z0 + T_Z1) / 2), ('s4', T_END - .3))


def main():
    out = ROOT / 'docs/ep002/EP002_blockS_animatic_A_v4.mp4'
    narr = ROOT / 'public/episodes/ep002/audio/narration.wav'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T_END - T0:.3f}', '-i', str(narr),
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T_END - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in STILLS:
        render(t).save(ROOT / f'docs/ep002/blockS_A_v4_{name}.jpg', quality=85)
    print(out.relative_to(ROOT), f'{T_END - T0:.2f}s')   # block-only preview (Producer rule)


if __name__ == '__main__':
    if '--stills' in sys.argv:
        for name, t in STILLS:
            render(t).save(ROOT / f'docs/ep002/blockS_A_v4_{name}.jpg', quality=85)
        print('stills')
    else:
        main()
