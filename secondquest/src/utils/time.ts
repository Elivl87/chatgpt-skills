import type { Cue, TimeExpr } from '../schema/types';

export interface TimeContext {
  cues: Record<string, Cue>;
  /** Absolute seconds of the current scene (for scene-relative expressions). */
  sceneStart?: number;
  sceneEnd?: number;
  /** Absolute end of the cut. */
  end?: number;
  /** When true, bare numbers are relative to sceneStart. */
  relative?: boolean;
}

export class TimeExprError extends Error {}

const EXPR = /^\s*([A-Za-z_][\w]*)(?:\.(start|end))?\s*(?:([+-])\s*(\d*\.?\d+))?\s*$/;

/** Resolve a time expression to ABSOLUTE seconds. */
export const resolveTime = (expr: TimeExpr, ctx: TimeContext): number => {
  if (typeof expr === 'number') {
    return ctx.relative ? (ctx.sceneStart ?? 0) + expr : expr;
  }
  const m = EXPR.exec(expr);
  if (!m) {
    const n = Number(expr);
    if (!Number.isNaN(n)) return resolveTime(n, ctx);
    throw new TimeExprError(`Invalid time expression "${expr}"`);
  }
  const [, anchor, edge, sign, amount] = m;
  const offset = amount ? (sign === '-' ? -1 : 1) * Number(amount) : 0;

  let base: number;
  if (anchor === 'scene') {
    if (ctx.sceneStart === undefined) throw new TimeExprError(`"${expr}" used outside a scene`);
    if (edge === 'end') {
      if (ctx.sceneEnd === undefined) throw new TimeExprError(`"${expr}": scene end unknown here`);
      base = ctx.sceneEnd;
    } else {
      base = ctx.sceneStart;
    }
  } else if (anchor === 'end') {
    if (ctx.end === undefined) throw new TimeExprError(`"${expr}": cut end unknown here`);
    base = ctx.end;
  } else {
    const cue = ctx.cues[anchor];
    if (!cue) throw new TimeExprError(`Unknown narration cue "${anchor}" in "${expr}"`);
    base = edge === 'end' ? cue.end : cue.start;
  }
  return base + offset;
};

/** Collect cue ids referenced by an expression (for validation). */
export const cueRefs = (expr: TimeExpr | undefined): string[] => {
  if (typeof expr !== 'string') return [];
  const m = EXPR.exec(expr);
  if (!m) return [];
  return m[1] === 'scene' || m[1] === 'end' ? [] : [m[1]];
};

export const secondsToFrames = (s: number, fps: number): number => Math.round(s * fps);
