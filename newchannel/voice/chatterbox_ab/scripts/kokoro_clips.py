"""Render the A side (Kokoro, production recipe) + the synthetic reference prompts for Chatterbox."""
import json, os, sys, time
from pathlib import Path
os.environ["OMP_NUM_THREADS"] = "2"
os.environ.setdefault("HF_HOME", "/tmp/claude-0/ttdenv/hf")
AUD = Path("/home/user/chatgpt-skills/newchannel/ep/001/audio")
sys.path[:0] = [str(Path(__file__).parent), str(AUD), str(AUD.parents[2] / "engine")]
import numpy as np, soundfile as sf
import build_voice as bv
from lines import LINES, MILA_REF_TEXT

OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
bv.pipe()
stats = {}
for i, (lid, spk, text, tts, opt) in enumerate(LINES):
    t0 = time.time()
    a, ph = bv.synth_segment({"speaker": spk, "text": text}, opt, seed=500 + i)
    dt = time.time() - t0
    sf.write(OUT / f"kokoro_{lid}.wav", a, bv.SR)
    stats[lid] = {"sec": round(len(a) / bv.SR, 3), "synth_s": round(dt, 2), "phonemes": ph}
    print(lid, stats[lid], flush=True)

# reference prompts (synthetic, channel-owned voices)
SEG = AUD / "segments"
def load(n):
    x, sr = sf.read(SEG / f"{n}.flac", dtype="float32"); assert sr == 24000; return x
gap = np.zeros(int(0.3 * 24000), np.float32)
nar = load("b07_13_narrator")[: 24000 * 10]
eli = np.concatenate(sum([[load(n), gap] for n in ("b06_11_eli", "b13_27_eli", "b14_29_eli", "b19_43_eli", "b10_21_eli")], []))
mila, _ = bv.synth_segment({"speaker": "mila", "text": MILA_REF_TEXT}, {}, seed=777)
for n, x in (("narrator", nar), ("eli", eli), ("mila", mila)):
    sf.write(OUT / f"ref_{n}.wav", x, 24000)
    stats[f"ref_{n}"] = round(len(x) / 24000, 2)
(OUT / "kokoro_stats.json").write_text(json.dumps(stats, ensure_ascii=False, indent=1))
print(stats)
