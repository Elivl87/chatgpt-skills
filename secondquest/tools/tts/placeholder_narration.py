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

Setup (once):
  pip install kokoro-onnx soundfile numpy
  download kokoro-v1.0.int8.onnx + voices-v1.0.bin from
  https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)

Usage:
  python3 tools/tts/placeholder_narration.py ep001 --model <onnx> --voices <bin> [--locale es]
"""
import argparse
import json
import os
import sys

import numpy as np
import soundfile as sf

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


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--model", required=True)
    ap.add_argument("--voices", required=True)
    ap.add_argument("--voice", default=None)
    ap.add_argument("--speed", type=float, default=None)
    ap.add_argument("--locale", default=None, help="extra locale declared in episode.json (default: master)")
    args = ap.parse_args()

    ep_dir = os.path.join(ROOT, "episodes", args.episode)
    episode = json.load(open(os.path.join(ep_dir, "episode.json")))
    master = episode.get("locale", "en")
    locale = args.locale or master
    if locale == master:
        script_file, timings_file = "script.json", "timings.json"
        narration_rel = episode["narration"]["audio"]
    else:
        loc_cfg = episode.get("locales", {}).get(locale)
        if loc_cfg is None:
            sys.exit(f'Locale "{locale}" is not declared in episode.json (npm run add:locale -- {args.episode} {locale})')
        script_file, timings_file = f"script.{locale}.json", f"timings.{locale}.json"
        narration_rel = loc_cfg.get("narration", f"audio/{locale}/narration.wav")
    script = json.load(open(os.path.join(ep_dir, script_file)))
    cfg = script.get("placeholderTts", {})
    voice = args.voice or cfg.get("voice", "am_michael")
    speed = args.speed or cfg.get("speed", 1.0)
    lead_in = cfg.get("leadIn", 0.3)
    lang = cfg.get("lang") or ("en-gb" if voice.startswith("b") else "en-us")

    from kokoro_onnx import Kokoro  # imported late so --help works without it

    kokoro = Kokoro(args.model, args.voices)
    chunks = [np.zeros(int(lead_in * OUT_SR), dtype=np.float32)]
    t = lead_in
    cues = {}
    for line in script["lines"]:
        samples, sr = kokoro.create(line["text"], voice=voice, speed=speed, lang=lang)
        samples = resample(trim(np.asarray(samples, dtype=np.float32), sr), sr, OUT_SR)
        dur = len(samples) / OUT_SR
        cues[line["id"]] = {"start": round(t, 3), "end": round(t + dur, 3), "text": line["text"]}
        print(f"  {line['id']}  {t:6.2f}s  +{dur:4.2f}s  {line['text']}")
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
        "generatedBy": f"placeholder-tts:kokoro:{voice}@{speed}",
        "duration": round(len(audio) / OUT_SR, 3),
        "cues": cues,
    }
    with open(os.path.join(ep_dir, timings_file), "w") as f:
        json.dump(timings, f, indent=2)
        f.write("\n")
    print(f"\nWrote {out_wav} ({timings['duration']:.2f}s) and {timings_file}")


if __name__ == "__main__":
    sys.exit(main())
