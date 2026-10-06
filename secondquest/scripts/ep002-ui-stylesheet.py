#!/usr/bin/env python3
"""EP002 on-screen text: style sheet for the Producer (current vs proposed, on real animatic frames). Planning only.

  python3 scripts/ep002-ui-stylesheet.py     # -> docs/ep002/EP002_ui_style_sheet.jpg

Each row renders the block's own frame twice: as it is, and with the box swapped for the proposed component from
scripts/animatic/ui_kit.py (the block scripts themselves are not changed).
"""
import importlib.util, math, sys
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
from lib import ROOT, W, H, T, ease, plate_to_screen  # noqa: E402
import ui_kit as K  # noqa: E402


def load(name, path):
    sp = importlib.util.spec_from_file_location(name, HERE / path); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


def paste(fr, im, x, y):
    base = fr.convert('RGBA'); base.alpha_composite(im, (int(x), int(y))); return base.convert('RGB')


def fade(im, k):
    if k >= 1:
        return im
    im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * k))); return im


def row1():
    """R1: 1998 / 2026 -> carved wooden signs (B)"""
    rows = []
    R = load('R', 'ep002-blockR-animatic.py')
    t = R.T0 + 1.0
    old = R.render(t)
    R.year_tag = lambda fr, cx, text, col, k=1.0: fr                       # drawn below, planted in each half's field
    new = R.render(t)
    x, y, ha, hy, k = R.duo(t)
    sx, sy, sa = plate_to_screen(x, y, ha, R.field_box(t, t1=R.T_SAME))
    for half, text in ((0, '1998'), (1, '2026')):
        sg = K.wood_sign(text, h_px=int(sa * .7))
        if half == 0:                                                       # the 1998 half: the sign in 1998 pixels too
            sg = sg.resize((max(1, sg.width // 3), max(1, sg.height // 3)), Image.NEAREST).resize(sg.size, Image.NEAREST)
        cx = sx - W / 4 + half * W / 2 - sa * .55
        new = paste(new, sg, cx - sg.width / 2, sy - sa * .12 - sg.height)
    rows.append(('R1 · 1998 / 2026', 'B · letreros de madera tallados en el campo (el de 1998, en píxeles)', old, new))


    return rows[0]


def row2():
    """R2: SAME ROAD / DIFFERENT PERSON -> signpost (B) + game tag (A)"""
    rows = []
    R2 = load('R2', 'ep002-blockR-animatic.py')
    t = R2.T_DIFF + .8
    old = R2.render(t)
    orig = R2.BQ.BO.tagbox
    R2.BQ.BO.tagbox = lambda text, col=None, **kw: Image.new('RGBA', (2, 2)) if text == 'SAME ROAD' else K.sq_tag(text, 20)
    new = R2.render(t)
    R2.BQ.BO.tagbox = orig
    x, y, ha, hy, k = R2.duo(t)
    px, py, ph = plate_to_screen(x - .2 * k, y - .03, ha * 1.0, R2.field_box(t, **R2.R2_CAM))   # left verge, ahead of them
    sp = K.signpost('SAME ROAD', h_px=int(ph))
    new = paste(new, sp, px - sp.width * .3, py - sp.height)
    rows.append(('R2 · SAME ROAD / DIFFERENT PERSON', 'B · poste indicador al borde del camino  +  A · etiqueta de juego', old, new))


    return rows[0]


def row3():
    """H2: NEW QUEST -> quest notice (A)"""
    rows = []
    Hm = load('H', 'ep002-blockH-animatic.py')
    t = T('l60.w5') + .9
    old = Hm.render(t)


    def message_box(fr, t, alpha=1.0):
        full = 'The Impossible Job'
        n = int(len(full) * min(1, max(0, (t - Hm.T_JOB - .15) / (T('l60.w5') + .25 - Hm.T_JOB - .15))))
        g = K.sq_banner('New quest', full, n=n, t=t)
        return paste(fr, fade(g, alpha), W * .035 - 8, H * .30 - 8)


    Hm.message_box = message_box
    new = Hm.render(t + .0)
    rows.append(('H2 · NEW QUEST', 'A · aviso de misión: pergamino, letras que se escriben, destello de hada', old, new))


    return rows[0]


def row4():
    """E5: the feature list -> parchment (B)"""
    rows = []
    E = load('E', 'ep002-blockE-animatic.py')
    t = E.ITEMS[3][1] + .5
    old = E.render(t)


    def checklist(fr, t):
        k_in = ease(min(1, max(0, (t - E.T_LIST + .3) / .4)))
        ticks = [ease(min(1, max(0, (t - ti + .05) / .35))) if t >= ti - .05 else 0 for _, ti in E.ITEMS]
        g = K.parchment_list([s for s, _ in E.ITEMS], ticks)
        return paste(fr, g, 22 - (g.width + 60) * (1 - k_in), 104)


    E.checklist = checklist
    new = E.render(t)
    rows.append(('E5 · lista de novedades', 'B · pergamino de "notas del parche", marcado a pluma', old, new))


    return rows[0]


def row5():
    """O3: FOG / LOW POLY on the TV -> EP001 marker (C)"""
    rows = []
    O = load('O', 'ep002-blockO-animatic.py')
    t = 281.2
    old = O.render(t)
    O.tagbox = lambda text, col=None, flipped=False, k_flip=None: K.marker(text, 19, paper=flipped)
    new = O.render(t)
    rows.append(('O3 · FOG / LOW POLY (vida real)', 'C · marcador del EP001: Inter 800, borde tinta (solo cambia la tipografía)', old, new))


    return rows[0]


ROWS = [row1, row2, row3, row4, row5]
SCR = ROOT / 'docs/ep002/ui_style'


# ---------------------------------------------------------------- the sheet
def sheet():
    import json
    rows = []
    for i in range(len(ROWS)):
        meta = json.loads((SCR / f'row{i + 1}.json').read_text())
        rows.append((meta['title'], meta['what'], Image.open(SCR / f'row{i + 1}_current.jpg'), Image.open(SCR / f'row{i + 1}_proposed.jpg')))
    TW, TH = 640, 360
    pad, head = 24, 64
    sh = Image.new('RGB', (pad * 3 + TW * 2, 150 + len(rows) * (head + TH + pad)), K.INK)
    d = ImageDraw.Draw(sh)
    d.text((pad, 22), 'SecondQuest · cajas de texto · hoja de estilo', font=K.anton(44), fill=K.WHITE)
    d.text((pad, 84), 'Tipografía del canal (EP001): Anton para impacto · INTER 800 para etiquetas.   A juego · B mundo · C vida real',
           font=K.inter(18, 600), fill=(200, 200, 215))
    for lab, x in (('ACTUAL', pad), ('PROPUESTA', pad * 2 + TW)):
        K.spaced(d, (x, 120), lab, K.inter(16), K.GOLD, 2)
    y = 150
    for title, what, old, new in rows:
        d.text((pad, y + 6), title, font=K.inter(22), fill=K.WHITE)
        d.text((pad, y + 36), what, font=K.inter(16, 600), fill=(190, 200, 220))
        sh.paste(old.resize((TW, TH), Image.LANCZOS), (pad, y + head))
        sh.paste(new.resize((TW, TH), Image.LANCZOS), (pad * 2 + TW, y + head))
        y += head + TH + pad
    out = ROOT / 'docs/ep002/EP002_ui_style_sheet.jpg'
    sh.save(out, quality=90)
    print(out.relative_to(ROOT))


if __name__ == '__main__':
    import json, subprocess
    SCR.mkdir(parents=True, exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[1] == 'row':                   # one row per process: the blocks are heavy
        i = int(sys.argv[2])
        title, what, old, new = ROWS[i - 1]()
        old.save(SCR / f'row{i}_current.jpg', quality=92); new.save(SCR / f'row{i}_proposed.jpg', quality=92)
        (SCR / f'row{i}.json').write_text(json.dumps({'title': title, 'what': what}, ensure_ascii=False))
    elif len(sys.argv) > 1 and sys.argv[1] == 'sheet':                 # rebuild the sheet from the saved rows
        sheet()
    else:
        for i in range(1, len(ROWS) + 1):
            subprocess.run([sys.executable, __file__, 'row', str(i)], check=True)
        sheet()
