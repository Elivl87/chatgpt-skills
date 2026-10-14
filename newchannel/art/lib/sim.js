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
