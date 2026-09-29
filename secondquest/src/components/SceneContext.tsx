import React, { createContext, useContext } from 'react';
import { useCurrentFrame } from 'remotion';
import { DEFAULT_DURATION, evaluateAnimation, type ResolvedAnimation } from '../animations/presets';
import { combine, IDENTITY, type Transform } from '../animations/transform';
import type { AssetResolver } from '../engine/assets';
import type { AnimationSpec, Cue, LocalText, TimeExpr } from '../schema/types';
import { resolveTime } from '../utils/time';

export interface SceneContextValue {
  fps: number;
  W: number;
  H: number;
  sceneId: string;
  startSec: number;
  endSec: number;
  cues: Record<string, Cue>;
  locale: string;
  resolveAsset: AssetResolver;
}

const Ctx = createContext<SceneContextValue | null>(null);

export const SceneProvider: React.FC<{ value: SceneContextValue; children: React.ReactNode }> = ({ value, children }) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);

export const useScene = (): SceneContextValue => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useScene() outside a SceneProvider');
  return v;
};

/** Scene-relative seconds for a time expression. */
export const sceneSeconds = (ctx: SceneContextValue, expr: TimeExpr): number =>
  resolveTime(expr, { cues: ctx.cues, sceneStart: ctx.startSec, sceneEnd: ctx.endSec, relative: true }) - ctx.startSec;

/** Current scene time in seconds. */
export const useSceneTime = (): number => {
  const frame = useCurrentFrame();
  return frame / useScene().fps;
};

export const localize = (text: LocalText, locale: string): string =>
  typeof text === 'string' ? text : (text[locale] ?? text.en ?? Object.values(text)[0] ?? '');

export const resolveAnimations = (
  ctx: SceneContextValue,
  specs: AnimationSpec[] | undefined,
  seed: string,
): ResolvedAnimation[] =>
  (specs ?? []).map((s, i) => {
    const start = sceneSeconds(ctx, s.at ?? 0);
    const duration =
      s.end !== undefined ? Math.max(0.001, sceneSeconds(ctx, s.end) - start) : (s.duration ?? DEFAULT_DURATION[s.type] ?? Infinity);
    return {
      type: s.type,
      start,
      duration,
      easing: s.easing,
      intensity: s.intensity ?? 1,
      from: s.from,
      to: s.to,
      distance: s.distance,
      frequency: s.frequency,
      phase: s.phase ?? 0,
      seed: `${seed}:${i}:${s.seed ?? ''}`,
    };
  });

export const evaluateAll = (t: number, anims: ResolvedAnimation[]): Transform =>
  anims.reduce<Transform>((acc, a) => combine(acc, evaluateAnimation(t, a)), IDENTITY);
