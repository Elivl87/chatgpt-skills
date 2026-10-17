#!/usr/bin/env bash
# EP003 v3.4 final: hook A + B (main repo, v3.3 sources) + C-G (base cut 717b244d sources, v3.4 fixes) + spliced mix.
set -euo pipefail
cd /tmp/claude-0/splice
M=/home/user/chatgpt-skills/secondquest/docs/ep003/hyperframes; O=/home/user/ep003base/secondquest/docs/ep003/hyperframes
FF=$(python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')
F="[0:v]trim=0:40.76,setpts=PTS-STARTPTS,fps=30,format=yuv420p[v0];[1:v]trim=0:21.0,setpts=PTS-STARTPTS,fps=30,format=yuv420p[v1]"
i=2; for d in 44.21 57.3 75.97 54.66 34.5; do F="$F;[$i:v]trim=0:$d,setpts=PTS-STARTPTS,fps=30,format=yuv420p[v$i]"; i=$((i+1)); done
F="$F;[v0][v1][v2][v3][v4][v5][v6]concat=n=7:v=1:a=0,scale=1920:1080:flags=lanczos[v]"
AN=$($FF -hide_banner -i spliced_mix_sfx.wav -af loudnorm=I=-14:TP=-2.0:LRA=11:print_format=json -f null - 2>&1 | python3 -c "import sys,re,json;m=json.loads(re.search(r'\{[^{}]*\"input_i\"[^{}]*\}',sys.stdin.read(),re.S).group(0));print(f\"loudnorm=I=-14:TP=-2.0:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true\")")
$FF -y -v error -i $M/EP003_blockA.mp4 -i $M/EP003_blockB.mp4 -i $O/EP003_blockC.mp4 -i $O/EP003_blockD.mp4 -i $O/EP003_blockE.mp4 -i $O/EP003_blockF.mp4 -i $O/EP003_blockG.mp4 -i spliced_mix_sfx.wav \
  -filter_complex "$F" -map "[v]" -map 7:a -af "$AN" -t 328.4 -c:v libx264 -crf 16 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 320k -ar 48000 EP003_master_1080p.mp4
ls -la EP003_master_1080p.mp4
