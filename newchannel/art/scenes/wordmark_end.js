/* Ep 001 · the wordmark in the illustrated world: dusk over the valley, letters of cream paper lit by the last sun.
   v3 (no mascot): Pixie stands on the M of "Mil" holding the brand dot (a flat vermilion disc); she lifts it, tosses it,
   and it lands as the dot of the i with a squash and a hop. Quest, standing on the l, flinches when it lands next to
   him, then laughs. 2.0 s of acting (0.6 -> 2.6 s). Contact times are exported for the sound bed (sting on the toss,
   the touch and the settle). The vermilion of the dot is the brand accent's only home in the illustrated world. */
(function (root) {
  const K = root.K, E = K.ep1;
  const SIZE = 140, BASE_Y = 540;
  E.WM = { drop: 0.6, c1: 1.0, c2: 1.42, land: 1.72, tagline: 2.2 };
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
    ctx.font = `800 ${SIZE}px ${K.type.FONT}`; const ascL = ctx.measureText('l').actualBoundingBoxAscent;
    const baked = K.type.bake(ctx, lay, { color: '#f6ecd8', glow: '#ffb27a', glowAlpha: 0.32, shadow: '#160b22', shadowAlpha: 0.85, outline: '#2a1838', outlineAlpha: 0.35, outlineW: SIZE * 0.035,
      rim: '#ffe6b0', rimAlpha: 0.95, rimW: 0.022 });
    const clouds = [[230, 150, 560, 104, 1, 5], [1500, 110, 640, 112, 2, 4], [980, 245, 440, 72, 3, 6], [1780, 300, 320, 56, 4, 7], [120, 330, 280, 46, 5, 6]].map(([x, y, w, h, seed, v]) => ({ x, y, w, h, v,
      o: { seed: 70 + seed, ang: K.sky.angTo(x, y, 960, HZ + 40), color: '#4e3f74', shade: '#34295a', lit: '#c66f84', rim: '#ffb98a', underLit: '#ff9a7a', litOff: 3.4, litScale: 0.72, rimW: 0.05 } }));
    const shadowDot = K.canvas(160, 160); shadowDot.ctx.filter = `blur(${SIZE * 0.025}px)`; shadowDot.ctx.fillStyle = K.rgba('#2a1838', 0.45); K.circle(shadowDot.ctx, 80, 80, 50); shadowDot.ctx.fill();
    return { bg, lay, HZ, baked, clouds, shadowDot, ascL };
  }

  // the brand dot's path (layout coordinates). held by Pixie -> lifted -> tossed -> touch + hop -> settles on the i
  function dotPose(lay, tl, hands) {
    const W = E.WM, tM = lay.tittles[1], R = tM.r * 0.8;
    if (tl < W.c1) return { held: true, R, sx: 1, sy: 1 };
    const arc = (a, b, u, h) => ({ x: K.lerp(a.x, b.x, u), y: K.lerp(a.y, b.y, u) - h * 4 * u * (1 - u) });
    let p, sx = 1, sy = 1;
    if (tl < W.c2) { const u = K.inv(W.c1, W.c2, tl); p = arc(hands, { x: tM.x, y: tM.y }, u, 150); const st = Math.sin(u * Math.PI) * 0.1; sx = 1 - st; sy = 1 + st; }
    else if (tl < W.land) { const u = K.inv(W.c2, W.land, tl); p = { x: tM.x, y: tM.y - 26 * 4 * u * (1 - u) }; const k = Math.exp(-u * 9); sx = 1 + 0.3 * k; sy = 1 - 0.3 * k; }
    else { const u = tl - W.land, k = Math.exp(-u * 7) * Math.cos(u * 22); p = { x: tM.x, y: tM.y }; sx = 1 + 0.16 * k; sy = 1 - 0.16 * k; }
    return { x: p.x, y: p.y, R, sx, sy };
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
    const per = k => { const u = K.ease.outBack(K.clamp((tl - 0.05 - k * 0.035) / 0.5)); return { dy: (1 - u) * 60, a: K.clamp((tl - 0.05 - k * 0.035) / 0.3) }; };
    K.type.drawBaked(ctx, lay, Bw.baked, x0, y0, { perGlyph: per });
    // plain tittle of "Diez"
    const t1 = lay.tittles[0], a1 = per(t1.k).a;
    if (a1 > 0) { ctx.save(); ctx.globalAlpha = a1; K.type.dot(ctx, lay, t1, x0, y0 + per(t1.k).dy, { color: '#f6ecd8', shadow: '#2a1838', squash: 0 }); ctx.restore(); }
    // Quest (on the l) and Pixie (on the M) ride up with their letters
    const W = E.WM, HL = Object.assign({}, K.hero.LIGHT.dusk, { ang: -1.25, rim: '#ffd9a0', rimW: 0.06 }), u = 31;
    const gM = lay.glyphs[4], gL = lay.glyphs[6], pM = per(4), pL = per(6);
    const px = x0 + gM.x + lay.adv * 0.5, py = y0 - lay.cap + pM.dy, qx = x0 + gL.x + lay.adv * 0.48, qy = y0 - Bw.ascL + pL.dy;
    const PC = K.hero.CHARS.pixie, ramp = (a, d) => K.ease.sine(K.clamp((tl - a) / d));
    // Pixie: hold at the chest -> lift overhead (0.6-0.95) -> toss toward the i (1.0) -> follow-through -> happy
    const lift = ramp(W.drop, 0.35) * (1 - ramp(W.c1 - 0.02, 0.12)), toss = ramp(W.c1 - 0.04, 0.12) * (1 - ramp(W.c1 + 0.45, 0.3));
    const hold = [[-0.16, PC.chest - 0.25, PC.depth + 0.55], [0.16, PC.chest - 0.25, PC.depth + 0.55]];
    const up = [[-0.2, PC.skull + 0.25, 0.25], [0.2, PC.skull + 0.25, 0.25]], fw = [[0.9, PC.shJ + 1.0, 0.9], [1.3, PC.shJ + 1.1, 0.6]];
    const rest = [[-0.62, PC.hem + 0.2, 0.1], [0.62, PC.hem + 0.2, 0.1]];
    const done = ramp(W.c1 + 0.55, 0.35);
    const tg = j => hold[j].map((h, i) => { let v2 = K.lerp(h, up[j][i], lift); v2 = K.lerp(v2, fw[j][i], toss); return K.lerp(v2, rest[j][i], done); });
    const pa = Math.min(pM.a, 1);
    if (pa > 0) {
      ctx.save(); ctx.globalAlpha = pa;
      const pi = K.hero.draw(ctx, 'pixie', px, py, u, { pose: 'stand', t: tl, yaw: 0.35, light: HL, contact: 0.25, seed: 2,
        expr: tl < W.c1 ? 'happy' : tl < W.land + 0.1 ? 'surprised' : 'smug', look: tl > W.c1 - 0.1 && tl < W.land + 0.4 ? [0.8, 0.2] : [0.6, 0],
        armL: { ik: tg(0), pole: [-1, -1, 0], hand: 'open' }, armR: { ik: tg(1), pole: [1, -1, 0], hand: done > 0.5 ? 'fist' : 'open' } });
      Bw.hands = pi ? { x: (pi.hands.L[0] + pi.hands.R[0]) / 2 - x0, y: (pi.hands.L[1] + pi.hands.R[1]) / 2 - y0 - 6 - lift * lay.tittles[1].r * 0.75 } : Bw.hands;
      ctx.restore();
    }
    // Quest: watches Pixie, flinches when the dot lands beside him, then laughs
    const qa = Math.min(pL.a, 1);
    if (qa > 0) {
      const fl = ramp(W.c2, 0.1) * (1 - ramp(W.c2 + 0.45, 0.25));
      ctx.save(); ctx.globalAlpha = qa;
      K.hero.draw(ctx, 'quest', qx, qy, u, { pose: tl < W.c2 + 0.5 ? 'stand' : 'laugh', blend: tl < W.c2 + 0.5 ? { pose: 'surprised', k: fl } : null, t: tl, yaw: -0.4, light: HL, contact: 0.25, seed: 1,
        lean: fl * 0.12, expr: tl < W.c2 ? 'neutral' : tl < W.c2 + 0.5 ? 'surprised' : 'laughing', look: tl < W.c2 ? [-0.6, 0.1] : [-0.7, 0.3],
        extras: tl > W.c2 && tl < W.c2 + 0.45 ? ['ticks'] : [] });
      ctx.restore();
    }
    // the brand dot: a flat vermilion disc (no face), lit like the letters; its shadow on the i
    const P = E.PAL.golden, hands = Bw.hands || { x: gM.x + lay.adv * 0.5, y: -lay.cap - 60 };
    const dp = dotPose(lay, tl, hands);
    if (pa > 0) {
      const dx = dp.held ? x0 + hands.x : x0 + dp.x, dy = dp.held ? y0 + hands.y : y0 + dp.y, R = dp.R * (dp.held ? 0.8 : 1);
      if (!dp.held && tl > W.c2 - 0.12) { const k = R / 50 * K.clamp((tl - W.c2 + 0.12) / 0.12); ctx.drawImage(Bw.shadowDot.c, x0 + lay.tittles[1].x + SIZE * 0.012 - 80 * k, y0 + lay.tittles[1].y + SIZE * 0.035 - 80 * k, 160 * k, 160 * k); }
      if (tl > W.land) K.light.glow(ctx, dx, dy, R * 4, '#ffcf8a', 0.25 * K.clamp((tl - W.land) * 2), 'screen');
      ctx.save(); ctx.globalAlpha = pa; ctx.translate(dx, dy + (dp.held ? 0 : R * (1 - dp.sy))); ctx.scale(dp.sx, dp.sy);
      ctx.fillStyle = K.VERMILION; K.circle(ctx, 0, 0, R); ctx.fill(); K.circle(ctx, 0, 0, R); K.tex.fillPath(ctx, 0.22, 0.5);
      K.char.discLight(ctx, 0, 0, R, { ang: -1.4, rim: P.rim, rimW: 0.1, rimAlpha: 0.9, shade: '#5a1f2c', shadeAlpha: 0.25 });
      ctx.restore();
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
