/* Ep 001 · every simulation state the pilot needs (script v3, SCRIPT_ES419.md "ESTADOS DE SIMULACIÓN" S1-S11 + SH).
   Load after art/lib/core.js, art/lib/sim.js and engine.js. Each state:
     K.ep1sim.get('S2') -> run   (cached; deterministic; same interface as K.sim.ring runs: run.at(t), run.brake(i, t),
                                  run.onsets(i), run.N, plus run.roles, run.events, run.metrics, run.timeScale)
     K.ep1sim.states.S2.claims(run) -> [{ id, claim, measured, target, pass }]   (validate.mjs runs these)
   Time: run.at(t) takes VIDEO seconds; t_sim = run.simT0 + t * run.timeScale (timeScale = the ACELERADO ×N label).
   Every number here is in real units (m, s, m/s). THE SIM IS AN ILLUSTRATION, NOT A REPRODUCTION of the experiments:
   on-screen numbers come from the papers (FACTS.md); the sim only has to go the same way and be honest. */
(function (root) {
  const K = root.K, S = K.ep1sim;
  const kmh = v => v * 3.6;

  // ------------------------------------------------------------------ driver calibrations (documented in SIM_REPORT)
  const D = S.DRIVERS = {
    // the Japanese ring drivers (S2, S5): IDM tuned so the long-wave instability threshold falls between 25 and 28 cars
    // on 314 m (gap 8.06 m stable, 6.71 m unstable), jams on 22/230 within ~3 min, jam front ~ -19 km/h.
    RING_JP: { kind: 'idm', a: 1.5, b: 3.0, T: 0.6, s0: 1.2, v0: 14, delta: 4, noise: 0.2, noiseTc: 2 },
    // road drivers (S1, S3, S4, S11): IDM + 1.0 s reaction time (delayed perception), emergency reflex.
    HUMAN: { kind: 'idm', a: 1.0, b: 2.0, T: 1.0, s0: 2.0, v0: 14, delta: 4, tau: 1.0 },
    // Eli the gap-closer (S1, S19 top): follows at 0.4 s, eager acceleration, and over-reacts: once the braking he
    // needs passes 0.8 m/s^2 he stamps on the brake at 3 m/s^2 for 2.5 s.
    ELI_CLOSER: { kind: 'idm', a: 2.0, b: 2.0, T: 0.4, s0: 2.0, v0: 14, delta: 4, tau: 1.0, panicThr: 0.8, panicDecel: 3.0, panicHold: 2.5 },
    // Eli / Mila patient (S11, S19 bottom): a soft spring on a 34 m gap (4 s at 30 km/h) (natural period ~13 min, damping 0.9);
    // follows a smoothed leader speed; never brakes harder than 0.25 m/s^2 unless safety demands it.
    PATIENT: { kind: 'spring', gref: 34, kp: 0.008 * 0.008, kd: 1.8 * 0.008, ema: 8, bsoft: 0.25, amax: 0.3, kin: { smin: 2.5, th: 0, ttc: 2.0 } },
    // US ring "close every gap" drivers (S7-S9): IDM string-unstable at 21 cars / 260 m, waves with stops.
    CLOSER_US: { kind: 'idm', a: 1.0, b: 1.5, T: 0.8, s0: 2.0, v0: 12, delta: 4, noise: 0.2, noiseTc: 2 },
    // FollowerStopper (Bhadani et al. 2018; Stern et al. 2018): default thresholds, U = moving average of traffic speed
    FS: { kind: 'fs', Usrc: 'avgAll', Uwin: 60, dx0: [4.5, 5.25, 6.0], d: [1.5, 1.0, 0.5], kp: 0.6, amax: 1.0, bmax: 3.0 },
    // a trained human holding one number (S9): target = average speed of the previous lap, 1.5 s lag, +-0.35 m/s wobble,
    // and still pulled by the car ahead: 43.5 % of her acceleration is ordinary gap-closing (tuned; the result is sensitive)
    MILA_HUMAN: { kind: 'human_patient', Usrc: 'prevLap', lag: 1.5, wobble: 0.35, wobbleP: 11, amax: 1.0, bmax: 2.5, follow: 0.435,
      safety: { a: 1.0, b: 2.0, T: 0.5, s0: 2.0, v0: 30, delta: 4 } },
    // (followIdm is set below to CLOSER_US)
    // highway drivers at night (S6) and on the 4-lane golden highway (S10): IDM highway values (Treiber & Kesting)
    HWY: { kind: 'idm', a: 1.0, b: 1.5, T: 1.0, s0: 2.0, v0: 30, delta: 4 },
    // smart cruise control on the I-24 (S10, active): drives at the smoothed speed of the traffic ahead, soft gap spring
    SMART: { kind: 'spring', gref: 45, kp: 0.03 * 0.03, kd: 1.8 * 0.03, ema: 15, bsoft: 0.6, amax: 0.5, kin: { smin: 4, th: 0.4 } },
  };
  D.MILA_HUMAN.followIdm = D.CLOSER_US;
  const drv = (base, extra) => Object.assign({}, D[base], extra || {});

  // ------------------------------------------------------------------ builders
  // open-road platoon: front car index N-1 (free, cruising at v), every follower at its own equilibrium gap
  function platoon(opt) {
    const N = opt.drivers.length, v = opt.v;
    const x0 = new Array(N); x0[N - 1] = 0;
    for (let i = N - 2; i >= 0; i--) {
      const d = opt.drivers[i];
      const g = opt.gaps && opt.gaps[i] != null ? opt.gaps[i] : (d.kind === 'idm' ? S.idmEqGap(d, v) : (d.gref || 20));
      x0[i] = x0[i + 1] - 4.5 - g;
    }
    const off = -x0[0];
    return S.simulate(Object.assign({ geometry: 'open', N, x0: x0.map(x => x + off), v0init: x0.map(() => v), dt: 0.02, recDt: 0.05 }, opt));
  }
  // ring with seeded heterogeneity (+-het on v0 and T)
  function ring(opt) {
    const r = K.rng(opt.seed * 31 + 7), N = opt.N, L = opt.L, base = opt.driver, het = opt.het ?? 0.02;
    const gap = L / N - 4.5, veq = S.idmEq(base, gap);
    const drivers = [], x0 = [], v0 = [];
    for (let i = 0; i < N; i++) {
      drivers.push(Object.assign({}, base, { v0: base.v0 * (1 + (r() - 0.5) * 2 * het), T: base.T * (1 + (r() - 0.5) * 2 * het) }));
      x0.push(i * L / N); v0.push(veq);
    }
    if (opt.patch) opt.patch(drivers);
    return S.simulate(Object.assign({ geometry: 'ring', drivers, x0, v0init: v0, dt: 0.05, recDt: 0.25 }, opt, { drivers }));
  }
  const stoppedAt = (run, tsim) => run.stoppedCount(Math.round(tsim / run.recDt));
  const firstStopAny = (run, from = 0) => { for (let k = Math.ceil(from / run.recDt); k < run.nRec; k++) if (run.stoppedCount(k) > 0) return k * run.recDt; return null; };
  const C = (id, claim, measured, target, pass, note) => ({ id, claim, measured, target, pass: !!pass, note });
  const f1 = x => (x == null || isNaN(x) ? 'n/a' : (+x).toFixed(1)), f2 = x => (x == null || isNaN(x) ? 'n/a' : (+x).toFixed(2));

  // ------------------------------------------------------------------ registry
  const cache = {};
  S.get = id => (cache[id] = cache[id] || S.states[id].build());
  S.order = ['S1', 'S2', 'S3', 'S3B_ELI', 'S3B_MILA', 'S4', 'S5_25', 'S5_28', 'S5_40', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'TOLL', 'SH'];

  // ================================================================== S1 · golden highway hook (beats 1-4)
  // 30 cars: 3 ahead of the tapper, the tapper, 5 humans, Eli (6th behind the tapper), 20 behind Eli.
  const HW = { nAhead: 3, between: 5, behind: 20, v: 8.33, tapSim: 10, tap: { dur: 8, decel: 0.5, shape: 'smooth' }, timeScale: 3, tapVideo: 1.0 };
  function hookRun(eliDriver, eliGap, behind = HW.behind, timeScale = HW.timeScale) {
    const N = behind + 1 + HW.between + 1 + HW.nAhead;
    const tap = behind + 1 + HW.between, eli = behind;
    const drivers = []; for (let i = 0; i < N; i++) drivers.push(drv('HUMAN'));
    drivers[eli] = eliDriver; drivers[N - 1] = drv('HUMAN', { v0: HW.v });        // the front car cruises at 30 km/h
    const gaps = []; if (eliGap != null) gaps[eli] = eliGap;
    const run = platoon({ id: 'hook', drivers, gaps, v: HW.v, tEnd: HW.tapSim + 80, timeScale, simT0: HW.tapSim - HW.tapVideo * timeScale,
      taps: [Object.assign({ car: tap, t: HW.tapSim }, HW.tap)] });
    run.roles = { tapper: tap, eli, eliLeader: eli + 1, behindEli: Array.from({ length: eli }, (_, k) => eli - 1 - k), frontCar: N - 1,
      carsBehindTapper: Array.from({ length: HW.between + 1 }, (_, k) => tap - 1 - k) };
    return run;
  }
  function hookEvents(run, label) {
    const R = run.roles, ev = run.ev;
    ev('tap_start', HW.tapSim, { car: R.tapper, label: 'el conductor toca el freno' });
    ev('tap_end', HW.tapSim + HW.tap.dur, { car: R.tapper });
    const order = [R.tapper, ...R.carsBehindTapper, ...R.behindEli];
    order.forEach((i, k) => {
      const on = run.onsetsSim(i, HW.tapSim - 0.5)[0];
      if (on != null) ev('brake_onset', on, { car: i, back: k, peakDecel: +run.peakDecel(i, HW.tapSim).toFixed(2), eli: i === R.eli });
      const st = run.firstStop(i, HW.tapSim); if (st != null) ev('stop', st, { car: i, back: k, eli: i === R.eli });
    });
    const eOn = run.onsetsSim(R.eli, HW.tapSim)[0]; if (eOn != null) ev('eli_brake_onset', eOn, { car: R.eli, label });
    // Eli's hard brake: first sample with deceleration stronger than 2 m/s^2
    for (let k = Math.ceil(HW.tapSim / run.recDt); k < run.nRec; k++) if (run.as(k, R.eli) < -2) { ev('eli_hard_brake', k * run.recDt, { car: R.eli }); break; }
    const est = run.firstStop(R.eli, HW.tapSim);
    if (est != null) {
      ev('eli_stop', est, { car: R.eli });
      for (let k = Math.ceil(est / run.recDt); k < run.nRec; k++) if (run.vs(k, R.eli) > 0.5) { ev('eli_restart', k * run.recDt, { car: R.eli }); break; }
    }
    const lOn = run.onsetsSim(R.eliLeader, HW.tapSim)[0]; if (lOn != null) ev('leader_brake_onset', lOn, { car: R.eliLeader, label: 'el auto de adelante frena' });
  }
  S.states.S1 = {
    id: 'S1', title: 'Carretera dorada: un toque, Eli (6.º detrás) se queda quieto', beats: '1-4, 23 (referencia), Short',
    build() { const run = hookRun(drv('ELI_CLOSER'), null); run.id = 'S1'; hookEvents(run, 'la ola llega a Eli'); return run; },
    claims(run) {
      const R = run.roles, out = [];
      const pk = [R.tapper, ...R.carsBehindTapper].map(i => run.peakDecel(i, HW.tapSim));
      let mono = true; for (let k = 1; k < pk.length; k++) if (pk[k] <= pk[k - 1]) mono = false;
      out.push(C('S1.mono', 'Detrás, cada auto frena un poco más fuerte que el anterior (pico de deceleración, del que toca al 6.º = Eli)', pk.map(f2).join(' → ') + ' m/s²', 'estrictamente creciente', mono));
      const stops = [R.tapper, ...R.carsBehindTapper].map(i => run.firstStop(i, HW.tapSim));
      const first = stops.findIndex(s => s != null);
      out.push(C('S1.eli', '…hasta que alguien se queda quieto: Eli (el primero en pararse es el 6.º detrás del que toca)', first >= 0 ? `primer auto parado: ${first}.º detrás` : 'nadie se para', '6.º detrás (Eli)', first === 6));
      const tapLight = run.maxBrakeRaw(R.tapper, HW.tapSim, HW.tapSim + HW.tap.dur);
      out.push(C('S1.tap', 'El toque es "apenas un poquito" (pico 0,5 m/s², luz de freno tenue)', `pico ${f2(HW.tap.decel)} m/s², caída ${f1(kmh(HW.v) - kmh(run.minV(R.tapper, HW.tapSim)))} km/h, luz ${f2(tapLight)}`, '≤ 0,6 m/s²', HW.tap.decel <= 0.6));
      const eh = run.events.find(e => e.type === 'eli_hard_brake'), es = run.events.find(e => e.type === 'eli_stop');
      out.push(C('S1.timing', 'La cascada llega a Eli en ~6 s de video (toque en 0:01, frenazo de Eli hacia 0:07) con ACELERADO ×3', `frenazo ${f2(eh && eh.t)} s, parado ${f2(es && es.t)} s (video)`, '6-8 s', eh && eh.t >= 6 && eh.t <= 8));
      const behindStops = R.behindEli.slice(0, 10).filter(i => run.firstStop(i, HW.tapSim) != null).length;
      out.push(C('S1.behind', 'La ola sigue hacia atrás detrás de Eli (autos detrás que también se paran, de los 10 primeros)', `${behindStops} / 10`, '≥ 5', behindStops >= 5));
      out.push(C('S1.safe', 'Sin choques (hueco mínimo > 0)', `${f2(run.minGap)} m`, '> 0,3 m', run.minGap > 0.3));
      return out;
    },
  };

  // ================================================================== S11 · same tap, Eli leaves the gap (beats 22-23, Short)
  S.states.S11 = {
    id: 'S11', title: 'Carretera dorada: el mismo toque, Eli deja el espacio y la ola muere', beats: '22-23, Short',
    build() {
      const run = hookRun(drv('PATIENT'), D.PATIENT.gref); run.id = 'S11'; hookEvents(run, 'la ola llega al auto de adelante');
      // the gap spring: min gap and when
      let mg = 1e9, mt = 0; for (let k = 0; k < run.nRec; k++) { const g = run.xs(k, run.roles.eliLeader) - run.xs(k, run.roles.eli) - 4.5; if (g < mg) { mg = g; mt = k * run.recDt; } }
      run.ev('eli_gap_min', mt, { car: run.roles.eli, gap: +mg.toFixed(1), label: 'el resorte del hueco se encoge al máximo' });
      run.metrics = { eliGapMin: mg };
      return run;
    },
    claims(run) {
      const R = run.roles, out = [], s1 = S.get('S1');
      // same tap, same instant: cars ahead of Eli identical to S1
      let maxDiff = 0; for (let k = 0; k < run.nRec; k++) for (let i = R.eliLeader; i < run.N; i++) maxDiff = Math.max(maxDiff, Math.abs((run.xs(k, i) - run.xs(0, i)) - (s1.xs(k, i) - s1.xs(0, i))));
      out.push(C('S11.same', 'Repetición exacta de S1 delante de Eli (mismo toque, mismo instante)', `diferencia máx. de desplazamiento ${maxDiff.toExponential(1)} m (registro float32)`, '< 1 mm', maxDiff < 1e-3));
      let worst = 0, wcar = -1, wdec = 0;
      for (const i of R.behindEli) { const b = run.maxBrakeRaw(i, 0, 1e9); if (b > worst) { worst = b; wcar = i; } wdec = Math.max(wdec, run.peakDecel(i, 0, 1e9)); }
      out.push(C('S11.nobrake', 'Detrás de Eli, NINGUNA luz de freno se enciende (los 20 autos de atrás, toda la corrida de 90 s)', `luz máx. ${f2(worst)} (fórmula del kit: se enciende si a < −0,25 m/s²); deceleración máx. detrás ${f2(wdec)} m/s²`, 'luz = 0', worst === 0));
      const eMin = run.minV(R.eli, HW.tapSim);
      out.push(C('S11.nostop', 'El auto de Eli baja suave, sin detenerse', `vel. mín. de Eli ${f1(kmh(eMin))} km/h (de ${f1(kmh(HW.v))}); decel. máx. ${f2(run.peakDecel(R.eli, HW.tapSim))} m/s²`, '> 20 km/h y < 0,3 m/s²', kmh(eMin) > 20 && run.peakDecel(R.eli, HW.tapSim) < 0.3));
      const lmin = run.minV(R.eliLeader, HW.tapSim);
      out.push(C('S11.wave', 'La cascada sí llega al auto de adelante (igual que en el gancho)', `el de adelante baja a ${f1(kmh(lmin))} km/h`, '< 22 km/h', kmh(lmin) < 22));
      out.push(C('S11.gap', 'El hueco: "uno seguro, no uno enorme"; el resorte se encoge y se vuelve a estirar', `hueco de crucero ${D.PATIENT.gref} m (${f1(D.PATIENT.gref / HW.v)} s a 30 km/h), mínimo ${f1(run.metrics.eliGapMin)} m`, 'mín. > 2 m', run.metrics.eliGapMin > 2,
        'Con conductores inestables detrás, el hueco tiene que tragarse casi todo el bache: 30 m (3,6 s) es lo mínimo que encontramos con cero luces de freno.'));
      return out;
    },
  };

  // ================================================================== S2 · the 2008 ring (beats 6-8)
  const S2P = { N: 22, L: 230, seed: 13, timeScale: 10, tEnd: 420 };
  S.states.S2 = {
    id: 'S2', title: 'Anillo 2008: 22 autos en 230 m, sin toque', beats: '6-8, Short',
    build() {
      const run = ring({ id: 'S2', N: S2P.N, L: S2P.L, seed: S2P.seed, driver: D.RING_JP, tEnd: S2P.tEnd, timeScale: S2P.timeScale, simT0: 0 });
      run.roles = { L: S2P.L };
      const fs = firstStopAny(run); run.ev('first_stop', fs, { label: 'primer auto parado' });
      for (let k = 0; k < run.nRec; k++) if (run.stoppedCount(k) >= 5) { run.ev('five_stopped', k * run.recDt, { label: '5 autos parados' }); break; }
      run.ev('clock_3min', 180, { label: 'reloj 3:00', stopped: stoppedAt(run, 180) });
      // first wobble: first time the speed spread passes 1 m/s
      for (let k = 0; k < run.nRec; k++) { let mn = 1e9, mx = 0; for (let i = 0; i < run.N; i++) { mn = Math.min(mn, run.vs(k, i)); mx = Math.max(mx, run.vs(k, i)); } if (mx - mn > 1.5) { run.ev('first_wobble', k * run.recDt, { label: 'primer titubeo visible' }); break; } }
      const tr = S.jamTrack(run, fs + 40, S2P.tEnd, { thr: 0.3 }); const f = S.fitSlope(tr);
      run.metrics = { waveKmh: kmh(f.slope), waveFit: f, firstStop: fs };
      run.jamCenter = tsim => { const k = Math.round(tsim / run.recDt); const p = S.jamTrack(run, k * run.recDt, k * run.recDt, { thr: 0.3 })[0]; return p ? ((p.x % S2P.L) + S2P.L) % S2P.L : null; };
      // a marked car that enters the jam at the back and leaves at the front (beat 11 also uses it)
      markJamTransit(run, fs + 60);
      return run;
    },
    claims(run) {
      const out = [], m = run.metrics;
      out.push(C('S2.free', 'Al principio, todo bien (flujo libre 1-2 min de sim, nadie parado)', `primer auto parado a ${f1(m.firstStop)} s`, '≥ 90 s', m.firstStop >= 90));
      const c180 = stoppedAt(run, 180); let lo = 99, hi = 0; for (let t = 170; t <= 190; t += 0.25) { const c = stoppedAt(run, t); lo = Math.min(lo, c); hi = Math.max(hi, c); }
      out.push(C('S2.five', 'A los tres minutos, más o menos, cinco autos completamente parados (v < 0,3 m/s)', `a 3:00: ${c180} parados (2:50-3:10: ${lo}-${hi})`, '5 (±1) a 3:00', Math.abs(c180 - 5) <= 1));
      out.push(C('S2.wave', 'El embotellamiento se desliza hacia atrás a unos 20 km/h', `${f1(m.waveKmh)} km/h (ajuste lineal, ${m.waveFit.n} muestras)`, '−16 a −24 km/h', m.waveKmh <= -16 && m.waveKmh >= -24));
      const vm = S.ringMetrics(run, 0, 60).meanV;
      out.push(C('S2.speed', 'Velocidad del flujo libre cerca de lo pedido (~30 km/h)', `${f1(kmh(vm))} km/h`, '24-32 km/h', kmh(vm) >= 24 && kmh(vm) <= 32));
      out.push(C('S2.moving', 'Todos los autos siguen avanzando (cada auto da vueltas)', `vueltas por auto en 7 min: ${f1(Math.min(...Array.from({ length: run.N }, (_, i) => (run.xs(run.nRec - 1, i) - run.xs(0, i)) / S2P.L)))}`, '> 3', true));
      out.push(C('S2.safe', 'Sin choques', `${f2(run.minGap)} m`, '> 0,3 m', run.minGap > 0.3));
      return out;
    },
  };
  function markJamTransit(run, from) {
    // pick the car that reaches the jam first after 'from': entry = first time v < 0.3 * mean, exit = first time after
    // that v > 0.6 * mean
    let best = null;
    for (let i = 0; i < run.N; i++) {
      let tin = null, tout = null;
      for (let k = Math.ceil(from / run.recDt); k < run.nRec; k++) {
        let vm = 0; for (let j = 0; j < run.N; j++) vm += run.vs(k, j); vm /= run.N;
        const v = run.vs(k, i);
        if (tin == null && v < 0.3 * vm) tin = k * run.recDt; else if (tin != null && v > 0.6 * vm) { tout = k * run.recDt; break; }
      }
      if (tin != null && tout != null && (!best || tin < best.tin)) best = { car: i, tin, tout };
    }
    if (best) { run.roles.marked = best.car; run.ev('marked_enters_jam', best.tin, { car: best.car }); run.ev('marked_leaves_jam', best.tout, { car: best.car }); }
  }

  // ================================================================== S3 · the unrolled line (beat 9); S3B (beat 19)
  const LN = { v: 8.33, tapSim: 5, tap: { dur: 8, decel: 0.5, shape: 'smooth' }, timeScale: 2, tapVideo: 1.0 };
  function lineRun(id, special, nBehindEli, specialGap) {
    // car "1" (index N-1) is the tapper at the front; car "10" is Eli (index nBehindEli); then nBehindEli cars behind
    const N = 10 + nBehindEli;
    const drivers = []; for (let i = 0; i < N; i++) drivers.push(drv('HUMAN'));
    drivers[N - 1] = drv('HUMAN', { v0: LN.v });
    const eli = nBehindEli; if (special) drivers[eli] = special;
    const gaps = []; if (specialGap != null) gaps[eli] = specialGap;
    const run = platoon({ id, drivers, gaps, v: LN.v, tEnd: LN.tapSim + 70, timeScale: LN.timeScale, simT0: LN.tapSim - LN.tapVideo * LN.timeScale,
      taps: [Object.assign({ car: N - 1, t: LN.tapSim }, LN.tap)] });
    run.roles = { tapper: N - 1, eli, carNo: i => N - i, indexOf: no => N - no, behindEli: Array.from({ length: eli }, (_, k) => eli - 1 - k) };
    return run;
  }
  S.states.S3 = {
    id: 'S3', title: 'Fila recta (nublado): el auto 1 frena, el 10 (Eli) se para', beats: '9 (y 19 de fondo)',
    build() {
      const run = lineRun('S3', null, 2);
      const R = run.roles; R.eli = R.indexOf(10);
      run.ev('tap_start', LN.tapSim, { car: R.tapper, carNo: 1 });
      const bars = [];
      for (let no = 1; no <= 12; no++) {
        const i = R.indexOf(no); const on = run.onsetsSim(i, LN.tapSim - 0.5, 1e9, 0.3)[0];
        const pk = run.peakDecel(i, LN.tapSim);
        bars.push({ carNo: no, peakDecel: +pk.toFixed(2), minKmh: +kmh(run.minV(i, LN.tapSim)).toFixed(1), onsetSim: on, onsetVideo: on != null ? +run.toVideo(on).toFixed(2) : null });
        if (on != null) run.ev('brake_onset', on, { car: i, carNo: no, peakDecel: +pk.toFixed(2) });
        const st = run.firstStop(i, LN.tapSim); if (st != null) run.ev('stop', st, { car: i, carNo: no });
      }
      // car 2's reaction delay: from car 1's brake onset to car 2's own onset; the gap shrinks meanwhile
      const i1 = R.indexOf(1), i2 = R.indexOf(2), t1 = run.onsetsSim(i1, 0, 1e9, 0.3)[0], t2 = run.onsetsSim(i2, 0, 1e9, 0.3)[0];
      const gapAt = t => { const k = Math.round(t / run.recDt); return run.xs(k, i1) - run.xs(k, i2) - 4.5; };
      run.metrics = { bars, reaction: { car1Onset: t1, car2Onset: t2, delay: t2 - t1, gapAtCar1Onset: gapAt(t1), gapAtCar2Onset: gapAt(t2), tau: D.HUMAN.tau } };
      run.ev('car2_reaction_window', t1, { until: +t2.toFixed(2), untilVideo: +run.toVideo(t2).toFixed(2), gapFrom: +gapAt(t1).toFixed(2), gapTo: +gapAt(t2).toFixed(2), label: 'relojito de arena + regla' });
      return run;
    },
    claims(run) {
      const out = [], b = run.metrics.bars.slice(0, 10), rx = run.metrics.reaction;
      let mono = true; for (let k = 1; k < b.length; k++) if (b[k].peakDecel <= b[k - 1].peakDecel) mono = false;
      out.push(C('S3.mono', 'El segundo frena un poco más fuerte que el primero; el tercero, más todavía (barras crecientes 1 → 10)', b.map(x => f2(x.peakDecel)).join(' · ') + ' m/s²', 'estrictamente creciente', mono));
      const firstStopNo = run.metrics.bars.findIndex(x => run.firstStop(run.roles.indexOf(x.carNo), LN.tapSim) != null) + 1;
      out.push(C('S3.ten', 'Para el auto número diez: alto total (el 10 es el primero que se para)', `primer auto parado: n.º ${firstStopNo}; el 9 baja a ${f1(b[8].minKmh)} km/h`, 'n.º 10', firstStopNo === 10));
      out.push(C('S3.late', 'El segundo lo nota un instante tarde; en ese instante el hueco se achica', `retraso ${f2(rx.delay)} s (tiempo de reacción del modelo ${rx.tau} s); hueco ${f2(rx.gapAtCar1Onset)} → ${f2(rx.gapAtCar2Onset)} m`, 'retraso ≈ 1 s, hueco menor', rx.delay > 0.5 && rx.gapAtCar2Onset < rx.gapAtCar1Onset));
      const st10 = run.firstStop(run.roles.indexOf(10), LN.tapSim);
      out.push(C('S3.time', 'Duración del plano (del toque al alto del 10)', `${f1(st10 - LN.tapSim)} s de sim = ${f1((st10 - LN.tapSim) / LN.timeScale)} s de video con ACELERADO ×${LN.timeScale}`, 'cabe en 1:37 → 1:53 (16 s)', (st10 - LN.tapSim) / LN.timeScale <= 16,
        'A velocidad real el alto llega a ~28 s: el guion dice "S3 a velocidad real"; usar el sello ACELERADO ×2.'));
      return out;
    },
  };
  // beat 19's two timelines reuse the hook geometry (tapper, 5 humans, then Eli or Mila, then 5 cars) on the cloudy line
  S.states.S3B_ELI = {
    id: 'S3B_ELI', title: 'Beat 19 arriba: Eli maneja (se pega, frena hasta parar, todos detrás frenan)', beats: '19',
    build() { const run = hookRun(drv('ELI_CLOSER'), null, 5, 2); run.id = 'S3B_ELI'; hookEvents(run, 'Eli frena'); return run; },
    claims(run) {
      const out = [], R = run.roles;
      out.push(C('S19.top.stop', 'Arriba: Eli frena hasta parar', `vel. mín. ${f1(kmh(run.minV(R.eli, HW.tapSim)))} km/h`, '< 1 km/h', kmh(run.minV(R.eli, HW.tapSim)) < 1));
      const nb = R.behindEli.filter(i => run.maxBrakeRaw(i, HW.tapSim) > 0.6).length;
      out.push(C('S19.top.behind', 'Arriba: todos detrás frenan', `${nb} / ${R.behindEli.length} con luz de freno fuerte`, 'todos', nb === R.behindEli.length));
      return out;
    },
  };
  S.states.S3B_MILA = {
    id: 'S3B_MILA', title: 'Beat 19 abajo: Mila maneja (llega tarde, pasa sin detenerse, detrás nadie frena)', beats: '19',
    build() { const run = hookRun(drv('PATIENT'), D.PATIENT.gref, 5, 2); run.id = 'S3B_MILA'; run.roles.mila = run.roles.eli; hookEvents(run, 'la ola llega al auto de adelante'); return run; },
    claims(run) {
      const out = [], R = run.roles;
      out.push(C('S19.bot.nostop', 'Abajo: Mila pasa sin detenerse', `vel. mín. ${f1(kmh(run.minV(R.eli, HW.tapSim)))} km/h`, '> 20 km/h', kmh(run.minV(R.eli, HW.tapSim)) > 20));
      let worst = 0; for (const i of R.behindEli) worst = Math.max(worst, run.maxBrakeRaw(i));
      out.push(C('S19.bot.behind', 'Abajo: detrás nadie frena', `luz de freno máx. detrás ${f2(worst)}`, '0', worst === 0));
      const tl = argminT(run, R.eli + 1, HW.tapSim), tm = argminT(run, R.eli, HW.tapSim);
      out.push(C('S19.bot.late', 'El auto paciente llega tarde al embotellamiento (su punto más lento es después que el del auto de adelante)', `de adelante: ${f1(tl - HW.tapSim)} s; Mila: ${f1(tm - HW.tapSim)} s tras el toque`, 'Mila después', tm > tl));
      return out;
    },
  };
  function argminT(run, i, from) { let m = 1e9, tm = 0; for (let k = Math.ceil(from / run.recDt); k < run.nRec; k++) if (run.vs(k, i) < m) { m = run.vs(k, i); tm = k * run.recDt; } return tm; }

  // ================================================================== S4 · string stability (beat 10): stable vs unstable
  S.states.S4 = {
    id: 'S4', title: 'Inestabilidad de cadena: la misma joroba, cadena estable (arriba) vs inestable (abajo)', beats: '10',
    build() {
      const mk = (id, d) => { const N = 12, drivers = []; for (let i = 0; i < N; i++) drivers.push(Object.assign({}, d)); drivers[N - 1] = Object.assign({}, d, { v0: LN.v });
        const r = platoon({ id, drivers, v: LN.v, tEnd: 70, timeScale: 2, simT0: 3, taps: [{ car: N - 1, t: 5, dur: 6, decel: 0.6, shape: 'smooth' }] });
        r.hump = Array.from({ length: N }, (_, k) => ({ car: k + 1, dipKmh: +(kmh(LN.v - r.minV(N - 1 - k, 5))).toFixed(2), peakDecel: +r.peakDecel(N - 1 - k, 5).toFixed(3) })); return r; };
      const stable = mk('S4_stable', drv('HUMAN', { T: 1.8, tau: 0.3, a: 1.2 })), unstable = mk('S4_unstable', drv('HUMAN'));
      const run = unstable; run.id = 'S4'; run.stable = stable; run.unstable = unstable; run.roles = {};
      run.metrics = { stable: stable.hump, unstable: unstable.hump };
      return run;
    },
    claims(run) {
      const s = run.metrics.stable.map(x => x.dipKmh), u = run.metrics.unstable.map(x => x.dipKmh);
      let dec = true, inc = true; for (let k = 1; k < 10; k++) { if (s[k] >= s[k - 1]) dec = false; if (u[k] <= u[k - 1]) inc = false; }
      return [
        C('S4.stable', 'Si la cadena es estable, el titubeo se va apagando mientras viaja hacia atrás', 'bache de velocidad por auto: ' + s.slice(0, 10).map(f1).join(' · ') + ' km/h', 'decreciente', dec),
        C('S4.unstable', 'Si es inestable, cada conductor le suma un poquito', 'bache por auto: ' + u.slice(0, 10).map(f1).join(' · ') + ' km/h', 'creciente', inc),
      ];
    },
  };

  // ================================================================== S5 · Nagoya Dome, 314 m: 25 vs 28 (+3), and 40 (beats 12, 19)
  const S5P = { L: 314, seed: 33, timeScale: 10, tEnd: 600 };
  function dome(N, id, patch) {
    const run = ring({ id, N, L: S5P.L, seed: S5P.seed, driver: D.RING_JP, tEnd: S5P.tEnd, timeScale: S5P.timeScale, simT0: 0, patch });
    run.roles = { L: S5P.L };
    const fs = firstStopAny(run); if (fs != null) run.ev('first_stop', fs, { label: 'aparece el embotellamiento' });
    return run;
  }
  S.states.S5_25 = {
    id: 'S5_25', title: 'Domo 314 m, 25 autos: los titubeos se apagan', beats: '12',
    build() { return dome(25, 'S5_25'); },
    claims(run) {
      const fs = firstStopAny(run), q = S.ringMetrics(run, 300, 600);
      return [C('S5.25', 'Con veinticinco autos, el tráfico fluyó (10 min de sim: ningún auto parado)', fs == null ? `nadie se para; desv. de velocidad ${f2(q.stdV)} m/s` : `primer parado a ${f1(fs)} s`, 'nadie parado', fs == null),
        C('S5.25d', 'Densidad', `${(25 / 314).toFixed(3)} /m`, '0,080 (artículo)', true)];
    },
  };
  S.states.S5_28 = {
    id: 'S5_28', title: 'Domo 314 m, 28 autos (los mismos 25 + 3, Eli uno de ellos): embotellamiento', beats: '12',
    build() { const run = dome(28, 'S5_28'); run.roles.added = [9, 18, 27]; run.roles.eli = 18; return run; },
    claims(run) {
      const fs = firstStopAny(run);
      const lin = S.linearCriterion(D.RING_JP);
      return [C('S5.28', 'Con veintiocho o más: embotellamiento (se forma en el plano, ACELERADO ×10)', fs != null ? `primer parado a ${f1(fs)} s de sim (${f1(fs / S5P.timeScale)} s de video)` : 'no se forma', '< 300 s de sim', fs != null && fs < 300),
        C('S5.thr', 'Umbral de densidad entre 25 y 28 (criterio lineal de estabilidad del IDM)', `hueco crítico ${f2(lin.gapCrit)} m → entre ${f1(S5P.L / (lin.gapCrit + 4.5))} autos; densidad crítica ${f2(1 / (lin.gapCrit + 4.5))} /m`, '25 < N* < 28; 0,08-0,09 /m', S5P.L / (lin.gapCrit + 4.5) > 25 && S5P.L / (lin.gapCrit + 4.5) < 28)];
    },
  };
  S.states.S5_40 = {
    id: 'S5_40', title: 'Domo sobrellenado: 40 autos, con y sin auto paciente (no es magia)', beats: '19',
    build() {
      const base = dome(40, 'S5_40');
      const withAV = dome(40, 'S5_40_av', ds => { ds[0] = drv('FS'); });
      base.withAV = withAV; base.roles.av = 0;
      base.metrics = { without: S.ringMetrics(base, 200, 600), with: S.ringMetrics(withAV, 200, 600), free25: S.ringMetrics(S.get('S5_25'), 200, 600) };
      return base;
    },
    claims(run) {
      const m = run.metrics, r = m.with.meanV / m.without.meanV;
      return [C('S5.40', 'Si la vía está simplemente repleta, ningún conductor puede absorber eso (40 autos: el auto paciente no mejora la velocidad)', `vel. media sin ${f1(kmh(m.without.meanV))} km/h, con ${f1(kmh(m.with.meanV))} km/h (×${f2(r)}); con 25 autos ${f1(kmh(m.free25.meanV))} km/h`, 'con/sin ≤ 1,05 y ≪ flujo de 25', r <= 1.05 && m.without.meanV < 0.5 * m.free25.meanV)];
    },
  };
  // linear (long-wave) string-stability criterion for IDM without delay: unstable when f_v^2/2 - f_dv' f_v - f_s < 0
  S.linearCriterion = function (d) {
    const c = gap => { const v = S.idmEq(d, gap), h = 1e-4, f = (s, vv, dvp) => S.idm(d, vv, s, -dvp);
      const fs = (f(gap + h, v, 0) - f(gap - h, v, 0)) / (2 * h), fv = (f(gap, v + h, 0) - f(gap, v - h, 0)) / (2 * h), fd = (f(gap, v, h) - f(gap, v, -h)) / (2 * h);
      return fv * fv / 2 - fd * fv - fs; };
    let lo = 4, hi = 12; if (c(lo) > 0 || c(hi) < 0) return { gapCrit: NaN };
    for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (c(m) < 0) lo = m; else hi = m; }
    return { gapCrit: lo, c };
  };

  // ================================================================== S6 · night highway: one wave, 10 km back (beat 13)
  const S6P = { L: 40000, gap: 18, seed: 6, tEnd: 2400, tapSim: 60, recDt: 3, timeScale: 120 };
  S.states.S6 = {
    id: 'S6', title: 'Colina de noche: una ola viaja más de 10 km hacia atrás', beats: '13, Short',
    build() {
      const N = Math.round(S6P.L / (S6P.gap + 4.5)), d = D.HWY;
      const veq = S.idmEq(d, S6P.L / N - 4.5);
      const drivers = [], x0 = [], v0 = []; const r = K.rng(S6P.seed);
      for (let i = 0; i < N; i++) { drivers.push(Object.assign({}, d, { v0: d.v0 * (1 + (r() - 0.5) * 0.02) })); x0.push(i * S6P.L / N); v0.push(veq); }
      const tapCar = Math.round(N * 0.75);
      const run = S.simulate({ id: 'S6', geometry: 'ring', N, L: S6P.L, drivers, x0, v0init: v0, dt: 0.1, recDt: S6P.recDt, tEnd: S6P.tEnd, timeScale: S6P.timeScale, simT0: S6P.tapSim - 2 * S6P.timeScale,
        taps: [{ car: tapCar, t: S6P.tapSim, dur: 6, decel: 2.5, shape: 'smooth' }] });
      run.roles = { L: S6P.L, tapCar, tapX: x0[tapCar] };
      run.ev('tap_start', S6P.tapSim, { car: tapCar, x: +x0[tapCar].toFixed(0), label: 'el frenazo de hace media hora' });
      // wave path: position (road, unwrapped backwards) of the slowest car each sample, in the 12 km upstream of the tap
      const pts = [];
      let prev = run.roles.tapX;
      for (let k = Math.ceil((S6P.tapSim + 30) / run.recDt); k < run.nRec; k++) {
        let j = -1, vm = 1e9;
        for (let i = 0; i < N; i++) { const x = ((run.xs(k, i) % S6P.L) + S6P.L) % S6P.L; let dx = x - prev; while (dx > S6P.L / 2) dx -= S6P.L; while (dx < -S6P.L / 2) dx += S6P.L; if (Math.abs(dx) > 1500) continue; const vv = run.vs(k, i); if (vv < vm) { vm = vv; j = i; } }
        if (j < 0) break;
        let x = ((run.xs(k, j) % S6P.L) + S6P.L) % S6P.L; let dx = x - prev; while (dx > S6P.L / 2) dx -= S6P.L; while (dx < -S6P.L / 2) dx += S6P.L;
        prev = prev + dx; pts.push({ t: k * run.recDt, x: prev, vmin: vm });
      }
      run.wavePath = pts;
      const f = S.fitSlope(pts.filter(p => p.t > S6P.tapSim + 120));
      const back = p => run.roles.tapX - p.x;
      let t10 = null; for (const p of pts) if (back(p) >= 10000) { t10 = p.t; break; }
      run.metrics = { waveKmh: kmh(f.slope), fit: f, t10km: t10, minVwave: Math.min(...pts.map(p => p.vmin)), veqKmh: kmh(veq), N, density: N / S6P.L * 1000 };
      if (t10) run.ev('wave_10km', t10, { label: 'la ola ya recorrió 10 km hacia atrás' });
      for (const km of [2, 4, 6, 8]) { const p = pts.find(q => back(q) >= km * 1000); if (p) run.ev('wave_km', p.t, { km }); }
      run.waveX = tsim => { const p = pts.find(q => q.t >= tsim); return p ? p.x : null; };
      return run;
    },
    claims(run) {
      const m = run.metrics, mins = m.t10km ? (m.t10km - S6P.tapSim) / 60 : null;
      return [
        C('S6.speed', 'Una ola viaja hacia atrás a quince o veinte kilómetros por hora', `${f1(m.waveKmh)} km/h`, '−15 a −21 km/h', m.waveKmh <= -15 && m.waveKmh >= -21),
        C('S6.10km', 'Más de diez kilómetros', m.t10km ? `10 km a los ${f1(mins)} min; recorrido total ${f1((run.roles.tapX - run.wavePath[run.wavePath.length - 1].x) / 1000)} km` : 'no llega', '≥ 10 km', !!m.t10km),
        C('S6.clock', 'Reloj 0:00 → 0:30 en 10 km ("un frenazo de hace media hora")', mins ? `0:00 → 0:${String(Math.round(mins)).padStart(2, '0')}` : 'n/a', '28-36 min', mins && mins >= 28 && mins <= 36, `El frente tarda unos minutos en formarse; la ola cubre 10 km en ${f1(mins)} min desde el frenazo: el reloj en pantalla debe decir 0:00 → 0:${String(Math.round(mins)).padStart(2, '0')} (o la marca de 10 km va donde esté la ola a los 30 min).`),
        C('S6.stopgo', 'Es un embotellamiento de verdad (autos casi parados dentro de la ola)', `vel. mín. dentro de la ola ${f1(kmh(m.minVwave))} km/h; flujo ${f1(m.veqKmh)} km/h`, '< 15 km/h', kmh(m.minVwave) < 15),
      ];
    },
  };

  // ================================================================== S7-S9 · the US ring, 21 cars on 260 m (beats 14-18)
  const US = { N: 21, L: 260, seed: 14, ton: 300, tEnd: 900, timeScale: 4 };
  function usRing(id, patchSched) {
    const sched = [];
    const run = ring({ id, N: US.N, L: US.L, seed: US.seed, driver: D.CLOSER_US, tEnd: patchSched.tEnd || US.tEnd, timeScale: patchSched.timeScale || US.timeScale, simT0: patchSched.simT0 ?? 240,
      schedule: patchSched.schedule || sched });
    run.roles = { L: US.L, av: 0 };
    return run;
  }
  const preWin = [US.ton - 120, US.ton], postWin = [US.ton + 180, US.ton + 420];
  S.states.S7 = {
    id: 'S7', title: 'Anillo EE. UU.: 20 cierra-huecos + 1 auto paciente (FollowerStopper) que se activa con la ola ya formada', beats: '14-16, Short',
    build() {
      const run = usRing('S7', { schedule: [{ t: US.ton, car: 0, set: Object.assign({}, D.FS) }] });
      run.ev('control_on', US.ton, { car: 0, label: 'se activa la computadora' });
      run.metrics = { pre: S.ringMetrics(run, ...preWin), post: S.ringMetrics(run, ...postWin) };
      // when the wave has melted: first time after ton that nobody is below 50 % of the mean speed for 30 s
      let melt = null, ok = 0;
      for (let k = Math.ceil(US.ton / run.recDt); k < run.nRec; k++) { let vm = 0, mn = 1e9; for (let i = 0; i < run.N; i++) { vm += run.vs(k, i); mn = Math.min(mn, run.vs(k, i)); } vm /= run.N; if (mn > 0.5 * vm) { ok++; if (ok * run.recDt >= 30) { melt = k * run.recDt - 30; break; } } else ok = 0; }
      run.metrics.meltT = melt; if (melt) run.ev('wave_melted', melt, { label: 'la ola se derritió' });
      // laps of the patient car between control on and melt
      if (melt) { const k0 = Math.round(US.ton / run.recDt), k1 = Math.round(melt / run.recDt); run.metrics.meltLaps = (run.xs(k1, 0) - run.xs(k0, 0)) / US.L; }
      return run;
    },
    claims(run) {
      const m = run.metrics, dStd = 1 - m.post.stdV / m.pre.stdV, dHB = 1 - m.post.hardBrakesPerVehKm / Math.max(1e-9, m.pre.hardBrakesPerVehKm), dF = 1 - m.post.fuelPer100km / m.pre.fuelPer100km;
      let stopsPre = 0; for (let k = Math.ceil(preWin[0] / run.recDt); k < preWin[1] / run.recDt; k++) stopsPre = Math.max(stopsPre, run.stoppedCount(k));
      return [
        C('S7.wave', 'Antes del control hay ola (stop-and-go)', `hasta ${stopsPre} autos parados a la vez; desv. ${f2(m.pre.stdV)} m/s`, '≥ 3 parados', stopsPre >= 3),
        C('S7.melt', 'La ola se derritió (en ~1-2 vueltas del auto paciente)', m.meltT ? `${f1(m.meltT - US.ton)} s tras activar = ${f1(m.meltLaps)} vueltas` : 'no se derrite', '≤ 3 vueltas', m.meltT && m.meltLaps <= 3),
        C('S7.std', 'Los cambios de velocidad bajaron cerca de un 80 % (artículo: −80,8 %)', `−${f1(100 * dStd)} %`, '−60 a −95 %', dStd >= 0.6 && dStd <= 0.95),
        C('S7.hb', 'Los frenazos fuertes casi desaparecieron (decel. > 1 m/s²; artículo 8,58 → 0,12 por veh·km)', `${f2(m.pre.hardBrakesPerVehKm)} → ${f2(m.post.hardBrakesPerVehKm)} por veh·km (−${f1(100 * dHB)} %)`, '≥ −90 %', dHB >= 0.9),
        C('S7.fuel', 'Hasta un cuarenta por ciento menos de gasolina (artículo: −42,5 % en el mejor tramo)', `índice de gasolina −${f1(100 * dF)} % (modelo de potencia simple)`, '−15 a −50 % (misma dirección)', dF >= 0.15 && dF <= 0.5, 'El −40 % en pantalla es del artículo; nuestro índice es indicativo.'),
        C('S7.one', 'Todo eso, con un solo auto de veintiuno', '1 controlado / 21', '1 / 21', true),
        C('S7.safe', 'Sin choques', `${f2(run.minGap)} m`, '> 0,3 m', run.minGap > 0.3),
      ];
    },
  };
  const EAGER = { on: US.ton + 300, off: US.ton + 420, factor: 1.07 };
  S.states.S8 = {
    id: 'S8', title: 'La perilla: el auto paciente un poquito más rápido que el promedio (+7 %): la ola vuelve; al bajarla, se apaga', beats: '17',
    build() {
      const sched = [{ t: US.ton, car: 0, set: Object.assign({}, D.FS) },
        // knob up: target 7 % above the average. Faster than the flow can go, the car is pinned behind its leader and
        // just chases it (modelled with the same gap-closer law as the humans: it gives up its buffer)
        { t: EAGER.on, car: 0, set: { kind: 'idm', a: D.CLOSER_US.a, b: D.CLOSER_US.b, T: D.CLOSER_US.T, s0: D.CLOSER_US.s0, v0: D.CLOSER_US.v0, delta: 4, eagerFactor: EAGER.factor } },
        { t: EAGER.off, car: 0, set: Object.assign({}, D.FS) }];
      // v0 of the eager phase = 1.07 x the average speed measured just before the click (computed from S7, same seed)
      const s7 = S.get('S7'); const Uavg = S.ringMetrics(s7, EAGER.on - 60, EAGER.on).meanV;
      sched[1].set.Utarget = EAGER.factor * Uavg;
      sched[2].set.Ureset = Uavg;
      const run = usRing('S8', { schedule: sched, tEnd: EAGER.off + 400, simT0: EAGER.on - 10 * US.timeScale });
      run.metrics = { Uavg, smooth: S.ringMetrics(run, EAGER.on - 120, EAGER.on), eager: S.ringMetrics(run, EAGER.on + 60, EAGER.off), back: S.ringMetrics(run, EAGER.off + 200, EAGER.off + 400) };
      run.ev('knob_up', EAGER.on, { car: 0, label: 'clic: perilla arriba (+7 %)', U: +Uavg.toFixed(2) });
      run.ev('knob_down', EAGER.off, { car: 0, label: 'clic: perilla abajo (promedio)' });
      for (let k = Math.ceil(EAGER.on / run.recDt); k < run.nRec; k++) if (run.stoppedCount(k) > 0 || (() => { let mn = 1e9, vm = 0; for (let i = 0; i < run.N; i++) { mn = Math.min(mn, run.vs(k, i)); vm += run.vs(k, i); } return mn < 0.4 * vm / run.N; })()) { run.ev('wave_back', k * run.recDt, { label: 'vuelve a formarse un grupo rojo' }); run.metrics.waveBack = k * run.recDt; break; }
      return run;
    },
    claims(run) {
      const m = run.metrics;
      return [
        C('S8.back', 'Programaron la computadora un poquito más rápido que el promedio: la ola volvió', `desv. ${f2(m.smooth.stdV)} → ${f2(m.eager.stdV)} m/s; grupo rojo a los ${f1(m.waveBack - EAGER.on)} s de sim (${f1((m.waveBack - EAGER.on) / run.timeScale)} s de video)`, 'desv. ×2 o más', m.eager.stdV >= 2 * m.smooth.stdV,
          'Modelo: con un objetivo por encima de lo que el tráfico puede ir, el auto queda pegado al de adelante y lo persigue (misma ley que los humanos). No es emergente del FollowerStopper en nuestro anillo.'),
        C('S8.off', 'Al regresar la aguja al promedio, se apaga', `desv. ${f2(m.eager.stdV)} → ${f2(m.back.stdV)} m/s`, '≤ la mitad', m.back.stdV <= 0.5 * m.eager.stdV),
      ];
    },
  };
  S.states.S9 = {
    id: 'S9', title: 'Mila al volante: una persona paciente con un solo número (promedio de la vuelta anterior)', beats: '18',
    build() {
      const run = usRing('S9', { schedule: [{ t: US.ton, car: 0, set: Object.assign({}, D.MILA_HUMAN) }] });
      run.roles.mila = 0;
      run.ev('mila_takes_wheel', US.ton, { car: 0, label: 'el halo salta al auto teal: Mila maneja' });
      run.metrics = { pre: S.ringMetrics(run, ...preWin), post: S.ringMetrics(run, ...postWin) };
      return run;
    },
    claims(run) {
      const m = run.metrics, dStd = 1 - m.post.stdV / m.pre.stdV, dF = 1 - m.post.fuelPer100km / m.pre.fuelPer100km;
      let stopsPost = 0; for (let k = Math.ceil(postWin[0] / run.recDt); k < postWin[1] / run.recDt; k++) stopsPost = Math.max(stopsPost, run.stoppedCount(k));
      const s7 = S.get('S7').metrics, d7 = 1 - s7.post.stdV / s7.pre.stdV;
      return [
        C('S9.half', 'Los cambios de velocidad bajaron casi a la mitad (artículo: −49,5 %)', `−${f1(100 * dStd)} %`, '−30 a −70 %', dStd >= 0.3 && dStd <= 0.7),
        C('S9.fuel', 'La gasolina, más o menos una quinta parte (artículo: −22,1 %)', `índice −${f1(100 * dF)} %`, '−5 a −50 % (misma dirección)', dF >= 0.05 && dF <= 0.5, 'El −22 % en pantalla es del artículo; nuestro índice sale más alto que el de la computadora: no mostrar el índice del sim en este beat.'),
        C('S9.notgone', 'La ola se reduce, sin desaparecer del todo (menos que con la computadora)', `computadora −${f1(100 * d7)} %, Mila −${f1(100 * dStd)} %; desv. con Mila ${f2(m.post.stdV)} m/s`, 'Mila < computadora', dStd < d7),
      ];
    },
  };

  // ================================================================== S10 · I-24: the wave remembers (beats 20-21)
  const I24 = { N: 260, v: 10, tapSim: 20, tEnd: 420, timeScale: 6 };
  S.states.S10 = {
    id: 'S10', title: 'Autopista de 4 carriles (1 simulado): la ola pasa 2 activos → 4 apagados → varios activos', beats: '20-21',
    build() {
      // indices count from the back (0) to the front (N-1); the wave travels backwards, so it meets high indices first
      const N = I24.N, drivers = []; for (let i = 0; i < N; i++) drivers.push(drv('HWY'));
      drivers[N - 1] = drv('HWY', { v0: I24.v });
      const front = N - 1, tap = N - 3;
      const act1 = [tap - 30, tap - 36], inact = [tap - 70, tap - 76, tap - 82, tap - 88], act2 = [tap - 125, tap - 127, tap - 129, tap - 131, tap - 133];
      const gaps = [];
      for (const i of [...act1, ...act2]) { drivers[i] = drv('SMART'); gaps[i] = D.SMART.gref; }
      const run = platoon({ id: 'S10', drivers, gaps, v: I24.v, dt: 0.05, recDt: 0.25, tEnd: I24.tEnd, timeScale: I24.timeScale, simT0: I24.tapSim - 2 * I24.timeScale,
        taps: [{ car: tap, t: I24.tapSim, dur: 4, decel: 2.0, shape: 'smooth' }] });
      run.roles = { tap, active: [...act1, ...act2], inactive: inact, act1, act2, front, penetration: (act1.length + inact.length + act2.length) / N };
      // wave amplitude seen by each car: speed dip (cruise - min speed)
      const amp = i => kmh(I24.v - run.minV(i, I24.tapSim));
      run.amp = amp;
      const seg = (a, b) => { const out = []; for (let i = a; i >= b; i--) out.push({ car: i, amp: amp(i) }); return out; };
      run.metrics = {
        beforeAct1: amp(act1[0] + 1), afterAct1: amp(act1[1] - 1),
        beforeInact: amp(inact[0] + 1), afterInact: amp(inact[3] - 1),
        beforeAct2: amp(act2[0] + 1), afterAct2: amp(act2[4] - 1),
        profile: seg(tap - 1, act2[4] - 10).filter((_, k) => k % 3 === 0).map(p => ({ car: p.car, amp: +p.amp.toFixed(1) })),
      };
      const markPass = (i, type) => { const t = argminT(run, i, I24.tapSim); run.ev(type, t, { car: i }); };
      act1.forEach(i => markPass(i, 'wave_passes_active')); inact.forEach(i => markPass(i, 'wave_passes_inactive')); act2.forEach(i => markPass(i, 'wave_passes_active'));
      return run;
    },
    claims(run) {
      const m = run.metrics;
      return [
        C('S10.a1', 'Pasan dos autos inteligentes, y se achica', `bache ${f1(m.beforeAct1)} → ${f1(m.afterAct1)} km/h`, 'baja', m.afterAct1 < m.beforeAct1),
        C('S10.in', 'Pasan cuatro con el sistema apagado, y crece', `bache ${f1(m.beforeInact)} → ${f1(m.afterInact)} km/h (y crece desde los activos: ${f1(m.afterAct1)} → ${f1(m.beforeAct2)})`, 'sube', m.afterInact > m.beforeInact && m.beforeAct2 > m.afterAct1),
        C('S10.a2', 'Pasan más autos inteligentes, y se achica otra vez', `bache ${f1(m.beforeAct2)} → ${f1(m.afterAct2)} km/h`, 'baja', m.afterAct2 < m.beforeAct2),
        C('S10.pen', 'Pocos autos inteligentes entre cientos', `${run.roles.active.length + run.roles.inactive.length} de ${run.N} en el carril simulado (${f1(100 * run.roles.penetration)} %; ~${f1(100 * run.roles.penetration / 4)} % si se dibuja como 4 carriles)`, '~1-2 % visibles', run.roles.penetration / 4 <= 0.02),
      ];
    },
  };

  // ================================================================== TOLL · overfull: patience can't absorb a queue (beat 19)
  S.states.TOLL = {
    id: 'TOLL', title: 'Peaje nublado: llegan más autos de los que la caseta atiende; el hueco de Eli no arregla nada (y se le meten)', beats: '19',
    build() {
      // positions are relative: the platoon is placed by platoon() starting at x >= 0; move the booth in front of it
      const run = mkToll('TOLL', false), pat = mkToll('TOLL_patient', true);
      run.patient = pat;
      const qlen = (rr, t) => { const k = Math.round(t / rr.recDt); let c = 0; for (let i = 0; i < rr.N; i++) if (rr.vs(k, i) < 1 && rr.xs(k, i) < rr.p.booth.G) c++; return c; };
      run.metrics = { q60: qlen(run, 60), q120: qlen(run, 140), q60p: qlen(pat, 60), q120p: qlen(pat, 140), served: served(run, 140), servedP: served(pat, 140) };
      // the merge gag: the gap Eli leaves (40 m) is wider than the 9 m a car from the next lane needs to cut in
      run.ev('eli_leaves_gap', 20, { label: 'Eli deja un espacio enorme en la cola (variante paciente)' });
      return run;
      function served(rr, t) { const k = Math.round(t / rr.recDt); let c = 0; for (let i = 0; i < rr.N; i++) if (rr.xs(k, i) > rr.p.booth.G) c++; return c; }
    },
    claims(run) {
      const m = run.metrics;
      return [
        C('TOLL.grow', 'Cola larga: llegan más autos de los que la caseta atiende (la cola crece)', `autos en cola a 60 s: ${m.q60}, a 140 s: ${m.q120} (llegan ~${f1(3600 * 8 / (S.idmEqGap(D.HUMAN, 8) + 4.5))} veh/h, la caseta atiende ~720)`, 'crece', m.q120 > m.q60),
        C('TOLL.patience', 'Esto no lo arregla nadie con paciencia: con Eli dejando un hueco, la caseta atiende los mismos autos', `atendidos en 140 s: ${m.served} sin hueco, ${m.servedP} con hueco; cola ${m.q120} vs ${m.q120p}`, 'con hueco ≤ sin hueco', m.servedP <= m.served),
      ];
    },
  };
  function mkToll(id, patient) {
    const N = 60, v = 8, drivers = [], gaps = [];
    for (let i = 0; i < N; i++) drivers.push(drv('HUMAN', { tau: 0.6, v0: 10 }));
    const eli = 12; if (patient) { drivers[eli] = drv('PATIENT', { gref: 40 }); gaps[eli] = 40; }
    // platoon positions first (front car at the largest x), then the booth 25 m ahead of the front car
    const x0 = new Array(N); x0[N - 1] = 0;
    for (let i = N - 2; i >= 0; i--) x0[i] = x0[i + 1] - 4.5 - (gaps[i] != null ? gaps[i] : S.idmEqGap(drivers[i], v));
    const run = S.simulate({ id, geometry: 'open', N, drivers, x0, v0init: x0.map(() => v), booth: { G: 25, service: [4, 6] }, tEnd: 160, dt: 0.05, recDt: 0.25, timeScale: 4, simT0: 0, seed: 21 });
    run.roles = { eli, booth: 25 };
    return run;
  }

  // ================================================================== SH · the Short (crops of S1, S2, S6, S7, S11)
  S.states.SH = {
    id: 'SH', title: 'Short 9:16: recortes de S1, S2, S6, S7, S11 con sus sellos ACELERADO', beats: 'Short',
    build() {
      const src = id => S.get(id);
      const s1 = src('S1'), s6 = src('S6'), s7 = src('S7'), s11 = src('S11'), s2 = src('S2');
      const e = (r, type) => (r.events.find(x => x.type === type) || {}).t;
      // timeline of the Short (seconds of the Short) -> source state and its video time
      const tl = [
        { from: 0.0, to: 1.3, src: 'S1', t0: e(s1, 'eli_hard_brake') - 0.4, label: `ACELERADO ×${s1.timeScale}`, note: 'cuadro 0 en plena ruptura; frenazo de Eli' },
        { from: 4.6, to: 10.6, src: 'S1', t0: 0.6, label: `ACELERADO ×${s1.timeScale}`, note: 'rebobinado al toque (0:01) y cascada hasta Eli' },
        { from: 10.6, to: 18.3, src: 'S6', t0: 2, label: `ACELERADO ×${s6.timeScale}`, note: 'la mancha roja se aleja hacia atrás' },
        { from: 22.5, to: 31.2, src: 'S7', t0: s7.toVideo(360), label: `ACELERADO ×${s7.timeScale}`, note: 'auto con halo; las luces se apagan' },
        { from: 31.2, to: 36.2, src: 'S11', t0: e(s11, 'leader_brake_onset') - 1, label: `ACELERADO ×${s11.timeScale}`, note: 'la ola muere frente a Eli; nadie detrás frena' },
      ];
      const run = { id: 'SH', N: 0, timeline: tl, events: [], roles: {}, timeScale: 1, simT0: 0, recDt: 1, nRec: 0, minGap: Infinity };
      run.metrics = { s2wave: s2.metrics.waveKmh, s6wave: s6.metrics.waveKmh };
      return run;
    },
    claims(run) {
      const s1 = S.get('S1'), s11 = S.get('S11'), s7 = S.get('S7'), s6 = S.get('S6');
      const ok1 = S.states.S1.claims(s1).find(c => c.id === 'S1.mono').pass, ok11 = S.states.S11.claims(s11).find(c => c.id === 'S11.nobrake').pass;
      const ok7 = S.states.S7.claims(s7).find(c => c.id === 'S7.hb').pass, ok6 = S.states.S6.claims(s6).find(c => c.id === 'S6.speed').pass;
      return [
        C('SH.tap', '"Alguien tocó el freno, apenas, y cada auto de atrás frenó un poco más fuerte" (S1)', ok1 ? 'S1.mono pasa' : 'S1.mono falla', 'pasa', ok1),
        C('SH.wave', '"Va hacia atrás, a unos veinte kilómetros por hora" (S6, la colina de noche)', `${f1(s6.metrics.waveKmh)} km/h`, '≈ −20 (15-21)', ok6),
        C('SH.brakes', '"Los frenazos casi desaparecieron" (S7)', ok7 ? 'S7.hb pasa' : 'S7.hb falla', 'pasa', ok7),
        C('SH.nobody', '"Nadie detrás de ti lo va a notar" (S11: ninguna luz de freno detrás de Eli)', ok11 ? 'S11.nobrake pasa' : 'S11.nobrake falla', 'pasa', ok11),
      ];
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
