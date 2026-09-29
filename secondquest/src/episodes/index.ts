import type { ProductionConfig, PronunciationLexicon } from '../engine/production';
import type { AssetCatalog, EpisodeConfig, ScenesFile, ScriptFile, SfxCatalog, TimingsFile } from '../schema/types';

import sharedAssets from '../../shared/assets.json';
import sharedSfx from '../../shared/sfx.json';
import production from '../../shared/production.json';
import pronunciation from '../../shared/pronunciation.json';

import ep001Episode from '../../episodes/ep001/episode.json';
import ep001Script from '../../episodes/ep001/script.json';
import ep001Timings from '../../episodes/ep001/timings.json';
import ep001Scenes from '../../episodes/ep001/scenes.json';
import ep001Assets from '../../episodes/ep001/assets.json';
import ep001EsScript from '../../episodes/ep001/script.es.json';
import ep001EsTimings from '../../episodes/ep001/timings.es.json';
// @new-episode-imports (scripts/new-episode.ts inserts above this line)

/**
 * Episode registry. To add an episode: create episodes/epXXX/*.json
 * (`npm run new:episode -- ep002 my_slug "Title"` does both steps).
 * To add a language: `npm run add:locale -- ep001 es`.
 */
export interface EpisodeBundle {
  episode: EpisodeConfig;
  /** Master-locale script + timings. */
  script: ScriptFile;
  timings: TimingsFile;
  scenes: ScenesFile;
  assets: AssetCatalog;
  /** Extra locales (see src/engine/locale.ts). Same cue ids as the master script. */
  localized?: Record<string, { script: ScriptFile; timings: TimingsFile }>;
}

export const SHARED_ASSETS = sharedAssets as unknown as AssetCatalog;
export const SFX = sharedSfx as unknown as SfxCatalog;
/** Production policy: default locale (en), official voices, episode defaults (shared/production.json). */
export const PRODUCTION = production as unknown as ProductionConfig;
/** Shared pronunciation overrides per locale (shared/pronunciation.json). */
export const PRONUNCIATION = pronunciation as unknown as PronunciationLexicon;

export const EPISODES: Record<string, EpisodeBundle> = {
  ep001: {
    episode: ep001Episode as unknown as EpisodeConfig,
    script: ep001Script as unknown as ScriptFile,
    timings: ep001Timings as unknown as TimingsFile,
    scenes: ep001Scenes as unknown as ScenesFile,
    assets: ep001Assets as unknown as AssetCatalog,
    localized: {
      'es': { script: ep001EsScript as unknown as ScriptFile, timings: ep001EsTimings as unknown as TimingsFile },
      // @locales:ep001 (scripts/add-locale.ts inserts above this line)
    },
  },
  // @new-episode-entries (scripts/new-episode.ts inserts above this line)
};
