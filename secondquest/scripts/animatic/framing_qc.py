#!/usr/bin/env python3
"""Framing QC for animatic blocks (Producer rule: always check sizes, centring and that everything sits well inside
the viewer's frame before sending anything).

  python3 scripts/animatic/framing_qc.py scripts/ep002-blockC-animatic.py [--step 0.5]

Samples the block's render(t) every --step seconds and writes a contact sheet with the safe areas drawn on each frame:
  green  = action-safe (95%): nothing important may cross it
  yellow = title-safe (90%): faces, key props and text stay inside
  blue band = the review-subtitle zone (subtitles exist only in review cuts)
Output: docs/<ep>/<script name>_framing.jpg. It only reports; it never changes art.
"""
import importlib.util, sys
from pathlib import Path
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import ROOT, W, H, F  # noqa


def main():
    script = Path(sys.argv[1]).resolve()
    step = float(sys.argv[sys.argv.index('--step') + 1]) if '--step' in sys.argv else 0.5
    spec = importlib.util.spec_from_file_location('blk', script)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    t0 = getattr(m, 'T0', 0.0); t1 = m.T_END
    ts = [t0 + i * step for i in range(int((t1 - t0) / step) + 1)]
    tw, th, cols = 426, 240, 5
    sheet = Image.new('RGB', (tw * cols, (th + 18) * ((len(ts) + cols - 1) // cols)), (20, 20, 24))
    for i, t in enumerate(ts):
        fr = m.render(t).copy()
        d = ImageDraw.Draw(fr)
        for frac, col in ((.95, (60, 220, 90)), (.90, (240, 210, 60))):
            mx, my = W * (1 - frac) / 2, H * (1 - frac) / 2
            d.rectangle((mx, my, W - mx, H - my), outline=col, width=3)
        d.rectangle((0, H * .8 - 45, W, H * .8 + 45), outline=(80, 140, 255), width=2)
        x, y = (i % cols) * tw, (i // cols) * (th + 18)
        sheet.paste(fr.resize((tw, th)), (x, y + 18))
        ImageDraw.Draw(sheet).text((x + 4, y + 2), f'{t:6.2f}s', font=F(13), fill=(230, 230, 230))
    ep = script.name.split('-')[0]
    out = ROOT / 'docs' / ep / f'{script.stem}_framing.jpg'
    sheet.save(out, quality=82)
    print(out.relative_to(ROOT))


if __name__ == '__main__':
    main()
