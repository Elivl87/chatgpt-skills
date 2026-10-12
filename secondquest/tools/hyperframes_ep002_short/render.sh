#!/usr/bin/env bash
# Build + render the EP002 trailer Short (1080x1920, 30 fps), then the approved finish pass.
# Usage: ./render.sh [--no-stage] [extra hyperframes render flags]     (VERSION=1 by default)
set -euo pipefail
cd "$(dirname "$0")"
source ./env.sh
if [ "${1:-}" = "--no-stage" ]; then shift; else python3 stage_assets.py; fi
python3 build.py
V=${VERSION:-1}
OUTDIR=../../docs/publish/EP002/short_hyperframes
mkdir -p renders "$OUTDIR"
RAW=renders/raw_short_v$V.mp4
(cd short && time hyperframes render --fps 30 --quality looks --crf 16 --workers 2 --output "../$RAW" "$@")
python3 ../hyperframes_ep003/finish_post.py "$RAW" "$OUTDIR/EP002_short_hf_v$V.mp4"   # grain, vignette, shadow halftone
rm -f "$RAW"
python3 contact_sheet.py "$OUTDIR/EP002_short_hf_v$V.mp4"
