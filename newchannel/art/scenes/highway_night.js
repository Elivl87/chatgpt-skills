/* Ep 001 · night: the jam wave as a ribbon of red lights, seen from a hill. Same world kit as the golden shot; a longer
   lane (110 cars on 2.2 km) so the ribbon runs to the horizon. The mascot watches from the hill (back view). */
(function (root) {
  const K = root.K, E = K.ep1;
  Object.assign(E.PAL.night, { grassFar: '#1f2846', field: '#1a2442', field2: '#202a48', tree: '#141c38', treeDark: '#0a1026', halo: '#9fb4ff', line: '#5a5f80', sun: '#f6efd8' });
  E.NIGHT = { N: 110, L: 2200, v0: 22, T: 1.0, a: 0.5, b: 1.5, s0: 2, carLen: 4.5, timeScale: 2, fps: 30, preroll: 3, duration: 30,
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
    const st = { t, simT, run, onc, sCam: E._nightS + (opt.sCam || 0) + t * 3, lCam: -75, H: 34, pitch: 0.105, yaw: 0.2 + Math.sin(t * 0.15) * 0.004, f: 1500, cy: 520,
      sun: { az: -0.12, elev: 0.17, r: 30 }, brake: i => run.brake(i, simT) };
    const g = E.drawHighway(ctx, Wn, st);
    // town lights twinkling near the horizon (drawn after: tiny, very far)
    const r = K.rng(5);
    for (let i = 0; i < 140; i++) { const x = 900 + r() * 1000, y = g.hz + 4 + r() * 18, a = 0.4 + 0.4 * Math.sin(t * (1 + r() * 2) + i);
      ctx.fillStyle = K.rgba(r() < 0.7 ? '#ffd28a' : '#ffffff', a); ctx.fillRect(x, y, 2, 2); }
    K.light.glow(ctx, 1350, g.hz + 10, 520, '#ffb070', 0.12, 'screen');
    // foreground hill with the mascot watching
    const hill = { x0: -40, x1: 2000, y: 930, amp: 120, freq: 0.0016, seed: 3, bottom: K.H + 10, peaks: x => 150 * Math.exp(-Math.pow((x - 330) / 420, 2)) - Math.max(0, x - 700) * 0.45 };
    const hillY = x => hill.y - (K.fbm(x * hill.freq, 0.5, 4, hill.seed) - 0.35) * hill.amp - hill.peaks(x);
    ctx.save();
    ctx.fillStyle = '#0a0f22'; K.terrain.ridgePath(ctx, hill); ctx.fill();
    ctx.save(); K.terrain.ridgePath(ctx, hill); ctx.clip(); ctx.strokeStyle = K.rgba('#9fb4ff', 0.4); ctx.lineWidth = 5; K.terrain.ridgePath(ctx, hill); ctx.stroke(); ctx.restore();
    const rr = K.rng(9);
    for (let x = 0; x < 1300; x += 7) K.terrain.tuft(ctx, x + rr() * 5, hillY(x) + 5, 16 + rr() * 22, '#0a0f22', { seed: rr() * 1e6 | 0, n: 4, wind: Math.sin(t * 1.2 + x * 0.01) * 0.25, rim: rr() < 0.3 ? '#5a6cb0' : null });
    K.terrain.tree(ctx, 150, hillY(150) + 8, 360, { color: '#10172f', shade: '#080c1c', trunk: '#080c1c', seed: 4, light: { dx: -0.8, back: 0.6, rim: '#7f93d8' } });
    // the mascot, sitting on the hill top, seen from behind: disc + tiny ink body, moonlit rim
    const mx = 430, R = 40, my = hillY(mx) - R * 1.55;
    ctx.fillStyle = '#121a36'; K.rrect(ctx, mx - R * 0.6, my + R * 0.7, R * 1.2, R * 0.95, [R * 0.45, R * 0.45, R * 0.2, R * 0.2]); ctx.fill();
    ctx.strokeStyle = K.rgba('#a9bcff', 0.6); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(mx - R * 0.6, my + R * 1.4); ctx.lineTo(mx - R * 0.6, my + R * 1.0); ctx.quadraticCurveTo(mx - R * 0.6, my + R * 0.7, mx - R * 0.2, my + R * 0.7); ctx.stroke();
    ctx.fillStyle = K.VERMILION; K.circle(ctx, mx, my, R); ctx.fill();
    K.circle(ctx, mx, my, R); K.tex.fillPath(ctx, 0.25, 0.4);
    K.char.discLight(ctx, mx, my, R, { ang: -2.3, rim: '#b4c4ff', rimW: 0.12, rimAlpha: 0.85, shade: '#2a0f2a', shadeAlpha: 0.5 });
    K.light.glow(ctx, mx + R * 0.7, my + R * 0.1, R * 1.6, '#ff4a36', 0.2, 'screen');
    ctx.restore();
    K.particles.motes(ctx, t, { n: 26, seed: 61, color: '#cfe0ff', alpha: 0.35, size: 1.6, vx: 4, vy: -2, y0: 300, y1: 1000 });   // fireflies / dust
    K.light.grade(ctx, '#3a4aa0', 0.25, 'soft-light');
    return g;
  };

  K.scene('highway_night', {
    setup() { E.nightRun(); E.nightOnc(); },
    draw(ctx, t, frame) { E.drawNight(ctx, t, frame); },
    post: { grain: 0.15, vignette: 0.55, vignetteColor: '#03040c', bloom: 0.45, bloomR: 26 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
