#!/usr/bin/env python3
"""Depth maps for background plates (free, CPU): Depth Anything V2 Small, ONNX (Apache-2.0; the Base/Large models are
non-commercial and never used). One map per plate, cached as a 16-bit PNG next to the episode's art; the plate itself is
never modified (the parallax is an engine transform).

  python3 tools/depth/depth_maps.py <model.onnx> <out_dir> <plate.png> [...]
"""
import sys
from pathlib import Path
import numpy as np
import onnxruntime as ort
from PIL import Image

MEAN, STD = np.array([.485, .456, .406], np.float32), np.array([.229, .224, .225], np.float32)


def depth(sess, path, side=518):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    s = side / min(w, h)
    nw, nh = int(round(w * s / 14)) * 14, int(round(h * s / 14)) * 14
    x = (np.asarray(im.resize((nw, nh), Image.BICUBIC), np.float32) / 255 - MEAN) / STD
    d = sess.run(None, {'pixel_values': x.transpose(2, 0, 1)[None]})[0][0]
    d = (d - d.min()) / (d.max() - d.min() + 1e-6)                   # 1 = near
    return Image.fromarray((d * 65535).astype(np.uint16)).resize((w, h), Image.BICUBIC)


def main():
    sess = ort.InferenceSession(sys.argv[1], providers=['CPUExecutionProvider'])
    out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
    for p in sys.argv[3:]:
        depth(sess, p).save(out / (Path(p).stem + '_depth.png'))
        print(Path(p).stem)


if __name__ == '__main__':
    main()
