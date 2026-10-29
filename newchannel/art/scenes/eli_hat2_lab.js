/* Eli headwear round 2 (lib/hats_v2.js), worn with the HOME outfit 3bB (or ?outfit=1 for the workshop apron), Mila in outfit 2.
   ?scene=eli_hat2_lab&k=1a|1b|1c|2..6[&outfit=3bB|1][&expr=surprised][&solo=0..4][&light=golden|night: the pair in scene light] */
(function (root) {
  const K = root.K, C = K.cast;
  K.scene('eli_hat2_lab', {
    setup(ctx, o) { this.k = o.k || '1a'; const out = o.outfit || '3bB'; this.id = C.ELI_HATS_V2.variant(this.k, C.OUTFITS.variant('eli', out, 0)); this.mila = C.OUTFITS.variant('mila', 2);
      this.expr = o.expr || 'happy'; this.solo = o.solo != null ? +o.solo : null; this.light = o.light || null; },
    draw(ctx, t) {
      const id = this.id, u = 860; let L = Object.assign({}, C.LIGHT.golden, { rim: '#fff4dc', rimA: 0.35 });
      const o = { pose: 'stand', expr: this.expr, t: 0.6, light: L, shadow: 0.3, blink: 0 };
      if (this.light) {
        if (this.light === 'golden') { const g = ctx.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, '#5d6aa3'); g.addColorStop(0.45, '#b48aa8'); g.addColorStop(0.75, '#f0a77f'); g.addColorStop(1, '#ffe2a8'); ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H);
          K.light.glow(ctx, 1500, 700, 700, '#ffd88f', 0.5, 'screen'); ctx.fillStyle = '#6d7a3e'; ctx.fillRect(0, 1000, K.W, 80); L = C.LIGHT.golden; }
        else { const g = ctx.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, '#0b1030'); g.addColorStop(0.7, '#2c3366'); g.addColorStop(1, '#463f6e'); ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H);
          const r = K.rng(5); ctx.fillStyle = '#e8ecff'; for (let k = 0; k < 120; k++) { K.circle(ctx, r() * K.W, r() * 700, 0.8 + r() * 1.5); ctx.fill(); } ctx.fillStyle = '#0a0f22'; ctx.fillRect(0, 1000, K.W, 80); L = C.LIGHT.night; }
        C.draw(ctx, id, 800, 1000, 850, Object.assign({}, o, { light: L, view: 'q', dir: 1, look: [0.6, -0.15] }));
        C.draw(ctx, this.mila, 1120, 1000, 850, { view: 'q', dir: -1, pose: 'stand', expr: 'happy', t: 0.9, light: L, shadow: 0.3, blink: 0, look: [-0.6, 0.05] });
        if (this.light === 'golden') K.light.grade(ctx, '#ff9a5a', 0.2, 'soft-light'); else K.light.grade(ctx, '#3a4aa0', 0.25, 'soft-light');
        return;
      }
      ctx.fillStyle = '#ece3d3'; ctx.fillRect(0, 0, K.W, K.H);
      const V = [[230, { view: 'front' }], [590, { view: 'q', dir: 1, look: [0.6, 0] }], [930, { view: 'side', dir: 1, look: [1, 0] }], [1240, { view: 'backq', dir: -1 }]];
      const mila = (x) => C.draw(ctx, this.mila, x, 1040, u, { view: 'q', dir: -1, pose: 'stand', expr: 'happy', t: 0.9, light: L, shadow: 0.3, blink: 0, look: [-0.7, -0.1] });
      if (this.solo != null) {
        if (this.solo < 4) C.draw(ctx, id, 960, 1040, u, Object.assign({}, o, V[this.solo][1]));
        else { C.draw(ctx, id, 845, 1040, u, Object.assign({}, o, { view: 'q', dir: 1, look: [0.7, -0.1] })); mila(1075); }
        return;
      }
      for (const [x, v] of V) C.draw(ctx, id, x, 1040, u, Object.assign({}, o, v));
      ctx.fillStyle = 'rgba(60,40,40,0.18)'; ctx.fillRect(1395, 60, 4, 980);
      C.draw(ctx, id, 1560, 1040, u, Object.assign({}, o, { view: 'q', dir: 1, look: [0.7, -0.1] }));
      mila(1790);
    },
    post() { return { grain: 0, vignette: 0, bloom: 0 }; },
  });
})(typeof window !== 'undefined' ? window : globalThis);
