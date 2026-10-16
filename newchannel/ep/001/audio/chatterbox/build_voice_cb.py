#!/usr/bin/env python3
"""EP001 narration with Chatterbox (narrator only). Eli and Mila have NO voice (Producer, 2026-10-16): their lines
become on-screen text boxes, so each character line keeps its timing slot as silence of the same length it had in
the Kokoro track (segments_es.json `dur`), plus its original `after` air. The box reading time is preserved.

    TQDM_DISABLE=1 OMP_NUM_THREADS=2 nice -n 10 /tmp/claude-0/cbnat/venv/bin/python -I \
        ep/001/audio/chatterbox/build_voice_cb.py [render|assemble|align|qc|all] [episode|short|both]

Voice settings: VOICE below (reference, model, exaggeration / cfg / temperature, mode). Text: the locked script via
build_voice.plan() (same segments, same pauses, same `[pause x]` gag pauses, same `after`), word for word. Kokoro's
respellings (Náshvil, Tenesí, corrras) are NOT used: Chatterbox reads graphemes; a respelling is only a fallback when
every take of a piece fails Whisper.
Auto-retry rule: every piece is re-synthesized with a new seed while its faster-whisper transcript differs from the
script (WER > 0 after the production normaliser), up to TRIES; the best take is kept and logged.
Output (this folder): narration_es.wav (48 kHz 24 bit, -18 LUFS, TP <= -2 dBTP; not in git), narration_es_preview.mp3,
segments/*.flac (narrator lines), segments_es.json, timings_es.json (+ _short_ versions), qc_es.json.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
AUD = HERE.parent
NC = AUD.parents[2]
sys.path[:0] = [str(NC / "voice" / "chatterbox_natural")]
import cbn  # noqa: E402  (puts ep/001/audio and engine on the path, loads build_voice)
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402

bv = cbn.bv
ev = bv.ev
es = bv.es
SR = cbn.SR
CACHE = Path(os.environ.get("CB_CACHE", "/tmp/claude-0/cbnat/cache"))
TMP = Path(os.environ.get("CB_TMP", "/tmp/claude-0/cbnat/ep001"))
TRIES = int(os.environ.get("CB_TRIES", "6"))

VOICE = json.loads(os.environ["CB_VOICE"]) if os.environ.get("CB_VOICE") else {
    "ref": "builtin", "model": "v3", "s3gen": "base", "mode": "sentence",
    "exaggeration": 0.5, "cfg_weight": 0.4, "temperature": 0.75,
    "speed": 1.0, "speed_jitter": 0.03, "pause_jitter": 0.15, "ex_jitter": 0.05,
}
FALLBACK_RESPELL = {"Nashville": "Náshvil", "Tennessee": "Tenesí"}


def _hash(*a):
    return hashlib.sha1(json.dumps(a, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:12]


def ref_id():
    r = VOICE["ref"]
    if r == "builtin":
        return "builtin"
    return Path(r).name + ":" + hashlib.sha1(Path(r).read_bytes()).hexdigest()[:10]


def pieces_of(text, mode):
    """Split a TTS text (with [pause x]) into [(piece, gap_after)] following the variant's mode."""
    chunks = re.split(r"\[pause\s+([\d.]+)\]", text)
    out = []
    for ci in range(0, len(chunks), 2):
        part = chunks[ci].strip()
        if not part:
            continue
        sents = cbn.split_sentences(part)
        groups = []
        if mode == "sentence":
            for s in sents:
                if groups and (cbn.n_words(s) < 5 or cbn.n_words(groups[-1]) < 5) and len(groups[-1]) + len(s) < 160:
                    groups[-1] = f"{groups[-1]} {s}"
                else:
                    groups.append(s)
        else:
            cur = ""
            for s in sents:
                if cur and len(cur) + 1 + len(s) > 200:
                    groups.append(cur)
                    cur = s
                else:
                    cur = f"{cur} {s}".strip()
            groups.append(cur)
        for gi, g in enumerate(groups):
            out.append([g, None])
        if ci + 1 < len(chunks):
            out[-1][1] = float(chunks[ci + 1])
    return out


_M = None


def model():
    global _M
    if _M is None:
        _M = cbn.load(VOICE["model"], VOICE["s3gen"])
        cbn.set_ref(_M, VOICE["ref"], VOICE["exaggeration"])
    return _M


def kokoro_manifest(kind):
    f = AUD / ("segments_es.json" if kind == "episode" else "segments_short_es.json")
    return {s["name"]: s for s in json.loads(f.read_text())["segments"]}


def render(kind):
    CACHE.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(1610 if kind == "episode" else 1611)
    kok = kokoro_manifest(kind)
    plan = bv.plan(kind)
    out = []
    for s in plan:
        if s["speaker"] != "narrator":
            out.append({"name": s["name"], "beat": s["beat"], "speaker": s["speaker"], "text": s["text"],
                        "voiced": False, "slot": round(kok[s["name"]]["dur"], 4), "after": s["after"]})
            continue
        tts = s["opt"].get("tts", s["text"])          # script spelling + [pause x]; no Kokoro respellings
        pcs = pieces_of(tts, VOICE["mode"])
        files, plog = [], []
        for pi, (txt, gap) in enumerate(pcs):
            ex = VOICE["exaggeration"] + (rng.uniform(-VOICE["ex_jitter"], VOICE["ex_jitter"]) if VOICE["ex_jitter"] else 0)
            sp = VOICE["speed"] * (1 + (rng.uniform(-VOICE["speed_jitter"], VOICE["speed_jitter"]) if VOICE["speed_jitter"] else 0))
            pj = rng.uniform(-VOICE["pause_jitter"], VOICE["pause_jitter"]) if VOICE["pause_jitter"] else 0.0
            kw = dict(exaggeration=round(ex, 3), cfg_weight=VOICE["cfg_weight"], temperature=VOICE["temperature"])
            key = _hash(txt, kw, ref_id(), VOICE["model"], VOICE["s3gen"], TRIES)
            f = CACHE / f"{s['name']}_{pi:02d}_{key}.wav"
            jf = f.with_suffix(".json")
            if not f.exists():
                print(f"[{s['name']} {pi + 1}/{len(pcs)}] {txt}", flush=True)
                seed = int(key[:6], 16)
                r = cbn.synth(model(), txt, kw, seed, tries=TRIES)
                if r["wer"] > 0:                          # last resort: a respelling, if the piece has one
                    alt = txt
                    for a, b in FALLBACK_RESPELL.items():
                        alt = alt.replace(a, b)
                    if alt != txt:
                        r2 = cbn.synth(model(), txt, kw, seed + 1, tries=TRIES, tts=alt)
                        if r2["wer"] < r["wer"]:
                            r = r2
                sf.write(f, r["audio"], SR, subtype="FLOAT")
                jf.write_text(json.dumps({k: v for k, v in r.items() if k != "audio"}, ensure_ascii=False))
            meta = json.loads(jf.read_text())
            gap_after = gap if gap is not None else (cbn.pause_after(txt) * (1 + pj) if pi < len(pcs) - 1 else 0.0)
            files.append({"file": str(f), "speed": round(sp, 4), "gap": round(gap_after, 3)})
            plog.append({"text": txt, "tts": meta["tts"], "wer": meta["wer"], "errors": meta["errors"],
                         "heard": meta["heard"], "tries": meta["tries"], "seed": meta["seed"], "kw": kw,
                         "speed": round(sp, 4), "rtf": meta["rtf"]})
        out.append({"name": s["name"], "beat": s["beat"], "speaker": "narrator", "text": s["text"], "voiced": True,
                    "after": s["after"], "pieces": files, "log": plog, "gain_db": s["opt"].get("gain_db", 0.0)})
    (TMP / f"render_{kind}.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    return out


def assemble(kind):
    plan = json.loads((TMP / f"render_{kind}.json").read_text())
    t = bv.LEAD if kind == "episode" else bv.SHORT_LEAD
    parts = [np.zeros(int(round(t * SR)), np.float32)]
    man, end_t0 = [], None
    for s in plan:
        if s["voiced"]:
            segs = []
            for p in s["pieces"]:
                a, _ = sf.read(p["file"], dtype="float32")
                segs.append(cbn.tempo(a, p["speed"]))
                if p["gap"]:
                    segs.append(np.zeros(int(round(p["gap"] * SR)), np.float32))
            a = np.concatenate(segs)
            g = bv.SEG_LUFS - bv.lufs(a) + s.get("gain_db", 0.0)
            a = a * 10 ** (g / 20)
            dur = len(a) / SR
        else:
            a = np.zeros(int(round(s["slot"] * SR)), np.float32)
            g, dur = 0.0, len(a) / SR
        if s["beat"] == "end" and end_t0 is None:
            end_t0 = t
        man.append({"name": s["name"], "beat": s["beat"], "speaker": s["speaker"], "voiced": s["voiced"],
                    "text": s["text"], "start": round(t, 4), "dur": round(dur, 4), "after": s["after"],
                    "gain_db": round(g, 2), **({"pieces": s["log"]} if s["voiced"] else
                                                {"slot_note": "silent text-box slot = Kokoro line duration"})})
        parts += [a.astype(np.float32), np.zeros(int(round(s["after"] * SR)), np.float32)]
        t += dur + int(round(s["after"] * SR)) / SR
    x = np.concatenate(parts)
    if kind == "episode" and end_t0 is not None:
        n_end = int(round((end_t0 + bv.END_SCREEN) * SR))
        if n_end > len(x):
            x = np.concatenate([x, np.zeros(n_end - len(x), np.float32)])
    wav = HERE / ("narration_es.wav" if kind == "episode" else "short_es.wav")
    m = bv.finish(x, wav)
    (HERE / ("segments_es.json" if kind == "episode" else "segments_short_es.json")).write_text(json.dumps(
        {"engine": "chatterbox", "voice": VOICE | {"ref": ref_id()}, "target_lufs": bv.TARGET_LUFS,
         "tp_ceiling": bv.CEIL_TP, "post_gain_db": m["gain_db"], "segments": man}, ensure_ascii=False, indent=1))
    d = HERE / ("segments" if kind == "episode" else "segments_short")
    d.mkdir(exist_ok=True)
    for f in d.glob("*.flac"):
        f.unlink()
    import subprocess
    for s in man:
        if s["voiced"]:
            subprocess.run([cbn.FF, "-v", "error", "-y", "-ss", f"{s['start']:.4f}", "-t", f"{s['dur'] + 0.05:.4f}",
                            "-i", str(wav), "-ar", str(SR), "-sample_fmt", "s16", "-c:a", "flac",
                            "-compression_level", "8", str(d / f"{s['name']}.flac")], check=True)
    return m


def align(kind):
    wav = HERE / ("narration_es.wav" if kind == "episode" else "short_es.wav")
    man = json.loads((HERE / ("segments_es.json" if kind == "episode" else "segments_short_es.json")).read_text())
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
                              "speaker": "narrator", "voiced": True, "text": w["text"], "conf": w["conf"],
                              "line": s["name"]})
            hc = hyp
            for pat, sub in bv.NAME_FIX:
                hc = re.sub(pat, sub, hc)
            w_raw, e_raw = bv.wer(bv.toks(text), bv.toks(hyp, hyp=True))
            w_cor, e_cor = bv.wer(bv.canon(bv.toks(text)), bv.canon(bv.toks(hc, hyp=True)))
            report[beat] = {"heard": hyp, "wer_raw": round(w_raw, 4), "wer": round(w_cor, 4), "errors": e_cor,
                            "ref_words": len(bv.toks(text)), "aligned": f"{rep['matched']}/{rep['words']}",
                            "unmatched": rep["unmatched"]}
            print(f"beat {beat}: WER {w_cor:.1%} {e_cor} aligned {rep['matched']}/{rep['words']}", flush=True)
        # silent character lines: words spread by length over the slot (the box reading time)
        tim_c = {}
        for s in ss:
            if s["voiced"]:
                continue
            ws = [w for w in ev.clean_script(s["text"]).split() if re.search(r"\w", w)]
            lens = np.array([max(1, len(re.sub(r"\W", "", w))) for w in ws], float)
            c = np.concatenate([[0], np.cumsum(lens) / lens.sum()])
            tim_c[s["name"]] = [{"word": re.sub(r"^[^\w]+|[^\w]+$", "", w), "start": round(s["start"] + c[k] * s["dur"], 3),
                                 "end": round(s["start"] + c[k + 1] * s["dur"], 3), "beat": beat, "speaker": s["speaker"],
                                 "voiced": False, "text": w, "conf": 1, "line": s["name"],
                                 "slot": [round(s["start"], 3), round(s["start"] + s["dur"], 3)]} for k, w in enumerate(ws)]
        # interleave in script order
        vi = iter(tim_v)
        for s in ss:
            if s["voiced"]:
                n = len([w for w in ev.clean_script(s["text"]).split() if re.search(r"\w", w)])
                timings += [next(vi) for _ in range(n)]
            else:
                timings += tim_c[s["name"]]
    nar = [w for w in timings if w["voiced"]]
    ev.refine_onsets(nar, wav)
    for k in range(1, len(timings)):
        if timings[k]["start"] <= timings[k - 1]["start"] or timings[k]["start"] < timings[k - 1]["end"] - 0.25:
            timings[k]["start"] = round(max(timings[k - 1]["end"], timings[k - 1]["start"] + 0.02), 3)
        timings[k]["end"] = round(max(timings[k]["end"], timings[k]["start"] + 0.02), 3)
    out = HERE / ("timings_es.json" if kind == "episode" else "timings_short_es.json")
    out.write_text("[\n" + ",\n".join(json.dumps(w, ensure_ascii=False) for w in timings) + "\n]\n")
    (HERE / ("asr_es.json" if kind == "episode" else "asr_short_es.json")).write_text(
        json.dumps(report, ensure_ascii=False, indent=1))
    return report


def qc(kind):
    wav = HERE / ("narration_es.wav" if kind == "episode" else "short_es.wav")
    man = json.loads((HERE / ("segments_es.json" if kind == "episode" else "segments_short_es.json")).read_text())
    kman = json.loads((AUD / ("segments_es.json" if kind == "episode" else "segments_short_es.json")).read_text())
    asr = json.loads((HERE / ("asr_es.json" if kind == "episode" else "asr_short_es.json")).read_text())
    tim = json.loads((HERE / ("timings_es.json" if kind == "episode" else "timings_short_es.json")).read_text())
    m = es.measure_file(wav)
    info = sf.info(str(wav))

    def beats_of(segs):
        b = {}
        for s in segs:
            d = b.setdefault(s["beat"], {"start": s["start"], "end": 0})
            d["end"] = s["start"] + s["dur"] + s["after"]
        return b
    bc, bk = beats_of(man["segments"]), beats_of(kman["segments"])
    beats = {k: {"start": round(v["start"], 2), "slot": round(v["end"] - v["start"], 2),
                 "kokoro_start": round(bk[k]["start"], 2), "kokoro_slot": round(bk[k]["end"] - bk[k]["start"], 2),
                 "wer": asr.get(k, {}).get("wer"), "errors": asr.get(k, {}).get("errors"),
                 "retries": sum(p["tries"] - 1 for s in man["segments"] if s["beat"] == k and s["voiced"]
                                for p in s["pieces"]),
                 "pieces_imperfect": [p["text"] for s in man["segments"] if s["beat"] == k and s["voiced"]
                                      for p in s["pieces"] if p["wer"] > 0]} for k, v in bc.items()}
    nw = sum(len(bv.toks(s["text"])) for s in man["segments"] if s["voiced"])
    errs = sum(round((asr[k]["wer"]) * asr[k]["ref_words"]) for k in asr)
    spk = sum(s["dur"] for s in man["segments"] if s["voiced"])
    pieces = [p for s in man["segments"] if s["voiced"] for p in s["pieces"]]
    res = {"duration_s": round(info.duration, 2), "kokoro_duration_s": round(sf.info(str(AUD / wav.name)).duration, 2)
           if (AUD / wav.name).exists() else None, "loudness": m, "words_narrator": nw, "word_errors": errs,
           "wer": round(errs / max(1, nw), 4), "pieces": len(pieces), "retries": sum(p["tries"] - 1 for p in pieces),
           "pieces_wer_gt0": [(p["text"], p["heard"]) for p in pieces if p["wer"] > 0],
           "narrator_wpm_in_lines": round(nw / spk * 60, 1), "silent_slots": [
               {"line": s["name"], "speaker": s["speaker"], "start": s["start"], "dur": s["dur"], "text": s["text"]}
               for s in man["segments"] if not s["voiced"]], "words": len(tim), "beats": beats}
    (HERE / ("qc_es.json" if kind == "episode" else "qc_short_es.json")).write_text(
        json.dumps(res, ensure_ascii=False, indent=1))
    print(json.dumps({k: v for k, v in res.items() if k not in ("beats", "silent_slots")}, ensure_ascii=False))
    import subprocess
    mp3 = HERE / ("narration_es_preview.mp3" if kind == "episode" else "short_es_preview.mp3")
    subprocess.run([cbn.FF, "-v", "error", "-y", "-i", str(wav), "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame",
                    "-b:a", "80k", "-threads", "2", str(mp3)], check=True)
    return res


def main():
    stage = sys.argv[1] if len(sys.argv) > 1 else "all"
    kinds = {"episode": ["episode"], "short": ["short"]}.get(sys.argv[2] if len(sys.argv) > 2 else "both",
                                                             ["short", "episode"])
    for k in kinds:
        if stage in ("render", "all"):
            render(k)
        if stage in ("assemble", "all"):
            assemble(k)
        if stage in ("align", "all"):
            align(k)
        if stage in ("qc", "all"):
            qc(k)


if __name__ == "__main__":
    main()
