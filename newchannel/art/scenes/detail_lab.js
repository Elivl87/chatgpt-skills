/* Detail lab (Detail QC, 2026-10-15): close-ups of the parts that must be clean at thumbnail scale.
   ?scene=detail_lab&part=faces|hands|clothes|rim&W=2400&H=1350
     faces    Eli + Mila big heads: surprised / awe / furious / happy / worried / smug in front, 3/4, profile
     hands    the hand set (relax, open palm, fist, point, grip on the wheel, clasped) for both, big
     clothes  Eli's apron / tee sleeves / beanie and Mila's collar / straps / bib / boots, front, 3/4, profile, arm up
     rim      the same busts under board, golden, backlit, night and the thumbnail-C red key (rim must be a thin
              inner edge on the lit side only) */
(function (root) {
  const K = root.K, C = K.cast;
  const INK = '#24161a';
  const label = (ctx, t, x, y, f = '600 16px "Martian Mono"', col = 'rgba(60,36,48,0.8)', al = 'center') => { ctx.save(); ctx.font = f; ctx.fillStyle = col; ctx.textAlign = al; ctx.fillText(t, x, y); ctx.restore(); };
  function box(ctx, x, y, w, h, fill = 'rgba(255,252,246,0.7)') { ctx.save(); K.rrect(ctx, x, y, w, h, 12); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); }
  function clipBox(ctx, x, y, w, h, fill, fn) { ctx.save(); K.rrect(ctx, x, y, w, h, 12); ctx.fillStyle = fill || 'rgba(255,252,246,0.7)'; ctx.fill(); ctx.clip(); fn(); ctx.restore(); }
  // a bust: head + shoulders filling a cell
  function bust(ctx, id, x0, y0, w, h, o, below = 0.1) {
    const S = C.SPECS[id], top = S.head.cy + S.head.hh + 0.06, span = top - (S.shoulder - below), u = (h - 10) / span;
    return C.draw(ctx, id, x0 + w / 2, y0 + 6 + top * u, u, Object.assign({ light: C.LIGHT.board, t: 0.6 }, o));
  }
  const RED = { ang: -0.15, rim: '#ff6a48', rimA: 1, rimW: 0.02, rimMax: 16, shade: '#0b1030', shadeA: 0.52, shadeW: 0.09, tex: 0.16 };
  K.scene('detail_lab', {
    setup(ctx, o) { this.part = o.part || 'faces'; this.o = o; },
    draw(ctx, t) {
      ctx.fillStyle = '#efe2cf'; ctx.fillRect(0, 0, K.W, K.H);
      const part = this.part;
      label(ctx, 'detail lab · ' + part, 20, 34, '700 26px "Space Grotesk"', INK, 'left');
      if (part === 'one') {   // debug: one big bust, ?rimA=&shadeA=&tex=&id=&expr=&view=
        const q = this.o, li = Object.assign({}, C.LIGHT[q.light || 'board']);
        for (const k of ['rimA', 'shadeA', 'tex', 'rimInset', 'rimW', 'ang']) if (q[k] != null) li[k] = Number(q[k]);
        bust(ctx, q.id || 'eli1', 100, 60, K.W - 200, K.H - 80, { view: q.view || 'front', dir: 1, expr: q.expr || 'surprised', pose: q.pose || 'stand', light: li }, 0.1);
      } else if (part === 'faces') {
        const ex = ['surprised', 'awe', 'furious', 'happy', 'worried', 'smug'], views = ['front', 'q', 'side'];
        const cw = (K.W - 40) / ex.length, ch = (K.H - 70) / 6;
        ['eli1', 'mila1'].forEach((id, a) => ex.forEach((e, k) => views.forEach((v, r) => {
          const x = 20 + k * cw, y = 56 + (a * 3 + r) * ch;
          clipBox(ctx, x + 3, y + 3, cw - 6, ch - 6, null, () => bust(ctx, id, x + 3 - (v === 'side' ? cw * 0.08 : 0), y + 3, cw - 6, ch - 6, { view: v, dir: 1, expr: e, pose: 'stand' }, 0.0));
          if (a === 0 && r === 0) label(ctx, e, x + cw / 2, y + 18, '600 13px "Martian Mono"');
        })));
      } else if (part === 'hands') {   // each cell is centred on one hand (C.probe), big enough to judge the drawing
        const poses = [['stand', 'relax', 'front', 'lead'], ['open', 'open palm', 'front', 'lead'], ['fist', 'fist', 'q', 'lead'], ['point', 'point', 'q', 'lead'], ['clasp', 'clasp', 'front', 'lead'], ['cheer', 'cheer fist', 'front', 'lead'], ['surprise', 'surprise palm', 'q', 'trail'], ['drive', 'grip (drive)', 'side', 'lead']];
        const cw = (K.W - 40) / poses.length, ch = (K.H - 70) / 2;
        ['eli1', 'mila1'].forEach((id, r) => poses.forEach(([p, nm, v, hk], k) => {
          const x = 20 + k * cw, y = 56 + r * ch, u = 1500, seated = p === 'drive';
          const o = { view: v, dir: 1, pose: p, expr: 'neutral', t: 0.6, light: C.LIGHT.board, seated };
          const pr = C.probe(id, 0, 0, u, o), hp = pr.hands[hk];
          clipBox(ctx, x + 3, y + 3, cw - 6, ch - 6, null, () => C.draw(ctx, id, x + cw / 2 - hp[0], y + ch / 2 + 10 - hp[1], u, o));
          if (r === 0) label(ctx, nm, x + cw / 2, y + 22, '600 14px "Martian Mono"');
        }));
      } else if (part === 'clothes') {
        const cells = [['eli1', 'front', 'stand'], ['eli1', 'q', 'stand'], ['eli1', 'side', 'stand'], ['eli1', 'q', 'cheer'], ['eli1', 'front', 'wave'], ['eli1', 'back', 'stand'],
          ['mila1', 'front', 'stand'], ['mila1', 'q', 'stand'], ['mila1', 'side', 'stand'], ['mila1', 'q', 'cheer'], ['mila1', 'front', 'wave'], ['mila1', 'back', 'stand']];
        const cw = (K.W - 40) / 6, ch = (K.H - 70) / 2;
        cells.forEach(([id, v, p], k) => {
          const x = 20 + (k % 6) * cw, y = 56 + ((k / 6) | 0) * ch, S = C.SPECS[id];
          clipBox(ctx, x + 3, y + 3, cw - 6, ch - 6, null, () => { const u = (ch - 16) / (S.h + 0.1); C.draw(ctx, id, x + cw / 2, y + 8 + (S.h + 0.08) * u, u, { view: v, dir: 1, pose: p, expr: 'neutral', t: 0.6, light: C.LIGHT.board }); });
          label(ctx, `${v} · ${p}`, x + cw / 2, y + 22, '600 13px "Martian Mono"');
        });
      } else if (part === 'rim') {
        const L = [['board', C.LIGHT.board, '#efe2cf'], ['golden', C.LIGHT.golden, '#e9b98a'], ['backlit', C.LIGHT.backlit, '#d99a72'], ['night', C.LIGHT.night, '#1c2446'], ['red key (C)', RED, '#1a2040']];
        const cw = (K.W - 40) / L.length, ch = (K.H - 70) / 2;
        ['eli1', 'mila1'].forEach((id, r) => L.forEach(([nm, li, bgc], k) => {
          const x = 20 + k * cw, y = 56 + r * ch;
          clipBox(ctx, x + 3, y + 3, cw - 6, ch - 6, bgc, () => bust(ctx, id, x + 3, y + 3, cw - 6, ch - 6, { view: 'q', dir: 1, expr: r ? 'awe' : 'surprised', pose: r ? 'clasp' : 'surprise', light: li }, 0.3));
          if (r === 0) label(ctx, nm, x + cw / 2, y + 24, '700 15px "Martian Mono"', k >= 3 ? '#f3ecdd' : 'rgba(60,36,48,0.85)');
        }));
      }
    },
    post: { grain: 0.03, vignette: 0 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
