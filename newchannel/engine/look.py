"""Print look for video frames: paper, three inks + tint, halftone, ink mottle, misregistration, live grain, vignette.

The brand's print model (brand/src/brandkit/printfx.py) composites float masks by multiply. That is exact but too
slow for 1080p video, so this module keeps the same model and does the per-frame work in 8-bit Pillow C code:

    out = (paper x vignette) x grain(frame) x  prod over plates  (1 - coverage x (1 - ink colour))

Paper (brandkit `printfx.paper`), vignette and the ink mottle (`printfx.ink_texture`) are computed once per process
and cached. Grain lives (a new crop of a pre-made noise field every 2 frames: seed = frame // 2), so it never boils
and is deterministic. Only the bounding box of each plate is composited, so sparse plates cost almost nothing.

Usage
    fr = Frame()                                  # 1920x1080, drawn at 2x supersampling
    fr.disc("ink", 400, 300, 12)                  # coordinates are always OUTPUT pixels (floats ok)
    fr.text("ink", (80, 60), "sped up x3", "label", 34)
    rgb = finish(fr, frame_index)                 # -> HxWx3 uint8

Plates (print order does not matter, all multiply):
    tint    paper_shadow flat fill (panels, road)            colour plate, misregistered
    second  teal ink (second group, trails, highlights)      colour plate, misregistered
    accent  vermilion: THE COMPANION ONLY                     colour plate, misregistered
    face    ink, the companion's face                         ink plate
    ink     ink: type, crowd, rules                           ink plate
    shade   ink halftone; the plate value is the TONE (0-255) and is screened at 15 deg (contact shadows, tone)
    shade2  second-ink halftone at 75 deg (same idea)
"""
from __future__ import annotations

import json
import math
import sys
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFont

ENGINE = Path(__file__).resolve().parent
NEWCHANNEL = ENGINE.parent
BRAND = NEWCHANNEL / "brand"
if str(BRAND / "src") not in sys.path:
    sys.path.insert(0, str(BRAND / "src"))

from brandkit import printfx as P  # noqa: E402

W, H = 1920, 1080

# ------------------------------------------------------------------------------------------------ palette, fonts

@lru_cache(maxsize=1)
def palette() -> dict:
    """Hex colours from brand/palette.json (read at run time, so a palette change needs no code change)."""
    p = json.loads((BRAND / "palette.json").read_text())
    return {k: v for k, v in p.items() if isinstance(v, str) and v.startswith("#")}


def rgb(name_or_hex) -> tuple:
    h = palette().get(name_or_hex, name_or_hex).lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


_MARTIAN = BRAND / "fonts/MartianMono/MartianMono[wdth,wght].ttf"
_GROTESK = BRAND / "fonts/SpaceGrotesk/SpaceGrotesk[wght].ttf"
FONTS = {                       # role -> (file, variable axes)   (BRAND.md section 3)
    "display": (_MARTIAN, [800, 100]),
    "display_wide": (_MARTIAN, [800, 112]),
    "label": (_MARTIAN, [500, 100]),
    "label_bold": (_MARTIAN, [700, 100]),
    "body": (_GROTESK, [500]),
    "body_bold": (_GROTESK, [700]),
}


@lru_cache(maxsize=64)
def font(role: str, size: float) -> ImageFont.FreeTypeFont:
    path, axes = FONTS[role]
    f = ImageFont.truetype(str(path), max(1, int(round(size))))
    if axes:
        f.set_variation_by_axes(axes)
    return f


# ------------------------------------------------------------------------------------------------ plates

COLOUR_PLATES = ("tint", "second", "accent")
INK_PLATES = ("face", "ink")
HALFTONE_PLATES = {"shade": ("ink", 15.0), "shade2": ("second", 75.0)}
PLATES = ("tint", "shade", "shade2", "second", "accent", "face", "ink")
PLATE_INK = {"tint": "paper_shadow", "second": "second", "accent": "accent", "face": "ink", "ink": "ink",
             "shade": "ink", "shade2": "second"}


class Frame:
    """One frame being drawn: an 8-bit coverage image per plate at `ss`x resolution.

    All public coordinates and sizes are in output pixels; the supersampling factor is hidden.
    """

    def __init__(self, w: int = W, h: int = H, ss: int = 2):
        self.w, self.h, self.ss = w, h, ss
        self._img: dict[str, Image.Image] = {}
        self._drw: dict[str, ImageDraw.ImageDraw] = {}

    # -- plate access (lazy: untouched plates cost nothing)
    def plate(self, name: str) -> Image.Image:
        if name not in self._img:
            if name not in PLATES:
                raise KeyError(f"unknown plate {name!r}; plates: {PLATES}")
            self._img[name] = Image.new("L", (self.w * self.ss, self.h * self.ss), 0)
        return self._img[name]

    def draw(self, name: str) -> ImageDraw.ImageDraw:
        if name not in self._drw:
            self._drw[name] = ImageDraw.Draw(self.plate(name))
        return self._drw[name]

    def _s(self, v):
        return v * self.ss

    # -- primitives
    def disc(self, plate, x, y, r, v=255):
        if r <= 0:
            return
        s = self.ss
        self.draw(plate).ellipse([(x - r) * s, (y - r) * s, (x + r) * s, (y + r) * s], fill=int(v))

    def ellipse(self, plate, x, y, rx, ry, v=255):
        s = self.ss
        self.draw(plate).ellipse([(x - rx) * s, (y - ry) * s, (x + rx) * s, (y + ry) * s], fill=int(v))

    def ring(self, plate, x, y, r, width, v=255):
        s = self.ss
        self.draw(plate).ellipse([(x - r) * s, (y - r) * s, (x + r) * s, (y + r) * s], outline=int(v),
                                 width=max(1, int(round(width * s))))

    def line(self, plate, pts, width, v=255, caps=True):
        """Polyline with round joints and (optionally) round caps."""
        if len(pts) < 2:
            return
        s = self.ss
        sp = [(x * s, y * s) for x, y in pts]
        wd = max(1, int(round(width * s)))
        self.draw(plate).line(sp, fill=int(v), width=wd, joint="curve")
        if caps:
            for (x, y) in (pts[0], pts[-1]):
                self.disc(plate, x, y, width / 2, v)

    def polygon(self, plate, pts, v=255):
        s = self.ss
        self.draw(plate).polygon([(x * s, y * s) for x, y in pts], fill=int(v))

    def rect(self, plate, x0, y0, x1, y1, v=255):
        s = self.ss
        self.draw(plate).rectangle([x0 * s, y0 * s, x1 * s - 1, y1 * s - 1], fill=int(v))

    def arrow(self, plate, pts, width, head=None, v=255):
        """Polyline ending in a filled triangular head (pts in output px)."""
        head = head or width * 3.2
        (x0, y0), (x1, y1) = pts[-2], pts[-1]
        L = math.hypot(x1 - x0, y1 - y0) or 1.0
        tx, ty = (x1 - x0) / L, (y1 - y0) / L
        nx, ny = -ty, tx
        base = (x1 - tx * head, y1 - ty * head)
        self.line(plate, list(pts[:-1]) + [base], width, v, caps=True)
        self.polygon(plate, [(x1 + tx * head * 0.25, y1 + ty * head * 0.25),
                             (base[0] + nx * head * 0.62, base[1] + ny * head * 0.62),
                             (base[0] - nx * head * 0.62, base[1] - ny * head * 0.62)], v)

    def text(self, plate, xy, s, role="label", size=34, anchor="la", v=255, spacing=0):
        """Draw text; returns its bbox in output px."""
        f = font(role, size * self.ss)
        x, y = xy
        d = self.draw(plate)
        d.text((x * self.ss, y * self.ss), s, font=f, fill=int(v), anchor=anchor, spacing=spacing)
        b = d.textbbox((x * self.ss, y * self.ss), s, font=f, anchor=anchor)
        return tuple(c / self.ss for c in b)

    def label(self, plate, xy, s, role="label_bold", size=30, anchor="la", v=255, pad=8,
              knock=("ink", "second", "shade", "shade2", "tint")):
        """Text on a paper knock-out (the plates under its box are cleared first), so it reads over busy art."""
        f = font(role, size * self.ss)
        x, y = xy
        b = self.draw(plate).textbbox((x * self.ss, y * self.ss), s, font=f, anchor=anchor)
        x0, y0, x1, y1 = (c / self.ss for c in b)
        if v >= 128:
            for p in knock:
                if p in self._img:
                    self.rect(p, x0 - pad, y0 - pad, x1 + pad, y1 + pad, 0)
        return self.text(plate, xy, s, role, size, anchor, v)

    def text_size(self, s, role="label", size=34):
        b = font(role, size * self.ss).getbbox(s)
        return (b[2] - b[0]) / self.ss, (b[3] - b[1]) / self.ss

    def mask(self, plate, m, x, y, scale_ss=True):
        """Union (max) a coverage patch into a plate. `m`: float array 0..1 or 'L' image, ALREADY at plate
        resolution (ss x). (x, y) = top-left in output px (may be fractional; rounded to plate pixels)."""
        if isinstance(m, np.ndarray):
            if not m.any():
                return
            m = Image.fromarray((np.clip(m, 0, 1) * 255 + 0.5).astype(np.uint8), "L")
        px, py = int(round(x * self.ss)), int(round(y * self.ss))
        img = self.plate(plate)
        W2, H2 = img.size
        x0, y0, x1, y1 = max(0, px), max(0, py), min(W2, px + m.width), min(H2, py + m.height)
        if x1 <= x0 or y1 <= y0:
            return
        sub = m.crop((x0 - px, y0 - py, x1 - px, y1 - py))
        region = img.crop((x0, y0, x1, y1))
        img.paste(ImageChops.lighter(region, sub), (x0, y0))

    def stamp(self, masks: dict, x, y):
        """Paste a dict of role masks from mascot/wordmark rendering (body/face/ink/second) at top-left (x, y)."""
        role_to_plate = {"body": "accent", "face": "face", "ink": "ink", "second": "second", "accent": "accent",
                         "tint": "tint", "shade": "shade"}
        for k, m in masks.items():
            if m is not None:
                self.mask(role_to_plate[k], m, x, y)

    def clear_rect(self, x0, y0, x1, y1, plates=None):
        """Knock out (paper) a rectangle on the given plates, e.g. behind a label."""
        for p in plates or list(self._img):
            self.rect(p, x0, y0, x1, y1, 0)


# ------------------------------------------------------------------------------------------------ cached textures

@lru_cache(maxsize=4)
def _base(w, h, seed=20261013, grain=1.0, vignette=0.075):
    """Static paper (brandkit) x vignette, as an RGB image. Brightened 1 % to pay back the mean of the live grain."""
    paper = P.paper(w, h, palette()["paper"], seed, strength=grain * 0.8)
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    vig = 1 - vignette * np.clip(r - 0.55, 0, None) ** 1.6
    out = paper * vig[..., None] * 1.012
    return Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8), "RGB")


_GRAIN_PAD = 96


@lru_cache(maxsize=2)
def _grain_field(w, h, seed=99, amount=0.028):
    """A noise field a bit bigger than the frame; each live grain frame is a different crop of it (multiply, ~1.0)."""
    rng = np.random.default_rng(seed)
    hh, ww = h + 2 * _GRAIN_PAD, w + 2 * _GRAIN_PAD
    fine = rng.standard_normal((hh, ww)).astype(np.float32)
    clump = P.value_noise(hh, ww, 2.6, rng)
    g = 1.0 - amount * np.clip(0.75 * fine + 0.45 * clump, -2.5, 2.5) - amount * 0.6
    g = np.clip(g, 0.85, 1.0)
    L = (g * 255 + 0.5).astype(np.uint8)
    return Image.fromarray(L, "L").convert("RGB")


def grain_crop(w, h, frame_index, seed=99, live=True):
    g = _grain_field(w, h, seed)
    k = frame_index // 2 if live else 0           # regenerate every 2 frames (BRAND.md section 7)
    rng = np.random.default_rng((seed * 1000003 + k) & 0xFFFFFFFF)
    ox, oy = rng.integers(0, 2 * _GRAIN_PAD, 2)
    return g.crop((int(ox), int(oy), int(ox) + w, int(oy) + h))


@lru_cache(maxsize=2)
def _ink_tex(w, h, seed=31, amount=0.07):
    """Riso mottle (brandkit ink_texture) as an L image a bit bigger than the frame; each plate takes its own crop."""
    t = P.ink_texture(h + 64, w + 64, seed, amount)
    return Image.fromarray((t * 255 + 0.5).astype(np.uint8), "L")


@lru_cache(maxsize=8)
def _screen_dist(w, h, cell, angle):
    """Distance (px) from each pixel to its halftone cell centre, for a rotated round-dot screen."""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.deg2rad(angle)
    u = (x * np.cos(a) + y * np.sin(a)) / cell
    v = (-x * np.sin(a) + y * np.cos(a)) / cell
    du, dv = u - np.round(u), v - np.round(v)
    return (np.sqrt(du * du + dv * dv) * cell).astype(np.float32)


def screen(tone_img: Image.Image, bbox, cell, angle, aa=0.8) -> Image.Image:
    """Halftone the tone image (L, 0-255 = 0-100 % tone) inside bbox. Dot area ~ tone (brandkit.halftone)."""
    x0, y0, x1, y1 = bbox
    tone = np.asarray(tone_img.crop(bbox), np.float32) / 255.0
    d = _screen_dist(tone_img.width, tone_img.height, cell, angle)[y0:y1, x0:x1]
    r = np.sqrt(tone / np.pi) * cell
    cov = np.clip((r - d) / aa + 0.5, 0, 1) * (tone > 0.004)
    return Image.fromarray((cov * 255 + 0.5).astype(np.uint8), "L")


# ------------------------------------------------------------------------------------------------ finishing

@lru_cache(maxsize=16)
def _ink_lut(hex_colour):
    """Per-band lookup table for 'multiply by this ink colour' (Image.point on RGB)."""
    c = rgb(hex_colour)
    return [int(i * c[b] / 255 + 0.5) for b in range(3) for i in range(256)]


class Look:
    """Finishing settings. Defaults follow BRAND.md sections 2 and 7."""

    def __init__(self, grain=1.0, misreg=(1, 1), texture=0.07, vignette=0.075, halftone_cell=7.0, seed=20261013,
                 live_grain=True):
        self.grain, self.misreg, self.texture = grain, misreg, texture
        self.vignette, self.cell, self.seed, self.live = vignette, halftone_cell, seed, live_grain


DEFAULT = Look()
_PLATE_OFFSETS = {"tint": (11, 7), "second": (23, 41), "accent": (5, 29), "face": (37, 13), "ink": (0, 0),
                  "shade": (17, 53), "shade2": (47, 3)}


def finish(fr: Frame, frame_index: int = 0, look: Look = DEFAULT, base: Image.Image | None = None) -> np.ndarray:
    """Print the plates onto grained paper. Returns HxWx3 uint8. `base` may replace the paper (any RGB image)."""
    w, h = fr.w, fr.h
    pal = palette()
    out = (base if base is not None else _base(w, h, look.seed, look.grain, look.vignette)).copy()
    if look.grain > 0:
        out = ImageChops.multiply(out, grain_crop(w, h, frame_index, look.seed % 997, look.live))
    tex = _ink_tex(w, h, look.seed % 101, look.texture) if look.texture > 0 else None
    plates = dict(fr._img)
    if "face" in plates:                       # same ink, same registration: print face + ink as one plate
        plates["ink"] = ImageChops.lighter(plates["ink"], plates.pop("face")) if "ink" in plates else plates.pop("face")
    for name in PLATES:
        img = plates.get(name)
        if img is None:
            continue
        m = img.reduce(fr.ss) if fr.ss > 1 else img
        bb = m.getbbox()
        if bb is None:
            continue
        if name in HALFTONE_PLATES:
            ink, ang = HALFTONE_PLATES[name]
            cov = screen(m, bb, look.cell * (1.0 if name == "shade" else 1.15), ang)
        else:
            ink = PLATE_INK[name]
            cov = m.crop(bb)
        if tex is not None:
            ox, oy = _PLATE_OFFSETS[name]
            cov = ImageChops.multiply(cov, tex.crop((bb[0] + ox, bb[1] + oy, bb[2] + ox, bb[3] + oy)))
        dx, dy = look.misreg if name in COLOUR_PLATES else (0, 0)
        x0, y0, x1, y1 = bb[0] + dx, bb[1] + dy, bb[2] + dx, bb[3] + dy
        # clip the shifted box to the frame
        cx0, cy0, cx1, cy1 = max(0, x0), max(0, y0), min(w, x1), min(h, y1)
        if cx1 <= cx0 or cy1 <= cy0:
            continue
        cov = cov.crop((cx0 - x0, cy0 - y0, cx1 - x0, cy1 - y0))
        region = out.crop((cx0, cy0, cx1, cy1))
        # multiply blend, linear in coverage: lerp(region, region x ink colour, cov)
        out.paste(Image.composite(region.point(_ink_lut(pal[ink])), region, cov), (cx0, cy0))
    return np.asarray(out)


def finish_image(fr: Frame, frame_index: int = 0, look: Look = DEFAULT) -> Image.Image:
    return Image.fromarray(finish(fr, frame_index, look))


# ------------------------------------------------------------------------------------------------ helpers

def lerp(a, b, t):
    return a + (b - a) * t


def clamp01(x):
    return 0.0 if x < 0 else 1.0 if x > 1 else x


def smooth(t):
    """smoothstep on [0, 1] (clamped)."""
    t = clamp01(t)
    return t * t * (3 - 2 * t)


def smoother(t):
    t = clamp01(t)
    return t * t * t * (t * (6 * t - 15) + 10)


def ease_out_back(t, k=1.6):
    t = clamp01(t) - 1
    return 1 + t * t * ((k + 1) * t + k)


def window(t, t0, t1, fade_in=0.25, fade_out=0.25):
    """0 -> 1 -> 0 envelope: fades in from t0, out to t1."""
    if t < t0 or t > t1:
        return 0.0
    return min(smooth((t - t0) / max(fade_in, 1e-6)), smooth((t1 - t) / max(fade_out, 1e-6)))


if __name__ == "__main__":     # benchmark: python3 look.py
    import time
    fr0 = Frame()
    for i in range(300):
        fr0.disc("ink", 100 + (i * 37) % 1700, 100 + (i * 53) % 880, 10)
    fr0.disc("accent", 960, 540, 50)
    fr0.rect("tint", 200, 200, 900, 800)
    fr0.disc("shade", 500, 500, 200, v=64)
    fr0.text("ink", (80, 60), "sped up x3", "label", 34)
    finish(fr0, 0)
    t0 = time.time()
    n = 20
    for k in range(n):
        finish(fr0, k)
    dt = (time.time() - t0) / n
    print(f"finish(): {dt * 1000:.1f} ms/frame -> {1 / dt:.1f} fps at {W}x{H} (ss=2)")
    finish_image(fr0, 0).save("/tmp/claude-0/look_test.png")
