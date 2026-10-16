#!/usr/bin/env bash
# Faces audit for animatic blocks: key acting frames -> automated eye check -> face contact sheet.
#   TMPD=<scratch> ./faces_audit.sh A [B ...]   (TAG=before|after, OUT=854x480)
# Output: qc/faces_block<X>_small.jpg (<= 400 KB) and qc/faces_<X>[_TAG].json (failures listed). 1 Chromium worker
# per block; run two blocks in parallel at most (4 CPU).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; TMPD="${TMPD:-/tmp/claude-0/faces}"; OUT="${OUT:-854x480}"; TAG="${TAG:-}"
for B in "$@"; do
  D="$TMPD/faces_$B${TAG:+_$TAG}"; rm -rf "$D"
  node "$HERE/faces_audit.mjs" --block "$B" --out "$OUT" --dir "$D"
  SHEET="$HERE/qc/faces_block${B}_small.jpg"; [ -n "$TAG" ] && [ "$TAG" != "after" ] && SHEET="$D/faces_block${B}_${TAG}_small.jpg"
  python3 "$HERE/faces_check.py" "$D" "$B" "$HERE/qc" ${TAG:+--tag $TAG} --sheet "$SHEET"
  [ "${KEEP_FRAMES:-0}" = "1" ] || rm -f "$D"/s_*.png
done
