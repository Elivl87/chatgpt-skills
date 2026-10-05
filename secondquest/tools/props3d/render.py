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
                        '--default-background-color=00000000', f'--window-size={w * n},{h * 3}', '--virtual-time-budget=20000',
                        f'--screenshot={png}', f'file://{html}'], check=True, capture_output=True, timeout=300)
        img = cv2.imread(str(png), cv2.IMREAD_UNCHANGED)
    return img


def ink(color, normal, ident, scale):
    """Outline = silhouette + part boundaries + creases (normal changes), thickness scaled to output size."""
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
    k = max(1, int(round(scale)))
    edges = cv2.dilate(edges, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * k + 1, 2 * k + 1)))
    out = color.copy()
    m = edges > 0
    out[m, 0], out[m, 1], out[m, 2] = INK[2], INK[1], INK[0]  # BGR
    out[m, 3] = np.maximum(out[m, 3], 255)
    return out


def render(params, w, h, line=3.0):
    """Returns one RGBA (BGRA) image per shot at w x h."""
    n = len(params['shots'])
    # Chromium silently shrinks a WebGL drawing buffer above ~20 Mpx (passes then bleed into each other):
    # lower the supersampling to fit instead of failing
    ss = min(SS, (MAX_PX / (w * h * 3 * n)) ** 0.5, 8192 / (w * n), 8192 / (h * 3))
    assert ss >= 1, 'canvas too large for the WebGL buffer: render fewer shots per page'
    W2, H2 = int(w * ss), int(h * ss)
    raw = render_raw(params, W2, H2, n)
    shots = []
    for i in range(n):
        col = raw[:, i * W2:(i + 1) * W2]
        c, nm, idp = (col[k * H2:(k + 1) * H2] for k in range(3))
        if params.get('exposure'):  # light-coloured props read too bright under the toon ramp in a night room
            c = c.copy(); c[..., :3] = (c[..., :3].astype(np.float32) * params['exposure']).astype(np.uint8)
        o = ink(c, nm, idp, line * ss / 2)
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


JOBS = {'sword_check': job_sword_check, 'shield': job_shield, 'switch2': job_switch2, 'pad_profile': job_pad_profile, 'horse': job_horse, 'horse_rear': job_horse_rear, 'hud_items': job_hud_items, 'castle': job_castle, 'n64_34': job_n64_34, 'crt': job_crt, 'cart_spin': job_cart_spin, 'ocarina_ref': job_ocarina_ref, 'ocarina_spin': lambda: relic_spin('ocarina', [0, 10, 0], 640, 'ocarina_spin', sweep=50, elev=8),
        'sword_spin': lambda: relic_spin('sword', [0, 122, 0], 1150, 'sword_spin', elev=10),
        'triforce': job_triforce, 'n64_insert_hd': lambda: job_n64_insert(size=(2304, 1296), name='n64_insert_hd'), 'n64_pad': job_n64_pad, 'n64_room': job_n64_room, 'n64_insert': job_n64_insert, 'n64_turntable': job_n64_turntable}

if __name__ == '__main__':
    names = list(JOBS) if '--all' in sys.argv else [a for a in sys.argv[1:] if a in JOBS]
    for name in names or sys.exit(f'jobs: {", ".join(JOBS)}'):
        JOBS[name]()
