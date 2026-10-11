#!/usr/bin/env python3
"""Read a YouTube Studio audience-retention CSV and map it onto the episode's script.

Usage:
  python3 scripts/retention_read.py <retention.csv> --episode ep003 [--duration 338.3]
  python3 scripts/retention_read.py --demo            # builds synthetic CSVs and self-tests

Input: the Studio export (Analytics > Engagement > Audience retention > export). Column variants handled:
  time      seconds ("75", "75.0"), clock ("1:15", "0:01:15"), or position as % / fraction of the video
            ("Video position (%)", "Posición del video (%)": needs --duration or episodes/<ep>/timings.json)
  retention "%"-strings ("48.2%"), percentages (48.2) or fractions (0.482); "absolute" preferred over "relative"
  BOM, comma / semicolon / tab delimiters, preamble rows and extra columns are tolerated.

Output: hook leak (retention at 30 s and 60 s, drop 3-30 s), the 5 steepest 10-s cliffs (t >= 3 s, the end-screen tail
excluded) with the script line spoken there, the mid-video slide (slope 20-80 %), and ONE recommended fix.
Script lines come from episodes/<ep>/timings.json (cues) + script.json; blocks from script.json "acts" or the
"| **X · Name** | lNN-lMM | what we see |" table of docs/<ep>/SHOT_PLAN.md. Report only: it never edits a script.
Idea re-implemented from the MIT youtube-agent-skill (docs/research/2026-10-12_youtube-agent-skill_REVIEW.md).
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
import tempfile
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SKIP_START = 3.0      # natural start drop (autoplay, misclicks) is not a cliff
WINDOW = 10.0         # cliff = drop over this many seconds
TAIL = 20.0           # end-screen tail, excluded from cliffs (reported separately)

TIME_KEYS = ("position", "posición", "posicion", "time", "tiempo", "elapsed", "second", "segundo", "momento", "moment")
RET_KEYS = ("retention", "retención", "retencion", "audience", "audiencia", "watching", "viewers", "espectadores")


# ---------------------------------------------------------------- CSV parsing
def _num(s: str) -> float | None:
    s = (s or "").strip().replace(" ", "").replace("%", "").strip()
    if not s:
        return None
    if re.fullmatch(r"\d+(:\d{1,2}){1,2}(\.\d+)?", s):
        parts = [float(p) for p in s.split(":")]
        sec = 0.0
        for p in parts:
            sec = sec * 60 + p
        return sec
    if s.count(",") == 1 and "." not in s:  # decimal comma
        s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def _pick(headers: list[str], keys, avoid=()) -> int | None:
    best, best_score = None, 0
    for i, h in enumerate(headers):
        hl = h.lower()
        score = sum(2 for k in keys if k in hl)
        if score and ("absolute" in hl or "absoluta" in hl):
            score += 3
        if "relative" in hl or "relativa" in hl:
            score -= 2
        if any(a in hl for a in avoid):
            score -= 5
        if score > best_score:
            best, best_score = i, score
    return best


def read_retention(path: Path, duration: float | None) -> tuple[np.ndarray, np.ndarray, dict]:
    raw = path.read_bytes().decode("utf-8-sig", errors="replace")
    sample = raw[:4096]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
    except csv.Error:
        dialect = csv.excel
    rows = [r for r in csv.reader(io.StringIO(raw), dialect) if any(c.strip() for c in r)]
    # header = first row followed by a row with >= 2 numeric cells, itself having a non-numeric cell
    hdr_i = None
    for i, r in enumerate(rows[:-1]):
        if any(_num(c) is None and c.strip() for c in r) and sum(_num(c) is not None for c in rows[i + 1]) >= 2:
            hdr_i = i
            break
    if hdr_i is None:
        headers, data = [f"col{i}" for i in range(len(rows[0]))], rows
    else:
        headers, data = [h.strip() for h in rows[hdr_i]], rows[hdr_i + 1:]
    ti = _pick(headers, TIME_KEYS, avoid=("retention", "retención"))
    ri = _pick(headers, RET_KEYS, avoid=("position", "posición"))
    numeric_cols = [j for j in range(len(headers)) if sum(_num(r[j]) is not None for r in data if j < len(r)) >= len(data) * 0.8]
    if ti is None:
        ti = numeric_cols[0]
    if ri is None or ri == ti:
        ri = next(j for j in numeric_cols if j != ti)
    t_raw, r_raw = [], []
    for r in data:
        if max(ti, ri) >= len(r):
            continue
        a, b = _num(r[ti]), _num(r[ri])
        if a is not None and b is not None:
            t_raw.append(a)
            r_raw.append(b)
    t = np.array(t_raw, float)
    ret = np.array(r_raw, float)
    th = headers[ti].lower()
    is_clock = any(":" in (r[ti] if ti < len(r) else "") for r in data[:5])
    info = {"time_col": headers[ti], "ret_col": headers[ri], "rows": len(t)}
    if not is_clock and ("%" in th or "percent" in th or "porcentaje" in th or ("position" in th or "posición" in th or "posicion" in th)):
        frac = t / 100.0 if t.max() > 1.0 + 1e-9 else t
        if not duration:
            sys.exit("Time column is a % of the video: pass --duration or --episode with a timings.json")
        t = frac * duration
        info["time_mode"] = f"position % x {duration:.1f}s"
    else:
        info["time_mode"] = "clock" if is_clock else "seconds"
    if np.nanmax(ret) <= 1.5:
        ret = ret * 100.0
        info["ret_mode"] = "fraction -> %"
    else:
        info["ret_mode"] = "%"
    order = np.argsort(t)
    return t[order], ret[order], info


# ---------------------------------------------------------------- episode map
def load_episode(ep: str | None):
    if not ep:
        return None
    ed = ROOT / "episodes" / ep
    tj = ed / "timings.json"
    if not tj.exists():
        sys.exit(f"No {tj}")
    tim = json.loads(tj.read_text())
    cues = tim["cues"]
    cue_list = sorted(((v["start"], v["end"], k) for k, v in cues.items()), key=lambda c: c[0])
    text = {k: v.get("text", "") for k, v in cues.items()}
    sj = ed / "script.json"
    blocks = []
    if sj.exists():
        sc = json.loads(sj.read_text())
        for ln in sc.get("lines", []):
            text[ln["id"]] = ln["text"]
        for a in sc.get("acts", []):
            blocks.append((a["act"], a["from"], a["to"], ""))
    sp = ROOT / "docs" / ep / "SHOT_PLAN.md"
    if not blocks and sp.exists():
        for m in re.finditer(r"^\|\s*\*\*(.+?)\*\*\s*\|\s*(l\d+)\s*[-–]\s*(l\d+)\s*\|\s*([^|]*)\|", sp.read_text(), re.M):
            blocks.append((m.group(1), m.group(2), m.group(3), m.group(4).strip()))
    hook_end = None
    for s, e, k in cue_list:
        if re.fullmatch(r"\s*so,?\s*(\.\.\.)?\s*why\?\s*", text.get(k, "").lower()):
            hook_end = e
            break
    return {"cues": cue_list, "text": text, "blocks": blocks, "duration": tim.get("duration"), "hook_end": hook_end}


def _lnum(lid: str) -> int:
    m = re.search(r"\d+", lid)
    return int(m.group()) if m else -1


def line_at(epi, t: float):
    if not epi:
        return None, ""
    prev = None
    for s, e, k in epi["cues"]:
        if s <= t < e:
            return k, epi["text"].get(k, "")
        if s <= t:
            prev = k
    return (prev, "(pause after) " + epi["text"].get(prev, "")) if prev else (None, "")


def block_of(epi, lid):
    if not epi or not lid:
        return None
    n = _lnum(lid)
    for name, a, b, see in epi["blocks"]:
        if _lnum(a) <= n <= _lnum(b):
            return name, see
    return None


# ---------------------------------------------------------------- analysis
def analyse(t, ret, epi, duration):
    T = float(duration or t.max())
    grid = np.arange(0.0, np.floor(min(T, t.max())) + 1)
    r = np.interp(grid, t, ret)
    at = lambda s: float(np.interp(s, grid, r))
    out = {"duration": T, "r30": at(30), "r60": at(60), "r3": at(SKIP_START), "leak30": at(SKIP_START) - at(30)}
    end_ok = grid[-1] - TAIL - WINDOW
    cand = []
    for s in np.arange(SKIP_START, max(SKIP_START, end_ok) + 1):
        cand.append((at(s) - at(s + WINDOW), float(s)))
    cand.sort(reverse=True)
    cliffs = []
    for d, s in cand:
        if d <= 0 or any(abs(s - c[1]) < WINDOW for c in cliffs):
            continue
        cliffs.append((d, s))
        if len(cliffs) == 5:
            break
    out["cliffs"] = []
    for d, s in cliffs:
        mid = s + WINDOW / 2
        lid, txt = line_at(epi, mid)
        out["cliffs"].append({"start": s, "end": s + WINDOW, "drop": d, "line": lid, "text": txt, "block": block_of(epi, lid)})
    a, b = 0.2 * grid[-1], 0.8 * grid[-1]
    m = (grid >= a) & (grid <= b)
    out["slope_per_min"] = float(np.polyfit(grid[m], r[m], 1)[0] * 60) if m.sum() > 2 else float("nan")
    out["mid_range"] = (a, b, at(a), at(b))
    out["tail"] = (at(grid[-1] - TAIL), at(grid[-1]))
    out["hook_end"] = epi["hook_end"] if epi else None
    if out["hook_end"]:
        out["r_hook_end"] = at(out["hook_end"])
    return out


def mmss(s: float) -> str:
    return f"{int(s // 60)}:{int(s % 60):02d}"


def report(out, info, src) -> str:
    L = [f"Retention read: {src}",
         f"  columns: time='{info['time_col']}' ({info['time_mode']}), retention='{info['ret_col']}' ({info['ret_mode']}), {info['rows']} rows, video {mmss(out['duration'])}",
         "",
         "HOOK LEAK",
         f"  at 0:30 {out['r30']:.1f} %   at 1:00 {out['r60']:.1f} %   drop 0:03-0:30 {out['leak30']:.1f} pts"]
    if out.get("hook_end"):
        L.append(f"  at the hook's end ({mmss(out['hook_end'])}, \"So, why?\"): {out['r_hook_end']:.1f} %")
    L += ["", f"STEEPEST CLIFFS (drop per {WINDOW:.0f} s, t >= {SKIP_START:.0f} s, last {TAIL:.0f} s excluded)"]
    for i, c in enumerate(out["cliffs"], 1):
        blk = f" [{c['block'][0]}]" if c["block"] else ""
        L.append(f"  {i}. {mmss(c['start'])}-{mmss(c['end'])}  -{c['drop']:.1f} pts  {c['line'] or '-'}{blk}: {c['text'][:110]}")
    a, b, ra, rb = out["mid_range"]
    L += ["", "MID-VIDEO SLIDE",
          f"  {mmss(a)}-{mmss(b)}: {ra:.1f} % -> {rb:.1f} %, slope {out['slope_per_min']:+.2f} pts/min",
          f"  end-screen tail (last {TAIL:.0f} s): {out['tail'][0]:.1f} % -> {out['tail'][1]:.1f} % (expected, not a cliff)",
          "", "ONE FIX"]
    if not out["cliffs"]:
        L.append("  No cliff found: the curve only slides. Work on the hook (30 s retention).")
    else:
        c = out["cliffs"][0]
        where = f"{mmss(c['start'])}-{mmss(c['end'])}"
        hook = out.get("hook_end") and c["start"] < out["hook_end"]
        L.append(f"  Worst cliff {where} (-{c['drop']:.1f} pts) on {c['line'] or 'unmapped time'}: \"{c['text']}\"")
        if c["block"]:
            L.append(f"  Block: {c['block'][0]}" + (f" | on screen: {c['block'][1][:220]}" if c["block"][1] else ""))
        if hook:
            L.append("  Fix: the hook loses people before \"So, why?\": make line 1 the thumbnail's image and promise, cut a setup line, reach the question sooner.")
        else:
            L.append("  Fix: this is where the essay stops paying off. In the NEXT script, put a concrete visual beat or a"
                     " new question right before this moment, and compress the explanation it carries; check the shot"
                     " at this interval for a static or repeated picture.")
    L.append("  (Report only: locked scripts are never edited; the lesson goes into the next episode and the playbook.)")
    return "\n".join(L)


# ---------------------------------------------------------------- demo / self-test
def demo() -> int:
    ep = "ep003" if (ROOT / "episodes/ep003/timings.json").exists() else None
    epi = load_episode(ep)
    T = float(epi["duration"]) if epi else 360.0
    cliff_at = 150.0
    tt = np.linspace(0, T, 101)

    def curve(s):
        r = 100 - 28 * (1 - np.exp(-s / 2))           # start drop (mostly inside the first 3 s)
        r -= 0.05 * s                                     # slow slide
        r -= 10 * np.clip((s - cliff_at) / 8, 0, 1)       # injected cliff
        r -= 10 * np.clip((s - (T - 15)) / 15, 0, 1)      # end-screen tail
        return r

    tmp = Path(tempfile.mkdtemp(prefix="retention_demo_"))
    variants = {
        "studio_percent.csv": ("﻿Video position (%),Absolute audience retention (%),Relative audience retention\n",
                               lambda p, s, r: f"{p:.0f},{r:.2f}%,0.5\n"),
        "clock_fraction.csv": ("Report,Retention export\n\nTime,Audience retention,Notes\n",
                               lambda p, s, r: f"{int(s // 60)}:{s % 60:05.2f},{r / 100:.4f},x\n"),
        "seconds_semicolon.csv": ("﻿Segundos;Retención de audiencia (%)\n",
                                  lambda p, s, r: f"{s:.1f};{r:.2f}\n".replace(".", ",")),
    }
    ok = True
    first = None
    for name, (head, row) in variants.items():
        f = tmp / name
        f.write_text(head + "".join(row(p, s, curve(s)) for p, s in zip(range(101), tt)), encoding="utf-8")
        t, ret, info = read_retention(f, T)
        out = analyse(t, ret, epi, T)
        top = out["cliffs"][0]["start"] if out["cliffs"] else -1
        hit = abs(top + WINDOW / 2 - (cliff_at + 4)) <= WINDOW
        ok &= hit and abs(out["r30"] - curve(30)) < 1.5
        print(f"[self-test] {name:24s} time={info['time_mode']:22s} ret={info['ret_mode']:14s} "
              f"r30={out['r30']:.1f} (true {curve(30):.1f})  worst cliff at {mmss(top)}  {'OK' if hit else 'FAIL'}")
        if first is None:
            first = report(out, info, f"{f} (synthetic, episode {ep or 'none'})")
    print()
    print(first)
    print("\nSELF-TEST", "PASSED" if ok else "FAILED")
    return 0 if ok else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("csv", nargs="?", type=Path)
    ap.add_argument("--episode", help="epNNN: map times to script lines via episodes/<ep>/timings.json")
    ap.add_argument("--duration", type=float, help="video length in s (needed for %% time if no timings.json)")
    ap.add_argument("--demo", action="store_true", help="build synthetic CSVs and self-test")
    a = ap.parse_args()
    if a.demo:
        return demo()
    if not a.csv:
        ap.error("give a CSV or --demo")
    epi = load_episode(a.episode)
    duration = a.duration or (epi and epi["duration"])
    t, ret, info = read_retention(a.csv, duration)
    print(report(analyse(t, ret, epi, duration), info, a.csv))
    return 0


if __name__ == "__main__":
    sys.exit(main())
