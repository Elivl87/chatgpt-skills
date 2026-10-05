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
interface Shot { camera: V3; target: V3; fov?: number; cart?: { y: number; x?: number; z?: number; tilt?: number } | null; pose?: number }
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
if (P.props.includes('shield')) scene.add((props.shield = heroShield()));
if (P.props.includes('switch2')) scene.add((props.switch2 = switch2()));

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
