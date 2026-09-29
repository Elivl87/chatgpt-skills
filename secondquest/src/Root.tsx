import React from 'react';
import { Composition } from 'remotion';
import { EpisodeCut, type EpisodeCutProps } from './compositions/EpisodeCut';
import { compositionId, episodeLocales, localizeBundle } from './engine/locale';
import { resolveCut } from './engine/timeline';
import { EPISODES, SFX } from './episodes';

/**
 * Registers one composition per episode cut and locale: "<episode>-<cut>"
 * for the master locale (ep001-hook) and "<episode>-<cut>-<locale>" for others
 * (ep001-hook-es).
 * Duration is computed from that locale's narration timings, never hard-coded.
 * 4K: render the same composition with --scale=2 (layout is resolution-independent).
 */
export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(EPISODES).flatMap(([episodeId, bundle]) =>
      Object.keys(bundle.episode.cuts).flatMap((cutId) =>
        episodeLocales(bundle).map((locale) => (
          <Composition
            key={compositionId(episodeId, cutId, locale, bundle.episode.locale)}
            id={compositionId(episodeId, cutId, locale, bundle.episode.locale)}
            component={EpisodeCut}
            width={bundle.episode.width}
            height={bundle.episode.height}
            fps={bundle.episode.fps}
            durationInFrames={1}
            defaultProps={{ episodeId, cutId, locale } satisfies EpisodeCutProps}
            calculateMetadata={({ props }) => {
              const b = localizeBundle(EPISODES[props.episodeId], props.locale);
              const cut = resolveCut(b, props.cutId, SFX, () => true);
              return { durationInFrames: cut.durationInFrames, fps: cut.fps, width: cut.width, height: cut.height };
            }}
          />
        )),
      ),
    )}
  </>
);
