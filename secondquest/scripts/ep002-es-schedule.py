#!/usr/bin/env python3
"""EP002 Spanish dub, step 2 (v2): schedule the silence-cut segments against the English lines.

  python3 scripts/ep002-es-schedule.py   # -> audio/bram/ep002_es/schedule.json

A segment's speech starts where its first (anchor) line starts in English, up to LEAD s earlier (inside the pause)
or MAXLAG s later. Segments never overlap: one starts at the earliest when the previous one has ended (each already
holds half of the pauses around it, so the natural breathing is kept). Where Spanish is too long, the segments just
before are sped up locally (TEMPO <= CAP, pitch and timbre kept). A block never runs into the next block.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/bram/ep002_es'
SEG = json.loads((D / 'segments.json').read_text())
C = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())['cues']
P = json.loads((ROOT / 'audio/bram/ep002/NARRATION_PLAN.json').read_text())['blocks']
LEAD, MAXLAG, CAP, STEP, WIN = .6, 1.2, 1.15, .01, 5
KEY = {'l04': .4, 'l05': .4, 'l06': .4, 'l08': .35, 'l10': .35, 'l131': .45, 'l132': .45, 'l138': .45, 'l154': .55}


def onsets(seg):
    """Seconds from the segment's start to where each of its lines' speech begins (from the STT words)."""
    from importlib.util import spec_from_file_location, module_from_spec
    sp = spec_from_file_location('lines', ROOT / 'scripts/ep002-es-lines.py'); m = module_from_spec(sp); sp.loader.exec_module(m)
    first, _ = m.first_word_times(seg['take'][:-4], seg['lines'])
    return {lid: max(0.0, first[lid] - seg['start']) for lid in seg['lines'] if lid in first}


def simulate(segs, r, ons, prev_end=-1e9):
    out = []
    for i, s in enumerate(segs):
        o = ons[i][s['anchor']] / r[i]
        d = (s['end'] - s['start']) / r[i]
        st = max(C[s['anchor']]['start'] - LEAD - o, prev_end)
        lags = {lid: st + ons[i][lid] / r[i] - C[lid]['start'] for lid in ons[i]}
        out.append((st, st + d, lags)); prev_end = st + d
    return out


def main():
    sched, carry = [], -1e9                                         # the previous block's end: blocks never overlap either
    for bi, b in enumerate(P):
        segs = [s for s in SEG if s['block'] == b['id']]
        ons = [onsets(s) for s in segs]
        nxt = C[P[bi + 1]['lines'][0]]['start'] - .2 if bi + 1 < len(P) else 1e9
        # where the whole Spanish block is longer than the English one, start from an even tempo over the block
        # (a steady, barely audible speed-up beats a few rushed lines), then bump locally where still late
        span = nxt - (C[segs[0]['anchor']]['start'] - LEAD)
        base = round(min(CAP, max(1.0, sum(s['end'] - s['start'] for s in segs) / span)), 3)
        r = [base] * len(segs)
        for _ in range(5000):
            sim = simulate(segs, r, ons, carry)
            bad = next((i for i, (st, en, lags) in enumerate(sim) if any(v > KEY.get(l, MAXLAG) for l, v in lags.items())), None)
            if bad is None and sim[-1][1] <= nxt:
                break
            i = bad if bad is not None else len(segs) - 1
            win = [k for k in range(max(0, i - WIN), i + 1) if r[k] < CAP]
            if not win:
                raise SystemExit(f'{b["id"]}: cannot fit near {segs[i]["anchor"]} at tempo {CAP}')
            for k in win:
                r[k] = round(min(CAP, r[k] + STEP), 3)
        for s, rk, (st, en, lags) in zip(segs, r, simulate(segs, r, ons, carry)):
            sched.append(dict(s, at=round(st, 4), until=round(en, 4), tempo=rk, lags={k: round(v, 3) for k, v in lags.items()}))
        carry = sched[-1]['until']
    (D / 'schedule.json').write_text(json.dumps(sched, ensure_ascii=False, indent=1))
    t = [s['tempo'] for s in sched]; lag = [v for s in sched for v in s['lags'].values()]
    print(f'{len(sched)} segments · untouched {sum(x == 1 for x in t)} · max tempo {max(t):.2f} · max lag {max(lag):.2f} s · max lead {-min(lag):.2f} s')


if __name__ == '__main__':
    main()
