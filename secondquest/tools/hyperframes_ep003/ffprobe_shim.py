#!/usr/bin/env python3
"""Minimal ffprobe stand-in (the container has ffmpeg from imageio-ffmpeg but no ffprobe).

It runs `ffmpeg -i <file>` and parses the banner into the JSON shape ffprobe prints for
`-show_format -show_streams -of json`. Enough for HyperFrames' asset probes (WAV audio,
PNG/JPG images, MP4 output). Usage: symlink as `.bin/ffprobe` (see render.sh).
"""
import json
import os
import re
import subprocess
import sys

FFMPEG = os.environ.get("HYPERFRAMES_FFMPEG_PATH") or os.path.join(os.path.dirname(os.path.realpath(__file__)), ".bin", "ffmpeg")


def probe(path):
    p = subprocess.run([FFMPEG, "-hide_banner", "-i", path], capture_output=True, text=True)
    err = p.stderr
    if "Input #0" not in err:
        sys.stderr.write(err)
        sys.exit(1)
    fmt = {"filename": path, "nb_streams": 0, "format_name": "", "tags": {}}
    m = re.search(r"Input #0, ([^,]+(?:,[^,]+)*?), from", err)
    if m:
        fmt["format_name"] = m.group(1).strip()
    m = re.search(r"Duration: (\d+):(\d+):(\d+(?:\.\d+)?)", err)
    dur = None
    if m:
        dur = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
        fmt["duration"] = "%.6f" % dur
    m = re.search(r"bitrate: (\d+) kb/s", err)
    if m:
        fmt["bit_rate"] = str(int(m.group(1)) * 1000)
    fmt["size"] = str(os.path.getsize(path))
    streams = []
    for line in err.splitlines():
        sm = re.match(r"\s*Stream #0:(\d+)(?:\[[^\]]*\])?(?:\([^)]*\))?: (Video|Audio|Data|Subtitle): (.*)", line)
        if not sm:
            continue
        idx, kind, rest = int(sm.group(1)), sm.group(2).lower(), sm.group(3)
        codec = rest.split(",")[0].split(" ")[0].strip()
        st = {"index": idx, "codec_type": kind, "codec_name": codec}
        if dur is not None:
            st["duration"] = "%.6f" % dur
        if kind == "video":
            wh = re.search(r", (\d{2,5})x(\d{2,5})", rest)
            if wh:
                st["width"], st["height"] = int(wh.group(1)), int(wh.group(2))
            pf = re.search(r"\(\w+\)|, (yuv\w+|rgba?\w*|gray\w*|pal8|bgra|argb)", rest)
            pix = re.search(r"\b(yuva?\d+\w*|rgba64\w*|rgba|rgb24|rgb48\w*|gray\w*|pal8|bgra|argb|ya8|ya16\w*)\b", rest)
            st["pix_fmt"] = pix.group(1) if pix else "rgb24"
            fps = re.search(r"([\d.]+) fps", rest)
            rate = fps.group(1) if fps else "25"
            if fps:
                fr = float(rate)
                st["r_frame_rate"] = st["avg_frame_rate"] = ("%d/1" % fr) if fr == int(fr) else ("%d/1000" % round(fr * 1000))
                if dur is not None:
                    st["nb_frames"] = str(int(round(dur * fr)))
            else:
                st["r_frame_rate"] = st["avg_frame_rate"] = "25/1"
                st["nb_frames"] = "1"
        elif kind == "audio":
            sr = re.search(r"(\d+) Hz", rest)
            if sr:
                st["sample_rate"] = sr.group(1)
            if "stereo" in rest:
                st["channels"] = 2
                st["channel_layout"] = "stereo"
            elif "mono" in rest:
                st["channels"] = 1
                st["channel_layout"] = "mono"
            else:
                ch = re.search(r"(\d+) channels", rest)
                st["channels"] = int(ch.group(1)) if ch else 2
        streams.append(st)
    fmt["nb_streams"] = len(streams)
    return fmt, streams


def main(argv):
    if "-version" in argv or "--version" in argv:
        print("ffprobe version 7.0.2-shim (ffmpeg banner parser)")
        return
    path = argv[-1]
    fmt, streams = probe(path)
    sel = None
    if "-select_streams" in argv:
        s = argv[argv.index("-select_streams") + 1]
        kind = {"v": "video", "a": "audio"}.get(s.split(":")[0])
        if kind:
            streams = [x for x in streams if x["codec_type"] == kind]
    of = ""
    for flag in ("-of", "-print_format", "-output_format"):
        if flag in argv:
            of = argv[argv.index(flag) + 1]
    entries = argv[argv.index("-show_entries") + 1] if "-show_entries" in argv else None
    if of.startswith("json") or not of:
        out = {}
        want_streams = "-show_streams" in argv or (entries and "stream" in entries)
        want_format = "-show_format" in argv or (entries and "format" in entries)
        if not want_streams and not want_format:
            want_streams = want_format = True
        if want_streams:
            out["streams"] = streams
        if want_format:
            out["format"] = fmt
        print(json.dumps(out, indent=1))
        return
    # csv/default flat output: print requested entry values one per line
    vals = []
    if entries:
        for part in entries.split(":"):
            sec, _, keys = part.partition("=")
            keys = [k for k in keys.split(",") if k]
            src = [fmt] if sec == "format" else streams
            for obj in src:
                for k in keys:
                    if k in obj:
                        vals.append(str(obj[k]))
    print("\n".join(vals))


if __name__ == "__main__":
    main(sys.argv[1:])
