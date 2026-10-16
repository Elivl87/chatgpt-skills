#!/usr/bin/env python3
"""Guardian one-frame pop check on a FINISHED block video (every frame, not just key frames) — 2026-10-16.

Clothes / limbs / props / faces that change in ONE frame inside a shot are what the Producer sees as "defects" in
motion. The key-frame audits (faces / body / clothes) sample a few moments; this check decodes every frame of the mp4
and, on a 24 px cell grid (854x480 gray), measures the per-cell change between consecutive frames d[t]:
  * STEP  : d[t] > A and d[t] > R * max(d[t-1], d[t+1]) + 1     (something jumped and stayed: hard pose / expression /
            prop switch)
  * FLASH : d[t], d[t+1] > A and |f[t+1] - f[t-1]| < 0.35 * min(d[t], d[t+1])   (something shows for one frame only)
Shot cuts (events.json, +-1 frame) are excluded. Each event = frame, time, shot, bbox of the flagged cells, peak.
Writes <qc>/pop_<X>.json and a sheet of before / after crops (<qc>/pop_<X>_small.jpg) to LOOK at: a blink, a text box
pop-in or a scripted flash is fine; a garment, limb, prop or face that snaps is a defect.
  python3 pop_check.py block<X>_draft.mp4 events.json X qc_dir [--body qc/body_<X>.json] [--sheet out.jpg]
(--body: only cells where Eli / Mila are, from the body audit's key-frame boxes of the same shot)
"""
import json, subprocess, sys
import numpy as np

W, H, C = 854, 480, 24
A_MIN, R = 7.0, 3.0


def frames(mp4):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', mp4, '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{W}x{H}', '-'],
                         stdout=subprocess.PIPE)
    n = W * H
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield np.frombuffer(b, np.uint8).reshape(H, W).astype(np.int16)


def cells(a):
    gh, gw = H // C, W // C
    return a[:gh * C, :gw * C].reshape(gh, C, gw, C).mean(axis=(1, 3))


def nmax(a):
    p = np.pad(a, 1, mode='edge')
    return np.max([p[1 + dy:1 + dy + a.shape[0], 1 + dx:1 + dx + a.shape[1]] for dy in (-1, 0, 1) for dx in (-1, 0, 1)], axis=0)


def char_mask(body, shot, gh, gw, pad=12):
    """cells covered by Eli / Mila in this shot (union of their boxes at the audited key frames, padded)"""
    m = np.zeros((gh, gw), bool)
    for smp in body:
        if smp['shot'] != shot:
            continue
        for c in smp['chars']:
            if not c.get('box'):
                continue
            x0, y0, x1, y1 = c['box']
            m[max(0, (y0 - pad) // C):min(gh, (y1 + pad) // C + 1), max(0, (x0 - pad) // C):min(gw, (x1 + pad) // C + 1)] = True
    return m


def main():
    mp4, evp, blk, qc = sys.argv[1:5]
    sheet = sys.argv[sys.argv.index('--sheet') + 1] if '--sheet' in sys.argv else f'{qc}/pop_{blk}_small.jpg'
    ev = json.load(open(evp)); fps = 30
    body = json.load(open(sys.argv[sys.argv.index('--body') + 1]))['frames'] if '--body' in sys.argv else None
    masks = {}
    cuts = set()
    for s in ev['shots']:
        f0 = int(round(s['start'] * fps))
        cuts.update({f0 - 1, f0, f0 + 1})
    D, E, keep = [], [], {}
    prev2 = prev = None
    for i, f in enumerate(frames(mp4)):
        D.append(cells(np.abs(f - prev)) if prev is not None else None)
        E.append(cells(np.abs(f - prev2)) if prev2 is not None else None)   # E[i] = |f[i] - f[i-2]|
        prev2, prev = prev, f
    N = len(D)
    out = []
    for t in range(2, N - 1):
        if t in cuts:
            continue
        d0, d1, dm = D[t], D[t + 1], D[t - 1]
        # neighbours' change (3x3 max): a thing that MOVES changes the next cell in the next frame; a thing that SNAPS
        # changes only here, only now
        step = (d0 > A_MIN) & (d0 > R * np.maximum(nmax(dm), nmax(d1)) + 1)
        # flash: on for exactly one frame, the cells around were quiet the frame before and the frame after (a spinning
        # wheel or a walking leg changes every frame and is not a flash)
        d2 = D[t + 2] if t + 2 < N else d1 * 0
        flash = ((d0 > A_MIN) & (d1 > A_MIN) & (E[t + 1] < 0.35 * np.minimum(d0, d1)) & (t + 1 not in cuts)
                 & (nmax(dm) * R < d0) & (nmax(d2) * R < d1))
        shot = next((s['id'] for s in ev['shots'] if s['start'] <= t / fps < s['end']), '?')
        if body is not None:
            if shot not in masks:
                masks[shot] = char_mask(body, shot, *d0.shape)
            step &= masks[shot]; flash &= masks[shot]
        for kind, m in (('step', step), ('flash', flash)):
            if m.sum() == 0:
                continue
            ys, xs = np.nonzero(m)
            out.append({'kind': kind, 'frame': t, 't': round(t / fps, 3), 'shot': shot, 'cells': int(m.sum()),
                        'peak': round(float(d0[m].max()), 1),
                        'bbox': [int(xs.min() * C), int(ys.min() * C), int((xs.max() + 1) * C), int((ys.max() + 1) * C)]})
    json.dump({'block': blk, 'frames': N, 'events': out}, open(f'{qc}/pop_{blk}.json', 'w'), indent=1)
    print(f'pop {blk}: {N} frames, {len(out)} events ({sum(e["kind"] == "step" for e in out)} step, '
          f'{sum(e["kind"] == "flash" for e in out)} flash)')
    if out:
        make_sheet(mp4, out, sheet, blk)


def grab(mp4, frame):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{(frame + 0.5) / 30:.4f}', '-i', mp4, '-frames:v', '1',
                        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-'], capture_output=True).stdout
    return np.frombuffer(b, np.uint8).reshape(H, W, 3) if len(b) == W * H * 3 else np.zeros((H, W, 3), np.uint8)


def make_sheet(mp4, out, sheet, blk):
    from PIL import Image, ImageDraw
    tiles = []
    out = sorted(out, key=lambda e: -e['cells'] * e['peak'])
    for e in out[:45]:
        x0, y0, x1, y1 = e['bbox']
        cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        s = max(120, x1 - x0 + 48, y1 - y0 + 48)
        bx0, by0 = max(0, min(W - s, cx - s // 2)), max(0, min(H - s, cy - s // 2))
        row = []
        for fr in (e['frame'] - 1, e['frame'], e['frame'] + 1):
            im = Image.fromarray(grab(mp4, fr)).crop((bx0, by0, bx0 + s, by0 + s)).resize((200, 200))
            row.append(im)
        tile = Image.new('RGB', (600, 222), (20, 20, 20))
        for k, im in enumerate(row):
            tile.paste(im, (k * 200, 22))
        ImageDraw.Draw(tile).text((4, 4), f"{blk} {e['shot']} t={e['t']} f{e['frame']} {e['kind']} pk{e['peak']}", fill=(255, 255, 0))
        tiles.append(tile)
    cols = 3; rows = (len(tiles) + cols - 1) // cols
    sh = Image.new('RGB', (600 * cols, 222 * rows), (0, 0, 0))
    for i, t in enumerate(tiles):
        sh.paste(t, ((i % cols) * 600, (i // cols) * 222))
    sh.save(sheet, quality=80)


if __name__ == '__main__':
    main()
