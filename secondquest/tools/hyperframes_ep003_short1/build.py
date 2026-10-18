#!/usr/bin/env python3
"""Assemble short/index.html from src/short.template.html (EP003 Short #1, template: EP002 Short #2's build.py).

RES=540 builds the preview (540x960: the same 1080x1920 page scaled by 0.5 inside #stage); default 1080.

Time tokens are Short-time word tokens resolved through seg.py: {{h07.w2}} = start of kept word 2 of line h07
(1-based), {{h07.w2.end}}, {{h07}} = line start, {{h07.end}}, {{S3}} = placement of segment 3, {{VEND}}, {{DUR}};
plain arithmetic allowed ({{h07.w2-0.4}}). Never a typed second for a beat.
/*CAPTIONS*/ -> the caption chunks of the CAPTIONED words only: where the line is already written on screen (the
notification banner in frame 0, the chat in the phone) that text lights up word by word as the caption instead.
<!--INCLUDE name--> inlines src/components/<name>, short/compositions/components/<name> or ../hyperframes_ep003/src/components/<name>.
"""
import json, os, re, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import seg  # noqa: E402

T = seg.table()


def resolve(m):
    expr = re.sub(r'h\d+(?:\.w\d+)?(?:\.end)?|DUR|VEND|S\d', lambda k: repr(T[k.group(0)]), m.group(1))
    if not re.fullmatch(r'[\d.+\-* ()/]+', expr):
        raise ValueError('bad time token ' + m.group(0))
    return str(round(eval(expr), 3))


def chunks():
    """Caption chunks for "He will not get it later." (h07 from word 10) and h08: <= 3 words, a break after punctuation
    or a pause > .45 s. A caption never outlives its shot (it ends before the next cut)."""
    ws = [w for w in seg.words() if (w[0] == 'h07' and w[2] >= T['h07.w10'] - .01) or w[0] == 'h08']
    out, cur = [], []
    for wd in ws:
        if cur and (len(cur) >= 3 or cur[-1][1][-1] in '.?!,' or wd[0] != cur[-1][0] or wd[2] - cur[-1][3] > .45):
            out.append(cur); cur = []
        cur.append(wd)
    out.append(cur)
    CUTS = [T['h08'] - .25, T['VEND'] + .3]
    res = []
    for i, c in enumerate(out):
        nxt = out[i + 1][0][2] - .06 if i + 1 < len(out) else seg.VOICE_END + .3
        end = min(nxt - .01, c[-1][3] + .6)
        end = min([end] + [x - .001 for x in CUTS if x > c[0][2]])
        res.append({'a': round(c[0][2] - .06, 3), 'e': round(end, 3), 'top': 300 if c[0][0] == 'h07' else 250,
                    'w': [[w, round(a, 3), round(b, 3)] for _, w, a, b in c]})
    return res


src = (HERE / ('src/' + os.environ.get('TEMPLATE', 'short.template.html'))).read_text()


def include(m):
    for d in (HERE / 'src/components', HERE / 'short/compositions/components', HERE.parent / 'hyperframes_ep003/src/components'):
        if (d / m.group(1)).exists():
            return (d / m.group(1)).read_text()
    raise FileNotFoundError(m.group(1))


RES = int(os.environ.get('RES', '1080'))
src = src.replace('{{RW}}', str(RES)).replace('{{RH}}', str(RES * 16 // 9)).replace('{{RK}}', str(RES / 1080))
out = re.sub(r'<!--INCLUDE ([\w.-]+)-->', include, src)
out = re.sub(r'\{\{([^}]+)\}\}', resolve, out)
out = out.replace('/*CAPTIONS*/', json.dumps(chunks()))
out = out.replace('/*ART*/', (HERE / 'short/assets/art_info.json').read_text())
(HERE / 'short/index.html').write_text(out)
print('wrote short/index.html', len(out), 'bytes; RES', RES, '; DUR', T['DUR'], '; voice end', T['VEND'])
