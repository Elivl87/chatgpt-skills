import React, { useMemo } from 'react';
import { evaluateCamera, layerCamera, planeTransform, resolveCamera, type CameraFrame } from '../../animations/camera';
import { DEFAULT_DEPTH } from '../../engine/assets';
import type { GroupLayer, Layer } from '../../schema/types';
import { evaluateAll, resolveAnimations, sceneSeconds, useScene, useSceneTime, type SceneContextValue } from '../SceneContext';
import { CounterLayerView, FlashLayerView, LightLayerView, ProgressLayerView, RectLayerView, StampLayerView, TextLayerView, WordmarkLayerView } from './GraphicLayers';
import { FairyLayerView } from './FairyLayerView';
import { ImageLayerView } from './ImageLayerView';
import { ParticlesLayerView } from './ParticlesLayerView';
import { SwarmLayerView } from './SwarmLayerView';
import { toCss } from '../../animations/transform';

/** Layers that live in screen space by default (UI, text, grading). */
const SCREEN_TYPES = new Set(['fairy', 'text', 'counter', 'progress', 'stamp', 'flash', 'wordmark']);

const layerDepth = (layer: Layer, ctx: SceneContextValue): number | 'screen' => {
  if (layer.depth !== undefined) return layer.depth;
  const type = layer.type ?? 'image';
  if (SCREEN_TYPES.has(type)) return 'screen';
  if (type === 'light' && (layer as { shape?: string }).shape && ['grade', 'vignette'].includes((layer as { shape: string }).shape)) return 'screen';
  if (type === 'image' || type === 'swarm') {
    const asset = ctx.resolveAsset((layer as { asset: string }).asset);
    return DEFAULT_DEPTH[asset.entry.kind];
  }
  if (type === 'particles') return 0.8;
  return 0.5;
};

const isVisible = (layer: Layer, ctx: SceneContextValue, t: number): boolean => {
  if (layer.show !== undefined && t < sceneSeconds(ctx, layer.show)) return false;
  if (layer.hide !== undefined && t >= sceneSeconds(ctx, layer.hide)) return false;
  return true;
};

const LayerContent: React.FC<{ layer: Layer; cam: CameraFrame; index: number }> = ({ layer, cam, index }) => {
  switch (layer.type) {
    case undefined:
    case 'image':
      return <ImageLayerView layer={layer} layerCam={cam} index={index} />;
    case 'text':
      return <TextLayerView layer={layer} index={index} />;
    case 'counter':
      return <CounterLayerView layer={layer} index={index} />;
    case 'progress':
      return <ProgressLayerView layer={layer} index={index} />;
    case 'particles':
      return <ParticlesLayerView layer={layer} index={index} />;
    case 'swarm':
      return <SwarmLayerView layer={layer} index={index} />;
    case 'stamp':
      return <StampLayerView layer={layer} index={index} />;
    case 'fairy':
      return <FairyLayerView layer={layer} index={index} />;
    case 'light':
      return <LightLayerView layer={layer} index={index} />;
    case 'rect':
      return <RectLayerView layer={layer} index={index} />;
    case 'flash':
      return <FlashLayerView layer={layer} />;
    case 'wordmark':
      return <WordmarkLayerView layer={layer} index={index} />;
    case 'group':
      return <GroupView layer={layer} index={index} />;
  }
};

const IDENTITY_CAM: CameraFrame = { zoom: 1, x: 0.5, y: 0.5, rotation: 0, shakeX: 0, shakeY: 0 };

/**
 * Renders layers back-to-front. Each world-space layer sits on its own
 * full-frame "plane" transformed by the camera at that layer's depth, which is
 * what produces parallax from a single camera path.
 */
export const LayerList: React.FC<{ layers: Layer[]; cam: CameraFrame; parallax: number; keyPrefix: string }> = ({ layers, cam, parallax, keyPrefix }) => {
  const ctx = useScene();
  const t = useSceneTime();
  return (
    <>
      {layers.map((layer, i) => {
        if (!isVisible(layer, ctx, t)) return null;
        const depth = layerDepth(layer, ctx);
        const lc = depth === 'screen' ? IDENTITY_CAM : layerCamera(cam, depth, parallax);
        const key = `${keyPrefix}${layer.id ?? i}`;
        return (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: ctx.W,
              height: ctx.H,
              transformOrigin: '0 0',
              transform: depth === 'screen' ? undefined : planeTransform(lc, ctx.W, ctx.H),
            }}
          >
            <LayerContent layer={layer} cam={lc} index={i} />
          </div>
        );
      })}
    </>
  );
};

/**
 * fit "none": children use frame coordinates, the clip just masks them.
 * fit "cover": children are a full virtual 16:9 frame scaled to cover the clip
 * and centred in it — each split-screen panel is its own mini scene.
 */
const innerPlacement = (layer: GroupLayer, W: number, H: number): React.CSSProperties => {
  const clip = layer.clip;
  if (!clip) return { left: 0, top: 0 };
  if (layer.fit !== 'cover') return { left: -clip.x * W, top: -clip.y * H };
  const cw = clip.w * W;
  const ch = clip.h * H;
  const s = Math.max(cw / W, ch / H);
  return { left: (cw - W * s) / 2, top: (ch - H * s) / 2, transform: `scale(${s})` };
};

/** Group: clip region + optional independent camera (e.g. split-screen panels). */
const GroupView: React.FC<{ layer: GroupLayer; index: number }> = ({ layer, index }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const sceneDur = ctx.endSec - ctx.startSec;
  const cam = useMemo(
    () => resolveCamera(layer.camera, (e) => sceneSeconds(ctx, e), sceneDur, `${ctx.sceneId}:g${layer.id ?? index}`),
    [layer.camera, ctx, sceneDur, layer.id, index],
  );
  const anims = useMemo(() => resolveAnimations(ctx, layer.animations, `${ctx.sceneId}:group${index}`), [ctx, layer.animations, index]);
  const camFrame = layer.camera ? evaluateCamera(cam, t) : IDENTITY_CAM;
  const clip = layer.clip;
  const css = toCss(evaluateAll(t, anims));
  return (
    <div
      style={{
        position: 'absolute',
        left: clip ? clip.x * ctx.W : 0,
        top: clip ? clip.y * ctx.H : 0,
        width: clip ? clip.w * ctx.W : ctx.W,
        height: clip ? clip.h * ctx.H : ctx.H,
        overflow: 'hidden',
        opacity: layer.opacity ?? 1,
        ...css,
      }}
    >
      <div style={{ position: 'absolute', width: ctx.W, height: ctx.H, transformOrigin: '0 0', ...innerPlacement(layer, ctx.W, ctx.H) }}>
        <LayerList layers={layer.layers} cam={camFrame} parallax={cam.parallax} keyPrefix={`${layer.id ?? index}/`} />
      </div>
    </div>
  );
};
