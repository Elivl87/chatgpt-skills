"""Assemble the listening MP3s of the engine shoot-out from the rendered takes in $ET_OUT (default
/tmp/claude-0/engines/out): every variant is brought to the channel pace (harness.postprocess: rubberband tempo to
~150 wpm in speech, pitch 1.0, pauses capped at 0.45 s), levelled to -16 LUFS and announced by N beeps.

    python -I build_outputs.py qwen|voxcpm|cosyvoice|elige|all

The lists below are the recipe of each MP3 (which take, how many beeps). Writes the MP3 next to this file and the
post-processing numbers (wpm before/after, tempo factor, durations) to logs/post_<name>.json.
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import harness as H  # noqa: E402

O = H.OUT
MP3 = {
    # Qwen3-TTS, Ryan preset (the timbre the Producer chose): 1 = preset as is · 2 = + energetic instruct per sentence
    # · 3 = + exclamative register seed A · 4 = seed B · 5 = designed voice (c♂) for reference (NOTES)
    "qwen3tts": [("qwen_a", 1), ("qwen_ryan_r1", 2), ("qwen_ryan_x1", 3), ("qwen_ryan_x2", 4)],
    "voxcpm2": [("vox_ref_ryan", 1)],
    "cosyvoice3": [("cosy_ref_ryan", 1), ("cosy_ref_ryan0", 2)],
    "chatterbox": [("cb_ref_ryan", 1), ("cb_builtin_energetic", 2)],
    # ELIGE: Ryan-timbre variants, every one the full passage from the hook, same pace
    "ELIGE": [("qwen_a", 1), ("RYAN_BEST", 2), ("cb_ref_ryan", 3), ("vox_ref_ryan", 4), ("cosy_ref_ryan", 5)],
}


def ryan_best():
    """Most energetic of the instructed Ryan takes (pitch range × melody, WER must be ≤ 1 %)."""
    best, score = None, -1
    for n in ("qwen_ryan_r1", "qwen_ryan_x1", "qwen_ryan_x2"):
        p = O / f"{n}.json"
        if not p.exists():
            continue
        s = json.load(open(p))["summary"]
        if s["wer"] > 0.01:
            continue
        sc = s["pitch_range_st"] * (s["melody_std_st"] or 1)
        if sc > score:
            best, score = n, sc
    return best


def build(name):
    specs = []
    for n, beeps in MP3[name]:
        if n == "RYAN_BEST":
            n = ryan_best()
            if n is None:
                continue
        w = O / f"{n}.wav"
        if not w.exists():
            print("missing", w, "-> skipped")
            continue
        specs.append((str(w), beeps))
    out = HERE / f"{name}.mp3"
    rep = H.build_mp3(out, specs, kbps=48, post=True)
    (HERE / "logs").mkdir(exist_ok=True)
    json.dump({"takes": [(Path(p).stem, b) for p, b in specs], "post": rep}, open(HERE / "logs" / f"post_{name}.json", "w"),
              ensure_ascii=False, indent=1)
    return rep


if __name__ == "__main__":
    which = sys.argv[1:] or ["all"]
    for k in (MP3 if which == ["all"] else which):
        build(k)
