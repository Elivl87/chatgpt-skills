/* Diez Mil Puntos art kit · sky: big gradient skies, the sun with banded halo rings, flat lit cloud streaks, stars, moon. */
(function (root) {
  const K = root.K;
  K.sky = {};

  // vertical gradient; stops = [[t, '#hex'], ...] with t in 0..1 of [y0, y1]
  K.sky.gradient = function (ctx, stops, y0 = 0, y1 = K.H, x0 = 0, w = K.W) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    for (const [t, c] of stops) g.addColorStop(t, c);
    ctx.fillStyle = g; ctx.fillRect(x0, Math.min(y0, 0), w, Math.max(y1, K.H) - Math.min(y0, 0));
  };

  // radial wash of light (sky brightening around the sun), additive-ish
  K.sky.wash = function (ctx, x, y, r, color, alpha = 0.6, mode = 'screen') {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, K.rgba(color, alpha)); g.addColorStop(0.35, K.rgba(color, alpha * 0.45)); g.addColorStop(1, K.rgba(color, 0));
    ctx.save(); ctx.globalCompositeOperation = mode; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  };

  // the sun: soft glow + flat concentric halo bands (the illustrated "rings" look) + bright core
  K.sky.sun = function (ctx, x, y, r, o = {}) {
    const core = o.core || '#fff6dc', halo = o.halo || '#ffd27a', rings = o.rings ?? 4, glowR = o.glow || r * 9;
    K.sky.wash(ctx, x, y, glowR, halo, o.glowAlpha ?? 0.55);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = rings; i >= 1; i--) {
      const rr = r * (1 + i * (o.ringStep || 0.75));
      ctx.fillStyle = K.rgba(halo, (o.ringAlpha ?? 0.10) * (1 + (rings - i) * 0.25));
      K.circle(ctx, x, y, rr); ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = core; K.circle(ctx, x, y, r); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 1.6);
    g.addColorStop(0, K.rgba('#ffffff', 0.7)); g.addColorStop(1, K.rgba(core, 0));
    ctx.fillStyle = g; K.circle(ctx, x, y, r * 1.6); ctx.fill(); ctx.restore();
  };

  // long flat cloud streaks: capsules, darker body + bright under-lit edge facing the sun (below / toward sunX)
  K.sky.streaks = function (ctx, o) {
    const r = K.rng(o.seed || 5), n = o.n || 8;
    for (let i = 0; i < n; i++) {
      const y = K.lerp(o.y0, o.y1, (i + r()) / n), len = K.lerp(o.lenMin || 220, o.lenMax || 700, r());
      const x = r() * (K.W + len) - len * 0.5, h = K.lerp(o.hMin || 8, o.hMax || 26, r());
      const t = (y - o.y0) / (o.y1 - o.y0);
      const body = K.mix(o.colTop, o.colBottom, t);
      // body made of 2-3 overlapping capsules (wavy, hand-made)
      const parts = 2 + Math.floor(r() * 2);
      for (let k = 0; k < parts; k++) {
        const px = x + k * len * 0.28 + r() * 40, pl = len * (0.5 + r() * 0.4), ph = h * (0.7 + r() * 0.5), py = y - k * h * 0.3;
        ctx.fillStyle = K.rgba(body, o.alpha ?? 0.85);
        K.rrect(ctx, px, py, pl, ph, ph / 2); ctx.fill();
        if (o.lit) {
          ctx.fillStyle = K.rgba(o.lit, (o.litAlpha ?? 0.8) * (1 - t * 0.3));
          K.rrect(ctx, px + ph * 0.6, py + ph * 0.62, pl - ph * 1.2, Math.max(2, ph * 0.3), ph * 0.15); ctx.fill();
        }
      }
    }
  };

  // sunset cloud bank: stacked capsules (wider at the bottom), flat body + thick lit underside facing a low sun
  K.sky.bank = function (ctx, x, y, w, h, o = {}) {
    const r = K.rng(o.seed || 17), rows = o.rows || 3, caps = [];
    for (let k = 0; k < rows; k++) {                       // each row shorter, shifted, slightly thinner: a lumpy bank
      const ww = w * (1 - k * 0.28) * (0.75 + r() * 0.35), hh = h * (1 - k * 0.12) * (0.85 + r() * 0.35);
      const xx = x - w / 2 + (w - ww) * r() + (r() - 0.5) * w * 0.2;
      caps.push([xx, y - k * h * 0.7, ww, hh, k]);
      const nb = 1 + (r() * 2 | 0);
      for (let j = 0; j < nb; j++) { const bw = ww * (0.18 + r() * 0.25); caps.push([xx + r() * (ww - bw), y - k * h * 0.7 - hh * (0.35 + r() * 0.3), bw, hh * (0.9 + r() * 0.4), k + 0.5]); }
    }
    const path = () => { ctx.beginPath(); for (const [cx, cy, cw, ch] of caps) ctx.roundRect(cx, cy - ch, cw, ch, ch / 2); };
    ctx.save();
    path(); ctx.fillStyle = K.rgba(o.color || '#a07fa8', o.alpha ?? 1); ctx.fill();
    path(); ctx.clip();
    if (o.top) { const g = ctx.createLinearGradient(0, y - h * rows, 0, y); g.addColorStop(0, K.rgba(o.top, 0.55)); g.addColorStop(1, K.rgba(o.top, 0)); ctx.fillStyle = g; ctx.fillRect(x - w, y - h * rows * 1.5, w * 2, h * rows * 1.5); }
    if (o.lit) {                                          // only the undersides facing the low sun catch light
      for (const [cx, cy, cw, ch, k] of caps) {
        if (k % 1) continue;
        ctx.fillStyle = K.rgba(o.lit, (o.litAlpha ?? 0.9) * (k === 0 ? 1 : 0.55));
        ctx.beginPath(); ctx.roundRect(cx + ch * 0.3, cy - ch * (o.litH || 0.26), cw - ch * 0.6, ch * (o.litH || 0.26) + 1, ch * 0.13); ctx.fill();
      }
    }
    ctx.restore();
  };

  // puffy cumulus (cauliflower of circles), flat lit top + shade bottom
  K.sky.puff = function (ctx, x, y, w, o = {}) {
    const r = K.rng(o.seed || 9), n = o.n || 7, base = o.color || '#fff4ea', shade = o.shade || '#e7c9c0';
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), cx = x - w / 2 + t * w, rr = w * (0.12 + 0.12 * Math.sin(Math.PI * t) + r() * 0.05);
      pts.push([cx, y - rr * 0.55, rr]);
    }
    ctx.fillStyle = shade; for (const [cx, cy, rr] of pts) { K.circle(ctx, cx, cy, rr); ctx.fill(); }
    K.rrect(ctx, x - w / 2, y - w * 0.12, w, w * 0.12, w * 0.06); ctx.fill();
    ctx.fillStyle = base; for (const [cx, cy, rr] of pts) { K.circle(ctx, cx - rr * 0.08, cy - rr * 0.12, rr * 0.92); ctx.fill(); }
  };

  K.sky.stars = function (ctx, o) {
    const r = K.rng(o.seed || 21), n = o.n || 300;
    for (let i = 0; i < n; i++) {
      const x = r() * K.W, y = Math.pow(r(), 1.4) * (o.y1 || K.H * 0.6), m = r();
      const tw = o.t != null ? 0.65 + 0.35 * Math.sin(o.t * (1 + r() * 3) + i) : 1;
      const a = (0.25 + 0.75 * m * m) * tw * (1 - y / (o.y1 || K.H * 0.6)) ;
      ctx.fillStyle = K.rgba(o.color || '#fff7e0', a);
      K.circle(ctx, x, y, m > 0.97 ? 2.4 : m > 0.8 ? 1.6 : 1.0); ctx.fill();
      if (m > 0.985) { ctx.fillStyle = K.rgba(o.color || '#fff7e0', a * 0.5); ctx.fillRect(x - 7, y - 0.6, 14, 1.2); ctx.fillRect(x - 0.6, y - 7, 1.2, 14); }
    }
  };

  K.sky.moon = function (ctx, x, y, r, o = {}) {
    K.sky.wash(ctx, x, y, r * 10, o.glow || '#9fb4ff', 0.22);
    ctx.fillStyle = o.color || '#f6efd8'; K.circle(ctx, x, y, r); ctx.fill();
    ctx.save(); K.circle(ctx, x, y, r); ctx.clip();
    ctx.fillStyle = K.rgba('#c9c2b0', 0.55);
    [[-0.3, -0.2, 0.22], [0.25, 0.15, 0.16], [-0.05, 0.4, 0.12], [0.35, -0.35, 0.09]].forEach(([a, b, c]) => { K.circle(ctx, x + a * r, y + b * r, c * r); ctx.fill(); });
    ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
