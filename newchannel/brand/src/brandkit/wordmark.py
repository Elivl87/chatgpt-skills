"""Name-agnostic wordmark: monospace display type where one dot of the name is the living mascot.

Rules (see BRAND.md):
* every dot in the wordmark is ROUND (font tittles/periods are replaced by true circles);
* exactly one of them is the companion (anchor = "period" -> the final full stop,
  or "tittle:N" -> the N-th dot of an i/j, 0-based);
* the companion is bigger than a normal dot so its face reads (1.0 x-height as a period,
  0.78 x-height as a tittle).
"""
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from . import mascot as M



def load_font(path, size, axes=None):
    f = ImageFont.truetype(str(path), size)
    if axes:
        f.set_variation_by_axes(axes)
    return f


@dataclass
class Layout:
    w: int
    h: int
    ink: np.ndarray                      # letters + plain dots
    mascot_c: tuple                      # (cx, cy) resting centre of the companion
    mascot_d: float                      # companion diameter
    glyphs: list = field(default_factory=list)   # (char, x0, y0, x1, y1) boxes in canvas px
    plain_dots: list = field(default_factory=list)  # (cx, cy, r)
    xheight: float = 0
    baseline: float = 0
    line_baselines: list = field(default_factory=list)
    surface: float = 0                   # y the companion lands on (baseline, or top of the i stem)


def _tittle_geom(font):
    """Exact tittle box of the font: mask('i') minus mask('dotless i'), both drawn at the origin."""
    def m(ch):
        im = Image.new("L", (font.size * 2, font.size * 2), 0)
        ImageDraw.Draw(im).text((0, 0), ch, font=font, fill=255)
        return np.asarray(im, np.float32)
    diff = np.clip(m("i") - m("\u0131"), 0, 255) > 128
    ys, xs = np.nonzero(diff)
    return (xs.min() + xs.max() + 1) / 2, (ys.min() + ys.max() + 1) / 2, max(np.ptp(xs), np.ptp(ys)) + 1, ys.max() + 1


def layout(lines, font, anchor="period", pad=None, line_gap=0.42, tracking=0.0, space=0.55,
           mascot_period=1.04, mascot_tittle=0.80):
    """lines: list of strings (multi-line lockups are left-aligned). Returns Layout with ink mask.

    space: advance of a word space as a fraction of the mono advance (tightened for display use).
    mascot_period / mascot_tittle: companion diameter in x-heights for each anchor kind.
    """
    if isinstance(lines, str):
        lines = [lines]
    adv = font.getlength("M") * (1 + tracking)
    xb = font.getbbox("x")
    xh = xb[3] - xb[1]
    baseline_off = xb[3]
    cap_top = font.getbbox("T")[1]
    cap_h = baseline_off - cap_top
    tcx, tcy, td, tbot = _tittle_geom(font)
    stem_top_rel = font.getbbox("\u0131")[1]
    pb = font.getbbox(".")
    period_d = max(pb[2] - pb[0], pb[3] - pb[1])
    kind = "period" if anchor == "period" else "tittle"
    md = (mascot_period if kind == "period" else mascot_tittle) * xh
    pad = int(pad if pad is not None else md)
    line_h = cap_h * (1 + line_gap)

    def line_width(line):
        return sum(adv * (space if c == " " else 1) for c in line)

    W = int(pad * 2 + max(line_width(l) for l in lines) + md * 0.5)
    H = int(pad * 2 + cap_h + line_h * (len(lines) - 1))
    img = Image.new("L", (W, H), 0)
    dr = ImageDraw.Draw(img)
    glyphs, baselines, slots = [], [], []
    for li, line in enumerate(lines):
        oy = pad - cap_top + li * line_h
        base_y = oy + baseline_off
        baselines.append(base_y)
        ox = pad
        for ch in line:
            if ch == " ":
                ox += adv * space
                continue
            b = font.getbbox(ch)
            if ch == "i":
                dr.text((ox, oy), "\u0131", font=font, fill=255)
                slots.append(("tittle", ox + tcx, oy + tcy, td, oy + stem_top_rel))
            elif ch == ".":
                slots.append(("period", ox + (pb[0] + pb[2]) / 2, base_y - period_d / 2, period_d, base_y))
            else:
                dr.text((ox, oy), ch, font=font, fill=255)
            glyphs.append((ch, ox + b[0], oy + b[1], ox + b[2], oy + b[3]))
            ox += adv
    ink = np.asarray(img, np.float32) / 255.0
    cand = [s for s in slots if s[0] == kind]
    if kind == "period":
        slot = cand[-1] if cand else None
    else:
        k = int(anchor.split(":")[1]) if ":" in anchor else len(cand) - 1
        slot = cand[k] if cand and k < len(cand) else None
    dots = []
    for s in slots:
        if s is slot:
            continue
        r = s[3] / 2
        M.disc(ink.shape, s[1], s[2], r, ink)
        dots.append((s[1], s[2], r))
    mascot_c = None
    surface = 0
    if slot is not None:
        surface = slot[4]
        if slot[0] == "period":
            # sits on the baseline; small optical gap after the previous letter
            mascot_c = (slot[1] - slot[3] / 2 + md / 2 + adv * 0.04, slot[4] - md / 2)
        else:
            # floats over the stem with the font's own tittle gap, scaled a little for the bigger dot
            gap = slot[4] - (slot[2] + slot[3] / 2)
            mascot_c = (slot[1], slot[4] - gap * 1.25 - md / 2)
    return Layout(W, H, ink, mascot_c, md, glyphs, dots, xh, baselines[0], baselines, surface)


def crop_to_content(lay: Layout, margin: float):
    """Tight canvas around ink + resting companion, with `margin` px all round. Returns (x0, y0, x1, y1)."""
    ys, xs = np.nonzero(lay.ink > 0.02)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    if lay.mascot_c:
        cx, cy = lay.mascot_c
        r = lay.mascot_d / 2
        x0, x1 = min(x0, cx - r), max(x1, cx + r)
        y0, y1 = min(y0, cy - r), max(y1, cy + r)
    return int(x0 - margin), int(y0 - margin), int(x1 + margin), int(y1 + margin)


def place(lay: Layout, shape, ox, oy, expr="neutral", mascot_c=None, sx=1.0, sy=1.0, look=(0, 0),
          extras=False, show_mascot=True):
    """Paste the layout into a canvas of `shape` with offset (ox, oy). Returns dict of masks."""
    H, W = shape
    ink = np.zeros(shape, np.float32)
    x0, y0 = max(0, ox), max(0, oy)
    x1, y1 = min(W, ox + lay.w), min(H, oy + lay.h)
    if x1 > x0 and y1 > y0:
        ink[y0:y1, x0:x1] = lay.ink[y0 - oy:y1 - oy, x0 - ox:x1 - ox]
    out = {"ink": ink, "body": np.zeros(shape, np.float32), "face": np.zeros(shape, np.float32),
           "second": np.zeros(shape, np.float32)}
    if show_mascot and lay.mascot_c:
        c = mascot_c or (lay.mascot_c[0] + ox, lay.mascot_c[1] + oy)
        m = M.render(lay.mascot_d, expr, sx=sx, sy=sy, look=look, extras=extras, cx=c[0], cy=c[1], shape=shape)
        for k in ("body", "face", "second"):
            out[k] = np.maximum(out[k], m[k])
        out["ink"] = np.maximum(out["ink"], m["ink"])
    return out
