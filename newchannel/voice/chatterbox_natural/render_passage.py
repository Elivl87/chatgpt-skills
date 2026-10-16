"""Render the narrator test passage (hook beats 1-4 narration + beat 9) with one Chatterbox setting.

    TQDM_DISABLE=1 OMP_NUM_THREADS=2 nice -n 10 /tmp/claude-0/cbnat/venv/bin/python -I render_passage.py OUT_NAME \
        --ref builtin|PATH --model v3|latam --s3gen base|v3 --mode chunk|sentence --ex 0.5 --cfg 0.5 --temp 0.8 \
        [--speed 1.0] [--speed-jitter 0.03] [--pause-jitter 0.15] [--ex-jitter 0.05] [--tries 6] [--only N]

chunk mode   = each narrator line (or <= ~200-char group of sentences) in one call: the model's own prosody across
               sentences; fixed gaps between lines (0.5 s) and beats (0.8 s).
sentence mode = prosody helpers: one call per sentence (very short sentences < 5 words are grouped with a neighbour,
               because the autoregressive model hallucinates on tiny inputs), pause after each by its punctuation
               (cbn.PUNCT_PAUSE, +-jitter), slight per-sentence speed and exaggeration variation (seeded).
Writes $OUTDIR/OUT_NAME.wav (24 kHz) + OUT_NAME.json (per-chunk WER, retries, seeds, timings).
"""
import argparse
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402

import cbn  # noqa: E402
import script_parse  # noqa: E402  (ep/001/audio, on cbn's path)

OUTDIR = Path(os.environ.get("CB_OUT", "/tmp/claude-0/cbnat/work/out"))


def passage():
    """[(beat, narrator line)] verbatim from the locked script: beats 1-4 narration + beat 9."""
    return [(s["beat"], s["text"]) for s in script_parse.parse_episode()
            if s["speaker"] == "narrator" and s["beat"] in ("01", "02", "03", "04", "09")]


def group_chunk(text, max_chars=200):
    sents = cbn.split_sentences(text)
    out, cur = [], ""
    for s in sents:
        if cur and len(cur) + 1 + len(s) > max_chars:
            out.append(cur)
            cur = s
        else:
            cur = f"{cur} {s}".strip()
    if cur:
        out.append(cur)
    return out


def group_sentence(text, min_words=5):
    sents = cbn.split_sentences(text)
    out = []
    for s in sents:
        if out and (cbn.n_words(s) < min_words or cbn.n_words(out[-1]) < min_words) and len(out[-1]) + len(s) < 160:
            out[-1] = f"{out[-1]} {s}"
        else:
            out.append(s)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("--ref", default="builtin")
    ap.add_argument("--model", default="v3")
    ap.add_argument("--s3gen", default="base")
    ap.add_argument("--mode", default="chunk")
    ap.add_argument("--ex", type=float, default=0.5)
    ap.add_argument("--cfg", type=float, default=0.5)
    ap.add_argument("--temp", type=float, default=0.8)
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--speed-jitter", type=float, default=0.0)
    ap.add_argument("--pause-jitter", type=float, default=0.0)
    ap.add_argument("--ex-jitter", type=float, default=0.0)
    ap.add_argument("--tries", type=int, default=6)
    ap.add_argument("--only", type=int, default=0, help="render only the first N chunks (quick tests)")
    a = ap.parse_args()
    OUTDIR.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(20261016)
    m = cbn.load(a.model, a.s3gen)
    cbn.set_ref(m, a.ref, a.ex)
    plan = []
    prev_beat = None
    for beat, line in passage():
        pieces = group_chunk(line) if a.mode == "chunk" else group_sentence(line)
        for k, p in enumerate(pieces):
            plan.append({"beat": beat, "text": p, "new_line": k == 0, "new_beat": beat != prev_beat})
        prev_beat = beat
    if a.only:
        plan = plan[: a.only]
    log, parts, t = [], [], 0.0
    for i, c in enumerate(plan):
        if i:
            if c["new_beat"]:
                gap = 0.8
            elif c["new_line"]:
                gap = 0.5
            elif a.mode == "sentence":
                gap = cbn.pause_after(plan[i - 1]["text"], a.pause_jitter, rng)
            else:
                gap = 0.4
            parts.append(np.zeros(int(gap * cbn.SR), np.float32))
            t += gap
        ex = a.ex + (rng.uniform(-a.ex_jitter, a.ex_jitter) if a.ex_jitter else 0.0)
        sp = a.speed * (1.0 + (rng.uniform(-a.speed_jitter, a.speed_jitter) if a.speed_jitter else 0.0))
        kw = dict(exaggeration=round(ex, 3), cfg_weight=a.cfg, temperature=a.temp)
        print(f"[{i + 1}/{len(plan)}] beat {c['beat']} ex {kw['exaggeration']} speed {sp:.3f} | {c['text']}", flush=True)
        r = cbn.synth(m, c["text"], kw, seed=1000 + 37 * i, tries=a.tries)
        au = cbn.level(cbn.tempo(r["audio"], sp))
        parts.append(au)
        log.append({k: v for k, v in r.items() if k != "audio"} | {"beat": c["beat"], "start": round(t, 3),
                   "dur_out": round(len(au) / cbn.SR, 3), "speed": round(sp, 4), "kw": kw})
        t += len(au) / cbn.SR
    x = np.concatenate(parts)
    sf.write(OUTDIR / f"{a.name}.wav", x, cbn.SR, subtype="FLOAT")
    words = sum(cbn.n_words(c["text"]) for c in plan)
    errs = sum(round(l["wer"] * cbn.n_words(l["text"])) for l in log)
    speech = sum(l["dur_out"] for l in log)
    summ = {"name": a.name, "args": vars(a), "model_info": m._info, "dur_s": round(len(x) / cbn.SR, 2),
            "words": words, "word_errors": errs, "wer": round(errs / words, 4),
            "retries": sum(l["tries"] - 1 for l in log), "chunks": len(log),
            "wpm_in_speech": round(words / speech * 60, 1), "synth_s": round(sum(sum(tk["synth_s"] for tk in l["takes"]) for l in log), 1)}
    if a.ref != "builtin":
        summ["similarity_to_ref"] = cbn.similarity(x, a.ref)
    print(json.dumps(summ, ensure_ascii=False), flush=True)
    cbn.dump({"summary": summ, "chunks": log}, OUTDIR / f"{a.name}.json")


if __name__ == "__main__":
    main()
