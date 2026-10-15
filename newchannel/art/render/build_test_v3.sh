#!/usr/bin/env bash
# Build art/test/style_test_v3.mp4 end to end: frames (2 Chromium workers) -> sim events -> sound bed -> H.264 + AAC
# -> contact sheet + QC numbers. Temp frames live in $TMPD and are deleted at the end.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ART="$(cd "$HERE/.." && pwd)"
TMPD="${TMPD:-/tmp/claude-0/art_style_test}"; FPS=30; DUR=18.6; N=$(python3 -c "print(round($DUR*$FPS))"); HALF=$((N/2))
mkdir -p "$TMPD/frames" "$ART/test"
if [ "${SKIP_FRAMES:-0}" != "1" ]; then
  rm -f "$TMPD"/frames/*.png
  t0=$(date +%s)
  node "$HERE/render.mjs" --scene style_test --fps $FPS --dur $DUR --out "$TMPD/frames" --from 0 --to $HALF > "$TMPD/r1.log" 2>&1 &
  node "$HERE/render.mjs" --scene style_test --fps $FPS --dur $DUR --out "$TMPD/frames" --from $HALF --to $N > "$TMPD/r2.log" 2>&1 &
  wait; echo "frames: $(( $(date +%s) - t0 )) s wall for $N frames"
fi
node "$HERE/render.mjs" --scene style_test --events "$TMPD/events.json" --still 0 --png "$TMPD/_ev.png" > /dev/null
TTD_TMP="$TMPD" python3 "$HERE/sound_test.py" "$TMPD/events.json" "$TMPD/style_test.wav"
OUT="$ART/test/style_test_v3.mp4"; PART="$TMPD/style_test_v3.part.mp4"
# two-pass ~10.5 Mb/s keeps grain intact and the file < 30 MB
ffmpeg -v error -y -framerate $FPS -i "$TMPD/frames/f_%05d.png" -c:v libx264 -preset slow -b:v 10.5M -pass 1 -passlogfile "$TMPD/x264" -pix_fmt yuv420p -an -f mp4 /dev/null
ffmpeg -v error -y -framerate $FPS -i "$TMPD/frames/f_%05d.png" -i "$TMPD/style_test.wav" -c:v libx264 -preset slow -b:v 10.5M -pass 2 -passlogfile "$TMPD/x264" \
  -pix_fmt yuv420p -profile:v high -level 4.1 -r $FPS -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$PART"
mv "$PART" "$OUT"
# contact sheet: one frame every 0.6 s, 6 columns
ffmpeg -v error -y -i "$OUT" -vf "fps=1/0.6,scale=480:-1,tile=6x6:padding=4:color=0x1a1020" -frames:v 1 "$ART/test/contact_sheet_v3.jpg"
echo "size: $(du -h "$OUT" | cut -f1)"
ffprobe -v error -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate,duration -of compact "$OUT"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:|LRA:" | tail -n 3
ffmpeg -hide_banner -nostats -i "$OUT" -vf "blackdetect=d=0.1:pix_th=0.08,freezedetect=n=0.002:d=0.5" -an -f null - 2>&1 | grep -E "black_|freeze_" || echo "no black / freeze segments"
[ "${KEEP_FRAMES:-0}" = "1" ] || rm -rf "$TMPD/frames"
