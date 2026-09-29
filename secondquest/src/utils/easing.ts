import { Easing } from 'remotion';
import type { EasingName } from '../schema/types';

type EaseFn = (t: number) => number;

const outElastic: EaseFn = (t) => {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3.2;
  return Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

export const EASINGS: Record<EasingName, EaseFn> = {
  linear: (t) => t,
  inSine: Easing.in(Easing.sin),
  outSine: Easing.out(Easing.sin),
  inOutSine: Easing.inOut(Easing.sin),
  inQuad: Easing.in(Easing.quad),
  outQuad: Easing.out(Easing.quad),
  inOutQuad: Easing.inOut(Easing.quad),
  inCubic: Easing.in(Easing.cubic),
  outCubic: Easing.out(Easing.cubic),
  inOutCubic: Easing.inOut(Easing.cubic),
  inExpo: Easing.in(Easing.exp),
  outExpo: Easing.out(Easing.exp),
  inOutExpo: Easing.inOut(Easing.exp),
  outBack: Easing.out(Easing.back(1.7)),
  inBack: Easing.in(Easing.back(1.7)),
  outElastic,
};

export const ease = (name: EasingName | undefined, fallback: EasingName): EaseFn =>
  EASINGS[name ?? fallback] ?? EASINGS[fallback];

export const clamp01 = (t: number): number => Math.min(1, Math.max(0, t));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Progress 0..1 of a window [start, start+duration] at time t, eased. */
export const progress = (t: number, start: number, duration: number, easing: EaseFn): number =>
  duration <= 0 ? (t >= start ? 1 : 0) : easing(clamp01((t - start) / duration));
