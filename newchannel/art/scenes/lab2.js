/* lab2: v2 kit parts sheet (painterly clouds, full-body characters + poses, mascot gestures, top-down cars). Visual
   checks only, not used in episodes. ?part=clouds|people|cars */
(function (root) {
  const K = root.K;
  let part = 'clouds';
  K.scene('lab2', {
    setup(ctx, o) { part = o.part || 'clouds'; },
    draw(ctx, t) {
      if (part === 'clouds') {
        K.sky.gradient(ctx, [[0, '#5d6aa3'], [0.35, '#b48aa8'], [0.7, '#f0a77f'], [1, '#ffe2a8']]);
        const sun = [1100, 760];
        K.sky.sun(ctx, sun[0], sun[1], 42, { core: '#fff4d6', halo: '#ffcf86', glow: 600 });
        const defs = [[300, 260, 520, 150, 1], [900, 200, 700, 190, 2], [1600, 300, 460, 120, 3], [500, 560, 360, 90, 4], [1450, 600, 300, 70, 5]];
        const list = defs.map(([x, y, w, h, s]) => ({ x, y, w, h, o: { seed: s, ang: K.sky.angTo(x, y - h / 2, sun[0], sun[1]), color: '#c497ab', shade: '#7e6a9e', lit: '#f7c0a0', rim: '#ffe6bc', underLit: '#ffc890' } }));
        K.sky.drawClouds(ctx, list, t);
        const noon = [[300, 900, 420, 120, 7], [1000, 900, 560, 150, 8]];
        K.sky.drawClouds(ctx, noon.map(([x, y, w, h, s]) => ({ x, y, w, h, o: { seed: s, ang: -Math.PI / 2 - 0.3, color: '#e9ecef', shade: '#b8c0cc', lit: '#fbfbf8', rim: '#ffffff', under: '#a8b2c0', contours: true } })), t);
      }
      if (part === 'people') {
        K.sky.gradient(ctx, [[0, '#f6e7cf'], [1, '#e9cfae']]);
        const light = { ang: -2.3, rim: '#ffe0a0', shade: '#5a2a40' };
        K.char.POSES.forEach((p, i) => {
          const pe = K.car.persona(i * 3 + 1, 4), x = 120 + i * 185, y = 470;
          K.char.person(ctx, x, y, 52, { pose: p, t, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, capColor: pe.capColor, shirt: K.car.COLORS[(i * 3) % 10], pants: ['#3f4a63', '#5a4a3a', '#2f4f4a'][i % 3],
            expr: ['content', 'curious', 'worried', 'delighted', 'focused', 'content', 'neutral', 'smug', 'laughing', 'curious'][i], light, vest: i === 4 ? '#d8e04a' : null, dir: 1, seed: i });
          ctx.fillStyle = '#1C2433'; ctx.font = '500 20px "Martian Mono"'; ctx.textAlign = 'center'; ctx.fillText(p, x, y + 40);
        });
        ['rest', 'shrug', 'point', 'wave', 'fist', 'hips', 'cheer'].forEach((g, i) => {
          const x = 140 + i * 260, y = 760;
          K.char.mascotArms(ctx, x, y, 70, g, t, { dir: 1 });
          K.char.mascot(ctx, x, y, 70, { expr: ['content', 'worried', 'curious', 'delighted', 'annoyed', 'smug', 'laughing'][i], rim: '#ffe0a0', lightAng: -0.7 });
          K.char.mascotLegs(ctx, x, y, 70, { sit: i === 5 });
          ctx.fillStyle = '#1C2433'; ctx.font = '500 20px "Martian Mono"'; ctx.textAlign = 'center'; ctx.fillText(g, x, y + 150);
        });
        // small scale check
        K.char.person(ctx, 1700, 1000, 14, { pose: 'wave', t, light });
        K.char.person(ctx, 1760, 1000, 9, { pose: 'clipboard', t, vest: '#d8e04a' });
      }
      if (part === 'cars') {
        ctx.fillStyle = '#a2a457'; ctx.fillRect(0, 0, K.W, K.H);
        const view = { sc: 26, sinE: Math.sin(0.62), cosE: Math.cos(0.62), ox: 960, oy: 540 };
        const lit = { rim: '#ffd99a', ang: -2.45, shade: '#3a3358', sunAng: Math.atan2(-0.6, -0.75) };
        for (let i = 0; i < 8; i++) { const a = i / 8 * K.TAU, pe = K.car.persona(i, 3);
          K.car.top(ctx, view, Math.cos(a) * 14, Math.sin(a) * 14, a + Math.PI / 2, Object.assign(pe, { k: 1.45, lit, brake: i % 3 === 0 ? 1 : 0, mascot: i === 2, color: i === 2 ? K.TEAL : pe.color, expr: 'content' })); }
        const v2 = { sc: 70, sinE: Math.sin(0.62), cosE: Math.cos(0.62), ox: 1650, oy: 860 };
        K.car.top(ctx, v2, 0, 0, -0.4, Object.assign(K.car.persona(4, 3), { lit, brake: 1 }));
      }
    },
    post: { grain: 0.1, vignette: 0.2 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
