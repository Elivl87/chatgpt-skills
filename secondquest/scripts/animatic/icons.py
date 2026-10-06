"""Shared HUD-style icons drawn in-house (supersampled toon fill + ink outline), reused across EP002 blocks.

  camera_icon(rec=False, width=120)  classic movie camera (two reels, lens, REC light). The episode's "game camera" icon:
                                     it repeats wherever the script talks about the camera (B "A new camera.",
                                     E "camera movement", G "A camera you once fought with").
  wrench_icon(ang, alpha=1.0)        combination wrench, swings about its ring end (G "Fix it...").
"""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from lib import S, Si  # noqa: E402  (sizes are design px)


def _toon(mask, top, bottom, outline=12):
    """Supersampled toon fill: vertical metal gradient inside the mask, ink outline around it (HUD style)."""
    w, h = mask.size
    ys = np.linspace(0, 1, h)[:, None, None]
    grad = (np.array(top)[None, None] * (1 - ys) + np.array(bottom)[None, None] * ys).repeat(w, 1).astype(np.uint8)
    out = Image.new('RGBA', (w, h), (20, 14, 18, 0))
    out.putalpha(mask.filter(ImageFilter.MaxFilter(outline * 2 + 1)))
    fill = Image.fromarray(grad, 'RGB').convert('RGBA'); fill.putalpha(mask)
    return Image.alpha_composite(out, fill)


_WRENCH = None


def wrench_icon(ang, alpha=1.0):
    """A combination wrench (ring end + open end), brushed steel with an ink outline; ang swings it about the ring end."""
    global _WRENCH
    if _WRENCH is None:
        m = Image.new('L', (640, 640)); md = ImageDraw.Draw(m)
        md.polygon([(130, 276), (450, 282), (450, 318), (130, 324)], fill=255)          # tapered handle
        md.ellipse((48, 248, 152, 352), fill=255)                                       # ring end
        md.ellipse((426, 238, 550, 362), fill=255)                                      # open end
        md.polygon([(100 + 30 * math.cos(math.pi / 3 * i + math.pi / 6), 300 + 30 * math.sin(math.pi / 3 * i + math.pi / 6)) for i in range(6)], fill=0)
        md.polygon([(496, 278), (640, 246), (640, 354), (496, 322)], fill=0)             # the jaw
        md.ellipse((474, 278, 518, 322), fill=0)
        g = _toon(m, (238, 242, 250), (118, 126, 142))
        gd = ImageDraw.Draw(g)
        gd.line((150, 291, 430, 293), fill=(255, 255, 255, 230), width=7)               # brushed highlight
        gd.arc((60, 260, 140, 340), 200, 300, fill=(255, 255, 255, 200), width=7)
        gd.arc((438, 250, 538, 350), 205, 260, fill=(255, 255, 255, 200), width=7)
        _WRENCH = g.resize((Si(160), Si(160)), Image.LANCZOS)
    g = _WRENCH.rotate(ang + 24, resample=Image.BICUBIC, center=(S(25), S(75)))
    if alpha < 1:
        g.putalpha(g.getchannel('A').point(lambda v: int(v * max(0, alpha))))
    return g


_CAMERA = {}


def camera_icon(rec=False, width=120):
    """A classic movie camera: two film reels, slate body, lens hood with glass, REC light."""
    if rec not in _CAMERA:
        m = Image.new('L', (480, 360)); md = ImageDraw.Draw(m)
        md.rounded_rectangle((40, 140, 320, 320), 34, fill=255)
        md.ellipse((52, 24, 172, 144), fill=255); md.ellipse((178, 24, 298, 144), fill=255)
        md.polygon([(316, 190), (452, 130), (452, 330), (316, 272)], fill=255)
        g = _toon(m, (128, 138, 160), (52, 56, 70))
        gd = ImageDraw.Draw(g); ink = (20, 14, 18, 255)
        for cx in (112, 238):                                                           # reels: hub + three holes
            gd.ellipse((cx - 50, 34, cx + 50, 134), outline=ink, width=8)
            gd.ellipse((cx - 13, 71, cx + 13, 97), fill=(200, 206, 220, 255), outline=ink, width=6)
            for k in range(3):
                a_ = math.pi / 2 + k * 2 * math.pi / 3; hx, hy = cx + 30 * math.cos(a_), 84 + 30 * math.sin(a_)
                gd.ellipse((hx - 11, hy - 11, hx + 11, hy + 11), fill=(36, 38, 48, 255))
        gd.line((60, 160, 300, 160), fill=(190, 198, 218, 255), width=8)                # top edge light
        gd.ellipse((392, 150, 448, 310), fill=(70, 120, 190, 255), outline=ink, width=8)  # lens glass
        gd.ellipse((404, 170, 424, 214), fill=(220, 236, 255, 230))
        gd.ellipse((70, 186, 106, 222), fill=(235, 50, 50, 255) if rec else (90, 40, 44, 255), outline=ink, width=6)
        gd.rounded_rectangle((140, 200, 290, 280), 14, fill=(36, 38, 48, 255), outline=ink, width=6)   # side panel
        gd.line((158, 222, 272, 222), fill=(120, 130, 150, 255), width=6); gd.line((158, 246, 240, 246), fill=(120, 130, 150, 255), width=6)
        _CAMERA[rec] = g
    if (rec, width) not in _CAMERA:
        _CAMERA[(rec, width)] = _CAMERA[rec].resize((max(1, Si(width)), max(1, Si(width * .75))), Image.LANCZOS)   # width in design px
    return _CAMERA[(rec, width)]
