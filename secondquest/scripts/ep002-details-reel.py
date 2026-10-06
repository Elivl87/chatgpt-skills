#!/usr/bin/env python3
"""EP002: one reel with every new video-game detail, cut from the latest block renders (for the Producer).

  python3 scripts/ep002-details-reel.py    # -> docs/ep002/EP002_videogame_details_reel.mp4
"""
import re, subprocess, sys
from pathlib import Path
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
FF = imageio_ffmpeg.get_ffmpeg_exe()
START = {'B': 8.72, 'D': 49.14, 'I': 160.52, 'J': 185.60, 'N': 256.52, 'P': 291.65, 'R': 336.98, 'S_A': 361.77, 'U': 402.81}
CLIPS = [('B', 13.0, 19.6), ('D', 71.3, 74.4), ('I', 176.3, 179.2), ('J', 189.0, 192.0), ('N', 256.7, 259.8),
         ('P', 294.4, 297.4), ('R', 346.5, 350.2), ('S_A', 363.4, 366.4), ('U', 408.0, 412.8)]


def newest(b):
    pat = 'EP002_blockS_animatic_A_v*.mp4' if b == 'S_A' else f'EP002_block{b}_animatic_v*.mp4'
    return sorted((ROOT / 'docs/ep002').glob(pat), key=lambda p: int(re.search(r'_v(\d+)\.mp4', p.name).group(1)))[-1]


def main():
    tmp = ROOT / 'docs/ep002/walks'
    parts = []
    for i, (b, a, z) in enumerate(CLIPS):
        out = tmp / f'_detail_{i}.mp4'
        subprocess.run([FF, '-v', 'error', '-y', '-ss', f'{a - START[b]:.2f}', '-t', f'{z - a:.2f}', '-i', str(newest(b)),
                        '-c:v', 'libx264', '-crf', '21', '-pix_fmt', 'yuv420p', '-r', '24', '-c:a', 'aac', '-ar', '48000', '-ac', '2', str(out)], check=True)
        parts.append(out)
    lst = tmp / '_detail_list.txt'
    lst.write_text(''.join(f"file '{p.name}'\n" for p in parts))
    final = ROOT / 'docs/ep002/EP002_videogame_details_reel.mp4'
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c', 'copy', str(final)], check=True)
    for p in parts + [lst]:
        p.unlink()
    print(final.relative_to(ROOT))


if __name__ == '__main__':
    main()
