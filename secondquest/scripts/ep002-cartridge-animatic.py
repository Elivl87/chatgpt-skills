#!/usr/bin/env python3
"""EP002 cartridge sequence animatic (planning only, never enters the video or the art library).

  python3 scripts/ep002-cartridge-animatic.py

Sequence 01 (l01-l02), timed to the real Bram narration and its word timings:
  S1  l01        present-day living room (core.bg.living_room_night_gaming), slow push toward the TV.
                 The N64 (procedural 3D prop, tools/props3d, "classic" look approved by the Producer) sits on the
                 rug facing the sofa; Quest holds the cartridge.
  S2  l02        insert rendered in 3D: the cartridge (mock v4, gold label v2) comes down into the slot, the
                 dust flaps fold in, and it seats on "back" (cart_click), with a short shake.
  S3  "back" ->  new framing on the TV: the screen flares (tv_on) and the fairy (engine actor, src/fx/fairy.ts,
                 Python twin tools/fx/fairy.py) flies out of it (fairy_shimmer + fairy_flutter).
The N64 controller (tools/props3d, n64_pad) lies on the rug, cabled to the console.
Sounds: engine synths from shared/sfx.json, mixed under the narration. Quest is still a MISSING box.
Output: docs/ep002/EP002_cartridge_animatic_v3.mp4 (1280x720, 24 fps): the fairy's flight continues over "New graphics."
(l03) and leaves the frame. v1/v2 are kept for comparison.
"""
import json, math, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import imageio_ffmpeg
import sys

ROOT_ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_ / 'tools/fx'))
import fairy as fairy_fx  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS = 1280, 720, 24
F = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', s)
FSUB, FTAG = F(30), F(17)
PW, PH = 2560, 1440  # plate working size; boxes below are in 960x540 plate units, scaled by S
S = PW / 960

tm = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())
cues = tm['cues']
word = lambda lid, w: next(x for x in cues[lid]['words'] if x['w'].strip('.,').lower() == w)
T_S2 = cues['l02']['start'] - 0.17          # cut to the insert just before "Almost"
T_CLIC = word('l02', 'back')['start']       # the cartridge seats on "back"
T_SEQ2 = cues['l03']['start'] - 0.05        # sequence 02's line (l03) starts here
T_END = word('l03', 'graphics')['end'] + 0.3  # the fairy keeps flying over "New graphics." and leaves the frame

ease = lambda k: 0.5 - 0.5 * math.cos(math.pi * min(1, max(0, k)))
lin = lambda a, b, k: a + (b - a) * k


def missing(d, box, key, note=''):
    x0, y0, x1, y1 = [v * S for v in box]
    d.rectangle((x0, y0, x1, y1), outline=(255, 70, 70), width=6, fill=(40, 10, 10, 150))
    d.line((x0, y0, x1, y1), fill=(255, 70, 70, 120), width=3)
    d.line((x0, y1, x1, y0), fill=(255, 70, 70, 120), width=3)
    f = F(int(10 * S))
    d.text((x0 + 12, y0 + 10), 'MISSING', font=f, fill=(255, 90, 90))
    d.text((x0 + 12, y0 + 12 + 11 * S), key, font=F(int(7 * S)), fill=(255, 220, 220))
    if note:
        d.text((x0 + 12, y0 + 14 + 20 * S), note, font=F(int(6 * S)), fill=(255, 200, 200))


def cartridge(width):
    c = Image.open(ROOT / 'docs/ep002/source/cartridge_mock_front.png').convert('RGBA')
    return c.resize((width, round(c.height * width / c.width)), Image.LANCZOS)


# ---- S1 / S3 plate: background + overlay placeholders, drawn once in plate space
plate = Image.open(ROOT / 'public/art/core/backgrounds/living_room_night_gaming.png').convert('RGBA').resize((PW, PH), Image.LANCZOS)
ov = Image.new('RGBA', plate.size)
d = ImageDraw.Draw(ov)
N64_BOX = (628, 318, 770, 392)      # on the rug, in front of the TV stand, cables run to the TV
QUEST_BOX = (455, 150, 600, 470)    # standing on the rug between the sofa and the console
PROPS = ROOT / 'public/art/ep002/props3d'
n64 = Image.open(PROPS / 'n64_room_3q.png').convert('RGBA')
n64_w = int(112 * S)                # ~26 cm console: bigger than the ~16 cm controllers beside it
n64 = n64.resize((n64_w, round(n64.height * n64_w / n64.width)), Image.LANCZOS)
n64_x, n64_y = int(640 * S), int(392 * S) - n64.height   # feet on the rug, in front of the stand
sh = Image.new('RGBA', plate.size)
ImageDraw.Draw(sh).ellipse((n64_x + 4 * S, n64_y + n64.height - 9 * S, n64_x + n64_w - 2 * S, n64_y + n64.height + 5 * S), fill=(20, 12, 8, 150))
ov.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6 * S)))
ov.alpha_composite(n64, (n64_x, n64_y))
# the N64 controller on the rug, cable running to the console's front port (procedural 3D prop)
pad = Image.open(PROPS / 'n64_pad_room.png').convert('RGBA')
pad_w = int(74 * S)                 # 19 cm controller, a bit smaller than the console
pad = pad.resize((pad_w, round(pad.height * pad_w / pad.width)), Image.LANCZOS)
pad_x, pad_y = int(584 * S), int(452 * S) - pad.height
cab = ImageDraw.Draw(ov)
p0 = (pad_x + pad_w * 0.45, pad_y + pad.height * 0.04)                  # cable leaves the back edge
p3 = (n64_x + n64_w * 0.10, n64_y + n64.height * 0.53)                  # first port, front face
c1, c2 = (p0[0] - 4 * S, p0[1] - 16 * S), (p3[0] - 26 * S, p3[1] + 8 * S)   # a loose loop over the rug
bez = [tuple((1 - u) ** 3 * a_ + 3 * (1 - u) ** 2 * u * b_ + 3 * (1 - u) * u * u * c_ + u ** 3 * d_ for a_, b_, c_, d_ in zip(p0, c1, c2, p3))
       for u in [i / 40 for i in range(41)]]
cab.line(bez, fill=(28, 22, 22, 255), width=int(3.2 * S), joint='curve')
sh2 = Image.new('RGBA', plate.size)
ImageDraw.Draw(sh2).ellipse((pad_x + 4 * S, pad_y + pad.height - 7 * S, pad_x + pad_w - 4 * S, pad_y + pad.height + 3 * S), fill=(20, 12, 8, 120))
ov.alpha_composite(sh2.filter(ImageFilter.GaussianBlur(5 * S)))
ov.alpha_composite(pad, (pad_x, pad_y))
missing(d, QUEST_BOX, 'quest.default.', 'holding_cartridge · NEW_ART')
d.text((QUEST_BOX[0] * S + 12, QUEST_BOX[1] * S + 14 + 28 * S), '(Quest-v1-6ref)', font=F(int(6 * S)), fill=(255, 200, 200))
ov.alpha_composite(cartridge(int(46 * S)), (int(560 * S), int(285 * S)))   # the cartridge in his hands
plate_room = Image.alpha_composite(plate, ov).convert('RGB')
TV = (805, 30, 925, 245)            # screen area in plate units (for the glow)

# ---- S2 insert: blurred rug/room behind the 3D-rendered console + cartridge frames
ins_bg = plate.crop((int(600 * S), int(300 * S), int(840 * S), int(435 * S))).resize((W, H)).filter(ImageFilter.GaussianBlur(16))
ins_bg = Image.blend(ins_bg.convert('RGB'), Image.new('RGB', (W, H), (14, 10, 12)), 0.35)
INSERT = [Image.open(f).convert('RGBA') for f in sorted((PROPS / 'n64_insert').glob('f*.png'))]
SLIDE = 1.05                        # seconds of the slide; it ends exactly on "back"


def frame_room(t, cam):
    (z0, x0, y0), (z1, x1, y1), a, b = cam
    e = ease((t - a) / max(0.01, b - a))
    z = z0 * (z1 / z0) ** e; x = lin(x0, x1, e); y = lin(y0, y1, e)
    m_ = 0.5 / z; x = min(max(x, m_), 1 - m_); y = min(max(y, m_), 1 - m_)  # never past the image edge
    cw, ch = PW / z, PH / z
    box = (x * PW - cw / 2, y * PH - ch / 2, x * PW + cw / 2, y * PH + ch / 2)
    return plate_room.crop(box).resize((W, H), Image.BILINEAR), box


def to_screen(px, py, box):
    return (px * S - box[0]) * W / (box[2] - box[0]), (py * S - box[1]) * H / (box[3] - box[1])


def glow(fr, cx, cy, r, color, alpha):
    g = Image.new('RGBA', fr.size)
    gd = ImageDraw.Draw(g)
    for k in range(12, 0, -1):
        rr = r * k / 12
        gd.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=color + (int(alpha * (1 - k / 13) ** 1.6 * 255),))
    return Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(r / 6))).convert('RGB')


def subtitle(d, t):
    c = next((c for c in cues.values() if c['start'] - 0.1 <= t <= c['end'] + 0.25 and c['start'] < T_END), None)
    if not c:
        return
    text = ' '.join(w['w'] for w in c['words'] if w['start'] < T_END)   # only what is heard inside the clip
    tw = d.textlength(text, font=FSUB)
    d.text(((W - tw) / 2, H - 70), text, font=FSUB, fill='white', stroke_width=3, stroke_fill='black')


def tag(d, text):
    d.rectangle((0, 0, d.textlength(text, font=FTAG) + 24, 30), fill=(0, 0, 0))
    d.text((12, 6), text, font=FTAG, fill=(255, 210, 90))


S1_CAM = ((1.00, .50, .50), (1.30, .66, .56), 0.0, T_S2)          # l01: push toward Quest + console
S3_CAM = ((1.90, .86, .30), (2.05, .86, .32), T_CLIC, T_END)      # new shot: the TV, slow breath in


def render(t):
    shake = (0, 0)
    if 0 <= t - T_CLIC < 0.2:       # the seat: a short decaying shake
        a = 1 - (t - T_CLIC) / 0.2
        shake = (int(7 * a * math.sin(t * 90)), int(5 * a * math.cos(t * 77)))
    if t < T_S2:
        fr, _ = frame_room(t, S1_CAM)
        d = ImageDraw.Draw(fr)
        tag(d, 'SEQ 01 PHYSICAL MEMORY · S1 room + N64 (3D prop) · CARTRIDGE ANIMATIC v3 · PLANNING ONLY')
    elif t < T_CLIC:
        start_slide = T_CLIC - SLIDE
        k = min(1, max(0, (t - start_slide) / SLIDE))        # frames are already eased in 3D
        idx = round(k * (len(INSERT) - 1))
        hover = 0 if k > 0 else 7 * math.sin(t * 3.1)          # held in Quest's hands before the slide
        push = 1 + 0.06 * (t - T_S2) / (T_CLIC - T_S2)        # slow push-in across the insert
        fr = ins_bg.copy().convert('RGBA')
        im = INSERT[idx]
        im = im.resize((round(W * push), round(H * push)), Image.BILINEAR)
        fr.alpha_composite(im, (int((W - im.width) / 2), int((H - im.height) / 2 + hover)))
        fr = fr.convert('RGB')
        d = ImageDraw.Draw(fr)
        d.text((20, 40), 'S2 insert · 3D render: N64 classic + cartridge mock v4/label v2 · Quest hands: MISSING', font=FTAG, fill=(255, 220, 160))
        tag(d, 'SEQ 01 PHYSICAL MEMORY · S2 insert · CARTRIDGE ANIMATIC v3 · PLANNING ONLY')
    else:
        # hold the seated frame for the shake, then cut to the TV
        if t < T_CLIC + 0.2:
            fr = ins_bg.copy().convert('RGBA')
            im = INSERT[-1].resize((round(W * 1.06), round(H * 1.06)), Image.BILINEAR)
            fr.alpha_composite(im, (int((W - im.width) / 2), int((H - im.height) / 2)))
            fr = fr.convert('RGB')
            d = ImageDraw.Draw(fr)
            tag(d, 'SEQ 01 PHYSICAL MEMORY · S2 insert · CARTRIDGE ANIMATIC v3 · PLANNING ONLY')
        else:
            fr, box = frame_room(t, S3_CAM)
            k = (t - T_CLIC) / (T_SEQ2 - T_CLIC)
            tx, ty = to_screen((TV[0] + TV[2]) / 2, (TV[1] + TV[3]) / 2, box)
            fr = glow(fr, tx, ty, 420, (200, 235, 255), 0.55 * math.sin(math.pi * min(1, k * 1.4)))
            t0 = T_CLIC + 0.25 * (T_SEQ2 - T_CLIC)
            if t >= t0:
                tm_ = (t0 + T_SEQ2) / 2
                # out of the TV (approved v1 arc), then towards the camera, growing, and out of frame on the left
                keys = [(t0, tx / W, ty / H), (tm_, (tx - 215) / W, (ty + 5) / H), (T_SEQ2, (tx - 430) / W, (ty + 90) / H),
                        (T_SEQ2 + 0.45, 0.36, 0.56), (T_END - 0.05, -0.12, 0.6)]
                grow = min(1, max(0, (t - T_SEQ2) / (T_END - 0.2 - T_SEQ2)))
                fr = fairy_fx.draw(fr, keys, t, size=0.1 + 0.08 * grow * grow, opacity=min(1, (t - t0) / 0.15))
            d = ImageDraw.Draw(fr)
            d.text((20, 40), 'S3 new framing on the TV · fairy = engine actor (src/fx/fairy.ts)', font=FTAG, fill=(255, 220, 160))
            tag(d, 'SEQ 01 PHYSICAL MEMORY · S3 TV flare · CARTRIDGE ANIMATIC v3 · PLANNING ONLY')
    if shake != (0, 0):
        fr = Image.fromarray(__import__('numpy').roll(__import__('numpy').asarray(fr), shake, axis=(1, 0)))
    if 0 <= t - T_CLIC < 2 / FPS:   # 2-frame flash on the seat
        fr = Image.blend(fr, Image.new('RGB', fr.size, 'white'), 0.25)
    d = ImageDraw.Draw(fr)
    subtitle(d, t)
    return fr


SFX = json.loads((ROOT / 'shared/sfx.json').read_text())['sfx']


def sfx_events():
    return [('cart_slide', T_CLIC - SLIDE + 0.45, 1.0), ('cart_click', T_CLIC - 0.01, 1.0), ('tv_on', T_CLIC + 0.2, 0.9),
            ('fairy_shimmer', T_CLIC + 0.22, 1.0), ('fairy_flutter', T_CLIC + 0.3, 1.0), ('whoosh', T_END - 0.45, 0.9)]


def main():
    out = ROOT / 'docs/ep002/EP002_cartridge_animatic_v3.mp4'
    ev = sfx_events()
    ins, chains = [], []
    for k, (name, at_, gain) in enumerate(ev):
        ins += ['-i', str(ROOT / 'public' / SFX[name]['src'].lstrip('/'))]
        chains.append(f'[{k + 2}:a]volume={SFX[name]["volume"] * gain:.3f},adelay={int(at_ * 1000)}:all=1[s{k}]')
    mix = (';'.join(chains) + ';[1:a]atrim=0:' + f'{T_END:.3f}' + '[n];[n]' + ''.join(f'[s{k}]' for k in range(len(ev)))
           + f'amix=inputs={len(ev) + 1}:normalize=0:duration=first,afade=t=out:st={T_END - 0.25:.3f}:d=0.25[a]')
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', str(ROOT / 'public/episodes/ep002/audio/narration.wav'), *ins, '-t', f'{T_END:.3f}',
                          '-filter_complex', mix, '-map', '0:v', '-map', '[a]',
                          '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '128k', str(out)], stdin=subprocess.PIPE)
    for n in range(int(T_END * FPS)):
        p.stdin.write(render(n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in (('s1', 1.5), ('s2', T_CLIC - 0.5), ('s3', T_SEQ2 + 0.5)):
        render(t).save(ROOT / f'docs/ep002/cartridge_animatic_v3_{name}.jpg', quality=85)
    print(f'{out.relative_to(ROOT)}  {T_END:.2f}s  (S2 {T_S2:.2f}s, clic {T_CLIC:.2f}s)')


if __name__ == '__main__':
    main()
