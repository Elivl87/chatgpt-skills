#!/usr/bin/env python3
"""EP003 free thumbnails (A, B) + phone-size check sheet. PIL only; existing art placed and scaled, never edited.
Run from anywhere:  python3 make_thumbs.py
Art: lake dusk plate, our 3D rowboat (two-pass back/front) and fish v2, Quest laughing/shocked and Pixie cut-outs
(docs/art_orders/quest|pixie, as used by tools/hyperframes_ep003/stage_assets.py). Text: Fredoka Bold."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]                      # secondquest/
W, H = 1280, 720
P3 = ROOT / 'public/art/ep003/props3d'
LAKE = ROOT / 'docs/art_orders/ep003/new_art_v1/derived/lake_dusk.png'
QUEST = {'laugh': ROOT / 'docs/art_orders/quest/library_v2/results/02_laughing_pointing.png',
         'shock': ROOT / 'docs/art_orders/quest/library_v2/results/04_surprised_shocked.png'}
PIXIE = ROOT / 'docs/art_orders/pixie/library/results/04_laughing_pointing.png'
FONT = ROOT / 'public/shared/fonts/Fredoka.ttf'
YELLOW = (255, 214, 0)
INK = (28, 18, 40)


def img(p):
    return Image.open(p).convert('RGBA')


def scaled(im, height=None, width=None):
    if height:
        return im.resize((round(im.width * height / im.height), height), Image.LANCZOS)
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def paste(canvas, im, x, y, shadow=0):
    if shadow:
        a = im.split()[3].filter(ImageFilter.GaussianBlur(shadow))
        sh = Image.new('RGBA', im.size, (10, 6, 30, 0)); sh.putalpha(a.point(lambda v: int(v * .45)))
        canvas.alpha_composite(sh, (x + 6, y + 10)) if x >= 0 and y >= 0 else canvas.alpha_composite(sh.crop((max(0, -x), max(0, -y), im.width, im.height)), (max(0, x + 6), max(0, y + 10)))
    canvas.alpha_composite(im.crop((max(0, -x), max(0, -y), im.width, im.height)), (max(0, x), max(0, y)))


def outlined(canvas, text, xy, size, fill, stroke=14, anchor='la', shadow=True):
    f = ImageFont.truetype(str(FONT), size); f.set_variation_by_name('Bold')
    if shadow:
        lay = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
        ImageDraw.Draw(lay).text((xy[0] + 7, xy[1] + 11), text, font=f, fill=(0, 0, 0, 255), stroke_width=stroke, stroke_fill=(0, 0, 0, 255), anchor=anchor)
        lay = lay.filter(ImageFilter.GaussianBlur(7)); lay.putalpha(lay.split()[3].point(lambda v: int(v * .6)))
        canvas.alpha_composite(lay)
    d = ImageDraw.Draw(canvas)
    d.text(xy, text, font=f, fill=fill, stroke_width=stroke, stroke_fill=INK, anchor=anchor)
    return f.getbbox(text, anchor=anchor)


def background():
    lake = img(LAKE)
    s = 1.18                                  # slight zoom: horizon high, more water and purple sky, sun off to the right
    lake = lake.resize((round(lake.width * s), round(lake.height * s)), Image.LANCZOS)
    x0, y0 = 250, 150
    bg = lake.crop((x0, y0, x0 + W, y0 + H)).convert('RGBA')
    # a soft dark gradient on the left so the red hoodie pops (placement of a plain overlay, not an edit of the art)
    g = Image.new('L', (W, H), 0); gd = ImageDraw.Draw(g)
    for x in range(W):
        gd.line([(x, 0), (x, H)], fill=int(max(0, 1 - x / 760) * 70))
    dark = Image.new('RGBA', (W, H), (18, 14, 60, 255)); dark.putalpha(g)
    bg.alpha_composite(dark)
    return bg


def compose(variant):
    c = background()
    waterline = 330 + 0
    boat_back, boat_front = img(P3 / 'rowboat_side_back.png'), img(P3 / 'rowboat_side_front.png')
    bw = 1230                                                  # longer hull: Pixie has her own seat inside it
    bb, bf = scaled(boat_back, width=bw), scaled(boat_front, width=bw)
    bx, by = -175, 476
    # shadow/reflection of the boat on the water
    refl = ImageChops.offset(bb.transpose(Image.FLIP_TOP_BOTTOM), 0, 0)
    refl.putalpha(refl.split()[3].point(lambda v: int(v * .22)))
    paste(c, refl.filter(ImageFilter.GaussianBlur(3)), bx + 20, by + bb.height - 30)
    paste(c, bb, bx, by)
    # crew behind the near hull
    crew = Image.new('RGBA', (W, H), (0, 0, 0, 0))              # crew layer, clipped inside the hull (nobody below the keel)
    q = img(QUEST['shock' if variant == 'B' else 'laugh'])
    qh = 1280
    qs = scaled(q, height=qh)
    qx, qy = (-120, 58) if variant == 'B' else (-91, 58)
    paste(crew, qs, qx, qy)
    p = scaled(img(PIXIE), height=900)
    px, py = 540, 262                                          # her own seat, clear of Quest's arm (Producer, 2026-10-17)
    paste(crew, p, px, py)
    clip = by + int(bb.height * 0.66)
    crew.paste((0, 0, 0, 0), (0, clip, W, H))
    c.alpha_composite(crew)
    paste(c, bf, bx, by)
    # hull highlight line stays as drawn; the fish: our v2 deadpan, flipped to face the camera/Quest
    fish = img(P3 / 'fish2_34_deadpan.png').transpose(Image.FLIP_LEFT_RIGHT)
    fs = scaled(fish, width=270)
    paste(c, fs, 1005, 500, shadow=6)
    if variant == 'C':                                       # a gull carries Max off into the distance (Producer idea, 2026-10-17)
        gull = scaled(img(P3 / 'seagull_34.png'), width=190)
        mx = scaled(img(P3 / 'max_front_shock.png'), height=165).rotate(-14, resample=Image.BICUBIC, expand=True)
        gx, gy = 430, 34                                     # high in the sky between Quest and the title, far away
        paste(c, mx, gx + 66, gy + 74, shadow=4)             # dangling under the gull (its feet hold his collar)
        paste(c, gull, gx, gy, shadow=4)
    # words
    if variant in 'AC':
        outlined(c, 'NOT', (1245, 14), 136, (255, 255, 255), anchor='ra')
        outlined(c, 'FISHING', (1255, 124), 172, YELLOW, stroke=16, anchor='ra')
    else:
        outlined(c, 'WHY?!', (1245, 85), 245, YELLOW, stroke=18, anchor='ra')
    return c.convert('RGB')


def main():
    outs = []
    for v in 'ABC':
        im = compose(v)
        p = HERE / f'EP003_thumb_{v}.png'
        im.save(p, optimize=True)
        outs.append((v, im))
    # phone-size check sheet: 1280x720 original, 246x138, 168x94 (+ grey feed background), as in THUMBNAIL_RULES §7
    sheet = Image.new('RGB', (1340, 580), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    lab = ImageFont.truetype(str(ROOT / 'public/shared/fonts/Fredoka.ttf'), 22)
    x = 20
    y = 20
    for v, im in outs:
        d.text((x, y), f'{v}  640x360', font=lab, fill=(230, 230, 230))
        sheet.paste(im.resize((640, 360), Image.LANCZOS), (x, y + 30))
        x += 650
    x = 20; y = 420
    for v, im in outs:
        for (w, h) in ((246, 138), (168, 94)):
            sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y))
            d.text((x, y + h + 2), f'{v} {w}x{h}', font=ImageFont.truetype(str(FONT), 16), fill=(200, 200, 200))
            x += w + 18
        x += 40
    sheet.save(HERE / 'EP003_thumb_check_sheet.png')


if __name__ == '__main__':
    main()
