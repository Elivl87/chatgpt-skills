/* Eli headwear options (Producer 2026-10-29: «El sombrerito tampoco me gusta, dame opciones»). Lab only: eli1 keeps the
   beanie until the Producer picks. ?scene=eli_hat_lab&n=1..7[&expr=surprised&hit=1]: front, 3/4, profile, back, and a cell beside Mila. */
(function (root) {
  const K = root.K, C = K.cast;
  // QC (Guardian 2026-10-29, brow_clear_check.py): &probe=1 paints the brows pure red, &nohat=1 drops every head layer
  function variant(n, probe, nohat) {
    const id = 'eliHat' + n + (probe ? 'p' : '') + (nohat ? 'x' : ''); if (C.SPECS[id]) return id; const b = C.SPECS.eli1, L = nohat ? {} : C.ELI_HATS[n].layers();
    C.define(id, Object.assign({}, b, { hat: L.hat || null, hairBack: L.hairBack || null, hairFront: L.hairFront || null, backHair: L.backHair || null, extraK: L.extraK || b.extraK },
      probe ? { face: Object.assign({}, b.face, { browColor: '#ff0000' }) } : {}));
    return id;
  }
  K.scene('eli_hat_lab', {
    setup(ctx, o) { this.n = +(o.n || 1); this.id = variant(this.n, +(o.probe || 0), +(o.nohat || 0)); this.expr = o.expr || 'happy'; this.hit = +(o.hit || 0); this.solo = o.solo != null ? +o.solo : null; },
    draw(ctx, t) {
      ctx.fillStyle = '#ece3d3'; ctx.fillRect(0, 0, K.W, K.H);
      const L = Object.assign({}, C.LIGHT.golden, { rim: '#fff4dc', rimA: 0.35 }), id = this.id, u = 860, o = { pose: 'stand', expr: this.expr, t: 0.6, light: L, shadow: 0.3, blink: 0, hatHit: this.hit };
      // views: front, 3/4, profile, back 3/4, | beside Mila. ?solo=0..4 draws one view alone at the centre (the sheet's surprise
      // strip uses it: the bigger surprise ticks of the tall hats would otherwise cross the neighbouring view)
      const V = [[230, { view: 'front' }], [590, { view: 'q', dir: 1, look: [0.6, 0] }], [930, { view: 'side', dir: 1, look: [1, 0] }], [1240, { view: 'backq', dir: -1 }]];
      const mila = (x) => C.draw(ctx, 'mila1', x, 1040, u, { view: 'q', dir: -1, pose: 'stand', expr: 'happy', t: 0.9, light: L, shadow: 0.3, blink: 0, look: [-0.7, -0.1] });
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
