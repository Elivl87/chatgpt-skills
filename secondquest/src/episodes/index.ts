import type { AssetCatalog, EpisodeConfig, ScenesFile, ScriptFile, SfxCatalog, TimingsFile } from '../schema/types';

import sharedAssets from '../../shared/assets.json';
import sharedSfx from '../../shared/sfx.json';

import ep001Episode from '../../episodes/ep001/episode.json';
import ep001Script from '../../episodes/ep001/script.json';
import ep001Timings from '../../episodes/ep001/timings.json';
import ep001Scenes from '../../episodes/ep001/scenes.json';
import ep001Assets from '../../episodes/ep001/assets.json';
// @new-episode-imports (scripts/new-episode.ts inserts above this line)

/**
 * Episode registry. To add an episode: create episodes/epXXX/*.json
 * (`npm run new:episode -- ep002 my_slug "Title"` does both steps).
 */
export interface EpisodeBundle {
  episode: EpisodeConfig;
  script: ScriptFile;
  timings: TimingsFile;
  scenes: ScenesFile;
  assets: AssetCatalog;
}

export const SHARED_ASSETS = sharedAssets as unknown as AssetCatalog;
export const SFX = sharedSfx as unknown as SfxCatalog;

export const EPISODES: Record<string, EpisodeBundle> = {
  ep001: {
    episode: ep001Episode as unknown as EpisodeConfig,
    script: ep001Script as unknown as ScriptFile,
    timings: ep001Timings as unknown as TimingsFile,
    scenes: ep001Scenes as unknown as ScenesFile,
    assets: ep001Assets as unknown as AssetCatalog,
  },
  // @new-episode-entries (scripts/new-episode.ts inserts above this line)
};
