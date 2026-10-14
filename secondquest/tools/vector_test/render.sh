#!/usr/bin/env bash
# Render the vector test: frames (scene.html, Chromium headless, CPU) -> own-synth audio -> approved finish pass.
#   ./render.sh [width=960]     -> docs/ep003/vector_test/EP003_vector_test_540p.mp4 (+ contact sheet every 0.5 s)
set -euo pipefail
cd "$(dirname "$0")"
WIDTH=${1:-960}
HEIGHT=$((WIDTH * 9 / 16))
export FFMPEG="$(python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')"
WORK=${WORK:-$(mktemp -d)}
OUTDIR=../../docs/ep003/vector_test
mkdir -p "$OUTDIR"
node render.mjs events "$WORK/events.json"
python3 audio.py "$WORK/events.json" "$WORK/sound.wav"
time node render.mjs video "$WORK/raw.mp4" "$WIDTH" 30
"$FFMPEG" -y -v error -i "$WORK/raw.mp4" -i "$WORK/sound.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "$WORK/raw_av.mp4"
python3 ../hyperframes_ep003/finish_post.py "$WORK/raw_av.mp4" "$OUTDIR/EP003_vector_test_${HEIGHT}p.mp4"
# contact sheet every 0.5 s (from the finished video)
mkdir -p "$WORK/sheet"
for i in $(seq 0 29); do
  T=$(python3 -c "print(f'{$i/2:.2f}')")
  "$FFMPEG" -y -v error -ss "$T" -i "$OUTDIR/EP003_vector_test_${HEIGHT}p.mp4" -frames:v 1 "$WORK/sheet/t$T.png"
done
python3 contact.py "$WORK/sheet" "$OUTDIR/EP003_vector_test_contact.jpg" 5 384
echo "work dir: $WORK"
