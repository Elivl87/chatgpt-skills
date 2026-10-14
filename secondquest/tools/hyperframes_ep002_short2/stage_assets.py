#!/usr/bin/env python3
"""Stage EP002 Short #2's assets into short/assets/ (gitignored) and build its audio.

Art: only existing EP002/core art and our 3D props. Files are COPIED (downscaled copies, or composited exactly as the
EP002 animatic's blocks F-B, G and H do: the 1998 field look, the "Saturday, 1998" polaroid, the upgrade chips, the
camera icon and wrench, the NEW QUEST banner, the grown-up bedroom with our 3D CRT and N64). No source file is modified.

Audio: Bram's real EP002 narration cut to seg.SEGMENTS (cuts inside measured pauses, 30 ms fades) + a free SFX layer
(our synths in public/shared/sfx, CC0 Kenney/rubberduck), hits ~7 dB under the voice, music off, master -14 LUFS / -1 dBTP.

  python3 stage_assets.py            # everything
  python3 stage_assets.py --audio    # only the audio mix (after a change of SFX cues)
"""
import importlib.util, json, math, os, shutil, subprocess, sys
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


def stage_art():
    os.environ['QUALITY'] = 'final'                                    # plates at their full 2688 x 1512
    sys.path.insert(0, str(ROOT / 'scripts/animatic'))
    sys.path.insert(0, str(ROOT / 'tools/fx'))
    import lib                                                          # noqa: E402
    import hud                                                          # noqa: E402
    import ui_kit as UI                                                 # noqa: E402  the approved on-screen text style
    PW, PH = lib.PW, lib.PH
    info = {}
    (OUT / 'fonts').mkdir(parents=True, exist_ok=True)
    for f in ('Anton-Regular.woff2', 'Inter-800.woff2', 'Inter-600.woff2'):
        shutil.copy2(ROOT / 'public/shared/fonts' / f, OUT / 'fonts' / f)
    (OUT / 'vendor').mkdir(exist_ok=True)
    shutil.copy2(HERE.parent / 'hyperframes_ep003/node_modules/gsap/dist/gsap.min.js', OUT / 'vendor/gsap.min.js')

    # block H of the episode (blocks G, F-B, C load through it): the polaroid, the chips, the bedroom with the CRT
    spec = importlib.util.spec_from_file_location('blockH', ROOT / 'scripts/ep002-blockH-animatic.py')
    BH = importlib.util.module_from_spec(spec); spec.loader.exec_module(BH)

    # plates: today's field (final #11), and the same field in its 1998 look (block G's old_look at plate scale:
    # blocky geometry, flat colour, distance fog), plus a halfway step for "More polygons."
    field = lib.final_plate('field')
    info['field'] = save(field, 'field.jpg', q=92)

    def blocky(im, cell, sat, fog_k):
        b = im.resize((PW // cell, PH // cell), Image.BILINEAR).resize((PW, PH), Image.NEAREST)
        a = np.asarray(b).astype(np.float32); g = a.mean(2, keepdims=True); a = g + (a - g) * sat
        yy = np.mgrid[0:PH, 0:PW][0] / PH
        fog = np.clip(1 - np.abs(yy - .45) / .22, 0, 1)[..., None] * fog_k
        a = a * (1 - fog) + np.array([205, 215, 225]) * fog
        return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    save(blocky(field, 48, .7, .35), 'field_old.jpg', q=92)
    save(blocky(field, 14, .85, .16), 'field_mid.jpg', q=92)

    # characters (final art, alpha-cropped with the engine's overlays)
    save(lib.final('quest_young_front'), 'hero_front.png', max_h=1500)          # #3b the silent young hero, facing us
    save(lib.final('quest_young_back'), 'young_back.png', max_h=900)            # #3 (the opposite step = #3 mirrored, in CSS)

    UI.area_title('1998', retro=True, size=48).save(OUT / 'area_1998.png', optimize=True)
    UI.area_title('TODAY', size=48).save(OUT / 'area_today.png', optimize=True)
    # v2 (Producer 2026-10-14: "¿De qué sirve que Pixie salga en un circulito?"): Pixie acts FULL-FIGURE only.
    # Game world: her forest-friend tunic poses (#2c waving, #2d awe, #2e thinking, #2f back) beside young Quest
    # (#3b front, #3a looking up, #3 back); scaled in the page so her cut-out = 0.96 x his (95 % of his height to the top
    # of the head, face ~0.90 x his, measured side by side on the two arts). Real life: library #1 (waving, end card).
    for key, nm in (('pixie_tunic_wave', 'p2c'), ('pixie_tunic_awe', 'p2d'), ('pixie_tunic_think', 'p2e'), ('pixie_tunic_back', 'p2f'),
                    ('quest_young_lookup', 'q3a')):
        save(lib.final(key), f'{nm}.png', max_h=1300)
    save(crop_alpha(Image.open(ROOT / 'docs/art_orders/pixie/library/results/01_wave_happy.png').convert('RGBA')), 'pix_wave.png', max_h=1300)
    # the remake's "different" look for l61: final plate #17+18 (golden-hour vista, the two of them on the outcrop)
    info['outcrop'] = save(lib.final_plate('outcrop'), 'outcrop.jpg', q=92)

    # the 1998 childhood bedroom of block C (kid Quest #6a playing, kid Pixie #6b pointing at our 3D CRT, the N64 on the
    # floor), re-staged for 9:16: the kids a step further into the room (smaller by perspective only, Pixie's face 0.9 x
    # his) so both fit one vertical frame with their faces above the caption band. Two states: the warm 1998 afternoon
    # (the TV in its 1998 look) and the same memory "improved" (cooler, sharper, the TV in today's HD).
    BC_ = BH.BC
    qk = BC_.sized('kid_quest_play', .455, .905, depth=.80 / 1.0 * .72 / .72 * 1.0)
    qk['h'] = .40
    pk = dict(BC_.sized('kid_pixie_point', .585, .865, BC_.PIXIE_RATIO), rot=-6)
    pk['h'] = .40 * BC_.FACE['kid_quest_play'] / BC_.FACE['kid_pixie_point'] * BC_.PIXIE_RATIO * .93
    old_q, old_gp = BC_.QUEST_K, BC_.game_picture
    BC_.QUEST_K = qk
    from PIL import ImageEnhance
    def kids(new):
        BC_.game_picture = old_gp if new else (lambda t, size: BH.old_picture(BH.T_WONDER, size).convert('RGBA'))
        im = BC_.room_plate(BC_.T_SAT + 3, pk).convert('RGB')
        if new:
            im = ImageEnhance.Sharpness(ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.25)).enhance(1.12)).enhance(1.8)
            im = Image.blend(im, Image.new('RGB', im.size, (150, 195, 255)), .10)
        else:
            im = Image.blend(im, Image.new('RGB', im.size, (255, 160, 80)), .13)
        return im
    info['kids'] = save(kids(False), 'kids_old.jpg', q=92)
    save(kids(True), 'kids_new.jpg', q=92)
    BC_.QUEST_K, BC_.game_picture = old_q, old_gp
    q34 = [(BC_.TV_POS[0] + x * BC_.TV_SCALE, BC_.TV_POS[1] + y * BC_.TV_SCALE) for x, y in BC_.Q34]
    info['kids_tv'] = {'cx': round(sum(p[0] for p in q34) / 4, 1), 'cy': round(sum(p[1] for p in q34) / 4, 1),
                       'w': round(max(p[0] for p in q34) - min(p[0] for p in q34), 1), 'h': round(max(p[1] for p in q34) - min(p[1] for p in q34), 1)}
    info['kids_pos'] = {'quest': [qk['x'] * PW, qk['y'] * PH, qk['h'] * PH], 'pixie': [pk['x'] * PW, pk['y'] * PH, pk['h'] * PH]}

    # the grown-up bedroom at night (final plate #15) as block H builds it: our 3D CRT on the bedside table playing 1998
    # Hyrule, the N64 on the floor, Quest (Q008) on the floor in profile lit by the screen, Pixie (library #8, hugging her
    # knees, full figure) beside him; and the same room with the TV off, his pensive reflection in the dark glass.
    PIX = crop_alpha(Image.open(ROOT / 'docs/art_orders/pixie/library/results/08_nostalgic_hug_knees.png').convert('RGBA'))
    PIXIE_FLOOR = (BH.QSPEC[0] * PW - 400, BH.QSPEC[1] * PH - 14)        # plate px: centre x, feet y (just behind him)
    info['pixie_floor'] = list(PIXIE_FLOOR)

    def room(on):
        pic = BH.old_picture(BH.T_WONDER, (320, 240), pan=False) if on else Image.new('RGB', (320, 240), (14, 16, 20))
        base = BH.room_plate(0, pic)
        glow = 1.0 if on else 0.0
        rgb = BH._night(base.convert('RGB'), glow)
        sx, sy = BH.SCR_C[0] * PW, BH.SCR_C[1] * PH
        if on:
            rgb = BH.CART.glow(rgb, sx - lib.P(120), sy + lib.P(60), lib.P(900), (140, 190, 255), .35)
        base = rgb.convert('RGBA')
        Q = BH.QSPEC; qh = int(Q[2] * PH)
        q = BH.QPROF.resize((int(BH.QPROF.width * qh / BH.QPROF.height), qh), Image.LANCZOS)
        ql = Image.blend(q.convert('RGB'), Image.new('RGB', q.size, (18, 22, 44)), .30 + .30 * (1 - glow)).convert('RGBA'); ql.putalpha(q.getchannel('A'))
        sh = Image.new('RGBA', base.size)
        ImageDraw.Draw(sh).ellipse((Q[0] * PW - q.width * .45, Q[1] * PH - lib.P(24), Q[0] * PW + q.width * .45, Q[1] * PH + lib.P(14)), fill=(0, 0, 0, 120))
        base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(lib.P(10))))
        # Pixie (library #8, nostalgic, hugging her knees) on the floor beside him, a little further back, looking at
        # him and the screen: face = 0.90 x Quest's (measured on the two arts: her height = 0.94 x his seated height)
        ph_ = int(qh * .94)
        pq = PIX.resize((int(PIX.width * ph_ / PIX.height), ph_), Image.LANCZOS)
        pl = Image.blend(pq.convert('RGB'), Image.new('RGB', pq.size, (18, 22, 44)), .38 + .30 * (1 - glow)).convert('RGBA'); pl.putalpha(pq.getchannel('A'))
        px_, pf_ = PIXIE_FLOOR
        sh2 = Image.new('RGBA', base.size)
        ImageDraw.Draw(sh2).ellipse((px_ - pq.width * .45, pf_ - lib.P(20), px_ + pq.width * .45, pf_ + lib.P(12)), fill=(0, 0, 0, 110))
        base.alpha_composite(sh2.filter(ImageFilter.GaussianBlur(lib.P(10))))
        base.alpha_composite(pl, (int(px_ - pq.width / 2), int(pf_ - ph_)))
        base.alpha_composite(ql, (int(Q[0] * PW - q.width / 2), int(Q[1] * PH - qh)))
        if on:
            rim = Image.new('RGBA', base.size); rd = ImageDraw.Draw(rim)
            fx = Q[0] * PW + q.width * .22; fy = Q[1] * PH - qh * .72
            rd.ellipse((fx - lib.P(120), fy - lib.P(140), fx + lib.P(160), fy + lib.P(260)), fill=(120, 170, 255, 60))
            base.alpha_composite(rim.filter(ImageFilter.GaussianBlur(lib.P(40))))
        else:
            qsP = BH.SCR_QUAD
            x0, x1 = min(p[0] for p in qsP), max(p[0] for p in qsP); y0, y1 = min(p[1] for p in qsP), max(p[1] for p in qsP)
            f = BH.REFL; fh = int((y1 - y0) * .95); f = f.resize((int(f.width * fh / f.height), fh), Image.LANCZOS)
            g = Image.blend(f.convert('RGB'), Image.new('RGB', f.size, (140, 170, 210)), .4).convert('RGBA')
            g.putalpha(f.getchannel('A').point(lambda v: int(v * .45)))
            m = Image.new('L', base.size, 0); ImageDraw.Draw(m).polygon(qsP, fill=255)
            layer = Image.new('RGBA', base.size); layer.alpha_composite(g, (int((x0 + x1) / 2 - g.width * .55), int(y1 - fh)))
            layer.putalpha(Image.fromarray(np.minimum(np.asarray(layer.getchannel('A')), np.asarray(m))))
            base.alpha_composite(layer)
        return base.convert('RGB')
    info['room'] = save(room(True), 'room_on.jpg', q=92)
    save(room(False), 'room_off.jpg', q=92)
    qs = BH.SCR_QUAD
    info['screen'] = {'cx': round(BH.SCR_C[0] * PW, 1), 'cy': round(BH.SCR_C[1] * PH, 1),
                      'w': round(max(p[0] for p in qs) - min(p[0] for p in qs), 1), 'h': round(max(p[1] for p in qs) - min(p[1] for p in qs), 1)}
    info['quest_floor'] = {'x': BH.QSPEC[0] * PW, 'feet': BH.QSPEC[1] * PH, 'h': BH.QSPEC[2] * PH}

    shutil.copy2(ROOT / 'public/art/core/brand/secondquest_wordmark.png', OUT / 'wordmark.png')
    # end card: the EP002 v3 thumbnail chosen as main (B1 "EXCEPT YOU"), whole and undistorted, over its own raw art
    shutil.copy2(ROOT / 'docs/publish/EP002/thumbnails/v3/EP002_thumb_v3_B1_EXCEPT_YOU.jpg', OUT / 'thumb.jpg')
    save(Image.open(ROOT / 'docs/publish/EP002/thumbnails/v3/raw_B1.png').convert('RGB'), 'thumb_raw.jpg', q=88)
    info['sizes'] = {n: Image.open(OUT / n).size for n in ('hero_front.png', 'young_back.png', 'q3a.png', 'p2c.png', 'p2d.png', 'p2e.png',
                                                          'p2f.png', 'pix_wave.png', 'area_1998.png', 'area_today.png')}

    # the in-game HUD (scripts/animatic/hud.py, our own drawing) cut into its three groups for the 9:16 layout
    W2, H2 = lib.W, lib.H
    kb = np.asarray(hud.draw(Image.new('RGB', (W2, H2), (0, 0, 0)), rupees=38, t=None), np.float32)
    kw = np.asarray(hud.draw(Image.new('RGB', (W2, H2), (255, 255, 255)), rupees=38, t=None), np.float32)
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
NAVI = ROOT / 'public/episodes/ep002/sfx/navi_original'      # the Producer's original Navi clips (EP002 PRODUCER_DECISIONS)


def cues():
    """(short time, sound, dB relative to the voice, length s or None). Hits ~ -7 dB under the voice, beds ~ -20.
    sound = a Path (Navi: only the Producer's original clips, HELLO/LOOK ~9 dB under Bram, SFX_01 ~14, SFX_02-04 ~15),
    or a catalog spec for the no-repeat picker (scripts/sfx_pick.py, CATALOG.json): ('cat', {filters}) or
    ('layer', preset | [(cat, dB, offset, {filters})]). The picker never uses the same file twice in this Short
    (min_gap > the Short's length) and varies every render (pitch, stretch, tilt EQ, gain)."""
    T = seg.table()
    t = lambda k, d=0: T[k] + d                                         # noqa: E731
    C = lambda cat, **f: (cat, f)                                       # noqa: E731
    L = lambda spec: ('layer', spec)                                    # noqa: E731
    return [
        # A · the silent hero (l51-l53)
        (0.00, L([('impact-heavy', 0, 0, {'tags': ['slam', 'punch']}), ('whoosh', -4, -.18, {'max_dur': .7})]), -6, None),   # title slam, frame 1
        (0.08, C('pop', max_dur=.6), -10, None),                                       # the empty bubble pops up
        (0.00, C('nature-ambience', tags=['birds', 'forest']), -21, 3.4),               # a quiet field: the silence
        (t('l51.w9', -.05), L('pop+sparkle'), -12, None),                               # "imagination": doodles float out
        (t('l51.end', .04), NAVI / 'NAVI_HELLO.wav', -9, None),                          # Navi bursts into the silence: "Hello!"
        (t('l52', -.05), L('whoosh+cloth'), -12, None),               # punch in on the two of them
        (t('l52.w5', -.06), L([('riser-swell', 0, -.35, {'max_dur': .9}), ('magic-sparkle', -6, 0, {})]), -11, None),   # "voice": the bubble fills
        (t('l53', -.1), L('card-slide'), -10, None),                                     # the casting card slides in
        (t('l53.w3', 0), C('click-ui', max_dur=.4), -12, None),                          # Navi the cursor: take 1
        (t('l53.w5', 0), C('click-ui', max_dur=.4), -12, None),                          # take 2
        (t('l53.w6', -.04), L([('click-ui', 0, 0, {'tags': ['select']}), ('chime-bell', -7, .03, {'tags': ['ding', 'bell']})]), -8, None),   # "decide": picked
        (t('l53.w6', 0), NAVI / 'NAVI_SFX_04.wav', -15, None),
        (t('l53.w9', -.08), C('scifi', tags=['falling'], max_dur=.9), -12, None),       # "silence": the wave goes flat
        (t('l53.w10', -.05), C('pop', max_dur=.5), -12, None),                           # it springs back, golden
        # B · better is measurable (l42-l47)
        (t('S1', -.05), L([('impact-soft', 0, 0, {}), ('whoosh', -3, -.14, {'max_dur': .5})]), -7, None),   # the meter panel slams in
        (t('S1', .1), NAVI / 'NAVI_SFX_01.wav', -14, None),                             # Navi flies to the panel (her trail)
        (t('l42.w4', -.05), C('pop', max_dur=.6), -12, None),                            # Pixie's badge pops in
        (t('l43.w2', -.05), L([('scifi', 0, 0, {'tags': ['rising'], 'max_dur': 1.2}), ('magic-sparkle', -8, .05, {})]), -10, None),   # POLYGONS: the blocks smooth out
        (t('l44.w2', -.05), C('chime-bell', tags=['bell', 'ding']), -11, 1.4),          # LIGHTING: the sun comes out
        (t('l45.w2', -.05), C('foley-footstep', tags=['gravel', 'dirt', 'walking']), -12, None),   # ANIMATION: he walks
        (t('l45.w2', .3), C('foley-footstep', tags=['gravel', 'dirt', 'walking']), -13, None),
        (t('l46.w2', -.05), C('musical-sting', tags=['pizzi', 'xylophone']), -9, 1.6),  # SOUND: rings and notes
        (t('l47.w2', -.05), C('notify-tech', tags=['question', 'error']), -11, None),   # FAMILIAR: ???
        (t('l47.w4', -.05), C('cartoon-comedy', tags=['boing', 'spring']), -11, None),  # "not": Pixie is surprised
        (t('l47.w5', -.05), C('foley-paper', tags=['card', 'flip', 'book']), -10, None),   # the polaroid
        # C · 1998 / today / empty (l48-l50)
        (t('l48', -.15), C('riser-swell', tags=['reverse']), -11, 1.0),                # back to 1998 (a reversed swell)
        (t('l48.w5', -.05), C('retro-8bit', max_dur=.6), -13, None),                    # the 1998 tag
        (t('l48', 0), C('nature-ambience', tags=['wind']), -20, 3.6),
        (t('l48.w8', -.15), C('explosion-boom', tags=['low', 'frequency', 'thunder']), -15, None),   # "enormous": the pull-out
        (t('l49', -.05), C('riser-swell', tags=['riser', 'swell']), -12, 1.25),         # the rebuild scan
        (t('l49.w5', -.05), C('magic-sparkle'), -12, None),                              # TODAY
        (t('l50', 0), L([('whoosh', 0, 0, {'tags': ['swosh', 'whoosh']}), ('nature-ambience', -4, .1, {'tags': ['wind', 'atmosphere']})]), -14, 2.2),   # a gust
        (t('l50.w6', -.12), L([('whoosh', 0, 0, {'max_dur': .8}), ('foley-cloth', -6, .02, {'tags': ['rustle']})]), -14, None),   # "empty": snap back wide
        # D · the camera you fought (l54-l58)
        (t('S2', -.04), L('whoosh+cloth'), -9, None),
        (t('l54.w2', -.08), C('pop', max_dur=.5), -11, None),                            # the camera icon
        (t('l54.w5', -.08), L('impact+debris'), -8, None),                               # "fought": the camera clips into the wall
        (t('l54.w5', 0), NAVI / 'NAVI_SFX_03.wav', -15, None),                          # Navi gets knocked about
        (t('l54.w8', -.05), C('impact-soft', tags=['wood', 'impactwood']), -11, None),  # another lurch
        (t('l55', -.05), C('foley-metal', tags=['tools', 'hammer', 'tin']), -8, None),  # "Fix it": the wrench taps
        (t('l55.w2', 0), C('foley-metal', tags=['tools', 'hammer', 'tin']), -11, None),
        (t('l55.w2', .2), C('notify-tech', tags=['confirmation', 'complete']), -10, None),   # the check badge
        (t('l56.w3', 0), C('whoosh', max_dur=1.0), -14, None),                           # the camera settles behind him
        (t('l57', -.1), C('pop', max_dur=.6), -12, None),                                # Pixie's badge
        (t('l57.w3', -.08), L([('impact-soft', 0, 0, {}), ('musical-sting', -4, .02, {'tags': ['jingles'], 'max_dur': 1.4})]), -8, None),   # "Which is good."
        (t('l58', -.08), C('cartoon-comedy', tags=['boing', 'spring', 'squeak']), -9, None),   # "Probably.": the check tilts
        (t('l58', .25), NAVI / 'NAVI_SFX_02.wav', -15, None),
        # E · the memory changes quietly; the impossible job (l59-l60)
        (t('l59', -.1), C('whoosh', max_dur=1.0), -12, None),
        (t('l59.w5', -.1), C('pop', max_dur=.5), -14, None),                             # Pixie's badge (thinking)
        (t('l59.w3', .5), C('magic-sparkle', max_dur=1.6), -16, None),                   # each upgrade lands in the photo (quiet)
        (t('l59.w4', .5), C('magic-sparkle', max_dur=1.6), -17, None),
        (t('l59.w5', .5), C('magic-sparkle', max_dur=1.6), -16, None),
        (t('l59.w7', .5), C('magic-sparkle', max_dur=1.6), -17, None),
        (t('l60', -.08), L([('impact-soft', 0, 0, {}), ('foley-paper', -4, .03, {'tags': ['book', 'flip']})]), -9, None),   # NEW QUEST banner
        (t('l60.w4', 0), C('click-ui', tags=['tap', 'click']), -14, None),               # it types out
        (t('l60.w5', .1), C('musical-sting', tags=['jingles']), -11, 1.6),
        # F · the slider (l61)
        (t('l61', -.1), L('card-slide'), -10, None),
        (t('l61', -.05), C('pop', max_dur=.5), -13, None),                               # Pixie's badge (determined)
        (t('l61.w3', -.08), L([('scifi', 0, 0, {'tags': ['rising'], 'max_dur': 1.2}), ('foley-wood', -8, 0, {'tags': ['slide']})]), -12, None),   # the knob slides, Hyrule restyles
        (t('l61.w4', 0), C('magic-sparkle'), -14, None),
        # G · the bedroom: where their game went (l62)
        (t('l62', -.12), C('whoosh', max_dur=.9), -14, None),
        (t('l62', 0), C('nature-ambience', tags=['cricket', 'crickets', 'cicada']), -22, 2.6),   # night bed
        (t('l62.w5', -.05), L([('foley-misc', 0, 0, {'tags': ['switch']}), ('scifi', -4, .02, {'tags': ['falling'], 'max_dur': .7})]), -11, None),   # the CRT switches off
        # H · the wordmark, Navi into its star, the end card
        (t('VEND', -.2), C('impact-heavy', tags=['heavy', 'slam']), -7, None),           # wordmark lands
        (t('VEND', -.1), C('whoosh', max_dur=.8), -11, None),                            # gold bar grows
        (t('VEND', .05), NAVI / 'NAVI_SFX_01.wav', -14, None),                          # Navi round the wordmark into its star (her trail)
        (t('VEND', .85), C('magic-sparkle'), -9, None),                                  # the star twinkles
        (t('VEND', 1.2), C('musical-sting', tags=['jingles']), -10, 1.8),                # end card
        (t('VEND', 1.42), C('pop', max_dur=.5), -13, None),                              # Pixie waves
        (t('VEND', 1.55), NAVI / 'NAVI_LOOK.wav', -9, None),                            # Navi at the thumbnail: "Look!" (no voice under it)
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
    sys.path.insert(0, str(ROOT / 'scripts'))
    from sfx_pick import Picker                                         # noqa: E402  the free CC0 catalog, no repeats
    pk = Picker(seed='ep002_short2', min_gap=seg.DUR + 10)              # no file twice anywhere in the Short
    for c_ in pk.by_cat:                                                # CC0 and our own sounds only: no credit line needed
        pk.by_cat[c_] = [e for e in pk.by_cat[c_] if not e['licence'].startswith('CC-BY')]
    def ok(cat, f):                                                     # relax filters that leave no candidate (max_dur, then tags)
        for drop in ((), ('max_dur',), ('max_dur', 'tags')):
            g = {k: v for k, v in f.items() if k not in drop}
            if pk.candidates(cat, **g):
                return g
        raise LookupError(cat)
    for at, spec, rel, fade in cues():
        if not isinstance(spec, Path):
            if spec[0] == 'layer' and not isinstance(spec[1], str):
                spec = ('layer', [(c, db, off, ok(c, f)) for c, db, off, f in spec[1]])
            elif spec[0] != 'layer':
                spec = (spec[0], ok(spec[0], spec[1]))
        if isinstance(spec, Path):
            s = load(spec); path = spec.relative_to(ROOT)
        elif spec[0] == 'layer':
            y = pk.layer(spec[1], at, length=fade) if fade else pk.layer(spec[1], at)
            at = at + pk.last_layer_lead; s = y.mean(0); path = f'layer {spec[1] if isinstance(spec[1], str) else "+".join(l[0] for l in spec[1])}'
        else:
            s = pk.render(spec[0], at, length=fade, **spec[1]).mean(0); path = f'{spec[0]}: {pk.history[-1][2]}'
        if fade:
            s = s[:round(fade * SR)].copy(); f = min(len(s), round(.25 * SR)); s[-f:] *= np.linspace(1, 0, f)
        g = 10 ** ((v_db + rel - active_rms_db(s)) / 20)
        i0 = max(0, round(at * SR)); n = min(len(s), len(sfx) - i0)
        sfx[i0:i0 + n] += s[:n] * g
        log.append(f'{at:6.2f}  {rel:+3d} dB  {path}')
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
    I0, _ = meas(raw); gain = -14 - I0 - 3.01                          # mono -> stereo (two equal channels) adds 3 dB
    for _ in range(5):
        af = f'volume={gain:.2f}dB,aresample=192000,alimiter=limit=0.82:attack=2:release=80:level=disabled,aresample={SR}'
        subprocess.run([FF, '-v', 'error', '-y', '-i', str(raw), '-af', af, '-ac', '2', '-c:a', 'pcm_s16le', '-ar', str(SR), str(OUT / 'narration.wav')], check=True)
        I1, tp = meas(OUT / 'narration.wav')
        if abs(I1 + 14) < .15:
            break
        gain += -14 - I1
    raw.unlink()
    m = subprocess.run([FF, '-hide_banner', '-i', str(OUT / 'narration.wav'), '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    summ = m[m.rindex('Summary:'):]
    (OUT / 'sfx_cues.txt').write_text('\n'.join(log) + '\n\n' + pk.report() + '\n\n' + summ)
    print(pk.report().splitlines()[-1]); print('attributions:', pk.attributions())
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
