#!/usr/bin/env bash
# A/B style test (2026-10-18): the hook (block A, beats 1-3, 0 -> 30.04 s) rendered in the current cinematic style (A)
# and in the flat style (B, art/lib/flat.js + ep/001/animatic/shots_blockA_flat.js), stacked in ONE video with the same
# narration + Cine suave bed, labelled «A · actual» / «B · plano». One Chromium worker, niced (the Guardian shares the CPU).
#   TMPD=<scratch> ./build_ab.sh            -> ab_flat_vs_cine.mp4 (<= 25 MB), ab_contact_small.jpg (<= 400 KB)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; NC="$(cd "$HERE/../.." && pwd)"; R="$NC/art/render"; AN="$NC/ep/001/animatic"
TMPD="${TMPD:-/tmp/claude-0/flat_ab}"; DUR=30.04; FPS=30; OUT=854x480; mkdir -p "$TMPD/ab"
cd "$NC"
# the shared sound: block A's own Cine suave bed (events of the real block), cut at the first word of beat 4
if [ ! -f "$TMPD/ab/hook.wav" ]; then
  node "$R/render.mjs" --page ep/001/animatic/index.html --scene ep001_A --query out=$OUT --events "$TMPD/ab/events_A.json" --still 0 --png "$TMPD/ab/_ev.png" > /dev/null
  TTD_TMP="$TMPD/ab" python3 "$AN/sound_block.py" "$TMPD/ab/events_A.json" "$NC/ep/001/audio/narration_es.wav" "$TMPD/ab/blockA_full.wav" > "$TMPD/ab/sound.log"
  ffmpeg -v error -y -i "$TMPD/ab/blockA_full.wav" -t $DUR -af "afade=t=out:st=29.6:d=0.44" "$TMPD/ab/hook.wav"
fi
render() {   # name scene query
  rm -rf "$TMPD/f$1"; mkdir -p "$TMPD/f$1"; t0=$(date +%s.%N)
  nice -n 10 node "$R/render.mjs" --page ep/001/animatic/index.html --scene "$2" --query "$3" --fps $FPS --dur $DUR --out "$TMPD/f$1" > "$TMPD/render$1.log" 2>&1
  echo "$1: $(tail -n 1 "$TMPD/render$1.log")"
  ffmpeg -v error -y -framerate $FPS -i "$TMPD/f$1/f_%05d.png" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p "$TMPD/ab/$1.mp4"; rm -rf "$TMPD/f$1"
}
[ -f "$TMPD/ab/B.mp4" ] || render B ep001_Aflat "out=$OUT&style=flat"
[ -f "$TMPD/ab/A.mp4" ] || render A ep001_A "out=$OUT"
# stack + labels + the shared sound (never write the mp4 in place until it is complete)
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
ffmpeg -v error -y -i "$TMPD/ab/A.mp4" -i "$TMPD/ab/B.mp4" -i "$TMPD/ab/hook.wav" -filter_complex \
  "[0:v]drawtext=fontfile=$FONT:text='A · actual':fontsize=26:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=10:x=w-tw-18:y=h-th-18[a];\
   [1:v]drawtext=fontfile=$FONT:text='B · plano':fontsize=26:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=10:x=w-tw-18:y=h-th-18[b];\
   [a][b]vstack=inputs=2[v]" -map "[v]" -map 2:a -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -profile:v high -r $FPS -c:a aac -b:a 160k -ar 48000 -movflags +faststart -shortest "$TMPD/ab/ab.part.mp4"
mv "$TMPD/ab/ab.part.mp4" "$HERE/ab_flat_vs_cine.mp4"; echo "mp4: $HERE/ab_flat_vs_cine.mp4 ($(du -h "$HERE/ab_flat_vs_cine.mp4" | cut -f1))"
python3 "$HERE/contact.py" "$HERE/ab_flat_vs_cine.mp4" "$HERE/ab_contact_small.jpg"
