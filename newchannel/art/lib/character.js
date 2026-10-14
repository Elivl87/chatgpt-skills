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
    }
  }
  // brows: (outer dy, inner dy) in R units; negative = up
  const BROWS = { worried: [0.07, -0.06], angry: [-0.06, 0.08], up: [-0.05, -0.05], flat: [0.02, 0.02] };
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
    surprised: { eyes: 'dot', mouth: 'o', eyeScale: [1.15, 1.15], lift: -0.03 },
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
  };
  K.char.EXPRESSIONS = Object.keys(EXPR);

  // face only, centred on a head of radius R at (x, y)
  K.char.face = function (ctx, x, y, R, expr = 'neutral', o = {}) {
    const e = EXPR[expr] || EXPR.neutral, ink = o.ink || FACE_INK;
    const lx = (o.look ? o.look[0] : 0) * 0.12 * R, ly = (o.look ? o.look[1] : 0) * 0.12 * R;
    const fx = x + lx, fy = y + ly + (e.lift || 0) * R;
    const er = R * 0.135, blink = o.blink || 0;
    const kinds = Array.isArray(e.eyes) ? e.eyes : [e.eyes, e.eyes];
    for (let s = 0; s < 2; s++) {
      const ex = fx + (s ? 1 : -1) * R * 0.32, ey = fy - R * 0.14;
      const sc = e.eyeScale ? e.eyeScale[s] : 1;
      if (blink > 0.5 && (kinds[s] === 'dot' || kinds[s] === 'big')) eye(ctx, ex, ey, er, 'line', ink);
      else eye(ctx, ex, ey, er * sc, kinds[s], ink, s ? 1 : -1);
    }
    brows(ctx, fx, fy, R, e.brows, ink);
    mouth(ctx, fx, fy + R * 0.30, R, o.mouth || e.mouth, ink);
    if (o.blush) { ctx.fillStyle = K.rgba('#ff7a6a', o.blush); K.ellipse(ctx, fx - R * 0.5, fy + R * 0.14, R * 0.13, R * 0.07); ctx.fill(); K.ellipse(ctx, fx + R * 0.5, fy + R * 0.14, R * 0.13, R * 0.07); ctx.fill(); }
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
    // ears
    if (view === 'front' && R > 8) { ctx.fillStyle = col(skin); for (const s of [-1, 1]) { K.circle(ctx, x + s * R * 0.98, y + R * 0.08, R * 0.2); ctx.fill(); ctx.stroke(); } }
    // head
    ctx.fillStyle = col(view === 'back' && st !== 'none' ? hair : skin); K.circle(ctx, x, y, R); ctx.fill();
    if (R > 6) ctx.stroke();
    if (view === 'front') {
      // hair on top
      ctx.fillStyle = col(hair);
      if (st === 'short') { ctx.beginPath(); ctx.arc(x, y, R, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(x + R * 0.2, y - R * 0.35, x - R * 0.2, y - R * 0.45); ctx.quadraticCurveTo(x - R * 0.7, y - R * 0.45, x - R, y - R * 0.05); ctx.fill(); }
      else if (st === 'bob') { ctx.beginPath(); ctx.arc(x, y, R, Math.PI * 1.0, Math.PI * 2.0); ctx.quadraticCurveTo(x + R * 0.4, y - R * 0.55, x, y - R * 0.5); ctx.quadraticCurveTo(x - R * 0.5, y - R * 0.5, x - R, y); ctx.fill(); }
      else if (st === 'curly') { for (let i = 0; i < 7; i++) { const a = Math.PI * (1.05 + i * 0.15); K.circle(ctx, x + Math.cos(a) * R * 0.82, y + Math.sin(a) * R * 0.8, R * 0.32); ctx.fill(); } }
      else if (st === 'bun') { ctx.beginPath(); ctx.arc(x, y, R, Math.PI * 1.1, Math.PI * 1.9); ctx.quadraticCurveTo(x, y - R * 0.5, x - R * 0.95, y - R * 0.3); ctx.fill(); K.circle(ctx, x, y - R * 1.05, R * 0.38); ctx.fill(); if (R > 6) ctx.stroke(); }
      else if (st === 'cap') { ctx.fillStyle = col(o.capColor || '#3d6b8c'); ctx.beginPath(); ctx.arc(x, y - R * 0.25, R * 0.98, Math.PI, 0); ctx.closePath(); ctx.fill(); if (R > 6) ctx.stroke(); K.rrect(ctx, x - R * 0.1, y - R * 0.42, R * 1.3, R * 0.2, R * 0.1); ctx.fill(); if (R > 6) ctx.stroke(); }
      if (R > 3) K.char.face(ctx, x, y + R * 0.08, R * 0.92, o.expr || 'neutral', { look: o.look, blink: o.blink, ink: col(FACE_INK), blush: R > 10 ? 0.25 : 0 });
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
