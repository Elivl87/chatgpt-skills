/**
 * HyperFrames test #2: "The same ocarina. The same sword. The same Triforce." (EP002 l04-l06) as a live three.js scene.
 * Experiment only. The relics are the approved procedural props (src/relics.ts, extracted unchanged from
 * tools/props3d/scene.ts); everything around them (item slots, stars, fairy light, camera, outlines) is new here.
 *
 * Deterministic: nothing moves on its own. The GSAP timeline in index.html animates `state` and calls draw(t)
 * on every seek, so HyperFrames can render any frame in any order.
 */
import * as THREE from 'three';
import { triforce, ocarina, masterSword } from './relics';

const W = 1920, H = 1080;
const canvas = document.getElementById('gl') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, W / H, 1, 6000);

// ---------------------------------------------------------------- light (cool key, warm rim, soft fill)
scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x1a1530, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-300, 400, 600); scene.add(key);
const rim = new THREE.DirectionalLight(0xffd48a, 1.6); rim.position.set(400, 150, -300); scene.add(rim);
const glint = new THREE.PointLight(0xffffff, 0, 260, 1.5); scene.add(glint); // sweeps along the sword blade

// ---------------------------------------------------------------- house-style ink outline (inverted hull)
const INK = new THREE.Color('#16161f');
const outlineMat = (px: number) => {
  const m = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
  m.onBeforeCompile = (s) => {
    s.uniforms.thick = { value: px };
    s.vertexShader = 'uniform float thick;\n' + s.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * thick;');
  };
  return m;
};
const inked = (g: THREE.Object3D, thick: number) => {
  const hulls: THREE.Mesh[] = [];
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && !m.userData.noInk) { const h = new THREE.Mesh(m.geometry, outlineMat(thick)); h.userData.noInk = true; hulls.push(h); m.add(h); }
  });
  return g;
};

// ---------------------------------------------------------------- item slots (rounded gold frame + dark glass)
const SLOT = 230, GAP = 300;
const rounded = (w: number, r: number) => {
  const s = new THREE.Shape(), h = w / 2;
  s.moveTo(-h + r, -h); s.lineTo(h - r, -h); s.quadraticCurveTo(h, -h, h, -h + r); s.lineTo(h, h - r);
  s.quadraticCurveTo(h, h, h - r, h); s.lineTo(-h + r, h); s.quadraticCurveTo(-h, h, -h, h - r); s.lineTo(-h, -h + r);
  s.quadraticCurveTo(-h, -h, -h + r, -h);
  return s;
};
const gold = new THREE.MeshStandardMaterial({ color: '#ffc83d', metalness: 0.75, roughness: 0.3, emissive: new THREE.Color('#ffb020'), emissiveIntensity: 0 });
const slots = [-1, 0, 1].map((i) => {
  const g = new THREE.Group();
  const frame = rounded(SLOT, 34); frame.holes.push(rounded(SLOT - 26, 24) as unknown as THREE.Path);
  const fm = new THREE.Mesh(new THREE.ExtrudeGeometry(frame, { depth: 10, bevelEnabled: true, bevelThickness: 3, bevelSize: 3, bevelSegments: 3, curveSegments: 16 }), gold.clone());
  fm.position.z = -5;
  const glass = new THREE.Mesh(new THREE.ShapeGeometry(rounded(SLOT - 24, 24), 16),
    new THREE.MeshBasicMaterial({ color: '#0d1430', transparent: true, opacity: 0.72 }));
  glass.position.z = -60; glass.userData.noInk = true;
  const halo = new THREE.Mesh(new THREE.ShapeGeometry(rounded(SLOT - 24, 24), 16),
    new THREE.MeshBasicMaterial({ color: '#ffd76a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.position.z = -59; halo.userData.noInk = true;
  g.add(inked(fm, 1.6), glass, halo);
  g.position.set(i * GAP, 0, -Math.abs(i) * 60); // gentle arc
  g.rotation.y = -i * 0.18;
  scene.add(g);
  return { g, frame: fm, halo };
});

// ---------------------------------------------------------------- the relics (approved geometry, scaled into the slots)
const fit = (o: THREE.Object3D, size: number) => {
  const b = new THREE.Box3().setFromObject(o), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
  const k = size / Math.max(s.x, s.y);
  const pivot = new THREE.Group(); o.position.sub(c); pivot.add(o); pivot.scale.setScalar(k);
  return pivot;
};
const oc = fit(inked(ocarina(), 3.2), 185);
const sw = fit(inked(masterSword(), 4.2), 205);
const tfRaw = inked(triforce(), 3.4);
const tf = fit(tfRaw, 170);
const tfPieces = tfRaw.children.slice(0, 3) as THREE.Object3D[];
const tfHome = tfPieces.map((p) => p.position.clone());
[oc, sw, tf].forEach((r, i) => { r.position.z = 40; slots[i].g.add(r); });

// ---------------------------------------------------------------- stars (three depths, deterministic twinkle)
const rand = (() => { let s = 20261008; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();
const starTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d')!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(220,235,255,0.8)'); g.addColorStop(1, 'rgba(160,190,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const N = 1400, pos = new Float32Array(N * 3), phase = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const z = -400 - rand() * 2600;
  pos.set([(rand() - 0.5) * 5200, (rand() - 0.5) * 3000, z], i * 3); phase[i] = rand() * 6.283;
}
const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const starMat = new THREE.PointsMaterial({ size: 9, map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xdfe9ff, sizeAttenuation: true });
scene.add(new THREE.Points(starGeo, starMat));

// ---------------------------------------------------------------- fairy light with a short trail (leads the eye)
const fairyTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d')!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(210,240,255,0.95)'); g.addColorStop(0.45, 'rgba(120,200,255,0.35)'); g.addColorStop(1, 'rgba(80,160,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
const TRAIL = 10;
const fairy = Array.from({ length: TRAIL }, (_, i) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: fairyTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: i === 0 ? 1 : 0.5 * (1 - i / TRAIL) }));
  s.scale.setScalar(i === 0 ? 46 : 30 * (1 - i / TRAIL) + 6); scene.add(s); return s;
});

// ---------------------------------------------------------------- state driven by GSAP (index.html)
export const state = {
  camX: -GAP, camY: 10, camZ: 560, lookX: -GAP, lookY: 0,
  ocRot: -0.7, swRot: -0.9, tfRot: -0.5, bob: 0,
  glow0: 0, glow1: 0, glow2: 0,
  tfGather: 0, glintY: -120, glintOn: 0,
};

/** trail[0] is the fairy now, trail[i] where it was i * 1/48 s earlier (sampled from its own timeline in index.html). */
export function draw(t: number, trail: { x: number; y: number; z: number }[]) {
  const S = state;
  camera.position.set(S.camX, S.camY, S.camZ);
  camera.lookAt(S.lookX, S.lookY, 0);

  oc.rotation.set(0.12, S.ocRot, -0.08); oc.position.y = Math.sin(t * 2.1) * 6 * S.bob;
  sw.rotation.set(0, S.swRot, 0.05); sw.position.y = Math.sin(t * 2.1 + 1) * 6 * S.bob;
  tf.rotation.set(0, S.tfRot, 0); tf.position.y = Math.sin(t * 2.1 + 2) * 6 * S.bob;

  // Triforce: the three pieces fly in from depth and lock together (tfGather 0 -> 1)
  // (hidden until the camera reaches the third slot; they come from the sides and from behind, never past the lens)
  const spread = 1 - S.tfGather;
  tfPieces.forEach((p, i) => {
    const a = (i / 3) * Math.PI * 2 + 0.6;
    p.visible = S.tfGather > 0;
    p.position.set(tfHome[i].x + Math.cos(a) * 190 * spread, tfHome[i].y + Math.sin(a) * 170 * spread, tfHome[i].z - 220 * spread);
    p.rotation.set(spread * (1.4 + i), spread * (2.2 - i), spread * (0.8 * i));
  });

  [S.glow0, S.glow1, S.glow2].forEach((v, i) => {
    (slots[i].frame.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15 + 1.1 * v;
    (slots[i].halo.material as THREE.MeshBasicMaterial).opacity = 0.18 * v;
  });

  // glint light sweeping up the sword's blade
  const swWorld = new THREE.Vector3(); slots[1].g.getWorldPosition(swWorld);
  glint.position.set(swWorld.x + 40, swWorld.y + S.glintY, swWorld.z + 110); glint.intensity = 2600 * S.glintOn;

  // stars twinkle
  starMat.size = 8.5 + Math.sin(t * 3) * 0.6;

  // fairy + trail (sampled from the fairy's own timeline, so any seek gives the same frame)
  for (let i = 0; i < TRAIL; i++) { const p = trail[Math.min(i, trail.length - 1)]; fairy[i].position.set(p.x, p.y, p.z); }
  (fairy[0].material as THREE.SpriteMaterial).opacity = 0.85 + 0.15 * Math.sin(t * 23);

  renderer.render(scene, camera);
}

(window as unknown as { SQ: unknown }).SQ = { state, draw, GAP, TRAIL };
