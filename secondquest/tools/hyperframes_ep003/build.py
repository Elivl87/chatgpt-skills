#!/usr/bin/env python3
"""Assemble hook/index.html from src/index.template.html: inline the registry components it names and resolve the
word-time tokens. {{l07.w2}} = start of word 2 of line l07 (1-based, like lib.T), {{l07.end}}, {{l07}} = line start,
{{DUR}} = end of l07 + 1.5 s; plain arithmetic is allowed ({{l07.w2-0.4}}). A new narration re-times everything."""
from pathlib import Path
import json, re
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
cues = json.loads((ROOT / 'episodes/ep003/timings.json').read_text())['cues']
TBL = {}
for k, c in cues.items():
    TBL[k] = c['start']; TBL[k + '.end'] = c['end']
    for i, w in enumerate(c['words']):
        TBL[f'{k}.w{i + 1}'] = w['start']; TBL[f'{k}.w{i + 1}.end'] = w['end']
TBL['DUR'] = round(cues['l07']['end'] + 1.5, 3)


def resolve(m):
    expr = re.sub(r'l\d\d(?:\.w\d+)?(?:\.end)?|DUR', lambda k: repr(TBL[k.group(0)]), m.group(1))
    if not re.fullmatch(r'[\d.+\-* ()/]+', expr):
        raise ValueError('bad time token ' + m.group(0))
    return str(round(eval(expr), 3))


src = (HERE / 'src/index.template.html').read_text()
comp = HERE / 'hook/compositions/components'
out = re.sub(r'<!--INCLUDE ([\w.-]+)-->', lambda m: (comp / m.group(1)).read_text(), src)
out = re.sub(r'\{\{([^}]+)\}\}', resolve, out)
(HERE / 'hook/index.html').write_text(out)
print('wrote hook/index.html', len(out), 'bytes; DUR', TBL['DUR'])
