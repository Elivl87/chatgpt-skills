"""Measurement table for NOTES.md: rejected take vs rendered variants (reads $CB_OUT/*.json + measure.py metrics).
usage: summarize.py OUT_DIR REJECTED.wav NAME1 NAME2 ... -> prints a Markdown table + per-profile retry stats"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import measure as M  # noqa: E402

REF = HERE.parent / "producer" / "producer_reference_clean.flac"


def row(name, path, summ):
    x, sr = M.load(path)
    m = M.measure(x, sr, words=summ.get("words"), ref=REF)
    return {"name": name, **m, "wer": summ.get("wer"), "retries": summ.get("retries"), "pieces": summ.get("pieces"),
            "wpm": summ.get("wpm_in_speech", m.get("wpm_in_speech")), "dur": summ.get("dur_s", m["dur_s"])}


def main():
    out, rej, names = Path(sys.argv[1]), sys.argv[2], sys.argv[3:]
    rows = [row("rechazada (ep001, exag. 0,45 fija)", rej, {"words": 203, "wer": 0.0, "retries": 4, "pieces": 8})]
    allp = {}
    for n in names:
        d = json.loads((out / f"{n}.json").read_text())
        rows.append(row(n, out / f"{n}.wav", d["summary"]))
        for p in d["pieces"]:
            a = allp.setdefault((n, p["profile"]), {"n": 0, "tries": 0, "wer0": 0})
            a["n"] += 1
            a["tries"] += p["tries"]
            a["wer0"] += p["wer"] == 0
    print("| Toma | Dur. | Rango tonal p5-p95 (st) | Desv. tono (st) | Melodía por segundo (st) | Desv. energía (dB) | Pausas n / media / desv. (s) | Ritmo (ppm) | WER | Retomas | Similitud |")
    print("|---|---|---|---|---|---|---|---|---|---|---|")
    for r in rows:
        print(f"| {r['name']} | {r['dur']} s | {r['pitch_range_st']} | {r['pitch_std_st']} | {r['melody_std_st']} | "
              f"{r['energy_std_db']} | {r['pauses_n']} / {r['pause_mean_s']} / {r['pause_std_s']} | {r['wpm']} | "
              f"{(r['wer'] or 0) * 100:.1f} % | {r['retries']} | {r['similarity']} |")
    print()
    print("| Variante | Perfil | Trozos | Tomas por trozo | Trozos con WER 0 |")
    print("|---|---|---|---|---|")
    for (n, prof), a in sorted(allp.items()):
        print(f"| {n} | {prof} | {a['n']} | {a['tries'] / a['n']:.1f} | {a['wer0']}/{a['n']} |")
    json.dump({"rows": rows, "profiles": {f"{k[0]}:{k[1]}": v for k, v in allp.items()}},
              open(out / "summary_table.json", "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
