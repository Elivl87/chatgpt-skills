/**
 * Validate episode data and print the resolved timeline.
 *
 *   npm run validate            # all episodes
 *   npm run validate -- ep001   # one episode
 *
 * Exit code 1 on errors (unknown cue/asset/sound, bad ordering...).
 */
import { resolveCut } from '../src/engine/timeline';
import { validateEpisode } from '../src/engine/validate';
import { EPISODES, SFX, SHARED_ASSETS } from '../src/episodes';
import { fmt, hasPublicFile, parseArgs } from './lib';

export const runValidation = (only?: string, quiet = false): boolean => {
  let ok = true;
  for (const [id, bundle] of Object.entries(EPISODES)) {
    if (only && id !== only) continue;
    const issues = validateEpisode(bundle, SHARED_ASSETS, SFX, hasPublicFile);
    const errors = issues.filter((i) => i.level === 'error');
    if (!quiet || errors.length) {
      console.log(`\n■ ${id} — ${bundle.episode.title}`);
      for (const i of issues) console.log(`  ${i.level === 'error' ? '✖ ERROR' : '⚠ warn '}  ${i.where}: ${i.message}`);
      if (!issues.length) console.log('  ✔ no issues');
    }
    if (errors.length) {
      ok = false;
      continue;
    }
    if (quiet) continue;
    for (const cutId of Object.keys(bundle.episode.cuts)) {
      const cut = resolveCut(bundle, cutId, SFX, hasPublicFile);
      console.log(`\n  cut "${cutId}"  ${cut.durationSec.toFixed(2)}s  (${cut.durationInFrames} frames @ ${cut.fps}fps)  scenes: ${cut.scenes.length}  sfx: ${cut.audio.sfx.length}  music: ${cut.audio.music.length}`);
      console.log('  scene                    start     dur   in');
      for (const rs of cut.scenes) {
        console.log(
          `  ${rs.scene.id.padEnd(22)} ${fmt(rs.startSec - cut.offsetSec)} ${fmt(rs.duration / cut.fps)}   ${rs.enter ? `${rs.enter.type} ${rs.enter.duration}s` : 'cut'}`,
        );
      }
    }
  }
  return ok;
};

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop() ?? '');
if (isMain) {
  const { positional } = parseArgs();
  process.exit(runValidation(positional[0]) ? 0 : 1);
}
