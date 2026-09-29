import type { CameraConfig, CameraMove, CameraState, EasingName, TimeExpr } from '../schema/types';
import { clamp01, ease } from '../utils/easing';
import { noise1D } from '../utils/noise';

/**
 * Virtual camera over a 2-D scene.
 *
 * Moves are resolved into additive deltas so they can overlap (e.g. a slow
 * push-in running under a quick punch). Zoom composes multiplicatively,
 * focus/rotation additively. `move_to` targets are converted to deltas by
 * simulating the moves in order at resolve time.
 */

export interface ResolvedMove {
  type: CameraMove['type'];
  start: number;
  duration: number;
  easing: EasingName;
  /** multiplicative zoom factor at completion (punch: peak bump) */
  zoomFactor: number;
  dx: number;
  dy: number;
  drot: number;
}

export interface ResolvedShake {
  start: number;
  duration: number;
  intensity: number;
  frequency: number;
}

export interface ResolvedCamera {
  start: CameraState;
  moves: ResolvedMove[];
  shakes: ResolvedShake[];
  drift: number;
  parallax: number;
  seed: string;
}

export const DEFAULT_CAMERA: CameraState = { zoom: 1, x: 0.5, y: 0.5, rotation: 0 };

type ToSec = (e: TimeExpr) => number;

const moveDuration = (m: { at?: TimeExpr; duration?: number; end?: TimeExpr }, toSec: ToSec, sceneDur: number) => {
  const start = toSec(m.at ?? 0);
  if (m.end !== undefined) return { start, duration: Math.max(0.001, toSec(m.end) - start) };
  return { start, duration: m.duration ?? Math.max(0.001, sceneDur - start) };
};

export const resolveCamera = (
  cfg: CameraConfig | undefined,
  toSec: ToSec,
  sceneDur: number,
  seed: string,
): ResolvedCamera => {
  const start: CameraState = { ...DEFAULT_CAMERA, ...(cfg?.start ?? {}) };
  const sim = { ...start };
  const moves: ResolvedMove[] = [];
  const sorted = [...(cfg?.moves ?? [])]
    .map((m) => ({ m, ...moveDuration(m, toSec, sceneDur) }))
    .sort((a, b) => a.start - b.start);

  for (const { m, start: s, duration } of sorted) {
    const r: ResolvedMove = {
      type: m.type,
      start: s,
      duration,
      easing: m.easing ?? (m.type === 'punch' ? 'outCubic' : 'inOutSine'),
      zoomFactor: 1,
      dx: 0,
      dy: 0,
      drot: 0,
    };
    const amt = m.amount;
    switch (m.type) {
      case 'push_in':
        r.zoomFactor = 1 + (amt ?? 0.08);
        break;
      case 'pull_out':
        r.zoomFactor = 1 / (1 + (amt ?? 0.08));
        break;
      case 'pan_left':
        r.dx = -(amt ?? 0.06);
        break;
      case 'pan_right':
        r.dx = amt ?? 0.06;
        break;
      case 'pan_up':
        r.dy = -(amt ?? 0.06);
        break;
      case 'pan_down':
        r.dy = amt ?? 0.06;
        break;
      case 'punch':
        r.zoomFactor = 1 + (amt ?? 0.06);
        break;
      case 'move_to':
        r.zoomFactor = m.zoom !== undefined ? m.zoom / sim.zoom : 1;
        r.dx = m.x !== undefined ? m.x - sim.x : 0;
        r.dy = m.y !== undefined ? m.y - sim.y : 0;
        r.drot = m.rotation !== undefined ? m.rotation - sim.rotation : 0;
        break;
    }
    if (m.rotation !== undefined && m.type !== 'move_to') r.drot = m.rotation;
    if (m.type !== 'punch') {
      sim.zoom *= r.zoomFactor;
      sim.x += r.dx;
      sim.y += r.dy;
      sim.rotation += r.drot;
    }
    moves.push(r);
  }

  const shakes: ResolvedShake[] = (cfg?.shakes ?? []).map((s) => ({
    start: toSec(s.at),
    duration: s.duration ?? 0.4,
    intensity: s.intensity ?? 10,
    frequency: s.frequency ?? 22,
  }));

  return { start, moves, shakes, drift: cfg?.drift ?? 1, parallax: cfg?.parallax ?? 0.3, seed };
};

export interface CameraFrame extends CameraState {
  /** screen-space shake offset in px */
  shakeX: number;
  shakeY: number;
}

export const evaluateCamera = (cam: ResolvedCamera, t: number): CameraFrame => {
  let zoom = cam.start.zoom;
  let x = cam.start.x;
  let y = cam.start.y;
  let rotation = cam.start.rotation;

  for (const m of cam.moves) {
    const e = ease(m.easing, 'inOutSine')(clamp01((t - m.start) / m.duration));
    if (m.type === 'punch') {
      // quick in, slower settle
      const raw = clamp01((t - m.start) / m.duration);
      const bump = raw < 0.25 ? ease('outCubic', 'outCubic')(raw / 0.25) : 1 - ease('inOutSine', 'inOutSine')((raw - 0.25) / 0.75);
      zoom *= 1 + (m.zoomFactor - 1) * bump;
      continue;
    }
    zoom *= Math.pow(m.zoomFactor, e);
    x += m.dx * e;
    y += m.dy * e;
    rotation += m.drot * e;
  }

  if (cam.drift > 0) {
    const d = cam.drift;
    x += noise1D(`${cam.seed}dx`, t * 0.22) * 0.0035 * d / zoom;
    y += noise1D(`${cam.seed}dy`, t * 0.19) * 0.0025 * d / zoom;
    rotation += noise1D(`${cam.seed}dr`, t * 0.15) * 0.18 * d;
    zoom *= 1 + (noise1D(`${cam.seed}dz`, t * 0.12) * 0.5 + 0.5) * 0.006 * d;
  }

  let shakeX = 0;
  let shakeY = 0;
  for (const s of cam.shakes) {
    const local = t - s.start;
    if (local < 0 || local > s.duration) continue;
    const decay = 1 - local / s.duration;
    const amp = s.intensity * decay * decay;
    shakeX += noise1D(`${cam.seed}sx${s.start}`, local * s.frequency) * amp;
    shakeY += noise1D(`${cam.seed}sy${s.start}`, local * s.frequency) * amp * 0.7;
  }

  return { zoom, x, y, rotation, shakeX, shakeY };
};

/**
 * Depth-scaled camera for one layer. depth 0 (far) moves less than depth 1
 * (near), producing parallax from the same camera path.
 */
export const layerCamera = (cam: CameraFrame, depth: number, parallax: number): CameraFrame => {
  const f = 1 + parallax * (depth - 0.5) * 2;
  return {
    zoom: Math.pow(cam.zoom, f),
    x: 0.5 + (cam.x - 0.5) * f,
    y: 0.5 + (cam.y - 0.5) * f,
    rotation: cam.rotation,
    shakeX: cam.shakeX * f,
    shakeY: cam.shakeY * f,
  };
};

/** CSS transform for a full-frame plane viewed through the camera. */
export const planeTransform = (c: CameraFrame, W: number, H: number): string =>
  `translate(${(W / 2 + c.shakeX).toFixed(2)}px, ${(H / 2 + c.shakeY).toFixed(2)}px) ` +
  `scale(${c.zoom.toFixed(5)}) rotate(${c.rotation.toFixed(3)}deg) ` +
  `translate(${(-c.x * W).toFixed(2)}px, ${(-c.y * H).toFixed(2)}px)`;

/**
 * Minimum scale (about frame centre) a full-frame background needs so the
 * camera never reveals its edges.
 */
export const coverScale = (c: CameraFrame, W: number, H: number, overscan: number): number => {
  const rot = (Math.abs(c.rotation) * Math.PI) / 180;
  const margin = 1 + Math.sin(rot) * (W / H); // rotated frame corners
  const shake = (Math.abs(c.shakeX) / W + Math.abs(c.shakeY) / H) / c.zoom;
  const needX = 2 * (Math.abs(c.x - 0.5) + (0.5 * margin) / c.zoom + shake);
  const needY = 2 * (Math.abs(c.y - 0.5) + (0.5 * margin) / c.zoom + shake);
  return Math.max(overscan, needX, needY);
};
