"""Render orchestration: frames (multiprocessing) -> ffmpeg H.264 yuv420p -> mux the mastered audio.

An "episode" is any object with:
    W, H, fps, n_frames           ints
    frame(fi) -> HxWx3 uint8      draws frame fi (must be deterministic: frames render out of order, in workers)
    audio(path)                   optional: writes the mastered 48 kHz wav (sound.master)

    render_episode(ep, "out.mp4")                    final: 1920x1080, crf 18, AAC 192k
    render_episode(ep, "prev.mp4", preview=True)     854x480 review copy (same frames, smaller)
    render_episode(ep, "out.mp4", also_preview="prev.mp4")   both from ONE pass of frames
    render_episode(ep, "part.mp4", frames=range(300, 420))   a slice (for checks)

Frames are never written to disk: workers (fork, max 3 processes in total with ffmpeg; default 2 workers +
ffmpeg -threads 2) stream raw RGB in order into ffmpeg's stdin. The mp4 is written under /tmp/claude-0 and only moved
next to its final path once ffmpeg has exited cleanly, so a half-written video never sits in the repo.
"""
from __future__ import annotations

import multiprocessing as mp
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

import numpy as np

FFMPEG = "/usr/bin/ffmpeg"
TMP = Path(os.environ.get("TTD_TMP", "/tmp/claude-0")) / "engine_render"
os.environ.setdefault("OMP_NUM_THREADS", "2")

_EP = None


def _init_worker():
    os.environ["OMP_NUM_THREADS"] = "1"


def _frame(fi):
    a = _EP.frame(fi)
    if a.dtype != np.uint8 or a.shape != (_EP.H, _EP.W, 3):
        raise ValueError(f"frame {fi}: got {a.dtype} {a.shape}, want uint8 {(_EP.H, _EP.W, 3)}")
    return a.tobytes()


def _video_args(preview, crf=None):
    if preview:
        return ["-vf", "scale=854:480:flags=area", "-c:v", "libx264", "-preset", "medium", "-crf", str(crf or 23),
                "-pix_fmt", "yuv420p", "-profile:v", "high", "-c:a", "aac", "-b:a", "128k", "-ar", "48000"]
    return ["-c:v", "libx264", "-preset", "slow", "-crf", str(crf or 18), "-maxrate", "10M", "-bufsize", "20M",
            "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1", "-g", "60",
            "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]


def render_episode(ep, out, preview=False, also_preview=None, frames=None, workers=2, audio=True, crf=None,
                   log_every=60):
    """Render `ep` to `out` (mp4). Returns a stats dict (frames, seconds, fps, size)."""
    global _EP
    out = Path(out)
    TMP.mkdir(parents=True, exist_ok=True)
    frames = list(frames) if frames is not None else list(range(ep.n_frames))
    tag = f"{out.stem}_{os.getpid()}"
    wav = None
    if audio and hasattr(ep, "audio"):
        wav = TMP / f"{tag}.wav"
        ep.audio(str(wav))
    part = TMP / f"{tag}.part.mp4"
    part_prev = TMP / f"{tag}_prev.part.mp4" if also_preview else None
    cmd = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error", "-threads", "2",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{ep.W}x{ep.H}", "-r", str(ep.fps), "-i", "-"]
    if wav:
        t0 = frames[0] / ep.fps
        cmd += ["-ss", f"{t0:.4f}", "-i", str(wav)]
    maps = ["-map", "0:v"] + (["-map", "1:a"] if wav else [])
    cmd += maps + _video_args(preview, crf) + (["-shortest"] if wav else []) + ["-movflags", "+faststart", str(part)]
    if part_prev:
        cmd += maps + _video_args(True) + (["-shortest"] if wav else []) + ["-movflags", "+faststart", str(part_prev)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    _EP = ep
    t_start = time.time()
    n = 0
    try:
        if workers <= 1:
            it = (_frame(f) for f in frames)
            pool = None
        else:
            pool = mp.get_context("fork").Pool(min(3, workers), initializer=_init_worker)
            it = pool.imap(_frame, frames, chunksize=2)
        for buf in it:
            proc.stdin.write(buf)
            n += 1
            if log_every and n % log_every == 0:
                el = time.time() - t_start
                print(f"  {out.name}: {n}/{len(frames)} frames, {n / el:.1f} fps", flush=True)
        if pool:
            pool.close()
            pool.join()
    except BaseException:
        proc.kill()
        if pool:
            pool.terminate()
        raise
    finally:
        try:
            proc.stdin.close()
        except Exception:  # noqa: BLE001
            pass
    rc = proc.wait()
    el = time.time() - t_start
    if rc != 0:
        raise RuntimeError(f"ffmpeg failed ({rc})")
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(part), str(out))
    if part_prev:
        shutil.move(str(part_prev), str(also_preview))
    if wav and wav.exists():
        wav.unlink()
    stats = {"frames": n, "seconds": round(el, 1), "fps": round(n / el, 2), "size_mb": round(out.stat().st_size / 1e6, 2),
             "out": str(out)}
    print(f"rendered {out} : {n} frames in {el:.0f} s ({n / el:.2f} fps), {stats['size_mb']} MB", flush=True)
    return stats


def load_episode(spec):
    """'path/to/module.py:factory' -> episode object (factory() called with no args)."""
    import importlib.util
    path, _, fac = spec.partition(":")
    p = Path(path).resolve()
    sys.path.insert(0, str(p.parent))
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    specm = importlib.util.spec_from_file_location(p.stem, p)
    mod = importlib.util.module_from_spec(specm)
    specm.loader.exec_module(mod)
    return getattr(mod, fac or "episode")()


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description="python3 engine/render.py ep/001/episode.py:episode out.mp4 [--preview]")
    ap.add_argument("episode")
    ap.add_argument("out")
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--also-preview", default=None)
    ap.add_argument("--workers", type=int, default=2)
    ap.add_argument("--range", default=None, help="a:b frame range")
    ap.add_argument("--no-audio", action="store_true")
    a = ap.parse_args()
    ep = load_episode(a.episode)
    fr = None
    if a.range:
        s, e = a.range.split(":")
        fr = range(int(s), int(e))
    render_episode(ep, a.out, a.preview, a.also_preview, fr, a.workers, not a.no_audio)
