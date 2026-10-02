#!/usr/bin/env python3
"""Assemble the official Bram narration master for EP001 and derive line timings.

  python3 scripts/bram-assemble.py

Inputs (audio/bram/):
  HOOK_M01_M15_bram_APPROVED.mp3   approved hook, reused verbatim (l01–l19)
  B01…B10 *.mp3                    Bram blocks for l20–l244 (NARRATION_PLAN_M16_M46.json)
  STT_QC.json                      word timestamps from the local STT check

Outputs:
  public/episodes/ep001_farming/audio/full/narration.wav   48 kHz mono, static gain to -20 LUFS
  episodes/ep001full/timings.json                          one cue per script line (real timestamps)

The voice is never stretched, pitched or edited: blocks are placed end to end
with silence between acts; only a single static gain is applied to the whole file.
"""
import difflib, json, re, subprocess, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FF = ROOT / 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg'
BRAM = ROOT / 'audio/bram'
SR = 48000
LEAD_IN = 0.30          # silence before the first word
AFTER_HOOK = 2.60       # hook "So... why?" → identity beat hold (M15: 3.8 s beat, wordmark ≥ 2.4 s)
BETWEEN_ACTS = 0.90     # act break
TAIL = 1.50             # after the last word (CTA)
TARGET_LUFS = -20.0

def decode(path):
    tmp = BRAM / '_decode_tmp.wav'
    subprocess.run([str(FF), '-v', 'error', '-y', '-i', str(path), '-ac', '1', '-ar', str(SR), '-c:a', 'pcm_s16le', str(tmp)], check=True)
    with wave.open(str(tmp), 'rb') as w:
        pcm = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32) / 32768
    tmp.unlink()
    return pcm

def norm(t):
    t = t.lower().replace('\u2019', "'").replace('11 p.m', 'eleven pm').replace('p.m', 'pm')
    return re.sub(r"[^a-z0-9' ]", ' ', t).split()

def hyp_tokens(words):
    toks = []
    for w in words:
        for x in norm(w['w']):
            toks.append((x, w['s'], w['e']))
    return toks

def line_times(lines, words):
    """Map every script line to [start, end] using the STT words of its block."""
    ref, owner = [], []
    for i, l in enumerate(lines):
        for x in norm(l['text']):
            ref.append(x); owner.append(i)
    hyp = hyp_tokens(words)
    sm = difflib.SequenceMatcher(a=ref, b=[h[0] for h in hyp], autojunk=False)
    starts, ends = [None] * len(lines), [None] * len(lines)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'delete' or j1 == j2:
            continue
        for k in range(i1, i2):  # spread ref tokens over the matched hyp span
            j = j1 + (k - i1) * (j2 - j1) // max(1, i2 - i1)
            o = owner[k]
            s, e = hyp[j][1], hyp[min(j2 - 1, j + max(0, (j2 - j1) // max(1, i2 - i1) - 1))][2]
            starts[o] = s if starts[o] is None else min(starts[o], s)
            ends[o] = e if ends[o] is None else max(ends[o], e)
    missing = [lines[i]['id'] for i in range(len(lines)) if starts[i] is None]
    if missing:
        raise SystemExit(f'LINES_WITHOUT_AUDIO: {missing}')
    return list(zip(starts, ends))

def main():
    script = json.load(open(ROOT / 'episodes/ep001full/script.json'))
    lines = {l['id']: l for l in script['lines']}
    order = [l['id'] for l in script['lines']]
    plan = json.load(open(BRAM / 'NARRATION_PLAN_M16_M46.json'))
    qc = json.load(open(BRAM / 'STT_QC.json'))
    segments = [('HOOK_M01_M15_bram_APPROVED.mp3', order[:19])] + [(b['file'], b['lines']) for b in plan['blocks']]
    gaps = [AFTER_HOOK] + [BETWEEN_ACTS] * (len(segments) - 2) + [TAIL]

    out = [np.zeros(int(LEAD_IN * SR), np.float32)]
    t = LEAD_IN
    cues = {}
    for (f, ids), gap in zip(segments, gaps):
        pcm = decode(BRAM / f)
        for lid, (s, e) in zip(ids, line_times([lines[i] for i in ids], qc[f]['words'])):
            cues[lid] = {'start': round(t + s, 3), 'end': round(t + e, 3), 'text': lines[lid]['text']}
        out.append(pcm)
        t += len(pcm) / SR
        out.append(np.zeros(int(gap * SR), np.float32)); t += gap
    audio = np.concatenate(out)

    # static gain to TARGET_LUFS (measured with FFmpeg ebur128 on the assembled master)
    tmp = BRAM / '_master_tmp.wav'
    write_wav(tmp, audio)
    meas = subprocess.run([str(FF), '-hide_banner', '-nostats', '-i', str(tmp), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                          capture_output=True, text=True).stderr
    lufs = float(json.loads(meas[meas.rindex('{'):meas.rindex('}') + 1])['input_i'])
    gain = 10 ** ((TARGET_LUFS - lufs) / 20)
    peak = float(np.abs(audio).max()) * gain
    if peak > 0.97:
        gain *= 0.97 / peak
    audio = audio * gain
    tmp.unlink()
    dst = ROOT / 'public/episodes/ep001_farming/audio/full/narration.wav'
    write_wav(dst, audio)

    # STT gives single short words (e.g. "Messages.") near-zero length: give every cue at least
    # 0.45 s, never running into the next line
    for i, lid in enumerate(order):
        c = cues[lid]
        nxt = cues[order[i + 1]]['start'] if i + 1 < len(order) else c['end'] + 1
        c['end'] = round(min(max(c['end'], c['start'] + 0.45), max(c['end'], nxt - 0.02)), 3)
    for i in range(1, len(order)):  # cues must not overlap
        a, b = cues[order[i - 1]], cues[order[i]]
        if b['start'] < a['end']:
            mid = round((a['end'] + b['start']) / 2, 3); a['end'] = mid; b['start'] = mid
    timings = {'source': 'audio/full/narration.wav',
               'generatedBy': 'higgsfield:text2speech_v2:elevenlabs:Bram (549ff70a-3ee7-4f04-a4d9-89a24fab7709)',
               'alignment': 'faster-whisper small.en word timestamps, mapped to script lines',
               'duration': round(len(audio) / SR, 3),
               'cues': {k: cues[k] for k in order}}
    json.dump(timings, open(ROOT / 'episodes/ep001full/timings.json', 'w'), indent=2, ensure_ascii=False)
    print(json.dumps({'duration': timings['duration'], 'measured_lufs': lufs, 'gain_db': round(20 * np.log10(gain), 2),
                      'hook_end_l19': cues['l19']['end'], 'cues': len(cues)}))

def write_wav(path, audio):
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(audio, -1, 1) * 32767).astype('<i2')
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

if __name__ == '__main__':
    main()
