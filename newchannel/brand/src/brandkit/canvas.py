"""A print canvas: one coverage mask per ink, composited onto grained paper at the end."""
from __future__ import annotations

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from . import mascot as M
from . import printfx as P

ORDER = ("shadow", "second", "body", "face", "ink")   # print order (multiply, so order barely matters)


class Canvas:
    def __init__(self, w, h, palette, seed=1):
        self.w, self.h, self.pal, self.seed = w, h, palette, seed
        self.m = {k: np.zeros((h, w), np.float32) for k in ORDER}

    @property
    def shape(self):
        return (self.h, self.w)

    def add(self, role, mask, x=0, y=0):
        """Union a mask (full-size, or a patch placed at x, y)."""
        if mask.shape == self.shape and x == 0 and y == 0:
            np.maximum(self.m[role], mask, out=self.m[role])
            return
        h, w = mask.shape
        x0, y0, x1, y1 = max(0, x), max(0, y), min(self.w, x + w), min(self.h, y + h)
        if x1 <= x0 or y1 <= y0:
            return
        sub = mask[y0 - y:y1 - y, x0 - x:x1 - x]
        np.maximum(self.m[role][y0:y1, x0:x1], sub, out=self.m[role][y0:y1, x0:x1])

    def add_masks(self, d):
        for k, v in d.items():
            self.add(k, v)

    def rect(self, role, x0, y0, x1, y1, value=1.0):
        self.m[role][int(y0):int(y1), int(x0):int(x1)] = np.maximum(self.m[role][int(y0):int(y1), int(x0):int(x1)], value)

    def disc(self, role, cx, cy, r):
        M.disc(self.shape, cx, cy, r, self.m[role])

    def mascot(self, cx, cy, d, expr="neutral", **kw):
        self.add_masks(M.render(d, expr, cx=cx, cy=cy, shape=self.shape, **kw))

    def text(self, role, xy, s, font, anchor="la", spacing=0):
        img = Image.new("L", (self.w, self.h), 0)
        ImageDraw.Draw(img).text(xy, s, font=font, fill=255, anchor=anchor, spacing=spacing)
        self.add(role, np.asarray(img, np.float32) / 255.0)

    def render(self, paper=True, misreg=(1, 1), texture=0.07, grain=1.0):
        p = self.pal
        layers = [(self.m["shadow"], p["paper_shadow"]), (self.m["second"], p["second"]),
                  (self.m["body"], p["accent"]), (self.m["face"], p["ink"], misreg), (self.m["ink"], p["ink"])]
        if paper:
            base = P.paper(self.w, self.h, p["paper"], self.seed, grain)
            return P.to_image(P.composite(base, layers, self.seed + 5, texture))
        return Image.fromarray(P.composite_transparent(layers, self.shape, self.seed + 5, texture * 0.7), "RGBA")


def font(path, size, axes=None):
    f = ImageFont.truetype(str(path), size)
    if axes:
        f.set_variation_by_axes(axes)
    return f
