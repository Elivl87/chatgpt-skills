#!/usr/bin/env python3
"""Join the 8 draft blocks A..H in order into renders/DTD_animatic_full_480p.mp4 and master the audio to -14 LUFS.

  python3 join.py [--quality 480p]

Decode + one encode (a stream-copy concat drops frames at the joins); audio is concatenated sample-exact from the
blocks' AAC, then loudnorm two-pass (linear, I=-14, TP=-2.5) so the join is continuous and mastered once.
"""
import json, re, subprocess, sys
from pathlib import Path
import imageio_ffmpeg
HERE = Path(__file__).resolve().parent
FF = imageio_ffmpeg.get_ffmpeg_exe()
q = sys.argv[sys.argv.index('--quality') + 1] if '--quality' in sys.argv else '480p'
blocks = [HERE / f'renders/blocks/DTD_block{b}_{q}.mp4' for b in 'ABCDEFGH']
for b in blocks:
    assert b.exists(), b
out = HERE / f'renders/DTD_animatic_full_{q}.mp4'
inp = [x for b in blocks for x in ('-i', str(b))]
n = len(blocks)
fc = ''.join(f'[{i}:v:0][{i}:a:0]' for i in range(n)) + f'concat=n={n}:v=1:a=1[v][a]'
tmp = HERE / 'renders/_join_raw.mp4'
subprocess.run([FF, '-y', '-v', 'error', *inp, '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '20',
                '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', '-ar', '48000', str(tmp)], check=True)
LN = 'loudnorm=I=-14:TP=-2.5:LRA=11'
r = subprocess.run([FF, '-hide_banner', '-i', str(tmp), '-af', LN + ':print_format=json', '-vn', '-f', 'null', '-'], capture_output=True, text=True).stderr
i = r.index('{', r.rindex('Parsed_loudnorm'))
m = json.JSONDecoder().raw_decode(r[i:])[0]
af = f"{LN}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run([FF, '-y', '-v', 'error', '-i', str(tmp), '-c:v', 'copy', '-af', af, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', str(out)], check=True)
tmp.unlink()
r = subprocess.run([FF, '-hide_banner', '-i', str(out), '-af', 'ebur128=peak=true', '-vn', '-f', 'null', '-'], capture_output=True, text=True).stderr
print(r[r.rindex('Summary'):])
print('->', out)
