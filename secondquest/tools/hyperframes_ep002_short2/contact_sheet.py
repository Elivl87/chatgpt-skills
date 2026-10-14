#!/usr/bin/env python3
"""Contact sheet of a rendered Short at its beats (word tokens), with the Shorts UI zones marked (bottom 20 %, right 12 %),
plus a < 30 MB copy when the file is larger (chat limit) and the final loudness.

  python3 contact_sheet.py docs/publish/EP002/short_hyperframes/EP002_short_hf_v1.mp4
"""
import re, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import seg  # noqa: E402
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()

src = Path(sys.argv[1])
T = seg.table()
BEATS = [('hook', .15), ('castle', T['l07.w8']), ('ground', T['l07.w11']), ('You.', T['l08.w1'] + .2), ('graphics', T['l03.w2']),
         ('orchestra', T['l03.w4'] + .3), ('voices', T['l03.w5'] + .3), ('controls', T['l03.w7']), ('camera', T['l03.w10']),
         ('ocarina', T['l04.w3']), ('sword', T['l05.w3']), ('Triforce', T['l06.w3'] + .2), ('cartridge', T['l11.w5']),
         ('not exactly', T['l11.w10']), ('game...', T['l12.w4']), ('room', T['l13.w3']), ('television', T['l14.w3']),
         ('friend', T['l15.w6']), ('enormous?', T['l17.w4']), ('enormous', T['l17.w9'] + .4), ('actual size', T['l18.w5']),
         ('smaller', T['l19.w4']), ('wakes', T['l22.w2'] + .1), ('Man...', T['l23.w2']), ('texture', T['l23.w8']),
         ('controller', T['l125.w6'] + .4), ('different', T['l125.w8'] + .3), ('go back', T['l09.w6']), ('So, why?', T['l10.w2'] + .3),
         ('star', T['l10.end'] + .6), ('card', T['DUR'] - .4)]
w, h, cols = 216, 384, 8
rows = (len(BEATS) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (w + 6), rows * (h + 22)), (28, 28, 34)); d = ImageDraw.Draw(sheet)
for i, (name, t) in enumerate(BEATS):
    raw = subprocess.run([FF, '-v', 'error', '-ss', f'{t:.3f}', '-i', str(src), '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         capture_output=True, check=True).stdout
    im = Image.frombytes('RGB', (1080, 1920), raw).resize((w, h), Image.LANCZOS)
    x, y = (i % cols) * (w + 6), (i // cols) * (h + 22)
    sheet.paste(im, (x, y + 20)); d.text((x + 3, y + 4), f'{t:5.2f}s {name}', fill=(255, 220, 90))
    d.line((x, y + 20 + h * .8, x + w, y + 20 + h * .8), fill=(255, 70, 70)); d.line((x + w * .88, y + 20, x + w * .88, y + 20 + h), fill=(255, 70, 70))
out = src.with_name(src.stem + '_contact.jpg')
sheet.save(out, quality=86)
print('sheet', out)

mb = src.stat().st_size / 1e6
if mb > 30:                                                         # a copy under the chat limit
    lite = src.with_name(src.stem + '_light.mp4')
    kbps = int((28.5 * 8e3) / seg.DUR - 192)
    for p in (1, 2):
        subprocess.run([FF, '-v', 'error', '-y', '-i', str(src), '-c:v', 'libx264', '-preset', 'slow', '-b:v', f'{kbps}k', '-pass', str(p),
                        '-passlogfile', str(HERE / 'renders/x264pass'), '-pix_fmt', 'yuv420p']
                       + (['-an', '-f', 'mp4', '/dev/null'] if p == 1 else ['-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(lite)]), check=True)
    print('light copy', lite, f'{lite.stat().st_size / 1e6:.1f} MB')
m = subprocess.run([FF, '-hide_banner', '-i', str(src), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
print(src.name, f'{mb:.1f} MB;', ' '.join(m[m.rindex('Summary:'):].split()[:30]))
