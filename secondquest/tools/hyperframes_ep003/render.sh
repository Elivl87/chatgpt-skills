#!/usr/bin/env bash
# Build + render the EP003 hook sample. Usage: ./render.sh [extra hyperframes render flags]
set -euo pipefail
cd "$(dirname "$0")"
source ./env.sh
python3 stage_assets.py                  # always re-stage: new voice, new SFX mix, new art
python3 build.py
OUT=${OUT:-../../docs/ep003/hyperframes/EP003_hook_hyperframes_sample.mp4}
mkdir -p "$(dirname "$OUT")"
cd hook
RAW=../renders/raw_hook.mp4
mkdir -p ../renders
time hyperframes render --fps 30 --quality looks --crf 16 --output "$RAW" "$@"
python3 ../finish_post.py "$RAW" "../$OUT"           # the approved finish pass (grain, vignette, shadow halftone)
