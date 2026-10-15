#!/usr/bin/env python3
"""EP001 thumbnails v3 · finish: 1920x1080 renders -> 1280x720 PNG (<= 2 MB) + _small.jpg (<= 250 KB) each, and
preview_sheet_small.jpg (<= 450 KB): the three at 50 %, then each at 168x94 in a white feed and a dark #0F0F0F feed
with grey title bars and a duration chip (no platform logos). numpy + Pillow only; deterministic.

  python3 finish.py <render_dir> <out_dir>      (render_dir holds v3_A.png, v3_B.png, v3_C.png)
"""
import io
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, '../../../../../brand/fonts/MartianMono/MartianMono[wdth,wght].ttf')
KEYS = [('A', '¿QUIÉN FUE?'), ('B', 'FUE ÉL.'), ('C', '¡VA HACIA ATRÁS!')]


def font(size, wght=700):
    f = ImageFont.truetype(FONT, size)
    try:
        f.set_variation_by_axes([100, wght])
    except Exception:
        pass
    return f


def save_png(im, path, limit=2_000_000):
    im.save(path, optimize=True)
    if os.path.getsize(path) > limit:            # fall back to an adaptive 256-colour palette with dithering
        im.quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(path, optimize=True)
    return os.path.getsize(path)


def save_jpg(im, path, limit):
    for q in (92, 90, 88, 85, 82, 80, 76, 72, 68, 64, 60, 55, 50):
        b = io.BytesIO()
        im.save(b, 'JPEG', quality=q, optimize=True, progressive=True)
        if b.tell() <= limit:
            break
    open(path, 'wb').write(b.getvalue())
    return q, b.tell()


def chip(d, x1, y1, f, text='13:48'):
    w = d.textlength(text, font=f) + 8
    d.rounded_rectangle([x1 - w - 4, y1 - 15, x1 - 4, y1 - 3], radius=3, fill=(0, 0, 0, 215))
    d.text((x1 - w, y1 - 15), text, fill=(255, 255, 255), font=f)


def feed(sheet, thumbs, x0, y0, w, dark):
    bg = (15, 15, 15) if dark else (255, 255, 255)
    bar, bar2 = ((62, 62, 62), (44, 44, 44)) if dark else ((206, 206, 206), (226, 226, 226))
    d = ImageDraw.Draw(sheet)
    d.rectangle([x0, y0, x0 + w, y0 + 190], fill=bg)
    lab = font(15)
    d.text((x0 + 16, y0 + 10), 'feed oscuro #0F0F0F · 168x94' if dark else 'feed blanco · 168x94', fill=(150, 150, 150) if dark else (120, 120, 120), font=lab)
    cf = font(10, 600)
    # each candidate between two neutral "competitor" cards (flat mid-tone blocks), so the contrast is judged in context
    cards = []
    for k, t in enumerate(thumbs):
        cards += [None, t] if k == 0 else [t]
    cards += [None]
    cx = x0 + 16
    for k, t in enumerate(cards):
        y = y0 + 40
        if t is None:
            g = Image.new('RGB', (168, 94), (150, 118, 96) if k == 0 else (96, 120, 150))
            arr = np.asarray(g).astype(np.int16) + (np.linspace(-25, 25, 168)[None, :, None]).astype(np.int16)
            g = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
        else:
            g = t.resize((168, 94), Image.LANCZOS)
        mask = Image.new('L', (168, 94), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, 167, 93], radius=8, fill=255)
        sheet.paste(g, (cx, y), mask)
        chip(d, cx + 168, y + 94, cf)
        d.ellipse([cx, y + 104, cx + 24, y + 128], fill=bar2)
        d.rounded_rectangle([cx + 32, y + 106, cx + 168, y + 116], radius=4, fill=bar)
        d.rounded_rectangle([cx + 32, y + 122, cx + 130, y + 132], radius=4, fill=bar)
        d.rounded_rectangle([cx + 32, y + 138, cx + 100, y + 146], radius=4, fill=bar2)
        cx += 168 + 22


def main():
    rd, od = sys.argv[1], sys.argv[2]
    os.makedirs(od, exist_ok=True)
    thumbs = []
    for k, _ in KEYS:
        im = Image.open(os.path.join(rd, f'v3_{k}.png')).convert('RGB').resize((1280, 720), Image.LANCZOS)
        thumbs.append(im)
        n = save_png(im, os.path.join(od, f'thumb_{k}.png'))
        q, m = save_jpg(im, os.path.join(od, f'thumb_{k}_small.jpg'), 250_000)
        print(f'thumb_{k}.png {n/1e6:.2f} MB · thumb_{k}_small.jpg {m/1e3:.0f} KB (q{q})')
    pad, W = 24, 3 * 640 + 4 * 24
    H = 60 + 360 + 34 + pad + 190 + 12 + 190 + pad
    sheet = Image.new('RGB', (W, H), (232, 226, 216))
    d = ImageDraw.Draw(sheet)
    d.text((pad, 18), 'EP001 · miniaturas v3 (Eli + Mila) · título: «¿Por qué hay embotellamientos sin razón aparente?»', fill=(40, 30, 40), font=font(20))
    for i, ((k, txt), im) in enumerate(zip(KEYS, thumbs)):
        x = pad + i * (640 + pad)
        sheet.paste(im.resize((640, 360), Image.LANCZOS), (x, 60))
        d.text((x, 60 + 360 + 8), f'{k} · {txt}', fill=(40, 30, 40), font=font(17))
    fw = 5 * 168 + 4 * 22 + 32
    fx = (W - fw) // 2
    feed(sheet, thumbs, fx, 60 + 360 + 34 + pad, fw, dark=False)
    feed(sheet, thumbs, fx, 60 + 360 + 34 + pad + 190 + 12, fw, dark=True)
    q, m = save_jpg(sheet, os.path.join(od, 'preview_sheet_small.jpg'), 450_000)
    print(f'preview_sheet_small.jpg {sheet.size} {m/1e3:.0f} KB (q{q})')


if __name__ == '__main__':
    main()
