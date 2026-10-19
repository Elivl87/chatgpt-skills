#!/usr/bin/env python3
"""Assemble short/index.html from src/short.template.html (EP001 Short #3, template: EP003 Short #1's build.py).

RES=540 builds the preview (540x960: the same 1080x1920 page scaled by 0.5 inside #stage); default 1080.

Time tokens are Short-time word tokens resolved through seg.py: {{l04.w2}} = start of word 2 of line l04
(1-based), {{l04.w2.end}}, {{l04}} = line start, {{l04.end}}, {{S2}} = placement of segment 2, {{VEND}}, {{DUR}};
plain arithmetic allowed ({{l04.w2-0.4}}). Never a typed second for a beat.
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
    expr = re.sub(r'l\d+(?:\.w\d+)?(?:\.end)?|DUR|VEND|S\d', lambda k: repr(T[k.group(0)]), m.group(1))
    if not re.fullmatch(r'[\d.+\-* ()/]+', expr):
        raise ValueError('bad time token ' + m.group(0))
    return str(round(eval(expr), 3))


def chunks():
    """Caption chunks for every word: <= 3 words, a break after punctuation or a pause > .45 s; a caption never outlives
    its shot (it ends before the next cut). Frame 0's words sit low (on the hoodie, clear of the face and the hook text),
    the rest in the top strip."""
    ws = seg.words()
    out, cur = [], []
    for wd in ws:
        if cur and (len(cur) >= 3 or cur[-1][1][-1] in '.?!,' or cur[-1][1].endswith('...') or wd[2] - cur[-1][3] > .45):
            out.append(cur); cur = []
        cur.append(wd)
    out.append(cur)
    CUTS = [T['l01.w8'] - .05, T['l02'] - .05, T['l03'] - .05, T['l04'] - .05, T['l11'] - .28, T['l12'] - .26, T['l05'] - .12,
            T['l06'] - .05, T['VEND'] + .25]
    res = []
    for i, c in enumerate(out):
        nxt = out[i + 1][0][2] - .06 if i + 1 < len(out) else seg.VOICE_END + .25
        end = min(nxt - .01, c[-1][3] + .6)
        end = min([end] + [x - .001 for x in CUTS if x > c[0][2] + .01])
        res.append({'a': round(max(0, c[0][2] - .06), 3), 'e': round(end, 3), 'top': 1390 if c[0][2] < CUTS[0] else 250,
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
if os.environ.get('PLATFORM') == 'tiktok':                         # TikTok has no related-video link: name the place instead of an arrow (Producer, 2026-10-19: pointing to YouTube is fine)
    out = out.replace('>FULL EPISODE ↓<', '>FULL EPISODE ON YOUTUBE<')
out = out.replace('/*ART*/', (HERE / 'short/assets/art_info.json').read_text())
(HERE / 'short/index.html').write_text(out)
print('wrote short/index.html', len(out), 'bytes; RES', RES, '; DUR', T['DUR'], '; voice end', T['VEND'])
