"""comparacion_dialogo.mp3: the same ~20 s (beats 3-4) twice. 1 beep = character lines as SILENT text-box slots (as the
rejected animatic: slot = the Kokoro line length); 2 beeps = the narrator voices Eli's and Mila's lines (storyteller).
Both use the same directed narrator pieces (variant A).  usage: dialog_comparison.py PIECES_DIR OUT.mp3"""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path[:0] = [str(HERE), str(HERE.parent / "chatterbox_natural")]
import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402

import cbn  # noqa: E402
from build_samples import beeps, SR as SR44  # noqa: E402

LINES = ["b03_02_eli", "b03_03_narrator", "b04_05_narrator", "b04_06_mila", "b04_07_eli", "b04_08_narrator"]


def main():
    pdir, out = Path(sys.argv[1]), Path(sys.argv[2])
    kok = {s["name"]: s for s in json.loads((HERE.parents[1] / "ep/001/audio/segments_es_kokoro.json").read_text())["segments"]}
    plan = {s["name"]: s for s in cbn.bv.plan("episode")}
    import librosa
    versions = []
    for voiced in (False, True):
        parts, t, slots = [], 0.0, []
        for n in LINES:
            s = plan[n]
            if s["speaker"] == "narrator" or voiced:
                a, sr = sf.read(pdir / f"{n}.wav", dtype="float32")
            else:
                a = np.zeros(int(kok[n]["dur"] * cbn.SR), np.float32)
            if s["speaker"] != "narrator":
                slots.append({"line": n, "speaker": s["speaker"], "start": round(t, 2), "dur": round(len(a) / cbn.SR, 2)})
            parts += [a, np.zeros(int(s["after"] * cbn.SR), np.float32)]
            t += len(a) / cbn.SR + s["after"]
        x = np.concatenate(parts)
        print("voiced" if voiced else "silent", round(t, 2), "s", slots)
        versions.append(cbn.level(librosa.resample(x, orig_sr=cbn.SR, target_sr=SR44), -16.0, SR44))
    y = np.concatenate([np.zeros(int(0.3 * SR44), np.float32), beeps(1), versions[0], np.zeros(int(1.4 * SR44), np.float32),
                        beeps(2), versions[1], np.zeros(int(0.8 * SR44), np.float32)])
    pk = np.abs(y).max()
    if pk > 0.89:
        y *= 0.89 / pk
    subprocess.run([cbn.FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR44), "-ac", "1", "-i", "-", "-c:a", "libmp3lame",
                    "-b:a", "96k", "-threads", "2", str(out)], input=y.astype(np.float32).tobytes(), check=True)
    print(out, round(len(y) / SR44, 1), "s", round(out.stat().st_size / 1e6, 2), "MB")


if __name__ == "__main__":
    main()
