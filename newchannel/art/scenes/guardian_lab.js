/* Guardian lab (2026-10-16): draws Eli / Mila with any options, big, to inspect one pose / view / light head to toe.
   ?scene=guardian_lab&bg=%23e9d8c0&cfg=[{"id":"eli1","x":960,"y":1000,"u":1000,"o":{"view":"back","pose":"visor"}}]
   (o.light may be a K.cast.LIGHT name). Used by the Guardian to reproduce what the body audit finds in a shot. */
(function (root) {
  const K = root.K, C = K.cast;
  K.scene('guardian_lab', {
    setup(ctx, o) { this.cfg = JSON.parse(o.cfg || '[]'); this.bg = o.bg || '#e9d8c0'; },
    draw(ctx, t) {
      ctx.fillStyle = this.bg; ctx.fillRect(0, 0, K.W, K.H);
      ctx.fillStyle = 'rgba(60,40,40,0.25)'; ctx.fillRect(0, 1000, K.W, 2);
      for (const d of this.cfg) {
        const o = Object.assign({ t: t + 0.6 }, d.o || {}); if (typeof o.light === 'string') o.light = C.LIGHT[o.light];
        C.draw(ctx, d.id, d.x, d.y, d.u, o);
      }
    },
    post() { return { grain: 0, vignette: 0, bloom: 0 }; },
  });
})(typeof window !== 'undefined' ? window : globalThis);
