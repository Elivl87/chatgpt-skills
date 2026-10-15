/* heroes_lab: Quest & Pixie model-sheet panels (?part=turn|expr|poses|golden|talk). Rendered by render/build_characters.sh. */
(function (root) {
  const K = root.K, H = K.hero;
  const PAPER = '#e8e3d9';
  function backdrop(ctx, title) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, K.W, K.H);
    const g = ctx.createRadialGradient(K.W / 2, K.H * 0.45, 100, K.W / 2, K.H / 2, K.W * 0.7); g.addColorStop(0, K.rgba('#ffffff', 0.35)); g.addColorStop(1, K.rgba('#b9b1a3', 0.35));
    ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H);
    if (title) { ctx.fillStyle = '#3a3036'; ctx.font = '700 30px "Martian Mono"'; ctx.fillText(title, 48, 58); }
  }
  const label = (ctx, txt, x, y, size = 20) => { ctx.save(); ctx.fillStyle = '#5a4e52'; ctx.font = `500 ${size}px "Martian Mono"`; ctx.textAlign = 'center'; ctx.fillText(txt, x, y); ctx.restore(); };
  K.scene('heroes_lab', {
    setup(ctx, opts) { this.part = opts.part || 'turn'; this.light = opts.light || 'neutral'; this.expr = opts.expr || 'neutral'; },
    draw(ctx, t) {
      const part = this.part, Lt = H.LIGHT[this.light];
      if (part === 'turn') {
        backdrop(ctx, 'QUEST & PIXIE · turnaround · height check (Pixie = 95 %)');
        const u = 118, G = 960, yaws = [0, 0.75, Math.PI / 2, Math.PI], names = ['front', '3/4', 'profile', 'back'];
        // height lines
        const qTop = G - 5.5 * u, pTop = G - 0.95 * 5.5 * u;
        ctx.strokeStyle = K.rgba('#b8322a', 0.7); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(40, qTop); ctx.lineTo(K.W - 40, qTop); ctx.stroke();
        ctx.strokeStyle = K.rgba('#1f7d8c', 0.8); ctx.beginPath(); ctx.moveTo(40, pTop); ctx.lineTo(K.W - 40, pTop); ctx.stroke();
        ctx.strokeStyle = K.rgba('#3a3036', 0.6); ctx.beginPath(); ctx.moveTo(40, G); ctx.lineTo(K.W - 40, G); ctx.stroke();
        for (let k = 0; k <= 5; k++) { ctx.fillStyle = '#7a6e70'; ctx.font = '500 16px "Martian Mono"'; ctx.fillText(String(k), 18, G - k * u + 5); ctx.fillRect(34, G - k * u, 10, 1.5); }
        yaws.forEach((yw, i) => { const x = 170 + i * 225; H.draw(ctx, 'quest', x, G, u, { yaw: yw, t: 0.4, light: Lt, expr: 'neutral', blink: 0 }); label(ctx, 'Quest ' + names[i], x, G + 50); });
        yaws.forEach((yw, i) => { const x = 1050 + i * 225; H.draw(ctx, 'pixie', x, G, u, { yaw: yw, t: 0.4, light: Lt, expr: 'neutral', blink: 0 }); label(ctx, 'Pixie ' + names[i], x, G + 50); });
      } else if (part === 'expr') {
        backdrop(ctx, 'expressions · 12 + blink + lip-flap');
        const E = H.EXPRESSIONS, u = 150;
        E.forEach((e, i) => {
          const col = i % 6, row = Math.floor(i / 6), x = 170 + col * 316;
          const yq = 330 + row * 460;
          ctx.save(); ctx.beginPath(); ctx.rect(x - 156, yq - 250, 312, 360); ctx.clip();
          ctx.fillStyle = K.rgba('#ffffff', 0.18); ctx.fillRect(x - 156, yq - 250, 312, 360);
          H.draw(ctx, 'pixie', x + 70, yq + 4.4 * 0.9 * u + 15, u * 0.9, { pose: 'stand', expr: e, t: 0.3, light: Lt, blink: 0, contact: 0, yaw: -0.35 });
          H.draw(ctx, 'quest', x - 62, yq + 4.4 * 0.9 * u + 30, u * 0.9, { pose: 'stand', expr: e, t: 0.3, light: Lt, blink: 0, contact: 0, yaw: 0.3 });
          ctx.restore();
          label(ctx, e, x, yq + 150, 20);
        });
      } else if (part === 'poses' || part === 'posesP') {
        const who = part === 'poses' ? 'quest' : 'pixie';
        backdrop(ctx, (who === 'quest' ? 'Quest' : 'Pixie') + ' · poses (all IK, all breathing)');
        const ps = ['stand', 'walk', 'point', 'shrug', 'wave', 'think', 'surprised', 'laugh', 'crossed', 'awe', 'fists', 'hips', 'clipboard', 'explain', 'sit', 'drive'];
        const u = 72;
        ps.forEach((p, i) => {
          const col = i % 8, row = Math.floor(i / 8), x = 130 + col * 236, G = 500 + row * 490;
          const yaw = p === 'walk' ? 0.9 : p === 'drive' ? 0.7 : p === 'sit' ? 0.5 : p === 'point' ? 0.35 : 0.15;
          H.draw(ctx, who, x, p === 'drive' ? G - 60 : G, u, { pose: p, t: 0.35 + i * 0.13, light: Lt, yaw, seed: who === 'quest' ? 1 : 2 });
          label(ctx, p, x, G + 50, 18);
        });
      } else if (part === 'light') {
        backdrop(ctx, '');
        const moods = [['golden', [[0, '#5d6aa3'], [0.45, '#f0a77f'], [1, '#ffe2a8']], '#7f8a4c', 'golden-hour (backlit)'], ['dusk', [[0, '#2a2b58'], [0.6, '#a8657f'], [1, '#ffcb8e']], '#3d2c55', 'dusk'],
          ['night', [[0, '#0b1030'], [1, '#463f6e']], '#121834', 'night (moon rim)'], ['noon', [[0, '#b9c2cf'], [1, '#e8e6df']], '#a9b08a', 'overcast noon']];
        moods.forEach(([m, sky, grd, name], i) => {
          const x0 = i * 480;
          ctx.save(); ctx.beginPath(); ctx.rect(x0 + 4, 0, 472, K.H); ctx.clip();
          const g = ctx.createLinearGradient(0, 0, 0, 760); sky.forEach(([k, c]) => g.addColorStop(k, c)); ctx.fillStyle = g; ctx.fillRect(x0, 0, 480, 760);
          if (m === 'golden') K.light.glow(ctx, x0 + 240, 700, 420, '#fff0c8', 0.8, 'screen');
          if (m === 'night') { ctx.fillStyle = '#f6efd8'; K.circle(ctx, x0 + 120, 160, 26); ctx.fill(); K.light.glow(ctx, x0 + 120, 160, 160, '#9fb4ff', 0.4, 'screen'); }
          ctx.fillStyle = grd; ctx.fillRect(x0, 740, 480, 400);
          const Lt = H.LIGHT[m === 'golden' ? 'backlit' : m];
          const sh = m === 'golden' ? { dx: -0.1, k: 0.45, alpha: 0.45 } : m === 'dusk' ? { dx: 0.3, k: 0.25, alpha: 0.35 } : null;
          H.draw(ctx, 'quest', x0 + 170, 960, 96, { pose: i === 2 ? 'awe' : i === 3 ? 'shrug' : 'stand', yaw: 0.35, t: 1 + i, light: Lt, shadow: sh, expr: i === 0 ? 'happy' : undefined });
          H.draw(ctx, 'pixie', x0 + 320, 960, 96, { pose: i === 2 ? 'point' : i === 1 ? 'wave' : 'explain', yaw: -0.35, aim: -0.5, aimZ: -0.2, t: 1.3 + i, light: Lt, shadow: sh });
          if (m === 'golden') K.light.grade(ctx, '#ff9a5a', 0.2, 'soft-light');
          if (m === 'night') K.light.grade(ctx, '#3a4aa0', 0.25, 'soft-light');
          ctx.restore();
          label(ctx, name, x0 + 240, 1050, 20);
        });
      } else if (part === 'single') {
        backdrop(ctx, '');
        const u = 330;
        H.draw(ctx, 'quest', 560, 1000 + 4.0 * u, u, { yaw: 0.3, t, light: Lt, expr: this.expr, blink: 0 });
        H.draw(ctx, 'pixie', 1380, 1000 + 4.4 * u * 0.9, u, { yaw: -0.3, t, light: Lt, expr: this.expr, blink: 0 });
      }
    },
    post: { grain: 0.06, vignette: 0.12, vignetteColor: '#6a5a5a' },
  });
})(typeof window !== 'undefined' ? window : globalThis);
(function (root) { const K = root.K, H = K.hero;
  K.scene('heroes_dbg', { setup(ctx, o) { this.o = o; }, draw(ctx, t) { ctx.fillStyle = '#e8e3d9'; ctx.fillRect(0, 0, K.W, K.H);
    H.draw(ctx, 'quest', 400, 1000, 140, { dbgNoLight: true, dbgNoTex: true, t });
    H.draw(ctx, 'quest', 900, 1000, 140, { dbgNoTex: true, t });
    H.draw(ctx, 'quest', 1400, 1000, 140, { dbgNoLight: true, t }); }, post: { grain: 0, vignette: 0 } });
})(typeof window !== 'undefined' ? window : globalThis);
