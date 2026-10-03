#!/usr/bin/env python3
"""EP002 cartridge sequence animatic (planning only, never enters the video or the art library).

  python3 scripts/ep002-cartridge-animatic.py

Sequence 01 (l01-l02), timed to the real Bram narration and its word timings:
  S1  l01        present-day living room (core.bg.living_room_night_gaming), slow push toward the TV.
                 N64 on the rug in front of the TV stand (overlay prop, the background is never edited);
                 Quest holds the cartridge.
  S2  l02        insert: the cartridge (mock v4, gold label v2) slides into the N64 slot; "clic" lands on "back".
  S3  "back" ->  new framing on the TV: the screen flares and a fairy glow leaves it (programmatic placeholder).
Art that does not exist yet is drawn as MISSING boxes with the asset key it needs.
Output: docs/ep002/EP002_cartridge_animatic_v1.mp4 (1280x720, 24 fps).
"""
import json, math, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS = 1280, 720, 24
F = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', s)
FSUB, FTAG, FBOX, FCLIC = F(30), F(17), F(22), F(64)
PW, PH = 2560, 1440  # plate working size; boxes below are in 960x540 plate units, scaled by S
S = PW / 960

tm = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())
cues = tm['cues']
word = lambda lid, w: next(x for x in cues[lid]['words'] if x['w'].strip('.,').lower() == w)
T_S2 = cues['l02']['start'] - 0.17          # cut to the insert just before "Almost"
T_CLIC = word('l02', 'back')['start']       # the cartridge seats on "back"
T_END = cues['l03']['start'] - 0.05         # sequence 02 starts on l03

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
missing(d, N64_BOX, 'prop.n64_console', 'NEW_ART · overlay prop')
missing(d, QUEST_BOX, 'quest.default.', 'holding_cartridge · NEW_ART')
d.text((QUEST_BOX[0] * S + 12, QUEST_BOX[1] * S + 14 + 28 * S), '(Quest-v1-6ref)', font=F(int(6 * S)), fill=(255, 200, 200))
ov.alpha_composite(cartridge(int(46 * S)), (int(560 * S), int(285 * S)))   # the cartridge in his hands
plate_room = Image.alpha_composite(plate, ov).convert('RGB')
TV = (805, 30, 925, 245)            # screen area in plate units (for the glow)

# ---- S2 insert: dim, blurred room behind a large N64 top with the slot
ins_bg = plate.crop((int(560 * S), int(250 * S), int(860 * S), int(419 * S))).resize((W, H)).filter(ImageFilter.GaussianBlur(14))
ins_bg = Image.blend(ins_bg.convert('RGB'), Image.new('RGB', (W, H), (8, 6, 12)), 0.55)
SLOT_Y = 470                        # top of the slot opening on screen
cart_big = cartridge(470)


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


def fairy(fr, cx, cy, t):
    """Placeholder fairy: an own design is NEW_ART (option C: evoke, never replicate)."""
    fr = glow(fr, cx, cy, 70, (170, 225, 255), 0.85)
    l = Image.new('RGBA', fr.size); ld = ImageDraw.Draw(l)
    flap = 0.6 + 0.4 * math.sin(t * 40)
    for x0, x1 in ((cx - 30, cx - 3), (cx + 3, cx + 30)):
        ld.ellipse((x0, cy - 4 - 26 * flap, x1, cy - 2), fill=(230, 245, 255, 120))
        ld.ellipse((x0 + 8, cy + 2, x1 - 8, cy + 4 + 14 * flap), fill=(230, 245, 255, 90))
    ld.ellipse((cx - 9, cy - 9, cx + 9, cy + 9), fill=(255, 255, 255, 255))
    return Image.alpha_composite(fr.convert('RGBA'), l).convert('RGB')


def subtitle(d, t):
    c = next((c for c in cues.values() if c['start'] - 0.1 <= t <= c['end'] + 0.25 and c['start'] < T_END), None)
    if not c:
        return
    tw = d.textlength(c['text'], font=FSUB)
    d.text(((W - tw) / 2, H - 70), c['text'], font=FSUB, fill='white', stroke_width=3, stroke_fill='black')


def tag(d, text):
    d.rectangle((0, 0, d.textlength(text, font=FTAG) + 24, 30), fill=(0, 0, 0))
    d.text((12, 6), text, font=FTAG, fill=(255, 210, 90))


S1_CAM = ((1.00, .50, .50), (1.30, .66, .56), 0.0, T_S2)          # l01: push toward Quest + console
S3_CAM = ((1.90, .86, .30), (2.05, .86, .32), T_CLIC, T_END)      # new shot: the TV, slow breath in


def render(t):
    if t < T_S2:
        fr, _ = frame_room(t, S1_CAM)
        d = ImageDraw.Draw(fr)
        tag(d, 'SEQ 01 PHYSICAL MEMORY · S1 room (living_room_night_gaming) · CARTRIDGE ANIMATIC v1 · PLANNING ONLY')
    elif t < T_CLIC + 0.0:
        fr = ins_bg.copy()
        d = ImageDraw.Draw(fr)
        # N64 top (MISSING art): a dark console body with the cartridge slot
        d.rounded_rectangle((170, SLOT_Y - 10, 1110, H + 40), 40, fill=(52, 52, 58), outline=(255, 70, 70), width=4)
        d.rectangle((395, SLOT_Y - 4, 885, SLOT_Y + 26), fill=(14, 14, 16))
        d.text((190, H - 135), 'MISSING  prop.n64_console (top, slot)', font=FBOX, fill=(255, 120, 120))
        # cartridge: hover in Quest's hands, then a straight slide into the slot, seated on "back"
        start_slide = T_CLIC - 1.05
        k = ease((t - start_slide) / (T_CLIC - start_slide)) if t >= start_slide else 0
        hover = 6 * math.sin(t * 3.1) * (1 - k)
        top = lin(70, SLOT_Y - 120, k) + hover   # at the end ~120 px of the cartridge still shows
        cx = 640 - cart_big.width // 2
        clip = max(0, int(SLOT_Y + 8 - top))     # hide the part already inside the console
        part = cart_big.crop((0, 0, cart_big.width, min(cart_big.height, clip)))
        fr.paste(part, (cx, int(top)), part)
        d.text((20, 40), 'S2 insert · cartridge = mock v4 + label v2 (official logo on cartridge: Producer decision)', font=FTAG, fill=(255, 220, 160))
        tag(d, 'SEQ 01 PHYSICAL MEMORY · S2 insert · CARTRIDGE ANIMATIC v1 · PLANNING ONLY')
    else:
        fr, box = frame_room(t, S3_CAM)
        k = (t - T_CLIC) / (T_END - T_CLIC)
        tx, ty = to_screen((TV[0] + TV[2]) / 2, (TV[1] + TV[3]) / 2, box)
        fr = glow(fr, tx, ty, 420, (200, 235, 255), 0.55 * math.sin(math.pi * min(1, k * 1.4)))
        if k > 0.25:
            j = ease((k - 0.25) / 0.75)
            fr = fairy(fr, lin(tx, tx - 430, j), lin(ty, ty + 90, j) - 40 * math.sin(math.pi * j), t)
        d = ImageDraw.Draw(fr)
        d.text((20, 40), 'S3 new framing on the TV · fairy = programmatic glow (own fairy design: NEW_ART)', font=FTAG, fill=(255, 220, 160))
        tag(d, 'SEQ 01 PHYSICAL MEMORY · S3 TV flare · CARTRIDGE ANIMATIC v1 · PLANNING ONLY')
    d = ImageDraw.Draw(fr)
    if 0 <= t - T_CLIC < 0.45:     # "clic" on the word "back" (SFX cue), with a 2-frame flash
        a = t - T_CLIC
        if a < 2 / FPS:
            fr = Image.blend(fr, Image.new('RGB', fr.size, 'white'), 0.35); d = ImageDraw.Draw(fr)
        d.text((W / 2 - 90, 250), 'CLIC', font=FCLIC, fill=(255, 235, 140), stroke_width=4, stroke_fill='black')
        d.text((W / 2 - 92, 325), 'SFX: cartridge seat', font=FTAG, fill=(255, 235, 140), stroke_width=2, stroke_fill='black')
    subtitle(d, t)
    return fr


def main():
    out = ROOT / 'docs/ep002/EP002_cartridge_animatic_v1.mp4'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', str(ROOT / 'public/episodes/ep002/audio/narration.wav'), '-t', f'{T_END:.3f}',
                          '-af', f'afade=t=out:st={T_END - 0.25:.3f}:d=0.25',
                          '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                          '-c:a', 'aac', '-b:a', '128k', str(out)], stdin=subprocess.PIPE)
    for n in range(int(T_END * FPS)):
        p.stdin.write(render(n / FPS).tobytes())
    p.stdin.close(); p.wait()
    for name, t in (('s1', 1.5), ('s2', T_CLIC - 0.5), ('s3', T_END - 0.3)):
        render(t).save(ROOT / f'docs/ep002/cartridge_animatic_{name}.jpg', quality=85)
    print(f'{out.relative_to(ROOT)}  {T_END:.2f}s  (S2 {T_S2:.2f}s, clic {T_CLIC:.2f}s)')


if __name__ == '__main__':
    main()
