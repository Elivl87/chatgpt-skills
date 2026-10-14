/* Diez Mil Puntos art kit · light: god-rays, glows, haze bands, colour grading, vignette, bloom.
   Light is always *added* in flat soft shapes (screen / lighter), never as 3D shading on characters. */
(function (root) {
  const K = root.K;
  K.light = {};

  // fan of soft light shafts from (x, y). angle = centre direction (rad, 0 = right, PI/2 = down)
  K.light.rays = function (ctx, x, y, o = {}) {
    const r = K.rng(o.seed || 13), n = o.n || 9, spread = o.spread || 1.2, len = o.len || 1600, t = o.t || 0;
    ctx.save(); ctx.globalCompositeOperation = o.mode || 'screen';
    for (let i = 0; i < n; i++) {
      const base = (o.angle ?? Math.PI / 2) + (i / (n - 1) - 0.5) * spread + (r() - 0.5) * spread / n;
      const a = base + Math.sin(t * 0.25 + i * 1.7) * 0.012;
      const wdt = (o.width || 0.05) * (0.4 + r() * 1.2) * (1 + 0.15 * Math.sin(t * 0.5 + i));
      const alpha = (o.alpha || 0.12) * (0.35 + r() * 0.9) * (0.75 + 0.25 * Math.sin(t * 0.6 + i * 2.3));
      const L = len * (0.6 + r() * 0.5);
      const g = ctx.createLinearGradient(x, y, x + Math.cos(a) * L, y + Math.sin(a) * L);
      g.addColorStop(0, K.rgba(o.color || '#ffe2a0', alpha));
      g.addColorStop(0.5, K.rgba(o.color || '#ffe2a0', alpha * 0.5));
      g.addColorStop(1, K.rgba(o.color || '#ffe2a0', 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a - wdt) * L, y + Math.sin(a - wdt) * L);
      ctx.lineTo(x + Math.cos(a + wdt) * L, y + Math.sin(a + wdt) * L); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };

  // parallel shafts (sun high, through canopy / water): slanted bands
  K.light.shafts = function (ctx, o = {}) {
    const r = K.rng(o.seed || 31), n = o.n || 7, t = o.t || 0, ang = o.angle || 0.25;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < n; i++) {
      const x = r() * K.W * 1.3 - K.W * 0.15 + Math.sin(t * 0.3 + i) * 12, w = 30 + r() * 120;
      const a = (o.alpha || 0.1) * (0.4 + r() * 0.8) * (0.8 + 0.2 * Math.sin(t * 0.7 + i * 2));
      const g = ctx.createLinearGradient(0, o.y0 || 0, 0, o.y1 || K.H);
      g.addColorStop(0, K.rgba(o.color || '#fff0c0', a)); g.addColorStop(1, K.rgba(o.color || '#fff0c0', 0));
      ctx.fillStyle = g; ctx.beginPath();
      const dx = Math.tan(ang) * ((o.y1 || K.H) - (o.y0 || 0));
      ctx.moveTo(x, o.y0 || 0); ctx.lineTo(x + w, o.y0 || 0); ctx.lineTo(x + w + dx, o.y1 || K.H); ctx.lineTo(x + dx, o.y1 || K.H); ctx.fill();
    }
    ctx.restore();
  };

  K.light.glow = function (ctx, x, y, r, color, alpha = 0.6, mode = 'lighter') {
    if (r <= 0.5 || alpha <= 0.002) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, K.rgba(color, alpha)); g.addColorStop(0.25, K.rgba(color, alpha * 0.45));
    g.addColorStop(0.6, K.rgba(color, alpha * 0.12)); g.addColorStop(1, K.rgba(color, 0));
    ctx.save(); ctx.globalCompositeOperation = mode; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  };

  // horizontal haze band peaking at yPeak (atmospheric perspective: light air near the horizon)
  K.light.haze = function (ctx, y0, yPeak, y1, color, alpha, mode = 'source-over', w = null) {
    const g = ctx.createLinearGradient(0, y0, 0, y1), p = K.clamp((yPeak - y0) / (y1 - y0));
    g.addColorStop(0, K.rgba(color, 0)); g.addColorStop(p, K.rgba(color, alpha)); g.addColorStop(1, K.rgba(color, 0));
    ctx.save(); ctx.globalCompositeOperation = mode; ctx.fillStyle = g; ctx.fillRect(0, y0, w || Math.max(K.W, ctx.canvas.width), y1 - y0); ctx.restore();
  };

  // grading: a colour wash with a blend mode over the whole frame
  K.light.grade = function (ctx, color, alpha, mode = 'soft-light') {
    ctx.save(); ctx.globalCompositeOperation = mode; ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillRect(0, 0, K.W, K.H); ctx.restore();
  };

  K.light.vignette = function (ctx, strength = 0.45, color = '#1a1020', inner = 0.45) {
    const g = ctx.createRadialGradient(K.W / 2, K.H / 2, K.H * inner, K.W / 2, K.H / 2, K.W * 0.72);
    g.addColorStop(0, K.rgba(color, 0)); g.addColorStop(1, K.rgba(color, strength));
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H); ctx.restore();
  };

  // cheap bloom: blurred copy of bright areas screened back on (quarter resolution)
  let bl = null;
  K.light.bloom = function (ctx, amount = 0.35, radius = 18) {
    const w = K.W / 4 | 0, h = K.H / 4 | 0;
    if (!bl) bl = [K.canvas(w, h), K.canvas(w, h)];
    const [a, b] = bl;
    a.ctx.globalCompositeOperation = 'copy'; a.ctx.filter = 'none'; a.ctx.drawImage(ctx.canvas, 0, 0, w, h);
    // keep the highlights: x^3 per channel (multiply the image by itself twice)
    a.ctx.globalCompositeOperation = 'multiply'; a.ctx.drawImage(a.c, 0, 0); a.ctx.drawImage(a.c, 0, 0);
    a.ctx.globalCompositeOperation = 'source-over';
    b.ctx.globalCompositeOperation = 'copy'; b.ctx.filter = `blur(${radius / 4}px)`; b.ctx.drawImage(a.c, 0, 0); b.ctx.filter = 'none';
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amount; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(b.c, 0, 0, K.W, K.H); ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ---- v2: heat shimmer (rows of a band slid sideways by a travelling sine; strongest at the bottom of the band) and
   a brand-type speed label ("ACELERADO ×2"). */
(function (root) {
  const K = root.K;
  let sh = null;
  K.light.shimmer = function (ctx, x, y, w, h, t, o = {}) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    if (!sh || sh.w < w || sh.h < h) sh = K.canvas(Math.max(w, 1200), Math.max(h, 120));
    sh.ctx.globalCompositeOperation = 'copy'; sh.ctx.drawImage(ctx.canvas, x, y, w, h, 0, 0, w, h);
    const amp = o.amp || 2.2, rows = o.rows || 2;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let r = 0; r < h; r += rows) {
      const k = K.smooth(0, 1, r / h) * (1 - K.smooth(0.85, 1, r / h) * 0.5);
      const dx = Math.sin(r * 0.55 - t * 7.5) * amp * k + Math.sin(r * 0.21 + t * 3.1) * amp * 0.5 * k;
      ctx.drawImage(sh.c, 0, r, w, rows, x + dx, y + r, w, rows);
    }
    ctx.restore();
  };
  // speed label in the brand type: Martian Mono 700 on a translucent ink pill, top-left safe area
  K.light.speedLabel = function (ctx, text = 'ACELERADO ×2', o = {}) {
    const x = o.x ?? 96, y = o.y ?? 84, size = o.size || 30;
    ctx.save(); ctx.font = `700 ${size}px "Martian Mono"`; ctx.textBaseline = 'middle';
    const w = ctx.measureText(text).width, padX = size * 0.62, hh = size * 1.7;
    ctx.globalAlpha = o.alpha ?? 1;
    ctx.fillStyle = K.rgba('#1C2433', 0.62); K.rrect(ctx, x, y - hh / 2, w + padX * 2 + size * 0.9, hh, hh / 2); ctx.fill();
    ctx.fillStyle = '#F3ECDD'; K.circle(ctx, x + padX + size * 0.22, y, size * 0.2); ctx.fill();   // round dot = brand tittle
    ctx.fillText(text, x + padX + size * 0.75, y + size * 0.04);
    ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
