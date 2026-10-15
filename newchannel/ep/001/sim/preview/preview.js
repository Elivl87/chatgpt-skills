/* Cheap space-time previews of each sim state (not art): time runs down, road position runs right; every dot is a car
   sample coloured by speed (teal = cruising, amber = slowing, red = stopped / brake light on). Jams show up as red bands;
   a band leaning left as it goes down = a wave travelling backwards. */
(function () {
  const K = window.K, S = K.ep1sim, cv = document.getElementById('cv'), c = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = { l: 60, r: 20, t: 70, b: 40 };
  const id = new URLSearchParams(location.search).get('state');
  const col = (v, vref, br) => { if (br > 0.5 || v < 0.3) return '#ff4a36'; const q = Math.max(0, Math.min(1, v / vref)); return q > 0.8 ? '#3fb8a8' : q > 0.5 ? '#c9c45a' : '#f0a040'; };
  function header(title, sub) {
    c.fillStyle = '#111'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#f3ecdd'; c.font = 'bold 20px sans-serif'; c.fillText(id + ' · ' + title, 14, 28);
    c.fillStyle = '#aab'; c.font = '14px sans-serif'; c.fillText(sub, 14, 52);
  }
  function axes(xl, tl) { c.fillStyle = '#889'; c.font = '12px sans-serif'; c.fillText(xl, W - PAD.r - 220, H - 12); c.save(); c.translate(16, H - PAD.b); c.rotate(-Math.PI / 2); c.fillText(tl, 0, 0); c.restore(); }
  function claimsBox(run) {
    const cl = S.states[id].claims(run), ok = cl.filter(x => x.pass).length;
    c.fillStyle = ok === cl.length ? '#3fb8a8' : '#ff4a36'; c.font = 'bold 14px sans-serif'; c.fillText(`${ok}/${cl.length} afirmaciones PASAN`, W - 230, 28);
  }
  // ring: x = position mod L, y = time
  function ringST(run, t0, t1, opt = {}) {
    const L = run.p.L, x0 = PAD.l, x1 = W - PAD.r, y0 = PAD.t, y1 = H - PAD.b, vref = opt.vref || 10;
    c.strokeStyle = '#333'; c.strokeRect(x0, y0, x1 - x0, y1 - y0);
    const step = Math.max(1, Math.round((t1 - t0) / (y1 - y0) / run.recDt));
    for (let k = Math.ceil(t0 / run.recDt); k <= Math.min(run.nRec - 1, t1 / run.recDt); k += step) {
      const y = y0 + (k * run.recDt - t0) / (t1 - t0) * (y1 - y0);
      for (let i = 0; i < run.N; i++) {
        const x = ((run.xs(k, i) % L) + L) % L, v = run.vs(k, i);
        c.fillStyle = (opt.mark != null && i === opt.mark) ? '#ffffff' : col(v, vref, run.brakeRawK(i, k));
        c.fillRect(x0 + x / L * (x1 - x0), y, opt.mark === i ? 3 : 2, 2);
      }
    }
    c.fillStyle = '#889'; c.font = '12px sans-serif';
    for (let t = Math.ceil(t0 / 60) * 60; t <= t1; t += 60) { const y = y0 + (t - t0) / (t1 - t0) * (y1 - y0); c.fillText(`${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`, 18, y + 4); }
    axes(`posición en el anillo (0-${L} m) →`, 'tiempo de sim ↓');
  }
  function events(run, t0, t1, types, xmode) {
    const y0 = PAD.t, y1 = H - PAD.b;
    for (const e of run.events) if (types.includes(e.type) && e.tSim >= t0 && e.tSim <= t1) {
      const y = y0 + (e.tSim - t0) / (t1 - t0) * (y1 - y0);
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(PAD.l, y); c.lineTo(W - PAD.r, y); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#fff'; c.font = '12px sans-serif'; c.fillText(e.type + (e.label ? ' · ' + e.label : ''), PAD.l + 6, y - 4);
    }
  }
  // open road: x = road position (window), y = time; Eli highlighted
  function roadST(run, t0, t1, xa, xb, opt = {}) {
    const x0 = PAD.l, x1 = W - PAD.r, y0 = PAD.t, y1 = H - PAD.b, vref = opt.vref || 8.3;
    c.strokeStyle = '#333'; c.strokeRect(x0, y0, x1 - x0, y1 - y0);
    const step = Math.max(1, Math.round((t1 - t0) / (y1 - y0) / run.recDt));
    for (let i = 0; i < run.N; i++) {
      const hi = opt.hi && opt.hi.includes(i);
      for (let k = Math.ceil(t0 / run.recDt); k <= Math.min(run.nRec - 1, t1 / run.recDt); k += step) {
        const x = run.xs(k, i); if (x < xa || x > xb) continue;
        const y = y0 + (k * run.recDt - t0) / (t1 - t0) * (y1 - y0);
        c.fillStyle = hi ? (run.brakeRawK(i, k) > 0 ? '#ff9a9a' : '#ffffff') : col(run.vs(k, i), vref, run.brakeRawK(i, k));
        c.fillRect(x0 + (x - xa) / (xb - xa) * (x1 - x0), y, hi ? 3 : 2, 2);
      }
    }
    axes('posición en la carretera →  (cada línea = un auto; blanco = Eli/Mila/auto especial)', 'tiempo de sim ↓');
  }
  const draw = {
    S1() { const r = S.get('S1'); header('gancho: toque → Eli (6.º) se para; la ola sigue atrás', `ACELERADO ×${r.timeScale} · ${r.N} autos · luz roja = freno`); const xa = r.xs(0, 0) - 10, xb = r.xs(r.nRec - 1, r.N - 1); roadST(r, 5, 70, xa, xb, { hi: [r.roles.eli] }); events(r, 5, 70, ['tap_start', 'eli_hard_brake', 'eli_stop'], 0); claimsBox(r); },
    S11() { const r = S.get('S11'); header('el mismo toque; Eli deja 34 m y la ola muere en su hueco', `ACELERADO ×${r.timeScale} · detrás de Eli: luz de freno máx = 0`); const xa = r.xs(0, 0) - 10, xb = r.xs(r.nRec - 1, r.N - 1); roadST(r, 5, 70, xa, xb, { hi: [r.roles.eli] }); events(r, 5, 70, ['tap_start', 'leader_brake_onset', 'eli_gap_min'], 0); claimsBox(r); },
    S2() { const r = S.get('S2'); header('anillo 2008: 22 autos, 230 m, sin toque', `ACELERADO ×${r.timeScale} · ola ${r.metrics.waveKmh.toFixed(1)} km/h · blanco = auto marcado`); ringST(r, 0, 420, { vref: 8, mark: r.roles.marked }); events(r, 0, 420, ['first_stop', 'five_stopped', 'clock_3min'], 0); claimsBox(r); },
    S3() { const r = S.get('S3'); header('fila recta: auto 1 frena, el 10 (Eli) se para', `ACELERADO ×${r.timeScale} (a velocidad real el alto llega a ~27 s)`); const xa = r.xs(0, 0) - 10, xb = r.xs(r.nRec - 1, r.N - 1); roadST(r, 0, 60, xa, xb, { hi: [r.roles.indexOf(10)] }); events(r, 0, 60, ['tap_start', 'car2_reaction_window', 'stop'], 0); claimsBox(r); },
    S3B_ELI() { const r = S.get('S3B_ELI'); header('beat 19 arriba: Eli maneja', `ACELERADO ×${r.timeScale}`); roadST(r, 5, 70, r.xs(0, 0) - 10, r.xs(r.nRec - 1, r.N - 1), { hi: [r.roles.eli] }); claimsBox(r); },
    S3B_MILA() { const r = S.get('S3B_MILA'); header('beat 19 abajo: Mila maneja (resorte de 34 m)', `ACELERADO ×${r.timeScale}`); roadST(r, 5, 70, r.xs(0, 0) - 10, r.xs(r.nRec - 1, r.N - 1), { hi: [r.roles.eli] }); claimsBox(r); },
    S4() { const r = S.get('S4'); header('inestabilidad de cadena: bache de velocidad por auto', 'arriba estable (se apaga) · abajo inestable (crece)');
      const bars = (arr, y0, h, color) => { const mx = 25; arr.forEach((p, k) => { const bh = p.dipKmh / mx * h, x = PAD.l + k * 70; c.fillStyle = color; c.fillRect(x, y0 + h - bh, 50, bh); c.fillStyle = '#ccc'; c.font = '12px sans-serif'; c.fillText(p.dipKmh.toFixed(1), x + 8, y0 + h - bh - 4); c.fillText('#' + p.car, x + 14, y0 + h + 14); }); };
      bars(r.metrics.stable, 80, 200, '#3fb8a8'); bars(r.metrics.unstable, 340, 220, '#ff4a36'); claimsBox(r); },
    S5_25() { const r = S.get('S5_25'); header('domo 314 m · 25 autos: fluye', `ACELERADO ×${r.timeScale}`); ringST(r, 0, 600, { vref: 10 }); claimsBox(r); },
    S5_28() { const r = S.get('S5_28'); header('domo 314 m · 28 autos (misma semilla): embotellamiento', `ACELERADO ×${r.timeScale} · blanco = Eli (uno de los 3 de más)`); ringST(r, 0, 600, { vref: 10, mark: r.roles.eli }); events(r, 0, 600, ['first_stop'], 0); claimsBox(r); },
    S5_40() { const r = S.get('S5_40'); header('domo sobrellenado · 40 autos, con auto paciente (blanco)', 'repleto con o sin paciencia'); ringST(r.withAV, 0, 600, { vref: 10, mark: 0 }); claimsBox(r); },
    S6() { const r = S.get('S6'); header('colina de noche: la ola recorre >10 km hacia atrás', `ACELERADO ×${r.timeScale} · ${r.metrics.waveKmh.toFixed(1)} km/h · 10 km a los ${((r.metrics.t10km - 60) / 60).toFixed(1)} min`);
      // heat map: x = road position (12 km upstream of the tap .. 2 km downstream), y = time
      const L = r.p.L, xT = r.roles.tapX, xa = xT - 12500, xb = xT + 1500, x0 = PAD.l, x1 = W - PAD.r, y0 = PAD.t, y1 = H - PAD.b, t0 = 0, t1 = r.p.tEnd;
      for (let k = 0; k < r.nRec; k += 3) { const y = y0 + (k * r.recDt - t0) / (t1 - t0) * (y1 - y0); for (let i = 0; i < r.N; i++) { let x = ((r.xs(k, i) % L) + L) % L; let dx = x - xT; while (dx > 3000) dx -= L; while (dx < -13000) dx += L; x = xT + dx; if (x < xa || x > xb) continue; c.fillStyle = col(r.vs(k, i), 15, 0); c.fillRect(x0 + (x - xa) / (xb - xa) * (x1 - x0), y, 2, 3); } }
      c.fillStyle = '#fff'; for (let km = 0; km <= 12; km += 2) { const x = x0 + (xT - km * 1000 - xa) / (xb - xa) * (x1 - x0); c.fillRect(x, H - PAD.b, 1, 6); c.fillText(`-${km} km`, x - 14, H - PAD.b + 18); }
      for (let m = 0; m <= 40; m += 10) { const y = y0 + (60 + m * 60) / t1 * (y1 - y0); c.fillText(`${m} min`, 14, y); }
      claimsBox(r); },
    S7() { const r = S.get('S7'); header('anillo EE. UU. 21 autos: el auto paciente (blanco) derrite la ola', `ACELERADO ×${r.timeScale} · control a los ${r.events.find(e => e.type === 'control_on').tSim} s`); ringST(r, 120, 720, { vref: 7, mark: 0 }); events(r, 120, 720, ['control_on', 'wave_melted'], 0); claimsBox(r); },
    S8() { const r = S.get('S8'); header('la perilla +7 %: la ola vuelve; al bajarla, se apaga', `ACELERADO ×${r.timeScale}`); ringST(r, 480, 1020, { vref: 7, mark: 0 }); events(r, 480, 1020, ['knob_up', 'wave_back', 'knob_down'], 0); claimsBox(r); },
    S9() { const r = S.get('S9'); header('Mila al volante (blanco): la ola baja ~a la mitad', `ACELERADO ×${r.timeScale}`); ringST(r, 120, 720, { vref: 7, mark: 0 }); events(r, 120, 720, ['mila_takes_wheel'], 0); claimsBox(r); },
    S10() { const r = S.get('S10'); header('I-24: la ola pasa 2 activos (blanco) → 4 apagados (rosa) → 5 activos', `ACELERADO ×${r.timeScale} · bache (km/h) en ${r.metrics.profile.length} autos`);
      // amplitude profile along the platoon (wave meets cars from the front backwards)
      const p = r.metrics.profile, x0 = PAD.l, x1 = W - PAD.r, y0 = PAD.t + 20, y1 = H - PAD.b, mx = Math.max(...p.map(q => q.amp)) * 1.15;
      c.strokeStyle = '#ff4a36'; c.lineWidth = 3; c.beginPath(); p.forEach((q, k) => { const x = x0 + k / (p.length - 1) * (x1 - x0), y = y1 - q.amp / mx * (y1 - y0); k ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); c.lineWidth = 1;
      const xOf = car => x0 + (p[0].car - car) / (p[0].car - p[p.length - 1].car) * (x1 - x0);
      for (const a of r.roles.active) { c.fillStyle = '#fff'; c.fillRect(xOf(a) - 1, y0, 3, y1 - y0); } for (const a of r.roles.inactive) { c.fillStyle = '#e88'; c.fillRect(xOf(a) - 1, y0, 3, y1 - y0); }
      axes('autos, del frente hacia atrás (la ola viaja hacia atrás) →', 'bache de velocidad ↑'); claimsBox(r); },
    TOLL() { const r = S.get('TOLL'); header('peaje: llegan ~1300 veh/h, la caseta atiende ~720: la cola crece', 'blanco = Eli (en la variante paciente deja 40 m; atiende los mismos)'); const p = r.patient; roadST(p, 0, 160, p.xs(0, 0) - 10, 120, { hi: [p.roles.eli], vref: 8 });
      const x = PAD.l + (25 - (p.xs(0, 0) - 10)) / (120 - (p.xs(0, 0) - 10)) * (W - PAD.r - PAD.l); c.fillStyle = '#fff'; c.fillRect(x, PAD.t, 2, H - PAD.t - PAD.b); c.fillText('caseta', x + 4, PAD.t + 14); claimsBox(r); },
    SH() { const r = S.get('SH'); header('Short 9:16: recortes', 'ver SIM_REPORT (tabla del Short)'); c.fillStyle = '#ccc'; c.font = '15px sans-serif'; r.timeline.forEach((s, k) => c.fillText(`${s.from}-${s.to} s  ←  ${s.src} @ ${(+s.t0).toFixed(1)} s  ${s.label}  · ${s.note}`, 30, 110 + k * 34)); claimsBox(r); },
  };
  try { draw[id](); window.__done = true; } catch (e) { window.__error = String(e.stack || e); }
})();
