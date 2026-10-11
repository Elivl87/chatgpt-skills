/**
 * Procedural 3D props rendered to 2D (SecondQuest engine, prop renderer v1).
 *
 * Built with three.js and rendered by headless Chromium (CPU, SwiftShader) from tools/props3d/render.py.
 * The page reads window.PARAMS = { width, height, shots: [{ camera, target, fov, cart }] , props: [...] }
 * and draws, for every shot, three passes side by side: toon colour | world normals | part ids.
 * render.py turns the normal and id passes into ink outlines matching the house 2D style.
 *
 * Units are millimetres, y up, the console front (controller ports) faces +z.
 * No logos or text are modelled on the console. The cartridge front uses the approved mock
 * (docs/ep002/source/cartridge_mock_front.png, official logo on the cartridge: Producer decision).
 */
import * as THREE from 'three';

type V3 = [number, number, number];
interface FishExpr { lid?: number; look?: [number, number]; mouth?: 'pout' | 'o' | 'flat'; sweat?: boolean }
interface Shot { camera: V3; target: V3; fov?: number; cart?: { y: number; x?: number; z?: number; tilt?: number } | null; pose?: number; fish?: FishExpr; boat?: 'back' | 'front'; hide?: number[] }
type Poly = { outer: [number, number][]; holes: [number, number][][] };
interface Params { shield?: Record<string, Poly[]>; variant?: 'classic' | 'faithful'; width: number; height: number; shots: Shot[]; props: string[]; cartTexture?: string; cartOutline?: [number, number][]; light?: 'room_night' | 'neutral' }
declare global { interface Window { PARAMS: Params } }

const P = window.PARAMS;
const ids: THREE.Mesh[] = [];

// ---------------------------------------------------------------- helpers
const ramp = (() => {
  const d = new Uint8Array([90, 170, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
const toon = (hex: string) => new THREE.MeshToonMaterial({ color: new THREE.Color(hex), gradientMap: ramp });

const roundedRect = (w: number, d: number, r: number, frontBulge = 0) => {
  // top-view outline in shape space: x right, y = -z (towards the back)
  const s = new THREE.Shape();
  const x0 = -w / 2, x1 = w / 2, y0 = -d / 2, y1 = d / 2;
  s.moveTo(x0 + r, y0);
  s.quadraticCurveTo(0, y0 - frontBulge, x1 - r, y0);
  s.quadraticCurveTo(x1, y0, x1, y0 + r);
  s.lineTo(x1, y1 - r);
  s.quadraticCurveTo(x1, y1, x1 - r, y1);
  s.lineTo(x0 + r, y1);
  s.quadraticCurveTo(x0, y1, x0, y1 - r);
  s.lineTo(x0, y0 + r);
  s.quadraticCurveTo(x0, y0, x0 + r, y0);
  return s;
};

/** Extrude a top-view outline upward: shape (x, y) -> world (x, -y as z), height along +y from y0. */
const slab = (shape: THREE.Shape, y0: number, h: number, bevel: number, mat: THREE.Material, part: number) => {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.01, h - 2 * bevel), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 24,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0 + bevel, 0);
  const m = new THREE.Mesh(g, mat);
  m.userData.part = part;
  ids.push(m);
  return m;
};

const box = (w: number, h: number, d: number, at: V3, mat: THREE.Material, part: number, r = 0) => {
  const g = r > 0
    ? (() => { const s = roundedRect(w - 2 * r, d - 2 * r, Math.min(4, Math.min(w, d) / 2 - r - 0.01)); const e = new THREE.ExtrudeGeometry(s, { depth: h - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 12 }); e.rotateX(-Math.PI / 2); e.translate(0, r - h / 2, 0); return e; })()
    : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat);
  m.position.set(...at);
  m.userData.part = part;
  ids.push(m);
  return m;
};

// ---------------------------------------------------------------- N64 console (approx. 260 x 73 x 190 mm)
const BODY = '#3d3d43', DECK = '#46464d', DARK = '#202024', BLACK = '#0a0a0c', SWITCH = '#55555c';
export const HUMP_TOP = 73;

const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number) => (o.position.set(x, y, z), o);

const cyl = (r: number, len: number, pos: V3, rot: V3, mat: THREE.Material, part: number) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 40), mat);
  m.position.set(...pos);
  m.rotation.set(...rot);
  m.userData.part = part;
  ids.push(m);
  return m;
};

/** Variant "classic" (v2): the simplified console the Producer approved on 2026-10-03 ("me encanta"). */
const n64Classic = () => {
  const g = new THREE.Group();
  let part = 1;
  // base: wide rounded body, flat front face that carries the controller ports
  g.add(slab(roundedRect(260, 190, 30, 0), 0, 42, 5, toon(BODY), part++));
  // side wings: inset deck, beveled heavily so the sides read as slopes
  g.add(slab(roundedRect(240, 172, 28, 0), 36, 20, 8, toon(DECK), part++));
  // the raised centre: a wide rounded block that holds slot, switches and expansion lid
  g.add(slab(roundedRect(168, 160, 34, 6), 48, HUMP_TOP - 48, 8, toon(BODY), part++));
  // cartridge slot (dark recess, rear of the centre) with its two dust-flap lips
  g.add(box(124, 3, 26, [0, HUMP_TOP - 0.6, -22], toon(BLACK), part++));
  for (const z of [-36, -8]) {
    const f = box(128, 2, 3.5, [0, HUMP_TOP + 0.3, z], toon(DARK), part++);
    f.userData.flap = true;
    g.add(f);
  }
  // power (left) and reset (right) sliders, in front of the slot
  for (const sx of [-1, 1]) {
    g.add(box(30, 4, 30, [sx * 52, HUMP_TOP + 0.6, 16], toon(DARK), part++, 1.5));
    g.add(box(18, 7, 12, [sx * 52, HUMP_TOP + 3, sx < 0 ? 22 : 10], toon(SWITCH), part++, 2.5));
  }
  // memory expansion lid at the front of the centre block
  g.add(box(92, 2, 26, [0, HUMP_TOP - 0.2, 52], toon('#34343a'), part++, 0.8));
  // four controller ports on the front face, set in a darker panel
  g.add(box(222, 22, 3, [0, 20, 100.5], toon(DARK), part++, 1));
  [-1.5, -0.5, 0.5, 1.5].forEach((k) => {
    g.add(box(30, 13, 3, [k * 50, 20, 102], toon(BLACK), part++, 1.2));
  });
  // plinth line so the console sits on the floor
  g.add(slab(roundedRect(252, 182, 30, 0), -0.5, 4, 1.5, toon(DARK), part++));
  return g;
};

/**
 * Variant "faithful" (v3). Modelled from reference photos (Wikimedia Commons): corner pods, controller-port rings, front window,
 * vent slits ahead of the slot, oval power/reset controls, expansion lid. No logos or lettering.
 */
const n64 = () => {
  const g = new THREE.Group();
  let part = 1;
  const PODS = '#2f2f34', RING = '#a7a7ab', FLAP = '#9c9ca1';
  // main body: rounded slab, the front edge curves in between the corner pods
  g.add(slab(roundedRect(250, 184, 44, 0), 10, 50, 11, toon(BODY), part++));
  // four corner pods (the console's feet / bumpers), sticking out at the sides
  for (const [x, z] of [[-118, 70], [118, 70], [-118, -66], [118, -66]] as const)
    g.add(at(slab(roundedRect(56, 64, 24, 0), 0, 30, 6, toon(PODS), part++), x, 0, z));
  // darker front panel between the pods, below the top lip: holds ports and window
  g.add(box(170, 24, 4, [0, 26, 102.5], toon('#29292d'), part++, 2));
  // controller ports: light grey rings with a dark three-pin socket
  for (const x of [-66, -36, 36, 66]) {
    g.add(cyl(11.5, 4, [x, 26, 104.5], [Math.PI / 2, 0, 0], toon(RING), part++));
    g.add(box(13, 6, 2, [x, 26, 106.6], toon(BLACK), part++, 1.2));
  }
  // centre front window (plain: no logo)
  g.add(box(44, 19, 2, [0, 27, 104.8], toon('#141418'), part++, 2));
  // raised rear block with the cartridge slot
  g.add(slab(roundedRect(176, 84, 28, 0), 44, HUMP_TOP - 44, 9, toon(BODY), part++).translateZ(-44));
  g.add(box(128, 3, 24, [0, HUMP_TOP - 0.8, -46], toon(BLACK), part++));
  for (const z of [-51.5, -40.5]) {  // dust flaps, light grey; they fold in when the cartridge enters
    const f = box(124, 1.6, 9, [0, HUMP_TOP + 0.5, z], toon(FLAP), part++);
    f.userData.flap = true;
    g.add(f);
  }
  // vent slits on the slope in front of the slot
  for (let k = 0; k < 19; k++) g.add(box(3, 1.4, 11, [-63 + k * 7, 60.4, 13], toon(BLACK), part++));
  // power slider (left) and reset button (right): dark ovals on the top
  g.add(box(34, 2.4, 22, [-82, 60.2, 26], toon(DARK), part++, 1));
  g.add(box(22, 6, 12, [-82, 62.4, 24], toon(SWITCH), part++, 2.5));
  g.add(box(30, 3.5, 22, [84, 60.6, 48], toon(DARK), part++, 1));
  g.add(box(22, 3, 14, [84, 62.4, 48], toon(SWITCH), part++, 2.5));
  // memory expansion lid with its little tab
  g.add(box(84, 1.6, 42, [0, 60.3, 34], toon('#38383e'), part++, 0.6));
  g.add(box(14, 2, 5, [0, 61.2, 15], toon(SWITCH), part++, 0.6));
  // side vents (both sides)
  for (const sx of [-1, 1]) for (let k = 0; k < 9; k++) g.add(box(2, 16, 3, [sx * 137, 28, -20 + k * 7], toon(BLACK), part++));
  return g;
};

// ---------------------------------------------------------------- N64 controller (three handles, approx. 190 x 160 mm)
/** Lying face up, cable edge towards the back (-z), handles towards the player (+z). No logos or lettering. */
const n64Pad = () => {
  const g = new THREE.Group();
  let part = 200;
  const GREY = '#b4b4b9', GREY_D = '#8d8d93';
  const pts: [number, number][] = [
    [-100, 0], [-95, 30], [-75, 48], [0, 54], [75, 48], [95, 30], [100, 0], [96, -50], [88, -92], [68, -102], [55, -66], [40, -34],
    [24, -44], [20, -92], [0, -104], [-20, -92], [-24, -44], [-40, -34], [-55, -66], [-68, -102], [-88, -92], [-96, -50],
  ];
  const shape = new THREE.Shape();
  shape.moveTo(...pts[0]);
  shape.splineThru([...pts.slice(1), pts[0]].map(([x, y]) => new THREE.Vector2(x, y)));
  g.add(slab(shape, 0, 26, 9, toon(GREY), part++));
  // shoulder buttons L / R along the back edge
  for (const sx of [-1, 1]) g.add(box(46, 10, 10, [sx * 66, 16, -45], toon(GREY_D), part++, 4));
  // d-pad (left)
  g.add(box(30, 5, 10, [-62, 27, -8], toon('#3a3a40'), part++, 1.5));
  g.add(box(10, 5, 30, [-62, 27, -8], toon('#3a3a40'), part++, 1.5));
  // analog stick (centre): socket, stem, cap
  g.add(cyl(15, 3, [0, 26.5, 2], [0, 0, 0], toon(GREY_D), part++));
  g.add(cyl(4, 10, [0, 31, 2], [0, 0, 0], toon('#9a9aa0'), part++));
  g.add(cyl(9, 4, [0, 37, 2], [0, 0, 0], toon('#c8c8cc'), part++));
  // start (red), A (blue), B (green), four C buttons (yellow)
  g.add(cyl(5, 4, [0, 27, -24], [0, 0, 0], toon('#d23a32'), part++));
  g.add(cyl(7.5, 4, [50, 27, 8], [0, 0, 0], toon('#2f5fd0'), part++));
  g.add(cyl(7.5, 4, [37, 27, -10], [0, 0, 0], toon('#2f9a45'), part++));
  for (const [x, z] of [[72, -28], [72, -8], [62, -18], [82, -18]]) g.add(cyl(5, 4, [x, 27, z], [0, 0, 0], toon('#e8b923'), part++));
  // cable stub leaving the back edge
  g.add(cyl(3, 30, [0, 12, -64], [Math.PI / 2, 0, 0], toon('#2a2a2e'), part++));
  return g;
};

// ---------------------------------------------------------------- Switch 2-like handheld (evoked, ~272 x 116 x 14 mm)
/** Lying flat, screen up (+y), top edge towards -z. Dark body and Joy-Con-like sides with a blue (left) and red (right)
 *  accent, like the 2025 console. The screen is an unlit key colour (#00ff00) so the animatic can composite a picture. */
const switch2 = () => {
  const g = new THREE.Group();
  let part = 1200;
  const BODY2 = '#26262c', SIDE = '#303037', CAP = '#1a1a1e', BTN = '#3c3c44';
  g.add(slab(roundedRect(200, 116, 5), 0, 14, 1.5, toon(BODY2), part++));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(180, 101), new THREE.MeshBasicMaterial({ color: new THREE.Color('#00ff00') }));
  scr.rotation.x = -Math.PI / 2; scr.position.set(0, 14.2, 0); scr.userData.part = part++; ids.push(scr); g.add(scr);
  for (const sx of [-1, 1]) {
    const cx = sx * 120, acc = sx < 0 ? '#3d7bff' : '#ff4b4b';
    const side = slab(roundedRect(40, 116, 16), 0, 15, 2, toon(SIDE), part++); side.position.x = cx; g.add(side);
    g.add(box(10, 15, 116, [sx * 104, 7.5, 0], toon(SIDE), part++, 1));
    g.add(box(2.4, 12, 108, [sx * 100.6, 7.5, 0], toon(acc), part++));            // the coloured inner rail
    g.add(box(3, 1.2, 104, [sx * 102.5, 15.4, 0], toon(acc), part++));            // ...showing on the top face
    const stickZ = sx < 0 ? -26 : 20, btnZ = sx < 0 ? 20 : -26;
    g.add(cyl(13, 2.2, [cx, 15.8, stickZ], [0, 0, 0], toon(acc), part++));         // coloured ring around the stick
    g.add(cyl(9, 2.5, [cx, 16.6, stickZ], [0, 0, 0], toon(BTN), part++));
    g.add(cyl(3.5, 5, [cx, 19, stickZ], [0, 0, 0], toon(BTN), part++));
    g.add(cyl(8, 3.5, [cx, 22.5, stickZ], [0, 0, 0], toon(CAP), part++));
    for (const [dx, dz] of [[0, -9], [0, 9], [-9, 0], [9, 0]]) g.add(cyl(4, 3, [cx + dx, 16.2, btnZ + dz], [0, 0, 0], toon(BTN), part++));
    g.add(box(sx < 0 ? 8 : 8, 2, 2.5, [sx * 108, 16, -48], toon(BTN), part++));     // minus / plus
    if (sx > 0) g.add(box(2.5, 2, 8, [108, 16, -48], toon(BTN), part++));
  }
  return g;
};

// ---------------------------------------------------------------- desk items for block O (Producer, 2026-10-07: the table
// of an adult who plays today). Generic, no brands. Keys: phone screen #ff00ff, game cover #00ffff (composited in 2D).
const unlit = (hex: string, part: number, w: number, d: number, y: number) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ color: new THREE.Color(hex) }));
  m.rotation.x = -Math.PI / 2; m.position.set(0, y, 0); m.userData.part = part; ids.push(m); return m;
};
/** A smartphone lying flat, screen up (~75 x 160 x 8 mm), a thin metal frame and a camera bump at the back edge. */
const phone = () => {
  const g = new THREE.Group();
  g.add(slab(roundedRect(75, 160, 10), 0, 8, 1.5, toon('#2c2f36'), 1300));
  g.add(slab(roundedRect(71, 156, 9), 7.6, 0.6, 0, toon('#15161a'), 1301));   // the glass, black bezel
  g.add(unlit('#ff00ff', 1302, 66, 146, 8.35));
  g.add(box(2, 3, 18, [37.6, 5, -40], toon('#4a4d55'), 1303));                 // side buttons
  return g;
};
/** A coffee mug (~82 mm across, 95 mm tall) with a handle; the coffee shows on top. */
const mug = () => {
  const g = new THREE.Group();
  const prof = [[0, 0], [38, 0], [41, 4], [41, 92], [37, 95], [36, 90], [36, 8], [0, 8]].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), toon('#e9e2d6')); body.userData.part = 1310; ids.push(body); g.add(body);
  const coffee = cyl(36, 1, [0, 80, 0], [0, 0, 0], toon('#4a2c1a'), 1311); g.add(coffee);
  const band = cyl(41.6, 14, [0, 70, 0], [0, 0, 0], toon('#d6392f'), 1312); g.add(band);   // the channel's red band
  const handle = new THREE.Mesh(new THREE.TorusGeometry(24, 6.5, 16, 32, Math.PI * 1.15), toon('#e9e2d6'));
  handle.rotation.set(0, 0, -Math.PI * 0.575); handle.position.set(44, 50, 0); handle.userData.part = 1313; ids.push(handle); g.add(handle);
  return g;
};
/** Over-ear headphones lying flat: two cups and the headband arching between them. */
const headphones = () => {
  const g = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(80, 7, 16, 48, Math.PI), toon('#2b2d33'));
  band.rotation.set(-Math.PI / 2, 0, 0); band.position.set(0, 10, 0); band.userData.part = 1320; ids.push(band); g.add(band);
  const pad = new THREE.Mesh(new THREE.TorusGeometry(80, 4, 12, 48, Math.PI * .6), toon('#55585f'));
  pad.rotation.set(-Math.PI / 2, 0, Math.PI * .2); pad.position.set(0, 16, 0); pad.userData.part = 1321; ids.push(pad); g.add(pad);
  for (const sx of [-1, 1]) {
    g.add(cyl(36, 22, [sx * 80, 14, 6], [0, 0, 0], toon('#3a3d44'), 1322));
    g.add(cyl(30, 4, [sx * 80, 26, 6], [0, 0, 0], toon('#1d1e22'), 1323));          // the cushion
    g.add(cyl(14, 2, [sx * 80, 28.5, 6], [0, 0, 0], toon(sx < 0 ? '#3d7bff' : '#ff4b4b'), 1324));
  }
  return g;
};
/** A game box (~135 x 170 x 12 mm) lying flat, cover up: a red top band and a cover key for our own cover art. */
const gamebox = () => {
  const g = new THREE.Group();
  g.add(slab(roundedRect(135, 170, 6), 0, 12, 1.2, toon('#f2f2f4'), 1330));
  g.add(unlit('#00ffff', 1331, 125, 140, 12.05));
  const bandM = new THREE.Mesh(new THREE.PlaneGeometry(125, 18), toon('#d6392f'));
  bandM.rotation.x = -Math.PI / 2; bandM.position.set(0, 12.06, -76); bandM.userData.part = 1332; ids.push(bandM); g.add(bandM);
  return g;
};

// ---------------------------------------------------------------- golden triangles (Triforce-like, three equal triangles)
/** Three beveled golden triangles stacked as one big triangle, standing upright, facing +z. Side of each: 100 mm. */
const triforce = () => {
  const g = new THREE.Group();
  const side = 100, h = side * Math.sqrt(3) / 2, gap = 3;
  const one = (cx: number, cy: number, part: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(cx - side / 2 + gap, cy + gap * 0.6);
    sh.lineTo(cx + side / 2 - gap, cy + gap * 0.6);
    sh.lineTo(cx, cy + h - gap);
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: true, bevelThickness: 3, bevelSize: 2.5, bevelSegments: 3 });
    geo.translate(0, 0, -4);
    const m = new THREE.Mesh(geo, toon('#f2c230'));
    m.userData.part = part;
    ids.push(m);
    return m;
  };
  g.add(one(-side / 2, 0, 300), one(side / 2, 0, 301), one(0, h, 302));
  return g;
};

// ---------------------------------------------------------------- ocarina (Producer reference 2026-10-03, v2)
/** Built on measurements of the Producer's reference (docs/ep002/source/ocarina_reference_producer.jpg):
 *  silhouette top/bottom profile, hole positions and sizes, collar and mouthpiece placement, all in units of the
 *  half-length L along the body axis (u = -1 round end .. +1 tip, v up). Holes face the viewer (+z). */
const OC_U = [-1, -0.95, -0.85, -0.75, -0.65, -0.55, -0.45, -0.35, -0.25, -0.15, -0.05, 0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1];
const OC_TOP = [0, 0.134, 0.228, 0.297, 0.344, 0.382, 0.4, 0.41, 0.41, 0.405, 0.4, 0.397, 0.373, 0.345, 0.318, 0.284, 0.254, 0.218, 0.177, 0.137, 0.091, 0];
const OC_BOT = [0, -0.268, -0.344, -0.407, -0.455, -0.476, -0.5, -0.514, -0.513, -0.503, -0.477, -0.461, -0.442, -0.419, -0.38, -0.347, -0.303, -0.251, -0.202, -0.143, -0.083, 0];
const ocarina = () => {
  const g = new THREE.Group();
  let part = 400;
  const L = 90, DEPTH = 0.86;                       // half-length (mm); cross-section depth / height
  const lerpT = (tab: number[], u: number) => {     // Catmull-Rom through the measured profile (no facets)
    const uu = Math.min(1, Math.max(-1, u));
    let i = 0; while (i < OC_U.length - 2 && uu > OC_U[i + 1]) i++;
    const k = (uu - OC_U[i]) / (OC_U[i + 1] - OC_U[i]);
    const p0 = tab[Math.max(0, i - 1)], p1 = tab[i], p2 = tab[i + 1], p3 = tab[Math.min(tab.length - 1, i + 2)];
    return 0.5 * (2 * p1 + (-p0 + p2) * k + (2 * p0 - 5 * p1 + 4 * p2 - p3) * k * k + (-p0 + 3 * p1 - 3 * p2 + p3) * k * k * k);
  };
  const RE = -0.72, TE = 0.95;                     // round end cap (near-circular, as in the reference) and small tip cap
  const sect = (u: number) => {                     // centre, half-height, half-depth (mm) of the cross-section at u
    const e = Math.min(TE, Math.max(RE, u));
    const t = lerpT(OC_TOP, e), b = lerpT(OC_BOT, e);
    const q = u < RE ? (RE - u) / (1 + RE) : u > TE ? (u - TE) / (1 - TE) : 0;
    const cap = Math.sqrt(Math.max(0, 1 - q * q));
    const ry = ((t - b) / 2) * L * cap;
    return { yc: ((t + b) / 2) * L, ry: Math.max(ry, 1e-3), rz: Math.max(ry * DEPTH, 1e-3) };
  };
  const geo = new THREE.SphereGeometry(1, 128, 72);
  geo.rotateZ(-Math.PI / 2);                        // poles on the x axis
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i), sy = pos.getY(i), sz = pos.getZ(i);
    const k = Math.hypot(sy, sz) || 1;
    const u = Math.min(1, Math.max(-1, sx));
    const { yc, ry, rz } = sect(u);
    pos.setXYZ(i, u * L, yc + (sy / k) * ry, (sz / k) * rz);
  }
  geo.computeVertexNormals();
  const BLUE = '#3456c4';
  const body = new THREE.Mesh(geo, toon(BLUE)); body.userData.part = part++; ids.push(body); g.add(body);
  const surfAt = (u: number, v: number) => {        // point on the front surface at body-frame (u, v)
    const { yc, ry, rz } = sect(u), y = v * L, s2 = Math.max(-0.97, Math.min(0.97, (y - yc) / ry));
    return new THREE.Vector3(u * L, y, rz * Math.sqrt(1 - s2 * s2));
  };
  const front = (u: number, v: number) => {         // point + true surface normal (finite differences)
    const p = surfAt(u, v), e = 0.004;
    const du = surfAt(u + e, v).sub(surfAt(u - e, v)), dv = surfAt(u, v + e).sub(surfAt(u, v - e));
    const n = new THREE.Vector3().crossVectors(du, dv).normalize();
    return { p, n: n.z < 0 ? n.negate() : n };
  };
  // glaze highlights (Producer: "añade el brillo"): unlit light streaks laid on the surface, sharing the body's part id
  // so the ink pass draws no outline around them; the holes sit above and cover them
  const GLOSS = new THREE.MeshBasicMaterial({ color: new THREE.Color('#d4defc'), transparent: true, opacity: 0.8, depthWrite: false });
  const streak = (u0: number, u1: number, vAt: (u: number) => number, halfW: number, lift = 0.35) => {
    const NU = 60, NV = 6, verts: number[] = [], idx: number[] = [];
    for (let i = 0; i <= NU; i++) {
      const k = i / NU, u = u0 + (u1 - u0) * k, w = halfW * Math.sin(Math.PI * k) ** 0.7;
      for (let j = 0; j <= NV; j++) {
        const { p, n } = front(u, vAt(u) + (j / NV - 0.5) * 2 * w / L);
        p.addScaledVector(n, lift); verts.push(p.x, p.y, p.z);
      }
    }
    for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
      const a = i * (NV + 1) + j, b = a + NV + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); sg.setIndex(idx); sg.computeVertexNormals();
    const m = new THREE.Mesh(sg, GLOSS); m.userData.part = body.userData.part; m.renderOrder = 1; ids.push(m); g.add(m);
  };
  const upper = (f: number) => (u: number) => { const { yc, ry } = sect(u); return (yc + f * ry) / L; };
  streak(-0.12, 0.9, upper(0.74), 3.2);              // long streak along the top, wide end to tip
  streak(-0.86, -0.5, upper(0.35), 3.6);             // short gleam on the round end
  streak(-0.2, 0.55, upper(-0.72), 1.6, 0.3);        // faint rim light along the belly
  // holes, from the reference: (u, v, radius mm)
  const HOLES: [number, number, number][] = [[0.153, 0.19, 7.0], [0.415, 0.078, 6.0], [0.673, 0.053, 5.0],
    [-0.457, 0.054, 7.6], [-0.163, -0.112, 7.0], [-0.711, -0.147, 6.6], [-0.434, -0.336, 7.2]];
  const HOLE = toon('#0c1534');
  for (const [u, v, r] of HOLES) {                   // dark discs laid on the surface itself, so curvature never bites the edge
    const NR = 6, NA = 40, verts: number[] = [], idx: number[] = [];
    const c = front(u, v);
    verts.push(...c.p.clone().addScaledVector(c.n, 0.5).toArray());
    for (let i = 1; i <= NR; i++) for (let j = 0; j < NA; j++) {
      const rr = (r * i) / NR, a2 = (j / NA) * Math.PI * 2;
      const q = front(u + (rr * Math.cos(a2)) / L, v + (rr * Math.sin(a2)) / L);
      verts.push(...q.p.addScaledVector(q.n, 0.5).toArray());
    }
    for (let j = 0; j < NA; j++) idx.push(0, 1 + j, 1 + ((j + 1) % NA));
    for (let i = 1; i < NR; i++) for (let j = 0; j < NA; j++) {
      const a0 = 1 + (i - 1) * NA + j, a1 = 1 + (i - 1) * NA + ((j + 1) % NA), b0 = a0 + NA, b1 = a1 + NA;
      idx.push(a0, b0, a1, a1, b0, b1);
    }
    const hg = new THREE.BufferGeometry();
    hg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); hg.setIndex(idx); hg.computeVertexNormals();
    const h = new THREE.Mesh(hg, HOLE); h.material.side = THREE.DoubleSide; h.renderOrder = 2;
    h.userData.part = part++; ids.push(h); g.add(h);
  }
  // collar + mouthpiece: collar centre (u -0.267, v 0.528), mouthpiece tip (u -0.316, v 1.01): nearly upright, leaning back 6 deg
  const mg = new THREE.Group();
  mg.position.set(-0.267 * L, 0.36 * L, 0);
  mg.rotation.set(0, 0, 0.1);
  const CH = 24, CR0 = 19, CR1 = 16.5, SEG = 8;
  const BADGE = 0.66 * Math.PI / 3.1;              // half-angle of the flat front badge (~38 deg)
  const cg = new THREE.CylinderGeometry(CR1, CR0, CH, 48, 1);
  { const cp = cg.attributes.position as THREE.BufferAttribute;      // round band, flattened at the front where the Triforce sits
    for (let i = 0; i < cp.count; i++) {
      const y = cp.getY(i), rl = CR1 + (CR0 - CR1) * (0.5 - y / CH), zmax = rl * Math.cos(BADGE);
      if (cp.getZ(i) > zmax) cp.setZ(i, zmax);
    }
    cg.computeVertexNormals(); }
  const collar = new THREE.Mesh(cg, toon('#c3ccd0'));
  collar.position.y = CH / 2 + 2;
  collar.userData.part = part++; ids.push(collar); mg.add(collar);
  const SL = 40;
  const SR0 = 11.2, SR1 = 5.4;                     // mouthpiece: thicker than v1 (8.6/4.2), still slimmer than the collar (Producer note)
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(SR1, SR0, SL, 48), toon(BLUE));
  spout.position.y = CH + 2 + SL / 2 - 1; spout.userData.part = part++; ids.push(spout); mg.add(spout);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(SR1, 32, 16), toon(BLUE));
  tip.position.y = CH + 2 + SL - 1; tip.userData.part = spout.userData.part; ids.push(tip); mg.add(tip);
  {
    const a = Math.PI * 0.30, shg = new THREE.CylinderGeometry(SR1 + 0.25, SR0 + 0.25, SL * 0.8, 6, 1, true, a - 0.22, 0.44);
    const sh = new THREE.Mesh(shg, GLOSS); sh.position.y = CH + 2 + SL / 2 + 1; sh.userData.part = spout.userData.part; sh.renderOrder = 1; ids.push(sh); mg.add(sh);
  }
  // Triforce on a dark inset, on the collar's front facet
  const rMid = (CR0 + CR1) / 2, apo = rMid * Math.cos(BADGE), lean = Math.atan((CR0 - CR1) / CH);
  const plate = new THREE.Group();
  plate.position.set(0, CH / 2 + 2, apo + 0.15); plate.rotation.x = -lean;
  const triMesh = (cx: number, cy: number, sd: number, col: string, z: number, pt: number) => {
    const sh = new THREE.Shape(); sh.moveTo(cx - sd / 2, cy); sh.lineTo(cx + sd / 2, cy); sh.lineTo(cx, cy + sd * 0.866); sh.closePath();
    const tg = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false }); tg.translate(0, 0, z);
    const m = new THREE.Mesh(tg, toon(col)); m.userData.part = pt; ids.push(m); return m;
  };
  const T = 17, gap = 0.75, ty = -T * 0.866 / 2;
  plate.add(triMesh(0, ty - 1.6, T + 4.5, '#3c4a46', 0, part++));
  const gp = part++;
  plate.add(triMesh(-T / 4, ty, T / 2 - gap, '#f2c230', 0.6, gp), triMesh(T / 4, ty, T / 2 - gap, '#f2c230', 0.6, gp),
            triMesh(0, ty + T * 0.866 / 2, T / 2 - gap, '#f2c230', 0.6, gp));
  mg.add(plate);
  g.add(mg);
  g.rotation.set(0, 0, 0.656);                      // body axis 37.6 deg up to the tip, as in the reference
  return g;
};

// ---------------------------------------------------------------- master sword (classic: violet bird-wing guard, gold gem), upright
/** v2 (Producer reference 2026-10-05, docs/ep002/source/sword_reference_producer.jpg): measured on the reference
 *  rotated upright, in reference pixels (axis x = 180, guard base ry = 440, tip ry = 1390), mapped to units with
 *  S = 345 / 950 so the blade keeps its old length: x = (rx - 180) * S, y = (ry - 440) * S, the blade points to +y.
 *  Grey-blue blade with chamfered edges, shoulders below the guard and an engraved triangle-of-triangles outline;
 *  violet hilt: swept bird-wing guard with feather ribs, a cup holding the gold diamond gem, a collar disc, a ringed
 *  grip and a turned pommel. */
const masterSword = () => {
  const g = new THREE.Group();
  let part = 500;
  const S = 345 / 950;
  const V = (rx: number, ry: number) => new THREE.Vector2((rx - 180) * S, (ry - 440) * S);
  const HILT = toon('#5e48e0'), HILT_D = toon('#4f3dc8'), BLADE = toon('#8492a2'), INKG = toon('#3e4448');
  const add = (m: THREE.Mesh) => { m.userData.part = part++; ids.push(m); g.add(m); return m; };
  const ext = (pts: [number, number][], depth: number, bevel: number, mat: THREE.Material, mirror = false) => {
    const sh = new THREE.Shape(pts.map(([x, y]) => V(mirror ? 360 - x : x, y)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.2, depth - 2 * bevel), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 16 });
    geo.translate(0, 0, -depth / 2 + bevel);
    return add(new THREE.Mesh(geo, mat));
  };
  // blade: half-widths along its length (shoulders just below the guard), chamfered edges from the bevel
  const half: [number, number][] = [[432, 31], [512, 31], [527, 56], [548, 47], [1235, 45], [1290, 41], [1340, 26], [1390, 0]];
  const outline: [number, number][] = [...half.map(([ry, w]) => [180 + w, ry] as [number, number]), ...half.slice(0, -1).reverse().map(([ry, w]) => [180 - w, ry] as [number, number])];
  ext(outline, 6.5, 2.6, BLADE);
  // engraved triangle of triangles near the shoulders (outline only, both faces)
  const tri = [[180, 530], [150, 573], [210, 573]].map(([x, y]) => V(x, y));
  const mid = [0, 1, 2].map((i) => tri[i].clone().add(tri[(i + 1) % 3]).multiplyScalar(0.5));
  // flat strips on the blade's own part id and normal, so they read as thin engraved lines (no ink outline around them)
  const bladeId = part - 1;
  const seg = (p: THREE.Vector2, q: THREE.Vector2, z: number) => {
    const d = q.clone().sub(p), L = d.length() + 0.7;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.75), new THREE.MeshBasicMaterial({ color: new THREE.Color('#4c5560'), side: THREE.DoubleSide }));
    m.position.set((p.x + q.x) / 2, (p.y + q.y) / 2, z); m.rotation.z = Math.atan2(d.y, d.x);
    if (z < 0) m.rotation.y = Math.PI;
    m.userData.part = bladeId; m.userData.flat = true; ids.push(m); g.add(m);
  };
  for (const z of [3.3, -3.3]) {
    for (let i = 0; i < 3; i++) { seg(tri[i], tri[(i + 1) % 3], z); seg(mid[i], mid[(i + 1) % 3], z); }
  }
  // guard: the centre cup (curved sides, from the collar down to the blade), then the two crescent wings, each with
  // two thin feather ribs that follow its upper edge
  ext([[136, 344], [224, 344], [220, 372], [212, 404], [210, 446], [150, 446], [148, 404], [140, 372]], 13, 2.2, HILT);
  const wing: [number, number][] = [[268, 313], [290, 334], [314, 359], [332, 391], [344, 426], [348, 447], [330, 437], [306, 425],
    [280, 415], [256, 410], [232, 410], [220, 384], [228, 356], [248, 332]];
  const strip = (line: [number, number][], w: number): [number, number][] => {
    const L = line.map(([x, y]) => [x, y]), n = L.length, up: [number, number][] = [], dn: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const [x0, y0] = L[Math.max(0, i - 1)], [x1, y1] = L[Math.min(n - 1, i + 1)];
      const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, k = w / 2 * (1 - Math.abs(2 * i / (n - 1) - 1) * 0.6);
      up.push([L[i][0] - dy / l * k, L[i][1] + dx / l * k]); dn.push([L[i][0] + dy / l * k, L[i][1] - dx / l * k]);
    }
    return [...up, ...dn.reverse()];
  };
  const rib1 = strip([[262, 336], [286, 352], [306, 374], [322, 400], [334, 430]], 9);
  const rib2 = strip([[248, 356], [272, 370], [292, 390], [306, 412], [316, 430]], 9);
  for (const m of [false, true]) {
    const w = ext(wing, 10, 2, HILT, m);
    for (const r of [rib1, rib2]) for (const z of [5.02, -5.02]) {   // painted ribs on both faces, on the wing's own id
      const geo = new THREE.ShapeGeometry(new THREE.Shape(r.map(([x, y]) => V(m ? 360 - x : x, y))));
      const k = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#3f31a6'), side: THREE.DoubleSide }));
      k.position.z = z; k.userData.part = w.userData.part; ids.push(k); g.add(k);
    }
  }
  // the gold diamond gem on both faces
  for (const zf of [7.6, -7.6]) {
    const gem = add(new THREE.Mesh(new THREE.OctahedronGeometry(1), toon('#e8a024')));
    gem.position.set(0, (380 - 440) * S, zf); gem.scale.set(15 * S, 35 * S, 3);
  }
  // collar disc, ringed grip and turned pommel (lathe profile in reference pixels: [radius, ry])
  const lathe = (prof: [number, number][], mat: THREE.Material) => {
    const geo = new THREE.LatheGeometry(prof.map(([r, ry]) => new THREE.Vector2(r * S, (ry - 440) * S)), 32);
    return add(new THREE.Mesh(geo, mat));
  };
  lathe([[0, 346], [44, 346], [52, 338], [52, 326], [44, 318], [0, 318]], HILT);
  // grip: one smooth lathe with painted bands (vertex colours), so the rings read as soft stripes, not ink lines
  const gp: [number, number][] = [[0, 320], [25, 320]];
  for (let ry = 318; ry > 126; ry -= 2) gp.push([25, ry]);
  gp.push([25, 126], [0, 126]);
  const grip = lathe(gp, new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: ramp, vertexColors: true }));
  const pos = grip.geometry.attributes.position, cols: number[] = [];
  const cA = new THREE.Color('#5e48e0'), cB = new THREE.Color('#3a2c98');
  for (let i = 0; i < pos.count; i++) {
    const ry = pos.getY(i) / S + 440, band = ry > 140 && ry < 312 && ((ry - 140) % 20) < 5;
    const c = band ? cB : cA; cols.push(c.r, c.g, c.b);
  }
  grip.geometry.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  lathe([[0, 128], [22, 128], [34, 124], [40, 112], [38, 100], [28, 92], [20, 90], [22, 80], [20, 68], [12, 60], [0, 58]], HILT);
  return g;
};

// ---------------------------------------------------------------- cartridge from the approved mock (116 x 76 x 18 mm)
const cartridge = () => {
  const g = new THREE.Group();
  const pts = (P.cartOutline ?? []).map(([x, y]) => new THREE.Vector2(x / 10 - 58, (760 - y) / 10));
  const shape = new THREE.Shape(pts);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 14, bevelEnabled: true, bevelThickness: 2, bevelSize: 1.6, bevelSegments: 3 });
  geo.translate(0, 0, -9);
  const body = new THREE.Mesh(geo, toon('#c9a446'));
  body.userData.part = 90;
  ids.push(body);
  g.add(body);
  if (P.cartTexture) {
    const tex = new THREE.TextureLoader().load(P.cartTexture, () => draw());
    tex.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(116, 76), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5 }));
    face.position.set(0, 38, 7.2);
    face.userData.part = 91;
    face.userData.textured = true;
    ids.push(face);
    g.add(face);
  }
  return g;
};

// ---------------------------------------------------------------- CRT television (late 90s, ~21"), screen facing +z
/** Dark-grey 90s CRT: rounded front bezel, recessed convex screen, tapered tube housing, small control strip with a
 *  power LED. The screen is an unlit key colour (#00ff00) so the animatic can composite any picture into it. */
const crt = () => {
  const g = new THREE.Group();
  const SHELL = toon('#3b3b42'), INNER = toon('#232328');
  const front = (w: number, h: number, r: number, d: number, z: number, mat: THREE.Material, part: number, hole?: THREE.Path) => {
    const s = roundedRect(w, h, r); if (hole) s.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 4, bevelSize: 4, bevelSegments: 4, curveSegments: 16 });
    geo.translate(0, 0, z);
    const m = new THREE.Mesh(geo, mat); m.userData.part = part; ids.push(m); return m;
  };
  const W_ = 540, H_ = 450, SW = 412, SH = 310, SY = 30;            // outer size, screen size, screen centre offset (up)
  const holePath = (w: number, h: number, r: number, cy: number) => {
    const p = new THREE.Path(); const x0 = -w / 2, x1 = w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
    p.moveTo(x0 + r, y0); p.lineTo(x1 - r, y0); p.quadraticCurveTo(x1, y0, x1, y0 + r); p.lineTo(x1, y1 - r); p.quadraticCurveTo(x1, y1, x1 - r, y1);
    p.lineTo(x0 + r, y1); p.quadraticCurveTo(x0, y1, x0, y1 - r); p.lineTo(x0, y0 + r); p.quadraticCurveTo(x0, y0, x0 + r, y0); return p;
  };
  // bezel with the screen opening (roundedRect is centred; shift the opening up)
  g.add(front(W_, H_, 34, 50, -50, SHELL, 700, holePath(SW + 40, SH + 40, 30, SY)));
  g.add(front(SW + 44, SH + 44, 30, 6, -46, INNER, 701, holePath(SW, SH, 24, 0)));    // dark inner frame (moved up below)
  ids[ids.length - 1].position.y = SY;
  // convex screen
  const ss = roundedRect(SW, SH, 24);
  const sg = new THREE.ShapeGeometry(ss, 24);
  const sp = sg.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i) / (SW / 2), y = sp.getY(i) / (SH / 2);
    sp.setZ(i, -40 + 14 * (1 - 0.5 * x * x - 0.5 * y * y));
  }
  sg.computeVertexNormals();
  const screen = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: new THREE.Color('#00ff00') }));
  screen.position.y = SY; screen.userData.part = 702; ids.push(screen); g.add(screen);
  // tube housing: a box whose back end tapers
  const hg = new THREE.BoxGeometry(W_ - 40, H_ - 40, 400, 1, 1, 1);
  const hp = hg.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < hp.count; i++) if (hp.getZ(i) < 0) { hp.setX(i, hp.getX(i) * 0.62); hp.setY(i, hp.getY(i) * 0.66 + 20); }
  hg.translate(0, 0, -250); hg.computeVertexNormals();
  const housing = new THREE.Mesh(hg, SHELL); housing.userData.part = 703; ids.push(housing); g.add(housing);
  // control strip: buttons + power LED, speaker slots
  for (let i = 0; i < 4; i++) g.add(box(18, 7, 6, [60 + i * 26, -H_ / 2 + 34, 4], INNER, 704, 1.5));
  const led = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#7dff6a') }));
  led.position.set(186, -H_ / 2 + 34, 4); led.userData.part = 705; ids.push(led); g.add(led);
  for (let i = 0; i < 6; i++) g.add(box(70, 3, 4, [-150, -H_ / 2 + 22 + i * 8, 3], INNER, 706));
  g.position.y = H_ / 2 + 4;                                          // stands on y = 0
  return g;
};

// ---------------------------------------------------------------- Hyrule Castle seen from the field (Producer refs 2026-10-04)
/** docs/ep002/source/castle_refs: Castle Town's long grey wall with square crenellated towers, the gate between two towers
 *  with a lowered wooden drawbridge on chains over the moat; behind it, up on a green hill, the pale castle: a tall central
 *  spire, slender round towers with blue-slate cones, and a domed tower on the right. Front faces +z. Units: arbitrary. */
const hyruleCastle = () => {
  const g = new THREE.Group();
  const STONE = toon('#e4e1da'), STONE_D = toon('#c8c4bb'), PALE = toon('#f7f5f0'), ROOF = toon('#4c6187'), WOOD = toon('#7a5232'),
    DARK = toon('#2b2722'), GRASS = toon('#63a047'), WATER = toon('#5a95c2'), IRON = toon('#3a3a40');
  let part = 800;
  const crenels = (x0: number, x1: number, y: number, z: number, axis: 'x' | 'z', mat: THREE.Material) => {
    const n = Math.floor(Math.abs(x1 - x0) / 56);
    for (let i = 0; i <= n; i++) {
      const u = x0 + (x1 - x0) * i / n;
      g.add(axis === 'x' ? box(28, 26, 64, [u, y + 13, z], mat, part) : box(64, 26, 28, [z, y + 13, u], mat, part));
    }
    part++;
  };
  const sqTower = (x: number, z: number, w: number, h: number) => {
    g.add(box(w, h, w, [x, h / 2, z], STONE_D, part++));
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]])
      g.add(box(30, 30, 30, [x + dx * (w / 2 - 15), h + 15, z + dz * (w / 2 - 15)], STONE_D, part));
    part++;
  };
  // ground, moat
  g.add(box(2700, 6, 120, [0, 1, 430], WATER, part++));
  // Castle Town wall: front (with the gate), sides
  const WH = 210, FZ = 300, BZ = -420, WX = 1250;
  g.add(box(WX - 160, WH, 60, [-(WX + 160) / 2, WH / 2, FZ], STONE, part)); g.add(box(WX - 160, WH, 60, [(WX + 160) / 2, WH / 2, FZ], STONE, part)); part++;
  crenels(-WX, -160, WH, FZ + 16, 'x', STONE); crenels(160, WX, WH, FZ + 16, 'x', STONE);
  for (const sx of [-1, 1]) { g.add(box(60, WH, FZ - BZ, [sx * WX, WH / 2, (FZ + BZ) / 2], STONE, part++)); crenels(BZ, FZ, WH, sx * WX, 'z', STONE); }
  for (const [x, z] of [[-WX, FZ], [WX, FZ], [-WX, BZ], [WX, BZ], [-620, FZ], [620, FZ]]) sqTower(x, z, 150, 300);
  // gatehouse: two towers, dark arch, drawbridge down over the moat, chains
  sqTower(-120, FZ, 150, 330); sqTower(120, FZ, 150, 330);
  g.add(box(90, 130, 70, [0, WH + 25 + 40, FZ], STONE, part++));                // lintel above the opening
  g.add(box(92, 170, 40, [0, 85, FZ - 5], DARK, part++));                        // the opening (streets beyond)
  g.add(box(100, 10, 250, [0, 6, FZ + 155], WOOD, part++));                      // drawbridge, lowered
  for (let i = 0; i < 5; i++) g.add(box(100, 2, 4, [0, 12, FZ + 50 + i * 50], DARK, part));
  part++;
  for (const sx of [-1, 1]) {
    const a = new THREE.Vector3(sx * 70, 300, FZ + 40), b = new THREE.Vector3(sx * 46, 12, FZ + 278);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, a.distanceTo(b), 8), IRON);
    c.position.copy(a).add(b).multiplyScalar(.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    c.userData.part = part; ids.push(c); g.add(c);
  }
  part++;
  // the hill and the castle on it (behind the town)
  const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), GRASS);   // top half only
  hill.scale.set(900, 260, 520); hill.position.set(0, 0, -900); hill.userData.part = part++; ids.push(hill); g.add(hill);
  const CB = 230, CZ = -900;                                                     // castle base height and depth
  g.add(box(560, 300, 320, [0, CB + 150, CZ], PALE, part++));                    // main block
  g.add(box(760, 170, 200, [0, CB + 85, CZ + 150], PALE, part++));               // lower front wing
  const round = (x: number, z: number, r: number, h: number, roofH: number) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.05, h, 32), PALE); t.position.set(x, CB + h / 2, z); t.userData.part = part++; ids.push(t); g.add(t);
    const c = new THREE.Mesh(new THREE.ConeGeometry(r * 1.25, roofH, 32), ROOF); c.position.set(x, CB + h + roofH / 2, z); c.userData.part = part++; ids.push(c); g.add(c);
  };
  round(0, CZ - 20, 78, 720, 260);                                               // the tall central spire
  round(-230, CZ + 60, 55, 470, 170); round(230, CZ + 60, 55, 470, 170);
  round(-390, CZ + 150, 48, 330, 140); round(-130, CZ + 170, 40, 380, 130); round(130, CZ + 170, 40, 380, 130);
  round(-200, CZ - 120, 46, 560, 170);
  const dt = new THREE.Mesh(new THREE.CylinderGeometry(95, 95, 300, 32), PALE); dt.position.set(420, CB + 150, CZ + 110); dt.userData.part = part++; ids.push(dt); g.add(dt);
  const dm = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), PALE); dm.position.set(420, CB + 300, CZ + 110); dm.userData.part = part++; ids.push(dm); g.add(dm);
  // more volume (Producer: closer to the original): an upper tier, battlements, and a tighter cluster of towers
  g.add(box(380, 150, 220, [0, CB + 300 + 75, CZ - 20], PALE, part++));
  for (const [w, y, z, d] of [[560, CB + 300, CZ + 160, 320], [760, CB + 170, CZ + 250, 200], [380, CB + 450, CZ + 90, 220]]) {
    const n = Math.floor(w / 46);
    for (let i = 0; i <= n; i++) g.add(box(22, 22, 22, [-w / 2 + w * i / n, y + 11, z], PALE, part));
  }
  part++;
  round(-300, CZ - 60, 42, 430, 150); round(300, CZ - 60, 42, 430, 150);
  round(-70, CZ + 130, 30, 330, 110); round(70, CZ + 130, 30, 330, 110);
  round(-470, CZ + 70, 40, 280, 120); round(330, CZ + 200, 34, 260, 110);
  round(-380, CZ + 260, 28, 210, 90); round(380, CZ + 260, 28, 210, 90);       // front-wing corner turrets
  // windows on the main block and front wing
  for (let i = -3; i <= 3; i++) g.add(box(18, 40, 4, [i * 70, CB + 230, CZ + 161], DARK, part));
  for (let i = -4; i <= 4; i++) g.add(box(16, 30, 4, [i * 80, CB + 110, CZ + 251], DARK, part));
  part++;
  return g;
};

// ---------------------------------------------------------------- HUD item icons: bomb and boomerang (Producer 2026-10-04)
/** Classic round bomb: navy sphere, metal cap, short fuse with a lit tip. */
const bomb = () => {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(40, 48, 32), toon('#24357a')); b.userData.part = 900; ids.push(b); g.add(b);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(14, 16, 12, 32), toon('#9aa0ad')); cap.position.set(0, 42, 0); cap.userData.part = 901; ids.push(cap); g.add(cap);
  const f = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 18, 12), toon('#c9a46a')); f.position.set(4, 56, 0); f.rotation.z = -.35; f.userData.part = 902; ids.push(f); g.add(f);
  const fire = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffb02e') })); fire.position.set(8, 66, 0); fire.userData.part = 903; ids.push(fire); g.add(fire);
  const hl = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color('#8fa4e6') })); hl.position.set(-16, 18, 33); hl.scale.set(1, .7, .4); hl.userData.part = 900; ids.push(hl); g.add(hl);
  return g;
};

/** V-shaped boomerang: two blue arms with pale tips, a red gem at the elbow, faces +z. */
const boomerang = () => {
  const g = new THREE.Group();
  const sh = new THREE.Shape();                                  // one curved piece: outer edge over the elbow, inner edge back
  sh.moveTo(-100, -58);
  sh.quadraticCurveTo(-60, 40, 0, 46);
  sh.quadraticCurveTo(60, 40, 100, -58);
  sh.quadraticCurveTo(104, -72, 90, -70);
  sh.quadraticCurveTo(48, 6, 0, 12);
  sh.quadraticCurveTo(-48, 6, -90, -70);
  sh.quadraticCurveTo(-104, -72, -100, -58);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: true, bevelThickness: 3, bevelSize: 3, bevelSegments: 4, curveSegments: 24 });
  geo.translate(0, 0, -5);
  const body = new THREE.Mesh(geo, toon('#3f74c9')); body.userData.part = 910; ids.push(body); g.add(body);
  for (const sx of [-1, 1]) {                                    // pale tips on the front face
    const tip = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12), toon('#efe7c6')); tip.position.set(sx * 95, -60, 7); tip.scale.set(1, 1, .5);
    tip.userData.part = 911; ids.push(tip); g.add(tip);
  }
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(13), toon('#d8333b')); gem.position.set(0, 30, 9); gem.scale.set(1, 1, .45);
  gem.userData.part = 912; ids.push(gem); g.add(gem);
  return g;
};


// ---------------------------------------------------------------- Quest's own horse (animatic stand-in; final art = Higgsfield #13)
/** Toon horse, side-on along +x, ~1.6 m at the withers. Dapple-grey coat, charcoal mane and tail, blue saddle cloth:
 *  deliberately not Epona (chestnut, white mane). Legs hang on pivots so `pose` (0..1) gives a gallop cycle. */
const horseLegs: { hip: THREE.Group; knee: THREE.Group; off: number; front: boolean }[] = [];
let horseBody: THREE.Group | null = null;
const horse = () => {
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body); horseBody = body;
  const coat = toon('#b9bcc4'), dark = toon('#3b3b42'), hoofM = toon('#2a2522'), cloth = toon('#2f5fa8'), leather = toon('#6b4024');
  const add = (g: THREE.BufferGeometry, m: THREE.Material, part: number, at: V3, rot: V3 = [0, 0, 0], sc: V3 = [1, 1, 1], parent: THREE.Object3D = body) => {
    const o = new THREE.Mesh(g, m); o.position.set(...at); o.rotation.set(...rot); o.scale.set(...sc); o.userData.part = part; ids.push(o); parent.add(o); return o;
  };
  const Y = 1380;                                                                                              // withers ~1.65 m
  add(new THREE.CapsuleGeometry(280, 860, 12, 32), coat, 950, [0, Y, 0], [0, 0, Math.PI / 2]);              // barrel
  add(new THREE.SphereGeometry(310, 32, 24), coat, 950, [440, Y + 30, 0], [0, 0, 0], [1, 1.05, .9]);          // chest
  add(new THREE.SphereGeometry(330, 32, 24), coat, 950, [-470, Y + 50, 0], [0, 0, 0], [1.05, 1, .95]);        // hindquarters
  const nx = Math.sin(0.85), ny = Math.cos(0.85);                                                              // neck axis, leaning forward
  const n0: V3 = [560, Y + 160, 0];
  add(new THREE.CylinderGeometry(125, 215, 720, 24), coat, 951, [n0[0] + nx * 330, n0[1] + ny * 330, 0], [0, 0, -0.85]);
  const hx = n0[0] + nx * 700, hy = n0[1] + ny * 700;                                                          // poll (top of the head)
  add(new THREE.CapsuleGeometry(115, 360, 10, 24), coat, 952, [hx + 150, hy - 120, 0], [0, 0, -2.1]);          // head, nose down-forward
  add(new THREE.SphereGeometry(105, 20, 16), toon('#9a9ea7'), 952, [hx + 320, hy - 230, 0], [0, 0, 0], [1, .85, .9]);   // muzzle
  for (const z of [-55, 55]) {
    add(new THREE.ConeGeometry(36, 140, 12), coat, 953, [hx - 10, hy + 80, z], [0, 0, 0.15]);                 // ears
    add(new THREE.SphereGeometry(19, 12, 10), toon('#141418'), 954, [hx + 120, hy - 40, z * 1.9]);           // eyes
  }
  for (let i = 0; i < 9; i++) {                                                                               // mane: along the back of the neck
    const k = i / 8, px = n0[0] - 40 + nx * 760 * k - ny * 150, py = n0[1] + ny * 760 * k + nx * 150 - 30;
    add(new THREE.BoxGeometry(150, 230, 50), dark, 955, [px - 40, py, 0], [0, 0, -0.85 + 0.5 + 0.2 * Math.sin(i * 1.7)]);
  }
  add(new THREE.CapsuleGeometry(75, 260, 8, 16), dark, 956, [-850, Y - 20, 0], [0, 0, -0.95]);                  // tail: root off the croup,
  add(new THREE.CapsuleGeometry(100, 380, 8, 16), dark, 956, [-990, Y - 290, 0], [0, 0, -0.45], [1, 1, .7]);    // then a flowing sweep down
  add(new THREE.CapsuleGeometry(80, 300, 8, 16), dark, 956, [-1060, Y - 600, 0], [0, 0, -0.15], [1, 1, .6]);
  add(new THREE.BoxGeometry(600, 360, 600), cloth, 957, [-30, Y + 120, 0]);                                   // saddle cloth (shows on the flank)
  add(new THREE.CapsuleGeometry(120, 280, 8, 16), leather, 958, [-30, Y + 330, 0], [0, 0, Math.PI / 2], [1, .75, 2.2]);   // saddle
  add(new THREE.CylinderGeometry(14, 14, 420, 8), leather, 959, [-10, Y + 60, 310]);                          // stirrup strap
  const leg = (x: number, z: number, front: boolean, off: number) => {
    const hip = new THREE.Group(); hip.position.set(x, Y - 140, z); body.add(hip);
    add(new THREE.CylinderGeometry(125, 85, 560, 16), coat, 960, [0, -280, 0], [0, 0, 0], [1, 1, 1], hip);
    const knee = new THREE.Group(); knee.position.set(0, -540, 0); hip.add(knee);
    add(new THREE.CylinderGeometry(62, 55, 560, 14), coat, 961, [0, -280, 0], [0, 0, 0], [1, 1, 1], knee);
    add(new THREE.SphereGeometry(70, 12, 10), coat, 961, [0, 0, 0], [0, 0, 0], [1, 1, 1], knee);               // the joint
    add(new THREE.CylinderGeometry(72, 84, 110, 16), hoofM, 962, [0, -590, 0], [0, 0, 0], [1, 1, 1], knee);
    horseLegs.push({ hip, knee, off, front });
  };
  leg(460, 160, true, 0.55); leg(500, -160, true, 0.65); leg(-480, 160, false, 0.0); leg(-440, -160, false, 0.1);
  return root;
};

/** Gallop cycle: legs swing on their pivots, knees fold on the way forward, the body pitches and rises. */
const setGallop = (p: number) => {
  for (const L of horseLegs) {
    const a = 2 * Math.PI * (p + L.off);
    L.hip.rotation.z = (L.front ? 0.55 : 0.5) * Math.sin(a);
    L.knee.rotation.z = L.front ? -Math.max(0, 1.3 * Math.sin(a + 1.2)) : Math.max(0, 1.1 * Math.sin(a + 1.6));
  }
  if (horseBody) { horseBody.rotation.z = 0.07 * Math.sin(2 * Math.PI * p); horseBody.position.y = 60 * Math.max(0, Math.sin(2 * Math.PI * p + 0.6)); }
};

// ---------------------------------------------------------------- hero shield (Producer reference 2026-10-05)
/** Traced from docs/ep002/source/shield_reference_producer.jpg by shield_trace.py (left half, mirrored), units are
 *  reference pixels (602 wide), the face looks at +z. A silver body, the raised silver rim, the blue face, the silver
 *  horns, the gold triangles and the red bird (the royal crest) as stacked extrusions; the small rim triangles and the
 *  rivets were measured by hand on the reference (x - 360, 601.5 - y). */
const heroShield = () => {
  const g = new THREE.Group();
  const L = P.shield!;
  const shape = (p: Poly) => {
    const s = new THREE.Shape(p.outer.map(([x, y]) => new THREE.Vector2(x, y)));
    p.holes.forEach((h) => s.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y)))));
    return s;
  };
  const layer = (key: string, z0: number, depth: number, bevel: number, hex: string, part: number) => L[key].forEach((p, i) => {
    const geo = new THREE.ExtrudeGeometry(shape(p), { depth: Math.max(0.2, depth - 2 * bevel), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 4 });
    geo.translate(0, 0, z0 + bevel);
    const m = new THREE.Mesh(geo, toon(hex));
    m.userData.part = part + i;
    ids.push(m); g.add(m);
  });
  layer('body', 0, 14, 0, '#c9cbd0', 900);
  layer('field', 13.5, 2, 0, '#2a3cc4', 910);
  layer('rim', 13, 16, 6, '#dfe1e5', 920);
  layer('horns', 15, 10, 4, '#d4d6db', 930);
  layer('tri', 15, 9, 3.5, '#f2cf2a', 940);
  layer('bird', 15, 1.6, 0, '#c8202c', 950);
  const tri = (pts: [number, number][], part: number) => {
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x - 360, 601.5 - y))), { depth: 0.5, bevelEnabled: true, bevelThickness: 3, bevelSize: 2.5, bevelSegments: 1 });
    geo.translate(0, 0, 29);
    const m = new THREE.Mesh(geo, toon('#b9bcc2')); m.userData.part = part; ids.push(m); g.add(m);
  };
  const mir = (pts: [number, number][]) => pts.map(([x, y]) => [720 - x, y] as [number, number]).reverse();
  const top = [[344, 269], [376, 269], [360, 332]] as [number, number][];
  const side = [[306, 302], [338, 333], [327, 286]] as [number, number][];
  const corner = [[146, 741], [161, 758], [179, 729]] as [number, number][];
  tri(top, 960); tri(side, 961); tri(mir(side), 962); tri(corner, 963); tri(mir(corner), 964);
  ([[105, 420, 12], [615, 420, 12], [360, 911, 15]] as const).forEach(([x, y, r], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#e8e9ec'));
    m.rotation.x = Math.PI / 2; m.position.set(x - 360, 601.5 - y, 28);
    m.userData.part = 970 + i; ids.push(m); g.add(m);
  });
  return g;
};

// ---------------------------------------------------------------- scabbard for the sword v2 (adult Quest's back gear)
/** Brown leather scabbard in the sword's own frame (blade along +y from the guard at y = 0 to the tip at 345): a
 *  tapered body a little wider and thicker than the blade, a steel throat band under the guard and a steel chape at
 *  the tip. Rendered together with the sword, only the hilt shows above it. */
const scabbard = () => {
  const g = new THREE.Group();
  const L = 352, w0 = 26, w1 = 22;
  const sh = new THREE.Shape();
  sh.moveTo(-w0, -2); sh.lineTo(w0, -2); sh.lineTo(w1, L - 26); sh.quadraticCurveTo(w1 * .6, L, 0, L + 6);
  sh.quadraticCurveTo(-w1 * .6, L, -w1, L - 26); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: true, bevelThickness: 3, bevelSize: 2.5, bevelSegments: 3, curveSegments: 12 });
  geo.translate(0, 0, -8);
  const body = new THREE.Mesh(geo, toon('#6e4426')); body.userData.part = 1100; ids.push(body); g.add(body);
  const steel = toon('#a7acb6');
  g.add(box(2 * w0 + 6, 16, 22, [0, 8, -3], steel, 1101, 2));                  // throat band
  const ch = new THREE.Shape(); ch.moveTo(-w1 - 2, L - 40); ch.lineTo(w1 + 2, L - 40); ch.lineTo(w1 * .7, L - 6); ch.lineTo(0, L + 10); ch.lineTo(-w1 * .7, L - 6); ch.closePath();
  const cg = new THREE.ExtrudeGeometry(ch, { depth: 10, bevelEnabled: true, bevelThickness: 2.5, bevelSize: 2, bevelSegments: 2 });
  cg.translate(0, 0, -8);
  const chape = new THREE.Mesh(cg, steel); chape.userData.part = 1102; ids.push(chape); g.add(chape);
  for (const y of [120, 236]) g.add(box(2 * w0 - 2, 7, 21, [0, y, -3], toon('#4e2f1a'), 1103, 1));   // stitched bands
  return g;
};

// ---------------------------------------------------------------- EP003 (How to Fish): our own generic props, no game art
// v2 (2026-10-12, "top de top" pass): planks with wood grain, ribs, oarlocks; reel, guides and line; dents and ribs on the
// can; paper wrap and twine on the dynamite; striped chips; a waving flag; a glowing hurricane lantern.
// Helpers below are shared by the v2 props. Grain and cork are procedural textures (no image files), multiplied with
// vertex-colour gradients (darker towards the bottom, like soft occlusion).
const TAU = Math.PI * 2;
const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, part: number) => { const m = new THREE.Mesh(geo, mat); m.userData.part = part; ids.push(m); return m; };
const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const dataTex = (w: number, h: number, f: (u: number, v: number) => number) => {
  const d = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, L = Math.round(255 * Math.max(0, Math.min(1, f(x / w, y / h)))); d[i] = d[i + 1] = d[i + 2] = L; d[i + 3] = 255; }
  const t = new THREE.DataTexture(d, w, h);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true;
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true;
  return t;
};
let _grain: THREE.DataTexture | null = null, _cork: THREE.DataTexture | null = null;
/** Wood grain: streaks along u, swerving around a few knots; tileable. */
const grainTex = () => (_grain ??= dataTex(512, 256, (u, v) => {
  let s = v * 6 + .22 * Math.sin(TAU * (u * 2 + v)) + .1 * Math.sin(TAU * (u * 5 + 2 * v) + 1.7) + .04 * Math.sin(TAU * u * 13);
  for (const [ku, kv] of [[.3, .4], [.78, .82], [.55, .12]]) { let du = u - ku, dv = v - kv; du -= Math.round(du); dv -= Math.round(dv); s += .55 * Math.exp(-((du * 10) ** 2 + (dv * 20) ** 2)); }
  const f = s - Math.floor(s);
  const line = Math.max(0, 1 - Math.abs(f - .5) / .085);
  const broad = .5 + .5 * Math.sin(TAU * (v * 2 + .3 * Math.sin(TAU * u)));
  return 1 - .2 * line - .07 * broad;
}));
/** Cork: dark flecks and a ring every 1/9 of the grip. */
const corkTex = () => (_cork ??= dataTex(256, 256, (u, v) => {
  const n = hash(Math.floor(u * 90), Math.floor(v * 90)), m = hash(Math.floor(u * 30) + 7, Math.floor(v * 30) + 3);
  const ring = Math.abs(((v * 9) % 1) - .5) > .47 ? .8 : 1;
  return (n > .86 ? .62 : n > .7 ? .85 : 1) * (m > .8 ? .9 : 1) * ring;
}));
const woodMat = (hex: string, vc = false) => new THREE.MeshToonMaterial({ color: new THREE.Color(hex), map: grainTex(), gradientMap: ramp, vertexColors: vc });
const vtoon = (hex = '#ffffff') => new THREE.MeshToonMaterial({ color: new THREE.Color(hex), gradientMap: ramp, vertexColors: true });
/** Per-vertex colour (a grey multiplier or a colour) from the position. */
const vcol = (geo: THREE.BufferGeometry, f: (x: number, y: number, z: number, i: number) => number | THREE.Color) => {
  const p = geo.attributes.position, c: number[] = [];
  for (let i = 0; i < p.count; i++) { const r = f(p.getX(i), p.getY(i), p.getZ(i), i); if (typeof r === 'number') c.push(r, r, r); else c.push(r.r, r.g, r.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
  return geo;
};
const uvScale = (geo: THREE.BufferGeometry, su: number, sv: number, ou = 0, ov = 0) => {
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su + ou, uv.getY(i) * sv + ov);
  return geo;
};
/** A quad grid over parameter lists (us x vs); f gives the position, uv and colour of each vertex. */
const grid = <T>(us: number[], vs: T[], f: (u: number, v: T) => { p: THREE.Vector3; uv?: [number, number]; c?: number | THREE.Color }) => {
  const pos: number[] = [], uv: number[] = [], col: number[] = [], idx: number[] = [];
  for (const u of us) for (const v of vs) {
    const r = f(u, v); pos.push(r.p.x, r.p.y, r.p.z); uv.push(...(r.uv ?? [0, 0]));
    const c = r.c ?? 1; if (typeof c === 'number') col.push(c, c, c); else col.push(c.r, c.g, c.b);
  }
  const nv = vs.length;
  for (let i = 0; i < us.length - 1; i++) for (let j = 0; j < nv - 1; j++) { const a = i * nv + j, b = a + nv; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
};
/** Flip the winding if the normals mostly point against probe(p) (the side that must face out). */
const orient = (geo: THREE.BufferGeometry, probe: (p: THREE.Vector3) => THREE.Vector3) => {
  const p = geo.attributes.position, n = geo.attributes.normal, v = new THREE.Vector3();
  let s = 0;
  for (let i = 0; i < p.count; i++) s += probe(v.set(p.getX(i), p.getY(i), p.getZ(i))).dot(new THREE.Vector3(n.getX(i), n.getY(i), n.getZ(i)));
  if (s < 0) {
    const ix = geo.index!.array as Uint16Array | Uint32Array;
    for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
    geo.index!.needsUpdate = true; geo.computeVertexNormals();
  }
  return geo;
};
const lathe = (pts: [number, number][], seg: number, mat: THREE.Material, part: number) =>
  mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), mat, part);
const tube = (pts: THREE.Vector3[] | THREE.Curve<THREE.Vector3>, r: number, mat: THREE.Material, part: number, segs = 64, radial = 8, closed = false) =>
  mesh(new THREE.TubeGeometry(Array.isArray(pts) ? new THREE.CatmullRomCurve3(pts, closed) : pts, segs, r, radial, closed), mat, part);
/** Twisted strands on a tube (rope, twine, braided fuse): alternate light/dark along a helix. */
const ropeCol = (geo: THREE.BufferGeometry, segs: number, radial: number, twists: number, dark = .72) =>
  vcol(geo, (_x, _y, _z, i) => { const a = Math.floor(i / (radial + 1)) / segs, b = (i % (radial + 1)) / radial; return ((a * twists + b * 2) % 1) < .5 ? 1 : dark; });
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const sstep = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** A small wooden rowboat (~3 m long, cm units), bow towards +x, transom stern at -x. Clinker planks (5 strakes a side,
 * the top one painted), a lighter wooden interior with seams, ribs, risers, three thwarts, floorboards, a bow deck,
 * keel and stem, gunwale rails, bronze oarlocks and two oars trailing in them (painted blade tips).
 * Every mesh is tagged userData.half = 'front' (the near, +z hull side, rail, oarlock and oar) or 'back' (everything else),
 * so shot.boat = 'back' | 'front' renders the layers that sandwich seated characters (render.py job ep003_props). */
const rowboat = () => {
  const g = new THREE.Group();
  const L = 300, B = 124, D = 46, S = 5, INS = 2.6, STEP = .9;
  const halfW = (u: number) => u < .42 ? B / 2 * (1 - .27 * ((.42 - u) / .42) ** 2) : B / 2 * Math.pow(Math.max(0, 1 - ((u - .42) / .58) ** 2), .62);
  const rimY = (u: number) => u > .45 ? D + 3 + 15 * ((u - .45) / .55) ** 2.2 : D + 3 + 5 * ((.45 - u) / .45) ** 2;
  const botY = (u: number) => u > .55 ? 2 + D * .62 * ((u - .55) / .45) ** 2.4 : 2 + 4 * ((.55 - u) / .55) ** 2;
  const taper = (u: number) => Math.min(1, Math.max(0, (1 - u) / .09));
  const N2 = 2.8, sec0 = (u: number, th: number): [number, number] => [halfW(u) * (1 - .14 * Math.pow(Math.sin(th), 2 / N2)) * Math.pow(Math.cos(th), 2 / N2), (rimY(u) - botY(u)) * Math.pow(Math.sin(th), 2 / N2)];
  const arc: number[] = [0];                                            // s = arc length fraction along the mid section,
  for (let i = 1; i <= 400; i++) { const a = sec0(.45, (i - 1) / 400 * Math.PI / 2), b = sec0(.45, i / 400 * Math.PI / 2); arc.push(arc[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const thOf = (s: number) => {                                         // so the strakes come out equally wide
    const t = Math.min(1, Math.max(0, s)) * arc[400]; let i = 1; while (i < 400 && arc[i] < t) i++;
    return ((i - 1) + (t - arc[i - 1]) / Math.max(1e-9, arc[i] - arc[i - 1])) / 400 * Math.PI / 2;
  };
  const base = (u: number, s: number): [number, number] => {          // section (z, y) for the +z side; s 0 rim .. 1 keel
    const th = thOf(s), n = N2;
    const zf = Math.pow(Math.cos(th), 2 / n), yf = Math.pow(Math.sin(th), 2 / n);
    const top = rimY(u), bot = botY(u);
    return [halfW(u) * (1 - .14 * yf) * zf, top - (top - bot) * yf];
  };
  const hp = (u: number, s: number, side: number, off: number) => {    // hull point, offset along the section normal
    // (outward plank offsets keep 30 % at the bow so the laps never become coplanar; the stem covers the joint)
    const e = 2e-3, a = base(u, Math.max(0, s - e)), b = base(u, Math.min(1, s + e)), c = base(u, s);
    const tz = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tz, ty) || 1;
    const o = off * (off > 0 ? .3 + .7 * taper(u) : taper(u));
    return V((u - .5) * L, c[1] + o * (tz / l), side * (c[0] + o * (-ty / l)));
  };
  const half = (m: THREE.Mesh, h: 'front' | 'back') => (m.userData.half = h, m);
  const NU = 96, us = Array.from({ length: NU + 1 }, (_, i) => i / NU);
  // outer planks (clinker: each strake laps over the one below, with a small lip)
  const plank = ['#3f7d84', '#a3693a', '#93602f', '#a86f3e', '#8e5a2d'];
  for (const side of [1, -1]) for (let k = 0; k < S; k++) {
    const s0 = k / S - (k ? .3 / S : 0), s1 = (k + 1) / S, ok = STEP * (S - 1 - k), on = STEP * (S - 2 - k);
    const rows: [number, number][] = [];
    for (let j = 0; j <= 6; j++) rows.push([s0 + (s1 - s0) * j / 6, ok]);
    if (k < S - 1) rows.push([s1, ok], [s1, on - .4]);                // the lip tucks under the next strake
    const geo = grid(us, rows, (u, [s, o]) => { const p = hp(u, s, side, o); return { p, uv: [p.x / 170 + k * .37 + (side > 0 ? 0 : .5), (s - s0) * 2.2 + k * .29], c: .74 + .26 * (1 - s) }; });
    orient(geo, () => V(0, -.3, side));
    g.add(half(mesh(geo, woodMat(plank[k], true), 1500 + k + (side > 0 ? 0 : 5)), side > 0 ? 'front' : 'back'));
  }
  // interior skin: lighter wood, dark seams between strakes, darker towards the keel
  const sl: number[] = [];
  for (let k = 0; k < S; k++) { sl.push(k / S); for (let j = 1; j < 6; j++) sl.push(k / S + (j === 1 ? .012 : j === 5 ? 1 / S - .012 : (j - 1) / 4 / S)); }
  sl.push(1);
  const rows: [number, number][] = [...sl.map((s) => [s, 1] as [number, number]), ...sl.slice(0, -1).reverse().map((s) => [s, -1] as [number, number])];
  const seam = (s: number) => (sl.indexOf(s) % 6 === 0 && s > 0 && s < 1 ? .6 : 1);
  const inner = grid(us, rows, (u, [s, side]) => { const p = hp(u, s, side, -INS); return { p, uv: [p.x / 170 + .21, s * 2.4 + (side > 0 ? 0 : .5)], c: (.7 + .3 * (1 - s)) * seam(s) }; });
  orient(inner, (p) => V(0, .3, -Math.sign(p.z)));
  g.add(half(mesh(inner, woodMat('#c58c58', true), 1510), 'back'));
  // transom (flat stern board) with a cap above the rim
  const tp: THREE.Vector2[] = [];
  for (let j = 0; j <= 16; j++) { const p = hp(0, j / 16, 1, STEP * (S - 1) + .6); tp.push(new THREE.Vector2(p.z, p.y + (j === 0 ? 2.5 : 0))); }
  for (let j = 15; j >= 0; j--) { const p = hp(0, j / 16, -1, STEP * (S - 1) + .6); tp.push(new THREE.Vector2(p.z, p.y + (j === 0 ? 2.5 : 0))); }
  const tg = new THREE.ExtrudeGeometry(new THREE.Shape(tp), { depth: 4, bevelEnabled: false, curveSegments: 4 });
  uvScale(tg, 1 / 90, 1 / 30); tg.rotateY(-Math.PI / 2); tg.translate(-L / 2 + 2, 0, 0);
  vcol(tg, (_x, y) => .78 + .22 * Math.min(1, y / 50));
  g.add(half(mesh(tg, woodMat('#8a5530', true), 1511), 'back'));
  // keel and stem post (proud of the planks), knob on the stem head
  const dark = woodMat('#6a4126');
  const keel = Array.from({ length: 40 }, (_, i) => hp(-.005 + i / 39 * .99, 1, 1, 0).add(V(0, -.6, 0)));
  const kt = tube(keel, 2.3, dark, 1512, 80, 8); uvScale(kt.geometry, 4, .3); g.add(half(kt, 'front'));
  const stem = Array.from({ length: 12 }, (_, i) => { const s = 1 - i / 11, p = hp(1, s, 1, 0); return p.add(V(1.2 + 1.5 * (1 - s), 0, 0)); });
  stem.push(V(L / 2 + 3.4, rimY(1) + 6, 0));
  const st = tube(stem, 2.8, dark, 1512, 40, 8); uvScale(st.geometry, 2, .3); g.add(half(st, 'front'));
  g.add(half(at(mesh(new THREE.SphereGeometry(3.3, 16, 12), dark, 1512), L / 2 + 3.4, rimY(1) + 6.5, 0), 'front'));
  g.add(half(at(mesh(new THREE.SphereGeometry(2.4, 12, 10), dark, 1512), keel[39].x, keel[39].y, 0), 'front'));
  // gunwale rails (cap the plank tops), with rounded ends
  const railMat = woodMat('#6e4428');
  for (const side of [1, -1]) {
    const pts = Array.from({ length: 50 }, (_, i) => hp(-.012 + i / 49 * 1.0, 0, side, (STEP * (S - 1) - INS) / 2).add(V(0, 1.0, 0)));
    const r = tube(pts, 3.1, railMat, side > 0 ? 1513 : 1514, 120, 10); uvScale(r.geometry, 5, .4);
    g.add(half(r, side > 0 ? 'front' : 'back'));
    g.add(half(at(mesh(new THREE.SphereGeometry(3.1, 12, 10), railMat, side > 0 ? 1513 : 1514), pts[0].x, pts[0].y, pts[0].z), side > 0 ? 'front' : 'back'));
  }
  // ribs (frames) inside, risers along the sides
  const ribMat = woodMat('#7c4b29');
  for (const ur of [.08, .24, .32, .4, .56, .64, .84]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) { const t = -1 + i / 30, s = .05 + .95 * (1 - Math.abs(t)); pts.push(hp(ur, s, t < 0 ? -1 : 1, -(INS + 2.0))); }
    const r = tube(pts, 1.4, ribMat, 1515, 160, 6); uvScale(r.geometry, 3, .3); g.add(half(r, 'back'));
  }
  const SR = .3;
  for (const side of [1, -1]) {
    const pts = Array.from({ length: 30 }, (_, i) => hp(.06 + i / 29 * .8, SR, side, -(INS + 1.7)));
    const r = tube(pts, 1.4, ribMat, 1516, 80, 6); uvScale(r.geometry, 4, .3); g.add(half(r, 'back'));
  }
  // thwarts (benches) resting on the risers, a post under the rowing thwart
  const innerZ = (u: number, y: number) => {                         // inner skin half-width at height y
    let lo = 0, hi = .7;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (hp(u, m, 1, -INS).y > y) lo = m; else hi = m; }
    return hp(u, lo, 1, -INS).z;
  };
  const benchCol = ['#b98250', '#c08a56', '#b47c4a'];
  [[.17, 26], [.47, 20], [.75, 17]].forEach(([ub, wide], i) => {
    const p = hp(ub, SR, 1, -(INS + 1.7)), y = p.y + 1.4 + 1.8, len = 2 * Math.min(innerZ(ub - wide / 2 / L, y + 1.8), innerZ(ub + wide / 2 / L, y + 1.8)) + 1.6;
    const b = box(len, 3.6, wide, [0, 0, 0], woodMat(benchCol[i], false), 1517 + i, .8);
    uvScale(b.geometry, 1 / 110, 1 / 45, i * .3, i * .2);
    b.rotation.y = Math.PI / 2; b.position.set(p.x, y, 0); g.add(half(b, 'back'));
  });
  // floorboards
  const fy = Math.max(...[.13, .3, .45, .6, .66].map((u) => { let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (hp(u, m, 1, -INS).z > 23) lo = m; else hi = m; } return hp(u, lo, 1, -INS).y; })) + 2.6;
  for (const z of [-17, 0, 17]) {
    const f = box(159, 1.6, 12, [(.395 - .5) * L, fy + .8, z], woodMat('#a87447', false), z === 0 ? 1521 : 1520, .5);
    uvScale(f.geometry, 1 / 120, 1 / 40, z * .013, z * .021); g.add(half(f, 'back'));
  }
  const post = cyl(1.7, 1, [0, 0, 0], [0, 0, 0], ribMat, 1515);
  { const y0 = fy + 1.6, y1 = hp(.47, SR, 1, 0).y + 1.4; post.scale.y = y1 - y0; post.position.set((.47 - .5) * L, (y0 + y1) / 2, 0); g.add(half(post, 'back')); }
  // bow deck (breasthook) following the sheer
  const bh = new THREE.Shape();
  const bu = Array.from({ length: 14 }, (_, i) => .86 + i / 13 * .14);
  bu.forEach((u, i) => { const p = hp(u, .02, 1, -INS + 1); (i ? bh.lineTo.bind(bh) : bh.moveTo.bind(bh))(p.x, -p.z); });
  [...bu].reverse().forEach((u) => { const p = hp(u, .02, 1, -INS + 1); bh.lineTo(p.x, p.z); });
  const bg = new THREE.ExtrudeGeometry(bh, { depth: 2.6, bevelEnabled: false });
  uvScale(bg, 1 / 80, 1 / 30); bg.rotateX(-Math.PI / 2);
  const bp = bg.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < bp.count; i++) bp.setY(i, bp.getY(i) + rimY(bp.getX(i) / L + .5) - 3.4);
  bg.computeVertexNormals(); vcol(bg, () => 1);
  g.add(half(mesh(bg, woodMat('#a06a3c', true), 1522), 'back'));
  // oarlocks on the rails, oars trailing aft (blades feathered flat)
  const UO = .4, bronze = toon('#8a6a3a'), leather = toon('#dcc69c');
  const hw = (x: number) => x < 112 ? 1.9 + 5.6 * sstep(100, 112, x) : x < 146 ? 7.5 : 7.5 * Math.sqrt(Math.max(0, 1 - ((x - 146) / 4.2) ** 2));
  const bladeShape = (x0: number, x1: number) => {
    const s = new THREE.Shape(), n = 24;
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; i ? s.lineTo(x, hw(x)) : s.moveTo(x, hw(x)); }
    for (let i = n; i >= 0; i--) { const x = x0 + (x1 - x0) * i / n; s.lineTo(x, -hw(x)); }
    return s;
  };
  for (const side of [1, -1]) {
    const h: 'front' | 'back' = side > 0 ? 'front' : 'back', id = side > 0 ? 0 : 7;
    const R = hp(UO, 0, side, (STEP * (S - 1) - INS) / 2).add(V(0, 1.0, 0));
    g.add(half(box(10, 2, 7, [R.x, R.y + 3.6, R.z], woodMat('#5e3a22', false), 1523 + id, .5), h));
    const U = mesh(new THREE.TorusGeometry(3.0, .7, 8, 20, Math.PI), bronze, 1524 + id);
    U.rotation.set(0, Math.PI / 2, Math.PI); U.position.set(R.x, R.y + 4.6 + 3.7, R.z); g.add(half(U, h));
    g.add(half(cyl(.8, 3, [R.x, R.y + 5.6, R.z], [0, 0, 0], bronze, 1524 + id), h));
    const pivot = V(R.x, R.y + 4.6 + 3.7 - 3.0 + .7 + 2.1, R.z);
    const yaw = THREE.MathUtils.degToRad(10), pitch = THREE.MathUtils.degToRad(14);
    const dx = V(-Math.cos(pitch) * Math.cos(yaw), -Math.sin(pitch), side * Math.cos(pitch) * Math.sin(yaw)).normalize();
    const dy = V(0, 1, 0).sub(dx.clone().multiplyScalar(dx.y)).normalize(), dz = dx.clone().cross(dy);
    const oar = new THREE.Group();
    oar.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(dx, dy, dz)); oar.position.copy(pivot);
    const along = (r0: number, r1: number, x0: number, x1: number, mat: THREE.Material, part: number) => {
      const c = new THREE.CylinderGeometry(r1, r0, x1 - x0, 18, 4); c.rotateZ(-Math.PI / 2); c.translate((x0 + x1) / 2, 0, 0);
      uvScale(c, 1, (x1 - x0) / 60); return mesh(c, mat, part);
    };
    const oarWood = woodMat('#c99a63', false);
    oar.add(half(along(1.75, 1.75, -54, -40, woodMat('#5a3a22', false), 1525 + id), h));
    oar.add(half(at(mesh(new THREE.SphereGeometry(1.75, 12, 10), woodMat('#5a3a22', false), 1525 + id), -54, 0, 0), h));
    oar.add(half(along(2.1, 1.9, -40, 108, oarWood, 1526 + id), h));
    oar.add(half(along(2.65, 2.65, -6, 6, leather, 1527 + id), h));
    for (const [x0, x1, mat, part] of [[100, 138, oarWood, 1528 + id], [138, 150.2, woodMat('#3f7d84', false), 1529 + id]] as [number, number, THREE.Material, number][]) {
      const bgeo = new THREE.ExtrudeGeometry(bladeShape(x0, x1), { depth: .9, bevelEnabled: true, bevelThickness: .3, bevelSize: .3, bevelSegments: 2 });
      uvScale(bgeo, 1 / 60, 1 / 20); bgeo.rotateX(-Math.PI / 2); bgeo.translate(0, -.45, 0); bgeo.rotateX(-.5);   // blade turned half square, its face shows
      oar.add(half(mesh(bgeo, mat, part), h));
    }
    g.add(oar);
  }
  return g;
};

/** A fishing rod (cm), butt at y = 0, tip up at y = 212: rubber butt cap, cork grips with rings and flecks, a metal reel
 * seat, gold winding check and thread wraps, a deep blue blank fading lighter to the tip, eight wire guides on feet with
 * dark inserts, a spinning reel (body, rotor, spool full of line, bail, crank and knob) and the line running from the spool
 * through every guide, with a little slack past the tip. Guides and reel on +x. */
const fishingRod = () => {
  const g = new THREE.Group();
  const cork = new THREE.MeshToonMaterial({ color: new THREE.Color('#d6aa74'), map: corkTex(), gradientMap: ramp });
  const metal = toon('#3a404b'), silver = toon('#c3c8d0'), gold = toon('#d0a443'), rubber = toon('#2a2b30');
  g.add(lathe([[0, 0], [2.4, 0], [2.85, .5], [3.0, 1.4], [2.95, 2.7], [2.7, 3.3], [0, 3.3]], 40, rubber, 1570));
  g.add(lathe([[0, 3.2], [2.7, 3.2], [2.95, 6], [3.05, 11], [2.95, 17], [2.7, 24], [2.45, 30.2], [0, 30.2]], 40, cork, 1571));
  g.add(lathe([[0, 30], [2.1, 30], [2.1, 41], [0, 41]], 32, metal, 1572));
  g.add(lathe([[0, 30], [2.5, 30], [2.6, 30.6], [2.6, 32.2], [2.2, 32.8], [0, 32.8]], 32, silver, 1573));
  g.add(lathe([[0, 38.4], [2.2, 38.4], [2.6, 39], [2.6, 41], [0, 41]], 32, silver, 1573));
  g.add(lathe([[0, 41], [2.45, 41], [2.45, 43.2], [0, 43.2]], 32, gold, 1574));
  g.add(lathe([[0, 43.2], [2.3, 43.2], [2.2, 47], [1.85, 51], [0, 51]], 32, cork, 1576));
  g.add(lathe([[0, 51], [1.95, 51], [1.95, 52], [0, 52]], 24, gold, 1574));
  const rb = (y: number) => 1.55 - 1.1 * (y - 52) / 160;                 // blank radius at height y
  const blank = new THREE.CylinderGeometry(rb(212), rb(52), 160, 20, 40); blank.translate(0, 132, 0);
  const deep = new THREE.Color('#1d4b7d'), light = new THREE.Color('#4a8ac2');
  vcol(blank, (_x, y) => deep.clone().lerp(light, Math.max(0, (y - 52) / 160) ** 1.5));
  g.add(mesh(blank, vtoon(), 1575));
  // decorative thread wrap above the fore grip: gold - red - gold
  [[53, 55.5, gold], [55.5, 56.4, toon('#a5302a')], [56.4, 57.4, gold]].forEach(([y0, y1, m]) => g.add(lathe([[0, y0 as number], [rb(y0 as number) + .14, y0 as number], [rb(y1 as number) + .14, y1 as number], [0, y1 as number]], 24, m as THREE.Material, m === gold ? 1574 : 1577)));
  // guides: ring on a two-legged foot, thread wraps on the blank
  const guides = [[75, 2.7, 6.2], [101, 2.1, 4.8], [124, 1.6, 3.8], [145, 1.25, 3.1], [163, 1.0, 2.6], [179, 0.85, 2.2], [193, 0.75, 1.9], [204, 0.65, 1.6]];
  const ring = (R: number, tr: number, c: THREE.Vector3, mat: THREE.Material, part: number) => { const t = mesh(new THREE.TorusGeometry(R, tr, 8, 28), mat, part); t.rotation.x = Math.PI / 2; t.position.copy(c); return t; };
  const centres: THREE.Vector3[] = [];
  for (const [y, R, h] of guides) {
    const c = V(rb(y) + h, y, 0); centres.push(c);
    g.add(ring(R, Math.max(.2, R * .14), c, silver, 1578));
    if (R > 1.2) g.add(ring(R - R * .14 - .16, .16, c, toon('#25272c'), 1579));
    const foot = V(c.x - R, y, 0);
    for (const dy of [-1, 1]) g.add(tube([V(rb(y + dy * 2.4 * R), y + dy * 2.4 * R, 0), V((rb(y) + foot.x) / 2, y + dy * 1.2 * R, 0), foot], .2 + .05 * R, silver, 1578, 8, 6));
    g.add(lathe([[0, y - 2.6 * R - .6], [rb(y) + .15, y - 2.6 * R - .6], [rb(y) + .15, y - 2.6 * R + .9], [0, y - 2.6 * R + .9]], 20, toon('#a5302a'), 1577));
  }
  const tipC = V(rb(212) + .7, 212.6, 0);
  g.add(ring(.55, .18, tipC, silver, 1578));
  g.add(tube([V(0, 211, 0), V(tipC.x - .5, 212.6, 0)], .18, silver, 1578, 4, 6));
  // spinning reel hanging on the +x side of the seat, spool facing the tip
  const rx = 9.5, ry = 30.5;
  g.add(tube([V(2, 35.5, 0), V(4.5, 35, 0), V(7, 33.5, 0), V(rx - .5, ry + 1, 0)], .9, metal, 1580, 12, 10));
  g.add(box(1.0, 6.5, 2.2, [2.4, 35.6, 0], metal, 1580, .3));
  const body = mesh(new THREE.SphereGeometry(3.4, 28, 18), toon('#30353f'), 1581); body.scale.set(1, 1.15, .85); body.position.set(rx, ry, 0); g.add(body);
  g.add(lathe([[0, ry + 2.4], [2.6, ry + 2.4], [3.3, ry + 3.6], [3.4, ry + 5.6], [0, ry + 5.6]], 36, toon('#454c58'), 1582).translateX(rx));
  g.add(lathe([[0, ry + 5.6], [3.6, ry + 5.6], [3.6, ry + 6.0], [3.0, ry + 6.1], [3.05, ry + 8.6], [3.6, ry + 8.8], [3.6, ry + 9.3], [0, ry + 9.3]], 40, gold, 1583).translateX(rx));
  g.add(lathe([[0, ry + 6.05], [3.15, ry + 6.05], [3.25, ry + 7.3], [3.15, ry + 8.6], [0, ry + 8.6]], 40, toon('#9fe0d0'), 1584).translateX(rx));
  g.add(lathe([[0, ry + 9.3], [1.6, ry + 9.3], [1.5, ry + 11], [1.1, ry + 11.4], [0, ry + 11.4]], 20, toon('#24272d'), 1585).translateX(rx));
  const bail = mesh(new THREE.TorusGeometry(3.9, .32, 8, 24, Math.PI), silver, 1586); bail.position.set(rx, ry + 5.2, 0); bail.rotation.set(-1.25, 0, Math.PI / 2 + .25); g.add(bail);
  // crank on the +z side: shaft, arm, knob
  g.add(cyl(.55, 2.8, [rx, ry - .5, 3.6], [Math.PI / 2, 0, 0], metal, 1587));
  g.add(box(1.2, 6.5, .8, [rx, ry - 3.2, 5.1], metal, 1587, .3));
  g.add(cyl(.95, 2.6, [rx, ry - 6.2, 6.6], [Math.PI / 2, 0, 0], toon('#c79a62'), 1588));
  // the line: off the spool, through each guide, out of the tip, a little slack
  const path = new THREE.CurvePath<THREE.Vector3>();
  const pts = [V(rx - 2.4, ry + 8.4, 0), ...centres, tipC];
  for (let i = 0; i < pts.length - 1; i++) path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  path.add(new THREE.CatmullRomCurve3([tipC, V(tipC.x + 1.6, 213.4, 0), V(tipC.x + 4, 211.5, .5), V(tipC.x + 5.2, 206, 1), V(tipC.x + 5.4, 199, 1.2)]));
  g.add(tube(path, .16, toon('#f4f6f8'), 1589, 600, 5));
  return g;
};
/** The unimpressed fish (cm): a squashed egg body, a forked tail, fins, big flat eyes with half-closed lids. */
const fish = () => {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 20), toon('#5fa7b5'));
  body.scale.set(1.5, .9, .6); body.userData.part = 1420; ids.push(body); g.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(19.6, 32, 20, 0, Math.PI * 2, Math.PI * .55, Math.PI * .45), toon('#e8e2c8'));
  belly.scale.set(1.5, .9, .6); belly.userData.part = 1421; ids.push(belly); g.add(belly);
  const tail = new THREE.Shape(); tail.moveTo(0, 0); tail.lineTo(-22, 16); tail.lineTo(-16, 0); tail.lineTo(-22, -16); tail.lineTo(0, 0);
  const t = new THREE.Mesh(new THREE.ExtrudeGeometry(tail, { depth: 2, bevelEnabled: false }), toon('#4a8d9b'));
  t.position.set(-26, 0, -1); t.userData.part = 1422; ids.push(t); g.add(t);
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.quadraticCurveTo(-6, 14, -16, 12); fin.lineTo(-10, 0);
  const f = new THREE.Mesh(new THREE.ExtrudeGeometry(fin, { depth: 1.5, bevelEnabled: false }), toon('#4a8d9b'));
  f.position.set(4, 15, -.75); f.userData.part = 1423; ids.push(f); g.add(f);
  for (const sz of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(5.2, 20, 14), toon('#f7f5ee')); eye.position.set(15, 5, sz * 8.6); eye.userData.part = 1424; ids.push(eye); g.add(eye);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 10), toon('#141418')); pup.position.set(17.4, 4, sz * 12); pup.userData.part = 1425; ids.push(pup); g.add(pup);
    // the heavy upper lid: unimpressed
    const lid = new THREE.Mesh(new THREE.SphereGeometry(5.6, 20, 10, 0, Math.PI * 2, 0, Math.PI * .42), toon('#4a8d9b'));
    lid.position.set(15, 5, sz * 8.6); lid.rotation.set(0, 0, -.25); lid.userData.part = 1426; ids.push(lid); g.add(lid);
  }
  const mouth = cyl(1.2, 6, [29, -3, 0], [Math.PI / 2, 0, 0], toon('#2c4f57'), 1427); g.add(mouth);
  return g;
};
/** The companion fish v2 (cm), Producer 2026-10-12 ("me encanta esa cara… mejorarlo aún más"): the same deadpan face
 * (big flat eyes under a heavy lid), now with a body that tapers to the tail, a darker back fading to a cream belly with
 * a soft scale pattern, a curved forked tail, a spiky dorsal fin, side fins, a gill line, pouty lips and a catchlight in
 * each eye. Expressions per shot (shot.fish): lid 0 (wide, impressed) .. .42 (deadpan) .. 1 (closed), look [up, side],
 * mouth pout | o (yawn / surprise) | flat, sweat drop. */
const fish2 = () => {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(20, 64, 40);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const col: number[] = [];
  const back = new THREE.Color('#2f7487'), mid = new THREE.Color('#5fb0bf'), belly = new THREE.Color('#efe6c6'), spot = new THREE.Color('#3f8d9e');
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const k = x < 0 ? 1 + (x / 20) * .5 : 1 + (x / 20) * .06;      // taper to the tail, a slightly fuller head
    y *= k; z *= k;
    pos.setXYZ(i, x * 1.5, y * .95, z * .66);
    const h = y / 20;                                                // -1 belly .. 1 back
    const c = new THREE.Color();
    if (h > .15) c.copy(mid).lerp(back, Math.min(1, (h - .15) / .7));
    else if (h > -.3) c.copy(mid);
    else c.copy(mid).lerp(belly, Math.min(1, (-.3 - h) / .25));
    const sc = Math.sin(x * .55 + (Math.floor(y / 3.2) % 2) * 1.6) * Math.sin(y * 1.0);
    if (h > -.25 && x < 12 && sc > .55) c.lerp(spot, .55);           // a soft scallop of scales on the flank (not on the face)
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const bm = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ramp });
  const body = new THREE.Mesh(geo, bm); body.userData.part = 1440; ids.push(body); g.add(body);
  const finMat = toon('#3f8d9e');
  const ext = (sh: THREE.Shape, d: number) => new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelThickness: .5, bevelSize: .5, bevelSegments: 2, curveSegments: 16 });
  // the forked tail, curved lobes
  const tail = new THREE.Shape(); tail.moveTo(2, 0); tail.quadraticCurveTo(-10, 8, -24, 19); tail.quadraticCurveTo(-19, 8, -16, 0);
  tail.quadraticCurveTo(-19, -8, -24, -19); tail.quadraticCurveTo(-10, -8, 2, 0);
  const t = new THREE.Mesh(ext(tail, 1.6), finMat); t.position.set(-27, 0, -.8); t.userData.part = 1441; ids.push(t); g.add(t);
  // spiky dorsal fin
  const dor = new THREE.Shape(); dor.moveTo(10, 0); dor.lineTo(6, 9); dor.lineTo(2, 6); dor.lineTo(-3, 12); dor.lineTo(-7, 7); dor.lineTo(-13, 11); dor.lineTo(-16, 0);
  const d = new THREE.Mesh(ext(dor, 1.2), finMat); d.position.set(0, 15.5, -.6); d.userData.part = 1442; ids.push(d); g.add(d);
  // belly fin
  const bel = new THREE.Shape(); bel.moveTo(4, 0); bel.quadraticCurveTo(-2, -7, -9, -6); bel.lineTo(-6, 0);
  const b = new THREE.Mesh(ext(bel, 1), finMat); b.position.set(-4, -15, -.5); b.userData.part = 1443; ids.push(b); g.add(b);
  const ex: FishExpr = {};
  const eyes: { lid: THREE.Mesh; pup: THREE.Mesh; glint: THREE.Mesh; base: THREE.Vector3 }[] = [];
  for (const sz of [-1, 1]) {
    // side fin (pectoral), behind the gill
    const pec = new THREE.Shape(); pec.moveTo(0, 0); pec.quadraticCurveTo(-5, 6, -12, 4); pec.quadraticCurveTo(-8, 0, -11, -3); pec.quadraticCurveTo(-5, -3, 0, 0);
    const pf = new THREE.Mesh(ext(pec, .8), finMat); pf.position.set(4, -5, sz * 12.2); pf.rotation.set(0, sz * .5, -.2); pf.userData.part = 1444; ids.push(pf); g.add(pf);
    // gill line
    const gill = new THREE.Mesh(new THREE.TorusGeometry(9, .55, 8, 24, Math.PI * .55), toon('#2a6576'));
    gill.position.set(10, -1, sz * 9.6); gill.rotation.set(0, sz > 0 ? 0 : Math.PI, Math.PI * .72); gill.scale.set(1, 1, .3); gill.userData.part = 1445; ids.push(gill); g.add(gill);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(5.6, 24, 16), toon('#fbf8f0')); eye.position.set(15, 5.5, sz * 8.8); eye.userData.part = 1446; ids.push(eye); g.add(eye);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 12), toon('#121216')); pup.userData.part = 1447; ids.push(pup); g.add(pup);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(.8, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); glint.userData.part = 1448; ids.push(glint); g.add(glint);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(6.0, 24, 12, 0, Math.PI * 2, 0, Math.PI * .42), toon('#3f8d9e'));
    lid.position.copy(eye.position); lid.rotation.set(0, 0, -.25); lid.userData.part = 1449; ids.push(lid); g.add(lid);
    eyes.push({ lid, pup, glint, base: new THREE.Vector3(17.8, 4.4, sz * 12.6) });
  }
  // lips
  const lipMat = toon('#c9707a');
  const up = new THREE.Mesh(new THREE.SphereGeometry(2.6, 16, 10), lipMat); up.scale.set(.7, .55, 1.25); up.position.set(29.5, -2.2, 0); up.userData.part = 1450; ids.push(up); g.add(up);
  const lo = new THREE.Mesh(new THREE.SphereGeometry(2.6, 16, 10), lipMat); lo.scale.set(.75, .6, 1.2); lo.position.set(29.2, -4.6, 0); lo.userData.part = 1451; ids.push(lo); g.add(lo);
  const hole = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 10), toon('#3a1c24')); hole.scale.set(.5, 1, 1); hole.position.set(30.6, -3.4, 0); hole.userData.part = 1452; ids.push(hole); g.add(hole);
  const drop = new THREE.Mesh(new THREE.SphereGeometry(1.8, 14, 10), toon('#b9e4ff')); drop.scale.set(1, 1.5, 1); drop.position.set(19, 15, 12); drop.userData.part = 1453; ids.push(drop); g.add(drop);
  g.userData.setExpr = (e: FishExpr) => {
    const lidK = e.lid ?? .42, [lu, ls] = e.look ?? [0, 0];
    for (const E of eyes) {
      E.lid.geometry.dispose();
      E.lid.geometry = new THREE.SphereGeometry(6.0, 24, 12, 0, Math.PI * 2, 0, Math.PI * Math.max(.02, Math.min(1, lidK)));
      E.lid.visible = lidK > .03;
      E.pup.position.set(E.base.x, E.base.y + lu * 1.8, E.base.z);
      E.pup.position.x += ls * 1.2;
      E.glint.position.set(E.pup.position.x + .6, E.pup.position.y + 1.1, E.pup.position.z + Math.sign(E.base.z) * 1.9);
      E.pup.visible = E.glint.visible = lidK < .6;                      // past half-closed the lid covers the pupil
    }
    const m = e.mouth ?? 'pout';
    hole.visible = m === 'o'; hole.scale.set(.5, m === 'o' ? 1.5 : 1, m === 'o' ? 1.3 : 1);
    up.position.y = m === 'o' ? -1.0 : -2.2; lo.position.y = m === 'o' ? -6.2 : -4.6;
    lo.scale.y = m === 'flat' ? .4 : .6;
    drop.visible = !!e.sweat;
  };
  g.userData.setExpr(ex);
  return g;
};
/** A galvanised trash can (cm) for the "slop" gag: flared body with three raised ribs, two dents, a rolled rim, a foot
 * ring, side handles on brackets, a dark inside with some rubbish (crumpled paper, a crushed can) and a domed, ribbed lid
 * with a loop handle, resting ajar on the rim. Zinc mottling and grime as vertex colours. */
const trashcan = () => {
  const g = new THREE.Group();
  const rr = (y: number) => 25.4 + 3.6 * (y - 3) / 67 + [17, 35, 53].reduce((a, c) => a + 1.05 * Math.exp(-(((y - c) / 1.5) ** 2)), 0);
  const prof: [number, number][] = [[0, 0], [24.2, 0], [25, .8], [25.6, 2.2], [25.2, 3]];
  for (let y = 3.6; y <= 70.01; y += .6) prof.push([rr(y), y]);
  prof.push([29.1, 70.8]);
  const geo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 120);
  const dents = [[-.35, 27, 8.5, 2.2], [.95, 47, 7, 1.6], [-1.3, 60, 6, 1.4]];   // angle (0 = +z), height, radius, depth
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z);
    if (r < 20) continue;
    const a = Math.atan2(x, z);
    let d = 0;
    for (const [da, dy, rad, dep] of dents) { let dd = a - da; dd -= TAU * Math.round(dd / TAU); d += dep * Math.exp(-((dd * r) ** 2 + (y - dy) ** 2) / rad ** 2); }
    p.setXYZ(i, x * (r - d) / r, y, z * (r - d) / r);
  }
  geo.computeVertexNormals();
  const zinc = new THREE.Color('#b0bac3'), grime = new THREE.Color('#7d7a6e');
  const mottle = (x: number, y: number, z: number) => { const a = Math.atan2(x, z); return 1 + .045 * Math.sin(a * 7 + y * .3) * Math.sin(y * .21 - a * 3) + .03 * Math.sin(a * 23 + y * .9); };
  vcol(geo, (x, y, z) => zinc.clone().lerp(grime, .55 * (1 - sstep(0, 14, y))).multiplyScalar((.8 + .2 * sstep(0, 60, y)) * mottle(x, y, z)));
  g.add(mesh(geo, vtoon(), 1600));
  const steel = toon('#98a2ab'), darkSteel = toon('#7b858e');
  const rim = mesh(new THREE.TorusGeometry(29.2, 1.45, 10, 96), steel, 1601); rim.rotation.x = Math.PI / 2; rim.position.y = 71.1; g.add(rim);
  const inside = new THREE.LatheGeometry([[28.0, 71], [27.6, 60], [26.5, 30], [25, 4], [0, 4]].map(([r, y]) => new THREE.Vector2(r, y)), 64);
  orient(inside, (q) => V(-q.x, .2, -q.z));
  g.add(mesh(vcol(inside, (_x, y) => .45 + .55 * sstep(40, 71, y)), vtoon('#69717a'), 1602));
  // rubbish showing under the lid
  const crumple = (r: number, seed: number) => {
    const c = new THREE.IcosahedronGeometry(r, 1), q = c.attributes.position as THREE.BufferAttribute;
    const key = (x: number, y: number, z: number) => hash(Math.round(x * 10) + seed, Math.round(y * 10) * 7 + Math.round(z * 10) * 13);
    for (let i = 0; i < q.count; i++) { const v = V(q.getX(i), q.getY(i), q.getZ(i)); v.multiplyScalar(.82 + .3 * key(v.x, v.y, v.z)); q.setXYZ(i, v.x, v.y, v.z); }
    c.computeVertexNormals(); return c;
  };
  const paper = new THREE.MeshToonMaterial({ color: new THREE.Color('#f1eee4'), gradientMap: ramp, flatShading: true });
  const kraft = new THREE.MeshToonMaterial({ color: new THREE.Color('#d9bf8f'), gradientMap: ramp, flatShading: true });
  g.add(at(mesh(crumple(7, 1), paper, 1603), 10, 69, -6));
  g.add(at(mesh(crumple(5.5, 2), kraft, 1604), 17, 69, 9));
  const can = lathe([[0, 0], [2.6, 0], [2.7, 1], [3.1, 2.5], [2.4, 4.5], [3.1, 6.5], [2.7, 9.5], [2.2, 10], [0, 10]], 20, toon('#c8463a'), 1605);
  can.position.set(1, 70.5, 12); can.rotation.set(1.2, .3, -.5); g.add(can);
  // side handles on brackets
  for (const sx of [1, -1]) {
    const hg = new THREE.Group();
    const r58 = rr(58);
    const t = new THREE.TorusGeometry(5.2, .95, 8, 20, Math.PI); t.rotateZ(-Math.PI / 2); t.rotateX(Math.PI / 2);
    hg.add(at(mesh(t, darkSteel, 1606), r58 + .8, 58, 0));
    for (const z of [-5.2, 5.2]) hg.add(box(1.4, 4.2, 2.6, [r58 + .3, 58, z], darkSteel, 1606, .3));
    hg.rotation.y = sx > 0 ? 0 : Math.PI; g.add(hg);
  }
  // the lid: domed, two raised rings, rolled edge, loop handle
  const lid = new THREE.Group();
  const lp: [number, number][] = [];
  for (let r = 0; r <= 31; r += .5) lp.push([r, 5.2 - 4.3 * (r / 31) ** 1.8 + .75 * Math.exp(-(((r - 12) / 1.3) ** 2)) + .75 * Math.exp(-(((r - 22) / 1.3) ** 2))]);
  lp.push([32.3, .1], [32.6, -1.6], [31.7, -1.8], [30.6, -.3], [0, 3.4]);
  lp.reverse();                                                      // underside out, top back in: normals face out
  const lg = new THREE.LatheGeometry(lp.map(([r, y]) => new THREE.Vector2(r, y)), 96);
  vcol(lg, (x, y, z) => zinc.clone().multiplyScalar((.9 + .1 * y / 5) * mottle(x, y * 8, z)));
  lid.add(mesh(lg, vtoon(), 1607));
  const le = mesh(new THREE.TorusGeometry(32.3, 1.15, 10, 96), steel, 1608); le.rotation.x = Math.PI / 2; le.position.y = -1.2; lid.add(le);
  const loop = new THREE.TorusGeometry(6, 1.1, 10, 24, Math.PI);
  lid.add(at(mesh(loop, darkSteel, 1609), 0, 6.6, 0));
  for (const x of [-6, 6]) lid.add(box(3.4, 2.2, 3.4, [x, 5.6, 0], darkSteel, 1609, .5));
  lid.position.set(-5, 78.5, 3); lid.rotation.set(.1, .5, .32); g.add(lid);
  return g;
};

/** A bundle of three dynamite sticks (cm): red paper wraps with a glued seam and tucked paper ends, two bands of twine
 * (two turns each, a knot with two tails at the front), and a braided fuse from a copper cap, ending in a charred tip with
 * an ember, ready for a 2D spark. */
const dynamite = () => {
  const g = new THREE.Group();
  const C: [number, number][] = [[-3.5, 0], [3.5, 0], [0, 6.0]], R = 3.35;
  const red = new THREE.Color('#d33a2c');
  C.forEach(([cx, cz], k) => {
    const sg = new THREE.LatheGeometry([[0, .05], [2.4, 0], [3.05, .35], [R, 1.1], [R, 20.9], [3.05, 21.65], [2.4, 22], [0, 22.05]].map(([r, y]) => new THREE.Vector2(r, y)), 64);
    const seamA = 1.9 + k * 2.1;
    vcol(sg, (x, y, z) => {
      let a = Math.atan2(z, x) - seamA; a -= TAU * Math.round(a / TAU);
      const end = y < 1.6 || y > 20.4 ? .86 : 1;
      return red.clone().multiplyScalar((.78 + .22 * y / 22) * end * (Math.abs(a) < .07 ? .72 : 1));
    });
    g.add(at(mesh(sg, vtoon(), 1630 + k), cx, 0, cz));
    for (const pts of [[[2.45, 22.0], [1.35, 22.17], [1.15, 22.06], [.95, 22.17], [0, 22.2]], [[0, -.12], [.95, -.1], [1.15, 0], [1.35, -.1], [2.45, .03]]] as [number, number][][]) {
      const e = lathe(pts, 40, toon('#ead7ad'), 1633); e.position.set(cx, 0, cz); g.add(e);       // tucked paper ends, a fold ring
    }
  });
  // twine bands around the bundle outline
  const hull = (y: number, off: number) => Array.from({ length: 96 }, (_, i) => {
    const a = i / 96 * TAU, d = V(Math.cos(a), 0, Math.sin(a));
    let best = -1e9, pt = V(0, 0, 0);
    for (const [cx, cz] of C) { const s = cx * d.x + cz * d.z; if (s > best) { best = s; pt = V(cx + d.x * (R + off), y, cz + d.z * (R + off)); } }
    return pt;
  });
  const twine = toon('#dcc28a');
  for (const y of [5.2, 16.2]) for (const dy of [-.45, .45]) {
    const t = tube(hull(y + dy, .42), .45, vtoon('#dcc28a'), 1634, 192, 8, true);
    ropeCol(t.geometry, 192, 8, 70, .74); g.add(t);
  }
  const ka = Math.atan2(.92, -.38), kp = V(0, 0, 0);
  { let best = -1e9; for (const [cx, cz] of C) { const s = cx * Math.cos(ka) + cz * Math.sin(ka); if (s > best) { best = s; kp.set(cx + Math.cos(ka) * (R + .9), 16.2, cz + Math.sin(ka) * (R + .9)); } } }
  const knot = mesh(new THREE.SphereGeometry(1.0, 14, 10), twine, 1635); knot.scale.set(1.25, .9, .8); knot.position.copy(kp); g.add(knot);
  const out = V(Math.cos(ka), 0, Math.sin(ka));
  for (const sx of [-1, 1]) {
    const side = V(-out.z, 0, out.x).multiplyScalar(sx);
    const tail = tube([kp.clone(), kp.clone().add(side.clone().multiplyScalar(1.2)).add(out.clone().multiplyScalar(.6)).add(V(0, -1.6, 0)), kp.clone().add(side.clone().multiplyScalar(1.6)).add(out.clone().multiplyScalar(.9)).add(V(0, -3.6, 0))], .38, vtoon('#dcc28a'), 1635, 16, 6);
    ropeCol(tail.geometry, 16, 6, 8, .74); g.add(tail);
  }
  // fuse: copper cap, braided cord, charred tip and ember
  g.add(cyl(.85, 1.3, [3.5, 22.6, 0], [0, 0, 0], toon('#c07a45'), 1636));
  const fc = new THREE.CatmullRomCurve3([V(3.5, 22.8, 0), V(3.6, 25.2, 0), V(4.5, 28.2, .4), V(6.6, 30.4, 1.2), V(9.4, 30.7, 2), V(11.6, 29.2, 2.5)]);
  const fu = tube(fc, .5, vtoon('#efe6cf'), 1637, 90, 8); ropeCol(fu.geometry, 90, 8, 34, .55); g.add(fu);
  const end = fc.getPoint(1), tan = fc.getTangent(1);
  const tip = new THREE.CylinderGeometry(.62, .52, 1.1, 12); tip.translate(0, .55, 0);
  const tm = mesh(tip, toon('#2b2320'), 1638); tm.position.copy(end); tm.quaternion.setFromUnitVectors(V(0, 1, 0), tan); g.add(tm);
  const ember = mesh(new THREE.SphereGeometry(.42, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff8a2a') }), 1639);
  ember.position.copy(end.clone().add(tan.clone().multiplyScalar(1.15))); g.add(ember);
  return g;
};

/** Poker chips (cm): stacks of striped chips (six edge inserts, an inlay disc, a little jitter in each stack), a few loose
 * chips and two playing cards (a patterned back and a plain ace of spades, generic). */
const chips = () => {
  const g = new THREE.Group();
  const H = .55, RC = 2.0;
  const chipGeo = (base: string, stripe: string, rot: number) => {
    const prof: [number, number][] = [[0, 0], [1.16, 0], [1.2, 0], [1.5, 0], [1.86, 0], [1.97, .04], [2.0, .12], [2.0, H - .12], [1.97, H - .04], [1.86, H], [1.5, H], [1.2, H], [1.16, H], [0, H]];
    const geo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 144);
    const b = new THREE.Color(base), s = new THREE.Color(stripe), inl = b.clone().lerp(new THREE.Color('#ffffff'), .5);
    return vcol(geo, (x, y, z) => {
      const r = Math.hypot(x, z), a = Math.atan2(z, x) + rot, f = ((a / TAU * 6) % 1 + 1) % 1;
      if (r < 1.18) return inl;
      if (r > 1.45 && f < .3) return s;
      return b;
    });
  };
  const kinds: Record<string, [string, string]> = { red: ['#cf3b2f', '#f4f1ea'], blue: ['#2d5fa0', '#f4f1ea'], green: ['#2f8b57', '#f4f1ea'], black: ['#2a2a2f', '#e2c25a'], white: ['#efece4', '#cf3b2f'] };
  let n = 0;
  const chip = (kind: string, x: number, y: number, z: number, tilt: [number, number] = [0, 0]) => {
    const [b, s] = kinds[kind];
    const m = mesh(chipGeo(b, s, hash(n, 3) * TAU), vtoon(), 1650 + (n++ % 40));
    m.position.set(x, y, z); m.rotation.set(tilt[0], 0, tilt[1]); g.add(m);
  };
  const stack = (x: number, z: number, list: string[], lean = 0) => list.forEach((k, i) => chip(k, x + (hash(n, 1) - .5) * .16 + lean * i, i * (H + .02), z + (hash(n, 2) - .5) * .16));
  stack(0, 0, ['red', 'red', 'white', 'red', 'red', 'red', 'white', 'red', 'red', 'red']);
  stack(4.5, -1.6, ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue']);
  stack(-4.4, 1.9, ['black', 'black', 'black', 'black', 'green']);
  stack(1.9, 4.7, ['green', 'green', 'green'], .06);
  chip('red', -1.8, .02, 6.4, [.04, -.05]);
  chip('blue', 5.8, .02, 3.4, [-.03, .02]);
  // cards: canvas-drawn faces (generic back pattern, ace of spades)
  const cardTex = (face: boolean) => {
    const cv = document.createElement('canvas'); cv.width = 252; cv.height = 352;
    const c = cv.getContext('2d')!;
    c.fillStyle = '#fbfaf5'; c.fillRect(0, 0, 252, 352);
    if (!face) {
      c.fillStyle = '#b8322b'; c.fillRect(16, 16, 220, 320);
      c.strokeStyle = '#e46b5e'; c.lineWidth = 3;
      for (let k = -360; k < 400; k += 22) { c.beginPath(); c.moveTo(16 + k, 16); c.lineTo(16 + k + 320, 336); c.stroke(); c.beginPath(); c.moveTo(16 + k + 320, 16); c.lineTo(16 + k, 336); c.stroke(); }
      c.fillStyle = '#fbfaf5'; c.fillRect(0, 0, 252, 16); c.fillRect(0, 336, 252, 16); c.fillRect(0, 0, 16, 352); c.fillRect(236, 0, 16, 352);
      c.strokeStyle = '#fbfaf5'; c.lineWidth = 4; c.strokeRect(26, 26, 200, 300);
    } else {
      const spade = (cx: number, cy: number, s: number) => {
        c.beginPath(); c.moveTo(cx, cy - s);
        c.bezierCurveTo(cx + s * .2, cy - s * .55, cx + s, cy - s * .2, cx + s * .82, cy + s * .35);
        c.bezierCurveTo(cx + s * .65, cy + s * .8, cx + s * .15, cy + s * .7, cx + s * .06, cy + s * .42);
        c.lineTo(cx + s * .3, cy + s * 1.05); c.lineTo(cx - s * .3, cy + s * 1.05); c.lineTo(cx - s * .06, cy + s * .42);
        c.bezierCurveTo(cx - s * .15, cy + s * .7, cx - s * .65, cy + s * .8, cx - s * .82, cy + s * .35);
        c.bezierCurveTo(cx - s, cy - s * .2, cx - s * .2, cy - s * .55, cx, cy - s);
        c.fill();
      };
      c.fillStyle = '#1b1b20'; spade(126, 168, 58);
      c.font = 'bold 44px sans-serif'; c.textAlign = 'center'; c.fillText('A', 32, 56); spade(32, 82, 13);
      c.save(); c.translate(252, 352); c.rotate(Math.PI); c.fillText('A', 32, 56); spade(32, 82, 13); c.restore();
    }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  };
  [[-4.2, -7.2, .32, false, 0], [3.2, -7.6, -.22, true, .09]].forEach(([x, z, r, face, y], k) => {
    const w = 6.3, d = 8.8;
    const geo = new THREE.ExtrudeGeometry(roundedRect(w, d, .45), { depth: .06, bevelEnabled: false, curveSegments: 8 });
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + w / 2) / w, (uv.getY(i) + d / 2) / d);
    geo.rotateX(-Math.PI / 2);
    const m = mesh(geo, new THREE.MeshToonMaterial({ map: cardTex(face as boolean), gradientMap: ramp }), 1690 + k);
    m.position.set(x as number, y as number, z as number); m.rotation.y = r as number; g.add(m);
  });
  return g;
};

/** A golf flag (cm): white pin with a ferrule ball, a red flag with a soft cloth wave on a sleeve, and the hole cup
 * (white lip, dark hole) at ground level y = 0. */
const golfFlag = () => {
  const g = new THREE.Group();
  const pole = new THREE.CylinderGeometry(.95, .95, 212, 16, 1); pole.translate(0, 104, 0);
  g.add(mesh(vcol(pole, (_x, y) => .82 + .18 * sstep(0, 160, y)), vtoon('#f4f2ec'), 1700));
  g.add(at(mesh(new THREE.SphereGeometry(1.7, 16, 12), toon('#f4f2ec'), 1701), 0, 210.6, 0));
  const fg = new THREE.BoxGeometry(46, 30, .5, 60, 20, 1); fg.translate(23 + 1.2, 193, 0);
  const q = fg.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < q.count; i++) {
    const x = q.getX(i) - 1.2, y = q.getY(i), k = Math.max(0, x / 46);
    q.setXYZ(i, x + 1.2 - .9 * k * k * 2, y - 2.2 * k * k + .9 * Math.sin(x * .19 + 1) * k, q.getZ(i) + 3.0 * Math.sin(x * .16 - .5) * k ** .7 + .9 * Math.sin(y * .22 + x * .1) * k);
  }
  fg.computeVertexNormals();
  const flagRed = new THREE.Color('#d8352c');
  vcol(fg, (x) => flagRed.clone().multiplyScalar(.92 + .08 * Math.cos(x * .16 - .5)));
  g.add(mesh(fg, vtoon(), 1702));
  g.add(cyl(1.55, 31, [0, 193, 0], [0, 0, 0], toon('#f4f2ec'), 1703));
  for (const y of [177.6, 208.4]) g.add(cyl(1.7, .7, [0, y, 0], [0, 0, 0], toon('#c9c6bd'), 1704));
  const lip = mesh(new THREE.TorusGeometry(5.8, .6, 10, 40), toon('#f3f3ef'), 1705); lip.rotation.x = Math.PI / 2; lip.position.y = .3; g.add(lip);
  const hole = mesh(new THREE.CircleGeometry(5.5, 40), toon('#151618'), 1706); hole.rotation.x = -Math.PI / 2; hole.position.y = .05; g.add(hole);
  return g;
};

/** A hurricane lantern (cm) for the night boat: painted tank, brass burner and wick knob, a glowing glass globe (warm,
 * brighter at the flame, a white catchlight) with the flame drawn through it, guard wires, a vented cap and a wire bail with
 * a wooden grip. The glass and the flame are unlit (emissive), so they read warm in any scene light. */
const lantern = () => {
  const g = new THREE.Group();
  const paint = new THREE.Color('#b43c2c');
  const painted = (pts: [number, number][], part: number) => { const m = lathe(pts, 48, vtoon(), part); vcol(m.geometry, (_x, y) => paint.clone().multiplyScalar(.8 + .2 * Math.min(1, y / 25))); return m; };
  const brass = toon('#cfa64c'), wire = toon('#2c2d31');
  g.add(painted([[0, 0], [6.3, 0], [7.0, .5], [7.4, 2.0], [7.2, 3.6], [6.2, 4.5], [4.0, 5.0], [0, 5.05]], 1715));
  g.add(lathe([[0, 4.8], [4.0, 4.8], [4.1, 5.9], [3.5, 6.4], [0, 6.4]], 40, brass, 1716));
  g.add(cyl(.35, 2.2, [4.6, 5.6, 0], [0, 0, Math.PI / 2], brass, 1717));
  g.add(cyl(1.05, .55, [5.75, 5.6, 0], [0, 0, Math.PI / 2], brass, 1717));
  // glass globe: unlit warm gradient + catchlight
  const gp: [number, number][] = [[3.3, 6.2], [4.4, 7.6], [5.1, 9.4], [5.45, 11.4], [5.45, 13], [5.0, 15.2], [4.0, 17.4], [3.0, 19.1]];
  const glass = new THREE.LatheGeometry(gp.map(([r, y]) => new THREE.Vector2(r, y)), 64);
  const hot = new THREE.Color('#fff0b8'), warm = new THREE.Color('#ffbe5c'), amber = new THREE.Color('#e88a2e');
  vcol(glass, (x, y, z) => {
    const c = hot.clone().lerp(warm, Math.min(1, Math.abs(y - 11) / 5)).lerp(amber, sstep(4, 8, Math.abs(y - 11)) * .6);
    const a = Math.atan2(z, x), hl = Math.cos(a - 2.25);
    if (hl > .9 && y > 9 && y < 15.5) c.lerp(new THREE.Color('#ffffff'), .75);
    return c;
  });
  g.add(mesh(glass, new THREE.MeshBasicMaterial({ vertexColors: true }), 1718));
  const flame = (pts: [number, number][], col: [string, string, string], order: number) => {
    const fgeo = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 24);
    const [c0, c1, c2] = col.map((c) => new THREE.Color(c));
    vcol(fgeo, (_x, y) => { const t = (y - pts[0][1]) / (pts[pts.length - 1][1] - pts[0][1]); return t < .4 ? c0.clone().lerp(c1, t / .4) : c1.clone().lerp(c2, (t - .4) / .6); });
    const m = mesh(fgeo, new THREE.MeshBasicMaterial({ vertexColors: true, depthTest: false }), 1719); m.renderOrder = order; return m;
  };
  g.add(flame([[0, 7.6], [.9, 8.1], [1.35, 9.3], [1.15, 10.8], [.55, 12.4], [0, 13.6]], ['#ff7a1e', '#ff9a2e', '#ff6a12'], 10));
  g.add(flame([[0, 8.0], [.55, 8.4], [.8, 9.3], [.65, 10.4], [.3, 11.5], [0, 12.2]], ['#fff2c0', '#fffdf2', '#ffe08a'], 11));
  // guard wires and a ring
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + k * Math.PI / 2;
    const pts = [[4.6, 5.6], ...gp.slice(1, -1).map(([r, y]) => [r + .75, y]), [4.3, 19.3]].map(([r, y]) => V(r * Math.cos(a), y, r * Math.sin(a)));
    g.add(tube(pts, .26, wire, 1722, 40, 6));
  }
  const ringW = mesh(new THREE.TorusGeometry(6.25, .3, 6, 48), wire, 1722); ringW.rotation.x = Math.PI / 2; ringW.position.y = 12.2; g.add(ringW);
  // vented cap
  g.add(lathe([[0, 19], [4.4, 19], [4.9, 19.4], [4.9, 20], [0, 20]], 48, brass, 1721));
  g.add(painted([[0, 19.9], [5.6, 19.9], [5.8, 20.6], [4.6, 21.8], [2.7, 22.7], [2.5, 24.0], [3.0, 24.3], [3.0, 25.2], [2.2, 25.6], [0, 25.7]], 1720));
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * TAU, v = mesh(new THREE.SphereGeometry(.5, 8, 6), toon('#3a1f18'), 1723);
    v.scale.set(1, .6, .6); v.position.set(4.2 * Math.cos(a), 21.1, 4.2 * Math.sin(a)); v.lookAt(0, 30, 0); g.add(v);
  }
  // wire bail with rivets and a wooden grip
  const bail = Array.from({ length: 33 }, (_, i) => { const a = i / 32 * Math.PI; return V(6.6 * Math.cos(a), 18 + 12.5 * Math.sin(a), 0); });
  g.add(tube(bail, .36, wire, 1724, 64, 8));
  for (const x of [-6.6, 6.6]) g.add(at(mesh(new THREE.SphereGeometry(.75, 12, 8), brass, 1725), x, 18, 0));
  for (const x of [-6.6, 6.6]) g.add(tube([V(x * .93, 18, 0), V(x * .78, 19.5, 0), V(x * .7, 20.2, 0)], .3, wire, 1722, 8, 6));
  g.add(cyl(1.0, 4.2, [0, 30.5, 0], [0, 0, Math.PI / 2], woodMat('#a8763f', false), 1726));
  return g;
};

// ---------------------------------------------------------------- scene, lights, passes
const scene = new THREE.Scene();
const props: Record<string, THREE.Object3D> = {};
const CLASSIC = (P.variant ?? 'classic') === 'classic';
const SLOT_Z = CLASSIC ? -22 : -46;
if (P.props.includes('n64')) scene.add((props.n64 = CLASSIC ? n64Classic() : n64()));
if (P.props.includes('cartridge')) scene.add((props.cartridge = cartridge()));
if (P.props.includes('pad')) scene.add((props.pad = n64Pad()));
if (P.props.includes('ocarina')) scene.add((props.ocarina = ocarina()));
if (P.props.includes('sword')) scene.add((props.sword = masterSword()));
if (P.props.includes('bomb')) scene.add((props.bomb = bomb()));
if (P.props.includes('boomerang')) scene.add((props.boomerang = boomerang()));
if (P.props.includes('castle')) scene.add((props.castle = hyruleCastle()));
if (P.props.includes('crt')) scene.add((props.crt = crt()));
if (P.props.includes('triforce')) scene.add((props.triforce = triforce()));
if (P.props.includes('horse')) scene.add((props.horse = horse()));
if (P.props.includes('scabbard')) scene.add((props.scabbard = scabbard()));
if (P.props.includes('shield')) scene.add((props.shield = heroShield()));
if (P.props.includes('switch2')) scene.add((props.switch2 = switch2()));
if (P.props.includes('phone')) scene.add((props.phone = phone()));
if (P.props.includes('mug')) scene.add((props.mug = mug()));
if (P.props.includes('headphones')) scene.add((props.headphones = headphones()));
if (P.props.includes('gamebox')) scene.add((props.gamebox = gamebox()));
const EP003: Record<string, () => THREE.Object3D> = { rowboat, fishingRod, fish, fish2, trashcan, dynamite, chips, golfFlag, lantern };
for (const [k, f] of Object.entries(EP003)) if (P.props.includes(k)) scene.add((props[k] = f()));

if (P.light === 'neutral') {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x404048, 1.6));
  const k = new THREE.DirectionalLight(0xffffff, 2.2); k.position.set(-200, 400, 300); scene.add(k);
} else {
  // the living room at night: warm lamp from the upper left, blue TV spill from the right
  scene.add(new THREE.HemisphereLight(0xf4e6d4, 0x2c2a2a, 1.3));
  const lamp = new THREE.DirectionalLight(0xffe2c0, 2.4); lamp.position.set(-350, 500, 250); scene.add(lamp);
  const tv = new THREE.DirectionalLight(0x9fd0ff, 1.1); tv.position.set(400, 150, -100); scene.add(tv);
}

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
const W = P.width, H = P.height;
renderer.setSize(W * P.shots.length, H * 3); // shots side by side, the three passes stacked (keeps width under the WebGL limit)
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
renderer.setScissorTest(true);

const normalMat = new THREE.MeshNormalMaterial();
const idMats = new Map<number, THREE.Material>();
const idMat = (p: number) => {
  if (!idMats.has(p)) idMats.set(p, new THREE.MeshBasicMaterial({ color: new THREE.Color(((p * 53) % 255) / 255, ((p * 97) % 255) / 255, ((p * 151) % 255) / 255) }));
  return idMats.get(p)!;
};

function draw() {
  const saved = new Map(ids.map((m) => [m, m.material] as const));
  P.shots.forEach((shot, i) => {
    const cam = new THREE.PerspectiveCamera(shot.fov ?? 30, W / H, 5, 60000);
    cam.position.set(...shot.camera);
    cam.lookAt(new THREE.Vector3(...shot.target));
    if (props.cartridge) {
      props.cartridge.visible = !!shot.cart;
      if (shot.cart) {
        props.cartridge.position.set(shot.cart.x ?? 0, shot.cart.y, shot.cart.z ?? SLOT_Z);
        props.cartridge.rotation.set(shot.cart.tilt ?? 0, 0, 0);
      }
      ids.forEach((m) => { if (m.userData.flap) m.visible = !shot.cart || shot.cart.y > HUMP_TOP - 1; });
    }
    if (props.horse && shot.pose != null) setGallop(shot.pose);
    if (props.fish2) props.fish2.userData.setExpr(shot.fish ?? {});
    // rowboat layers for characters seated inside: 'back' = far side + interior, 'front' = near hull side, rail and oar
    if (props.rowboat) props.rowboat.traverse((o: THREE.Object3D) => { if (o.userData.half) o.visible = !shot.boat || o.userData.half === shot.boat; });
    if (shot.hide) ids.forEach((m) => { if (shot.hide!.includes(m.userData.part)) m.visible = false; });   // debug: hide parts
    const x = W * i;
    for (let pass = 0; pass < 3; pass++) {
      ids.forEach((m) => {
        m.material = pass === 0 ? saved.get(m)! : pass === 1 ? (m.userData.textured ? idMat(m.userData.part) : normalMat) : idMat(m.userData.part);
      });
      const y = H * (2 - pass); // WebGL viewports count from the bottom: pass 0 is the top row
      renderer.setViewport(x, y, W, H);
      renderer.setScissor(x, y, W, H);
      renderer.render(scene, cam);
    }
  });
  ids.forEach((m) => (m.material = saved.get(m)!));
  document.title = 'ready';
}

if (!P.cartTexture || !P.props.includes('cartridge')) draw();
