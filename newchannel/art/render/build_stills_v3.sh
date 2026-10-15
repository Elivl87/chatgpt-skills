#!/usr/bin/env bash
# Style frames v3 (Quest & Pixie replace the dot mascot): the five pilot frames a-e (1920x1080 PNG) + thumbnail B
# (1280x720 + 168x94 preview) -> styleframes/v3/, and the v2|v3 comparison sheet. One Chromium at a time.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ART="$(cd "$HERE/.." && pwd)"; SF="$ART/styleframes/v3"; mkdir -p "$SF"
r() { node "$HERE/render.mjs" --scene "$1" --still "$2" --png "$3"; }
r highway_golden 5.8  "$SF/a_golden_highway_wave.png"
r closeup        12.7 "$SF/b_closeup_quest_pixie.png"
r ring_field     16   "$SF/c_ring_experiment_field.png"
r highway_night  4.2  "$SF/d_night_ribbon_from_hill.png"
r toll_plaza     6    "$SF/e_overcast_toll_plaza.png"
r thumb_b        0    "$SF/_thumb_b_1920.png"
python3 - "$SF" "$ART/styleframes" <<'PY'
import sys
from PIL import Image, ImageDraw, ImageFont
sf, root = sys.argv[1], sys.argv[2]
im = Image.open(f"{sf}/_thumb_b_1920.png").convert("RGB")
im.resize((1280, 720), Image.LANCZOS).save(f"{sf}/thumb_B_es_1280x720.png", optimize=True)
im.resize((168, 94), Image.LANCZOS).save(f"{sf}/thumb_B_es_preview_168x94.png")
pairs = [("a_golden_highway_wave", "a_golden_highway_wave"), ("b_mascot_closeup_annoyed", "b_closeup_quest_pixie"), ("c_ring_experiment_field", "c_ring_experiment_field"),
         ("d_night_ribbon_from_hill", "d_night_ribbon_from_hill"), ("e_overcast_toll_plaza", "e_overcast_toll_plaza")]
W, H, pad, lab = 960, 540, 12, 46
sheet = Image.new("RGB", (2 * W + 3 * pad, lab + 5 * (H + pad) + pad), "#15111c")
d = ImageDraw.Draw(sheet)
try: f = ImageFont.truetype(f"{root}/../../brand/fonts/MartianMono/MartianMono[wdth,wght].ttf", 26)
except Exception: f = ImageFont.load_default()
d.text((pad, 10), "v2 (mascot)", fill="#f3ecdd", font=f); d.text((2 * pad + W, 10), "v3 (Quest & Pixie)", fill="#f3ecdd", font=f)
for k, (a, b) in enumerate(pairs):
    y = lab + k * (H + pad)
    sheet.paste(Image.open(f"{root}/v2/{a}.png").convert("RGB").resize((W, H), Image.LANCZOS), (pad, y))
    sheet.paste(Image.open(f"{sf}/{b}.png").convert("RGB").resize((W, H), Image.LANCZOS), (2 * pad + W, y))
sheet.save(f"{sf}/compare_v2_v3.jpg", quality=88)
PY
rm -f "$SF/_thumb_b_1920.png"
ls -la "$SF"
