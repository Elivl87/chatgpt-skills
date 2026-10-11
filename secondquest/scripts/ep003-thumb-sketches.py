#!/usr/bin/env python3
"""EP003 thumbnail SKETCHES for the 3 script alternatives, existing art only (no credits). Planning only: the chosen one
gets new art (quoted) and a final pass. Labelled BOCETO.

  python3 scripts/ep003-thumb-sketches.py    # -> docs/ep003/thumbs/*.jpg + sheet
"""
import importlib.util, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
HERE = Path(__file__).resolve().parent
sp = importlib.util.spec_from_file_location('sk', HERE / 'ep002-thumb-sketches.py'); K = importlib.util.module_from_spec(sp); sp.loader.exec_module(K)
ROOT, TW, TH, YELLOW, WHITE, INK = K.ROOT, K.TW, K.TH, K.YELLOW, K.WHITE, K.INK
OUT = ROOT / 'docs/ep003/thumbs'
Q = ROOT / 'public/art/core/quest'
PX = ROOT / 'docs/art_orders/pixie/library/results'
RED = (225, 40, 40)


def label(im):
    d = ImageDraw.Draw(im); f = K.font(26)
    d.rounded_rectangle((14, TH - 52, 170, TH - 14), 8, fill=(0, 0, 0)); d.text((26, TH - 50), 'BOCETO', font=f, fill=(255, 220, 0))
    return im


def calendar(w, h, years=13):
    """A wall calendar sheet: one box per year 2013-2026, every one crossed out in red except the last."""
    c = Image.new('RGBA', (w, h), (248, 244, 232, 255)); d = ImageDraw.Draw(c)
    d.rectangle((0, 0, w - 1, int(h * .16)), fill=(200, 40, 40)); d.text((w * .06, h * .02), 'WAITING', font=K.font(int(h * .1)), fill=WHITE)
    cols, rows = 4, 4; gw, gh = w / cols, (h * .82) / rows
    for i in range(14):
        x, y = (i % cols) * gw, h * .17 + (i // cols) * gh
        d.rectangle((x + 6, y + 6, x + gw - 6, y + gh - 6), outline=(90, 80, 70), width=3)
        d.text((x + 14, y + 10), str(2013 + i), font=K.font(int(gh * .22)), fill=(60, 50, 45))
        if i < 13:
            d.line((x + 14, y + 14, x + gw - 14, y + gh - 14), fill=RED, width=9); d.line((x + gw - 14, y + 14, x + 14, y + gh - 14), fill=RED, width=9)
        else:
            d.ellipse((x + 10, y + 8, x + gw - 10, y + gh - 8), outline=RED, width=6)
    return c.rotate(-3, expand=True, resample=Image.BICUBIC)


def thumb_a(text):
    bg = K.grade(K.cover(ROOT / 'public/art/core/backgrounds/living_room_night_gaming.png', (.5, .55), 1.1), .9, 1.05, .8)
    bg = K.prop(bg, calendar(560, 520), 930, 330, 560)
    bg = K.place(bg, K.cutout(Q / 'exhausted_slumped.png', 0, .8), -30, 640, bottom=TH + 20)
    bg = K.words(bg, text, (720, 520, 1250, 700), 'right')
    return label(bg)


def boat(w):
    b = Image.new('RGBA', (w, int(w * .32))); d = ImageDraw.Draw(b)
    d.polygon([(0, 10), (w, 10), (w * .86, b.height - 4), (w * .14, b.height - 4)], fill=(150, 90, 50), outline=INK)
    d.line((0, 10, w, 10), fill=(110, 60, 30), width=14)
    return b


def fish(w):
    f = Image.new('RGBA', (w, int(w * .6))); d = ImageDraw.Draw(f)
    d.ellipse((w * .05, f.height * .15, w * .78, f.height * .85), fill=(120, 170, 220), outline=INK, width=6)
    d.polygon([(w * .74, f.height * .5), (w, f.height * .12), (w, f.height * .88)], fill=(100, 150, 200), outline=INK)
    d.ellipse((w * .2, f.height * .32, w * .32, f.height * .5), fill=WHITE, outline=INK, width=3)
    d.line((w * .22, f.height * .42, w * .31, f.height * .42), fill=INK, width=5)       # half-closed lid: unimpressed
    return f


def thumb_b(text):
    bg = K.grade(K.cover(ROOT / 'public/art/core/backgrounds/sunset_sky.png', (.5, .4)), 1.2, 1.1)
    d = ImageDraw.Draw(bg); d.rectangle((0, 470, TW, TH), fill=(40, 110, 170))
    for y in range(480, TH, 26):
        d.arc((-40, y, TW + 40, y + 60), 200, 340, fill=(90, 160, 210), width=4)
    bg = K.place(bg, K.cutout(PX / '04_laughing_pointing.png', 0, .7), 300, 380, bottom=560, shadow=False)
    bg = K.place(bg, K.cutout(Q / 'gaming_excited.png', 0, .72), 20, 560, bottom=600, shadow=False)
    bg = K.prop(bg, boat(700), 360, 600, 700)
    d = ImageDraw.Draw(bg); d.line((150, 420, 560, 250), fill=(70, 50, 30), width=8); d.line((560, 250, 640, 560), fill=(240, 240, 240), width=2)
    bg = K.prop(bg, fish(170), 1150, 620, 170, ang=8)
    bg = K.words(bg, text, (690, 60, 1250, 330), 'right')
    return label(bg)


def cat(w, slap=True):
    c = Image.new('RGBA', (w, int(w * .8))); d = ImageDraw.Draw(c)
    d.ellipse((w * .1, c.height * .25, w * .9, c.height * .98), fill=(245, 245, 250), outline=INK, width=6)
    d.polygon([(w * .2, c.height * .35), (w * .28, c.height * .05), (w * .42, c.height * .3)], fill=(245, 245, 250), outline=INK)
    d.polygon([(w * .58, c.height * .3), (w * .72, c.height * .05), (w * .8, c.height * .35)], fill=(245, 245, 250), outline=INK)
    d.ellipse((w * .33, c.height * .52, w * .41, c.height * .62), fill=INK); d.ellipse((w * .59, c.height * .52, w * .67, c.height * .62), fill=INK)
    py = c.height * (.86 if slap else .7)
    d.ellipse((w * .02, py - c.height * .1, w * .26, py + c.height * .06), fill=(245, 245, 250), outline=INK, width=5)
    return c


def thumb_c(text):
    bg = K.grade(K.cover(ROOT / 'public/art/core/backgrounds/home_living_night.png', (.5, .5), 1.1), .9, 1.05, .75)
    bg = K.glow(bg, 900, 300, 380, (90, 140, 255), .45)
    d = ImageDraw.Draw(bg)
    d.rounded_rectangle((650, 120, 1220, 470), 14, fill=(30, 40, 70), outline=(20, 20, 30), width=10)   # monitor
    d.rectangle((662, 132, 1208, 420), fill=(210, 225, 245)); d.rectangle((662, 420, 1208, 458), fill=(60, 70, 100))
    for y in range(160, 400, 26):
        d.line((690, y, 690 + (y * 37) % 420 + 60, y), fill=(120, 130, 150), width=8)
    bg = K.prop(bg, cat(110), 1130, 418, 110)
    bg = K.place(bg, K.cutout(Q / 'desk_typing.png'), -60, 640, bottom=TH + 30)
    bg = K.words(bg, text, (640, 500, 1250, 700), 'right')
    return label(bg)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sets = [('A_GTA6', thumb_a, [[('13 YEARS', YELLOW, 1.0)], [('STILL', WHITE, .8), ('WAITING', YELLOW, 1.0)]]),
            ('B_HowToFish', thumb_b, [[('NOT', WHITE, .8), ('FISHING', YELLOW, 1.0)], [('JUST', WHITE, .8), ('GET IT', YELLOW, 1.0)]]),
            ('C_BongoCat', thumb_c, [[('MY', WHITE, .8), ('COWORKER', YELLOW, 1.0)], [('IT', WHITE, .8), ('WATCHES', YELLOW, 1.0)]])]
    tiles = []
    for name, fn, variants in sets:
        for i, v in enumerate(variants):
            im = fn(v); p = OUT / f'EP003_{name}_sketch_{i + 1}.jpg'; im.save(p, quality=88); tiles.append(im)
    sheet = Image.new('RGB', (2 * 640 + 30, 3 * 360 + 40), (24, 24, 30))
    for i, im in enumerate(tiles):
        sheet.paste(im.resize((640, 360), Image.LANCZOS), (10 + (i % 2) * 650, 10 + (i // 2) * 370))
    sheet.save(OUT / 'EP003_thumb_sketches_sheet.jpg', quality=88)
    print('ok', len(tiles))


if __name__ == '__main__':
    main()
