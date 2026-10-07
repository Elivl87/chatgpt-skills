#!/usr/bin/env python3
"""EP002 Spanish dub, step 3: the Spanish audio track for YouTube (multi-language audio), same length as the video.

  python3 scripts/ep002-es-audio.py       # -> audio/bram/ep002_es/EP002_audio_es.wav (+ .m4a) and a QC report

Bram's Spanish lines (lines.json, cut from the takes) are placed on the video's timeline where their English lines
are (schedule.json, narration time -> video time through blocks_map.json: each block clip plays narration
[T0, T0 + clip length] from its own start in the video), sped up only where the schedule says (atempo, pitch kept).
The episode's own sounds go back in exactly as mixed in English: the cartridge click and Navi's entrance (seq 01,
with its 0.25 s fade at the cut) and Navi's trail in block U. The Spanish voice is matched to the English voice's
loudness. As a check the same code rebuilds the ENGLISH track from narration.wav and compares it with the video's
own audio: if the timeline mapping were off, that comparison would show it.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/bram/ep002_es'
FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 48000
VIDEO = ROOT / 'docs/ep002/EP002_animatic_full_v8_1440p.mp4'
L = json.loads((D / 'lines.json').read_text())
S = json.loads((D / 'schedule.json').read_text())
M = json.loads((D / 'blocks_map.json').read_text())
CART = json.loads((D / 'sfx_cart.json').read_text())
CUES = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())['cues']
U_TRAIL = {'src': 'public/episodes/ep002/sfx/navi_original/NAVI_SFX_01.wav', 'narr_at': CUES['l156']['words'][5]['start'] + .5, 'vol': .14}


def load(path, start=None, dur=None, tempo=1.0):
    args = [FF, '-v', 'error']
    if start is not None:
        args += ['-ss', f'{start:.3f}']
    if dur is not None:
        args += ['-t', f'{dur:.3f}']
    args += ['-i', str(path), '-ac', '1', '-ar', str(SR)]
    if abs(tempo - 1) > 1e-4:
        args += ['-af', f'atempo={tempo:.4f}']
    args += ['-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, np.float32).copy()


def to_video(narr_t):
    """Narration time -> video time, through the block whose window holds it."""
    b = next((b for b in M if b['T0'] - 1e-6 <= narr_t < b['T0'] + b['clip_dur']), M[-1] if narr_t >= M[-1]['T0'] else M[0])
    return b['video_start'] + (narr_t - b['T0'])


def add(track, clip, at):
    i = int(round(at * SR))
    if i < 0:
        clip, i = clip[-i:], 0
    n = min(len(clip), len(track) - i)
    if n > 0:
        track[i:i + n] += clip[:n]


def fades(x, ms=12):
    n = min(len(x) // 2, int(SR * ms / 1000))
    if n:
        r = np.linspace(0, 1, n, dtype=np.float32); x[:n] *= r; x[-n:] *= r[::-1]
    return x


def rms_db(x):
    x = x[np.abs(x) > 1e-4]
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


def sfx_track(n):
    t = np.zeros(n, np.float32)
    for e in CART['cartridge']:
        add(t, load(ROOT / e['src']) * e['vol'], e['at'])
    u = next(b for b in M if 'blockU' in b['script'])
    add(t, load(ROOT / U_TRAIL['src']) * U_TRAIL['vol'], u['video_start'] + U_TRAIL['narr_at'] - u['T0'])
    return t


def cart_fade(t):
    """Seq 01's mix fades out over its last 0.25 s (its own afade), voice and sounds alike."""
    a, b = int((CART['cart_T_END'] - .25) * SR), int(CART['cart_T_END'] * SR)
    t[a:b] *= np.linspace(1, 0, b - a, dtype=np.float32)


def main():
    vid = load(VIDEO)
    n = len(vid)
    # 1) the check: rebuild the English track the same way and compare with the video's audio
    narr = load(ROOT / 'public/episodes/ep002/audio/narration.wav')
    en = np.zeros(n, np.float32)
    for b in M:
        seg = narr[int(b['T0'] * SR):int((b['T0'] + b['clip_dur']) * SR)]
        add(en, seg, b['video_start'])
    sfx = sfx_track(n)
    en_full = en + sfx; cart_fade(en_full)
    def env(x, h=480):                                              # 10 ms loudness envelope (AAC shifts samples by a few ms)
        k = len(x) // h; return np.sqrt((x[:k * h].reshape(k, h) ** 2).mean(1))
    corr = float(np.corrcoef(env(vid), env(en_full[:n]))[0, 1])
    print(f'English rebuild vs the video: envelope correlation {corr:.4f}')
    if corr < .95:                                                  # measured 0.96: AAC priming drifts the video ~20 ms by the end
        sys.exit('timeline mapping is off: not building the Spanish track')
    # 2) the Spanish voice on the same timeline
    es = np.zeros(n, np.float32)
    report = []
    for lid, s in S.items():
        l = L[lid]
        clip = fades(load(D / l['take'], l['start'], l['end'] - l['start'], s['tempo']))
        at = to_video(s['at'])
        add(es, clip, at)
        report.append((lid, round(float(at), 2), s['tempo'], s['lag']))
    gain = 10 ** ((rms_db(en) - rms_db(es)) / 20)                   # Spanish Bram at the English Bram's level
    es *= gain
    out = es + sfx; cart_fade(out)
    peak = float(np.max(np.abs(out)))
    if peak > .98:
        out *= .98 / peak
    wav = D / 'EP002_audio_es.wav'
    pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
    subprocess.run([FF, '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-ac', '2', str(wav)], input=pcm.tobytes(), check=True)
    subprocess.run([FF, '-v', 'error', '-y', '-i', str(wav), '-c:a', 'aac', '-b:a', '256k', str(D / 'EP002_audio_es.m4a')], check=True)
    # 3) a preview: the video with the Spanish track
    prev = ROOT / 'docs/ep002/EP002_preview_es_480p.mp4'
    subprocess.run([FF, '-v', 'error', '-y', '-i', str(VIDEO), '-i', str(wav), '-map', '0:v', '-map', '1:a', '-vf', 'scale=854:480',
                    '-c:v', 'libx264', '-crf', '30', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '128k', '-shortest', str(prev)], check=True)
    (D / 'QC.json').write_text(json.dumps({'en_rebuild_correlation': corr, 'voice_gain_db': float(20 * np.log10(gain)), 'peak': float(peak),
                                            'duration_s': n / SR, 'video_duration_s': n / SR, 'lines': report}, indent=1))
    print(f'{wav.relative_to(ROOT)} · {n / SR:.2f} s (video {n / SR:.2f} s) · voice gain {20 * np.log10(gain):+.1f} dB · peak {peak:.2f}')


if __name__ == '__main__':
    main()
