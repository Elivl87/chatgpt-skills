#!/usr/bin/env python3
"""Assemble the EP002 Bram narration master and derive one timing cue per script line.

  python3 scripts/ep002-bram-assemble.py

Inputs:  audio/bram/ep002/B01…B08 *.mp3, NARRATION_PLAN.json, STT_QC.json (scripts/ep002-bram-qc.py)
Outputs: public/episodes/ep002/audio/narration.wav   48 kHz mono, static gain to -20 LUFS
         episodes/ep002/timings.json                 one cue per script line (real timestamps)

Same method as scripts/bram-assemble.py (EP001): the voice is never stretched, pitched or
edited; blocks are placed end to end with silence between acts and one static gain.
"""
import importlib.util, json, re, sys
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
        for lid, (s, e) in zip(b['lines'], asm.line_times([lines[i] for i in b['lines']], qc[b['file']]['words'])):
            cues[lid] = {'start': round(t + s, 3), 'end': round(t + e, 3), 'text': lines[lid]['text']}
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
