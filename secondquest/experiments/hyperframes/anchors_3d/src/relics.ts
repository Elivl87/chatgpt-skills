// AUTO-EXTRACTED from tools/props3d/scene.ts (origin/claude/secondquest-pilot-hook-4yw8xj): helpers + triforce, ocarina, masterSword.
// Approved prop geometry, unchanged. Regenerate with ./extract_relics.sh
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

const P = (window as any).PARAMS ?? { props: [], width: 0, height: 0, shots: [] };
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

export { triforce, ocarina, masterSword, toon, ids };
