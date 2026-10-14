/* Diez Mil Puntos art kit · cars. Every car is a tiny open-top bubble car, so every driver's round head is visible from
   every angle (a road of cars is a road of dots). Views: rear, front, side (close-ups), oblique top (high angles).
   Units: (x, y) = ground contact centre in px, s = px per metre. `fog` = [hazeColour, 0..1] mixes every colour toward
   the haze (atmospheric perspective). `lit` = { rim, shade, dx } light recipe. Brake/tail lights draw their own glow. */
(function (root) {
  const K = root.K;
  K.car = {};
  K.car.COLORS = ['#e9dcc0', '#7fb3b0', '#e2b04a', '#8aa3c9', '#a9bf8e', '#c7a6c9', '#9c8bb8', '#5d8a8f', '#f0e6d2', '#b9c4cc'];
  const DARK = '#2a2230';

  function C(c, fog) { return fog ? K.mix(c, fog[0], fog[1]) : c; }

  // brake / tail light with glow. b = brake 0..1, tail = base level (night: tail lights on)
  K.car.lamp = function (ctx, x, y, w, h, b, o = {}) {
    const tail = o.tail || 0, lvl = Math.max(b, tail * 0.6);
    const off = C(o.offColor || '#6e2a2c', o.fog);
    ctx.fillStyle = lvl > 0.02 ? K.mix(off, '#ff4a36', K.clamp(lvl * 1.4)) : off;
    K.rrect(ctx, x - w / 2, y - h / 2, w, h, Math.min(w, h) * 0.45); ctx.fill();
    if (lvl > 0.05) {
      ctx.fillStyle = K.rgba('#ffd2b0', lvl * 0.9); K.rrect(ctx, x - w * 0.3, y - h * 0.25, w * 0.6, h * 0.5, h * 0.25); ctx.fill();
      const fogK = o.fog ? 1 - o.fog[1] * 0.4 : 1;
      K.light.glow(ctx, x, y, Math.max(11, w * (o.glow || 5)) * (0.6 + 0.4 * lvl), '#ff2a1a', 0.75 * lvl * fogK);
      K.light.glow(ctx, x, y, Math.max(4, w * 1.6), '#ff6a40', 0.8 * lvl * fogK);
    }
  };

  // ---------------------------------------------------------------- rear view (driving away from camera)
  K.car.rear = function (ctx, x, y, s, o = {}) {
    const fog = o.fog, body = C(o.color || K.car.COLORS[0], fog), lit = o.lit || {};
    const bodyShade = lit.shade ? K.mix(body, C(lit.shade, fog), lit.shadeK ?? 0.35) : body;
    const W = 1.7 * s, top = y - 1.0 * s, bot = y - 0.18 * s;
    // wheels
    ctx.fillStyle = C(DARK, fog);
    K.rrect(ctx, x - W * 0.47, y - 0.36 * s, 0.26 * s, 0.36 * s, 0.07 * s); ctx.fill();
    K.rrect(ctx, x + W * 0.47 - 0.26 * s, y - 0.36 * s, 0.26 * s, 0.36 * s, 0.07 * s); ctx.fill();
    // driver head (behind the body top)
    if (o.driver !== false && s > 1.2) {
      // windshield seen from behind: a pale translucent sliver beyond the head
      ctx.fillStyle = K.rgba(C('#dfe9f0', fog), 0.18);
      K.rrect(ctx, x - W * 0.36, top - 0.42 * s, W * 0.72, 0.42 * s, [0.18 * s, 0.18 * s, 0, 0]); ctx.fill();
      const R = 0.34 * s, hx = x + (o.headDx || 0) * s, hy = top - R * 0.55 + (o.bob || 0) * s;
      if (o.mascot) K.char.mascot(ctx, hx, hy, R * 1.05, { expr: 'neutral', rim: lit.rim, lightAng: lit.ang ?? -2.2, rimW: 0.14, look: [0, -1] , shadeAlpha: 0.4});
      else K.char.head(ctx, hx, hy, R, { view: 'back', skin: o.skin, hair: o.hair, hairStyle: o.hairStyle, capColor: o.capColor, fog,
        light: lit.rim ? { ang: lit.ang ?? -2.2, rim: C(lit.rim, fog), shade: lit.shade } : null });
    }
    // body
    ctx.fillStyle = bodyShade;
    K.rrect(ctx, x - W / 2, top, W, bot - top, [0.42 * s, 0.42 * s, 0.16 * s, 0.16 * s]); ctx.fill();
    if (s > 6) { K.rrect(ctx, x - W / 2, top, W, bot - top, [0.42 * s, 0.42 * s, 0.16 * s, 0.16 * s]); K.tex.fillPath(ctx, 0.25, s / 40); }
    // seat back / cockpit rim (darker band at the top)
    ctx.fillStyle = K.mix(bodyShade, C(DARK, fog), 0.35);
    K.rrect(ctx, x - W * 0.34, top + 0.04 * s, W * 0.68, 0.12 * s, 0.06 * s); ctx.fill();
    // bumper + plate
    ctx.fillStyle = K.mix(bodyShade, C(DARK, fog), 0.45);
    K.rrect(ctx, x - W * 0.5, bot - 0.16 * s, W, 0.16 * s, 0.08 * s); ctx.fill();
    if (s > 4) { ctx.fillStyle = C('#efe6cf', fog); K.rrect(ctx, x - 0.22 * s, bot - 0.36 * s, 0.44 * s, 0.17 * s, 0.03 * s); ctx.fill(); }
    // rim light along the top edge (backlit) and the sun side
    if (lit.rim && s > 2) {
      ctx.save(); K.rrect(ctx, x - W / 2, top, W, bot - top, [0.42 * s, 0.42 * s, 0.16 * s, 0.16 * s]); ctx.clip();
      ctx.strokeStyle = K.rgba(C(lit.rim, fog), lit.rimAlpha ?? 0.9); ctx.lineWidth = Math.max(1, 0.07 * s);
      K.rrect(ctx, x - W / 2 + (lit.dx || 0) * 0.04 * s, top + 0.01 * s, W, bot - top, [0.42 * s, 0.42 * s, 0.16 * s, 0.16 * s]); ctx.stroke();
      ctx.restore();
    }
    // lamps
    const ly = top + 0.42 * s, lw = 0.3 * s, lh = 0.17 * s;
    for (const sx of [-1, 1]) K.car.lamp(ctx, x + sx * W * 0.34, ly, lw, lh, o.brake || 0, { tail: o.tail, fog, glow: o.glowScale || 5 });
  };

  // ---------------------------------------------------------------- front view (oncoming)
  K.car.front = function (ctx, x, y, s, o = {}) {
    const fog = o.fog, body = C(o.color || K.car.COLORS[1], fog), lit = o.lit || {};
    const bodyShade = lit.shade ? K.mix(body, C(lit.shade, fog), lit.shadeK ?? 0.35) : body;
    const W = 1.7 * s, top = y - 0.95 * s, bot = y - 0.18 * s;
    ctx.fillStyle = C(DARK, fog);
    K.rrect(ctx, x - W * 0.47, y - 0.36 * s, 0.26 * s, 0.36 * s, 0.07 * s); ctx.fill();
    K.rrect(ctx, x + W * 0.47 - 0.26 * s, y - 0.36 * s, 0.26 * s, 0.36 * s, 0.07 * s); ctx.fill();
    if (s > 1.2) {
      const R = 0.34 * s;
      K.char.head(ctx, x - 0.32 * s, top - R * 0.5, R, { view: 'front', skin: o.skin, hair: o.hair, hairStyle: o.hairStyle, capColor: o.capColor, expr: o.expr || 'content', fog,
        light: lit.rim ? { ang: lit.ang ?? -1.3, rim: C(lit.rim, fog), shade: lit.shade } : null });
      // windshield (glass in front of the face): pale, reflective
      ctx.fillStyle = K.rgba(C('#f4efe6', fog), 0.28);
      K.rrect(ctx, x - W * 0.4, top - 0.48 * s, W * 0.8, 0.5 * s, [0.2 * s, 0.2 * s, 0, 0]); ctx.fill();
      ctx.strokeStyle = K.rgba(C(DARK, fog), 0.5); ctx.lineWidth = Math.max(0.5, 0.04 * s);
      K.rrect(ctx, x - W * 0.4, top - 0.48 * s, W * 0.8, 0.5 * s, [0.2 * s, 0.2 * s, 0, 0]); ctx.stroke();
    }
    ctx.fillStyle = bodyShade;
    K.rrect(ctx, x - W / 2, top, W, bot - top, [0.38 * s, 0.38 * s, 0.16 * s, 0.16 * s]); ctx.fill();
    ctx.fillStyle = K.mix(bodyShade, C(DARK, fog), 0.45);
    K.rrect(ctx, x - W * 0.5, bot - 0.16 * s, W, 0.16 * s, 0.08 * s); ctx.fill();
    // grille smile
    if (s > 5) { ctx.strokeStyle = K.mix(bodyShade, C(DARK, fog), 0.5); ctx.lineWidth = 0.05 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(x, bot - 0.55 * s, 0.32 * s, Math.PI * 0.25, Math.PI * 0.75); ctx.stroke(); }
    if (lit.rim && s > 2) {
      ctx.save(); K.rrect(ctx, x - W / 2, top, W, bot - top, [0.38 * s, 0.38 * s, 0.16 * s, 0.16 * s]); ctx.clip();
      ctx.strokeStyle = K.rgba(C(lit.rim, fog), 0.85); ctx.lineWidth = Math.max(1, 0.07 * s);
      K.rrect(ctx, x - W / 2, top + 0.01 * s, W, bot - top, [0.38 * s, 0.38 * s, 0.16 * s, 0.16 * s]); ctx.stroke(); ctx.restore();
    }
    // headlights
    const hl = o.head ?? 0.25, hr = 0.11 * s;
    for (const sx of [-1, 1]) {
      const hx = x + sx * W * 0.33, hy = top + 0.33 * s;
      ctx.fillStyle = K.mix(C('#d9d2bf', fog), '#fff6d8', hl); K.circle(ctx, hx, hy, hr); ctx.fill();
      if (hl > 0.05) { K.light.glow(ctx, hx, hy, Math.max(5, s * (o.glowScale || 0.8)), '#fff1c8', 0.45 * hl); K.light.glow(ctx, hx, hy, Math.max(2, s * 0.22), '#ffffff', 0.5 * hl); }
    }
  };

  // ---------------------------------------------------------------- side view (close-ups). dir = +1 faces right
  // drawDriver(seatX, seatY, s) is called between the back of the cockpit and the door, so heads sit *in* the car.
  K.car.side = function (ctx, x, y, s, o = {}) {
    const dir = o.dir || 1, body = o.color || K.car.COLORS[0], lit = o.lit || {}, pitch = o.pitch || 0, wheelRot = o.wheel || 0;
    const L = 3.3 * s, Rw = 0.32 * s;
    const shade = lit.shade ? K.mix(body, lit.shade, 0.22) : body, dark = K.mix(body, DARK, 0.5);
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    const wx = [-L * 0.31, L * 0.31];
    // wheel wells + wheels (under the body, they don't pitch)
    ctx.save(); ctx.translate(0, -Rw); ctx.rotate(pitch); ctx.translate(0, Rw);
    // body silhouette
    const bodyPath = () => {
      ctx.beginPath();
      ctx.moveTo(-L * 0.5, -0.32 * s);
      ctx.bezierCurveTo(-L * 0.53, -0.75 * s, -L * 0.47, -1.02 * s, -L * 0.3, -1.03 * s);   // tail
      ctx.lineTo(L * 0.18, -1.03 * s);
      ctx.bezierCurveTo(L * 0.38, -1.02 * s, L * 0.53, -0.82 * s, L * 0.52, -0.34 * s);     // nose
      ctx.quadraticCurveTo(L * 0.52, -0.2 * s, L * 0.44, -0.2 * s);
      ctx.lineTo(-L * 0.44, -0.2 * s); ctx.quadraticCurveTo(-L * 0.5, -0.2 * s, -L * 0.5, -0.32 * s); ctx.closePath();
    };
    // cockpit back: seat (behind driver)
    ctx.fillStyle = K.mix(body, DARK, 0.62);
    K.rrect(ctx, -L * 0.28, -1.55 * s, 0.34 * s, 0.6 * s, [0.16 * s, 0.16 * s, 0, 0]); ctx.fill();
    if (o.drawDriver) { ctx.save(); ctx.scale(dir, 1); o.drawDriver(-L * 0.02 * dir, -1.0 * s); ctx.restore(); }
    // windshield
    ctx.fillStyle = K.rgba('#e9f2f4', 0.32); ctx.strokeStyle = K.rgba(DARK, 0.75); ctx.lineWidth = 0.05 * s;
    ctx.beginPath(); ctx.moveTo(L * 0.33, -1.02 * s); ctx.quadraticCurveTo(L * 0.34, -1.3 * s, L * 0.27, -1.45 * s); ctx.lineTo(L * 0.235, -1.43 * s); ctx.quadraticCurveTo(L * 0.28, -1.28 * s, L * 0.26, -1.02 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    // body
    bodyPath(); ctx.fillStyle = body; ctx.fill();
    bodyPath(); K.tex.fillPath(ctx, 0.28, s / 60);
    // lower shade band
    ctx.save(); bodyPath(); ctx.clip();
    ctx.fillStyle = K.rgba(lit.shade || '#4a2a40', 0.22); ctx.fillRect(-L, -0.52 * s, L * 2, 0.4 * s);
    // rim light along the top (light from the front/right, dir-aware)
    if (lit.rim) {
      ctx.strokeStyle = K.rgba(lit.rim, 0.95); ctx.lineWidth = 0.09 * s;
      ctx.translate(-0.04 * s * (lit.dx ?? 1), 0.035 * s); bodyPath(); ctx.stroke();
    }
    ctx.restore();
    // door line, handle, cockpit lip
    ctx.strokeStyle = K.rgba(dark, 0.55); ctx.lineWidth = 0.035 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-L * 0.12, -0.98 * s); ctx.quadraticCurveTo(-L * 0.13, -0.5 * s, -L * 0.08, -0.26 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L * 0.17, -0.98 * s); ctx.quadraticCurveTo(L * 0.19, -0.5 * s, L * 0.15, -0.26 * s); ctx.stroke();
    ctx.fillStyle = K.rgba(dark, 0.8); K.rrect(ctx, L * 0.06, -0.78 * s, 0.22 * s, 0.05 * s, 0.025 * s); ctx.fill();
    ctx.fillStyle = K.mix(body, DARK, 0.3); K.rrect(ctx, -L * 0.32, -1.07 * s, L * 0.56, 0.09 * s, 0.045 * s); ctx.fill();
    // lamps
    K.car.lamp(ctx, -L * 0.495, -0.7 * s, 0.08 * s, 0.24 * s, o.brake || 0, { tail: o.tail, glow: 7 });
    ctx.fillStyle = '#fff3cf'; K.ellipse(ctx, L * 0.5, -0.66 * s, 0.05 * s, 0.13 * s); ctx.fill();
    // bumper
    ctx.fillStyle = K.mix(body, DARK, 0.55); K.rrect(ctx, -L * 0.53, -0.36 * s, 0.22 * s, 0.13 * s, 0.06 * s); ctx.fill(); K.rrect(ctx, L * 0.45, -0.36 * s, 0.22 * s, 0.13 * s, 0.06 * s); ctx.fill();
    ctx.restore();
    // wheels
    for (const wxi of wx) {
      ctx.fillStyle = DARK; K.circle(ctx, wxi, -Rw, Rw); ctx.fill();
      ctx.fillStyle = '#cfc6b5'; K.circle(ctx, wxi, -Rw, Rw * 0.48); ctx.fill();
      ctx.fillStyle = '#8f877c';
      for (let k = 0; k < 4; k++) { const a = wheelRot * dir + k * Math.PI / 2; K.circle(ctx, wxi + Math.cos(a) * Rw * 0.28, -Rw + Math.sin(a) * Rw * 0.28, Rw * 0.07); ctx.fill(); }
      if (lit.rim) { ctx.strokeStyle = K.rgba(lit.rim, 0.5); ctx.lineWidth = 0.04 * s; ctx.beginPath(); ctx.arc(wxi, -Rw, Rw * 0.96, -1.4, -0.2); ctx.stroke(); }
    }
    ctx.restore();
  };

  // ---------------------------------------------------------------- oblique top view (high angle, orthographic)
  // view = { sc: px per metre, sinE, cosE, ox, oy } ; (X, Z) ground position in metres; heading = angle in the ground plane
  K.car.top = function (ctx, view, X, Z, heading, o = {}) {
    const { sinE, cosE, ox, oy } = view, kk = o.k || 1, sc = view.sc * kk, body = o.color || K.car.COLORS[0], L = 3.3, Wd = 1.6;
    X /= kk; Z /= kk;                       // sprite drawn kk times larger than the world (stylised), same placement
    const gx = ox + X * sc, gy = oy + Z * sc * sinE;
    if (o.shadowOnly) {                       // long shadow: footprint swept along the sun's shadow vector (metres)
      const [dx, dz] = o.shadowOnly;
      for (let i = 0; i <= 10; i++) { const u = i / 10; ctx.setTransform(sc, 0, 0, sc * sinE, gx + dx * u * sc, gy + dz * u * sc * sinE); ctx.rotate(heading);
        K.rrect(ctx, -L / 2, -Wd / 2, L, Wd, 0.6); ctx.fill(); K.circle(ctx, -0.1, 0, 0.36); ctx.fill(); }
      ctx.setTransform(1, 0, 0, 1, 0, 0); return;
    }
    const at = (h) => { ctx.setTransform(sc, 0, 0, sc * sinE, gx, gy - h * sc * cosE); ctx.rotate(heading); };
    ctx.save();
    // extrusion: stack the footprint from the sill up to the shoulder
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const h = 0.2 + 0.75 * i / steps; at(h);
      ctx.fillStyle = i < steps ? K.mix(body, o.shade || '#3a2a44', 0.45 - i * 0.04) : body;
      K.rrect(ctx, -L / 2, -Wd / 2, L, Wd, 0.6); ctx.fill();
    }
    // cockpit hollow
    at(0.95); ctx.fillStyle = K.mix(body, DARK, 0.55); K.rrect(ctx, -0.75, -0.55, 1.2, 1.1, 0.4); ctx.fill();
    ctx.fillStyle = K.rgba('#e9f2f4', 0.45); K.rrect(ctx, 0.5, -0.62, 0.16, 1.24, 0.08); ctx.fill();
    // lamps (rear = -x)
    const b = o.brake || 0, tail = o.tail || 0;
    if (b > 0.03 || tail > 0) {
      at(0.7);
      ctx.fillStyle = K.mix('#7a2a2a', '#ff4a36', Math.max(b, tail * 0.5));
      ctx.fillRect(-L / 2 - 0.05, -0.62, 0.12, 0.3); ctx.fillRect(-L / 2 - 0.05, 0.32, 0.12, 0.3);
    }
    if (o.lit && o.lit.rim) { at(0.95); ctx.strokeStyle = K.rgba(o.lit.rim, 0.8); ctx.lineWidth = 0.1; ctx.beginPath();
      const a0 = (o.lit.sunAng ?? -2.4) - heading; ctx.ellipse(0, 0, L / 2 - 0.12, Wd / 2 - 0.1, 0, a0 - 0.9, a0 + 0.9); ctx.stroke(); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // head (spheres project as circles)
    const hx = X + Math.cos(heading) * -0.1, hz = Z + Math.sin(heading) * -0.1;
    const sx = ox + hx * sc, sy = oy + hz * sc * sinE - 1.35 * sc * cosE, R = 0.36 * sc;
    const look = [Math.cos(heading) * 0.9, Math.sin(heading) * sinE * 0.9 - 0.4];
    if (o.mascot) K.char.mascot(ctx, sx, sy, R * 1.12, { expr: o.expr || 'neutral', look, rim: o.lit && o.lit.rim, lightAng: o.lit ? o.lit.ang ?? -2.4 : -2.4, rimW: 0.12 });
    else K.char.head(ctx, sx, sy, R, { view: 'front', skin: o.skin, hair: o.hair, hairStyle: o.hairStyle, capColor: o.capColor, expr: o.expr || 'neutral', look,
      light: o.lit && o.lit.rim ? { ang: o.lit.ang ?? -2.4, rim: o.lit.rim, shade: o.lit.shade } : null });
    if (b > 0.03 || tail > 0) {
      const lv = Math.max(b, tail * 0.5);
      for (const side of [-0.47, 0.47]) {
        const lx = X + Math.cos(heading) * (-L / 2) - Math.sin(heading) * side, lz = Z + Math.sin(heading) * (-L / 2) + Math.cos(heading) * side;
        K.light.glow(ctx, ox + lx * sc, oy + lz * sc * sinE - 0.7 * sc * cosE, sc * 2.2, '#ff3a28', 0.6 * lv);
      }
    }
    ctx.restore();
  };

  // deterministic driver look per car index
  K.car.persona = function (i, seed = 1) {
    const r = K.rng(seed * 1000 + i * 7919 + 13);
    const styles = ['short', 'bob', 'curly', 'bun', 'cap', 'none', 'short', 'bob'];
    return { color: K.car.COLORS[Math.floor(r() * K.car.COLORS.length)], skin: K.char.SKIN[Math.floor(r() * K.char.SKIN.length)],
      hair: K.char.HAIR[Math.floor(r() * K.char.HAIR.length)], hairStyle: styles[Math.floor(r() * styles.length)],
      capColor: ['#3d6b8c', '#b8574a', '#4f7a4a', '#d9a640'][Math.floor(r() * 4)] };
  };
})(typeof window !== 'undefined' ? window : globalThis);
