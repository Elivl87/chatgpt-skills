#!/usr/bin/env python3
"""EP002 Spanish dub, step 4: listen to the finished track the way a viewer would and check it against the script.

  python3 scripts/ep002-es-qc.py      # -> audio/bram/ep002_es/QC_track.json

* Transcribes the whole Spanish track (faster-whisper medium, word times) and aligns it with the Spanish script:
  every script word missing, and every heard word that is not in the script (a doubled syllable or word at a cut
  shows up here), with its time.
* Overlap check: the voice track itself (no SFX) must never hold two segments at once (from QC.json).
* The Producer's intervals (2026-10-07) are listed with what is heard in each one.
"""
import difflib, json, sys
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/bram/ep002_es'
sp = spec_from_file_location('lines', ROOT / 'scripts/ep002-es-lines.py'); L = module_from_spec(sp); sp.loader.exec_module(L)
WINDOWS = [('0:58', '1:00'), ('1:56', '1:58'), ('2:36', '2:39'), ('3:35', '3:50'), ('4:00', '4:08'), ('4:15', '4:22'),
           ('4:35', '4:45'), ('5:10', '5:30'), ('5:45', '6:00'), ('6:00', '6:20'), ('6:25', '6:52')]
sec = lambda m: int(m.split(':')[0]) * 60 + int(m.split(':')[1])


def main():
    from faster_whisper import WhisperModel
    model = WhisperModel('medium', device='cpu', compute_type='int8')
    segs, _ = model.transcribe(str(D / 'EP002_audio_es.wav'), language='es', word_timestamps=True, beam_size=5,
                               condition_on_previous_text=False, vad_filter=False)
    words = [{'w': w.word.strip(), 'start': round(w.start, 2), 'end': round(w.end, 2)} for s in segs for w in s.words]
    heard = [(t, i) for i, w in enumerate(words) for t in L.norm(w['w'])]
    script = [t for lid in sorted(L.ES, key=lambda k: int(k[1:])) for t in L.norm(L.ES[lid])]
    sm = difflib.SequenceMatcher(None, script, [h[0] for h in heard], autojunk=False)
    issues = []
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == 'equal':
            continue
        at = words[heard[min(b0, len(heard) - 1)][1]]['start']
        issues.append({'at': at, 'op': op, 'script': ' '.join(script[a0:a1]), 'heard': ' '.join(h[0] for h in heard[b0:b1])})
    q = json.loads((D / 'QC.json').read_text())['segments']
    overlaps = [(a['lines'], b['lines']) for a, b in zip(q, q[1:]) if b['at'] < a['end'] - 1e-3]
    win = [{'window': f'{a}-{b}', 'heard': ' '.join(w['w'] for w in words if sec(a) - .2 <= w['start'] < sec(b) + .2)} for a, b in WINDOWS]
    out = {'match_ratio': round(sm.ratio(), 4), 'script_words': len(script), 'heard_words': len(heard),
           'overlaps': overlaps, 'issues': issues, 'windows': win, 'words': words}
    (D / 'QC_track.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f"match {out['match_ratio']:.3f} · script {len(script)} words · heard {len(heard)} · overlaps {len(overlaps)} · differences {len(issues)}")
    for i in issues:
        print(f"  {int(i['at'] // 60)}:{i['at'] % 60:05.2f} {i['op']:7s} script «{i['script']}» heard «{i['heard']}»")


if __name__ == '__main__':
    sys.exit(main())
