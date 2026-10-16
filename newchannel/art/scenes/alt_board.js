/* Eli + Mila · five alternative designs (2026-10-15) · boards + the shared test scene + line-up strips + lab.
   ?scene=alt_board&alt=N    1920x1080 board: front / 3/4 / side, 6 expressions, 3 poses (point, shrug, car), height
                             line-up next to a round-headed extra, swatches, one-line concept, the test scene
   ?scene=alt_scene&alt=N    the SAME golden-hour car close-up for every alt, framed tight (characters big): Eli yells
                             «¡¿Quién fue?!» at the wheel (furious, fist), Mila looks back, curious
   ?scene=alt_lineup&alt=N   960x400 line-up strip (overview sheet)
   ?scene=alt_lab&ids=eli1,mila1[&pose=..&expr=..&bust=1]   development sheet */
(function (root) {
  const K = root.K, C = K.cast;
  const INK = '#24161a';
  const EXPR = ['neutral', 'laugh', 'surprised', 'furious', 'worried', 'smug'];
  const EXPR_ES = { neutral: 'neutral', laugh: 'risa', surprised: 'sorpresa', furious: 'furia (grita)', worried: 'preocupado', smug: 'pícaro' };

  // ------------------------------------------------------------------ the pair in the teal car (car-local coords)
  C.crew2 = function (ctx, sx, sy, SC, cfg) {
    const t = cfg.t || 0, light = cfg.light, u = cfg.u || 2.7 * SC, seatY = sy + 0.34 * SC + (cfg.bob || 0), out = {};
    const wheel = (info, onWheel) => {
      const hx = (info.hands.lead[0] + info.hands.trail[0]) / 2, hy = (info.hands.lead[1] + info.hands.trail[1]) / 2;
      const wx = onWheel ? info.hands.lead[0] + 0.01 * SC : sx + 0.95 * SC, wy = onWheel ? info.hands.lead[1] : sy - 0.05 * SC; void hx; void hy;
      ctx.save(); ctx.lineCap = 'round';
      ctx.strokeStyle = '#1c2433'; ctx.lineWidth = 0.05 * SC; ctx.beginPath(); ctx.moveTo(wx + 0.02 * SC, wy + 0.06 * SC); ctx.lineTo(sx + 1.15 * SC, sy + 0.32 * SC); ctx.stroke();
      ctx.lineWidth = 0.055 * SC; ctx.beginPath(); ctx.ellipse(wx, wy, 0.07 * SC, 0.25 * SC, 0.32, 0, K.TAU); ctx.stroke();
      if (light && light.rim) { ctx.strokeStyle = K.rgba(light.rim, 0.65); ctx.lineWidth = 0.016 * SC; ctx.beginPath(); ctx.ellipse(wx, wy, 0.07 * SC, 0.25 * SC, 0.32, -2.2, -0.6); ctx.stroke(); }
      ctx.restore();
    };
    // passenger first (near seat sits in front of the driver in a side view? no: the passenger seat is the NEAR one,
    // drawn after the driver so it overlaps him slightly)
    if (cfg.driver) {
      const o = Object.assign({ view: 'q', dir: 1, pose: 'drive', expr: 'neutral', t, light, seated: true }, cfg.driverO || {});
      out.driver = C.draw(ctx, cfg.driver, sx + 0.24 * SC, seatY, u, o);
      const pr = C.probe(cfg.driver, sx + 0.24 * SC, seatY, u, Object.assign({}, o, { pose: 'drive', blend: null, expr: 'neutral' }));   // the wheel sits where the drive pose puts the hands
      wheel({ hands: { lead: pr.hands.lead, trail: pr.hands.lead } }, true);
    }
    if (cfg.passenger) {
      const o = Object.assign({ view: 'q', dir: 1, pose: 'lap', expr: 'neutral', t, light, seated: true }, cfg.passengerO || {});
      out.passenger = C.draw(ctx, cfg.passenger, sx - 0.8 * SC, seatY + 0.02 * SC, u, o);
    }
    return out;
  };

  // ------------------------------------------------------------------ board helpers
  let BG = null;
  function boardBg() {
    if (BG) return BG;
    BG = K.canvas(K.W, K.H); const c = BG.ctx;
    K.sky.gradient(c, [[0, '#f7e9d4'], [0.55, '#f2dcc2'], [1, '#e9cbb2']], 0, K.H);
    K.sky.wash(c, 1500, 40, 900, '#ffd9a0', 0.35);
    K.tex.paint(BG, { amount: 0.35, mottle: { w: 1200, h: 680, sx: 0.003, sy: 0.02, seed: 5, amp: 26 } });
    return BG;
  }
  function panel(ctx, x, y, w, h, label, o = {}) {
    ctx.save(); ctx.fillStyle = o.fill || 'rgba(255,248,236,0.55)'; K.rrect(ctx, x, y, w, h, 18); ctx.fill();
    ctx.strokeStyle = 'rgba(80,50,60,0.18)'; ctx.lineWidth = 1.5; ctx.stroke();
    if (label) { ctx.font = '600 15px "Martian Mono"'; ctx.fillStyle = 'rgba(60,36,48,0.75)'; ctx.textBaseline = 'top'; ctx.fillText(label.toUpperCase(), x + 16, y + 12); }
    ctx.restore();
  }
  function ground(ctx, x0, x1, y) {
    const g = ctx.createLinearGradient(0, y - 6, 0, y + 30); g.addColorStop(0, 'rgba(160,110,100,0.0)'); g.addColorStop(0.2, 'rgba(160,110,100,0.18)'); g.addColorStop(1, 'rgba(160,110,100,0)');
    ctx.fillStyle = g; ctx.fillRect(x0, y - 6, x1 - x0, 36);
  }
  function label(ctx, text, x, y, o = {}) { ctx.save(); ctx.font = o.font || '500 15px "Martian Mono"'; ctx.fillStyle = o.color || 'rgba(60,36,48,0.8)'; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, x, y); ctx.restore(); }
  function wrap(ctx, text, x, y, w, lh) {
    const words = text.split(' '); let line = '', yy = y;
    for (const wd of words) { const tst = line ? line + ' ' + wd : wd; if (ctx.measureText(tst).width > w && line) { ctx.fillText(line, x, yy); line = wd; yy += lh; } else line = tst; }
    if (line) ctx.fillText(line, x, yy); return yy + lh;
  }
  const hstr = v => v.toFixed(2).replace('.', ',');

  // a generic round-headed extra about 1.0 unit tall (K.char.person is ~4.2 head radii tall)
  function extra(ctx, x, gy, u, t) {
    K.char.person(ctx, x, gy, u * 1.0 / 4.1, { pose: 'stand', t, skin: '#c98a64', hair: '#3a2a22', hairStyle: 'short', shirt: '#8aa0b8', pants: '#4a5266', light: { ang: -0.75, rim: '#fff1d2', shade: '#4a3560' } });
  }

  function lineup(ctx, A, x0, x1, gy, hpx, t, light, o = {}) {
    const u = hpx / 1.15, ids = [A.eli, A.mila];
    ground(ctx, x0, x1, gy);
    ctx.save(); ctx.strokeStyle = 'rgba(80,50,60,0.28)'; ctx.lineWidth = 1.2; ctx.setLineDash([6, 6]); ctx.font = '500 12px "Martian Mono"'; ctx.fillStyle = 'rgba(60,36,48,0.65)';
    for (const m of [0.5, 1.0]) { const y = gy - m * u; ctx.beginPath(); ctx.moveTo(x0 + 50, y); ctx.lineTo(x1 - 10, y); ctx.stroke(); ctx.fillText(hstr(m), x0 + 6, y + 4); }
    ctx.setLineDash([]); ctx.restore();
    const step = (x1 - x0 - 80) / 3, xs = [x0 + 80 + step * 0.5, x0 + 80 + step * 1.5, x0 + 80 + step * 2.5];
    const names = ['Eli', 'Mila'];
    ids.forEach((id, k) => {
      const S = C.SPECS[id], x = xs[k];
      C.draw(ctx, id, x, gy, u, { view: 'front', expr: 'neutral', t: t + k, light, shadow: 0.25 });
      const top = gy - S.h * u;
      ctx.save(); ctx.strokeStyle = K.rgba(A.sig[k], 0.7); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x + step * 0.18, top); ctx.lineTo(x + step * 0.36, top); ctx.stroke(); ctx.restore();
      label(ctx, `${names[k]} ${hstr(S.h)}`, x + step * 0.3, top - 8, { font: `700 ${o.big ? 22 : 14}px "Martian Mono"`, color: A.sig[k] });
    });
    extra(ctx, xs[2], gy, u, t);
    label(ctx, 'extra 1,00', xs[2] + (o.big ? 0 : step * 0.3), o.big ? gy + 30 : gy - u - 8, { font: `600 ${o.big ? 18 : 13}px "Martian Mono"`, color: 'rgba(60,36,48,0.6)' });
  }

  function card(ctx, A, who, x, y, w, h, color) {
    const id = A[who], S = C.SPECS[id], sw = A.sw[who];
    panel(ctx, x, y, w, h, null, { fill: 'rgba(255,250,242,0.7)' });
    ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = '700 34px "Space Grotesk"'; ctx.fillStyle = color; ctx.fillText(S.name, x + 18, y + 40);
    const nw = ctx.measureText(S.name).width;
    ctx.font = '500 14px "Martian Mono"'; ctx.fillStyle = 'rgba(60,36,48,0.75)';
    ctx.fillText(who === 'eli' ? `${hstr(S.h)} · el impaciente, ruidoso` : `${hstr(S.h)} · la paciente y curiosa`, x + 28 + nw, y + 37);
    const n = sw.length, step = (w - 36) / n;
    sw.forEach(([nm, col], k) => {
      const cx = x + 18 + step * (k + 0.5), cy = y + 66;
      ctx.fillStyle = col; ctx.strokeStyle = 'rgba(40,24,32,0.55)'; ctx.lineWidth = 2; K.circle(ctx, cx, cy, 13); ctx.fill(); ctx.stroke();
      ctx.textAlign = 'center'; ctx.font = '600 12px "Martian Mono"'; ctx.fillStyle = 'rgba(60,36,48,0.85)'; ctx.fillText(nm, cx, cy + 30);
      ctx.font = '500 11px "Martian Mono"'; ctx.fillStyle = 'rgba(60,36,48,0.6)'; ctx.fillText(col.toLowerCase(), cx, cy + 44); ctx.textAlign = 'left';
    });
    ctx.restore();
  }

  function drawCarPose(ctx, cx, gy, SC, A, light, t) {
    ctx.save(); ctx.fillStyle = 'rgba(70,40,60,0.18)'; K.ellipse(ctx, cx, gy + 2, 1.9 * SC, 0.09 * SC); ctx.fill();
    K.car.side(ctx, cx, gy, SC, { color: K.TEAL, lit: { rim: '#fff1d2', shade: '#4a3560', dx: 1 }, brake: 0, wheel: 0.5,
      drawDriver: (sx, sy) => C.crew2(ctx, sx, sy, SC, { driver: A.eli, passenger: A.mila, t, light, u: 2.7 * SC, driverO: { pose: 'driveFist', expr: 'furious', lean: 0.04 }, passengerO: { expr: 'curious', headTurn: -1.5 } }) });
    ctx.restore();
  }

  // ------------------------------------------------------------------ the board
  function drawBoard(ctx, n, t, img) {
    const A = C.ALTS[n], light = C.LIGHT.board, ids = [A.eli, A.mila];
    ctx.drawImage(boardBg().c, 0, 0);
    ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.font = '700 38px "Space Grotesk"'; ctx.fillStyle = INK; ctx.fillText(`Alt ${n} · ${A.es}`, 24, 50);
    ctx.font = '500 14px "Martian Mono"'; ctx.fillStyle = 'rgba(60,36,48,0.7)'; ctx.textAlign = 'right';
    ctx.fillText('DIEZ MIL PUNTOS · ELI + MILA · 5 ALTERNATIVAS · 2026-10-15 · dibujado 100 % en código', K.W - 24, 46); ctx.restore();

    // 1 · turnaround
    panel(ctx, 16, 66, 1140, 446, 'frente / 3/4 / perfil');
    const gy1 = 476, hmax = Math.max(...ids.map(i => C.SPECS[i].h)), uT = 345 / hmax;
    ground(ctx, 30, 1140, gy1);
    ids.forEach((id, k) => {
      const xs = [130 + k * 560, 290 + k * 560, 445 + k * 560];
      ['front', 'q', 'side'].forEach((v, j) => C.draw(ctx, id, xs[j], gy1, uT, { view: v, t: t + j * 0.7 + k, expr: 'neutral', light, shadow: 0.28 }));
      label(ctx, `${C.SPECS[id].name} · ${hstr(C.SPECS[id].h)}`, xs[1], 504, { font: '700 21px "Space Grotesk"', color: A.sig[k] });
    });

    // 2 · scene
    panel(ctx, 1170, 66, 734, 446, 'escena de prueba (la misma para las 5)');
    if (img) { ctx.save(); K.rrect(ctx, 1182, 96, 710, 399, 10); ctx.clip(); ctx.drawImage(img, 1182, 96, 710, 399); ctx.restore(); }

    // 3 · poses
    panel(ctx, 16, 522, 1140, 292, 'poses · señala / hombros / en el auto');
    const gy3 = 792, uP = 232 / hmax;
    ground(ctx, 30, 1140, gy3);
    ids.forEach((id, k) => {
      const x0 = 90 + k * 330;
      C.draw(ctx, id, x0, gy3, uP, { view: 'q', pose: 'point', expr: k === 0 ? 'furious' : 'curious', t: t + 1.1, light, shadow: 0.25 });
      C.draw(ctx, id, x0 + 170, gy3, uP, { view: 'front', pose: 'shrug', expr: k === 0 ? 'worried' : 'smug', t: t + 2.2, light, shadow: 0.25 });
    });
    drawCarPose(ctx, 935, gy3, 80, A, light, t);

    // 4 · expressions
    panel(ctx, 1170, 522, 734, 292, 'expresiones');
    ids.forEach((id, k) => {
      const S = C.SPECS[id], cellW = 118, cellH = 128, top = 550 + k * (cellH + 4);
      const hs = S.head.hh * 2 + 0.06, uE = 82 / hs;
      EXPR.forEach((e, j) => {
        const cx = 1182 + j * cellW + cellW / 2;
        ctx.save(); K.rrect(ctx, cx - cellW / 2 + 3, top, cellW - 6, cellH - 4, 10); ctx.fillStyle = 'rgba(255,252,246,0.6)'; ctx.fill(); ctx.clip();
        C.draw(ctx, id, cx, top + 60 + S.head.cy * uE, uE, { view: 'front', expr: e, t: t + j, light });
        ctx.fillStyle = 'rgba(255,250,240,0.92)'; K.rrect(ctx, cx - 54, top + cellH - 27, 108, 20, 9); ctx.fill();
        ctx.restore();
        label(ctx, EXPR_ES[e], cx, top + cellH - 12, { font: '600 11px "Martian Mono"' });
      });
    });

    // 5 · line-up + concept
    panel(ctx, 16, 824, 640, 242, 'estatura (junto a un extra de cabeza redonda)');
    lineup(ctx, A, 30, 640, 1056, 172, t, light);
    card(ctx, A, 'eli', 670, 824, 612, 116, A.sig[0]);
    card(ctx, A, 'mila', 1292, 824, 612, 116, A.sig[1]);
    panel(ctx, 670, 950, 1234, 116, 'concepto', { fill: 'rgba(255,250,242,0.7)' });
    ctx.save(); ctx.font = '600 20px "Space Grotesk"'; ctx.fillStyle = INK; ctx.textAlign = 'left'; wrap(ctx, A.concept, 690, 1000, 1190, 27); ctx.restore();
  }

  // ------------------------------------------------------------------ the shared test scene (tight close-up)
  C.ALT_FRAME = { z: 2.1, wx: 556, wy: 566, sx: 900, sy: 420 };
  function drawScene(ctx, t, frame, A, o = {}) {
    const E = K.ep1;
    E.drawCloseup(ctx, t, frame, {
      t0: 6, frame: o.frame || C.ALT_FRAME,
      crew: (c, sx, sy, SC, st) => {
        const light = Object.assign({}, C.LIGHT.golden, { rim: st.rim });
        const r = C.crew2(c, sx, sy, SC, { driver: A.eli, passenger: A.mila, t: st.tau, light, bob: st.bob, u: 2.7 * SC,
          driverO: Object.assign({ pose: 'driveFist', expr: 'furious', lean: 0.05, talk: 0 }, o.driverO || {}),
          passengerO: Object.assign({ pose: 'lap', expr: 'curious', headTurn: -1.55, drag: 0 }, o.passengerO || {}) });
        const m = c.getTransform(), sp = q => { const z = m.transformPoint(new DOMPoint(q[0], q[1])); return [z.x, z.y]; }, k = Math.hypot(m.a, m.b);
        C._lastCrew = { driver: r.driver && { head: [...sp(r.driver.head), r.driver.head[2] * k] } };
      },
    });
    if (o.bubble !== false && C._lastCrew && C._lastCrew.driver) bubble(ctx, C._lastCrew.driver.head, '¡¿Quién fue?!');
  }
  // a paper speech balloon (screen space), tail toward the speaker's mouth
  // o.side -1: the balloon goes up-LEFT of the speaker (when someone stands to their right)
  function bubble(ctx, head, text, a = 1, o = {}) {
    const [hx, hy, hr] = head, k = Math.max(0.6, Math.min(1.4, hr / 150)) * (0.6 + 0.4 * K.ease.outBack(K.clamp(a)));
    const fs = Math.round(58 * k); ctx.save(); ctx.globalAlpha = K.clamp(a * 1.5); ctx.font = `700 ${fs}px "Space Grotesk"`; const tw = ctx.measureText(text).width;
    const bw = tw + 70 * k, bh = fs * 1.75, by = Math.max(40, hy - hr * 2.1 - bh);
    const bx = o.side === -1 ? Math.max(40, hx - hr * 1.3 - bw) : Math.min(K.W - bw - 40, hx + hr * 0.9);
    ctx.fillStyle = K.rgba('#2a1830', 0.25); K.rrect(ctx, bx + 6, by + 8, bw, bh, bh / 2); ctx.fill();
    ctx.fillStyle = '#fbf3e4'; ctx.strokeStyle = '#2a1a1e'; ctx.lineWidth = 4 * k; ctx.lineJoin = 'round';
    // the tail stops just OUTSIDE the speaker's head (beside the hat cuff, on the balloon's side): it never crosses the
    // beanie, the eyes or the face (Guardian 2026-10-16: a long tail drawn to the mouth cut across Eli's whole head)
    const tx = bx + bw * (o.side === -1 ? 0.78 : 0.22), ty = by + bh, side = tx >= hx ? 1 : -1, tipX = hx + side * hr * 1.12, tipY = Math.max(ty + 12 * k, hy - hr * 0.15);
    ctx.beginPath(); ctx.moveTo(tx - 22 * k, ty - 4); ctx.lineTo(tipX, tipY); ctx.lineTo(tx + 22 * k, ty - 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    K.rrect(ctx, bx, by, bw, bh, bh / 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fbf3e4'; ctx.fillRect(tx - 18 * k, ty - 6 * k, 36 * k, 9 * k);
    ctx.fillStyle = '#2a1a1e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, bx + bw / 2, by + bh / 2 + 2);
    ctx.restore();
  }
  C.drawAltScene = drawScene; C.bubble = bubble;

  // ------------------------------------------------------------------ scenes
  function loadImg(src) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
  K.scene('alt_board', {
    async setup(ctx, opts) { this.n = Number(opts.alt || 1); this.img = await loadImg(`../characters/leo_mila/alternatives/alt_${this.n}_scene.png`); },
    draw(ctx, t) { drawBoard(ctx, this.n, t, this.img); },
    post: { grain: 0.07, vignette: 0.12, vignetteColor: '#6a4a50' },
  });
  K.scene('alt_scene', {
    setup(ctx, opts) { this.n = Number(opts.alt || 1); K.ep1.highway(); },
    draw(ctx, t, frame) { drawScene(ctx, t, frame, C.ALTS[this.n]); },
    post: { grain: 0.13, vignette: 0.42, vignetteColor: '#2a1330', bloom: 0.22 },
  });
  K.scene('alt_lineup', {
    setup(ctx, opts) { this.n = Number(opts.alt || 1); },
    draw(ctx, t) { ctx.drawImage(boardBg().c, 0, 0); lineup(ctx, C.ALTS[this.n], 10, 650, 390, 320, t, C.LIGHT.board, { big: true }); },
    post: { grain: 0.06, vignette: 0 },
  });
  K.scene('alt_lab', {
    setup(ctx, opts) { this.ids = (opts.ids || 'eli1,mila1').split(','); this.expr = opts.expr || 'neutral'; this.bust = !!opts.bust; this.view = opts.view || 'front'; this.pose = opts.pose || 'stand';
      this.light = opts.golden ? C.LIGHT.golden : C.LIGHT.board; this.u = Number(opts.u || 0); },
    draw(ctx, t) {
      ctx.drawImage(boardBg().c, 0, 0);
      if (this.bust) { // all 15 expressions for one id, front (row 1) and the chosen view
        const id = this.ids[0], S = C.SPECS[C.ALIAS[id] || id], ex = Object.keys(C.EXPR).filter(e => e !== 'sly'), u = this.u || 300 / (S.head.hh * 2 + 0.08);
        ex.forEach((e, j) => { const col = j % 8, row = (j / 8) | 0, cx = 120 + col * 240, cy = 40 + row * 520; ctx.save(); ctx.beginPath(); ctx.rect(cx - 120, cy, 240, 520); ctx.clip();
          C.draw(ctx, id, cx, cy + 200 + S.head.cy * u, u, { view: this.view, expr: e, t, light: this.light }); ctx.restore(); label(ctx, e, cx, cy + 500); });
        return;
      }
      const ids = this.ids, n = ids.length, u = this.u || 760 / Math.max(...ids.map(i => C.SPECS[C.ALIAS[i] || i].h));
      ids.forEach((id, k) => ['front', 'q', 'side'].forEach((v, j) => {
        const x = 170 + (k * 3 + j) * (1640 / Math.max(1, n * 3 - 1));
        C.draw(ctx, id, x, 1000, u * 0.95, { view: v, t, pose: this.pose, expr: this.expr, shadow: 0.3, light: this.light });
      }));
    },
    post: { grain: 0.06, vignette: 0.15 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
