# SecondQuest — Production Engine

Config-driven [Remotion](https://www.remotion.dev) pipeline that turns **illustrated assets + one narration track + timing data** into a finished YouTube video for the SecondQuest channel.

Scenes are **data, not code**. Every visual event is anchored to a narration cue, so replacing the voice-over re-times the entire edit automatically.

> Current deliverable (V3): the pilot hook for *“Why Do Millions of People Play a Game About Farming?”* → `renders/secondquest_ep001_hook_v3.mp4` (English).

## SecondQuest Production Standard (V3)

| | English | Spanish |
|---|---|---|
| Role | **Production and default output language** | **Optional** locale: produced and rendered **only on explicit request** (`--locale es`) |
| Official voice | **SecondQuest English Voice v1** | **SecondQuest Spanish Voice v1** |
| Kokoro voice spec | `am_michael` | `am_michael:0.4,em_alex:0.6` (native embedding blend: 40 % `am_michael` + 60 % `em_alex`) |
| Speed | 1.00 | 1.00 |
| Phonemizer | `en-us` | `es-419` (Latin American Spanish) |

- **Rendering:**
  - `render`, `render:hook`, `render:episode`, `stills` and `stems` all produce English unless `--locale` is passed.
  - Spanish is rendered only with `--locale es` or `npm run render:hook:es`.
  - No command chains a Spanish render after an English one.
- **Mix (every new episode inherits it):**
  - music bed 0.35, ducking to 0.27 under the voice;
  - SFX ducked to 0.62; punchlines use `duckTo`;
  - mastering to −14 LUFS / ≤ −1.5 dBTP.
- **Source of truth:** `shared/production.json` for voices, default locale, episode defaults and mastering, and `shared/pronunciation.json` for pronunciation overrides.
- **Engine:** everything is local Kokoro (`kokoro-v1.0.int8.onnx` + `voices-v1.0.bin`). There are no paid TTS services or APIs.

## Quick start

```bash
cd secondquest
npm install
npm run dev            # Remotion Studio → pick composition "ep001-hook"
npm run render:hook    # → renders/secondquest_ep001_hook_v3.mp4 (English, 1080p30, -14 LUFS)
npm test               # engine tests (no video rendering)
```

Requirements: **Node ≥ 18**. Nothing else. FFmpeg ships inside Remotion (`npx remotion ffmpeg`), and Chrome is downloaded by Remotion on first render. If a Chrome/Chromium headless shell is already installed, set `REMOTION_BROWSER_EXECUTABLE=/path/to/headless_shell`. The render scripts also auto-detect Playwright's `/opt/pw-browsers`.

Optional: Python 3 + `kokoro-onnx` only if you want to regenerate the *placeholder* TTS narration (`tools/tts`).

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Remotion Studio (live preview; new art files show up instantly) |
| `npm run render:hook` | Validate → render → master → `renders/secondquest_ep001_hook_v3.mp4` (**English**) |
| `npm run render:episode -- <ep>` | Render an episode's `full` cut (or its only cut) in **English** |
| `npm run render:hook:4k` | Same as `render:hook` at 3840×2160 (`--scale 2`) |
| `npm run render -- <ep> [<cut>] [--version v3] [--scale 2] [--frames 0-299]` | Any episode/cut, **English** by default |
| `npm run render -- <ep> <cut> --locale es` · `npm run render:hook:es` | Spanish — **explicit request only** |
| `npm test` | Engine tests: policy, Spanish architecture (no MP4), overrides, ducking, timings, clipping, scaffolder. Set `KOKORO_MODEL`/`KOKORO_VOICES` to include the TTS dry-run checks. |
| `npm run validate [-- ep001]` | Checks cues, assets, sounds, ordering and localisation; prints the timeline per language |
| `npm run stills -- ep001 hook [--at 12.5,30] [--scale 1] [--locale es]` | Review frames per scene → `renders/review/` |
| `npm run assets [-- ep001]` | Art status + recommended pixel sizes → `episodes/ep001/ART_STATUS.md` |
| `npm run stems -- ep001 hook [--locale es]` | Narration / music / SFX stems → `renders/stems/` |
| `npm run narration:align -- ep001 [--locale es] [--normalize]` | Build `timings.json` / `timings.es.json` from a real recording |
| `npm run narration:tts -- ep001 --model … --voices … [--locale es] [--dry-run]` | Regenerate placeholder TTS narration + timings with the production voice and pronunciation overrides (`--dry-run` prints phonemes only) |
| `npm run audio:placeholders [-- ep001] [--force]` | Synthesise missing placeholder SFX (shared) and music (per episode, from `episode.json`) |
| `npm run add:locale -- ep001 es` | Add a language to an episode (script/timings stubs + registration) |
| `npm run new:episode -- ep002 slug "Title"` | Scaffold + register a new episode with the official defaults |
| `npm run typecheck` | TypeScript check |

## Project structure

```
secondquest/
├── episodes/ep001/            ← EVERYTHING episode-specific is data here
│   ├── episode.json           fps/size, asset root, narration file, music cues, cuts
│   ├── script.json            approved narration (master language), split into cue lines (l01…)
│   ├── timings.json           start/end of every line in the master WAV (generated)
│   ├── script.es.json         Spanish script — same cue ids
│   ├── timings.es.json        Spanish timings (generated from the Spanish WAV)
│   ├── scenes.json            the edit: scenes, layers, camera, animation, sfx
│   ├── assets.json            episode art catalog (id → file, aspect, brief)
│   └── ART_STATUS.md          generated illustrator checklist
├── shared/
│   ├── assets.json            recurring cast: Quest, Wallet, Progress, The Grind, Fear…
│   └── sfx.json               sound library (id → file, trim volume)
├── public/                    media (served to Remotion)
│   ├── characters/<name>/     shared character art
│   ├── episodes/ep001_farming/{backgrounds,characters,objects,overlays,audio,music,sfx}/
│   └── shared/{fonts,sfx,music,brand}/
├── src/
│   ├── schema/types.ts        the scene schema (documented)
│   ├── engine/                pure logic: timeline resolution, asset registry, validation
│   ├── animations/            presets (pop_in, float…), camera, transitions
│   ├── components/            SceneRenderer, layer renderers, placeholders, named motion components
│   ├── audio/                 AudioMix (3 buses) + ducking maths
│   ├── compositions/          EpisodeCut (one composition renders any cut)
│   ├── episodes/index.ts      episode registry
│   ├── scenes/registry.ts     escape hatch for bespoke React scenes
│   ├── styles/                theme tokens, local font loading
│   └── utils/                 time expressions, easing, deterministic noise
├── scripts/                   Node CLIs (render, master, validate, stills, assets, align…)
├── tools/tts/                 optional placeholder narration generator (Python)
└── renders/                   outputs (final MP4s are committed; tmp/review/stems ignored)
```

## How a video is described

### Timing: cue-anchored time expressions

`script.json` splits the approved narration into lines at its natural beats (`l01` … `l19`). `timings.json` stores when each line is spoken. Every time in a scene can reference those cues:

| Expression | Meaning |
|---|---|
| `"l04"` | when line l04 starts |
| `"l04.end-0.2"` | 0.2 s before l04 finishes |
| `"l12+1.3"` | 1.3 s into l12 |
| `1.5` | inside a scene: 1.5 s after the scene starts |
| `"scene.end-0.5"` | 0.5 s before the scene ends |
| `"end"` | end of the cut (music only) |

A scene starts at its `start` and lasts until the next scene's `start`, so cuts always follow the narration. Only the last scene of a cut needs an `end`.

### A scene

```jsonc
{
  "id": "s04_tractor",
  "start": "l04-0.12",                              // cut 0.12 s before the line
  "transition": { "type": "whip", "direction": "left" },
  "camera": {
    "start": { "zoom": 1.45, "x": 0.34, "y": 0.72 },
    "moves": [{ "type": "move_to", "zoom": 1, "x": 0.5, "y": 0.5, "at": 0.05, "duration": 1.5, "easing": "inOutCubic" }],
    "shakes": [{ "at": "l04+0.8", "intensity": 10 }]
  },
  "layers": [
    { "asset": "ep001.bg_dealership" },               // full-frame background (auto cover)
    { "asset": "ep001.tractor_huge", "x": 0.64, "y": 0.97, "height": 0.92, "shadow": true },
    { "asset": "wallet.happy", "x": 0.31, "y": 0.97, "height": 0.2,
      "swaps": [{ "at": "l04+0.85", "asset": "wallet.worried" }],    // expression swap
      "animations": [{ "type": "shake", "at": "l04+0.9", "intensity": 0.5 }] },
    { "type": "text", "style": "price", "text": "$450,000", "x": 0.64, "y": 0.2, "show": "l04+0.8" },
    { "type": "counter", "label": "Wallet", "prefix": "$", "initial": 2840, "x": 0.22, "y": 0.2,
      "steps": [{ "at": "l04+1.2", "value": -447160, "duration": 0.95 }] }   // MoneyDrain
  ],
  "sfx": [{ "id": "impact", "at": "l04+0.8" }, { "id": "drain", "at": "l04+1.2" }]
}
```

Positions are **normalised** (0–1 of the frame); `x`,`y` place the asset's anchor (characters: feet). Sizes are a fraction of frame height (`height`) or width (`width`). This makes every layout resolution-independent (1080p, 4K via `--scale 2`, any future aspect).

### Layers

| `type` | Purpose |
|---|---|
| *(image)* | artwork by asset id; `swaps` for pose/expression changes; `shadow`; `flip` |
| `text` | styles `punch` (TextPunch), `price`, `label`, `ui`, `marker` (+`arrow`), `caption` |
| `counter` | animated number (MoneyDrain / count-up), shakes while draining |
| `progress` | ProgressFill bar with stepped fills and a glow at 100% |
| `particles` | `dust` (ParticleDust), `sparkle`, `money`, `confetti`, `poof` |
| `swarm` | one asset multiplied with staggered pop-ins ("emails multiply") |
| `stamp` | rejection stamp |
| `light` | `glow`, `beam`, `grade` (colour wash), `vignette`; optional `flicker` |
| `rect`, `flash`, `wordmark` | shapes, light flashes, SecondQuest ident beat |
| `group` | clip region + its own camera; `fit: "cover"` makes each split-screen panel a mini-scene |

Common to all layers: `depth`, `x`, `y`, `rotation`, `opacity`, `show`/`hide`, `blend`, `animations`.

**Depth and parallax.** Each layer sits at a `depth` (0 = far, 1 = near; defaults by asset kind). The single scene camera is applied per depth, so any camera move produces parallax automatically. `"depth": "screen"` pins UI to the screen. A flattened full-frame illustration is simply one background layer, and every camera move still works on it.

### Animation presets

Each preset accepts `at`, `duration` or `end`, `easing`, `intensity`, plus `from`/`to`, `distance`, `frequency`, `phase` where relevant.

- **Entrances:** `pop_in`, `slide_in`, `fade_in`, `drop_in` (ObjectDrop, with bounce and squash), `rise_in`, `punch_in`, `wipe_in`
- **Exits:** `pop_out`, `slide_out`, `fade_out`, `sink_out`
- **Loops:** `float`, `bounce`, `shake`, `breathe`, `wobble`, `pulse`, `spin`, `drift` (SlowDrift), `flicker`
- **Accents:** `reaction` (CharacterReaction squash-and-stretch take), `squash`, `hop`, `nudge`

**Camera moves:** `push_in`, `pull_out`, `pan_left`/`right`/`up`/`down`, `move_to`, `punch`. Moves can overlap. On top of them come `shakes` and an always-on subtle handheld `drift`, which you can turn off with `"drift": 0`.

**Transitions** (on the incoming scene): `cut`, `fade`, `whip`, `zoom`, `wipe`, `dip`, `flash`. The outgoing scene is kept alive underneath for the overlap, so cue timing is never shifted.

**Editorial rule (SecondQuest).**
- **Comedy beats:** hard cuts, sold with a camera `punch`, an impact SFX and a character `reaction`.
- **Soft transitions:** `fade` and `dip` are reserved for landscapes, contemplative beats, emotional turns and the close.
- **Whip:** only for a quick burst of energy. Its blur is capped at about 11 px, and the zoom transition's at about 5 px.

**Code-authored scenes.** `src/components/motion.tsx` exposes the same vocabulary as React components: `CameraPushIn`, `CameraPullOut`, `PanLeft`, `PanRight`, `ParallaxScene`/`ParallaxLayer`, `CharacterPopIn`, `CharacterSlideIn`, `CharacterReaction`, `FloatAnimation`, `ShakeAnimation`, `BounceAnimation`, `ObjectDrop`, `SlowDrift`, `ProgressFill`, `MoneyDrain`, `TextPunch`, `ParticleDust`, `FadeTransition`, `WhipTransition`. Register a bespoke scene in `src/scenes/registry.ts` and reference it with `"component": "Name"`. Prefer extending the schema first.

## Replacing assets

1. Run `npm run assets` or open `episodes/ep001/ART_STATUS.md`. Each asset shows its **exact target path**, recommended pixel size and brief.
2. Export the art (PNG/WebP; transparent for everything except backgrounds) and drop it at that path.
3. That's it. The placeholder disappears (live in Studio). If the art's aspect ratio differs from the catalog's, `npm run assets` warns you; update `aspect` in `assets.json`.

Artwork conventions:
- Characters and objects: feet or base touching the bottom edge, no baked shadow.
- Swap pairs (e.g. `quest.bed_sleeping` / `quest.bed_awake`) share the same canvas so they overlay exactly.
- Backgrounds: 3840×2160, with no characters in them.

Shared cast art lives in `public/characters/<name>/` and is catalogued once in `shared/assets.json`, so Quest stays identical across episodes.

Placeholders are intentionally *not* art. They are labelled cards: a generic mannequin in the character's key colour, or a tinted panel. They keep composition and motion testable without inventing designs.

## Changing the narration

The whole edit follows `timings.json`.

1. Put the new recording at `public/episodes/ep001_farming/audio/narration.wav` (path set in `episode.json` → `narration.audio`).
2. `npm run narration:align -- ep001 --normalize`
   - It detects pauses and aligns them to `script.json` lines with a text-aware dynamic program.
   - `--normalize` sets the voice to −20 LUFS; the original is kept as `narration.original.wav`.
   - Accuracy: lines separated by a pause land within ~0.1 s. Lines run together without a breath are split by character count (±0.3 s).
   - For frame-exact gags, nudge `timings.json` by hand, or paste times from a forced aligner (Whisper, Descript, ElevenLabs timestamps). The file format is trivial.
3. `npm run validate && npm run stills -- ep001 hook` to check the gags still land, then render.

**Script edits.** If you split, merge or reword lines in `script.json`, keep the ids stable. Scenes reference `l04`, not text. Validation reports any cue a scene references that no longer exists.

## Languages (localisation)

English is the master and default language. Others are added per episode and rendered **only on explicit request**. Each language has **its own narration audio, script and timings**. Scenes, assets, camera, music and SFX are shared. Because every scene is anchored to cue ids (`l01`…), the same `scenes.json` follows each language's own duration and cadence automatically.

```jsonc
// episode.json
"locale": "en",                                  // master
"narration": { "audio": "audio/narration.wav" },
"locales": { "es": { "narration": "audio/es/narration.wav" } }
```

| Per language | Master (en) | Spanish (es) |
|---|---|---|
| Script | `script.json` | `script.es.json` (same ids) |
| Timings | `timings.json` | `timings.es.json` |
| Narration | `audio/narration.wav` | `audio/es/narration.wav` |
| On-screen text | `"text": { "en": "YOU ARE HERE", "es": "ESTÁS AQUÍ" }` | (same field) |
| Composition | `ep001-hook` | `ep001-hook-es` |
| Render output | `…_hook_v3.mp4` (default) | `…_hook_es_v3.mp4` (only with `--locale es`) |
| Voice | English Voice v1: `am_michael` @ 1.00, `en-us` | Spanish Voice v1: `am_michael:0.4,em_alex:0.6` @ 1.00, `es-419` |

Adding a language:
1. `npm run add:locale -- ep001 es` creates the stubs and registers them in `src/episodes/index.ts`.
2. Translate `script.es.json`, keeping the ids.
3. Add the recording.
4. `npm run narration:align -- ep001 --locale es --normalize`.
5. Localise on-screen text.
6. `npm run validate`, then `npm run render -- ep001 hook --locale es`.

`npm run validate` checks the localisation:
- **Error:** a language's script is missing cue ids that the master script has.
- **Warning:** an on-screen text has no translation for some language. Plain strings containing letters count; pure numbers don't.

Counters format numbers per language (`450,000` / `450.000`). Episodes without `locales` behave exactly as before.

> EP001's Spanish script is a **draft translation** made to test the pipeline (flagged by `"status"` and a validation warning), and its narration is placeholder TTS generated with Spanish Voice v1.

### Voices

`shared/production.json → voices.<locale>` is the single source of truth. Each entry sets `voice` (a Kokoro id, or a native blend `a:w,b:w`), `speed` and `lang` (espeak-ng: `en-us`, `es-419`).
- `npm run narration:tts` uses it and records the voice actually used in `timings*.json` (`tts`).
- `npm run validate` warns if a narration was generated with a different voice or phonemizer than the configured one.

### Pronunciation overrides

`shared/pronunciation.json` holds the entries for all episodes, per locale. `episodes/<ep>/pronunciation.json` is optional and wins on the same phrase. The narration generator applies them before synthesis:

```jsonc
"es": [
  { "match": "Farming Simulator", "lang": "en-us" },              // keep the English product name
  { "match": "Zelda", "say": "Selda" },                           // respelling in the locale's language
  { "match": "Ganon", "phonemes": "ɡˈɑːnɑn" }                      // literal phonemes
]
```

Each entry needs exactly one of `say`, `lang` or `phonemes`.
- **Check the result:** `npm run narration:tts -- <ep> --locale es --dry-run` shows the phonemes and which overrides fired.
- **Validation:** `npm run validate` rejects malformed entries and warns about phrases that don't appear in the script.
- **Always verify overrides by ear.**

## Audio

- **Narration.** The primary bus, untouched.
- **Music.** `episode.json → music.cues`: tracks with `start`/`end` (cue expressions), `volume`, `fadeIn`/`fadeOut`, `loop`, `offset`, plus `automation` cues for gain moves (e.g. pull the bed out for a punchline). Music **ducks automatically** under narration using the cue intervals (`duck.to`, `attack`, `release`, `lookahead`), so there is no sidechain guesswork and results are deterministic. A missing music file is skipped silently, so the prototype renders without music.
  - For a royalty-free or local track, drop the file in `public/episodes/<ep>/music/` and point `src` at it.
  - For a generated track, `npm run audio:placeholders` synthesises any missing cue using the generator named in its `placeholder` field (`bed`, `sunset`). It works for any episode from its own `episode.json`.
- **SFX.** `shared/sfx.json` maps ids to files; scenes fire them with `{ "id", "at", "volume", "duration"|"end", "fadeOut", "rate", "duckTo" }`. They duck under speech to `duck.sfxTo` (default 0.62). An intentional punchline hit can override that per event, e.g. `"duckTo": 0.9`.
- **Hierarchy: narration > SFX > music.** The official values live in `shared/production.json → episodeDefaults.music` and every new episode inherits them. EP001 uses bed volume 0.35, `duck.to` 0.27 (the music ducks ≈ −11 dB whenever the voice speaks) and `sfxTo` 0.62.
- **Mastering.** `scripts/master.ts` runs automatically in every render. It measures EBU R128 loudness, applies make-up gain and a lookahead peak limiter, and iterates to **−14 LUFS integrated / ≤ −1.5 dBTP** (YouTube reference). The video stream is copied untouched.
- **Mix review.** `npm run stems` exports each bus separately.

## Creating a new episode

```bash
npm run new:episode -- ep002 zelda_maps "Why Are Zelda Maps So Satisfying?"
```

This creates `episodes/ep002/*.json` and `public/episodes/ep002_zelda_maps/*`, and registers the episode. The episode is born with the official defaults from `shared/production.json`:
- English master and English voice;
- 1080p30;
- music ducking 0.27 / SFX 0.62;
- a placeholder music bed at 0.35;
- a `full` cut.

Spanish is added only on demand, with `npm run add:locale -- ep002 es`. Then:
1. Write the script.
2. Record, or generate placeholder narration.
3. `narration:align`.
4. Author `scenes.json` and `assets.json`.
5. `npm run dev` to preview.
6. `npm run audio:placeholders -- ep002 && npm run render:episode -- ep002` (English).

Add more `cuts` (e.g. `hook`, `act1`, `full`) to render any scene range.

## Rendering

`npm run render:hook` does the following:
1. Validates the episode.
2. Bundles.
3. Renders H.264 (CRF 18, yuv420p, BT.709, AAC 320k) at 30 fps.
4. Masters the audio.
5. Writes `renders/secondquest_ep001_hook_v3.mp4`, in English. Mastering targets are read from `production.json`.

Performance:
- Frames are rendered in parallel.
- Scenes are premounted 1 s early and every swap variant is mounted up front, so images are always preloaded.
- Particles and noise are deterministic functions of time, so no simulation state is carried between frames.
- Keep delivered art near the size `npm run assets` recommends; it flags oversized files.

## Current placeholder status (V3)

| Element | Status |
|---|---|
| Narration | English: English Voice v1 (`am_michael` @ 1.00). Spanish: Spanish Voice v1 (`am_michael:0.4,em_alex:0.6` @ 1.00, `es-419`) over a draft translation. Both are TTS from `tools/tts/placeholder_narration.py`. |
| Art | **All 46 referenced assets are labelled placeholders**; see `episodes/ep001/ART_STATUS.md` |
| SFX / music | **Placeholder** deterministic synths (`scripts/placeholder-audio.ts`), with no samples and no copyrighted material |
| Wordmark | Typographic stand-in until `public/shared/brand/secondquest_wordmark.png` exists |
| Fonts | Anton + Inter (SIL OFL, bundled locally) |

## Voice selection history (reference only; not configuration)

The production values are only those in `shared/production.json`. This section records how they were chosen.

- **English.** All 9 Kokoro US male voices were auditioned under identical conditions, and `am_michael` @ 1.00 was selected.
- **Spanish.** The native voices `em_alex` and `em_santa` were auditioned, along with `am_michael` phonemized as `es-419` and native blends at 70/30, 50/50 and 40/60. The **40/60 blend** was approved. By measurement it runs about 8 % slower than `em_alex`, and it keeps part of Michael's pitch.

