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
    from icons import camera_icon, wrench_icon                          # noqa: E402  the episode's camera + wrench icons
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

    # the "Saturday, 1998" polaroid (block F's memory: the kids' afternoon of block C), drawn bigger for 9:16, and the
    # same photo after the upgrades (block H: cooler, sharper, the handwritten date gone)
    BC = BH.BC
    room = BC.room_plate(BC.T_SAT + 3, BC.PIXIE_SIT).convert('RGB')
    ph = room.crop((int(.12 * PW), int(.45 * PH), int(.66 * PW), int(1.0 * PH)))
    ph = ph.resize((760, round(760 * ph.height / ph.width)), Image.LANCZOS)
    old = Image.blend(ph, Image.new('RGB', ph.size, (255, 200, 130)), .12)
    from PIL import ImageEnhance
    nw = ImageEnhance.Sharpness(ImageEnhance.Contrast(ImageEnhance.Color(old).enhance(1.7)).enhance(1.3)).enhance(2.5)
    nw = Image.blend(nw, Image.new('RGB', nw.size, (150, 200, 255)), .12)
    for nm, img, cap in (('pola_old.png', old, True), ('pola_new.png', nw, False)):
        card = Image.new('RGBA', (img.width + 40, img.height + 120), (250, 246, 236, 255)); card.paste(img, (20, 20))
        if cap:
            ImageDraw.Draw(card).text((30, img.height + 38), 'Saturday, 1998', font=lib.F(26), fill=(70, 55, 40, 255))
        card.save(OUT / nm, optimize=True)
    info['pola'] = list(card.size)

    # the upgrades that drift into the photo (block H chips), the episode's camera icon + wrench, the quest banner
    for k in ('hd', 'camera', 'note', 'voice'):
        BH.chip(k).save(OUT / f'chip_{k}.png', optimize=True)
    camera_icon(rec=True, width=200).save(OUT / 'cam_icon.png', optimize=True)
    w0 = wrench_icon(-24); w0.crop(w0.getchannel('A').getbbox()).save(OUT / 'wrench.png', optimize=True)
    title = 'The Impossible Job'
    frames = [UI.sq_banner('New quest', title, n=n, done_blink=False) for n in range(len(title) + 1)]
    bw, bh = frames[0].size
    sheet = Image.new('RGBA', (bw, bh * len(frames)))
    for i, f in enumerate(frames):
        sheet.alpha_composite(f, (0, i * bh))
    sheet.save(OUT / 'banner_sprite.png', optimize=True)
    info['banner'] = [bw, bh, len(frames)]
    UI.area_title('1998', retro=True, size=48).save(OUT / 'area_1998.png', optimize=True)
    UI.area_title('TODAY', size=48).save(OUT / 'area_today.png', optimize=True)
    for nm, (w, h) in (('panel_meter', (440, 300)), ('panel_cast', (400, 214)), ('panel_slider', (440, 120))):
        UI.sq_box(w, h).save(OUT / f'{nm}.png', optimize=True)
        info[nm] = list(Image.open(OUT / f'{nm}.png').size)

    # the ocarina knob of the FAMILIAR <-> DIFFERENT slider: one frame of our 3D ocarina turntable
    oc = sorted((ROOT / 'public/art/ep002/props3d/ocarina_spin').glob('f*.png'))[3]
    save(crop_alpha(Image.open(oc).convert('RGBA')), 'oca_knob.png', max_h=260)

    # the grown-up bedroom at night (final plate #15) as block H builds it: our 3D CRT on the bedside table playing 1998
    # Hyrule, the N64 on the floor, Quest (Q008) on the floor in profile lit by the screen; and the same room with the
    # TV off, his pensive reflection (#10 mirrored) in the dark glass. Composited in plate px, no camera crop.
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
    info['sizes'] = {n: Image.open(OUT / n).size for n in ('hero_front.png', 'young_back.png', 'chip_hd.png', 'chip_camera.png',
                                                          'chip_note.png', 'chip_voice.png', 'cam_icon.png', 'wrench.png',
                                                          'area_1998.png', 'area_today.png', 'oca_knob.png')}

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
    """(short time, file, dB relative to the voice, fade-out s or None). Hits ~ -7 dB under the voice, beds ~ -16.
    Navi: only the Producer's original clips (HELLO ~9 dB under Bram, SFX_01 ~14 dB under, SFX_02/03/04 ~14-15 dB under)."""
    T = seg.table()
    t = lambda k, d=0: T[k] + d                                         # noqa: E731
    return [
        # A · the silent hero (l51-l53)
        (0.00, K / 'impactPunch_heavy_002.ogg', -6, None),               # title slam on frame 1
        (0.00, SFXD / 'whoosh.wav', -9, None),
        (0.08, SFXD / 'pop.wav', -9, None),                              # the empty bubble pops up
        (0.00, SFXD / 'wind.wav', -20, 3.4),                             # field bed (a quiet field: the silence)
        (t('l51.w9', -.05), SFXD / 'sparkle.wav', -12, None),            # "imagination": doodles float out
        (t('l51.end', .04), NAVI / 'NAVI_HELLO.wav', -9, None),          # Navi pops in and fills the silence: "Hello!"
        (t('l52.w5', -.06), K / 'phaserUp1.ogg', -11, None),             # "voice": the bubble fills with a waveform
        (t('l53.w1', -.1), SFXD / 'whip.wav', -10, None),                # the casting card slides in
        (t('l53.w3', 0), K / 'tick_001.ogg', -11, None),                 # Navi the cursor: take 1
        (t('l53.w5', 0), K / 'tick_001.ogg', -11, None),                 # take 2
        (t('l53.w6', -.04), K / 'confirmation_001.ogg', -8, None),       # "decide": picked
        (t('l53.w6', 0), NAVI / 'NAVI_SFX_04.wav', -15, None),
        (t('l53.w9', -.05), K / 'switch_006.ogg', -12, None),            # "silence": the wave goes flat
        # B · better is measurable (l42-l47)
        (t('S1', -.05), K / 'impactSoft_heavy_000.ogg', -7, None),       # the meter panel slams in
        (t('S1', -.02), SFXD / 'whoosh.wav', -10, None),
        (t('S1', .1), NAVI / 'NAVI_SFX_01.wav', -14, None),             # Navi flies to the panel (her trail)
        (t('l43.w2', -.05), K / 'powerUp3.ogg', -10, None),              # POLYGONS fills, the blocks smooth out
        (t('l43.w2', -.05), K / 'scratch_005.ogg', -14, None),
        (t('l44.w2', -.05), SFXD / 'chime.wav', -11, 1.0),               # LIGHTING: the sun comes out
        (t('l45.w2', -.05), K / 'footstep_wood_000.ogg', -12, None),     # ANIMATION: he walks
        (t('l45.w2', .25), K / 'footstep_wood_001.ogg', -13, None),
        (t('l46.w2', -.05), K / 'pluck_001.ogg', -9, None),              # SOUND: rings and notes
        (t('l47.w2', -.05), K / 'question_001.ogg', -10, None),          # FAMILIAR: ???
        (t('l47.w4', -.05), SFXD / 'buzzer.wav', -16, None),             # "not": the meter can't read it
        (t('l47.w5', -.05), SFXD / 'pop.wav', -11, None),                # the polaroid
        # C · 1998 / today / empty (l48-l50)
        (t('l48', -.12), K / 'lowDown.ogg', -11, None),                  # back to 1998
        (t('l48', -.1), SFXD / 'tv_on.wav', -14, None),
        (t('l48', 0), SFXD / 'wind.wav', -19, 3.6),
        (t('l48.w8', -.15), K / 'lowFrequency_explosion_000.ogg', -14, None),   # "enormous": the pull-out
        (t('l49', -.05), K / 'forceField_002.ogg', -12, None),          # the rebuild scan
        (t('l49.w5', -.05), K / 'powerUp10.ogg', -12, None),            # TODAY
        (t('l50', 0), SFXD / 'wind.wav', -14, 2.2),                      # "empty": a gust, nothing else
        # D · the camera you fought (l54-l58)
        (t('S2', -.04), SFXD / 'whip.wav', -9, None),
        (t('l54.w2', -.05), K / 'metalClick.ogg', -11, None),            # the camera icon
        (t('l54.w5', -.08), K / 'impactWood_heavy_000.ogg', -8, None),   # "fought": the camera clips into the wall
        (t('l54.w5', 0), NAVI / 'NAVI_SFX_03.wav', -15, None),          # Navi gets knocked about
        (t('l54.w8', -.05), K / 'impactPlank_medium_000.ogg', -11, None), # another lurch
        (t('l55', -.05), K / 'impactTin_medium_000.ogg', -8, None),      # "Fix it": the wrench taps
        (t('l55.w2', 0), K / 'impactTin_medium_000.ogg', -11, None),
        (t('l55.w2', .2), K / 'confirmation_001.ogg', -10, None),        # the check badge
        (t('l56.w3', 0), K / 'maximize_001.ogg', -13, None),             # the camera settles behind him
        (t('l57.w3', -.08), SFXD / 'ui_complete.wav', -8, None),         # "Which is good.": the big check lands
        (t('l58', -.08), K / 'question_001.ogg', -9, None),              # "Probably.": it tilts into a "?"
        (t('l58', .25), NAVI / 'NAVI_SFX_02.wav', -15, None),
        # E · the memory changes quietly; the impossible job (l59-l60)
        (t('l59', -.08), SFXD / 'whoosh.wav', -12, None),
        (t('l59.w3', .5), SFXD / 'sparkle.wav', -16, None),              # each upgrade lands in the photo (quiet)
        (t('l59.w4', .5), SFXD / 'sparkle.wav', -17, None),
        (t('l59.w5', .5), SFXD / 'sparkle.wav', -16, None),
        (t('l59.w7', .5), SFXD / 'sparkle.wav', -17, None),
        (t('l60', -.05), SFXD / 'stamp.wav', -9, None),                  # NEW QUEST banner
        (t('l60.w4', 0), K / 'scroll_001.ogg', -12, None),               # it types out
        (t('l60.w5', .1), K / 'powerUp10.ogg', -11, None),
        # F · the slider (l61)
        (t('l61', -.08), K / 'switch_002.ogg', -10, None),
        (t('l61.w3', -.05), K / 'phaserUp1.ogg', -12, None),             # the knob slides to DIFFERENT, Hyrule restyles
        (t('l61.w6', 0), SFXD / 'sparkle.wav', -14, None),
        # G · the bedroom: where their game went (l62)
        (t('l62', -.1), K / 'lowDown.ogg', -14, None),
        (t('l62', 0), SFXD / 'crickets.wav', -22, 2.6),                  # night bed
        (t('l62.w5', -.05), SFXD / 'tv_on.wav', -13, None),              # the CRT switches off (its click)
        (t('l62.w5', -.02), K / 'switch_002.ogg', -11, None),
        # H · the wordmark, Navi into its star, the end card
        (t('VEND', -.2), SFXD / 'impact.wav', -7, None),                 # wordmark lands
        (t('VEND', -.1), SFXD / 'whoosh.wav', -11, None),                # gold bar grows
        (t('VEND', .05), NAVI / 'NAVI_SFX_01.wav', -14, None),          # Navi flies round the wordmark into its star (her trail)
        (t('VEND', .85), SFXD / 'sparkle.wav', -8, None),               # the star twinkles
        (t('VEND', 1.25), SFXD / 'ui_complete.wav', -10, None),          # end card
        (t('VEND', 1.55), NAVI / 'NAVI_LOOK.wav', -9, None),            # Navi at the thumbnail: "Look!" (no voice under it)
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
