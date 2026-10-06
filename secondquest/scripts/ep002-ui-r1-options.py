#!/usr/bin/env python3
"""EP002 UI style: two alternatives for R1's 1998 / 2026 (the Producer did not like the sharp sign in the 1998 half).
  python3 scripts/ep002-ui-r1-options.py   # -> docs/ep002/EP002_ui_R1_options.jpg"""
import importlib.util, sys
from pathlib import Path
from PIL import Image, ImageDraw
HERE = Path('/home/user/chatgpt-skills/secondquest/scripts')
sys.path.insert(0, str(HERE / 'animatic'))
from lib import ROOT, W, H, plate_to_screen
import ui_kit as K
sp = importlib.util.spec_from_file_location('R', HERE / 'ep002-blockR-animatic.py'); R = importlib.util.module_from_spec(sp); sp.loader.exec_module(R)
def paste(fr, im, x, y):
    b = fr.convert('RGBA'); b.alpha_composite(im, (int(x), int(y))); return b.convert('RGB')
t = R.T0 + 1.0
old = R.render(t)
R.year_tag = lambda fr, cx, text, col, k=1.0: fr
base = R.render(t)
x, y, ha, hy, k = R.duo(t)
sx, sy, sa = plate_to_screen(x, y, ha, R.field_box(t, t1=R.T_SAME))
# option 1: the 1998 sign modelled as in 1998
o1 = base
for half, text in ((0, '1998'), (1, '2026')):
    sg = K.wood_sign_1998(text, h_px=int(sa * .7)) if half == 0 else K.wood_sign(text, h_px=int(sa * .7))
    cx = sx - W / 4 + half * W / 2 - sa * .55
    o1 = paste(o1, sg, cx - sg.width / 2, sy - sa * .12 - sg.height)
# option 2: area title cards in the sky
o2 = base
for half, text in ((0, '1998'), (1, '2026')):
    g = K.area_title(text, retro=(half == 0), size=48)
    o2 = paste(o2, g, W / 4 + half * W / 2 - g.width / 2, H * .13)
out = Path(ROOT / 'docs/ep002/ui_style'); out.mkdir(exist_ok=True)
TW, TH, pad = 640, 360, 20
sh = Image.new('RGB', (pad * 4 + TW * 3, TH + 110), K.INK); d = ImageDraw.Draw(sh)
for i, (lab, im) in enumerate((('ACTUAL', old), ('OPCIÓN 1 · el letrero de 1998 modelado como en 1998', o1), ('OPCIÓN 2 · título de zona (como al entrar a un lugar)', o2))):
    x0 = pad + i * (TW + pad)
    d.text((x0, 30), lab, font=K.inter(17), fill=K.GOLD if i == 0 else K.WHITE)
    sh.paste(im.resize((TW, TH), Image.LANCZOS), (x0, 80))
sh.save(ROOT / 'docs/ep002/EP002_ui_R1_options.jpg', quality=90)
o1.save(out / 'r1_option1.jpg', quality=92); o2.save(out / 'r1_option2.jpg', quality=92)
print('ok')
