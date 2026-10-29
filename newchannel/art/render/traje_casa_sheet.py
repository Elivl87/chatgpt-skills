#!/usr/bin/env python3
"""Home-outfit sheet (Producer 2026-10-29: wine flannel for Eli + Mila 2): traje_casa_small.jpg from outfit_lab stills
?scene=outfit_lab&e=3bA|3bB|3bC&m=2&light=neutral|golden|night saved as <dir>/<A|B|C>_<light>.png. Usage: traje_casa_sheet.py <dir> <out.jpg>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
S, OUT = sys.argv[1], sys.argv[2]
fp = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
big, mid, sm = ImageFont.truetype(fp, 64), ImageFont.truetype(fp, 26), ImageFont.truetype(fp, 19)
names = {'A': 'franela vinotinto + playera blanca (sin amarillo)', 'B': 'franela vinotinto + playera amarilla', 'C': 'franela vinotinto + playera blanca + puños y cuello amarillos'}
rows = []
for k in 'ABC':
    r = Image.new('RGB', (1290, 72 + 405 + 30), '#1c1820'); d = ImageDraw.Draw(r)
    d.text((14, 2), k, font=big, fill='#f3ecdd'); d.text((84, 22), names[k] + '  ·  con Mila 2', font=mid, fill='#f2c230')
    for i, l in enumerate(['neutral', 'golden', 'night']):
        im = Image.open(f'{S}/{k}_{l}.png').convert('RGB').crop((580, 0, 1380, 1080)).resize((300, 405), Image.LANCZOS); r.paste(im, (8 + i * 306, 72))
        d.text((12 + i * 306, 72 + 408), ['neutra', 'atardecer', 'noche'][i], font=sm, fill='#a89ec0')
    x = 8 + 3 * 306 + 28
    d.text((x, 72 + 4), 'tamaño miniatura (320 px)', font=sm, fill='#a89ec0')
    r.paste(Image.open(f'{S}/{k}_golden.png').convert('RGB').resize((320, 180), Image.LANCZOS), (x, 72 + 32))
    r.paste(Image.open(f'{S}/{k}_night.png').convert('RGB').resize((320, 180), Image.LANCZOS), (x, 72 + 222))
    rows.append(r)
H = sum(x.height for x in rows) + 8 * 4 + 40
sh = Image.new('RGB', (1306, H), '#121016'); y = 8
for x in rows: sh.paste(x, (8, y)); y += x.height + 8
ImageDraw.Draw(sh).text((14, y + 6), 'Traje de casa · Eli con rizos solo como referencia (gorro aparte) · piel de ambos #d9a66c · vinotinto #7a1f2b', font=sm, fill='#d8d0c4')
q = 88
while True:
    sh.save(OUT, quality=q, optimize=True)
    if os.path.getsize(OUT) <= 400 * 1024 or q < 40: break
    q -= 4
print(sh.size, q, os.path.getsize(OUT) // 1024, 'KB')
