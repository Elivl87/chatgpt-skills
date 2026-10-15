#!/usr/bin/env bash
# Eli + Mila · five alternative designs (2026-10-15): per alt the shared test scene (golden-hour car close-up, tight),
# the 1920x1080 board and a line-up strip; then light JPGs for the phone (<= 350 KB each) and
# alternatives_overview_small.jpg (<= 450 KB). Max 2 Chromium at a time.
# Usage: TMPD=<scratch> ./build_alternatives.sh [1 2 3 4 5]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ART="$(cd "$HERE/.." && pwd)"; OUT="$ART/characters/leo_mila/alternatives"; mkdir -p "$OUT"
TMPD="${TMPD:-/tmp/alt_tmp}"; mkdir -p "$TMPD"
ALTS="${*:-1 2 3 4 5}"
one() {
  local n="$1"
  node "$HERE/render.mjs" --scene alt_scene --still 12.7 --png "$OUT/alt_${n}_scene.png" --query "alt=$n" | grep -v '^still' || true
  node "$HERE/render.mjs" --scene alt_board --still 1.0 --png "$OUT/alt_${n}.png" --query "alt=$n" | grep -v '^still' || true
  node "$HERE/render.mjs" --scene alt_lineup --still 1.0 --png "$TMPD/lineup_${n}.png" --query "alt=$n" | grep -v '^still' || true
}
set -- $ALTS
while [ $# -gt 0 ]; do
  one "$1" & p1=$!; shift
  if [ $# -gt 0 ]; then one "$1" & p2=$!; shift; wait $p2; fi
  wait $p1
done
python3 - "$OUT" "$TMPD" "$ART/../brand/fonts" <<'PY'
import sys, os, io
from PIL import Image, ImageDraw, ImageFont
out, tmp, fonts = sys.argv[1:4]
def save_small(im, path, limit, w=1280):
    im = im.convert("RGB"); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    for q in (86, 82, 78, 74, 70, 65, 60, 55):
        b = io.BytesIO(); im.save(b, "JPEG", quality=q, optimize=True, progressive=True)
        if b.tell() <= limit: open(path, "wb").write(b.getvalue()); return q, b.tell()
    open(path, "wb").write(b.getvalue()); return q, b.tell()
for n in range(1, 6):
    if not os.path.exists(f"{out}/alt_{n}.png"): continue
    print(n, "board", save_small(Image.open(f"{out}/alt_{n}.png"), f"{out}/alt_{n}_small.jpg", 350_000))
    print(n, "scene", save_small(Image.open(f"{out}/alt_{n}_scene.png"), f"{out}/alt_{n}_scene_small.jpg", 350_000))
names = {1: "Taller (actuales, pulidos)", 2: "Carretera 70", 3: "Barrio", 4: "Ruta verde (Eli alto)", 5: "Laboratorio"}
try:
    fb = ImageFont.truetype(f"{fonts}/SpaceGrotesk/SpaceGrotesk[wght].ttf", 34); fb.set_variation_by_axes([700])
    fm = ImageFont.truetype(f"{fonts}/MartianMono/MartianMono[wdth,wght].ttf", 22)
except Exception:
    fb = fm = ImageFont.load_default()
W, H, LW, pad, lab = 800, 450, 600, 14, 46
sheet = Image.new("RGB", (W + LW + 3 * pad, 64 + 5 * (lab + H + pad)), "#1b1420")
d = ImageDraw.Draw(sheet)
d.text((pad, 14), "Eli + Mila · 5 alternativas · escena de prueba + estatura", fill="#f3ecdd", font=fb)
for k, n in enumerate(range(1, 6)):
    y = 64 + k * (lab + H + pad)
    d.text((pad, y + 10), f"Alt {n} · {names[n]}", fill="#f3ecdd", font=fm)
    sheet.paste(Image.open(f"{out}/alt_{n}_scene.png").convert("RGB").resize((W, H), Image.LANCZOS), (pad, y + lab))
    lu = Image.open(f"{tmp}/lineup_{n}.png").convert("RGB").crop((0, 0, 960, 400)).resize((LW, 250), Image.LANCZOS)
    box = Image.new("RGB", (LW, H), "#f2dcc2"); box.paste(lu, (0, (H - 250) // 2)); sheet.paste(box, (2 * pad + W, y + lab))
print("overview", save_small(sheet, f"{out}/alternatives_overview_small.jpg", 450_000, w=1100))
PY
ls -la "$OUT"
