#!/usr/bin/env python3
"""Asset finder (pre-episode "what do we already own?" step).

  npm run assets:find -- "living room tv console night"            # ranked list + contact sheet
  npm run assets:find -- --needs docs/ep002/asset_needs.json       # every need of an episode

Scores every catalog asset by the words of the need against its key, label, kind and brief, and
renders a contact sheet of the best candidates so a human (and Claude) LOOKS at them before deciding
to reuse, recompose or generate. A need file also lists "avoid" words (e.g. anachronisms such as
"flat-screen" for a 1998 scene) that lower a candidate's score and are printed as warnings.
Output: docs/asset_fit/<slug>.jpg + docs/asset_fit/<slug>.json
"""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
CAT = json.load(open(ROOT / 'shared/art_catalog.json'))['assets']
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
SYN = {'tv': ['television', 'screen', 'tv'], 'console': ['console', 'gaming', 'game'], 'room': ['room', 'bedroom', 'living'],
       'night': ['night', 'evening'], 'kid': ['child', 'kid', 'young'], 'field': ['field', 'meadow', 'grass']}
words = lambda s: re.findall(r'[a-z0-9]+', s.lower())


def score(entry, key, need, avoid):
    text = ' '.join([key, entry.get('label', ''), entry.get('kind', ''), entry.get('brief', '') or ''])
    toks = set(words(text))
    s = 0.0
    for w in words(need):
        alts = SYN.get(w, [w])
        if any(a in toks for a in alts):
            s += 1.0
        elif any(a in text.lower() for a in alts):
            s += 0.5
    hits = [a for a in avoid if a.lower() in text.lower()]
    return s - 1.5 * len(hits), hits


def sheet(rows, path, title):
    tw, th, cols = 384, 216, 4
    n = len(rows)
    img = Image.new('RGB', (cols * tw, ((n + cols - 1) // cols) * (th + 44) + 36), (36, 36, 44))
    d = ImageDraw.Draw(img)
    d.text((8, 8), title[:140], font=FONT, fill=(255, 210, 90))
    for i, r in enumerate(rows):
        x, y = (i % cols) * tw, 36 + (i // cols) * (th + 44)
        try:
            im = Image.open(ROOT / ('public' + CAT[r['key']]['path'])).convert('RGBA')
            im.thumbnail((tw - 8, th - 8))
            bg = Image.new('RGBA', (tw, th), (200, 200, 205, 255))
            bg.alpha_composite(im, ((tw - im.width) // 2, (th - im.height) // 2))
            img.paste(bg.convert('RGB'), (x, y))
        except Exception:
            pass
        d.text((x + 6, y + th + 4), f"{i + 1}. {r['key']}"[:44], font=FONT, fill=(230, 230, 230))
        if r['avoid_hits']:
            d.text((x + 6, y + th + 22), 'check: ' + ', '.join(r['avoid_hits']), font=FONT, fill=(255, 120, 120))
    img.save(path, quality=85)


def find(need, avoid=(), kind=None, top=8, slug=None):
    rows = []
    for k, e in CAT.items():
        if kind and e.get('kind') != kind:
            continue
        s, hits = score(e, k, need, avoid)
        if s > 0:
            rows.append({'key': k, 'score': round(s, 2), 'kind': e.get('kind'), 'brief': e.get('brief'), 'avoid_hits': hits})
    rows.sort(key=lambda r: -r['score'])
    rows = rows[:top]
    out = ROOT / 'docs/asset_fit'
    out.mkdir(parents=True, exist_ok=True)
    slug = slug or re.sub(r'[^a-z0-9]+', '_', need.lower()).strip('_')[:50]
    sheet(rows, out / f'{slug}.jpg', f'NEED: {need}' + (f'   AVOID: {", ".join(avoid)}' if avoid else ''))
    (out / f'{slug}.json').write_text(json.dumps({'need': need, 'avoid': list(avoid), 'candidates': rows}, indent=1, ensure_ascii=False))
    return rows


def main():
    args = sys.argv[1:]
    if args and args[0] == '--needs':
        needs = json.load(open(ROOT / args[1]))['needs']
        for n in needs:
            rows = find(n['need'], n.get('avoid', []), n.get('kind'), n.get('top', 8), n['id'])
            print(f"\n■ {n['id']}: {n['need']}  (sequences {', '.join(n.get('sequences', []))})")
            for i, r in enumerate(rows[:5], 1):
                print(f"  {i}. {r['key']:44s} {r['score']:5.1f} {'⚠ ' + ', '.join(r['avoid_hits']) if r['avoid_hits'] else ''}")
            if not rows:
                print('  (nothing in the library: NEW_ART candidate)')
    else:
        need = ' '.join(a for a in args if not a.startswith('--'))
        for i, r in enumerate(find(need), 1):
            print(f"{i}. {r['key']:44s} {r['score']:5.1f}  {r['brief'] or ''}")


if __name__ == '__main__':
    main()
