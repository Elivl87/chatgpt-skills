// Node loader for the ep001 sims: runs the art kit's core.js + sim.js and this folder's engine.js + states.js in the
// global scope (they are plain browser scripts that attach to globalThis.K), then returns K.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const files = ['../../../art/lib/core.js', '../../../art/lib/sim.js', 'engine.js', 'states.js'];
export function loadK(extra = []) {
  for (const f of [...files, ...extra]) {
    const p = path.resolve(here, f);
    if (fs.existsSync(p)) vm.runInThisContext(fs.readFileSync(p, 'utf8'), { filename: p });
  }
  return globalThis.K;
}
