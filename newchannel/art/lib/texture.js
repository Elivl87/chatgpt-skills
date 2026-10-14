/* Diez Mil Puntos art kit · texture: film grain (lives every 2 frames, never boils), painterly mottle and brush streaks
   applied *inside* shapes only (alpha-masked), so flat vector fills read as gouache on paper. */
(function (root) {
  const K = root.K;
  K.tex = {};

  // monochrome noise tile; mid-grey = no change under 'overlay' / 'soft-light'
  function noiseTile(size, seed, amp, blur) {
    const t = K.canvas(size, size), img = t.ctx.createImageData(size, size), d = img.data, r = K.rng(seed);
    for (let i = 0; i < size * size; i++) {
      const v = 128 + (r() + r() + r() - 1.5) * amp;
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255;
    }
    t.ctx.putImageData(img, 0, 0);
    if (blur) { const b = K.canvas(size, size); b.ctx.filter = `blur(${blur}px)`; b.ctx.drawImage(t.c, 0, 0); return b; }
    return t;
  }

  let grain = null;
  K.tex.grain = function (ctx, frame, o = {}) {
    const amt = o.amount ?? 0.16, w = o.w || K.W, h = o.h || K.H;
    if (!grain) grain = [0, 1, 2, 3].map(i => noiseTile(512, 911 + i, 150, 0));
    const k = Math.floor(frame / 2), r = K.rng(4049 + k * 31);
    const tile = grain[k % 4];
    const ox = Math.floor(r() * 512), oy = Math.floor(r() * 512);
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = amt;
    for (let y = -oy; y < h; y += 512) for (let x = -ox; x < w; x += 512) ctx.drawImage(tile.c, x, y);
    ctx.restore();
  };

  // large painterly mottle: anisotropic fbm (horizontal brush streaks) -> grey canvas
  const mottles = {};
  K.tex.mottleCanvas = function (o = {}) {
    const key = JSON.stringify(o);
    if (mottles[key]) return mottles[key];
    const w = o.w || 960, h = o.h || 540, sx = o.sx || 0.006, sy = o.sy || 0.03, seed = o.seed || 3, amp = o.amp || 60;
    const t = K.canvas(w, h), img = t.ctx.createImageData(w, h), d = img.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = K.fbm(x * sx, y * sy, 4, seed) - 0.5, n2 = K.vnoise(x * 0.09, y * 0.09, seed + 5) - 0.5;
      const v = 128 + n * amp * 2 + n2 * amp * 0.35;
      const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    t.ctx.putImageData(img, 0, 0);
    mottles[key] = t; return t;
  };

  // apply texture inside the non-transparent pixels of a layer canvas
  K.tex.paint = function (layer, o = {}) {
    const m = K.tex.mottleCanvas(o.mottle || {});
    const tmp = K.canvas(layer.w, layer.h);
    tmp.ctx.drawImage(m.c, 0, 0, layer.w, layer.h);
    tmp.ctx.globalCompositeOperation = 'destination-in';
    tmp.ctx.drawImage(layer.c, 0, 0);
    layer.ctx.save();
    layer.ctx.globalCompositeOperation = o.mode || 'soft-light';
    layer.ctx.globalAlpha = o.amount ?? 0.55;
    layer.ctx.drawImage(tmp.c, 0, 0);
    layer.ctx.restore();
    return layer;
  };

  // fill current path with a texture pattern (for dynamic shapes: characters, cars)
  let pat = null;
  K.tex.fillPath = function (ctx, amount = 0.25, scale = 1) {
    if (!pat) pat = noiseTile(256, 77, 70, 1.2);
    const p = ctx.createPattern(pat.c, 'repeat');
    if (scale !== 1 && p.setTransform) p.setTransform(new DOMMatrix().scale(scale));
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = amount; ctx.fillStyle = p; ctx.fill(); ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
