"""Python twin of src/fx/fairy.ts (the engine's fairy actor) for planning animatics. Keep the maths identical."""
import math
from PIL import Image, ImageDraw, ImageFilter

DEFAULTS = dict(size=0.1, color=(170, 225, 255), glow=0.85, flap_hz=6.4, bob=0.012, trail=8)


def path(keys, t):
    """keys: [(t, x, y)] in frame fractions. Catmull-Rom with smoothstep time between keys."""
    if t <= keys[0][0]:
        return keys[0][1:]
    if t >= keys[-1][0]:
        return keys[-1][1:]
    i = 0
    while i < len(keys) - 2 and t > keys[i + 1][0]:
        i += 1
    p0, p1, p2, p3 = keys[max(0, i - 1)], keys[i], keys[i + 1], keys[min(len(keys) - 1, i + 2)]
    k = (t - p1[0]) / max(1e-6, p2[0] - p1[0])
    u = k * k * (3 - 2 * k)
    cr = lambda a, b, c, d: 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u ** 3)
    return cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])


def at(keys, t, bob=DEFAULTS['bob']):
    x, y = path(keys, t)
    return x + 0.4 * bob * math.sin(t * 2.3), y + bob * math.sin(t * 3.7)


def flap(t, hz=DEFAULTS['flap_hz']):
    return 0.6 + 0.4 * math.sin(t * hz * 2 * math.pi)


def draw(frame, keys, t, size=DEFAULTS['size'], color=DEFAULTS['color'], glow=DEFAULTS['glow'], trail=DEFAULTS['trail'], opacity=1.0):
    """Composite the fairy on an RGB PIL frame and return it."""
    W, H = frame.size
    r = size * H
    s = r / 70
    x, y = at(keys, t)
    cx, cy = x * W, y * H
    lay = Image.new('RGBA', frame.size)
    g = ImageDraw.Draw(lay)
    for k in range(12, 0, -1):  # radial glow
        rr = r * k / 12
        g.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=color + (int(opacity * glow * (1 - k / 13) ** 1.6 * 255),))
    lay = lay.filter(ImageFilter.GaussianBlur(r / 6))
    d = ImageDraw.Draw(lay)
    for k in range(trail):
        qx, qy = at(keys, t - (k + 1) * 0.045)
        rr = (4.5 - 3 * k / trail) * s
        d.ellipse((qx * W - rr, qy * H - rr, qx * W + rr, qy * H + rr), fill=(255, 255, 255, int(opacity * 140 * (1 - k / trail))))
    f = flap(t)
    for sx in (-1, 1):
        ex, ey, rx, ry = cx + sx * 16.5 * s, cy - (3 + 13 * f) * s, 13.5 * s, (1 + 13 * f) * s
        d.ellipse((ex - rx, ey - ry, ex + rx, ey + ry), fill=(230, 245, 255, int(opacity * 120)))
        ex, ey, rx, ry = cx + sx * 16.5 * s, cy + (3 + 7 * f) * s, 5.5 * s, (1 + 7 * f) * s
        d.ellipse((ex - rx, ey - ry, ex + rx, ey + ry), fill=(230, 245, 255, int(opacity * 90)))
    d.ellipse((cx - 9 * s, cy - 9 * s, cx + 9 * s, cy + 9 * s), fill=(255, 255, 255, int(opacity * 255)))
    return Image.alpha_composite(frame.convert('RGBA'), lay).convert('RGB')
