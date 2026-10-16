"""Chatterbox narrator toolkit (Diez Mil Puntos): model loading (Multilingual V3 / LatAm pack), reference handling,
sentence synthesis with the Whisper auto-retry rule, tail trimming, prosody helpers.

Runs in the Chatterbox venv (CPU, 2 threads, nice -n 10):
    OMP_NUM_THREADS=2 nice -n 10 /tmp/claude-0/cbnat/venv/bin/python -I <script>
Weights live outside git in $CB_W (default /tmp/claude-0/cbnat/w): base/ = ResembleAI/chatterbox (ve.pt, s3gen.pt,
t3_mtl23ls_v3.safetensors, grapheme_mtl_merged_expanded_v1.json, conds.pt); latam/ = ResembleAI/Chatterbox-
Multilingual-es-mx-latam (t3_es_mx_latam.safetensors, s3gen_v3.pt). Code: github.com/resemble-ai/chatterbox (MIT)
at $CB_SRC. All MIT.

Reference voice ("ref"): a wav path (zero-shot prompt) or "builtin" (the model's own default voice, conds.pt).
Only the channel's own synthetic voice, the built-in voice, or a recording the Producer supplied of HIS OWN voice
with his consent may be used. Never another person's voice.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

os.environ.setdefault("OMP_NUM_THREADS", "2")
os.environ.setdefault("HF_HOME", "/tmp/claude-0/ttdenv/hf")       # faster-whisper small already cached there
os.environ.setdefault("HF_HUB_OFFLINE", "1")
HERE = Path(__file__).resolve().parent
NC = HERE.parents[1]                                                # newchannel/
AUD = NC / "ep" / "001" / "audio"
W = Path(os.environ.get("CB_W", "/tmp/claude-0/cbnat/w"))
SRC = Path(os.environ.get("CB_SRC", "/tmp/claude-0/cbnat/src/chatterbox/src"))
sys.path[:0] = [str(AUD), str(NC / "engine")]
sys.path.append(str(SRC))

import numpy as np                                                  # noqa: E402
import soundfile as sf                                              # noqa: E402
import torch                                                        # noqa: E402

torch.set_num_threads(int(os.environ["OMP_NUM_THREADS"]))
import build_voice as bv                                            # noqa: E402  WER normaliser + whisper (production)

SR = 24000
FF = "/usr/bin/ffmpeg"


# ------------------------------------------------------------------------------------------------ model
def load(model: str = "v3", s3gen: str = "base"):
    """model: 'v3' (Multilingual V3) | 'v2' | 'latam' (es-MX/LatAm single-language pack T3).
    s3gen: 'base' (s3gen.pt) | 'v3' (s3gen_v3.pt from the LatAm pack)."""
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    from safetensors.torch import load_file
    t0 = time.time()
    t3f = {"v3": "t3_mtl23ls_v3.safetensors", "v2": "t3_mtl23ls_v2.safetensors"}.get(model, "t3_mtl23ls_v3.safetensors")
    m = ChatterboxMultilingualTTS.from_local(W / "base", "cpu", t3_model=t3f)
    info = {"model": model, "s3gen": s3gen}
    if model == "latam":
        sd = load_file(W / "latam" / "t3_es_mx_latam.safetensors")
        mi, un = m.t3.load_state_dict(sd, strict=False)
        assert not mi and not un, (mi[:5], un[:5])
        del sd
    if s3gen == "v3":
        sd = torch.load(W / "latam" / "s3gen_v3.pt", map_location="cpu", weights_only=True)
        mi, un = m.s3gen.load_state_dict(sd, strict=False)
        info["s3gen_v3_missing"], info["s3gen_v3_unexpected"] = len(mi), len(un)
        del sd
    m._builtin = m.conds
    info["load_s"] = round(time.time() - t0, 1)
    print("loaded", info, flush=True)
    m._info = info
    return m


def set_ref(m, ref: str, exaggeration: float):
    """Prepare conditionals once per reference ('builtin' = factory conds.pt)."""
    from chatterbox.mtl_tts import Conditionals
    if ref == "builtin":
        m.conds = Conditionals.load(W / "base" / "conds.pt").to("cpu")
    else:
        m.prepare_conditionals(str(ref), exaggeration=exaggeration)
    m._ref = ref


# ------------------------------------------------------------------------------------------------ trimming
def trim(x, sr=SR, rel_db=-30.0, fr=0.02, gap=0.35, blip=0.3, tail=0.12, head=0.02):
    """Speech = 20 ms frames above peak-30 dB. Stray islands (< 0.3 s after >= 0.35 s of silence) at the end are
    dropped (Chatterbox's low noise tails / clicks / breaths). 10 ms fade out. Returns (y, dropped_s)."""
    h = int(fr * sr)
    if len(x) < 2 * h:
        return x, 0.0
    e = np.array([np.sqrt((x[i:i + h] ** 2).mean()) for i in range(0, len(x) - h + 1, h)])
    on = 20 * np.log10(e + 1e-9) > 20 * np.log10(e.max() + 1e-9) + rel_db
    idx = np.flatnonzero(on)
    i0, i1 = idx[0], idx[-1]
    dropped = 0.0
    while True:
        seg_end, k = i1, i1
        while k > i0 and on[k - 1]:
            k -= 1
        j = k - 1
        while j > i0 and not on[j]:
            j -= 1
        if (seg_end - k + 1) * fr < blip and (k - j - 1) * fr >= gap and j > i0:
            dropped += (seg_end - j) * fr
            i1 = j
        else:
            break
    a = max(0, i0 * h - int(head * sr))
    b = min(len(x), (i1 + 1) * h + int(tail * sr))
    y = x[a:b].astype(np.float32).copy()
    f = int(0.01 * sr)
    y[-f:] *= np.linspace(1, 0, f, dtype=np.float32)
    return y, round(dropped, 2)


def tempo(a, factor):
    """Time-stretch without pitch change (ffmpeg atempo), for slight speed variation."""
    if abs(factor - 1.0) < 1e-3:
        return a
    p = subprocess.run([FF, "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af",
                        f"atempo={factor:.4f}", "-f", "f32le", "-"], input=a.astype(np.float32).tobytes(),
                       capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).copy()


# ------------------------------------------------------------------------------------------------ ASR check
def check(a, text):
    """Whisper-small transcript vs script text, production normaliser (build_voice). -> (wer, errors, heard)."""
    import librosa
    a16 = librosa.resample(a.astype(np.float32), orig_sr=SR, target_sr=16000)
    a16 = np.concatenate([np.zeros(3200, np.float32), a16, np.zeros(4800, np.float32)])
    words = bv.whisper(a16)
    heard = " ".join(w["text"] for w in words)
    hc = heard
    for pat, sub in bv.NAME_FIX:
        hc = re.sub(pat, sub, hc)
    w, errs = bv.wer(bv.canon(bv.toks(text)), bv.canon(bv.toks(hc, hyp=True)))
    return round(float(w), 4), errs, heard


def n_words(text):
    return len(bv.toks(text))


# ------------------------------------------------------------------------------------------------ synthesis
def synth(m, text, kw, seed, tries=6, tts=None, log=None):
    """Synthesize one chunk with the auto-retry rule: re-synthesize (new seed) while the Whisper transcript differs
    from the script (WER > 0 after normalisation) or the take is implausibly long (babble), up to `tries`.
    Returns dict(audio, wer, errors, heard, seed, tries, dur, synth_s, dropped)."""
    tts = tts or text
    nw = n_words(text)
    best = None
    takes = []
    for k in range(tries):
        s = seed + 7919 * k
        torch.manual_seed(s)
        np.random.seed(s % (2 ** 31))
        t0 = time.time()
        w = m.generate(tts, language_id="es", **kw)
        dt = time.time() - t0
        raw = w.squeeze(0).numpy()
        a, dropped = trim(raw)
        dur = len(a) / SR
        wer, errs, heard = check(a, text)
        too_long = dur > 0.75 + nw / 1.6           # > ~96 wpm average = stalling / babble
        score = wer + (1.0 if too_long else 0.0)
        take = {"seed": s, "wer": wer, "errors": errs, "heard": heard, "dur": round(dur, 2),
                "raw_dur": round(len(raw) / SR, 2), "dropped": dropped, "synth_s": round(dt, 1),
                "rtf": round(dt / max(dur, 0.1), 2), "too_long": too_long}
        takes.append(take)
        print(f"   try {k + 1}: wer {wer:.3f} dur {dur:.2f}s rtf {take['rtf']} | {heard}", flush=True)
        if best is None or score < best[0]:
            best = (score, a, take)
        if score == 0:
            break
    _, a, take = best
    out = dict(take, audio=a, tries=len(takes), takes=takes, text=text, tts=tts)
    if log is not None:
        log.append({k: v for k, v in out.items() if k != "audio"})
    return out


def split_sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?…])\s+(?=[^\s])", text.strip()) if s.strip()]


PUNCT_PAUSE = {".": 0.42, "?": 0.55, "!": 0.45, "…": 0.6, ":": 0.38, ",": 0.25}


def pause_after(sentence, jitter=0.0, rng=None):
    p = PUNCT_PAUSE.get(sentence.rstrip()[-1], 0.4)
    if rng is not None and jitter:
        p *= 1.0 + rng.uniform(-jitter, jitter)
    return p


def lufs(a, sr=SR):
    import pyloudnorm as pyln
    reps = int(np.ceil(1.5 * sr / max(1, len(a)))) + 1
    return pyln.Meter(sr).integrated_loudness(np.tile(a, reps) if reps > 1 else a)


def level(a, target=-20.0, sr=SR):
    return (a * 10 ** ((target - lufs(a, sr)) / 20)).astype(np.float32)


def similarity(a, ref_wav, sr=SR):
    """Resemblyzer cosine similarity (speaker identity), a at SR vs a reference wav path."""
    import librosa
    from resemblyzer import VoiceEncoder, preprocess_wav
    global _VE
    try:
        _VE
    except NameError:
        _VE = VoiceEncoder("cpu", verbose=False)
    r, rsr = sf.read(str(ref_wav), dtype="float32")
    if r.ndim > 1:
        r = r.mean(1)
    e1 = _VE.embed_utterance(preprocess_wav(librosa.resample(a, orig_sr=sr, target_sr=16000), 16000))
    e2 = _VE.embed_utterance(preprocess_wav(librosa.resample(r, orig_sr=rsr, target_sr=16000), 16000))
    return round(float(np.dot(e1, e2)), 3)


def dump(obj, path):
    Path(path).write_text(json.dumps(obj, ensure_ascii=False, indent=1))
