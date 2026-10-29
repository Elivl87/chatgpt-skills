#!/usr/bin/env python3
"""QC of one ElevenLabs take (EP001, David C, eleven_v4) against the locked v5 script. 0 credits: local only.

    TQDM_DISABLE=1 OMP_NUM_THREADS=2 /tmp/claude-0/cbnat/venv/bin/python -I \
        newchannel/voice/elevenlabs/qc_take.py URL_OR_FILE BEAT [--text "..."] [--no-save]

BEAT: a prompt id of ep001_prompts.json ("3", "03", "12", "12a" if a beat is ever split) or a range "01-04" (the
script_text of those prompts joined: used to test a multi-beat take such as the v5 hook). --text overrides the reference.
URL: downloaded to newchannel/voice/elevenlabs/takes/ep001_bNN.mp3 (an existing file there is kept as *_prevK.mp3).
A local file is read in place. The report is written next to the take as <take>.qc.json (unless --no-save) and
assemble_david.py only uses takes whose report says PASS or CHECK (CHECK = the director listened and accepted).

What it measures:
- faster-whisper small (int8, CPU) on a 16 kHz numpy array decoded by ffmpeg (faster-whisper's own `av` decoder is
  broken in this venv), beam 5, Spanish, word timestamps;
- normalised WER vs `script_text` (production normaliser of ep/001/audio/build_voice.py: accents, numbers, Eli
  spellings). Known ASR confusions are NOT failures but «check by ear»: ni<->mi, el<->la before a vowel, a dropped or
  added plural -s/-es, a/ha, y/e, two script words glued into one token ("auto frena" -> "autofrena");
- eleven_v4 tags read aloud (an English tag word in the transcript) = FAIL;
- duration (after trimming the leading/trailing silence), wpm over the trimmed take and over voiced time,
  peak dBFS / true peak dBTP / integrated LUFS (ffmpeg ebur128).
Verdict: FAIL = any real word error, a tag read aloud, or a pace < 100 / > 200 wpm. CHECK = only allow-listed
confusions, pace outside 125-175 wpm, or true peak > −1 dBTP. PASS = WER 0 and everything in range.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import ssl
import sys
import urllib.request
from pathlib import Path

os.environ.setdefault("OMP_NUM_THREADS", "2")
os.environ.setdefault("HF_HOME", "/tmp/claude-0/ttdenv/hf")        # faster-whisper small is cached there
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TQDM_DISABLE", "1")
HERE = Path(__file__).resolve().parent                             # newchannel/voice/elevenlabs
NC = HERE.parents[1]                                               # newchannel/
AUD = NC / "ep" / "001" / "audio"
sys.path[:0] = [str(AUD), str(NC / "engine")]

import numpy as np                                                 # noqa: E402

import build_voice as bv                                           # noqa: E402  toks / canon / wer / whisper / NAME_FIX
import sound as es                                                 # noqa: E402  load_audio / measure_file

PROMPTS = HERE / "ep001_prompts.json"
TAKES = HERE / "takes"
FF = "/usr/bin/ffmpeg"
SR16 = 16000
TAG_WORDS = {"curious", "excited", "indignant", "deadpan", "amazed", "laughs", "softly", "warm", "nervous", "sad",
             "sarcastic", "mischievously", "whispers", "whisper", "sighs"}
VOWEL = re.compile(r"^[aeiouh]")


# ------------------------------------------------------------------------------------------------ prompts
def load_prompts():
    return json.loads(PROMPTS.read_text())["prompts"]


def beat_id(b: str) -> str:
    m = re.fullmatch(r"(\d+)([a-z]?)", b.strip().lower())
    if not m:
        raise SystemExit(f"bad beat id {b!r}")
    return f"{int(m.group(1)):02d}{m.group(2)}"


def prompt_for(beat: str) -> list[dict]:
    """One prompt id -> [entry]; a range '01-04' -> every prompt whose beat number falls inside it."""
    ps = load_prompts()
    if "-" in beat:
        a, b = (int(re.match(r"\d+", x).group()) for x in beat.split("-"))
        sel = [p for p in ps if a <= int(re.match(r"\d+", p["beat"]).group()) <= b]
    else:
        bid = beat_id(beat)
        sel = [p for p in ps if p["beat"] == bid] or [p for p in ps if p["beat"].rstrip("ab") == bid]
    if not sel:
        raise SystemExit(f"no prompt for beat {beat}")
    return sel


def take_path(beat: str) -> Path:
    if "-" in beat:
        a, b = beat.split("-")
        return TAKES / f"ep001_b{beat_id(a)}-{beat_id(b)}.mp3"
    return TAKES / f"ep001_b{beat_id(beat)}.mp3"


# ------------------------------------------------------------------------------------------------ audio
def fetch(src: str, beat: str) -> Path:
    if not re.match(r"https?://", src):
        p = Path(src).expanduser().resolve()
        if not p.exists():
            raise SystemExit(f"no such file {p}")
        return p
    dst = take_path(beat)
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():                                  # never lose a paid take
        k = 1
        while dst.with_name(f"{dst.stem}_prev{k}.mp3").exists():
            k += 1
        shutil.move(dst, dst.with_name(f"{dst.stem}_prev{k}.mp3"))
    ca = os.environ.get("SSL_CERT_FILE") or ("/root/.ccr/ca-bundle.crt" if Path("/root/.ccr/ca-bundle.crt").exists() else None)
    ctx = ssl.create_default_context(cafile=ca) if ca else ssl.create_default_context()
    req = urllib.request.Request(src, headers={"User-Agent": "dmp-qc/1.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=120) as r, open(dst, "wb") as f:
        shutil.copyfileobj(r, f)
    print(f"downloaded -> {dst} ({dst.stat().st_size / 1e6:.2f} MB)")
    return dst


def load(path: Path, sr: int) -> np.ndarray:
    return es.load_audio(path, sr=sr, channels=1)[:, 0]


def trim_bounds(a: np.ndarray, sr: int, rel_db=-45.0, hop=0.01, keep_head=0.03, keep_tail=0.08):
    """(i0, i1) sample bounds without the leading/trailing silence (frames under peak-frame-level + rel_db)."""
    n = max(1, int(hop * sr))
    fr = a[: len(a) // n * n].reshape(-1, n)
    db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
    on = np.flatnonzero(db > db.max() + rel_db)
    if not len(on):
        return 0, len(a)
    i0 = max(0, on[0] * n - int(keep_head * sr))
    i1 = min(len(a), (on[-1] + 1) * n + int(keep_tail * sr))
    return i0, i1


def voiced_seconds(a: np.ndarray, sr: int, rel_db=-35.0, hop=0.02, min_gap=0.25) -> float:
    """Seconds of speech: frames above peak + rel_db, with gaps shorter than min_gap counted as speech."""
    n = int(hop * sr)
    fr = a[: len(a) // n * n].reshape(-1, n)
    db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
    act = db > db.max() + rel_db
    k, g = 0, int(min_gap / hop)
    while k < len(act):                               # fill short gaps
        if not act[k]:
            j = k
            while j < len(act) and not act[j]:
                j += 1
            if 0 < k and j < len(act) and j - k < g:
                act[k:j] = True
            k = j
        else:
            k += 1
    return float(act.sum() * hop)


def whisper_words(a16: np.ndarray):
    """faster-whisper words (numpy input, 0.2 s lead-in so the first onset is not clipped); times relative to a16."""
    lead = int(0.2 * SR16)
    words = bv.whisper(np.concatenate([np.zeros(lead, np.float32), a16.astype(np.float32)]))
    for w in words:
        w["start"] = max(0.0, w["start"] - 0.2)
        w["end"] = max(w["start"], w["end"] - 0.2)
        for pat, sub in bv.NAME_FIX:
            w["text"] = re.sub(pat, sub, w["text"])
    return words


# ------------------------------------------------------------------------------------------------ WER with allow-list
def align_ops(ref: list[str], hyp: list[str]):
    """Levenshtein alignment -> (distance, ops) with ops = (kind, ref_index, ref_tok, hyp_tok), kind in sub/del/ins."""
    d = np.zeros((len(ref) + 1, len(hyp) + 1), int)
    d[:, 0] = range(len(ref) + 1)
    d[0, :] = range(len(hyp) + 1)
    for i in range(1, len(ref) + 1):
        for j in range(1, len(hyp) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (ref[i - 1] != hyp[j - 1]))
    i, j, ops = len(ref), len(hyp), []
    while i > 0 or j > 0:
        if i > 0 and j > 0 and d[i, j] == d[i - 1, j - 1] + (ref[i - 1] != hyp[j - 1]):
            if ref[i - 1] != hyp[j - 1]:
                ops.append(("sub", i - 1, ref[i - 1], hyp[j - 1]))
            i, j = i - 1, j - 1
        elif i > 0 and d[i, j] == d[i - 1, j] + 1:
            ops.append(("del", i - 1, ref[i - 1], ""))
            i -= 1
        else:
            ops.append(("ins", i, "", hyp[j - 1]))
            j -= 1
    return int(d[-1, -1]), ops[::-1]


def classify(ops, ref: list[str]) -> tuple[list[str], list[str]]:
    """Split alignment errors into (hard, check_by_ear) with the allow-list of known ASR confusions."""
    hard, soft = [], []
    pairs = {("ni", "mi"), ("mi", "ni"), ("a", "ha"), ("ha", "a"), ("y", "e"), ("e", "y")}
    for kind, i, r, h in ops:
        if kind == "sub":
            e = f"{r}->{h}"
            nxt = ref[i + 1] if i + 1 < len(ref) else ""
            if (r, h) in pairs or ({r, h} == {"el", "la"} and VOWEL.match(nxt)) \
                    or r == h + "s" or h == r + "s" or r == h + "es" or h == r + "es":
                soft.append(e)
            else:
                hard.append(e)
        elif kind == "del":
            hard.append(f"-{r}")
        else:
            (soft if h in ("s", "es") else hard).append(f"+{h}")
    return hard, soft


def score(ref_text: str, words: list[dict], cut_f=False) -> dict:
    hyp = " ".join(w["text"] for w in words)
    ref_t = bv.canon(bv.toks(ref_text))
    if cut_f:
        ref_t = [t for t in ref_t if t != "f"]
    hyp_t = bv.canon(bv.toks(hyp, hyp=True))
    # ASR glued two script words into one token ("auto frena" -> "autofrena"): split it back, report it by ear
    glue = {ref_t[i] + ref_t[i + 1]: (ref_t[i], ref_t[i + 1]) for i in range(len(ref_t) - 1)}
    merged, ht = [], []
    for t in hyp_t:
        if t in glue and t not in ref_t:
            ht += list(glue[t])
            merged.append(f"{' '.join(glue[t])}->{t}")
        else:
            ht.append(t)
    hyp_t = ht
    dist, ops = align_ops(ref_t, hyp_t)
    w = dist / max(1, len(ref_t))
    errs = [f"{r}->{h}" if k == "sub" else (f"-{r}" if k == "del" else f"+{h}") for k, _, r, h in ops]
    hard, soft = classify(ops, ref_t)
    soft = merged + soft
    tags_read = sorted({t for t in re.findall(r"[a-z]+", hyp.lower()) if t in TAG_WORDS})
    return {"heard": hyp, "wer": round(w, 4), "errors": errs, "hard": hard, "check_by_ear": soft,
            "tags_read_aloud": tags_read, "ref_words": len(ref_t)}


def loudness(path: Path) -> dict:
    m = es.measure_file(path)
    a = load(path, 48000)
    pk = float(20 * np.log10(np.abs(a).max() + 1e-9))
    return {"lufs_i": m["I"], "true_peak_dbtp": m["TP"], "lra": m["LRA"], "peak_dbfs": round(pk, 2)}


def verdict(r: dict) -> tuple[str, list[str]]:
    why = []
    st = "PASS"
    if r["asr"]["hard"]:
        st, _ = "FAIL", why.append(f"word errors {r['asr']['hard']}")
    if r["asr"]["tags_read_aloud"]:
        st, _ = "FAIL", why.append(f"tag read aloud: {r['asr']['tags_read_aloud']}")
    if not (100 <= r["wpm_trimmed"] <= 200):
        st, _ = "FAIL", why.append(f"pace {r['wpm_trimmed']} wpm outside 100-200")
    if st != "FAIL":
        if r["asr"]["check_by_ear"]:
            st, _ = "CHECK", why.append(f"check by ear (known ASR confusions): {r['asr']['check_by_ear']}")
        if not (125 <= r["wpm_trimmed"] <= 175):
            st, _ = "CHECK", why.append(f"pace {r['wpm_trimmed']} wpm outside 125-175 (sheet: 138-150)")
        if r["loudness"]["true_peak_dbtp"] > -1.0:
            st, _ = "CHECK", why.append(f"true peak {r['loudness']['true_peak_dbtp']} dBTP > -1")
    return st, why


def qc(src: str, beat: str, text: str | None = None, save=True) -> dict:
    sel = prompt_for(beat)
    ref = text or " ".join(p["script_text"] for p in sel)
    path = fetch(src, beat)
    a16 = load(path, SR16)
    i0, i1 = trim_bounds(a16, SR16)
    a16t = a16[i0:i1]
    dur_raw, dur = len(a16) / SR16, len(a16t) / SR16
    words = whisper_words(a16t)
    nw = len([t for t in ref.split() if re.search(r"\w", t)])
    vs = voiced_seconds(a16t, SR16)
    r = {"take": str(path), "beat": beat, "prompts": [p["beat"] for p in sel],
         "chars_billable": sum(p["chars_billable"] for p in sel), "script_text": ref,
         "duration_raw_s": round(dur_raw, 2), "duration_s": round(dur, 2),
         "lead_trim_s": round(i0 / SR16, 3), "tail_trim_s": round((len(a16) - i1) / SR16, 3),
         "words": nw, "wpm_trimmed": round(nw / max(dur, 0.1) * 60, 1), "wpm_voiced": round(nw / max(vs, 0.1) * 60, 1),
         "voiced_s": round(vs, 2), "loudness": loudness(path), "asr": score(ref, words),
         "whisper_words": [{k: (round(v, 3) if isinstance(v, float) else v) for k, v in w.items()} for w in words]}
    r["verdict"], r["why"] = verdict(r)
    if save:
        out = path.with_suffix(".qc.json")                     # next to the take
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(r, ensure_ascii=False, indent=1))
        r["report"] = str(out)
    return r


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    fl = sys.argv[1:]
    text = fl[fl.index("--text") + 1] if "--text" in fl else None
    if text:
        args.remove(text)
    if len(args) != 2:
        raise SystemExit(__doc__)
    r = qc(args[0], args[1], text, save="--no-save" not in fl)
    a = r["asr"]
    lo = r["loudness"]
    print(f"take      {r['take']}")
    print(f"prompts   {', '.join(r['prompts'])} ({r['chars_billable']} chars billable)")
    print(f"duration  {r['duration_s']} s (raw {r['duration_raw_s']} s; trimmed {r['lead_trim_s']} s head, {r['tail_trim_s']} s tail)")
    print(f"pace      {r['wpm_trimmed']} wpm over the take · {r['wpm_voiced']} wpm over voiced time ({r['words']} words)")
    print(f"level     {lo['lufs_i']} LUFS · true peak {lo['true_peak_dbtp']} dBTP · sample peak {lo['peak_dbfs']} dBFS · LRA {lo['lra']}")
    print(f"heard     {a['heard']}")
    print(f"WER       {a['wer']:.1%} of {a['ref_words']} · hard {a['hard'] or '—'} · check by ear {a['check_by_ear'] or '—'}"
          f" · tags read aloud {a['tags_read_aloud'] or '—'}")
    print(f"VERDICT   {r['verdict']}" + (f" — {'; '.join(r['why'])}" if r["why"] else ""))
    if r.get("report"):
        print(f"report    {r['report']}")


if __name__ == "__main__":
    main()
