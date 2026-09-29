/**
 * Scaffold a new episode with the official production defaults
 * (shared/production.json): English master locale, official voice, approved
 * mix/ducking, placeholder music bed, 1080p30.
 *
 *   npm run new:episode -- ep002 zelda "Why Is Zelda's Map So Satisfying?"
 *
 * Creates episodes/<id>/{episode,script,timings,scenes,assets}.json, the
 * public/episodes/<id>_<slug>/ media folders, and registers the episode in
 * src/episodes/index.ts. Spanish (or any language) is added later, on demand:
 * `npm run add:locale -- <id> es`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PRODUCTION } from '../src/episodes';
import { parseArgs, ROOT } from './lib';
import { EPISODE_DIRS, episodeFiles, registerEpisodeSource } from './scaffold';

const { positional } = parseArgs();
const [id, slug, title = 'Untitled episode'] = positional;
if (!id || !/^ep\d{3,}$/.test(id) || !slug || !/^[a-z0-9_]+$/.test(slug)) {
  console.error('Usage: npm run new:episode -- ep002 my_slug "Episode title"');
  process.exit(1);
}
const epDir = join(ROOT, 'episodes', id);
if (existsSync(epDir)) {
  console.error(`episodes/${id} already exists`);
  process.exit(1);
}
const files = episodeFiles({ id, slug, title }, PRODUCTION);
mkdirSync(epDir, { recursive: true });
for (const d of EPISODE_DIRS) mkdirSync(join(ROOT, 'public', files.assetRoot, d), { recursive: true });
for (const f of ['episode.json', 'script.json', 'timings.json', 'assets.json', 'scenes.json'] as const) {
  writeFileSync(join(epDir, f), JSON.stringify(files[f], null, 2) + '\n');
}
const reg = join(ROOT, 'src/episodes/index.ts');
writeFileSync(reg, registerEpisodeSource(readFileSync(reg, 'utf8'), id));

console.log(`Created episodes/${id} and public/${files.assetRoot}; registered in src/episodes/index.ts.
Defaults: locale ${PRODUCTION.defaultLocale}, voice ${PRODUCTION.voices[PRODUCTION.defaultLocale].voice}@${PRODUCTION.voices[PRODUCTION.defaultLocale].speed}, music duck ${PRODUCTION.episodeDefaults.music.duck.to} / sfx ${PRODUCTION.episodeDefaults.music.duck.sfxTo}, bed ${PRODUCTION.episodeDefaults.music.bed.volume}.
Next:
  1. write episodes/${id}/script.json
  2. narration: record it, or npm run narration:tts -- ${id} --model … --voices …
  3. npm run narration:align -- ${id} --normalize   (real recordings)
  4. author episodes/${id}/scenes.json + assets.json, preview with npm run dev
  5. npm run audio:placeholders -- ${id} && npm run render:episode -- ${id}
  (other languages, on demand only: npm run add:locale -- ${id} es)`);
