import React from 'react';
import { Composition } from 'remotion';
import { EpisodeCut, type EpisodeCutProps } from './compositions/EpisodeCut';
import { resolveCut } from './engine/timeline';
import { EPISODES, SFX } from './episodes';

/**
 * Registers one composition per episode cut: "<episode>-<cut>", e.g. ep001-hook.
 * Duration is computed from narration timings, never hard-coded.
 * 4K: render the same composition with --scale=2 (layout is resolution-independent).
 */
export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(EPISODES).flatMap(([episodeId, bundle]) =>
      Object.keys(bundle.episode.cuts).map((cutId) => (
        <Composition
          key={`${episodeId}-${cutId}`}
          id={`${episodeId}-${cutId}`}
          component={EpisodeCut}
          width={bundle.episode.width}
          height={bundle.episode.height}
          fps={bundle.episode.fps}
          durationInFrames={1}
          defaultProps={{ episodeId, cutId } satisfies EpisodeCutProps}
          calculateMetadata={({ props }) => {
            const b = EPISODES[props.episodeId];
            const cut = resolveCut(b, props.cutId, SFX, () => true);
            return { durationInFrames: cut.durationInFrames, fps: cut.fps, width: cut.width, height: cut.height };
          }}
        />
      )),
    )}
  </>
);
