#!/usr/bin/env python3
"""Prop renderer v1: procedural 3D props (tools/props3d/scene.ts) -> 2D cut-outs in the house cartoon style.

  python3 tools/props3d/render.py n64_room       # named jobs below
  python3 tools/props3d/render.py --all

Free and local: three.js in headless Chromium (SwiftShader, CPU). Each shot renders three passes
(toon colour, normals, part ids); ink outlines are drawn where the silhouette, the part or the surface
orientation changes, so the result sits next to the generated 2D art. Output: RGBA PNG cut-outs.
Any angle and any cartridge position can be rendered, so an insert shot can follow the real geometry.
"""
import base64, json, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
OUT = ROOT / 'public/art/ep002/props3d'
INK = (34, 24, 22)          # warm near-black, like the plates' line art
SS = 2                      # supersampling: render at 2x, downscale for clean edges
MAX_PX = 19e6               # largest WebGL drawing buffer Chromium/SwiftShader keeps at full size
VARIANT = 'classic'       # approved console look; 'faithful' = closer to the real hardware
SEAT = 73 - 22           # cartridge bottom when seated: about 70% stays out, the label stays readable


def bundle():
    js = HERE / '.build/scene.js'
    js.parent.mkdir(exist_ok=True)
    src = HERE / 'scene.ts'
    if not js.exists() or js.stat().st_mtime < src.stat().st_mtime:
        subprocess.run([str(ROOT / 'node_modules/.bin/esbuild'), str(src), '--bundle', '--format=iife', '--minify', f'--outfile={js}'],
                       check=True, capture_output=True)
    return js.read_text()


def cart_outline():
    a = cv2.imread(str(ROOT / 'docs/ep002/source/cartridge_mock_front.png'), cv2.IMREAD_UNCHANGED)[..., 3]
    c, _ = cv2.findContours((a > 128).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = cv2.approxPolyDP(max(c, key=cv2.contourArea), 1.5, True)[:, 0]
    return c[::-1].tolist()  # counter-clockwise in y-up space


def render_raw(params, w, h, n):
    js = bundle()
    tex = 'data:image/png;base64,' + base64.b64encode((ROOT / 'docs/ep002/source/cartridge_mock_front.png').read_bytes()).decode()
    params = {'variant': VARIANT, **params, 'width': w, 'height': h, 'cartTexture': tex, 'cartOutline': cart_outline()}
    with tempfile.TemporaryDirectory() as td:
        html = Path(td) / 'p.html'
        html.write_text('<html><body style="margin:0;background:transparent">'
                        f'<script>window.PARAMS={json.dumps(params)}</script><script>{js}</script></body></html>')
        png = Path(td) / 'o.png'
        subprocess.run([CHROME, '--headless=new', '--no-sandbox', '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
                        '--default-background-color=00000000', f'--window-size={w * n},{h * 3 + 240}', '--virtual-time-budget=20000',
                        f'--screenshot={png}', f'file://{html}'], check=True, capture_output=True, timeout=300)
        img = cv2.imread(str(png), cv2.IMREAD_UNCHANGED)
    return img


def ink(color, normal, ident, scale, despeckle=0):
    """Outline = silhouette + part boundaries + creases (normal changes), thickness scaled to output size.
    despeckle > 0 drops isolated edge specks smaller than that many pixels (sub-pixel slivers between layered parts
    that would otherwise become ink dots after dilation)."""
    alpha = color[..., 3]
    sil = alpha > 8
    edges = np.zeros(sil.shape, np.uint8)
    edges |= cv2.Canny(sil.astype(np.uint8) * 255, 50, 150)
    idg = ident[..., :3].astype(np.int32)
    idk = (idg[..., 0] * 65536 + idg[..., 1] * 256 + idg[..., 2])
    diff = (np.abs(np.diff(idk, axis=0, prepend=idk[:1])) > 0) | (np.abs(np.diff(idk, axis=1, prepend=idk[:, :1])) > 0)
    edges |= (diff & sil).astype(np.uint8) * 255
    nrm = normal[..., :3].astype(np.float32) / 127.5 - 1
    dn = np.maximum(np.linalg.norm(np.diff(nrm, axis=0, prepend=nrm[:1]), axis=2), np.linalg.norm(np.diff(nrm, axis=1, prepend=nrm[:, :1]), axis=2))
    edges |= ((dn > 0.55) & sil).astype(np.uint8) * 255
    if despeckle:
        n, lab, st, _ = cv2.connectedComponentsWithStats((edges > 0).astype(np.uint8), connectivity=8)
        edges[(st[lab, cv2.CC_STAT_AREA] < despeckle) & (lab > 0)] = 0
    k = max(1, int(round(scale)))
    edges = cv2.dilate(edges, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * k + 1, 2 * k + 1)))
    out = color.copy()
    m = edges > 0
    out[m, 0], out[m, 1], out[m, 2] = INK[2], INK[1], INK[0]  # BGR
    out[m, 3] = np.maximum(out[m, 3], 255)
    return out


def render(params, w, h, line=3.0, despeckle=0):
    """Returns one RGBA (BGRA) image per shot at w x h."""
    n = len(params['shots'])
    # Chromium silently shrinks a WebGL drawing buffer above ~20 Mpx (passes then bleed into each other):
    # lower the supersampling to fit instead of failing
    ss = min(SS, (MAX_PX / (w * h * 3 * n)) ** 0.5, 8192 / (w * n), (8192 - 240) / (h * 3))   # 240: the window margin in render_raw
    assert ss >= 1, 'canvas too large for the WebGL buffer: render fewer shots per page'
    W2, H2 = int(w * ss), int(h * ss)
    raw = render_raw(params, W2, H2, n)
    shots = []
    for i in range(n):
        col = raw[:, i * W2:(i + 1) * W2]
        c, nm, idp = (col[k * H2:(k + 1) * H2] for k in range(3))
        if params.get('exposure'):  # light-coloured props read too bright under the toon ramp in a night room
            c = c.copy(); c[..., :3] = (c[..., :3].astype(np.float32) * params['exposure']).astype(np.uint8)
        o = ink(c, nm, idp, line * ss / 2, despeckle) if line > 0 else c   # line 0: no ink (boss shadow)
        shots.append(cv2.resize(o, (w, h), interpolation=cv2.INTER_AREA))
    return shots


def crop_alpha(img, pad=6):
    ys, xs = np.where(img[..., 3] > 8)
    y0, y1, x0, x1 = max(0, ys.min() - pad), ys.max() + pad, max(0, xs.min() - pad), xs.max() + pad
    return img[y0:y1, x0:x1]


# --------------------------------------------------------------- jobs
def orbit(yaw_deg, elev_deg, dist, target=(0, 35, 0)):
    y, e = np.radians(yaw_deg), np.radians(elev_deg)
    return [target[0] + dist * np.cos(e) * np.sin(y), target[1] + dist * np.sin(e), target[2] + dist * np.cos(e) * np.cos(y)]


def job_n64_room():
    """The console on the rug of core.bg.living_room_night_gaming: seen from the sofa side, above."""
    OUT.mkdir(parents=True, exist_ok=True)
    shot = {'camera': orbit(42, 30, 900), 'target': [0, 35, 0], 'fov': 26, 'cart': None}  # front faces the sofa (left), like the TV
    img = crop_alpha(render({'props': ['n64', 'cartridge'], 'shots': [shot]}, 1200, 800, line=3.0)[0])
    cv2.imwrite(str(OUT / 'n64_room_3q.png'), img)
    shot['cart'] = {'y': SEAT}
    img = crop_alpha(render({'props': ['n64', 'cartridge'], 'shots': [shot]}, 1200, 800, line=3.0)[0])
    cv2.imwrite(str(OUT / 'n64_room_3q_cart_in.png'), img)
    print('n64_room_3q.png, n64_room_3q_cart_in.png')


def job_n64_insert(frames=32, size=(1280, 720), name='n64_insert'):
    """Insert shot: front-above close-up of the slot; the cartridge goes down and seats (frames 0..N-1)."""
    out = OUT / name
    out.mkdir(parents=True, exist_ok=True)
    seat, start = SEAT, SEAT + 120
    cam = {'camera': orbit(-14, 36, 840, (0, 92, -18)), 'target': [0, 92, -18], 'fov': 30}   # wider: cartridge start and console fully in frame (Producer)
    ys = [start + (seat - start) * (0.5 - 0.5 * np.cos(np.pi * k / (frames - 1))) for k in range(frames)]
    batches = [[y] for y in ys]  # one shot per page: big multi-shot canvases exceed the WebGL buffer limit and mix tiles

    def run(b):
        return render({'props': ['n64', 'cartridge'], 'shots': [{**cam, 'cart': {'y': y}} for y in b]}, *size, line=3.0 * size[1] / 720)

    with ThreadPoolExecutor(4) as ex:
        imgs = [im for res in ex.map(run, batches) for im in res]
    for k, im in enumerate(imgs):
        cv2.imwrite(str(out / f'f{k:03d}.png'), im)
    (out / 'frames.json').write_text(json.dumps({'cartY': ys, 'seatY': seat, 'size': list(size)}, indent=1))
    print(f'{name}: {frames} frames at {size[0]}x{size[1]}')


def job_n64_turntable():
    """Review sheets: 6 angles, neutral light, one per variant."""
    global VARIANT
    keep = VARIANT
    for VARIANT in ('classic', 'faithful'):
        turntable(f'docs/ep002/n64_turntable_{VARIANT}.jpg')
    VARIANT = keep


def turntable(path):
    shots = [{'camera': orbit(a, e, 900), 'target': [0, 35, 0], 'fov': 26, 'cart': {'y': SEAT} if k % 2 else None}
             for k, (a, e) in enumerate([(0, 25), (-48, 30), (-90, 20), (180, 30), (45, 60), (0, 85)])]
    imgs = render({'props': ['n64', 'cartridge'], 'shots': shots, 'light': 'neutral'}, 640, 440)
    sheet = np.full((880, 1920, 4), 255, np.uint8)
    for k, im in enumerate(imgs):
        a = im[..., 3:] / 255.0
        y, x = 440 * (k // 3), 640 * (k % 3)
        sheet[y:y + 440, x:x + 640, :3] = (im[..., :3] * a + sheet[y:y + 440, x:x + 640, :3] * (1 - a)).astype(np.uint8)
    p = ROOT / path
    cv2.imwrite(str(p), sheet[..., :3], [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(p.relative_to(ROOT))


def job_n64_pad():
    """The controller: review turntable (neutral light) + the room view, lit like the console."""
    OUT.mkdir(parents=True, exist_ok=True)
    shots = [{'camera': orbit(a, e, 620, (0, 12, -20)), 'target': [0, 12, -20], 'fov': 26, 'cart': None}
             for a, e in [(0, 60), (30, 35), (-35, 35), (180, 40), (0, 88), (90, 20)]]
    imgs = render({'props': ['pad'], 'shots': shots, 'light': 'neutral'}, 640, 440)
    sheet = np.full((880, 1920, 4), 255, np.uint8)
    for k, im in enumerate(imgs):
        a = im[..., 3:] / 255.0
        y, x = 440 * (k // 3), 640 * (k % 3)
        sheet[y:y + 440, x:x + 640, :3] = (im[..., :3] * a + sheet[y:y + 440, x:x + 640, :3] * (1 - a)).astype(np.uint8)
    cv2.imwrite(str(ROOT / 'docs/ep002/n64_pad_turntable.jpg'), sheet[..., :3], [cv2.IMWRITE_JPEG_QUALITY, 88])
    img = crop_alpha(render({'props': ['pad'], 'exposure': 0.62, 'shots': [{'camera': orbit(-35, 40, 700, (0, 12, -20)), 'target': [0, 12, -20], 'fov': 26, 'cart': None}]}, 1000, 800)[0])
    cv2.imwrite(str(OUT / 'n64_pad_room.png'), img)
    print('docs/ep002/n64_pad_turntable.jpg, n64_pad_room.png')


# n64_insert_hd: 2304x1296 = the engine's minimum background size (1080p x 1.2)
def job_triforce():
    """Golden triangles: review sheet (6 angles) + a front cut-out for the animatic/engine."""
    OUT.mkdir(parents=True, exist_ok=True)
    tgt = [0, 87, 0]
    shots = [{'camera': orbit(a, e, 620, tgt), 'target': tgt, 'fov': 28, 'cart': None} for a, e in [(0, 0), (25, 10), (-35, 15), (60, 5), (0, 40), (150, 10)]]
    imgs = render({'props': ['triforce'], 'shots': shots, 'light': 'neutral'}, 640, 440)
    sheet = np.full((880, 1920, 4), 255, np.uint8)
    for k, im in enumerate(imgs):
        a = im[..., 3:] / 255.0
        y, x = 440 * (k // 3), 640 * (k % 3)
        sheet[y:y + 440, x:x + 640, :3] = (im[..., :3] * a + sheet[y:y + 440, x:x + 640, :3] * (1 - a)).astype(np.uint8)
    cv2.imwrite(str(ROOT / 'docs/ep002/triforce_turntable.jpg'), sheet[..., :3], [cv2.IMWRITE_JPEG_QUALITY, 88])
    img = crop_alpha(render({'props': ['triforce'], 'shots': [{'camera': orbit(0, 0, 620, tgt), 'target': tgt, 'fov': 28, 'cart': None}], 'light': 'neutral'}, 1400, 1400, line=3.5)[0])
    cv2.imwrite(str(OUT / 'triforce_front.png'), img)
    print('docs/ep002/triforce_turntable.jpg, triforce_front.png')


def relic_spin(prop, target, dist, name, frames=24, sweep=70, elev=18):
    """A slow turn of one relic (frames for the animatic) + a review sheet."""
    out = OUT / name
    out.mkdir(parents=True, exist_ok=True)
    yaws = [-sweep / 2 + sweep * k / (frames - 1) for k in range(frames)]
    def run(y):
        return render({'props': [prop], 'shots': [{'camera': orbit(y, elev, dist, target), 'target': target, 'fov': 26, 'cart': None}], 'light': 'neutral'}, 1000, 1000, line=3.2)[0]
    with ThreadPoolExecutor(4) as ex:
        imgs = list(ex.map(run, yaws))
    for k, y in enumerate(yaws):                                          # a cold browser can hand back an empty frame
        for _ in range(3):
            if imgs[k][..., 3].any():
                break
            imgs[k] = run(y)
        assert imgs[k][..., 3].any(), f'{name} frame {k} rendered empty'
    for k, im in enumerate(imgs):
        cv2.imwrite(str(out / f'f{k:03d}.png'), im)
    sheet = np.full((500, 1500, 3), 255, np.uint8)
    for i, k in enumerate((0, frames // 2, frames - 1)):
        im = cv2.resize(imgs[k], (500, 500)); a = im[..., 3:] / 255.0
        sheet[:, i * 500:(i + 1) * 500] = (im[..., :3] * a + 255 * (1 - a)).astype(np.uint8)
    cv2.imwrite(str(ROOT / f'docs/ep002/{name}_sheet.jpg'), sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(f'{name}: {frames} frames + docs/ep002/{name}_sheet.jpg')


def job_ocarina_ref():
    """Front view of the ocarina next to the Producer's reference, for approval before any spin is rendered."""
    tgt = [0, 10, 0]
    ref = cv2.imread(str(ROOT / 'docs/ep002/source/ocarina_reference_producer.jpg'))
    views = [(0, 0), (-30, 10), (30, 10)]
    shots = [{'camera': orbit(y, e, 900, tgt), 'target': tgt, 'fov': 17, 'cart': None} for y, e in views]
    imgs = render({'props': ['ocarina'], 'shots': shots, 'light': 'neutral'}, 900, 900, line=3.2)
    tiles = [cv2.resize(ref, (int(ref.shape[1] * 500 / ref.shape[0]), 500))]
    for im in imgs:
        im = crop_alpha(im, 20); k = 460 / max(im.shape[:2]); im = cv2.resize(im, (int(im.shape[1] * k), int(im.shape[0] * k)))
        a = im[..., 3:] / 255.0; t = np.full((500, max(500, im.shape[1] + 40), 3), 255, np.uint8)
        y0, x0 = (500 - im.shape[0]) // 2, (t.shape[1] - im.shape[1]) // 2
        t[y0:y0 + im.shape[0], x0:x0 + im.shape[1]] = (im[..., :3] * a + t[y0:y0 + im.shape[0], x0:x0 + im.shape[1]] * (1 - a)).astype(np.uint8)
        tiles.append(t)
    cv2.imwrite(str(ROOT / 'docs/ep002/ocarina_vs_reference.jpg'), np.hstack(tiles), [cv2.IMWRITE_JPEG_QUALITY, 90])
    print('docs/ep002/ocarina_vs_reference.jpg')


def job_crt():
    """The bedroom CRT at 3/4 (screen turned towards frame left, where the kids sit) + a front view; screen = #00ff00 key."""
    tgt = [0, 230, -120]
    shots = [{'camera': orbit(38, 12, 2300, tgt), 'target': tgt, 'fov': 22, 'cart': None},
             {'camera': orbit(0, 4, 2300, tgt), 'target': tgt, 'fov': 22, 'cart': None}]
    for name, sh in zip(('crt_34', 'crt_front'), shots):
        img = crop_alpha(render({'props': ['crt'], 'shots': [sh], 'light': 'neutral'}, 1600, 1600, line=3.4)[0], 8)
        cv2.imwrite(str(OUT / f'{name}.png'), img)
    print('crt_34.png, crt_front.png')


def job_cart_spin():
    """The approved cartridge, slowly turning (block C opener)."""
    out = OUT / 'cart_spin'; out.mkdir(parents=True, exist_ok=True)
    tgt = [0, 40, 0]
    yaws = [-18 + 36 * k / 23 for k in range(24)]
    shots = [{'camera': orbit(y, 6, 700, tgt), 'target': tgt, 'fov': 24, 'cart': {'y': 0}} for y in yaws]
    imgs = []
    for i in range(0, 24, 4):
        imgs += render({'props': ['cartridge'], 'shots': shots[i:i + 4], 'light': 'neutral'}, 900, 900, line=3.0)
    for k, im in enumerate(imgs):
        cv2.imwrite(str(out / f'f{k:03d}.png'), im)
    print('cart_spin: 24 frames')


def job_n64_34():
    """The approved classic N64 at 3/4 for the childhood bedroom (same turn as the CRT, seen from a little higher)."""
    tgt = [0, 35, 0]
    sh = {'camera': orbit(38, 22, 1500, tgt), 'target': tgt, 'fov': 18, 'cart': {'y': SEAT}}       # cartridge in: they are playing
    img = crop_alpha(render({'props': ['n64', 'cartridge'], 'shots': [sh], 'light': 'neutral'}, 1400, 1400, line=3.2)[0], 8)
    cv2.imwrite(str(OUT / 'n64_34.png'), img)
    print('n64_34.png')


def job_castle():
    """Hyrule Castle review sheet (3/4 + front, close) and the far view from the field for the animatic (transparent)."""
    tgt = [0, 300, -300]
    shots = [{'camera': orbit(28, 14, 5200, tgt), 'target': tgt, 'fov': 26, 'cart': None},
             {'camera': orbit(0, 6, 5200, tgt), 'target': tgt, 'fov': 26, 'cart': None}]
    imgs = render({'props': ['castle'], 'shots': shots, 'light': 'neutral'}, 1400, 900, line=2.6)
    sheet = np.full((900, 2800, 3), 235, np.uint8)
    for i, im in enumerate(imgs):
        a = im[..., 3:] / 255.0
        sheet[:, i * 1400:(i + 1) * 1400] = (im[..., :3] * a + 235 * (1 - a)).astype(np.uint8)
    cv2.imwrite(str(ROOT / 'docs/ep002/castle_sheet.jpg'), sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])
    far = {'camera': orbit(0, 2.5, 9000, [0, 350, -300]), 'target': [0, 350, -300], 'fov': 24, 'cart': None}
    img = crop_alpha(render({'props': ['castle'], 'shots': [far], 'light': 'neutral'}, 1800, 1000, line=2.2)[0], 4)
    cv2.imwrite(str(OUT / 'castle_far.png'), img)
    print('docs/ep002/castle_sheet.jpg, castle_far.png')


def job_hud_items():
    """HUD item icons (transparent): bomb and boomerang, three-quarter front."""
    for name, tgt, dist in (('bomb', [0, 15, 0], 420), ('boomerang', [0, -10, 0], 520)):
        sh = {'camera': orbit(-15, 15, dist, tgt), 'target': tgt, 'fov': 26, 'cart': None}
        img = crop_alpha(render({'props': [name], 'shots': [sh], 'light': 'neutral'}, 700, 700, line=3.0)[0], 6)
        cv2.imwrite(str(OUT / f'icon_{name}.png'), img)
    print('icon_bomb.png, icon_boomerang.png')


def job_pad_profile():
    """The N64 controller seen from the side (prongs left, cable right), for Quest's hands in his profile pose (Q008)."""
    sh = {'camera': orbit(90, 24, 620, (0, 12, -20)), 'target': [0, 12, -20], 'fov': 26, 'cart': None}
    img = crop_alpha(render({'props': ['pad'], 'shots': [sh], 'light': 'neutral'}, 1000, 700, line=2.6)[0])
    cv2.imwrite(str(OUT / 'n64_pad_profile.png'), img)
    print('n64_pad_profile.png', img.shape)


def job_switch2():
    """Switch 2-like handheld lying flat, seen like n64_pad_room (3/4 from above); screen = #00ff00 key. + review sheet."""
    tgt = [0, 8, 0]
    shots = [{'camera': orbit(a, e, 900, tgt), 'target': tgt, 'fov': 26, 'cart': None} for a, e in [(-18, 52), (0, 60), (0, 88)]]
    imgs = render({'props': ['switch2'], 'shots': shots, 'light': 'neutral'}, 900, 620, line=2.6)
    cv2.imwrite(str(OUT / 'switch2_room.png'), crop_alpha(imgs[0]))
    sheet = np.full((620, 2700, 3), 255, np.uint8)
    for k, im in enumerate(imgs):
        a = im[..., 3:] / 255.0
        sheet[:, 900 * k:900 * (k + 1)] = (im[..., :3] * a + 255 * (1 - a)).astype(np.uint8)
    cv2.imwrite(str(ROOT / 'docs/ep002/switch2_turntable.jpg'), sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])
    print('switch2_room.png, docs/ep002/switch2_turntable.jpg')


def job_switch2_hd():
    """The handheld at 2K-ready size for block O's close shot (same angle as switch2_room.png, 2.4x the pixels)."""
    tgt = [0, 8, 0]
    imgs = render({'props': ['switch2'], 'shots': [{'camera': orbit(-18, 52, 900, tgt), 'target': tgt, 'fov': 26, 'cart': None}],
                   'light': 'neutral'}, 2160, 1488, line=6.2)
    cv2.imwrite(str(OUT / 'switch2_room_hd.png'), crop_alpha(imgs[0], pad=14))
    print('switch2_room_hd.png')


def job_desk_items():
    """Block O's table (Producer, 2026-10-07): phone, coffee mug, headphones and a game box, seen at the handheld's angle."""
    for name, tgt, dist in (('phone', [0, 4, 0], 520), ('mug', [0, 45, 0], 560), ('headphones', [0, 14, 0], 760), ('gamebox', [0, 6, 0], 600)):
        img = render({'props': [name], 'shots': [{'camera': orbit(-18, 52, dist, tgt), 'target': tgt, 'fov': 26, 'cart': None}],
                      'light': 'neutral'}, 1200, 1000, line=4.0)[0]
        cv2.imwrite(str(OUT / f'desk_{name}.png'), crop_alpha(img, pad=10))
        print(f'desk_{name}.png')


def job_horse_rear():
    """The same horse seen from behind (3/4 rear, a little above): it gallops away from camera, towards the castle."""
    out = OUT / 'horse_rear'; out.mkdir(parents=True, exist_ok=True)
    tgt = [0, 1250, 0]
    shots = [{'camera': orbit(-68, 12, 9000, tgt), 'target': tgt, 'fov': 22, 'cart': None, 'pose': i / 8} for i in range(8)]
    imgs = render({'props': ['horse'], 'shots': shots[:4], 'light': 'neutral'}, 900, 900, line=2.6) + render({'props': ['horse'], 'shots': shots[4:], 'light': 'neutral'}, 900, 900, line=2.6)
    a = np.max([im[..., 3] for im in imgs], axis=0)
    ys, xs = np.where(a > 8); y0, y1, x0, x1 = max(0, ys.min() - 6), ys.max() + 6, max(0, xs.min() - 6), xs.max() + 6
    for i, im in enumerate(imgs):
        cv2.imwrite(str(out / f'f{i:03d}.png'), im[y0:y1, x0:x1])
    cv2.imwrite(str(ROOT / 'docs/ep002/props3d_horse_rear_sheet.png'), np.concatenate([im[y0:y1, x0:x1] for im in imgs[:4]], axis=1))
    print('horse_rear', len(imgs))


def job_horse():
    """Quest's own horse (animatic stand-in): 8-frame gallop, side-on from a little in front, daylight. Frames share one
    crop so the horse does not jitter."""
    out = OUT / 'horse_gallop'; out.mkdir(parents=True, exist_ok=True)
    tgt = [100, 1250, 0]
    shots = [{'camera': orbit(18, 6, 9000, tgt), 'target': tgt, 'fov': 22, 'cart': None, 'pose': i / 8} for i in range(8)]
    imgs = render({'props': ['horse'], 'shots': shots, 'light': 'neutral'}, 1000, 760, line=2.6)
    a = np.max([im[..., 3] for im in imgs], axis=0)
    ys, xs = np.where(a > 8); y0, y1, x0, x1 = max(0, ys.min() - 6), ys.max() + 6, max(0, xs.min() - 6), xs.max() + 6
    for i, im in enumerate(imgs):
        cv2.imwrite(str(out / f'f{i:03d}.png'), im[y0:y1, x0:x1])
    sheet = np.concatenate([im[y0:y1, x0:x1] for im in imgs[:4]], axis=1)
    cv2.imwrite(str(ROOT / 'docs/ep002/props3d_horse_sheet.png'), sheet)
    print('horse_gallop', len(imgs))


def job_shield():
    """Hero shield from the Producer's reference: review sheet (front + angles) and a front cut-out for the engine."""
    layers = json.loads((HERE / 'shield_layers.json').read_text())
    tgt = [0, 0, 0]
    angles = [(0, 0), (-30, 8), (35, 10), (0, 35)]
    imgs = render({'props': ['shield'], 'shield': layers, 'light': 'neutral',
                   'shots': [{'camera': orbit(a, e, 2600, tgt), 'target': tgt, 'fov': 20, 'cart': None} for a, e in angles]}, 900, 900, line=2.4)
    cv2.imwrite(str(ROOT / 'docs/ep002/props3d_shield_sheet.png'), np.concatenate(imgs, axis=1))
    img = crop_alpha(render({'props': ['shield'], 'shield': layers, 'light': 'neutral',
                             'shots': [{'camera': orbit(0, 0, 2600, tgt), 'target': tgt, 'fov': 20, 'cart': None}]}, 1800, 1800, line=3.2)[0])
    OUT.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(OUT / 'shield_front.png'), img)
    print('docs/ep002/props3d_shield_sheet.png, shield_front.png', img.shape)


def job_sword_check():
    """Sword v2 review: front, both 3/4 sides and edge-on, beside the Producer's reference (upright)."""
    tgt = [0, 103, 0]
    imgs = render({'props': ['sword'], 'light': 'neutral',
                   'shots': [{'camera': orbit(a, e, 1500, tgt), 'target': tgt, 'fov': 22, 'cart': None} for a, e in [(0, 0), (-35, 12), (40, 10), (90, 0)]]}, 700, 900, line=2.6)
    cv2.imwrite(str(ROOT / 'docs/ep002/props3d_sword_v2_sheet.png'), np.concatenate(imgs, axis=1))
    print('docs/ep002/props3d_sword_v2_sheet.png')


def job_back_sword():
    """Sword v2 in its scabbard, upright (hilt up, front on), for adult Quest's back: public/art/ep002/props3d/back_sword.png."""
    tgt = [0, 100, 0]
    img = render({'props': ['sword', 'scabbard'], 'light': 'neutral',
                  'shots': [{'camera': orbit(0, 0, 2200, tgt), 'target': tgt, 'fov': 16, 'cart': None}]}, 900, 1400, line=3.0)[0]
    img = crop_alpha(cv2.rotate(img, cv2.ROTATE_180), 2)                 # the sword model points its blade up: turn it hilt up
    cv2.imwrite(str(OUT / 'back_sword.png'), img)
    print('back_sword.png', img.shape)



OUT3 = ROOT / 'public/art/ep003/props3d'


# EP003 props v2 (2026-10-12): name -> (prop, target, camera, fov, canvas w, h, line). Larger canvases than v1 so the
# cut-outs stay sharp at 1440p; the line width follows the canvas so the ink keeps the same weight on screen.
EP3 = {
    'rowboat_34': ('rowboat', [-14, 26, 14], orbit(-35, 24, 470, [-14, 26, 14]), 30, 1900, 1150, 5.0),
    'rowboat_side': ('rowboat', [-5, 32, 0], orbit(0, 8, 440, [-5, 32, 0]), 30, 1900, 900, 5.0),
    'rod': ('fishingRod', [3, 107, 0], orbit(-20, 8, 470, [3, 107, 0]), 30, 900, 1900, 3.6),
    'fish_side': ('fish', [0, 0, 0], orbit(0, 4, 190, [0, 0, 0]), 30, 1400, 1000, 4.0),
    'fish_34': ('fish', [4, 0, 0], orbit(35, 10, 190, [4, 0, 0]), 30, 1400, 1000, 4.0),
    'trashcan': ('trashcan', [0, 43, 0], orbit(-25, 14, 300, [0, 43, 0]), 28, 1300, 1400, 4.4),
    'dynamite': ('dynamite', [2, 15, 2], orbit(-25, 18, 92, [2, 15, 2]), 28, 1100, 1300, 4.4),
    'chips': ('chips', [0, 2, -1], orbit(-20, 42, 48, [0, 2, -1]), 30, 1500, 1100, 3.6),
    'golf_flag': ('golfFlag', [10, 106, 0], orbit(-15, 6, 470, [10, 106, 0]), 30, 900, 1900, 3.8),
    'lantern': ('lantern', [0, 15, 0], orbit(-20, 14, 82, [0, 15, 0]), 30, 1000, 1300, 4.2),
}


def ep3_render(name, **shot):
    prop, tgt, cam, fov, w, h, line = EP3[name]
    d = float(np.linalg.norm(np.subtract(cam, tgt)))                    # depth range around the prop: thin layered parts
    shot = {'near': d * .3, 'far': d * 3, **EP3_SHOT.get(name, {}), **shot}   # (planks, laps, ribs) need the precision
    for _ in range(3):                                                  # a cold browser can hand back an empty frame
        img = render({'props': prop if isinstance(prop, list) else [prop], 'shots': [{'camera': cam, 'target': tgt, 'fov': fov, 'cart': None, **shot}],
                      'light': 'neutral'}, w, h, line=line, despeckle=14)[0]
        if img[..., 3].any() and not img[[0, -1]][:, [0, -1], 3].all():   # neither empty nor an opaque (failed) page
            return img
    raise RuntimeError(f'{name} rendered empty')


# EP003 game-world props (2026-10-12): our toy-like redraws of the game's ideas (docs/ep003/GAME_VISUAL_REFERENCE.md §6/7).
EP3.update({
    'sniper_gold_34': ('sniperGold', [-3, 1, 0], orbit(35, 14, 175, [-3, 1, 0]), 30, 1900, 1000, 4.4),
    'sniper_gold_side': ('sniperGold', [-4, 0, 0], orbit(0, 2, 155, [-4, 0, 0]), 30, 1900, 800, 4.4),
    'roulette_34': ('roulette', [0, 5, 0], orbit(-20, 40, 185, [0, 5, 0]), 30, 1600, 1200, 4.0),
    'roulette_top': ('roulette', [0, 6, 0], orbit(0, 89.9, 180, [0, 6, 0]), 30, 1600, 1600, 4.0),
    'roulette_top_ball': ('roulette', [0, 6, 0], orbit(0, 89.9, 180, [0, 6, 0]), 30, 1600, 1600, 4.0),
    'shop_board_front': ('shopBoard', [0, 18, 0], orbit(0, 3, 235, [0, 18, 0]), 30, 1750, 1400, 4.2),
    'shop_board_34': ('shopBoard', [0, 18, 0], orbit(-28, 10, 235, [0, 18, 0]), 30, 1750, 1400, 4.2),
    'dynamite_lit': ('dynamiteLit', [5, 18, 2], orbit(-25, 18, 112, [5, 18, 2]), 28, 1200, 1300, 4.4),
    'blast_puff': ('blastPuff', [0, 17, 0], orbit(-15, 10, 200, [0, 17, 0]), 30, 1400, 1400, 4.6),
    'boss_shadow': ('bossShadow', [-70, 0, 0], orbit(0, 89.9, 980, [-70, 0, 0]), 30, 2000, 1200, 0),
    'lighthouse_side': ('lighthouse', [0, 76, 0], orbit(0, 3, 410, [0, 76, 0]), 30, 1200, 1600, 4.0),
    'lighthouse_34': ('lighthouse', [0, 76, 0], orbit(-30, 12, 410, [0, 76, 0]), 30, 1200, 1600, 4.0),
    'toy_pistol_side': ('toyPistol', [1, 0, 0], orbit(0, 2, 58, [1, 0, 0]), 30, 1400, 1100, 4.2),
    'toy_pistol_34': ('toyPistol', [1, 0, 0], orbit(35, 14, 62, [1, 0, 0]), 30, 1400, 1100, 4.2),
    'toy_smg_side': ('toySmg', [-1, -2, 0], orbit(0, 2, 70, [-1, -2, 0]), 30, 1700, 1000, 4.2),
    'toy_smg_34': ('toySmg', [-1, -2, 0], orbit(35, 14, 76, [-1, -2, 0]), 30, 1700, 1000, 4.2),
    'toy_shotgun_side': ('toyShotgun', [2, -2, 0], orbit(0, 2, 74, [2, -2, 0]), 30, 2000, 700, 4.2),
    'toy_shotgun_34': ('toyShotgun', [2, -2, 0], orbit(35, 14, 100, [2, -2, 0]), 30, 2000, 900, 4.2),
    'slot_machine_34': ('slotMachine', [2, 53, 0], orbit(30, 10, 240, [2, 53, 0]), 30, 1300, 1700, 4.2),
    'slot_machine_front': ('slotMachine', [2, 53, 0], orbit(0, 4, 240, [2, 53, 0]), 30, 1300, 1700, 4.2),
    'fp_hands_pov': ('fpHands', [0, -6, -100], [0, 0, 0], 60, 1920, 1080, 4.0),
    'kettle_grill': ('kettleGrill', [0, 60, 0], orbit(-25, 14, 265, [0, 60, 0]), 30, 1100, 1500, 4.2),
    'seagull_34': ('seagull', [0, 2, 0], orbit(30, 25, 175, [0, 2, 0]), 30, 1600, 1100, 4.0),
    'seagull_front': ('seagull', [0, 2, 0], orbit(70, -12, 175, [0, 2, 0]), 30, 1600, 1100, 4.0),
    'hotdog_lure': ('hotdogLure', [1.5, 5, 0], orbit(-25, 16, 60, [1.5, 5, 0]), 30, 1000, 1300, 4.0),
    'outboard_side': ('outboard', [0, -10, 0], orbit(0, 4, 200, [0, -10, 0]), 30, 1100, 1500, 4.2),
    'outboard_34': ('outboard', [0, -10, 0], orbit(-35, 14, 200, [0, -10, 0]), 30, 1100, 1500, 4.2),
    'rowboat_motor_34': (['rowboat', 'outboardOnBoat'], [-30, 22, 14], orbit(-35, 24, 520, [-30, 22, 14]), 30, 1900, 1150, 5.0),
})
FP_RIGHT, FP_LEFT = list(range(2030, 2040)), list(range(2040, 2050))
EP3_SHOT = {'roulette_top': {'hide': [1785]}, 'fp_hands_pov': {'near': 1, 'far': 600}}
GAMEWORLD = [n for n in EP3 if n.split('_')[0] in ('sniper', 'roulette', 'shop', 'blast', 'boss', 'lighthouse', 'toy', 'slot', 'fp',
                                                     'kettle', 'seagull', 'hotdog', 'outboard') or n in ('dynamite_lit', 'rowboat_motor_34')]


def centred_square(img, pad=8):
    """Crop a square centred on the canvas centre (the wheel's axis), so the cut-out can spin about its middle."""
    h, w = img.shape[:2]
    ys, xs = np.where(img[..., 3] > 8)
    r = int(max(abs(xs - w / 2).max(), abs(ys - h / 2).max())) + pad
    return img[max(0, h // 2 - r):h // 2 + r, max(0, w // 2 - r):w // 2 + r]


def eye_glow(img):
    """Boss shadow: red glow round the unlit eyes, plus a soft-edged copy for under-water compositing."""
    b, gch, r, a = (img[..., k].astype(np.float32) for k in range(4))
    eyes = ((r > 190) & (gch < 150) & (a > 0)).astype(np.float32)
    glow = cv2.GaussianBlur(eyes, (0, 0), 18) * 1.6 + cv2.GaussianBlur(eyes, (0, 0), 6)
    glow = np.clip(glow, 0, 1)
    out = img.astype(np.float32)
    col = np.array([40, 50, 255], np.float32)                                  # BGR warm red
    k = glow[..., None] * (1 - eyes[..., None])
    out[..., :3] = out[..., :3] * (1 - k * .8) + col * k * .8
    out[..., 3] = np.maximum(out[..., 3], glow * 255)
    sharp = out.clip(0, 255).astype(np.uint8)
    soft = sharp.copy()
    body = cv2.GaussianBlur(img[..., 3].astype(np.float32), (0, 0), 10)
    soft[..., 3] = np.maximum(np.minimum(body, img[..., 3]) * .999, glow * 255).clip(0, 255).astype(np.uint8)
    soft[..., 3] = np.maximum(soft[..., 3], (eyes * 255).astype(np.uint8))
    return sharp, soft


def alpha_box(img, pad=10):
    ys, xs = np.where(img[..., 3] > 8)
    return max(0, ys.min() - pad), ys.max() + pad, max(0, xs.min() - pad), xs.max() + pad


def job_ep003_props(only=None):
    """EP003 (How to Fish): our own generic props, neutral light, cut-outs for the animatic (free 3D, Producer rule).
    The rowboat side view also comes as two layers for characters seated INSIDE it, same camera and the same crop box
    as rowboat_side.png, so they overlay pixel for pixel: rowboat_side_back.png (far side + interior: under the people)
    and rowboat_side_front.png (near hull side, rail, oarlock and oar: over the people).
    EP3_ONLY=rod,chips limits the run to some names (rowboat_side includes its two layers)."""
    import os
    OUT3.mkdir(parents=True, exist_ok=True)
    only = only or [n for n in os.environ.get('EP3_ONLY', '').split(',') if n] or [n for n in EP3 if not n.startswith('fish') and n not in GAMEWORLD]
    for name in only:
        img = ep3_render(name)
        if name == 'rowboat_side':
            y0, y1, x0, x1 = alpha_box(img)
            for suffix, layer in (('', img), ('_back', ep3_render(name, boat='back')), ('_front', ep3_render(name, boat='front'))):
                cv2.imwrite(str(OUT3 / f'{name}{suffix}.png'), layer[y0:y1, x0:x1])
                print(f'{name}{suffix}.png', layer[y0:y1, x0:x1].shape)
        elif name.startswith('roulette_top'):
            cv2.imwrite(str(OUT3 / f'{name}.png'), centred_square(img)); print(f'{name}.png (centred square: spins about its middle)')
        elif name == 'boss_shadow':
            sharp, soft = eye_glow(img)
            y0, y1, x0, x1 = alpha_box(sharp, 30)
            cv2.imwrite(str(OUT3 / 'boss_shadow.png'), sharp[y0:y1, x0:x1]); cv2.imwrite(str(OUT3 / 'boss_shadow_soft.png'), soft[y0:y1, x0:x1])
            print('boss_shadow.png, boss_shadow_soft.png')
        elif name == 'fp_hands_pov':                                       # full 1920x1080 frame, both hands + one layer per hand
            cv2.imwrite(str(OUT3 / f'{name}.png'), img)
            cv2.imwrite(str(OUT3 / f'{name}_right.png'), ep3_render(name, hide=FP_LEFT))
            cv2.imwrite(str(OUT3 / f'{name}_left.png'), ep3_render(name, hide=FP_RIGHT))
            print(f'{name}.png (+ _right, _left), full frame')
        else:
            cv2.imwrite(str(OUT3 / f'{name}.png'), crop_alpha(img, pad=10))
            print(f'{name}.png')


def job_ep003_props_sheet():
    """Before/after review sheet docs/ep003/props3d_v2_sheet.jpg: v1 cut-outs (PROPS_V1_DIR) above the v2 ones, and the
    rowboat layers (back, front, back + a stand-in figure + front) to check the sandwich."""
    import os
    old = Path(os.environ['PROPS_V1_DIR'])
    names = ['rowboat_34', 'rowboat_side', 'rod', 'trashcan', 'dynamite', 'chips', 'golf_flag', 'lantern']
    T, BG = 420, 236

    def tile(im, w=T, h=T, label=None):
        t = np.full((h, w, 3), BG, np.uint8)
        if im is not None:
            k = min((w - 30) / im.shape[1], (h - 50) / im.shape[0]); im = cv2.resize(im, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
            a = im[..., 3:] / 255.0; y, x = (h - 20 - im.shape[0]) // 2 + 4, (w - im.shape[1]) // 2
            t[y:y + im.shape[0], x:x + im.shape[1]] = (im[..., :3] * a + t[y:y + im.shape[0], x:x + im.shape[1]] * (1 - a)).astype(np.uint8)
        if label:
            cv2.putText(t, label, (10, h - 12), cv2.FONT_HERSHEY_SIMPLEX, .55, (60, 60, 60), 1, cv2.LINE_AA)
        return t
    rd = lambda p: cv2.imread(str(p), cv2.IMREAD_UNCHANGED)
    rows = [np.hstack([tile(rd(old / f'{n}.png'), label=f'v1 {n}') for n in names]),
            np.hstack([tile(rd(OUT3 / f'{n}.png'), label=f'v2 {n}') for n in names])]
    back, front = rd(OUT3 / 'rowboat_side_back.png'), rd(OUT3 / 'rowboat_side_front.png')
    sand = back.copy()
    fig = np.zeros_like(back); h, w = fig.shape[:2]                       # stand-in seated figures (grey capsules)
    for cx in (.3, .5, .68):
        cv2.ellipse(fig, (int(w * cx), int(h * .22)), (int(w * .035), int(h * .4)), 0, 0, 360, (150, 120, 200, 255), -1)
    for lay in (fig, front):
        a = lay[..., 3:] / 255.0
        sand[..., :3] = (lay[..., :3] * a + sand[..., :3] * (1 - a)).astype(np.uint8); sand[..., 3] = np.maximum(sand[..., 3], lay[..., 3])
    W3 = T * len(names) // 3
    rows.append(np.hstack([tile(back, W3, 520, 'rowboat_side_back'), tile(front, W3, 520, 'rowboat_side_front'),
                           tile(sand, T * len(names) - 2 * W3, 520, 'back + figures + front')]))
    out = ROOT / 'docs/ep003/props3d_v2_sheet.jpg'
    cv2.imwrite(str(out), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(out.relative_to(ROOT))


def job_ep003_gameworld():
    """EP003 game-world props (sniper, roulette, shop board, lit dynamite, blast, boss shadow, lighthouse, toy guns, slot
    machine, first-person hands, grill, seagull, hot-dog lure, outboard): cut-outs in public/art/ep003/props3d/.
    EP3_ONLY=roulette_top,boss_shadow limits the run."""
    import os
    only = [n for n in os.environ.get('EP3_ONLY', '').split(',') if n] or GAMEWORLD
    job_ep003_props(only)


def job_ep003_gameworld_sheet():
    """Review sheet docs/ep003/props3d_gameworld_sheet.jpg: every game-world cut-out on a light tile, labelled, plus a
    small-size row (how the silhouettes read at thumbnail scale)."""
    T, BG, COLS = 380, 236, 8
    extra = {'boss_shadow': ['boss_shadow_soft'], 'fp_hands_pov': ['fp_hands_pov_right', 'fp_hands_pov_left'], 'roulette_top': []}
    names = [m for n in GAMEWORLD for m in [n] + extra.get(n, [])]
    def tile(im, label, w=T, h=T, bg=BG):
        t = np.full((h, w, 3), bg, np.uint8)
        k = min((w - 24) / im.shape[1], (h - 44) / im.shape[0]); im = cv2.resize(im, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
        a = im[..., 3:] / 255.0; y, x = (h - 18 - im.shape[0]) // 2 + 2, (w - im.shape[1]) // 2
        t[y:y + im.shape[0], x:x + im.shape[1]] = (im[..., :3] * a + t[y:y + im.shape[0], x:x + im.shape[1]] * (1 - a)).astype(np.uint8)
        cv2.putText(t, label, (8, h - 10), cv2.FONT_HERSHEY_SIMPLEX, .45, (60, 60, 60), 1, cv2.LINE_AA)
        return t
    rd = lambda n: cv2.imread(str(OUT3 / f'{n}.png'), cv2.IMREAD_UNCHANGED)
    tiles = [tile(rd(n), n, bg=(150, 120, 70) if n.startswith('boss') else BG) for n in names]   # boss shadow on a sea-blue tile
    while len(tiles) % COLS: tiles.append(np.full((T, T, 3), BG, np.uint8))
    rows = [np.hstack(tiles[i:i + COLS]) for i in range(0, len(tiles), COLS)]
    small = [tile(rd(n), '', 96, 96) for n in GAMEWORLD if not n.startswith('fp_hands_pov')]
    strip = np.hstack(small); strip = np.hstack([strip, np.full((96, T * COLS - strip.shape[1], 3), BG, np.uint8)]) if strip.shape[1] < T * COLS else strip[:, :T * COLS]
    out = ROOT / 'docs/ep003/props3d_gameworld_sheet.jpg'
    cv2.imwrite(str(out), np.vstack(rows + [strip]), [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(out.relative_to(ROOT))


FISH_EXPR = {'deadpan': {}, 'blink': {'lid': 1}, 'wide': {'lid': .04, 'look': [.3, 0], 'mouth': 'o'},
             'lookup': {'lid': .3, 'look': [1, 0]}, 'yawn': {'lid': .7, 'mouth': 'o'}, 'sweat': {'lid': .36, 'look': [0, -.6], 'sweat': True},
             'wince': {'lid': .85, 'mouth': 'flat'}}


def job_fish2():
    """Companion fish v2 (Producer: "me encanta esa cara… mejorarlo aún más"): 3/4 and side cut-outs for every
    expression in public/art/ep003/props3d/fish2_<view>_<expr>.png, plus a review sheet beside v1."""
    OUT3.mkdir(parents=True, exist_ok=True)
    views = {'34': ([4, 0, 0], orbit(35, 10, 200, [4, 0, 0])), 'side': ([2, 0, 0], orbit(0, 4, 200, [2, 0, 0]))}
    sheet = []
    for v, (tgt, cam) in views.items():
        shots = [{'camera': cam, 'target': tgt, 'fov': 30, 'cart': None, 'fish': e} for e in FISH_EXPR.values()]
        imgs = render({'props': ['fish2'], 'shots': shots, 'light': 'neutral'}, 1000, 760, line=4.0)
        for name, img in zip(FISH_EXPR, imgs):
            cv2.imwrite(str(OUT3 / f'fish2_{v}_{name}.png'), crop_alpha(img, pad=10))
        sheet.append(np.concatenate(imgs, axis=1))
    old = render({'props': ['fish'], 'shots': [{'camera': orbit(35, 10, 190, [4, 0, 0]), 'target': [4, 0, 0], 'fov': 30, 'cart': None}], 'light': 'neutral'}, 1000, 760, line=4.0)[0]
    top = np.concatenate([old] + [np.zeros_like(old)] * (len(FISH_EXPR) - 1), axis=1)
    full = np.concatenate([top] + sheet, axis=0)
    bg = np.full(full.shape[:2] + (3,), 236, np.uint8)
    a = full[..., 3:4] / 255.0
    cv2.imwrite(str(ROOT / 'docs/ep003/fish2_sheet.jpg'), cv2.resize((full[..., :3] * a + bg * (1 - a)).astype(np.uint8), None, fx=.35, fy=.35))
    print('docs/ep003/fish2_sheet.jpg', list(FISH_EXPR))


# EP003 friends Max and Leo (2026-10-13): our own "worm people" (docs/ep003/characters/FRIENDS_MAX_LEO.md).
FRIENDS = {'max': ('friendMax', 180), 'leo': ('friendLeo', 158)}        # prop, approx. standing height (cm)
FRIEND_EXPRS = ['neutral', 'laugh', 'shock', 'sideeye', 'sweat']
FRIEND_VIEWS = {'34': (30, 6), 'front': (0, 4), 'side': (90, 4), 'back': (180, 6)}


def friend_span(who, pose):
    """Height in cm covered by the canvas (h px) for this pose: px per cm = h / span."""
    return FRIENDS[who][1] * {'sit': 1.06, 'sitflat': 1.06, 'cheer': 1.38}.get(pose, 1.12)


def friend_render(who, view='34', expr='neutral', pose='stand', w=None, h=1500, line=4.4):
    """One friend, one view/expression/pose, transparent RGBA at w x h (the figure fills ~88 % of the height)."""
    prop, tall = FRIENDS[who]
    yaw, elev = FRIEND_VIEWS[view]
    if pose == 'sitflat':
        elev += 12                                                      # legs out: see the lap from a little above
    w = w or (1700 if pose == 'point' else 1500 if pose == 'sitflat' else 1150 if pose in ('cheer', 'phone') else 1000)   # room for reaching arms / legs
    sit = pose in ('sit', 'sitflat')
    ty = tall * (.16 if sit else .62 if pose == 'cheer' else .5)       # seated: the seat is y = 0
    span = friend_span(who, pose)
    fov = 26
    d = span / 2 / np.tan(np.radians(fov / 2))
    tgt = [0, ty, 12 if sit else 0]
    shot = {'camera': orbit(yaw, elev, d, tgt), 'target': tgt, 'fov': fov, 'cart': None, 'near': d * .3, 'far': d * 3,
            who: {'expr': expr, 'pose': pose}}
    for _ in range(3):
        img = render({'props': [prop], 'shots': [shot], 'light': 'neutral'}, w, h, line=line, despeckle=34)[0]   # 34: drops crease ticks at bent elbows/knees
        if img[..., 3].any() and not img[[0, -1]][:, [0, -1], 3].all():
            if img[:, [0, -1], 3].any() or img[[0, -1], :, 3].any():
                print(f'WARNING {who} {view} {expr} {pose}: the figure touches the canvas edge (cropped)')
            return img
    raise RuntimeError(f'{who} {view} {expr} {pose} rendered empty')


FRIEND_POSES = {'sit': [('34', e) for e in FRIEND_EXPRS] + [('front', 'neutral'), ('side', 'neutral'), ('side', 'laugh')],
                'point': [('34', 'neutral'), ('front', 'neutral')], 'cheer': [('34', 'laugh'), ('front', 'laugh')],
                'phone': [('34', 'neutral'), ('front', 'neutral')]}


def friend_jobs():
    """(file name, who, view, expr, pose) for every friends cut-out."""
    out = []
    for who in FRIENDS:
        out += [(f'{who}_{v}_{e}', who, v, e, 'stand') for v in ('34', 'front') for e in FRIEND_EXPRS]
        out += [(f'{who}_side_neutral', who, 'side', 'neutral', 'stand')]
        out += [(f'{who}_{p}_{v}_{e}', who, v, e, p) for p, ve in FRIEND_POSES.items() for v, e in ve]
    return out


def job_friends():
    """EP003 friends Max (purple) and Leo (yellow): transparent cut-outs in public/art/ep003/props3d/:
    <who>_<34|front|side>_<expr>.png standing, <who>_<pose>_<view>_<expr>.png for sit / point / cheer / phone.
    Seated cut-outs: the seat (bottom of the thighs) is the model's y = 0, for the rowboat thwarts.
    FRIENDS_ONLY=max_34_laugh,leo_sit_34_neutral limits the run."""
    import os, time
    OUT3.mkdir(parents=True, exist_ok=True)
    only = [n for n in os.environ.get('FRIENDS_ONLY', '').split(',') if n]
    jobs = [j for j in friend_jobs() if not only or j[0] in only]
    t0 = time.time()

    def run(j):
        name, who, view, expr, pose = j
        cv2.imwrite(str(OUT3 / f'{name}.png'), crop_alpha(friend_render(who, view, expr, pose), pad=10))
        return name
    with ThreadPoolExecutor(4) as ex:
        for n in ex.map(run, jobs):
            print(f'{n}.png')
    print(f'{len(jobs)} cut-outs in {time.time() - t0:.0f} s')


def job_friends_sheet():
    """Design sheet docs/ep003/characters/FRIENDS_MAX_LEO_v1.jpg from the friends cut-outs: turnaround (front, 3/4, side),
    the expression row, the pose row, and a scale line-up beside our 2D Quest and Pixie (Max ~1.08x Quest, Leo ~0.95x)."""
    BG, INKC = (238, 236, 232), (40, 34, 30)
    rd = lambda p: cv2.imread(str(p), cv2.IMREAD_UNCHANGED)
    fr = lambda n: rd(OUT3 / f'{n}.png')

    def paste(canvas, im, x, y, h=None, w=None, k=None):
        """Alpha-paste im (scaled by k, or fitted into a h tall and/or w wide box), bottom-centred at (x, y)."""
        k = k or min(h / im.shape[0] if h else 9e9, w / im.shape[1] if w else 9e9)
        im = cv2.resize(im, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
        ih, iw = im.shape[:2]; x0, y0 = int(x - iw / 2), int(y - ih)
        a = im[..., 3:] / 255.0
        reg = canvas[y0:y0 + ih, x0:x0 + iw]
        canvas[y0:y0 + ih, x0:x0 + iw] = (im[..., :3] * a + reg * (1 - a)).astype(np.uint8)
        return ih

    def text(c, s, x, y, sc=1.0, th=2, col=INKC):
        cv2.putText(c, s, (x, y), cv2.FONT_HERSHEY_DUPLEX, sc, col, th, cv2.LINE_AA)

    W = 3000
    PXCM, PXP = 4.1, 3.4                                                  # sheet px per cm: turnaround, poses
    rows = []
    # 1 turnaround
    r = np.full((1000, W, 3), BG, np.uint8)
    text(r, 'MAX & LEO  v1  -  EP003 friends (our 3D, toon + ink)', 40, 70, 1.6, 3)
    text(r, 'turnaround: front / 3-4 / side', 40, 120, .9, 1)
    for k, (who, col) in enumerate((('max', (184, 88, 113)), ('leo', (40, 150, 214)))):
        x0 = 150 + k * 1450
        text(r, who.upper(), x0 - 60, 190, 1.4, 3, col)
        for i, v in enumerate(('front', '34', 'side')):
            paste(r, fr(f'{who}_{v}_neutral'), x0 + 160 + i * 420, 960, k=PXCM * friend_span(who, 'stand') / 1500)
    rows.append(r)
    # 2 expressions (head and shoulders of the 3/4 cut-outs)
    r = np.full((520, W, 3), BG, np.uint8)
    text(r, 'expressions: neutral / laugh / shock / side-eye / sweat', 40, 50, .9, 1)
    for k, who in enumerate(('max', 'leo')):
        for i, e in enumerate(FRIEND_EXPRS):
            im = fr(f'{who}_34_{e}'); im = im[:int(im.shape[0] * (.36 if who == 'max' else .38))]
            paste(r, im, 150 + k * 1450 + i * 280, 470, h=400, w=260)
            text(r, e, 150 + k * 1450 + i * 280 - 50, 510, .7, 1)
    rows.append(r)
    # 3 poses
    r = np.full((760, W, 3), BG, np.uint8)
    text(r, 'poses: stand / sit (seat = y 0) / point / cheer / hold-phone', 40, 50, .9, 1)
    for k, who in enumerate(('max', 'leo')):
        names = [('stand', f'{who}_34_neutral'), ('sit', f'{who}_sit_34_neutral'), ('point', f'{who}_point_34_neutral'), ('cheer', f'{who}_cheer_34_laugh'), ('phone', f'{who}_phone_34_neutral')]
        for i, (p, n) in enumerate(names):                                # one scale for every pose (px per cm)
            paste(r, fr(n), 150 + k * 1450 + i * 285, 720, k=PXP * friend_span(who, p) / 1500)
    rows.append(r)
    # 4 scale line-up beside the 2D cast
    r = np.full((900, W, 3), BG, np.uint8)
    text(r, 'scale line-up: Quest (2D) = 1.00, Max ~1.08, Leo ~0.95, Pixie (2D)', 40, 50, .9, 1)
    q = rd(ROOT / 'docs/art_orders/quest/library_v2/results/01_wave_happy.png')
    p = rd(ROOT / 'tools/hyperframes_ep003/blockB/assets/pixie_wave.png')
    q, p = crop_alpha(q, 0), crop_alpha(p, 0)
    HQ = 700; base = 860
    k = HQ / q.shape[0]
    xs = [700, 1150, 1600, 2050]
    paste(r, q, xs[0], base, h=HQ)
    paste(r, crop_alpha(fr('max_front_neutral'), 0), xs[1], base, h=int(HQ * 1.08))
    paste(r, crop_alpha(fr('leo_front_neutral'), 0), xs[2], base, h=int(HQ * .95))
    paste(r, p, xs[3], base, h=int(p.shape[0] * k))
    for f in (1.0, 1.08, .95):
        y = int(base - HQ * f); cv2.line(r, (450, y), (2300, y), (170, 165, 160), 1, cv2.LINE_AA)
        text(r, f'{f:.2f}', 380, y + 8, .6, 1)
    cv2.line(r, (450, base), (2300, base), (120, 115, 110), 2)
    for x, s in zip(xs, ('Quest', 'Max', 'Leo', 'Pixie')):
        text(r, s, x - 40, base + 32, .8, 1)
    rows.append(r)
    out = ROOT / 'docs/ep003/characters/FRIENDS_MAX_LEO_v1.jpg'
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(out.relative_to(ROOT))


# ---- friends extras (Producer, 2026-10-13): lip-flap + blink frames, legs-flat sit, layers inside the rowboat.
# New files only; the v1 cut-outs and jobs above are unchanged.
FRIEND_FRAMES = ['m0', 'm1', 'm2', 'blink']                              # mouth closed / mid / open, eyes closed


def friend_talk_jobs():
    """(file, who, view, expr, pose): <base>_<m0|m1|m2|blink>.png for the standing 3/4 + front faces, the seated 3/4 faces,
    seated front neutral and legs-flat 3/4 neutral + laugh. <base> is the v1 cut-out name the frame belongs to."""
    out = []
    for who in FRIENDS:
        bases = [(f'{who}_{v}_{e}', v, e, 'stand') for v in ('34', 'front') for e in FRIEND_EXPRS]
        bases += [(f'{who}_sit_34_{e}', '34', e, 'sit') for e in FRIEND_EXPRS] + [(f'{who}_sit_front_neutral', 'front', 'neutral', 'sit')]
        bases += [(f'{who}_sitflat_34_{e}', '34', e, 'sitflat') for e in ('neutral', 'laugh')]
        out += [(f'{b}_{fr}', who, v, f'{e}+{fr}', p) for b, v, e, p in bases for fr in FRIEND_FRAMES]
    return out


def friend_sitflat_jobs():
    return [(f'{who}_sitflat_{v}_{e}', who, v, e, 'sitflat') for who in FRIENDS
            for v, e in [('34', x) for x in FRIEND_EXPRS] + [('front', 'neutral'), ('side', 'neutral'), ('side', 'laugh')]]


def run_friend_jobs(jobs, label):
    import os, time
    OUT3.mkdir(parents=True, exist_ok=True)
    only = [n for n in os.environ.get('FRIENDS_ONLY', '').split(',') if n]
    jobs = [j for j in jobs if not only or j[0] in only]
    t0 = time.time()

    def run(j):
        name, who, view, expr, pose = j
        cv2.imwrite(str(OUT3 / f'{name}.png'), crop_alpha(friend_render(who, view, expr, pose), pad=10))
        return name
    with ThreadPoolExecutor(4) as ex:
        for n in ex.map(run, jobs):
            print(f'{n}.png')
    print(f'{label}: {len(jobs)} cut-outs in {time.time() - t0:.0f} s')


def job_friends_talk():
    """Lip-flap and blink frames: <v1 name>_m0 (closed) / _m1 (mid) / _m2 (open) / _blink (lids shut). Same canvas, camera
    and crop rule as the v1 cut-out, so a frame swaps in place of its base (the crop box can differ by a few px: align by
    the bottom centre)."""
    run_friend_jobs(friend_talk_jobs(), 'friends_talk')


def job_friends_sitflat():
    """Legs-flat sit (on a dock or floor), hands planted beside the hips: <who>_sitflat_<34|front|side>_<expr>.png.
    As in 'sit', the model's y = 0 is the seat (underside of the thighs)."""
    run_friend_jobs(friend_sitflat_jobs(), 'friends_sitflat')


# Inside the rowboat: the camera of rowboat_side (EP3) on a taller canvas with the same focal length in px, so the
# boat keeps its exact size and the friends' heads fit above it. Layers share one crop box:
#   rowboat_side_back_tall.png  (far side + interior)  <  boat_<who>_<expr>.png (one friend)  <  rowboat_side_front_tall.png
BOAT_H = 1500
BOAT_SEATS = {'max': ([-9, 27.4, 0, .6], 'mid'), 'leo': ([75, 29.2, 0, -.6], 'fwd')}   # [x, seat y, z, yaw]: facing each other, turned to camera
BOAT_EXPRS = ['neutral', 'laugh', 'sideeye', 'shock']


def boat_shot(**extra):
    _, tgt, cam, fov, w, h, line = EP3['rowboat_side']
    d = float(np.linalg.norm(np.subtract(cam, tgt)))
    fov2 = float(np.degrees(2 * np.arctan(np.tan(np.radians(fov / 2)) * BOAT_H / h)))
    return {'camera': cam, 'target': tgt, 'fov': fov2, 'cart': None, 'near': d * .3, 'far': d * 3, **extra}, w, line


def boat_render(props, **extra):
    shot, w, line = boat_shot(**extra)
    for _ in range(3):
        img = render({'props': props, 'shots': [shot], 'light': 'neutral'}, w, BOAT_H, line=line, despeckle=34)[0]
        if img[..., 3].any() and not img[[0, -1]][:, [0, -1], 3].all():
            return img
    raise RuntimeError(f'boat layer {props} {extra} rendered empty')


def job_friends_boat():
    """Max and Leo seated inside the rowboat, side view, as layers that sandwich between the boat halves:
    rowboat_side_back_tall.png, boat_<who>_<expr>[_<m0|m1|m2|blink>].png, rowboat_side_front_tall.png, all the same size
    (one crop box), plus boat_layers.json (box, px per cm, seats). The tall halves are the rowboat_side_back/front boat
    at the same scale with headroom on top: same width and bottom edge (+-1 px), taller by 'extra_top_px'."""
    import time
    t0 = time.time()
    OUT3.mkdir(parents=True, exist_ok=True)
    jobs = [('rowboat_side_back_tall', ['rowboat'], {'boat': 'back'}), ('rowboat_side_front_tall', ['rowboat'], {'boat': 'front'}),
            ('_full', ['rowboat'], {})]
    for who, (at, _) in BOAT_SEATS.items():
        for e in BOAT_EXPRS:
            for fr in [''] + FRIEND_FRAMES:
                jobs.append((f'boat_{who}_{e}' + (f'_{fr}' if fr else ''), [FRIENDS[who][0]], {who: {'pose': 'sit', 'expr': e + (f'+{fr}' if fr else ''), 'at': at}}))
    with ThreadPoolExecutor(4) as ex:
        imgs = list(ex.map(lambda j: boat_render(j[1], **j[2]), jobs))
    full = imgs[2]
    y0b, y1, x0, x1 = alpha_box(full)
    tops = [alpha_box(im)[0] for im in imgs[3:]]
    y0 = min([y0b] + tops)
    for (name, _, _), im in zip(jobs, imgs):
        if name == '_full':
            continue
        lay = im[y0:y1, x0:x1]
        cv2.imwrite(str(OUT3 / f'{name}.png'), lay)
        print(f'{name}.png', lay.shape[:2])
    _, tgt, cam, fov, w, h, line = EP3['rowboat_side']
    pxcm = BOAT_H / 2 / np.tan(np.radians(boat_shot()[0]['fov'] / 2)) / float(np.linalg.norm(np.subtract(cam, tgt)))
    meta = {'size': [int(x1 - x0), int(y1 - y0)], 'extra_top_px': int(y0b - y0), 'px_per_cm_at_boat_centre': round(float(pxcm), 3),
            'seats': {who: {'thwart': s, 'at': a} for who, (a, s) in BOAT_SEATS.items()},
            'order': ['rowboat_side_back_tall', 'boat_max_*', 'boat_leo_*', '2D crew', 'rowboat_side_front_tall'],
            'note': 'all layers share one crop box; stack them at the same position. Same boat scale as rowboat_side_*.png.'}
    (OUT3 / 'boat_layers.json').write_text(json.dumps(meta, indent=1))
    print('boat_layers.json', meta['size'], f'extra_top_px={meta["extra_top_px"]}', f'{len(jobs)} renders in {time.time() - t0:.0f} s')


def job_friends_extras_sheet():
    """Review sheet docs/ep003/characters/FRIENDS_MAX_LEO_v1_extras.jpg: lip-flap + blink frames, legs-flat sit and the
    boat sandwich (back + Max + Leo + front)."""
    BG, INKC = (238, 236, 232), (40, 34, 30)
    rd = lambda n: cv2.imread(str(OUT3 / f'{n}.png'), cv2.IMREAD_UNCHANGED)

    def over(c, im, x, y, k):
        im = cv2.resize(im, None, fx=k, fy=k, interpolation=cv2.INTER_AREA); ih, iw = im.shape[:2]
        a = im[..., 3:] / 255.0; reg = c[y:y + ih, x:x + iw]
        c[y:y + ih, x:x + iw] = (im[..., :3] * a + reg * (1 - a)).astype(np.uint8)

    def text(c, s, x, y, sc=.9, th=1):
        cv2.putText(c, s, (x, y), cv2.FONT_HERSHEY_DUPLEX, sc, INKC, th, cv2.LINE_AA)
    W = 3000
    rows = []
    r = np.full((90, W, 3), BG, np.uint8); text(r, 'MAX & LEO v1 extras - lip-flap / blink, legs-flat sit, inside the rowboat', 40, 62, 1.5, 3); rows.append(r)
    for who in FRIENDS:                                                  # talk frames, head crops
        r = np.full((470, W, 3), BG, np.uint8)
        text(r, f'{who}: 3/4 frames  m0 / m1 / m2 / blink  (neutral, laugh, shock)', 40, 40)
        x = 40
        for e in ('neutral', 'laugh', 'shock'):
            for fr in FRIEND_FRAMES:                                       # fixed tiles: 230 x 380
                im = crop_alpha(rd(f'{who}_34_{e}_{fr}'), 0); im = im[:int(im.shape[0] * .3)]
                k = min(380 / im.shape[0], 226 / im.shape[1]); over(r, im, x + (230 - int(im.shape[1] * k)) // 2, 60 + 380 - int(im.shape[0] * k), k)
                x += 230
            x += 40
        rows.append(r)
    r = np.full((620, W, 3), BG, np.uint8); text(r, 'legs-flat sit (dock / floor): 3/4, front, side', 40, 40)
    x = 40
    for who in FRIENDS:
        for n in (f'{who}_sitflat_34_neutral', f'{who}_sitflat_front_neutral', f'{who}_sitflat_side_laugh'):
            im = rd(n); k = 3.4 * friend_span(who, 'sitflat') / 1500; over(r, im, x, 600 - int(im.shape[0] * k), k); x += int(im.shape[1] * k) + 40
    rows.append(r)
    back, front = rd('rowboat_side_back_tall'), rd('rowboat_side_front_tall')
    k = (W - 80) / 2 / back.shape[1]
    r = np.full((int(back.shape[0] * k) + 70, W, 3), BG, np.uint8); text(r, 'inside the rowboat: back_tall + boat_max_* + boat_leo_* + front_tall  (left: neutral, right: laugh / sideeye)', 40, 40)
    for i, (em, el) in enumerate((('neutral', 'neutral'), ('laugh', 'sideeye'))):
        for lay in (back, rd(f'boat_max_{em}'), rd(f'boat_leo_{el}'), front):
            over(r, lay, 40 + i * int(back.shape[1] * k + 0), 60, k)
    rows.append(r)
    out = ROOT / 'docs/ep003/characters/FRIENDS_MAX_LEO_v1_extras.jpg'
    cv2.imwrite(str(out), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(out.relative_to(ROOT))

JOBS = {'friends': job_friends, 'friends_sheet': job_friends_sheet, 'friends_talk': job_friends_talk, 'friends_sitflat': job_friends_sitflat, 'friends_boat': job_friends_boat, 'friends_extras_sheet': job_friends_extras_sheet, 'ep003_gameworld': job_ep003_gameworld, 'ep003_gameworld_sheet': job_ep003_gameworld_sheet, 'fish2': job_fish2, 'ep003_props': job_ep003_props, 'ep003_props_sheet': job_ep003_props_sheet, 'switch2_hd': job_switch2_hd, 'desk_items': job_desk_items, 'back_sword': job_back_sword, 'sword_check': job_sword_check, 'shield': job_shield, 'switch2': job_switch2, 'pad_profile': job_pad_profile, 'horse': job_horse, 'horse_rear': job_horse_rear, 'hud_items': job_hud_items, 'castle': job_castle, 'n64_34': job_n64_34, 'crt': job_crt, 'cart_spin': job_cart_spin, 'ocarina_ref': job_ocarina_ref, 'ocarina_spin': lambda: relic_spin('ocarina', [0, 10, 0], 640, 'ocarina_spin', sweep=50, elev=8),
        'sword_spin': lambda: relic_spin('sword', [0, 122, 0], 1150, 'sword_spin', elev=10),
        'triforce': job_triforce, 'n64_insert_hd': lambda: job_n64_insert(size=(2304, 1296), name='n64_insert_hd'), 'n64_pad': job_n64_pad, 'n64_room': job_n64_room, 'n64_insert': job_n64_insert, 'n64_turntable': job_n64_turntable}

if __name__ == '__main__':
    names = list(JOBS) if '--all' in sys.argv else [a for a in sys.argv[1:] if a in JOBS]
    for name in names or sys.exit(f'jobs: {", ".join(JOBS)}'):
        JOBS[name]()
