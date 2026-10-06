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


# ------------------------------------------------------------------ final art (generated 2026-10-05, Producer-approved)
# The generated images are never modified: overlays (the 3D shield, the crest on the banners) are composited on top
# here, and mirrors are engine transforms. Keys are what the blocks ask for; the numbers are docs/ep002/MISSING_ART.md.
ART_Q, ART_P, ART_F = 'docs/art_orders/quest/ep002_costume/', 'docs/art_orders/pixie/ep002_costume/', 'docs/art_orders/ep002_final/'
ART = {
    'quest_veteran': ART_Q + '01_tunic_veteran.png',              # 1  adult, tunic, front, confident
    'quest_scared': ART_Q + '02_tunic_scared.png',                # 2  adult, tunic, front, scared
    'quest_young_back': ART_Q + '03_young_back.png',              # 3  young, tunic, back (walk: alternate with _b)
    'quest_young_back_b': ART_Q + '03_young_back.png',            # 9  the opposite step = #3 mirrored (Producer)
    'quest_young_lookup': ART_Q + '03a_young_threequarter_lookup.png',  # 3a looks up to the left (mirror it to look right)
    'quest_young_front': ART_Q + '03b_young_front_smile.png',     # 3b young, tunic, front, smiling
    'quest_adult_back': ART_Q + '04_adult_back_gear.png',         # 4  adult, back, 3D shield + scabbard
    'quest_adult_walk': ART_Q + '04b_adult_back_walk_nogear.png',  # 4b adult, back, mid-stride, NO gear (walk; just after the pull)
    'quest_horse_back': ART_Q + '05b_adult_horse_back_chestnut.png',  # 5b on his chestnut horse, back, 3D shield
    'kid_quest_play': ART_Q + '06a_kid_playing_seated.png',       # 6a kid, red hoodie, playing, faces right
    'kid_pixie_point': ART_P + '6b_kid_pointing.png',             # 6b kid Pixie pointing right
    'kid_pixie_sit': ART_P + '6c_kid_sitting.png',                # 6c kid Pixie sitting, faces right
    'quest_blow': ART_Q + '10a_blowing_cartridge.png',            # 10a red hoodie, profile right, blowing the cartridge
    'quest_profile_think': ART_Q + '10b_profile_thinking.png',    # 10 red hoodie, seated profile right, pensive
    'pixie_impatient': ART_P + '2a_impatient_arms_crossed.png',   # 2a hoodie, arms crossed
    'pixie_bored': ART_P + '2b_bored_imaginary_watch.png',        # 2b hoodie, imaginary watch, yawn
    'pixie_tunic_wave': ART_P + '2c_tunic_waving.png',            # 2c tunic, waving
    'pixie_tunic_awe': ART_P + '2d_tunic_awe.png',                # 2d tunic, looking up in awe
    'pixie_tunic_think': ART_P + '2e_tunic_thinking.png',         # 2e tunic, thinking
    'pixie_tunic_back': ART_P + '2f_tunic_back.png',              # 2f tunic, back
    'pixie_princess': ART_P + '2g_princess_front.png',            # 2g Pixie as the princess, front (gown of #17+18)
    'villain_hooded': 'docs/art_orders/villain/08_villain_hooded_reach.png',   # 8 the villain, hooded, low angle, claw reaching left
}
ART_SHIELD = {'quest_adult_back': '04_adult_back', 'quest_horse_back': '05b_horse_back'}   # tools/props3d/shield_mount.py
ART_FLIP = {'quest_young_back_b'}
PLATES = {
    'field': ART_F + '11_field.png',                              # 11 day field: road, castle far away, volcano
    'forest': ART_F + '12_forest_village.png',                    # 12 forest village
    'temple': ART_F + '13_temple_pedestal.png',                   # 13 temple hall, empty pedestal (+ crest banners)
    'tree': ART_F + '14_giant_tree.png',                          # 14 the giant tree
    'adult_room': ART_F + '15_adult_room_night.png',              # 15 adult Quest's bedroom at night
    'outcrop': ART_F + '17_18_outcrop_vista.png',                 # 17+18 final shot (+ 3D shield on Quest)
}
PLATE_OVERLAYS = {'temple': 'public/art/ep002/overlays/13_temple_crest.png', 'outcrop': 'public/art/ep002/props3d/shield_on_17_18_outcrop.png'}


@lru_cache(maxsize=32)
def _raw_box(key):
    a = Image.open(ROOT / ART[key]).getchannel('A').point(lambda v: 0 if v < 24 else v)
    return a.getbbox()


# The drawn scabbards give way to the one 3D sword (v2 in its 3D scabbard) everywhere adult Quest carries it: lines from
# the drawn pommel to the drawn scabbard tip, in full-canvas pixels of each art.
SWORD_LINES = {'quest_horse_back': ((1130, 225), (915, 880)), 'outcrop': ((1205, 470), (1025, 960))}


def _sword_layer(size, line):
    """The 3D sword in its scabbard laid along `line` (pommel -> tip) on a transparent canvas of `size`."""
    import cv2
    sw = np.asarray(Image.open(ROOT / 'public/art/ep002/props3d/back_sword.png').convert('RGBA'))
    src = np.float32([[sw.shape[1] / 2, 0], [sw.shape[1] / 2, sw.shape[0]]])
    M, _ = cv2.estimateAffinePartial2D(src, np.float32(line))
    return Image.fromarray(cv2.warpAffine(sw, M, size, flags=cv2.INTER_AREA, borderValue=(0, 0, 0, 0)), 'RGBA')


def _sword_swap(im, line=None, shield=None, opaque=False):
    """The drawn scabbard and hilt give way to the 3D sword v2 in its 3D scabbard, laid on the same line (the same gear
    as the walk, #4b). Above his shoulders the old hilt goes: on a cut-out it becomes transparent, on a full
    illustration (opaque) it is filled from the sky around it; lower down the old leather is the same brown as the new
    scabbard and stays as drawn. line/shield default to #4's (full-canvas pixels; shield = an overlay drawn on top)."""
    import cv2
    if line is None:
        b = _raw_box('quest_adult_back')
        line = tuple((x + b[0], y + b[1]) for x, y in _SCAB_LINE)
        sc0, sh0, _ = _gear_layers()
        sc = Image.new('RGBA', im.size); sc.alpha_composite(sc0, (b[0], b[1]))
        shield = Image.new('RGBA', im.size); shield.alpha_composite(sh0, (b[0], b[1]))
    else:
        sc = _sword_layer(im.size, line)
    a = np.asarray(im).copy()
    (px, py), (tx, ty) = line
    L = math.hypot(tx - px, ty - py); k = L / 941                      # 941 = #4's line: the radii below scale with it
    cov = np.asarray(sc)[..., 3] > 40
    if shield is not None:
        cov |= np.asarray(shield)[..., 3] > 200
    hsv = cv2.cvtColor(a[..., :3], cv2.COLOR_RGB2HSV).astype(int)
    Hh, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
    p0 = np.array([px, py - 20 * k]); p1 = np.array([tx, ty + 10 * k])
    d = p1 - p0; t = np.clip(((xx - p0[0]) * d[0] + (yy - p0[1]) * d[1]) / (d @ d), 0, 1)
    near = np.hypot(xx - (p0[0] + t * d[0]), yy - (p0[1] + t * d[1])) < 48 * k
    drawn = ((Hh >= 105) & (Hh <= 150) & (S > 40) & (V < 170)) | ((S < 40) & (V > 120) & (yy < py + 60 * k)) | (V < 60) | \
            ((Hh >= 5) & (Hh <= 22) & (S > 80) & (V > 40) & (V < 170))
    pom = np.hypot(xx - px, yy - py) < 62 * k                         # the old pommel and its outline
    m = ((near & drawn) | pom) & (a[..., 3] > 0) & ~cov & (yy < py + 200 * k)
    green = (Hh >= 35) & (Hh <= 85) & (S > 60) & (V > 60)              # the cap and its ink outline: keep them
    cap_edge = (cv2.dilate(green.astype(np.uint8), np.ones((11, 11), np.uint8)) > 0) & (V < 80)
    m &= ~green & ~cap_edge
    if opaque:
        m |= (np.hypot(xx - px, yy - py) < 80 * k) & ~cov & ~green & ~cap_edge     # the whole old pommel and its ink ring
        wide = np.hypot(xx - (p0[0] + t * d[0]), yy - (p0[1] + t * d[1])) < 70 * k   # the old grip was wider here
        m |= wide & (yy < py + 200 * k) & ((V < 110) | ((Hh >= 105) & (Hh <= 150)))  # every dark/violet old pixel by the line
        capzone = cv2.dilate(green.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
        m &= ~capzone
        sc_a = np.asarray(sc)[..., 3]
        kk = int(44 * k) | 1                                            # wide enough that the feather lies in clean sky
        hole = (cv2.dilate(m.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kk, kk))) > 0) & ~capzone & (sc_a < 250)
        core = (cv2.dilate(m.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0) & ~capzone
        # fill from the sky only: a normalised blur that ignores the hole, the new sword, the cap and any dark ink
        greenish = (Hh >= 25) & (Hh <= 95) & (S > 35)
        near_cap = cv2.dilate(capzone.astype(np.uint8), np.ones((25, 25), np.uint8)) > 0   # the cap's dark rim and shadow
        src_ok = ~(hole | (sc_a > 0) | near_cap | greenish | (V < 110) | wide)
        sig = 18 * k + 6
        wgt = cv2.GaussianBlur(src_ok.astype(np.float32), (0, 0), sig)
        acc = cv2.GaussianBlur(a[..., :3].astype(np.float32) * src_ok[..., None], (0, 0), sig)
        fill = acc / np.maximum(wgt[..., None], 1e-4)
        w2 = cv2.GaussianBlur(src_ok.astype(np.float32), (0, 0), sig * 4)      # where no sky is close, reach further
        f2 = cv2.GaussianBlur(a[..., :3].astype(np.float32) * src_ok[..., None], (0, 0), sig * 4) / np.maximum(w2[..., None], 1e-4)
        blend = np.clip(wgt / .25, 0, 1)[..., None]
        fill = fill * blend + f2 * (1 - blend)
        # feather the patch into the sky, so no soft disc shows
        inside = cv2.distanceTransform((hole | capzone).astype(np.uint8), cv2.DIST_L2, 5)   # feather only towards the sky
        f = np.clip(inside / (14 * k + 4), 0, 1)
        f = np.maximum(f, core.astype(np.float32))[..., None]          # the old hilt itself is always fully replaced
        mm = hole
        out_rgb = a[..., :3].astype(np.float32) * (1 - f) + fill * f
        a[mm, :3] = np.clip(out_rgb[mm], 0, 255).astype(np.uint8)
    else:
        a[m, 3] = 0
    out = Image.fromarray(a, 'RGBA')
    out.alpha_composite(sc)
    return out


@lru_cache(maxsize=256)
def final(key, flip=False, sway=0.0):
    """Final character art, cropped to its alpha, with its engine overlays; flip=True mirrors it. sway (degrees) turns
    the 3D shield about its strap point (walks, the horse's trot); the crop box stays the one at rest, so a swaying
    sequence never jitters."""
    im = Image.open(ROOT / ART[key]).convert('RGBA')
    if key == 'quest_adult_back':
        im = _sword_swap(im)
    elif key in SWORD_LINES:
        sh = Image.open(ROOT / f'public/art/ep002/props3d/shield_on_{ART_SHIELD[key]}.png').convert('RGBA')
        im = _sword_swap(im, SWORD_LINES[key], sh)
    if key in ART_SHIELD:
        name = ART_SHIELD[key]
        ov = Image.open(ROOT / f'public/art/ep002/props3d/shield_on_{name}.png').convert('RGBA')
        if sway:
            piv = json.loads((ROOT / f'tools/props3d/shield_on_{name}.json').read_text())['pivot']
            ov = ov.rotate(sway, resample=Image.BICUBIC, center=tuple(piv))
        im.alpha_composite(ov)
        if sway:
            box = final(key, flip=False).info['box']
            im = im.crop(box)
            return im.transpose(Image.FLIP_LEFT_RIGHT) if flip != (key in ART_FLIP) else im
    # the generator leaves a faint dark haze (alpha 1-24) over the whole canvas: dropped at load, the file is untouched
    im.putalpha(im.getchannel('A').point(lambda v: 0 if v < 24 else v))
    box = im.getchannel('A').getbbox()
    im = im.crop(box)
    im.info['box'] = box
    if flip != (key in ART_FLIP):
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    return im


SHIELD_SWAY = 2.0     # degrees, the strap's swing per step
# one walking pace for every Quest, young and adult (Producer, 2026-10-06: the walks looked rushed at 2.9 steps/s):
# a step per bob of |sin(STEP_RATE * t)|, i.e. STEP_RATE / pi = 1.85 steps/s, a calm walk
STEP_RATE = 5.8


def step(im, phase, lift=.075, knee=.66):
    """Walk for a figure seen from behind that has one standing pose (adult Quest #4, the hoodie walk): the foot on
    one side lifts while the other carries the weight, then they swap. phase in [0, 1): 0-.5 the left foot, .5-1 the
    right; the lift is a smooth arc. The leg below the knee line is drawn up (the foot rises, the shin shortens), as an
    animatic would draw a step; the image itself is untouched."""
    a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]
    side = 0 if phase % 1 < .5 else 1
    amt = math.sin(math.pi * ((phase % .5) / .5)) * lift * h
    if amt < .5:
        return im
    yk = int(h * knee)
    ys = np.arange(h, dtype=np.float32)[:, None]
    xs = np.arange(w, dtype=np.float32)[None, :]
    cx = w / 2
    sel = 1 / (1 + np.exp(((xs - cx) if side == 0 else (cx - xs)) / (w * .02)))          # the stepping half, soft seam
    d = np.clip((ys - yk) / max(1, h - yk), 0, 1) * amt * sel
    import cv2
    mapx = np.repeat(xs, h, 0); mapy = (ys + d).astype(np.float32)
    out = cv2.remap(a, mapx.astype(np.float32), mapy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA')


# Adult Quest's back gear for #4b (and its mirror): the 3D shield as fitted on #4 and the 3D sword v2 in its 3D scabbard,
# laid along #4's scabbard line, moved by the offset between the two figures' collar points (both arts are drawn at the
# same scale). Measured on the cropped arts: collar #4 (410, 400), #4b (414, 400); #4's scabbard line from the pommel
# (704, 270) to the tip (430, 1170).
_COLLAR = {'quest_adult_back': (410, 400), 'quest_adult_walk': (414, 400)}
_SCAB_LINE = ((704, 270), (430, 1170))


@lru_cache(maxsize=1)
def _gear_layers():
    """(scabbard layer, shield layer, shield pivot) in #4's cropped coordinates, on a canvas with a margin."""
    import cv2
    b4 = _raw_box('quest_adult_back')
    sh = np.asarray(Image.open(ROOT / 'public/art/ep002/props3d/shield_only_04_adult_back.png').convert('RGBA'))
    sh = sh[b4[1]:b4[3], b4[0]:b4[2]]
    sw = np.asarray(Image.open(ROOT / 'public/art/ep002/props3d/back_sword.png').convert('RGBA'))
    src = np.float32([[sw.shape[1] / 2, 0], [sw.shape[1] / 2, sw.shape[0]]])           # pommel top, chape tip
    M, _ = cv2.estimateAffinePartial2D(src, np.float32(_SCAB_LINE))
    sc = cv2.warpAffine(sw, M, (sh.shape[1], sh.shape[0]), flags=cv2.INTER_AREA, borderValue=(0, 0, 0, 0))
    piv = json.loads((ROOT / 'tools/props3d/shield_on_04_adult_back.json').read_text())['pivot']
    return Image.fromarray(sc, 'RGBA'), Image.fromarray(sh, 'RGBA'), (piv[0] - b4[0], piv[1] - b4[1])


@lru_cache(maxsize=64)
def adult_walk_frame(mirror=False, sway=0.0, gear=True):
    """#4b (mirror=False) or #4b mirrored (the other step), with the gear always on the same side: scabbard and hilt
    over his right shoulder, the shield on top (sway in degrees about its strap point). gear=False: #4b bare (block N,
    right after he pulls the sword)."""
    base = final('quest_adult_walk', flip=mirror)
    if not gear:
        return base
    sc, sh, piv = _gear_layers()
    cx = base.width - _COLLAR['quest_adult_walk'][0] if mirror else _COLLAR['quest_adult_walk'][0]
    dx, dy = cx - _COLLAR['quest_adult_back'][0], _COLLAR['quest_adult_walk'][1] - _COLLAR['quest_adult_back'][1]
    pad = 60
    W_, H_ = max(base.width, sc.width) + 2 * pad, max(base.height, sc.height) + 2 * pad
    out = Image.new('RGBA', (W_, H_))
    out.alpha_composite(base, (pad, pad))
    out.alpha_composite(sc, (pad + dx, pad + dy))
    shl = sh.rotate(sway, resample=Image.BICUBIC, center=piv) if sway else sh
    out.alpha_composite(shl, (pad + dx, pad + dy))
    return out.crop(out.getchannel('A').getbbox())


def walk_adult(t, rate=STEP_RATE, phase=0.0):
    """Adult Quest walking (#4b): the drawn stride and its mirror alternate, one step per bob of 5*|sin(rate*t +
    phase)|; the 3D gear stays on his right shoulder and the shield swings with the steps."""
    ph = ((rate * t + phase) / math.pi) % 2 / 2                        # one full cycle = two bobs = two steps
    sway = round(SHIELD_SWAY * math.sin(math.pi * 2 * ph) * 4) / 4
    return adult_walk_frame(mirror=ph >= .5, sway=sway)


# Hyrule Field's road (final plate #11): its centre line, measured on the plate (x, feet y as plate fractions), from the
# bottom edge to the start of its bend. The fence posts put the ground's vanishing line at y .68 (Producer, 2026-10-06:
# Quest walks along the road, not straight up it, and at a calm pace).
FIELD_ROAD = [(.500, .970), (.511, .905), (.521, .845), (.529, .785), (.533, .750), (.536, .730)]
FIELD_ROAD_VY = .68


# a slower walk for the long walking scenes (G-H, R: Producer, 2026-10-06: "más despacio, lo suficiente para que se
# vean en movimiento durante esas escenas"): 1.4 steps/s, 0.35 m/s, so they cross the road through the whole scene
SLOW_RATE = 4.4
SLOW_STRIDE = .35 * math.pi / SLOW_RATE


def road_walk(t, h0, y0=.97, height_m=1.8, stride_m=.7, rate=None):
    """Feet (x, y) and height (plate fractions) of Quest walking down the field road, t seconds after he sets off from
    feet y0 with height h0. His size follows the plate's perspective and he covers stride_m a step at STEP_RATE, so his
    feet never slide; he eases into the walk over the first step."""
    ramp = .6
    dist = stride_m * (rate or STEP_RATE) / math.pi * (t * t / (2 * ramp) if t < ramp else t - ramp / 2)
    z0 = height_m * 1.07 / h0                                          # metres from the camera (focal 1.07 frame heights)
    h = height_m * 1.07 / (z0 + dist)
    y = FIELD_ROAD_VY + (y0 - FIELD_ROAD_VY) * h / h0
    x = float(np.interp(y, [q[1] for q in FIELD_ROAD][::-1], [q[0] for q in FIELD_ROAD][::-1]))
    return x, y, h


def plate_to_screen(x, y, h, box):
    """A figure placed on a plate (feet x, y and height as plate fractions) seen through a camera box: its screen feet
    and height in pixels."""
    sx, sy = to_screen(x, y, box)
    return sx, sy, h * PH * H / (box[3] - box[1])


def breeze(im, t, cloth=(.45, .62), amp=.012, hair=None, hair_amp=.018, speed=2.2):
    """A light breeze: the cloth between cloth=(y0, y1) (fractions of the height: a tunic's skirt, not the legs below
    it) ripples sideways, more towards its hem; hair = (x0, x1, y0, y1) fractions of a hanging ponytail or cap tip,
    which sways more towards its end. Small and slow, an animatic touch; the image itself is untouched."""
    import cv2
    a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]
    ys = np.arange(h, dtype=np.float32)[:, None]; xs = np.arange(w, dtype=np.float32)[None, :]
    y0, y1 = cloth
    k = np.clip((ys / h - y0) / (y1 - y0), 0, 1) ** 1.5 * (ys / h <= y1 + .015)
    dx = np.repeat(k * amp * w * np.sin(speed * t + ys / h * 9), w, 1)
    if hair:
        hx0, hx1, hy0, hy1 = hair
        wy = np.clip((ys / h - hy0) / max(1e-3, hy1 - hy0), 0, 1) * (ys / h <= hy1 + .03)
        wx = np.clip(np.minimum(xs / w - hx0, hx1 - xs / w) / .03, 0, 1)
        dx = dx + (wy * wx) * hair_amp * w * np.sin(speed * 1.3 * t + 1.1)
    out = cv2.remap(a, (np.repeat(xs, h, 0) - dx).astype(np.float32), np.repeat(ys, w, 1).astype(np.float32), cv2.INTER_LINEAR,
                    borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA')


@lru_cache(maxsize=16)
def final_plate(key, size=(PW, PH)):
    """Final background at the working plate size (16:9 plates are 2688x1520: a uniform resize), with its overlays."""
    im = Image.open(ROOT / PLATES[key]).convert('RGBA')
    if key in SWORD_LINES:
        im = _sword_swap(im, SWORD_LINES[key], Image.open(ROOT / PLATE_OVERLAYS[key]).convert('RGBA'), opaque=True)
    if key in PLATE_OVERLAYS:
        im.alpha_composite(Image.open(ROOT / PLATE_OVERLAYS[key]).convert('RGBA'))
    return im.convert('RGB').resize(size, Image.LANCZOS)


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


def plate_field(time='dawn', label=True, castle=True):
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
    if castle is True:
        for k, (w_, h_) in enumerate([(70, 70), (30, 120), (30, 90)]):                                # tiny castle (block placeholder)
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
    if castle == '3d':                                                                                 # own 3D Hyrule Castle (free)
        c = Image.open(ROOT / 'public/art/ep002/props3d/castle_far.png').convert('RGBA')
        cw = int(PW * .2); c = c.resize((cw, int(c.height * cw / c.width)), Image.LANCZOS)
        a = np.asarray(c).astype(np.float32); a[..., :3] = a[..., :3] * .78 + np.array(bot, np.float32) * .22   # distance haze
        c = Image.fromarray(a.astype(np.uint8), 'RGBA')
        base = img.convert('RGBA'); base.alpha_composite(c, (int(cx - cw / 2), int(hz + 14 - c.height))); img = base.convert('RGB')
        d = ImageDraw.Draw(img)
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
    if kind == 'final':
        return final_plate(spec[1])
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
    if 'im' in spec:              # a frame already built (e.g. walk_adult(t))
        im = spec['im']
    elif 'art' in spec:
        im = final(spec['art'])
    elif 'img' in spec:
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
_SUB_FONTS = {}


def _sub_font(size):
    if size not in _SUB_FONTS:
        _SUB_FONTS[size] = ImageFont.truetype(str(ROOT / 'public/shared/fonts/Inter-800.woff2'), size)
    return _SUB_FONTS[size]


def _chunks(words):
    """Short phrases like the EP001 Short captions: break on punctuation, pauses, or every ~4 words."""
    out, cur = [], []
    for i, w in enumerate(words):
        if cur and (len(cur) >= 4 or (len(cur) >= 2 and cur[-1]['w'][-1] in ',.?!:;') or w['start'] - cur[-1]['end'] > .35):
            out.append(cur); cur = []
        cur.append(w)
    if cur:
        out.append(cur)
    return out


# Review-subtitle language: SUB_LANG=es renders the Spanish track (docs/publish/EP002/script_es.json) on Bram's timing
import os as _os
SUB_LANG = _os.environ.get('SUB_LANG', 'en')
_ES = json.loads((ROOT / 'docs/publish/EP002/script_es.json').read_text())['lines'] if SUB_LANG == 'es' else {}


# On-screen graphics in Spanish (SUB_LANG=es): every string drawn with PIL is looked up in
# docs/publish/EP002/graphics_es.json; measurements (textlength / textbbox) use the Spanish text too, so boxes and
# bubbles fit it. A string being typed out letter by letter is a prefix of a known one: the same share of the Spanish is
# shown. Subtitles bypass this (they are already Spanish), and the planning tags along the top stay as they are.
_GFX_ES = {}
_TR_OFF = [False]
if SUB_LANG == 'es':
    _gp = ROOT / 'docs/publish/EP002/graphics_es.json'
    _GFX_ES = json.loads(_gp.read_text())['strings'] if _gp.exists() else {}
    _GFX_KEYS = sorted(_GFX_ES, key=len)

    def _tr(txt):
        if _TR_OFF[0] or not isinstance(txt, str) or not txt.strip() or txt.startswith('SEQ '):
            return txt
        if txt in _GFX_ES:
            return _GFX_ES[txt]
        if len(txt.strip()) >= 2:
            for k in _GFX_KEYS:                                   # typed out: a prefix of a known string
                if len(k) > len(txt) and k.startswith(txt):
                    es = _GFX_ES[k]
                    return es[:max(1, round(len(es) * len(txt) / len(k)))]
        return txt

    _o_text, _o_len, _o_bbox = ImageDraw.ImageDraw.text, ImageDraw.ImageDraw.textlength, ImageDraw.ImageDraw.textbbox
    ImageDraw.ImageDraw.text = lambda self, xy, text, *a, **k: _o_text(self, xy, _tr(text), *a, **k)
    ImageDraw.ImageDraw.textlength = lambda self, text, *a, **k: _o_len(self, _tr(text), *a, **k)
    ImageDraw.ImageDraw.textbbox = lambda self, xy, text, *a, **k: _o_bbox(self, xy, _tr(text), *a, **k)


def _cue_words(key, c):
    """The words shown for a cue: Bram's own, or the Spanish line spread over his word timings (each Spanish word takes
    the time of the English word at the same relative position, so phrases follow the voice's rhythm and pauses)."""
    if SUB_LANG != 'es' or key not in _ES:
        return c['words']
    en, es = c['words'], _ES[key].split()
    out = []
    for i, w in enumerate(es):
        j0 = min(len(en) - 1, int(i * len(en) / len(es)))
        j1 = min(len(en) - 1, max(j0, int((i + 1) * len(en) / len(es)) - 1))
        out.append({'w': w, 'start': en[j0]['start'], 'end': en[j1]['end']})
    return out


SUBS = _os.environ.get('SUBS') == '1'                              # burned-in subtitles only on request (SUBS=1)


def subtitle(d, t, t_end=None, lift=0, size=44):
    """Review subtitles in the EP001 Shorts caption style (Inter heavy, white, ink outline 13% + ink drop 7%, short
    phrases that pop in). Planning/review only: final renders carry no burned-in subtitles (Producer)."""
    if not SUBS:                                                     # Producer, 2026-10-06: no subtitles, English or Spanish
        return
    kc = next(((k, c) for k, c in CUES.items() if c['start'] - 0.1 <= t <= c['end'] + 0.25 and (t_end is None or c['start'] < t_end)), None)
    if not kc:
        return
    key, c = kc
    words = [w for w in _cue_words(key, c) if t_end is None or w['start'] < t_end]
    ch = _chunks(words)
    cur = None
    for i, k in enumerate(ch):
        nxt = ch[i + 1][0]['start'] if i + 1 < len(ch) else c['end'] + 0.25
        if k[0]['start'] - 0.05 <= t < nxt:
            cur = k
    if cur is None:
        return
    _TR_OFF[0] = True                                                # already in the subtitle language
    try:
        _draw_sub(d, t, cur, lift, size)
    finally:
        _TR_OFF[0] = False


def _draw_sub(d, t, cur, lift, size):
    pop = min(1, max(0, (t - cur[0]['start'] + .05) / .12))
    f = _sub_font(int(size * (0.86 + 0.14 * ease(pop))))
    text, lines, ln = ' '.join(w['w'] for w in cur), [], ''
    for w_ in text.split():
        if d.textlength(ln + ' ' + w_, font=f) > W * .62 and ln:
            lines.append(ln); ln = w_
        else:
            ln = (ln + ' ' + w_).strip()
    lines.append(ln)
    lh = int(f.size * 1.12)
    y = H * .8 - lift - lh * len(lines) / 2
    ink, sw, drop = (22, 22, 31), max(2, round(f.size * .13)), max(1, round(f.size * .07))
    for l_ in lines:
        tw = d.textlength(l_, font=f); x = (W - tw) / 2
        d.text((x, y + drop), l_, font=f, fill=ink, stroke_width=sw, stroke_fill=ink)
        d.text((x, y), l_, font=f, fill='white', stroke_width=sw, stroke_fill=ink)
        y += lh


def tag(d, text):
    _TR_OFF[0] = True                                               # planning tags stay as they are
    try:
        d.rectangle((0, 0, d.textlength(text, font=FTAG) + 22, 28), fill=(0, 0, 0))
        d.text((11, 5), text, font=FTAG, fill=(255, 210, 90))
    finally:
        _TR_OFF[0] = False
