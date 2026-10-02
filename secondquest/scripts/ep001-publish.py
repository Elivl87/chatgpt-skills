#!/usr/bin/env python3
"""Build the EP001 YouTube publishing files from the approved script and the Bram line timings.

  python3 scripts/ep001-publish.py

Inputs:  episodes/ep001full/{script,timings}.json, docs/publish/EP001/script_es.json
Outputs: docs/publish/EP001/
  EP001_subtitles_en.srt   English captions (the narration, verbatim)
  EP001_subtitles_es.srt   Spanish captions (same timings)
  EP001_chapters.txt       YouTube chapters (one per act)
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'docs/publish/EP001'
MAX_LINE = 42          # characters per caption line
MAX_LINES = 2
MIN_SHOW = 1.0         # seconds a caption stays up, if the next line allows it
HOLD = 0.6             # extra time after the last word, if the next line allows it

# act title per chapter (English, as shown in the YouTube description)
CHAPTERS = {
    'l01': 'Intro: a game about… work?',
    'l20': 'A very strange fantasy',
    'l35': 'Everything has a purpose',
    'l63': 'The loop',
    'l84': 'Chores are fun (somehow)',
    'l104': 'Control',
    'l127': 'The machines',
    'l148': 'The farm becomes yours',
    'l166': 'Why slow can feel good',
    'l192': 'Why not farm for real?',
    'l211': 'The real reason',
    'l241': 'Your next quest',
}


def ts(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'


def wrap(words):
    """Greedy wrap into lines of at most MAX_LINE characters."""
    lines, cur = [], ''
    for w in words:
        if cur and len(cur) + 1 + len(w) > MAX_LINE:
            lines.append(cur); cur = w
        else:
            cur = f'{cur} {w}' if cur else w
    if cur: lines.append(cur)
    return lines


def chunks(text):
    """Split one script line into captions of at most MAX_LINES wrapped lines."""
    lines = wrap(text.split())
    return ['\n'.join(lines[i:i + MAX_LINES]) for i in range(0, len(lines), MAX_LINES)]


def build_srt(order, texts, cues):
    out, n = [], 0
    for i, lid in enumerate(order):
        start, end = cues[lid]['start'], cues[lid]['end']
        nxt = cues[order[i + 1]]['start'] - 0.05 if i + 1 < len(order) else end + 2
        end = min(max(end + HOLD, start + MIN_SHOW), max(end, nxt))
        parts = chunks(texts[lid])
        total = sum(len(p) for p in parts)
        t = start
        for p in parts:  # time split in proportion to characters
            d = (end - start) * len(p) / total
            n += 1
            out.append(f'{n}\n{ts(t)} --> {ts(t + d)}\n{p}\n')
            t += d
    return '\n'.join(out)


def main():
    script = json.loads((ROOT / 'episodes/ep001full/script.json').read_text())
    cues = json.loads((ROOT / 'episodes/ep001full/timings.json').read_text())['cues']
    es = json.loads((OUT / 'script_es.json').read_text())['lines']
    order = [l['id'] for l in script['lines']]
    en = {l['id']: l['text'] for l in script['lines']}
    missing = [k for k in order if k not in es]
    if missing:
        raise SystemExit(f'SPANISH_LINES_MISSING: {missing}')
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'EP001_subtitles_en.srt').write_text(build_srt(order, en, cues), encoding='utf-8')
    (OUT / 'EP001_subtitles_es.srt').write_text(build_srt(order, es, cues), encoding='utf-8')
    rows = []
    for lid, title in CHAPTERS.items():
        t = 0 if lid == 'l01' else max(0, cues[lid]['start'] - 0.5)
        m, s = divmod(int(t), 60)
        rows.append(f'{m}:{s:02d} {title}')
    (OUT / 'EP001_chapters.txt').write_text('\n'.join(rows) + '\n', encoding='utf-8')
    print('\n'.join(rows))


if __name__ == '__main__':
    main()
