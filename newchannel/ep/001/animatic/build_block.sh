#!/usr/bin/env bash
# Build one animatic block end to end: shot events -> frames (2 Chromium workers) -> sound bed (narration cut + temp
# sfx) -> H.264 + AAC -> QC (contact sheet, pacing, black / freeze / silence, loudness).
#   TMPD=<scratch> ./build_block.sh A [draft|review|final]
# CHUNK=600 renders and encodes 600 frames at a time (disk). Output: animatic/block<X>_<quality>.mp4 (draft: block<X>_draft.mp4), block<X>_contact_small.jpg, qc/ (numbers).
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
CRF=${CRF:-25}; [ "$Q" = "final" ] && CRF=18
VX=(-c:v libx264 -preset slow -crf $CRF -pix_fmt yuv420p -profile:v high -r $FPS)
CHUNK=${CHUNK:-0}   # > 0: render + encode CHUNK frames at a time (720p/1080p PNGs do not fit on the disk at once), segments concatenated losslessly
if [ "${SKIP_FRAMES:-0}" != "1" ]; then
  rm -f "$TMPD"/frames/*.png "$TMPD"/seg_*.mp4; t0=$(date +%s)
  if [ "$CHUNK" -gt 0 ]; then
    : > "$TMPD/segs.txt"; a=0; k=0
    while [ $a -lt $N ]; do
      b=$((a + CHUNK)); [ $b -gt $N ] && b=$N; m=$(( (a + b) / 2 ))
      nice node "$R/render.mjs" --page $PAGE --scene $SCENE --query out=$OUT --fps $FPS --dur $DUR --out "$TMPD/frames" --from $a --to $m > "$TMPD/r1.log" 2>&1 &
      nice node "$R/render.mjs" --page $PAGE --scene $SCENE --query out=$OUT --fps $FPS --dur $DUR --out "$TMPD/frames" --from $m --to $b > "$TMPD/r2.log" 2>&1 &
      wait
      SEG="$TMPD/seg_$(printf %03d $k).mp4"
      nice ffmpeg -v error -y -framerate $FPS -start_number $a -i "$TMPD/frames/f_%05d.png" -frames:v $((b - a)) "${VX[@]}" "$SEG"
      echo "file '$SEG'" >> "$TMPD/segs.txt"; rm -f "$TMPD"/frames/*.png
      echo "  chunk $k: frames $a-$b done ($(( $(date +%s) - t0 )) s)"; a=$b; k=$((k + 1))
    done
    ffmpeg -v error -y -f concat -safe 0 -i "$TMPD/segs.txt" -c copy "$TMPD/video.mp4"; rm -f "$TMPD"/seg_*.mp4
  else
    node "$R/render.mjs" --page $PAGE --scene $SCENE --query out=$OUT --fps $FPS --dur $DUR --out "$TMPD/frames" --from 0 --to $HALF > "$TMPD/r1.log" 2>&1 &
    node "$R/render.mjs" --page $PAGE --scene $SCENE --query out=$OUT --fps $FPS --dur $DUR --out "$TMPD/frames" --from $HALF --to $N > "$TMPD/r2.log" 2>&1 &
    wait
  fi
  echo "frames: $(( $(date +%s) - t0 )) s wall"; tail -n 1 "$TMPD/r1.log" "$TMPD/r2.log"
fi
# 3 · sound (the full narration wav is not in git: rebuild it from the FLAC segments into the scratch dir if needed)
NAR="$NC/ep/001/audio/narration_es.wav"
if [ ! -f "$NAR" ]; then NAR="$TMPD/narration_es.wav"; [ -f "$NAR" ] || (cd "$NC/ep/001/audio" && python3 build_voice.py from-flac "$NAR"); fi
TTD_TMP="$TMPD" python3 "$HERE/sound_block.py" "$TMPD/events.json" "$NAR" "$TMPD/block.wav"
# 4 · encode (never write the mp4 in place until it is complete)
MP4="$HERE/block${B}_${Q}.mp4"; PART="$TMPD/block.part.mp4"
if [ -f "$TMPD/video.mp4" ] && [ "$CHUNK" -gt 0 -o "${SKIP_FRAMES:-0}" = "1" ]; then
  ffmpeg -v error -y -i "$TMPD/video.mp4" -i "$TMPD/block.wav" -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$PART"   # 192k: at 160k the AAC encoder overshot the true peak by ~2 dB on voice transients (D2, E2 2026-10-29). no -shortest (it dropped 1-4 end frames to the AAC priming and the episode join drifted)
else
  ffmpeg -v error -y -framerate $FPS -i "$TMPD/frames/f_%05d.png" -i "$TMPD/block.wav" "${VX[@]}" -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$PART"
fi
mv "$PART" "$MP4"; echo "mp4: $MP4 ($(du -h "$MP4" | cut -f1))"
# 5 · QC
python3 "$HERE/qc_block.py" "$MP4" "$TMPD/events.json" "$HERE" "$B" "$OUT"
[ "${KEEP_FRAMES:-0}" = "1" ] || rm -rf "$TMPD/frames"
