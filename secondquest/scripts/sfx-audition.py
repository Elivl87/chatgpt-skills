#!/usr/bin/env python3
"""Sound audition sheet: play candidate sounds one by one with their label on screen, so the Producer picks by ear.

  python3 scripts/sfx-audition.py docs/ep002/sfx_audition.json

Input JSON: {"title": "...", "out": "docs/ep002/sfx_audition.mp4",
             "slots": [{"slot": "CLIC", "candidates": [{"id": "A", "label": "...", "layers": [["path", gain, offset_s], ...]}]}]}
Paths are relative to public/. Each candidate is played twice (a 0.9 s preview, then in full); its card lasts as long as the sound.
Only free sounds go here: engine synths, CC0 (license file next to them) or our own recordings/voices.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FF = imageio_ffmpeg.get_ffmpeg_exe()
SR, W, H, FPS, CARD = 48000, 1280, 720, 24, 2.2
F = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', s)


def load(path):
    r = subprocess.run([FF, '-v', 'error', '-i', str(ROOT / 'public' / path), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32)


def main():
    spec = json.loads(Path(sys.argv[1]).read_text())
    cards = [(s['slot'], c) for s in spec['slots'] for c in s['candidates']]
    sounds = [[(load(p_) * g, off) for p_, g, off in c['layers']] for _, c in cards]
    # each card lasts as long as its sound: a 0.9 s preview, then the full sound, then a short gap
    lens = [max(len(a) / SR + off for a, off in snd) for snd in sounds]
    cardlen = [max(CARD, 1.15 + L + 0.35) for L in lens]
    starts = np.concatenate([[0], np.cumsum(cardlen)])
    audio = np.zeros(int(starts[-1] * SR) + SR, np.float32)
    for k, snd in enumerate(sounds):
        for rep, cap in ((0.25, 0.9), (1.15, None)):
            for a, off in snd:
                s0 = int((starts[k] + rep + off) * SR)
                a = a[: int(cap * SR)] if cap else a
                audio[s0:s0 + len(a)] += a[: len(audio) - s0]
    peak = np.abs(audio).max()
    if peak > 0.98:
        audio *= 0.98 / peak
    wav = ROOT / 'renders/tmp/audition.wav'
    wav.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', str(wav)], input=audio.tobytes(), check=True)
    out = ROOT / spec['out']
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', str(wav),
                          '-c:v', 'libx264', '-crf', '24', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(out)], stdin=subprocess.PIPE)
    for k, (slot, c) in enumerate(cards):
        im = Image.new('RGB', (W, H), (18, 16, 24))
        d = ImageDraw.Draw(im)
        d.text((60, 50), spec['title'], font=F(26), fill=(255, 210, 90))
        d.text((60, 210), slot, font=F(54), fill=(170, 225, 255))
        d.text((60, 300), f"Opción {c['id']}", font=F(96), fill='white')
        d.text((60, 450), c['label'], font=F(30), fill=(220, 220, 230))
        d.text((60, 640), f'{k + 1}/{len(cards)}  ·  suena dos veces', font=F(22), fill=(150, 150, 170))
        for _ in range(int(round(starts[k + 1] * FPS)) - int(round(starts[k] * FPS))):
            p.stdin.write(im.tobytes())
    p.stdin.close(); p.wait()
    print(f'{out.relative_to(ROOT)}  {len(cards)} candidates')


if __name__ == '__main__':
    main()
