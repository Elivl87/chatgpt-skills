/* Ep 001 · animatic worlds for Act 4 (beats 20-21): the four-lane golden-dawn highway seen from a crane (oblique view;
   ONE lane is the true S10 run, the other three replay the same run shifted along the road, stated on screen as an
   illustration), the speed line where the wave is a red bump that travels backwards (read live from S10), the
   footbridge from below (Eli and Mila at the railing, low angle, sky behind them), and the props of the act:
   hands that count, the ink drop, Eli's teal pennant. */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const INK = '#2a1a1e', PAPER = '#fbf3e4', TEAL = '#23746C', TEAL_L = '#4fb3a8', RED = '#e0503a';
  let r10 = null;
  A.s10 = () => (r10 = r10 || A.adapter('S10'));
  const LANE_W = 3.7, LANES = [-1.5, -0.5, 0.5, 1.5].map(k => k * LANE_W), SIM_LANE = 2, LANE_DX = [11.3, 4.1, 0, 7.7];
  A.I24 = { LANES, SIM_LANE, V: 10 };
  const hash = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  // ------------------------------------------------------------------ the wave: where it is (smoothed), how big
  A.waveS = function (ts, win = 2.0) {
    const R = A.s10(); let acc = 0, w = 0;
    for (let k = -4; k <= 4; k++) {
      const S = R.at(ts + k * win / 4); let best = -1, bv = 1e9;
      for (let i = 20; i < R.N - 2; i++) if (S.v[i] < bv) { bv = S.v[i]; best = i; }
      const ww = Math.exp(-(k * k) / 6) * Math.max(0.05, A.I24.V - bv); acc += S.x[best] * ww; w += ww;
    }
    return acc / Math.max(1e-6, w);
  };

  // ------------------------------------------------------------------ oblique highway (crane), golden dawn
  // c: { simT, sC (road metre at screen x = 960), sc (px per metre), sinE, oy (screen y of the road axis), sky (px band),
  //      halo: 0..1 (active cars' teal halo), off: 0..1 (grey rings on the 4 cars with the system off), haloAll (halo on
  //      the copies too), carK, under(ctx, V, proj), over(ctx, V, proj) }
  A.i24 = function (ctx, t, c) {
    const R = A.s10(), ts = c.simT, S = R.at(ts), sc = c.sc || 4, sinE = c.sinE || 0.58, cosE = Math.sqrt(1 - sinE * sinE);
    const sC = c.sC ?? A.waveS(ts), oy = c.oy ?? 560, zk = c.zk ?? 2.2;
    const V = { sc, sinE, cosE, ox: 960, oy };
    const X = s => 960 + (s - sC) * sc, Y = z => oy + z * zk * sc * sinE;
    const proj = (s, z, h = 0) => [X(s), Y(z) - h * sc * cosE];
    const s0 = sC - 960 / sc - 30, s1 = sC + 960 / sc + 30;
    // fields (parcels of golden greens / ochres), anchored on the road
    const PAL = ['#8a9a55', '#9fae5e', '#b9a95c', '#7f9150', '#c7b06a', '#93a35a', '#a8a463'];
    const zTop = (0 - oy) / (zk * sc * sinE) - 10, zBot = (K.H - oy) / (zk * sc * sinE) + 10, BS = 90, BZ = 70;
    for (let bs = Math.floor(s0 / BS); bs * BS < s1; bs++) for (let bz = Math.floor(zTop / BZ); bz * BZ < zBot; bz++) {
      const h = hash(bs, bz + 500); ctx.fillStyle = PAL[(h * PAL.length) | 0];
      const x0 = X(bs * BS), y0 = Y(bz * BZ); ctx.fillRect(x0 - 0.5, y0 - 0.5, BS * sc + 1, BZ * zk * sc * sinE + 1);
      if (h > 0.55) { ctx.strokeStyle = K.rgba('#6a7a3e', 0.35); ctx.lineWidth = Math.max(1, sc * 0.25); for (let j = 1; j < 6; j++) { const yy = y0 + j * BZ * zk * sc * sinE / 6; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 + BS * sc, yy); ctx.stroke(); } }
    }
    // verges, shoulders, lanes
    ctx.fillStyle = '#7d8c4c'; ctx.fillRect(0, Y(-16), K.W, Y(16) - Y(-16));
    ctx.fillStyle = '#6f6a78'; ctx.fillRect(0, Y(-9.6), K.W, Y(9.6) - Y(-9.6));
    ctx.fillStyle = '#5d5868'; ctx.fillRect(0, Y(-7.4), K.W, Y(7.4) - Y(-7.4));
    // warm sun wash on the asphalt
    const gw = ctx.createLinearGradient(0, 0, K.W, 0); gw.addColorStop(0, K.rgba('#ffcf8a', 0.16)); gw.addColorStop(1, K.rgba('#ffcf8a', 0)); ctx.fillStyle = gw; ctx.fillRect(0, Y(-9.6), K.W, Y(9.6) - Y(-9.6));
    ctx.fillStyle = K.rgba('#f3ecdd', 0.85); const lw = Math.max(1.2, sc * 0.15);
    for (const z of [-7.4, 7.4]) ctx.fillRect(0, Y(z) - lw / 2, K.W, lw);
    for (const z of [-LANE_W, 0, LANE_W]) for (let s = Math.floor(s0 / 12) * 12; s < s1; s += 12) ctx.fillRect(X(s), Y(z) - lw / 2, 3 * sc, lw);
    // guardrails
    ctx.strokeStyle = K.rgba('#d8d2c8', 0.8); ctx.lineWidth = Math.max(1, sc * 0.2);
    for (const z of [-10.2, 10.2]) { ctx.beginPath(); ctx.moveTo(0, Y(z) - 0.7 * sc * cosE); ctx.lineTo(K.W, Y(z) - 0.7 * sc * cosE); ctx.stroke(); }
    if (c.under) c.under(ctx, V, proj);
    // trees on both verges (far row behind the cars, near row drawn after)
    const tree = (s, z, r) => { const [x, y] = proj(s, z, 0); if (x < -r * sc * 2 || x > K.W + r * sc * 2) return;
      ctx.fillStyle = K.rgba('#2e2a3a', 0.28); K.ellipse(ctx, x + r * sc * 0.6, y + r * sc * 0.15, r * sc * 1.1, r * sc * 0.55 * sinE + 1); ctx.fill();
      const [tx, ty] = proj(s, z, r * 1.6); ctx.fillStyle = '#4f6a3a'; K.circle(ctx, tx, ty, r * sc); ctx.fill();
      ctx.fillStyle = '#6d8a48'; K.circle(ctx, tx - r * sc * 0.25, ty - r * sc * 0.25, r * sc * 0.7); ctx.fill();
      ctx.fillStyle = K.rgba('#ffd99a', 0.45); K.circle(ctx, tx - r * sc * 0.45, ty - r * sc * 0.4, r * sc * 0.35); ctx.fill(); };
    const rows = s => { for (let k = Math.floor(s0 / 19); k * 19 < s1; k++) for (const [z, seed] of [[-13.5, 1], [-24, 2], [14, 3]]) { const h = hash(k, seed); if (h < 0.45) continue; s(k * 19 + h * 9, z + (h - 0.5) * 4, 2.2 + h * 1.4, seed); } };
    rows((s, z, r, seed) => { if (seed !== 3) tree(s, z, r); });
    // cars: lanes far to near; one lane is the sim, the others replay it shifted (illustration)
    const kCar = c.carK || 1.35, mini = sc * kCar < 7;
    const lit = { rim: '#ffd99a', sunAng: -2.6, ang: -2.4, shade: '#3c2a52' };
    for (let j = 0; j < 4; j++) {
      const z = LANES[j];
      for (let i = 0; i < R.N; i++) {
        const s = S.x[i] + LANE_DX[j]; if (s < s0 || s > s1) continue;
        const isSim = j === SIM_LANE, act = isSim && R.raw.roles.active.includes(i), off = isSim && R.raw.roles.inactive.includes(i);
        const b = R.brake(i, ts), pe = K.car.persona(i * 4 + j + 11, 3), [x, y] = proj(s, z);
        if (act && (c.halo || 0) > 0.01) { K.light.glow(ctx, x, y, 7 * sc * kCar, TEAL_L, 0.55 * c.halo, 'screen'); ctx.save(); ctx.globalAlpha = c.halo; ctx.strokeStyle = TEAL_L; ctx.lineWidth = Math.max(2, sc * 0.45); K.ellipse(ctx, x, y, 3.6 * sc * kCar, 2.2 * sc * kCar * sinE + 2); ctx.stroke(); ctx.restore(); }
        if (off && (c.off || 0) > 0.01) { ctx.save(); ctx.globalAlpha = c.off; ctx.strokeStyle = '#9a96a6'; ctx.lineWidth = Math.max(2, sc * 0.45); ctx.setLineDash([sc * 1.2, sc * 0.8]); K.ellipse(ctx, x, y, 3.6 * sc * kCar, 2.2 * sc * kCar * sinE + 2); ctx.stroke(); ctx.restore(); }
        if (!isSim && c.haloAll && hash(i, j) < 0.035) { ctx.save(); ctx.globalAlpha = c.haloAll; ctx.strokeStyle = TEAL_L; ctx.lineWidth = Math.max(2, sc * 0.45); K.ellipse(ctx, x, y, 3.6 * sc * kCar, 2.2 * sc * kCar * sinE + 2); ctx.stroke(); ctx.restore(); }
        const col = act ? K.TEAL : off ? '#8f8a9c' : pe.color;
        if (mini) miniCar(ctx, x, y, sc * kCar, sinE, cosE, col, b);
        else K.car.top(ctx, V, (s - sC), z * zk, 0, { k: kCar, color: col, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, capColor: pe.capColor, brake: b, lit, expr: b > 0.5 ? 'annoyed' : 'content' });
        if (c.carOver) c.carOver(ctx, i, j, x, y, b, act, off);
      }
    }
    rows((s, z, r, seed) => { if (seed === 3) tree(s, z, r); });
    if (c.over) c.over(ctx, V, proj);
    // sky band with hills at the top (a backdrop beyond the fields)
    if (c.sky) {
      const H0 = c.sky, g = ctx.createLinearGradient(0, 0, 0, H0); g.addColorStop(0, '#8f8fbf'); g.addColorStop(0.55, '#f0b587'); g.addColorStop(1, '#ffdca0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, H0);
      K.sky.wash(ctx, 360, H0 * 0.9, 600, '#fff0c0', 0.6);
      ctx.fillStyle = '#9c8a9e'; ctx.beginPath(); ctx.moveTo(0, H0); for (let x = 0; x <= K.W; x += 60) ctx.lineTo(x, H0 - 30 - 26 * Math.sin(x * 0.004 + 1) - 14 * Math.sin(x * 0.011)); ctx.lineTo(K.W, H0); ctx.fill();
      ctx.fillStyle = '#87866f'; ctx.beginPath(); ctx.moveTo(0, H0 + 2); for (let x = 0; x <= K.W; x += 50) ctx.lineTo(x, H0 - 10 - 12 * Math.sin(x * 0.007 + 3)); ctx.lineTo(K.W, H0 + 2); ctx.fill();
      const fade = ctx.createLinearGradient(0, H0 - 4, 0, H0 + 60); fade.addColorStop(0, K.rgba('#ffdca0', 0.7)); fade.addColorStop(1, K.rgba('#ffdca0', 0)); ctx.fillStyle = fade; ctx.fillRect(0, H0 - 4, K.W, 64);
    }
    // dawn light
    K.light.rays(ctx, 260, -80, { n: 9, spread: 1.5, angle: Math.PI / 2 - 0.5, len: 1700, width: 0.05, alpha: 0.07, color: '#ffe0a0', t, seed: 61 });
    K.particles.motes(ctx, t, { n: 36, seed: 63, x0: 0, x1: K.W, y0: 0, y1: K.H, color: '#ffe6b0', alpha: 0.4, size: 2, vx: 5, vy: -2 });
    K.light.grade(ctx, '#ff9a5a', 0.14, 'soft-light');
    return { V, proj, X, Y, sC, S };
  };
  // a small car for wide views (body, roof, glass, brake lamps), facing +x
  function miniCar(ctx, x, y, s, sinE, cosE, col, b) {
    const L = 3.4 * s, W = 1.7 * s * sinE, H = 0.9 * s * cosE;
    ctx.fillStyle = K.rgba('#20142a', 0.3); K.ellipse(ctx, x, y + 0.2 * s, L * 0.55, W * 0.7 + 1); ctx.fill();
    ctx.fillStyle = K.mix(col, '#3a2a44', 0.4); K.rrect(ctx, x - L / 2, y - W / 2 - H * 0.5, L, W + H * 0.5, Math.min(W, L) * 0.35); ctx.fill();
    ctx.fillStyle = col; K.rrect(ctx, x - L / 2, y - W / 2 - H, L, W, Math.min(W, L) * 0.4); ctx.fill();
    ctx.fillStyle = K.rgba('#eef6f6', 0.7); K.rrect(ctx, x + L * 0.05, y - W / 2 - H + W * 0.15, L * 0.18, W * 0.7, W * 0.2); ctx.fill();
    ctx.fillStyle = K.rgba('#ffffff', 0.25); ctx.fillRect(x - L * 0.35, y - W / 2 - H + 1, L * 0.5, Math.max(1, W * 0.18));
    if (b > 0.03) { K.light.glow(ctx, x - L / 2, y - H * 0.6, s * 2.4, '#ff3a28', 0.75 * b); ctx.fillStyle = K.mix('#7a2a2a', '#ff6a50', b); ctx.fillRect(x - L / 2 - 1, y - W / 2 - H * 0.7, Math.max(2, s * 0.35), W); }
  }

  // ------------------------------------------------------------------ the speed line: the wave as a red bump
  // drawn above the road of the same shot, x aligned with the road; o: { y (baseline), kpx (px per km/h), a, label }
  A.speedLine = function (ctx, ts, g, o = {}) {
    const R = A.s10(), S = R.at(ts), base = o.y ?? 470, kpx = o.kpx ?? 26, zoomTxt = o.zoom, a = o.a ?? 1, roles = R.raw.roles;
    if (a <= 0.01) return 0;
    ctx.save(); ctx.globalAlpha = a;
    // paper panel
    ctx.fillStyle = K.rgba('#fbf3e4', 0.9); ctx.strokeStyle = INK; ctx.lineWidth = 5; K.rrect(ctx, 40, base - 330, K.W - 80, 380, 26); ctx.fill(); ctx.stroke();
    ctx.font = '700 26px "Martian Mono"'; ctx.fillStyle = INK; ctx.textBaseline = 'middle'; ctx.fillText('velocidad perdida (km/h)' + (zoomTxt ? '  · ' + zoomTxt : ''), 80, base - 296);
    const pts = []; let maxD = 0, maxX = 960;
    for (let i = R.N - 2; i >= 0; i--) { const x = g.X(S.x[i] + LANE_DX[SIM_LANE]); if (x < 50 || x > K.W - 50) continue; const d = Math.max(0, (A.I24.V - S.v[i]) * 3.6); pts.push([x, d, i]); if (d > maxD) { maxD = d; maxX = x; } }
    pts.sort((p, q) => p[0] - q[0]);
    if (pts.length > 1) {
      const yOf = d => base - Math.min(300, d * kpx);
      ctx.beginPath(); ctx.moveTo(pts[0][0], base); for (const p of pts) ctx.lineTo(p[0], yOf(p[1])); ctx.lineTo(pts[pts.length - 1][0], base); ctx.closePath();
      ctx.fillStyle = K.rgba(RED, 0.55); ctx.fill();
      ctx.beginPath(); pts.forEach((p, k) => (k ? ctx.lineTo(p[0], yOf(p[1])) : ctx.moveTo(p[0], yOf(p[1])))); ctx.strokeStyle = RED; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(60, base); ctx.lineTo(K.W - 60, base); ctx.stroke();
      // smart cars on the line: teal (active), grey dashed (system off)
      for (const p of pts) { const act = roles.active.includes(p[2]), off = roles.inactive.includes(p[2]); if (!act && !off) continue;
        const y = yOf(p[1]); ctx.setLineDash([8, 8]); ctx.strokeStyle = act ? TEAL : '#8f8a9c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p[0], y); ctx.lineTo(p[0], (o.roadY ?? g.Y(LANES[SIM_LANE]))); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = act ? TEAL_L : '#b7b2c2'; ctx.strokeStyle = INK; ctx.lineWidth = 4; K.circle(ctx, p[0], y, 15); ctx.fill(); ctx.stroke(); }
    }
    // the bump's size, live
    if (o.readout !== false) { P.pill(ctx, K.W - 80, base - 296, `bache: ${maxD.toFixed(0)} km/h`, 30, 1, { align: 'right', bg: K.rgba(RED, 0.92) }); }
    ctx.restore();
    return { maxD, maxX };
  };

  // ------------------------------------------------------------------ the footbridge from below (low angle)
  // c: { chars(ctx, GY) draws the people standing on the deck (feet at GY + 120, hidden by the girder), cars: 0..1 the
  //      streaks of cars passing under the bridge in the foreground, sunX }
  let BR = null;
  function buildBridge() {
    const sky = K.canvas(K.W, K.H), c = sky.ctx;
    K.sky.gradient(c, [[0, '#7c80b6'], [0.42, '#c995a8'], [0.75, '#f5b585'], [1, '#ffd99c']], 0, K.H);
    K.sky.wash(c, 1560, 760, 760, '#ffe2a6', 0.7);
    K.tex.paint(sky, { amount: 0.3, mottle: { w: 1200, h: 680, sx: 0.0025, sy: 0.02, seed: 71, amp: 26 } });
    BR = { sky, clouds: E.goldenClouds([1560, 760], [[260, 220, 620, 120, 21, 4], [1150, 140, 520, 110, 22, 5], [1700, 360, 380, 80, 23, 6]]) };
  }
  A.BRIDGE = { GY: 760 };
  A.bridge = function (ctx, t, c = {}) {
    if (!BR) buildBridge();
    const GY = A.BRIDGE.GY;
    ctx.drawImage(BR.sky.c, 0, 0); K.sky.drawClouds(ctx, BR.clouds, t, {});
    K.light.rays(ctx, 1560, 820, { n: 9, spread: 1.7, angle: -Math.PI / 2 - 0.25, len: 1400, width: 0.05, alpha: 0.08, color: '#ffe0a0', t, seed: 73 });
    // lamp posts on the bridge (behind the people)
    for (const x of [300, 1620]) { ctx.fillStyle = '#4a3f55'; ctx.fillRect(x - 7, GY - 520, 14, 520); ctx.fillRect(x - 7, GY - 520, 90, 12); ctx.fillStyle = '#fff1c8'; K.rrect(ctx, x + 60, GY - 512, 46, 18, 6); ctx.fill(); }
    if (c.chars) c.chars(ctx, GY);
    // railing: posts, mesh, top rail (in front of the people's legs)
    ctx.save(); ctx.strokeStyle = K.rgba('#3a3346', 0.45); ctx.lineWidth = 2;
    for (let x = -300; x < K.W + 300; x += 34) { ctx.beginPath(); ctx.moveTo(x, GY); ctx.lineTo(x + 230, GY - 230); ctx.moveTo(x + 230, GY); ctx.lineTo(x, GY - 230); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = '#3d3a4c'; for (let x = 40; x < K.W; x += 220) ctx.fillRect(x - 7, GY - 240, 14, 240);
    ctx.fillStyle = '#4d6f72'; K.rrect(ctx, -20, GY - 252, K.W + 40, 22, 10); ctx.fill(); ctx.fillStyle = K.rgba('#ffe2a6', 0.7); ctx.fillRect(0, GY - 252, K.W, 5);
    // the girder (deck edge), concrete, warm rim on top
    const g = ctx.createLinearGradient(0, GY, 0, GY + 190); g.addColorStop(0, '#b8a39c'); g.addColorStop(0.15, '#a08c8e'); g.addColorStop(1, '#5f5266');
    ctx.fillStyle = g; ctx.fillRect(0, GY, K.W, 190); ctx.fillStyle = K.rgba('#ffe2a6', 0.65); ctx.fillRect(0, GY, K.W, 7);
    ctx.fillStyle = K.rgba('#2a1830', 0.25); for (let x = 0; x < K.W; x += 480) ctx.fillRect(x, GY + 10, 6, 180);
    ctx.fillStyle = '#3a3046'; ctx.fillRect(0, GY + 190, K.W, K.H - GY - 190);
    // cars streaking under the bridge (foreground), with motion blur
    const n = 5, ck = c.cars ?? 1;
    if (ck > 0.01) for (let k = 0; k < n; k++) {
      const per = 1.3 + hash(k, 9) * 0.9, u = ((t / per + hash(k, 3)) % 1), x = -500 + u * (K.W + 1000), y = K.H - 40 + hash(k, 5) * 30, col = K.car.COLORS[k % 10];
      for (let j = 0; j < 4; j++) { ctx.fillStyle = K.rgba(col, 0.22 * ck); K.rrect(ctx, x - 260 - j * 50, y - 70, 520, 120, 50); ctx.fill(); }
      ctx.fillStyle = K.rgba(col, 0.85 * ck); K.rrect(ctx, x - 230, y - 60, 460, 110, 46); ctx.fill();
      ctx.fillStyle = K.rgba('#eef6f6', 0.5 * ck); K.rrect(ctx, x + 40, y - 48, 120, 40, 14); ctx.fill();
    }
    K.particles.motes(ctx, t, { n: 30, seed: 77, color: '#ffe6b0', alpha: 0.45, size: 2.4, vx: 6, vy: -3 });
    K.light.grade(ctx, '#ff9a5a', 0.16, 'soft-light');
    return GY;
  };
  A.LIGHT_DAWN = Object.assign({}, K.cast.LIGHT.golden, { ang: -0.6, rim: '#ffd99a', shade: '#3c2a52', rimA: 0.6 });

  // ------------------------------------------------------------------ props
  // a cartoon hand, palm to camera; n fingers up (index, middle, ring, pinky, then thumb); dir +1 right hand, -1 left
  P.hand = function (ctx, x, y, s, n, o = {}) {
    const dir = o.dir || 1, skin = o.skin || '#c98a64', sleeve = o.sleeve || '#f3ecdd', rot = o.rot || 0, lw = s * 0.07;
    const parts = [];
    const fing = [[-0.3, 0.92, -0.12], [-0.1, 1.02, -0.03], [0.1, 0.96, 0.05], [0.3, 0.78, 0.14]];
    fing.forEach(([fx, len, ang], k) => { const up = k < n, L = up ? len * s : 0.28 * s; parts.push({ x0: fx * s, y0: -0.38 * s, ang: ang * (up ? 1 : 0.4), L, w: 0.19 * s }); });
    { const up = n >= 5, L = up ? 0.6 * s : 0.32 * s; parts.push({ x0: -0.38 * s, y0: 0.05 * s, ang: up ? -1.05 : -0.55, L, w: 0.21 * s }); }
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(dir, 1);
    // wrist + sleeve
    ctx.fillStyle = INK; K.rrect(ctx, -0.33 * s - lw, 0.25 * s, 0.66 * s + 2 * lw, 1.6 * s, 0.2 * s); ctx.fill();
    ctx.fillStyle = skin; K.rrect(ctx, -0.33 * s, 0.25 * s, 0.66 * s, 1.6 * s, 0.2 * s); ctx.fill();
    ctx.fillStyle = INK; K.rrect(ctx, -0.42 * s - lw, 0.9 * s, 0.84 * s + 2 * lw, 1.2 * s, 0.15 * s); ctx.fill();
    ctx.fillStyle = sleeve; K.rrect(ctx, -0.42 * s, 0.9 * s + lw, 0.84 * s, 1.2 * s, 0.15 * s); ctx.fill();
    const fpath = p => { ctx.beginPath(); ctx.moveTo(p.x0, p.y0); ctx.lineTo(p.x0 + Math.sin(p.ang) * p.L, p.y0 - Math.cos(p.ang) * p.L); };
    ctx.lineCap = 'round';
    for (const p of parts) { fpath(p); ctx.strokeStyle = INK; ctx.lineWidth = p.w + 2 * lw; ctx.stroke(); }
    ctx.fillStyle = INK; K.rrect(ctx, -0.45 * s - lw, -0.5 * s - lw, 0.9 * s + 2 * lw, 0.85 * s + 2 * lw, 0.28 * s); ctx.fill();
    for (const p of parts) { fpath(p); ctx.strokeStyle = skin; ctx.lineWidth = p.w; ctx.stroke(); }
    ctx.fillStyle = skin; K.rrect(ctx, -0.45 * s, -0.5 * s, 0.9 * s, 0.85 * s, 0.28 * s); ctx.fill();
    ctx.strokeStyle = K.rgba(INK, 0.5); ctx.lineWidth = lw * 0.6; ctx.beginPath(); ctx.arc(0.05 * s, -0.02 * s, 0.25 * s, 0.3, 1.6); ctx.stroke();
    ctx.restore();
  };
  // the ink drop: falls (k 0..1) onto (x, y), then a tiny ripple (r 0..1)
  P.drop = function (ctx, x, y, k, r, sinE = 0.58) {
    if (k > 0 && k < 1) { const yy = K.lerp(-80, y, k * k); ctx.save(); ctx.translate(x, yy); ctx.fillStyle = '#1c2433'; ctx.strokeStyle = PAPER; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -42); ctx.quadraticCurveTo(22, -2, 0, 14); ctx.quadraticCurveTo(-22, -2, 0, -42); ctx.fill(); ctx.stroke(); ctx.restore(); }
    if (r > 0 && r < 1) for (let j = 0; j < 3; j++) { const u = K.clamp(r * 1.4 - j * 0.2); if (u <= 0 || u >= 1) continue;
      ctx.save(); ctx.globalAlpha = 1 - u; ctx.strokeStyle = '#1c2433'; ctx.lineWidth = 5; K.ellipse(ctx, x, y, 10 + u * 80, (10 + u * 80) * sinE); ctx.stroke(); ctx.restore(); }
  };
  // Eli's teal pennant on a stick, held at (x, y) (the hand), waving
  P.flag = function (ctx, x, y, s, t, o = {}) {
    const ang = (o.ang ?? -0.25) + Math.sin(t * (o.f || 9)) * (o.wave ?? 0.15);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.strokeStyle = INK; ctx.lineWidth = s * 0.06; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, s * 0.15); ctx.lineTo(0, -s); ctx.stroke();
    ctx.strokeStyle = '#c99633'; ctx.lineWidth = s * 0.035; ctx.stroke();
    const fl = Math.sin(t * 14) * s * 0.06;
    ctx.fillStyle = TEAL_L; ctx.strokeStyle = INK; ctx.lineWidth = s * 0.03; ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.4, -s * 0.9 + fl, s * 0.8, -s * 0.78 + fl * 1.5); ctx.quadraticCurveTo(s * 0.4, -s * 0.72 - fl, 0, -s * 0.56); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  };

  // ------------------------------------------------------------------ end screen: our own bus stop (no brands)
  // c: { chars(ctx, GY, SEAT) people; buses: [{ x (front, design px), col }] drawn in front of the sidewalk; bird }
  let BS = null;
  A.BUS = { GY: 830, SEAT: 700, ROAD: 1050 };
  function buildBus() {
    const bg = K.canvas(K.W, K.H), c = bg.ctx;
    K.sky.gradient(c, [[0, '#8b8cc0'], [0.45, '#e6a98f'], [0.75, '#ffd09a'], [1, '#ffe2b0']], 0, 640);
    K.sky.wash(c, 1650, 560, 700, '#fff0c0', 0.6);
    // town silhouettes: low roofs, a water tower, trees (generic, no signs)
    const r = K.rng(301);
    for (let x = -40; x < K.W + 40;) { const w = 120 + r() * 160, h = 90 + r() * 140; c.fillStyle = K.mix('#a07a8e', '#ffd09a', 0.25 + r() * 0.2); c.fillRect(x, 640 - h, w, h);
      c.fillStyle = K.rgba('#ffe6b0', 0.5); for (let k = 0; k < 3; k++) c.fillRect(x + 14 + k * 36, 640 - h + 24, 16, 20); x += w + 10 + r() * 30; }
    c.fillStyle = '#8a6a80'; c.fillRect(1400, 360, 10, 280); c.fillRect(1470, 360, 10, 280); K.rrect(c, 1370, 300, 140, 80, 20); c.fill();
    for (let k = 0; k < 9; k++) { const x = r() * K.W; c.fillStyle = '#7a8a5a'; K.circle(c, x, 610 - r() * 30, 40 + r() * 30); c.fill(); }
    c.fillStyle = '#c9b49a'; c.fillRect(0, 640, K.W, 190);            // back wall / verge
    c.fillStyle = '#d8c6aa'; c.fillRect(0, 800, K.W, 60);             // sidewalk
    c.fillStyle = '#9a8a80'; c.fillRect(0, 856, K.W, 10);             // kerb
    c.fillStyle = '#5d5868'; c.fillRect(0, 866, K.W, K.H - 866);       // road
    c.fillStyle = K.rgba('#f3ecdd', 0.8); for (let x = 0; x < K.W; x += 160) c.fillRect(x, 1000, 90, 8);
    K.tex.paint(bg, { amount: 0.35, mottle: { w: 1200, h: 680, sx: 0.004, sy: 0.02, seed: 302, amp: 26 } });
    BS = { bg };
  }
  A.busStop = function (ctx, t, c = {}) {
    if (!BS) buildBus();
    const GY = A.BUS.GY, SEAT = A.BUS.SEAT;
    ctx.drawImage(BS.bg.c, 0, 0);
    K.light.rays(ctx, 1650, 560, { n: 9, spread: 1.8, angle: -Math.PI / 2 - 0.4, len: 1300, width: 0.05, alpha: 0.07, color: '#ffe0a0', t, seed: 305 });
    // the shelter: back panel, roof, bench; the stop sign on its pole (a plain bus pictogram)
    ctx.fillStyle = K.rgba('#cfe3e6', 0.35); ctx.fillRect(170, 420, 640, 380); ctx.strokeStyle = '#3d3a4c'; ctx.lineWidth = 8; ctx.strokeRect(170, 420, 640, 380);
    ctx.fillStyle = '#3d3a4c'; ctx.fillRect(160, 400, 20, 430); ctx.fillRect(800, 400, 20, 430); ctx.fillStyle = '#23746C'; K.rrect(ctx, 130, 380, 720, 40, 12); ctx.fill();
    ctx.fillStyle = K.rgba('#ffe2a6', 0.6); ctx.fillRect(130, 380, 720, 6);
    ctx.fillStyle = '#7a5a46'; K.rrect(ctx, 220, SEAT - 4, 540, 26, 8); ctx.fill(); ctx.fillStyle = '#3d3a4c'; ctx.fillRect(250, SEAT + 20, 14, GY - SEAT - 20); ctx.fillRect(716, SEAT + 20, 14, GY - SEAT - 20);
    ctx.fillStyle = '#4a3f55'; ctx.fillRect(930, 330, 14, 500);
    ctx.fillStyle = '#fbf3e4'; ctx.strokeStyle = INK; ctx.lineWidth = 6; K.circle(ctx, 937, 320, 58); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#23746C'; K.rrect(ctx, 905, 290, 64, 48, 10); ctx.fill(); ctx.fillStyle = '#fbf3e4'; ctx.fillRect(913, 298, 48, 16); ctx.fillStyle = INK; K.circle(ctx, 916, 342, 7); ctx.fill(); K.circle(ctx, 958, 342, 7); ctx.fill();
    if (c.bird) c.bird(ctx, 937, 262);
    if (c.chars) c.chars(ctx, GY, SEAT);
    for (const b of (c.buses || [])) P.bus(ctx, b.x, A.BUS.ROAD, b.col, t, b);
    K.particles.motes(ctx, t, { n: 30, seed: 307, color: '#ffe6b0', alpha: 0.4, size: 2.2, vx: 5, vy: -3 });
    K.light.grade(ctx, '#ff9a5a', 0.14, 'soft-light');
  };
  // a side-view city bus facing left: front at x, wheels on y; o.door 0..1 open, o.puff 0..1 brake air
  P.bus = function (ctx, x, y, col, t, o = {}) {
    const L = 540, H = 300, top = y - H - 40;
    ctx.save(); ctx.lineJoin = 'round';
    ctx.fillStyle = K.rgba('#20142a', 0.3); K.ellipse(ctx, x + L / 2, y + 6, L * 0.55, 18); ctx.fill();
    ctx.fillStyle = col || '#e2b04a'; ctx.strokeStyle = INK; ctx.lineWidth = 7; K.rrect(ctx, x, top, L, H, 34); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#23746C'; ctx.fillRect(x + 4, top + H - 80, L - 8, 26);
    ctx.fillStyle = '#cfe3e6'; K.rrect(ctx, x + 14, top + 30, 70, 150, 16); ctx.fill(); ctx.stroke();               // windscreen
    for (let k = 0; k < 5; k++) { K.rrect(ctx, x + 150 + k * 76, top + 34, 62, 92, 10); ctx.fill(); ctx.stroke(); }
    // passengers' heads in the windows
    for (let k = 0; k < 5; k++) { if (hash(k, o.seed || 1) < 0.4) continue; const pe = K.car.persona(k * 13 + (o.seed || 1), 3); ctx.fillStyle = pe.skin; K.circle(ctx, x + 181 + k * 76, top + 100, 18); ctx.fill(); ctx.fillStyle = pe.hair; ctx.beginPath(); ctx.arc(x + 181 + k * 76, top + 96, 18, Math.PI, 0); ctx.fill(); }
    const dk = K.clamp(o.door || 0); ctx.fillStyle = '#3d3a4c'; ctx.fillRect(x + 92, top + 40, 50, H - 60); ctx.fillStyle = '#cfe3e6'; ctx.fillRect(x + 92 + dk * 22, top + 40, 50 - dk * 44, H - 60); ctx.strokeRect(x + 92, top + 40, 50, H - 60);
    ctx.fillStyle = INK; K.rrect(ctx, x + 18, top + 4, 120, 22, 6); ctx.fill(); ctx.fillStyle = '#ffcf6a'; ctx.font = '700 18px "Martian Mono"'; ctx.textBaseline = 'middle'; ctx.fillText(o.route || '3', x + 30, top + 16);
    ctx.fillStyle = '#fff1c8'; K.circle(ctx, x + 18, y - 70, 12); ctx.fill();
    for (const wx of [x + 110, x + L - 110]) { ctx.fillStyle = INK; K.circle(ctx, wx, y - 18, 44); ctx.fill(); ctx.fillStyle = '#9a96a6'; K.circle(ctx, wx, y - 18, 18); ctx.fill(); }
    if ((o.puff || 0) > 0.01) for (let j = 0; j < 4; j++) { const u = K.clamp(o.puff * 1.2 - j * 0.1); ctx.fillStyle = K.rgba('#fbf3e4', 0.7 * (1 - u)); K.circle(ctx, x + L - 70 + j * 30 + u * 80, y - 30 - u * 40, 20 + u * 40); ctx.fill(); }
    ctx.restore();
  };
  // the glovebox insert (dashboard close-up): open 0..1 (door swings down), badge flight u 0..1 (out, up, lands on the
  // dash), knee 0..1 (Mila's knee bumps it shut from the left), badgeIn: badge visible inside
  P.glovebox = function (ctx, t, o = {}) {
    ctx.fillStyle = '#1f5f59'; ctx.fillRect(0, 0, K.W, K.H);
    const g = ctx.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, K.rgba('#ffe2a6', 0.35)); g.addColorStop(0.5, K.rgba('#ffe2a6', 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H);
    ctx.fillStyle = '#2d7a72'; K.rrect(ctx, -40, 120, K.W + 80, 260, 60); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.stroke();       // dash top
    ctx.fillStyle = '#cfe3e6'; ctx.fillRect(0, 0, K.W, 110); K.sky.wash(ctx, 1500, 60, 600, '#ffd99a', 0.6);                                      // windscreen
    const bx = 640, by = 480, bw = 640, bh = 300, open = K.ease.outBack(K.clamp(o.open || 0)) * (1 - K.clamp(o.knee || 0) * 0.98);
    ctx.fillStyle = '#123f3b'; ctx.fillRect(bx, by, bw, bh); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.strokeRect(bx, by, bw, bh);              // the box
    if (o.badgeIn) { ctx.save(); ctx.translate(bx + 220, by + 150); ctx.rotate(0.15); badge(ctx, 0, 0, 1); ctx.restore(); }
    // the door: hinge at the bottom, swings towards the camera (foreshortened)
    // the door: hinge at the bottom edge; closed it covers the box, open it hangs towards the camera (a trapezoid below)
    const an = Math.min(1.5, open * 1.5), ch = Math.cos(an), sh = Math.sin(an), top = by + bh - bh * ch, grow = 1 + 0.25 * sh;
    ctx.fillStyle = '#2d7a72'; ctx.beginPath();
    if (ch > 0.05) { ctx.moveTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw + (grow - 1) * bw * 0.5, top); ctx.lineTo(bx - (grow - 1) * bw * 0.5, top); }
    const low = by + bh + bh * 0.55 * sh; if (sh > 0.2) { ctx.moveTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw + bw * 0.12 * sh, low); ctx.lineTo(bx - bw * 0.12 * sh, low); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    if (open < 0.3) { ctx.fillStyle = '#c9b49a'; K.rrect(ctx, bx + bw / 2 - 50, top + 22, 100, 24, 10); ctx.fill(); ctx.stroke(); }
    else if (sh > 0.2) { ctx.fillStyle = '#c9b49a'; K.rrect(ctx, bx + bw / 2 - 60, low - 40, 120, 26, 10); ctx.fill(); ctx.stroke(); }
    // the badge flying out
    const u = K.clamp(o.badge || 0); if (u > 0) { const px = K.lerp(bx + 260, 1500, u), py = K.lerp(by + 150, 300, u) - 380 * 4 * u * (1 - u); ctx.save(); ctx.translate(px, py); ctx.rotate(u * 6.5); badge(ctx, 0, 0, 1.3); ctx.restore(); }
    // Mila's knee (purple overalls) coming in from the left
    const kk = K.clamp(o.knee || 0); if (kk > 0) { const kx = K.lerp(-420, bx - 30, K.ease.out(kk)); ctx.fillStyle = '#7158b8'; ctx.strokeStyle = INK; ctx.lineWidth = 8; K.rrect(ctx, kx - 420, by + 60, 460, 240, 110); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = K.rgba('#ffe2a6', 0.6); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(kx - 60, by + 170, 90, -1.2, -0.2); ctx.stroke(); }
  };
  function badge(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = 5; K.rrect(ctx, -120, -60, 240, 120, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.font = '800 22px "Martian Mono"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SI SE ABRE', 0, -30); ctx.fillText('UN HUECO,', 0, 0); ctx.fillText('CIÉRRALO', 0, 30);
    ctx.fillStyle = '#e7c25a'; K.circle(ctx, -104, -44, 7); ctx.fill(); ctx.restore();
  }
  P.gloveBadge = badge;
})(typeof window !== 'undefined' ? window : globalThis);
