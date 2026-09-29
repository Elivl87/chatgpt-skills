import { DEFAULT_TRANSITION_DURATION } from '../animations/transitions';
import type {
  Cue,
  DuckConfig,
  EpisodeConfig,
  MusicAutomationCue,
  MusicTrackCue,
  Scene,
  ScenesFile,
  SfxCatalog,
  TimingsFile,
  TransitionSpec,
} from '../schema/types';
import { resolveTime, type TimeContext } from '../utils/time';

/**
 * Resolves an episode cut (a scene range) into absolute frames: scene windows,
 * transition overlaps and every audio event. Pure — used by the Remotion
 * composition and by the CLI validator alike.
 */

export interface ResolvedScene {
  scene: Scene;
  index: number;
  /** Absolute seconds in the episode timeline. */
  startSec: number;
  endSec: number;
  /** Frames in the CUT timeline. */
  from: number;
  duration: number;
  /** Extra frames kept alive under the next scene's transition. */
  tail: number;
  enter?: Required<Pick<TransitionSpec, 'type' | 'duration'>> & TransitionSpec;
  exit?: Required<Pick<TransitionSpec, 'type' | 'duration'>> & TransitionSpec;
}

export interface ResolvedMusicTrack {
  id: string;
  src: string;
  /** Cut-timeline frames. */
  from: number;
  duration: number;
  /** Seconds (cut timeline) for gain maths. */
  startSec: number;
  endSec: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  loop: boolean;
  offset: number;
  duck: boolean;
  automation: Array<{ t: number; gain: number }>;
}

export interface ResolvedSfx {
  id: string;
  src: string;
  from: number;
  duration: number;
  volume: number;
  fadeOut: number;
  rate: number;
  atSec: number;
}

export interface ResolvedCut {
  episodeId: string;
  cutId: string;
  fps: number;
  width: number;
  height: number;
  /** Absolute episode second at which the cut starts. */
  offsetSec: number;
  durationSec: number;
  durationInFrames: number;
  scenes: ResolvedScene[];
  cues: Record<string, Cue>;
  audio: {
    narration: { src: string; volume: number; trimBefore: number };
    speech: Array<{ start: number; end: number }>;
    duck: DuckConfig;
    music: ResolvedMusicTrack[];
    sfx: ResolvedSfx[];
  };
}

export interface EpisodeData {
  episode: EpisodeConfig;
  timings: TimingsFile;
  scenes: ScenesFile;
}

export const DEFAULT_DUCK: DuckConfig = { to: 0.35, attack: 0.15, release: 0.5, lookahead: 0.1, sfxTo: 0.8 };

const withDuration = (t: TransitionSpec | undefined) =>
  t && t.type !== 'cut' ? { ...t, duration: t.duration ?? DEFAULT_TRANSITION_DURATION[t.type] } : undefined;

export const sceneRange = (data: EpisodeData, cutId: string): Scene[] => {
  const cut = data.episode.cuts[cutId];
  if (!cut) throw new Error(`Unknown cut "${cutId}" in ${data.episode.id}`);
  const all = data.scenes.scenes;
  const a = all.findIndex((s) => s.id === cut.fromScene);
  const b = all.findIndex((s) => s.id === cut.toScene);
  if (a < 0) throw new Error(`Cut ${cutId}: unknown fromScene "${cut.fromScene}"`);
  if (b < a) throw new Error(`Cut ${cutId}: unknown or out-of-order toScene "${cut.toScene}"`);
  return all.slice(a, b + 1);
};

export const resolveCut = (
  data: EpisodeData,
  cutId: string,
  sfxCatalog: SfxCatalog,
  hasFile: (publicPath: string) => boolean,
): ResolvedCut => {
  const { episode, timings } = data;
  const fps = episode.fps;
  const cues = timings.cues;
  const all = data.scenes.scenes;
  const scenes = sceneRange(data, cutId);
  const abs: TimeContext = { cues };

  // --- scene windows (absolute seconds)
  const starts = scenes.map((s) => resolveTime(s.start, abs));
  const lastScene = scenes[scenes.length - 1];
  const nextAfter = all[all.indexOf(lastScene) + 1];
  const endSec =
    lastScene.end !== undefined
      ? resolveTime(lastScene.end, abs)
      : nextAfter
        ? resolveTime(nextAfter.start, abs)
        : timings.duration;
  const offsetSec = starts[0];
  const toFrame = (absSec: number) => Math.round((absSec - offsetSec) * fps);
  const durationInFrames = toFrame(endSec);

  const resolved: ResolvedScene[] = scenes.map((scene, i) => {
    const startSec = starts[i];
    const sEnd = i + 1 < scenes.length ? starts[i + 1] : endSec;
    const from = toFrame(startSec);
    const duration = Math.max(1, toFrame(sEnd) - from);
    const enter = i === 0 ? undefined : withDuration(scene.transition);
    const exit = i + 1 < scenes.length ? withDuration(scenes[i + 1].transition) : undefined;
    return { scene, index: i, startSec, endSec: sEnd, from, duration, tail: exit ? Math.round(exit.duration * fps) : 0, enter, exit };
  });

  // --- narration
  const assetRoot = episode.assetRoot.replace(/\/$/, '');
  const narration = {
    src: `${assetRoot}/${episode.narration.audio}`,
    volume: episode.narration.volume ?? 1,
    trimBefore: Math.round(offsetSec * fps),
  };
  const speech = Object.values(cues)
    .map((c) => ({ start: c.start - offsetSec, end: c.end - offsetSec }))
    .filter((c) => c.end > 0 && c.start < endSec - offsetSec)
    .sort((a, b) => a.start - b.start);

  // --- music
  const cutCtx: TimeContext = { cues, end: endSec };
  const musicCfg = episode.music;
  const trackCues = (musicCfg?.cues ?? []).filter((c): c is MusicTrackCue => c.type !== 'automation');
  const autoCues = (musicCfg?.cues ?? []).filter((c): c is MusicAutomationCue => c.type === 'automation');
  const music: ResolvedMusicTrack[] = trackCues
    .map((c) => {
      const s = Math.max(offsetSec, resolveTime(c.start, cutCtx));
      const e = Math.min(endSec, resolveTime(c.end, cutCtx));
      const src = `${assetRoot}/${c.src.replace(/^\//, '')}`;
      const path = c.src.startsWith('/') ? c.src.slice(1) : src;
      const automation = autoCues
        .filter((a) => a.target === c.id)
        .flatMap((a) => a.points.map((pt) => ({ t: resolveTime(pt.at, cutCtx) - offsetSec, gain: pt.gain })))
        .sort((a, b) => a.t - b.t);
      return {
        id: c.id,
        src: path,
        from: toFrame(s),
        duration: toFrame(e) - toFrame(s),
        startSec: s - offsetSec,
        endSec: e - offsetSec,
        volume: c.volume ?? 0.5,
        fadeIn: c.fadeIn ?? 0.5,
        fadeOut: c.fadeOut ?? 1,
        loop: c.loop ?? false,
        offset: c.offset ?? 0,
        duck: c.duck ?? true,
        automation,
      };
    })
    .filter((m) => m.duration > 0 && hasFile(m.src));

  // --- sfx
  const sfx: ResolvedSfx[] = [];
  for (const r of resolved) {
    const ctx: TimeContext = { cues, sceneStart: r.startSec, sceneEnd: r.endSec, relative: true, end: endSec };
    for (const ev of r.scene.sfx ?? []) {
      const entry = sfxCatalog.sfx[ev.id];
      if (!entry) continue; // reported by the validator
      const src = entry.src.replace(/^\//, '');
      if (!hasFile(src)) continue; // missing sounds are skipped, never fatal
      const at = resolveTime(ev.at, ctx);
      const endAt = ev.end !== undefined ? resolveTime(ev.end, ctx) : ev.duration !== undefined ? at + ev.duration : at + 6;
      const from = toFrame(at);
      if (from >= durationInFrames) continue;
      sfx.push({
        id: ev.id,
        src,
        from: Math.max(0, from),
        duration: Math.max(1, Math.min(toFrame(endAt), durationInFrames) - Math.max(0, from)),
        volume: (ev.volume ?? 1) * (entry.volume ?? 1),
        fadeOut: ev.fadeOut ?? (ev.duration !== undefined || ev.end !== undefined ? 0.08 : 0),
        rate: ev.rate ?? 1,
        atSec: at - offsetSec,
      });
    }
  }

  return {
    episodeId: episode.id,
    cutId,
    fps,
    width: episode.width,
    height: episode.height,
    offsetSec,
    durationSec: endSec - offsetSec,
    durationInFrames,
    scenes: resolved,
    cues,
    audio: {
      narration,
      speech,
      duck: { ...DEFAULT_DUCK, ...(musicCfg?.duck ?? {}) },
      music,
      sfx,
    },
  };
};
