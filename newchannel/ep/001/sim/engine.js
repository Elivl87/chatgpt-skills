/* Ep 001 · simulation engine (extends the art kit's IDM, art/lib/sim.js).
   Load order (browser, as plain <script>s, or node via load.mjs): art/lib/core.js, art/lib/sim.js, this file, states.js.

   What it adds to K.sim.ring (which stays untouched and is cross-checked in validate.mjs):
   - per-car drivers (each car its own IDM parameters, or a controller), so Eli can be a gap-closer and one car can be
     the patient car;
   - an optional reaction delay tau per driver (delayed perception of gap and closing speed, Treiber-Kesting-Helbing
     "human driver model" idea) and seeded acceleration noise (Ornstein-Uhlenbeck), for the spontaneous jams of the
     ring experiments;
   - controllers: FollowerStopper (Bhadani et al. 2018, used in Stern et al. 2018) with a target speed U that can be the
     moving average of the traffic; a "human patient driver" (holds a target speed with a slow human lag, brakes only
     when safety demands it); and a jam-absorbing driver (Nishi et al. 2013 idea: let the gap shrink, never chase);
   - open roads (a free front car), a toll booth (virtual standing leader until the car has paid), scheduled changes
     (control on/off, the knob), and a recorder with the SAME interface as K.sim.ring runs:
       run.at(t) -> {x, v, a}   run.brake(i, t)   run.onsets(i, from, to)   run.N   run.p
     where t is VIDEO seconds (t_sim = simT0 + t * timeScale; timeScale is the ACELERADO factor).
   Convention (same as the kit): the leader of car i is car i+1 (so "k cars behind car i" is car i-k); on a ring the
   leader of car N-1 is car 0; on an open road car N-1 is the front car. Units: metres, seconds, m/s, m/s^2. Deterministic: fixed dt, all
   randomness from K.rng(seed). No wall clock. */
(function (root) {
  const K = root.K;
  const S = K.ep1sim = K.ep1sim || {};
  S.states = S.states || {};

  // ------------------------------------------------------------------ helpers
  S.gauss = function (r) {                                   // standard normal from a K.rng stream (Box-Muller)
    let u = r(); if (u < 1e-12) u = 1e-12;
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(K.TAU * r());
  };
  S.KMH = 3.6;
  S.BOOTH_IDM = { a: 1.0, b: 2.0, T: 1.0, s0: 2.0, v0: 15, delta: 4 };   // how controllers stop at a toll barrier
  S.idm = function (d, v, gap, dv) {                         // IDM acceleration; dv = v - v_leader (closing speed)
    const sStar = d.s0 + Math.max(0, v * d.T + v * dv / (2 * Math.sqrt(d.a * d.b)));
    return d.a * (1 - Math.pow(Math.max(v, 0) / d.v0, d.delta || 4) - Math.pow(sStar / Math.max(gap, 0.05), 2));
  };
  S.idmEq = function (d, gap) {                              // equilibrium speed of an IDM driver at a given gap
    let lo = 0, hi = d.v0;
    for (let k = 0; k < 60; k++) { const v = (lo + hi) / 2; if (S.idm(d, v, gap, 0) > 0) lo = v; else hi = v; }
    return lo;
  };
  S.idmEqGap = function (d, v) {                             // gap at which an IDM driver cruises at speed v
    const q = 1 - Math.pow(v / d.v0, d.delta || 4); return q <= 0 ? Infinity : (d.s0 + v * d.T) / Math.sqrt(q);
  };
  // FollowerStopper command velocity (Bhadani et al. 2018). dx: gap (m), v: own speed, vl: leader speed, U: target.
  S.fsCmd = function (c, dx, v, vl, U) {
    const dvm = Math.min(vl - v, 0), r = Math.min(Math.max(vl, 0), U);
    const x1 = c.dx0[0] + dvm * dvm / (2 * c.d[0]), x2 = c.dx0[1] + dvm * dvm / (2 * c.d[1]), x3 = c.dx0[2] + dvm * dvm / (2 * c.d[2]);
    if (dx <= x1) return 0;
    if (dx <= x2) return r * (dx - x1) / (x2 - x1);
    if (dx <= x3) return r + (U - r) * (dx - x2) / (x3 - x2);
    return U;
  };

  // ------------------------------------------------------------------ the simulator
  /* spec: {
       id, seed, geometry: 'ring' | 'open', L (ring), N, carLen,
       x0: [] initial positions (ascending with index), v0init: [] initial speeds,
       drivers: [] per car: { kind: 'idm', a, b, T, s0, v0, delta, tau, noise, noiseTc }
                          | { kind: 'fs', U, Usrc: 'fixed'|'avgAll'|'emaLeader', Uwin, Ufactor, dx0, d, kp, amax, bmax, safety }
                          | { kind: 'human_patient', U, Usrc: 'prevLap'|'avgAll'|'emaLeader', lag, wobble, safety }
                          | { kind: 'absorb', ema, amax, bsoft, safety }   (all controllers fall back to IDM 'safety')
       front: { kind: 'free' } | { kind: 'const', v } (open road only),
       booth: { G, service: [lo, hi] } (open road: a toll barrier at x = G),
       taps: [{ car, t (sim s), dur, decel }], schedule: [{ t (sim s), car, set: {...driver fields} }],
       dt, tEnd (sim s), recDt, timeScale (ACELERADO), simT0 (sim time at video t = 0), vStop }
  */
  S.simulate = function (spec) {
    const p = Object.assign({ geometry: 'ring', carLen: 4.5, dt: 0.05, recDt: 0.1, timeScale: 1, simT0: 0, vStop: 0.3,
      taps: [], schedule: [], seed: 1, front: { kind: 'free' } }, spec);
    const N = p.N, dt = p.dt, L = p.L, ring = p.geometry === 'ring', len = p.carLen;
    const rng = K.rng(p.seed);
    const drv = p.drivers.map(d => Object.assign({}, d));
    const x = Float64Array.from(p.x0), v = Float64Array.from(p.v0init);
    const acc = new Float64Array(N), noise = new Float64Array(N), panicUntil = new Float64Array(N).fill(-1), holdUntil = new Float64Array(N).fill(-1);
    // delayed perception: ring buffers of gap and leader speed (per car), sized for the largest tau
    const maxTau = Math.max(0, ...drv.map(d => d.tau || 0), ...p.schedule.map(e => (e.set && e.set.tau) || 0));
    const H = Math.max(1, Math.round(maxTau / dt) + 2);
    const histGap = new Float64Array(H * N), histVl = new Float64Array(H * N), histV = new Float64Array(H * N);
    let hHead = 0;
    // controller state
    const Ust = new Float64Array(N), lapStart = new Float64Array(N), lapSum = new Float64Array(N), lapX = new Float64Array(N);
    const paid = new Uint8Array(N), since = new Float64Array(N).fill(-1), serv = new Float64Array(N);
    if (p.booth) for (let i = 0; i < N; i++) serv[i] = p.booth.service[0] + rng() * (p.booth.service[1] - p.booth.service[0]);
    let vmEma = 0; for (let i = 0; i < N; i++) vmEma += v[i] / N;      // moving average of the mean traffic speed
    for (let i = 0; i < N; i++) { Ust[i] = drv[i].U || v[i]; lapX[i] = x[i]; }
    const nSteps = Math.round(p.tEnd / dt), recEvery = Math.max(1, Math.round(p.recDt / dt)), nRec = Math.floor(nSteps / recEvery) + 1;
    const X = new Float32Array(nRec * N), V = new Float32Array(nRec * N), A = new Float32Array(nRec * N), AMIN = new Float32Array(nRec * N);
    const amin = new Float64Array(N).fill(0), aSum = new Float64Array(N);
    let rec = 0, minGap = Infinity, minGapAt = null;
    const sched = p.schedule.slice().sort((a, b) => a.t - b.t); let si = 0;
    const leaderOf = i => (ring ? (i + 1) % N : (i + 1 < N ? i + 1 : -1));
    const gapOf = i => {
      const j = leaderOf(i); if (j < 0) return Infinity;
      let g = x[j] - x[i]; if (ring) { g = ((g % L) + L) % L; if (g === 0 && N > 1) g = L; }
      return g - len;
    };
    const record = () => {
      const o = rec * N;
      for (let i = 0; i < N; i++) { X[o + i] = x[i]; V[o + i] = v[i]; A[o + i] = aSum[i] / recEvery; AMIN[o + i] = amin[i]; }
      rec++; amin.fill(0); aSum.fill(0);
    };
    // initial history fill
    for (let h = 0; h < H; h++) for (let i = 0; i < N; i++) { const j = leaderOf(i); histGap[h * N + i] = gapOf(i); histVl[h * N + i] = j >= 0 ? v[j] : v[i]; histV[h * N + i] = v[i]; }
    // first record (t = 0): accelerations unknown yet -> 0
    { const o = 0; for (let i = 0; i < N; i++) { X[o + i] = x[i]; V[o + i] = v[i]; } rec = 1; }
    const tauSteps = d => Math.min(H - 1, Math.round((d.tau || 0) / dt));
    for (let step = 0; step < nSteps; step++) {
      const t = step * dt;
      while (si < sched.length && sched[si].t <= t) {
        const e = sched[si++]; Object.assign(drv[e.car], e.set);
        if (e.set.Ureset) Ust[e.car] = e.set.Ureset;           // explicit target
        else if (e.set.kind && e.set.kind !== 'idm') Ust[e.car] = vmEma;   // a controller starts from the recent average
        if (e.set.kind) { lapStart[e.car] = t; lapX[e.car] = x[e.car]; lapSum[e.car] = 0; }
      }
      // history push
      hHead = (hHead + 1) % H;
      for (let i = 0; i < N; i++) { const j = leaderOf(i); histGap[hHead * N + i] = gapOf(i); histVl[hHead * N + i] = j >= 0 ? v[j] : (p.front.kind === 'const' ? p.front.v : v[i]); histV[hHead * N + i] = v[i]; }
      // average traffic speed (for 'avgAll' targets): exponential moving average of the mean speed
      let vm = 0; for (let i = 0; i < N; i++) vm += v[i]; vm /= N;
      vmEma += (vm - vmEma) * dt / 60;                       // 60 s moving average of the mean traffic speed
      for (let i = 0; i < N; i++) {
        const d = drv[i], j = leaderOf(i);
        const gNow = gapOf(i), vl = j >= 0 ? v[j] : (p.front.kind === 'const' ? p.front.v : 1e9);
        let a;
        if (d.kind === 'idm') {
          const k = tauSteps(d);
          if (k > 0) {
            const hh = ((hHead - k) % H + H) % H;
            const gD = histGap[hh * N + i], vlD = histVl[hh * N + i], vD = histV[hh * N + i];
            // perceived now: delayed gap/leader speed, extrapolated by the own (felt) speed change since then
            const gP = gD - (v[i] - vD) * (d.tau || 0) * 0.5;
            a = j >= 0 ? S.idm(d, v[i], gP, v[i] - vlD) : d.a * (1 - Math.pow(v[i] / d.v0, d.delta || 4));
            // emergency reflex (no delay): only bites below ~a quarter of the normal time gap; keeps delayed drivers
            // collision-free, as real drivers stamp on the brake when a crash is imminent
            if (j >= 0) a = Math.min(a, S.idm(Object.assign({}, d, { T: d.T * (d.emT ?? 0.25), s0: d.s0 * 0.5 }), v[i], gNow, v[i] - vl));
          } else {
            a = j >= 0 ? S.idm(d, v[i], gNow, v[i] - vl) : d.a * (1 - Math.pow(v[i] / d.v0, d.delta || 4));
          }
          if (d.panicThr) {                                  // over-reaction: once the needed braking passes panicThr, the
            if (panicUntil[i] < t && a < -d.panicThr) panicUntil[i] = t + d.panicHold;   // driver stamps on the brake
            if (panicUntil[i] >= t) a = Math.min(a, -d.panicDecel);                      // for panicHold seconds
          }
          if (d.holdAfterStop) {                             // once stopped, stays stopped holdAfterStop seconds
            if (holdUntil[i] < 0 && v[i] < 0.05 && t > 1) holdUntil[i] = t + d.holdAfterStop;   // (Eli stands up and yells)
            if (holdUntil[i] > t) a = Math.min(a, -3);
          }
          if (d.noise) {                                     // OU acceleration noise (seeded); tc = correlation time
            const tc = d.noiseTc || 2;
            noise[i] += -noise[i] * dt / tc + d.noise * Math.sqrt(2 * dt / tc) * S.gauss(rng);
            a += noise[i];
          }
        } else {
          // target speed source
          if (d.Usrc === 'avgAll') { const w = d.Uwin || 60; Ust[i] += (vm - Ust[i]) * dt / w; }
          else if (d.Usrc === 'emaLeader') { const w = d.Uwin || 20; Ust[i] += (Math.min(vl, 40) - Ust[i]) * dt / w; }
          else if (d.Usrc === 'prevLap' && ring) {
            lapSum[i] += vm * dt;
            const trav = x[i] - lapX[i];
            if (trav >= L) { Ust[i] = lapSum[i] / (t - lapStart[i] || 1); lapSum[i] = 0; lapStart[i] = t; lapX[i] = x[i]; }
          } else if (d.kind !== 'absorb' && (d.Usrc === 'fixed' || !d.Usrc)) Ust[i] = d.U ?? Ust[i];
          const U = Ust[i] * (d.Ufactor || 1);
          if (d.kind === 'fs') {
            const vc = S.fsCmd(d, gNow, v[i], vl, U);
            a = K.clamp(d.kp * (vc - v[i]), -(d.bmax || 3), d.amax || 1.5);
            // a target above what the traffic can sustain leaves the car pinned behind its leader (gap under the
            // FollowerStopper's 'cruise' threshold): it is then just chasing the car ahead, modelled with the humans' law
            if (d.chase && gNow < d.dx0[2] + 0.5) a = S.idm(d.chase, v[i], gNow, v[i] - vl);
          } else if (d.kind === 'human_patient') {
            // a trained human holding one number: target speed U, approached with a slow lag; a small seeded wobble
            const wob = d.wobble ? d.wobble * Math.sin(K.TAU * t / (d.wobbleP || 9) + i) : 0;
            a = K.clamp((U + wob - v[i]) / (d.lag || 2.5), -(d.bmax || 2), d.amax || 1.2);
            // ...but a human is still pulled by the car ahead: blend in a share 'follow' of ordinary car-following
            if (d.follow && j >= 0) a = (1 - d.follow) * a + d.follow * S.idm(d.followIdm, v[i], gNow, v[i] - vl);
          } else if (d.kind === 'absorb') {
            // jam-absorbing driver: tracks a heavily smoothed leader speed (drive at the average, don't chase),
            // eases off gently (bsoft), lets the gap shrink and refill.
            { let vla = vl;                                    // a patient driver also watches the brake lights further ahead
              for (let q = 2, jj = j; q <= (d.look || 1) && jj >= 0; q++) { jj = leaderOf(jj); if (jj < 0 || jj === i) break; vla = Math.min(vla, v[jj] + (d.lookSlack || 0)); }
              const tgt = Math.min(vla, d.vmax || 40), w = tgt < Ust[i] ? (d.emaDown || d.ema || 25) : (d.emaUp || d.ema || 25);
              Ust[i] += (tgt - Ust[i]) * dt / w; }
            a = K.clamp((Ust[i] - v[i]) / (d.lag || 3), -(d.bsoft || 0.2), d.amax || 0.6);
          }
          else if (d.kind === 'spring') {
            // a soft spring on the gap (the ink spring of the storyboard): a = kp (gap - gref) + kd (vLeaderSmoothed - v).
            // Low gains = the car's motion is a slow low-pass of the leader's: the gap stretches and shrinks, the car
            // never copies the sharp dips. gref: the gap it keeps at cruise (a safe gap, not a huge one).
            Ust[i] += (Math.min(vl, 40) - Ust[i]) * dt / (d.ema || 8);
            a = K.clamp(d.kp * (gNow - d.gref) + d.kd * (Ust[i] - v[i]), -(d.bsoft || 0.2), d.amax || 0.4);
          }
          if (d.safety && j >= 0) a = Math.min(a, S.idm(d.safety, v[i], gNow, v[i] - vl));   // never closer than safe
          if (d.kin && j >= 0) {                              // kinematic safety: the decel needed to stop closing before smin
            const dv = v[i] - vl, room = gNow - d.kin.smin - v[i] * (d.kin.th || 0);
            if (room <= 0.1) a = Math.min(a, -Math.max(2, dv > 0 ? 3 : 0.5)); else if (dv > 0 && room / dv < (d.kin.ttc || 1e9)) a = Math.min(a, -dv * dv / (2 * room));
          }
        }
        // toll barrier: the first unpaid car sees a standing leader at the booth
        if (p.booth && !paid[i]) {
          let first = true; for (let k = i + 1; k < N; k++) if (!paid[k]) { first = false; break; }
          if (first) { const ds = p.booth.G - x[i] - 0.3; if (ds > -1) a = Math.min(a, S.idm(d.kind === 'idm' ? d : (d.safety || S.BOOTH_IDM), v[i], Math.max(ds, 0.05), v[i])); }
        }
        acc[i] = Math.max(-9, a);
      }
      for (const tp of p.taps) if (t >= tp.t && t < tp.t + tp.dur) {     // a tap: brake at decel (smooth: sin^2 pulse)
        const f = tp.shape === 'smooth' ? Math.pow(Math.sin(Math.PI * (t - tp.t) / tp.dur), 2) : 1;
        acc[tp.car] = Math.min(acc[tp.car], -tp.decel * f);
      }
      for (let i = 0; i < N; i++) {
        const vn = Math.max(0, v[i] + acc[i] * dt);
        x[i] += (v[i] + vn) / 2 * dt;
        const ai = (vn - v[i]) / dt; if (ai < amin[i]) amin[i] = ai; aSum[i] += ai;
        v[i] = vn;
      }
      if (p.booth) {
        for (let i = N - 1; i >= 0; i--) if (!paid[i]) {
          if (p.booth.G - x[i] < 2.5 && v[i] < 0.35) { if (since[i] < 0) since[i] = t; if (t - since[i] >= serv[i]) paid[i] = 1; }
          break;
        }
      }
      for (let i = 0; i < N; i++) { const g = gapOf(i); if (g < minGap) { minGap = g; minGapAt = { car: i, t }; } }
      if ((step + 1) % recEvery === 0) record();
    }
    return S.wrap(p, { X, V, A, AMIN, nRec, recDt: recEvery * dt, minGap, minGapAt, Ufinal: Array.from(Ust), drv, paidAt: since, serv });
  };

  // ------------------------------------------------------------------ recorded run with the kit's interface
  S.wrap = function (p, R) {
    const N = p.N, n = R.nRec, rd = R.recDt, ts = p.timeScale;
    const run = { p, N, nRec: n, recDt: rd, timeScale: ts, simT0: p.simT0, minGap: R.minGap, minGapAt: R.minGapAt, R, events: [], roles: {} };
    run.toSim = tv => p.simT0 + tv * ts;                     // video seconds -> sim seconds
    run.toVideo = tsim => (tsim - p.simT0) / ts;
    const kOf = tsim => K.clamp(tsim / rd, 0, n - 1.0001);
    run.sample = (k, i) => ({ x: R.X[k * N + i], v: R.V[k * N + i], a: R.A[k * N + i], amin: R.AMIN[k * N + i] });
    run.xs = (k, i) => R.X[k * N + i]; run.vs = (k, i) => R.V[k * N + i]; run.as = (k, i) => R.AMIN[k * N + i];
    run.atSim = function (tsim) {
      const k = kOf(tsim), k0 = Math.floor(k), w = k - k0, k1 = Math.min(k0 + 1, n - 1);
      const xo = new Float64Array(N), vo = new Float64Array(N), ao = new Float64Array(N), b = new Float32Array(N), st = new Uint8Array(N);
      for (let i = 0; i < N; i++) {
        xo[i] = R.X[k0 * N + i] * (1 - w) + R.X[k1 * N + i] * w;
        vo[i] = R.V[k0 * N + i] * (1 - w) + R.V[k1 * N + i] * w;
        ao[i] = R.A[k1 * N + i];
        b[i] = run.brakeSim(i, tsim); st[i] = vo[i] < p.vStop ? 1 : 0;
      }
      return { x: xo, v: vo, a: ao, brake: b, stopped: st, tSim: tsim };
    };
    run.at = tv => run.atSim(run.toSim(tv));
    // brake light: same formula as the kit (art/lib/sim.js brakeRaw), on the per-sample harshest deceleration
    run.brakeRawK = (i, k) => {
      const a = R.AMIN[k * N + i], vv = R.V[k * N + i];
      return Math.max(K.smooth(-0.25, -0.9, a), vv < 1.0 ? K.smooth(1.0, 0.3, vv) : 0);
    };
    run.brakeSim = function (i, tsim) {                     // eased over ~0.13 s of VIDEO, like the kit
      const k = Math.round(kOf(tsim)), back = Math.max(1, Math.round(0.13 * ts / rd)), fwd = Math.max(0, Math.round(0.03 * ts / rd));
      let m = 0, ws = 0;
      for (let d = -back; d <= fwd; d++) { const kk = K.clamp(k + d, 0, n - 1), w = d <= 0 ? 1 : 0.6; m += run.brakeRawK(i, kk) * w; ws += w; }
      return K.clamp(m / ws * 1.35);
    };
    run.brake = (i, tv) => run.brakeSim(i, run.toSim(tv));
    run.onsetsSim = function (i, from = -1e9, to = 1e9, thr = 0.6) {
      const out = []; let on = false;
      for (let k = 0; k < n; k++) {
        const b = run.brakeRawK(i, k), t = k * rd;
        if (!on && b > thr) { on = true; if (t >= from && t <= to) out.push(t); } else if (on && b < 0.2) on = false;
      }
      return out;
    };
    run.onsets = (i, from = -1e9, to = 1e9) => run.onsetsSim(i, run.toSim(from), run.toSim(to)).map(run.toVideo);
    // per-car series helpers (sim time)
    run.firstStop = function (i, from = 0) { for (let k = Math.ceil(from / rd); k < n; k++) if (R.V[k * N + i] < p.vStop) return k * rd; return null; };
    run.minV = function (i, from = 0, to = 1e9) { let m = Infinity; for (let k = Math.ceil(from / rd); k < Math.min(n, to / rd); k++) m = Math.min(m, R.V[k * N + i]); return m; };
    run.peakDecel = function (i, from = 0, to = 1e9) { let m = 0; for (let k = Math.ceil(from / rd); k < Math.min(n, to / rd); k++) m = Math.min(m, R.AMIN[k * N + i]); return -m; };
    run.maxBrakeRaw = function (i, from = 0, to = 1e9) { let m = 0; for (let k = Math.ceil(from / rd); k < Math.min(n, to / rd); k++) m = Math.max(m, run.brakeRawK(i, k)); return m; };
    run.stoppedCount = function (k) { let c = 0; for (let i = 0; i < N; i++) if (R.V[k * N + i] < p.vStop) c++; return c; };
    run.ev = function (type, tsim, extra = {}) { const e = Object.assign({ type, tSim: +tsim.toFixed(3), t: +run.toVideo(tsim).toFixed(3) }, extra); run.events.push(e); return e; };
    run.eventsSorted = () => run.events.slice().sort((a, b) => a.tSim - b.tSim);
    return run;
  };

  // ------------------------------------------------------------------ measurements
  // position (road coordinate, unwrapped over time) of the jam: speed-weighted centre of the slowest cars
  S.jamTrack = function (run, from, to, opt = {}) {
    const N = run.N, rd = run.recDt, L = run.p.L, ring = run.p.geometry === 'ring', out = [];
    const thr = opt.thr ?? 0.5;                              // a car is "in the jam" below thr * mean speed
    let prev = null;
    for (let k = Math.ceil(from / rd); k <= Math.min(run.nRec - 1, to / rd); k++) {
      let vm = 0; for (let i = 0; i < N; i++) vm += run.vs(k, i); vm /= N;
      if (opt.vRef) vm = opt.vRef;
      // slowest car
      let j = -1, vmin = Infinity;
      for (let i = opt.i0 || 0; i < (opt.i1 || N); i++) { const vv = run.vs(k, i); if (vv < vmin) { vmin = vv; j = i; } }
      if (j < 0 || vmin > thr * vm) { prev = null; out.push(null); continue; }
      let xr = run.xs(k, j);
      if (ring) { xr = ((xr % L) + L) % L; if (prev != null) { while (xr - prev > L / 2) xr -= L; while (prev - xr > L / 2) xr += L; } }
      prev = xr; out.push({ t: k * rd, x: xr, car: j, vmin });
    }
    return out;
  };
  S.fitSlope = function (pts) {                            // least squares x(t) -> slope (m/s)
    const q = pts.filter(Boolean); const n = q.length; if (n < 3) return { slope: NaN, n };
    let st = 0, sx = 0, stt = 0, stx = 0; for (const p of q) { st += p.t; sx += p.x; stt += p.t * p.t; stx += p.t * p.x; }
    const slope = (n * stx - st * sx) / (n * stt - st * st); return { slope, n, t0: q[0].t, t1: q[n - 1].t };
  };
  // upstream front of a moving wave on an open road: the most upstream car whose speed is below thr (m/s), as the wave
  // passes; returns the road position at which car i had its minimum speed (per car), so x(t_min) is the wave path.
  S.waveByMinima = function (run, cars, from = 0, to = 1e9) {
    const out = [];
    for (const i of cars) {
      let km = -1, vm = Infinity;
      for (let k = Math.ceil(from / run.recDt); k < Math.min(run.nRec, to / run.recDt); k++) { const vv = run.vs(k, i); if (vv < vm) { vm = vv; km = k; } }
      if (km >= 0) out.push({ car: i, t: km * run.recDt, x: run.xs(km, i), vmin: vm });
    }
    return out;
  };
  // Stern-style metrics over a window [from, to] (sim s): speed std (all cars, all samples), hard-braking events per
  // vehicle-km (decel stronger than thr, rising edge), a fuel proxy per vehicle-km, mean speed and flow.
  S.ringMetrics = function (run, from, to, opt = {}) {
    const N = run.N, rd = run.recDt, thr = opt.hardBrake ?? 1.0;
    let s = 0, s2 = 0, c = 0, hb = 0, dist = 0, fuel = 0;
    const on = new Uint8Array(N);
    const k0 = Math.ceil(from / rd), k1 = Math.min(run.nRec - 1, Math.floor(to / rd));
    for (let k = k0; k <= k1; k++) for (let i = 0; i < N; i++) {
      const vv = run.vs(k, i), aa = run.R.A[k * N + i]; s += vv; s2 += vv * vv; c++;
      if (!on[i] && run.as(k, i) < -thr) { on[i] = 1; hb++; } else if (on[i] && run.as(k, i) > -thr * 0.5) on[i] = 0;
      dist += vv * rd;
      fuel += S.fuelRate(vv, aa) * rd;
    }
    const mean = s / c, std = Math.sqrt(Math.max(0, s2 / c - mean * mean));
    const L = run.p.L || 1;
    return { meanV: mean, stdV: std, hardBrakesPerVehKm: hb / Math.max(1e-9, dist / 1000), fuelPer100km: fuel / Math.max(1e-9, dist / 1000) * 100,
      flowVehPerHour: (N / L) * mean * 3600, hardBrakes: hb, distKm: dist / 1000 };
  };
  /* fuel proxy (litres/s): a simple power-based model (idle + tractive power, positive only), small passenger car,
     m = 1300 kg, rolling 0.012, CdA 0.65 m^2, efficiency ~ 0.08 ml per kJ, idle 0.25 ml/s. Indicative only. */
  S.fuelRate = function (v, a) {
    const m = 1300, P = m * a * v + 0.012 * m * 9.81 * v + 0.5 * 1.2 * 0.65 * v * v * v;   // W
    return (0.25 + 0.08 * Math.max(0, P) / 1000) / 1000;                                   // litres per second
  };
})(typeof window !== 'undefined' ? window : globalThis);
