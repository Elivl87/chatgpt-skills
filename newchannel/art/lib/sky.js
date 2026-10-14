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
        ctx.fillStyle = K.rgba(o.lit, (o.litAlpha ?? 0.65) * (k === 0 ? 1 : 0.5));
        ctx.beginPath(); ctx.roundRect(cx + ch * 0.3, cy - ch * (o.litH || 0.2), cw - ch * 0.6, ch * (o.litH || 0.2) + 1, ch * 0.13); ctx.fill();
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

/* ---- v2 painterly clouds: soft lobed cumulus built lobe by lobe. Each lobe is a flat disc split into shade / body /
   lit cap / sun rim (offsets toward the light), drawn back tier first so every front lobe's shaded belly cuts across
   the lit top of the lobe behind it (the cauliflower read). Flat bottom with a shaded underside, brush mottle inside.
   Rendered once into a sprite (K.sky.cloudSprite) and drifted per frame (K.sky.drawClouds). */
(function (root) {
  const K = root.K;
  // o: { seed, color, shade, lit, rim, ang (rad, direction the light comes FROM, screen), rimW, under (underside colour),
  //      lobes, flat (0..1 flatness of the base), puff (vertical scale) }
  K.sky.cloudSprite = function (w, h, o = {}) {
    const key = 'c' + JSON.stringify([w, h, o]);
    K.sky._cs = K.sky._cs || {};
    if (K.sky._cs[key]) return K.sky._cs[key];
    const r = K.rng(o.seed || 1), pad = Math.ceil(h * 0.5 + 8), S = K.canvas(Math.ceil(w + pad * 2), Math.ceil(h * 1.25 + pad * 2)), c = S.ctx;
    const bx = S.w / 2, by = S.h - pad;                             // base centre (flat bottom)
    const ang = o.ang ?? -Math.PI / 2, lx = Math.cos(ang), ly = Math.sin(ang);
    const shade = o.shade || '#9a86a8', body = o.color || '#d8c3cf', lit = o.lit || '#fbe6d6', rim = o.rim || '#fff4e0';
    const lobes = [];
    const n = o.lobes || Math.max(4, Math.round(w / h * 2.2));
    // back tier (tall, few) then front tier (wide, along the base)
    const nb = Math.max(2, Math.round(n * 0.45));
    for (let i = 0; i < nb; i++) {
      const u = (i + 0.5 + (r() - 0.5) * 0.6) / nb, bell = Math.sin(Math.PI * K.clamp(u * 0.8 + 0.1));
      const R = h * (0.30 + 0.22 * bell + r() * 0.08);
      lobes.push({ x: bx - w * 0.36 + u * w * 0.72, y: by - h * 0.42 - bell * h * 0.22 * (o.puff || 1), R, tier: 0 });
    }
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5 + (r() - 0.5) * 0.5) / n, bell = Math.sin(Math.PI * u);
      const R = h * (0.17 + 0.2 * bell + r() * 0.07);
      lobes.push({ x: bx - w * 0.42 + u * w * 0.84, y: by - R * (0.55 + (1 - (o.flat ?? 0.6)) * 0.4) - r() * h * 0.05, R, tier: 1 });
    }
    const sil = (dx = 0, dy = 0, sc = 1, only = null) => { c.beginPath(); for (const L of lobes) { if (only && !only(L)) continue; c.moveTo(L.x + dx + L.R * sc, L.y + dy); c.arc(L.x + dx, L.y + dy, L.R * sc, 0, K.TAU); } };
    const d = h * 0.16;
    c.save(); c.beginPath(); c.rect(0, 0, S.w, by); c.clip();
    sil(); c.fillStyle = shade; c.fill();                                        // the whole mass in shade
    c.globalCompositeOperation = 'source-atop';
    sil(lx * d, ly * d); c.fillStyle = body; c.fill();                           // body: all but a contour band away from the light
    sil(lx * d * (o.litOff ?? 2.1), ly * d * (o.litOff ?? 2.1), o.litScale ?? 0.92, L => L.tier === 0 || L.R > h * 0.3);    // lit caps on the big lobes only
    c.fillStyle = K.rgba(lit, 0.9); c.fill();
    // a few lobe contours inside the mass: short shade arcs on the side of a front lobe away from the light
    const fr = lobes.filter(L => L.tier === 1);
    c.strokeStyle = K.rgba(shade, 0.55); c.lineCap = 'round'; c.lineWidth = Math.max(1.2, h * 0.022);
    if (o.contours) for (let k = 1; k < fr.length - 1; k += 2) { const L = fr[k], a0 = ang + Math.PI;
      c.beginPath(); c.arc(L.x + lx * L.R * 0.1, L.y + ly * L.R * 0.1, L.R * 0.96, a0 - 1.25, a0 - 0.35); c.stroke(); }
    // shaded underside, darker toward the flat base
    if (o.under) { const g = c.createLinearGradient(0, by - h * 0.3, 0, by);
      g.addColorStop(0, K.rgba(o.under, 0)); g.addColorStop(0.6, K.rgba(o.under, 0.45)); g.addColorStop(1, K.rgba(o.under, 0.75));
      c.fillStyle = g; c.fillRect(0, by - h * 0.3, S.w, h * 0.3); }
    if (o.underLit) {                                            // low sun under the cloud: warm light soaking the belly
      const g2 = c.createLinearGradient(0, by - h * 0.12, 0, by); g2.addColorStop(0, K.rgba(o.underLit, 0)); g2.addColorStop(1, K.rgba(o.underLit, 0.7));
      c.fillStyle = g2; c.fillRect(0, by - h * 0.12, S.w, h * 0.12);
    }
    c.restore();
    if (rim) {                                                    // sun-catching rim: silhouette minus itself pushed away from the light
      const M = K.canvas(S.w, S.h), m = M.ctx, rw = Math.max(1.6, h * (o.rimW ?? 0.035));
      m.beginPath(); m.rect(0, 0, S.w, by); m.clip();
      m.fillStyle = rim; m.beginPath(); for (const L of lobes) { m.moveTo(L.x + L.R, L.y); m.arc(L.x, L.y, L.R, 0, K.TAU); } m.fill();
      m.globalCompositeOperation = 'destination-out';
      m.beginPath(); for (const L of lobes) { m.moveTo(L.x - lx * rw + L.R, L.y - ly * rw); m.arc(L.x - lx * rw, L.y - ly * rw, L.R, 0, K.TAU); } m.fill();
      c.globalAlpha = o.rimAlpha ?? 0.95; c.drawImage(M.c, 0, 0); c.globalAlpha = 1;
    }
    // brush mottle inside + a few dry-brush streaks following the lobes (painterly, not stripes)
    K.tex.paint(S, { amount: 0.4, mottle: { w: 600, h: 300, sx: 0.012, sy: 0.03, seed: (o.seed || 1) + 5, amp: 34 } });
    S.bx = bx; S.by = by;
    K.sky._cs[key] = S; return S;
  };

  // a list of clouds [{x, y, w, h, o, v (px/s drift), par}] drawn with drift; x wraps over [-600, W+600]
  K.sky.drawClouds = function (ctx, list, t, o = {}) {
    const span = K.W + 1400;
    for (const cl of list) {
      const S = K.sky.cloudSprite(cl.w, cl.h, cl.o);
      let x = cl.x + (cl.v || 0) * t + (o.dx || 0) * (cl.par ?? 1);
      x = ((x + 700) % span + span) % span - 700;
      ctx.globalAlpha = cl.a ?? 1;
      ctx.drawImage(S.c, x - S.bx, cl.y + (o.dy || 0) - S.by);
      ctx.globalAlpha = 1;
    }
  };

  // light direction from a cloud at (x, y) toward a sun at (sx, sy): the angle the light comes FROM
  K.sky.angTo = (x, y, sx, sy) => Math.atan2(sy - y, sx - x);
})(typeof window !== 'undefined' ? window : globalThis);
