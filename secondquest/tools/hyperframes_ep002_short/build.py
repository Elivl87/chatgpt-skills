#!/usr/bin/env python3
"""Assemble short/index.html from src/short.template.html.

Time tokens are Short-time word tokens resolved through seg.py (the line selection): {{l07.w2}} = start of word 2 of
line l07 (1-based), {{l07.w2.end}}, {{l07}} = line start, {{l07.end}}, {{S3}} = start of segment 3, {{VEND}} = end of
the voice, {{DUR}} = end of the Short; plain arithmetic allowed ({{l07.w2-0.4}}). Never a typed second for a beat.
/*CAPTIONS*/ -> the caption chunks (word-by-word), /*ART*/ -> staged art geometry (short/assets/art_info.json).
<!--INCLUDE name--> inlines src/components/<name> or short/compositions/components/<name>.
"""
import json, re, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import seg  # noqa: E402

T = seg.table()


def resolve(m):
    expr = re.sub(r'l\d+(?:\.w\d+)?(?:\.end)?|DUR|VEND|S\d', lambda k: repr(T[k.group(0)]), m.group(1))
    if not re.fullmatch(r'[\d.+\-* ()/]+', expr):
        raise ValueError('bad time token ' + m.group(0))
    return str(round(eval(expr), 3))


def chunks():
    """Caption chunks: <= 3 words, a break after punctuation or a pause > .45 s; 'You.' and 'So, why?' are one big hit."""
    GLUE = {('Ocarina', 'of'), ('of', 'Time'), ('Hyrule', 'Field'), ('Nintendo', '64'), ('64', 'texture')}
    units = []                                                          # names stay on one caption: Ocarina of Time, Hyrule Field
    for wd in seg.words():
        if units and (units[-1][-1][1], wd[1]) in GLUE and units[-1][-1][0] == wd[0]:
            units[-1].append(wd)
        else:
            units.append([wd])
    out, cur = [], []
    for u in units:
        ln, a = u[0][0], u[0][2]
        long = len(' '.join(x[1] for x in cur + u)) > 20
        if cur and (len(cur) >= 4 or long or cur[-1][1][-1] in '.?!:;' or (cur[-1][1][-1] == ',' and ln != 'l10')
                    or ln != cur[-1][0] or a - cur[-1][3] > .45):
            out.append(cur); cur = []
        cur += u
    out.append(cur)
    for i in range(1, len(out)):                                         # no lone tail word after a long phrase of the same line
        if len(out[i]) == 1 and out[i][0][0] == out[i - 1][-1][0] and len(out[i - 1]) >= 3 and out[i][0][2] - out[i - 1][-1][3] < .45:
            out[i].insert(0, out[i - 1].pop())
    res = []
    for i, c in enumerate(out):
        nxt = out[i + 1][0][2] - .06 if i + 1 < len(out) else seg.VOICE_END
        end = min(nxt - .01, c[-1][3] + .7)
        res.append({'big': c[0][0] in ('l08', 'l10'), 'a': round(c[0][2] - .06, 3), 'e': round(end, 3),
                    'w': [[w, round(a, 3), round(b, 3)] for _, w, a, b in c]})
    return res


src = (HERE / 'src/short.template.html').read_text()


def include(m):
    for d in (HERE / 'src/components', HERE / 'short/compositions/components'):
        if (d / m.group(1)).exists():
            return (d / m.group(1)).read_text()
    raise FileNotFoundError(m.group(1))


out = re.sub(r'<!--INCLUDE ([\w.-]+)-->', include, src)
out = re.sub(r'\{\{([^}]+)\}\}', resolve, out)
out = out.replace('/*CAPTIONS*/', json.dumps(chunks()))
out = out.replace('/*ART*/', (HERE / 'short/assets/art_info.json').read_text())
(HERE / 'short/index.html').write_text(out)
print('wrote short/index.html', len(out), 'bytes; DUR', T['DUR'], '; voice end', T['VEND'])
