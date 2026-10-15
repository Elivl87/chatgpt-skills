/* Diez Mil Puntos art kit · cast specs: the candidate characters (2026-10-15). Units: height units (see cast.js).
   A  · leo (impatient, short, loud) + mila (Max turned into a woman: tall, calm, sleepy lids)       [Max & Leo, adapted]
   A2 · max (Max as in EP003) + lia (Leo turned into a woman)                                        [the other swap]
   B  · paz (patient, curious, tall, round glasses + bun) + tono (impatient, short, quiff, track jacket) [new duo]
   C  · chispa: a little spark-dot with a flame tuft, the dot of the i                                [new mascot]
   D  · punto: the vermilion dot, upgraded (brows, catchlights, teal scarf, ink limbs, sneakers)      [the dot, improved]
   Max & Leo's identity (secondquest/docs/ep003/characters/FRIENDS_MAX_LEO.md): capsule heads, big googly eyes with
   tiny pupils, nose bump, long limp limbs, mitten hands, chunky boots; Max purple long sleeves + mustard bib overalls +
   green boots, sleepy lids; Leo yellow ribbed beanie, white tee, brown apron, jeans, black boots, big grin. */
(function (root) {
  const K = root.K, C = K.cast, h = C.helpers, INK = C.INK;

  // ---------------------------------------------------------------- shared bits
  const PURPLE = '#7158b8', PURPLE_D = '#5a4596', MUSTARD = '#c99633', MUSTARD_D = '#a87a24', GREEN = '#2f6b45', BRASS = '#e7c25a';
  const LEO_SKIN = '#7a4d32', MAX_SKIN = '#d9a66c', TEE = '#f1ede2', APRON = '#a4713d', APRON_D = '#7d532a', JEANS = '#3f5f96', BEANIE = '#f2c230', BEANIE_D = '#cf9d1f';

  function crewCollar(color) {
    return (c, B) => {
      const w = B.hw * 1.15, y = B.Ttop + 0.002, x = B.tcx + B.dir * B.s * B.wT * 0.25;
      c.strokeStyle = INK; c.lineWidth = B.lw * 2; c.lineCap = 'round';
      c.fillStyle = color; c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x, y + 0.045, x + w, y); c.quadraticCurveTo(x, y + 0.022, x - w, y); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x, y + 0.045, x + w, y); c.stroke();
    };
  }
  // the overalls: pants + bib + straps + brass buttons + chest pocket (clipped to the torso)
  function overalls(c, B) {
    const s = B.s, d = B.dir, bx = B.tcx + d * s * B.wT * 0.4, bw = 0.056 * (1 - 0.45 * s), top = B.Ttop + 0.095, waist = B.Tbot - 0.09;
    c.fillStyle = MUSTARD; c.fillRect(B.tcx - 0.2, waist, 0.4, 0.2);
    c.strokeStyle = INK; c.lineWidth = B.lw * 2;
    c.beginPath(); c.moveTo(B.tcx - 0.2, waist); c.lineTo(bx - bw, waist); c.lineTo(bx - bw, top); c.lineTo(bx + bw, top); c.lineTo(bx + bw, waist); c.lineTo(B.tcx + 0.2, waist); c.lineTo(B.tcx + 0.2, 0.2); c.lineTo(B.tcx - 0.2, 0.2); c.closePath();
    c.fill(); c.stroke();
    // straps to the shoulders
    c.lineWidth = 0.016; c.lineCap = 'butt';
    for (const sg of [-1, 1]) { const vis = s < 0.9 || sg === -d; if (!vis) continue;
      const sx = bx + sg * bw * 0.72, ex = B.tcx + sg * B.wT * 0.62 * (1 - 0.5 * s) - d * s * 0.02;
      c.strokeStyle = INK; c.lineWidth = 0.016 + B.lw * 2; c.beginPath(); c.moveTo(sx, top + 0.01); c.lineTo(ex, B.Ttop - 0.01); c.stroke();
      c.strokeStyle = MUSTARD; c.lineWidth = 0.016; c.beginPath(); c.moveTo(sx, top + 0.012); c.lineTo(ex, B.Ttop - 0.01); c.stroke();
      c.fillStyle = BRASS; c.strokeStyle = INK; c.lineWidth = B.lw * 1.4; K.circle(c, sx, top + 0.014, 0.0085); c.fill(); c.stroke(); }
    // chest pocket with flap
    const px = bx - bw * 0.15 + d * s * 0.01, py = top + 0.03;
    c.fillStyle = MUSTARD_D; c.strokeStyle = INK; c.lineWidth = B.lw * 1.4; K.rrect(c, px - 0.022 * (1 - 0.4 * s), py, 0.044 * (1 - 0.4 * s), 0.04, 0.005); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(px - 0.022 * (1 - 0.4 * s), py + 0.012); c.lineTo(px + 0.022 * (1 - 0.4 * s), py + 0.012); c.stroke();
    // fly seam
    c.strokeStyle = K.rgba(INK, 0.45); c.lineWidth = B.lw; c.beginPath(); c.moveTo(bx, waist + 0.02); c.lineTo(bx, B.Tbot + 0.01); c.stroke();
  }

  // ---------------------------------------------------------------- MILA (Max as a woman)
  const MILA = {
    kind: 'biped', name: 'Mila', h: 1.10, lw: 0.0066, phase: 0.8, shadowW: 0.13,
    legLen: 0.47, shoulder: 0.775, shoulderW: 0.07, shoulderFwd: 0.004, hipW: 0.034, legW: 0.05, legColor: MUSTARD, legSplay: 0.004,
    torso: { top: 0.8, bot: 0.44, wTop: 0.088, wBot: 0.08, dTop: 0.06, dBot: 0.062, color: PURPLE },
    head: { kind: 'capsule', hw: 0.064, hh: 0.155, cy: 0.925, lean: 0.06, neck: 0.03 },
    arm: { upper: 0.178, fore: 0.165, w: 0.04, sleeve: PURPLE, cuff: PURPLE_D, hand: 0.027 },
    skin: MAX_SKIN, handColor: MAX_SKIN,
    boot: { h: 0.15, w: 0.034, foot: 0.062, toe: 0.05, back: 0.012, sole: 0.014, color: GREEN, lip: true },
    face: { eyes: 'googly', eyeR: 0.034, eyeSep: 0.031, eyeY: -0.046, pupil: 0.34, goofy: 0.6, nose: 0.011, noseY: 0.05, mouthY: 0.05, mouthW: 0.034,
      lidBias: 0.36, lashes: true, lip: '#8e3346', grinOpen: 0.1, grinW: 0.62 },
    collar: crewCollar(PURPLE_D),
    outfit: overalls,
    hairBack(c, H, B) { // a high ponytail that swings (secondary motion from t)
      const back = H.fs > 0.05 ? -H.faceDir : -1, rx = back * H.fs * 0.0 + (H.fs > 0.05 ? back * H.hw * 0.35 * H.fs : 0), ry = -H.hh + 0.012;
      const sw = Math.sin(H.t * 2.4) * 0.012 + Math.sin(H.t * 5.1) * 0.004;
      c.fillStyle = MILA.hair; c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.lineJoin = 'round';
      const tipX = rx + back * (0.085 + 0.02 * H.fs) + sw, tipY = ry + 0.13;
      c.beginPath(); c.moveTo(rx - back * 0.012, ry - 0.012);
      c.bezierCurveTo(rx + back * 0.03, ry - 0.075, rx + back * 0.1, ry - 0.03, tipX + back * 0.012, tipY - 0.03);
      c.quadraticCurveTo(tipX + back * 0.006, tipY + 0.01, tipX - back * 0.012, tipY + 0.012);
      c.quadraticCurveTo(tipX - back * 0.004, tipY - 0.04, rx + back * 0.03, ry + 0.012);
      c.closePath(); c.stroke(); c.fill();
      c.strokeStyle = K.rgba('#5a3a3a', 0.8); c.lineWidth = H.lw * 1.2;
      c.beginPath(); c.moveTo(rx + back * 0.02, ry - 0.035); c.quadraticCurveTo(rx + back * 0.075, ry - 0.03, tipX, tipY - 0.02); c.stroke();
    },
    hairFront(c, H, B) { // hair cap with a side-swept fringe, clipped to the capsule
      const hw = H.hw, hh = H.hh, fd = H.faceDir, fs = H.fs;
      c.save(); K.rrect(c, -hw, -hh, hw * 2, hh * 2, [hw, hw, hw * 0.6, hw * 0.6]); c.clip();
      const sweep = (fs > 0.05 ? fd : 1);
      const hairLine = () => { const a = sweep; c.beginPath(); c.moveTo(-a * hw * 1.2, -hh + 0.085); c.lineTo(-a * hw * 1.2, -hh - 0.05); c.lineTo(a * hw * 1.2, -hh - 0.05);
        c.lineTo(a * hw * 1.2, -hh + 0.1);
        c.bezierCurveTo(a * hw * 0.7 + fd * fs * hw * 0.2, -hh + 0.07, a * hw * 0.2, -hh + 0.025, -a * hw * 0.3 + fd * fs * hw * 0.5, -hh + 0.03);
        c.quadraticCurveTo(-a * hw * 0.85, -hh + 0.045, -a * hw * 1.2, -hh + 0.085); c.closePath(); };
      hairLine(); c.fillStyle = MILA.hair; c.fill();
      c.strokeStyle = K.rgba('#6a4646', 0.85); c.lineWidth = H.lw * 1.2; c.beginPath(); c.moveTo(-hw * 0.2 * sweep, -hh + 0.01); c.quadraticCurveTo(hw * 0.4 * sweep, -hh + 0.05, hw * 0.9 * sweep, -hh + 0.085); c.stroke();
      c.restore();
      hairLine(); c.save(); K.rrect(c, -hw, -hh, hw * 2, hh * 2, [hw, hw, hw * 0.6, hw * 0.6]); c.clip(); c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.stroke(); c.restore();
      K.rrect(c, -hw, -hh, hw * 2, hh * 2, [hw, hw, hw * 0.6, hw * 0.6]); c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.save(); c.beginPath(); c.rect(-1, -1, 2, -hh + 0.13 + 1); c.clip(); K.rrect(c, -hw, -hh, hw * 2, hh * 2, [hw, hw, hw * 0.6, hw * 0.6]); c.stroke(); c.restore();
    },
    headTop(c, H) { // scrunchie + earrings
      const back = H.fs > 0.05 ? -H.faceDir : -1, rx = H.fs > 0.05 ? back * H.hw * 0.35 * H.fs : 0, ry = -H.hh + 0.004;
      c.fillStyle = MUSTARD; c.strokeStyle = INK; c.lineWidth = H.lw * 1.6; K.ellipse(c, rx + back * 0.006, ry - 0.006, 0.02, 0.012, back * 0.5); c.fill(); c.stroke();
      c.strokeStyle = K.rgba(INK, 0.5); c.lineWidth = H.lw; c.beginPath(); c.moveTo(rx - 0.008, ry - 0.012); c.lineTo(rx - 0.004, ry); c.moveTo(rx + 0.008, ry - 0.012); c.lineTo(rx + 0.012, ry); c.stroke();
      const ey = H.F.mouthY - 0.012, ears = H.fs < 0.2 ? [-1, 1] : [-H.faceDir];
      for (const sg of ears) { const ex = H.fs < 0.2 ? sg * H.hw * 1.0 : -H.faceDir * H.hw * (1 - H.fs * 0.55);
        c.strokeStyle = INK; c.lineWidth = H.lw * 2.6; K.circle(c, ex, ey + 0.014, 0.011); c.stroke(); c.strokeStyle = '#e9b949'; c.lineWidth = H.lw * 1.2; c.stroke(); }
    },
    hair: '#2e1d22',
  };
  C.define('mila', MILA);

  // ---------------------------------------------------------------- MAX (as in EP003) for A2
  const MAX = Object.assign({}, MILA, { name: 'Max', face: Object.assign({}, MILA.face, { lashes: false, lip: INK }), hairBack: null, hairFront: null,
    headTop: null, phase: 0.3 });
  C.define('max', MAX);

  // ---------------------------------------------------------------- LEO
  function apron(c, B) {
    const s = B.s, d = B.dir, bx = B.tcx + d * s * B.wT * 0.45, bw = 0.064 * (1 - 0.5 * s), top = B.Ttop + 0.055;
    c.fillStyle = APRON; c.strokeStyle = INK; c.lineWidth = B.lw * 2;
    c.beginPath(); c.moveTo(bx - bw, top); c.lineTo(bx + bw, top); c.lineTo(bx + bw * 1.25, B.Tbot + 0.03); c.lineTo(bx - bw * 1.25, B.Tbot + 0.03); c.closePath(); c.fill(); c.stroke();
    // neck cord
    c.strokeStyle = '#3b2a20'; c.lineWidth = 0.008; c.beginPath(); c.moveTo(bx - bw * 0.85, top + 0.004); c.lineTo(B.hcx - B.hw * 0.7 * (1 - 0.6 * s), B.Ttop + 0.004); c.moveTo(bx + bw * 0.85, top + 0.004); c.lineTo(B.hcx + B.hw * 0.7 * (1 - 0.6 * s), B.Ttop + 0.004); c.stroke();
    c.strokeStyle = K.rgba(INK, 0.35); c.lineWidth = B.lw; c.beginPath(); c.moveTo(bx - bw * 0.7, top + 0.03); c.lineTo(bx + bw * 0.7, top + 0.03); c.stroke();
  }
  function apronSkirt(c, B) {
    const s = B.s, d = B.dir, bx = B.tcx + d * s * B.wB * 0.5, w0 = 0.085 * (1 - 0.55 * s), w1 = 0.09 * (1 - 0.5 * s), y0 = B.Tbot + 0.012, y1 = B.seated ? B.Tbot + 0.03 : -0.2;
    if (B.seated) return;
    c.fillStyle = APRON; c.strokeStyle = INK; c.lineWidth = B.lw * 2;
    c.beginPath(); c.moveTo(bx - w0, y0); c.lineTo(bx + w0, y0); c.lineTo(bx + w1, y1 - 0.01); c.quadraticCurveTo(bx + w1, y1, bx + w1 - 0.01, y1); c.lineTo(bx - w1 + 0.01, y1); c.quadraticCurveTo(bx - w1, y1, bx - w1, y1 - 0.01); c.closePath(); c.fill(); c.stroke();
    // patch pocket
    c.fillStyle = APRON_D; K.rrect(c, bx - 0.045 * (1 - 0.5 * s), y0 + 0.04, 0.09 * (1 - 0.5 * s), 0.06, 0.006); c.fill(); c.lineWidth = B.lw * 1.4; c.stroke();
    // waist tie
    c.fillStyle = '#3b2a20'; K.rrect(c, B.tcx - B.wB * 1.04, B.Tbot - 0.004, B.wB * 2.08, 0.022, 0.008); c.fill(); c.lineWidth = B.lw * 1.4; c.stroke();
    if (s > 0.3) { c.strokeStyle = '#3b2a20'; c.lineWidth = 0.009; c.beginPath(); c.moveTo(B.tcx - d * B.wB, B.Tbot + 0.008); c.quadraticCurveTo(B.tcx - d * (B.wB + 0.03), B.Tbot + 0.04, B.tcx - d * (B.wB + 0.015), B.Tbot + 0.08); c.stroke(); }
  }
  function beanie(c, H) {
    const hw = H.hw, hh = H.hh, cuffY = -hh + 0.046, cuffH = 0.036;
    const dome = () => { c.beginPath(); c.moveTo(-hw * 1.07, cuffY + 0.005); c.bezierCurveTo(-hw * 1.1, -hh - 0.045, hw * 1.1, -hh - 0.045, hw * 1.07, cuffY + 0.005); c.closePath(); };
    h.shape(c, dome, BEANIE, H.lw);
    c.save(); dome(); c.clip(); c.strokeStyle = BEANIE_D; c.lineWidth = H.lw * 1.4;
    for (let i = -4; i <= 4; i++) { const x = i * hw * 0.26 + H.faceDir * H.fs * hw * 0.2; c.beginPath(); c.moveTo(x, cuffY); c.quadraticCurveTo(x * 0.85, -hh - 0.01, x * 0.3, -hh - 0.04); c.stroke(); }
    c.restore();
    const cuff = () => K.rrect(c, -hw * 1.14, cuffY, hw * 2.28, cuffH, 0.016);
    h.shape(c, cuff, K.shade(BEANIE, 0.05), H.lw);
    c.save(); cuff(); c.clip(); c.strokeStyle = BEANIE_D; c.lineWidth = H.lw * 1.3;
    for (let i = -6; i <= 6; i++) { const x = i * hw * 0.19; c.beginPath(); c.moveTo(x, cuffY + 0.006); c.lineTo(x, cuffY + cuffH - 0.006); c.stroke(); }
    c.restore();
  }
  const LEO = {
    kind: 'biped', name: 'Leo', h: 0.92, lw: 0.0066, phase: 2.1, shadowW: 0.15,
    legLen: 0.36, shoulder: 0.625, shoulderW: 0.088, hipW: 0.046, legW: 0.056, legColor: JEANS, legSplay: 0.006,
    torso: { top: 0.655, bot: 0.345, wTop: 0.105, wBot: 0.097, dTop: 0.08, dBot: 0.082, color: TEE, belly: 0.012 },
    head: { kind: 'capsule', hw: 0.08, hh: 0.135, cy: 0.762, lean: 0.03, neck: 0.03 },
    arm: { upper: 0.142, fore: 0.135, w: 0.037, skinPart: true, sleeve: TEE, sleeveTo: 0.36, sleeveW: 0.064, hand: 0.028 },
    skin: LEO_SKIN, handColor: LEO_SKIN,
    boot: { h: 0.075, w: 0.041, foot: 0.06, toe: 0.05, back: 0.014, sole: 0.016, color: '#2b2729', soleColor: '#151214', laces: true },
    face: { eyes: 'googly', eyeR: 0.034, eyeSep: 0.033, eyeY: -0.014, pupil: 0.36, goofy: 0.8, nose: 0.012, noseY: 0.045, mouthY: 0.066, mouthW: 0.042,
      lidBias: -0.1, grinOpen: 0.16, grinW: 0.8, catch: 0 },
    collar: crewCollar('#dcd5c6'),
    outfit: null, outfitTop(c, B) { apron(c, B); apronSkirt(c, B); },
    hat: beanie,
  };
  C.define('leo', LEO);

  // ---------------------------------------------------------------- LIA (Leo as a woman) for A2
  const LIA = Object.assign({}, LEO, { name: 'Lía', phase: 1.4,
    face: Object.assign({}, LEO.face, { lashes: true, lip: '#5a1f2a' }),
    hairBack(c, H) { // two short braids from under the beanie
      const hw = H.hw, sw = Math.sin(H.t * 2.2) * 0.006;
      const sides = H.fs < 0.2 ? [-1, 1] : [-H.faceDir];
      for (const sg of sides) {
        const x0 = H.fs < 0.2 ? sg * hw * 0.95 : -H.faceDir * hw * (0.95 - 0.4 * H.fs), y0 = -H.hh + 0.1;
        for (let k = 0; k < 4; k++) { const x = x0 + sg * 0.006 * (H.fs < 0.2 ? 1 : 0) + sw * k * 0.5, y = y0 + 0.012 + k * 0.024;
          c.fillStyle = '#1e1414'; c.strokeStyle = INK; c.lineWidth = H.lw * 1.6; K.ellipse(c, x, y, 0.014, 0.016); c.fill(); c.stroke(); }
        const x = x0 + sw * 2, y = y0 + 0.012 + 4 * 0.024 - 0.006;
        c.fillStyle = BEANIE; K.ellipse(c, x, y, 0.011, 0.007); c.fill(); c.stroke();
        c.fillStyle = '#1e1414'; K.ellipse(c, x, y + 0.016, 0.009, 0.013); c.fill(); c.stroke();
      }
    },
    headTop(c, H) { // gold hoops
      const ey = H.F.mouthY - 0.012, ears = H.fs < 0.2 ? [-1, 1] : [-H.faceDir];
      for (const sg of ears) { const ex = H.fs < 0.2 ? sg * H.hw * 1.0 : -H.faceDir * H.hw * (1 - H.fs * 0.5);
        c.strokeStyle = INK; c.lineWidth = H.lw * 3.4; K.circle(c, ex, ey + 0.016, 0.013); c.stroke(); c.strokeStyle = '#f0c24a'; c.lineWidth = H.lw * 1.6; c.stroke(); }
    },
  });
  C.define('lia', LIA);

  // ---------------------------------------------------------------- PAZ (B, patient + curious)
  const ROSE = '#e0849b', ROSE_D = '#b8607a', PLUM = '#5d3a6b', CREAM = '#f4ead6', PTEAL = '#2f8a80';
  function glasses(c, H, eyes, ey, rr) {
    const lw = H.lw, R = rr * 2.15;
    c.strokeStyle = '#3b2440'; c.lineWidth = lw * 2.2;
    const pos = eyes.map(e => e[0]).sort((a, b) => a - b);
    for (const [x, side, far] of eyes) {
      c.fillStyle = 'rgba(255,255,255,0.16)'; K.ellipse(c, x, ey, R * (far ? 0.72 : 1) * (1 - 0.25 * H.fs), R); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = lw * 1.2; c.beginPath(); c.ellipse(x, ey, R * 0.72 * (far ? 0.72 : 1) * (1 - 0.25 * H.fs), R * 0.72, 0, -2.6, -1.9); c.stroke();
      c.strokeStyle = '#3b2440'; c.lineWidth = lw * 2.2;
    }
    if (pos.length === 2) { c.beginPath(); c.moveTo(pos[0] + R * 0.9 * (1 - 0.25 * H.fs), ey - R * 0.15); c.quadraticCurveTo((pos[0] + pos[1]) / 2, ey - R * 0.45, pos[1] - R * 0.9 * (1 - 0.25 * H.fs) * (H.fs > 0.2 ? 0.72 : 1), ey - R * 0.15); c.stroke(); }
    if (H.fs > 0.2) { const x = eyes[0][0], back = -H.faceDir; c.beginPath(); c.moveTo(x + back * R * (1 - 0.25 * H.fs), ey - R * 0.2); c.lineTo(x + back * (H.hw * 0.75), ey - R * 0.45); c.stroke(); }
  }
  const PAZ = {
    kind: 'biped', name: 'Paz', h: 1.0, lw: 0.0066, phase: 0.4, shadowW: 0.16, headOver: true,
    legLen: 0.27, shoulder: 0.64, shoulderW: 0.058, hipW: 0.042, legW: 0.044, legColor: PLUM, legSplay: 0.004,
    torso: { top: 0.665, bot: 0.26, wTop: 0.07, wBot: 0.135, dTop: 0.06, dBot: 0.1, color: ROSE },
    head: { kind: 'circle', hw: 0.13, hh: 0.13, cy: 0.785 },
    arm: { upper: 0.13, fore: 0.12, w: 0.036, sleeve: ROSE, cuff: CREAM, hand: 0.025 },
    skin: '#b97c55', handColor: '#b97c55',
    boot: { h: 0.05, w: 0.034, foot: 0.05, toe: 0.042, back: 0.01, sole: 0.014, color: CREAM, soleColor: PTEAL },
    face: { eyes: 'dot', eyeR: 0.019, eyeSep: 0.047, eyeY: 0.004, mouthY: 0.058, mouthW: 0.03, brows: 0.0075, browW: 1.2, browGap: 2.75,
      blush: 0.32, lashes: true, lip: '#6a2436', glasses, turnK: 0.5 },
    outfit(c, B) { // coat: placket, three big round buttons (dots), pockets
      const s = B.s, d = B.dir, px = B.tcx + d * s * B.wB * 0.45;
      c.strokeStyle = K.rgba(INK, 0.55); c.lineWidth = B.lw * 1.4; c.beginPath(); c.moveTo(px, B.Ttop + 0.02); c.lineTo(px + d * s * 0.02, B.Tbot); c.stroke();
      for (let k = 0; k < 3; k++) { const y = B.Ttop + 0.07 + k * 0.085, x = px + d * s * 0.004 * k + 0.018 * (1 - s);
        c.fillStyle = CREAM; c.strokeStyle = INK; c.lineWidth = B.lw * 1.5; K.ellipse(c, x, y, 0.014 * (1 - 0.3 * s), 0.014); c.fill(); c.stroke(); }
      for (const sg of [-1, 1]) { if (s > 0.5 && sg === d) continue; const x = B.tcx + sg * B.wB * 0.55 * (1 - 0.5 * s) + d * s * 0.03, y = B.Tbot - 0.09;
        c.strokeStyle = ROSE_D; c.lineWidth = B.lw * 2.2; c.beginPath(); c.moveTo(x - 0.032, y); c.lineTo(x + 0.032, y); c.stroke(); }
      c.fillStyle = K.rgba(ROSE_D, 0.5); c.fillRect(B.tcx - 0.3, B.Tbot - 0.02, 0.6, 0.03);
    },
    collar(c, B) { // a round cream collar (two half discs)
      const x = B.tcx + B.dir * B.s * 0.02, y = B.Ttop + 0.004;
      for (const sg of (B.s > 0.8 ? [B.dir] : [-1, 1])) { c.fillStyle = CREAM; c.strokeStyle = INK; c.lineWidth = B.lw * 2;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sg * 0.06 * (1 - 0.4 * B.s), y - 0.005, x + sg * 0.062 * (1 - 0.4 * B.s), y + 0.012); c.quadraticCurveTo(x + sg * 0.05, y + 0.045, x, y + 0.03); c.closePath(); c.fill(); c.stroke(); }
    },
    hairFront(c, H) { // hair pulled back with a middle part; dark cap over the circle
      const r = H.hw, fd = H.faceDir, fs = H.fs, px = fd * fs * r * 0.55;
      c.save(); K.circle(c, 0, 0, r); c.clip();
      c.fillStyle = '#251518'; c.beginPath(); c.moveTo(-r * 1.2, r * 0.2 - fs * 0.0); c.lineTo(-r * 1.2, -r * 1.2); c.lineTo(r * 1.2, -r * 1.2); c.lineTo(r * 1.2, r * 0.2);
      c.quadraticCurveTo(r * 0.95 + fd * fs * r * 0.1, -r * 0.2, px + r * 0.05, -r * 0.62);
      c.quadraticCurveTo(-r * 0.95 + fd * fs * r * 0.6, -r * 0.2, -r * 1.2, r * 0.2); c.closePath(); c.fill();
      c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.stroke();
      c.strokeStyle = K.rgba('#6a4648', 0.9); c.lineWidth = H.lw * 1.2;
      for (const k of [-1, 1]) { c.beginPath(); c.moveTo(px, -r * 0.7); c.quadraticCurveTo(px + k * r * 0.45, -r * 0.75, px + k * r * 0.8, -r * 0.35); c.stroke(); }
      c.restore(); K.circle(c, 0, 0, r); c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.stroke();
    },
    hairBack(c, H) { // the bun (a dot on top) with a teal tie
      const r = H.hw, bx = H.fs > 0.05 ? -H.faceDir * H.fs * r * 0.45 : 0, by = -r * 1.02;
      c.fillStyle = '#251518'; c.strokeStyle = INK; c.lineWidth = H.lw * 2; K.circle(c, bx, by, 0.056); c.fill(); c.stroke();
      c.strokeStyle = K.rgba('#6a4648', 0.9); c.lineWidth = H.lw * 1.2; c.beginPath(); c.arc(bx, by, 0.034, -2.6, -0.9); c.stroke();
    },
    headTop(c, H) {
      const r = H.hw, bx = H.fs > 0.05 ? -H.faceDir * H.fs * r * 0.45 : 0;
      c.fillStyle = PTEAL; c.strokeStyle = INK; c.lineWidth = H.lw * 1.6; K.rrect(c, bx - 0.03, -r * 1.0 + 0.012, 0.06, 0.016, 0.008); c.fill(); c.stroke();
      const ears = H.fs < 0.2 ? [-1, 1] : [-H.faceDir];
      for (const sg of ears) { const ex = H.fs < 0.2 ? sg * r * 0.97 : -H.faceDir * r * (0.9 - 0.75 * H.fs), ey = r * 0.25;
        c.fillStyle = PTEAL; c.strokeStyle = INK; c.lineWidth = H.lw * 1.4; K.circle(c, ex, ey + 0.014, 0.0085); c.fill(); c.stroke(); }
    },
  };
  C.define('paz', PAZ);

  // ---------------------------------------------------------------- TOÑO (B, impatient)
  const COBALT = '#3a5bb5', COBALT_D = '#2b4590';
  const TONO = {
    kind: 'biped', name: 'Toño', h: 0.86, lw: 0.0066, phase: 1.7, shadowW: 0.16, headOver: true,
    legLen: 0.24, shoulder: 0.5, shoulderW: 0.092, hipW: 0.05, legW: 0.056, legColor: '#6f7280', legSplay: 0.008,
    torso: { top: 0.53, bot: 0.22, wTop: 0.112, wBot: 0.118, dTop: 0.09, dBot: 0.096, color: COBALT, belly: 0.014 },
    head: { kind: 'circle', hw: 0.132, hh: 0.132, cy: 0.655 },
    arm: { upper: 0.118, fore: 0.108, w: 0.044, sleeve: COBALT, cuff: COBALT_D, hand: 0.028, stripe: '#f4ecdc' },
    skin: '#e7b089', handColor: '#e7b089',
    boot: { h: 0.055, w: 0.04, foot: 0.055, toe: 0.048, back: 0.012, sole: 0.016, color: '#f08a3c', soleColor: '#f4ecdc', laces: true },
    face: { eyes: 'dot', eyeR: 0.02, eyeSep: 0.046, eyeY: -0.004, mouthY: 0.068, mouthW: 0.04, brows: 0.016, browW: 1.25, browGap: 2.0, browColor: '#1d1416',
      blush: 0.22, nose: 0.02, noseY: 0.035, turnK: 0.55, grinW: 0.85, grinOpen: 0.15 },
    outfit(c, B) { // zip, white chest stripe, hem band
      const s = B.s, d = B.dir, zx = B.tcx + d * s * B.wT * 0.5;
      c.fillStyle = '#f4ecdc'; c.fillRect(B.tcx - 0.3, B.Ttop + 0.07, 0.6, 0.022);
      c.fillStyle = COBALT_D; c.fillRect(B.tcx - 0.3, B.Tbot - 0.03, 0.6, 0.03);
      c.strokeStyle = INK; c.lineWidth = B.lw * 1.3; c.beginPath(); c.moveTo(B.tcx - 0.3, B.Tbot - 0.03); c.lineTo(B.tcx + 0.3, B.Tbot - 0.03); c.stroke();
      c.strokeStyle = '#c9cfe0'; c.lineWidth = B.lw * 1.8; c.beginPath(); c.moveTo(zx, B.Ttop); c.lineTo(zx, B.Tbot); c.stroke();
      c.fillStyle = '#e8e2d2'; c.strokeStyle = INK; c.lineWidth = B.lw * 1.2; K.rrect(c, zx - 0.006, B.Ttop + 0.05, 0.012, 0.024, 0.004); c.fill(); c.stroke();
    },
    collar(c, B) { // popped collar
      const x = B.tcx + B.dir * B.s * 0.03, y = B.Ttop;
      for (const sg of (B.s > 0.8 ? [-B.dir] : [-1, 1])) { c.fillStyle = COBALT_D; c.strokeStyle = INK; c.lineWidth = B.lw * 2;
        c.beginPath(); c.moveTo(x + sg * 0.02, y + 0.02); c.lineTo(x + sg * 0.085 * (1 - 0.4 * B.s), y - 0.035); c.lineTo(x + sg * 0.1 * (1 - 0.4 * B.s), y + 0.012); c.closePath(); c.fill(); c.stroke(); }
    },
    hat(c, H) { // black quiff (forward-swept), sideburns
      const r = H.hw, fd = H.faceDir, fs = H.fs, lean = (H.fs > 0.05 ? fd : 1);
      const sw = Math.sin(H.t * 3.0) * 0.004;
      const capP = () => { c.beginPath(); c.moveTo(-r * 1.0, -r * 0.1); c.quadraticCurveTo(-r * 1.05, -r * 1.1, -r * 0.1 * lean, -r * 1.05);
        c.bezierCurveTo(r * 0.3 * lean, -r * 1.75 + sw, r * 1.15 * lean + fd * fs * r * 0.3, -r * 1.65 + sw, r * 1.05 * lean + fd * fs * r * 0.25, -r * 1.1);
        c.quadraticCurveTo(r * 1.15, -r * 0.6, r * 1.0, -r * 0.1);
        c.quadraticCurveTo(r * 0.85, -r * 0.45, r * 0.55 * lean + fd * fs * r * 0.3, -r * 0.55); c.quadraticCurveTo(0, -r * 0.62, -r * 0.6 * lean + fd * fs * r * 0.4, -r * 0.5); c.quadraticCurveTo(-r * 0.9, -r * 0.4, -r * 1.0, -r * 0.1); c.closePath(); };
      h.shape(c, capP, '#1d1416', H.lw);
      c.strokeStyle = K.rgba('#5a4a52', 0.9); c.lineWidth = H.lw * 1.3;
      c.beginPath(); c.moveTo(-r * 0.2 * lean, -r * 0.95); c.quadraticCurveTo(r * 0.4 * lean, -r * 1.5, r * 0.95 * lean, -r * 1.25); c.stroke();
      c.beginPath(); c.moveTo(-r * 0.6 * lean, -r * 0.75); c.quadraticCurveTo(0, -r * 1.05, r * 0.6 * lean, -r * 0.95); c.stroke();
      if (fs < 0.85) for (const sg of (fs < 0.2 ? [-1, 1] : [-fd])) { const x = sg * r * 0.93 * (fs < 0.2 ? 1 : (1 - fs * 0.3)); c.fillStyle = '#1d1416'; c.beginPath(); c.moveTo(x, -r * 0.3); c.lineTo(x - sg * r * 0.12, -r * 0.3); c.lineTo(x - sg * r * 0.1, r * 0.05); c.closePath(); c.fill(); }
    },
  };
  C.define('tono', TONO);

  // ---------------------------------------------------------------- CHISPA (C, the spark-dot)
  const AMBER = '#ffb53d';
  const CHISPA = {
    kind: 'biped', name: 'Chispa', h: 0.36, lw: 0.0052, phase: 0.2, shadowW: 0.1, headOver: true, mascot: true, box: [0.9, 0.7, 0.58],
    legLen: 0.055, shoulder: 0.165, shoulderW: 0.112, hipW: 0.045, legW: 0.026, legColor: AMBER, legSplay: 0.006,
    torso: { top: 0.12, bot: 0.06, wTop: 0.02, wBot: 0.02, color: AMBER },
    head: { kind: 'circle', hw: 0.125, hh: 0.125, cy: 0.175 },
    arm: { upper: 0.042, fore: 0.04, w: 0.026, sleeve: AMBER, hand: 0.021 }, limbRim: 0.35,
    skin: AMBER, handColor: AMBER, extraK: 0.9,
    boot: { h: 0.03, w: 0.024, foot: 0.03, toe: 0.026, back: 0.006, sole: 0.009, color: PTEAL, soleColor: CREAM },
    face: { eyes: 'googly', eyeR: 0.036, eyeSep: 0.042, eyeY: -0.008, pupil: 0.6, catch: 0.38, goofy: 0, mouthY: 0.05, mouthW: 0.032, blush: 0.45, blushColor: '#ff6f5a',
      lidColor: '#f29a26', grinW: 0.7, grinOpen: 0.14, turnK: 0.5, brows: 0.007, browGap: 1.5, browW: 0.8 },
    lidColor: '#f0a02a',
    glow: { color: '#ffb84a', r: 2.6, a: 0.55 },
    hat(c, H) { // the flame tuft (sways)
      const r = H.hw, sw = Math.sin(H.t * 4.2) * 0.012 + Math.sin(H.t * 9.3) * 0.004, fl = 1 + Math.sin(H.t * 7) * 0.05;
      const bx = H.faceDir * H.fs * r * 0.15;
      const flame = (sc, col) => { c.beginPath(); c.moveTo(bx - 0.034 * sc, -r * 0.93); c.bezierCurveTo(bx - 0.05 * sc, -r - 0.05 * sc, bx + sw - 0.01, -r - 0.07 * sc * fl, bx + sw * 1.6, -r - 0.105 * sc * fl);
        c.bezierCurveTo(bx + sw + 0.012, -r - 0.06 * sc, bx + 0.05 * sc, -r - 0.04 * sc, bx + 0.034 * sc, -r * 0.93); c.closePath(); c.fillStyle = col; };
      flame(1, '#ffe27a'); c.strokeStyle = INK; c.lineWidth = H.lw * 2; c.lineJoin = 'round'; c.stroke(); c.fill();
      flame(0.55, '#fff6d0'); c.fill();
    },
  };
  C.define('chispa', CHISPA);

  // ---------------------------------------------------------------- PUNTO (D, the dot upgraded)
  const PUNTO = {
    kind: 'biped', name: 'Punto', h: 0.36, lw: 0.0052, phase: 1.1, shadowW: 0.11, headOver: true, mascot: true, box: [0.9, 0.7, 0.58],
    legLen: 0.06, shoulder: 0.175, shoulderW: 0.128, hipW: 0.045, legW: 0.017, legColor: '#1C2433', legSplay: 0.01,
    torso: { top: 0.12, bot: 0.07, wTop: 0.02, wBot: 0.02, color: '#E8553A' },
    head: { kind: 'circle', hw: 0.135, hh: 0.135, cy: 0.19, noLine: true },
    arm: { upper: 0.05, fore: 0.048, w: 0.018, sleeve: '#1C2433', hand: 0.021 }, limbRim: 0,
    skin: '#E8553A', handColor: '#1C2433', extraK: 0.9,
    boot: { h: 0.032, w: 0.024, foot: 0.032, toe: 0.028, back: 0.006, sole: 0.01, color: '#23746C', soleColor: CREAM },
    face: { eyes: 'dot', eyeR: 0.019, eyeSep: 0.043, eyeY: -0.02, mouthY: 0.04, mouthW: 0.036, brows: 0.011, browW: 1.15, browGap: 2.1, blush: 0.0, turnK: 0.5,
      grinW: 0.75, grinOpen: 0.14 },
    lidColor: '#d84a32',
    headTop(c, H) { // teal knit scarf around the bottom of the disc, tail flutters
      const r = H.hw, y = r * 0.62, fl = Math.sin(H.t * 5) * 0.012, back = H.fs > 0.05 ? -H.faceDir : -1;
      c.save(); K.circle(c, 0, 0, r * 1.02); c.clip();
      c.fillStyle = '#23746C'; c.beginPath(); c.moveTo(-r * 1.1, y - 0.01); c.quadraticCurveTo(0, y + 0.03, r * 1.1, y - 0.01); c.lineTo(r * 1.1, y + 0.05); c.quadraticCurveTo(0, y + 0.09, -r * 1.1, y + 0.05); c.closePath(); c.fill();
      c.strokeStyle = '#1a5a54'; c.lineWidth = H.lw * 1.4; for (let i = -5; i <= 5; i++) { const x = i * r * 0.2; c.beginPath(); c.moveTo(x, y + 0.012 + Math.abs(x) * -0.05); c.lineTo(x + 0.006, y + 0.055 - Math.abs(x) * 0.08); c.stroke(); }
      c.restore();
      // tail
      const tx = back * r * 0.55, ty = y + 0.04;
      c.fillStyle = '#23746C'; c.beginPath(); c.moveTo(tx - 0.018, ty - 0.01); c.quadraticCurveTo(tx + back * 0.03, ty + 0.03, tx + back * (0.075) , ty + 0.03 + fl);
      c.lineTo(tx + back * 0.08, ty + 0.06 + fl); c.quadraticCurveTo(tx + back * 0.02, ty + 0.06, tx + 0.018 * back, ty + 0.0); c.closePath(); c.fill();
      c.strokeStyle = '#f3ecdd'; c.lineWidth = H.lw * 1.6; for (const k of [0.6, 0.85]) { c.beginPath(); c.moveTo(tx + back * 0.075 * k, ty + 0.025 + fl * k); c.lineTo(tx + back * 0.08 * k, ty + 0.055 + fl * k); c.stroke(); }
    },
  };
  C.define('punto', PUNTO);

  // the candidates (pairs + mascots), with names and one-liners for the boards
  C.CANDIDATES = {
    A: { title: 'A · Max & Leo, adaptados', cast: ['leo', 'mila'], car: { driver: 'leo', passenger: 'mila' } },
    A2: { title: 'A2 · Max & Leo, el otro cambio', cast: ['lia', 'max'], car: { driver: 'lia', passenger: 'max' } },
    B: { title: 'B · Pareja nueva nacida en este estilo', cast: ['tono', 'paz'], car: { driver: 'tono', passenger: 'paz' } },
    C: { title: 'C · Mascota nueva: Chispa', cast: ['chispa'], car: { driver: 'leo', passenger: 'mila', mascot: 'chispa' } },
    D: { title: 'D · El punto, mejorado', cast: ['punto'], car: { driver: 'leo', passenger: 'mila', mascot: 'punto' } },
  };
})(typeof window !== 'undefined' ? window : globalThis);
