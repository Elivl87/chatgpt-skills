/* Ep 001 · animatic world for Act 2 (beats 9-10): the straight line of cars, side view, overcast noon (ART_BIBLE §5
   «overcast noon»), driven by S3 (12 cars, the front one taps; Eli = car index 2 = «auto número 10»). Painted layers
   scroll with a 2D camera on the road (metres), cars are K.car.side placed by the sim; brake bars and hand-painted
   numbers over the cars; Eli at the wheel of the teal car. Plus the S4 graph (stable vs unstable hump) on paper. */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const INK = '#2a1a1e', PAPER = '#fbf3e4', TEAL = '#23746C';
  let s3 = null; A.s3 = () => (s3 = s3 || A.adapter('S3'));
  A.LINE = { GY: 860, ELI: 2, num: i => 12 - i };
  A.LIGHT_NOON = Object.assign({}, K.cast.LIGHT.noon, { shadeA: 0.22 });
  const PAL = { sky: [[0, '#aeb9c9'], [0.55, '#cdd3db'], [1, '#e9e6de']], hill: '#9aa596', hill2: '#7f8c7a', field: '#a8a874', field2: '#b9b383', road: '#6c6876', verge: '#8f9a64', rim: '#ffffff', shade: '#4a5068' };
  let L = null;
  const TW = 2400;
  function tile(draw, h = K.H) { const t = K.canvas(TW, h); draw(t.ctx, t); return t; }
  function build() {
    const sky = K.canvas(K.W, K.H); K.sky.gradient(sky.ctx, PAL.sky, 0, 620); K.tex.paint(sky, { amount: 0.3, mottle: { w: 1200, h: 540, sx: 0.0025, sy: 0.02, seed: 101, amp: 26 } });
    const far = tile((c, t) => { K.terrain.ridge(c, { x0: 0, x1: TW, y: 560, amp: 120, freq: 0.0024, seed: 102, bottom: K.H, color: K.mix(PAL.hill, '#d3d7dc', 0.55) });
      K.light.haze(c, 480, 590, 640, '#e3e3df', 0.6); K.tex.paint(t, { amount: 0.4, mottle: { w: 1000, h: 400, sx: 0.004, sy: 0.05, seed: 103, amp: 36 } }); });
    const mid = tile((c, t) => { K.terrain.ridge(c, { x0: 0, x1: TW, y: 640, amp: 50, freq: 0.004, seed: 104, bottom: K.H, color: K.mix(PAL.hill2, '#d3d7dc', 0.3) });
      const r = K.rng(105); for (let x = 0; x < TW; x += 30 + r() * 80) K.terrain.tree(c, x, 650 + r() * 20, 50 + r() * 60, { kind: r() < 0.4 ? 'poplar' : 'round', seed: r() * 1e6 | 0, color: K.mix('#6f8a62', '#d3d7dc', 0.35), shade: K.mix('#4a5e48', '#d3d7dc', 0.3), light: { dx: 0, back: 0.3, rim: null } });
      K.tex.paint(t, { amount: 0.4, mottle: { w: 1000, h: 400, sx: 0.005, sy: 0.05, seed: 106, amp: 40 } }); });
    const near = tile((c, t) => {   // field strips + a fence + poles just behind the road
      const g = c.createLinearGradient(0, 660, 0, 800); g.addColorStop(0, K.mix(PAL.field, '#d3d7dc', 0.3)); g.addColorStop(1, PAL.field2); c.fillStyle = g; c.fillRect(0, 660, TW, 160);
      const r = K.rng(107); c.lineCap = 'round';
      for (let k = 0; k < 1600; k++) { const x = r() * TW, y = 665 + r() * 140; c.strokeStyle = K.rgba(r() < 0.5 ? '#c9c48f' : '#7f875a', 0.25); c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6 + r() * 26, y); c.stroke(); }
      for (let x = 0; x < TW; x += 54) { c.fillStyle = '#6e5a4e'; c.fillRect(x, 770, 6, 36); }
      c.fillStyle = '#6e5a4e'; c.fillRect(0, 778, TW, 4); c.fillRect(0, 792, TW, 4);
      for (let x = 150; x < TW; x += 600) { c.fillStyle = '#4a4048'; c.fillRect(x - 6, 420, 12, 390); K.rrect(c, x - 70, 426, 140, 9, 3); c.fill(); }
      c.strokeStyle = K.rgba('#3e3640', 0.8); c.lineWidth = 2.2; for (const yy of [424, 430]) { c.beginPath(); for (let x = -450; x <= TW + 450; x += 600) { c.moveTo(x + 90, yy); c.quadraticCurveTo(x + 450, yy + 40, x + 690, yy); } c.stroke(); }
      K.tex.paint(t, { amount: 0.35 }); });
    const road = tile((c) => { const r = K.rng(108);
      c.fillStyle = PAL.verge; c.fillRect(0, 810, TW, 22); c.fillStyle = PAL.road; c.fillRect(0, 828, TW, 130); c.fillStyle = K.mix(PAL.road, '#d8d5cc', 0.25); c.fillRect(0, 828, TW, 6);
      for (let k = 0; k < 900; k++) { const x = r() * TW, y = 834 + r() * 120; c.strokeStyle = K.rgba(r() < 0.5 ? '#4e4a58' : '#8a8694', 0.2); c.lineWidth = 1 + r() * 2.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 8 + r() * 30, y); c.stroke(); }
      for (let x = 0; x < TW; x += 120) { c.fillStyle = K.rgba('#ece6d4', 0.85); c.fillRect(x, 890, 60, 6); }
      c.fillStyle = '#8f9a64'; c.fillRect(0, 958, TW, 140);
      for (let k = 0; k < 700; k++) { const x = r() * TW, y = 962 + r() * 120; c.strokeStyle = K.rgba(r() < 0.5 ? '#b4bc7c' : '#5f6b40', 0.3); c.lineWidth = 2 + r() * 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 10 + r() * 30, y); c.stroke(); } });
    const clouds = [[200, 160, 620, 110, 1, 3], [900, 110, 700, 120, 2, 4], [1650, 190, 560, 100, 3, 3], [520, 300, 400, 70, 4, 5], [1350, 320, 380, 64, 5, 4]].map(([x, y, w, h, seed, v]) => ({ x, y, w, h, v,
      o: { seed: 110 + seed, ang: -Math.PI / 2, color: '#a9b0bd', shade: '#8d93a3', lit: '#dfe2e8', rim: '#f4f4f2', underLit: '#c9cdd6', litOff: 3, litScale: 0.75, rimW: 0.04 } }));
    L = { sky, far, mid, near, road, clouds };
  }
  const scroll = (ctx, layer, shift) => { const off = -(((shift % TW) + TW) % TW); ctx.drawImage(layer.c, off, 0); ctx.drawImage(layer.c, off + TW, 0); };

  // c: { simT, camS (metres at screen centre), pxm (px per metre at the road), z (extra zoom about the road), carOver(ctx, i, x, y, s, S),
  //      eli(ctx, sx, sy, s) (draw Eli at the wheel), chars(ctx, toX), drivers(i, b, stopped) -> expr }
  A.line = function (ctx, t, c) {
    if (!L) build();
    const R = c.run || A.s3(), S = R.at(c.simT), pxm = c.pxm || 11, GY = A.LINE.GY, camS = c.camS, ELI_I = c.eliI ?? A.LINE.ELI;
    const toX = s => 960 + (s - camS) * pxm;
    ctx.drawImage(L.sky.c, 0, 0);
    K.sky.drawClouds(ctx, L.clouds, t, { dx: -camS * 0.6 });
    const sh = camS * 11;     // parallax in px (independent of the shot's zoom so layers stay painted at their scale)
    scroll(ctx, L.far, sh * 0.02); scroll(ctx, L.mid, sh * 0.08);
    // the road scrolls at the cars' scale (horizontal = pxm), but its depth bands barely thicken (a low side camera);
    // the fence / field behind the road sits further away: it scales and scrolls less (parallax)
    const kz = pxm / 11, kn = 1 + (kz - 1) * 0.3;
    ctx.save(); ctx.translate(0, GY); ctx.scale(kn, 1 + (kz - 1) * 0.04); ctx.translate(0, -GY); scroll(ctx, L.near, camS * 11 * 0.5 * kn / kn - 960 / kn + 960); ctx.restore();
    ctx.save(); ctx.translate(0, GY); ctx.scale(kz, 1 + (kz - 1) * 0.06); ctx.translate(0, -GY); scroll(ctx, L.road, camS * 11 - 960 / kz); ctx.restore();
    // cars (back to front: they overlap little in a side view)
    const lit = { rim: PAL.rim, shade: PAL.shade, dx: 0 };
    for (let i = 0; i < R.N; i++) {
      const x = toX(S.x[i]), s = pxm * (c.carK ?? (pxm < 30 ? 2.1 : 1)); if (x < -6 * s || x > K.W + 6 * s) continue;   // wide shots: cars drawn bigger than world scale, placed exactly
      const b = R.brake(i, c.simT), stopped = S.v[i] < 0.3, pe = E.persona(500 + i), isE = i === ELI_I;
      ctx.fillStyle = K.rgba(PAL.shade, 0.25); K.ellipse(ctx, x, GY + 2, 1.9 * s, 0.16 * s); ctx.fill();
      K.car.side(ctx, x, GY, s, { color: isE ? TEAL : pe.color, lit, brake: b, wheel: S.x[i] * 3.1,
        drawDriver: (sx, sy) => { if (isE && c.eli) c.eli(ctx, sx, sy, s, S, b); else if (s > 5) K.char.head(ctx, sx, sy - s * 0.3, s * 0.36, { view: 'q', dir: 1, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, capColor: pe.capColor,
          expr: c.drivers ? c.drivers(i, b, stopped) : (stopped ? 'annoyed' : b > 0.5 ? 'worried' : 'focused'), look: [0.9, 0], light: { ang: -1.57, rim: '#ffffff', shade: PAL.shade } }); } });
      if (c.carOver) c.carOver(ctx, i, x, GY, s, S, b);
    }
    if (c.chars) c.chars(ctx, toX, S);
    K.light.grade(ctx, '#9fb6c8', 0.12, 'soft-light');
    return { toX, S };
  };
  // the brake bar over a car: height grows with the strongest braking so far (peak deceleration, true from the sim)
  A.peakSoFar = (i, ts) => { const run = A.s3().raw; return run.peakDecel(i, 3, ts); };
  P.bar = function (ctx, x, yBase, w, h, a = 1, hat = 0) {
    if (a <= 0.01 || h < 1) return;
    const k = K.clamp(h / 260), col = K.mix('#e2b04a', '#a8466e', k);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = K.rgba('#2a1830', 0.25); K.rrect(ctx, x - w / 2 + 4, yBase - h + 5, w, h, w * 0.25); ctx.fill();
    ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2, w * 0.1); K.rrect(ctx, x - w / 2, yBase - h, w, h, w * 0.25); ctx.fill(); ctx.stroke();
    ctx.fillStyle = K.rgba('#ffffff', 0.35); K.rrect(ctx, x - w / 2 + w * 0.15, yBase - h + w * 0.15, w * 0.18, Math.max(0, h - w * 0.3), w * 0.09); ctx.fill();
    ctx.restore();
  };
  P.num = function (ctx, x, y, n, size, a = 1, hi = false) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = hi ? '#f2c230' : PAPER; ctx.strokeStyle = INK; ctx.lineWidth = size * 0.08; K.circle(ctx, x, y, size * 0.62); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.font = `800 ${size * 0.72}px "Martian Mono"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), x, y + size * 0.04); ctx.restore();
  };
  // ink hourglass (sand runs over k 0..1)
  P.hourglass = function (ctx, x, y, size, k, a = 1) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineWidth = size * 0.07; ctx.lineJoin = 'round';
    const w = size * 0.42, h = size * 0.5;
    ctx.fillStyle = K.rgba(PAPER, 0.85); ctx.beginPath(); ctx.moveTo(-w, -h); ctx.lineTo(w, -h); ctx.lineTo(w * 0.12, 0); ctx.lineTo(w, h); ctx.lineTo(-w, h); ctx.lineTo(-w * 0.12, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e2b04a'; const top = 1 - K.clamp(k); ctx.beginPath(); ctx.moveTo(-w * top, -h * top); ctx.lineTo(w * top, -h * top); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-w * K.clamp(k), h); ctx.lineTo(w * K.clamp(k), h); ctx.lineTo(0, h * (1 - K.clamp(k))); ctx.closePath(); ctx.fill();
    if (k > 0 && k < 1) { ctx.strokeStyle = '#e2b04a'; ctx.lineWidth = size * 0.04; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, h); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = size * 0.07; }
    ctx.beginPath(); ctx.moveTo(-w, -h); ctx.lineTo(w, -h); ctx.lineTo(w * 0.12, 0); ctx.lineTo(w, h); ctx.lineTo(-w, h); ctx.lineTo(-w * 0.12, 0); ctx.closePath(); ctx.stroke();
    ctx.lineWidth = size * 0.1; ctx.beginPath(); ctx.moveTo(-w * 1.25, -h); ctx.lineTo(w * 1.25, -h); ctx.moveTo(-w * 1.25, h); ctx.lineTo(w * 1.25, h); ctx.stroke();
    ctx.restore();
  };
  // ruler between two x (screen) with the gap in metres
  P.ruler = function (ctx, x0, x1, y, metres, a = 1) {
    if (a <= 0.01 || x1 <= x0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#e2b04a'; ctx.strokeStyle = INK; ctx.lineWidth = 3; K.rrect(ctx, x0, y - 14, x1 - x0, 28, 5); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 2; for (let x = x0 + 10; x < x1 - 4; x += 12) { ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x, y - (Math.round((x - x0) / 12) % 5 === 0 ? 0 : 6)); ctx.stroke(); }
    P.pill(ctx, (x0 + x1) / 2, y - 46, `${metres.toFixed(1).replace('.', ',')} m`, 30, 1, { align: 'center' });
    ctx.restore();
  };
  // paper title plate (INESTABILIDAD DE CADENA, UN EMBOTELLAMIENTO ES UNA OLA, DENSIDAD)
  P.plate = function (ctx, x, y, text, size, a) {
    if (a <= 0.01) return;
    const k = 0.7 + 0.3 * K.ease.outBack(K.clamp(a));
    ctx.save(); ctx.globalAlpha = K.clamp(a * 2); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-0.015);
    ctx.font = `800 ${size}px "Martian Mono"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const w = ctx.measureText(text).width + size * 1.2, h = size * 1.8;
    ctx.fillStyle = K.rgba('#2a1830', 0.3); K.rrect(ctx, -w / 2 + 8, -h / 2 + 10, w, h, size * 0.3); ctx.fill();
    ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = size * 0.08; K.rrect(ctx, -w / 2, -h / 2, w, h, size * 0.3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.fillText(text, 0, size * 0.05); ctx.restore();
  };
  // a chain link between two points (ink + steel), drawn on with k
  P.chain = function (ctx, x0, x1, y, k, a = 1) {
    if (k <= 0.001 || a <= 0.01) return;
    const n = Math.max(2, Math.round((x1 - x0) / 34)), m = Math.ceil(n * K.clamp(k));
    ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 6; ctx.strokeStyle = INK;
    for (let j = 0; j < m; j++) { const cx = x0 + (j + 0.5) * (x1 - x0) / n; ctx.save(); ctx.translate(cx, y); if (j % 2) ctx.scale(1, 0.45);
      K.ellipse(ctx, 0, 0, 20, 11); ctx.stroke(); ctx.strokeStyle = '#c9ccd4'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.restore(); }
    ctx.restore();
  };
  // a speech balloon of scribbles (gossip), size s; doodle = draw a tiny Eli with his beanie inside
  P.gossip = function (ctx, x, y, s, a, o = {}) {
    if (a <= 0.01) return;
    const k = 0.5 + 0.5 * K.ease.outBack(K.clamp(a));
    ctx.save(); ctx.globalAlpha = K.clamp(a * 2); ctx.translate(x, y); ctx.scale(k, k); ctx.lineJoin = 'round';
    ctx.fillStyle = K.rgba('#2a1830', 0.25); K.rrect(ctx, -s + 6, -s * 0.62 + 8, 2 * s, s * 1.24, s * 0.5); ctx.fill();
    ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2.5, s * 0.05);
    ctx.beginPath(); ctx.moveTo(-s * 0.3, s * 0.55); ctx.lineTo(-s * 0.6 * (o.tail || 1), s * 0.95); ctx.lineTo(-s * 0.05, s * 0.55); ctx.closePath(); ctx.fill(); ctx.stroke();
    K.rrect(ctx, -s, -s * 0.62, 2 * s, s * 1.24, s * 0.5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = PAPER; ctx.fillRect(-s * 0.32, s * 0.5, s * 0.3, s * 0.12);
    if (o.dot) { ctx.fillStyle = INK; K.circle(ctx, 0, 0, s * 0.12); ctx.fill(); }
    else { const r = K.rng(o.seed || 3); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1.5, s * 0.035); ctx.lineCap = 'round';
      for (let row = 0; row < 3; row++) { ctx.beginPath(); let xx = -s * 0.75; const yy = -s * 0.32 + row * s * 0.3; ctx.moveTo(xx, yy);
        while (xx < s * (o.doodle ? 0.05 : 0.72)) { xx += s * 0.06; ctx.lineTo(xx, yy + (r() - 0.5) * s * 0.14); } ctx.stroke(); }
      if (o.doodle) { // a little Eli: capsule head, yellow beanie, angry brows
        ctx.save(); ctx.translate(s * 0.48, s * 0.02); const hs = s * 0.32; ctx.fillStyle = '#7a4d32'; ctx.lineWidth = Math.max(1.5, s * 0.03);
        K.rrect(ctx, -hs * 0.55, -hs * 0.7, hs * 1.1, hs * 1.5, hs * 0.5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#f2c230'; K.rrect(ctx, -hs * 0.62, -hs * 0.95, hs * 1.24, hs * 0.55, hs * 0.25); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fbf7ee'; for (const sg of [-1, 1]) { K.circle(ctx, sg * hs * 0.22, -hs * 0.1, hs * 0.15); ctx.fill(); ctx.stroke(); }
        ctx.fillStyle = INK; for (const sg of [-1, 1]) { K.circle(ctx, sg * hs * 0.22, -hs * 0.08, hs * 0.06); ctx.fill(); }
        ctx.beginPath(); ctx.moveTo(-hs * 0.4, -hs * 0.36); ctx.lineTo(-hs * 0.08, -hs * 0.26); ctx.moveTo(hs * 0.4, -hs * 0.36); ctx.lineTo(hs * 0.08, -hs * 0.26); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, hs * 0.38, hs * 0.18, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.restore();
        ctx.font = `800 ${s * 0.32}px "Martian Mono"`; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText('!!', s * 0.48, -s * 0.38); }
    }
    ctx.restore();
  };

  // ------------------------------------------------------------------ the S4 graph (stable vs unstable): one row of cars per chain,
  // each car's speed dip drawn as a dot height; the hump travels back (left) and shrinks (stable) or grows (unstable)
  let s4 = null; A.s4 = () => (s4 = s4 || K.ep1sim.get('S4'));
  A.graphS4 = function (ctx, t, ts, o = {}) {
    const r4 = A.s4(), rows = [['ESTABLE', r4.stable, 330], ['INESTABLE', r4.unstable, 760]];
    ctx.fillStyle = '#efe8da'; ctx.fillRect(0, 0, K.W, K.H);
    { const g = ctx.createRadialGradient(960, 400, 100, 960, 540, 1100); g.addColorStop(0, K.rgba('#ffffff', 0.4)); g.addColorStop(1, K.rgba('#c9bca4', 0.5)); ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H); }
    for (const [name, run, y0] of rows) {
      const hi = o.focus ? (o.focus === name ? 1 : 0.35) : 1;
      ctx.save(); ctx.globalAlpha = hi;
      P.pill(ctx, 1500, y0 - 200, name, 40, 1, { bg: name === 'ESTABLE' ? K.rgba(TEAL, 0.9) : K.rgba('#8a3b5a', 0.9) });
      ctx.strokeStyle = K.rgba(INK, 0.5); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(140, y0); ctx.lineTo(1800, y0); ctx.stroke();
      const S = run.atSim(ts), v0 = 8.33, N = run.N, pts = []; const SCL = o.scale || 14;
      for (let k = 0; k < N; k++) { const i = N - 1 - k, x = 1720 - k * 140, dip = Math.max(0, v0 - S.v[i]) * 3.6, y = y0 - 26 - dip * SCL; pts.push([x, y, dip]); }
      // the hump curve
      ctx.strokeStyle = name === 'ESTABLE' ? TEAL : '#8a3b5a'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
      pts.slice().reverse().forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      for (const [x, y] of pts) { K.car.top(ctx, { sc: 9, sinE: 0.6, cosE: 0.8, ox: x, oy: y0 + 30 }, 0, 0, Math.PI, { k: 1.0, color: '#b9c4cc', skin: '#e3a983', hair: '#2b1d1a', hairStyle: 'short', expr: 'content' });
        ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = 3; K.circle(ctx, x, y, 11); ctx.fill(); ctx.stroke(); }
      ctx.restore();
    }
    ctx.save(); ctx.font = '600 26px "Space Grotesk"'; ctx.fillStyle = K.rgba(INK, 0.7); ctx.fillText('← hacia atrás', 160, 1000); ctx.fillText('frenazo (km/h que pierde cada auto)', 1340, 1000); ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
