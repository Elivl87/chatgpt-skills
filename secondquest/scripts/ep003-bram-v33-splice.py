#!/usr/bin/env python3
"""EP003 narration v3.3 (SCRIPT CHANGE PROPOSAL 02, hook / first block, approved 2026-10-17): a splice, no new voice
except the one approved Bram re-record (H8, audio/bram/ep003/B01b_H8.mp3).

  python3 scripts/ep003-bram-v33-splice.py           # writes the narration, the hook listen file and the timings
  python3 scripts/ep003-bram-v33-splice.py --qc      # + STT QC of the result against the v3.3 text

Source: public/episodes/ep003/audio/narration_bram.wav = the v3.2 Bram assembly (scripts/ep003-bram-assemble.py: the
seven Bram takes, unedited, one static gain). The hook and block B are re-cut from it at word boundaries (word times:
faster-whisper on this file; every cut point sits in a measured silence or breath dip, 10 ms frames, listed below),
each piece gets 10 ms equal-power (sine/cosine) edge fades, pauses are the takes' own pauses (+ a little digital
silence where a scene changes), and H8 is inserted before "millions…" with its loudness matched to its neighbours.
Everything from l12 ("Now compare that…") to the end is the v3.2 file byte for byte, only earlier: its word timings
are the v3.2 ones shifted by the same offset, so blocks C–G keep their exact internal timing.

Out: public/episodes/ep003/audio/narration.wav (active), narration_v33.wav (same), docs/ep003/voice_bram/
EP003_hook_v33_splice.wav (the hook alone, for listening), episodes/ep003/timings.json (+ timings_v33.json copy).
"""
import importlib.util, json, shutil, subprocess, sys
from pathlib import Path
import numpy as np, soundfile

ROOT = Path(__file__).resolve().parents[1]
EP = ROOT / 'episodes/ep003'
AUD = ROOT / 'public/episodes/ep003/audio'
SRC = AUD / 'narration_bram.wav'                 # v3.2 Bram assembly (gain -1.46 dB already applied)
H8 = ROOT / 'audio/bram/ep003/B01b_H8.mp3'
SR = 48000
FADE = .010
_spec = importlib.util.spec_from_file_location('v4', ROOT / 'scripts/ep003-narration-v4.py')
v4 = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(v4)

# (line ids, source, in, out, digital silence added after) - source times in seconds; why each cut is clean:
PIECES = [
    (['h01', 'h02', 'h03'], 'v32', 0.000, 11.210, 0.0),   # out: dip -65 dB after "face." + its breath (before "Gambling")
    (['h04'], 'v32', 15.050, 16.520, 0.25),                 # in: -68 dB before "It"; out: -42 dB dip after "dollars."
    (['h05'], 'v32', 49.860, 54.050, 0.0),                  # in: -69 dB before "A message"; out: -67 dB after "it."
    (['h06', 'h07'], 'v32', 56.400, 64.660, 0.50),          # in: -64 dB before "Bought." (drops "And then, one by one:")
    (['h08'], 'h8', 0.000, 4.800, 0.04),                    # the new take; out: -57 dB after the "t" of "yet,"
    (['h09', 'h10'], 'v32', 25.920, 35.960, 0.0),           # in: -61 dB before "Millions"; out: incl. the 1.6 s after "why?"
    (['b01'], 'v32', 35.960, 40.800, 0.0),                  # "Start with the price…"; out: -65 dB after "invitation."
    (['b02'], 'v32', 16.520, 25.620, 0.20),                 # in: the breath before "Its makers"; out: -64 dB after "million."
    (['b03'], 'v32', 40.800, 47.200, 0.40),                 # in: the breath before "Because"; out: -70 dB after "copy."
]
TAIL_FROM = 65.300                                          # v3.2 from here on (digital silence before "Now compare")
HOOK_LAST = 'h10'


def load_mp3(p):
    ff = ROOT / 'tools/hyperframes_ep003/.bin/ffmpeg'
    if not ff.exists():
        import imageio_ffmpeg; ff = imageio_ffmpeg.get_ffmpeg_exe()
    raw = subprocess.run([str(ff), '-v', 'error', '-i', str(p), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def lufs(x):
    import pyloudnorm as pyln
    return pyln.Meter(SR).integrated_loudness(x.astype(np.float64))


def fades(a):
    f = int(FADE * SR); u = np.linspace(0, np.pi / 2, f)
    a = a.copy(); a[:f] *= np.sin(u); a[-f:] *= np.cos(u)
    return a


def main():
    v32, sr = soundfile.read(str(SRC), dtype='float32'); assert sr == SR
    old = json.loads((EP / 'timings_bram.json').read_text())          # the v3.2 timings (== timings.json before v3.3)
    h8 = load_mp3(H8)
    # H8 loudness: Bram's take, the v3.2 static gain, then matched to the speech around it (H7 and H9 in the source)
    nb = np.concatenate([v32[int(59.7 * SR):int(64.66 * SR)], v32[int(26.0 * SR):int(31.3 * SR)]])
    g_db = lufs(nb) - lufs(h8)
    h8 = h8 * 10 ** (g_db / 20)
    src = {'v32': v32, 'h8': h8}
    parts, t, spans = [], 0.0, []
    for ids, s, a, b, pad in PIECES:
        seg = fades(src[s][int(round(a * SR)):int(round(b * SR))])
        spans.append((ids, s, a, t, t + len(seg) / SR))
        parts.append(seg); t += len(seg) / SR
        if pad:
            parts.append(np.zeros(int(round(pad * SR)), np.float32)); t += pad
    head = np.concatenate(parts)
    tail = v32[int(round(TAIL_FROM * SR)):]
    y = np.concatenate([head, tail])
    shift = len(head) / SR - TAIL_FROM
    hook_end = [sp for sp in spans if HOOK_LAST in sp[0]][0]
    soundfile.write(str(AUD / 'narration_v33.wav'), y, SR, subtype='PCM_16')
    shutil.copy2(AUD / 'narration_v33.wav', AUD / 'narration.wav')
    lst = ROOT / 'docs/ep003/voice_bram/EP003_hook_v33_splice.wav'
    soundfile.write(str(lst), y[:int(round(hook_end[4] * SR))], SR, subtype='PCM_16')
    print('H8 gain %+.2f dB (take %.1f LUFS -> neighbours %.1f LUFS)' % (g_db, lufs(load_mp3(H8)), lufs(nb)))
    print('head %.2f s, v3.2 tail shifted %+.3f s, total %.2f s' % (len(head) / SR, shift, len(y) / SR))
    for ids, s, a, t0, t1 in spans:
        print('  %-16s %-4s src %7.3f  ->  %7.3f - %7.3f' % ('+'.join(ids), s, a, t0, t1))

    # ---------------- word timings: STT on the spliced head (block by block), v3.2 timings shifted for l12 on
    lines = {l['id']: l for l in json.loads((EP / 'script.json').read_text())['lines']}
    from faster_whisper import WhisperModel
    stt = WhisperModel('small.en', device='cpu', compute_type='int8')
    cues = {}
    groups = [[sp for sp in spans if sp[0][0].startswith('h')], [sp for sp in spans if sp[0][0].startswith('b')]]
    for grp in groups:
        s0, s1 = grp[0][3], grp[-1][4]
        if HOOK_LAST in grp[-1][0]:
            s1 = s1 - 1.4                                            # the 1.5 s of silence after "why?" stays out
        segs, _ = stt.transcribe(str(AUD / 'narration.wav'), language='en', word_timestamps=True, beam_size=5,
                                 clip_timestamps=[round(s0, 2), round(s1, 2)])
        ww = [(w.word, float(w.start), float(w.end)) for sg in segs for w in sg.words]
        ids = [i for sp in grp for i in sp[0]]
        toks, owner = [], []
        for lid in ids:
            for tk in lines[lid]['text'].split():
                toks.append(tk); owner.append(lid)
        words = v4.align_words(toks, ww, s0, s1)
        for lid in ids:
            lw = [w for w, o in zip(words, owner) if o == lid]
            cues[lid] = {'start': lw[0]['start'], 'end': lw[-1]['end'], 'text': lines[lid]['text'],
                         'block': 'A' if lid.startswith('h') else 'B', 'from': lines[lid].get('from'), 'words': lw}
    for c in cues.values():
        for w in c['words']:
            w['start'], w['end'] = round(float(w['start']), 3), round(float(w['end']), 3)
    v4.snap_words(cues, y)
    resnap(cues, y)
    for lid, c in cues.items():
        c['start'], c['end'] = c['words'][0]['start'], c['words'][-1]['end']
        assert [w['w'] for w in c['words']] == lines[lid]['text'].split(), lid
    for lid, c in old['cues'].items():
        if int(lid[1:]) >= 12 and lid.startswith('l'):
            c = json.loads(json.dumps(c))
            c['start'] = round(c['start'] + shift, 3); c['end'] = round(c['end'] + shift, 3)
            for w in c['words']:
                w['start'] = round(w['start'] + shift, 3); w['end'] = round(w['end'] + shift, 3)
            cues[lid] = c
    cues = {k: cues[k] for k in lines}
    tm = {'source': 'audio/narration.wav',
          'generatedBy': 'Bram (Higgsfield text2speech_v2 / ElevenLabs preset 549ff70a): v3.3 splice of the v3.2 takes + '
                         'B01b_H8 (scripts/ep003-bram-v33-splice.py)',
          'script': 'LOCKED v3.3 (SCRIPT_CHANGE_PROPOSAL_02_HOOK.md, approved 2026-10-17)',
          'alignment': 'h/b lines: faster-whisper small.en word timestamps on the spliced file, aligned (difflib) 1:1 onto '
                       'script tokens, edges snapped out of silence; l12-l52: the v3.2 timings shifted %+.3f s (same audio)' % shift,
          'hook_end': {'line': HOOK_LAST, 'silence_after': round(hook_end[4] - cues[HOOK_LAST]['end'], 2)},
          'v32_shift_from_l12': round(shift, 3), 'h08_gain_db': round(g_db, 2), 'gain_db': old.get('gain_db'),
          'pieces': [{'lines': ids, 'source': 'narration_bram.wav (v3.2)' if s == 'v32' else 'B01b_H8.mp3',
                      'src_in': a, 'at': round(t0, 3), 'end': round(t1, 3)} for ids, s, a, t0, t1 in spans],
          'duration': round(len(y) / SR, 2), 'cues': cues}
    (EP / 'timings_v33.json').write_text(json.dumps(tm, indent=2, ensure_ascii=False))
    shutil.copy2(EP / 'timings_v33.json', EP / 'timings.json')
    order = list(cues)
    gaps = {f'{order[i]}->{order[i + 1]}': round(cues[order[i + 1]]['start'] - cues[order[i]]['end'], 2) for i in range(14)}
    print('line gaps', gaps)
    print('hook: "So, why?" ends %.2f s, hook end (after the silence) %.2f s' % (cues[HOOK_LAST]['end'], hook_end[4]))
    if '--qc' in sys.argv:
        qc(stt, y, cues, lines, hook_end[4])


def resnap(cues, y):
    """Two whisper slips the splice exposes (a pause that now holds a breath, a one-word line after a cut), fixed on
    the energy: runs of 10 ms frames within 32 dB of the loud level, split by >= 80 ms of quiet.
    (a) a word that starts in a breath/silence and only becomes loud after >= 80 ms of quiet starts at that loud run;
    (b) a word whose own span is (almost) silent while an unclaimed loud run sits between the previous word's end and
        its start moves onto that run."""
    h = int(.01 * SR); n = len(y) // h
    db = 10 * np.log10(np.mean(y[:n * h].reshape(n, h) ** 2, 1) + 1e-12)
    loud = db > np.percentile(db, 95) - 32
    runs, i = [], 0
    while i < n:
        if loud[i]:
            j = i
            while j < n and (loud[j] or (j + 8 < n and loud[j:j + 8].any())):
                j += 1
            runs.append((i / 100, j / 100)); i = j
        else:
            i += 1
    ws = [w for c in cues.values() for w in c['words']]
    ws.sort(key=lambda w: w['start'])
    for k, w in enumerate(ws):
        prev_end = ws[k - 1]['end'] if k else 0
        inside = [r for r in runs if r[1] > w['start'] and r[0] < w['end']]
        if inside and inside[0][0] - w['start'] >= .08:
            w['start'] = round(inside[0][0], 2)                                         # (a) silence first
        elif len(inside) > 1 and inside[0][1] - w['start'] < .1 and inside[1][0] - inside[0][1] >= .08:
            w['start'] = round(inside[1][0], 2)                                         # (a) a breath tail first
            inside = inside[1:]
        loud_in = sum(min(r[1], w['end']) - max(r[0], w['start']) for r in inside)
        before = [r for r in runs if r[0] >= prev_end - .005 and r[1] <= w['start'] + .05 and r[1] - r[0] >= .1]
        if loud_in < .06 and before:
            r = before[-1]; w['start'], w['end'] = round(r[0], 2), round(r[1], 2)       # (b)
        w['end'] = max(w['end'], round(w['start'] + .05, 2))


def qc(stt, y, cues, lines, hook_t1):
    """STT of the new hook + block B against the v3.3 text (same normalisation as scripts/ep003-bram-qc.py)."""
    import difflib, re
    NUM = {'200,000': 'two hundred thousand', '200 000': 'two hundred thousand', '$8': 'eight dollars', '10': 'ten'}
    def norm(t):
        t = t.lower().replace('’', "'").replace('-', ' ')
        for k, v in NUM.items():
            t = t.replace(k.lower(), ' ' + v + ' ')
        return re.sub(r"[^a-z0-9' ]", ' ', t).split()
    t1 = cues['b03']['end'] + .3
    segs, _ = stt.transcribe(str(AUD / 'narration.wav'), language='en', word_timestamps=True, beam_size=5,
                             clip_timestamps=[0, round(t1, 2)])
    heard = ' '.join(w.word.strip() for sg in segs for w in sg.words)
    ref = ' '.join(lines[k]['text'] for k in lines if not k.startswith('l'))
    a, b = norm(ref), norm(heard)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    diffs = [{'op': op, 'ref': ' '.join(a[i1:i2]), 'heard': ' '.join(b[j1:j2])} for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
    out = {'ratio': round(sm.ratio(), 4), 'ref_words': len(a), 'diffs': diffs, 'heard': heard}
    hk = [k for k in lines if k.startswith('h')]
    a2 = norm(' '.join(lines[k]['text'] for k in hk))
    segs, _ = stt.transcribe(str(AUD / 'narration.wav'), language='en', word_timestamps=True, beam_size=5,
                             clip_timestamps=[0, round(hook_t1, 2)])
    b2 = norm(' '.join(w.word.strip() for sg in segs for w in sg.words))
    out['hook_ratio'] = round(difflib.SequenceMatcher(a=a2, b=b2, autojunk=False).ratio(), 4)
    (ROOT / 'audio/bram/ep003/STT_QC_v33.json').write_text(json.dumps(out, indent=1, ensure_ascii=False))
    print('STT QC v3.3 hook+B: match %.4f (hook alone %.4f); diffs %s' % (out['ratio'], out['hook_ratio'], diffs))


if __name__ == '__main__':
    main()
