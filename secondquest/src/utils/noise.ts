import { random } from 'remotion';

/**
 * Deterministic smooth 1-D value noise in [-1, 1]. Same (seed, t) always gives
 * the same value, so renders are reproducible frame-for-frame.
 */
export const noise1D = (seed: string | number, t: number): number => {
  const i = Math.floor(t);
  const f = t - i;
  const a = random(`${seed}:${i}`) * 2 - 1;
  const b = random(`${seed}:${i + 1}`) * 2 - 1;
  const s = f * f * (3 - 2 * f);
  return a + (b - a) * s;
};

/** Deterministic random in [min, max). */
export const rand = (seed: string | number, min = 0, max = 1): number =>
  min + random(String(seed)) * (max - min);
