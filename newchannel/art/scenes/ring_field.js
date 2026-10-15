/* Ep 001 · the 2008 ring experiment, re-imagined: 22 cute cars on a 230 m circle drawn on a mown field, late afternoon,
   high angle, long shadows. Generic drivers only (no real people). Positions/brake lights: IDM ring with the engine's
   parameters (string-unstable at ~29 km/h); a single brake tap at t = 1 s grows into a standing jam. */
(function (root) {
  const K = root.K, E = K.ep1;
  E.RING = { N: 22, L: 230, v0: 15, T: 0.7, a: 1.5, b: 1.5, s0: 1.5, carLen: 4.5, timeScale: 3, fps: 30, preroll: 2, duration: 40,
    taps: [{ car: 0, t: 1.0, dur: 0.75, decel: 4 }] };
  E.RING_MASCOT = 14;
  let rr = null; E.ringRun = () => (rr = rr || K.sim.ring(E.RING));

  const VIEW = { sc: 17.5, sinE: Math.sin(0.62), cosE: Math.cos(0.62), ox: 960, oy: 640 };
  const RAD = 230 / K.TAU;                                           // 36.6 m
  const SUN = [-0.75, -0.6];                                         // direction the sun comes from (ground x, z), upper-left
  const SHADOW = [-SUN[0] * 3.4, -SUN[1] * 3.4];                         // shadow vector per metre of height
  let B = null;

  const g2s = (X, Z, Y = 0) => [VIEW.ox + X * VIEW.sc, VIEW.oy + Z * VIEW.sc * VIEW.sinE - Y * VIEW.sc * VIEW.cosE];

  function build() {
    const P = E.PAL.field, bg = K.canvas(K.W, K.H), c = bg.ctx;
    // sky strip + far hills + tree line (backdrop)
    K.sky.gradient(c, [[0, '#93a9c4'], [0.6, '#f1cfa2'], [1, '#ffe0aa']], 0, 190);
    K.sky.wash(c, 260, 60, 700, '#fff0c8', 0.55);
    K.terrain.ridge(c, { y: 150, amp: 60, freq: 0.004, seed: 5, bottom: 260, color: K.mix('#9b8fa8', '#ffe0aa', 0.45), rim: '#fff0c8', rimW: 1.2 });
    K.terrain.ridge(c, { y: 178, amp: 26, freq: 0.01, seed: 6, bottom: 260, color: K.mix('#6f7f63', '#ffe0aa', 0.35) });
    // ground: field with mowing stripes
    const g = c.createLinearGradient(0, 170, 0, K.H); g.addColorStop(0, K.mix(P.grass, '#ffe0aa', 0.35)); g.addColorStop(0.3, P.grass); g.addColorStop(1, K.mix(P.grass, P.grassDark, 0.35));
    c.fillStyle = g; c.fillRect(0, 175, K.W, K.H);
    c.save(); c.beginPath(); c.rect(0, 178, K.W, K.H); c.clip();
    for (let k = -40; k < 40; k++) {                                // stripes along ground x (diagonal in screen)
      const a = g2s(k * 6 - 300, -120), b = g2s(k * 6 + 3 - 300, -120), cc = g2s(k * 6 + 3 + 300, 120), d = g2s(k * 6 + 300, 120);
      c.fillStyle = K.rgba(k % 2 ? P.grassLight : P.grassDark, 0.13); K.fillPoly(c, [a, b, cc, d]); c.fill();
    }
    c.restore();
    // v2 painted field: large soft local-colour patches (lighter / darker grass), then brush dabs laid on the ground plane (oblique), wildflower patches, darker soil scuffs
    { const r3 = K.rng(66);
      for (let k = 0; k < 26; k++) { const X = (r3() - 0.5) * 160, Z = -42 + r3() * 100, [x, y] = g2s(X, Z), w = 120 + r3() * 260;
        c.fillStyle = K.rgba(r3() < 0.5 ? P.grassLight : P.grassDark, 0.16 + r3() * 0.1);
        const pts = []; for (let j = 0; j < 9; j++) { const a = j / 9 * K.TAU, rr = w * (0.7 + r3() * 0.4); pts.push([x + Math.cos(a) * rr, Math.max(180, y + Math.sin(a) * rr * VIEW.sinE * 0.6)]); }
        K.blob(c, pts); c.fill(); } }
    const ptG = (X, Z) => { const [x, y] = g2s(X, Z); return y < 182 ? null : { x, y, d: 40 + Math.max(0, -Z) }; };
    K.terrain.brush(c, (sv, lv) => ptG(lv, -sv), { sCam: -70, sMin: -70, sMax: 60, per: 4, lAt: () => [-75, 75],
      colors: [[P.grassLight, 0.22], [P.grassDark, 0.2], ['#e9cf7a', 0.16], ['#5d7a3e', 0.18], ['#fff0c8', 0.1]] });
    { const r2 = K.rng(55), fc = ['#fff4e0', '#ffd65a', '#c9a3e8', '#ff9a8a'];
      for (let k = 0; k < 1500; k++) { const X = (r2() - 0.5) * 150, Z = -40 + r2() * 100; if (K.vnoise(X * 0.08, Z * 0.08, 9) < 0.6) continue;
        const rr = Math.hypot(X, Z); if (Math.abs(rr - RAD) < 5) continue; const [x, y] = g2s(X, Z); c.fillStyle = fc[(r2() * 4) | 0]; K.circle(c, x, y, 1.4 + r2() * 1.4); c.fill(); }
      for (let k = 0; k < 30; k++) { const X = (r2() - 0.5) * 140, Z = -30 + r2() * 90; if (Math.abs(Math.hypot(X, Z) - RAD) < 6) continue; const [x, y] = g2s(X, Z);
        c.fillStyle = K.rgba('#7a6a4a', 0.16); K.ellipse(c, x, y, 18 + r2() * 30, 5 + r2() * 6, (r2() - 0.5) * 0.3); c.fill(); } }
    K.light.haze(c, 150, 190, 330, '#ffe3b0', 0.55);
    // the track: asphalt annulus + painted edges
    const ring = (r, fresh = true) => { if (fresh) c.beginPath(); for (let k = 0; k <= 96; k++) { const a = k / 96 * K.TAU, p = g2s(Math.cos(a) * r, Math.sin(a) * r); k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.closePath(); };
    c.save(); ring(RAD + 3.6); ring(RAD - 3.6, false); c.fillStyle = P.track; c.fill('evenodd'); c.restore();
    c.lineWidth = 3; c.strokeStyle = K.rgba(P.trackLine, 0.85); ring(RAD + 3.1); c.stroke(); ring(RAD - 3.1); c.stroke();
    c.setLineDash([16, 18]); c.lineWidth = 2; c.strokeStyle = K.rgba(P.trackLine, 0.35); ring(RAD); c.stroke(); c.setLineDash([]);
    // start line
    { const a = g2s(RAD - 3.6, 0), b = g2s(RAD + 3.6, 0); c.strokeStyle = K.rgba(P.trackLine, 0.9); c.lineWidth = 5; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    K.tex.paint(bg, { amount: 0.45, mottle: { w: 1000, h: 560, sx: 0.006, sy: 0.02, seed: 44, amp: 45 } });
    // static props: trees around the field, the observers' tent, cones
    const r = K.rng(77), props = [];
    for (let i = 0; i < 22; i++) { const side = i % 2 ? 1 : -1, X = side * (46 + r() * 14), Z = -40 + r() * 75;
      props.push({ k: 'tree', X, Z, h: 6 + r() * 5, kind: r() < 0.3 ? 'poplar' : 'round', seed: r() * 1e6 | 0 }); }
    for (let x = -60; x < 60; x += 2.5 + r() * 3) props.push({ k: 'tree', X: x, Z: -45.5 - r() * 1.5, h: 5 + r() * 3, kind: r() < 0.5 ? 'poplar' : 'round', seed: r() * 1e6 | 0 });
    for (let k = 0; k < 16; k++) { const a = k / 16 * K.TAU + 0.1; props.push({ k: 'cone', X: Math.cos(a) * (RAD - 4.4), Z: Math.sin(a) * (RAD - 4.4) }); }
    props.push({ k: 'tent', X: -7, Z: -5 }, { k: 'tripod', X: 5.6, Z: 2.2 },
      { k: 'hero', who: 'pixie', X: 1.0, Z: 15.5 }, { k: 'hero', who: 'quest', X: -3.2, Z: 16.5 }, { k: 'person', X: -6.2, Z: 5.0, seed: 3, role: 'shrug' },
      { k: 'person', X: 7.4, Z: 2.6, seed: 4, role: 'camera' });
    for (let i = 0; i < 26; i++) { const a = r() * K.TAU, rr = RAD + 7 + r() * 14, X = Math.cos(a) * rr, Z = Math.sin(a) * rr; if (Z < -38) continue; props.push({ k: 'bush', X, Z, seed: r() * 1e6 | 0, s: 0.8 + r() * 0.9 }); }
    return { bg, props };
  }

  function drawProp(ctx, p, P, t = 0, jam = null) {
    const [x, y] = g2s(p.X, p.Z), s = VIEW.sc;
    if (p.k === 'bush') { const w = p.s * s * 1.3; ctx.fillStyle = K.mix(P.treeDark, P.tree, 0.3); for (let k = 0; k < 4; k++) { K.circle(ctx, x + (k - 1.5) * w * 0.45, y - w * 0.35 - (k % 2) * w * 0.15, w * 0.5); ctx.fill(); }
      ctx.fillStyle = P.tree; for (let k = 0; k < 4; k++) { K.circle(ctx, x + (k - 1.5) * w * 0.45 - w * 0.08, y - w * 0.45 - (k % 2) * w * 0.15, w * 0.38); ctx.fill(); }
      ctx.fillStyle = K.rgba(P.rim, 0.5); for (let k = 0; k < 2; k++) { K.circle(ctx, x + (k - 0.8) * w * 0.5 - w * 0.12, y - w * 0.62 - k * w * 0.1, w * 0.16); ctx.fill(); } }
    else if (p.k === 'tree') { const hz = K.clamp((-p.Z - 25) / 22) * 0.55; K.terrain.tree(ctx, x, y, p.h * s * VIEW.cosE * 1.15, { kind: p.kind, seed: p.seed, sway: Math.sin(t * 1.1 + p.X * 0.1 + p.Z * 0.07) * 0.025, color: K.mix(P.tree, '#f2d3a0', hz), shade: K.mix(P.treeDark, '#d9b08f', hz), trunk: K.mix('#4a3328', '#d9b08f', hz), light: { dx: -0.7, back: 0.35, rim: P.rim } }); }
    else if (p.k === 'cone') { ctx.fillStyle = '#e88a3a'; ctx.beginPath(); ctx.moveTo(x, y - s * 0.75); ctx.lineTo(x + s * 0.22, y); ctx.lineTo(x - s * 0.22, y); ctx.fill(); ctx.fillStyle = '#fff3df'; ctx.fillRect(x - s * 0.12, y - s * 0.42, s * 0.24, s * 0.1); }
    else if (p.k === 'tent') {
      const w = 6.4 * s, h = 4.0 * s * VIEW.cosE;
      ctx.fillStyle = '#e9e1cf'; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2 + 6, y - h * 0.75); ctx.lineTo(x + w / 2 - 6, y - h * 0.75); ctx.lineTo(x + w / 2, y); ctx.fill();
      ctx.fillStyle = '#2f6f69'; ctx.beginPath(); ctx.moveTo(x - w / 2 - 10, y - h * 0.7); ctx.lineTo(x, y - h * 1.05); ctx.lineTo(x + w / 2 + 10, y - h * 0.7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = K.rgba(P.rim, 0.8); ctx.beginPath(); ctx.moveTo(x - w / 2 - 10, y - h * 0.7); ctx.lineTo(x, y - h * 1.05); ctx.lineTo(x - w * 0.05, y - h * 0.98); ctx.lineTo(x - w / 2 - 4, y - h * 0.68); ctx.fill();
      ctx.fillStyle = '#c9b48f'; ctx.fillRect(x - w * 0.3, y - h * 0.32, w * 0.6, h * 0.12);     // table
    } else if (p.k === 'tripod') {
      ctx.strokeStyle = '#2a2230'; ctx.lineWidth = 2; const h = 2.4 * s * VIEW.cosE;
      for (const dx of [-0.5, 0, 0.5]) { ctx.beginPath(); ctx.moveTo(x + dx * s, y); ctx.lineTo(x, y - h); ctx.stroke(); }
      ctx.fillStyle = '#2a2230'; K.rrect(ctx, x - s * 0.35, y - h - s * 0.4, s * 0.7, s * 0.45, 3); ctx.fill();
    } else if (p.k === 'hero') {
      // v3: Quest and Pixie among the observers. Pixie takes notes on the clipboard; Quest stands hands-on-hips, then
      // points at the jam once a car stops (acting from the sim, like the other observers)
      const on = jam && jam.on, u = s * 1.45, Lt = Object.assign({}, K.hero.LIGHT.golden, { ang: -2.45, rim: P.rim, rimW: 0.06, shade: '#3a3358', shadeK: 0.3, amb: '#ffe0b0', ambK: 0.06 });
      const sh = { dx: -2.55 / VIEW.cosE, k: -(2.04 * VIEW.sinE) / VIEW.cosE, alpha: 0.32, color: P.shadow };
      if (p.who === 'pixie') K.hero.draw(ctx, 'pixie', x, y, u, { pose: 'clipboard', t, expr: on ? 'surprised' : 'neutral', yaw: on ? 0.55 : -0.25, headYaw: on ? 0.3 : 0, look: on ? [0.8, 0.3] : [0, 0.5], light: Lt, shadow: sh, contact: 0.3 });
      else { const toR = jam && jam.x > x; K.hero.draw(ctx, 'quest', x, y, u, { pose: on ? 'point' : 'hips', blend: null, t, expr: on ? 'surprised' : 'smug', yaw: on ? (toR ? 0.7 : -0.7) : 0.2, aim: 0.4, aimZ: 0.2,
        armR: on && !toR ? undefined : undefined, light: Lt, shadow: sh, contact: 0.3, look: on ? [0.8, 0.2] : [0, 0.3] }); }
    } else if (p.k === 'person') {
      // acting follows the sim: once a car is stopped (jam), the pointer points at it, the shrugger shrugs,
      // the note-taker looks up surprised. Before that: calm, chatting, writing.
      const pe = K.car.persona(200 + p.seed, 2), R = s * 1.0, on = jam && jam.on;
      const roles = {
        clip:   { pose: 'clipboard', expr: on ? 'surprised' : 'focused', vest: '#d8e04a', shirt: '#5d8a8f' },
        point:  { pose: on ? 'point' : 'hips', expr: on ? 'shocked' : 'content', shirt: '#c7a6c9', dir: jam && jam.x > x ? 1 : -1 },
        shrug:  { pose: on ? 'shrug' : 'stand', expr: on ? 'worried' : 'content', shirt: '#e2b04a' },
        camera: { pose: 'think', expr: on ? 'curious' : 'neutral', shirt: '#8aa3c9' },
      };
      const ro = roles[p.role] || roles.clip, flip = ro.dir === -1;
      ctx.save(); if (flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
      K.char.person(ctx, x, y, R, Object.assign({ t, seed: p.seed, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, capColor: pe.capColor, pants: '#3f4a63',
        light: { ang: flip ? -0.7 : -2.4, rim: P.rim, shade: '#3a3358' }, look: [0.4, 0.3] }, ro));
      ctx.restore();
    }
  }

  E.drawRing = function (ctx, t, frame, opt = {}) {
    if (!B) B = build();
    const P = E.PAL.field, run = E.ringRun(), simT = opt.simT ?? t;
    const S = run.at(simT);
    ctx.save();
    const z = opt.zoom || 1; ctx.translate(K.W / 2, K.H / 2); ctx.scale(z, z); ctx.translate(-K.W / 2 + (opt.dx || 0), -K.H / 2 + (opt.dy || 0));
    ctx.drawImage(B.bg.c, 0, 0);
    const cars = [];
    for (let i = 0; i < run.N; i++) {
      const a = (S.x[i] % run.p.L) / run.p.L * K.TAU, X = Math.cos(a) * RAD, Z = Math.sin(a) * RAD;
      cars.push({ i, X, Z, heading: a + Math.PI / 2, b: run.brake(i, simT) });
    }
    // long shadows on a separate layer so overlaps never double-darken
    const sh = (B.sh = B.sh || K.canvas(K.W, K.H)); sh.ctx.setTransform(1, 0, 0, 1, 0, 0); sh.ctx.clearRect(0, 0, K.W, K.H);
    sh.ctx.save(); const s0 = sh.ctx.getTransform(); void s0;
    sh.ctx.translate(K.W / 2, K.H / 2); sh.ctx.scale(1, 1); sh.ctx.translate(-K.W / 2, -K.H / 2);
    sh.ctx.fillStyle = '#000';
    for (const c of cars) K.car.top(sh.ctx, VIEW, c.X, c.Z, c.heading, { k: 1.45, shadowOnly: [SHADOW[0] * 1.2, SHADOW[1] * 1.2] });
    for (const p of B.props) {
      const [x, y] = g2s(p.X, p.Z);
      if (p.k === 'tree') { const len = p.h; sh.ctx.beginPath(); for (let u = 0; u <= 1; u += 0.1) { const [cx, cy] = g2s(p.X + SHADOW[0] * len * (0.45 + u * 0.55), p.Z + SHADOW[1] * len * (0.45 + u * 0.55)); sh.ctx.moveTo(cx + p.h * 0.32 * VIEW.sc, cy); sh.ctx.ellipse(cx, cy, p.h * 0.32 * VIEW.sc, p.h * 0.32 * VIEW.sc * VIEW.sinE, 0, 0, K.TAU); } sh.ctx.fill();
        const [ex, ey] = g2s(p.X + SHADOW[0] * p.h * 0.5, p.Z + SHADOW[1] * p.h * 0.5); sh.ctx.lineWidth = 3; sh.ctx.strokeStyle = '#000'; sh.ctx.beginPath(); sh.ctx.moveTo(x, y); sh.ctx.lineTo(ex, ey); sh.ctx.stroke(); }
      else if (p.k === 'tent' || p.k === 'person' || p.k === 'tripod' || p.k === 'cone') {
        const hh = p.k === 'tent' ? 4.0 : p.k === 'cone' ? 0.7 : 2.4, w = p.k === 'tent' ? 6.4 : 0.8; const [ex, ey] = g2s(p.X + SHADOW[0] * hh, p.Z + SHADOW[1] * hh);
        sh.ctx.lineWidth = w * VIEW.sc * 0.8; sh.ctx.lineCap = 'round'; sh.ctx.strokeStyle = '#000'; sh.ctx.beginPath(); sh.ctx.moveTo(x, y); sh.ctx.lineTo(ex, ey); sh.ctx.stroke();
      }
    }
    sh.ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(0, 178, K.W, K.H); ctx.clip();
    // tint the shadow (multiply with a cool violet)
    const tint = (B.tint = B.tint || K.canvas(K.W, K.H)); tint.ctx.globalCompositeOperation = 'copy'; tint.ctx.drawImage(sh.c, 0, 0);
    tint.ctx.globalCompositeOperation = 'source-in'; tint.ctx.fillStyle = P.shadow; tint.ctx.fillRect(0, 0, K.W, K.H);
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.55; ctx.drawImage(tint.c, 0, 0);
    ctx.restore();
    // cloud shadows drifting over the field (soft, multiply), under the cars
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    for (let k = 0; k < 3; k++) { const cx = ((k * 900 + t * 26) % 2900) - 500, cy = 420 + k * 230;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 420); g.addColorStop(0, K.rgba('#8a86a8', 0.38)); g.addColorStop(0.6, K.rgba('#8a86a8', 0.22)); g.addColorStop(1, K.rgba('#8a86a8', 0));
      ctx.fillStyle = g; ctx.save(); ctx.translate(cx, cy); ctx.scale(1.6, 0.6); ctx.translate(-cx, -cy); ctx.fillRect(cx - 420, cy - 420, 840, 840); ctx.restore(); }
    ctx.restore();
    // where is the jam? (slowest car, if stopped) -> the observers react to it
    let jam = { on: false, x: 960 };
    { let j = 0; for (let i = 1; i < run.N; i++) if (S.v[i] < S.v[j]) j = i; if (S.v[j] < 1.0) { const c = cars[j]; jam = { on: true, x: g2s(c.X, c.Z)[0] }; } }
    // depth-sorted props + cars
    const items = B.props.map(p => ({ p, z: p.Z })).concat(cars.map(c => ({ c, z: c.Z })));
    items.sort((a, b) => a.z - b.z);
    const lit = { rim: P.rim, ang: -2.45, shade: P.shadow, sunAng: Math.atan2(SUN[1], SUN[0]) };
    for (const it of items) {
      if (it.p) drawProp(ctx, it.p, P, t, jam);
      else {
        const c = it.c, isM = c.i === E.RING_MASCOT, pe = E.persona(300 + c.i);
        const stopped = S.v[c.i] < 1.0;
        K.car.top(ctx, VIEW, c.X, c.Z, c.heading, { k: 1.45, color: isM ? K.TEAL : pe.color, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, capColor: pe.capColor,
          mascot: isM, expr: isM ? (stopped ? 'annoyed' : 'content') : (stopped ? 'worried' : 'content'), brake: c.b, lit });
      }
    }
    ctx.restore();
    { // warm key from the upper left, cool fall-off to the lower right
      const g = ctx.createLinearGradient(0, 0, K.W, K.H); g.addColorStop(0, K.rgba('#ffcf8a', 0.55)); g.addColorStop(0.55, K.rgba('#ffcf8a', 0)); g.addColorStop(1, K.rgba('#5a4a8a', 0.5));
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H); ctx.restore(); }
    K.light.shafts(ctx, { n: 6, angle: -0.5, alpha: 0.07, color: '#fff0c0', y0: 0, y1: K.H, t, seed: 3 });
    K.sky.wash(ctx, 160, 40, 900, '#ffd9a0', 0.3);
    K.particles.motes(ctx, t, { n: 40, seed: 31, color: '#fff0c8', alpha: 0.5, size: 2.2, vx: 7, vy: -2 });
    // birds gliding over the field, their shadows following on the grass
    for (let i = 0; i < 3; i++) { const bx = ((i * 520 + t * (40 + i * 6)) % 2400) - 200, by = 300 + i * 120 + Math.sin(t * 0.7 + i) * 14, fl = Math.sin(t * 7 + i * 2) * 7, w = 14;
      ctx.strokeStyle = K.rgba('#3a2e40', 0.85); ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx - w, by - fl); ctx.quadraticCurveTo(bx - w * 0.4, by - 4, bx, by); ctx.quadraticCurveTo(bx + w * 0.4, by - 4, bx + w, by - fl); ctx.stroke();
      ctx.fillStyle = K.rgba('#3a3358', 0.18); K.ellipse(ctx, bx + 90, by + 160, 12, 4); ctx.fill(); }
    // foreground framing: a branch hanging in from the top right, a bush + reeds in the bottom left (out of focus)
    B.fg = B.fg || { branch: K.terrain.branchSprite({ w: 640, h: 380, dir: -1, color: '#4a5e40', dark: '#2a3530', rim: '#ffe0a0', seed: 21, blur: 3.5, leaves: 100 }),
      reeds: K.terrain.reedSprite({ w: 520, h: 300, color: '#5a6a3a', dark: '#2e3a2a', rim: '#ffe0a0', seed: 23, n: 50, heads: true, blur: 3 }) };
    K.terrain.drawSway(ctx, B.fg.branch, K.W + 30, -30, t, { amp: 0.02, ox: 640, oy: 0, ph: 1.2 });
    K.terrain.drawWind(ctx, B.fg.reeds, 200, K.H + 30, t, { amp: 0.06, ph: 0.3 });
    K.light.grade(ctx, P.grade, 0.2, 'soft-light');
    return { run, S };
  };

  K.scene('ring_field', {
    setup() { E.ringRun(); },
    draw(ctx, t, frame) { E.drawRing(ctx, t, frame, { zoom: 1.0 }); },
    post: { grain: 0.13, vignette: 0.4, vignetteColor: '#2a1a2a', bloom: 0.18 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
