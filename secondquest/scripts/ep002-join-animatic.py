#!/usr/bin/env python3
"""EP002: join the approved block animatics into the whole episode (planning only).

  python3 scripts/ep002-join-animatic.py      # docs/ep002/EP002_animatic_full_v<VERSION>.mp4 + its chapter list

Each block clip carries its own slice of Bram's narration (and its own approved sounds: the seq-01 mix, Navi's trail
in block U), so the join re-encodes video and audio together with ffmpeg's concat filter. Block boundaries lose at most
one frame each (every block renders int(duration * 24) frames). Update APPROVED when a block gets a new approved version.
"""
import re, subprocess, sys
from pathlib import Path
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
FF = imageio_ffmpeg.get_ffmpeg_exe()
D = ROOT / 'docs/ep002'

VERSION = 2                                               # v1: every block approved (2026-10-05); v2: the final art in every block
APPROVED = [                                              # (label, clip) in episode order: the version of each block in this cut
    ('Seq 01 · the cartridge, Navi comes out of the TV', 'EP002_cartridge_animatic_v12.mp4'),
    ('B · new graphics, the three anchors, "So, why?"', 'EP002_blockB_animatic_v8.mp4'),
    ('C · the game plus the room', 'EP002_blockC_animatic_v6.mp4'),
    ('D', 'EP002_blockD_animatic_v6.mp4'),
    ('E', 'EP002_blockE_animatic_v6.mp4'),
    ('F (option B, Hyrule)', 'EP002_blockF_B_animatic_v7.mp4'),
    ('G', 'EP002_blockG_animatic_v6.mp4'),
    ('H', 'EP002_blockH_animatic_v8.mp4'),
    ('I', 'EP002_blockI_animatic_v6.mp4'),
    ('J', 'EP002_blockJ_animatic_v4.mp4'),
    ('K', 'EP002_blockK_animatic_v3.mp4'),
    ('L · the museum, the Switch 2', 'EP002_blockL_animatic_v4.mp4'),
    ('M · the forest map', 'EP002_blockM_animatic_v3.mp4'),
    ('N · the temple, the two eras', 'EP002_blockN_animatic_v8.mp4'),
    ('O · what those limitations made you feel', 'EP002_blockO_animatic_v5.mp4'),
    ('P · back to the room', 'EP002_blockP_animatic_v3.mp4'),
    ('Q · everything is still there', 'EP002_blockQ_animatic_v2.mp4'),
    ('R · same road, different person', 'EP002_blockR_animatic_v5.mp4'),
    ('S · the remake engine (option A)', 'EP002_blockS_animatic_A_v4.mp4'),
    ('T · the meeting on the road (option B)', 'EP002_blockT_animatic_v4.mp4'),
    ('U · our next quest', 'EP002_blockU_animatic_v3.mp4'),
]


def duration(p):
    err = subprocess.run([FF, '-i', str(p)], capture_output=True, text=True).stderr
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])


def main():
    out = D / f'EP002_animatic_full_v{VERSION}.mp4'
    clips = [D / f for _, f in APPROVED]
    missing = [c for c in clips if not c.exists()]
    if missing:
        sys.exit(f'missing clips: {missing}')
    args = [FF, '-v', 'error', '-y']
    for c in clips:
        args += ['-i', str(c)]
    n = len(clips)
    fc = ''.join(f'[{i}:v][{i}:a]' for i in range(n)) + f'concat=n={n}:v=1:a=1[v][a]'
    args += ['-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '20', '-preset', 'medium',
             '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart', str(out)]
    subprocess.run(args, check=True)
    t, lines = 0.0, [f'# EP002 full animatic v{VERSION}: chapters (block starts)', '']
    for (label, f), c in zip(APPROVED, clips):
        lines.append(f'{int(t // 60)}:{t % 60:05.2f}  {label}  ({f})')
        t += duration(c)
    lines += ['', f'total {int(t // 60)}:{t % 60:05.2f}']
    (D / f'EP002_animatic_full_v{VERSION}_chapters.txt').write_text('\n'.join(lines) + '\n')
    print(out.relative_to(ROOT), f'{duration(out):.2f}s')


if __name__ == '__main__':
    main()
