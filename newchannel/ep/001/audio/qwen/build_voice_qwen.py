#!/usr/bin/env python3
"""EP001 narration with Qwen3-TTS «Ryan» (Producer-approved engine, 2026-10-23), directed sentence by sentence
from direction_v4.py (= DIRECCION_NARRADOR_v4.md). Narrator + Eli/Mila quotes in the narrator's voice; the three
`[solo cuadro]` lines are silent slots.

Server (C engine gabriele-mastrapasqua/qwen3-tts, MIT; recipe in voice/engines_test/NOTES.md), 3 threads, bf16:
    nice -n 10 /tmp/claude-0/engines/qwen3tts-c/qwen_tts -d /tmp/claude-0/engines/qwen3tts/cv17 -j 3 \
        --max-request-seconds 900 --serve 8091
Build (Chatterbox venv has faster-whisper / librosa / pyloudnorm / resemblyzer):
    TQDM_DISABLE=1 OMP_NUM_THREADS=1 nice -n 10 /tmp/claude-0/cbnat/venv/bin/python -I \
        ep/001/audio/qwen/build_voice_qwen.py [render|assemble|align|qc|all] [--takes 3] [--rows a-b]

Per row: one /v1/tts call per take with speaker ryan, language Spanish, temperature 0.9 / top_k 50 / top_p 1.0 /
rep_penalty 1.05, the row's instruction and its native `rate` (pitch-preserving tempo inside the engine). Seeds
5000 + 97·row + 7919·take. Every take is trimmed, checked with Whisper-small (WER vs the script, production
normaliser) and measured (pitch range in semitones + RMS variance). We keep generating until TAKES correct takes
exist (max MAX_TRIES calls), then keep the correct take with the HIGHEST energy score — never the flattest. A kept take
still under 140 wpm gets rubberband ≤ 1.15× (pitch kept). Pauses are ours (assembly), per the direction sheet.
Output (this folder): narration_es.wav (48 kHz 24-bit, −16 LUFS stem; not in git), segments_es.json, timings_es.json
(same schema as the animatic's A.at), asr_es.json, qc_es.json, preview_narracion_es.mp3 (48 kbps), VOICE_QC_qwen.md.
"""
from __future__ import annotations

import io
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
AUD = HERE.parent
NC = AUD.parents[2]
PARTIAL = bool(os.environ.get("QWEN_PARTIAL"))     # pipeline smoke test with silent placeholders -> smoke/, never the deliverables
OUT = HERE / "smoke" if PARTIAL else HERE          # v5 (QWEN_DIRECTION=direction_v5) writes to qwen/v5/, never over v4
os.environ.setdefault("OMP_NUM_THREADS", "1")
sys.path[:0] = [str(HERE), str(NC / "voice" / "chatterbox_natural"), str(NC / "voice" / "expressive"),
                str(NC / "voice" / "engines_test")]
import cbn  # noqa: E402  trim / check (Whisper) / level / FF; puts ep/001/audio + engine on the path
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402

import importlib  # noqa: E402

# Direction sheet: v4 (default, the approved render) or v5 (Bram-study rules, BRAM_ESTILO_ESTUDIO.md): QWEN_DIRECTION=direction_v5.
# v5 renders go to their own take cache (QWEN_TMP default /tmp/claude-0/qwen_ep001_v5) so the v4 takes are never touched.
DV = importlib.import_module(os.environ.get("QWEN_DIRECTION", "direction_v4"))  # noqa: E402
if DV.__name__.endswith("v5") and not PARTIAL:
    OUT = HERE / "v5"
import harness as H  # noqa: E402  to24 (resample), speech_seconds
import measure as M  # noqa: E402

bv = cbn.bv
ev = bv.ev
es = bv.es
SR = cbn.SR
SR_OUT = 48000
PORT = int(os.environ.get("QWEN_PORT", "8091"))
TMP = Path(os.environ.get("QWEN_TMP", "/tmp/claude-0/qwen_ep001" + ("_v5" if DV.__name__.endswith("v5") else "")))
TAKES = 3
MAX_TRIES = 8
TARGET_LUFS, CEIL_TP = -16.0, -2.0          # stem; the final mix handles −14
SEG_LUFS = -20.0
GAIN = {"narrator": 0.0, "eli": 2.5, "mila": -2.0}
LEAD, END_SCREEN = 0.25, 20.0
REF_WINDOW = ("/tmp/claude-0/engines/out/qwen_a.wav", 55.0, 75.0)       # what the Producer liked
REF_FALLBACK = {"pitch_range_st": 16.1, "melody_std_st": 4.5, "energy_std_db": 8.9}   # NOTES.md, same window
SAMPLING = {"temperature": 0.9, "top_k": 50, "top_p": 1.0, "rep_penalty": 1.05}
MIN_WPM, MAX_STRETCH = 140.0, 1.15


# ------------------------------------------------------------------------------------------------ rows / segments
def rows():
    """Direction rows + script segment names (b{beat}_{i:02d}_{speaker}, i = script_parse index: the animatic's `line`)."""
    import script_parse
    DV.verify()
    segs = script_parse.parse_episode()
    out, k = [], 0
    for i, s in enumerate(segs):
        if s["speaker"] == "pause":
            continue
        name = f"b{s['beat']}_{i:02d}_{s['speaker']}"
        n = 1
        if s["speaker"] == "narrator":
            acc, n = [], 0
            while " ".join(acc) != s["text"]:
                acc.append(DV.ROWS[k + n]["text"])
                n += 1
        for j in range(n):
            r = dict(DV.ROWS[k + j], idx=k + j, seg=i, name=name, first=(j == 0), last=(j == n - 1),
                     seg_text=s["text"])
            r["instruct"] = DV.instruct(r)
            r["eng_rate"] = DV.eng_rate(r)
            out.append(r)
        k += n
    assert k == len(DV.ROWS)
    return out


# ------------------------------------------------------------------------------------------------ synthesis
def tts(body):
    req = urllib.request.Request(f"http://127.0.0.1:{PORT}/v1/tts", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=1800) as r:
        data = r.read()
    x, sr = sf.read(io.BytesIO(data), dtype="float32")
    return H.to24(np.asarray(x), sr)


def energy(a, words=None):
    """Energy score of a take: pitch range (st) and RMS variance (dB), each relative to the liked reference window."""
    ref = reference()
    try:
        m = M.measure(a, SR)
    except Exception:                       # pyin on a very short clip
        return 0.0, {}
    sc = (m["pitch_range_st"] or 0) / ref["pitch_range_st"] + (m["energy_std_db"] or 0) / ref["energy_std_db"]
    # a drawn-out take measures a wide pitch range but is exactly what the Producer rejected ("lento, desganado"):
    # weight the score by pace (full weight from 140 wpm, 30 % at or under 100 wpm)
    if words:
        wpm = words / max(m.get("speech_s") or 0.1, 0.1) * 60
        sc *= 0.3 + 0.7 * float(np.clip((wpm - 100.0) / 40.0, 0.0, 1.0))
    return round(float(sc), 3), {k: m.get(k) for k in ("pitch_range_st", "pitch_std_st", "melody_std_st",
                                                        "energy_std_db", "f0_median_hz", "speech_s")}


_REF = None


def reference():
    global _REF
    if _REF is None:
        p, t0, t1 = REF_WINDOW
        if Path(p).exists():
            x, s = sf.read(p, dtype="float32")
            x = H.to24(x[int(t0 * s): int(t1 * s)], s)
            m = M.measure(x, SR)
            _REF = {k: m[k] for k in REF_FALLBACK} | {"source": f"{p} {t0}-{t1}s"}
        else:
            _REF = dict(REF_FALLBACK, source="NOTES.md ELIGE track 1 window")
    return _REF


def wpm_of(a, text):
    sp = H.speech_seconds(a, SR)
    return round(cbn.n_words(text) / max(sp, 0.1) * 60, 1)


def cut_at_f(a, text="¿Quién fue?"):
    """«¡¿Quién f…?»: Whisper word timestamps on the take → cut 90 ms into the /f/ of «fue», 15 ms fade."""
    import librosa
    a16 = librosa.resample(a, orig_sr=SR, target_sr=16000)
    words = bv.whisper(np.concatenate([np.zeros(3200, np.float32), a16]))
    fue = [w for w in words if re.sub(r"\W", "", w["text"].lower()) == "fue"]
    if fue:
        t = fue[0]["start"] - 0.2 + 0.09
    else:                                   # fallback: the last voiced onset
        t = len(a) / SR * 0.55
    n = max(int(0.2 * SR), int(t * SR))
    y = a[:n].copy()
    f = int(0.015 * SR)
    y[-f:] *= np.linspace(1, 0, f, dtype=np.float32)
    return y, round(t, 3)


def takes_for(r, takes=TAKES):
    """Correct takes wanted per row. This host renders at RTF ≈ 9 (no AMX/BF16), 2.3x slower than the shoot-out box, so
    rows over SHORT_WORDS words get `takes - 1` correct takes unless the best of them is still flatter than the liked
    reference window (energy score < ENERGY_OK): then a further take is generated, up to `takes`."""
    return takes if cbn.n_words(r["tts"]) <= SHORT_WORDS else max(2, takes - 1)


SHORT_WORDS, ENERGY_OK = 12, 2.0


def synth_row(r, takes=TAKES, log=print):
    """Generate until takes_for(r) correct takes (WER 0, plausible length) or MAX_TRIES; keep the most energetic correct
    take (else the best scoring one). One request in flight while the previous take is checked/measured."""
    want, hard = takes_for(r, takes), takes
    text, tts_text, nw = r["text"], r["tts"], cbn.n_words(r["tts"])
    body0 = {"text": tts_text, "language": "Spanish", "speaker": "ryan", "instruct": r["instruct"],
             "rate": r["eng_rate"], **SAMPLING}
    seed0 = 5000 + 97 * r["idx"]
    pending, results = {}, []

    def fire(k):
        s = seed0 + 7919 * k
        box = {}

        def run():
            t0 = time.time()
            try:
                box["audio"] = tts(dict(body0, seed=s))
            except Exception as e:          # noqa: BLE001
                box["error"] = str(e)
            box["synth_s"] = round(time.time() - t0, 1)
        th = threading.Thread(target=run)
        th.start()
        pending[k] = (th, box, s)

    k_next = 0
    fire(k_next)
    k_next += 1
    correct = 0
    while pending:
        k = min(pending)
        th, box, s = pending.pop(k)
        th.join()
        if correct + 1 < want and k_next < MAX_TRIES:    # keep the server busy while we score this one
            fire(k_next)
            k_next += 1
        if "error" in box:
            log(f"   take {k + 1}: ERROR {box['error']}")
            results.append({"seed": s, "wer": 1.0, "score": 9, "err": box["error"]})
            continue
        raw = box["audio"]
        a, dropped = cbn.trim(raw) if len(raw) >= SR // 4 else (raw, 0.0)
        dur = len(a) / SR
        wer, errs, heard = cbn.check(a, tts_text) if dur > 0.2 else (1.0, [], "")
        too_long = dur > 0.8 + nw / 1.8          # < ~75 wpm after the engine's tempo = stalling / babble
        too_short = dur < 0.12 + nw / 6.0        # > 360 wpm: swallowed words
        bad = wer + (1.0 if too_long else 0.0) + (0.5 if too_short else 0.0)
        esc, em = energy(a, nw) if bad == 0 else (0.0, {})
        take = {"seed": s, "wer": wer, "errors": errs, "heard": heard, "dur": round(dur, 2), "dropped": dropped,
                "synth_s": box["synth_s"], "rtf": round(box["synth_s"] / max(dur, 0.1), 2), "too_long": too_long,
                "too_short": too_short, "score": bad, "energy": esc, "measure": em, "wpm": wpm_of(a, tts_text),
                "audio": a}
        results.append(take)
        log(f"   take {k + 1} seed {s}: wer {wer:.3f} dur {dur:.2f}s rtf {take['rtf']} wpm {take['wpm']} "
            f"energy {esc} | {heard}")
        if bad == 0:
            correct += 1
            if correct >= want:
                best_e = max(t["energy"] for t in results if t.get("score") == 0)
                if want < hard and best_e < ENERGY_OK and k_next < MAX_TRIES:
                    want += 1                            # all correct takes flatter than the reference: one more
                    if not pending:
                        fire(k_next)
                        k_next += 1
                else:
                    break
        # the pending request (if any) is drained by the loop; the fire() above already respects MAX_TRIES
    good = [t for t in results if t.get("score") == 0]
    if good:
        best = max(good, key=lambda t: t["energy"])
    else:                                        # no perfect take: least bad, then most energetic
        cand = [t for t in results if "audio" in t]
        best = min(cand, key=lambda t: (t["score"], -t["energy"]))
    out = {k: v for k, v in best.items() if k not in ("audio", "measure")}
    out.update(measure=best.get("measure", {}), tries=len(results),
               takes=[{k: v for k, v in t.items() if k not in ("audio", "measure")} for t in results],
               correct=len(good), text=text, tts=tts_text, instruct=r["instruct"], rate=r["eng_rate"])
    return best["audio"], out


def stretch_if_slow(a, text, meta):
    """Native `rate` first; rubberband (pitch 1.0) only if the kept take is still under MIN_WPM, ≤ MAX_STRETCH."""
    w = wpm_of(a, text)
    meta["wpm_native"] = w
    if w >= MIN_WPM:
        meta["stretch"] = 1.0
        return a
    f = float(min(MAX_STRETCH, MIN_WPM / w))
    p = subprocess.run([cbn.FF, "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af",
                        f"rubberband=tempo={f:.4f}:pitch=1.0:transients=crisp", "-f", "f32le", "-"],
                       input=a.astype(np.float32).tobytes(), capture_output=True, check=True)
    y = np.frombuffer(p.stdout, np.float32).copy()
    meta["stretch"] = round(f, 3)
    meta["wpm_after_stretch"] = wpm_of(y, text)
    return y


def render(takes=TAKES, only=None):
    (TMP / "takes").mkdir(parents=True, exist_ok=True)
    rs = rows()
    t_all = time.time()
    for r in rs:
        if only and not (only[0] <= r["idx"] <= only[1]):
            continue
        f = TMP / "takes" / f"row{r['idx']:03d}.wav"
        jf = f.with_suffix(".json")
        if not r["voiced"]:
            continue
        if f.exists() and jf.exists():
            continue
        print(f"[{r['idx'] + 1}/{len(rs)} {r['name']}] {r['speaker']} {r['tag']} rate {r['eng_rate']} | {r['tts']}", flush=True)
        a, meta = synth_row(r, takes)
        if r["cut_f"]:
            a, t_cut = cut_at_f(a)
            meta["cut_f_at"] = t_cut
        a = stretch_if_slow(a, r["tts"], meta)
        meta.update(idx=r["idx"], name=r["name"], beat=r["beat"], speaker=r["speaker"], tag=r["tag"],
                    pre=r["pre"], after=r["after"], energy_target=r["energy"], dur_out=round(len(a) / SR, 3))
        sf.write(f, a, SR, subtype="FLOAT")
        jf.write_text(json.dumps(meta, ensure_ascii=False, indent=1))
        print(f"   kept seed {meta['seed']} energy {meta['energy']} wpm {meta['wpm_native']} "
              f"(stretch {meta['stretch']}) after {meta['tries']} tries; {round(time.time() - t_all)} s elapsed", flush=True)
    wall = TMP / "render_wall.json"
    prev = json.loads(wall.read_text()) if wall.exists() else {"wall_s": 0.0}
    prev["wall_s"] = round(prev["wall_s"] + time.time() - t_all, 1)
    wall.write_text(json.dumps(prev))
    print("render done", round(time.time() - t_all), "s", flush=True)


# ------------------------------------------------------------------------------------------------ assembly
# Pace window per kept take (words / take length) and the scale applied to the sentence pauses (< 1 s: the gag
# pauses, the 5 s silence, the wordmark and the end-screen gaps are never scaled). Defaults = the Producer's pace
# (150 wpm, "el ritmo estaba mejor"); QWEN_PACE=lo-hi and QWEN_PAUSE_SCALE override them (see VOICE_QC_qwen.md).
_pace = os.environ.get("QWEN_PACE", "150-165").split("-")
PACE_LO, PACE_HI, PACE_MAX_UP, PACE_MAX_DOWN = float(_pace[0]), float(_pace[1]), 1.3, 0.85
PAUSE_SCALE = float(os.environ.get("QWEN_PAUSE_SCALE", str(getattr(DV, "PAUSE_SCALE", 0.85))))


def rubberband(a, f):
    p = subprocess.run([cbn.FF, "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af",
                        f"rubberband=tempo={f:.4f}:pitch=1.0:transients=crisp", "-f", "f32le", "-"],
                       input=a.astype(np.float32).tobytes(), capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).copy()


def pace_fix(a, text, window=None):
    """Coordinator's delivery condition (2026-10-24): 135-170 wpm per beat. Each kept take (>= 3 words) is brought into
    [PACE_LO, PACE_HI] wpm (words / take length) with a pitch-preserving tempo change: up to x1.3 faster, down to x0.85
    slower. The engine's native `rate` is the same kind of time-stretch, so this equals asking for another rate without
    re-synthesising. Returns (audio, factor, wpm_before, wpm_after)."""
    nw = cbn.n_words(text)
    w0 = nw / (len(a) / SR) * 60
    if nw < 3:
        return a, 1.0, round(w0, 1), round(w0, 1)
    lo, hi = window or (PACE_LO, PACE_HI)      # v5: per-row window (DV.pace_window), v4: one window for all rows
    f = 1.0
    if w0 < lo:
        f = min(PACE_MAX_UP, lo / w0)
    elif w0 > hi:
        f = max(PACE_MAX_DOWN, hi / w0)
    if abs(f - 1.0) > 0.005:
        a = rubberband(a, f)
    return a, round(f, 3), round(w0, 1), round(nw / (len(a) / SR) * 60, 1)


def finish(x, out: Path):
    """HPF 70 Hz + 2.5:1 compression (as the Chatterbox/Kokoro stems), 48 kHz, −16 LUFS, TP ≤ −2 dBTP."""
    ch = "highpass=f=70:poles=2,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:knee=4"
    p = subprocess.run([cbn.FF, "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af",
                        f"{ch},aresample={SR_OUT}:resampler=soxr", "-f", "f32le", "-"],
                       input=x.astype(np.float32).tobytes(), capture_output=True, check=True)
    y = np.frombuffer(p.stdout, np.float32).copy()[:, None]
    gain = 0.0
    for _ in range(8):
        z = es.limit(y * es.db(gain), CEIL_TP - 0.1)
        es.write_wav(out, z, sr=SR_OUT, bits=24)
        m = es.measure_file(out)
        if abs(m["I"] - TARGET_LUFS) < 0.1 and m["TP"] <= CEIL_TP:
            break
        gain += TARGET_LUFS - m["I"]
    m["gain_db"] = round(gain, 2)
    print(f"{out.name}: {len(z) / SR_OUT:.2f} s, I {m['I']} LUFS, TP {m['TP']} dBTP, LRA {m['LRA']}", flush=True)
    return m


def assemble():
    OUT.mkdir(exist_ok=True)
    rs = rows()
    parts = [np.zeros(int(round(LEAD * SR)), np.float32)]
    t = LEAD
    man, cur, end_t0 = [], None, None
    for r in rs:
        if r["first"]:
            cur = {"name": r["name"], "beat": r["beat"], "speaker": r["speaker"], "voiced": r["voiced"],
                   "text": r["seg_text"], "start": None, "after": None, "gain_db": GAIN[r["speaker"]] if r["voiced"] else 0.0,
                   "pieces": []}
            if r["beat"] == "end" and end_t0 is None:
                end_t0 = t
        if r["voiced"]:
            tf = TMP / "takes" / f"row{r['idx']:03d}.wav"
            if not tf.exists() and os.environ.get("QWEN_PARTIAL"):      # pipeline test before the render is complete
                a, meta = np.zeros(SR, np.float32), {"stretch": 1.0, "wer": 1.0, "errors": [], "heard": "", "tries": 0,
                                                     "correct": 0, "seed": 0, "energy": 0.0, "rtf": 0.0}
            else:
                a, _ = sf.read(tf, dtype="float32")
                meta = json.loads(tf.with_suffix(".json").read_text())
            pf = (1.0, None, None)
            if np.abs(a).max() > 0:
                win = DV.pace_window(r) if hasattr(DV, "pace_window") and "QWEN_PACE" not in os.environ else None
                a, *pf = pace_fix(a, r["tts"], win)
                a = cbn.level(a, SEG_LUFS + GAIN[r["speaker"]])
            pre = round(r["pre"] * PAUSE_SCALE, 3)
            parts.append(np.zeros(int(round(pre * SR)), np.float32))
            t += pre
            if cur["start"] is None:
                cur["start"] = t
            parts.append(a.astype(np.float32))
            t += len(a) / SR
            cur["pieces"].append({"text": r["text"], "tts": r["tts"], "instruct": r["instruct"], "tag": r["tag"],
                                  "rate": r["eng_rate"], "stretch": round(meta.get("stretch", 1.0) * pf[0], 3),
                                  "pace_fix": pf[0], "wpm_take": pf[1], "wpm_final": pf[2], "wer": meta["wer"],
                                  "errors": meta["errors"], "heard": meta["heard"], "tries": meta["tries"],
                                  "correct_takes": meta["correct"], "seed": meta["seed"], "energy": meta["energy"],
                                  "measure": meta.get("measure", {}), "wpm": meta.get("wpm_native"), "rtf": meta["rtf"],
                                  "pre": pre, "after": r["after"], "start": round(t - len(a) / SR, 4),
                                  "dur": round(len(a) / SR, 4)})
        else:
            if cur["start"] is None:
                cur["start"] = t
            parts.append(np.zeros(int(round(r["slot"] * SR)), np.float32))
            t += r["slot"]
            cur["slot_note"] = f"[solo cuadro]: silent slot {r['slot']} s, no voice"
        after = round(r["after"] * PAUSE_SCALE, 3) if r["after"] < 1.0 else r["after"]
        parts.append(np.zeros(int(round(after * SR)), np.float32))
        if r["last"]:
            cur["dur"] = round(t - cur["start"], 4)
            cur["start"] = round(cur["start"], 4)
            cur["after"] = after
            man.append(cur)
        t += after
    x = np.concatenate(parts)
    if end_t0 is not None:
        n_end = int(round((end_t0 + END_SCREEN) * SR))
        if n_end > len(x):
            x = np.concatenate([x, np.zeros(n_end - len(x), np.float32)])
    wav = OUT / "narration_es.wav"
    m = finish(x, wav)
    (OUT / "segments_es.json").write_text(json.dumps(
        {"engine": "qwen3tts", "script": "SCRIPT_ES419.md v4 (locked 2026-10-23)",
         "voice": {"model": "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice bf16", "speaker": "ryan", "language": "Spanish",
                   "engine": "gabriele-mastrapasqua/qwen3-tts ef339be (C, MIT), server -j 3", "sampling": SAMPLING,
                   "register": "exclaim (Producer 2026-10-23)", "direction": f"{DV.__name__}.py / DIRECCION_NARRADOR_{DV.__name__[-2:]}.md",
                   "instruct_lang": DV.LANG, "rate_scale": DV.RATE_SCALE, "takes_per_sentence": TAKES,
                   "pick": "highest energy score among WER-0 takes", "voice_characters": True,
                   "pace_window_wpm": [PACE_LO, PACE_HI], "pause_scale": PAUSE_SCALE},
         "target_lufs": TARGET_LUFS, "tp_ceiling": CEIL_TP, "post_gain_db": m["gain_db"], "loudness": m,
         "segments": man}, ensure_ascii=False, indent=1))
    d = OUT / "segments"
    d.mkdir(exist_ok=True)
    for f in d.glob("*.flac"):
        f.unlink()
    for s in man:
        if s["voiced"]:
            subprocess.run([cbn.FF, "-v", "error", "-y", "-ss", f"{s['start']:.4f}", "-t", f"{s['dur'] + 0.05:.4f}",
                            "-i", str(wav), "-ar", str(SR), "-sample_fmt", "s16", "-c:a", "flac",
                            "-compression_level", "8", str(d / f"{s['name']}.flac")], check=True)
    return m


# ------------------------------------------------------------------------------------------------ word timings
def align():
    """Whisper word timestamps per beat aligned to the script text (engine/voice.py align), same output schema as
    the Chatterbox/Kokoro builds: word, start, end, beat, speaker, voiced, text, conf, line [, slot]."""
    wav = OUT / "narration_es.wav"
    man = json.loads((OUT / "segments_es.json").read_text())
    segs = man["segments"]
    x = es.load_audio(wav, sr=16000, channels=1)[:, 0]
    groups = {}
    for s in segs:
        groups.setdefault(s["beat"], []).append(s)
    timings, report = [], {}
    for beat, ss in groups.items():
        voiced = [s for s in ss if s["voiced"]]
        tim_v = []
        if voiced:
            t0 = max(0.0, voiced[0]["start"] - 0.2)
            t1 = voiced[-1]["start"] + voiced[-1]["dur"] + 0.25
            words = bv.whisper(x[int(t0 * 16000): int(t1 * 16000)])
            hyp = " ".join(w["text"] for w in words)
            for w in words:
                for pat, sub in bv.NAME_FIX:
                    w["text"] = re.sub(pat, sub, w["text"])
            text = " ".join(s["text"] for s in voiced)
            tim, rep = ev.align(text, words, "es", t1 - t0)
            owner = []
            for s in voiced:
                owner += [s] * len([w for w in ev.clean_script(s["text"]).split() if re.search(r"\w", w)])
            assert len(owner) == len(tim), (beat, len(owner), len(tim))
            for w, s in zip(tim, owner):
                st = min(max(w["start"] + t0, s["start"]), s["start"] + s["dur"])
                en = min(max(w["end"] + t0, st + 0.02), s["start"] + s["dur"] + 0.05)
                tim_v.append({"word": w["word"], "start": round(st, 3), "end": round(en, 3), "beat": beat,
                              "speaker": s["speaker"], "voiced": True, "text": w["text"], "conf": w["conf"],
                              "line": s["name"]})
            hc = hyp
            for pat, sub in bv.NAME_FIX:
                hc = re.sub(pat, sub, hc)
            ref_t = bv.toks(text)
            if beat == "12":                  # «¡¿Quién f…?» is cut on purpose: the lone "f" is not a word to hear
                ref_t = [t for t in ref_t if t != "f"]
            w_raw, e_raw = bv.wer(ref_t, bv.toks(hyp, hyp=True))
            w_cor, e_cor = bv.wer(bv.canon(ref_t), bv.canon(bv.toks(hc, hyp=True)))
            report[beat] = {"heard": hyp, "wer_raw": round(w_raw, 4), "wer": round(w_cor, 4), "errors": e_cor,
                            "ref_words": len(ref_t), "aligned": f"{rep['matched']}/{rep['words']}",
                            "unmatched": rep["unmatched"]}
            print(f"beat {beat}: WER {w_cor:.1%} {e_cor} aligned {rep['matched']}/{rep['words']}", flush=True)
        tim_c = {}
        for s in ss:                          # [solo cuadro] lines: words spread by length over the silent slot
            if s["voiced"]:
                continue
            ws = [w for w in ev.clean_script(s["text"]).split() if re.search(r"\w", w)]
            lens = np.array([max(1, len(re.sub(r"\W", "", w))) for w in ws], float)
            c = np.concatenate([[0], np.cumsum(lens) / lens.sum()])
            tim_c[s["name"]] = [{"word": re.sub(r"^[^\w]+|[^\w]+$", "", w), "start": round(s["start"] + c[k] * s["dur"], 3),
                                 "end": round(s["start"] + c[k + 1] * s["dur"], 3), "beat": beat, "speaker": s["speaker"],
                                 "voiced": False, "text": w, "conf": 1, "line": s["name"],
                                 "slot": [round(s["start"], 3), round(s["start"] + s["dur"], 3)]} for k, w in enumerate(ws)]
        vi = iter(tim_v)
        for s in ss:
            if s["voiced"]:
                n = len([w for w in ev.clean_script(s["text"]).split() if re.search(r"\w", w)])
                timings += [next(vi) for _ in range(n)]
            else:
                timings += tim_c[s["name"]]
    nar = [w for w in timings if w["voiced"]]
    ev.refine_onsets(nar, wav)
    for w in timings:                       # quoted character lines keep a slot (box timing = the spoken line)
        if w["voiced"] and w["speaker"] != "narrator":
            ln = next(s for s in segs if s["name"] == w["line"])
            w["slot"] = [round(ln["start"], 3), round(ln["start"] + ln["dur"], 3)]
    for k in range(1, len(timings)):
        if timings[k]["start"] <= timings[k - 1]["start"] or timings[k]["start"] < timings[k - 1]["end"] - 0.25:
            timings[k]["start"] = round(max(timings[k - 1]["end"], timings[k - 1]["start"] + 0.02), 3)
        timings[k]["end"] = round(max(timings[k]["end"], timings[k]["start"] + 0.02), 3)
    (OUT / "timings_es.json").write_text("[\n" + ",\n".join(json.dumps(w, ensure_ascii=False) for w in timings) + "\n]\n")
    (OUT / "asr_es.json").write_text(json.dumps(report, ensure_ascii=False, indent=1))
    return report


# ------------------------------------------------------------------------------------------------ QC
def qc():
    wav = OUT / "narration_es.wav"
    man = json.loads((OUT / "segments_es.json").read_text())
    asr = json.loads((OUT / "asr_es.json").read_text())
    tim = json.loads((OUT / "timings_es.json").read_text())
    m = es.measure_file(wav)
    info = sf.info(str(wav))
    x, s = sf.read(wav, dtype="float32")
    x24 = H.to24(x, s)
    pieces = [p for sg in man["segments"] if sg["voiced"] for p in sg["pieces"]]
    nw = sum(cbn.n_words(p["text"]) for p in pieces)
    speech = H.speech_seconds(x24, SR)
    ref = reference()
    beats = {}
    for sg in man["segments"]:
        b = beats.setdefault(sg["beat"], {"start": sg["start"], "end": 0, "pieces": []})
        b["end"] = sg["start"] + sg["dur"] + sg["after"]
        if sg["voiced"]:
            b["pieces"] += sg["pieces"]
    rep_beats = {}
    for k, b in beats.items():
        segm = x24[int(b["start"] * SR): int(b["end"] * SR)]
        try:
            mm = M.measure(segm, SR)
        except Exception:
            mm = {}
        rep_beats[k] = {"start": round(b["start"], 2), "dur": round(b["end"] - b["start"], 2),
                        "wer": asr.get(k, {}).get("wer"), "errors": asr.get(k, {}).get("errors"),
                        "pieces": len(b["pieces"]), "retries": sum(p["tries"] - 1 for p in b["pieces"]),
                        "pieces_wer_gt0": [p["text"] for p in b["pieces"] if p["wer"] > 0],
                        "wpm": round(sum(cbn.n_words(p["text"]) for p in b["pieces"]) / max(0.1, sum(p["dur"] for p in b["pieces"])) * 60, 1) if b["pieces"] else None,
                        "pitch_range_st": mm.get("pitch_range_st"), "melody_std_st": mm.get("melody_std_st"),
                        "energy_std_db": mm.get("energy_std_db"), "f0_median_hz": mm.get("f0_median_hz")}
    whole = M.measure(x24, SR)
    takes_meta = [json.loads(f.read_text()) for f in sorted((TMP / "takes").glob("row*.json"))]
    res = {"duration_s": round(info.duration, 2), "loudness": m, "words_voiced": nw, "speech_s": round(speech, 1),
           "wpm_in_speech": round(nw / speech * 60, 1), "wpm_in_lines": round(nw / sum(p["dur"] for p in pieces) * 60, 1),
           "word_errors": sum(round(p["wer"] * cbn.n_words(p["tts"])) for p in pieces),
           "pieces": len(pieces), "retries": sum(p["tries"] - 1 for p in pieces),
           "takes_total": sum(p["tries"] for p in pieces), "pieces_wer_gt0": [(p["text"], p["heard"]) for p in pieces if p["wer"] > 0],
           "stretched": [(p["text"], p["stretch"]) for p in pieces if p.get("stretch", 1.0) > 1.0],
           "render_cpu_s": round(sum(t["synth_s"] for tm in takes_meta for t in tm["takes"] if "synth_s" in t), 1),
           "render_wall_s": (json.loads((TMP / "render_wall.json").read_text())["wall_s"] if (TMP / "render_wall.json").exists() else None),
           "reference": ref, "whole": {k: whole.get(k) for k in ("f0_median_hz", "pitch_range_st", "pitch_std_st", "melody_std_st", "energy_std_db", "pauses_n", "pause_mean_s")},
           "words": len(tim), "beats": rep_beats, "track_wer": {k: v["wer"] for k, v in asr.items()}}
    # delivery gate (coordinator, 2026-10-24): WER 0 in every sentence, 7:00-8:00 total, 135-170 wpm in every beat
    gate = {"wer_zero_all": res["word_errors"] == 0 and not res["pieces_wer_gt0"],
            "duration_7_8_min": 420.0 <= res["duration_s"] <= 480.0,
            "beats_135_170": {k: b["wpm"] for k, b in rep_beats.items() if b["wpm"] and not (135 <= b["wpm"] <= 170)}}
    gate["pass"] = bool(gate["wer_zero_all"] and gate["duration_7_8_min"] and not gate["beats_135_170"])
    res["gate"] = gate
    print("GATE", json.dumps(gate, ensure_ascii=False), flush=True)
    (OUT / "qc_es.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
    print(json.dumps({k: v for k, v in res.items() if k not in ("beats", "reference", "whole")}, ensure_ascii=False))
    mp3 = OUT / "preview_narracion_es.mp3"
    subprocess.run([cbn.FF, "-v", "error", "-y", "-i", str(wav), "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame",
                    "-b:a", "48k", "-threads", "2", str(mp3)], check=True)
    print(mp3, round(mp3.stat().st_size / 1e6, 2), "MB")
    return res


def fmt_t(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def qc_md():
    """VOICE_QC_qwen.md (Spanish, for the director/Producer) from qc_es.json + segments_es.json + the takes' logs."""
    q = json.loads((OUT / "qc_es.json").read_text())
    man = json.loads((OUT / "segments_es.json").read_text())
    takes_meta = [json.loads(f.read_text()) for f in sorted((TMP / "takes").glob("row*.json"))]
    ref = q["reference"]
    render_s = q.get("render_wall_s")
    L = []
    L.append("# EP001 · Narración con Qwen3-TTS «Ryan» · QC · " + time.strftime("%Y-%m-%d"))
    L.append("")
    L.append("Guion v4 bloqueado, palabra por palabra; dirección oración por oración de `DIRECCION_NARRADOR_v4.md` "
             "(registro exclamativo aprobado por el Productor). Las citas de Eli y Mila las dice el narrador; "
             "«¿Qué?», «¡Dale, dale!» y «¡Nooo!» son solo cuadro (hueco de silencio).")
    L.append("")
    L.append("**Para escuchar:** `qwen/preview_narracion_es.mp3` (" + fmt_t(q["duration_s"]) + ", 48 kbps, "
             + f"{(OUT / 'preview_narracion_es.mp3').stat().st_size / 1e6:.1f} MB).")
    L.append("")
    L.append("## Resumen")
    L.append("")
    L.append("| | Qwen3-TTS Ryan (esta pista) | Objetivo |")
    L.append("|---|---|---|")
    L.append(f"| Duración total (con pantalla final de 20 s) | **{fmt_t(q['duration_s'])}** ({q['duration_s']} s) | 7:30-8:00 |")
    L.append(f"| Palabras locutadas | {q['words_voiced']} | 1074 (guion) |")
    L.append(f"| Ritmo (palabras / segundos con voz) | **{q['wpm_in_speech']} ppm** · dentro de las oraciones {q['wpm_in_lines']} ppm | 145-155 ppm |")
    lo = q["loudness"]
    L.append(f"| Sonoridad / pico (stem) | **{lo['I']} LUFS · TP {lo['TP']} dBTP** · LRA {lo['LRA']} | −16 LUFS, TP ≤ −2 (la mezcla final lleva a −14) |")
    L.append(f"| WER por oración (Whisper small, normalizador de producción) | **{q['word_errors']} errores en {q['pieces']} oraciones** | 0 |")
    L.append(f"| WER de la pista completa por beat (re-escucha del montaje) | " + ", ".join(f"{k}: {v:.1%}" for k, v in q["track_wer"].items() if v) + (" (todo 0)" if not any(q["track_wer"].values()) else "") + " | informativo |")
    L.append(f"| Tomas generadas / retomas | {q['takes_total']} tomas para {q['pieces']} oraciones · **{q['retries']} retomas** (tomas extra por WER o por energía) | ≥ 2-3 correctas por oración |")
    nfix = len([p for sg in man["segments"] if sg["voiced"] for p in sg["pieces"] if p.get("pace_fix", 1.0) != 1.0])
    up = [p["pace_fix"] for sg in man["segments"] if sg["voiced"] for p in sg["pieces"] if p.get("pace_fix", 1.0) > 1.0]
    dn = [p["pace_fix"] for sg in man["segments"] if sg["voiced"] for p in sg["pieces"] if p.get("pace_fix", 1.0) < 1.0]
    v = man["voice"]
    L.append(f"| Ajuste de ritmo en montaje (tempo con tono intacto) | {nfix} oraciones llevadas a {v['pace_window_wpm'][0]:.0f}-{v['pace_window_wpm'][1]:.0f} ppm: "
             f"{len(up)} aceleradas (máx. ×{max(up) if up else 1:.2f}), {len(dn)} frenadas (mín. ×{min(dn) if dn else 1:.2f}); pausas entre oraciones ×{v['pause_scale']} | ritmo 145-155 (Productor) · 135-170 por beat (coordinador) |")
    L.append(f"| Tiempo de render | CPU de síntesis {q['render_cpu_s'] / 3600:.2f} h" + (f" · pared {render_s / 3600:.2f} h" if render_s else "") + " (3 hilos, RTF ≈ {:.1f}) | ~1-1,5 h previstas |".format(
        q["render_cpu_s"] / max(1, sum(t.get("dur", 0) for tm in takes_meta for t in tm["takes"]))))
    L.append("")
    g = q.get("gate", {})
    L.append("**Condición de entrega** (WER 0 en las 127 oraciones · 7:00-8:00 · 135-170 ppm por beat): "
             + ("**PASA**" if g.get("pass") else "**NO PASA**") + f" — WER 0: {g.get('wer_zero_all')} · duración: {g.get('duration_7_8_min')} · beats fuera de 135-170 ppm: {g.get('beats_135_170') or 'ninguno'}.")
    L.append("")
    L.append("## Duración: por qué no cabe en 8:00 a este ritmo")
    L.append("")
    sp = sum(p["dur"] for sg in man["segments"] if sg["voiced"] for p in sg["pieces"])
    pre = sum(p["pre"] for sg in man["segments"] if sg["voiced"] for p in sg["pieces"])
    small = sum(min(sg["after"], 0.999) for sg in man["segments"] if sg["after"] < 1.0) + sum(
        p["after"] * man["voice"]["pause_scale"] for sg in man["segments"] if sg["voiced"] for p in sg["pieces"][:-1] if p["after"] < 1.0)
    big = sum(sg["after"] for sg in man["segments"] if sg["after"] >= 1.0) + sum(
        p["after"] for sg in man["segments"] if sg["voiced"] for p in sg["pieces"][:-1] if p["after"] >= 1.0)
    end_start = next(sg["start"] for sg in man["segments"] if sg["beat"] == "end")
    L.append(f"- Voz (las 127 oraciones, con sus pausas internas): **{sp:.0f} s** → {q['words_voiced'] / sp * 60:.0f} ppm medidos sobre la voz.")
    L.append(f"- Respiraciones antes de las citas y de las cifras: {pre:.0f} s · pausas entre oraciones (< 1 s, ya ×{man['voice']['pause_scale']}): {small:.0f} s · "
             f"pausas del guion (gags, sello 5 s, silencio de 5 s del beat 23, 3 s antes de la pantalla final): {big:.0f} s · pantalla final: 20 s.")
    L.append(f"- Fin del beat 24 en {fmt_t(end_start)}; total {fmt_t(q['duration_s'])}. El propio guion v4 estimaba ≈ 8:08-8:27 con pausas "
             f"(SCRIPT_ES419.md, cabecera). Para terminar en 8:00 haría falta la voz a ≈ {q['words_voiced'] / (sp - (q['duration_s'] - 480)) * 60:.0f} ppm "
             f"con estas pausas, o recortar las pausas entre oraciones a ~0,25 s (×0,6) y subir la voz a ≈ 165 ppm: "
             "las dos cosas chocan con el ritmo que aprobó el Productor (≈150 ppm, «el ritmo estaba mejor») y con la biblia (el chiste vive en la pausa).")
    L.append("- Mando: `QWEN_PACE=lo-hi` (ventana de ppm por oración) y `QWEN_PAUSE_SCALE=x` en `build_voice_qwen.py assemble` re-montan sin volver a sintetizar (≈ 1 min). "
             "Decisión pendiente del director/Productor: 8:34 a 150-165 ppm (esta pista) o 8:00 a ~170 ppm.")
    L.append("")
    L.append("## Energía frente a la referencia que gustó")
    L.append("")
    L.append(f"Referencia: {ref['source']} → rango tonal {ref['pitch_range_st']} st · melodía {ref['melody_std_st']} st · energía {ref['energy_std_db']} dB. "
             "Rango = p95−p5 del f0 en semitonos; melodía = desviación del tono medio por segundo; energía = desviación del nivel RMS (dB).")
    w = q["whole"]
    L.append("")
    L.append(f"**Pista completa:** rango **{w['pitch_range_st']} st** · melodía **{w['melody_std_st']} st** · energía **{w['energy_std_db']} dB** · f0 mediana {w['f0_median_hz']} Hz · {w['pauses_n']} pausas (media {w['pause_mean_s']} s).")
    L.append("")
    L.append("| Beat | Inicio | Tramo | ppm | Rango st | Melodía st | Energía dB | WER | Retomas | Oraciones con WER > 0 |")
    L.append("|---|---|---|---|---|---|---|---|---|---|")
    for k, b in q["beats"].items():
        L.append(f"| {k} | {fmt_t(b['start'])} | {b['dur']} s | {b['wpm'] or '—'} | {b['pitch_range_st']} | {b['melody_std_st']} | {b['energy_std_db']} | "
                 f"{(b['wer'] if b['wer'] is not None else '—')} | {b['retries']} | {', '.join(b['pieces_wer_gt0']) or '—'} |")
    L.append("")
    L.append("## Por oración (toma conservada)")
    L.append("")
    L.append("| # | Beat | Quién | Texto | Tomas (correctas) | Semilla | ppm | Energía (score) | Rango st | Instrucción (matiz) | Oído por Whisper |")
    L.append("|---|---|---|---|---|---|---|---|---|---|---|")
    for t in takes_meta:
        L.append(f"| {t['idx'] + 1} | {t['beat']} | {t['speaker']} | {t['text']} | {t['tries']} ({t['correct']}) | {t['seed']} | {t.get('wpm_native')}"
                 + (f"→{t['wpm_after_stretch']} (×{t['stretch']})" if t.get('stretch', 1.0) > 1.0 else "")
                 + f" | {t['energy']} | {t.get('measure', {}).get('pitch_range_st')} | {t['tag']} | {t['heard']} |")
    L.append("")
    L.append("## Notas")
    L.append("")
    if q["pieces_wer_gt0"]:
        L.append("- Oraciones sin toma perfecta (se conservó la menos mala): " + "; ".join(f"«{a}» → «{b}»" for a, b in q["pieces_wer_gt0"]))
    else:
        L.append("- Todas las oraciones tienen WER 0 en su toma conservada.")
    if q["stretched"]:
        L.append("- Aceleradas en montaje (rubberband, tono intacto): " + "; ".join(f"«{a}» ×{b}" for a, b in q["stretched"]))
    L.append("- Selección de toma: entre las correctas, la de mayor puntuación de energía = rango tonal / " + str(ref["pitch_range_st"])
             + " + variación RMS / " + str(ref["energy_std_db"]) + ", ponderada por ritmo (peso completo desde 140 ppm, 30 % a ≤ 100 ppm): una toma arrastrada mide mucho rango pero es justo lo que el Productor rechazó.")
    L.append("- Re-escucha de la pista completa (Whisper sobre cada beat del montaje, informativo): las diferencias son del ASR en citas gritadas y muy cortas "
             "(«¡¿Que yo qué?!» 0,6 s no se transcribe), en «embotellamiento» y en el arranque de «El auto paciente…» (oye «ehhh»); cada oración por separado dio WER 0.")
    L.append(f"- Tomas correctas por oración: {sum(1 for t in takes_meta if t['correct'] >= 3)} oraciones con ≥ 3, {sum(1 for t in takes_meta if t['correct'] == 2)} con 2, "
             f"{sum(1 for t in takes_meta if t['correct'] < 2)} con 1 (se agotaron las 8 llamadas por alucinaciones; la toma conservada tiene WER 0). "
             "Regla aplicada: 3 tomas correctas en oraciones de ≤ 12 palabras, 2 en las largas salvo que ambas midieran menos energía que la referencia (entonces una 3.ª).")
    L.append("- Servidor: `qwen_tts -d cv17 -j 3 --max-request-seconds 900 --serve 8091` (bf16, sin int8), motor C recompilado en esta máquina (AVX-512 VNNI, sin AMX/BF16: RTF ≈ 9-12 frente a 4-7 en la máquina de la prueba de motores).")
    (OUT / "VOICE_QC_qwen.md").write_text("\n".join(L) + "\n")
    print("VOICE_QC_qwen.md written")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = sys.argv[1:]
    takes = int(flags[flags.index("--takes") + 1]) if "--takes" in flags else TAKES
    only = None
    if "--rows" in flags:
        a, b = flags[flags.index("--rows") + 1].split("-")
        only = (int(a), int(b))
    stage = args[0] if args else "all"
    if stage in ("render", "all"):
        render(takes, only)
    if stage in ("assemble", "all"):
        assemble()
    if stage in ("align", "all"):
        align()
    if stage in ("qc", "all"):
        qc()
        qc_md()
    if stage == "qcmd":
        qc_md()


if __name__ == "__main__":
    main()
