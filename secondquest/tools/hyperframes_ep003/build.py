#!/usr/bin/env python3
"""Assemble hook/index.html from src/index.template.html: inline the registry components it names and resolve the
word-time tokens. {{l07.w2}} = start of word 2 of line l07 (1-based, like lib.T), {{l07.end}}, {{l07}} = line start,
{{DUR}} = end of l07 + 1.5 s; plain arithmetic is allowed ({{l07.w2-0.4}}).

A new narration re-times everything: the choreography is authored on AUTHORED_ON (the timings the template was
written against); the current narration (timings.json) is mapped onto it by a piecewise-linear warp anchored on every
word start, so each move stays on its word. GSAP: a master timeline plays the authored timeline segment by segment;
the clips' data-start/data-duration are mapped the same way."""
from pathlib import Path
import json, re, shutil, sys
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
EP = ROOT / 'episodes/ep003'
AUTHORED_ON = 'timings_v2.json'          # the hook choreography was written on narration v2
LINES = [f'l0{i}' for i in range(1, 9)]


def table(cues):
    T = {}
    for k, c in cues.items():
        T[k] = c['start']; T[k + '.end'] = c['end']
        for i, w in enumerate(c['words']):
            T[f'{k}.w{i + 1}'] = w['start']; T[f'{k}.w{i + 1}.end'] = w['end']
    T['DUR'] = round(cues['l07']['end'] + 1.5, 3)
    return T


A = table(json.loads((EP / AUTHORED_ON).read_text())['cues'])
N = table(json.loads((EP / 'timings.json').read_text())['cues'])
# warp anchors: every word start (and line end) present in both, kept strictly increasing on both sides
keys = sorted((k for k in A if k in N and k.split('.')[0] in LINES and k != 'DUR'), key=lambda k: A[k])
anc = [(0.0, 0.0)]
for k in keys:
    a, n = A[k], N[k]
    if a > anc[-1][0] + .02 and n > anc[-1][1] + .02 and a <= A['DUR']:
        anc.append((a, n))
anc.append((A['DUR'], N['DUR']))


def warp(t):
    for (a0, n0), (a1, n1) in zip(anc, anc[1:]):
        if t <= a1:
            return n0 + (t - a0) * (n1 - n0) / (a1 - a0)
    return t - anc[-1][0] + anc[-1][1]


def resolve(m):
    expr = re.sub(r'l\d\d(?:\.w\d+)?(?:\.end)?|DUR|T0', lambda k: repr(A[k.group(0)]), m.group(1))
    if not re.fullmatch(r'[\d.+\-* ()/]+', expr):
        raise ValueError('bad time token ' + m.group(0))
    return str(round(eval(expr), 3))


def clip(m):
    s, d = float(m.group(1)), float(m.group(2))
    s2 = warp(s)
    return f'data-start="{round(s2, 3)}" data-duration="{round(warp(s + d) - s2, 3)}"'


BLOCK = sys.argv[sys.argv.index('--block') + 1] if '--block' in sys.argv else 'A'
if BLOCK != 'A':                                         # B..G: authored on the current narration, block-relative
    sys.path.insert(0, str(HERE))
    from blocks import span, pdir
    T0, T1 = span(BLOCK)
    A = {k: v - T0 for k, v in N.items()}
    A['DUR'] = round(T1 - T0, 3); A['T0'] = 0.0
    anc = [(0.0, 0.0), (A['DUR'], A['DUR'])]
    proj = pdir(BLOCK)
    if not (proj / 'hyperframes.json').exists():         # a new project from the hook's skeleton
        proj.mkdir(exist_ok=True)
        for f in ('hyperframes.json', 'package.json', 'AGENTS.md', 'CLAUDE.md'):
            if (HERE / 'hook' / f).exists():
                shutil.copy2(HERE / 'hook' / f, proj / f)
        (proj / 'meta.json').write_text(json.dumps({'id': f'block{BLOCK}', 'name': f'block{BLOCK}'}))
        shutil.copytree(HERE / 'hook/compositions', proj / 'compositions', dirs_exist_ok=True)
    SRC, OUTF, COMP = HERE / f'src/block{BLOCK}.template.html', proj / 'index.html', proj / 'compositions/components'
else:
    SRC, OUTF, COMP = HERE / 'src/index.template.html', HERE / 'hook/index.html', HERE / 'hook/compositions/components'
src = SRC.read_text()
out = re.sub(r'<!--INCLUDE ([\w.-]+)-->', lambda m: (COMP / m.group(1)).read_text(), src)
out = re.sub(r'<!--SRC ([\w.-]+)-->', lambda m: (HERE / 'src/components' / m.group(1)).read_text(), out)   # shared src components (lakeplate.js)
out = re.sub(r'\{\{([^}]+)\}\}', resolve, out)
out = re.sub(r'data-start="([\d.]+)" data-duration="([\d.]+)"', clip, out)
master = ('const WARP = ' + json.dumps([[round(a, 3), round(n, 3)] for a, n in anc]) + ';\n'
          '      const master = gsap.timeline({ paused: true });                  // authored time -> narration time\n'
          '      for (let i = 0; i + 1 < WARP.length; i++) master.add(tl.tweenFromTo(WARP[i][0], WARP[i + 1][0], '
          '{ duration: WARP[i + 1][1] - WARP[i][1], ease: "none", immediateRender: false }), WARP[i][1]);\n'
          '      window.__timelines["main"] = master;')
assert 'window.__timelines["main"] = tl;' in out
if BLOCK == 'A':
    out = out.replace('window.__timelines["main"] = tl;', master)
OUTF.write_text(out)
print('wrote', OUTF.relative_to(HERE), len(out), 'bytes; authored DUR', A['DUR'], '-> narration DUR', anc[-1][1], ';', len(anc), 'warp anchors')
