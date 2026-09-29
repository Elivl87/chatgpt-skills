import { interpolate } from 'remotion';
import type { AnimationType, Direction, EasingName } from '../schema/types';
import { clamp01, ease } from '../utils/easing';
import { noise1D } from '../utils/noise';
import type { Transform } from './transform';

/**
 * Animation presets. Each is a pure function of scene time → transform delta,
 * so they are deterministic, composable and cheap.
 *
 * Every preset honours: start (at), duration, easing, intensity.
 * Entrances hold their "hidden" state before `start`; exits hold "gone" after.
 */
export interface ResolvedAnimation {
  type: AnimationType;
  /** seconds, scene-relative */
  start: number;
  /** seconds (may be Infinity for loops) */
  duration: number;
  easing?: EasingName;
  intensity: number;
  from?: Direction;
  to?: Direction;
  distance?: number;
  frequency?: number;
  phase: number;
  seed: string;
}

type Preset = (t: number, a: ResolvedAnimation) => Partial<Transform>;

export const DEFAULT_DURATION: Partial<Record<AnimationType, number>> = {
  pop_in: 0.45,
  slide_in: 0.5,
  fade_in: 0.4,
  drop_in: 0.8,
  rise_in: 0.7,
  punch_in: 0.4,
  wipe_in: 0.45,
  pop_out: 0.3,
  slide_out: 0.45,
  fade_out: 0.4,
  sink_out: 0.5,
  reaction: 0.5,
  squash: 0.22,
  hop: 0.35,
  nudge: 0.35,
};

const DIR: Record<Direction, [number, number]> = {
  left: [-1, 0],
  right: [1, 0],
  up: [0, -1],
  down: [0, 1],
};

const p = (t: number, a: ResolvedAnimation, fallback: EasingName) =>
  ease(a.easing, fallback)(clamp01((t - a.start) / a.duration));

/** Loop envelope: fade loops in/out over 0.2 s so they never pop. */
const loopEnv = (t: number, a: ResolvedAnimation) => {
  const local = t - a.start;
  if (local < 0) return 0;
  const inEnv = clamp01(local / 0.2);
  const outEnv = Number.isFinite(a.duration) ? clamp01((a.duration - local) / 0.2) : 1;
  return inEnv * outEnv;
};

/** Damped overshoot used for pops/drops (deterministic, spring-like). */
const overshoot = (x: number, amount: number) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const k = Math.max(2, 5.5 - 8 * amount); // lower damping = bigger overshoot
  const residual = Math.exp(-k * x) * Math.cos(7 * x);
  return 1 - residual * (1 - Math.pow(x, 6)); // settle exactly at 1
};

const outBounce = (x: number) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  return n1 * (x -= 2.625 / d1) * x + 0.984375;
};

const PRESETS: Record<AnimationType, Preset> = {
  // ---------------------------------------------------------------- entrances
  pop_in: (t, a) => {
    const x = clamp01((t - a.start) / a.duration);
    if (t < a.start) return { scale: 0, opacity: 0 };
    const s = overshoot(x, 0.15 * a.intensity);
    return { scale: Math.max(0, s), opacity: clamp01(x * 5) };
  },
  slide_in: (t, a) => {
    const [dx, dy] = DIR[a.from ?? 'left'];
    const dist = (a.distance ?? 900) * a.intensity;
    const e = p(t, a, 'outCubic');
    const blur = (1 - e) * 10 * Math.min(1, a.intensity);
    return { x: dx * dist * (1 - e), y: dy * dist * (1 - e), opacity: t < a.start ? 0 : 1, blur };
  },
  fade_in: (t, a) => ({ opacity: p(t, a, 'inOutSine') }),
  drop_in: (t, a) => {
    if (t < a.start) return { opacity: 0 };
    const x = clamp01((t - a.start) / a.duration);
    const dist = (a.distance ?? 1100) * a.intensity;
    const b = outBounce(x);
    // squash on first impact (x ≈ 0.36)
    const impact = Math.max(0, 1 - Math.abs(x - 0.4) / 0.1);
    return { y: -(1 - b) * dist, scaleY: 1 - 0.14 * impact * a.intensity, scaleX: 1 + 0.1 * impact * a.intensity };
  },
  rise_in: (t, a) => {
    if (t < a.start) return { opacity: 0 };
    const e = p(t, a, 'outCubic');
    return { y: (1 - e) * (a.distance ?? 600) * a.intensity, opacity: clamp01(((t - a.start) / a.duration) * 4) };
  },
  punch_in: (t, a) => {
    if (t < a.start) return { opacity: 0, scale: 0 };
    const x = clamp01((t - a.start) / a.duration);
    const e = ease(a.easing, 'outBack')(x);
    const from = 1 + 0.9 * a.intensity;
    const sign = noise1D(a.seed, 3.3) > 0 ? 1 : -1;
    return {
      scale: from + (1 - from) * e,
      opacity: clamp01(x * 4),
      blur: (1 - clamp01(x * 2.5)) * 14,
      rotate: sign * (1 - e) * 8 * a.intensity,
    };
  },
  wipe_in: (t, a) => ({ reveal: p(t, a, 'inOutCubic'), opacity: t < a.start ? 0 : 1 }),

  // ------------------------------------------------------------------- exits
  pop_out: (t, a) => {
    const e = p(t, a, 'inBack');
    return { scale: Math.max(0, 1 - e), opacity: t >= a.start + a.duration ? 0 : 1 };
  },
  slide_out: (t, a) => {
    const [dx, dy] = DIR[a.to ?? 'right'];
    const dist = (a.distance ?? 1100) * a.intensity;
    const e = p(t, a, 'inCubic');
    return { x: dx * dist * e, y: dy * dist * e, blur: e * 10, opacity: t >= a.start + a.duration ? 0 : 1 };
  },
  fade_out: (t, a) => ({ opacity: 1 - p(t, a, 'inOutSine') }),
  sink_out: (t, a) => {
    const e = p(t, a, 'inBack');
    return { y: e * (a.distance ?? 700) * a.intensity, opacity: t >= a.start + a.duration ? 0 : 1 };
  },

  // ------------------------------------------------------------------- loops
  float: (t, a) => {
    const env = loopEnv(t, a);
    const w = 2 * Math.PI * (a.frequency ?? 0.3) * (t + a.phase);
    return { y: Math.sin(w) * 9 * a.intensity * env, rotate: Math.cos(w * 0.7) * 0.6 * a.intensity * env };
  },
  bounce: (t, a) => {
    const env = loopEnv(t, a);
    const w = Math.PI * (a.frequency ?? 2) * (t + a.phase);
    const s = Math.abs(Math.sin(w));
    const contact = Math.pow(1 - s, 6);
    return {
      y: -s * 16 * a.intensity * env,
      scaleY: 1 - 0.05 * contact * a.intensity * env,
      scaleX: 1 + 0.03 * contact * a.intensity * env,
    };
  },
  shake: (t, a) => {
    const env = loopEnv(t, a);
    const f = a.frequency ?? 16;
    const amp = 7 * a.intensity * env;
    return {
      x: noise1D(`${a.seed}x`, t * f) * amp,
      y: noise1D(`${a.seed}y`, t * f) * amp * 0.6,
      rotate: noise1D(`${a.seed}r`, t * f) * 2 * a.intensity * env,
    };
  },
  breathe: (t, a) => {
    const env = loopEnv(t, a);
    const s = Math.sin(2 * Math.PI * (a.frequency ?? 0.28) * (t + a.phase));
    return { scaleY: 1 + 0.012 * s * a.intensity * env, scaleX: 1 - 0.005 * s * a.intensity * env };
  },
  wobble: (t, a) => {
    const env = loopEnv(t, a);
    return { rotate: Math.sin(2 * Math.PI * (a.frequency ?? 1.2) * (t + a.phase)) * 3 * a.intensity * env };
  },
  pulse: (t, a) => {
    const env = loopEnv(t, a);
    const s = Math.max(0, Math.sin(2 * Math.PI * (a.frequency ?? 1.4) * (t + a.phase)));
    return { scale: 1 + 0.06 * s * s * a.intensity * env };
  },
  spin: (t, a) => {
    const local = Math.max(0, t - a.start);
    const end = Number.isFinite(a.duration) ? Math.min(local, a.duration) : local;
    return { rotate: 360 * (a.frequency ?? 0.5) * end * a.intensity };
  },
  drift: (t, a) => {
    const [dx, dy] = DIR[a.to ?? 'right'];
    const dur = Number.isFinite(a.duration) ? a.duration : 6;
    const e = ease(a.easing, 'inOutSine')(clamp01((t - a.start) / dur));
    const dist = (a.distance ?? 40) * a.intensity;
    return { x: dx * dist * e, y: dy * dist * e };
  },
  flicker: (t, a) => {
    const env = loopEnv(t, a);
    const n = noise1D(a.seed, t * (a.frequency ?? 9));
    return { opacity: 1 - (0.5 + 0.5 * n) * 0.35 * a.intensity * env };
  },

  // ---------------------------------------------------------------- accents
  reaction: (t, a) => {
    const x = (t - a.start) / a.duration;
    if (x < 0 || x > 1) return {};
    const k = a.intensity;
    return {
      scaleY: interpolate(x, [0, 0.2, 0.45, 0.7, 1], [1, 1 - 0.1 * k, 1 + 0.1 * k, 1 - 0.03 * k, 1]),
      scaleX: interpolate(x, [0, 0.2, 0.45, 0.7, 1], [1, 1 + 0.08 * k, 1 - 0.06 * k, 1 + 0.02 * k, 1]),
      y: interpolate(x, [0, 0.2, 0.45, 0.75, 1], [0, 0, -38 * k, 0, 0]),
    };
  },
  squash: (t, a) => {
    const x = (t - a.start) / a.duration;
    if (x < 0 || x > 1) return {};
    const s = Math.sin(x * Math.PI) * 0.07 * a.intensity;
    return { scaleY: 1 - s, scaleX: 1 + s * 0.8 };
  },
  hop: (t, a) => {
    const x = (t - a.start) / a.duration;
    if (x < 0 || x > 1) return {};
    return { y: -Math.sin(x * Math.PI) * 30 * a.intensity };
  },
  nudge: (t, a) => {
    const x = (t - a.start) / a.duration;
    if (x < 0 || x > 1) return {};
    const [dx, dy] = DIR[a.from ?? 'right'];
    const v = Math.sin(x * Math.PI * 3) * (1 - x) * 18 * a.intensity;
    return { x: dx * v, y: dy * v };
  },
};

export const ANIMATION_TYPES = Object.keys(PRESETS) as AnimationType[];

export const evaluateAnimation = (t: number, a: ResolvedAnimation): Partial<Transform> => PRESETS[a.type](t, a);
