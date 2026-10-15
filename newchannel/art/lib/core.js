/* Diez Mil Puntos art kit · core: namespace, seeded randomness, noise, easing, colour, offscreen canvases.
   Everything in the kit is deterministic: no Math.random, no wall clock. Same inputs -> same pixels. */
(function (root) {
  const K = root.K = root.K || {};
  { const q = typeof location !== 'undefined' && location.search ? new URLSearchParams(location.search) : null;   // sheets may ask for a bigger canvas (?W=..&H=..)
    K.W = Number(q && q.get('W')) || 1920; K.H = Number(q && q.get('H')) || 1080; }

  // ---------------------------------------------------------------- randomness
  K.rng = function (seed) {               // mulberry32 -> () => [0,1)
    let a = (seed >>> 0) || 1;
    const f = function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.range = (lo, hi) => lo + (hi - lo) * f();
    f.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * f());
    f.pick = arr => arr[Math.floor(f() * arr.length)];
    f.sign = () => (f() < 0.5 ? -1 : 1);
    return f;
  };
  K.hash = function (x, y, s) {           // integer lattice hash -> [0,1)
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2147483647)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  K.vnoise = function (x, y, s = 0) {     // smooth value noise in [0,1)
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = K.hash(xi, yi, s), b = K.hash(xi + 1, yi, s), c = K.hash(xi, yi + 1, s), d = K.hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  K.fbm = function (x, y, oct = 4, s = 0) {
    let sum = 0, amp = 0.5, f = 1, n = 0;
    for (let i = 0; i < oct; i++) { sum += amp * K.vnoise(x * f, y * f, s + i * 17); n += amp; amp *= 0.5; f *= 2.03; }
    return sum / n;
  };

  // ---------------------------------------------------------------- math / easing
  K.clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  K.lerp = (a, b, t) => a + (b - a) * t;
  K.inv = (a, b, x) => K.clamp((x - a) / (b - a));
  K.smooth = (a, b, x) => { const t = K.inv(a, b, x); return t * t * (3 - 2 * t); };
  K.ease = {
    inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: t => 1 - Math.pow(1 - t, 3),
    in: t => t * t * t,
    sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
    outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: t => (t === 0 || t === 1) ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
  };
  K.TAU = Math.PI * 2;

  // ---------------------------------------------------------------- colour
  const cache = {};
  K.rgbOf = function (c) {
    if (Array.isArray(c)) return c;
    if (cache[c]) return cache[c];
    let h = c.replace('#', '');
    if (h.length === 3) h = h.split('').map(x => x + x).join('');
    const v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    cache[c] = v; return v;
  };
  const hx = v => Math.round(K.clamp(v, 0, 255)).toString(16).padStart(2, '0');
  K.hex = rgb => '#' + hx(rgb[0]) + hx(rgb[1]) + hx(rgb[2]);
  K.mix = (a, b, t) => { const A = K.rgbOf(a), B = K.rgbOf(b); return K.hex([K.lerp(A[0], B[0], t), K.lerp(A[1], B[1], t), K.lerp(A[2], B[2], t)]); };
  K.rgba = (c, a) => { const A = K.rgbOf(c); return `rgba(${A[0] | 0},${A[1] | 0},${A[2] | 0},${a})`; };
  K.shade = (c, k) => (k >= 0 ? K.mix(c, '#ffffff', k) : K.mix(c, '#000000', -k));
  // multiply-style tint (light falling on a surface)
  K.tint = (c, light, k = 1) => { const A = K.rgbOf(c), L = K.rgbOf(light); return K.mix(c, K.hex([A[0] * L[0] / 255, A[1] * L[1] / 255, A[2] * L[2] / 255]), k); };

  // ---------------------------------------------------------------- canvases
  K.canvas = function (w, h) {
    let c;
    if (typeof OffscreenCanvas !== 'undefined' && !root.document) c = new OffscreenCanvas(w, h);
    else { c = root.document.createElement('canvas'); c.width = w; c.height = h; }
    const ctx = c.getContext('2d');
    return { c, ctx, w, h };
  };

  // ---------------------------------------------------------------- shape helpers
  K.circle = (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y, Math.max(0.01, r), 0, K.TAU); };
  K.ellipse = (ctx, x, y, rx, ry, rot = 0) => { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, K.TAU); };
  K.rrect = function (ctx, x, y, w, h, r) {
    const rr = typeof r === 'number' ? [r, r, r, r] : r;  // tl tr br bl
    ctx.beginPath();
    ctx.moveTo(x + rr[0], y);
    ctx.lineTo(x + w - rr[1], y); ctx.quadraticCurveTo(x + w, y, x + w, y + rr[1]);
    ctx.lineTo(x + w, y + h - rr[2]); ctx.quadraticCurveTo(x + w, y + h, x + w - rr[2], y + h);
    ctx.lineTo(x + rr[3], y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - rr[3]);
    ctx.lineTo(x, y + rr[0]); ctx.quadraticCurveTo(x, y, x + rr[0], y);
    ctx.closePath();
  };
  // smooth closed blob through points (Catmull-Rom -> Bezier)
  K.blob = function (ctx, pts, closed = true) {
    const n = pts.length; ctx.beginPath();
    const P = i => pts[(i + n) % n];
    ctx.moveTo(pts[0][0], pts[0][1]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = closed ? P(i - 1) : pts[Math.max(0, i - 1)], p1 = P(i), p2 = closed ? P(i + 1) : pts[Math.min(n - 1, i + 1)],
        p3 = closed ? P(i + 2) : pts[Math.min(n - 1, i + 2)];
      ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    if (closed) ctx.closePath();
  };

  if (typeof module !== 'undefined') module.exports = K;
})(typeof window !== 'undefined' ? window : globalThis);
