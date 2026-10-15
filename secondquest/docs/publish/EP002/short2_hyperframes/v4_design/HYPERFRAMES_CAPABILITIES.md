# Hyperframes: what the engine can do, what we had not used, and what v4 uses

## What I studied

- `.claude/skills/hyperframes-animation`:
  - SKILL.md and its runtime routing: GSAP, Lottie, Three.js, Anime.js, CSS, WAAPI, TypeGPU, HTML-in-canvas.
  - `rules-index.md` (about 50 atomic rules).
  - `techniques.md` (13 techniques).
  - `transitions/` (overview, catalog, and the 14 css-* families; shader transitions live in `@hyperframes/shader-transitions`).
  - `references/motion-blur.md`.
- `.claude/skills/hyperframes-creative`: house-style, video-composition, beat-direction, captions, audio-reactive, typography.
- The installed CLI (hyperframes 0.8.147): `render`, `snapshot`, `lint`, `check`, `inspect`, `keyframes`, `beats`, `compare`, `media-treatment`.

**Gaps in the local copy** (noted, not invented):
- The adapter files (`adapters/three.md`, `typegpu.md`, `animate-text.md`, …) and the blueprints are referenced but not vendored.
- `@hyperframes/shader-transitions` is not in our node_modules.

**Tested, not assumed:** headless Chromium here has WebGL 1 (SwiftShader). A Three.js scene rendered through `hyperframes render` correctly: a 2 s test, 3.7 s to render, deterministic under seek. three.js r159 (MIT) is vendored in `tools/hyperframes_ep002_short2/vendor/`.

## Capabilities

| Capability | Used before (v1-v3.3)? | v4 | Beat it serves / why not |
|---|---|---|---|
| GSAP single paused timeline, seek-safe | yes | yes | everything |
| **Three.js real-time 3D (WebGL), driven by the timeline clock** | no | **yes** | "three golden triangles": our own extruded, bevelled Triforce in PBR gold, lit by key + rim + hemisphere light. It rises out of the temple pedestal with one full turn and sways face-on; the triangles lock on "triangles"; on "very bad decision" the gold flickers red. A cut-out could not turn in light. |
| **Custom WebGL fragment shader (GLSL), DOM → texture** | no | **yes** | "Player two knows none of this": a 0.42 s pixel "boot" into P2's world (mosaic 45 → 1 px, RGB split, scanlines) on a canvas, built from the real shot's pixels. This is the new player's game "starting up": a designed transition, not a bug. |
| Canvas 2D procedural particles (deterministic hash) | Navi only | **yes** | golden sparks with a visible source: they burst out of the Triforce on "triangles" |
| **Audio-reactive accents** (precomputed 1/30 s RMS envelope of Bram's voice) | no | **yes** | "PLAYER TWO?" wobbles with his voice (scale and tilt from the envelope), seek-safe because the envelope is precomputed |
| **counting-dynamic-scale** rule (number proxy + `onUpdate`) | no | **yes** | the "KNOWS IT ALL" meter: 0 → 100 % for the veteran ("knows everything"), 100 → 0 % for the new player ("none of this"). The comparison is the joke. |
| **kinetic-beat-slam** (scale-slam, opaque from the first frame) | partly (title) | **yes** | "PLAYER ONE", "PLAYER TWO?", the P-tags on the vista |
| Split-screen co-op layout (two clipped worlds + seam + VS) | no | **yes** | frame 0: P1 VETERAN (temple) vs P2 NEW PLAYER (forest), a finished still for the feed. On "Player one" the bottom half drops away (expo.in). |
| Game-UI language in our own style (P1/P2 tags, player-select ports with our own pad icon, PRESS START blink) | HUD only | **yes** | "Player two?": a player-select screen. The vista becomes co-op: P1 + P2 tags and PRESS START (hard blink, never translucent). |
| depth-of-field-blur (rack focus) | no | **yes** | "They meet the Great Deku Tree": the focus racks from Pixie to the tree as the camera rises to its face |
| multi-phase camera (cut, punch-in, pull-back on words) | yes | yes | "extremely large tree": a full pull-back; "personal": punch into the face; "problem": hard cut to her doubt (the comedy hit; the hold is her pose) |
| Hard cuts between text layers; no motion blur on text | learned in v2-v3 | yes | rubric §2 |
| motion-blur component | v1 (wrongly, on text) | no | nothing in v4 is a fast enough snap to need it; never on text |
| Lottie | no | no | needs AE exports we don't have, and Lottie characters would be new art, which the Producer approves |
| TypeGPU / WebGPU | no | no | WebGPU is not available in this headless browser. WebGL1 covers the shader. |
| Anime.js / WAAPI / CSS keyframes | no | no | GSAP already covers it; one clock is safer for seek |
| HTML-in-canvas post-fx (`drawElementImage`) | no | partly | the boot shader samples the shot by drawing its plate and cut-out into a 2D canvas (the same idea, without the experimental API) |
| 3D camera flight / CSS 3D | no | no | a fake 3D camera through flat plates would warp the painted art; the real 3D goes where it is literal (the Triforce) |
| chromatic-glitch | no | inside the shader | only as the boot's RGB split, once |
| `hyperframes beats` / `compare` / `inspect` | no | gate | `check --at-transitions` and `snapshot` sweeps as before |

**Rules kept:**
- No faked actions: characters are real poses; movement comes from the camera, cuts, 3D, UI and light.
- Every light has a source (the Triforce glow, the sun flare).
- No diagonal bars.
