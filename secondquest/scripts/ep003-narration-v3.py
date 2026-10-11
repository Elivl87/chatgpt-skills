#!/usr/bin/env python3
"""EP003 placeholder narration v3 — MOSS-TTS-Nano + Bram reference (INTERNAL placeholder only, never published),
"perfected" for natural flow (Producer, 2026-10-12: "llevarlo al top de top... natural, fluido, con las pausas donde
debe, con el tono perfecto a Bram").

What changed vs v2 (scripts/ep003-moss-narration.py):
1. Sentence by sentence: every line is split at . ? ! and at a mid-line "..."; each sentence is generated on its own,
   so the pause between sentences is ours, measured on Bram, not the model's.
2. Pauses measured on Bram's EP002 read (episodes/ep002/timings.json): sentence end 0.48 s, question 0.52 s, mid-line
   "..." 0.45 s, line end 0.46 s (a line ending in "..." flows on: 0.25 s); a few ms of deterministic jitter so it never
   sounds metronomic; the hook's "So, why?" keeps its 1.5 s (wordmark rule).
3. Best of 5 takes per sentence: a take must transcribe exactly (faster-whisper); among the correct ones, the score
   prefers Bram's speaking rate (179 wpm while speaking), Bram's pitch movement (IQR ~78 Hz), his timbre (MFCC distance)
   and no edge clicks.
4. Even level: every sentence is levelled to the same loudness before the gentle EQ toward Bram (no compression
   pumping), soft 8 ms fades at every edit.

  python3 scripts/ep003-narration-v3.py <moss dir: mossrepo/ + mossenv/ + moss_gen.py>
Out: public/episodes/ep003/audio/narration.wav + episodes/ep003/timings.json (v2 kept as narration_v2.wav/timings_v2.json).
"""
import difflib, json, re, shutil, subprocess, sys
from pathlib import Path
import numpy as np, soundfile, scipy.signal as ss

ROOT = Path(__file__).resolve().parents[1]
EP = ROOT / 'episodes/ep003'
BRAM = ROOT / 'public/episodes/ep002/audio/narration.wav'
REF_AT, REF_LEN = 102.94, 17.5
SEEDS = (7, 11, 23, 42, 77)
SR = 48000
LEAD = 0.3
HOOK_END = 'l07'
GAP = {'.': .48, '?': .52, '!': .48, '...': .45}
LINE_GAP, LINE_FLOW = .46, .25
TARGET_WPM, TARGET_IQR = 179, 78
FF = __import__('imageio_ffmpeg').get_ffmpeg_exe()


def split_sentences(text):
    parts = re.split(r'(?:(?<=[.?!]["”])|(?<=[.?!]))\s+(?=["“]?[A-Z])|(?<=\.\.\.)\s+(?=[a-z])', text)
    return [p.strip() for p in parts if p.strip()]


def end_mark(s):
    s = s.rstrip('"”')
    return '...' if s.endswith('...') else (s[-1] if s and s[-1] in '.?!' else '.')


def norm(s):
    s = s.lower().replace('$8', 'eight dollars').replace('200,000', 'two hundred thousand').replace('10 million', 'ten million')
    s = re.sub(r'\b1\b', 'one', s); s = re.sub(r'\b3\b', 'three', s); s = re.sub(r'\b2\b', 'two', s)
    return re.sub(r'[^a-z0-9 ]', ' ', s.replace('-', ' ').replace("'", '')).split()


def errors(target, heard):
    sm = difflib.SequenceMatcher(None, norm(target), norm(heard))
    return sum(max(b - a, d - c) for op, a, b, c, d in sm.get_opcodes() if op != 'equal')


def load(path, ss_=None, t=None, sr=SR):
    a = [FF, '-v', 'error'] + (['-ss', str(ss_), '-t', str(t)] if ss_ is not None else []) + ['-i', str(path), '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(a, capture_output=True, check=True).stdout, np.float32).copy()


def trim(a, thr=.012):
    loud = np.where(np.abs(a) > thr)[0]
    if not len(loud):
        return a
    return a[max(0, loud[0] - int(.02 * SR)): loud[-1] + int(.05 * SR)]


def f0_iqr(x, sr=SR):
    h, w = int(.01 * sr), int(.04 * sr); f = []
    for i in range(0, len(x) - w, h):
        fr = x[i:i + w] * np.hanning(w)
        if np.sqrt(np.mean(fr ** 2)) < .02 * (np.abs(x).max() + 1e-9):
            continue
        ac = np.correlate(fr, fr, 'full')[w - 1:]; lo, hi = int(sr / 300), int(sr / 60)
        k = lo + np.argmax(ac[lo:hi])
        if ac[k] > .4 * ac[0]:
            f.append(sr / k)
    return float(np.subtract(*np.percentile(f, [75, 25]))) if len(f) > 10 else 0.0


def mfcc_vec(x, sr=SR):
    from scipy.fft import dct
    _, _, Z = ss.stft(x, sr, nperseg=2048, noverlap=1536); P = np.abs(Z) ** 2
    f = np.linspace(0, sr / 2, P.shape[0]); m = lambda v: 2595 * np.log10(1 + v / 700); im = lambda y: 700 * (10 ** (y / 2595) - 1)
    pts = im(np.linspace(m(60), m(7600), 42)); fb = np.zeros((40, len(f)))
    for i in range(40):
        l, c, r = pts[i:i + 3]; fb[i] = np.clip(np.minimum((f - l) / (c - l), (r - f) / (r - c)), 0, None)
    e = P.sum(0); v = e > np.percentile(e, 40)
    C = dct(np.log(fb @ P[:, v] + 1e-10), axis=0, norm='ortho')[1:14]
    return np.concatenate([C.mean(1), C.std(1)])


def eq_to(a, ref, max_db=4):
    f, pa = ss.welch(a, SR, nperseg=4096); _, pb = ss.welch(ref, SR, nperseg=4096)
    g = 10 * np.log10((pb + 1e-12) / (pa + 1e-12)); g = np.convolve(g, np.ones(25) / 25, 'same')
    g = np.clip(g - np.median(g[(f > 200) & (f < 4000)]), -max_db, max_db); g[f < 60] = -12
    return ss.fftconvolve(a, ss.firwin2(2049, f / (SR / 2), 10 ** (g / 20)), 'same').astype(np.float32)


def fades(a, ms=8):
    n = int(ms / 1000 * SR); a = a.copy()
    if len(a) > 2 * n:
        a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n)
    return a


def main():
    md = Path(sys.argv[1])
    lines = json.loads((EP / 'script.json').read_text())['lines']
    work = md / 'ep003_sent_v3'; work.mkdir(exist_ok=True)
    ref = work / 'bram_ref.wav'
    soundfile.write(str(ref), load(BRAM, REF_AT, REF_LEN), SR)
    sents = []                                                          # (line id, index, text)
    for l in lines:
        for i, s in enumerate(split_sentences(l['text'])):
            sents.append((l['id'], i, s))
    print('sentences', len(sents), flush=True)
    jobs = [{'text': s, 'ref': str(ref), 'out': str(work / f'{lid}_{i}_s{seed}.wav'), 'seed': seed}
            for seed in SEEDS for lid, i, s in sents]
    (work / 'jobs.json').write_text(json.dumps(jobs))
    subprocess.run([str(md / 'mossenv/bin/python'), str(md / 'moss_gen.py'), str(work / 'jobs.json')], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    from faster_whisper import WhisperModel
    stt = WhisperModel('small.en', compute_type='int8')
    bram = load(BRAM, 150, 120)
    B = mfcc_vec(bram)
    pick = {}
    for lid, i, s in sents:
        best = None
        for seed in SEEDS:
            p = work / f'{lid}_{i}_s{seed}.wav'
            if not p.exists():
                continue
            a = trim(load(p))
            segs, _ = stt.transcribe(str(p), language='en', beam_size=5)
            heard = ' '.join(x.text.strip() for x in segs)
            e = errors(s, heard)
            dur = len(a) / SR; wpm = len(s.split()) / max(dur, .3) * 60
            iqr = f0_iqr(a) if dur > .8 else TARGET_IQR
            tim = float(np.linalg.norm(mfcc_vec(a) - B)) if dur > .8 else 3.0
            click = float(np.abs(np.diff(a[:200])).max() + np.abs(np.diff(a[-200:])).max())
            score = e * 10 + abs(wpm - TARGET_WPM) / 25 + abs(iqr - TARGET_IQR) / 30 + tim / 3 + click * 2
            if best is None or score < best[0]:
                best = (score, a, e, heard, seed, round(wpm), round(iqr))
        pick[(lid, i)] = best
        print(lid, i, 'err', best[2], 'wpm', best[5], 'iqr', best[6], 'seed', best[4], flush=True)
    levels = [np.sqrt(np.mean(b[1][np.abs(b[1]) > .01] ** 2)) for b in pick.values()]
    target = float(np.median(levels))
    rng = np.random.default_rng(3)
    parts, cues, t = [np.zeros(int(LEAD * SR), np.float32)], {}, LEAD
    for li, l in enumerate(lines):
        ss_ = [(i, s) for (lid, i, s) in sents if lid == l['id']]
        start = t; words = []
        for k, (i, s) in enumerate(ss_):
            a = pick[(l['id'], i)][1]
            lv = np.sqrt(np.mean(a[np.abs(a) > .01] ** 2)) + 1e-9
            a = fades(a * min(2.0, target / lv))
            parts.append(a); t += len(a) / SR
            if k < len(ss_) - 1:
                g = GAP.get(end_mark(s), .48) + rng.uniform(-.04, .04)
                parts.append(np.zeros(int(g * SR), np.float32)); t += g
        cues[l['id']] = {'start': round(start, 3), 'end': round(t, 3), 'text': l['text'],
                         'takes': [int(pick[(l['id'], i)][4]) for i, _ in ss_], 'stt_errors': int(sum(pick[(l['id'], i)][2] for i, _ in ss_))}
        if li < len(lines) - 1:
            g = 1.5 if l['id'] == HOOK_END else (LINE_FLOW if end_mark(ss_[-1][1]) == '...' else LINE_GAP + rng.uniform(-.05, .06))
            parts.append(np.zeros(int(g * SR), np.float32)); t += g
    y = np.concatenate(parts + [np.zeros(int(.6 * SR), np.float32)])
    y = eq_to(y, bram)
    r = np.sqrt(np.mean(bram[np.abs(bram) > .01] ** 2)); s_ = np.sqrt(np.mean(y[np.abs(y) > .01] ** 2))
    y = np.clip(y * r / s_, -.98, .98)
    out = ROOT / 'public/episodes/ep003/audio/narration.wav'
    if out.exists() and not (out.parent / 'narration_v2.wav').exists():
        shutil.copy(out, out.parent / 'narration_v2.wav'); shutil.copy(EP / 'timings.json', EP / 'timings_v2.json')
    soundfile.write(str(out), y, SR, subtype='PCM_16')
    segs, _ = stt.transcribe(str(out), language='en', word_timestamps=True, beam_size=5)
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
    tm = {'source': 'audio/narration.wav',
          'generatedBy': 'PLACEHOLDER (internal only) v3: moss-tts-nano-onnx + Bram reference, sentence-level best-of-5, Bram-measured pauses (scripts/ep003-narration-v3.py)',
          'alignment': 'cue start/end from assembly; faster-whisper word timestamps mapped onto script words',
          'hook_end': {'line': HOOK_END, 'silence_after': 1.5}, 'duration': round(len(y) / SR, 2), 'cues': cues}
    (EP / 'timings.json').write_text(json.dumps(tm, indent=2, ensure_ascii=False))
    bad = {k: c['stt_errors'] for k, c in cues.items() if c['stt_errors']}
    print('duration', tm['duration'], 'lines with STT differences', bad)


if __name__ == '__main__':
    main()
