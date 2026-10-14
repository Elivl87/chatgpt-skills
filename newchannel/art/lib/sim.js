/* Diez Mil Puntos art kit · sim: Intelligent Driver Model (Treiber, Hennecke & Helbing 2000) on a closed lane.
   The art is a skin over this: every illustrated car position, speed, brake light and the mascot's reactions are read
   from these arrays. Deterministic: fixed dt, no randomness except an optional seeded initial jitter.

   const run = K.sim.ring({ N: 22, L: 230, duration: 20, fps: 30, timeScale: 1, preroll: 5,
                            taps: [{ car: 0, t: 1.0, dur: 2.0, decel: 4 }] });
   run.at(t)  -> { x: Float64Array(N) unwrapped metres, v, a }   (t in video seconds, linear interpolation)
   run.brake(i, t)  -> 0..1 brake-light intensity (decelerating or held stopped), smoothed + hysteresis-free
*/
(function (root) {
  const K = root.K;
  K.sim = {};

  K.sim.idmAcc = function (p, x, v, out) {
    const N = x.length;
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      let gap = x[j] - x[i]; gap = ((gap % p.L) + p.L) % p.L - p.carLen;
      const dv = v[i] - v[j];
      const sStar = p.s0 + Math.max(0, v[i] * p.T + v[i] * dv / (2 * Math.sqrt(p.a * p.b)));
      out[i] = p.a * (1 - Math.pow(v[i] / p.v0[i], p.delta) - Math.pow(sStar / Math.max(gap, 0.1), 2));
    }
    return out;
  };

  K.sim.equilibrium = function (p) {
    const gap = p.L / p.N - p.carLen; let lo = 0, hi = p.v0[0];
    for (let k = 0; k < 60; k++) {
      const v = (lo + hi) / 2, f = 1 - Math.pow(v / p.v0[0], p.delta) - Math.pow((p.s0 + v * p.T) / gap, 2);
      if (f > 0) lo = v; else hi = v;
    }
    return lo;
  };

  K.sim.ring = function (o) {
    const p = Object.assign({ N: 22, L: 230, carLen: 4.5, v0: 15, T: 0.7, a: 1.5, b: 1.5, s0: 1.5, delta: 4,
      dt: 0.02, timeScale: 1, fps: 30, preroll: 5, duration: 20, taps: [], jitter: 0, seed: 7 }, o);
    const N = p.N;
    p.v0 = Array.isArray(p.v0) ? p.v0 : new Array(N).fill(p.v0);
    const vEq = K.sim.equilibrium(p);
    const rng = K.rng(p.seed);
    let x = new Float64Array(N), v = new Float64Array(N), acc = new Float64Array(N);
    for (let i = 0; i < N; i++) { x[i] = i * p.L / N + (p.jitter ? (rng() - 0.5) * p.jitter : 0); v[i] = vEq; }
    const nPre = Math.round(p.preroll * p.fps), n = nPre + Math.round(p.duration * p.fps) + 2;
    const spf = Math.max(1, Math.round(p.timeScale / p.fps / p.dt));
    const dt = p.timeScale / p.fps / spf;
    const X = [], V = [], A = [];
    let tSim = 0;
    const af = new Float64Array(N);
    for (let f = 0; f < n; f++) {
      af.fill(0);
      for (let s = 0; s < spf; s++) {
        K.sim.idmAcc(p, x, v, acc);
        const tv = tSim / p.timeScale - p.preroll;          // video-time of this step
        for (const tp of p.taps) if (tv >= tp.t && tv < tp.t + tp.dur) acc[tp.car] = Math.min(acc[tp.car], -tp.decel);
        for (let i = 0; i < N; i++) {
          const vn = Math.max(0, v[i] + acc[i] * dt);
          x[i] += (v[i] + vn) / 2 * dt;
          const ai = (vn - v[i]) / dt;
          if (ai < af[i]) af[i] = ai;
          v[i] = vn;
        }
        tSim += dt;
      }
      X.push(Float64Array.from(x)); V.push(Float64Array.from(v)); A.push(Float64Array.from(af));
    }
    const run = { p, vEq, X, V, A, nPre, fps: p.fps, N };
    const idx = t => K.clamp(t * p.fps + nPre, 0, n - 1.001);
    run.at = function (t) {
      const k = idx(t), k0 = Math.floor(k), w = k - k0, k1 = Math.min(k0 + 1, n - 1);
      const xo = new Float64Array(N), vo = new Float64Array(N), ao = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        xo[i] = X[k0][i] * (1 - w) + X[k1][i] * w; vo[i] = V[k0][i] * (1 - w) + V[k1][i] * w; ao[i] = A[k0][i] * (1 - w) + A[k1][i] * w;
      }
      return { x: xo, v: vo, a: ao };
    };
    // brake light: on while decelerating harder than thr or (almost) stopped; eased over ~0.15 s so it never flickers
    run.brakeRaw = (i, k) => {
      const a = A[k][i], vv = V[k][i];
      return Math.max(K.smooth(-0.25, -0.9, a), vv < 1.0 ? K.smooth(1.0, 0.3, vv) : 0);
    };
    run.brake = function (i, t) {
      const k = Math.round(idx(t)); let m = 0, wsum = 0;
      for (let d = -4; d <= 1; d++) {
        const kk = K.clamp(k + d, 0, n - 1), w = d <= 0 ? 1 : 0.6;
        m += run.brakeRaw(i, kk) * w; wsum += w;
      }
      return K.clamp(m / wsum * 1.35);
    };
    // brake onset events (video seconds) for sonification / reactions
    run.onsets = function (i, from = -1e9, to = 1e9) {
      const out = []; let on = false;
      for (let k = 0; k < n; k++) {
        const b = run.brakeRaw(i, k), t = (k - nPre) / p.fps;
        if (!on && b > 0.6) { on = true; if (t >= from && t <= to) out.push(t); }
        else if (on && b < 0.2) on = false;
      }
      return out;
    };
    return run;
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ---- v2: an open lane that queues at a booth (toll plaza). Each car follows its leader with the IDM; the first car
   that has not paid also sees the closed barrier at the booth (a standing virtual leader at x = G). Once it has stood
   at the barrier for its service time (seeded, 2.5-5.5 s) the barrier opens for it. Deterministic, fixed dt.
     const q = K.sim.queue({ N: 12, G: 0, start: -14, gap: 9, v: 6, seed: 3, duration: 30, fps: 30, timeScale: 1 });
     q.at(t) -> { x, v, a, paid }   q.brake(i, t)   q.service(t) -> { car, since, left } (who is at the booth) */
(function (root) {
  const K = root.K;
  K.sim.queue = function (o) {
    const p = Object.assign({ N: 12, G: 0, start: -14, gap: 9, v: 6, v0: 13, T: 1.2, a: 1.2, b: 2.0, s0: 1.6, delta: 4, carLen: 4.5,
      dt: 0.02, fps: 30, timeScale: 1, preroll: 6, duration: 30, seed: 3, ts: [2.5, 5.5] }, o);
    const N = p.N, r = K.rng(p.seed);
    const x = new Float64Array(N), v = new Float64Array(N), paid = new Uint8Array(N), ts = new Float64Array(N), since = new Float64Array(N).fill(-1);
    for (let i = 0; i < N; i++) { x[i] = p.start - i * p.gap - (i ? r() * p.gap * 0.6 : 0); v[i] = p.v * (0.6 + r() * 0.4); ts[i] = p.ts[0] + r() * (p.ts[1] - p.ts[0]); }
    const idm = (vi, gap, dv) => { const ss = p.s0 + Math.max(0, vi * p.T + vi * dv / (2 * Math.sqrt(p.a * p.b))); return p.a * (1 - Math.pow(vi / p.v0, p.delta) - Math.pow(ss / Math.max(gap, 0.1), 2)); };
    const nPre = Math.round(p.preroll * p.fps), n = nPre + Math.round(p.duration * p.fps) + 2;
    const spf = Math.max(1, Math.round(p.timeScale / p.fps / p.dt)), dt = p.timeScale / p.fps / spf;
    const X = [], V = [], A = [], PAID = [], SRV = [];
    let tS = 0; const acc = new Float64Array(N), af = new Float64Array(N);
    for (let f = 0; f < n; f++) {
      af.fill(0);
      for (let s = 0; s < spf; s++) {
        let head = -1; for (let i = 0; i < N; i++) if (!paid[i]) { head = i; break; }
        for (let i = 0; i < N; i++) {
          let ai = i > 0 ? idm(v[i], x[i - 1] - x[i] - p.carLen, v[i] - v[i - 1]) : p.a * (1 - Math.pow(v[i] / p.v0, p.delta));
          if (i === head) ai = Math.min(ai, idm(v[i], p.G - x[i] - 0.3, v[i]));
          acc[i] = Math.max(-9, ai);
        }
        for (let i = 0; i < N; i++) { const vn = Math.max(0, v[i] + acc[i] * dt); x[i] += (v[i] + vn) / 2 * dt; const a2 = (vn - v[i]) / dt; if (a2 < af[i]) af[i] = a2; v[i] = vn; }
        tS += dt;
        if (head >= 0 && p.G - x[head] < p.s0 + 1.0 && v[head] < 0.35) { if (since[head] < 0) since[head] = tS; if (tS - since[head] >= ts[head]) paid[head] = 1; }
      }
      X.push(Float64Array.from(x)); V.push(Float64Array.from(v)); A.push(Float64Array.from(af)); PAID.push(Uint8Array.from(paid)); SRV.push(Float64Array.from(since));
    }
    const q = { p, N, X, V, A, nPre };
    const idx = t => K.clamp(t / p.timeScale * p.fps + nPre, 0, n - 1.001);
    q.at = function (t) {
      const k = idx(t), k0 = Math.floor(k), w = k - k0, k1 = Math.min(k0 + 1, n - 1), xo = new Float64Array(N), vo = new Float64Array(N);
      for (let i = 0; i < N; i++) { xo[i] = X[k0][i] * (1 - w) + X[k1][i] * w; vo[i] = V[k0][i] * (1 - w) + V[k1][i] * w; }
      return { x: xo, v: vo, a: A[k0], paid: PAID[k0] };
    };
    q.brakeRaw = (i, k) => Math.max(K.smooth(-0.25, -0.9, A[k][i]), V[k][i] < 1.0 ? K.smooth(1.0, 0.3, V[k][i]) : 0);
    q.brake = function (i, t) { const k = Math.round(idx(t)); let m = 0, ws = 0; for (let d = -4; d <= 1; d++) { const kk = K.clamp(k + d, 0, n - 1), w = d <= 0 ? 1 : 0.6; m += q.brakeRaw(i, kk) * w; ws += w; } return K.clamp(m / ws * 1.35); };
    // who is at the booth right now, for how long (seconds of service) and when the last car left
    q.service = function (t) {
      const k = Math.round(idx(t)), tNow = (k) / p.fps * p.timeScale; let car = -1;
      for (let i = 0; i < N; i++) if (!PAID[k][i]) { car = i; break; }
      const st = car >= 0 ? SRV[k][car] : -1;
      let left = -1; for (let i = N - 1; i >= 0; i--) if (PAID[k][i]) { left = i; break; }
      let tLeft = -1; if (left >= 0) { for (let kk = k; kk > 0; kk--) if (!PAID[kk][left]) { tLeft = (k - kk) / p.fps * p.timeScale; break; } }
      return { car, since: st >= 0 ? tNow - st : -1, left, sinceLeft: tLeft };
    };
    return q;
  };
})(typeof window !== 'undefined' ? window : globalThis);
