/**
 * Split-flap clock (Producer liked it in HyperFrames test #3). Reusable: give it the list of values and when each
 * one lands; every change is a real split-flap - the top half of the old card falls and reveals the new one.
 */
import React from 'react';
import { interpolate, Easing, useCurrentFrame, useVideoConfig } from 'remotion';

type Props = { label: string; values: string[]; startFrame: number; stepFrames: number; flipFrames?: number };

const INK = '#16161f';
const half = (text: string, top: boolean, extra: React.CSSProperties = {}): React.ReactElement => (
  <div style={{ position: 'absolute', left: 0, right: 0, height: 60, overflow: 'hidden', top: top ? 0 : 60,
    background: top ? '#22232d' : '#1b1c24', borderRadius: top ? '12px 12px 0 0' : '0 0 12px 12px', ...extra }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: top ? 0 : -60, height: 120, lineHeight: '120px',
      font: '400 76px Anton, sans-serif', color: '#ffe08a', textAlign: 'center', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{text}</div>
  </div>
);

export const FlapClock: React.FC<Props> = ({ label, values, startFrame, stepFrames, flipFrames = 6 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = f - startFrame;
  const idx = Math.max(0, Math.min(values.length - 1, Math.floor(local / stepFrames)));
  const into = local - idx * stepFrames;               // frames since the current value started flipping in
  const flipping = idx > 0 && into < flipFrames;
  const cur = values[idx], prev = values[Math.max(0, idx - 1)];
  const p = flipping ? into / flipFrames : 1;
  const e = Easing.in(Easing.quad)(p);
  // first half of the flip: old top half falls to 90 deg; second half: new bottom half falls from -90 to 0
  const topAngle = interpolate(e, [0, 0.5], [0, -90], { extrapolateRight: 'clamp' });
  const botAngle = interpolate(e, [0.5, 1], [90, 0], { extrapolateLeft: 'clamp' });
  const appear = interpolate(local, [0, 0.3 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ width: 400, opacity: appear, transform: `translateX(${(1 - appear) * -40}px)` }}>
      <div style={{ font: '800 30px Inter, sans-serif', letterSpacing: '0.3em', color: '#fff', textShadow: `0 3px 0 ${INK}`, marginBottom: 12 }}>{label}</div>
      <div style={{ position: 'relative', width: 400, height: 120, perspective: 700, filter: `drop-shadow(0 6px 0 ${INK})` }}>
        {half(cur, true)}
        {half(flipping ? prev : cur, false)}
        {flipping && half(prev, true, { transformOrigin: '50% 100%', transform: `rotateX(${topAngle}deg)`, backfaceVisibility: 'hidden' })}
        {flipping && e > 0.5 && half(cur, false, { transformOrigin: '50% 0%', transform: `rotateX(${botAngle}deg)`, backfaceVisibility: 'hidden' })}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 59, height: 3, background: '#0a0a0e' }} />
        <div style={{ position: 'absolute', inset: 0, border: `5px solid ${INK}`, borderRadius: 14 }} />
      </div>
    </div>
  );
};

/** Frames at which each value lands (for the click sounds). */
export const flapFrames = (count: number, startFrame: number, stepFrames: number) =>
  Array.from({ length: count - 1 }, (_, i) => startFrame + (i + 1) * stepFrames);
