#!/usr/bin/env python3
"""Ten Thousand Dots / Diez Mil Puntos - brand generator.

Deterministic and name-agnostic: every name, tagline, handle, anchor and bounce path comes from
`brand_config.json`; colours from `../palette.json`. Re-run after editing either file:

    python3 build_brand.py                 # everything
    python3 build_brand.py --only icon,banner
    python3 build_brand.py --config other_name.json --out /tmp/brand_test

Outputs go to the brand folder (parent of this script) unless --out is given.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from brandkit import mascot as M          # noqa: E402
from brandkit import printfx as P         # noqa: E402
from brandkit import wordmark as WM       # noqa: E402
from brandkit.canvas import Canvas, font  # noqa: E402

LABELS = {
    "neutral": "neutral", "curious": "curious", "surprised": "surprised", "worried": "worried",
    "delighted": "delighted", "smug": "smug", "sleepy": "sleepy", "dizzy": "dizzy",
    "wink": "wink", "sad": "sad", "focused": "focused", "laughing": "laughing",
}


# ------------------------------------------------------------------------------------ config

class Brand:
    def __init__(self, cfg_path: Path, out: Path):
        self.cfg_path = cfg_path
        self.cfg = json.loads(cfg_path.read_text())
        base = cfg_path.parent
        pal = json.loads((base / self.cfg["palette"]).read_text())
        self.pal = {k: v for k, v in pal.items() if isinstance(v, str) and v.startswith("#")}
        self.fonts = {k: dict(v, path=str((base / v["path"]).resolve())) for k, v in self.cfg["fonts"].items()}
        self.names = self.cfg["names"]
        self.seed = int(self.cfg.get("seed", 1))
        self.out = out
        out.mkdir(parents=True, exist_ok=True)

    def f(self, role, size):
        spec = self.fonts[role]
        return font(spec["path"], int(size), spec.get("axes"))

    def wm_layout(self, name, size, stacked=False):
        role = "display_stacked" if stacked else "display"
        lines = name["stacked"] if stacked else [name["text"]]
        return WM.layout(lines, self.f(role, size), name["anchor"])

    def wm_fit(self, name, width, stacked=False):
        """Font size whose layout content is ~`width` px wide."""
        lay = self.wm_layout(name, 200, stacked)
        x0, y0, x1, y1 = WM.crop_to_content(lay, 0)
        size = 200 * width / (x1 - x0)
        return int(size), self.wm_layout(name, size, stacked)

    def save(self, img, rel, colors=None):
        p = self.out / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        P.save_png(img, p, colors)
        print(f"  wrote {rel}  {img.size[0]}x{img.size[1]}  {p.stat().st_size / 1e6:.2f} MB")
        return p


# ------------------------------------------------------------------------------- crowd helper

def crowd_points(w, h, spacing, rng, jitter=0.32, margin=0.0):
    """Jittered hex lattice covering (w, h) -> (N, 2) array."""
    pts = []
    row_h = spacing * math.sqrt(3) / 2
    n_rows = int((h + 2 * margin) / row_h) + 2
    n_cols = int((w + 2 * margin) / spacing) + 2
    for r in range(n_rows):
        for c in range(n_cols):
            x = -margin + c * spacing + (spacing / 2 if r % 2 else 0)
            y = -margin + r * row_h
            pts.append((x, y))
    pts = np.array(pts, np.float32)
    pts += rng.uniform(-jitter, jitter, pts.shape).astype(np.float32) * spacing
    return pts


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


# --------------------------------------------------------------------------- 1. expressions

def build_expressions(B: Brand):
    W, H = 2400, 1330
    cv = Canvas(W, H, B.pal, B.seed + 1)
    title = B.f("display", 46)
    lab = B.f("label", 26)
    small = B.f("label", 20)
    cv.text("ink", (90, 70), "The companion  ·  12 expressions", title)
    cv.text("ink", (90, 140), "Flat printed disc, accent ink. Face = two dots + one line, overprinted in ink. "
            "Extras (sweat, sparkles, zzz) only outside the disc.", B.f("body", 28))
    cols, d = 6, 230
    cw = (W - 180) / cols
    for i, e in enumerate(M.EXPRESSIONS):
        cx = 90 + cw * (i % cols) + cw / 2
        cy = 370 + (i // cols) * 470
        cv.mascot(cx, cy, d, e)
        cv.text("ink", (cx, cy + d / 2 + 70), f"{i + 1:02d}  {LABELS[e]}", lab, anchor="mm")
        # readability proof: the same face at 48 px and 24 px, no extras
        cv.mascot(cx - 30, cy + d / 2 + 150, 48, e, extras=False)
        cv.mascot(cx + 30, cy + d / 2 + 150, 24, e, extras=False)
    cv.text("ink", (90, H - 70), "small row: 48 px and 24 px diameter, no extras  ·  "
            "rule: features never thinner than 1/14 of the diameter", small)
    B.save(cv.render(), "mascot_expressions.png", colors=256)


# ------------------------------------------------------------------------------ 2. wordmarks

def build_wordmarks(B: Brand):
    for name in B.names:
        for stacked in (False, True):
            size, lay = B.wm_fit(name, 1900 if not stacked else 1500, stacked)
            margin = int(lay.mascot_d * 0.9)
            x0, y0, x1, y1 = WM.crop_to_content(lay, margin)
            w, h = x1 - x0, y1 - y0
            suffix = "_stacked" if stacked else ""
            for transparent in (False, True):
                cv = Canvas(w, h, B.pal, B.seed + 2)
                cv.add_masks(WM.place(lay, cv.shape, -x0, -y0, "neutral"))
                img = cv.render(paper=not transparent)
                rel = f"wordmark_{name['slug']}{suffix}{'_transparent' if transparent else ''}.png"
                B.save(img, rel, colors=None if transparent else 256)


# ----------------------------------------------------------------------------- 3. storyboard

def _contacts(lay, name, ox, oy):
    r = lay.mascot_d / 2
    pts = []
    for spec in name["bounce"]:
        if spec[0] == "glyph":
            boxes = [g for g in lay.glyphs if g[0] == spec[1]]
            g = boxes[spec[2]]
            pts.append(((g[1] + g[3]) / 2 + ox, g[2] + oy - r))
        elif spec[0] == "dot":
            cx, cy, rr = lay.plain_dots[spec[1]]
            pts.append((cx + ox, cy - rr - r + oy))
    rest = (lay.mascot_c[0] + ox, lay.mascot_c[1] + oy)
    return pts, rest


def _path(points, rest, d, stem=None):
    """Polyline of the bounce path: fall -> hops between contacts -> land -> small rebound."""
    segs = []
    p0 = (points[0][0] - 1.6 * d, points[0][1] - 2.1 * d)
    segs.append(("fall", p0, points[0], 0.0))
    chain = points + [rest]
    for a, b in zip(chain[:-1], chain[1:]):
        segs.append(("hop", a, b, 1.25 * d))
    if stem is not None:          # tittle: land on the stem, rebound up into the floating rest
        segs[-1] = ("hop", chain[-2], stem, 1.25 * d)
        segs.append(("hop", stem, rest, 0.45 * d))
    else:
        segs.append(("hop", rest, rest, 0.32 * d))
    return segs


def _seg_pos(seg, t):
    kind, a, b, hgt = seg
    if kind == "fall":   # second half of a parabola: starts at apex, accelerates
        x = a[0] + (b[0] - a[0]) * t
        y = a[1] + (b[1] - a[1]) * t * t
        return x, y
    x = a[0] + (b[0] - a[0]) * t
    y = a[1] + (b[1] - a[1]) * t - 4 * hgt * t * (1 - t)
    return x, y


def build_storyboards(B: Brand):
    lab = B.f("label", 22)
    for name in B.names:
        size, lay = B.wm_fit(name, 1180)
        d = lay.mascot_d
        r = d / 2
        x0, y0, x1, y1 = WM.crop_to_content(lay, 0)
        PW, PH = 1400, int((y1 - y0) + 3.7 * d + 110)
        ox = int((PW - (x1 - x0)) / 2 - x0)
        oy = int(PH - 50 - (y1 - y0) - y0 - 0.2 * d)
        contacts, rest = _contacts(lay, name, ox, oy)
        stem = None
        if name['anchor'] != 'period':
            stem = (rest[0], lay.surface + oy - r)
        segs = _path(contacts, rest, d, stem)
        n = len(segs)   # fall, hop..., land-hop(rest->rest)
        # keyframes: (segment, t, sx, sy, expression, look, label, frame@24fps)
        land = n - 2
        keys = [
            (0, 0.45, 0.84, 1.20, "surprised", (0, -0.05), "drop in", 6),
            (1, 0.00, 1.34, 0.68, "worried", (0, 0.05), "first bounce", 14),
            (1, 0.50, 0.96, 1.05, "delighted", (0.08, 0), "hop", 22),
            (2, 0.00, 1.30, 0.72, "laughing", (0.0, 0.05), "second bounce", 30),
            (land, 0.70, 0.82, 1.22, "curious", (0.06, 0.12), "aim", 37),
            (n - 1, 0.00, 1.40, 0.64, "surprised", (0, 0.06), "impact", 42),
            (n - 1, 0.50, 0.94, 1.08, "curious", (0.04, -0.04), "rebound", 47),
            (n - 1, 1.00, 1.00, 1.00, "wink", (0, 0), "settle = logo", 60),
        ]
        frames = []
        for ki, (si, t, sx, sy, expr, look, label, fr) in enumerate(keys):
            cv = Canvas(PW, PH, B.pal, B.seed + 30 + ki)
            cv.add_masks(WM.place(lay, cv.shape, ox, oy, show_mascot=False))
            # dotted trail in the second ink: every visited point up to now, growing toward the dot
            samples = []
            for sj in range(si + 1):
                tt_end = t if sj == si else 1.0
                steps = max(2, int(60 * tt_end))
                for k in range(steps + 1):
                    samples.append(_seg_pos(segs[sj], tt_end * k / steps))
            cx, cy = _seg_pos(segs[si], t)
            if name["anchor"] != "period" and si == n - 1 and t == 0.0:
                # landing on a narrow stem between tall letters: a smaller squash so it never overlaps them
                sx, sy = 1 + (sx - 1) * 0.4, 1 - (1 - sy) * 0.4
            if sy < 1:   # squash: keep the bottom on the surface
                cy += r * (1 - sy)
                if si == n - 1 and name['anchor'] == 'period':   # landing: spread to the right, away from the last letter
                    cx += r * (sx - 1) * 0.7
            pts, acc, last = [], 0.0, None
            for p in samples:
                if last is not None:
                    acc += math.hypot(p[0] - last[0], p[1] - last[1])
                if last is None or acc >= 0.42 * d:
                    pts.append(p)
                    acc = 0.0
                last = p
            for k, (px, py) in enumerate(pts):
                if math.hypot(px - cx, py - cy) < 0.95 * d:
                    continue
                f = (k + 1) / len(pts)
                cv.disc("second", px, py, r * (0.07 + 0.13 * f))
            # contact ticks at a bounce/impact
            if sy < 1:
                for a in (-150, -120, -60, -30):
                    ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
                    bx, by = cx, cy + r * sy
                    p1 = (bx + ca * r * 1.55, by + sa * r * 0.9)
                    p2 = (bx + ca * r * 1.95, by + sa * r * 1.25)
                    cv.add("ink", _stroke(cv.shape, p1, p2, max(2.0, d * 0.035)))
            cv.mascot(cx, cy, d, expr, sx=sx, sy=sy, look=look, extras=(ki == len(keys) - 1))
            cv.text("ink", (28, 24), f"{ki + 1:02d}", B.f("display", 30))
            cv.text("ink", (90, 30), f"f{fr:02d} @24fps  ·  {label}  ·  {expr}", lab)
            img = cv.render(grain=0.45, texture=0.04)
            frames.append(img)
            small = img.resize((960, round(PH * 960 / PW)), Image.LANCZOS)
            B.save(small, f"wordmark_animation_frames/{name['slug']}/kf{ki + 1:02d}.png", colors=64)
        # contact sheet
        g, cols = 40, 2
        rows = math.ceil(len(frames) / cols)
        SW = cols * PW + (cols + 1) * g
        SH = 150 + rows * (PH + g) + g
        sheet = Canvas(SW, SH, B.pal, B.seed + 99)
        sheet.text("ink", (g, 50), f"{name['text']}  ·  wordmark animation  ·  8 keyframes (24 fps, 2.5 s)",
                   B.f("display", 40))
        sheet.text("ink", (g, 108), "The companion falls in, bounces along the name and lands as "
                   + ("the full stop." if name["anchor"] == "period" else "the dot of the i.")
                   + "  Dotted trail = second ink; ticks = contact.", B.f("body", 28))
        img = sheet.render(grain=0.45, texture=0.04)
        for i, fr in enumerate(frames):
            x = g + (i % cols) * (PW + g)
            y = 150 + (i // cols) * (PH + g)
            img.paste(fr, (x, y))
            ImageDraw.Draw(img).rectangle([x - 1, y - 1, x + PW, y + PH], outline=B.pal["ink"], width=2)
        img = img.resize((2200, round(SH * 2200 / SW)), Image.LANCZOS)
        B.save(img, f"wordmark_storyboard_{name['slug']}.png", colors=128)


def _stroke(shape, p1, p2, w):
    H, W = shape
    m = np.zeros(shape, np.float32)
    x0, x1 = int(max(0, min(p1[0], p2[0]) - w - 2)), int(min(W, max(p1[0], p2[0]) + w + 3))
    y0, y1 = int(max(0, min(p1[1], p2[1]) - w - 2)), int(min(H, max(p1[1], p2[1]) + w + 3))
    if x1 <= x0 or y1 <= y0:
        return m
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    dd = M._seg(xx + 0.5, yy + 0.5, p1[0], p1[1], p2[0], p2[1]) - w / 2
    m[y0:y1, x0:x1] = np.clip(0.5 - dd, 0, 1)
    return m


# ------------------------------------------------------------------------------------ 4. icon

def draw_icon(B: Brand, S=800, expr="curious"):
    """Textless icon: a field of ink dots parting around one companion with a face."""
    rng = np.random.default_rng(B.seed + 4)
    cv = Canvas(S, S, B.pal, B.seed + 4)
    c = np.array([S * 0.5, S * 0.5])
    d = S * 0.56
    spacing = S * 0.105
    pts = crowd_points(S, S, spacing, rng, jitter=0.18, margin=spacing)
    for x, y in pts:
        v = np.array([x, y]) - c
        dist = np.hypot(*v) + 1e-6
        clear = d / 2 + spacing * 0.55
        if dist < clear:
            continue
        # crowd parts around the companion: push outward, strongest near it
        push = spacing * 0.65 * math.exp(-(dist - clear) / (spacing * 1.4))
        x, y = c + v / dist * (dist + push)
        rr = spacing * 0.26 * (0.85 + 0.3 * rng.random())
        role = "second" if rng.random() < 0.14 else "ink"
        cv.disc(role, x, y, rr)
    cv.mascot(c[0], c[1], d, expr, extras=False, look=(0.02, 0.0))
    return cv.render(grain=0.8)


def circle_crop(img, bg=None):
    S = img.size[0]
    m = Image.new("L", (S * 4, S * 4), 0)
    ImageDraw.Draw(m).ellipse([0, 0, S * 4 - 1, S * 4 - 1], fill=255)
    m = m.resize((S, S), Image.LANCZOS)
    out = Image.new("RGBA", (S, S), (0, 0, 0, 0)) if bg is None else Image.new("RGBA", (S, S), bg)
    out.paste(img.convert("RGBA"), (0, 0), m)
    return out


def build_icon(B: Brand):
    icon = draw_icon(B)
    B.save(icon, "logo_icon_800.png")
    # preview: circle crops at YouTube sizes on light and dark UI
    sizes = [98, 48, 24]
    W, H = 1200, 640
    sheet = Image.new("RGB", (W, H), "#FFFFFF")
    dr = ImageDraw.Draw(sheet)
    dr.rectangle([W // 2, 0, W, H], fill="#0F0F0F")
    lab = B.f("label", 22)
    for side, (bg, fg) in enumerate([("#FFFFFF", "#0F0F0F"), ("#0F0F0F", "#F1F1F1")]):
        x = 60 + side * W // 2
        dr.text((x, 40), "light UI" if side == 0 else "dark UI", font=B.f("display", 30), fill=fg)
        big = circle_crop(icon.resize((220, 220), Image.LANCZOS))
        sheet.paste(big, (x, 110), big)
        xx = x + 250
        for s in sizes:
            sm = circle_crop(icon.resize((s, s), Image.LANCZOS))
            sheet.paste(sm, (xx, 170 + (98 - s) // 2), sm)
            dr.text((xx + s // 2, 290), f"{s}px", font=lab, fill=fg, anchor="mm")
            xx += s + 44
        # in context: a fake comment row with the avatar at 40 px
        sm = circle_crop(icon.resize((40, 40), Image.LANCZOS))
        sheet.paste(sm, (x, 470), sm)
        dr.text((x + 56, 472), "Ten Thousand Dots", font=B.f("body_bold", 24), fill=fg)
        dr.text((x + 56, 502), "@tenthousanddots · 1 day ago", font=B.f("body", 20), fill=fg)
        dr.text((x, 580), "circle crop as YouTube shows it", font=lab, fill=fg)
    B.save(sheet, "logo_icon_preview.png")


# ---------------------------------------------------------------------------------- 5. banner

SAFE = (1546, 423)


def draw_banner(B: Brand, name, W=2560, H=1440, guides=False):
    rng = np.random.default_rng(B.seed + 5)
    cv = Canvas(W, H, B.pal, B.seed + 5)
    sx0, sy0 = (W - SAFE[0]) / 2, (H - SAFE[1]) / 2
    # lockup: stacked wordmark | rule | tagline column (+ handle), centred in the safe area.
    # Same display size for every language (fit on the first name) so EN/ES banners match.
    size, _ = B.wm_fit(B.names[0], 880, stacked=True)
    lay = B.wm_layout(name, size, stacked=True)
    x0, y0, x1, y1 = WM.crop_to_content(lay, 0)
    lw, lh = x1 - x0, y1 - y0
    tag = B.f("body", 54)
    hand = B.f("label", 30)
    tag_lines = _split_tagline(name["tagline"])
    tw = max(max(tag.getlength(t) for t in tag_lines), hand.getlength(name["handle"]))
    gap = 64
    total_w = lw + gap * 2 + 5 + tw
    left = W / 2 - total_w / 2
    ox = int(left - x0)
    oy = int(H / 2 - lh / 2 - y0)
    cv.add_masks(WM.place(lay, cv.shape, ox, oy, "neutral", look=(0.04, -0.02)))
    rx = int(left + lw + gap)
    top, bot = oy + y0 + lh * 0.04, oy + lay.line_baselines[-1]
    cv.rect("ink", rx, top, rx + 5, bot)
    tx = rx + 5 + gap
    lh_t = 66
    base = bot
    cv.text("second", (tx, base), name["handle"], hand, anchor="ls")
    for i, t in enumerate(reversed(tag_lines)):
        cv.text("ink", (tx, base - 74 - i * lh_t), t, tag, anchor="ls")
    cx0, cy0, cx1, cy1 = left - 90, oy + y0 - 80, left + total_w + 90, oy + y1 + 80
    # crowd field: dots whose size is a halftone of the distance from the lockup -> a halftone made of agents
    spacing = 46
    pts = crowd_points(W, H, spacing, rng, jitter=0.22, margin=spacing)
    flow = P.value_noise(H // 8, W // 8, 40, rng)
    group = P.value_noise(H // 8, W // 8, 22, np.random.default_rng(B.seed + 55))
    for x, y in pts:
        dx = max(cx0 - x, 0, x - cx1)
        dy = max(cy0 - y, 0, y - cy1)
        dist = math.hypot(dx * 0.75, dy * 1.25)
        tone = float(smoothstep(30, 760, dist))
        if tone <= 0.03:
            continue
        ix, iy = int(min(W - 1, max(0, x)) // 8), int(min(H - 1, max(0, y)) // 8)
        a = flow[min(iy, flow.shape[0] - 1), min(ix, flow.shape[1] - 1)] * 1.6
        x += math.cos(a) * spacing * 0.22
        y += math.sin(a) * spacing * 0.22
        rr = spacing * 0.31 * math.sqrt(tone)
        if rr < 2.2:
            continue
        gval = group[min(iy, group.shape[0] - 1), min(ix, group.shape[1] - 1)]
        role = "second" if gval > 1.05 else "ink"
        cv.disc(role, x, y, rr)
    img = cv.render(grain=0.9)
    if guides:
        dr = ImageDraw.Draw(img)
        dr.rectangle([sx0, sy0, sx0 + SAFE[0], sy0 + SAFE[1]], outline="#E8553A", width=4)
        dr.rectangle([0, (H - 423) / 2, W - 1, (H + 423) / 2], outline="#23746C", width=4)
        dr.rectangle([(W - 2560) / 2, (H - 423) / 2, W, (H + 423) / 2], outline="#23746C", width=2)
        lab = B.f("label", 34)
        dr.text((sx0 + 10, sy0 - 46), "safe area 1546x423 (all devices)", font=lab, fill="#E8553A")
        dr.text((20, (H - 423) / 2 - 46), "desktop 2560x423", font=lab, fill="#23746C")
        dr.text((20, 20), "TV 2560x1440", font=lab, fill="#1C2433")
    return img


def _split_tagline(t):
    if "," in t:
        a, b = t.split(",", 1)
        return [a + ",", b.strip()]
    return [t]


def build_banners(B: Brand):
    for i, name in enumerate(B.names):
        img = draw_banner(B, name)
        suffix = "" if i == 0 else f"_{name['lang'].split('-')[0]}"
        p = B.save(img, f"banner_2560x1440{suffix}.png", colors=256)
        if p.stat().st_size > 6e6:
            print("  WARNING: banner over YouTube's 6 MB limit")
        g = draw_banner(B, name, guides=True).resize((1280, 720), Image.LANCZOS)
        B.save(g, f"banner_safe_preview{suffix}.png", colors=256)


# ------------------------------------------------------------------------------- 6. board

def build_board(B: Brand):
    W, H = 3600, 2400
    cv = Canvas(W, H, B.pal, B.seed + 6)
    M_ = 110
    disp = lambda s: B.f("display", s)  # noqa: E731
    lab = B.f("label", 26)
    body = B.f("body", 30)
    en, es = B.names[0], B.names[1]
    # header
    cv.text("ink", (M_, 80), "BRAND BOARD v1  ·  2026-10-13", B.f("label", 28))
    cv.text("ink", (W - M_, 80), f"{en['handle']}  ·  {es['handle']}", B.f("label", 28), anchor="ra")
    cv.rect("ink", M_, 135, W - M_, 139)
    # primary wordmarks
    size, lay = B.wm_fit(en, 2100)
    x0, y0, x1, y1 = WM.crop_to_content(lay, 0)
    cv.add_masks(WM.place(lay, cv.shape, M_ - x0, 230 - y0, "neutral"))
    cv.text("ink", (M_, 230 + (y1 - y0) + 60), en["tagline"], B.f("body", 48))
    size2, lay2 = B.wm_fit(es, 1500)
    a0, b0, a1, b1 = WM.crop_to_content(lay2, 0)
    ytop = 230 + (y1 - y0) + 190
    cv.add_masks(WM.place(lay2, cv.shape, M_ - a0, ytop - b0, "neutral"))
    cv.text("ink", (M_, ytop + (b1 - b0) + 55), es["tagline"], B.f("body", 40))
    # palette
    px, py = 2440, 230
    cv.text("ink", (px, py), "INKS + PAPER", lab)
    roles = [("paper", "paper / background"), ("ink", "ink / type, crowd, faces"), ("accent", "accent / the companion only"),
             ("second", "second / other group, trails"), ("paper_shadow", "paper shadow / panels")]
    for i, (k, desc) in enumerate(roles):
        y = py + 50 + i * 120
        if k == "paper":
            cv.rect("ink", px, y, px + 150, y + 3)
            cv.rect("ink", px, y + 97, px + 150, y + 100)
            cv.rect("ink", px, y, px + 3, y + 100)
            cv.rect("ink", px + 147, y, px + 150, y + 100)
        else:
            role = {"ink": "ink", "accent": "body", "second": "second", "paper_shadow": "shadow"}[k]
            cv.rect(role, px, y, px + 150, y + 100)
        cv.text("ink", (px + 180, y + 18), B.pal[k].upper(), B.f("display", 34))
        cv.text("ink", (px + 180, y + 64), desc, B.f("body", 26))
    # type
    ty = 980
    cv.rect("ink", M_, ty - 40, W - M_, ty - 37)
    cv.text("ink", (M_, ty), "DISPLAY  ·  Martian Mono ExtraBold (OFL)", lab)
    cv.text("ink", (M_, ty + 50), "Aa Bb 0123 ñ", disp(120))
    cv.text("ink", (M_ + 1150, ty), "BODY  ·  Space Grotesk Medium (OFL)", lab)
    cv.text("ink", (M_ + 1150, ty + 55), "Why does the other queue always move faster?", B.f("body_bold", 50))
    cv.text("ink", (M_ + 1150, ty + 130), "Ten thousand dots follow three tiny rules. Watch the system break,", body)
    cv.text("ink", (M_ + 1150, ty + 172), "then watch it make sense. ¿Por qué el atasco aparece de la nada?", body)
    cv.text("ink", (M_ + 1150, ty + 230), "LABELS · Martian Mono Medium · 0.42 s · N = 10 000", B.f("label", 30))
    # construction of the companion (right of the type specimen)
    kx, ky, kd = 2560, 1175, 230
    cv.mascot(kx, ky, kd, "neutral")
    for yrel, txt in ((M.EY, "eye row y=-0.14R · eye r=0.135R"), (M.MY, "mouth row y=+0.30R · stroke 0.144R")):
        yy_ = ky + yrel * kd / 2
        cv.rect("ink", kx + kd / 2 + 20, yy_ - 1, kx + kd / 2 + 120, yy_ + 1)
        cv.text("ink", (kx + kd / 2 + 135, yy_), txt, B.f("label", 22), anchor="lm")
    cv.text("ink", (kx - kd / 2, ky - kd / 2 - 60), "CONSTRUCTION", lab)
    cv.text("ink", (kx + kd / 2 + 20, ky + kd / 2 - 10), "min size 24 px  ·  flat, no outline", B.f("label", 22), anchor="ls")
    # expressions strip
    ey = 1420
    cv.rect("ink", M_, ey - 60, W - M_, ey - 57)
    cv.text("ink", (M_, ey - 30), "THE COMPANION", lab)
    n = len(M.EXPRESSIONS)
    step = (W - 2 * M_ - 900) / n
    for i, e in enumerate(M.EXPRESSIONS):
        cx = M_ + 70 + i * step
        cv.mascot(cx, ey + 120, 130, e)
        cv.text("ink", (cx, ey + 255), LABELS[e], B.f("label", 20), anchor="mm")
    # halftone + grain specimen (right of expressions)
    hx, hy, hw, hh = W - M_ - 760, ey + 10, 760, 260
    yy, xx = np.mgrid[0:hh, 0:hw].astype(np.float32)
    tone = xx / hw
    ht = P.halftone(tone, cell=12, angle=15)
    cv.add("ink", ht[: hh // 2], hx, hy)
    ht2 = P.halftone(tone[: hh // 2], cell=12, angle=75)
    cv.add("second", ht2, hx, hy + hh // 2)
    cv.text("ink", (hx, hy + hh + 22), "halftone 15° ink / 75° second  ·  cell 12 px @1080p", B.f("label", 20))
    # do / don't
    dy = 1880
    cv.rect("ink", M_, dy - 60, W - M_, dy - 57)
    cv.text("ink", (M_, dy - 30), "DO", lab)
    cv.mascot(M_ + 120, dy + 140, 170, "neutral")
    for k in range(9):
        cv.disc("ink", M_ + 260 + (k % 3) * 46, dy + 90 + (k // 3) * 46, 15)
    cv.text("ink", (M_ + 420, dy + 80), "flat printed discs, one vermilion", body)
    cv.text("ink", (M_ + 420, dy + 122), "protagonist, crowds in ink/second", body)
    cv.text("ink", (M_ + 420, dy + 164), "halftone for tone, grain on paper", body)
    cv.text("ink", (M_ + 1050, dy - 30), "DON'T", lab)
    # 'don't' examples are drawn after the print render (they must look wrong: soft 3D, gradients)
    # icon + banner thumbnails
    img = cv.render()
    _dont_examples(img, M_ + 1050, dy + 40, B)
    icon = circle_crop(draw_icon(B).resize((330, 330), Image.LANCZOS))
    img.paste(icon, (W - M_ - 330 - 1000, dy - 10), icon)
    dr = ImageDraw.Draw(img)
    dr.text((W - M_ - 330 - 1000 + 165, dy + 345), "icon (circle crop)", font=B.f("label", 20), fill=B.pal["ink"], anchor="mm")
    ban = draw_banner(B, en).resize((960, 540), Image.LANCZOS)
    img.paste(ban, (W - M_ - 960, dy - 50))
    dr.rectangle([W - M_ - 961, dy - 51, W - M_, dy + 490], outline=B.pal["ink"], width=3)
    B.save(img, "brand_board.png", colors=256)


def _dont_examples(img, x, y, B):
    """Two wrong renderings (soft 3D blob, gradient glow) with a strike, for the do/don't panel."""
    S = 220
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    u, v = (xx - S * 0.5) / (S * 0.42), (yy - S * 0.5) / (S * 0.42)
    rr = np.hypot(u, v)
    inside = np.clip((1 - rr) * S * 0.42, 0, 1)
    # soft 3D blob: lambert + specular (the look we must NOT have)
    nz = np.sqrt(np.clip(1 - rr ** 2, 0, 1))
    lam = np.clip(-0.4 * u - 0.5 * v + 0.75 * nz, 0, 1)
    spec = np.clip(-0.4 * u - 0.5 * v + 0.75 * nz, 0, 1) ** 30
    col = np.array([0.55, 0.75, 0.95])[None, None] * (0.35 + 0.65 * lam[..., None]) + spec[..., None]
    blob = np.dstack([np.clip(col, 0, 1), inside])
    bi = Image.fromarray((blob * 255).astype(np.uint8), "RGBA")
    img.paste(bi, (x, y), bi)
    # gradient glow dot
    glow = np.clip(1 - rr, 0, 1) ** 1.5
    g = np.dstack([np.ones_like(rr) * 0.91, np.ones_like(rr) * 0.33, np.ones_like(rr) * 0.23, glow])
    gi = Image.fromarray((g * 255).astype(np.uint8), "RGBA")
    img.paste(gi, (x + 260, y), gi)
    dr = ImageDraw.Draw(img)
    for ox in (0, 260):
        dr.line([x + ox + 10, y + 10, x + ox + S - 10, y + S - 10], fill=B.pal["accent"], width=10)
    f = B.f("body", 26)
    dr.text((x + 540, y + 40), "no soft 3D blobs, no glow,", font=f, fill=B.pal["ink"])
    dr.text((x + 540, y + 82), "no gradients, no outlines on", font=f, fill=B.pal["ink"])
    dr.text((x + 540, y + 124), "the dot, never 2 faces at once", font=f, fill=B.pal["ink"])


# --------------------------------------------------------------------------------- contrast

def contrast_table(B: Brand):
    def lum(h):
        c = P.hex2rgb(h)
        c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

    keys = ["paper", "ink", "accent", "second", "paper_shadow"]
    rows = ["| on \\ fg | " + " | ".join(keys) + " |", "|---" * (len(keys) + 1) + "|"]
    for a in keys:
        cells = []
        for b in keys:
            la, lb = lum(B.pal[a]), lum(B.pal[b])
            cells.append("—" if a == b else f"{(max(la, lb) + 0.05) / (min(la, lb) + 0.05):.2f}")
        rows.append(f"| {a} | " + " | ".join(cells) + " |")
    txt = "\n".join(rows)
    print(txt)
    return txt


# ------------------------------------------------------------------------------------- main

STEPS = {
    "expressions": build_expressions, "wordmark": build_wordmarks, "storyboard": build_storyboards,
    "icon": build_icon, "banner": build_banners, "board": build_board, "contrast": contrast_table,
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default=str(HERE / "brand_config.json"))
    ap.add_argument("--out", default=str(HERE.parent))
    ap.add_argument("--only", default="", help="comma list of: " + ",".join(STEPS))
    a = ap.parse_args()
    B = Brand(Path(a.config).resolve(), Path(a.out).resolve())
    todo = [s for s in a.only.split(",") if s] or list(STEPS)
    for s in todo:
        print(f"[{s}]")
        STEPS[s](B)


if __name__ == "__main__":
    main()
