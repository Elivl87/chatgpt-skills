#!/usr/bin/env python3
"""EP002 sequence 01 (the approved cartridge animatic v9) — engine layers built from free sources.

  python3 tools/props3d/render.py n64_room n64_pad n64_insert_hd   # 3D props (free, local)
  python3 scripts/ep002-seq01-build.py

Writes public/art/ep002/seq01/ (regenerable, not versioned):
  room_n64_setup.png   3840x2160 transparent layer that sits exactly on core.bg.living_room_night_gaming:
                       N64 classic on the rug, the N64 controller, its cable to the first port, soft contact shadows
                       (same placement as scripts/ep002-cartridge-animatic.py, approved). The background is never edited.
  room_n64_setup_cart_in.png  the same with the cartridge seated (shots after the click)
  insert_bg.png        2304x1296 blurred, darkened close-up of the rug behind the 3D insert frames
  cartridge.png        the cartridge mock v4 / label v2 as a prop (in Quest's hands until his pose exists)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PROPS = ROOT / 'public/art/ep002/props3d'
OUT = ROOT / 'public/art/ep002/seq01'
PW, PH = 3840, 2160
S = PW / 960  # placements below are in 960x540 plate units (same numbers as the approved animatic)


def fit(img, w):
    return img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)


def setup_layer(n64_file):
    ov = Image.new('RGBA', (PW, PH))
    n64 = fit(Image.open(PROPS / n64_file).convert('RGBA'), int(112 * S))
    n64_x, n64_y = int(640 * S), int(392 * S) - n64.height
    sh = Image.new('RGBA', (PW, PH))
    ImageDraw.Draw(sh).ellipse((n64_x + 4 * S, n64_y + n64.height - 9 * S, n64_x + n64.width - 2 * S, n64_y + n64.height + 5 * S), fill=(20, 12, 8, 150))
    ov.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6 * S)))
    ov.alpha_composite(n64, (n64_x, n64_y))

    pad = fit(Image.open(PROPS / 'n64_pad_room.png').convert('RGBA'), int(74 * S))
    pad_x, pad_y = int(584 * S), int(452 * S) - pad.height
    p0 = (pad_x + pad.width * 0.45, pad_y + pad.height * 0.04)
    p3 = (n64_x + n64.width * 0.10, n64_y + n64.height * 0.53)
    c1, c2 = (p0[0] - 4 * S, p0[1] - 16 * S), (p3[0] - 26 * S, p3[1] + 8 * S)
    bez = [tuple((1 - u) ** 3 * a + 3 * (1 - u) ** 2 * u * b + 3 * (1 - u) * u * u * c + u ** 3 * d for a, b, c, d in zip(p0, c1, c2, p3))
           for u in [i / 60 for i in range(61)]]
    ImageDraw.Draw(ov).line(bez, fill=(28, 22, 22, 255), width=int(3.2 * S), joint='curve')
    sh2 = Image.new('RGBA', (PW, PH))
    ImageDraw.Draw(sh2).ellipse((pad_x + 4 * S, pad_y + pad.height - 7 * S, pad_x + pad.width - 4 * S, pad_y + pad.height + 3 * S), fill=(20, 12, 8, 120))
    ov.alpha_composite(sh2.filter(ImageFilter.GaussianBlur(5 * S)))
    ov.alpha_composite(pad, (pad_x, pad_y))
    return ov


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    plate = Image.open(ROOT / 'public/art/core/backgrounds/living_room_night_gaming.png').convert('RGBA')
    assert plate.size == (PW, PH), plate.size
    setup_layer('n64_room_3q.png').save(OUT / 'room_n64_setup.png', optimize=True)
    # after the click the cartridge stays in the console (continuity for the TV shot)
    setup_layer('n64_room_3q_cart_in.png').save(OUT / 'room_n64_setup_cart_in.png', optimize=True)

    crop = plate.crop((int(600 * S), int(300 * S), int(840 * S), int(435 * S))).resize((2304, 1296), Image.LANCZOS)
    bg = Image.blend(crop.filter(ImageFilter.GaussianBlur(24)).convert('RGB'), Image.new('RGB', (2304, 1296), (14, 10, 12)), 0.35)
    bg.save(OUT / 'insert_bg.png', optimize=True)

    cart = Image.open(ROOT / 'docs/ep002/source/cartridge_mock_front.png').convert('RGBA')
    fit(cart, 600).save(OUT / 'cartridge.png', optimize=True)
    print('public/art/ep002/seq01: room_n64_setup(_cart_in).png, insert_bg.png, cartridge.png')


if __name__ == '__main__':
    main()
