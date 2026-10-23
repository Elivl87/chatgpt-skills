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
ELIGE_CUT = "b09_19_narrator"   # last script line kept in ELIGE.mp3 (None = full passage)
ELIGE_WORDS = 135               # words up to and including that line (162 - the 27 of beat 13)
MP3 = {
    # Qwen3-TTS, Ryan preset (the timbre the Producer chose): 1 = preset as is · 2 = + energetic instruct per sentence
    # · 3 = + exclamative register seed A · 4 = seed B · 5 = designed voice (c♂) for reference (NOTES)
    "qwen3tts": [("qwen_a", 1), ("qwen_ryan_r1", 2), ("qwen_ryan_x1", 3)],
    "voxcpm2": [("vox_ref_ryan", 1)],
    "cosyvoice3": [("cosy_ref_ryan", 1), ("cosy_ref_ryan0", 2)],
    "chatterbox": [("cb_ref_ryan", 1), ("cb_builtin_energetic", 2)],
    # ELIGE (Producer, 2026-10-23: "Qwen3-TTS, VoxCPM2 y CosyVoice 3. Quiero escuchar a estos"): three tracks only,
    # Ryan timbre, full passage from the hook, same pace. Chatterbox stays in NOTES.md as the control.
    "ELIGE": [("qwen_ryan_x1", 1), ("vox_ref_ryan", 2), ("cosy_ref_ryan", 3)],
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


LINE_AFTER = {n: af for _, _, n, _, _, af in H.PASSAGE}


def cut_after(name, last_line):
    """Trim a rendered take right after `last_line` (script line name), using its json piece durations; -> wav path."""
    import soundfile as sf
    d = json.load(open(O / f"{name}.json"))["pieces"]
    t = 0.0
    for i, p in enumerate(d):
        t += p["before"] + p["dur_out"] + p["after"]
        last = (i + 1 == len(d)) or d[i + 1]["line"] != p["line"]
        if p["line"] == last_line and last:
            break
        if last:
            t += LINE_AFTER[p["line"]]
    x, sr = sf.read(O / f"{name}.wav", dtype="float32")
    out = O / f"{name}_cut.wav"
    sf.write(out, x[:int((t + 0.3) * sr)], sr, subtype="PCM_16")
    return out


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
        if name == "ELIGE" and ELIGE_CUT:
            w = cut_after(n, ELIGE_CUT)        # ELIGE must stay <= 4 min: hook + beat 9, the dinner joke is left out
            specs.append((str(w), beeps, ELIGE_WORDS))
            continue
        specs.append((str(w), beeps))
    out = HERE / f"{name}.mp3"
    rep = H.build_mp3(out, specs, kbps=48, post=True)
    (HERE / "logs").mkdir(exist_ok=True)
    json.dump({"takes": [(Path(sp[0]).stem, sp[1]) for sp in specs], "post": rep}, open(HERE / "logs" / f"post_{name}.json", "w"),
              ensure_ascii=False, indent=1)
    return rep


if __name__ == "__main__":
    which = sys.argv[1:] or ["all"]
    for k in (MP3 if which == ["all"] else which):
        build(k)
