"""Re-assemble a rendered variant from its per-line pieces with the long script gaps capped (the 5 s wordmark gap
after beat 4 and the 2 s bird gag are animation time, not voice): for the listening sample only.
usage: assemble_variant.py OUT_DIR NAME CAP_S -> OUT_DIR/NAME_listen.wav"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

out, name, cap = Path(sys.argv[1]), sys.argv[2], float(sys.argv[3])
segs = json.loads((out / f"{name}_segments.json").read_text())
parts = []
for s in segs:
    a, sr = sf.read(out / f"{name}_pieces" / f"{s['name']}.wav", dtype="float32")
    parts += [a, np.zeros(int(min(cap, s["after"]) * sr), np.float32)]
x = np.concatenate(parts)
sf.write(out / f"{name}_listen.wav", x, sr, subtype="FLOAT")
print(name, round(len(x) / sr, 1), "s")
