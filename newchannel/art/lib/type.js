/* Diez Mil Puntos art kit · type: the wordmark rebuilt for illustrated scenes (brand rules kept: Martian Mono 800,
   word spaces at 0.55 cell, every dot a true circle, the companion is the dot on the i of "Mil" = the last dot).
   In the illustrated world the letters are cream "paper" lit by the scene: soft warm glow behind, a low cast shadow,
   a faint rim of scene light on top. Returns the anchor of each tittle so the mascot can land there. */
(function (root) {
  const K = root.K;
  K.type = {};
  K.type.FONT = '"Martian Mono"';

  // layout: returns { glyphs: [{ch, x}], width, xh, cap, tittles: [{x, y, r, mascot}] } for baseline at (0,0)
  K.type.layout = function (ctx, text, size, o = {}) {
    ctx.font = `800 ${size}px ${K.type.FONT}`;
    const adv = ctx.measureText('M').width, sp = adv * (o.space ?? 0.55);
    const xm = ctx.measureText('x'), xh = xm.actualBoundingBoxAscent, cap = ctx.measureText('M').actualBoundingBoxAscent;
    const glyphs = []; let x = 0;
    for (const ch of text) { if (ch === ' ') { x += sp; continue; } glyphs.push({ ch, x }); x += adv; }
    const iIdx = glyphs.map((g, k) => (g.ch === 'i' ? k : -1)).filter(k => k >= 0);
    const lastI = iIdx[iIdx.length - 1];
    const tittles = iIdx.map(k => {
      const g = glyphs[k], cx = g.x + adv / 2 + (o.tittleDx ?? -0.04) * adv, isM = k === lastI && o.mascotOnLast !== false;
      return isM ? { x: cx, y: -xh - xh * 0.52, r: xh * 0.40, mascot: true, k } : { x: cx, y: -xh - xh * 0.27, r: xh * 0.18, mascot: false, k };
    });
    return { glyphs, width: x - (text.endsWith(' ') ? sp : 0), adv, xh, cap, size, tittles };
  };

  // draw the letters (dotless i) at baseline (x, y), left aligned. o: { color, shadow, glow, rim, alpha, perGlyph(k)->{dy, a} }
  K.type.draw = function (ctx, lay, x, y, o = {}) {
    ctx.save(); ctx.font = `800 ${lay.size}px ${K.type.FONT}`; ctx.textBaseline = 'alphabetic';
    const each = (fn) => lay.glyphs.forEach((g, k) => {
      const pg = o.perGlyph ? o.perGlyph(k) : { dy: 0, a: 1 }; if (pg.a <= 0) return;
      fn(g.ch === 'i' ? 'ı' : g.ch, x + g.x, y + (pg.dy || 0), pg.a, k);
    });
    if (o.glow) { // warm light bleeding around the letters
      ctx.save(); ctx.filter = `blur(${lay.size * 0.12}px)`; ctx.globalCompositeOperation = 'screen';
      each((c, gx, gy, a) => { ctx.globalAlpha = a * (o.glowAlpha ?? 0.6); ctx.fillStyle = o.glow; ctx.fillText(c, gx, gy); });
      ctx.restore();
    }
    if (o.shadow) {
      ctx.save(); ctx.filter = `blur(${Math.max(1, lay.size * 0.025)}px)`;
      each((c, gx, gy, a) => { ctx.globalAlpha = a * (o.shadowAlpha ?? 0.45); ctx.fillStyle = o.shadow; ctx.fillText(c, gx + lay.size * 0.012, gy + lay.size * 0.035); });
      ctx.restore();
    }
    each((c, gx, gy, a) => { ctx.globalAlpha = a; ctx.fillStyle = o.color || K.PAPER; ctx.fillText(c, gx, gy); });
    if (o.rim) { // light catching the top edge of each letter (offscreen: letters minus letters shifted down)
      const t = (K.type._rim = K.type._rim || K.canvas(K.W, K.H)), tc = t.ctx;
      tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalCompositeOperation = 'source-over'; tc.clearRect(0, 0, K.W, K.H); tc.font = ctx.font; tc.textBaseline = 'alphabetic';
      const m = ctx.getTransform(); tc.setTransform(m);
      each((c, gx, gy, a) => { tc.globalAlpha = a; tc.fillStyle = o.rim; tc.fillText(c, gx, gy); });
      tc.globalCompositeOperation = 'destination-out'; tc.globalAlpha = 1;
      each((c, gx, gy) => { tc.fillText(c, gx + (o.rimDx || 0), gy + lay.size * (o.rimW ?? 0.02)); });
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = o.rimAlpha ?? 0.9; ctx.drawImage(t.c, 0, 0); ctx.restore();
    }
    ctx.restore();
  };

  // plain round tittle (the i of "Diez"): dy = squash offset when the mascot steps on it
  K.type.dot = function (ctx, lay, tt, x, y, o = {}) {
    const sq = o.squash || 0;
    ctx.save();
    if (o.shadow) { ctx.fillStyle = K.rgba(o.shadow, (o.shadowAlpha ?? 0.45) * 0.8); K.ellipse(ctx, x + tt.x + lay.size * 0.012, y + tt.y + lay.size * 0.035 + sq * tt.r * 0.5, tt.r * (1 + sq * 0.25), tt.r * (1 - sq * 0.25)); ctx.fill(); }
    ctx.fillStyle = o.color || K.PAPER; K.ellipse(ctx, x + tt.x, y + tt.y + sq * tt.r * 0.5, tt.r * (1 + sq * 0.25), tt.r * (1 - sq * 0.25)); ctx.fill();
    ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ---- v2: the lit letters are baked once per glyph (glow + soft shadow + cream fill + top rim) into sprites, so a
   frame only blits 13 images (the v1 path blurred every glyph twice per frame: about 2x the render cost). */
(function (root) {
  const K = root.K;
  K.type.bake = function (ctx, lay, o = {}) {
    const size = lay.size, pad = Math.ceil(size * 0.45), font = `800 ${size}px ${K.type.FONT}`;
    return lay.glyphs.map(g => {
      const ch = g.ch === 'i' ? 'ı' : g.ch, S = K.canvas(Math.ceil(lay.adv + pad * 2), Math.ceil(size * 1.3 + pad * 2)), c = S.ctx;
      const bx = pad, by = pad + size;           // baseline origin inside the sprite
      c.font = font; c.textBaseline = 'alphabetic';
      if (o.glow) { c.save(); c.filter = `blur(${size * 0.12}px)`; c.globalCompositeOperation = 'source-over'; c.globalAlpha = o.glowAlpha ?? 0.6; c.fillStyle = o.glow; c.fillText(ch, bx, by); c.restore(); }
      if (o.shadow) { c.save(); c.filter = `blur(${Math.max(1, size * 0.025)}px)`; c.globalAlpha = o.shadowAlpha ?? 0.45; c.fillStyle = o.shadow; c.fillText(ch, bx + size * 0.012, by + size * 0.035); c.restore(); }
      if (o.outline) { c.save(); c.lineJoin = 'round'; c.lineWidth = o.outlineW || size * 0.05; c.strokeStyle = o.outline; c.globalAlpha = o.outlineAlpha ?? 0.6; c.strokeText(ch, bx, by); c.restore(); }
      c.fillStyle = o.color || K.PAPER; c.fillText(ch, bx, by);
      if (o.rim) {
        const R = K.canvas(S.w, S.h), r = R.ctx; r.font = font; r.textBaseline = 'alphabetic';
        r.fillStyle = o.rim; r.fillText(ch, bx, by); r.globalCompositeOperation = 'destination-out'; r.fillText(ch, bx + (o.rimDx || 0), by + size * (o.rimW ?? 0.02));
        c.globalAlpha = o.rimAlpha ?? 0.9; c.drawImage(R.c, 0, 0); c.globalAlpha = 1;
      }
      return { S, bx, by, glow: !!o.glow };
    });
  };
  K.type.drawBaked = function (ctx, lay, baked, x, y, o = {}) {
    lay.glyphs.forEach((g, k) => {
      const pg = o.perGlyph ? o.perGlyph(k) : { dy: 0, a: 1 }; if (pg.a <= 0) return;
      const b = baked[k]; ctx.globalAlpha = pg.a; ctx.drawImage(b.S.c, x + g.x - b.bx, y + (pg.dy || 0) - b.by);
    });
    ctx.globalAlpha = 1;
  };
})(typeof window !== 'undefined' ? window : globalThis);
