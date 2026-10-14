#!/usr/bin/env bash
# Build + render EP002 Short #2 (30 fps), then the approved finish pass, the staged -14 LUFS audio and the contact sheet.
# Usage: RES=540 ./render.sh [--no-stage] [extra hyperframes render flags]   -> 540x960 preview  (..._preview540.mp4)
#        ./render.sh [--no-stage]                                            -> 1080x1920 master (..._v$VERSION.mp4)
set -euo pipefail
cd "$(dirname "$0")"
source ./env.sh
if [ "${1:-}" = "--no-stage" ]; then shift; else python3 stage_assets.py; fi
RES=${RES:-1080} python3 build.py
V=${VERSION:-1}
OUTDIR=../../docs/publish/EP002/short2_hyperframes
mkdir -p renders "$OUTDIR"
if [ "${RES:-1080}" = "1080" ]; then NAME=EP002_short2_hf_v$V; else NAME=EP002_short2_hf_v${V}_preview${RES}; fi
RAW=renders/raw_$NAME.mp4
(cd short && time hyperframes render --fps 30 --quality looks --crf 16 --workers 2 --output "../$RAW" "$@")
F="$OUTDIR/$NAME.mp4"
python3 ../hyperframes_ep003/finish_post.py "$RAW" renders/_fin.mp4   # grain, vignette, shadow halftone
rm -f "$RAW"
# the audio of the delivery is exactly the staged master (-14 LUFS / <= -1 dBTP, stereo), AAC 256k; written aside, then moved
"$HYPERFRAMES_FFMPEG_PATH" -v error -y -i renders/_fin.mp4 -i short/assets/narration.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart renders/_mux.mp4
rm -f renders/_fin.mp4
mv renders/_mux.mp4 "$F"
python3 contact_sheet.py "$F"
