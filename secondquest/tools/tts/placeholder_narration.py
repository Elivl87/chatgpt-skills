#!/usr/bin/env python3
"""
Placeholder narration generator (OPTIONAL tool).

Builds a scratch narration track from episodes/<ep>/script.json using the
open-weight Kokoro TTS model, so timing / comedy / mix can be judged before the
real voice-over exists. The output is a PLACEHOLDER: replace it with the real
recording and run `npm run narration:align` (see README).

Outputs (master locale)
  public/<assetRoot>/<narration.audio>   mono 48 kHz 16-bit WAV
  episodes/<ep>/timings.json             exact cue start/end per script line
Outputs (--locale es)
  public/<assetRoot>/<locales.es.narration>  (default audio/es/narration.wav)
  episodes/<ep>/timings.es.json          from episodes/<ep>/script.es.json

Voice (production policy)
  The voice, speed and phonemizer language come from shared/production.json
  (voices.<locale>): English = official "SecondQuest English Voice v1"
  (am_michael @ 1.0, en-us). A voice may also be a native Kokoro embedding
  blend, e.g. "am_michael:0.4,em_alex:0.6". --voice/--speed override for tests.

Pronunciation overrides
  shared/pronunciation.json and episodes/<ep>/pronunciation.json (episode wins),
  per locale. Each entry: {"match": "...", and one of "say" | "lang" | "phonemes"}.
  --dry-run prints the phonemes per line (and which overrides fired) without
  synthesising anything; add --json for machine-readable output (used by tests).

Setup (once):
  pip install kokoro-onnx soundfile numpy
  download kokoro-v1.0.int8.onnx + voices-v1.0.bin from
  https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)

Usage:
  python3 tools/tts/placeholder_narration.py ep001 --model <onnx> --voices <bin> [--locale es] [--dry-run [--json]]
"""
import argparse
import json
import os
import sys

import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_SR = 48000


def trim(samples: np.ndarray, sr: int, threshold: float = 0.01, pad: float = 0.03) -> np.ndarray:
    """Trim leading/trailing silence, keeping a short natural pad."""
    loud = np.where(np.abs(samples) > threshold)[0]
    if len(loud) == 0:
        return samples
    p = int(pad * sr)
    return samples[max(0, loud[0] - p): min(len(samples), loud[-1] + p)]


def resample(samples: np.ndarray, sr: int, target: int) -> np.ndarray:
    if sr == target:
        return samples
    n = int(round(len(samples) * target / sr))
    x_old = np.linspace(0, 1, len(samples), endpoint=False)
    x_new = np.linspace(0, 1, n, endpoint=False)
    return np.interp(x_new, x_old, samples).astype(np.float32)


def load_json(path, default=None):
    return json.load(open(path, encoding="utf-8")) if os.path.exists(path) else default


def resolve_voice(kokoro, spec: str):
    """Voice id -> str; blend "a:0.4,b:0.6" -> weighted sum of native style tensors."""
    if ":" not in spec:
        return spec
    parts = [(n, float(w)) for n, w in (p.split(":") for p in spec.split(","))]
    if abs(sum(w for _, w in parts) - 1) > 1e-6:
        sys.exit(f'Blend weights in "{spec}" must sum to 1')
    return sum(kokoro.get_voice_style(n) * w for n, w in parts).astype(np.float32)


def lexicon_for(ep_dir: str, locale: str):
    """Shared + episode overrides for a locale; episode entries win on the same match. Longest match first."""
    merged = {}
    for path in (os.path.join(ROOT, "shared", "pronunciation.json"), os.path.join(ep_dir, "pronunciation.json")):
        for e in (load_json(path, {}) or {}).get(locale, []) or []:
            merged[e["match"]] = e
    return sorted(merged.values(), key=lambda e: -len(e["match"]))


def phonemize_line(tokenizer, text: str, lang: str, lexicon):
    """Returns (phonemes, applied_matches). With no override hit, phonemizes the whole line normally."""
    hits = [e for e in lexicon if e["match"] in text]
    if not hits:
        return tokenizer.phonemize(text, lang), []
    # split the text into plain segments and override segments, left to right
    pieces, rest, applied = [], text, []
    while rest:
        best = None
        for e in hits:
            i = rest.find(e["match"])
            if i >= 0 and (best is None or i < best[0] or (i == best[0] and len(e["match"]) > len(best[1]["match"]))):
                best = (i, e)
        if best is None:
            pieces.append(("text", rest))
            break
        i, e = best
        if i > 0:
            pieces.append(("text", rest[:i]))
        pieces.append(("override", e))
        applied.append(e["match"])
        rest = rest[i + len(e["match"]):]
    out = []
    for kind, v in pieces:
        if kind == "text":
            if v.strip():
                out.append(tokenizer.phonemize(v, lang).strip())
        elif "phonemes" in v:
            out.append(v["phonemes"])
        elif "lang" in v:
            out.append(tokenizer.phonemize(v["match"], v["lang"]).strip())
        else:
            out.append(tokenizer.phonemize(v["say"], lang).strip())
    return " ".join(p for p in out if p), applied


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--model", required=True)
    ap.add_argument("--voices", required=True)
    ap.add_argument("--voice", default=None, help="override production voice (tests only)")
    ap.add_argument("--speed", type=float, default=None, help="override production speed (tests only)")
    ap.add_argument("--locale", default=None, help="default: the production default locale (en)")
    ap.add_argument("--dry-run", action="store_true", help="print phonemes/overrides, write nothing")
    ap.add_argument("--json", action="store_true", help="with --dry-run: JSON output")
    args = ap.parse_args()

    production = load_json(os.path.join(ROOT, "shared", "production.json"), {})
    ep_dir = os.path.join(ROOT, "episodes", args.episode)
    episode = json.load(open(os.path.join(ep_dir, "episode.json")))
    master = episode.get("locale", production.get("defaultLocale", "en"))
    locale = args.locale or production.get("render", {}).get("defaultLocale") or master
    if locale == master:
        script_file, timings_file = "script.json", "timings.json"
        narration_rel = episode["narration"]["audio"]
    else:
        loc_cfg = episode.get("locales", {}).get(locale)
        if loc_cfg is None:
            sys.exit(f'Locale "{locale}" is not declared in episode.json (npm run add:locale -- {args.episode} {locale})')
        script_file, timings_file = f"script.{locale}.json", f"timings.{locale}.json"
        narration_rel = loc_cfg.get("narration", f"audio/{locale}/narration.wav")
    script = json.load(open(os.path.join(ep_dir, script_file), encoding="utf-8"))
    vcfg = production.get("voices", {}).get(locale)
    if vcfg is None:
        sys.exit(f'No voice for locale "{locale}" in shared/production.json')
    voice_spec = args.voice or vcfg["voice"]
    speed = args.speed or vcfg["speed"]
    lang = vcfg["lang"]
    lead_in = script.get("placeholderTts", {}).get("leadIn", 0.3)
    lexicon = lexicon_for(ep_dir, locale)

    from kokoro_onnx import Kokoro  # imported late so --help works without it

    kokoro = Kokoro(args.model, args.voices)
    voice = resolve_voice(kokoro, voice_spec)

    if args.dry_run:
        rows = []
        for line in script["lines"]:
            text = line["text"] if isinstance(line["text"], str) else line["text"].get(locale, "")
            ph, applied = phonemize_line(kokoro.tokenizer, text, lang, lexicon)
            rows.append({"id": line["id"], "text": text, "phonemes": ph, "overrides": applied})
        if args.json:
            print(json.dumps({"locale": locale, "voice": voice_spec, "speed": speed, "lang": lang, "lines": rows}, ensure_ascii=False))
        else:
            print(f"locale {locale} · voice {voice_spec} @ {speed} · phonemizer {lang} · {len(lexicon)} override(s)")
            for r in rows:
                print(f"  {r['id']}  {r['phonemes']}" + (f"   ← override: {', '.join(r['overrides'])}" if r["overrides"] else ""))
        return

    import soundfile as sf

    chunks = [np.zeros(int(lead_in * OUT_SR), dtype=np.float32)]
    t = lead_in
    cues, n_overrides = {}, 0
    for line in script["lines"]:
        text = line["text"] if isinstance(line["text"], str) else line["text"].get(locale, "")
        ph, applied = phonemize_line(kokoro.tokenizer, text, lang, lexicon)
        n_overrides += len(applied)
        if applied:
            samples, sr = kokoro.create(ph, voice=voice, speed=speed, lang=lang, is_phonemes=True)
        else:
            samples, sr = kokoro.create(text, voice=voice, speed=speed, lang=lang)
        samples = resample(trim(np.asarray(samples, dtype=np.float32), sr), sr, OUT_SR)
        dur = len(samples) / OUT_SR
        cues[line["id"]] = {"start": round(t, 3), "end": round(t + dur, 3), "text": text}
        print(f"  {line['id']}  {t:6.2f}s  +{dur:4.2f}s  {text}" + (f"   [override: {', '.join(applied)}]" if applied else ""))
        chunks.append(samples)
        pause = float(line.get("pauseAfter", 0.3))
        chunks.append(np.zeros(int(pause * OUT_SR), dtype=np.float32))
        t += dur + pause

    audio = np.concatenate(chunks)
    peak = float(np.max(np.abs(audio))) or 1.0
    audio = audio * (0.89 / peak)  # ~-1 dBFS peak; loudness is normalised at final mix

    out_wav = os.path.join(ROOT, "public", episode["assetRoot"], narration_rel)
    os.makedirs(os.path.dirname(out_wav), exist_ok=True)
    sf.write(out_wav, audio, OUT_SR, subtype="PCM_16")

    timings = {
        "source": narration_rel,
        "generatedBy": f"placeholder-tts:kokoro:{voice_spec}@{speed}",
        "tts": {"voice": voice_spec, "speed": speed, "lang": lang, "overrides": n_overrides},
        "duration": round(len(audio) / OUT_SR, 3),
        "cues": cues,
    }
    with open(os.path.join(ep_dir, timings_file), "w", encoding="utf-8") as f:
        json.dump(timings, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"\nWrote {out_wav} ({timings['duration']:.2f}s) and {timings_file}")


if __name__ == "__main__":
    sys.exit(main())
