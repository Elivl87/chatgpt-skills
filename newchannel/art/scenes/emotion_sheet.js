/* Emotion sheet (v4 rule: every character in this universe expresses every emotion clearly, front / 3/4 / profile).
   ?scene=emotion_sheet&W=2600&H=1880   13 emotions x (front, 3/4, profile) for Eli, Mila and a round-headed extra,
   with each emotion's body language (shoulders, arms, posture) visible in the bust. */
(function (root) {
  const K = root.K, C = K.cast;
  const INK = '#24161a', VIEWS = [['front', 'frente'], ['q', '3/4'], ['side', 'perfil']];
  const XEXPR = { neutral: 'content' };   // the extras' own name for an emotion, where it differs
  let BG = null;
  function bg() {
    if (BG) return BG; BG = K.canvas(K.W, K.H); const c = BG.ctx;
    K.sky.gradient(c, [[0, '#f7e9d4'], [0.55, '#f2dcc2'], [1, '#e9cbb2']], 0, K.H); K.sky.wash(c, K.W * 0.7, 40, 1200, '#ffd9a0', 0.3);
    K.tex.paint(BG, { amount: 0.3, mottle: { w: 1300, h: 900, sx: 0.003, sy: 0.02, seed: 5, amp: 24 } }); return BG;
  }
  const label = (ctx, t, x, y, f, col, al = 'center') => { ctx.save(); ctx.font = f; ctx.fillStyle = col; ctx.textAlign = al; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, x, y); ctx.restore(); };
  function cell(ctx, who, emo, view, x0, y0, w, h, t) {
    ctx.save(); K.rrect(ctx, x0 + 3, y0 + 3, w - 6, h - 6, 12); ctx.fillStyle = 'rgba(255,252,246,0.62)'; ctx.fill(); ctx.clip();
    const light = C.LIGHT.board, cx = x0 + w / 2;
    if (who === 'extra') {
      const R = (h - 24) / 2.95, y = y0 + 16 + 4.05 * R;
      K.char.person(ctx, cx, y, R, { pose: K.char.EMO_POSE[emo] || 'stand', expr: XEXPR[emo] || emo, t, view, dir: 1, skin: '#c98a64', hair: '#3a2a22', hairStyle: 'short', shirt: '#8aa0b8', pants: '#4a5266',
        light: { ang: -0.75, rim: '#fff1d2', shade: '#4a3560' } });
    } else {
      const S = C.SPECS[who], top = S.head.cy + S.head.hh + (who === 'eli1' ? 0.05 : 0.04), span = top - (S.shoulder - 0.13), u = (h - 18) / span;
      const E = C.EXPR[emo] || {}, y = y0 + 12 + top * u;
      C.draw(ctx, who, cx - (view === 'side' ? w * 0.06 : 0), y, u, { view, dir: 1, expr: emo, pose: E.body || 'stand', t, light });
    }
    ctx.restore();
  }
  K.scene('emotion_sheet', {
    draw(ctx, t) {
      ctx.drawImage(bg().c, 0, 0);
      const emos = C.EMOTIONS, LW = 120, top = 112, cw = (K.W - LW - 20) / emos.length, ch = 178, bandH = 40 + 3 * ch;
      label(ctx, 'Eli + Mila + extras · emociones en frente, 3/4 y perfil', 24, 52, '700 40px "Space Grotesk"', INK, 'left');
      label(ctx, 'DIEZ MIL PUNTOS · regla del Productor: cada personaje expresa bien cada emoción, en toda vista · 2026-10-15', K.W - 24, 48, '500 16px "Martian Mono"', 'rgba(60,36,48,0.7)', 'right');
      emos.forEach((e, k) => label(ctx, C.EMOTIONS_ES[e].toUpperCase(), LW + cw * (k + 0.5), top - 12, '700 15px "Martian Mono"', 'rgba(60,36,48,0.85)'));
      [['eli1', 'ELI', '#c99412'], ['mila1', 'MILA', '#6a4fb3'], ['extra', 'EXTRA', '#5a6a80']].forEach(([who, name, col], b) => {
        const by = top + b * bandH;
        label(ctx, name, 18, by + 30, '700 28px "Space Grotesk"', col, 'left');
        VIEWS.forEach(([v, vn], r) => {
          const y0 = by + 40 + r * ch;
          label(ctx, vn, LW - 14, y0 + ch / 2 + 6, '600 15px "Martian Mono"', 'rgba(60,36,48,0.7)', 'right');
          emos.forEach((e, k) => cell(ctx, who, e, v, LW + k * cw, y0, cw, ch, t + k * 0.37));
        });
      });
    },
    post: { grain: 0.05, vignette: 0.1, vignetteColor: '#6a4a50' },
  });
})(typeof window !== 'undefined' ? window : globalThis);
