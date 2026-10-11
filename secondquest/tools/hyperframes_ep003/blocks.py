"""EP003 blocks for Hyperframes: line ranges, time spans on the current narration, project dirs.
Block A is the hook project (`hook/`, authored on narration v2 and warped); B..G are authored directly on the
current timings with word tokens relative to the block start."""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
FIRST = {'A': 'l01', 'B': 'l08', 'C': 'l12', 'D': 'l21', 'E': 'l27', 'F': 'l36', 'G': 'l44'}
ORDER = list(FIRST)


def cues():
    return json.loads((ROOT / 'episodes/ep003/timings.json').read_text())['cues']


def span(b):
    c = cues()
    t0 = 0.0 if b == 'A' else c[FIRST[b]]['start'] - .05
    i = ORDER.index(b)
    t1 = (c['l07']['end'] + 1.5) if b == 'A' else (c[FIRST[ORDER[i + 1]]]['start'] - .05 if i + 1 < len(ORDER) else c['l52']['end'] + 2.5)
    return round(t0, 3), round(t1, 3)


def pdir(b):
    return HERE / ('hook' if b == 'A' else f'block{b}')
