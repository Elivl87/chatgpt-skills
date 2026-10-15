/* EP001 thumbnails v3 · Eli + Mila in the closed style (art/ART_BIBLE.md v4). Three scenes, rendered at 1920x1080 by
   render.mjs and downscaled to 1280x720 by finish.py. Everything comes from the kit (art/lib) and the ep001 world
   (art/scenes/ep001_world.js + highway_golden.js); nothing here touches those files. Deterministic: no clock, no
   Math.random; the only time is the renderer's fixed t.

     v3_A  «¿QUIÉN FUE?»      golden hour, low camera behind the teal car: Eli turned round, HUGE, yelling, backlit by
                              the tail of brake lights that runs to the sun; Mila small in the front seat, looking back.
                              Words top-left on the violet sky.  Value: bright centre, dark frame.
     v3_B  «FUE ÉL.»          high-key: both faces big, frontal, against a blown-out sun haze with brake-light bokeh;
                              Mila (sly) points at Eli (caught); her fingertip touches the vermilion full stop.
                              Words centred between them, ink on light.  Value: light.
     v3_C  «¡VA HACIA ATRÁS!» night hill: the two faces lit red by the ribbon of brake lights (awe), a bold teal arrow
                              runs back along the wave.  Words top-right on the night sky.  Value: dark. */
(function (root) {
  const K = root.K, E = K.ep1, C = K.cast;
  const PAPER = '#f6ecd8', DEEP = '#170a1d', VERM = '#E8553A', INK = '#1C2433';

  // ------------------------------------------------------------------ thumbnail acting (pushed one notch past the
  // episode's: the same faces, the mouth a little wider so a yell / a smirk still reads at 168x94 px)
  function variant(id, base, face) { const S = Object.assign({}, C.SPECS[base]); S.face = Object.assign({}, S.face, face); C.define(id, S); }
  variant('eliT', 'eli1', { mouthW: 0.066 });
  variant('milaT', 'mila1', { mouthW: 0.05 });
  const HANG = { f: [0.13, -0.968], sd: [0.05, -0.97], hand: 'relax', pf: [1, 0.1], ps: [-1, 0.25], idle: 1 };
  C.POSES.yellT = { lead: { f: [0.5, -0.5], sd: [0.5, -0.45], hand: 'fist', pf: [1, -0.6], ps: [-0.5, -1] }, trail: { f: [0.45, 0.8], sd: [0.2, 0.9], hand: 'fist', pf: [1, -0.4], ps: [-1, -0.4], shake: 1 }, lean: 0.05 };
  C.EXPR.furiousT = Object.assign({}, C.EXPR.furious, { tilt: 1.15, eye: 1.1, pupil: 0.62, extras: [] });
  C.EXPR.slyT = { lid: 0.4, low: 0.3, mouth: 'grin', grin: 0.75, look: [0.95, 0.05], tilt: 0.25, noBias: 0.9, browOne: 1.5, head: 0.08, body: 'point' };
  C.EXPR.caughtT = Object.assign({}, C.EXPR.worried, { eye: 1.28, pupil: 0.48, lid: 0.0, tilt: -1.0, noBias: 1, blush: 0.5, extras: ['sweat'] });   // caught: plate eyes sliding away, worried brows, wobbly mouth, sweat

  // ------------------------------------------------------------------ layers
  const pool = {};
  function layer(key) {
    const L = pool[key] || (pool[key] = K.canvas(K.W, K.H)), c = L.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.filter = 'none'; c.clearRect(0, 0, K.W, K.H);
    return L;
  }
  // paint something (a gradient, a glow) only where the layer has pixels, with a blend mode
  function tint(L, paint, mode = 'source-atop', alpha = 1) {
    const T = layer('tint'); paint(T.ctx);
    T.ctx.globalCompositeOperation = 'destination-in'; T.ctx.drawImage(L.c, 0, 0);
    L.ctx.save(); L.ctx.globalCompositeOperation = mode; L.ctx.globalAlpha = alpha; L.ctx.drawImage(T.c, 0, 0); L.ctx.restore();
  }
  function solid(L, color, key = 'solid') {             // a flat-colour copy of a layer's alpha
    const S = layer(key); S.ctx.drawImage(L.c, 0, 0); S.ctx.globalCompositeOperation = 'source-in'; S.ctx.fillStyle = color; S.ctx.fillRect(0, 0, K.W, K.H);
    S.ctx.globalCompositeOperation = 'source-over'; return S;
  }

  // ------------------------------------------------------------------ brand type (Martian Mono 800, every dot a circle)
  // A glyph is rendered once; for punctuation the dot (the smallest connected blob) is erased and redrawn as a true
  // circle, as the brand asks of every tittle and full stop.
  const DOTTED = new Set(['?', '¿', '!', '¡', '.', ':', ';']);
  const gcache = {};
  function glyph(ch, size) {
    const key = ch + size; if (gcache[key]) return gcache[key];
    const font = `800 ${size}px "Martian Mono"`, pad = Math.ceil(size * 0.3);
    const m = K.canvas(10, 10); m.ctx.font = font; const adv = m.ctx.measureText(ch).width;
    const G = K.canvas(Math.ceil(adv + pad * 2), Math.ceil(size * 1.6 + pad)), c = G.ctx, bx = pad, by = Math.ceil(size * 1.15 + pad / 2);
    c.font = font; c.textBaseline = 'alphabetic'; c.fillStyle = '#fff'; c.fillText(ch, bx, by);
    if (DOTTED.has(ch)) {
      const w = G.w, h = G.h, d = c.getImageData(0, 0, w, h).data, lab = new Int32Array(w * h), comps = [];
      for (let i = 0; i < w * h; i++) {
        if (lab[i] || d[i * 4 + 3] < 100) continue;
        const id = comps.length + 1, st = [i]; let n = 0, x0 = w, y0 = h, x1 = 0, y1 = 0; lab[i] = id;
        while (st.length) {
          const p = st.pop(), x = p % w, y = (p / w) | 0; n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
          for (const q of [p - 1, p + 1, p - w, p + w]) if (q >= 0 && q < w * h && !lab[q] && d[q * 4 + 3] >= 100 && Math.abs((q % w) - x) <= 1) { lab[q] = id; st.push(q); }
        }
        comps.push({ n, x0, y0, x1, y1 });
      }
      comps.sort((a, b) => a.n - b.n);
      const dot = comps[0];
      if (dot && (comps.length > 1 || ch === '.')) {
        c.clearRect(dot.x0 - 2, dot.y0 - 2, dot.x1 - dot.x0 + 5, dot.y1 - dot.y0 + 5);
        const r = Math.max(dot.x1 - dot.x0, dot.y1 - dot.y0) / 2 * 1.12;
        c.fillStyle = '#fff'; K.circle(c, (dot.x0 + dot.x1 + 1) / 2, (dot.y0 + dot.y1 + 1) / 2, r); c.fill();
        G.dot = { x: (dot.x0 + dot.x1 + 1) / 2 - bx, y: (dot.y0 + dot.y1 + 1) / 2 - by, r };
      }
    }
    return (gcache[key] = Object.assign(G, { adv, bx, by }));
  }
  // lines: [{ text, x, y, size, align: 'left'|'right'|'center', track }]; o: { fill, depth, extrude, shadow, rim, dotColor,
  // dotScale, outline, outlineW }. Returns per-line boxes and the last full stop centre (for the B gag).
  function words(ctx, lines, o = {}) {
    const WL = layer('words'), wc = WL.ctx, out = [];
    for (const ln of lines) {
      const size = ln.size, tr = (ln.track ?? -0.04) * size, chars = [...ln.text];
      const gl = chars.map(ch => (ch === ' ' ? null : glyph(ch, size)));
      const advs = chars.map((ch, k) => (ch === ' ' ? size * 0.36 : gl[k].adv + tr));
      const width = advs.reduce((a, b) => a + b, 0) - tr;
      let x = ln.align === 'right' ? ln.x - width : ln.align === 'center' ? ln.x - width / 2 : ln.x;
      const box = { x0: x, x1: x + width, y: ln.y, size, dots: [] };
      chars.forEach((ch, k) => {
        const g = gl[k];
        if (g) {
          if (ch === '.' && o.dotColor) {   // the brand dot: a flat vermilion disc
            const r = g.dot.r * (o.dotScale || 1); wc.fillStyle = o.dotColor; K.circle(wc, x + g.dot.x + (r - g.dot.r) * 0.6, ln.y + g.dot.y - (r - g.dot.r), r); wc.fill();
            box.dots.push([x + g.dot.x + (r - g.dot.r) * 0.6, ln.y + g.dot.y - (r - g.dot.r), r]);
          } else {
            const S = layer('g1'); S.ctx.drawImage(g.c, 0, 0); S.ctx.globalCompositeOperation = 'source-in'; S.ctx.fillStyle = ln.fill || o.fill || PAPER; S.ctx.fillRect(0, 0, g.w, g.h);
            wc.drawImage(S.c, 0, 0, g.w, g.h, x - g.bx, ln.y - g.by, g.w, g.h);
          }
        }
        x += advs[k];
      });
      out.push(box);
    }
    for (const [dx, dy, dr, col] of o.extraDots || []) { wc.fillStyle = col; K.circle(wc, dx, dy, dr); wc.fill(); }
    // compose: soft drop shadow, hard extrusion (reads at 168 px), outline, letters, top rim of scene light
    if (o.shadow) { const S = solid(WL, o.shadow); ctx.save(); ctx.filter = `blur(${o.shadowBlur ?? 14}px)`; ctx.globalAlpha = o.shadowAlpha ?? 0.7; ctx.drawImage(S.c, o.shadowDx ?? 10, o.shadowDy ?? 22); ctx.restore(); }
    if (o.outline) {
      const S = solid(WL, o.outline), r = o.outlineW || 8; ctx.save();
      for (let a = 0; a < 24; a++) ctx.drawImage(S.c, Math.cos(a / 24 * K.TAU) * r, Math.sin(a / 24 * K.TAU) * r);
      ctx.restore();
    }
    if (o.depth) {
      const S = solid(WL, o.extrude || DEEP); ctx.save();
      for (let k = o.depth; k >= 1; k--) ctx.drawImage(S.c, k * (o.edx ?? 0.45), k);
      ctx.restore();
    }
    ctx.drawImage(WL.c, 0, 0);
    if (o.rim) {
      const R = solid(WL, o.rim, 'rim'); R.ctx.globalCompositeOperation = 'destination-out'; R.ctx.drawImage(WL.c, o.rimDx ?? 0, o.rimW ?? 5);
      ctx.save(); ctx.globalAlpha = o.rimAlpha ?? 0.85; ctx.drawImage(R.c, 0, 0); ctx.restore();
    }
    return out;
  }

  // the cast drawn into its own layer (so it can be relit / tinted as one piece), then composited
  function castLayer(key, list) {
    const L = layer(key), info = [];
    for (const [id, x, y, u, o] of list) info.push(C.draw(L.ctx, id, x, y, u, o));
    return { L, info };
  }
  function blurDraw(ctx, src, px) { ctx.save(); ctx.filter = `blur(${px}px)`; ctx.drawImage(src, 0, 0); ctx.restore(); }

  // ================================================================== A · ¿QUIÉN FUE?
  let WA = null, TA = null;
  function jamTime(run, a, b) {        // the sim time when cars a..b (ahead of ours) are packed tightest
    let best = 1e9, bt = 8; for (let t = 4; t <= 18; t += 0.1) { const S = run.at(t); const g = S.x[b] - S.x[a]; if (g > 0 && g < best) { best = g; bt = t; } } return bt;
  }
  K.scene('v3_A', {
    setup() { E.highway(); E.oncoming(); },
    draw(ctx, t) {
      const P = E.PAL.golden, run = E.highway();
      if (!WA) WA = E.highwayWorld({ P, horizon: 520, seed: 11, cloudList: E.goldenClouds([760, 380]) });
      if (TA == null) TA = jamTime(run, E.MASCOT + 1, E.MASCOT + 9);
      const T = TA, sM = run.at(T).x[E.MASCOT];
      const hide = { at: (tt) => { const S = run.at(tt); const x = Array.from(S.x); for (let i = 0; i <= E.MASCOT; i++) x[i] = -1e6; return Object.assign({}, S, { x }); }, N: run.N, p: run.p, brake: run.brake };
      const st = { t: T, simT: T, run: hide, onc: null, sCam: sM - 3, lCam: 4.4, H: 2.9, pitch: 0.0, yaw: -0.02, f: 1250, cy: 500, glowScale: 9,
        sun: { az: -0.06, elev: 0.035, r: 54 }, brake: () => 1 };
      // world -> its own layer, softened (depth of field behind the faces)
      const BG = layer('bg'); const g = E.drawHighway(BG.ctx, WA, st);
      blurDraw(ctx, BG.c, 3.2);
      K.light.rays(ctx, g.sunX, g.sunY, { n: 14, spread: 3.0, angle: Math.PI / 2, len: 1700, width: 0.05, alpha: 0.16, color: '#ffe0a0', t: 2, seed: 5 });
      K.sky.wash(ctx, g.sunX, g.sunY, 700, '#ffc070', 0.45);
      // the tail of brake lights: a red bloom along the road toward the sun
      for (let k = 0; k < 9; k++) K.light.glow(ctx, K.lerp(760, 975, k / 8), K.lerp(720, 530, Math.pow(k / 8, 0.7)), K.lerp(330, 80, k / 8), '#ff3a24', 0.3, 'screen');
      // the frame darkens toward the edges (backlit: the light is all in the middle)
      { const vg = ctx.createRadialGradient(g.sunX, g.sunY + 120, 120, g.sunX, g.sunY + 120, 1400);
        vg.addColorStop(0, 'rgba(40,16,48,0)'); vg.addColorStop(0.55, 'rgba(40,16,48,0.25)'); vg.addColorStop(1, 'rgba(26,10,34,0.8)');
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = vg; ctx.fillRect(0, 0, K.W, K.H); ctx.restore(); }
      { const lg = ctx.createRadialGradient(260, 140, 60, 260, 140, 900); lg.addColorStop(0, 'rgba(30,14,52,0.78)'); lg.addColorStop(1, 'rgba(30,14,52,0)');
        ctx.save(); ctx.fillStyle = lg; ctx.fillRect(0, 0, K.W, K.H); ctx.restore(); }

      // Mila: small, front passenger seat, turned round to look back at the yelling (worried)
      const BL = Object.assign({}, C.LIGHT.backlit, { ang: -2.2, rimW: 0.02, rimMax: 12, shadeA: 0.42 });
      const M = castLayer('mila', [['mila1', 360, 1010, 880, { view: 'q', dir: 1, pose: 'clasp', expr: 'worried', seated: true, t: 1.3, light: BL, look: [0.9, -0.25], extras: [] }]]);
      tint(M.L, c => { c.fillStyle = 'rgba(255,90,60,0.35)'; c.fillRect(0, 0, K.W, K.H); }, 'soft-light', 1);
      ctx.drawImage(M.L.c, 0, 0);
      // Eli: HUGE, standing in the car, turned round to the camera, yelling, fist up; rim from the sun behind him
      const EL = Object.assign({}, C.LIGHT.backlit, { ang: -2.35, rimW: 0.012, rimMax: 16, rimA: 1, shadeA: 0.34, shadeW: 0.05 });
      const El = castLayer('eli', [['eliT', 1430, 480 + 0.782 * 2650, 2650, { view: 'q', dir: -1, pose: 'yellT', expr: 'furiousT', t: 0.35, light: EL, look: [-0.3, 0.05], tilt: 0.05 }]]);
      // red spill from the brake lights on his left side, warm sun rim already on the ink
      tint(El.L, c => { const gr = c.createLinearGradient(900, 0, 1500, 0); gr.addColorStop(0, 'rgba(255,70,40,0.75)'); gr.addColorStop(1, 'rgba(255,70,40,0)'); c.fillStyle = gr; c.fillRect(0, 0, K.W, K.H); }, 'screen', 0.35);
      // a dark halo behind Eli so the silhouette pops from the bright sky
      { const S = solid(El.L, '#1a0c24', 'eliHalo'); ctx.save(); ctx.filter = 'blur(26px)'; ctx.globalAlpha = 0.55; ctx.drawImage(S.c, 0, 0); ctx.restore(); }
      ctx.drawImage(El.L.c, 0, 0);
      { const [hx, hy, hr] = El.info[0].head; const R = 230, ax = hx - hr * 1.05, ay = hy - hr * 0.95; K.char.extra(ctx, ax - 0.78 * R, ay + 0.78 * R, R, 'anger', 0.3, { ink: '#24161a' }); }
      // the car's rear deck across the bottom (closest to the camera), backlit
      const lit = { rim: P.rim, shade: P.shadow, ang: -2.0, dx: -1, shadeK: 0.45 };
      K.car.rear(ctx, 1010, 1080 + 980, 1100, { color: K.TEAL, lit, brake: 0, driver: false, seats: 2 });
      // words
      words(ctx, [{ text: '¿QUIÉN', x: 70, y: 232, size: 196 }, { text: 'FUE?', x: 70, y: 448, size: 196 }],
        { fill: PAPER, depth: 14, extrude: '#1d0b26', shadow: '#12051a', shadowAlpha: 0.75, rim: '#ffe3a6', rimW: 5 });
      K.light.grade(ctx, P.grade, 0.16, 'soft-light');
    },
    post: { grain: 0.11, vignette: 0.3, vignetteColor: '#2a1330', bloom: 0.3 },
  });

  // ================================================================== B · FUE ÉL.
  let BGB = null;
  function bgB() {
    if (BGB) return BGB; BGB = K.canvas(K.W, K.H); const c = BGB.ctx;
    K.sky.gradient(c, [[0, '#f3b77c'], [0.35, '#ffd9a0'], [0.62, '#fff1d0'], [0.75, '#ffd7a0'], [1, '#c98a72']], 0, K.H);
    K.sky.wash(c, 960, 560, 900, '#fff6e2', 0.9);
    K.sky.sun(c, 900, 330, 70, { core: '#fffaf0', halo: '#ffe2a8', glow: 900, glowAlpha: 0.7, rings: 4, ringStep: 0.9, ringAlpha: 0.08 });
    K.light.rays(c, 900, 330, { n: 16, spread: K.TAU, angle: 0, len: 1400, width: 0.05, alpha: 0.14, color: '#fff2d0', t: 1, seed: 9 });
    // far hills and the road, painted soft (out of focus)
    c.fillStyle = '#e7b48e'; K.terrain.ridgePath(c, { x0: -20, x1: 1940, y: 700, amp: 60, freq: 0.002, seed: 4, oct: 4, bottom: 1100 }); c.fill();
    c.fillStyle = '#c99079'; K.terrain.ridgePath(c, { x0: -20, x1: 1940, y: 760, amp: 34, freq: 0.004, seed: 8, oct: 4, bottom: 1100 }); c.fill();
    c.fillStyle = '#9c6b6c'; c.beginPath(); c.moveTo(860, 742); c.lineTo(1060, 742); c.lineTo(1900, 1080); c.lineTo(20, 1080); c.closePath(); c.fill();
    const L = K.canvas(K.W, K.H); L.ctx.drawImage(BGB.c, 0, 0); c.filter = 'blur(10px)'; c.drawImage(L.c, 0, 0); c.filter = 'none';
    // brake-light bokeh: the wave running back out of Eli's car (big soft discs, near = bigger)
    const r = K.rng(77);
    for (let k = 0; k < 18; k++) {
      const u = k / 17, x = K.lerp(1900, 900, u) + (r() - 0.5) * 80, y = K.lerp(900, 745, Math.pow(u, 0.8)) + (r() - 0.5) * 16, rr = K.lerp(60, 9, u) * (0.75 + r() * 0.4);
      c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = K.rgba(r() < 0.8 ? '#ff4a30' : '#ffb060', 0.55); K.circle(c, x, y, rr); c.fill();
      c.strokeStyle = K.rgba('#ffd0a0', 0.35); c.lineWidth = Math.max(1, rr * 0.08); c.stroke(); c.restore();
      K.light.glow(c, x, y, rr * 3, '#ff3a20', 0.25, 'screen');
    }
    for (let k = 0; k < 14; k++) { const x = r() * 1920, y = 200 + r() * 600, rr = 8 + r() * 30; c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = K.rgba('#fff2c8', 0.18 + r() * 0.2); K.circle(c, x, y, rr); c.fill(); c.restore(); }
    K.tex.paint(BGB, { amount: 0.3, mottle: { w: 1300, h: 900, sx: 0.003, sy: 0.02, seed: 5, amp: 24 } });
    return BGB;
  }
  K.scene('v3_B', {
    draw(ctx, t) {
      ctx.drawImage(bgB().c, 0, 0);
      const FL = Object.assign({}, C.LIGHT.golden, { ang: -1.6, rim: '#fff3c8', rimW: 0.012, rimMax: 14, rimA: 1, shadeA: 0.26 });
      const u = 2050;
      // Mila (left, sly, pointing right at Eli). Probe her pointing hand first: the full stop sits on her fingertip.
      const mx = 470, my = 360 + 0.918 * u;
      const mO = { view: 'q', dir: 1, pose: 'point', expr: 'slyT', t: 0.6, light: FL, tilt: 0.06 };
      const ex = 1560, ey = 590 + 0.782 * u;
      const eO = { view: 'front', dir: -1, pose: 'clasp', expr: 'caughtT', t: 0.2, light: FL, look: [0.95, 0.2], tilt: -0.06, extras: [] };
      const CL = castLayer('cast', [['eliT', ex, ey, u, eO], ['milaT', mx, my, u, mO]]);
      const tip = CL.info[1].hands.lead;
      // soft violet ground shadow behind them, then the cast
      { const S = solid(CL.L, '#5a2a48', 'castSh'); ctx.save(); ctx.filter = 'blur(30px)'; ctx.globalAlpha = 0.35; ctx.drawImage(S.c, 16, 24); ctx.restore(); }
      ctx.drawImage(CL.L.c, 0, 0);
      // words: ink letters on the light; the period is the vermilion brand dot touching Mila's fingertip
      // the full stop: a vermilion disc resting on the tip of Mila's index finger; the words end right before it
      const size = 210, dr = size * 0.15, dX = tip[0] + dr * 1.25, dY = tip[1] - dr * 0.35, y2 = dY + dr, right = dX - dr - size * 0.07;
      words(ctx, [{ text: 'FUE', x: right, y: y2 - size * 1.22, size, align: 'right', fill: INK }, { text: 'ÉL', x: right, y: y2, size, align: 'right', fill: INK }],
        { extraDots: [[dX, dY, dr, VERM]], outline: '#fff4dc', outlineW: 7, shadow: '#5a2a3a', shadowAlpha: 0.35, shadowBlur: 16, shadowDy: 14 });
      K.light.grade(ctx, '#ff9a5a', 0.12, 'soft-light');
    },
    post: { grain: 0.1, vignette: 0.35, vignetteColor: '#6a2a40', bloom: 0.15 },
  });

  // ================================================================== C · ¡VA HACIA ATRÁS!
  let WC = null;
  K.scene('v3_C', {
    setup() { E.highway(); },
    draw(ctx, t) {
      const P = Object.assign({}, E.PAL.night, { grassFar: '#1f2846', field: '#1a2442', field2: '#202a48', tree: '#141c38', treeDark: '#0a1026', halo: '#9fb4ff', line: '#5a5f80', sun: '#f6efd8' });
      const NIGHT = { N: 130, L: 2200, v0: 22, T: 1.0, a: 0.5, b: 1.5, s0: 2, carLen: 4.5, timeScale: 2, fps: 30, preroll: 3, duration: 30, taps: [{ car: 60, t: 0.5, dur: 1.2, decel: 5 }] };
      if (!WC) {
        WC = E.highwayWorld({ P, horizon: 430, night: true, clouds: false, rim: false, fogDist: 900, far: 3200, shadows: false, seed: 13, fieldColors: [P.field, P.field2, '#18213e', '#1c2645'] });
        WC.run = K.sim.ring(NIGHT);
        WC.clouds = [[1500, 150, 520, 92, 1, 5], [700, 120, 380, 64, 3, 6]].map(([x, y, w, h, seed, v]) => ({ x, y, w, h, v, a: 0.85,
          o: { seed: 90 + seed, ang: K.sky.angTo(x, y, 1250, 90), color: '#2c3466', shade: '#1a2048', lit: '#4a5590', rim: '#c9d4ff', rimW: 0.05, litOff: 2.4, litScale: 0.8 } }));
      }
      const run = WC.run, simT = 12.5;
      if (WC.sJam == null) { const S = run.at(simT); let j = 0; for (let i = 0; i < run.N; i++) if (S.v[i] < S.v[j]) j = i; WC.sJam = S.x[j] - 230; }
      const st = { t, simT, run, onc: null, sCam: WC.sJam, lCam: -75, H: 34, pitch: 0.105, yaw: 0.16, f: 1500, cy: 520, glowScale: 1.6,
        sun: { az: 0.06, elev: 0.2, r: 34 }, brake: i => Math.max(run.brake(i, simT), K.smooth(7, 2, run.at(simT).v[i])) };
      const BG = layer('bg'); const g = E.drawHighway(BG.ctx, WC, st);
      ctx.drawImage(BG.c, 0, 0);
      // the ribbon's positions on screen (same camera) -> the arrow follows the wave backward (toward us)
      const cam = K.persp({ f: st.f, H: st.H, pitch: st.pitch, cy: st.cy }), road = WC.road, rig = road.rig(st.sCam, st.lCam, st.yaw);
      const scr = (s, l) => { const w = road.world(s, l), c = rig.toCam(w.x, w.z); if (c[1] < 2) return null; const p = cam.proj(c[0], 0, c[1]); return [p.x, p.y, p.s]; };
      // red light of the wave: a big glow over the braking stretch
      const S = run.at(simT); let bmax = [];
      for (let i = 0; i < run.N; i++) { const b = st.brake(i); if (b > 0.5) { let s = S.x[i]; while (s < st.sCam - 60) s += run.p.L; while (s >= st.sCam - 60 + run.p.L) s -= run.p.L; const p = scr(s, 1.85); if (p) bmax.push(p); } }
      for (const p of bmax) { K.light.glow(ctx, p[0], p[1], 50 + p[2] * 40, '#ff3a24', 0.22, 'screen'); K.light.glow(ctx, p[0], p[1], 8 + p[2] * 5, '#ffb090', 0.5, 'screen'); }
      // the arrow: a fat teal brush stroke riding just above the ribbon, from the far end of the wave back toward the camera
      const pts = []; for (let s = st.sCam + 620; s >= st.sCam + 100; s -= 10) { const p = scr(s, -15); if (!p) continue; const q = [p[0], p[1] + 18 + p[2] * 2]; if (q[0] > 1640 || q[1] > 930) break; pts.push(q); }
      if (pts.length > 3) {
        const head = pts[pts.length - 1], prev = pts[Math.max(0, pts.length - 6)], ang = Math.atan2(head[1] - prev[1], head[0] - prev[0]);
        const body = pts.slice(0, -1);
        const stroke = (col, w) => { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); body.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); };
        const tri = (col, s, grow = 0) => { ctx.fillStyle = col; ctx.beginPath(); const L = s + grow, Wd = s * 0.78 + grow;
          ctx.moveTo(head[0] + Math.cos(ang) * L * 0.55, head[1] + Math.sin(ang) * L * 0.55);
          ctx.lineTo(head[0] + Math.cos(ang + 2.3) * Wd, head[1] + Math.sin(ang + 2.3) * Wd); ctx.lineTo(head[0] + Math.cos(ang - 2.3) * Wd, head[1] + Math.sin(ang - 2.3) * Wd); ctx.closePath(); ctx.fill(); };
        ctx.save(); K.light.glow(ctx, head[0], head[1], 200, '#3fd6c0', 0.25, 'screen');
        stroke('#04121a', 50); tri('#04121a', 104, 12); stroke('#38cdb6', 32); tri('#38cdb6', 104); stroke('#9ff3e4', 6); ctx.restore();
      }
      // foreground: the hill crest under them
      ctx.save(); ctx.fillStyle = '#080c1e'; K.terrain.ridgePath(ctx, { x0: -40, x1: 1300, y: 1010, amp: 50, freq: 0.002, seed: 3, bottom: K.H + 10, peaks: x => -Math.max(0, x - 700) * 0.2 }); ctx.fill(); ctx.restore();
      // Eli + Mila, big, 3/4 toward the valley, faces lit red by the wave (awe); moonlight on their far edge
      const RL = { ang: -0.15, rim: '#ff6a48', rimA: 1, rimW: 0.02, rimMax: 16, shade: '#0b1030', shadeA: 0.52, shadeW: 0.09, tex: 0.16 };
      const u = 1650;
      const CL = castLayer('cast', [
        ['mila1', 330, 455 + 0.918 * u, u, { view: 'q', dir: 1, pose: 'clasp', expr: 'awe', t: 0.9, light: RL, look: [0.9, -0.05], extras: [] }],
        ['eli1', 790, 650 + 0.782 * u, u, { view: 'q', dir: 1, pose: 'surprise', expr: 'awe', t: 0.4, light: RL, look: [0.9, 0.0], extras: ['sparkle'] }]]);
      tint(CL.L, c => { const gr = c.createLinearGradient(100, 0, 1200, 0); gr.addColorStop(0, 'rgba(20,26,70,0.4)'); gr.addColorStop(1, 'rgba(255,60,40,0.5)'); c.fillStyle = gr; c.fillRect(0, 0, K.W, K.H); }, 'soft-light', 0.8);
      tint(CL.L, c => { const gr = c.createRadialGradient(1500, 650, 100, 1500, 650, 1300); gr.addColorStop(0, 'rgba(255,70,40,0.6)'); gr.addColorStop(1, 'rgba(255,70,40,0)'); c.fillStyle = gr; c.fillRect(0, 0, K.W, K.H); }, 'screen', 0.4);
      ctx.drawImage(CL.L.c, 0, 0);
      K.light.glow(ctx, 900, 700, 500, '#ff3a24', 0.1, 'screen');
      // words, top right, three short lines on the night sky
      words(ctx, [{ text: '¡VA', x: 1860, y: 180, size: 156, align: 'right' }, { text: 'HACIA', x: 1860, y: 370, size: 156, align: 'right' }, { text: 'ATRÁS!', x: 1860, y: 560, size: 156, align: 'right' }],
        { fill: PAPER, depth: 11, extrude: '#05071a', shadow: '#000', shadowAlpha: 0.7, rim: '#ffb4a0', rimW: 4 });
      K.light.grade(ctx, '#3a4aa0', 0.2, 'soft-light');
    },
    post: { grain: 0.13, vignette: 0.45, vignetteColor: '#03040c', bloom: 0.4, bloomR: 26 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
