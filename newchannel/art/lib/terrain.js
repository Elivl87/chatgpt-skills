/* Diez Mil Puntos art kit · terrain: hill ridges, trees, bushes, grass tufts, poles. Screen-space drawing with a
   light description { dx: -1..1 (where the light comes from horizontally), back: 0..1 (backlit amount), rim: colour }. */
(function (root) {
  const K = root.K;
  K.terrain = {};

  // a silhouette ridge from x0..x1 at baseline y with fbm bumps; filled down to yBottom
  K.terrain.ridgePath = function (ctx, o) {
    const x0 = o.x0 ?? -50, x1 = o.x1 ?? K.W + 50, step = o.step || 6;
    ctx.beginPath(); ctx.moveTo(x0, o.bottom ?? K.H);
    for (let x = x0; x <= x1 + step; x += step) {
      const n = K.fbm((x + (o.off || 0)) * (o.freq || 0.003), 0.5, o.oct || 4, o.seed || 1);
      const big = o.peaks ? o.peaks(x) : 0;
      ctx.lineTo(x, o.y - (n - 0.35) * (o.amp || 120) - big);
    }
    ctx.lineTo(x1 + step, o.bottom ?? K.H); ctx.closePath();
  };
  K.terrain.ridge = function (ctx, o) {
    K.terrain.ridgePath(ctx, o);
    if (o.grad) {
      const g = ctx.createLinearGradient(0, o.y - (o.amp || 120), 0, o.bottom ?? K.H);
      o.grad.forEach(([t, c]) => g.addColorStop(t, c)); ctx.fillStyle = g;
    } else ctx.fillStyle = o.color;
    ctx.fill();
    if (o.rim) { // thin lit top edge, inside the silhouette
      ctx.save(); K.terrain.ridgePath(ctx, o); ctx.clip();
      ctx.lineWidth = (o.rimW || 3) * 2; ctx.strokeStyle = K.rgba(o.rim, o.rimAlpha ?? 0.6);
      ctx.translate(o.rimDx || 0, 0); K.terrain.ridgePath(ctx, o); ctx.stroke(); ctx.restore();
    }
  };

  // round deciduous tree. (x, y) = trunk base on the ground, h = total height in px.
  K.terrain.tree = function (ctx, x, y, h, o = {}) {
    const r = K.rng(o.seed || 1), L = o.light || { dx: -0.5, back: 0.6, rim: '#ffd890' };
    const leaf = o.color || '#4f7a4a', dark = o.shade || K.mix(leaf, '#1d2a3a', 0.45), trunk = o.trunk || '#4a3328';
    const kind = o.kind || 'round';
    if (o.sway) { ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, o.sway, 1, 0, 0); ctx.translate(-x, -y); const o2 = Object.assign({}, o, { sway: 0 }); K.terrain.tree(ctx, x, y, h, o2); ctx.restore(); return; }
    const cw = h * (kind === 'poplar' ? 0.26 : kind === 'pine' ? 0.42 : 0.62), ch = h * (kind === 'round' ? 0.62 : 0.8);
    const cy = y - h + ch / 2;
    // trunk
    ctx.fillStyle = trunk; const tw = Math.max(1, h * 0.05);
    ctx.beginPath(); ctx.moveTo(x - tw, y); ctx.lineTo(x - tw * 0.5, cy); ctx.lineTo(x + tw * 0.5, cy); ctx.lineTo(x + tw, y); ctx.fill();
    // canopy blobs
    const blobs = [];
    if (kind === 'pine') {
      ctx.fillStyle = dark; ctx.beginPath();
      const tiers = 4;
      for (let i = 0; i < tiers; i++) {
        const ty = y - h + (i / tiers) * ch * 1.05, bw = cw * (0.35 + 0.65 * (i + 1) / tiers);
        ctx.moveTo(x, ty); ctx.lineTo(x + bw / 2, ty + ch / tiers * 1.5); ctx.lineTo(x - bw / 2, ty + ch / tiers * 1.5); ctx.closePath();
      }
      ctx.fill();
      if (L.rim) { ctx.save(); ctx.clip(); ctx.fillStyle = K.rgba(L.rim, 0.55 * (L.back ?? 0.5));
        ctx.translate(-L.dx * cw * 0.12, cw * 0.06); ctx.fillRect(x - cw, y - h - 50, cw * 2, ch * 2); ctx.restore();
        ctx.fillStyle = dark; ctx.beginPath();
        for (let i = 0; i < tiers; i++) { const ty = y - h + (i / tiers) * ch * 1.05 + cw * 0.05, bw = cw * (0.35 + 0.65 * (i + 1) / tiers) * 0.9;
          ctx.moveTo(x - L.dx * cw * 0.05, ty); ctx.lineTo(x + bw / 2, ty + ch / tiers * 1.5); ctx.lineTo(x - bw / 2, ty + ch / tiers * 1.5); ctx.closePath(); }
        ctx.fill(); }
      return;
    }
    const n = kind === 'poplar' ? 6 : 9;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * K.TAU + r() * 0.5, rr = cw * (0.22 + r() * 0.12);
      blobs.push([x + Math.cos(a) * cw * 0.28, cy + Math.sin(a) * ch * 0.3, rr]);
    }
    blobs.push([x, cy, cw * 0.36]);
    // shadow mass
    ctx.fillStyle = dark; for (const [bx, by, br] of blobs) { K.circle(ctx, bx, by, br); ctx.fill(); }
    // lit mass (offset toward the light; smaller when backlit)
    const back = L.back ?? 0.5;
    ctx.save();
    ctx.beginPath(); for (const [bx, by, br] of blobs) { ctx.moveTo(bx + br, by); ctx.arc(bx, by, br, 0, K.TAU); } ctx.clip();
    ctx.fillStyle = back > 0.5 ? K.mix(leaf, dark, 0.35) : leaf;
    const ox = L.dx * cw * 0.16, oy = -ch * 0.1;
    ctx.beginPath(); for (const [bx, by, br] of blobs) { ctx.moveTo(bx + ox + br * 0.9, by + oy); ctx.arc(bx + ox, by + oy, br * 0.9, 0, K.TAU); } ctx.fill();
    // rim light: thin bright crescent on the light side
    if (L.rim) {
      ctx.fillStyle = K.rgba(L.rim, 0.85 * Math.max(0.25, back));
      ctx.beginPath(); for (const [bx, by, br] of blobs) { ctx.moveTo(bx + br, by); ctx.arc(bx, by, br, 0, K.TAU); } ctx.fill();
      ctx.fillStyle = back > 0.5 ? K.mix(leaf, dark, 0.35) : leaf;
      const rx = -L.dx * Math.max(1.2, cw * 0.04), ry = Math.max(1.2, cw * 0.04);
      ctx.beginPath(); for (const [bx, by, br] of blobs) { ctx.moveTo(bx + rx + br, by + ry); ctx.arc(bx + rx, by + ry, br, 0, K.TAU); } ctx.fill();
      ctx.fillStyle = dark; ctx.globalAlpha = 0.55;
      ctx.beginPath(); for (const [bx, by, br] of blobs) { ctx.moveTo(bx - ox * 1.2 + br, by + ch * 0.12); ctx.arc(bx - ox * 1.2, by + ch * 0.12, br * 0.85, 0, K.TAU); } ctx.fill();
      ctx.globalAlpha = 1;
    }
    // leaf flecks
    if (h > 60) {
      ctx.fillStyle = K.rgba(L.rim || '#ffffff', 0.25);
      for (let i = 0; i < 10; i++) { const a = r() * K.TAU, d = r() * cw * 0.45; K.ellipse(ctx, x + Math.cos(a) * d + ox, cy + Math.sin(a) * d * 0.8 + oy, h * 0.018, h * 0.01, a); ctx.fill(); }
    }
    ctx.restore();
  };

  // tuft of grass blades (curved triangles)
  K.terrain.tuft = function (ctx, x, y, h, color, o = {}) {
    const r = K.rng(o.seed || 3), n = o.n || 5;
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const bx = x + (r() - 0.5) * h * 0.6, lean = (r() - 0.5) * h * 0.6 + (o.wind || 0) * h, bh = h * (0.5 + r() * 0.5), bw = h * 0.07;
      ctx.beginPath(); ctx.moveTo(bx - bw, y); ctx.quadraticCurveTo(bx, y - bh * 0.6, bx + lean, y - bh); ctx.quadraticCurveTo(bx + bw * 0.3, y - bh * 0.5, bx + bw, y); ctx.fill();
    }
    if (o.rim) {
      ctx.fillStyle = K.rgba(o.rim, 0.5);
      for (let i = 0; i < 2; i++) { const bx = x + (r() - 0.5) * h * 0.5, bh = h * (0.6 + r() * 0.4), lean = (r() - 0.5) * h * 0.4;
        ctx.beginPath(); ctx.moveTo(bx - 1, y); ctx.quadraticCurveTo(bx, y - bh * 0.6, bx + lean, y - bh); ctx.lineTo(bx + 1, y); ctx.fill(); }
    }
  };

  // wooden utility pole with cross-arm; returns the cross-arm insulator points for wires
  K.terrain.pole = function (ctx, x, y, h, o = {}) {
    const w = Math.max(1, h * 0.022);
    ctx.fillStyle = o.color || '#3b2a2a';
    ctx.fillRect(x - w / 2, y - h, w, h);
    const aw = h * 0.16, ay = y - h * 0.93;
    ctx.fillRect(x - aw, ay, aw * 2, Math.max(1, w * 0.7));
    if (o.rim) { ctx.fillStyle = K.rgba(o.rim, 0.6); ctx.fillRect(x - w / 2 + (o.dx < 0 ? 0 : w * 0.6), y - h, Math.max(0.7, w * 0.4), h); }
    return [[x - aw * 0.85, ay], [x + aw * 0.85, ay]];
  };
  K.terrain.wire = function (ctx, a, b, sag, color, width = 1.2) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(a[0], a[1]);
    ctx.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag * 2, b[0], b[1]); ctx.stroke();
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ---- v2 foreground framing + ground brushwork helpers */
(function (root) {
  const K = root.K;
  // a leafy branch hanging into frame from a corner (sprite, drawn once, optionally blurred for depth of field).
  // o: { w, h, dir: +1 grows right (from the left edge) / -1, color, dark, rim, seed, blur, leaves }
  K.terrain.branchSprite = function (o = {}) {
    const w = o.w || 700, h = o.h || 420, S = K.canvas(w, h), c = S.ctx, r = K.rng(o.seed || 3), dir = o.dir || 1;
    const X = x => (dir > 0 ? x : w - x);
    const col = o.color || '#3a4a3a', dark = o.dark || K.mix(col, '#101820', 0.45), rim = o.rim;
    // main twig: from the corner (0, 0) curving down-right
    const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([u * w * 0.92, h * (0.1 + 0.55 * u * u) + Math.sin(u * 5) * 8]); }
    c.strokeStyle = dark; c.lineCap = 'round';
    for (let i = 0; i < pts.length - 1; i++) { c.lineWidth = 14 * (1 - i / 12) + 2; c.beginPath(); c.moveTo(X(pts[i][0]), pts[i][1]); c.lineTo(X(pts[i + 1][0]), pts[i + 1][1]); c.stroke(); }
    const leaf = (x, y, s, a, fill) => { c.save(); c.translate(X(x), y); c.rotate(dir > 0 ? a : Math.PI - a); c.fillStyle = fill;
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * 0.5, -s * 0.32, s, 0); c.quadraticCurveTo(s * 0.5, s * 0.32, 0, 0); c.fill(); c.restore(); };
    const n = o.leaves || 90;
    for (let pass = 0; pass < 2; pass++) for (let k = 0; k < n; k++) {
      const i = Math.floor(r() * 11) + 1, p = pts[i], a = (r() - 0.3) * 2.4 + 0.6, s = (36 + r() * 46) * (1.1 - i / 14);
      const x = p[0] + (r() - 0.5) * 50, y = p[1] + (r() - 0.3) * 50;
      leaf(x, y, s, a, pass === 0 ? dark : K.mix(col, dark, r() * 0.5));
    }
    if (rim) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = K.rgba(rim, 0.35);
      for (let k = 0; k < 40; k++) { const i = Math.floor(r() * 11) + 1, p = pts[i]; leaf(p[0] + (r() - 0.5) * 50, p[1] - 10 - r() * 30, 30 + r() * 30, -0.3 - r(), K.rgba(rim, 0.3)); } }
    if (o.blur) { const B = K.canvas(w, h); B.ctx.filter = `blur(${o.blur}px)`; B.ctx.drawImage(S.c, 0, 0); return B; }
    return S;
  };
  // draw a framing sprite anchored at (ax, ay) with a slow sway (rotation about the anchor)
  K.terrain.drawSway = function (ctx, S, ax, ay, t, o = {}) {
    const a = Math.sin(t * (o.f || 0.9) + (o.ph || 0)) * (o.amp || 0.018) + Math.sin(t * 2.3 + (o.ph || 0)) * (o.amp || 0.018) * 0.25;
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(a); ctx.drawImage(S.c, -(o.ox || 0), -(o.oy || 0)); ctx.restore();
  };
  // a clump of tall reeds / grass blades rising from the bottom edge (sprite). Blades drawn as tapered curves.
  K.terrain.reedSprite = function (o = {}) {
    const w = o.w || 500, h = o.h || 420, S = K.canvas(w, h), c = S.ctx, r = K.rng(o.seed || 5);
    const col = o.color || '#3b4a34', dark = o.dark || K.mix(col, '#0e1420', 0.5);
    const n = o.n || 40;
    for (let k = 0; k < n; k++) {
      const bx = r() * w, bh = h * (0.35 + r() * 0.65), lean = (r() - 0.5) * w * 0.35, bw = 5 + r() * 9;
      c.fillStyle = r() < 0.5 ? dark : K.mix(col, dark, r() * 0.5);
      c.beginPath(); c.moveTo(bx - bw, h); c.quadraticCurveTo(bx + lean * 0.2, h - bh * 0.6, bx + lean, h - bh); c.quadraticCurveTo(bx + lean * 0.2 + bw * 0.4, h - bh * 0.5, bx + bw, h); c.fill();
      if (o.heads && r() < 0.25) { c.fillStyle = o.headColor || '#6b5038'; K.ellipse(c, bx + lean, h - bh, 4, 16, Math.atan2(lean, bh)); c.fill(); }
    }
    if (o.rim) { c.globalCompositeOperation = 'source-atop'; const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, K.rgba(o.rim, 0.5)); g.addColorStop(0.4, K.rgba(o.rim, 0)); c.fillStyle = g; c.fillRect(0, 0, w, h); }
    if (o.blur) { const B = K.canvas(w, h); B.ctx.filter = `blur(${o.blur}px)`; B.ctx.drawImage(S.c, 0, 0); return B; }
    return S;
  };
  // draw a sprite whose bottom edge is planted, skewed by the wind (top moves, base fixed)
  K.terrain.drawWind = function (ctx, S, x, yBottom, t, o = {}) {
    const k = Math.sin(t * (o.f || 1.3) + (o.ph || 0)) * (o.amp || 0.05) + Math.sin(t * 3.1 + (o.ph || 0) * 2) * (o.amp || 0.05) * 0.3;
    ctx.save(); ctx.translate(x, yBottom); ctx.transform(1, 0, -k, 1, 0, 0); ctx.globalAlpha = o.alpha ?? 1; ctx.drawImage(S.c, -(o.ox ?? S.w / 2), -S.h); ctx.restore();
  };

  // ground brushwork for a perspective ground plane: world-anchored dabs (so they travel with the camera), batched by
  // colour / width / distance band. pt(s, l) -> {x, y, d} or null. o: { sMin, sMax, lAt(d) -> [lo, hi], skip(s, l), colors: [[col, alpha]...], seed }
  K.terrain.brush = function (ctx, pt, o) {
    const bands = {}, fogK = o.fogK || (d => 1);
    const cellAt = d => (d < 35 ? 2 : d < 90 ? 4 : d < 220 ? 8 : 16);
    let s = Math.floor(o.sMin / 2) * 2;
    while (s < o.sMax) {
      const d0 = s - o.sCam, cs = cellAt(Math.max(1, d0));
      s = Math.floor(s / cs) * cs;
      const [lo, hi] = o.lAt(Math.max(1, d0));
      for (let l = Math.floor(lo / cs) * cs; l < hi; l += cs) {
        if (o.skip && o.skip(s + cs / 2, l + cs / 2)) continue;
        const r = K.rng((Math.imul(Math.round(s / cs) | 0, 73856093) ^ Math.imul(Math.round(l / cs) | 0, 19349663) ^ (cs * 83492791)) >>> 0 || 1);
        const p00 = pt(s, l), p10 = pt(s + cs, l), p01 = pt(s, l + cs);
        if (!p00 || !p10 || !p01) continue;
        const ax = p01.x - p00.x, ay = p01.y - p00.y, bx = p10.x - p00.x, by = p10.y - p00.y;   // a: along l, b: along s
        const thick = Math.max(0.6, Math.hypot(bx, by) * 0.22), band = p00.d < 60 ? 0 : p00.d < 200 ? 1 : 2, fa = fogK(p00.d);
        const nd = o.per || 3;
        for (let k = 0; k < nd; k++) {
          const u = r(), v = r(), len = 0.1 + r() * r() * 0.55, tilt = (r() - 0.5) * 0.9;
          const ci = Math.floor(r() * o.colors.length), wq = Math.round(Math.log2(thick * (0.6 + r() * 0.8)) * 2);
          const cx = p00.x + ax * u + bx * v, cy = p00.y + ay * u + by * v;
          const key = ci + '|' + wq + '|' + band;
          (bands[key] = bands[key] || { ci, w: Math.pow(2, wq / 2), band, fa, segs: [] }).segs.push(cx - ax * len / 2 - bx * tilt * len, cy - ay * len / 2 - by * tilt * len, cx + ax * len / 2 + bx * tilt * len, cy + ay * len / 2 + by * tilt * len);
        }
      }
      s += cs;
    }
    ctx.save(); ctx.lineCap = 'round';
    for (const key in bands) {
      const b = bands[key], [col, al] = o.colors[b.ci];
      ctx.strokeStyle = col; ctx.globalAlpha = al * b.fa; ctx.lineWidth = b.w; ctx.beginPath();
      const sg = b.segs; for (let i = 0; i < sg.length; i += 4) { ctx.moveTo(sg[i], sg[i + 1]); ctx.lineTo(sg[i + 2], sg[i + 3]); }
      ctx.stroke();
    }
    ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ---- v2 night life: a farmhouse (silhouette with warm windows, porch light, chimney smoke), fireflies */
(function (root) {
  const K = root.K;
  // (x, y) = ground centre, h = wall height in px. o: { t, lit (0..1 windows), color, roof, rim, seed, smoke }
  K.terrain.house = function (ctx, x, y, h, o = {}) {
    const w = h * 1.9, rh = h * 0.75, t = o.t || 0, col = o.color || '#151b38', roof = o.roof || '#0e1330', win = o.win || '#ffc46a';
    // glow pool on the ground in front
    if (o.lit) { K.light.glow(ctx, x, y + h * 0.15, h * 3.2, '#ffb060', 0.22 * o.lit, 'screen'); }
    // barn-ish side wing
    ctx.fillStyle = K.mix(col, '#000000', 0.15); ctx.fillRect(x + w * 0.42, y - h * 0.7, w * 0.5, h * 0.7);
    ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x + w * 0.38, y - h * 0.68); ctx.lineTo(x + w * 0.66, y - h * 1.05); ctx.lineTo(x + w * 0.96, y - h * 0.68); ctx.fill();
    // main house
    ctx.fillStyle = col; ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x - w / 2 - h * 0.12, y - h); ctx.lineTo(x, y - h - rh); ctx.lineTo(x + w / 2 + h * 0.12, y - h); ctx.closePath(); ctx.fill();
    if (o.rim) { ctx.strokeStyle = K.rgba(o.rim, 0.55); ctx.lineWidth = Math.max(1, h * 0.04); ctx.beginPath(); ctx.moveTo(x - w / 2 - h * 0.12, y - h); ctx.lineTo(x, y - h - rh); ctx.stroke(); }
    // chimney
    const cx = x + w * 0.22, cy = y - h - rh * 0.55;
    ctx.fillStyle = roof; ctx.fillRect(cx - h * 0.09, cy - h * 0.35, h * 0.18, h * 0.5);
    // windows (warm), one flickers like a TV
    const ws = [[-0.3, -0.55], [0.0, -0.55], [0.3, -0.55], [-0.3, 0.0]];
    for (let i = 0; i < ws.length; i++) {
      const [u, v] = ws[i], wx = x + u * w, wy = y - h * 0.62 - v * 0 + (v ? 0 : 0), ww = h * 0.22, wh = h * 0.26;
      const on = o.lit * (i === 2 ? 0.75 + 0.25 * Math.sin(t * 13) * Math.sin(t * 5.3) : 1) * (i === 3 ? 0 : 1);
      if (i === 3) { // the door with a porch lamp
        ctx.fillStyle = K.mix(col, win, 0.55 * o.lit); ctx.fillRect(x - w * 0.12, y - h * 0.5, h * 0.24, h * 0.5);
        K.light.glow(ctx, x + w * 0.05, y - h * 0.62, h * 0.9, '#ffcf80', 0.5 * o.lit, 'screen');
        ctx.fillStyle = '#fff1c8'; K.circle(ctx, x + w * 0.05, y - h * 0.62, Math.max(1, h * 0.05)); ctx.fill();
        continue;
      }
      ctx.fillStyle = K.mix(col, win, on); ctx.fillRect(wx - ww / 2, wy - wh / 2, ww, wh);
      ctx.fillStyle = K.rgba(col, 0.9); ctx.fillRect(wx - Math.max(0.5, h * 0.015), wy - wh / 2, Math.max(1, h * 0.03), wh);
      K.light.glow(ctx, wx, wy, h * 0.7, '#ffb050', 0.35 * on, 'screen');
    }
    // smoke: soft puffs rising and drifting (moonlit)
    if (o.smoke !== false) {
      for (let i = 0; i < 7; i++) {
        const ph = ((t * 0.18 + i / 7) % 1), sx = cx + ph * h * 1.6 + Math.sin(ph * 6 + i) * h * 0.12, sy = cy - h * 0.4 - ph * h * 2.4, r = h * (0.12 + ph * 0.34);
        ctx.fillStyle = K.rgba(o.smokeColor || '#6f7cb0', 0.32 * (1 - ph)); K.circle(ctx, sx, sy, r); ctx.fill();
      }
    }
  };
  // fireflies: blinking yellow-green points with glow, slow wandering; region in screen px
  K.terrain.fireflies = function (ctx, t, o = {}) {
    const r = K.rng(o.seed || 77), n = o.n || 30;
    for (let i = 0; i < n; i++) {
      const bx = o.x0 + r() * (o.x1 - o.x0), by = o.y0 + r() * (o.y1 - o.y0), ph = r() * 50, sp = 0.4 + r() * 0.6;
      const x = bx + Math.sin(t * 0.6 * sp + ph) * 30 + Math.sin(t * 1.7 * sp + ph * 2) * 8, y = by + Math.cos(t * 0.5 * sp + ph) * 18;
      const blink = Math.pow(Math.max(0, Math.sin(t * (1.1 + sp) + ph)), 4);
      if (blink < 0.02) continue;
      const s = (o.size || 1) * (0.7 + r() * 0.6);
      K.light.glow(ctx, x, y, 16 * s, '#d8ff7a', 0.55 * blink, 'screen');
      ctx.fillStyle = K.rgba('#f4ffc0', blink); K.circle(ctx, x, y, 1.6 * s); ctx.fill();
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
