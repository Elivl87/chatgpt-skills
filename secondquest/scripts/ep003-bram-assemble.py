#!/usr/bin/env python3
"""EP003 official narration: Bram (Higgsfield text2speech_v2 / ElevenLabs), 7 blocks of the LOCKED script v3.2.

  python3 scripts/ep003-bram-assemble.py

The voice is never stretched, pitched or edited inside a block (docs/PRODUCTION_PLAYBOOK.md §3): each block is
trimmed of its edge silence and placed end to end; 1.5 s of silence after the hook's "So, why?" (l07, the wordmark
rule), a short act break between the other blocks; one static gain to the level of the review narration so the
sound pass (scripts/ep003-sfx.py) keeps its balance. Word timings: faster-whisper on the assembled file, aligned
1:1 onto script.json tokens (difflib, ep003-narration-v4 helpers), edges snapped out of silence.
Out: public/episodes/ep003/audio/narration_bram.wav + episodes/ep003/timings_bram.json (activate by copying).
"""
import importlib.util, json
from pathlib import Path
import numpy as np, soundfile

ROOT = Path(__file__).resolve().parents[1]
EP = ROOT / 'episodes/ep003'
_spec = importlib.util.spec_from_file_location('v4', ROOT / 'scripts/ep003-narration-v4.py')
v4 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(v4)
load, trim, align_words, snap_words, SR = v4.v3.load, v4.trim, v4.align_words, v4.snap_words, v4.SR
LEAD, HOOK_GAP, ACT_GAP, TAIL = .3, 1.5, .7, .8
DIR = ROOT / 'audio/bram/ep003'


def main():
    plan = json.loads((DIR / 'NARRATION_PLAN.json').read_text())
    lines = {l['id']: l for l in json.loads((EP / 'script.json').read_text())['lines']}
    parts, t, spans = [np.zeros(int(LEAD * SR), np.float32)], LEAD, []
    for k, b in enumerate(plan['blocks']):
        a = trim(load(DIR / b['file']), rel_db=45, pre=.05, post=.12)
        f = int(.008 * SR); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
        spans.append((b, t, t + len(a) / SR)); parts.append(a); t += len(a) / SR
        g = HOOK_GAP if b['to'] == 'l07' else (ACT_GAP if k < len(plan['blocks']) - 1 else TAIL)
        parts.append(np.zeros(int(g * SR), np.float32)); t += g
    y = np.concatenate(parts)
    ref = load(ROOT / 'public/episodes/ep003/audio/narration_v5.wav')
    rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > .01] ** 2))                       # noqa: E731
    gain = rms(ref) / rms(y); y = np.clip(y * gain, -.98, .98)
    out = ROOT / 'public/episodes/ep003/audio/narration_bram.wav'
    soundfile.write(str(out), y, SR, subtype='PCM_16')
    from faster_whisper import WhisperModel
    stt = WhisperModel('small.en', device='cpu', compute_type='int8')
    cues = {}
    for b, s0, s1 in spans:                                  # align block by block (the hook's 1.5 s gap stays out)
        segs, _ = stt.transcribe(str(out), language='en', word_timestamps=True, beam_size=5,
                                 clip_timestamps=[round(s0, 2), round(s1, 2)])
        ww = [(w.word, float(w.start), float(w.end)) for sg in segs for w in sg.words]
        toks, owner = [], []
        for lid in b['lines']:
            for tk in lines[lid]['text'].split():
                toks.append(tk); owner.append(lid)
        words = align_words(toks, ww, s0, s1)
        for lid in b['lines']:
            lw = [w for w, o in zip(words, owner) if o == lid]
            cues[lid] = {'start': lw[0]['start'], 'end': lw[-1]['end'], 'text': lines[lid]['text'], 'block': b['id'], 'words': lw}
    for c in cues.values():
        for w in c['words']:
            w['start'], w['end'] = round(float(w['start']), 3), round(float(w['end']), 3)
    snap_words(cues, y)
    for lid, c in cues.items():
        c['start'], c['end'] = c['words'][0]['start'], c['words'][-1]['end']
        assert [w['w'] for w in c['words']] == lines[lid]['text'].split(), lid
    order = list(lines)
    cues = {k: cues[k] for k in order}
    tm = {'source': 'audio/narration.wav',
          'generatedBy': 'Bram (Higgsfield text2speech_v2 / ElevenLabs preset 549ff70a), 7 blocks, unedited, '
                         'scripts/ep003-bram-assemble.py',
          'alignment': 'faster-whisper small.en word timestamps per block, aligned (difflib) 1:1 onto script tokens; edges snapped out of silence',
          'hook_end': {'line': 'l07', 'silence_after': HOOK_GAP}, 'gain_db': round(float(20 * np.log10(gain)), 2),
          'duration': round(len(y) / SR, 2), 'cues': cues}
    (EP / 'timings_bram.json').write_text(json.dumps(tm, indent=2, ensure_ascii=False))
    gaps = [round(cues[order[i + 1]]['start'] - cues[order[i]]['end'], 2) for i in range(len(order) - 1)]
    print('duration', tm['duration'], 'gain', tm['gain_db'], 'l07 end->l08', gaps[6], 'line gaps min/med/max',
          min(gaps), float(np.median(gaps)), max(gaps))


if __name__ == '__main__':
    main()
