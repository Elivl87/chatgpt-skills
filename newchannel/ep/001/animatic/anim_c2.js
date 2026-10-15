/* Ep 001 · animatic worlds for Act 2, beats 11-13: the stadium stands (the crowd wave, our own stadium, no logos), the
   indoor dome ring (S5_25 / S5_28, oblique top view; split screen), the night valley (S6: 40 km ring, 1778 cars, the
   red wave travelling back through the ribbon of lights), the lit farmhouse window (the driver who already went home). */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const INK = '#2a1a1e', PAPER = '#fbf3e4', TEAL = '#23746C';

  // ------------------------------------------------------------------ stadium stands: rows of round-headed fans
  // c: { wave(x) -> 0..1 (how "up" the fan at screen x is), eli, mila (fn(ctx, x, y, u) draw them), z, pan }
  let ST = null;
  function buildStadium() {
    const bg = K.canvas(K.W, K.H), c = bg.ctx;
    K.sky.gradient(c, [[0, '#6f7fb3'], [0.5, '#e7b68f'], [1, '#ffd9a0']], 0, 360);
    K.sky.wash(c, 1500, 120, 800, '#ffe0a8', 0.6);
    // the far stands across the field (a curved band of tiny dots)
    c.fillStyle = '#7a6a7e'; c.beginPath(); c.moveTo(0, 300); c.quadraticCurveTo(960, 230, 1920, 300); c.lineTo(1920, 420); c.quadraticCurveTo(960, 360, 0, 420); c.closePath(); c.fill();
    const r = K.rng(201); for (let k = 0; k < 1600; k++) { const x = r() * K.W, u = x / K.W, y0 = 300 - Math.sin(u * Math.PI) * 70 + 8, y = y0 + r() * (110 - 8); c.fillStyle = ['#e9d2b4', '#c98a64', '#f2c8a8', '#9a6447', '#6b8fb0', '#c7a6c9', '#e2b04a', '#a9bf8e'][(r() * 8) | 0]; K.circle(c, x, y, 2 + r() * 1.5); c.fill(); }
    // floodlight masts
    for (const x of [180, 1740]) { c.fillStyle = '#4a3f55'; c.fillRect(x - 6, 60, 12, 260); c.fillStyle = '#fff4d0'; K.rrect(c, x - 50, 40, 100, 34, 6); c.fill(); }
    // the field
    const g = c.createLinearGradient(0, 400, 0, 560); g.addColorStop(0, '#7f9a52'); g.addColorStop(1, '#5f7e3e'); c.fillStyle = g; c.fillRect(0, 400, K.W, 200);
    for (let k = 0; k < 12; k++) { c.fillStyle = K.rgba(k % 2 ? '#8fae5c' : '#6a8a44', 0.5); c.fillRect(k * 160, 400, 80, 200); }
    K.tex.paint(bg, { amount: 0.35, mottle: { w: 1200, h: 680, sx: 0.004, sy: 0.02, seed: 202, amp: 30 } });
    const fans = [];
    for (let row = 0; row < 5; row++) for (let k = 0; k < 15; k++) fans.push({ row, x: 40 + k * 128 + (row % 2) * 64 + (K.rng(row * 50 + k)() - 0.5) * 20, seed: 300 + row * 40 + k });
    ST = { bg, fans };
  }
  A.stadium = function (ctx, t, c) {
    if (!ST) buildStadium();
    ctx.drawImage(ST.bg.c, 0, 0);
    K.light.rays(ctx, 1500, 60, { n: 8, spread: 1.4, angle: Math.PI / 2 + 0.5, len: 1200, width: 0.05, alpha: 0.07, color: '#fff0c8', t, seed: 41 });
    for (let row = 0; row < 5; row++) {
      const y = 600 + row * 112, R = 30 + row * 4;
      // the step (concrete) of this row
      ctx.fillStyle = K.mix('#8a7a8e', '#c9b6a6', row / 5); ctx.fillRect(0, y - 6, K.W, 120); ctx.fillStyle = K.rgba('#2a1830', 0.25); ctx.fillRect(0, y - 6, K.W, 8);
      for (const f of ST.fans) { if (f.row !== row) continue;
        if (c.skip && c.skip(f)) continue;
        const up = c.wave ? c.wave(f.x) : 0, pe = K.car.persona(f.seed, 3);
        K.char.person(ctx, f.x, y + 90 - up * R * 0.9, R, { t, seed: f.seed, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, capColor: pe.capColor, shirt: K.car.COLORS[f.seed % 10],
          pose: up > 0.4 ? 'cheer' : 'sit', expr: up > 0.4 ? 'laugh' : (f.seed % 3 ? 'content' : 'curious'), light: { ang: -0.8, rim: '#ffe0a0', shade: '#3c2a52' } });
      }
      if (c.row === row && c.chars) c.chars(ctx, y + 90, R);
    }
    K.particles.motes(ctx, t, { n: 30, seed: 203, color: '#fff0c8', alpha: 0.45, size: 2.2, vx: 6, vy: -3 });
    K.light.grade(ctx, '#ff9a5a', 0.15, 'soft-light');
  };

  // ------------------------------------------------------------------ the dome ring (indoor): oblique top view of a 314 m ring
  // c: { run (adapter), simT, view: { sc, ox, oy }, eli (index of Eli's car, teal), hide(i), carOver(ctx, i, x, y, S), marks }
  let DM = null;
  const DR = 314 / K.TAU;
  function buildDome() {
    const bg = K.canvas(K.W, K.H), c = bg.ctx;
    const g = c.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, '#2a2442'); g.addColorStop(0.35, '#4a3b5a'); g.addColorStop(1, '#6a5560'); c.fillStyle = g; c.fillRect(0, 0, K.W, K.H);
    // roof ribs (a dome seen from inside, upper part of the frame)
    c.strokeStyle = K.rgba('#c9b6d6', 0.25); c.lineWidth = 6; for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(960 + k * 60, -40); c.quadraticCurveTo(960 + k * 230, 120, 960 + k * 330, 260); c.stroke(); }
    c.strokeStyle = K.rgba('#c9b6d6', 0.18); c.lineWidth = 4; for (let k = 1; k <= 4; k++) { c.beginPath(); c.ellipse(960, -60, 300 * k + 200, 90 * k + 40, 0, 0, Math.PI); c.stroke(); }
    // stands (tiers of dots) round the floor
    const r = K.rng(211);
    for (let tier = 0; tier < 4; tier++) { c.fillStyle = K.mix('#5a4a62', '#8a7480', tier / 4); c.beginPath(); c.ellipse(960, 640, 1000 - tier * 40, 420 - tier * 26, 0, 0, K.TAU); c.fill(); }
    for (let k = 0; k < 2600; k++) { const a = r() * K.TAU, rr = 0.86 + r() * 0.14; const x = 960 + Math.cos(a) * 1000 * rr, y = 640 + Math.sin(a) * 420 * rr; if (y < 230) continue;
      c.fillStyle = ['#e9d2b4', '#c98a64', '#f2c8a8', '#9a6447', '#6b8fb0', '#c7a6c9', '#e2b04a', '#a9bf8e'][(r() * 8) | 0]; K.circle(c, x, y, 2 + r() * 1.6); c.fill(); }
    // floor: artificial turf
    c.fillStyle = '#5f7e4a'; c.beginPath(); c.ellipse(960, 640, 860, 340, 0, 0, K.TAU); c.fill();
    for (let k = -8; k <= 8; k++) { c.save(); c.beginPath(); c.ellipse(960, 640, 860, 340, 0, 0, K.TAU); c.clip(); c.fillStyle = K.rgba(k % 2 ? '#6f9056' : '#56743f', 0.5); c.fillRect(960 + k * 110, 280, 55, 740); c.restore(); }
    K.tex.paint(bg, { amount: 0.35, mottle: { w: 1200, h: 680, sx: 0.004, sy: 0.02, seed: 212, amp: 30 } });
    DM = { bg };
  }
  A.domeView = (sc = 15.5, ox = 960, oy = 650) => ({ sc, sinE: 0.42, cosE: 0.9, ox, oy });
  A.domePt = (a, view, dr = 0) => [view.ox + Math.cos(a) * (DR + dr) * view.sc, view.oy + Math.sin(a) * (DR + dr) * view.sc * view.sinE];
  A.dome = function (ctx, t, c) {
    if (!DM) buildDome();
    const view = c.view || A.domeView(), R = c.run, S = R.at(c.simT), L = R.p.L;
    if (c.bg !== false) ctx.drawImage(DM.bg.c, 0, 0);
    // the track annulus
    ctx.save(); ctx.translate(view.ox, view.oy); ctx.scale(1, view.sinE);
    ctx.fillStyle = '#5a5262'; ctx.beginPath(); ctx.arc(0, 0, (DR + 4) * view.sc, 0, K.TAU); ctx.arc(0, 0, (DR - 4) * view.sc, 0, K.TAU, true); ctx.fill();
    ctx.strokeStyle = K.rgba('#f1e7cf', 0.8); ctx.lineWidth = 3 / view.sinE * 0.5; ctx.beginPath(); ctx.arc(0, 0, (DR + 3.5) * view.sc, 0, K.TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, (DR - 3.5) * view.sc, 0, K.TAU); ctx.stroke();
    ctx.restore();
    if (c.marks) c.marks(ctx, view, S);
    const cars = []; for (let i = 0; i < R.N; i++) { if (c.hide && c.hide(i)) continue; const a = (S.x[i] % L) / L * K.TAU; cars.push({ i, a, y: Math.sin(a) }); }
    cars.sort((p, q) => p.y - q.y);
    const lit = { rim: '#ffe6b8', ang: -1.6, shade: '#2a1f38', sunAng: -1.6 };
    for (const cr of cars) {
      const pe = E.persona(700 + cr.i), stopped = S.v[cr.i] < 1, isE = cr.i === c.eli;
      const X = Math.cos(cr.a) * DR, Z = Math.sin(cr.a) * DR;
      const extra = c.drop ? c.drop(cr.i) : 0;
      K.car.top(ctx, { sc: view.sc, sinE: view.sinE, cosE: view.cosE, ox: view.ox, oy: view.oy - extra }, X, Z, cr.a + Math.PI / 2, { k: c.k || 1.6, color: isE ? TEAL : pe.color, skin: isE ? '#7a4d32' : pe.skin, hair: pe.hair,
        hairStyle: isE ? 'cap' : pe.hairStyle, capColor: isE ? '#f2c230' : pe.capColor, expr: stopped ? 'annoyed' : 'content', brake: R.brake(cr.i, c.simT), lit });
      if (c.carOver) { const p = A.domePt(cr.a, view); c.carOver(ctx, cr.i, p[0], p[1] - extra, S); }
    }
    // roof light shafts
    K.light.shafts(ctx, { n: 5, angle: 0.25, alpha: 0.06, color: '#fff0c8', y0: 0, y1: K.H, t, seed: 7 });
  };

  // ------------------------------------------------------------------ the night valley (S6 as a ribbon of lights)
  let NV = null;
  function buildNight() {
    const bg = K.canvas(K.W, K.H), c = bg.ctx;
    K.sky.gradient(c, [[0, '#0b1030'], [0.45, '#18214d'], [0.8, '#2c3366'], [1, '#463f6e']], 0, 560);
    K.sky.stars(c, { seed: 31, n: 420, y1: 540, t: 0 });
    K.sky.moon(c, 1560, 150, 46, { glow: '#8ea4ff' });
    K.terrain.ridge(c, { y: 520, amp: 120, freq: 0.0022, seed: 32, bottom: K.H, color: '#283057', rim: '#9fb4ff', rimW: 1.2, rimAlpha: 0.35 });
    K.terrain.ridge(c, { y: 600, amp: 70, freq: 0.004, seed: 33, bottom: K.H, color: '#1c2347' });
    c.fillStyle = '#121834'; c.fillRect(0, 650, K.W, K.H);
    K.light.haze(c, 480, 560, 640, '#4a4a7a', 0.4);
    const r = K.rng(34); for (let k = 0; k < 60; k++) { const x = r() * K.W, y = 600 + r() * 120; c.fillStyle = K.rgba('#ffd28a', 0.6); K.circle(c, x, y, 1.2); c.fill(); }
    NV = { bg };
  }
  // the road through the valley: param u (0 = near the hill, bottom left; 1 = horizon, far right) -> screen point + scale
  const roadPt = u => { const x = K.lerp(-120, 1500, Math.pow(u, 0.8)) + Math.sin(u * 5.5) * 160 * (1 - u), y = K.lerp(1020, 585, Math.pow(u, 0.55)); return [x, y, K.lerp(1.0, 0.12, Math.pow(u, 0.5))]; };
  A.nightRoadPt = roadPt;
  // c: { simT, win: [back0, back1] metres behind the tap shown along the road, farm: bool, chars(ctx), label(ctx, p) }
  A.night = function (ctx, t, c) {
    if (!NV) buildNight();
    const run = A.run('S6'), S = run.atSim(c.simT), L = run.p.L, tapX = run.roles.tapX;
    ctx.drawImage(NV.bg.c, 0, 0);
    // farmhouse on the valley floor, lit, with smoke and a flickering TV
    K.terrain.house(ctx, 1210, 760, 44, { t, lit: 1, color: '#161c3c', roof: '#0f1432', rim: '#9fb4ff', smoke: true });
    // the road
    ctx.strokeStyle = '#0a0e22'; ctx.lineCap = 'round';
    for (let k = 0; k < 60; k++) { const a = roadPt(k / 60), b = roadPt((k + 1) / 60); ctx.lineWidth = 26 * a[2] + 2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    // cars: distance behind the tap point (wrapped) mapped to u (the tap is far: u high; 12 km behind: near)
    const [b0, b1] = c.win || [-1500, 12500];
    const tailA = [], brakeA = [];
    for (let i = 0; i < run.N; i++) {
      let back = tapX - (((S.x[i] % L) + L) % L); while (back < -L / 2) back += L; while (back > L / 2) back -= L;
      if (back < b0 || back > b1) continue;
      const u = 1 - (back - b0) / (b1 - b0), p = roadPt(u), br = run.brakeSim(i, c.simT);
      (br > 0.3 ? brakeA : tailA).push([p[0], p[1], p[2], br]);
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [x, y, s] of tailA) { ctx.fillStyle = K.rgba('#ff5a40', 0.55); K.circle(ctx, x, y, 2.6 * s + 0.6); ctx.fill(); }
    for (const [x, y, s, b] of brakeA) { K.light.glow(ctx, x, y, 22 * s + 5, '#ff2a1a', 0.35 * b, 'lighter'); ctx.fillStyle = K.rgba('#ffb090', 0.9); K.circle(ctx, x, y, 3.4 * s + 0.8); ctx.fill(); }
    ctx.restore();
    if (c.label) c.label(ctx, roadPt, b0, b1, S);
    // the hill in the foreground with Eli and Mila
    const hill = { x0: -40, x1: 2000, y: 980, amp: 90, freq: 0.0016, seed: 3, bottom: K.H + 10, peaks: x => 160 * Math.exp(-Math.pow((x - 330) / 420, 2)) - Math.max(0, x - 800) * 0.5 };
    ctx.fillStyle = '#0a0f22'; K.terrain.ridgePath(ctx, hill); ctx.fill();
    const hillY = x => hill.y - (K.fbm(x * hill.freq, 0.5, 4, hill.seed) - 0.35) * hill.amp - hill.peaks(x);
    const rr = K.rng(9); for (let x = 0; x < 1300; x += 8) K.terrain.tuft(ctx, x + rr() * 5, hillY(x) + 5, 16 + rr() * 22, '#0a0f22', { seed: rr() * 1e6 | 0, n: 4, wind: Math.sin(t * 1.2 + x * 0.01) * 0.25, rim: rr() < 0.3 ? '#5a6cb0' : null });
    if (c.chars) c.chars(ctx, hillY);
    K.terrain.fireflies(ctx, t, { n: 40, seed: 62, x0: 0, x1: 1300, y0: 700, y1: 1060, size: 1.7 });
    K.light.grade(ctx, '#3a4aa0', 0.25, 'soft-light');
    return { roadPt, hillY };
  };

  // ------------------------------------------------------------------ the farmhouse window: the driver at dinner, TV flicker
  A.window = function (ctx, t, c) {
    ctx.fillStyle = '#121834'; ctx.fillRect(0, 0, K.W, K.H);
    // wall + window frame
    ctx.fillStyle = '#1c2348'; ctx.fillRect(0, 0, K.W, K.H);
    const wx = 360, wy = 140, ww = 1200, wh = 760;
    const inside = ctx.createLinearGradient(0, wy, 0, wy + wh); inside.addColorStop(0, '#ffcf8a'); inside.addColorStop(1, '#e39a5a'); ctx.fillStyle = inside; ctx.fillRect(wx, wy, ww, wh);
    const tv = 0.6 + 0.4 * Math.abs(Math.sin(t * 7.3) * Math.sin(t * 3.1));
    K.light.glow(ctx, wx + ww - 200, wy + 300, 500, '#9fd0ff', 0.35 * tv, 'screen');
    // TV on a cabinet (right), wallpaper stripes, a lamp
    ctx.fillStyle = K.rgba('#c98a5a', 0.4); for (let x = wx; x < wx + ww; x += 60) ctx.fillRect(x, wy, 24, wh);
    ctx.fillStyle = '#5a3a2a'; ctx.fillRect(wx + ww - 330, wy + 420, 260, 200); ctx.fillStyle = '#2a2230'; K.rrect(ctx, wx + ww - 310, wy + 240, 220, 170, 18); ctx.fill();
    ctx.fillStyle = K.mix('#7fb0e0', '#e0f0ff', tv); K.rrect(ctx, wx + ww - 295, wy + 255, 190, 140, 12); ctx.fill();
    // table and the driver (a generic round-headed extra) eating, happy
    const fork = c.fork || 0, R = 120, px = wx + 520, py = wy + 560;
    K.char.person(ctx, px, py + 160, R, { t, seed: 77, skin: '#e3a983', hair: '#4a2f22', hairStyle: 'short', shirt: '#c7a6c9', pose: 'stand', expr: fork > 0.6 ? 'delighted' : 'content', look: [0.5, 0.2], light: { ang: -0.6, rim: '#ffe0a0', shade: '#7a4a3a' } });
    ctx.fillStyle = '#8a5a3a'; K.rrect(ctx, wx + 280, py + 40, 560, 34, 8); ctx.fill(); ctx.fillRect(wx + 320, py + 74, 20, 200); ctx.fillRect(wx + 780, py + 74, 20, 200);
    ctx.fillStyle = '#f6efe2'; K.ellipse(ctx, px + 40, py + 36, 90, 20); ctx.fill(); ctx.fillStyle = '#e2b04a'; K.ellipse(ctx, px + 40, py + 30, 50, 12); ctx.fill();
    // the fork to the mouth
    const hx = K.lerp(px + 100, px + 26, fork), hy = K.lerp(py + 20, py - R * 1.35, fork);
    ctx.strokeStyle = '#c9ccd4'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hx + 40, hy + 30); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = '#e3a983'; ctx.strokeStyle = INK; ctx.lineWidth = 5; K.circle(ctx, hx + 44, hy + 34, 16); ctx.fill(); ctx.stroke();
    // window frame (dark wood) + cross bars, curtain
    ctx.strokeStyle = '#0f1432'; ctx.lineWidth = 40; ctx.strokeRect(wx, wy, ww, wh); ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh * 0.45); ctx.lineTo(wx + ww, wy + wh * 0.45); ctx.stroke();
    ctx.fillStyle = K.rgba('#c94a5a', 0.85); ctx.beginPath(); ctx.moveTo(wx + 20, wy + 20); ctx.quadraticCurveTo(wx + 120, wy + 300, wx + 60, wy + wh - 20); ctx.lineTo(wx + 20, wy + wh - 20); ctx.closePath(); ctx.fill();
    // moonlit wall rim + night glass reflection
    ctx.fillStyle = K.rgba('#cfe0ff', 0.06); ctx.fillRect(wx, wy, ww, wh);
    K.terrain.fireflies(ctx, t, { n: 16, seed: 64, x0: 0, x1: K.W, y0: 700, y1: 1080, size: 2.2 });
    K.light.grade(ctx, '#3a4aa0', 0.15, 'soft-light');
  };
})(typeof window !== 'undefined' ? window : globalThis);
