/* Diez Mil Puntos art kit · characters. Construction (see ART_BIBLE.md §3):
   - Head = a true circle of radius R. Face uses the brand construction: eyes at x = ±0.32R, y = −0.14R, r = 0.135R;
     mouth at y = +0.30R, stroke 0.144R, round caps. `look` (−1..1, −1..1) slides the whole face ±0.12R.
   - Generic people: warm skin tones, simple hair shapes, a thin warm-dark outline (0.06R) like ink line on gouache.
   - The mascot: a vermilion disc, NO outline, no hair, same face. Rim light + a flat shade crescent sit inside the disc.
   Expressions: neutral curious surprised worried delighted smug sleepy dizzy wink sad focused laughing annoyed grumpy
                shocked content (plus blink 0..1 on top of any of them). */
(function (root) {
  const K = root.K;
  K.char = {};
  K.INK = '#1C2433'; K.VERMILION = '#E8553A'; K.PAPER = '#F3ECDD'; K.TEAL = '#23746C';
  const FACE_INK = '#24161a';

  function eye(ctx, x, y, r, kind, ink, dir = 1) {
    ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    switch (kind) {
      case 'dot': K.circle(ctx, x, y, r); ctx.fill(); break;
      case 'big': K.circle(ctx, x, y, r * 1.35); ctx.fill(); ctx.fillStyle = '#ffffff'; K.circle(ctx, x - r * 0.4, y - r * 0.45, r * 0.42); ctx.fill(); break;
      case 'happy': ctx.lineWidth = r * 0.9; ctx.beginPath(); ctx.arc(x, y + r * 0.6, r * 1.2, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); break;
      case 'closed': ctx.lineWidth = r * 0.8; ctx.beginPath(); ctx.arc(x, y - r * 0.5, r * 1.15, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); break;
      case 'line': ctx.lineWidth = r * 0.85; ctx.beginPath(); ctx.moveTo(x - r * 1.2, y); ctx.lineTo(x + r * 1.2, y); ctx.stroke(); break;
      case 'half': // heavy upper lid: annoyed / smug / focused (half disc under a flat lid)
        ctx.save(); ctx.beginPath(); ctx.rect(x - r * 2, y - r * 0.05, r * 4, r * 3); ctx.clip(); K.circle(ctx, x, y, r * 1.12); ctx.fill(); ctx.restore();
        ctx.lineWidth = r * 0.6; ctx.beginPath(); ctx.moveTo(x - r * 1.3, y - r * 0.12 - dir * r * 0.08); ctx.lineTo(x + r * 1.3, y - r * 0.12 + dir * r * 0.08); ctx.stroke(); break;
      case 'chevron': ctx.lineWidth = r * 0.8; ctx.beginPath(); ctx.moveTo(x - dir * r * 1.1, y - r * 0.9); ctx.lineTo(x + dir * r * 0.9, y); ctx.lineTo(x - dir * r * 1.1, y + r * 0.9); ctx.stroke(); break;
      case 'spiral': ctx.lineWidth = r * 0.45; ctx.beginPath(); for (let a = 0; a < 12; a += 0.3) { const rr = r * 1.3 * a / 12; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.stroke(); break;
      case 'ring': ctx.lineWidth = r * 0.5; K.circle(ctx, x, y, r * 1.2); ctx.stroke(); K.circle(ctx, x, y, r * 0.45); ctx.fill(); break;
    }
  }
  function mouth(ctx, x, y, R, kind, ink) {
    const w = R * 0.144; ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    switch (kind) {
      case 'line': ctx.moveTo(x - R * 0.2, y); ctx.lineTo(x + R * 0.2, y); ctx.stroke(); break;
      case 'short': ctx.moveTo(x - R * 0.11, y); ctx.lineTo(x + R * 0.11, y); ctx.stroke(); break;
      case 'tilt': ctx.moveTo(x - R * 0.17, y + R * 0.05); ctx.lineTo(x + R * 0.17, y - R * 0.04); ctx.stroke(); break;
      case 'smile': ctx.arc(x, y - R * 0.12, R * 0.22, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); break;
      case 'grin': ctx.moveTo(x - R * 0.25, y - R * 0.04); ctx.quadraticCurveTo(x, y - R * 0.02, x + R * 0.25, y - R * 0.04);
        ctx.quadraticCurveTo(x + R * 0.18, y + R * 0.26, x, y + R * 0.27); ctx.quadraticCurveTo(x - R * 0.18, y + R * 0.26, x - R * 0.25, y - R * 0.04); ctx.fill(); break;
      case 'smirk': ctx.moveTo(x - R * 0.2, y + R * 0.02); ctx.quadraticCurveTo(x + R * 0.05, y + R * 0.12, x + R * 0.24, y - R * 0.08); ctx.stroke(); break;
      case 'o': ctx.lineWidth = w * 0.9; K.ellipse(ctx, x, y + R * 0.02, R * 0.09, R * 0.11); ctx.stroke(); break;
      case 'O': K.ellipse(ctx, x, y + R * 0.04, R * 0.12, R * 0.15); ctx.fill(); break;
      case 'frown': ctx.arc(x, y + R * 0.2, R * 0.2, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); break;
      case 'wavy': ctx.moveTo(x - R * 0.24, y); for (let i = 1; i <= 6; i++) ctx.lineTo(x - R * 0.24 + i * R * 0.08, y + (i % 2 ? -1 : 1) * R * 0.05); ctx.stroke(); break;
      case 'grumble': ctx.moveTo(x - R * 0.2, y + R * 0.04); ctx.quadraticCurveTo(x, y - R * 0.07, x + R * 0.2, y + R * 0.04); ctx.stroke(); break;
      case 'tiny': K.circle(ctx, x, y, R * 0.06); ctx.fill(); break;
      case 'yell': { const W = R * 0.24, D = R * 0.36; ctx.moveTo(x - W, y + R * 0.02); ctx.quadraticCurveTo(x, y - R * 0.08, x + W, y + R * 0.02); ctx.quadraticCurveTo(x + W * 0.9, y + D, x, y + D); ctx.quadraticCurveTo(x - W * 0.9, y + D, x - W, y + R * 0.02); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.clip(); ctx.fillStyle = '#fbf6ec'; ctx.fillRect(x - W, y - R * 0.1, W * 2, R * 0.1); ctx.fillStyle = '#e0707a'; K.ellipse(ctx, x, y + D * 0.85, W * 0.55, D * 0.25); ctx.fill(); ctx.restore(); break; }
      case 'laugh': ctx.moveTo(x - R * 0.27, y - R * 0.05); ctx.quadraticCurveTo(x, y - R * 0.01, x + R * 0.27, y - R * 0.05); ctx.quadraticCurveTo(x + R * 0.2, y + R * 0.34, x, y + R * 0.35); ctx.quadraticCurveTo(x - R * 0.2, y + R * 0.34, x - R * 0.27, y - R * 0.05); ctx.fill();
        ctx.save(); ctx.clip(); ctx.fillStyle = '#e0707a'; K.ellipse(ctx, x, y + R * 0.3, R * 0.14, R * 0.08); ctx.fill(); ctx.restore(); break;
      case 'sheep': ctx.lineWidth = w * 0.8; ctx.moveTo(x - R * 0.22, y); ctx.quadraticCurveTo(x - R * 0.11, y + R * 0.08, x, y + R * 0.02); ctx.quadraticCurveTo(x + R * 0.11, y + R * 0.1, x + R * 0.22, y - R * 0.02); ctx.stroke(); break;
      case 'set': ctx.moveTo(x - R * 0.18, y + R * 0.03); ctx.quadraticCurveTo(x, y - R * 0.01, x + R * 0.18, y + R * 0.03); ctx.stroke(); break;
      case 'think': ctx.moveTo(x + R * 0.0, y + R * 0.02); ctx.quadraticCurveTo(x + R * 0.12, y - R * 0.03, x + R * 0.22, y + R * 0.03); ctx.stroke(); break;
    }
  }
  // brows: (outer dy, inner dy) in R units; negative = up
  const BROWS = { worried: [0.07, -0.06], angry: [-0.06, 0.08], furious: [-0.1, 0.13], up: [-0.09, -0.09], flat: [0.02, 0.02], one: [0, 0], sad: [0.08, -0.08] };
  function brows(ctx, x, y, R, kind, ink) {
    const b = BROWS[kind]; if (!b) return;
    ctx.strokeStyle = ink; ctx.lineWidth = R * 0.1; ctx.lineCap = 'round';
    const ex = R * 0.32, by = y - R * 0.36;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + s * (ex + 0.14 * R), by + b[0] * R);   // outer end
      ctx.lineTo(x + s * (ex - 0.13 * R), by + b[1] * R);   // inner end
      ctx.stroke();
    }
  }

  const EXPR = {
    neutral:   { eyes: 'dot', mouth: 'line' },
    content:   { eyes: 'dot', mouth: 'smile' },
    curious:   { eyes: 'dot', mouth: 'tilt', eyeScale: [0.85, 1.15] },
    surprised: { eyes: 'dot', mouth: 'O', eyeScale: [1.35, 1.35], lift: -0.03 },
    shocked:   { eyes: 'big', mouth: 'O', brows: 'up', lift: -0.04 },
    worried:   { eyes: 'dot', mouth: 'wavy', brows: 'worried' },
    delighted: { eyes: 'happy', mouth: 'grin' },
    smug:      { eyes: 'half', mouth: 'smirk' },
    sleepy:    { eyes: 'closed', mouth: 'tiny' },
    dizzy:     { eyes: 'spiral', mouth: 'wavy' },
    wink:      { eyes: ['dot', 'line'], mouth: 'smile' },
    sad:       { eyes: 'dot', mouth: 'frown', brows: 'worried' },
    focused:   { eyes: 'half', mouth: 'short', brows: 'angry' },
    laughing:  { eyes: 'chevron', mouth: 'grin' },
    annoyed:   { eyes: 'half', mouth: 'grumble', brows: 'angry' },
    grumpy:    { eyes: 'half', mouth: 'frown', brows: 'angry' },
    // v4 emotion set (shared with Eli + Mila, see characters/leo_mila/CHARACTERS.md)
    happy:     { eyes: 'happy', mouth: 'grin', brows: 'up', lift: -0.02, blush: 0.3 },
    laugh:     { eyes: 'chevron', mouth: 'laugh', brows: 'up', lift: -0.03, tilt: -0.12, blush: 0.35 },
    awe:       { eyes: 'big', mouth: 'O', brows: 'up', lift: -0.03, sparkle: 1, tilt: -0.06 },
    thinking:  { eyes: 'dot', mouth: 'think', brows: 'one', look: [0.6, -0.8], tilt: 0.08 },
    sheepish:  { eyes: 'dot', mouth: 'sheep', brows: 'sad', look: [-0.8, 0.5], blush: 0.45, sweat: 1, tilt: -0.08 },
    furious:   { eyes: 'half', mouth: 'yell', brows: 'furious', tilt: 0.05, anger: 1 },
    determined: { eyes: 'half', mouth: 'set', brows: 'angry' },
  };
  EXPR.laughing.mouth = 'laugh'; EXPR.smug.brows = 'one'; EXPR.curious.brows = 'one'; EXPR.surprised.brows = 'up'; EXPR.worried.sweat = 1; EXPR.sly = EXPR.smug;
  K.char.EXPR = EXPR;
  K.char.EXPRESSIONS = Object.keys(EXPR);

  // face only, centred on a head of radius R at (x, y). v4: o.view 'front' | 'q' | 'side' + o.dir, so every emotion
  // reads in 3/4 and profile too (profile: one eye, one brow, a mouth on the face edge, nose bump drawn by the head)
  K.char.face = function (ctx, x, y, R, expr = 'neutral', o = {}) {
    const e = EXPR[expr] || EXPR.neutral, ink = o.ink || FACE_INK, s = { front: 0, q: 0.55, side: 1 }[o.view || 'front'] ?? 0, d = o.dir || 1;
    const look = o.look || e.look || [0, 0];
    const lx = look[0] * 0.12 * R, ly = look[1] * 0.12 * R;
    const fx = x + lx * (1 - s * 0.6) + d * s * R * 0.5, fy = y + ly + (e.lift || 0) * R;
    const er = R * 0.135, blink = o.blink || 0;
    const kinds = Array.isArray(e.eyes) ? e.eyes : [e.eyes, e.eyes];
    const eyes = s > 0.88 ? [[fx + d * R * 0.1, d, 1]] : [[fx - R * 0.32 * (1 - 0.3 * s), -1, d > 0 ? 1 : 1 - 0.3 * s], [fx + R * 0.32 * (1 - 0.3 * s), 1, d > 0 ? 1 - 0.3 * s : 1]];
    eyes.forEach(([ex, sd, sx], k) => {
      const ey = fy - R * 0.14, kind = kinds[s > 0.88 ? 1 : k], sc = e.eyeScale ? e.eyeScale[k] : 1;
      ctx.save(); ctx.translate(ex, ey); ctx.scale(sx, 1); ctx.translate(-ex, -ey);
      if (blink > 0.5 && (kind === 'dot' || kind === 'big')) eye(ctx, ex, ey, er, 'line', ink);
      else eye(ctx, ex, ey, er * sc * (s > 0.88 ? 1.25 : 1), kind, ink, sd);
      ctx.restore();
      // brows (per eye; 'one' arches the brow on the look side)
      const b = BROWS[e.brows]; if (!b) return;
      ctx.strokeStyle = ink; ctx.lineWidth = R * 0.1; ctx.lineCap = 'round';
      const by = ey - R * 0.22 - (e.eyes === 'big' ? R * 0.06 : 0), w = R * 0.14 * sx;
      let bo = b[0], bi = b[1]; if (e.brows === 'one') { const lift = (sd === (look[0] >= 0 ? 1 : -1) || s > 0.88) ? -0.1 : 0.02; bo = lift; bi = lift * 0.4; }
      ctx.beginPath(); ctx.moveTo(ex + sd * w * 1.05, by + bo * R); ctx.quadraticCurveTo(ex, by - R * 0.04 + (bo + bi) * R * 0.5, ex - sd * w * 0.95, by + bi * R); ctx.stroke();
    });
    const mk = o.mouth || e.mouth;
    if (s > 0.88) { // profile mouth on the face edge
      const mx = x + d * R * 0.86, my = fy + R * 0.3; ctx.save(); ctx.translate(mx, my); ctx.scale(d * 1.35, 1.35); ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineWidth = R * 0.12;
      if (['grin', 'laugh', 'yell', 'O'].includes(mk)) { const sz = { grin: 0.6, laugh: 0.85, yell: 1.05, O: 0.7 }[mk]; ctx.beginPath(); ctx.moveTo(R * 0.12, -R * 0.06 * sz); ctx.quadraticCurveTo(-R * 0.18 * sz, -R * 0.04, -R * 0.2 * sz, R * 0.06); ctx.quadraticCurveTo(-R * 0.12 * sz, R * 0.28 * sz, R * 0.12, R * 0.24 * sz); ctx.closePath(); ctx.fill();
        if (mk !== 'O') { ctx.save(); ctx.clip(); ctx.fillStyle = '#fbf6ec'; ctx.fillRect(-R * 0.3, -R * 0.1, R * 0.5, R * 0.07); ctx.restore(); } }
      else if (mk === 'o' || mk === 'tiny') { K.ellipse(ctx, -R * 0.04, R * 0.03, R * 0.06, R * 0.08); ctx.fill(); }
      else { const curl = { smile: -1, smirk: -1.4, sheep: -0.5, frown: 1, wavy: 0.4, grumble: 0.6, set: 0.3, think: 0.3, line: 0, short: 0, tilt: -0.3 }[mk] ?? 0;
        ctx.beginPath(); ctx.moveTo(R * 0.05, 0); ctx.quadraticCurveTo(-R * 0.08, R * 0.02 + curl * R * 0.02, -R * 0.17, curl * R * 0.09); ctx.stroke(); }
      ctx.restore();
    } else {
      const mx = fx + d * s * R * 0.08; ctx.save(); ctx.translate(mx, fy + R * 0.30); ctx.scale(1 - 0.3 * s, 1); mouth(ctx, 0, 0, R, mk, ink); ctx.restore();
    }
    const bl = (o.blush || 0) + (e.blush || 0) * (R > 8 ? 1 : 0);
    if (bl) { ctx.fillStyle = K.rgba('#ff7a6a', Math.min(0.55, bl)); for (const [ex, sd] of eyes) { K.ellipse(ctx, ex + sd * R * 0.12, fy + R * 0.12, R * 0.13, R * 0.07); ctx.fill(); } }
    if (R > 8) { // secondary cues, sparingly
      if (e.sweat) { const sx = x - d * (s > 0.3 ? R * 0.75 : -R * 0.75), sy = y - R * 0.45; ctx.fillStyle = '#9fd3f0'; ctx.strokeStyle = ink; ctx.lineWidth = R * 0.04; ctx.beginPath(); ctx.moveTo(sx, sy - R * 0.2); ctx.quadraticCurveTo(sx + R * 0.12, sy, sx, sy + R * 0.08); ctx.quadraticCurveTo(sx - R * 0.12, sy, sx, sy - R * 0.2); ctx.fill(); ctx.stroke(); }
      if (e.anger) K.char.extra(ctx, x - d * s * R * 0.4, y, R, 'anger', 0, { ink });
      if (e.sparkle) K.char.extra(ctx, x, y, R, 'sparkle', 0, { color: '#f3c94a' });
    }
  };

  // rim light + flat shade crescent inside a circle (lightAng = direction the light comes FROM, radians, 0 = right)
  K.char.discLight = function (ctx, x, y, R, o) {
    ctx.save(); K.circle(ctx, x, y, R); ctx.clip();
    if (o.shade) {
      ctx.fillStyle = K.rgba(o.shade, o.shadeAlpha ?? 0.35);
      ctx.beginPath(); ctx.rect(x - R * 2, y - R * 2, R * 4, R * 4);
      ctx.arc(x + Math.cos(o.ang) * R * 0.28, y + Math.sin(o.ang) * R * 0.28, R * 1.02, 0, K.TAU, true); ctx.fill('evenodd');
    }
    if (o.rim) {
      const w = o.rimW ?? 0.09;
      ctx.fillStyle = K.rgba(o.rim, o.rimAlpha ?? 0.95);
      ctx.beginPath(); ctx.rect(x - R * 2, y - R * 2, R * 4, R * 4);
      ctx.arc(x - Math.cos(o.ang) * R * w, y - Math.sin(o.ang) * R * w, R, 0, K.TAU, true); ctx.fill('evenodd');
    }
    ctx.restore();
  };

  // ---------------------------------------------------------------- the mascot (the companion)
  // sx, sy = squash/stretch (bottom stays planted when `planted`), look = [x, y]
  K.char.mascot = function (ctx, x, y, R, o = {}) {
    const sx = o.sx || 1, sy = o.sy || 1;
    ctx.save();
    ctx.translate(x, o.planted ? y + R : y); ctx.scale(sx, sy); ctx.translate(0, o.planted ? -R : 0);
    ctx.fillStyle = o.color || K.VERMILION; K.circle(ctx, 0, 0, R); ctx.fill();
    K.circle(ctx, 0, 0, R); K.tex.fillPath(ctx, 0.22, Math.max(0.5, R / 120));
    K.char.discLight(ctx, 0, 0, R, { ang: o.lightAng ?? -0.6, rim: o.rim ?? '#ffd59a', rimW: o.rimW, rimAlpha: o.rimAlpha, shade: o.shade ?? '#5a1f2c', shadeAlpha: o.shadeAlpha ?? 0.28 });
    K.char.face(ctx, 0, 0, R, o.expr || 'neutral', { look: o.look, blink: o.blink, ink: o.ink || '#1C2433', blush: o.blush, mouth: o.mouth });
    ctx.restore();
  };

  // extras around the head (outside the disc): sweat, puff, ticks, sparkles, '!' (ink or teal, never vermilion)
  K.char.extra = function (ctx, x, y, R, kind, t = 0, o = {}) {
    const ink = o.ink || K.INK; ctx.save(); ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = 'round';
    if (kind === 'ticks') {
      ctx.lineWidth = R * 0.08;
      for (const a of [-2.2, -1.57, -0.94]) { const r0 = R * (1.18 + 0.05 * Math.sin(t * 20)), r1 = R * 1.45;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.stroke(); }
    } else if (kind === 'sweat') {
      ctx.fillStyle = o.color || '#7fc4e8'; const sx = x + R * 0.95, sy = y - R * 0.55 + t * R * 0.3;
      ctx.beginPath(); ctx.moveTo(sx, sy - R * 0.22); ctx.quadraticCurveTo(sx + R * 0.13, sy, sx, sy + R * 0.08); ctx.quadraticCurveTo(sx - R * 0.13, sy, sx, sy - R * 0.22); ctx.fill();
    } else if (kind === 'puff') { // little steam puffs above the head (annoyed)
      for (let i = 0; i < 3; i++) {
        const ph = (t * 1.3 + i / 3) % 1, px = x + (i - 1) * R * 0.45 + Math.sin(ph * 6 + i) * R * 0.08, py = y - R * (1.15 + ph * 0.7), pr = R * (0.1 + ph * 0.16);
        ctx.fillStyle = K.rgba(o.color || '#f3ecdd', 0.95 * (1 - ph * ph)); ctx.strokeStyle = K.rgba(ink, 0.9 * (1 - ph * ph)); ctx.lineWidth = R * 0.05;
        ctx.beginPath(); for (let j = 0; j < 3; j++) { const a = j * 2.1 + i; ctx.moveTo(px + Math.cos(a) * pr * 0.45 + pr * 0.7, py + Math.sin(a) * pr * 0.45); ctx.arc(px + Math.cos(a) * pr * 0.45, py + Math.sin(a) * pr * 0.45, pr * 0.7, 0, K.TAU); }
        ctx.stroke(); ctx.fill();
      }
    } else if (kind === 'anger') { // the cross-vein mark
      ctx.lineWidth = R * 0.07; const ax = x + R * 0.78, ay = y - R * 0.78, s = R * 0.16;
      for (const [dx, dy, r0] of [[-1, -1, 0], [1, -1, 1], [1, 1, 2], [-1, 1, 3]]) {
        ctx.beginPath(); ctx.arc(ax + dx * s, ay + dy * s, s * 0.8, (r0 * Math.PI / 2) + Math.PI * 0.0, (r0 * Math.PI / 2) + Math.PI * 0.5); ctx.stroke();
      }
    } else if (kind === 'sparkle') {
      ctx.fillStyle = o.color || K.TEAL;
      for (const [dx, dy, s] of [[1.15, -0.9, 0.22], [-1.2, -0.6, 0.14], [1.35, -0.35, 0.12]]) {
        const cx = x + dx * R, cy = y + dy * R, rr = s * R * (0.8 + 0.2 * Math.sin(t * 6 + dx));
        ctx.beginPath(); ctx.moveTo(cx, cy - rr); ctx.quadraticCurveTo(cx, cy, cx + rr, cy); ctx.quadraticCurveTo(cx, cy, cx, cy + rr); ctx.quadraticCurveTo(cx, cy, cx - rr, cy); ctx.quadraticCurveTo(cx, cy, cx, cy - rr); ctx.fill();
      }
    } else if (kind === 'bang') {
      ctx.font = `800 ${R * 0.9}px "Martian Mono"`; ctx.textAlign = 'center'; ctx.fillText('!', x + R * 1.15, y - R * 0.75);
    }
    ctx.restore();
  };

  // ---------------------------------------------------------------- generic people
  K.char.SKIN = ['#f2c8a8', '#e3a983', '#c98a64', '#9a6447', '#6f4633', '#f6d7bd'];
  K.char.HAIR = ['#2b1d1a', '#4a2f22', '#7a4b2a', '#c9a15f', '#8f8a88', '#3a2a3f'];
  const LINE = '#2a1b1c';

  // a person's head. o: { skin, hair, hairStyle: none|short|bob|curly|bun|cap, capColor, expr, look, view: 'front'|'back', light }
  K.char.head = function (ctx, x, y, R, o = {}) {
    const skin = o.skin || K.char.SKIN[0], hair = o.hair || K.char.HAIR[0], st = o.hairStyle || 'short', view = o.view || 'front';
    const lw = Math.max(0.6, R * 0.07), line = o.line || LINE, fog = o.fog || null;
    const col = c => (fog ? K.mix(c, fog[0], fog[1]) : c);
    ctx.lineWidth = lw; ctx.strokeStyle = col(line); ctx.lineJoin = 'round';
    // hair behind head (bob, curly)
    if (st === 'bob' || st === 'curly') {
      ctx.fillStyle = col(hair);
      if (st === 'bob') { K.rrect(ctx, x - R * 1.1, y - R * 1.05, R * 2.2, R * 1.9, [R, R, R * 0.35, R * 0.35]); ctx.fill(); if (R > 6) ctx.stroke(); }
      else { for (let i = 0; i < 9; i++) { const a = -Math.PI + i / 8 * Math.PI * 1.0 - 0.0; K.circle(ctx, x + Math.cos(a) * R * 0.95, y + Math.sin(a) * R * 0.85, R * 0.38); ctx.fill(); } }
    }
    // ears (front: both; 3/4: the back one; profile: one, set back) and the profile nose bump
    const sv = { front: 0, q: 0.55, side: 1 }[view] ?? 0, dv = o.dir || 1, faceV = view !== 'back';
    if (faceV && R > 8) { ctx.fillStyle = col(skin); const ears = sv < 0.1 ? [-1, 1] : [-dv];
      for (const sg of ears) { const ex = sv < 0.1 ? x + sg * R * 0.98 : x - dv * R * (0.98 - 0.85 * sv); K.circle(ctx, ex, y + R * 0.08, R * 0.2); ctx.fill(); ctx.stroke(); } }
    if (sv > 0.88 && R > 4) { ctx.fillStyle = col(skin); K.circle(ctx, x + dv * R * 0.97, y + R * 0.06, R * 0.16); ctx.fill(); if (R > 6) ctx.stroke(); }
    // head
    ctx.fillStyle = col(view === 'back' && st !== 'none' ? hair : skin); K.circle(ctx, x, y, R); ctx.fill();
    if (R > 6) ctx.stroke();
    if (sv > 0.88 && R > 4) { ctx.fillStyle = col(skin); K.circle(ctx, x + dv * R * 0.97, y + R * 0.06, R * 0.16); ctx.fill(); }
    if (faceV) {
      // hair on top (3/4 + profile: shifted toward the back of the head)
      ctx.save(); if (sv > 0.05) { ctx.beginPath(); K.circle(ctx, x, y, R * 1.02); ctx.clip(); ctx.translate(-dv * sv * R * 0.42, -sv * R * 0.12); }
      ctx.fillStyle = col(hair);
      if (st === 'short') { ctx.beginPath(); ctx.arc(x, y, R, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(x + R * 0.2, y - R * 0.35, x - R * 0.2, y - R * 0.45); ctx.quadraticCurveTo(x - R * 0.7, y - R * 0.45, x - R, y - R * 0.05); ctx.fill(); }
      else if (st === 'bob') { ctx.beginPath(); ctx.arc(x, y, R, Math.PI * 1.0, Math.PI * 2.0); ctx.quadraticCurveTo(x + R * 0.4, y - R * 0.55, x, y - R * 0.5); ctx.quadraticCurveTo(x - R * 0.5, y - R * 0.5, x - R, y); ctx.fill(); }
      else if (st === 'curly') { for (let i = 0; i < 7; i++) { const a = Math.PI * (1.05 + i * 0.15); K.circle(ctx, x + Math.cos(a) * R * 0.82, y + Math.sin(a) * R * 0.8, R * 0.32); ctx.fill(); } }
      else if (st === 'bun') { ctx.beginPath(); ctx.arc(x, y, R, Math.PI * 1.1, Math.PI * 1.9); ctx.quadraticCurveTo(x, y - R * 0.5, x - R * 0.95, y - R * 0.3); ctx.fill(); K.circle(ctx, x, y - R * 1.05, R * 0.38); ctx.fill(); if (R > 6) ctx.stroke(); }
      else if (st === 'cap') { ctx.fillStyle = col(o.capColor || '#3d6b8c'); ctx.beginPath(); ctx.arc(x, y - R * 0.25, R * 0.98, Math.PI, 0); ctx.closePath(); ctx.fill(); if (R > 6) ctx.stroke(); K.rrect(ctx, x - R * 0.1, y - R * 0.42, R * 1.3, R * 0.2, R * 0.1); ctx.fill(); if (R > 6) ctx.stroke(); }
      ctx.restore();
      if (sv > 0.05 && st !== 'none' && st !== 'cap') { ctx.save(); K.circle(ctx, x, y, R); ctx.clip(); ctx.fillStyle = col(hair); K.circle(ctx, x - dv * R * (1.3 - 0.1 * sv), y - R * 0.2, R * (0.45 + 0.12 * sv)); ctx.fill(); ctx.restore(); K.circle(ctx, x, y, R); if (R > 6) ctx.stroke(); }
      if (R > 3) K.char.face(ctx, x, y + R * 0.08, R * 0.92, o.expr || 'neutral', { look: o.look, blink: o.blink, ink: col(FACE_INK), blush: R > 10 ? 0.25 : 0, view, dir: dv });
    } else if (st === 'bun') { ctx.fillStyle = col(hair); K.circle(ctx, x, y - R * 0.95, R * 0.4); ctx.fill(); }
    if (o.light && R > 2) K.char.discLight(ctx, x, y, R, { ang: o.light.ang, rim: o.light.rim, rimW: 0.12, rimAlpha: 0.8, shade: o.light.shade, shadeAlpha: 0.25 });
  };

  // a small body (torso + arms) for standing / sitting characters, drawn under the head
  K.char.torso = function (ctx, x, y, R, o = {}) {
    const c = o.color || '#5b7f9e', lw = Math.max(0.6, R * 0.07);
    ctx.fillStyle = c; ctx.strokeStyle = o.line || LINE; ctx.lineWidth = lw;
    K.rrect(ctx, x - R * 0.62, y, R * 1.24, R * 1.25, [R * 0.5, R * 0.5, R * 0.15, R * 0.15]); ctx.fill(); ctx.stroke();
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ---- v2 full-body characters + mascot gestures (ART_BIBLE §3).
   K.char.person(ctx, x, y, R, o): (x, y) = point between the feet on the ground, R = head radius. About 2.6 heads tall:
   big round head, a small bell-shaped body, short legs, noodle arms (two segments, round caps) with round hands, all
   with the thin warm-dark ink line. Poses: stand, point, shrug, wave, clipboard, sit, walk, hips, cheer, think.
   o: { pose, t, skin, hair, hairStyle, capColor, shirt, pants, shoes, vest, expr, look, dir (+1 faces right), lean,
        light: { ang, rim, shade }, fog: [colour, k], blink, prop }   Every pose breathes (o.t) so no figure is static.
   K.char.mascotArms(ctx, x, y, R, gesture, t, o): tiny ink stick arms + dot hands for the vermilion dot. */
(function (root) {
  const K = root.K, LINE = '#2a1b1c';
  // arm angles: [upper, fore] radians from straight down; positive swings the arm OUTWARD (away from the body)
  const POSES = {
    stand:     { L: [0.12, 0.10], R: [0.12, 0.10] },
    point:     { L: [0.10, 0.25], R: [1.62, 0.04], hand: { R: 'point' } },
    shrug:     { L: [0.62, 1.85], R: [0.62, 1.85], shoulders: -0.12, hand: { L: 'open', R: 'open' }, headTilt: 0.12 },
    wave:      { L: [0.12, 0.12], R: [2.25, 0.45], waveR: true, hand: { R: 'open' } },
    clipboard: { L: [0.18, -1.55], R: [0.22, -1.25], prop: 'clipboard' },
    sit:       { L: [0.30, -0.9], R: [0.30, -0.9], sit: true },
    walk:      { L: [0.0, 0.2], R: [0.0, 0.2], walk: true },
    hips:      { L: [1.05, -1.8], R: [1.05, -1.8] },
    cheer:     { L: [2.25, 0.35], R: [2.25, 0.35], hand: { L: 'open', R: 'open' } },
    think:     { L: [0.25, -1.3], R: [0.5, -3.1], headTilt: -0.08 },
    // v4 body language for the emotion set
    surprise:  { L: [1.0, 1.75], R: [1.0, 1.75], shoulders: -0.1, hand: { L: 'open', R: 'open' } },
    belly:     { L: [0.3, -1.35], R: [0.3, -1.35], shoulders: -0.06 },
    clasp:     { L: [0.32, -2.15], R: [0.32, -2.15] },
    crossed:   { L: [0.42, -2.45], R: [0.42, -2.45] },
    scratch:   { L: [0.12, 0.10], R: [2.55, 2.25], headTilt: -0.08, shoulders: -0.05, late: true },
    pump:      { L: [0.12, 0.10], R: [0.45, -1.95] },
    fist:      { L: [0.12, 0.10], R: [2.2, 0.7], shake: true, late: true },
    open:      { L: [0.55, 1.2], R: [0.55, 1.2], hand: { L: 'open', R: 'open' } },
    chin:      { L: [0.25, -1.3], R: [0.5, -3.1], headTilt: 0.06 },
  };
  K.char.EMO_POSE = { neutral: 'stand', happy: 'open', laugh: 'belly', surprised: 'surprise', curious: 'chin', awe: 'clasp', smug: 'crossed', thinking: 'think',
    worried: 'clasp', sheepish: 'scratch', annoyed: 'crossed', furious: 'fist', determined: 'pump' };
  K.char.POSES = Object.keys(POSES);

  K.char.person = function (ctx, x, y, R, o = {}) {
    const P = POSES[o.pose || 'stand'] || POSES.stand, t = o.t || 0, ph = (o.seed || 0) * 1.7;
    if (root.__faceLog && ctx.canvas && ctx.canvas.isConnected) {   // QC (Guardian body audit): extras on screen, canvas px
      const m = ctx.getTransform(), tp = (a, b) => [m.a * a + m.c * b + m.e, m.b * a + m.d * b + m.f], p0 = tp(x - R * 1.25, y - R * 3.1), p1 = tp(x + R * 1.25, y + R * 0.1);
      root.__faceLog.push({ id: 'extra', expr: o.expr || 'neutral', view: o.view || 'front', pose: o.pose || 'stand', R: R * Math.hypot(m.a, m.b), alpha: ctx.globalAlpha,
        box: [Math.min(p0[0], p1[0]), Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), Math.max(p0[1], p1[1])] });
    }
    const fog = o.fog, col = c => (fog ? K.mix(c, fog[0], fog[1]) : c);
    const line = col(o.line || LINE), lw = Math.max(0.7, R * 0.075);
    const skin = col(o.skin || K.char.SKIN[0]), shirt = col(o.shirt || '#6b8fb0'), pants = col(o.pants || '#3f4a63'), shoes = col(o.shoes || '#2b2230');
    const breathe = Math.sin(t * 2.1 + ph) * 0.025, lean = (o.lean || 0) + (P.walk ? Math.sin(t * 7 + ph) * 0.03 : 0);
    const sv = { front: 0, q: 0.55, side: 1 }[o.view || 'front'] ?? 0, legH = P.sit ? 0 : R * 0.95, bodyH = R * 1.28 * (1 + breathe), bodyW = R * 1.18 * (1 - 0.22 * sv);
    const bounce = P.walk ? Math.abs(Math.sin(t * 7 + ph)) * R * 0.08 : 0;
    const hipY = y - legH - bounce, topY = hipY - bodyH + (P.shoulders || 0) * R;
    ctx.save(); ctx.translate(x, y); ctx.rotate(lean); ctx.translate(-x, -y);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // legs + shoes
    if (P.sit) {
      for (const s of [-1, 1]) {   // thighs come toward us: short rounded stubs, shoes facing the camera
        ctx.fillStyle = pants; ctx.strokeStyle = line; ctx.lineWidth = lw;
        K.rrect(ctx, x + s * R * 0.42 - R * 0.24, hipY - R * 0.2, R * 0.48, R * 0.62, R * 0.22); ctx.fill(); ctx.stroke();
        ctx.fillStyle = shoes; K.ellipse(ctx, x + s * R * 0.44, hipY + R * 0.5, R * 0.27, R * 0.17); ctx.fill(); ctx.stroke();
      }
    } else {
      for (const s of [-1, 1]) {
        const sw = P.walk ? Math.sin(t * 7 + ph + (s > 0 ? Math.PI : 0)) * R * 0.28 : 0;
        const hx = x + s * R * 0.28, fx = hx + sw + s * R * 0.04, fy = y - (P.walk ? Math.max(0, Math.sin(t * 7 + ph + (s > 0 ? Math.PI : 0))) * R * 0.12 : 0);
        ctx.strokeStyle = line; ctx.lineWidth = R * 0.36 + lw * 2; ctx.beginPath(); ctx.moveTo(hx, hipY - R * 0.1); ctx.lineTo(fx, fy - R * 0.14); ctx.stroke();
        ctx.strokeStyle = pants; ctx.lineWidth = R * 0.36; ctx.beginPath(); ctx.moveTo(hx, hipY - R * 0.1); ctx.lineTo(fx, fy - R * 0.14); ctx.stroke();
        ctx.fillStyle = shoes; ctx.strokeStyle = line; ctx.lineWidth = lw;
        K.ellipse(ctx, fx + s * R * 0.08, fy - R * 0.09, R * 0.27, R * 0.14); ctx.fill(); ctx.stroke();
      }
    }
    // arms (behind/in front: the far-from-prop arm first)
    const sh = { L: [x - bodyW * 0.4, topY + R * 0.28], R: [x + bodyW * 0.4, topY + R * 0.28] };
    const armLen = R * 0.62, foreLen = R * 0.58, armW = R * 0.26;
    const hands = {};
    const arm = (side) => {
      const s = side === 'L' ? -1 : 1; let [a1, a2] = P[side];
      if (P.walk) a1 += Math.sin(t * 7 + ph + (s > 0 ? 0 : Math.PI)) * 0.35;
      if (side === 'R' && P.waveR) a2 += Math.sin(t * 9 + ph) * 0.45;
      if (side === 'R' && P.shake) a1 += Math.sin(t * 22) * 0.08;
      a1 += Math.sin(t * 2.1 + ph + s) * 0.03;
      const [sx0, sy0] = sh[side];
      const ex = sx0 + s * Math.sin(a1) * armLen, ey = sy0 + Math.cos(a1) * armLen;
      const a = a1 + a2, hx = ex + s * Math.sin(a) * foreLen, hy = ey + Math.cos(a) * foreLen;
      const stroke = (c, w) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke(); };
      stroke(line, armW + lw * 2); stroke(shirt, armW);
      hands[side] = [hx, hy, a, s];
    };
    const drawHand = (side) => {
      const [hx, hy, a, s] = hands[side], kind = (P.hand && P.hand[side]) || 'fist';
      ctx.fillStyle = skin; ctx.strokeStyle = line; ctx.lineWidth = lw;
      if (kind === 'point') {        // one finger along the forearm direction
        const fx = hx + s * Math.sin(a) * R * 0.3, fy = hy + Math.cos(a) * R * 0.3;
        ctx.lineWidth = R * 0.11 + lw * 2; ctx.strokeStyle = line; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(fx, fy); ctx.stroke();
        ctx.lineWidth = R * 0.11; ctx.strokeStyle = skin; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(fx, fy); ctx.stroke();
        ctx.lineWidth = lw; ctx.strokeStyle = line;
      }
      if (kind === 'open') { K.ellipse(ctx, hx, hy, R * 0.19, R * 0.16, a); ctx.fill(); ctx.stroke(); }
      else { K.circle(ctx, hx, hy, R * 0.16); ctx.fill(); ctx.stroke(); }
    };
    // body (bell): narrow shoulders, round belly
    const bodyPath = () => {
      ctx.beginPath();
      ctx.moveTo(x - bodyW * 0.36, topY + R * 0.08);
      ctx.quadraticCurveTo(x, topY - R * 0.12, x + bodyW * 0.36, topY + R * 0.08);
      ctx.bezierCurveTo(x + bodyW * 0.58, topY + bodyH * 0.45, x + bodyW * 0.56, hipY, x + bodyW * 0.42, hipY);
      ctx.lineTo(x - bodyW * 0.42, hipY);
      ctx.bezierCurveTo(x - bodyW * 0.56, hipY, x - bodyW * 0.58, topY + bodyH * 0.45, x - bodyW * 0.36, topY + R * 0.08);
      ctx.closePath();
    };
    bodyPath(); ctx.fillStyle = shirt; ctx.fill();
    if (R > 10) { bodyPath(); K.tex.fillPath(ctx, 0.22, Math.max(0.5, R / 60)); }
    ctx.save(); bodyPath(); ctx.clip();
    if (o.vest) {                     // safety vest: two panels + a reflective band
      ctx.fillStyle = col(o.vest); ctx.fillRect(x - bodyW, topY - R, bodyW * 0.72, bodyH + R * 2); ctx.fillRect(x + bodyW * 0.28, topY - R, bodyW, bodyH + R * 2);
      ctx.fillStyle = col('#f4f1e6'); ctx.fillRect(x - bodyW, hipY - bodyH * 0.38, bodyW * 2, R * 0.12);
    }
    if (o.light) {                    // flat shade on the side away from the light + a rim on the lit edge
      const la = o.light.ang ?? -2.2, dx = Math.cos(la), dy = Math.sin(la);
      ctx.fillStyle = K.rgba(o.light.shade || '#3c2a52', 0.28); ctx.translate(-dx * R * 0.3, -dy * R * 0.25); bodyPath(); ctx.translate(dx * R * 0.3, dy * R * 0.25);
      ctx.rect(x - R * 4, topY - R * 4, R * 8, R * 8); ctx.fill('evenodd');
      if (o.light.rim) { ctx.strokeStyle = K.rgba(o.light.rim, 0.5); ctx.lineWidth = R * 0.08; ctx.translate(-dx * R * 0.06, -dy * R * 0.06); bodyPath(); ctx.stroke(); }
    }
    ctx.restore();
    bodyPath(); ctx.strokeStyle = line; ctx.lineWidth = lw; ctx.stroke();
    arm('L'); arm('R');
    // props in front of the body
    if (P.prop === 'clipboard' || o.prop === 'clipboard') {
      const bx = x - R * 0.05, by = topY + bodyH * 0.42;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.12);
      ctx.fillStyle = col('#b88a5a'); ctx.strokeStyle = line; ctx.lineWidth = lw; K.rrect(ctx, -R * 0.42, -R * 0.52, R * 0.84, R * 1.04, R * 0.07); ctx.fill(); ctx.stroke();
      ctx.fillStyle = col('#f6f1e4'); K.rrect(ctx, -R * 0.34, -R * 0.4, R * 0.68, R * 0.86, R * 0.04); ctx.fill();
      ctx.fillStyle = col('#8f8a88'); K.rrect(ctx, -R * 0.16, -R * 0.6, R * 0.32, R * 0.14, R * 0.05); ctx.fill();
      ctx.strokeStyle = col('#9aa2b4'); ctx.lineWidth = Math.max(0.6, R * 0.04);
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-R * 0.24, -R * 0.24 + k * R * 0.17); ctx.lineTo(R * (0.24 - (k % 2) * 0.12), -R * 0.24 + k * R * 0.17); ctx.stroke(); }
      ctx.restore();
      // the writing hand's pencil wiggles
      const [hx, hy] = hands.R; ctx.strokeStyle = col('#e2b04a'); ctx.lineWidth = R * 0.07;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - R * 0.22 + Math.sin(t * 11) * R * 0.03, hy - R * 0.2); ctx.stroke();
    }
    drawHand('L'); drawHand('R');
    // head (with a little bob + tilt); face looks toward dir by default
    const EX = K.char.EXPR[o.expr] || {}, look = o.look || EX.look || [0.35 * (o.dir || 0), 0.05];
    const hx = x + (P.headTilt || 0) * R * 0.6, hy = topY - R * 0.82 + Math.sin(t * 2.1 + ph + 0.6) * R * 0.03;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate((P.headTilt || 0) + (o.headTilt || 0) + (EX.tilt || 0) * (o.dir || 1)); ctx.translate(-hx, -hy);
    K.char.head(ctx, hx, hy, R, { skin: o.skin, hair: o.hair, hairStyle: o.hairStyle, capColor: o.capColor, expr: o.expr || 'content', look, blink: o.blink, fog, light: o.light, view: o.view, dir: o.dir || 1 });
    ctx.restore();
    if (P.late) { arm('R'); drawHand('R'); }   // a hand raised over / beside the head stays in front of it
    ctx.restore();
    return { head: [hx, hy], hands };
  };

  // ink stick arms for the mascot. gesture: shrug | point | wave | fist | hips | cheer | grip | rest ; dir = ±1 for point
  const MG = {
    rest:  { L: [0.35, 0.2], R: [0.35, 0.2] },
    shrug: { L: [0.9, 1.6], R: [0.9, 1.6], open: true },
    point: { L: [0.3, 0.2], R: [1.55, 0.05] },
    wave:  { L: [0.35, 0.2], R: [2.4, 0.3], wave: true, open: true },
    fist:  { L: [0.35, 0.2], R: [1.9, 1.1], shake: true },
    hips:  { L: [0.95, -2.3], R: [0.95, -2.3] },
    cheer: { L: [2.5, 0.25], R: [2.5, 0.25], open: true },
  };
  K.char.mascotArms = function (ctx, x, y, R, g = 'rest', t = 0, o = {}) {
    const G = MG[g] || MG.rest, ink = o.ink || K.INK, dir = o.dir || 1, w = Math.max(1, R * 0.08);
    ctx.save(); ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = w;
    for (const side of ['L', 'R']) {
      const s0 = side === 'L' ? -1 : 1, s = g === 'point' ? s0 * dir : s0;
      let [a1, a2] = G[side === 'L' ? (g === 'point' && dir < 0 ? 'R' : 'L') : (g === 'point' && dir < 0 ? 'L' : 'R')];
      if (G.wave && ((side === 'R') === (dir > 0))) a2 += Math.sin(t * 10) * 0.5;
      if (G.shake && side === 'R') a1 += Math.sin(t * 22) * 0.15;
      a1 += Math.sin(t * 2.3 + s) * 0.04;
      const sx0 = x + s * R * 0.93, sy0 = y + R * 0.3, L1 = R * 0.42, L2 = R * 0.38;
      const ex = sx0 + s * Math.sin(a1) * L1, ey = sy0 + Math.cos(a1) * L1, hx = ex + s * Math.sin(a1 + a2) * L2, hy = ey + Math.cos(a1 + a2) * L2;
      ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.quadraticCurveTo(ex, ey, hx, hy); ctx.stroke();
      if (G.open) K.ellipse(ctx, hx, hy, R * 0.13, R * 0.1, a1 + a2); else K.circle(ctx, hx, hy, R * 0.115);
      ctx.fill();
    }
    ctx.restore();
  };
  // tiny ink stick legs for a standing / sitting mascot (feet as flat rounded dots)
  K.char.mascotLegs = function (ctx, x, y, R, o = {}) {
    const ink = o.ink || K.INK, t = o.t || 0; ctx.save(); ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1, R * 0.09);
    for (const s of [-1, 1]) {
      const kx = x + s * R * 0.35, ky = y + R * 0.92;
      if (o.sit) { ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx + s * R * 0.12, ky + R * 0.32); ctx.stroke(); K.ellipse(ctx, kx + s * R * 0.16, ky + R * 0.36, R * 0.16, R * 0.08); ctx.fill(); }
      else { const sw = o.walk ? Math.sin(t * 9 + (s > 0 ? Math.PI : 0)) * R * 0.15 : 0;
        ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx + sw, ky + R * 0.42); ctx.stroke(); K.ellipse(ctx, kx + sw + s * R * 0.07, ky + R * 0.44, R * 0.17, R * 0.08); ctx.fill(); }
    }
    ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
