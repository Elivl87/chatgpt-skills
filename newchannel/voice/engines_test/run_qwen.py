"""Qwen3-TTS variants through the MIT C engine's HTTP server (gabriele-mastrapasqua/qwen3-tts, --int8, 3 threads).

    python -I run_qwen.py VARIANT [--port 8091] [--tries 6] [--speaker ryan] [--limit N]
VARIANT: a = preset voice, Spanish, no instruct · b = preset + per-sentence instruct (NARRADOR.md profiles)
         c_m / c_f = VoiceDesign (server started on the VoiceDesign model): designed male / female channel voice,
         description + per-sentence delivery cue in the instruct · d = Base model clone (server started on the Base
         model with --load-voice / --ref-audio; no instruct) · e = x-vector clone loaded on CustomVoice + instruct.
"""
import argparse
import io
import json
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402

import harness as H  # noqa: E402

DESIGN_M = ("Narrador latinoamericano de unos 35 años, voz masculina cálida de registro medio-bajo, con sonrisa, "
            "conversacional, ritmo ágil y enérgico, acento neutro de Latinoamérica, habla como un amigo curioso y emocionado.")
DESIGN_F = ("Narradora latinoamericana de unos 35 años, voz femenina cálida de registro medio-bajo, con sonrisa, "
            "conversacional, ritmo ágil y enérgico, acento neutro de Latinoamérica, habla como una amiga curiosa y emocionada.")


# Producer (2026-10-23): "habla desganado, sin ánimos, lento y aburrido; la voz DEBE mantener audiencia" -> energetic designs
DESIGN2_M = ("Locutor joven latinoamericano, voz masculina, muy enérgico y entusiasta, ritmo rápido, sonríe al hablar, "
             "entonación muy variada, estilo YouTuber que explica cosas con emoción.")
DESIGN2_F = ("Locutora joven latinoamericana, voz femenina, muy enérgica y entusiasta, ritmo rápido, sonríe al hablar, "
             "entonación muy variada, estilo YouTuber que explica cosas con emoción.")
DESIGN2_G = ("Locutor latinoamericano de unos 40 años, voz masculina GRAVE y profunda, muy enérgico y entusiasta, ritmo "
             "rápido, sonríe al hablar, entonación muy variada, estilo YouTuber que explica cosas con emoción.")
ENTHUSIASM = " ¡Con entusiasmo, rápido!"


def tts(port, body):
    req = urllib.request.Request(f"http://127.0.0.1:{port}/v1/tts", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=1800) as r:
        data = r.read()
    x, sr = sf.read(io.BytesIO(data), dtype="float32")
    return x, sr


def make_fn(variant, port, speaker, temperature=None, lang_instruct="en"):
    inst = H.INSTRUCT_ES if lang_instruct == "es" else H.INSTRUCT

    def fn(text, profile, seed):
        body = {"text": text, "language": "Spanish", "seed": int(seed)}
        if temperature is not None:
            body["temperature"] = temperature
        if variant in ("a", "b"):
            body["speaker"] = speaker          # d / e: the server was started with --load-voice (the clone)
        if variant in ("b", "e"):
            body["instruct"] = inst[profile]
        if variant.startswith("c2"):
            body["voice_design"] = "true"
            d2 = {"c2_m": DESIGN2_M, "c2_f": DESIGN2_F, "c2_g": DESIGN2_G}[variant]
            body["instruct"] = d2 + " " + H.INSTRUCT_ES[profile] + ENTHUSIASM
        elif variant.startswith("c"):
            body["voice_design"] = "true"
            body["instruct"] = (DESIGN_M if variant == "c_m" else DESIGN_F) + " " + H.INSTRUCT_ES[profile]
        return tts(port, body)
    return fn


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("variant")
    ap.add_argument("--port", type=int, default=8091)
    ap.add_argument("--tries", type=int, default=6)
    ap.add_argument("--speaker", default="ryan")
    ap.add_argument("--temperature", type=float)
    ap.add_argument("--instruct-lang", default="en")
    ap.add_argument("--name")
    a = ap.parse_args()
    name = a.name or f"qwen_{a.variant}"
    H.render(name, make_fn(a.variant, a.port, a.speaker, a.temperature, a.instruct_lang), tries=a.tries)


if __name__ == "__main__":
    main()
