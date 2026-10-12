#!/usr/bin/env python3
"""Stage the EP002 trailer Short's assets into short/assets/ (gitignored) and build its audio.

Art: only existing EP002/core art and our 3D props. Files are COPIED (downscaled copies, or composited with the
engine's own overlays exactly as the EP002 animatic does: the 3D shield + 3D sword on Quest #4, the game picture on the
CRT's green key, the N64 on the bedroom floor). No source file is ever modified.

Audio: Bram's real EP002 narration cut to seg.SEGMENTS (cuts inside measured pauses, 30 ms fades) + a free SFX layer
(our synths in public/shared/sfx, CC0 Kenney/rubberduck), hits ~7 dB under the voice, music off, master -14 LUFS / -1 dBTP.

  python3 stage_assets.py            # everything
  python3 stage_assets.py --audio    # only the audio mix (after a change of SFX cues)
"""
import json, math, os, shutil, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = HERE / 'short' / 'assets'
FF = str(HERE.parent / 'hyperframes_ep003' / '.bin' / 'ffmpeg')
if not Path(FF).exists():
    import imageio_ffmpeg; FF = imageio_ffmpeg.get_ffmpeg_exe()
sys.path.insert(0, str(HERE))
import seg  # noqa: E402

SR = 48000


# ------------------------------------------------------------------ art
def save(im, name, max_h=None, q=None):
    if max_h and im.height > max_h:
        im = im.resize((round(im.width * max_h / im.height), max_h), Image.LANCZOS)
    p = OUT / name
    if name.endswith('.jpg'):
        im.convert('RGB').save(p, quality=q or 90)
    else:
        im.save(p, optimize=True)
    return im.size


def crop_alpha(im):
    im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: 0 if v < 24 else v))
    return im.crop(im.getchannel('A').getbbox())


def sprite(folder, name, frame_h):
    """24 turntable renders (our 3D) -> one horizontal sprite sheet, frames cropped to their union box."""
    fs = [Image.open(f).convert('RGBA') for f in sorted(folder.glob('f*.png'))]
    box = None
    for f in fs:
        b = f.getchannel('A').point(lambda v: 0 if v < 24 else v).getbbox()
        box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    fw = round((box[2] - box[0]) * frame_h / (box[3] - box[1]))
    sh = Image.new('RGBA', (fw * len(fs), frame_h))
    for i, f in enumerate(fs):
        sh.alpha_composite(f.crop(box).resize((fw, frame_h), Image.LANCZOS), (i * fw, 0))
    sh.save(OUT / name, optimize=True)
    return fw, frame_h, len(fs)


def n64_texture(size):
    """Twin of scripts/ep002-blockD-animatic.py n64_texture (the smeared, tiled 16x16 grass nobody misses)."""
    rng = np.random.default_rng(7)
    base = np.zeros((16, 16, 3), np.float32)
    base[:] = (78, 128, 52)
    base += rng.normal(0, 14, (16, 16, 1)) * np.array([.6, 1, .5])
    for _ in range(18):
        y, x = rng.integers(0, 16, 2); base[y, x] = (52, 92, 38)
    for _ in range(10):
        y, x = rng.integers(0, 16, 2); base[y, x] = (118, 170, 80)
    tile = np.tile(np.clip(base, 0, 255).astype(np.uint8), (2, 4, 1))
    return Image.fromarray(tile).resize(size, Image.BILINEAR)


def key_quad(im):
    """Corners (tl, tr, br, bl) of the #00ff00 screen key in a CRT render (as block C)."""
    a = np.asarray(im).astype(int)
    m = (a[..., 1] > 200) & (a[..., 0] < 90) & (a[..., 2] < 90)
    ys, xs = np.nonzero(m)
    s, d = xs + ys, xs - ys
    return [(xs[s.argmin()], ys[s.argmin()]), (xs[d.argmax()], ys[d.argmax()]), (xs[s.argmax()], ys[s.argmax()]), (xs[d.argmin()], ys[d.argmin()])], m


def fill_screen(tv, quad, mask, pic):
    A, B = [], []
    pw_, ph_ = pic.size
    for (x, y), (u, v) in zip(quad, [(0, 0), (pw_, 0), (pw_, ph_), (0, ph_)]):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; B += [u, v]
    c = np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()
    warped = pic.transform(tv.size, Image.PERSPECTIVE, c, Image.BILINEAR)
    m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))
    out = tv.copy(); out.paste(warped, (0, 0), m)
    return out


def game_picture(GAME, size, drift=.5):
    """The game on the tube (block C): field + young Quest on the road, scanlines, vignette."""
    PW, PH = GAME.size
    w, h = size; z = 1.25
    cw, ch = PW / z, PH / z
    x0 = (PW - cw) * drift; y0 = (PH - ch) * .55
    im = GAME.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((w, h), Image.BILINEAR)
    a = np.asarray(im).astype(np.float32)
    a[::3, :, :3] *= .82
    yy, xx = np.mgrid[0:h, 0:w]; v = 1 - .35 * (((xx / w - .5) ** 2 + (yy / h - .5) ** 2) * 2.2)
    a[..., :3] *= v[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def stage_art():
    os.environ['QUALITY'] = 'final'                                    # plates at their full 2688 x 1512
    sys.path.insert(0, str(ROOT / 'scripts/animatic'))
    import lib                                                          # noqa: E402
    import hud                                                          # noqa: E402
    PW, PH = lib.PW, lib.PH
    info = {}
    (OUT / 'fonts').mkdir(parents=True, exist_ok=True)
    for f in ('Anton-Regular.woff2', 'Inter-800.woff2', 'Inter-600.woff2'):
        shutil.copy2(ROOT / 'public/shared/fonts' / f, OUT / 'fonts' / f)
    shutil.copy2(ROOT / 'public/shared/fonts/Fredoka.ttf', OUT / 'fonts/Fredoka.ttf')
    (OUT / 'vendor').mkdir(exist_ok=True)
    shutil.copy2(HERE.parent / 'hyperframes_ep003/node_modules/gsap/dist/gsap.min.js', OUT / 'vendor/gsap.min.js')

    # plates
    field = lib.final_plate('field')                                    # final plate #11 (2688 x 1512)
    info['field'] = save(field, 'field.jpg', q=92)
    liv = Image.open(ROOT / 'public/art/core/backgrounds/living_room_night_gaming.png').convert('RGBA').resize((PW, PH), Image.LANCZOS)
    liv.alpha_composite(Image.open(ROOT / 'public/art/ep002/seq01/room_n64_setup_cart_in.png').convert('RGBA').resize((PW, PH), Image.LANCZOS))
    info['room'] = save(liv, 'room.jpg', q=92)                           # block B's living room + the approved N64 set-up

    # the childhood bedroom as block C builds it: 21" CRT (own 3D) on the bedside table showing the game, N64 on the floor,
    # the controller cable to where kid Quest (#6a) sits; the kid himself is a separate layer placed at the same spot
    bed = Image.open(ROOT / 'public/art/core/backgrounds/quest_bedroom_morning.png').convert('RGBA').resize((PW, PH), Image.LANCZOS)
    GAME = lib.plate(('final', 'field')).convert('RGBA')
    hero = lib.final('quest_young_back'); hero = hero.resize((int(hero.width * PH * .2 / hero.height), int(PH * .2)), Image.LANCZOS)
    GAME.alpha_composite(hero, (int(PW * .5 - hero.width / 2), int(PH * .93 - hero.height)))
    crt34 = Image.open(ROOT / 'public/art/ep002/props3d/crt_34.png').convert('RGBA')
    q34, m34 = key_quad(crt34)
    TV_BOX = (.78, .47, .955, .675)
    tvw = int((TV_BOX[2] - TV_BOX[0]) * PW); sc = tvw / crt34.width
    tv = crt34.resize((tvw, int(crt34.height * sc)), Image.LANCZOS)
    qs = [(x * sc, y * sc) for x, y in q34]
    ms = np.asarray(Image.fromarray((m34 * 255).astype(np.uint8)).resize(tv.size, Image.NEAREST)) > 127
    xs = [p[0] for p in qs]; ys = [p[1] for p in qs]
    tv = fill_screen(tv, qs, ms, game_picture(GAME, (int(max(xs) - min(xs)), int(max(ys) - min(ys)))))
    tv_pos = (int(TV_BOX[0] * PW), int(TV_BOX[3] * PH - tv.height))
    bed.alpha_composite(tv, tv_pos)
    info['bed_tv_screen'] = [round(sum(p[0] for p in qs) / 4 + tv_pos[0]), round(sum(p[1] for p in qs) / 4 + tv_pos[1])]
    n64 = Image.open(ROOT / 'public/art/ep002/props3d/n64_34.png').convert('RGBA')
    n64 = n64.resize((int(PW * .13), int(n64.height * PW * .13 / n64.width)), Image.LANCZOS)
    n64_pos = (int(PW * .64), int(PH * .955 - n64.height))
    bed.alpha_composite(n64, n64_pos)
    kid = lib.final('kid_quest_play')
    kid_h = .13 / .231 * PH; kid_w = kid_h * kid.width / kid.height    # face-width sizing of block C
    kx, ky = .28 * PW, .985 * PH
    hx, hy = kx + kid_w * .46, ky - kid_h * .012
    px, py = n64_pos[0] + n64.width * .06, n64_pos[1] + n64.height * .78
    pts = []
    for i in range(41):
        u = i / 40
        x = (1 - u) ** 3 * px + 3 * (1 - u) ** 2 * u * (px - 60 * lib.PS) + 3 * (1 - u) * u * u * (hx + 40 * lib.PS) + u ** 3 * hx
        y = (1 - u) ** 3 * py + 3 * (1 - u) ** 2 * u * (PH * .99) + 3 * (1 - u) * u * u * hy + u ** 3 * hy
        pts.append((x, y))
    d = ImageDraw.Draw(bed)
    d.line(pts, fill=(22, 22, 31, 255), width=round(9 * lib.PS), joint='curve'); d.line(pts, fill=(70, 70, 78, 255), width=round(4 * lib.PS), joint='curve')
    info['bedroom'] = save(bed, 'bedroom.jpg', q=92)
    info['kid'] = {'x': kx - kid_w / 2, 'y': ky - kid_h, 'w': kid_w, 'h': kid_h}
    save(kid, 'kid_play.png', max_h=1100)
    soft = Image.blend(Image.open(ROOT / 'public/art/core/backgrounds/quest_bedroom_morning.png').convert('RGB').resize((PW, PH), Image.LANCZOS)
                       .filter(ImageFilter.GaussianBlur(10 * lib.PS)), Image.new('RGB', (PW, PH), (40, 30, 30)), .25)
    save(soft, 'bedroom_soft.jpg', q=88)                               # block D's D6 background (soft, warm)

    # cut-outs (alpha-cropped; engine overlays exactly as the animatic)
    save(lib.final('quest_adult_back'), 'quest_adult_back.png', max_h=1500)       # #4 + 3D shield + 3D sword
    for nm, mirror in (('walk_a', False), ('walk_b', True)):
        save(lib.adult_walk_frame(mirror=mirror, sway=lib.SHIELD_SWAY * (1 if mirror else -1)), f'{nm}.png', max_h=900)
    save(lib.final('quest_young_lookup'), 'young_lookup.png', max_h=1500)         # #3a
    save(lib.final('quest_young_back'), 'young_back.png', max_h=900)              # #3
    save(lib.final('kid_pixie_point'), 'pixie_point.png', max_h=1100)             # #6b
    save(crop_alpha(Image.open(ROOT / 'public/art/core/quest/arms_up_back.png').convert('RGBA')), 'arms_up.png', max_h=1300)
    save(crop_alpha(Image.open(ROOT / 'public/art/core/quest/bed_awake.png').convert('RGBA')), 'bed_awake.png', max_h=1100)
    save(crop_alpha(Image.open(ROOT / 'docs/art_orders/quest/ep002_tv/results/09_floor_profile_tv_n64pad.png').convert('RGBA')), 'older_pad.png')
    info['sizes'] = {n: Image.open(OUT / n).size for n in ('kid_play.png', 'older_pad.png', 'quest_adult_back.png', 'walk_a.png',
                                                          'young_lookup.png', 'young_back.png', 'pixie_point.png', 'arms_up.png', 'bed_awake.png')}

    # CRT front (own 3D) with the game picture in its key: "It is the game..."
    crt = Image.open(ROOT / 'public/art/ep002/props3d/crt_front.png').convert('RGBA')
    qf, mf = key_quad(crt)
    xs = [p[0] for p in qf]; ys = [p[1] for p in qf]
    save(fill_screen(crt, qf, mf, game_picture(GAME, (int(max(xs) - min(xs)), int(max(ys) - min(ys))), drift=.45)), 'crt_game.png')

    # Switch 2 (own 3D) with the game on its screen: "Modern controls."
    sw2 = Image.open(ROOT / 'public/art/ep002/props3d/switch2_room_hd.png').convert('RGBA')
    qf, mf = key_quad(sw2)
    xs = [p[0] for p in qf]; ys = [p[1] for p in qf]
    sw2 = crop_alpha(fill_screen(sw2, qf, mf, game_picture(GAME, (int(max(xs) - min(xs)) * 2, int(max(ys) - min(ys)) * 2), drift=.5)))
    info['switch2'] = save(sw2, 'switch2_game.png', max_h=700)

    # relics, cartridge (own 3D turntables), Triforce, brand
    P3 = ROOT / 'public/art/ep002/props3d'
    info['oca'] = sprite(P3 / 'ocarina_spin', 'oca_sprite.png', 520)
    info['sword'] = sprite(P3 / 'sword_spin', 'sword_sprite.png', 900)
    info['cart'] = sprite(P3 / 'cart_spin', 'cart_sprite.png', 560)
    save(crop_alpha(Image.open(P3 / 'triforce_front.png').convert('RGBA')), 'triforce.png')
    shutil.copy2(ROOT / 'public/art/core/brand/secondquest_wordmark.png', OUT / 'wordmark.png')
    shutil.copy2(ROOT / 'docs/publish/EP002/thumbnails/v2/EP002_thumb_opt1d_EXCEPT_YOU.jpg', OUT / 'thumb.jpg')
    n64_texture((520, 300)).save(OUT / 'n64tex.png')

    # the in-game HUD (scripts/animatic/hud.py, our own drawing) cut into its three groups for the 9:16 layout
    W2, H2 = lib.W, lib.H
    # hud.draw returns RGB: draw it over black and over white and recover the exact alpha (difference matte)
    kb = np.asarray(hud.draw(Image.new('RGB', (W2, H2), (0, 0, 0)), rupees=23, t=None), np.float32)
    kw = np.asarray(hud.draw(Image.new('RGB', (W2, H2), (255, 255, 255)), rupees=23, t=None), np.float32)
    al = np.clip(1 - (kw - kb).mean(2) / 255, 0, 1)
    col = np.clip(kb / np.maximum(al[..., None], 1e-3), 0, 255)
    lay = Image.fromarray(np.dstack([col, al[..., None] * 255]).astype(np.uint8), 'RGBA')
    a = lay.getchannel('A')
    def piece(box, name):
        b = a.crop(box).getbbox(); b = (box[0] + b[0], box[1] + b[1], box[0] + b[2], box[1] + b[3])
        lay.crop(b).save(OUT / name); return lay.crop(b).size
    info['hud'] = {'hearts': piece((0, 0, W2 // 3, H2 // 4), 'hud_hearts.png'),
                   'buttons': piece((W2 // 2, 0, W2, H2 // 4), 'hud_buttons.png'),
                   'rupee': piece((0, H2 * 3 // 4, W2 // 3, H2), 'hud_rupee.png')}
    (OUT / 'art_info.json').write_text(json.dumps(info, indent=1))
    print('art staged:', len(list(OUT.glob('*'))), 'files')


# ------------------------------------------------------------------ audio
def load(path):
    """Any audio file -> float32 mono at 48 kHz (ffmpeg decode)."""
    raw = subprocess.run([FF, '-v', 'error', '-i', str(path), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def active_rms_db(x, gate=-40):
    """RMS (dBFS) over the 10 ms windows that are above the gate: 'how loud it sounds while it sounds'."""
    n = len(x) // 480
    r = np.sqrt((x[:n * 480].reshape(n, 480) ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(r); act = r[db > gate]
    return 20 * np.log10(np.sqrt((act ** 2).mean()) + 1e-12) if len(act) else -99


SFXD = ROOT / 'public/shared/sfx'
K = SFXD / 'cc0/kenney'


def cues():
    """(short time, file, dB relative to the voice, fade-out s or None). Hits ~ -7 dB under the voice, beds ~ -16."""
    T = seg.table()
    t = lambda k, d=0: T[k] + d                                         # noqa: E731
    return [
        (0.00, K / 'impactPunch_heavy_002.ogg', -6, None),               # title slam on frame 1 (the punch)
        (0.00, SFXD / 'whoosh.wav', -9, None),
        (t('l07.w6', -.12), SFXD / 'whip.wav', -9, None),                 # cut to the castle
        (t('l07.w9', -.1), K / 'lowDown.ogg', -12, None),                 # tilt down "from the ground up"
        (t('l08.w1', -.04), K / 'impactSoft_heavy_000.ogg', -5, None),    # "You."
        (t('l08.w1', -.04), SFXD / 'rumble.wav', -13, .6),
        (t('l08.w1', .1), SFXD / 'own/fairy_fly_a.wav', -14, None),       # Navi pings beside him
        (t('S1', -.05), SFXD / 'whip.wav', -9, None),                     # into the room
        (t('l03.w1', .05), SFXD / 'tv_on.wav', -13, None),               # "New graphics."
        (t('l03.w4'), SFXD / 'chime.wav', -12, 1.0),                      # "An orchestra."
        (t('l03.w5'), K / 'pluck_001.ogg', -9, None),                     # "Voices."
        (t('l03.w7'), SFXD / 'cart_click.wav', -8, None),                 # "Modern controls."
        (t('l03.w8', -.1), SFXD / 'whoosh.wav', -8, None),                # "A new camera." -> into the screen
        (t('l04.w3', -.08), K / 'impactGlass_light_000.ogg', -7, None),   # ocarina
        (t('l04.w3', 0), SFXD / 'sparkle.wav', -15, None),
        (t('l05.w3', -.08), K / 'metalLatch.ogg', -7, None),              # sword
        (t('l06.w3', -.08), K / 'powerUp10.ogg', -9, None),               # Triforce
        (t('l06.w3', -.08), K / 'impactPlate_light_000.ogg', -8, None),
        (t('l11.w1', -.2), SFXD / 'cart_slide.wav', -10, None),           # the cartridge
        (t('l11.w9', -.05), K / 'lowFrequency_explosion_000.ogg', -16, None),   # "not exactly": the glow cools (a low thud)
        (t('l11.w14', -.1), SFXD / 'whoosh.wav', -10, None),              # dive into the label
        (t('l12.w1', -.1), SFXD / 'tv_on.wav', -11, None),                # "It is the game..."
        (t('l13.w1', -.05), K / 'highUp.ogg', -14, None),                 # pull back into the room
        (t('l14.w3', -.05), K / 'switch_002.ogg', -10, None),             # "television"
        (t('l15.w1', -.1), K / 'footstep_wood_000.ogg', -11, None),       # Pixie hops in
        (t('l15.w3', -.1), K / 'footstep_wood_001.ogg', -11, None),
        (t('l15.w6', -.05), SFXD / 'own/fairy_fly_c.wav', -13, None),     # "knew where to go": Navi circles her
        (t('S3', 0), SFXD / 'wind.wav', -18, 1.2),                        # field ambience bed
        (t('l17.w8', -.15), K / 'lowDown.ogg', -9, None),                 # "felt enormous": the pull-out
        (t('l18.w1', -.08), K / 'minimize_001.ogg', -8, None),            # the field shrinks
        (t('l18.w4', 0), SFXD / 'stamp.wav', -8, None),                   # ACTUAL SIZE
        (t('l19.w1', -.1), K / 'maximize_001.ogg', -9, None),             # back in
        (t('l19.w2', 0), SFXD / 'own/fairy_fly_b.wav', -15, None),
        (t('S4', -.02), K / 'creak2.ogg', -10, None),                     # bed creak
        (t('l22.w2', -.05), K / 'impactSoft_medium_000.ogg', -8, None),   # he jolts awake
        (t('l23.w1', -.12), SFXD / 'cc0/rubberduck_water/bubble_01.ogg', -8, None),   # the thought bubble pops up
        (t('l23.w7', -.08), K / 'scratch_004.ogg', -10, None),            # texture smears in
        (t('l23.w8.end', .15), SFXD / 'poof.wav', -9, None),              # bubble pops away
        (t('l125.w1', -.05), K / 'cloth2.ogg', -12, None),
        (t('l125.w6', -.05), SFXD / 'ui_select.wav', -10, None),          # the controller
        (t('l125.w8', -.06), K / 'impactPunch_heavy_002.ogg', -7, None),  # "different": the match cut
        (t('l125.w8', -.06), K / 'forceField_002.ogg', -13, None),
        (t('S6', 0), SFXD / 'wind.wav', -19, 1.5),                        # field again
        (t('l09.w1', 0), K / 'footstep_wood_000.ogg', -17, None),
        (t('l09.w6', -.1), SFXD / 'own/fairy_fly_d.wav', -15, None),
        (t('l10.w1', -.06), SFXD / 'impact.wav', -6, None),               # wordmark slam on "So,"
        (t('l10.w2', -.05), SFXD / 'whoosh.wav', -10, None),              # gold bar grows on "why?"
        (t('l10.w2', .05), SFXD / 'fairy_flutter.wav', -12, None),        # Navi flies up and around the wordmark
        (t('l10.end', .55), SFXD / 'sparkle.wav', -8, None),              # into the star of the "o"
        (t('l10.end', .55), SFXD / 'fairy_shimmer.wav', -13, None),
        (t('VEND', .05), SFXD / 'ui_complete.wav', -10, None),            # end card
    ]


def stage_audio():
    narr = load(ROOT / 'public/episodes/ep002/audio/narration.wav')
    parts = []
    for a, b in seg.SEGMENTS:
        x = narr[round(a * SR):round(b * SR)].copy()
        f = round(.03 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)     # 30 ms fades, inside the pauses
        parts.append(x)
    voice = np.concatenate(parts + [np.zeros(round(seg.CARD * SR), np.float32)])
    v_db = active_rms_db(voice)
    sfx = np.zeros_like(voice)
    log = []
    for at, path, rel, fade in cues():
        s = load(path)
        if fade:
            s = s[:round(fade * SR)]; f = min(len(s), round(.25 * SR)); s[-f:] *= np.linspace(1, 0, f)
        g = 10 ** ((v_db + rel - active_rms_db(s)) / 20)
        i0 = max(0, round(at * SR)); n = min(len(s), len(sfx) - i0)
        sfx[i0:i0 + n] += s[:n] * g
        log.append(f'{at:6.2f}  {rel:+3d} dB  {path.relative_to(ROOT)}')
    mix = voice + sfx
    mix *= .9 / max(1e-6, float(np.abs(mix).max()))                   # headroom before loudnorm (no clipping in the 16-bit temp)
    raw = OUT / '_mix_raw.wav'
    write_wav(raw, mix)
    # -14 LUFS integrated, <= -1 dBTP: gain to target, then a gentle peak limiter run at 4x the rate (true-peak aware);
    # one correction pass for what the limiter took off
    def meas(p):
        m = subprocess.run([FF, '-hide_banner', '-i', str(p), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
        m = m[m.rindex('Summary:'):]
        import re
        return float(re.search(r'I:\s+(-?[\d.]+) LUFS', m).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', m).group(1))
    I0, _ = meas(raw); gain = -14 - I0
    for _ in range(3):
        af = f'volume={gain:.2f}dB,aresample=192000,alimiter=limit=0.82:attack=2:release=80:level=disabled,aresample={SR}'
        subprocess.run([FF, '-v', 'error', '-y', '-i', str(raw), '-af', af, '-c:a', 'pcm_s16le', '-ar', str(SR), str(OUT / 'narration.wav')], check=True)
        I1, tp = meas(OUT / 'narration.wav')
        if abs(I1 + 14) < .15:
            break
        gain += -14 - I1
    raw.unlink()
    m = subprocess.run([FF, '-hide_banner', '-i', str(OUT / 'narration.wav'), '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    summ = m[m.rindex('Summary:'):]
    (OUT / 'sfx_cues.txt').write_text('\n'.join(log) + '\n\n' + summ)
    print(f'audio: {len(voice) / SR:.2f} s, voice active RMS {v_db:.1f} dBFS, {len(log)} SFX cues')
    print(' '.join(summ.split()))


def write_wav(path, x):
    import wave
    y = np.clip(x, -1, 1)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(4 // 2); w.setframerate(SR)
        w.writeframes((y * 32767).astype('<i2').tobytes())


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    if '--audio' not in sys.argv:
        stage_art()
    stage_audio()
