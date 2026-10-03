#!/usr/bin/env python3
"""EP002 Bram narration QC: transcribe every block locally and diff it against the approved script.

  python3 scripts/ep002-bram-qc.py

Writes audio/bram/ep002/STT_QC.json (word timestamps + diffs) and stamps stt_match on each block
of audio/bram/ep002/NARRATION_PLAN.json. Numbers are normalised (1998, 2026, twenty-eight).
"""
import difflib, json, re
from pathlib import Path
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent.parent
DIR = ROOT / 'audio/bram/ep002'
NUM = {'1998': 'nineteen ninety eight', '2026': 'twenty twenty six', '64': 'sixty four', '2': 'two',
       'twenty-eight': 'twenty eight'}

def norm(t):
    t = t.lower().replace('’', "'").replace('-', ' ')
    for k, v in NUM.items():
        t = re.sub(rf'\b{re.escape(k)}\b', v, t)
    return re.sub(r"[^a-z0-9' ]", ' ', t).split()

def main():
    plan = json.loads((DIR / 'NARRATION_PLAN.json').read_text())
    model = WhisperModel('small.en', device='cpu', compute_type='int8')
    qc = {}
    for b in plan['blocks']:
        segs, _ = model.transcribe(str(DIR / b['file']), word_timestamps=True, beam_size=5)
        words = [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2)} for s in segs for w in s.words]
        ref, hyp = norm(b['text']), norm(' '.join(w['w'] for w in words))
        sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False)
        diffs = [{'op': op, 'ref': ' '.join(ref[i1:i2]), 'heard': ' '.join(hyp[j1:j2])}
                 for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
        b['stt_match'] = round(sm.ratio(), 4)
        qc[b['file']] = {'ref_words': len(ref), 'ratio': b['stt_match'], 'diffs': diffs, 'words': words}
        print(b['id'], b['stt_match'], diffs)
    (DIR / 'STT_QC.json').write_text(json.dumps(qc, indent=1, ensure_ascii=False))
    (DIR / 'NARRATION_PLAN.json').write_text(json.dumps(plan, indent=1, ensure_ascii=False))

main()
