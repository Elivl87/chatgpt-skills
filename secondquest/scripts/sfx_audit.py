#!/usr/bin/env python3
"""Sound restraint audit: judge an SFX plan and its mix by numbers, because we cannot listen.

The Producer's verdict on EP002 Short #2 ("ni se diga de los sonidos", 70+ cues in 49 s) is a density and taste
problem, not a licensing one. This gate encodes the "fewer, better cues" rules of docs/style/DESIGN_RUBRIC.md §Sound:

  DENSITY        average cue onsets per minute above the budget (Shorts 18/min, episodes 12/min)      error
  BURST          more than 3 cue onsets inside any 2 s window                                       error
  STACK          more than 2 layers starting within 80 ms of each other                             warning
  NO_REST        less than 35 % of the runtime free of any SFX (silence lets the hits land)          warning
  CATEGORY_FATIGUE  one sound family (whoosh, pop, click...) used more than 4 times                  warning
  OVER_VOICE     a cue set louder than -6 dB relative to the voice while the voice talks             warning
  LOUDNESS       integrated loudness outside -14 +/- 1 LUFS or true peak above -1 dBTP (with --mix)  error
  HARSH          (with resolvable files) spectral centroid > 5 kHz: thin, cheap, fatiguing on phones warning
  SOUNDALIKE     (with resolvable files) two different cues whose spectra are > 0.97 similar         warning

Input: the cue log our stage_assets.py writes (`<t>  <rel> dB  <spec>` per line, e.g. short/assets/sfx_cues.txt),
or a JSON list of {"t", "rel_db", "spec", "why"}; optionally the final mix (--mix narration.wav). A cue whose JSON
"why" is empty is flagged UNMOTIVATED: every sound must name the on-screen event it serves.

  python3 scripts/sfx_audit.py tools/hyperframes_ep002_short2/short/assets/sfx_cues.txt \
      --mix tools/hyperframes_ep002_short2/short/assets/narration.wav --kind short
Exit code 1 on any error.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SFXD = ROOT / 'public/shared/sfx'
BUDGET = {'short': 18, 'episode': 12}
LINE = re.compile(r'^\s*(-?\d+(?:\.\d+)?)\s+([+-]?\d+)\s*dB\s+(.+?)\s*$')


def family(spec):
    s = spec.lower()
    if s.startswith('layer '):
        s = s[6:]
    s = s.split(':')[0]
    s = Path(s).stem if '/' in s else s
    s = re.split(r'[+_\-\d]', s)[0]
    return s or 'misc'


def parse(path):
    p = Path(path)
    if p.suffix == '.json':
        return [{'t': float(c['t']), 'rel': float(c.get('rel_db', -10)), 'spec': c.get('spec', ''), 'why': c.get('why')}
                for c in json.loads(p.read_text())]
    cues = []
    for ln in p.read_text().splitlines():
        m = LINE.match(ln)
        if m:
            cues.append({'t': float(m.group(1)), 'rel': float(m.group(2)), 'spec': m.group(3), 'why': None})
    return cues


def resolve(spec):
    s = spec.split(': ', 1)[-1]
    for base in (ROOT, SFXD):
        f = base / s
        if f.is_file():
            return f
    return None


def ebur(path):
    ff = 'ffmpeg'
    try:
        import imageio_ffmpeg
        ff = imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        pass
    e = subprocess.run([ff, '-hide_banner', '-i', str(path), '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    e = e[e.rfind('Summary:'):]
    g = lambda k: float(re.search(k + r':\s+(-?[\d.]+)', e).group(1))
    return {'I': g('I'), 'LRA': g('LRA'), 'TP': g('Peak')}


def spectrum(f):
    import numpy as np
    import soundfile as sf
    y, sr = sf.read(str(f), always_2d=True)
    y = y.mean(1)[: sr * 3]
    if len(y) < 256:
        return None, None, len(y) / sr
    S = np.abs(np.fft.rfft(y * np.hanning(len(y))))
    fr = np.fft.rfftfreq(len(y), 1 / sr)
    cen = float((S * fr).sum() / max(1e-9, S.sum()))
    edges = np.geomspace(60, min(16000, sr / 2 - 1), 33)       # 32 log bands = a cheap timbre fingerprint
    v = np.array([S[(fr >= a) & (fr < b)].sum() for a, b in zip(edges[:-1], edges[1:])]) + 1e-9
    v = np.log(v); v -= v.mean()
    return cen, v / max(1e-9, np.linalg.norm(v)), len(y) / sr


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('cues'); ap.add_argument('--mix'); ap.add_argument('--duration', type=float)
    ap.add_argument('--kind', choices=list(BUDGET), default='short')
    ap.add_argument('--json-out')
    a = ap.parse_args()
    cues = sorted(parse(a.cues), key=lambda c: c['t'])
    if not cues:
        sys.exit('no cues parsed')
    dur = a.duration
    if not dur and a.mix:
        import soundfile as sf
        dur = sf.info(a.mix).duration
    dur = dur or (cues[-1]['t'] + 2)
    F = []
    add = lambda sev, code, msg: F.append({'severity': sev, 'code': code, 'msg': msg})
    # density: layered cues starting together count once as an onset
    onsets = []
    for c in cues:
        if not onsets or c['t'] - onsets[-1] > 0.08:
            onsets.append(c['t'])
    per_min = len(onsets) / dur * 60
    if per_min > BUDGET[a.kind]:
        add('error', 'DENSITY', f'{len(onsets)} onsets in {dur:.1f} s = {per_min:.0f}/min (budget {BUDGET[a.kind]}/min '
            f'-> at most {int(BUDGET[a.kind] * dur / 60)} for this runtime). Keep the cues that sell a story beat; cut the rest.')
    worst = max(sum(1 for o in onsets if t <= o < t + 2) for t in onsets)
    bursts = sorted({round(t, 2) for t in onsets if sum(1 for o in onsets if t <= o < t + 2) > 3})
    if bursts:
        add('error', 'BURST', f'up to {worst} onsets inside 2 s (max 3) at {", ".join(f"{b:.1f}" for b in bursts[:10])} s')
    i = 0
    while i < len(cues):
        j = i
        while j + 1 < len(cues) and cues[j + 1]['t'] - cues[i]['t'] <= 0.08:
            j += 1
        layers = sum(len(c['spec'][6:].split('+')) if c['spec'].startswith('layer ') else 1 for c in cues[i:j + 1])
        if layers > 2:
            add('warning', 'STACK', f'{layers} layers at {cues[i]["t"]:.2f} s')
        i = j + 1
    # rest: a cue occupies [t, t + its length]; unknown length = 0.6 s; beds (ambience/loop) are excluded
    busy = []
    fams = Counter()
    fp = {}
    for c in cues:
        f = resolve(c['spec']); length = 0.6
        bed = bool(re.search(r'ambien|bed|loop|room|wind|birds|crickets', c['spec'], re.I))
        keep = 'navi_original' in c['spec']          # the Producer's own Navi clips are liked and stay: never flagged
        if f is not None:
            try:
                cen, vec, length = spectrum(f)
                if cen and cen > 5000 and not bed and not keep:
                    add('warning', 'HARSH', f'{c["spec"][-50:]} at {c["t"]:.2f} s: centroid {cen / 1000:.1f} kHz (thin/cheap on phones; '
                        'prefer a body+transient layer or a darker take)')
                if vec is not None and not bed and not keep:
                    fp[(c['t'], c['spec'])] = vec
            except Exception:
                pass
        if not bed:
            busy.append((c['t'], c['t'] + min(length, 2.5)))
            if not keep:
                fams[family(c['spec'])] += 1
        if c['rel'] > -6:
            add('warning', 'OVER_VOICE', f'{c["spec"][-50:]} at {c["t"]:.2f} s set {c["rel"]:+.0f} dB vs voice (keep hits <= -6, typical -8..-12)')
        if c['why'] is not None and not str(c['why']).strip():
            add('error', 'UNMOTIVATED', f'cue at {c["t"]:.2f} s has no "why" (which on-screen event does it serve?)')
    busy.sort(); cover = 0.0; end = -1.0
    for s, e in busy:
        if e > end:
            cover += e - max(s, end); end = e
    rest = 1 - cover / dur
    if rest < 0.35:
        add('warning', 'NO_REST', f'only {100 * rest:.0f}% of the runtime is free of SFX (target >= 35%): let the voice and the big hits breathe')
    for fam, n in fams.most_common():
        if n > 4:
            add('warning', 'CATEGORY_FATIGUE', f'"{fam}" family used {n}x: the ear hears the same gesture even when files differ')
    keys = list(fp)
    import numpy as np
    for x in range(len(keys)):
        for y in range(x + 1, len(keys)):
            if keys[x][1] != keys[y][1] and float(np.dot(fp[keys[x]], fp[keys[y]])) > 0.97:
                add('warning', 'SOUNDALIKE', f'{keys[x][1][-35:]} @{keys[x][0]:.1f}s ~ {keys[y][1][-35:]} @{keys[y][0]:.1f}s sound alike')
    loud = None
    if a.mix:
        loud = ebur(a.mix)
        if abs(loud['I'] + 14) > 1 or loud['TP'] > -1:
            add('error', 'LOUDNESS', f'I {loud["I"]} LUFS, TP {loud["TP"]} dBTP (target -14 +/- 1, <= -1)')
    errs = sum(f['severity'] == 'error' for f in F)
    print(f'# SFX audit: {a.cues}\n{len(cues)} cues, {len(onsets)} onsets, {dur:.1f} s, {per_min:.0f}/min, rest {100 * rest:.0f}%'
          + (f', mix I {loud["I"]} LUFS TP {loud["TP"]} LRA {loud["LRA"]}' if loud else '') + f'. {errs} errors, {len(F) - errs} warnings.')
    print('families: ' + ', '.join(f'{k} {v}' for k, v in fams.most_common(8)))
    for f in sorted(F, key=lambda f: f['severity']):
        print(f"- {f['severity']}: {f['code']}: {f['msg']}")
    if a.json_out:
        Path(a.json_out).write_text(json.dumps({'cues': len(cues), 'onsets': len(onsets), 'per_min': per_min, 'rest': rest,
                                                'loudness': loud, 'findings': F}, indent=1))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
