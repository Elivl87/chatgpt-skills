/**
 * Scaffold a new episode.
 *
 *   npm run new:episode -- ep002 zelda "Why Is Zelda's Map So Satisfying?"
 *
 * Creates episodes/<id>/{episode,script,timings,scenes,assets}.json, the
 * public/episodes/<id>_<slug>/ media folders, and registers the episode in
 * src/episodes/index.ts. Then: write script.json → record/generate narration →
 * `npm run narration:align -- <id>` → author scenes.json → `npm run dev`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs, ROOT } from './lib';

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
const assetRoot = `episodes/${id}_${slug}`;
mkdirSync(epDir, { recursive: true });
for (const d of ['backgrounds', 'characters', 'objects', 'overlays', 'audio', 'music', 'sfx']) mkdirSync(join(ROOT, 'public', assetRoot, d), { recursive: true });

const json = (file: string, data: unknown) => writeFileSync(join(epDir, file), JSON.stringify(data, null, 2) + '\n');

json('episode.json', {
  id,
  title,
  assetRoot,
  fps: 30,
  width: 1920,
  height: 1080,
  locale: 'en',
  narration: { audio: 'audio/narration.wav', volume: 1.0 },
  music: { duck: { to: 0.4, attack: 0.15, release: 0.6, lookahead: 0.1 }, cues: [] },
  cuts: { full: { label: 'Full episode', fromScene: 's01_intro', toScene: 's01_intro', output: `secondquest_${id}_full` } },
});
json('script.json', { episode: id, locale: 'en', lines: [{ id: 'l01', text: 'Replace this with the first line of narration.', pauseAfter: 0.5 }] });
json('timings.json', { source: 'audio/narration.wav', generatedBy: 'stub — run npm run narration:align', duration: 3, cues: { l01: { start: 0.3, end: 2.5 } } });
json('assets.json', {
  assets: {
    [`${id}.bg_intro`]: { path: 'backgrounds/intro.png', kind: 'background', aspect: 1.7778, color: ['#3a4a6a', '#1c2238'], label: 'Intro background', brief: 'Describe the shot for the illustrator.' },
  },
});
json('scenes.json', {
  episode: id,
  scenes: [
    {
      id: 's01_intro',
      start: 0,
      end: 'l01.end+0.5',
      camera: { moves: [{ type: 'push_in', amount: 0.06 }] },
      layers: [
        { asset: `${id}.bg_intro` },
        { asset: 'quest.excited', x: 0.5, y: 0.97, height: 0.55, shadow: true, animations: [{ type: 'pop_in', at: 'l01' }, { type: 'breathe' }] },
      ],
      sfx: [{ id: 'pop', at: 'l01' }],
    },
  ],
});

// register in src/episodes/index.ts
const reg = join(ROOT, 'src/episodes/index.ts');
let src = readFileSync(reg, 'utf8');
const v = id;
src = src.replace(
  '// @new-episode-imports',
  ['episode', 'script', 'timings', 'scenes', 'assets'].map((f) => `import ${v}${f[0].toUpperCase()}${f.slice(1)} from '../../episodes/${id}/${f}.json';`).join('\n') + '\n// @new-episode-imports',
);
src = src.replace(
  '  // @new-episode-entries',
  `  ${id}: {\n    episode: ${v}Episode as unknown as EpisodeConfig,\n    script: ${v}Script as unknown as ScriptFile,\n    timings: ${v}Timings as unknown as TimingsFile,\n    scenes: ${v}Scenes as unknown as ScenesFile,\n    assets: ${v}Assets as unknown as AssetCatalog,\n  },\n  // @new-episode-entries`,
);
writeFileSync(reg, src);

console.log(`Created episodes/${id} and public/${assetRoot}; registered in src/episodes/index.ts.
Next:
  1. write episodes/${id}/script.json
  2. put narration at public/${assetRoot}/audio/narration.wav (or npm run narration:tts -- ${id} ...)
  3. npm run narration:align -- ${id} --normalize
  4. author episodes/${id}/scenes.json + assets.json, preview with npm run dev
  5. npm run render -- ${id} full`);
