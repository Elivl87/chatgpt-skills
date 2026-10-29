#!/usr/bin/env python3
"""EP001 · widen the narration gaps of the `[solo cuadro]` (box-only) lines to the director's reading-time rule
(2026-10-29, binding): a text box is FULLY visible (pop-in / pop-out excluded) for need = max(1.6 s, 0.5 s + 0.08 s per
character), and the silent slot around a box-only line keeps >= 0.1 s of narrator-free margin on each side of the whole
box (pop-in 0.2 s and pop-out 0.16 s included). No ElevenLabs audio is regenerated: digital silence is inserted INSIDE
the existing pause, at the quietest point of the true pause (10 ms energy envelope), never inside a phrase, and every
insertion is verified afterwards with faster-whisper word timestamps on the edited file (no word may straddle it).

    python3 widen_box_slots.py <dir with narration_es.wav + timings_es.json + segments_es.json> [--dry]
        (writes back into that dir; verification needs the faster-whisper venv: VERIFY_PY=/path/to/python)

Box timing mirrors art/lib/textbox.js + ep/001/animatic/anim.js: show0 = start - 0.06, full from show0 + 0.2,
show1 = show0 + 0.2 + need + 0.16. A box-only line starts after the previous voiced word + 0.16 s and after the
previous character box has closed (+ 0.08 s), and the next voiced word must start >= show1 + 0.1 s.
"""
import json
import os
import re
import subprocess
import sys
import wave

import numpy as np

D = sys.argv[1]
DRY = "--dry" in sys.argv
VERIFY_ONLY = "--verify-only" in sys.argv   # re-check the recorded insertions of segments_es.json slot_widen_2
SR = 48000
POP_IN, POP_OUT, LEAD, MARGIN = 0.2, 0.16, 0.06, 0.1
need = lambda text: max(1.6, 0.5 + 0.08 * len(text))
# extra silence before a box-only line (picture needs): «¿Qué?» waits 1.25 s after Mila's box so A15_back can show the wave
# going backwards before the cut to Eli's magnifier (A16_lens), where the box lives (a box never crosses a cut)
HOLD = {"b04_08_eli": 1.25}

W = json.load(open(f"{D}/timings_es.json"))
SG = json.load(open(f"{D}/segments_es.json"))
w0 = wave.open(f"{D}/narration_es.wav"); P = w0.getparams(); raw = w0.readframes(P.nframes); w0.close()
assert P.sampwidth == 3 and P.nchannels == 1 and P.framerate == SR
b = np.frombuffer(raw, np.uint8).reshape(-1, 3).astype(np.int32)
x = (b[:, 0] | (b[:, 1] << 8) | (b[:, 2] << 16)); x = np.where(x >= 1 << 23, x - (1 << 24), x)
audio = x.astype(np.int32)


def env_db(a, t0, t1, hop=0.01):
    i0, i1 = max(0, int(t0 * SR)), min(len(a), int(t1 * SR)); h = int(hop * SR)
    fr = [a[i:i + h].astype(np.float64) / (1 << 23) for i in range(i0, i1 - h + 1, h)]
    return np.array([20 * np.log10(np.sqrt(np.mean(f * f)) + 1e-9) for f in fr]), i0 / SR, hop


def lines():
    by = {}
    for w in W:
        if w["speaker"] in ("eli", "mila"):
            L = by.setdefault(w["line"], {"id": w["line"], "voiced": w["voiced"], "start": w["start"], "end": w["end"], "words": []})
            L["start"] = min(L["start"], w["start"]); L["end"] = max(L["end"], w["end"]); L["words"].append(w["text"])
    out = []
    for L in by.values():
        L["text"] = " ".join(L["words"]); L["need"] = need(L["text"]); L["show0"] = L["start"] - LEAD
        L["show1"] = max(L["show0"] + POP_IN + L["need"], L["end"] + 0.05) + 1 / 30 + POP_OUT; out.append(L)   # = anim.js lineList
    return sorted(out, key=lambda L: L["start"])


inserts, report = [], []
if VERIFY_ONLY:
    inserts = [tuple(x) for x in SG["slot_widen_2"]["inserts"]]
for lid in ([] if VERIFY_ONLY else [L["id"] for L in lines() if not L["voiced"]]):
    Ls = lines(); L = next(q for q in Ls if q["id"] == lid)
    box = [w for w in W if w["line"] == lid]
    voiced = sorted([w for w in W if w["voiced"]], key=lambda w: w["start"])
    prev = max((w for w in voiced if w["end"] <= L["start"] + 1e-6), key=lambda w: w["end"])
    nxt = min((w for w in voiced if w["start"] >= L["start"] - 1e-6), key=lambda w: w["start"])
    # true speech edges from the energy envelope (whisper word ends are often early on a word's tail)
    e, et0, hop = env_db(audio, prev["end"] - 0.3, nxt["start"] + 0.3)
    gap_fr = [(et0 + k * hop, v) for k, v in enumerate(e) if prev["end"] <= et0 + k * hop <= nxt["start"] - hop]
    floor = float(np.median([v for _, v in gap_fr])) if gap_fr else -90
    loud = max(-50.0, floor + 12)
    pe = max([prev["end"]] + [t + hop for t, v in zip(et0 + np.arange(len(e)) * hop, e) if v > loud and t < (prev["end"] + nxt["start"]) / 2])
    ns = min([nxt["start"]] + [t for t, v in zip(et0 + np.arange(len(e)) * hop, e) if v > loud and t > (prev["end"] + nxt["start"]) / 2])
    prev_box = max([q["show1"] for q in Ls if q["start"] < L["start"] and q["id"] != lid] + [-1])
    s0 = max(pe + MARGIN + LEAD, prev_box + 0.08 + HOLD.get(lid, 0.0))
    show1 = s0 - LEAD + POP_IN + L["need"] + 1 / 30 + POP_OUT   # anim.js adds one frame of slack
    add = round(max(0.0, show1 + MARGIN - ns), 3)
    # insertion point: the centre of the longest quiet run inside the true pause
    q = [(t, v) for t, v in zip(et0 + np.arange(len(e)) * hop, e) if pe <= t <= ns - hop]
    best, cur = (0, None, None), []
    for t, v in q:
        if v <= loud - 6:
            cur.append(t)
            if len(cur) > best[0]: best = (len(cur), cur[0], cur[-1])
        else:
            cur = []
    assert best[1] is not None, f"{lid}: no quiet run in the pause {pe:.3f}-{ns:.3f}"
    ti = round((best[1] + best[2] + hop) / 2, 3)
    lvl = float(env_db(audio, ti - 0.01, ti + 0.01)[0].max())
    rec = {"line": lid, "text": L["text"], "need": round(L["need"], 2), "prev_word": prev["text"], "next_word": nxt["text"],
           "speech_end": round(pe, 3), "speech_start": round(ns, 3), "gap_before": round(ns - pe, 3), "insert_at": ti, "insert_s": add,
           "level_at_insert_db": round(lvl, 1), "floor_db": round(floor, 1)}
    if add > 0:
        inserts.append((ti, add)); n = int(round(add * SR)); k = int(round(ti * SR))
        audio = np.concatenate([audio[:k], np.zeros(n, np.int32), audio[k:]])
        for w in W:
            if w["start"] >= ti: w["start"] = round(w["start"] + add, 3); w["end"] = round(w["end"] + add, 3)
            if "slot" in w and w["slot"] and w["slot"][0] >= ti: w["slot"] = [round(w["slot"][0] + add, 3), round(w["slot"][1] + add, 3)]
        ns += add
    # re-slot the box words: [s0, s0 + need], split by letters
    Lt = round(L["need"], 3)
    lens = np.array([max(1, len(re.sub(r"\W", "", w["text"]))) for w in box], float); c = np.concatenate([[0], np.cumsum(lens) / lens.sum()])
    for k2, w in enumerate(box):
        w["start"] = round(s0 + c[k2] * Lt, 3); w["end"] = round(s0 + c[k2 + 1] * Lt, 3); w["slot"] = [round(s0, 3), round(s0 + Lt, 3)]
    rec.update({"box_start": round(s0, 3), "box_show0": round(s0 - LEAD, 3), "box_show1": round(show1, 3), "gap_after": round(ns - pe, 3),
                "margin_before": round(s0 - LEAD - pe, 3), "margin_after": round(ns - show1, 3)})
    report.append(rec)
    print(json.dumps(rec, ensure_ascii=False))

dur = len(audio) / SR
print("inserted", round(sum(a for _, a in inserts), 3), "s; duration", round(dur, 3))
if DRY:
    sys.exit(0)
if not VERIFY_ONLY:
    y = audio.astype(np.int64) & 0xFFFFFF
    out = np.stack([y & 0xFF, (y >> 8) & 0xFF, (y >> 16) & 0xFF], 1).astype(np.uint8).tobytes()
    w1 = wave.open(f"{D}/narration_es.wav", "wb"); w1.setparams(P); w1.writeframes(out); w1.close()
    for sg in SG["segments"]:
        ws = [w for w in W if w["line"] == sg["name"]]
        sg["start"] = round(min(w["start"] for w in ws), 4); sg["dur"] = round(max(w["end"] for w in ws) - sg["start"], 4)
        if not sg["voiced"]: sg["slot_note"] = f"[solo cuadro]: silent slot {sg['dur']} s, no voice (= full reading time of the box, 2026-10-29 rule)"
    for k, sg in enumerate(SG["segments"]):
        nx = SG["segments"][k + 1]["start"] if k + 1 < len(SG["segments"]) else dur
        sg["after"] = round(max(0.0, nx - sg["start"] - sg["dur"]), 4)
    for tk in SG["takes"]:
        st = tk["start"]
        for t, add in sorted(inserts):
            if st >= t: tk["start"] = round(tk["start"] + add, 3)
            elif st <= t <= st + tk["dur"] + 1e-6:
                tk["dur"] = round(tk["dur"] + add, 3); tk["edits"].append({"kind": "slot_widen_2", "at": round(t - st, 3), "inserted_s": round(add, 3), "removed_s": 0.0})
    SG["duration_s"] = round(dur, 2)
    SG["slot_widen_2"] = {"date": "2026-10-29", "why": "director rule: box fully visible >= max(1.6, 0.5 + 0.08/char) s, >= 0.1 s narrator-free each side (widen_box_slots.py)",
                          "inserts": [[t, a] for t, a in sorted(inserts)], "report": report}
    open(f"{D}/timings_es.json", "w").write("[\n" + ",\n".join(json.dumps(w, ensure_ascii=False) for w in W) + "\n]\n")
    open(f"{D}/segments_es.json", "w").write(json.dumps(SG, ensure_ascii=False, indent=1) + "\n")

# ---- verification: faster-whisper word timestamps around every insertion (no word may straddle the inserted silence)
VP = os.environ.get("VERIFY_PY")
if VP:
    code = r'''
import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
wav, ins = sys.argv[1], json.loads(sys.argv[2]); m = WhisperModel("small", device="cpu", compute_type="int8")
for t, a in ins:   # insertion times are already final (each was taken after the earlier ones)
    t2 = t; t0 = max(0, t2 - 4.0)
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t0:.3f}", "-t", f"{a + 8.0:.3f}", "-i", wav, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
    au = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    segs, _ = m.transcribe(au, language="es", word_timestamps=True, beam_size=5, vad_filter=False)
    ws = [(w.word.strip(), round(t0 + w.start, 3), round(t0 + w.end, 3)) for s in segs for w in s.words]
    bad = [w for w in ws if w[1] < t2 + a - 0.02 and w[2] > t2 + 0.02]
    before = [w for w in ws if w[2] <= t2 + 0.02][-3:]; after = [w for w in ws if w[1] >= t2 + a - 0.02][:3]
    print(json.dumps({"insert_at": round(t2, 3), "silence": [round(t2, 3), round(t2 + a, 3)], "before": before, "after": after, "straddling": bad}, ensure_ascii=False))
'''
    subprocess.run([VP, "-I", "-c", code, f"{D}/narration_es.wav", json.dumps(sorted(inserts))], check=True,
                   env=dict(os.environ, HF_HUB_OFFLINE="1", TQDM_DISABLE="1", OMP_NUM_THREADS="2"))
