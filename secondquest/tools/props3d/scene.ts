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
  const STONE = toon('#b6b0a2'), STONE_D = toon('#9a9486'), PALE = toon('#e9e5dc'), ROOF = toon('#5b6f98'), WOOD = toon('#7a5232'),
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
