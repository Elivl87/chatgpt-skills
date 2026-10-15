"""B side: Chatterbox Multilingual (CPU, 2 threads). Reference prompts = our own Kokoro clips (synthetic voices).
usage: cb_clips.py OUTDIR MODEL(base|latam) [line ids...]"""
import json, os, sys, time
from pathlib import Path
os.environ["OMP_NUM_THREADS"] = "2"
sys.path.insert(0, str(Path(__file__).parent))
import torch
torch.set_num_threads(2)
import soundfile as sf
from huggingface_hub import snapshot_download
from safetensors.torch import load_file
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from lines import LINES

OUT = Path(sys.argv[1]); MODEL = sys.argv[2]; ONLY = set(sys.argv[3:])
SETTINGS = {"x05": dict(exaggeration=0.5, cfg_weight=0.5), "x08": dict(exaggeration=0.8, cfg_weight=0.3)}
t0 = time.time()
base = snapshot_download("ResembleAI/chatterbox", local_files_only=True,
                         allow_patterns=["ve.pt", "t3_mtl23ls_v2.safetensors", "s3gen.pt",
                                         "grapheme_mtl_merged_expanded_v1.json", "conds.pt", "Cangjie5_TC.json"])
m = ChatterboxMultilingualTTS.from_local(base, "cpu")
if MODEL == "latam":
    p = snapshot_download("ResembleAI/Chatterbox-Multilingual-es-mx-latam", local_files_only=True,
                          allow_patterns=["t3_es_mx_latam.safetensors"])
    sd = load_file(Path(p) / "t3_es_mx_latam.safetensors")
    missing, unexpected = m.t3.load_state_dict(sd, strict=False)
    print("latam T3 load: missing", len(missing), "unexpected", len(unexpected), flush=True)
    assert not missing and not unexpected
load_s = time.time() - t0
print(f"load {load_s:.1f}s", flush=True)
statf = OUT / f"cb_{MODEL}_stats.json"
stats = json.loads(statf.read_text()) if statf.exists() else {}
stats["_load_s"] = round(load_s, 1)
for i, (lid, spk, text, tts, _) in enumerate(LINES):
    if ONLY and lid not in ONLY:
        continue
    ref = OUT / f"ref_{spk}.wav"
    for sk, kw in SETTINGS.items():
        f = OUT / f"cb_{MODEL}_{sk}_{lid}.wav"
        if f.exists():
            continue
        torch.manual_seed(1234 + i)
        t1 = time.time()
        w = m.generate(tts, language_id="es", audio_prompt_path=str(ref), **kw)
        dt = time.time() - t1
        a = w.squeeze(0).numpy()
        sf.write(f, a, m.sr)
        stats[f"{sk}_{lid}"] = {"sec": round(len(a) / m.sr, 3), "synth_s": round(dt, 1), "rtf": round(dt / (len(a) / m.sr), 2)}
        print(f.name, stats[f"{sk}_{lid}"], flush=True)
        statf.write_text(json.dumps(stats, indent=1))
