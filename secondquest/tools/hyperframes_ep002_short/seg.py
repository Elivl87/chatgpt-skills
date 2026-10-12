"""EP002 trailer Short: the line selection and the episode-time -> Short-time map, shared by stage_assets.py and build.py.

Bram's real EP002 narration (public/episodes/ep002/audio/narration.wav, words in episodes/ep002/timings.json) is cut
into SEGMENTS of whole approved lines, in the order below. Every cut point sits inside a real pause of the recording
(measured: < -30 dB under the peak for >= 60 ms), so no word or breath is split and no line is reworded or reordered
inside itself. Lines that Bram ran together in the episode stay together (l03-l06, l11-l15, l17-l19, l22-l23, l09-l10).

Spine = the approved Python trailer (scripts/ep002-short1-trailer.py: l07-l08 hook, l03-l06 anchors, l09-l10 close);
between the anchors and the close, approved lines of the same episode script carry the thesis (the memory is the game
plus the room; you were smaller; the person holding the controller is different) to reach Shorts length.
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
CUES = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())['cues']

# (episode start, episode end) — each boundary inside a measured pause
SEGMENTS = [
    (17.20, 21.62),     # l07-l08  "But there is one thing Nintendo cannot rebuild from the ground up." "You."   (hook)
    (7.60, 16.90),      # l03-l06  "New graphics. An orchestra. Voices. Modern controls. A new camera." + the same ocarina/sword/Triforce
    (29.05, 41.45),     # l11-l15  "Because the Ocarina of Time people remember..." "It is the game... plus the room..."
    (49.10, 57.05),     # l17-l19  "For some players, walking into Hyrule Field felt enormous. Not because... Because you were smaller."
    (65.40, 71.55),     # l22-l23  "Nobody wakes up thinking: Man... I really miss Nintendo 64 texture filtering."
    (321.85, 325.60),   # l125     "But the person holding the controller is different."
    (21.65, 28.40),     # l09-l10  "And somehow, that might be exactly why we want to go back." "So, why?" + 1.54 s of its silence
]
CARD = 2.6              # end card FULL EPISODE ON THE CHANNEL (silent but for its chime)

OFFSETS = []
_o = 0.0
for a, b in SEGMENTS:
    OFFSETS.append(_o); _o += b - a
VOICE_END = round(_o, 3)
DUR = round(VOICE_END + CARD, 3)

LINES = []                                   # lines in Short order
for (a, b) in SEGMENTS:
    LINES += [k for k, c in sorted(CUES.items(), key=lambda kv: kv[1]['start']) if a <= c['start'] and c['end'] <= b + .05]


def ep_to_short(t_ep, line=None):
    for (a, b), o in zip(SEGMENTS, OFFSETS):
        if a <= t_ep <= b:
            return o + t_ep - a
    raise ValueError(f'episode time {t_ep} ({line}) is outside the selection')


def table():
    """Word-token table in Short time: l07, l07.end, l07.w3, l07.w3.end, + DUR, VEND, S0..S6 (segment starts)."""
    T = {}
    for k in LINES:
        c = CUES[k]
        T[k] = ep_to_short(c['start'], k); T[k + '.end'] = ep_to_short(min(c['end'], c['words'][-1]['end']), k)
        for i, w in enumerate(c['words']):
            T[f'{k}.w{i + 1}'] = ep_to_short(w['start'], k); T[f'{k}.w{i + 1}.end'] = ep_to_short(w['end'], k)
    for i, o in enumerate(OFFSETS):
        T[f'S{i}'] = o
    T['VEND'] = VOICE_END; T['DUR'] = DUR
    return {k: round(v, 3) for k, v in T.items()}


def words():
    """[(line, text, start, end)] in Short time, for the burned-in captions."""
    out = []
    for k in LINES:
        for w in CUES[k]['words']:
            out.append((k, w['w'], round(ep_to_short(w['start'], k), 3), round(ep_to_short(w['end'], k), 3)))
    return out


if __name__ == '__main__':
    T = table()
    print('lines:', ' '.join(LINES))
    for (a, b), o in zip(SEGMENTS, OFFSETS):
        print(f'  ep {a:7.2f}-{b:7.2f}  ->  short {o:6.2f}-{o + b - a:6.2f}')
    print('voice end', VOICE_END, 'DUR', DUR)
