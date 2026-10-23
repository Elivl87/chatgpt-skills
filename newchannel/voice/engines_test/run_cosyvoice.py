"""Fun-CosyVoice3-0.5B variants (Apache-2.0), PyTorch CPU, in the cosy venv (/tmp/claude-0/engines/cosy-venv).

    python -I run_cosyvoice.py VARIANT [--tries 6]
VARIANT: a = zero-shot clone of the Producer's reference (prompt wav + its transcript) + instruct per sentence
         (inference_instruct2 with the Producer's reference as the timbre prompt)
         b = the same reference-free "designed" voice is not possible in CosyVoice3 (it always needs a prompt wav),
         so b = the channel's own synthetic voice as prompt (Kokoro narrator segment, voice/..b07_13_narrator.flac)
         + instruct per sentence · a0 = plain zero-shot clone without instruct (control).
"""
import argparse
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
SRC = Path(os.environ.get("COSY_SRC", "/tmp/claude-0/engines/cosyvoice-src"))
MODEL = Path(os.environ.get("COSY_MODEL", "/tmp/claude-0/engines/cosyvoice/Fun-CosyVoice3-0.5B"))
sys.path[:0] = [str(SRC), str(SRC / "third_party" / "Matcha-TTS")]
import numpy as np  # noqa: E402
import torch  # noqa: E402

import harness as H  # noqa: E402

torch.set_num_threads(int(os.environ.get("OMP_NUM_THREADS", "3")))
PRODUCER_WAV = "/tmp/claude-0/engines/ref/producer_16k.wav"
# The Producer's reference transcript (what he reads in producer_reference_clean.flac); set by --prompt-text if different.
PRODUCER_TEXT = os.environ.get("PRODUCER_TEXT", "")
KOKORO_REF = str(HERE.parent.parent / "ep" / "001" / "audio" / "segments" / "b07_13_narrator.flac")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("variant")
    ap.add_argument("--tries", type=int, default=6)
    ap.add_argument("--prompt-text", default=PRODUCER_TEXT)
    ap.add_argument("--name")
    ap.add_argument("--instruct-lang", default="es")
    a = ap.parse_args()
    from cosyvoice.cli.cosyvoice import AutoModel
    cv = AutoModel(model_dir=str(MODEL))
    sr = cv.sample_rate
    inst = H.INSTRUCT_ES if a.instruct_lang == "es" else H.INSTRUCT
    ref = PRODUCER_WAV if a.variant.startswith("a") else KOKORO_REF

    def fn(text, profile, seed):
        torch.manual_seed(seed)
        np.random.seed(seed % (2 ** 31))
        if a.variant == "a0":
            gen = cv.inference_zero_shot(text, "You are a helpful assistant.<|endofprompt|>" + a.prompt_text, ref,
                                         stream=False, text_frontend=False)
        else:
            gen = cv.inference_instruct2(text, f"You are a helpful assistant. {inst[profile]}<|endofprompt|>", ref,
                                         stream=False, text_frontend=False)
        out = [o["tts_speech"].squeeze(0).numpy() for o in gen]
        return np.concatenate(out), sr

    H.render(a.name or f"cosy_{a.variant}", fn, tries=a.tries)


if __name__ == "__main__":
    main()
