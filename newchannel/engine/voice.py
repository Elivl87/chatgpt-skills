#!/usr/bin/env python3
"""Channel narration: Kokoro-82M with the channel voices + word timings (faster-whisper, aligned to the script).

The channel voices (Producer-approved, voice/VOICE_TESTS.md):
    EN = candidate G: af_heart 0.7 + ef_dora 0.3, speed 0.84   (American English G2P, misaki)
    ES = candidate D: ef_dora 0.6 + af_heart 0.4, speed 0.92   (espeak-ng 'es-419': Latin-American seseo/yeismo)

Runs in the voice venv (torch + kokoro + faster-whisper; see setup_voice_env.sh), NOT the system python:

    $TTD_VENV/bin/python engine/voice.py --lang en --text "One tap of the brakes. ..." --out ep/001/audio
    $TTD_VENV/bin/python engine/voice.py --lang es --script ep/001/SCRIPT_ES419.txt --out ep/001/audio/es

Outputs in --out:
    narration.wav    48 kHz mono 24-bit, trimmed, 70 Hz high-pass, gentle 2.5:1 compression, -16 LUFS (two-pass
                     loudnorm, TP -1.5). The final mix (sound.py) re-normalises everything to -14 LUFS.
    timings.json     [{"word": "brakes", "text": "brakes.", "start": 1.23, "end": 1.61, "i": 4, "conf": 1}, ...]
                     One entry per SCRIPT word, script spelling (the script wins). conf: 1 = matched to a Whisper
                     word, 0 = interpolated between neighbours (listed in the log).
    voice_meta.json  voice recipe, speed, model hashes, wpm, alignment report.

Script handling: paragraphs/sentences are synthesised one by one (Kokoro's sweet spot is 100-200 tokens) and joined
with fixed air: --gap-sentence (0.28 s) and --gap-paragraph (0.75 s, blank line in the script). A line that is
exactly "[pause 1.2]" inserts that much silence. Misaki inline phonemes `[word](/phonemes/)` work for EN; they are
removed from the text used for alignment.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

os.environ.setdefault("OMP_NUM_THREADS", "2")
HERE = Path(__file__).resolve().parent
VENV = Path(os.environ.get("TTD_VENV", "/tmp/claude-0/ttdenv/venv"))
os.environ.setdefault("HF_HOME", str(VENV.parent / "hf"))

VOICES = {
    "en": {"lang_code": "a", "g2p": None, "recipe": {"af_heart": 0.7, "ef_dora": 0.3}, "speed": 0.84,
           "candidate": "EN G (blend heart70 dora30)"},
    "es": {"lang_code": "e", "g2p": "es-419", "recipe": {"ef_dora": 0.6, "af_heart": 0.4}, "speed": 0.92,
           "candidate": "ES D (blend dora60 heart40)"},
}
SR_TTS = 24000
SR_OUT = 48000
FFMPEG = "/usr/bin/ffmpeg"

# ------------------------------------------------------------------------------------------------ text utils

_ONES_EN = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen " \
           "seventeen eighteen nineteen".split()
_TENS_EN = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
_ONES_ES = ("cero uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis "
            "diecisiete dieciocho diecinueve veinte veintiuno veintidós veintitrés veinticuatro veinticinco "
            "veintiséis veintisiete veintiocho veintinueve").split()
_TENS_ES = "_ _ veinte treinta cuarenta cincuenta sesenta setenta ochenta noventa".split()
_HUND_ES = "_ ciento doscientos trescientos cuatrocientos quinientos seiscientos setecientos ochocientos " \
           "novecientos".split()


def num_words(n: int, lang: str) -> str:
    """Integers 0..999999 spelled out (enough to align Whisper's digits with a spelled-out script)."""
    if lang == "en":
        if n < 20:
            return _ONES_EN[n]
        if n < 100:
            return _TENS_EN[n // 10] + ("" if n % 10 == 0 else " " + _ONES_EN[n % 10])
        if n < 1000:
            return _ONES_EN[n // 100] + " hundred" + ("" if n % 100 == 0 else " " + num_words(n % 100, lang))
        return num_words(n // 1000, lang) + " thousand" + ("" if n % 1000 == 0 else " " + num_words(n % 1000, lang))
    if n < 30:
        return _ONES_ES[n]
    if n < 100:
        return _TENS_ES[n // 10] + ("" if n % 10 == 0 else " y " + _ONES_ES[n % 10])
    if n == 100:
        return "cien"
    if n < 1000:
        return _HUND_ES[n // 100] + ("" if n % 100 == 0 else " " + num_words(n % 100, lang))
    k = n // 1000
    return ("mil" if k == 1 else num_words(k, lang) + " mil") + ("" if n % 1000 == 0 else " " + num_words(n % 1000, lang))


def strip_accents(s: str) -> str:
    s = s.replace("ñ", "\0")
    s = "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")
    return s.replace("\0", "ñ")


def norm_tokens(word: str, lang: str) -> list[str]:
    """One script/Whisper word -> list of comparable sub-tokens (lowercase, no punctuation/accents, digits spelled,
    hyphens split)."""
    w = word.lower().replace("’", "'")
    w = re.sub(r"(?<=\d)[,.](?=\d{3})", "", w)          # 10,000 / 10.000 -> 10000
    out = []
    for part in re.split(r"[-–—/]", w):
        part = re.sub(r"[^\w']+", "", part).strip("'")
        if not part:
            continue
        if part.isdigit():
            out.extend(num_words(int(part), lang).split())
        else:
            out.append(strip_accents(part))
    return out


def clean_script(text: str) -> str:
    """Remove misaki phoneme overrides [word](/.../) -> word, for alignment."""
    return re.sub(r"\[([^\]]+)\]\(/[^)]*/\)", r"\1", text)


def split_script(text: str):
    """-> list of ("say", sentence) / ("gap", seconds). Paragraph breaks and [pause x] become gaps."""
    items = []
    paras = re.split(r"\n\s*\n", text.strip())
    for pi, para in enumerate(paras):
        for line in para.split("\n"):
            line = line.strip()
            if not line:
                continue
            m = re.fullmatch(r"\[pause\s+([\d.]+)\]", line)
            if m:
                items.append(("pause", float(m.group(1))))
                continue
            for s in re.split(r"(?<=[.!?…])\s+(?=[^\s])", line):
                if s.strip():
                    items.append(("say", s.strip()))
        if pi < len(paras) - 1:
            items.append(("para", None))
    return items


# ------------------------------------------------------------------------------------------------ synthesis

def _trim(a, rel_db=-40.0, keep_head=0.03, keep_tail=0.06):
    """Kokoro pads every segment with its own silence; trim it so the script's gaps are the only air."""
    import numpy as np
    if not len(a):
        return a
    thr = np.abs(a).max() * 10 ** (rel_db / 20)
    idx = np.flatnonzero(np.abs(a) > thr)
    if not len(idx):
        return a
    i0 = max(0, idx[0] - int(keep_head * SR_TTS))
    i1 = min(len(a), idx[-1] + int(keep_tail * SR_TTS))
    return a[i0:i1]


def synthesize(text: str, lang: str, gap_sentence: float, gap_paragraph: float, speed: float | None = None):
    import numpy as np
    import torch
    torch.set_num_threads(int(os.environ.get("OMP_NUM_THREADS", "2")))
    from kokoro import KPipeline
    cfg = VOICES[lang]
    pipe = KPipeline(lang_code=cfg["lang_code"], repo_id="hexgrad/Kokoro-82M")
    if cfg["g2p"]:
        from misaki import espeak
        pipe.g2p = espeak.EspeakG2P(language=cfg["g2p"])
    voice = sum(w * pipe.load_single_voice(v) for v, w in cfg["recipe"].items())
    sp = speed or cfg["speed"]
    parts, phon = [], []
    items = split_script(text)
    for k, (kind, val) in enumerate(items):
        if kind == "say":
            for gs, ps, audio in pipe(val, voice=voice, speed=sp, split_pattern=None):
                parts.append(_trim(audio.numpy().astype(np.float32)))
                phon.append(ps)
            nxt = items[k + 1][0] if k + 1 < len(items) else None
            if nxt == "say":
                parts.append(np.zeros(int(gap_sentence * SR_TTS), np.float32))
        elif kind == "para":
            parts.append(np.zeros(int(gap_paragraph * SR_TTS), np.float32))
        elif kind == "pause":
            parts.append(np.zeros(int(val * SR_TTS), np.float32))
    return np.concatenate(parts), phon, sp


def post(raw_wav: Path, out_wav: Path, target=-16.0):
    """Trim edges, 70 Hz HPF, 2.5:1 compression, two-pass loudnorm -> 48 kHz mono 24-bit (as voice/tools/post.py)."""
    ch = "highpass=f=70:poles=2,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:knee=4"
    trim = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,"
            "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.25,areverse")
    p1 = subprocess.run([FFMPEG, "-hide_banner", "-nostats", "-i", str(raw_wav), "-af",
                         f"{trim},{ch},loudnorm=I={target}:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                        capture_output=True, text=True).stderr
    js = json.loads(p1[p1.rindex("{"):p1.rindex("}") + 1])
    ln = (f"loudnorm=I={target}:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(raw_wav), "-af", f"{trim},{ch},{ln}",
                    "-ar", str(SR_OUT), "-ac", "1", "-c:a", "pcm_s24le", str(out_wav)], check=True)


# ------------------------------------------------------------------------------------------------ alignment

def whisper_words(wav: Path, lang: str, model_name: str):
    import numpy as np
    from faster_whisper import WhisperModel
    raw = subprocess.run([FFMPEG, "-v", "error", "-i", str(wav), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, np.float32)
    model = WhisperModel(model_name, device="cpu", compute_type="int8",
                         cpu_threads=int(os.environ.get("OMP_NUM_THREADS", "2")),
                         download_root=str(Path(os.environ["HF_HOME"]) / "whisper"))
    segs, _ = model.transcribe(audio, language=lang, beam_size=5, word_timestamps=True,
                               condition_on_previous_text=False, vad_filter=False)
    words = []
    for s in segs:
        for w in s.words or []:
            words.append({"text": w.word.strip(), "start": float(w.start), "end": float(w.end),
                          "p": float(w.probability)})
    return words


def align(script_text: str, wwords: list, lang: str, duration: float):
    """Map every script word to a time span. Sub-token level SequenceMatcher between script and Whisper; unmatched
    script words are interpolated (by character length) between their matched neighbours."""
    script_words = clean_script(script_text).split()
    script_words = [w for w in script_words if not re.fullmatch(r"\[pause\s+[\d.]+\]", w) and re.search(r"\w", w)]
    s_tok, s_owner = [], []
    for i, w in enumerate(script_words):
        for t in norm_tokens(w, lang):
            s_tok.append(t)
            s_owner.append(i)
    h_tok, h_owner = [], []
    for j, w in enumerate(wwords):
        for t in norm_tokens(w["text"], lang):
            h_tok.append(t)
            h_owner.append(j)
    sm = SequenceMatcher(a=s_tok, b=h_tok, autojunk=False)
    span = [[None, None] for _ in script_words]
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            i, j = s_owner[a + k], h_owner[b + k]
            st, en = wwords[j]["start"], wwords[j]["end"]
            span[i][0] = st if span[i][0] is None else min(span[i][0], st)
            span[i][1] = en if span[i][1] is None else max(span[i][1], en)
    matched = [s[0] is not None for s in span]
    # interpolate gaps
    out = []
    i = 0
    n = len(script_words)
    while i < n:
        if matched[i]:
            out.append((span[i][0], span[i][1], 1))
            i += 1
            continue
        j = i
        while j < n and not matched[j]:
            j += 1
        t0 = span[i - 1][1] if i > 0 else 0.0
        t1 = span[j][0] if j < n else duration
        lens = [max(1, len(re.sub(r"\W", "", script_words[k]))) for k in range(i, j)]
        tot = sum(lens)
        acc = t0
        for k, L in zip(range(i, j), lens):
            d = (t1 - t0) * L / tot
            out.append((acc, acc + d, 0))
            acc += d
        i = j
    res = []
    for k, (w, (st, en, c)) in enumerate(zip(script_words, out)):
        res.append({"i": k, "word": re.sub(r"^[^\w]+|[^\w]+$", "", w), "text": w, "start": round(st, 3),
                    "end": round(en, 3), "conf": c})
    # monotonic clean-up
    for k in range(1, len(res)):
        if res[k]["start"] < res[k - 1]["start"]:
            res[k]["start"] = res[k - 1]["start"]
        if res[k]["end"] < res[k]["start"]:
            res[k]["end"] = res[k]["start"]
    hyp = " ".join(h_tok)
    return res, {"matched": sum(matched), "words": n, "whisper_text": " ".join(w["text"] for w in wwords),
                 "unmatched": [script_words[k] for k in range(n) if not matched[k]], "hyp_norm": hyp}


def refine_onsets(tim: list, wav: Path, rel_db=-32.0, hop=0.005):
    """Whisper word boundaries tend to swallow the pause before a word. Move each start forward to the first 5 ms
    frame inside the word whose RMS is within `rel_db` of the narration's loud level, and pull each end back to the
    last such frame. Words keep their order; a word with no loud frame keeps its span."""
    import numpy as np
    import soundfile as sf
    x, sr = sf.read(str(wav), dtype="float32")
    if x.ndim > 1:
        x = x.mean(1)
    n = int(hop * sr)
    fr = x[: len(x) // n * n].reshape(-1, n)
    db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
    loud = db > (np.percentile(db, 95) + rel_db)
    for w in tim:
        a, b = int(w["start"] / hop), max(int(w["start"] / hop) + 1, int(np.ceil(w["end"] / hop)))
        idx = np.flatnonzero(loud[a:b])
        if len(idx):
            w["start"] = round((a + idx[0]) * hop, 3)
            w["end"] = round(max(w["start"] + hop, (a + idx[-1] + 1) * hop), 3)
    return tim


def sha(path: Path, n=12):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()[:n]


# ------------------------------------------------------------------------------------------------ main

def narrate(text: str, lang: str, out: Path, whisper="small", gap_sentence=0.28, gap_paragraph=0.75, speed=None):
    import numpy as np
    import soundfile as sf
    out.mkdir(parents=True, exist_ok=True)
    audio, phon, sp = synthesize(text, lang, gap_sentence, gap_paragraph, speed)
    raw = out / "narration_raw.wav"
    sf.write(raw, audio, SR_TTS, subtype="FLOAT")
    wav = out / "narration.wav"
    post(raw, wav)
    raw.unlink()
    info = sf.info(str(wav))
    words = whisper_words(wav, lang, whisper)
    tim, rep = align(text, words, lang, info.duration)
    tim = refine_onsets(tim, wav)
    (out / "timings.json").write_text(json.dumps(tim, indent=1, ensure_ascii=False))
    speak = (tim[-1]["end"] - tim[0]["start"]) if tim else 0
    meta = {"lang": lang, "voice": VOICES[lang], "speed": sp, "duration_s": round(info.duration, 3),
            "words": len(tim), "wpm": round(len(tim) / speak * 60, 1) if speak else None,
            "alignment": rep, "phonemes": phon, "whisper_model": whisper}
    try:
        from huggingface_hub import hf_hub_download
        for fn in ["kokoro-v1_0.pth"] + [f"voices/{v}.pt" for v in VOICES[lang]["recipe"]]:
            p = Path(hf_hub_download("hexgrad/Kokoro-82M", fn))
            meta.setdefault("sha256_12", {})[fn] = sha(p)
    except Exception as e:  # noqa: BLE001
        meta["sha_error"] = str(e)
    (out / "voice_meta.json").write_text(json.dumps(meta, indent=1, ensure_ascii=False))
    print(f"narration {info.duration:.2f} s, {len(tim)} words, {meta['wpm']} wpm; "
          f"aligned {rep['matched']}/{rep['words']}; unmatched: {rep['unmatched']}")
    print("whisper heard:", rep["whisper_text"])
    return wav, tim


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--lang", choices=sorted(VOICES), required=True)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--text")
    g.add_argument("--script", help="UTF-8 text file (the locked script, narration lines only)")
    ap.add_argument("--out", required=True)
    ap.add_argument("--whisper", default="small", help="faster-whisper model: small (default) or base")
    ap.add_argument("--speed", type=float, default=None, help="override the channel speed (measure wpm after!)")
    ap.add_argument("--gap-sentence", type=float, default=0.28)
    ap.add_argument("--gap-paragraph", type=float, default=0.75)
    ap.add_argument("--realign", action="store_true", help="only redo timings.json from an existing narration.wav")
    a = ap.parse_args()
    text = a.text if a.text is not None else Path(a.script).read_text(encoding="utf-8")
    out = Path(a.out)
    if a.realign:
        import soundfile as sf
        wav = out / "narration.wav"
        tim, rep = align(text, whisper_words(wav, a.lang, a.whisper), a.lang, sf.info(str(wav)).duration)
        tim = refine_onsets(tim, wav)
        (out / "timings.json").write_text(json.dumps(tim, indent=1, ensure_ascii=False))
        print(rep)
        return
    narrate(text, a.lang, out, a.whisper, a.gap_sentence, a.gap_paragraph, a.speed)


if __name__ == "__main__":
    sys.exit(main())
