/**
 * Fix CAMERA_JUMP errors (Producer rule: no zoom restart on back-to-back scenes that share a
 * background) by making each flagged scene continue the previous camera.
 *
 *   npm run camera:fix -- ep001full            # dry run: what would change, and its side effects
 *   npm run camera:fix -- ep001full --write    # apply to episodes/<id>/scenes.json
 *
 * The fix sets `camera.start: "continue"` and keeps the scene's own moves. Continuing can push
 * the zoom higher (the next scene's push stacks on the previous one), so the dry run also runs
 * the art contract and reports any new SAFE_ZOOM / BAD_RESOLUTION blockers before anything is written.
 * Generated scene files (ep001full ← ep001-rewire.py, ep001short ← ep001-short.py) must get the
 * same change in their generator, or a regeneration will undo it.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateArtContract } from '../src/engine/artContract';
import { validateEpisode } from '../src/engine/validate';
import { EPISODES, PRODUCTION, SFX, SHARED_ASSETS, type EpisodeBundle } from '../src/episodes';
import type { Scene } from '../src/schema/types';
import { hasPublicFile, parseArgs, publicImageInfo, ROOT } from './lib';

const jumps = (b: EpisodeBundle) =>
  validateEpisode(b, SHARED_ASSETS, SFX, hasPublicFile)
    .filter((i) => i.message.startsWith('CAMERA_JUMP'))
    .map((i) => i.where.split('.')[1]);
const artBlockers = (b: EpisodeBundle) =>
  validateArtContract(b, SHARED_ASSETS, SFX, PRODUCTION, publicImageInfo)
    .filter((i) => i.level === 'error' && (i.code === 'SAFE_ZOOM' || i.code === 'BAD_RESOLUTION'))
    .map((i) => `${i.code} ${i.key} ${i.where}`);

const { positional, flags } = parseArgs();
const id = positional[0];
const base = EPISODES[id];
if (!base) throw new Error(`Unknown episode "${id}"`);

const before = jumps(base);
// Continuing one scene changes where it ends, which can expose a jump on the next one: repeat.
const changed = new Set<string>();
let scenes: Scene[] = base.scenes.scenes;
let fixed: EpisodeBundle = base;
let after = before;
for (let round = 0; round < 6 && after.length; round++) {
  after.forEach((s) => changed.add(s));
  scenes = base.scenes.scenes.map((s) => (changed.has(s.id) ? { ...s, camera: { ...s.camera, start: 'continue' as const } } : s));
  fixed = { ...base, scenes: { ...base.scenes, scenes } };
  after = jumps(fixed);
}
const artBefore = new Set(artBlockers(base));
const newArt = artBlockers(fixed).filter((x) => !artBefore.has(x));

console.log(`${id}: ${before.length} CAMERA_JUMP → ${after.length} after the fix`);
for (const s of changed) console.log(`  continue  ${s}`);
if (after.length) console.log(`  still jumping: ${after.join(', ')}`);
if (newArt.length) {
  console.log(`  ⚠ the fix introduces ${newArt.length} art-contract blocker(s):`);
  for (const x of newArt) console.log(`    ${x}`);
}
if (flags.write) {
  if (newArt.length || after.length) {
    console.error('Not written: resolve the issues above first (e.g. soften the scene’s own push_in).');
    process.exit(1);
  }
  writeFileSync(join(ROOT, 'episodes', id, 'scenes.json'), JSON.stringify({ ...base.scenes, scenes }, null, 2) + '\n');
  console.log(`Written episodes/${id}/scenes.json`);
}
