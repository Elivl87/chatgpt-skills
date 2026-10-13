#!/usr/bin/env bash
# Build sim_test.mp4: frames (2 workers) -> sonification -> H.264/AAC mux -> QC measurements.
# Temp files live in /tmp/claude-0/sim_test_build and are deleted at the end.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP=/tmp/claude-0/sim_test_build
FF=/usr/bin/ffmpeg
mkdir -p "$TMP/frames"

python3 "$HERE/render.py" --frames "$TMP/frames" --workers 2
python3 "$HERE/sound.py" "$TMP/mix.wav"

# write to a temp name first; only move into place once the file is complete
$FF -y -hide_banner -loglevel error -threads 2 \
  -framerate 30 -i "$TMP/frames/f%04d.png" -i "$TMP/mix.wav" \
  -c:v libx264 -preset slow -crf 19 -maxrate 8M -bufsize 16M -tune grain -pix_fmt yuv420p \
  -profile:v high -level 4.1 -g 60 -r 30 \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart \
  "$TMP/sim_test.mp4"
mv "$TMP/sim_test.mp4" "$HERE/sim_test.mp4"

rm -rf /tmp/claude-0/sim_test_build
echo "wrote $HERE/sim_test.mp4 ($(du -h "$HERE/sim_test.mp4" | cut -f1))"
