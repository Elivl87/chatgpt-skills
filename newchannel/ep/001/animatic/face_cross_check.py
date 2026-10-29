#!/usr/bin/env python3
"""Guardian face-crossing check (2026-10-24, independent v4 pass). A prop (flag, popcorn bucket, magnifier, pole),
a balloon or another character's limb sweeping OVER Eli's or Mila's face between two audited key frames is invisible
to the key-frame audits and reads as 'a blink' to the pop check. This decodes EVERY frame of the finished block, takes
the head discs the kit logged at the key frames (<audit dir>/faces.json: samples[].faces[].head = [x, y, r] canvas px),
interpolates them inside each shot, and measures, inside each head disc, the share of pixels whose colour is NOT one
the character's head can have (teal / green props and cars, vermilion / red props, pure blue): share > FOREIGN = a hit.
Hits are grouped into runs per character and shot; a sheet of the worst frame of each run is written to look at.
  python3 face_cross_check.py block<X>_review.mp4 <audit dir with faces.json> X <qc dir> [--sheet out.jpg] [--out 1280x720]
Exit 1 when there is at least one run (look at the sheet: a car door behind a chin in a wide shot is fine; a prop over
an eye or a mouth is a defect).
"""
import json, subprocess, sys
import numpy as np

FOREIGN = 0.05          # share of the head disc
MIN_RUN = 1             # frames


def frames(mp4, W, H):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', mp4, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-'], stdout=subprocess.PIPE)
    n = W * H * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield np.frombuffer(b, np.uint8).reshape(H, W, 3)


def foreign_mask(rgb, cid=None):
    r, g, b = [rgb[..., i].astype(np.float32) / 255 for i in range(3)]
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b); d = mx - mn + 1e-6
    s = d / (mx + 1e-6); v = mx
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    teal = (h > 140) & (h < 205) & (s > 0.3) & (v > 0.3)          # flags, teal car, green props
    red = ((h < 14) | (h > 338)) & (s > 0.5) & (v > 0.45)          # popcorn bucket, vermilion
    blue = (h > 205) & (h < 250) & (s > 0.45) & (v > 0.35)         # jeans / blue props (never on a head)
    # canonical look (2026-10-29): a character's own garments next to the head are not foreign. Eli: crimson cap #c4243a /
    # wine flannel collar (hue > 338 or < 6 when golden-lit; the vermilion of the wordmark dot and props, hue 6-14, stays foreign);
    # Mila: denim jacket collar #4d6ea6 (hue 205-235)
    if cid == 'eli1':
        red = (h >= 6) & (h < 14) & (s > 0.5) & (v > 0.45)   # the cap's warm-lit side reaches hue ~0-5; the dot #E8553A is hue 9
    if cid == 'mila1':
        blue = blue & ~((h > 205) & (h < 235))
    return teal | red | blue


def main():
    mp4, adir, blk, qc = sys.argv[1:5]
    sheet = sys.argv[sys.argv.index('--sheet') + 1] if '--sheet' in sys.argv else f'{qc}/facecross_{blk}_small.jpg'
    out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else None
    d = json.load(open(f'{adir}/faces.json'))
    OW, OH = map(int, (out or d.get('out', '1280x720')).split('x'))
    W, H = 640, 360; sx, sy = W / OW, H / OH
    FPS = 30
    by_shot = {}
    for s in d['samples']:
        for f in s['faces']:
            if not f.get('head') or f.get('alpha', 1) < 0.5:
                continue
            by_shot.setdefault(s['shot'], {}).setdefault(f['id'], []).append((s['t'], f['head']))
    for sh in by_shot.values():
        for k in sh:
            sh[k].sort()
    # time span of each shot = its samples ('start' ... 'end' / last word); frames outside every span are skipped
    shot_t = {}
    for s in d['samples']:
        a = shot_t.setdefault(s['shot'], [s['t'], s['t']]); a[0] = min(a[0], s['t']); a[1] = max(a[1], s['t'])
    yy, xx = np.mgrid[0:H, 0:W]
    series = {}
    for i, rgb in enumerate(frames(mp4, W, H)):
        t = i / FPS
        shots = [k for k, (t0, t1) in shot_t.items() if t0 - 0.05 <= t <= t1 + 0.05]
        if not shots:
            continue
        fm = None
        for shot in shots:
            for cid, keys in by_shot.get(shot, {}).items():
                if t < keys[0][0] - 0.4 or t > keys[-1][0] + 0.4:
                    continue
                # interpolate the head
                if t <= keys[0][0]:
                    hx, hy, hr = keys[0][1]
                elif t >= keys[-1][0]:
                    hx, hy, hr = keys[-1][1]
                else:
                    for (ta, ha), (tb, hb) in zip(keys, keys[1:]):
                        if ta <= t <= tb:
                            k = (t - ta) / max(1e-6, tb - ta); hx, hy, hr = [ha[j] + (hb[j] - ha[j]) * k for j in range(3)]; break
                cx, cy, r = hx * sx, hy * sy, hr * sx * 0.95
                if r < 6:
                    continue
                disc = (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r
                if fm is None:
                    fm = {}
                if cid not in fm:
                    fm[cid] = foreign_mask(rgb, cid)
                share = float((fm[cid] & disc).sum()) / max(1, disc.sum())
                series.setdefault((shot, cid), []).append({'frame': i, 't': round(t, 3), 'shot': shot, 'id': cid, 'share': round(share, 3), 'head': [round(cx / sx), round(cy / sy), round(r / sx)]})
    # a crossing is TRANSIENT: the share must rise above the shot's own baseline for that head (a teal bus-stop roof or
    # a night sky inside the disc all shot long is background, not a prop) and above FOREIGN in absolute terms
    hits = []
    for (shot, cid), ser in series.items():
        base = float(np.median([h['share'] for h in ser]))
        for h in ser:
            if h['share'] > FOREIGN and h['share'] > base + FOREIGN:
                h['base'] = round(base, 3); hits.append(h)
    hits.sort(key=lambda h: (h['id'], h['shot'], h['frame']))
    # runs
    runs = []
    for h in hits:
        if runs and runs[-1]['id'] == h['id'] and runs[-1]['shot'] == h['shot'] and h['frame'] - runs[-1]['f1'] <= 2:
            runs[-1]['f1'] = h['frame']; runs[-1]['t1'] = h['t']; runs[-1]['n'] += 1
            if h['share'] > runs[-1]['peak']:
                runs[-1]['peak'] = h['share']; runs[-1]['worst'] = h['frame']
        else:
            runs.append({'id': h['id'], 'shot': h['shot'], 'f0': h['frame'], 'f1': h['frame'], 't0': h['t'], 't1': h['t'], 'n': 1, 'peak': h['share'], 'worst': h['frame'], 'head': h['head'], 'base': h.get('base', 0)})
    runs = [r for r in runs if r['n'] >= MIN_RUN]
    json.dump({'block': blk, 'frames_hit': len(hits), 'runs': runs}, open(f'{qc}/facecross_{blk}.json', 'w'), indent=1)
    print(f'facecross {blk}: {len(hits)} frames with a transient foreign colour > {FOREIGN:.0%} (above the shot baseline) in a head disc, {len(runs)} runs')
    for r in runs:
        print(f"  {r['id']:6s} {r['shot']:14s} {r['t0']:7.3f}-{r['t1']:7.3f} s  frames {r['f0']}-{r['f1']}  peak {r['peak']:.0%} (baseline {r.get('base', 0):.0%})")
    if runs:
        try:
            from PIL import Image, ImageDraw
            tiles = []
            for r in runs[:24]:
                png = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f"{r['worst'] / FPS:.3f}", '-i', mp4, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
                import io; im = Image.open(io.BytesIO(png)).convert('RGB').resize((OW, OH))
                x, y, rr = r['head']; crop = im.crop((max(0, x - rr * 2), max(0, y - rr * 2), min(OW, x + rr * 2), min(OH, y + rr * 2))).resize((240, 240))
                dr = ImageDraw.Draw(crop); dr.text((4, 2), f"{r['id']} {r['shot']} {r['worst'] / FPS:.2f}s {r['peak']:.0%}", fill=(255, 80, 80)); tiles.append(crop)
            cols = min(6, len(tiles)); rows = (len(tiles) + cols - 1) // cols
            S = Image.new('RGB', (cols * 240, rows * 240), (20, 20, 20))
            for k, tl in enumerate(tiles):
                S.paste(tl, ((k % cols) * 240, (k // cols) * 240))
            S.save(sheet, quality=80)
            print('sheet', sheet)
        except Exception as e:
            print('sheet failed', e)
    sys.exit(1 if runs else 0)


if __name__ == '__main__':
    main()
