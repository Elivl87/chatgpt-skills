/* Diez Mil Puntos art kit · cast: the character CANDIDATES (2026-10-15), drawn 100 % in Canvas 2D in the v2 style.
   Board + guide: art/characters/candidates/CANDIDATES.md.

   K.cast.draw(ctx, id, x, y, u, o) -> info { head:[x,y,r], hands:{lead,trail}, top }
     id   'leo' | 'mila' | 'max' | 'lia' | 'paz' | 'tono' | 'chispa' | 'punto'
     x,y  ground point between the feet (o.seated: the seat point under the hips)
     u    px per height unit (1 unit = a reference adult; each character has its own height in units, see SPECS.h)
     o    { view: 'front' | 'q' (3/4) | 'side', dir: 1 faces screen-right / -1 left, pose, expr, t, look:[x,y],
            blink, talk (0..1), seated, light: K.cast.LIGHT.golden | {...}, fog:[colour,k], extras:[..],
            headTurn (-1..1 extra head yaw: look back over the shoulder), tilt (head roll), shadow (contact alpha) }
     poses: stand, point, shrug, drive, crossed, fist, wave, cheer, hips, palm
     exprs: neutral, happy, surprised, grumpy, worried, smug (+ annoyed, curious, talk)
   Construction: flat fills with the warm ink line, drawn in three layers (far limbs / body / near limbs). Each layer
   gets the scene light the kit way: a flat shade crescent on the side away from the key and a rim on the side toward
   it (silhouette minus itself shifted), then the gouache texture. Arms are 2-bone IK in the screen plane with a pole;
   the face slides with the turn (front 0, 3/4 0.55, side 1). Deterministic: time only from o.t. */
(function (root) {
  const K = root.K;
  const C = K.cast = {};
  const INK = '#2a1a1e';
  C.INK = INK;
  C.LIGHT = {
    golden: { ang: -0.55, rim: '#ffd88f', rimA: 0.95, rimW: 0.010, shade: '#3c2a52', shadeA: 0.30, shadeW: 0.05, tex: 0.22 },
    board: { ang: -0.75, rim: '#fff1d2', rimA: 0.85, rimW: 0.008, shade: '#4a3560', shadeA: 0.22, shadeW: 0.045, tex: 0.2 },
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

  // light one layer in place: shade crescent (far side), rim (light side), texture
  function lightLayer(L, light, u) {
    const w = L.w, h = L.h, dx = Math.cos(light.ang), dy = Math.sin(light.ang), T = buf('tmp', w, h), t = T.ctx;
    if (light.shadeA > 0) {
      const sh = light.shadeW * u;
      t.drawImage(L.c, 0, 0); t.globalCompositeOperation = 'source-in'; t.fillStyle = light.shade; t.fillRect(0, 0, w, h);
      t.globalCompositeOperation = 'destination-out'; t.drawImage(L.c, dx * sh, dy * sh);
      L.ctx.globalCompositeOperation = 'source-atop'; L.ctx.globalAlpha = light.shadeA; L.ctx.drawImage(T.c, 0, 0);
      L.ctx.globalAlpha = 1; L.ctx.globalCompositeOperation = 'source-over';
    }
    if (light.rimA > 0) {
      const rw = Math.max(1.2, light.rimW * u);
      t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, w, h);
      const off = (light.rimInset ?? 0.011) * u;   // the rim sits just inside the ink line, never on it
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
  // filled shapes with ONE outline around their union: ink strokes first, then the fills
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
  function partial(pts, f) { // the polyline cut at fraction f of its length
    let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
    let rem = L * f; const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) { if (rem >= seg[i - 1]) { out.push(pts[i]); rem -= seg[i - 1]; } else { const k = rem / seg[i - 1]; out.push([K.lerp(pts[i - 1][0], pts[i][0], k), K.lerp(pts[i - 1][1], pts[i][1], k)]); break; } }
    return out;
  }
  C.helpers = { path, union, shape, noodle, partial, INK };

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

  // ------------------------------------------------------------------ poses (arm targets in arm-lengths from the shoulder)
  // f: front view [out, up], sd: side view [forward, up]; pf / ps: elbow pole for each view; hand kind
  const A = (f, sd, hand = 'mitt', pf = [1, -0.6], ps = [-1, -0.4]) => ({ f, sd, hand, pf, ps });
  C.POSES = {
    stand:   { lead: A([0.13, -0.96], [0.06, -0.97]), trail: A([0.13, -0.96], [0.0, -0.97]) },
    point:   { lead: A([0.97, 0.14], [0.97, 0.16], 'point', [0, -1], [0, -1]), trail: A([0.3, -0.55], [-0.15, -0.6], 'fist', [1, 0.4], [-1, 0.2]) },
    shrug:   { lead: A([0.62, -0.06], [0.5, -0.05], 'palm', [0.5, -1], [-0.4, -1]), trail: A([0.62, -0.06], [0.35, -0.05], 'palm', [0.5, -1], [-0.4, -1]), lift: 0.018, tilt: 0.12 },
    drive:   { lead: A([0.3, -0.42], [0.86, -0.34], 'mitt', [1, -0.8], [0, -1]), trail: A([0.3, -0.42], [0.8, -0.34], 'mitt', [1, -0.8], [0, -1]) },
    crossed: { lead: A([-0.42, -0.42], [0.28, -0.45], 'mitt', [1, -1], [0, -1]), trail: A([-0.42, -0.36], [0.34, -0.38], 'mitt', [1, -1], [0, -1]), lift: 0.008 },
    fist:    { lead: A([0.38, 0.5], [0.45, 0.45], 'fist', [1, -1], [-0.5, -1]), trail: A([0.13, -0.96], [0.0, -0.97]) },
    wave:    { lead: A([0.42, 0.88], [0.3, 0.9], 'palm', [1, -0.2], [0.3, -1]), trail: A([0.13, -0.96], [0.0, -0.97]) },
    cheer:   { lead: A([0.42, 0.9], [0.25, 0.95], 'palm', [1, 0], [-1, 0]), trail: A([0.42, 0.9], [0.15, 0.95], 'palm', [1, 0], [-1, 0]) },
    hips:    { lead: A([0.3, -0.55], [-0.1, -0.6], 'fist', [1, 0.3], [-1, 0.2]), trail: A([0.3, -0.55], [-0.15, -0.6], 'fist', [1, 0.3], [-1, 0.2]) },
    palm:    { lead: A([0.6, -0.22], [0.6, -0.2], 'palm', [0.4, -1], [-0.2, -1]), trail: A([0.13, -0.96], [0.0, -0.97]) },
  };

  // ------------------------------------------------------------------ expressions
  // lid 0 open .. 1 shut, low = lower lid, tilt +angry / -worried, eye scale, pupil scale, mouth kind, extras
  C.EXPR = {
    neutral:   { lid: 0.12, mouth: 'smile' },
    happy:     { lid: 0.0, low: 0.12, mouth: 'grin', head: -0.06, brow: -0.016, noBias: 1, look: [0, -0.35] },
    surprised: { lid: 0.0, eye: 1.2, pupil: 0.62, mouth: 'o', brow: -0.022, noBias: 1, lift: -0.006 },
    grumpy:    { lid: 0.42, tilt: 0.45, mouth: 'frown', brow: 0.01, browTilt: 1, noBias: 0.6 },
    annoyed:   { lid: 0.42, tilt: 0.3, mouth: 'flat', browTilt: 0.7 },
    worried:   { lid: 0.22, tilt: -0.4, mouth: 'wobble', pupil: 0.85, brow: -0.012, browTilt: -1, sweat: 1 },
    smug:      { lid: 0.55, low: 0.18, mouth: 'smirk', look: [0.75, 0], browTilt: 0.2, browUp: 1 },
    curious:   { lid: 0.02, eye: 1.08, mouth: 'smallo', look: [0.4, -0.5], brow: -0.016, noBias: 0.7 },
    talk:      { lid: 0.12, mouth: 'talk' },
  };
  C.EXPRESSIONS = ['neutral', 'happy', 'surprised', 'grumpy', 'worried', 'smug'];

  // ------------------------------------------------------------------ the face (head-local units, origin = head centre)
  // H: { cx, cy, hw, hh, s, dir, lw, skin, F (spec.face), E (expr), t, blink, talk, look }
  function eyeShape(c, x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, Math.max(1e-4, rx), Math.max(1e-4, ry), 0, 0, K.TAU); }
  function drawEye(c, H, ex, ey, rr, side, far) {
    const F = H.F, E = H.E, lw = H.lw;
    const k = E.eye || 1, rx = rr * k * (1 - 0.32 * H.s * (far ? 1.4 : 0.6)), ry = rr * k;
    let lid = K.clamp((E.lid ?? 0.1) + (F.lidBias || 0) * (1 - (E.noBias || 0)));
    if (H.blink > 0.5) lid = 1;
    const low = E.low || 0, m = -side * (E.tilt || 0); // lid slope: angry -> inner corner down
    const look = H.look, inner = -side;
    if (F.eyes === 'googly') {
      // white ball with ink outline
      eyeShape(c, ex, ey, rx, ry); c.fillStyle = '#fbf7ee'; c.fill(); c.lineWidth = lw * 0.8; c.strokeStyle = INK; c.stroke();
      // pupil (small, not quite agreeing)
      const pr = rr * (F.pupil || 0.36) * (E.pupil || 1) * (far ? 0.92 : 1);
      const px = ex + (look[0] * 0.42 + (F.goofy || 0) * side * 0.12) * rx + H.dir * H.s * rx * 0.25, py = ey + (look[1] * 0.42 + 0.05 + K.clamp(lid - 0.25) * 0.55) * ry;
      c.save(); eyeShape(c, ex, ey, rx, ry); c.clip();
      c.fillStyle = F.pupilColor || INK; K.circle(c, px, py, pr); c.fill();
      if (F.catch) { c.fillStyle = '#ffffff'; K.circle(c, px - pr * 0.35, py - pr * 0.4, pr * F.catch); c.fill(); }
      // lids (skin)
      c.fillStyle = H.lidColor || H.skin;
      if (lid > 0.01) { const yl = ey - ry + lid * 2 * ry; c.beginPath(); c.moveTo(ex - rx * 1.5, yl - m * rx * 1.5); c.lineTo(ex + rx * 1.5, yl + m * rx * 1.5); c.lineTo(ex + rx * 1.5, ey - ry * 2); c.lineTo(ex - rx * 1.5, ey - ry * 2); c.closePath(); c.fill();
        c.strokeStyle = INK; c.lineWidth = lw * 1.0; c.beginPath(); c.moveTo(ex - rx * 1.5, yl - m * rx * 1.5); c.lineTo(ex + rx * 1.5, yl + m * rx * 1.5); c.stroke(); }
      if (low > 0.01) { const yl = ey + ry - low * 2 * ry; c.fillStyle = H.lidColor || H.skin; c.beginPath(); c.moveTo(ex - rx * 1.5, yl); c.quadraticCurveTo(ex, yl - ry * 0.25, ex + rx * 1.5, yl); c.lineTo(ex + rx * 1.5, ey + ry * 2); c.lineTo(ex - rx * 1.5, ey + ry * 2); c.closePath(); c.fill();
        c.strokeStyle = INK; c.lineWidth = lw * 0.9; c.beginPath(); c.moveTo(ex - rx * 1.5, yl); c.quadraticCurveTo(ex, yl - ry * 0.25, ex + rx * 1.5, yl); c.stroke(); }
      c.restore();
      eyeShape(c, ex, ey, rx, ry); c.lineWidth = lw * 0.8; c.strokeStyle = INK; c.stroke();
      if (F.lashes) { // two flicks at the outer corner of the upper lid
        const yl = ey - ry + Math.max(lid, 0.05) * 2 * ry, out = side; c.strokeStyle = INK; c.lineWidth = lw * 0.9; c.lineCap = 'round';
        const ox = ex + out * rx * 0.86, oy = lid > 0.05 ? yl + m * rx * out * 0.86 : ey - ry * 0.55;
        for (let i = 0; i < (far ? 1 : 2); i++) { const a = -0.5 - i * 0.55; c.beginPath(); c.moveTo(ox - out * rx * 0.1 * i, oy - ry * 0.05 * i); c.quadraticCurveTo(ox + out * rx * 0.25, oy - ry * (0.15 + 0.12 * i), ox + out * rx * (0.42 - 0.08 * i), oy - ry * (0.38 + 0.22 * i)); c.stroke(); void a; }
      }
    } else { // 'dot': ink oval with a catchlight; lids are skin over it; happy = arcs
      const happy = E.mouth === 'grin';
      c.fillStyle = INK; c.strokeStyle = INK; c.lineCap = 'round';
      const px = ex + look[0] * rx * 0.35, py = ey + look[1] * ry * 0.3, sc = (E.eye || 1);
      if (H.blink > 0.5 || lid > 0.92) { c.lineWidth = lw * 2.2; c.beginPath(); c.moveTo(ex - rx * 1.1, ey + ry * 0.2); c.quadraticCurveTo(ex, ey + ry * 0.55, ex + rx * 1.1, ey + ry * 0.2); c.stroke(); return; }
      if (happy) { c.lineWidth = lw * 2.4; c.beginPath(); c.moveTo(ex - rx * 1.05, ey + ry * 0.25); c.quadraticCurveTo(ex, ey - ry * 1.0, ex + rx * 1.05, ey + ry * 0.25); c.stroke(); return; }
      if (lid < 0.2 && !E.tilt) lid = 0;
      c.save(); if (lid > 0.02 || low > 0.02) { c.beginPath(); const yl = py - ry * sc + lid * 2 * ry * sc, yb = py + ry * sc - low * 2 * ry * sc;
        c.moveTo(px - rx * 2, yl - m * rx * 2); c.lineTo(px + rx * 2, yl + m * rx * 2); c.lineTo(px + rx * 2, yb); c.lineTo(px - rx * 2, yb); c.closePath(); c.clip(); }
      eyeShape(c, px, py, rx * sc, ry * sc); c.fill(); c.restore();
      if (lid > 0.02) { const yl = py - ry * sc + lid * 2 * ry * sc; c.lineWidth = lw * 1.8; c.beginPath(); c.moveTo(px - rx * 1.25, yl - m * rx * 1.25); c.lineTo(px + rx * 1.25, yl + m * rx * 1.25); c.stroke(); }
      if (lid < 0.6) { c.fillStyle = '#ffffff'; K.circle(c, px - rx * 0.32 * sc + look[0] * rx * 0.1, py - ry * 0.38 * sc + Math.max(0, lid) * ry * 0.9, rx * 0.34 * sc); c.fill(); }
      if (F.lashes) { c.lineWidth = lw * 1.4; const ox = px + side * rx * 0.9 * sc, oy = py - ry * 0.55 * sc + lid * ry; c.beginPath(); c.moveTo(ox, oy); c.quadraticCurveTo(ox + side * rx * 0.4, oy - ry * 0.15, ox + side * rx * 0.6, oy - ry * 0.55); c.stroke(); }
    }
  }
  function drawMouth(c, H, mx, my, mw) {
    const E = H.E, lw = H.lw, kind = H.talk > 0.05 ? 'talk' : E.mouth, sx = 1 - 0.45 * H.s;
    const lip = H.F.lip || INK;
    c.save(); c.translate(mx, my); c.scale(sx, 1); c.lineCap = 'round'; c.lineJoin = 'round';
    const w = mw, st = Math.max(lw * 1.1, w * 0.13);
    c.strokeStyle = lip; c.fillStyle = INK; c.lineWidth = st;
    const open = (o, wide) => { // filled open mouth with teeth and tongue
      c.beginPath(); c.moveTo(-w * wide, -w * 0.05); c.quadraticCurveTo(0, w * 0.08, w * wide, -w * 0.05); c.quadraticCurveTo(w * wide * 0.85, w * (0.25 + o), 0, w * (0.3 + o)); c.quadraticCurveTo(-w * wide * 0.85, w * (0.25 + o), -w * wide, -w * 0.05); c.closePath();
      c.fillStyle = '#3a1520'; c.fill(); c.save(); c.clip();
      c.fillStyle = '#fbf6ec'; c.fillRect(-w * 1.2, -w * 0.2, w * 2.4, w * (0.17 + o * 0.25));
      c.fillStyle = '#e0707a'; K.ellipse(c, w * 0.05, w * (0.32 + o), w * wide * 0.55, w * (0.17 + o * 0.4)); c.fill(); c.restore();
      c.lineWidth = lw * 1.0; c.strokeStyle = INK; c.beginPath(); c.moveTo(-w * wide, -w * 0.05); c.quadraticCurveTo(0, w * 0.08, w * wide, -w * 0.05); c.quadraticCurveTo(w * wide * 0.85, w * (0.25 + o), 0, w * (0.3 + o)); c.quadraticCurveTo(-w * wide * 0.85, w * (0.25 + o), -w * wide, -w * 0.05); c.closePath(); c.stroke();
    };
    switch (kind) {
      case 'smile': c.beginPath(); c.moveTo(-w * 0.55, -w * 0.08); c.quadraticCurveTo(0, w * 0.32, w * 0.55, -w * 0.08); c.stroke(); break;
      case 'grin': open(H.F.grinOpen ?? 0.12, H.F.grinW ?? 0.7); break;
      case 'talk': open(0.04 + H.talk * 0.14, 0.5); break;
      case 'o': c.fillStyle = '#3a1520'; K.ellipse(c, 0, w * 0.08, w * 0.2, w * 0.27); c.fill(); c.lineWidth = lw * 1.0; c.strokeStyle = INK; c.stroke(); break;
      case 'smallo': c.fillStyle = '#3a1520'; K.ellipse(c, w * 0.05, w * 0.05, w * 0.12, w * 0.15); c.fill(); c.lineWidth = lw * 1.4; c.strokeStyle = INK; c.stroke(); break;
      case 'frown': c.beginPath(); c.moveTo(-w * 0.45, w * 0.12); c.quadraticCurveTo(0, -w * 0.2, w * 0.45, w * 0.12); c.stroke(); break;
      case 'flat': c.beginPath(); c.moveTo(-w * 0.4, w * 0.02); c.lineTo(w * 0.4, -w * 0.02); c.stroke(); break;
      case 'wobble': c.beginPath(); c.moveTo(-w * 0.45, 0); for (let i = 1; i <= 6; i++) c.lineTo(-w * 0.45 + i * w * 0.15, (i % 2 ? -1 : 1) * w * 0.07); c.stroke(); break;
      case 'smirk': c.beginPath(); c.moveTo(-w * 0.42, w * 0.04); c.quadraticCurveTo(w * 0.1, w * 0.16, w * 0.5, -w * 0.16); c.stroke(); break;
    }
    c.restore();
  }
  function drawBrows(c, H, xs, ey, rr) {
    const F = H.F, E = H.E; if (!F.brows) return;
    c.strokeStyle = F.browColor || INK; c.lineCap = 'round'; c.lineWidth = F.brows;
    const bt = (E.browTilt || 0), up = (E.brow || 0) + (F.browY || 0);
    for (const [x, side, far] of xs) {
      const by = ey - rr * (F.browGap || 1.55) + up, w = rr * (F.browW || 0.9) * (far ? 0.75 : 1), inner = -side;
      let yi = by + bt * rr * 0.32, yo = by - bt * rr * 0.12;
      if (E.browUp && side === xs[0][1]) { yi -= rr * 0.25; yo -= rr * 0.35; }
      c.beginPath(); c.moveTo(x + inner * w * 0.2 - side * 0 + inner * w * 0.5, yi); c.quadraticCurveTo(x, (yi + yo) / 2 - rr * 0.12, x - inner * w * 0.75, yo); c.stroke();
    }
  }
  C.face = function (c, H) {
    const F = H.F, E = H.E, s = H.s, dir = H.dir, hw = H.hw;
    const turn = K.clamp(s + (H.headTurn || 0) * dir * 0.0), fdir = H.faceDir;
    const fx = H.cx + fdir * H.fs * hw * (F.turnK ?? 0.62) + H.look[0] * hw * 0.1, fy = H.cy + (E.lift || 0) + H.look[1] * hw * 0.06;
    const rr = F.eyeR, sep = F.eyeSep * (1 - 0.38 * H.fs);
    const ey = fy + F.eyeY;
    const eyes = [];
    if (H.fs > 0.88) eyes.push([fx + fdir * F.eyeSep * 0.25, -fdir, false]);
    else { eyes.push([fx - sep, -1, fdir > 0 ? false : H.fs > 0.2]); eyes.push([fx + sep, 1, fdir > 0 ? H.fs > 0.2 : false]); }
    // nose behind the eyes in 3/4 (googly faces have a small nose bump under the eyes)
    if (F.nose) {
      const nx = fx + fdir * H.fs * hw * 0.42, ny = ey + F.noseY, nr = F.nose;
      c.fillStyle = H.skin; c.strokeStyle = INK; c.lineWidth = H.lw * 0.9;
      K.ellipse(c, nx + fdir * H.fs * nr * 0.7, ny, nr * (1 + 0.35 * H.fs), nr * 0.8); c.fill(); c.stroke();
    }
    for (const [x, side, far] of eyes.sort((a, b) => (a[2] ? -1 : 1) - (b[2] ? -1 : 1))) drawEye(c, H, x, ey, rr, side, far);
    drawBrows(c, H, eyes, ey, rr);
    if (F.glasses) F.glasses(c, H, eyes, ey, rr);
    if (F.blush) { c.fillStyle = K.rgba(F.blushColor || '#ff7a6a', F.blush); for (const [x, side, far] of eyes) if (!far) { K.ellipse(c, x + side * rr * 0.45, ey + rr * 1.35, rr * 0.55, rr * 0.3); c.fill(); } }
    const mx = fx + fdir * H.fs * hw * 0.12, my = fy + F.mouthY;
    drawMouth(c, H, mx, my, F.mouthW);
    if (E.sweat) { const sx = H.cx - fdir * hw * 0.9, sy = ey - rr * 0.8; c.fillStyle = '#9fd3f0'; c.strokeStyle = INK; c.lineWidth = H.lw;
      c.beginPath(); c.moveTo(sx, sy - rr * 0.9); c.quadraticCurveTo(sx + rr * 0.5, sy, sx, sy + rr * 0.35); c.quadraticCurveTo(sx - rr * 0.5, sy, sx, sy - rr * 0.9); c.fill(); c.stroke(); }
    return { fx, fy, ey, eyes };
  };

  // ------------------------------------------------------------------ hands, boots
  function hand(c, P, dirv, kind, r, color, lw) {
    const [x, y] = P;
    c.fillStyle = color; c.strokeStyle = INK; c.lineWidth = lw * 2; c.lineJoin = 'round';
    if (kind === 'point') {
      const fx = x + dirv[0] * r * 1.55, fy = y + dirv[1] * r * 1.55;
      noodle(c, [[x, y], [fx, fy]], r * 0.62, color, lw);
      K.circle(c, x, y, r); c.lineWidth = lw * 2; c.stroke(); c.fill();
      c.lineCap = 'round'; c.strokeStyle = color; c.lineWidth = r * 0.62; path(c, [[x + dirv[0] * r * 0.5, y + dirv[1] * r * 0.5], [fx, fy]]); c.stroke();
    } else if (kind === 'palm') {
      K.ellipse(c, x, y, r * 1.1, r * 0.82, Math.atan2(dirv[1], dirv[0])); c.stroke(); c.fill();
      const tx = x - dirv[1] * r * 0.9, ty = y + dirv[0] * r * 0.9 - r * 0.2;
      c.lineWidth = lw * 2; K.circle(c, tx, ty - r * 0.25, r * 0.38); c.stroke(); c.fill();
    } else if (kind === 'fist') {
      K.circle(c, x, y, r * 0.95); c.stroke(); c.fill();
      c.strokeStyle = K.rgba(INK, 0.7); c.lineWidth = lw; c.beginPath(); c.arc(x, y, r * 0.5, -0.4, 1.2); c.stroke();
    } else { K.circle(c, x, y, r); c.stroke(); c.fill(); }
  }

  // ------------------------------------------------------------------ the biped (duos)
  function biped(S, o) {
    const s = o.s, dir = o.dir, t = o.t || 0, lw = S.lw || 0.0075, P = C.POSES[o.pose] || C.POSES.stand;
    const cosT = Math.cos(s * Math.PI / 2), sinT = Math.sin(s * Math.PI / 2);
    const breathe = Math.sin(t * 2.1 + (S.phase || 0)) * 0.0035, lift = (P.lift || 0);
    const hipY = -S.legLen, shY = -S.shoulder - breathe - lift, legsOn = !o.seated;
    const Ttop = -S.torso.top - breathe - lift * 0.5, Tbot = -S.torso.bot;
    const wT = K.lerp(S.torso.wTop, S.torso.dTop ?? S.torso.wTop * 0.7, s), wB = K.lerp(S.torso.wBot, S.torso.dBot ?? S.torso.wBot * 0.75, s);
    const tcx = dir * s * (S.torso.lean || 0);
    // head
    const hw = S.head.hw, hh = S.head.hh;
    const headTurn = o.headTurn || 0;                                 // extra head yaw (look back over the shoulder)
    const fsRaw = s + headTurn;                                       // face turn, signed (negative = toward the other side)
    const faceDir = fsRaw >= 0 ? dir : -dir, fs = Math.min(1, Math.abs(fsRaw));
    const E = Object.assign({}, C.EXPR[o.expr] || C.EXPR.neutral);
    const tilt = (o.tilt || 0) + (P.tilt || 0) * dir + (E.head || 0) * dir;
    const hcx = tcx + dir * s * (S.head.lean || 0) * 0.5, hcy = -S.head.cy - breathe * 1.4 - lift;
    const H = { cx: 0, cy: 0, hw, hh, s, fs, faceDir, dir, lw, skin: S.skin, lidColor: S.lidColor, F: S.face, E, t, blink: o.blink || 0, talk: o.talk || 0,
      look: o.look || E.look || [0, 0], headTurn };
    const sh = sg => [tcx + sg * S.shoulderW * cosT + dir * s * (S.shoulderFwd || 0), shY];
    const hipP = sg => [sg * S.hipW * cosT, hipY];
    const L1 = S.arm.upper, L2 = S.arm.fore, LA = L1 + L2;
    const armFor = (sg, a) => {
      const S0 = sh(sg), wig = a.wiggle ? Math.sin(t * 9) * 0.08 : 0;
      const tf = [a.f[0] * sg * LA, -a.f[1] * LA], ts = [a.sd[0] * dir * LA, -a.sd[1] * LA];
      let T = [S0[0] + K.lerp(tf[0], ts[0], s), S0[1] + K.lerp(tf[1], ts[1], s)];
      if (o.pose === 'fist') T = [T[0] + Math.sin(t * 22) * 0.012, T[1] + Math.cos(t * 22) * 0.008];
      if (o.pose === 'wave') T = [T[0] + Math.sin(t * 8) * 0.04 * sg, T[1]];
      void wig;
      const pole = [K.lerp(a.pf[0] * sg, a.ps[0] * dir, s), K.lerp(-a.pf[1], -a.ps[1], s)];
      const j = ik(S0, T, L1, L2, pole);
      const dv = [j[2][0] - j[1][0], j[2][1] - j[1][1]], dl = Math.hypot(dv[0], dv[1]) || 1;
      return { j, hand: a.hand, dv: [dv[0] / dl, dv[1] / dl] };
    };
    const lead = armFor(dir, P.lead), trail = armFor(-dir, P.trail);
    const drawArm = (c, A) => {
      const pts = A.j, ar = S.arm;
      noodle(c, pts, ar.w, ar.skinPart ? S.skin : ar.sleeve, lw);
      if (ar.skinPart) { const p = partial(pts, ar.sleeveTo); noodle(c, p, ar.sleeveW || ar.w * 1.25, ar.sleeve, lw); if (ar.cuff) { c.fillStyle = ar.cuff; } }
      if (ar.stripe) { c.lineCap = 'round'; path(c, partial(pts, 0.86)); c.strokeStyle = ar.stripe; c.lineWidth = ar.w * 0.22; c.stroke(); }
      if (!ar.skinPart && ar.cuff) { const p = partial(pts, 0.94), q = p[p.length - 1]; c.fillStyle = ar.cuff; c.strokeStyle = INK; c.lineWidth = lw * 2; K.circle(c, q[0], q[1], ar.w * 0.62); c.stroke(); c.fill(); }
      hand(c, pts[2], A.dv, A.hand, ar.hand, S.handColor || S.skin, lw);
    };
    const drawLeg = (c, sg) => {
      const hp = hipP(sg), fx = hp[0] + (S.legSplay || 0) * sg * cosT, foot = [fx, -0.0];
      const ankle = [fx, -(S.boot.h * 0.5)];
      noodle(c, [hp, ankle], S.legW, S.legColor, lw);
      if (S.legCuff) { c.fillStyle = S.legCuff; }
      // boot / shoe: shaft + foot (one outline)
      const b = S.boot, bw = b.w, toe = b.toe * s, back = b.back * s;
      const shaft = () => K.rrect(c, fx - bw, -b.h, bw * 2, b.h - b.sole * 0.5, [bw * 0.35, bw * 0.35, 0, 0]);
      const footP = () => { const x0 = fx - bw * (1 + 0.1 * (1 - s)) - (dir > 0 ? back : toe), x1 = fx + bw * (1 + 0.1 * (1 - s)) + (dir > 0 ? toe : back); K.rrect(c, x0, -b.foot, x1 - x0, b.foot, [b.foot * 0.6, b.foot * 0.6, b.sole * 0.6, b.sole * 0.6]); };
      union(c, b.h > b.foot * 1.2 ? [shaft, footP] : [footP], b.color, lw);
      // sole
      c.save(); footP(); c.clip(); c.fillStyle = b.soleColor || K.shade(b.color, -0.35); c.fillRect(fx - 1, -b.sole, 2, b.sole + 0.01); c.restore();
      footP(); c.strokeStyle = INK; c.lineWidth = lw * 1.6; c.stroke();
      if (b.lip) { c.fillStyle = K.shade(b.color, 0.12); c.strokeStyle = INK; c.lineWidth = lw * 1.4; K.rrect(c, fx - bw * 1.08, -b.h - 0.004, bw * 2.16, 0.022, 0.01); c.fill(); c.stroke(); }
      if (b.laces) { c.strokeStyle = K.rgba(INK, 0.6); c.lineWidth = lw; for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(fx - bw * 0.5 + dir * s * bw * 0.6, -b.foot * (0.75 - i * 0.22)); c.lineTo(fx + bw * 0.5 + dir * s * bw * 0.6, -b.foot * (0.75 - i * 0.22)); c.stroke(); } }
    };
    const torsoPath = (c) => {
      const r = Math.min(wT * 0.75, 0.05), rb = Math.min(wB * 0.3, 0.03);
      c.beginPath(); c.moveTo(tcx - wT + r, Ttop); c.lineTo(tcx + wT - r, Ttop); c.quadraticCurveTo(tcx + wT, Ttop, tcx + wT, Ttop + r);
      c.quadraticCurveTo(tcx + (wT + wB) / 2 + (S.torso.belly || 0) * dir * s, (Ttop + Tbot) / 2, tcx + wB, Tbot - rb); c.quadraticCurveTo(tcx + wB, Tbot, tcx + wB - rb, Tbot);
      c.lineTo(tcx - wB + rb, Tbot); c.quadraticCurveTo(tcx - wB, Tbot, tcx - wB, Tbot - rb);
      c.quadraticCurveTo(tcx - (wT + wB) / 2, (Ttop + Tbot) / 2, tcx - wT, Ttop + r); c.quadraticCurveTo(tcx - wT, Ttop, tcx - wT + r, Ttop); c.closePath();
    };
    const B = { s, dir, t, lw, tcx, Ttop, Tbot, wT, wB, shY, hipY, cosT, sinT, torsoPath, hcx, hcy, hw, hh, fs, faceDir, seated: !!o.seated, S };
    const headDraw = (c, layer) => {
      c.save(); c.translate(hcx, hcy + hh); c.rotate(tilt); c.translate(0, -hh);
      if (layer === 'back') { if (S.hairBack) S.hairBack(c, H, B); c.restore(); return; }
      // head shape
      const headPath = () => { if (S.head.kind === 'circle') K.circle(c, 0, 0, hw); else K.rrect(c, -hw, -hh, hw * 2, hh * 2 + (S.head.neck || 0), [hw, hw, hw * 0.6, hw * 0.6]); };
      if (S.ears) S.ears(c, H, B);
      if (S.head.noLine) { headPath(); c.fillStyle = S.skin; c.fill(); } else shape(c, headPath, S.skin, lw);
      if (S.hairFront) S.hairFront(c, H, B);
      const fi = C.face(c, H);
      if (S.hat) S.hat(c, H, B);
      if (S.headTop) S.headTop(c, H, B, fi);
      c.restore();
    };
    return {
      lead, trail, H, B,
      layers: {
        back(c) {
          if (S.head.kind !== 'circle') headDraw(c, 'back'); else headDraw(c, 'back');
          if (s > 0.05 || ['crossed'].includes(o.pose)) { if (s > 0.05) drawArm(c, lead); }
          if (legsOn && s > 0.05) drawLeg(c, dir);
        },
        body(c) {
          if (legsOn) { if (s <= 0.05) { drawLeg(c, -1); drawLeg(c, 1); } else drawLeg(c, -dir); }
          if (S.under) S.under(c, B);                                  // e.g. a skirt behind the torso
          if (!S.headOver) headDraw(c, 'front');
          shape(c, () => torsoPath(c), S.torso.color, lw);
          if (S.outfit) { c.save(); torsoPath(c); c.clip(); S.outfit(c, B); c.restore(); }
          if (S.outfitTop) S.outfitTop(c, B);
          if (S.collar) S.collar(c, B);
          if (S.headOver) headDraw(c, 'front');
        },
        front(c) {
          if (s <= 0.05) {
            const order = o.pose === 'crossed' ? [lead, trail] : [trail, lead];
            for (const A of order) drawArm(c, A);
          } else drawArm(c, trail);
          if (S.front) S.front(c, B);
        },
      },
      info: { head: [hcx, hcy, Math.max(hw, hh)], hands: { lead: lead.j[2], trail: trail.j[2] }, top: -S.h },
    };
  }

  // ------------------------------------------------------------------ the frame: layers -> light -> composite
  C.draw = function (ctx, id, x, y, u, o = {}) {
    const S = C.SPECS[id]; if (!S) throw new Error('cast: unknown ' + id);
    const view = o.view || 'front', s = TURN[view] ?? (typeof view === 'number' ? view : 0), dir = o.dir || 1;
    const oo = Object.assign({ s, dir, pose: 'stand', expr: 'neutral' }, o, { s, dir });
    const R = (S.kind === 'biped' ? biped : S.build)(S, oo);
    const bw = Math.ceil(u * (S.box ? S.box[0] : 1.8)), bh = Math.ceil(u * (S.box ? S.box[1] : 1.62));
    const ox = bw / 2, oy = Math.ceil(u * (S.box ? S.box[2] : 1.42)) - (o.seated ? Math.round(S.legLen * u) : 0);
    const light = Object.assign({}, C.LIGHT.board, o.light || {});
    const OUT = buf('out', bw, bh);
    for (const name of ['back', 'body', 'front']) {
      const Lb = buf('L', bw, bh), c = Lb.ctx;
      c.setTransform(u, 0, 0, u, ox, oy + (o.seated ? 0 : 0)); if (o.seated) c.translate(0, S.legLen);
      R.layers[name](c);
      c.setTransform(1, 0, 0, 1, 0, 0);
      if (name === 'back') { light._rimA = light.rimA; }
      const lr = S.limbRim ?? 0.75;
      lightLayer(Lb, name === 'back' ? Object.assign({}, light, { rimA: light.rimA * 0.55 * lr, shadeA: light.shadeA * 1.4 }) : name === 'front' ? Object.assign({}, light, { rimA: light.rimA * lr }) : light, u);
      OUT.ctx.drawImage(Lb.c, 0, 0);
    }
    if (o.fog) { OUT.ctx.globalCompositeOperation = 'source-atop'; OUT.ctx.fillStyle = K.rgba(o.fog[0], o.fog[1]); OUT.ctx.fillRect(0, 0, bw, bh); OUT.ctx.globalCompositeOperation = 'source-over'; }
    if (S.glow && o.glow !== 0) { const hy0 = y + (-S.head.cy + (o.seated ? S.legLen : 0)) * u; K.light.glow(ctx, x, hy0, S.head.hw * u * S.glow.r, S.glow.color, S.glow.a * (o.glow ?? 1), 'screen'); K.light.glow(ctx, x, hy0, S.head.hw * u * 1.4, '#ffe3a0', 0.35 * (o.glow ?? 1), 'lighter'); }
    if (o.shadow && !o.seated) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = K.rgba(o.shadowColor || '#3c2a52', o.shadow); K.ellipse(ctx, x, y, u * (S.shadowW || 0.16), u * 0.022); ctx.fill(); ctx.restore(); }
    ctx.drawImage(OUT.c, Math.round(x - ox), Math.round(y - oy));
    // extras in screen space around the head
    const hi = R.info.head, hx = x + hi[0] * u, hy = y + (hi[1] + (o.seated ? S.legLen : 0)) * u, hr = hi[2] * u;
    if (o.extras) for (const e of o.extras) K.char.extra(ctx, hx, hy - hr * 0.2, hr * (S.extraK || 1.0), e, o.t || 0, { ink: '#24161a' });
    const map = p => [x + p[0] * u, y + (p[1] + (o.seated ? S.legLen : 0)) * u];
    return { head: [hx, hy, hr], hands: { lead: map(R.info.hands.lead), trail: map(R.info.hands.trail) }, top: y + R.info.top * u };
  };

  C.SPECS = {};
  C.define = (id, spec) => { C.SPECS[id] = spec; };
})(typeof window !== 'undefined' ? window : globalThis);
