import { cameraStateAt, resolveCamera } from '../animations/camera';
import type { CameraState, Scene, TimeExpr } from '../schema/types';

/**
 * Camera continuity on reused background plates (Producer rule, 2026-10-03).
 *
 * When two consecutive scenes use the same plate, the camera must never snap
 * back to a framing the viewer just saw and start again: that reads as a
 * cropped restart. The second scene either continues the camera (starts where
 * the previous one ended) or cuts to a clearly different shot (zoom ratio
 * >= 1.25 or focus moved >= 0.15 of the frame).
 *
 * Only back-to-back reuse is checked. A plate that returns later in the video
 * is free, and scenes do not need to move: camera moves are chosen per script.
 */

export interface PlateShot {
  sceneId: string;
  /** Background asset id of the scene (undefined = no plate). */
  plate?: string;
  /** Camera state at the first and last frame, without handheld drift. */
  start: CameraState;
  end: CameraState;
}

export interface ContinuityIssue {
  sceneId: string;
  code: 'CAMERA_JUMP';
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
    }
  });
  return issues;
};

/**
 * Replace every `camera.start: "continue"` with the previous scene's final camera state.
 * `window(i)` gives scene i's time converter (scene-relative seconds) and duration.
 * Scenes are processed in order, so chains of "continue" scenes resolve correctly.
 */
export const resolveContinueStarts = (
  scenes: Scene[],
  window: (i: number) => { toSec: (e: TimeExpr) => number; dur: number },
): Scene[] => {
  const out: Scene[] = [];
  scenes.forEach((scene, i) => {
    if (scene.camera?.start !== 'continue') return out.push(scene);
    if (i === 0) return out.push({ ...scene, camera: { ...scene.camera, start: undefined } });
    const prev = out[i - 1];
    const w = window(i - 1);
    const end = cameraStateAt(resolveCamera(prev.camera, w.toSec, w.dur, prev.id), w.dur);
    out.push({ ...scene, camera: { ...scene.camera, start: end } });
  });
  return out;
};
