#!/usr/bin/env python3
"""Compose the outfit option sheets (Producer 2026-10-29) from outfit_lab stills: vestuario_eli_small.jpg,
vestuario_mila_small.jpg, vestuario_parejas_small.jpg (each <= 400 KB). Usage: outfit_sheets.py <stills_dir> <out_dir>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
S, OUT = sys.argv[1], sys.argv[2]
FP = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
big, mid, sm = (ImageFont.truetype(FP, n) for n in (58, 25, 19))
ELI = ['playera + delantal (actual)', 'overol de mecánico', 'franela abierta + cargo', 'chaqueta universitaria + jeans', 'sudadera con capucha', 'camisa + chaleco utilitario']
MILA = ['suéter + overol (actual)', 'mezclilla + rayas + falda', 'mono utilitario + cinturón', 'cárdigan + cuello alto + ancho', 'impermeable largo + botas', 'rompevientos + joggers']
PAIRS = [('Taller', 'overol + mono', 2, 3), ('Fin de semana', 'franela + mezclilla', 3, 2), ('Otoño', 'universitaria + cárdigan', 4, 4), ('Lluvia', 'sudadera + impermeable', 5, 5)]

def save(sheet, name):
    out = os.path.join(OUT, name); q = 88
    while True:
        sheet.save(out, quality=q, optimize=True)
        if os.path.getsize(out) <= 400 * 1024 or q < 40: break
        q -= 4
    print(name, sheet.size, 'q', q, os.path.getsize(out) // 1024, 'KB')

def option_sheet(who, names, note):
    W = 700; cells = []
    for n in range(1, 7):
        im = Image.open(f'{S}/{who}{n}.png').convert('RGB').crop((0, 30, 1920, 1060)).resize((W, 376), Image.LANCZOS)
        c = Image.new('RGB', (W, 66 + 376), '#1c1820'); d = ImageDraw.Draw(c)
        d.text((12, 2), str(n), font=big, fill='#f2c230' if who == 'eli' else '#b9a3ff'); d.text((62, 20), names[n - 1], font=mid, fill='#f3ecdd')
        c.paste(im, (0, 66)); cells.append(c)
    ch = cells[0].height; sheet = Image.new('RGB', (2 * W + 24, 3 * (ch + 8) + 76), '#121016'); d = ImageDraw.Draw(sheet)
    for i, c in enumerate(cells): sheet.paste(c, (8 + (i % 2) * (W + 8), 8 + (i // 2) * (ch + 8)))
    y = 3 * (ch + 8) + 14
    d.text((12, y), 'frente · 3/4 · perfil · espalda · sentado · brazos arriba', font=sm, fill='#d8d0c4'); d.text((12, y + 28), note, font=sm, fill='#d8d0c4')
    return sheet

save(option_sheet('eli', ELI, 'Eli lleva la cabeza 2 (rizos, sin gorro) solo para no mezclar decisiones: el gorro se elige aparte.'), 'vestuario_eli_small.jpg')
save(option_sheet('mila', MILA, 'Mila conserva su morado; la piel de ambos es #d9a66c.'), 'vestuario_mila_small.jpg')
W = 700; cells = []
for k, (name, sub, e, m) in enumerate(PAIRS):
    parts = [Image.open(f'{S}/p{k}_{l}.png').convert('RGB').crop((540, 0, 1380, 1040)).resize((228, 282), Image.LANCZOS) for l in ('neutral', 'golden', 'night')]
    c = Image.new('RGB', (W, 66 + 282 + 30), '#1c1820'); d = ImageDraw.Draw(c)
    d.text((12, 2), chr(65 + k), font=big, fill='#f3ecdd'); d.text((62, 8), name, font=mid, fill='#f2c230'); d.text((62, 38), f'{sub}  (Eli {e} + Mila {m})', font=sm, fill='#d8d0c4')
    for i, p in enumerate(parts): c.paste(p, (4 + i * 232, 66))
    for i, l in enumerate(('neutra', 'atardecer', 'noche')): d.text((10 + i * 232, 66 + 284), l, font=sm, fill='#a89ec0')
    cells.append(c)
ch = cells[0].height; sheet = Image.new('RGB', (2 * W + 24, 2 * (ch + 8) + 44), '#121016'); d = ImageDraw.Draw(sheet)
for i, c in enumerate(cells): sheet.paste(c, (8 + (i % 2) * (W + 8), 8 + (i // 2) * (ch + 8)))
d.text((12, 2 * (ch + 8) + 12), 'Parejas recomendadas · cada una en luz neutra, atardecer dorado y noche · Eli con rizos (gorro aparte)', font=sm, fill='#d8d0c4')
save(sheet, 'vestuario_parejas_small.jpg')
