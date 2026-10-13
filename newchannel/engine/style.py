"""dotsim house style: three inks printed on paper.

Everything the channel draws goes through here so every frame looks like one riso-printed sheet:
  * each ink is a coverage layer (float32 0..1) that the drawing code fills
  * inks are overprinted with multiply (like risograph drums), each one slightly off-register
  * ink coverage gets a fine speckle (ink starvation), the paper gets fibres + mottling
  * tones are never flat greys: they become halftone dot screens (one angle per ink)

Only numpy, scipy and Pillow (BSD / HPND). Deterministic: every random field takes a seed.
"""
from __future__ import annotations

import math
import os
from dataclasses import dataclass

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "..", "brand", "fonts")

# ---------------------------------------------------------------- palette (sRGB)
PAPER = (242, 236, 223)      # "Paper"   #F2ECDF warm newsprint
CARBON = (31, 36, 51)        # "Carbon"  #1F2433 key ink: type, outlines, the crowd
TOMATO = (238, 75, 43)       # "Tomato"  #EE4B2B the companion dot, the moment it breaks
COBALT = (43, 89, 195)       # "Cobalt"  #2B59C3 the system: fields, flows, shadows
INKS = {"carbon": CARBON, "tomato": TOMATO, "cobalt": COBALT}
HEX = {"paper": "#F2ECDF", "carbon": "#1F2433", "tomato": "#EE4B2B", "cobalt": "#2B59C3"}

# screen angle per ink (degrees), as in print, so overlapping screens make rosettes, not moire
SCREEN_ANGLE = {"carbon": 45.0, "tomato": 15.0, "cobalt": 75.0}
# off-register offset per ink, in output pixels at 1920 px width (scaled to the canvas)
REGISTER = {"carbon": (0.0, 0.0), "tomato": (1.6, -1.0), "cobalt": (-1.2, 1.4)}


def font(name: str = "mono-bold", size: int = 64) -> ImageFont.FreeTypeFont:
    """Space Mono (Regular/Bold) and Space Grotesk (variable 300-700), all OFL."""
    if name.startswith("mono"):
        f = "SpaceMono-Bold.ttf" if name.endswith("bold") else "SpaceMono-Regular.ttf"
        return ImageFont.truetype(os.path.join(FONTS, f), size)
    ft = ImageFont.truetype(os.path.join(FONTS, "SpaceGrotesk[wght].ttf"), size)
    weight = {"grotesk-light": 300, "grotesk": 400, "grotesk-medium": 500, "grotesk-bold": 700}.get(name, 500)
    try:
        ft.set_variation_by_axes([weight])
    except Exception:  # pragma: no cover - FreeType without MM support
        pass
    return ft


# ---------------------------------------------------------------- canvas
@dataclass
class Sheet:
    """A printed sheet: one supersampled L-mode layer per ink, composited by `print_()`."""

    w: int
    h: int
    ss: int = 3  # supersampling for clean edges
    seed: int = 7

    def __post_init__(self):
        self.layers = {k: Image.new("L", (self.w * self.ss, self.h * self.ss), 0) for k in INKS}
        self.tones: dict[str, np.ndarray] = {}

    # drawing ------------------------------------------------------------
    def draw(self, ink: str) -> ImageDraw.ImageDraw:
        return ImageDraw.Draw(self.layers[ink])

    def S(self, v: float) -> float:
        return v * self.ss

    def circle(self, ink: str, x: float, y: float, r: float, fill: int = 255):
        s = self.ss
        self.draw(ink).ellipse([(x - r) * s, (y - r) * s, (x + r) * s, (y + r) * s], fill=fill)

    def ellipse(self, ink, box, fill=255, width=0, outline=None):
        s = self.ss
        b = [v * s for v in box]
        if width:
            self.draw(ink).ellipse(b, outline=fill if outline is None else outline, width=int(width * s))
        else:
            self.draw(ink).ellipse(b, fill=fill)

    def line(self, ink, pts, width=4, fill=255, round_caps=True):
        s = self.ss
        p = [(x * s, y * s) for x, y in pts]
        d = self.draw(ink)
        d.line(p, fill=fill, width=int(width * s), joint="curve")
        if round_caps:
            r = width * s / 2
            for x, y in (p[0], p[-1]):
                d.ellipse([x - r, y - r, x + r, y + r], fill=fill)

    def arc(self, ink, box, start, end, width=4, fill=255):
        s = self.ss
        self.draw(ink).arc([v * s for v in box], start, end, fill=fill, width=int(width * s))

    def rect(self, ink, box, fill=255, radius=0):
        s = self.ss
        b = [v * s for v in box]
        if radius:
            self.draw(ink).rounded_rectangle(b, radius=radius * s, fill=fill)
        else:
            self.draw(ink).rectangle(b, fill=fill)

    def polygon(self, ink, pts, fill=255):
        s = self.ss
        self.draw(ink).polygon([(x * s, y * s) for x, y in pts], fill=fill)

    def text(self, ink, xy, txt, fnt_name="mono-bold", size=64, anchor="la", fill=255, tracking=0.0):
        """Text in one ink. `tracking` in em units (letter-spacing)."""
        s = self.ss
        f = font(fnt_name, int(size * s))
        d = self.draw(ink)
        x, y = xy[0] * s, xy[1] * s
        if not tracking:
            d.text((x, y), txt, font=f, anchor=anchor, fill=fill)
            return
        # manual tracking (left-anchored baseline variants only)
        total = sum(f.getlength(c) for c in txt) + tracking * size * s * (len(txt) - 1)
        if anchor[0] == "m":
            x -= total / 2
        elif anchor[0] == "r":
            x -= total
        a = "l" + anchor[1]
        for c in txt:
            d.text((x, y), c, font=f, anchor=a, fill=fill)
            x += f.getlength(c) + tracking * size * s

    def text_width(self, txt, fnt_name="mono-bold", size=64, tracking=0.0):
        f = font(fnt_name, size)
        return sum(f.getlength(c) for c in txt) + tracking * size * (len(txt) - 1)

    def tone(self, ink: str, field: np.ndarray, cell: float = 9.0, angle: float | None = None):
        """Add a halftone screen of `field` (h x w, 0..1 at output resolution) to an ink."""
        a = SCREEN_ANGLE[ink] if angle is None else angle
        m = halftone(field, cell=cell, angle=a, ss=self.ss)
        cur = np.asarray(self.layers[ink], dtype=np.float32) / 255.0
        self.layers[ink] = Image.fromarray((np.maximum(cur, m) * 255).astype(np.uint8))

    # output -------------------------------------------------------------
    def print_(self, grain: float = 1.0, register: float = 1.0, paper: tuple = PAPER, paper_tex: bool = True) -> Image.Image:
        cov = {}
        for k, im in self.layers.items():
            im = im.resize((self.w, self.h), Image.LANCZOS)
            a = np.asarray(im, dtype=np.float32) / 255.0
            dx, dy = REGISTER[k]
            sc = self.w / 1920.0 * register
            if sc and (dx or dy):
                a = ndimage.shift(a, (dy * sc, dx * sc), order=1, mode="constant")
            cov[k] = a
        return composite(cov, self.w, self.h, seed=self.seed, grain=grain, paper=paper, paper_tex=paper_tex)


# ---------------------------------------------------------------- halftone
def halftone(field: np.ndarray, cell: float = 9.0, angle: float = 45.0, ss: int = 3) -> np.ndarray:
    """Classic AM screen: round dots whose area matches the tone. Returns supersampled coverage 0..1."""
    h, w = field.shape
    H, W = h * ss, w * ss
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32) / ss
    t = math.radians(angle)
    u = (xx * math.cos(t) + yy * math.sin(t)) / cell
    v = (-xx * math.sin(t) + yy * math.cos(t)) / cell
    fu, fv = u - np.floor(u) - 0.5, v - np.floor(v) - 0.5
    d = np.sqrt(fu * fu + fv * fv)  # 0 at cell centre, ~0.707 at the corner
    # tone sampled at the dot centre of each cell, so every dot is one clean circle
    cu, cv = np.floor(u) + 0.5, np.floor(v) + 0.5
    cx = (cu * math.cos(t) - cv * math.sin(t)) * cell
    cy = (cu * math.sin(t) + cv * math.cos(t)) * cell
    ix = np.clip(cx.astype(np.int32), 0, w - 1)
    iy = np.clip(cy.astype(np.int32), 0, h - 1)
    tone = np.clip(field[iy, ix], 0, 1)
    r = np.sqrt(tone / math.pi)  # dot area = tone (until dots touch)
    edge = 0.6 / (cell * ss)
    return np.clip((r - d) / edge + 0.5, 0, 1).astype(np.float32)


# ---------------------------------------------------------------- paper + composite
_paper_cache: dict = {}


def paper_texture(w: int, h: int, seed: int = 7) -> np.ndarray:
    """Multiplicative paper texture ~1.0: soft mottling, fibres, a few specks."""
    key = (w, h, seed)
    if key in _paper_cache:
        return _paper_cache[key]
    rng = np.random.default_rng(seed)
    mott = ndimage.gaussian_filter(rng.standard_normal((h, w)).astype(np.float32), sigma=w / 90)
    mott /= (np.abs(mott).max() + 1e-6)
    fib = ndimage.gaussian_filter(rng.standard_normal((h, w)).astype(np.float32), sigma=(0.6, 3.0))
    fib /= (np.abs(fib).max() + 1e-6)
    fine = rng.standard_normal((h, w)).astype(np.float32)
    tex = 1.0 + 0.022 * mott + 0.018 * fib + 0.012 * fine
    specks = rng.random((h, w)) > 0.99975
    tex[ndimage.binary_dilation(specks, iterations=1)] *= 0.86
    _paper_cache[key] = tex
    return tex


def composite(cov: dict, w: int, h: int, seed: int = 7, grain: float = 1.0, paper=PAPER, paper_tex=True) -> Image.Image:
    rng = np.random.default_rng(seed + 1)
    out = np.empty((h, w, 3), np.float32)
    out[:] = np.array(paper, np.float32) / 255.0
    if paper_tex and grain:
        out *= (1 + (paper_texture(w, h, seed)[..., None] - 1) * grain)
    for k in ("cobalt", "tomato", "carbon"):  # print order: light drums first
        if k not in cov:
            continue
        a = cov[k]
        if grain:
            # ink starvation: coverage loses a little density in a grainy pattern
            starve = ndimage.gaussian_filter(rng.random((h, w)).astype(np.float32), 0.7)
            a = a * (1 - 0.16 * grain * np.clip((starve - 0.42) * 3, 0, 1))
        ink = np.array(INKS[k], np.float32) / 255.0
        out *= (1 - a[..., None] * (1 - ink))  # multiply = overprint
    return Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8))


# ---------------------------------------------------------------- the companion: Tittle
EXPRESSIONS = ("neutral", "curious", "wow", "worried", "delighted", "deadpan")


def tittle(sheet: Sheet, x: float, y: float, r: float, expr: str = "neutral", look=(0.0, 0.0),
           squash: float = 0.0, blink: float = 0.0, face: bool = True, shadow: bool = False):
    """Draw the companion dot. look = (-1..1, -1..1) gaze; squash > 0 flattens (landing).
    shadow=True adds the printed cobalt halftone shadow (logo / hero shots)."""
    rx, ry = r * (1 + squash * 0.5), r * (1 - squash * 0.5)
    if shadow:
        yy, xx = np.mgrid[0:sheet.h, 0:sheet.w].astype(np.float32)
        d = np.hypot((xx - (x + r * 0.22)) / rx, (yy - (y + r * 0.26)) / ry)
        body = np.hypot((xx - x) / rx, (yy - y) / ry)
        f = np.clip((1.0 - d) * 5, 0, 1) * np.clip((body - 1.0) * r * 0.25, 0, 1) * 0.6
        sheet.tone("cobalt", f, cell=max(4.0, r * 0.075))
    sheet.ellipse("tomato", [x - rx, y - ry, x + rx, y + ry])
    if not face:
        return
    k = "carbon"
    lx, ly = look
    ex, ey = r * 0.30, r * 0.10      # eye offsets
    er = r * 0.115                   # eye radius
    cx, cy = x + lx * r * 0.22, y + ly * r * 0.18 - squash * r * 0.1
    if expr == "delighted":
        for sx in (-1, 1):
            sheet.arc(k, [cx + sx * ex - er * 1.5, cy - ey - er * 1.2, cx + sx * ex + er * 1.5, cy - ey + er * 1.8],
                      200, 340, width=r * 0.075)
        sheet.arc(k, [cx - r * 0.24, cy + r * 0.05, cx + r * 0.24, cy + r * 0.42], 15, 165, width=r * 0.075)
        return
    eh = er * (1 - blink)
    sizes = {"curious": (1.0, 1.45), "wow": (1.4, 1.4)}.get(expr, (1.0, 1.0))
    for i, sx in enumerate((-1, 1)):
        rr = er * sizes[i]
        hh = max(eh * sizes[i], r * 0.02)
        sheet.ellipse(k, [cx + sx * ex - rr, cy - ey - hh * 1.15, cx + sx * ex + rr, cy - ey + hh * 1.15])
    if expr == "deadpan":  # flat upper lids
        sheet.rect(k, [cx - ex - er * 2, cy - ey - er * 2.2, cx + ex + er * 2, cy - ey - er * 0.05], fill=0)
        sheet.line(k, [(cx - ex - er * 1.4, cy - ey - er * 0.05), (cx - ex + er * 1.4, cy - ey - er * 0.05)], width=r * 0.06)
        sheet.line(k, [(cx + ex - er * 1.4, cy - ey - er * 0.05), (cx + ex + er * 1.4, cy - ey - er * 0.05)], width=r * 0.06)
        sheet.line(k, [(cx - r * 0.12, cy + r * 0.30), (cx + r * 0.12, cy + r * 0.30)], width=r * 0.06)
    elif expr == "wow":
        sheet.ellipse(k, [cx - r * 0.09, cy + r * 0.16, cx + r * 0.09, cy + r * 0.40])
    elif expr == "worried":
        for sx in (-1, 1):  # brows rising to the middle
            sheet.line(k, [(cx + sx * (ex + er * 1.3), cy - ey - er * 2.0), (cx + sx * (ex - er * 1.1), cy - ey - er * 2.9)],
                       width=r * 0.06)
        sheet.arc(k, [cx - r * 0.18, cy + r * 0.24, cx + r * 0.18, cy + r * 0.50], 200, 340, width=r * 0.06)
        # sweat drop in cobalt
        dx, dy = x + r * 1.02, y - r * 0.62
        sheet.circle("cobalt", dx, dy + r * 0.06, r * 0.11)
        sheet.polygon("cobalt", [(dx - r * 0.1, dy + r * 0.04), (dx + r * 0.1, dy + r * 0.04), (dx, dy - r * 0.2)])
    elif expr == "curious":
        sheet.line(k, [(cx + ex - er * 1.4, cy - ey - er * 2.6), (cx + ex + er * 1.5, cy - ey - er * 3.0)], width=r * 0.06)
        sheet.line(k, [(cx - r * 0.06, cy + r * 0.31), (cx + r * 0.14, cy + r * 0.27)], width=r * 0.06)
    else:  # neutral: small calm smile
        sheet.arc(k, [cx - r * 0.15, cy + r * 0.08, cx + r * 0.15, cy + r * 0.34], 25, 155, width=r * 0.06)
