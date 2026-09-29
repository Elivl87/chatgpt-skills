import type { DuckConfig } from '../schema/types';
import { clamp01 } from '../utils/easing';

/**
 * Narration-driven ducking. Speech intervals come straight from timings.json,
 * so ducking follows the real voice-over automatically — no sidechain needed
 * and the result is deterministic.
 *
 * Returns the amount of ducking 0..1 at time t (1 = fully ducked).
 */
export const duckAmount = (t: number, speech: Array<{ start: number; end: number }>, cfg: DuckConfig): number => {
  const look = cfg.lookahead ?? 0.1;
  let amount = 0;
  for (const s of speech) {
    const a0 = s.start - look - cfg.attack;
    const a1 = s.start - look;
    if (t < a0) break; // sorted by start
    let v: number;
    if (t < a1) v = (t - a0) / cfg.attack;
    else if (t <= s.end) v = 1;
    else v = 1 - (t - s.end) / cfg.release;
    amount = Math.max(amount, clamp01(v));
    if (amount >= 1) return 1;
  }
  return amount;
};

/** Gain multiplier for a ducked bus. */
export const duckGain = (t: number, speech: Array<{ start: number; end: number }>, cfg: DuckConfig, to = cfg.to): number =>
  1 - duckAmount(t, speech, cfg) * (1 - to);

/** Piecewise-linear gain automation. */
export const automationGain = (t: number, points: Array<{ t: number; gain: number }>): number => {
  if (points.length === 0) return 1;
  if (t <= points[0].t) return points[0].gain;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (t <= b.t) return b.t === a.t ? b.gain : a.gain + ((t - a.t) / (b.t - a.t)) * (b.gain - a.gain);
  }
  return points[points.length - 1].gain;
};

/** Linear fade-in/out envelope inside [start, end]. */
export const fadeGain = (t: number, start: number, end: number, fadeIn: number, fadeOut: number): number => {
  const i = fadeIn > 0 ? clamp01((t - start) / fadeIn) : 1;
  const o = fadeOut > 0 ? clamp01((end - t) / fadeOut) : 1;
  return Math.min(i, o);
};
