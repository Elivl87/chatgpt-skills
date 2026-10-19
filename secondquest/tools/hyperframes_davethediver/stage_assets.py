#!/usr/bin/env python3
"""Stage a Dave the Diver block's assets into block<X>/assets/ (gitignored).

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
OUT = None
FFMPEG = HERE / '.bin' / 'ffmpeg'

ART = {
    'wordmark.png': ('public/art/core/brand/secondquest_wordmark.png', None),
}
FONTS = ['Anton-Regular.woff2', 'Inter-800.woff2', 'Inter-600.woff2']


def main():
    """python3 stage_assets.py [--block B]: B..G stage into block<X>/assets with the block's narration+SFX cut;
    a block's own extra art goes in src/block<X>.assets.json ({"name.png": ["repo/path.png", max_h or null]})."""
    import sys
    global OUT
    b = sys.argv[sys.argv.index('--block') + 1] if '--block' in sys.argv else 'A'
    sys.path.insert(0, str(HERE))
    from blocks import span, pdir
    OUT = pdir(b) / 'assets'
    art = dict(ART)
    extra = HERE / f'src/block{b}.assets.json'
    if extra.exists():
        art.update({k: tuple(v) for k, v in json.loads(extra.read_text()).items()})
    (OUT / 'fonts').mkdir(parents=True, exist_ok=True)
    for name, (src, max_h) in art.items():
        im = Image.open(ROOT / src)
        if max_h and im.height > max_h:
            im = im.resize((round(im.width * max_h / im.height), max_h), Image.LANCZOS)
            im.save(OUT / name)
        else:
            shutil.copy2(ROOT / src, OUT / name)
    for f in FONTS:
        shutil.copy2(ROOT / 'public/shared/fonts' / f, OUT / 'fonts' / f)
    cues = json.load(open(ROOT / 'episodes/davethediver/timings.json'))['cues']
    t0, t1 = span(b)
    end = round(t1 - t0, 3)
    subprocess.run([str(FFMPEG), '-y', '-v', 'error', '-ss', str(t0), '-i', str(ROOT / 'public/episodes/davethediver/audio/narration.wav'),
                    '-t', str(end), '-c:a', 'pcm_s16le',
                    str(OUT / 'narration.wav')], check=True)
    vendor = OUT / 'vendor'
    vendor.mkdir(exist_ok=True)
    shutil.copy2(HERE / 'node_modules/gsap/dist/gsap.min.js', vendor / 'gsap.min.js')
    # every word time as a table the compositions key their moves off (W('l07.w2') = start of "why"), so a new
    # narration (Bram, v3) re-times the whole video without touching a single hand-typed second
    table = {}
    for k, c in cues.items():
        table[k] = round(c['start'], 3); table[k + '.end'] = round(c['end'], 3)
        for i, w in enumerate(c['words']):
            table[f'{k}.w{i + 1}'] = round(w['start'], 3); table[f'{k}.w{i + 1}.end'] = round(w['end'], 3)
    (OUT / 'words.js').write_text('window.WORDS = ' + json.dumps(table) + ';\n'
                                  'window.W = (k, d = 0) => { if (!(k in window.WORDS)) throw new Error("no word " + k); return window.WORDS[k] + d; };\n')
    print('block', b, 'staged; narration cut', t0, '..', t1, f'({end} s)')


if __name__ == '__main__':
    main()
