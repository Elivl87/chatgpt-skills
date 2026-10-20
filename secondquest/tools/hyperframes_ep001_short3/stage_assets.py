#!/usr/bin/env python3
"""Stage EP001 Short #3's assets into short/assets/ (gitignored) and build its audio.

Art: only existing EP001 / core / farming-genre art (public/art), COPIED as downscaled or cropped/blurred copies; no
source file is modified. One composite: Quest's seated tractor pose placed on the small tractor's seat
(quest_on_tractor.png).

Audio: Bram's EP001 narration (audio/full/narration.wav, the published voice) cut to seg.SEGMENTS (cuts inside measured pauses, 30 ms fades), each placed at its
Short time, + a restrained free SFX layer (CATALOG.json premium tier, CC0/own, no file used twice), music off, master
-14 LUFS / <= -1 dBTP.

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
A = 'public/art/'
G = A + 'genres/farming/'
ART = {   # staged name: (source, max height or None)
    'tractor_huge.png': (G + 'machines/tractor_huge.png', None),
    'q_exhausted.png': (A + 'core/quest/exhausted_slumped.png', None),
    'q_bed.png': (A + 'core/quest/bed_awake.png', None),
    'alarm.png': (A + 'core/objects/alarm_clock.png', None),
    'q_desk.png': (A + 'core/quest/desk_typing.png', 1600),
    'q_paycheck.png': (A + 'core/quest/holding_paycheck.png', None),
    'wallet_happy.png': (A + 'core/cast/wallet/happy.png', 700),
    'wallet_shock.png': (A + 'core/cast/wallet/price_shock.png', 700),
    'wallet_fainted.png': (A + 'core/cast/wallet/fainted.png', 700),
    'q_heroic.png': (G + 'quest/heroic.png', 1600),
    'wordmark.png': (A + 'core/brand/secondquest_wordmark.png', None),
}
# vertical 1080x1920 plates: (source, x0 in the plate scaled to 1920 high, blur px)
PLATES = {
    'f0_bg.jpg': (G + 'backgrounds/field_huge_wide.png', 1180, 4),
    'bedroom.jpg': (A + 'core/backgrounds/quest_bedroom_morning.png', None, 10),   # the wall above the room's own bed (one bed in shot)
    'office.jpg': (A + 'core/backgrounds/office_openplan.png', 1150, 6),
    'dealership.jpg': (G + 'backgrounds/dealership.png', 1500, 1),
    'golden.jpg': (G + 'backgrounds/field_golden.png', 1160, 0),
}


def stage_art():
    info = {'sizes': {}}
    for name, (src, mh) in ART.items():
        im = Image.open(ROOT / src)
        if mh and im.height > mh:
            im = im.resize((round(im.width * mh / im.height), mh), Image.LANCZOS)
        im.save(OUT / name); info['sizes'][name] = list(im.size)
    for name, (src, x0, blur) in PLATES.items():
        im = Image.open(ROOT / src).convert('RGB')
        if x0 is None:                                                  # bedroom: the upper-right wall, no bed in it
            im = im.crop((2000, 0, 2540, 960)).resize((1080, 1920), Image.LANCZOS)
        else:
            k = 1920 / im.height
            im = im.resize((round(im.width * k), 1920), Image.LANCZOS).crop((x0, 0, x0 + 1080, 1920))
        if blur:
            im = im.filter(ImageFilter.GaussianBlur(blur))
        im.save(OUT / name, quality=92)
    # the giant field for the pull-out, kept large (the camera starts ~3x in)
    big = Image.open(ROOT / G / 'backgrounds/field_huge_wide.png').convert('RGB')
    big.resize((big.width * 3840 // big.width, big.height * 3840 // big.width), Image.LANCZOS).save(OUT / 'field_big.jpg', quality=90)
    info['sizes']['field_big.jpg'] = [3840, big.height * 3840 // big.width]
    # Quest seated on the small tractor (his seated pose on the seat cushion, hands at the wheel)
    t = Image.open(ROOT / G / 'machines/tractor_small.png').convert('RGBA')
    q = Image.open(ROOT / G / 'quest/tractor_side.png').convert('RGBA')
    q = q.resize((int(q.width * .54), int(q.height * .54)), Image.LANCZOS)
    c = Image.new('RGBA', (t.width, t.height + 200), (0, 0, 0, 0)); c.alpha_composite(t, (0, 200)); c.alpha_composite(q, (954, 213))
    c = c.crop(c.getbbox()); c = c.resize((c.width // 2, c.height // 2), Image.LANCZOS)
    c.save(OUT / 'quest_on_tractor.png'); info['sizes']['quest_on_tractor.png'] = list(c.size)
    (OUT / 'fonts').mkdir(exist_ok=True)
    for f in ('Anton-Regular.woff2', 'Inter-600.woff2', 'Inter-800.woff2'):
        shutil.copy2(ROOT / 'public/shared/fonts' / f, OUT / 'fonts' / f)
    (OUT / 'vendor').mkdir(exist_ok=True)
    shutil.copy2(HERE.parent / 'hyperframes_ep003/node_modules/gsap/dist/gsap.min.js', OUT / 'vendor/gsap.min.js')
    (OUT / 'art_info.json').write_text(json.dumps(info, indent=1))
    print('art staged:', len(list(OUT.glob('*'))), 'files')


# ------------------------------------------------------------------ audio
def load(path, ss=0.0):
    raw = subprocess.run([FF, '-v', 'error', '-ss', str(ss), '-i', str(path), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def active_rms_db(x, gate=-40):
    n = len(x) // 480
    r = np.sqrt((x[:n * 480].reshape(n, 480) ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(r); act = r[db > gate]
    return 20 * np.log10(np.sqrt((act ** 2).mean()) + 1e-12) if len(act) else -99


S = ROOT / 'public/shared/sfx'


def cues():
    """Dunkey-style restraint: few, dry cues that land ON the joke; the awkward hold after "expected." is dead silence over the bed (sfx_audit budget 18/min -> 6 in 22.6 s).
    (time, file, dB relative to the voice, length s or None, source offset s, why)."""
    T = seg.table()
    return [
        (T['l01.w8'] - .02, S / 'alarm.wav', -9, .5, 0.0, '"wake up": the alarm clock rattles on the headboard'),
        (T['l04.w1'] + .2, S / 'cc0/kenney_impact/impactPunch_heavy_000.ogg', -6, None, 0.0, 'the huge tractor slams down in the dealership lot'),
        (T['l11.w7'] - .1, S / 'cc0/rubberduck_100sfx2/sfx100v2_thunder_01.ogg', -8, 2.2, 0.0, '"enemy...": lightning over the golden field'),
        (T['l05.w2.end'] + .16, S / 'cc0/kenney/scratch_005.ogg', -4, None, 0.0, '"and then..." record scratch, freeze frame'),
        (seg.DUR - 1.0, S / 'alarm.wav', -5, .82, 1.1, 'loop seam: the alarm rings to the last frame (a later part of the take) -> "wake up"'),
    ]


BED = (S / 'cc0/thimras_park/park_ambience_wind.ogg', -20)   # critic v1: the card is never silent


def stage_audio():
    narr = load(ROOT / 'public/episodes/ep001_farming/audio/full/narration.wav')
    voice = np.zeros(round(seg.DUR * SR), np.float32)
    for a, b, at in seg.SEGMENTS:
        x = narr[round(a * SR):round(b * SR)].copy()
        f = round(.03 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        i0 = round(at * SR); voice[i0:i0 + len(x)] += x[:len(voice) - i0]
    v_db = active_rms_db(voice)
    sfx = np.zeros_like(voice); log, plan = [], []
    for at, f, rel, length, ss, why in cues():
        y = load(f, ss)
        if length:
            y = y[:round(length * SR)].copy(); fo = min(len(y), round(.1 * SR)); y[-fo:] *= np.linspace(1, 0, fo)
        g = 10 ** ((v_db + rel - active_rms_db(y)) / 20)
        i0 = max(0, round(at * SR)); n = min(len(y), len(sfx) - i0)
        sfx[i0:i0 + n] += y[:n] * g
        log.append(f'{at:6.2f}  {rel:+3d} dB  {f.relative_to(ROOT)}')
        plan.append({'t': round(at, 3), 'rel_db': rel, 'spec': str(f.relative_to(ROOT)), 'why': why})
    bf, brel = BED                                                        # outdoor air: the same level at DUR and 0 (seam)
    bed = load(bf); bed = np.tile(bed, int(np.ceil(len(voice) / len(bed))))[:len(voice)]
    sfx += bed * 10 ** ((v_db + brel - active_rms_db(bed)) / 20)
    plan.append({'t': 0.0, 'rel_db': brel, 'spec': str(bf.relative_to(ROOT)), 'why': 'outdoor air bed, also under the seam', 'bed': True})
    (OUT / 'sfx_plan.json').write_text(json.dumps(plan, indent=1))
    mix = voice + sfx
    n_end = round(int(seg.DUR * 30 - 3) / 30 * SR)                      # end on the last video frame, 20 ms fade: a clean loop restart
    mix = mix[:n_end]; f = round(.02 * SR); mix[-f:] *= np.linspace(1, 0, f)
    mix *= .9 / max(1e-6, float(np.abs(mix).max()))
    raw = OUT / '_mix_raw.wav'; write_wav(raw, mix)

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
