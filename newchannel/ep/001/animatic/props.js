/* Ep 001 · animatic props drawn in the channel style (flat fills, warm ink line, scene light): the little bird on the
   wire, the floating ink vignettes that get crossed out, hand-drawn teal arrows (on the asphalt and in the air), the
   ink ring that points at a car, music notes. All pure functions of their inputs (deterministic). */
(function (root) {
  const K = root.K, P = K.props = {};
  const INK = '#2a1a1e', PAPER = '#fbf3e4', TEAL = '#23746C';

  // ------------------------------------------------------------------ the bird on the wire (beat 3 gag)
  // o: { t, expr: 'calm'|'caught'|'shrug', shrug: 0..1, look: [x, y], rim, dir: 1|-1 }. (x, y) = feet on the wire, R = body radius
  P.bird = function (ctx, x, y, R, o = {}) {
    const t = o.t || 0, dir = o.dir || 1, sh = K.clamp(o.shrug || 0), lw = Math.max(1, R * 0.07);
    const body = '#8d6f63', belly = '#e9d2b4', wing = '#6f5550', beak = '#e7b04a';
    const bob = Math.sin(t * 3.1) * R * 0.03, tuck = sh * R * 0.12;
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = lw;
    // feet gripping the wire
    ctx.strokeStyle = '#4a3530'; ctx.lineWidth = lw * 1.1;
    for (const fx of [-0.25, 0.22]) { ctx.beginPath(); ctx.moveTo(fx * R, -R * 0.42); ctx.lineTo(fx * R, 0); ctx.moveTo(fx * R - R * 0.12, R * 0.02); ctx.lineTo(fx * R + R * 0.14, R * 0.02); ctx.stroke(); }
    ctx.strokeStyle = INK; ctx.lineWidth = lw;
    const cy = -R * 1.25 + bob + tuck;
    // tail
    ctx.fillStyle = wing; ctx.beginPath(); ctx.moveTo(-R * 0.75, cy + R * 0.2); ctx.lineTo(-R * 1.55, cy + R * 0.55 - sh * R * 0.3); ctx.lineTo(-R * 1.35, cy + R * 0.85 - sh * R * 0.2); ctx.lineTo(-R * 0.6, cy + R * 0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
    // body
    ctx.fillStyle = body; K.ellipse(ctx, 0, cy, R * 1.0, R * 0.92); ctx.fill(); ctx.stroke();
    ctx.save(); K.ellipse(ctx, 0, cy, R * 1.0, R * 0.92); ctx.clip();
    ctx.fillStyle = belly; K.ellipse(ctx, R * 0.25, cy + R * 0.45, R * 0.72, R * 0.62); ctx.fill();
    if (o.rim) { ctx.strokeStyle = K.rgba(o.rim, 0.85); ctx.lineWidth = lw * 1.4; K.ellipse(ctx, -R * 0.06, cy + R * 0.05, R * 1.0, R * 0.92); ctx.stroke(); }
    ctx.restore();
    // wings: rest along the body; shrug = both lift up and out (palms-up of a bird)
    for (const side of [-1, 1]) {
      const wx = side < 0 ? -R * 0.35 : R * 0.15, base = cy + R * 0.05, lift = sh * R * 0.75, out = sh * R * 0.55;
      ctx.save(); ctx.translate(wx, base); ctx.rotate(side * (-0.25 - sh * 0.9));
      ctx.fillStyle = side < 0 ? K.shade(wing, -0.08) : wing;
      ctx.beginPath(); ctx.moveTo(0, -R * 0.35); ctx.quadraticCurveTo(side * (R * 0.7 + out), -R * 0.25 - lift, side * (R * 0.9 + out), R * 0.15 - lift * 0.6);
      ctx.quadraticCurveTo(side * R * 0.45, R * 0.45, 0, R * 0.35); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    // head (part of the round body, eyes + brows + beak)
    const look = o.look || [0.3, 0], ex = R * 0.42 + look[0] * R * 0.06, ey = cy - R * 0.38 + look[1] * R * 0.06;
    const caught = o.expr === 'caught', shr = o.expr === 'shrug';
    for (const k of [-1, 1]) {
      const px = ex + k * R * 0.24, er = R * (caught ? 0.2 : 0.16);
      ctx.fillStyle = '#fbf7ee'; K.circle(ctx, px, ey, er); ctx.fill(); ctx.lineWidth = lw * 0.9; ctx.stroke();
      ctx.fillStyle = INK; K.circle(ctx, px + look[0] * er * 0.35, ey + look[1] * er * 0.35, er * (caught ? 0.42 : 0.55)); ctx.fill();
      if (shr) { ctx.fillStyle = body; ctx.beginPath(); ctx.rect(px - er * 1.2, ey - er * 1.3, er * 2.4, er * 1.05); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(px - er, ey - er * 0.25); ctx.lineTo(px + er, ey - er * 0.25); ctx.stroke(); }
      // brows
      ctx.strokeStyle = INK; ctx.lineWidth = lw * 1.3; ctx.beginPath();
      const bh = caught ? -er * 1.7 : shr ? -er * 0.9 : -er * 1.35, tilt = caught ? -k * er * 0.3 : shr ? k * er * 0.15 : 0;
      ctx.moveTo(px - er * 0.8, ey + bh + tilt); ctx.lineTo(px + er * 0.8, ey + bh - tilt); ctx.stroke();
    }
    // beak
    ctx.fillStyle = beak; ctx.lineWidth = lw * 0.9; ctx.beginPath(); ctx.moveTo(ex + R * 0.55, ey + R * 0.08); ctx.lineTo(ex + R * 0.98, ey + R * 0.2); ctx.lineTo(ex + R * 0.55, ey + R * 0.33); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (shr) { ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(ex + R * 0.56, ey + R * 0.2); ctx.lineTo(ex + R * 0.82, ey + R * 0.21); ctx.stroke(); }
    if (caught) K.char.extra(ctx, ex, cy - R * 0.2, R * 0.9, 'sweat', t, {});
    ctx.restore();
  };

  // ------------------------------------------------------------------ paper card with an ink drawing, crossed out
  // kind: 'crash' | 'cone' | 'light'; a = appear 0..1 (pop), x = cross 0..1 (stroke draw-on)
  P.card = function (ctx, cx, cy, w, kind, a, x, o = {}) {
    if (a <= 0.001) return;
    const s = 0.6 + 0.4 * K.ease.outBack(K.clamp(a)), h = w * 0.86, t = o.t || 0, rot = (o.rot || 0) + Math.sin(t * 1.3 + w) * 0.02;
    ctx.save(); ctx.globalAlpha = K.clamp(a * 2); ctx.translate(cx, cy + Math.sin(t * 1.7 + cx) * 4); ctx.rotate(rot); ctx.scale(s, s);
    ctx.fillStyle = K.rgba('#2a1830', 0.28); K.rrect(ctx, -w / 2 + 7, -h / 2 + 10, w, h, w * 0.08); ctx.fill();
    ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = w * 0.022; K.rrect(ctx, -w / 2, -h / 2, w, h, w * 0.08); ctx.fill(); ctx.stroke();
    const u = w / 100; ctx.lineWidth = 2.6 * u; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (kind === 'crash') {      // two little bubble cars nose to nose, a star of impact
      for (const sg of [-1, 1]) { ctx.save(); ctx.translate(sg * 20 * u, 6 * u); ctx.rotate(sg * 0.35); ctx.scale(-sg, 1);
        ctx.fillStyle = sg < 0 ? '#8aa3c9' : '#e2b04a'; K.rrect(ctx, -18 * u, -10 * u, 36 * u, 18 * u, 8 * u); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2a2230'; K.circle(ctx, -10 * u, 9 * u, 4.5 * u); ctx.fill(); K.circle(ctx, 10 * u, 9 * u, 4.5 * u); ctx.fill(); ctx.restore(); }
      ctx.fillStyle = '#f2c230'; ctx.beginPath(); for (let i = 0; i < 16; i++) { const r = (i % 2 ? 6 : 14) * u, an = i / 16 * K.TAU; ctx.lineTo(Math.cos(an) * r, -16 * u + Math.sin(an) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (kind === 'cone') { // a traffic cone with a reflective band (no orange-red: mustard + paper)
      ctx.fillStyle = '#e39a3a'; ctx.beginPath(); ctx.moveTo(-6 * u, -30 * u); ctx.lineTo(6 * u, -30 * u); ctx.lineTo(18 * u, 22 * u); ctx.lineTo(-18 * u, 22 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = PAPER; ctx.beginPath(); ctx.moveTo(-10.5 * u, -8 * u); ctx.lineTo(10.5 * u, -8 * u); ctx.lineTo(13.5 * u, 4 * u); ctx.lineTo(-13.5 * u, 4 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#5b5266'; K.rrect(ctx, -26 * u, 22 * u, 52 * u, 8 * u, 3 * u); ctx.fill(); ctx.stroke();
    } else if (kind === 'light') { // a traffic light
      ctx.fillStyle = '#4a4458'; K.rrect(ctx, -13 * u, -34 * u, 26 * u, 58 * u, 8 * u); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4a4458'; ctx.fillRect(-3 * u, 24 * u, 6 * u, 12 * u); ctx.strokeRect(-3 * u, 24 * u, 6 * u, 12 * u);
      [['#ff6a4a', -22], ['#f2c230', -5], ['#7fc48a', 12]].forEach(([c, yy]) => { ctx.fillStyle = c; K.circle(ctx, 0, yy * u, 6.5 * u); ctx.fill(); ctx.stroke(); });
    }
    // the cross: two quick pen strokes (ink), drawn on
    if (x > 0) {
      ctx.strokeStyle = INK; ctx.lineWidth = 7 * u; ctx.lineCap = 'round';
      const s1 = K.clamp(x * 2), s2 = K.clamp(x * 2 - 1), L = 40 * u;
      ctx.beginPath(); ctx.moveTo(-L, -L * 0.8); ctx.lineTo(-L + 2 * L * s1, -L * 0.8 + 1.6 * L * s1); ctx.stroke();
      if (s2 > 0) { ctx.beginPath(); ctx.moveTo(L, -L * 0.8); ctx.lineTo(L - 2 * L * s2, -L * 0.8 + 1.6 * L * s2); ctx.stroke(); }
    }
    ctx.restore();
  };

  // ------------------------------------------------------------------ hand-drawn teal arrow on the ground (road coords)
  // from (s0, l) to (s1, l), drawn on with k (0..1); wobble keeps it hand-made. G = { cam, rig, road } from drawHighway.
  P.groundArrow = function (ctx, G, s0, s1, l, k, o = {}) {
    if (k <= 0.001) return;
    const n = 26, w = o.w || 0.55, col = o.color || TEAL, pts = [];
    const se = s0 + (s1 - s0) * K.clamp(k / 0.8);
    for (let i = 0; i <= n; i++) { const u = i / n, s = s0 + (se - s0) * u; pts.push([s, l + Math.sin(u * 5.3 + 0.7) * 0.18]); }
    const left = pts.map(([s, ll]) => [s, ll - w / 2]), right = pts.map(([s, ll]) => [s, ll + w / 2]).reverse();
    const q = K.groundPoly(G.road, G.rig, G.cam, left.concat(right), 1.5);
    ctx.save(); ctx.globalAlpha = o.alpha ?? 0.92;
    if (q) { ctx.fillStyle = col; K.fillPoly(ctx, q); ctx.fill(); }
    const hk = K.clamp((k - 0.75) / 0.25);
    if (hk > 0) {    // arrow head at the far end
      const dir = Math.sign(s1 - s0), hs = 2.6 * hk, hw = 1.5 * hk;
      const hq = K.groundPoly(G.road, G.rig, G.cam, [[se - dir * 0.3, l - hw], [se + dir * hs, l], [se - dir * 0.3, l + hw]], 1.5);
      if (hq) { ctx.fillStyle = col; K.fillPoly(ctx, hq); ctx.fill(); }
    }
    ctx.restore();
  };
  // small chevron (screen space) pointing in direction ang (rad), teal with an ink edge
  P.chevron = function (ctx, x, y, size, ang, a = 1, col = TEAL) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(ang); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = K.rgba('#14262a', 0.7); ctx.lineWidth = size * 0.42; ctx.beginPath(); ctx.moveTo(-size * 0.5, -size * 0.6); ctx.lineTo(size * 0.35, 0); ctx.lineTo(-size * 0.5, size * 0.6); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = size * 0.26; ctx.stroke();
    ctx.restore();
  };
  // a loose ink ring drawn on around a point (pointing at something far away)
  P.ring = function (ctx, x, y, rx, ry, k, o = {}) {
    if (k <= 0.001) return;
    ctx.save(); ctx.strokeStyle = o.color || PAPER; ctx.lineWidth = o.w || 5; ctx.lineCap = 'round'; ctx.globalAlpha = o.alpha ?? 0.95;
    ctx.beginPath(); const a0 = -2.2, a1 = a0 + K.TAU * 1.08 * K.clamp(k);
    for (let a = a0; a <= a1; a += 0.05) { const wob = 1 + 0.06 * Math.sin(a * 3 + 1); ctx.lineTo(x + Math.cos(a) * rx * wob, y + Math.sin(a) * ry * wob); }
    ctx.stroke(); ctx.restore();
  };
  // music notes floating up (a calm, careless driver)
  P.notes = function (ctx, x, y, size, t, a = 1) {
    if (a <= 0.01) return;
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.55 + i / 3) % 1, nx = x + i * size * 0.7 + Math.sin(ph * 6 + i) * size * 0.25, ny = y - ph * size * 2.6, al = a * Math.sin(Math.PI * ph);
      ctx.save(); ctx.globalAlpha = al; ctx.translate(nx, ny); ctx.rotate(Math.sin(ph * 5 + i) * 0.25);
      ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = size * 0.08;
      K.ellipse(ctx, 0, 0, size * 0.26, size * 0.19, -0.4); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(size * 0.23, -size * 0.05); ctx.lineTo(size * 0.23, -size * 0.8); ctx.quadraticCurveTo(size * 0.5, -size * 0.65, size * 0.55, -size * 0.45); ctx.stroke();
      ctx.restore();
    }
  };
  // a short text call-out in the brand type (e.g. «pío»), paper with an ink outline, pops in
  P.callout = function (ctx, x, y, text, size, a) {
    if (a <= 0.01) return;
    const k = 0.6 + 0.4 * K.ease.outBack(K.clamp(a));
    ctx.save(); ctx.globalAlpha = K.clamp(a * 2); ctx.translate(x, y); ctx.scale(k, k); ctx.font = `700 ${size}px "Space Grotesk"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = size * 0.16; ctx.strokeText(text, 0, 0); ctx.fillStyle = PAPER; ctx.fillText(text, 0, 0); ctx.restore();
  };
  // puff of breath (Mila blowing her hair away)
  P.blow = function (ctx, x, y, size, k, dir = 1) {
    if (k <= 0.01 || k >= 1) return;
    ctx.save(); ctx.strokeStyle = K.rgba(PAPER, 0.9 * Math.sin(Math.PI * k)); ctx.lineWidth = size * 0.07; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); const x0 = x + dir * size * (0.2 + k * 0.8), y0 = y + i * size * 0.18 - k * size * 0.3; ctx.moveTo(x0, y0); ctx.lineTo(x0 + dir * size * 0.35, y0 - size * 0.08 * (1 + i * 0.3)); ctx.stroke(); }
    ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
