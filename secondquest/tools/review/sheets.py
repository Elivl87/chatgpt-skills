#!/usr/bin/env python3
"""Compose review sheets from a review.json manifest written by scripts/review.ts."""
import json, sys, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
F_BIG, F_SMALL = ImageFont.truetype(FONT, 18), ImageFont.truetype(FONT, 13)
CAP = 54
TW, TH, COLS, ROWS = 480, 270, 4, 4  # landscape; portrait cuts switch in main()


def tile(t):
    im = Image.open(t['file']).convert('RGB').resize((TW, TH))
    card = Image.new('RGB', (TW, TH + CAP), (16, 16, 22))
    card.paste(im, (0, 0))
    d = ImageDraw.Draw(card)
    m, s = divmod(t['time'], 60)
    d.rectangle((0, 0, 64, 28), fill=(0, 0, 0))
    d.text((6, 4), f"{t['n']}", font=F_BIG, fill=(255, 210, 90))
    d.text((6, TH + 4), f"{t['scene']}  ·  {int(m)}:{s:05.2f}", font=F_SMALL, fill=(170, 210, 255))
    line = textwrap.shorten(t['line'] or '—', int(TW / 7.6), placeholder='…')
    d.text((6, TH + 24), line, font=F_SMALL, fill=(235, 235, 235))
    if t.get('changed') or t.get('isNew'):
        label = 'CHANGED' if t.get('changed') else 'NEW'
        d.rectangle((0, 0, TW - 1, TH + CAP - 1), outline=(255, 210, 0), width=5)
        w = d.textlength(label, font=F_BIG)
        d.rectangle((TW - w - 16, 0, TW, 28), fill=(255, 210, 0))
        d.text((TW - w - 8, 4), label, font=F_BIG, fill=(0, 0, 0))
    return card


def main():
    global TW, TH, COLS, ROWS
    man = json.load(open(sys.argv[1]))
    w, h = Image.open(man['tiles'][0]['file']).size
    if h > w:  # vertical cut (Shorts): keep the real aspect
        TW, TH, COLS, ROWS = 270, 480, 6, 2
    out = Path(sys.argv[1]).parent
    tiles = man['tiles']
    per = COLS * ROWS
    for old in out.glob('sheet_*.jpg'):
        old.unlink()
    for k in range(0, len(tiles), per):
        page = tiles[k:k + per]
        rows = (len(page) + COLS - 1) // COLS
        sheet = Image.new('RGB', (COLS * TW + (COLS + 1) * 8, rows * (TH + CAP) + (rows + 1) * 8), (40, 40, 48))
        for i, t in enumerate(page):
            sheet.paste(tile(t), (8 + (i % COLS) * (TW + 8), 8 + (i // COLS) * (TH + CAP + 8)))
        sheet.save(out / f'sheet_{k // per + 1:02d}.jpg', quality=85)
    # phone overview: what each scene reads like at thumbnail size
    pw, ph, cols = (192, 108, 8) if TW > TH else (108, 192, 12)
    rows = (len(tiles) + cols - 1) // cols
    phone = Image.new('RGB', (cols * (pw + 4) + 4, rows * (ph + 20) + 4), (40, 40, 48))
    d = ImageDraw.Draw(phone)
    for i, t in enumerate(tiles):
        x, y = 4 + (i % cols) * (pw + 4), 4 + (i // cols) * (ph + 20)
        phone.paste(Image.open(t['file']).convert('RGB').resize((pw, ph)), (x, y))
        d.text((x, y + ph + 3), str(t['n']), font=F_SMALL, fill=(255, 210, 90) if (t.get('changed') or t.get('isNew')) else (220, 220, 220))
    phone.save(out / 'phone.jpg', quality=85)
    changed = sum(1 for t in tiles if t.get('changed') or t.get('isNew'))
    print(f"{len(tiles)} stills → {(len(tiles) + per - 1) // per} sheet(s) + phone.jpg in {out}; {changed} changed/new since the last review")


if __name__ == '__main__':
    main()
