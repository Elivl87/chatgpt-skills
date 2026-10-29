/* Outfit options lab (Producer 2026-10-29: «Dame opciones de vestimenta para ambos»). Inactive switches: lib/outfits.js.
   ?scene=outfit_lab&who=eli|mila&n=1..6   front · 3/4 · profile · back · sitting · arms up
   ?scene=outfit_lab&pair=0..3&light=neutral|golden|night   a coordinated couple look in the scene lights */
(function (root) {
  const K = root.K, C = K.cast;
  K.scene('outfit_lab', {
    setup(ctx, o) { this.o = o; this.light = o.light || 'neutral'; },
    draw(ctx, t) {
      const o = this.o, Ln = Object.assign({}, C.LIGHT.golden, { rim: '#fff4dc', rimA: 0.35 });
      if (o.pair != null || o.e != null) {   // ?e=3bA&m=2: any couple
        // u 850 (Guardian 2026-10-29: at 900 the tip of Mila's ponytail left the frame at the top)
        const P = o.e != null ? { eli: o.e, mila: o.m || 1 } : C.OUTFITS.pairs[+o.pair], e = C.OUTFITS.variant('eli', P.eli), m = C.OUTFITS.variant('mila', P.mila), mode = this.light;
        let L = Ln;
        if (mode === 'golden') { const g = ctx.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, '#5d6aa3'); g.addColorStop(0.45, '#b48aa8'); g.addColorStop(0.75, '#f0a77f'); g.addColorStop(1, '#ffe2a8'); ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H);
          K.light.glow(ctx, 1500, 700, 700, '#ffd88f', 0.5, 'screen'); ctx.fillStyle = '#6d7a3e'; ctx.fillRect(0, 950, K.W, 130);   /* the feet stand INSIDE the ground plane, not on its top edge */ L = C.LIGHT.golden; }
        else if (mode === 'night') { const g = ctx.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, '#0b1030'); g.addColorStop(0.7, '#2c3366'); g.addColorStop(1, '#463f6e'); ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H);
          const r = K.rng(5); ctx.fillStyle = '#e8ecff'; for (let k = 0; k < 120; k++) { K.circle(ctx, r() * K.W, r() * 700, 0.8 + r() * 1.5); ctx.fill(); } ctx.fillStyle = '#1a1f3a'; ctx.fillRect(0, 950, K.W, 130); L = C.LIGHT.night; }
        else { ctx.fillStyle = '#ece3d3'; ctx.fillRect(0, 0, K.W, K.H); }
        C.draw(ctx, e, 760, 1000, 850, { view: 'q', dir: 1, pose: 'stand', expr: 'happy', t: 0.6, light: L, shadow: 0.3, blink: 0, look: [0.6, -0.15] });
        C.draw(ctx, m, 1160, 1000, 850, { view: 'q', dir: -1, pose: 'stand', expr: 'happy', t: 0.9, light: L, shadow: 0.3, blink: 0, look: [-0.6, 0.05] });
        if (mode === 'golden') K.light.grade(ctx, '#ff9a5a', 0.2, 'soft-light'); if (mode === 'night') K.light.grade(ctx, '#3a4aa0', 0.25, 'soft-light');
        return;
      }
      ctx.fillStyle = '#ece3d3'; ctx.fillRect(0, 0, K.W, K.H);
      let id = C.OUTFITS.variant(o.who || 'eli', +(o.n || 1)); const u = 820, b = { expr: o.expr || 'happy', t: 0.6, light: Ln, shadow: 0.3, blink: 0 };
      // QC (Guardian 2026-10-29, collar_face_check.py): &headover=1 draws the head over the clothes; the difference with the
      // normal render is every garment pixel lying on the head (collars, hoods, turtlenecks vs the mouth)
      if (+o.headover) { const hid = id + 'HO'; if (!C.SPECS[hid]) C.define(hid, Object.assign({}, C.SPECS[id], { headOver: true })); id = hid; }
      const at = (x, oo) => C.draw(ctx, id, x, 1030, u, Object.assign({ pose: 'stand' }, b, oo));
      at(170, { view: 'front' }); at(480, { view: 'q', dir: 1, look: [0.6, 0] }); at(780, { view: 'side', dir: 1, look: [1, 0] }); at(1070, { view: 'back' });
      // a crate to sit on, exactly as high as this outfit's seated feet need (Guardian 2026-10-29: a fixed 0.62 leg-length crate
      // sank Mila's boots 20 px into the floor and lifted the short boots / sneakers off it). Chair-seated 3/4 in the kit: the
      // knee is 0.01 - 0.03 (1 - s) above the hip, the shin hangs legLen / 2, the sole is b.h / 2 under the ankle.
      const Sp = C.SPECS[id], sq = 0.55, seat = 1030 - u * (Sp.legLen * 0.5 - 0.01 + 0.03 * (1 - sq) + Sp.boot.h * 0.5);
      ctx.fillStyle = '#8a6a4a'; ctx.strokeStyle = '#2a1a1e'; ctx.lineWidth = 5; K.rrect(ctx, 1280, seat, 200, 1030 - seat, 12); ctx.fill(); ctx.stroke();
      { const fx = 1380 + u * (sq * Sp.legLen * 0.5 * 0.95 + sq * 0.03); ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = K.rgba('#3c2a52', 0.3);   // contact shadow under the seated feet
        K.ellipse(ctx, fx, 1030, u * 0.075, u * 0.016); ctx.fill(); ctx.restore(); }
      C.draw(ctx, id, 1380, seat + 2, u, Object.assign({}, b, { view: 'q', dir: 1, pose: 'sit', seated: true, legs: true, look: [0.6, 0] }));
      at(1700, { view: 'front', pose: 'cheer', expr: 'laugh' });
    },
    post() { return { grain: 0, vignette: 0, bloom: 0 }; },
  });
})(typeof window !== 'undefined' ? window : globalThis);
