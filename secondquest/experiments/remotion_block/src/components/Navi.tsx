/**
 * Navi as a light with a real motion trail (@remotion/motion-blur <Trail>). The path is a list of keys
 * [frame, x, y, size]; between keys the fairy moves on a smooth curve with a little hover, so it never looks linear.
 */
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { Trail } from '@remotion/motion-blur';

export type NaviKey = [number, number, number, number?];

export const naviAt = (keys: NaviKey[], f: number) => {
  const fr = keys.map((k) => k[0]);
  const ease = Easing.inOut(Easing.sin);
  const o = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: ease };
  const x = interpolate(f, fr, keys.map((k) => k[1]), o) + Math.sin(f * 0.21) * 10;
  const y = interpolate(f, fr, keys.map((k) => k[2]), o) + Math.cos(f * 0.33) * 8;
  const s = interpolate(f, fr, keys.map((k) => k[3] ?? 1), o);
  return { x, y, s };
};

const Glow: React.FC<{ keys: NaviKey[] }> = ({ keys }) => {
  const f = useCurrentFrame();
  const { x, y, s } = naviAt(keys, f);
  const pulse = 1 + Math.sin(f * 1.3) * 0.08;
  const size = 70 * s * pulse;
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%',
      background: 'radial-gradient(circle, #ffffff 0%, #e4f6ff 16%, rgba(130,205,255,0.55) 38%, rgba(90,170,255,0) 70%)', mixBlendMode: 'screen' }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: size * 0.9, height: size * 0.18, marginLeft: -size * 0.45, marginTop: -size * 0.09,
        borderRadius: '50%', background: 'rgba(200,235,255,0.55)', transform: `rotate(${Math.sin(f * 2.2) * 25}deg)` }} />
    </div>
  );
};

export const Navi: React.FC<{ keys: NaviKey[]; visible?: boolean }> = ({ keys, visible = true }) =>
  visible ? (
    <Trail layers={9} lagInFrames={0.6} trailOpacity={0.55}>
      <Glow keys={keys} />
    </Trail>
  ) : null;
