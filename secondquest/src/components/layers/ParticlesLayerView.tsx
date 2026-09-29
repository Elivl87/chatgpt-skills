import React, { useMemo } from 'react';
import type { ParticleKind, ParticlesLayer } from '../../schema/types';
import { theme } from '../../styles/theme';
import { clamp01 } from '../../utils/easing';
import { noise1D, rand } from '../../utils/noise';
import { sceneSeconds, useScene, useSceneTime } from '../SceneContext';

/**
 * Deterministic particle systems. Everything derives from (seed, index, t),
 * so there is no simulation state and any frame renders independently.
 *
 *  dust      continuous floating motes (light beams, sunsets)   — ParticleDust
 *  sparkle   twinkling 4-point stars burst
 *  money     bills burst up then fall
 *  confetti  celebratory burst
 *  poof      smoke puffs (transformations, landings)
 */

const DEFAULT_COUNT: Record<ParticleKind, number> = { dust: 40, sparkle: 14, money: 16, confetti: 60, poof: 12 };
const BURST_DURATION: Record<ParticleKind, number> = { dust: Infinity, sparkle: 1.4, money: 1.8, confetti: 2.4, poof: 0.8 };
const CONFETTI = [theme.color.questRed, theme.color.gold, theme.color.green, '#4aa3ff', '#ffffff'];

export const ParticlesLayerView: React.FC<{ layer: ParticlesLayer; index: number }> = ({ layer, index }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const { W, H } = ctx;
  const kind = layer.kind;
  const count = layer.count ?? DEFAULT_COUNT[kind];
  const region = layer.region ?? { x: 0, y: 0, w: 1, h: 1 };
  const seed = `${ctx.sceneId}:p${index}:${layer.seed ?? 0}`;
  const at = layer.at !== undefined ? sceneSeconds(ctx, layer.at) : 0;
  const life = layer.duration ?? BURST_DURATION[kind];
  const local = t - at;

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: rand(`${seed}x${i}`),
        y: rand(`${seed}y${i}`),
        s: rand(`${seed}s${i}`),
        a: rand(`${seed}a${i}`),
        d: rand(`${seed}d${i}`),
      })),
    [count, seed],
  );

  if (local < 0 || local > life + 0.1) return null;
  const size = layer.size ?? 1;
  const opacity = layer.opacity ?? 1;
  const cx = (region.x + region.w / 2) * W;
  const cy = (region.y + region.h / 2) * H;

  const items = seeds.map((p, i) => {
    switch (kind) {
      case 'dust': {
        const x = (region.x + p.x * region.w) * W + noise1D(`${seed}nx${i}`, t * 0.25) * 40;
        const y = (region.y + p.y * region.h) * H - ((t * (8 + p.s * 14)) % (region.h * H)) + noise1D(`${seed}ny${i}`, t * 0.2) * 20;
        const wrapY = y < region.y * H ? y + region.h * H : y;
        const r = (2 + p.s * 4) * size;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1 + p.a * 2) + p.d * 6));
        const fade = clamp01(local / 0.6);
        return <circle key={i} cx={x} cy={wrapY} r={r} fill={layer.color ?? '#fff6d8'} opacity={tw * 0.55 * fade} />;
      }
      case 'sparkle': {
        const delay = p.d * life * 0.5;
        const q = clamp01((local - delay) / 0.6);
        const s = Math.sin(q * Math.PI) * (14 + p.s * 26) * size;
        if (s <= 0.1) return null;
        const x = (region.x + p.x * region.w) * W;
        const y = (region.y + p.y * region.h) * H;
        return (
          <path
            key={i}
            transform={`translate(${x} ${y}) rotate(${p.a * 90 + local * 60}) scale(${s / 10})`}
            d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10 Z"
            fill={layer.color ?? '#fff3b0'}
          />
        );
      }
      case 'money':
      case 'confetti': {
        const angle = -Math.PI / 2 + (p.a - 0.5) * (kind === 'money' ? 1.9 : 2.4);
        const speed = (kind === 'money' ? 900 : 1300) * (0.55 + p.s * 0.6);
        const g = kind === 'money' ? 1500 : 1700;
        const drag = kind === 'confetti' ? 0.55 : 0.75;
        const tt = Math.max(0, local - p.d * 0.12);
        const x = cx + (p.x - 0.5) * region.w * W + Math.cos(angle) * speed * tt * drag + Math.sin(tt * 6 + p.d * 10) * 30;
        const y = cy + Math.sin(angle) * speed * tt * drag + 0.5 * g * tt * tt * 0.6;
        const rot = (p.a - 0.5) * 900 * tt;
        const fade = 1 - clamp01((local - life * 0.7) / (life * 0.3));
        if (kind === 'money') {
          const w = 64 * size;
          const h = 34 * size;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${0.4 + 0.6 * Math.abs(Math.cos(tt * 7 + p.d * 5))})`} opacity={fade}>
              <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill="#5fbf6a" stroke="#1f5a2a" strokeWidth={3} />
              <circle r={h * 0.28} fill="#9fe0a6" stroke="#1f5a2a" strokeWidth={2} />
            </g>
          );
        }
        const w = (10 + p.s * 10) * size;
        return (
          <rect
            key={i}
            x={-w / 2}
            y={-w * 0.3}
            width={w}
            height={w * 0.6}
            fill={CONFETTI[i % CONFETTI.length]}
            transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${Math.cos(tt * 9 + p.d * 7)})`}
            opacity={fade}
          />
        );
      }
      case 'poof': {
        const angle = p.a * Math.PI * 2;
        const q = clamp01(local / life);
        const e = 1 - Math.pow(1 - q, 3);
        const dist = (60 + p.s * 140) * e * size;
        const r = (30 + p.s * 45) * (0.4 + e) * size;
        const x = cx + Math.cos(angle) * dist * (region.w * 3);
        const y = cy + Math.sin(angle) * dist * 0.6 - e * 30;
        return <circle key={i} cx={x} cy={y} r={r} fill={layer.color ?? '#f4f1ea'} opacity={(1 - q) * 0.85} />;
      }
    }
    return null;
  });

  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity, mixBlendMode: (layer.blend ?? 'normal') as React.CSSProperties['mixBlendMode'] }}>
      {items}
    </svg>
  );
};
