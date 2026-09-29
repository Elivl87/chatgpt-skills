/**
 * Validate episode data and print the resolved timeline (per language).
 *
 *   npm run validate            # all episodes, all locales
 *   npm run validate -- ep001   # one episode
 *
 * Exit code 1 on errors (unknown cue/asset/sound, bad ordering, locale cue-id mismatch...).
 */
import { localizeBundle } from '../src/engine/locale';
import { resolveCut } from '../src/engine/timeline';
import { validateAllLocales, validateLocales, type Issue } from '../src/engine/validate';
import { EPISODES, SFX, SHARED_ASSETS } from '../src/episodes';
import { fmt, hasPublicFile, parseArgs } from './lib';

const print = (issues: Issue[]) => {
  for (const i of issues) console.log(`  ${i.level === 'error' ? '✖ ERROR' : '⚠ warn '}  ${i.where}: ${i.message}`);
};

export const runValidation = (only?: string, quiet = false): boolean => {
  let ok = true;
  for (const [id, bundle] of Object.entries(EPISODES)) {
    if (only && id !== only) continue;
    const perLocale = validateAllLocales(bundle, SHARED_ASSETS, SFX, hasPublicFile);
    const localeIssues = validateLocales(bundle);
    const errors = [...perLocale.flatMap((l) => l.issues), ...localeIssues].filter((i) => i.level === 'error');
    if (!quiet || errors.length) {
      console.log(`\n■ ${id} — ${bundle.episode.title}`);
      for (const { locale, issues } of perLocale) {
        console.log(`\n  [${locale}${locale === bundle.episode.locale ? ' · master' : ''}]`);
        print(quiet ? issues.filter((i) => i.level === 'error') : issues);
        if (!issues.length) console.log('  ✔ no issues');
      }
      if (localeIssues.length) {
        console.log('\n  [localisation]');
        print(quiet ? localeIssues.filter((i) => i.level === 'error') : localeIssues);
      }
    }
    if (errors.length) {
      ok = false;
      continue;
    }
    if (quiet) continue;
    for (const { locale } of perLocale) {
      const b = localizeBundle(bundle, locale);
      for (const cutId of Object.keys(b.episode.cuts)) {
        const cut = resolveCut(b, cutId, SFX, hasPublicFile);
        console.log(
          `\n  cut "${cutId}" [${locale}]  ${cut.durationSec.toFixed(2)}s  (${cut.durationInFrames} frames @ ${cut.fps}fps)  scenes: ${cut.scenes.length}  sfx: ${cut.audio.sfx.length}  music: ${cut.audio.music.length}`,
        );
        console.log('  scene                    start     dur   in');
        for (const rs of cut.scenes) {
          console.log(
            `  ${rs.scene.id.padEnd(22)} ${fmt(rs.startSec - cut.offsetSec)} ${fmt(rs.duration / cut.fps)}   ${rs.enter ? `${rs.enter.type} ${rs.enter.duration}s` : 'cut'}`,
          );
        }
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
