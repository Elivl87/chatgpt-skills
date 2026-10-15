#!/usr/bin/env bash
# Style frames v4 (Eli + Mila): the five pilot frames a-e (1920x1080 PNG) -> styleframes/v4/, compare_v2_v4.jpg, light
# JPGs for the phone (*_small.jpg <= 400 KB), plus the model sheet and the emotion sheet in characters/leo_mila/.
# Two Chromium at a time.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ART="$(cd "$HERE/.." && pwd)"; SF="$ART/styleframes/v4"; CH="$ART/characters/leo_mila"; mkdir -p "$SF"
r() { node "$HERE/render.mjs" --scene "$1" --still "$2" --png "$3" ${4:+--query "$4"} | grep -v '^still' || true; }
( r highway_golden 5.8 "$SF/a_golden_highway_wave.png"; r ring_field 16 "$SF/c_ring_experiment_field.png"; r toll_plaza 6 "$SF/e_overcast_toll_plaza.png"; r model_sheet 1.0 "$CH/model_sheet.png" "W=2600&H=1700" ) &
( r closeup 13.3 "$SF/b_closeup_eli_mila.png"; r highway_night 4.2 "$SF/d_night_ribbon_from_hill.png"; r emotion_sheet 1.2 "$CH/emotion_sheet.png" "W=2600&H=1880" ) &
wait
python3 - "$SF" "$ART/styleframes" "$ART/../brand/fonts" <<'PY'
import sys
from PIL import Image, ImageDraw, ImageFont
sf, root, fonts = sys.argv[1:4]
pairs = [("a_golden_highway_wave", "a_golden_highway_wave"), ("b_mascot_closeup_annoyed", "b_closeup_eli_mila"), ("c_ring_experiment_field", "c_ring_experiment_field"),
         ("d_night_ribbon_from_hill", "d_night_ribbon_from_hill"), ("e_overcast_toll_plaza", "e_overcast_toll_plaza")]
W, H, pad, lab = 960, 540, 12, 46
sheet = Image.new("RGB", (2 * W + 3 * pad, lab + 5 * (H + pad) + pad), "#15111c")
d = ImageDraw.Draw(sheet)
try: f = ImageFont.truetype(f"{fonts}/MartianMono/MartianMono[wdth,wght].ttf", 26)
except Exception: f = ImageFont.load_default()
d.text((pad, 10), "v2 (mascota, aprobado)", fill="#f3ecdd", font=f); d.text((2 * pad + W, 10), "v4 (Eli + Mila)", fill="#f3ecdd", font=f)
for k, (a, b) in enumerate(pairs):
    y = lab + k * (H + pad)
    sheet.paste(Image.open(f"{root}/v2/{a}.png").convert("RGB").resize((W, H), Image.LANCZOS), (pad, y))
    sheet.paste(Image.open(f"{sf}/{b}.png").convert("RGB").resize((W, H), Image.LANCZOS), (2 * pad + W, y))
sheet.save(f"{sf}/compare_v2_v4.jpg", quality=88)
PY
S="$HERE/small_jpg.py"
python3 "$S" "$SF/compare_v2_v4.jpg" "$SF/compare_v2_v4_small.jpg" 400000 1000
for f in a_golden_highway_wave b_closeup_eli_mila c_ring_experiment_field d_night_ribbon_from_hill e_overcast_toll_plaza; do python3 "$S" "$SF/$f.png" "$SF/${f}_small.jpg" 400000 1600; done
python3 "$S" "$CH/model_sheet.png" "$CH/model_sheet_small.jpg" 400000 1800
python3 "$S" "$CH/emotion_sheet.png" "$CH/emotion_sheet_small.jpg" 400000 1600
ls -la "$SF" "$CH"
