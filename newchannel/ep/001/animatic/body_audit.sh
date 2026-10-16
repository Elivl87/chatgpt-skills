#!/usr/bin/env bash
# Guardian audit (head to toe) for animatic blocks: ONE render of the key acting frames -> the eye check (faces_check.py)
# + the body checks (body_check.py) -> face sheet (qc/faces_block<X>_small.jpg) + body pages (<TMPD>/pages/body_<X>_pNN.jpg).
#   TMPD=<scratch> ./body_audit.sh A [B ...]     (OUT=854x480; two blocks in parallel at most on 4 CPU)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; TMPD="${TMPD:-/tmp/claude-0/guardian}"; OUT="${OUT:-854x480}"
for B in "$@"; do
  D="$TMPD/body_$B"; rm -rf "$D"
  node "$HERE/faces_audit.mjs" --block "$B" --out "$OUT" --dir "$D"
  python3 "$HERE/faces_check.py" "$D" "$B" "$HERE/qc" --tag after --sheet "$HERE/qc/faces_block${B}_small.jpg"
  python3 "$HERE/body_check.py" "$D" "$B" "$HERE/qc" --pages "$TMPD/pages"
  [ "${KEEP_FRAMES:-0}" = "1" ] || rm -f "$D"/s_*.png
done
