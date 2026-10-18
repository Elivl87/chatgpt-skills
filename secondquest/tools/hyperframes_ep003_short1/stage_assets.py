#!/usr/bin/env python3
"""Stage EP003 Short #1's assets into short/assets/ (gitignored) and build its audio.

Art: only existing EP003/core art and our 3D cut-outs (public/art/ep003/props3d, re-rendered 2026-10-18 with the
pupil fix). Files are COPIED (or downscaled / blurred copies); no source file is modified.

Audio: Bram's real EP003 narration cut to seg.SEGMENTS (cuts inside measured pauses, 30 ms fades), each placed at its
Short time, + a restrained free SFX layer (our synths and CC0 packs from public/shared/sfx/CATALOG.json, premium tier,
no file used twice), hits ~7-12 dB under the voice, music off, master -14 LUFS / <= -1 dBTP.

  python3 stage_assets.py            # everything
  python3 stage_assets.py --audio    # only the audio mix
"""
import json, re, shutil, subprocess, sys, wave
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = HERE / 'short' / 'assets'
FF = str(HERE.parent / 'hyperframes_ep003' / '.bin' / 'ffmpeg')
if not Path(FF).exists():
    import imageio_ffmpeg; FF = imageio_ffmpeg.get_ffmpeg_exe()
sys.path.insert(0, str(HERE))
import seg  # noqa: E402

SR = 48000
P3 = 'public/art/ep003/props3d/'
ART = {   # staged name: (source, max height or None)
    'leo_sideeye.png': (P3 + 'leo_front_sideeye.png', None), 'leo_sideeye_blink.png': (P3 + 'leo_front_sideeye_blink.png', None),
    'leo_sweat.png': (P3 + 'leo_front_sweat.png', None), 'leo_sweat_blink.png': (P3 + 'leo_front_sweat_blink.png', None),
    'fish_deadpan.png': (P3 + 'fish2_34_deadpan.png', None), 'fish_lookup.png': (P3 + 'fish2_34_lookup.png', None),
    'fish_blink.png': (P3 + 'fish2_34_blink.png', None), 'fish_wide.png': (P3 + 'fish2_34_wide.png', None),
    'rowboat_front.png': (P3 + 'rowboat_side_front.png', None),
    'rowboat_back_tall.png': (P3 + 'rowboat_side_back_tall.png', None), 'rowboat_front_tall.png': (P3 + 'rowboat_side_front_tall.png', None),
    'boat_max_sideeye.png': (P3 + 'boat_max_sideeye.png', None), 'boat_max_sideeye_blink.png': (P3 + 'boat_max_sideeye_blink.png', None),
    'boat_leo_sideeye.png': (P3 + 'boat_leo_sideeye.png', None), 'boat_leo_sideeye_blink.png': (P3 + 'boat_leo_sideeye_blink.png', None),
    'rod.png': (P3 + 'rod.png', None),
    'quest_laugh.png': ('docs/art_orders/quest/library_v2/results/02_laughing_pointing.png', 900),
    'pixie_laugh.png': ('docs/art_orders/pixie/library/results/04_laughing_pointing.png', 900),
    'quest_wave.png': ('docs/art_orders/quest/library_v2/results/01_wave_happy.png', None),
    'pixie_wave.png': ('docs/art_orders/pixie/library/results/01_wave_happy.png', 1024),
    'max_av.png': (P3 + 'max_front_neutral.png', 760), 'leo_av.png': (P3 + 'leo_front_sideeye.png', 760),
    'wordmark.png': ('public/art/core/brand/secondquest_wordmark.png', None),
}
LAKE = 'docs/art_orders/ep003/new_art_v1/derived/lake_dusk.png'


def stage_art():
    info = {'sizes': {}}
    for name, (src, mh) in ART.items():
        im = Image.open(ROOT / src)
        if mh and im.height > mh:
            im = im.resize((round(im.width * mh / im.height), mh), Image.LANCZOS)
        im.save(OUT / name)
        info['sizes'][name] = list(im.size)
    # the lake as a 1080 x 1920 vertical plate (x 2.553, the boat side of the sunset), sharp-ish for the wide shot and a
    # soft depth-of-field copy behind the close-ups / chat / card (pre-blurred: no per-frame CSS blur)
    lake = Image.open(ROOT / LAKE).convert('RGB')
    k = 1920 / lake.height; big = lake.resize((round(lake.width * k), 1920), Image.LANCZOS)
    for name, x0, w, blur in (('lake_vw.jpg', 600, 2160, 1.2), ('lake_soft.jpg', 1150, 1080, 9)):
        big.crop((x0, 0, x0 + w, 1920)).filter(ImageFilter.GaussianBlur(blur)).save(OUT / name, quality=92)
    (OUT / 'fonts').mkdir(exist_ok=True)
    for f in ('Anton-Regular.woff2', 'Inter-600.woff2', 'Inter-800.woff2', 'Caveat-700-latin.woff2'):
        shutil.copy2(ROOT / 'public/shared/fonts' / f, OUT / 'fonts' / f)
    (OUT / 'vendor').mkdir(exist_ok=True)
    shutil.copy2(HERE.parent / 'hyperframes_ep003/node_modules/gsap/dist/gsap.min.js', OUT / 'vendor/gsap.min.js')
    (OUT / 'art_info.json').write_text(json.dumps(info, indent=1))
    print('art staged:', len(list(OUT.glob('*'))), 'files')


# ------------------------------------------------------------------ audio
def load(path):
    raw = subprocess.run([FF, '-v', 'error', '-i', str(path), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def active_rms_db(x, gate=-40):
    n = len(x) // 480
    r = np.sqrt((x[:n * 480].reshape(n, 480) ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(r); act = r[db > gate]
    return 20 * np.log10(np.sqrt((act ** 2).mean()) + 1e-12) if len(act) else -99


S = ROOT / 'public/shared/sfx'


def cues():
    """Restraint (DESIGN_RUBRIC §7): 11 onsets + one lake bed in 20.4 s; same interaction = same family, never the same
    file. (time, file, dB relative to the voice, length s or None, why)."""
    T = seg.table()
    return [
        (0.03, S / 'cc0/kenney_interface/confirmation_003.ogg', -8, None, 'frame 0: the notification banner (Max: "It\'s eight dollars. Just get it.")'),
        (2.60, S / 'cc0/artisticdude_swishes/swish_3.ogg', -12, None, 'cut: the phone swings in'),
        (T['h06.w1'] + .14, S / 'cc0/tokyogeisha_58/Pop_01.ogg', -9, None, '"Bought." 1: Pixie\'s sticker slaps on'),
        (T['h06.w2'] + .14, S / 'cc0/rubberduck_water/bubble_02.ogg', -8, None, '"Bought." 2: Quest\'s sticker, bigger kick'),
        (T['h06.w3'] + .14, S / 'cc0/kenney_interface/drop_004.ogg', -7, None, '"Bought." 3: Max\'s sticker, biggest kick'),
        (T['h07.w9.end'] + .05, S / 'cc0/artisticdude_swishes/swish_7.ogg', -13, None, 'Leo\'s "I\'ll get it later." is sent'),
        (T['h07.w15'], S / 'own/tap_marimba/tap_marimba_03.ogg', -15, None, '"later.": the fish\'s one slow blink (dry tick)'),
        (T['h08'] - .25, S / 'cc0/qubodup_waves/wave_02_cc0_18363_jasinski_alkaibeach.ogg', -14, None, 'cut to the wide: water laps the boat'),
        (seg.VOICE_END + .3, S / 'cc0/artisticdude_swishes/swish_10.ogg', -11, None, 'the end card slides in'),
        (seg.VOICE_END + 1.55, S / 'cc0/artisticdude_rpg/slime6.ogg', -9, None, 'the fish flops onto the wordmark\'s gold bar'),
        (seg.DUR - 1.0, S / 'buzzer.wav', -13, .35, 'loop seam: the phone buzzes, the banner drops again'),
    ]


BED = (S / 'cc0/kresiek_outside/amb_outdoor1_loop.ogg', -26)      # outdoor air under the lake shots (and the loop seam)


def stage_audio():
    narr = load(ROOT / 'public/episodes/ep003/audio/narration.wav')
    voice = np.zeros(round(seg.DUR * SR), np.float32)
    for a, b, at in seg.SEGMENTS:
        x = narr[round(a * SR):round(b * SR)].copy()
        f = round(.03 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        i0 = round(at * SR); voice[i0:i0 + len(x)] += x[:len(voice) - i0]
    v_db = active_rms_db(voice)
    sfx = np.zeros_like(voice)
    log, plan = [], []
    for at, f, rel, length, why in cues():
        y = load(f)
        if length:
            y = y[:round(length * SR)].copy(); fo = min(len(y), round(.08 * SR)); y[-fo:] *= np.linspace(1, 0, fo)
        g = 10 ** ((v_db + rel - active_rms_db(y)) / 20)
        i0 = max(0, round(at * SR)); n = min(len(y), len(sfx) - i0)
        sfx[i0:i0 + n] += y[:n] * g
        log.append(f'{at:6.2f}  {rel:+3d} dB  {f.relative_to(ROOT)}')
        plan.append({'t': round(at, 3), 'rel_db': rel, 'spec': str(f.relative_to(ROOT)), 'why': why})
    # the bed: 0 -> the end card (fade out under the card's whoosh), back for the loop seam so the seam is seamless
    bf, brel = BED
    bed = load(bf); bed = np.tile(bed, int(np.ceil(len(voice) / len(bed))))[:len(voice)]
    env = np.zeros(len(voice), np.float32)
    def ramp(t0, t1, v0, v1):
        a, b = round(t0 * SR), round(t1 * SR); env[a:b] = np.linspace(v0, v1, b - a)
    ramp(0, .02, 1, 1); env[:round((seg.VOICE_END + .3) * SR)] = 1
    ramp(seg.VOICE_END + .3, seg.VOICE_END + 1.0, 1, 0); ramp(seg.DUR - 1.0, seg.DUR, 0, 1)
    sfx += bed * env * 10 ** ((v_db + brel - active_rms_db(bed)) / 20)
    plan.append({'t': 0.0, 'rel_db': brel, 'spec': str(bf.relative_to(ROOT)), 'why': 'outdoor air bed under the lake shots, back for the loop seam', 'bed': True})
    (OUT / 'sfx_plan.json').write_text(json.dumps(plan, indent=1))
    mix = voice + sfx
    mix *= .9 / max(1e-6, float(np.abs(mix).max()))
    raw = OUT / '_mix_raw.wav'
    write_wav(raw, mix)

    def meas(p):
        m = subprocess.run([FF, '-hide_banner', '-i', str(p), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
        m = m[m.rindex('Summary:'):]
        return float(re.search(r'I:\s+(-?[\d.]+) LUFS', m).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', m).group(1))
    I0, _ = meas(raw); gain = -14 - I0 - 3.01
    for _ in range(5):
        af = f'volume={gain:.2f}dB,aresample=192000,alimiter=limit=0.82:attack=2:release=80:level=disabled,aresample={SR}'
        subprocess.run([FF, '-v', 'error', '-y', '-i', str(raw), '-af', af, '-ac', '2', '-c:a', 'pcm_s16le', '-ar', str(SR), str(OUT / 'narration.wav')], check=True)
        I1, tp = meas(OUT / 'narration.wav')
        if abs(I1 + 14) < .15:
            break
        gain += -14 - I1
    raw.unlink()
    (OUT / 'sfx_cues.txt').write_text('\n'.join(log) + f'\n\nI {I1:.1f} LUFS, peak {tp:.1f} dBFS\n')
    print(f'audio: {len(voice) / SR:.2f} s, voice active RMS {v_db:.1f} dBFS, {len(log)} SFX cues + bed; I {I1:.1f} LUFS, peak {tp:.1f}')


def write_wav(path, x):
    y = np.clip(x, -1, 1)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y * 32767).astype('<i2').tobytes())


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    if '--audio' not in sys.argv:
        stage_art()
    stage_audio()
