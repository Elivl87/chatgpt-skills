#!/usr/bin/env python3
"""EP002 Spanish dub, step 1 (v2): cut Bram's Spanish takes into segments, ONLY inside real silences.

  python3 scripts/ep002-es-lines.py    # -> audio/bram/ep002_es/segments.json

v1 cut every script line at the STT word times, which are only accurate to ~0.1 s: a line's tail could carry the
first sound of the next line (heard twice once the lines were moved apart) and some cuts fell inside a word
(Producer, 2026-10-07: "muchos cortes, o la narración se monta sobre otra narración"). v2:
  * a line boundary becomes a cut only if the take has a real pause there (>= MIN_PAUSE of quiet, found in the
    audio itself, within SEARCH s of where STT puts the next line's first word); the cut is the quietest point of
    that pause;
  * where Bram runs two lines together with no pause, they stay together as one segment (never cut mid-speech);
  * consecutive segments share their cut point, so laid end to end they give back the take exactly: no sound is
    ever duplicated or lost.
Each segment: {take, start, end, lines, anchor (its first line)}; times in seconds inside the take.
"""
import difflib, json, re, subprocess, unicodedata
from pathlib import Path
import numpy as np
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/bram/ep002_es'
FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 48000
HOP = 0.005                                  # energy frame, s
MIN_PAUSE, SEARCH, QUIET_DB = 0.06, 0.45, -30
ES = json.loads((ROOT / 'docs/publish/EP002/script_es.json').read_text())['lines']
PLAN = json.loads((ROOT / 'audio/bram/ep002/NARRATION_PLAN.json').read_text())


def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace('1998', 'mil novecientos noventa y ocho').replace('2026', 'dos mil veintiseis')
    return re.sub(r'[^a-z0-9 ]+', ' ', s).split()


def load(path):
    pcm = subprocess.run([FF, '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32)


def energy_db(x):
    h = int(SR * HOP); n = len(x) // h
    e = np.sqrt((x[:n * h].reshape(n, h) ** 2).mean(1) + 1e-12)
    return 20 * np.log10(e / (np.percentile(e, 99) + 1e-9))       # dB below the take's loud level


def pauses(db):
    """Quiet runs (start, end, quietest point) in seconds, at least MIN_PAUSE long."""
    q = db < QUIET_DB
    out, i = [], 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]:
                j += 1
            if (j - i) * HOP >= MIN_PAUSE:
                k = i + int(np.argmin(db[i:j]))
                out.append((i * HOP, j * HOP, (i + j) / 2 * HOP if (j - i) * HOP > .2 else k * HOP))
            i = j
        else:
            i += 1
    return out


def first_word_times(take, lines):
    words = json.loads((D / f'{take}.words.json').read_text())
    heard = [(tok, i) for i, w in enumerate(words) for tok in norm(w['w'])]
    script, owner = [], []
    for lid in lines:
        for tok in norm(ES[lid]):
            script.append(tok); owner.append(lid)
    first = {}
    sm = difflib.SequenceMatcher(None, script, [h[0] for h in heard], autojunk=False)
    for a, h, n in sm.get_matching_blocks():
        for k in range(n):
            first.setdefault(owner[a + k], words[heard[h + k][1]]['start'])
    return first, words


# approved retakes (take stem -> its lines), used in place of those lines of the block's take
RETAKES = {'B06': ('B06r_l135_l136', ['l135', 'l136'])}       # Q042: the B06 take stopped on "reconoce."


def takes():
    """(block id, take stem, lines, lines to leave out) in script order; a retake follows the take it patches."""
    for b in PLAN['blocks']:
        stem = next(p for p in D.glob(f"{b['id']}_*.mp3")).stem
        if b['id'] in RETAKES:
            rstem, rlines = RETAKES[b['id']]
            yield b['id'], stem, b['lines'], rlines
            yield b['id'], rstem, rlines, []
        else:
            yield b['id'], stem, b['lines'], []


def main():
    segs, report = [], []
    for bid, take, lines, skip in takes():
        b = {'id': bid, 'lines': lines}
        x = load(D / f'{take}.mp3'); dur = len(x) / SR
        db = energy_db(x); ps = pauses(db)
        first, words = first_word_times(take, b['lines'])
        lead_in = ps[0][2] if ps and ps[0][0] <= .02 else 0.0          # the take's leading silence
        cuts = [(b['lines'][0], max(0.0, min(lead_in, first[b['lines'][0]] - .02)))]
        for lid in b['lines'][1:]:
            t = first.get(lid)
            # STT often stretches a short first word ("y") over the pause before it, so the pause may start just
            # after the word's STT start: accept pauses that begin up to .2 s after it, nearest one wins
            near = [p for p in ps if t is not None and p[1] >= t - SEARCH and p[0] <= t + .2]
            if near:
                p = min(near, key=lambda p: max(0.0, p[0] - t, t - p[1]))
                cuts.append((lid, p[2]))
            else:
                report.append(f'{lid}: no pause before it in {take}, kept with the previous line')
        for i, (lid, c) in enumerate(cuts):
            end = cuts[i + 1][1] if i + 1 < len(cuts) else dur
            nxt = cuts[i + 1][0] if i + 1 < len(cuts) else None
            ls = b['lines'][b['lines'].index(lid):(b['lines'].index(nxt) if nxt else None)]
            if set(ls) & set(skip):
                if not set(ls) <= set(skip):
                    raise SystemExit(f'{take}: retake lines {skip} are not cut apart from {ls}')
                continue
            segs.append({'take': take + '.mp3', 'start': round(c, 4), 'end': round(end, 4), 'lines': ls, 'anchor': lid, 'block': b['id']})
    (D / 'segments.json').write_text(json.dumps(segs, ensure_ascii=False, indent=1))
    print(f'{len(segs)} segments for {sum(len(s["lines"]) for s in segs)} lines')
    for r in report:
        print('  ', r)


if __name__ == '__main__':
    main()
