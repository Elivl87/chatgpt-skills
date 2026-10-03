import React from 'react';
import { FAIRY_DEFAULTS, fairyAt, fairyFlap, fairyScale, type FairyKey } from '../../fx/fairy';
import type { FairyLayer } from '../../schema/types';
import { sceneSeconds, useScene, useSceneTime } from '../SceneContext';

/** Procedural fairy: glow + core + flapping wings + sparkle trail, flying along `path`. */
export const FairyLayerView: React.FC<{ layer: FairyLayer; index: number }> = ({ layer, index }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const keys: FairyKey[] = layer.path.map((k) => ({ t: sceneSeconds(ctx, k.at), x: k.x, y: k.y, s: k.s }));
  const size = (layer.size ?? FAIRY_DEFAULTS.size) * fairyScale(keys, t) * ctx.H; // glow radius in px
  const fade = layer.fadeIn && keys.length ? Math.min(1, Math.max(0, (t - keys[0].t) / layer.fadeIn)) : 1;
  const color = layer.color ?? FAIRY_DEFAULTS.color;
  const glow = layer.glow ?? FAIRY_DEFAULTS.glow;
  const p = fairyAt(keys, t, layer.bob ?? FAIRY_DEFAULTS.bob);
  const flap = fairyFlap(t, layer.flapHz ?? FAIRY_DEFAULTS.flapHz);
  const cx = p.x * ctx.W, cy = p.y * ctx.H;
  const s = size / 70; // the design is drawn on a 70 px glow radius (720p animatic)
  const trailN = layer.trail ?? FAIRY_DEFAULTS.trail;
  const trail = Array.from({ length: trailN }, (_, k) => {
    const q = fairyAt(keys, t - (k + 1) * 0.045, layer.bob ?? FAIRY_DEFAULTS.bob);
    return { x: q.x * ctx.W, y: q.y * ctx.H, a: 0.55 * (1 - k / trailN), r: (4.5 - (3 * k) / trailN) * s };
  });
  const id = `fairy${index}`;
  return (
    <svg width={ctx.W} height={ctx.H} style={{ position: 'absolute', inset: 0, opacity: (layer.opacity ?? 1) * fade, overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}g`}>
          <stop offset="0%" stopColor={color} stopOpacity={glow} />
          <stop offset="35%" stopColor={color} stopOpacity={glow * 0.45} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {trail.map((d, k) => (
        <circle key={k} cx={d.x} cy={d.y} r={d.r} fill="#ffffff" opacity={d.a} style={{ mixBlendMode: 'screen' }} />
      ))}
      <circle cx={cx} cy={cy} r={size} fill={`url(#${id}g)`} style={{ mixBlendMode: 'screen' }} />
      {[-1, 1].map((sx) => (
        <g key={sx}>
          <ellipse cx={cx + sx * 16.5 * s} cy={cy - (3 + 13 * flap) * s} rx={13.5 * s} ry={(1 + 13 * flap) * s} fill="#e6f5ff" opacity={0.47} />
          <ellipse cx={cx + sx * 16.5 * s} cy={cy + (3 + 7 * flap) * s} rx={5.5 * s} ry={(1 + 7 * flap) * s} fill="#e6f5ff" opacity={0.35} />
        </g>
      ))}
      <circle cx={cx} cy={cy} r={9 * s} fill="#ffffff" />
    </svg>
  );
};
