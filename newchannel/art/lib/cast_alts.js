/* Diez Mil Puntos art kit · Eli + Mila, five alternative designs of the pair (2026-10-15, Producer's review brief).
   Eli = the man: loud, impatient, the gap-closer (was "Leo"). Mila = the woman: calm, curious, patient.
   ids: eli1..eli5, mila1..mila5 (alias: eli -> eli1). Units: height units (cast.js). Board/scene: scenes/alt_board.js.
   Alt 1 · Taller (the current pair, polished)      capsule heads, googly eyes, workwear          yellow  / purple
   Alt 2 · Carretera 70 (retro road trip)           capsule heads, googly eyes, 1970s            cobalt  / raspberry
   Alt 3 · Barrio (streetwear, younger, chibi)      egg heads, dot eyes + brows                   lime    / cobalt
   Alt 4 · Ruta verde (outdoorsy, Eli taller)       tile / pill heads, iris eyes + brows          burgundy plaid / sky blue
   Alt 5 · Laboratorio (quirky scientists, 40s)     pill heads, dot / iris eyes, goggles, glasses tangerine / navy + cream */
(function (root) {
  const K = root.K, C = K.cast, h = C.helpers, INK = C.INK;

  // ---------------------------------------------------------------- body builder (proportion rules from Max & Leo)
  function mk(p) {
    const H = p.h, hw = p.head.hw, hh = p.head.hh, cy = p.head.cy ?? (H - hh - (p.hairTop || 0));
    const shoulder = p.shoulder ?? (cy - hh + 0.005), legLen = p.legLen ?? H * 0.42;
    const LA = shoulder - legLen + (p.armX ?? 0.045);
    const S = {
      kind: 'biped', lw: 0.0066, phase: p.phase || 0, shadowW: p.shadowW || 0.14, legSplay: 0.005,
      legLen, shoulder, shoulderW: p.shoulderW ?? 0.07, shoulderFwd: 0.004, hipW: p.hipW ?? 0.04, legW: p.legW ?? 0.05,
      torso: Object.assign({ top: shoulder + 0.025, bot: legLen - 0.025, wTop: 0.09, wBot: 0.085 }, p.torso),
      head: Object.assign({ kind: 'capsule', lean: 0.05, neck: 0.03 }, p.head, { cy }),
      arm: Object.assign({ upper: LA * 0.52, fore: LA * 0.48, w: 0.04, hand: 0.027 }, p.arm),
    };
    for (const k of Object.keys(p)) if (!['head', 'torso', 'arm'].includes(k)) S[k] = p[k];
    S.handColor = S.handColor || S.skin;
    return S;
  }
  // a true-radius disc in body units (K.circle clamps r >= 0.01, which in body units made every button / jewel highlight a
  // pale disc as big as the button itself: clothes QC 2026-10-16, same root cause as the 2026-10-16 eye catchlights)
  const disc = (c, x, y, r) => { c.beginPath(); c.arc(x, y, Math.max(1e-6, r), 0, K.TAU); };
  const clipHead = (c, H) => { c.save(); h.headPath(c, Object.assign({}, H.S || {}, { kind: H.headKind, hw: H.hw, hh: H.hh, neck: H.neck || 0 })); c.clip(); };
  const backX = (H, k) => (H.fs > 0.05 ? -H.faceDir * H.hw * k * H.fs : 0);
  const outlineHead = (c, H, S) => { h.headPath(c, S.head); c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.stroke(); };
  // crew neckline (detail pass): a rib band that hugs the neck, clipped to the torso so it never pokes out in 3/4 or
  // profile; ink only on its lower edge (one clean line), a faint rib line inside
  function crewCollar(color) {
    return (c, B) => {
      const w = Math.min(B.hw * 0.86, B.wT * 0.82) * (1 - 0.25 * B.s), y = B.Ttop - 0.004, x = B.hcx + B.dir * B.s * B.hw * 0.25, d = 0.034, bh = 0.016;
      c.save(); B.torsoPath(c); c.clip();
      c.fillStyle = color; c.beginPath(); c.moveTo(x - w - 0.01, y); c.quadraticCurveTo(x, y + d * 2, x + w + 0.01, y); c.lineTo(x + w + 0.01, y - 0.02); c.lineTo(x - w - 0.01, y - 0.02); c.closePath(); c.fill();
      c.fillStyle = B.H.skin; c.beginPath(); c.moveTo(x - w + bh, y); c.quadraticCurveTo(x, y + (d - bh * 0.9) * 2, x + w - bh, y); c.lineTo(x + w, y - 0.03); c.lineTo(x - w, y - 0.03); c.closePath(); c.fill();
      c.strokeStyle = INK; c.lineCap = 'round'; c.lineWidth = B.lw * 1.6;
      c.beginPath(); c.moveTo(x - w - 0.01, y); c.quadraticCurveTo(x, y + d * 2, x + w + 0.01, y); c.stroke();
      c.lineWidth = B.lw * 1.1; c.beginPath(); c.moveTo(x - w + bh, y); c.quadraticCurveTo(x, y + (d - bh * 0.9) * 2, x + w - bh, y); c.stroke();
      c.restore();
    };
  }
  function turtleneck(color, k = 1) {
    return (c, B) => {
      const w = B.hw * 1.08 * k, x = B.tcx + B.dir * B.s * B.wT * 0.2, y0 = B.Ttop - 0.022, y1 = B.Ttop + 0.01;
      c.fillStyle = color; c.strokeStyle = INK; c.lineWidth = B.lw * 2;
      K.rrect(c, x - w, y0, w * 2, y1 - y0, 0.014); c.stroke(); c.fill();
      c.strokeStyle = K.rgba(INK, 0.35); c.lineWidth = B.lw; for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(x - w * 0.9, y0 + i * (y1 - y0) / 3); c.lineTo(x + w * 0.9, y0 + i * (y1 - y0) / 3); c.stroke(); }
    };
  }
  function lobes(c, cx, cy, R, n, seed, k = 0.42) { // a lobed cloud (afro, curls, pompoms)
    const r = K.rng(seed); c.beginPath();
    for (let i = 0; i < n; i++) { const a = i / n * K.TAU + r() * 0.3, rr = R * (1 - k * 0.5 + r() * 0.1); const x = cx + Math.cos(a) * rr * 0.78, y = cy + Math.sin(a) * rr * 0.78; c.moveTo(x + R * k, y); c.arc(x, y, R * k, 0, K.TAU); }
    c.moveTo(cx + R * 0.8, cy); c.arc(cx, cy, R * 0.8, 0, K.TAU);
  }
  function lobedShape(c, cx, cy, R, n, seed, fill, lw, k) {
    lobes(c, cx, cy, R, n, seed, k); c.strokeStyle = INK; c.lineWidth = lw * 2; c.lineJoin = 'round'; c.stroke();
    lobes(c, cx, cy, R, n, seed, k); c.fillStyle = fill; c.fill();
  }

  // =============================================================== ALT 1 · Taller (polished current pair)
  const PURPLE = '#7158b8', PURPLE_D = '#5a4596', MUSTARD = '#c99633', MUSTARD_D = '#a87a24', GREEN = '#2f6b45', BRASS = '#e7c25a', GOLD = '#f0c24a';
  // Eli's skin: Producer 2026-10-29 «Le pondría el mismo color de Mila» -> Mila's tan #d9a66c (was #905a38 from 2026-10-16,
  // and #7a4d32 before). His blush is a warm coral (Mila has wine lips; Eli keeps an unpainted mouth so the faces stay apart).
  const ELI_SKIN = '#d9a66c', ELI_BLUSH = '#f07a5e';
  const TEE = '#f1ede2', APRON = '#a4713d', APRON_D = '#7d532a', JEANS = '#3f5f96', BEANIE = '#f2c230', BEANIE_D = '#cf9d1f';
  function overalls(c, B) {
    const s = B.s, d = B.dir, bx = B.tcx + d * s * B.wT * 0.4, bw = 0.056 * (1 - 0.45 * s), top = B.Ttop + 0.095, waist = B.Tbot - 0.09;
    c.fillStyle = MUSTARD; c.fillRect(B.tcx - 0.2, waist, 0.4, 0.2);
    c.strokeStyle = INK; c.lineWidth = B.lw * 2; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(B.tcx - 0.2, waist); c.lineTo(bx - bw, waist); c.lineTo(bx - bw, top); c.lineTo(bx + bw, top); c.lineTo(bx + bw, waist); c.lineTo(B.tcx + 0.2, waist); c.lineTo(B.tcx + 0.2, 0.2); c.lineTo(B.tcx - 0.2, 0.2); c.closePath();
    c.stroke(); c.fill();   // clothes QC 2026-10-16: stroke THEN fill (fill-then-stroke showed the full 2 lw ink = thick black bars)
    // bib pocket: a patch with a flap (one flap line, one stitch line)
    const px = bx + d * s * 0.008, py = top + 0.026, pw = 0.024 * (1 - 0.4 * s), ph = 0.036;
    c.fillStyle = MUSTARD_D; c.strokeStyle = INK; c.lineWidth = B.lw * 1.4; K.rrect(c, px - pw, py, pw * 2, ph, 0.005); c.fill(); c.stroke();
    c.fillStyle = MUSTARD; K.rrect(c, px - pw, py, pw * 2, ph * 0.34, [0.005, 0.005, 0.002, 0.002]); c.fill(); c.stroke();
    c.strokeStyle = K.rgba(INK, 0.4); c.lineWidth = B.lw * 0.9; c.beginPath(); c.moveTo(bx, waist + 0.03); c.lineTo(bx, B.Tbot + 0.01); c.stroke();
  }
  function overallStraps(c, B) { // over the sweater collar, tucked over the shoulders (clipped to the torso), brass buttons
    const s = B.s, d = B.dir, bx = B.tcx + d * s * B.wT * 0.4, bw = 0.056 * (1 - 0.45 * s), top = B.Ttop + 0.095, sw = 0.017;
    c.save(); B.torsoPath(c); c.clip();
    for (const sg of [-1, 1]) { if (!(s < 0.9 || sg === -d)) continue;
      const sx = bx + sg * bw * 0.66, ex = B.tcx + sg * B.wT * 0.58 * (1 - 0.5 * s) - d * s * 0.02;
      c.lineCap = 'butt'; c.strokeStyle = INK; c.lineWidth = sw + B.lw * 2; c.beginPath(); c.moveTo(sx, top + 0.008); c.lineTo(ex, B.Ttop - 0.02); c.stroke();
      c.strokeStyle = MUSTARD; c.lineWidth = sw; c.beginPath(); c.moveTo(sx, top + 0.01); c.lineTo(ex, B.Ttop - 0.02); c.stroke(); }
    c.restore();
    for (const sg of [-1, 1]) { if (!(s < 0.9 || sg === -d)) continue; const sx = bx + sg * bw * 0.66;
      c.fillStyle = BRASS; c.strokeStyle = INK; c.lineWidth = B.lw * 1.4; disc(c, sx, top + 0.012, 0.0082); c.fill(); c.stroke();
      c.fillStyle = '#fff3c0'; disc(c, sx - 0.0025, top + 0.0095, 0.0022); c.fill(); }
  }
  function apron(c, B) {
    const s = B.s, d = B.dir, bx = B.tcx + d * s * B.wT * 0.45, bw = 0.064 * (1 - 0.5 * s), top = B.Ttop + 0.055;
    c.fillStyle = APRON; c.strokeStyle = INK; c.lineWidth = B.lw * 2;
    c.beginPath(); c.moveTo(bx - bw, top); c.lineTo(bx + bw, top); c.lineTo(bx + bw * 1.25, B.Tbot + 0.03); c.lineTo(bx - bw * 1.25, B.Tbot + 0.03); c.closePath(); c.stroke(); c.fill();
    // neck strap: one flat band per side from the bib corner up over the collar to the back of the neck (clipped to the
    // torso: it never pokes out as a loose cord in 3/4 or profile)
    { const nw = Math.min(B.hw * 0.86, B.wT * 0.82) * (1 - 0.25 * s), nx = B.hcx + d * s * B.hw * 0.25, stw = 0.012;
      c.save(); B.torsoPath(c); c.clip(); c.lineCap = 'butt';
      for (const sg of [-1, 1]) { if (s > 0.85 && sg === -d) continue;
        const x0 = bx + sg * bw * 0.78, y0 = top + 0.006, x1 = nx + sg * nw * 0.62, y1 = B.Ttop - 0.02;
        c.strokeStyle = INK; c.lineWidth = stw + B.lw * 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
        c.strokeStyle = APRON_D; c.lineWidth = stw; c.beginPath(); c.moveTo(x0, y0 + 0.002); c.lineTo(x1, y1); c.stroke(); }
      c.restore(); }
    c.strokeStyle = K.rgba(INK, 0.3); c.lineWidth = B.lw * 0.9; c.setLineDash([0.008, 0.006]); c.beginPath(); c.moveTo(bx - bw * 0.78, top + 0.014); c.lineTo(bx + bw * 0.78, top + 0.014); c.stroke(); c.setLineDash([]);
    // the skirt sways (secondary motion)
    // seated: the skirt is a short flap over the lap (clothes QC 2026-10-16: it and the waist band used to vanish when
    // seated, so on the ground the apron ended in mid-air above the thighs)
    apronSkirt(c, B, B.tcx + d * s * B.wB * 0.5, !B.seated);
    c.fillStyle = '#3b2a20'; c.strokeStyle = INK; c.lineWidth = B.lw * 1.4; K.rrect(c, B.tcx - B.wB * 1.0, B.Tbot - 0.004, B.wB * 2.0, 0.02, 0.006); c.fill(); c.stroke();
  }
  // the apron skirt (front: over the jeans; back 3/4: the far edge peeking past the body, drawn before the legs)
  function apronSkirt(c, B, sbx, pocket) {
    const s = B.s, d = B.dir, sway = Math.sin(B.t * 1.9 + 0.7) * 0.006 - B.drag * 0.02 * d;
    const w0 = 0.085 * (1 - 0.55 * s), w1 = 0.09 * (1 - 0.5 * s), y0 = B.Tbot + 0.012, y1 = B.seated ? B.Tbot + 0.07 : -B.S.legLen * 0.52 - (B.crouch || 0) * 0.85;   // crouched: the skirt rides up (never through the floor)
    c.fillStyle = APRON; c.strokeStyle = INK; c.lineWidth = B.lw * 2; c.lineJoin = 'round';
    if (B.seated && B.s > 0.85) return;   // profile seated: the thigh runs forward, the flap reads as a stray tab
    c.beginPath(); c.moveTo(sbx - w0, y0 - (pocket ? 0 : 0.03)); c.lineTo(sbx + w0, y0 - (pocket ? 0 : 0.03)); c.lineTo(sbx + w1 + sway, y1 - 0.01); c.quadraticCurveTo(sbx + w1 + sway, y1, sbx + w1 - 0.01 + sway, y1); c.lineTo(sbx - w1 + 0.01 + sway, y1); c.quadraticCurveTo(sbx - w1 + sway, y1, sbx - w1 + sway, y1 - 0.01); c.closePath(); c.stroke(); c.fill();
    if (pocket) { c.fillStyle = APRON_D; K.rrect(c, sbx - 0.045 * (1 - 0.5 * s) + sway * 0.6, y0 + 0.04, 0.09 * (1 - 0.5 * s), 0.06, 0.006); c.fill(); c.lineWidth = B.lw * 1.4; c.stroke(); }
  }
  // beanie (detail pass): it pops up when the brows rise (surprise, awe, worry) so the brows always sit on the skin, never
  // on the cuff; the knit is a few soft ribs in a tone of the yarn (no dark stripes), the cuff ribs line up with the dome
  // ribs, and the fold gets one light edge
  function beanie(color, dark, pom) {
    return (c, H) => {
      const hw = H.hw, hh = H.hh, cuffY = -hh + 0.046, cuffH = 0.036;
      const lift = H.browTop != null ? K.clamp((cuffY + cuffH + 0.005) - H.browTop, 0, 0.034) : 0;
      const bob = Math.sin(H.t * 3.1 + 0.4) * 0.0022 - lift, sq = 1 - H.hatHit * 0.22;
      c.save(); c.translate(0, cuffY + cuffH + bob + H.hatHit * 0.008); c.scale(1 + H.hatHit * 0.08, sq); c.translate(0, -(cuffY + cuffH));
      const dome = () => { c.beginPath(); c.moveTo(-hw * 1.07, cuffY + 0.005); c.bezierCurveTo(-hw * 1.1, -hh - 0.05, hw * 1.1, -hh - 0.05, hw * 1.07, cuffY + 0.005); c.closePath(); };
      if (pom) { const sw = Math.sin(H.t * 2.6) * 0.006 + H.drag * -0.02 * H.dir; lobedShape(c, sw + H.faceDir * H.fs * 0.004, -hh - 0.05, 0.03, 9, 77, pom, H.lw, 0.42); }
      h.shape(c, dome, color, H.lw);
      const rib = K.rgba(dark, 0.75), sp = hw * 0.3, off = H.faceDir * H.fs * hw * 0.22;
      c.save(); dome(); c.clip(); c.strokeStyle = rib; c.lineWidth = H.lw * 1.1; c.lineCap = 'round';
      for (let i = -3; i <= 3; i++) { const x = i * sp + off; c.beginPath(); c.moveTo(x, cuffY); c.quadraticCurveTo(x * 0.9, -hh - 0.01, x * 0.35, -hh - 0.036); c.stroke(); }
      c.restore();
      const cuff = () => K.rrect(c, -hw * 1.14, cuffY, hw * 2.28, cuffH, 0.016);
      h.shape(c, cuff, K.shade(color, 0.04), H.lw);
      c.save(); cuff(); c.clip(); c.strokeStyle = rib; c.lineWidth = H.lw * 1.1; c.lineCap = 'round';
      for (let i = -4; i <= 4; i++) { const x = i * sp * 0.5 + off; if (Math.abs(x) > hw * 1.08) continue; c.beginPath(); c.moveTo(x, cuffY + 0.008); c.lineTo(x, cuffY + cuffH - 0.008); c.stroke(); }
      c.strokeStyle = K.rgba('#fff3c4', 0.55); c.lineWidth = H.lw * 1.0; c.beginPath(); c.moveTo(-hw * 1.0, cuffY + 0.0045); c.lineTo(hw * 1.0, cuffY + 0.0045); c.stroke();
      c.restore(); c.restore();
    };
  }
  // ---------------------------------------------------------------- Eli headwear options (Producer 2026-10-29: «El sombrerito
  // tampoco me gusta, dame opciones»). Not active: eli1 keeps the beanie until the Producer picks. Each option is a set of
  // head layers { hat, hairBack, hairFront } in head units, defined for every view through H.fs / H.faceDir / H.back, with
  // the beanie's rules: a bob on t, a squash on H.hatHit, and a lift so the brows always sit on skin (never on a brim).
  const ELI_HAIR = '#2e1d22', CAP_Y = '#f2c230', CAP_D = '#cf9d1f', NEWS = '#d9a62a', NEWS_D = '#a8801c';
  // Guardian 2026-10-29: the lift is measured from the LOWEST ink edge of the headwear (brim / lens / band, not the crown
  // seam) plus its stroke, a clear skin gap and the hit push-down, so the brows never touch a brim in surprise / anger.
  const hatLift = (H, bottom, max = 0.1) => (H.browTop != null ? K.clamp(bottom + H.lw * 1.5 + 0.008 + H.hatHit * 0.008 - H.browTop, 0, max) : 0);
  // no re-ink of the head outline over the hair (Guardian 2026-10-29): the hair is clipped to the head, so the outer half
  // of the kit's outline stays; a full re-stroke cut through the googly eyes in 3/4 / profile and left a step at the brow
  const hatFrame = (c, H, pivotY, lift, give = 1) => { const bob = Math.sin(H.t * 3.1 + 0.4) * 0.0022 - lift, sq = 1 - H.hatHit * 0.22 * give;
    c.save(); c.translate(0, pivotY + bob + H.hatHit * 0.008); c.scale(1 + H.hatHit * 0.08 * give, sq); c.translate(0, -pivotY); };
  // short cropped hair (under caps / band): a cap of hair clipped to the head, hairline lower toward the back of the head
  function shortHair(c, H, line = 0.052) {
    const hw = H.hw, hh = H.hh, back = H.back ? 1 : 0;
    if (H.browTop != null && !back) line -= Math.max(0, (-hh + line) - (H.browTop - 0.012));   // the hairline always stops above the brows (surprise lifts them high)
    c.save(); h.headPath(c, C.SPECS.eli1.head); c.clip(); c.fillStyle = ELI_HAIR; c.beginPath();
    // Guardian 2026-10-29 (brow_clear_check): over the brows' span the hairline (wiggle + ink included) keeps a clear skin gap
    const bs = !back && H.browTop != null && H._brows ? H._brows : null, bx0 = bs ? Math.min(...bs.map(g => Math.min(g[0], g[4]))) - 0.02 : 0, bx1 = bs ? Math.max(...bs.map(g => Math.max(g[0], g[4]))) + 0.02 : 0;
    const yRaw = x => -hh + line + (back ? 0.05 : 0.035 * K.clamp(-H.faceDir * x / hw) * H.fs) + 0.004 * Math.sin(x * 160);
    const yAt = x => (bs && x > bx0 && x < bx1 ? Math.min(yRaw(x), H.browTop - 0.014 - H.lw * 0.8) : yRaw(x));
    c.moveTo(-hw * 1.3, -hh - 0.1); c.lineTo(hw * 1.3, -hh - 0.1); for (let i = 0; i <= 16; i++) { const x = hw * 1.3 - i / 16 * hw * 2.6; c.lineTo(x, yAt(x)); } c.closePath(); c.fill();
    c.strokeStyle = INK; c.lineWidth = H.lw * 1.6; c.beginPath(); for (let i = 0; i <= 16; i++) { const x = -hw * 1.3 + i / 16 * hw * 2.6; i ? c.lineTo(x, yAt(x)) : c.moveTo(x, yAt(x)); } c.stroke();
    c.restore();
  }
  // 2 · short curls: a low lobed crown of curls (no hat), the volume stays inside his 0.95 height budget
  function curlsBack(c, H) { const b = Math.sin(H.t * 3.0) * 0.0018 - H.hatHit * 0.006, cx = backX(H, 0.18);
    c.save(); c.translate(0, b); c.scale(1 + H.hatHit * 0.06, 1 - H.hatHit * 0.15);
    lobedShape(c, cx, -H.hh * 0.78, H.hw * 1.22, 12, 31, ELI_HAIR, H.lw, 0.3); c.restore(); }
  function curlsFront(c, H) { const hw = H.hw, hh = H.hh, lift = hatLift(H, -hh + 0.064, 0.06);
    c.save(); h.headPath(c, C.SPECS.eli1.head); c.clip(); c.translate(0, -lift);
    c.fillStyle = ELI_HAIR; c.strokeStyle = INK; c.lineWidth = H.lw * 1.6; const off = H.faceDir * H.fs * hw * 0.25;
    c.beginPath(); c.moveTo(-hw * 1.3, -hh - 0.1); c.lineTo(hw * 1.3, -hh - 0.1); c.lineTo(hw * 1.3, -hh + 0.05);
    for (let i = 0; i <= 7; i++) { const x = hw * 1.15 - i / 7 * hw * 2.3 + off * 0.3, y = -hh + 0.05 + (H.back ? 0.04 : 0); c.quadraticCurveTo(x + hw * 0.16, y + 0.022, x, y); }
    c.lineTo(-hw * 1.3, -hh - 0.1); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = K.rgba('#5a3a3a', 0.8); c.lineWidth = H.lw; for (let i = 0; i < 6; i++) { const x = -hw * 0.8 + i * hw * 0.32 + off, y = -hh + 0.022 + (i % 2) * 0.01; c.beginPath(); c.arc(x, y, 0.009, 0.2, 2.6); c.stroke(); }
    c.restore(); }
  // 3 · backwards cap: a smooth six-panel crown, the snap opening over the forehead, the brim out the back
  function capBack(c, H) {
    const hw = H.hw, hh = H.hh, band = -hh + 0.05, lift = hatLift(H, band + 0.006);
    shortHairUnder(c, H);
    hatFrame(c, H, band, lift);
    const fs = H.fs, bk = -H.faceDir, crown = () => { c.beginPath(); c.moveTo(-hw * 1.08, band + 0.006); c.bezierCurveTo(-hw * 1.12, -hh - 0.045, hw * 1.12, -hh - 0.045, hw * 1.08, band + 0.006); c.closePath(); };
    if (fs > 0.15 && !H.back) { const bx = bk * hw * (0.9 + 0.2 * fs), L = 0.07 * fs; h.shape(c, () => { c.beginPath(); c.ellipse(bx + bk * L * 0.6, band + 0.004, L, 0.011, bk * -0.12, 0, K.TAU); }, CAP_D, H.lw); }
    h.shape(c, crown, CAP_Y, H.lw);
    c.save(); crown(); c.clip(); c.strokeStyle = K.rgba(CAP_D, 0.9); c.lineWidth = H.lw * 1.1; const off = H.faceDir * fs * hw * 0.3;
    for (const k of [-0.55, 0, 0.55]) { c.beginPath(); c.moveTo(k * hw + off, band); c.quadraticCurveTo(k * hw * 0.8 + off, -hh - 0.01, off * 0.5, -hh - 0.034); c.stroke(); }
    c.fillStyle = '#fff3c4'; c.globalAlpha = 0.45; c.fillRect(-hw * 1.2, band - 0.004, hw * 2.4, 0.004); c.restore();
    if (!H.back && fs < 0.7) { const ox = H.faceDir * fs * hw * 0.35; h.shape(c, () => { c.beginPath(); c.moveTo(ox - 0.026, band + 0.006); c.quadraticCurveTo(ox, band - 0.03, ox + 0.026, band + 0.006); c.closePath(); }, ELI_HAIR, H.lw); }
    if (H.back) { h.shape(c, () => { c.beginPath(); c.moveTo(-hw * 0.92, band + 0.004); c.ellipse(0, band + 0.004, hw * 0.92, 0.034, 0, Math.PI, 0, true); c.closePath(); }, CAP_D, H.lw);   // the visor points at us: it hangs over the nape
      c.strokeStyle = K.rgba('#8a6512', 0.8); c.lineWidth = H.lw; c.beginPath(); c.ellipse(0, band + 0.004, hw * 0.8, 0.026, 0, 0.15, Math.PI - 0.15); c.stroke(); }
    c.fillStyle = CAP_D; c.strokeStyle = INK; c.lineWidth = H.lw; c.beginPath(); c.arc(off * 0.5, -hh - 0.036, 0.007, 0, K.TAU); c.fill(); c.stroke();
    c.restore();
  }
  function shortHairUnder(c, H) { shortHair(c, H, 0.058); }
  // 4 · yellow headband (bandana rolled into a band) over short hair, knot + tails at the back of the head
  function bandana(c, H) {
    const hw = H.hw, hh = H.hh, y0 = -hh + 0.045, bh = 0.03, lift = hatLift(H, y0 + bh);
    hatFrame(c, H, y0 + bh, lift);
    const bandP = () => { c.beginPath(); c.moveTo(-hw * 1.1, y0 + 0.004); c.quadraticCurveTo(0, y0 - 0.008, hw * 1.1, y0 + 0.004); c.lineTo(hw * 1.1, y0 + bh); c.quadraticCurveTo(0, y0 + bh - 0.01, -hw * 1.1, y0 + bh); c.closePath(); };
    const kx = H.back ? 0 : -H.faceDir * hw * 1.02, show = H.back || H.fs > 0.2;
    if (show) { const sw = Math.sin(H.t * 2.4) * 0.006 + H.drag * -0.02 * H.dir, d = H.back ? 1 : -H.faceDir;
      for (const k of [0, 1]) h.shape(c, () => { c.beginPath(); c.moveTo(kx, y0 + bh * 0.5); c.quadraticCurveTo(kx + d * (0.03 + k * 0.012), y0 + 0.03 + k * 0.02, kx + d * (0.026 + k * 0.02) + sw, y0 + 0.06 + k * 0.016); c.lineTo(kx + d * (0.012 + k * 0.016) + sw, y0 + 0.058 + k * 0.012); c.closePath(); }, CAP_D, H.lw); }
    h.shape(c, bandP, CAP_Y, H.lw);
    c.save(); bandP(); c.clip(); c.strokeStyle = K.rgba(CAP_D, 0.9); c.lineWidth = H.lw * 1.1; c.beginPath(); c.moveTo(-hw * 1.2, y0 + bh * 0.55); c.quadraticCurveTo(0, y0 + bh * 0.45, hw * 1.2, y0 + bh * 0.55); c.stroke();
    c.fillStyle = K.rgba('#fff6d8', 0.9); for (let i = -3; i <= 3; i++) { const x = i * hw * 0.34 + H.faceDir * H.fs * hw * 0.2; c.beginPath(); c.arc(x, y0 + bh * 0.3 + (i % 2) * 0.01, 0.0035, 0, K.TAU); c.fill(); }
    c.restore();
    if (show) h.shape(c, () => { c.beginPath(); c.ellipse(kx, y0 + bh * 0.5, 0.012, 0.014, 0, 0, K.TAU); }, CAP_Y, H.lw);
    c.restore();
  }
  // 5 · flat newsboy cap (mustard-yellow): a soft round crown pulled forward, short stiff brim over the face side
  function newsboy(c, H) {
    const hw = H.hw, hh = H.hh, band = -hh + 0.056, lift = hatLift(H, band + 0.02);
    hatFrame(c, H, band, lift);
    const fs = H.fs, fd = H.faceDir, cx = fd * fs * hw * 0.25;
    const crown = () => { c.beginPath(); c.moveTo(-hw * 1.1, band + 0.004); c.bezierCurveTo(-hw * 1.35 + cx, -hh - 0.02, hw * 1.25 + cx, -hh - 0.05, hw * 1.12 + cx * 1.4, band - 0.004); c.closePath(); };
    h.shape(c, crown, NEWS, H.lw);
    c.save(); crown(); c.clip(); c.strokeStyle = K.rgba(NEWS_D, 0.9); c.lineWidth = H.lw * 1.1;
    for (const k of [-0.5, 0.1, 0.65]) { c.beginPath(); c.moveTo(k * hw + cx, band); c.quadraticCurveTo(k * hw * 0.6 + cx, -hh - 0.01, cx * 0.8, -hh - 0.02); c.stroke(); } c.restore();
    c.fillStyle = NEWS_D; c.strokeStyle = INK; c.lineWidth = H.lw; c.beginPath(); c.arc(cx * 0.8, -hh - 0.022, 0.0065, 0, K.TAU); c.fill(); c.stroke();
    if (!H.back) { const bx = fd * fs * hw * 0.95, L = 0.03 + 0.045 * fs, W = hw * (1.0 - 0.55 * fs);
      h.shape(c, () => { c.beginPath(); c.ellipse(bx + fd * fs * L * 0.5, band + 0.008, Math.max(W, L), 0.012, 0, 0, K.TAU); }, NEWS_D, H.lw); }
    c.restore();
  }
  // 6 · bucket hat: a short crown and a soft brim sloping down all round (narrow in front so it never reaches the brows)
  function bucket(c, H) {
    const hw = H.hw, hh = H.hh, band = -hh + 0.05, lift = hatLift(H, band + 0.027);
    hatFrame(c, H, band, lift);
    const brim = () => { c.beginPath(); c.moveTo(-hw * 1.5, band + 0.022); c.quadraticCurveTo(-hw * 1.3, band - 0.006, -hw * 1.0, band - 0.006); c.lineTo(hw * 1.0, band - 0.006); c.quadraticCurveTo(hw * 1.3, band - 0.006, hw * 1.5, band + 0.022); c.quadraticCurveTo(0, band + 0.03, -hw * 1.5, band + 0.022); c.closePath(); };
    const crown = () => { c.beginPath(); c.moveTo(-hw * 0.98, band); c.lineTo(-hw * 0.92, -hh - 0.03); c.quadraticCurveTo(0, -hh - 0.05, hw * 0.92, -hh - 0.03); c.lineTo(hw * 0.98, band); c.closePath(); };
    h.shape(c, crown, CAP_Y, H.lw);
    c.save(); crown(); c.clip(); c.fillStyle = K.rgba(CAP_D, 0.85); c.fillRect(-hw * 1.2, band - 0.018, hw * 2.4, 0.012); c.restore();
    h.shape(c, brim, K.shade(CAP_Y, -0.04), H.lw);
    c.strokeStyle = K.rgba(CAP_D, 0.9); c.lineWidth = H.lw; c.beginPath(); c.moveTo(-hw * 1.3, band + 0.012); c.quadraticCurveTo(0, band + 0.02, hw * 1.3, band + 0.012); c.stroke();
    c.restore();
  }
  // 7 · (Claude's idea, workshop) short curls + yellow-rimmed workshop goggles pushed up on the forehead
  function goggles(c, H) {
    const hw = H.hw, hh = H.hh, y = -hh + 0.06, lift = hatLift(H, y + 0.02);
    hatFrame(c, H, y, lift, 0.15);   // rigid goggles: they bounce on a hit, they do not squash into slits
    c.strokeStyle = INK; c.lineWidth = H.lw * 3.2; c.beginPath(); c.moveTo(-hw * 1.05, y + 0.002); c.quadraticCurveTo(0, y - 0.01, hw * 1.05, y + 0.002); c.stroke();
    c.strokeStyle = '#3a3436'; c.lineWidth = H.lw * 2.2; c.stroke();
    if (!H.back) { const fs = H.fs, fd = H.faceDir, sep = 0.036 * (1 - 0.45 * fs), cx = fd * fs * hw * 0.55;
      for (const sg of [-1, 1]) { const x = cx + sg * sep, far = fs > 0.3 && sg === -fd, r = 0.022 * (far ? 0.75 : 1) * (1 - 0.25 * fs);
        if (fs > 0.85 && far) continue;
        h.shape(c, () => { c.beginPath(); c.ellipse(x, y, r, r * 0.86, 0, 0, K.TAU); }, CAP_Y, H.lw);
        c.fillStyle = '#9fd0e0'; c.beginPath(); c.ellipse(x, y, r * 0.62, r * 0.54, 0, 0, K.TAU); c.fill(); c.strokeStyle = INK; c.lineWidth = H.lw; c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.ellipse(x - r * 0.2, y - r * 0.2, r * 0.16, r * 0.1, -0.5, 0, K.TAU); c.fill(); }
      c.strokeStyle = INK; c.lineWidth = H.lw * 2.4; c.beginPath(); c.moveTo(cx - sep + 0.02, y); c.lineTo(cx + sep - 0.02, y); c.stroke(); }
    c.restore();
  }
  // extraK (Guardian 2026-10-29): the surprise ticks / anger mark sit outside the headwear (they used to cross the crown)
  C.ELI_HATS = {
    1: { name: 'gorro tejido (actual)', layers: () => ({ hat: C.SPECS.eli1.hat }), cost: 'existe' },
    2: { name: 'rizos cortos, sin gorro', layers: () => ({ extraK: 1.3, hat: curlsFront, hairBack: curlsBack }), cost: 'nuevo (reutiliza el pelo lobulado de Alt 2)' },
    3: { name: 'gorra al revés', layers: () => ({ extraK: 1.36, hat: capBack }), cost: 'nuevo' },
    4: { name: 'banda amarilla + pelo corto', layers: () => ({ extraK: 1.18, hat: (c, H) => { shortHair(c, H); bandana(c, H); }, backHair: (c, H) => shortHair(c, H) }), cost: 'nuevo' },
    5: { name: 'boina plana (newsboy) mostaza', layers: () => ({ extraK: 1.42, hat: (c, H) => { shortHair(c, H, 0.062); newsboy(c, H); }, backHair: (c, H) => shortHair(c, H, 0.062) }), cost: 'nuevo' },
    6: { name: 'gorro pescador amarillo', layers: () => ({ extraK: 1.52, hat: (c, H) => { shortHair(c, H, 0.062); bucket(c, H); }, backHair: (c, H) => shortHair(c, H, 0.062) }), cost: 'nuevo' },
    7: { name: 'rizos + gafas de taller', layers: () => ({ extraK: 1.3, hat: (c, H) => { curlsFront(c, H); goggles(c, H); }, hairBack: curlsBack }), cost: 'nuevo (idea de Claude)' },
  };
  // drop earrings: a stud on the head edge and a small gold drop hanging OUTSIDE the silhouette (reads as jewellery)
  function drops(color = GOLD, y = 0.04) {
    return (c, H) => {
      const sides = H.fs < 0.2 ? [-1, 1] : [-H.faceDir];
      for (const sg of sides) {
        const ex = H.fs < 0.2 ? sg * H.hw * 1.0 : -H.faceDir * H.hw * (1.0 - H.fs * 0.12), ey = y;
        const sw = Math.sin(H.t * 2.3 + sg) * 0.25, L = 0.016, dx = ex + Math.sin(sw) * L + sg * 0.002, dy = ey + Math.cos(sw) * L;
        c.strokeStyle = INK; c.lineWidth = H.lw * 1.2; c.beginPath(); c.moveTo(ex, ey); c.lineTo(dx, dy - 0.004); c.stroke();
        c.fillStyle = color; c.lineWidth = H.lw * 1.3;
        c.beginPath(); c.moveTo(dx, dy - 0.009); c.quadraticCurveTo(dx + 0.009, dy + 0.003, dx, dy + 0.011); c.quadraticCurveTo(dx - 0.009, dy + 0.003, dx, dy - 0.009); c.closePath(); c.stroke(); c.fill();
        c.fillStyle = '#fff6d0'; disc(c, dx - 0.002, dy - 0.001, 0.0022); c.fill();
        c.fillStyle = color; c.strokeStyle = INK; c.lineWidth = H.lw * 1.2; disc(c, ex, ey, 0.0055); c.stroke(); c.fill();
      }
    };
  }
  function studs(color, y) { return (c, H) => { const sides = H.fs < 0.2 ? [-1, 1] : [-H.faceDir]; for (const sg of sides) { const ex = H.fs < 0.2 ? sg * H.hw * 0.99 : -H.faceDir * H.hw * (1 - H.fs * 0.15); c.fillStyle = color; c.strokeStyle = INK; c.lineWidth = H.lw * 1.2; K.circle(c, ex, y, 0.0075); c.stroke(); c.fill(); c.fillStyle = '#fffbe6'; K.circle(c, ex - 0.002, y - 0.002, 0.0022); c.fill(); } }; }

  const ELI1 = mk({ name: 'Eli', h: 0.95, phase: 2.1, shadowW: 0.15, legLen: 0.37, shoulderW: 0.09, hipW: 0.047, legW: 0.057, legColor: JEANS,
    head: { kind: 'capsule', hw: 0.082, hh: 0.138, lean: 0.03 }, hairTop: 0.03,
    torso: { wTop: 0.107, wBot: 0.099, dTop: 0.082, dBot: 0.084, color: TEE, belly: 0.012 },
    arm: { w: 0.038, skinPart: true, sleeve: TEE, sleeveTo: 0.36, sleeveW: 0.058, hand: 0.029 },
    skin: ELI_SKIN,
    boot: { h: 0.077, w: 0.042, foot: 0.062, toe: 0.05, back: 0.014, sole: 0.016, color: '#2b2729', soleColor: '#151214', laces: true },
    face: { eyes: 'googly', eyeR: 0.035, eyeSep: 0.034, eyeY: -0.004, pupil: 0.36, goofy: 0.8, nose: 0.012, noseY: 0.04, mouthY: 0.07, mouthW: 0.05, lidBias: -0.1, grinOpen: 0.16, grinW: 0.8,
      brows: 0.013, browColor: '#1a100e', browGap: 1.38, browW: 1.0, browsLate: true, blushColor: ELI_BLUSH },
    collar: crewCollar('#dcd5c6'), outfitTop: apron, hat: beanie(BEANIE, BEANIE_D) });
  const MILA1 = mk({ name: 'Mila', h: 1.08, phase: 0.8, shadowW: 0.13, legLen: 0.46, shoulderW: 0.069, hipW: 0.034, legW: 0.05, legColor: MUSTARD,
    head: { kind: 'capsule', hw: 0.063, hh: 0.152, lean: 0.06 }, hairTop: 0.01,
    torso: { wTop: 0.087, wBot: 0.079, dTop: 0.06, dBot: 0.062, color: PURPLE },
    arm: { w: 0.04, sleeve: PURPLE, cuff: PURPLE_D, hand: 0.027 },
    skin: '#d9a66c',
    boot: { h: 0.148, w: 0.034, foot: 0.062, toe: 0.05, back: 0.012, sole: 0.014, color: GREEN, lip: true },
    face: { eyes: 'googly', eyeR: 0.034, eyeSep: 0.031, eyeY: -0.04, pupil: 0.34, goofy: 0.6, nose: 0.011, noseY: 0.048, mouthY: 0.056, mouthW: 0.041, lidBias: 0.36, lashes: true, lip: '#8e3346', grinOpen: 0.1, grinW: 0.62,
      brows: 0.011, browColor: '#2e1d22', browGap: 1.4, browW: 0.95, browsLate: true, profMouth: 1.45 },
    collar: crewCollar(PURPLE_D), outfit: overalls, outfitTop: overallStraps, hair: '#2e1d22' });
  // hairFlop (animatic, beat 2 gag): the ponytail swings over the top of the head (0 -> 0.5: up) and lands on her face
  // (1). Drawn behind the head while it is still behind/up (< 0.45), over the face after that (headTop).
  function ponyFlop(c, H, k) {
    const back = H.fs > 0.05 ? -H.faceDir : -1, rx = H.fs > 0.05 ? back * H.hw * 0.35 * H.fs : 0, ry = -H.hh + 0.012, fd = -back;
    const N = [[rx + back * 0.1, ry - 0.03], [rx + back * 0.105, ry + 0.13]], U = [[rx + back * 0.05, ry - 0.09], [rx + back * 0.015, ry - 0.155]],
      F = [[fd * H.hw * 1.0, -H.hh - 0.03], [fd * H.hw * 0.3, H.F.mouthY + 0.02]];
    const L = (a, b, u) => [K.lerp(a[0], b[0], u), K.lerp(a[1], b[1], u)];
    const u = K.clamp(k), ctl = u < 0.5 ? L(N[0], U[0], u * 2) : L(U[0], F[0], u * 2 - 1), tip = u < 0.5 ? L(N[1], U[1], u * 2) : L(U[1], F[1], u * 2 - 1);
    const sw = Math.sin(H.t * 2.4) * 0.006, P0 = [rx, ry], pts = [];
    for (let i = 0; i <= 12; i++) { const v = i / 12, a = (1 - v) * (1 - v), b = 2 * v * (1 - v), d = v * v; pts.push([a * P0[0] + b * ctl[0] + d * (tip[0] + sw), a * P0[1] + b * ctl[1] + d * tip[1]]); }
    const left = [], right = [];
    for (let i = 0; i <= 12; i++) { const p = pts[i], q = pts[Math.min(12, i + 1)], o2 = pts[Math.max(0, i - 1)], dx = q[0] - o2[0], dy = q[1] - o2[1], dl = Math.hypot(dx, dy) || 1;
      const w = K.lerp(0.022, 0.011, i / 12) * (1 + 0.7 * Math.sin(Math.PI * i / 12) * K.clamp(k * 2 - 1, 0, 1) + 0.4 * Math.sin(Math.PI * i / 12)); left.push([p[0] - dy / dl * w, p[1] + dx / dl * w]); right.push([p[0] + dy / dl * w, p[1] - dx / dl * w]); }
    c.fillStyle = MILA1.hair; c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(left[0][0], left[0][1]); for (const p of left) c.lineTo(p[0], p[1]); for (let i = right.length - 1; i >= 0; i--) c.lineTo(right[i][0], right[i][1]); c.closePath(); c.stroke(); c.fill();
    c.strokeStyle = K.rgba('#5a3a3a', 0.8); c.lineWidth = H.lw * 1.2; c.beginPath(); c.moveTo(pts[1][0], pts[1][1]); for (let i = 2; i < 12; i++) c.lineTo(pts[i][0], pts[i][1]); c.stroke();
    c.fillStyle = MUSTARD; c.strokeStyle = INK; c.lineWidth = H.lw * 1.5; K.ellipse(c, rx + back * 0.004, ry - 0.006, 0.016, 0.0095, back * 0.55); c.fill(); c.stroke();
  }
  MILA1.hairBack = function (c, H) { // high ponytail that swings (t) and trails in the wind (drag)
    if (H.flop > 0.001) { if (H.flop < 0.45) ponyFlop(c, H, H.flop); return; }
    const back = H.fs > 0.05 ? -H.faceDir : -1, rx = H.fs > 0.05 ? back * H.hw * 0.35 * H.fs : 0, ry = -H.hh + 0.012;
    const sw = Math.sin(H.t * 2.4) * 0.012 + Math.sin(H.t * 5.1) * 0.004 - H.drag * 0.03 * H.dir;
    c.fillStyle = MILA1.hair; c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.lineJoin = 'round';
    const tipX = rx + back * (0.085 + 0.02 * H.fs) + sw, tipY = ry + 0.13 - H.drag * 0.04;
    c.beginPath(); c.moveTo(rx - back * 0.012, ry - 0.012);
    c.bezierCurveTo(rx + back * 0.03, ry - 0.075, rx + back * 0.1, ry - 0.03, tipX + back * 0.012, tipY - 0.03);
    c.quadraticCurveTo(tipX + back * 0.006, tipY + 0.01, tipX - back * 0.012, tipY + 0.012);
    c.quadraticCurveTo(tipX - back * 0.004, tipY - 0.04, rx + back * 0.03, ry + 0.012);
    c.closePath(); c.stroke(); c.fill();
    c.strokeStyle = K.rgba('#5a3a3a', 0.8); c.lineWidth = H.lw * 1.2;
    c.beginPath(); c.moveTo(rx + back * 0.02, ry - 0.035); c.quadraticCurveTo(rx + back * 0.075, ry - 0.03, tipX, tipY - 0.02); c.stroke();
  };
  MILA1.hairFront = function (c, H) {
    const hw = H.hw, hh = H.hh, fd = H.faceDir, fs = H.fs, S = MILA1;
    c.save(); h.headPath(c, S.head); c.clip();
    const a = (fs > 0.05 ? fd : 1);
    const hl = () => { c.beginPath(); c.moveTo(-a * hw * 1.2, -hh + 0.085); c.lineTo(-a * hw * 1.2, -hh - 0.05); c.lineTo(a * hw * 1.2, -hh - 0.05); c.lineTo(a * hw * 1.2, -hh + 0.1);
      c.bezierCurveTo(a * hw * 0.7 + fd * fs * hw * 0.2, -hh + 0.07, a * hw * 0.2, -hh + 0.025, -a * hw * 0.3 + fd * fs * hw * 0.5, -hh + 0.03);
      c.quadraticCurveTo(-a * hw * 0.85, -hh + 0.045, -a * hw * 1.2, -hh + 0.085); c.closePath(); };
    hl(); c.fillStyle = S.hair; c.fill(); c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.stroke();
    c.strokeStyle = K.rgba('#6a4646', 0.85); c.lineWidth = H.lw * 1.2; c.beginPath(); c.moveTo(-hw * 0.2 * a, -hh + 0.01); c.quadraticCurveTo(hw * 0.4 * a, -hh + 0.05, hw * 0.9 * a, -hh + 0.085); c.stroke();
    c.restore(); outlineHead(c, H, S);
  };
  MILA1.headTop = function (c, H, B) {
    if (H.flop >= 0.45 && !H.back) { drops(GOLD, H.F.mouthY - 0.006)(c, H); ponyFlop(c, H, H.flop); return; }
    const back = H.fs > 0.05 ? -H.faceDir : -1, rx = backX(H, 0.35), ry = -H.hh + 0.004;
    c.fillStyle = MUSTARD; c.strokeStyle = INK; c.lineWidth = H.lw * 1.5; K.ellipse(c, rx + back * 0.008, ry - 0.008, 0.016, 0.0095, back * 0.55); c.fill(); c.stroke();
    c.strokeStyle = K.rgba(INK, 0.45); c.lineWidth = H.lw * 0.9; c.beginPath(); c.moveTo(rx + back * 0.002, ry - 0.016); c.lineTo(rx + back * 0.014, ry); c.stroke();
    drops(GOLD, H.F.mouthY - 0.006)(c, H);
  };
  // back views (turnaround, wide rear shots, the night hill)
  ELI1.outfitBack = function (c, B) { // tee back (clipped to the torso): the apron neck strap + the waist band
    // clothes QC 2026-10-16: the neck strap is the SAME flat band as in front (apron-dark, ink edges), looping behind the
    // neck under the collar line (it used to be a thin dark cord here and a flat band in front)
    const nw = Math.min(B.hw * 0.86, B.wT * 0.82) * (1 - 0.25 * B.s), nx = B.hcx, y = B.Ttop + 0.004;
    const loop = () => { c.beginPath(); c.moveTo(nx - nw * 0.75, B.Ttop - 0.02); c.quadraticCurveTo(nx - nw * 0.6, y + 0.01, nx, y + 0.012); c.quadraticCurveTo(nx + nw * 0.6, y + 0.01, nx + nw * 0.75, B.Ttop - 0.02); };
    c.lineCap = 'butt'; loop(); c.strokeStyle = INK; c.lineWidth = 0.012 + B.lw * 2; c.stroke(); loop(); c.strokeStyle = APRON_D; c.lineWidth = 0.012; c.stroke();
    c.fillStyle = '#3b2a20'; c.strokeStyle = INK; c.lineWidth = B.lw * 1.4; c.beginPath(); c.rect(B.tcx - 0.3, B.Tbot - 0.024, 0.6, 0.02); c.fill(); c.stroke();
  };
  ELI1.outfitBackTop = function (c, B) { // the bow at the back of the waist and its two ties, hanging free over the jeans
    if (B.seated) { c.save(); B.torsoPath(c); c.clip(); }   // seated: the ties rest on the seat (no strands in the air)
    const bx = B.tcx - B.dir * B.s * B.wB * 0.35, by = B.Tbot - 0.014, sw = Math.sin(B.t * 2.3) * 0.004;
    const ties = () => { c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx - 0.008, by + 0.03, bx - 0.012 + sw, by + 0.055); c.moveTo(bx, by); c.quadraticCurveTo(bx + 0.01, by + 0.028, bx + 0.016 + sw, by + 0.05); };
    c.lineCap = 'round'; ties(); c.strokeStyle = INK; c.lineWidth = 0.009 + B.lw * 2; c.stroke(); ties(); c.strokeStyle = '#4a3326'; c.lineWidth = 0.009; c.stroke();
    c.strokeStyle = INK; c.lineWidth = B.lw * 2; c.fillStyle = '#4a3326';
    for (const sg of [-1, 1]) { c.beginPath(); c.ellipse(bx + sg * 0.017, by - 0.003, 0.017, 0.0105, sg * 0.3, 0, K.TAU); c.stroke(); }
    for (const sg of [-1, 1]) { c.beginPath(); c.ellipse(bx + sg * 0.017, by - 0.003, 0.017, 0.0105, sg * 0.3, 0, K.TAU); c.fill(); }
    c.lineWidth = B.lw * 1.4; disc(c, bx, by - 0.002, 0.0075); c.fill(); c.stroke();
    if (B.seated) c.restore();
  };
  ELI1.backUnder = function (c, B) { // back 3/4: the far edge of the apron skirt peeks past the body (it used to vanish)
    if (B.s < 0.3 || B.seated) return;
    apronSkirt(c, B, B.tcx + B.dir * B.s * B.wB * 0.5, false);
  };
  ELI1.solidTo = S => -S.legLen * 0.52 + 0.012;   // the leg slot under the skirt is solid for the shade test
  MILA1.outfitBack = function (c, B) { // overall back: a small bib and straps crossing in an X, brass buttons
    // clothes QC 2026-10-16: in back 3/4 the back panel turns with the body (its centre moves away from the facing side);
    // it used to stay centred, so the straps, patch and pockets slid across the turned torso
    const waist = B.Tbot - 0.09, top = B.Ttop + 0.13, bw = 0.045 * (1 - 0.45 * B.s), bx = B.tcx - B.dir * B.s * B.wT * 0.35;
    c.fillStyle = MUSTARD; c.strokeStyle = INK; c.lineWidth = B.lw * 2;
    c.beginPath(); c.moveTo(B.tcx - 0.2, waist); c.lineTo(bx - bw, waist); c.lineTo(bx - bw, top); c.lineTo(bx + bw, top); c.lineTo(bx + bw, waist); c.lineTo(B.tcx + 0.2, waist); c.lineTo(B.tcx + 0.2, 0.2); c.lineTo(B.tcx - 0.2, 0.2); c.closePath(); c.stroke(); c.fill();
    for (const sg of [-1, 1]) { const sx = bx + sg * bw * 0.22, ex = bx - sg * B.wT * 0.62 * (1 - 0.3 * B.s);
      c.lineCap = 'butt'; c.strokeStyle = INK; c.lineWidth = 0.016 + B.lw * 2; c.beginPath(); c.moveTo(sx, top - 0.004); c.lineTo(ex, B.Ttop - 0.01); c.stroke();
      c.strokeStyle = MUSTARD; c.lineWidth = 0.016; c.beginPath(); c.moveTo(sx, top - 0.002); c.lineTo(ex, B.Ttop - 0.01); c.stroke(); }
    { // a stitched patch where the straps meet the bib (a clean yoke, never a letter «A»)
      const cy = top - 0.012, cx = bx; c.fillStyle = MUSTARD_D; c.strokeStyle = INK; c.lineWidth = B.lw * 1.4;
      K.rrect(c, cx - 0.016, cy - 0.014, 0.032, 0.028, 0.006); c.fill(); c.stroke(); }
    c.fillStyle = MUSTARD_D; c.lineWidth = B.lw * 1.4; c.strokeStyle = INK; for (const sg of [-1, 1]) { const pw = 0.04 * (1 - 0.3 * B.s); K.rrect(c, bx + sg * 0.045 * (1 - 0.3 * B.s) - pw / 2, waist + 0.03, pw, 0.035, 0.005); c.fill(); c.stroke(); }
  };
  MILA1.backHair = function (c, H) { // back of the head: hair cap over the crown + the ponytail hanging in front of it
    c.save(); h.headPath(c, MILA1.head); c.clip(); c.fillStyle = MILA1.hair; c.beginPath(); c.moveTo(-H.hw * 1.3, -H.hh * 0.2); c.quadraticCurveTo(0, -H.hh * 0.02, H.hw * 1.3, -H.hh * 0.2); c.lineTo(H.hw * 1.3, -H.hh * 1.3); c.lineTo(-H.hw * 1.3, -H.hh * 1.3); c.closePath(); c.fill();
    c.strokeStyle = K.rgba('#6a4646', 0.85); c.lineWidth = H.lw * 1.2; for (const k of [-0.5, 0.5]) { c.beginPath(); c.moveTo(0, -H.hh + 0.01); c.quadraticCurveTo(k * H.hw * 0.9, -H.hh * 0.5, k * H.hw * 1.0, -H.hh * 0.15); c.stroke(); }
    c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.beginPath(); c.moveTo(-H.hw * 1.3, -H.hh * 0.2); c.quadraticCurveTo(0, -H.hh * 0.02, H.hw * 1.3, -H.hh * 0.2); c.stroke(); c.restore(); outlineHead(c, H, MILA1);
    const sw = Math.sin(H.t * 2.4) * 0.01 - H.drag * 0.03 * H.dir, x = -H.faceDir * H.s * H.hw * 0.2, y0 = -H.hh + 0.01;
    c.fillStyle = MILA1.hair; c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.beginPath(); c.moveTo(x - 0.02, y0 - 0.01); c.quadraticCurveTo(x - 0.034, y0 + 0.12, x - 0.012 + sw, y0 + 0.24); c.quadraticCurveTo(x + sw, y0 + 0.265, x + 0.012 + sw, y0 + 0.24); c.quadraticCurveTo(x + 0.034, y0 + 0.12, x + 0.02, y0 - 0.01); c.closePath(); c.stroke(); c.fill();
    c.strokeStyle = K.rgba('#5a3a3a', 0.8); c.lineWidth = H.lw * 1.1; c.beginPath(); c.moveTo(x, y0 + 0.02); c.quadraticCurveTo(x - 0.008, y0 + 0.12, x + sw * 0.8, y0 + 0.22); c.stroke();
    c.fillStyle = MUSTARD; c.strokeStyle = INK; c.lineWidth = H.lw * 1.6; K.ellipse(c, x, y0 + 0.004, 0.024, 0.012); c.fill(); c.stroke();
  };
  { const hb = MILA1.hairBack; MILA1.hairBack = function (c, H, B) { if (H.back) return; hb(c, H, B); }; }
  C.define('eli1', ELI1); C.define('mila1', MILA1); C.ELI_SKIN = ELI_SKIN;

  // =============================================================== ALT 2 · Carretera 70 (retro road trip)
  const COBALT = '#3557c9', COBALT_D = '#26409a', CREAM = '#f1e6cc', CORD = '#6b4a32', RASP = '#c2386f', RASP_D = '#962a55', SUEDE = '#c99a62', SUEDE_D = '#a37845';
  const ELI2 = mk({ name: 'Eli', h: 1.0, phase: 1.3, shadowW: 0.15, legLen: 0.4, shoulderW: 0.088, hipW: 0.045, legW: 0.056, legColor: CORD, flare: 0.55,
    head: { kind: 'capsule', hw: 0.078, hh: 0.13, lean: 0.03 }, hairTop: 0.06,
    torso: { wTop: 0.104, wBot: 0.094, dTop: 0.08, dBot: 0.08, color: COBALT, belly: 0.008 },
    arm: { w: 0.038, skinPart: true, sleeve: COBALT, sleeveTo: 0.38, sleeveW: 0.066, sleeveBand: CREAM, hand: 0.028, watch: '#e2c05a' },
    skin: '#9a6447',
    boot: { h: 0.06, w: 0.04, foot: 0.058, toe: 0.05, back: 0.012, sole: 0.02, color: '#f3eee2', soleColor: '#c9a46a', laces: true, laceColor: COBALT },
    face: { eyes: 'googly', eyeR: 0.033, eyeSep: 0.033, eyeY: -0.016, pupil: 0.38, goofy: 0.5, nose: 0.013, noseY: 0.043, mouthY: 0.072, mouthW: 0.042, lidBias: -0.05, grinOpen: 0.15, grinW: 0.78 },
    hair: '#1c1314',
    collar(c, B) { // cream ringer collar band
      const w = B.hw * 1.1, y = B.Ttop + 0.002, x = B.tcx + B.dir * B.s * B.wT * 0.25;
      c.strokeStyle = INK; c.lineWidth = B.lw * 2; c.fillStyle = CREAM;
      c.beginPath(); c.moveTo(x - w, y - 0.004); c.quadraticCurveTo(x, y + 0.06, x + w, y - 0.004); c.lineTo(x + w * 0.78, y - 0.004); c.quadraticCurveTo(x, y + 0.035, x - w * 0.78, y - 0.004); c.closePath(); c.stroke(); c.fill();
    },
    outfit(c, B) { // a chest stripe pair (70s ringer) + belt with a big buckle
      const y = B.Ttop + 0.11; c.fillStyle = CREAM; c.fillRect(B.tcx - 0.3, y, 0.6, 0.014); c.fillRect(B.tcx - 0.3, y + 0.024, 0.6, 0.008);
      c.fillStyle = '#3a2418'; c.fillRect(B.tcx - 0.3, B.Tbot - 0.026, 0.6, 0.026);
      const bx = B.tcx + B.dir * B.s * B.wB * 0.5; c.fillStyle = '#e2c05a'; c.strokeStyle = INK; c.lineWidth = B.lw * 1.4; K.rrect(c, bx - 0.022 * (1 - 0.4 * B.s), B.Tbot - 0.03, 0.044 * (1 - 0.4 * B.s), 0.034, 0.008); c.fill(); c.stroke();
    },
  });
  ELI2.hairBack = function (c, H) { // a big round afro (lobed), slightly behind the head; bounces a little
    const b = Math.sin(H.t * 3.0) * 0.002, cx = backX(H, 0.25);
    lobedShape(c, cx, -H.hh * 0.52 + b, H.hw * 1.62, 13, 21, ELI2.hair, H.lw, 0.36);
  };
  ELI2.hairFront = function (c, H) { // the hairline over the forehead + sideburns, clipped to the head
    const S = ELI2, hw = H.hw, hh = H.hh;
    c.save(); h.headPath(c, S.head); c.clip();
    c.fillStyle = S.hair; c.beginPath(); c.moveTo(-hw * 1.3, -hh * 0.05); c.lineTo(-hw * 1.3, -hh * 1.4); c.lineTo(hw * 1.3, -hh * 1.4); c.lineTo(hw * 1.3, -hh * 0.05);
    c.quadraticCurveTo(hw * 0.95, -hh * 0.42, hw * 0.55 + H.faceDir * H.fs * hw * 0.3, -hh * 0.5); c.quadraticCurveTo(H.faceDir * H.fs * hw * 0.5, -hh * 0.6, -hw * 0.55 + H.faceDir * H.fs * hw * 0.5, -hh * 0.5); c.quadraticCurveTo(-hw * 0.95, -hh * 0.42, -hw * 1.3, -hh * 0.05); c.closePath(); c.fill();
    c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.stroke(); c.restore(); outlineHead(c, H, S);
  };
  ELI2.face.mustache = function (c, H, fx, fy) { // a thin 70s mustache
    if (H.E.mouth === 'yell' || H.E.mouth === 'laugh') return;
    const y = fy + H.F.mouthY - 0.018, w = H.F.mouthW * 0.62 * (1 - 0.4 * H.fs), x = fx + H.faceDir * H.fs * H.hw * 0.2;
    c.fillStyle = ELI2.hair; c.beginPath(); c.moveTo(x - w, y + 0.008); c.quadraticCurveTo(x - w * 0.5, y - 0.008, x, y - 0.002); c.quadraticCurveTo(x + w * 0.5, y - 0.008, x + w, y + 0.008); c.quadraticCurveTo(x, y + 0.004, x - w, y + 0.008); c.fill();
  };
  ELI2.headTop = function (c, H) { // aviators pushed up into the afro
    const y = -H.hh - 0.012, x0 = H.faceDir * H.fs * H.hw * 0.35, sep = 0.036 * (1 - 0.35 * H.fs), r = 0.026;
    c.strokeStyle = '#d9b44a'; c.lineWidth = H.lw * 1.8;
    for (const sg of (H.fs > 0.85 ? [H.faceDir] : [-1, 1])) { const x = x0 + sg * sep;
      c.fillStyle = K.rgba('#e0903a', 0.85); c.beginPath(); c.moveTo(x - r, y - r * 0.5); c.quadraticCurveTo(x, y - r * 0.75, x + r, y - r * 0.5); c.quadraticCurveTo(x + r * 0.95, y + r * 0.7, x, y + r * 0.8); c.quadraticCurveTo(x - r * 0.95, y + r * 0.7, x - r, y - r * 0.5); c.closePath(); c.fill();
      c.strokeStyle = INK; c.lineWidth = H.lw * 2.6; c.stroke(); c.strokeStyle = '#e8c25a'; c.lineWidth = H.lw * 1.2; c.stroke();
      c.strokeStyle = K.rgba('#fff3d0', 0.8); c.lineWidth = H.lw * 1.1; c.beginPath(); c.moveTo(x - r * 0.5, y - r * 0.2); c.lineTo(x - r * 0.1, y - r * 0.4); c.stroke(); }
    if (H.fs <= 0.85) { c.strokeStyle = INK; c.lineWidth = H.lw * 1.6; c.beginPath(); c.moveTo(x0 - sep + r, y - r * 0.45); c.quadraticCurveTo(x0, y - r * 0.75, x0 + sep - r, y - r * 0.45); c.stroke(); }
  };
  const MILA2 = mk({ name: 'Mila', h: 1.02, phase: 0.5, shadowW: 0.13, legLen: 0.45, shoulderW: 0.066, hipW: 0.034, legW: 0.05, legColor: CREAM, flare: 0.75,
    head: { kind: 'capsule', hw: 0.062, hh: 0.148, lean: 0.05 }, hairTop: 0.012,
    torso: { wTop: 0.084, wBot: 0.078, dTop: 0.06, dBot: 0.062, color: RASP },
    arm: { w: 0.038, sleeve: RASP, cuff: RASP_D, hand: 0.026 },
    skin: '#e2b98f', hair: '#5a2a22',
    boot: { h: 0.05, w: 0.034, foot: 0.06, toe: 0.045, back: 0.012, sole: 0.03, color: '#7a4a2e', soleColor: '#e8d6b0' },
    face: { eyes: 'googly', eyeR: 0.033, eyeSep: 0.03, eyeY: -0.04, pupil: 0.34, goofy: 0.4, nose: 0.011, noseY: 0.05, mouthY: 0.052, mouthW: 0.034, lidBias: 0.28, lashes: true, lip: '#a02a50', grinOpen: 0.1, grinW: 0.62 },
    collar: turtleneck(RASP_D, 0.72),
    outfitTop(c, B) { // suede fringe vest, open at the front
      const s = B.s, d = B.dir, x = B.tcx + d * s * B.wT * 0.35, top = B.Ttop + 0.005, bot = B.Tbot + 0.035;
      for (const sg of [-1, 1]) { if (s > 0.8 && sg === d) continue;
        const ins = sg * 0.022 * (1 - 0.5 * s), outT = B.tcx + sg * B.wT * 1.02, outB = B.tcx + sg * B.wB * 1.04;
        c.fillStyle = SUEDE; c.strokeStyle = INK; c.lineWidth = B.lw * 2;
        c.beginPath(); c.moveTo(outT, top); c.lineTo(x + ins + sg * 0.01, top); c.lineTo(x + ins, bot); c.lineTo(outB, bot); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = SUEDE_D; c.lineWidth = B.lw * 1.6; c.lineCap = 'round'; // fringe
        const sw = Math.sin(B.t * 2.2 + sg) * 0.004 - B.drag * 0.012 * d;
        for (let i = 0; i <= 6; i++) { const fx = K.lerp(x + ins, outB, i / 6); c.beginPath(); c.moveTo(fx, bot); c.lineTo(fx + sw, bot + 0.03); c.stroke(); }
        c.strokeStyle = K.rgba(INK, 0.35); c.lineWidth = B.lw; c.setLineDash([0.006, 0.006]); c.beginPath(); c.moveTo(x + ins + sg * 0.008, top + 0.01); c.lineTo(x + ins + sg * 0.006, bot - 0.008); c.stroke(); c.setLineDash([]);
      }
    },
  });
  MILA2.hairBack = function (c, H) { // long straight curtain to below the shoulders, swaying
    const S = MILA2, hw = H.hw, hh = H.hh, sw = Math.sin(H.t * 1.8 + 1) * 0.006 - H.drag * 0.03 * H.dir, bx = backX(H, 0.4);
    c.fillStyle = S.hair; c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.lineJoin = 'round';
    const w = hw * (1.42 - 0.12 * H.fs), y1 = hh + 0.15;
    c.beginPath(); c.moveTo(bx - w, -hh * 0.4); c.quadraticCurveTo(bx - w * 1.02, -hh - 0.02, bx, -hh - 0.018); c.quadraticCurveTo(bx + w * 1.02, -hh - 0.02, bx + w, -hh * 0.4);
    c.lineTo(bx + w + sw, y1 - 0.02); c.quadraticCurveTo(bx + w + sw, y1, bx + w * 0.7 + sw, y1); c.lineTo(bx - w * 0.7 + sw, y1); c.quadraticCurveTo(bx - w + sw, y1, bx - w + sw, y1 - 0.02); c.closePath(); c.stroke(); c.fill();
    c.strokeStyle = K.rgba('#8a4a3a', 0.8); c.lineWidth = H.lw * 1.1; for (const k of [-0.6, 0.6]) { c.beginPath(); c.moveTo(bx + k * w, -hh * 0.2); c.lineTo(bx + k * w * 1.02 + sw, y1 - 0.03); c.stroke(); }
  };
  MILA2.hairFront = function (c, H) { // centre part, hair framing the face to the jaw, a woven headband
    const S = MILA2, hw = H.hw, hh = H.hh, px = H.faceDir * H.fs * hw * 0.5;
    c.save(); h.headPath(c, S.head); c.clip();
    c.fillStyle = S.hair; c.beginPath(); c.moveTo(-hw * 1.3, hh * 0.6); c.lineTo(-hw * 1.3, -hh * 1.3); c.lineTo(hw * 1.3, -hh * 1.3); c.lineTo(hw * 1.3, hh * 0.6);
    const fw = H.fs > 0.6 ? 0.7 : 1;
    c.lineTo(hw * (0.98 - 0.25 * fw) + px * 1.2, hh * 0.6); c.quadraticCurveTo(hw * 0.62 + px, -hh * 0.55, px, -hh * 0.72); c.quadraticCurveTo(-hw * 0.62 + px, -hh * 0.55, -hw * (0.98 - 0.25 * fw) + px * 1.2, hh * 0.6); c.closePath(); c.fill();
    c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.stroke();
    // headband
    const y = -hh * 0.66; c.fillStyle = RASP; c.fillRect(-hw * 1.3, y - 0.01, hw * 2.6, 0.02); c.strokeStyle = INK; c.lineWidth = H.lw * 1.4; c.strokeRect(-hw * 1.3, y - 0.01, hw * 2.6, 0.02);
    c.strokeStyle = CREAM; c.lineWidth = H.lw * 1.1; c.beginPath(); for (let i = 0; i <= 14; i++) { const x = -hw * 1.3 + i * hw * 2.6 / 14; c[i ? 'lineTo' : 'moveTo'](x, y + (i % 2 ? -0.005 : 0.005)); } c.stroke();
    c.restore(); outlineHead(c, H, S);
  };
  MILA2.headTop = function (c, H) { // a daisy tucked behind the ear (back side)
    const x = H.fs < 0.2 ? -H.hw * 1.0 : -H.faceDir * H.hw * 0.95, y = -H.hh * 0.38, r = 0.016, sw = Math.sin(H.t * 1.6) * 0.15;
    c.save(); c.translate(x, y); c.rotate(sw); c.fillStyle = '#fbf6ea'; c.strokeStyle = INK; c.lineWidth = H.lw * 1.1;
    for (let i = 0; i < 7; i++) { const a = i / 7 * K.TAU; K.ellipse(c, Math.cos(a) * r, Math.sin(a) * r, r * 0.62, r * 0.34, a); c.stroke(); c.fill(); }
    c.fillStyle = '#f2b628'; K.circle(c, 0, 0, r * 0.5); c.fill(); c.stroke(); c.restore();
  };
  C.define('eli2', ELI2); C.define('mila2', MILA2);

  // =============================================================== ALT 3 · Barrio (streetwear, younger, chibi egg heads, dot eyes)
  const LIME = '#a6d23a', LIME_D = '#7fa828', CARGO = '#6d6f58', VCOB = '#2f55c8', VCOB_D = '#213f99', VCREAM = '#f3ead5', DENIM = '#8fa9d6';
  const ELI3 = mk({ name: 'Eli', h: 0.94, phase: 1.7, shadowW: 0.16, legLen: 0.33, shoulderW: 0.092, hipW: 0.05, legW: 0.064, legColor: CARGO,
    head: { kind: 'egg', hw: 0.12, hh: 0.112, top: 0.74, lean: 0.0, neck: 0, cy: 0.78 }, shoulder: 0.66, armX: 0.06,
    torso: { top: 0.685, bot: 0.3, wTop: 0.118, wBot: 0.122, dTop: 0.095, dBot: 0.1, color: LIME, belly: 0.01, round: 0.06 }, headOver: true,
    arm: { w: 0.05, sleeve: LIME, cuff: LIME_D, hand: 0.03 },
    skin: '#f0c3a0', hair: '#c8632e',
    boot: { h: 0.075, w: 0.048, foot: 0.07, toe: 0.055, back: 0.016, sole: 0.026, color: '#f6f2e8', soleColor: LIME, laces: true, laceColor: '#7a7a7a', toeCap: '#e2ddd0' },
    face: { eyes: 'dot', eyeR: 0.016, eyeSep: 0.04, eyeY: 0.0, mouthY: 0.058, mouthW: 0.044, brows: 0.0085, browW: 1.25, browGap: 2.2, browColor: '#a8501f', blush: 0.25, freckles: '#b4683e', nose: 0.012, noseY: 0.03, turnK: 0.55, grinW: 0.82, grinOpen: 0.15, edgeK: 0.96 },
    under(c, B) { // the hood behind the neck
      c.fillStyle = LIME_D; c.strokeStyle = INK; c.lineWidth = B.lw * 2; K.ellipse(c, B.tcx - B.dir * B.s * 0.03, B.Ttop + 0.01, B.wT * 0.95, 0.05); c.stroke(); c.fill();
    },
    outfit(c, B) { // kangaroo pocket, hem rib, drawstrings
      const s = B.s, d = B.dir, x = B.tcx + d * s * B.wB * 0.45, w = 0.075 * (1 - 0.45 * s), y = B.Tbot - 0.11;
      c.fillStyle = LIME_D; c.fillRect(B.tcx - 0.3, B.Tbot - 0.03, 0.6, 0.03);
      c.fillStyle = K.shade(LIME, -0.06); c.strokeStyle = INK; c.lineWidth = B.lw * 1.6;
      c.beginPath(); c.moveTo(x - w, y + 0.075); c.lineTo(x - w * 0.7, y); c.lineTo(x + w * 0.7, y); c.lineTo(x + w, y + 0.075); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#2e3a1a'; c.lineWidth = 0.006; c.lineCap = 'round'; const sw = Math.sin(B.t * 2.4) * 0.004;
      for (const sg of [-1, 1]) { const sx = B.tcx + d * s * 0.03 + sg * 0.022 * (1 - 0.5 * s); c.beginPath(); c.moveTo(sx, B.Ttop + 0.01); c.lineTo(sx + sw, B.Ttop + 0.085); c.stroke(); c.fillStyle = '#e8e2d2'; K.circle(c, sx + sw, B.Ttop + 0.09, 0.006); c.fill(); }
    },
    collar(c, B) { // headphones resting round the neck
      const x = B.tcx + B.dir * B.s * 0.02, y = B.Ttop - 0.004;
      c.strokeStyle = INK; c.lineWidth = 0.014 + B.lw * 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - B.wT * 0.62, y); c.quadraticCurveTo(x, y + 0.05, x + B.wT * 0.62, y); c.stroke();
      c.strokeStyle = '#3a3a44'; c.lineWidth = 0.014; c.stroke();
      for (const sg of (B.s > 0.8 ? [B.dir] : [-1, 1])) { const cx = x + sg * B.wT * 0.66 * (1 - 0.4 * B.s); c.fillStyle = '#2c2c34'; c.strokeStyle = INK; c.lineWidth = B.lw * 2; K.ellipse(c, cx, y - 0.004, 0.026, 0.03); c.stroke(); c.fill(); c.fillStyle = LIME; K.ellipse(c, cx, y - 0.004, 0.012, 0.014); c.fill(); }
    },
  });
  ELI3.hat = function (c, H) { // backwards cap (lime, dark brim), ginger tufts at the sides and through the snap opening
    const hw = H.hw, hh = H.hh, fd = H.faceDir, fs = H.fs, bob = Math.sin(H.t * 3.1) * 0.002 - H.hatHit * 0.01, sq = 1 - H.hatHit * 0.2;
    c.save(); c.translate(0, -hh * 0.35 + bob); c.scale(1, sq); c.translate(0, hh * 0.35);
    // tufts
    c.fillStyle = ELI3.hair; c.strokeStyle = INK; c.lineWidth = H.lw * 1.6;
    for (const sg of (fs < 0.3 ? [-1, 1] : [-fd])) { const x = sg * hw * 0.92 * (fs < 0.3 ? 1 : 1 - 0.1 * fs); c.beginPath(); c.moveTo(x - sg * 0.02, -hh * 0.42); c.lineTo(x + sg * 0.018, -hh * 0.34); c.lineTo(x - sg * 0.004, -hh * 0.27); c.lineTo(x + sg * 0.014, -hh * 0.2); c.lineTo(x - sg * 0.02, -hh * 0.2); c.closePath(); c.stroke(); c.fill(); }
    const dome = () => { c.beginPath(); c.moveTo(-hw * 0.98, -hh * 0.36); c.bezierCurveTo(-hw * 1.0, -hh * 1.3, hw * 1.0, -hh * 1.3, hw * 0.98, -hh * 0.36); c.quadraticCurveTo(0, -hh * 0.44, -hw * 0.98, -hh * 0.36); c.closePath(); };
    // brim sticking out at the back (side / 3/4 views)
    if (fs > 0.2) { const bx = -fd * hw * 0.85; c.fillStyle = '#2a3a1c'; c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.beginPath(); c.moveTo(bx, -hh * 0.5); c.quadraticCurveTo(bx - fd * hw * 0.65 * fs, -hh * 0.48, bx - fd * hw * 0.75 * fs, -hh * 0.36); c.lineTo(bx + fd * 0.01, -hh * 0.36); c.closePath(); c.stroke(); c.fill(); }
    h.shape(c, dome, LIME, H.lw);
    c.save(); dome(); c.clip(); c.strokeStyle = LIME_D; c.lineWidth = H.lw * 1.2; c.beginPath(); c.moveTo(fd * fs * hw * 0.3, -hh * 1.0); c.quadraticCurveTo(fd * fs * hw * 0.35, -hh * 0.7, fd * fs * hw * 0.4, -hh * 0.4); c.stroke();
    // the snap opening on the forehead (front / 3/4) with a tuft of hair
    if (fs < 0.8) { const ox = fd * fs * hw * 0.35; c.fillStyle = ELI3.hair; c.beginPath(); c.moveTo(ox - hw * 0.32, -hh * 0.36); c.quadraticCurveTo(ox, -hh * 0.78, ox + hw * 0.32, -hh * 0.36); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = H.lw * 1.6; c.stroke();
      c.fillStyle = '#2a3a1c'; K.rrect(c, ox - hw * 0.36, -hh * 0.42, hw * 0.72, 0.012, 0.005); c.fill(); }
    c.fillStyle = '#2a3a1c'; K.circle(c, fd * fs * hw * 0.32, -hh * 1.07, 0.008); c.fill();
    c.restore(); c.restore();
  };
  const MILA3 = mk({ name: 'Mila', h: 1.07, phase: 0.6, shadowW: 0.14, legLen: 0.42, shoulderW: 0.075, hipW: 0.038, legW: 0.06, legColor: DENIM, flare: 0.25,
    head: { kind: 'egg', hw: 0.09, hh: 0.138, top: 0.8, lean: 0.0, neck: 0 }, hairTop: 0.1, armX: 0.055,
    torso: { wTop: 0.098, wBot: 0.092, dTop: 0.075, dBot: 0.075, color: VCOB, round: 0.06 }, headOver: true,
    arm: { w: 0.046, sleeve: VCREAM, cuff: VCOB, hand: 0.027 },
    skin: '#5e3a2a', hair: '#1a1012',
    boot: { h: 0.1, w: 0.04, foot: 0.064, toe: 0.05, back: 0.014, sole: 0.024, color: '#f3ead5', soleColor: '#ffffff', laces: true, laceColor: VCOB, toeCap: '#e6dcc4' },
    face: { eyes: 'dot', eyeR: 0.0165, eyeSep: 0.036, eyeY: -0.008, mouthY: 0.054, mouthW: 0.036, brows: 0.0075, browW: 1.2, browGap: 2.2, browColor: '#140a0c', blush: 0.28, blushColor: '#e2607a', lashes: true, lip: '#7a1f3a', nose: 0.011, noseY: 0.026, turnK: 0.55, grinW: 0.7, grinOpen: 0.12, edgeK: 0.96 },
    collar(c, B) { // varsity rib collar
      const w = B.hw * 0.75, y = B.Ttop, x = B.tcx + B.dir * B.s * B.wT * 0.25;
      c.fillStyle = VCOB_D; c.strokeStyle = INK; c.lineWidth = B.lw * 2; c.beginPath(); c.moveTo(x - w, y - 0.006); c.quadraticCurveTo(x, y + 0.05, x + w, y - 0.006); c.lineTo(x + w * 0.7, y - 0.012); c.quadraticCurveTo(x, y + 0.025, x - w * 0.7, y - 0.012); c.closePath(); c.stroke(); c.fill();
      c.strokeStyle = VCREAM; c.lineWidth = B.lw * 1.2; c.beginPath(); c.moveTo(x - w * 0.88, y - 0.002); c.quadraticCurveTo(x, y + 0.04, x + w * 0.88, y - 0.002); c.stroke();
    },
    outfit(c, B) { // snaps, the cream "M" chenille patch, striped hem rib
      const s = B.s, d = B.dir, x = B.tcx + d * s * B.wT * 0.45;
      c.fillStyle = VCOB_D; c.fillRect(B.tcx - 0.3, B.Tbot - 0.032, 0.6, 0.032); c.fillStyle = VCREAM; c.fillRect(B.tcx - 0.3, B.Tbot - 0.022, 0.6, 0.007);
      c.strokeStyle = K.rgba(INK, 0.5); c.lineWidth = B.lw * 1.2; c.beginPath(); c.moveTo(x, B.Ttop + 0.03); c.lineTo(x, B.Tbot - 0.03); c.stroke();
      c.fillStyle = VCREAM; for (let k = 0; k < 3; k++) { K.circle(c, x + 0.008, B.Ttop + 0.06 + k * 0.07, 0.0055); c.fill(); }
      if (s < 0.85) { const mx = B.tcx - d * B.wT * 0.42 * (1 - s) + d * s * 0.02, my = B.Ttop + 0.085;
        c.font = `800 0.07px "Martian Mono"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = 0.012; c.strokeText('M', mx, my); c.fillStyle = VCREAM; c.fillText('M', mx, my); }
    },
  });
  MILA3.hairFront = function (c, H) { // middle part, edges framing the face
    const S = MILA3, hw = H.hw, hh = H.hh, px = H.faceDir * H.fs * hw * 0.45;
    c.save(); h.headPath(c, S.head); c.clip();
    c.fillStyle = S.hair; c.beginPath(); c.moveTo(-hw * 1.3, -hh * 0.1); c.lineTo(-hw * 1.3, -hh * 1.3); c.lineTo(hw * 1.3, -hh * 1.3); c.lineTo(hw * 1.3, -hh * 0.1);
    c.quadraticCurveTo(hw * 0.75 + px, -hh * 0.55, px, -hh * 0.62); c.quadraticCurveTo(-hw * 0.75 + px, -hh * 0.55, -hw * 1.3, -hh * 0.1); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.stroke();
    c.strokeStyle = K.rgba('#5a4048', 0.9); c.lineWidth = H.lw * 1.1; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(px, -hh * 0.9); c.quadraticCurveTo(px + k * hw * 0.5, -hh * 0.85, px + k * hw * 0.85, -hh * 0.4); c.stroke(); }
    c.restore(); outlineHead(c, H, S);
  };
  MILA3.hairBack = function (c, H) { // one big high curly puff with a cobalt scrunchie (it bobs)
    const hh = H.hh, b = Math.sin(H.t * 2.8) * 0.003 - H.hatHit * 0.008, x = backX(H, 0.2);
    lobedShape(c, x, -hh - 0.062 + b, 0.07, 12, 33, MILA3.hair, H.lw, 0.34);
    c.strokeStyle = K.rgba('#5a4048', 0.9); c.lineWidth = H.lw * 1.1; c.beginPath(); c.arc(x - 0.012, -hh - 0.07 + b, 0.03, -2.6, -1.2); c.stroke();
    c.fillStyle = VCOB; c.strokeStyle = INK; c.lineWidth = H.lw * 1.6; K.rrect(c, x - 0.034, -hh - 0.006 + b * 0.5, 0.068, 0.02, 0.009); c.fill(); c.stroke();
  };
  MILA3.headTop = (c, H) => studs('#f2c84a', H.F.mouthY - 0.012)(c, H);
  C.define('eli3', ELI3); C.define('mila3', MILA3);

  // =============================================================== ALT 4 · Ruta verde (outdoorsy, 30s, Eli the tall one, iris eyes)
  const BURG = '#a3324a', BURG_D = '#6e1f33', OLIVE = '#6f7046', FOREST = '#2f5a3e', SKY = '#4b9fe0', SKY_D = '#2f78b8', NAVY = '#2c3550', RAINY = '#f0b83a';
  const ELI4 = mk({ name: 'Eli', h: 1.08, phase: 2.4, shadowW: 0.15, legLen: 0.47, shoulderW: 0.088, hipW: 0.042, legW: 0.054, legColor: OLIVE,
    head: { kind: 'tile', hw: 0.086, hh: 0.118, lean: 0.03, neck: 0.03 }, hairTop: 0.07,
    torso: { wTop: 0.108, wBot: 0.094, dTop: 0.082, dBot: 0.078, color: BURG },
    arm: { w: 0.042, skinPart: true, sleeve: BURG, sleeveTo: 0.62, sleeveW: 0.054, hand: 0.029 },   // rolled sleeves
    skin: '#c98a64', hair: '#6e4426',
    boot: { h: 0.11, w: 0.042, foot: 0.066, toe: 0.054, back: 0.014, sole: 0.022, color: '#7a4a2a', soleColor: '#2b1e18', laces: true, laceColor: '#d8402a', lip: true },
    face: { eyes: 'iris', eyeR: 0.03, eyeSep: 0.036, eyeY: -0.022, pupil: 0.32, irisK: 2.55, iris: '#6a4022', goofy: 0, nose: 0.016, noseY: 0.03, mouthY: 0.07, mouthW: 0.04, brows: 0.009, browW: 1.15, browGap: 1.75, browColor: '#3a2416', grinOpen: 0.15, grinW: 0.8, lip: '#3a1a14' },
    collar(c, B) { // open shirt collar points over a cream tee
      const x = B.tcx + B.dir * B.s * B.wT * 0.3, y = B.Ttop;
      c.fillStyle = '#efe6d2'; c.beginPath(); c.moveTo(x - 0.03, y); c.lineTo(x, y + 0.06); c.lineTo(x + 0.03, y); c.closePath(); c.fill();
      for (const sg of (B.s > 0.8 ? [-B.dir] : [-1, 1])) { c.fillStyle = BURG_D; c.strokeStyle = INK; c.lineWidth = B.lw * 2; c.beginPath(); c.moveTo(x + sg * 0.008, y + 0.06); c.lineTo(x + sg * 0.05 * (1 - 0.4 * B.s), y - 0.008); c.lineTo(x + sg * 0.072 * (1 - 0.4 * B.s), y + 0.03); c.closePath(); c.stroke(); c.fill(); }
    },
    outfit(c, B) { // buffalo plaid + button placket + backpack straps
      c.fillStyle = K.rgba(BURG_D, 0.55); for (let x = -0.3; x < 0.3; x += 0.05) c.fillRect(B.tcx + x, -2, 0.022, 4);
      for (let y = B.Ttop; y < B.Tbot; y += 0.05) c.fillRect(-1, y, 2, 0.022);
      c.fillStyle = K.rgba('#1a0a10', 0.35); for (let x = -0.3; x < 0.3; x += 0.05) for (let y = B.Ttop; y < B.Tbot; y += 0.05) c.fillRect(B.tcx + x, y, 0.022, 0.022);
      const px = B.tcx + B.dir * B.s * B.wT * 0.4; c.strokeStyle = K.rgba(INK, 0.5); c.lineWidth = B.lw * 1.2; c.beginPath(); c.moveTo(px, B.Ttop + 0.06); c.lineTo(px, B.Tbot); c.stroke();
      c.fillStyle = '#efe6d2'; for (let k = 0; k < 3; k++) { K.circle(c, px + 0.007, B.Ttop + 0.09 + k * 0.07, 0.005); c.fill(); }
      for (const sg of (B.s > 0.8 ? [-B.dir] : [-1, 1])) { const x = B.tcx + sg * B.wT * 0.62 * (1 - 0.5 * B.s) - B.dir * B.s * 0.03;
        c.fillStyle = '#3a4a3a'; c.strokeStyle = INK; c.lineWidth = B.lw * 1.6; c.beginPath(); c.moveTo(x - 0.012, B.Ttop - 0.01); c.lineTo(x + 0.012, B.Ttop - 0.01); c.lineTo(x + 0.018 * sg + 0.012, B.Tbot - 0.04); c.lineTo(x + 0.018 * sg - 0.012, B.Tbot - 0.04); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#c9c2b0'; K.rrect(c, x - 0.012 + sg * 0.008, B.Ttop + 0.13, 0.024, 0.016, 0.004); c.fill(); c.stroke(); }
    },
  });
  ELI4.hairFront = function (c, H) { if (H.fs > 0.9) { /* profile: beard on the jaw only */ } // a full short beard (with a mouth window) and sideburns, clipped to the head
    const S = ELI4, hw = H.hw, hh = H.hh, fd = H.faceDir, fs = H.fs, my = H.F.mouthY, mx = fd * fs * hw * (0.62 + 0.12), open = ['yell', 'laugh', 'o', 'awe'].includes(H.E.mouth);
    c.save(); h.headPath(c, S.head); c.clip();
    c.fillStyle = S.hair; c.beginPath();
    c.moveTo(-hw * 1.3, -hh * 0.1); c.lineTo(-hw * 0.9 + fd * fs * hw * 0.9, -hh * 0.1);
    c.quadraticCurveTo(-hw * 0.75 + fd * fs * hw * 0.8, my - 0.012, mx - hw * 0.45, my - 0.022); c.lineTo(mx + hw * 0.45, my - 0.022);
    c.quadraticCurveTo(hw * 0.7 + fd * fs * hw * 0.6, my - 0.03, hw * 0.9 + fd * fs * hw * 0.3, -hh * 0.1); c.lineTo(hw * 1.3, -hh * 0.1); c.lineTo(hw * 1.3, hh * 1.5); c.lineTo(-hw * 1.3, hh * 1.5); c.closePath();
    // mouth window
    const ww = H.F.mouthW * (open ? 0.95 : 0.72) * (1 - 0.4 * fs), wh = open ? 0.05 : 0.016;
    if (fs < 0.78) c.ellipse(mx, my + (open ? 0.02 : 0.002), ww, wh, 0, 0, K.TAU, true);
    c.fill('evenodd'); c.strokeStyle = INK; c.lineWidth = H.lw * 1.6; c.stroke();
    c.strokeStyle = K.rgba('#7a5038', 0.8); c.lineWidth = H.lw; for (let i = -3; i <= 3; i++) { const x = mx + i * hw * 0.22; c.beginPath(); c.moveTo(x, my + 0.03); c.lineTo(x + 0.004, my + 0.045); c.stroke(); }
    c.restore(); outlineHead(c, H, S);
  };
  ELI4.hat = beanie(FOREST, '#1f3f2a', '#efe6d2');
  ELI4.face.lip = '#2a1410';
  const MILA4 = mk({ name: 'Mila', h: 0.98, phase: 0.9, shadowW: 0.13, legLen: 0.4, shoulderW: 0.068, hipW: 0.034, legW: 0.046, legColor: NAVY,
    head: { kind: 'pill', hw: 0.068, hh: 0.13, lean: 0.04, neck: 0.03 }, hairTop: 0.01,
    torso: { wTop: 0.09, wBot: 0.092, dTop: 0.066, dBot: 0.07, color: SKY },
    arm: { w: 0.044, sleeve: SKY, cuff: SKY_D, hand: 0.026 },
    skin: '#f4cdb2', hair: '#b5502c',
    boot: { h: 0.13, w: 0.036, foot: 0.06, toe: 0.048, back: 0.012, sole: 0.016, color: RAINY, soleColor: '#7a5a1a', lip: true },
    face: { eyes: 'iris', eyeR: 0.025, eyeSep: 0.029, eyeY: -0.03, pupil: 0.32, irisK: 2.55, iris: '#4f8a4a', goofy: 0, nose: 0.01, noseY: 0.04, mouthY: 0.058, mouthW: 0.032, brows: 0.0072, browW: 1.1, browGap: 1.8, browColor: '#8a3a1e', lashes: true, lip: '#b0384a', freckles: '#c0704a', grinOpen: 0.11, grinW: 0.66 },
    under(c, B) { c.fillStyle = SKY_D; c.strokeStyle = INK; c.lineWidth = B.lw * 2; K.ellipse(c, B.tcx - B.dir * B.s * 0.03, B.Ttop + 0.008, B.wT * 0.9, 0.04); c.stroke(); c.fill(); },
    collar(c, B) { // rain-jacket stand collar + binoculars on a strap
      const x = B.tcx + B.dir * B.s * B.wT * 0.3, y = B.Ttop;
      c.fillStyle = SKY; c.strokeStyle = INK; c.lineWidth = B.lw * 2; K.rrect(c, x - B.hw * 0.95, y - 0.03, B.hw * 1.9, 0.04, 0.012); c.stroke(); c.fill();
      c.strokeStyle = '#3a2a24'; c.lineWidth = 0.006; c.beginPath(); c.moveTo(x - B.hw * 0.7, y + 0.005); c.lineTo(x, y + 0.12); c.lineTo(x + B.hw * 0.7, y + 0.005); c.stroke();
      const bx = x, by = y + 0.13; for (const sg of [-1, 1]) { c.fillStyle = '#2a2a30'; c.strokeStyle = INK; c.lineWidth = B.lw * 1.6; K.rrect(c, bx + sg * 0.018 - 0.014 * (1 - 0.3 * B.s), by - 0.02, 0.028 * (1 - 0.3 * B.s), 0.048, 0.01); c.fill(); c.stroke(); c.fillStyle = '#6a8aa8'; K.ellipse(c, bx + sg * 0.018, by + 0.022, 0.009 * (1 - 0.3 * B.s), 0.005); c.fill(); }
    },
    outfit(c, B) { // zip, toggles, pocket flaps, hem
      const x = B.tcx + B.dir * B.s * B.wT * 0.35; c.strokeStyle = SKY_D; c.lineWidth = B.lw * 2; c.beginPath(); c.moveTo(x, B.Ttop); c.lineTo(x, B.Tbot); c.stroke();
      for (const sg of [-1, 1]) { if (B.s > 0.8 && sg === B.dir) continue; const px = B.tcx + sg * B.wB * 0.5 * (1 - 0.5 * B.s) + B.dir * B.s * 0.02;
        c.fillStyle = SKY_D; c.strokeStyle = INK; c.lineWidth = B.lw * 1.4; K.rrect(c, px - 0.03, B.Tbot - 0.1, 0.06, 0.018, 0.006); c.fill(); c.stroke(); }
      c.fillStyle = SKY_D; c.fillRect(-1, B.Tbot - 0.022, 2, 0.022);
    },
  });
  function profileCap(c, H, S, color, front = 0.1, top = -0.5, nape = 0.25) { // a profile hair cap: back of the head + crown, the face open
    const hw = H.hw, hh = H.hh, fd = H.faceDir;
    c.save(); h.headPath(c, S.head); c.clip(); c.fillStyle = color;
    c.beginPath(); c.moveTo(-fd * hw * 1.4, hh * nape); c.lineTo(-fd * hw * 0.25, hh * nape); c.quadraticCurveTo(fd * hw * 0.05, hh * (top + 0.25), fd * hw * front, hh * top);
    c.quadraticCurveTo(fd * hw * 0.8, hh * (top - 0.05), fd * hw * 1.4, hh * (top + 0.12)); c.lineTo(fd * hw * 1.4, -hh * 1.4); c.lineTo(-fd * hw * 1.4, -hh * 1.4); c.closePath(); c.fill();
    c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.stroke(); c.restore(); outlineHead(c, H, S);
  }
  MILA4.hairFront = function (c, H) { // side part with soft bangs
    const S = MILA4, hw = H.hw, hh = H.hh, fd = H.faceDir, fs = H.fs, a = fs > 0.05 ? fd : 1;
    if (fs > 0.8) return profileCap(c, H, S, S.hair, 0.2, -0.45, 0.35);
    c.save(); h.headPath(c, S.head); c.clip();
    c.fillStyle = S.hair; c.beginPath(); c.moveTo(-hw * 1.3, hh * 0.1); c.lineTo(-hw * 1.3, -hh * 1.3); c.lineTo(hw * 1.3, -hh * 1.3); c.lineTo(hw * 1.3, hh * 0.1);
    c.quadraticCurveTo(a * hw * 0.9, -hh * 0.35, a * hw * 0.5 + fd * fs * hw * 0.3, -hh * 0.42); c.quadraticCurveTo(-a * hw * 0.1 + fd * fs * hw * 0.4, -hh * 0.45, -a * hw * 0.5 + fd * fs * hw * 0.5, -hh * 0.62);
    c.quadraticCurveTo(-a * hw * 0.9, -hh * 0.55, -hw * 1.3, hh * 0.1); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.stroke();
    c.strokeStyle = K.rgba('#e08a5a', 0.7); c.lineWidth = H.lw * 1.2; c.beginPath(); c.moveTo(-a * hw * 0.3, -hh * 0.95); c.quadraticCurveTo(a * hw * 0.4, -hh * 0.75, a * hw * 0.8, -hh * 0.35); c.stroke();
    c.restore(); outlineHead(c, H, S);
  };
  MILA4.hairBack = function (c, H) { const bx = backX(H, 0.3); c.fillStyle = MILA4.hair; c.strokeStyle = INK; c.lineWidth = H.lw * 2; K.ellipse(c, bx, -H.hh * 0.42, H.hw * 1.1, H.hh * 0.66); c.stroke(); c.fill(); };
  MILA4.front = function (c, B) { // the long braid over her shoulder onto the chest (swings)
    const H = B.H, sw = Math.sin(B.t * 2.0 + 0.5) * 0.006 - B.drag * 0.02 * B.dir;
    const x0 = B.hcx + B.dir * (B.hw * 0.7 - B.s * B.hw * 1.1), y0 = B.hcy + B.hh * 0.55;
    c.fillStyle = MILA4.hair; c.strokeStyle = INK; c.lineWidth = B.lw * 1.8;
    for (let k = 0; k < 6; k++) { const f = k / 5, x = x0 + B.dir * f * 0.012 + sw * f, y = y0 + 0.02 + k * 0.032; K.ellipse(c, x, y, 0.02 - k * 0.0015, 0.021, (k % 2 ? 0.35 : -0.35)); c.stroke(); c.fill(); }
    const x = x0 + B.dir * 0.012 + sw, y = y0 + 0.02 + 6 * 0.032 - 0.012;
    c.fillStyle = RAINY; K.ellipse(c, x, y, 0.014, 0.008); c.fill(); c.stroke();
    c.fillStyle = MILA4.hair; c.beginPath(); c.moveTo(x - 0.011, y + 0.006); c.quadraticCurveTo(x + sw * 0.5, y + 0.04, x + 0.011, y + 0.006); c.closePath(); c.fill(); c.stroke(); void H;
  };
  MILA4.headTop = (c, H) => studs('#7fc8e8', H.F.mouthY - 0.006)(c, H);
  C.define('eli4', ELI4); C.define('mila4', MILA4);

  // =============================================================== ALT 5 · Laboratorio de puntos (quirky scientists, 40s)
  const TANG = '#ef8a24', TANG_D = '#c46a14', LABC = '#f2ece0', LABC_D = '#d9d0bf', NAVY5 = '#26305e', CHAR = '#3a3a44';
  const ELI5 = mk({ name: 'Eli', h: 0.92, phase: 1.1, shadowW: 0.16, legLen: 0.33, shoulderW: 0.094, hipW: 0.05, legW: 0.06, legColor: TANG,
    head: { kind: 'pill', hw: 0.092, hh: 0.112, lean: 0.02, neck: 0.03 }, hairTop: 0.07,
    torso: { wTop: 0.112, wBot: 0.11, dTop: 0.088, dBot: 0.09, color: TANG, belly: 0.016 },
    arm: { w: 0.044, skinPart: true, sleeve: TANG, sleeveTo: 0.55, sleeveW: 0.058, hand: 0.03, watch: '#d8d8e0' },
    skin: '#6f4633', hair: '#3a3436',
    boot: { h: 0.09, w: 0.044, foot: 0.064, toe: 0.054, back: 0.014, sole: 0.02, color: '#4a3226', soleColor: '#1e1612', laces: true, laceColor: '#e0d0b0', lip: true },
    face: { eyes: 'dot', eyeR: 0.017, eyeSep: 0.04, eyeY: -0.01, mouthY: 0.062, mouthW: 0.044, brows: 0.012, browW: 1.35, browGap: 2.1, browColor: '#d8d2cc', nose: 0.017, noseY: 0.028, turnK: 0.55, grinW: 0.8, grinOpen: 0.15, edgeK: 0.98 },
    collar(c, B) { // jumpsuit collar points
      const x = B.tcx + B.dir * B.s * B.wT * 0.3, y = B.Ttop;
      for (const sg of (B.s > 0.8 ? [-B.dir] : [-1, 1])) { c.fillStyle = TANG_D; c.strokeStyle = INK; c.lineWidth = B.lw * 2; c.beginPath(); c.moveTo(x + sg * 0.006, y + 0.04); c.lineTo(x + sg * 0.05 * (1 - 0.4 * B.s), y - 0.01); c.lineTo(x + sg * 0.075 * (1 - 0.4 * B.s), y + 0.025); c.closePath(); c.stroke(); c.fill(); }
    },
    outfit(c, B) { // zip, chest pocket with pens, tool belt with pouches
      const s = B.s, d = B.dir, x = B.tcx + d * s * B.wT * 0.4;
      c.strokeStyle = TANG_D; c.lineWidth = B.lw * 2.2; c.beginPath(); c.moveTo(x, B.Ttop + 0.03); c.lineTo(x, B.Tbot); c.stroke();
      const px = B.tcx - d * B.wT * 0.45 * (1 - s) + d * s * 0.01, py = B.Ttop + 0.06;
      c.fillStyle = '#5a8ad8'; c.fillRect(px - 0.012, py - 0.022, 0.006, 0.03); c.fillStyle = '#e8d24a'; c.fillRect(px + 0.002, py - 0.018, 0.006, 0.026);
      c.fillStyle = TANG_D; c.strokeStyle = INK; c.lineWidth = B.lw * 1.4; K.rrect(c, px - 0.024 * (1 - 0.4 * s), py, 0.048 * (1 - 0.4 * s), 0.04, 0.005); c.fill(); c.stroke();
      c.fillStyle = '#4a3226'; c.fillRect(-1, B.Tbot - 0.06, 2, 0.026);
      for (const k of [-1, 0.2, 1]) { const bx = B.tcx + k * B.wB * 0.62 * (1 - 0.5 * s) + d * s * 0.03; c.fillStyle = '#6a4a36'; c.strokeStyle = INK; c.lineWidth = B.lw * 1.4; K.rrect(c, bx - 0.018, B.Tbot - 0.062, 0.036, 0.045, 0.006); c.fill(); c.stroke(); }
      c.fillStyle = '#d8c070'; K.rrect(c, B.tcx + d * s * B.wB * 0.5 - 0.012, B.Tbot - 0.062, 0.024, 0.03, 0.004); c.fill(); c.stroke();
    },
  });
  ELI5.hairBack = function (c, H) { // salt-and-pepper curly mop (lobes), a bit wild; bounces
    const b = Math.sin(H.t * 3.3) * 0.0025, cx = backX(H, 0.3);
    lobedShape(c, cx, -H.hh * 0.62 + b, H.hw * 1.32, 11, 51, ELI5.hair, H.lw, 0.4);
    c.fillStyle = '#9a9498'; const r = K.rng(52); for (let i = 0; i < 9; i++) { const a = r() * K.TAU, rr = H.hw * 1.0 * r(); K.circle(c, cx + Math.cos(a) * rr, -H.hh * 0.75 + Math.sin(a) * rr * 0.6 + b, 0.008 + r() * 0.006); c.fill(); }
  };
  ELI5.hairFront = function (c, H) { // curls over the forehead + sideburns
    const S = ELI5, hw = H.hw, hh = H.hh, b = Math.sin(H.t * 3.3) * 0.0025;
    c.save(); h.headPath(c, S.head); c.clip();
    c.fillStyle = S.hair; for (let i = -3; i <= 3; i++) { K.circle(c, i * hw * 0.34 + H.faceDir * H.fs * hw * 0.3, -hh * 0.98 + Math.abs(i) * 0.008 + b, hw * 0.3); c.fill(); }
    c.fillRect(-hw * 1.2, -hh * 1.4, hw * 2.4, hh * 0.5);
    for (const sg of (H.fs < 0.3 ? [-1, 1] : [-H.faceDir])) c.fillRect(sg > 0 ? hw * 0.8 : -hw * 1.2, -hh * 0.9, hw * 0.4, hh * 0.75);
    c.fillStyle = '#9a9498'; for (const sg of [-1, 1]) { K.circle(c, sg * hw * 0.95, -hh * 0.35, 0.012); c.fill(); }
    c.restore(); outlineHead(c, H, S);
  };
  ELI5.face.mustache = function (c, H, fx, fy) { // bushy grey mustache that moves with the mouth
    const open = ['yell', 'laugh', 'o', 'awe', 'grin', 'talk'].includes(H.talk > 0.05 ? 'talk' : H.E.mouth);
    const y = fy + H.F.mouthY - (open ? 0.022 : 0.012), w = H.F.mouthW * 0.82 * (1 - 0.35 * H.fs), x = H.fs > 0.78 ? H.cx + H.faceDir * H.hw * 0.7 : fx + H.faceDir * H.fs * H.hw * 0.15;
    c.fillStyle = '#cfc8c2'; c.strokeStyle = INK; c.lineWidth = H.lw * 1.4;
    c.beginPath(); c.moveTo(x - w, y + 0.012); c.quadraticCurveTo(x - w * 0.9, y - 0.016, x - w * 0.2, y - 0.012); c.quadraticCurveTo(x, y - 0.006, x + w * 0.2, y - 0.012); c.quadraticCurveTo(x + w * 0.9, y - 0.016, x + w, y + 0.012); c.quadraticCurveTo(x + w * 0.5, y + 0.004, x, y + 0.01); c.quadraticCurveTo(x - w * 0.5, y + 0.004, x - w, y + 0.012); c.closePath(); c.stroke(); c.fill();
  };
  ELI5.hat = function (c, H) { // brass goggles on the forehead, amber lenses
    const hw = H.hw, hh = H.hh, fd = H.faceDir, fs = H.fs, y = -hh * 1.12 - H.hatHit * 0.01;
    c.fillStyle = '#3a2a22'; c.strokeStyle = INK; c.lineWidth = H.lw * 1.4; K.rrect(c, -hw * 1.22, y - 0.01, hw * 2.44, 0.02, 0.01); c.fill(); c.stroke();
    const sep = 0.04 * (1 - 0.4 * fs), x0 = fd * fs * hw * 0.5;
    for (const sg of (fs > 0.85 ? [fd] : [-1, 1])) { const x = x0 + sg * sep, r = 0.028 * (sg === -fd && fs > 0.2 ? 0.8 : 1);
      c.fillStyle = '#c9963a'; c.strokeStyle = INK; c.lineWidth = H.lw * 2; K.ellipse(c, x, y, r * (1 - 0.3 * fs), r); c.stroke(); c.fill();
      c.fillStyle = '#3d5560'; K.ellipse(c, x, y, r * 0.7 * (1 - 0.3 * fs), r * 0.7); c.fill(); c.lineWidth = H.lw * 1.2; c.stroke();
      c.fillStyle = K.rgba('#fff4d0', 0.85); K.ellipse(c, x - r * 0.25, y - r * 0.25, r * 0.18, r * 0.12, -0.6); c.fill(); }
  };
  function bigGlasses(c, H, eyes, ey, rr) {
    const R = rr * 2.25, lw = H.lw;
    for (const [x, , far] of eyes) { c.fillStyle = 'rgba(255,255,255,0.08)'; c.strokeStyle = '#5a2e1e'; c.lineWidth = lw * 2.4; K.ellipse(c, x, ey, R * (far ? 0.72 : 1) * (1 - 0.2 * H.fs), R); c.fill(); c.stroke();
      c.strokeStyle = '#a0603a'; c.lineWidth = lw * 1.2; c.beginPath(); c.ellipse(x, ey, R * (far ? 0.72 : 1) * (1 - 0.2 * H.fs), R, 0, -2.4, -1.0); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = lw * 1.1; c.beginPath(); c.ellipse(x, ey, R * 0.7 * (far ? 0.72 : 1), R * 0.7, 0, -2.5, -2.0); c.stroke(); }
    const pos = eyes.map(e => e[0]).sort((a, b) => a - b); c.strokeStyle = '#5a2e1e'; c.lineWidth = lw * 2.4;
    if (pos.length === 2) { c.beginPath(); c.moveTo(pos[0] + R * 0.95 * (1 - 0.2 * H.fs), ey - R * 0.2); c.quadraticCurveTo((pos[0] + pos[1]) / 2, ey - R * 0.5, pos[1] - R * 0.95 * (1 - 0.2 * H.fs) * (H.fs > 0.2 ? 0.72 : 1), ey - R * 0.2); c.stroke(); }
    if (H.fs > 0.2) { const x = eyes[0][0], back = -H.faceDir; c.beginPath(); c.moveTo(x + back * R * (1 - 0.2 * H.fs), ey - R * 0.2); c.lineTo(x + back * H.hw * 0.9, ey - R * 0.4); c.stroke(); }
  }
  const MILA5 = mk({ name: 'Mila', h: 1.06, phase: 0.3, shadowW: 0.13, legLen: 0.45, shoulderW: 0.066, hipW: 0.034, legW: 0.046, legColor: CHAR,
    head: { kind: 'pill', hw: 0.074, hh: 0.15, lean: 0.05, neck: 0.03 }, hairTop: 0.006,
    torso: { wTop: 0.084, wBot: 0.08, dTop: 0.06, dBot: 0.062, color: NAVY5 },
    arm: { w: 0.044, sleeve: LABC, cuff: LABC_D, hand: 0.026 },
    skin: '#f1d0a8', hair: '#18141c',
    boot: { h: 0.05, w: 0.034, foot: 0.05, toe: 0.045, back: 0.012, sole: 0.014, color: '#7a2a2e', soleColor: '#2a1214' },
    face: { eyes: 'dot', eyeR: 0.0145, eyeSep: 0.034, eyeY: -0.035, goofy: 0, turnK: 0.55, nose: 0.01, noseY: 0.045, mouthY: 0.06, mouthW: 0.032, brows: 0.0075, browW: 1.05, browGap: 2.3, browColor: '#18141c', lashes: true, lip: '#9a2e40', glasses: bigGlasses, grinOpen: 0.11, grinW: 0.64, lidBias: 0.12 },
    collar: turtleneck(NAVY5, 0.9),
    under(c, B) { // lab-coat tails behind the legs (open at the front), they swing a little
      if (B.seated) return; const sw = Math.sin(B.t * 1.7) * 0.005 - B.drag * 0.02 * B.dir, y1 = -B.S.legLen * 0.42;
      for (const sg of [-1, 1]) { if (B.s > 0.8 && sg === B.dir) continue; const xo = B.tcx + sg * B.wB * 1.08, xi = B.tcx + sg * B.wB * 0.3 + B.dir * B.s * 0.03;
        c.fillStyle = LABC; c.strokeStyle = INK; c.lineWidth = B.lw * 2; c.beginPath(); c.moveTo(xi, B.Tbot - 0.05); c.lineTo(xo, B.Tbot - 0.05); c.lineTo(xo + sg * 0.025 + sw, y1); c.lineTo(xi + sg * 0.01 + sw, y1); c.closePath(); c.stroke(); c.fill(); }
    },
    outfitTop(c, B) { // open lab coat panels, pocket with pens, an ID badge
      const s = B.s, d = B.dir;
      for (const sg of [-1, 1]) { if (s > 0.8 && sg === d) continue;
        const outT = B.tcx + sg * B.wT * 1.03, outB = B.tcx + sg * B.wB * 1.06, inn = B.tcx + sg * 0.026 * (1 - 0.6 * s) + d * s * B.wT * 0.5;
        c.fillStyle = LABC; c.strokeStyle = INK; c.lineWidth = B.lw * 2;
        c.beginPath(); c.moveTo(outT, B.Ttop); c.lineTo(inn + sg * 0.02, B.Ttop); c.lineTo(inn + sg * 0.004, B.Ttop + 0.12); c.lineTo(inn, B.Tbot + 0.004); c.lineTo(outB, B.Tbot + 0.004); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = LABC_D; c.beginPath(); c.moveTo(inn + sg * 0.02, B.Ttop); c.lineTo(inn + sg * 0.05, B.Ttop + 0.005); c.lineTo(inn + sg * 0.008, B.Ttop + 0.1); c.closePath(); c.fill(); c.stroke();
      }
      const px = B.tcx + (s > 0.5 ? -d * B.wT * 0.5 : -B.wT * 0.6), py = B.Ttop + 0.08;
      c.fillStyle = '#e04a7a'; c.fillRect(px - 0.008, py - 0.02, 0.005, 0.026); c.fillStyle = '#3a6ad0'; c.fillRect(px + 0.002, py - 0.016, 0.005, 0.022);
      c.fillStyle = LABC_D; c.strokeStyle = INK; c.lineWidth = B.lw * 1.3; K.rrect(c, px - 0.016, py, 0.032, 0.026, 0.004); c.fill(); c.stroke();
      if (s < 0.8) { const bx = B.tcx + B.wT * 0.62 * (1 - s), by = B.Ttop + 0.1; c.fillStyle = '#fbf8f0'; K.rrect(c, bx - 0.014, by, 0.028, 0.036, 0.004); c.fill(); c.stroke(); c.fillStyle = '#e8553a'; K.circle(c, bx, by + 0.012, 0.0055); c.fill(); }
    },
  });
  MILA5.hairBack = function (c, H) { // a blunt bob: a mass behind the head ending at the jaw, with a grey streak
    const S = MILA5, hw = H.hw, hh = H.hh, bx = backX(H, 0.18), sw = Math.sin(H.t * 2.1) * 0.003 - H.drag * 0.015 * H.dir, y1 = H.F.mouthY + 0.03;
    c.fillStyle = S.hair; c.strokeStyle = INK; c.lineWidth = H.lw * 2;
    const W = hw * 1.14, Wb = hw * 1.5; c.beginPath(); c.moveTo(bx - hw * 0.8 + sw, y1 + 0.004); c.quadraticCurveTo(bx - Wb + sw, y1 + 0.012, bx - Wb + sw * 0.5, y1 - 0.03); c.quadraticCurveTo(bx - W * 1.02, -hh * 0.2, bx - W, -hh * 0.6); c.quadraticCurveTo(bx - W, -hh - 0.016, bx, -hh - 0.016); c.quadraticCurveTo(bx + W, -hh - 0.016, bx + W, -hh * 0.6); c.quadraticCurveTo(bx + W * 1.02, -hh * 0.2, bx + Wb + sw * 0.5, y1 - 0.03); c.quadraticCurveTo(bx + Wb + sw, y1 + 0.012, bx + hw * 0.8 + sw, y1 + 0.004); c.closePath(); c.stroke(); c.fill();
  };
  MILA5.hairFront = function (c, H) { // blunt bangs + sides to the jaw, one grey streak
    const S = MILA5, hw = H.hw, hh = H.hh, fd = H.faceDir, fs = H.fs, by = H.F.eyeY - H.F.eyeR * 3.4;
    if (fs > 0.8) { profileCap(c, H, S, S.hair, 0.15, (by - 0.004) / hh, (H.F.mouthY + 0.03) / hh); return; }
    c.save(); h.headPath(c, S.head); c.clip();
    c.fillStyle = S.hair; c.beginPath(); c.moveTo(-hw * 1.3, H.F.mouthY + 0.03); c.lineTo(-hw * 1.3, -hh * 1.3); c.lineTo(hw * 1.3, -hh * 1.3); c.lineTo(hw * 1.3, H.F.mouthY + 0.03);
    const sideIn = (sg) => (fs > 0.4 && sg === fd) ? hw * (1.3 - 0.5 * fs) : hw * (0.86 + (sg === -fd ? -0.5 * fs : 0));
    c.lineTo(sideIn(1), H.F.mouthY + 0.03); c.quadraticCurveTo(sideIn(1) - 0.012, (by + H.F.mouthY) / 2, sideIn(1) - 0.006, by);
    { const xa = sideIn(1) - 0.006, xb = -sideIn(-1) + 0.006, n = 4; for (let i = 1; i <= n; i++) { const x0 = K.lerp(xa, xb, (i - 1) / n), x1 = K.lerp(xa, xb, i / n); c.quadraticCurveTo((x0 + x1) / 2, by + 0.012, x1, by); } }
    c.quadraticCurveTo(-sideIn(-1) + 0.012, (by + H.F.mouthY) / 2, -sideIn(-1), H.F.mouthY + 0.03); c.closePath(); c.fill();
    c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.stroke();
    c.strokeStyle = K.rgba('#5a5068', 0.9); c.lineWidth = H.lw * 1.1; for (const k of [-0.5, 0.1, 0.6]) { c.beginPath(); c.moveTo(k * hw, -hh * 0.95); c.quadraticCurveTo(k * hw * 1.1, -hh * 0.7, k * hw * 1.05, by - 0.01); c.stroke(); }
    c.fillStyle = '#b8b2c0'; c.beginPath(); c.moveTo(-hw * 0.75, -hh * 1.02); c.quadraticCurveTo(-hw * 0.55, -hh * 0.7, -hw * 0.62, by + 0.004); c.lineTo(-hw * 0.4, by + 0.002); c.quadraticCurveTo(-hw * 0.35, -hh * 0.7, -hw * 0.45, -hh * 1.02); c.closePath(); c.fill();
    c.restore(); outlineHead(c, H, S);
  };
  C.define('eli5', ELI5); C.define('mila5', MILA5);

  C.ALIAS.eli = 'eli1';

  // ---------------------------------------------------------------- the alternatives (boards, scene, overview)
  C.ALTS = {
    1: { name: 'Taller', es: 'Taller (los actuales, pulidos)', concept: 'Los Max & Leo adaptados, pulidos: cabezas cápsula, ojos saltones, ropa de trabajo; amarillo y morado.',
      eli: 'eli1', mila: 'mila1', sig: ['#c99412', '#6a4fb3'],
      sw: { eli: [['gorro', BEANIE], ['playera', TEE], ['delantal', APRON], ['jeans', JEANS], ['piel', ELI_SKIN]], mila: [['suéter', PURPLE], ['overol', MUSTARD], ['botas', GREEN], ['piel', '#d9a66c'], ['aretes', GOLD]] } },
    2: { name: 'Carretera 70', es: 'Carretera 70 (road trip retro)', concept: 'Road trip de los 70: afro y aviadores, campana de pana; ella con cabello largo, diadema tejida, chaleco de flecos; cobalto y frambuesa.',
      eli: 'eli2', mila: 'mila2', sig: ['#3557c9', '#c2386f'],
      sw: { eli: [['playera', COBALT], ['ribete', CREAM], ['pana', CORD], ['piel', '#9a6447'], ['pelo', '#1c1314']], mila: [['cuello alto', RASP], ['chaleco', SUEDE], ['campana', CREAM], ['piel', '#e2b98f'], ['pelo', '#5a2a22']] } },
    3: { name: 'Barrio', es: 'Barrio (streetwear, más jóvenes)', concept: 'Más jóvenes y chibi: cabezas de huevo, ojos punto con cejas; él con gorra al revés, sudadera lima, pecas y audífonos; ella con un chongo alto rizado, aretes de botón y chamarra varsity cobalto.',
      eli: 'eli3', mila: 'mila3', sig: ['#7fa828', '#2f55c8'],
      sw: { eli: [['sudadera', LIME], ['cargo', CARGO], ['tenis', '#f6f2e8'], ['piel', '#f0c3a0'], ['pelo', '#c8632e']], mila: [['varsity', VCOB], ['mangas', VCREAM], ['jeans', DENIM], ['piel', '#5e3a2a'], ['pelo', '#1a1012']] } },
    4: { name: 'Ruta verde', es: 'Ruta verde (aire libre, él es el alto)', concept: 'Excursionistas de 30: él alto, barbudo, franela de cuadros y gorro de pompón; ella con trenza pelirroja, impermeable celeste y binoculares.',
      eli: 'eli4', mila: 'mila4', sig: ['#a3324a', '#2f78b8'],
      sw: { eli: [['franela', BURG], ['gorro', FOREST], ['pantalón', OLIVE], ['piel', '#c98a64'], ['barba', '#6e4426']], mila: [['impermeable', SKY], ['botas', RAINY], ['mallas', NAVY], ['piel', '#f4cdb2'], ['pelo', '#b5502c']] } },
    5: { name: 'Laboratorio', es: 'Laboratorio de puntos (científicos, 40s)', concept: 'Científicos excéntricos de 40: él con overol naranja, goggles y bigote canoso; ella alta con bata, cuello alto marino, lentes enormes y bob con mechón gris.',
      eli: 'eli5', mila: 'mila5', sig: ['#d8741a', '#26305e'],
      sw: { eli: [['overol', TANG], ['goggles', '#c9963a'], ['botas', '#4a3226'], ['piel', '#6f4633'], ['pelo', '#3a3436']], mila: [['bata', LABC], ['cuello alto', NAVY5], ['pantalón', CHAR], ['piel', '#f1d0a8'], ['lentes', '#5a2e1e']] } },
  };
})(typeof window !== 'undefined' ? window : globalThis);
