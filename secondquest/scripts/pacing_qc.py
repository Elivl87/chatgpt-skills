#!/usr/bin/env python3
"""Pacing QC: compare an episode's measurements (scripts/style_bible.py) with the channel's style bible targets
(docs/style/STYLE_BIBLE.md, measured on EP001/EP002). Reports PASS/FLAG; it never changes anything.

  python3 scripts/pacing_qc.py docs/style/EP003_v3.json
"""
import json, sys

TARGETS = {                       # from EP002 final (412 s) and the EP001 hook; see docs/style/STYLE_BIBLE.md
    'cuts_per_min': ('>=', 12.0),
    'avg_shot_s': ('<=', 5.0),
    'longest_shot_s': ('<=', 25.0),
    'motion_share': ('>=', 0.50),
    'still_2s_per_min': ('<=', 6.0),
    'wpm_overall': ('between', (135, 165)),
}


def main():
    R = json.load(open(sys.argv[1]))
    R['still_2s_per_min'] = round(R['still_2s_runs'] / R['duration_s'] * 60, 1)
    bad = 0
    for k, (op, v) in TARGETS.items():
        x = R.get(k)
        if x is None:
            continue
        ok = x >= v if op == '>=' else x <= v if op == '<=' else v[0] <= x <= v[1]
        bad += not ok
        print(f"{'PASS' if ok else 'FLAG'}  {k:18s} {x!s:>8}   target {op} {v}")
    print('\n' + ('all within the style bible' if not bad else f'{bad} flag(s): see docs/style/STYLE_BIBLE.md for what to change'))


if __name__ == '__main__':
    main()
