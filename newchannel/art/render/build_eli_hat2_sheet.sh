#!/usr/bin/env bash
# Eli headwear round 2 sheet -> characters/leo_mila/eli_gorro_opciones_v2_small.jpg (<= 400 KB). Renders eli_hat2_lab at
# 1920x1080: h<k> (happy, 4 views + beside Mila), s<k>_v0..4 (surprised, each view alone: ?solo=, so the surprise ticks never
# cross the neighbouring view — Guardian rule of round 1), w<k> (workshop outfit 1), L<k>_<golden|night> (the pair in light).
# Usage: build_eli_hat2_sheet.sh [workdir]   (Guardian 2026-10-29: the builder was missing from git)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ART="$(cd "$HERE/.." && pwd)"; OUT="${1:-$(mktemp -d)}"; mkdir -p "$OUT"
R() { node "$HERE/render.mjs" --scene eli_hat2_lab --still 1 --png "$1" --query "$2" >/dev/null; }
for k in 1a 1b 1c 2 3 4 5 6; do (
  R "$OUT/h$k.png" "k=$k&expr=happy"
  for v in 0 1 2 3 4; do R "$OUT/s${k}_v$v.png" "k=$k&expr=surprised&solo=$v"; done
) & done; wait
for k in 1b 4 5; do R "$OUT/w$k.png" "k=$k&outfit=1&expr=happy" & done
for k in 1a 1c; do for l in golden night; do R "$OUT/L${k}_$l.png" "k=$k&light=$l" & done; done; wait
python3 "$HERE/eli_hat2_sheet.py" "$OUT" "$ART/characters/leo_mila/eli_gorro_opciones_v2_small.jpg"
