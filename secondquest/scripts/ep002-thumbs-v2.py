#!/usr/bin/env python3
"""EP002 thumbnails v2: options 1 ("EXCEPT YOU") and 2 ("1998 / 2026") with their Test & Compare variants, built only
from existing art (no credits). Planning: the Producer picks one, then it gets its final pass.

  python3 scripts/ep002-thumbs-v2.py     # -> docs/publish/EP002/thumbnails/v2/*.jpg + review sheet

Rules: docs/THUMBNAIL_RULES.md (big face left, one subject, 1-3 extreme words, Fredoka, glance test) and the EP001
lesson (docs/publish/EP001/ANALYTICS_D5.md): the thumbnail's picture must be on screen in the first seconds. EP002
opens on the cartridge, the N64 and the CRT TV (0:00), so both options are built on the 1998 TV / the 1998 field.
A Test & Compare set keeps the scene and changes only the words (THUMBNAIL_RULES 9).
"""
import importlib.util
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
_sp = importlib.util.spec_from_file_location('sk', HERE / 'ep002-thumb-sketches.py')
K = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(K)
ROOT, TW, TH, YELLOW, WHITE, INK = K.ROOT, K.TW, K.TH, K.YELLOW, K.WHITE, K.INK
OUT = ROOT / 'docs/publish/EP002/thumbnails/v2'
ROOM_TODAY = ROOT / 'docs/art_orders/ep002_final/15_adult_room_night.png'      # Quest's room today, night
CRT = ROOT / 'public/art/ep002/props3d/crt_front.png'                          # our 3D CRT, screen keyed green


def crt_with(pic, w):
    """Our CRT at width w with `pic` on its screen: warm glow, scanlines, a little curvature-like vignette."""
    tv = Image.open(CRT).convert('RGBA')
    tv = tv.resize((w, round(w * tv.height / tv.width)), Image.LANCZOS)
    a = np.asarray(tv).astype(int)
    key = (a[..., 1] > 150) & (a[..., 0] < 120) & (a[..., 2] < 120)
    ys, xs = np.nonzero(key)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    scr = _cover_img(pic, (x1 - x0, y1 - y0))
    d = ImageDraw.Draw(scr)
    for y in range(0, scr.height, 4):                                         # scanlines
        d.line((0, y, scr.width, y), fill=(0, 0, 0), width=1)
    scr = Image.blend(scr, scr.filter(ImageFilter.GaussianBlur(1.2)), .35)
    vig = Image.new('L', scr.size, 0); ImageDraw.Draw(vig).ellipse((-scr.width * .15, -scr.height * .2, scr.width * 1.15, scr.height * 1.2), fill=255)
    scr = Image.composite(scr, Image.new('RGB', scr.size, (10, 10, 20)), vig.filter(ImageFilter.GaussianBlur(40)))
    m = Image.fromarray((key[y0:y1, x0:x1] * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    out = tv.copy()
    out.paste(scr.convert('RGBA'), (int(x0), int(y0)), m)
    return out, (x0, y0, x1, y1)


def _cover_img(im, size):
    s = max(size[0] / im.width, size[1] / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x, y = (im.width - size[0]) // 2, (im.height - size[1]) // 2
    return im.crop((x, y, x + size[0], y + size[1])).convert('RGB')


def kid_on_screen():
    """1998 on the TV: the kid with his pad, facing out at today's Quest, in front of a warm 1998 field in pixels."""
    bg = K.pixelate(K.grade(K.cover(K.FIELD, focus=(.6, .45), zoom=1.25)), block=10, levels=32)
    bg = Image.blend(bg, Image.new('RGB', bg.size, (255, 190, 110)), .18)
    kid = K.cutout(K.Q_KID, 0, .7, flip=True)                                 # flipped: he looks left, at Quest
    pic = K.place(bg, kid, 330, 760, bottom=TH + 20, rim=(255, 240, 210))
    return K.pixelate(pic, block=5, levels=48)                                # 1998 on a 1998 TV: chunky pixels


def option1(words):
    """1 · Quest today, in his room at night, looks up in awe at the old CRT: on it, the kid he was in 1998."""
    bg = K.grade(K.cover(ROOM_TODAY, focus=(.62, .5), zoom=1.1), sat=1.2, con=1.1, bri=.62)
    tv, (sx0, sy0, sx1, sy1) = crt_with(kid_on_screen(), 520)
    tx, ty = 690, 190
    bg = K.glow(bg, tx + (sx0 + sx1) / 2, ty + (sy0 + sy1) / 2, 420, (120, 170, 255), .75)     # the TV lights the room
    bg = K.glow(bg, tx + (sx0 + sx1) / 2, ty + (sy0 + sy1) / 2, 220, (255, 220, 170), .35)
    out = bg.convert('RGBA'); out.alpha_composite(tv, (tx, ty)); bg = out.convert('RGB')
    q = K.cutout(K.Q_AWE, 0, .5)
    bg = K.place(bg, q, -40, 760, bottom=TH + 30, rim=(150, 190, 255))                      # rim light from the TV
    return K.words(bg, words, (560, 18, 1255, 175), align='right')


def option2(words):
    """2 · The kid with his pad, all joy; the same field and castle, half 1998 pixels, half today."""
    hd = K.grade(K.cover(K.FIELD, focus=(.6, .45), zoom=1.25), sat=1.3, con=1.12)
    px = K.pixelate(hd)
    m = Image.new('L', hd.size, 0)
    ImageDraw.Draw(m).polygon([(0, 0), (790, 0), (710, TH), (0, TH)], fill=255)
    bg = Image.composite(px, hd, m)
    d = ImageDraw.Draw(bg); d.line((790, 0, 710, TH), fill=WHITE, width=10); d.line((790, 0, 710, TH), fill=INK, width=4)
    bg = K.place(bg, K.cutout(K.Q_KID, 0, .62), -40, 690, rim=(255, 240, 200))
    if len(words) == 2 and words[0][0] == '1998':                                           # the two eras, each on its side
        bg = K.words(bg, [words[0]], (500, 30, 760, 160), align='center')
        return K.words(bg, [words[1]], (850, 30, 1240, 210), align='center')
    return K.words(bg, words, (560, 24, 1250, 230), align='right')


SETS = {
    '1': (option1, [('EXCEPT_YOU', [('EXCEPT', WHITE, .62), ('YOU', YELLOW, 1.0)]),
                    ('NOT_YOU', [('NOT', WHITE, .7), ('YOU.', YELLOW, 1.0)]),
                    ('YOU_CHANGED', [('YOU', WHITE, .62), ('CHANGED', YELLOW, 1.0)])]),
    '2': (option2, [('1998_2026', [('1998', WHITE, 1.0), ('2026', YELLOW, 1.0)]),
                    ('28_YEARS_LATER', [('28 YEARS', YELLOW, 1.0), ('LATER', WHITE, .8)]),
                    ('SAME_GAME', [('SAME', WHITE, .8), ('GAME?', YELLOW, 1.0)])]),
}


def review(rows):
    pad, tw, th = 20, 420, 236
    sh = Image.new('RGB', (pad + 3 * (tw + pad), 60 + len(rows) * (th + 150 + pad)), (28, 28, 34))
    d = ImageDraw.Draw(sh)
    d.text((pad, 14), 'EP002 · miniaturas v2 · opción 1 y opción 2 · 3 variantes de Test & Compare cada una (+ tamaño móvil)', font=K.font(22), fill=WHITE)
    y = 56
    for opt, items in rows:
        d.text((pad, y), f'Opción {opt}', font=K.font(24), fill=YELLOW); y += 34
        for i, (name, im) in enumerate(items):
            x = pad + i * (tw + pad)
            sh.paste(im.resize((tw, th), Image.LANCZOS), (x, y))
            sh.paste(im.resize((168, 94), Image.LANCZOS), (x, y + th + 8))
            d.text((x + 180, y + th + 12), name.replace('_', ' '), font=K.font(18), fill=WHITE)
        y += th + 116 + pad
    return sh


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rows = []
    for opt, (fn, variants) in SETS.items():
        items = []
        for name, words in variants:
            im = fn(words)
            im.save(OUT / f'EP002_thumb_opt{opt}_{name}.jpg', quality=92)
            items.append((name, im))
        rows.append((opt, items))
    review(rows).save(OUT / 'EP002_thumbs_v2_review.jpg', quality=90)
    print(OUT.relative_to(ROOT))


if __name__ == '__main__':
    main()
