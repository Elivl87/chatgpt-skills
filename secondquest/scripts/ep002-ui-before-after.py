#!/usr/bin/env python3
"""EP002: the on-screen text restyle, before (full animatic v4) and after (the new block renders), for the Producer.

  python3 scripts/ep002-ui-before-after.py    # -> docs/ep002/EP002_ui_before_after_1.jpg, _2.jpg ...
"""
import re, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
from lib import ROOT  # noqa: E402
import ui_kit as K  # noqa: E402

FF = imageio_ffmpeg.get_ffmpeg_exe()
BEFORE = ROOT / 'docs/ep002/EP002_animatic_full_v4_light.mp4'
START = {'E': 81.31, 'F_B': 102.81, 'G': 120.77, 'H': 146.23, 'I': 160.52, 'J': 185.60, 'K': 201.81, 'M': 237.85,
         'N': 256.52, 'O': 271.44, 'P': 291.65, 'Q': 310.94, 'R': 336.98, 'T': 378.77}   # chapter starts in the v4 animatic
SHOTS = [('E', 97.6, 'E5 · lista de novedades → pergamino; diálogo ampliado → cuadro de juego'),
         ('F_B', 118.0, 'F6 · panel de barras → cuadro de juego'),
         ('G', 122.4, 'G1 · 1998 → título de zona en píxeles'),
         ('G', 126.4, 'G2 · TODAY → título de zona'),
         ('G', 136.4, 'G4 · VOICE CASTING → cuadro de juego'),
         ('H', 151.9, 'H2 · NEW QUEST → aviso de misión'),
         ('H', 153.3, 'H3 · FAMILIAR / DIFFERENT → deslizadera de opciones'),
         ('I', 165.0, 'I1 · selección de archivo → cuadros de juego'),
         ('I', 172.9, 'I · SEVEN YEARS LATER → tarjeta de tiempo'),
         ('I', 184.6, 'I7 · CHILD / ADULT → títulos de zona · 7 YEARS → etiqueta'),
         ('J', 199.8, 'J3 · comparativa → cuadro de juego'),
         ('K', 207.5, 'K · año en la pantalla → chip de era'),
         ('M', 243.6, 'M2 · 2D → tarjeta en píxeles'),
         ('M', 249.6, 'M3 · FAR AWAY → etiqueta de juego'),
         ('N', 270.8, 'N7 · CHILD / ADULT → títulos de zona'),
         ('O', 281.2, 'O3 · FOG / LOW POLY → marcador del EP001 (vida real)'),
         ('P', 303.4, 'P4 · WHY? → tipografía Anton del canal'),
         ('Q', 312.5, 'Q1 · STILL THERE → etiqueta de juego'),
         ('Q', 325.4, 'Q5 · 1998 / 2026 → chips de era'),
         ('R', 338.3, 'R1 · 1998 / 2026 → títulos de zona (opción 2)'),
         ('R', 349.8, 'R2 · SAME ROAD → poste · DIFFERENT PERSON → etiqueta'),
         ('R', 353.8, 'R3 · OLD GAME BACK → entrada del diario tachada a pluma'),
         ('T', 389.6, 'T3 · THE GAME YOU REMEMBER / THE PERSON YOU BECAME → etiquetas')]


def newest(block):
    pat = {'F_B': 'EP002_blockF_B_animatic_v*.mp4'}.get(block, f'EP002_block{block}_animatic_v*.mp4')
    files = sorted((ROOT / 'docs/ep002').glob(pat), key=lambda p: int(re.search(r'_v(\d+)\.mp4', p.name).group(1)))
    return files[-1]


def grab(src, t):
    out = HERE.parent / 'docs/ep002/ui_style/_grab.jpg'
    subprocess.run([FF, '-v', 'error', '-y', '-ss', f'{max(0, t):.2f}', '-i', str(src), '-frames:v', '1', '-q:v', '3', str(out)], check=True)
    return Image.open(out).convert('RGB')


def main():
    TW, TH, pad, head = 560, 315, 20, 40
    per = 8
    pages = [SHOTS[i:i + per] for i in range(0, len(SHOTS), per)]
    for n, page in enumerate(pages, 1):
        sh = Image.new('RGB', (pad * 3 + TW * 2, 110 + len(page) * (head + TH + pad)), K.INK)
        d = ImageDraw.Draw(sh)
        d.text((pad, 18), f'Cajas de texto · antes / después ({n}/{len(pages)})', font=K.anton(38), fill=K.WHITE)
        for lab, x in (('ANTES (v4)', pad), ('DESPUÉS', pad * 2 + TW)):
            K.spaced(d, (x, 76), lab, K.inter(15), K.GOLD, 2)
        y = 104
        for block, t, what in page:
            d.text((pad, y + 8), what, font=K.inter(18), fill=K.WHITE)
            sh.paste(grab(BEFORE, t).resize((TW, TH)), (pad, y + head))
            sh.paste(grab(newest(block), t - START[block]).resize((TW, TH)), (pad * 2 + TW, y + head))
            y += head + TH + pad
        out = ROOT / f'docs/ep002/EP002_ui_before_after_{n}.jpg'
        sh.save(out, quality=88)
        print(out.relative_to(ROOT))


if __name__ == '__main__':
    main()
