#!/usr/bin/env bash
# Style frames (1920x1080 PNG) + thumbnail B (1280x720 + 168x94 preview) for Ep 001. One Chromium at a time.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ART="$(cd "$HERE/.." && pwd)"; SF="$ART/styleframes"; mkdir -p "$SF"
r() { node "$HERE/render.mjs" --scene "$1" --still "$2" --png "$3"; }
r highway_golden 5.8  "$SF/a_golden_highway_wave.png"
r mascot_closeup 12.7 "$SF/b_mascot_closeup_annoyed.png"
r ring_field     16   "$SF/c_ring_experiment_field.png"
r highway_night  0    "$SF/d_night_ribbon_from_hill.png"
r thumb_b        0    "$SF/_thumb_b_1920.png"
python3 - "$SF" <<'PY'
import sys
from PIL import Image
sf = sys.argv[1]
im = Image.open(f"{sf}/_thumb_b_1920.png").convert("RGB")
im.resize((1280, 720), Image.LANCZOS).save(f"{sf}/thumb_B_es_1280x720.png", optimize=True)
im.resize((168, 94), Image.LANCZOS).save(f"{sf}/thumb_B_es_preview_168x94.png")
# preview sheet: the 168x94 on light and dark UI, plus 2x for inspection
sheet = Image.new("RGB", (168 * 2 + 30 + 336, 94 * 2 + 20), "#f1f1f1")
small = Image.open(f"{sf}/thumb_B_es_preview_168x94.png")
sheet.paste(small, (10, 10)); dark = Image.new("RGB", (188, 114), "#0f0f0f"); dark.paste(small, (10, 10)); sheet.paste(dark, (178, 0))
sheet.paste(small.resize((336, 188), Image.NEAREST), (168 * 2 + 30, 10))
sheet.save(f"{sf}/thumb_B_es_preview_sheet.png")
PY
rm -f "$SF/_thumb_b_1920.png"
ls -la "$SF"
