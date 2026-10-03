#!/usr/bin/env python3
"""Art intake QC v2: catch the defects that cost EP001 credits and rework, before an asset is approved.

  python3 tools/qc/art_qc.py                      # every asset in shared/art_catalog.json
  python3 tools/qc/art_qc.py path/a.png path/b.png --kind character
  npm run art:qc -- ...

Checks (CPU, deterministic, milliseconds per asset):
  NO_ALPHA          cutout without a real alpha channel                       error
  BAKED_BACKGROUND  the opaque part of the border is a flat light colour
                    (white/grey bg baked in)                                  error
  SCENE_AS_PROP     almost nothing is transparent: verify it is meant to be a
                    full panel and not a scene delivered as a cut-out         warn
  CHECKERBOARD      a painted two-tone transparency checkerboard             error
  WHITE_HALO        light fringe around the cut-out edge                      warn
  DARK_HALO         dark fringe around the cut-out edge                       warn
  ALIASED_EDGE      hard 0/255 alpha along the contour (jagged edges)         warn
  PADDING           the subject fills < 40% of the canvas (wasted pixels)     warn
  QUEST_COLORS      Quest_v1 colours not found where expected: red hoodie in
                    the torso band, red sneakers at the feet when visible
                    (EP001 thumbnail 1: brown boots)                          warn
Backgrounds are opaque by design: only size is checked for them (the engine's art contract does that).

Producer rule (2026-10-03): QC never removes, rejects or blocks art. Every finding is a RECOMMENDATION for the
Producer; "error" vs "warn" only ranks how likely it is to be visible on screen. Exit code is always 0.
Writes docs/qc/art_qc_report.json.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]


def hsv(rgb):
    r, g, b = [rgb[..., i] / 255.0 for i in range(3)]
    mx, mn = np.max(rgb, 2) / 255.0, np.min(rgb, 2) / 255.0
    d = mx - mn + 1e-9
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-9), 0)
    return h, s, mx


def red_mask(rgb):
    h, s, v = hsv(rgb.astype(float))
    return ((h < 18) | (h > 340)) & (s > 0.45) & (v > 0.35)


def brown_mask(rgb):
    h, s, v = hsv(rgb.astype(float))
    return (h >= 18) & (h <= 45) & (s > 0.3) & (v > 0.12) & (v < 0.6)


def check(path, kind, key='', brief=''):
    issues = []
    add = lambda code, level, msg: issues.append({'code': code, 'level': level, 'message': msg})
    im = Image.open(path)
    has_alpha = im.mode in ('RGBA', 'LA') or 'transparency' in im.info
    a = np.asarray(im.convert('RGBA'))
    rgb, al = a[..., :3].astype(int), a[..., 3].astype(int)
    H, W = al.shape
    if kind == 'background':
        return issues
    if not has_alpha or al.min() == al.max():
        add('NO_ALPHA', 'error', 'no usable alpha channel')
        return issues

    # baked background: the opaque part of the border is a flat, light colour (white/grey/cream), not content
    border = np.concatenate([al[0], al[-1], al[:, 0], al[:, -1]])
    border_rgb = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    opaque = border >= 16
    if opaque.mean() > 0.05:
        b = border_rgb[opaque]
        flat_light = (b.min(1) >= 200) & ((b.max(1) - b.min(1)) <= 24)
        if flat_light.mean() > 0.6:
            add('BAKED_BACKGROUND', 'error', f'{opaque.mean():.0%} of the border is opaque and {flat_light.mean():.0%} of it is a flat light colour: baked background')
    clear = (al < 16).mean()
    if clear < 0.20:
        add('SCENE_AS_PROP', 'warn', f'only {clear:.0%} of the canvas is transparent: check it is meant to be a full panel, not a scene delivered as a cut-out')

    # painted checkerboard: opaque, light, unsaturated pixels split into two regular tones
    lum = rgb.mean(2)
    grayish = (al > 200) & (rgb.min(2) >= 150) & ((rgb.max(2) - rgb.min(2)) <= 14)
    lab, n = ndimage.label(grayish)
    if n:
        sizes = ndimage.sum(grayish, lab, range(1, n + 1))
        for i in np.argsort(sizes)[::-1][:12]:
            if sizes[i] < 0.004 * H * W:
                break
            comp = lab == i + 1
            l = lum[comp]
            lo, hi = np.percentile(l, 15), np.percentile(l, 85)
            if not (hi - lo >= 18 and ((np.abs(l - lo) < 6).mean() > 0.25) and ((np.abs(l - hi) < 6).mean() > 0.25)):
                continue
            # a real checkerboard is a GRID: many tone flips per row, at the same x in consecutive rows
            ys, xs = np.where(comp)
            box = (lum[ys.min():ys.max() + 1, xs.min():xs.max() + 1] > (lo + hi) / 2) & comp[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            flips = box[:, 1:] != box[:, :-1]
            density = flips.sum() / max(1, comp.sum())
            aligned = (flips[1:] & flips[:-1]).sum() / max(1, flips[1:].sum())
            vflips = box[1:, :] != box[:-1, :]
            if density > 0.03 and aligned > 0.6 and vflips.sum() / max(1, comp.sum()) > 0.03:
                add('CHECKERBOARD', 'error', f'painted transparency checkerboard ({sizes[i] / (H * W):.1%} of canvas)')
                break

    # edge fringe: compare the outer edge band with a band 3-6 px inside the subject
    solid = al > 200
    edge = solid & ndimage.binary_dilation(al < 16, iterations=2)
    inner = ndimage.binary_erosion(solid, iterations=3) & ~ndimage.binary_erosion(solid, iterations=6)
    if edge.sum() > 50 and inner.sum() > 50:
        dl = lum[edge].mean() - lum[inner].mean()
        near_white = (rgb[edge].min(1) > 215).mean()
        if near_white > 0.06 and dl > 25:
            add('WHITE_HALO', 'warn', f'light fringe on the edge ({near_white:.0%} near-white edge pixels, +{dl:.0f} luminance vs inside)')
        # thick dark outlines are the house style: only flag extreme cases
        if dl < -95:
            add('DARK_HALO', 'warn', f'dark fringe on the edge ({dl:.0f} luminance vs inside)')
    contour = ndimage.binary_dilation(solid, iterations=1) & ~ndimage.binary_erosion(solid, iterations=1)
    partial = ((al > 0) & (al < 255))[contour].mean() if contour.any() else 1
    if partial < 0.02:
        add('ALIASED_EDGE', 'warn', f'only {partial:.1%} soft alpha along the contour (jagged edge)')

    ys, xs = np.where(al > 16)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    fill = (y1 - y0 + 1) * (x1 - x0 + 1) / (H * W)
    if fill < 0.40:
        add('PADDING', 'warn', f'subject fills {fill:.0%} of the canvas (crop the padding)')

    # Quest_v1 colours (QUEST_V1_PROMPT_SPEC), default outfit only (costume variants change the outfit):
    # red hoodie always; red sneakers only when he stands with the feet visible
    if key.startswith('quest.default.') or (not key and '/quest/' in str(path)):
        sub_rgb, sub_al = rgb[y0:y1 + 1, x0:x1 + 1], al[y0:y1 + 1, x0:x1 + 1] > 200
        hh = sub_rgb.shape[0]
        red = red_mask(sub_rgb) & sub_al
        if red.mean() < 0.02:
            add('QUEST_COLORS', 'warn', 'almost no Quest red (hoodie) in the figure: check the outfit')
        feet = slice(int(hh * 0.9), hh)
        fr, fb = red[feet].sum(), (brown_mask(sub_rgb) & sub_al)[feet].sum()
        seated = any(w in (brief or '').lower() + key for w in ('seat', 'sitting', 'sitting_back', 'bed', 'lying', 'drive', 'sleep'))
        if not seated and fb > 400 and fb > 2 * fr:
            add('QUEST_COLORS', 'warn', f'feet area is mostly brown ({fb} px) rather than red ({fr} px): red sneakers expected')
    return issues


def main():
    args = [x for i, x in enumerate(sys.argv[1:], 1) if not x.startswith('--') and sys.argv[i - 1] != '--kind']
    kind_flag = next((sys.argv[i + 1] for i, x in enumerate(sys.argv) if x == '--kind' and i + 1 < len(sys.argv)), None)
    targets = []
    if args:
        targets = [('', Path(p), kind_flag or 'character', '') for p in args]
    else:
        cat = json.load(open(ROOT / 'shared/art_catalog.json'))['assets']
        for k, e in cat.items():
            p = ROOT / ('public' + e['path'])
            if p.exists():
                targets.append((k, p, e.get('kind', 'object'), e.get('brief', '')))
    report, errors = {}, 0
    for key, p, kind, brief in targets:
        iss = check(p, kind, key, brief)
        key = key or str(p)
        report[key] = {'path': str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p), 'kind': kind, 'issues': iss}
        for i in iss:
            errors += i['level'] == 'error'
            print(f"{'▲ likely visible' if i['level'] == 'error' else '· minor         '}  {key:44s} {i['code']:16s} {i['message']}")
    flagged = sum(1 for r in report.values() if r['issues'])
    if '--no-report' not in sys.argv:
        out = ROOT / 'docs/qc/art_qc_report.json'
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, indent=1, ensure_ascii=False))
        print(f'\n{len(report)} assets checked, {flagged} with recommendations ({errors} likely visible). Report: {out.relative_to(ROOT)}')
    # recommendations only: never fails (Producer rule)


if __name__ == '__main__':
    main()
