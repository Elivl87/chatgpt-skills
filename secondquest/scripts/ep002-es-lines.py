#!/usr/bin/env python3
"""EP002 Spanish dub, step 1: cut Bram's Spanish takes (audio/bram/ep002_es/B0x_*.mp3) into script lines.

  python3 scripts/ep002-es-lines.py    # -> audio/bram/ep002_es/lines.json  {lid: {block, start, end}} (seconds in the take)

The approved ES-419 lines (docs/publish/EP002/script_es.json) are matched word by word to the STT words of each take
(<take>.words.json, faster-whisper); a line runs from its first word to just before the next line's first word.
"""
import difflib, json, re, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/bram/ep002_es'
ES = json.loads((ROOT / 'docs/publish/EP002/script_es.json').read_text())['lines']
PLAN = json.loads((ROOT / 'audio/bram/ep002/NARRATION_PLAN.json').read_text())


def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace('1998', 'mil novecientos noventa y ocho').replace('2026', 'dos mil veintiseis')
    return re.sub(r'[^a-z0-9 ]+', ' ', s).split()


def main():
    out = {}
    for b in PLAN['blocks']:
        take = next(D.glob(f"{b['id']}_*.mp3")).stem
        words = json.loads((D / f'{take}.words.json').read_text())
        heard = []                                                     # one entry per normalized STT token
        for i, w in enumerate(words):
            for tok in norm(w['w']):
                heard.append((tok, i))
        script, owner = [], []
        for lid in b['lines']:
            for tok in norm(ES[lid]):
                script.append(tok); owner.append(lid)
        sm = difflib.SequenceMatcher(None, script, [h[0] for h in heard], autojunk=False)
        first = {}
        for a, h, n in sm.get_matching_blocks():
            for k in range(n):
                lid = owner[a + k]
                if lid not in first:
                    first[lid] = words[heard[h + k][1]]['start']
        lines = b['lines']
        end_take = words[-1]['end']
        for i, lid in enumerate(lines):
            st = first.get(lid)
            if st is None:
                raise SystemExit(f'{lid}: no word matched in {take}')
            nxt = next((first[l] for l in lines[i + 1:] if l in first), None)
            last_word_end = max(w['end'] for w in words if w['start'] >= st - .01 and (nxt is None or w['start'] < nxt - .01))
            out[lid] = {'take': take + '.mp3', 'start': round(max(0, st - .06), 3), 'end': round(last_word_end + .10, 3)}
    (D / 'lines.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(len(out), 'lines')


if __name__ == '__main__':
    main()
