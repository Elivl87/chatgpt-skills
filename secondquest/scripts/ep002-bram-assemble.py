#!/usr/bin/env python3
"""Assemble the EP002 Bram narration master and derive one timing cue per script line.

  python3 scripts/ep002-bram-assemble.py

Inputs:  audio/bram/ep002/B01…B08 *.mp3, NARRATION_PLAN.json, STT_QC.json (scripts/ep002-bram-qc.py)
Outputs: public/episodes/ep002/audio/narration.wav   48 kHz mono, static gain to -20 LUFS
         episodes/ep002/timings.json                 one cue per script line (real timestamps)

Same method as scripts/bram-assemble.py (EP001): the voice is never stretched, pitched or
edited; blocks are placed end to end with silence between acts and one static gain.
"""
import difflib, importlib.util, json, re, sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('ep001asm', ROOT / 'scripts/bram-assemble.py')
asm = importlib.util.module_from_spec(spec); spec.loader.exec_module(asm)

DIR = ROOT / 'audio/bram/ep002'
SR = asm.SR
LEAD_IN = 0.30
AFTER_HOOK = 2.00      # "So, why?" → Act 1
BETWEEN_ACTS = 0.90
BEFORE_CTA = 3.00      # Scene Book 29: HOLD on "you both grew up."
TAIL = 1.50
NUM = {'1998': 'nineteen ninety eight', '2026': 'twenty twenty six', '64': 'sixty four', '2': 'two',
       '28': 'twenty eight'}

def norm(t):
    t = t.lower().replace('’', "'").replace('-', ' ')
    for k, v in NUM.items():
        t = re.sub(rf'\b{re.escape(k)}\b', v, t)
    return re.sub(r"[^a-z0-9' ]", ' ', t).split()

asm.norm = norm  # line_times() uses the module-level norm

def word_times(lines, words):
    """Per script word [start, end] (block-relative), aligned to the STT words of the block."""
    ref, owner = [], []  # owner = (line index, display-word index)
    display = []
    for i, l in enumerate(lines):
        ws = l['text'].split()
        display.append(ws)
        for k, w in enumerate(ws):
            for x in norm(w):
                ref.append(x); owner.append((i, k))
    hyp = asm.hyp_tokens(words)
    sm = difflib.SequenceMatcher(a=ref, b=[h[0] for h in hyp], autojunk=False)
    tok = [None] * len(ref)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'delete' or j1 == j2:
            continue
        for k in range(i1, i2):
            j = j1 + (k - i1) * (j2 - j1) // max(1, i2 - i1)
            jj = min(j2 - 1, j + max(0, (j2 - j1) // max(1, i2 - i1) - 1))
            tok[k] = (hyp[j][1], hyp[jj][2])
    out = [[[None, None] for _ in ws] for ws in display]
    for (i, k), t in zip(owner, tok):
        if t is None:
            continue
        cur = out[i][k]
        cur[0] = t[0] if cur[0] is None else min(cur[0], t[0])
        cur[1] = t[1] if cur[1] is None else max(cur[1], t[1])
    for i, ws in enumerate(out):  # words the STT missed: squeeze between their neighbours
        for k, w in enumerate(ws):
            if w[0] is None:
                prev = next((x[1] for x in reversed(ws[:k]) if x[1] is not None), None)
                nxt = next((x[0] for x in ws[k + 1:] if x[0] is not None), None)
                a = prev if prev is not None else nxt
                b = nxt if nxt is not None else prev
                w[0], w[1] = a, b
    return [[{'w': display[i][k], 'start': ws[k][0], 'end': ws[k][1]} for k in range(len(ws))] for i, ws in enumerate(out)]

def main():
    script = json.loads((ROOT / 'episodes/ep002/script.json').read_text())
    lines = {l['id']: l for l in script['lines']}
    order = [l['id'] for l in script['lines']]
    plan = json.loads((DIR / 'NARRATION_PLAN.json').read_text())
    qc = json.loads((DIR / 'STT_QC.json').read_text())
    blocks = plan['blocks']
    gaps = [AFTER_HOOK] + [BETWEEN_ACTS] * (len(blocks) - 3) + [BEFORE_CTA, TAIL]

    out, t, cues = [np.zeros(int(LEAD_IN * SR), np.float32)], LEAD_IN, {}
    for b, gap in zip(blocks, gaps):
        pcm = asm.decode(DIR / b['file'])
        blines = [lines[i] for i in b['lines']]
        wt = word_times(blines, qc[b['file']]['words'])
        for lid, (s, e), ws in zip(b['lines'], asm.line_times(blines, qc[b['file']]['words']), wt):
            cues[lid] = {'start': round(t + s, 3), 'end': round(t + e, 3), 'text': lines[lid]['text'],
                         'words': [{'w': w['w'], 'start': round(t + w['start'], 3), 'end': round(t + w['end'], 3)} for w in ws]}
        out.append(pcm); t += len(pcm) / SR
        out.append(np.zeros(int(gap * SR), np.float32)); t += gap
    audio = np.concatenate(out)

    tmp = DIR / '_master_tmp.wav'
    asm.write_wav(tmp, audio)
    import subprocess
    meas = subprocess.run([str(asm.FF), '-hide_banner', '-nostats', '-i', str(tmp), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                          capture_output=True, text=True).stderr
    tmp.unlink()
    lufs = float(json.loads(meas[meas.rindex('{'):meas.rindex('}') + 1])['input_i'])
    gain = 10 ** ((asm.TARGET_LUFS - lufs) / 20)
    peak = float(np.abs(audio).max()) * gain
    if peak > 0.97:
        gain *= 0.97 / peak
    audio = audio * gain
    asm.write_wav(ROOT / 'public/episodes/ep002/audio/narration.wav', audio)

    for i, lid in enumerate(order):  # minimum cue length, never into the next line
        c = cues[lid]
        nxt = cues[order[i + 1]]['start'] if i + 1 < len(order) else c['end'] + 1
        c['end'] = round(min(max(c['end'], c['start'] + 0.45), max(c['end'], nxt - 0.02)), 3)
    for i in range(1, len(order)):
        a, b = cues[order[i - 1]], cues[order[i]]
        if b['start'] < a['end']:
            mid = round((a['end'] + b['start']) / 2, 3); a['end'] = mid; b['start'] = mid
    timings = {'source': 'audio/narration.wav',
               'generatedBy': 'higgsfield:text2speech_v2:elevenlabs:Bram (549ff70a-3ee7-4f04-a4d9-89a24fab7709)',
               'alignment': 'faster-whisper small.en word timestamps, mapped to script lines',
               'duration': round(len(audio) / SR, 3), 'cues': {k: cues[k] for k in order}}
    (ROOT / 'episodes/ep002/timings.json').write_text(json.dumps(timings, indent=2, ensure_ascii=False))
    print(json.dumps({'duration': timings['duration'], 'measured_lufs': lufs, 'gain_db': round(20 * np.log10(gain), 2), 'cues': len(cues),
                      'acts': {a['act']: [cues[a['from']]['start'], cues[a['to']]['end']] for a in script['acts']}}, indent=1, ensure_ascii=False))

main()
