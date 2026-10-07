#!/usr/bin/env python3
"""EP002 HUD proposal sheet (Producer, 2026-10-07): the button gloss no longer cuts a see-through hole; rupees lower.
  QUALITY=review python3 scripts/ep002-hud-fix-proposal.py   # -> docs/ep002/EP002_hud_fix_proposal.jpg + _buttons_zoom.jpg
"""
import importlib.util, sys
sys.path.insert(0, 'scripts/animatic')
import hud
from PIL import Image, ImageDraw, ImageFont
shots = [('ep002-blockB-animatic.py', 21.2, 'B · campo'), ('ep002-blockF-B-animatic.py', 112.0, 'F · plan'), ('ep002-blockJ-animatic.py', 191.0, 'J · árbol')]
f = ImageFont.truetype('public/shared/fonts/Inter-800.woff2', 22)
rows = []
for script, t, lab in shots:
    sp = importlib.util.spec_from_file_location(script, 'scripts/' + script); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
    hud.GLOSS_FIX, hud.RUPEE_FROM_BOTTOM = False, 132; a = m.render(t).convert('RGB')
    hud.GLOSS_FIX, hud.RUPEE_FROM_BOTTOM = True, 72; b = m.render(t).convert('RGB')
    rows.append((lab, a, b))
W, H = rows[0][1].size
tw, th = 640, 360
sh = Image.new('RGB', (tw * 2 + 60, len(rows) * (th + 50) + 60), (24, 24, 30)); d = ImageDraw.Draw(sh)
d.text((20, 15), 'ACTUAL', font=f, fill='white'); d.text((tw + 40, 15), 'PROPUESTA: botones sólidos con brillo + rupias más abajo', font=f, fill=(255, 200, 61))
for i, (lab, a, b) in enumerate(rows):
    y = 55 + i * (th + 50)
    d.text((20, y), lab, font=f, fill=(200, 200, 210))
    sh.paste(a.resize((tw, th), Image.LANCZOS), (20, y + 32)); sh.paste(b.resize((tw, th), Image.LANCZOS), (tw + 40, y + 32))
sh.save('docs/ep002/EP002_hud_fix_proposal.jpg', quality=90)
# zoom on the buttons of the first shot
lab, a, b = rows[0]
box = (int(W * .66), 0, W, int(H * .2))
z = Image.new('RGB', ((box[2] - box[0]) * 2 + 20, (box[3] - box[1]) * 2 * 2 + 30), (24, 24, 30))
z.paste(a.crop(box).resize(((box[2] - box[0]) * 2, (box[3] - box[1]) * 2)), (10, 10))
z.paste(b.crop(box).resize(((box[2] - box[0]) * 2, (box[3] - box[1]) * 2)), (10, 20 + (box[3] - box[1]) * 2))
z.save('docs/ep002/EP002_hud_buttons_zoom.jpg', quality=92)
print('ok')
