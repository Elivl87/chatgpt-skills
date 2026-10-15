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

    import n64_look                                                     # noqa: E402  v2.1: N64 low-poly + fog, not a mosaic
    f_old, f_mid = n64_look.build(field)
    save(f_old, 'field_old.jpg', q=92)
    save(f_mid, 'field_mid.jpg', q=92)
    # v3 (Producer: "¿El fondo de Deku Tree?"): the escalation happens on the giant tree, final plate #14, upgraded word
    # by word from the same N64 look (low-poly, flat 1998 light, fog) to the painted plate
    tree = lib.final_plate('tree')
    save(tree, 'tree.jpg', q=92)
    t_old, t_mid = n64_look.build_generic(tree)          # (flat light, no darkening: the tree must still read)
    save(t_old, 'tree_old.jpg', q=92)
    save(t_mid, 'tree_mid.jpg', q=92)

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
    QK_H = .33                                                          # kid Quest seated, 0.33 plate heights
    qk = dict(BC_.sized('kid_quest_play', .4465, .85), h=QK_H)
    pk = dict(BC_.sized('kid_pixie_point', .558, .82, BC_.PIXIE_RATIO), rot=-6)
    pk['h'] = QK_H * BC_.FACE['kid_quest_play'] / BC_.FACE['kid_pixie_point'] * BC_.PIXIE_RATIO * .93   # face 0.9 x his, a step behind
    old_q, old_gp = BC_.QUEST_K, BC_.game_picture
    BC_.QUEST_K = qk
    from PIL import ImageEnhance
    # critic v3 #7: the N64 sits a little further right, out of the first framing (whole when the camera pans to the TV)
    old_n64 = BC_.N64_POS; BC_.N64_POS = (int(PW * .71), old_n64[1])
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
    BC_.N64_POS = old_n64
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

    def room(mode):
        on = mode == 'on'
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
        # critic v2 #9 (PRODUCTION_PLAYBOOK §3): Q008 holds a modern-shaped pad while the N64 on the floor runs 1998
        # Hyrule on the CRT -> our 3D N64 pad goes in his hands (graded like him), his fingers repainted over it
        pad = Image.open(ROOT / 'public/art/ep002/props3d/n64_pad_room.png').convert('RGBA')
        pad = crop_alpha(pad); pw_ = 156; pad = pad.resize((pw_, round(pad.height * pw_ / pad.width)), Image.LANCZOS).rotate(-6, expand=True, resample=Image.BICUBIC)
        pg = Image.blend(pad.convert('RGB'), Image.new('RGB', pad.size, (18, 22, 44)), .30 + .30 * (1 - glow)).convert('RGBA'); pg.putalpha(pad.getchannel('A'))
        hb = (1522, 868, 1668, 960)                                       # plate px around his hands and the old pad
        before = np.asarray(base.crop(hb).convert('RGB')).astype(int)
        r_, g_, b_ = before[..., 0], before[..., 1], before[..., 2]
        hand = ((r_ > b_ + 30) & (g_ > b_) & (r_ > 100) & (b_ > .5 * r_)).astype(np.uint8) * 255   # skin only (not the old pad's yellow buttons)
        hand = Image.fromarray(hand).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(.8))
        base.alpha_composite(pg, (1606 - pg.width // 2, 908 - pg.height // 2))
        handl = base.crop(hb).copy(); handl.paste(Image.fromarray(before.astype(np.uint8)), (0, 0)); handl.putalpha(hand)
        base.alpha_composite(handl, hb[:2])
        if on:
            rim = Image.new('RGBA', base.size); rd = ImageDraw.Draw(rim)
            fx = Q[0] * PW + q.width * .22; fy = Q[1] * PH - qh * .72
            rd.ellipse((fx - lib.P(120), fy - lib.P(140), fx + lib.P(160), fy + lib.P(260)), fill=(120, 170, 255, 60))
            base.alpha_composite(rim.filter(ImageFilter.GaussianBlur(lib.P(40))))
        elif mode == 'off':
            # critic v2 #11: a reflection, not a picture: mirrored, grey-blue, ~20 % opacity, with a glass highlight streak
            qsP = BH.SCR_QUAD
            x0, x1 = min(p[0] for p in qsP), max(p[0] for p in qsP); y0, y1 = min(p[1] for p in qsP), max(p[1] for p in qsP)
            # critic v2c: the whole head readable inside the glass: BH.REFL is #10 already mirrored (head, shoulders, the
            # hand at his chin); its head ~40 % of the screen height, hair top in the upper third, grey-blue, ~30 %
            f = BH.REFL; f = f.crop(f.getchannel('A').getbbox()); fh = int((y1 - y0) * .62); f = f.resize((int(f.width * fh / f.height), fh), Image.LANCZOS)
            from PIL import ImageOps
            g = Image.blend(ImageOps.grayscale(f.convert('RGB')).convert('RGB'), Image.new('RGB', f.size, (150, 175, 215)), .35).convert('RGBA')
            fade = np.clip((1 - np.linspace(0, 1, fh)) / .4, 0, 1)[:, None]          # the shoulders melt into the dark glass (no cut edge)
            g.putalpha(Image.fromarray((np.asarray(f.getchannel('A')) * .30 * fade).astype(np.uint8)))
            m = Image.new('L', base.size, 0); ImageDraw.Draw(m).polygon(qsP, fill=255)
            layer = Image.new('RGBA', base.size); layer.alpha_composite(g, (int((x0 + x1) / 2 - g.width * .5), int(y0 + (y1 - y0) * .1)))
            layer.putalpha(Image.fromarray(np.minimum(np.asarray(layer.getchannel('A')), np.asarray(m))))
            base.alpha_composite(layer)
            st = Image.new('RGBA', base.size); sd = ImageDraw.Draw(st)
            sd.polygon([(x0 + (x1 - x0) * .55, y0), (x0 + (x1 - x0) * .72, y0), (x0 + (x1 - x0) * .30, y1), (x0 + (x1 - x0) * .13, y1)], fill=(220, 235, 255, 34))
            st = st.filter(ImageFilter.GaussianBlur(3)); st.putalpha(Image.fromarray(np.minimum(np.asarray(st.getchannel('A')), np.asarray(m))))
            base.alpha_composite(st)
        return base.convert('RGB')
    info['room'] = save(room('on'), 'room_on.jpg', q=92)
    save(room('dark'), 'room_dark.jpg', q=92)                          # the TV just went off: dark glass, nothing yet
    save(room('off'), 'room_off.jpg', q=92)                            # ...then his faint reflection rises in it
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
    """v2 (Producer 2026-10-14: "ni se diga de los sonidos"; DESIGN_RUBRIC §7): restraint. 14 onsets in 49.6 s (budget
    18/min), Navi and the two beds included; every cue is hand-picked from the premium tier of CATALOG.json (CC0 or
    our own; no 8-bit, no creature, no boing) and names the on-screen event it serves. Same interaction = same family
    (the three "upgrades/rebuild" moments are three different files of one magical-swell family), never the same file.
    (time, file, dB relative to the voice, length s or None, why)."""
    T = seg.table()
    t = lambda k, d=0: T[k] + d                                         # noqa: E731
    C = lambda f: SFXD / f                                              # noqa: E731
    # v3 (22.6 s): 6 onsets (18/min budget), Navi included: the hook stays silent but for Bram and Navi's "Hello!"
    return [
        (t('l51.end', .02), NAVI / 'NAVI_HELLO.wav', -9, None, 'Navi appears in the pause after "imagination." (Producer clip)'),
        (t('l43.w2', -.05), C('cc0/jaggedstone_magic/magical_1.ogg'), -11, None, '"More polygons": the 1998 tree sharpens, its face appears'),
        (t('l46.w2', -.05), C('cc0/pauliuw_forestbirds/Forest_Birds_4.ogg'), -12, 1.6, '"Better sound": the flock bursts out of the canopy'),
        # retention critic v3: a low wind swells under "That is the" from the end of l47 and cuts DEAD into the bass drop
        ((t('l47.end', .02), [(C('cc0/sketchman_windwhoosh/wind_woosh_loop.ogg'), -3, 0, t('l60.w4', -.06) - t('l47.end', .02), 'swell'),
                               (C('cc0/kenney_impact/impactPunch_heavy_000.ogg'), 0, t('l60.w4', -.06) - t('l47.end', .02)),
                               (C('cc0/kenney/impactSoft_heavy_000.ogg'), -3, t('l60.w4', -.06) - t('l47.end', .02))]), None, -7, None,
         'held breath (wind) cut dead into the payoff: the one bass-drop impact on the hard cut to the castle ("impossible")'),
        # ...and a quiet field-wind bed under the card so the last second is not dead air and the loop back to frame 0 flows
        ((t('VEND', .08), [(C('cc0/kenney_impact/impactBell_heavy_002.ogg'), 0), (NAVI / 'NAVI_SFX_01.wav', -5),
                           (C('cc0/thimras_park/park_ambience_wind.ogg'), -5, 0, seg.DUR - t('VEND', .08), 'bed')]), None, -9, None,
         'the wordmark lands; Navi circles it (her trail, Producer clip); a quiet field wind under the card'),
        (t('VEND', 1.5), NAVI / 'NAVI_LOOK.wav', -9, None, 'Navi reaches the sign: "Look!" (Producer clip, no voice under it)'),
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
    plan = []
    for at, spec, rel, length, why in cues():
        if spec is None:                                                # a layer: [(file, dB within the layer)], one onset
            at, parts = at
        else:
            parts = [(spec, 0)]
        y = None; yh = None
        for pt in parts:
            f, d = pt[0], pt[1]; off = pt[2] if len(pt) > 2 else 0
            x = load(f) * 10 ** (d / 20)
            if len(pt) > 3:                                             # (file, dB, offset, length, 'swell'|'bed')
                x = x[:round(pt[3] * SR)].copy()
                if pt[4] == 'swell':
                    x *= np.linspace(0, 1, len(x)) ** 1.5               # rises, then cut dead (no fade out)
                else:
                    fi = min(len(x), round(.3 * SR)); x[:fi] *= np.linspace(0, 1, fi); fo = min(len(x), round(.25 * SR)); x[-fo:] *= np.linspace(1, 0, fo)
            x = np.concatenate([np.zeros(round(off * SR), np.float32), x])
            y = x if y is None else (np.pad(y, (0, max(0, len(x) - len(y)))) + np.pad(x, (0, max(0, len(y) - len(x)))))
            if len(pt) <= 3:
                xh = x[round(off * SR):]
                yh = xh if yh is None else (np.pad(yh, (0, max(0, len(xh) - len(yh)))) + np.pad(xh, (0, max(0, len(yh) - len(xh)))))
        if length:
            y = y[:round(length * SR)].copy(); f_ = min(len(y), round(.35 * SR)); y[-f_:] *= np.linspace(1, 0, f_)
        g = 10 ** ((v_db + rel - active_rms_db(yh)) / 20)          # the level is set on the hits only; beds/swells ride at their own dB
        i0 = max(0, round(at * SR)); n = min(len(y), len(sfx) - i0)
        sfx[i0:i0 + n] += y[:n] * g
        names = ' + '.join(str(Path(pt[0]).relative_to(ROOT)) for pt in parts)
        log.append(f'{at:6.2f}  {rel:+3d} dB  {names}')
        plan.append({'t': round(at, 3), 'rel_db': rel, 'spec': names, 'why': why})
    (OUT / 'sfx_plan.json').write_text(json.dumps(plan, indent=1))
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
