"""EP001 Short #3 ("The work loop", Farming Simulator): the line selection and the episode-time -> Short-time map,
shared by stage_assets.py and build.py.

EP001's recorded narration (public/episodes/ep001_farming/audio/narration.wav; line times in episodes/ep001/timings.json
"cues") is cut into SEGMENTS of whole lines, each PLACED at its own Short time. Every cut sits inside a measured pause
(< -32 dB under the peak for >= 60 ms). EP001 has no word times, so words come from faster-whisper small.en
(ep001_words_whisper.json), clamped inside each line's cue and anchored on the cue start.

Order (Producer 2026-10-19: "el orden decídelo tú, dale coherencia"): the work week (l01-l04) -> the farm's real enemy
(l11-l12) -> "and then... go back to work." (l05-l06) as the button, so the last line leads into the first ("wake up").
Storyboard: docs/publish/EP001/SHORT3_STORYBOARD_v2.md. Loop: the last frame is frame 0.
"""
import json, re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
CUES = json.loads((ROOT / 'episodes/ep001/timings.json').read_text())['cues']
WHISPER = json.loads((HERE / 'ep001_words_whisper.json').read_text())

# (episode start, episode end, Short time of the segment start) - boundaries inside measured pauses
SEGMENTS = [
    (0.20, 8.20, 0.45),      # l01-l04 "Farming Simulator is a game where you wake up... equipment..."  (0.00-0.42 / 7.93-8.50)
    (22.90, 29.30, 8.75),    # l11-l12 "Most of the time, your greatest enemy... than you expected."    (22.40-23.16 / 28.70-30.06)
    (8.30, 11.30, 15.90),    # l05-l06 "and then... go back to work."                                    (7.93-8.50 / 10.71-11.95)
]
LINES = ['l01', 'l02', 'l03', 'l04', 'l11', 'l12', 'l05', 'l06']
VOICE_END = round(SEGMENTS[-1][2] + SEGMENTS[-1][1] - SEGMENTS[-1][0], 3)
CARD = 2.5
DUR = round(VOICE_END + .25 + CARD + 1.0, 3)


def ep_to_short(t_ep):
    for a, b, at in SEGMENTS:
        if a <= t_ep <= b:
            return at + t_ep - a
    return None


def _ep_words():
    """{line: [(word, start, end)]} in episode time: the cue text split into words, timed by whisper, clamped."""
    norm = lambda s: re.sub(r'[^a-z]', '', s.lower())                   # noqa: E731
    wi, out = 0, {}
    for k in sorted(CUES, key=lambda k: CUES[k]['start']):
        c = CUES[k]; ws = c['text'].replace('...', '… ').split()
        ws = [w.replace('…', '...') for w in ws if w.strip('…')]
        res = []
        for i, w in enumerate(ws):
            while wi < len(WHISPER) and norm(WHISPER[wi][0]) != norm(w):
                wi += 1
            a, b = (WHISPER[wi][1], WHISPER[wi][2]) if wi < len(WHISPER) else (c['end'], c['end'])
            wi += 1
            a = c['start'] if i == 0 else min(max(a, c['start']), c['end'])
            b = min(max(b, a + .08), c['end'])
            if res and a < res[-1][2]:
                a = res[-1][2]
            res.append((w, round(a, 3), round(max(b, a + .05), 3)))
        out[k] = res
        if k == 'l19':
            break
    return out


def words():
    """[(line, text, start, end)] in Short time, in Short order."""
    E = _ep_words(); out = []
    for k in LINES:
        for w, a, b in E[k]:
            sa, sb = ep_to_short(a), ep_to_short(b)
            if sa is not None and sb is not None:
                out.append((k, w, round(sa, 3), round(sb, 3)))
    return sorted(out, key=lambda x: x[2])


def table():
    T = {}
    W = words()
    for k in LINES:
        ws = [w for w in W if w[0] == k]
        T[k] = ws[0][2]; T[k + '.end'] = ws[-1][3]
        for i, (_, _, a, b) in enumerate(ws):
            T[f'{k}.w{i + 1}'] = a; T[f'{k}.w{i + 1}.end'] = b
    for i, (_, _, at) in enumerate(SEGMENTS):
        T[f'S{i}'] = at
    T['VEND'] = VOICE_END; T['DUR'] = DUR
    return {k: round(v, 3) for k, v in T.items()}


if __name__ == '__main__':
    for k, w, a, b in words():
        print(f'{k} {a:6.2f}-{b:6.2f} {w}')
    print('voice end', VOICE_END, 'DUR', DUR)
