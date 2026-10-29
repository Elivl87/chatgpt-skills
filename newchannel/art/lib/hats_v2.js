/* Diez Mil Puntos art kit · Eli headwear, round 2 (Producer 2026-10-29: «dame más opciones o mejóralos. Una de las opciones
   que sea con la gorra roja como la de los Yankees de Nueva York, volteada con la visera para atrás»). INACTIVE (C.ELI_HATS_V2):
   eli1 keeps the beanie until the Producer picks. No team logo / monogram anywhere (third-party IP, channel rule).
   Every option follows the Guardian rules of round 1 (C.HAT_KIT from cast_alts.js): the lift keeps the brows on skin, no edge
   crosses the eyes, front / 3/4 / profile / back are all drawn, bob on t and squash on H.hatHit. */
(function (root) {
  const K = root.K, C = K.cast, h = C.helpers, INK = C.INK, T = C.HAT_KIT;
  const { shortHair, hatLift, hatFrame, curlsBack, curlsFront, goggles, lobedShape, backX, ELI_HAIR } = T;

  // 1 · backwards baseball cap: structured six-panel crown, top button, the snapback opening + strap over the forehead, the visor
  // out the back (hanging toward us in the back view, where the front panel and its optional embroidered «E» show)
  const capRev = (col, dark, o = {}) => (c, H) => {
    const hw = H.hw, hh = H.hh, band = -hh + 0.05, lift = hatLift(H, band + 0.008);
    shortHair(c, H, 0.058);
    hatFrame(c, H, band, lift, 0.7);
    const fs = H.fs, bk = -H.faceDir, off = H.faceDir * fs * hw * 0.3;
    const crown = () => { c.beginPath(); c.moveTo(-hw * 1.08, band + 0.006); c.bezierCurveTo(-hw * 1.14, -hh - 0.05, hw * 1.14, -hh - 0.05, hw * 1.08, band + 0.006); c.closePath(); };
    if (fs > 0.15 && !H.back) { const bx = bk * hw * (0.92 + 0.18 * fs), L = 0.075 * fs;   // the visor, out the back of the head
      h.shape(c, () => { c.beginPath(); c.ellipse(bx + bk * L * 0.62, band + 0.004, L, 0.012, bk * -0.1, 0, K.TAU); }, dark, H.lw);
      c.strokeStyle = K.rgba('#ffffff', 0.25); c.lineWidth = H.lw; c.beginPath(); c.ellipse(bx + bk * L * 0.62, band + 0.002, L * 0.8, 0.006, bk * -0.1, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    h.shape(c, crown, col, H.lw);
    c.save(); crown(); c.clip();
    c.strokeStyle = K.rgba(dark, 0.95); c.lineWidth = H.lw * 1.1;   // panel seams converge on the button
    for (const k of [-0.75, -0.3, 0.3, 0.75]) { c.beginPath(); c.moveTo(k * hw + off, band + 0.004); c.quadraticCurveTo(k * hw * 0.75 + off, -hh - 0.008, off * 0.5, -hh - 0.024); c.stroke(); }
    c.fillStyle = K.rgba('#ffffff', 0.18); c.beginPath(); c.ellipse(-H.faceDir * hw * 0.35 - hw * 0.2 * (1 - fs), -hh - 0.016, hw * 0.35, 0.012, -0.3, 0, K.TAU); c.fill();   // soft sheen on the lit side
    c.fillStyle = K.rgba(dark, 0.9); c.fillRect(-hw * 1.3, band - 0.004, hw * 2.6, 0.01);   // the sweatband rim
    c.restore();
    if (!H.back && fs < 0.75) {   // the snapback opening over the forehead: hair shows through, the strap crosses its foot
      const ox = H.faceDir * fs * hw * 0.35, w = 0.03 * (1 - 0.4 * fs);
      h.shape(c, () => { c.beginPath(); c.moveTo(ox - w, band + 0.006); c.quadraticCurveTo(ox, band - 0.036, ox + w, band + 0.006); c.closePath(); }, ELI_HAIR, H.lw);
      h.shape(c, () => K.rrect(c, ox - w * 1.05, band - 0.004, w * 2.1, 0.009, 0.003), o.strap || dark, H.lw);
      c.fillStyle = K.rgba(INK, 0.7); for (const k of [-0.5, 0, 0.5]) { c.beginPath(); c.arc(ox + k * w, band + 0.0005, 0.0018, 0, K.TAU); c.fill(); } }
    if (H.back) {   // the visor points at us; above it the front panel (with the optional embroidered mark)
      if (o.emblem) { c.font = `800 ${0.036}px "Martian Mono"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = H.lw * 1.2; c.strokeStyle = K.rgba(INK, 0.8); c.strokeText(o.emblem, 0, band - 0.03); c.fillStyle = o.emblemCol || '#f3ecdd'; c.fillText(o.emblem, 0, band - 0.03); }
      h.shape(c, () => { c.beginPath(); c.moveTo(-hw * 0.95, band + 0.004); c.ellipse(0, band + 0.004, hw * 0.95, 0.036, 0, Math.PI, 0, true); c.closePath(); }, dark, H.lw);
      c.strokeStyle = K.rgba(INK, 0.35); c.lineWidth = H.lw; c.beginPath(); c.ellipse(0, band + 0.004, hw * 0.8, 0.026, 0, 0.15, Math.PI - 0.15); c.stroke(); }
    else if (o.emblem && fs > 0.55) {   // 3/4-profile: the mark peeks on the front panel at the back of the head
      c.font = `800 ${0.028}px "Martian Mono"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = H.lw; c.strokeStyle = K.rgba(INK, 0.8); const ex = bk * hw * 0.78;
      c.strokeText(o.emblem, ex, band - 0.026); c.fillStyle = o.emblemCol || '#f3ecdd'; c.fillText(o.emblem, ex, band - 0.026); }
    // top button, sitting ON the crown top (-hh - 0.0235), cloth-coloured (Guardian 2026-10-29: it floated 0.016 above the crown
    // on a stalk of outline + rim light and read as a «?» swirl at 1080p)
    c.fillStyle = K.shade(col, -0.06); c.strokeStyle = INK; c.lineWidth = H.lw; c.beginPath(); c.ellipse(off * 0.5, -hh - 0.026, 0.011, 0.006, 0, 0, K.TAU); c.fill(); c.stroke();
    c.restore();
  };

  // 4 · slouchy beanie, redesigned: a tall cuff sitting HIGH on the head (the brows can never reach it), the knit slouching back
  function slouch(c, H) {
    const hw = H.hw, hh = H.hh, cuffY = -hh + 0.022, cuffH = 0.034, lift = hatLift(H, cuffY + cuffH, 0.08), col = '#f2c230', dark = '#cf9d1f';
    shortHair(c, H, 0.06);
    hatFrame(c, H, cuffY + cuffH, lift);
    const bk = H.back ? 0 : -H.faceDir * H.fs, sw = Math.sin(H.t * 2.3) * 0.004 + H.drag * -0.015 * H.dir;
    const dome = () => { c.beginPath(); c.moveTo(-hw * 1.06, cuffY + 0.004); c.bezierCurveTo(-hw * 1.15 + bk * 0.03, -hh - 0.075, hw * 0.6 + bk * 0.07 + sw, -hh - 0.1, hw * 1.06 + bk * 0.05 + sw, cuffY - 0.01);
      c.quadraticCurveTo(hw * 1.1, cuffY + 0.004, hw * 1.06, cuffY + 0.004); c.closePath(); };
    h.shape(c, dome, col, H.lw);
    c.save(); dome(); c.clip(); c.strokeStyle = K.rgba(dark, 0.75); c.lineWidth = H.lw * 1.1;
    for (let i = -3; i <= 4; i++) { const x = i * hw * 0.3 + H.faceDir * H.fs * hw * 0.2; c.beginPath(); c.moveTo(x, cuffY); c.quadraticCurveTo(x + bk * 0.02, -hh - 0.04, x * 0.6 + bk * 0.05, -hh - 0.09); c.stroke(); }
    c.restore();
    const cuff = () => K.rrect(c, -hw * 1.13, cuffY, hw * 2.26, cuffH, 0.014);
    h.shape(c, cuff, K.shade(col, 0.04), H.lw);
    c.save(); cuff(); c.clip(); c.strokeStyle = K.rgba(dark, 0.75); c.lineWidth = H.lw * 1.1; for (let i = -5; i <= 5; i++) { const x = i * hw * 0.2 + H.faceDir * H.fs * hw * 0.2; c.beginPath(); c.moveTo(x, cuffY + 0.007); c.lineTo(x, cuffY + cuffH - 0.007); c.stroke(); }
    c.strokeStyle = K.rgba('#fff3c4', 0.6); c.lineWidth = H.lw; c.beginPath(); c.moveTo(-hw, cuffY + 0.004); c.lineTo(hw, cuffY + 0.004); c.stroke(); c.restore();
    c.restore();
  }

  // 5 · short curls + a yellow pencil tucked behind Eli's RIGHT ear (workshop habit). The ear never changes: screen-left in the
  // front-ish views, screen-right from the back. Guardian 2026-10-29: in front view it was drawn over the face edge at eye
  // height (touching the right eye) and on the other ear than in 3/4 / profile / back. Now: where that ear is at the silhouette
  // (front) or on the far side (turned to screen-left) the pencil goes BEHIND the head (hairBack layer) and only the eraser
  // end shows past the hair; where the ear faces us (turned to screen-right, back views) it lies on the side of the head.
  function pencil(c, H, behind) {
    const front = !H.back && H.fs < 0.2, near = H.back || (!front && H.faceDir > 0);
    if (behind === near) return;
    const hw = H.hw, side = H.back ? 1 : -1, x0 = side * hw * (front ? 0.92 : 1.0), y0 = front ? -0.006 : 0.008;
    const ang = side * 0.42, L = 0.085, w = 0.009, dx = Math.sin(ang) * L, dy = -Math.cos(ang) * L;
    c.save(); c.translate(x0, y0); c.lineCap = 'butt';
    const seg = (a, b, col, ww) => { c.strokeStyle = INK; c.lineWidth = ww + H.lw * 2; c.beginPath(); c.moveTo(dx * a, dy * a); c.lineTo(dx * b, dy * b); c.stroke(); c.strokeStyle = col; c.lineWidth = ww; c.stroke(); };
    seg(-0.15, 0.82, '#f2c230', w * 2); seg(0.82, 0.9, '#c9ccd4', w * 2); seg(0.9, 1.02, '#ff9a8a', w * 2);   // body, ferrule, eraser
    c.fillStyle = '#e9c9a0'; c.strokeStyle = INK; c.lineWidth = H.lw; c.beginPath(); c.moveTo(-dx * 0.15 - Math.cos(ang) * w, -dy * 0.15 - Math.sin(ang) * w); c.lineTo(-dx * 0.32, -dy * 0.32); c.lineTo(-dx * 0.15 + Math.cos(ang) * w, -dy * 0.15 + Math.sin(ang) * w); c.closePath(); c.fill(); c.stroke();
    c.restore();
  }
  // 6 · flat cap (ivy), redesigned: a low wedge, flat on top and sloping forward over a short snapped brim; mustard herringbone
  function ivy(c, H) {
    const hw = H.hw, hh = H.hh, band = -hh + 0.056, lift = hatLift(H, band + 0.014), col = '#c9a23a', dark = '#8f6f1c';
    shortHair(c, H, 0.062);
    hatFrame(c, H, band, lift, 0.8);
    const fs = H.back ? 0 : H.fs, fd = H.faceDir, bkx = -fd * hw * (1.04 + 0.04 * fs), frx = fd * hw * (1.06 + 0.32 * fs);
    const crown = () => { c.beginPath(); c.moveTo(H.back ? -hw * 1.08 : Math.min(bkx, frx), band + 0.004);
      if (fs > 0.2) { const top = -hh - 0.012; c.lineTo(bkx, band + 0.004); c.quadraticCurveTo(bkx * 1.02, top - 0.006, bkx * 0.3, top - 0.008); c.lineTo(frx * 0.7, top + 0.016); c.quadraticCurveTo(frx * 1.05, band - 0.012, frx, band - 0.002); c.closePath(); }
      else { c.bezierCurveTo(-hw * 1.2, -hh - 0.03, hw * 1.2, -hh - 0.03, hw * 1.08, band + 0.004); c.closePath(); } };
    h.shape(c, crown, col, H.lw);
    c.save(); crown(); c.clip(); c.strokeStyle = K.rgba(dark, 0.45); c.lineWidth = H.lw * 0.9;   // herringbone
    for (let x = -hw * 1.6; x < hw * 1.6; x += 0.016) for (let y = -hh - 0.06; y < band + 0.01; y += 0.012) { const d = ((Math.round(x / 0.016)) % 2 ? 1 : -1) * 0.005; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 0.008, y + d); c.stroke(); }
    c.restore();
    if (!H.back) { const bx = fs > 0.2 ? frx : fd * fs * hw * 0.3, L = fs > 0.2 ? 0.034 + 0.02 * fs : hw * 0.95;   // the brim
      h.shape(c, () => { c.beginPath(); c.ellipse(bx + (fs > 0.2 ? fd * L * 0.4 : 0), band + 0.006, L, 0.01, 0, 0, K.TAU); }, dark, H.lw);
      c.fillStyle = dark; c.strokeStyle = INK; c.lineWidth = H.lw; c.beginPath(); c.arc(fs > 0.2 ? frx * 0.72 : fd * fs * hw * 0.3, band - 0.012 - (fs > 0.2 ? 0.01 : 0), 0.0055, 0, K.TAU); c.fill(); c.stroke(); }
    c.restore();
  }

  const RED = '#c4243a', RED_D = '#8b1a2a', RED_C = '#d8233a', RED_CD = '#9a1328', Y = '#f2c230', YD = '#cf9d1f';
  C.ELI_HATS_V2 = {
    '1a': { name: 'gorra roja al revés (lisa)', cost: 'nuevo (gorra estructurada de 6 paneles, cierre trasero a la vista)', layers: () => ({ extraK: 1.5, hat: capRev(RED, RED_D) }) },
    '1b': { name: 'gorra roja al revés con «E» bordada', cost: 'igual que 1a + bordado', layers: () => ({ extraK: 1.5, hat: capRev(RED, RED_D, { emblem: 'E' }) }) },
    '1c': { name: 'gorra roja más fría y brillante (se separa mejor del vinotinto)', cost: 'igual que 1a', layers: () => ({ extraK: 1.5, hat: capRev(RED_C, RED_CD, { emblem: 'E' }) }) },
    2: { name: 'gorra amarilla al revés (mejorada)', cost: 'nuevo, misma función que 1', layers: () => ({ extraK: 1.5, hat: capRev(Y, YD, { strap: '#8a6512' }) }) },
    3: { name: 'rizos + gafas de taller (pulida)', cost: 'existe (ronda 1, pasada por el Guardián)', layers: () => ({ extraK: 1.55, hat: (c, H) => { curlsFront(c, H); goggles(c, H); }, hairBack: curlsBack }) },
    4: { name: 'gorro tejido holgado, puño alto (cejas siempre libres)', cost: 'nuevo (rediseño del gorro actual)', layers: () => ({ extraK: 1.6, hat: slouch, backHair: (c, H) => shortHair(c, H, 0.06) }) },
    5: { name: 'rizos + lápiz amarillo detrás de la oreja', cost: 'nuevo (lápiz) + rizos existentes', layers: () => ({ extraK: 1.55, hat: (c, H) => { curlsFront(c, H); pencil(c, H, false); }, hairBack: (c, H, B) => { curlsBack(c, H, B); pencil(c, H, true); } }) },
    6: { name: 'boina plana (ivy) mostaza, espiga', cost: 'nuevo (rediseño de la boina)', layers: () => ({ extraK: 1.42, hat: ivy, backHair: (c, H) => shortHair(c, H, 0.062) }) },
  };
  // a spec with one round-2 headwear on top of an outfit spec id (e.g. C.OUTFITS.variant('eli', '3bB', 0))
  C.ELI_HATS_V2.variant = function (key, outfitId, probe, nohat) {   // probe / nohat: QC only (brow_clear_check.py --v2)
    const id = `${outfitId}_hat2_${key}` + (probe ? 'p' : '') + (nohat ? 'x' : ''); if (C.SPECS[id]) return id; const b = C.SPECS[outfitId], L = nohat ? {} : C.ELI_HATS_V2[key].layers();
    C.define(id, Object.assign({}, b, { hat: L.hat || null, hairBack: L.hairBack || null, hairFront: L.hairFront || null, backHair: L.backHair || null, extraK: L.extraK || b.extraK },
      probe ? { face: Object.assign({}, b.face, { browColor: '#ff0000' }) } : {}));
    return id;
  };
})(typeof window !== 'undefined' ? window : globalThis);
