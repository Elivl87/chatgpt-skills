#!/usr/bin/env bash
# Build one animatic block end to end: shot events -> frames (2 Chromium workers) -> sound bed (narration cut + temp
# sfx) -> H.264 + AAC -> QC (contact sheet, pacing, black / freeze / silence, loudness).
#   TMPD=<scratch> ./build_block.sh A [draft|review|final]
# Output: animatic/block<X>_<quality>.mp4 (draft: block<X>_draft.mp4), block<X>_contact_small.jpg, qc/ (numbers).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; NC="$(cd "$HERE/../../.." && pwd)"; R="$NC/art/render"
B="${1:-A}"; Q="${2:-draft}"
case "$Q" in draft) OUT=854x480;; review) OUT=1280x720;; final) OUT=1920x1080;; *) echo "quality?"; exit 1;; esac
TMPD="${TMPD:-/tmp/claude-0/animatic_$B}"; FPS=30
mkdir -p "$TMPD/frames" "$HERE/qc"
PAGE="ep/001/animatic/index.html"; SCENE="ep001_$B"
# 1 · events (shots, cues, ambience, duration) from the page
node "$R/render.mjs" --page $PAGE --scene $SCENE --query out=$OUT --events "$TMPD/events.json" --still 0 --png "$TMPD/_ev.png" > /dev/null
DUR=$(python3 -c "import json;print(json.load(open('$TMPD/events.json'))['duration'])")
N=$(python3 -c "print(int(round($DUR*$FPS)))"); HALF=$((N/2))
echo "block $B: $DUR s, $N frames at $OUT"
# 2 · frames
if [ "${SKIP_FRAMES:-0}" != "1" ]; then
  rm -f "$TMPD"/frames/*.png; t0=$(date +%s)
  node "$R/render.mjs" --page $PAGE --scene $SCENE --query out=$OUT --fps $FPS --dur $DUR --out "$TMPD/frames" --from 0 --to $HALF > "$TMPD/r1.log" 2>&1 &
  node "$R/render.mjs" --page $PAGE --scene $SCENE --query out=$OUT --fps $FPS --dur $DUR --out "$TMPD/frames" --from $HALF --to $N > "$TMPD/r2.log" 2>&1 &
  wait; echo "frames: $(( $(date +%s) - t0 )) s wall"; tail -n 1 "$TMPD/r1.log" "$TMPD/r2.log"
fi
# 3 · sound (the full narration wav is not in git: rebuild it from the FLAC segments into the scratch dir if needed)
NAR="$NC/ep/001/audio/narration_es.wav"
if [ ! -f "$NAR" ]; then NAR="$TMPD/narration_es.wav"; [ -f "$NAR" ] || (cd "$NC/ep/001/audio" && python3 build_voice.py from-flac "$NAR"); fi
TTD_TMP="$TMPD" python3 "$HERE/sound_block.py" "$TMPD/events.json" "$NAR" "$TMPD/block.wav"
# 4 · encode (never write the mp4 in place until it is complete)
MP4="$HERE/block${B}_${Q}.mp4"; PART="$TMPD/block.part.mp4"
CRF=${CRF:-23}; [ "$Q" = "final" ] && CRF=18
ffmpeg -v error -y -framerate $FPS -i "$TMPD/frames/f_%05d.png" -i "$TMPD/block.wav" -c:v libx264 -preset slow -crf $CRF -pix_fmt yuv420p \
  -profile:v high -r $FPS -c:a aac -b:a 160k -ar 48000 -movflags +faststart -shortest "$PART"
mv "$PART" "$MP4"; echo "mp4: $MP4 ($(du -h "$MP4" | cut -f1))"
# 5 · QC
python3 "$HERE/qc_block.py" "$MP4" "$TMPD/events.json" "$HERE" "$B" "$OUT"
[ "${KEEP_FRAMES:-0}" = "1" ] || rm -rf "$TMPD/frames"
