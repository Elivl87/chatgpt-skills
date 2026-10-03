import type { Layer, ScenesFile, ScriptFile, TimingsFile } from '../schema/types';
import { resolveTime } from '../utils/time';

/**
 * Originality / monetization-safety checks M1–M9 (docs/MONETIZATION_SAFETY_STANDARD.md §5,
 * approved by the Producer 2026-10-03).
 *
 * YouTube's YPP policy does not penalise AI; it penalises channels whose videos feel
 * interchangeable ("made with a template", "image slideshows… with minimal narrative",
 * "characters put in the same situation over and over"). These checks compare each episode
 * with the channel's earlier episodes and with itself.
 *
 * Scripts are never edited by Claude: script checks (M6) only report to the Producer.
 */

export type Level = 'error' | 'warn' | 'info';
export interface OriginalityIssue {
  check: 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9';
  level: Level;
  group: string;
  message: string;
}

export interface OriginalityConfig {
  /** Asset ids or prefixes that are brand identity (allowed to repeat), e.g. "brand.". */
  brandAssets: string[];
  m1ReusedArtWarn: number;
  m2RecipeWarn: number;
  m2RecipeError: number;
  m3CameraMoveShareWarn: number;
  m3StaticSecondsWarn: number;
  m4SlideshowShareWarn: number;
  m7TitleFormulaSimilarity: number;
  m7TitleFormulaMaxInARow: number;
  m7DescriptionWarn: number;
}

// ---------------------------------------------------------------------------
// Fingerprints
// ---------------------------------------------------------------------------

export interface SceneFingerprint {
  id: string;
  seconds: number;
  /** Background + character asset ids on screen (brand excluded later). */
  art: string[];
  /** transition | first camera move | sorted layer types — the scene's "recipe". */
  recipe: string;
  cameraMove: string;
  /** Long scene with no camera move and no animated/explanatory layer. */
  isStatic: boolean;
  /** Only still images (+ light/rect) moved by the camera: no text, data, FX or diagrams. */
  isSlideshow: boolean;
}

export interface EpisodeFingerprint {
  id: string;
  seconds: number;
  scenes: SceneFingerprint[];
}

const DYNAMIC_TYPES = new Set(['text', 'counter', 'progress', 'particles', 'swarm', 'stamp', 'flash', 'wordmark']);
const LOOP_ANIMS = new Set(['float', 'bounce', 'shake', 'breathe', 'wobble', 'pulse', 'spin', 'drift', 'flicker']);

const flatten = (layers: Layer[]): Layer[] => layers.flatMap((l) => (l.type === 'group' ? [l, ...flatten(l.layers)] : [l]));

export const fingerprintEpisode = (
  id: string,
  scenes: ScenesFile,
  timings: TimingsFile,
  kindOf: (asset: string) => string | undefined,
): EpisodeFingerprint => {
  const cues = timings.cues;
  const starts = scenes.scenes.map((s) => resolveTime(s.start, { cues }));
  const fps: SceneFingerprint[] = scenes.scenes.map((s, i) => {
    const end = s.end !== undefined ? resolveTime(s.end, { cues }) : (starts[i + 1] ?? timings.duration);
    const seconds = Math.max(0, end - starts[i]);
    const layers = flatten(s.layers);
    const types = [...new Set(layers.map((l) => l.type ?? 'image'))].sort();
    const art = [
      ...new Set(
        layers
          .flatMap((l) => {
            const a = (l as { asset?: string }).asset;
            const swaps = ((l as { swaps?: Array<{ asset: string }> }).swaps ?? []).map((x) => x.asset);
            return a ? [a, ...swaps] : swaps;
          })
          .filter((a) => ['background', 'character'].includes(kindOf(a) ?? '')),
      ),
    ];
    const cameraMove = s.camera?.moves?.find((m) => m.type !== 'punch')?.type ?? 'static';
    const animated = layers.some((l) => (l.animations ?? []).some((a) => LOOP_ANIMS.has(a.type)));
    const dynamic = layers.some((l) => DYNAMIC_TYPES.has(l.type ?? 'image'));
    return {
      id: s.id,
      seconds,
      art,
      recipe: `${s.transition?.type ?? 'cut'}|${cameraMove}|${types.join(',')}`,
      cameraMove,
      isStatic: cameraMove === 'static' && !animated && !dynamic,
      isSlideshow: !dynamic && layers.every((l) => ['image', 'light', 'rect', 'group'].includes(l.type ?? 'image')),
    };
  });
  return { id, seconds: timings.duration, scenes: fps };
};

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

const words = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
const ngrams = <T>(xs: T[], n: number) => {
  const out = new Set<string>();
  for (let i = 0; i + n <= xs.length; i++) out.add(xs.slice(i, i + n).join('\u0001'));
  return out;
};
export const jaccard = (a: Set<string>, b: Set<string>) => {
  if (!a.size && !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
};

/** Title "formula": the title with the game's name replaced by GAME. */
export const titleFormula = (title: string, game: string) => {
  const g = words(game).join(' ');
  return words(title).join(' ').replace(g, 'GAME').split(' ');
};

/** Dice similarity of two token sequences (order-insensitive bigrams + unigrams). */
const tokenSimilarity = (a: string[], b: string[]) => {
  const A = new Set([...a, ...ngrams(a, 2)]);
  const B = new Set([...b, ...ngrams(b, 2)]);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return (2 * inter) / (A.size + B.size || 1);
};

// ---------------------------------------------------------------------------
// Per-group input
// ---------------------------------------------------------------------------

export interface QuestSituation {
  situation: string;
  location?: string;
  outcome: string;
}

export interface Thumbnail {
  file: string;
  /** "none" = no third-party character; "evokes" = inspired design; "replica" = copy of a third-party character. */
  thirdParty: 'none' | 'evokes' | 'replica';
  logos: boolean;
  officialArt: boolean;
}

export interface PublishMetadata {
  game: string;
  title: string;
  description: string;
  madeForKids: boolean;
  thumbnails: Thumbnail[];
}

export interface GroupInput {
  /** Episode group, e.g. "EP001" (a full episode and its Shorts are one group). */
  group: string;
  /** Visual fingerprints of the group's cuts (empty while scenes are not built yet). */
  episodes: EpisodeFingerprint[];
  script?: ScriptFile;
  questSituations?: QuestSituation[];
  metadata?: PublishMetadata;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

export const checkOriginality = (target: GroupInput, earlier: GroupInput[], cfg: OriginalityConfig): OriginalityIssue[] => {
  const out: OriginalityIssue[] = [];
  const add = (check: OriginalityIssue['check'], level: Level, message: string) => out.push({ check, level, group: target.group, message });
  const isBrand = (a: string) => cfg.brandAssets.some((p) => a === p || (p.endsWith('.') && a.startsWith(p)));
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const main = target.episodes[0];

  if (main) {
    // M1 — art reused from earlier episodes (share of on-screen time)
    const seen = new Set(earlier.flatMap((g) => g.episodes.flatMap((e) => e.scenes.flatMap((s) => s.art))));
    const total = main.scenes.reduce((s, x) => s + x.seconds, 0) || 1;
    const reusedSec = main.scenes.filter((s) => s.art.some((a) => !isBrand(a) && seen.has(a))).reduce((s, x) => s + x.seconds, 0);
    const reused = reusedSec / total;
    add('M1', reused > cfg.m1ReusedArtWarn ? 'warn' : 'info', `${pct(reused)} of on-screen time shows background/character art already used in earlier episodes (limit ${pct(cfg.m1ReusedArtWarn)}, brand excluded)`);

    // M2 — same sequence of visual recipes as an earlier episode
    const grams = (e: EpisodeFingerprint) => ngrams(e.scenes.map((s) => s.recipe), 3);
    for (const g of earlier)
      for (const e of g.episodes) {
        const sim = jaccard(grams(main), grams(e));
        const level: Level = sim >= cfg.m2RecipeError ? 'error' : sim >= cfg.m2RecipeWarn ? 'warn' : 'info';
        add('M2', level, `recipe-sequence similarity with ${g.group} (${e.id}): ${pct(sim)} (warn ${pct(cfg.m2RecipeWarn)}, block ${pct(cfg.m2RecipeError)})`);
      }

    // M3 — variety inside the episode
    const moving = main.scenes.filter((s) => s.cameraMove !== 'static');
    const counts = new Map<string, number>();
    for (const s of moving) counts.set(s.cameraMove, (counts.get(s.cameraMove) ?? 0) + 1);
    for (const [move, n] of counts) {
      const share = n / main.scenes.length;
      if (share > cfg.m3CameraMoveShareWarn) add('M3', 'warn', `camera move "${move}" in ${pct(share)} of scenes (limit ${pct(cfg.m3CameraMoveShareWarn)})`);
    }
    const stills = main.scenes.filter((s) => s.isStatic && s.seconds > cfg.m3StaticSecondsWarn);
    if (stills.length) add('M3', 'warn', `${stills.length} scene(s) over ${cfg.m3StaticSecondsWarn}s with no visual change: ${stills.slice(0, 8).map((s) => `${s.id} (${s.seconds.toFixed(1)}s)`).join(', ')}${stills.length > 8 ? ', …' : ''}`);

    // M4 — "slideshow" share
    const slide = main.scenes.filter((s) => s.isSlideshow).reduce((s, x) => s + x.seconds, 0) / total;
    add('M4', slide > cfg.m4SlideshowShareWarn ? 'warn' : 'info', `${pct(slide)} of the episode is still images moved only by the camera (limit ${pct(cfg.m4SlideshowShareWarn)})`);
  } else {
    add('M1', 'info', 'no scenes built yet — visual checks M1–M4 run once scenes.json exists');
  }

  // M5 — Quest put in the same situation with the same outcome
  const norm = (s: string) => words(s).join(' ');
  for (const q of target.questSituations ?? [])
    for (const g of earlier)
      for (const p of g.questSituations ?? [])
        if (norm(q.situation) === norm(p.situation) && norm(q.outcome) === norm(p.outcome))
          add('M5', 'warn', `Quest repeats situation "${q.situation}" with outcome "${q.outcome}" from ${g.group}`);
  if (!target.questSituations?.length) add('M5', 'warn', 'no Quest situations logged for this episode (docs/originality/quest_log.json)');

  // M6 — script structure: report only, never rewrite
  if (target.script) {
    const lines = target.script.lines.map((l) => l.text);
    const mine = ngrams(words(lines.join(' ')), 4);
    for (const g of earlier) {
      if (!g.script) continue;
      const theirs = ngrams(words(g.script.lines.map((l) => l.text).join(' ')), 4);
      let shared = 0;
      for (const x of mine) if (theirs.has(x)) shared++;
      add('M6', 'info', `script shares ${shared} of ${mine.size} four-word phrases with ${g.group} (${pct(shared / (mine.size || 1))}); report for the Producer only`);
    }
  }

  // M7 — metadata formulas
  const md = target.metadata;
  if (md) {
    const history = [...earlier.map((g) => g.metadata).filter((m): m is PublishMetadata => !!m), md];
    let run = 1;
    for (let i = history.length - 1; i > 0; i--) {
      const sim = tokenSimilarity(titleFormula(history[i].title, history[i].game), titleFormula(history[i - 1].title, history[i - 1].game));
      if (sim >= cfg.m7TitleFormulaSimilarity) run++;
      else break;
    }
    if (run > cfg.m7TitleFormulaMaxInARow) add('M7', 'warn', `the title uses the same formula ${run} episodes in a row (limit ${cfg.m7TitleFormulaMaxInARow})`);
    for (const g of earlier) {
      if (!g.metadata) continue;
      const sim = jaccard(ngrams(words(md.description), 4), ngrams(words(g.metadata.description), 4));
      if (sim > cfg.m7DescriptionWarn) add('M7', 'warn', `description is ${pct(sim)} similar to ${g.group} (limit ${pct(cfg.m7DescriptionWarn)})`);
    }

    // M8 — third-party IP in thumbnails
    for (const t of md.thumbnails) {
      if (t.logos) add('M8', 'error', `thumbnail ${t.file} contains a third-party logo`);
      if (t.officialArt) add('M8', 'error', `thumbnail ${t.file} contains official third-party art`);
      if (t.thirdParty === 'replica') add('M8', 'error', `thumbnail ${t.file} shows a replica of a third-party character (option C: evoke, never replicate)`);
    }

    // M9 — never "made for kids"
    if (md.madeForKids !== false) add('M9', 'error', 'publish metadata must set madeForKids: false (SecondQuest is not made for kids)');
  } else {
    add('M7', 'info', 'no publish metadata yet — M7–M9 run once docs/publish/<group>/metadata.json exists');
  }
  return out;
};
