/* lab: a sheet of kit parts for visual checks (characters, expressions, cars in every view). Not used in episodes. */
(function (root) {
  const K = root.K;
  K.scene('lab', {
    setup() {},
    draw(ctx, t) {
      K.sky.gradient(ctx, [[0, '#f6e7cf'], [1, '#e9cfae']]);
      const ex = K.char.EXPRESSIONS;
      ex.forEach((e, i) => {
        const x = 110 + (i % 8) * 230, y = 130 + Math.floor(i / 8) * 230;
        K.char.mascot(ctx, x, y, 80, { expr: e, rim: '#ffe0a0', lightAng: -0.7 });
        ctx.fillStyle = '#1C2433'; ctx.font = '500 22px "Martian Mono"'; ctx.textAlign = 'center'; ctx.fillText(e, x, y + 112);
      });
      const st = ['short', 'bob', 'curly', 'bun', 'cap', 'none'];
      st.forEach((s, i) => K.char.head(ctx, 120 + i * 150, 620, 55, { hairStyle: s, skin: K.char.SKIN[i], hair: K.char.HAIR[i], expr: ['content', 'surprised', 'annoyed', 'delighted', 'neutral', 'worried'][i], light: { ang: -0.7, rim: '#ffe0a0', shade: '#5a2a40' } }));
      const lit = { rim: '#ffd88f', shade: '#3c2a52', ang: -2.2, dx: -1 };
      K.car.rear(ctx, 1080, 760, 120, Object.assign(K.ep1.persona(3), { lit, brake: 1 }));
      K.car.rear(ctx, 1340, 760, 120, { color: '#e8553a', mascot: true, lit, brake: 0 });
      K.car.front(ctx, 1600, 760, 120, Object.assign(K.ep1.persona(5), { lit, head: 0.6 }));
      K.car.side(ctx, 400, 1040, 110, { color: '#E8553A', lit: { rim: '#ffd88f', shade: '#3c2a52', dx: 1 }, brake: 0.8,
        drawDriver: (sx, sy) => { K.char.mascot(ctx, sx, sy - 40, 60, { expr: 'annoyed', rim: '#ffd88f', lightAng: -0.5 }); } });
      const view = { sc: 60, sinE: 0.75, cosE: 0.66, ox: 1100, oy: 900 };
      K.car.top(ctx, view, 0, 0, 0.3, Object.assign(K.ep1.persona(2), { lit: { rim: '#ffd88f', ang: -2.4 }, brake: 1 }));
      K.car.top(ctx, view, 6, 1, -0.6, { color: '#E8553A', mascot: true, expr: 'smug', lit: { rim: '#ffd88f', ang: -2.4 } });
      K.terrain.tree(ctx, 1500, 1060, 220, { light: { dx: -0.6, back: 0.7, rim: '#ffd88f' } });
      K.terrain.tree(ctx, 1700, 1060, 260, { kind: 'poplar', light: { dx: -0.6, back: 0.7, rim: '#ffd88f' } });
      K.terrain.tree(ctx, 1850, 1060, 200, { kind: 'pine', light: { dx: -0.6, back: 0.7, rim: '#ffd88f' } });
    },
    post: { grain: 0.12, vignette: 0.2 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
