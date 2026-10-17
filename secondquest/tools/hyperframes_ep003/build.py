#!/usr/bin/env python3
"""Assemble hook/index.html from src/index.template.html (and block<X>/index.html from src/block<X>.template.html):
inline the registry components it names and resolve the word-time tokens. {{l07.w2}} = start of word 2 of line l07
(1-based, like lib.T), {{l07.end}}, {{l07}} = line start, {{DUR}}; plain arithmetic is allowed ({{l07.w2-0.4}}).

The hook (block A) mixes two clocks (script v3.3, 2026-10-17):
- its reused shots are authored on narration v2 with the v3.2 line ids (l01-l07 tokens and plain seconds, {{DUR}} =
  end of l07 + 1.5 s): blocks.hook_anchors() maps them onto the current narration by a piecewise-linear warp anchored
  on every reused word (and skips/holds where v3.3 dropped or inserted lines). GSAP: a master timeline plays the authored
  timeline `tl` segment by segment; clips' data-start/data-duration are mapped the same way.
- its new beats are authored on the CURRENT narration: h/b tokens ({{h05.w2}}) are narration seconds, {{NDUR}} is the
  hook's narration length, {{A8}} / {{N8}} anchor the H8 boat shot (authored time = A8 + (narration time - N8)).
  The group chat runs on its own timeline `window.__tl2` (narration time, added to the master unwarped); clips on that
  clock carry `data-ntime` and are not warped."""
from pathlib import Path
import json, re, shutil, sys
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
from blocks import hook_anchors, warp as _warp, span, pdir, table  # noqa

anc, A, N, EXTRA = hook_anchors()
A = dict(A); A['DUR'] = EXTRA['ADUR']
TOK = re.compile(r'[lhb]\d\d(?:\.w\d+)?(?:\.end)?|NDUR|DUR|T0|A8|N8|NCHAT')


def warp(t):
    return _warp(anc, t)


def val(k):
    if k in EXTRA:
        return EXTRA[k]
    if k in ('DUR', 'T0') or k[0] == 'l':
        return A[k]
    return N[k]


def resolve(m):
    expr = TOK.sub(lambda k: repr(val(k.group(0))), m.group(1))
    if not re.fullmatch(r'[\d.+\-* ()/]+', expr):
        raise ValueError('bad time token ' + m.group(0))
    return str(round(eval(expr), 3))


def clip(m):
    tag = m.group(0)
    if 'data-ntime' in tag:                                   # authored on the narration clock: not warped
        return tag
    s, d = float(m.group(2)), float(m.group(3))
    s2 = warp(s)
    return tag.replace(m.group(1), f'data-start="{round(s2, 3)}" data-duration="{round(warp(s + d) - s2, 3)}"')


BLOCK = sys.argv[sys.argv.index('--block') + 1] if '--block' in sys.argv else 'A'
if BLOCK != 'A':                                         # B..G: authored on the current narration, block-relative
    sys.path.insert(0, str(HERE))
    from blocks import span, pdir
    T0, T1 = span(BLOCK)
    A = {k: v - T0 for k, v in N.items()}
    A['DUR'] = round(T1 - T0, 3); A['T0'] = 0.0
    N = A; EXTRA = {}
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
out = re.sub(r'<[^<>]*?(data-start="([\d.]+)" data-duration="([\d.]+)")[^<>]*>', clip, out)
master = ('const WARP = ' + json.dumps([[round(a, 3), round(n, 3)] for a, n in anc]) + ';\n'
          '      const master = gsap.timeline({ paused: true });                  // authored time -> narration time\n'
          '      for (let i = 0; i + 1 < WARP.length; i++) master.add(tl.tweenFromTo(WARP[i][0], WARP[i + 1][0], '
          '{ duration: WARP[i + 1][1] - WARP[i][1], ease: "none", immediateRender: false }), WARP[i][1]);\n'
          '      if (window.__tl2) { window.__tl2.paused(false); master.add(window.__tl2, 0); }   // the chat: narration time\n'
          '      window.__timelines["main"] = master;')
assert 'window.__timelines["main"] = tl;' in out
if BLOCK == 'A':
    out = out.replace('window.__timelines["main"] = tl;', master)
OUTF.write_text(out)
print('wrote', OUTF.relative_to(HERE), len(out), 'bytes; authored DUR', A['DUR'], '-> narration DUR', anc[-1][1], ';', len(anc), 'warp anchors')
