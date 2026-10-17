#!/usr/bin/env python3
"""Frame critic: an automated, independent layout gate for Hyperframes (HTML+GSAP) compositions.

It seeks the composition with the real Hyperframes runtime (scripts/qa/dom_sampler.cjs), reads the DOM box of every
visible text / image at each sample time and flags the defects the Producer keeps catching by eye
(docs/style/DESIGN_RUBRIC.md):

  GHOST_TEXT           the same words visible twice at once (echo / motion-blur copies / a duplicated layer)   error
  MOTION_BLUR_ON_TEXT  readable text marked data-hf-motion-blur (it renders as stacked ghost copies)           error
  TEXT_OVERLAP         two different text blocks overlapping                                                      error
  TEXT_OVER_HUD        text overlapping the game HUD (#hud, .hud, [data-hud], [data-role=hud])                    error
  CHAR_BADGE           a character shown only inside a round clipped badge / portrait disc                        error
  TEXT_OVER_CHARACTER  text over a character's box (check the face by eye; boxes include transparent margins)     warning
  SAFE_ZONE            text outside the platform safe area (Shorts: right rail + bottom UI; 16:9: title safe)     warning
                       (error for captions)
  TINY_TEXT            rendered glyph size below the legibility floor for the frame size                          warning
  CHAR_SMALL           the largest visible character is small in the frame (full figure should read)             warning
  CLUTTER              more than 3 separate text blocks on screen at once (one focal point per beat)              warning
  CROSSFADE_CHARACTERS two full-frame shots (plates) visible at once, one mid-fade, a character in either            error
                       (see-through people: hard-cut between character shots)
  RUNTIME              page errors while seeking                                                                  error

Characters are found by [data-role=character] or by name (pixie|quest|navi|hero|kid|char|mate...) in the img src / id.
Mark intent instead of silencing the gate: data-critic-allow-overlap (or data-layout-allow-overlap),
data-critic-allow-duplicate, data-critic-ignore (or data-layout-ignore), data-role="hud|character|caption".

Usage (source the Hyperframes env first so the browser path is set):
  source tools/hyperframes_ep002_short2/env.sh
  python3 scripts/frame_critic.py tools/hyperframes_ep002_short2/short --step 0.25 --out build/critic/short2
  python3 scripts/frame_critic.py <dir|index.html> --at 0.2,2.6,36 --lint
--at jumps straight to each time (a cold seek, like a parallel render worker): if its screenshots miss art that a
--step sweep shows, the composition has a cold-seek bug (see `hyperframes lint` gsap_cold_seek_* findings).
Writes <out>/critic.json, <out>/critic.md and annotated PNGs of every flagged sample (<out>/flag_tXX.XX.png) plus
<out>/flags_sheet.jpg. Exit code 1 when any error remains (use it as the gate before asking the Producer to look).
This is the automated half of the critic; the independent critic agent still reviews full-size frames against the
rubric (art choice, staging, physical plausibility) - see .claude/skills/secondquest-episode/SKILL.md "Critic gate".
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SAMPLER = ROOT / 'scripts/qa/dom_sampler.cjs'
CHAR_RE = re.compile(r'(pixie|quest|navi|hero|kid|child|char|mate|person|people|face|villain|princess|\bpx\d)', re.I)
SEV = {'GHOST_TEXT': 'error', 'MOTION_BLUR_ON_TEXT': 'error', 'TEXT_OVERLAP': 'error', 'TEXT_OVER_HUD': 'error',
       'CHAR_BADGE': 'error', 'RUNTIME': 'error', 'TEXT_OVER_CHARACTER': 'warning', 'SAFE_ZONE': 'warning',
       'TINY_TEXT': 'warning', 'CHAR_SMALL': 'warning', 'CLUTTER': 'warning', 'CROSSFADE_CHARACTERS': 'error'}


def area(b):
    return max(0.0, b[2] - b[0]) * max(0.0, b[3] - b[1])


def inter(a, b):
    return area([max(a[0], b[0]), max(a[1], b[1]), min(a[2], b[2]), min(a[3], b[3])])


def norm(t):
    return re.sub(r'[^a-z0-9?!]+', '', t.lower())


def is_char(e, W=None, H=None):
    if e['role'] == 'character':
        return True
    if e['role'] in ('hud', 'caption') or e['text']:
        return False
    if W and area(e['box']) > 0.5 * W * H:      # full-frame canvases/overlays (e.g. a fairy drawn on a full canvas)
        return False
    return bool(CHAR_RE.search(e['src'] or '') or CHAR_RE.search(e['sel']))


def block_of(e):
    """Text blocks: a caption's words (spans in one parent) count as one block."""
    p = e['path'].split(' > ')
    return ' > '.join(p[:-1]) if e['tag'] in ('span', 'b', 'i', 'em', 'strong') else e['path']


def safe_rect(w, h, preset):
    if preset == 'auto':
        preset = 'shorts' if h > w else 'title16x9'
    if preset == 'shorts':        # YouTube Shorts / TikTok / Reels UI: top bar, right action rail, bottom title + channel
        return [0.06 * w, 0.09 * h, 0.85 * w, 0.80 * h], preset
    if preset == 'title16x9':     # broadcast title-safe 90 %
        return [0.05 * w, 0.05 * h, 0.95 * w, 0.95 * h], preset
    return [0, 0, w, h], 'none'


def critique(data, args):
    W, H = data['width'], data['height']
    safe, preset = safe_rect(W, H, args.safe)
    min_font = args.min_font or (0.022 * H if H > W else 0.03 * H)
    char_min = args.char_min * H
    out = []

    def add(code, t, msg, boxes, key):
        out.append({'code': code, 'severity': SEV[code], 't': t, 'msg': msg, 'boxes': boxes, 'key': key})

    for e in data.get('errors', []):
        add('RUNTIME', 0, e, [], e[:60])
    for f in data['frames']:
        t = f['t']
        els = [e for e in f['els'] if not e['ignore']]
        texts = [e for e in els if e['text'] and norm(e['text'])]
        hud = [e for e in els if e['role'] == 'hud' and not e['text']]
        chars = [e for e in els if is_char(e, W, H)]
        # ghost / duplicated text
        by = defaultdict(list)
        for e in texts:
            if len(norm(e['text'])) >= 2 and not e['allowDup']:     # same words, same case: a caption saying a label's word is not a ghost
                by[re.sub(r'\s+', ' ', e['text']).strip(' .,;:')].append(e)
        for k, g0 in by.items():
            h0 = max(e['box'][3] - e['box'][1] for e in g0)
            g = [e for e in g0 if (e['box'][3] - e['box'][1]) > 0.75 * h0]      # similar glyph size only
            if len(g) < 2:
                continue
            distinct = {tuple(round(v / 4) for v in e['box']) for e in g}
            if len(distinct) >= 2 or any(e['mbCopy'] for e in g):
                add('GHOST_TEXT', t, f'"{g[0]["text"][:40]}" visible {len(g)}x at once ({sum(e["mbCopy"] for e in g)} motion-blur copies)',
                    [e['box'] for e in g], k)
        for e in texts:
            if e['mb'] and not e['mbCopy']:
                add('MOTION_BLUR_ON_TEXT', t, f'{e["sel"]} "{e["text"][:30]}" is inside data-hf-motion-blur: readable text must land sharp',
                    [e['box']], e['path'])
        primaries = [e for e in texts if not e['mbCopy']]
        # text vs text
        for i, a in enumerate(primaries):
            for b in primaries[i + 1:]:
                if norm(a['text']) == norm(b['text']) or a['allowOverlap'] or b['allowOverlap']:
                    continue
                if a['path'].startswith(b['path']) or b['path'].startswith(a['path']):
                    continue
                if block_of(a) == block_of(b) and not (a.get('xf') or b.get('xf')):
                    continue                            # words of one caption sit side by side, unless one is being moved / scaled on its own (2026-10-17)
                ov = inter(a['box'], b['box'])
                if ov > 0.10 * min(area(a['box']), area(b['box'])):
                    add('TEXT_OVERLAP', t, f'"{a["text"][:25]}" overlaps "{b["text"][:25]}"', [a['box'], b['box']],
                        a['path'] + '|' + b['path'])
        # text vs HUD / characters
        for a in primaries:
            for hb in hud:
                if not a['allowOverlap'] and inter(a['box'], hb['box']) > 0.02 * area(a['box']):
                    add('TEXT_OVER_HUD', t, f'"{a["text"][:30]}" over HUD element {hb["src"][-40:] or hb["sel"]}',
                        [a['box'], hb['box']], a['path'] + '|' + (hb['src'] or hb['sel']))
            for c in chars:
                if not a['allowOverlap'] and a['role'] != 'caption' and inter(a['box'], c['box']) > 0.25 * area(a['box']):
                    add('TEXT_OVER_CHARACTER', t, f'"{a["text"][:30]}" over character {c["src"][-40:] or c["sel"]} (check the face)',
                        [a['box'], c['box']], a['path'] + '|' + (c['src'] or c['sel']))
            outside = area(a['box']) - inter(a['box'], safe)
            if area(a['box']) and outside > 0.05 * area(a['box']):
                code = 'SAFE_ZONE'
                add(code, t, f'"{a["text"][:30]}" {100 * outside / area(a["box"]):.0f}% outside the {preset} safe area'
                    + (' (caption: treat as error)' if a['role'] == 'caption' else ''), [a['box'], safe], a['path'])
            if a['fontPx'] and a['fontPx'] < min_font and a['op'] > 0.5:
                add('TINY_TEXT', t, f'"{a["text"][:30]}" renders at {a["fontPx"]:.0f}px (< {min_font:.0f}px floor)', [a['box']], a['path'])
        # cross-dissolve between two shots while a character is in either: see-through people (Producer-rejected defect)
        sh = f.get('shots', [])
        if len(sh) >= 2 and any(.05 < x['op'] < .95 for x in sh) and any(x['ch'] for x in sh):
            add('CROSSFADE_CHARACTERS', t, 'shots ' + ', '.join(f'{x["sel"]}@{x["op"]:.2f}' + ('*' if x['ch'] else '') for x in sh)
                + ' are cross-dissolving with a character in frame (* = holds a character): use a hard cut', [], 'crossfade')
        for c in chars:
            if c['badge']:
                add('CHAR_BADGE', t, f'character {c["src"][-40:] or c["sel"]} shown inside a round badge: show the full figure when she acts or speaks',
                    [c['box']], c['src'] or c['sel'])
        full = [c for c in chars if not c['badge']]
        if full:
            big = max(full, key=lambda c: c['box'][3] - c['box'][1])
            hh = big['box'][3] - big['box'][1]
            if hh < char_min:
                add('CHAR_SMALL', t, f'largest character {big["src"][-40:] or big["sel"]} is {100 * hh / H:.0f}% of frame height '
                    f'(< {100 * args.char_min:.0f}%); fine for a wide/establishing beat, not when she acts', [big['box']], 'charsmall')
        blocks = {block_of(e) for e in primaries if e['op'] > 0.5}
        if len(blocks) > args.max_blocks:
            add('CLUTTER', t, f'{len(blocks)} text blocks on screen (max {args.max_blocks}): one focal point per beat',
                [e['box'] for e in primaries], 'clutter')
    return out, preset, min_font


def ranges(findings, step):
    """Collapse per-sample findings into (code, key) time ranges."""
    g = defaultdict(list)
    for f in findings:
        g[(f['code'], f['key'])].append(f)
    res = []
    for (code, key), fs in g.items():
        fs.sort(key=lambda f: f['t'])
        spans, cur = [], [fs[0]]
        for f in fs[1:]:
            if f['t'] - cur[-1]['t'] <= step * 1.51:
                cur.append(f)
            else:
                spans.append(cur); cur = [f]
        spans.append(cur)
        for s in spans:
            res.append({'code': code, 'severity': s[0]['severity'], 't0': s[0]['t'], 't1': s[-1]['t'], 'n': len(s),
                        'msg': s[0]['msg'], 'key': key})
    order = {'error': 0, 'warning': 1}
    return sorted(res, key=lambda r: (order[r['severity']], r['t0']))


def annotate(data, findings, outdir):
    from PIL import Image, ImageDraw
    col = {'error': (255, 40, 40), 'warning': (255, 190, 0)}
    by_t = defaultdict(list)
    for f in findings:
        by_t[f['t']].append(f)
    made = []
    for fr in data['frames']:
        if fr['t'] not in by_t or not fr.get('shot') or not os.path.exists(fr['shot']):
            continue
        im = Image.open(fr['shot']).convert('RGB'); d = ImageDraw.Draw(im)
        try:
            from PIL import ImageFont
            font = ImageFont.load_default(size=max(14, im.height // 70))
        except Exception:
            font = None
        lh = max(18, im.height // 60)
        for f in by_t[fr['t']]:
            for b in f['boxes']:
                d.rectangle(b, outline=col[f['severity']], width=4)
        y = 8
        for f in by_t[fr['t']][:8]:
            d.rectangle([0, y - 2, im.width, y + lh], fill=(0, 0, 0))
            d.text((8, y), f"{f['code']}: {f['msg'][:70]}", fill=col[f['severity']], font=font); y += lh + 4
        p = Path(outdir) / f"flag_t{fr['t']:06.2f}.png"; im.save(p); made.append(p)
    if made:
        th = [Image.open(p).convert('RGB') for p in made[:24]]
        w = 360; hs = [round(i.height * w / i.width) for i in th]; cols = 6
        rows = (len(th) + cols - 1) // cols; hmax = max(hs)
        sheet = Image.new('RGB', (cols * w, rows * hmax), (20, 20, 28))
        for i, im in enumerate(th):
            sheet.paste(im.resize((w, hs[i])), ((i % cols) * w, (i // cols) * hmax))
        sheet.save(Path(outdir) / 'flags_sheet.jpg', quality=85)
    return made


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('target', help='Hyperframes project dir (with index.html) or an html file')
    ap.add_argument('--step', type=float, default=0.25, help='sample every N seconds (default 0.25)')
    ap.add_argument('--at', help='explicit comma-separated times instead of the sweep')
    ap.add_argument('--t0', type=float, default=0.0); ap.add_argument('--t1', type=float)
    ap.add_argument('--out', default=str(ROOT / 'build/critic'))
    ap.add_argument('--safe', default='auto', choices=['auto', 'shorts', 'title16x9', 'none'])
    ap.add_argument('--min-font', type=float, default=0, help='legibility floor in px (default 2.2%% of H vertical, 3%% of H 16:9)')
    ap.add_argument('--char-min', type=float, default=0.25, help='largest character height as fraction of H (default 0.25)')
    ap.add_argument('--max-blocks', type=int, default=3)
    ap.add_argument('--no-shots', action='store_true', help='skip screenshots (faster)')
    ap.add_argument('--lint', action='store_true', help='also run `hyperframes lint --json` and include its errors')
    args = ap.parse_args()

    tgt = Path(args.target)
    html = tgt / 'index.html' if tgt.is_dir() else tgt
    src = html.read_text(errors='ignore')
    m = re.search(r'data-duration="([\d.]+)"', src)
    dur = float(m.group(1)) if m else 10.0
    if args.at:
        times = [float(x) for x in args.at.split(',')]
    else:
        t1 = args.t1 if args.t1 is not None else dur - 0.01
        n = int((t1 - args.t0) / args.step) + 1
        times = [round(args.t0 + i * args.step, 3) for i in range(n)]
    outdir = Path(args.out); outdir.mkdir(parents=True, exist_ok=True)
    raw = outdir / 'dom_samples.json'
    shots = None if args.no_shots else str(outdir / 'shots')
    cmd = ['node', str(SAMPLER), str(html), ','.join(map(str, times)), str(raw)] + ([shots] if shots else [])
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit('sampler failed (did you source the Hyperframes env.sh?):\n' + r.stderr[-2000:])
    data = json.loads(raw.read_text())
    findings, preset, min_font = critique(data, args)
    rng = ranges(findings, args.step if not args.at else 99)
    lint = None
    if args.lint:
        lr = subprocess.run(['hyperframes', 'lint', '--json', str(html.parent)], capture_output=True, text=True)
        try:
            lint = json.loads(lr.stdout)
            for f in lint.get('findings', []):
                if f.get('severity') == 'error':
                    rng.insert(0, {'code': 'LINT:' + f['code'], 'severity': 'error', 't0': 0, 't1': 0, 'n': 1,
                                   'msg': f['message'][:200], 'key': f.get('selector', '')})
        except Exception:
            lint = {'raw': lr.stdout[-2000:] + lr.stderr[-1000:]}
    made = [] if args.no_shots else annotate(data, findings, outdir)
    errs = [r_ for r_ in rng if r_['severity'] == 'error']
    report = {'target': str(html), 'mode': data['mode'], 'size': [data['width'], data['height']], 'safe_preset': preset,
              'min_font_px': round(min_font, 1), 'samples': len(times), 'errors': len(errs),
              'warnings': len(rng) - len(errs), 'findings': rng, 'lint': lint}
    (outdir / 'critic.json').write_text(json.dumps(report, indent=1))
    md = [f'# Frame critic: {html}', '', f'{len(times)} samples ({data["mode"]} seek), {data["width"]}x{data["height"]}, safe={preset}, '
          f'font floor {min_font:.0f}px. **{len(errs)} errors, {len(rng) - len(errs)} warnings.**', '',
          '| sev | code | time | samples | finding |', '|---|---|---|---|---|']
    for f in rng:
        md.append(f"| {f['severity']} | {f['code']} | {f['t0']:.2f}-{f['t1']:.2f} s | {f['n']} | {f['msg'].replace('|', '/')} |")
    md += ['', f'Annotated frames: {len(made)} in `{outdir}` (flags_sheet.jpg). The critic agent must still look at them at full size.']
    (outdir / 'critic.md').write_text('\n'.join(md) + '\n')
    print('\n'.join(md[:60]))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
