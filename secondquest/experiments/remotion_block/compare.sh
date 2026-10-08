#!/usr/bin/env bash
# Three-way comparison of the same EP002 moment (l12-l16, 14.87 s), all with the same Bram audio:
#   1) ACTUAL - Python animatic (block C v9, 720p, upscaled)  2) HyperFrames test #3  3) Remotion (this test, 1440p)
#   4) the three side by side (Remotion large on top).
set -euo pipefail
cd "$(dirname "$0")"
B=${SRC:-origin/claude/secondquest-pilot-hook-4yw8xj}
T=$(mktemp -d)
git show "$B:secondquest/docs/ep002/EP002_blockC_animatic_v9.mp4" > $T/blockC.mp4
HF=../hyperframes/memory_2d/renders/memory_2d.mp4
FONT=${FONT:-/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf}
SC="scale=2560:1440:flags=lanczos,fps=24,setsar=1,format=yuv420p"
L="drawtext=fontfile=$FONT:fontsize=54:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=16:x=44:y=40"
D=14.87
ffmpeg -v error -y -ss 5.11 -t $D -i $T/blockC.mp4 -vf "$SC,$L:text='1 · ACTUAL  (Python animatic v9)'" -an $T/a.mp4
ffmpeg -v error -y -t $D -i $HF -vf "$SC,$L:text='2 · HyperFrames'" -an $T/b.mp4
ffmpeg -v error -y -t $D -i out/remotion_block_1440p.mp4 -vf "$SC,$L:text='3 · Remotion'" -an $T/c.mp4
ffmpeg -v error -y -ss 5.11 -t $D -i $T/blockC.mp4 -vf "scale=1280:720,fps=24,setsar=1" -an $T/a_s.mp4
ffmpeg -v error -y -t $D -i $HF -vf "scale=1280:720,fps=24,setsar=1" -an $T/b_s.mp4
DT="drawtext=fontfile=$FONT:fontsize=34:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=10"
ffmpeg -v error -y -i $T/a_s.mp4 -i $T/b_s.mp4 -t $D -i out/remotion_block_1440p.mp4 -filter_complex \
  "[0:v]$DT:x=20:y=20:text='ACTUAL'[t0];[1:v]$DT:x=20:y=20:text='HyperFrames'[t1];[t0][t1]vstack[lc];[2:v]scale=1280:720,fps=24,setsar=1,pad=1280:1440:0:360,$DT:x=20:y=380:text='Remotion'[rc];[lc][rc]hstack,format=yuv420p" -an $T/d.mp4
ffmpeg -v error -y -t $D -i out/remotion_block_1440p.mp4 -vn -ac 2 -ar 48000 $T/remotion.wav
ffmpeg -v error -y -i public/audio/bram.wav -t $D -ac 2 -ar 48000 $T/bram_only.wav   # already the block window
# audio: 1 and 2 have Bram only (as they are); 3 and 4 have the Remotion mix (Bram + sound design)
ffmpeg -v error -y -i $T/a.mp4 -i $T/b.mp4 -i $T/c.mp4 -i $T/d.mp4 -i $T/bram_only.wav -i $T/remotion.wav -filter_complex \
  "[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0[v];[4:a]asplit=2[x1][x2];[5:a]asplit=2[y1][y2];[x1][x2][y1][y2]concat=n=4:v=0:a=1[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 21 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k out/comparison_3way.mp4
rm -rf $T
echo done
