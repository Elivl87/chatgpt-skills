#!/usr/bin/env python3
"""EP001 voice track (ES-419): narrator + Eli + Mila, word timings, QC. Runs in the voice venv:

    OMP_NUM_THREADS=2 /tmp/claude-0/ttdenv/venv/bin/python ep/001/audio/build_voice.py all
    ... build_voice.py render|assemble|align|qc|short      (stages; `all` = every stage, episode + Short)
    ... build_voice.py from-flac                             (rebuild narration_es.wav from segments/*.flac, no TTS)

Text: parsed from the LOCKED script (script_parse.py), word for word. Respellings / pauses live ONLY in the TTS text
below (TTS_TEXT); the timings always carry the script spelling.

Voices (Kokoro-82M v1.0, Apache-2.0, factory voice tensors and blends; no cloning):
    narrator = ES candidate D: ef_dora 0.6 + af_heart 0.4, speed 0.92, espeak-ng es-419
    eli      = em_alex (his lines have no /s/), speeds from the script's voice notes; shouts +1 semitone
    mila     = ef_dora 0.65 + bf_emma 0.35, +2 semitones (ef_dora alone measured as the same speaker as the narrator,
               see VOICE_QC.md)
Output: 48 kHz mono 24-bit, 70 Hz HPF, 2.5:1 compression, -18 LUFS integrated, true peak <= -2 dBTP.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

os.environ.setdefault("OMP_NUM_THREADS", "2")
os.environ.setdefault("HF_HOME", "/tmp/claude-0/ttdenv/hf")
HERE = Path(__file__).resolve().parent
NC = HERE.parents[2]                       # newchannel/
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(NC / "engine"))

import numpy as np                         # noqa: E402
import soundfile as sf                     # noqa: E402

import script_parse                        # noqa: E402
import voice as ev                         # noqa: E402  engine/voice.py (align, refine_onsets, norm_tokens)
import sound as es                         # noqa: E402  engine/sound.py (measure_file, limit, write_wav)

SR = 24000
SR_OUT = 48000
FF = "/usr/bin/ffmpeg"
TMP = Path(os.environ.get("VOICE_TMP", "/tmp/claude-0/ep001_voice"))
CACHE = TMP / "cache"
TARGET_LUFS, CEIL_TP = -18.0, -2.0
SEG_LUFS = -20.0                           # every segment is levelled to this before its gain_db
GAP_SENT = 0.28                            # air between sentences inside a segment (engine default)

VOICES = {
    "narrator": {"recipe": {"ef_dora": 0.6, "af_heart": 0.4}, "speed": 0.92, "semitones": 0.0},
    "eli": {"recipe": {"em_alex": 1.0}, "speed": 1.0, "semitones": 0.0},
    "mila": {"recipe": {"ef_dora": 0.65, "bf_emma": 0.35}, "speed": 0.95, "semitones": 2.0},
}
RESPELL = {"Nashville": "Náshvil", "Tennessee": "Tenesí", "corras": "corrras"}   # TTS only, never on screen

# ---------------------------------------------------------------------------------------------- per-segment options
# Keyed by the parsed segment index (script_parse.parse_episode order; the script is locked so it is stable; the
# text is asserted below). after = silence after the segment (s). tts = TTS text (default: script text + RESPELL).
# "[pause x]" inside tts inserts x s of silence. pieces = [(tts, speed, semitones)] joined with piece_gap.
OPTS = {
    0: {"after": 0.5},
    1: {"after": 0.45},
    2: {"speed": 1.05, "semitones": 1, "gain_db": 1.0, "after": 0.4},                  # ¡¿Quién fue?!
    3: {"after": 0.0},                                                                 # + (pausa) 4
    5: {"after": 0.35},
    6: {"tts": "Eli. Va para atrás.", "speed": 0.95, "gain_db": -2.0, "after": 0.35},  # Mila: Eli… va para atrás.
    7: {"tts": "¿Qué…?", "after": 0.45},                                              # ¿Qué?
    8: {"after": 0.5},                                                                 # question -> wordmark (9)
    10: {"after": 0.3},
    11: {"speed": 1.1, "after": 0.4},                                                  # ¡Ya entendí!...
    12: {"after": 0.6},
    13: {"after": 0.35},
    14: {"speed": 1.05, "semitones": 1, "gain_db": 1.5, "after": 0.0},                 # ¡¿Quién fue?! + (pausa) 15
    16: {"after": 0.65},
    17: {"after": 0.35},
    18: {"nosplit": True, "after": 0.35},                                              # No… no… ¡no! (one call)
    19: {"after": 0.65},
    20: {"after": 1.0},                                                                # Eli reads the balloon
    21: {"speed": 1.05, "semitones": 1, "gain_db": 1.0, "after": 0.65},                # ¡¿Que yo qué?!
    22: {"tts": "No es un grupo fijo de autos: los autos entran por detrás, avanzan despacito y salen por delante. "
                "Los autos se van; el embotellamiento se queda. Es como la ola en un estadio: nadie se cambia de "
                "asiento, pero la ola le da la vuelta entera. [pause 1.2] Un embotellamiento no es un lugar. Es una "
                "ola.", "after": 0.65},                                                # Eli stands up late
    23: {"tts": "Pero no todos los círculos se atascan. El mismo equipo repitió el experimento en un estadio de "
                "béisbol, el Domo de Nagoya, con una pista de trescientos catorce metros. Con veinticinco autos, el "
                "tráfico fluyó. Con veintiocho o más, [pause 0.3] embotellamiento. Tres autos de más.",
         "after": 0.35},
    24: {"tts": "¡¿Quién fue?!", "cut_f": True, "speed": 1.05, "semitones": 1, "gain_db": 1.0, "after": 1.5},  # ¡¿Quién f…? (sees himself)
    25: {"after": 0.65},
    26: {"after": 1.2},                                                                # fork, finger lowers
    27: {"speed": 0.95, "after": 1.0},                                                 # ¿Ni un perdón? + crunch
    28: {"after": 0.35},
    29: {"semitones": 1, "after": 0.8},                                                # ¡Mi lema! + eyebrow
    30: {"after": 0.65},
    31: {"after": 0.65},
    32: {"after": 0.3},
    33: {"speed": 1.05, "semitones": 1, "gain_db": 2.0, "after": 0.0},                 # + (pausa: todos lo miran) 34
    35: {"after": 0.45},                                                               # Mila: Eli.
    36: {"speed": 0.9, "after": 1.0},                                                  # …Fue el viento. + leaf
    37: {"after": 0.65},
    38: {"after": 0.35},
    39: {"speed": 1.15, "gain_db": 1.0, "after": 0.35},                                # ¡Hay un hueco!...
    40: {"speed": 0.92, "after": 1.5},                                                 # Mila: Ese hueco es mi amigo.
    41: {"after": 0.65},
    42: {"after": 0.35},
    43: {"after": 0.6},                                                                # ¡Yo llego tarde a todo!
    44: {"after": 0.65},
    45: {"after": 0.65},                                                               # Nashville / Tennessee
    46: {"after": 0.3},
    47: {"gain_db": -6.0, "after": 0.3},                                                # ¡Dale, dale! under narration
    48: {"after": 0.3},
    49: {"tts": "¡Noo!", "respell": True, "gain_db": -6.0, "after": 0.3},              # ¡Nooo!
    50: {"after": 1.0},                                                                # Eli does the wave on time
    51: {"tts": "O sea que tú también eres parte de la ola. Así que deja un espacio: uno seguro, no uno enorme. No "
                "corras a cerrarlo. [pause 0.8] Maneja a la velocidad a la que de verdad se mueve el tráfico, no a "
                "la que te gustaría. No llegas más tarde: la misma distancia, el mismo tiempo, menos frenazos.",
         "after": 0.65},                                                               # glovebox gag
    52: {"after": 0.0},                                                                # + (5 s sin narración) 53
    54: {"tts": "¿Quién fue?", "speed": 0.9, "gain_db": -4.0, "after": 0.5},           # ¿…Quién fue? (whisper)
    55: {"speed": 0.92, "after": 1.0},                                                 # Mila: Fuiste tú. + laugh
    56: {"tts": "En algún lugar detrás de ellos, un embotellamiento que nunca pasó. Un embotellamiento no es un "
                "lugar. Es una ola. Un solo conductor paciente puede absorberla. [pause 0.5] Esto es Diez Mil "
                "Puntos.", "after": 3.0},                                              # wordmark 2 -> end screen
    57: {"after": 0.6},
    58: {"speed": 1.05, "semitones": 1, "gain_db": 1.0, "after": 0.0},                 # tag ¡¿Quién fue?!
}
PAUSES = {4: 2.0, 9: 4.5, 15: 2.5, 34: 1.2, 53: 5.0}   # (pausa) markers: 3 pajarito, 5 wordmark 3.5 s + 1 s silence,
#                                                        7 shrug wave, 17 everyone stares, 23 the 5 s silent callback
LEAD = 0.25                                            # silence before the first word
END_SCREEN = 20.0                                      # end screen length from its first word (script: 20 s)

# The Short (vertical, 35-40 s): gag pauses in the TTS text only.
SHORT_OPTS = {
    0: {"speed": 1.05, "semitones": 1, "gain_db": 1.0, "after": 0.45},
    1: {"tts": "No hay nada en el camino. [pause 0.7] Alguien tocó el freno, apenas, y cada auto de atrás frenó un "
               "poco más fuerte. [pause 0.45] Mira: el embotellamiento va hacia atrás, a unos veinte kilómetros por "
               "hora, como una bicicleta. [pause 0.6] Los autos avanzan, pero la fila retrocede. Es una ola. "
               "[pause 0.8] En una pista de Estados Unidos, un solo auto fue a la velocidad promedio, sin perseguir "
               "al de adelante. Los frenazos casi desaparecieron. [pause 0.45] Así que deja un espacio. Si tu "
               "espacio se come el frenazo, los de atrás no tienen que frenar.", "after": 0.5},
    2: {"speed": 0.92, "after": 0.6},
}
SHORT_LEAD = 0.1

# ---------------------------------------------------------------------------------------------- synthesis

_PIPE = None


def pipe():
    global _PIPE
    if _PIPE is None:
        import torch
        torch.set_num_threads(int(os.environ["OMP_NUM_THREADS"]))
        from kokoro import KPipeline
        from misaki import espeak
        _PIPE = KPipeline(lang_code="e", repo_id="hexgrad/Kokoro-82M")
        _PIPE.g2p = espeak.EspeakG2P(language="es-419")
    return _PIPE


def voice_tensor(recipe):
    p = pipe()
    return sum(w * p.load_single_voice(v) for v, w in recipe.items())


def pitch_shift(a: np.ndarray, st: float) -> np.ndarray:
    """Resample pitch shift (formants move with it), duration kept with atempo."""
    if not st:
        return a
    r = 2 ** (st / 12)
    p = subprocess.run([FF, "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af",
                        f"asetrate={SR * r:.3f},aresample={SR},atempo={1 / r:.6f}", "-f", "f32le", "-"],
                       input=a.astype(np.float32).tobytes(), capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).copy()


def _trim(a, rel_db=-40.0, keep_head=0.03, keep_tail=0.06):
    return ev._trim(a, rel_db, keep_head, keep_tail)


def kokoro(text: str, v, speed: float, seed: int, cut_f=False):
    import torch
    torch.manual_seed(seed)
    outs, phon = [], []
    for r in pipe()(text, voice=v, speed=speed, split_pattern=None):
        a = r.audio.numpy().astype(np.float32)
        if cut_f:                                   # stop the audio inside the /f/ of "fue" (¡¿Quién f…?)
            ps = r.phonemes
            k = ps.index("f")
            d = r.pred_dur.numpy().astype(float)
            scale = len(a) / d.sum()
            f0 = d[: k + 1].sum() * scale            # pred_dur[0] is the BOS frame
            f1 = f0 + d[k + 1] * scale
            cut = int(f0 + 0.8 * (f1 - f0))
            a = a[:cut].copy()
            fade = int(0.025 * SR)
            a[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)
            ps = ps[: k + 1] + "…"
            phon.append(ps)
            outs.append(_trim(a, keep_tail=0.0))
            continue
        phon.append(r.phonemes)
        outs.append(_trim(a))
    return np.concatenate(outs), phon


def split_sentences(chunk: str):
    return [s.strip() for s in re.split(r"(?<=[.!?…;])\s+(?=[^\s])", chunk.strip()) if s.strip()]


def tts_text(seg, opt):
    t = opt.get("tts", seg["text"])
    for a, b in RESPELL.items():
        t = t.replace(a, b)
    return t


def synth_segment(seg, opt, seed):
    vc = VOICES[seg["speaker"]]
    v = voice_tensor(vc["recipe"])
    parts, phon = [], []
    if "pieces" in opt:
        for k, (t, sp, st) in enumerate(opt["pieces"]):
            a, ph = kokoro(t, v, sp, seed + k)
            parts.append(pitch_shift(a, vc["semitones"] + opt.get("semitones", 0) + st))
            phon += ph
            if k < len(opt["pieces"]) - 1:
                parts.append(np.zeros(int(opt.get("piece_gap", 0.3) * SR), np.float32))
        return np.concatenate(parts), phon
    sp = opt.get("speed", vc["speed"])
    st = vc["semitones"] + opt.get("semitones", 0)
    chunks = re.split(r"\[pause\s+([\d.]+)\]", tts_text(seg, opt))
    for ci in range(0, len(chunks), 2):
        sents = [chunks[ci].strip()] if opt.get("nosplit") else split_sentences(chunks[ci])
        for si, s in enumerate(sents):
            a, ph = kokoro(s, v, sp, seed + 31 * ci + si, cut_f=opt.get("cut_f", False))
            parts.append(pitch_shift(a, st))
            phon += ph
            if si < len(sents) - 1:
                parts.append(np.zeros(int(GAP_SENT * SR), np.float32))
        if ci + 1 < len(chunks):
            parts.append(np.zeros(int(float(chunks[ci + 1]) * SR), np.float32))
    return np.concatenate(parts), phon


def seg_key(seg, opt):
    vc = VOICES[seg["speaker"]]
    blob = json.dumps([seg, {k: v for k, v in opt.items() if k not in ("after", "gain_db")}, vc, RESPELL],
                      ensure_ascii=False, sort_keys=True)
    return hashlib.sha1(blob.encode()).hexdigest()[:10]


def plan(kind="episode"):
    """-> list of voice segments with options (pauses folded into the previous segment's `after`)."""
    if kind == "episode":
        segs, opts, pauses = script_parse.parse_episode(), OPTS, PAUSES
    else:
        segs, opts, pauses = script_parse.parse_short(), SHORT_OPTS, {}
    out = []
    for i, s in enumerate(segs):
        if s["speaker"] == "pause":
            out[-1]["after"] += pauses[i]
            continue
        o = dict(opts.get(i, {}))
        o.setdefault("after", 0.5)
        if "tts" in o and not o.get("cut_f") and not o.get("respell"):  # a TTS override may only change pauses/punctuation/respellings
            t = re.sub(r"\[pause\s+[\d.]+\]", " ", o["tts"])
            for a, b in RESPELL.items():
                t = t.replace(b, a)
            assert toks(t) == toks(s["text"]), (i, toks(t), toks(s["text"]))
        name = f"{'b' + s['beat'] if kind == 'episode' else 'short'}_{i:02d}_{s['speaker']}"
        out.append({"i": i, "name": name, **s, "opt": o, "after": o["after"], "tts": tts_text(s, o)
                    if "pieces" not in o else " ".join(p[0] for p in o["pieces"])})
    return out


def render(kind="episode"):
    CACHE.mkdir(parents=True, exist_ok=True)
    meta = {}
    for s in plan(kind):
        key = seg_key({k: s[k] for k in ("beat", "speaker", "text")}, s["opt"])
        f = CACHE / f"{s['name']}_{key}.wav"
        mf = f.with_suffix(".json")
        if not f.exists():
            a, ph = synth_segment(s, s["opt"], seed=1000 + s["i"])
            sf.write(f, a, SR, subtype="FLOAT")
            mf.write_text(json.dumps({"phonemes": ph}, ensure_ascii=False))
            print(f"render {s['name']}: {len(a) / SR:.2f} s  {ph}", flush=True)
        meta[s["name"]] = str(f)
    (TMP / f"render_{kind}.json").write_text(json.dumps(meta, indent=1))
    return meta


# ---------------------------------------------------------------------------------------------- assembly

def lufs(a, sr=SR):
    import pyloudnorm as pyln
    reps = int(np.ceil(1.5 * sr / max(1, len(a)))) + 1          # tile short clips (loudness unchanged)
    return pyln.Meter(sr).integrated_loudness(np.tile(a, reps) if reps > 1 else a)


def assemble(kind="episode"):
    files = json.loads((TMP / f"render_{kind}.json").read_text())
    pl = plan(kind)
    t = LEAD if kind == "episode" else SHORT_LEAD
    pieces, man = [], []
    pieces.append(np.zeros(int(round(t * SR)), np.float32))
    end_screen_t0 = None
    for s in pl:
        a, _ = sf.read(files[s["name"]], dtype="float32")
        g = SEG_LUFS - lufs(a) + s["opt"].get("gain_db", 0.0)
        a = a * 10 ** (g / 20)
        if s["beat"] == "end" and end_screen_t0 is None:
            end_screen_t0 = t
        man.append({"name": s["name"], "beat": s["beat"], "speaker": s["speaker"], "text": s["text"],
                    "tts": s["tts"], "start": round(t, 4), "dur": round(len(a) / SR, 4), "after": s["after"],
                    "gain_db": round(g, 2), "speed": s["opt"].get("speed", VOICES[s["speaker"]]["speed"]),
                    "semitones": VOICES[s["speaker"]]["semitones"] + s["opt"].get("semitones", 0)})
        pieces += [a, np.zeros(int(round(s["after"] * SR)), np.float32)]
        t += len(a) / SR + int(round(s["after"] * SR)) / SR
    x = np.concatenate(pieces)
    if kind == "episode" and end_screen_t0 is not None:          # the end screen runs 20 s from its first word
        n_end = int(round((end_screen_t0 + END_SCREEN) * SR))
        if n_end > len(x):
            x = np.concatenate([x, np.zeros(n_end - len(x), np.float32)])
    out = HERE / ("narration_es.wav" if kind == "episode" else "short_es.wav")
    m = finish(x, out)
    (HERE / ("segments_es.json" if kind == "episode" else "segments_short_es.json")).write_text(
        json.dumps({"voices": VOICES, "respell_tts_only": RESPELL, "target_lufs": TARGET_LUFS, "tp_ceiling": CEIL_TP,
                    "post_gain_db": m["gain_db"], "segments": man}, indent=1, ensure_ascii=False))
    export_segments(kind, out, man)
    return m


def finish(x, out: Path):
    """HPF 70 Hz + 2.5:1 compression (ffmpeg), 48 kHz, gain to -18 LUFS, true-peak limiter at -2 dBTP."""
    ch = "highpass=f=70:poles=2,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:knee=4"
    p = subprocess.run([FF, "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af",
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


def export_segments(kind, wav: Path, man):
    """One FLAC per segment (24 kHz 16-bit: Kokoro's native band) cut from the finished track."""
    d = HERE / ("segments" if kind == "episode" else "segments_short")
    d.mkdir(exist_ok=True)
    for f in d.glob("*.flac"):
        f.unlink()
    for s in man:
        t0, dur = s["start"], s["dur"]
        subprocess.run([FF, "-v", "error", "-y", "-ss", f"{t0:.4f}", "-t", f"{dur + 0.05:.4f}", "-i", str(wav),
                        "-ar", str(SR), "-sample_fmt", "s16", "-c:a", "flac", "-compression_level", "8",
                        str(d / f"{s['name']}.flac")], check=True)


def from_flac(out=None):
    """Rebuild narration_es.wav (approximately: 24 kHz 16-bit sources) from segments/*.flac + segments_es.json."""
    out = Path(out) if out else HERE / "narration_es.wav"
    js = json.loads((HERE / "segments_es.json").read_text())
    segs = js["segments"]
    end = max(s["start"] + s["dur"] + s["after"] for s in segs)
    es_t0 = min(s["start"] for s in segs if s["beat"] == "end")
    n = int(round(max(end, es_t0 + END_SCREEN) * SR_OUT))
    x = np.zeros(n, np.float32)
    for s in segs:
        a = es.load_audio(HERE / "segments" / f"{s['name']}.flac", sr=SR_OUT, channels=1)[:, 0]
        i0 = int(round(s["start"] * SR_OUT))
        x[i0:i0 + len(a)] = a[: n - i0]
    es.write_wav(out, x, sr=SR_OUT, bits=24)
    print(out.name, "rebuilt from FLAC:", es.measure_file(out))


# ---------------------------------------------------------------------------------------------- alignment + WER

_WM = None


def whisper(audio16: np.ndarray):
    global _WM
    if _WM is None:
        from faster_whisper import WhisperModel
        _WM = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=int(os.environ["OMP_NUM_THREADS"]),
                           download_root=str(Path(os.environ["HF_HOME"]) / "whisper"))
    segs, _ = _WM.transcribe(audio16, language="es", beam_size=5, word_timestamps=True,
                             condition_on_previous_text=False, vad_filter=False)
    words = []
    for s in segs:
        for w in s.words or []:
            words.append({"text": w.word.strip(), "start": float(w.start), "end": float(w.end),
                          "p": float(w.probability)})
    return words


HYP_FIX = [(r"(\d)\s+[.,](\d{3})", r"\1\2"), (r"%", " por ciento"), (r"km/h", " kilómetros por hora"),
           (r"\bkm\b", "kilómetros")]
NAME_FIX = [(r"\b(Ellie|Elli|Elly|Elí)\b", "Eli")]     # Whisper's spellings of the name (same sounds)

_orig_norm = ev.norm_tokens


def _norm_tokens(word, lang):
    """engine norm_tokens + accent-free number words, '%' -> por ciento, letter/digit split, whitespace split."""
    w = word.replace("%", " por ciento")
    w = re.sub(r"(?<=[^\W\d])(?=\d)|(?<=\d)(?=[^\W\d])", " ", w)
    out = []
    for part in w.split():
        for t in _orig_norm(part, lang):
            t = ev.strip_accents(t)
            out.append("veintiuno" if t == "veintiun" else t)
    return out


ev.norm_tokens = _norm_tokens
# number formatting / homophones that are not pronunciation errors (both sides are normalised with this map)
EQUIV = {"porque": "por que", "haber": "a ver", "e": "y"}


def toks(text, hyp=False):
    if hyp:
        for a, b in HYP_FIX:
            text = re.sub(a, b, text)
    out = []
    for w in text.split():
        out += ev.norm_tokens(w, "es")
    return out


def canon(ts):
    out = []
    for t in ts:
        out += EQUIV.get(t, t).split()
    return out


def wer(ref, hyp):
    import numpy as np
    d = np.zeros((len(ref) + 1, len(hyp) + 1), int)
    d[:, 0] = range(len(ref) + 1)
    d[0, :] = range(len(hyp) + 1)
    for i in range(1, len(ref) + 1):
        for j in range(1, len(hyp) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (ref[i - 1] != hyp[j - 1]))
    # error list
    i, j, errs = len(ref), len(hyp), []
    while i > 0 or j > 0:
        if i > 0 and j > 0 and d[i, j] == d[i - 1, j - 1] + (ref[i - 1] != hyp[j - 1]):
            if ref[i - 1] != hyp[j - 1]:
                errs.append(f"{ref[i - 1]}->{hyp[j - 1]}")
            i, j = i - 1, j - 1
        elif i > 0 and d[i, j] == d[i - 1, j] + 1:
            errs.append(f"-{ref[i - 1]}")
            i -= 1
        else:
            errs.append(f"+{hyp[j - 1]}")
            j -= 1
    return d[-1, -1] / max(1, len(ref)), errs[::-1]


def align_track(kind="episode"):
    wav = HERE / ("narration_es.wav" if kind == "episode" else "short_es.wav")
    man = json.loads((HERE / ("segments_es.json" if kind == "episode" else "segments_short_es.json")).read_text())
    segs = man["segments"]
    x = es.load_audio(wav, sr=16000, channels=1)[:, 0]
    groups = {}
    for s in segs:
        groups.setdefault(s["beat"], []).append(s)
    timings, report = [], {}
    for beat, ss in groups.items():
        t0 = max(0.0, ss[0]["start"] - 0.2)
        t1 = ss[-1]["start"] + ss[-1]["dur"] + 0.25
        clip = x[int(t0 * 16000): int(t1 * 16000)]
        words = whisper(clip)
        hyp_text = " ".join(w["text"] for w in words)
        for w in words:
            for pat, sub in NAME_FIX:
                w["text"] = re.sub(pat, sub, w["text"])
        text = " ".join(s["text"] for s in ss)
        tim, rep = ev.align(text, words, "es", t1 - t0)
        # speaker per script word
        owner = []
        for s in ss:
            n = len([w for w in ev.clean_script(s["text"]).split() if re.search(r"\w", w)])
            owner += [s] * n
        assert len(owner) == len(tim), (beat, len(owner), len(tim))
        for w, s in zip(tim, owner):
            st = w["start"] + t0
            en = w["end"] + t0
            # clamp into the segment's voice span (whisper can drift into a gap)
            st = min(max(st, s["start"]), s["start"] + s["dur"])
            en = min(max(en, st + 0.02), s["start"] + s["dur"] + 0.05)
            timings.append({"word": w["word"], "start": round(st, 3), "end": round(en, 3), "beat": beat,
                            "speaker": s["speaker"], "text": w["text"], "conf": w["conf"], "line": s["name"],
                            "_s0": s["start"], "_s1": s["start"] + s["dur"]})
        ref_t, hyp_t = toks(text), toks(hyp_text, hyp=True)
        if beat == "12":       # ¡¿Quién f…? is cut on purpose: drop the lone "f" from the reference
            ref_t = [t for t in ref_t if t != "f"]
        w_raw, e_raw = wer(ref_t, hyp_t)
        hyp_c = hyp_text
        for pat, sub in NAME_FIX:
            hyp_c = re.sub(pat, sub, hyp_c)
        w_cor, e_cor = wer(canon(ref_t), canon(toks(hyp_c, hyp=True)))
        report[beat] = {"heard": hyp_text, "wer_raw": round(w_raw, 4), "errors_raw": e_raw,
                        "wer": round(w_cor, 4), "errors": e_cor, "ref_words": len(ref_t),
                        "aligned": f"{rep['matched']}/{rep['words']}", "unmatched": rep["unmatched"]}
        print(f"beat {beat}: WER {w_cor:.1%} (raw {w_raw:.1%}) {e_cor}  aligned {rep['matched']}/{rep['words']}",
              flush=True)
    # words Whisper missed (conf 0): spread them by length inside their own line, between matched neighbours,
    # over voiced 10 ms frames only (never into a pause)
    HOP = 0.01
    xx = es.load_audio(wav, sr=SR_OUT, channels=1)[:, 0]
    nh = int(HOP * SR_OUT)
    voiced = 20 * np.log10(np.sqrt((xx[: len(xx) // nh * nh].reshape(-1, nh) ** 2).mean(1)) + 1e-12) > -50
    k = 0
    while k < len(timings):
        if timings[k]["conf"]:
            k += 1
            continue
        j = k
        line = timings[k]["line"]
        while j < len(timings) and not timings[j]["conf"] and timings[j]["line"] == line:
            j += 1
        t0 = timings[k - 1]["end"] if k > 0 and timings[k - 1]["line"] == line else timings[k]["_s0"]
        t1 = timings[j]["start"] if j < len(timings) and timings[j]["line"] == line else timings[k]["_s1"]
        # a pause inside the interval belongs to the punctuation: start after it / end before it
        f0_, f1_ = int(t0 / HOP), int(np.ceil(t1 / HOP))
        q_runs, r0 = [], None
        for fi in range(f0_, f1_ + 1):
            quiet = fi < len(voiced) and fi < f1_ and not voiced[fi]
            if quiet and r0 is None:
                r0 = fi
            elif not quiet and r0 is not None:
                if (fi - r0) * HOP >= 0.15:
                    q_runs.append((r0, fi))
                r0 = None
        prev_p = k > 0 and timings[k - 1]["line"] == line and re.search(r"[,.:;!?…]$", timings[k - 1]["text"])
        next_in = j < len(timings) and timings[j]["line"] == line
        last_p = next_in and re.search(r"[,.:;!?…]$", timings[j - 1]["text"])
        if prev_p and q_runs:
            t0 = q_runs[0][1] * HOP
            q_runs = q_runs[1:]
        if last_p and q_runs:
            t1 = q_runs[-1][0] * HOP
        lens = np.array([max(1, len(re.sub(r"\W", "", timings[q]["word"]))) for q in range(k, j)], float)
        fr = np.flatnonzero(voiced[int(t0 / HOP): int(np.ceil(t1 / HOP))]) + int(t0 / HOP)   # voiced frames only
        if len(fr) < len(lens):
            fr = np.arange(int(t0 / HOP), max(int(t0 / HOP) + len(lens), int(np.ceil(t1 / HOP))))
        c = np.concatenate([[0], np.cumsum(lens) / lens.sum()])
        for n, q in enumerate(range(k, j)):
            a0 = fr[min(len(fr) - 1, int(c[n] * len(fr)))]
            a1 = fr[max(0, min(len(fr) - 1, int(np.ceil(c[n + 1] * len(fr))) - 1))]
            timings[q]["start"], timings[q]["end"] = round(a0 * HOP, 3), round((a1 + 1) * HOP, 3)
        k = j
    # words that share one Whisper token ("230" -> doscientos treinta): split that span by length
    k = 0
    while k < len(timings):
        j = k + 1
        while (j < len(timings) and timings[j]["conf"] and timings[k]["conf"]
               and (timings[j]["start"], timings[j]["end"]) == (timings[k]["start"], timings[k]["end"])):
            j += 1
        if j - k > 1:
            t0, t1 = timings[k]["start"], timings[k]["end"]
            lens = [max(1, len(re.sub(r"\W", "", timings[q]["word"]))) for q in range(k, j)]
            acc = t0
            for q, L in zip(range(k, j), lens):
                d = (t1 - t0) * L / sum(lens)
                timings[q]["start"], timings[q]["end"] = round(acc, 3), round(acc + d, 3)
                acc += d
        k = j
    for w in timings:
        w.pop("_s0"), w.pop("_s1")
    # onset refinement on the whole track, then keep monotonic order
    timings = ev.refine_onsets(timings, wav)
    for k in range(1, len(timings)):
        if timings[k]["start"] < timings[k - 1]["end"] - 0.25 or timings[k]["start"] <= timings[k - 1]["start"]:
            timings[k]["start"] = round(max(timings[k - 1]["end"], timings[k - 1]["start"] + 0.02), 3)
        timings[k]["end"] = round(max(timings[k]["end"], timings[k]["start"] + 0.02), 3)
    out = HERE / ("timings_es.json" if kind == "episode" else "timings_short_es.json")
    out.write_text("[\n" + ",\n".join(json.dumps(w, ensure_ascii=False) for w in timings) + "\n]\n")
    (TMP / f"asr_{kind}.json").write_text(json.dumps(report, indent=1, ensure_ascii=False))
    return report


# ---------------------------------------------------------------------------------------------- QC

def silences(wav: Path, thr_db=-50.0, hop=0.01):
    a = es.load_audio(wav, sr=SR_OUT, channels=1)[:, 0]
    n = int(hop * SR_OUT)
    fr = a[: len(a) // n * n].reshape(-1, n)
    db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-12)
    quiet = db < thr_db
    runs, k = [], 0
    while k < len(quiet):
        if quiet[k]:
            j = k
            while j < len(quiet) and quiet[j]:
                j += 1
            runs.append((k * hop, (j - k) * hop))
            k = j
        else:
            k += 1
    return runs


def qc(kind="episode"):
    wav = HERE / ("narration_es.wav" if kind == "episode" else "short_es.wav")
    man = json.loads((HERE / ("segments_es.json" if kind == "episode" else "segments_short_es.json")).read_text())
    segs = man["segments"]
    tim = json.loads((HERE / ("timings_es.json" if kind == "episode" else "timings_short_es.json")).read_text())
    asr = json.loads((TMP / f"asr_{kind}.json").read_text())
    m = es.measure_file(wav)
    info = sf.info(str(wav))
    beats = {}
    for s in segs:
        b = beats.setdefault(s["beat"], {"start": s["start"], "voice_end": 0, "slot_end": 0, "words": 0})
        b["voice_end"] = s["start"] + s["dur"]
        b["slot_end"] = s["start"] + s["dur"] + s["after"]
    for w in tim:
        beats[w["beat"]]["words"] += 1
    for k, b in beats.items():
        b["voice_span"] = round(b["voice_end"] - b["start"], 2)
        b["slot"] = round(b["slot_end"] - b["start"], 2)
        b["start"] = round(b["start"], 2)
    # silences: inside segments (unintended) vs. designed gaps
    runs = silences(wav)
    inside = []
    for t0, d in runs:
        for s in segs:
            if s["start"] + 0.05 < t0 and t0 + d < s["start"] + s["dur"] - 0.02:
                inside.append((round(t0, 2), round(d, 2), s["name"]))
    narr = [w for w in tim if w["speaker"] == "narrator"]
    spk = 0.0
    for s in segs:
        if s["speaker"] == "narrator":
            spk += s["dur"]
    res = {"duration_s": round(info.duration, 2), "loudness": m, "beats": beats, "asr": asr,
           "longest_silence": max(runs, key=lambda r: r[1]) if runs else None,
           "silences_over_1s": [(round(a, 2), round(b, 2)) for a, b in runs if b >= 1.0],
           "longest_silence_inside_a_line": max(inside, key=lambda r: r[1]) if inside else None,
           "narrator_wpm_in_segments": round(len(narr) / spk * 60, 1) if spk else None,
           "words": len(tim), "conf0_words": [w["word"] for w in tim if not w["conf"]],
           "last_word_end": tim[-1]["end"]}
    (HERE / ("qc_es.json" if kind == "episode" else "qc_short_es.json")).write_text(
        json.dumps(res, indent=1, ensure_ascii=False))
    print(json.dumps({k: v for k, v in res.items() if k not in ("asr", "beats")}, ensure_ascii=False))
    return res


def preview(kind="episode"):
    wav = HERE / ("narration_es.wav" if kind == "episode" else "short_es.wav")
    mp3 = HERE / ("narration_es_preview.mp3" if kind == "episode" else "short_es_preview.mp3")
    subprocess.run([FF, "-v", "error", "-y", "-i", str(wav), "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame",
                    "-b:a", "112k", "-threads", "2", str(mp3)], check=True)
    print(mp3.name, round(mp3.stat().st_size / 1e6, 2), "MB")


def main():
    stage = sys.argv[1] if len(sys.argv) > 1 else "all"
    kinds = ["episode", "short"] if stage == "all" else ["short"] if stage == "short" else ["episode"]
    if stage == "from-flac":
        return from_flac(sys.argv[2] if len(sys.argv) > 2 else None)
    for kind in kinds:
        if stage in ("all", "render", "short"):
            render(kind)
        if stage in ("all", "assemble", "short"):
            assemble(kind)
        if stage in ("all", "align", "short"):
            align_track(kind)
        if stage in ("all", "qc", "short"):
            qc(kind)
            preview(kind)


if __name__ == "__main__":
    main()
