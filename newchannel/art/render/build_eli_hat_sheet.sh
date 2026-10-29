#!/usr/bin/env bash
# Eli headwear options sheet (options 1-7: front, 3/4, profile, back | beside Mila, + a surprise strip to check the brows)
# -> characters/leo_mila/eli_gorro_opciones_small.jpg (<= 400 KB). Renders eli_hat_lab at 1920x1080; the surprise strip
# renders each view alone (?solo=) so the tall hats' surprise ticks never cross a neighbouring view; every crop keeps
# headroom above Mila's ponytail and above the ticks (Guardian 2026-10-29: the first sheet cut Mila's ponytail tip).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ART="$(cd "$HERE/.." && pwd)"; OUT="${1:-$(mktemp -d)}"; mkdir -p "$OUT"
for n in 1 2 3 4 5 6 7; do (
  node "$HERE/render.mjs" --scene eli_hat_lab --still 1 --png "$OUT/n${n}_main.png" --query "n=$n&expr=happy" >/dev/null
  for v in 0 1 2 3 4; do node "$HERE/render.mjs" --scene eli_hat_lab --still 1 --png "$OUT/n${n}_s$v.png" --query "n=$n&expr=surprised&solo=$v" >/dev/null; done
) & done; wait
python3 - "$OUT" "$ART/characters/leo_mila/eli_gorro_opciones.jpg" <<'PY'
import sys
from PIL import Image, ImageDraw, ImageFont
src, dst = sys.argv[1:3]
NAMES = {1: "gorro tejido (actual)", 2: "rizos cortos, sin gorro", 3: "gorra amarilla al revés", 4: "banda amarilla + pelo corto",
         5: "boina plana mostaza", 6: "gorro pescador amarillo", 7: "rizos + gafas de taller (idea)"}
F = lambda s: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", s)
CW, pad, head = 700, 10, 62
MAIN = (70, 40, 1910, 1066)                       # Mila's ponytail tip is at y ~85: 45 px of headroom
SOLO = [(750, 40, 1170, 540)] * 4 + [(620, 40, 1260, 540)]   # ticks reach y ~77 on the tallest hat; down to the open mouth
mh = round(CW * (MAIN[3] - MAIN[1]) / (MAIN[2] - MAIN[0]))
sw = sum(b[2] - b[0] for b in SOLO); sh = round(CW * (SOLO[0][3] - SOLO[0][1]) / sw)
BH = head + mh + sh + 2 * pad
H = 4 * (BH + pad) + pad
sheet = Image.new("RGB", (2 * CW + 3 * pad, H), "#15111c"); d = ImageDraw.Draw(sheet)
for n in range(1, 8):
    x = pad + ((n - 1) % 2) * (CW + pad); y = pad + ((n - 1) // 2) * (BH + pad)
    d.rectangle((x, y, x + CW - 1, y + head - 1), fill="#1c1820")
    d.text((x + 14, y + 4), str(n), fill="#f2c230", font=F(48)); d.text((x + 64, y + 18), NAMES[n], fill="#f3ecdd", font=F(24))
    m = Image.open(f"{src}/n{n}_main.png").convert("RGB").crop(MAIN).resize((CW, mh), Image.LANCZOS)
    sheet.paste(m, (x, y + head))
    strip = Image.new("RGB", (sw, SOLO[0][3] - SOLO[0][1]))
    ox = 0
    for v, b in enumerate(SOLO):
        im = Image.open(f"{src}/n{n}_s{v}.png").convert("RGB").crop(b); strip.paste(im, (ox, 0)); ox += b[2] - b[0]
    dd = ImageDraw.Draw(strip)
    for v, b in enumerate(SOLO[:-1]):
        xx = sum(bb[2] - bb[0] for bb in SOLO[:v + 1]); dd.line((xx, 0, xx, strip.height), fill="#cbbfae", width=3)
    sheet.paste(strip.resize((CW, sh), Image.LANCZOS), (x, y + head + mh + pad))
x = pad + CW + pad; y = pad + 3 * (BH + pad) + 20
for i, line in enumerate(["Cada opción: frente · 3/4 · perfil · espalda", "| junto a Mila (misma altura 0,95 / 1,08)",
                          "Franja de abajo: sorpresa", "(las cejas deben quedar sobre la piel)", "Piel nueva de Eli = la de Mila #d9a66c", "",
                          "Ojo, opción 1 (gorro actual): en sorpresa las", "cejas quedan sobre el doblez del gorro", "(defecto conocido del gorro actual)"]):
    d.text((x + 14, y + i * 34), line, fill="#d8cfc2", font=F(19))
sheet.save(dst, quality=92)
PY
python3 "$HERE/small_jpg.py" "$ART/characters/leo_mila/eli_gorro_opciones.jpg" "$ART/characters/leo_mila/eli_gorro_opciones_small.jpg" 400000 1424
rm -f "$ART/characters/leo_mila/eli_gorro_opciones.jpg"
