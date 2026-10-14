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
