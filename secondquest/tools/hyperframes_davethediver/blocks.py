"""Dave the Diver blocks for Hyperframes: line ranges, time spans on the current narration, project dirs.
Every block (A included) is authored directly on episodes/davethediver/timings.json with word tokens relative to the
block start ({{p03.w5}}). hook/ is only the project skeleton new block dirs are copied from."""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
EP = 'davethediver'
FIRST = {'A': 'p01', 'B': 'p09'}                           # extend as blocks are built (SHOT_PLAN block tables)
ORDER = list(FIRST)
HOOK_LAST = 'p08'                                          # "So, why?": the wordmark line (+ its 1.5 s of silence)


def cues():
    return json.loads((ROOT / f'episodes/{EP}/timings.json').read_text())['cues']


def span(b):
    c = cues()
    t0 = 0.0 if b == 'A' else c[FIRST[b]]['start'] - .05
    i = ORDER.index(b)
    t1 = c[FIRST[ORDER[i + 1]]]['start'] - .05 if i + 1 < len(ORDER) else list(c.values())[-1]['end'] + 2.5
    return round(t0, 3), round(t1, 3)


def pdir(b):
    return HERE / f'block{b}'


def table(cs):
    """word-time table: {key: s} for 'p05', 'p05.end', 'p05.w3', 'p05.w3.end'"""
    t = {}
    for k, c in cs.items():
        t[k] = c['start']; t[k + '.end'] = c['end']
        for i, w in enumerate(c['words']):
            t[f'{k}.w{i + 1}'] = w['start']; t[f'{k}.w{i + 1}.end'] = w['end']
    return t
