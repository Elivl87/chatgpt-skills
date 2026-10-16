/* Diez Mil Puntos art kit · text boxes (2026-10-16). Producer: Eli and Mila have NO voices; every line they say is a
   text box «más acorde al arte». The box belongs to the illustrated world, not to a comic UI:
     - a piece of warm paper cut by hand (wobbly edge, seeded by the text so it never boils), paper tooth + fibres,
       lit by the scene (warm glow at golden hour, cool and dimmer at night, neutral at noon);
     - a variable-width ink BRUSH outline (dry-brush breaks), the tail is the same brush stroke tapering to a point,
       stopping beside the speaker's head (never over the face);
     - a soft drop shadow cast away from the scene light, in the scene's shadow colour;
     - hand lettering: Shantell Sans (SIL OFL 1.1, static instances in brand/fonts/ShantellSans/: Speech 600 / Shout 800
       with maximum informality and bounce / Soft 450 for whispers and thoughts);
     - a gentle pop-in (scale 0.7 -> 1 with a small overshoot and a 2° settle) and pop-out (fade + 0.92 scale).
   Variants (o.kind): 'speech' (default), 'shout' (bigger letters, a jagged but painterly paper edge, a small shake),
   'whisper' (smaller, dotted ink, slightly translucent paper, no overshoot), 'thought' (a lobed cloud, a trail of three
   small ink-ringed dots instead of a tail).
   Reading time: K.tbox.readTime(text) = 0.4 s + 0.06 s per character; a box stays up for max(slot, read time).
   Placement (K.tbox.place): beside the speaker's head on the open side, inside the 48 px safe margin, above the bottom
   12 % (progress-bar band) and the duration-chip corner, never over any head zone in `avoid` (+ the speaker's own).

     K.tbox.draw(ctx, { text, kind, head: [x, y, r] (screen px of the speaker's head, or null = off screen), a (0..1
       show progress: 0 hidden, ramps in/out), age (s since the box appeared), light: 'golden'|'dusk'|'night'|'noon'|
       'field', side: -1|1 (preferred side), avoid: [[x0, y0, x1, y1], ...], at: [x, y] (force the box centre), seed })
     -> { rect: [x0, y0, x1, y1], tip: [x, y] }                                               (screen = design units) */
(function (root) {
  const K = root.K;
  const T = K.tbox = {};
  const INK = '#2a1a1e';
  T.FONTS = { speech: 'TB Speech', shout: 'TB Shout', whisper: 'TB Soft', thought: 'TB Soft' };
  T.SIZE = { speech: 50, shout: 70, whisper: 40, thought: 44 };            // px at 1080p (>= 3.7 % of the height)
  T.LIGHT = {
    golden: { paper: '#f8eedb', glow: '#ffd9a0', glowA: 0.35, shadow: '#3a2050', shadowA: 0.32, off: [7, 10], ink: INK, rim: '#ffe2a8', rimA: 0.5 },
    field: { paper: '#f8efde', glow: '#ffe0aa', glowA: 0.28, shadow: '#3c2a52', shadowA: 0.3, off: [9, 9], ink: INK, rim: '#fff0c8', rimA: 0.35 },
    dusk: { paper: '#f3e6d6', glow: '#ffcb8e', glowA: 0.3, shadow: '#2a1838', shadowA: 0.36, off: [5, 10], ink: INK, rim: '#ffd9a0', rimA: 0.45 },
    night: { paper: '#e7e2d8', glow: '#9fb4ff', glowA: 0.18, shadow: '#03040c', shadowA: 0.5, off: [4, 9], ink: '#1d1420', rim: '#b8c8ff', rimA: 0.45, tint: '#3a4aa0', tintA: 0.1 },
    noon: { paper: '#f6f2ea', glow: '#ffffff', glowA: 0.15, shadow: '#4a5068', shadowA: 0.24, off: [0, 9], ink: INK, rim: '#ffffff', rimA: 0.0 },
  };
  T.readTime = text => 0.4 + 0.06 * [...String(text)].length;

  // ---------------------------------------------------------------- deterministic texture tiles (built once)
  let paperTile = null;
  function paper() {
    if (paperTile) return paperTile;
    const s = 256, c = K.canvas(s, s), x = c.ctx, img = x.createImageData(s, s), d = img.data, r = K.rng(9091);
    for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) {
      const n = K.fbm(i * 0.035, j * 0.035, 4, 31), f = K.fbm(i * 0.6, j * 0.03, 2, 47);      // tooth + horizontal fibres
      const v = 128 + (n - 0.5) * 70 + (f - 0.5) * 40 + (r() - 0.5) * 18, k = (j * s + i) * 4;
      d[k] = d[k + 1] = d[k + 2] = Math.max(0, Math.min(255, v)); d[k + 3] = 255;
    }
    x.putImageData(img, 0, 0); paperTile = c; return c;
  }

  // ---------------------------------------------------------------- shapes (closed polylines, screen px)
  function wobble(seed) { const r = K.rng(seed); const ph = [r() * 6.28, r() * 6.28, r() * 6.28]; return (u, amp) => amp * (0.55 * Math.sin(u * 3 + ph[0]) + 0.3 * Math.sin(u * 7 + ph[1]) + 0.15 * Math.sin(u * 13 + ph[2])); }
  // a hand-cut rounded rectangle: points every ~6 px, corner radius rr, edge wobble amp
  function cutRect(x0, y0, w, h, rr, amp, seed) {
    const W = wobble(seed), pts = [], per = 2 * (w + h - 4 * rr) + 2 * Math.PI * rr, n = Math.max(48, Math.round(per / 6));
    const segs = [[x0 + rr, y0, x0 + w - rr, y0], null, [x0 + w, y0 + rr, x0 + w, y0 + h - rr], null, [x0 + w - rr, y0 + h, x0 + rr, y0 + h], null, [x0, y0 + h - rr, x0, y0 + rr], null];
    const corners = [[x0 + w - rr, y0 + rr, -Math.PI / 2], [x0 + w - rr, y0 + h - rr, 0], [x0 + rr, y0 + h - rr, Math.PI / 2], [x0 + rr, y0 + rr, Math.PI]];
    const lens = [w - 2 * rr, Math.PI * rr / 2, h - 2 * rr, Math.PI * rr / 2, w - 2 * rr, Math.PI * rr / 2, h - 2 * rr, Math.PI * rr / 2];
    let acc = 0;
    for (let k = 0; k < 8; k++) {
      const m = Math.max(2, Math.round(n * lens[k] / per));
      for (let i = 0; i < m; i++) {
        const f = i / m, u = (acc + f * lens[k]) / per * K.TAU;
        let px, py, nx, ny;
        if (segs[k]) { const s = segs[k]; px = K.lerp(s[0], s[2], f); py = K.lerp(s[1], s[3], f); const dx = s[2] - s[0], dy = s[3] - s[1], L = Math.hypot(dx, dy) || 1; nx = dy / L; ny = -dx / L; }
        else { const c = corners[(k - 1) / 2], a = c[2] + f * Math.PI / 2; px = c[0] + Math.cos(a) * rr; py = c[1] + Math.sin(a) * rr; nx = Math.cos(a); ny = Math.sin(a); }
        const o = W(u, amp); pts.push([px + nx * o, py + ny * o, u]);
      }
      acc += lens[k];
    }
    return pts;
  }
  // a jagged but painterly shout edge: an ellipse-ish card whose rim breaks into soft irregular points
  function burst(cx, cy, w, h, seed) {
    const r = K.rng(seed), n = 11 + Math.round(w / 140), pts = [], N = n * 10;
    const amp = []; for (let i = 0; i < n; i++) amp.push(0.07 + r() * 0.07);
    for (let j = 0; j < N; j++) {
      const a = j / N * K.TAU, i = Math.floor(j / 10), f = (j % 10) / 10;
      // painterly points: a broad brushy swell rising to a soft tip (never razor comic spikes)
      const spike = amp[i] * (0.35 * Math.sin(f * Math.PI) + 0.65 * Math.pow(Math.sin(f * Math.PI), 3));
      const ex = Math.cos(a), ey = Math.sin(a), sq = Math.pow(Math.abs(ex) ** 4 + Math.abs(ey) ** 4, -0.25);   // squircle
      const k = sq * (1 + spike);
      pts.push([cx + ex * w / 2 * k, cy + ey * h / 2 * k, a]);
    }
    return pts;
  }
  function cloud(cx, cy, w, h, seed) {
    const r = K.rng(seed), n = 9 + Math.round(w / 110), pts = [];
    for (let i = 0; i < n; i++) {
      const a0 = i / n * K.TAU, a1 = (i + 1) / n * K.TAU, bulge = 0.09 + r() * 0.05;
      for (let j = 0; j < 12; j++) {
        const f = j / 12, a = K.lerp(a0, a1, f), k = 1 + bulge * Math.sqrt(Math.sin(f * Math.PI));   // round lobes
        const ex = Math.cos(a), ey = Math.sin(a), sq = Math.pow(Math.abs(ex) ** 3 + Math.abs(ey) ** 3, -1 / 3);
        pts.push([cx + ex * w / 2 * sq * k, cy + ey * h / 2 * sq * k, a]);
      }
    }
    return pts;
  }
  // insert a tapering tail into the outline: base centred on the outline point nearest the tip
  function withTail(pts, tip, baseW) {
    let bi = 0, bd = Infinity;
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    for (let i = 0; i < pts.length; i++) {   // the edge point whose direction from the centre is closest to the tip's
      const dx = pts[i][0] - cx, dy = pts[i][1] - cy, tx = tip[0] - cx, ty = tip[1] - cy;
      const d = -(dx * tx + dy * ty) / ((Math.hypot(dx, dy) * Math.hypot(tx, ty)) || 1);
      if (d < bd) { bd = d; bi = i; }
    }
    const n = pts.length; let i0 = bi, i1 = bi, L = 0;
    while (L < baseW / 2 && i0 > bi - n / 4) { const a = pts[(i0 - 1 + n) % n], b = pts[(i0 + n) % n]; L += Math.hypot(a[0] - b[0], a[1] - b[1]); i0--; }
    L = 0; while (L < baseW / 2 && i1 < bi + n / 4) { const a = pts[(i1 + 1) % n], b = pts[i1 % n]; L += Math.hypot(a[0] - b[0], a[1] - b[1]); i1++; }
    const A = pts[(i0 + n) % n], B = pts[i1 % n], out = [];
    for (let k = i1; k <= i0 + n; k++) out.push(pts[k % n]);     // the outline from B round to A (skips the base)
    // the two sides of the tail: curved (a brush flick), A -> tip -> B, with taper weights
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = tip[0] - mx, dy = tip[1] - my, Lt = Math.hypot(dx, dy) || 1, nx = -dy / Lt, ny = dx / Lt;
    const bend = Lt * 0.18, side = [];
    for (let j = 1; j < 12; j++) { const f = j / 12, q = 1 - f; const bx = mx + dx * f + nx * bend * Math.sin(f * Math.PI) * 0.6, by = my + dy * f + ny * bend * Math.sin(f * Math.PI) * 0.6;
      side.push([bx + (A[0] - mx) * q, by + (A[1] - my) * q, null, 1 - f * 0.92]); }
    out.push(...side); out.push([tip[0], tip[1], null, 0.06]);
    for (let j = 11; j >= 1; j--) { const f = j / 12, q = 1 - f; const bx = mx + dx * f + nx * bend * Math.sin(f * Math.PI) * 0.6, by = my + dy * f + ny * bend * Math.sin(f * Math.PI) * 0.6;
      out.push([bx + (B[0] - mx) * q, by + (B[1] - my) * q, null, 1 - f * 0.92]); }
    return out;
  }
  function polyPath(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); }
  // a variable-width brush ring along a closed polyline (dry-brush: width and opacity breathe along the stroke)
  function brush(c, pts, w, ink, seed, dotted) {
    const n = pts.length, r = K.rng(seed), W = wobble(seed + 7);
    if (dotted) {   // whisper: soft round ink dots
      let L = 0; c.fillStyle = ink;
      for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; const d = Math.hypot(b[0] - a[0], b[1] - a[1]); L += d;
        if (L > w * 3.2) { L = 0; c.globalAlpha *= 1; c.beginPath(); c.arc(a[0], a[1], w * 0.62 * (0.85 + r() * 0.3), 0, K.TAU); c.fill(); } }
      return;
    }
    const outer = [], inner = [];
    for (let i = 0; i < n; i++) {
      const p = pts[(i - 1 + n) % n], q = pts[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      const nx = dy / L, ny = -dx / L, taper = pts[i][3] ?? 1;
      const ww = w * taper * (0.72 + 0.28 * (0.5 + W(i / n * K.TAU * 3, 1)) + 0.12 * Math.sin(i * 0.9));
      outer.push([pts[i][0] + nx * ww * 0.55, pts[i][1] + ny * ww * 0.55]); inner.push([pts[i][0] - nx * ww * 0.45, pts[i][1] - ny * ww * 0.45]);
    }
    c.fillStyle = ink; c.beginPath(); c.moveTo(outer[0][0], outer[0][1]); for (const p of outer) c.lineTo(p[0], p[1]); c.closePath();
    c.moveTo(inner[n - 1][0], inner[n - 1][1]); for (let i = n - 1; i >= 0; i--) c.lineTo(inner[i][0], inner[i][1]); c.closePath(); c.fill('evenodd');
    // dry-brush breaks: a few short gaps of paper showing through the ink (seeded)
    const ga = c.globalAlpha; c.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < 3; k++) { const i = Math.floor(r() * n), a = pts[i]; c.globalAlpha = ga * 0.55; c.beginPath(); c.ellipse(a[0], a[1], w * 0.9, w * 0.22, r() * 3, 0, K.TAU); c.fill(); }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = ga;
  }

  // ---------------------------------------------------------------- layout
  function wrap(c, text, font, maxW) {
    c.font = font; const words = String(text).split(' '), lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur); return lines;
  }
  function measure(c, o) {
    const kind = o.kind || 'speech', fs = Math.round((o.size || T.SIZE[kind])), font = `${fs}px "${T.FONTS[kind]}"`;
    const lines = wrap(c, o.text, font, o.maxW || (kind === 'shout' ? 820 : 620));
    c.font = font; const tw = Math.max(...lines.map(l => c.measureText(l).width)), lh = fs * 1.12;
    const padX = kind === 'shout' ? fs * 1.0 : kind === 'thought' ? fs * 0.95 : fs * 0.62, padY = kind === 'shout' ? fs * 0.8 : kind === 'thought' ? fs * 0.75 : fs * 0.42;
    return { kind, fs, font, lines, tw, lh, w: tw + padX * 2, h: lines.length * lh + padY * 2 };
  }
  // choose the box centre beside the speaker's head (screen px, design units)
  T.place = function (m, head, o = {}) {
    const W = K.W, H = K.H, M = 48, bottom = H * 0.88 - 8, chip = [W - 300, 0, W, 100];
    if (o.at) return o.at;
    const hx = head ? head[0] : W * 0.5, hy = head ? head[1] : H * 0.3, hr = head ? Math.max(14, head[2]) : 0;
    const avoid = (o.avoid || []).concat(head ? [[hx - hr * 1.15, hy - hr * 1.75, hx + hr * 1.15, hy + hr * 1.2]] : []);
    const pref = o.side || (hx > W * 0.55 ? -1 : 1), cands = [];
    const gap = hr * 1.25 + 24;
    for (const sd of [pref, -pref]) for (const dy of [-0.9, -0.4, -1.5, 0.2, -2.2]) cands.push([hx + sd * (gap + m.w / 2), hy + dy * hr - m.h * 0.35, sd]);
    cands.push([hx, hy - hr * 2 - m.h / 2 - 20, pref]);
    let best = null, bs = Infinity;
    for (const [cx0, cy0, sd] of cands) {
      const cx = Math.max(M + m.w / 2, Math.min(W - M - m.w / 2, cx0)), cy = Math.max(M + m.h / 2, Math.min(bottom - m.h / 2, cy0));
      const R = [cx - m.w / 2 - 10, cy - m.h / 2 - 10, cx + m.w / 2 + 10, cy + m.h / 2 + 14];
      let s = Math.hypot(cx - cx0, cy - cy0) * 2 + Math.hypot(cx - hx, cy - hy) * 0.15 + (sd !== pref ? 140 : 0);
      for (const a of avoid) if (R[0] < a[2] && a[0] < R[2] && R[1] < a[3] && a[1] < R[3]) s += 5000;
      if (R[0] < chip[2] && chip[0] < R[2] && R[1] < chip[3] && chip[1] < R[3]) s += 3000;
      if (s < bs) { bs = s; best = [cx, cy]; }
    }
    return best;
  };

  // a bare paper panel in the same style (no text, no tail): for illustrated thought clouds / cards that hold drawings
  T.panel = function (ctx, o) {
    const a = K.clamp(o.a ?? 1); if (a <= 0.003) return;
    const L = T.LIGHT[o.light] || T.LIGHT.golden, w = o.w, h = o.h, seed = o.seed ?? 77, kind = o.kind || 'thought';
    const pts = kind === 'thought' ? cloud(0, 0, w, h, seed) : cutRect(-w / 2, -h / 2, w, h, Math.min(h * 0.3, 40), 3, seed);
    const k = 0.7 + 0.3 * K.ease.outBack(K.clamp(a)), bw = o.bw || 7;
    ctx.save(); ctx.globalAlpha *= K.clamp(a * 2); ctx.translate(o.x, o.y); ctx.scale(k, k);
    ctx.save(); ctx.filter = 'blur(8px)'; ctx.translate(L.off[0] * 1.4, L.off[1] * 1.4); polyPath(ctx, pts); ctx.fillStyle = K.rgba(L.shadow, L.shadowA); ctx.fill(); ctx.restore();
    polyPath(ctx, pts); ctx.fillStyle = L.paper; ctx.fill();
    ctx.save(); polyPath(ctx, pts); ctx.clip(); const pat = ctx.createPattern(paper().c, 'repeat'); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha *= 0.5; ctx.fillStyle = pat; ctx.fillRect(-w, -h, w * 2, h * 2); ctx.restore();
    brush(ctx, pts, bw, L.ink, seed, false);
    if (kind === 'thought' && o.trail) for (const [dx, dy, r] of o.trail) { ctx.beginPath(); ctx.arc(dx, dy, r, 0, K.TAU); ctx.fillStyle = L.paper; ctx.fill(); ctx.lineWidth = bw * 0.75; ctx.strokeStyle = L.ink; ctx.stroke(); }
    if (o.inner) o.inner(ctx);
    ctx.restore();
  };

  // ---------------------------------------------------------------- draw
  T.draw = function (ctx, o) {
    const a = K.clamp(o.a ?? 1); if (a <= 0.003 || !o.text) return null;
    const L = Object.assign({}, T.LIGHT[o.light] || T.LIGHT.golden, o.lightO || {});
    if ((o.kind || 'speech') === 'shout') o = Object.assign({}, o, { text: String(o.text).toLocaleUpperCase('es') });   // shouts are lettered in capitals
    const m = measure(ctx, o), kind = m.kind, seed = o.seed ?? [...String(o.text)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const head = o.head, [cx, cy] = T.place(m, head, o), age = o.age ?? 1;
    // pop: scale with a small overshoot (whisper: no overshoot), alpha, settle rotation; out: fade + 0.92
    const ins = K.clamp(age / (kind === 'whisper' ? 0.28 : 0.2)), outK = o.out ?? 0;
    const sIn = kind === 'whisper' ? 0.85 + 0.15 * K.ease.sine(ins) : 0.7 + 0.3 * K.ease.outBack(ins);
    const sc = sIn * (1 - 0.08 * outK), alpha = Math.min(a, K.clamp(age / 0.1));
    const rot = (1 - K.ease.sine(K.clamp(age / 0.35))) * (seed % 2 ? 1 : -1) * 0.035 + (kind === 'thought' ? Math.sin(age * 1.6) * 0.008 : 0);
    let shx = 0, shy = 0;
    if (kind === 'shout') { const k = Math.max(0.25, 1 - age / 0.5); shx = Math.sin(age * 61) * 3.2 * k; shy = Math.cos(age * 47) * 2.4 * k; }
    const bob = kind === 'thought' ? Math.sin(age * 2.1) * 3 : 0;
    // geometry in box-local space (centre 0, 0)
    const w = m.w, h = m.h;
    let pts;
    if (kind === 'shout') pts = burst(0, 0, w * 1.02, h * 1.08, seed);
    else if (kind === 'thought') pts = cloud(0, 0, w, h, seed);
    else pts = cutRect(-w / 2, -h / 2, w, h, Math.min(h * 0.42, 34), kind === 'whisper' ? 1.6 : 2.4, seed);
    // the tail: toward the speaker's head, stopping outside its head zone (never across the face)
    let tipS = null;
    if (head && kind !== 'thought') {
      const hx = head[0], hy = head[1], hr = Math.max(10, head[2]);
      const dx = cx - hx, dy = cy - hy, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      // exit point of the ray (head centre -> box) from the head zone rectangle [±1.15 hr] x [-1.75 hr, 1.2 hr], + 8 px
      const tx = ux ? (ux > 0 ? 1.15 : -1.15) * hr / ux : Infinity, ty = uy ? (uy > 0 ? 1.2 : -1.75) * hr / uy : Infinity;
      const tz = Math.min(Math.abs(tx), Math.abs(ty)) + 8;
      tipS = [hx + ux * tz, hy + uy * tz];
      if (Math.abs(tipS[0] - cx) < w / 2 - 4 && Math.abs(tipS[1] - cy) < h / 2 - 4) tipS = null;   // the tip would sit inside the box
    }
    const tipL = tipS ? [(tipS[0] - cx - shx) / sc, (tipS[1] - cy - shy - bob) / sc] : null;
    // rotate the tip into the rotated frame
    const tipR = tipL ? [tipL[0] * Math.cos(-rot) - tipL[1] * Math.sin(-rot), tipL[0] * Math.sin(-rot) + tipL[1] * Math.cos(-rot)] : null;
    const grow = K.ease.sine(K.clamp((age - 0.04) / 0.22));       // the tail flicks out just after the paper lands
    if (tipR) { const bx = 0, by = 0, t2 = [K.lerp(bx + tipR[0] * 0.35, tipR[0], grow), K.lerp(by + tipR[1] * 0.35, tipR[1], grow)]; pts = withTail(pts, t2, Math.min(70, h * 0.42)); }
    const ink = L.ink, bw = Math.max(3.2, m.fs * (kind === 'shout' ? 0.12 : 0.09));
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(cx + shx, cy + shy + bob); ctx.rotate(rot); ctx.scale(sc, sc);
    // shadow (away from the light, soft)
    ctx.save(); ctx.filter = 'blur(6px)'; ctx.translate(L.off[0], L.off[1]); polyPath(ctx, pts); ctx.fillStyle = K.rgba(L.shadow, L.shadowA); ctx.fill(); ctx.restore();
    // paper: fill, scene glow from the light side, tooth + fibres, scene tint
    polyPath(ctx, pts); ctx.fillStyle = kind === 'whisper' ? K.rgba(L.paper, 0.9) : L.paper; ctx.fill();
    ctx.save(); polyPath(ctx, pts); ctx.clip();
    const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, K.rgba(L.glow, L.glowA)); g.addColorStop(0.6, K.rgba(L.glow, 0)); ctx.fillStyle = g; ctx.fillRect(-w, -h, w * 2, h * 2);
    const pat = ctx.createPattern(paper().c, 'repeat'); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha *= 0.55; ctx.fillStyle = pat; ctx.fillRect(-w, -h, w * 2, h * 2);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha /= 0.55;
    if (L.tint) { ctx.fillStyle = K.rgba(L.tint, L.tintA); ctx.fillRect(-w, -h, w * 2, h * 2); }
    // an inner edge darkening (paper thickness) on the shadow side
    ctx.strokeStyle = K.rgba(L.shadow, 0.1); ctx.lineWidth = bw * 2.2; ctx.translate(-2, -3); polyPath(ctx, pts); ctx.stroke();
    ctx.restore();
    // the ink brush outline (+ a thin rim of scene light on the lit top edge)
    brush(ctx, pts, bw, ink, seed, kind === 'whisper');
    if (L.rimA > 0 && kind !== 'whisper') { ctx.save(); polyPath(ctx, pts); ctx.clip(); ctx.translate(bw * 0.9, bw * 1.1); ctx.strokeStyle = K.rgba(L.rim, L.rimA * 0.6); ctx.lineWidth = bw * 0.5; polyPath(ctx, pts); ctx.stroke(); ctx.restore(); }
    if (kind === 'thought' && head) {   // a trail of three small inked dots from the cloud toward the thinker (outside the head zone)
      const hx = head[0], hy = head[1], hr = Math.max(10, head[2]), dx = cx - hx, dy = cy - hy, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      const tx = ux ? (ux > 0 ? 1.15 : -1.15) * hr / ux : Infinity, ty = uy ? (uy > 0 ? 1.2 : -1.75) * hr / uy : Infinity;
      const ez = Math.min(Math.abs(tx), Math.abs(ty)) + 10, E0 = [hx + ux * ez, hy + uy * ez];         // head-zone exit
      const bz = Math.min(Math.abs(ux) > 1e-6 ? w / 2 / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? h / 2 / Math.abs(uy) : Infinity) * sc;
      const B0 = [cx - ux * bz, cy - uy * bz];                                                             // cloud edge
      const room = Math.hypot(B0[0] - E0[0], B0[1] - E0[1]);
      if (room > m.fs * 0.8 && (B0[0] - E0[0]) * ux + (B0[1] - E0[1]) * uy > 0) for (let k = 0; k < 3; k++) {
        const f = [0.22, 0.52, 0.82][k], r = m.fs * (0.24 - k * 0.06), px = K.lerp(B0[0], E0[0], f), py = K.lerp(B0[1], E0[1], f);
        const lx = (px - cx - shx) / sc, ly = (py - cy - shy - bob) / sc, rx = lx * Math.cos(-rot) - ly * Math.sin(-rot), ry = lx * Math.sin(-rot) + ly * Math.cos(-rot);
        ctx.beginPath(); ctx.arc(rx, ry, r / sc, 0, K.TAU); ctx.fillStyle = L.paper; ctx.fill(); ctx.lineWidth = bw * 0.7; ctx.strokeStyle = ink; ctx.stroke(); }
    }
    // lettering (hand-lettered face, ink colour, a hair of paper bleed under it)
    ctx.font = m.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ink;
    const y0 = -(m.lines.length - 1) * m.lh / 2 + m.fs * 0.04;
    m.lines.forEach((ln, i) => {
      if (kind === 'shout') {   // shout: each word a touch rotated and lifted (hand-lettered energy), still on one line
        const words = ln.split(' '); ctx.textAlign = 'left'; let x = -ctx.measureText(ln).width / 2; const sp = ctx.measureText(' ').width;
        words.forEach((wd, j) => { const ww = ctx.measureText(wd).width; ctx.save(); ctx.translate(x + ww / 2, y0 + i * m.lh + (j % 2 ? -2 : 2)); ctx.rotate(((seed >> j) % 3 - 1) * 0.04); ctx.textAlign = 'center'; ctx.fillText(wd, 0, 0); ctx.restore(); x += ww + sp; });
      } else ctx.fillText(ln, 0, y0 + i * m.lh);
    });
    ctx.restore();
    const rect = [cx - w / 2 * sc, cy - h / 2 * sc, cx + w / 2 * sc, cy + h / 2 * sc];
    // QC hook: the body audit records overlay rects (box only; the tail stops outside the head zone by construction)
    if (root.__ovLog && ctx.canvas.isConnected && ctx.globalAlpha * alpha >= 0.05) {
      const M2 = ctx.getTransform(), P = [[rect[0], rect[1]], [rect[2], rect[3]]].map(([x, y]) => [M2.a * x + M2.c * y + M2.e, M2.b * x + M2.d * y + M2.f]);
      root.__ovLog.push({ kind: 'textbox:' + String(o.text).slice(0, 20), a: +(ctx.globalAlpha * alpha).toFixed(2), r: [P[0][0], P[0][1], P[1][0], P[1][1]] });
    }
    return { rect, tip: tipS, size: m.fs };
  };
})(typeof window !== 'undefined' ? window : globalThis);
