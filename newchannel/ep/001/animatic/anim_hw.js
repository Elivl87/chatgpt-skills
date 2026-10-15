/* Ep 001 · animatic worlds for the golden highway (S1): the perspective road (the kit's E.drawHighway, driven by the
   S1 run through an adapter: sim seconds in, Eli = car 20, teal), the side close-up (E.drawCloseup with a state read
   from S1 and the crew acted by the shot), the wordmark (E.drawWordmark with the animatic's gag timing). */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim;
  const ELI = 20;
  A.ELI = ELI;
  let Wg = null, run = null;
  A.s1 = () => (run = run || A.adapter('S1'));

  // smoothed camera anchor on car i (sim seconds window) so a tracking crane never jerks on a hard brake
  A.camX = function (i, ts, win = 0.8) {
    const R = A.s1(); let acc = 0, w = 0;
    for (let k = -8; k <= 8; k++) { const tt = ts + k * win / 8, ww = Math.exp(-(k * k) / 18); acc += R.at(tt).x[i] * ww; w += ww; }
    return acc / w;
  };

  // c: { simT, sCam | camOn: [i, offset], lCam, H, pitch, yaw, f, cy, reverse, crew: tt -> { eli, mila }, onGround, onTop,
  //      carExpr, hide, fg: bool (framing branch + reeds), rays: bool, shimmer: bool, sun }
  A.hw = function (ctx, t, c) {
    if (!Wg) Wg = E.highwayWorld({ P: E.PAL.golden, horizon: 470, cloudList: E.goldenClouds() });
    const R = A.s1(), ts = c.simT, P = E.PAL.golden;
    const sCam = c.sCam ?? (A.camX(c.camOn ? c.camOn[0] : ELI, ts) + (c.camOn ? c.camOn[1] : -31));
    const st = { t, simT: ts, run: R, onc: null, sCam, lCam: c.lCam ?? 0.4, H: c.H ?? 8.2, pitch: c.pitch ?? 0.07, yaw: c.yaw ?? -0.012, f: c.f ?? 1600, cy: c.cy,
      sun: c.sun || { az: 0.035, elev: 0.095, r: 42 }, brake: i => R.brake(i, ts), mascot: ELI, reverse: !!c.reverse,
      crewOpts: c.crew, onGround: c.onGround, onTop: c.onTop, carExpr: c.carExpr, hide: c.hide };
    const g = E.drawHighway(ctx, Wg, st);
    if (!c.reverse) {
      if (c.shimmer !== false) K.light.shimmer(ctx, g.sunX - 420, g.hz - 6, 840, 64, t, { amp: 2.0 });
      if (c.fg) { const fg = E.goldenFG();
        K.terrain.drawSway(ctx, fg.branch, -30, -40, t, { amp: 0.02, f: 0.8 });
        K.terrain.drawWind(ctx, fg.reedsL, 120, K.H + 30, t, { amp: 0.06, f: 1.2, ph: 0.4 });
        K.terrain.drawWind(ctx, fg.reedsR, K.W - 110, K.H + 30, t, { amp: 0.06, f: 1.35, ph: 2.1 }); }
      if (c.rays !== false) K.light.rays(ctx, g.sunX, g.sunY, { n: 11, spread: 2.3, angle: Math.PI / 2, len: 1500, width: 0.05, alpha: 0.10, color: '#ffe0a0', t, seed: 5 });
      K.sky.wash(ctx, g.sunX, g.sunY, 700, '#ffb070', 0.28);
    } else K.sky.wash(ctx, K.W * 0.5, -200, 900, '#ffb070', 0.12);
    if (c.after) c.after(ctx, g);
    K.particles.motes(ctx, t, { n: 50, seed: 7, x0: 0, x1: K.W, y0: 120, y1: 900, color: '#ffe6b0', alpha: 0.55, size: 2.2, vx: 6, vy: -3 });
    K.light.grade(ctx, P.grade, 0.22, 'soft-light');
    K.light.grade(ctx, '#3a2050', 0.10, 'multiply');
    return g;
  };
  // project a point of the road (s, l, height y metres) with the camera of the last A.hw call's g
  A.proj = function (g, s, l, y = 0) {
    const w = Wg.road.world(s, l), c = g.rig.toCam(w.x, w.z); if (c[1] < 0.5) return null;
    const p = g.cam.proj(c[0], y, c[1]); return { x: p.x, y: p.y, s: p.s, d: c[1] };
  };
  A.road = () => Wg.road;
  // aim the camera: yaw/pitch so the road point (s, l, y) lands on screen point to=[x, y] (default centre)
  A.aim = function (sCam, lCam, H, f, s, l, y = 0, to = null, rev = false) {
    if (!Wg) Wg = E.highwayWorld({ P: E.PAL.golden, horizon: 470, cloudList: E.goldenClouds() });
    const road = Wg.road, rig0 = road.rig(sCam, lCam, 0), w = road.world(s, l), c = rig0.toCam(w.x, w.z);
    const tx = to ? to[0] : K.W / 2, ty = to ? to[1] : K.H / 2;
    const yaw = Math.atan2(c[0], c[1]) - Math.atan((tx - K.W / 2) / f);
    const Z = Math.hypot(c[0], c[1]), vy = y - H, k = (K.H / 2 - ty) / f;
    const yw = rev ? Math.atan2(Math.sin(yaw - Math.PI), Math.cos(yaw - Math.PI)) : yaw;   // reverse rigs already turn by pi
    return { yaw: yw, pitch: Math.atan2(k * Z - vy, Z + k * vy) };
  };

  // ------------------------------------------------------------------ side close-up of the teal car (Eli = car 20)
  // c: { simT, frame: {z, wx, wy, sx, sy}, tStop (sim), crew(ctx, sx, sy, SC, st, info), after(ctx, CX, GY, SC, st), dx }
  A.close = function (ctx, t, frame, c) {
    const st = A.closeState('S1', ELI, c.simT, { tStop: c.tStop ?? null, dx: c.dx });
    A._outer = ctx.getTransform();
    return E.drawCloseup(ctx, t, frame, { t0: 1e9, frame: c.frame, state: st, crew: c.crew, after: c.after });
  };
  // a point in the current (car-local) transform -> the outer coordinates of the shot (to draw balloons in the shot)
  A.toOuter = function (ctx, x, y) {
    const m = A._outer.inverse().multiply(ctx.getTransform()), p = m.transformPoint(new DOMPoint(x, y));
    return [p.x, p.y, Math.hypot(m.a, m.b)];
  };
  // the pair in the car (side view): driver Eli, passenger Mila, with the shot's acting. eliStand: 0..1 rises from the
  // seat to standing on it (the car body hides his legs); returns heads in outer coordinates.
  A.crew = function (ctx, sx, sy, SC, info, eO, mO, o = {}) {
    const light = Object.assign({}, K.cast.LIGHT.golden, { rim: info.rim }), u = 2.7 * SC, seatY = sy + 0.34 * SC + (info.bob || 0), out = {};
    // Mila first (she sits on the far side in this view? no: the passenger is the near seat, drawn after Eli)
    const stand = K.clamp(o.eliStand || 0);
    if (stand > 0.001) {
      const ex = sx + 0.24 * SC, legs = K.cast.SPECS.eli1.legLen * u;
      const y = seatY + legs * (1 - K.ease.outBack(stand)) * 0.9 - 0.02 * u;
      const r = K.cast.draw(ctx, 'eli1', ex, y, u, Object.assign({ view: 'q', dir: 1, pose: 'stand', t: info.tau, light }, eO));
      out.eli = r; out.eliHead = A.toOuter(ctx, r.head[0], r.head[1]); out.eliHead[2] = r.head[2] * out.eliHead[2];
      // the empty wheel stays on the column
      const pr = K.cast.probe('eli1', ex, seatY, u, { view: 'q', dir: 1, pose: 'drive', seated: true });
      ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#1c2433'; ctx.lineWidth = 0.05 * SC; const wx = pr.hands.lead[0] + 0.01 * SC, wy = pr.hands.lead[1];
      ctx.beginPath(); ctx.moveTo(wx + 0.02 * SC, wy + 0.06 * SC); ctx.lineTo(sx + 1.15 * SC, sy + 0.32 * SC); ctx.stroke();
      ctx.lineWidth = 0.055 * SC; ctx.beginPath(); ctx.ellipse(wx, wy, 0.07 * SC, 0.25 * SC, 0.32, 0, K.TAU); ctx.stroke(); ctx.restore();
      const rm = K.cast.draw(ctx, 'mila1', sx - 0.8 * SC, seatY + 0.02 * SC, u, Object.assign({ view: 'q', dir: 1, pose: 'lap', seated: true, t: info.tau, light }, mO));
      out.mila = rm; out.milaHead = A.toOuter(ctx, rm.head[0], rm.head[1]); out.milaHead[2] = rm.head[2] * out.milaHead[2];
      return out;
    }
    const r = K.cast.crew2(ctx, sx, sy, SC, { driver: 'eli1', passenger: 'mila1', t: info.tau, light, bob: info.bob, u, driverO: eO, passengerO: mO });
    if (r.driver) { out.eli = r.driver; out.eliHead = A.toOuter(ctx, r.driver.head[0], r.driver.head[1]); out.eliHead[2] *= r.driver.head[2]; }
    if (r.passenger) { out.mila = r.passenger; out.milaHead = A.toOuter(ctx, r.passenger.head[0], r.passenger.head[1]); out.milaHead[2] *= r.passenger.head[2]; }
    return out;
  };
  // the closeup's wire (mid layer, parallax 0.35, poles every 600 px): world point on the upper wire at segment j, u
  A.wireAt = function (st, j, u, yy = 372) {
    const SCm = 215, shift = st.x * SCm * 0.35, TW = 2400, off = -(((shift % TW) + TW) % TW);
    const x0 = off + j * 600 - 260, cx = off + j * 600 + 100, x1 = off + j * 600 + 340;   // tile wires start at x = -400 + 600 j (+140)
    const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), d = u * u;
    return [a * x0 + b * cx + d * x1, a * yy + b * (yy + 44) + d * yy];
  };
})(typeof window !== 'undefined' ? window : globalThis);
