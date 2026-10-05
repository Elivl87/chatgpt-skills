#!/usr/bin/env python3
"""EP001 Short #2 (1080x1920, ~59 s): the tractors section (l127-l147), the part viewers rewatch (48 h analytics).

  python3 scripts/ep001-short2-tractors.py            # preview mp4 -> docs/publish/EP001/short2/
  python3 scripts/ep001-short2-tractors.py --stills   # stills only

Producer (2026-10-05): "Haz el segundo Short de los tractores. Pero puedes mejorarlo con animatic?" - so it is built
with the animatic kit's motion (slides, stomps, shakes, labels, counters, a measuring tape, game pop-ups) on top of
EP001's approved art, instead of the engine's still frames. EP001 itself is untouched (this is a new Short).
Art is never edited: it is only placed, scaled and moved. Bram's EP001 narration, verbatim; burned-in Short captions
(word times from faster-whisper, text from the script). No credits spent.
"""
import json, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / 'public/art'
FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS = 1080, 1920, 30
T0, T1 = 302.15, 361.15                                                    # episode seconds (l127 -> l147 + end card)
NARR = ROOT / 'public/episodes/ep001_farming/audio/full/narration.wav'
OUTDIR = ROOT / 'docs/publish/EP001/short2'
INK = (22, 22, 31)


def ease(k):
    k = min(1, max(0, k)); return k * k * (3 - 2 * k)


def lin(a, b, k):
    return a + (b - a) * k


_FONTS = {}


def font(size, w='800'):
    key = (size, w)
    if key not in _FONTS:
        _FONTS[key] = ImageFont.truetype(str(ROOT / f'public/shared/fonts/Inter-{w}.woff2'), size)
    return _FONTS[key]


_IMG = {}


def art(rel):
    if rel not in _IMG:
        _IMG[rel] = Image.open(ART / rel).convert('RGBA')
    return _IMG[rel]


def sized(im, h=None, w=None):
    if h is not None:
        return im.resize((max(1, int(im.width * h / im.height)), max(1, int(h))), Image.LANCZOS)
    return im.resize((max(1, int(w)), max(1, int(im.height * w / im.width))), Image.LANCZOS)


def comp(fr, im, x, y):
    base = fr.convert('RGBA'); base.alpha_composite(im, (int(x), int(y))); return base.convert('RGB')


def fade(im, a):
    if a >= 1:
        return im
    im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * max(0, a)))); return im


_BG = {}


def bg(rel, fx=.5, zoom=1.0, fy=.5):
    """A 16:9 background viewed through a 9:16 window (cover), fx/fy = where the window looks, zoom >= 1."""
    key = (rel, round(fx, 3), round(zoom, 3), round(fy, 3))
    if key in _BG:
        return _BG[key].copy()
    src = art(rel).convert('RGB')
    s = H * zoom / src.height
    big_w, big_h = int(src.width * s), int(src.height * s)
    if len(_BG) > 40:
        _BG.clear()
    im = src.resize((big_w, big_h), Image.BILINEAR)
    x0 = int((big_w - W) * fx); y0 = int((big_h - H) * fy)
    out = im.crop((x0, y0, x0 + W, y0 + H))
    _BG[key] = out
    return out.copy()


def shadow(fr, cx, y, w, a=90):
    sh = Image.new('RGBA', (W, H)); ImageDraw.Draw(sh).ellipse((cx - w / 2, y - 18, cx + w / 2, y + 16), fill=(0, 0, 0, a))
    return Image.alpha_composite(fr.convert('RGBA'), sh.filter(ImageFilter.GaussianBlur(12))).convert('RGB')


def glow(fr, cx, cy, r, col, a):
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    for k in range(10, 0, -1):
        rr = r * k / 10
        d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=col + (int(a * (1 - k / 11) ** 1.6 * 255),))
    return Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(r / 6))).convert('RGB')


def label(fr, text, cx, cy, size=86, col=(255, 214, 40), k=1.0, rot=0, box=None):
    """A big pop-in word (the Short's on-screen beat)."""
    if k <= 0:
        return fr
    f = font(size)
    tw = int(ImageDraw.Draw(Image.new('RGB', (1, 1))).textlength(text, font=f))
    g = Image.new('RGBA', (tw + 60, size + 60)); d = ImageDraw.Draw(g)
    if box:
        d.rounded_rectangle((4, 4, tw + 56, size + 56), 18, fill=box + (235,), outline=INK + (255,), width=6)
    d.text((30, 18), text, font=f, fill=col + (255,), stroke_width=max(4, size // 12), stroke_fill=INK + (255,))
    sc = .6 + .4 * ease(k) + .12 * math.sin(math.pi * min(1, k))
    g = g.resize((int(g.width * sc), int(g.height * sc)), Image.LANCZOS)
    if rot:
        g = g.rotate(rot, resample=Image.BICUBIC, expand=True)
    return comp(fr, fade(g, min(1, k * 2)), cx - g.width / 2, cy - g.height / 2)


def shake(fr, t, t_hit, amp=22):
    if t < t_hit or t > t_hit + .5:
        return fr
    u = t - t_hit; a = amp * math.exp(-u * 9)
    dx, dy = a * math.sin(u * 80), a * .7 * math.cos(u * 67)
    big = fr.resize((int(W * 1.04), int(H * 1.04)), Image.BILINEAR)
    x0, y0 = int(W * .02 + dx), int(H * .02 + dy)
    return big.crop((x0, y0, x0 + W, y0 + H))


def dust(fr, t, t_hit, cx, y, spread=360):
    k = (t - t_hit) / .8
    if not 0 < k < 1:
        return fr
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    for i in range(12):
        a = math.pi * i / 11; rr = 40 + spread * ease(k)
        x = cx + math.cos(a) * rr * (1 if i % 2 else -1); yy = y - 30 * k * math.sin(a)
        s = 30 + 40 * k
        d.ellipse((x - s, yy - s * .6, x + s, yy + s * .6), fill=(224, 206, 170, int(190 * (1 - k))))
    return Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(5))).convert('RGB')


# ------------------------------------------------------------------ timing (episode seconds)
CUES = json.loads((ROOT / 'episodes/ep001full/timings.json').read_text())['cues']
STT = json.loads((ROOT / 'episodes/ep001short2/stt_words.json').read_text())


def T(lid):
    return CUES[lid]['start']


def words_for(lid):
    """Script words (verbatim) with times: STT words inside the line when the counts match, else spread evenly."""
    c = CUES[lid]; ws = c['text'].split()
    hit = [w for w in STT if c['start'] - .2 <= w['start'] <= c['end'] + .05]
    if len(hit) == len(ws):
        return [{'w': w, 'start': h['start'], 'end': h['end']} for w, h in zip(ws, hit)]
    n = len(ws); d = (c['end'] - c['start']) / max(1, n)
    return [{'w': w, 'start': c['start'] + i * d, 'end': c['start'] + (i + 1) * d} for i, w in enumerate(ws)]


LINES = [f'l{n}' for n in range(127, 148)]
WORDS = {lid: words_for(lid) for lid in LINES}


def chunks(words):
    out, cur = [], []
    for w in words:
        if cur and (len(cur) >= 3 or (len(cur) >= 2 and cur[-1]['w'][-1] in ',.?!:;') or w['start'] - cur[-1]['end'] > .35):
            out.append(cur); cur = []
        cur.append(w)
    if cur:
        out.append(cur)
    return out


def captions(fr, t):
    """Burned-in Short captions (EP001 Short style): white Inter heavy, ink outline and drop, short phrases."""
    lid = next((l for l in LINES if CUES[l]['start'] - .1 <= t <= CUES[l]['end'] + .25), None)
    if not lid:
        return fr
    ch = chunks(WORDS[lid]); cur = None
    for i, k in enumerate(ch):
        nxt = ch[i + 1][0]['start'] if i + 1 < len(ch) else CUES[lid]['end'] + .25
        if k[0]['start'] - .05 <= t < nxt:
            cur = k
    if not cur:
        return fr
    d = ImageDraw.Draw(fr)
    pop = ease((t - cur[0]['start'] + .05) / .12)
    f = font(int(78 * (.86 + .14 * pop)))
    text = ' '.join(w['w'] for w in cur)
    lines, ln = [], ''
    for w_ in text.split():
        if d.textlength(ln + ' ' + w_, font=f) > W * .80 and ln:
            lines.append(ln); ln = w_
        else:
            ln = (ln + ' ' + w_).strip()
    lines.append(ln)
    lh = int(f.size * 1.14); y = H * .70 - lh * len(lines) / 2
    sw, drop = max(3, round(f.size * .13)), max(2, round(f.size * .07))
    for l_ in lines:
        x = (W - d.textlength(l_, font=f)) / 2
        d.text((x, y + drop), l_, font=f, fill=INK, stroke_width=sw, stroke_fill=INK)
        d.text((x, y), l_, font=f, fill='white', stroke_width=sw, stroke_fill=INK)
        y += lh
    return fr


# ------------------------------------------------------------------ shots
DEALER = 'genres/farming/backgrounds/dealership.png'
FIELD_G = 'genres/farming/backgrounds/field_green.png'
FIELD_Y = 'genres/farming/backgrounds/field_golden.png'
FIELD_S = 'genres/farming/backgrounds/field_sprouting.png'
FIELD_W = 'genres/farming/backgrounds/field_huge_wide.png'
GAMEFARM = 'genres/farming/backgrounds/idealized_game_farm.png'
SHOP = 'genres/farming/backgrounds/workshop.png'
M = 'genres/farming/machines/'


# ------------------------------------------------------------------ living machines (v2: more animatic motion)
EXHAUST = {'tractor_huge.png': (.33, .03), 'tractor_bigger.png': (.27, .30), 'tractor_small.png': (.28, .05), 'factory_harvester.png': (.62, .05)}


def machine(fr, rel, w, x, ground, t, moving=False, puff=True, seed=0):
    """A machine that is alive: engine idle shake, exhaust puffs, dust behind it when it drives (they face left)."""
    im = sized(art(M + rel), w=w)
    jig = 1.6 * math.sin(t * 38 + seed) * (w / 800)
    y = ground - im.height + jig
    if moving:                                                                   # dust kicked up behind the back wheels
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        for i in range(9):
            ph = (t * 1.6 + i / 9) % 1
            dx = x + im.width * .85 + 220 * ph * (w / 800); dy = ground - 10 - 50 * ph
            r = (18 + 60 * ph) * (w / 800)
            d.ellipse((dx - r, dy - r * .7, dx + r, dy + r * .7), fill=(214, 194, 150, int(170 * (1 - ph))))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(4))).convert('RGB')
    fr = shadow(fr, x + im.width / 2, ground, im.width * .8, 80)
    fr = comp(fr, im, x, y)
    ex = EXHAUST.get(rel)
    if puff and ex:                                                              # exhaust: little dark puffs rising
        g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
        px, py = x + im.width * ex[0], y + im.height * ex[1]
        w = min(w, 900)                                                          # puffs stay small on giant close-ups
        for i in range(6):
            ph = (t * 1.2 + i / 6 + seed * .1) % 1
            r = (10 + 34 * ph) * (w / 800)
            d.ellipse((px + 40 * ph * (w / 800) - r, py - 140 * ph * (w / 800) - r, px + 40 * ph * (w / 800) + r, py - 140 * ph * (w / 800) + r), fill=(90, 90, 96, int(150 * (1 - ph))))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(3))).convert('RGB')
    return fr, im


def quest_driving(fr, cx, ground, tw, t, moving=True):
    """Quest at the wheel of the small tractor (EP001's own pairing: tractor_small + quest tractor_side, same offsets)."""
    tr = sized(art(M + 'tractor_small.png'), w=tw)
    x = cx - tw / 2
    fr, _ = machine(fr, 'tractor_small.png', tw, x, ground, t, moving=moving, seed=3)
    q = sized(art('genres/farming/quest/tractor_side.png'), h=tw * .74)
    bob = 1.6 * math.sin(t * 38 + 3) * (tw / 800) + 3 * abs(math.sin(t * 7)) * (tw / 800)
    qx = cx + .16 * tw - q.width * .45; qy = ground - .43 * tw - q.height * .62 + bob
    return comp(fr, q, qx, qy)


def rays(fr, cx, cy, t, a=1.0, col=(255, 240, 190)):
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)
    for i in range(14):
        ang = i * 2 * math.pi / 14 + t * .25
        d.polygon(((cx, cy), (cx + 1600 * math.cos(ang - .07), cy + 1600 * math.sin(ang - .07)), (cx + 1600 * math.cos(ang + .07), cy + 1600 * math.sin(ang + .07))), fill=col + (int(60 * a),))
    return Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(8))).convert('RGB')


def sparkles(fr, pts, t, a=1.0):
    d = ImageDraw.Draw(fr)
    for i, (x, y) in enumerate(pts):
        ph = (t * 1.4 + i * .37) % 1
        r = 26 * math.sin(math.pi * ph) * a
        if r > 1:
            d.line((x - r, y, x + r, y), fill=(255, 255, 235), width=5); d.line((x, y - r, x, y + r), fill=(255, 255, 235), width=5)
    return fr


def s_elephant(t):
    """l127: the enormous green elephant in the room - the huge tractor rolls into the dealership and stops with a thud."""
    t_hit = T('l127') + 2.6
    fr = bg(DEALER, fx=.45, zoom=1.0)
    k = ease((t - T('l127') + .2) / 2.8)
    x = lin(W + 50, W * .5 - 1500 * .52, k)
    fr, tr = machine(fr, 'tractor_huge.png', 1500, x, H * .80, t, moving=k < 1)
    q = sized(art('core/quest/looking_up_awe.png'), h=H * .30)
    fr = comp(fr, q, W * .02, H * .93 - q.height)
    fr = dust(fr, t, t_hit, W * .5, H * .80)
    fr = shake(fr, t, t_hit, 18)
    return label(fr, 'THE GREEN ELEPHANT', W * .5, H * .16, 76, (140, 230, 110), ease((t - T('l127') - 2.4) / .3), rot=-4)


def s_cool(t):
    """l128: Tractors are cool - a hero reveal: light rays behind it, a slow push in, sparkles on the paint, Quest cheering."""
    u = t - T('l128')
    z = lin(1.0, 1.10, ease((u + .4) / 2.0))
    fr = bg(DEALER, fx=.55, zoom=1.12)
    fr = Image.blend(fr, Image.new('RGB', fr.size, (20, 18, 30)), .35)
    fr = rays(fr, W * .5, H * .45, t, ease((u + .2) / .4))
    fr, tr = machine(fr, 'tractor_bigger.png', int(1150 * z), W * .5 - 1150 * z / 2, H * .80, t)
    fr = sparkles(fr, [(W * .30, H * .50), (W * .62, H * .42), (W * .80, H * .58), (W * .45, H * .66)], t)
    q = sized(art('genres/farming/quest/excited.png'), h=H * .32)
    hop = 40 * abs(math.sin(u * 7))
    fr = comp(fr, q, W * .62, H * .95 - q.height - hop)
    return label(fr, 'COOL', W * .5, H * .17, 150, (255, 214, 40), ease((u - .3) / .25), rot=4)


def s_parade(t):
    """l129-l130: real machinery, a parade across the field."""
    fr = bg(FIELD_G, fx=.5, zoom=1.0)
    u = (t - T('l129')) / (T('l131') - T('l129'))
    rows = ((M + 'combine.png', 760, H * .50, 0.0), (M + 'sprayer.png', 980, H * .60, .25), (M + 'tractor_small.png', 520, H * .68, .5))
    for rel, w, y, ph in rows:
        x = lin(W + 40, -w - 40, ((u * 1.15 + ph) % 1.3) / 1.3)
        fr, _ = machine(fr, rel.split('/')[-1], w, x, y, t, moving=True, seed=int(ph * 10))
    return label(fr, 'REAL MACHINES', W * .5, H * .17, 84, (255, 255, 255), ease((t - T('l130') - .2) / .3), box=(40, 120, 60))


def s_tiny_huge(t):
    """l131-l132: tiny tractors - huge tractors (scale gag, Quest for scale)."""
    fr = bg(GAMEFARM, fx=.5, zoom=1.0)
    if t < T('l132') - .05:
        k = ease((t - T('l131')) / .5)
        fr = quest_driving(fr, W * .5, H * .66, lin(700, 190, k), t, moving=False)
        if k > .7:                                                          # a magnifier ring around the tiny one
            d = ImageDraw.Draw(fr)
            d.ellipse((W * .5 - 170, H * .66 - 250, W * .5 + 170, H * .66 + 90), outline=(255, 255, 255), width=10)
            d.line((W * .5 + 120, H * .66 + 50, W * .5 + 260, H * .66 + 190), fill=(255, 255, 255), width=18)
        return label(fr, 'TINY', W * .5, H * .20, 130, (140, 230, 110), ease((t - T('l131') - .2) / .25), rot=-5)
    t_hit = T('l132') + .1
    k = ease((t - T('l132') + .05) / .25)
    tw = lin(400, 1700, k)
    fr, _ = machine(fr, 'tractor_huge.png', int(tw), W * .5 - tw * .55, H * .70, t)
    q = sized(art('genres/farming/quest/excited.png'), h=H * .16)
    fr = comp(fr, q, W * .80, H * .93 - q.height)
    fr = shake(fr, t, t_hit, 26)
    return label(fr, 'HUGE', W * .5, H * .14, 170, (255, 214, 40), ease((t - t_hit) / .2), rot=4)


def s_factory(t):
    """l133: harvesters that look like industrial buildings learned how to move - it stomps, it smokes."""
    fr = bg(FIELD_Y, fx=.5, zoom=1.0)
    u = t - T('l133')
    step = abs(math.sin(u * 4.2))
    hv = sized(art(M + 'factory_harvester.png'), w=1250)
    x = lin(W * .25, -W * .05, ease(u / 3.6)); y = H * .66 - hv.height - 28 * step
    fr = shadow(fr, x + hv.width / 2, H * .66, hv.width * .7, 90)
    fr = comp(fr, hv, x, y)
    g = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(g)                    # chimney smoke puffs
    for i in range(7):
        ph = (u * .7 + i / 7) % 1
        sx, sy = x + hv.width * .62 + 60 * ph, y + hv.height * .05 - 260 * ph
        r = 26 + 70 * ph
        d.ellipse((sx - r, sy - r, sx + r, sy + r), fill=(150, 150, 150, int(170 * (1 - ph))))
    fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(6))).convert('RGB')
    if step < .12:                                                            # stomp lines
        d = ImageDraw.Draw(fr)
        for i in range(5):
            xx = x + hv.width * (.2 + .15 * i)
            d.line((xx, H * .67, xx - 30 + 15 * i, H * .71), fill=INK, width=8)
    return label(fr, 'A BUILDING. ON WHEELS.', W * .5, H * .16, 70, (255, 255, 255), ease((t - T('l133') - 1.0) / .3), box=(150, 60, 30))


def s_jobs(t):
    """l134-l136: planting / spraying / cutting - three stacked panels, each lights up on its word."""
    fr = Image.new('RGB', (W, H), (24, 26, 34))
    panels = ((FIELD_S, M + 'seeder.png', 'PLANTING', 'l134'), (FIELD_G, M + 'sprayer.png', 'SPRAYING', 'l135'), (FIELD_Y, M + 'combine.png', 'CUTTING', 'l136'))
    ph_h = H // 3 - 8; top = 0                                                   # Producer: no empty black band - three full-bleed panels
    for i, (b, m, name, lid) in enumerate(panels):
        y0 = top + i * (ph_h + 12)
        on = t >= T(lid) - .05
        pb = bg(b, fx=.5, zoom=1.0).crop((0, int(H * .30), W, int(H * .30) + ph_h))
        mi = sized(art(m), w=980 if 'combine' not in m else 760)
        u = t - T(lid)
        mx = lin(W * .55, W * .1, ease(u / 1.6)) if on else W * .55
        pb = comp(pb, mi, mx, ph_h * .92 - mi.height)
        pd = ImageDraw.Draw(pb, 'RGBA')
        if on and u < 1.6:                                                      # the action: seeds / mist / chaff
            r = np.random.default_rng(i)
            for j in range(26):
                if i == 0:
                    x = mx + mi.width * (.45 + .5 * r.random()); y = ph_h * .92 - (u * 120 * r.random()) % 60
                    pd.ellipse((x - 5, y - 5, x + 5, y + 5), fill=(240, 220, 120, 255))
                elif i == 1:
                    x = mx + mi.width * (.45 + .55 * r.random()); y = ph_h * .9 - 50 * r.random()
                    pd.ellipse((x - 14, y - 9, x + 14, y + 9), fill=(220, 240, 255, 120))
                else:
                    x = mx - 30 - 160 * r.random() * min(1, u * 2); y = ph_h * .7 - 90 * r.random()
                    pd.line((x, y, x - 12, y - 6), fill=(240, 210, 110, 255), width=4)
        if not on:
            pb = Image.blend(pb, Image.new('RGB', pb.size, (20, 22, 30)), .65)
        fr.paste(pb, (0, y0))
        d = ImageDraw.Draw(fr)
        d.rectangle((0, y0, W - 1, y0 + ph_h), outline=(255, 214, 40) if on else (70, 72, 84), width=8)
        f = font(64)
        tw = d.textlength(name, font=f)
        ly = y0 + ph_h - 124                                                    # bottom-left of the panel, clear of the captions
        d.rounded_rectangle((40, ly, 40 + tw + 40, ly + 84), 14, fill=(255, 214, 40) if on else (60, 62, 74), outline=INK, width=5)
        d.text((60, ly + 8), name, font=f, fill=INK)
    return fr


def s_manual(t):
    """l137: machines you will confidently pretend to understand after one tutorial."""
    fr = bg(SHOP, fx=.42, zoom=1.0)
    q = sized(art('core/quest/reading_manual.png'), h=H * .46)
    fr = comp(fr, q, W * .5 - q.width / 2, H * .92 - q.height)
    u = t - T('l137')
    d = ImageDraw.Draw(fr)
    if u < 3.6:                                                                 # confusion: question marks orbit
        for i in range(5):
            a = u * 2 + i * 1.25
            x = W * .5 + 300 * math.cos(a); y = H * .40 + 140 * math.sin(a)
            d.text((x, y), '?', font=font(90), fill=(255, 255, 255), stroke_width=7, stroke_fill=INK)
    k_tut = ease((u - 2.4) / .3)
    if k_tut > 0:                                                               # the one tutorial
        g = Image.new('RGBA', (520, 300)); gd = ImageDraw.Draw(g)
        gd.rounded_rectangle((4, 4, 515, 295), 22, fill=(18, 18, 24, 245), outline=(255, 255, 255, 255), width=6)
        gd.polygon(((220, 100), (220, 200), (310, 150)), fill=(255, 60, 60, 255))
        gd.rectangle((30, 250, 30 + 460 * min(1, max(0, (u - 2.6) / 1.4)), 262), fill=(255, 60, 60, 255))
        gd.text((30, 20), 'TUTORIAL  5:00', font=font(36), fill=(255, 255, 255, 255))
        fr = comp(fr, fade(g, k_tut * (1 - ease((u - 4.3) / .3))), W * .5 - 260, H * .12)
    k_exp = ease((u - 4.5) / .3)
    if k_exp > 0:
        fr = label(fr, 'EXPERT*', W * .5, H * .22, 130, (255, 214, 40), k_exp, rot=-6, box=(30, 30, 40))
        d = ImageDraw.Draw(fr)
        s = '*watched one tutorial'
        d.text((W * .5 - d.textlength(s, font=font(40, '800')) / 2, H * .30), s, font=font(40), fill=(255, 255, 255), stroke_width=4, stroke_fill=INK)
    return fr


def coin_counter(fr, t, t0, x, y, v0, v1, dur, prefix='$'):
    v = int(lin(v0, v1, ease((t - t0) / dur)))
    d = ImageDraw.Draw(fr)
    s = f'{prefix}{v:,}'
    f = font(92)
    tw = d.textlength(s, font=f)
    d.rounded_rectangle((x - tw / 2 - 30, y - 16, x + tw / 2 + 30, y + 112), 20, fill=(20, 22, 30), outline=(255, 214, 40), width=6)
    d.text((x - tw / 2, y), s, font=f, fill=(255, 214, 40))
    return fr


def s_tools(t):
    """l138-l140: money -> better tools: the 3 m header levels up to 6 m."""
    fr = bg(DEALER, fx=.5, zoom=1.0)
    u = t - T('l138')
    if t < T('l140') - .05:
        fr = coin_counter(fr, t, T('l139'), W * .5, H * .20, 2840, 48500, 1.5)
        h3 = sized(art(M + 'header_3m.png'), w=520)
        fr = comp(fr, h3, W * .5 - h3.width / 2, H * .55 - h3.height / 2)
        return label(fr, 'MORE MONEY', W * .5, H * .36, 80, (255, 255, 255), ease((t - T('l139')) / .3), box=(40, 120, 60))
    k = ease((t - T('l140')) / .5)
    h3 = sized(art(M + 'header_3m.png'), w=520); h6 = sized(art(M + 'header_6m.png'), w=1000)
    fr = comp(fr, fade(h3, 1 - k), W * .5 - h3.width / 2, H * .55 - h3.height / 2)
    fr = glow(fr, W * .5, H * .55, 380, (255, 240, 170), .6 * math.sin(math.pi * k))
    fr = comp(fr, fade(h6, k), W * .5 - h6.width / 2, H * .55 - h6.height / 2)
    return label(fr, 'LEVEL UP: BETTER TOOLS', W * .5, H * .22, 66, (255, 214, 40), ease((t - T('l140') - .1) / .3), box=(30, 30, 40))


def house_icon(w):
    g = Image.new('RGBA', (w, w)); d = ImageDraw.Draw(g)
    d.polygon(((w * .1, w * .48), (w * .5, w * .12), (w * .9, w * .48)), fill=(200, 60, 50, 255), outline=INK + (255,))
    d.rectangle((w * .2, w * .46, w * .8, w * .9), fill=(240, 228, 200, 255), outline=INK + (255,), width=5)
    d.rectangle((w * .44, w * .62, w * .58, w * .9), fill=(120, 80, 50, 255), outline=INK + (255,), width=4)
    return g


def progress(fr, x, y, w, k, text, col=(90, 200, 90)):
    d = ImageDraw.Draw(fr)
    d.rounded_rectangle((x, y, x + w, y + 70), 34, fill=(20, 22, 30), outline=(255, 255, 255), width=6)
    if k > 0:
        d.rounded_rectangle((x + 8, y + 8, x + 8 + (w - 16) * min(1, k), y + 62), 28, fill=col)
    d.text((x + 30, y - 66), text, font=font(48), fill=(255, 255, 255), stroke_width=5, stroke_fill=INK)
    return fr


def s_project(t):
    """l141-l142: a big field is a project (Quest crawling across it)... a machine worth more than a house erases it."""
    if t < T('l142') - .05:
        fr = bg(FIELD_W, fx=.5, zoom=1.0)
        u = t - T('l141')
        fr = quest_driving(fr, lin(W * .72, W * .52, u / 3.2), H * .74, 500, t)
        return progress(fr, W * .1, H * .17, W * .8, .03 + .01 * (u / 3), 'FIELD: 3%... (a project)')
    u = t - T('l142')
    if u < 2.6:                                                                 # the price tag passes a house
        fr = bg(DEALER, fx=.5, zoom=1.05)
        fr, _ = machine(fr, 'tractor_bigger.png', 880, W * .5 - 440, H * .80, t)
        fr = coin_counter(fr, t, T('l142'), W * .5, H * .10, 50000, 520000, 1.6)
        kh = ease((u - 1.2) / .3)
        if kh > 0:
            hi = house_icon(240)
            fr = comp(fr, fade(hi, kh), W * .5 - 300, H * .21)
            d = ImageDraw.Draw(fr)
            d.text((W * .5 - 30, H * .23), '<', font=font(150), fill=(255, 214, 40), stroke_width=8, stroke_fill=INK)
            d.text((W * .5 + 70, H * .245), 'TRACTOR', font=font(60), fill=(255, 255, 255), stroke_width=6, stroke_fill=INK)
        return fr
    k = ease((u - 2.6) / 1.4)                                                    # ...and erases the problem in minutes
    plowed = bg(FIELD_W, fx=.5, zoom=1.0); done = bg(FIELD_Y, fx=.5, zoom=1.0)
    x = lin(W + 40, -600, k)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle((min(W, x + 300), int(H * .45), W, H), fill=255)   # behind it the field is done
    fr = Image.composite(done, plowed, m.filter(ImageFilter.GaussianBlur(20)))
    fr, _ = machine(fr, 'tractor_bigger.png', 560, x, H * .74, t, moving=True)
    return progress(fr, W * .1, H * .17, W * .8, .03 + .97 * k, 'FIELD: 100% in minutes' if k > .95 else 'FIELD...')


def popup(fr, text, k, cross=0.0):
    if k <= 0:
        return fr
    g = Image.new('RGBA', (900, 260)); d = ImageDraw.Draw(g)
    d.rounded_rectangle((6, 6, 893, 253), 26, fill=(28, 34, 72, 245), outline=(255, 214, 40, 255), width=8)
    d.text((450 - d.textlength('ACHIEVEMENT', font=font(40)) / 2, 30), 'ACHIEVEMENT', font=font(40), fill=(255, 214, 40, 255))
    d.text((450 - d.textlength(text, font=font(64)) / 2, 110), text, font=font(64), fill=(255, 255, 255, 255))
    if cross > 0:
        d.line((40, 60, 40 + 820 * cross, 60 + 140 * cross), fill=(230, 50, 50, 255), width=16)
        d.line((860, 60, 860 - 820 * cross, 60 + 140 * cross), fill=(230, 50, 50, 255), width=16)
    sc = .7 + .3 * ease(k)
    g = g.resize((int(900 * sc), int(260 * sc)), Image.LANCZOS)
    return comp(fr, fade(g, k), W * .5 - g.width / 2, H * .18)


def s_feel(t):
    """l143-l145: progression you can feel; the game does not have to tell you - a pop-up, struck out."""
    fr = bg(FIELD_W, fx=.6, zoom=lin(1.0, 1.15, ease((t - T('l143')) / 5)))
    fr, _ = machine(fr, 'tractor_bigger.png', 760, lin(W * .25, W * .05, ease((t - T('l143')) / 5)), H * .68, t, moving=True)
    k = ease((t - T('l145')) / .3)
    cross = ease((t - T('l145') - .7) / .3)
    return popup(fr, 'YOU ARE STRONGER NOW', k, cross)


def s_12m(t):
    """l146: your tractor is twelve meters wider - a measuring tape runs out along the 12 m header."""
    fr = bg(FIELD_Y, fx=.5, zoom=1.0)
    hd = sized(art(M + 'header_12m.png'), w=1500)
    fr, _ = machine(fr, 'tractor_huge.png', 620, W * .5 - 620 * .2, H * .60, t)
    hx = W * .5 - hd.width * .62
    fr = comp(fr, hd, hx, H * .63 - hd.height)
    k = ease((t - T('l146') - .2) / 1.4)
    d = ImageDraw.Draw(fr)
    x0, y = max(30, hx + 20), H * .66
    x1 = lin(x0, W - 30, k)
    d.rectangle((x0, y, x1, y + 46), fill=(255, 214, 40), outline=INK, width=5)
    for i in range(int((x1 - x0) / 40)):
        xx = x0 + i * 40
        d.line((xx, y, xx, y + (24 if i % 5 else 40)), fill=INK, width=4)
    m = 12 * k
    return label(fr, f'{m:4.1f} m'.strip(), W * .5, H * .20, 150, (255, 214, 40), ease((t - T('l146')) / .3))


def s_know(t):
    """l147 + end card: you already know. FULL EPISODE ON THE CHANNEL."""
    fr = bg(GAMEFARM, fx=.5, zoom=1.0)
    q = sized(art('genres/farming/quest/excited.png'), h=H * .46)
    fr = comp(fr, q, W * .5 - q.width / 2, H * .94 - q.height - 30 * abs(math.sin((t - T('l147')) * 6)))
    fr = sparkles(fr, [(W * .25, H * .52), (W * .75, H * .48), (W * .7, H * .70)], t)
    k = ease((t - T('l147') - 1.2) / .4)
    if k > 0:
        fr = Image.blend(fr, Image.new('RGB', fr.size, (14, 16, 30)), .55 * k)
        wm = sized(art('core/brand/secondquest_wordmark.png'), w=860)
        fr = comp(fr, fade(wm, k), W * .5 - wm.width / 2, H * .20)
        fr = label(fr, 'FULL EPISODE ON THE CHANNEL', W * .5, H * .34, 52, (255, 255, 255), k, box=(30, 30, 40))
    return fr


SHOTS = ((T('l128') - .1, s_elephant), (T('l129') - .1, s_cool), (T('l131') - .1, s_parade), (T('l133') - .1, s_tiny_huge),
         (T('l134') - .1, s_factory), (T('l137') - .1, s_jobs), (T('l138') - .1, s_manual), (T('l141') - .1, s_tools),
         (T('l143') - .1, s_project), (T('l146') - .1, s_feel), (T('l147') - .1, s_12m), (T1 + 1, s_know))


def render(t):
    for t_end, fn in SHOTS:
        if t < t_end:
            fr = fn(t)
            break
    fr = captions(fr, t)
    if t < T0 + .25:
        fr = Image.blend(Image.new('RGB', fr.size, (0, 0, 0)), fr, (t - T0) / .25)
    return fr


STILLS = (('01_elephant', T('l127') + 3.2), ('02_cool', T('l128') + 1.0), ('03_parade', T('l130') + 1.5), ('04_tiny', T('l131') + .7),
          ('05_huge', T('l132') + .6), ('06_factory', T('l133') + 2.0), ('07_jobs', T('l136') + .6), ('08_expert', T('l137') + 5.5),
          ('09_levelup', T('l140') + 1.0), ('10a_project', T('l141') + 1.5), ('10_house', T('l142') + 2.0), ('11_minutes', T('l142') + 4.3), ('12_popup', T('l145') + 1.1),
          ('13_12m', T('l146') + 2.2), ('14_end', T1 - .3))


def main():
    OUTDIR.mkdir(parents=True, exist_ok=True)
    out = OUTDIR / 'EP001_short2_tractors_preview_v2.mp4'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', f'{T0:.3f}', '-t', f'{T1 - T0:.3f}', '-i', str(NARR), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000',
                          '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', str(out)],
                         stdin=subprocess.PIPE)
    for n in range(int((T1 - T0) * FPS)):
        p.stdin.write(render(T0 + n / FPS).tobytes())
    p.stdin.close(); p.wait()
    print(out.relative_to(ROOT), f'{T1 - T0:.1f}s')


def stills():
    OUTDIR.mkdir(parents=True, exist_ok=True)
    ims = []
    for name, t in STILLS:
        im = render(t); im.save(OUTDIR / f'still_{name}.jpg', quality=85); ims.append(im)
    sheet = Image.new('RGB', (8 * 270, 2 * 480), (10, 10, 14))
    for i, im in enumerate(ims):
        sheet.paste(im.resize((270, 480)), ((i % 8) * 270, (i // 8) * 480))
    sheet.save(OUTDIR / 'EP001_short2_review_v2.jpg', quality=85)
    print('stills')


if __name__ == '__main__':
    stills() if '--stills' in sys.argv else main()
