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
interface Shot { camera: V3; target: V3; fov?: number; cart?: { y: number; x?: number; z?: number; tilt?: number } | null }
interface Params { variant?: 'classic' | 'faithful'; width: number; height: number; shots: Shot[]; props: string[]; cartTexture?: string; cartOutline?: [number, number][]; light?: 'room_night' | 'neutral' }
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

// ---------------------------------------------------------------- ocarina (classic blue "sweet potato" ocarina)
/** Head (wide end, with the mouthpiece) at -x, tail at +x; top = +y. Length ~150 mm. */
const ocarina = () => {
  const g = new THREE.Group();
  let part = 400;
  const geo = new THREE.SphereGeometry(1, 64, 40);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const u = (x + 1) / 2;                                   // 0 head .. 1 tail
    const taper = 1.0 - 0.42 * Math.pow(u, 1.6);            // narrower towards the tail
    const lift = 0.10 * Math.pow(u, 2);                     // tail curves up a little
    pos.setXYZ(i, x * 75, y * 30 * taper + lift * 30, z * 40 * taper);
  }
  geo.computeVertexNormals();
  const body = new THREE.Mesh(geo, toon('#2f5bd0')); body.userData.part = part++; ids.push(body); g.add(body);
  // mouthpiece: one flattened cone out of the head, angled ~10 degrees up, darker oval lip at its end; silver band at the joint
  const ang = 0.18, dir = new THREE.Vector3(-Math.cos(ang), Math.sin(ang), 0);
  const along = (v: THREE.Object3D, from: THREE.Vector3) => v.quaternion.setFromUnitVectors(from, dir);
  const head = new THREE.Vector3(-70, 4, 0);
  const mp = new THREE.Mesh(new THREE.CylinderGeometry(9, 15, 34, 32), toon('#2b54c2'));
  mp.scale.set(1, 1, 0.62); along(mp, new THREE.Vector3(0, 1, 0)); mp.position.copy(head.clone().addScaledVector(dir, 17));
  mp.userData.part = part++; ids.push(mp); g.add(mp);
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(9.4, 9.4, 3, 32), toon('#1d3c96'));
  lip.scale.set(1, 1, 0.62); along(lip, new THREE.Vector3(0, 1, 0)); lip.position.copy(head.clone().addScaledVector(dir, 35));
  lip.userData.part = part++; ids.push(lip); g.add(lip);
  const band = new THREE.Mesh(new THREE.TorusGeometry(15.3, 2.6, 14, 40), toon('#d9dce6'));
  band.scale.set(1, 0.66, 1); along(band, new THREE.Vector3(0, 0, 1)); band.position.copy(head.clone().addScaledVector(dir, 1));
  band.userData.part = part++; ids.push(band); g.add(band);
  // surface helper: point and normal on the deformed ellipsoid top
  const top = (x: number, z: number) => {
    const u = (x / 75 + 1) / 2, taper = 1.0 - 0.42 * Math.pow(u, 1.6), lift = 0.10 * Math.pow(u, 2) * 30;
    const zz = z / (40 * taper), xx = x / 75;
    const yy = Math.sqrt(Math.max(0, 1 - xx * xx - zz * zz));
    return { y: yy * 30 * taper + lift, n: new THREE.Vector3(xx / 75, yy / (30 * taper), zz / (40 * taper)).normalize() };
  };
  const hole = (x: number, z: number, r: number) => {
    const { y, n } = top(x, z);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.9, 1.2, 28), toon('#0b1636'));
    h.position.set(x, y - 0.3, z); h.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    h.userData.part = part++; ids.push(h); g.add(h);
  };
  // four large finger holes in a diamond + two small ones near the tail
  hole(-8, -14, 6.5); hole(-8, 14, 6.5); hole(16, -11, 6); hole(16, 11, 6); hole(36, -6, 4); hole(36, 6, 4);
  // golden Triforce emblem on top of the head, apex towards the mouthpiece
  const tri = (cx: number, cz: number, s: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(cx - s * 0.577, cz); sh.lineTo(cx + s * 0.289, cz - s / 2); sh.lineTo(cx + s * 0.289, cz + s / 2); sh.closePath();
    const tg = new THREE.ExtrudeGeometry(sh, { depth: 0.8, bevelEnabled: false });
    tg.rotateX(Math.PI / 2);                                  // shape (x, y) -> world (x, z); extrusion goes down
    const { y } = top(cx, cz); tg.translate(0, y + 0.9, 0);
    const m = new THREE.Mesh(tg, toon('#f2c230')); m.userData.part = part++; ids.push(m); return m;
  };
  const S_ = 9, c = -44;
  g.add(tri(c - S_ * 0.433, 0, S_), tri(c + S_ * 0.433, -S_ / 2, S_), tri(c + S_ * 0.433, S_ / 2, S_));
  return g;
};

// ---------------------------------------------------------------- master sword (classic: violet bird-wing guard, gold gem), upright
const masterSword = () => {
  const g = new THREE.Group();
  let part = 500;
  // blade with a diamond cross-section feel: beveled extrusion + a darker fuller down the middle
  const blade = new THREE.Shape();
  blade.moveTo(-10, 0); blade.lineTo(10, 0); blade.lineTo(9, 300); blade.lineTo(0, 345); blade.lineTo(-9, 300); blade.closePath();
  const bg = new THREE.ExtrudeGeometry(blade, { depth: 2, bevelEnabled: true, bevelThickness: 3, bevelSize: 3.2, bevelSegments: 1 });
  bg.translate(0, 0, -1);
  const bm = new THREE.Mesh(bg, toon('#e4e8f0')); bm.userData.part = part++; ids.push(bm); g.add(bm);
  for (const zf of [4.3, -4.3]) {
    const fuller = box(4, 200, 0.6, [0, 150, zf], toon('#aeb6c8'), part++); g.add(fuller);
  }
  // engraved Triforce near the base of the blade
  const tri = (cx: number, cy: number, s: number, zf: number) => {
    const sh = new THREE.Shape(); sh.moveTo(cx - s / 2, cy); sh.lineTo(cx + s / 2, cy); sh.lineTo(cx, cy + s * 0.87); sh.closePath();
    const tg = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false }); tg.translate(0, 0, zf);
    const m = new THREE.Mesh(tg, toon('#c9a43a')); m.userData.part = part++; ids.push(m); return m;
  };
  for (const zf of [4.4, -5.0]) g.add(tri(0, 24, 8, zf), tri(-4, 17, 8, zf), tri(4, 17, 8, zf));
  // crossguard: bird wings sweeping up and out to sharp tips, raised centre with the gem
  const guard = new THREE.Shape();
  guard.moveTo(0, -12);
  guard.bezierCurveTo(16, -14, 34, -8, 50, 6); guard.lineTo(70, 34); guard.bezierCurveTo(60, 30, 52, 24, 44, 16);
  guard.lineTo(40, 22); guard.bezierCurveTo(34, 14, 24, 10, 14, 10); guard.lineTo(8, 16); guard.lineTo(0, 26);
  guard.lineTo(-8, 16); guard.lineTo(-14, 10); guard.bezierCurveTo(-24, 10, -34, 14, -40, 22); guard.lineTo(-44, 16);
  guard.bezierCurveTo(-52, 24, -60, 30, -70, 34); guard.lineTo(-50, 6); guard.bezierCurveTo(-34, -8, -16, -14, 0, -12);
  const gg = new THREE.ExtrudeGeometry(guard, { depth: 12, bevelEnabled: true, bevelThickness: 3, bevelSize: 2, bevelSegments: 2 });
  gg.translate(0, -16, -6);
  const gm = new THREE.Mesh(gg, toon('#5d4ccc')); gm.userData.part = part++; ids.push(gm); g.add(gm);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 22, 6), toon('#4a3cb0')); hub.rotation.set(Math.PI / 2, 0, 0); hub.position.set(0, -6, 0); hub.userData.part = part++; ids.push(hub); g.add(hub);
  for (const zf of [11.5, -11.5]) {
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(6.5), toon('#f4c430')); gem.position.set(0, -6, zf); gem.scale.set(0.9, 1.35, 0.45); gem.userData.part = part++; ids.push(gem); g.add(gem);
  }
  // grip with a criss-cross wrap, then a violet diamond pommel
  g.add(cyl(7, 66, [0, -54, 0], [0, 0, 0], toon('#33449c'), part++));
  for (let k = 0; k < 6; k++) {
    const w = box(15, 2.4, 15, [0, -27 - k * 10.5, 0], toon('#1f2b6e'), part++, 1); w.rotation.set(0, Math.PI / 4, (k % 2 ? 1 : -1) * 0.35); g.add(w);
  }
  const pommel = new THREE.Mesh(new THREE.OctahedronGeometry(11), toon('#5d4ccc')); pommel.position.set(0, -94, 0); pommel.scale.set(1, 1.3, 0.75); pommel.userData.part = part++; ids.push(pommel); g.add(pommel);
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
if (P.props.includes('triforce')) scene.add((props.triforce = triforce()));

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
    const cam = new THREE.PerspectiveCamera(shot.fov ?? 30, W / H, 5, 5000);
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
