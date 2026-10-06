#!/usr/bin/env python3
"""Scale check for animatic blocks: is the block resolution-independent?

  python3 scripts/animatic/scale_check.py scripts/ep002-blockB-animatic.py [--n 8] [--q final]

Renders the same moments at QUALITY=review (1280x720, the design size) and at a final quality (default 2560x1440),
scales the final down to 1280x720 and compares. Anything drawn with a literal pixel value that did not go through
S() / Si() / P() lands in a different place or size and shows up as a hot spot. Output: docs/<ep>/<stem>_scalecheck.jpg
(review | final, scaled down | the difference in red) and a score per moment (% of pixels that differ). A clean block
scores ~0-1 % everywhere (resampling noise); a missed literal shows as a red shape.
"""
import json, os, subprocess, sys, tempfile
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]

RENDER = r'''
import importlib.util, json, sys
sys.path.insert(0, sys.argv[1])
spec = importlib.util.spec_from_file_location('blk', sys.argv[2]); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
ts = json.loads(sys.argv[3])
if not ts:
    t0 = getattr(m, 'T0', 0.0); t1 = m.T_END; n = int(sys.argv[5])
    st = [t for _, t in getattr(m, 'STILLS', ())]
    ts = sorted(set([round(t, 3) for t in st] + [round(t0 + (t1 - t0) * (i + .5) / n, 3) for i in range(n)]))
for i, t in enumerate(ts):
    m.render(t).convert('RGB').save(f'{sys.argv[4]}/{i:03d}.png')
print(json.dumps(ts))
'''


def render(script, quality, ts, out, n):
    env = dict(os.environ, QUALITY=quality)
    r = subprocess.run([sys.executable, '-c', RENDER, str(HERE), str(script), json.dumps(ts), str(out), str(n)],
                       env=env, capture_output=True, text=True, cwd=ROOT)
    if r.returncode:
        sys.exit(r.stderr[-3000:])
    return json.loads(r.stdout.strip().splitlines()[-1])


def main():
    script = Path(sys.argv[1]).resolve()
    n = int(sys.argv[sys.argv.index('--n') + 1]) if '--n' in sys.argv else 8
    q = sys.argv[sys.argv.index('--q') + 1] if '--q' in sys.argv else 'final'
    with tempfile.TemporaryDirectory() as tmp:
        a, b = Path(tmp, 'review'), Path(tmp, q); a.mkdir(); b.mkdir()
        ts = render(script, 'review', [], a, n)
        render(script, q, ts, b, n)
        tw, th = 426, 240
        sheet = Image.new('RGB', (tw * 3, (th + 20) * len(ts)), (20, 20, 24)); d = ImageDraw.Draw(sheet)
        scores = []
        for i, t in enumerate(ts):
            ra = Image.open(a / f'{i:03d}.png').convert('RGB')
            rb = Image.open(b / f'{i:03d}.png').convert('RGB').resize(ra.size, Image.LANCZOS)
            da = np.abs(np.asarray(ra, np.float32) - np.asarray(rb, np.float32)).mean(2)
            da = np.asarray(Image.fromarray(da.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)), np.float32)
            hot = da > 40
            score = 100 * hot.mean()
            scores.append((t, score))
            heat = np.asarray(ra, np.float32) * .35
            heat[hot] = (255, 40, 40)
            y = i * (th + 20)
            for k, im in enumerate((ra, rb, Image.fromarray(heat.astype(np.uint8)))):
                sheet.paste(im.resize((tw, th)), (k * tw, y + 20))
            d.text((4, y + 3), f'{t:7.2f}s   differs: {score:5.2f} %', fill=(255, 120, 120) if score > 1.5 else (200, 220, 200))
        ep = script.name.split('-')[0]
        out = ROOT / 'docs' / ep / f'{script.stem}_scalecheck.jpg'
        sheet.save(out, quality=82)
    worst = max(s for _, s in scores)
    print(out.relative_to(ROOT), f'worst {worst:.2f} %', ' '.join(f'{t:.1f}:{s:.1f}' for t, s in scores))


if __name__ == '__main__':
    main()
