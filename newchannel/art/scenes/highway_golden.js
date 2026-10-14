/* Ep 001 · the highway world (golden hour; the night scene reuses it with another mood and camera).
   Cars are placed by the IDM run (K.ep1.highway): car i sits at road distance s = x[i]; its brake light is the sim's
   deceleration. The camera is a crane that tracks the mascot's car (smoothed), so free-flowing traffic holds still in
   frame and the jam wave visibly rolls back toward us. */
(function (root) {
  const K = root.K, E = K.ep1;

  // ---------------------------------------------------------------- static scenery (deterministic layout along the road)
  E.scenery = function (seed = 11) {
    const r = K.rng(seed), objs = [];
    // utility poles on the right, every 46 m
    for (let s = -200; s < 5200; s += 46) objs.push({ k: 'pole', s, l: 10.5, h: 9.5 });
    // trees: scattered + clustered groves + windbreak rows
    for (let s = -200; s < 5200; s += 9) {
      if (r() < 0.32) { const side = r() < 0.5 ? -1 : 1, l = side * (9 + Math.pow(r(), 1.8) * 70); objs.push({ k: 'tree', s: s + r() * 8, l, h: 6 + r() * 7, kind: r() < 0.22 ? 'poplar' : 'round', seed: r() * 1e6 | 0 }); }
    }
    for (let g = 0; g < 70; g++) { const s = r() * 5200, side = r() < 0.5 ? -1 : 1, l0 = side * (30 + r() * 140), n = 4 + (r() * 8 | 0);
      for (let i = 0; i < n; i++) objs.push({ k: 'tree', s: s + (r() - 0.5) * 40, l: l0 + (r() - 0.5) * 30, h: 7 + r() * 8, kind: r() < 0.3 ? 'poplar' : 'round', seed: r() * 1e6 | 0 }); }
    for (let s = 0; s < 5200; s += 7) { if (K.vnoise(s * 0.01, 3, 5) > 0.45) objs.push({ k: 'tree', s, l: -165 + (r() - 0.5) * 4, h: 13 + r() * 4, kind: 'poplar', seed: r() * 1e6 | 0 }); }
    for (let s = 0; s < 5200; s += 8) { if (K.vnoise(s * 0.008, 9, 6) > 0.5) objs.push({ k: 'tree', s, l: 210 + (r() - 0.5) * 4, h: 12 + r() * 4, kind: 'poplar', seed: r() * 1e6 | 0 }); }
    // grass tufts along the verges
    for (let s = -200; s < 5200; s += 3.5) { objs.push({ k: 'tuft', s: s + r() * 3, l: (r() < 0.5 ? -1 : 1) * (4.6 + r() * 3.5), h: 0.5 + r() * 0.6, seed: r() * 1e6 | 0 }); }
    // fields: strips beside the road
    const fields = [];
    for (const side of [-1, 1]) {
      let s = -300;
      while (s < 5600) {
        const len = 60 + r() * 150; let l = 5.5;
        for (const w of [10 + r() * 25, 40 + r() * 60, 120 + r() * 200, 600]) {
          fields.push({ s0: s, s1: s + len * (w > 300 ? 2.2 : 1), l0: side * l, l1: side * (l + w), c: r(), rows: r() < 0.45, seed: r() * 1e6 | 0 }); l += w;
        }
        s += len;
      }
    }
    objs.sort((a, b) => a.s - b.s);
    return { objs, fields };
  };

  // ---------------------------------------------------------------- far layers, cached wide
  function farLayers(P, seed, opts) {
    const W = 3000, Hh = 700, out = [];
    const specs = opts.ridges || [
      { y: 640, amp: 150, freq: 0.0021, color: P.far, hazeK: 0.5, seed: seed + 1, oct: 5, peaks: x => 170 * Math.exp(-Math.pow((x - 700) / 230, 2)) + 120 * Math.exp(-Math.pow((x - 2350) / 260, 2)) - 40 * Math.exp(-Math.pow((x - 1550) / 300, 2)) },
      { y: 665, amp: 110, freq: 0.0036, color: P.mid, hazeK: 0.32, seed: seed + 2, oct: 5, peaks: x => -30 * Math.exp(-Math.pow((x - 1550) / 350, 2)) },
      { y: 690, amp: 70, freq: 0.009, color: P.near, hazeK: 0.15, seed: seed + 3, oct: 4, trees: true },
    ];
    for (const sp of specs) {
      const L = K.canvas(W, Hh), c = L.ctx;
      const col = K.mix(sp.color, P.haze, sp.hazeK);
      K.terrain.ridgePath(c, { x0: 0, x1: W, y: sp.y - 40, amp: sp.amp, freq: sp.freq, seed: sp.seed, oct: sp.oct, bottom: Hh, peaks: sp.peaks });
      const g = c.createLinearGradient(0, sp.y - sp.amp - 60, 0, Hh);
      g.addColorStop(0, col); g.addColorStop(0.75, K.mix(col, P.haze, 0.45)); g.addColorStop(1, K.mix(col, P.haze, 0.75));
      c.fillStyle = g; c.fill();
      if (sp.trees) { // tree-bumps on the near ridge
        const r = K.rng(sp.seed);
        c.fillStyle = col;
        for (let x = 0; x < W; x += 6 + r() * 10) {
          const n = K.fbm(x * sp.freq, 0.5, sp.oct, sp.seed), y = sp.y - 40 - (n - 0.35) * sp.amp;
          if (r() < 0.6) { const rr = 5 + r() * 9; K.circle(c, x, y - rr * 0.6, rr); c.fill(); }
        }
      }
      // rim of light along the top (backlit) + texture
      if (P.rim && opts.rim !== false) {
        c.save(); K.terrain.ridgePath(c, { x0: 0, x1: W, y: sp.y - 40, amp: sp.amp, freq: sp.freq, seed: sp.seed, oct: sp.oct, bottom: Hh + 40, peaks: sp.peaks }); c.clip();
        c.globalCompositeOperation = 'screen';
        const rg = c.createLinearGradient(0, sp.y - sp.amp - 80, 0, sp.y + 40); rg.addColorStop(0, K.rgba(P.rim, 0.0)); rg.addColorStop(0.5, K.rgba(P.rim, 0.12)); rg.addColorStop(1, K.rgba(P.rim, 0));
        c.fillStyle = rg; c.fillRect(0, 0, W, Hh); c.restore();
        K.terrain.ridge(c, { x0: 0, x1: W, y: sp.y - 40, amp: sp.amp, freq: sp.freq, seed: sp.seed, oct: sp.oct, bottom: Hh + 40, peaks: sp.peaks, color: 'rgba(0,0,0,0)', rim: P.rim, rimW: 1.6, rimAlpha: 0.55 });
      }
      K.tex.paint(L, { amount: 0.5, mottle: { w: 1000, h: 240, sx: 0.004, sy: 0.05, seed: sp.seed, amp: 40 } });
      out.push({ L, par: sp.par ?? (0.92 + out.length * 0.04) });
    }
    return out;
  }

  function skyLayer(P, opts) {
    const L = K.canvas(K.W + 600, K.H), c = L.ctx;
    const g = c.createLinearGradient(0, 0, 0, opts.horizon + 30);
    P.sky.forEach(([t, col]) => g.addColorStop(t, col)); c.fillStyle = g; c.fillRect(0, 0, L.w, L.h);
    if (opts.clouds !== false) {
      const banks = opts.cloudBanks || [
        [380, 120, 620, 34, '#8c76a6', '#f6b98e', 3], [1180, 70, 760, 40, '#8a74a4', '#f3b08a', 3], [1900, 150, 520, 30, '#937aa6', '#f6be92', 2],
        [760, 250, 420, 20, '#c58fa0', '#ffd6a2', 2], [1640, 290, 360, 16, '#cf95a0', '#ffdcaa', 2], [120, 300, 300, 14, '#c992a2', '#ffd6a2', 1],
      ];
      banks.forEach(([x, y, w, h, col, lit, rows], k) => K.sky.bank(c, x + 300, y, w * 1.1, h * 1.35, { color: col, lit, rows, seed: 30 + k, litAlpha: 0.6, litH: 0.18, top: K.shade(col, -0.12) }));
    }
    K.tex.paint(L, { amount: 0.35, mottle: { w: 1200, h: 540, sx: 0.0025, sy: 0.02, seed: 3, amp: 30 } });
    return L;
  }

  // ---------------------------------------------------------------- the renderer
  E.highwayWorld = function (opts) {
    const P = opts.P, W = { P, opts };
    W.sc = E.scenery(opts.seed || 11);
    W.sky = skyLayer(P, opts);
    W.far = farLayers(P, 20, opts);
    W.road = E.road();
    return W;
  };

  // st: { sCam, lCam, H, pitch, yaw, f, t, brake(i), sun: {az, elev, r}, mascotExpr }
  E.drawHighway = function (ctx, W, st) {
    const P = W.P, o = W.opts, road = W.road, t = st.t;
    const cam = K.persp({ f: st.f, H: st.H, pitch: st.pitch, cy: st.cy ?? K.H / 2 });
    const rig = road.rig(st.sCam, st.lCam, st.yaw || 0);
    const hz = cam.horizon, th0 = road.head(0);
    const yawPx = -(rig.th - th0) * cam.f;
    // sky
    ctx.fillStyle = P.sky[0][1]; ctx.fillRect(0, 0, K.W, K.H);
    ctx.drawImage(W.sky.c, -300 + yawPx * 0.15, hz - (o.horizon || hz));
    // sun / moon
    const sunX = cam.cx + cam.f * Math.tan((st.sun.az + th0) - rig.th), sunY = hz - cam.f * Math.tan(st.sun.elev);
    if (o.night) {
      ctx.save(); ctx.translate(K.W * 0.62, hz * 0.45); ctx.rotate(-0.42); ctx.scale(1, 0.16);   // a faint milky way band
      const mw = ctx.createRadialGradient(0, 0, 0, 0, 0, 900); mw.addColorStop(0, K.rgba('#8c86c8', 0.22)); mw.addColorStop(1, K.rgba('#8c86c8', 0));
      ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = mw; ctx.fillRect(-900, -900, 1800, 1800); ctx.restore();
      K.sky.stars(ctx, { seed: 21, n: 520, y1: hz, t }); K.sky.moon(ctx, sunX, sunY, st.sun.r, { glow: '#8ea4ff' });
    }
    else {
      K.sky.sun(ctx, sunX, sunY, st.sun.r, { core: P.sun, halo: P.halo, glow: st.sun.r * 14, glowAlpha: 0.6, rings: 4, ringStep: 0.9, ringAlpha: 0.07 });
      K.light.haze(ctx, hz - 260, hz - 10, hz + 60, P.haze, 0.55);
    }
    // birds
    if (!o.night) {
      ctx.strokeStyle = K.rgba('#5a3d55', 0.7); ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) { const bx = ((300 + i * 97 + t * (22 + i * 3)) % 2200) - 100 + yawPx * 0.2, by = 210 + i * 23 + Math.sin(t * 0.8 + i) * 8, fl = Math.sin(t * 7 + i * 1.3) * 5, w = 9 - i * 0.6;
        ctx.beginPath(); ctx.moveTo(bx - w, by - fl); ctx.quadraticCurveTo(bx - w * 0.4, by - 3, bx, by); ctx.quadraticCurveTo(bx + w * 0.4, by - 3, bx + w, by - fl); ctx.stroke(); }
    }
    // far ridges (screen layers: shift with yaw only)
    for (const fl of W.far) ctx.drawImage(fl.L.c, -540 + yawPx * fl.par, hz - 700 + 46);
    // ground base
    const gg = ctx.createLinearGradient(0, hz - 2, 0, K.H);
    gg.addColorStop(0, K.mix(P.grassFar || P.grass, P.haze, o.night ? 0.3 : 0.6)); gg.addColorStop(0.18, K.mix(P.grassFar || P.grass, P.haze, 0.25));
    gg.addColorStop(1, P.grass);
    ctx.fillStyle = gg; ctx.fillRect(0, hz - 2, K.W, K.H - hz + 2);
    const fogOf = d => [P.haze, K.clamp(1 - Math.exp(-d / (o.fogDist || 650)), 0, o.night ? 0.75 : 0.92)];
    const camD = (s, l) => { const w = road.world(s, l), c = rig.toCam(w.x, w.z); return c[1]; };
    const sMin = st.sCam + 2, sMax = st.sCam + (o.far || 2600);
    // fields
    const fcols = o.fieldColors || [P.field, P.field2, K.mix(P.field, P.grass, 0.5), K.mix(P.field2, '#c9b46a', 0.4), P.grass, '#c79a5e', '#9b9a62'];
    for (const fd of W.sc.fields) {
      if (fd.s1 < sMin || fd.s0 > sMax) continue;
      const a = Math.max(fd.s0, sMin), b = Math.min(fd.s1, sMax);
      const pts = [];
      const N = Math.max(2, Math.ceil((b - a) / 25));
      for (let i = 0; i <= N; i++) pts.push([a + (b - a) * i / N, fd.l0]);
      for (let i = N; i >= 0; i--) pts.push([a + (b - a) * i / N, fd.l1]);
      const sp = K.groundPoly(road, rig, cam, pts, 1.5); if (!sp) continue;
      const d = camD(a, (fd.l0 + fd.l1) / 2), fog = fogOf(Math.max(d, 1));
      const col = fcols[Math.floor(fd.c * fcols.length)];
      ctx.fillStyle = K.mix(col, fog[0], fog[1]); K.fillPoly(ctx, sp); ctx.fill();
      if (fd.rows && !o.night) {
        ctx.strokeStyle = K.rgba(K.mix(K.shade(col, -0.25), fog[0], fog[1]), 0.45); ctx.lineWidth = 1;
        const nr = Math.min(14, Math.abs(fd.l1 - fd.l0) / 3);
        ctx.beginPath();
        for (let k = 1; k < nr; k++) {
          const l = fd.l0 + (fd.l1 - fd.l0) * k / nr, q = K.groundPoly(road, rig, cam, [[a, l], [(a + b) / 2, l], [b, l]], 1.5);
          if (q) { ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[1][0], q[1][1]); ctx.lineTo(q[2][0], q[2][1]); }
        }
        ctx.stroke();
      }
    }
    // road surface (strip of quads), shoulders, lines
    const strip = (l0, l1, col, fogScale = 1) => {
      let prev = null;
      const step = s => (s - st.sCam < 60 ? 4 : s - st.sCam < 300 ? 12 : 40);
      for (let s = sMin; s < sMax; s += step(s)) {
        const s2 = Math.min(sMax, s + step(s));
        const q = K.groundPoly(road, rig, cam, [[s, l0], [s2, l0], [s2, l1], [s, l1]], 1.5); if (!q) continue;
        const fog = fogOf(camD(s, 0) * fogScale);
        ctx.fillStyle = K.mix(col, fog[0], fog[1]); K.fillPoly(ctx, q); ctx.fill();
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke();
        prev = q;
      }
      return prev;
    };
    strip(-4.6, 4.6, o.night ? '#1d2236' : K.mix(P.road, P.grass, 0.35));
    strip(-3.9, 3.9, P.road);
    // sun sheen on the asphalt (toward the sun, far part of road glows)
    if (!o.night) {
      const g = ctx.createLinearGradient(0, hz, 0, hz + 160);
      g.addColorStop(0, K.rgba(P.halo, 0.55)); g.addColorStop(1, K.rgba(P.halo, 0));
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g;
      const q = K.groundPoly(road, rig, cam, [[st.sCam + 40, -3.9], [st.sCam + 1800, -3.9], [st.sCam + 1800, 3.9], [st.sCam + 40, 3.9]], 1.5);
      if (q) { K.fillPoly(ctx, q); ctx.fill(); } ctx.restore();
    }
    // lane lines
    const lineCol = o.night ? '#6e7090' : P.line;
    for (const l of [-3.55, 3.55]) {
      for (let s = Math.floor(sMin / 4) * 4; s < Math.min(sMax, st.sCam + 900); s += 4) {
        const q = K.groundPoly(road, rig, cam, [[s, l - 0.1], [s + 4.05, l - 0.1], [s + 4.05, l + 0.1], [s, l + 0.1]], 1.5); if (!q) continue;
        const fog = fogOf(camD(s, l)); ctx.fillStyle = K.mix(lineCol, fog[0], fog[1] * 0.8); K.fillPoly(ctx, q); ctx.fill();
      }
    }
    for (let s = Math.floor(sMin / 12) * 12; s < Math.min(sMax, st.sCam + 900); s += 12) {
      const q = K.groundPoly(road, rig, cam, [[s, -0.09], [s + 4, -0.09], [s + 4, 0.09], [s, 0.09]], 1.5); if (!q) continue;
      const fog = fogOf(camD(s, 0)); ctx.fillStyle = K.mix(lineCol, fog[0], fog[1] * 0.8); K.fillPoly(ctx, q); ctx.fill();
    }

    // painterly ground texture (soft, screen-space)
    if (o.groundTex !== false) {
      const m = K.tex.mottleCanvas({ w: 960, h: 300, sx: 0.006, sy: 0.04, seed: 12, amp: 55 });
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = o.night ? 0.3 : 0.45; ctx.drawImage(m.c, 0, hz, K.W, K.H - hz); ctx.restore();
    }
    // ---- objects: scenery + cars, depth-sorted
    const items = [];
    const sunLat = Math.tan(st.sun.az) || 0, shLen = 1 / Math.tan(Math.max(0.05, st.sun.elev));
    const shadows = [];
    for (const ob of W.sc.objs) {
      if (ob.s < sMin - (ob.k === 'tree' ? 120 : 10) || ob.s > sMax) continue;
      if (ob.k === 'tuft' && ob.s > st.sCam + 70) continue;
      const w = road.world(ob.s, ob.l), c = rig.toCam(w.x, w.z);
      if (o.shadows !== false && (ob.k === 'tree' || ob.k === 'pole') && c[1] > -150) shadows.push(ob);
      if (c[1] < 1.5) continue;
      items.push({ ob, d: c[1], X: c[0] });
    }
    const run = st.run, onc = st.onc;
    const wrap = (x, L, lo) => { let v = x; while (v < lo) v += L; while (v >= lo + L) v -= L; return v; };
    if (run) {
      const S = run.at(st.simT ?? t);
      for (let i = 0; i < run.N; i++) {
        const s = wrap(S.x[i], run.p.L, st.sCam - 60);
        if (s < sMin || s > sMax) continue;
        const w = road.world(s, 1.85), c = rig.toCam(w.x, w.z);
        items.push({ car: i, s, d: c[1], X: c[0], v: S.v[i] });
        if (c[1] > -30) shadows.push({ k: 'car', s, l: 1.85, h: 1.3 });
      }
    }
    if (onc) {
      const S = onc.at(st.simT ?? t);
      for (let i = 0; i < onc.N; i++) {
        const s = wrap(-S.x[i] + 5000, onc.p.L, st.sCam - 60);
        if (s < sMin || s > sMax) continue;
        const w = road.world(s, -1.85), c = rig.toCam(w.x, w.z);
        items.push({ onc: i, s, d: c[1], X: c[0] });
        if (c[1] > -30) shadows.push({ k: 'car', s, l: -1.85, h: 1.3 });
      }
    }
    // shadows (ground, multiply)
    if (o.shadows !== false) {
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      for (const sh of shadows) {
        const h = sh.h, L2 = h * shLen, d = camD(sh.s, sh.l), a = (o.shadowAlpha ?? 0.45) * (1 - fogOf(d)[1]);
        ctx.fillStyle = K.rgba(K.mix('#ffffff', P.shadow, 0.6), a);
        const at = (u, dl) => [sh.s - L2 * u, sh.l + dl - L2 * u * sunLat];
        let polys;
        if (sh.k === 'tree') {      // thin trunk shadow, then an elongated canopy blob
          const cw = h * 0.3, ell = [];
          for (let k = 0; k < 14; k++) { const a2 = k / 14 * K.TAU; ell.push(at(0.66 + Math.cos(a2) * 0.32, Math.sin(a2) * cw)); }
          polys = [[at(0, -0.25), at(0, 0.25), at(0.36, 0.2), at(0.36, -0.2)], ell];
        } else if (sh.k === 'pole') polys = [[at(0, -0.15), at(0, 0.15), at(1, 0.12), at(1, -0.12)]];
        else polys = [[at(0, -0.85), at(0, 0.85), at(1, 0.6), at(1, -0.6)]];
        for (const pg of polys) { const q = K.groundPoly(road, rig, cam, pg, 1.5); if (q) { K.fillPoly(ctx, q); ctx.fill(); } }
      }
      ctx.restore();
    }
    items.sort((a, b) => b.d - a.d);
    const lit = { rim: P.rim, shade: P.shadow, ang: o.night ? -1.57 : -2.0 + (st.sun.az * 2), dx: -1, shadeK: o.night ? 0.55 : 0.32, rimAlpha: o.night ? 0.25 : 0.9 };
    const wires = [];
    for (const it of items) {
      const p = cam.proj(it.X, 0, it.d), fog = fogOf(it.d);
      if (p.y < hz - 2) continue;
      if (it.ob) {
        const ob = it.ob;
        if (ob.k === 'tree') {
          const hpx = ob.h * p.s; if (hpx < 1.5) continue;
          const col = K.mix(o.night ? P.near : P.tree, fog[0], fog[1]);
          K.terrain.tree(ctx, p.x, p.y, hpx, { kind: ob.kind, seed: ob.seed, color: col, shade: K.mix(o.night ? '#0a0f22' : P.treeDark, fog[0], fog[1] * 0.9),
            trunk: K.mix(o.night ? '#0a0f22' : '#4a3a3a', fog[0], fog[1]), light: { dx: -0.4, back: 0.75, rim: o.night ? null : K.mix(P.rim, fog[0], fog[1] * 0.5) } });
        } else if (ob.k === 'pole') {
          const hpx = ob.h * p.s; if (hpx < 2) continue;
          const arms = K.terrain.pole(ctx, p.x, p.y, hpx, { color: K.mix(o.night ? '#0d1226' : '#3b2a2e', fog[0], fog[1]), rim: o.night ? null : P.rim, dx: -1 });
          wires.push({ s: ob.s, arms, d: it.d });
        } else if (ob.k === 'tuft') {
          const hpx = ob.h * p.s; if (hpx < 2) continue;
          K.terrain.tuft(ctx, p.x, p.y, hpx, K.mix(o.night ? '#0e1630' : K.shade(P.grass, -0.25), fog[0], fog[1]), { seed: ob.seed, n: 6, rim: o.night ? null : P.rim, wind: Math.sin(t * 2 + ob.s) * 0.15 });
        }
      } else if (it.car !== undefined) {
        const i = it.car, pe = E.persona(i), isM = i === E.MASCOT;
        const bob = it.v > 0.5 ? Math.sin(t * 9 + i * 1.7) * 0.025 : 0;
        K.car.rear(ctx, p.x, p.y, p.s, { color: isM ? K.TEAL : pe.color, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, capColor: pe.capColor,
          mascot: isM, brake: st.brake(i), tail: o.night ? 1 : 0, fog: [fog[0], fog[1] * (o.night ? 0.6 : 1)], lit, bob, glowScale: st.glowScale || (o.night ? 7 : 5) });
      } else if (it.onc !== undefined) {
        const pe = E.persona(100 + it.onc);
        K.car.front(ctx, p.x, p.y, p.s, { color: pe.color, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, capColor: pe.capColor,
          fog: [fog[0], fog[1] * (o.night ? 0.6 : 1)], lit, head: o.night ? 1 : 0.35, glowScale: o.night ? 2.2 : 0.8, expr: 'content' });
      }
    }
    // wires between consecutive poles
    wires.sort((a, b) => a.s - b.s);
    for (let k = 0; k < wires.length - 1; k++) {
      const a = wires[k], b = wires[k + 1]; if (b.s - a.s > 50) continue;
      const fog = fogOf(a.d);
      for (let j = 0; j < 2; j++) K.terrain.wire(ctx, a.arms[j], b.arms[j], 6 * Math.min(3, 30 / Math.max(5, a.d)) + 2, K.rgba(K.mix(o.night ? '#1a2040' : '#3a2a35', fog[0], fog[1]), 0.8), Math.max(0.6, 1.4 * 20 / Math.max(10, a.d)));
    }
    return { cam, rig, sunX, sunY, hz };
  };

  // ---------------------------------------------------------------- the golden-hour wide shot
  const GOLD = { sCamOff: -31, lCam: 0.4 };
  let Wg = null;
  E.goldenState = function (t) {
    const run = E.highway();
    return {
      t, simT: t, run, onc: E.oncoming(), sCam: E.camS(t) + GOLD.sCamOff, lCam: GOLD.lCam + Math.sin(t * 0.3) * 0.15,
      H: 8.2 + t * 0.12, pitch: 0.068 + t * 0.002, yaw: -0.012 + Math.sin(t * 0.2) * 0.004, f: 1600 + 420 * K.ease.sine(K.clamp(t / 6.5)),
      sun: { az: 0.035, elev: 0.095, r: 42 }, brake: i => run.brake(i, t),
    };
  };
  E.drawGolden = function (ctx, t, frame) {
    if (!Wg) Wg = E.highwayWorld({ P: E.PAL.golden, horizon: 470 });
    const st = E.goldenState(t), P = E.PAL.golden;
    const g = E.drawHighway(ctx, Wg, st);
    // light: god rays + motes + warm grade
    K.light.rays(ctx, g.sunX, g.sunY, { n: 11, spread: 2.3, angle: Math.PI / 2, len: 1500, width: 0.05, alpha: 0.10, color: '#ffe0a0', t, seed: 5 });
    K.sky.wash(ctx, g.sunX, g.sunY, 700, '#ffb070', 0.28);
    K.particles.motes(ctx, t, { n: 50, seed: 7, x0: 0, x1: K.W, y0: 120, y1: 900, color: '#ffe6b0', alpha: 0.55, size: 2.2, vx: 6, vy: -3 });
    K.light.grade(ctx, P.grade, 0.22, 'soft-light');
    K.light.grade(ctx, '#3a2050', 0.10, 'multiply');
    return g;
  };

  K.scene('highway_golden', {
    setup() { E.highway(); E.oncoming(); },
    draw(ctx, t, frame) { E.drawGolden(ctx, t, frame); },
    post: { grain: 0.13, vignette: 0.45, vignetteColor: '#2a1330', bloom: 0.25 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
