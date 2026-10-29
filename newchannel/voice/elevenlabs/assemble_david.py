#!/usr/bin/env python3
"""EP001 narration stem from the accepted ElevenLabs takes (David C, eleven_v4). 0 credits: local only.

    TQDM_DISABLE=1 OMP_NUM_THREADS=2 nice -n 10 /tmp/claude-0/cbnat/venv/bin/python -I \
        newchannel/voice/elevenlabs/assemble_david.py [--check] [--beats 01-24] [--takes-dir DIR] [--out DIR]
        [--pause-scale 1.0] [--allow-unchecked]

--check            only resolve the pause plan against the prompts + list which takes exist / pass QC (no audio written)
--beats a-b        assemble only those beats (test runs; use with --out, the episode files need every beat)
--takes-dir DIR    where the takes live (default newchannel/voice/elevenlabs/takes)
--out DIR          output folder (default newchannel/ep/001/audio = the episode files the animatic reads)
--pause-scale x    scale for the pauses under 1 s (the gag pauses, the 5 s silence and the end hold never scale)
--allow-unchecked  accept takes without a PASS/CHECK report from qc_take.py (never for the delivered track)

Takes: takes/ep001_bNN.mp3 (one prompt) or takes/ep001_bNN-MM.mp3 (one take that covers beats NN..MM, e.g. the hook
in a single call). Each needs its qc_take.py report (<take>.qc.json) with verdict PASS or CHECK and the same
script_text as ep001_prompts.json (a take of an older prompt is refused).

Per take: trim leading/trailing silence; faster-whisper words (16 kHz numpy) aligned to the script words of its beats
(engine/voice.py align, the production normaliser); the pause plan below is applied INSIDE the take (a gap is only
ever lengthened to its target, never shortened: David's own breathing stays); «¡¿Quién f…?» (beat 12) is cut 90 ms
into the /f/ of the synthesised «¡¿Quién fue?!»; the `[solo cuadro]` lines get their silent slot. Takes are levelled
toward their median loudness (±2 dB max, so the soft beat 23 stays soft), joined with the sheet pauses between beats,
then HPF 70 Hz + 2.5:1 compression, 48 kHz 24-bit, −16 LUFS, true peak ≤ −2 dBTP (the final mix takes it to −14).

Output (--out, default ep/001/audio): narration_es.wav (not in git), timings_es.json and segments_es.json in the SAME
schema as the Qwen build (word, start, end, beat, speaker, voiced, text, conf, line[, slot]; line ids
b{beat}_{script_parse index}_{speaker}). Before the first write into ep/001/audio the current Qwen files are kept as
timings_es_qwen.json / segments_es_qwen.json / narration_es_qwen.wav; existing *_qwen files are never overwritten.
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import qc_take as Q                                                # noqa: E402  (sets HF_HOME, paths, bv, es)

import numpy as np                                                 # noqa: E402

bv, es = Q.bv, Q.es
ev = bv.ev
import script_parse                                                # noqa: E402

AUD = Q.AUD
SR = 48000
SR16 = Q.SR16
LEAD = 0.25                 # silence before the first word
END_GAP = 3.0               # after «Esto es Diez Mil Puntos.» (the dot caught + «tin») before the end screen
END_SCREEN = 20.0           # title scene held with YouTube's end screen, no narration (v5, Producer 2026-10-28)
TARGET_LUFS, CEIL_TP = -16.0, -2.0
LEVEL_SPREAD_DB = 2.0
FADE = 0.015

# Pause after each beat (s), from direction_v4.py (the sheet the Qwen track used) adapted to v5: the asides of the
# punch-up (#2, #4, #6, #10, #12, #13) now sit in what used to be silent gag pauses (direction section of the script).
AFTER = {"01": 0.5, "02": 0.45, "03": 0.4, "04": 5.0, "06": 0.6, "07": 0.6, "08": 0.65, "09": 0.65, "10": 0.65,
         "11": 0.65, "12": 0.65, "13": 1.0, "14": 0.8, "15": 0.65, "16": 0.65, "17": 0.65, "18": 0.65, "19": 0.65,
         "20": 0.65, "21": 0.6, "22": 0.65, "23": 1.0, "24": END_GAP}

# Minimum gap AFTER the last word of a script fragment, inside a beat (s). "slot" = the next `[solo cuadro]` line sits
# in that gap (its words get voiced:false + slot); "cut_f" = cut the synthesised «fue» at the /f/, then the gap.
BREAKS = {
    "01": [("Una sola vez.", 0.45)],
    "03": [("¡¿Quién fue?!", 0.4), ("ni semáforo.", 2.0)],                 # 2 s: the bird on the wire (pausa)
    "04": [("va para atrás.", 3.86, "slot")],                                 # «¿Qué?» [solo cuadro] 1.6 s: after Mila's box + 1.25 s (A15 wave)
    "06": [("de verdad.", 0.4), ("¡Fue el de adelante!", 0.4), ("alguien adelante.", 0.42)],
    "07": [("completamente parados.", 0.45), ("¡¿Quién fue?!", 1.2), ("Respuesta corta: todos.", 0.3)],
    "08": [("hacia atrás, a unos veinte por hora.", 0.42)],
    "09": [("en el diez:", 0.35), ("No… no… ¡no!", 0.3)],
    "10": [("alguien lo cuenta.", 1.0)],                                     # Eli reads the giant gossip balloon
    "11": [("vuelta entera.", 0.5), ("Como siempre.", 0.6), ("no es un lugar.", 0.5)],
    "12": [("círculos se atascan.", 0.42), ("o más: embotellamiento.", 0.6), ("¡¿Quién f…?", 1.5, "cut_f"),
           ("la densidad.", 0.42)],
    "13": [("ninguna razón:", 0.8), ("a cenar.", 1.2)],                      # the fork, then the finger comes down
    "14": [("¿Llenar la autopista de autos robot?", 0.55), ("veintiún autos.", 0.42), ("hueco, ciérrenlo.", 0.35)],
    "15": [("como un resorte.", 0.4)],
    "16": [("se derritió.", 0.5), ("de veintiuno.", 0.5)],
    "17": [("sube silbando.", 0.5), ("¡¿Quién fue?!", 1.2), ("Eli.", 0.45), ("Fue el viento.", 1.0),
           ("no es ir lento.", 0.5)],                                       # 1.2 s: everybody stares (pausa)
    "18": [("la velocidad promedio.", 0.35), ("¡Cabe una casa!", 0.3), ("es mi amigo.", 1.5)],
    "19": [("es la jugada.", 0.3), ("tarde a todo!", 0.4), ("Mila lo sabe.", 0.5), ("absorber eso.", 0.3)],
    "20": [("Ni prestados.", 0.4), ("¿El resultado?", 0.45), ("Es complicado.", 0.42)],
    "21": [("dos autos inteligentes, y se achica.", 2.19, "slot"), ("apagado, y crece.", 2.19, "slot"), ("crecer o encoger.", 0.5)],
    "22": [("parte de la ola.", 0.4), ("No el de adelante.", 0.4), ("corras a cerrarlo.", 0.8)],
    "23": [("deja el espacio.", 5.0), ("Quién fue?", 0.5)],                  # 5 s: the wave dies in Eli's gap
    "24": [("nunca pasó.", 0.5), ("no es un lugar.", 0.5), ("puede absorberla.", 0.5), ("Hasta Eli.", 0.6)],
}
NUMBER_PRE = {   # 0.6 s before a sentence with a number (bible); same mechanism: min gap after the previous word
    "06": [("¡Fue el de adelante!", 0.6)], "07": [("por allá.", 0.6)],
    "12": [("círculos se atascan.", 0.6), ("catorce metros.", 0.6)],
    "14": [("autos robot?", 0.6)], "16": [("se derritió.", 0.6), ("casi desaparecieron.", 0.6)],
    "20": [("de verdad?", 0.6)],
}
# 2026-10-29 (director, binding; applied to the delivered stem by widen_box_slots.py, same result as a re-run): the box is
# FULLY visible for need = max(1.6 s, 0.5 s + 0.08 s per character); the whole box (show0 = slot - 0.06, + 0.2 pop-in, +
# need, + 1 frame, + 0.16 pop-out) keeps >= 0.1 s narrator-free on each side -> gap >= 2.19 s; «¿Qué?» also waits for Mila's box to
# close + 1.25 s for A15_back (gap 3.86 s). Slots: 1.6 s each. Older note:
# [solo cuadro] slot = the box's reading time (art/lib/textbox.js: 0.4 s + 0.06 s per character of the joined line text);
# the box is open from slot start - 0.06 to max(slot, read) + 0.12 (fade), so the gap around a slot must be >= read +
# 0.44 s for 0.1 s of narrator-free margin on each side (2026-10-29: the 0.3 s slots of beat 21 put the narrator over
# «¡Dale, dale!» 0.72 s and «¡Nooo!» 0.38 s). «¿Qué?» 5 chars 0.70 s (gap 1.25 >= 1.14) · «¡Dale, dale!» 12 chars 1.12 s
# (gap 1.6 >= 1.56) · «¡Nooo!» 6 chars 0.76 s (gap 1.25 >= 1.20)
SLOT_LEN = {"04": [1.6], "21": [1.6, 1.6]}


# ------------------------------------------------------------------------------------------------ script model
def script_units(beats_sel=None):
    """{beat: {"segs": [(idx, seg)], "words": [{text, seg_idx, norm}]}} for every beat with voiced text."""
    segs = script_parse.parse_episode()
    out = {}
    for i, s in enumerate(segs):
        if s["speaker"] == "pause" or (beats_sel and s["beat"] not in beats_sel):
            continue
        b = out.setdefault(s["beat"], {"segs": [], "words": []})
        b["segs"].append((i, s))
        if s.get("voiced", True):
            for w in ev.clean_script(s["text"]).split():
                if re.search(r"\w", w):
                    b["words"].append({"text": w, "seg": i, "norm": " ".join(bv.toks(w))})
    return segs, out


def find_after(words, frag):
    """Index of the last word of `frag` inside `words` (unique match on normalised words)."""
    f = [" ".join(bv.toks(w)) for w in frag.split() if re.search(r"\w", w)]
    hits = [k + len(f) - 1 for k in range(len(words) - len(f) + 1) if [w["norm"] for w in words[k:k + len(f)]] == f]
    if len(hits) != 1:
        raise SystemExit(f"pause fragment {frag!r}: {len(hits)} matches")
    return hits[0]


def plan(beat, unit, pause_scale=1.0):
    """[(word_idx, min_gap, kind, slot_seg)] for one beat, merged (max gap per word)."""
    ops = {}
    for item in BREAKS.get(beat, []) + NUMBER_PRE.get(beat, []):
        frag, gap = item[0], item[1]
        kind = item[2] if len(item) > 2 else "gap"
        k = find_after(unit["words"], frag)
        g = gap * pause_scale if gap < 1.0 else gap
        o = ops.setdefault(k, [0.0, "gap"])
        o[0] = max(o[0], g)
        if kind != "gap":
            o[1] = kind
    slots = iter(SLOT_LEN.get(beat, []))
    out = []
    for k in sorted(ops):
        g, kind = ops[k]
        slot = None
        if kind == "slot":                           # the [solo cuadro] segment that follows this word's segment
            si = unit["words"][k]["seg"]
            cand = [(i, s) for i, s in unit["segs"] if i > si and not s.get("voiced", True)]
            slot = (cand[0][0], next(slots))
        out.append((k, g, kind, slot))
    return out


# ------------------------------------------------------------------------------------------------ takes
def find_takes(takes_dir: Path, beats: list[str]):
    """Ordered [(beats_covered, path)] covering `beats`; a range file ep001_bNN-MM.mp3 wins over single files."""
    files = {}
    for f in sorted(takes_dir.glob("ep001_b*.mp3")):
        m = re.fullmatch(r"ep001_b(\d\d)(?:-(\d\d))?", f.stem)
        if m:
            a, b = m.group(1), m.group(2) or m.group(1)
            files[(a, b)] = f
    units, missing, k = [], [], 0
    while k < len(beats):
        b = beats[k]
        rng = sorted([(a, z) for (a, z) in files if a == b and z != a], key=lambda r: -int(r[1]))
        done = False
        for a, z in rng:
            cov = [x for x in beats[k:] if int(a) <= int(x) <= int(z)]
            if cov and cov == beats[k:k + len(cov)]:
                units.append((cov, files[(a, z)]))
                k += len(cov)
                done = True
                break
        if done:
            continue
        if (b, b) in files:
            units.append(([b], files[(b, b)]))
        else:
            missing.append(b)
        k += 1
    return units, missing


def qc_report(path: Path, cov, prompts):
    rp = path.with_suffix(".qc.json")
    if not rp.exists():
        return None, "no qc report"
    r = json.loads(rp.read_text())
    want = " ".join(p["script_text"] for p in prompts if p["beat"] in cov)
    if r.get("script_text") != want:
        return r, "qc report is for another script_text (prompt edited after the take?)"
    if r.get("verdict") not in ("PASS", "CHECK"):
        return r, f"verdict {r.get('verdict')}"
    return r, None


def silence_run(a, t0, t1, thr_db):
    """Longest run of 10 ms frames under thr_db inside [t0, t1] (seconds) -> (start, end) or None."""
    hop = int(0.01 * SR)
    i0, i1 = max(0, int(t0 * SR)), min(len(a), int(t1 * SR))
    if i1 - i0 < hop:
        return None
    fr = a[i0: i0 + (i1 - i0) // hop * hop].reshape(-1, hop)
    db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
    q = db < thr_db
    best, k = None, 0
    while k < len(q):
        if q[k]:
            j = k
            while j < len(q) and q[j]:
                j += 1
            if best is None or j - k > best[1] - best[0]:
                best = (k, j)
            k = j
        else:
            k += 1
    if best is None:
        return None
    return t0 + best[0] * 0.01, t0 + best[1] * 0.01


def process_unit(cov, path, units, pause_scale, log=print):
    """One take -> (audio 48k, word list with times relative to the processed take, info)."""
    a = Q.load(path, SR)
    i0, i1 = Q.trim_bounds(a, SR)
    a = a[i0:i1].copy()
    a16 = Q.load(path, SR16)[int(i0 / SR * SR16): int(i1 / SR * SR16)]
    wwords = Q.whisper_words(a16)
    words = [dict(w) for b in cov for w in units[b]["words"]]
    text = " ".join(w["text"] for w in words)
    tim, rep = ev.align(text, [dict(w) for w in wwords], "es", len(a) / SR)
    assert len(tim) == len(words), (cov, len(tim), len(words))
    for w, t in zip(words, tim):
        w.update(start=t["start"], end=t["end"], conf=t["conf"], word=t["word"])
    # pause plan on the take's own timeline: per beat breaks + the beat's AFTER when the take covers the next beat too
    ops, base = [], 0
    for j, b in enumerate(cov):
        n = len(units[b]["words"])
        for k, g, kind, slot in plan(b, units[b], pause_scale):
            ops.append((base + k, g, kind, slot))
        if j < len(cov) - 1:
            g = AFTER[b] * pause_scale if AFTER[b] < 1.0 else AFTER[b]
            ops.append((base + n - 1, g, "gap", None))
        base += n
    speech_db = 20 * np.log10(np.percentile(np.abs(a), 99.5) + 1e-9)
    thr = speech_db - 32.0
    edits = []                                           # (pos, remove_until, insert_s, word_idx, kind, slot)
    for k, g, kind, slot in ops:
        if k + 1 >= len(words):
            continue                                     # last word of the take: the inter-take pause handles it
        w, nx = words[k], words[k + 1]
        if kind == "cut_f":
            q0 = words[k - 1]["start"] - 0.1                  # «Quién» of the quote
            fue = [x for x in wwords if re.sub(r"\W", "", x["text"].lower()) == "fue" and x["start"] >= q0]
            t_cut = (fue[0]["start"] + 0.09) if fue else (w["start"] + 0.5 * (w["end"] - w["start"]))
            run = silence_run(a, t_cut, nx["start"] + 0.3, thr)
            t_next = run[1] - 0.02 if run else nx["start"]
            edits.append((t_cut, max(t_cut, t_next), g, k, kind, slot))
            w["end"] = round(t_cut, 3)
            if not fue:
                log(f"   beat {cov}: «fue» not heard, cut at the aligned span ({t_cut:.2f} s): check by ear")
            continue
        run = silence_run(a, max(w["start"] + 0.05, w["end"] - 0.3), min(nx["end"] - 0.05, nx["start"] + 0.3), thr)
        if run and run[1] - run[0] >= 0.03:
            have, pos = run[1] - run[0], 0.5 * (run[0] + run[1])
        else:
            have, pos = 0.0, 0.5 * (w["end"] + nx["start"])
        edits.append((pos, pos, max(0.0, g - have), k, kind, slot))
    slots = []
    for pos, until, ins, k, kind, slot in sorted(edits, key=lambda e: -e[0]):
        p0, p1 = int(pos * SR), int(until * SR)
        f = int(FADE * SR)
        if kind == "cut_f" and p0 > f:
            a[p0 - f:p0] *= np.linspace(1, 0, f, dtype=np.float32)
        a = np.concatenate([a[:p0], np.zeros(int(round(ins * SR)), np.float32), a[p1:]])
        shift = ins - (until - pos)
        for w in words[k + 1:]:
            w["start"] = round(w["start"] + shift, 3)
            w["end"] = round(w["end"] + shift, 3)
        for s in slots:
            s[1] += shift
        if words[k]["end"] > pos:
            words[k]["end"] = round(pos, 3)
        if slot:                                         # centred in the (now final) gap before the next word
            mid = 0.5 * (words[k]["end"] + words[k + 1]["start"])
            slots.append([slot[0], mid - slot[1] / 2, slot[1]])
    info = {"take": str(path), "beats": cov, "heard": rep["whisper_text"], "aligned": f"{rep['matched']}/{rep['words']}",
            "unmatched": rep["unmatched"], "dur": round(len(a) / SR, 3), "trim": [round(i0 / SR, 3), round(i1 / SR, 3)],
            "edits": [{"after_word": words[e[3]]["text"], "kind": e[4], "at": round(e[0], 3), "inserted_s": round(e[2], 3),
                       "removed_s": round(e[1] - e[0], 3)} for e in sorted(edits)]}
    return a, words, slots, info


def finish(x, out: Path):
    ch = "highpass=f=70:poles=2,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:knee=4"
    p = subprocess.run([Q.FF, "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", ch,
                        "-f", "f32le", "-"], input=x.astype(np.float32).tobytes(), capture_output=True, check=True)
    y = np.frombuffer(p.stdout, np.float32).copy()[:, None]
    gain = 0.0
    for _ in range(8):
        z = es.limit(y * es.db(gain), CEIL_TP - 0.1)
        es.write_wav(out, z, sr=SR, bits=24)
        m = es.measure_file(out)
        if abs(m["I"] - TARGET_LUFS) < 0.1 and m["TP"] <= CEIL_TP:
            break
        gain += TARGET_LUFS - m["I"]
    m["gain_db"] = round(gain, 2)
    print(f"{out.name}: {len(z) / SR:.2f} s, I {m['I']} LUFS, TP {m['TP']} dBTP, LRA {m['LRA']}", flush=True)
    return m


def lufs(a):
    import pyloudnorm
    return pyloudnorm.Meter(SR).integrated_loudness(a.astype(np.float64)) if len(a) > SR // 2 else -70.0


def backup_qwen(out: Path):
    if out.resolve() != AUD.resolve():
        return
    seg = out / "segments_es.json"
    if seg.exists() and json.loads(seg.read_text()).get("engine") == "elevenlabs":
        return                                            # a re-run: the current files are already David's
    for a, b in (("timings_es.json", "timings_es_qwen.json"), ("segments_es.json", "segments_es_qwen.json"),
                 ("narration_es.wav", "narration_es_qwen.wav")):
        if (out / a).exists() and not (out / b).exists():
            shutil.copy2(out / a, out / b)
            print(f"kept {a} -> {b}")


def main():
    fl = sys.argv[1:]

    def opt(name, default=None):
        return fl[fl.index(name) + 1] if name in fl else default
    takes_dir = Path(opt("--takes-dir", str(Q.TAKES))).resolve()
    out = Path(opt("--out", str(AUD))).resolve()
    pause_scale = float(opt("--pause-scale", "1.0"))
    prompts = Q.load_prompts()
    beats = [p["beat"] for p in prompts]
    if opt("--beats"):
        a, b = (int(x) for x in opt("--beats").split("-"))
        beats = [x for x in beats if a <= int(x) <= b]
    segs, units = script_units(set(beats))
    for b in beats:                                       # the plan must resolve on the locked text
        plan(b, units[b], pause_scale)
    tu, missing = find_takes(takes_dir, beats)
    problems = []
    for cov, path in tu:
        r, why = qc_report(path, cov, prompts)
        print(f"  {'-'.join([cov[0], cov[-1]]) if len(cov) > 1 else cov[0]:>6}  {path.name:<22} "
              f"{(r or {}).get('verdict', '—'):<6} {why or ''}")
        if why:
            problems.append((cov, why))
    if missing:
        print("missing takes for beats:", ", ".join(missing))
    print(f"pause plan resolves for {len(beats)} prompts; {len(tu)} takes found, {len(missing)} missing")
    if "--check" in fl:
        return
    if opt("--beats") and out == AUD.resolve():
        raise SystemExit("--beats is a test run: pass --out <scratch dir> (the episode files need every beat)")
    if missing or (problems and "--allow-unchecked" not in fl):
        raise SystemExit("not assembling: " + "; ".join([f"missing {missing}"] * bool(missing) +
                                                         [f"{c}: {w}" for c, w in problems]))
    out.mkdir(parents=True, exist_ok=True)
    proc = []
    for cov, path in tu:
        print(f"[{'-'.join(dict.fromkeys([cov[0], cov[-1]]))}] {path.name}", flush=True)
        a, words, slots, info = process_unit(cov, path, units, pause_scale)
        info["lufs_take"] = round(lufs(a), 2)
        print(f"   aligned {info['aligned']} · {info['dur']} s · {info['lufs_take']} LUFS · edits "
              + ", ".join(f"{e['after_word']}+{e['inserted_s']}" for e in info["edits"] if e["inserted_s"] > 0.01), flush=True)
        proc.append((cov, a, words, slots, info))
    med = float(np.median([p[4]["lufs_take"] for p in proc]))
    parts, t = [np.zeros(int(LEAD * SR), np.float32)], LEAD
    timings, seg_times, takes_info = [], {}, []
    for cov, a, words, slots, info in proc:
        g = float(np.clip(med - info["lufs_take"], -LEVEL_SPREAD_DB, LEVEL_SPREAD_DB))
        info["gain_db"] = round(g, 2)
        info["start"] = round(t, 3)
        parts.append(a * es.db(g))
        for w in words:
            seg = segs[w["seg"]]
            timings.append({"word": w["word"], "start": round(w["start"] + t, 3), "end": round(w["end"] + t, 3),
                            "beat": seg["beat"], "speaker": seg["speaker"], "voiced": True, "text": w["text"],
                            "conf": w["conf"], "line": f"b{seg['beat']}_{w['seg']:02d}_{seg['speaker']}", "_seg": w["seg"]})
        for si, s0, ln in slots:
            seg_times[si] = (s0 + t, ln)
        t += len(a) / SR
        last = cov[-1]
        gap = END_GAP + END_SCREEN if last == "24" else (AFTER[last] * pause_scale if AFTER[last] < 1.0 else AFTER[last])
        parts.append(np.zeros(int(round(gap * SR)), np.float32))
        t += gap
        takes_info.append(info)
    x = np.concatenate(parts)
    backup_qwen(out)
    wav = out / "narration_es.wav"
    m = finish(x, wav)
    nar = [w for w in timings]
    ev.refine_onsets(nar, wav)
    # [solo cuadro] lines: words spread by length over their slot (voiced false), inserted in script order
    for si, (s0, ln) in seg_times.items():
        s = segs[si]
        ws = [w for w in ev.clean_script(s["text"]).split() if re.search(r"\w", w)]
        lens = np.array([max(1, len(re.sub(r"\W", "", w))) for w in ws], float)
        c = np.concatenate([[0], np.cumsum(lens) / lens.sum()])
        for k, w in enumerate(ws):
            timings.append({"word": re.sub(r"^[^\w]+|[^\w]+$", "", w), "start": round(s0 + c[k] * ln, 3),
                            "end": round(s0 + c[k + 1] * ln, 3), "beat": s["beat"], "speaker": s["speaker"],
                            "voiced": False, "text": w, "conf": 1, "line": f"b{s['beat']}_{si:02d}_{s['speaker']}",
                            "slot": [round(s0, 3), round(s0 + ln, 3)], "_seg": si})
    timings.sort(key=lambda w: (w["_seg"], w["start"]))
    for k in range(1, len(timings)):
        if timings[k]["start"] <= timings[k - 1]["start"] or timings[k]["start"] < timings[k - 1]["end"] - 0.25:
            timings[k]["start"] = round(max(timings[k - 1]["end"], timings[k - 1]["start"] + 0.02), 3)
        timings[k]["end"] = round(max(timings[k]["end"], timings[k]["start"] + 0.02), 3)
    # segment manifest (same fields the mix / animatic read: name, beat, speaker, voiced, text, start, dur, after)
    man = []
    for si, s in enumerate(segs):
        if s["speaker"] == "pause" or s["beat"] not in units:
            continue
        ws = [w for w in timings if w["_seg"] == si]
        if not ws:
            continue
        st, en = ws[0]["start"], max(w["end"] for w in ws)
        man.append({"name": f"b{s['beat']}_{si:02d}_{s['speaker']}", "beat": s["beat"], "speaker": s["speaker"],
                    "voiced": s.get("voiced", True), "text": s["text"], "start": round(st, 4), "dur": round(en - st, 4),
                    "gain_db": 0.0})
    for k, sg in enumerate(man):
        nxt = man[k + 1]["start"] if k + 1 < len(man) else len(x) / SR
        sg["after"] = round(max(0.0, nxt - sg["start"] - sg["dur"]), 4)
    for sg in man:
        if not sg["voiced"]:
            sg["slot_note"] = f"[solo cuadro]: silent slot {sg['dur']} s, no voice"
    for w in timings:
        if w["voiced"] and w["speaker"] != "narrator":
            ln = next(s for s in man if s["name"] == w["line"])
            w["slot"] = [round(ln["start"], 3), round(ln["start"] + ln["dur"], 3)]
        w.pop("_seg", None)
    (out / "timings_es.json").write_text("[\n" + ",\n".join(json.dumps(w, ensure_ascii=False) for w in timings) + "\n]\n")
    meta = json.loads(Q.PROMPTS.read_text())
    (out / "segments_es.json").write_text(json.dumps(
        {"engine": "elevenlabs", "script": "SCRIPT_ES419.md v5 (locked 2026-10-28)",
         "voice": {"model": meta["model"], "voice": meta["voice"], "voice_id": meta["voice_id"],
                   "prompts": "voice/elevenlabs/ep001_prompts.json", "pause_scale": pause_scale,
                   "pauses": "voice/elevenlabs/assemble_david.py AFTER / BREAKS / NUMBER_PRE", "level_spread_db": LEVEL_SPREAD_DB},
         "target_lufs": TARGET_LUFS, "tp_ceiling": CEIL_TP, "post_gain_db": m["gain_db"], "loudness": m,
         "duration_s": round(len(x) / SR, 2), "end_screen_s": END_SCREEN if "24" in units else 0.0,
         "takes": takes_info, "segments": man}, ensure_ascii=False, indent=1))
    print(f"wrote {wav} ({len(x) / SR:.1f} s), timings_es.json ({len(timings)} words), segments_es.json ({len(man)} lines)")


if __name__ == "__main__":
    main()
