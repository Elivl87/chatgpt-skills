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
            drag (0..1 wind on hair / loose cloth), hatHit (0..1 impulse squashes the hat),
            hairFlop (0..1, Mila: the ponytail swings over the top of the head and lands on her face; 0 = normal) }
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
    backlit: { ang: -1.75, rim: '#ffd88f', rimA: 0.95, rimW: 0.014, shade: '#3c2a52', shadeA: 0.38, shadeW: 0.07, tex: 0.2 },
    night: { ang: -2.4, rim: '#9fb4ff', rimA: 0.85, rimW: 0.013, shade: '#0b1030', shadeA: 0.5, shadeW: 0.07, tex: 0.15 },
    noon: { ang: -1.57, rim: '#ffffff', rimA: 0.35, rimW: 0.008, shade: '#4a5068', shadeA: 0.2, shadeW: 0.05, tex: 0.18 },
    dusk: { ang: -1.25, rim: '#ffd9a0', rimA: 0.9, rimW: 0.012, shade: '#2a1838', shadeA: 0.3, shadeW: 0.05, tex: 0.2 },
  };
  // hand anchors in FRONT of the face / chest (visor, magnifier, chin, crossed arms, clasp, belly, lap, clipboard): in a
  // back view these hands are hidden by the head and torso, so the arm is drawn behind the body
  const FACE_FRONT = { visor: 1, lens: 1, chin: 1, chinTap: 1, crossL: 1, crossT: 1, chest: 1, belly: 1, lap: 1, write: 1, board: 1 };
  const TURN = { front: 0, q: 0.55, side: 1, back: 0, backq: 0.55, backside: 1 };

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

  // Light, detail pass (2026-10-15): the shade crescent (far side) and the texture are applied per layer, the rim ONCE on
  // the whole silhouette. Rules: the rim is a thin light edge INSIDE the ink line (it starts where the ink ends, never
  // over it), only on the side facing the light, never on internal edges (an arm over the torso), at most ~0.8x the ink
  // width; the shade crescent is capped (<= shadeMax units, so it never splits a beanie or a face in half); eyes are
  // masked out of shade, rim and grain (whites stay clean and fully open in every light).
  function maskOut(T, M) { if (M) { T.ctx.globalCompositeOperation = 'destination-out'; T.ctx.drawImage(M.c, 0, 0); } }
  function lightLayer(L, light, u, lw, M, SOL) {
    const w = L.w, h = L.h, dx = Math.cos(light.ang), dy = Math.sin(light.ang), T = buf('tmp', w, h), t = T.ctx;
    if (light.shadeA > 0) {
      const sh = Math.min(light.shadeW, light.shadeMax ?? 0.028) * u;
      t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, w, h);
      t.drawImage(L.c, 0, 0); t.globalCompositeOperation = 'source-in'; t.fillStyle = light.shade; t.fillRect(0, 0, w, h);
      t.globalCompositeOperation = 'destination-out'; t.drawImage(L.c, dx * sh, dy * sh);
      // clothes QC 2026-10-16: holes that are not real gaps in the form (the slot between the legs under Eli's apron skirt /
      // Mila's overall seat) count as solid for the shade test, so no shade patch appears on the hem over the leg gap
      if (SOL) t.drawImage(SOL.c, dx * sh, dy * sh);
      maskOut(T, M);
      L.ctx.globalCompositeOperation = 'source-atop'; L.ctx.globalAlpha = light.shadeA; L.ctx.drawImage(T.c, 0, 0);
      L.ctx.globalAlpha = 1; L.ctx.globalCompositeOperation = 'source-over';
    }
    if (light.tex > 0) {
      t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, w, h);
      const p = t.createPattern(noiseTile().c, 'repeat'); if (p.setTransform) p.setTransform(new DOMMatrix().scale(Math.max(0.6, u / 420)));
      t.fillStyle = p; t.fillRect(0, 0, w, h); t.globalCompositeOperation = 'destination-in'; t.drawImage(L.c, 0, 0); maskOut(T, M);
      L.ctx.globalCompositeOperation = 'soft-light'; L.ctx.globalAlpha = light.tex; L.ctx.drawImage(T.c, 0, 0);
      L.ctx.globalAlpha = 1; L.ctx.globalCompositeOperation = 'source-over';
    }
  }
  function rimLight(L, light, u, lw, M) {
    if (!(light.rimA > 0)) return;
    const w = L.w, h = L.h, dx = Math.cos(light.ang), dy = Math.sin(light.ang), T = buf('tmp', w, h), t = T.ctx;
    const ink = lw * u;          // the VISIBLE ink width in px (strokes are 2 lw wide, the fill covers their inner half)
    const off = light.rimInset != null ? light.rimInset * u : ink * 0.95;  // start where the ink ends (no gap, no overlap)
    const rw = Math.max(1.2, Math.min(light.rimW * u, light.rimMax ?? 9, ink * 0.75));
    t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, w, h);
    t.drawImage(L.c, -dx * off, -dy * off); t.globalCompositeOperation = 'source-in'; t.fillStyle = light.rim; t.fillRect(0, 0, w, h);
    t.globalCompositeOperation = 'destination-out'; t.drawImage(L.c, -dx * (rw + off), -dy * (rw + off));
    t.globalCompositeOperation = 'destination-in'; t.drawImage(L.c, 0, 0); maskOut(T, M);
    L.ctx.globalCompositeOperation = 'source-atop'; L.ctx.globalAlpha = Math.min(1, light.rimA * (light.rimK ?? 0.9)); L.ctx.drawImage(T.c, 0, 0);
    L.ctx.globalAlpha = 1; L.ctx.globalCompositeOperation = 'source-over';
  }
  C.lightLayer = lightLayer; C.rimLight = rimLight;
  // eyes drawn in the current layer register themselves here (with the canvas transform), to be masked from the light
  let EYES = null;
  let SOLIDC = null;   // the current layer's "solid" mask context (see lightLayer)
  // QC hook (faces audit): when root.__faceLog is an array, every C.draw on the visible canvas logs each eye in canvas
  // px ({ id, expr, view, eyes: [{ cx, cy, rx, ry, px, py, pr, cr, closed, lid }] }); nothing is logged otherwise
  let FACE = null;
  const toPx = (c, x, y) => { const m = c.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; };
  const scaleOf = c => { const m = c.getTransform(); return Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1; };
  // QC (Guardian body audit, only while __faceLog is on): the character's own pixels before compositing -> tight box in
  // canvas px + the share of each wardrobe colour family (hue classes) + vermilion (never allowed on them)
  // clothes QC (2026-10-16): + `pal` exact wardrobe-colour pixel counts (only when root.__clothesPal = { name: '#hex' } is
  // set, e.g. the clothes lab in flat light), and `thin`: pixels of the silhouette thinner than ~2.6 ink widths (a
  // morphological opening of the alpha mask) outside the head and hand zones = stray strokes, cords and stubs poking out
  function bodyStats(B, ox, oy, X) {
    const w = B.c.width, h = B.c.height, d = B.ctx.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1, n = 0; const cl = { yellow: 0, purple: 0, mustard: 0, green: 0, blue: 0, brown: 0, white: 0, vermilion: 0, pale: 0, red: 0 };
    const PAL = root.__clothesPal ? Object.entries(root.__clothesPal).map(([k, v]) => [k, parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)]) : null;
    const pal = PAL ? Object.fromEntries(PAL.map(q => [q[0], 0])) : null, palRaw = PAL ? Object.fromEntries(PAL.map(q => [q[0], 0])) : null, palY = PAL ? Object.fromEntries(PAL.map(q => [q[0], [1e9, -1e9]])) : null;
    const M = new Uint8Array(w * h), LB = PAL ? new Int8Array(w * h).fill(-1) : null;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; if (d[i + 3] < 110) continue;
      M[y * w + x] = 1;
      if (PAL && d[i + 3] > 250) for (let qi = 0; qi < PAL.length; qi++) { const q = PAL[qi], dr = d[i] - q[1], dg = d[i + 1] - q[2], db = d[i + 2] - q[3]; if (dr * dr + dg * dg + db * db < 60) { LB[y * w + x] = qi; palRaw[q[0]]++; break; } }
      n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), c = mx - mn;
      if (c < 0.16 && mx > 0.45) cl.pale = (cl.pale || 0) + 1;   // light neutral (the tee under night / dusk grading)
      if (mx > 0.82 && c < 0.12) { cl.white++; continue; }
      if (c < 0.12 || mx < 0.18) continue;
      let hu = mx === r ? ((g - b) / c) % 6 : mx === g ? (b - r) / c + 2 : (r - g) / c + 4; hu = (hu * 60 + 360) % 360; const sat = c / mx;
      if (hu >= 2 && hu < 16 && sat > 0.62 && mx > 0.75) cl.vermilion++;
      else if (hu >= 40 && hu < 58 && sat > 0.5 && mx > 0.6) cl.yellow++;
      else if (hu >= 30 && hu < 48 && sat > 0.45) cl.mustard++;
      else if (hu >= 20 && hu < 34 && sat > 0.35 && mx < 0.7) cl.brown++;
      else if (hu >= 120 && hu < 170 && sat > 0.3) cl.green++;
      else if (hu >= 205 && hu < 235 && sat > 0.3) cl.blue++;
      else if (hu >= 240 && hu < 290 && sat > 0.25) cl.purple++;
      else if ((hu >= 335 || hu < 2) && sat > 0.45 && mx > 0.28) cl.red++;   // canonical look (2026-10-29): wine flannel + red cap
    }
    // a garment pixel counts only inside its own colour (all 4 neighbours the same): anti-aliased ink edges never fake a part
    if (PAL) for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const j = y * w + x, q = LB[j];
      if (q < 0 || LB[j - 1] !== q || LB[j + 1] !== q || LB[j - w] !== q || LB[j + w] !== q) continue;
      const k = PAL[q][0]; pal[k]++; const yy = palY[k]; if (y < yy[0]) yy[0] = y; if (y > yy[1]) yy[1] = y; }
    for (const k in cl) cl[k] = n ? +(cl[k] / n).toFixed(4) : 0;
    const out = { box: n ? [ox + x0, oy + y0, ox + x1 + 1, oy + y1 + 1] : null, px: n, cl };
    if (pal) { out.pal = pal; out.palRaw = palRaw; out.palY = Object.fromEntries(Object.entries(palY).map(([k, v]) => [k, v[1] < 0 ? null : [oy + v[0], oy + v[1]]])); }
    if (X && X.ink >= (root.__thinMinInk || 1.4) && n) {   // thin features: M minus open(M, r) with a square r ~ 1.3 ink
      const r = Math.max(1, Math.round(X.ink * 1.3)), E = new Uint8Array(w * h), T = new Uint8Array(w * h);
      const pass = (S0, D0, horiz, isMin) => { for (let a = 0; a < (horiz ? h : w); a++) for (let b = 0; b < (horiz ? w : h); b++) {
        let v = isMin ? 1 : 0; for (let k = -r; k <= r && (isMin ? v : !v); k++) { const bb = b + k; const idx = horiz ? a * w + bb : bb * w + a;
          const val = bb < 0 || bb >= (horiz ? w : h) ? 0 : S0[idx]; if (isMin && !val) v = 0; if (!isMin && val) v = 1; }
        D0[horiz ? a * w + b : b * w + a] = v; } };
      pass(M, T, true, true); pass(T, E, false, true); pass(E, T, true, false); pass(T, E, false, false);   // E = opened
      const [hx, hy, hr] = X.head, hz = (xx, yy) => (xx - hx) ** 2 / (hr * 1.7) ** 2 + (yy - hy) ** 2 / (hr * 1.9) ** 2 < 1;
      const nearHand = (xx, yy) => X.hands.some(p => (xx - p[0]) ** 2 + (yy - p[1]) ** 2 < (X.hand * 2.4 + X.ink * 2) ** 2);
      let thin = 0, worst = 0; const seen = new Uint8Array(w * h), comps = [];
      for (let i = 0; i < w * h; i++) { if (!M[i] || E[i] || seen[i]) continue;
        const st = [i]; seen[i] = 1; let cnt = 0, bx0 = w, by0 = h, bx1 = 0, by1 = 0, outside = 0;
        while (st.length) { const j = st.pop(), xx = j % w, yy = (j / w) | 0; cnt++; if (!hz(xx, yy) && !nearHand(xx, yy)) outside++;
          if (xx < bx0) bx0 = xx; if (xx > bx1) bx1 = xx; if (yy < by0) by0 = yy; if (yy > by1) by1 = yy;
          for (const k of [j - 1, j + 1, j - w, j + w]) if (k >= 0 && k < w * h && M[k] && !E[k] && !seen[k] && Math.abs((k % w) - xx) <= 1) { seen[k] = 1; st.push(k); } }
        const len = Math.max(bx1 - bx0, by1 - by0) + 1;
        if (bx0 <= 1 || by0 <= 1 || bx1 >= w - 2 || by1 >= h - 2) continue;   // slivers made by the frame-edge crop, not strokes
        if (outside > 0 && len >= X.ink * 3.5 && outside >= X.ink * X.ink * 2.5) { thin += outside; worst = Math.max(worst, len); comps.push([ox + bx0, oy + by0, ox + bx1 + 1, oy + by1 + 1, outside]); } }
      out.thin = { px: thin, worst: +(worst / X.ink).toFixed(1), comps: comps.slice(0, 6), r };
    }
    return out;
  }
  function eyeMask(M, list, pad) {
    const c = M.ctx;
    for (const [m, x, y, rx, ry, yl, tl, yb] of list) {   // only the OPEN part of the eye (lids keep their skin light)
      c.setTransform(m); c.save();
      c.beginPath(); const t0 = yl ?? y - ry * 2, b0 = yb ?? y + ry * 2, k = yl != null ? tl : 0;
      c.moveTo(x - rx * 1.6, t0 - k * rx * 1.6); c.lineTo(x + rx * 1.6, t0 + k * rx * 1.6); c.lineTo(x + rx * 1.6, b0);
      if (yb != null) c.quadraticCurveTo(x, b0 - ry * 0.3, x - rx * 1.6, b0); else c.lineTo(x - rx * 1.6, b0); c.closePath(); c.clip();
      c.fillStyle = '#000'; c.beginPath(); c.ellipse(x, y, Math.max(1e-4, rx + pad), Math.max(1e-4, ry + pad), 0, 0, K.TAU); c.fill(); c.restore();
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
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
    open:    { lead: A([0.45, -0.55], [0.4, -0.5], 'palm', [1, -0.6], [-0.4, -1]), trail: A([0.45, -0.55], [0.3, -0.55], 'palm', [1, -0.6], [-0.4, -1]) },
    belly:   { lead: A(null, null, 'relax', [1, -0.4], [-1, -0.3], { at: 'belly' }), trail: A(null, null, 'relax', [1, -0.4], [-1, -0.3], { at: 'belly' }), lift: 0.012 },
    surprise: { lead: A([0.62, 0.3], [0.5, -0.15], 'palm', [1, -0.8], [-0.6, -1]), trail: A([0.62, 0.3], [0.35, -0.2], 'palm', [1, -0.8], [-0.6, -1]), lift: 0.014 },
    clasp:   { lead: A(null, null, 'fist', [1, -0.6], [0, -1], { at: 'chest' }), trail: A(null, null, 'fist', [1, -0.6], [0, -1], { at: 'chest' }) },
    chin:    { lead: A(null, null, 'hide', [1, -1], [0, -1], { at: 'crossL' }), trail: A(null, null, 'mitt', [1, -0.6], [0, -1], { at: 'chinTap' }) },
    scratch: { lead: HANG(), trail: A(null, null, 'fist', [1, 0.2], [-0.6, 0.6], { at: 'nape' }), lift: 0.01 },
    pump:    { lead: HANG(), trail: A([0.3, -0.05], [0.55, 0.02], 'fist', [1, -1], [-0.5, -1]) },
    walk:    { lead: A([0.12, -0.97], [0.0, -0.97], 'relax', [1, 0.1], [-1, 0.25], { swing: 1 }), trail: A([0.12, -0.97], [0.0, -0.97], 'relax', [1, 0.1], [-1, 0.25], { swing: -1 }), walk: 1 },
    clipboard: { lead: A(null, null, 'fist', [1, -0.6], [-0.3, -1], { at: 'write' }), trail: A(null, null, 'mitt', [1, -0.4], [-0.3, -1], { at: 'board' }), prop: 'clipboard' },
    pointSelf: { lead: HANG(), trail: A(null, null, 'point', [1, -0.6], [0, -1], { at: 'chest' }), lift: 0.008 },
    visor:   { lead: HANG(), trail: A(null, null, 'mitt', [1, 0.3], [-0.2, 0.2], { at: 'visor' }), lean: 0.04 },
    detective: { lead: A(null, null, 'hide', [1, 0.2], [-1, 0.2], { at: 'backhand' }), trail: A(null, null, 'fist', [1, -0.7], [-0.4, -1], { at: 'lens' }), prop: 'magnifier', lean: 0.05 },
    sitPoint: { lead: A([0.8, 0.5], [0.92, 0.42], 'point', [0, -1], [0, -1]), trail: A(null, null, 'mitt', [1, 0.3], [-1, 0.3], { at: 'knee' }) },
    sit:     { lead: A(null, null, 'mitt', [1, 0.3], [-1, 0.3], { at: 'knee' }), trail: A(null, null, 'mitt', [1, 0.3], [-1, 0.3], { at: 'knee' }) },
    lapPoint: { lead: A(null, null, 'mitt', [1, -1], [-0.3, -1], { at: 'lap' }), trail: A([0.55, 0.45], [-0.85, 0.3], 'point', [0, -1], [0, -1]) },   // clothes QC: front view points out-up (it crossed the face)
  };

  // ------------------------------------------------------------------ expressions
  // lid 0 open .. 1 shut, low = lower lid, tilt +angry / -worried, eye scale, pupil scale, mouth kind, extras
  C.EXPR = {   // browUp: raise both brows, browOne: arch one brow, sq: head stretch (>1) / squash (<1), body: default pose
    neutral:   { lid: 0.12, mouth: 'smile' },
    happy:     { lid: 0.0, low: 0.24, mouth: 'grin', head: -0.06, noBias: 1, look: [0, -0.3], grin: 1.3, eye: 1.04, browUp: 0.45, sq: 1.02, body: 'open' },
    laugh:     { happyEyes: 1, mouth: 'laugh', head: -0.13, noBias: 1, lift: -0.006, blush: 0.3, browUp: 0.6, sq: 1.04, body: 'belly' },
    surprised: { lid: 0.0, low: 0, eye: 1.24, pupil: 0.82, catch: 0.3, agree: 1, lookK: 0.55, look: [0, -0.18], mouth: 'o', noBias: 1, lift: -0.008, browUp: 1.1, sq: 1.05, body: 'surprise', extras: ['ticks'] },
    curious:   { lid: 0.0, eye: 1.12, mouth: 'smallo', look: [0.5, -0.35], noBias: 0.8, browOne: 1, browUp: 0.3, head: 0.1, lean: 0.05, body: 'chin' },
    awe:       { lid: 0.0, low: 0, eye: 1.26, pupil: 1.12, agree: 1, lookK: 0.55, mouth: 'awe', look: [0, -0.5], noBias: 1, sparkle: 1, browUp: 0.9, head: -0.08, sq: 1.03, body: 'clasp', extras: ['sparkle'] },
    smug:      { lid: 0.42, low: 0.2, lidCover: 1, mouth: 'smirk', look: [0.85, 0], tilt: 0.1, noBias: 0.85, browOne: 1.1, head: 0.07, body: 'crossed' },
    thinking:  { lid: 0.28, mouth: 'think', look: [0.6, -0.8], head: 0.08, noBias: 0.4, browOne: 0.8, body: 'think' },
    worried:   { lid: 0.18, tilt: -0.65, mouth: 'wobble', pupil: 0.8, noBias: 0.7, sweat: 1, sq: 0.98, body: 'clasp' },
    sheepish:  { lid: 0.14, tilt: -0.45, mouth: 'sheep', look: [-0.8, 0.4], noBias: 0.8, blush: 0.5, sweat: 1, head: -0.08, body: 'scratch' },
    annoyed:   { lid: 0.46, tilt: 0.4, lidCover: 1, mouth: 'flat', look: [0.5, 0.05], noBias: 0.5, body: 'crossed' },
    grumpy:    { lid: 0.44, tilt: 0.6, lidCover: 1, mouth: 'frown', noBias: 0.6, body: 'crossed' },
    furious:   { lid: 0.28, tilt: 1.0, eye: 1.06, pupil: 0.7, mouth: 'yell', noBias: 1, head: 0.05, sq: 0.97, lean: 0.06, extras: ['anger'], body: 'fist' },
    determined: { lid: 0.34, tilt: 0.55, mouth: 'set', look: [0.6, 0], noBias: 0.6, sq: 0.99, body: 'pump' },
    talk:      { lid: 0.12, mouth: 'talk' },
  };
  C.EXPR.sly = C.EXPR.smug;
  // expression blend (Guardian v3, 2026-10-16): o.exprBlend = { expr, k } eases the face from o.expr to another expression
  // instead of a one-frame snap. Numeric face parameters (lids, brow tilt / raise, eye and pupil scale, gaze, head tilt,
  // squash) interpolate; shapes and flags (mouth, closed-eye arcs, sweat, lid-cover rule, extras) switch at k = 0.5, which
  // a 0.12-0.2 s blend hides under the moving lids and brows. A missing numeric field counts as its neutral value.
  const EX_NUM = { lid: 0.1, low: 0, agree: 0, tilt: 0, eye: 1, pupil: 1, catch: 0.28, lookK: 1, head: 0, lift: 0, browUp: 0, browOne: 0, sq: 1, lean: 0, grin: 1, blush: 0, noBias: 0 };
  // the expression name the face reads as (logged for the eye audit): the lid-cover one while its rule is active
  C.exprName = function (a, bl) {
    if (!bl || !bl.expr || !(bl.k > 0)) return a || 'neutral';
    const A0 = C.EXPR[a] || C.EXPR.neutral, B0 = C.EXPR[bl.expr] || C.EXPR.neutral, k = bl.k;
    if (B0.lidCover && k >= 0.25) return bl.expr; if (A0.lidCover && k < 0.75) return a || 'neutral';
    return k >= 0.5 ? bl.expr : (a || 'neutral');
  };
  C.exprMix = function (a, bl) {
    const A0 = C.EXPR[a] || C.EXPR.neutral;
    if (!bl || !bl.expr || !(bl.k > 0)) return Object.assign({}, A0);
    const B0 = C.EXPR[bl.expr] || C.EXPR.neutral, k = K.clamp(bl.k);
    if (k >= 1) return Object.assign({}, B0);
    const E = Object.assign({}, k < 0.5 ? A0 : B0);
    for (const f in EX_NUM) {
      const va = A0[f] ?? EX_NUM[f], vb = B0[f] ?? EX_NUM[f];
      if (A0[f] === undefined && B0[f] === undefined) continue;
      E[f] = va + (vb - va) * k;
    }
    // lid-cover (sly) rule: as soon as the lids are a quarter of the way into a heavy-lid emotion the pupil sits centred in
    // the slit (kit rule for annoyed / grumpy / smug), and keeps that until the lids have mostly left one
    E.lidCover = (B0.lidCover && k >= 0.25) || (A0.lidCover && k < 0.75) ? 1 : 0;
    const la = A0.look || [0, 0], lb = B0.look || [0, 0];
    if (A0.look || B0.look) E.look = [la[0] + (lb[0] - la[0]) * k, la[1] + (lb[1] - la[1]) * k];
    return E;
  };
  // eye rules (see drawEye): minimum pupil radius vs the eye, minimum on-screen pupil radius, catchlight sizes, the
  // eye radius (px) below which the eye is simplified (small) or reduced to a dot (micro)
  C.EYE = { lidMax: 0.58, pupilMin: 0.36, pupilPx: 1.7, catch: 0.28, catchMax: 0.32, smallPx: 9, microPx: 4.5 };
  C.EXPRESSIONS = ['neutral', 'laugh', 'surprised', 'furious', 'worried', 'smug'];
  C.EMOTIONS = ['neutral', 'happy', 'laugh', 'surprised', 'curious', 'awe', 'smug', 'thinking', 'worried', 'sheepish', 'annoyed', 'furious', 'determined'];
  C.EMOTIONS_ES = { neutral: 'neutral', happy: 'feliz', laugh: 'risa', surprised: 'sorpresa', curious: 'curiosa/o', awe: 'asombro', smug: 'pícara/o', thinking: 'pensando', worried: 'preocupada/o', sheepish: 'apenada/o', annoyed: 'molesta/o', furious: 'furia (grita)', determined: 'decidida/o' };

  // ------------------------------------------------------------------ the face (head-local units, origin = head centre)
  // a true-radius disc in head-local units. NOT K.circle: K.circle clamps the radius to >= 0.01, which is px-safe
  // but in head units (eye radius ~0.035) turned every catchlight (0.003-0.005) into a 0.01 disc as big as the pupil
  // itself: the root cause of the "white disc + dark crescent" eyes (Producer, 2026-10-16)
  function disc(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(1e-6, r), 0, K.TAU); }
  function eyeShape(c, x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, Math.max(1e-4, rx), Math.max(1e-4, ry), 0, 0, K.TAU); }
  function lidOf(H) {
    const F = H.F, E = H.E; let lid = K.clamp((E.lid ?? 0.1) + (F.lidBias || 0) * (1 - (E.noBias || 0)));
    if (H.blink > 0.5) lid = 1; return lid;
  }
  function drawEye(c, H, ex, ey, rr, side, far) {
    const F = H.F, E = H.E, lw = H.lw;
    const pk = H.fs > 0.88 ? (F.profEye || 1.12) : 1, k = (E.eye || 1) * pk, rx = rr * k * (1 - 0.32 * H.fs * (far ? 1.4 : 0.6)) * (H.fs > 0.88 ? 1.25 : 1), ry = rr * k;
    let lid = lidOf(H);
    if (lid < 0.75) lid = Math.min(lid, C.EYE.lidMax);   // rule 4: a heavy lid never closes the eye down to a hairline slit
    const low = E.low || 0, m = -side * (E.tilt || 0);
    const look = H.look;
    const kind = F.eyes;
    if (kind === 'googly' || kind === 'iris') {
      const sclera = F.sclera || '#fbf7ee';
      if (E.happyEyes && H.blink < 0.5) { // closed, smiling arcs (^ ^)
        c.strokeStyle = INK; c.lineWidth = lw * 2.2; c.lineCap = 'round';
        c.beginPath(); c.moveTo(ex - rx * 0.95, ey + ry * 0.25); c.quadraticCurveTo(ex, ey - ry * 0.85, ex + rx * 0.95, ey + ry * 0.25); c.stroke();
        if (FACE) { const sc = scaleOf(c), q = toPx(c, ex, ey); FACE.eyes.push({ cx: q[0], cy: q[1], rx: rx * sc, ry: ry * sc, closed: 'happy', far: !!far }); }
        return;
      }
      // the open part of the eye: between the upper lid line and the lower lid curve. Lids are the face itself (nothing
      // is painted there), so no white can bleed round a lid and no ring is left over the skin
      const yl = ey - ry + lid * 2 * ry, yb = ey + ry - low * 2 * ry, hasL = lid > 0.01, hasB = low > 0.01;
      const openP = () => { const t0 = hasL ? yl : ey - ry * 2, b0 = hasB ? yb : ey + ry * 2; c.beginPath();
        c.moveTo(ex - rx * 1.6, t0 - (hasL ? m * rx * 1.6 : 0)); c.lineTo(ex + rx * 1.6, t0 + (hasL ? m * rx * 1.6 : 0)); c.lineTo(ex + rx * 1.6, b0);
        if (hasB) c.quadraticCurveTo(ex, b0 - ry * 0.3, ex - rx * 1.6, b0); else c.lineTo(ex - rx * 1.6, b0); c.closePath(); };
      c.save(); if (hasL || hasB) { openP(); c.clip(); }
      eyeShape(c, ex, ey, rx, ry); c.fillStyle = sclera; c.fill();
      // pupil: wide emotions (surprise, awe) open the whites fully, the pupils agree (no goofy drift) and sit centred or
      // a touch up; in every emotion the pupil (and iris) stays fully inside the white with a margin (never cut by the
      // eye outline, never pushed to the edge).
      // EYE RULES (2026-10-16, Producer: «el punto de los ojos no está funcionando»), true at every size:
      //  1 the pupil is a clear dark dot: radius >= C.EYE.pupilMin (0.36) x the eye's height radius in every emotion
      //    and eye scale (it grows with E.eye), and >= C.EYE.pupilPx (1.7 px) on screen (capped at 0.55 x the eye) so
      //    it survives draft scale, antialiasing, grain and bloom;
      //  2 the catchlight is <= C.EYE.catchMax (0.32) x the pupil radius, fully inside it, never with a line-width
      //    floor (that floor made it 0.5-0.75 x the pupil: a white disc with a dark crescent = "closed / sleepy" eyes);
      //  3 small eyes (eye radius < 9 px) are simplified: pupil + ONE catchlight (no awe sparkle, no iris ring, one
      //    lash); micro eyes (< 4.5 px) are a plain dark dot (no catchlight);
      //  4 the pupil sits inside the open part of the eye: at least half its radius below the upper lid line and above
      //    the lower lid. Lids cover it only in a blink, a shut lid (>= 0.75) or the declared lid-cover emotions
      //    (E.lidCover: smug / sly, annoyed, grumpy), and even then it stays centred in the slit.
      const sc = scaleOf(c), RY = ry * sc, small = RY < C.EYE.smallPx, micro = RY < C.EYE.microPx, googly = kind === 'googly';
      let pr = rr * (F.pupil || 0.36) * (E.pupil || 1) * (googly ? Math.sqrt(E.eye || 1) : 1) * (far ? 0.94 : 1);
      if (googly) { pr = Math.max(pr, ry * C.EYE.pupilMin, Math.min(C.EYE.pupilPx / sc, ry * 0.55)); if (micro) pr = Math.max(pr, ry * 0.5); }
      const pin = kind === 'iris' ? pr * (F.irisK || 1.9) : pr;
      const agree = E.agree || 0, lk = E.lookK ?? 1;
      let ox = (look[0] * 0.42 * lk + (F.goofy || 0) * (1 - agree) * side * 0.12) * rx + H.faceDir * H.fs * rx * 0.25 * (1 - agree * 0.5);
      let oy = (look[1] * 0.42 * lk + 0.05 * (1 - agree) + K.clamp(lid - 0.25) * 0.55) * ry;
      const mx = Math.max(1e-4, rx - pin - lw * 1.4), my = Math.max(1e-4, ry - pin - lw * 1.4);
      { const d = Math.hypot(ox / mx, oy / my); if (d > 1) { ox /= d; oy /= d; } }
      if ((hasL || hasB) && lid < 0.75) {   // rule 4: keep the dot in the opening (lid line y = yl + m (x - ex))
        const keep = E.lidCover ? 0.6 : 0.85;
        const top = hasL ? yl - ey + m * ox + pin * keep : -Infinity;
        const bot = hasB ? yb - ey - 0.15 * ry * (1 - Math.min(1, (ox / (1.6 * rx)) ** 2)) - pin * keep : Infinity;
        oy = top <= bot ? Math.min(Math.max(oy, top), bot) : ((hasL ? yl - ey + m * ox : -ry) + (hasB ? yb - ey - 0.15 * ry : ry)) / 2;
        const ylim = my * Math.sqrt(Math.max(0, 1 - (ox / mx) ** 2)); oy = Math.max(-ylim, Math.min(ylim, oy));
      }
      const px = ex + ox, py = ey + oy;
      eyeShape(c, ex, ey, rx, ry); c.clip();
      if (kind === 'iris') { const ir = pin; c.fillStyle = F.iris || '#5a3a24'; K.circle(c, px, py, ir); c.fill();
        if (!small) { c.strokeStyle = K.rgba(INK, 0.6); c.lineWidth = lw * 0.6; c.stroke(); } }
      c.fillStyle = F.pupilColor || INK; disc(c, px, py, pr); c.fill();
      // catchlight (rule 2): a small white disc up-left INSIDE the pupil; awe adds a second, smaller sparkle (not small)
      const ck0 = E.sparkle ? C.EYE.catchMax : (E.catch ?? F.catch ?? (kind === 'iris' ? 0.5 : C.EYE.catch));
      const ck = googly ? Math.min(C.EYE.catchMax, ck0) : ck0;
      let cr0 = googly && (micro || pr * ck * sc < 0.7) ? 0 : pr * ck;
      if (cr0 && lid < 0.75) { c.fillStyle = '#ffffff'; disc(c, px - pr * 0.36, py - pr * 0.36, cr0); c.fill(); if (E.sparkle && !small) { disc(c, px + pr * 0.42, py + pr * 0.4, cr0 * 0.45); c.fill(); } }
      else cr0 = 0;
      c.restore();
      if (FACE) { const sc = scaleOf(c), q = toPx(c, ex, ey), pp = toPx(c, px, py);
        FACE.eyes.push({ cx: q[0], cy: q[1], rx: rx * sc, ry: ry * sc, px: pp[0], py: pp[1], pr: pr * sc, cr: cr0 * sc,
          closed: H.blink > 0.5 ? 'blink' : lid >= 0.75 ? 'lid' : (E.lidCover ? 'sly' : ''), lid, low, far: !!far }); }
      // lid lines (inside the eye shape only) and the eye outline only where the eye is open
      c.save(); eyeShape(c, ex, ey, rx * 1.02, ry * 1.02); c.clip(); c.strokeStyle = INK; c.lineCap = 'butt';
      if (hasL) { c.lineWidth = lw * 1.3; c.beginPath(); c.moveTo(ex - rx * 1.5, yl - m * rx * 1.5); c.lineTo(ex + rx * 1.5, yl + m * rx * 1.5); c.stroke(); }
      if (hasB) { c.lineWidth = lw * 1.1; c.beginPath(); c.moveTo(ex - rx * 1.5, yb); c.quadraticCurveTo(ex, yb - ry * 0.3, ex + rx * 1.5, yb); c.stroke(); }
      c.restore();
      if (EYES) EYES.push([c.getTransform(), ex, ey, rx, ry, hasL ? yl : null, m, hasB ? yb : null]);
      c.save(); if (hasL || hasB) { openP(); c.clip(); }
      eyeShape(c, ex, ey, rx, ry); c.lineWidth = lw * (F.eyeLine ?? 0.8); c.strokeStyle = INK; c.stroke(); c.restore();
      if (F.lashes) {
        const out = side; c.strokeStyle = INK; c.lineWidth = lw * 0.9; c.lineCap = 'round';
        // the lashes grow from where the lid line (or the top of the open eye) meets the outer outline
        const ox2 = ex + out * rx * 0.86, oy2 = lid > 0.05 ? Math.max(yl + m * rx * out * 0.86, ey - ry * 0.5) : ey - ry * 0.5;
        for (let i = 0; i < (far || ry * scaleOf(c) < C.EYE.smallPx ? 1 : 2); i++) { c.beginPath(); c.moveTo(ox2 - out * rx * 0.1 * i, oy2 - ry * 0.05 * i); c.quadraticCurveTo(ox2 + out * rx * 0.25, oy2 - ry * (0.15 + 0.12 * i), ox2 + out * rx * (0.42 - 0.08 * i), oy2 - ry * (0.38 + 0.22 * i)); c.stroke(); }
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
  function openMouth(c, w, o, wide, lw, teethBottom, maxD) {
    if (maxD != null) o = Math.max(0.02, Math.min(o, maxD / w - 0.3));
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
    if (H.fs > 0.78) return profileMouth(c, H, kind, my, w * (H.F.profMouth || 1.3), st * 1.1, lip);
    const sx = 1 - 0.4 * H.fs, room = H.chin != null ? H.chin - my - lw * 1.3 : null;   // room above the collar
    c.save(); c.translate(mx, my); c.scale(sx, 1); c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = lip; c.fillStyle = INK; c.lineWidth = st;
    switch (kind) {
      case 'smile': c.beginPath(); c.moveTo(-w * 0.55, -w * 0.08); c.quadraticCurveTo(0, w * 0.32, w * 0.55, -w * 0.08); c.stroke(); break;
      case 'grin': openMouth(c, w, (H.F.grinOpen ?? 0.12) * (E.grin || 1), (H.F.grinW ?? 0.7) * Math.sqrt(E.grin || 1), lw, false, room); break;
      case 'laugh': openMouth(c, w, 0.42, (H.F.grinW ?? 0.7) * 1.12, lw, false, room); break;
      case 'yell': { // a big angry shout: arched top lip, corners pulled down, deep jaw, both rows of teeth, tongue.
        // The whole mouth stays above the collar (it used to run under the torso and lose its lower teeth and tongue).
        // lift the shout so its top lip sits just under the nose: the jaw then has room to drop above the collar
        const nb = H.noseBottom != null ? H.noseBottom - my : -w * 0.4, up = Math.max(-w * 0.32, Math.min(-w * 0.08, nb + lw * 1.6 + w * 0.07));
        c.translate(0, up);
        const W = w * 0.66, D = Math.max(w * 0.55, Math.min(w * 1.0, room != null ? room - up : w));
        const pm = () => { c.beginPath(); c.moveTo(-W, w * 0.06); c.quadraticCurveTo(0, -w * 0.2, W, w * 0.06); c.quadraticCurveTo(W * 0.95, D * 0.85, 0, D); c.quadraticCurveTo(-W * 0.95, D * 0.85, -W, w * 0.06); c.closePath(); };
        pm(); c.fillStyle = '#3a1520'; c.fill(); c.save(); pm(); c.clip();
        c.fillStyle = '#fbf6ec'; c.beginPath(); c.moveTo(-W * 1.2, -w * 0.3); c.lineTo(W * 1.2, -w * 0.3); c.lineTo(W * 1.2, w * 0.1); c.quadraticCurveTo(0, -w * 0.02, -W * 1.2, w * 0.1); c.closePath(); c.fill();
        c.fillStyle = '#e0707a'; K.ellipse(c, 0, D * 0.86, W * 0.5, D * 0.2); c.fill();
        c.fillStyle = '#fbf6ec'; c.beginPath(); c.moveTo(-W * 0.62, D * 1.05); c.quadraticCurveTo(-W * 0.5, D * 0.8, 0, D * 0.79); c.quadraticCurveTo(W * 0.5, D * 0.8, W * 0.62, D * 1.05); c.closePath(); c.fill();
        c.restore();
        pm(); c.lineWidth = lw * 1.1; c.strokeStyle = INK; c.stroke(); break; }
      case 'talk': { // visemes: M (closed) · E (wide, teeth) · A (open) · O (round)
        const v = H.viseme || (H.talk < 0.12 ? 'M' : H.talk < 0.45 ? 'E' : H.talk < 0.8 ? 'A' : 'O');
        if (v === 'M') { c.beginPath(); c.moveTo(-w * 0.38, w * 0.02); c.quadraticCurveTo(0, w * 0.08, w * 0.38, w * 0.02); c.stroke(); }
        else if (v === 'E') openMouth(c, w, 0.03, 0.78, lw);
        else if (v === 'A') openMouth(c, w, 0.34, 0.56, lw);
        else { c.fillStyle = '#3a1520'; K.ellipse(c, 0, w * 0.12, w * 0.22, w * 0.3); c.fill(); c.save(); K.ellipse(c, 0, w * 0.12, w * 0.22, w * 0.3); c.clip(); c.fillStyle = '#e0707a'; K.ellipse(c, 0, w * 0.38, w * 0.16, w * 0.12); c.fill(); c.restore(); K.ellipse(c, 0, w * 0.12, w * 0.22, w * 0.3); c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); }
        break; }
      case 'o': c.fillStyle = '#3a1520'; K.ellipse(c, 0, w * 0.1, w * 0.21, w * 0.29); c.fill(); c.lineWidth = lw * 1.0; c.strokeStyle = INK; c.stroke(); break;
      case 'awe': c.fillStyle = '#3a1520'; K.ellipse(c, 0, w * 0.14, w * 0.26, w * 0.34); c.fill(); c.save(); K.ellipse(c, 0, w * 0.14, w * 0.26, w * 0.34); c.clip(); c.fillStyle = '#e0707a'; K.ellipse(c, 0, w * 0.42, w * 0.2, w * 0.14); c.fill(); c.restore(); K.ellipse(c, 0, w * 0.14, w * 0.26, w * 0.34); c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); break;
      case 'smallo': c.fillStyle = '#3a1520'; K.ellipse(c, w * 0.05, w * 0.05, w * 0.12, w * 0.15); c.fill(); c.lineWidth = lw * 1.4; c.strokeStyle = INK; c.stroke(); break;
      case 'frown': c.beginPath(); c.moveTo(-w * 0.45, w * 0.12); c.quadraticCurveTo(0, -w * 0.2, w * 0.45, w * 0.12); c.stroke(); break;
      case 'flat': c.beginPath(); c.moveTo(-w * 0.4, w * 0.02); c.lineTo(w * 0.4, -w * 0.02); c.stroke(); break;
      case 'set': c.beginPath(); c.moveTo(-w * 0.42, w * 0.06); c.quadraticCurveTo(0, -w * 0.02, w * 0.42, w * 0.06); c.stroke(); break;
      case 'think': c.beginPath(); c.moveTo(w * 0.05, w * 0.03); c.quadraticCurveTo(w * 0.3, -w * 0.06, w * 0.5, w * 0.06); c.stroke(); break;
      case 'wobble': { c.beginPath(); c.moveTo(-w * 0.44, w * 0.04); const n = 4, st = w * 0.88 / n; for (let i = 0; i < n; i++) { const x0 = -w * 0.44 + i * st; c.quadraticCurveTo(x0 + st * 0.5, (i % 2 ? 1 : -1) * w * 0.1 + w * 0.02, x0 + st, w * 0.04); } c.stroke(); break; }
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
      if (kind === 'o' || kind === 'smallo' || kind === 'awe') { // a round «o» just inside the face edge (never a notch cut into the outline)
        const r = w * (0.1 + 0.2 * sz), cx = -r * 0.75 - lw * 2.4; c.fillStyle = '#3a1520'; K.ellipse(c, cx, w * 0.06, r * 0.62, r * 1.1); c.fill(); c.lineWidth = lw * 1.1; c.strokeStyle = INK; c.stroke();
        if (kind === 'awe') { c.save(); K.ellipse(c, cx, w * 0.06, r * 0.62, r * 1.1); c.clip(); c.fillStyle = '#e0707a'; K.ellipse(c, cx, w * 0.06 + r * 0.85, r * 0.5, r * 0.4); c.fill(); c.restore(); }
        c.restore(); return; }
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
    // the eyes may pop past the head edge only a little, deliberately (googly style), never by half an eye: big-eye
    // emotions (surprise, awe) and the 3/4 turn pull the eyes back inside (they may touch each other instead)
    { const k = E.eye || 1, prof = H.fs > 0.88, pk = prof ? (F.profEye || 1.12) * 1.25 : 1;
      const rxOf = far => rr * k * pk * (1 - 0.32 * H.fs * (far ? 1.4 : 0.6)), lim = hw + rr * (prof ? 0.5 : 0.22) * k;
      if (eyes.length === 1) { const x = eyes[0][0], d = Math.abs(x - H.cx) + rxOf(eyes[0][2]) - lim; if (d > 0) eyes[0][0] -= Math.sign(x - H.cx || 1) * d; }
      else {
        const exL = (H.cx - eyes[0][0]) + rxOf(eyes[0][2]) - lim, exR = (eyes[1][0] - H.cx) + rxOf(eyes[1][2]) - lim;
        if (exL > 0 && exR > 0) { eyes[0][0] += exL; eyes[1][0] -= exR; }
        else if (exR > 0) { eyes[0][0] -= exR; eyes[1][0] -= exR; if (exL + exR > 0) eyes[0][0] += exL + exR; }
        else if (exL > 0) { eyes[0][0] += exL; eyes[1][0] += exL; if (exR + exL > 0) eyes[1][0] -= exR + exL; }
      } }
    H.noseBottom = null;
    if (F.nose) {
      const nx = fx + fdir * H.fs * hw * 0.42, ny = ey + F.noseY, nr = F.nose; H.noseBottom = ny + nr * 0.8;
      c.fillStyle = H.skin; c.strokeStyle = INK; c.lineWidth = H.lw * 0.9;
      K.ellipse(c, nx + fdir * H.fs * nr * 0.7, ny, nr * (1 + 0.35 * H.fs), nr * 0.8); c.fill(); c.stroke();
    }
    if (F.freckles) { c.fillStyle = K.rgba(F.freckles, 0.6); for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) { const x = fx + sg * (sep + rr * 0.2) + (i - 1) * rr * 0.32, y = ey + rr * 1.35 + (i % 2) * rr * 0.18; if (H.fs > 0.5 && sg === -fdir) continue; K.circle(c, x, y, rr * 0.07); c.fill(); } }
    for (const [x, side, far] of eyes.sort((a, b) => (a[2] ? -1 : 1) - (b[2] ? -1 : 1))) drawEye(c, H, x, ey, rr, side, far);
    H._brows = F.brows ? browGeom(H, eyes, ey, rr) : null;
    if (F.brows && !F.browsLate) drawBrows(c, H, eyes, ey, rr);
    H._browArgs = [eyes, ey, rr];
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
  function browGeom(H, eyes, ey, rr) { // brows carry the emotion in every view (tilt: + angry / - worried)
    const F = H.F, E = H.E, k = (E.eye || 1), out = [];
    const bt = (E.tilt || 0) * (F.browK ?? 1.0), up = (E.browUp || 0) * rr * 0.55;
    const oneSide = eyes.length === 1 ? eyes[0][1] : (H.look[0] >= 0 ? 1 : -1);
    let top = Infinity;
    for (const [x, side, far] of eyes) {
      const gap = rr * k * (F.browGap || 1.45) + (E.lid > 0.3 ? -rr * 0.12 : 0);
      const by = ey - gap - up + (F.browY || 0), w = rr * (F.browW || 0.95) * (far ? 0.75 : 1), inner = -side;
      let yi = by + bt * rr * 0.5, yo = by - bt * rr * 0.18;
      if (E.browOne && side === oneSide) { yi -= rr * 0.35 * E.browOne; yo -= rr * 0.5 * E.browOne; }
      // surprise / awe: high, round arches (not flat bars)
      const arch = (E.browOne && side === oneSide ? 0.3 : 0.14 + 0.16 * Math.min(1, Math.max(0, E.browUp || 0))) * rr;
      const seg = [x + inner * w * 0.75, yi, x, (yi + yo) / 2 - arch, x - inner * w * 0.8, yo];
      top = Math.min(top, yi, yo, (yi + yo) / 2 - arch * 0.5); out.push(seg);
    }
    H.browTop = top - (F.brows || 0) * 0.5; return out;
  }
  function drawBrows(c, H, eyes, ey, rr) {
    const F = H.F, segs = H._brows || browGeom(H, eyes, ey, rr);
    c.strokeStyle = F.browColor || INK; c.lineCap = 'round'; c.lineWidth = F.brows;
    for (const g of segs) { c.beginPath(); c.moveTo(g[0], g[1]); c.quadraticCurveTo(g[2], g[3], g[4], g[5]); c.stroke(); }
  }

  // ------------------------------------------------------------------ hands
  // Cartoon mitten hands with a thumb (detail pass 2026-10-15). Hand-local frame: +x along the forearm toward the
  // fingers, +y the thumb side; r = the hand size (SPECS.arm.hand). One silhouette per hand (ink outside, fill inside),
  // a thumb that reads, and at most two short purposeful creases. Kinds: relax (mitten), palm (open, three fingers +
  // thumb), fist (knuckles front, thumb wrapped across), point (index out, thumb tucked), mitt (a grip: fist with the
  // fingers curled round a wheel / bar / knee), hide.
  function capsule(c, x0, y0, x1, y1) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); }
  function hand(c, P, dirv, kind, r, color, lw, side) {
    if (kind === 'hide') return;
    const [x, y] = P, a = Math.atan2(dirv[1], dirv[0]), ts = side || 1;
    r *= 1.45;                               // the hand reads ~1.5x the forearm width (a fist is never a stump)
    c.save(); c.translate(x, y); c.rotate(a); c.scale(1, ts);
    c.lineJoin = 'round'; c.lineCap = 'round';
    const IW = lw * 2, parts = [];          // parts: {path(), w (stroke width) | null = filled shape}
    const body = (x0, y0, w, h, rad) => parts.push({ p: () => K.rrect(c, x0 * r, y0 * r, w * r, h * r, rad * r) });
    const stick = (x0, y0, x1, y1, w) => parts.push({ p: () => capsule(c, x0 * r, y0 * r, x1 * r, y1 * r), w: w * r });
    const draw = (list) => {
      for (const q of list) { q.p(); c.strokeStyle = INK; c.lineWidth = q.w ? q.w + IW : IW; c.stroke(); }
      for (const q of list) { q.p(); if (q.w) { c.strokeStyle = color; c.lineWidth = q.w; c.stroke(); } else { c.fillStyle = color; c.fill(); } }
    };
    const crease = (x0, y0, x1, y1, cx, cy) => { c.beginPath(); c.moveTo(x0 * r, y0 * r); if (cx != null) c.quadraticCurveTo(cx * r, cy * r, x1 * r, y1 * r); else c.lineTo(x1 * r, y1 * r); c.strokeStyle = INK; c.lineWidth = lw * 1.15; c.stroke(); };
    const thumbOver = (x0, y0, x1, y1, w) => { const q = [{ p: () => capsule(c, x0 * r, y0 * r, x1 * r, y1 * r), w: w * r }]; draw(q); };
    if (kind === 'relax') {          // relaxed mitten: fingers together, slightly curled, thumb along the front
      body(-0.5, -0.6, 1.55, 1.12, 0.52); stick(-0.05, 0.42, 0.42, 0.74, 0.36); draw(parts);
      crease(0.62, -0.18, 1.0, -0.2); crease(-0.02, 0.36, 0.34, 0.44);
    } else if (kind === 'palm') {    // open hand: palm + three short fingers fanned + thumb out
      body(-0.5, -0.6, 1.2, 1.18, 0.48);
      stick(0.5, -0.36, 1.02, -0.52, 0.34); stick(0.55, -0.02, 1.14, -0.04, 0.36); stick(0.5, 0.32, 1.0, 0.44, 0.34);
      stick(0.0, 0.42, 0.34, 0.98, 0.36); draw(parts);
    } else if (kind === 'fist' || kind === 'mitt') {   // fist / grip: a soft block, knuckles at the front, thumb across
      body(-0.52, -0.66, 1.3, 1.28, 0.5); draw(parts);
      if (kind === 'fist') { crease(0.78, -0.24, 0.5, -0.22); crease(0.78, 0.1, 0.52, 0.12); thumbOver(-0.04, 0.52, 0.5, 0.32, 0.34); }
      else { crease(0.78, -0.12, 0.48, -0.1); thumbOver(-0.02, 0.48, 0.36, 0.5, 0.32); }
    } else if (kind === 'point') {   // pointing: curled fingers + a straight index + the thumb tucked on top of it
      body(-0.52, -0.62, 1.16, 1.2, 0.48); stick(0.3, 0.24, 1.72, 0.24, 0.4); draw(parts);
      crease(0.64, -0.26, 0.38, -0.24);
      thumbOver(-0.06, 0.6, 0.36, 0.54, 0.32);
    } else { body(-0.5, -0.6, 1.2, 1.2, 0.5); draw(parts); }
    c.restore();
  }

  // ------------------------------------------------------------------ the biped
  function biped(S, o) {
    const s = o.s, dir = o.dir, t = o.t || 0, lw = S.lw || 0.0075;
    const P = C.POSES[o.pose] || C.POSES.stand, PB = o.blend ? (C.POSES[o.blend.pose] || C.POSES.stand) : null, bk = o.blend ? K.clamp(o.blend.k) : 0;
    const cosT = Math.cos(s * Math.PI / 2);
    const breathe = Math.sin(t * 2.1 + (S.phase || 0)) * 0.0035, lift = K.lerp(P.lift || 0, PB ? PB.lift || 0 : 0, bk);
    const back = !!o.back, walkK = K.lerp(P.walk || 0, PB ? PB.walk || 0 : 0, bk), wph = t * K.TAU * 0.95 + (S.phase || 0);
    const bobY = -Math.abs(Math.cos(wph)) * 0.012 * walkK;
    const hipY = -S.legLen, shY = -S.shoulder - breathe - lift, legsOn = !o.seated, sitLegs = !!(o.seated && o.legs), crouchD = o.seated ? 0 : Math.max(0, Math.min(o.crouch || 0, S.legLen * 0.75));
    const Ttop = -S.torso.top - breathe - lift * 0.5, Tbot = -S.torso.bot;
    const wT = K.lerp(S.torso.wTop, S.torso.dTop ?? S.torso.wTop * 0.7, s), wB = K.lerp(S.torso.wBot, S.torso.dBot ?? S.torso.wBot * 0.75, s);
    const tcx = dir * s * (S.torso.lean || 0);
    const hw = S.head.hw, hh = S.head.hh;
    const headTurn = o.headTurn || 0;
    const fsRaw = s + headTurn;
    const faceDir = fsRaw >= 0 ? dir : -dir, fs = Math.min(1, Math.abs(fsRaw));
    const E = C.exprMix(o.expr, o.exprBlend);
    const tilt = (o.tilt || 0) + K.lerp(P.tilt || 0, PB ? PB.tilt || 0 : 0, bk) * dir + (E.head || 0) * faceDir;
    const lean = (o.lean || 0) + (E.lean || 0) * (o.seated ? 0.5 : 1) + K.lerp(P.lean || 0, PB ? PB.lean || 0 : 0, bk);
    const hcx = tcx + dir * s * (S.head.lean || 0) * 0.5, hcy = -S.head.cy - breathe * 1.4 - lift;
    const H = { cx: 0, cy: 0, hw, hh, s, fs, faceDir, dir, lw, skin: S.skin, lidColor: S.lidColor, F: S.face, E, t, blink: o.blink || 0, talk: o.talk || 0, viseme: o.viseme,
      look: o.look || E.look || [0, 0], headTurn, drag: o.drag || 0, hatHit: o.hatHit || 0, flop: o.hairFlop || 0, back, chin: S.head.cy - S.torso.top - 0.001 };
    const sh = sg => [tcx + sg * S.shoulderW * cosT + dir * s * (S.shoulderFwd || 0), shY];
    const L1 = S.arm.upper, L2 = S.arm.fore, LA = L1 + L2;
    const anchor = (name, sg) => {
      const chestY = K.lerp(Ttop, Tbot, 0.32);
      switch (name) {
        case 'hip': return [tcx + sg * (wB + 0.006) * K.lerp(1, 0.4, s) - dir * s * 0.035, Tbot - 0.035];
        case 'crossL': return [tcx - sg * wT * 0.5 * cosT + dir * s * wT * 0.6, chestY + 0.02];
        case 'crossT': return [tcx - sg * wT * 0.55 * cosT + dir * s * wT * 0.8, chestY + 0.045];
        case 'chin': return [hcx + faceDir * fs * hw * 0.6 + (1 - fs) * 0.0, hcy + hh * 0.95];
        // curious: curled fingers resting just under the chin ("hmm"), below the mouth, never across it
        case 'chinTap': return [hcx + faceDir * fs * hw * 0.55, hcy + hh * 0.95 + S.arm.hand * 1.15];
        case 'lap': return [tcx + sg * wB * 0.5 * cosT + dir * s * (wB + 0.06), Tbot - 0.01];
        case 'chest': return [tcx + sg * 0.018 * cosT + dir * s * wT * 1.05, K.lerp(Ttop, Tbot, 0.3)];
        case 'belly': return [tcx + sg * wB * 0.55 * cosT + dir * s * wB * 0.95, K.lerp(Ttop, Tbot, 0.78)];
        // scratching the back / side of the head: the hand stays off the face (never over an eye) in every view
        // (Guardian 2026-10-16: in 3/4 the fist sat on the brow / near eye, B23: it now goes to the back edge, temple height)
        case 'nape': return fs < 0.3 ? [hcx + sg * hw * 1.1, hcy - hh * 0.62] : [hcx - faceDir * hw * 1.0, hcy - hh * 0.4];
        case 'cheek': return [hcx + sg * hw * 1.25 * cosT + dir * s * hw * 0.6, hcy + hh * 0.45];
        case 'board': { const b = boardAt(); return [b[0] - dir * 0.03 * (1 - s) + dir * s * -0.02, b[1] + 0.05]; }
        case 'write': { const b = boardAt(); return [b[0] + dir * 0.012 + Math.sin(t * 11) * 0.006, b[1] - 0.005 + Math.cos(t * 7) * 0.005]; }
        case 'lens': return [hcx + faceDir * (fs * hw * 1.05 + (1 - fs) * 0.0) + (fs < 0.3 ? -dir * hw * 0.2 : 0), hcy + S.face.eyeY + 0.075];
        // a flat hand shading the eyes (looking far ahead): above the brows, toward the face side, never over an eye
        // (Guardian 2026-10-16: at brow height the fist hid both brows, A09: it now sits at the hat brim / hairline)
        case 'visor': return [hcx + faceDir * fs * hw * 0.7 + (fs < 0.3 ? sg * hw * 0.25 : 0), hcy - hh * 0.74];
        case 'backhand': return [tcx - dir * s * (wB + 0.02) + (1 - s) * sg * wB * 0.6, Tbot - 0.03];
        case 'knee': return kneeAt(sg);
      }
      return [tcx, chestY];
    };
    function boardAt() { return [tcx + dir * s * (wT + 0.035), K.lerp(Ttop, Tbot, 0.42)]; }
    const thigh = S.legLen * 0.5, shin = S.legLen * 0.5;
    function kneeAt(sg) { const hx = sg * S.hipW * cosT; return o.sitGround ? [hx + dir * s * thigh * 0.62 + (1 - s) * sg * 0.035, hipY - thigh * 0.78 * s - (1 - s) * (o.back ? 0.07 : thigh * 0.62)]   /* art review 2026-10: knees up in front / 3/4 too (they were barely above the hip, the boots sat in the lap); back views unchanged */ : [hx + dir * s * thigh * 0.95 + (1 - s) * sg * 0.015, hipY - 0.01 + (1 - s) * 0.03]; }
    const target = (sg, a, nm) => {
      const S0 = sh(sg);
      let T;
      if (a.at) T = anchor(a.at, sg);
      else { const tf = [a.f[0] * sg * LA, -a.f[1] * LA], ts = [a.sd[0] * dir * LA, -a.sd[1] * LA]; T = [S0[0] + K.lerp(tf[0], ts[0], s), S0[1] + K.lerp(tf[1], ts[1], s)]; }
      if (a.idle) T = [T[0] + Math.sin(t * 1.3 + sg * 1.7 + (S.phase || 0)) * 0.01 * sg, T[1] + Math.sin(t * 2.1 + (S.phase || 0)) * 0.004];
      if (a.shake) T = [T[0] + Math.sin(t * 22) * 0.012, T[1] + Math.cos(t * 22) * 0.01];
      if (a.wave) T = [T[0] + Math.sin(t * 8) * 0.04 * sg, T[1]];
      if (a.swing) T = [T[0] + dir * Math.max(0.25, s) * LA * 0.32 * Math.sin(wph) * a.swing, T[1] - Math.abs(Math.sin(wph)) * 0.01];
      const RQ = nm && o.reachL && o.reachL[nm]; if (RQ) T = [K.lerp(T[0], RQ.p[0], K.clamp(RQ.k)), K.lerp(T[1], RQ.p[1], K.clamp(RQ.k))];
      const pole = [K.lerp(a.pf[0] * sg, a.ps[0] * dir, s), K.lerp(-a.pf[1], -a.ps[1], s)];
      return { T, pole, S0 };
    };
    const armFor = (sg, a, b, nm) => {
      const A0 = target(sg, a, nm); let hk = a.hand, j = ik(A0.S0, A0.T, L1, L2, A0.pole);
      // clothes QC 2026-10-16: a pose blend solves BOTH poses and blends the joints. Blending the elbow pole instead let it
      // cross zero mid-blend and the elbow flipped to the other side in one frame (a sleeve / arm pop)
      if (b && bk > 0) { const B0 = target(sg, b, nm), jb = ik(B0.S0, B0.T, L1, L2, B0.pole), L = (p, q) => [K.lerp(p[0], q[0], bk), K.lerp(p[1], q[1], bk)];
        j = [j[0], L(j[1], jb[1]), L(j[2], jb[2])]; if (bk > 0.5) hk = b.hand; }
      if (nm && o.reachL && o.reachL[nm] && o.reachL[nm].hand && o.reachL[nm].k > 0.5) hk = o.reachL[nm].hand;
      const ff = K.lerp(FACE_FRONT[a.at] ? 1 : 0, b ? (FACE_FRONT[b.at] ? 1 : 0) : (FACE_FRONT[a.at] ? 1 : 0), b ? bk : 0);
      const pts = softLimb(j, 0.35);
      const e = pts[pts.length - 1], q = pts[pts.length - 3], dl = Math.hypot(e[0] - q[0], e[1] - q[1]) || 1;
      // clothes QC 2026-10-16: a hand tucked behind the back is a relaxed hand, never a bare stump (front detective)
      if (hk === 'hide' && ((b && bk > 0.5 ? b.at : a.at) === 'backhand')) hk = 'relax';
      return { j, pts, hand: hk, ff, dv: [(e[0] - q[0]) / dl, (e[1] - q[1]) / dl], sg, at: (b && bk > 0.5 ? b.at : a.at) || null };
    };
    const lead = armFor(dir, P.lead, PB && PB.lead, 'lead'), trail = armFor(-dir, P.trail, PB && PB.trail, 'trail');
    // frac < 1: only the upper part of the arm (shoulder -> elbow), e.g. a hand in front of the chest seen from the back
    const drawArm = (c, Aa, frac = 1, handA = 0) => {
      let pts = frac < 1 ? partial(Aa.pts, frac) : Aa.pts; const ar = S.arm;
      if (frac < 1 && back) {   // seen from behind the elbow sits at the side of the back, never as a stub in the middle of it
        const n = pts.length, e = pts[n - 1], edge = tcx + Aa.sg * (K.lerp(wT, wB, 0.4) + ar.w * 0.15), need = (edge - e[0]) * Aa.sg;
        if (need > 0) pts = pts.map((q, i) => [q[0] + Aa.sg * need * (i / (n - 1)) ** 1.5, q[1]]);
      }
      noodle(c, pts, ar.w, ar.skinPart ? S.skin : ar.sleeve, lw);
      if (ar.skinPart) { // a short sleeve: one tube from the round shoulder, slightly flared, cut square at the hem
        // clothes QC 2026-10-16: the round-capped part used to end 0.05 arm-lengths before the hem, but its cap radius
        // (0.46 sw) is longer than that, so a white crescent of sleeve bulged out BELOW the hem line. The round part now
        // stops one cap radius before the hem; the square-cut part covers the rest.
        let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        const sw = ar.sleeveW || ar.w * 1.25, st = Math.min(1, ar.sleeveTo / frac), capF = (sw * 0.46 + lw) / Math.max(1e-4, L);
        const p = partial(pts, Math.max(0.02, st - capF - 0.01)), q = partial(pts, st, Math.max(0, st - capF - 0.04));
        c.lineJoin = 'round';
        c.lineCap = 'round'; path(c, p); c.strokeStyle = INK; c.lineWidth = sw * 0.92 + 2 * lw; c.stroke();
        c.lineCap = 'butt'; path(c, q); c.lineWidth = sw + 2 * lw; c.stroke();
        c.lineCap = 'round'; path(c, p); c.strokeStyle = ar.sleeve; c.lineWidth = sw * 0.92; c.stroke();
        c.lineCap = 'butt'; path(c, q); c.lineWidth = sw; c.stroke();
        if (ar.sleeveBand) { const qb = partial(pts, ar.sleeveTo, ar.sleeveTo - 0.035); path(c, qb); c.strokeStyle = ar.sleeveBand; c.lineWidth = sw * 0.98; c.stroke(); }
        const e = q[q.length - 1], e0 = q[0], dl = Math.hypot(e[0] - e0[0], e[1] - e0[1]) || 1, nx = -(e[1] - e0[1]) / dl, ny = (e[0] - e0[0]) / dl;
        // the hem line ends exactly on the sleeve's outer ink (butt caps): it used to poke out as two little knobs
        c.lineCap = 'butt'; c.strokeStyle = INK; c.lineWidth = lw * 1.6; c.beginPath(); c.moveTo(e[0] - nx * (sw / 2 + lw * 0.95), e[1] - ny * (sw / 2 + lw * 0.95)); c.lineTo(e[0] + nx * (sw / 2 + lw * 0.95), e[1] + ny * (sw / 2 + lw * 0.95)); c.stroke(); c.lineCap = 'round'; }
      if (ar.plaid && !ar.skinPart) {   // a checked sleeve (outfits: flannel): bands across + along the tube, inside its ink (Guardian 2026-10-29: plain sleeves on a plaid shirt)
        const [dk, lt] = ar.plaid, hw2 = ar.w * 0.5 - lw * 0.2; let acc = 0, next = 0.02, tot = 0; for (let i = 1; i < pts.length; i++) tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        c.save(); c.lineCap = 'butt';
        for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-6, ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
          while (next <= acc + L && next < tot * 0.9) { const f = (next - acc) / L, x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
            c.strokeStyle = K.rgba(dk, 0.42); c.lineWidth = 0.012; c.beginPath(); c.moveTo(x - uy * hw2, y + ux * hw2); c.lineTo(x + uy * hw2, y - ux * hw2); c.stroke(); next += 0.034; }
          acc += L; }
        const off = (q, k) => q.map((p, i) => { const a = q[Math.max(0, i - 1)], b = q[Math.min(q.length - 1, i + 1)], dl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [p[0] - (b[1] - a[1]) / dl * k, p[1] + (b[0] - a[0]) / dl * k]; });
        const body = partial(pts, 0.97, 0.03);
        path(c, off(body, 0)); c.strokeStyle = K.rgba(dk, 0.42); c.lineWidth = 0.012; c.stroke();
        path(c, off(body, ar.w * 0.3)); c.strokeStyle = K.rgba(lt, 0.55); c.lineWidth = 0.003; c.stroke();
        c.restore(); }
      if (ar.upperColor) { const p = partial(pts, ar.upperTo || 0.5); noodle(c, p, ar.w * 1.02, ar.upperColor, lw); }
      if (ar.stripe) { c.lineCap = 'round'; path(c, partial(pts, 0.86)); c.strokeStyle = ar.stripe; c.lineWidth = ar.w * 0.22; c.stroke(); }
      if (ar.flare) { const p = partial(pts, 0.92), qq = p[p.length - 1]; c.fillStyle = ar.cuff || ar.sleeve; c.strokeStyle = INK; c.lineWidth = lw * 2; K.ellipse(c, qq[0], qq[1], ar.w * 0.85, ar.w * 0.85, 0); c.stroke(); c.fill(); }
      else if (!ar.skinPart && ar.cuff) { const p = partial(pts, 0.92, 0.86); c.lineCap = 'butt'; path(c, p); c.strokeStyle = INK; c.lineWidth = ar.w + 2 * lw; c.stroke(); c.strokeStyle = ar.cuff; c.lineWidth = ar.w; c.stroke(); }
      if (frac < 1) {   // upper arm only (back views): the hand fades as the forearm goes in front of the body
        if (handA > 0.02) { const e = pts[pts.length - 1], q = pts[Math.max(0, pts.length - 3)], dl = Math.hypot(e[0] - q[0], e[1] - q[1]) || 1, ga = c.globalAlpha;
          c.globalAlpha = ga * handA; hand(c, e, [(e[0] - q[0]) / dl, (e[1] - q[1]) / dl], Aa.hand === 'hide' ? 'relax' : Aa.hand, ar.hand, S.handColor || S.skin, lw, 1); c.globalAlpha = ga; }
        return; }
      if (o.prop && o.prop.hand === (Aa === lead ? 'lead' : 'trail') && o.prop.under) o.prop.under(c, pts[pts.length - 1], Aa.dv, S, H);
      hand(c, pts[pts.length - 1], Aa.dv, Aa.hand, ar.hand, S.handColor || S.skin, lw, Aa.sg * (s > 0.3 ? dir * Aa.sg : 1) > 0 ? 1 : -1);
      if (ar.watch && Aa === trail) { const p = partial(pts, 0.88), qq = p[p.length - 1]; c.fillStyle = ar.watch; c.strokeStyle = INK; c.lineWidth = lw * 1.4; K.circle(c, qq[0], qq[1], ar.w * 0.45); c.fill(); c.stroke(); }
      if (o.prop && o.prop.hand === (Aa === lead ? 'lead' : 'trail') && o.prop.draw) o.prop.draw(c, pts[pts.length - 1], Aa.dv, S, H);
    };
    const drawLeg = (c, sg) => {
      const hp = [sg * S.hipW * cosT, hipY], b = S.boot;
      let ankle, knee = null;
      if (sitLegs) { knee = kneeAt(sg); ankle = o.sitGround ? [knee[0] + dir * s * shin * 0.42 + (1 - s) * sg * 0.006, o.back ? hipY - b.h * 0.42 : K.lerp(hipY + shin * 0.22, hipY - b.h * 0.42, s)]   /* art review 2026-10: facing us the feet are nearer the camera, so they land BELOW the hip line (on the ground in front), never on the lap */ : [knee[0] + dir * s * 0.03, knee[1] + shin]; }
      else if (walkK > 0) { const lp = wph + (sg === dir ? 0 : Math.PI), st = 0.11 * walkK; ankle = [hp[0] + (S.legSplay || 0) * sg * cosT + dir * Math.max(0.15, s) * Math.sin(lp) * st, -(b.h * 0.5) - Math.max(0, Math.cos(lp)) * 0.05 * walkK];
        // the knee eases in with the walk weight (it used to snap from a straight leg to the IK knee at the first frame)
        if (s >= 0.2) { const j = ik(hp, ankle, (S.legLen - b.h * 0.5) / 2 + 0.003, (S.legLen - b.h * 0.5) / 2 + 0.003, [dir + 1e-4, 0]), wk = K.clamp(walkK * 2.5);
          knee = [K.lerp((hp[0] + ankle[0]) / 2, j[1][0], wk), K.lerp((hp[1] + ankle[1]) / 2, j[1][1], wk)]; } }
      else ankle = [hp[0] + (S.legSplay || 0) * sg * cosT, -(b.h * 0.5)];
      // crouch (Guardian v3, 2026-10-16: stand-ups were one-frame jumps): the whole body is drawn o.crouch units lower
      // (see C.draw), the feet stay on the ground and the knees bend (forward in profile, out + foreshortened in front)
      if (crouchD > 0 && !sitLegs && walkK <= 0) { ankle = [ankle[0] + dir * s * (o.crouchFwd || 0) * (thigh * 0.95 + 0.03), ankle[1] - crouchD];   /* crouchFwd 1 = the feet where a chair-seated pose puts them */ const L = (S.legLen - b.h * 0.5) / 2 + 0.003, j = ik(hp, ankle, L, L, [sg * (1 - s) + dir * s, 0]);
        const mx = (hp[0] + ankle[0]) / 2, my = (hp[1] + ankle[1]) / 2, f = 0.35 + 0.65 * s; knee = [mx + (j[1][0] - mx) * f, my + (j[1][1] - my) * f]; }
      const fx = ankle[0], ay = ankle[1] + b.h * 0.5;   // ay: boot base offset from the ground (0 when standing)
      const legPts = knee ? softLimb([hp, knee, ankle], 0.2) : [hp, ankle];
      noodle(c, legPts, S.legW, S.legColor, lw);
      // side seam stripe (outfits): follows the leg through the knee, offset across the leg (Guardian 2026-10-29: it was a
      // straight hip-to-ankle line drawn inside the boot translate, so seated it left the thigh and crossed the far hand)
      if (S.legStripe) { const off = S.legW * 0.3 * (sitLegs ? 1 : cosT), k = sitLegs ? (dir || 1) : sg, q = legPts.map((p, i) => { const a = legPts[Math.max(0, i - 1)], b2 = legPts[Math.min(legPts.length - 1, i + 1)], dl = Math.hypot(b2[0] - a[0], b2[1] - a[1]) || 1, nx = (b2[1] - a[1]) / dl, ny = -(b2[0] - a[0]) / dl; return [p[0] + nx * off * k, p[1] + ny * off * k]; });
        if (!sitLegs) q[0] = [q[0][0], q[0][1] + 0.02]; else q.splice(0, 2); c.strokeStyle = S.legStripe; c.lineWidth = S.legW * 0.18; c.lineCap = 'butt'; path(c, q); c.stroke(); c.lineCap = 'round'; }
      c.save(); c.translate(0, ay);
      if (S.flare) { const fw = S.legW * 0.5, fw2 = S.legW * (0.5 + S.flare); c.fillStyle = S.legColor; c.strokeStyle = INK; c.lineWidth = lw * 2;
        c.beginPath(); c.moveTo(fx - fw, -b.h - 0.07); c.lineTo(fx - fw2, -b.foot * 0.6); c.lineTo(fx + fw2 + dir * s * 0.01, -b.foot * 0.6); c.lineTo(fx + fw, -b.h - 0.07); c.stroke(); c.fill(); }
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
      c.restore();
    };
    const torsoPath = (c) => {
      const r = Math.min(wT * 0.75, S.torso.round ?? 0.05), rb = Math.min(wB * 0.3, 0.03);
      c.beginPath(); c.moveTo(tcx - wT + r, Ttop); c.lineTo(tcx + wT - r, Ttop); c.quadraticCurveTo(tcx + wT, Ttop, tcx + wT, Ttop + r);
      c.quadraticCurveTo(tcx + (wT + wB) / 2 + (S.torso.belly || 0) * dir * s, (Ttop + Tbot) / 2, tcx + wB, Tbot - rb); c.quadraticCurveTo(tcx + wB, Tbot, tcx + wB - rb, Tbot);
      c.lineTo(tcx - wB + rb, Tbot); c.quadraticCurveTo(tcx - wB, Tbot, tcx - wB, Tbot - rb);
      c.quadraticCurveTo(tcx - (wT + wB) / 2, (Ttop + Tbot) / 2, tcx - wT, Ttop + r); c.quadraticCurveTo(tcx - wT, Ttop, tcx - wT + r, Ttop); c.closePath();
    };
    const B = { s, dir, t, lw, tcx, Ttop, Tbot, wT, wB, shY, hipY, cosT, torsoPath, hcx, hcy, hw, hh, fs, faceDir, seated: !!o.seated, sitLegs, back, kneeAt, tilt, sq: E.sq || 1, crouch: crouchD, S, H, drag: o.drag || 0 };
    const headDraw = (c, layer) => {
      c.save(); c.translate(hcx, hcy + hh); c.rotate(tilt); c.scale(1 / Math.sqrt(E.sq || 1), E.sq || 1); c.translate(0, -hh);
      if (layer === 'back') { if (S.hairBack) S.hairBack(c, H, B); c.restore(); return; }
      const hp = () => headPath(c, S.head);
      if (S.ears) S.ears(c, H, B);
      if (S.head.noLine) { hp(); c.fillStyle = S.skin; c.fill(); } else shape(c, hp, S.skin, lw);
      if (back) { if (S.backHair) S.backHair(c, H, B); if (S.hairBack) S.hairBack(c, H, B); if (S.hat) S.hat(c, H, B); if (S.headTop) S.headTop(c, H, B, null); c.restore(); return; }
      if (S.hairFront) S.hairFront(c, H, B);
      const fi = C.face(c, H);
      if (S.hat) S.hat(c, H, B);
      if (S.F_late || (S.face.brows && S.face.browsLate)) drawBrows(c, H, ...H._browArgs);
      if (S.headTop) S.headTop(c, H, B, fi);
      c.restore();
    };
    const drawBoard = (c) => { // Mila's clipboard: board + paper + clip, held at the chest
      const [bx, by] = boardAt(), w = 0.075 * (1 - 0.35 * s), hh2 = 0.1;
      c.save(); c.translate(bx, by); c.rotate(-0.1 * dir);
      c.fillStyle = '#b88a5a'; c.strokeStyle = INK; c.lineWidth = lw * 2; K.rrect(c, -w / 2, -hh2 / 2, w, hh2, 0.008); c.stroke(); c.fill();
      c.fillStyle = '#f6f1e4'; K.rrect(c, -w * 0.4, -hh2 * 0.38, w * 0.8, hh2 * 0.82, 0.004); c.fill();
      c.strokeStyle = '#9aa2b4'; c.lineWidth = lw * 0.9; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-w * 0.3, -hh2 * 0.22 + k * hh2 * 0.17); c.lineTo(w * (0.3 - (k % 2) * 0.12), -hh2 * 0.22 + k * hh2 * 0.17); c.stroke(); }
      c.fillStyle = '#8f8a88'; c.strokeStyle = INK; c.lineWidth = lw * 1.2; K.rrect(c, -w * 0.18, -hh2 * 0.58, w * 0.36, hh2 * 0.14, 0.004); c.fill(); c.stroke();
      c.restore();
    };
    const drawPencil = (c, Hd) => { c.strokeStyle = INK; c.lineWidth = 0.012 + lw * 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(Hd[0], Hd[1]); c.lineTo(Hd[0] + 0.012 * dir, Hd[1] - 0.04); c.stroke();
      c.strokeStyle = '#e8b33a'; c.lineWidth = 0.012; c.stroke(); };
    const drawLens = (c, Hd) => { const lx = Hd[0] + faceDir * (0.004 - 0.01 * s), ly = Hd[1] - 0.07, r = 0.04 + 0.007 * s;   // profile: the glass sits over the whole real eye (no white crescent peeking out)
      c.strokeStyle = INK; c.lineWidth = 0.012 + lw * 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(Hd[0], Hd[1] + 0.02); c.lineTo(lx, ly + r); c.stroke(); c.strokeStyle = '#6a3e22'; c.lineWidth = 0.012; c.stroke();
      // Producer 2026-10-29 («se ve borroso su ojo»): no see-through tint over the real eye (it read as a blurred / doubled eye).
      // The glass shows ONE magnified eye drawn crisp and big: skin, white, dark pupil looking where he looks, catchlight, lid line
      const lk = o.look || [faceDir, 0], pxo = K.clamp(lk[0] * 0.22 + faceDir * s * 0.12, -0.3, 0.3) * r, pyo = K.clamp(-lk[1] * 0.18, -0.2, 0.2) * r;
      c.save(); K.circle(c, lx, ly, r); c.clip();
      c.fillStyle = S.skin; c.fillRect(lx - r, ly - r, 2 * r, 2 * r);
      c.fillStyle = '#fbf7ee'; K.ellipse(c, lx, ly + r * 0.06, r * 0.84, r * 0.74); c.fill(); c.strokeStyle = INK; c.lineWidth = r * 0.09; c.stroke();
      c.fillStyle = '#1e1216'; K.circle(c, lx + pxo, ly + r * 0.08 + pyo, r * 0.4); c.fill();
      c.fillStyle = '#ffffff'; K.circle(c, lx + pxo - r * 0.13, ly - r * 0.05 + pyo, r * 0.12); c.fill();
      c.strokeStyle = INK; c.lineWidth = r * 0.13; c.lineCap = 'round'; c.beginPath(); c.moveTo(lx - r * 0.62, ly - r * 0.66); c.quadraticCurveTo(lx, ly - r * 0.9, lx + r * 0.62, ly - r * 0.64); c.stroke();
      c.restore();
      if (FACE) { const q = toPx(c, lx, ly), pq = toPx(c, lx + pxo, ly + r * 0.08 + pyo), k2 = scaleOf(c); FACE.lens = [q[0], q[1], r * k2]; FACE.lensPupil = [pq[0], pq[1], r * 0.4 * k2]; }
      K.circle(c, lx, ly, r); c.strokeStyle = INK; c.lineWidth = 0.011 + lw * 2; c.stroke(); c.strokeStyle = '#d9a63a'; c.lineWidth = 0.011; c.stroke();   // the rim (re-issue the circle path)
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = lw * 1.4; c.beginPath(); c.arc(lx, ly, r * 0.86, -2.6, -1.9); c.stroke(); };
    const upper = (c, fn) => { if (!lean) return fn(); c.save(); c.translate(0, hipY); c.rotate(lean * dir); c.translate(0, -hipY); fn(); c.restore(); };
    return {
      lead, trail, H, B,
      layers: {
        back(c) {
          c.translate(0, bobY);
          upper(c, () => {
            if (!back) headDraw(c, 'back'); if (s > 0.05) drawArm(c, back ? trail : lead);
            // front view: a hand tucked behind the back (detective) is drawn behind the torso (it used to cross the apron)
            if (!back && s <= 0.05) for (const Aa of [trail, lead]) if (Aa.at === 'backhand') drawArm(c, Aa);
            // back views: a hand in front of the face / chest is hidden behind the head and torso (Guardian 2026-10-16:
            // the visor fist was drawn on the back of Eli's head, A14; Mila's crossed arm lay across her back, A16)
            // (back views: such arms are drawn as upper arms in the front layer, see front())
          });
          if ((legsOn || sitLegs) && s > 0.05) drawLeg(c, back ? -dir : dir);
        },
        body(c) {
          c.translate(0, bobY);
          if (back && S.backUnder) S.backUnder(c, B);       // garment parts on the far (front) side, peeking past the body
          if (SOLIDC && legsOn && s < 0.9) {                 // the leg slot under the hem is solid for the shade test
            const m = c.getTransform(); SOLIDC.setTransform(m); SOLIDC.fillStyle = '#000';
            const gx = S.hipW * cosT, y0 = Tbot - 0.03, y1 = S.solidTo != null ? S.solidTo(S) : Tbot + 0.012;
            SOLIDC.fillRect(tcx - gx, y0, gx * 2, Math.max(0, y1 - y0));
            // Guardian 2026-10-29 (traje_casa): the far leg lives in the back layer, so the hem over it saw "empty" below and got a
            // rectangular shade slab (tee hem at night, jeans top at golden; also eli1's apron hem in 3/4). The band just under the
            // hem is solid across the whole torso bottom, deeper than the largest shade offset (shadeMax 0.028)
            SOLIDC.fillRect(tcx - wB, y0, wB * 2, Tbot + 0.03 - y0); SOLIDC.setTransform(1, 0, 0, 1, 0, 0);
          }
          if (legsOn) { if (s <= 0.05) { drawLeg(c, -1); drawLeg(c, 1); } else drawLeg(c, back ? dir : -dir); }
          upper(c, () => {
            if (S.under) S.under(c, B);
            if (!S.headOver) headDraw(c, 'front');
            shape(c, () => torsoPath(c), S.torso.color, lw);
            if (back) {
              if (S.outfitBack) { c.save(); torsoPath(c); c.clip(); S.outfitBack(c, B); c.restore(); }
              if (S.outfitBackTop) S.outfitBackTop(c, B);   // parts that hang past the torso (apron bow + ties)
            } else {
              if (S.outfit) { c.save(); torsoPath(c); c.clip(); S.outfit(c, B); c.restore(); }
              if (S.collar) S.collar(c, B);            // the neckline first: straps and apron cords go over it
              if (S.outfitTop) S.outfitTop(c, B);
            }
            if (S.headOver) headDraw(c, 'front');
          });
          if (sitLegs && s > 0.05) drawLeg(c, back ? dir : -dir);
          // seated garments that lie over the lap (skirts, coat tails: outfits.js); drawn over both thighs, under the arms
          if (sitLegs && S.lap && !back) S.lap(c, B);
        },
        front(c) {
          c.translate(0, bobY);
          if (sitLegs && s <= 0.05) { drawLeg(c, -1); drawLeg(c, 1); }
          upper(c, () => {
            const prop = P.prop || (PB && PB.prop);
            // a prop that comes or goes with a pose blend fades over the middle of the blend (it used to pop at k = 0.5)
            const propA = !PB || P.prop === PB.prop ? 1 : K.clamp(((P.prop === prop ? 1 - bk : bk) - 0.3) / 0.4);
            const ga = c.globalAlpha; c.globalAlpha = ga * propA;
            if (prop === 'clipboard' && !back) drawBoard(c);
            c.globalAlpha = ga;
            if (s <= 0.05) {
              const crossed = (o.pose === 'crossed' && bk < 0.5) || (PB && o.blend.pose === 'crossed' && bk >= 0.5);
              for (const Aa of (crossed ? [lead, trail] : [trail, lead])) if (!(back && Aa.ff > 0) && !(!back && Aa.at === 'backhand')) drawArm(c, Aa);
            } else if (!(back && lead.ff > 0)) drawArm(c, back ? lead : trail);
            // back views: a hand in front of the face / chest is hidden, but the UPPER arm still shows along the back
            // (clothes QC 2026-10-16: crossed arms / visor from behind read as an armless torso); a blend into / out of
            // such a pose shortens the arm continuously in this same layer (no pop at k = 0.5, no layer swap)
            if (back) for (const Aa of (s > 0.05 ? [lead] : [lead, trail])) if (Aa.ff > 0) { const f = K.ease.sine(Aa.ff); drawArm(c, Aa, Math.min(0.999, 1 - 0.5 * f), 1 - f); }
            c.globalAlpha = ga * propA;
            if (prop === 'clipboard' && !back) drawPencil(c, lead.pts[lead.pts.length - 1]);
            if (prop === 'magnifier' && !back) drawLens(c, trail.pts[trail.pts.length - 1]);   // clothes QC: from behind (also 3/4) the lens is in front of the face, hidden by the head
            c.globalAlpha = ga;
            if (S.front && !back) S.front(c, B);
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
      const rch = o.reach ? Object.fromEntries(Object.entries(o.reach).map(([nm, q]) => { const z = m.transformPoint(new DOMPoint(q.p[0], q.p[1])); return [nm, Object.assign({}, q, { p: [z.x, z.y] })]; })) : undefined;
      const r = C.draw(ctx, id, p.x, p.y, u * k, Object.assign({}, o, { shadowScale: k }, rch ? { reach: rch } : {}));
      ctx.restore();
      const inv = m.inverse(), back = q => { const z = inv.transformPoint(new DOMPoint(q[0], q[1])); return [z.x, z.y]; };
      const hh = back(r.head);
      return { head: [hh[0], hh[1], r.head[2] / k], hands: { lead: back(r.hands.lead), trail: back(r.hands.trail) }, top: back([0, r.top])[1] };
    }
    const view = o.view || 'front', s = TURN[view] ?? (typeof view === 'number' ? view : 0), dir = o.dir || 1;
    const oo = Object.assign({ s, dir, pose: 'stand', expr: 'neutral' }, o, { s, dir, back: o.backView ?? String(view).startsWith('back') });   // backView: a numeric view seen from behind (continuous turns)
    // o.reach = { lead | trail: { p: [x, y] (same space as x, y), k: 0..1 blend from the pose, hand } }: that hand goes to the
    // point (2-bone IK, clamped to the arm's reach). Contact between characters = hands that really touch (Producer 2026-10-29:
    // never a drawn connector line / stick between two characters)
    if (o.reach) { const so0 = o.seated ? S.legLen : Math.max(0, Math.min(o.crouch || 0, S.legLen * 0.75)); oo.reachL = {};
      for (const [nm, q] of Object.entries(o.reach)) if (q && q.p) oo.reachL[nm] = { p: [(q.p[0] - x) / u, (q.p[1] - y) / u - so0], k: q.k ?? 1, hand: q.hand }; }
    const R = (S.kind === 'biped' ? biped : S.build)(S, oo);
    const crouchU = o.seated ? 0 : Math.max(0, Math.min(o.crouch || 0, S.legLen * 0.75));   // body drawn this much lower (feet stay)
    const bw = Math.ceil(u * (S.box ? S.box[0] : 1.8)), bh = Math.ceil(u * (S.box ? S.box[1] : 1.62));
    const ox = bw / 2, oy = Math.ceil(u * (S.box ? S.box[2] : 1.42)) - (o.seated ? Math.round(S.legLen * u) : 0);
    // crop the buffer to the visible part of the target canvas (+ margin)
    const CW = ctx.canvas.width, CH = ctx.canvas.height, mg = 8;
    const sx0 = Math.max(Math.round(x - ox), -mg), sy0 = Math.max(Math.round(y - oy), -mg);
    const sx1 = Math.min(Math.round(x - ox) + bw, CW + mg), sy1 = Math.min(Math.round(y - oy) + bh, CH + mg);
    if (sx1 <= sx0 || sy1 <= sy0) return { head: [x, y, 0], hands: { lead: [x, y], trail: [x, y] }, top: y };
    const W = sx1 - sx0, Hh = sy1 - sy0, lox = x - sx0, loy = y - sy0;
    const light = Object.assign({}, C.LIGHT.board, o.light || {});
    const OUT = buf('out', W, Hh), MK = buf('eyemask', W, Hh), lwS = S.lw || 0.0075;
    const LOG = root.__faceLog && ctx.canvas && ctx.canvas.isConnected ? root.__faceLog : null;
    const rec = LOG ? { id, expr: C.exprName(o.expr, o.exprBlend), view, blink: o.blink || 0, talk: o.talk || 0, look: o.look || null, headTurn: o.headTurn || 0, hairFlop: o.hairFlop || 0, pose: o.pose || 'stand', u, eyes: [] } : null;
    for (const name of (o.dbgLayers || ['back', 'body', 'front'])) {
      const Lb = buf('L', W, Hh), c = Lb.ctx, SB = buf('solid', W, Hh);
      SOLIDC = SB.ctx;
      FACE = rec;
      EYES = [];
      c.setTransform(u, 0, 0, u, lox, loy); if (o.seated) c.translate(0, S.legLen); else if (crouchU) c.translate(0, crouchU);
      R.layers[name](c);
      FACE = null;
      c.setTransform(1, 0, 0, 1, 0, 0);
      if (EYES.length) eyeMask(MK, EYES, -lwS * 0.2);
      EYES = null;
      SOLIDC = null;
      lightLayer(Lb, name === 'back' ? Object.assign({}, light, { shadeA: light.shadeA * 1.4 }) : light, u, lwS, MK, name === 'body' ? SB : null);
      OUT.ctx.drawImage(Lb.c, 0, 0);
    }
    rimLight(OUT, light, u, lwS, MK);
    if (o.fog) { OUT.ctx.globalCompositeOperation = 'source-atop'; OUT.ctx.fillStyle = K.rgba(o.fog[0], o.fog[1]); OUT.ctx.fillRect(0, 0, W, Hh); OUT.ctx.globalCompositeOperation = 'source-over'; }
    if (rec) { const so0 = o.seated ? S.legLen : crouchU, h0 = R.info.head, mp = p => [x + p[0] * u - sx0, y + (p[1] + so0) * u - sy0];
      rec.body = bodyStats(OUT, sx0, sy0, { head: [...mp(h0), h0[2] * u], hands: [mp(R.info.hands.lead), mp(R.info.hands.trail)], ink: lwS * u, hand: (S.arm.hand || 0.027) * 1.45 * u }); }
    if (o.shadow && !o.seated) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = K.rgba(o.shadowColor || '#3c2a52', o.shadow); K.ellipse(ctx, x, y, u * (S.shadowW || 0.16), u * 0.022); ctx.fill(); ctx.restore(); }
    ctx.drawImage(OUT.c, sx0, sy0);
    if (rec) { for (const e of rec.eyes) { e.cx += sx0; e.cy += sy0; if (e.px != null) { e.px += sx0; e.py += sy0; } } if (rec.lens) { rec.lens[0] += sx0; rec.lens[1] += sy0; } if (rec.lensPupil) { rec.lensPupil[0] += sx0; rec.lensPupil[1] += sy0; } rec.alpha = ctx.globalAlpha; LOG.push(rec); }
    const so = o.seated ? S.legLen : crouchU, hi = R.info.head, hx = x + hi[0] * u, hy = y + (hi[1] + so) * u, hr = hi[2] * u;
    if (rec) { rec.head = [hx, hy, hr]; rec.foot = [x, y]; rec.seated = !!o.seated; }
    const ex = (o.extras || C.exprMix(o.expr, o.exprBlend).extras || []);
    for (const e of ex) K.char.extra(ctx, hx, hy - hr * 0.2, hr * (S.extraK || 1.0), e, o.t || 0, { ink: '#24161a' });
    const map = p => [x + p[0] * u, y + (p[1] + so) * u];
    return { head: [hx, hy, hr], hands: { lead: map(R.info.hands.lead), trail: map(R.info.hands.trail) }, top: y + (R.info.top + so) * u };
  };

  // where the hands/head WOULD be for a pose (no drawing): props like the steering wheel stay put while the hands act
  C.probe = function (id, x, y, u, o = {}) {
    if (C.ALIAS[id]) id = C.ALIAS[id]; const S = C.SPECS[id], view = o.view || 'front', s = TURN[view] ?? (typeof view === 'number' ? view : 0), dir = o.dir || 1;
    const R = biped(S, Object.assign({ s, dir, pose: 'stand', expr: 'neutral' }, o, { s, dir, back: o.backView ?? String(view).startsWith('back') })), so = o.seated ? S.legLen : Math.max(0, Math.min(o.crouch || 0, S.legLen * 0.75));
    const map = p => [x + p[0] * u, y + (p[1] + so) * u];
    return { hands: { lead: map(R.info.hands.lead), trail: map(R.info.hands.trail) }, head: map(R.info.head) };
  };
  C.SPECS = {};
  C.ALIAS = {};
  C.define = (id, spec) => { C.SPECS[id] = spec; };
})(typeof window !== 'undefined' ? window : globalThis);
