/* Style frame (e) · overcast noon (the explainer-beat recipe): a toll plaza. Four lanes: three queue at a booth, the
   fourth is a free-flow lane. Every car is an agent of K.sim.queue (IDM + a barrier that opens after a seeded service
   time); brake lights, gaps and the attendants' acting (hand the ticket while a car is served, wave when it leaves)
   read the same arrays. Flat soft top light: short soft shadows under objects, no rim, desaturated 15 %.
   Generic people plus Quest and Pixie: their teal two-seater waits third in lane 2; Quest turns round and shrugs at the queue. */
(function (root) {
  const K = root.K, E = K.ep1;
  const PAL = {
    sky: [[0, '#b9c2cf'], [0.55, '#d3d7dc'], [1, '#e8e6df']], haze: '#dfe0dc', far: '#9aa7a6', mid: '#82938a', near: '#6f8470',
    grass: '#8fa06a', grassFar: '#b9c29a', road: '#6b6b72', roadLight: '#7c7c83', line: '#efece2', curb: '#cfccc2',
    booth: '#dfe3e0', boothDark: '#9aa6a8', glass: '#56707a', canopy: '#5f6f86', canopyUnder: '#4a566a', pillar: '#c9cdc9',
    shadow: '#3a4250', tree: '#5d7a58', treeDark: '#3d5244',
  };
  const G = 40, LANES = [-5.4, -1.8, 1.8, 5.4], ISL = [-7.2, -3.6, 0, 3.6, 7.2];
  const CAM = { s: 8, l: -0.8, H: 8.4, pitch: 0.165, f: 1500 };
  let Wt = null, Q = null;
  const queues = () => (Q = Q || [
    K.sim.queue({ N: 11, G, start: G - 6, gap: 8, v: 4, seed: 11, duration: 40, ts: [3, 6] }),
    K.sim.queue({ N: 11, G, start: G - 2, gap: 7.5, v: 4, seed: 12, duration: 40, ts: [2.5, 5.5] }),
    K.sim.queue({ N: 11, G, start: G - 9, gap: 8.5, v: 4, seed: 13, duration: 40, ts: [3, 5] }),
    K.sim.queue({ N: 9, G: 1e5, start: G + 30, gap: 26, v: 10, v0: 11, seed: 14, duration: 40 }),     // free-flow lane: no barrier
  ]);
  const MASCOT = { lane: 1, car: 2 };

  function build() {
    const road = K.road({ len: 3000, s0: -200, ds: 2, curves: [] });
    // sky: flat overcast + painterly stratocumulus sheets (soft top light: lit tops, grey bellies)
    const clouds = [];
    const r = K.rng(5);
    for (let k = 0; k < 9; k++) { const y = 70 + k * 34 + r() * 20, w = 420 + r() * 520 - k * 20, h = 70 + r() * 50 - k * 4;
      clouds.push({ x: r() * 2400 - 200, y, w, h, v: 4 + r() * 4, a: 0.95,
        o: { seed: 200 + k, ang: -Math.PI / 2 - 0.25, color: K.mix('#e4e7ea', '#d2d6dc', k / 9), shade: K.mix('#aab3bf', '#c3c8cf', k / 9), lit: '#f6f6f2', rim: '#fbfbf8', under: '#9ea8b6', contours: true, rimW: 0.03, litOff: 2.2, litScale: 0.9 } }); }
    // far layers
    const far = K.canvas(K.W + 400, 420), fc = far.ctx;
    K.terrain.ridge(fc, { x0: 0, x1: far.w, y: 300, amp: 120, freq: 0.0025, seed: 31, bottom: 420, color: K.mix(PAL.far, PAL.haze, 0.45) });
    K.terrain.ridge(fc, { x0: 0, x1: far.w, y: 340, amp: 70, freq: 0.005, seed: 32, bottom: 420, color: K.mix(PAL.mid, PAL.haze, 0.3) });
    const rr = K.rng(33);
    for (let x = 0; x < far.w; x += 10 + rr() * 22) { const y = 372 - (K.fbm(x * 0.006, 0.5, 4, 34) - 0.4) * 20;
      K.terrain.tree(fc, x, y, 26 + rr() * 30, { kind: rr() < 0.35 ? 'poplar' : 'round', seed: rr() * 1e6 | 0, color: K.mix(PAL.tree, PAL.haze, 0.4), shade: K.mix(PAL.treeDark, PAL.haze, 0.35), light: { dx: 0, back: 0.2, rim: null } }); }
    K.tex.paint(far, { amount: 0.4, mottle: { w: 1000, h: 300, sx: 0.004, sy: 0.04, seed: 35, amp: 36 } });
    // roadside objects (world-anchored)
    const objs = [];
    for (let s = -40; s < 600; s += 2.2) for (const side of [-1, 1]) objs.push({ k: 'tuft', s: s + rr() * 2, l: side * (10.4 + rr() * 9), h: 0.4 + rr() * 0.5, seed: rr() * 1e6 | 0 });
    for (let s = 70; s < 900; s += 14 + rr() * 30) objs.push({ k: 'tree', s, l: (rr() < 0.5 ? -1 : 1) * (16 + rr() * 50), h: 7 + rr() * 6, kind: rr() < 0.3 ? 'poplar' : 'round', seed: rr() * 1e6 | 0 });
    for (let s = -20; s < 600; s += 3) objs.push({ k: 'fence', s, l: 12.5, h: 1.0 });
    for (let s = 10; s < 600; s += 36) objs.push({ k: 'lamp', s, l: -10.6, h: 9 });
    objs.push({ k: 'office', s: G + 14, l: -17 }, { k: 'sock', s: G - 6, l: 11.4, h: 6 });
    return { road, clouds, far, objs };
  }

  // ---------------------------------------------------------------- drawing helpers (3D boxes in road coordinates)
  function makeProj(road, rig, cam) {
    const P = (s, l, y = 0) => { const w = road.world(s, l), c = rig.toCam(w.x, w.z); if (c[1] < 0.8) return null; const p = cam.proj(c[0], y, c[1]); return p; };
    const poly = (pts, col) => { const q = pts.map(([s, l, y]) => P(s, l, y)); if (q.some(v => !v)) return false; ctx0.fillStyle = col; ctx0.beginPath(); q.forEach((p, i) => (i ? ctx0.lineTo(p.x, p.y) : ctx0.moveTo(p.x, p.y))); ctx0.closePath(); ctx0.fill(); return q; };
    let ctx0 = null;
    const box = (ctx, s0, s1, l0, l1, y0, y1, c) => {   // c: { top, front, side, back }
      ctx0 = ctx;
      if (CAM.l > l1 && c.side) poly([[s0, l1, y0], [s1, l1, y0], [s1, l1, y1], [s0, l1, y1]], c.sideR || c.side);   // right face (camera is to its right)
      if (CAM.l < l0 && c.side) poly([[s0, l0, y0], [s1, l0, y0], [s1, l0, y1], [s0, l0, y1]], c.side);
      if (c.top && y1 < CAM.H) poly([[s0, l0, y1], [s1, l0, y1], [s1, l1, y1], [s0, l1, y1]], c.top);
      if (c.bottom && y0 > CAM.H) poly([[s0, l0, y0], [s1, l0, y0], [s1, l1, y0], [s0, l1, y0]], c.bottom);
      return poly([[s0, l0, y0], [s0, l1, y0], [s0, l1, y1], [s0, l0, y1]], c.front);
    };
    return { P, box, setCtx: c => (ctx0 = c) };
  }

  E.drawToll = function (ctx, t, frame, opt = {}) {
    if (!Wt) Wt = build();
    const road = Wt.road, qs = queues();
    const cam = K.persp({ f: CAM.f * (1 + 0.03 * K.ease.sine(K.clamp(t / 20))), H: CAM.H, pitch: CAM.pitch, cy: K.H / 2 });
    const rig = road.rig(CAM.s + Math.sin(t * 0.2) * 0.3, CAM.l, Math.sin(t * 0.15) * 0.004);
    const hz = cam.horizon, PR = makeProj(road, rig, cam), P = PR.P;
    // sky + clouds
    K.sky.gradient(ctx, PAL.sky, 0, hz + 20);
    K.sky.drawClouds(ctx, Wt.clouds, t, { dy: hz - 330 });
    K.light.haze(ctx, hz - 160, hz, hz + 30, PAL.haze, 0.6);
    // birds
    ctx.strokeStyle = K.rgba('#4a505c', 0.75); ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const bx = ((500 + i * 160 + t * (24 + i * 3)) % 2300) - 150, by = hz - 220 + i * 18 + Math.sin(t * 0.8 + i) * 8, fl = Math.sin(t * 7 + i) * 5, w = 9 - i * 0.5;
      ctx.beginPath(); ctx.moveTo(bx - w, by - fl); ctx.quadraticCurveTo(bx - w * 0.4, by - 3, bx, by); ctx.quadraticCurveTo(bx + w * 0.4, by - 3, bx + w, by - fl); ctx.stroke(); }
    ctx.drawImage(Wt.far.c, -200, hz - 372);
    // ground
    const gg = ctx.createLinearGradient(0, hz, 0, K.H); gg.addColorStop(0, K.mix(PAL.grassFar, PAL.haze, 0.5)); gg.addColorStop(0.3, PAL.grassFar); gg.addColorStop(1, PAL.grass);
    ctx.fillStyle = gg; ctx.fillRect(0, hz - 1, K.W, K.H - hz + 1);
    const ptOf = (s, l) => { const p = P(s, l, 0); return p ? { x: p.x, y: p.y, d: p.d } : null; };
    K.terrain.brush(ctx, ptOf, { sCam: CAM.s, sMin: CAM.s + 2, sMax: CAM.s + 500, per: 3, lAt: d => [CAM.l - d * 0.7 - 6, CAM.l + d * 0.7 + 6], skip: (s, l) => Math.abs(l) < 9.8,
      fogK: d => 1 - K.clamp(d / 600) * 0.8, colors: [['#c9d19a', 0.2], ['#55684a', 0.18], ['#dfe3c0', 0.12], ['#7a8a50', 0.16]] });
    // asphalt (wide plaza), lane paint, islands
    const fogOf = d => [PAL.haze, K.clamp(1 - Math.exp(-d / 700), 0, 0.85)];
    for (let s = CAM.s + 1; s < CAM.s + 900; s += (s - CAM.s < 80 ? 4 : 20)) {
      const s2 = s + (s - CAM.s < 80 ? 4 : 20);
      const q = [P(s, -9.6), P(s2, -9.6), P(s2, 9.6), P(s, 9.6)]; if (q.some(v => !v)) continue;
      const fg = fogOf(s - CAM.s); ctx.fillStyle = K.mix(PAL.road, fg[0], fg[1]); ctx.beginPath(); q.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke();
    }
    // asphalt brushwork: worn tyre tracks + patches, world-anchored
    K.terrain.brush(ctx, ptOf, { sCam: CAM.s, sMin: CAM.s + 2, sMax: CAM.s + 160, per: 3, lAt: () => [-9.4, 9.4], colors: [['#58585f', 0.35], ['#86868c', 0.22], ['#4c4c54', 0.25]] });
    for (const l of LANES) for (const dl of [-0.55, 0.55]) {   // darker wheel tracks
      const q = [P(CAM.s + 2, l + dl - 0.25), P(G - 4, l + dl - 0.25), P(G - 4, l + dl + 0.25), P(CAM.s + 2, l + dl + 0.25)]; if (q.some(v => !v)) continue;
      ctx.fillStyle = K.rgba('#4a4a52', 0.35); ctx.beginPath(); q.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.fill();
    }
    const quad = (s0, s1, l0, l1, col, y = 0) => { const q = [P(s0, l0, y), P(s1, l0, y), P(s1, l1, y), P(s0, l1, y)]; if (q.some(v => !v)) return; ctx.fillStyle = col; ctx.beginPath(); q.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.fill(); };
    for (const l of [-9.3, 9.3]) quad(CAM.s + 1, CAM.s + 600, l - 0.08, l + 0.08, PAL.line);
    for (const l of [-3.6, 0, 3.6]) for (let s = Math.floor((CAM.s + 1) / 9) * 9; s < G - 14; s += 9) quad(s, s + 4, l - 0.07, l + 0.07, K.rgba(PAL.line, 0.85));
    for (const l of LANES) quad(G - 0.1, G + 0.25, l - 1.4, l + 1.4, K.rgba(PAL.line, 0.9));   // stop line
    // shadows (soft, short, under objects only)
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    const softShadow = (s, l, rs, rl, a) => { const c = P(s, l); if (!c) return; const e = P(s, l + rl); const rx = e ? Math.abs(e.x - c.x) : 10; const ry = Math.max(1.5, rx * (rs / rl) * (cam.H / Math.max(4, c.d)) * 1.2);
      const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, rx); g.addColorStop(0, K.rgba(PAL.shadow, a)); g.addColorStop(0.7, K.rgba(PAL.shadow, a * 0.6)); g.addColorStop(1, K.rgba(PAL.shadow, 0));
      ctx.fillStyle = g; ctx.save(); ctx.translate(c.x, c.y); ctx.scale(1, ry / rx); ctx.translate(-c.x, -c.y); K.circle(ctx, c.x, c.y, rx); ctx.fill(); ctx.restore(); };
    for (const l of ISL) softShadow(G, l, 4, 1.6, 0.28);
    softShadow(G, 0, 6, 11, 0.22);    // the canopy's soft shade on the plaza
    ctx.restore();

    // ---------------------------------------------------------------- items (depth sorted)
    const items = [];
    const push = (d, fn) => { if (d > 0.8) items.push({ d, fn }); };
    const dOf = (s, l) => { const w = road.world(s, l), c = rig.toCam(w.x, w.z); return c[1]; };
    // islands + booths + pillars
    for (const l of ISL) PR.box(ctx, G - 12, G + 7, l - 0.5, l + 0.5, 0, 0.22, { top: '#bdbab0', front: '#a8a59b', side: '#9c998f' });   // flat curbs: ground pass
    for (const l of ISL) {
      push(dOf(G - 12.6, l), () => {
        // hazard nose (yellow + ink chevrons)
        const q = PR.box(ctx, G - 12.6, G - 12, l - 0.6, l + 0.6, 0, 0.7, { top: '#e8c64a', front: '#e8c64a', side: '#c9a83a' });
        if (q) { ctx.save(); ctx.beginPath(); q.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.clip(); ctx.fillStyle = '#2a2a30';
          const x0 = Math.min(...q.map(p => p.x)), x1 = Math.max(...q.map(p => p.x)), y0 = Math.min(...q.map(p => p.y)), y1 = Math.max(...q.map(p => p.y)), w = (x1 - x0) / 3;
          for (let k = -2; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x0 + k * w, y1); ctx.lineTo(x0 + k * w + w * 0.5, y1); ctx.lineTo(x0 + k * w + w * 0.5 + (y1 - y0) * 0.6, y0); ctx.lineTo(x0 + k * w + (y1 - y0) * 0.6, y0); ctx.fill(); }
          ctx.restore(); }
      });
      if (Math.abs(l) < 7) push(dOf(G - 1.8, l) - 0.01, () => {
        // booth: walls, a glass band, a roof slab; the attendant stands in the open door side
        PR.box(ctx, G - 1.8, G + 1.8, l - 0.75, l + 0.75, 0.22, 3.3, { top: '#c4cac8', front: PAL.booth, side: '#c8cecb', sideR: '#d6dbd8' });
        PR.box(ctx, G - 1.82, G + 1.2, l - 0.77, l + 0.77, 1.5, 2.8, { front: PAL.glass, side: K.mix(PAL.glass, '#8fb0b8', 0.3), sideR: K.mix(PAL.glass, '#a9c4ca', 0.35) });
        PR.box(ctx, G - 2.1, G + 2.1, l - 0.95, l + 0.95, 3.3, 3.6, { top: '#e8ebe8', front: '#9aa6a8', side: '#8d989a' });
      });
    }
    // canopy (slab + fascia with the lane signals) and pillars
    const canopyD = dOf(G - 5, 0);
    push(canopyD - 0.02, () => {
      for (const l of [-9.2, -3.6, 0, 3.6, 9.2]) PR.box(ctx, G + 0.2, G + 0.8, l - 0.25, l + 0.25, 3.6, 5.3, { front: PAL.pillar, side: '#aeb2ae', sideR: '#bfc3bf' });
      PR.box(ctx, G - 5, G + 5, -9.8, 9.8, 5.3, 6.1, { front: PAL.canopy, top: '#8a96a6', bottom: PAL.canopyUnder, side: '#56657a', sideR: '#6a7a90' });
      // the soft light strips under the canopy
      for (const l of LANES) { const a = P(G - 4.6, l, 5.3), b = P(G + 4, l, 5.3); if (a && b) { ctx.strokeStyle = K.rgba('#fbf6e6', 0.85); ctx.lineWidth = Math.max(1.5, a.s * 0.12); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); K.light.glow(ctx, a.x, a.y + 4, a.s * 1.2, '#fff6dc', 0.25, 'screen'); } }
      // fascia: lane signals (a green arrow on every lane; the free-flow lane shows a double arrow) and the word PEAJE
      const fs = P(G - 5, 0, 5.7); if (!fs) return;
      ctx.save(); ctx.font = `700 ${Math.round(fs.s * 0.55)}px "Martian Mono"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f3ecdd';
      ctx.fillText('PEAJE', fs.x, fs.y + fs.s * 0.02); ctx.restore();
      LANES.forEach((l, k) => {
        const p = P(G - 5.01, l + (k < 2 ? -0.2 : 0.2) + (k === 1 || k === 2 ? (k === 1 ? -0.7 : 0.7) : 0), 5.7); if (!p) return; const r = p.s * 0.26;
        ctx.fillStyle = '#20262e'; K.rrect(ctx, p.x - r * 1.3, p.y - r * 1.25, r * 2.6, r * 2.5, r * 0.4); ctx.fill();
        K.light.glow(ctx, p.x, p.y, r * 4, '#7dff9a', 0.28, 'screen');
        ctx.strokeStyle = '#8dffb0'; ctx.lineWidth = r * 0.36; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const arrow = dx => { ctx.beginPath(); ctx.moveTo(p.x + dx, p.y - r * 0.8); ctx.lineTo(p.x + dx, p.y + r * 0.7); ctx.moveTo(p.x + dx - r * 0.55, p.y + r * 0.15); ctx.lineTo(p.x + dx, p.y + r * 0.75); ctx.lineTo(p.x + dx + r * 0.55, p.y + r * 0.15); ctx.stroke(); };
        if (k === 3) { arrow(-r * 0.42); arrow(r * 0.42); } else arrow(0);
      });
    });
    // roadside objects
    for (const ob of Wt.objs) {
      const d = dOf(ob.s, ob.l); if (d < 1 || d > 900) continue;
      push(d, () => {
        const p = P(ob.s, ob.l, 0); if (!p) return; const fg = fogOf(d);
        if (ob.k === 'tuft') { if (d > 70) return; K.terrain.tuft(ctx, p.x, p.y, ob.h * p.s, K.mix('#55684a', fg[0], fg[1]), { seed: ob.seed, n: 6, wind: Math.sin(t * 2 + ob.s) * 0.18 }); }
        else if (ob.k === 'tree') K.terrain.tree(ctx, p.x, p.y, ob.h * p.s, { kind: ob.kind, seed: ob.seed, color: K.mix(PAL.tree, fg[0], fg[1]), shade: K.mix(PAL.treeDark, fg[0], fg[1]), trunk: K.mix('#5a4a40', fg[0], fg[1]),
          light: { dx: 0, back: 0.15, rim: null }, sway: Math.sin(t * 1.1 + ob.s * 0.07) * 0.02 });
        else if (ob.k === 'fence') { const q = P(ob.s + 3, ob.l, 0); const hp = ob.h * p.s, pw = Math.max(1, 0.1 * p.s); ctx.fillStyle = K.mix('#8a7a6a', fg[0], fg[1]);
          K.rrect(ctx, p.x - pw / 2, p.y - hp, pw, hp, pw * 0.3); ctx.fill(); if (q) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(0.7, 0.06 * p.s); for (const hh of [0.45, 0.85]) { ctx.beginPath(); ctx.moveTo(p.x, p.y - hh * hp); ctx.lineTo(q.x, q.y - hh * ob.h * q.s); ctx.stroke(); } } }
        else if (ob.k === 'lamp') { const top = P(ob.s, ob.l, ob.h), arm = P(ob.s, ob.l + 1.8, ob.h); if (!top || !arm) return; ctx.strokeStyle = K.mix('#7d858c', fg[0], fg[1]); ctx.lineWidth = Math.max(1, 0.16 * p.s); ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(top.x, top.y); ctx.quadraticCurveTo((top.x + arm.x) / 2, top.y - 0.3 * p.s, arm.x, arm.y); ctx.stroke(); ctx.fillStyle = K.mix('#5a6168', fg[0], fg[1]); K.ellipse(ctx, arm.x, arm.y + 0.1 * p.s, 0.4 * p.s, 0.14 * p.s); ctx.fill(); }
        else if (ob.k === 'office') {   // the staff building: a low block with a door and windows
          PR.box(ctx, ob.s - 5, ob.s + 5, ob.l - 4, ob.l + 4, 0, 3.4, { top: '#bfc4c0', front: '#e2dccd', side: '#d0cabb', sideR: '#ece6d8' });
          PR.box(ctx, ob.s - 5.3, ob.s + 5.3, ob.l - 4.3, ob.l + 4.3, 3.4, 3.8, { top: '#8d9698', front: '#7a8486', side: '#6e787a', sideR: '#879092' });
          for (const dl of [-2.6, -1.2, 1.4, 2.8]) PR.box(ctx, ob.s - 5.01, ob.s - 5, ob.l + dl - 0.5, ob.l + dl + 0.5, 1.2, 2.3, { front: '#6f8a92' });
          PR.box(ctx, ob.s - 5.01, ob.s - 5, ob.l + 0.0 - 0.45, ob.l + 0.45, 0, 2.2, { front: '#8a6a52' });
        } else if (ob.k === 'sock') {   // windsock: the only thing that tells you how windy it is
          const top = P(ob.s, ob.l, ob.h); if (!top) return; ctx.strokeStyle = '#8d959c'; ctx.lineWidth = Math.max(1, 0.1 * p.s); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(top.x, top.y); ctx.stroke();
          const L = 1.8 * p.s, segs = 5; for (let k = 0; k < segs; k++) { const u0 = k / segs, u1 = (k + 1) / segs, wob = a => Math.sin(t * 5 - a * 4) * 0.12 * a * p.s * 1.5 + Math.sin(t * 1.3) * 0.2 * a * p.s;
            const x0 = top.x + u0 * L, x1 = top.x + u1 * L, y0 = top.y + wob(u0) + u0 * 0.25 * p.s, y1 = top.y + wob(u1) + u1 * 0.25 * p.s, h0 = 0.3 * p.s * (1 - u0 * 0.45), h1 = 0.3 * p.s * (1 - u1 * 0.45);
            ctx.fillStyle = k % 2 ? '#f3ecdd' : '#e88a3a'; ctx.beginPath(); ctx.moveTo(x0, y0 - h0); ctx.lineTo(x1, y1 - h1); ctx.lineTo(x1, y1 + h1); ctx.lineTo(x0, y0 + h0); ctx.fill(); } }
      });
    }
    // cars from the queues + the attendants (acting from the queue state)
    const lit = { rim: null, shade: PAL.shadow, ang: -1.57, dx: 0, shadeK: 0.18 };
    qs.forEach((q, li) => {
      const S = q.at(t), lc = LANES[li], srv = q.service(t);
      for (let i = 0; i < q.N; i++) {
        const sC = S.x[i] - 1.7; const d = dOf(sC, lc); if (d < 2 || d > 700) continue;
        const isM = li === MASCOT.lane && i === MASCOT.car, pe = E.persona(500 + li * 20 + i);
        push(d, () => {
          const p = P(sC, lc, 0); if (!p) return; const fg = fogOf(d);
          ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = K.rgba(PAL.shadow, 0.3); K.ellipse(ctx, p.x, p.y + p.s * 0.04, p.s * 1.0, p.s * 0.14); ctx.fill(); ctx.restore();
          const stopped = S.v[i] < 0.3, waiting = stopped && !S.paid[i];
          K.car.rear(ctx, p.x, p.y, p.s, { color: isM ? K.TEAL : pe.color, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, capColor: pe.capColor, driver: !isM, seats: isM ? 2 : 1,
            brake: q.brake(i, t), fog: [fg[0], fg[1]], lit, bob: S.v[i] > 0.5 ? Math.sin(t * 9 + i) * 0.02 : 0, glowScale: 2.2 });
          if (isM) {   // v4: Eli turns round to us and shrugs at the queue; Mila (passenger) watches the booth, then glances back at him
            const W = 1.7 * 1.24 * p.s, top = p.y - 1.0 * p.s, u = 2.7 * p.s, seat = top + 0.34 * p.s, NL = Object.assign({}, K.cast.LIGHT.noon);
            const cyc = t % 4.2, sk = waiting ? K.ease.sine(K.clamp(cyc / 0.3)) * (1 - K.ease.sine(K.clamp((cyc - 2.3) / 0.3))) : 0;
            K.cast.draw(ctx, 'mila1', p.x + W * 0.21, seat + 0.02 * p.s, u, { view: sk > 0.5 ? 'backq' : 'back', dir: -1, pose: 'lap', seated: true, t, light: NL, fog: [fg[0], fg[1]] });
            K.cast.draw(ctx, 'eli1', p.x - W * 0.21, seat, u, { view: 'front', pose: 'lap', blend: { pose: 'shrug', k: sk }, seated: true, t, light: NL, fog: [fg[0], fg[1]],
              expr: waiting ? (sk > 0.3 ? 'annoyed' : 'neutral') : 'happy', look: [0.2, 0] });
            // the car body in front of their lower halves
            ctx.save(); ctx.beginPath(); ctx.rect(p.x - p.s * 1.5, p.y - 1.0 * p.s, p.s * 3, p.s * 1.0); ctx.clip();
            K.car.rear(ctx, p.x, p.y, p.s, { color: K.TEAL, driver: false, seats: 2, brake: q.brake(i, t), fog: [fg[0], fg[1]], lit, glowScale: 2.2 }); ctx.restore();
          }
        });
      }
      // attendant on the island to the left of the lane (lanes 0-2): hands the ticket while a car is served, waves it off
      if (li < 3) {
        const sP = G - 2.4, lP = lc - 2.05, d = dOf(sP, lP);
        const pe = K.car.persona(700 + li, 5);
        push(d - 0.05, () => {
          const p = P(sP, lP, 0.22); if (!p) return;
          let pose = 'stand', expr = 'content';
          if (srv.car >= 0 && srv.since >= 0) { pose = 'point'; expr = srv.since < 1.2 ? 'content' : 'focused'; }
          else if (srv.sinceLeft >= 0 && srv.sinceLeft < 1.6) { pose = 'wave'; expr = 'delighted'; }
          if (srv.sinceLeft >= 0 && srv.sinceLeft < 1.4 && srv.since < 0.6) { pose = 'wave'; expr = 'delighted'; }
          K.char.person(ctx, p.x, p.y, 0.5 * p.s, { pose, expr, t, seed: li + 3, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle === 'cap' ? 'short' : pe.hairStyle, shirt: '#8aa3c9', pants: '#3f4a63', vest: '#d8e04a',
            light: { ang: -1.57, rim: null, shade: PAL.shadow }, look: [0.6, 0.1] });
        });
      }
    });
    // the supervisor on the near island with a clipboard, and a colleague walking up the island
    { const sP = G - 9.5, lP = 7.2, d = dOf(sP, lP); const pe = K.car.persona(801, 5);   // v3: moved off the heroes' lane
      push(d - 0.05, () => { const p = P(sP, lP, 0.22); if (!p) return; K.char.person(ctx, p.x, p.y, 0.5 * p.s, { pose: 'clipboard', expr: 'focused', t, seed: 9, skin: pe.skin, hair: pe.hair, hairStyle: 'bun', shirt: '#5d8a8f', pants: '#2f4f4a', vest: '#d8e04a', light: { ang: -1.57, shade: PAL.shadow }, look: [-0.3, 0.2] }); }); }
    { const sP = G - 6 - ((t * 0.9) % 14) * 0 - Math.min(5, t * 0.45), lP = 3.6, d = dOf(sP, lP); const pe = K.car.persona(802, 5);
      push(d - 0.05, () => { const p = P(sP, lP, 0.22); if (!p) return; K.char.person(ctx, p.x, p.y, 0.5 * p.s, { pose: 'walk', expr: 'content', t, seed: 4, skin: pe.skin, hair: pe.hair, hairStyle: 'cap', capColor: '#4f7a4a', shirt: '#c9b46a', pants: '#3f4a63', vest: '#d8e04a', light: { ang: -1.57, shade: PAL.shadow }, look: [0, 0.2] }); }); }
    items.sort((a, b) => b.d - a.d);
    for (const it of items) it.fn();
    // foreground framing: a bush and tall grass at the bottom corners (out of focus), a sign post on the right
    Wt.fg = Wt.fg || { reeds: K.terrain.reedSprite({ w: 460, h: 300, color: '#6a7a50', dark: '#3e4a3a', seed: 41, n: 46, heads: true, blur: 3 }),
      bush: K.terrain.branchSprite({ w: 620, h: 360, dir: -1, color: '#5d7a58', dark: '#34483c', seed: 43, blur: 3.5, leaves: 120 }) };
    K.terrain.drawWind(ctx, Wt.fg.reeds, 150, K.H + 40, t, { amp: 0.05, ph: 0.2 });
    K.terrain.drawSway(ctx, Wt.fg.bush, K.W + 40, -40, t, { amp: 0.018, ox: 620, oy: 0, ph: 0.8 });
    // dust drifting in the flat light, the grade (overcast: desaturate 15 %, cool soft light 12 %)
    K.particles.motes(ctx, t, { n: 30, seed: 77, color: '#ffffff', alpha: 0.35, size: 1.8, vx: 9, vy: -2, mode: 'screen' });
    ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.15; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, K.W, K.H); ctx.restore();
    K.light.grade(ctx, '#9fb6c8', 0.12, 'soft-light');
    return { hz };
  };

  K.scene('toll_plaza', {
    setup() { queues(); },
    draw(ctx, t, frame) { E.drawToll(ctx, t, frame); },
    post: { grain: 0.12, vignette: 0.3, vignetteColor: '#2a3040', bloom: 0.08 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
