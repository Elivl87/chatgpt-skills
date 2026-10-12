#!/usr/bin/env python3
"""EP003 placeholder narration v4 — VoiceStudio's default engine (k2-fsa/OmniVoice) cloned from the Bram reference.
INTERNAL PLACEHOLDER ONLY: a cloned Bram voice never goes into any published video, Short or delivery (Bram's real voice
is licensed through a paid platform). OmniVoice weights are CC-BY-NC (non-commercial) — fine for an internal review cut,
never for publication.

Same method as v3 (scripts/ep003-narration-v3.py), only the engine changes:
1. Same sentence split (. ? ! and a mid-line "..."); each sentence generated on its own; the pauses are ours, measured
   on Bram's EP002 read: sentence end 0.48 s, question 0.52 s, mid-line "..." 0.45 s, line end 0.46 s (0.25 s after a
   line ending in "..."), a few ms of deterministic jitter; the hook's "So, why?" keeps its 1.5 s (wordmark rule).
2. Best of N takes per sentence. A take must transcribe exactly (faster-whisper small.en); among the correct ones the
   score prefers predicted naturalness (UTMOS22, VoiceStudio's bundled evaluator), Bram's speaking rate, his pitch
   movement and his timbre (MFCC distance), and no edge clicks.
3. Even level per sentence, gentle EQ toward Bram, 8 ms fades at every edit (as v3).
4. Word timings: faster-whisper word timestamps ALIGNED (difflib) to the script tokens, so every script.json token gets
   exactly one entry even when Whisper splits or merges words (fixes "Friendslop" -> "Friend slop" shifting l36).

  python3 scripts/ep003-narration-v4.py <voicestudio dir: vsenv/ + vs_repo/ + ovtools/omni_gen.py + ovtools/utmos_score.py>
Needs the pinned k2-fsa/OmniVoice snapshot (revision c5fdb5cc…) at OV_MODEL (default /dev/shm/hf/...) and the UTMOS
checkpoint at /dev/shm/evalm/utmos.pt.
Out: public/episodes/ep003/audio/narration.wav + episodes/ep003/timings.json (v3 kept as narration_v3.wav/timings_v3.json).
"""
import difflib, importlib.util, json, os, re, shutil, subprocess, sys
from pathlib import Path
import numpy as np, soundfile

ROOT = Path(__file__).resolve().parents[1]
EP = ROOT / 'episodes/ep003'
_spec = importlib.util.spec_from_file_location('v3', ROOT / 'scripts/ep003-narration-v3.py')
v3 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(v3)
split_sentences, end_mark, errors, load, _trim_v3, f0_iqr, mfcc_vec, eq_to, fades = (
    v3.split_sentences, v3.end_mark, v3.errors, v3.load, v3.trim, v3.f0_iqr, v3.mfcc_vec, v3.eq_to, v3.fades)
BRAM, SR, LEAD, HOOK_END = v3.BRAM, v3.SR, v3.LEAD, v3.HOOK_END
GAP, LINE_GAP, LINE_FLOW = v3.GAP, v3.LINE_GAP, v3.LINE_FLOW
TARGET_WPM, TARGET_IQR = v3.TARGET_WPM, v3.TARGET_IQR

# Bram reference: EP002 102.94 s, "On paper, the job sounds easy. ... Because better is measurable." (10.75 s;
# OmniVoice takes <= 20 s with a transcript, 3-10 s is its sweet spot; a shorter clip also halves CPU time).
REF_AT, REF_LEN = 102.94, 10.75
REF_TEXT = ('On paper, the job sounds easy. Take something beloved... and make everything better. '
            'Except that is where remakes become dangerous. Because better is measurable.')
SEEDS = tuple(int(s) for s in os.environ.get('V4_SEEDS', '7,11').split(','))
REPAIR_SEEDS = (23, 42, 77)
SMOKE = bool(os.environ.get('V4_SMOKE'))                 # extra takes only for sentences whose takes all fail the STT check
GEN = {'num_step': int(os.environ.get('V4_STEPS', '32')), 'guidance_scale': 2.0, 't_shift': 0.1,
       'position_temperature': 5.0, 'class_temperature': 0.0}


FS = re.compile(r'(?i)friend[\s-]?slop')


def trim(a, rel_db=32, pre=.04, post=.06):
    """Cut OmniVoice's faint lead-in blip (~-45 dB, then silence) and tails: keep from the first to the last 10 ms
    frame within rel_db of the loudest one, with a short pre/post roll."""
    h = int(.01 * SR); n = len(a) // h
    if n < 3:
        return _trim_v3(a)
    db = 10 * np.log10(np.mean(a[:n * h].reshape(n, h) ** 2, 1) + 1e-12)
    on = np.where(db > db.max() - rel_db)[0]
    return a[max(0, on[0] * h - int(pre * SR)): min(len(a), (on[-1] + 1) * h + int(post * SR))]


def target_duration(s):
    """OmniVoice's rule-based duration rushes short sentences (230-290 wpm vs Bram's 160-210, A/B 2026-10-12):
    short sentences get Bram's pace (175 wpm + 0.2 s, + 0.15 s per comma; floor by letters so one-word lines are not
    stretched), "So, why?" gets room for Bram's EP002 delivery, longer ones keep the model's own estimate."""
    w = len(s.split())
    if s.strip() == 'So, why?':                 # room for Bram's "So, ... why?" (1.25 s with a 0.3 s breath; A/B 2026-10-12)
        return 1.8
    if w > 12:
        return None
    letters = sum(ch.isalpha() for ch in s)
    return round(max(.6, w * 60 / 175 + .2 + .15 * s.count(','), .055 * letters + .1) + (.25 if s.rstrip().endswith('...') else 0), 2)


def ntok(s):
    return v3.norm(FS.sub('friendslop', s))


def align_words(toks, ww, c0, c1):
    """One {w,start,end} per script token. ww: whisper words (word, start, end) inside the cue."""
    sub, owner = [], []                               # normalized script sub-words and the token they belong to
    for j, t in enumerate(toks):
        for n in ntok(t) or ['_']:
            sub.append(n); owner.append(j)
    hw, hs = [], []
    for w, st, en in ww:
        for n in v3.norm(w) or []:
            hw.append(n); hs.append((st, en))
    span = [[None, None] for _ in toks]

    def put(j, st, en):
        span[j][0] = st if span[j][0] is None else min(span[j][0], st)
        span[j][1] = en if span[j][1] is None else max(span[j][1], en)
    sm = difflib.SequenceMatcher(None, sub, hw, autojunk=False)
    for op, a, b, c, d in sm.get_opcodes():
        if op == 'equal':
            for k in range(b - a):
                put(owner[a + k], *hs[c + k])
        elif op == 'replace':                          # e.g. friendslop <-> friend slop: share the heard span
            st, en = hs[c][0], hs[d - 1][1]; js = sorted(set(owner[a:b]))
            for i, j in enumerate(js):
                put(j, st + (en - st) * i / len(js), st + (en - st) * (i + 1) / len(js))
    # tokens never heard: interpolate between neighbours
    for j in range(len(toks)):
        if span[j][0] is None:
            prev = max([span[i][1] for i in range(j) if span[i][1] is not None] or [c0])
            nxt = min([span[i][0] for i in range(j + 1, len(toks)) if span[i][0] is not None] or [c1])
            span[j] = [prev, max(prev + .05, nxt)]
    out = []
    for t, (st, en) in zip(toks, span):
        st = max(c0, st); en = min(c1, en)
        out.append({'w': t, 'start': round(st, 2), 'end': round(max(en, st + .05), 2)})
    for a, b in zip(out, out[1:]):                    # monotonic
        if b['start'] < a['start']:
            b['start'] = a['start']; b['end'] = max(b['end'], b['start'] + .05)
    return out


def snap_words(cues, y):
    """Whisper word edges are sticky (a word often 'starts' where the previous one ended, inside a pause): move every
    word start forward / end backward out of silence (10 ms frames > 38 dB under the narration's loud level)."""
    h = int(.01 * SR); n = len(y) // h
    db = 10 * np.log10(np.mean(y[:n * h].reshape(n, h) ** 2, 1) + 1e-12)
    loud = db > np.percentile(db, 95) - 38
    for c in cues.values():
        for w in c['words']:
            a, b = int(w['start'] * 100), int(w['end'] * 100)
            while a < b - 5 and a < n and not loud[a]:
                a += 1
            while b > a + 5 and b - 1 < n and not loud[b - 1]:
                b -= 1
            w['start'], w['end'] = round(a / 100, 2), round(max(b, a + 5) / 100, 2)


def main():
    if sys.argv[1] == '--retime':                  # re-snap the word edges of an existing v4 narration
        y = load(ROOT / 'public/episodes/ep003/audio/narration.wav'); tm = json.loads((EP / 'timings.json').read_text())
        snap_words(tm['cues'], y); tm['alignment'] += '; word edges snapped out of silence'
        (EP / 'timings.json').write_text(json.dumps(tm, indent=2, ensure_ascii=False)); return
    md = Path(sys.argv[1])
    lines = json.loads((EP / 'script.json').read_text())['lines']
    work = md / 'ep003_sent_v4'
    if SMOKE:                                       # quick end-to-end check on 3 lines, writes only into the work dir
        lines = [l for l in lines if l['id'] in ('l06', 'l07', 'l36')]; work = md / 'ep003_sent_v4_smoke'
    work.mkdir(exist_ok=True)
    ref = work / 'bram_ref_v4.wav'
    soundfile.write(str(ref), load(BRAM, REF_AT, REF_LEN), SR)
    sents = [(l['id'], i, s) for l in lines for i, s in enumerate(split_sentences(l['text']))]
    print('sentences', len(sents), 'seeds', SEEDS, 'gen', GEN, flush=True)
    env = dict(os.environ, OV_DTYPE='bfloat16', HF_HUB_OFFLINE='1', PATH=f"{md / 'vsenv/bin'}:{os.environ['PATH']}")

    def generate(todo, seeds):
        jobs = [dict(text=s, ref=str(ref), ref_text=REF_TEXT, out=str(work / f'{lid}_{i}_s{seed}.wav'), seed=seed,
                     duration=target_duration(s), **GEN) for seed in seeds for lid, i, s in todo]
        (work / 'jobs.json').write_text(json.dumps(jobs))
        with open(work / 'gen.log', 'a') as log:
            subprocess.run([str(md / 'vsenv/bin/python'), str(md / 'ovtools/omni_gen.py'), str(work / 'jobs.json')],
                           check=True, cwd=str(md / 'ovtools'), env=env, stdout=log, stderr=subprocess.STDOUT)
        takes = [j['out'] for j in jobs if Path(j['out']).exists()]
        subprocess.run([str(md / 'vsenv/bin/python'), str(md / 'ovtools/utmos_score.py'), str(work / 'utmos_new.json')] + takes,
                       check=True, cwd=str(md / 'ovtools'), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        old = json.loads((work / 'utmos.json').read_text()) if (work / 'utmos.json').exists() else {}
        old.update(json.loads((work / 'utmos_new.json').read_text()))
        (work / 'utmos.json').write_text(json.dumps(old, indent=1))

    from faster_whisper import WhisperModel
    stt = WhisperModel('small.en', compute_type='int8')
    bram = load(BRAM, 150, 120)
    B = mfcc_vec(bram)
    generate(sents, SEEDS)
    hook = [x for x in sents if x[0] == HOOK_END]           # the wordmark line always gets all five takes
    generate(hook, REPAIR_SEEDS)
    pick = {}
    pick = choose(sents, SEEDS, work, stt, B)
    pick.update(choose(hook, SEEDS + REPAIR_SEEDS, work, stt, B))
    bad = [(lid, i, s) for lid, i, s in sents if pick[(lid, i)][2] > 0]
    if bad:
        print('repair', [(lid, i) for lid, i, _ in bad], flush=True)
        generate(bad, REPAIR_SEEDS)
        pick.update(choose(bad, SEEDS + REPAIR_SEEDS, work, stt, B))
    finish(lines, sents, pick, bram, stt, work)


def choose(sents, seeds, work, stt, B):
    mos = json.loads((work / 'utmos.json').read_text())
    pick = {}
    for lid, i, s in sents:
        best = None
        for seed in seeds:
            p = work / f'{lid}_{i}_s{seed}.wav'
            if not p.exists():
                continue
            a = trim(load(p))
            segs, _ = stt.transcribe(str(p), language='en', beam_size=5)
            heard = ' '.join(x.text.strip() for x in segs)
            e = errors(FS.sub('friendslop', s), FS.sub('friendslop', heard))
            dur = len(a) / SR; wpm = len(s.split()) / max(dur, .3) * 60
            iqr = f0_iqr(a) if dur > .8 else TARGET_IQR
            tim = float(np.linalg.norm(mfcc_vec(a) - B)) if dur > .8 else 3.0
            click = float(np.abs(np.diff(a[:200])).max() + np.abs(np.diff(a[-200:])).max())
            u = mos.get(str(p), 4.0)
            score = e * 10 + abs(wpm - TARGET_WPM) / 25 + abs(iqr - TARGET_IQR) / 30 + tim / 3 + click * 2 - (u - 4.0) * 2
            if lid == HOOK_END:                                   # Bram's "So, why?": 1.25 s
                score = e * 10 + abs(dur - 1.25) * 6 + tim / 3 + click * 2 - (u - 4.0) * 2
            if best is None or score < best[0]:
                best = (score, a, e, heard, seed, round(wpm), round(iqr), u)
        pick[(lid, i)] = best
        print(lid, i, 'err', best[2], 'wpm', best[5], 'iqr', best[6], 'utmos', best[7], 'seed', best[4], flush=True)
    return pick


def finish(lines, sents, pick, bram, stt, work):
    levels = [np.sqrt(np.mean(b[1][np.abs(b[1]) > .01] ** 2)) for b in pick.values()]
    target = float(np.median(levels))
    rng = np.random.default_rng(3)
    parts, cues, t = [np.zeros(int(LEAD * SR), np.float32)], {}, LEAD
    for li, l in enumerate(lines):
        ss_ = [(i, s) for (lid, i, s) in sents if lid == l['id']]
        start = t
        for k, (i, s) in enumerate(ss_):
            a = pick[(l['id'], i)][1]
            lv = np.sqrt(np.mean(a[np.abs(a) > .01] ** 2)) + 1e-9
            a = fades(a * min(2.0, target / lv))
            parts.append(a); t += len(a) / SR
            if k < len(ss_) - 1:
                g = GAP.get(end_mark(s), .48) + rng.uniform(-.04, .04)
                parts.append(np.zeros(int(g * SR), np.float32)); t += g
        cues[l['id']] = {'start': round(start, 3), 'end': round(t, 3), 'text': l['text'],
                         'takes': [int(pick[(l['id'], i)][4]) for i, _ in ss_],
                         'stt_errors': int(sum(pick[(l['id'], i)][2] for i, _ in ss_)),
                         'utmos': round(float(np.mean([pick[(l['id'], i)][7] for i, _ in ss_])), 2)}
        if li < len(lines) - 1:
            g = 1.5 if l['id'] == HOOK_END else (LINE_FLOW if end_mark(ss_[-1][1]) == '...' else LINE_GAP + rng.uniform(-.05, .06))
            parts.append(np.zeros(int(g * SR), np.float32)); t += g
    y = np.concatenate(parts + [np.zeros(int(.6 * SR), np.float32)])
    y = eq_to(y, bram)
    r = np.sqrt(np.mean(bram[np.abs(bram) > .01] ** 2)); s_ = np.sqrt(np.mean(y[np.abs(y) > .01] ** 2))
    y = np.clip(y * r / s_, -.98, .98)
    out = work / 'smoke_narration.wav' if SMOKE else ROOT / 'public/episodes/ep003/audio/narration.wav'
    tpath = work / 'smoke_timings.json' if SMOKE else EP / 'timings.json'
    if not SMOKE and out.exists() and not (out.parent / 'narration_v3.wav').exists():
        shutil.copy(out, out.parent / 'narration_v3.wav'); shutil.copy(EP / 'timings.json', EP / 'timings_v3.json')
    soundfile.write(str(out), y, SR, subtype='PCM_16')
    segs, _ = stt.transcribe(str(out), language='en', word_timestamps=True, beam_size=5)
    ww = [(w.word, w.start, w.end) for s_ in segs for w in s_.words]
    for c in cues.values():
        inside = [w for w in ww if c['start'] - .15 <= (w[1] + w[2]) / 2 <= c['end'] + .15]
        c['words'] = align_words(c['text'].split(), inside, c['start'], c['end'])
        assert [w['w'] for w in c['words']] == c['text'].split()
    snap_words(cues, y)
    tm = {'source': 'audio/narration.wav',
          'generatedBy': 'PLACEHOLDER (internal only) v4: VoiceStudio/OmniVoice (k2-fsa/OmniVoice, CC-BY-NC weights) + Bram '
                         f'reference, sentence-level best-of-{len(SEEDS)}, Bram-measured pauses (scripts/ep003-narration-v4.py)',
          'alignment': 'cue start/end from assembly; faster-whisper word timestamps aligned (difflib) 1:1 onto script tokens; word edges snapped out of silence',
          'hook_end': {'line': HOOK_END, 'silence_after': 1.5}, 'duration': round(len(y) / SR, 2), 'cues': cues}
    tpath.write_text(json.dumps(tm, indent=2, ensure_ascii=False))
    bad = {k: c['stt_errors'] for k, c in cues.items() if c['stt_errors']}
    print('duration', tm['duration'], 'lines with STT differences', bad)


if __name__ == '__main__':
    main()
