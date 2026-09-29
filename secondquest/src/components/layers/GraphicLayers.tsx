import React, { useMemo } from 'react';
import { Img, staticFile } from 'remotion';
import type { AnimationSpec, CounterLayer, EasingName, FlashLayer, LightLayer, ProgressLayer, RectLayer, StampLayer, TextLayer, TextStyle, WordmarkLayer } from '../../schema/types';
import { theme } from '../../styles/theme';
import { clamp01, ease } from '../../utils/easing';
import { noise1D } from '../../utils/noise';
import { evaluateAll, localize, resolveAnimations, sceneSeconds, useScene, useSceneTime, type SceneContextValue } from '../SceneContext';
import { LayerBox } from './LayerBox';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const useAnims = (specs: AnimationSpec[] | undefined, fallback: AnimationSpec[], key: string) => {
  const ctx = useScene();
  return useMemo(() => resolveAnimations(ctx, specs && specs.length ? specs : fallback, `${ctx.sceneId}:${key}`), [ctx, specs, fallback, key]);
};

/** Value driven by timed steps, each easing from the previous value. */
const steppedValue = (
  t: number,
  ctx: SceneContextValue,
  initial: number,
  steps: Array<{ at: number | string; value: number; duration?: number; easing?: EasingName }>,
) => {
  let value = initial;
  let changing = 0;
  for (const s of steps) {
    const start = sceneSeconds(ctx, s.at);
    if (t < start) break;
    const dur = s.duration ?? 0.8;
    const p = clamp01((t - start) / dur);
    const e = ease(s.easing, 'outCubic')(p);
    const from = value;
    value = from + (s.value - from) * e;
    changing = p < 1 ? Math.sign(s.value - from) : 0;
  }
  return { value, changing };
};

// ---------------------------------------------------------------------------
// Text (TextPunch & friends)
// ---------------------------------------------------------------------------

const TEXT_STYLE: Record<TextStyle, (size: number, color?: string) => React.CSSProperties> = {
  punch: (s, c) => ({
    fontFamily: theme.font.display,
    fontSize: s,
    color: c ?? theme.color.white,
    letterSpacing: '0.01em',
    lineHeight: 1,
    ...theme.textStroke(s * 0.075),
    textShadow: `0 ${s * 0.06}px 0 ${theme.color.ink}, 0 ${s * 0.12}px ${s * 0.25}px rgba(0,0,0,0.35)`,
  }),
  price: (s, c) => ({
    fontFamily: theme.font.display,
    fontSize: s,
    color: c ?? theme.color.ink,
    background: theme.color.gold,
    padding: `${s * 0.08}px ${s * 0.3}px ${s * 0.08}px ${s * 0.45}px`,
    borderRadius: s * 0.12,
    border: `${s * 0.05}px solid ${theme.color.ink}`,
    boxShadow: `0 ${s * 0.08}px 0 ${theme.color.ink}, ${theme.shadow}`,
    lineHeight: 1.05,
  }),
  label: (s, c) => ({
    fontFamily: theme.font.ui,
    fontWeight: 800,
    fontSize: s,
    color: c ?? theme.color.white,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    background: 'rgba(14,16,26,0.72)',
    padding: `${s * 0.35}px ${s * 0.8}px`,
    borderRadius: s * 0.3,
  }),
  ui: (s, c) => ({
    fontFamily: theme.font.ui,
    fontWeight: 800,
    fontSize: s,
    color: c ?? theme.color.white,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    background: theme.color.uiPanel,
    border: `3px solid ${theme.color.uiBorder}`,
    padding: `${s * 0.45}px ${s * 1}px`,
    borderRadius: s * 0.2,
    boxShadow: `0 0 ${s * 0.8}px rgba(120,200,255,0.35)`,
  }),
  marker: (s, c) => ({
    fontFamily: theme.font.ui,
    fontWeight: 800,
    fontSize: s,
    color: c ?? theme.color.ink,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    background: theme.color.gold,
    padding: `${s * 0.3}px ${s * 0.7}px`,
    borderRadius: s * 0.3,
    border: `${Math.max(2, s * 0.08)}px solid ${theme.color.ink}`,
  }),
  caption: (s, c) => ({
    fontFamily: theme.font.ui,
    fontWeight: 600,
    fontSize: s,
    color: c ?? theme.color.white,
    textShadow: '0 2px 10px rgba(0,0,0,0.6)',
  }),
};

const TEXT_SIZE: Record<TextStyle, number> = { punch: 150, price: 110, label: 34, ui: 46, marker: 30, caption: 40 };

export const TextLayerView: React.FC<{ layer: TextLayer; index: number }> = ({ layer, index }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const style = layer.style ?? 'punch';
  const fallback = useMemo<AnimationSpec[]>(
    () => [{ type: style === 'punch' || style === 'price' ? 'punch_in' : 'pop_in', at: layer.show ?? 0 }],
    [style, layer.show],
  );
  const anims = useAnims(layer.animations, fallback, `text${index}`);
  const size = layer.size ?? TEXT_SIZE[style];
  const arrow = layer.arrow;
  const transform = evaluateAll(t, anims);
  return (
    <LayerBox x={(layer.x ?? 0.5) * ctx.W} y={(layer.y ?? 0.5) * ctx.H} w={0} h={0} anchor={[0.5, 0.5]} transform={transform} rotation={layer.rotation ?? (style === 'price' ? -4 : 0)} opacity={layer.opacity}>
      <div style={{ position: 'absolute', left: 0, top: 0, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {arrow === 'up' ? <Arrow dir="up" size={size} /> : null}
        <div style={{ whiteSpace: 'pre', textAlign: 'center', ...TEXT_STYLE[style](size, layer.color) }}>{localize(layer.text, ctx.locale)}</div>
        {arrow === 'down' ? <Arrow dir="down" size={size} /> : null}
      </div>
    </LayerBox>
  );
};

const Arrow: React.FC<{ dir: 'up' | 'down'; size: number }> = ({ dir, size }) => (
  <svg width={size * 1.1} height={size * 1.3} viewBox="0 0 20 24" style={{ transform: dir === 'up' ? 'rotate(180deg)' : undefined, margin: `${size * 0.1}px 0` }}>
    <path d="M7 0 H13 V12 H19 L10 23 L1 12 H7 Z" fill={theme.color.gold} stroke={theme.color.ink} strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// Counter (MoneyDrain / count-up)
// ---------------------------------------------------------------------------

export const formatNumber = (v: number, prefix = '', suffix = '', signed = false): string => {
  const r = Math.round(v);
  const abs = Math.abs(r).toLocaleString('en-US');
  const sign = r < 0 ? '−' : signed && r > 0 ? '+' : '';
  return `${sign}${prefix}${abs}${suffix}`;
};

export const CounterLayerView: React.FC<{ layer: CounterLayer; index: number }> = ({ layer, index }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const fallback = useMemo<AnimationSpec[]>(() => [{ type: 'pop_in', at: layer.show ?? 0 }], [layer.show]);
  const anims = useAnims(layer.animations, fallback, `counter${index}`);
  const { value, changing } = steppedValue(t, ctx, layer.initial, layer.steps);
  const size = layer.size ?? 84;
  const color = value < -0.5 ? theme.color.danger : changing > 0 || layer.signed ? theme.color.green : theme.color.white;
  const tr = evaluateAll(t, anims);
  // draining money shakes nervously
  const jitter = changing < 0 ? { x: tr.x + noise1D(`${index}cx`, t * 30) * 5, y: tr.y + noise1D(`${index}cy`, t * 30) * 3 } : {};
  return (
    <LayerBox x={(layer.x ?? 0.5) * ctx.W} y={(layer.y ?? 0.5) * ctx.H} w={0} h={0} anchor={[0.5, 0.5]} transform={{ ...tr, ...jitter }} rotation={layer.rotation} opacity={layer.opacity}>
      <div style={{ position: 'absolute', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {layer.label ? (
          <div style={{ fontFamily: theme.font.ui, fontWeight: 800, fontSize: size * 0.26, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
            {localize(layer.label, ctx.locale)}
          </div>
        ) : null}
        <div style={{ fontFamily: theme.font.display, fontSize: size, color, lineHeight: 1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', ...theme.textStroke(size * 0.07), textShadow: `0 ${size * 0.06}px 0 ${theme.color.ink}` }}>
          {formatNumber(value, layer.prefix, layer.suffix, layer.signed)}
        </div>
      </div>
    </LayerBox>
  );
};

// ---------------------------------------------------------------------------
// Progress (ProgressFill)
// ---------------------------------------------------------------------------

export const ProgressLayerView: React.FC<{ layer: ProgressLayer; index: number }> = ({ layer, index }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const fallback = useMemo<AnimationSpec[]>(() => [{ type: 'slide_in', from: 'up', distance: 200, at: layer.show ?? 0 }], [layer.show]);
  const anims = useAnims(layer.animations, fallback, `progress${index}`);
  const { value } = steppedValue(t, ctx, layer.initial ?? 0, layer.steps.map((s) => ({ ...s, duration: s.duration ?? 0.5 })));
  const w = (layer.width ?? 0.34) * ctx.W;
  const h = 40;
  const full = value >= 0.999;
  const color = layer.color ?? theme.color.green;
  const shine = ((t * 0.9) % 1.6) - 0.3;
  return (
    <LayerBox x={(layer.x ?? 0.5) * ctx.W} y={(layer.y ?? 0.1) * ctx.H} w={w} h={h + 44} anchor={[0.5, 0.5]} transform={evaluateAll(t, anims)} opacity={layer.opacity}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: theme.font.ui, fontWeight: 800, fontSize: 24, color: '#fff', letterSpacing: '0.12em', textShadow: '0 2px 6px rgba(0,0,0,0.6)', marginBottom: 8 }}>
        <span>{layer.label ? localize(layer.label, ctx.locale) : ''}</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(value * 100)}%</span>
      </div>
      <div
        style={{
          position: 'relative',
          width: w,
          height: h,
          borderRadius: h / 2,
          background: theme.color.uiPanel,
          border: `3px solid ${full ? theme.color.gold : theme.color.uiBorder}`,
          overflow: 'hidden',
          boxShadow: full ? `0 0 ${24 + 10 * Math.sin(t * 8)}px ${theme.color.gold}` : theme.shadow,
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${value * 100}%`, background: `linear-gradient(180deg, ${color}, ${color}cc)`, borderRadius: h / 2 }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, width: '18%', left: `${shine * 100}%`, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
      </div>
    </LayerBox>
  );
};

// ---------------------------------------------------------------------------
// Stamp (rejection)
// ---------------------------------------------------------------------------

export const StampLayerView: React.FC<{ layer: StampLayer; index: number }> = ({ layer, index }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const at = sceneSeconds(ctx, layer.at);
  if (t < at) return null;
  const p = clamp01((t - at) / 0.22);
  const e = ease('outBack', 'outBack')(p);
  const size = (layer.size ?? 0.42) * ctx.H;
  const scale = 2.4 - 1.4 * e;
  const extra = evaluateAll(t, resolveAnimations(ctx, layer.animations, `${ctx.sceneId}:stamp${index}`));
  const red = '#e5383b';
  return (
    <LayerBox
      x={(layer.x ?? 0.5) * ctx.W}
      y={(layer.y ?? 0.5) * ctx.H}
      w={size}
      h={size}
      anchor={[0.5, 0.5]}
      transform={{ ...extra, scale: extra.scale * scale, opacity: extra.opacity * clamp01(p * 3) }}
      rotation={layer.rotation ?? -12}
      opacity={layer.opacity}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))' }}>
        <circle cx={50} cy={50} r={44} fill="rgba(229,56,59,0.12)" stroke={red} strokeWidth={8} />
        <path d="M30 30 L70 70 M70 30 L30 70" stroke={red} strokeWidth={13} strokeLinecap="round" />
      </svg>
      {layer.text ? (
        <div style={{ position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)', fontFamily: theme.font.display, fontSize: size * 0.22, color: red, ...theme.textStroke(size * 0.012, '#fff'), whiteSpace: 'nowrap' }}>
          {localize(layer.text, ctx.locale)}
        </div>
      ) : null}
    </LayerBox>
  );
};

// ---------------------------------------------------------------------------
// Light / grade / vignette
// ---------------------------------------------------------------------------

export const LightLayerView: React.FC<{ layer: LightLayer; index: number }> = ({ layer, index }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const anims = useAnims(layer.animations, [], `light${index}`);
  const tr = evaluateAll(t, anims);
  const flicker = layer.flicker ? 1 - (0.5 + 0.5 * noise1D(`${ctx.sceneId}fl${index}`, t * 10)) * layer.flicker : 1;
  const intensity = (layer.intensity ?? 0.6) * flicker;
  const shape = layer.shape ?? 'glow';
  const { W, H } = ctx;
  let style: React.CSSProperties;
  if (shape === 'grade') {
    style = { position: 'absolute', inset: 0, background: layer.color, opacity: intensity, mixBlendMode: (layer.blend ?? 'multiply') as React.CSSProperties['mixBlendMode'] };
  } else if (shape === 'vignette') {
    style = { position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, transparent 45%, ${layer.color} 120%)`, opacity: intensity };
  } else if (shape === 'beam') {
    const x = (layer.x ?? 0.7) * W;
    const r = (layer.radius ?? 0.5) * H;
    style = {
      position: 'absolute',
      left: x - r,
      top: -H * 0.1,
      width: r * 2,
      height: H * 1.3,
      background: `linear-gradient(180deg, ${layer.color} 0%, transparent 85%)`,
      clipPath: 'polygon(38% 0, 62% 0, 100% 100%, 0% 100%)',
      transform: `rotate(${layer.rotation ?? 18}deg)`,
      transformOrigin: '50% 0',
      opacity: intensity,
      mixBlendMode: (layer.blend ?? 'screen') as React.CSSProperties['mixBlendMode'],
      filter: 'blur(18px)',
    };
  } else {
    const r = (layer.radius ?? 0.4) * H;
    style = {
      position: 'absolute',
      left: (layer.x ?? 0.5) * W - r,
      top: (layer.y ?? 0.5) * H - r,
      width: r * 2,
      height: r * 2,
      background: `radial-gradient(closest-side, ${layer.color}, transparent)`,
      opacity: intensity,
      mixBlendMode: (layer.blend ?? 'screen') as React.CSSProperties['mixBlendMode'],
    };
  }
  return <div style={{ ...style, opacity: (style.opacity as number) * tr.opacity * (layer.opacity ?? 1) }} />;
};

// ---------------------------------------------------------------------------
// Rect / Flash / Wordmark
// ---------------------------------------------------------------------------

export const RectLayerView: React.FC<{ layer: RectLayer; index: number }> = ({ layer, index }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const anims = useAnims(layer.animations, [], `rect${index}`);
  const w = layer.w * ctx.W;
  const h = layer.h * ctx.H;
  return (
    <LayerBox x={(layer.x ?? 0.5) * ctx.W} y={(layer.y ?? 0.5) * ctx.H} w={w} h={h} anchor={[0.5, 0.5]} transform={evaluateAll(t, anims)} rotation={layer.rotation} opacity={layer.opacity} blend={layer.blend}>
      <div style={{ width: '100%', height: '100%', background: layer.color, borderRadius: layer.radius ?? 0 }} />
    </LayerBox>
  );
};

export const FlashLayerView: React.FC<{ layer: FlashLayer }> = ({ layer }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const at = sceneSeconds(ctx, layer.at);
  const dur = layer.duration ?? 0.3;
  if (t < at || t > at + dur) return null;
  const p = (t - at) / dur;
  const a = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
  return <div style={{ position: 'absolute', inset: 0, background: layer.color ?? '#fff', opacity: a * (layer.opacity ?? 0.85), mixBlendMode: (layer.blend ?? 'normal') as React.CSSProperties['mixBlendMode'] }} />;
};

export const WordmarkLayerView: React.FC<{ layer: WordmarkLayer; index: number }> = ({ layer, index }) => {
  const ctx = useScene();
  const t = useSceneTime();
  const at = sceneSeconds(ctx, layer.at);
  const fallback = useMemo<AnimationSpec[]>(() => [{ type: 'punch_in', at: layer.at, intensity: 0.4, duration: 0.5 }], [layer.at]);
  const anims = useAnims(layer.animations, fallback, `wordmark${index}`);
  if (t < at) return null;
  const bar = ease('inOutCubic', 'inOutCubic')(clamp01((t - at - 0.25) / 0.45));
  const tag = clamp01((t - at - 0.45) / 0.4);
  const brand = layer.asset ? ctx.resolveAsset(layer.asset) : undefined;
  return (
    <LayerBox x={(layer.x ?? 0.5) * ctx.W} y={(layer.y ?? 0.5) * ctx.H} w={0} h={0} anchor={[0.5, 0.5]} transform={evaluateAll(t, anims)} opacity={layer.opacity}>
      <div style={{ position: 'absolute', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {brand?.exists ? (
          <Img src={staticFile(brand.publicPath)} style={{ height: 180 }} />
        ) : (
          <div style={{ fontFamily: theme.font.display, fontSize: 130, letterSpacing: '0.04em', lineHeight: 1, whiteSpace: 'nowrap', ...theme.textStroke(8), textShadow: `0 8px 0 ${theme.color.ink}` }}>
            <span style={{ color: theme.color.white }}>SECOND</span>
            <span style={{ color: theme.color.questRed }}>QUEST</span>
          </div>
        )}
        <div style={{ marginTop: 18, height: 8, width: 520 * bar, background: theme.color.gold, borderRadius: 4, boxShadow: `0 3px 0 ${theme.color.ink}` }} />
        {layer.tagline ? (
          <div style={{ marginTop: 18, opacity: tag, fontFamily: theme.font.ui, fontWeight: 600, fontSize: 30, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            {localize(layer.tagline, ctx.locale)}
          </div>
        ) : null}
      </div>
    </LayerBox>
  );
};
