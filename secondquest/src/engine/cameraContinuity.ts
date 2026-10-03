import type { CameraState } from '../schema/types';

/**
 * Camera continuity on reused background plates (Producer rule, 2026-10-03).
 *
 * When a plate repeats, the camera must never snap back to a framing the viewer
 * just saw and start the same move again: that reads as a cropped restart.
 *
 * - Consecutive scenes on the same plate either continue the camera (the next
 *   scene starts where the previous one ended) or cut to a clearly different
 *   shot (zoom ratio >= 1.25 or focus moved >= 0.15 of the frame).
 * - A plate that returns later must not reuse an earlier scene's opening
 *   framing with the same first move.
 */

export interface PlateShot {
  sceneId: string;
  /** Background asset id of the scene (undefined = no plate). */
  plate?: string;
  /** Camera state at the first and last frame, without handheld drift. */
  start: CameraState;
  end: CameraState;
  /** Type of the first camera move, if any. */
  firstMove?: string;
}

export interface ContinuityIssue {
  sceneId: string;
  code: 'CAMERA_JUMP' | 'CAMERA_REPEAT';
  message: string;
}

export const CONTINUOUS = { zoom: 0.01, focus: 0.01 };
export const NEW_SHOT = { zoomRatio: 1.25, focus: 0.15 };

const zoomRatio = (a: CameraState, b: CameraState) => Math.max(a.zoom, b.zoom) / Math.min(a.zoom, b.zoom);
const focusShift = (a: CameraState, b: CameraState) => Math.hypot(a.x - b.x, a.y - b.y);

export const isContinuous = (a: CameraState, b: CameraState) =>
  zoomRatio(a, b) - 1 <= CONTINUOUS.zoom && focusShift(a, b) <= CONTINUOUS.focus;

export const isNewShot = (a: CameraState, b: CameraState) =>
  zoomRatio(a, b) >= NEW_SHOT.zoomRatio || focusShift(a, b) >= NEW_SHOT.focus;

export const checkCameraContinuity = (shots: PlateShot[]): ContinuityIssue[] => {
  const issues: ContinuityIssue[] = [];
  const fmt = (s: CameraState) => `zoom ${s.zoom.toFixed(2)} @ (${s.x.toFixed(2)}, ${s.y.toFixed(2)})`;
  shots.forEach((shot, i) => {
    if (!shot.plate) return;
    const prev = shots[i - 1];
    if (prev && prev.plate === shot.plate) {
      if (!isContinuous(prev.end, shot.start) && !isNewShot(prev.end, shot.start))
        issues.push({
          sceneId: shot.sceneId,
          code: 'CAMERA_JUMP',
          message: `same plate as "${prev.sceneId}" but the camera snaps from ${fmt(prev.end)} to ${fmt(shot.start)}: continue the camera or cut to a clearly different shot`,
        });
      return;
    }
    for (const earlier of shots.slice(0, Math.max(0, i - 1))) {
      if (earlier.plate !== shot.plate) continue;
      if (!isNewShot(earlier.start, shot.start) && earlier.firstMove === shot.firstMove) {
        issues.push({
          sceneId: shot.sceneId,
          code: 'CAMERA_REPEAT',
          message: `returns to plate "${shot.plate}" with the same opening framing and move as "${earlier.sceneId}" (${fmt(shot.start)}, ${shot.firstMove ?? 'static'}): change the framing or the move`,
        });
        break;
      }
    }
  });
  return issues;
};
