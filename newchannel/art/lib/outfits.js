/* Diez Mil Puntos art kit · outfit options for Eli and Mila (Producer 2026-10-29: «Dame opciones de vestimenta para ambos,
   varias alternativas, quisiera un cambio»). INACTIVE switches like C.ELI_HATS: eli1 / mila1 keep their outfits until the
   Producer picks. Each option returns spec overrides (torso colour, arms, legs, boots and the garment layers the biped
   calls: collar, outfit (clipped to the torso), outfitTop (over torso + legs: skirts, coat tails, vests), outfitBack,
   outfitBackTop, backUnder). Units are height units (cast.js); y grows downward, the ground is y = 0.
   Lab: art/scenes/outfit_lab.js · sheets: art/render/build_outfit_sheets.sh. Bodies, heads, eyes and skin never change. */
(function (root) {
  const K = root.K, C = K.cast, h = C.helpers, INK = C.INK;
  const disc = (c, x, y, r) => { c.beginPath(); c.arc(x, y, Math.max(1e-6, r), 0, K.TAU); };
  const clipT = (c, B, fn) => { c.save(); B.torsoPath(c); c.clip(); fn(); c.restore(); };
  const cxOf = (B, k = 0.42) => B.tcx + B.dir * B.s * B.wT * k;           // the garment's front centre line in 3/4 / profile
  const line = (c, B, pts, a = 0.45, w = 1) => { c.strokeStyle = K.rgba(INK, a); c.lineWidth = B.lw * w; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); };
  const fillStroke = (c, B, path, fill, w = 2) => { path(); c.strokeStyle = INK; c.lineWidth = B.lw * w; c.lineJoin = 'round'; c.stroke(); path(); c.fillStyle = fill; c.fill(); };
  const pocket = (c, B, x, y, w, hgt, col, flap) => { c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = B.lw * 1.3; K.rrect(c, x - w, y, w * 2, hgt, 0.004); c.fill(); c.stroke();
    if (flap) { c.fillStyle = flap; K.rrect(c, x - w, y, w * 2, hgt * 0.36, [0.004, 0.004, 0.002, 0.002]); c.fill(); c.stroke(); } };
  const buttons = (c, B, x, y0, y1, n, col = '#e7c25a') => { for (let i = 0; i < n; i++) { const y = K.lerp(y0, y1, n > 1 ? i / (n - 1) : 0.5); c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = B.lw; disc(c, x, y, 0.0055); c.fill(); c.stroke(); } };
  // an open front panel (jacket / overshirt / cardigan / vest) on side sg: from the side seam to just past the centre line
  function panel(c, B, sg, col, o = {}) {
    const s = B.s, d = B.dir, cx = cxOf(B), inner = o.inner ?? 0.3, far = s > 0.25 && sg === -d;
    const xi0 = cx + sg * B.wT * inner * (1 - 0.5 * s), xi1 = cx + sg * B.wB * (inner + (o.flare || 0.06)) * (1 - 0.5 * s), xo = B.tcx + sg * 0.3;
    const yt = B.Ttop - 0.01, yb = B.Tbot + (o.hemDrop || 0) + 0.004, lap = o.lapel ? 0.05 : 0;
    clipT(c, B, () => {
      fillStroke(c, B, () => { c.beginPath(); c.moveTo(xo, yt); c.lineTo(xi0 + sg * lap * 0.5, yt); if (lap) c.lineTo(xi0, yt + lap); c.lineTo(xi1, yb); c.lineTo(xo, yb); c.closePath(); }, col);
      if (o.pattern) { c.save(); c.beginPath(); c.moveTo(xo, yt); c.lineTo(xi0, yt); c.lineTo(xi1, yb); c.lineTo(xo, yb); c.closePath(); c.clip(); o.pattern(c, B); c.restore(); }
    });
    if (o.lapel && !far) fillStroke(c, B, () => { c.beginPath(); c.moveTo(xi0 + sg * lap * 0.5, yt); c.lineTo(xi0, yt + lap); c.lineTo(xi0 + sg * 0.03 * (1 - 0.5 * s), yt + lap * 0.55); c.lineTo(xi0 + sg * 0.035 * (1 - 0.5 * s), yt); c.closePath(); }, K.shade(col, -0.12), 1.4);
    return { xi0, xi1, yt, yb };
  }
  const plaid = (base, dark, light) => (c, B) => { c.fillStyle = base; c.fillRect(B.tcx - 0.3, B.Ttop - 0.05, 0.6, 0.6);
    c.lineWidth = 0.012; c.strokeStyle = K.rgba(dark, 0.42); for (let x = -0.3; x < 0.3; x += 0.034) { c.beginPath(); c.moveTo(B.tcx + x, B.Ttop - 0.05); c.lineTo(B.tcx + x, B.Tbot + 0.3); c.stroke(); }
    for (let y = B.Ttop - 0.05; y < B.Tbot + 0.3; y += 0.034) { c.beginPath(); c.moveTo(B.tcx - 0.3, y); c.lineTo(B.tcx + 0.3, y); c.stroke(); }
    c.lineWidth = 0.003; c.strokeStyle = K.rgba(light, 0.55); for (let x = -0.3; x < 0.3; x += 0.034) { c.beginPath(); c.moveTo(B.tcx + x + 0.013, B.Ttop - 0.05); c.lineTo(B.tcx + x + 0.013, B.Tbot + 0.3); c.stroke(); } };
  // collars
  const crew = (col) => (c, B) => { const w = Math.min(B.hw * 0.86, B.wT * 0.82) * (1 - 0.25 * B.s), y = B.Ttop - 0.004, x = B.hcx + B.dir * B.s * B.hw * 0.25;
    clipT(c, B, () => { c.fillStyle = col; c.beginPath(); c.moveTo(x - w - 0.01, y); c.quadraticCurveTo(x, y + 0.068, x + w + 0.01, y); c.lineTo(x + w + 0.01, y - 0.02); c.lineTo(x - w - 0.01, y - 0.02); c.closePath(); c.fill();
      c.strokeStyle = INK; c.lineWidth = B.lw * 1.4; c.beginPath(); c.moveTo(x - w, y + 0.006); c.quadraticCurveTo(x, y + 0.05, x + w, y + 0.006); c.stroke(); }); };
  const points = (col) => (c, B) => { const x = B.hcx + B.dir * B.s * B.hw * 0.3, w = Math.min(B.hw * 0.9, B.wT * 0.8) * (1 - 0.3 * B.s), y = B.Ttop - 0.006;
    for (const sg of [-1, 1]) { if (B.s > 0.85 && sg === -B.dir) continue; fillStroke(c, B, () => { c.beginPath(); c.moveTo(x + sg * w, y); c.lineTo(x + sg * 0.004, y + 0.03); c.lineTo(x + sg * w * 0.55, y + 0.045); c.lineTo(x + sg * w * 1.08, y + 0.012); c.closePath(); }, col, 1.4); } };
  const turtle = (col) => (c, B) => { const w = Math.min(B.hw * 0.78, B.wT * 0.7) * (1 - 0.2 * B.s), x = B.hcx + B.dir * B.s * B.hw * 0.2, y = B.Ttop;
    fillStroke(c, B, () => K.rrect(c, x - w, y - 0.036, w * 2, 0.05, 0.014), col, 1.6);
    line(c, B, [[x - w * 0.6, y - 0.03], [x - w * 0.6, y + 0.01]], 0.25); line(c, B, [[x, y - 0.03], [x, y + 0.01]], 0.25); line(c, B, [[x + w * 0.6, y - 0.03], [x + w * 0.6, y + 0.01]], 0.25); };
  const hoodRoll = (col) => (c, B) => { const w = Math.min(B.hw * 1.15, B.wT * 0.95) * (1 - 0.2 * B.s), x = B.hcx + B.dir * B.s * B.hw * 0.1, y = B.Ttop;
    fillStroke(c, B, () => { c.beginPath(); c.moveTo(x - w, y + 0.01); c.quadraticCurveTo(x - w * 1.05, y - 0.04, x - w * 0.55, y - 0.035); c.quadraticCurveTo(x, y + 0.03, x + w * 0.55, y - 0.035); c.quadraticCurveTo(x + w * 1.05, y - 0.04, x + w, y + 0.01); c.quadraticCurveTo(x, y + 0.06, x - w, y + 0.01); c.closePath(); }, col, 1.6); };
  // a skirt / coat tail hanging from the waist (outfitTop + outfitBackTop): sways, rides up when seated
  const tail = (col, len, flare, o = {}) => (c, B) => {
    const s = B.s, sway = Math.sin(B.t * 1.9 + 0.7) * 0.006 - B.drag * 0.02 * B.dir, cx = B.tcx + B.dir * s * B.wB * 0.2;
    const y0 = B.Tbot - (o.up || 0.015), L = B.seated ? Math.min(len, 0.07) : len - (B.crouch || 0) * 0.6, w0 = B.wB * (1.04 - 0.05 * s), w1 = w0 + flare * (1 - 0.35 * s);
    fillStroke(c, B, () => { c.beginPath(); c.moveTo(cx - w0, y0); c.lineTo(cx + w0, y0); c.lineTo(cx + w1 + sway, y0 + L); c.quadraticCurveTo(cx + sway, y0 + L + 0.012, cx - w1 + sway, y0 + L); c.closePath(); }, col);
    if (o.split && !B.back) line(c, B, [[cxOf(B, 0.3), y0 + 0.01], [cxOf(B, 0.3) + sway, y0 + L]], 0.55, 1.2);
    if (o.pleats) for (const k of [-0.5, 0, 0.5]) line(c, B, [[cx + k * w0, y0 + 0.02], [cx + k * w1 + sway, y0 + L - 0.004]], 0.22);
    if (o.belt) { c.fillStyle = o.belt; c.strokeStyle = INK; c.lineWidth = B.lw * 1.3; K.rrect(c, cx - w0 - 0.004, y0 - 0.012, (w0 + 0.004) * 2, 0.02, 0.006); c.fill(); c.stroke(); }
  };
  const hemBand = (col, stripe) => (c, B) => clipT(c, B, () => { c.fillStyle = col; c.fillRect(B.tcx - 0.3, B.Tbot - 0.028, 0.6, 0.04);
    if (stripe) { c.fillStyle = stripe; c.fillRect(B.tcx - 0.3, B.Tbot - 0.02, 0.6, 0.006); }
    line(c, B, [[B.tcx - 0.3, B.Tbot - 0.028], [B.tcx + 0.3, B.Tbot - 0.028]], 0.6, 1.2); });
  const zip = (c, B, y0, y1, k = 0.42) => { const x = cxOf(B, k); line(c, B, [[x, y0], [x, y1]], 0.6, 1.2); c.fillStyle = '#c9ccd4'; c.strokeStyle = INK; c.lineWidth = B.lw; K.rrect(c, x - 0.004, y0, 0.008, 0.014, 0.002); c.fill(); c.stroke(); };
  const all = (...fns) => (c, B) => { for (const f of fns) if (f) f(c, B); };
  const NO = { collar: null, outfit: null, outfitTop: null, outfitBack: null, outfitBackTop: null, backUnder: null, legStripe: null, sock: null, flare: 0 };

  // ================================================================ ELI (signature yellow; head option 2, short curls, on the sheets)
  const Y = '#f2c230', YD = '#cf9d1f', JEANS = '#3f5f96', BOOT = { h: 0.077, w: 0.042, foot: 0.062, toe: 0.05, back: 0.014, sole: 0.016, color: '#2b2729', soleColor: '#151214', laces: true };
  const ELI = {
    1: { name: 'playera + delantal (actual)', cost: 'existe', spec: () => ({}) },
    2: { name: 'overol de mecánico, mangas arremangadas', cost: 'nuevo: collar, outfit (cierre, bolsillo, cinturón), espalda; brazos y piernas por parámetros',
      spec: () => { const COV = '#d9a830', COVD = '#a87c1c'; return Object.assign({}, NO, { torso: { color: COV }, legColor: COV, boot: Object.assign({}, BOOT, { color: '#3a2a22' }),
        arm: { skinPart: true, sleeve: COV, sleeveTo: 0.42, sleeveW: 0.058, sleeveBand: COVD },
        collar: points(COVD),
        outfit: (c, B) => { zip(c, B, B.Ttop + 0.03, B.Tbot + 0.05); if (!(B.s > 0.85)) pocket(c, B, cxOf(B) - B.dir * 0.03 * (1 - B.s) - 0.03 * (1 - B.s), B.Ttop + 0.05, 0.02 * (1 - 0.4 * B.s), 0.03, COVD, COV);
          c.fillStyle = '#5a3a24'; c.fillRect(B.tcx - 0.3, B.Tbot - 0.035, 0.6, 0.018); line(c, B, [[B.tcx - 0.3, B.Tbot - 0.035], [B.tcx + 0.3, B.Tbot - 0.035]], 0.6);
          c.fillStyle = '#c9ccd4'; c.strokeStyle = INK; c.lineWidth = B.lw; K.rrect(c, cxOf(B) - 0.012, B.Tbot - 0.038, 0.024, 0.024, 0.004); c.fill(); c.stroke(); },
        outfitBack: (c, B) => { line(c, B, [[B.tcx - 0.3, B.Ttop + 0.05], [B.tcx + 0.3, B.Ttop + 0.05]], 0.4); c.fillStyle = '#5a3a24'; c.fillRect(B.tcx - 0.3, B.Tbot - 0.035, 0.6, 0.018); } }); } },
    3: { name: 'camisa de franela abierta + playera + cargo', cost: 'nuevo: paneles abiertos con cuadros, espalda a cuadros; pantalón por parámetro',
      spec: () => { const PL = '#e8b830', PLD = '#7a4a1a'; return Object.assign({}, NO, { torso: { color: '#f1ede2' }, legColor: '#6f6a48', legStripe: '#55513a', boot: Object.assign({}, BOOT, { color: '#5a3a26' }),
        arm: { skinPart: false, sleeve: PL, cuff: '#b8862a' },
        collar: crew('#dcd5c6'),
        outfitTop: (c, B) => { for (const sg of [-1, 1]) panel(c, B, sg, PL, { inner: 0.34, flare: 0.1, pattern: plaid(PL, PLD, '#fff0b0') }); },
        outfitBack: plaid(PL, PLD, '#fff0b0') }); } },
    4: { name: 'chaqueta universitaria + jeans', cost: 'nuevo: puños y bajo de punto a rayas, parche «E», broches; mangas amarillas por parámetro',
      spec: () => { const NAVY = '#2f3a66'; return Object.assign({}, NO, { torso: { color: NAVY }, legColor: JEANS, boot: BOOT,
        arm: { skinPart: false, sleeve: Y, cuff: NAVY, stripe: Y },
        collar: (c, B) => { crew(NAVY)(c, B); const x = B.hcx + B.dir * B.s * B.hw * 0.25, w = Math.min(B.hw * 0.86, B.wT * 0.82) * (1 - 0.25 * B.s); clipT(c, B, () => { c.strokeStyle = Y; c.lineWidth = 0.005; c.beginPath(); c.moveTo(x - w, B.Ttop + 0.004); c.quadraticCurveTo(x, B.Ttop + 0.05, x + w, B.Ttop + 0.004); c.stroke(); }); },
        outfit: all(hemBand(NAVY, Y), (c, B) => { buttons(c, B, cxOf(B), B.Ttop + 0.05, B.Tbot - 0.05, 4, '#e8e2d2'); line(c, B, [[cxOf(B), B.Ttop + 0.03], [cxOf(B), B.Tbot]], 0.5);
          if (B.s < 0.85) { const px = cxOf(B) - (0.045 + 0.01 * (1 - B.s)) * (B.dir || 1) * (B.s > 0.25 ? -1 : 1) * (B.s > 0.25 ? 1 : 1) - 0.0, py = B.Ttop + 0.08; const x = B.s > 0.25 ? cxOf(B) + B.dir * 0.03 : cxOf(B) - 0.045;
            c.font = `800 ${0.05}px "Martian Mono"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 0.008; c.strokeStyle = INK; c.strokeText('E', x, py); c.fillStyle = Y; c.fillText('E', x, py); void px; } }),
        outfitBack: all(hemBand(NAVY, Y), (c, B) => { c.font = `800 ${0.045}px "Martian Mono"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 0.007; c.strokeStyle = INK; c.strokeText('TALLER', B.tcx, B.Ttop + 0.09); c.fillStyle = Y; c.fillText('TALLER', B.tcx, B.Ttop + 0.09); }) }); } },
    5: { name: 'sudadera con capucha + pantalón de trabajo', cost: 'nuevo: capucha (cuello + espalda), bolsillo canguro, cordones que se mecen',
      spec: () => { const HO = '#f0be2e', HOD = '#c99a1c'; return Object.assign({}, NO, { torso: { color: HO }, legColor: '#4a4a55', boot: Object.assign({}, BOOT, { color: '#2b2729' }),
        arm: { skinPart: false, sleeve: HO, cuff: HOD },
        collar: hoodRoll(HOD),
        outfit: all(hemBand(HOD), (c, B) => { const x = cxOf(B, 0.4), w = 0.07 * (1 - 0.45 * B.s); if (B.s < 0.9) fillStroke(c, B, () => { c.beginPath(); c.moveTo(x - w, B.Tbot - 0.028); c.lineTo(x - w * 0.75, B.Tbot - 0.09); c.lineTo(x + w * 0.75, B.Tbot - 0.09); c.lineTo(x + w, B.Tbot - 0.028); c.closePath(); }, HOD, 1.3); }),
        outfitTop: (c, B) => { if (B.s > 0.85) return; const x = cxOf(B, 0.3), sw = Math.sin(B.t * 2.2) * 0.004; for (const sg of [-1, 1]) { const x0 = x + sg * 0.018 * (1 - 0.5 * B.s); c.strokeStyle = INK; c.lineWidth = B.lw * 2.6; c.beginPath(); c.moveTo(x0, B.Ttop + 0.005); c.quadraticCurveTo(x0 + sw, B.Ttop + 0.04, x0 + sw * 1.5, B.Ttop + 0.07); c.stroke(); c.strokeStyle = '#f1ede2'; c.lineWidth = B.lw * 1.2; c.stroke(); } },
        outfitBackTop: (c, B) => fillStroke(c, B, () => { const w = B.wT * 0.62; c.beginPath(); c.moveTo(B.tcx - w, B.Ttop - 0.01); c.quadraticCurveTo(B.tcx - w * 1.05, B.Ttop + 0.09, B.tcx, B.Ttop + 0.11); c.quadraticCurveTo(B.tcx + w * 1.05, B.Ttop + 0.09, B.tcx + w, B.Ttop - 0.01); c.closePath(); }, HOD, 1.6) }); } },
    6: { name: 'camisa manga corta + chaleco utilitario', cost: 'nuevo: chaleco (2 paneles, 4 bolsillos, espalda), cuello de camisa; camisa por parámetro',
      spec: () => { const SH = '#a9c6de', VE = '#e3b23a', VED = '#b8892a'; return Object.assign({}, NO, { torso: { color: SH }, legColor: '#3d3a4a', boot: Object.assign({}, BOOT, { color: '#5a3a26' }),
        arm: { skinPart: true, sleeve: SH, sleeveTo: 0.36, sleeveW: 0.058, sleeveBand: '#8fb0cc' },
        collar: points('#c6dbea'),
        outfit: (c, B) => buttons(c, B, cxOf(B), B.Ttop + 0.05, B.Tbot - 0.03, 3, '#f6f2ea'),
        outfitTop: (c, B) => { for (const sg of [-1, 1]) { const p = panel(c, B, sg, VE, { inner: 0.28, flare: 0.05, hemDrop: 0.012 }); if (!p) continue; const far = B.s > 0.25 && sg === -B.dir;
            if (!far || B.s < 0.5) { const px = K.lerp(p.xi0, B.tcx + sg * B.wT * 0.9 * (1 - 0.4 * B.s), 0.5), w = 0.017 * (1 - 0.4 * B.s); pocket(c, B, px, B.Ttop + 0.06, w, 0.03, VED, VE); pocket(c, B, px, B.Tbot - 0.07, w * 1.2, 0.045, VED, VE); } } },
        outfitBack: (c, B) => { c.fillStyle = VE; c.fillRect(B.tcx - 0.3, B.Ttop - 0.05, 0.6, 0.6); line(c, B, [[B.tcx, B.Ttop], [B.tcx, B.Tbot]], 0.3); } }); } },
  };

  // ================================================================ MILA (signature purple)
  const PU = '#7158b8', PUD = '#5a4596', MU = '#c99633', GREEN = '#2f6b45';
  const MILA = {
    1: { name: 'suéter morado + overol mostaza (actual)', cost: 'existe', spec: () => ({}) },
    2: { name: 'chaqueta de mezclilla + playera a rayas + falda sobre leggings', cost: 'nuevo: rayas, paneles de mezclilla, falda (frente y espalda, se mece)',
      spec: () => { const DEN = '#4d6ea6'; const sk = tail(PU, 0.12, 0.035, { pleats: 1 }); return Object.assign({}, NO, { torso: { color: '#f1ede2' }, legColor: '#3d2f63', boot: Object.assign({}, C.SPECS.mila1.boot),
        arm: { sleeve: DEN, cuff: '#6f8cc0' },
        collar: crew('#e3ddd0'),
        outfit: (c, B) => { c.fillStyle = K.rgba(PU, 0.85); for (let y = B.Ttop + 0.02; y < B.Tbot; y += 0.03) c.fillRect(B.tcx - 0.3, y, 0.6, 0.011); },
        outfitTop: (c, B) => { sk(c, B); for (const sg of [-1, 1]) { const p = panel(c, B, sg, DEN, { inner: 0.36, flare: 0.08, lapel: 1 }); void p; } },
        outfitBack: (c, B) => { c.fillStyle = DEN; c.fillRect(B.tcx - 0.3, B.Ttop - 0.05, 0.6, 0.6); line(c, B, [[B.tcx - 0.3, B.Ttop + 0.06], [B.tcx + 0.3, B.Ttop + 0.06]], 0.4); },
        outfitBackTop: sk }); } },
    3: { name: 'mono utilitario morado + cinturón mostaza', cost: 'nuevo: cierre, 2 bolsillos de pecho, cinturón; mangas arremangadas por parámetro',
      spec: () => Object.assign({}, NO, { torso: { color: PU }, legColor: PU, boot: Object.assign({}, C.SPECS.mila1.boot),
        arm: { sleeve: PU, cuff: PUD, upperColor: null },
        collar: points(PUD),
        outfit: (c, B) => { zip(c, B, B.Ttop + 0.03, B.Tbot + 0.05); if (B.s < 0.85) for (const sg of [-1, 1]) { if (B.s > 0.3 && sg === -B.dir) continue; pocket(c, B, cxOf(B) + sg * 0.03 * (1 - 0.45 * B.s), B.Ttop + 0.055, 0.016 * (1 - 0.4 * B.s), 0.032, PUD, PU); }
          c.fillStyle = MU; c.fillRect(B.tcx - 0.3, B.Tbot - 0.03, 0.6, 0.02); line(c, B, [[B.tcx - 0.3, B.Tbot - 0.03], [B.tcx + 0.3, B.Tbot - 0.03]], 0.6); line(c, B, [[B.tcx - 0.3, B.Tbot - 0.01], [B.tcx + 0.3, B.Tbot - 0.01]], 0.6);
          c.fillStyle = '#e7c25a'; c.strokeStyle = INK; c.lineWidth = B.lw; K.rrect(c, cxOf(B) - 0.012, B.Tbot - 0.034, 0.024, 0.028, 0.004); c.fill(); c.stroke(); },
        outfitBack: (c, B) => { c.fillStyle = MU; c.fillRect(B.tcx - 0.3, B.Tbot - 0.03, 0.6, 0.02); line(c, B, [[B.tcx - 0.3, B.Ttop + 0.05], [B.tcx + 0.3, B.Ttop + 0.05]], 0.35); } }) },
    4: { name: 'cárdigan morado + cuello alto crema + pantalón ancho mostaza', cost: 'nuevo: cuello alto, paneles de cárdigan con botones y bolsillos; pantalón ancho = flare existente',
      spec: () => { const CA = '#6a4fb0'; return Object.assign({}, NO, { torso: { color: '#efe4cf' }, legColor: MU, flare: 0.55, boot: Object.assign({}, C.SPECS.mila1.boot, { h: 0.06, color: '#5a3a2a', lip: false }),
        arm: { sleeve: CA, cuff: PUD },
        collar: turtle('#e6d8bd'),
        outfitTop: (c, B) => { for (const sg of [-1, 1]) { const p = panel(c, B, sg, CA, { inner: 0.32, flare: 0.08, hemDrop: 0.03 }); if (!p) continue; const far = B.s > 0.25 && sg === -B.dir;
            if (!far) { buttons(c, B, p.xi0 + sg * 0.008, B.Ttop + 0.04, B.Tbot - 0.02, sg === 1 ? 4 : 0, '#e8dcc0'); if (B.s < 0.6) pocket(c, B, K.lerp(p.xi1, B.tcx + sg * B.wB * 0.9, 0.5), B.Tbot - 0.05, 0.016, 0.03, PUD); } } },
        outfitBack: (c, B) => { c.fillStyle = CA; c.fillRect(B.tcx - 0.3, B.Ttop - 0.05, 0.6, 0.6); for (let x = -0.3; x < 0.3; x += 0.02) line(c, B, [[B.tcx + x, B.Tbot - 0.025], [B.tcx + x, B.Tbot]], 0.2); } }); } },
    5: { name: 'impermeable largo morado + botas de lluvia', cost: 'nuevo: faldón largo con cinturón, botones de palanca, capucha caída, brillo de impermeable',
      spec: () => { const RC = '#5f4aa8', RCD = '#47378a'; const coat = tail(RC, 0.17, 0.05, { split: 1, belt: RCD }); return Object.assign({}, NO, { torso: { color: RC }, legColor: '#2e2b3a', boot: Object.assign({}, C.SPECS.mila1.boot, { color: '#e3b23a', h: 0.15 }),
        arm: { sleeve: RC, cuff: RCD },
        collar: hoodRoll(RCD),
        outfit: (c, B) => { const x = cxOf(B); line(c, B, [[x, B.Ttop + 0.03], [x, B.Tbot]], 0.5); for (let i = 0; i < 3; i++) { const y = B.Ttop + 0.06 + i * 0.05; c.fillStyle = '#e8dcc0'; c.strokeStyle = INK; c.lineWidth = B.lw; K.rrect(c, x - 0.014, y - 0.005, 0.028, 0.01, 0.005); c.fill(); c.stroke(); }
          c.strokeStyle = K.rgba('#ffffff', 0.35); c.lineWidth = 0.008; c.beginPath(); c.moveTo(B.tcx - B.dir * 0.03 - 0.03, B.Ttop + 0.04); c.lineTo(B.tcx - B.dir * 0.03 - 0.045, B.Tbot - 0.02); c.stroke(); },
        outfitTop: coat, outfitBackTop: coat,
        outfitBack: (c, B) => fillStroke(c, B, () => { const w = B.wT * 0.62; c.beginPath(); c.moveTo(B.tcx - w, B.Ttop - 0.01); c.quadraticCurveTo(B.tcx - w * 1.05, B.Ttop + 0.09, B.tcx, B.Ttop + 0.11); c.quadraticCurveTo(B.tcx + w * 1.05, B.Ttop + 0.09, B.tcx + w, B.Ttop - 0.01); c.closePath(); }, RCD, 1.6) }); } },
    6: { name: 'rompevientos bicolor + joggers + tenis', cost: 'nuevo: bloque de color diagonal con vivo blanco, cuello alto, raya en manga y pierna (parámetros existentes), tenis',
      spec: () => { const TE = '#2f8f86'; return Object.assign({}, NO, { torso: { color: PU }, legColor: '#3b3a46', legStripe: '#f1ede2',
        boot: { h: 0.05, w: 0.036, foot: 0.05, toe: 0.05, back: 0.012, sole: 0.014, color: '#f1ede2', soleColor: '#c9c4b8', laces: true, laceColor: '#7158b8' },
        arm: { sleeve: PU, cuff: TE, stripe: '#f1ede2' },
        collar: turtle(PUD),
        outfit: (c, B) => { fillStroke(c, B, () => { c.beginPath(); c.moveTo(B.tcx - 0.3, B.Ttop + 0.15); c.lineTo(B.tcx + 0.3, B.Ttop + 0.06); c.lineTo(B.tcx + 0.3, B.Tbot + 0.1); c.lineTo(B.tcx - 0.3, B.Tbot + 0.1); c.closePath(); }, TE, 1.4);
          c.strokeStyle = '#f1ede2'; c.lineWidth = 0.006; c.beginPath(); c.moveTo(B.tcx - 0.3, B.Ttop + 0.147); c.lineTo(B.tcx + 0.3, B.Ttop + 0.057); c.stroke(); zip(c, B, B.Ttop + 0.02, B.Tbot); hemBand(TE)(c, B); },
        outfitBack: (c, B) => { c.fillStyle = TE; c.beginPath(); c.moveTo(B.tcx - 0.3, B.Ttop + 0.15); c.lineTo(B.tcx + 0.3, B.Ttop + 0.06); c.lineTo(B.tcx + 0.3, B.Tbot + 0.1); c.lineTo(B.tcx - 0.3, B.Tbot + 0.1); c.closePath(); c.fill(); } }); } },
  };

  C.OUTFITS = { eli: ELI, mila: MILA,
    pairs: [ { name: 'Taller', why: 'overol + mono: los dos en ropa de trabajo, amarillo / morado en bloques grandes que se leen desde lejos', eli: 2, mila: 3 },
      { name: 'Fin de semana', why: 'franela a cuadros + mezclilla: cálido y cotidiano, buena textura en el atardecer', eli: 3, mila: 2 },
      { name: 'Otoño', why: 'universitaria azul/amarillo + cárdigan morado: contraste frío/cálido que aguanta la noche', eli: 4, mila: 4 },
      { name: 'Lluvia', why: 'sudadera amarilla + impermeable morado: siluetas redondas, colores planos que brillan con las luces de freno', eli: 5, mila: 5 } ],
    // build a spec id for (who, n); Eli wears head option 2 (short curls) on the sheets so the headwear stays its own choice
    variant(who, n, head = who === 'eli' ? 2 : 0) {
      const id = `${who}Outfit${n}h${head}`; if (C.SPECS[id]) return id;
      const base = C.SPECS[who === 'eli' ? 'eli1' : 'mila1'], o = (who === 'eli' ? ELI : MILA)[n].spec(base);
      const spec = Object.assign({}, base, o, { torso: Object.assign({}, base.torso, o.torso || {}), arm: Object.assign({}, base.arm, o.arm || {}), boot: o.boot || base.boot });
      if (head && C.ELI_HATS && C.ELI_HATS[head]) { const L = C.ELI_HATS[head].layers(); Object.assign(spec, { hat: L.hat || null, hairBack: L.hairBack || null, hairFront: L.hairFront || null, backHair: L.backHair || null, extraK: L.extraK || base.extraK }); }
      C.define(id, spec); return id;
    } };
})(typeof window !== 'undefined' ? window : globalThis);
