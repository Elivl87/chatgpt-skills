#!/usr/bin/env python3
"""Ep 001 animatic · Guardian body audit (head to toe), step 2: automated body checks + the body contact sheets.

    python3 body_check.py <dir with faces.json + s_*.png> <block> <qc dir> [--pages <dir>] [--sheet out.jpg]

Uses the same key acting frames as the eye audit (faces_audit.mjs, which also logs, per Eli / Mila draw, the tight box
of the character's own pixels + wardrobe colour shares, the ground point; the extras' boxes; and every overlay rect:
labels, pills, badges, balloons, source lines). Checks, per character per frame:
  * overlay-head  (FAIL): an overlay rect crosses the head zone (top of the silhouette -> chin, incl. beanie / ponytail);
  * overlay-body  (warn): an overlay rect crosses the rest of the silhouette (look at it);
  * cut-head      (FAIL): the head zone crosses a frame edge (the face audit only checks the head circle);
  * colour        (FAIL): Eli without beanie yellow, Mila without sweater purple (when >= 18 px tall), any vermilion;
  * float         (FAIL): standing (not seated) and the lowest pixel is clearly above the ground point (feet floating);
  * scale         (warn): Eli and Mila side by side (feet within 4 % of the frame height) with different scale u.
Writes qc/body_<block>.json (+ the list) and contact sheets (frame at phone size with the boxes + head-to-toe crops).
"""
import json, sys, os, math
from PIL import Image, ImageDraw, ImageFont

NAME = {'eli1': 'Eli', 'mila1': 'Mila'}


def inter(a, b, pad=0):
    return a[0] - pad < b[2] and b[0] - pad < a[2] and a[1] - pad < b[3] and b[1] - pad < a[3]


def check_sample(s, W, H):
    out = []
    chars = [f for f in s['faces'] if f.get('body') and f['body'].get('box')]
    ovs = [o for o in s.get('over', []) if o['a'] >= 0.3 and o['r'][2] - o['r'][0] > 2]
    for f in chars:
        b = f['body']['box']; hx, hy, hr = f['head']; name = NAME[f['id']]; hpx = b[3] - b[1]
        if f.get('alpha', 1) < 0.9:
            continue
        # head zone: beanie / ponytail tip -> chin, head width (+ ponytail); arms or a flag raised above the head are body
        headz = [max(b[0], hx - hr * 0.95), max(b[1], hy - hr * 1.6), min(b[2], hx + hr * 0.95), min(b[3], hy + hr * 1.05)]
        bodyz = [b[0], headz[3], b[2], b[3]]
        for o in ovs:
            # a balloon is drawn from the speaker's head: its own tail/pill may touch the speaker's hat edge only if
            # it doesn't cover the face; any overlay crossing another zone is reported
            if inter(o['r'], headz, 1):
                out.append(('FAIL', 'overlay-head', name, f"{o['kind']} over the head zone"))
            elif inter(o['r'], bodyz, 1) and hpx >= 18:
                out.append(('warn', 'overlay-body', name, f"{o['kind']} over the body"))
        if hpx >= 12 and (headz[0] < 0 or headz[1] < 0 or headz[2] > W or headz[3] > H):
            # a head zone only partly on screen (a character half out of frame) is a cut; fully off is not drawn at all
            out.append(('FAIL', 'cut-head', name, f"head zone {[round(v) for v in headz]} crosses the frame edge"))
        cl = f['body']['cl']
        if hpx >= 18 and f['body']['px'] > 150:
            # either look: workshop (yellow beanie / purple sweater) or canonical 2026-10-29 (red cap + wine flannel + yellow tee / denim + purple skirt)
            if f['id'] == 'eli1' and cl['yellow'] < 0.004 and cl.get('red', 0) < 0.02:
                out.append(('FAIL', 'colour', name, f"no beanie yellow / cap-flannel red ({cl['yellow']:.3f} / {cl.get('red', 0):.3f})"))
            if f['id'] == 'mila1' and cl['purple'] < 0.01 and cl['blue'] < 0.03:
                out.append(('FAIL', 'colour', name, f"no sweater purple ({cl['purple']:.3f})"))
        if cl.get('vermilion', 0) > 0.003:
            out.append(('FAIL', 'colour', name, f"vermilion on the character ({cl['vermilion']:.3f})"))
        if not f.get('seated') and f.get('foot') and hpx >= 18 and f['pose'] not in ('sit', 'sitPoint', 'cheer', 'jump'):
            gap = f['foot'][1] - b[3]
            if gap > max(2.0, 0.03 * f['u']) and b[3] < H - 1:
                out.append(('FAIL', 'float', name, f"lowest pixel {gap:.1f} px above the ground point"))
    E = [f for f in chars if f['id'] == 'eli1' and not f.get('seated')]; M = [f for f in chars if f['id'] == 'mila1' and not f.get('seated')]
    if E and M and E[0].get('foot') and M[0].get('foot'):
        e, m = E[0], M[0]
        if abs(e['foot'][1] - m['foot'][1]) < 0.04 * H and abs(e['u'] / m['u'] - 1) > 0.08:
            out.append(('warn', 'scale', 'Eli+Mila', f"side by side with u {e['u']:.0f} vs {m['u']:.0f}"))
    return out


def font(sz):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf']:
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def tile(D, s, probs, TH=220, CH=None):
    CH = CH or TH
    im = Image.open(os.path.join(D, s['png'])).convert('RGB'); W, H = im.size
    th = im.resize((W * TH // H, TH), Image.LANCZOS); d = ImageDraw.Draw(th); k = TH / H
    for o in s.get('over', []):
        if o['a'] >= 0.3:
            d.rectangle([o['r'][0] * k, o['r'][1] * k, o['r'][2] * k, o['r'][3] * k], outline=(255, 70, 70))
    for x in s.get('extras', []):
        if x['alpha'] > 0.3:
            d.rectangle([v * k for v in x['box']], outline=(120, 200, 255))
    crops = []
    for f in s['faces']:
        b = (f.get('body') or {}).get('box')
        if not b:
            continue
        d.rectangle([b[0] * k, b[1] * k, b[2] * k, b[3] * k], outline=(255, 230, 0) if f['id'] == 'eli1' else (200, 120, 255))
        w, h = b[2] - b[0], b[3] - b[1]; pad = max(4, 0.08 * h)
        cb = (max(0, b[0] - pad), max(0, b[1] - pad), min(W, b[2] + pad), min(H, b[3] + pad))
        if cb[2] - cb[0] < 2 or cb[3] - cb[1] < 2:
            continue
        c = im.crop(cb)
        sc = CH / max(1, c.size[1]); cw = max(20, min(int(c.size[0] * sc), CH * 2))
        c = c.resize((cw, CH), Image.NEAREST if sc > 4 else Image.LANCZOS)
        crops.append((f, c))
    wsum = th.size[0] + sum(c.size[0] + 4 for _, c in crops)
    T = Image.new('RGB', (wsum + 4, max(TH, CH) + 34), (24, 18, 28)); T.paste(th, (0, 34)); x = th.size[0] + 4
    for f, c in crops:
        T.paste(c, (x, 34)); x += c.size[0] + 4
    d = ImageDraw.Draw(T); fails = [p for p in probs if p[0] == 'FAIL']
    col = (255, 90, 90) if fails else ((255, 200, 80) if probs else (230, 230, 230))
    txt = f"{s['shot']}  t{s['t']:.2f}  {s['why'][:26]}  " + '  '.join(f"{NAME[f['id']]}:{f['expr']}/{f['pose']}/{f['view']}" for f, _ in crops)
    d.text((4, 2), txt, fill=col, font=font(13))
    if probs:
        d.text((4, 18), ' | '.join(f"{p[1]} {p[2]}" for p in probs)[:160], fill=col, font=font(12))
    if fails:
        d.rectangle([0, 0, T.size[0] - 1, T.size[1] - 1], outline=(255, 60, 60), width=3)
    return T


def pages(tiles, maxw=1800):
    rows, row, w = [], [], 0
    for t in tiles:
        if row and w + t.size[0] > maxw:
            rows.append(row); row, w = [], 0
        row.append(t); w += t.size[0] + 6
    if row:
        rows.append(row)
    out = []
    for i in range(0, len(rows), 6):
        rr = rows[i:i + 6]; H = sum(max(t.size[1] for t in r) + 6 for r in rr)
        P = Image.new('RGB', (maxw, H), (12, 10, 14)); y = 0
        for r in rr:
            x = 0
            for t in r:
                P.paste(t, (x, y)); x += t.size[0] + 6
            y += max(t.size[1] for t in r) + 6
        out.append(P)
    return out


def main():
    D, B, QC = sys.argv[1], sys.argv[2], sys.argv[3]
    pdir = sys.argv[sys.argv.index('--pages') + 1] if '--pages' in sys.argv else D
    data = json.load(open(os.path.join(D, 'faces.json')))
    rep, tiles, nF, nW = [], [], 0, 0
    for s in data['samples']:
        W, H = s.get('size', [854, 480])
        probs = check_sample(s, W, H)
        nF += sum(p[0] == 'FAIL' for p in probs); nW += sum(p[0] == 'warn' for p in probs)
        rep.append({'t': s['t'], 'shot': s['shot'], 'why': s['why'], 'png': s['png'], 'problems': probs,
                    'chars': [{'id': f['id'], 'expr': f['expr'], 'pose': f['pose'], 'view': f['view'], 'box': (f.get('body') or {}).get('box'), 'cl': (f.get('body') or {}).get('cl')} for f in s['faces']],
                    'extras': len(s.get('extras', []))})
        tiles.append(tile(D, s, probs, 220, int(os.environ.get('CROP_H', 220))))
    os.makedirs(pdir, exist_ok=True)
    for i, P in enumerate(pages(tiles)):
        P.save(os.path.join(pdir, f'body_{B}_p{i:02d}.jpg'), quality=82)
    json.dump({'block': B, 'samples': len(rep), 'fail': nF, 'warn': nW, 'frames': rep}, open(os.path.join(QC, f'body_{B}.json'), 'w'), indent=1)
    print(f'block {B}: {len(rep)} frames, {nF} body failures, {nW} warnings')
    for r in rep:
        for p in r['problems']:
            print(f"  {p[0]:4} {r['shot']:16} t{r['t']:6.2f} {p[2]:8} {p[1]:13} {p[3]}")


if __name__ == '__main__':
    main()
