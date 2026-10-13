#!/usr/bin/env python3
"""QC for a rendered video: contact sheet, black/freeze/silence detection, loudness, stream checks, pacing.

    python3 engine/qc.py ep/001/renders/final.mp4 --out ep/001 [--timings ep/001/audio/timings.json] [--every 1]

Writes <out>/QC.md and <out>/contact_sheet.jpg (and <out>/qc.json). Pacing uses SecondQuest's own tools
(secondquest/scripts/style_bible.py measures; pacing_qc.py compares with the style-bible targets), run unchanged:
style_bible needs imageio_ffmpeg only to find ffmpeg, so a stub pointing at /usr/bin/ffmpeg is injected, and its output
folder (docs/style under its ROOT) is redirected to a temp dir. The targets come from 6-8 min episodes; on a 20 s clip
cuts/min and wpm are informational, not a verdict.

Checks (README section 7 / BRAND.md):
    video   H.264, yuv420p, expected size, fps, duration          audio  AAC 48 kHz
    loudness -14 LUFS integrated (+-1), true peak <= -1.0 dBTP     black  none (d >= 0.1 s, pix_th 0.10)
    freeze  none >= 0.5 s unless declared (n=0.001)               silence none >= 0.5 s at -50 dB unless declared
"""
from __future__ import annotations

import argparse
import contextlib
import importlib
import io
import json
import re
import subprocess
import sys
import tempfile
import types
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import look as L  # noqa: E402
import sound as S  # noqa: E402

FFMPEG, FFPROBE = "/usr/bin/ffmpeg", "/usr/bin/ffprobe"
REPO = HERE.parents[1]
SQ_SCRIPTS = REPO / "secondquest" / "scripts"


def probe(path):
    r = subprocess.run([FFPROBE, "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
                       capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def contact_sheet(path, out, every=1.0, cols=5, tile_w=384, label=True):
    """Tiles every `every` seconds (timestamp in the corner). Returns the output path."""
    info = probe(path)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    W, H = int(v["width"]), int(v["height"])
    tile_h = round(tile_w * H / W)
    raw = subprocess.run([FFMPEG, "-v", "error", "-i", str(path), "-vf",
                          f"fps=1/{every},scale={tile_w}:{tile_h}:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    n = len(raw) // (tile_w * tile_h * 3)
    rows = (n + cols - 1) // cols
    g = 6
    sheet = Image.new("RGB", (cols * tile_w + (cols + 1) * g, rows * tile_h + (rows + 1) * g), L.rgb("ink"))
    f = L.font("label_bold", 16)
    for i in range(n):
        im = Image.frombytes("RGB", (tile_w, tile_h), raw[i * tile_w * tile_h * 3:(i + 1) * tile_w * tile_h * 3])
        x, y = g + (i % cols) * (tile_w + g), g + (i // cols) * (tile_h + g)
        sheet.paste(im, (x, y))
        if label:
            d = ImageDraw.Draw(sheet)
            s = f"{i * every:5.1f}s".strip()
            d.rectangle([x, y, x + 62, y + 22], fill=L.rgb("ink"))
            d.text((x + 5, y + 3), s, font=f, fill=L.rgb("paper"))
    sheet.save(out, quality=88)
    return out


def detect(path):
    flt = ("[0:v]blackdetect=d=0.1:pix_th=0.10,freezedetect=n=0.001:d=0.5[v];"
           "[0:a]silencedetect=n=-50dB:d=0.5[a]")
    r = subprocess.run([FFMPEG, "-hide_banner", "-nostats", "-i", str(path), "-filter_complex", flt,
                        "-map", "[v]", "-map", "[a]", "-f", "null", "-"], capture_output=True, text=True).stderr
    black = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", r)
    fz_s = re.findall(r"freeze_start: ([\d.]+)", r)
    fz_e = re.findall(r"freeze_end: ([\d.]+)", r)
    si_s = re.findall(r"silence_start: (-?[\d.]+)", r)
    si_e = re.findall(r"silence_end: ([\d.]+)", r)
    pair = lambda a, b: [(float(x), float(y) if i < len(b) else None) for i, (x, y) in enumerate(zip(a, b + [None] * len(a)))]  # noqa: E731
    return {"black": [(float(a), float(b)) for a, b in black], "freeze": pair(fz_s, fz_e), "silence": pair(si_s, si_e)}


def pacing(path, name, timings=None):
    """Run SecondQuest style_bible + pacing_qc unchanged on the video. Returns (measurements dict, pacing text)."""
    if not (SQ_SCRIPTS / "style_bible.py").exists():
        return None, "secondquest/scripts not found"
    stub = types.ModuleType("imageio_ffmpeg")
    stub.get_ffmpeg_exe = lambda: FFMPEG
    sys.modules.setdefault("imageio_ffmpeg", stub)
    sys.path.insert(0, str(SQ_SCRIPTS))
    sb = importlib.import_module("style_bible")
    pq = importlib.import_module("pacing_qc")
    tmp = Path(tempfile.mkdtemp(dir="/tmp/claude-0"))
    sb.ROOT = tmp
    argv = [str(path), name]
    if timings:
        words = json.loads(Path(timings).read_text())
        cues = {str(i): {"text": w["word"], "start": w["start"], "end": w["end"]} for i, w in enumerate(words)}
        tj = tmp / "timings_cues.json"
        tj.write_text(json.dumps({"cues": cues}))
        argv += ["--timings", str(tj)]
    old = sys.argv
    buf = io.StringIO()
    try:
        sys.argv = ["style_bible.py"] + argv
        with contextlib.redirect_stdout(io.StringIO()):
            sb.main()
        js = tmp / "docs" / "style" / f"{name}.json"
        sys.argv = ["pacing_qc.py", str(js)]
        with contextlib.redirect_stdout(buf):
            pq.main()
        R = json.loads(js.read_text())
    finally:
        sys.argv = old
        subprocess.run(["rm", "-rf", str(tmp)])
    return R, buf.getvalue()


def run(path, out_dir, timings=None, every=1.0, name=None, expect=(1920, 1080), declared=None, notes=""):
    path, out_dir = Path(path), Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    name = name or path.stem
    info = probe(path)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    dur = float(info["format"]["duration"])
    size = int(info["format"]["size"])
    sheet = contact_sheet(path, out_dir / f"contact_sheet_{name}.jpg", every)
    det = detect(path) if a else {"black": [], "freeze": [], "silence": []}
    loud = S.measure_file(path) if a else None
    R, pq_txt = pacing(path, name, timings) if a else (None, "no audio")
    checks = []

    def chk(label, ok, val):
        checks.append((label, "PASS" if ok else "FAIL", val))

    chk("codec H.264 / yuv420p", v["codec_name"] == "h264" and v["pix_fmt"] == "yuv420p", f"{v['codec_name']} {v['pix_fmt']}")
    chk("resolution", (int(v["width"]), int(v["height"])) == tuple(expect), f"{v['width']}x{v['height']}")
    chk("file size <= 30 MB (chat delivery)", size <= 30e6, f"{size / 1e6:.2f} MB")
    if a:
        chk("audio AAC 48 kHz", a["codec_name"] == "aac" and a["sample_rate"] == "48000", f"{a['codec_name']} {a['sample_rate']}")
        chk("loudness -14 LUFS (+-1)", abs(loud["I"] + 14) <= 1.0, f"{loud['I']:.1f} LUFS")
        chk("true peak <= -1.0 dBTP", loud["TP"] <= -1.0, f"{loud['TP']:.1f} dBTP")
    declared = declared or {}
    chk("no black frames", not det["black"], det["black"] or "none")
    fz = [f for f in det["freeze"] if not any(s <= f[0] and (f[1] or dur) <= e + 0.05 for s, e in declared.get("freeze", []))]
    chk("no undeclared freezes >= 0.5 s", not fz, fz or ("none" if not det["freeze"] else f"declared only: {det['freeze']}"))
    si = [f for f in det["silence"] if not any(s - 0.05 <= f[0] and (f[1] or dur) <= e + 0.05 for s, e in declared.get("silence", []))]
    chk("no undeclared silence >= 0.5 s", not si, si or ("none" if not det["silence"] else f"declared only: {det['silence']}"))
    fps = v.get("r_frame_rate", "?")
    lines = [f"# QC · {name}", "", f"File: `{path.name}` · {dur:.2f} s · {fps} fps · {size / 1e6:.2f} MB · "
             f"{int(info['format'].get('bit_rate', 0)) / 1e6:.1f} Mb/s", "", "| Check | Result | Value |", "|---|---|---|"]
    lines += [f"| {c} | **{r}** | {val} |" for c, r, val in checks]
    if loud:
        lines += ["", f"Loudness (ffmpeg ebur128 on the final mp4): I {loud['I']:.1f} LUFS, TP {loud['TP']:.1f} dBTP, "
                      f"LRA {loud['LRA']:.1f} LU."]
    if R:
        keys = ["duration_s", "shots", "avg_shot_s", "longest_shot_s", "cuts_per_min", "motion_share", "still_2s_runs",
                "brightness_mean", "saturation_mean", "wpm_overall", "wpm_while_speaking"]
        lines += ["", "## Pacing (secondquest style_bible.py + pacing_qc.py)", "",
                  "| metric | value |", "|---|---|"] + [f"| {k} | {R.get(k)} |" for k in keys if k in R]
        lines += ["", "```", pq_txt.strip(), "```"]
    lines += ["", f"Contact sheet: `{sheet.name}` (1 tile every {every:g} s)."]
    if notes:
        lines += ["", notes]
    (out_dir / f"QC_{name}.md").write_text("\n".join(lines) + "\n")
    js = {"checks": checks, "loudness": loud, "detect": det, "pacing": R, "duration": dur, "size": size}
    (out_dir / f"qc_{name}.json").write_text(json.dumps(js, indent=1, default=str))
    print("\n".join(lines))
    return js


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--out", required=True)
    ap.add_argument("--timings")
    ap.add_argument("--every", type=float, default=1.0)
    ap.add_argument("--name")
    a = ap.parse_args()
    run(a.video, a.out, a.timings, a.every, a.name)
