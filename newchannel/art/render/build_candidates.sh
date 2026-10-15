#!/usr/bin/env bash
# Character candidates (2026-10-15): for each candidate the test scene (golden highway close-up), the 1920x1080 board,
# and a line-up strip; then candidates_overview.jpg (the four test scenes + the four line-ups). Max 2 Chromium at a time.
# Usage: ./build_candidates.sh [A B C D A2]     (TMPD = scratch dir for the line-up strips)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ART="$(cd "$HERE/.." && pwd)"; OUT="$ART/characters/candidates"; mkdir -p "$OUT"
TMPD="${TMPD:-/tmp/cand_tmp}"; mkdir -p "$TMPD"
CANDS="${*:-A B C D A2}"
T=12.7
one() {
  local c="$1"
  node "$HERE/render.mjs" --scene cast_scene --still $T --png "$OUT/cand_${c}_scene.png" --query "cand=$c"
  node "$HERE/render.mjs" --scene cast_board --still 1.0 --png "$OUT/cand_${c}.png" --query "cand=$c"
  node "$HERE/render.mjs" --scene cast_lineup --still 1.0 --png "$TMPD/lineup_${c}.png" --query "cand=$c"
}
set -- $CANDS
while [ $# -gt 0 ]; do
  one "$1" & p1=$!; shift
  if [ $# -gt 0 ]; then one "$1" & p2=$!; shift; wait $p2; fi
  wait $p1
done
python3 - "$OUT" "$TMPD" "$ART/../brand/fonts" <<'PY'
import sys, os
from PIL import Image, ImageDraw, ImageFont
out, tmp, fonts = sys.argv[1:4]
cands = [c for c in ["A", "B", "C", "D"] if os.path.exists(f"{out}/cand_{c}_scene.png")]
titles = {"A": "A · Leo + Mila (Max & Leo adaptados)", "B": "B · Toño + Paz (pareja nueva)", "C": "C · Chispa (mascota nueva) + Leo y Mila", "D": "D · Punto (el punto mejorado) + Leo y Mila"}
W, H, pad, lab = 960, 540, 16, 54
LH = 400
sheet = Image.new("RGB", (2 * W + 3 * pad, 60 + 2 * (lab + H + LH + pad) + pad), "#1b1420")
d = ImageDraw.Draw(sheet)
try:
    fb = ImageFont.truetype(f"{fonts}/SpaceGrotesk/SpaceGrotesk[wght].ttf", 34); fb.set_variation_by_axes([700])
    fm = ImageFont.truetype(f"{fonts}/MartianMono/MartianMono[wdth,wght].ttf", 20)
except Exception:
    fb = fm = ImageFont.load_default()
d.text((pad, 14), "Diez Mil Puntos · candidatos de personajes · escena de prueba + estatura", fill="#f3ecdd", font=fb)
for k, c in enumerate(cands):
    col, row = k % 2, k // 2
    x, y = pad + col * (W + pad), 60 + row * (lab + H + LH + pad)
    d.text((x, y + 12), titles[c], fill="#f3ecdd", font=fm)
    sheet.paste(Image.open(f"{out}/cand_{c}_scene.png").convert("RGB").resize((W, H), Image.LANCZOS), (x, y + lab))
    lu = Image.open(f"{tmp}/lineup_{c}.png").convert("RGB").crop((0, 0, 960, 400))
    sheet.paste(lu, (x, y + lab + H))
sheet.save(f"{out}/candidates_overview.jpg", quality=90)
print("overview", sheet.size)
PY
ls -la "$OUT"
