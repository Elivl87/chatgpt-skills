"""EP003 blocks for Hyperframes: line ranges, time spans on the current narration, project dirs.
Block A is the hook project (`hook/`): its reused shots are authored on narration v2 (timings_v2.json, v3.2 line ids)
and warped onto the current narration; since script v3.3 (2026-10-17) the hook's new beats (group chat, H8) are
authored directly on the current narration (h-tokens). B..G are authored directly on the current timings with word
tokens relative to the block start.
Line ids (script v3.3): h01-h10 = the hook, b01-b03 = block B up to the reorder, l12-l52 = the v3.2 ids, unchanged."""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
FIRST = {'A': 'h01', 'B': 'b01', 'C': 'l12', 'D': 'l21', 'E': 'l27', 'F': 'l36', 'G': 'l44'}
ORDER = list(FIRST)
HOOK_LAST = 'h10'                                          # "So, why?": the wordmark line (+ its 1.5 s of silence)


def cues():
    return json.loads((ROOT / 'episodes/ep003/timings.json').read_text())['cues']


def span(b):
    c = cues()
    t0 = 0.0 if b == 'A' else c[FIRST[b]]['start'] - .05
    i = ORDER.index(b)
    t1 = c[FIRST[ORDER[i + 1]]]['start'] - .05 if i + 1 < len(ORDER) else c['l52']['end'] + 2.5
    return round(t0, 3), round(t1, 3)


def pdir(b):
    return HERE / ('hook' if b == 'A' else f'block{b}')


def table(cs):
    """word-time table: {key: s} for 'l05', 'l05.end', 'l05.w3', 'l05.w3.end'"""
    t = {}
    for k, c in cs.items():
        t[k] = c['start']; t[k + '.end'] = c['end']
        for i, w in enumerate(c['words']):
            t[f'{k}.w{i + 1}'] = w['start']; t[f'{k}.w{i + 1}.end'] = w['end']
    return t


# the hook's reused shots: v2 (authoring) line -> v3.3 line, word offset, how many words
HOOK_MAP = [('l01', 'h01', 0, 16), ('l02', 'h02', 0, 7), ('l03', 'h03', 0, 8), ('l04', 'h04', 0, 5),
            ('l05', 'h09', 0, 11), ('l06', 'h09', 11, 1), ('l07', 'h10', 0, 2)]
CHAT_IN = .12                                              # the chat cuts in this long before "A message"
H8_IN = .10                                                # the H8 boat shot cuts in this long before "Getting"


def hook_anchors():
    """(authored v2 s, narration s) anchors of the hook warp, strictly increasing on both sides.
    - word anchors on every reused word (HOOK_MAP);
    - after "face." the old inserts (fish money, scope) are skipped: 1:1 for 0.54 s, then a 1 ms jump to the price cut;
    - after "dollars." the world holds behind the group chat (authored 17.30 -> A8) while the chat plays in narration time;
    - A8 .. "Millions" (v2 25.95) is the H8 boat shot, 1:1 with the narration (authored with A8(n) in the template);
    - DUR (v2: end of l07 + 1.5) -> the end of the hook span (block B's start)."""
    A = table(json.loads((ROOT / 'episodes/ep003/timings_v2.json').read_text())['cues'])
    c = cues(); N = table(c)
    pairs = []
    for a, n, off, k in HOOK_MAP:
        for i in range(1, k + 1):
            for sfx in ('', '.end'):
                pairs.append((A[f'{a}.w{i}{sfx}'], N[f'{n}.w{i + off}{sfx}']))
    face_a, face_n = A['l03.w8.end'], N['h03.w8.end']
    cut_n = N['h04.w1'] - .06                                       # the price shot cuts in just before "It"
    pairs += [(face_a + (cut_n - face_n), cut_n), (15.82, cut_n + .001)]
    chat_n = N['h05.w1'] - CHAT_IN
    n8 = N['h08.w1'] - H8_IN
    a8 = A['l05.w1'] - (N['h09.w1'] - n8)
    pairs += [(17.30, chat_n), (a8, n8)]
    a_dur, n_dur = round(A['l07.end'] + 1.5, 3), span('A')[1]
    anc = [(0.0, 0.0)]
    for a, n in sorted(pairs):
        if a > anc[-1][0] + .0005 and n > anc[-1][1] + .0005 and a < a_dur:
            anc.append((round(a, 4), round(n, 4)))
    anc.append((a_dur, n_dur))
    return anc, A, N, {'A8': round(a8, 4), 'N8': round(n8, 4), 'NCHAT': round(chat_n, 4), 'ADUR': a_dur, 'NDUR': n_dur}


def warp(anc, t):
    for (a0, n0), (a1, n1) in zip(anc, anc[1:]):
        if t <= a1:
            return n0 + (t - a0) * (n1 - n0) / (a1 - a0)
    return t - anc[-1][0] + anc[-1][1]
