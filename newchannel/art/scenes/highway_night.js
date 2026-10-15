/* Ep 001 · night: the jam wave as a ribbon of red lights, seen from a hill. Same world kit as the golden shot; a longer
   lane (130 cars on 2.2 km) so the ribbon runs to the horizon. Quest and Pixie watch from the hill (back view). */
(function (root) {
  const K = root.K, E = K.ep1;
  Object.assign(E.PAL.night, { grassFar: '#1f2846', field: '#1a2442', field2: '#202a48', tree: '#141c38', treeDark: '#0a1026', halo: '#9fb4ff', line: '#5a5f80', sun: '#f6efd8' });
  E.NIGHT = { N: 130, L: 2200, v0: 22, T: 1.0, a: 0.5, b: 1.5, s0: 2, carLen: 4.5, timeScale: 2, fps: 30, preroll: 3, duration: 30,
    taps: [{ car: 60, t: 0.5, dur: 1.2, decel: 5 }] };
  let nr = null, no = null, Wn = null;
  E.nightRun = () => (nr = nr || K.sim.ring(E.NIGHT));
  E.nightOnc = () => (no = no || K.sim.ring({ N: 34, L: 2200, v0: 18, T: 1.2, a: 1.0, b: 1.5, s0: 2, timeScale: 2, fps: 30, preroll: 3, duration: 30, jitter: 30, seed: 9 }));

  E.drawNight = function (ctx, t, frame, opt = {}) {
    const P = E.PAL.night;
    if (!Wn) Wn = E.highwayWorld({ P, horizon: 430, night: true, clouds: false, rim: false, fogDist: 900, far: 3200, shadows: false, seed: 13,
      fieldColors: [P.field, P.field2, '#18213e', '#1c2645'] });
    const run = E.nightRun(), onc = E.nightOnc(), simT = (opt.simT ?? 12) + t * 0.5;
    // frame the jam: find the slowest car and put the camera ~450 m behind it along the road
    if (E._nightS == null) { const S = run.at(opt.simT ?? 12); let j = 0; for (let i = 0; i < run.N; i++) if (S.v[i] < S.v[j]) j = i; E._nightS = S.x[j] - 230; }
    if (!Wn.housesAdded) {   // mid-ground life: a lit farmhouse near the camera, smaller farms further out (world-anchored)
      Wn.housesAdded = true;
      const add = (ds, l, h, lit, smoke) => Wn.sc.objs.push({ k: 'house', s: E._nightS + ds, l, h, lit, smoke });
      add(150, -50, 7.5, 1, true); add(420, -115, 5, 1, true); add(700, 40, 5, 0.9, false); add(980, -30, 5, 1, false); add(1350, 120, 5, 0.8, false); add(1900, -160, 5, 1, false);
      Wn.sc.objs.sort((a, b) => a.s - b.s);
      Wn.clouds = [[300, 190, 520, 92, 1, 5], [1300, 160, 460, 80, 2, 4], [1800, 250, 380, 64, 3, 6], [700, 300, 300, 48, 4, 7]].map(([x, y, w, h, seed, v]) => ({ x, y, w, h, v, a: 0.85,
        o: { seed: 90 + seed, ang: K.sky.angTo(x, y, 780, 100), color: '#2c3466', shade: '#1a2048', lit: '#4a5590', rim: '#c9d4ff', rimW: 0.05, litOff: 2.4, litScale: 0.8 } }));
      Wn.opts.horizon = 430;
    }
    const st = { t, simT, run, onc, sCam: E._nightS + (opt.sCam || 0) + t * 3, lCam: -75, H: 34, pitch: 0.105, yaw: 0.2 + Math.sin(t * 0.15) * 0.004, f: 1500, cy: 520,
      sun: { az: -0.12, elev: 0.17, r: 30 }, brake: i => run.brake(i, simT) };
    const g = E.drawHighway(ctx, Wn, st);
    // town: clusters of warm lights near the horizon, each with a halo, a few street-light strings, a blinking mast
    const r = K.rng(5);
    const towns = [[1180, 6, 160, 70], [1560, 4, 220, 90], [1820, 8, 120, 40], [980, 10, 90, 26]];
    for (const [tx, ty, tw, n] of towns) {
      K.light.glow(ctx, tx, g.hz + ty, tw * 1.4, '#ffb070', 0.16, 'screen');
      for (let i = 0; i < n; i++) { const x = tx + (r() - 0.5) * tw * (1 - Math.abs(r() - 0.5)), y = g.hz + ty + (r() - 0.6) * 10, a = 0.55 + 0.35 * Math.sin(t * (0.8 + r() * 2.5) + i);
        const c = r() < 0.75 ? '#ffd28a' : '#fff4e0'; ctx.fillStyle = K.rgba(c, a); K.circle(ctx, x, y, r() < 0.15 ? 1.8 : 1.1); ctx.fill(); if (r() < 0.2) K.light.glow(ctx, x, y, 7, c, 0.4 * a, 'screen'); }
    }
    for (let k = 0; k < 2; k++) for (let i = 0; i < 24; i++) { const x = 1240 + k * 380 + i * 9, y = g.hz + 14 + k * 4 + i * 0.6; ctx.fillStyle = K.rgba('#ffe0a0', 0.75); ctx.fillRect(x, y, 1.6, 1.6); }
    { const on = (t % 1.6) < 0.8; ctx.fillStyle = '#121a3a'; ctx.fillRect(1497, g.hz - 50, 2, 56); if (on) { K.light.glow(ctx, 1498, g.hz - 51, 14, '#ff4a36', 0.7, 'screen'); ctx.fillStyle = '#ff6a50'; K.circle(ctx, 1498, g.hz - 51, 2); ctx.fill(); } }
    // foreground hill with the mascot watching
    const hill = { x0: -40, x1: 2000, y: 930, amp: 120, freq: 0.0016, seed: 3, bottom: K.H + 10, peaks: x => 150 * Math.exp(-Math.pow((x - 330) / 420, 2)) - Math.max(0, x - 700) * 0.45 };
    const hillY = x => hill.y - (K.fbm(x * hill.freq, 0.5, 4, hill.seed) - 0.35) * hill.amp - hill.peaks(x);
    ctx.save();
    ctx.fillStyle = '#0a0f22'; K.terrain.ridgePath(ctx, hill); ctx.fill();
    ctx.save(); K.terrain.ridgePath(ctx, hill); ctx.clip(); ctx.strokeStyle = K.rgba('#9fb4ff', 0.4); ctx.lineWidth = 5; K.terrain.ridgePath(ctx, hill); ctx.stroke(); ctx.restore();
    const rr = K.rng(9);
    for (let x = 0; x < 1300; x += 7) K.terrain.tuft(ctx, x + rr() * 5, hillY(x) + 5, 16 + rr() * 22, '#0a0f22', { seed: rr() * 1e6 | 0, n: 4, wind: Math.sin(t * 1.2 + x * 0.01) * 0.25, rim: rr() < 0.3 ? '#5a6cb0' : null });
    K.terrain.tree(ctx, 150, hillY(150) + 8, 360, { color: '#10172f', shade: '#080c1c', trunk: '#080c1c', seed: 4, light: { dx: -0.8, back: 0.6, rim: '#7f93d8' }, sway: Math.sin(t * 0.9) * 0.018 + Math.sin(t * 2.2) * 0.005 });
    // v3: Quest and Pixie sit on the hill top, seen from behind, watching the ribbon of lights. Every ~7 s Pixie lifts
    // her arm and points at the wave; Quest turns his head to follow. Moonlit rim from the upper left.
    { const NL = Object.assign({}, K.hero.LIGHT.night, { ang: -2.4 }), u = 42;
      const cyc = t % 7, pk = K.ease.sine(K.clamp((cyc - 3.0) / 0.4)) * (1 - K.ease.sine(K.clamp((cyc - 5.6) / 0.4)));
      const qx = 380, px = 495, PC = K.hero.CHARS.pixie;
      K.hero.draw(ctx, 'quest', qx, hillY(qx) + 6, u, { pose: 'sit', view: 0.42, yaw: Math.PI - 0.28, t, light: NL, contact: 0, headYaw: -0.25 * pk, seed: 1 });
      const rest = [-0.55, PC.hipJ + 0.55, 1.2], aimP = [-1.45, PC.shJ + 0.2, 0.95];
      const tgt = rest.map((r, i) => K.lerp(r, aimP[i], pk));
      K.hero.draw(ctx, 'pixie', px, hillY(px) + 6, u, { pose: 'sit', view: 0.42, yaw: Math.PI - 0.42, t, light: NL, contact: 0, seed: 2,
        armL: { ik: tgt, pole: [-1, -1, 0], hand: pk > 0.5 ? 'point' : 'relaxed' } });
      K.light.glow(ctx, (qx + px) / 2 + 60, hillY(qx) - 40, 160, '#ff4a36', 0.12, 'screen');   // the ribbon's red light reaching them
    }
    ctx.restore();
    K.particles.motes(ctx, t, { n: 22, seed: 61, color: '#cfe0ff', alpha: 0.3, size: 1.4, vx: 4, vy: -2, y0: 300, y1: 1000 });   // moonlit dust
    K.terrain.fireflies(ctx, t, { n: 44, seed: 62, x0: 0, x1: 1300, y0: 700, y1: 1060, size: 1.7 });
    K.terrain.fireflies(ctx, t, { n: 30, seed: 63, x0: 300, x1: 1500, y0: 560, y1: 800, size: 0.9 });
    K.light.grade(ctx, '#3a4aa0', 0.25, 'soft-light');
    return g;
  };

  K.scene('highway_night', {
    setup() { E.nightRun(); E.nightOnc(); },
    draw(ctx, t, frame) { E.drawNight(ctx, t, frame); },
    post: { grain: 0.15, vignette: 0.55, vignetteColor: '#03040c', bloom: 0.45, bloomR: 26 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
