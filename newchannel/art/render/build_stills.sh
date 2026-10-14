#!/usr/bin/env bash
# Style frames v2 (1920x1080 PNG, a-e) + thumbnail B (1280x720 + 168x94 preview) for Ep 001 -> styleframes/v2/.
# v1 frames stay in styleframes/ for the comparison sheet. One Chromium at a time.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ART="$(cd "$HERE/.." && pwd)"; SF="$ART/styleframes/v2"; mkdir -p "$SF"
r() { node "$HERE/render.mjs" --scene "$1" --still "$2" --png "$3"; }
r highway_golden 5.8  "$SF/a_golden_highway_wave.png"
r mascot_closeup 12.7 "$SF/b_mascot_closeup_annoyed.png"
r ring_field     16   "$SF/c_ring_experiment_field.png"
r highway_night  4    "$SF/d_night_ribbon_from_hill.png"
r toll_plaza     6    "$SF/e_overcast_toll_plaza.png"
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
# v1 vs v2 comparison sheet (rows a-d: v1 | v2; row e: the new overcast frame)
python3 - "$ART/styleframes" <<'PY'
import sys
from PIL import Image, ImageDraw, ImageFont
root = sys.argv[1]; names = ["a_golden_highway_wave", "b_mascot_closeup_annoyed", "c_ring_experiment_field", "d_night_ribbon_from_hill"]
W, H, pad, lab = 960, 540, 12, 46
sheet = Image.new("RGB", (2 * W + 3 * pad, lab + 5 * (H + pad) + pad), "#15111c")
d = ImageDraw.Draw(sheet)
try: f = ImageFont.truetype(f"{root}/../../brand/fonts/MartianMono/MartianMono[wdth,wght].ttf", 26)
except Exception: f = ImageFont.load_default()
d.text((pad, 10), "v1", fill="#f3ecdd", font=f); d.text((2 * pad + W, 10), "v2", fill="#f3ecdd", font=f)
for k, n in enumerate(names):
    y = lab + k * (H + pad)
    sheet.paste(Image.open(f"{root}/{n}.png").convert("RGB").resize((W, H), Image.LANCZOS), (pad, y))
    sheet.paste(Image.open(f"{root}/v2/{n}.png").convert("RGB").resize((W, H), Image.LANCZOS), (2 * pad + W, y))
y = lab + 4 * (H + pad)
d.text((pad + 20, y + H // 2 - 40), "e · overcast noon", fill="#f3ecdd", font=f); d.text((pad + 20, y + H // 2), "(new in v2)", fill="#b9b2c6", font=f)
sheet.paste(Image.open(f"{root}/v2/e_overcast_toll_plaza.png").convert("RGB").resize((W, H), Image.LANCZOS), (2 * pad + W, y))
sheet.save(f"{root}/v2/compare_v1_v2.jpg", quality=88)
PY
ls -la "$SF"
