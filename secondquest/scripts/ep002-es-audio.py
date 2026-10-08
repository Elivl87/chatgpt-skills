#!/usr/bin/env python3
"""EP002 Spanish dub, step 3 (v3): the Spanish audio track for YouTube (multi-language audio), same length as the video.

  python3 scripts/ep002-es-audio.py       # -> audio/bram/ep002_es/EP002_audio_es.wav (+ .m4a) and a QC report

Each segment of schedule.json (cut from Bram's takes only inside pauses) goes on the video's timeline so that its speech
starts where the schedule says (narration time -> video time through blocks_map.json). v3, after the Producer heard an
echo from 1:30 and "fondo… y después muy cortado en los espacios" (2026-10-07):
  * tempo changes use the rubberband R3 engine (`rubberband --fine`), and only where the schedule asks (<= 1.075);
  * the takes are decoded once and sliced by sample, so two segments that were next to each other in the take and stay
    next to each other play back exactly as recorded (no fade, no seam);
  * every other join happens inside the pause: overlapping pause tails are crossfaded (equal power), and a pause made
    longer fades out and in over FADE instead of dropping to digital silence;
  * a soft gate (expander) lowers whatever sits under GATE_DB in every pause by GATE_RANGE, with a look-ahead and a
    slow release, so all pauses sound alike: the breath/air of Bram's own pauses and the extra silences match.
The episode's own sounds go back in exactly as mixed in English (cartridge click, Navi's entrance and 0.25 s fade in
seq 01, Navi's trail in block U), and the voice is matched to the English voice's loudness. As a check the same code
rebuilds the ENGLISH track from narration.wav and compares it with the video's own audio.
"""
import json, subprocess, sys, tempfile
from pathlib import Path
import numpy as np
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/bram/ep002_es'
FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 48000
VIDEO = ROOT / 'docs/ep002/EP002_animatic_full_v8_1440p.mp4'
S = json.loads((D / 'schedule.json').read_text())
M = json.loads((D / 'blocks_map.json').read_text())
CART = json.loads((D / 'sfx_cart.json').read_text())
CUES = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())['cues']
FADE, DELTA = .04, .03                       # fade at a lengthened pause; distance kept from speech
# lengthened pauses filled with Bram's own pause air instead of digital silence (Producer, 2026-10-08: after
# "técnicas." at 1:03 "el corte se escucha sin sonido"): (last line before, first line after)
ROOM_TONE = set()                            # v3.2 filled ('l21', 'l22'); Producer kept v3.1 (2026-10-08): "No quedó bien"
AIR_DB = -64                                 # dBFS before the voice gain: the level of Bram's gated natural pauses
GATE_DB, GATE_RANGE, LOOK, HOLD, ATT, REL = -40, -14, .03, .10, .005, .06
U_TRAIL = {'src': 'public/episodes/ep002/sfx/navi_original/NAVI_SFX_01.wav', 'narr_at': CUES['l156']['words'][5]['start'] + .5, 'vol': .14}


def load(path, start=None, dur=None):
    args = [FF, '-v', 'error']
    if start is not None:
        args += ['-ss', f'{start:.3f}']
    if dur is not None:
        args += ['-t', f'{dur:.3f}']
    args += ['-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, np.float32).copy()


def stretch(x, tempo):
    """Speed speech up by `tempo` with rubberband's R3 engine (pitch and timbre kept)."""
    if abs(tempo - 1) < 1e-4:
        return x
    with tempfile.TemporaryDirectory() as d:
        a, b = Path(d) / 'a.wav', Path(d) / 'b.wav'
        subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_f32le', str(a)], input=x.tobytes(), check=True)
        subprocess.run(['rubberband', '-q', '--fine', '-T', f'{tempo:.4f}', str(a), str(b)], check=True, capture_output=True)
        return load(b)


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


def ramp(n, up=True):
    """Equal-power fade curve of n samples."""
    c = np.sin(np.linspace(0, np.pi / 2, n, dtype=np.float32)) if n else np.zeros(0, np.float32)
    return c if up else c[::-1]


def room_tone(take, n, seed=0):
    """n samples of the take's own pause air: the steadiest 0.12 s pieces of its pauses (no speech, no loud breath),
    joined end to end with 40 ms equal-power crossfades, at the level of those pauses."""
    h = int(.005 * SR); k = len(take) // h
    e = 10 * np.log10((take[:k * h].reshape(k, h) ** 2).mean(1) + 1e-14)
    loud = np.percentile(e, 99)
    w = int(.12 / .005)
    cand = []
    for i in range(0, k - w, 4):
        q = e[i:i + w]
        if q.max() < loud - 35 and q.min() > loud - 75:              # pause air: no speech, no breath, not dead
            cand.append((float(q.std()), i * h))
    cand.sort()
    pieces = [take[i:i + w * h] for _, i in cand[:8]] or [np.zeros(w * h, np.float32)]
    xf = int(.04 * SR); out = np.zeros(n + w * h, np.float32); pos, j = 0, seed
    while pos < n:
        p = pieces[j % len(pieces)].copy(); j += 1
        if pos:
            p[:xf] *= ramp(xf); out[pos:pos + xf] *= ramp(xf, False)
        out[pos:pos + len(p)] += p; pos += len(p) - xf
    return out[:n]


def gate(x):
    """Soft expander: below GATE_DB (re. the voice's loud level) the gain eases down to GATE_RANGE, opening LOOK early."""
    h = int(.005 * SR); n = len(x) // h
    e = 10 * np.log10((x[:n * h].reshape(n, h) ** 2).mean(1) + 1e-14)
    e -= np.percentile(e[e > -100], 99)
    open_ = e > GATE_DB
    k1, k2 = int(LOOK / .005), int(HOLD / .005)
    o = open_.copy()
    for i in np.flatnonzero(open_):
        o[max(0, i - k1):i + k2 + 1] = True
    tgt = np.where(o, 1.0, 10 ** (GATE_RANGE / 20))
    g = np.empty(n); g[0] = tgt[0]
    a, r = 1 - np.exp(-.005 / ATT), 1 - np.exp(-.005 / REL)
    for i in range(1, n):
        g[i] = g[i - 1] + (tgt[i] - g[i - 1]) * (a if tgt[i] > g[i - 1] else r)
    gs = np.interp(np.arange(len(x)), np.arange(n) * h + h / 2, g).astype(np.float32)
    return x * gs, float(np.mean(~o))


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
    takes = {t: load(D / t) for t in {x['take'] for x in S}}
    clips, prev_core = [], -1e9
    for x in S:
        r = x['tempo']
        clip = stretch(takes[x['take']][int(round(x['start'] * SR)):int(round(x['end'] * SR))], r)
        on, off = (x['on'] - x['start']) / r, (x['off'] - x['start']) / r
        cs = max(to_video(x['cs']), prev_core + x['gmin'])          # block cuts in the video shift a few ms: never closer
        clips.append({'x': x, 'clip': clip, 'at': cs - on, 'cs': cs, 'ce': cs - on + off})
        prev_core = clips[-1]['ce']
    for i, c in enumerate(clips):                                   # each clip's window: never into a neighbour's speech
        lo = clips[i - 1]['ce'] + min(DELTA, c['x']['gmin'] / 2) if i else -1e9
        hi = clips[i + 1]['cs'] - min(DELTA, clips[i + 1]['x']['gmin'] / 2) if i + 1 < len(clips) else 1e9
        c['L'], c['R'] = max(c['at'], lo), min(c['at'] + len(c['clip']) / SR, hi)
    es = np.zeros(n, np.float32); airs = []
    report, joins = [], {'exact': 0, 'crossfade': 0, 'pause': 0}
    for i, c in enumerate(clips):
        x = c['x']
        a, b = int(round((c['L'] - c['at']) * SR)), int(round((c['R'] - c['at']) * SR))
        seg = c['clip'][a:b].copy()
        e10 = int(.01 * SR)
        lvl = lambda v: float(20 * np.log10(np.sqrt(np.mean(v.astype(np.float64) ** 2)) + 1e-9)) if len(v) else -180.0
        edge = [lvl(seg[:e10]), lvl(seg[-e10:])]                     # dBFS where the window starts/ends: must be pause
        for side, j in (('in', i - 1), ('out', i + 1)):
            if not 0 <= j < len(clips):
                k = min(len(seg) // 2, int(.01 * SR))
                if side == 'in':
                    seg[:k] *= ramp(k)
                else:
                    seg[-k:] *= ramp(k, False)
                continue
            p, q = (clips[j], c) if side == 'in' else (c, clips[j])
            exact = (p['x']['take'] == q['x']['take'] and abs(p['x']['end'] - q['x']['start']) < 1e-6 and p['x']['tempo'] == q['x']['tempo'] == 1.0
                     and abs(q['at'] - (p['at'] + len(p['clip']) / SR)) < 1.5 / SR)
            ov = p['R'] - q['L']
            k = 0 if exact else min(len(seg) // 2, int(round(ov * SR)) if ov > 1 / SR else int(FADE * SR))
            if side == 'in':
                joins['exact' if exact else 'crossfade' if ov > 1 / SR else 'pause'] += 1
                seg[:k] *= ramp(k)
            else:
                seg[len(seg) - k:] *= ramp(k, False)
        add(es, seg, c['L'])
        if i + 1 < len(clips) and (x['lines'][-1], clips[i + 1]['x']['lines'][0]) in ROOM_TONE:
            t0, t1 = c['R'] - FADE, clips[i + 1]['L'] + FADE            # overlaps both fades: no dip, no dead air
            k = int(round((t1 - t0) * SR)); f = int(FADE * SR)
            air = room_tone(takes[x['take']], k, seed=i)
            air *= 10 ** ((AIR_DB - 10 * np.log10(np.mean(air.astype(np.float64) ** 2) + 1e-14)) / 20)
            air[:f] *= ramp(f); air[-f:] *= ramp(f, False)
            airs.append((air, t0))
        report.append({'lines': x['lines'], 'at': round(c['cs'], 3), 'end': round(c['ce'], 3), 'L': round(c['L'], 3), 'R': round(c['R'], 3),
                       'edge_db': [round(v, 1) for v in edge], 'tempo': x['tempo'], 'lags': x['lags']})
    es, gated = gate(es)
    voice_level = rms_db(es)                                        # measured before the pause air goes in
    for air, t0 in airs:                                            # after the gate: it is pause, at a pause's level
        add(es, air, t0)
    gain = 10 ** ((rms_db(en) - voice_level) / 20)                   # Spanish Bram at the English Bram's level
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
    (D / 'QC.json').write_text(json.dumps({'en_rebuild_correlation': corr, 'joins': joins, 'gated_share': gated, 'voice_gain_db': float(20 * np.log10(gain)), 'peak': float(peak),
                                            'duration_s': n / SR, 'video_duration_s': n / SR, 'segments': report}, indent=1, ensure_ascii=False))
    print('joins', joins, f'· gate closed {gated:.0%} of the time')
    print(f'{wav.relative_to(ROOT)} · {n / SR:.2f} s (video {n / SR:.2f} s) · voice gain {20 * np.log10(gain):+.1f} dB · peak {peak:.2f}')


if __name__ == '__main__':
    main()
