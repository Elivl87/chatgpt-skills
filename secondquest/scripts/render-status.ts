/** "¿Cómo va el render?": prints the live progress written by scripts/render.ts (npm run render:status). */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib';

const f = join(ROOT, 'renders/tmp/progress.json');
if (!existsSync(f)) {
  console.log('No render in progress.');
} else {
  const p = JSON.parse(readFileSync(f, 'utf8'));
  const m = (s?: number) => (s === undefined ? '?' : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`);
  const ageSec = (Date.now() - Date.parse(p.updated)) / 1000;
  console.log(`${p.name}: ${p.pct}% (${p.renderedFrames}/${p.totalFrames} frames), elapsed ${m(p.elapsedSec)}, remaining ~${m(p.etaSec)}`);
  if (p.finishesAt) console.log(`expected to finish at ${p.finishesAt} (UTC; Colombia = UTC-5)`);
  if (ageSec > 120) console.log(`⚠ no update for ${Math.round(ageSec)} s: the render may have stopped`);
}
