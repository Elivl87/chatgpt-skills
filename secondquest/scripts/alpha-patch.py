"""Deterministic background-to-alpha patch (no generative content).
mode 'white'  : remove the flat light background connected to the image border.
mode 'checker': additionally remove enclosed pockets of a baked two-tone
                transparency checkerboard (holes between rails, inside handles)."""
import sys, numpy as np
from PIL import Image
from scipy import ndimage

def patch(src, dst, mode):
    a = np.asarray(Image.open(src).convert('RGBA')).copy()
    rgb = a[..., :3].astype(int); al = a[..., 3]
    light = (rgb.min(2) >= 190) & ((rgb.max(2) - rgb.min(2)) <= 22)
    lab, n = ndimage.label(light | (al < 16))
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    if mode == 'checker':
        # the two checker tones, measured on the border-connected background
        lum = rgb.mean(2)
        tones = lum[bg & (al > 200)]
        lo, hi = np.percentile(tones, 10), np.percentile(tones, 90)
        mid = (lo + hi) / 2
        for i in range(1, n + 1):
            if i in border: continue
            comp = lab == i
            if comp.sum() < 24: continue
            l = lum[comp]
            dark = (np.abs(l - lo) < 8).mean(); bright = (np.abs(l - hi) < 8).mean()
            if dark > 0.15 and bright > 0.15 and dark + bright > 0.8:
                bg |= comp
    bg = ndimage.binary_opening(bg, iterations=1) | (al < 16)
    soft = ndimage.binary_dilation(bg, iterations=1) & ~bg
    out = al.copy(); out[bg] = 0; out[soft] = np.minimum(out[soft], 128)
    a[..., 3] = out
    Image.fromarray(a).save(dst)

if __name__ == '__main__':
    patch(sys.argv[1], sys.argv[2], sys.argv[3])
