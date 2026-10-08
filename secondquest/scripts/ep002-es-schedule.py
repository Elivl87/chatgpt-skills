#!/usr/bin/env python3
"""EP002 Spanish dub, step 2 (v3): schedule the silence-cut segments against the English lines.

  python3 scripts/ep002-es-schedule.py   # -> audio/bram/ep002_es/schedule.json

v2 sped whole stretches up (1:31-2:38 at 1.108) and the stretch was heard as an echo or a doubled voice (Producer,
2026-10-07: "desde el 1:30 se escucha como doble o con eco"). v3 works on each segment's speech (its core, from the
first to the last sound) and makes room in this order:
  1. the pauses Bram leaves between lines are shortened, never below MINGAP nor below SHRINK of their length;
  2. a line may start up to MAXLAG after its English line (KEY lines, tied to something on screen, less);
  3. only then is speech sped up, locally, by at most CAP (rubberband R3 in the mix, the cleanest stretch we have).
A segment's speech starts LEAD before its anchor line in English. The whole track is planned backwards first, so a
line can start earlier (never more than LEADMAX) when the lines after it need the room. Speech never overlaps, and
there is always at least the shortened pause between two segments, across blocks too.
"""
import json
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/bram/ep002_es'
SEG = json.loads((D / 'segments.json').read_text())
C = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())['cues']
P = json.loads((ROOT / 'audio/bram/ep002/NARRATION_PLAN.json').read_text())['blocks']
sp = spec_from_file_location('lines', ROOT / 'scripts/ep002-es-lines.py'); L = module_from_spec(sp); sp.loader.exec_module(L)
LEAD, LEADMAX, MAXLAG, CAP, STEP, WIN, END = .1, 2.5, 1.5, 1.08, .005, 8, 412.2
MINGAP, SHRINK, XGAP = .26, .6, .35          # shortest pause, kept share of a pause, pause between takes
CORE_DB, PRE, POST = -42, .03, .07           # speech core: first/last frame above CORE_DB (rel. to the take), padded
KEY = {'l04': .4, 'l05': .4, 'l06': .4, 'l08': .35, 'l10': .35, 'l131': .45, 'l132': .45, 'l138': .45, 'l154': .55}


def cores():
    """Each segment's speech core (on, off) inside its take, and its lines' onsets measured from `on`."""
    cache = {}
    for s in SEG:
        t = s['take'][:-4]
        if t not in cache:
            cache[t] = L.energy_db(L.load(D / s['take']))
        db = cache[t]
        a, b = int(s['start'] / L.HOP), int(s['end'] / L.HOP)
        loud = [i for i in range(a, b) if db[i] > CORE_DB]
        s['on'] = round(max(s['start'], loud[0] * L.HOP - PRE), 4)
        s['off'] = round(min(s['end'], (loud[-1] + 1) * L.HOP + POST), 4)
        first, _ = L.first_word_times(t, s['lines'])
        s['onsets'] = {lid: max(0.0, first[lid] - s['on']) for lid in s['lines'] if lid in first}
    for p, s in zip(SEG, SEG[1:]):
        nat = s['on'] - p['off'] if p['take'] == s['take'] and abs(p['end'] - s['start']) < 1e-6 else None
        s['gmin'] = XGAP if nat is None else min(nat, max(MINGAP, SHRINK * nat))
        s['gnat'] = nat
    SEG[0]['gmin'] = SEG[0]['gnat'] = 0.0


def place(r):
    """Core starts for tempos r: on time where possible, earlier when later lines need the room (planned backwards),
    never earlier than LEADMAX nor later than MAXLAG. Returns (starts, first segment that cannot fit or None)."""
    n = len(SEG); dur = [(s['off'] - s['on']) / r[i] for i, s in enumerate(SEG)]
    on = lambda i, l: SEG[i]['onsets'][l] / r[i]
    cap = [min(C[l]['start'] + KEY.get(l, MAXLAG) - on(i, l) for l in SEG[i]['onsets']) for i in range(n)]
    latest = [0.0] * n; latest[-1] = min(cap[-1], END - dur[-1])
    origin = list(range(n))                                         # the segment whose deadline binds segment i
    for i in range(n - 2, -1, -1):
        chain = latest[i + 1] - SEG[i + 1]['gmin'] - dur[i]
        latest[i], origin[i] = (cap[i], i) if cap[i] <= chain else (chain, origin[i + 1])
    cs, prev, pushed = [], -1e9, []
    for i, s in enumerate(SEG):
        a = s['anchor']
        want = C[a]['start'] - LEAD - on(i, a)
        if set(s['lines']) & L.KEEP_WITH_PREVIOUS:                  # one breath over several lines: centre it on them
            want = sum(C[l]['start'] - on(i, l) for l in s['onsets']) / len(s['onsets']) - LEAD
        lo = max(C[a]['start'] - LEADMAX - on(i, a), 0.05)  # never before the episode starts
        x = max(prev + s['gmin'], lo, min(want, latest[i]))
        pushed.append(prev + s['gmin'] >= max(lo, min(want, latest[i])))   # placed right after the previous one
        if x > latest[i] + 1e-6:
            k = i                                                   # speeding up helps from the first segment of the
            while k > 0 and pushed[k]:                              # run that pushes this one to the last deadline
                k -= 1
            return cs, (k, origin[i])
        cs.append(x); prev = x + dur[i]
    return cs, None


def main():
    cores()
    r = [1.0] * len(SEG)
    for _ in range(20000):
        cs, bad = place(r)
        if bad is None:
            break
        i, j = bad                                                  # speed up the whole chain that is too long
        win = [k for k in range(i, j + 1) if r[k] < CAP]
        if not win:
            raise SystemExit(f'cannot fit {SEG[i]["anchor"]}..{SEG[j]["anchor"]} at tempo {CAP}')
        for k in win:
            r[k] = round(min(CAP, r[k] + STEP), 3)
    sched = []
    for s, rk, c in zip(SEG, r, cs):
        lags = {l: round(c + o / rk - C[l]['start'], 3) for l, o in s['onsets'].items()}
        sched.append({k: s[k] for k in ('take', 'start', 'end', 'on', 'off', 'lines', 'anchor', 'block', 'gnat', 'gmin')} |
                     {'cs': round(c, 4), 'ce': round(c + (s['off'] - s['on']) / rk, 4), 'tempo': rk, 'lags': lags})
    (D / 'schedule.json').write_text(json.dumps(sched, ensure_ascii=False, indent=1))
    t = [s['tempo'] for s in sched]; lag = [v for s in sched for v in s['lags'].values()]
    print(f'{len(sched)} segments · untouched {sum(x == 1 for x in t)} · max tempo {max(t):.3f} · max lag {max(lag):.2f} s · max lead {-min(lag):.2f} s')


if __name__ == '__main__':
    main()
