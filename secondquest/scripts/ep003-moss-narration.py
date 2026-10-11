#!/usr/bin/env python3
"""EP003 placeholder narration, MOSS-TTS-Nano with a Bram reference (INTERNAL placeholder only: never published, never
in a delivery; docs/ep003/PRODUCER_DECISIONS.md, 2026-10-11).

Reference: Bram, EP002 narration 102.94 s + 17.5 s ("On paper, the job sounds easy..."), picked over 3 other windows
(timbre 2.28 vs 2.8-5.2, pitch movement 78 Hz vs Bram 80, 0 word errors; docs/ep003/voice_test/v5_moss_bram_ref/).
Each line is generated alone, checked with faster-whisper and regenerated with another seed (up to 4 tries) when a
word is wrong; the take with the fewest errors wins. Then pauses as in Bram's reads, a gentle long-term EQ toward Bram,
his loudness, and timings.json (cue start/end from the assembly, word times from faster-whisper).

  python3 scripts/ep003-moss-narration.py <moss dir: mossrepo/ + mossenv/ + moss_gen.py> [--locale es]
"""
import difflib, json, re, subprocess, sys
from pathlib import Path
import numpy as np, soundfile, scipy.signal as ss

ROOT = Path(__file__).resolve().parents[1]
EP = ROOT / 'episodes/ep003'
BRAM = ROOT / 'public/episodes/ep002/audio/narration.wav'
REF_AT, REF_LEN = 102.94, 17.5
REF_TEXT = ''
SEEDS = (7, 11, 23, 42)
SR = 48000
LEAD = 0.3
FF = __import__('imageio_ffmpeg').get_ffmpeg_exe()


HOOK_END = 'l07'          # the hook's "Why?": the wordmark lands on it, then 1.5 s of silence (Producer rule)


def pause_after(text, nxt, lid=None):
    if lid == HOOK_END:
        return 1.5
    p = 0.45
    if text.endswith('?') or len(text.split()) <= 2 or (nxt and len(nxt.split()) <= 2):
        p = 0.8
    if text.endswith('...'):
        p = 0.6
    return p


NUM = {'eight': '8', 'two hundred thousand': '200000', 'ten million': '10 million', 'one': '1', 'three': '3', 'two': '2'}


def norm(s):
    s = s.lower().replace('$8', 'eight dollars').replace('200,000', 'two hundred thousand').replace('10 million', 'ten million')
    s = re.sub(r'\b1\b', 'one', s); s = re.sub(r'\b3\b', 'three', s); s = re.sub(r'\b2\b', 'two', s)
    return re.sub(r'[^a-záéíóúñü0-9 ]', ' ', s.replace('-', ' ')).split()


def errors(target, heard):
    sm = difflib.SequenceMatcher(None, norm(target), norm(heard))
    return sum(max(b - a, d - c) for op, a, b, c, d in sm.get_opcodes() if op != 'equal')


def load(path, ss_=None, t=None, sr=SR):
    a = [FF, '-v', 'error'] + (['-ss', str(ss_), '-t', str(t)] if ss_ is not None else []) + ['-i', str(path), '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(a, capture_output=True, check=True).stdout, np.float32).copy()


def eq_to(a, ref, sr=SR, max_db=4):
    f, pa = ss.welch(a, sr, nperseg=4096); _, pb = ss.welch(ref, sr, nperseg=4096)
    g = 10 * np.log10((pb + 1e-12) / (pa + 1e-12))
    g = np.convolve(g, np.ones(25) / 25, 'same')
    g = np.clip(g - np.median(g[(f > 200) & (f < 4000)]), -max_db, max_db)
    g[f < 60] = -12
    return ss.fftconvolve(a, ss.firwin2(2049, f / (sr / 2), 10 ** (g / 20)), 'same').astype(np.float32)


def main():
    md = Path(sys.argv[1]); es = '--locale' in sys.argv and sys.argv[sys.argv.index('--locale') + 1] == 'es'
    engine = sys.argv[sys.argv.index('--engine') + 1] if '--engine' in sys.argv else 'moss'   # moss | vox (VoxCPM 1.5)
    sfx = '.es' if es else ''
    lines = json.loads((EP / f'script{sfx}.json').read_text())['lines']
    work = md / f'ep003_lines{sfx}{"_vox" if engine == "vox" else ""}'; work.mkdir(exist_ok=True)
    ref = work / 'bram_ref.wav'
    cues2 = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())['cues']
    global REF_TEXT
    REF_TEXT = ' '.join(w['w'] for c in cues2.values() for w in c['words'] if REF_AT <= w['start'] and w['end'] <= REF_AT + REF_LEN)
    soundfile.write(str(ref), load(BRAM, REF_AT, REF_LEN), SR)
    from faster_whisper import WhisperModel
    stt = WhisperModel('small' if es else 'small.en', compute_type='int8')
    best = {}
    for seed in SEEDS:
        todo = [l for l in lines if l['id'] not in best or best[l['id']][0] > 0]
        if not todo:
            break
        jobs = [{'text': l['text'], 'ref': str(ref), 'ref_text': REF_TEXT, 'out': str(work / f"{l['id']}_s{seed}.wav"), 'seed': seed} for l in todo]
        (work / 'jobs.json').write_text(json.dumps(jobs))
        subprocess.run([str(md / 'mossenv/bin/python'), str(md / ('vox_gen.py' if engine == 'vox' else 'moss_gen.py')), str(work / 'jobs.json')],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for l in todo:
            p = work / f"{l['id']}_s{seed}.wav"
            segs, _ = stt.transcribe(str(p), language='es' if es else 'en', beam_size=5)
            heard = ' '.join(s.text.strip() for s in segs)
            e = errors(l['text'], heard)
            if l['id'] not in best or e < best[l['id']][0]:
                best[l['id']] = (e, str(p), heard)
        print(f'seed {seed}: lines with errors {sum(1 for v in best.values() if v[0] > 0)}', flush=True)
    parts, cues, t = [np.zeros(int(LEAD * SR), np.float32)], {}, LEAD
    for i, l in enumerate(lines):
        e, p, heard = best[l['id']]
        a = load(p)
        loud = np.where(np.abs(a) > 0.01)[0]
        a = a[max(0, loud[0] - int(.03 * SR)): loud[-1] + int(.06 * SR)]
        nxt = lines[i + 1]['text'] if i + 1 < len(lines) else None
        gap = pause_after(l['text'], nxt, l['id'])
        cues[l['id']] = {'start': round(t, 3), 'end': round(t + len(a) / SR, 3), 'text': l['text'], 'take': Path(p).name,
                         'stt_errors': e, 'heard': heard}
        parts += [a, np.zeros(int(gap * SR), np.float32)]
        t += len(a) / SR + gap
    y = np.concatenate(parts + [np.zeros(int(.6 * SR), np.float32)])
    bram = load(BRAM, 150, 120)
    y = eq_to(y, bram)
    r = np.sqrt(np.mean(bram[np.abs(bram) > .01] ** 2)); s = np.sqrt(np.mean(y[np.abs(y) > .01] ** 2))
    y = np.clip(y * r / s, -0.98, 0.98)
    out = ROOT / f'public/episodes/ep003/audio/{"es/" if es else ""}narration{"_vox" if engine == "vox" else ""}.wav'
    out.parent.mkdir(parents=True, exist_ok=True)
    soundfile.write(str(out), y, SR, subtype='PCM_16')
    segs, _ = stt.transcribe(str(out), language='es' if es else 'en', word_timestamps=True, beam_size=5)
    ww = [w for s_ in segs for w in s_.words]
    for c in cues.values():
        inside = [w for w in ww if c['start'] - .15 <= (w.start + w.end) / 2 <= c['end'] + .15]
        toks = c['text'].split(); words = []
        for j, tok in enumerate(toks):
            if inside:
                w = inside[j] if len(inside) == len(toks) else inside[min(len(inside) - 1, int(j * len(inside) / len(toks)))]
                st, en = max(c['start'], w.start), min(c['end'], w.end)
            else:
                st = c['start'] + (c['end'] - c['start']) * j / len(toks); en = st + (c['end'] - c['start']) / len(toks)
            words.append({'w': tok, 'start': round(st, 2), 'end': round(max(en, st + .05), 2)})
        c['words'] = words
    tm = {'source': f'audio/{"es/" if es else ""}narration.wav',
          'generatedBy': f'PLACEHOLDER (internal only) {"VoxCPM1.5 (Apache-2.0)" if engine == "vox" else "moss-tts-nano-onnx"} + Bram reference EP002 {REF_AT}s+{REF_LEN}s (scripts/ep003-moss-narration.py)',
          'alignment': 'cue start/end from assembly; faster-whisper word timestamps mapped onto script words',
          'duration': round(len(y) / SR, 2), 'cues': cues}
    (EP / f'timings{sfx}{"_vox" if engine == "vox" else ""}.json').write_text(json.dumps(tm, indent=2, ensure_ascii=False))
    bad = {k: (c['stt_errors'], c['heard']) for k, c in cues.items() if c['stt_errors']}
    print('duration', tm['duration'], 'lines still with STT differences:', json.dumps(bad, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
