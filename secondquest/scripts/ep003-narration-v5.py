#!/usr/bin/env python3
"""EP003 placeholder narration v5 — VoiceStudio / OmniVoice cloned from ALL of Bram's real narration (EP001 + EP002).
INTERNAL PLACEHOLDER ONLY: a cloned Bram voice never goes into any published video, Short or delivery (Bram's real
voice is licensed through a paid platform). OmniVoice weights are CC-BY-NC (non-commercial): internal review cuts only.

What changes vs v4 (scripts/ep003-narration-v4.py; the Producer chose VoiceStudio and asked to clone Bram "al 100%"):
1. References: a clean Bram corpus (190 sentences from EP001 + EP002, VAD-snapped, no cut breaths/clipping;
   scratch tools ovtools/bram_corpus.py + make_refs.py) and one contiguous Bram passage per sentence type, so a
   question is cloned from Bram asking, a fragment from his fragments, a "..." line from his trailing lines, etc.
   (OmniVoice takes one in-context reference <= 20 s with its transcript; there is no speaker-embedding input).
2. Pace and melody per type from Bram's own measurements (style.json: wpm while speaking, f0 IQR / range, final
   contour of statements and questions, pauses at commas); each sentence gets Bram's duration for its type.
3. Best of N per sentence with a Bram-likeness score: 0 STT errors, prosody distance to Bram's type stats,
   speaker-embedding cosine to the Bram corpus centroid (WavLM-base-plus-SV), UTMOS naturalness.
4. Same assembly as v3/v4: Bram-measured sentence/line pauses, 1.5 s after "So, why?", levelling, EQ toward Bram,
   8 ms fades; word timings 1:1 with script.json tokens (difflib alignment, "Friendslop" is one token), edges snapped.

  python3 scripts/ep003-narration-v5.py <scratch dir: vsenv/ vs_repo/ ovtools/ bram_corpus/>
  V5_PASSAGES=1 -> only the A/B passages (hook l01-l07, boat l24-l26, ending l49-l52), written into the work dir.
Out: public/episodes/ep003/audio/narration_v5.wav + episodes/ep003/timings_v5.json (never the active narration.wav).
"""
import importlib.util, json, os, re, subprocess, sys
from pathlib import Path
import numpy as np, soundfile

ROOT = Path(__file__).resolve().parents[1]
EP = ROOT / 'episodes/ep003'
_spec = importlib.util.spec_from_file_location('v4', ROOT / 'scripts/ep003-narration-v4.py')
v4 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(v4)
v3 = v4.v3
split_sentences, end_mark, load, mfcc_vec, eq_to, fades = v3.split_sentences, v3.end_mark, v3.load, v3.mfcc_vec, v3.eq_to, v3.fades
trim, align_words, snap_words = v4.trim, v4.align_words, v4.snap_words
BRAM, SR, LEAD, HOOK_END, GAP, LINE_GAP, LINE_FLOW = v3.BRAM, v3.SR, v3.LEAD, v3.HOOK_END, v3.GAP, v3.LINE_GAP, v3.LINE_FLOW
FS = re.compile(r'(?i)friend[\s-]?slop')

SEEDS = tuple(int(s) for s in os.environ.get('V5_SEEDS', '7,11,23').split(','))
REPAIR_SEEDS = (42, 77)
REF_MODE = os.environ.get('V5_REF', 'matched')         # matched (per sentence type) | longest | statement
GEN = {'num_step': 32, 'guidance_scale': 2.0, 't_shift': 0.1, 'position_temperature': 5.0,
       'class_temperature': float(os.environ.get('V5_CLS_TEMP', '0.0'))}
PASSAGES = {'hook': [f'l0{i}' for i in range(1, 8)], 'boat_silence': ['l24', 'l25', 'l26'], 'ending': ['l49', 'l50', 'l51', 'l52']}


def main():
    md = Path(sys.argv[1]).resolve()
    sys.path.insert(0, str(md / 'ovtools'))
    from v5common import target_duration
    from bram_corpus import stype
    from bramlike import prosody, dist, score
    from ab_metrics import errors
    refs = json.loads((md / 'bram_corpus/refs.json').read_text())
    lines = json.loads((EP / 'script.json').read_text())['lines']
    passages = bool(os.environ.get('V5_PASSAGES'))
    if passages:
        keep = {i for ids in PASSAGES.values() for i in ids}
        lines = [l for l in lines if l['id'] in keep]
    work = md / 'ep003_sent_v5'; work.mkdir(exist_ok=True)
    sents = [(l['id'], i, s) for l in lines for i, s in enumerate(split_sentences(l['text']))]
    print('sentences', len(sents), 'seeds', SEEDS, 'ref', REF_MODE, 'gen', GEN, flush=True)
    env = dict(os.environ, OV_DTYPE='bfloat16', HF_HUB_OFFLINE='1', PATH=f"{md / 'vsenv/bin'}:{os.environ['PATH']}")
    tools = md / 'ovtools'

    def ref_for(s):
        r = refs[stype(s) if REF_MODE == 'matched' else REF_MODE]
        return r['wav'], r['text']

    def run_scores(paths):
        for tool, name, extra in (('utmos_score.py', 'utmos', []), ('sv_score.py', 'sv', [str(md / 'bram_corpus/clips')])):
            out = work / f'{name}_new.json'
            subprocess.run([str(md / 'vsenv/bin/python'), tool] + extra + [str(out)] + paths, check=True, cwd=str(tools),
                           env=env, capture_output=True)
            old = json.loads((work / f'{name}.json').read_text()) if (work / f'{name}.json').exists() else {}
            old.update(json.loads(out.read_text())); (work / f'{name}.json').write_text(json.dumps(old, indent=1))

    def generate(todo, seeds):
        jobs = []
        for seed in seeds:
            for lid, i, s in todo:
                rw, rt = ref_for(s)
                jobs.append(dict(text=s, ref=rw, ref_text=rt, out=str(work / f'{lid}_{i}_s{seed}.wav'), seed=seed,
                                 duration=target_duration(s), **GEN))
        (work / 'jobs.json').write_text(json.dumps(jobs))
        with open(work / 'gen.log', 'a') as log:
            subprocess.run([str(md / 'vsenv/bin/python'), str(tools / 'omni_gen.py'), str(work / 'jobs.json')],
                           check=True, cwd=str(tools), env=env, stdout=log, stderr=subprocess.STDOUT)
        known = json.loads((work / 'sv.json').read_text()) if (work / 'sv.json').exists() else {}
        new = [j['out'] for j in jobs if Path(j['out']).exists() and j['out'] not in known]
        if new:
            run_scores(new)

    from faster_whisper import WhisperModel
    stt = WhisperModel('small.en', compute_type='int8')
    cache = json.loads((work / 'stt.json').read_text()) if (work / 'stt.json').exists() else {}

    def choose(todo, seeds):
        U = json.loads((work / 'utmos.json').read_text()); V = json.loads((work / 'sv.json').read_text())
        pick = {}
        for lid, i, s in todo:
            best = None
            for seed in seeds:
                p = str(work / f'{lid}_{i}_s{seed}.wav')
                if not os.path.exists(p):
                    continue
                if p not in cache:
                    segs, _ = stt.transcribe(p, language='en', beam_size=5)
                    cache[p] = ' '.join(x.text.strip() for x in segs)
                a = trim(load(p)); m = prosody(a, s)
                e = errors(FS.sub('friendslop', s), FS.sub('friendslop', cache[p]))
                d = dist(m, s); sc = score(e, d, U[p], V[p])
                click = float(np.abs(np.diff(a[:200])).max() + np.abs(np.diff(a[-200:])).max()); sc += click * 2
                if best is None or sc < best['score']:
                    best = {'score': sc, 'a': a, 'err': e, 'seed': seed, 'dist': d, 'utmos': U[p], 'sv': V[p], **m}
            pick[(lid, i)] = best
            print(lid, i, 'err', best['err'], 'wpm', best['wpm'], 'dist', best['dist'], 'sv', best['sv'], 'utmos',
                  best['utmos'], 'seed', best['seed'], flush=True)
        (work / 'stt.json').write_text(json.dumps(cache, indent=0))
        return pick

    generate(sents, SEEDS)
    pick = choose(sents, SEEDS)
    bad = [(lid, i, s) for lid, i, s in sents if pick[(lid, i)]['err'] > 0 or pick[(lid, i)]['dist'] > 6]
    if bad:
        print('repair', [(lid, i) for lid, i, _ in bad], flush=True)
        generate(bad, REPAIR_SEEDS)
        pick.update(choose(bad, SEEDS + REPAIR_SEEDS))
    bram = load(BRAM, 150, 120)
    if passages:
        for name, ids in PASSAGES.items():
            sub = [l for l in lines if l['id'] in ids]
            assemble(sub, [x for x in sents if x[0] in ids], pick, bram, stt, work / f'passage_{name}.wav',
                     work / f'passage_{name}.json')
    else:
        assemble(lines, sents, pick, bram, stt, ROOT / 'public/episodes/ep003/audio/narration_v5.wav', EP / 'timings_v5.json')


def assemble(lines, sents, pick, bram, stt, out, tpath):
    levels = [np.sqrt(np.mean(pick[(l, i)]['a'][np.abs(pick[(l, i)]['a']) > .01] ** 2)) for l, i, _ in sents]
    target = float(np.median(levels))
    rng = np.random.default_rng(3)
    parts, cues, t = [np.zeros(int(LEAD * SR), np.float32)], {}, LEAD
    for li, l in enumerate(lines):
        ss_ = [(i, s) for (lid, i, s) in sents if lid == l['id']]
        start = t
        for k, (i, s) in enumerate(ss_):
            a = pick[(l['id'], i)]['a']
            lv = np.sqrt(np.mean(a[np.abs(a) > .01] ** 2)) + 1e-9
            a = fades(a * min(2.0, target / lv))
            parts.append(a); t += len(a) / SR
            if k < len(ss_) - 1:
                g = GAP.get(end_mark(s), .48) + rng.uniform(-.04, .04)
                parts.append(np.zeros(int(g * SR), np.float32)); t += g
        P = [pick[(l['id'], i)] for i, _ in ss_]
        cues[l['id']] = {'start': round(start, 3), 'end': round(t, 3), 'text': l['text'], 'takes': [int(p['seed']) for p in P],
                         'stt_errors': int(sum(p['err'] for p in P)), 'utmos': round(float(np.mean([p['utmos'] for p in P])), 2),
                         'bram_sv': round(float(np.mean([p['sv'] for p in P])), 4),
                         'bram_dist': round(float(np.mean([p['dist'] for p in P])), 2)}
        if li < len(lines) - 1 or l['id'] == HOOK_END:
            g = 1.5 if l['id'] == HOOK_END else (LINE_FLOW if end_mark(ss_[-1][1]) == '...' else LINE_GAP + rng.uniform(-.05, .06))
            parts.append(np.zeros(int(g * SR), np.float32)); t += g
    y = np.concatenate(parts + [np.zeros(int(.6 * SR), np.float32)])
    y = eq_to(y, bram)
    r = np.sqrt(np.mean(bram[np.abs(bram) > .01] ** 2)); s_ = np.sqrt(np.mean(y[np.abs(y) > .01] ** 2))
    y = np.clip(y * r / s_, -.98, .98)
    soundfile.write(str(out), y, SR, subtype='PCM_16')
    segs, _ = stt.transcribe(str(out), language='en', word_timestamps=True, beam_size=5)
    ww = [(w.word, w.start, w.end) for s_ in segs for w in s_.words]
    for c in cues.values():
        inside = [w for w in ww if c['start'] - .15 <= (w[1] + w[2]) / 2 <= c['end'] + .15]
        c['words'] = align_words(c['text'].split(), inside, c['start'], c['end'])
        assert [w['w'] for w in c['words']] == c['text'].split()
    snap_words(cues, y)
    tm = {'source': f'audio/{out.name}',
          'generatedBy': 'PLACEHOLDER (internal only) v5: VoiceStudio/OmniVoice (k2-fsa/OmniVoice, CC-BY-NC weights) cloned '
                         f'from Bram EP001+EP002 (per-type references, ref={REF_MODE}), Bram-paced, best-of-{len(SEEDS)} by '
                         'Bram-likeness (scripts/ep003-narration-v5.py)',
          'alignment': 'cue start/end from assembly; faster-whisper word timestamps aligned (difflib) 1:1 onto script tokens; word edges snapped out of silence',
          'hook_end': {'line': HOOK_END, 'silence_after': 1.5}, 'duration': round(len(y) / SR, 2), 'cues': cues}
    tpath.write_text(json.dumps(tm, indent=2, ensure_ascii=False))
    bad = {k: c['stt_errors'] for k, c in cues.items() if c['stt_errors']}
    print(out.name, 'duration', tm['duration'], 'lines with STT differences', bad, flush=True)


if __name__ == '__main__':
    main()
