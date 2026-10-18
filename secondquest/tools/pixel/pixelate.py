#!/usr/bin/env python3
"""Pixel-art pass (engine treatment, source art untouched): turns a transparent cut-out into a hi-bit pixel sprite
like Dave the Diver's characters (Producer idea, 2026-10-18: pixel Quest/Pixie for the in-game world).

Box-downscale to a sprite height (150 px keeps faces readable; 110 px is chunkier), hard alpha, palette quantize
without dither, 1 px dark outline; optional nearest-neighbour upscale for display.
Usage: python3 tools/pixel/pixelate.py <in.png> <out.png> [--h 150] [--colors 28] [--scale 4]
"""
import argparse
from PIL import Image, ImageFilter

OUTLINE = (28, 24, 36, 255)


def pixelate(im, h=150, colors=28):
    im = im.convert('RGBA')
    im = im.crop(im.getbbox())
    w = round(im.width * h / im.height)
    sm = im.resize((w, h), Image.BOX)
    a = sm.split()[3].point(lambda v: 255 if v > 110 else 0)
    body = sm.convert('RGB').quantize(colors=colors, method=Image.Quantize.MAXCOVERAGE, dither=Image.Dither.NONE).convert('RGBA')
    body.putalpha(a)
    m = Image.new('L', (w + 2, h + 2), 0)
    m.paste(a, (1, 1))
    out = Image.new('RGBA', (w + 2, h + 2))
    ol = Image.new('RGBA', (w + 2, h + 2), OUTLINE)
    ol.putalpha(m.filter(ImageFilter.MaxFilter(3)))
    out.alpha_composite(ol)
    out.alpha_composite(body, (1, 1))
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('dst')
    ap.add_argument('--h', type=int, default=150); ap.add_argument('--colors', type=int, default=28)
    ap.add_argument('--scale', type=int, default=1)
    a = ap.parse_args()
    o = pixelate(Image.open(a.src), a.h, a.colors)
    if a.scale > 1:
        o = o.resize((o.width * a.scale, o.height * a.scale), Image.NEAREST)
    o.save(a.dst)
