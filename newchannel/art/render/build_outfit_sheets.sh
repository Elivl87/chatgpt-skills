#!/usr/bin/env bash
# Outfit option sheets (Producer 2026-10-29): renders the outfit_lab stills in small batches, composes the three
# sheets into art/characters/leo_mila/ and deletes the stills.   TMPD=<scratch> ./build_outfit_sheets.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; TMPD="${TMPD:-/tmp/claude-0/outfits}"; mkdir -p "$TMPD"
for w in eli mila; do for n in 1 2 3 4 5 6; do nice node "$HERE/render.mjs" --scene outfit_lab --query "who=$w&n=$n" --still 0 --png "$TMPD/$w$n.png" > /dev/null; done; done
for p in 0 1 2 3; do for l in neutral golden night; do nice node "$HERE/render.mjs" --scene outfit_lab --query "pair=$p&light=$l" --still 0 --png "$TMPD/p${p}_$l.png" > /dev/null; done; done
python3 "$HERE/outfit_sheets.py" "$TMPD" "$HERE/../characters/leo_mila"
rm -f "$TMPD"/*.png
