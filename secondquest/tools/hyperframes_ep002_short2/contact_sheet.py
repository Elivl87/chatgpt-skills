#!/usr/bin/env python3
"""QC of a rendered Short: a contact sheet every 0.5 s with the Shorts UI zones marked (bottom 20 %, right 12 %), a
pacing read (visual change events and the longest hold, measured on the frames), the final loudness, and a < 30 MB
copy when the file is larger (chat limit).

  python3 contact_sheet.py docs/publish/EP002/short2_hyperframes/EP002_short2_hf_v1.mp4
"""
import re, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import seg  # noqa: E402
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()

src = Path(sys.argv[1])
info = subprocess.run([FF, '-i', str(src)], capture_output=True, text=True).stderr
VW, VH = map(int, re.search(r', (\d{3,5})x(\d{3,5})', info).groups())

# every 0.5 s: one decode pass at 2 fps (frame k = k * 0.5 s + 0.25 s, the middle of each half second)
tw, th, cols = 162, 288, 12
raw = subprocess.run([FF, '-v', 'error', '-i', str(src), '-vf', f'fps=2:start_time=0,scale={tw}:{th}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                     capture_output=True, check=True).stdout
n = len(raw) // (tw * th * 3)
rows = (n + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 4), rows * (th + 18)), (28, 28, 34)); d = ImageDraw.Draw(sheet)
for i in range(n):
    im = Image.frombytes('RGB', (tw, th), raw[i * tw * th * 3:(i + 1) * tw * th * 3])
    x, y = (i % cols) * (tw + 4), (i // cols) * (th + 18)
    sheet.paste(im, (x, y + 16)); d.text((x + 3, y + 3), f'{i * .5:5.1f}s', fill=(255, 220, 90))
    d.line((x, y + 16 + th * .8, x + tw, y + 16 + th * .8), fill=(255, 70, 70)); d.line((x + tw * .88, y + 16, x + tw * .88, y + 16 + th), fill=(255, 70, 70))
out = src.with_name(src.stem + '_contact.jpg')
sheet.save(out, quality=84)
print('sheet', out, f'({n} frames, every 0.5 s)')

# pacing: visual change events at 10 fps (mean abs luma difference between frames > threshold), longest hold
raw = subprocess.run([FF, '-v', 'error', '-i', str(src), '-vf', 'fps=10,scale=90:160,format=gray', '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 160, 90).astype(np.float32)
diff = np.abs(np.diff(fr, axis=0)).mean((1, 2))
ev = [i / 10 for i in range(1, len(diff)) if diff[i] > 6 and diff[i] >= diff[i - 1]]
evs = []
for t in ev:
    if not evs or t - evs[-1] > .4:
        evs.append(t)
gaps = np.diff([0] + evs + [len(fr) / 10])
print(f'pacing: {len(evs)} visual change events in {len(fr) / 10:.1f} s ({len(evs) / (len(fr) / 600):.1f}/min), '
      f'longest hold {gaps.max():.2f} s (ends {([0] + evs + [len(fr) / 10])[int(gaps.argmax()) + 1]:.1f} s)')

mb = src.stat().st_size / 1e6
if mb > 30:                                                         # a copy under the chat limit
    lite = src.with_name(src.stem + '_light.mp4')
    kbps = int((28.5 * 8e3) / seg.DUR - 192)
    for p in (1, 2):
        subprocess.run([FF, '-v', 'error', '-y', '-i', str(src), '-c:v', 'libx264', '-preset', 'slow', '-b:v', f'{kbps}k', '-pass', str(p),
                        '-passlogfile', str(HERE / 'renders/x264pass'), '-pix_fmt', 'yuv420p']
                       + (['-an', '-f', 'mp4', '/dev/null'] if p == 1 else ['-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(HERE / 'renders/_light.mp4')]), check=True)
    Path(HERE / 'renders/_light.mp4').replace(lite)
    for f in HERE.glob('renders/x264pass*'):
        f.unlink()
    print('light copy', lite, f'{lite.stat().st_size / 1e6:.1f} MB')
m = subprocess.run([FF, '-hide_banner', '-i', str(src), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
print(src.name, f'{VW}x{VH}, {mb:.1f} MB;', ' '.join(m[m.rindex('Summary:'):].split()[:30]))
