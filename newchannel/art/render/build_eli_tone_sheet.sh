#!/usr/bin/env bash
# Eli skin-tone comparison sheet (options A-D x neutral / golden / night) -> characters/leo_mila/eli_tono_opciones_small.jpg
# Renders eli_tone_lab at 1920x1080, crops each row with headroom (no head touching a cell edge), <= 400 KB.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ART="$(cd "$HERE/.." && pwd)"; OUT="${1:-$(mktemp -d)}"; mkdir -p "$OUT"
for m in neutral golden night; do ( for v in A B C D; do node "$HERE/render.mjs" --scene eli_tone_lab --still 1 --png "$OUT/${v}_$m.png" --query "v=$v&mode=$m" >/dev/null; done ) & done; wait
python3 - "$OUT" "$ART/characters/leo_mila/eli_tono_opciones.jpg" <<'PY'
import sys
from PIL import Image, ImageDraw, ImageFont
src, dst = sys.argv[1:3]
TONES = [("A", "#905a38", "actual"), ("B", "#9e6441", "un poco más claro"), ("C", "#ad7049", "más claro"), ("D", "#bb7d53", "el más claro")]
CW, pad, head = 440, 10, 110
# (mode, crop box in the 1920x1080 frame, row height); boxes keep >= 30 px headroom above the tallest head
ROWS = [("neutral", (360, -40, 1560, 1040), 0), ("golden", (440, 230, 1500, 900), 0), ("night", (520, 60, 1440, 1060), 0)]
rows = []
for mode, box, _ in ROWS:
    w, h = box[2] - box[0], box[3] - box[1]; rows.append((mode, box, round(CW * h / w)))
H = head + sum(r[2] + pad for r in rows) + 48
sheet = Image.new("RGB", (4 * CW + 5 * pad, H), "#15111c"); d = ImageDraw.Draw(sheet)
F = lambda s: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", s)
for i, (L, hexc, note) in enumerate(TONES):
    x = pad + i * (CW + pad); d.rectangle((x, pad, x + CW - 1, head), fill="#1c1820")
    d.text((x + 16, 18), L, fill="#f3ecdd", font=F(64)); d.text((x + 96, 30), hexc, fill="#f2c230", font=F(26)); d.text((x + 96, 66), note, fill="#d8cfc2", font=F(21))
    y = head + pad
    for mode, box, rh in rows:
        im = Image.open(f"{src}/{L}_{mode}.png").convert("RGB")
        if box[1] < 0:  # pad the top with the backdrop colour so the beanie has headroom
            big = Image.new("RGB", (im.width, im.height - box[1]), im.getpixel((5, 5))); big.paste(im, (0, -box[1])); im = big; box = (box[0], 0, box[2], box[3] - box[1])
        sheet.paste(im.crop(box).resize((CW, rh), Image.LANCZOS), (x, y)); y += rh + pad
d.text((pad + 4, H - 38), "Tono de piel de Eli · fila 1: luz neutra (frente + 3/4) · fila 2: atardecer dorado con Mila · fila 3: noche con Mila", fill="#d8cfc2", font=F(21))
sheet.save(dst, quality=92)
PY
python3 "$HERE/small_jpg.py" "$ART/characters/leo_mila/eli_tono_opciones.jpg" "$ART/characters/leo_mila/eli_tono_opciones_small.jpg" 400000 1810
rm -f "$ART/characters/leo_mila/eli_tono_opciones.jpg"
