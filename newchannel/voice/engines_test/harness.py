"""Engine-independent test harness for the narrator passage (Diez Mil Puntos, 2026-10-23 engine shoot-out).

Same passage as voice/expressive/render_expressive.py (locked script, verbatim): beats 1-4 of the hook (narration +
Eli's and Mila's lines quoted by the narrator), beat 9 and the dinner punchline of beat 13 (162 words). One synthesis
call per sentence group (direction.split_directed), with the per-sentence delivery profile of direction.py mapped to a
natural-language instruct (INSTRUCT) for engines that accept one. Auto-retry rule: Whisper-small WER must be 0 against
the script, else a new seed, up to --tries; the best take is kept. Pauses follow the punctuation rule of cbn.py.

Runs inside the Chatterbox venv (/tmp/claude-0/cbnat/venv) or a venv that sees its site-packages:
    TQDM_DISABLE=1 OMP_NUM_THREADS=3 nice -n 10 python -I harness.py  (used as a library by run_*.py)
Measurements: WER / retries / RTF (CPU s per s of kept audio) / Resemblyzer similarity to the Producer's reference /
pitch range, melody, energy variance, pauses (expressive/measure.py) / seseo (HF energy of z-ce-ci words vs s words).
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
VOICE = HERE.parent
sys.path[:0] = [str(VOICE / "chatterbox_natural"), str(VOICE / "expressive")]
os.environ.setdefault("OMP_NUM_THREADS", "3")
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402

import cbn  # noqa: E402  trim / check (Whisper) / level / pause_after / similarity / tempo
import direction as D  # noqa: E402

bv = cbn.bv
SR = cbn.SR
PRODUCER = VOICE / "producer" / "producer_reference_clean.flac"
OUT = Path(os.environ.get("ET_OUT", "/tmp/claude-0/engines/out"))
BEATS_FULL = ("01", "02", "03", "04", "09")
B13_TAIL = ("Ese conductor ya llegó a su casa.", "Seguro ya está cenando.",
            "Por eso no ves ninguna razón: la razón ya se fue a cenar.")

# Producer feedback on qwen3tts.mp3 (2026-10-23): "habla muy lento, ¿no puede ser con más ánimo?" -> every instruct
# now also asks for a brisk, energetic delivery (~150 wpm). ET_PACE=0 disables the cue (how (a)-(d) were rendered).
PACE_EN = " Speak fast, with energy and enthusiasm, like an excited friend telling a story (about 150 words per minute)."
PACE_ES = " Habla rápido, con energía y entusiasmo, como un amigo emocionado contando algo (unas 150 palabras por minuto)."
PACE = os.environ.get("ET_PACE", "1") != "0"

# delivery profile (direction.py) -> natural-language instruct, following NARRADOR.md
INSTRUCT = {
    "calm": "Calm and unhurried, clear and warm, like explaining something to a friend at the table.",
    "curious": "Curious, conversational and warm, genuinely intrigued, with a slight smile.",
    "warm": "Warm and friendly, smiling, conversational, relaxed.",
    "building": "Tension building, a little faster, energy rising, suspense.",
    "surprised": "Genuinely surprised, real wonder, lively.",
    "urgent": "Urgent and quick, tension at its peak, almost breathless.",
    "deadpan": "Deadpan dry humour: slow, flat, a pause before the punchline, a hint of a smile.",
    "question": "An intrigued, real question, curious and inviting, slower at the end.",
    "intimate": "Soft, low and intimate, warm, like sharing a secret.",
    "eli": "Quoting an impatient friend: faster, louder, exasperated, same narrator voice.",
    "eli_hurt": "Quoting a friend who is hurt and sheepish: softer, slower, a little whiny.",
    "mila": "Quoting a calm friend: serene, soft, gentle and slow.",
}
INSTRUCT_ES = {
    "calm": "Tranquilo y pausado, claro y cálido, como explicándole algo a un amigo en la mesa.",
    "curious": "Curioso, conversacional y cálido, intrigado de verdad, con una leve sonrisa.",
    "warm": "Cálido y amable, sonriendo, conversacional, relajado.",
    "building": "Tensión que crece, un poco más rápido, la energía sube, suspenso.",
    "surprised": "Sorprendido de verdad, asombro real, vivaz.",
    "urgent": "Urgente y rápido, la tensión al máximo, casi sin aliento.",
    "deadpan": "Chiste seco: lento, plano, una pausa antes del remate, con una pizca de sonrisa.",
    "question": "Una pregunta real e intrigada, curiosa, más lenta al final.",
    "intimate": "Suave, bajo e íntimo, cálido, como contando un secreto.",
    "eli": "Citando a un amigo impaciente: más rápido, más fuerte, exasperado, con la misma voz del narrador.",
    "eli_hurt": "Citando a un amigo dolido y avergonzado: más suave, más lento, un poco quejoso.",
    "mila": "Citando a una amiga serena: calma, suave, dulce y lenta.",
}
if PACE:
    INSTRUCT = {k: v + PACE_EN for k, v in INSTRUCT.items()}
    INSTRUCT_ES = {k: v + PACE_ES for k, v in INSTRUCT_ES.items()}
# Producer (2026-10-23, on qwen_a 0:55-1:15): what he likes is Ryan's EXCLAMATIVE, projected register ("Entonces, ¿por
# qué…? ¡Vamos más despacio!"), with the energy of the characters' lines; the calm narration "sounds like another voice".
# ET_REGISTER=exclaim -> every narrator sentence is directed in that register (never calm); the quotes keep their nuance.
REGISTER = os.environ.get("ET_REGISTER", "")
EXCLAIM_EN = ("Exclamative and projected, excited, like telling a friend a surprise, with the energy of a character's "
              "line; never calm, never flat. Fast (about 150 words per minute), smiling, lively intonation.")
EXCLAIM_ES = ("Exclamativo y proyectado, emocionado, como contando una sorpresa a un amigo, con la energía de una línea de "
              "personaje; nunca calmado, nunca plano. Rápido (unas 150 palabras por minuto), sonriendo, entonación viva.")
NUANCE_EN = {"question": " Make the question a real, intrigued one.", "deadpan": " The joke lands on the pause, still energetic.",
             "surprised": " Real surprise.", "urgent": " Urgent, tension at its peak.", "eli": " Quoting an impatient friend: louder, exasperated.",
             "eli_hurt": " Quoting a hurt, sheepish friend.", "mila": " Quoting a calmer friend, but still lively."}
NUANCE_ES = {"question": " La pregunta es real e intrigada.", "deadpan": " El chiste cae en la pausa, con energía.",
             "surprised": " Sorpresa real.", "urgent": " Urgente, la tensión al máximo.", "eli": " Citando a un amigo impaciente: más fuerte, exasperado.",
             "eli_hurt": " Citando a un amigo dolido y avergonzado.", "mila": " Citando a una amiga más serena, pero con vida."}
if REGISTER == "exclaim":
    INSTRUCT = {k: EXCLAIM_EN + NUANCE_EN.get(k, "") for k in INSTRUCT}
    INSTRUCT_ES = {k: EXCLAIM_ES + NUANCE_ES.get(k, "") for k in INSTRUCT_ES}


# The passage, frozen from bv.plan("episode") on the locked script (commit 87f28f1; identical to what
# render_expressive.py rendered on 2026-10-23): (beat, speaker, name, text, tts override, pause after the line).
PASSAGE = [
    ("01", "narrator", "b01_00_narrator", "Una carretera despejada. Allá adelante, un conductor toca el freno. Una sola vez. Apenas un poquito.", None, 0.5),
    ("02", "narrator", "b02_01_narrator", "Detrás, cada auto frena un poco más fuerte que el anterior. Más fuerte. Más fuerte… hasta que alguien se queda quieto: Eli.", None, 0.45),
    ("03", "eli", "b03_02_eli", "¡¿Quién fue?!", None, 0.4),
    ("03", "narrator", "b03_03_narrator", "Eli está seguro: alguien allá adelante tiene la culpa. Pero allá no hay nada. Ni choque, ni conos, ni semáforo.", None, 2.0),
    ("04", "narrator", "b04_05_narrator", "Mila, su amiga, mira atrás.", None, 0.35),
    ("04", "mila", "b04_06_mila", "Eli… va para atrás.", "Eli. Va para atrás.", 0.35),
    ("04", "eli", "b04_07_eli", "¿Qué?", "¿Qué…?", 0.45),
    ("04", "narrator", "b04_08_narrator", "Entonces, ¿por qué hay embotellamientos sin razón aparente?", None, 5.0),
    ("09", "narrator", "b09_17_narrator", "Vamos más despacio. Estiremos el círculo hasta volverlo una línea recta. El primer conductor toca el freno. El segundo lo nota un instante tarde. En ese instante ya se acercó, así que tiene que frenar un poco más fuerte. El tercero, más tarde y más fuerte todavía.", None, 0.35),
    ("09", "eli", "b09_18_eli", "No… no… ¡no!", None, 0.35),
    ("09", "narrator", "b09_19_narrator", "Para el auto número diez: alto total.", None, 0.65),
    ("13", "narrator", "b13_26_narrator", " ".join(B13_TAIL), None, 1.2),
    ("13", "eli", "b13_27_eli", "¿Ni un perdón?", None, 1.0),
]


def passage():
    return [{"beat": b, "speaker": spk, "name": n, "text": t, "opt": ({"tts": tts} if tts else {}), "after": af}
            for b, spk, n, t, tts, af in PASSAGE]


CHUNK = os.environ.get("ET_CHUNK", "sentence")   # "line" = one call per script line (engines that reload per call)


def pieces():
    """-> list of dict(line, beat, speaker, text, tts, profile, before, after, gain, last_in_line, line_after)."""
    plan = passage()
    out = []
    for li, s in enumerate(plan):
        spk = s["speaker"]
        groups = D.split_directed(s["opt"].get("tts", s["text"])) if spk == "narrator" else [s["text"]]
        if CHUNK == "line" and len(groups) > 1:
            d0 = D.direct(groups[0], s["beat"], spk)
            out.append({"line": s["name"], "beat": s["beat"], "speaker": spk, "text": s["text"],
                        "tts": " ".join(D.direct(g, s["beat"], spk)["tts"] for g in groups), "profile": d0["profile"],
                        "before": 0.0 if li == 0 else round(d0["before"] + d0["breath"], 2), "after": round(d0["breath"], 2),
                        "gain": d0["gain"], "speed": d0["speed"], "last_in_line": True, "line_after": s["after"],
                        "idx": (li, 0)})
            continue
        for gi, g in enumerate(groups):
            d = D.direct(g, s["beat"], spk)
            pre = 0.0 if (li == 0 and gi == 0) else d["before"] + d["breath"]
            post = cbn.pause_after(g) * d["pscale"] if gi < len(groups) - 1 else d["breath"]
            out.append({"line": s["name"], "beat": s["beat"], "speaker": spk, "text": g, "tts": d["tts"],
                        "profile": d["profile"], "before": round(pre, 2), "after": round(post, 2), "gain": d["gain"],
                        "speed": d["speed"], "last_in_line": gi == len(groups) - 1, "line_after": s["after"],
                        "idx": (li, gi)})
    return out


def to24(x, sr):
    if x.ndim > 1:
        x = x.mean(1)
    if sr != SR:
        import librosa
        x = librosa.resample(x.astype(np.float32), orig_sr=sr, target_sr=SR)
    return x.astype(np.float32)


def synth(fn, piece, seed, tries=6, log=None, min_dur=None):
    """fn(tts_text, profile, seed) -> (audio np.float32, sr). Retry rule as in cbn.synth."""
    text, tts = piece["text"], piece["tts"]
    nw = cbn.n_words(text)
    best, takes = None, []
    for k in range(tries):
        s = seed + 7919 * k
        t0 = time.time()
        raw, sr = fn(tts, piece["profile"], s)
        dt = time.time() - t0
        raw = to24(np.asarray(raw), sr)
        if len(raw) < SR // 4:
            a, dropped = raw, 0.0
        else:
            a, dropped = cbn.trim(raw)
        dur = len(a) / SR
        wer, errs, heard = cbn.check(a, text) if dur > 0.2 else (1.0, [], "")
        too_long = dur > 1.2 + nw / 1.3          # < ~60 wpm sustained = stalling / babble (Qwen3-TTS paces slowly)
        too_short = dur < 0.15 + nw / 6.0          # > 360 wpm: swallowed words
        score = wer + (1.0 if too_long else 0.0) + (0.5 if too_short else 0.0)
        take = {"seed": s, "wer": wer, "errors": errs, "heard": heard, "dur": round(dur, 2),
                "raw_dur": round(len(raw) / SR, 2), "dropped": dropped, "synth_s": round(dt, 1),
                "rtf": round(dt / max(dur, 0.1), 2), "too_long": too_long, "too_short": too_short}
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


def render(name, fn, tries=6, seed0=5000, level_pieces=True, out=OUT, keep_dynamics=False):
    """Render the whole passage with fn; writes out/NAME.wav + NAME.json. Returns summary dict."""
    out.mkdir(parents=True, exist_ok=True)
    log, parts = [], []
    t_all = time.time()
    for p in pieces():
        li, gi = p["idx"]
        print(f"[{p['line']}:{gi + 1}] {p['speaker']} {p['profile']} | {p['tts']}", flush=True)
        r = synth(fn, p, seed=seed0 + 97 * li + 13 * gi, tries=tries, log=log)
        au = r["audio"]
        if level_pieces:
            au = cbn.level(au, -20.0 + (0.0 if keep_dynamics else p["gain"]))
        parts += [np.zeros(int(p["before"] * SR), np.float32), au, np.zeros(int(p["after"] * SR), np.float32)]
        if p["last_in_line"]:
            parts.append(np.zeros(int(p["line_after"] * SR), np.float32))
        log[-1].update({k: p[k] for k in ("line", "beat", "speaker", "profile", "before", "after", "gain")})
        log[-1]["dur_out"] = round(len(au) / SR, 3)
    x = np.concatenate(parts)
    x = cbn.level(x, -16.0)
    pk = np.abs(x).max()
    if pk > 0.95:
        x *= 0.95 / pk
    wav = out / f"{name}.wav"
    sf.write(wav, x, SR, subtype="PCM_16")
    words = sum(cbn.n_words(l["text"]) for l in log)
    errs = sum(round(l["wer"] * cbn.n_words(l["text"])) for l in log)
    speech = sum(l["dur_out"] for l in log)
    kept_synth = sum(l["synth_s"] for l in log)
    all_synth = sum(t["synth_s"] for l in log for t in l["takes"])
    summ = {"name": name, "dur_s": round(len(x) / SR, 2), "words": words, "word_errors": errs,
            "wer": round(errs / words, 4), "retries": sum(l["tries"] - 1 for l in log), "pieces": len(log),
            "pieces_imperfect": [(l["text"], l["heard"]) for l in log if l["wer"] > 0],
            "wpm_in_speech": round(words / speech * 60, 1),
            "rtf_kept": round(kept_synth / speech, 2), "cpu_s_total": round(all_synth, 1),
            "rtf_total": round(all_synth / speech, 2), "wall_s": round(time.time() - t_all, 1)}
    summ["similarity_to_producer"] = cbn.similarity(x, str(PRODUCER))
    summ.update(expressiveness(x))
    summ["seseo"] = seseo(x, log)
    print(json.dumps(summ, ensure_ascii=False), flush=True)
    cbn.dump({"summary": summ, "pieces": log}, out / f"{name}.json")
    return summ


def expressiveness(x):
    import measure as M
    m = M.measure(x, SR)
    return {k: m[k] for k in ("f0_median_hz", "pitch_range_st", "pitch_std_st", "melody_std_st", "energy_std_db",
                              "energy_range_db", "pauses_n", "pause_mean_s", "pause_std_s")}


def _hf_peak(x, sr, t0, t1):
    import librosa
    a = x[int(t0 * sr): int(t1 * sr)]
    n = int(0.012 * sr)
    if len(a) < n:
        return None
    S = np.abs(librosa.stft(a, n_fft=512, hop_length=n // 2)) ** 2
    f = librosa.fft_frequencies(sr=sr, n_fft=512)
    return float(10 * np.log10(S[(f >= 4000) & (f <= 11000)].sum(0).max() + 1e-12))


def seseo(x, log=None):
    """Whisper word timestamps on the whole take: HF fricative peak of z / ce / ci words relative to the median of
    plain-s words. ~0 dB = /s/ (seseo, Latin America); clearly below (< -4 dB) = /θ/ (Spain)."""
    import librosa
    import unicodedata
    a16 = librosa.resample(x, orig_sr=SR, target_sr=16000)
    words = bv.whisper(a16)
    zs, ss = [], []
    for wd in words:
        t = unicodedata.normalize("NFD", re.sub(r"[^\w]", "", wd["text"].lower()))
        t = "".join(c for c in t if unicodedata.category(c) != "Mn")
        v = _hf_peak(x, SR, wd["start"], wd["end"] + 0.05)
        if v is None:
            continue
        if re.search(r"z|c[ei]", t):
            zs.append((t, v))
        elif "s" in t:
            ss.append(v)
    if not zs or not ss:
        return None
    med = float(np.median(ss))
    rel = {t: round(v - med, 1) for t, v in zs}
    vals = list(rel.values())
    med = float(np.median(vals))      # median: a sentence-final "vez" is always weak, whatever the accent
    return {"words_db": rel, "mean_db": round(float(np.mean(vals)), 1), "median_db": round(med, 1),
            "verdict": "seseo (LatAm)" if med > -6 else "distinción (España)"}


def beeps(n, sr=44100, f=880.0, d=0.12, gap=0.13):
    t = np.arange(int(d * sr)) / sr
    b = 0.25 * np.sin(2 * np.pi * f * t) * np.minimum(1, np.minimum(t, d - t) / 0.01)
    out = []
    for _ in range(n):
        out += [b, np.zeros(int(gap * sr))]
    return np.concatenate(out + [np.zeros(int(0.6 * sr))]).astype(np.float32)


def speech_seconds(x, sr):
    h = int(0.05 * sr)
    rms = np.array([np.sqrt((x[i:i + h] ** 2).mean()) for i in range(0, len(x) - h + 1, h)])
    db = 20 * np.log10(rms + 1e-9)
    return float((db > db.max() - 35).sum() * 0.05)


def postprocess(wav_in, wav_out, words, target_wpm=150.0, max_pause=0.45, max_factor=1.6):
    """Bring a take to the channel's pace so engines compare at the same rhythm (coordinator, 2026-10-23):
    ffmpeg rubberband tempo (pitch 1.0, transients crisp) up to `target_wpm` measured in speech, then silenceremove
    caps every pause at `max_pause` s. Returns dict(wpm_before, wpm_after, factor, dur_before, dur_after)."""
    import subprocess
    x, sr = sf.read(wav_in, dtype="float32")
    if x.ndim > 1:
        x = x.mean(1)
    sp = speech_seconds(x, sr)
    wpm0 = words / sp * 60
    f = float(np.clip(target_wpm / wpm0, 1.0, max_factor))
    af = []
    if f > 1.005:
        af.append(f"rubberband=tempo={f:.4f}:pitch=1.0:transients=crisp")
    af.append(f"silenceremove=stop_periods=-1:stop_duration={max_pause}:stop_threshold=-38dB:stop_silence={max_pause}")
    subprocess.run([cbn.FF, "-v", "error", "-y", "-i", str(wav_in), "-af", ",".join(af), "-ar", str(sr), "-c:a",
                    "pcm_s16le", str(wav_out)], check=True)
    y, _ = sf.read(wav_out, dtype="float32")
    sp1 = speech_seconds(y, sr)
    return {"wpm_before": round(wpm0, 1), "wpm_after": round(words / sp1 * 60, 1), "factor": round(f, 3),
            "dur_before": round(len(x) / sr, 1), "dur_after": round(len(y) / sr, 1)}


def build_mp3(out_mp3, specs, kbps=48, post=True, words=162, target_wpm=150.0):
    """specs: [(wav_path, n_beeps), ...] -> one MP3, each variant at -16 LUFS, N beeps before variant N.
    post=True runs postprocess() (tempo to target_wpm + pause cap) on every variant first; returns its numbers."""
    import subprocess
    import tempfile
    import librosa
    sr = 44100
    parts = [np.zeros(int(0.3 * sr), np.float32)]
    report = {}
    for spec in specs:
        path, n = spec[0], spec[1]
        w = spec[2] if len(spec) > 2 else words        # words actually spoken in this file (cut takes)
        if post:
            tmp = Path(tempfile.mkdtemp()) / "post.wav"
            report[Path(path).name] = postprocess(path, tmp, w, target_wpm)
            print(Path(path).name, report[Path(path).name], flush=True)
            path = tmp
        x, s = sf.read(path, dtype="float32")
        if x.ndim > 1:
            x = x.mean(1)
        x = librosa.resample(x, orig_sr=s, target_sr=sr)
        x = cbn.level(x, -16.0, sr)
        pk = np.abs(x).max()
        if pk > 0.89:
            x *= 0.89 / pk
        parts += [beeps(n, sr), x, np.zeros(int(1.4 * sr), np.float32)]
    y = np.concatenate(parts)
    subprocess.run([cbn.FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-", "-c:a",
                    "libmp3lame", "-b:a", f"{kbps}k", "-threads", "2", str(out_mp3)], input=y.tobytes(), check=True)
    print(out_mp3, round(len(y) / sr, 1), "s", round(Path(out_mp3).stat().st_size / 1e6, 2), "MB")
    return report


if __name__ == "__main__":
    for p in pieces():
        print(p["idx"], p["speaker"], p["profile"], "|", p["tts"])
