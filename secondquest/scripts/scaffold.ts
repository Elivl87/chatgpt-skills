import type { ProductionConfig } from '../src/engine/production';

/**
 * Pure builders for new episodes. Everything comes from shared/production.json
 * (default locale = English, official mix/ducking, 1080p30) so a new episode is
 * born with the approved production defaults. Used by new-episode.ts and tests.
 */
export interface EpisodeSeed {
  id: string;
  slug: string;
  title: string;
}

export const episodeFiles = (seed: EpisodeSeed, p: ProductionConfig) => {
  const d = p.episodeDefaults;
  const assetRoot = `episodes/${seed.id}_${seed.slug}`;
  return {
    assetRoot,
    'episode.json': {
      id: seed.id,
      title: seed.title,
      assetRoot,
      fps: d.fps,
      width: d.width,
      height: d.height,
      locale: p.defaultLocale,
      narration: { ...d.narration },
      music: {
        duck: { ...d.music.duck },
        cues: [{ ...d.music.bed, start: 0, end: 'end', note: 'Placeholder bed (npm run audio:placeholders). Replace with the episode track.' }],
      },
      cuts: { full: { label: 'Full episode', fromScene: 's01_intro', toScene: 's01_intro', output: `secondquest_${seed.id}_full` } },
    },
    'script.json': {
      episode: seed.id,
      locale: p.defaultLocale,
      lines: [{ id: 'l01', text: 'Replace this with the first line of narration.', pauseAfter: 0.5 }],
      placeholderTts: { leadIn: 0.3, note: 'Voice, speed and phonemizer come from shared/production.json (voices.<locale>).' },
    },
    'timings.json': { source: d.narration.audio, generatedBy: 'stub — run npm run narration:tts or narration:align', duration: 3, cues: { l01: { start: 0.3, end: 2.5 } } },
    'assets.json': {
      assets: {
        [`${seed.id}.bg_intro`]: { path: 'backgrounds/intro.png', kind: 'background', aspect: 1.7778, color: ['#3a4a6a', '#1c2238'], label: 'Intro background', brief: 'Describe the shot for the illustrator.' },
      },
    },
    'scenes.json': {
      episode: seed.id,
      scenes: [
        {
          id: 's01_intro',
          start: 0,
          end: 'l01.end+0.5',
          camera: { moves: [{ type: 'push_in', amount: 0.06 }] },
          layers: [
            { asset: `${seed.id}.bg_intro` },
            { asset: 'quest.excited', x: 0.5, y: 0.97, height: 0.55, shadow: true, animations: [{ type: 'pop_in', at: 'l01' }, { type: 'breathe' }] },
          ],
          sfx: [{ id: 'pop', at: 'l01' }],
        },
      ],
    },
  };
};

/** Inserts the registry entry for a new episode into src/episodes/index.ts source. */
export const registerEpisodeSource = (src: string, id: string): string => {
  if (!src.includes('// @new-episode-imports') || !src.includes('  // @new-episode-entries')) throw new Error('registry markers missing in src/episodes/index.ts');
  if (src.includes(`  ${id}: {`)) throw new Error(`${id} is already registered`);
  const files = ['episode', 'script', 'timings', 'scenes', 'assets'];
  const imports = files.map((f) => `import ${id}${f[0].toUpperCase()}${f.slice(1)} from '../../episodes/${id}/${f}.json';`).join('\n');
  const entry =
    `  ${id}: {\n    episode: ${id}Episode as unknown as EpisodeConfig,\n    script: ${id}Script as unknown as ScriptFile,\n` +
    `    timings: ${id}Timings as unknown as TimingsFile,\n    scenes: ${id}Scenes as unknown as ScenesFile,\n    assets: ${id}Assets as unknown as AssetCatalog,\n` +
    `    localized: {\n      // @locales:${id} (scripts/add-locale.ts inserts above this line)\n    },\n  },\n`;
  return src.replace('// @new-episode-imports', `${imports}\n// @new-episode-imports`).replace('  // @new-episode-entries', `${entry}  // @new-episode-entries`);
};

export const EPISODE_DIRS = ['backgrounds', 'characters', 'objects', 'overlays', 'audio', 'music', 'sfx'];
