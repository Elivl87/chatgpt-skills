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
import json, math, os, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC = ROOT / 'docs/ep002/EP002_animatic_full_v6_1440p.mp4'        # the approved final video (2560x1440, 24 fps)
OUT = ROOT / 'docs/publish/EP002/short1'
VERSION = 11
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
            (12.95, 17.20, .50),     # l04-l06 the ocarina, the sword, the Triforce (lock-on); ends before the field cut
            (21.75, 25.50, .50),     # l09 Quest sets off down the road: "…that might be exactly why we want to go back."
            (25.55, 27.95, .50)]     # l10 "So, why?" (audio; picture VIDEO_AT + our wordmark, as in the episode)
VIDEO_AT = {3: 20.25, 4: 24.00}       # l09/l10 pictures: one continuous walk (l10 used to jump back 1.5 s: Quest seemed
                                      # to walk backwards); l10 under the wordmark (the episode's logo card is 16:9)
FROM_BLOCK_B = {0, 3, 4}              # field shots re-rendered from block B without its area card (Producer: no THE FIELD)
FRAME_W = round(W * 1.6)              # framing B (Producer, 2026-10-07): the frame at 160 % width, 62 % of it visible
FRAME_CY = 860                        # its centre; title band above, captions below, clear of the Shorts UI
TITLE = ("THE ONE THING", "NINTENDO CAN'T REBUILD")   # the episode's title A as a fixed band (Producer approved)
WORDMARK = Image.open(ROOT / 'public/art/core/brand/secondquest_wordmark.png').convert('RGBA')
XFADE = .55                          # the field dissolves into the card (Producer: the cut after "why?" was abrupt)
CARD = 2.6                           # end card seconds
LINES = ['l07', 'l08', 'l03', 'l04', 'l05', 'l06', 'l09', 'l10']


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


def captions(fr, te, seg=(-1e9, 1e9)):
    """EP001 Short style: Inter heavy, white, ink outline + drop, short phrases that pop in; the word being said is
    gold. te = episode time."""
    lid = next((l for l in LINES if seg[0] - .2 <= CUES[l]['start'] <= seg[1]                     # only this segment's lines
                and CUES[l]['start'] - .1 <= te <= CUES[l]['end'] + .3), None)
    if not lid:
        return fr
    ws = [w for w in CUES[lid]['words']]
    ch = [ws] if lid in ('l08', 'l10') else chunks(ws); cur = None     # "You." and "So, why?": one hit each
    for i, k in enumerate(ch):
        nxt = ch[i + 1][0]['start'] if i + 1 < len(ch) else CUES[lid]['end'] + .3
        if k[0]['start'] - .05 <= te < nxt:
            cur = k
    if not cur:
        return fr
    d = ImageDraw.Draw(fr)
    pop = ease((te - cur[0]['start'] + .05) / .12)
    big = lid in ('l08', 'l10')                                        # "You." and "So, why?" land huge
    f = font(int((140 if big else 76) * (.86 + .14 * pop)))
    sw, drop = max(3, round(f.size * .13)), max(2, round(f.size * .07))
    lines, ln = [], []
    for w in cur:
        if ln and d.textlength(' '.join(x['w'] for x in ln + [w]), font=f) > W * .82:
            lines.append(ln); ln = []
        ln.append(w)
    lines.append(ln)
    lh = int(f.size * 1.16); y = 1475 - lh * len(lines) / 2         # the band under the frame, above the Shorts UI
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


_BLOCK_B = None


def block_b_frames(a, b, navi=True):
    """The same frames as the video, rendered from block B's script at final quality, minus the THE FIELD card.
    navi=False leaves B's own Navi out (the Short draws her in 9:16 for her flight into the wordmark's star)."""
    global _BLOCK_B
    if _BLOCK_B is None:
        import importlib.util
        os.environ['QUALITY'] = 'final'
        sys.path.insert(0, str(ROOT / 'scripts/animatic'))
        sp = importlib.util.spec_from_file_location('blockB', ROOT / 'scripts/ep002-blockB-animatic.py')
        _BLOCK_B = importlib.util.module_from_spec(sp); sp.loader.exec_module(_BLOCK_B)
        _BLOCK_B.T_WM = 1e6        # its own 16:9 wordmark stays off (ours is drawn for 9:16)
        _BLOCK_B.T_END = 1e6       # B6's camera tilt freezes: in 9:16 the tilt read as Quest walking back (Producer)
    real = _BLOCK_B.fairy_fx
    if not navi:
        _BLOCK_B.fairy_fx = type('NoNavi', (), {'draw': staticmethod(lambda fr, *a, **k: fr)})
    for n in range(round((b - a) * FPS)):
        im = _BLOCK_B._render_shot(a + n / FPS).convert('RGB')
        yield im if im.size == (SW, SH) else im.resize((SW, SH), Image.LANCZOS)
    _BLOCK_B.fairy_fx = real


def vertical(im, cx):
    """Framing B: the frame large (62 % of its width visible) on a blurred, darkened copy of itself; the fixed title
    band on top. cx: which part of the frame stays in view (fraction of its width)."""
    fh = round(FRAME_W * 9 / 16)
    small = im.resize((192, 108), Image.BILINEAR)
    bw = round(H * 16 / 9)
    bg = small.resize((bw, H), Image.BILINEAR).crop(((bw - W) // 2, 0, (bw - W) // 2 + W, H)).filter(ImageFilter.GaussianBlur(24))
    bg = Image.blend(bg, Image.new('RGB', bg.size, (14, 14, 22)), .45)
    fr = im.resize((FRAME_W, fh), Image.LANCZOS)
    x0 = int(min(max(0, cx * FRAME_W - W / 2), FRAME_W - W))
    fr = fr.crop((x0, 0, x0 + W, fh))
    y0 = FRAME_CY - fh // 2
    bg.paste(fr, (0, y0))
    d = ImageDraw.Draw(bg)
    d.line((0, y0 - 3, W, y0 - 3), fill=INK, width=6); d.line((0, y0 + fh + 2, W, y0 + fh + 2), fill=INK, width=6)
    return title_band(bg)


def title_band(fr):
    d = ImageDraw.Draw(fr)
    y = 150
    for text, col, size in ((TITLE[0], (255, 255, 255), 74), (TITLE[1], YELLOW, 74)):
        f = fredoka(size)
        while d.textlength(text, font=f) > W * .9:
            size -= 2; f = fredoka(size)
        x = (W - d.textlength(text, font=f)) / 2
        d.text((x + 5, y + 7), text, font=f, fill=INK, stroke_width=10, stroke_fill=INK)
        d.text((x, y), text, font=f, fill=col, stroke_width=10, stroke_fill=INK)
        y += size * 1.08
    return fr


def _out_back(x, c=1.70158):
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2


def _in_out_cubic(x):
    return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2


LOGO_AT = CUES['l09']['words'][-1]['start'] - .15          # just before "back" (Producer, 2026-10-07)
LOGO_W = W * .80                                           # a little smaller than v4 (Producer)
T_LOGO = next(s0 + LOGO_AT - a for s0, s1, i, a in TL if i == len(SEGMENTS) - 2)   # in Short time


def wordmark(fr, dt):
    """The episode's wordmark card (block B / EP001 s15), sized for the Short: the wordmark punches in (scale 1.315 -> 1,
    out-back, fade, blur, small tilt) and the gold bar grows from the centre underneath (+0.25 s, 0.45 s)."""
    if dt <= 0:
        return fr
    ww = int(LOGO_W); wh = int(WORDMARK.height * ww / WORDMARK.width)
    u = ww / 1047                                          # the episode's wordmark is 1047 px wide at 1080p
    bar_w = 520 * u * _in_out_cubic(min(1, max(0, (dt - .25) / .45)))
    bar_h, gap = max(2, round(8 * u)), int(18 * u)
    gw, gh = max(ww, int(520 * u)) + 40, wh + gap + bar_h + 40
    g = Image.new('RGBA', (gw, gh))
    g.alpha_composite(WORDMARK.resize((ww, wh), Image.LANCZOS), ((gw - ww) // 2, 20))
    if bar_w > 1:
        d = ImageDraw.Draw(g); y = 20 + wh + gap; x0 = (gw - bar_w) / 2; r = bar_h / 2
        d.rounded_rectangle((x0, y + 3 * u, x0 + bar_w, y + bar_h + 3 * u), r, fill=INK + (255,))
        d.rounded_rectangle((x0, y, x0 + bar_w, y + bar_h), r, fill=(255, 200, 61, 255))      # theme gold #ffc83d
    x = min(1, dt / .28); e = _out_back(x)
    sc = 1.315 + (1 - 1.315) * e
    g = g.rotate(8 * .35 * (1 - e), resample=Image.BICUBIC, expand=True)
    g = g.resize((max(1, int(g.width * sc)), max(1, int(g.height * sc))), Image.LANCZOS)
    blur = (1 - min(1, x * 2.5)) * 14 * u
    if blur > .3:
        g = g.filter(ImageFilter.GaussianBlur(float(blur)))
    op = min(1, x * 4)
    if op < 1:
        g.putalpha(g.getchannel('A').point(lambda v: int(v * op)))
    out = fr.convert('RGBA'); out.alpha_composite(g, ((W - g.width) // 2, FRAME_CY - g.height // 2 - 110))
    return out.convert('RGB')


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


# ------------------------------------------------------------------ Navi into the star (as the episode's end, block U)
# Producer (2026-10-07): "el efecto de Navi entrando en la O de Second que tiene 4 estrellas al final del vídeo".
# She takes over from block B's Navi beside Quest, flies up to the wordmark, around it, into the four-point star in the
# "o" of Second, and the star twinkles. Her trail sound is the episode's (NAVI_SFX_01 at 0.14, as in block U).
sys.path.insert(0, str(ROOT / 'tools/fx'))
import fairy as fairy_fx  # noqa: E402
NAVI_SFX = ROOT / 'public/episodes/ep002/sfx/navi_original/NAVI_SFX_01.wav'
NAVI_SIZE = .018                                           # B's Navi as she appears in the 9:16 frame


def _seg_start(i):
    return next(s0 for s0, s1, j, a in TL if j == i)


def _to_short(fx, fy, cx=.5):
    """Source-frame fractions -> Short pixels (framing B)."""
    fh = round(FRAME_W * 9 / 16)
    x0 = min(max(0, cx * FRAME_W - W / 2), FRAME_W - W)
    return fx * FRAME_W - x0, FRAME_CY - fh / 2 + fy * fh


def _star_xy():
    """The star in the wordmark's "o" (808, 235 of 2605x448) once the card has settled."""
    ww = int(LOGO_W); wh = int(WORDMARK.height * ww / WORDMARK.width); u = ww / 1047
    gw, gh = max(ww, int(520 * u)) + 40, wh + int(18 * u) + max(2, round(8 * u)) + 40
    gx, gy = (W - gw) / 2, FRAME_CY - gh // 2 - 110
    return gx + 20 + ww * 808 / 2605, gy + 20 + wh * 235 / 448, (gx + gw / 2, gy + 20 + wh / 2, ww / 2, wh / 2)


S3 = len(SEGMENTS) - 2
T_NAVI0 = _seg_start(S3)                                    # she is ours from l09 on
T_UP0 = T_LOGO + .15                                        # leaves Quest as the wordmark lands
T_STAR = _seg_start(S3 + 1) + CUES['l10']['end'] - SEGMENTS[S3 + 1][0]   # into the star as "why?" ends
T_UP1, T_LOOP1 = T_UP0 + .55, T_STAR - .45


def _navi_keys():
    import importlib  # noqa
    B = _BLOCK_B
    bkeys = [(B.T_FIELD, .6, .48), (B.T_YOU, .57, .46), (B.T_GO, .57, .46), (B.T_GO + 1.2, .55, .5), (B.T_WHY + .6, .545, .56), (B.T_WHY + 3, .54, .62)]
    sx, sy, (wx, wy, wrx, wry) = _star_xy()
    keys, t = [], T_NAVI0
    while t <= T_STAR + .3:
        if t < T_UP0:                                           # beside Quest, on B's own path (picture time)
            pt = VIDEO_AT[S3] + (t - T_NAVI0) if t < _seg_start(S3 + 1) else VIDEO_AT[S3 + 1] + (t - _seg_start(S3 + 1))
            x, y = _to_short(*fairy_fx.path(bkeys, pt))
        elif t < T_UP1:                                         # up to the wordmark's right end
            k = ease((t - T_UP0) / (T_UP1 - T_UP0))
            x0, y0 = KEY_UP0
            x, y = x0 + (wx + wrx * 1.1 - x0) * k, y0 + (wy - y0) * k - 120 * math.sin(math.pi * k)
        elif t < T_LOOP1:                                       # around it, a turn and a half
            a = 3 * math.pi * (t - T_UP1) / (T_LOOP1 - T_UP1)
            x, y = wx + wrx * 1.1 * math.cos(a), wy - wry * 1.6 * math.sin(a)
        else:                                                   # into the star
            k = ease(min(1, (t - T_LOOP1) / (T_STAR - T_LOOP1)))
            x, y = (wx - wrx * 1.1) + (sx - (wx - wrx * 1.1)) * k, wy + (sy - wy) * k - 40 * math.sin(math.pi * k)
        if t < T_UP0:
            globals()['KEY_UP0'] = (x, y)
        keys.append((t, x / W, y / H)); t += .04
    return keys


_NAVI = None


def navi_flight(fr, t):
    global _NAVI
    if _NAVI is None:
        _NAVI = _navi_keys()
    op = 1.0 if t < T_STAR - .15 else max(0.0, (T_STAR - t) / .15)
    if op > 0:
        grow = ease((t - T_UP0) / (T_UP1 - T_UP0)) if t > T_UP0 else 0     # she grows as she rises: readable by the big wordmark
        fr = fairy_fx.draw(fr, _NAVI, t, size=NAVI_SIZE + (.03 - NAVI_SIZE) * grow, opacity=op,
                            color=(95, 175, 255), glow=1.0, trail=12)      # a deeper blue glow: she reads on the bright sky
    dt = t - T_STAR + .05
    if 0 <= dt <= .9:                                           # the star twinkles (block U)
        k = math.sin(dt / .9 * math.pi)
        x, y, _ = _star_xy()
        g = Image.new('RGBA', fr.size); ImageDraw.Draw(g).ellipse((x - 110, y - 110, x + 110, y + 110), fill=(255, 240, 200, int(180 * k)))
        fr = Image.alpha_composite(fr.convert('RGBA'), g.filter(ImageFilter.GaussianBlur(40))).convert('RGB')
        d = ImageDraw.Draw(fr); L = 52 * k
        d.polygon([(x, y - L), (x + L * .18, y - L * .18), (x + L, y), (x + L * .18, y + L * .18), (x, y + L),
                   (x - L * .18, y + L * .18), (x - L, y), (x - L * .18, y - L * .18)], fill=(255, 250, 230))
    return fr


def render_video(path):
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', str(path)],
                         stdin=subprocess.PIPE)
    t, last, stills = 0.0, None, {}
    for (s0, s1, i, a), (_, b, cx) in zip(TL, SEGMENTS):
        va = VIDEO_AT.get(i, a)
        src = block_b_frames if i in FROM_BLOCK_B else frames
        gen = src(va, va + b - a, navi=i < len(SEGMENTS) - 2) if i in FROM_BLOCK_B else src(va, va + b - a)
        for n, im in enumerate(gen):
            te = a + n / FPS
            fr = vertical(im, cx)
            if i >= len(SEGMENTS) - 2:                                  # l09 from just before "back", then l10
                fr = wordmark(fr, s0 + n / FPS - T_LOGO)
                fr = navi_flight(fr, s0 + n / FPS)
            plain = fr.copy()                                          # the card's background: no caption
            if SUBS:
                fr = captions(fr, te, (a, b))
            p.stdin.write(fr.tobytes()); last = last_shown = fr
            for name, ts in (('hook', 19.0), ('you', 21.3), ('room', 10.0), ('triforce', 16.8), ('goback', 23.5), ('why', 26.6)):
                if abs(te - ts) < .5 / FPS:
                    stills[name] = fr
    for n in range(round(CARD * FPS)):
        fr = end_card(n / (CARD * FPS), plain)
        k_in = ease(n / (XFADE * FPS))                                  # a soft dissolve into the card, no hard cut
        if k_in < 1:
            fr = Image.blend(last_shown, fr, k_in)
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
    fc += f'{"".join(parts)}concat=n={len(parts)}:v=0:a=1,apad=pad_dur={CARD:.2f}[v];'
    fc += f'[1:a]adelay={int(T_UP0 * 1000)}:all=1,volume=0.14[s];[v][s]amix=inputs=2:duration=first:normalize=0[out]'   # her trail (block U)
    subprocess.run([FF, '-v', 'error', '-y', '-i', str(SRC), '-i', str(NAVI_SFX), '-filter_complex', fc, '-map', '[out]',
                    '-c:a', 'pcm_s16le', '-ar', '48000', str(path)], check=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    vid, aud = OUT / '_v.mp4', OUT / '_a.wav'
    stills = render_video(vid)
    render_audio(aud)
    out = OUT / f'EP002_short1_trailer_v{VERSION}.mp4'
    subprocess.run([FF, '-v', 'error', '-y', '-i', str(vid), '-i', str(aud), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                    '-shortest', '-movflags', '+faststart', str(out)], check=True)
    vid.unlink(); aud.unlink()
    names = ['hook', 'you', 'room', 'triforce', 'goback', 'why', 'card']
    sheet = Image.new('RGB', (len(names) * 300 + 20, 560), (28, 28, 34))
    for i, nm in enumerate(names):
        if nm in stills:
            sheet.paste(stills[nm].resize((280, 498)), (20 + i * 300, 30))
    sheet.save(OUT / f'EP002_short1_review_v{VERSION}.jpg', quality=88)
    print(out.relative_to(ROOT), f'{T_END:.2f}s')


if __name__ == '__main__':
    main()
