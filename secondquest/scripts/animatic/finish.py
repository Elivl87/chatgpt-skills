"""Finish pass (TEST, not applied anywhere yet): makes generated art, 3D props and drawn plates read as one world.
Idea from the World Brief analysis and ClaudeAnimationBase (MIT; our own code). Producer decides if it goes in.

  finish(frame, t, strength=1.0) -> frame
    paper grain (static per pixel, so it does not boil), soft vignette, a faint warm halftone only in the deep shadows.
"""
from functools import lru_cache
import numpy as np
from PIL import Image


@lru_cache(maxsize=4)
def _grain(w, h, seed=11):
    rng = np.random.default_rng(seed)
    g = rng.normal(0, 1, (h // 2 + 1, w // 2 + 1)).astype(np.float32)
    g = np.asarray(Image.fromarray(((g * 18) + 128).clip(0, 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) - 128
    return g


@lru_cache(maxsize=4)
def _vignette(w, h):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    return np.clip(1 - .22 * np.clip(r - .55, 0, None) ** 1.6, 0, 1)[..., None]


@lru_cache(maxsize=4)
def _dots(w, h, cell):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return (np.sin(x * np.pi / cell) * np.sin(y * np.pi / cell)) ** 2


def finish(fr, t=0.0, strength=1.0):
    a = np.asarray(fr.convert('RGB'), np.float32)
    h, w = a.shape[:2]
    a = a + _grain(w, h)[..., None] * .22 * strength                     # paper grain
    a = a * (1 - (1 - _vignette(w, h)) * strength)                        # vignette
    lum = a.mean(2, keepdims=True) / 255
    shadow = np.clip((.32 - lum) / .32, 0, 1) * strength                  # halftone only where it is dark
    dots = _dots(w, h, max(3.0, w / 320))[..., None]
    a = a * (1 - .18 * shadow * dots) + np.array([12, 6, 0], np.float32) * .25 * strength   # a hair warmer
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
