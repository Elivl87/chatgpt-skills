#!/usr/bin/env python3
"""EP002 block J: spider and ice-bag proposals (Producer, 2026-10-07). Planning only.

  QUALITY=review python3 scripts/ep002-tree-gag-proposals.py    # -> docs/ep002/EP002_tree_gag_proposals.jpg
"""
import importlib.util, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
sp = importlib.util.spec_from_file_location('J', HERE / 'ep002-blockJ-animatic.py')
J = importlib.util.module_from_spec(sp); sp.loader.exec_module(J)
from lib import ROOT  # noqa: E402

ROWS = [('Araña', [('thread', 'bag', 'ACTUAL · cuelga de su hilo'), ('moustache', 'bag', 'S2 · pequeña, camina por el bigote'), ('web', 'bag', 'S3 · en una telaraña del bigote')]),
        ('Hielo', [('thread', 'bag', 'ACTUAL · bolsa azul de goma'), ('thread', 'plaid', 'I2 · bolsa de cuadros clásica'), ('thread', 'towel', 'I3 · toalla mojada')])]


def main():
    t = J.T_PROB + 1.2
    f = ImageFont.truetype(str(ROOT / 'public/shared/fonts/Inter-800.woff2'), 20)
    tw, th = 560, 420
    sh = Image.new('RGB', (3 * (tw + 16) + 16, 2 * (th + 70) + 20), (24, 24, 30)); d = ImageDraw.Draw(sh)
    for r, (name, cells) in enumerate(ROWS):
        for c, (spm, icm, lab) in enumerate(cells):
            J.SPIDER_MODE, J.ICE_MODE = spm, icm
            fr = J.render(t).convert('RGB'); W, H = fr.size
            crop = fr.crop((int(W * .33), 0, int(W * .97), int(H * .48))).resize((tw, th), Image.LANCZOS)
            x, y = 16 + c * (tw + 16), 12 + r * (th + 70)
            d.text((x, y), f'{name} · {lab}', font=f, fill=(255, 200, 61) if c else (220, 220, 230))
            sh.paste(crop, (x, y + 32))
    out = ROOT / 'docs/ep002/EP002_tree_gag_proposals.jpg'
    sh.save(out, quality=90)
    print(out.relative_to(ROOT))


if __name__ == '__main__':
    main()
