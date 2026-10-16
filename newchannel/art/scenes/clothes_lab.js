/* Clothes lab (clothing QC, 2026-10-16, Producer: «Las ropas a veces tienen desperfectos»).
   Every pose x view the animatic uses, for one character in one scene light, as a grid (rows = views, columns = poses):
     ?scene=clothes_lab&id=eli1|mila1&light=golden|dusk|night|noon&set=stand1|stand2|car|ground[&out=854x480]
     &t=<seconds>  (time for breathing / sway / walk phase)   &flat=1 (no light, no grain: exact wardrobe colours)
     &blend=<0..1> (every cell blends from the set's rest pose — stand / lap / sit — into its pose: popping test)
   The automated clothing audit (ep/001/animatic/clothes_audit.mjs) drives this scene; the grid is also read by eye at
   draft (854x480) and 1080p. Cells: K.cast.CLOTHES_CELLS (exported for the audit). */
(function (root) {
  const K = root.K, C = K.cast;
  const SETS = {
    stand1: ['stand', 'walk', 'point', 'crossed', 'hips', 'scratch', 'fist', 'wave', 'clipboard', 'detective', 'visor'],
    stand2: ['surprise', 'clasp', 'shrug', 'palm', 'cheer', 'pump', 'think', 'pointSelf', 'open', 'chin', 'belly'],
    car: ['drive', 'driveFist', 'lap', 'lapPoint', 'crossed', 'cheer', 'palm', 'fist', 'point', 'visor', 'belly'],
    ground: ['sit', 'sitPoint', 'belly', 'palm', 'crossed', 'point'],
  };
  const VIEWS = ['front', 'q', 'side', 'back', 'backq'];
  const BG = { golden: ['#e9b98a', '#f3d2a6'], dusk: ['#8a5f7c', '#c58c8c'], night: ['#1c2446', '#2c335a'], noon: ['#c9ced3', '#dfe1df'], board: ['#efe2cf', '#f6ecdc'] };
  const EXPR = { stand: 'neutral', walk: 'happy', point: 'determined', crossed: 'annoyed', hips: 'smug', scratch: 'sheepish', fist: 'furious', wave: 'happy', clipboard: 'thinking',
    detective: 'curious', visor: 'curious', surprise: 'surprised', clasp: 'awe', shrug: 'sheepish', palm: 'happy', cheer: 'laugh', pump: 'determined', think: 'thinking',
    pointSelf: 'smug', open: 'happy', chin: 'curious', belly: 'laugh', drive: 'neutral', driveFist: 'furious', lap: 'neutral', lapPoint: 'surprised', sit: 'neutral', sitPoint: 'curious' };
  function cells(set, id) {
    const poses = SETS[set] || SETS.stand1, out = [];
    VIEWS.forEach((v, r) => poses.forEach((p, k) => {
      if (id === 'eli1' && p === 'clipboard') p = 'clipboard';   // both may hold it in the lab (Mila's prop in the film)
      const o = { view: v, dir: 1, pose: p, expr: EXPR[p] || 'neutral' };
      if (set === 'car') Object.assign(o, { seated: true });
      if (set === 'ground') Object.assign(o, { seated: true, legs: true, sitGround: true });
      out.push({ r, k, o });
    }));
    return { poses, out };
  }
  C.CLOTHES_SETS = SETS; C.CLOTHES_VIEWS = VIEWS; C.clothesCells = cells;
  // where a cell's character goes (design units): the same geometry is used by the audit
  C.clothesLayout = function (set, id, k, r, ncol) {
    const S = C.SPECS[id], cw = (K.W - 20) / ncol, ch = (K.H - 30) / VIEWS.length, seated = set === 'car' || set === 'ground';
    const span = seated ? (set === 'ground' ? S.h * 0.78 : S.h - S.legLen + 0.08) : S.h + 0.12;
    const u = Math.min((ch - 14) / span, cw * 1.25);
    const x = 10 + k * cw + cw / 2, y = 30 + r * ch + ch - (set === 'ground' ? 16 : 8) - (set === 'car' ? 0.02 * u : 0);
    return { x, y, u, cell: [10 + k * cw, 30 + r * ch, cw, ch] };
  };
  K.scene('clothes_lab', {
    setup(ctx, o) { this.o = o; this.blend = o.blend != null ? Number(o.blend) : null; this.id = o.id || 'eli1'; this.set = o.set || 'stand1'; this.light = o.light || 'golden'; this.flat = o.flat === '1'; this.t0 = Number(o.t || 0.6); },
    draw(ctx, t) {
      const bg = BG[this.light] || BG.golden, id = this.id, { poses, out } = cells(this.set, id);
      if (this.flat) { ctx.fillStyle = '#ff00ff'; ctx.fillRect(0, 0, K.W, K.H); }
      else { const g = ctx.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H); }
      const light = this.flat ? { ang: -1, rimA: 0, shadeA: 0, tex: 0 } : C.LIGHT[this.light];
      const ink = this.light === 'night' || this.light === 'dusk' ? 'rgba(240,230,220,0.85)' : 'rgba(50,30,40,0.8)';
      ctx.save(); ctx.font = '600 15px "Martian Mono"'; ctx.fillStyle = ink; ctx.textAlign = 'left';
      if (!this.flat) ctx.fillText(`clothes lab · ${id} · ${this.light} · ${this.set}`, 12, 20);
      ctx.restore();
      for (const { r, k, o } of out) {
        const L = C.clothesLayout(this.set, id, k, r, poses.length), [cx, cy, cw, ch] = L.cell;
        if (!this.flat) {
          ctx.save(); ctx.strokeStyle = this.light === 'night' ? 'rgba(255,255,255,0.12)' : 'rgba(60,40,40,0.15)'; ctx.strokeRect(cx + 0.5, cy + 0.5, cw - 1, ch - 1);
          ctx.font = '500 11px "Martian Mono"'; ctx.fillStyle = ink; ctx.fillText(`${o.view}·${o.pose}`, cx + 4, cy + 12); ctx.restore();
        }
        ctx.save(); ctx.beginPath(); ctx.rect(cx + 1, cy + 1, cw - 2, ch - 2); ctx.clip();
        const oo = Object.assign({ t: this.t0 + t, light, shadow: this.flat ? 0 : 0.3 }, o);
        if (this.blend != null) { const rest = this.set === 'car' ? 'lap' : this.set === 'ground' ? 'sit' : 'stand'; oo.blend = { pose: o.pose, k: this.blend }; oo.pose = rest; }
        C.draw(ctx, id, L.x, L.y, L.u, oo);
        ctx.restore();
      }
    },
    post() { return this.flat ? { grain: 0, vignette: 0, bloom: 0 } : { grain: 0.06, vignette: 0, bloom: this.light === 'night' ? 0.25 : 0.12 }; },
  });
})(typeof window !== 'undefined' ? window : globalThis);
