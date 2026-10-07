#!/usr/bin/env python3
"""EP002 Spanish dub, step 2: schedule every Spanish line against the English line it replaces.

  python3 scripts/ep002-es-schedule.py   # -> audio/bram/ep002_es/schedule.json  {lid: {at, tempo, ...}} (narration seconds)

Each Spanish line is placed where its English line starts (narration timeline, docs: episodes/ep002/timings.json),
keeping Bram's natural pause before it (0.10-0.22 s). Spanish runs ~10 % longer, so a line may start up to LEAD s
before its English line (in the pause) and end up to MAXLAG s after; where that is not enough the lines just before
are sped up a little, locally (tempo <= CAP, pitch kept), never the whole block. A block never runs into the next.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
L = json.loads((ROOT / 'audio/bram/ep002_es/lines.json').read_text())
C = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())['cues']
P = json.loads((ROOT / 'audio/bram/ep002/NARRATION_PLAN.json').read_text())['blocks']
LEAD, MAXLAG, CAP, STEP, WIN = .6, 1.2, 1.15, .01, 10
# lines a picture lands on (the three anchors, "You.", "So, why?", the wordmark, title beats): tighter sync
KEY = {'l04': .4, 'l05': .4, 'l06': .4, 'l08': .35, 'l10': .35, 'l131': .4, 'l132': .4, 'l138': .4, 'l154': .5}


def simulate(lines, r):
    out, prev_end, pte = [], -1e9, None
    for lid in lines:
        T = C[lid]['start']; d = (L[lid]['end'] - L[lid]['start']) / r[lid]
        nat = (L[lid]['start'] - L[pte]['end']) if pte else 0
        s = max(T - LEAD, prev_end + max(.10, min(nat, .22)))
        out.append((lid, s, s + d)); prev_end, pte = s + d, lid
    return out


def main():
    sched = {}
    for bi, b in enumerate(P):
        lines = b['lines']
        nxt = C[P[bi + 1]['lines'][0]]['start'] - .15 if bi + 1 < len(P) else 1e9
        r = {lid: 1.0 for lid in lines}
        for _ in range(4000):
            s = simulate(lines, r)
            bad = next((i for i, (lid, st, en) in enumerate(s) if st - C[lid]['start'] > KEY.get(lid, MAXLAG)), None)
            if bad is None and s[-1][2] <= nxt:
                break
            i = bad if bad is not None else len(s) - 1
            win = [lid for lid in lines[max(0, i - WIN):i + 1] if r[lid] < CAP]
            if not win:
                raise SystemExit(f'{b["id"]}: cannot fit near {lines[i]} even at tempo {CAP}')
            for lid in win:
                r[lid] = min(CAP, r[lid] + STEP)
        for lid, st, en in simulate(lines, r):
            sched[lid] = {'block': b['id'], 'at': round(st, 3), 'end': round(en, 3), 'tempo': round(r[lid], 3),
                          'lag': round(st - C[lid]['start'], 3), 'en_start': C[lid]['start']}
    (ROOT / 'audio/bram/ep002_es/schedule.json').write_text(json.dumps(sched, indent=1))
    tem = [v['tempo'] for v in sched.values()]
    print(f'{len(sched)} lines · tempo 1.00: {sum(t == 1 for t in tem)} · max tempo {max(tem):.2f} · mean {sum(tem) / len(tem):.3f}'
          f' · max lag {max(v["lag"] for v in sched.values()):.2f} s · max lead {-min(v["lag"] for v in sched.values()):.2f} s')


if __name__ == '__main__':
    main()
