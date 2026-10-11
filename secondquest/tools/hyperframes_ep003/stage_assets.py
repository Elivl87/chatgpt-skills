#!/usr/bin/env python3
"""Stage the EP003 hook assets into hook/assets/ (gitignored).

Art is only COPIED (large cut-outs are downscaled copies, same pixels otherwise); the originals in
public/art and docs/art_orders are never touched. The narration + SFX mix is cut to 0 .. end of l07 + 1.5 s.
"""
import json
import shutil
import subprocess
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]                       # secondquest/
OUT = HERE / 'hook' / 'assets'
FFMPEG = HERE / '.bin' / 'ffmpeg'

ART = {
    'quest_laugh.png': ('docs/art_orders/quest/library_v2/results/02_laughing_pointing.png', 900),
    'pixie_laugh.png': ('docs/art_orders/pixie/library/results/04_laughing_pointing.png', 900),
    'rowboat_side.png': ('public/art/ep003/props3d/rowboat_side.png', None),
    'rowboat_34.png': ('public/art/ep003/props3d/rowboat_34.png', None),
    'fish_34.png': ('public/art/ep003/props3d/fish_34.png', None),
    'fish_side.png': ('public/art/ep003/props3d/fish_side.png', None),
    'rod.png': ('public/art/ep003/props3d/rod.png', None),
    'chips.png': ('public/art/ep003/props3d/chips.png', None),
    'dynamite.png': ('public/art/ep003/props3d/dynamite.png', None),
    'lantern.png': ('public/art/ep003/props3d/lantern.png', None),
    'wordmark.png': ('public/art/core/brand/secondquest_wordmark.png', None),
}
FONTS = ['Anton-Regular.woff2', 'Inter-800.woff2', 'Inter-600.woff2']


def main():
    (OUT / 'fonts').mkdir(parents=True, exist_ok=True)
    for name, (src, max_h) in ART.items():
        im = Image.open(ROOT / src)
        if max_h and im.height > max_h:
            im = im.resize((round(im.width * max_h / im.height), max_h), Image.LANCZOS)
            im.save(OUT / name)
        else:
            shutil.copy2(ROOT / src, OUT / name)
    for f in FONTS:
        shutil.copy2(ROOT / 'public/shared/fonts' / f, OUT / 'fonts' / f)
    cues = json.load(open(ROOT / 'episodes/ep003/timings.json'))['cues']
    end = round(cues['l07']['end'] + 1.5, 3)
    subprocess.run([str(FFMPEG), '-y', '-v', 'error', '-i', str(ROOT / 'public/episodes/ep003/audio/mix.wav'),
                    '-t', str(end), '-af', f'afade=t=out:st={end - 0.25}:d=0.25', '-c:a', 'pcm_s16le',
                    str(OUT / 'narration_hook.wav')], check=True)
    vendor = OUT / 'vendor'
    vendor.mkdir(exist_ok=True)
    shutil.copy2(HERE / 'node_modules/gsap/dist/gsap.min.js', vendor / 'gsap.min.js')
    words = {k: [(w['w'], w['start'], w['end']) for w in cues[k]['words']] for k in [f'l0{i}' for i in range(1, 8)]}
    # every word time as a table the compositions key their moves off (W('l07.w2') = start of "why"), so a new
    # narration (Bram, v3) re-times the whole video without touching a single hand-typed second
    table = {}
    for k, c in cues.items():
        table[k] = round(c['start'], 3); table[k + '.end'] = round(c['end'], 3)
        for i, w in enumerate(c['words']):
            table[f'{k}.w{i + 1}'] = round(w['start'], 3); table[f'{k}.w{i + 1}.end'] = round(w['end'], 3)
    (OUT / 'words.js').write_text('window.WORDS = ' + json.dumps(table) + ';\n'
                                  'window.W = (k, d = 0) => { if (!(k in window.WORDS)) throw new Error("no word " + k); return window.WORDS[k] + d; };\n')
    print('narration cut to', end, 's')
    print(json.dumps({k: [f'{w}@{s:.2f}' for w, s, _ in v] for k, v in words.items()}, indent=0)[:400])


if __name__ == '__main__':
    main()
