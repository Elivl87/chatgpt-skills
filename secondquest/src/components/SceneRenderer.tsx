import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { evaluateCamera, resolveCamera } from '../animations/camera';
import { transitionStyle } from '../animations/transitions';
import type { AssetResolver } from '../engine/assets';
import type { ResolvedScene } from '../engine/timeline';
import type { Cue } from '../schema/types';
import { CUSTOM_SCENES } from '../scenes/registry';
import { LayerList } from './layers/LayerList';
import { SceneProvider, sceneSeconds, type SceneContextValue } from './SceneContext';

interface Props {
  rs: ResolvedScene;
  fps: number;
  W: number;
  H: number;
  cues: Record<string, Cue>;
  locale: string;
  resolveAsset: AssetResolver;
}

/** Renders one configured scene: camera + layers, wrapped in its transitions. */
export const SceneRenderer: React.FC<Props> = ({ rs, fps, W, H, cues, locale, resolveAsset }) => {
  const frame = useCurrentFrame();
  const t = frame / fps;

  const ctx = useMemo<SceneContextValue>(
    () => ({ fps, W, H, sceneId: rs.scene.id, startSec: rs.startSec, endSec: rs.endSec, cues, locale, resolveAsset }),
    [fps, W, H, rs, cues, locale, resolveAsset],
  );
  const camera = useMemo(
    () => resolveCamera(rs.scene.camera, (e) => sceneSeconds(ctx, e), rs.endSec - rs.startSec, rs.scene.id),
    [rs, ctx],
  );

  // --- transitions (enter over first frames, exit over the tail)
  let style: React.CSSProperties = {};
  let overlay: { color: string; opacity: number } | undefined;
  if (rs.enter && frame < rs.enter.duration * fps) {
    const r = transitionStyle(rs.enter, 'enter', frame / (rs.enter.duration * fps), W, H);
    style = r.style;
    overlay = r.overlay;
  } else if (rs.exit && frame >= rs.duration) {
    style = transitionStyle(rs.exit, 'exit', (frame - rs.duration) / Math.max(1, rs.tail), W, H).style;
  }

  const Custom = rs.scene.component ? CUSTOM_SCENES[rs.scene.component] : undefined;

  return (
    <SceneProvider value={ctx}>
      <AbsoluteFill>
        <AbsoluteFill style={{ backgroundColor: rs.scene.backgroundColor ?? '#101018', overflow: 'hidden', ...style }}>
          {Custom ? <Custom scene={rs.scene} /> : <LayerList layers={rs.scene.layers} cam={evaluateCamera(camera, t)} parallax={camera.parallax} keyPrefix="" />}
        </AbsoluteFill>
        {overlay ? <AbsoluteFill style={{ backgroundColor: overlay.color, opacity: overlay.opacity }} /> : null}
      </AbsoluteFill>
    </SceneProvider>
  );
};
