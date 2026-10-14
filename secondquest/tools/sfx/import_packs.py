#!/usr/bin/env python3
"""Import downloaded free SFX packs into public/shared/sfx in one consistent format.

  python3 -I tools/sfx/import_packs.py <downloads_dir>

<downloads_dir>/<pack>/x/ holds the audio already extracted (audio + licence text only, nothing executed; see
SOURCES.md for each pack's URL and licence). For every audio file:
  * decode (wav/ogg/flac/mp3/aif via libsndfile), mono if both channels are ~identical
  * resample to 48 kHz (polyphase), remove DC
  * trim leading/trailing silence (-50 dB under the peak, 5 ms pre-roll, 25 ms tail with a fade)
  * cap ambience beds at 60 s, drop clips shorter than 25 ms
  * peak-normalise to -1 dBFS
  * write Ogg Vorbis to public/shared/sfx/<licence dir>/<pack>/<flattened name>.ogg
A pack's mp3 copy is skipped when a wav/flac of the same name exists. Files already in cc0/kenney (the older
subset, referenced by name in scripts) are not duplicated.
"""
import re
import sys
from math import gcd
from pathlib import Path

import numpy as np
import scipy.signal as ss
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
SFX = ROOT / 'public/shared/sfx'
SR = 48000
AUD = ('.wav', '.ogg', '.flac', '.mp3', '.aif', '.aiff')

# download dir -> (destination relative to public/shared/sfx)
DEST = {
    'kenney_interface-sounds': 'cc0/kenney_interface', 'kenney_impact-sounds': 'cc0/kenney_impact',
    'kenney_ui-audio': 'cc0/kenney_ui', 'kenney_rpg-audio': 'cc0/kenney_rpg', 'kenney_casino-audio': 'cc0/kenney_casino',
    'kenney_digital-audio': 'cc0/kenney_digital', 'kenney_sci-fi-sounds': 'cc0/kenney_scifi',
    'kenney_music-jingles': 'cc0/kenney_jingles',
    'oga_lrsf_ui': 'ccby/lrsf_ui', 'oga_lrsf_fantasy': 'ccby/lrsf_fantasy',
}


def dest_for(pack):
    return DEST.get(pack, 'cc0/' + pack.removeprefix('oga_'))


def flat(rel):
    s = re.sub(r'\.(mp3|wav|ogg)(?=\.)', '', rel)                    # hit01.mp3.flac -> hit01
    s = re.sub(r'\.[A-Za-z0-9]+$', '', s)
    s = re.sub(r'[^A-Za-z0-9]+', '_', s).strip('_')
    return s[:90]


def load(p):
    x, sr = sf.read(str(p), always_2d=True, dtype='float64')
    x = x.T
    if x.shape[0] > 2:
        x = x[:2]
    if x.shape[0] == 2:
        a, b = x
        if np.max(np.abs(a - b)) < 1e-3 * (np.max(np.abs(x)) + 1e-9) or np.max(np.abs(b)) < 1e-6:
            x = x[:1] if np.max(np.abs(a)) > 0 else x[1:]
    if sr != SR:
        g = gcd(SR, sr)
        x = ss.resample_poly(x, SR // g, sr // g, axis=1)
    x = x - x.mean(axis=1, keepdims=True)
    return x


def clean(x, max_s):
    env = np.max(np.abs(x), axis=0)
    pk = env.max()
    if pk < 1e-5:
        return None
    win = 64
    sm = np.convolve(env, np.ones(win) / win, 'same')
    idx = np.where(sm > pk * 10 ** (-50 / 20))[0]
    if not len(idx):
        return None
    a = max(0, idx[0] - int(.005 * SR))
    b = min(x.shape[1], idx[-1] + int(.025 * SR))
    x = x[:, a:b]
    if x.shape[1] > max_s * SR:
        x = x[:, :int(max_s * SR)]
    n = x.shape[1]
    if n < .025 * SR:
        return None
    fi, fo = min(int(.002 * SR), n // 4), min(int(.02 * SR), n // 4)
    x[:, :fi] *= np.linspace(0, 1, fi)
    x[:, n - fo:] *= np.linspace(1, 0, fo)
    return x / (np.max(np.abs(x)) + 1e-12) * 10 ** (-1 / 20)


def write_ogg(dst, x):
    """Vorbis in 1 s blocks (libsndfile's Vorbis encoder can crash on one big write)"""
    with sf.SoundFile(str(dst), 'w', SR, x.shape[0], format='OGG', subtype='VORBIS') as f:
        for i in range(0, x.shape[1], SR):
            f.write(np.ascontiguousarray(x[:, i:i + SR].T))


def main(dl, start_at=''):
    dl = Path(dl)
    old_kenney = {p.stem for p in (SFX / 'cc0/kenney').glob('*.ogg')}
    tot, skipped = 0, 0
    for pack in sorted(p.name for p in dl.iterdir() if (p / 'x').is_dir() and p.name >= start_at):
        files = sorted(f for f in (dl / pack / 'x').rglob('*') if f.suffix.lower() in AUD)
        if not files:
            continue
        stems = {}
        for f in files:                                               # prefer lossless over mp3/ogg copies
            key = flat(f.name).lower()
            rank = {'.wav': 0, '.flac': 0, '.aif': 0, '.aiff': 0, '.ogg': 1, '.mp3': 2}[f.suffix.lower()]
            if key not in stems or rank < stems[key][0]:
                stems[key] = (rank, f)
        out = SFX / dest_for(pack)
        out.mkdir(parents=True, exist_ok=True)
        n = 0
        for _, f in sorted(stems.values(), key=lambda v: str(v[1])):
            rel = f.relative_to(dl / pack / 'x').as_posix()
            if 'preview' in rel.lower():
                continue
            name = flat(f.name)
            if pack.startswith('kenney_') and name in old_kenney:
                continue
            # owlish/juhani etc. keep a hint of their sub-folder in the name
            parent = flat(f.parent.relative_to(dl / pack / 'x').as_posix()) if f.parent != dl / pack / 'x' else ''
            if parent and pack in ('oga_owlish_202', 'oga_juhani512', 'oga_ylmir_rain', 'oga_pauliuw_forestbirds') \
                    and parent.lower() not in name.lower():
                name = (parent.split('_')[-1] + '_' + name)[:90]
            try:
                x = load(f)
            except Exception as e:                                    # noqa
                print('  !! unreadable', rel, e)
                skipped += 1
                continue
            loopish = any(k in rel.lower() for k in ('loop', 'amb', 'rain', 'park', 'birds', 'crickets', 'forest', 'crowd', 'applause'))
            x = clean(x, 60 if loopish else 20)
            if x is None:
                skipped += 1
                continue
            dst = out / (name + '.ogg')
            k = 2
            while dst.exists() and dst.stat().st_mtime > START:
                dst = out / f'{name}_{k}.ogg'
                k += 1
            write_ogg(dst, x)
            n += 1
        tot += n
        print(f'{pack:32s} -> {dest_for(pack):34s} {n:4d} files')
    print('total', tot, 'skipped', skipped)


if __name__ == '__main__':
    import time
    START = time.time() - 1
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else '')  # optional: resume from this pack name
