#!/usr/bin/env python3
"""Build an episode's YouTube publishing files (any episode; replaces per-episode generators).

  python3 scripts/publish.py EP002            # group id from shared/originality.json
  npm run publish -- EP002

Inputs:
  episodes/<cut>/{script,timings}.json      approved script (verbatim) + Bram timings (with words)
  docs/publish/<EP>/chapters.json            optional {"l11": "The game in your head", ...};
                                             default = the script's acts, in title case
  docs/publish/<EP>/script_es.json           optional Spanish lines {"l01": "...", ...}
Outputs (docs/publish/<EP>/):
  <EP>_subtitles_en.srt  [, <EP>_subtitles_es.srt]   captions
  <EP>_chapters.txt                                  YouTube chapters

Caption rules (PUBLISHING_STANDARD §6 + Netflix English guidance): at most 2 lines of 42 characters,
at most 20 characters per second when the narration allows it, cues cut on word boundaries using the
real word timings, kept on screen a little after the last word without touching the next line.
YouTube chapter rules are checked: first at 0:00, at least 3, each at least 10 s.
The script is never edited: captions are the approved lines verbatim.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAX_LINE, MAX_LINES, MAX_CPS = 42, 2, 20
MIN_SHOW, HOLD, GAP = 0.83, 0.5, 0.05
SMALL = {'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'but', 'is', 'it'}


def ts(t, sep=','):
    ms = int(round(max(0, t) * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}'


def wrap(words):
    lines, cur = [], ''
    for w in words:
        if cur and len(cur) + 1 + len(w) > MAX_LINE:
            lines.append(cur); cur = w
        else:
            cur = f'{cur} {w}' if cur else w
    if cur:
        lines.append(cur)
    return lines


def caption_groups(words):
    """Split timed words into captions of <= 2 x 42 characters, preferring breaks after punctuation."""
    groups, cur = [], []
    for w in words:
        trial = cur + [w]
        if cur and len(wrap([x['w'] for x in trial])) > MAX_LINES:
            # move the tail back to the last punctuation if that keeps a reasonable first half
            cut = max((k for k, x in enumerate(cur) if x['w'][-1:] in ',.;:!?…—'), default=-1)
            if 2 <= cut + 1 < len(cur):
                groups.append(cur[:cut + 1]); cur = cur[cut + 1:] + [w]
            else:
                groups.append(cur); cur = [w]
        else:
            cur = trial
    if cur:
        groups.append(cur)
    return groups


def build_srt(order, cues, texts=None):
    """English uses word timings; another language (texts) reuses each line's window, split by length."""
    out, n = [], 0
    for i, lid in enumerate(order):
        c = cues[lid]
        nxt = cues[order[i + 1]]['start'] - GAP if i + 1 < len(order) else c['end'] + 3
        if texts is None and c.get('words'):
            for g in caption_groups(c['words']):
                text = '\n'.join(wrap([x['w'] for x in g]))
                start, end = g[0]['start'], g[-1]['end']
                want = max(end + HOLD, start + MIN_SHOW, start + len(text) / MAX_CPS)
                n += 1
                out.append((n, start, min(want, nxt), text))
        else:
            text = texts[lid] if texts else c['text']
            lines = wrap(text.split())
            parts = ['\n'.join(lines[k:k + MAX_LINES]) for k in range(0, len(lines), MAX_LINES)]
            total = sum(len(p) for p in parts) or 1
            t = c['start']
            span = max(c['end'] + HOLD, c['start'] + MIN_SHOW) - c['start']
            for p in parts:
                d = span * len(p) / total
                n += 1
                out.append((n, t, min(t + d, nxt), p))
                t += d
    # never overlap the next caption either
    fixed = []
    for j, (k, s, e, x) in enumerate(out):
        if j + 1 < len(out):
            e = min(e, out[j + 1][1] - 0.001)
        fixed.append(f'{k}\n{ts(s)} --> {ts(max(e, s + 0.2))}\n{x}\n')
    return '\n'.join(fixed)


def title_case(s):
    words = s.lower().split()
    return ' '.join(w if (i and w in SMALL) else w[:1].upper() + w[1:] for i, w in enumerate(words))


def main():
    group = sys.argv[1] if len(sys.argv) > 1 else sys.exit('usage: publish.py <EP group>')
    spec = json.load(open(ROOT / 'shared/originality.json'))
    g = next((x for x in spec['groups'] if x['group'] == group), None) or sys.exit(f'unknown group {group}')
    cut = g['cuts'][0]
    out = ROOT / 'docs/publish' / group
    out.mkdir(parents=True, exist_ok=True)
    script = json.load(open(ROOT / 'episodes' / cut / 'script.json'))
    cues = json.load(open(ROOT / 'episodes' / cut / 'timings.json'))['cues']
    order = [l['id'] for l in script['lines']]

    force = '--force' in sys.argv

    def write(name, text):
        # files already published/uploaded are never overwritten by accident
        p = out / name
        if p.exists() and p.read_text() != text and not force:
            sys.exit(f'{p.relative_to(ROOT)} exists and would change: re-run with --force to overwrite (published files stay as uploaded)')
        p.write_text(text)

    write(f'{group}_subtitles_en.srt', build_srt(order, cues))
    es = out / 'script_es.json'
    if es.exists():
        raw = json.load(open(es))
        lines_es = raw.get('lines', raw)
        if isinstance(lines_es, list):
            lines_es = {x['id']: x['text'] for x in lines_es}
        write(f'{group}_subtitles_es.srt', build_srt(order, cues, lines_es))

    chap_file = out / 'chapters.json'
    if chap_file.exists():
        chapters = json.load(open(chap_file))
    else:
        chapters = {a['from']: title_case(a['act'].split('—')[-1].strip()) for a in script.get('acts', [])}
    starts = sorted(((cues[lid]['start'] if i else 0.0, title) for i, (lid, title) in enumerate(sorted(chapters.items(), key=lambda kv: cues[kv[0]]['start']))))
    lines = [f'{int(t // 60)}:{int(t % 60):02d} {title}' for t, title in starts]
    write(f'{group}_chapters.txt', '\n'.join(lines) + '\n')

    problems = []
    if len(starts) < 3:
        problems.append('YouTube needs at least 3 chapters')
    for (a, ta), (b, _) in zip(starts, starts[1:] + [(json.load(open(ROOT / 'episodes' / cut / 'timings.json'))['duration'], '')]):
        if b - a < 10:
            problems.append(f'chapter "{ta}" lasts {b - a:.1f}s (< 10 s)')
    print(f'{group}: {sum(1 for _ in open(out / f"{group}_subtitles_en.srt") if "-->" in _)} English captions'
          f'{" + Spanish" if es.exists() else " (no script_es.json: Spanish captions not built)"}; {len(starts)} chapters')
    print('\n'.join(lines))
    if problems:
        print('PROBLEMS:\n  ' + '\n  '.join(problems)); sys.exit(1)


if __name__ == '__main__':
    main()
