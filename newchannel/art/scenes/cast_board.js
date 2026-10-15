/* Character candidates (2026-10-15) · boards + test scene + lab.
   ?scene=cast_board&cand=A   the 1920x1080 board (turnaround, expressions, poses, height line-up, swatches, names)
   ?scene=cast_scene&cand=A   the SAME test scene for every candidate: golden-hour highway close-up (v2 frame b
                              composition, v4 fixes: crisp dark poles, opaque foreground grass) with the pair in the car,
                              the impatient one grumpy at the wheel, the other reacting (C / D: the mascot rides along)
   ?scene=cast_lineup&cand=A  the line-up strip used by the overview sheet
   ?scene=cast_lab&ids=leo,mila[&bust=1&view=q]  parts sheet for development */
(function (root) {
  const K = root.K, C = K.cast;
  const INK = '#24161a';

  // ------------------------------------------------------------------ copy (Spanish, for the Producer)
  const INFO = {
    leo: { name: 'Leo', alt: 'se queda Leo', role: 'El impaciente: maneja pegado, cierra cada hueco y grita «¡¿Quién fue?!»',
      line: 'Bajito, ruidoso y optimista; todo lo quiere ya.', sw: [['gorro', '#f2c230'], ['playera', '#f1ede2'], ['delantal', '#a4713d'], ['jeans', '#3f5f96'], ['piel', '#7a4d32'], ['botas', '#2b2729']] },
    mila: { name: 'Mila', alt: 'antes Max · otros: Maxi, Malva', role: 'La paciente y curiosa: mira hacia atrás, descubre la ola y dice «Fuiste tú.»',
      line: 'Alta, tranquila, párpados de sueño; ve lo que nadie ve.', sw: [['suéter', '#7158b8'], ['overol', '#c99633'], ['botas', '#2f6b45'], ['piel', '#d9a66c'], ['pelo', '#2e1d22'], ['aretes', '#e9b949']] },
    max: { name: 'Max', alt: 'como en SecondQuest EP003', role: 'El paciente: mira hacia atrás y descubre la ola.',
      line: 'Alto, calmado, párpados de sueño; habla poco y acierta.', sw: [['suéter', '#7158b8'], ['overol', '#c99633'], ['botas', '#2f6b45'], ['piel', '#d9a66c']] },
    lia: { name: 'Lía', alt: 'antes Leo · otros: Lea, Leona', role: 'La impaciente: cierra cada hueco y grita «¡¿Quién fue?!»',
      line: 'Bajita, ruidosa, trenzas bajo el gorro; cero paciencia.', sw: [['gorro', '#f2c230'], ['playera', '#f1ede2'], ['delantal', '#a4713d'], ['jeans', '#3f5f96'], ['piel', '#7a4d32'], ['aros', '#f0c24a']] },
    tono: { name: 'Toño', alt: 'otros: Beto, Rayo', role: 'El impaciente: copete al viento, cejas de tormenta; «¡¿Quién fue?!»',
      line: 'Bajito y redondo, enérgico, se enoja rápido y se le pasa rápido.', sw: [['chamarra', '#3a5bb5'], ['franja', '#f4ecdc'], ['pantalón', '#6f7280'], ['tenis', '#f08a3c'], ['piel', '#e7b089'], ['pelo', '#1d1416']] },
    paz: { name: 'Paz', alt: 'otros: Lupe, Ada', role: 'La paciente y curiosa: lentes redondos, mira atrás y entiende la ola.',
      line: 'Alta y serena, observa, anota y sonríe antes de explicar.', sw: [['abrigo', '#e0849b'], ['botones', '#f4ead6'], ['mallas', '#5d3a6b'], ['detalles', '#2f8a80'], ['piel', '#b97c55'], ['lentes', '#3b2440']] },
    chispa: { name: 'Chispa', alt: 'otros: Tilde, Pepa', role: 'Compañera de cada episodio y punto de la «i» de Mil.',
      line: 'Una chispa con patas: brilla, se asusta, aplaude y nunca se está quieta.', sw: [['cuerpo', '#ffb53d'], ['llama', '#ffe27a'], ['tenis', '#2f8a80'], ['mejillas', '#ff6f5a'], ['tinta', '#2a1a1e']] },
    punto: { name: 'Punto', alt: 'otros: Don Punto, Puntito', role: 'La mascota original, mejorada; sigue siendo el punto de la «i».',
      line: 'El punto bermellón de siempre, ahora con cara de verdad.', sw: [['disco', '#E8553A'], ['bufanda', '#23746C'], ['tinta', '#1C2433'], ['suela', '#f4ead6']] },
  };
  const EXPR_ES = { neutral: 'neutral', happy: 'feliz', surprised: 'sorpresa', grumpy: 'gruñón', worried: 'preocupado', smug: 'pícaro' };

  // ------------------------------------------------------------------ the crew in the teal car (shared by board and scene)
  // car-local coordinates: (sx, sy) = the drawDriver origin of K.car.side (top of the body), SC = px per metre
  C.crew = function (ctx, sx, sy, SC, cfg) {
    const t = cfg.t || 0, light = cfg.light, u = cfg.u || 2.7 * SC, bob = cfg.bob || 0, seatY = sy + 0.34 * SC + bob;
    const out = {};
    const drawWheel = (info, onWheel) => {
      const hx = (info.hands.lead[0] + info.hands.trail[0]) / 2, hy = (info.hands.lead[1] + info.hands.trail[1]) / 2;
      const wx = onWheel ? hx + 0.02 * SC : sx + 0.95 * SC, wy = onWheel ? hy : sy - 0.05 * SC;
      ctx.save(); ctx.lineCap = 'round';
      ctx.strokeStyle = '#1c2433'; ctx.lineWidth = 0.05 * SC; ctx.beginPath(); ctx.moveTo(wx + 0.02 * SC, wy + 0.06 * SC); ctx.lineTo(sx + 1.15 * SC, sy + 0.32 * SC); ctx.stroke();
      ctx.lineWidth = 0.055 * SC; ctx.beginPath(); ctx.ellipse(wx, wy, 0.07 * SC, 0.25 * SC, 0.32, 0, K.TAU); ctx.stroke();
      if (light && light.rim) { ctx.strokeStyle = K.rgba(light.rim, 0.65); ctx.lineWidth = 0.016 * SC; ctx.beginPath(); ctx.ellipse(wx, wy, 0.07 * SC, 0.25 * SC, 0.32, -2.2, -0.6); ctx.stroke(); }
      ctx.restore();
    };
    if (cfg.driver) {
      const d = cfg.driver, o = Object.assign({ view: 'q', dir: 1, pose: 'drive', expr: 'neutral', t, light, seated: true }, cfg.driverO || {});
      const lift = C.SPECS[d].mascot ? -0.36 * SC : 0;   // a mascot sits on a cushion so it reads above the door
      const info = C.draw(ctx, d, sx + 0.22 * SC, seatY + lift, u, o);
      drawWheel(info, o.pose === 'drive');
      out.driver = info;
    }
    if (cfg.passenger) {
      const o = Object.assign({ view: 'q', dir: 1, pose: 'stand', expr: 'neutral', t, light, seated: true }, cfg.passengerO || {});
      out.passenger = C.draw(ctx, cfg.passenger, sx - 0.78 * SC, seatY + 0.03 * SC, u, o);
    }
    return out;
  };
  // a mascot riding on the dashboard (after the car body is drawn: car-local coordinates of the body top)
  C.dashMascot = function (ctx, x, yTop, SC, cfg) {
    const o = Object.assign({ view: 'q', dir: -1, pose: 'stand', expr: 'surprised', t: cfg.t || 0, light: cfg.light, shadow: 0.25 }, cfg.mascotO || {});
    return C.draw(ctx, cfg.mascot, x, yTop, cfg.mu || 2.6 * SC, o);
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
    ctx.save();
    ctx.fillStyle = o.fill || 'rgba(255,248,236,0.55)'; K.rrect(ctx, x, y, w, h, 18); ctx.fill();
    ctx.strokeStyle = 'rgba(80,50,60,0.18)'; ctx.lineWidth = 1.5; ctx.stroke();
    if (label) { ctx.font = '600 15px "Martian Mono"'; ctx.fillStyle = 'rgba(60,36,48,0.75)'; ctx.textBaseline = 'top'; ctx.fillText(label.toUpperCase(), x + 16, y + 12); }
    ctx.restore();
  }
  function ground(ctx, x0, x1, y) {
    const g = ctx.createLinearGradient(0, y - 6, 0, y + 30); g.addColorStop(0, 'rgba(160,110,100,0.0)'); g.addColorStop(0.2, 'rgba(160,110,100,0.18)'); g.addColorStop(1, 'rgba(160,110,100,0)');
    ctx.fillStyle = g; ctx.fillRect(x0, y - 6, x1 - x0, 36);
  }
  function label(ctx, text, x, y, o = {}) {
    ctx.save(); ctx.font = o.font || '500 15px "Martian Mono"'; ctx.fillStyle = o.color || 'rgba(60,36,48,0.8)'; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, x, y); ctx.restore();
  }
  function wrap(ctx, text, x, y, w, lh) {
    const words = text.split(' '); let line = '', yy = y;
    for (const wd of words) { const tst = line ? line + ' ' + wd : wd; if (ctx.measureText(tst).width > w && line) { ctx.fillText(line, x, yy); line = wd; yy += lh; } else line = tst; }
    if (line) ctx.fillText(line, x, yy); return yy + lh;
  }
  function card(ctx, id, x, y, w, h, color) {
    const I = INFO[id], S = C.SPECS[id];
    panel(ctx, x, y, w, h, null, { fill: 'rgba(255,250,242,0.7)' });
    ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = '700 44px "Space Grotesk"'; ctx.fillStyle = color; ctx.fillText(I.name, x + 22, y + 52);
    const nw = ctx.measureText(I.name).width;
    ctx.font = '500 15px "Martian Mono"'; ctx.fillStyle = 'rgba(60,36,48,0.7)'; ctx.fillText(I.alt, x + 34 + nw, y + 50);
    ctx.font = '700 19px "Space Grotesk"'; ctx.fillStyle = INK; let yy = wrap(ctx, I.line, x + 22, y + 84, w - 44, 24);
    ctx.font = '500 17px "Space Grotesk"'; ctx.fillStyle = 'rgba(40,24,32,0.85)'; yy = wrap(ctx, I.role, x + 22, yy + 2, w - 44, 22);
    // swatches
    const n = I.sw.length, sw = Math.min(86, (w - 44) / n);
    I.sw.forEach(([nm, col], k) => {
      const cx = x + 22 + sw * k + 22, cy = y + h - 48;
      ctx.fillStyle = col; ctx.strokeStyle = 'rgba(40,24,32,0.55)'; ctx.lineWidth = 2; K.circle(ctx, cx, cy, 19); ctx.fill(); ctx.stroke();
      ctx.font = '500 12px "Martian Mono"'; ctx.fillStyle = 'rgba(60,36,48,0.8)'; ctx.textAlign = 'center'; ctx.fillText(nm, cx, cy + 36); ctx.fillText(col.toLowerCase(), cx, cy - 26);
      ctx.textAlign = 'left';
    });
    ctx.restore(); void S;
  }
  const SIG = { leo: '#c99412', mila: '#6a4fb3', max: '#6a4fb3', lia: '#c99412', tono: '#2f4fa8', paz: '#c4587a', chispa: '#e08a12', punto: '#d8452c' };

  function drawCarPose(ctx, cx, gy, SC, cfg, light) {
    ctx.save();
    ctx.fillStyle = 'rgba(70,40,60,0.18)'; K.ellipse(ctx, cx, gy + 2, 1.9 * SC, 0.09 * SC); ctx.fill();
    K.car.side(ctx, cx, gy, SC, { color: K.TEAL, lit: { rim: '#fff1d2', shade: '#4a3560', dx: 1 }, brake: 0, wheel: 0.5,
      drawDriver: (sx, sy) => C.crew(ctx, sx, sy, SC, Object.assign({ light }, cfg)) });
    if (cfg.mascot && cfg.dash) C.dashMascot(ctx, cx + 0.62 * SC, gy - 1.03 * SC, SC, Object.assign({ light }, cfg));
    ctx.restore();
  }

  function scaleRuler(ctx, x0, x1, gy, u, marks) {
    ctx.save(); ctx.strokeStyle = 'rgba(80,50,60,0.28)'; ctx.lineWidth = 1.2; ctx.setLineDash([6, 6]); ctx.font = '500 12px "Martian Mono"'; ctx.fillStyle = 'rgba(60,36,48,0.65)';
    for (const m of marks) { const y = gy - m * u; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.fillText(m.toFixed(2).replace('.', ','), x0 - 4 - ctx.measureText('0,00').width, y + 4); }
    ctx.setLineDash([]); ctx.restore();
  }

  // ------------------------------------------------------------------ the board
  function drawBoard(ctx, cand, t, img) {
    const CD = C.CANDIDATES[cand], ids = CD.cast, duo = ids.length === 2;
    const light = C.LIGHT.board;
    ctx.drawImage(boardBg().c, 0, 0);
    // header
    ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.font = '700 38px "Space Grotesk"'; ctx.fillStyle = INK; ctx.fillText(CD.title, 24, 52);
    ctx.font = '500 15px "Martian Mono"'; ctx.fillStyle = 'rgba(60,36,48,0.7)'; ctx.textAlign = 'right';
    ctx.fillText('DIEZ MIL PUNTOS · CANDIDATOS DE PERSONAJES · 2026-10-15 · dibujado 100 % en código', K.W - 24, 48); ctx.restore();

    // 1 · turnaround
    panel(ctx, 16, 70, 1140, 440, 'giro · frente / 3/4 / perfil');
    const hmax = Math.max(...ids.map(i => C.SPECS[i].h));
    const gy1 = 474, uT = (duo ? 350 : 330) / hmax;
    ground(ctx, 30, 1140, gy1);
    ids.forEach((id, k) => {
      const xs = duo ? [130 + k * 560, 290 + k * 560, 445 + k * 560] : [250, 590, 920];
      ['front', 'q', 'side'].forEach((v, j) => C.draw(ctx, id, xs[j], gy1, uT, { view: v, t: t + j * 0.7 + k, expr: 'neutral', light, shadow: 0.28 }));
      label(ctx, INFO[id].name, xs[1], 503, { font: '700 22px "Space Grotesk"', color: SIG[id] });
    });

    // 2 · the test scene (rendered separately, same for all candidates)
    panel(ctx, 1170, 70, 734, 440, 'escena de prueba (la misma para todos)');
    if (img) { ctx.save(); K.rrect(ctx, 1182, 100, 710, 399, 10); ctx.clip(); ctx.drawImage(img, 1182, 100, 710, 399); ctx.restore(); }

    // 3 · poses
    panel(ctx, 16, 522, 1140, 290, 'poses · de pie / señala / hombros / maneja (auto teal de dos plazas)');
    const gy3 = 790, uP = (duo ? 230 : 205) / hmax;
    ground(ctx, 30, 1140, gy3);
    if (duo) {
      ids.forEach((id, k) => {
        const x0 = 80 + k * 395;
        C.draw(ctx, id, x0, gy3, uP, { view: 'q', pose: 'stand', expr: 'happy', t: t + 0.3, light, shadow: 0.25 });
        C.draw(ctx, id, x0 + 110, gy3, uP, { view: 'q', pose: 'point', expr: k === 0 ? 'grumpy' : 'curious', t: t + 1.1, light, shadow: 0.25 });
        C.draw(ctx, id, x0 + 255, gy3, uP, { view: 'front', pose: 'shrug', expr: k === 0 ? 'annoyed' : 'smug', t: t + 2.2, light, shadow: 0.25 });
      });
      const SC = 82;
      drawCarPose(ctx, 960, gy3, SC, { driver: CD.car.driver, passenger: CD.car.passenger, u: 2.7 * SC, t, driverO: { expr: 'grumpy' }, passengerO: { expr: 'smug', look: [0.8, 0] } }, light);
    } else {
      const id = ids[0];
      C.draw(ctx, id, 120, gy3, uP, { view: 'front', pose: 'stand', expr: 'happy', t: t + 0.3, light, shadow: 0.25 });
      C.draw(ctx, id, 300, gy3, uP, { view: 'q', pose: 'point', expr: 'curious', t: t + 1.1, light, shadow: 0.25 });
      C.draw(ctx, id, 520, gy3, uP, { view: 'front', pose: 'shrug', expr: 'smug', t: t + 2.2, light, shadow: 0.25 });
      const SC = 80;
      drawCarPose(ctx, 880, gy3, SC, { driver: id, u: 3.0 * SC, t, driverO: { expr: 'grumpy' } }, light);
    }

    // 4 · expressions
    const ex = C.EXPRESSIONS;
    panel(ctx, 1170, 522, 734, duo ? 290 : 160, 'expresiones');
    ids.forEach((id, k) => {
      const S = C.SPECS[id];
      const cellW = 118, cellH = duo ? 128 : 136, top = 550 + k * (cellH + 4);
      const hs = S.head.hh * 2 + (S.head.kind === 'circle' ? 0.05 : 0.02);
      const uE = (duo ? 84 : 92) / hs;
      ex.forEach((e, j) => {
        const cx = 1182 + j * cellW + cellW / 2;
        ctx.save(); K.rrect(ctx, cx - cellW / 2 + 3, top, cellW - 6, cellH - 4, 10); ctx.fillStyle = 'rgba(255,252,246,0.6)'; ctx.fill(); ctx.clip();
        const hy = top + (duo ? 56 : 62) + (S.head.kind === 'circle' ? 6 : 0);
        C.draw(ctx, id, cx, hy + S.head.cy * uE, uE, { view: 'front', expr: e, t: t + j, light });
        ctx.fillStyle = 'rgba(255,250,240,0.92)'; K.rrect(ctx, cx - 50, top + cellH - 27, 100, 20, 9); ctx.fill();
        ctx.restore();
        label(ctx, EXPR_ES[e], cx, top + cellH - 12, { font: '600 12px "Martian Mono"' });
      });
    });
    if (!duo) wordmarkPanel(ctx, ids[0], 1170, 690, 734, 122, t);

    // 5 · line-up
    panel(ctx, 16, 824, 640, 242, 'estatura');
    lineup(ctx, cand, 40, 640, 1050, 205, t, light);

    // 6 · cards
    if (duo) { card(ctx, ids[0], 670, 824, 612, 242, SIG[ids[0]]); card(ctx, ids[1], 1292, 824, 612, 242, SIG[ids[1]]); }
    else {
      card(ctx, ids[0], 670, 824, 612, 242, SIG[ids[0]]);
      panel(ctx, 1292, 824, 612, 242, 'cómo vive en el canal', { fill: 'rgba(255,250,242,0.7)' });
      ctx.save(); ctx.font = '500 17px "Space Grotesk"'; ctx.fillStyle = INK; ctx.textAlign = 'left';
      const txt = ids[0] === 'chispa'
        ? ['Sola o junto a la pareja (en la escena: con Leo y Mila).', 'Se posa en el tablero y reacciona a la simulación.', 'En el gancho y el cierre aterriza como el punto de la «i».', 'Brilla de verdad: de noche es una luz más en la escena.']
        : ['Sola o junto a la pareja (en la escena: con Leo y Mila).', 'Conserva el disco bermellón sin contorno de la marca.', 'Nuevo: cejas, brillo en los ojos, bufanda teal, tenis.', 'En el gancho y el cierre es el punto de la «i» de Mil.'];
      txt.forEach((l, k) => { ctx.fillText('·  ' + l, 1312, 880 + k * 40); });
      ctx.restore();
    }
  }

  function wordmarkPanel(ctx, id, x, y, w, h, t) {
    ctx.save(); K.rrect(ctx, x, y, w, h, 18); ctx.clip();
    K.sky.gradient(ctx, [[0, '#2a2552'], [0.6, '#5a3f72'], [1, '#c8707e']], y, y + h, x, w);
    const size = 62, lay = K.type.layout(ctx, 'Diez Mil Puntos', size), x0 = x + (w - lay.width) / 2, y0 = y + h - 26;
    K.type.draw(ctx, lay, x0, y0, { color: '#f6ecd8', shadow: '#160b22', shadowAlpha: 0.7, rim: '#ffe6b0', rimAlpha: 0.9 });
    K.type.dot(ctx, lay, lay.tittles[0], x0, y0, { color: '#f6ecd8' });
    const tm = lay.tittles[1], S = C.SPECS[id];
    const u = (tm.r * 3.3) / (2 * S.head.hw);
    C.draw(ctx, id, x0 + tm.x, y0 + tm.y + (S.head.cy) * u - S.head.hw * u * 0.05, u, { view: 'front', expr: 'happy', pose: 'cheer', t, light: { ang: -1.4, rim: '#ffe6b0', rimA: 0.9, rimW: 0.01, shade: '#2a1838', shadeA: 0.3, shadeW: 0.05, tex: 0.2 }, glow: 0.8 });
    ctx.restore();
    label(ctx, 'EL PUNTO DE LA «i»', x + 16, y + 24, { align: 'left', color: 'rgba(255,236,210,0.85)', font: '600 13px "Martian Mono"' });
  }

  function lineup(ctx, cand, x0, x1, gy, hpx, t, light) {
    const CD = C.CANDIDATES[cand];
    let ids = CD.cast.slice();
    if (ids.length === 1) ids = [CD.car.driver, ids[0], CD.car.passenger];
    const hmax = Math.max(...ids.map(i => C.SPECS[i].h)), u = hpx / 1.15;
    ground(ctx, x0, x1, gy);
    scaleRuler(ctx, x0 + 50, x1 - 10, gy, u, [0.5, 1.0]);
    const n = ids.length, step = (x1 - x0 - 120) / n;
    ids.forEach((id, k) => {
      const x = x0 + 110 + step * (k + 0.5) - step * 0.15;
      C.draw(ctx, id, x, gy, u, { view: 'front', expr: 'neutral', t: t + k, light, shadow: 0.25 });
      const S = C.SPECS[id], top = gy - S.h * u;
      ctx.save(); ctx.strokeStyle = 'rgba(80,50,60,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + step * 0.12, top); ctx.lineTo(x + step * 0.28, top); ctx.stroke(); ctx.restore();
      label(ctx, INFO[id].name + ' ' + S.h.toFixed(2).replace('.', ','), x + step * 0.24, top - 8, { font: '600 13px "Martian Mono"', color: SIG[id] });
    });
    void hmax;
  }

  // ------------------------------------------------------------------ scenes
  function loadImg(src) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
  K.scene('cast_board', {
    async setup(ctx, opts) { this.cand = opts.cand || 'A'; this.img = await loadImg(`../characters/candidates/cand_${this.cand}_scene.png`); },
    draw(ctx, t) { drawBoard(ctx, this.cand, t, this.img); },
    post: { grain: 0.07, vignette: 0.12, vignetteColor: '#6a4a50' },
  });
  K.scene('cast_lineup', {   // 960 x 400 strip in the top-left of the frame (for the overview sheet)
    setup(ctx, opts) { this.cand = opts.cand || 'A'; },
    draw(ctx, t) { ctx.drawImage(boardBg().c, 0, 0); lineup(ctx, this.cand, 10, 950, 380, 330, t, C.LIGHT.board); },
    post: { grain: 0.06, vignette: 0 },
  });

  // the test scene: the v2/v3 close-up with this candidate's crew
  K.scene('cast_scene', {
    setup(ctx, opts) { this.cand = opts.cand || 'A'; K.ep1.highway(); },
    draw(ctx, t, frame) {
      const CD = C.CANDIDATES[this.cand], E = K.ep1, P = E.PAL.golden;
      const driverO = { expr: 'grumpy', pose: 'fist', extras: ['puff', 'anger'] };
      const passengerO = this.cand === 'B' ? { expr: 'curious', headTurn: -1.15, pose: 'stand' } : { expr: 'smug', look: [0.85, 0.05], pose: 'stand' };
      if (this.cand === 'A2') Object.assign(passengerO, { expr: 'smug' });
      E.drawCloseup(ctx, t, frame, {
        t0: 6,
        crew: (c, sx, sy, SC, st) => {
          const light = Object.assign({}, C.LIGHT.golden, { rim: st.rim });
          C.crew(c, sx, sy, SC, { driver: CD.car.driver, passenger: CD.car.passenger, t: st.tau, light, bob: st.bob, u: 2.7 * SC, driverO, passengerO });
        },
        after: CD.car.mascot ? (c, cx, gy, SC, st) => {
          const light = Object.assign({}, C.LIGHT.golden, { rim: st.rim });
          const mO = CD.car.mascot === 'chispa' ? { expr: 'worried', pose: 'shrug', view: 'q', dir: -1 } : { expr: 'annoyed', pose: 'hips', view: 'q', dir: -1 };
          C.dashMascot(c, cx + 1.22 * SC, gy - 1.0 * SC, SC, { mascot: CD.car.mascot, t: st.tau, light, mascotO: mO, mu: 2.5 * SC });
        } : null,
      });
    },
    post: { grain: 0.13, vignette: 0.42, vignetteColor: '#2a1330', bloom: 0.22 },
  });

  K.scene('cast_lab', {
    setup(ctx, opts) { this.ids = (opts.ids || 'leo,mila').split(','); this.expr = opts.expr || 'neutral'; this.bust = !!opts.bust; this.u = opts.u; this.view = opts.view || 'front'; this.pose = opts.pose || 'stand';
      this.light = opts.nolight ? { rimA: 0, shadeA: 0, tex: 0 } : (opts.golden ? C.LIGHT.golden : {}); },
    draw(ctx, t) {
      ctx.fillStyle = '#e9dccb'; ctx.fillRect(0, 0, K.W, K.H);
      if (this.bust) { const exprs = C.EXPRESSIONS; this.ids.forEach((id, k) => exprs.forEach((e, j) => { const S = C.SPECS[id], u = Number(this.u || 1500); ctx.save(); ctx.beginPath(); ctx.rect(j * 320, k * 540, 320, 540); ctx.clip(); C.draw(ctx, id, j * 320 + 160, k * 540 + 300 + S.head.cy * u, u, { view: this.view, expr: e, t, light: this.light }); ctx.restore(); })); return; }
      const ids = this.ids, n = ids.length, u = Number(this.u || 760 / Math.max(...ids.map(i => C.SPECS[i].h)));
      ids.forEach((id, k) => ['front', 'q', 'side'].forEach((v, j) => {
        const x = 170 + (k * 3 + j) * (1700 / (n * 3 - 1 || 1)) * 0.98;
        C.draw(ctx, id, x, 1000, u * 0.95, { view: v, t, pose: this.pose, expr: this.expr, shadow: 0.3, light: this.light });
      }));
    },
    post: { grain: 0.08, vignette: 0.2 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
