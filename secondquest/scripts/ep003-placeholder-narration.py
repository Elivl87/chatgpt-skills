#!/usr/bin/env python3
"""EP003 placeholder narration (free, Kokoro) and timings.json, so the animatic is built on real timing before Bram.

Voice = the Producer's choice of 2026-10-11 (docs/ep003/PRODUCER_DECISIONS.md, sample 3): Kokoro am_fenrir at 0.94,
long-term EQ matched toward Bram's EP002 narration, then +1 semitone (rubberband R3, time unchanged so timings hold).

  python3 scripts/ep003-placeholder-narration.py <kokoro dir with kokoro-v1.0.int8.onnx + voices-v1.0.bin>

Out: public/episodes/ep003/audio/narration.wav (48 kHz mono 16-bit, PLACEHOLDER), episodes/ep003/timings.json
(cue start/end from the assembly, word times from faster-whisper mapped onto the script's own words).
"""
import json, re, subprocess, sys, tempfile
from pathlib import Path
import numpy as np, soundfile, scipy.signal as ss
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
EP = ROOT / 'episodes/ep003'
OUT = ROOT / 'public/episodes/ep003/audio/narration.wav'
SR = 24000
VOICE, SPEED, PITCH = 'am_fenrir', 0.94, 1
LEAD = 0.3


def pause_after(text, nxt):
    """Pauses shaped like Bram's reads: a beat after a sentence, longer after a question or a one/two-word line."""
    p = 0.45
    if text.endswith('?') or len(text.split()) <= 2 or (nxt and len(nxt.split()) <= 2):
        p = 0.8
    if text.endswith('...'):
        p = 0.6
    return p


def ltas(x):
    return ss.welch(x, SR, nperseg=2048)


def eq_to(a, ref):
    """Smooth long-term spectrum match toward the reference (clamped +-6 dB, rumble cut): timbre only, no dynamics."""
    f, pa = ltas(a); _, pb = ltas(ref)
    g = 10 * np.log10((pb + 1e-12) / (pa + 1e-12))
    g = np.convolve(g, np.ones(15) / 15, 'same')
    g = np.clip(g - np.median(g[(f > 200) & (f < 4000)]), -6, 6)
    g[f < 70] = -12
    return ss.fftconvolve(a, ss.firwin2(1025, f / (SR / 2), 10 ** (g / 20)), 'same').astype(np.float32)


def main():
    kd = Path(sys.argv[1])
    lines = json.loads((EP / 'script.json').read_text())['lines']
    k = Kokoro(str(kd / 'kokoro-v1.0.int8.onnx'), str(kd / 'voices-v1.0.bin'))
    parts, cues, t = [np.zeros(int(LEAD * SR), np.float32)], {}, LEAD
    for i, ln in enumerate(lines):
        a, sr = k.create(ln['text'], voice=VOICE, speed=SPEED, lang='en-us')
        a = np.asarray(a, np.float32)
        if sr != SR:
            a = ss.resample_poly(a, SR, sr).astype(np.float32)
        loud = np.where(np.abs(a) > 0.01)[0]
        a = a[max(0, loud[0] - int(.03 * SR)): loud[-1] + int(.05 * SR)]
        nxt = lines[i + 1]['text'] if i + 1 < len(lines) else None
        gap = pause_after(ln['text'], nxt)
        cues[ln['id']] = {'start': round(t, 3), 'end': round(t + len(a) / SR, 3), 'text': ln['text']}
        parts += [a, np.zeros(int(gap * SR), np.float32)]
        t += len(a) / SR + gap
        print(f"{ln['id']} {cues[ln['id']]['start']:7.2f} {ln['text'][:60]}", flush=True)
    x = np.concatenate(parts + [np.zeros(int(.6 * SR), np.float32)])
    ff = __import__('imageio_ffmpeg').get_ffmpeg_exe()
    ref = np.frombuffer(subprocess.run([ff, '-v', 'error', '-ss', '29.26', '-t', '19.6', '-i',
                        str(ROOT / 'public/episodes/ep002/audio/narration.wav'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                        capture_output=True, check=True).stdout, np.float32)
    x = eq_to(x, ref)
    with tempfile.TemporaryDirectory() as td:
        soundfile.write(f'{td}/a.wav', x, SR)
        subprocess.run(['rubberband', '-q', '--fine', '-p', str(PITCH), f'{td}/a.wav', f'{td}/b.wav'], check=True)
        y, _ = soundfile.read(f'{td}/b.wav', dtype='float32')
    y = ss.resample_poly(y, 2, 1).astype(np.float32)                         # 48 kHz like Bram's tracks
    r = np.sqrt(np.mean(ref[np.abs(ref) > .01] ** 2)); s = np.sqrt(np.mean(y[np.abs(y) > .01] ** 2))
    y = np.clip(y * r / s, -0.98, 0.98)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    soundfile.write(str(OUT), y, 48000, subtype='PCM_16')

    from faster_whisper import WhisperModel
    m = WhisperModel('small.en', compute_type='int8')
    segs, _ = m.transcribe(str(OUT), language='en', word_timestamps=True, beam_size=5)
    ww = [w for s_ in segs for w in s_.words]
    for cid, c in cues.items():
        inside = [w for w in ww if c['start'] - .15 <= (w.start + w.end) / 2 <= c['end'] + .15]
        toks = c['text'].split()
        words = []
        for j, tok in enumerate(toks):
            if inside:
                w = inside[min(len(inside) - 1, int(j * len(inside) / len(toks)))] if len(inside) != len(toks) else inside[j]
                st, en = max(c['start'], w.start), min(c['end'], w.end)
            else:
                st = c['start'] + (c['end'] - c['start']) * j / len(toks); en = st + (c['end'] - c['start']) / len(toks)
            words.append({'w': tok, 'start': round(st, 2), 'end': round(max(en, st + .05), 2)})
        c['words'] = words
        c['heard'] = ' '.join(w.word.strip() for w in inside)
    tm = {'source': 'audio/narration.wav',
          'generatedBy': f'PLACEHOLDER kokoro:{VOICE}@{SPEED} + EQ->Bram + pitch +{PITCH} st (scripts/ep003-placeholder-narration.py)',
          'alignment': 'cue start/end from assembly; faster-whisper small.en word timestamps mapped onto script words',
          'duration': round(len(y) / 48000, 2), 'cues': cues}
    (EP / 'timings.json').write_text(json.dumps(tm, indent=2, ensure_ascii=False))
    print('duration', tm['duration'])


if __name__ == '__main__':
    main()
