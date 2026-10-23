"""Render the expressive test passage with per-sentence direction (direction.py) and one reference.

    TQDM_DISABLE=1 OMP_NUM_THREADS=2 nice -n 10 /tmp/claude-0/cbnat/venv/bin/python -I render_expressive.py NAME \
        --ref PATH|builtin [--tries 10] [--flat]      (--flat = one fixed setting, the rejected take's, for comparison)

Passage (verbatim, locked script): beats 1-4 (narration + Eli's and Mila's lines, read by the narrator), beat 9 (with
Eli's "No… no… ¡no!"), and the dinner punchline of beat 13 (its last three sentences + Eli's "¿Ni un perdón?").
Every sentence is one Chatterbox call (very short sentences are grouped with a neighbour, except character lines),
with its own exaggeration / cfg / temperature / pace / pauses from direction.direct(); the auto-retry rule (Whisper
WER = 0, up to --tries seeds) keeps the best take.
Writes $CB_OUT/NAME.wav, NAME.json (per piece: profile, settings, WER, tries, heard), NAME_pieces/*.wav (per script
line, for the dialogue comparison) and NAME_segments.json (line slots: start, dur, speaker, voiced).
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path[:0] = [str(HERE), str(HERE.parent / "chatterbox_natural")]
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402

import cbn  # noqa: E402
import direction as D  # noqa: E402

bv = cbn.bv
OUT = Path(os.environ.get("CB_OUT", "/tmp/claude-0/cbnat/expr/out"))
BEATS_FULL = ("01", "02", "03", "04", "09")
B13_TAIL = ("Ese conductor ya llegó a su casa.", "Seguro ya está cenando.",
            "Por eso no ves ninguna razón: la razón ya se fue a cenar.")


def passage():
    out = []
    for s in bv.plan("episode"):
        if s["beat"] in BEATS_FULL:
            out.append(s)
        elif s["beat"] == "13":
            if s["speaker"] == "narrator" and s["text"].startswith("Ahora llévalo"):
                out.append(dict(s, text=" ".join(B13_TAIL), opt={"after": s["after"]}))
            elif s["speaker"] == "eli" and s["text"] == "¿Ni un perdón?":
                out.append(s)
    return out


def sentences(line):
    return D.split_directed(line)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("--ref", default="builtin")
    ap.add_argument("--tries", type=int, default=10)
    ap.add_argument("--flat", action="store_true", help="rejected take's single setting (0.45/0.4/0.75) for all")
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    pdir = OUT / f"{a.name}_pieces"
    pdir.mkdir(exist_ok=True)
    m = cbn.load("v3", "base")
    cbn.set_ref(m, a.ref, 0.5)
    plan = passage()
    log, segs, parts, t = [], [], [], 0.0
    for li, s in enumerate(plan):
        spk = s["speaker"]
        if spk == "narrator":
            groups = sentences(s["opt"].get("tts", s["text"]))
        else:
            groups = [s["text"]]
        line_parts = []
        for gi, g in enumerate(groups):
            d = D.direct(g, s["beat"], spk)
            if a.flat:
                d.update(ex=0.45, cfg=0.4, temp=0.75, speed=1.0, before=0.0, pscale=1.0, gain=0.0, breath=0.0, profile="flat")
            kw = dict(exaggeration=d["ex"], cfg_weight=d["cfg"], temperature=d["temp"])
            print(f"[{li + 1}/{len(plan)}:{gi + 1}] {spk} {d['profile']} {kw} speed {d['speed']} | {g}", flush=True)
            r = cbn.synth(m, g, kw, seed=5000 + 97 * li + 13 * gi, tries=a.tries, tts=d["tts"])
            au = cbn.level(cbn.tempo(r["audio"], d["speed"]), -20.0 + d["gain"])
            pre = d["before"] + d["breath"]
            if gi == 0 and li == 0:
                pre = 0.0
            post = cbn.pause_after(g) * d["pscale"] if gi < len(groups) - 1 else d["breath"]
            line_parts += [np.zeros(int(pre * cbn.SR), np.float32), au, np.zeros(int(post * cbn.SR), np.float32)]
            log.append({k: v for k, v in r.items() if k not in ("audio", "takes")} | {
                "beat": s["beat"], "speaker": spk, "line": s["name"], "profile": d["profile"], "kw": kw,
                "speed": d["speed"], "pause_before": round(pre, 2), "pause_after": round(post, 2),
                "gain_db": d["gain"], "dur_out": round(len(au) / cbn.SR, 3), "takes_wer": [tk["wer"] for tk in r["takes"]]})
        la = np.concatenate(line_parts)
        sf.write(pdir / f"{s['name']}.wav", la, cbn.SR, subtype="FLOAT")
        segs.append({"name": s["name"], "beat": s["beat"], "speaker": spk, "voiced": True, "text": s["text"],
                     "start": round(t, 3), "dur": round(len(la) / cbn.SR, 3), "after": s["after"]})
        parts += [la, np.zeros(int(s["after"] * cbn.SR), np.float32)]
        t += len(la) / cbn.SR + s["after"]
    x = np.concatenate(parts)
    sf.write(OUT / f"{a.name}.wav", x, cbn.SR, subtype="FLOAT")
    words = sum(cbn.n_words(l["text"]) for l in log)
    errs = sum(round(l["wer"] * cbn.n_words(l["text"])) for l in log)
    speech = sum(l["dur_out"] for l in log)
    summ = {"name": a.name, "ref": a.ref, "flat": a.flat, "tries_max": a.tries, "dur_s": round(len(x) / cbn.SR, 2),
            "words": words, "word_errors": errs, "wer": round(errs / words, 4),
            "retries": sum(l["tries"] - 1 for l in log), "pieces": len(log),
            "pieces_imperfect": [(l["text"], l["heard"]) for l in log if l["wer"] > 0],
            "wpm_in_speech": round(words / speech * 60, 1),
            "synth_s": round(sum(l["synth_s"] for l in log), 1)}
    if a.ref != "builtin":
        summ["similarity_to_ref"] = cbn.similarity(x, a.ref)
    summ["similarity_to_producer"] = cbn.similarity(x, str(HERE.parent / "producer" / "producer_reference_clean.flac"))
    print(json.dumps(summ, ensure_ascii=False), flush=True)
    cbn.dump({"summary": summ, "pieces": log}, OUT / f"{a.name}.json")
    cbn.dump(segs, OUT / f"{a.name}_segments.json")


if __name__ == "__main__":
    main()
