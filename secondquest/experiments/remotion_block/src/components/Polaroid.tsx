/**
 * The moment becomes a photo (Producer liked it in HyperFrames test #3). Reusable: children are the frozen shot.
 * Improvements over the test: the print drops in with spring physics and a little rotation, the paper has real texture
 * (@remotion/effects paper) and a contact shadow, and it rests on a dark desk.
 */
import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { paper } from '@remotion/effects/paper';
import { dropShadow } from '@remotion/effects/drop-shadow';

export const Polaroid: React.FC<{ startFrame: number; caption: string; children: React.ReactNode }> = ({ startFrame, caption, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = f - startFrame;
  if (local < 0) return <>{children}</>;
  const s = spring({ frame: local, fps, config: { damping: 15, stiffness: 120, mass: 0.9 } });
  const scale = interpolate(s, [0, 1], [1.0, 0.8]);
  const rot = interpolate(s, [0, 1], [0, -3.2]);
  const border = interpolate(s, [0, 1], [0, 1]);
  const W = 1920, H = 1080, PAD = 34 * border, BOTTOM = 150 * border;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1a1411' }}>
      <div style={{ position: 'absolute', left: (1920 - W) / 2, top: (1080 - H - BOTTOM) / 2 + 30 * border, width: W, height: H + BOTTOM,
        transform: `scale(${scale}) rotate(${rot}deg)`, transformOrigin: '50% 50%' }}>
        <Img src={staticFile('art/paper.png')} style={{ position: 'absolute', inset: -PAD, width: W + 2 * PAD, height: H + BOTTOM + PAD, opacity: border }}
          effects={[paper({ amount: 0.55, roughness: 0.4, fiber: 0.35 }), dropShadow({ radius: 40, offsetY: 26, opacity: 0.6 })]} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, overflow: 'hidden', boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.25)' }}>{children}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: H + 40, textAlign: 'center', font: '600 54px Inter, sans-serif',
          color: '#3a3330', opacity: interpolate(local, [0.5 * fps, 0.9 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>{caption}</div>
      </div>
    </div>
  );
};
