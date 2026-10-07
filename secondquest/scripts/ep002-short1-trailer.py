#!/usr/bin/env python3
"""EP002 Short #1, the trailer (1080x1920, ~18 s), cut from the approved final video (2K v6). Planning/preview.

  python3 scripts/ep002-short1-trailer.py     # -> docs/publish/EP002/short1/EP002_short1_trailer_v<N>.mp4 + review sheet

Producer (2026-10-07), approved order: it opens on the hook itself ("But there is one thing Nintendo cannot rebuild
from the ground up. — You.", l07-l08), then the anchors (l03-l06: new graphics… the same ocarina, sword, Triforce),
and ends on the question ("So, why?", l10), then the card FULL EPISODE ON THE CHANNEL. Approved lines only, no new
words; the picture and Bram's voice come straight from the episode (the art is only cropped and scaled).
EP001 lesson (docs/publish/EP001/ANALYTICS_D5.md): 43 % swipe away at once, so the hook line is the first second.
Captions: the Shorts standard (PUBLISHING_STANDARD §10) burns them in (EP001 Short style). SUBS=0 renders without.
"""
import json, os, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC = ROOT / 'docs/ep002/EP002_animatic_full_v6_1440p.mp4'        # the approved final video (2560x1440, 24 fps)
OUT = ROOT / 'docs/publish/EP002/short1'
VERSION = 2
W, H, FPS = 1080, 1920, 24
SW, SH = 2560, 1440
CW = round(SH * W / H)                                             # 9:16 crop width in source px (810)
INK = (22, 22, 31)
YELLOW = (255, 214, 0)
SUBS = os.environ.get('SUBS', '1') != '0'
CUES = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())['cues']

# (episode start, episode end, crop centre x as a fraction of the frame): the approved order
SEGMENTS = [(17.30, 21.75, .50),     # l07-l08 on the field, Quest from behind: "…cannot rebuild… You."
            (7.75, 12.95, .53),      # l03 the room, the kid cheering at the TV: "New graphics. An orchestra…"
            (12.95, 17.30, .50),     # l04-l06 the ocarina, the sword, the Triforce (lock-on)
            (25.55, 27.05, .50)]     # l10 "So, why?" (audio; the picture is VIDEO_AT below)
VIDEO_AT = {3: 22.30}                 # l10's picture: the field walk just before the logo card (it does not fit 9:16)
CARD = 2.6                           # end card seconds
LINES = ['l07', 'l08', 'l03', 'l04', 'l05', 'l06', 'l10']


def font(size, w='800'):
    return ImageFont.truetype(str(ROOT / f'public/shared/fonts/Inter-{w}.woff2'), size)


def fredoka(size):
    f = ImageFont.truetype(str(ROOT / 'public/shared/fonts/Fredoka.ttf'), size); f.set_variation_by_name('Bold'); return f


def ease(k):
    k = min(1, max(0, k)); return k * k * (3 - 2 * k)


def timeline():
    """Short time -> (segment index, episode time)."""
    t, out = 0.0, []
    for i, (a, b, _) in enumerate(SEGMENTS):
        out.append((t, t + b - a, i, a)); t += b - a
    return out, t


TL, T_CUT = timeline()
T_END = T_CUT + CARD


def ep_time(t):
    for s0, s1, i, a in TL:
        if s0 <= t < s1:
            return i, a + (t - s0)
    return None, None


def chunks(words):
    out, cur = [], []
    for w in words:
        if cur and (len(cur) >= 3 or cur[-1]['w'][-1] in ',.?!:;'):
            out.append(cur); cur = []
        cur.append(w)
    if cur:
        out.append(cur)
    return out


def captions(fr, te):
    """EP001 Short style: Inter heavy, white, ink outline + drop, short phrases that pop in; the word being said is
    gold. te = episode time."""
    lid = next((l for l in LINES if CUES[l]['start'] - .1 <= te <= CUES[l]['end'] + .3), None)
    if not lid:
        return fr
    ws = [w for w in CUES[lid]['words']]
    ch = chunks(ws); cur = None
    for i, k in enumerate(ch):
        nxt = ch[i + 1][0]['start'] if i + 1 < len(ch) else CUES[lid]['end'] + .3
        if k[0]['start'] - .05 <= te < nxt:
            cur = k
    if not cur:
        return fr
    d = ImageDraw.Draw(fr)
    pop = ease((te - cur[0]['start'] + .05) / .12)
    big = lid in ('l08', 'l10')                                        # "You." and "So, why?" land huge
    f = font(int((150 if big else 84) * (.86 + .14 * pop)))
    sw, drop = max(3, round(f.size * .13)), max(2, round(f.size * .07))
    lines, ln = [], []
    for w in cur:
        if ln and d.textlength(' '.join(x['w'] for x in ln + [w]), font=f) > W * .82:
            lines.append(ln); ln = []
        ln.append(w)
    lines.append(ln)
    lh = int(f.size * 1.16); y = H * .74 - lh * len(lines) / 2     # under the subject, above the Shorts UI
    for l_ in lines:
        text = ' '.join(x['w'] for x in l_)
        x = (W - d.textlength(text, font=f)) / 2
        d.text((x, y + drop), text, font=f, fill=INK, stroke_width=sw, stroke_fill=INK)
        for w in l_:
            col = YELLOW if w['start'] - .03 <= te <= w['end'] + .08 or big else (255, 255, 255)
            d.text((x, y), w['w'], font=f, fill=col, stroke_width=sw, stroke_fill=INK)
            x += d.textlength(w['w'] + ' ', font=f)
        y += lh
    return fr


def frames(a, b):
    """Decode the source between episode seconds a and b (24 fps)."""
    n = round((b - a) * FPS)
    p = subprocess.Popen([FF, '-v', 'error', '-ss', f'{a:.3f}', '-i', str(SRC), '-frames:v', str(n), '-f', 'rawvideo',
                          '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    for _ in range(n):
        buf = p.stdout.read(SW * SH * 3)
        if len(buf) < SW * SH * 3:
            break
        yield Image.frombytes('RGB', (SW, SH), buf)
    p.stdout.close(); p.wait()


def vertical(im, cx):
    x0 = int(min(max(0, cx * SW - CW / 2), SW - CW))
    return im.crop((x0, 0, x0 + CW, SH)).resize((W, H), Image.LANCZOS)


_CARD_BG = None


def end_card(k, last):
    """FULL EPISODE ON THE CHANNEL over the last frame, darkened, with the episode's thumbnail."""
    global _CARD_BG
    if _CARD_BG is None:
        bg = last.filter(ImageFilter.GaussianBlur(18))
        _CARD_BG = Image.blend(bg, Image.new('RGB', bg.size, (16, 16, 26)), .55)
    fr = _CARD_BG.copy()
    th = Image.open(ROOT / 'docs/publish/EP002/thumbnails/v2/EP002_thumb_opt1d_EXCEPT_YOU.jpg').convert('RGB')
    tw = int(W * .86 * (.9 + .1 * ease(k * 3))); th = th.resize((tw, round(tw * 9 / 16)), Image.LANCZOS)
    tx, ty = (W - th.width) // 2, int(H * .42)
    d = ImageDraw.Draw(fr)
    d.rounded_rectangle((tx - 10, ty - 10, tx + th.width + 10, ty + th.height + 10), 26, fill=INK)
    fr.paste(th, (tx, ty))
    for text, y, size, col in (('FULL EPISODE', H * .25, 104, (255, 255, 255)), ('ON THE CHANNEL', H * .25 + 120, 92, YELLOW)):
        f = fredoka(size); x = (W - d.textlength(text, font=f)) / 2
        d.text((x + 6, y + 8), text, font=f, fill=INK, stroke_width=12, stroke_fill=INK)
        d.text((x, y), text, font=f, fill=col, stroke_width=12, stroke_fill=INK)
    return fr


def render_video(path):
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', str(path)],
                         stdin=subprocess.PIPE)
    t, last, stills = 0.0, None, {}
    for (s0, s1, i, a), (_, b, cx) in zip(TL, SEGMENTS):
        va = VIDEO_AT.get(i, a)
        for n, im in enumerate(frames(va, va + b - a)):
            te = a + n / FPS
            fr = vertical(im, cx); plain = fr.copy()                     # the card's background: no caption
            if SUBS:
                fr = captions(fr, te)
            p.stdin.write(fr.tobytes()); last = fr
            for name, ts in (('hook', 19.0), ('you', 21.3), ('room', 10.0), ('ocarina', 14.0), ('why', 26.3)):
                if abs(te - ts) < .5 / FPS:
                    stills[name] = fr
    for n in range(round(CARD * FPS)):
        fr = end_card(n / (CARD * FPS), plain)
        p.stdin.write(fr.tobytes())
    stills['card'] = fr
    p.stdin.close(); p.wait()
    return stills


def render_audio(path):
    """Bram's voice (and the episode's mix) for each segment, 30 ms fades at the cuts, silence under the card."""
    parts, fc = [], ''
    for i, (a, b, _) in enumerate(SEGMENTS):
        d = b - a
        fc += f'[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={d - .06:.3f}:d=0.06[a{i}];'
        parts.append(f'[a{i}]')
    fc += f'{"".join(parts)}concat=n={len(parts)}:v=0:a=1,apad=pad_dur={CARD:.2f}[out]'
    subprocess.run([FF, '-v', 'error', '-y', '-i', str(SRC), '-filter_complex', fc, '-map', '[out]', '-c:a', 'pcm_s16le',
                    '-ar', '48000', str(path)], check=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    vid, aud = OUT / '_v.mp4', OUT / '_a.wav'
    stills = render_video(vid)
    render_audio(aud)
    out = OUT / f'EP002_short1_trailer_v{VERSION}.mp4'
    subprocess.run([FF, '-v', 'error', '-y', '-i', str(vid), '-i', str(aud), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                    '-shortest', '-movflags', '+faststart', str(out)], check=True)
    vid.unlink(); aud.unlink()
    names = ['hook', 'you', 'room', 'ocarina', 'why', 'card']
    sheet = Image.new('RGB', (len(names) * 300 + 20, 560), (28, 28, 34))
    for i, nm in enumerate(names):
        if nm in stills:
            sheet.paste(stills[nm].resize((280, 498)), (20 + i * 300, 30))
    sheet.save(OUT / f'EP002_short1_review_v{VERSION}.jpg', quality=88)
    print(out.relative_to(ROOT), f'{T_END:.2f}s')


if __name__ == '__main__':
    main()
