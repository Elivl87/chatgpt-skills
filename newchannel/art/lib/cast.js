/* Diez Mil Puntos art kit · cast: the channel's character engine (2026-10-15, v2 for the Eli + Mila alternatives),
   drawn 100 % in Canvas 2D in the approved v2 style.

   K.cast.draw(ctx, id, x, y, u, o) -> info { head:[x,y,r], hands:{lead,trail}, top }
     id   a spec id (see cast_specs.js / cast_alts.js)
     x,y  ground point between the feet (o.seated: the seat point under the hips)
     u    px per height unit (1 unit = a reference adult; each character has its own height in units, SPECS[id].h)
     o    { view: 'front' | 'q' (3/4) | 'side', dir: 1 faces screen-right / -1 left, pose, expr, t, look:[x,y],
            blink, talk (0..1), seated, light: K.cast.LIGHT.golden | {...}, fog:[colour,k], extras:[..],
            headTurn (-1.6..1 extra head yaw; negative = look back over the shoulder), tilt (head roll),
            lean (upper-body lean, + = forward), shadow (contact alpha), blend: { pose, k } (pose cross-fade),
            drag (0..1 wind on hair / loose cloth), hatHit (0..1 impulse squashes the hat) }
     poses: stand, point, shrug, drive, driveFist, crossed, fist, wave, cheer, hips, palm, think, lap, lapPoint
     exprs: neutral, happy, laugh, surprised, annoyed, grumpy, furious, worried, thinking, awe, smug (= sly), sheepish,
            determined, curious, talk
   Construction: flat fills with the warm ink line, drawn in three layers (far limbs / body / near limbs). Each layer
   gets the scene light the kit way: a flat shade crescent on the side away from the key and a rim on the side toward
   it. v2: the rim now sits ON the inner edge of the ink line (no gap), so it reads as one lit edge, never as a second
   line. Arms are 2-bone IK drawn as one soft curve (elbows round, never kinked); idle arms hang with a slight bend and
   sway. Drawing under a scaled transform is re-rasterised at the true pixel size (crisp in push-ins), and the layer
   buffers are cropped to the visible canvas. Deterministic: time only from o.t. */
(function (root) {
  const K = root.K;
  const C = K.cast = {};
  const INK = '#2a1a1e';
  C.INK = INK;
  C.LIGHT = {
    golden: { ang: -0.55, rim: '#ffd88f', rimA: 0.9, rimW: 0.011, shade: '#3c2a52', shadeA: 0.30, shadeW: 0.05, tex: 0.22 },
    board: { ang: -0.75, rim: '#fff1d2', rimA: 0.8, rimW: 0.009, shade: '#4a3560', shadeA: 0.22, shadeW: 0.045, tex: 0.2 },
  };
  const TURN = { front: 0, q: 0.55, side: 1 };

  // ------------------------------------------------------------------ buffers
  const pool = {};
  function buf(key, w, h) {
    let b = pool[key];
    if (!b || b.w !== w || b.h !== h) b = pool[key] = K.canvas(w, h);
    const c = b.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.filter = 'none';
    c.clearRect(0, 0, w, h); return b;
  }
  let noise = null;
  function noiseTile() {
    if (noise) return noise;
    const s = 256, t = K.canvas(s, s), img = t.ctx.createImageData(s, s), d = img.data, r = K.rng(4242);
    for (let i = 0; i < s * s; i++) { const v = 128 + (r() + r() + r() - 1.5) * 80; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
    t.ctx.putImageData(img, 0, 0); const b = K.canvas(s, s); b.ctx.filter = 'blur(1.1px)'; b.ctx.drawImage(t.c, 0, 0); noise = b; return b;
  }

  // light one layer in place: shade crescent (far side), rim (light side, hugging the ink), texture
  function lightLayer(L, light, u, lw) {
    const w = L.w, h = L.h, dx = Math.cos(light.ang), dy = Math.sin(light.ang), T = buf('tmp', w, h), t = T.ctx;
    if (light.shadeA > 0) {
      const sh = light.shadeW * u;
      t.drawImage(L.c, 0, 0); t.globalCompositeOperation = 'source-in'; t.fillStyle = light.shade; t.fillRect(0, 0, w, h);
      t.globalCompositeOperation = 'destination-out'; t.drawImage(L.c, dx * sh, dy * sh);
      L.ctx.globalCompositeOperation = 'source-atop'; L.ctx.globalAlpha = light.shadeA; L.ctx.drawImage(T.c, 0, 0);
      L.ctx.globalAlpha = 1; L.ctx.globalCompositeOperation = 'source-over';
    }
    if (light.rimA > 0) {
      const off = (light.rimInset ?? lw * 0.95) * u;            // = the ink width: the rim starts where the ink ends
      const rw = Math.min(light.rimMax ?? 9, Math.max(1.2, light.rimW * u));
      t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, w, h);
      t.drawImage(L.c, -dx * off, -dy * off); t.globalCompositeOperation = 'source-in'; t.fillStyle = light.rim; t.fillRect(0, 0, w, h);
      t.globalCompositeOperation = 'destination-out'; t.drawImage(L.c, -dx * (rw + off), -dy * (rw + off));
      t.globalCompositeOperation = 'destination-in'; t.drawImage(L.c, 0, 0);
      L.ctx.globalCompositeOperation = 'source-atop'; L.ctx.globalAlpha = light.rimA; L.ctx.drawImage(T.c, 0, 0);
      L.ctx.globalAlpha = 1; L.ctx.globalCompositeOperation = 'source-over';
    }
    if (light.tex > 0) {
      t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, w, h);
      const p = t.createPattern(noiseTile().c, 'repeat'); if (p.setTransform) p.setTransform(new DOMMatrix().scale(Math.max(0.6, u / 420)));
      t.fillStyle = p; t.fillRect(0, 0, w, h); t.globalCompositeOperation = 'destination-in'; t.drawImage(L.c, 0, 0);
      L.ctx.globalCompositeOperation = 'soft-light'; L.ctx.globalAlpha = light.tex; L.ctx.drawImage(T.c, 0, 0);
      L.ctx.globalAlpha = 1; L.ctx.globalCompositeOperation = 'source-over';
    }
  }

  // ------------------------------------------------------------------ drawing helpers (unit space, y down)
  function path(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); }
  function union(c, shapes, fill, lw) {
    c.lineJoin = 'round'; c.lineCap = 'round';
    for (const s of shapes) { s(); c.strokeStyle = INK; c.lineWidth = lw * 2; c.stroke(); }
    for (const s of shapes) { s(); c.fillStyle = fill; c.fill(); }
  }
  function shape(c, s, fill, lw) { union(c, [s], fill, lw); }
  function noodle(c, pts, w, color, lw) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    path(c, pts); c.strokeStyle = INK; c.lineWidth = w + 2 * lw; c.stroke();
    path(c, pts); c.strokeStyle = color; c.lineWidth = w; c.stroke();
  }
  function partial(pts, f, from = 0) { // the polyline between fractions [from, f] of its length
    let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
    const at = (x) => { let rem = L * x; for (let i = 1; i < pts.length; i++) { if (rem <= seg[i - 1] || i === pts.length - 1) { const k = seg[i - 1] ? Math.min(1, rem / seg[i - 1]) : 0; return [i, [K.lerp(pts[i - 1][0], pts[i][0], k), K.lerp(pts[i - 1][1], pts[i][1], k)]]; } rem -= seg[i - 1]; } return [pts.length - 1, pts[pts.length - 1]]; };
    const [i0, p0] = at(from), [i1, p1] = at(f);
    const out = [p0]; for (let i = i0; i < i1; i++) out.push(pts[i]); out.push(p1); return out;
  }
  // head silhouettes: capsule (rounded rect), circle, egg (narrow top, full jaw), bean (lean top), tile (soft square), pill (tall, round ends)
  function headPath(c, hd) {
    const hw = hd.hw, hh = hd.hh, k = hd.kind;
    if (k === 'circle') { K.circle(c, 0, 0, hw); return; }
    if (k === 'egg') {
      const tw = hw * (hd.top ?? 0.82), bw = hw;
      c.beginPath(); c.moveTo(0, -hh);
      c.bezierCurveTo(tw * 0.75, -hh, tw, -hh * 0.55, (tw + bw) / 2, 0);
      c.bezierCurveTo(bw * 1.04, hh * 0.55, bw * 0.62, hh, 0, hh);
      c.bezierCurveTo(-bw * 0.62, hh, -bw * 1.04, hh * 0.55, -(tw + bw) / 2, 0);
      c.bezierCurveTo(-tw, -hh * 0.55, -tw * 0.75, -hh, 0, -hh); c.closePath(); return;
    }
    if (k === 'tile') { K.rrect(c, -hw, -hh, hw * 2, hh * 2 + (hd.neck || 0), [hw * 0.62, hw * 0.62, hw * 0.5, hw * 0.5]); return; }
    if (k === 'pill') { K.rrect(c, -hw, -hh, hw * 2, hh * 2 + (hd.neck || 0), hw); return; }
    K.rrect(c, -hw, -hh, hw * 2, hh * 2 + (hd.neck || 0), [hw, hw, hw * 0.6, hw * 0.6]);   // capsule
  }
  C.headPath = headPath;
  C.helpers = { path, union, shape, noodle, partial, INK, headPath };

  // 2-bone IK in the screen plane: shoulder S, target T, lengths a, b, pole P (screen vector: elbow side)
  function ik(S, T, a, b, P) {
    let dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy);
    const dm = Math.max(Math.abs(a - b) + 1e-4, Math.min(a + b - 1e-4, d));
    if (d < 1e-6) { dx = 0; dy = 1; d = 1; }
    const ux = dx / d, uy = dy / d, tx = S[0] + ux * dm, ty = S[1] + uy * dm;
    const x = (a * a - b * b + dm * dm) / (2 * dm), hgt = Math.sqrt(Math.max(0, a * a - x * x));
    const nx = -uy, ny = ux, sg = (nx * P[0] + ny * P[1]) >= 0 ? 1 : -1;
    const E = [S[0] + ux * x + nx * hgt * sg, S[1] + uy * x + ny * hgt * sg];
    return [S, E, [tx, ty]];
  }
  // a soft limb: quadratic through (near) the elbow, sampled to a polyline
  function softLimb(j, k = 0.6, n = 14) {
    const [S, E, H] = j, mx = (S[0] + H[0]) / 2, my = (S[1] + H[1]) / 2, cx = E[0] + (E[0] - mx) * k, cy = E[1] + (E[1] - my) * k;
    const out = []; for (let i = 0; i <= n; i++) { const t = i / n, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), d = t * t; out.push([a * S[0] + b * cx + d * H[0], a * S[1] + b * cy + d * H[1]]); }
    return out;
  }

  // ------------------------------------------------------------------ poses
  // per arm: f (front view [out, up]) and sd (side view [forward, up]) in arm-lengths from the shoulder, OR at: an
  // anchor on the body; pf / ps: elbow pole per view [out|fwd, up]; hand kind. Idle arms hang bent and sway.
  const A = (f, sd, hand = 'relax', pf = [1, 0.15], ps = [-1, 0.1], x = {}) => Object.assign({ f, sd, hand, pf, ps }, x);
  const HANG = () => A([0.13, -0.968], [0.05, -0.97], 'relax', [1, 0.1], [-1, 0.25], { idle: 1 });
  C.POSES = {
    stand:   { lead: HANG(), trail: HANG() },
    point:   { lead: A([0.97, 0.16], [0.97, 0.2], 'point', [0, -1], [0, -1]), trail: HANG() },
    shrug:   { lead: A([0.6, -0.3], [0.45, -0.3], 'palm', [0.6, -1], [-0.5, -1]), trail: A([0.6, -0.3], [0.3, -0.32], 'palm', [0.6, -1], [-0.5, -1]), lift: 0.016, tilt: 0.1 },
    drive:   { lead: A([0.3, -0.42], [0.86, -0.34], 'mitt', [1, -0.8], [0, -1]), trail: A([0.3, -0.42], [0.8, -0.34], 'mitt', [1, -0.8], [0, -1]) },
    driveFist: { lead: A([0.3, -0.42], [0.86, -0.34], 'mitt', [1, -0.8], [0, -1]), trail: A([0.55, 0.72], [-0.12, 0.82], 'fist', [1, -0.5], [-1, -0.6], { shake: 1 }), lean: 0.06 },
    crossed: { lead: A(null, null, 'hide', [1, -1], [0, -1], { at: 'crossL' }), trail: A(null, null, 'hide', [1, -1], [0, -1], { at: 'crossT' }), lift: 0.006 },
    fist:    { lead: A([0.4, 0.55], [0.45, 0.5], 'fist', [1, -0.8], [-0.5, -1], { shake: 1 }), trail: HANG() },
    wave:    { lead: A([0.45, 0.85], [0.3, 0.9], 'palm', [1, -0.3], [0.3, -1], { wave: 1 }), trail: HANG() },
    cheer:   { lead: A([0.42, 0.9], [0.25, 0.95], 'fist', [1, 0], [-1, 0]), trail: A([0.42, 0.9], [0.15, 0.95], 'fist', [1, 0], [-1, 0]) },
    hips:    { lead: A(null, null, 'fist', [1, 0.05], [-1, 0.1], { at: 'hip' }), trail: A(null, null, 'fist', [1, 0.05], [-1, 0.1], { at: 'hip' }) },
    palm:    { lead: A([0.6, -0.22], [0.6, -0.2], 'palm', [0.4, -1], [-0.2, -1]), trail: HANG() },
    think:   { lead: A(null, null, 'hide', [1, -1], [0, -1], { at: 'crossL' }), trail: A(null, null, 'fist', [1, -0.6], [0, -1], { at: 'chin' }) },
    lap:     { lead: A(null, null, 'mitt', [1, -1], [-0.3, -1], { at: 'lap' }), trail: A(null, null, 'mitt', [1, -1], [-0.3, -1], { at: 'lap' }) },
    lapPoint: { lead: A(null, null, 'mitt', [1, -1], [-0.3, -1], { at: 'lap' }), trail: A([-0.6, 0.35], [-0.85, 0.3], 'point', [0, -1], [0, -1]) },
  };

  // ------------------------------------------------------------------ expressions
  // lid 0 open .. 1 shut, low = lower lid, tilt +angry / -worried, eye scale, pupil scale, mouth kind, extras
  C.EXPR = {
    neutral:   { lid: 0.12, mouth: 'smile' },
    happy:     { lid: 0.0, low: 0.0, mouth: 'grin', head: -0.06, noBias: 1, look: [0, -0.5], grin: 1.3, eye: 1.05 },
    laugh:     { happyEyes: 1, mouth: 'laugh', head: -0.12, noBias: 1, lift: -0.006, blush: 0.25 },
    surprised: { lid: 0.0, eye: 1.22, pupil: 0.58, mouth: 'o', noBias: 1, lift: -0.006 },
    annoyed:   { lid: 0.45, tilt: 0.3, mouth: 'flat', look: [0.45, 0.05], noBias: 0.5 },
    grumpy:    { lid: 0.44, tilt: 0.55, mouth: 'frown', noBias: 0.6 },
    furious:   { lid: 0.3, tilt: 0.9, eye: 1.06, pupil: 0.72, mouth: 'yell', noBias: 1, head: 0.04, extras: ['anger'] },
    worried:   { lid: 0.22, tilt: -0.5, mouth: 'wobble', pupil: 0.85, noBias: 0.7, sweat: 1 },
    thinking:  { lid: 0.3, tilt: 0.1, mouth: 'think', look: [0.6, -0.75], head: 0.06, noBias: 0.4 },
    awe:       { lid: 0.0, eye: 1.24, pupil: 1.0, mouth: 'awe', look: [0, -0.4], noBias: 1, sparkle: 1 },
    smug:      { lid: 0.5, low: 0.24, mouth: 'smirk', look: [0.8, 0], tilt: 0.12, noBias: 0.7 },
    sheepish:  { lid: 0.16, tilt: -0.35, mouth: 'sheep', look: [-0.75, 0.35], noBias: 0.8, blush: 0.45, sweat: 1 },
    determined: { lid: 0.36, tilt: 0.5, mouth: 'set', look: [0.6, 0], noBias: 0.6 },
    curious:   { lid: 0.02, eye: 1.08, mouth: 'smallo', look: [0.4, -0.5], noBias: 0.7 },
    talk:      { lid: 0.12, mouth: 'talk' },
  };
  C.EXPR.sly = C.EXPR.smug;
  C.EXPRESSIONS = ['neutral', 'laugh', 'surprised', 'furious', 'worried', 'smug'];

  // ------------------------------------------------------------------ the face (head-local units, origin = head centre)
  function eyeShape(c, x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, Math.max(1e-4, rx), Math.max(1e-4, ry), 0, 0, K.TAU); }
  function lidOf(H) {
    const F = H.F, E = H.E; let lid = K.clamp((E.lid ?? 0.1) + (F.lidBias || 0) * (1 - (E.noBias || 0)));
    if (H.blink > 0.5) lid = 1; return lid;
  }
  function drawEye(c, H, ex, ey, rr, side, far) {
    const F = H.F, E = H.E, lw = H.lw;
    const k = E.eye || 1, rx = rr * k * (1 - 0.32 * H.fs * (far ? 1.4 : 0.6)), ry = rr * k;
    let lid = lidOf(H);
    const low = E.low || 0, m = -side * (E.tilt || 0);
    const look = H.look;
    const kind = F.eyes;
    if (kind === 'googly' || kind === 'iris') {
      const sclera = F.sclera || '#fbf7ee';
      if (E.happyEyes && H.blink < 0.5) { // closed, smiling arcs (^ ^)
        c.strokeStyle = INK; c.lineWidth = lw * 2.2; c.lineCap = 'round';
        c.beginPath(); c.moveTo(ex - rx * 0.95, ey + ry * 0.25); c.quadraticCurveTo(ex, ey - ry * 0.85, ex + rx * 0.95, ey + ry * 0.25); c.stroke(); return;
      }
      eyeShape(c, ex, ey, rx, ry); c.fillStyle = sclera; c.fill();
      const pr = rr * (F.pupil || 0.36) * (E.pupil || 1) * (far ? 0.92 : 1);
      const px = ex + (look[0] * 0.42 + (F.goofy || 0) * side * 0.12) * rx + H.faceDir * H.fs * rx * 0.25, py = ey + (look[1] * 0.42 + 0.05 + K.clamp(lid - 0.25) * 0.55) * ry;
      c.save(); eyeShape(c, ex, ey, rx, ry); c.clip();
      if (kind === 'iris') { const ir = pr * (F.irisK || 1.9); c.fillStyle = F.iris || '#5a3a24'; K.circle(c, px, py, ir); c.fill();
        c.strokeStyle = K.rgba(INK, 0.6); c.lineWidth = lw * 0.6; c.stroke(); }
      c.fillStyle = F.pupilColor || INK; K.circle(c, px, py, pr); c.fill();
      const ck = F.catch ?? (kind === 'iris' ? 0.55 : 0);
      if (ck || E.sparkle) { c.fillStyle = '#ffffff'; const cr = pr * (E.sparkle ? 0.75 : ck); K.circle(c, px - pr * 0.4, py - pr * 0.45, cr); c.fill(); if (E.sparkle) { K.circle(c, px + pr * 0.45, py + pr * 0.4, cr * 0.45); c.fill(); } }
      c.fillStyle = H.lidColor || H.skin;
      if (lid > 0.01) { const yl = ey - ry + lid * 2 * ry; c.beginPath(); c.moveTo(ex - rx * 1.5, yl - m * rx * 1.5); c.lineTo(ex + rx * 1.5, yl + m * rx * 1.5); c.lineTo(ex + rx * 1.5, ey - ry * 2); c.lineTo(ex - rx * 1.5, ey - ry * 2); c.closePath(); c.fill();
        c.strokeStyle = INK; c.lineWidth = lw * 1.0; c.beginPath(); c.moveTo(ex - rx * 1.5, yl - m * rx * 1.5); c.lineTo(ex + rx * 1.5, yl + m * rx * 1.5); c.stroke(); }
      if (low > 0.01) { const yl = ey + ry - low * 2 * ry; c.fillStyle = H.lidColor || H.skin; c.beginPath(); c.moveTo(ex - rx * 1.5, yl); c.quadraticCurveTo(ex, yl - ry * 0.25, ex + rx * 1.5, yl); c.lineTo(ex + rx * 1.5, ey + ry * 2); c.lineTo(ex - rx * 1.5, ey + ry * 2); c.closePath(); c.fill();
        c.strokeStyle = INK; c.lineWidth = lw * 0.9; c.beginPath(); c.moveTo(ex - rx * 1.5, yl); c.quadraticCurveTo(ex, yl - ry * 0.25, ex + rx * 1.5, yl); c.stroke(); }
      c.restore();
      eyeShape(c, ex, ey, rx, ry); c.lineWidth = lw * (F.eyeLine ?? 0.8); c.strokeStyle = INK; c.stroke();
      if (F.lashes) {
        const yl = ey - ry + Math.max(lid, 0.05) * 2 * ry, out = side; c.strokeStyle = INK; c.lineWidth = lw * 0.9; c.lineCap = 'round';
        const ox = ex + out * rx * 0.86, oy = lid > 0.05 ? yl + m * rx * out * 0.86 : ey - ry * 0.55;
        for (let i = 0; i < (far ? 1 : 2); i++) { c.beginPath(); c.moveTo(ox - out * rx * 0.1 * i, oy - ry * 0.05 * i); c.quadraticCurveTo(ox + out * rx * 0.25, oy - ry * (0.15 + 0.12 * i), ox + out * rx * (0.42 - 0.08 * i), oy - ry * (0.38 + 0.22 * i)); c.stroke(); }
      }
    } else { // 'dot': ink oval with a catchlight; lids are skin over it; happy = arcs
      const happy = E.happyEyes || (E.mouth === 'grin' && F.dotHappy !== false);
      c.fillStyle = INK; c.strokeStyle = INK; c.lineCap = 'round';
      const px = ex + look[0] * rx * 0.35, py = ey + look[1] * ry * 0.3, sc = (E.eye || 1) * (E.pupil && E.pupil < 0.7 ? 0.85 : 1);
      if (H.blink > 0.5 || lid > 0.92) { c.lineWidth = lw * 2.2; c.beginPath(); c.moveTo(ex - rx * 1.1, ey + ry * 0.2); c.quadraticCurveTo(ex, ey + ry * 0.55, ex + rx * 1.1, ey + ry * 0.2); c.stroke(); return; }
      if (happy) { c.lineWidth = lw * 2.4; c.beginPath(); c.moveTo(ex - rx * 1.05, ey + ry * 0.25); c.quadraticCurveTo(ex, ey - ry * 1.0, ex + rx * 1.05, ey + ry * 0.25); c.stroke(); return; }
      if (lid < 0.2 && !E.tilt) lid = 0;
      c.save(); if (lid > 0.02 || low > 0.02) { c.beginPath(); const yl = py - ry * sc + lid * 2 * ry * sc, yb = py + ry * sc - low * 2 * ry * sc;
        c.moveTo(px - rx * 2, yl - m * rx * 2); c.lineTo(px + rx * 2, yl + m * rx * 2); c.lineTo(px + rx * 2, yb); c.lineTo(px - rx * 2, yb); c.closePath(); c.clip(); }
      eyeShape(c, px, py, rx * sc, ry * sc); c.fill(); c.restore();
      if (lid > 0.02) { const yl = py - ry * sc + lid * 2 * ry * sc; c.lineWidth = lw * 1.8; c.beginPath(); c.moveTo(px - rx * 1.25, yl - m * rx * 1.25); c.lineTo(px + rx * 1.25, yl + m * rx * 1.25); c.stroke(); }
      if (lid < 0.6) { c.fillStyle = '#ffffff'; K.circle(c, px - rx * 0.32 * sc + look[0] * rx * 0.1, py - ry * 0.38 * sc + Math.max(0, lid) * ry * 0.9, rx * (E.sparkle ? 0.45 : 0.34) * sc); c.fill(); }
      if (F.lashes) { c.lineWidth = lw * 1.4; const ox = px + side * rx * 0.9 * sc, oy = py - ry * 0.55 * sc + lid * ry; c.beginPath(); c.moveTo(ox, oy); c.quadraticCurveTo(ox + side * rx * 0.4, oy - ry * 0.15, ox + side * rx * 0.6, oy - ry * 0.55); c.stroke(); }
    }
  }

  // mouths. Front: centred shapes. Profile (fs > 0.78): anchored on the face edge so they read as a side mouth
  const OPEN = { grin: 1, laugh: 1, talk: 1, yell: 1, awe: 1, o: 1, smallo: 1 };
  function openMouth(c, w, o, wide, lw, teethBottom) {
    const pathM = () => { c.beginPath(); c.moveTo(-w * wide, -w * 0.05); c.quadraticCurveTo(0, w * 0.06, w * wide, -w * 0.05); c.quadraticCurveTo(w * wide * 0.85, w * (0.25 + o), 0, w * (0.3 + o)); c.quadraticCurveTo(-w * wide * 0.85, w * (0.25 + o), -w * wide, -w * 0.05); c.closePath(); };
    pathM(); c.fillStyle = '#3a1520'; c.fill(); c.save(); pathM(); c.clip();
    c.fillStyle = '#fbf6ec'; c.fillRect(-w * 1.5, -w * 0.25, w * 3, w * (0.17 + o * 0.22));
    if (teethBottom) c.fillRect(-w * 1.5, w * (0.26 + o * 0.86), w * 3, w * 0.3);
    c.fillStyle = '#e0707a'; K.ellipse(c, w * 0.05, w * (0.32 + o), w * wide * 0.55, w * (0.17 + o * 0.4)); c.fill(); c.restore();
    pathM(); c.lineWidth = lw * 1.0; c.strokeStyle = INK; c.stroke();
  }
  function drawMouth(c, H, mx, my, mw) {
    const E = H.E, lw = H.lw, kind = H.talk > 0.05 && !['yell', 'laugh'].includes(E.mouth) ? 'talk' : E.mouth;
    const lip = H.F.lip || INK, w = mw, st = Math.max(lw * 1.1, w * 0.13);
    if (H.fs > 0.78) return profileMouth(c, H, kind, my, w, st, lip);
    const sx = 1 - 0.4 * H.fs;
    c.save(); c.translate(mx, my); c.scale(sx, 1); c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = lip; c.fillStyle = INK; c.lineWidth = st;
    switch (kind) {
      case 'smile': c.beginPath(); c.moveTo(-w * 0.55, -w * 0.08); c.quadraticCurveTo(0, w * 0.32, w * 0.55, -w * 0.08); c.stroke(); break;
      case 'grin': openMouth(c, w, (H.F.grinOpen ?? 0.12) * (E.grin || 1), (H.F.grinW ?? 0.7) * Math.sqrt(E.grin || 1), lw); break;
      case 'laugh': openMouth(c, w, 0.42, (H.F.grinW ?? 0.7) * 1.12, lw); break;
      case 'yell': { // a big angry shout: arched top lip, corners pulled down, deep jaw, both rows of teeth
        const W = w * 0.66, D = w * 1.0;
        const pm = () => { c.beginPath(); c.moveTo(-W, w * 0.06); c.quadraticCurveTo(0, -w * 0.2, W, w * 0.06); c.quadraticCurveTo(W * 0.95, D * 0.85, 0, D); c.quadraticCurveTo(-W * 0.95, D * 0.85, -W, w * 0.06); c.closePath(); };
        pm(); c.fillStyle = '#3a1520'; c.fill(); c.save(); pm(); c.clip();
        c.fillStyle = '#fbf6ec'; c.beginPath(); c.moveTo(-W * 1.2, -w * 0.3); c.lineTo(W * 1.2, -w * 0.3); c.lineTo(W * 1.2, w * 0.1); c.quadraticCurveTo(0, -w * 0.02, -W * 1.2, w * 0.1); c.closePath(); c.fill();
        c.fillRect(-W * 1.2, D * 0.84, W * 2.4, w * 0.3);
        c.fillStyle = '#e0707a'; K.ellipse(c, 0, D * 0.78, W * 0.55, D * 0.2); c.fill(); c.restore();
        pm(); c.lineWidth = lw * 1.1; c.strokeStyle = INK; c.stroke(); break; }
      case 'talk': openMouth(c, w, 0.04 + H.talk * 0.2, 0.5 + 0.1 * Math.sin(H.talk * 9), lw); break;
      case 'o': c.fillStyle = '#3a1520'; K.ellipse(c, 0, w * 0.1, w * 0.21, w * 0.29); c.fill(); c.lineWidth = lw * 1.0; c.strokeStyle = INK; c.stroke(); break;
      case 'awe': c.fillStyle = '#3a1520'; K.ellipse(c, 0, w * 0.14, w * 0.26, w * 0.34); c.fill(); c.save(); K.ellipse(c, 0, w * 0.14, w * 0.26, w * 0.34); c.clip(); c.fillStyle = '#e0707a'; K.ellipse(c, 0, w * 0.42, w * 0.2, w * 0.14); c.fill(); c.restore(); K.ellipse(c, 0, w * 0.14, w * 0.26, w * 0.34); c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); break;
      case 'smallo': c.fillStyle = '#3a1520'; K.ellipse(c, w * 0.05, w * 0.05, w * 0.12, w * 0.15); c.fill(); c.lineWidth = lw * 1.4; c.strokeStyle = INK; c.stroke(); break;
      case 'frown': c.beginPath(); c.moveTo(-w * 0.45, w * 0.12); c.quadraticCurveTo(0, -w * 0.2, w * 0.45, w * 0.12); c.stroke(); break;
      case 'flat': c.beginPath(); c.moveTo(-w * 0.4, w * 0.02); c.lineTo(w * 0.4, -w * 0.02); c.stroke(); break;
      case 'set': c.beginPath(); c.moveTo(-w * 0.42, w * 0.06); c.quadraticCurveTo(0, -w * 0.02, w * 0.42, w * 0.06); c.stroke(); break;
      case 'think': c.beginPath(); c.moveTo(w * 0.05, w * 0.03); c.quadraticCurveTo(w * 0.3, -w * 0.06, w * 0.5, w * 0.06); c.stroke(); break;
      case 'wobble': c.beginPath(); c.moveTo(-w * 0.45, 0); for (let i = 1; i <= 6; i++) c.lineTo(-w * 0.45 + i * w * 0.15, (i % 2 ? -1 : 1) * w * 0.07); c.stroke(); break;
      case 'sheep': { // a wavy, clenched grin
        c.fillStyle = '#fbf6ec'; c.beginPath(); c.moveTo(-w * 0.5, -w * 0.04); c.quadraticCurveTo(0, w * 0.06, w * 0.5, -w * 0.06); c.quadraticCurveTo(w * 0.4, w * 0.2, 0, w * 0.2); c.quadraticCurveTo(-w * 0.4, w * 0.2, -w * 0.5, -w * 0.04); c.closePath(); c.fill();
        c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.moveTo(-w * 0.44, w * 0.06); c.lineTo(w * 0.44, w * 0.04); c.stroke(); break; }
      case 'smirk': c.beginPath(); c.moveTo(-w * 0.42, w * 0.04); c.quadraticCurveTo(w * 0.1, w * 0.16, w * 0.5, -w * 0.16); c.stroke(); break;
    }
    c.restore();
  }
  function profileMouth(c, H, kind, my, w, st, lip) {
    const fd = H.faceDir, ex = H.edgeX, lw = H.lw;   // ex: the head's front edge at mouth height (head-local)
    c.save(); c.translate(ex, my); c.scale(fd, 1); c.lineCap = 'round'; c.lineJoin = 'round';
    if (OPEN[kind]) {
      const sz = { grin: 0.55, laugh: 0.85, talk: 0.25 + H.talk * 0.55, yell: 1.05, awe: 0.6, o: 0.45, smallo: 0.28 }[kind];
      const depth = w * (0.42 + 0.3 * sz), up = w * (0.1 + 0.18 * sz), dn = w * (0.12 + 0.42 * sz);
      const wedge = () => { c.beginPath(); c.moveTo(lw * 2.2, -up); c.quadraticCurveTo(-depth * 0.7, -up * 0.6, -depth, 0); c.quadraticCurveTo(-depth * 0.6, dn, lw * 2.2, dn); c.closePath(); };
      if (kind === 'o' || kind === 'smallo' || kind === 'awe') { const r = w * (0.1 + 0.2 * sz); c.fillStyle = '#3a1520'; K.ellipse(c, -r * 0.7, w * 0.06, r * 0.75, r * 1.15); c.fill(); c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); c.restore(); return; }
      wedge(); c.fillStyle = '#3a1520'; c.fill();
      c.save(); wedge(); c.clip(); c.fillStyle = '#fbf6ec'; c.fillRect(-depth, -up - 1, depth + lw * 3, up * 0.55 + w * 0.06);
      if (kind === 'yell') c.fillRect(-depth, dn - w * 0.12, depth + lw * 3, w * 0.2);
      c.fillStyle = '#e0707a'; K.ellipse(c, -depth * 0.25, dn * 0.85, depth * 0.55, dn * 0.35); c.fill(); c.restore();
      c.strokeStyle = INK; c.lineWidth = lw * 1.1; c.beginPath(); c.moveTo(lw * 1.2, -up); c.quadraticCurveTo(-depth * 0.7, -up * 0.6, -depth, 0); c.quadraticCurveTo(-depth * 0.6, dn, lw * 1.2, dn); c.stroke();
    } else {
      c.strokeStyle = lip; c.lineWidth = st;
      const curl = { smile: -1, smirk: -1.3, sheep: -0.6, frown: 1, wobble: 0.3, flat: 0, set: 0.25, think: 0.4 }[kind] ?? 0;
      c.beginPath(); c.moveTo(-lw * 0.5, w * 0.02); c.quadraticCurveTo(-w * 0.28, w * 0.04 + curl * w * 0.02, -w * 0.46, curl * w * 0.16); c.stroke();
      if (kind === 'wobble') { c.beginPath(); c.moveTo(-w * 0.2, w * 0.05); c.lineTo(-w * 0.28, -w * 0.02); c.stroke(); }
    }
    c.restore();
  }
  C.face = function (c, H) {
    const F = H.F, E = H.E, hw = H.hw, fdir = H.faceDir;
    const fx = H.cx + fdir * H.fs * hw * (F.turnK ?? 0.62) + H.look[0] * hw * 0.1, fy = H.cy + (E.lift || 0) + H.look[1] * hw * 0.06;
    const rr = F.eyeR, sep = F.eyeSep * (1 - 0.38 * H.fs);
    const ey = fy + F.eyeY;
    const eyes = [];
    if (H.fs > 0.88) eyes.push([fx + fdir * F.eyeSep * 0.25, -fdir, false]);
    else { eyes.push([fx - sep, -1, fdir > 0 ? false : H.fs > 0.2]); eyes.push([fx + sep, 1, fdir > 0 ? H.fs > 0.2 : false]); }
    if (F.nose) {
      const nx = fx + fdir * H.fs * hw * 0.42, ny = ey + F.noseY, nr = F.nose;
      c.fillStyle = H.skin; c.strokeStyle = INK; c.lineWidth = H.lw * 0.9;
      K.ellipse(c, nx + fdir * H.fs * nr * 0.7, ny, nr * (1 + 0.35 * H.fs), nr * 0.8); c.fill(); c.stroke();
    }
    if (F.freckles) { c.fillStyle = K.rgba(F.freckles, 0.6); for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) { const x = fx + sg * (sep + rr * 0.2) + (i - 1) * rr * 0.32, y = ey + rr * 1.35 + (i % 2) * rr * 0.18; if (H.fs > 0.5 && sg === -fdir) continue; K.circle(c, x, y, rr * 0.07); c.fill(); } }
    for (const [x, side, far] of eyes.sort((a, b) => (a[2] ? -1 : 1) - (b[2] ? -1 : 1))) drawEye(c, H, x, ey, rr, side, far);
    if (F.brows) drawBrows(c, H, eyes, ey, rr);
    if (F.glasses) F.glasses(c, H, eyes, ey, rr);
    const bl = (F.blush || 0) + (E.blush || 0);
    if (bl) { c.fillStyle = K.rgba(F.blushColor || '#ff7a6a', Math.min(0.6, bl)); for (const [x, side, far] of eyes) if (!far) { K.ellipse(c, x + side * rr * 0.45, ey + rr * 1.35, rr * 0.55, rr * 0.3); c.fill(); } }
    if (F.mustache) F.mustache(c, H, fx, fy);
    const mx = fx + fdir * H.fs * hw * 0.12, my = fy + F.mouthY;
    H.edgeX = H.cx + fdir * hw * (F.edgeK ?? 1.0);
    drawMouth(c, H, mx, my, F.mouthW);
    if (E.sweat) { const sx = H.cx - fdir * hw * 0.95, sy = ey - rr * 0.8; c.fillStyle = '#9fd3f0'; c.strokeStyle = INK; c.lineWidth = H.lw;
      c.beginPath(); c.moveTo(sx, sy - rr * 0.9); c.quadraticCurveTo(sx + rr * 0.5, sy, sx, sy + rr * 0.35); c.quadraticCurveTo(sx - rr * 0.5, sy, sx, sy - rr * 0.9); c.fill(); c.stroke(); }
    return { fx, fy, ey, eyes };
  };
  function drawBrows(c, H, eyes, ey, rr) {
    const F = H.F, E = H.E;
    c.strokeStyle = F.browColor || INK; c.lineCap = 'round'; c.lineWidth = F.brows;
    const bt = (E.tilt || 0) * (F.browK ?? 1.2), up = (F.browY || 0) + (E.eye && E.eye > 1.1 ? -rr * 0.35 : 0) + (E.happyEyes ? -rr * 0.2 : 0);
    for (const [x, side, far] of eyes) {
      const by = ey - rr * (F.browGap || 1.55) + up, w = rr * (F.browW || 0.9) * (far ? 0.75 : 1), inner = -side;
      let yi = by + bt * rr * 0.42, yo = by - bt * rr * 0.12;
      if (E.mouth === 'smirk' && side === eyes[0][1]) { yi -= rr * 0.3; yo -= rr * 0.4; }
      c.beginPath(); c.moveTo(x + inner * w * 0.7, yi); c.quadraticCurveTo(x, (yi + yo) / 2 - rr * 0.14, x - inner * w * 0.75, yo); c.stroke();
    }
  }

  // ------------------------------------------------------------------ hands
  function hand(c, P, dirv, kind, r, color, lw, side) {
    const [x, y] = P, a = Math.atan2(dirv[1], dirv[0]);
    c.fillStyle = color; c.strokeStyle = INK; c.lineWidth = lw * 2; c.lineJoin = 'round';
    if (kind === 'hide') return;
    if (kind === 'point') {
      const fx = x + dirv[0] * r * 1.6, fy = y + dirv[1] * r * 1.6;
      noodle(c, [[x, y], [fx, fy]], r * 0.62, color, lw);
      K.circle(c, x, y, r); c.lineWidth = lw * 2; c.stroke(); c.fill();
      c.lineCap = 'round'; c.strokeStyle = color; c.lineWidth = r * 0.62; path(c, [[x + dirv[0] * r * 0.5, y + dirv[1] * r * 0.5], [fx, fy]]); c.stroke();
    } else if (kind === 'palm') {
      K.ellipse(c, x, y, r * 1.1, r * 0.82, a); c.stroke(); c.fill();
      const tx = x - dirv[1] * r * 0.9, ty = y + dirv[0] * r * 0.9 - r * 0.2;
      c.lineWidth = lw * 2; K.circle(c, tx, ty - r * 0.25, r * 0.38); c.stroke(); c.fill();
    } else if (kind === 'fist') {
      K.circle(c, x, y, r * 0.98); c.stroke(); c.fill();
      c.strokeStyle = K.rgba(INK, 0.7); c.lineWidth = lw; c.beginPath(); c.arc(x, y, r * 0.5, a - 0.6, a + 1.0); c.stroke();
    } else if (kind === 'relax') { // a soft mitten along the forearm with a thumb bump on the front
      const cx = x + dirv[0] * r * 0.35, cy = y + dirv[1] * r * 0.35, ts = side || 1;
      const tx = cx - dirv[1] * r * 0.72 * ts, ty = cy + dirv[0] * r * 0.72 * ts;
      c.lineWidth = lw * 2; K.circle(c, tx - dirv[0] * r * 0.25, ty - dirv[1] * r * 0.25, r * 0.36); c.stroke();
      K.ellipse(c, cx, cy, r * 1.12, r * 0.84, a); c.stroke(); c.fill();
      K.circle(c, tx - dirv[0] * r * 0.25, ty - dirv[1] * r * 0.25, r * 0.36); c.fill();
    } else { K.circle(c, x, y, r); c.stroke(); c.fill(); }
  }

  // ------------------------------------------------------------------ the biped
  function biped(S, o) {
    const s = o.s, dir = o.dir, t = o.t || 0, lw = S.lw || 0.0075;
    const P = C.POSES[o.pose] || C.POSES.stand, PB = o.blend ? (C.POSES[o.blend.pose] || C.POSES.stand) : null, bk = o.blend ? K.clamp(o.blend.k) : 0;
    const cosT = Math.cos(s * Math.PI / 2);
    const breathe = Math.sin(t * 2.1 + (S.phase || 0)) * 0.0035, lift = K.lerp(P.lift || 0, PB ? PB.lift || 0 : 0, bk);
    const hipY = -S.legLen, shY = -S.shoulder - breathe - lift, legsOn = !o.seated;
    const Ttop = -S.torso.top - breathe - lift * 0.5, Tbot = -S.torso.bot;
    const wT = K.lerp(S.torso.wTop, S.torso.dTop ?? S.torso.wTop * 0.7, s), wB = K.lerp(S.torso.wBot, S.torso.dBot ?? S.torso.wBot * 0.75, s);
    const tcx = dir * s * (S.torso.lean || 0);
    const hw = S.head.hw, hh = S.head.hh;
    const headTurn = o.headTurn || 0;
    const fsRaw = s + headTurn;
    const faceDir = fsRaw >= 0 ? dir : -dir, fs = Math.min(1, Math.abs(fsRaw));
    const E = Object.assign({}, C.EXPR[o.expr] || C.EXPR.neutral);
    const tilt = (o.tilt || 0) + K.lerp(P.tilt || 0, PB ? PB.tilt || 0 : 0, bk) * dir + (E.head || 0) * faceDir;
    const lean = (o.lean || 0) + K.lerp(P.lean || 0, PB ? PB.lean || 0 : 0, bk);
    const hcx = tcx + dir * s * (S.head.lean || 0) * 0.5, hcy = -S.head.cy - breathe * 1.4 - lift;
    const H = { cx: 0, cy: 0, hw, hh, s, fs, faceDir, dir, lw, skin: S.skin, lidColor: S.lidColor, F: S.face, E, t, blink: o.blink || 0, talk: o.talk || 0,
      look: o.look || E.look || [0, 0], headTurn, drag: o.drag || 0, hatHit: o.hatHit || 0, back: false };
    const sh = sg => [tcx + sg * S.shoulderW * cosT + dir * s * (S.shoulderFwd || 0), shY];
    const L1 = S.arm.upper, L2 = S.arm.fore, LA = L1 + L2;
    const anchor = (name, sg) => {
      const chestY = K.lerp(Ttop, Tbot, 0.32);
      switch (name) {
        case 'hip': return [tcx + sg * (wB + 0.006) * K.lerp(1, 0.4, s) - dir * s * 0.035, Tbot - 0.035];
        case 'crossL': return [tcx - sg * wT * 0.5 * cosT + dir * s * wT * 0.6, chestY + 0.02];
        case 'crossT': return [tcx - sg * wT * 0.55 * cosT + dir * s * wT * 0.8, chestY + 0.045];
        case 'chin': return [hcx + faceDir * fs * hw * 0.6 + (1 - fs) * 0.0, hcy + hh * 0.95];
        case 'lap': return [tcx + sg * wB * 0.5 * cosT + dir * s * (wB + 0.06), Tbot - 0.01];
      }
      return [tcx, chestY];
    };
    const target = (sg, a) => {
      const S0 = sh(sg);
      let T;
      if (a.at) T = anchor(a.at, sg);
      else { const tf = [a.f[0] * sg * LA, -a.f[1] * LA], ts = [a.sd[0] * dir * LA, -a.sd[1] * LA]; T = [S0[0] + K.lerp(tf[0], ts[0], s), S0[1] + K.lerp(tf[1], ts[1], s)]; }
      if (a.idle) T = [T[0] + Math.sin(t * 1.3 + sg * 1.7 + (S.phase || 0)) * 0.01 * sg, T[1] + Math.sin(t * 2.1 + (S.phase || 0)) * 0.004];
      if (a.shake) T = [T[0] + Math.sin(t * 22) * 0.012, T[1] + Math.cos(t * 22) * 0.01];
      if (a.wave) T = [T[0] + Math.sin(t * 8) * 0.04 * sg, T[1]];
      const pole = [K.lerp(a.pf[0] * sg, a.ps[0] * dir, s), K.lerp(-a.pf[1], -a.ps[1], s)];
      return { T, pole, S0 };
    };
    const armFor = (sg, a, b) => {
      const A0 = target(sg, a); let T = A0.T, pole = A0.pole, hk = a.hand;
      if (b && bk > 0) { const B0 = target(sg, b); T = [K.lerp(T[0], B0.T[0], bk), K.lerp(T[1], B0.T[1], bk)]; pole = [K.lerp(pole[0], B0.pole[0], bk), K.lerp(pole[1], B0.pole[1], bk)]; if (bk > 0.5) hk = b.hand; }
      const j = ik(A0.S0, T, L1, L2, pole);
      const pts = softLimb(j, 0.35);
      const e = pts[pts.length - 1], q = pts[pts.length - 3], dl = Math.hypot(e[0] - q[0], e[1] - q[1]) || 1;
      return { j, pts, hand: hk, dv: [(e[0] - q[0]) / dl, (e[1] - q[1]) / dl], sg };
    };
    const lead = armFor(dir, P.lead, PB && PB.lead), trail = armFor(-dir, P.trail, PB && PB.trail);
    const drawArm = (c, Aa) => {
      const pts = Aa.pts, ar = S.arm;
      noodle(c, pts, ar.w, ar.skinPart ? S.skin : ar.sleeve, lw);
      if (ar.skinPart) { const p = partial(pts, ar.sleeveTo); noodle(c, p, ar.sleeveW || ar.w * 1.25, ar.sleeve, lw); if (ar.sleeveBand) { const q = partial(pts, ar.sleeveTo, ar.sleeveTo - 0.05); c.lineCap = 'butt'; path(c, q); c.strokeStyle = ar.sleeveBand; c.lineWidth = (ar.sleeveW || ar.w * 1.25) * 0.98; c.stroke(); } }
      if (ar.upperColor) { const p = partial(pts, ar.upperTo || 0.5); noodle(c, p, ar.w * 1.02, ar.upperColor, lw); }
      if (ar.stripe) { c.lineCap = 'round'; path(c, partial(pts, 0.86)); c.strokeStyle = ar.stripe; c.lineWidth = ar.w * 0.22; c.stroke(); }
      if (ar.flare) { const p = partial(pts, 0.92), qq = p[p.length - 1]; c.fillStyle = ar.cuff || ar.sleeve; c.strokeStyle = INK; c.lineWidth = lw * 2; K.ellipse(c, qq[0], qq[1], ar.w * 0.85, ar.w * 0.85, 0); c.stroke(); c.fill(); }
      else if (!ar.skinPart && ar.cuff) { const p = partial(pts, 0.92, 0.86); c.lineCap = 'butt'; path(c, p); c.strokeStyle = INK; c.lineWidth = ar.w + 2 * lw; c.stroke(); c.strokeStyle = ar.cuff; c.lineWidth = ar.w; c.stroke(); }
      if (o.prop && o.prop.hand === (Aa === lead ? 'lead' : 'trail') && o.prop.under) o.prop.under(c, pts[pts.length - 1], Aa.dv, S, H);
      hand(c, pts[pts.length - 1], Aa.dv, Aa.hand, ar.hand, S.handColor || S.skin, lw, Aa.sg * (s > 0.3 ? dir * Aa.sg : 1) > 0 ? 1 : -1);
      if (ar.watch && Aa === trail) { const p = partial(pts, 0.88), qq = p[p.length - 1]; c.fillStyle = ar.watch; c.strokeStyle = INK; c.lineWidth = lw * 1.4; K.circle(c, qq[0], qq[1], ar.w * 0.45); c.fill(); c.stroke(); }
      if (o.prop && o.prop.hand === (Aa === lead ? 'lead' : 'trail') && o.prop.draw) o.prop.draw(c, pts[pts.length - 1], Aa.dv, S, H);
    };
    const drawLeg = (c, sg) => {
      const hp = [sg * S.hipW * cosT, hipY], fx = hp[0] + (S.legSplay || 0) * sg * cosT;
      const b = S.boot, ankle = [fx, -(b.h * 0.5)];
      noodle(c, [hp, ankle], S.legW, S.legColor, lw);
      if (S.flare) { const fw = S.legW * 0.5, fw2 = S.legW * (0.5 + S.flare); c.fillStyle = S.legColor; c.strokeStyle = INK; c.lineWidth = lw * 2;
        c.beginPath(); c.moveTo(fx - fw, -b.h - 0.07); c.lineTo(fx - fw2, -b.foot * 0.6); c.lineTo(fx + fw2 + dir * s * 0.01, -b.foot * 0.6); c.lineTo(fx + fw, -b.h - 0.07); c.stroke(); c.fill(); }
      if (S.legStripe) { c.strokeStyle = S.legStripe; c.lineWidth = S.legW * 0.18; c.beginPath(); c.moveTo(hp[0] + sg * S.legW * 0.3 * cosT, hp[1] + 0.02); c.lineTo(fx + sg * S.legW * 0.3 * cosT, ankle[1]); c.stroke(); }
      if (S.sock) { c.fillStyle = S.sock; c.strokeStyle = INK; c.lineWidth = lw * 2; K.rrect(c, fx - S.legW * 0.42, -b.h - 0.045, S.legW * 0.84, 0.05, 0.01); c.stroke(); c.fill(); }
      const bw = b.w, toe = b.toe * s, back = b.back * s;
      const shaft = () => K.rrect(c, fx - bw, -b.h, bw * 2, b.h - b.sole * 0.5, [bw * 0.35, bw * 0.35, 0, 0]);
      const footP = () => { const x0 = fx - bw * (1 + 0.1 * (1 - s)) - (dir > 0 ? back : toe), x1 = fx + bw * (1 + 0.1 * (1 - s)) + (dir > 0 ? toe : back); K.rrect(c, x0, -b.foot, x1 - x0, b.foot, [b.foot * 0.6, b.foot * 0.6, b.sole * 0.6, b.sole * 0.6]); };
      union(c, b.h > b.foot * 1.2 ? [shaft, footP] : [footP], b.color, lw);
      c.save(); footP(); c.clip(); c.fillStyle = b.soleColor || K.shade(b.color, -0.35); c.fillRect(fx - 1, -b.sole, 2, b.sole + 0.01);
      if (b.toeCap) { c.fillStyle = b.toeCap; K.ellipse(c, fx + dir * (bw * 0.6 + toe * 0.6) * (s > 0.2 ? 1 : 0), -b.sole - 0.012, bw * 0.85, 0.02); c.fill(); }
      c.restore();
      footP(); c.strokeStyle = INK; c.lineWidth = lw * 1.6; c.stroke();
      if (b.lip) { c.fillStyle = K.shade(b.color, 0.12); c.strokeStyle = INK; c.lineWidth = lw * 1.4; K.rrect(c, fx - bw * 1.08, -b.h - 0.004, bw * 2.16, 0.022, 0.01); c.fill(); c.stroke(); }
      if (b.laces) { c.strokeStyle = K.rgba(b.laceColor || INK, 0.7); c.lineWidth = lw * 1.1; for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(fx - bw * 0.5 + dir * s * bw * 0.6, -b.foot * (0.75 - i * 0.22)); c.lineTo(fx + bw * 0.5 + dir * s * bw * 0.6, -b.foot * (0.75 - i * 0.22)); c.stroke(); } }
    };
    const torsoPath = (c) => {
      const r = Math.min(wT * 0.75, S.torso.round ?? 0.05), rb = Math.min(wB * 0.3, 0.03);
      c.beginPath(); c.moveTo(tcx - wT + r, Ttop); c.lineTo(tcx + wT - r, Ttop); c.quadraticCurveTo(tcx + wT, Ttop, tcx + wT, Ttop + r);
      c.quadraticCurveTo(tcx + (wT + wB) / 2 + (S.torso.belly || 0) * dir * s, (Ttop + Tbot) / 2, tcx + wB, Tbot - rb); c.quadraticCurveTo(tcx + wB, Tbot, tcx + wB - rb, Tbot);
      c.lineTo(tcx - wB + rb, Tbot); c.quadraticCurveTo(tcx - wB, Tbot, tcx - wB, Tbot - rb);
      c.quadraticCurveTo(tcx - (wT + wB) / 2, (Ttop + Tbot) / 2, tcx - wT, Ttop + r); c.quadraticCurveTo(tcx - wT, Ttop, tcx - wT + r, Ttop); c.closePath();
    };
    const B = { s, dir, t, lw, tcx, Ttop, Tbot, wT, wB, shY, hipY, cosT, torsoPath, hcx, hcy, hw, hh, fs, faceDir, seated: !!o.seated, S, H, drag: o.drag || 0 };
    const headDraw = (c, layer) => {
      c.save(); c.translate(hcx, hcy + hh); c.rotate(tilt); c.translate(0, -hh);
      if (layer === 'back') { if (S.hairBack) S.hairBack(c, H, B); c.restore(); return; }
      const hp = () => headPath(c, S.head);
      if (S.ears) S.ears(c, H, B);
      if (S.head.noLine) { hp(); c.fillStyle = S.skin; c.fill(); } else shape(c, hp, S.skin, lw);
      if (S.hairFront) S.hairFront(c, H, B);
      const fi = C.face(c, H);
      if (S.hat) S.hat(c, H, B);
      if (S.headTop) S.headTop(c, H, B, fi);
      c.restore();
    };
    const upper = (c, fn) => { if (!lean) return fn(); c.save(); c.translate(0, hipY); c.rotate(lean * dir); c.translate(0, -hipY); fn(); c.restore(); };
    return {
      lead, trail, H, B,
      layers: {
        back(c) {
          upper(c, () => { headDraw(c, 'back'); if (s > 0.05) drawArm(c, lead); });
          if (legsOn && s > 0.05) drawLeg(c, dir);
        },
        body(c) {
          if (legsOn) { if (s <= 0.05) { drawLeg(c, -1); drawLeg(c, 1); } else drawLeg(c, -dir); }
          upper(c, () => {
            if (S.under) S.under(c, B);
            if (!S.headOver) headDraw(c, 'front');
            shape(c, () => torsoPath(c), S.torso.color, lw);
            if (S.outfit) { c.save(); torsoPath(c); c.clip(); S.outfit(c, B); c.restore(); }
            if (S.outfitTop) S.outfitTop(c, B);
            if (S.collar) S.collar(c, B);
            if (S.headOver) headDraw(c, 'front');
          });
        },
        front(c) {
          upper(c, () => {
            if (s <= 0.05) {
              const crossed = (o.pose === 'crossed' && bk < 0.5) || (PB && o.blend.pose === 'crossed' && bk >= 0.5);
              for (const Aa of (crossed ? [lead, trail] : [trail, lead])) drawArm(c, Aa);
            } else drawArm(c, trail);
            if (S.front) S.front(c, B);
          });
        },
      },
      info: { head: [hcx, hcy, Math.max(hw, hh)], hands: { lead: lead.pts[lead.pts.length - 1], trail: trail.pts[trail.pts.length - 1] }, top: -S.h },
    };
  }

  // ------------------------------------------------------------------ the frame: layers -> light -> composite
  C.draw = function (ctx, id, x, y, u, o = {}) {
    if (C.ALIAS[id]) id = C.ALIAS[id];
    const S = C.SPECS[id]; if (!S) throw new Error('cast: unknown ' + id);
    // crisp under a scaled transform: re-raster at the true pixel size in screen space
    const m = ctx.getTransform(), k = Math.hypot(m.a, m.b);
    if (Math.abs(k - 1) > 1e-3 || Math.abs(m.b) > 1e-6 || Math.abs(m.e) > 1e-6 || Math.abs(m.f) > 1e-6 || m.a < 0) {
      const p = m.transformPoint(new DOMPoint(x, y));
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      const r = C.draw(ctx, id, p.x, p.y, u * k, Object.assign({}, o, { shadowScale: k }));
      ctx.restore();
      const inv = m.inverse(), back = q => { const z = inv.transformPoint(new DOMPoint(q[0], q[1])); return [z.x, z.y]; };
      const hh = back(r.head);
      return { head: [hh[0], hh[1], r.head[2] / k], hands: { lead: back(r.hands.lead), trail: back(r.hands.trail) }, top: back([0, r.top])[1] };
    }
    const view = o.view || 'front', s = TURN[view] ?? (typeof view === 'number' ? view : 0), dir = o.dir || 1;
    const oo = Object.assign({ s, dir, pose: 'stand', expr: 'neutral' }, o, { s, dir });
    const R = (S.kind === 'biped' ? biped : S.build)(S, oo);
    const bw = Math.ceil(u * (S.box ? S.box[0] : 1.8)), bh = Math.ceil(u * (S.box ? S.box[1] : 1.62));
    const ox = bw / 2, oy = Math.ceil(u * (S.box ? S.box[2] : 1.42)) - (o.seated ? Math.round(S.legLen * u) : 0);
    // crop the buffer to the visible part of the target canvas (+ margin)
    const CW = ctx.canvas.width, CH = ctx.canvas.height, mg = 8;
    const sx0 = Math.max(Math.round(x - ox), -mg), sy0 = Math.max(Math.round(y - oy), -mg);
    const sx1 = Math.min(Math.round(x - ox) + bw, CW + mg), sy1 = Math.min(Math.round(y - oy) + bh, CH + mg);
    if (sx1 <= sx0 || sy1 <= sy0) return { head: [x, y, 0], hands: { lead: [x, y], trail: [x, y] }, top: y };
    const W = sx1 - sx0, Hh = sy1 - sy0, lox = x - sx0, loy = y - sy0;
    const light = Object.assign({}, C.LIGHT.board, o.light || {});
    const OUT = buf('out', W, Hh);
    for (const name of ['back', 'body', 'front']) {
      const Lb = buf('L', W, Hh), c = Lb.ctx;
      c.setTransform(u, 0, 0, u, lox, loy); if (o.seated) c.translate(0, S.legLen);
      R.layers[name](c);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const lr = S.limbRim ?? 0.75;
      lightLayer(Lb, name === 'back' ? Object.assign({}, light, { rimA: light.rimA * 0.55 * lr, shadeA: light.shadeA * 1.4 }) : name === 'front' ? Object.assign({}, light, { rimA: light.rimA * lr }) : light, u, S.lw || 0.0075);
      OUT.ctx.drawImage(Lb.c, 0, 0);
    }
    if (o.fog) { OUT.ctx.globalCompositeOperation = 'source-atop'; OUT.ctx.fillStyle = K.rgba(o.fog[0], o.fog[1]); OUT.ctx.fillRect(0, 0, W, Hh); OUT.ctx.globalCompositeOperation = 'source-over'; }
    if (o.shadow && !o.seated) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = K.rgba(o.shadowColor || '#3c2a52', o.shadow); K.ellipse(ctx, x, y, u * (S.shadowW || 0.16), u * 0.022); ctx.fill(); ctx.restore(); }
    ctx.drawImage(OUT.c, sx0, sy0);
    const so = o.seated ? S.legLen : 0, hi = R.info.head, hx = x + hi[0] * u, hy = y + (hi[1] + so) * u, hr = hi[2] * u;
    const ex = (o.extras || C.EXPR[o.expr]?.extras || []);
    for (const e of ex) K.char.extra(ctx, hx, hy - hr * 0.2, hr * (S.extraK || 1.0), e, o.t || 0, { ink: '#24161a' });
    const map = p => [x + p[0] * u, y + (p[1] + so) * u];
    return { head: [hx, hy, hr], hands: { lead: map(R.info.hands.lead), trail: map(R.info.hands.trail) }, top: y + (R.info.top + so) * u };
  };

  C.SPECS = {};
  C.ALIAS = {};
  C.define = (id, spec) => { C.SPECS[id] = spec; };
})(typeof window !== 'undefined' ? window : globalThis);
