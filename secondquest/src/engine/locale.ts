import type { EpisodeBundle } from '../episodes';

/**
 * Localisation = swap three things per language: narration audio, script,
 * timings. Scenes, assets, camera, music and SFX are shared — and because
 * every scene is anchored to cue ids (l01…), the same scenes.json follows each
 * language's own cadence automatically. On-screen text uses LocalText
 * ({ "en": "...", "es": "..." }) and is picked by the same locale.
 *
 * Backward compatible: an episode without `locales` is single-language and
 * behaves exactly as before.
 */

/** Master locale first, then any extra locales declared in episode.json. */
export const episodeLocales = (b: EpisodeBundle): string[] => [
  b.episode.locale,
  ...Object.keys(b.episode.locales ?? {}).filter((l) => l !== b.episode.locale),
];

export const defaultNarrationPath = (locale: string) => `audio/${locale}/narration.wav`;

/**
 * Returns a bundle whose script/timings/narration are those of `locale`.
 * For the master locale (or undefined) the bundle is returned unchanged.
 */
export const localizeBundle = (b: EpisodeBundle, locale?: string): EpisodeBundle => {
  if (!locale || locale === b.episode.locale) return b;
  const cfg = b.episode.locales?.[locale];
  const data = b.localized?.[locale];
  if (!cfg || !data) {
    throw new Error(
      `Locale "${locale}" is not configured for ${b.episode.id}. Available: ${episodeLocales(b).join(', ')}. ` +
        `Add it to episode.json "locales" and register script/timings in src/episodes/index.ts (npm run add:locale).`,
    );
  }
  return {
    ...b,
    script: data.script,
    timings: data.timings,
    episode: {
      ...b.episode,
      narration: {
        audio: cfg.narration ?? defaultNarrationPath(locale),
        volume: cfg.volume ?? b.episode.narration.volume,
      },
    },
  };
};

/** Composition id: "ep001-hook" for the master locale, "ep001-hook-es" otherwise. */
export const compositionId = (episodeId: string, cutId: string, locale?: string, master?: string) =>
  !locale || locale === master ? `${episodeId}-${cutId}` : `${episodeId}-${cutId}-${locale}`;

/** Output-file suffix: none for the master locale, "_es" etc. otherwise. */
export const localeSuffix = (b: EpisodeBundle, locale?: string) => (!locale || locale === b.episode.locale ? '' : `_${locale}`);
