#!/usr/bin/env python3
"""A/B contact sheet: one frame every 2 s of the stacked video (A above B per column), <= 400 KB. contact.py in.mp4 out.jpg"""
import os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont
mp4, out = sys.argv[1], sys.argv[2]
d = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-vf', 'fps=0.5,scale=427:-1', os.path.join(d, 'c_%03d.png')], check=True)
fr = sorted(f for f in os.listdir(d) if f.endswith('.png'))
ims = [Image.open(os.path.join(d, f)) for f in fr]; w, h = ims[0].size; cols = 5; rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * (w + 4) + 4, rows * (h + 22) + 30), (18, 14, 20)); dr = ImageDraw.Draw(S)
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13)
except Exception: F = ImageFont.load_default()
dr.text((6, 6), 'A/B · hook 0:00-0:30 · A = actual (arriba) / B = plano (abajo) · 1 cuadro / 2 s', fill=(240, 230, 220), font=F)
for i, im in enumerate(ims):
    x, y = 4 + (i % cols) * (w + 4), 30 + (i // cols) * (h + 22); S.paste(im, (x, y + 18)); dr.text((x + 2, y + 2), f'{i * 2:d} s', fill=(240, 230, 220), font=F)
q = 82
while True:
    S.save(out, quality=q, optimize=True)
    if os.path.getsize(out) <= 400 * 1024 or q <= 30: break
    q -= 6
print(out, os.path.getsize(out) // 1024, 'KB', S.size)
