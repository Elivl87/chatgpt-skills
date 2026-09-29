import { episodeLocales } from '../src/engine/locale';
import { renderLocale } from '../src/engine/production';
import { EPISODES, PRODUCTION } from '../src/episodes';

/**
 * Resolves what a render/still/stem command should produce.
 *
 * Policy: English (production default) unless --locale is passed explicitly.
 * Cut: the one given, else "full" if the episode has it, else its only cut.
 * Pure (no rendering) so it can be unit-tested.
 */
export interface RenderTarget {
  episodeId: string;
  cutId: string;
  locale: string;
  explicitLocale: boolean;
}

export const resolveRenderTarget = (positional: string[], flags: Record<string, string | boolean>): RenderTarget => {
  const episodeId = positional[0];
  if (!episodeId) throw new Error('Missing episode id, e.g. `npm run render:episode -- ep002`');
  const bundle = EPISODES[episodeId];
  if (!bundle) throw new Error(`Unknown episode "${episodeId}". Known: ${Object.keys(EPISODES).join(', ')}`);
  const cuts = Object.keys(bundle.episode.cuts);
  const cutId = positional[1] ?? (cuts.includes('full') ? 'full' : cuts.length === 1 ? cuts[0] : undefined);
  if (!cutId || !bundle.episode.cuts[cutId]) throw new Error(`Specify a cut for ${episodeId}: ${cuts.join(', ')}`);
  if (flags.locale === true) throw new Error('--locale needs a value, e.g. --locale es');
  const requested = typeof flags.locale === 'string' ? flags.locale : undefined;
  const locale = renderLocale(PRODUCTION, requested);
  if (!episodeLocales(bundle).includes(locale)) {
    throw new Error(`Locale "${locale}" is not available for ${episodeId} (available: ${episodeLocales(bundle).join(', ')})`);
  }
  return { episodeId, cutId, locale, explicitLocale: requested !== undefined && requested !== PRODUCTION.defaultLocale };
};

export const describeTarget = (t: RenderTarget) =>
  `${t.episodeId} / ${t.cutId} / locale ${t.locale}${t.explicitLocale ? ' (explicit --locale request)' : ' (production default)'}`;
