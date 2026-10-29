/* Outfit options lab (Producer 2026-10-29: «Dame opciones de vestimenta para ambos»). Inactive switches: lib/outfits.js.
   ?scene=outfit_lab&who=eli|mila&n=1..6   front · 3/4 · profile · back · sitting · arms up
   ?scene=outfit_lab&pair=0..3&light=neutral|golden|night   a coordinated couple look in the scene lights */
(function (root) {
  const K = root.K, C = K.cast;
  K.scene('outfit_lab', {
    setup(ctx, o) { this.o = o; this.light = o.light || 'neutral'; },
    draw(ctx, t) {
      const o = this.o, Ln = Object.assign({}, C.LIGHT.golden, { rim: '#fff4dc', rimA: 0.35 });
      if (o.pair != null) {
        const P = C.OUTFITS.pairs[+o.pair], e = C.OUTFITS.variant('eli', P.eli), m = C.OUTFITS.variant('mila', P.mila), mode = this.light;
        let L = Ln;
        if (mode === 'golden') { const g = ctx.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, '#5d6aa3'); g.addColorStop(0.45, '#b48aa8'); g.addColorStop(0.75, '#f0a77f'); g.addColorStop(1, '#ffe2a8'); ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H);
          K.light.glow(ctx, 1500, 700, 700, '#ffd88f', 0.5, 'screen'); ctx.fillStyle = '#6d7a3e'; ctx.fillRect(0, 1000, K.W, 80); L = C.LIGHT.golden; }
        else if (mode === 'night') { const g = ctx.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, '#0b1030'); g.addColorStop(0.7, '#2c3366'); g.addColorStop(1, '#463f6e'); ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H);
          const r = K.rng(5); ctx.fillStyle = '#e8ecff'; for (let k = 0; k < 120; k++) { K.circle(ctx, r() * K.W, r() * 700, 0.8 + r() * 1.5); ctx.fill(); } ctx.fillStyle = '#0a0f22'; ctx.fillRect(0, 1000, K.W, 80); L = C.LIGHT.night; }
        else { ctx.fillStyle = '#ece3d3'; ctx.fillRect(0, 0, K.W, K.H); }
        C.draw(ctx, e, 760, 1000, 900, { view: 'q', dir: 1, pose: 'stand', expr: 'happy', t: 0.6, light: L, shadow: 0.3, blink: 0, look: [0.6, -0.15] });
        C.draw(ctx, m, 1160, 1000, 900, { view: 'q', dir: -1, pose: 'stand', expr: 'happy', t: 0.9, light: L, shadow: 0.3, blink: 0, look: [-0.6, 0.05] });
        if (mode === 'golden') K.light.grade(ctx, '#ff9a5a', 0.2, 'soft-light'); if (mode === 'night') K.light.grade(ctx, '#3a4aa0', 0.25, 'soft-light');
        return;
      }
      ctx.fillStyle = '#ece3d3'; ctx.fillRect(0, 0, K.W, K.H);
      const id = C.OUTFITS.variant(o.who || 'eli', +(o.n || 1)), u = 820, b = { expr: 'happy', t: 0.6, light: Ln, shadow: 0.3, blink: 0 };
      const at = (x, oo) => C.draw(ctx, id, x, 1030, u, Object.assign({ pose: 'stand' }, b, oo));
      at(170, { view: 'front' }); at(480, { view: 'q', dir: 1, look: [0.6, 0] }); at(780, { view: 'side', dir: 1, look: [1, 0] }); at(1070, { view: 'back' });
      const seat = 1030 - C.SPECS[id].legLen * u * 0.62;   // a crate to sit on, as high as the knees
      ctx.fillStyle = '#8a6a4a'; ctx.strokeStyle = '#2a1a1e'; ctx.lineWidth = 5; K.rrect(ctx, 1280, seat, 200, 1030 - seat, 12); ctx.fill(); ctx.stroke();
      C.draw(ctx, id, 1380, seat + 2, u, Object.assign({}, b, { view: 'q', dir: 1, pose: 'sit', seated: true, legs: true, look: [0.6, 0] }));
      at(1700, { view: 'front', pose: 'cheer', expr: 'laugh' });
    },
    post() { return { grain: 0, vignette: 0, bloom: 0 }; },
  });
})(typeof window !== 'undefined' ? window : globalThis);
