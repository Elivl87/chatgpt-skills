"""Chatterbox Multilingual V3 (MIT) in the ENERGETIC range the channel never tried (coordinator, 2026-10-23):
exaggeration 0.7-0.9 by delivery profile, cfg_weight 0.3, same passage, through the shared harness.

    OMP_NUM_THREADS=2 python -I run_chatterbox.py NAME --ref builtin|PATH.wav [--tries 6]
--ref builtin = the model's own internal voice (conds.pt, not a clone); PATH.wav = a synthetic reference (e.g. the most
energetic Qwen VoiceDesign take: a channel-owned synthetic voice, not a real person) for the cross test.
"""
import argparse
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import numpy as np  # noqa: E402
import torch  # noqa: E402

import harness as H  # noqa: E402

cbn = H.cbn
# exaggeration per profile (all in the 0.7-0.9 "enthusiastic" band); cfg 0.3 = free, quick pacing
EX = {"calm": 0.7, "intimate": 0.7, "deadpan": 0.72, "mila": 0.72, "warm": 0.78, "curious": 0.8, "question": 0.8,
      "eli_hurt": 0.8, "building": 0.85, "surprised": 0.9, "urgent": 0.9, "eli": 0.9}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("--ref", default="builtin")
    ap.add_argument("--tries", type=int, default=6)
    ap.add_argument("--cfg", type=float, default=0.3)
    ap.add_argument("--temp", type=float, default=0.8)
    a = ap.parse_args()
    m = cbn.load("v3", "base")
    cbn.set_ref(m, a.ref, 0.8)

    def fn(text, profile, seed):
        torch.manual_seed(seed)
        np.random.seed(seed % (2 ** 31))
        w = m.generate(text, language_id="es", exaggeration=EX[profile], cfg_weight=a.cfg, temperature=a.temp)
        return w.squeeze(0).numpy(), cbn.SR

    s = H.render(a.name, fn, tries=a.tries)
    if a.ref != "builtin":
        x, sr = H.sf.read(str(H.OUT / f"{a.name}.wav"), dtype="float32")
        print("similarity_to_ref", cbn.similarity(H.to24(x, sr), a.ref))


if __name__ == "__main__":
    main()
