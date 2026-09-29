import { ANIMATION_TYPES } from '../animations/presets';
import { DEFAULT_TRANSITION_DURATION } from '../animations/transitions';
import type { EpisodeBundle } from '../episodes';
import type { AssetCatalog, Layer, Scene, SfxCatalog, TimeExpr } from '../schema/types';
import { EASINGS } from '../utils/easing';
import { resolveTime, type TimeContext } from '../utils/time';
import { listAssetIds, toPublicPath } from './assets';
import { resolveCut } from './timeline';

export interface Issue {
  level: 'error' | 'warn';
  where: string;
  message: string;
}

const LAYER_TYPES = new Set(['image', 'text', 'counter', 'progress', 'particles', 'swarm', 'stamp', 'light', 'rect', 'flash', 'wordmark', 'group']);
const TIME_KEYS = new Set(['at', 'end', 'show', 'hide']);
const CAMERA_MOVES = new Set(['push_in', 'pull_out', 'pan_left', 'pan_right', 'pan_up', 'pan_down', 'move_to', 'punch']);

/**
 * Validates an episode bundle. Pure (no fs): the caller supplies hasFile().
 * Errors block rendering; warnings (missing art/sfx) never do — placeholders
 * and silence are used instead.
 */
export const validateEpisode = (b: EpisodeBundle, shared: AssetCatalog, sfx: SfxCatalog, hasFile: (p: string) => boolean): Issue[] => {
  const issues: Issue[] = [];
  const err = (where: string, message: string) => issues.push({ level: 'error', where, message });
  const warn = (where: string, message: string) => issues.push({ level: 'warn', where, message });
  const { episode, script, timings, scenes } = b;
  const cues = timings.cues;

  // --- narration / timings vs script
  const lineIds = script.lines.map((l) => l.id);
  for (const id of lineIds) if (!cues[id]) err('timings.json', `script line "${id}" has no cue — re-run narration alignment`);
  for (const id of Object.keys(cues)) if (!lineIds.includes(id)) warn('timings.json', `cue "${id}" is not in script.json`);
  let prevEnd = -Infinity;
  for (const id of lineIds) {
    const c = cues[id];
    if (!c) continue;
    if (!(c.end > c.start)) err(`timings.${id}`, `end (${c.end}) must be after start (${c.start})`);
    if (c.start < prevEnd - 0.01) warn(`timings.${id}`, `overlaps previous cue`);
    prevEnd = c.end;
  }
  const narrationPath = `${episode.assetRoot}/${episode.narration.audio}`;
  if (!hasFile(narrationPath)) warn('narration', `public/${narrationPath} missing — the cut will render silent`);
  if (timings.source && timings.source !== episode.narration.audio) warn('timings.json', `timings were generated from "${timings.source}" but episode narration is "${episode.narration.audio}"`);

  // --- asset + sfx references
  const assetIds = listAssetIds([shared, b.assets]);
  for (const [id, entry] of Object.entries(b.assets.assets)) {
    if (!(entry.aspect > 0)) err(`assets.${id}`, 'aspect must be > 0');
    void toPublicPath(entry.path, episode.assetRoot);
  }

  const checkTime = (expr: TimeExpr, where: string, ctx: TimeContext) => {
    try {
      resolveTime(expr, ctx);
    } catch (e) {
      err(where, (e as Error).message);
    }
  };

  const walkLayers = (layers: Layer[], where: string, ctx: TimeContext) => {
    layers.forEach((layer, i) => {
      const w = `${where}.layers[${layer.id ?? i}]`;
      const type = layer.type ?? 'image';
      if (!LAYER_TYPES.has(type)) err(w, `unknown layer type "${type}"`);
      const ref = (layer as { asset?: string }).asset;
      if (ref !== undefined && !assetIds.has(ref)) err(w, `unknown asset id "${ref}"`);
      for (const s of (layer as { swaps?: Array<{ asset: string }> }).swaps ?? []) if (!assetIds.has(s.asset)) err(w, `unknown swap asset "${s.asset}"`);
      for (const a of layer.animations ?? []) {
        if (!ANIMATION_TYPES.includes(a.type)) err(w, `unknown animation "${a.type}"`);
        if (a.easing && !(a.easing in EASINGS)) err(w, `unknown easing "${a.easing}"`);
      }
      if (type === 'group') walkLayers((layer as { layers: Layer[] }).layers, w, ctx);
    });
  };

  /** Deep-walk any object and check every time-valued key resolves. */
  const walkTimes = (node: unknown, where: string, ctx: TimeContext) => {
    if (Array.isArray(node)) return node.forEach((n, i) => walkTimes(n, `${where}[${i}]`, ctx));
    if (!node || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      if (TIME_KEYS.has(k) && (typeof v === 'string' || typeof v === 'number')) checkTime(v, `${where}.${k}`, ctx);
      else if (typeof v === 'object') walkTimes(v, `${where}.${k}`, ctx);
    }
  };

  const ids = new Set<string>();
  let prevStart = -Infinity;
  scenes.scenes.forEach((scene: Scene, i) => {
    const w = `scenes.${scene.id}`;
    if (ids.has(scene.id)) err(w, 'duplicate scene id');
    ids.add(scene.id);
    let start = NaN;
    try {
      start = resolveTime(scene.start, { cues });
    } catch (e) {
      err(`${w}.start`, (e as Error).message);
    }
    if (start < prevStart) err(`${w}.start`, `starts before the previous scene (${start.toFixed(2)}s < ${prevStart.toFixed(2)}s)`);
    const next = scenes.scenes[i + 1];
    let end = NaN;
    try {
      end = scene.end !== undefined ? resolveTime(scene.end, { cues }) : next ? resolveTime(next.start, { cues }) : timings.duration;
    } catch {
      /* reported on the next scene */
    }
    if (end - start < 0.4) warn(w, `very short scene (${(end - start).toFixed(2)}s)`);
    if (scene.transition) {
      const tt = scene.transition.type;
      if (!(tt in DEFAULT_TRANSITION_DURATION)) err(`${w}.transition`, `unknown transition "${tt}"`);
    }
    for (const m of scene.camera?.moves ?? []) if (!CAMERA_MOVES.has(m.type)) err(`${w}.camera`, `unknown camera move "${m.type}"`);
    for (const ev of scene.sfx ?? []) {
      const entry = sfx.sfx[ev.id];
      if (!entry) err(`${w}.sfx`, `unknown sound "${ev.id}"`);
      else if (!hasFile(entry.src.replace(/^\//, ''))) warn(`${w}.sfx`, `sound file ${entry.src} missing — event skipped`);
    }
    if (scene.component) warn(w, `uses custom component "${scene.component}"`);
    const ctx: TimeContext = { cues, sceneStart: start || 0, sceneEnd: end || 0, relative: true, end: end || 0 };
    walkLayers(scene.layers, w, ctx);
    walkTimes({ layers: scene.layers, camera: scene.camera, sfx: scene.sfx }, w, ctx);
    prevStart = start;
  });

  // --- cuts
  for (const cutId of Object.keys(episode.cuts)) {
    try {
      const cut = resolveCut(b, cutId, sfx, hasFile);
      cut.scenes.forEach((rs) => {
        if (rs.enter && rs.enter.duration * cut.fps > rs.duration) warn(`cuts.${cutId}.${rs.scene.id}`, 'transition is longer than the scene');
      });
      for (const m of episode.music?.cues ?? [])
        if (m.type !== 'automation' && !hasFile(`${episode.assetRoot}/${m.src.replace(/^\//, '')}`) && !hasFile(m.src.replace(/^\//, '')))
          warn(`music.${m.id}`, `file ${m.src} missing — cue skipped`);
    } catch (e) {
      err(`cuts.${cutId}`, (e as Error).message);
    }
  }

  // --- art status (warnings only)
  const used = new Set<string>();
  const collect = (layers: Layer[]) =>
    layers.forEach((l) => {
      const a = (l as { asset?: string }).asset;
      if (a) used.add(a);
      for (const s of (l as { swaps?: Array<{ asset: string }> }).swaps ?? []) used.add(s.asset);
      if (l.type === 'group') collect(l.layers);
    });
  scenes.scenes.forEach((s) => collect(s.layers));
  const missing = [...used].filter((id) => {
    const e = b.assets.assets[id] ?? shared.assets[id];
    return e && !hasFile(toPublicPath(e.path, e.path.startsWith('/') ? '' : episode.assetRoot));
  });
  if (missing.length) warn('art', `${missing.length}/${used.size} referenced assets are placeholders (run "npm run assets" for the list)`);

  return issues;
};
