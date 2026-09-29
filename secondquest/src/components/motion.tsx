/**
 * Named SecondQuest motion components for code-authored scenes.
 *
 * JSON scenes use the same presets by name ("pop_in", "push_in", ...). These
 * wrappers expose them as React components so custom scenes (src/scenes) speak
 * the same motion vocabulary. Times are in seconds relative to the enclosing
 * <Sequence>; every component accepts start/duration/easing/intensity.
 */
import React, { createContext, useContext, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { evaluateCamera, layerCamera, planeTransform, resolveCamera, type CameraFrame } from '../animations/camera';
import { evaluateAnimation, DEFAULT_DURATION, type ResolvedAnimation } from '../animations/presets';
import { combine, IDENTITY, toCss } from '../animations/transform';
import { transitionStyle } from '../animations/transitions';
import type { AnimationType, CameraConfig, CounterLayer, Direction, EasingName, ParticlesLayer, ProgressLayer, TextLayer } from '../schema/types';
import { CounterLayerView, ProgressLayerView, TextLayerView } from './layers/GraphicLayers';
import { ParticlesLayerView } from './layers/ParticlesLayerView';
import { SceneProvider, type SceneContextValue } from './SceneContext';

// ---------------------------------------------------------------- common

export interface MotionProps {
  start?: number;
  duration?: number;
  easing?: EasingName;
  intensity?: number;
  /** Position offset/placement (px) and base scale for the wrapped element. */
  x?: number;
  y?: number;
  scale?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

const toResolved = (type: AnimationType, p: MotionProps & { from?: Direction; to?: Direction; distance?: number; frequency?: number }): ResolvedAnimation => ({
  type,
  start: p.start ?? 0,
  duration: p.duration ?? DEFAULT_DURATION[type] ?? Infinity,
  easing: p.easing,
  intensity: p.intensity ?? 1,
  from: p.from,
  to: p.to,
  distance: p.distance,
  frequency: p.frequency,
  phase: 0,
  seed: type,
});

/** Generic animator: compose any presets on a child element. */
export const Animate: React.FC<MotionProps & { anims: ResolvedAnimation[] }> = ({ anims, x = 0, y = 0, scale = 1, style, children }) => {
  const t = useT();
  const tr = anims.reduce((acc, a) => combine(acc, evaluateAnimation(t, a)), { ...IDENTITY, x, y, scale });
  return <div style={{ ...style, ...toCss(tr) }}>{children}</div>;
};

const preset =
  (type: AnimationType, extra: Partial<{ from: Direction; to: Direction }> = {}) =>
  // eslint-disable-next-line react/display-name
  (p: MotionProps & { from?: Direction; to?: Direction; distance?: number; frequency?: number }) => (
    <Animate {...p} anims={[toResolved(type, { ...extra, ...p })]} />
  );

// ---------------------------------------------------------------- characters & objects

export const CharacterPopIn = preset('pop_in');
export const CharacterSlideIn = preset('slide_in', { from: 'left' });
export const CharacterReaction = preset('reaction');
export const FloatAnimation = preset('float');
export const ShakeAnimation = preset('shake');
export const BounceAnimation = preset('bounce');
export const ObjectDrop = preset('drop_in');
export const SlowDrift = preset('drift', { to: 'right' });

// ---------------------------------------------------------------- camera / parallax

const CamCtx = createContext<{ cam: CameraFrame; parallax: number } | null>(null);

/** Camera over a stack of <ParallaxLayer depth={0..1}> children. */
export const ParallaxScene: React.FC<{ camera?: CameraConfig; children: React.ReactNode }> = ({ camera, children }) => {
  const t = useT();
  const { durationInFrames, fps } = useVideoConfig();
  const resolved = useMemo(
    () => resolveCamera(camera, (e) => (typeof e === 'number' ? e : 0), durationInFrames / fps, 'parallax'),
    [camera, durationInFrames, fps],
  );
  return (
    <CamCtx.Provider value={{ cam: evaluateCamera(resolved, t), parallax: resolved.parallax }}>
      <AbsoluteFill style={{ overflow: 'hidden' }}>{children}</AbsoluteFill>
    </CamCtx.Provider>
  );
};

export const ParallaxLayer: React.FC<{ depth: number; children: React.ReactNode }> = ({ depth, children }) => {
  const c = useContext(CamCtx);
  const { width, height } = useVideoConfig();
  if (!c) return <>{children}</>;
  const lc = layerCamera(c.cam, depth, c.parallax);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width, height, transformOrigin: '0 0', transform: planeTransform(lc, width, height) }}>
      {children}
    </div>
  );
};

type CamPreset = { start?: number; duration?: number; easing?: EasingName; amount?: number; children: React.ReactNode };
const camPreset =
  (type: 'push_in' | 'pull_out' | 'pan_left' | 'pan_right') =>
  // eslint-disable-next-line react/display-name
  ({ start = 0, duration, easing, amount, children }: CamPreset) => (
    <ParallaxScene camera={{ moves: [{ type, at: start, duration, easing, amount }] }}>
      <ParallaxLayer depth={0.5}>{children}</ParallaxLayer>
    </ParallaxScene>
  );

export const CameraPushIn = camPreset('push_in');
export const CameraPullOut = camPreset('pull_out');
export const PanLeft = camPreset('pan_left');
export const PanRight = camPreset('pan_right');

// ---------------------------------------------------------------- transitions

const transitionWrapper =
  (type: 'fade' | 'whip') =>
  // eslint-disable-next-line react/display-name
  ({ duration = type === 'fade' ? 0.4 : 0.32, direction, children }: { duration?: number; direction?: Direction; children: React.ReactNode }) => {
    const t = useT();
    const { width, height } = useVideoConfig();
    const { style } = transitionStyle({ type, duration, direction }, 'enter', t / duration, width, height);
    return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
  };

export const FadeTransition = transitionWrapper('fade');
export const WhipTransition = transitionWrapper('whip');

// ---------------------------------------------------------------- UI widgets

/** Minimal scene context so layer widgets work outside JSON scenes. */
const Standalone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const value = useMemo<SceneContextValue>(
    () => ({
      fps,
      W: width,
      H: height,
      sceneId: 'standalone',
      startSec: 0,
      endSec: durationInFrames / fps,
      cues: {},
      locale: 'en',
      resolveAsset: (id) => {
        throw new Error(`Standalone widgets cannot resolve asset "${id}"`);
      },
    }),
    [fps, width, height, durationInFrames],
  );
  return <SceneProvider value={value}>{children}</SceneProvider>;
};

export const TextPunch: React.FC<Omit<TextLayer, 'type'>> = (p) => (
  <Standalone>
    <TextLayerView layer={{ type: 'text', ...p }} index={0} />
  </Standalone>
);

export const MoneyDrain: React.FC<Omit<CounterLayer, 'type'>> = (p) => (
  <Standalone>
    <CounterLayerView layer={{ type: 'counter', prefix: '$', ...p }} index={0} />
  </Standalone>
);

export const ProgressFill: React.FC<Omit<ProgressLayer, 'type'>> = (p) => (
  <Standalone>
    <ProgressLayerView layer={{ type: 'progress', ...p }} index={0} />
  </Standalone>
);

export const ParticleDust: React.FC<Omit<ParticlesLayer, 'type' | 'kind'> & { kind?: ParticlesLayer['kind'] }> = (p) => (
  <Standalone>
    <ParticlesLayerView layer={{ type: 'particles', kind: 'dust', ...p }} index={0} />
  </Standalone>
);
