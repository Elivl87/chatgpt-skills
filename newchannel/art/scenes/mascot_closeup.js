/* Ep 001 · close-up: the mascot (car 8 of the IDM run) as the jam wave reaches it. Side view, golden hour, sun ahead.
   Nothing here is keyframed by hand except the camera: the leader's brake light, the gap to the leader and to the car
   behind, the mascot's speed, nose-dip and every expression change are read from the same run as the wide shot. */
(function (root) {
  const K = root.K, E = K.ep1;
  const SC = 230, GROUND = 992, CX = 760, TW = 2400;   // px per metre, ground line, mascot car centre, tile width
  E.CLOSE = { simOffset: -0.6 };                        // close-up sim time = video time - 0.6 s (editorial overlap)
  let L = null;

  function tileLayer(draw, h = K.H, blur = 0) {
    const t = K.canvas(TW, h); draw(t.ctx, t);
    if (blur) { const b = K.canvas(TW, h); b.ctx.filter = `blur(${blur}px)`; b.ctx.drawImage(t.c, 0, 0); b.ctx.drawImage(t.c, -TW, 0); b.ctx.drawImage(t.c, TW, 0); return b; }
    return t;
  }
  function drawTiled(ctx, layer, shift, y = 0, blurPx = 0) {
    const off = -(((shift % TW) + TW) % TW);
    const n = blurPx > 2 ? Math.min(12, Math.ceil(blurPx / 6)) : 1;
    for (let k = 0; k < n; k++) {
      ctx.globalAlpha = n > 1 ? 1 / (k + 1) : 1;      // running average of n shifted copies = box motion blur
      const o2 = off + (n > 1 ? (k / (n - 1) - 0.5) * blurPx : 0);
      ctx.drawImage(layer.c, o2, y); ctx.drawImage(layer.c, o2 + TW, y); if (o2 + 2 * TW < K.W) ctx.drawImage(layer.c, o2 + 2 * TW, y);
    }
    ctx.globalAlpha = 1;
  }

  function build() {
    const P = E.PAL.golden, HZ = 640;
    const sky = K.canvas(K.W, K.H);
    K.sky.gradient(sky.ctx, [[0, '#6b6aa6'], [0.25, '#b58aaa'], [0.45, '#f0a47e'], [0.6, '#ffc98c'], [0.7, '#ffe0a8']], 0, HZ + 80);
    [[300, 150, 700, 38, '#8f78a6', '#f7b98d', 3, 1], [1150, 110, 560, 30, '#8d77a5', '#f4b28b', 2, 2], [1780, 200, 520, 30, '#9a7ea7', '#f8c092', 3, 3], [820, 330, 380, 18, '#c48ea1', '#ffd8a4', 2, 4]]
      .forEach(([x, y, w, h, c, l, r, s]) => K.sky.bank(sky.ctx, x, y, w, h, { color: c, lit: l, rows: r, seed: 50 + s, top: K.shade(c, -0.15) }));
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
    const mid = tileLayer((c, t) => {   // roadside trees + poles, slightly soft (depth of field)
      const r = K.rng(91);
      for (let x = 60; x < TW; x += 260 + r() * 300) {
        const h = 260 + r() * 140, kind = r() < 0.3 ? 'poplar' : 'round';
        K.terrain.tree(c, x, 830, h, { kind, seed: r() * 1e6 | 0, color: K.mix(P.tree, P.haze, 0.15), shade: K.mix(P.treeDark, P.haze, 0.1), trunk: '#4a3638', light: { dx: 0.7, back: 0.75, rim: P.rim } });
      }
      for (let x = 0; x < TW; x += 600) { const arms = K.terrain.pole(c, x + 200, 840, 470, { color: '#3d2c30', rim: P.rim, dx: 1 }); void arms; }
      c.strokeStyle = K.rgba('#3a2a35', 0.7); c.lineWidth = 2;
      for (const yy of [394, 400]) { c.beginPath(); for (let x = -400; x <= TW + 400; x += 600) { c.moveTo(x + 200 - 68, yy); c.quadraticCurveTo(x + 500, yy + 40, x + 800 - 68, yy); } c.stroke(); }
      K.tex.paint(t, { amount: 0.4, mottle: { w: 1000, h: 500, sx: 0.006, sy: 0.04, seed: 92, amp: 45 } });
    }, K.H, 2.5);
    const verge = tileLayer((c, t) => {   // grass bank + guardrail right behind the far lane
      c.fillStyle = K.mix(P.grass, P.field, 0.35); c.fillRect(0, 800, TW, 70);
      const r = K.rng(101);
      for (let x = 0; x < TW; x += 9) K.terrain.tuft(c, x + r() * 6, 836 + r() * 30, 26 + r() * 30, K.shade(P.grass, -0.25 + r() * 0.15), { seed: r() * 1e6 | 0, n: 4, rim: P.rim });
      // guardrail
      for (let x = 0; x < TW; x += 120) { c.fillStyle = '#5e5260'; c.fillRect(x + 20, 812, 10, 48); c.fillStyle = K.rgba(P.rim, 0.7); c.fillRect(x + 27, 812, 3, 48); }
      c.fillStyle = '#8d8a96'; c.fillRect(0, 812, TW, 16); c.fillStyle = K.rgba('#fff2cf', 0.75); c.fillRect(0, 812, TW, 4); c.fillStyle = '#5f5a6b'; c.fillRect(0, 826, TW, 4);
      K.tex.paint(t, { amount: 0.4 });
    });
    return { sky, far, hills, fields, mid, verge, HZ };
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

  E.drawCloseup = function (ctx, t, frame, opt = {}) {
    if (!L) L = build();
    const P = E.PAL.golden, st = E.closeState(t), tau = st.tau;
    const pxShift = st.x * SC, speedPx = st.v * 2 * SC / 30;          // px per frame at the car's depth (timescale 2)
    // camera: slow push-in toward the mascot, tiny drift
    const z = 1 + 0.07 * K.ease.sine(K.inv(0, 6, t - (opt.t0 ?? 6))) , headX = CX - 40, headY = GROUND - 1.25 * SC;
    ctx.save();
    ctx.translate(headX, headY); ctx.scale(z, z); ctx.translate(-headX + Math.sin(t * 0.4) * 3, -headY + Math.sin(t * 0.33) * 2);
    ctx.drawImage(L.sky.c, 0, 0);
    // sun + glow behind the leader
    const sunX = 1480, sunY = 250;
    K.sky.sun(ctx, sunX, sunY, 48, { core: P.sun, halo: P.halo, glow: 650, glowAlpha: 0.6, rings: 4, ringStep: 0.9, ringAlpha: 0.07 });
    drawTiled(ctx, L.far, pxShift * 0.01);
    drawTiled(ctx, L.hills, pxShift * 0.04);
    drawTiled(ctx, L.fields, pxShift * 0.12);
    K.light.rays(ctx, sunX, sunY, { n: 10, spread: 2.0, angle: Math.PI / 2 + 0.35, len: 1300, width: 0.05, alpha: 0.09, color: '#ffe0a0', t, seed: 9 });
    drawTiled(ctx, L.mid, pxShift * 0.35, 0, speedPx * 0.35);
    drawTiled(ctx, L.verge, pxShift * 0.85, 0, speedPx * 0.85);
    // road
    const rg = ctx.createLinearGradient(0, 860, 0, K.H); rg.addColorStop(0, '#6a5a6e'); rg.addColorStop(1, '#4a3f55');
    ctx.fillStyle = rg; ctx.fillRect(-100, 860, K.W + 200, K.H - 860 + 100);
    ctx.fillStyle = K.rgba(P.halo, 0.18); ctx.fillRect(-100, 860, K.W + 200, 30);
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
    // the mascot's car
    const pitch = K.clamp(-st.aS * 0.018, -0.03, 0.05) + (st.tStop && tau > st.tStop ? -0.025 * Math.exp(-(tau - st.tStop) * 5) * Math.sin((tau - st.tStop) * 18) : 0);
    const bob = st.v > 0.3 ? Math.sin(t * 15) * 1.5 * Math.min(1, st.v / 6) : 0;
    // expressions from sim events
    let expr = 'content', extras = [], look = [0.75, -0.05], blink = 0;
    const since = (e) => (e == null ? -1 : tau - e);
    if (since(st.leadOn) > 0.12) { expr = 'surprised'; extras = ['ticks']; look = [0.9, 0]; }
    if (since(st.selfOn) > 0.15) { expr = 'worried'; extras = ['sweat']; }
    if (since(st.selfOn) > 1.6) { expr = 'focused'; extras = []; }
    if (st.tStop && since(st.tStop) > 0.15) { expr = 'annoyed'; extras = ['puff']; look = [0.3, 0.1]; }
    if (st.tStop && since(st.tStop) > 0.9) { expr = 'grumpy'; extras = ['puff', 'anger']; look = [0.0, 0.15]; }
    if (expr === 'content') blink = ((t % 2.7) < 0.12) ? 1 : 0;
    const inertia = K.clamp(-st.aS * 7, -4, 14);
    const rimRed = K.clamp(st.bL * K.inv(9, 2, st.gapL));
    const mRim = K.mix(P.rim, '#ff7a5a', rimRed * 0.8);
    K.car.side(ctx, CX, GROUND + bob * 0.3, SC, { color: K.TEAL, lit: { rim: mRim, shade: P.shadow, dx: 1 }, brake: st.bM, pitch, wheel: st.x * 3.1,
      drawDriver: (sx, sy) => {
        const R = SC * 0.62, hx = sx + inertia, hy = sy - R * 0.62 + bob;
        K.char.mascot(ctx, hx, hy, R, { expr, look, blink, rim: mRim, lightAng: -0.55, rimW: 0.08, shadeAlpha: 0.3,
          sx: 1 + (st.tStop && since(st.tStop) > 0 && since(st.tStop) < 0.4 ? 0.06 * Math.sin(since(st.tStop) * 20) * Math.exp(-since(st.tStop) * 6) : 0) });
        for (const ex of extras) K.char.extra(ctx, hx, hy, R, ex, ex === 'sweat' ? (tau * 0.8) % 1 : tau, { color: ex === 'puff' ? '#fff3df' : undefined });
        // steering wheel + hands (ink, outside the disc)
        ctx.save(); ctx.strokeStyle = K.INK; ctx.lineWidth = R * 0.09;
        ctx.beginPath(); ctx.ellipse(sx + R * 1.32, sy - R * 0.08, R * 0.09, R * 0.34, 0.32, 0, K.TAU); ctx.stroke();
        ctx.fillStyle = K.INK; const grip = expr === 'worried' || expr === 'focused' ? 1 : 0;
        K.circle(ctx, sx + R * 1.24 + inertia * 0.5, sy - R * 0.36 - grip * 3, R * 0.13); ctx.fill();
        K.circle(ctx, sx + R * 1.4 + inertia * 0.5, sy + R * 0.16, R * 0.13); ctx.fill();
        ctx.restore();
      } });
    // foreground near lane edge (in front of the cars, soft)
    ctx.fillStyle = K.rgba('#3c3348', 0.9); ctx.fillRect(-100, 1046, K.W + 200, 60);
    dash(1052, 9, K.rgba('#f3e2bd', 0.55), 12 * SC, 4 * SC);
    ctx.restore();
    // light, particles, grade (screen space)
    K.particles.motes(ctx, t, { n: 40, seed: 17, color: '#ffe6b0', alpha: 0.6, size: 2.4, vx: -12 - speedPx * 3, vy: -4 });
    K.particles.motes(ctx, t, { n: 7, seed: 18, color: '#ffd9a0', alpha: 0.35, size: 26, vx: -20 - speedPx * 4, vy: -2, y0: 100, y1: 700 });
    K.sky.wash(ctx, sunX, sunY, 900, '#ffb070', 0.22);
    K.light.grade(ctx, P.grade, 0.2, 'soft-light');
    K.light.grade(ctx, '#3a2050', 0.08, 'multiply');
    return st;
  };

  K.scene('mascot_closeup', {
    setup() { E.highway(); },
    draw(ctx, t, frame) { E.drawCloseup(ctx, t, frame, { t0: 6 }); },
    post: { grain: 0.13, vignette: 0.42, vignetteColor: '#2a1330', bloom: 0.22 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
