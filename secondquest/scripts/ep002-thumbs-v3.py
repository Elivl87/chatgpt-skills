#!/usr/bin/env python3
"""EP002 thumbnails v3 (Producer, 2026-10-13: big Quest face like EP001's tractor, amazed at the ocarina, the sword and
the Triforce). Images: Higgsfield gpt_image_2_5 1k, no text (A = pointing, B = pure astonishment; 2 takes each, 2.0
credits approved). Words set here in Fredoka (THUMBNAIL_RULES 5); the Test & Compare set changes only the words.

  python3 scripts/ep002-thumbs-v3.py     # -> docs/publish/EP002/thumbnails/v3/*.jpg + review sheet
"""
import importlib.util
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
_sp = importlib.util.spec_from_file_location('sk', HERE / 'ep002-thumb-sketches.py')
K = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(K)
TW, TH, YELLOW, WHITE = K.TW, K.TH, K.YELLOW, K.WHITE
OUT = K.ROOT / 'docs/publish/EP002/thumbnails/v3'
BOX = (400, 548, 1262, 704)                    # the grass band under the relics: clear of the face and the three objects
SETS = {'EXCEPT_YOU': [('EXCEPT ', WHITE, 1.0), ('YOU', YELLOW, 1.0)],
        'NOT_YOU': [('NOT ', WHITE, 1.0), ('YOU.', YELLOW, 1.0)],
        'YOU_CHANGED': [('YOU ', YELLOW, 1.0), ('CHANGED', WHITE, 1.0)]}


def one_line(im, parts, box):
    """Two colours on one line: fit the whole line in the box, then draw each part with K.words at its own x."""
    x0, y0, x1, y1 = box
    s = y1 - y0
    while K.font(s).getlength(''.join(t for t, _, _ in parts)) > x1 - x0:
        s -= 2
    w = K.font(s).getlength(''.join(t for t, _, _ in parts))
    x = x1 - w
    for t, c, _ in parts:
        tw = K.font(s).getlength(t)
        im = K.words(im, [(t.strip(), c, 1.0)], (int(x), y0, int(x + K.font(s).getlength(t.strip())) + 1, y0 + s), align='left')
        x += tw
    return im


def main():
    sheet = []
    for take in ['A1', 'A2', 'B1', 'B2']:
        raw = Image.open(OUT / f'raw_{take}.png').convert('RGB').resize((TW, TH), Image.LANCZOS)
        for name, parts in SETS.items():
            im = one_line(raw, parts, BOX)
            im.save(OUT / f'EP002_thumb_v3_{take}_{name}.jpg', quality=92)
            if name == 'EXCEPT_YOU':
                sheet.append(im)
    # review sheet: each take full size row + phone sizes (246x138, 168x94)
    rows = []
    for im in sheet:
        row = Image.new('RGB', (640 + 20 + 246 + 20 + 168, 360), (30, 30, 40))
        row.paste(im.resize((640, 360), Image.LANCZOS), (0, 0))
        row.paste(im.resize((246, 138), Image.LANCZOS), (660, 0))
        row.paste(im.resize((168, 94), Image.LANCZOS), (926, 0))
        rows.append(row)
    rv = Image.new('RGB', (rows[0].width, 360 * 4 + 30), (30, 30, 40))
    for i, r in enumerate(rows):
        rv.paste(r, (0, i * 370))
    rv.save(OUT / 'EP002_thumbs_v3_review.jpg', quality=88)


if __name__ == '__main__':
    main()
