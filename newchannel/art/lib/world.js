/* Diez Mil Puntos art kit · world: pinhole perspective camera over a ground plane, roads defined by distance along
   the road (s) and lateral offset (l), a slow cinematic camera, and particles. Everything a sim says in metres
   (car i is at s = x[i]) can be placed on screen with road.toCam(s, l) -> cam.proj(...). */
(function (root) {
  const K = root.K;

  // ---------------------------------------------------------------- perspective camera
  // camera at height H looking along +Z, pitched down by `pitch` rad. f = focal length in px.
  K.persp = function (o) {
    const cp = Math.cos(o.pitch), sp = Math.sin(o.pitch), cx = o.cx ?? K.W / 2, cy = o.cy ?? K.H / 2, f = o.f, H = o.H;
    return {
      f, H, cx, cy, pitch: o.pitch, horizon: cy - f * Math.tan(o.pitch),
      proj(X, Y, Z) {             // camera-space X right, Y up from the ground, Z forward
        const vy = Y - H, d = Z * cp - vy * sp, up = vy * cp + Z * sp;
        return { x: cx + f * X / d, y: cy - f * up / d, s: f / d, d };
      },
    };
  };

  // ---------------------------------------------------------------- road
  // heading(s) = sum of a*sin(2*pi*s/period + phase); sampled every `ds` metres from s=-200 to len
  K.road = function (o) {
    const ds = o.ds || 2, s0 = o.s0 ?? -400, n = Math.ceil(((o.len || 4000) - s0) / ds) + 1, curves = o.curves || [];
    const X = new Float64Array(n), Z = new Float64Array(n), TH = new Float64Array(n);
    const head = s => curves.reduce((acc, [a, p, ph]) => acc + a * Math.sin(K.TAU * s / p + (ph || 0)), o.heading0 || 0);
    let x = 0, z = 0;
    // integrate from s=0 both ways so that s=0 is at the origin
    const i0 = Math.round(-s0 / ds);
    X[i0] = 0; Z[i0] = 0; TH[i0] = head(0);
    for (let i = i0 + 1; i < n; i++) { const s = s0 + i * ds, th = head(s - ds / 2); x += Math.sin(th) * ds; z += Math.cos(th) * ds; X[i] = x; Z[i] = z; TH[i] = head(s); }
    x = 0; z = 0;
    for (let i = i0 - 1; i >= 0; i--) { const s = s0 + i * ds, th = head(s + ds / 2); x -= Math.sin(th) * ds; z -= Math.cos(th) * ds; X[i] = x; Z[i] = z; TH[i] = head(s); }
    const R = { ds, s0, n, X, Z, TH, len: o.len || 4000, head };
    R.at = function (s) {           // world position + heading at road distance s (linear interp)
      const k = K.clamp((s - s0) / ds, 0, n - 1.0001), k0 = Math.floor(k), w = k - k0;
      return { x: X[k0] + (X[k0 + 1] - X[k0]) * w, z: Z[k0] + (Z[k0 + 1] - Z[k0]) * w, th: TH[k0] + (TH[k0 + 1] - TH[k0]) * w };
    };
    R.world = function (s, l) {     // l > 0 = right of the direction of travel
      const p = R.at(s); return { x: p.x + Math.cos(p.th) * l, z: p.z - Math.sin(p.th) * l, th: p.th };
    };
    // camera rig placed on the road: at road distance sc, lateral lc, extra yaw. Returns toCam(worldX, worldZ)
    R.rig = function (sc, lc, yaw = 0) {
      const p = R.world(sc, lc), th = p.th + yaw, c = Math.cos(th), sn = Math.sin(th);
      return { th, px: p.x, pz: p.z, toCam(wx, wz) { const dx = wx - p.x, dz = wz - p.z; return [dx * c - dz * sn, dx * sn + dz * c]; } };
    };
    return R;
  };

  // project a ground polygon given as [[s, l], ...] road coords; returns screen points or null if behind the camera
  // (clipped against the near plane Z = near, so long shadows reaching behind the camera never pop)
  K.groundPoly = function (road, rig, cam, pts, near = 1.0, Y = 0) {
    const cp = pts.map(([s, l]) => { const w = road.world(s, l); return rig.toCam(w.x, w.z); });
    const cl = [];
    for (let i = 0; i < cp.length; i++) {
      const a = cp[i], b = cp[(i + 1) % cp.length], ain = a[1] >= near, bin = b[1] >= near;
      if (ain) cl.push(a);
      if (ain !== bin) { const u = (near - a[1]) / (b[1] - a[1]); cl.push([a[0] + (b[0] - a[0]) * u, near]); }
    }
    if (cl.length < 3) return null;
    return cl.map(c => { const p = cam.proj(c[0], Y, c[1]); return [p.x, p.y]; });
  };
  K.fillPoly = function (ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); };

  // ---------------------------------------------------------------- slow camera (2D frame moves for flat scenes)
  // keys: [{t, x, y, z (zoom), r (roll)}], eased; plus a breathing drift
  K.camera2d = function (keys, o = {}) {
    return function (t) {
      let a = keys[0], b = keys[keys.length - 1];
      for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i].t && t <= keys[i + 1].t) { a = keys[i]; b = keys[i + 1]; }
      const u = a === b ? 0 : (o.ease || K.ease.sine)(K.inv(a.t, b.t, t));
      const d = o.drift ?? 1;
      return {
        x: K.lerp(a.x || 0, b.x || 0, u) + Math.sin(t * 0.37 + 1.3) * 4 * d, y: K.lerp(a.y || 0, b.y || 0, u) + Math.sin(t * 0.29) * 3 * d,
        z: K.lerp(a.z || 1, b.z || 1, u) * (1 + Math.sin(t * 0.21) * 0.004 * d), r: K.lerp(a.r || 0, b.r || 0, u),
      };
    };
  };
  K.applyCam = function (ctx, cam, parallax = 1, cx = K.W / 2, cy = K.H / 2) {
    const z = 1 + (cam.z - 1) * parallax;
    ctx.translate(cx, cy); ctx.rotate(cam.r * parallax); ctx.scale(z, z); ctx.translate(-cx - cam.x * parallax, -cy - cam.y * parallax);
  };

  // ---------------------------------------------------------------- particles (pure functions of time)
  K.particles = {};
  // floating motes in light: drift + twinkle; region {x0,y0,x1,y1}
  K.particles.motes = function (ctx, t, o = {}) {
    const r = K.rng(o.seed || 101), n = o.n || 60, x0 = o.x0 ?? 0, x1 = o.x1 ?? K.W, y0 = o.y0 ?? 0, y1 = o.y1 ?? K.H;
    ctx.save(); ctx.globalCompositeOperation = o.mode || 'screen';
    for (let i = 0; i < n; i++) {
      const bx = r(), by = r(), sp = 0.3 + r(), ph = r() * 100, size = (o.size || 2.4) * (0.4 + r() * r() * 2.2);
      const vx = (o.vx ?? 8) * sp, vy = (o.vy ?? -4) * sp;
      const w = x1 - x0, h = y1 - y0;
      let x = x0 + ((bx * w + vx * t + Math.sin(t * 0.7 * sp + ph) * 14) % w + w) % w;
      let y = y0 + ((by * h + vy * t + Math.cos(t * 0.5 * sp + ph) * 10) % h + h) % h;
      const tw = 0.5 + 0.5 * Math.sin(t * (1.5 + sp * 2) + ph);
      const a = (o.alpha || 0.6) * (0.3 + 0.7 * tw);
      if (size > 4) { // bokeh disc
        ctx.fillStyle = K.rgba(o.color || '#ffe7b0', a * 0.35); K.circle(ctx, x, y, size); ctx.fill();
        ctx.strokeStyle = K.rgba(o.color || '#ffe7b0', a * 0.25); ctx.lineWidth = 1.2; ctx.stroke();
      } else { K.light.glow(ctx, x, y, size * 3, o.color || '#ffe7b0', a, 'screen'); ctx.fillStyle = K.rgba(o.color || '#fff4d8', a); K.circle(ctx, x, y, size * 0.6); ctx.fill(); }
    }
    ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
