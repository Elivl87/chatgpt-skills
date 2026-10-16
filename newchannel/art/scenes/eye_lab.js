/* Eye lab (eyes QC, 2026-10-16): the pupil must be a clear dark dot inside the white at EVERY size, view and light.
   ?scene=eye_lab&part=sizes|lights
     sizes   Eli + Mila faces, every emotion (columns) at three eye widths (rows: ~18, ~30, ~52 px base eye width)
     lights  surprised / awe / furious / happy / neutral / smug in front, 3/4 and profile under golden, dusk, night red,
             noon and backlit, at a small (draft-like) size
   The faces audit (ep/001/animatic/faces_audit.mjs) runs its automated eye check on this lab too. */
(function (root) {
  const K = root.K, C = K.cast;
  const INK = '#24161a';
  const label = (ctx, t, x, y, f = '600 13px "Martian Mono"', col = 'rgba(60,36,48,0.85)', al = 'center') => { ctx.save(); ctx.font = f; ctx.fillStyle = col; ctx.textAlign = al; ctx.fillText(t, x, y); ctx.restore(); };
  const NIGHTRED = { ang: -0.15, rim: '#ff6a48', rimA: 1, rimW: 0.02, rimMax: 16, shade: '#0b1030', shadeA: 0.52, shadeW: 0.09, tex: 0.16 };
  // a face centred in a cell: eye width ew px (base eye, before the emotion's own scale)
  function face(ctx, id, cx, cy, ew, o) {
    const S = C.SPECS[id], u = ew / (2 * S.face.eyeR);
    const oo = Object.assign({ light: C.LIGHT.board, t: 0.6, pose: 'stand', dir: 1 }, o);
    const pr = C.probe(id, 0, 0, u, oo);
    return C.draw(ctx, id, cx - pr.head[0], cy - pr.head[1], u, oo);
  }
  function cell(ctx, x, y, w, h, fill, fn) { ctx.save(); K.rrect(ctx, x, y, w, h, 8); ctx.fillStyle = fill; ctx.fill(); ctx.clip(); fn(); ctx.restore(); }
  K.scene('eye_lab', {
    setup(ctx, o) { this.part = o.part || 'sizes'; },
    draw(ctx, t) {
      ctx.fillStyle = '#efe2cf'; ctx.fillRect(0, 0, K.W, K.H);
      label(ctx, 'eye lab · ' + this.part, 20, 30, '700 24px "Space Grotesk"', INK, 'left');
      if (this.part === 'sizes') {
        const ex = C.EMOTIONS, sizes = [18, 30, 52], cw = (K.W - 40) / ex.length;
        let y = 52;
        ['eli1', 'mila1'].forEach((id) => sizes.forEach((ew) => {
          const h = ew * 3.6 + 16;
          ex.forEach((e, k) => { const x = 20 + k * cw; cell(ctx, x + 2, y, cw - 4, h - 4, 'rgba(255,252,246,0.75)', () => face(ctx, id, x + cw / 2, y + h * 0.5, ew, { view: 'front', expr: e })); });
          label(ctx, `${id.slice(0, -1)} ${ew}px`, 22, y + 14, '600 11px "Martian Mono"', 'rgba(60,36,48,0.7)', 'left');
          y += h;
        }));
        ex.forEach((e, k) => label(ctx, e, 20 + k * cw + cw / 2, K.H - 10));
      } else {
        const lights = [['golden', C.LIGHT.golden, '#e9b98a'], ['dusk', C.LIGHT.dusk, '#c98a7a'], ['night red', NIGHTRED, '#1a2040'], ['noon', C.LIGHT.noon, '#cfd8dc'], ['backlit', C.LIGHT.backlit, '#d99a72']];
        const cols = [['eli1', 'front', 'surprised'], ['eli1', 'q', 'surprised'], ['eli1', 'side', 'surprised'], ['eli1', 'q', 'awe'], ['eli1', 'q', 'furious'], ['eli1', 'q', 'happy'],
          ['mila1', 'front', 'surprised'], ['mila1', 'q', 'surprised'], ['mila1', 'side', 'surprised'], ['mila1', 'q', 'awe'], ['mila1', 'q', 'neutral'], ['mila1', 'q', 'smug']];
        const cw = (K.W - 120) / cols.length, ch = (K.H - 80) / lights.length;
        lights.forEach(([nm, li, bg], r) => {
          label(ctx, nm, 60, 60 + r * ch + ch / 2, '600 12px "Martian Mono"');
          cols.forEach(([id, v, e], k) => { const x = 110 + k * cw, y = 50 + r * ch;
            cell(ctx, x + 2, y + 2, cw - 4, ch - 4, bg, () => face(ctx, id, x + cw / 2, y + ch * 0.5, 22, { view: v, expr: e, light: li })); });
        });
        cols.forEach(([id, v, e], k) => label(ctx, `${id.slice(0, -1)} ${v} ${e}`, 110 + k * cw + cw / 2, K.H - 12, '600 10px "Martian Mono"'));
      }
    },
    post: { grain: 0.1, vignette: 0 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
