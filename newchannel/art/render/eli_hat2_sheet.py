#!/usr/bin/env python3
"""Eli headwear round 2 sheet (eli_gorro_opciones_v2_small.jpg) from eli_hat2_lab stills in <dir>: h<k>.png (happy),
s<k>_v0..4.png (surprised, each view alone: ?solo=0..4), w<k>.png (workshop outfit), L<k>_<golden|night>.png. Usage: eli_hat2_sheet.py <dir> <out.jpg>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
S, OUT = sys.argv[1], sys.argv[2]
fp = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
big, mid, sm = ImageFont.truetype(fp, 54), ImageFont.truetype(fp, 23), ImageFont.truetype(fp, 18)
K = ['1a', '1b', '1c', '2', '3', '4', '5', '6']
N = {'1a': 'gorra roja al revés, lisa', '1b': 'gorra roja al revés + «E» bordada', '1c': 'roja más fría y brillante + «E»', '2': 'gorra amarilla al revés (mejorada)',
     '3': 'rizos + gafas de taller', '4': 'gorro holgado, puño alto', '5': 'rizos + lápiz detrás de la oreja', '6': 'boina plana (ivy) mostaza'}
W = 680; cells = []
SOLO = [(750, 10, 1170, 637)] * 4 + [(640, 10, 1280, 637)]   # 4 x 420 + 640 = 2320 x 627 -> 680 x 184 (same aspect): the side ticks fit (extraK up to 1.6)
for k in K:
    a = Image.open(f'{S}/h{k}.png').convert('RGB').crop((0, 30, 1920, 1060)).resize((W, 365), Image.LANCZOS)
    # surprise strip: each view rendered alone (?solo=) so the ticks never cross a neighbouring view; 40 px over the ticks
    strip = Image.new('RGB', (sum(x1 - x0 for x0, _, x1, _ in SOLO), SOLO[0][3] - SOLO[0][1])); ox = 0; dd = ImageDraw.Draw(strip)
    for v, bx in enumerate(SOLO):
        strip.paste(Image.open(f'{S}/s{k}_v{v}.png').convert('RGB').crop(bx), (ox, 0)); ox += bx[2] - bx[0]
        if v < 4: dd.line((ox, 0, ox, strip.height), fill='#cbbfae', width=3)
    b = strip.resize((W, 184), Image.LANCZOS)
    c = Image.new('RGB', (W, 62 + 365 + 184 + 4), '#1c1820'); d = ImageDraw.Draw(c)
    d.text((10, 0), k, font=big, fill='#f2c230'); d.text((96 if len(k) > 1 else 60, 18), N[k], font=mid, fill='#f3ecdd')
    c.paste(a, (0, 62)); c.paste(b, (0, 62 + 365 + 4)); cells.append(c)
ch = cells[0].height
ws = [Image.open(f'{S}/w{k}.png').convert('RGB').crop((0, 30, 1400, 1060)).resize((440, 324), Image.LANCZOS) for k in ('1b', '4', '5')]
Ls = [Image.open(f'{S}/L{k}_{l}.png').convert('RGB').crop((600, 0, 1320, 1080)).resize((200, 300), Image.LANCZOS) for k in ('1a', '1c') for l in ('golden', 'night')]
H = 4 * (ch + 8) + 8 + 40 + 324 + 30 + 40 + 300 + 70
sh = Image.new('RGB', (2 * W + 24, H), '#121016'); d = ImageDraw.Draw(sh)
for i, c in enumerate(cells): sh.paste(c, (8 + (i % 2) * (W + 8), 8 + (i // 2) * (ch + 8)))
y = 4 * (ch + 8) + 8
d.text((12, y + 6), 'Con el traje de taller (delantal): 1b · 4 · 5', font=mid, fill='#f2c230'); y += 40
for i, w in enumerate(ws): sh.paste(w, (8 + i * 456, y))
y += 324 + 30
d.text((12, y), 'El rojo junto a la franela vinotinto: 1a (izq.) y 1c (der.), atardecer y noche', font=mid, fill='#f2c230'); y += 40
for i, l in enumerate(Ls): sh.paste(l, (8 + i * 210 + (30 if i >= 2 else 0), y))
d.text((900, y + 20), '1c: rojo más frío y luminoso (#d8233a)', font=sm, fill='#d8d0c4'); d.text((900, y + 48), 'se separa mejor del vino de la franela', font=sm, fill='#d8d0c4')
d.text((900, y + 76), 'sobre todo de noche', font=sm, fill='#d8d0c4')
y += 300 + 16
d.text((12, y), 'Eli con el traje de casa 3bB (franela vinotinto + playera amarilla) · Mila con el traje 2 · franja inferior: sorpresa (cejas sobre la piel)', font=sm, fill='#d8d0c4')
d.text((12, y + 26), 'Sin logotipos de equipos (regla del canal): la «E» es nuestra.', font=sm, fill='#d8d0c4')
sh = sh.resize((int(sh.width * 0.8), int(sh.height * 0.8)), Image.LANCZOS)
q = 88
while True:
    sh.save(OUT, quality=q, optimize=True)
    if os.path.getsize(OUT) <= 400 * 1024 or q < 60: break
    q -= 4
print(sh.size, q, os.path.getsize(OUT) // 1024, 'KB')
