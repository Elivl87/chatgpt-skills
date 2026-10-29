/* Diez Mil Puntos art kit · FLAT render mode (A/B style test, 2026-10-18). An OPTION next to the cinematic kit, never a
   replacement: nothing in here runs unless a scene calls K.flat.* (or a block sets K.flat.on), so every existing render
   stays pixel-identical. The look (after the competitor sheet in the style test): flat fills, ONE uniform thick ink
   outline, no light / rim / shade / grain / haze / parallax / camera breathing, backgrounds reduced to simple shapes
   (sky, sun, two hill bands, grass, road, poles) in 2-3 flat tones, cutout characters (same Eli + Mila designs and
   colours, simplified: capsule heads, white oval eyes with a big dark pupil + thick brows, simple mouths; only the
   face and the arms change), a caption bar at the top, flat text boxes and thought bubbles with icons.
     K.flat.bg(ctx, t, { scroll, horizon, ground, roadH, poleH, poleGap, sunX, sunY, sunR })
     K.flat.car(ctx, x, y, L, { color, brake, persona, crew(cx, seatY, u) })        side view, facing LEFT, open top
     K.flat.cast(ctx, 'eli1' | 'mila1', x, y, u, { view, dir, pose, blend, expr, exprBlend, look, blink, seated, rise, t, extras })
       -> { head: [x, y, r], hands: { lead, trail }, top }     (same contract as K.cast.draw; logs to __faceLog for the audits)
     K.flat.caption(ctx, text, a, { pill })      K.flat.box(ctx, { text, kind, head, age, a, side })
     K.flat.thought(ctx, head, { x, y, w, h, a, icons: [{ kind, a, cross }] })      K.flat.bird / callout / icon / pole
   Deterministic: time only from t. Design units (1920x1080); the stage scales the frame. */
(function (root) {
  const K = root.K;
  const F = K.flat = {};
  F.INK = '#1f171b';
  F.LW = 6;                       // the one ink width (design px at 1080p; ~2.7 px at 480p)
  F.PAL = { sky: '#f4c48e', sun: '#fff0bd', hillFar: '#d99c7e', hillNear: '#b97a6e', grass: '#c4b05e', verge: '#aa9a4e', road: '#5b5261', line: '#f3e7c6',
    pole: '#3c2c31', paper: '#f7eedc', teal: '#2f8a80', glass: '#cfe6ea', lampOff: '#7a3b3e', lampOn: '#ff4a36', wheel: '#2a2326', hub: '#8c8488' };
  F.on = false;                   // ?style=flat (or a flat block) turns the mode on; informational for scenes
  { const q = typeof location !== 'undefined' && location.search ? new URLSearchParams(location.search) : null; if (q && q.get('style') === 'flat') F.on = true; }

  // ------------------------------------------------------------------ helpers
  const ink = (c, lw) => { c.strokeStyle = F.INK; c.lineWidth = lw || F.LW; c.lineJoin = 'round'; c.lineCap = 'round'; };
  const shape = (c, fill, lw) => { c.fillStyle = fill; c.fill(); ink(c, lw); c.stroke(); };   // path already built: flat fill + ink
  F.shape = shape; F.ink = ink;
  const rr = (c, x, y, w, h, r, fill, lw) => { K.rrect(c, x, y, w, h, r); shape(c, fill, lw); };
  const line = (c, x0, y0, x1, y1, lw) => { ink(c, lw); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
  // union of circles with ONE outline: ink-stroke every disc first, then fill every disc (the fills hide the inner arcs)
  const blobs = (c, discs, fill, lw) => { ink(c, lw); for (const [x, y, r] of discs) { K.circle(c, x, y, r); c.stroke(); } c.fillStyle = fill; for (const [x, y, r] of discs) { K.circle(c, x, y, r); c.fill(); } };
  F.blobs = blobs;
  const mod = (a, n) => ((a % n) + n) % n;

  // ------------------------------------------------------------------ background: a side view of the road
  F.bg = function (c, t, o = {}) {
    const P = F.PAL, hz = o.horizon ?? 560, gy = o.ground ?? 800, rh = o.roadH ?? 150, sc = o.scroll || 0;
    c.fillStyle = P.sky; c.fillRect(0, 0, K.W, K.H);
    K.circle(c, o.sunX ?? 1500, o.sunY ?? 300, o.sunR ?? 110); shape(c, P.sun);
    const hills = (y, amp, per, fill, ph) => { c.beginPath(); c.moveTo(-60, K.H + 60); c.lineTo(-60, y);
      for (let x = -60; x <= K.W + 60; x += 12) c.lineTo(x, y - amp * (0.5 + 0.5 * Math.sin(x / per + ph)) - amp * 0.3 * Math.sin(x / (per * 0.37) + ph * 2));
      c.lineTo(K.W + 60, K.H + 60); c.closePath(); shape(c, fill); };
    hills(hz - 50, 130, 230, P.hillFar, 1.3); hills(hz + 4, 70, 150, P.hillNear, 4.1);
    c.fillStyle = P.grass; c.fillRect(0, hz, K.W, K.H - hz); line(c, 0, hz, K.W, hz);
    // poles (one plane with the ground: they slide with it, no parallax)
    const pg = o.poleGap ?? 520, ph = o.poleH ?? 330, pw = o.poleW ?? 22;
    if (o.poles !== false) for (let i = -1; i < K.W / pg + 2; i++) { const x = mod(i * pg - sc * (o.poleK ?? 1), K.W + pg * 2) - pg; F.pole(c, x, hz + 8, ph, pw); }
    // road: band + edges + dashed centre line sliding with the ground
    c.fillStyle = P.road; c.fillRect(0, gy - rh, K.W, rh + rh * 0.32); line(c, 0, gy - rh, K.W, gy - rh); line(c, 0, gy + rh * 0.32, K.W, gy + rh * 0.32);
    c.fillStyle = P.verge; c.fillRect(0, gy + rh * 0.32 + 3, K.W, rh * 0.18);
    const dl = rh * 0.7, dg = rh * 0.5, y = gy - rh * 0.5; c.fillStyle = P.line;
    for (let x = -mod(sc, dl + dg) - dl; x < K.W + dl; x += dl + dg) c.fillRect(x, y - 5, dl, 10);
  };
  F.pole = function (c, x, yBase, h, w = 22) {
    const P = F.PAL; rr(c, x - w / 2, yBase - h, w, h, 4, P.pole); rr(c, x - w * 2.6, yBase - h + w * 0.9, w * 5.2, w * 0.7, 3, P.pole);
    return [x, yBase - h + w * 0.9];   // where a bird sits (the crossbar top)
  };

  // ------------------------------------------------------------------ cars (side, facing LEFT: the front is at -x)
  const SKINS = ['#e8b98a', '#c98f62', '#a86b44', '#8a5234', '#f0c9a0', '#b57a52'], HAIRS = ['#2e1d22', '#5a3a28', '#c9a14a', '#1c1418', '#7a4d32', '#3a2a40'];
  F.car = function (c, x, y, L, o = {}) {
    const P = F.PAL, H = L * 0.30, wr = L * 0.105, col = o.color || P.teal, y0 = y - wr * 0.55;   // y0: body bottom
    const x0 = x - L / 2, top = y0 - H;
    // crew first (open top): the body covers their laps
    const seatY = top + H * 0.42, u = o.u || L * 0.6;
    if (o.crew) o.crew(c, x, seatY, u);
    else if (!o.noDriver) { const k = o.persona ?? 0, hr = L * 0.075, hx = x - L * 0.12, hy = top - hr * 0.35;
      K.circle(c, hx, hy, hr); shape(c, SKINS[k % SKINS.length]);
      c.beginPath(); c.arc(hx, hy, hr, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(hx + hr * 0.9, hy - hr * 0.3); c.closePath(); shape(c, HAIRS[k % HAIRS.length]);
      if (o.extraFace) o.extraFace(c, hx, hy, hr); else { c.fillStyle = F.INK; K.circle(c, hx - hr * 0.42, hy + hr * 0.02, hr * 0.12); c.fill(); K.circle(c, hx + hr * 0.02, hy + hr * 0.02, hr * 0.12); c.fill(); } }
    // body: a bathtub with a sloped hood at the front
    c.beginPath(); c.moveTo(x0 + L * 0.02, y0); c.lineTo(x0, y0 - H * 0.45); c.quadraticCurveTo(x0 + L * 0.02, y0 - H * 0.72, x0 + L * 0.16, y0 - H * 0.74);
    c.lineTo(x0 + L * 0.36, y0 - H * 0.76); c.lineTo(x0 + L * 0.44, top); c.lineTo(x0 + L * 0.95, top); c.quadraticCurveTo(x0 + L, top, x0 + L, top + H * 0.2); c.lineTo(x0 + L, y0); c.closePath(); shape(c, col);
    // windshield (flat glass), door line, lamps
    c.beginPath(); c.moveTo(x0 + L * 0.37, y0 - H * 0.76); c.lineTo(x0 + L * 0.30, top - H * 0.42); c.lineTo(x0 + L * 0.40, top - H * 0.42); c.lineTo(x0 + L * 0.46, y0 - H * 0.76); c.closePath(); shape(c, P.glass);
    line(c, x0 + L * 0.5, top + H * 0.18, x0 + L * 0.5, y0 - H * 0.12);
    rr(c, x0 + L * 0.96 - L * 0.035, y0 - H * 0.62, L * 0.07, H * 0.26, 4, (o.brake || 0) > 0.06 ? P.lampOn : P.lampOff);     // tail lamp (rear = +x)
    rr(c, x0 - L * 0.005, y0 - H * 0.62, L * 0.05, H * 0.22, 4, '#fff3c4');                                                   // headlamp
    for (const wx of [x0 + L * 0.22, x0 + L * 0.8]) { K.circle(c, wx, y, wr); shape(c, P.wheel); K.circle(c, wx, y, wr * 0.42); shape(c, P.hub); }
    return { seatY, top, x0, L, H };
  };

  // ------------------------------------------------------------------ Eli + Mila, flat cutouts (units; ground = 0, y up = negative)
  const SP = {
    eli1: { hw: 0.082, hh: 0.138, headC: 0.782, sh: 0.649, hip: 0.37, tw: 0.107, arm: 0.30, hand: 0.03, lw: 0.012,
      skin: '#d9a66c', tee: '#f1ede2', apron: '#a4713d', apronDark: '#7d532a', jeans: '#3f5f96', boots: '#2b2729', hat: '#f2c230', rib: '#cf9d1f', brow: '#1a100e', mouth: '#3a1a22' },
    mila1: { hw: 0.063, hh: 0.152, headC: 0.918, sh: 0.771, hip: 0.46, tw: 0.087, arm: 0.33, hand: 0.028, lw: 0.012,
      skin: '#d9a66c', top: '#7158b8', cuff: '#5a4596', bib: '#c99633', bibDark: '#a87a24', boots: '#2f6b45', hair: '#2e1d22', tie: '#c99633', ear: '#f0c24a', button: '#e7c25a', brow: '#1a100e', mouth: '#8e3346' },
  };
  F.SPECS = SP;
  // hand targets per pose, in arm lengths from the shoulder: [out (away from the body), up]; lead = the arm on the dir side
  const POSES = {
    stand: { lead: [0.35, -0.95], trail: [0.35, -0.95] }, lap: { lead: [0.5, -0.75], trail: [0.5, -0.75] }, drive: { lead: [1.0, -0.15], trail: [0.9, -0.1] },
    fist: { lead: [0.55, 0.95], trail: [0.5, -0.85], hand: 'fist' }, point: { lead: [1.3, 0.2], trail: [0.45, -0.85], hand: 'point' },
    visor: { lead: [0.15, 0.9], trail: [0.45, -0.85], hand: 'flat', toHead: true }, crossed: { lead: [-0.45, -0.3], trail: [-0.45, -0.3] },
    clasp: { lead: [-0.15, -0.2], trail: [-0.15, -0.2] }, surprise: { lead: [0.9, 0.55], trail: [0.9, 0.55], hand: 'palm' }, open: { lead: [1.0, -0.2], trail: [1.0, -0.2], hand: 'palm' },
    shrug: { lead: [1.0, -0.1], trail: [1.0, -0.1], hand: 'palm' }, scratch: { lead: [0.3, 1.0], trail: [0.45, -0.85] }, think: { lead: [0.1, 0.55], trail: [-0.3, -0.3] }, chin: { lead: [0.1, 0.55], trail: [-0.3, -0.3] },
    pointSelf: { lead: [0.1, 0.1], trail: [0.45, -0.85], hand: 'point' }, cheer: { lead: [0.8, 1.0], trail: [0.8, 1.0] }, walk: { lead: [0.4, -0.9], trail: [0.4, -0.9] }, sit: { lead: [0.5, -0.7], trail: [0.5, -0.7] },
    detective: { lead: [0.2, 0.9], trail: [0.45, -0.85], hand: 'fist' }, driveFist: { lead: [0.6, 0.9], trail: [0.9, -0.1], hand: 'fist' }, lapPoint: { lead: [1.3, 0.2], trail: [0.5, -0.75], hand: 'point' },
  };
  // expressions: by = brow raise (fraction of the head height), bt = brow tilt (+ inner ends down = angry), lid / low = upper / lower lid cover, mouth
  const EX = {
    neutral: { by: 0, bt: 0, lid: 0.06, mouth: 'smile_s' }, happy: { by: 0.12, bt: -0.1, lid: 0, low: 0.18, mouth: 'grin' },
    laugh: { by: 0.15, bt: -0.1, closed: 1, mouth: 'grin' }, surprised: { by: 0.4, bt: -0.12, lid: 0, eyeK: 1.22, mouth: 'o', cue: 'ticks' },
    curious: { by: 0.18, bt: -0.08, one: 0.22, lid: 0.04, mouth: 'o_s' }, awe: { by: 0.42, bt: -0.2, eyeK: 1.15, pupilK: 1.15, mouth: 'o_tall', gazeY: -0.35, cue: 'sparkle' },
    worried: { by: 0.22, bt: -0.6, lid: 0.12, mouth: 'wobble', cue: 'sweat' }, sheepish: { by: 0.18, bt: -0.45, lid: 0.1, mouth: 'wavy', cue: 'sweat' },
    annoyed: { by: -0.1, bt: 0.22, lid: 0.42, mouth: 'flat' }, grumpy: { by: -0.2, bt: 0.55, lid: 0.3, mouth: 'frown', cue: 'anger' },
    furious: { by: -0.3, bt: 0.75, lid: 0.12, mouth: 'shout', cue: 'anger' }, determined: { by: -0.15, bt: 0.5, lid: 0.28, mouth: 'flat' },
    smug: { by: 0.05, bt: 0.1, one: 0.2, lid: 0.35, low: 0.25, gazeX: 0.5, mouth: 'smirk' }, thinking: { by: 0.1, bt: 0, one: 0.25, lid: 0.15, gazeX: -0.5, gazeY: -0.5, mouth: 'aside' },
    talk: { by: 0.05, bt: 0, lid: 0.06, mouth: 'o_s' },
  };
  EX.sly = EX.smug;
  const NUM = ['by', 'bt', 'lid', 'low', 'eyeK', 'pupilK', 'one', 'gazeX', 'gazeY'];
  function exprMix(a, b) {
    const A0 = EX[a] || EX.neutral; if (!b || !b.k || b.k <= 0) return A0;
    const B0 = EX[b.expr] || EX.neutral, k = K.clamp(b.k), o = Object.assign({}, k < 0.5 ? A0 : B0);
    for (const f of NUM) o[f] = K.lerp(A0[f] || 0, B0[f] || 0, k);
    return o;
  }
  F.exprName = (a, b) => (b && b.k >= 0.5 ? b.expr : a) || 'neutral';
  const TURN = { front: 0, q: 1, side: 1.6, back: 0, backq: 0 };

  F.cast = function (ctx, id, x, y, u, o = {}) {
    if (id === 'eli') id = 'eli1';
    const S = SP[id]; if (!S) throw new Error('flat: unknown ' + id);
    const dir = o.dir || 1, view = o.view || 'front', back = String(view).startsWith('back') || o.backView, fs = typeof view === 'number' ? view * 1.6 : (TURN[view] ?? 0);
    const E = exprMix(o.expr, o.exprBlend), lw = S.lw, seated = !!o.seated;
    const hw = S.hw, hh = S.hh, tw = S.tw;
    const so = seated ? S.hip : 0;                                   // seated: y is the seat (hip) line, no legs
    const rise = seated ? -(o.rise || 0) * 0.28 : 0;                 // standing up in the car (Eli's yell): the body slides up
    const yH = -S.headC + so + rise, ySh = -S.sh + so + rise, yHip = -S.hip + so + rise;
    const LOG = root.__faceLog && ctx.canvas && ctx.canvas.isConnected ? root.__faceLog : null;
    // draw into a canvas-sized buffer (same transform) so the audits can measure the character's own pixels
    const CW = ctx.canvas.width, CH = ctx.canvas.height;
    const B = F._buf && F._buf.c.width === CW && F._buf.c.height === CH ? F._buf : (F._buf = K.canvas(CW, CH));
    const c = B.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, CW, CH); c.setTransform(ctx.getTransform());
    c.translate(x, y); c.scale(u, u); c.lineJoin = 'round'; c.lineCap = 'round';
    const I = (w = 1) => { c.strokeStyle = F.INK; c.lineWidth = lw * w; };
    const sh = (fill, w = 1) => { c.fillStyle = fill; c.fill(); I(w); c.stroke(); };
    const t = o.t || 0, bob = seated ? 0 : 0.006 * Math.sin(t * 2.1), lean = (o.lean || 0);
    c.translate(0, bob);
    // ---------------- legs (standing only)
    const fx = dir * (fs > 1.2 ? 0.0 : 1);
    if (!seated) {
      const lgW = tw * 0.42, legCol = id === 'eli1' ? S.jeans : S.bib;
      for (const sgn of [-1, 1]) { K.rrect(c, sgn * tw * 0.24 - lgW / 2, yHip - 0.02, lgW, S.hip - 0.03, 0.01); sh(legCol); }
      for (const sgn of [-1, 1]) { K.rrect(c, sgn * tw * 0.25 - lgW * 0.62, -0.06, lgW * 1.24, 0.06, [0.012, 0.012, 0.006, 0.006]); sh(S.boots); }
    }
    // ---------------- arms (behind the torso when crossed / clasped; the hand targets blend between poses)
    const P0 = POSES[o.pose] || POSES.stand, P1 = o.blend ? (POSES[o.blend.pose] || POSES.stand) : null, bk = o.blend ? K.clamp(o.blend.k) : 0;
    const armL = S.arm, shY = ySh + 0.025, hands = {}, handKind = (bk < 0.5 ? P0 : (P1 || P0)).hand || 'relax';
    const target = (which) => { const a = P0[which], b = P1 ? P1[which] : a; const out = K.lerp(a[0], b[0], bk), up = K.lerp(a[1], b[1], bk);
      const sideK = which === 'lead' ? dir : -dir, sx = sideK * tw / 2;
      return { sx, sy: shY, hx: sx + sideK * out * armL * (back ? 0.8 : 1), hy: shY - up * armL }; };
    const behind = (P0.lead[0] < 0 && bk < 0.5) || (P1 && P1.lead[0] < 0 && bk >= 0.5) || back;
    const drawArm = (which) => {
      const T = target(which), L = Math.hypot(T.hx - T.sx, T.hy - T.sy), reach = Math.min(L, armL * 0.98);
      const ux = (T.hx - T.sx) / (L || 1), uy = (T.hy - T.sy) / (L || 1), hx = T.sx + ux * reach, hy = T.sy + uy * reach;
      const bend = Math.sqrt(Math.max(0, (armL / 2) ** 2 - (reach / 2) ** 2)), ex = (T.sx + hx) / 2 + uy * bend * (which === 'lead' ? dir : -dir) * (T.hy < shY - armL * 0.3 ? -1 : 1), ey = (T.sy + hy) / 2 - ux * bend * (which === 'lead' ? dir : -dir) * (T.hy < shY - armL * 0.3 ? -1 : 1);
      const aw = tw * 0.3, sleeveCol = id === 'eli1' ? S.tee : S.top, skinCol = S.skin;
      const seg = (x0, y0, x1, y1, col, w) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = F.INK; c.lineWidth = w + lw * 2; c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke(); };
      if (id === 'eli1') { seg(T.sx, T.sy, ex, ey, skinCol, aw); seg(ex, ey, hx, hy, skinCol, aw); seg(T.sx, T.sy, K.lerp(T.sx, ex, 0.45), K.lerp(T.sy, ey, 0.45), sleeveCol, aw * 1.25); }
      else { seg(T.sx, T.sy, ex, ey, sleeveCol, aw); seg(ex, ey, hx, hy, sleeveCol, aw); seg(K.lerp(ex, hx, 0.7), K.lerp(ey, hy, 0.7), hx, hy, S.cuff, aw * 1.1); }
      // hand: a mitten disc (fist: smaller; point: a finger)
      const hr = S.hand * (handKind === 'fist' ? 1.05 : 1.15);
      K.circle(c, hx, hy, hr); sh(skinCol);
      if (handKind === 'point') { c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + ux * hr * 2.1, hy + uy * hr * 2.1); c.strokeStyle = F.INK; c.lineWidth = hr * 0.9 + lw * 2; c.stroke(); c.strokeStyle = skinCol; c.lineWidth = hr * 0.9; c.stroke(); }
      if (handKind === 'fist') { c.beginPath(); c.moveTo(hx - hr * 0.5, hy + hr * 0.15); c.lineTo(hx + hr * 0.5, hy + hr * 0.15); I(0.8); c.stroke(); }
      hands[which] = [hx, hy];
    };
    const sideArm = fs > 1.2;      // profile: one arm
    if (behind) { drawArm('trail'); if (!sideArm) drawArm('lead'); }
    // ---------------- torso
    const tw2 = tw * (fs > 1.2 ? 0.78 : 1), bodyH = ySh - yHip;
    c.save(); c.translate(0, yHip); c.rotate(-lean * 0.5); c.translate(0, -yHip);
    K.rrect(c, -tw2 / 2, ySh, tw2, -bodyH + (seated ? 0.06 : 0.0), [0.03, 0.03, 0.012, 0.012]);
    sh(id === 'eli1' ? S.tee : S.top);
    if (id === 'eli1' && !back) {          // apron bib + skirt, straps, pocket
      const ax = tw2 * 0.31; K.rrect(c, -ax, ySh + 0.055, ax * 2, -bodyH + 0.06 + (seated ? 0.05 : 0.0), [0.008, 0.008, 0.008, 0.008]); sh(S.apron);
      for (const sgn of [-1, 1]) { c.beginPath(); c.moveTo(sgn * ax * 0.7, ySh + 0.058); c.lineTo(sgn * ax * 0.45, ySh + 0.005); I(1.1); c.stroke(); c.strokeStyle = S.apronDark; c.lineWidth = lw * 0.6; c.stroke(); }
      K.rrect(c, -ax * 0.55, yHip - 0.085, ax * 1.1, 0.06, 0.005); sh(S.apronDark, 0.8);
    } else if (id === 'eli1') { c.beginPath(); c.moveTo(-tw2 * 0.36, ySh + 0.01); c.lineTo(tw2 * 0.36, ySh + 0.01); I(1); c.stroke(); }   // the neck loop at the back
    if (id === 'mila1') {                  // overalls bib + straps + brass buttons
      const bx = tw2 * 0.32; K.rrect(c, -bx, ySh + 0.07, bx * 2, -bodyH + 0.07 + (seated ? 0.05 : 0.0), [0.008, 0.008, 0.006, 0.006]); sh(S.bib);
      for (const sgn of [-1, 1]) { c.beginPath(); c.moveTo(sgn * bx * 0.75, ySh + 0.072); c.lineTo(sgn * bx * 0.75, ySh + 0.012); I(1); c.strokeStyle = F.INK; c.lineWidth = lw * 2.2; c.stroke(); c.strokeStyle = S.bib; c.lineWidth = lw * 1.0; c.stroke();
        if (!back) { K.circle(c, sgn * bx * 0.75, ySh + 0.075, 0.007); sh(S.button, 0.6); } }
      if (!back) { K.rrect(c, -bx * 0.5, ySh + 0.1, bx, 0.035, 0.004); I(0.7); c.stroke(); }
    }
    c.restore();
    if (!behind) { drawArm('trail'); if (!sideArm) drawArm('lead'); else drawArm('lead'); }
    // ---------------- head (capsule) + hat / hair
    const tilt = (o.tilt || 0) + (E.tilt || 0);
    c.save(); c.translate(0, yH); c.rotate(tilt);
    const fo = (fs > 1.2 ? 0.55 : fs * 0.3) * dir * hw;              // face offset toward dir in 3/4 and profile
    if (id === 'mila1') {                                              // ponytail behind the head
      const px = -dir * hw * 0.55, swing = Math.sin(t * 3.1) * 0.012 + (o.drag || 0) * 0.04 * -dir;
      c.beginPath(); c.moveTo(px, -hh * 0.9); c.quadraticCurveTo(px - dir * 0.03 + swing, -hh * 1.35, px - dir * 0.07 + swing * 1.5, -hh * 1.05);
      c.quadraticCurveTo(px - dir * 0.11 + swing * 2, -hh * 0.5, px - dir * 0.06 + swing * 2.2, hh * 0.15); c.quadraticCurveTo(px - dir * 0.02, -hh * 0.3, px, -hh * 0.9); c.closePath(); sh(S.hair);
    }
    K.rrect(c, -hw, -hh, hw * 2, hh * 2, hw * 0.95); sh(S.skin);
    if (fs > 1.2 && !back) { K.circle(c, dir * hw * 0.98, hh * 0.1, hw * 0.16); sh(S.skin); }    // nose bump in profile
    if (id === 'eli1') {                                               // yellow beanie: dome + ribbed cuff
      const by = -hh * 0.52 - (o.hatHit || 0) * -0.02 + Math.max(0, E.by) * -0.02;
      c.beginPath(); c.moveTo(-hw * 1.04, by); c.lineTo(-hw * 1.04, -hh * 0.95); c.quadraticCurveTo(-hw * 1.04, -hh * 1.3, 0, -hh * 1.3); c.quadraticCurveTo(hw * 1.04, -hh * 1.3, hw * 1.04, -hh * 0.95); c.lineTo(hw * 1.04, by); c.closePath(); sh(S.hat);
      K.rrect(c, -hw * 1.08, by - 0.028, hw * 2.16, 0.045, 0.008); sh(S.rib);
      for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * hw * 0.42, by - 0.024); c.lineTo(k * hw * 0.42, by + 0.012); I(0.6); c.stroke(); }
    } else {                                                           // Mila: hair cap with a side fringe, tie, earrings
      c.beginPath(); c.moveTo(-hw * 1.02, -hh * 0.35); c.lineTo(-hw * 1.02, -hh * 0.75); c.quadraticCurveTo(-hw * 1.02, -hh * 1.06, 0, -hh * 1.06); c.quadraticCurveTo(hw * 1.02, -hh * 1.06, hw * 1.02, -hh * 0.75);
      c.lineTo(hw * 1.02, -hh * 0.55); c.quadraticCurveTo(hw * 0.5 + fo, -hh * 0.55, hw * 0.25 + fo, -hh * 0.32); c.quadraticCurveTo(hw * 0.1 + fo, -hh * 0.5, -hw * 0.3 + fo, -hh * 0.5); c.quadraticCurveTo(-hw * 0.7, -hh * 0.45, -hw * 1.02, -hh * 0.35); c.closePath(); sh(S.hair);
      K.rrect(c, -dir * hw * 0.55 - 0.014, -hh * 1.05, 0.028, 0.03, 0.005); sh(S.tie, 0.7);
      for (const sgn of (fs > 1.2 ? [dir] : [-1, 1])) { K.circle(c, sgn * hw * 1.02, hh * 0.3, 0.006); sh(S.ear, 0.5); K.circle(c, sgn * hw * 1.02, hh * 0.3 + 0.022, 0.01); sh(S.ear, 0.6); }
    }
    // ---------------- face: white oval eyes + big dark pupils + thick brows + a simple mouth (nothing when seen from the back)
    const eyes = [];
    if (!back) {
      const look = o.look || [0, 0], gx = (E.gazeX || 0) + look[0], gy = (E.gazeY || 0) + look[1];
      const eyeK = E.eyeK || 1, rx = hw * 0.34 * eyeK, ry = hh * 0.24 * eyeK, ey = -hh * 0.12 + gy * hh * 0.05, sep = hw * 0.47;
      const blink = (o.blink || 0) > 0.5 || E.closed;
      const list = fs > 1.2 ? [[dir, 1.25]] : [[-1, 1], [1, 1]];
      for (const [sgn, k] of list) {
        const ex = sgn * sep + fo + gx * hw * 0.1, RX = rx * k, RY = ry * k;
        const lid = K.clamp((E.lid || 0) + (id === 'mila1' ? 0.3 : 0)), low = K.clamp(E.low || 0);
        if (blink) { c.beginPath(); c.moveTo(ex - RX, ey + RY * 0.1); c.quadraticCurveTo(ex, ey + RY * 0.5, ex + RX, ey + RY * 0.1); I(1.3); c.stroke();
          eyes.push({ ex, ey, RX, RY, px: ex, py: ey, pr: RX * 0.5, closed: 'blink', lid: 1 }); continue; }
        K.ellipse(c, ex, ey, RX, RY); c.fillStyle = '#fbf7ee'; c.fill();
        // pupil: inside the open band between the lids (never hidden by a lid), >= 0.33 x the eye radius
        const top = -RY + lid * 2 * RY, bot = RY - low * 2 * RY, band = Math.max(bot - top, RY * 0.7);
        let pr = Math.max(0.36 * RY, Math.min(0.46 * RX * (E.pupilK || 1), band / 2 * 0.95));
        let py = ey + K.clamp((top + bot) / 2 + gy * RY * 0.35, top + pr * 0.8, bot - pr * 0.8), px = ex + K.clamp(gx * RX * 0.4, -RX + pr, RX - pr);
        c.save(); K.ellipse(c, ex, ey, RX, RY); c.clip();
        c.fillStyle = F.INK; K.circle(c, px, py, pr); c.fill();
        if (lid > 0.02) { c.fillStyle = S.skin; c.fillRect(ex - RX * 1.3, ey - RY * 1.3, RX * 2.6, top + RY * 1.3); c.strokeStyle = F.INK; c.lineWidth = lw * 0.7; c.beginPath(); c.moveTo(ex - RX * 1.3, ey + top); c.lineTo(ex + RX * 1.3, ey + top); c.stroke(); }
        if (low > 0.02) { c.fillStyle = S.skin; c.fillRect(ex - RX * 1.3, ey + bot, RX * 2.6, RY * 1.3); c.strokeStyle = F.INK; c.lineWidth = lw * 0.7; c.beginPath(); c.moveTo(ex - RX * 1.3, ey + bot); c.lineTo(ex + RX * 1.3, ey + bot); c.stroke(); }
        c.restore();
        K.ellipse(c, ex, ey, RX, RY); I(0.6); c.stroke();
        eyes.push({ ex, ey, RX, RY, px, py, pr, lid, low });
      }
      // brows: thick ink, raised by E.by, tilted by E.bt (inner end down = angry); `one` raises the dir-side brow more
      for (const [sgn, k] of list) {
        const ex = sgn * sep + fo + gx * hw * 0.1, RY = ry * k, RX = rx * k, inner = -sgn;         // inner = toward the nose
        const one = (E.one || 0) * (sgn === dir ? 1 : 0);
        const yb = ey - RY - hh * 0.1 - (E.by + one) * hh * 0.16, dy = E.bt * hh * 0.06;
        c.beginPath(); c.moveTo(ex + inner * RX * 0.9, yb + dy); c.lineTo(ex - inner * RX * 0.9, yb - dy * 0.4);
        c.strokeStyle = S.brow; c.lineWidth = lw * 1.9; c.lineCap = 'round'; c.stroke();
      }
      // mouth
      const mx = fo * 0.9 + gx * hw * 0.08, my = hh * 0.42, mw = hw * 0.5, M = E.mouth, talk = o.talk || 0;
      c.strokeStyle = id === 'mila1' ? S.mouth : F.INK; c.lineWidth = lw * 1.3; c.lineCap = 'round';
      const mouthFill = (w, h, teethTop, teethBot) => { K.ellipse(c, mx, my, w, h); sh(S.mouth || '#3a1a22'); c.save(); K.ellipse(c, mx, my, w, h); c.clip();
        c.fillStyle = '#fbf7ee'; if (teethTop) c.fillRect(mx - w, my - h, w * 2, h * teethTop); if (teethBot) c.fillRect(mx - w, my + h - h * teethBot, w * 2, h * teethBot); c.restore(); };
      if (talk > 0.2) mouthFill(mw * 0.5, hh * 0.08 * talk + 0.004, 0.3, 0);
      else if (M === 'smile_s') { c.beginPath(); c.moveTo(mx - mw * 0.45, my - 0.004); c.quadraticCurveTo(mx, my + 0.014, mx + mw * 0.45, my - 0.004); c.stroke(); }
      else if (M === 'grin') mouthFill(mw * 0.75, hh * 0.1, 0.42, 0);
      else if (M === 'o') mouthFill(mw * 0.4, hh * 0.12, 0, 0);
      else if (M === 'o_tall') mouthFill(mw * 0.4, hh * 0.15, 0, 0.25);
      else if (M === 'o_s') mouthFill(mw * 0.25, hh * 0.06, 0, 0);
      else if (M === 'shout') mouthFill(mw * 0.95, hh * 0.19, 0.3, 0.26);
      else if (M === 'flat') { c.beginPath(); c.moveTo(mx - mw * 0.5, my); c.lineTo(mx + mw * 0.5, my); c.stroke(); }
      else if (M === 'frown') { c.beginPath(); c.moveTo(mx - mw * 0.5, my + 0.008); c.quadraticCurveTo(mx, my - 0.012, mx + mw * 0.5, my + 0.008); c.stroke(); }
      else if (M === 'wobble' || M === 'wavy') { c.beginPath(); c.moveTo(mx - mw * 0.55, my); for (let k = 1; k <= 6; k++) c.lineTo(mx - mw * 0.55 + k * mw * 1.1 / 6, my + (k % 2 ? 0.006 : -0.006)); c.stroke(); }
      else if (M === 'smirk') { c.beginPath(); c.moveTo(mx - mw * 0.4, my + 0.004); c.quadraticCurveTo(mx + mw * 0.2, my + 0.012, mx + mw * 0.55, my - 0.01); c.stroke(); }
      else if (M === 'aside') { c.beginPath(); c.moveTo(mx - mw * 0.1, my + 0.002); c.lineTo(mx + mw * 0.45, my - 0.004); c.stroke(); }
    }
    c.restore();
    // ---------------- the eye log (canvas px) + body stats for the audits
    const m0 = ctx.getTransform(), ks = Math.hypot(m0.a, m0.b);   // the caller's scale (design -> canvas px)
    let rec = null;
    if (LOG) {
      const toPx = (px, py) => { const q = new DOMPoint(px, py).matrixTransform(c.getTransform()); return [q.x, q.y]; };
      c.save(); c.translate(0, yH); c.rotate(tilt);
      const E2 = [];
      for (const e of eyes) { const p = toPx(e.ex, e.ey), pp = toPx(e.px, e.py); const kk = Math.hypot(c.getTransform().a, c.getTransform().b);
        E2.push({ cx: p[0], cy: p[1], rx: e.RX * kk, ry: e.RY * kk, px: pp[0], py: pp[1], pr: e.pr * kk, cr: 0, closed: e.closed, lid: e.lid || 0, low: e.low || 0 }); }
      c.restore();
      rec = { id, expr: F.exprName(o.expr, o.exprBlend), view, blink: o.blink || 0, talk: o.talk || 0, look: o.look || null, headTurn: 0, hairFlop: 0, pose: o.pose || 'stand', u: u * ks, eyes: E2, flat: true };
      rec.body = bodyStats(B, CW, CH);
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(B.c, 0, 0); ctx.restore();
    const hx = x, hy = y + (yH + bob) * u, hr = hh * u;
    if (rec) { rec.head = [...(() => { const q = new DOMPoint(hx, hy).matrixTransform(ctx.getTransform()); return [q.x, q.y]; })(), hr * ks]; rec.foot = (() => { const q = new DOMPoint(x, y).matrixTransform(ctx.getTransform()); return [q.x, q.y]; })(); rec.seated = seated; rec.alpha = ctx.globalAlpha; LOG.push(rec); }
    // secondary cues (at most two): anger mark, sweat drop, ticks, sparkle
    const cues = o.extras || (E.cue ? [E.cue] : []);
    for (const cue of cues.slice(0, 2)) F.cue(ctx, cue, hx + dir * hw * u * 1.25, hy - hh * u * 0.9, hh * u * 0.35, t);
    const map = p => [x + p[0] * u, y + (p[1] + bob) * u];
    return { head: [hx, hy, hr], hands: { lead: map(hands.lead || [0, ySh]), trail: map(hands.trail || [0, ySh]) }, top: y + (yH - hh * 1.3 + bob) * u };
  };
  F.cue = function (c, kind, x, y, s, t) {
    c.save(); ink(c, F.LW * 0.9);
    if (kind === 'anger') { for (const [a, b] of [[-0.5, 0.15], [-0.15, 0.5], [0.15, 0.5], [0.5, 0.15]]) { c.beginPath(); c.moveTo(x + a * s, y + b * s); c.lineTo(x + a * s * 0.3, y + b * s * 0.3); c.stroke(); } }
    else if (kind === 'sweat') { c.beginPath(); c.moveTo(x, y - s * 0.5); c.quadraticCurveTo(x + s * 0.5, y + s * 0.3, x, y + s * 0.5); c.quadraticCurveTo(x - s * 0.5, y + s * 0.3, x, y - s * 0.5); c.closePath(); shape(c, '#cfe6ea', F.LW * 0.8); }
    else if (kind === 'ticks' || kind === 'puff') { for (const a of [-0.8, -0.3, 0.2]) { c.beginPath(); c.moveTo(x + Math.cos(a - 1.2) * s * 0.5, y + Math.sin(a - 1.2) * s * 0.5); c.lineTo(x + Math.cos(a - 1.2) * s, y + Math.sin(a - 1.2) * s); c.stroke(); } }
    else if (kind === 'sparkle') { c.fillStyle = '#fff3c4'; c.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? s * 0.18 : s * 0.5, a = k * Math.PI / 4; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); }
    c.restore();
  };
  // the character's own pixels in the buffer -> tight box + wardrobe colour families (same classes as K.cast's bodyStats)
  function bodyStats(B, w, h) {
    const d = B.ctx.getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = -1, y1 = -1, n = 0;
    const cl = { yellow: 0, purple: 0, mustard: 0, green: 0, blue: 0, brown: 0, white: 0, vermilion: 0, pale: 0 };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; if (d[i + 3] < 110) continue; n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), c = mx - mn;
      if (c < 0.16 && mx > 0.45) cl.pale++;
      if (mx > 0.82 && c < 0.12) { cl.white++; continue; }
      if (c < 0.12 || mx < 0.18) continue;
      let hu = mx === r ? ((g - b) / c) % 6 : mx === g ? (b - r) / c + 2 : (r - g) / c + 4; hu = (hu * 60 + 360) % 360; const sat = c / mx;
      if (hu >= 2 && hu < 16 && sat > 0.62 && mx > 0.75) cl.vermilion++;
      else if (hu >= 40 && hu < 58 && sat > 0.5 && mx > 0.6) cl.yellow++;
      else if (hu >= 30 && hu < 48 && sat > 0.45) cl.mustard++;
      else if (hu >= 20 && hu < 34 && sat > 0.35 && mx < 0.7) cl.brown++;
      else if (hu >= 120 && hu < 170 && sat > 0.3) cl.green++;
      else if (hu >= 205 && hu < 235 && sat > 0.3) cl.blue++;
      else if (hu >= 240 && hu < 290 && sat > 0.25) cl.purple++;
    }
    for (const k in cl) cl[k] = n ? +(cl[k] / n).toFixed(4) : 0;
    return { box: n ? [x0, y0, x1 + 1, y1 + 1] : null, px: n, cl };
  }

  // ------------------------------------------------------------------ caption bar (top), flat text boxes, thought bubbles, callouts
  F.FONT = { caption: '700 42px "Space Grotesk"', pill: '700 28px "Martian Mono"', speech: '50px "TB Speech"', shout: '70px "TB Shout"', whisper: '42px "TB Soft"', callout: '58px "TB Speech"' };
  F.caption = function (c, text, a = 1, o = {}) {
    if (a <= 0.01 || !text) return null;
    c.save(); c.globalAlpha *= K.clamp(a); c.font = F.FONT.caption; c.textBaseline = 'middle'; c.textAlign = 'left';
    const padX = 30, h = 76, w = c.measureText(text).width + padX * 2, x = o.x ?? 56, y = (o.y ?? 40) - (1 - K.ease.out(K.clamp(a))) * 40;
    rr(c, x, y, w, h, 10, F.PAL.paper); c.fillStyle = F.INK; c.fillText(text, x + padX, y + h / 2 + 2);
    if (o.pill) { c.font = F.FONT.pill; const pw = c.measureText(o.pill).width + 44, px = K.W - 56 - pw; rr(c, px, y + 10, pw, h - 20, 8, F.INK); c.fillStyle = F.PAL.paper; c.fillText(o.pill, px + 22, y + h / 2 + 2); }
    c.restore(); return [x, y, x + w, y + h];
  };
  function wrap(c, text, maxW) { const out = []; for (const para of String(text).split('\n')) { let cur = ''; for (const wd of para.split(' ')) { const tr = cur ? cur + ' ' + wd : wd; if (c.measureText(tr).width > maxW && cur) { out.push(cur); cur = wd; } else cur = tr; } out.push(cur); } return out; }
  // a flat speech box: paper card, thick ink, a triangle tail toward the head (it stops outside the head zone)
  F.box = function (c, o) {
    const kind = o.kind || 'speech', a = o.a ?? 1; if (a <= 0.01) return null;
    const text = kind === 'shout' ? String(o.text).toUpperCase() : o.text;
    c.save(); c.font = F.FONT[kind] || F.FONT.speech; c.textBaseline = 'middle'; c.textAlign = 'center';
    const size = Number(c.font.match(/(\d+)px/)[1]), lines = wrap(c, text, kind === 'shout' ? 820 : 620), lh = size * 1.12;
    const padX = size * 0.6, padY = size * 0.42, w = Math.max(...lines.map(l => c.measureText(l).width)) + padX * 2, h = lines.length * lh + padY * 2;
    const H = o.head, side = o.side || (H ? (H[0] < K.W / 2 ? 1 : -1) : 1);
    let cx, cy;
    if (H) { cx = H[0] + side * (H[2] * 1.4 + w / 2 + 20); cy = H[1] - H[2] * 1.5 - h / 2; } else { cx = K.W * 0.27; cy = K.H * 0.22; }
    cx = K.clamp(cx, 48 + w / 2, K.W - 48 - w / 2); cy = K.clamp(cy, 150 + h / 2, K.H * 0.86 - h / 2);
    const age = o.age ?? 1, pop = kind === 'whisper' ? K.clamp(age / 0.28) : K.ease.outBack(K.clamp(age / 0.2)), sc = K.lerp(0.7, 1, pop);
    const shake = kind === 'shout' ? 3 * Math.exp(-age * 4) * Math.sin(age * 60) : 0;
    // tail tip: toward the head, stopping 10 px outside its zone
    let tip = null; if (H) { const dx = H[0] - cx, dy = H[1] - cy, L = Math.hypot(dx, dy) || 1; const stop = H[2] * 1.3 + 10; tip = [H[0] - dx / L * stop, H[1] - dy / L * stop]; }
    c.globalAlpha *= a; c.translate(cx + shake, cy); c.scale(sc, sc); c.translate(-cx, -cy);
    const x0 = cx - w / 2, y0 = cy - h / 2;
    if (tip) { const bx = K.clamp(tip[0], x0 + w * 0.2, x0 + w * 0.8), onTop = tip[1] < cy, by = onTop ? y0 : y0 + h;
      c.beginPath(); c.moveTo(bx - size * 0.35, by); c.lineTo(tip[0], tip[1]); c.lineTo(bx + size * 0.35, by); c.closePath(); shape(c, F.PAL.paper); }
    if (kind === 'whisper') { c.setLineDash([F.LW * 2, F.LW * 1.6]); }
    rr(c, x0, y0, w, h, kind === 'shout' ? 6 : 16, F.PAL.paper); c.setLineDash([]);
    if (tip) { const bx = K.clamp(tip[0], x0 + w * 0.2, x0 + w * 0.8), onTop = tip[1] < cy, by = onTop ? y0 : y0 + h;   // open the card edge toward the tail
      c.fillStyle = F.PAL.paper; c.fillRect(bx - size * 0.35 + F.LW * 0.5, by - F.LW * 0.75, size * 0.7 - F.LW, F.LW * 1.5); }
    c.fillStyle = F.INK; lines.forEach((l, i) => c.fillText(l, cx, y0 + padY + lh * (i + 0.5) + 2));
    c.restore(); return { rect: [x0, y0, x0 + w, y0 + h], full: [x0, y0, x0 + w, y0 + h], tip };
  };
  F.callout = function (c, x, y, text, a = 1) {
    if (a <= 0.01) return; c.save(); c.globalAlpha *= a; c.font = F.FONT.callout; c.textAlign = 'center'; c.textBaseline = 'middle';
    const w = c.measureText(text).width + 50, h = 84, sc = K.ease.outBack(K.clamp(a)); c.translate(x, y); c.scale(sc, sc); rr(c, -w / 2, -h / 2, w, h, 14, F.PAL.paper); c.fillStyle = F.INK; c.fillText(text, 0, 3); c.restore();
  };
  // a thought cloud with a trail of three bubbles toward the thinker's head; icons drawn flat inside
  F.thought = function (c, head, o) {
    const a = o.a ?? 1; if (a <= 0.01) return null;
    const { x, y, w, h } = o; c.save(); c.globalAlpha *= a;
    const sc = K.ease.outBack(K.clamp(a)); c.translate(x, y); c.scale(sc, sc); c.translate(-x, -y);
    const discs = []; const n = Math.max(4, Math.round(w / (h * 0.55)));
    for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; discs.push([x - w / 2 + u * w, y - h * 0.08 * Math.sin(u * Math.PI), h * 0.42 + h * 0.1 * Math.sin(u * Math.PI)]); }
    discs.push([x - w * 0.2, y + h * 0.2, h * 0.36], [x + w * 0.2, y + h * 0.2, h * 0.36], [x, y - h * 0.2, h * 0.45]);
    if (head) { const dx = head[0] - x, dy = (head[1] - head[2] * 1.3) - y; for (const [k, r] of [[0.52, h * 0.1], [0.68, h * 0.065], [0.8, h * 0.04]]) { K.circle(c, x + dx * k, y + dy * k, r); shape(c, F.PAL.paper); } }
    blobs(c, discs, F.PAL.paper);
    const icons = o.icons || [], iw = w / (icons.length + 1);
    icons.forEach((ic, i) => { if ((ic.a ?? 1) > 0.01) { c.save(); c.globalAlpha *= K.clamp(ic.a ?? 1); const ix = x - w / 2 + iw * (i + 1), s = Math.min(h * 0.28, iw * 0.36) * K.ease.outBack(K.clamp(ic.a ?? 1));
      F.icon(c, ic.kind, ix, y, s); if (ic.cross > 0.01) { c.save(); c.globalAlpha *= K.clamp(ic.cross); ink(c, F.LW * 1.6); const k = K.clamp(ic.cross); c.beginPath(); c.moveTo(ix - s * 1.1, y - s * 1.1); c.lineTo(ix - s * 1.1 + 2.2 * s * k, y - s * 1.1 + 2.2 * s * k); c.stroke();
        if (k > 0.5) { c.beginPath(); c.moveTo(ix + s * 1.1, y - s * 1.1); c.lineTo(ix + s * 1.1 - 2.2 * s * (k - 0.5) * 2, y - s * 1.1 + 2.2 * s * (k - 0.5) * 2); c.stroke(); } c.restore(); } c.restore(); } });
    c.restore(); return { full: [x - w / 2 - h * 0.1, y - h * 0.7, x + w / 2 + h * 0.1, y + h * 0.6] };
  };
  F.icon = function (c, kind, x, y, s) {
    c.save();
    if (kind === 'note') { K.ellipse(c, x - s * 0.35, y + s * 0.55, s * 0.42, s * 0.3, -0.4); shape(c, F.INK, F.LW * 0.8); line(c, x + s * 0.05, y + s * 0.45, x + s * 0.05, y - s * 0.9, F.LW * 1.2); c.beginPath(); c.moveTo(x + s * 0.05, y - s * 0.9); c.quadraticCurveTo(x + s * 0.7, y - s * 0.7, x + s * 0.55, y - s * 0.1); ink(c, F.LW * 1.2); c.stroke(); }
    else if (kind === 'cone') { c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * 0.6, y + s * 0.7); c.lineTo(x - s * 0.6, y + s * 0.7); c.closePath(); shape(c, '#e4a04a'); rr(c, x - s * 0.9, y + s * 0.6, s * 1.8, s * 0.3, 4, '#e4a04a'); c.fillStyle = '#fbf7ee'; c.fillRect(x - s * 0.33, y - s * 0.05, s * 0.66, s * 0.22); }
    else if (kind === 'light') { rr(c, x - s * 0.45, y - s, s * 0.9, s * 2, 8, '#3c3a44'); for (const [k, col] of [[-0.62, '#e0564a'], [0, '#e8c24a'], [0.62, '#5fb36a']]) { K.circle(c, x, y + k * s, s * 0.22); shape(c, col, F.LW * 0.7); } }
    else if (kind === 'crash') { rr(c, x - s * 1.1, y - s * 0.2, s * 1.1, s * 0.7, 6, '#8aa3c9'); rr(c, x + s * 0.05, y - s * 0.2, s * 1.1, s * 0.7, 6, '#e2b04a');
      c.fillStyle = '#fff3c4'; c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? s * 0.22 : s * 0.5, a = k * Math.PI / 5 - 0.3; c.lineTo(x + Math.cos(a) * r, y - s * 0.45 + Math.sin(a) * r); } c.closePath(); c.fill(); ink(c, F.LW * 0.8); c.stroke(); }
    c.restore();
  };
  // a flat bird: body, head, beak, white eye with a pupil, wings (shrug lifts them), legs
  F.bird = function (c, x, y, s, o = {}) {
    const d = o.dir || -1, sh2 = o.shrug || 0; c.save();
    for (const sgn of [-1, 1]) line(c, x + sgn * s * 0.18, y, x + sgn * s * 0.22, y + s * 0.25, F.LW * 0.9);
    K.ellipse(c, x, y - s * 0.45, s * 0.62, s * 0.45); shape(c, '#8c6f5a');
    K.ellipse(c, x - d * s * 0.1, y - s * 0.5 + sh2 * s * 0.1, s * 0.36, s * 0.3, d * (0.5 + sh2 * 0.6)); shape(c, '#6f5646');
    K.circle(c, x + d * s * 0.5, y - s * 0.85, s * 0.34); shape(c, '#8c6f5a');
    c.beginPath(); c.moveTo(x + d * s * 0.8, y - s * 0.9); c.lineTo(x + d * s * 1.15, y - s * 0.8 + (o.open ? s * 0.1 : 0)); c.lineTo(x + d * s * 0.8, y - s * 0.72); c.closePath(); shape(c, '#e8b84a', F.LW * 0.8);
    const lk = o.look || [0, 0]; K.circle(c, x + d * s * 0.56, y - s * 0.9, s * 0.13); shape(c, '#fbf7ee', F.LW * 0.7); c.fillStyle = F.INK; K.circle(c, x + d * s * 0.56 + lk[0] * s * 0.05, y - s * 0.9 + lk[1] * s * 0.05, s * 0.065); c.fill();
    c.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
