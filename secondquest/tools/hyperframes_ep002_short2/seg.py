"""EP002 Short #2 ("The remake's impossible job"): the line selection and the episode-time -> Short-time map, shared by
stage_assets.py and build.py.

Bram's real EP002 narration (public/episodes/ep002/audio/narration.wav, words in episodes/ep002/timings.json) is cut
into SEGMENTS of whole approved lines, in the order below. Every cut point sits inside a real pause of the recording
(measured: < -30 dB under the peak for >= 60 ms), so no word or breath is split and no line is reworded or reordered
inside itself. Lines that Bram ran together in the episode stay together (l51-l53, l42-l50, l54-l62).

Angle (docs/publish/EP002/short2_hyperframes/CANDIDATES.md, candidate A): every "better" in a remake quietly changes the
memory. Hook = the silent hero who must now be given a voice (l51-l53); then the measurable upgrades vs the familiar
that is not measurable (l42-l50); payoff = the camera fix, "Which is good. Probably.", the impossible job (l54-l62).
None of these lines is in Short #1 (l03-l15, l17-l19, l22-l23, l125).
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
CUES = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())['cues']

# (episode start, episode end) — each boundary inside a measured pause
SEGMENTS = [
    (165.90, 168.00),   # l66  "Player one already knows everything."                    (pauses 165.53-166.05 / 167.74-168.23)
    (172.70, 178.55),   # l69  "They see three golden triangles ... a very bad decision." (pauses 172.50-172.91 / 178.29-178.76)
    (185.60, 194.75),   # l71-l74 "Player two?" ... "an extremely personal problem."    (pauses 185.49-185.77 / 194.50-194.98)
]
# v4 "Player Two" (Producer 2026-10-14, option B, comedy; v3.3 is kept at git tag short2-v3.3). After the voice: the
# punchline hold, the co-op vista (the ending he loved), the wordmark with Navi, the thumbnail sign.
CARD = 4.9              # VEND -> DUR: hold 0.45, vista 1.65, wordmark 0.6, card 2.2

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
