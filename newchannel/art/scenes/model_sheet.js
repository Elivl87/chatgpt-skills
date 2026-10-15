/* Eli + Mila · final model sheet (2026-10-15, Alt 1 "Taller").  ?scene=model_sheet&W=2600&H=1700
   Turnaround (front / 3/4 / side / back), height line-up with a round-headed extra, swatches, poses, key expressions,
   talk mouths + blink, and the teal car both ways (Eli driving, Mila driving). */
(function (root) {
  const K = root.K, C = K.cast;
  const INK = '#24161a', E_ = 'eli1', M_ = 'mila1', SIG = { eli1: '#c99412', mila1: '#6a4fb3' };
  let BG = null;
  function bg() { if (BG) return BG; BG = K.canvas(K.W, K.H); const c = BG.ctx; K.sky.gradient(c, [[0, '#f7e9d4'], [0.55, '#f2dcc2'], [1, '#e9cbb2']], 0, K.H); K.sky.wash(c, K.W * 0.75, 30, 1300, '#ffd9a0', 0.3);
    K.tex.paint(BG, { amount: 0.3, mottle: { w: 1300, h: 850, sx: 0.003, sy: 0.02, seed: 7, amp: 24 } }); return BG; }
  function panel(ctx, x, y, w, h, lab) { ctx.save(); ctx.fillStyle = 'rgba(255,248,236,0.55)'; K.rrect(ctx, x, y, w, h, 18); ctx.fill(); ctx.strokeStyle = 'rgba(80,50,60,0.18)'; ctx.lineWidth = 1.5; ctx.stroke();
    if (lab) { ctx.font = '600 17px "Martian Mono"'; ctx.fillStyle = 'rgba(60,36,48,0.78)'; ctx.textBaseline = 'top'; ctx.fillText(lab.toUpperCase(), x + 18, y + 14); } ctx.restore(); }
  const label = (ctx, t, x, y, f = '600 15px "Martian Mono"', col = 'rgba(60,36,48,0.8)', al = 'center') => { ctx.save(); ctx.font = f; ctx.fillStyle = col; ctx.textAlign = al; ctx.fillText(t, x, y); ctx.restore(); };
  function ground(ctx, x0, x1, y) { const g = ctx.createLinearGradient(0, y - 6, 0, y + 30); g.addColorStop(0, 'rgba(160,110,100,0)'); g.addColorStop(0.2, 'rgba(160,110,100,0.18)'); g.addColorStop(1, 'rgba(160,110,100,0)'); ctx.fillStyle = g; ctx.fillRect(x0, y - 6, x1 - x0, 36); }
  const hs = v => v.toFixed(2).replace('.', ',');
  const L = () => C.LIGHT.board;
  function car(ctx, cx, gy, SC, driver, passenger, t, dO, pO) {
    ctx.fillStyle = 'rgba(70,40,60,0.18)'; K.ellipse(ctx, cx, gy + 2, 1.9 * SC, 0.09 * SC); ctx.fill();
    K.car.side(ctx, cx, gy, SC, { color: K.TEAL, lit: { rim: '#fff1d2', shade: '#4a3560', dx: 1 }, brake: 0, wheel: 0.5,
      drawDriver: (sx, sy) => C.crew2(ctx, sx, sy, SC, { driver, passenger, t, light: L(), u: 2.7 * SC, driverO: dO, passengerO: pO }) });
  }
  K.scene('model_sheet', {
    draw(ctx, t) {
      ctx.drawImage(bg().c, 0, 0);
      label(ctx, 'Eli + Mila · hoja de modelo final', 24, 56, '700 44px "Space Grotesk"', INK, 'left');
      label(ctx, 'DIEZ MIL PUNTOS · Alt 1 «Taller» · 2026-10-15 · dibujado 100 % en código (Canvas 2D) · ids: eli1 (alias eli), mila1', K.W - 24, 50, '500 17px "Martian Mono"', 'rgba(60,36,48,0.7)', 'right');
      // 1 · turnaround
      panel(ctx, 16, 84, 1720, 600, 'giro · frente / 3/4 / perfil / espalda');
      const gy = 640, u = 470 / 1.12; ground(ctx, 30, 1720, gy);
      [E_, M_].forEach((id, k) => { const x0 = 140 + k * 850;
        ['front', 'q', 'side', 'back'].forEach((v, j) => C.draw(ctx, id, x0 + j * 190, gy, u, { view: v, t: t + j * 0.4, light: L(), shadow: 0.28 }));
        label(ctx, `${C.SPECS[id].name} · ${hs(C.SPECS[id].h)}`, x0 + 285, 672, '700 24px "Space Grotesk"', SIG[id]); });
      // 2 · heights + swatches
      panel(ctx, 1752, 84, 832, 600, 'estatura + colores');
      { const gy2 = 470, u2 = 300; ground(ctx, 1770, 2570, gy2);
        ctx.save(); ctx.strokeStyle = 'rgba(80,50,60,0.3)'; ctx.setLineDash([6, 6]); for (const m of [0.5, 1]) { ctx.beginPath(); ctx.moveTo(1800, gy2 - m * u2); ctx.lineTo(2570, gy2 - m * u2); ctx.stroke(); label(ctx, hs(m), 1790, gy2 - m * u2 + 5, '500 13px "Martian Mono"', 'rgba(60,36,48,0.6)', 'right'); } ctx.restore();
        C.draw(ctx, E_, 1930, gy2, u2, { t, light: L(), shadow: 0.25 }); C.draw(ctx, M_, 2140, gy2, u2, { t, light: L(), shadow: 0.25 });
        K.char.person(ctx, 2380, gy2, u2 / 4.1, { t, skin: '#c98a64', hair: '#3a2a22', hairStyle: 'short', shirt: '#8aa0b8', pants: '#4a5266', light: { ang: -0.75, rim: '#fff1d2', shade: '#4a3560' } });
        label(ctx, 'Eli 0,95', 1930, gy2 - 0.95 * u2 - 22, '700 18px "Martian Mono"', SIG.eli1); label(ctx, 'Mila 1,08', 2140, gy2 - 1.08 * u2 - 26, '700 18px "Martian Mono"', SIG.mila1); label(ctx, 'extra 1,00', 2380, gy2 + 30, '600 15px "Martian Mono"', 'rgba(60,36,48,0.6)');
        const sw = [['#f2c230', 'gorro'], ['#f1ede2', 'playera'], ['#a4713d', 'delantal'], ['#3f5f96', 'jeans'], ['#7a4d32', 'piel Eli'], ['#2b2729', 'botas'],
          ['#7158b8', 'suéter'], ['#c99633', 'overol'], ['#2f6b45', 'botas'], ['#d9a66c', 'piel Mila'], ['#2e1d22', 'pelo'], ['#f0c24a', 'aretes']];
        sw.forEach(([c, n], k) => { const x = 1810 + (k % 6) * 128, y = 548 + ((k / 6) | 0) * 66; ctx.fillStyle = c; ctx.strokeStyle = 'rgba(40,24,32,0.55)'; ctx.lineWidth = 2; K.circle(ctx, x, y, 15); ctx.fill(); ctx.stroke();
          label(ctx, n, x + 22, y - 2, '600 13px "Martian Mono"', 'rgba(60,36,48,0.85)', 'left'); label(ctx, c, x + 22, y + 14, '500 12px "Martian Mono"', 'rgba(60,36,48,0.6)', 'left'); }); }
      // 3 · poses
      panel(ctx, 16, 700, 2568, 430, 'poses');
      { const gy3 = 1085, u3 = 300 / 1.12; ground(ctx, 30, 2570, gy3);
        const P = [[E_, 'walk', 'q', 'happy', 'camina'], [M_, 'walk', 'q', 'neutral', 'camina'], [E_, 'point', 'q', 'determined', 'señala'], [M_, 'point', 'q', 'curious', 'señala'], [E_, 'shrug', 'front', 'annoyed', 'hombros'],
          [M_, 'shrug', 'front', 'smug', 'hombros'], [E_, 'wave', 'front', 'happy', 'saluda'], [M_, 'crossed', 'front', 'smug', 'brazos cruzados'], [E_, 'hips', 'q', 'grumpy', 'manos en cintura'], [M_, 'think', 'q', 'thinking', 'piensa'],
          [E_, 'cheer', 'front', 'laugh', 'festeja'], [M_, 'clipboard', 'q', 'curious', 'tablilla'], [E_, 'detective', 'q', 'curious', 'detective'], [M_, 'sitPoint', 'backq', 'neutral', 'sentada (espalda)'], [E_, 'sit', 'q', 'happy', 'sentado']];
        P.forEach(([id, pose, v, ex, nm], k) => { const x = 105 + k * 168, sit = pose.startsWith('sit');
          C.draw(ctx, id, x, sit ? gy3 - 0.03 * u3 : gy3, u3, { view: v, pose, expr: ex, t: t + k * 0.21, light: L(), shadow: sit ? 0 : 0.25, seated: sit, legs: sit, sitGround: sit });
          label(ctx, nm, x, 1118, '600 13px "Martian Mono"'); }); }
      // 4 · expressions (front busts)
      panel(ctx, 16, 1146, 1300, 540, 'emociones clave (la hoja completa: emotion_sheet.png)');
      { const ex = ['neutral', 'happy', 'laugh', 'surprised', 'curious', 'smug', 'worried', 'furious'];
        [E_, M_].forEach((id, r) => { const S = C.SPECS[id], top = S.head.cy + S.head.hh + (id === E_ ? 0.08 : 0.05), span = top - (S.shoulder - 0.05), uu = 215 / span;
          ex.forEach((e, k) => { const x0 = 30 + k * 160, y0 = 1186 + r * 246; ctx.save(); K.rrect(ctx, x0, y0, 152, 236, 12); ctx.fillStyle = 'rgba(255,252,246,0.6)'; ctx.fill(); ctx.clip();
            C.draw(ctx, id, x0 + 76, y0 + 8 + top * uu, uu, { view: 'q', dir: k % 2 ? -1 : 1, expr: e, pose: 'stand', t, light: L() }); ctx.restore(); if (r === 1) label(ctx, C.EMOTIONS_ES[e], x0 + 76, 1680, '600 13px "Martian Mono"'); }); }); }
      // 5 · talk + blink
      panel(ctx, 1332, 1146, 520, 540, 'boca al hablar + parpadeo');
      { const items = [['talk', 0, 'M'], ['talk', 0.35, 'E'], ['talk', 0.7, 'A'], ['talk', 1, 'O'], ['blink', 1, 'parpadeo']];
        [E_, M_].forEach((id, r) => { const S = C.SPECS[id], top = S.head.cy + S.head.hh + 0.05, span = S.head.hh * 2 + 0.1, uu = 200 / span;
          items.forEach(([kind, v, nm], k) => { const x0 = 1346 + k * 100, y0 = 1186 + r * 246; ctx.save(); K.rrect(ctx, x0, y0, 94, 236, 10); ctx.fillStyle = 'rgba(255,252,246,0.6)'; ctx.fill(); ctx.clip();
            C.draw(ctx, id, x0 + 47, y0 + 6 + top * uu, uu, { view: 'front', expr: kind === 'talk' ? 'neutral' : 'neutral', talk: kind === 'talk' ? 0.5 : 0, viseme: kind === 'talk' ? nm : undefined, blink: kind === 'blink' ? 1 : 0, t, light: L() });
            ctx.restore(); if (r === 1) label(ctx, nm, x0 + 47, 1680, '600 13px "Martian Mono"'); }); }); }
      // 6 · the car both ways
      panel(ctx, 1868, 1146, 716, 540, 'en el auto teal · Eli maneja / Mila maneja');
      car(ctx, 2226, 1405, 92, E_, M_, t, { pose: 'driveFist', expr: 'furious', lean: 0.04 }, { expr: 'curious', view: 'q', dir: -1, look: [0.7, 0] });
      car(ctx, 2226, 1660, 92, M_, E_, t, { pose: 'drive', expr: 'determined' }, { expr: 'worried', pose: 'lap' });
    },
    post: { grain: 0.05, vignette: 0.1, vignetteColor: '#6a4a50' },
  });
})(typeof window !== 'undefined' ? window : globalThis);
