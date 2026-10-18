"""EP003 Short #1 ("The friend who never buys it", loop): the line selection and the episode-time -> Short-time map,
shared by stage_assets.py and build.py.

Bram's real EP003 narration (public/episodes/ep003/audio/narration.wav, words in episodes/ep003/timings.json
"cues") is cut into SEGMENTS of whole approved lines. Every cut point sits inside a measured pause (< -32 dB under
the peak for >= 60 ms), so no word or breath is split and nothing is reworded. Unlike EP002 Short #2, each segment is
PLACED at its own Short time (AT): the gaps between them are designed beats (frame 0 before the first word, the comedy
hold after "later.").

Storyboard: docs/publish/EP003/short1/STORYBOARD_v1.md (approved 2026-10-18). Loop: the last frame is frame 0.
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ALIGN = json.loads((ROOT / 'episodes/ep003/timings.json').read_text())['cues']

# (episode start, episode end, Short time of the segment start) - each boundary inside a measured pause
SEGMENTS = [
    (14.95, 17.05, 0.56),    # h05 tail '"It's eight dollars. Just get it."'      (pauses 14.45-15.09 / 16.85-17.39)
    (17.25, 19.95, 2.96),    # h06 "Bought. Bought. Bought."                       (pauses 16.85-17.39 / 19.78-20.60)
    (20.45, 25.40, 5.91),    # h07 "And one friend who says ... He will not get it later."   (19.78-20.60 / 25.19-25.92)
    (25.80, 29.85, 12.05),   # h08 minus "And yet,": "Getting a few adults ... than anything in the game."  (25.19-25.92 / 29.64-30.20)
]
VOICE_END = round(SEGMENTS[-1][2] + SEGMENTS[-1][1] - SEGMENTS[-1][0], 3)
CARD = 2.6              # VEND+0.3 -> the end card (critic v1: <= ~2.5 s, never static and silent), then the 1.0 s loop seam
DUR = round(VOICE_END + .3 + CARD + 1.0, 3)
LINES = ['h05', 'h06', 'h07', 'h08']


def ep_to_short(t_ep):
    for a, b, at in SEGMENTS:
        if a <= t_ep <= b:
            return at + t_ep - a
    return None


def words():
    """[(line, text, start, end)] in Short time; words outside the selection (h05 "A message in a group chat.",
    h08 "And yet,") are dropped."""
    out = []
    for k in LINES:
        for w in ALIGN[k]['words']:
            a, b = ep_to_short(w['start']), ep_to_short(w['end'])
            if a is not None and b is not None:
                out.append((k, w['w'], round(a, 3), round(b, 3)))
    return out


def table():
    """Word-token table in Short time: h07.w3 = the 3rd KEPT word of h07 (1-based), h07.w3.end, h07, h07.end,
    + DUR, VEND, S0..S3 (segment placements)."""
    T = {}
    for k in LINES:
        ws = [w for w in words() if w[0] == k]
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
