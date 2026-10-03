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

// anchor[.wN][.start|.end][±offset] — e.g. "l12", "l12.end", "l12.w3", "l12.w3.end-0.1", "scene+1.2"
const EXPR = /^\s*([A-Za-z_][\w]*)(?:\.w(\d+))?(?:\.(start|end))?\s*(?:([+-])\s*(\d*\.?\d+))?\s*$/;

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
  const [, anchor, word, edge, sign, amount] = m;
  const offset = amount ? (sign === '-' ? -1 : 1) * Number(amount) : 0;

  let base: number;
  if (word !== undefined && (anchor === 'scene' || anchor === 'end')) throw new TimeExprError(`"${expr}": word anchors only apply to narration cues`);
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
    if (word !== undefined) {
      const w = cue.words?.[Number(word) - 1];
      if (!w) throw new TimeExprError(`"${expr}": cue "${anchor}" has no word ${word} (${cue.words?.length ?? 0} word timings)`);
      base = edge === 'end' ? w.end : w.start;
    } else {
      base = edge === 'end' ? cue.end : cue.start;
    }
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
