/**
 * SecondQuest scene schema.
 *
 * Everything an episode needs is data: episode.json, script.json, timings.json,
 * assets.json and scenes.json. React code interprets this data; it should not
 * need to change per scene.
 *
 * TIME EXPRESSIONS (TimeExpr)
 *   number            seconds. Inside a scene: relative to scene start.
 *                     At episode level (scene.start, music cues): absolute.
 *   "l03"             start of narration cue l03 (see timings.json)
 *   "l03.end"         end of cue l03
 *   "l03+0.4"         0.4 s after cue start ("l03.end-0.2" etc. also valid)
 *   "scene+1.2"       relative to current scene start (same as the number 1.2)
 *   "scene.end-0.5"   relative to current scene end
 *   "end"             end of the cut (music/audio only)
 *
 * Cue-anchored times are what make scenes follow the real narration: swap the
 * WAV, regenerate timings.json, and every scene re-times itself.
 */

export type TimeExpr = number | string;

/** Text that may be localised: plain string or { en: "...", es: "..." }. */
export type LocalText = string | Record<string, string>;

export type EasingName =
  | 'linear'
  | 'inSine' | 'outSine' | 'inOutSine'
  | 'inQuad' | 'outQuad' | 'inOutQuad'
  | 'inCubic' | 'outCubic' | 'inOutCubic'
  | 'inExpo' | 'outExpo' | 'inOutExpo'
  | 'outBack' | 'inBack' | 'outElastic';

// ---------------------------------------------------------------------------
// Episode-level files
// ---------------------------------------------------------------------------

export interface EpisodeConfig {
  id: string;
  title: string;
  /** Folder under public/ holding this episode's media. */
  assetRoot: string;
  fps: number;
  width: number;
  height: number;
  /** Master locale (the one scenes were authored against). */
  locale: string;
  /** Master narration. */
  narration: { audio: string; volume?: number };
  /**
   * Optional additional locales. Each has its own narration + script + timings;
   * scenes, assets and music are shared. Omit for single-language episodes.
   * Files default to audio/<loc>/narration.wav, script.<loc>.json, timings.<loc>.json.
   */
  locales?: Record<string, LocaleConfig>;
  music?: MusicConfig;
  cuts: Record<string, CutConfig>;
}

export interface LocaleConfig {
  /** Narration audio path (relative to assetRoot). */
  narration?: string;
  /** Narration volume override. */
  volume?: number;
  label?: string;
}

export interface CutConfig {
  label?: string;
  fromScene: string;
  toScene: string;
  /** Output file base name (renders/<output>_<version>.mp4). */
  output: string;
}

export interface ScriptLine {
  id: string;
  text: LocalText;
  pauseAfter?: number;
}

export interface ScriptFile {
  episode: string;
  locale: string;
  lines: ScriptLine[];
}

export interface CueWord {
  /** The word as written in the script (punctuation kept). */
  w: string;
  /** Absolute seconds. */
  start: number;
  end: number;
}

export interface Cue {
  start: number;
  end: number;
  text?: string;
  /** Word-level timings (script words, in order). Enables "l12.w3" time expressions. */
  words?: CueWord[];
}

export interface TimingsFile {
  source: string;
  generatedBy?: string;
  /** Written by the placeholder TTS tool: exact voice/speed/phonemizer used. */
  tts?: { voice: string; speed: number; lang?: string; overrides?: number };
  duration: number;
  cues: Record<string, Cue>;
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export type AssetKind = 'background' | 'character' | 'object' | 'overlay' | 'foreground';

export interface AssetEntry {
  /** Path under public/. Leading "/" = public root, otherwise episode assetRoot. */
  path: string;
  kind: AssetKind;
  /** width / height of the artwork. Used to size the layer box and the placeholder. */
  aspect: number;
  /** Default anchor inside the artwork, [0..1, 0..1]. Characters: bottom-centre. */
  anchor?: [number, number];
  /** Short human label (shown on the placeholder). */
  label: string;
  /** Art brief for the illustrator. */
  brief?: string;
  /** Recurring character this asset belongs to (quest, wallet, ...). */
  character?: string;
  /** Placeholder tint. Backgrounds may give [top, bottom]. */
  color?: string | [string, string];

  // --- Art contract (SecondQuest Art Manifest Schema v1). Required for every
  // image a render uses while shared/production.json art.contract = FINAL_ART_ONLY.
  /** Must be "FINAL_ART". */
  source?: string;
  /** Must be "APPROVED". */
  status?: string;
  library_tier?: 'CORE' | 'GENRE' | 'EPISODE';
  required?: boolean;
  /** Declared pixel size, "3840x2160" (× or x). */
  resolution?: string;
  transparent?: boolean;
  /** Max camera/layer zoom this art tolerates. Defaults per kind from production.json. */
  safe_zoom?: number;
  style_version?: string;
  /** Quest assets only, e.g. "Quest_v1". */
  character_version?: string;
  /** Assets that swap in place share a swap_set and must share canvas size. */
  swap_set?: string;
  used_in?: string[];
}

export interface AssetCatalog {
  characters?: Record<string, { name: string; color: string }>;
  assets: Record<string, AssetEntry>;
}

export interface SfxEntry {
  src: string;
  volume?: number;
  label?: string;
}

export interface SfxCatalog {
  sfx: Record<string, SfxEntry>;
}

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

export interface DuckConfig {
  /** Gain multiplier applied while narration is speaking (0..1). */
  to: number;
  /** Seconds to reach ducked gain. */
  attack: number;
  /** Seconds to recover after speech ends. */
  release: number;
  /** Seconds to start ducking before a line begins. */
  lookahead?: number;
  /** Gain for sound effects while narration is speaking. Default 0.62 (per-event `duckTo` overrides). */
  sfxTo?: number;
}

export interface MusicTrackCue {
  id: string;
  type?: 'track';
  src: string;
  start: TimeExpr;
  end: TimeExpr;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
  loop?: boolean;
  /** Seconds into the file to start playback. */
  offset?: number;
  duck?: boolean;
  /** Generator used by `npm run audio:placeholders` if the file is missing ("bed" | "sunset"). */
  placeholder?: string;
  note?: string;
}

export interface MusicAutomationCue {
  id: string;
  type: 'automation';
  target: string;
  points: Array<{ at: TimeExpr; gain: number }>;
  note?: string;
}

export type MusicCue = MusicTrackCue | MusicAutomationCue;

export interface MusicConfig {
  duck: DuckConfig;
  cues: MusicCue[];
  /** Music is OFF by default (production.json audio.music). Cues only pass validation when the Producer approved them. */
  producerApproved?: boolean;
}

export interface SfxEvent {
  /** Sound id from the sfx catalog. */
  id: string;
  at: TimeExpr;
  volume?: number;
  /** Cut the sound after this many seconds (with fadeOut). */
  duration?: number;
  end?: TimeExpr;
  fadeOut?: number;
  /** Playback rate (pitch) — cheap variation for repeated sounds. */
  rate?: number;
  /**
   * Gain while narration speaks, overriding music.duck.sfxTo for this event
   * (e.g. 0.9 for an intentional punchline hit, 1 = never ducked).
   */
  duckTo?: number;
}

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

export type AnimationType =
  // entrances
  | 'pop_in' | 'slide_in' | 'fade_in' | 'drop_in' | 'rise_in' | 'punch_in' | 'wipe_in'
  // exits
  | 'pop_out' | 'slide_out' | 'fade_out' | 'sink_out'
  // loops / continuous
  | 'float' | 'bounce' | 'shake' | 'breathe' | 'wobble' | 'pulse' | 'spin' | 'drift' | 'flicker'
  // one-shot accents
  | 'reaction' | 'squash' | 'hop' | 'nudge';

export type Direction = 'left' | 'right' | 'up' | 'down';

export interface AnimationSpec {
  type: AnimationType;
  /** When it starts (scene-relative). Default: 0 (scene start). */
  at?: TimeExpr;
  /** Seconds. Loops default to "until scene end". */
  duration?: number;
  /** Alternative to duration. */
  end?: TimeExpr;
  easing?: EasingName;
  /** Global strength multiplier (1 = default). */
  intensity?: number;
  /** Direction for slides / drift. */
  from?: Direction;
  to?: Direction;
  /** Distance in px (1080p reference) for slides / drift / drops. */
  distance?: number;
  /** Cycles per second for loops. */
  frequency?: number;
  /** Phase offset in seconds (desync identical loops). */
  phase?: number;
  seed?: number;
}

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------

export interface CameraState {
  zoom: number;
  /** Focus point: which frame point sits at screen centre (0..1). */
  x: number;
  y: number;
  /** Degrees. */
  rotation: number;
}

export type CameraMoveType =
  | 'push_in' | 'pull_out' | 'pan_left' | 'pan_right' | 'pan_up' | 'pan_down'
  | 'move_to' | 'punch';

export interface CameraMove {
  type: CameraMoveType;
  at?: TimeExpr;
  duration?: number;
  end?: TimeExpr;
  easing?: EasingName;
  /** push_in/pull_out: relative zoom change (0.08 = 8%). pans: fraction of frame. punch: zoom bump. */
  amount?: number;
  /** move_to target (any subset). */
  zoom?: number;
  x?: number;
  y?: number;
  rotation?: number;
}

export interface CameraShake {
  at: TimeExpr;
  duration?: number;
  /** px at 1080p. */
  intensity?: number;
  frequency?: number;
}

export interface CameraConfig {
  /**
   * Opening framing. "continue" starts exactly where the previous scene's camera ended
   * (no drift), the standard way to cut between two scenes on the same background
   * without a zoom restart (Producer rule, CAMERA_JUMP).
   */
  start?: Partial<CameraState> | 'continue';
  moves?: CameraMove[];
  shakes?: CameraShake[];
  /** Always-on handheld-style drift so no frame is ever dead still. 0 disables. Default 1. */
  drift?: number;
  /** Depth separation strength for parallax (0 = flat). Default 0.3. */
  parallax?: number;
}

// ---------------------------------------------------------------------------
// Layers
// ---------------------------------------------------------------------------

export interface LayerBase {
  id?: string;
  /**
   * 0 = far background, 1 = nearest foreground. Drives parallax. Default by kind.
   * "screen" = fixed to the screen (UI/text), unaffected by the camera.
   */
  depth?: number | 'screen';
  /** Anchor position in frame, 0..1. */
  x?: number;
  y?: number;
  rotation?: number;
  opacity?: number;
  animations?: AnimationSpec[];
  /** Layer visible from/to (scene-relative). Outside the window it is not rendered. */
  show?: TimeExpr;
  hide?: TimeExpr;
  /** CSS blend mode, e.g. "screen", "multiply". */
  blend?: string;
}

export interface AssetSwap {
  at: TimeExpr;
  asset: string;
  /** Add a small squash "pop" to sell the swap. Default true. */
  pop?: boolean;
}

export interface ImageLayer extends LayerBase {
  type?: 'image';
  asset: string;
  /** Size as fraction of frame height (or width). Backgrounds fill the frame. */
  height?: number;
  width?: number;
  anchor?: [number, number];
  flip?: boolean;
  swaps?: AssetSwap[];
  /** Soft contact shadow under characters/objects. */
  shadow?: boolean;
  /** Backgrounds only: which part of the art stays in view when the frame crops it (0..1 per axis, default centre). Used by vertical cuts. */
  focus?: [number, number];
}

export type TextStyle = 'punch' | 'price' | 'label' | 'ui' | 'marker' | 'caption' | 'subtitle';

export interface TextLayer extends LayerBase {
  type: 'text';
  text: LocalText;
  style?: TextStyle;
  size?: number;
  color?: string;
  /** Arrow for "marker" style. */
  arrow?: Direction;
}

export interface CounterLayer extends LayerBase {
  type: 'counter';
  prefix?: string;
  suffix?: string;
  initial: number;
  steps: Array<{ at: TimeExpr; value: number; duration?: number; easing?: EasingName }>;
  size?: number;
  /** Show explicit + sign on positive values. */
  signed?: boolean;
  label?: LocalText;
}

export interface ProgressLayer extends LayerBase {
  type: 'progress';
  label?: LocalText;
  width?: number;
  initial?: number;
  steps: Array<{ at: TimeExpr; value: number; duration?: number }>;
  color?: string;
}

export type ParticleKind = 'dust' | 'sparkle' | 'money' | 'confetti' | 'poof';

export interface ParticlesLayer extends LayerBase {
  type: 'particles';
  kind: ParticleKind;
  count?: number;
  /** Emission window. Continuous kinds (dust) ignore duration. */
  at?: TimeExpr;
  duration?: number;
  /** Region in frame (0..1). Default: full frame. */
  region?: { x: number; y: number; w: number; h: number };
  color?: string;
  size?: number;
  seed?: number;
}

export interface SwarmLayer extends LayerBase {
  type: 'swarm';
  asset: string;
  count: number;
  region: { x: number; y: number; w: number; h: number };
  /** Height of each copy as fraction of frame height. */
  height: number;
  at?: TimeExpr;
  /** Seconds between copies appearing. */
  stagger?: number;
  seed?: number;
  /** Random rotation range in degrees. */
  jitter?: number;
}

export interface StampLayer extends LayerBase {
  type: 'stamp';
  at: TimeExpr;
  size?: number;
  text?: LocalText;
}

export interface LightLayer extends LayerBase {
  type: 'light';
  color: string;
  radius?: number;
  intensity?: number;
  /** "glow" = radial light; "beam" = window shaft; "grade" = full-frame wash; "vignette". */
  shape?: 'glow' | 'beam' | 'grade' | 'vignette';
  flicker?: number;
}

export interface RectLayer extends LayerBase {
  type: 'rect';
  w: number;
  h: number;
  color: string;
  radius?: number;
}

export interface FlashLayer extends LayerBase {
  type: 'flash';
  at: TimeExpr;
  duration?: number;
  color?: string;
}

export interface WordmarkLayer extends LayerBase {
  type: 'wordmark';
  at: TimeExpr;
  /** Optional brand asset; falls back to typographic wordmark. */
  asset?: string;
  tagline?: LocalText;
}

export interface GroupLayer extends LayerBase {
  type: 'group';
  /** Clip rect in frame (0..1). */
  clip?: { x: number; y: number; w: number; h: number };
  /** "cover": children form a virtual full frame scaled to cover the clip (split screens). */
  fit?: 'none' | 'cover';
  camera?: CameraConfig;
  layers: Layer[];
}

export type Layer =
  | ImageLayer
  | TextLayer
  | CounterLayer
  | ProgressLayer
  | ParticlesLayer
  | SwarmLayer
  | StampLayer
  | LightLayer
  | RectLayer
  | FlashLayer
  | WordmarkLayer
  | GroupLayer;

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

export type TransitionType = 'cut' | 'fade' | 'whip' | 'zoom' | 'wipe' | 'dip' | 'flash';

export interface TransitionSpec {
  type: TransitionType;
  /** Seconds. */
  duration?: number;
  direction?: Direction;
  color?: string;
}

export interface Scene {
  id: string;
  /** Visual intent — documentation only. */
  note?: string;
  /** Absolute start. Usually cue-anchored, e.g. "l04-0.1". Scene ends where the next starts. */
  start: TimeExpr;
  /** Only needed on the final scene of a cut. */
  end?: TimeExpr;
  /** How this scene enters (the previous scene exits the same way). */
  transition?: TransitionSpec;
  camera?: CameraConfig;
  layers: Layer[];
  sfx?: SfxEvent[];
  /** Background colour behind all layers. */
  backgroundColor?: string;
  /** Escape hatch: name of a bespoke React scene in src/scenes/registry.ts. */
  component?: string;
}

export interface ScenesFile {
  episode: string;
  scenes: Scene[];
}
