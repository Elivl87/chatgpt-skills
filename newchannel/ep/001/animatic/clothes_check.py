#!/usr/bin/env python3
"""Clothing audit, step 2 (Producer 2026-10-16: «Las ropas a veces tienen desperfectos»).

  python3 clothes_check.py lab <dir with clothes_lab.json> <qc dir>
      every pose x view x set of the clothes lab (clothes_audit.mjs), flat light, exact wardrobe colours:
        parts (FAIL)  a garment part expected in that view is missing (interior pixels of its exact colour, per u^2)
        thin  (FAIL)  stray strokes / cords / stubs: silhouette thinner than ~2.6 ink widths outside head and hands
        pop   (FAIL)  a part appears / vanishes from one frame to the next (20 idle frames; pose blends k 0 -> 1)
  python3 clothes_check.py block <dir with faces.json (+ next-frame stats)> <block> <qc dir>
      the animatic's key acting frames (faces_audit.mjs, CLOTHES=1 adds the frame 1/30 s later):
        colour (FAIL) the garment colour families expected for the view are present on the character's own pixels
        thin   (FAIL) as above (only where the ink is >= 1.4 px, i.e. the character is big enough to judge)
        pop    (FAIL) between the frame and the next one (same shot) a garment family share jumps (pose / layer pop)
Writes qc/clothes_lab.json or qc/clothes_<block>.json and prints every failure.
"""
import json, os, sys

# ------------------------------------------------------------------ lab: expected parts (count / u^2 * 1e4)
STAND, CAR, GROUND = 'stand', 'car', 'ground'


OPEN_ARMS = {'stand', 'walk', 'point', 'hips', 'wave', 'scratch', 'fist', 'visor', 'shrug', 'palm', 'cheer', 'pump', 'open',
             'surprise', 'drive', 'driveFist', 'lap', 'sit', 'sitPoint'}


def expected(cid, view, kind, pose):
    """minimum interior pixels of each garment colour, per u^2 * 1e4, calibrated on the lab (about 1/3 of the smallest
    clean value of that part in that view): below it the part is missing / covered by something it should not be"""
    E = {}
    front, q, side, back, backq = (view == v for v in ('front', 'q', 'side', 'back', 'backq'))
    if cid == 'eli1':
        E['beanie'] = 8; E['tee'] = 40
        if front or q:
            E['apron'] = 100
            E['strap'] = 10 if kind == STAND else 1
        if side:
            E['apron'] = 30; E['strap'] = 5 if kind == STAND else 1
        if back or backq:
            E['strap'] = 1                      # the neck loop behind the collar
        if kind == STAND and backq:
            E['apron'] = 15                     # the skirt edge peeking past the body
        if kind == STAND or (not back and not (kind != STAND and backq)):
            E['band'] = 1
        if kind != CAR:
            E['boots'] = 10
            E['jeans'] = 40 if kind == STAND else (8 if (front or back) else 30)
    else:
        E['sweater'] = 80; E['overall'] = 60; E['hair'] = 50
        if (front or q) and pose in OPEN_ARMS:
            E['button'] = 0.3
        if back or backq:
            E['pocket'] = 1.5                   # the back patch / pockets
        if front or back:
            E['earring'] = 0.5
        if q or backq:
            E['earring'] = 0.3
        if kind != CAR:
            E['boots'] = 30
    return E


def lab(D, QC):
    d = json.load(open(os.path.join(D, 'clothes_lab.json')))
    fails, rows = [], []
    for P in d['parts']:
        kind = STAND if P['set'].startswith('stand') else P['set']
        for c in P['cells']:
            b = c['body']; u = c['u']; key = f"{P['id']}/{P['set']}/{c['view']}/{c['pose']}@{P['size']}"
            if P['size'] == 'big':   # exact interior colours need ~2.4 px ink; 1080 / draft are judged by eye + the block checks
                for part, mn in expected(P['id'], c['view'], kind, c['pose']).items():
                    v = b['pal'].get(part, 0) / (u * u) * 1e4
                    if v < mn:
                        fails.append(('parts', key, f"{part} missing ({v:.1f} < {mn})"))
            th = b.get('thin')
            if th and th['px']:
                fails.append(('thin', key, f"{th['px']} px of stray thin strokes, worst {th['worst']} ink long at {th['comps'][:2]}"))
            rows.append({'key': key, 'pal': b.get('pal'), 'thin': th})
    # popping over time and over pose blends: a part whose count jumps by > 45 % of its range and > 0.6 /u^2*1e4 in one
    # frame, when the neighbouring steps are calm (a pop, not motion)
    for src in ('time', 'blend'):
        for T in d.get(src, []):
            for ci, cell in enumerate(T['cells']):
                u = cell['u']
                series = [fr[ci]['pal'] for fr in T['series']]
                for part in series[0]:
                    v = [s[part] / (u * u) * 1e4 for s in series]
                    rng = max(v) - min(v)
                    for i in range(1, len(v)):
                        dv = abs(v[i] - v[i - 1])
                        calm = max([abs(v[j] - v[j - 1]) for j in range(1, len(v)) if j != i] or [0])
                        if cell['pose'] in ('clipboard', 'detective') and src == 'blend':
                            continue   # the prop fades in over the blend (by design, not a pop)
                        if dv > 2.0 and dv > 0.45 * max(rng, 1e-6) and dv > 2.5 * calm and dv > 0.25 * max(v[i], v[i - 1]):
                            fails.append(('pop', f"{T['id']}/{T['set']}/{cell['view']}/{cell['pose']} {src}", f"{part} {v[i-1]:.1f} -> {v[i]:.1f} at step {i}"))
    json.dump({'fail': len(fails), 'fails': fails, 'cells': len(rows)}, open(os.path.join(QC, 'clothes_lab.json'), 'w'), indent=1)
    print(f'clothes lab: {len(rows)} cell renders, {len(fails)} failures')
    for f in fails:
        print('  FAIL', f[0], f[1], f[2])
    return len(fails)


# ------------------------------------------------------------------ blocks
def block(D, B, QC):
    d = json.load(open(os.path.join(D, 'faces.json')))
    fails, n = [], 0
    for s in d['samples']:
        nxt = {f['id']: f for f in s.get('next', [])}
        for f in s['faces']:
            b = f.get('body') or {}
            if not b.get('box') or f.get('alpha', 1) < 0.9:
                continue
            n += 1
            hpx = b['box'][3] - b['box'][1]; cl = b['cl']; v = str(f['view']); key = f"{s['shot']} t{s['t']:.2f} {f['id']} {f['pose']}/{v}"
            if hpx >= 60 and b['px'] > 1500:
                if f['id'] == 'eli1':
                    if cl['white'] < 0.02:
                        fails.append(('colour', key, f"no tee white ({cl['white']:.3f})"))
                    if v in ('front', 'q', 'side') and cl['brown'] + cl['mustard'] < 0.02:
                        fails.append(('colour', key, f"no apron brown ({cl['brown']:.3f})"))
                    if not f.get('seated') and hpx >= 120 and cl['blue'] < 0.01:
                        fails.append(('colour', key, f"no jeans blue ({cl['blue']:.3f})"))
                else:
                    if cl['mustard'] + cl['brown'] + cl['yellow'] < 0.03:
                        fails.append(('colour', key, f"no overall mustard ({cl['mustard']:.3f})"))
                    if cl['purple'] < 0.02:
                        fails.append(('colour', key, f"no sweater purple ({cl['purple']:.3f})"))
                    if not f.get('seated') and hpx >= 120 and cl['green'] < 0.004:
                        fails.append(('colour', key, f"no green boots ({cl['green']:.3f})"))
            th = b.get('thin')
            if th and th['px']:
                fails.append(('thin', key, f"{th['px']} px of stray thin strokes, worst {th['worst']} ink long at {th['comps'][:2]}"))
            g = nxt.get(f['id'])
            if g and g.get('body') and g['body'].get('box') and hpx >= 40 and s.get('next_shot') == s['shot']:
                c2 = g['body']['cl']
                for k in ('white', 'brown', 'blue', 'purple', 'mustard', 'green', 'yellow'):
                    a, z = cl.get(k, 0), c2.get(k, 0)
                    if abs(a - z) > 0.03 and abs(a - z) > 0.35 * max(a, z):
                        fails.append(('pop', key, f"{k} share {a:.3f} -> {z:.3f} in 1/30 s"))
                pa, pb = b['px'], g['body']['px']
                if abs(pa - pb) > 0.18 * max(pa, pb) and abs(pa - pb) > 400:
                    fails.append(('pop', key, f"silhouette {pa} -> {pb} px in 1/30 s"))
    json.dump({'block': B, 'checked': n, 'fail': len(fails), 'fails': fails}, open(os.path.join(QC, f'clothes_{B}.json'), 'w'), indent=1)
    print(f'block {B}: {n} character draws checked, {len(fails)} clothing failures')
    for f in fails:
        print('  FAIL', f[0], f[1], f[2])
    return len(fails)


if __name__ == '__main__':
    if sys.argv[1] == 'lab':
        lab(sys.argv[2], sys.argv[3])
    else:
        block(sys.argv[2], sys.argv[3], sys.argv[4])
