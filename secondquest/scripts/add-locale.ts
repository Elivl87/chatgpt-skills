/**
 * Add a language to an episode.
 *
 *   npm run add:locale -- ep001 es
 *
 * Creates (if missing):
 *   episodes/<ep>/script.<loc>.json    same cue ids as the master script; translate the text
 *   episodes/<ep>/timings.<loc>.json   stub copied from master; replaced by narration:align/tts
 *   public/<assetRoot>/audio/<loc>/    where the narration WAV goes
 * and declares the locale in episode.json + registers it in src/episodes/index.ts.
 *
 * The language is then fully supported but, by production policy, only rendered
 * on explicit request (--locale <loc>); English remains the default output.
 *
 * Then: translate script.<loc>.json → record narration → `npm run narration:align -- <ep> --locale <loc>`
 * → localise on-screen text in scenes.json ({"en": "...", "<loc>": "..."}) → `npm run validate`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PRODUCTION } from '../src/episodes';
import { parseArgs, PUBLIC, ROOT } from './lib';

const { positional } = parseArgs();
const [ep, loc] = positional;
if (!ep || !loc || !/^[a-z]{2}(-[A-Z]{2})?$/.test(loc)) {
  console.error('Usage: npm run add:locale -- ep001 es');
  process.exit(1);
}
const epDir = join(ROOT, 'episodes', ep);
const episodePath = join(epDir, 'episode.json');
if (!existsSync(episodePath)) {
  console.error(`episodes/${ep} does not exist`);
  process.exit(1);
}
const episode = JSON.parse(readFileSync(episodePath, 'utf8'));
if (loc === episode.locale) {
  console.error(`"${loc}" is already the master locale of ${ep}`);
  process.exit(1);
}
const narration = `audio/${loc}/narration.wav`;
const created: string[] = [];

const scriptPath = join(epDir, `script.${loc}.json`);
if (!existsSync(scriptPath)) {
  const master = JSON.parse(readFileSync(join(epDir, 'script.json'), 'utf8'));
  const { placeholderTts: _tts, ...rest } = master;
  writeFileSync(scriptPath, JSON.stringify({ ...rest, locale: loc, status: `UNTRANSLATED — text copied from "${episode.locale}"; translate every line, keep the ids`, lines: master.lines }, null, 2) + '\n');
  created.push(`episodes/${ep}/script.${loc}.json`);
}
const timingsPath = join(epDir, `timings.${loc}.json`);
if (!existsSync(timingsPath)) {
  const master = JSON.parse(readFileSync(join(epDir, 'timings.json'), 'utf8'));
  writeFileSync(timingsPath, JSON.stringify({ ...master, source: narration, generatedBy: `stub — copy of ${episode.locale} timings; run narration:align --locale ${loc}` }, null, 2) + '\n');
  created.push(`episodes/${ep}/timings.${loc}.json`);
}
mkdirSync(join(PUBLIC, episode.assetRoot, 'audio', loc), { recursive: true });

episode.locales = { ...(episode.locales ?? {}), [loc]: { narration, ...(episode.locales?.[loc] ?? {}) } };
writeFileSync(episodePath, JSON.stringify(episode, null, 2) + '\n');

// register in src/episodes/index.ts
const reg = join(ROOT, 'src/episodes/index.ts');
let src = readFileSync(reg, 'utf8');
const marker = `// @locales:${ep}`;
if (!src.includes(marker)) {
  console.error(`Marker "${marker}" not found in src/episodes/index.ts — add a \`localized: { ${marker} }\` block to the ${ep} entry.`);
  process.exit(1);
}
const V = `${ep}${loc.replace(/-/g, '').replace(/^./, (c) => c.toUpperCase())}`;
if (!src.includes(`${V}Script `)) {
  src = src.replace(
    '// @new-episode-imports',
    `import ${V}Script from '../../episodes/${ep}/script.${loc}.json';\nimport ${V}Timings from '../../episodes/${ep}/timings.${loc}.json';\n// @new-episode-imports`,
  );
  src = src.replace(
    `      ${marker}`,
    `      '${loc}': { script: ${V}Script as unknown as ScriptFile, timings: ${V}Timings as unknown as TimingsFile },\n      ${marker}`,
  );
  writeFileSync(reg, src);
}

if (!PRODUCTION.voices[loc]) console.warn(`⚠ No voice for "${loc}" in shared/production.json (voices.${loc}) — add one before generating narration.`);
console.log(`Locale "${loc}" added to ${ep}.${created.length ? `\n  created: ${created.join(', ')}` : ''}
Next:
  1. translate episodes/${ep}/script.${loc}.json (keep ids; remove "status" when approved)
  2. narration → public/${episode.assetRoot}/${narration}
  3. npm run narration:align -- ${ep} --locale ${loc} --normalize
  4. localise on-screen text in scenes.json:  "text": { "${episode.locale}": "...", "${loc}": "..." }
  5. npm run validate && npm run render -- ${ep} <cut> --locale ${loc}`);
