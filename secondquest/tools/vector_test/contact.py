#!/usr/bin/env python3
"""Contact sheet of stills (t*.png in a folder), labelled with their time.  contact.py <dir> <out.jpg> [cols=5] [thumb_w=384]"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

d, out = Path(sys.argv[1]), sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 5
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 384
files = sorted(d.glob('t*.png'), key=lambda p: float(p.stem[1:]))
th = tw * 9 // 16
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 4) + 4, rows * (th + 4) + 4), (20, 18, 26))
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    x, y = 4 + (i % cols) * (tw + 4), 4 + (i // cols) * (th + 4)
    sheet.paste(Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS), (x, y))
    dr.rectangle([x, y, x + 52, y + 18], fill=(20, 18, 26)); dr.text((x + 4, y + 3), f'{float(f.stem[1:]):.1f} s', fill=(255, 210, 90))
sheet.save(out, quality=88)
print(out, len(files))
