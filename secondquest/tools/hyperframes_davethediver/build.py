#!/usr/bin/env python3
"""Assemble block<X>/index.html from src/block<X>.template.html: inline the registry components it names and resolve
the word-time tokens, block-relative. {{p03.w2}} = start of word 2 of line p03 (1-based), {{p03.w2.end}}, {{p03}} =
line start, {{p03.end}}, {{DUR}} = block length; plain arithmetic is allowed ({{p03.w2-0.4}})."""
from pathlib import Path
import json, re, shutil, sys
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
from blocks import span, pdir, table, cues  # noqa
TOK = re.compile(r'p\d\d(?:\.w\d+)?(?:\.end)?|DUR')


def resolve(m):
    expr = TOK.sub(lambda k: repr(A[k.group(0)]), m.group(1))
    if not re.fullmatch(r'[\d.+\-* ()/]+', expr):
        raise ValueError('bad time token ' + m.group(0))
    return str(round(eval(expr), 3))


BLOCK = sys.argv[sys.argv.index('--block') + 1] if '--block' in sys.argv else 'A'
T0, T1 = span(BLOCK)
A = {k: v - T0 for k, v in table(cues()).items()}
A['DUR'] = round(T1 - T0, 3)
proj = pdir(BLOCK)
if not (proj / 'hyperframes.json').exists():             # a new project from the skeleton
    proj.mkdir(exist_ok=True)
    for f in ('hyperframes.json', 'package.json', 'AGENTS.md', 'CLAUDE.md'):
        if (HERE / 'hook' / f).exists():
            shutil.copy2(HERE / 'hook' / f, proj / f)
    (proj / 'meta.json').write_text(json.dumps({'id': f'block{BLOCK}', 'name': f'block{BLOCK}'}))
    shutil.copytree(HERE / 'hook/compositions', proj / 'compositions', dirs_exist_ok=True)
SRC, OUTF, COMP = HERE / f'src/block{BLOCK}.template.html', proj / 'index.html', proj / 'compositions/components'
src = SRC.read_text()
out = re.sub(r'<!--INCLUDE ([\w.-]+)-->', lambda m: (COMP / m.group(1)).read_text(), src)
out = re.sub(r'<!--SRC ([\w.-]+)-->', lambda m: (HERE / 'src/components' / m.group(1)).read_text(), out)
out = re.sub(r'\{\{([^}]+)\}\}', resolve, out)
assert 'window.__timelines["main"] = tl;' in out
OUTF.write_text(out)
print('wrote', OUTF.relative_to(HERE), len(out), 'bytes; DUR', A['DUR'])
