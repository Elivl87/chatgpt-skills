#!/usr/bin/env python3
"""SecondQuest style bible: measure a finished video (ours) so every new episode can be checked against the channel's
proven look and pacing. Idea from video-by-reference (MIT, ishuagrawal/skills); this is our own code (no ffprobe needed).

  python3 scripts/style_bible.py <video.mp4> <name> [--timings episodes/ep002/timings.json]

Measures: cuts and shot lengths (frame difference), palette (k-means), brightness/saturation per second, loudness and
silences, speech rate (from timings), and a contact sheet every 10 s. Out: docs/style/<name>.json + <name>_sheet.jpg.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
FF = imageio_ffmpeg.get_ffmpeg_exe()


def frames(path, fps, w, h):
    raw = subprocess.run([FF, '-v', 'error', '-i', str(path), '-vf', f'fps={fps},scale={w}:{h}:flags=area', '-f', 'rawvideo',
                          '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)


def audio(path, sr=16000):
    raw = subprocess.run([FF, '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32), sr


def kmeans(px, k=10, iters=14, seed=7):
    rng = np.random.default_rng(seed)
    c = px[rng.choice(len(px), k, replace=False)].astype(np.float32)
    for _ in range(iters):
        lab = np.argmin(((px[:, None, :] - c[None]) ** 2).sum(2), 1)
        for i in range(k):
            if (lab == i).any():
                c[i] = px[lab == i].mean(0)
    share = np.bincount(lab, minlength=k) / len(lab)
    o = np.argsort(-share)
    return [('#%02x%02x%02x' % tuple(int(v) for v in c[i]), round(float(share[i]), 3)) for i in o]


def main():
    path, name = Path(sys.argv[1]), sys.argv[2]
    tm = sys.argv[sys.argv.index('--timings') + 1] if '--timings' in sys.argv else None
    out = ROOT / 'docs/style'; out.mkdir(parents=True, exist_ok=True)
    FPS = 6
    F = frames(path, FPS, 160, 90).astype(np.float32)
    dur = len(F) / FPS
    d = np.abs(np.diff(F, axis=0)).mean(axis=(1, 2, 3))
    thr = max(18.0, np.median(d) + 6 * np.median(np.abs(d - np.median(d))))
    cuts = [round((i + 1) / FPS, 2) for i in np.where(d > thr)[0]]
    merged = []
    for c in cuts:                                                   # one cut per 0.5 s
        if not merged or c - merged[-1] > .5:
            merged.append(c)
    bounds = [0.0] + merged + [dur]
    shots = np.diff(bounds)
    motion = float((d > 1.0).mean())                                 # share of frame pairs with visible movement
    still_runs, run = [], 0
    for v in d:
        run = run + 1 if v <= 1.0 else 0
        if run == FPS * 2:
            still_runs.append(1)
    hsv = np.stack([np.asarray(Image.fromarray(f.astype(np.uint8)).convert('HSV')) for f in F[::FPS]])
    bright = hsv[..., 2].mean(axis=(1, 2)) / 255; sat = hsv[..., 1].mean(axis=(1, 2)) / 255
    pick = F[np.linspace(0, len(F) - 1, 15).astype(int)].reshape(-1, 3)[::7]
    pal = kmeans(pick)
    x, sr = audio(path)
    win = int(.25 * sr)
    rms = np.array([np.sqrt(np.mean(x[i:i + win] ** 2) + 1e-12) for i in range(0, len(x) - win, win)])
    db = 20 * np.log10(rms)
    speech = db > (np.percentile(db, 90) - 25)
    sil, run = [], 0
    for s in speech:
        if not s:
            run += 1
        else:
            if run * .25 >= .5:
                sil.append(run * .25)
            run = 0
    R = {'name': name, 'source': str(path.relative_to(ROOT) if path.is_relative_to(ROOT) else path), 'duration_s': round(dur, 1),
         'shots': len(shots), 'avg_shot_s': round(float(shots.mean()), 2), 'median_shot_s': round(float(np.median(shots)), 2),
         'longest_shot_s': round(float(shots.max()), 2), 'cuts_per_min': round(len(merged) / dur * 60, 1),
         'motion_share': round(motion, 3), 'still_2s_runs': len(still_runs),
         'brightness_mean': round(float(bright.mean()), 3), 'saturation_mean': round(float(sat.mean()), 3),
         'palette': pal, 'loud_db_p90': round(float(np.percentile(db, 90)), 1),
         'pauses_ge_0_5s': len(sil), 'pause_mean_s': round(float(np.mean(sil)), 2) if sil else 0,
         'pause_longest_s': round(float(max(sil)), 2) if sil else 0}
    if tm:
        cues = json.load(open(ROOT / tm))['cues']
        words = sum(len(c['text'].split()) for c in cues.values())
        speak = sum(c['end'] - c['start'] for c in cues.values())
        R['words'] = words; R['wpm_overall'] = round(words / dur * 60); R['wpm_while_speaking'] = round(words / speak * 60)
    (out / f'{name}.json').write_text(json.dumps(R, indent=1))
    times = np.arange(5, dur, 10)                                     # contact sheet
    G = frames(path, 1, 320, 180)
    tiles = [Image.fromarray(G[min(len(G) - 1, int(t))]) for t in times]
    cols = 6; rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new('RGB', (320 * cols, 180 * rows))
    for i, im in enumerate(tiles):
        sheet.paste(im, ((i % cols) * 320, (i // cols) * 180))
    sheet.save(out / f'{name}_sheet.jpg', quality=80)
    print(json.dumps(R, indent=1))


if __name__ == '__main__':
    main()
