#!/usr/bin/env bash
# Build + render the EP003 hook sample. Usage: ./render.sh [extra hyperframes render flags]
set -euo pipefail
cd "$(dirname "$0")"
source ./env.sh
[ -f hook/assets/narration_hook.wav ] || python3 stage_assets.py
python3 build.py
OUT=../../docs/ep003/hyperframes/EP003_hook_hyperframes_sample.mp4
mkdir -p "$(dirname "$OUT")"
cd hook
time hyperframes render --fps 30 --quality looks --crf 20 --output "../$OUT" "$@"
