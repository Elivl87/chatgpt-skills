// Ep 001 · runs every sim state headless, checks each narrated claim, writes SIM_REPORT.md (+ events JSON).
//   node newchannel/ep/001/sim/validate.mjs [--only S1,S11] [--quick]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadK } from './load.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const K = loadK(), S = K.ep1sim;
const results = [];
for (const id of S.order) {
  if (only && !only.includes(id)) continue;
  const t0 = Date.now(); const run = S.get(id); const claims = S.states[id].claims(run); const ms = Date.now() - t0;
  results.push({ id, run, claims, ms });
  console.log(`\n== ${id} (${ms} ms) ${S.states[id].title}`);
  for (const c of claims) console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.id}: ${c.measured}   (target ${c.target})`);
}
if (!only || args.includes('--report')) (await import('./report.mjs')).writeReport(K, results, here);
const nf = results.reduce((a, r) => a + r.claims.filter(c => !c.pass).length, 0);
console.log(`\n${nf} failing claim(s)`);
