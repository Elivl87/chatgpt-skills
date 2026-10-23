"""VoxCPM2 variants (Apache-2.0 weights, GGUF Q8_0 by DennisHuang648/VoxCPM2-GGUF, Apache-2.0) through the MIT
llama.cpp-omni `voxcpm2-cli` on CPU.

    python -I run_voxcpm.py VARIANT [--tries 6]
VARIANT: x = cross test (style cue + -r the most energetic Qwen VoiceDesign take, a synthetic voice) · a_m / a_f = designed voice: "(description + style)" prefix in the text, per-sentence style cue
         b = controllable clone of the Producer's reference ("(style)" + text, -r reference.wav)
         b0 = plain clone (no style cue) · u = ultimate clone (prompt wav + transcript) with style cue.
"""
import argparse
import os
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import soundfile as sf  # noqa: E402

import harness as H  # noqa: E402

CLI = os.environ.get("VOX_CLI", "/tmp/claude-0/engines/llama.cpp-omni/build/bin/voxcpm2-cli")
W = Path(os.environ.get("VOX_W", "/tmp/claude-0/engines/voxcpm2"))
BASE = W / "VoxCPM2-BaseLM-Q8_0.gguf"
ACOU = W / "VoxCPM2-Acoustic-F16.gguf"
REF = "/tmp/claude-0/engines/ref/producer_16k.wav"
XREF = os.environ.get("VOX_REF", "/tmp/claude-0/engines/ref/qwen_cm_15s.wav")   # cross test: a synthetic channel voice as reference
DESIGN_M = ("Narrador latinoamericano de unos 35 años, voz masculina cálida de registro medio-bajo, con sonrisa, "
            "conversacional, ritmo ágil y enérgico, acento neutro de Latinoamérica")
DESIGN_F = ("Narradora latinoamericana de unos 35 años, voz femenina cálida de registro medio-bajo, con sonrisa, "
            "conversacional, ritmo ágil y enérgico, acento neutro de Latinoamérica")
# short style cues for the parenthesis (VoxCPM2 style guidance), one per direction profile
STYLE = {
    "calm": "tranquilo, pausado, cálido", "curious": "curioso, conversacional, con una sonrisa",
    "warm": "cálido, amable, relajado", "building": "tensión que crece, un poco más rápido",
    "surprised": "sorprendido de verdad, con asombro", "urgent": "urgente, rápido, tenso",
    "deadpan": "chiste seco, lento y plano", "question": "pregunta intrigada, curiosa",
    "intimate": "suave, bajo, íntimo", "eli": "impaciente, más rápido y más fuerte, exasperado",
    "eli_hurt": "dolido, avergonzado, más suave y lento", "mila": "serena, suave, dulce y lenta",
}


PACE = ", habla rápido y con energía" if H.PACE else ""


def make_fn(variant, prompt_text, threads):
    def fn(text, profile, seed):
        if variant == "a_m":
            t = f"({DESIGN_M}, {STYLE[profile]}{PACE}){text}"
        elif variant == "a_f":
            t = f"({DESIGN_F}, {STYLE[profile]}{PACE}){text}"
        elif variant == "b0":
            t = text
        else:
            t = f"({STYLE[profile]}{PACE}){text}"
        with tempfile.TemporaryDirectory() as d:
            out = Path(d) / "o.wav"
            cmd = [CLI, "--cpu", "-t", t, "-o", str(out), "--seed", str(seed)]
            if variant.startswith("b"):
                cmd += ["-r", REF]
            elif variant == "x":                      # cross test: Qwen VoiceDesign take as the reference voice
                cmd += ["-r", XREF]
            elif variant == "u":
                cmd += ["--prompt-wav", REF, "--prompt-text", prompt_text, "-r", REF]
            cmd += [str(BASE), str(ACOU)]
            env = dict(os.environ, OMP_NUM_THREADS=str(threads), GGML_N_THREADS=str(threads))
            r = subprocess.run(cmd, capture_output=True, text=True, env=env)
            if not out.exists():
                print(r.stdout[-800:], r.stderr[-800:])
                raise RuntimeError("voxcpm2-cli failed")
            x, sr = sf.read(out, dtype="float32")
        return x, sr
    return fn


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("variant")
    ap.add_argument("--tries", type=int, default=6)
    ap.add_argument("--threads", type=int, default=3)
    ap.add_argument("--prompt-text", default="")
    ap.add_argument("--name")
    a = ap.parse_args()
    H.render(a.name or f"vox_{a.variant}", make_fn(a.variant, a.prompt_text, a.threads), tries=a.tries)


if __name__ == "__main__":
    main()
