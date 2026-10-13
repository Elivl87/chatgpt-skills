"""Print look: paper, ink layers (overprint/multiply), halftone, grain, misregistration.

Everything is numpy float32 in [0, 1]. An "ink layer" is a coverage mask (0 = no ink, 1 = solid).
Inks are composited subtractively (multiply), like real riso/offset overprint, so ink on top of
vermilion goes darker instead of covering it. All randomness is seeded -> deterministic output.
"""
from __future__ import annotations

import numpy as np
from PIL import Image


def hex2rgb(h: str) -> np.ndarray:
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255.0


def _resize_f(a: np.ndarray, w: int, h: int) -> np.ndarray:
    return np.asarray(Image.fromarray(a.astype(np.float32), "F").resize((w, h), Image.BICUBIC), np.float32)


def value_noise(h: int, w: int, scale: float, rng: np.random.Generator) -> np.ndarray:
    """Smooth noise with features ~`scale` px, roughly unit variance."""
    sh, sw = max(2, int(h / scale) + 2), max(2, int(w / scale) + 2)
    n = rng.standard_normal((sh, sw)).astype(np.float32)
    up = _resize_f(n, int(sw * scale), int(sh * scale))[:h, :w]
    if up.shape != (h, w):  # pad if rounding left us short
        up = np.pad(up, ((0, h - up.shape[0]), (0, w - up.shape[1])), mode="edge")
    s = up.std() or 1.0
    return (up - up.mean()) / s


def paper(w: int, h: int, color: str, seed: int = 7, strength: float = 1.0) -> np.ndarray:
    """Uncoated paper: base colour + fine tooth + soft cloudiness + horizontal fibres + rare flecks."""
    rng = np.random.default_rng(seed)
    base = np.ones((h, w, 3), np.float32) * hex2rgb(color)
    fine = rng.standard_normal((h, w)).astype(np.float32)
    cloud = value_noise(h, w, max(w, h) / 6, rng)
    mid = value_noise(h, w, 18, rng)
    fib = _resize_f(rng.standard_normal((h, max(2, w // 30))).astype(np.float32), w, h)
    lum = 1.0 + strength * (0.011 * fine + 0.005 * cloud + 0.006 * mid + 0.008 * fib)
    flecks = (rng.random((h, w)) > 0.99985).astype(np.float32)
    lum -= strength * 0.10 * flecks
    return np.clip(base * lum[..., None], 0, 1)


def ink_texture(h: int, w: int, seed: int, amount: float = 0.07) -> np.ndarray:
    """Riso-like mottle inside solid ink: coverage multiplier in [1-amount, 1]."""
    rng = np.random.default_rng(seed)
    t = 0.55 * value_noise(h, w, 2.2, rng) + 0.45 * value_noise(h, w, 9, rng)
    t = (t - t.min()) / (np.ptp(t) + 1e-6)
    return 1.0 - amount * t


def shift(mask: np.ndarray, dx: int, dy: int) -> np.ndarray:
    if dx == 0 and dy == 0:
        return mask
    out = np.zeros_like(mask)
    h, w = mask.shape
    ys, yd = (slice(0, h - dy), slice(dy, h)) if dy >= 0 else (slice(-dy, h), slice(0, h + dy))
    xs, xd = (slice(0, w - dx), slice(dx, w)) if dx >= 0 else (slice(-dx, w), slice(0, w + dx))
    out[yd, xd] = mask[ys, xs]
    return out


def composite(base_rgb: np.ndarray, layers, seed: int = 11, texture: float = 0.07) -> np.ndarray:
    """layers: list of (mask, hex_color[, (dx, dy)]) composited by multiply in order."""
    out = base_rgb.copy()
    h, w = out.shape[:2]
    for i, layer in enumerate(layers):
        mask, color = layer[0], layer[1]
        off = layer[2] if len(layer) > 2 else (0, 0)
        if mask is None or not mask.any():
            continue
        a = shift(mask, *off)
        if texture > 0:
            a = a * ink_texture(h, w, seed + 31 * i, texture)
        c = hex2rgb(color)
        out *= 1.0 - a[..., None] * (1.0 - c)
    return out


def composite_transparent(layers, shape, seed: int = 11, texture: float = 0.05):
    """Same multiply model over transparent: returns RGBA uint8 (straight alpha)."""
    h, w = shape
    white = np.ones((h, w, 3), np.float32)
    rgb = composite(white, layers, seed, texture)
    keep = np.ones((h, w), np.float32)
    for i, layer in enumerate(layers):
        mask = layer[0]
        if mask is None:
            continue
        off = layer[2] if len(layer) > 2 else (0, 0)
        keep *= 1.0 - shift(mask, *off)
    alpha = 1.0 - keep
    a = np.maximum(alpha, 1e-4)[..., None]
    col = np.clip((rgb - (1 - alpha)[..., None]) / a, 0, 1)
    rgba = np.dstack([col, alpha])
    return (rgba * 255 + 0.5).astype(np.uint8)


def halftone(tone: np.ndarray, cell: float = 8.0, angle: float = 15.0, aa: float = 0.8) -> np.ndarray:
    """Amplitude-modulated round-dot halftone of a tone map (0..1). Dot area ~ tone."""
    h, w = tone.shape
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.deg2rad(angle)
    u = (x * np.cos(a) + y * np.sin(a)) / cell
    v = (-x * np.sin(a) + y * np.cos(a)) / cell
    du, dv = u - np.round(u), v - np.round(v)
    d = np.sqrt(du * du + dv * dv) * cell
    r = np.sqrt(np.clip(tone, 0, 1) / np.pi) * cell
    return np.clip((r - d) / aa + 0.5, 0, 1) * (tone > 0.002)


def to_image(rgb: np.ndarray) -> Image.Image:
    return Image.fromarray((np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8), "RGB")


def save_png(img: Image.Image, path, colors: int | None = None):
    """Optionally quantise (few inks + grain survive a 256-colour palette well) to keep files small."""
    if colors:
        img = img.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    img.save(path, optimize=True)
