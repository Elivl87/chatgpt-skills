"""SecondQuest animatic kit (free, local): shot-list driven planning videos.

A shot is a dict:
  start      time expression ('l12', 'l12.end', 'l02.w11', 'l12+0.3', or seconds)
  plate      ('img', path) | ('proc', name, kwargs) — 1920x1080 working plate, never edited
  layers     static cut-outs placed on the plate: {img|char, x, y (bottom-centre, plate fractions), h (fraction of plate
             height), flip, alpha, label}; composited once per shot
  movers     cut-outs that move: {img|char, keys: [(t_expr, x, y, h), ...], alpha}
  cam        ((zoom, x, y), (zoom, x, y)) eased over the shot, or 'continue' to start where the previous shot ended
  fx         screen-space effects evaluated per frame (see FX below)
  tag        planning label shown top-left
Characters that do not exist yet are drawn from existing art with a clear MISSING label (planning only).
"""
import colorsys, json, math, re
from functools import lru_cache
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
PW, PH = 1920, 1080          # working plate
W, H, FPS = 1280, 720, 24    # output
F = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', s)
FSUB, FTAG, FLAB, FBIG = F(30), F(16), F(15), F(44)

tm = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())
CUES = tm['cues']
DURATION = tm['duration']

ease = lambda k: 0.5 - 0.5 * math.cos(math.pi * min(1, max(0, k)))
lin = lambda a, b, k: a + (b - a) * k


# ------------------------------------------------------------------ time
def T(expr):
    if isinstance(expr, (int, float)):
        return float(expr)
    m = re.fullmatch(r'\s*(l\d+)(?:\.w(\d+))?(?:\.(end))?\s*(?:([+-])\s*(\d*\.?\d+))?\s*', expr)
    if not m:
        raise ValueError(expr)
    cue = CUES[m[1]]
    if m[2]:
        w = cue['words'][int(m[2]) - 1]
        base = w['end'] if m[3] else w['start']
    else:
        base = cue['end'] if m[3] else cue['start']
    if m[4]:
        base += float(m[5]) * (1 if m[4] == '+' else -1)
    return base


# ------------------------------------------------------------------ characters
QUEST = ROOT / 'public/art/core/quest'
QUEST2 = ROOT / 'docs/art_orders/quest/library_v2/results'
PIXIE = ROOT / 'docs/art_orders/pixie/library/results'


def char_path(name):
    """'quest:looking_up_awe' (existing), 'quest2:wave_happy' (library v2), 'pixie:thinking_chin'."""
    who, pose = name.split(':')
    if who == 'quest':
        return QUEST / f'{pose}.png'
    base = QUEST2 if who == 'quest2' else PIXIE
    return next(base.glob(f'*_{pose}.png'))


def _hue_shift(img, src_hues, dst_hue, sat_min=0.35):
    """Recolour clothing for MISSING costume previews (planning only): pixels whose hue is in src_hues -> dst_hue."""
    a = np.asarray(img).astype(np.float32) / 255
    rgb = a[..., :3]
    mx, mn = rgb.max(2), rgb.min(2)
    d = mx - mn + 1e-6
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    s = d / (mx + 1e-6)
    sel = np.zeros(h.shape, bool)
    for lo, hi in src_hues:
        sel |= (h >= lo) & (h <= hi) if lo <= hi else ((h >= lo) | (h <= hi))
    sel &= s > sat_min
    out = rgb.copy()
    hs = np.full(h.shape, dst_hue)
    # rebuild colour with the new hue, same s/v
    v = mx
    i = np.floor(hs * 6).astype(int) % 6
    f = hs * 6 - np.floor(hs * 6)
    p, q, t_ = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
    conv = np.stack([np.choose(i, [v, q, p, p, t_, v]), np.choose(i, [t_, v, v, q, p, p]), np.choose(i, [p, p, t_, v, v, q])], -1)
    out[sel] = conv[sel]
    return Image.fromarray((np.dstack([out, a[..., 3:]]) * 255).astype(np.uint8), 'RGBA')


COSTUMES = {  # planning previews of costumes that do not exist yet
    'hero': dict(src=[(0.95, 0.05)], hue=0.30, label='MISSING · Hero-of-Time outfit'),       # Quest red -> green
    'forest': dict(src=[(0.45, 0.58)], hue=0.30, label='MISSING · forest-friend outfit'),   # Pixie teal -> green
    'princess': dict(src=[(0.45, 0.58)], hue=0.85, label='MISSING · princess outfit'),      # Pixie teal -> pink
}


@lru_cache(maxsize=256)
def cutout(name, costume=None, young=False):
    im = Image.open(char_path(name)).convert('RGBA')
    im = im.crop(im.getchannel('A').getbbox())
    if costume:
        c = COSTUMES[costume]
        im = _hue_shift(im, c['src'], c['hue'])
    return im


def label_for(spec):
    if spec.get('costume'):
        lab = COSTUMES[spec['costume']]['label']
        return lab + (' · young' if spec.get('young') else '')
    if spec.get('young'):
        return 'MISSING · young Quest (planning: scaled adult pose)'
    return spec.get('label')


# ------------------------------------------------------------------ procedural planning plates (MISSING backgrounds)
def _sky(img, top, bottom, horizon):
    d = ImageDraw.Draw(img)
    for y in range(int(horizon)):
        k = y / max(1, horizon)
        d.line([(0, y), (PW, y)], fill=tuple(int(lin(top[i], bottom[i], k)) for i in range(3)))


PALETTES = {
    'dawn': ((150, 160, 230), (250, 205, 205), (120, 175, 85)),
    'day': ((110, 170, 235), (205, 230, 245), (110, 175, 80)),
    'sunset': ((90, 80, 160), (250, 170, 110), (95, 130, 70)),
    'night': ((15, 20, 50), (55, 60, 110), (35, 60, 45)),
    'storm': ((45, 45, 60), (95, 90, 110), (55, 75, 50)),
}


def plate_field(time='dawn', label=True):
    """MISSING Hyrule-Field-like plate (planning only): sky, far mountains, smoking volcano, tiny castle, hills, path."""
    top, bot, grass = PALETTES[time]
    img = Image.new('RGB', (PW, PH), grass)
    hz = PH * 0.52
    _sky(img, top, bot, hz)
    d = ImageDraw.Draw(img)
    far = tuple(int(c * .75) for c in bot)
    d.polygon([(0, hz), (180, hz - 120), (330, hz - 60), (520, hz - 170), (700, hz - 40), (760, hz)], fill=far)
    d.polygon([(1300, hz), (1560, hz - 330), (1620, hz - 345), (1880, hz), ], fill=(150, 95, 70) if time != 'night' else (50, 35, 40))
    d.ellipse((1450, hz - 420, 1730, hz - 360), outline=(245, 245, 245), width=10)                     # smoke ring
    cx = 980
    for k, (w_, h_) in enumerate([(70, 70), (30, 120), (30, 90)]):                                    # tiny castle
        d.rectangle((cx - w_ / 2 + (k - 1) * 40, hz - h_, cx + w_ / 2 + (k - 1) * 40, hz), fill=far)
    d.rectangle((300, hz - 30, 560, hz + 10), fill=(140, 110, 80))                                     # ranch walls
    g2 = tuple(int(c * .85) for c in grass)
    d.polygon([(0, hz + 40), (500, hz - 10), (1100, hz + 30), (1920, hz - 5), (1920, PH), (0, PH)], fill=g2)
    d.polygon([(0, hz + 160), (700, hz + 90), (1400, hz + 170), (1920, hz + 120), (1920, PH), (0, PH)], fill=grass)
    path = [(860, PH), (1060, PH), (1010, hz + 260), (990, hz + 120), (975, hz + 20), (965, hz + 20), (950, hz + 140), (900, hz + 300)]
    d.polygon(path, fill=(200, 175, 110) if time != 'night' else (90, 85, 70))
    if time == 'night':
        for _ in range(140):
            x, y = np.random.randint(0, PW), np.random.randint(0, int(hz) - 60)
            d.point((x, y), fill=(240, 240, 255))
    if label:
        _miss_label(d, 'MISSING · Hyrule Field plate (NEW_ART) · planning layout')
    return img


def plate_forest(label=True):
    img = Image.new('RGB', (PW, PH), (40, 70, 40))
    _sky(img, (30, 60, 35), (90, 140, 70), PH)
    d = ImageDraw.Draw(img)
    for k in range(14):
        x = k * 150 - 40 + (k % 3) * 25
        d.rectangle((x, 0, x + 60 + (k % 4) * 15, PH), fill=(70, 50, 35))
    for k in range(5):
        d.polygon([(300 + k * 340, 0), (360 + k * 340, 0), (520 + k * 340, PH), (420 + k * 340, PH)], fill=(150, 190, 110))
    d.rectangle((0, PH * .78, PW, PH), fill=(85, 130, 60))
    for x in (380, 1400):                                                                            # tree houses
        d.ellipse((x, PH * .55, x + 220, PH * .8), fill=(110, 80, 50))
    if label:
        _miss_label(d, 'MISSING · forest village plate (NEW_ART) · planning layout')
    return img


def plate_temple(label=True):
    img = Image.new('RGB', (PW, PH), (70, 70, 85))
    d = ImageDraw.Draw(img)
    for k in range(6):
        x = 120 + k * 330
        d.rectangle((x, 60, x + 90, PH * .8), fill=(110, 110, 125))
    d.polygon([(860, 0), (1060, 0), (1180, PH * .82), (740, PH * .82)], fill=(150, 160, 190))          # light shaft
    d.rectangle((0, PH * .8, PW, PH), fill=(60, 60, 75))
    d.rectangle((900, PH * .72, 1020, PH * .82), fill=(130, 130, 145))                                # pedestal
    d.polygon([(955, PH * .5), (965, PH * .5), (968, PH * .72), (952, PH * .72)], fill=(220, 225, 240))  # sword
    d.rectangle((940, PH * .56, 980, PH * .575), fill=(90, 70, 160))
    if label:
        _miss_label(d, 'MISSING · temple with sword pedestal plate (NEW_ART) · planning layout')
    return img


def plate_tree(label=True):
    img = Image.new('RGB', (PW, PH), (60, 90, 55))
    _sky(img, (40, 70, 45), (110, 150, 90), PH)
    d = ImageDraw.Draw(img)
    d.rectangle((560, 0, 1360, PH * .85), fill=(95, 70, 45))
    d.ellipse((300, -500, 1620, 380), fill=(55, 105, 50))
    d.rectangle((0, PH * .82, PW, PH), fill=(80, 120, 55))
    if label:
        _miss_label(d, 'MISSING · giant ancient tree plate (NEW_ART) · planning layout')
    return img


def plate_dark(label=None):
    img = Image.new('RGB', (PW, PH), (18, 8, 8))
    if label:
        _miss_label(ImageDraw.Draw(img), label)
    return img


def _miss_label(d, text):
    tw = d.textlength(text, font=FLAB)
    d.rectangle((14, PH - 52, 34 + tw, PH - 22), fill=(120, 20, 20))
    d.text((24, PH - 48), text, font=FLAB, fill=(255, 220, 220))


PROC = {'field': plate_field, 'forest': plate_forest, 'temple': plate_temple, 'tree': plate_tree, 'dark': plate_dark}


@lru_cache(maxsize=32)
def plate(spec):
    kind = spec[0]
    if kind == 'img':
        im = Image.open(ROOT / spec[1]).convert('RGB')
        return im.resize((PW, PH), Image.LANCZOS)
    args = dict(spec[2]) if len(spec) > 2 else {}
    return PROC[spec[1]](**args)


# ------------------------------------------------------------------ layers
def place(base, spec, t=None):
    """Composite a cut-out spec on an RGBA plate-sized image."""
    if spec.get('full'):          # full-frame layer aligned with the plate (e.g. the N64 setup layer)
        base.alpha_composite(Image.open(ROOT / spec['img']).convert('RGBA').resize((PW, PH), Image.LANCZOS))
        return
    if 'img' in spec:
        im = Image.open(ROOT / spec['img']).convert('RGBA')
        im = im.crop(im.getchannel('A').getbbox())
    else:
        im = cutout(spec['char'], spec.get('costume'), spec.get('young', False))
    h = int(spec['h'] * (0.72 if spec.get('young') else 1) * PH)
    im = im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS)
    if spec.get('flip'):
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    a = spec.get('alpha', 1)
    if a < 1:
        al = im.getchannel('A').point(lambda v: int(v * a)); im.putalpha(al)
    x, y = spec['x'] * PW - im.width / 2, spec['y'] * PH - im.height
    if spec.get('shadow', True) and a >= 1:
        sh = Image.new('RGBA', base.size)
        ImageDraw.Draw(sh).ellipse((x + im.width * .1, y + im.height - 12, x + im.width * .9, y + im.height + 10), fill=(15, 10, 8, 110))
        base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
    base.alpha_composite(im, (int(x), int(y)))
    lab = label_for(spec)
    if lab:
        d = ImageDraw.Draw(base)
        tw = d.textlength(lab, font=FLAB)
        lx = min(max(10, x + im.width / 2 - tw / 2), PW - tw - 10)
        d.rectangle((lx - 6, y - 26, lx + tw + 6, y - 4), fill=(120, 20, 20, 230))
        d.text((lx, y - 24), lab, font=FLAB, fill=(255, 220, 220))


def missing_box(base, box, text):
    d = ImageDraw.Draw(base)
    x0, y0, x1, y1 = [v * (PW if i % 2 == 0 else PH) for i, v in enumerate(box)]
    d.rectangle((x0, y0, x1, y1), outline=(255, 70, 70, 255), width=5, fill=(60, 10, 10, 120))
    d.line((x0, y0, x1, y1), fill=(255, 70, 70, 140), width=2); d.line((x0, y1, x1, y0), fill=(255, 70, 70, 140), width=2)
    d.text((x0 + 10, y0 + 8), 'MISSING', font=F(24), fill=(255, 110, 110))
    d.text((x0 + 10, y0 + 38), text, font=FLAB, fill=(255, 220, 220))


# ------------------------------------------------------------------ camera
def cam_box(cam, k):
    (z0, x0, y0), (z1, x1, y1) = cam
    e = ease(k)
    z = z0 * (z1 / z0) ** e; x = lin(x0, x1, e); y = lin(y0, y1, e)
    m = 0.5 / z
    x = min(max(x, m), 1 - m); y = min(max(y, m), 1 - m)
    cw, ch = PW / z, PH / z
    return (x * PW - cw / 2, y * PH - ch / 2, x * PW + cw / 2, y * PH + ch / 2)


def to_screen(px, py, box):
    return (px * PW - box[0]) * W / (box[2] - box[0]), (py * PH - box[1]) * H / (box[3] - box[1])


# ------------------------------------------------------------------ text
def subtitle(d, t, t_end=None):
    c = next((c for c in CUES.values() if c['start'] - 0.1 <= t <= c['end'] + 0.25), None)
    if not c:
        return
    words = [w['w'] for w in c['words'] if w['start'] <= max(t, c['start']) + 9]
    text = ' '.join(words)
    lines, cur = [], ''
    for w_ in text.split():
        if d.textlength(cur + ' ' + w_, font=FSUB) > W - 140 and cur:
            lines.append(cur); cur = w_
        else:
            cur = (cur + ' ' + w_).strip()
    lines.append(cur)
    y = H - 30 - 38 * len(lines)
    for ln in lines:
        tw = d.textlength(ln, font=FSUB)
        d.text(((W - tw) / 2, y), ln, font=FSUB, fill='white', stroke_width=3, stroke_fill='black')
        y += 38


def tag(d, text):
    d.rectangle((0, 0, d.textlength(text, font=FTAG) + 22, 28), fill=(0, 0, 0))
    d.text((11, 5), text, font=FTAG, fill=(255, 210, 90))
