#!/usr/bin/env python3
"""The approved finish pass (scripts/animatic/finish.py: paper grain, vignette, halftone in deep shadows) as a post-pass
on a Hyperframes render, so EP003 in Hyperframes gets exactly the same finish as every other frame (rule, 2026-10-11).
Deterministic per frame (static grain), audio copied untouched.

  python3 finish_post.py in.mp4 out.mp4
"""
import subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts/animatic'))
from finish import finish  # noqa
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
src, dst = sys.argv[1], sys.argv[2]
info = subprocess.run([FF, '-i', src], capture_output=True, text=True).stderr
import re
w, h = map(int, re.search(r', (\d{3,5})x(\d{3,5})', info).groups())
fps = re.search(r'([\d.]+) fps', info).group(1)
rd = subprocess.Popen([FF, '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
wr = subprocess.Popen([FF, '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', fps, '-i', '-',
                       '-i', src, '-map', '0:v', '-map', '1:a?', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18',
                       '-preset', 'medium', '-c:a', 'copy', dst], stdin=subprocess.PIPE)
n = 0
while True:
    buf = rd.stdout.read(w * h * 3)
    if len(buf) < w * h * 3:
        break
    fr = Image.fromarray(np.frombuffer(buf, np.uint8).reshape(h, w, 3))
    wr.stdin.write(finish(fr).tobytes()); n += 1
wr.stdin.close(); wr.wait(); rd.wait()
print('finish pass:', n, 'frames ->', dst)
