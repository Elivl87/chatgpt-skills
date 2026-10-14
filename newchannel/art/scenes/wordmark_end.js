/* Ep 001 · the wordmark in the illustrated world: dusk over the valley, letters of cream paper lit by the last sun,
   the mascot drops in, steps on the plain dot of "Diez", hops off the M and lands as the dot on the i of "Mil".
   Local time tl = 0 at the cut. Contact times are exported for the sound bed (sting on the three contacts). */
(function (root) {
  const K = root.K, E = K.ep1;
  const SIZE = 140, BASE_Y = 540;
  E.WM = { drop: 0.45, c1: 1.05, c2: 1.42, land: 1.82, tagline: 2.2 };
  let Bw = null;

  function build(ctx) {
    const P = E.PAL.golden, bg = K.canvas(K.W, K.H), c = bg.ctx, HZ = 760;
    // v2: the band behind the letters stays a deep dusk violet (cream type reads at > 4:1 there); the warm light is kept
    // under y ~ 600, behind the hills
    K.sky.gradient(c, [[0, '#211f4a'], [0.38, '#3b2f66'], [0.6, '#5a3f72'], [0.78, '#a35f7c'], [0.9, '#ef926f'], [1, '#ffcb8e']], 0, HZ);
    K.sky.wash(c, 960, HZ, 760, '#ffcf8a', 0.62);
    K.terrain.ridge(c, { y: HZ - 30, amp: 170, freq: 0.0024, seed: 81, bottom: K.H, color: K.mix('#7a5280', '#ffcf9a', 0.2), rim: '#ffd9a0', rimW: 1.5, rimAlpha: 0.6,
      peaks: x => 120 * Math.exp(-Math.pow((x - 320) / 240, 2)) + 90 * Math.exp(-Math.pow((x - 1640) / 280, 2)) - 40 * Math.exp(-Math.pow((x - 960) / 300, 2)) });
    K.terrain.ridge(c, { y: HZ + 30, amp: 90, freq: 0.004, seed: 82, bottom: K.H, color: K.mix('#5d4470', '#ffcf9a', 0.25), rim: '#ffd9a0', rimW: 1.2, rimAlpha: 0.5 });
    K.light.haze(c, HZ - 120, HZ + 10, HZ + 90, '#ffcf9a', 0.5);
    K.terrain.ridge(c, { y: HZ + 120, amp: 60, freq: 0.006, seed: 83, bottom: K.H, color: '#3d2c55', rim: '#ffb98a', rimW: 1.2, rimAlpha: 0.45 });
    // tree line on the near ridge
    const r = K.rng(84);
    for (let x = -20; x < K.W + 20; x += 14 + r() * 26) {
      const y = HZ + 120 - (K.fbm(x * 0.006, 0.5, 4, 83) - 0.35) * 60;
      K.terrain.tree(c, x, y + 6, 40 + r() * 50, { kind: r() < 0.4 ? 'poplar' : 'round', seed: r() * 1e6 | 0, color: '#3a2a50', shade: '#2a1e3e', trunk: '#2a1e3e', light: { dx: 0, back: 0.8, rim: '#ffb98a' } });
    }
    K.terrain.ridge(c, { y: HZ + 250, amp: 50, freq: 0.003, seed: 85, bottom: K.H, color: '#261c3a' });
    K.tex.paint(bg, { amount: 0.4, mottle: { w: 1200, h: 680, sx: 0.0035, sy: 0.025, seed: 86, amp: 40 } });
    const lay = K.type.layout(ctx, 'Diez Mil Puntos', SIZE);
    const baked = K.type.bake(ctx, lay, { color: '#f6ecd8', glow: '#ffb27a', glowAlpha: 0.32, shadow: '#160b22', shadowAlpha: 0.85, outline: '#2a1838', outlineAlpha: 0.35, outlineW: SIZE * 0.035,
      rim: '#ffe6b0', rimAlpha: 0.95, rimW: 0.022 });
    const clouds = [[230, 150, 560, 104, 1, 5], [1500, 110, 640, 112, 2, 4], [980, 245, 440, 72, 3, 6], [1780, 300, 320, 56, 4, 7], [120, 330, 280, 46, 5, 6]].map(([x, y, w, h, seed, v]) => ({ x, y, w, h, v,
      o: { seed: 70 + seed, ang: K.sky.angTo(x, y, 960, HZ + 40), color: '#4e3f74', shade: '#34295a', lit: '#c66f84', rim: '#ffb98a', underLit: '#ff9a7a', litOff: 3.4, litScale: 0.72, rimW: 0.05 } }));
    const shadowDot = K.canvas(160, 160); shadowDot.ctx.filter = `blur(${SIZE * 0.025}px)`; shadowDot.ctx.fillStyle = K.rgba('#2a1838', 0.45); K.circle(shadowDot.ctx, 80, 80, 50); shadowDot.ctx.fill();
    return { bg, lay, HZ, baked, clouds, shadowDot };
  }

  // the mascot's path in layout coordinates
  function mascotPose(lay, tl) {
    const W = E.WM, t1 = lay.tittles[0], tM = lay.tittles[1], mTop = { x: lay.glyphs[4].x + lay.adv * 0.5, y: -lay.cap };
    const R = tM.r, dotTop = { x: t1.x, y: t1.y - t1.r - R }, mPeak = { x: mTop.x, y: mTop.y - R };
    const arc = (a, b, u, h) => ({ x: K.lerp(a.x, b.x, u), y: K.lerp(a.y, b.y, u) - h * 4 * u * (1 - u) });
    let p, sx = 1, sy = 1, expr = 'surprised', squashDot = 0;
    if (tl < W.drop) return null;
    if (tl < W.c1) { const u = K.inv(W.drop, W.c1, tl), e = u * u; p = { x: dotTop.x, y: K.lerp(-700, dotTop.y, e) }; sx = 0.86; sy = 1.16; expr = 'surprised'; }
    else if (tl < W.c2) { const u = K.inv(W.c1, W.c2, tl); p = arc(dotTop, mPeak, u, 80); expr = 'worried'; const k = Math.exp(-u * 10); sx = 1 + 0.25 * k; sy = 1 - 0.25 * k; squashDot = k; }
    else if (tl < W.land) { const u = K.inv(W.c2, W.land, tl); p = arc(mPeak, { x: tM.x, y: tM.y }, u, 70); expr = 'laughing'; const k = Math.exp(-u * 10); sx = 1 + 0.22 * k; sy = 1 - 0.22 * k; }
    else { const u = tl - W.land; p = { x: tM.x, y: tM.y + Math.sin(u * 18) * 6 * Math.exp(-u * 6) }; const k = Math.exp(-u * 7) * Math.cos(u * 22); sx = 1 + 0.18 * k; sy = 1 - 0.18 * k;
      expr = u < 0.5 ? 'delighted' : (u > 1.5 && u < 2.1 ? 'wink' : 'content'); }
    return { x: p.x, y: p.y, R, sx, sy, expr, squashDot };
  }

  E.drawWordmark = function (ctx, tl, frame) {
    if (!Bw) Bw = build(ctx);
    const lay = Bw.lay, x0 = (K.W - lay.width) / 2, y0 = BASE_Y;
    const z = 1.0 + 0.04 * K.ease.sine(K.clamp(tl / 5.5));
    ctx.save(); ctx.translate(K.W / 2, K.H / 2); ctx.scale(z, z); ctx.translate(-K.W / 2, -K.H / 2);
    ctx.drawImage(Bw.bg.c, 0, 0);
    K.sky.drawClouds(ctx, Bw.clouds, tl);
    // valley highway far below: thin road with flowing tail lights (a callback to the wave)
    ctx.strokeStyle = K.rgba('#2a1e3e', 0.9); ctx.lineWidth = 6; ctx.beginPath();
    const roadPt = u => [K.lerp(-50, K.W + 50, u), Bw.HZ + 205 + Math.sin(u * 5 + 0.5) * 28 + u * 30];
    for (let u = 0; u <= 1.001; u += 0.02) { const [x, y] = roadPt(u); u ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    for (let i = 0; i < 46; i++) { const u = ((i / 46 + tl * 0.018) % 1), [x, y] = roadPt(u), red = i % 3 !== 0;
      const bunch = 0.5 + 0.5 * Math.sin(u * 18 - tl * 1.5); ctx.fillStyle = red ? K.rgba('#ff4a36', 0.6 + 0.4 * bunch) : K.rgba('#fff1c8', 0.8);
      K.circle(ctx, x, y - 2, 2.2); ctx.fill(); K.light.glow(ctx, x, y - 2, 10, red ? '#ff3a28' : '#fff1c8', 0.35, 'screen'); }
    // sun just under the horizon -> rays fanning up behind the letters
    K.light.rays(ctx, 960, Bw.HZ + 20, { n: 14, spread: 2.6, angle: -Math.PI / 2, len: 1200, width: 0.045, alpha: 0.09, color: '#ffd9a0', t: tl, seed: 12 });
    const pose = mascotPose(lay, tl);
    const per = k => { const u = K.ease.outBack(K.clamp((tl - 0.05 - k * 0.035) / 0.5)); return { dy: (1 - u) * 60, a: K.clamp((tl - 0.05 - k * 0.035) / 0.3) }; };
    K.type.drawBaked(ctx, lay, Bw.baked, x0, y0, { perGlyph: per });
    // plain tittle of "Diez" (squashes when stepped on)
    const t1 = lay.tittles[0], a1 = per(t1.k).a;
    if (a1 > 0) { ctx.save(); ctx.globalAlpha = a1; K.type.dot(ctx, lay, t1, x0, y0 + per(t1.k).dy, { color: '#f6ecd8', shadow: '#2a1838', squash: pose ? pose.squashDot * 0.6 : 0 }); ctx.restore(); }
    // the mascot
    if (pose) {
      const P = E.PAL.golden;
      if (tl > E.WM.land) K.light.glow(ctx, x0 + pose.x, y0 + pose.y, pose.R * 4, '#ffcf8a', 0.25 * K.clamp((tl - E.WM.land) * 2), 'screen');
      { const k = pose.R / 50; ctx.drawImage(Bw.shadowDot.c, x0 + pose.x + SIZE * 0.012 - 80 * k, y0 + pose.y + SIZE * 0.035 - 80 * k, 160 * k, 160 * k); }
      K.char.mascot(ctx, x0 + pose.x, y0 + pose.y, pose.R, { expr: pose.expr, sx: pose.sx, sy: pose.sy, rim: P.rim, lightAng: Math.PI / 2 + 0.3, rimW: 0.1, shadeAlpha: 0.22,
        blink: pose.expr === 'content' && ((tl - E.WM.land) % 2.3) > 2.15 ? 1 : 0 });
    }
    // tagline
    const ta = K.clamp((tl - E.WM.tagline) / 0.6);
    if (ta > 0) {
      { // a soft dusk-violet shadow pool behind the tagline so cream type keeps contrast over the warm hills
        const gx = K.W / 2, gy = y0 + 84; ctx.save(); ctx.globalAlpha = ta; ctx.translate(gx, gy); ctx.scale(1, 0.16);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 520); g.addColorStop(0, K.rgba('#2a1838', 0.5)); g.addColorStop(0.7, K.rgba('#2a1838', 0.28)); g.addColorStop(1, K.rgba('#2a1838', 0));
        ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(-520, -520, 1040, 1040); ctx.restore(); }
      ctx.save(); ctx.globalAlpha = ta; ctx.font = '500 36px "Space Grotesk"'; ctx.textAlign = 'center'; ctx.fillStyle = K.rgba('#1a0c26', 0.75);
      ctx.fillText('Pequeños sistemas, explicados con puntos.', K.W / 2 + 2, y0 + 96 + (1 - ta) * 12 + 3);
      ctx.fillStyle = '#fbe9cf'; ctx.fillText('Pequeños sistemas, explicados con puntos.', K.W / 2, y0 + 96 + (1 - ta) * 12); ctx.restore();
    }
    ctx.restore();
    K.particles.motes(ctx, tl, { n: 40, seed: 91, color: '#ffe6b0', alpha: 0.5, size: 2.2, vx: 5, vy: -6 });
    K.light.grade(ctx, '#ff9a5a', 0.15, 'soft-light');
  };

  K.scene('wordmark_end', {
    setup(ctx) { Bw = build(ctx); },
    draw(ctx, t, frame) { E.drawWordmark(ctx, t, frame); },
    events() { return E.WM; },
    post: { grain: 0.13, vignette: 0.5, vignetteColor: '#1a0f26', bloom: 0.3 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
