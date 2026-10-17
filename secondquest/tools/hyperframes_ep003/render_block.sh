#!/usr/bin/env bash
# Render one EP003 block (B..G): stage, build, Hyperframes render, approved finish pass.
# Usage: ./render_block.sh B [extra hyperframes render flags]   (A = the hook project, hook/)
set -euo pipefail
cd "$(dirname "$0")"
source ./env.sh
B="$1"; shift
python3 stage_assets.py --block "$B"
python3 build.py --block "$B"
mkdir -p renders ../../docs/ep003/hyperframes
PROJ="block$B"; [ "$B" = A ] && PROJ=hook
cd "$PROJ"
time hyperframes render --fps 30 --quality looks --crf 16 --output "../renders/raw_block$B.mp4" "$@"
cd ..
python3 finish_post.py "renders/raw_block$B.mp4" "../../docs/ep003/hyperframes/EP003_block$B.mp4"
rm -f "renders/raw_block$B.mp4"                      # intermediate only; the finished block is in docs/
