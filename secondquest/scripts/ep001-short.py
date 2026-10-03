#!/usr/bin/env python3
"""EP001 vertical Short (1080x1920): the hook (s01–s15), re-framed from the approved full-episode scenes.

  python3 scripts/ep001-short.py

Reads episodes/ep001full/scenes.json and writes episodes/ep001short/scenes.json.

Every scene is viewed through a 9:16 window centred on its subject:
- background: cover-scaled to the 1920 px height, `focus` keeps the subject in view;
- layers: mapped with the same geometry (x around the window centre, sizes ×16:9→9:16),
  then capped so no art is ever drawn larger than its file;
- per-scene overrides re-place what does not fit a tall frame (text, counters, split screen);
- burned-in subtitles (style "subtitle") are added from the Bram line timings.
Data only: no art is created or modified.
"""
import copy, json, math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'episodes/ep001full/scenes.json'
OUT = ROOT / 'episodes/ep001short/scenes.json'
W, H = 1080, 1920
K = (16 / 9) / (9 / 16)  # 16:9 frame x-units per 9:16 frame x-unit at equal bg height (3.16)
CAP_ZOOM = 1.18          # camera headroom when capping art size
SUB_Y = 0.70             # subtitle line (clear of Shorts UI at the bottom and right)

cat = json.loads((ROOT / 'shared/art_catalog.json').read_text())['assets']
legacy = json.loads((ROOT / 'shared/assets.json').read_text())['assets']
timings = json.loads((ROOT / 'episodes/ep001full/timings.json').read_text())['cues']

def entry(k):
    return cat.get(k) or legacy.get(k)

def native(k):
    w, h = map(int, entry(k)['resolution'].split('x'))
    return w, h

def is_bg(l):
    e = entry(l.get('asset', ''))
    return bool(e) and e.get('kind') == 'background'

def mx(x, c):
    return 0.5 + (x - c) * K

def focus(c):
    """objectPosition x that puts landscape-frame x=c at the centre of the 9:16 window."""
    iw = H * 16 / 9
    p = (iw * c - W / 2) / (iw - W)
    return [round(min(1, max(0, p)), 4), 0.5]

def cap(l):
    """Never draw art larger than its file (with camera headroom)."""
    k = l.get('asset')
    if not k or not entry(k) or is_bg(l):
        return
    nw, nh = native(k)
    if 'height' in l:
        l['height'] = round(min(l['height'], nh / (H * CAP_ZOOM)), 4)
    if 'width' in l:
        l['width'] = round(min(l['width'], nw / (W * CAP_ZOOM)), 4)

def geo(l, c):
    """Map a landscape layer into the 9:16 window centred on landscape x=c."""
    l = copy.deepcopy(l)
    t = l.get('type')
    if t == 'group':
        return l
    if is_bg(l):
        l['focus'] = focus(c)
        return l
    if 'x' in l and t not in ('text', 'counter', 'stamp', 'progress', 'wordmark', 'rect'):
        l['x'] = round(mx(l['x'], c), 4)
    if 'width' in l and l.get('asset'):
        l['width'] = round(l['width'] * K, 4)
    if 'region' in l:
        r = l['region']
        x0, x1 = mx(r['x'], c), mx(r['x'] + r['w'], c)
        x0, x1 = max(0.02, x0), min(0.98, x1)
        if x1 - x0 < 0.2:
            x0, x1 = 0.3, 0.7
        l['region'] = {**r, 'x': round(x0, 3), 'w': round(x1 - x0, 3)}
    if t == 'light' and 'radius' in l:
        l['radius'] = round(min(1.2, l['radius'] * 1.6), 3)
    cap(l)
    return l

def pair(tractor, rider, tx, ty, k):
    """Scale the tractor_side rider + tractor_small pair together (keeps Quest on the seat)."""
    t, r = copy.deepcopy(tractor), copy.deepcopy(rider)
    dx = (r['x'] - t['x']) * 1920 * k
    dy = (r['y'] - t['y']) * 1080 * k
    t['x'], t['y'], t['width'] = tx, ty, round(t['width'] * 1920 * k / W, 4)
    r['x'], r['y'], r['height'] = round(tx + dx / W, 4), round(ty + dy / H, 4), round(r['height'] * 1080 * k / H, 4)
    return t, r

def calm_camera(cam, zoom_max=1.02):
    """Keep zoom/punch/shake; drop horizontal pans (they were composed for 16:9)."""
    cam = copy.deepcopy(cam or {})
    st = cam.get('start')
    if st:
        st['x'] = 0.5
        if 'zoom' in st:
            st['zoom'] = min(st['zoom'], zoom_max)
        st.pop('y', None)
    moves = []
    for m in cam.get('moves', []):
        if m['type'] in ('pan_left', 'pan_right'):
            continue
        if m['type'] == 'move_to':
            m = {**m, 'x': 0.5, 'zoom': min(m.get('zoom', 1), zoom_max)}
            m.pop('y', None)
        if 'amount' in m:  # gentler push/punch: the 9:16 window is already a tight crop
            m = {**m, 'amount': round(m['amount'] * 0.6, 4)}
        moves.append(m)
    cam['moves'] = moves
    return cam

# --- per-scene framing: window centre (landscape x) + overrides by layer index -------------
FRAME = {
    's01_wake':   (0.74, {3: {'x': 0.80, 'y': 0.5}, 4: {'x': 0.1, 'y': 0.9, 'width': 1.6}}),
    's02_work':   (0.40, {2: {'x': 0.5, 'y': 0.12}, 3: {'x': 0.86, 'height': 0.17}}),
    's03_money':  (0.38, {3: {'x': 0.78, 'y': 0.92, 'height': 0.2}, 5: {'x': 0.5, 'y': 0.12}}),
    's04_tractor': (0.62, {1: {'x': 0.7, 'y': 0.9}, 3: {'x': 0.16, 'y': 0.93, 'height': 0.3},
                           4: {'x': 0.36, 'y': 0.93, 'height': 0.12}, 5: {'x': 0.36, 'y': 0.93, 'height': 0.12},
                           6: {'x': 0.5, 'y': 0.25}, 7: {'x': 0.5, 'y': 0.11}}),
    's05_home':   (0.30, {6: {'x': 0.5, 'y': 0.2}}),
    's07_dragon': (0.52, {4: {'x': 0.5, 'y': 0.4}}),
    's08_gunfight': (0.46, {3: {'x': 0.5, 'y': 0.4}}),
    's09_princess': (0.38, {3: {'x': 0.5, 'y': 0.4}}),
    's10_enemy':  (0.46, {3: {'x': 0.72, 'width': 0.95}, 4: {'x': 0.33, 'height': 0.5}, 5: {'x': 0.9, 'height': 0.2}}),
    's11_field':  (0.50, {}),
    's12_millions': (0.50, {2: {'height': 0.07, 'region': {'x': 0.08, 'y': 0.12, 'w': 0.84, 'h': 0.46}}}),
    's14_bigger_tractor': (0.50, {2: {'x': 0.6, 'height': 0.5}, 3: {'x': 0.27, 'height': 0.34},
                                  4: {'x': 0.5, 'height': 0.15}, 7: {'x': 0.5, 'y': 0.17, 'size': 120},
                                  8: {'x': 0.8, 'height': 0.16}}),
    's15_sunset': (0.36, {}),
}

def scene_s06(src):
    """Split screen becomes top (office) / bottom (farm) panels."""
    s = copy.deepcopy(src)
    office, farm, divider, grind = s['layers']
    for g, y0, frm in ((office, 0.0, 'up'), (farm, 0.5, 'down')):
        g['clip'] = {'x': 0, 'y': y0, 'w': 1, 'h': 0.5}
        g['camera'] = {'start': {'zoom': 1.06}, 'moves': [{'type': 'push_in', 'amount': 0.05}]}
        for a in g.get('animations', []):
            if a['type'] == 'slide_in':
                a['from'], a['distance'] = frm, 960
    ol = office['layers']
    ol[0]['focus'] = focus(0.42)
    ol[1].update({'x': 0.46, 'y': 0.76, 'height': 0.44})
    ol[2].update({'x': 0.5, 'y': 0.3, 'size': 40})
    fl = farm['layers']
    fl[0]['focus'] = focus(0.5)
    t, r = pair(fl[2], fl[1], 0.7, 0.73, 0.95)
    fl[1], fl[2] = r, t
    fl[3].update({'x': 0.3, 'y': 0.76, 'height': 0.4})
    fl[4].update({'x': 0.5, 'y': 0.3, 'size': 40})
    for l in ol + fl:
        cap(l)
    divider.update({'x': 0.5, 'y': 0.5, 'w': 1, 'h': 0.004})
    grind.update({'x': 0.86, 'y': 0.5, 'height': 0.11})
    cap(grind)
    return s

def scene_s13(src):
    """One station per beat: each Quest shows with its own station background."""
    s = copy.deepcopy(src)
    L = s['layers']
    for i in (0, 1, 2):
        L[i]['focus'] = focus(0.5)
    a, b, c = 'l15-0.05', 'l16-0.05', None
    L[3].update({'x': 0.5, 'y': 0.86, 'height': 0.34, 'hide': a})
    L[5].update({'x': 0.38, 'y': 0.86, 'height': 0.34, 'show': a, 'hide': b})
    L[4].update({'x': 0.74, 'y': 0.86, 'height': 0.12, 'show': a, 'hide': b})
    L[7].update({'x': 0.42, 'y': 0.86, 'height': 0.34, 'show': b})
    L[6].update({'x': 0.76, 'y': 0.86, 'height': 0.12, 'show': b})
    L[8].update({'x': 0.5, 'y': 0.1, 'width': 0.8})
    for l in L:
        cap(l)
    return s

def scene_s15(src, c):
    s = copy.deepcopy(src)
    L = s['layers']
    out = []
    for l in L:
        t = l.get('type')
        if t == 'wordmark':
            out.append({**l, 'x': 0.5, 'y': 0.36})
            out.append({'type': 'text', 'style': 'ui', 'text': {'en': 'FULL EPISODE ON THE CHANNEL', 'es': 'EPISODIO COMPLETO EN EL CANAL'},
                        'x': 0.5, 'y': 0.47, 'size': 40, 'show': 'l19+0.6'})
            continue
        out.append(geo(l, c))
    s['layers'] = out
    s['camera'] = {'start': {'zoom': 1.0}, 'moves': [], 'parallax': src['camera'].get('parallax', 0.45), 'drift': 0.5}
    return s

def chunks(text, n=20):
    rows, cur = [], ''
    for w in text.split():
        if cur and len(cur) + 1 + len(w) > n:
            rows.append(cur); cur = w
        else:
            cur = f'{cur} {w}' if cur else w
    if cur:
        rows.append(cur)
    return ['\n'.join(rows[i:i + 2]) for i in range(0, len(rows), 2)]

def subtitles(lid):
    """One subtitle layer per caption chunk, timed inside the line's cue."""
    cue = timings[lid]
    parts = chunks(cue['text'])
    dur = cue['end'] - cue['start']
    total = sum(len(p) for p in parts)
    out, t = [], 0.0
    for i, p in enumerate(parts):
        d = dur * len(p) / total
        layer = {'type': 'text', 'style': 'subtitle', 'text': {'en': p}, 'x': 0.5, 'y': SUB_Y, 'depth': 'screen',
                 'show': f'{lid}+{round(t, 2)}' if t else lid,
                 'animations': [{'type': 'pop_in', 'at': f'{lid}+{round(t, 2)}' if t else lid, 'duration': 0.12}]}
        if i < len(parts) - 1:
            layer['hide'] = f'{lid}+{round(t + d, 2)}'
        else:
            nxt = f"l{int(lid[1:]) + 1:02d}"
            layer['hide'] = nxt if nxt in timings and timings[nxt]['start'] - cue['end'] < 0.5 else f'{lid}.end+0.25'
        out.append(layer)
        t += d
    return out

def scene_start(s):
    st = s['start']
    if isinstance(st, (int, float)):
        return st
    base, _, off = st.replace('-', '+-').partition('+')
    ref = timings[base.split('.')[0]]
    t = ref['end'] if base.endswith('.end') else ref['start']
    return t + (float(off) if off else 0)

def main():
    src = {s['id']: s for s in json.loads(SRC.read_text())['scenes']}
    order = ['s01_wake', 's02_work', 's03_money', 's04_tractor', 's05_home', 's06_split', 's07_dragon', 's08_gunfight',
             's09_princess', 's10_enemy', 's11_field', 's12_millions', 's13_chores', 's14_bigger_tractor', 's15_sunset']
    scenes = []
    for sid in order:
        s0 = src[sid]
        if sid == 's06_split':
            s = scene_s06(s0)
        elif sid == 's13_chores':
            s = scene_s13(s0)
            s['camera'] = calm_camera(s0.get('camera'))
        elif sid == 's15_sunset':
            s = scene_s15(s0, FRAME[sid][0])
        else:
            c, ov = FRAME[sid]
            s = copy.deepcopy(s0)
            s['layers'] = [geo(l, c) for l in s0['layers']]
            for i, o in ov.items():
                s['layers'][i].update(o)
                cap(s['layers'][i])
            s['camera'] = calm_camera(s0.get('camera'))
        scenes.append(s)
    # subtitles go to the scene in which each line starts
    starts = [(scene_start(s), s) for s in scenes]
    for i in range(1, 20):
        lid = f'l{i:02d}'
        t = timings[lid]['start']
        host = [s for st, s in starts if st <= t + 1e-6][-1]
        host['layers'].extend(subtitles(lid))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({'episode': 'ep001short',
                               'notes': 'Generated by scripts/ep001-short.py from episodes/ep001full/scenes.json (hook s01–s15, 9:16). Do not edit by hand.',
                               'scenes': scenes}, indent=1, ensure_ascii=False) + '\n')
    print(f'{len(scenes)} scenes -> {OUT.relative_to(ROOT)}')

if __name__ == '__main__':
    main()
