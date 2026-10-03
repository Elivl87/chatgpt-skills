import type { ProductionConfig, PronunciationLexicon } from '../engine/production';
import type { AssetCatalog, EpisodeConfig, ScenesFile, ScriptFile, SfxCatalog, TimingsFile } from '../schema/types';

import sharedAssets from '../../shared/assets.json';
import artCatalog from '../../shared/art_catalog.json';
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
import ep001fullEpisode from '../../episodes/ep001full/episode.json';
import ep001fullScript from '../../episodes/ep001full/script.json';
import ep001fullTimings from '../../episodes/ep001full/timings.json';
import ep001fullScenes from '../../episodes/ep001full/scenes.json';
import ep001fullAssets from '../../episodes/ep001full/assets.json';
import ep001shortEpisode from '../../episodes/ep001short/episode.json';
import ep001shortScenes from '../../episodes/ep001short/scenes.json';
import ep002Episode from '../../episodes/ep002/episode.json';
import ep002Script from '../../episodes/ep002/script.json';
import ep002Timings from '../../episodes/ep002/timings.json';
import ep002Scenes from '../../episodes/ep002/scenes.json';
import ep002Assets from '../../episodes/ep002/assets.json';
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

/**
 * Shared cast catalog + the FINAL_ART catalog (shared/art_catalog.json, written only by
 * `npm run art:intake`). FINAL_ART entries override legacy entries with the same key.
 */
export const SHARED_ASSETS: AssetCatalog = {
  ...(sharedAssets as unknown as AssetCatalog),
  assets: { ...(sharedAssets as unknown as AssetCatalog).assets, ...(artCatalog as unknown as AssetCatalog).assets },
};
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
  ep001full: {
    episode: ep001fullEpisode as unknown as EpisodeConfig,
    script: ep001fullScript as unknown as ScriptFile,
    timings: ep001fullTimings as unknown as TimingsFile,
    scenes: ep001fullScenes as unknown as ScenesFile,
    assets: ep001fullAssets as unknown as AssetCatalog,
  },
  // vertical Short: same script, Bram timings and art as ep001full, re-framed 9:16 (scripts/ep001-short.py)
  ep001short: {
    episode: ep001shortEpisode as unknown as EpisodeConfig,
    script: ep001fullScript as unknown as ScriptFile,
    timings: ep001fullTimings as unknown as TimingsFile,
    scenes: ep001shortScenes as unknown as ScenesFile,
    assets: ep001fullAssets as unknown as AssetCatalog,
  },
  ep002: {
    episode: ep002Episode as unknown as EpisodeConfig,
    script: ep002Script as unknown as ScriptFile,
    timings: ep002Timings as unknown as TimingsFile,
    scenes: ep002Scenes as unknown as ScenesFile,
    assets: ep002Assets as unknown as AssetCatalog,
  },
  // @new-episode-entries (scripts/new-episode.ts inserts above this line)
};

// FINAL_ART keys always win: an episode's legacy entry with the same key is dropped.
for (const b of Object.values(EPISODES)) {
  const art = (artCatalog as unknown as AssetCatalog).assets;
  b.assets = { ...b.assets, assets: Object.fromEntries(Object.entries(b.assets.assets).filter(([k]) => !(k in art))) };
}
