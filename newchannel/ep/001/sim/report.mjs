// Writes SIM_REPORT.md and SIM_EVENTS.json from validate.mjs results.
import fs from 'node:fs';
import path from 'node:path';

const fmtD = d => Object.entries(d).filter(([k, v]) => typeof v !== 'object' && k !== 'kind').map(([k, v]) => `${k}=${v}`).join(', ');

export function writeReport(K, results, dir) {
  const S = K.ep1sim, D = S.DRIVERS;
  const L = [];
  const nPass = results.reduce((a, r) => a + r.claims.filter(c => c.pass).length, 0), nAll = results.reduce((a, r) => a + r.claims.length, 0);
  L.push('# Ep 001 · SIM_REPORT (generado por `validate.mjs`; no editar a mano)', '');
  L.push(`Guion: \`SCRIPT_ES419.md\` v3 (bloqueado). Estados: ${results.length}. Afirmaciones verificadas: **${nPass} / ${nAll} pasan**.`, '');
  L.push('**Las simulaciones son ilustraciones, no reproducciones** de los experimentos (Sugiyama 2008, Tadaki 2013, Stern 2018,',
    'Lee 2025). Los números en pantalla salen de los artículos (`FACTS.md`); el sim tiene que ir en la misma dirección y ser',
    'honesto. Todo en unidades reales (m, s); el sello **ACELERADO ×N** es `timeScale` (t_sim = simT0 + t_video × N).', '');
  L.push('Motor: `engine.js` (extiende el IDM del kit `art/lib/sim.js`: conductores por auto, tiempo de reacción, ruido con semilla,',
    'FollowerStopper, conductor paciente, peaje). Interfaz idéntica a `K.sim.ring` (`run.at(t)`, `run.brake(i,t)`, `run.onsets(i)`),',
    'más `run.roles`, `run.events`, `run.metrics`. Luz de freno = fórmula del kit (se enciende con a < −0,25 m/s² o v < 1 m/s).', '');
  // kit cross-check
  const kc = kitCheck(K);
  L.push(`Comprobación cruzada con el kit: con parámetros homogéneos y sin retraso, \`engine.js\` reproduce \`K.sim.ring\` (22 autos, 230 m, mismo toque) con diferencia máx. de posición **${kc.toExponential(1)} m** en 20 s.`, '');
  L.push('## Calibraciones de conductores (IDM: a, b, T, s0, v0, δ=4; tau = tiempo de reacción)', '');
  L.push('| Nombre | Parámetros | Uso |', '|---|---|---|');
  const uses = { RING_JP: 'S2, S5', HUMAN: 'S1, S3, S4, S11, peaje', ELI_CLOSER: 'S1, S19 arriba', PATIENT: 'S11, S19 abajo', CLOSER_US: 'S7-S9', FS: 'S7, S8, S5 (40)', MILA_HUMAN: 'S9', HWY: 'S6, S10', SMART: 'S10' };
  for (const [k, d] of Object.entries(D)) L.push(`| \`${k}\` (${d.kind}) | ${fmtD(d)}${d.safety ? '; safety IDM ' + fmtD(d.safety) : ''}${d.dx0 ? '; dx0=' + d.dx0.join('/') + ' m, d=' + d.d.join('/') : ''}${d.kin ? '; kin smin=' + d.kin.smin + ' m, ttc=' + d.kin.ttc + ' s' : ''} | ${uses[k] || ''} |`);
  L.push('', 'Valores físicamente razonables: a 0,5-2 m/s², b 1,5-3 m/s², T 0,4-1,2 s, s0 1-2,5 m (Treiber & Kesting, *Traffic Flow Dynamics*). Coche de 4,5 m.', '');
  L.push('## Resumen', '', '| Estado | Beats | ACELERADO | Semilla | Afirmaciones |', '|---|---|---|---|---|');
  for (const r of results) {
    const st = S.states[r.id], p = r.run.p || {};
    L.push(`| ${r.id} | ${st.beats} | ×${r.run.timeScale} | ${p.seed ?? '—'} | ${r.claims.filter(c => c.pass).length} / ${r.claims.length} ${r.claims.every(c => c.pass) ? 'PASA' : '**FALLA**'} |`);
  }
  L.push('');
  const events = {};
  for (const r of results) {
    const st = S.states[r.id], run = r.run, p = run.p || {};
    L.push(`## ${r.id} · ${st.title}`, '');
    L.push(`- Beats: ${st.beats} · ACELERADO ×${run.timeScale} · simT0 = ${run.simT0} s · semilla ${p.seed ?? '—'} · ${run.N} autos${p.L ? ` · anillo ${p.L} m` : ''}${p.geometry ? ' · ' + (p.geometry === 'ring' ? 'periódico' : 'carril abierto') : ''} · dt ${p.dt ?? '—'} s · cálculo ${r.ms} ms`);
    if (run.roles && Object.keys(run.roles).length) L.push(`- Roles: \`${JSON.stringify(run.roles, (k, v) => (Array.isArray(v) && v.length > 8 ? `[${v.length} autos]` : typeof v === 'function' ? undefined : v))}\``);
    L.push('', '| | Afirmación (guion) | Medido en el sim | Objetivo | |', '|---|---|---|---|---|');
    for (const c of r.claims) L.push(`| ${c.id} | ${c.claim} | ${c.measured} | ${c.target} | ${c.pass ? 'PASA' : '**FALLA**'} |`);
    const notes = r.claims.filter(c => c.note);
    if (notes.length) { L.push(''); for (const c of notes) L.push(`> ${c.id}: ${c.note}`); }
    const ev = run.eventsSorted ? run.eventsSorted() : run.events || [];
    if (ev.length) {
      const keyEv = ev.filter(e => !['brake_onset', 'stop', 'wave_passes_active', 'wave_passes_inactive', 'wave_km'].includes(e.type));
      L.push('', 'Eventos clave (t = segundos de video, t_sim = segundos de simulación):', '');
      for (const e of keyEv) L.push(`- \`${e.type}\` t = ${e.t} s (t_sim ${e.tSim} s)${e.car != null ? ` · auto ${e.car}` : ''}${e.label ? ` · ${e.label}` : ''}`);
      const ons = ev.filter(e => e.type === 'brake_onset');
      if (ons.length) L.push(`- inicios de frenado (${ons.length}): ` + ons.slice(0, 14).map(e => `${e.back != null ? '#' + e.back : e.carNo != null ? 'n.º' + e.carNo : 'a' + e.car}@${e.t}s`).join(', ') + (ons.length > 14 ? ' …' : ''));
    }
    if (r.id === 'SH') { L.push('', '| Short (s) | Fuente | t0 en la fuente (video) | Sello | Nota |', '|---|---|---|---|---|'); for (const s of run.timeline) L.push(`| ${s.from}-${s.to} | ${s.src} | ${(+s.t0).toFixed(2)} | ${s.label} | ${s.note} |`); }
    L.push('');
    events[r.id] = { timeScale: run.timeScale, simT0: run.simT0, N: run.N, roles: run.roles, events: ev, metrics: slim(run.metrics) };
  }
  fs.writeFileSync(path.join(dir, 'SIM_REPORT.md'), L.join('\n'));
  fs.writeFileSync(path.join(dir, 'SIM_EVENTS.json'), JSON.stringify(events, (k, v) => (typeof v === 'number' ? +v.toFixed(3) : typeof v === 'function' ? undefined : v), 1));
  console.log('wrote SIM_REPORT.md, SIM_EVENTS.json');
}
function slim(m) { if (!m) return m; return JSON.parse(JSON.stringify(m, (k, v) => (k === 'waveFit' || k === 'fit' ? undefined : v))); }
function kitCheck(K) {
  const S = K.ep1sim, p = { N: 22, L: 230, v0: 15, T: 0.7, a: 1.5, b: 1.5, s0: 1.5, delta: 4 };
  const kit = K.sim.ring(Object.assign({}, p, { timeScale: 1, fps: 50, preroll: 0, duration: 20, dt: 0.02, taps: [{ car: 0, t: 1, dur: 0.75, decel: 4 }] }));
  const vEq = kit.vEq;
  const d = Object.assign({ kind: 'idm' }, p);
  const run = S.simulate({ N: 22, L: 230, geometry: 'ring', drivers: Array.from({ length: 22 }, () => d), x0: Array.from({ length: 22 }, (_, i) => i * 230 / 22), v0init: new Array(22).fill(vEq), dt: 0.02, recDt: 0.02, tEnd: 20, taps: [{ car: 0, t: 1, dur: 0.75, decel: 4 }] });
  let m = 0; for (let t = 0; t < 19.5; t += 0.5) { const a = kit.at(t).x, k = Math.round(t / 0.02); for (let i = 0; i < 22; i++) m = Math.max(m, Math.abs(a[i] - run.xs(k + 1, i))); }   // the kit records after each frame's step
  return m;
}
