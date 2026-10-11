#!/usr/bin/env python3
"""Join the rendered EP003 blocks (docs/ep003/hyperframes/EP003_block{A..G}.mp4) into the full episode.
Video: each block trimmed to its span on the narration (blocks.span) so there are no seams or drift; audio: the whole
narration+SFX mix (public/episodes/ep003/audio/mix.wav) in one piece, mastered to -14 LUFS / -1 dBTP (two-pass
loudnorm). Out: docs/ep003/hyperframes/EP003_full_hyperframes.mp4 (+ a <30 MB review copy)."""
import json, re, subprocess, sys
from pathlib import Path
import imageio_ffmpeg
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from blocks import span, ORDER  # noqa
ROOT = HERE.parents[1]
FF = imageio_ffmpeg.get_ffmpeg_exe()
D = ROOT / 'docs/ep003/hyperframes'
parts, total = [], 0.0
for b in ORDER:
    t0, t1 = span(b)
    if b == 'A':
        t1 = span('B')[0]                                   # the hook ends where block B starts
    parts.append((D / f'EP003_block{b}.mp4', round(t1 - t0, 3)))
    total += t1 - t0
inputs, flt = [], []
for i, (p, dur) in enumerate(parts):
    inputs += ['-i', str(p)]
    flt.append(f'[{i}:v]trim=0:{dur},setpts=PTS-STARTPTS,fps=30,format=yuv420p[v{i}]')
flt.append(''.join(f'[v{i}]' for i in range(len(parts))) + f'concat=n={len(parts)}:v=1:a=0[v]')
mix = ROOT / 'public/episodes/ep003/audio/mix.wav'
an = subprocess.run([FF, '-hide_banner', '-i', str(mix), '-t', str(total), '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json',
                     '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', an, re.S).group(0))
ln = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
out = D / 'EP003_full_hyperframes.mp4'
subprocess.run([FF, '-y', '-v', 'error', *inputs, '-i', str(mix), '-filter_complex', ';'.join(flt),
                '-map', '[v]', '-map', f'{len(parts)}:a', '-af', ln, '-t', str(round(total, 3)),
                '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', str(out)], check=True)
rev = D / 'EP003_full_hyperframes_review.mp4'
subprocess.run([FF, '-y', '-v', 'error', '-i', str(out), '-vf', 'scale=854:480', '-c:v', 'libx264', '-crf', '28', '-preset', 'slow',
                '-c:a', 'aac', '-b:a', '128k', str(rev)], check=True)
print('episode', round(total, 2), 's ->', out.name, out.stat().st_size // 2**20, 'MB; review', rev.stat().st_size // 2**20, 'MB')
