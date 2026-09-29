import React, { useMemo } from 'react';
import { Img, staticFile } from 'remotion';
import { coverScale, type CameraFrame } from '../../animations/camera';
import { DEFAULT_ANCHOR, type ResolvedAsset } from '../../engine/assets';
import type { AnimationSpec, ImageLayer } from '../../schema/types';
import { BackgroundPlaceholder, ItemPlaceholder } from '../Placeholder';
import { evaluateAll, resolveAnimations, sceneSeconds, useScene, useSceneTime } from '../SceneContext';
import { LayerBox } from './LayerBox';

const DEFAULT_HEIGHT = { character: 0.55, object: 0.3, overlay: 0.3, foreground: 0.4, background: 1 };

/**
 * Artwork layer. Handles:
 *  - full-frame backgrounds (auto cover-scaled so camera moves never show edges)
 *  - positioned characters/objects/foregrounds
 *  - expression/pose swaps (all variants mounted up-front → preloaded, no flicker)
 *  - placeholder fallback per variant
 */
export const ImageLayerView: React.FC<{ layer: ImageLayer; layerCam: CameraFrame; index: number }> = ({ layer, layerCam, index }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const { W, H } = ctx;

  const variants = useMemo(() => {
    const ids = [layer.asset, ...(layer.swaps ?? []).map((s) => s.asset)];
    return ids.map((id) => ctx.resolveAsset(id));
  }, [ctx, layer.asset, layer.swaps]);

  const swapTimes = useMemo(() => (layer.swaps ?? []).map((s) => sceneSeconds(ctx, s.at)), [ctx, layer.swaps]);

  const anims = useMemo(() => {
    const specs: AnimationSpec[] = [...(layer.animations ?? [])];
    (layer.swaps ?? []).forEach((s, i) => {
      if (s.pop !== false) specs.push({ type: 'squash', at: swapTimes[i], intensity: 1.3 });
    });
    return resolveAnimations(ctx, specs, `${ctx.sceneId}:${layer.id ?? index}`);
  }, [ctx, layer.animations, layer.swaps, swapTimes, layer.id, index]);

  let active = 0;
  swapTimes.forEach((st, i) => {
    if (t >= st) active = i + 1;
  });

  const base = variants[0];
  const transform = evaluateAll(t, anims);

  if (base.entry.kind === 'background') {
    const s = coverScale(layerCam, W, H, 1.02);
    return (
      <LayerBox x={W / 2} y={H / 2} w={W} h={H} anchor={[0.5, 0.5]} transform={{ ...transform, scale: transform.scale * s }} opacity={layer.opacity} blend={layer.blend}>
        {variants.map((v, i) => (
          <div key={v.id + i} style={{ position: 'absolute', inset: 0, opacity: i === active ? 1 : 0 }}>
            {v.exists ? (
              <Img src={staticFile(v.publicPath)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <BackgroundPlaceholder asset={v} />
            )}
          </div>
        ))}
      </LayerBox>
    );
  }

  const kind = base.entry.kind;
  const h = layer.width !== undefined ? (layer.width * W) / base.entry.aspect : (layer.height ?? DEFAULT_HEIGHT[kind]) * H;
  const w = h * base.entry.aspect;
  const anchor = layer.anchor ?? base.entry.anchor ?? DEFAULT_ANCHOR[kind];
  const x = (layer.x ?? 0.5) * W;
  const y = (layer.y ?? (anchor[1] >= 0.99 ? 0.95 : 0.5)) * H;

  return (
    <LayerBox
      x={x}
      y={y}
      w={w}
      h={h}
      anchor={anchor}
      transform={transform}
      rotation={layer.rotation}
      opacity={layer.opacity}
      flip={layer.flip}
      blend={layer.blend}
    >
      {layer.shadow ? (
        <div
          style={{
            position: 'absolute',
            left: '12%',
            right: '12%',
            bottom: -h * 0.03,
            height: h * 0.07,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(0,0,0,0.38), rgba(0,0,0,0))',
          }}
        />
      ) : null}
      {variants.map((v, i) => {
        const vw = h * v.entry.aspect;
        return (
          <div
            key={v.id + i}
            style={{
              position: 'absolute',
              width: vw,
              height: h,
              left: anchor[0] * w - anchor[0] * vw,
              top: 0,
              opacity: i === active ? 1 : 0,
            }}
          >
            {v.exists ? <VariantImage asset={v} /> : <ItemPlaceholder asset={v} w={vw} h={h} />}
          </div>
        );
      })}
    </LayerBox>
  );
};

const VariantImage: React.FC<{ asset: ResolvedAsset }> = ({ asset }) => (
  <Img src={staticFile(asset.publicPath)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
);
