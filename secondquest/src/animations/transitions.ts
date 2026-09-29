import type React from 'react';
import type { Direction, TransitionSpec, TransitionType } from '../schema/types';
import { clamp01, ease } from '../utils/easing';

/**
 * Scene transitions.
 *
 * Timing model: the incoming scene starts at its cue time; the outgoing scene
 * is kept alive for `duration` extra seconds underneath it. Both read the same
 * progress p (0→1) — the incoming scene applies `enter`, the outgoing `exit`.
 * Overlay colours (dip/flash) are painted by the incoming scene, on top.
 */

export const DEFAULT_TRANSITION_DURATION: Record<TransitionType, number> = {
  cut: 0,
  fade: 0.4,
  whip: 0.32,
  zoom: 0.4,
  wipe: 0.45,
  dip: 0.5,
  flash: 0.3,
};

export interface TransitionStyle {
  style: React.CSSProperties;
  overlay?: { color: string; opacity: number };
}

const vec = (d: Direction | undefined): [number, number] => {
  switch (d ?? 'left') {
    case 'left':
      return [-1, 0];
    case 'right':
      return [1, 0];
    case 'up':
      return [0, -1];
    case 'down':
      return [0, 1];
  }
};

/** Triangle 0→1→0 over p. */
const tri = (p: number) => 1 - Math.abs(p * 2 - 1);

export const transitionStyle = (
  spec: TransitionSpec,
  phase: 'enter' | 'exit',
  rawP: number,
  W: number,
  H: number,
): TransitionStyle => {
  const p = clamp01(rawP);
  // content moves toward `direction` (whip left = camera whips right→left)
  const [dx, dy] = vec(spec.direction);
  switch (spec.type) {
    case 'cut':
      return { style: {} };
    case 'fade': {
      const e = ease('inOutSine', 'inOutSine')(p);
      return { style: phase === 'enter' ? { opacity: e } : {} };
    }
    case 'whip': {
      const e = ease('inOutCubic', 'inOutCubic')(p);
      const blur = tri(p) * 28;
      const off = phase === 'enter' ? 1 - e : -e;
      return {
        style: {
          transform: `translate(${(-dx * off * W).toFixed(1)}px, ${(-dy * off * H).toFixed(1)}px)`,
          filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : undefined,
        },
      };
    }
    case 'zoom': {
      const e = ease('inOutCubic', 'inOutCubic')(p);
      if (phase === 'exit') {
        return { style: { transform: `scale(${1 + e * 0.35})`, filter: `blur(${(e * 12).toFixed(1)}px)` } };
      }
      return {
        style: {
          transform: `scale(${0.8 + e * 0.2})`,
          opacity: clamp01(e * 1.6),
          filter: e < 0.99 ? `blur(${((1 - e) * 10).toFixed(1)}px)` : undefined,
        },
      };
    }
    case 'wipe': {
      if (phase === 'exit') return { style: {} };
      const e = ease('inOutCubic', 'inOutCubic')(p) * 100;
      const inset =
        dx > 0 ? `inset(0 0 0 ${100 - e}%)` : dx < 0 ? `inset(0 ${100 - e}% 0 0)` : dy > 0 ? `inset(${100 - e}% 0 0 0)` : `inset(0 0 ${100 - e}% 0)`;
      return { style: { clipPath: inset } };
    }
    case 'dip':
    case 'flash': {
      if (phase === 'exit') return { style: {} };
      const color = spec.color ?? (spec.type === 'dip' ? '#07070b' : '#ffffff');
      const peak = spec.type === 'dip' ? 1 : 0.85;
      return {
        style: { opacity: p < 0.5 ? 0 : 1 },
        overlay: { color, opacity: tri(p) * peak },
      };
    }
  }
};
