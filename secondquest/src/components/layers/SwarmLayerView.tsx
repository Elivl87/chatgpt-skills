import React, { useMemo } from 'react';
import { Img, staticFile } from 'remotion';
import { evaluateAnimation } from '../../animations/presets';
import { combine, IDENTITY } from '../../animations/transform';
import type { SwarmLayer } from '../../schema/types';
import { rand } from '../../utils/noise';
import { ItemPlaceholder } from '../Placeholder';
import { sceneSeconds, useScene, useSceneTime } from '../SceneContext';
import { LayerBox } from './LayerBox';

/**
 * One asset multiplied N times with staggered pop-ins — "emails multiply",
 * "windows light up", "coins pile up". Positions are seeded and stable.
 */
export const SwarmLayerView: React.FC<{ layer: SwarmLayer; index: number }> = ({ layer, index }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const asset = ctx.resolveAsset(layer.asset);
  const at = sceneSeconds(ctx, layer.at ?? 0);
  const stagger = layer.stagger ?? 0.12;
  const seed = `${ctx.sceneId}:swarm${index}:${layer.seed ?? 0}`;
  const h = layer.height * ctx.H;
  const w = h * asset.entry.aspect;

  const items = useMemo(() => {
    // jittered grid → even coverage without overlaps piling up
    const cols = Math.ceil(Math.sqrt(layer.count * (layer.region.w / layer.region.h) * (ctx.W / ctx.H)));
    const rows = Math.ceil(layer.count / cols);
    const cells = Array.from({ length: cols * rows }, (_, i) => i).sort((a, b) => rand(`${seed}o${a}`) - rand(`${seed}o${b}`));
    return Array.from({ length: layer.count }, (_, i) => {
      const c = cells[i];
      const cx = ((c % cols) + 0.5 + (rand(`${seed}jx${i}`) - 0.5) * 0.6) / cols;
      const cy = (Math.floor(c / cols) + 0.5 + (rand(`${seed}jy${i}`) - 0.5) * 0.6) / rows;
      return {
        x: (layer.region.x + cx * layer.region.w) * ctx.W,
        y: (layer.region.y + cy * layer.region.h) * ctx.H,
        rot: (rand(`${seed}r${i}`) - 0.5) * 2 * (layer.jitter ?? 10),
        s: 0.85 + rand(`${seed}s${i}`) * 0.3,
      };
    });
  }, [layer.count, layer.region, layer.jitter, seed, ctx.W, ctx.H]);

  return (
    <>
      {items.map((it, i) => {
        const start = at + i * stagger;
        if (t < start) return null;
        const tr = [
          evaluateAnimation(t, { type: 'pop_in', start, duration: 0.35, intensity: 1.2, phase: 0, seed: `${seed}${i}` }),
          evaluateAnimation(t, { type: 'float', start, duration: Infinity, intensity: 0.5, frequency: 0.5, phase: i * 0.37, seed: `${seed}${i}` }),
        ].reduce(combine, IDENTITY);
        return (
          <LayerBox key={i} x={it.x} y={it.y} w={w * it.s} h={h * it.s} anchor={[0.5, 0.5]} transform={tr} rotation={it.rot}>
            {asset.exists ? (
              <Img src={staticFile(asset.publicPath)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <ItemPlaceholder asset={asset} w={w * it.s} h={h * it.s} />
            )}
          </LayerBox>
        );
      })}
    </>
  );
};
