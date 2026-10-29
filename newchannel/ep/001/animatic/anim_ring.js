/* Ep 001 · animatic worlds for Act 1 (the 2008 ring, S2): the high-angle ring (the kit's E.drawRing driven by the S2
   adapter: ring of 230 m, 22 cars, sim seconds in) and the "field side" (eye level at the edge of the field: the near
   arc of the same ring as a band of side-view cars, Eli and Mila big in the foreground). Plus the overlays of Act 1:
   clock, counter, measuring tape, speed dial, badges, ink springs / squeezes, the shrug wave, the little bicycle. */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const INK = '#2a1a1e', PAPER = '#fbf3e4', TEAL = '#23746C';
  let s2 = null; A.s2 = () => (s2 = s2 || A.adapter('S2'));

  // ------------------------------------------------------------------ the high-angle ring
  A.ring = function (ctx, t, c) {
    return E.drawRing(ctx, t, 0, Object.assign({ run: A.s2(), simT: c.simT, mascot: -1 }, c));
  };
  // keep a zoomed view inside the baked 1920x1080 world (z = zoom about the screen centre)
  A.clampView = (p, z) => [K.clamp(p[0], 960 / z + 4, K.W - 960 / z - 4), K.clamp(p[1], 540 / z + 4, K.H - 540 / z - 4)];
  // ring geometry helpers (A._rr = the ring run of the current block: S2 by default, S7/S8/S9 in Act 3) (ground metres -> design px of the ring view)
  A.ringPt = (i, S, dr = 0) => { const L = (A._rr || A.s2()).p.L, a = (S.x[i] % L) / L * K.TAU, R = E.RING_RAD + dr; return E.ringG2S(Math.cos(a) * R, Math.sin(a) * R); };
  A.ringAng = (i, S) => { const L = (A._rr || A.s2()).p.L; return (S.x[i] % L) / L * K.TAU; };
  A.angPt = (a, dr = 0, Y = 0) => E.ringG2S(Math.cos(a) * (E.RING_RAD + dr), Math.sin(a) * (E.RING_RAD + dr), Y);
  // the jam centre at sim time ts: circular mean angle of the stopped cars (null if none)
  A.jamAt = function (ts) {
    const R = A._rr || A.s2(), S = R.at(ts); let sx = 0, sy = 0, n = 0;
    for (let i = 0; i < R.N; i++) if (S.v[i] < 1.0) { const a = A.ringAng(i, S); sx += Math.cos(a); sy += Math.sin(a); n++; }
    return n ? { a: Math.atan2(sy, sx), n } : null;
  };
  A.jamSmooth = function (ts, win = 3) {   // smoothed (sim seconds) so a camera can follow it
    let sx = 0, sy = 0;
    for (let k = -6; k <= 6; k++) { const j = A.jamAt(ts + k * win / 6); if (j) { const w = Math.exp(-k * k / 12); sx += Math.cos(j.a) * w; sy += Math.sin(j.a) * w; } }
    return Math.atan2(sy, sx);
  };

  // ------------------------------------------------------------------ the field side (eye level)
  let FS = null;
  const HZ = 560, TRACK_Y = 700, PXM = 22;          // horizon, track band (near arc), px per metre along the track
  function buildField() {
    const Pf = E.PAL.field, bg = K.canvas(K.W, K.H), c = bg.ctx;
    K.sky.gradient(c, [[0, '#8fa6c6'], [0.55, '#efcfa6'], [1, '#ffe0aa']], 0, HZ);
    K.sky.wash(c, 260, 80, 900, '#fff0c8', 0.55);
    K.terrain.ridge(c, { y: HZ - 70, amp: 80, freq: 0.0028, seed: 15, bottom: HZ + 40, color: K.mix('#9b8fa8', '#ffe0aa', 0.45), rim: '#fff0c8', rimW: 1.2 });
    K.terrain.ridge(c, { y: HZ - 20, amp: 34, freq: 0.006, seed: 16, bottom: HZ + 60, color: K.mix('#6f7f63', '#ffe0aa', 0.35) });
    const r = K.rng(17);
    for (let x = -20; x < K.W + 20; x += 18 + r() * 34) K.terrain.tree(c, x, HZ + 8 + r() * 10, 40 + r() * 60, { kind: r() < 0.4 ? 'poplar' : 'round', seed: r() * 1e6 | 0,
      color: K.mix(Pf.tree, '#f2d3a0', 0.45), shade: K.mix(Pf.treeDark, '#d9b08f', 0.4), trunk: '#8a6a58', light: { dx: -0.7, back: 0.35, rim: Pf.rim } });
    K.light.haze(c, HZ - 80, HZ, HZ + 60, '#ffe3b0', 0.55);
    const g = c.createLinearGradient(0, HZ, 0, K.H); g.addColorStop(0, K.mix(Pf.grass, '#ffe0aa', 0.4)); g.addColorStop(0.35, Pf.grass); g.addColorStop(1, K.mix(Pf.grass, Pf.grassDark, 0.45));
    c.fillStyle = g; c.fillRect(0, HZ, K.W, K.H - HZ);
    // far arc of the ring (thin band near the horizon) and the near arc (the track band)
    c.fillStyle = K.mix(Pf.track, '#ffe0aa', 0.35); c.fillRect(0, HZ + 34, K.W, 9);
    c.fillStyle = Pf.track; c.fillRect(0, TRACK_Y - 46, K.W, 62);
    c.fillStyle = K.rgba(Pf.trackLine, 0.85); c.fillRect(0, TRACK_Y - 46, K.W, 3); c.fillRect(0, TRACK_Y + 13, K.W, 4);
    for (let x = 0; x < K.W; x += 60) { c.fillStyle = K.rgba(Pf.trackLine, 0.35); c.fillRect(x, TRACK_Y - 16, 30, 2); }
    // painted grass: brush dabs (bigger toward the camera), flowers
    c.lineCap = 'round';
    for (let k = 0; k < 5200; k++) { const y = HZ + Math.pow(r(), 0.7) * (K.H - HZ), x = r() * K.W, d = (y - HZ) / (K.H - HZ); if (y > TRACK_Y - 50 && y < TRACK_Y + 20) continue;
      c.strokeStyle = K.rgba([Pf.grassLight, Pf.grassDark, '#e9cf7a', '#5d7a3e', '#fff0c8'][(r() * 5) | 0], 0.18 + 0.1 * r()); c.lineWidth = 1 + d * 6 * r();
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + (4 + d * 30) * (r() + 0.3), y + (r() - 0.5) * 2); c.stroke(); }
    for (let k = 0; k < 420; k++) { const y = TRACK_Y + 30 + r() * (K.H - TRACK_Y - 30), x = r() * K.W, d = (y - HZ) / (K.H - HZ);
      c.fillStyle = ['#fff4e0', '#ffd65a', '#c9a3e8', '#ff9a8a'][(r() * 4) | 0]; K.circle(c, x, y, 1.2 + d * 3.2 * r()); c.fill(); }
    for (let k = 0; k < 9; k++) { const x = 80 + k * 230 + r() * 60; c.fillStyle = '#e88a3a'; c.beginPath(); c.moveTo(x, TRACK_Y + 34); c.lineTo(x + 10, TRACK_Y + 56); c.lineTo(x - 10, TRACK_Y + 56); c.fill(); c.fillStyle = '#fff3df'; c.fillRect(x - 5, TRACK_Y + 44, 10, 4); }
    K.tex.paint(bg, { amount: 0.42, mottle: { w: 1000, h: 560, sx: 0.006, sy: 0.02, seed: 18, amp: 45 } });
    FS = { bg, tufts: Array.from({ length: 40 }, (_, k) => ({ x: (k + K.rng(19 + k)()) * 50, y: K.H - 10 - K.rng(40 + k)() * 60, h: 40 + K.rng(60 + k)() * 60, seed: k })) };
  }
  // c: { simT, frame: { z, x, y } (zoom about a design point), chars(ctx), front (bool: foreground tufts), shift (pan of the
  //      track in metres: which part of the near arc sits at screen centre) }
  A.field = function (ctx, t, c) {
    if (!FS) buildField();
    const Pf = E.PAL.field, R = c.run || A.s2(), S = R.at(c.simT), L = R.p.L, fr = c.frame || { z: 1, x: 960, y: 540 };
    ctx.save(); ctx.translate(960, 540); ctx.scale(fr.z, fr.z); ctx.translate(-fr.x, -fr.y);
    ctx.drawImage(FS.bg.c, 0, 0);
    // drifting clouds
    K.sky.drawClouds(ctx, A._fieldClouds = A._fieldClouds || E.goldenClouds([200, 60], [[300, 160, 520, 110, 21, 5], [1100, 110, 600, 120, 22, 4], [1800, 220, 420, 90, 23, 6]]), t, {});
    // cars: the near arc as a straight band (moving left), the far arc tiny near the horizon (moving right)
    const lit = { rim: Pf.rim, shade: Pf.shadow, dx: -1 };
    const items = [];
    for (let i = 0; i < R.N; i++) {
      const a = (S.x[i] % L) / L * K.TAU, sa = Math.sin(a), ca = Math.cos(a);
      if (c.hide && c.hide(i)) continue;
      if (sa > 0.05) items.push({ i, x: 960 + ca * E.RING_RAD * PXM * (c.spread || 1.0) + (c.shift || 0) * PXM, y: TRACK_Y, s: PXM * 1.35, dir: -1 });
      else if (sa < -0.2) items.push({ i, x: 960 + ca * E.RING_RAD * 7, y: HZ + 40, s: 6.5, dir: 1, far: true });
    }
    items.sort((p, q) => p.y - q.y);
    for (const it of items) {
      if (it.x < -200 || it.x > K.W + 200) continue;
      const pe = E.persona(300 + it.i), b = R.brake(it.i, c.simT), stopped = S.v[it.i] < 1.0;
      ctx.fillStyle = K.rgba(Pf.shadow, 0.3); K.ellipse(ctx, it.x + it.s * 0.6, it.y + 2, it.s * 2.0, it.s * 0.18); ctx.fill();
      K.car.side(ctx, it.x, it.y, it.s, { dir: it.dir, color: pe.color, lit, brake: b, wheel: S.x[it.i] * 3.1,
        drawDriver: it.far ? null : (sx, sy) => K.char.head(ctx, sx, sy - it.s * 0.3, it.s * 0.36, { view: 'q', dir: it.dir, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, capColor: pe.capColor,
          expr: c.carExpr ? c.carExpr(it.i, stopped, b) : stopped ? 'annoyed' : b > 0.5 ? 'worried' : 'focused', look: [it.dir * 0.9, 0], light: { ang: -2.4, rim: Pf.rim, shade: Pf.shadow } }) });
      if (c.carOver) c.carOver(ctx, it.i, it.x, it.y, it.s, b);
    }
    if (c.chars) c.chars(ctx);
    if (c.front !== false) for (const tf of FS.tufts) K.terrain.tuft(ctx, tf.x, tf.y + 60, tf.h, K.shade(Pf.grass, -0.3), { seed: tf.seed, n: 6, rim: Pf.rim, wind: Math.sin(t * 2 + tf.x) * 0.15 });
    ctx.restore();
    if (c.lowFG) A.lowFG(ctx, t, c.lowFG);   // art review P1-6: low camera at grass level, out-of-focus flowers in front (screen space, graded with the shot)
    K.light.shafts(ctx, { n: 5, angle: -0.5, alpha: 0.07, color: '#fff0c0', y0: 0, y1: K.H, t, seed: 4 });
    K.sky.wash(ctx, 160, 40, 900, '#ffd9a0', 0.28);
    K.particles.motes(ctx, t, { n: 36, seed: 33, color: '#fff0c8', alpha: 0.5, size: 2.2, vx: 7, vy: -2 });
    K.light.grade(ctx, Pf.grade, 0.2, 'soft-light');
  };
  A.FIELD = { HZ, TRACK_Y, PXM, GROUND: 1010 };
  // the low-angle foreground (P1-6): grass blades + wild flowers right in front of the lens, painted once at design size and
  // blurred (a shallow depth of field), swaying a little; o: { h: band height (default 230), side: 'both' | 'left' | 'right' }
  let LOWFG = null;
  A.lowFG = function (ctx, t, o = {}) {
    if (!LOWFG) { const W = K.W + 200, H = 340, L = K.canvas(W, H), B = K.canvas(W, H), r = K.rng(907), g = L.ctx, Pf = E.PAL.field;
      for (let k = 0; k < 150; k++) { const x = r() * W, h = 110 + r() * 220, bend = (r() - 0.5) * 70, w = 9 + r() * 12;
        g.fillStyle = K.mix(K.shade(Pf.grass, -0.45), K.shade(Pf.grass, 0.05), r()); g.beginPath(); g.moveTo(x - w, H); g.quadraticCurveTo(x + bend * 0.4, H - h * 0.6, x + bend, H - h); g.quadraticCurveTo(x + bend * 0.4 + w * 0.3, H - h * 0.55, x + w, H); g.fill(); }
      const FL = ['#f2c230', '#fbf3e4', '#e98aa0', '#c9a0e8', '#ffd08a'];
      for (let k = 0; k < 26; k++) { const x = r() * W, y = H - 90 - r() * 170, R = 14 + r() * 16; g.fillStyle = FL[(r() * FL.length) | 0];
        for (let j = 0; j < 5; j++) { const a = j / 5 * K.TAU; K.circle(g, x + Math.cos(a) * R * 0.6, y + Math.sin(a) * R * 0.6, R * 0.55); g.fill(); } g.fillStyle = '#d9822b'; K.circle(g, x, y, R * 0.35); g.fill(); }
      B.ctx.filter = 'blur(9px)'; B.ctx.drawImage(L.c, 0, 0); B.ctx.filter = 'none'; LOWFG = B; }
    const h = o.h || 230, sx = Math.sin(t * 0.9) * 18 - 100;
    ctx.save(); ctx.globalAlpha = 0.96;
    ctx.drawImage(LOWFG.c, 0, 0, LOWFG.c.width, LOWFG.c.height, sx, K.H - h * 1.25, LOWFG.c.width, h * 1.25 + 4);
    ctx.restore();
  };
  A.LIGHT_FIELD = Object.assign({}, K.cast.LIGHT.golden, { ang: -2.45, rim: '#ffd99a', shade: '#3a3358' });

  // ------------------------------------------------------------------ Act 1 overlays (screen space, design units)
  const pill = (ctx, x, y, text, size, a, o = {}) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.font = `700 ${size}px "Martian Mono"`; ctx.textBaseline = 'middle';
    const w = ctx.measureText(text).width, pad = size * 0.55, h = size * 1.6, x0 = o.align === 'right' ? x - w - pad * 2 : o.align === 'center' ? x - w / 2 - pad : x;
    ctx.fillStyle = o.bg || K.rgba('#1C2433', 0.66); K.rrect(ctx, x0, y - h / 2, w + pad * 2, h, h / 2); ctx.fill();
    ctx.fillStyle = o.color || '#F3ECDD'; ctx.fillText(text, x0 + pad, y + size * 0.04); ctx.restore();
  };
  P.pill = pill;
  // sim clock (mm:ss) top-right
  P.clock = function (ctx, simSec, a = 1) {
    const m = Math.floor(Math.max(0, simSec) / 60), s = Math.floor(Math.max(0, simSec) % 60);
    pill(ctx, K.W - 96, 84, `${m}:${String(s).padStart(2, '0')}`, 34, a, { align: 'right' });
  };
  // source line, small, bottom-left above the bottom 12 %
  P.source = (ctx, text, a = 1) => { if (a <= 0.01) return; ctx.save(); ctx.globalAlpha = a * 0.9; ctx.font = '500 22px "Space Grotesk"'; ctx.fillStyle = '#fbf3e4';
    ctx.shadowColor = 'rgba(20,10,30,0.7)'; ctx.shadowBlur = 6; ctx.fillText(text, 96, K.H * 0.88 - 18); ctx.restore(); };
  // big paper number with a label (counter "22", badge "5")
  P.badge = function (ctx, x, y, text, size, a, sub = null) {
    if (a <= 0.01) return;
    const k = 0.6 + 0.4 * K.ease.outBack(K.clamp(a));
    ctx.save(); ctx.globalAlpha = K.clamp(a * 2); ctx.translate(x, y); ctx.scale(k, k);
    ctx.font = `800 ${size}px "Martian Mono"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = Math.max(size * 1.3, ctx.measureText(text).width + size * 0.6), h = size * 1.3;
    ctx.fillStyle = K.rgba('#2a1830', 0.3); K.rrect(ctx, -w / 2 + 6, -h / 2 + 8, w, h, h * 0.3); ctx.fill();
    ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = size * 0.06; K.rrect(ctx, -w / 2, -h / 2, w, h, h * 0.3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.fillText(text, 0, size * 0.05);
    if (sub) { const fs = Math.max(size * 0.45, 40); ctx.font = `700 ${fs}px "Space Grotesk"`; ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = fs * 0.2; ctx.lineJoin = 'round'; ctx.strokeText(sub, 0, h / 2 + fs * 0.85); ctx.fillText(sub, 0, h / 2 + fs * 0.85); }   /* art review 2026-10: the label under the number was 0.3x (21-25 px @1080p, unreadable on a phone): now >= 40 px (ART_BIBLE text minimum) with a full ink outline */
    ctx.restore();
  };
  // speed dial with a needle that swings to v (km/h), label under it
  P.dial = function (ctx, x, y, r, v, vmax, label, a) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = K.clamp(a * 2); ctx.translate(x, y);
    ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = r * 0.07; ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, 0); ctx.lineTo(r, r * 0.18); ctx.lineTo(-r, r * 0.18); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let k = 0; k <= 6; k++) { const an = Math.PI + k / 6 * Math.PI; ctx.lineWidth = r * 0.04; ctx.beginPath(); ctx.moveTo(Math.cos(an) * r * 0.78, Math.sin(an) * r * 0.78); ctx.lineTo(Math.cos(an) * r * 0.9, Math.sin(an) * r * 0.9); ctx.stroke(); }
    const an = Math.PI + K.clamp(v / vmax) * Math.PI; ctx.strokeStyle = TEAL; ctx.lineWidth = r * 0.08; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * r * 0.72, Math.sin(an) * r * 0.72); ctx.stroke();
    ctx.fillStyle = INK; K.circle(ctx, 0, 0, r * 0.09); ctx.fill();
    ctx.font = `700 ${r * 0.36}px "Martian Mono"`; ctx.textAlign = 'center'; ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = r * 0.08; ctx.lineJoin = 'round';
    ctx.strokeText(label, 0, r * 0.62); ctx.fillText(label, 0, r * 0.62); ctx.restore();
  };
  // measuring tape around the ring (drawn on, k 0..1), mustard tape with ink ticks; label at the end
  P.tape = function (ctx, k, label, a = 1) {
    if (k <= 0.001) return;
    ctx.save(); ctx.globalAlpha = a; const a0 = 2.2, n = 120, m = Math.max(2, Math.round(n * K.clamp(k)));
    const pts = []; for (let j = 0; j <= m; j++) pts.push(A.angPt(a0 + j / n * K.TAU, 6.2));
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = 15; ctx.beginPath(); pts.forEach((p, j) => (j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.strokeStyle = '#e2b04a'; ctx.lineWidth = 10; ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 2; for (let j = 0; j < m; j += 3) { const p = pts[j], q = pts[j + 1]; const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1; ctx.beginPath(); ctx.moveTo(p[0] - dy / d * 4, p[1] + dx / d * 4); ctx.lineTo(p[0] + dy / d * 4, p[1] - dx / d * 4); ctx.stroke(); }
    const e = pts[pts.length - 1]; ctx.fillStyle = '#c99633'; ctx.strokeStyle = INK; ctx.lineWidth = 3; K.rrect(ctx, e[0] - 16, e[1] - 16, 32, 32, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
    if (k > 0.95 && label) P.badge(ctx, e[0] + 90, e[1] - 70, label, 60, K.clamp((k - 0.95) / 0.05));
  };
  // ink spring between two points (a gap opening), ink squeeze arrows (a gap closing)
  P.spring = function (ctx, p, q, a) {
    if (a <= 0.01) return; const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = PAPER; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let j = 0; j <= 40; j++) { const u = j / 40, w = Math.sin(u * Math.PI * 12) * 10 * Math.sin(u * Math.PI); const x = p[0] + dx * u + nx * w, y = p[1] + dy * u + ny * w - 22; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  };
  P.squeeze = function (ctx, x, y, size, a) {
    if (a <= 0.01) return;
    for (const sg of [-1, 1]) P.chevron(ctx, x + sg * size * (1.4 - 0.4 * a), y - size, size, sg < 0 ? 0 : Math.PI, a, PAPER);
  };
  // a shrug mark over a head: two small arcs + "?" (the shrug wave)
  P.shrug = function (ctx, x, y, size, a) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = K.clamp(a); ctx.strokeStyle = PAPER; ctx.lineWidth = size * 0.16; ctx.lineCap = 'round';
    const lift = Math.sin(Math.PI * K.clamp(a)) * size * 0.3;
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sg * size * 0.5, y - lift); ctx.quadraticCurveTo(x + sg * size * 0.95, y - size * 0.55 - lift, x + sg * size * 1.25, y - size * 0.2 - lift); ctx.stroke(); }
    ctx.font = `800 ${size * 0.9}px "Martian Mono"`; ctx.textAlign = 'center'; ctx.lineWidth = size * 0.14; ctx.strokeStyle = INK; ctx.strokeText('?', x, y - size * 0.8 - lift); ctx.fillStyle = PAPER; ctx.fillText('?', x, y - size * 0.8 - lift);
    ctx.restore();
  };
  // the little ink bicycle (pedals turn with ph), facing dir
  P.bike = function (ctx, x, y, size, ph, dir = 1, bell = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ctx.strokeStyle = INK; ctx.lineWidth = size * 0.07; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const r = size * 0.32; for (const wx of [-size * 0.5, size * 0.5]) { ctx.fillStyle = K.rgba(PAPER, 0.5); K.circle(ctx, wx, 0, r); ctx.fill(); ctx.stroke(); }
    ctx.strokeStyle = TEAL; ctx.lineWidth = size * 0.09; ctx.beginPath(); ctx.moveTo(-size * 0.5, 0); ctx.lineTo(-size * 0.05, 0); ctx.lineTo(size * 0.3, -size * 0.42); ctx.lineTo(-size * 0.2, -size * 0.42); ctx.closePath(); ctx.moveTo(size * 0.3, -size * 0.42); ctx.lineTo(size * 0.5, 0); ctx.moveTo(size * 0.3, -size * 0.42); ctx.lineTo(size * 0.36, -size * 0.6); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = size * 0.06; ctx.beginPath(); ctx.moveTo(size * 0.26, -size * 0.62); ctx.lineTo(size * 0.46, -size * 0.6); ctx.moveTo(-size * 0.28, -size * 0.5); ctx.lineTo(-size * 0.1, -size * 0.5); ctx.stroke();
    const px = Math.cos(ph) * size * 0.15, py = Math.sin(ph) * size * 0.15; ctx.beginPath(); ctx.moveTo(-size * 0.05 - px, -py); ctx.lineTo(-size * 0.05 + px, py); ctx.stroke();
    if (bell > 0) { ctx.strokeStyle = PAPER; ctx.lineWidth = size * 0.05; for (let j = 1; j <= 2; j++) { ctx.globalAlpha = bell; ctx.beginPath(); ctx.arc(size * 0.42, -size * 0.66, size * 0.12 * j, -2.2, -0.6); ctx.stroke(); } }
    ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
