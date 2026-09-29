import React, { useMemo } from 'react';
import { AbsoluteFill, getStaticFiles, Sequence } from 'remotion';
import { AudioMix, type AudioBus } from '../audio/AudioMix';
import { SceneRenderer } from '../components/SceneRenderer';
import { createAssetResolver } from '../engine/assets';
import { resolveCut } from '../engine/timeline';
import { EPISODES, SFX, SHARED_ASSETS } from '../episodes';
import { ensureFonts } from '../styles/fonts';

ensureFonts();

export interface EpisodeCutProps extends Record<string, unknown> {
  episodeId: string;
  cutId: string;
  locale?: string;
  /** Global vignette strength (0 disables). */
  vignette?: number;
  /** Audio buses to mute — used for stem exports. */
  mute?: AudioBus[];
}

/** Set of files that currently exist in public/ (live-updates in the Studio). */
export const useStaticFileSet = (): ((p: string) => boolean) => {
  const files = getStaticFiles();
  return useMemo(() => {
    const set = new Set(files.map((f) => f.name.replace(/^\//, '')));
    return (p: string) => set.has(p);
  }, [files]);
};

/**
 * One composition renders any cut of any episode: resolve the data → sequence
 * the scenes (with transition overlaps) → mix the audio.
 */
export const EpisodeCut: React.FC<EpisodeCutProps> = ({ episodeId, cutId, locale, vignette = 0.32, mute }) => {
  const bundle = EPISODES[episodeId];
  const hasFile = useStaticFileSet();
  const cut = useMemo(() => resolveCut(bundle, cutId, SFX, hasFile), [bundle, cutId, hasFile]);
  const resolveAsset = useMemo(
    () => createAssetResolver([SHARED_ASSETS, bundle.assets], ['', bundle.episode.assetRoot], hasFile),
    [bundle, hasFile],
  );
  const loc = locale ?? bundle.episode.locale;
  const { fps, width: W, height: H } = cut;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0b0b10' }}>
      {cut.scenes.map((rs) => (
        <Sequence key={rs.scene.id} from={rs.from} durationInFrames={rs.duration + rs.tail} premountFor={fps} name={rs.scene.id}>
          <SceneRenderer rs={rs} fps={fps} W={W} H={H} cues={cut.cues} locale={loc} resolveAsset={resolveAsset} />
        </Sequence>
      ))}
      {vignette > 0 ? (
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.9) 135%)', opacity: vignette, pointerEvents: 'none' }} />
      ) : null}
      <AudioMix cut={cut} hasNarration={hasFile(cut.audio.narration.src)} mute={mute} />
    </AbsoluteFill>
  );
};
