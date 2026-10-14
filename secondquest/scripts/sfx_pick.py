#!/usr/bin/env python3
"""No-repeat SFX picker with subtle variation and layering (free library: public/shared/sfx/CATALOG.json).

Producer rule (2026-10-14): the same sound never repeats identically within a video. One Picker per video:

    import sys; sys.path.insert(0, 'scripts'); from sfx_pick import Picker
    pk = Picker(seed='ep004')                       # deterministic: same seed + same calls -> same sounds
    y = pk.render('whoosh', t=12.3)                 # (2, n) float32 at 48 kHz, ready to mix at 12.3 s
    p = pk.file('pop', t=14.0)                      # same, written to build/sfx_cache/<seed>/... for path-based cue lists
    y = pk.layer('whoosh+cloth', t=20.0)            # preset layers (see LAYERS) or 'cat1+cat2' / [(cat, dB, offset_s)]
    print(pk.report()); pk.attributions()           # what was used where; CC-BY credit lines for the description

Rules it enforces:
  * a file is never used twice within `min_gap` s (default 20 s) anywhere in the video, and within one category the
    least-used files come first (so a 40-cue episode walks through the catalog instead of looping on favourites);
  * every render gets its own variation: varispeed pitch (category range, default +-2.5 semitones, which also moves
    the length ~+-15 %), an extra +-10 % time-stretch on noisy sounds (whoosh, cloth, rustle, beds; pitch kept),
    +-1.5 dB gain jitter, a gentle random tilt EQ (+-2 dB), random start offset + loop to length for beds;
  * premium tier only by default ('gag' = creatures/weird, 'arcade' = 8-bit: opt in with tiers=...);
  * CC0 + own sounds only by default (CLAUDE.md: CC0 libraries). The two CC-BY 3.0 packs in ccby/ (Little Robot
    Sound Factory) need allow_ccby=True, which the Producer has to OK, and then a credit line (pk.attributions());
  * loudness: each render is normalised to the category's reference level (the old root wav of that category when
    there is one, e.g. whoosh.wav), so swapping `SFX/'whoosh.wav'` for `pk.file('whoosh', t)` keeps the cue gains right.

Navi's original clips (public/episodes/ep002/sfx/navi_original) are not in the catalog and stay as they are.
CLI:  python3 scripts/sfx_pick.py whoosh --n 6 --seed demo   -> writes 6 picks to build/sfx_cache/demo/ and prints them
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from math import gcd
from pathlib import Path

import numpy as np
import scipy.signal as ss
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
SFX = ROOT / 'public/shared/sfx'
CATALOG = SFX / 'CATALOG.json'
SR = 48000

# category aliases (short names used in cue lists)
ALIAS = {'cloth': 'foley-cloth', 'footstep': 'foley-footstep', 'step': 'foley-footstep', 'water': 'foley-water',
         'wood': 'foley-wood', 'metal': 'foley-metal', 'paper': 'foley-paper', 'glass': 'foley-glass',
         'misc': 'foley-misc', 'click': 'click-ui', 'ui': 'click-ui', 'notify': 'notify-tech', 'phone': 'notify-tech',
         'magic': 'magic-sparkle', 'sparkle': 'magic-sparkle', 'chime': 'magic-sparkle', 'bell': 'chime-bell',
         'cartoon': 'cartoon-comedy', 'comedy': 'cartoon-comedy', 'riser': 'riser-swell', 'swell': 'riser-swell',
         'sting': 'musical-sting', 'jingle': 'musical-sting', 'ambience': 'nature-ambience', 'nature': 'nature-ambience',
         'crowd': 'crowd-reaction', 'boom': 'explosion-boom', 'explosion': 'explosion-boom', 'hit': 'impact-soft',
         'thud': 'impact-soft', 'impact': 'impact-heavy', 'debris': 'foley-wood', 'coins': 'coins-money',
         'money': 'coins-money', 'retro': 'retro-8bit'}

# pitch range (semitones) per category; musical things stay in tune unless asked
PITCH = {'musical-sting': 0.0, 'nature-ambience': 0.0, 'ambience-tech': 0.0, 'crowd-reaction': 0.7,
         'magic-sparkle': 1.0, 'chime-bell': 0.0, 'riser-swell': 1.5, 'impact-heavy': 2.0, 'foley-footstep': 1.5}
STRETCH_CATS = {'whoosh', 'foley-cloth', 'nature-ambience', 'ambience-tech', 'riser-swell', 'crowd-reaction', 'foley-paper'}
REF_ROOT = {'whoosh': 'whoosh.wav', 'pop': 'pop.wav', 'magic-sparkle': 'sparkle.wav', 'impact-heavy': 'impact.wav',
            'impact-soft': 'stamp.wav', 'click-ui': 'ui_select.wav', 'notify-tech': 'notify.wav',
            'nature-ambience': 'wind.wav', 'riser-swell': 'tension.wav', 'coins-money': 'money.wav'}

# layering presets: (category, gain dB relative to the first layer, offset s, extra filters)
LAYERS = {
    'whoosh+cloth': [('whoosh', 0, 0.0, {}), ('foley-cloth', -9, 0.04, {'max_dur': 1.2, 'not_match': 'velcro|zipper|belt|armor|chain|beads'})],
    'impact+debris': [('impact-heavy', 0, 0.0, {}), ('foley-wood', -10, 0.03, {'max_dur': 1.5}),
                      ('impact-soft', -14, 0.0, {})],
    'hit+thump': [('impact-soft', 0, 0.0, {}), ('impact-soft', -6, 0.0, {'folder': 'thump_soft'})],
    'pop+sparkle': [('pop', 0, 0.0, {}), ('magic-sparkle', -12, 0.03, {'max_dur': 2.2})],
    'reveal': [('riser-swell', -4, -1.2, {'max_dur': 1.6}), ('magic-sparkle', 0, 0.0, {})],
    'land': [('impact-soft', 0, 0.0, {}), ('foley-cloth', -10, 0.02, {'max_dur': .8, 'not_match': 'velcro|zipper|belt|armor|chain|beads'})],
    'cartoon-hit': [('impact-soft', 0, 0.0, {}), ('cartoon-comedy', -5, 0.03, {'folder': 'boing'})],
    'card-slide': [('whoosh', -3, 0.0, {'max_dur': .5}), ('foley-paper', 0, 0.05, {'max_dur': 1.0})],
    'coin-sparkle': [('coins-money', 0, 0.0, {}), ('magic-sparkle', -14, 0.02, {})],
}


def _load(path: Path) -> np.ndarray:
    x, sr = sf.read(str(path), always_2d=True, dtype='float32')
    x = x.T
    if x.shape[0] == 1:
        x = np.vstack([x, x])
    if sr != SR:
        g = gcd(SR, sr)
        x = ss.resample_poly(x, SR // g, sr // g, axis=1).astype(np.float32)
    return x[:2]


def _varispeed(x: np.ndarray, semis: float) -> np.ndarray:
    """tape-style: pitch and length move together (+2 st = 12 % shorter)"""
    if abs(semis) < 1e-3:
        return x
    f = 2 ** (semis / 12)
    up, down = 1000, int(round(1000 * f))
    g = gcd(up, down)
    return ss.resample_poly(x, up // g, down // g, axis=1).astype(np.float32)


def _stretch(x: np.ndarray, rate: float, rng) -> np.ndarray:
    """time-stretch by overlap-add of 40 ms grains with jittered read heads (fine on noisy material only)"""
    if abs(rate - 1) < 1e-3 or x.shape[1] < SR * .1:
        return x
    g, hop = int(.04 * SR), int(.01 * SR)
    win = np.hanning(g).astype(np.float32)
    n_out = int(x.shape[1] / rate)
    out = np.zeros((2, n_out + g), np.float32)
    norm = np.zeros(n_out + g, np.float32)
    for o in range(0, n_out, hop):
        i = int(o * rate + rng.integers(-hop // 2, hop // 2 + 1))
        i = int(np.clip(i, 0, max(0, x.shape[1] - g)))
        seg = x[:, i:i + g]
        out[:, o:o + seg.shape[1]] += seg * win[:seg.shape[1]]
        norm[o:o + seg.shape[1]] += win[:seg.shape[1]]
    return (out / np.maximum(norm, 1e-3))[:, :n_out]


def _tilt(x: np.ndarray, db: float) -> np.ndarray:
    """gentle tilt EQ around 1.5 kHz: +db on the highs, -db on the lows (first-order shelves)"""
    if abs(db) < .1:
        return x
    sos = ss.butter(1, 1500, 'high', fs=SR, output='sos')
    hi = ss.sosfilt(sos, x, axis=1)
    lo = x - hi
    return (lo * 10 ** (-db / 40) + hi * 10 ** (db / 40)).astype(np.float32)


def _kweight_lufs(x: np.ndarray) -> float:
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    y = ss.lfilter(b2, a2, ss.lfilter(b1, a1, x, axis=-1), axis=-1)
    blk = int(.4 * SR)
    if y.shape[1] <= blk:
        z = np.mean(y ** 2, axis=1).sum()
    else:                                            # loudest 400 ms block: what the ear notices on a short cue
        zs = [np.mean(y[:, i:i + blk] ** 2, axis=1).sum() for i in range(0, y.shape[1] - blk + 1, int(.1 * SR))]
        z = max(zs)
    return float(-0.691 + 10 * np.log10(z + 1e-12))


class Picker:
    def __init__(self, seed='video', min_gap: float = 20.0, tiers=('premium',), catalog: Path = CATALOG,
                 cache_dir: Path | None = None, exclude: list[str] | None = None, allow_ccby: bool = False):
        self.seed = str(seed)
        self.min_gap = min_gap
        self.tiers = set(tiers)
        cat = json.loads(Path(catalog).read_text())
        self.files = [e for e in cat['files'] if not any(x in e['file'] for x in (exclude or []))
                      and (allow_ccby or not str(e.get('licence', '')).startswith('CC-BY'))]
        self.by_cat: dict[str, list[dict]] = {}
        for e in self.files:
            self.by_cat.setdefault(e['category'], []).append(e)
        self.history: list[tuple[float, str, str, dict]] = []      # (t, category, file, params)
        self.uses: dict[str, int] = {}
        self.cache = Path(cache_dir) if cache_dir else ROOT / 'build/sfx_cache' / self.seed
        self.calls = 0
        self.ref = {}
        for c, f in REF_ROOT.items():
            e = next((e for e in self.files if e['file'] == f), None)
            if e:
                self.ref[c] = e['lufs']

    # ------------------------------------------------------------- choice
    def _rng(self, *key) -> np.random.Generator:
        h = hashlib.sha1(('|'.join(map(str, (self.seed,) + key))).encode()).digest()
        return np.random.default_rng(int.from_bytes(h[:8], 'little'))

    def candidates(self, category: str, *, tiers=None, tags=None, folder=None, min_dur=None, max_dur=None,
                   bright=None, dark=None, not_match=None) -> list[dict]:
        category = ALIAS.get(category, category)
        if category not in self.by_cat:
            raise KeyError(f'unknown category {category!r}; known: {sorted(self.by_cat)}')
        tiers = set(tiers) if tiers else (self.tiers | ({'arcade'} if category == 'retro-8bit' else set())
                                         | ({'gag'} if category == 'creature' else set()))
        out = []
        for e in self.by_cat[category]:
            if e['tier'] not in tiers:
                continue
            if folder and e['folder'] != folder and not e['file'].startswith(folder):
                continue
            if not_match and re.search(not_match, e['file'], re.I):
                continue
            if tags and not set(tags) & set(e['tags']):
                continue
            if min_dur and e['duration'] < min_dur:
                continue
            if max_dur and e['duration'] > max_dur:
                continue
            if bright and e['centroid_hz'] < bright:
                continue
            if dark and e['centroid_hz'] > dark:
                continue
            out.append(e)
        return out

    def pick(self, category: str, t: float, **filters) -> dict:
        cands = self.candidates(category, **filters)
        if not cands:
            raise LookupError(f'no candidates for {category} with {filters}')
        recent = {f for (tt, _, f, _) in self.history if abs(tt - t) < self.min_gap}
        free = [e for e in cands if e['file'] not in recent]
        if not free:                                                      # tiny pool: take the one used longest ago
            last = {f: tt for (tt, _, f, _) in self.history}
            free = sorted(cands, key=lambda e: -abs(t - last.get(e['file'], -1e9)))[:1]
        least = min(self.uses.get(e['file'], 0) for e in free)
        pool = [e for e in free if self.uses.get(e['file'], 0) == least]
        rng = self._rng('pick', category, round(t, 3), self.calls)
        self.calls += 1
        return pool[int(rng.integers(len(pool)))]

    # ------------------------------------------------------------- render
    def render(self, category: str, t: float, *, length: float | None = None, pitch: float | None = None,
               stretch: float = .10, gain_jitter: float = 1.5, tilt: float = 2.0, level: float | None = None,
               fade_out: float = .03, entry: dict | None = None, **filters) -> np.ndarray:
        """one varied render; returns (2, n) float32 at 48 kHz. `length` (s) cuts/loops (beds get a random start)."""
        category = ALIAS.get(category, category)
        e = entry or self.pick(category, t, **filters)
        rng = self._rng('render', e['file'], round(t, 3), self.calls)
        x = _load(SFX / e['file'])
        bed = e['duration'] > 8 or 'bed' in e['tags']
        params = {}
        if bed and length:                                                # random start, loop with a crossfade
            n = int(length * SR)
            start = int(rng.uniform(0, max(1, x.shape[1] - min(n, x.shape[1]))))
            x = np.roll(x, -start, axis=1)
            if x.shape[1] < n:
                xf = int(.25 * SR)
                reps = [x]
                while sum(r.shape[1] for r in reps) - xf * (len(reps) - 1) < n:
                    reps.append(x)
                y = reps[0]
                ramp = np.linspace(0, 1, xf, dtype=np.float32)
                for r in reps[1:]:
                    y = np.concatenate([y[:, :-xf], y[:, -xf:] * (1 - ramp) + r[:, :xf] * ramp, r[:, xf:]], axis=1)
                x = y
            params['offset_s'] = round(start / SR, 2)
        rngp = PITCH.get(category, 2.5) if pitch is None else pitch
        semis = float(rng.uniform(-rngp, rngp)) if rngp else 0.0
        x = _varispeed(x, semis)
        params['semitones'] = round(semis, 2)
        if category in STRETCH_CATS or e.get('flatness', 0) > .6:
            r = float(rng.uniform(1 - stretch, 1 + stretch))
            x = _stretch(x, r, rng)
            params['rate'] = round(r, 3)
        td = float(rng.uniform(-tilt, tilt))
        x = _tilt(x, td)
        params['tilt_db'] = round(td, 2)
        if length:
            n = int(length * SR)
            x = x[:, :n] if x.shape[1] >= n else np.pad(x, ((0, 0), (0, n - x.shape[1])))
        fo = min(int(fade_out * SR), x.shape[1] // 3)
        if fo > 0:
            x[:, -fo:] *= np.linspace(1, 0, fo, dtype=np.float32)
        if bed:
            fi = min(int(.3 * SR), x.shape[1] // 4)
            x[:, :fi] *= np.linspace(0, 1, fi, dtype=np.float32)
        target = level if level is not None else self.ref.get(category, -18.0)
        g = float(rng.uniform(-gain_jitter, gain_jitter))
        x = x * 10 ** ((target - _kweight_lufs(x) + g) / 20)
        pk = np.max(np.abs(x))
        if pk > .98:
            x *= .98 / pk
        params['gain_jitter_db'] = round(g, 2)
        self.history.append((t, category, e['file'], params))
        self.uses[e['file']] = self.uses.get(e['file'], 0) + 1
        return x.astype(np.float32)

    def file(self, category: str, t: float, **kw) -> Path:
        """render() written to a cache wav (for cue lists that take a path). Same call -> same file."""
        x = self.render(category, t, **kw)
        f, p = self.history[-1][2], self.history[-1][3]
        name = f"{ALIAS.get(category, category)}_{t:08.3f}_{Path(f).stem}_{hashlib.sha1(json.dumps(p, sort_keys=True).encode()).hexdigest()[:6]}.wav"
        self.cache.mkdir(parents=True, exist_ok=True)
        out = self.cache / name
        sf.write(str(out), x.T, SR, subtype='PCM_16')
        return out

    def layer(self, spec, t: float, **kw) -> np.ndarray:
        """layered render. spec: a LAYERS preset name, 'cat1+cat2' (second layer -9 dB), or [(cat, dB, offset_s, filters)]"""
        if isinstance(spec, str):
            layers = LAYERS.get(spec) or [(c, 0 if i == 0 else -9, 0.0, {}) for i, c in enumerate(spec.split('+'))]
        else:
            layers = [tuple(l) + ({},) * (4 - len(l)) for l in spec]
        lead = min(0.0, min(l[2] for l in layers))
        parts = []
        for cat, db, off, flt in layers:
            y = self.render(cat, t + off, **{**kw, **flt}) * 10 ** (db / 20)
            parts.append((int((off - lead) * SR), y))
        n = max(o + y.shape[1] for o, y in parts)
        out = np.zeros((2, n), np.float32)
        for o, y in parts:
            out[:, o:o + y.shape[1]] += y
        pk = np.max(np.abs(out))
        if pk > .98:
            out *= .98 / pk
        self.last_layer_lead = lead            # negative offset: place the layer `lead` s before t
        return out

    # ------------------------------------------------------------- reporting
    def attributions(self) -> list[str]:
        files = {f for (_, _, f, _) in self.history}
        return sorted({e['attribution'] for e in self.files if e['file'] in files and e.get('attribution')})

    def check(self) -> list[str]:
        """problems: the same file within min_gap (should never happen unless a pool was too small)"""
        bad = []
        h = sorted(self.history)
        for i, (t1, c1, f1, _) in enumerate(h):
            for t2, c2, f2, _ in h[i + 1:]:
                if t2 - t1 >= self.min_gap:
                    break
                if f1 == f2:
                    bad.append(f'{f1} at {t1:.2f} and {t2:.2f} s')
        return bad

    def report(self) -> str:
        lines = [f'{t:8.2f}s  {c:16s} {f}  {p}' for (t, c, f, p) in sorted(self.history)]
        rep = self.check()
        lines.append(f'{len(self.history)} renders, {len(set(x[2] for x in self.history))} distinct files; '
                     f'repeats within {self.min_gap:.0f} s: {len(rep)}')
        return '\n'.join(lines + rep)


if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('category')
    ap.add_argument('--n', type=int, default=6)
    ap.add_argument('--seed', default='demo')
    ap.add_argument('--gap', type=float, default=3.0, help='seconds between demo cues')
    a = ap.parse_args()
    pk = Picker(seed=a.seed)
    for i in range(a.n):
        if a.category in LAYERS or '+' in a.category:
            y = pk.layer(a.category, i * a.gap)
            pk.cache.mkdir(parents=True, exist_ok=True)
            sf.write(str(pk.cache / f'layer_{a.category.replace("+", "_")}_{i:02d}.wav'), y.T, SR, subtype='PCM_16')
        else:
            pk.file(a.category, i * a.gap)
    print(pk.report())
    print('->', pk.cache)
    sys.exit(1 if pk.check() else 0)
