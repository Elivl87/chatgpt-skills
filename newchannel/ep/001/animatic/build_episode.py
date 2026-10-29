#!/usr/bin/env python3
"""Join the 8 animatic blocks into the full pilot with ONE continuous sound mix (2026-10-24, Qwen voice).

    python3 build_episode.py --build <dir with <B>/events.json + block<B>_<q>.mp4> --quality review --out ep001_piloto_v4_720p.mp4

Sound: the per-block events (shots / cues / ambience, block-relative) are shifted to episode time and handed as one
"block" to engine/cine_suave.build_block, so the score (compose_score.py, re-timed from timings_es.json), the synthesised
ambience (Cine suave), the few effects, the ducking under the narration and the muted character slots are computed once
over the whole 8:34 (no per-block master, no level jump at the block joins). Narration stem untouched (-16 LUFS stem;
only the bus gain of the mix moves). Master -14 LUFS, TP <= -1.5 dBTP. Video: the block mp4s (identical x264 settings)
are concatenated losslessly and muxed with the mix (AAC 160k). > 30 MB: also an 854x480 version <= 30 MB.
"""
import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
NC = HERE.parents[2]
sys.path.insert(0, str(NC / "engine"))
sys.path.insert(0, str(HERE.parent / "audio" / "music"))
import sound as S  # noqa: E402
import cine_suave as CS  # noqa: E402
from compose_score import ensure_score  # noqa: E402

BLOCKS = ["A", "B", "C1", "C2", "D1", "D2", "E1", "E2"]
AUD = HERE.parent / "audio"


def episode_events(build):
    evs = [json.load(open(Path(build) / b / "events.json")) for b in BLOCKS]
    for a, b in zip(evs, evs[1:]):
        assert abs(a["t1"] - b["t0"]) < 1e-3, f"gap between blocks: {a['block']} {a['t1']} -> {b['block']} {b['t0']}"
    ep = {"block": "EP", "t0": 0.0, "t1": evs[-1]["t1"], "duration": evs[-1]["t1"], "shots": [], "cues": [], "ambience": []}
    for ev in evs:
        o = ev["t0"]
        ep["shots"] += [dict(s, start=round(s["start"] + o, 3), end=round(s["end"] + o, 3)) for s in ev["shots"]]
        ep["cues"] += [dict(c, t=round(c["t"] + o, 3), **({"t1": round(c["t1"] + o, 3)} if "t1" in c else {})) for c in ev["cues"]]
        ep["ambience"] += [dict(a, t0=round(a["t0"] + o, 3), t1=round(a["t1"] + o, 3)) for a in ev["ambience"]]
    return ep, evs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--build", required=True)
    ap.add_argument("--quality", default="review")
    ap.add_argument("--out", required=True)
    ap.add_argument("--narration", default=str(AUD / "narration_es.wav"))
    ap.add_argument("--small-out", default=None, help="854x480 version (only made when the main file is > --max-mb)")
    ap.add_argument("--max-mb", type=float, default=30.0)
    ap.add_argument("--reuse-wav", action="store_true", help="keep <build>/episode.wav from a previous run (video-only changes)")
    ap.add_argument("--sheet", default=None, help="6-frame contact sheet (jpg <= 400 KB) of Eli & Mila moments")
    ap.add_argument("--sheet-shots", default="A08_yell,B16_shrugs,C14_queyoque,F19_late,G13_dale,I07_you")
    a = ap.parse_args()
    build, out = Path(a.build), Path(a.out)
    ep, evs = episode_events(build)
    (build / "events_episode.json").write_text(json.dumps(ep))
    print(f"episode: {ep['duration']:.2f} s, {len(ep['shots'])} shots, {len(ep['cues'])} cues, {len(ep['ambience'])} ambience spans")
    # ---- one mix for the whole episode
    wav = build / "episode.wav"
    if a.reuse_wav and wav.exists():
        rep = json.load(open(build / "episode_report.json")) if (build / "episode_report.json").exists() else {}
        rep = {k: v for k, v in rep.items() if k in ("voice_I", "music_rel_LU", "amb_rel_LU", "char_slots_muted", "I", "TP", "LRA", "gain_db")}
        print(f"reusing {wav}")
    else:
        rep = CS.build_block(ep, a.narration, str(wav), str(AUD / "timings_es.json"), str(AUD / "segments_es.json"), ensure_score,
                             target=-14.0, ceiling=-1.5)
        rep.pop("mix", None)
        print(json.dumps({k: v for k, v in rep.items() if k not in ("scenes", "cues")}))
    # ---- video: lossless concat of the block mp4s
    lst = build / "concat.txt"
    # the frame-exact video of each block (<build>/<B>/video.mp4, every rendered frame) when it is there; a block mp4 muxed
    # with -shortest (before 2026-10-24) lost 1-4 end frames to the AAC priming and the join drifted up to 0.3 s by E2
    def vid(b):
        v = build / b / "video.mp4"
        return v if v.exists() else HERE / f"block{b}_{a.quality}.mp4"
    for b in BLOCKS:
        n = int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", str(vid(b))], capture_output=True, text=True).stdout.strip() or 0)
        want = round(next(e for e in evs if e["block"] == b)["duration"] * 30)
        assert n == want, f"block {b}: {n} frames in {vid(b)}, timeline wants {want}"
    lst.write_text("".join(f"file '{vid(b)}'\n" for b in BLOCKS))
    video = build / "episode_video.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-an", "-c:v", "copy", str(video)], check=True)
    part = out.with_suffix(".part.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-i", str(wav), "-c:v", "copy", "-af", "lowpass=f=15000", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                    "-movflags", "+faststart", str(part)], check=True)
    os.replace(part, out)
    m = S.measure_file(out)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)], capture_output=True, text=True).stdout.strip())
    size = out.stat().st_size / 1e6
    print(f"{out}: {dur:.2f} s, {size:.2f} MB, I {m['I']:.1f} LUFS, TP {m['TP']:.1f} dBTP, LRA {m['LRA']:.1f}")
    rep.update({"out": str(out), "duration": dur, "size_mb": round(size, 2), "final": m})
    if size > a.max_mb and a.small_out:
        small = Path(a.small_out)
        for crf in (27, 29, 31, 33):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-i", str(wav), "-vf", "scale=854:480", "-c:v", "libx264", "-preset", "slow",
                            "-crf", str(crf), "-pix_fmt", "yuv420p", "-profile:v", "high", "-af", "lowpass=f=15000", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", str(part)], check=True)
            os.replace(part, small)
            ss = small.stat().st_size / 1e6
            print(f"{small}: crf {crf} -> {ss:.2f} MB")
            if ss <= a.max_mb:
                break
        rep["small"] = {"out": str(small), "size_mb": round(ss, 2), "crf": crf}
    # ---- 6-frame contact sheet of Eli & Mila moments for the Producer (<= 400 KB)
    if a.sheet:
        from PIL import Image
        picks = []
        for sid in a.sheet_shots.split(","):
            s = next((x for x in ep["shots"] if x["id"] == sid), None)
            if s:
                picks.append((sid, s["start"] + min(0.6, (s["end"] - s["start"]) * 0.5)))
        tiles = []
        for sid, t in picks:
            png = build / f"sheet_{sid}.png"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(out), "-vframes", "1", str(png)], check=True)
            tiles.append((sid, t, Image.open(png).convert("RGB")))
        tw, th, cols = 600, 338, 3
        rows = (len(tiles) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * tw, rows * th), "#120c18")
        for i, (sid, t, im) in enumerate(tiles):
            sheet.paste(im.resize((tw, th)), ((i % cols) * tw, (i // cols) * th))
        for q in (85, 75, 65, 55, 45):
            sheet.save(a.sheet, quality=q)
            if os.path.getsize(a.sheet) <= 400_000:
                break
        rep["sheet"] = {"out": a.sheet, "kb": os.path.getsize(a.sheet) // 1000, "frames": [(sid, round(t, 2)) for sid, t, _ in tiles]}
        print(f"sheet {a.sheet}: {rep['sheet']['kb']} KB, {rep['sheet']['frames']}")
    (build / "episode_report.json").write_text(json.dumps(rep, indent=1, default=str))


if __name__ == "__main__":
    main()
