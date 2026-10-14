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
    'rowboat_side_back.png': ('public/art/ep003/props3d/rowboat_side_back.png', None),
    'rowboat_side_front.png': ('public/art/ep003/props3d/rowboat_side_front.png', None),
    'rowboat_34.png': ('public/art/ep003/props3d/rowboat_34.png', None),
    # the companion fish v2 (Producer, 2026-10-12): deadpan base + the rendered expressions
    'fish_34.png': ('public/art/ep003/props3d/fish2_34_deadpan.png', None),
    'fish_side.png': ('public/art/ep003/props3d/fish2_side_deadpan.png', None),
    **{f'fish_{v}_{e}.png': (f'public/art/ep003/props3d/fish2_{v}_{e}.png', None)
       for v in ('34', 'side') for e in ('blink', 'wide', 'lookup', 'yawn', 'sweat', 'wince')},
    'rod.png': ('public/art/ep003/props3d/rod.png', None),
    'chips.png': ('public/art/ep003/props3d/chips.png', None),
    'dynamite.png': ('public/art/ep003/props3d/dynamite.png', None),
    'lantern.png': ('public/art/ep003/props3d/lantern.png', None),
    'wordmark.png': ('public/art/core/brand/secondquest_wordmark.png', None),
    # new art v1 (2026-10-13): the lake plate and its derived grades (derive_art.py; the original is never edited)
    **{f'lake_{g}.png': (f'docs/art_orders/ep003/new_art_v1/derived/lake_{g}.png', None) for g in ('dusk', 'bluehour', 'night')},
    # the friends Max (purple) and Leo (yellow), our 3D (docs/ep003/characters/FRIENDS_MAX_LEO.md); downscaled copies
    **{f'{w}_sit_34_{e}.png': (f'public/art/ep003/props3d/{w}_sit_34_{e}.png', 520)
       for w in ('max', 'leo') for e in ('neutral', 'laugh', 'shock', 'sideeye', 'sweat')},
    **{f'{w}_sit_34_{e}_blink.png': (f'public/art/ep003/props3d/{w}_sit_34_{e}_blink.png', 520)
       for w in ('max', 'leo') for e in ('neutral', 'laugh', 'shock', 'sideeye', 'sweat')},
    # the friends INSIDE the rowboat (shared 1453x535 crop with the tall boat halves) + talk/blink frames (full size: the slap shots zoom 2x)
    **{f'boat_{w}_{e}{m}.png': (f'public/art/ep003/props3d/boat_{w}_{e}{m}.png', None)
       for w in ('max', 'leo') for e in ('neutral', 'laugh', 'shock', 'sideeye') for m in ('', '_blink', '_m0', '_m1', '_m2')},
    **{f'{w}_34_{e}.png': (f'public/art/ep003/props3d/{w}_34_{e}.png', 760)
       for w in ('max', 'leo') for e in ('neutral', 'laugh', 'shock', 'sideeye', 'sweat')},
    **{f'{w}_front_{e}.png': (f'public/art/ep003/props3d/{w}_front_{e}.png', 760)
       for w in ('max', 'leo') for e in ('neutral', 'laugh', 'shock', 'sideeye', 'sweat')},
    **{f'{w}_{p}.png': (f'public/art/ep003/props3d/{w}_{p}.png', 760)
       for w in ('max', 'leo') for p in ('cheer_34_laugh', 'point_34_neutral', 'phone_34_neutral', 'sit_side_laugh', 'sit_side_neutral')},
}
FONTS = ['Anton-Regular.woff2', 'Inter-800.woff2', 'Inter-600.woff2']


def main():
    """python3 stage_assets.py [--block B]: B..G stage into block<X>/assets with the block's narration+SFX cut;
    a block's own extra art goes in src/block<X>.assets.json ({"name.png": ["repo/path.png", max_h or null]})."""
    import sys
    global OUT
    subprocess.run(['python3', str(HERE / 'derive_art.py')], check=True)   # derived grades of the new art (only if missing)
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
    cues = json.load(open(ROOT / 'episodes/ep003/timings.json'))['cues']
    t0, t1 = span(b)
    end = round(t1 - t0, 3)
    subprocess.run([str(FFMPEG), '-y', '-v', 'error', '-ss', str(t0), '-i', str(ROOT / 'public/episodes/ep003/audio/mix.wav'),
                    '-t', str(end), '-c:a', 'pcm_s16le',
                    str(OUT / ('narration_hook.wav' if b == 'A' else 'narration.wav'))], check=True)
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
