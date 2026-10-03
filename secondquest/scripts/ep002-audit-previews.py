#!/usr/bin/env python3
"""EP002 real-library reconstruction previews (planning only, no generation).

  python3 scripts/ep002-audit-previews.py

Composes each Director's Scene Book visual family from REAL FINAL_ART files in public/art,
plus programmatic elements (Navi, Triforce, technical overlays, museum glass) drawn in code.
Elements the library does not have are drawn as dashed, labelled MISSING boxes, so the true
NEW_ART gap is visible in the frame. Output: docs/ep002/audit/*.jpg (960x540 previews).
"""
import json, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'docs/ep002/audit'
W, H = 960, 540
cat = json.loads((ROOT / 'shared/art_catalog.json').read_text())['assets']
FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
FS = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 12)

def art(key):
    return Image.open(ROOT / ('public' + cat[key]['path'])).convert('RGBA')

def bg(key, focus=0.5, zoom=1.0):
    im = art(key)
    s = max(W / im.width, H / im.height) * zoom
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = round((im.width - W) * focus)
    y = (im.height - H) // 2
    return im.crop((x, y, x + W, y + H))

def put(canvas, key, x, y, h, flip=False, anchor=(0.5, 1.0), alpha=1.0):
    im = art(key)
    im = im.crop(im.getbbox())
    s = h * H / im.height
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    if alpha < 1:
        im.putalpha(im.getchannel('A').point(lambda v: int(v * alpha)))
    canvas.alpha_composite(im, (round(x * W - anchor[0] * im.width), round(y * H - anchor[1] * im.height)))

def navi(canvas, x, y, r=14):
    """Programmatic Navi: glowing blue-white orb with four translucent wings."""
    cx, cy = x * W, y * H
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    for i in range(10, 0, -1):
        rr = r * (1 + i * 0.45)
        g.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=(120, 200, 255, int(18 + 6 * (10 - i))))
    glow = glow.filter(ImageFilter.GaussianBlur(r * 0.6))
    canvas.alpha_composite(glow)
    d = ImageDraw.Draw(canvas)
    for dx, dy, ang in ((-1, -1, -30), (1, -1, 30), (-1, 0.6, 20), (1, 0.6, -20)):
        wing = Image.new('RGBA', (int(r * 3), int(r * 1.6)), (0, 0, 0, 0))
        ImageDraw.Draw(wing).ellipse((0, 0, wing.width - 1, wing.height - 1), fill=(225, 245, 255, 150))
        wing = wing.rotate(ang, expand=True)
        canvas.alpha_composite(wing, (int(cx + dx * r * 1.1 - wing.width / 2), int(cy + dy * r * 0.9 - wing.height / 2)))
    d.ellipse((cx - r * 0.75, cy - r * 0.75, cx + r * 0.75, cy + r * 0.75), fill=(235, 250, 255, 255))

def triforce(canvas, x, y, size=120, alpha=255):
    """Programmatic Triforce: three golden triangles."""
    d = ImageDraw.Draw(canvas)
    s = size
    cx, top = x * W, y * H - s * 0.87
    h = s * 0.866 / 2 * 2
    pts = lambda ax, ay: [(ax, ay), (ax - s / 4, ay + h / 2), (ax + s / 4, ay + h / 2)]
    for ax, ay in ((cx, top), (cx - s / 4, top + h / 2), (cx + s / 4, top + h / 2)):
        d.polygon(pts(ax, ay), fill=(244, 196, 48, alpha), outline=(120, 80, 10, alpha))

def missing(canvas, x, y, w, h, label, anchor=(0.5, 1.0)):
    """Dashed red box: element the library does not have (TRUE GAP candidate)."""
    d = ImageDraw.Draw(canvas)
    x0, y0 = x * W - anchor[0] * w * W, y * H - anchor[1] * h * H
    x1, y1 = x0 + w * W, y0 + h * H
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ov).rectangle((x0, y0, x1, y1), fill=(255, 60, 60, 38))
    canvas.alpha_composite(ov)
    for i in range(int(x0), int(x1), 12):
        d.line((i, y0, min(i + 6, x1), y0), fill=(255, 70, 70, 255), width=2)
        d.line((i, y1, min(i + 6, x1), y1), fill=(255, 70, 70, 255), width=2)
    for j in range(int(y0), int(y1), 12):
        d.line((x0, j, x0, min(j + 6, y1)), fill=(255, 70, 70, 255), width=2)
        d.line((x1, j, x1, min(j + 6, y1)), fill=(255, 70, 70, 255), width=2)
    lines = label.split('\n')
    ty = (y0 + y1) / 2 - len(lines) * 8
    for ln in lines:
        tw = d.textlength(ln, font=FS)
        d.rectangle(((x0 + x1) / 2 - tw / 2 - 3, ty - 1, (x0 + x1) / 2 + tw / 2 + 3, ty + 14), fill=(120, 0, 0, 220))
        d.text(((x0 + x1) / 2 - tw / 2, ty), ln, fill=(255, 255, 255), font=FS)
        ty += 16

def wireframe(canvas, alpha=110, labels=()):
    d = ImageDraw.Draw(canvas)
    for i in range(0, W, 40):
        d.line((i, H * 0.55, W / 2 + (i - W / 2) * 3, H), fill=(80, 255, 200, alpha), width=1)
    for j in range(8):
        yy = H * 0.55 + (H * 0.45) * (j / 8) ** 1.6
        d.line((0, yy, W, yy), fill=(80, 255, 200, alpha), width=1)
    for i, (t, x, y) in enumerate(labels):
        tw = d.textlength(t, font=FS)
        d.rectangle((x * W - 4, y * H - 2, x * W + tw + 4, y * H + 15), fill=(10, 20, 30, 200), outline=(80, 255, 200, 255))
        d.text((x * W, y * H), t, fill=(160, 255, 220), font=FS)

def meters(canvas, items, alpha=230):
    d = ImageDraw.Draw(canvas)
    for i, (name, val) in enumerate(items):
        x, y = 24, 24 + i * 34
        d.rectangle((x, y, x + 250, y + 24), fill=(10, 14, 26, 200), outline=(120, 200, 255, alpha))
        d.rectangle((x + 110, y + 7, x + 110 + 130 * val, y + 17), fill=(90, 220, 140, alpha))
        d.text((x + 8, y + 5), name, fill=(220, 235, 255), font=FS)

def glass(canvas):
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(ov)
    g.rectangle((60, 40, W - 60, H - 40), outline=(220, 240, 255, 230), width=6, fill=(200, 230, 255, 30))
    for k in range(5):
        g.line((120 + k * 70, 60, 60 + k * 70, 200), fill=(255, 255, 255, 70), width=10)
    canvas.alpha_composite(ov)

def caption(canvas, title, method):
    d = ImageDraw.Draw(canvas)
    d.rectangle((0, H - 30, W, H), fill=(10, 10, 14, 215))
    d.text((10, H - 23), title, fill=(255, 220, 60), font=FB)
    tw = d.textlength(method, font=FB)
    d.text((W - tw - 10, H - 23), method, fill=(140, 220, 255), font=FB)

def save(canvas, name):
    OUT.mkdir(parents=True, exist_ok=True)
    canvas.convert('RGB').save(OUT / f'{name}.jpg', quality=88)

def main():
    # A — MEMORY ROOM (01, 05, 21, 26, 27)
    c = bg('core.bg.quest_bedroom_morning', 0.25)
    missing(c, 0.66, 0.70, 0.22, 0.30, 'MISSING\nCRT TV +\nNintendo 64 +\nOcarina cartridge')
    put(c, 'quest.default.gaming_excited', 0.36, 1.0, 0.72)
    navi(c, 0.62, 0.42, 12)
    caption(c, 'A · MEMORY ROOM — seq 01 hook (normal Quest + Navi appears)', 'RECOMPOSE + GAP')
    save(c, 'A1_memory_room_hook')

    c = bg('core.bg.quest_bedroom_morning', 0.25)
    missing(c, 0.66, 0.70, 0.22, 0.30, 'MISSING\nCRT TV + N64')
    missing(c, 0.40, 0.98, 0.16, 0.42, 'MISSING\nchild Quest\n(normal outfit)')
    caption(c, 'A · MEMORY ROOM — seq 05 childhood / seq 26 empty room (same base)', 'RECOMPOSE + GAP')
    save(c, 'A2_memory_room_child_and_empty')

    # B — ENTRY / THRESHOLD (02)
    c = bg('ep001.bg_fantasy_doors', 0.5)
    put(c, 'quest.default.walking_back', 0.5, 1.0, 0.5)
    navi(c, 0.5, 0.42, 14)
    missing(c, 0.78, 0.98, 0.16, 0.5, 'MISSING\nAdult\nHero-of-Time\nQuest')
    caption(c, 'B · ENTRY — seq 02: Navi leads Quest through the threshold; outfit transition', 'REUSE + PROGRAMMATIC + GAP')
    save(c, 'B_entry_threshold')

    # C — HYRULE FIELD (04, 07, 09–11, 13, 16, 24, 25, 27–29)
    c = bg('genre.fantasy.bg_castle_rescue', 0.0)
    missing(c, 0.30, 0.92, 0.05, 0.12, 'MISSING\nYoung HoT\nQuest')
    navi(c, 0.33, 0.70, 7)
    caption(c, 'C · HYRULE FIELD — seq 07 "Because you were smaller" (nearest existing plate)', 'GAP: Hyrule Field plate')
    save(c, 'C1_field_castle_rescue')

    c = bg('core.bg.storm_low_horizon', 0.5)
    put(c, 'quest.default.walking_back', 0.5, 0.86, 0.12)
    navi(c, 0.53, 0.66, 6)
    caption(c, 'C · HYRULE FIELD alt — storm_low_horizon open grass (no castle, wrong mood)', 'RECOMPOSE (weak)')
    save(c, 'C2_field_storm_horizon')

    c = bg('ep001.bg_crossroads', 0.3)
    missing(c, 0.42, 0.95, 0.24, 0.42, 'MISSING\nAdult HoT Quest\n+ Epona')
    navi(c, 0.52, 0.5, 8)
    caption(c, 'C · SAME ROAD — seq 24/25/29 on bg_crossroads (farm + city skyline = wrong world)', 'GAP: Hyrule road')
    save(c, 'C3_road_crossroads')

    # D — RELICS (03, 14, 22)
    c = bg('ep001.bg_fantasy_doors', 0.5)
    dark = Image.new('RGBA', (W, H), (0, 0, 10, 150)); c.alpha_composite(dark)
    missing(c, 0.22, 0.65, 0.17, 0.32, 'MISSING\nOcarina of Time\n(prop)')
    missing(c, 0.50, 0.75, 0.12, 0.55, 'MISSING\nMaster Sword\n(prop)')
    triforce(c, 0.79, 0.66, 150)
    navi(c, 0.62, 0.30, 10)
    caption(c, 'D · RELICS — seq 03: ocarina / sword / Triforce (Triforce = programmatic)', 'PROGRAMMATIC + GAP')
    save(c, 'D_relics')

    # E — KOKIRI / SARIA (06, 23) — nothing in library
    c = bg('genre.farming.bg_station_animals', 0.5)
    missing(c, 0.5, 0.96, 0.9, 0.9, 'MISSING\nKokiri forest plate\n+ Saria\n+ Young HoT Quest')
    caption(c, 'E · KOKIRI / SARIA — seq 06, 23 (no forest/village plate in library)', 'GAP')
    save(c, 'E_kokiri_saria')

    # F — TEMPLE OF TIME (14, 19)
    c = bg('ep001.bg_fantasy_doors', 0.5)
    missing(c, 0.5, 0.95, 0.9, 0.86, 'MISSING\nTemple of Time interior\n+ Master Sword pedestal\n+ Young / Adult HoT Quest')
    navi(c, 0.62, 0.45, 10)
    caption(c, 'F · TEMPLE OF TIME — seq 19 hero moment (fantasy_doors is not the Temple)', 'GAP')
    save(c, 'F_temple_of_time')

    # G — GREAT DEKU TREE (15)
    c = bg('core.bg.storm_low_horizon', 0.5)
    missing(c, 0.5, 0.97, 0.9, 0.9, 'MISSING\nGreat Deku Tree plate')
    caption(c, 'G · GREAT DEKU TREE — seq 15 joke (no asset)', 'GAP')
    save(c, 'G_deku_tree')

    # H — TECHNICAL / MEASURABLE vs FAMILIAR (08, 10–12, 17, 18, 20)
    c = bg('genre.fantasy.bg_castle_rescue', 0.0)
    missing(c, 0.30, 0.92, 0.05, 0.12, 'Young HoT\nQuest')
    navi(c, 0.33, 0.70, 7)
    wireframe(c, 120, [('POLYGONS 4,096', 0.62, 0.14), ('TEXTURE 64x64', 0.62, 0.22), ('480i', 0.62, 0.30)])
    caption(c, 'H · seq 08 "memory doesn\'t remember specs" — overlays on the field plate', 'PROGRAMMATIC')
    save(c, 'H1_tech_overlay')

    c = bg('genre.fantasy.bg_castle_rescue', 0.0)
    navi(c, 0.33, 0.70, 7)
    meters(c, [('GEOMETRY', 0.9), ('LIGHTING', 0.8), ('ANIMATION', 0.85), ('SOUND', 0.75), ('CAMERA', 0.9)])
    caption(c, 'H · seq 11 "Better is measurable" → metrics removed on "Familiar is not"', 'PROGRAMMATIC')
    save(c, 'H2_measurable')

    c = bg('genre.fantasy.bg_castle_rescue', 0.0)
    glass(c)
    caption(c, 'H · seq 17/20 museum glass → breaks open', 'PROGRAMMATIC')
    save(c, 'H3_museum_glass')

    # I — ZELDA / GANONDORF (14)
    c = bg('genre.fantasy.bg_castle_rescue', 0.6)
    put(c, 'genre.fantasy.princess', 0.3, 1.0, 0.8)
    missing(c, 0.72, 1.0, 0.24, 0.85, 'MISSING\nGanondorf')
    triforce(c, 0.5, 0.36, 90, 220)
    caption(c, 'I · ZELDA / GANONDORF — seq 14 (princess exists but is not Zelda-coded)', 'DERIVE? + GAP')
    save(c, 'I_zelda_ganondorf')

    # J — EPONA / ADULT ARC (24, 25, 29)
    c = bg('core.bg.sunset_sky', 0.5)
    mg = art('genre.farming.layer.sunset_farm_midground'); mg = mg.resize((W, round(mg.height * W / mg.width)), Image.LANCZOS)
    c.alpha_composite(mg, (0, H - round(mg.height * 0.62)))
    missing(c, 0.40, 0.98, 0.34, 0.6, 'MISSING\nAdult HoT Quest\nbeside Epona')
    navi(c, 0.55, 0.48, 9)
    caption(c, 'J · FINAL HERO IMAGE — seq 29 (sunset plate exists but is farmland)', 'GAP')
    save(c, 'J_final_epona')

    # contact sheet
    files = sorted(p for p in OUT.glob('[A-J]*.jpg') if p.name[1] in '0123456789_')
    cols = 3
    rows = math.ceil(len(files) / cols)
    S = Image.new('RGB', (cols * 480 + (cols + 1) * 6, rows * 270 + (rows + 1) * 6), (18, 18, 22))
    for i, f in enumerate(files):
        im = Image.open(f).resize((480, 270))
        S.paste(im, (6 + (i % cols) * 486, 6 + (i // cols) * 276))
    S.save(OUT / 'EP002_audit_contact_sheet.jpg', quality=85)
    print('\n'.join(f.name for f in files))

if __name__ == '__main__':
    main()
