/* Eli headwear options (Producer 2026-10-29: «El sombrerito tampoco me gusta, dame opciones»). Lab only: eli1 keeps the
   beanie until the Producer picks. ?scene=eli_hat_lab&n=1..7[&expr=surprised&hit=1]: front, 3/4, profile, back, and a cell beside Mila. */
(function (root) {
  const K = root.K, C = K.cast;
  function variant(n) {
    const id = 'eliHat' + n; if (C.SPECS[id]) return id; const b = C.SPECS.eli1, L = C.ELI_HATS[n].layers();
    C.define(id, Object.assign({}, b, { hat: L.hat || null, hairBack: L.hairBack || null, hairFront: L.hairFront || null, backHair: L.backHair || null }));
    return id;
  }
  K.scene('eli_hat_lab', {
    setup(ctx, o) { this.n = +(o.n || 1); this.id = variant(this.n); this.expr = o.expr || 'happy'; this.hit = +(o.hit || 0); },
    draw(ctx, t) {
      ctx.fillStyle = '#ece3d3'; ctx.fillRect(0, 0, K.W, K.H);
      const L = Object.assign({}, C.LIGHT.golden, { rim: '#fff4dc', rimA: 0.35 }), id = this.id, u = 860, o = { pose: 'stand', expr: this.expr, t: 0.6, light: L, shadow: 0.3, blink: 0, hatHit: this.hit };
      C.draw(ctx, id, 230, 1040, u, Object.assign({}, o, { view: 'front' }));
      C.draw(ctx, id, 590, 1040, u, Object.assign({}, o, { view: 'q', dir: 1, look: [0.6, 0] }));
      C.draw(ctx, id, 930, 1040, u, Object.assign({}, o, { view: 'side', dir: 1, look: [1, 0] }));
      C.draw(ctx, id, 1240, 1040, u, Object.assign({}, o, { view: 'backq', dir: -1 }));
      ctx.fillStyle = 'rgba(60,40,40,0.18)'; ctx.fillRect(1395, 60, 4, 980);
      C.draw(ctx, id, 1560, 1040, u, Object.assign({}, o, { view: 'q', dir: 1, look: [0.7, -0.1] }));
      C.draw(ctx, 'mila1', 1790, 1040, u, { view: 'q', dir: -1, pose: 'stand', expr: 'happy', t: 0.9, light: L, shadow: 0.3, blink: 0, look: [-0.7, -0.1] });
    },
    post() { return { grain: 0, vignette: 0, bloom: 0 }; },
  });
})(typeof window !== 'undefined' ? window : globalThis);
