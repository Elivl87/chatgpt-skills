import React from 'react';
import type { ResolvedAsset } from '../engine/assets';
import { theme } from '../styles/theme';

/**
 * Clearly-labelled stand-in for artwork that has not been delivered yet.
 *
 * It is intentionally NOT an attempt at the final art: a tinted card (or a
 * generic mannequin silhouette for characters) with the asset label and the
 * exact file path to drop the real illustration into. Aspect ratio and anchor
 * match the catalog, so composition and motion stay valid when art arrives.
 */

const shade = (hex: string, amt: number): string => {
  const n = parseInt(hex.replace('#', ''), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + amt * 255)));
  return `rgb(${f((n >> 16) & 255)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
};

const HATCH =
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.045) 0 3px, transparent 3px 26px)';

const Tag: React.FC<{ children: React.ReactNode; size: number; style?: React.CSSProperties }> = ({ children, size, style }) => (
  <div
    style={{
      fontFamily: theme.font.ui,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#fff',
      background: 'rgba(10,10,16,0.72)',
      padding: `${size * 0.3}px ${size * 0.6}px`,
      borderRadius: size * 0.5,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

export const BackgroundPlaceholder: React.FC<{ asset: ResolvedAsset }> = ({ asset }) => {
  const [top, bottom] = Array.isArray(asset.color) ? asset.color : [shade(asset.color, 0.12), shade(asset.color, -0.12)];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: '64%', bottom: 0, background: 'rgba(0,0,0,0.16)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '64%', height: 3, background: 'rgba(255,255,255,0.12)' }} />
      <div style={{ position: 'absolute', inset: 0, background: HATCH }} />
      <div style={{ position: 'absolute', left: '3.5%', bottom: '5%', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
        <Tag size={15} style={{ background: 'rgba(214,57,47,0.9)' }}>Placeholder · background</Tag>
        <div style={{ fontFamily: theme.font.ui, fontWeight: 600, fontSize: 26, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          {asset.entry.label}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 15, color: 'rgba(255,255,255,0.55)' }}>public/{asset.publicPath}</div>
      </div>
    </div>
  );
};

/** Generic mannequin silhouette (NOT a character design) sized to the box. */
const Mannequin: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 160" preserveAspectRatio="xMidYMax meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    <g fill={color} stroke={shade(color, -0.3)} strokeWidth={1.5} opacity={0.92}>
      <path d="M18 160 C18 108 26 84 50 84 C74 84 82 108 82 160 Z" />
      <circle cx={50} cy={52} r={27} fill={shade(color, 0.12)} />
    </g>
  </svg>
);

export const ItemPlaceholder: React.FC<{ asset: ResolvedAsset; w: number; h: number }> = ({ asset, w, h }) => {
  const color = Array.isArray(asset.color) ? asset.color[0] : asset.color;
  const isFigure = asset.entry.kind === 'character';
  const tiny = Math.min(w, h) < 120;
  const fs = Math.max(13, Math.min(26, Math.min(w, h) * 0.075));
  const title = asset.characterName ? `${asset.characterName} — ${asset.entry.label}` : asset.entry.label;
  const label = (
    <>
      {tiny ? null : <Tag size={fs * 0.62} style={{ background: 'rgba(214,57,47,0.92)' }}>Placeholder</Tag>}
      <div style={{ fontFamily: theme.font.ui, fontWeight: 800, fontSize: fs, lineHeight: 1.15, color: '#fff', textAlign: 'center', textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>
        {title}
      </div>
    </>
  );
  const column: React.CSSProperties = { position: 'absolute', left: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: fs * 0.3 };
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: asset.entry.kind === 'foreground' ? 0.72 : 1 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: Math.min(w, h) * 0.08,
          border: `${Math.max(2, fs * 0.12)}px dashed rgba(255,255,255,0.55)`,
          background: isFigure ? 'rgba(255,255,255,0.05)' : `linear-gradient(160deg, ${shade(color, 0.08)}, ${shade(color, -0.1)})`,
          overflow: 'hidden',
          boxShadow: isFigure ? undefined : '0 12px 30px rgba(0,0,0,0.25)',
        }}
      >
        {isFigure ? <Mannequin color={color} /> : <div style={{ position: 'absolute', inset: 0, background: HATCH }} />}
        {isFigure ? null : <div style={{ ...column, top: '50%', transform: 'translate(-50%, -50%)', maxWidth: '94%' }}>{label}</div>}
      </div>
      {/* character labels sit above the box so they never cover the figure */}
      {isFigure ? <div style={{ ...column, bottom: `calc(100% + ${fs * 0.4}px)`, transform: 'translateX(-50%)', width: Math.max(w * 1.3, 260) }}>{label}</div> : null}
    </div>
  );
};
