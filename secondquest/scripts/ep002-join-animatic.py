#!/usr/bin/env python3
"""EP002: join the approved block animatics into the whole episode (planning only).

  QUALITY=review python3 scripts/ep002-join-animatic.py   # docs/ep002/EP002_animatic_full_v<VERSION>.mp4 + chapters
  (each block must have been rendered at the same QUALITY first; final = 1440p for YouTube, only with approval)

Each block clip carries its own slice of Bram's narration (and its own approved sounds: the seq-01 mix, Navi's trail
in block U), so the join re-encodes video and audio together with ffmpeg's concat filter. Block boundaries lose at most
one frame each (every block renders int(duration * 24) frames). Update APPROVED when a block gets a new approved version.
"""
import re, subprocess, sys
from pathlib import Path
import imageio_ffmpeg

sys.path.insert(0, str(Path(__file__).resolve().parent / 'animatic'))
from lib import QUALITY, out_path, video_args, audio_args  # noqa: E402  (QUALITY=draft / review / final / final1080)

ROOT = Path(__file__).resolve().parents[1]
FF = imageio_ffmpeg.get_ffmpeg_exe()
D = ROOT / 'docs/ep002'

VERSION = 6                                               # v6 Producer fixes: B Triforce lock-on, O handheld table, J toon gags
APPROVED = [                                              # (label, block script) in episode order; each clip is that script's
    ('Seq 01 · the cartridge, Navi comes out of the TV', 'ep002-cartridge-animatic.py'),   # current output at this QUALITY
    ('B · new graphics, the three anchors, "So, why?"', 'ep002-blockB-animatic.py'),
    ('C · the game plus the room', 'ep002-blockC-animatic.py'),
    ('D', 'ep002-blockD-animatic.py'),
    ('E', 'ep002-blockE-animatic.py'),
    ('F (option B, Hyrule)', 'ep002-blockF-B-animatic.py'),
    ('G', 'ep002-blockG-animatic.py'),
    ('H', 'ep002-blockH-animatic.py'),
    ('I', 'ep002-blockI-animatic.py'),
    ('J', 'ep002-blockJ-animatic.py'),
    ('K', 'ep002-blockK-animatic.py'),
    ('L · the museum, the Switch 2', 'ep002-blockL-animatic.py'),
    ('M · the forest map', 'ep002-blockM-animatic.py'),
    ('N · the temple, the two eras', 'ep002-blockN-animatic.py'),
    ('O · what those limitations made you feel', 'ep002-blockO-animatic.py'),
    ('P · back to the room', 'ep002-blockP-animatic.py'),
    ('Q · everything is still there', 'ep002-blockQ-animatic.py'),
    ('R · same road, different person', 'ep002-blockR-animatic.py'),
    ('S · the remake engine (option A)', 'ep002-blockS-A-animatic.py'),
    ('T · the meeting on the road (option B)', 'ep002-blockT-animatic.py'),
    ('U · our next quest', 'ep002-blockU-animatic.py'),
]


def clip_of(script):
    """The clip a block script writes at this QUALITY (its out_path)."""
    m = re.search(r"out = out_path\(ROOT / '([^']+\.mp4)'\)", (ROOT / 'scripts' / script).read_text())
    return out_path(ROOT / m[1])


def duration(p):
    err = subprocess.run([FF, '-i', str(p)], capture_output=True, text=True).stderr
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])


def main():
    out = out_path(D / f'EP002_animatic_full_v{VERSION}.mp4')
    clips = [clip_of(f) for _, f in APPROVED]
    missing = [c for c in clips if not c.exists()]
    if missing:
        sys.exit(f'missing clips: {missing}')
    args = [FF, '-v', 'error', '-y']
    for c in clips:
        args += ['-i', str(c)]
    n = len(clips)
    fc = ''.join(f'[{i}:v][{i}:a]' for i in range(n)) + f'concat=n={n}:v=1:a=1[v][a]'
    args += ['-filter_complex', fc, '-map', '[v]', '-map', '[a]', *video_args(), *audio_args(), '-ar', '48000', '-movflags', '+faststart', str(out)]
    subprocess.run(args, check=True)
    t, lines = 0.0, [f'# EP002 full animatic v{VERSION}: chapters (block starts)', '']
    for (label, f), c in zip(APPROVED, clips):
        lines.append(f'{int(t // 60)}:{t % 60:05.2f}  {label}  ({c.name})')
        t += duration(c)
    lines += ['', f'total {int(t // 60)}:{t % 60:05.2f}']
    out.with_name(out.stem + '_chapters.txt').write_text('\n'.join(lines) + '\n')
    print(out.relative_to(ROOT), f'{duration(out):.2f}s')


if __name__ == '__main__':
    main()
