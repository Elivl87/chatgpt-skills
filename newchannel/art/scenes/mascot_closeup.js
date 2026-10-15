/* Ep 001 · close-up: Quest at the wheel and Pixie in the passenger seat (car 8 of the IDM run, the teal two-seater) as the
   jam wave reaches them. Side view, golden hour, sun ahead. Nothing is keyframed by hand except the camera: the
   leader's brake light, the gaps, the speed, the nose-dip and every acting beat (expressions, shrug, crossed arms,
   Pixie's explaining) are read from the same run as the wide shot.
   v3 fixes: poles keep their density in motion (capped blur), the foreground grass is an opaque smear (no see-through),
   the camera sits further left so the stopped leader's driver is fully in frame. */
(function (root) {
  const K = root.K, E = K.ep1;
  const SC = 215, GROUND = 992, CX = 610, TW = 2400;   // px per metre, ground line, mascot car centre, tile width
  E.CLOSE = { simOffset: -0.6, frame: { z: 1.62, wx: 585, wy: 610, sx: 920, sy: 470 } };   // v4: tight framing, Eli + Mila big                        // close-up sim time = video time - 0.6 s (editorial overlap)
  let L = null;

  function tileLayer(draw, h = K.H, blur = 0) {
    const t = K.canvas(TW, h); draw(t.ctx, t);
    if (blur) { const b = K.canvas(TW, h); b.ctx.filter = `blur(${blur}px)`; b.ctx.drawImage(t.c, 0, 0); b.ctx.drawImage(t.c, -TW, 0); b.ctx.drawImage(t.c, TW, 0); return b; }
    return t;
  }
  function drawTiled(ctx, layer, shift, y = 0, blurPx = 0, smear = false) {
    const off = -(((shift % TW) + TW) % TW);
    const n = blurPx > 2 ? Math.min(12, Math.ceil(blurPx / 6)) : 1;
    for (let k = 0; k < n; k++) {
      ctx.globalAlpha = n > 1 && !smear ? 1 / (k + 1) : 1;      // running average of n shifted copies = box motion blur (smear: opaque union)
      const o2 = off + (n > 1 ? (k / (n - 1) - 0.5) * blurPx : 0);
      ctx.drawImage(layer.c, o2, y); ctx.drawImage(layer.c, o2 + TW, y); if (o2 + 2 * TW < K.W) ctx.drawImage(layer.c, o2 + 2 * TW, y);
    }
    ctx.globalAlpha = 1;
  }

  function build() {
    const P = E.PAL.golden, HZ = 640;
    const sky = K.canvas(K.W, K.H);
    K.sky.gradient(sky.ctx, [[0, '#6b6aa6'], [0.25, '#b58aaa'], [0.45, '#f0a47e'], [0.6, '#ffc98c'], [0.7, '#ffe0a8']], 0, HZ + 80);
    K.tex.paint(sky, { amount: 0.35, mottle: { w: 1200, h: 540, sx: 0.0025, sy: 0.02, seed: 3, amp: 30 } });
    const far = tileLayer((c, t) => {
      K.terrain.ridge(c, { x0: 0, x1: TW, y: HZ - 40, amp: 200, freq: 0.0026, seed: 61, bottom: K.H, color: K.mix(P.far, P.haze, 0.5), rim: P.rim, rimW: 1.5, rimAlpha: 0.5,
        peaks: x => 90 * Math.exp(-Math.pow((x - 500) / 200, 2)) + 60 * Math.exp(-Math.pow((x - 1700) / 260, 2)) });
      K.light.haze(c, HZ - 200, HZ, HZ + 40, P.haze, 0.6); K.tex.paint(t, { amount: 0.45, mottle: { w: 1000, h: 400, sx: 0.004, sy: 0.05, seed: 62, amp: 40 } });
    });
    const hills = tileLayer((c, t) => {
      const col = K.mix(P.mid, P.haze, 0.3);
      K.terrain.ridge(c, { x0: 0, x1: TW, y: HZ + 10, amp: 90, freq: 0.004, seed: 71, bottom: K.H, color: col, rim: P.rim, rimW: 1.5, rimAlpha: 0.6 });
      const r = K.rng(72);
      for (let x = 0; x < TW; x += 14 + r() * 40) { const n = K.fbm(x * 0.004, 0.5, 4, 71), y = HZ + 10 - (n - 0.35) * 90; c.fillStyle = col; K.circle(c, x, y - 6, 7 + r() * 10); c.fill(); }
      K.light.haze(c, HZ - 60, HZ + 20, HZ + 80, P.haze, 0.45); K.tex.paint(t, { amount: 0.45, mottle: { w: 1000, h: 400, sx: 0.004, sy: 0.05, seed: 73, amp: 40 } });
    });
    const fields = tileLayer((c, t) => {
      const g = c.createLinearGradient(0, HZ + 30, 0, 860); g.addColorStop(0, K.mix(P.grassFar, P.haze, 0.5)); g.addColorStop(1, K.mix(P.field, P.grass, 0.3));
      c.fillStyle = g; c.fillRect(0, HZ + 30, TW, 900 - HZ);
      const r = K.rng(81);
      for (let x = 0; x < TW; x += 30 + r() * 90) {
        const h = 40 + r() * 70, y = HZ + 50 + r() * 30, kind = r() < 0.4 ? 'poplar' : 'round';
        K.terrain.tree(c, x, y, h, { kind, seed: r() * 1e6 | 0, color: K.mix(P.tree, P.haze, 0.45), shade: K.mix(P.treeDark, P.haze, 0.4), light: { dx: 0.6, back: 0.7, rim: P.rim } });
      }
      K.tex.paint(t, { amount: 0.5, mottle: { w: 1000, h: 400, sx: 0.005, sy: 0.05, seed: 82, amp: 45 } });
    });
    const midTrees = (grp) => tileLayer((c, t) => {   // roadside trees in two groups (they sway out of phase), soft (depth of field)
      const r = K.rng(91); let k = 0;
      for (let x = 60; x < TW; x += 260 + r() * 300) {
        const h = 260 + r() * 140, kind = r() < 0.3 ? 'poplar' : 'round', sd = r() * 1e6 | 0;
        if ((k++ % 2) === grp) K.terrain.tree(c, x, 830, h, { kind, seed: sd, color: K.mix(P.tree, P.haze, 0.15), shade: K.mix(P.treeDark, P.haze, 0.1), trunk: '#4a3638', light: { dx: 0.7, back: 0.75, rim: P.rim } });
      }
      K.tex.paint(t, { amount: 0.4, mottle: { w: 1000, h: 500, sx: 0.006, sy: 0.04, seed: 92 + grp, amp: 45 } });
    }, K.H, 2.5);
    const midA = midTrees(0), midB = midTrees(1);
    const mid = tileLayer((c, t) => {   // poles + wires (v4: crisp and dark, they sit just behind the verge)
      for (let x = 0; x < TW; x += 600) K.terrain.pole(c, x + 200, 840, 470, { color: '#33232a', rim: P.rim, dx: 1 });
      for (let x = 0; x < TW; x += 600) { c.fillStyle = '#33232a'; c.fillRect(x + 200 - 7, 370, 14, 470); c.fillStyle = K.rgba(P.rim, 0.55); c.fillRect(x + 200 + 3, 370, 3, 470);
        c.fillStyle = '#33232a'; K.rrect(c, x + 200 - 80, 376, 160, 9, 3); c.fill(); for (const k of [-60, 60]) { c.fillStyle = '#5a4a48'; K.rrect(c, x + 200 + k - 4, 366, 8, 12, 3); c.fill(); } }
      c.strokeStyle = K.rgba('#2e2028', 0.85); c.lineWidth = 2.4;
      for (const yy of [372, 378]) { c.beginPath(); for (let x = -400; x <= TW + 400; x += 600) { c.moveTo(x + 200 - 60, yy); c.quadraticCurveTo(x + 500, yy + 44, x + 800 - 60, yy); } c.stroke(); }
      K.tex.paint(t, { amount: 0.3, mottle: { w: 1000, h: 500, sx: 0.006, sy: 0.04, seed: 92, amp: 45 } });
    }, K.H, 0.8);
    const verge = tileLayer((c, t) => {   // grass bank + guardrail right behind the far lane
      c.fillStyle = K.mix(P.grass, P.field, 0.35); c.fillRect(0, 800, TW, 70);
      const r = K.rng(101);
      c.lineCap = 'round';
      for (let k = 0; k < 900; k++) { const x = r() * TW, y = 802 + r() * 64; c.strokeStyle = K.rgba(r() < 0.5 ? P.rim : P.shadow, 0.18); c.lineWidth = 2 + r() * 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 10 + r() * 30, y + (r() - 0.5) * 3); c.stroke(); }
      for (let x = 0; x < TW; x += 6) K.terrain.tuft(c, x + r() * 6, 836 + r() * 30, 22 + r() * 34, K.shade(P.grass, -0.28 + r() * 0.2), { seed: r() * 1e6 | 0, n: 5, rim: P.rim });
      for (let k = 0; k < 160; k++) { const x = r() * TW, y = 830 + r() * 36; c.fillStyle = ['#fff4e0', '#ffd65a', '#c9a3e8', '#ff9a8a'][(r() * 4) | 0];
        c.strokeStyle = K.rgba('#4a5a30', 0.8); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y + 14); c.lineTo(x + (r() - 0.5) * 4, y); c.stroke(); K.circle(c, x, y, 2.6 + r() * 2.4); c.fill(); }
      // guardrail
      for (let x = 0; x < TW; x += 120) { c.fillStyle = '#5e5260'; c.fillRect(x + 20, 812, 10, 48); c.fillStyle = K.rgba(P.rim, 0.7); c.fillRect(x + 27, 812, 3, 48); }
      c.fillStyle = '#8d8a96'; c.fillRect(0, 812, TW, 16); c.fillStyle = K.rgba('#fff2cf', 0.75); c.fillRect(0, 812, TW, 4); c.fillStyle = '#5f5a6b'; c.fillRect(0, 826, TW, 4);
      K.tex.paint(t, { amount: 0.4 });
    });
    // road texture tile: worn asphalt strokes, patches and tar seams (scrolls with the road at the car's depth)
    const road = tileLayer((c, t) => {
      const r = K.rng(111); c.lineCap = 'round';
      for (let k = 0; k < 40; k++) { const x = r() * TW, y = 880 + r() * 190, w = 60 + r() * 220; c.fillStyle = K.rgba(r() < 0.5 ? '#3e3449' : '#7a6a7c', 0.18); K.blob(c, [[x, y], [x + w * 0.5, y - 8 - r() * 10], [x + w, y], [x + w * 0.6, y + 10 + r() * 8]]); c.fill(); }
      for (let k = 0; k < 1400; k++) { const x = r() * TW, y = 875 + r() * 200; c.strokeStyle = K.rgba(r() < 0.55 ? '#2f283a' : '#9a8a96', 0.16); c.lineWidth = 1 + r() * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 8 + r() * 40, y + (r() - 0.5) * 2); c.stroke(); }
      for (let k = 0; k < 8; k++) { let x = r() * TW, y = 900 + r() * 150; c.strokeStyle = K.rgba('#2a2232', 0.4); c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 6; j++) { x += 10 + r() * 30; y += (r() - 0.5) * 14; c.lineTo(x, y); } c.stroke(); }
    }, K.H);
    // foreground grass bank in front of the near lane edge (parallax 1.3, out of focus). v4: an opaque bank of blades
    // (no see-through reeds), with a few taller clumps and lit tips
    const fore = tileLayer((c, t) => {
      const r = K.rng(121), base = K.H + 40;
      const blade = (x, hgt, w, lean, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - w, base); c.quadraticCurveTo(x - w * 0.3 + lean * 0.4, base - hgt * 0.6, x + lean, base - hgt); c.quadraticCurveTo(x + w * 0.3 + lean * 0.4, base - hgt * 0.6, x + w, base); c.closePath(); c.fill(); };
      // solid bank with a wavy top (fully opaque: nothing shows through)
      c.fillStyle = '#2a261e'; c.beginPath(); c.moveTo(0, base);
      for (let x = 0; x <= TW; x += 20) c.lineTo(x, base - 92 - 10 * Math.sin(x * 0.013) - 8 * Math.sin(x * 0.041 + 1));
      c.lineTo(TW, base); c.closePath(); c.fill();
      for (let x = -20; x < TW + 20; x += 3 + r() * 4) blade(x, 110 + r() * 45, 7 + r() * 6, (r() - 0.4) * 22, K.mix('#24211a', '#3d3c26', r()));
      for (let k = 0; k < 9; k++) { const cx = (k + r() * 0.6) * (TW / 9);
        for (let j = 0; j < 34; j++) blade(cx + (r() - 0.5) * 130, 150 + r() * 80, 6 + r() * 6, (r() - 0.45) * 46, K.mix('#211e17', '#46452b', r())); }
      // thin lit tips (back light), only the top of the tall blades
      c.globalCompositeOperation = 'source-atop'; const g = c.createLinearGradient(0, base - 230, 0, base - 150); g.addColorStop(0, K.rgba(P.rim, 0.45)); g.addColorStop(1, K.rgba(P.rim, 0));
      c.fillStyle = g; c.fillRect(0, base - 240, TW, 100); c.globalCompositeOperation = 'source-over';
    }, K.H + 40, 2.2);
    // clouds (drawn live so they drift); lit from the sun at (1480, 250)
    const clouds = [[260, 190, 560, 118, 1, 5], [1000, 120, 520, 104, 2, 4], [1760, 210, 470, 96, 3, 6], [640, 360, 300, 58, 4, 7], [2300, 330, 300, 60, 5, 6]].map(([x, y, w, h, seed, v]) => {
      const far = K.clamp((y - 200) / 200);
      return { x, y, w, h, v, o: { seed: 60 + seed, ang: K.sky.angTo(x, y - h * 0.4, 1480, 250), color: K.mix('#a3849f', '#d9a69a', far * 0.6), shade: K.mix('#7a6797', '#b98f9e', far * 0.6),
        lit: K.mix('#eeb092', '#ffcfa4', far), rim: '#ffe6bc', underLit: '#ffcf98', litOff: 3.4, litScale: 0.72, rimW: 0.045 } };
    });
    return { sky, far, hills, fields, mid, midA, midB, verge, road, fore, clouds, HZ };
  }

  // reactions from the sim (sim time tau)
  E.closeState = function (t) {
    const run = E.highway(), tau = t + E.CLOSE.simOffset, M = E.MASCOT;
    const S = run.at(tau), v = S.v[M];
    // smoothed decel for nose dip with a spring rebound on stopping
    let acc = 0, w = 0;
    for (let k = 0; k < 10; k++) { const a = run.at(tau - k * 0.03).a[M], ww = Math.exp(-k / 4); acc += a * ww; w += ww; }
    const aS = acc / w;
    const leadOn = run.onsets(E.LEADER)[0], selfOn = run.onsets(M)[0];
    let tStop = null; for (let tt = selfOn; tt < 20; tt += 1 / 30) if (run.at(tt).v[M] < 0.15) { tStop = tt; break; }
    return { run, tau, S, v, aS, leadOn, selfOn, tStop, x: S.x[M], gapL: S.x[E.LEADER] - S.x[M] - 4.5, gapF: S.x[M] - S.x[M - 1] - 4.5, bL: run.brake(E.LEADER, tau), bM: run.brake(M, tau) };
  };

  // v4 acting: Eli at the wheel, Mila beside him. Everything is read from the sim (brake onsets, stop, gap, speed);
  // poses cross-fade (blend) so nothing pops, except Mila's deliberate snap-turn to look back (anticipation squash).
  E.closeActing = function (st, t) {
    const tau = st.tau, since = e => (e == null ? -1 : tau - e), ramp = (x, d = 0.25) => K.ease.sine(K.clamp(x / d));
    const sL = since(st.leadOn), sS = since(st.selfOn), sT = st.tStop ? since(st.tStop) : -1;
    const eli = { pose: 'drive', expr: 'happy', look: [0.6, 0], talk: 0 }, mila = { pose: 'lap', expr: 'happy', view: 'q', dir: 1, headTurn: 0.25, look: [0.7, 0], talk: 0 };
    let bubble = 0;
    if (sL < 0) { mila.talk = 0.25 + 0.75 * Math.abs(Math.sin(tau * 9.5)) * (Math.sin(tau * 2.3) > -0.3 ? 1 : 0); eli.expr = 'happy'; }   // chatting while cruising
    if (sL > 0.12) { eli.expr = 'surprised'; mila.expr = 'surprised'; mila.headTurn = 0.45; mila.look = [0.9, -0.1]; }
    if (sS > 0.15) { eli.expr = 'worried'; mila.expr = 'worried'; }
    if (sS > 1.4) { eli.expr = st.gapL < 6 && st.v > 1 ? 'determined' : 'annoyed'; mila.expr = 'thinking'; mila.look = [0.6, -0.6]; mila.headTurn = 0.1; }   // tailgating: set jaw
    if (sT > 0.15) { eli.expr = 'annoyed'; eli.blend = { pose: 'shrug', k: ramp(sT - 0.15) * (1 - ramp(sT - 0.75)) }; eli.look = [-0.6, 0]; }
    if (sT > 0.9) {   // «¡¿Quién fue?!»: furious, fist out of the car, leaning in
      eli.expr = 'furious'; eli.blend = { pose: 'driveFist', k: ramp(sT - 0.9, 0.18) }; eli.look = [0.7, -0.2]; eli.extras = ['anger', 'puff'];
      bubble = ramp(sT - 0.95, 0.12) * (1 - ramp(sT - 2.5, 0.25));
    }
    if (sT > 2.6) { eli.expr = 'grumpy'; eli.blend = { pose: 'driveFist', k: 1 - ramp(sT - 2.6, 0.3) }; eli.extras = ['puff']; eli.look = [0.5, 0.1]; }
    if (sT > 1.3) {   // Mila turns round in her seat to look back: anticipation (head first), then the body snaps round
      const k = ramp(sT - 1.3, 0.2);
      mila.headTurn = K.lerp(0.1, -0.9, k); mila.expr = 'curious'; mila.look = [-0.4, -0.2];
      if (sT > 1.55) { mila.dir = -1; mila.headTurn = 0; mila.look = [0.5, -0.25]; mila.tilt = 0.06 * Math.exp(-(sT - 1.55) * 6); }
      if (sT > 2.5) { mila.expr = 'awe'; mila.look = [0.3, -0.5]; }
      if (sT > 3.3) { mila.expr = 'smug'; mila.look = [-0.85, 0]; }    // ... «Fuiste tú.»
    }
    eli.lean = (eli.expr === 'furious' ? 0.03 : 0);
    return { eli, mila, bubble };
  };

  E.drawCloseup = function (ctx, t, frame, opt = {}) {
    if (!L) L = build();
    const P = E.PAL.golden, st = E.closeState(t), tau = st.tau;
    const pxShift = st.x * SC, speedPx = st.v * 2 * SC / 30;          // px per frame at the car's depth (timescale 2)
    // camera: slow push-in toward the mascot, tiny drift
    const z = 1 + 0.07 * K.ease.sine(K.inv(0, 6, t - (opt.t0 ?? 6))) , headX = CX - 40, headY = GROUND - 1.25 * SC;
    ctx.save();
    const FR = opt.frame || (opt.wide ? { z: 1, wx: headX, wy: headY, sx: headX, sy: headY } : E.CLOSE.frame);   // v4: framed close-ups (bigger characters)
    ctx.translate(FR.sx, FR.sy); ctx.scale(z * FR.z, z * FR.z); ctx.translate(-FR.wx + Math.sin(t * 0.4) * 3, -FR.wy + Math.sin(t * 0.33) * 2);
    ctx.drawImage(L.sky.c, 0, 0);
    // sun + glow behind the leader
    const sunX = 1480, sunY = 250;
    K.sky.sun(ctx, sunX, sunY, 48, { core: P.sun, halo: P.halo, glow: 650, glowAlpha: 0.6, rings: 4, ringStep: 0.9, ringAlpha: 0.07 });
    K.sky.drawClouds(ctx, L.clouds, t, { dx: -pxShift * 0.004 });
    // birds crossing high up
    ctx.strokeStyle = K.rgba('#5a3d55', 0.7); ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const bx = ((200 + i * 140 + t * (30 + i * 4)) % 2300) - 150, by = 300 + i * 26 + Math.sin(t * 0.9 + i) * 10, fl = Math.sin(t * 8 + i * 1.3) * 6, w = 11 - i;
      ctx.beginPath(); ctx.moveTo(bx - w, by - fl); ctx.quadraticCurveTo(bx - w * 0.4, by - 3, bx, by); ctx.quadraticCurveTo(bx + w * 0.4, by - 3, bx + w, by - fl); ctx.stroke(); }
    drawTiled(ctx, L.far, pxShift * 0.01);
    drawTiled(ctx, L.hills, pxShift * 0.04);
    drawTiled(ctx, L.fields, pxShift * 0.12);
    K.light.rays(ctx, sunX, sunY, { n: 10, spread: 2.0, angle: Math.PI / 2 + 0.35, len: 1300, width: 0.05, alpha: 0.09, color: '#ffe0a0', t, seed: 9 });
    const swayAt = (ph) => Math.sin(t * 1.1 + ph) * 0.012 + Math.sin(t * 2.6 + ph * 2) * 0.004;
    for (const [lay, ph] of [[L.midA, 0], [L.midB, 1.9]]) { ctx.save(); ctx.translate(0, 830); ctx.transform(1, 0, swayAt(ph), 1, 0, 0); ctx.translate(0, -830); drawTiled(ctx, lay, pxShift * 0.35, 0, speedPx * 0.35); ctx.restore(); }
    drawTiled(ctx, L.mid, pxShift * 0.35, 0, Math.min(4, speedPx * 0.35), true);   // v4: poles stay crisp and opaque (capped blur, opaque smear)
    drawTiled(ctx, L.verge, pxShift * 0.85, 0, speedPx * 0.85);
    // road
    const rg = ctx.createLinearGradient(0, 860, 0, K.H); rg.addColorStop(0, '#6a5a6e'); rg.addColorStop(1, '#4a3f55');
    ctx.fillStyle = rg; ctx.fillRect(-100, 860, K.W + 200, K.H - 860 + 100);
    ctx.fillStyle = K.rgba(P.halo, 0.18); ctx.fillRect(-100, 860, K.W + 200, 30);
    drawTiled(ctx, L.road, pxShift, 0, speedPx);
    // lane dashes (far edge line + near edge line), motion-stretched
    const dash = (y, h, col, period, len) => {
      const off = -(((pxShift) % period) + period) % period; ctx.fillStyle = col;
      for (let x = off - period; x < K.W + period; x += period) K.rrect(ctx, x, y, len + speedPx * 0.9, h, h / 2), ctx.fill();
    };
    dash(872, 7, K.rgba('#f3e2bd', 0.8), 12 * SC, 4 * SC);
    // long shadows of the cars (sun ahead -> shadows fall back, to the left)
    const shadowCar = (cx) => { ctx.fillStyle = K.rgba(P.shadow, 0.35); ctx.beginPath(); ctx.ellipse(cx - 260, GROUND + 4, 560, 22, 0, 0, K.TAU); ctx.fill(); };
    const leadX = CX + 3.3 * SC + st.gapL * SC, follX = CX - 3.3 * SC - st.gapF * SC;
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    shadowCar(CX); if (leadX < K.W + 900) shadowCar(leadX); if (follX > -900) shadowCar(follX);
    ctx.restore();
    const lit = { rim: P.rim, shade: P.shadow, dx: 1 };
    // leader (car 9) and follower (car 7): generic drivers
    const drawCarAt = (x, i, brake) => {
      const pe = E.persona(i);
      K.car.side(ctx, x, GROUND, SC, { color: pe.color, lit, brake, wheel: st.x * 3.1,
        drawDriver: (sx, sy) => K.char.head(ctx, sx, sy - SC * 0.3, SC * 0.36, { view: 'front', skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, capColor: pe.capColor,
          expr: brake > 0.5 ? 'worried' : 'content', look: [0.9, 0], light: { ang: -0.6, rim: P.rim, shade: P.shadow } }) });
    };
    if (leadX < K.W + 800) drawCarAt(leadX, E.LEADER, st.bL);
    if (follX > -800) drawCarAt(follX, E.MASCOT - 1, st.run.brake(E.MASCOT - 1, tau));
    // the leader's brake light spills red into the frame even before its car enters
    if (st.bL > 0.02) {
      const lx = Math.min(K.W + 250, leadX - 3.3 * SC * 0.495), ly = GROUND - 0.7 * SC;
      const near = K.clamp(1 - (lx - K.W) / 600);
      const rg2 = ctx.createLinearGradient(K.W, 0, K.W * 0.45, 0); rg2.addColorStop(0, K.rgba('#ff3a2a', 0.35 * st.bL * (0.5 + 0.5 * near))); rg2.addColorStop(1, K.rgba('#ff3a2a', 0));
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rg2; ctx.fillRect(K.W * 0.45, 0, K.W * 0.6, K.H); ctx.restore();
      K.light.glow(ctx, lx, ly, 1100, '#ff3a2a', 0.62 * st.bL, 'screen');
      K.light.glow(ctx, lx, ly, 300, '#ff5a3a', 0.55 * st.bL, 'lighter');
    }
    // the heroes' car
    const pitch = K.clamp(-st.aS * 0.018, -0.03, 0.05) + (st.tStop && tau > st.tStop ? -0.025 * Math.exp(-(tau - st.tStop) * 5) * Math.sin((tau - st.tStop) * 18) : 0);
    const bob = st.v > 0.3 ? Math.sin(t * 15) * 1.5 * Math.min(1, st.v / 6) : 0;
    const act = E.closeActing(st, t);
    const inertia = K.clamp(-st.aS * 0.02, -0.03, 0.12);
    const rimRed = K.clamp(st.bL * K.inv(9, 2, st.gapL));
    const mRim = K.mix(P.rim, '#ff7a5a', rimRed * 0.8);
    const HL = Object.assign({}, K.hero.LIGHT.golden, { ang: -0.75, rim: mRim, rimW: 0.045 });
    K.car.side(ctx, CX, GROUND + bob * 0.3, SC, { color: K.TEAL, lit: { rim: mRim, shade: P.shadow, dx: 1 }, brake: st.bM, pitch, wheel: st.x * 3.1,
      drawDriver: (sx, sy) => {
        if (opt.crew) { opt.crew(ctx, sx, sy, SC, { tau, bob, rim: mRim, inertia }); return; }
        const light = Object.assign({}, K.cast.LIGHT.golden, { rim: mRim });
        const r = K.cast.crew2(ctx, sx, sy, SC, { driver: 'eli1', passenger: 'mila1', t: tau, light, bob, u: 2.7 * SC, driverO: act.eli, passengerO: act.mila });
        const m = ctx.getTransform(), sp = q => { const z = m.transformPoint(new DOMPoint(q[0], q[1])); return [z.x, z.y]; };
        if (r.driver) E._eliHead = [...sp(r.driver.head), r.driver.head[2] * Math.hypot(m.a, m.b)];
      } });
    if (opt.after) opt.after(ctx, CX, GROUND + bob * 0.3, SC, { tau, bob, rim: mRim });
    // foreground near lane edge (in front of the cars, soft)
    ctx.fillStyle = K.rgba('#3c3348', 0.9); ctx.fillRect(-100, 1046, K.W + 200, 60);
    dash(1052, 9, K.rgba('#f3e2bd', 0.55), 12 * SC, 4 * SC);
    { // foreground grass: parallax 1.3, motion-blurred at speed, swaying in the wind when stopped
      const k = Math.sin(t * 1.4) * 0.05 + Math.sin(t * 3.2) * 0.015;
      ctx.save(); ctx.translate(0, K.H + 40); ctx.transform(1, 0, -k, 1, 0, 0); ctx.translate(0, -(K.H + 40));
      drawTiled(ctx, L.fore, pxShift * 1.3 + 300, 0, Math.min(40, speedPx * 1.3), true); ctx.restore(); }   // v3: opaque smear
    ctx.restore();
    // light, particles, grade (screen space)
    if (!opt.crew && act.bubble > 0.01 && E._eliHead && K.cast.bubble) K.cast.bubble(ctx, E._eliHead, '¡¿Quién fue?!', act.bubble);
    K.particles.motes(ctx, t, { n: 40, seed: 17, color: '#ffe6b0', alpha: 0.6, size: 2.4, vx: -12 - speedPx * 3, vy: -4 });
    K.particles.motes(ctx, t, { n: 7, seed: 18, color: '#ffd9a0', alpha: 0.35, size: 26, vx: -20 - speedPx * 4, vy: -2, y0: 100, y1: 700 });
    K.sky.wash(ctx, sunX, sunY, 900, '#ffb070', 0.22);
    K.light.grade(ctx, P.grade, 0.2, 'soft-light');
    K.light.grade(ctx, '#3a2050', 0.08, 'multiply');
    return st;
  };

  K.scene('closeup', {
    setup() { E.highway(); },
    draw(ctx, t, frame) { E.drawCloseup(ctx, t, frame, { t0: 6 }); },
    post: { grain: 0.13, vignette: 0.42, vignetteColor: '#2a1330', bloom: 0.22 },
  });
  K.scene('mascot_closeup', {   // v2 name kept as an alias
    setup() { E.highway(); },
    draw(ctx, t, frame) { E.drawCloseup(ctx, t, frame, { t0: 6 }); },
    post: { grain: 0.13, vignette: 0.42, vignetteColor: '#2a1330', bloom: 0.22 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
