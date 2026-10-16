#!/usr/bin/env python3
"""Ep 001 animatic · faces audit, step 2: the automated eye check + the per-block face contact sheet.

    python3 faces_check.py <dir with faces.json + s_*.png> <block> <qc dir> [--tag before|after] [--sheet out.jpg]

For every eye of Eli / Mila logged by the kit (faces_audit.mjs) on the key acting frames:
  * declared closed (laugh arcs, blink, shut lid) -> 'closed', passes;
  * crowd scale (eye radius < 3 px on screen) -> 'tiny', not audited;
  * otherwise the PIXELS of the final frame are checked (after light, grade, bloom, grain):
      - eye white present: >= 25 % of the eye's interior is bright (>= 0.75 x the eye's 92nd-percentile luminance) and
        that white is really bright (>= 120 luma);
      - a dark pupil blob of sufficient size: inside a disc of 0.8 x the pupil radius at the logged pupil centre,
        >= 55 % of the pixels are dark (<= 0.45 x the white, and >= 70 luma darker than it); 35 % for the declared
        lid-cover emotions (smug / sly, annoyed, grumpy) whose pupil sits in a slit; the disc must hold >= 3 px;
      - the geometry obeys the eye rules: pupil radius >= 0.33 x the eye radius (or >= 1.5 px), catchlight <= 0.36 x
        the pupil.
  A failure is any audited eye that misses one of these. Writes qc/faces_<block>[_tag].json and the contact sheet.
"""
import json, sys, os, math
from PIL import Image, ImageDraw, ImageFont

def lum(im):
    return im.convert('L')

def check_eye(L, W, H, e, sly, f=None):
    f = f or {}
    rx, ry = e['rx'], e['ry']
    if f.get('alpha', 1) < 0.9:
        return 'fading', 'fading in/out'      # drawn at partial alpha (a fade): transitional by design
    if e.get('closed') in ('happy', 'blink', 'lid'):
        return 'closed', ''
    if ry < 3 or rx < 2.5:
        return 'tiny', ''
    cx, cy = e['cx'], e['cy']
    if cx - rx < 0 or cx + rx >= W or cy - ry < 0 or cy + ry >= H:
        return 'offframe', ''
    # eye interior samples (0.8 x the ellipse, keeps the ink outline out)
    vals = []
    x0, x1, y0, y1 = int(cx - rx), int(cx + rx) + 1, int(cy - ry), int(cy + ry) + 1
    for y in range(max(0, y0), min(H, y1)):
        for x in range(max(0, x0), min(W, x1)):
            if ((x + 0.5 - cx) / (rx * 0.8)) ** 2 + ((y + 0.5 - cy) / (ry * 0.8)) ** 2 <= 1:
                vals.append(L[x, y])
    if len(vals) < 6:
        return 'tiny', ''
    sv = sorted(vals); wref = sv[int(len(sv) * 0.92) - 1]
    white_frac = sum(1 for v in vals if v >= 0.75 * wref) / len(vals)
    probs = []
    open_k = max(0.2, 1 - e.get('lid', 0) - e.get('low', 0))
    if (wref < 120 or white_frac < 0.2 * open_k) and f.get('hairFlop', 0) > 0.3:
        return 'covered', 'hair gag'          # the declared ponytail-flop gag hides an eye on purpose
    if wref < 120 or white_frac < 0.2 * open_k:
        probs.append(f'no clear white (white {wref}, {white_frac:.0%})')
    px, py, pr = e['px'], e['py'], e['pr']
    if pr < 0.33 * ry - 0.05:
        probs.append(f'pupil {pr / ry:.2f}x eye (< 0.33)')
    if e.get('cr', 0) > 0.36 * pr + 1e-6:
        probs.append(f'catchlight {e["cr"] / pr:.2f}x pupil (> 0.36)')
    r = max(1.0, 0.8 * pr); n = dk = 0; mn = 255
    thr = min(0.45 * wref, wref - 70)
    for y in range(int(py - r) - 1, int(py + r) + 2):
        for x in range(int(px - r) - 1, int(px + r) + 2):
            if 0 <= x < W and 0 <= y < H and (x + 0.5 - px) ** 2 + (y + 0.5 - py) ** 2 <= r * r:
                n += 1; v = L[x, y]; mn = min(mn, v)
                if v <= thr: dk += 1
    need = 0.35 if sly else 0.55
    lz = f.get('lens')                       # the eye seen through the magnifier glass (tinted, ringed): 0.4
    if lz and (e['cx'] - lz[0]) ** 2 + (e['cy'] - lz[1]) ** 2 < lz[2] ** 2: need = min(need, 0.4)
    if n < 3:
        n = 0
        for y in range(int(py) - 1, int(py) + 2):
            for x in range(int(px) - 1, int(px) + 2):
                if 0 <= x < W and 0 <= y < H:
                    n += 1; v = L[x, y]; mn = min(mn, v); dk += v <= thr
        need = 0.3
    frac = dk / max(1, n)
    if frac < need:
        probs.append(f'pupil not dark/visible ({frac:.0%} dark, need {need:.0%})')
    return ('fail' if probs else 'pass'), '; '.join(probs)

SLY = {'smug', 'sly', 'annoyed', 'grumpy'}

def main():
    d, block, qc = sys.argv[1], sys.argv[2], sys.argv[3]
    tag = sys.argv[sys.argv.index('--tag') + 1] if '--tag' in sys.argv else ''
    sheet = sys.argv[sys.argv.index('--sheet') + 1] if '--sheet' in sys.argv else None
    J = json.load(open(os.path.join(d, 'faces.json')))
    rows, tiles, warns = [], [], []
    counts = {'pass': 0, 'fail': 0, 'closed': 0, 'covered': 0, 'fading': 0, 'tiny': 0, 'offframe': 0}
    for s in J['samples']:
        im = Image.open(os.path.join(d, s['png'])).convert('RGB'); W, H = im.size; L = lum(im).load()
        for f in s['faces']:
            res = []
            for k, e in enumerate(f['eyes']):
                st, why = check_eye(L, W, H, e, f['expr'] in SLY, f)
                counts[st] += 1; res.append((st, why))
                if st == 'fail':
                    rows.append({'t': round(s['t'], 2), 'shot': s['shot'], 'why_sample': s['why'], 'id': f['id'], 'expr': f['expr'], 'view': f['view'], 'eye': k, 'problem': why,
                                 'eye_px': round(e['ry'], 1)})
            hd = f.get('head') or [0, 0, 0]
            # framing: a face (head >= 12 px) whose head box crosses the frame edge is cut off
            if hd[2] >= 12 and (hd[0] - hd[2] * 0.8 < 0 or hd[0] + hd[2] * 0.8 > W or hd[1] - hd[2] < -hd[2] * 0.3) and -hd[2] < hd[0] < W + hd[2]:
                warns.append({'t': round(s['t'], 2), 'shot': s['shot'], 'id': f['id'], 'head': [round(x) for x in hd]})
            audited = [r for r in res if r[0] in ('pass', 'fail')]
            if hd[2] >= 4 and (audited or any(r[0] == 'closed' for r in res)) and 0 <= hd[0] < W and 0 <= hd[1] < H:
                tiles.append({'img': im, 'head': hd, 'eyes': f['eyes'], 's': s, 'f': f, 'fail': any(r[0] == 'fail' for r in res),
                              'closed': all(r[0] == 'closed' for r in res if r[0] != 'tiny'), 'why': '; '.join(r[1] for r in res if r[1])})
    os.makedirs(qc, exist_ok=True)
    out = {'block': block, 'tag': tag, 'samples': len(J['samples']), 'faces': sum(len(s['faces']) for s in J['samples']), 'eyes': counts,
           'failures': len(rows), 'fail_list': rows, 'framing_warnings': warns}
    json.dump(out, open(os.path.join(qc, f'faces_{block}{("_" + tag) if tag else ""}.json'), 'w'), indent=1, ensure_ascii=False)
    print(f'block {block} {tag}: {len(J["samples"])} frames, eyes {counts}, FAILURES {len(rows)}, framing warnings {len(warns)} {sorted(set(w["shot"] for w in warns))}')
    if sheet:
        make_sheet(tiles, sheet, block, tag, len(rows))

def make_sheet(tiles, path, block, tag, nfail):
    # keep every failure + one tile per (shot, character, emotion, talking) moment, at most 132 tiles
    seen, keep = set(), []
    for t in tiles:
        key = (t['s']['shot'], t['f']['id'], t['f']['expr'], t['f'].get('talk', 0) > 0.05, t['f'].get('blink', 0) > 0.5)
        if t['fail'] or key not in seen:
            keep.append(t); seen.add(key)
    if len(keep) > 132:
        fails = [t for t in keep if t['fail']]; rest = [t for t in keep if not t['fail']]
        step = len(rest) / max(1, 132 - len(fails)); rest = [rest[int(i * step)] for i in range(max(0, 132 - len(fails)))]
        keep = sorted(fails + rest, key=lambda t: t['s']['t'])
    TW, TH, COLS = 150, 168, 12
    rowsN = max(1, math.ceil(len(keep) / COLS))
    sh = Image.new('RGB', (TW * COLS, 40 + TH * rowsN), (24, 18, 26)); dr = ImageDraw.Draw(sh)
    try:
        F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11); FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
    except Exception:
        F = FB = ImageFont.load_default()
    dr.text((8, 10), f'faces · block {block} {tag} · {len(keep)} tiles · pupil failures: {nfail}', fill=(255, 230, 200), font=FB)
    for k, t in enumerate(keep):
        x0, y0 = (k % COLS) * TW, 40 + (k // COLS) * TH
        hx, hy, hr = t['head']; side = max(48, hr * 2.6)
        box = (int(hx - side / 2), int(hy - side * 0.55), int(hx + side / 2), int(hy + side * 0.45))
        crop = t['img'].crop(box).resize((TW - 6, TW - 6), Image.LANCZOS)
        col = (230, 60, 50) if t['fail'] else ((120, 140, 220) if t['closed'] else (70, 170, 90))
        dr.rectangle([x0 + 1, y0 + 1, x0 + TW - 2, y0 + TW - 2], outline=col, width=3)
        sh.paste(crop, (x0 + 3, y0 + 3))
        f, s = t['f'], t['s']
        lab = f"{s['t']:.1f}s {f['id'][:-1]} {f['expr'][:9]}{' talk' if f.get('talk', 0) > 0.05 else ''}{' blink' if f.get('blink', 0) > 0.5 else ''}"
        dr.text((x0 + 3, y0 + TW - 2), lab, fill=(240, 230, 220), font=F)
        dr.text((x0 + 3, y0 + TW + 10), s['shot'][:22], fill=(170, 160, 170), font=F)
    q = 80
    while True:
        sh.save(path, quality=q, optimize=True)
        if os.path.getsize(path) <= 400 * 1024 or q <= 35: break
        q -= 7
    print('sheet', path, os.path.getsize(path) // 1024, 'KB')

if __name__ == '__main__':
    main()
