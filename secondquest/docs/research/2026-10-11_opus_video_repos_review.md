# Review: "Claude Opus 5.5 week" video repos (10 repos, Producer's post)

Date: 2026-10-11. Method: README + LICENSE of each repo via raw.githubusercontent.com; for ClaudeAnimationBase also
ANIMATION_GUIDE.md, src/core.js, src/timeline.js; for lemo-opuscar TECHNIQUE.md and the style index. Nothing was installed or run.
Star counts, view counts and the post's numbers are NOT verified (GitHub API/pages blocked). The post's counts are
off: yihui-dev's README says 513 prompts (post: 475); athemeroy's says 424 source posts (post: "1,000+").

Our baseline (read from scripts/animatic/lib.py): Pillow+NumPy, 24 fps, cosine `ease`, `breeze()` cloth/hair warp,
`walk_adult`, camera boxes eased between two keys, subtitles. We do NOT have: line boil / drawing on twos, paper grain
or vignette, additive glow, spring/overshoot follow-through, anticipation helpers, shaped transitions (iris, wipe),
camera shake, beat pulse. That is where the real gap is, not in "more detail".

## Table

| # | Repo | What it is | Licence | Technique | Useful for us? | Verdict |
|---|---|---|---|---|---|---|
| 1 | JohnHeibel/PDoomVideo | Opus-written music video for a meme song, every frame in code (Clawd mascot, 9 chapters) | **No LICENSE file (404) = all rights reserved**; song is third-party (2024 Udio track) | p5.js + p5.brush painted in headless Chrome, frames to ffmpeg; Opus wrote STORYBOARD.md and an ANIMATION_GUIDE.md for parallel subagents | Only as a reading source for the workflow (storyboard, then parallel scene files). Code not reusable (no licence, Clawd is Anthropic's mascot, wrong stack) | SKIP |
| 2 | yihui-dev/awesome-opus5-5-videos | Link list: 513 prompts (100 highlighted) of viral Opus videos, mostly motion graphics/explainers; promotes skillry.dev | MIT (list); linked works belong to creators | Canvas/SVG/three.js demos | Prompts are for generic motion graphics; nothing for a cartoon essay. Marketing-flavoured | SKIP |
| 3 | dgreenheck/tidewater | Real WebGPU/WGSL fishing game with its own engine: 4-cascade FFT ocean, breaking waves, shallow-water sim, caustics, volumetric clouds, atmosphere, GTAO, skinned characters | MIT (code). Assets are separate: Poly Haven scans (CC0), Microsoft Rocketbox characters, CC0 audio; check each before reuse | Photoreal GPU rendering. Needs WebGPU + a capable GPU, "several hundred shaders" | Not for the look: photoreal water clashes with our flat 2D + ink style, our headless Chromium has no GPU/WebGPU, and EP003 is about a fishing game so copying a real fishing game's scenes is also an IP-adjacent trap. Ideas only (see below): cheap stylised water cues | SKIP (code); ideas only |
| 4 | riba2534/claude-opus-5-5-demo | Three one-prompt playable three.js games (pelican on a bike, a Crossfire-style FPS, QQ Speed racer); everything procedural | **No LICENSE file** (404); two of the three imitate commercial games | three.js r186, esbuild single-file, procedural models/textures/audio, cloth sim on a scarf | Confirms our "procedural three.js props" approach. Nothing to take; the FPS/racer imitate game IP, which our rules forbid | SKIP |
| 5 | lemomo-ai/lemo-opuscar | 43 film styles (+ OPUSCAR 98, 6:31 film in 98 styles), DIRECTOR.md / TECHNIQUE.md / per-style STYLE.md, as a plugin | MIT (third-party demo assets keep own licences) | Canvas/WebGL pages rendered frame by frame; one `timeline.js` drives picture, music, subs and checks; `cuecheck.py` compares visual hits vs sound cues; faster-whisper ASR check per line; contact-sheet review loop; 3D: soft area lights + low HDRI, DOF + GTAO post at 2x downsample; loudnorm -14 LUFS two-pass | Process ideas only, and we already do most (faster-whisper, review sheets, single timeline `T()`). DIRECTOR.md is worth a read for camera/performance checklists. Styles (risograph, crayon, woodcut, blueprint) could inspire card/transition looks | TRY (read DIRECTOR.md only) |
| 6 | JohnHeibel/ClaudeAnimationBase | Starter kit: one mascot (Clawd), 31 emotions, hats/emotes, brush-wipe/iris transitions, camera, glow, paper; ANIMATION_GUIDE.md with animation principles | **MIT** (clean, explicit) | p5.js + p5.brush (watercolour/ink strokes, WebGL), linework "boils" at 12 fps via re-seeded jitter; per-element `boilSeed`; paper texture + multiply grain + vignette; additive `glow()`; `spring`/`ring` damped follow-through; `onTwos`; `jump()` with anticipation/squash/land; `shakeXY`; `brushWipe`, `iris`, `irisShape`, `flash`; `pulse` on beats | **Not as code**: our characters are generated bitmap art, not vector strokes, and p5.brush on integrated-GPU headless is "seconds per frame". **Yes as a recipe book**: the finish layer (paper grain, vignette, boil, on-twos, glow, springs, transitions) maps to Pillow/NumPy cheaply. ANIMATION_GUIDE.md rules (reads/timing, no twinning, transitions at every seam) are directly usable for our block scripts | TRY (ideas, own code, section below) |
| 7 | athemeroy/awesome-opus-5-5-videos | Research-style curated index of 424 source posts (Opus/Sonnet/Haiku/Fable), stats, prompt playbooks (some Chinese-only), links to other kits (Papermotion, Lemo, etc.) | CC BY 4.0 (writing/charts); linked works belong to creators; no raw MP4s | Meta-analysis, no code | Useful only as a directory. Papermotion (paper-animation template) is named there and unreviewed | SKIP (maybe bookmark) |
| 8 | diggerhq/shipvideo | LaunchVideo: URL or prompt in, 20-40 s HTML launch video out; Next.js form + hosted OpenComputer agent | **No LICENSE file** (404) | One HTML film, CSS keyframes/rAF, Playwright under an injected **virtual clock** (`__seek(t)` drives rAF, timers, Date, CSS/WAAPI), JPEG frames piped to ffmpeg (x264 crf 18) | Product marketing, hosted service. Only transferable idea (virtual clock for deterministic frames) we already have: our frames are pure functions of `t` | SKIP |
| 9 | makevoid/motion-graphics-music-video-skill | Plugin: song + prompt to music-video; uses FAL.ai image/video models (~$30 credits per 3 min), p5, Python cutouts, Swift VFX | MIT | Generates characters with image models, animates with a video model on greenscreen, cuts to beat; sub-agent "waves" with review | Violates "minimal credit spend"; music-driven; macOS-oriented. A "no image model" sibling repo exists (makevoid/...-noimage) but is not our case | SKIP |
| 10 | tuzhechen2005/opus-video-skills | Two Claude Code skills: painted-animation (p5.brush; tempo detection; karaoke subs) and kinetic-reel (type + three.js + WebGL post) | MIT, plus John Heibel's MIT notice for the template | Same engine as #6 (derived from it); kinetic-reel adds shape-continuity transitions and three.js layers with a WebGL post pass | Adds nothing over #6 for our case; kinetic typography is not our card style | SKIP |

## Honest bottom line

1. None of the 10 gives us a drop-in upgrade. They are code-drawn vector/WebGL pipelines; ours composites generated
   bitmap characters, which cannot be re-drawn per frame. Their "level of detail" comes from p5.brush strokes and GPU
   shaders, which we cannot match with paid-credit characters and a GPU-less sandbox.
2. The one repo worth mining is #6 (and its guide), because its *finish layer* and *motion rules* are technology-neutral.
3. Licensing: #1, #4, #8 have no licence (do not copy anything). #6, #10, #9, #5, #3 are MIT. Never copy Clawd
   (Anthropic mascot) or Tidewater's vendors/fish/UI.
4. Hosted/remote services (#8, #9 FAL.ai, OpenComputer) conflict with "minimal credit spend" and are not needed.

## Techniques worth stealing (as ideas, our own code)

Cost is Pillow/NumPy CPU time per frame; all are optional per-block flags so the draft quality stays fast.

1. **Paper grain + vignette multiply (cheap, high payoff).** ClaudeAnimationBase multiplies one static grain/vignette
   layer over every frame, so pigment looks "in" the paper and the cartoon reads as one piece. Ours: precompute one
   RGB noise+vignette array per resolution (seeded, so it is static), multiply in uint8 at the end of the frame.
   Risk: video compression hates grain; keep it faint (about 3-5 percent) and re-encode with a lower CRF or `-tune grain`
   (lemo's TECHNIQUE.md says the same). Fits all backgrounds, including the free three.js props. Cost: about 1 ms/frame.
2. **Drawing on twos + line "boil" for the 3D props.** Held 12 fps updates with a tiny per-update displacement of the
   ink outline (our props3d outlines are OpenCV; jitter the outline mask a pixel or two with a seeded noise warp per
   2-frame step) make the free 3D props feel hand-drawn and matches generated 2D art better than a perfectly clean ink
   line. Risk: shimmer on small objects; apply only to props, not to characters or text. Cost: one `cv2.remap` per prop per step.
3. **Spring follow-through for secondary motion.** `spring(t,t0,k,w) = exp(-k dt) sin(w dt)` and `ring` (one kick per
   event) give overshoot-and-settle. Ours: drive our existing `breeze()` hair/cloth and any prop that arrives (rod, bobber,
   lantern, card) from it, instead of the plain cosine ease. Also an anticipation dip (small opposite move before a big move)
   and squash on landing, expressed as scale of the cut-out. Cost: trivial; risk: over-bounce (keep it dry for the deadpan tone).
4. **Additive glow.** Paint light by adding, not alpha-blending, a soft radial texture (lamp, sun glint on water, screen
   light, firefly) so colours do not go muddy. NumPy `np.minimum(255, base + glow*col)`. Cost: low. Fits dusk/night lake, TV, lantern.
5. **Transitions at every seam, picked per story.** Their rule: iris on a character/object, brush-wipe, whip pan with smear,
   match cut, cut on action. We can build a small `transitions.py`: `iris(cx,cy,r)` mask, a smear-wipe with a paint-stroke
   mask from precomputed noise, and a match-cut helper. Respects our CAMERA_JUMP rule if the camera continues across the cut.
6. **Camera: shake on impacts and a never-dead drift.** `shakeXY` (hash-based, changes at 24 fps) for hits; every held shot
   gets a slow push (1 percent per second) so nothing is frozen. Our two-key camera box already supports the drift; add shake as an
   optional additive offset. Keep it to script moments (Producer rule: not every shot moves).
7. **Beat-less "pulse" for hits.** `exp(-frac*k)` envelope: reuse as a single-event pulse on word timings from faster-whisper
   (`T('l59.w3')`) for a text-card pop or a prop thump, no music needed (music is off).
8. **Process rules from ANIMATION_GUIDE.md, worth adding to our block checklist:** write the "reads" (what the viewer must
   understand, with start/end) per shot and never overlap two important reads; avoid twinning (offset phases between the two
   characters' idles, never identical blink/bounce); strong key pose stills before in-betweens; contact sheets at key times plus
   0.2 s frame strips of hand-overs (we have framing_qc.py; extend with a strip mode).
9. **From lemo-opuscar:** one timeline file feeding picture, subs, sfx and a cue-check script; 3D lighting recipe of soft area
   lights plus a low-intensity HDRI reads more real than bright ambient; render 3D at 2x and downsample (we already ink-outline
   at higher res; confirm we supersample); loudnorm two-pass -14 LUFS on the final mix.
10. **From Tidewater, for the EP003 lake/boat, in our flat style only (do not port the engine):**
    - Water as 2-3 layered sine-sum bands of horizontal ink dashes scrolling at different speeds (parallax reads as depth),
      with sun glints as additive glow specks along the band crests. Pillow/NumPy, no 3D.
    - Boat bob and lean from two out-of-phase low-frequency sines plus the spring from item 3 when the line is hit; a bow wake as a
      tapering V of foam dashes that trail with delay (their wake/bow spray idea, flattened).
    - Caustic wobble under the surface as a slowly warping tiled light-line texture added to the lake bed (their caustics, as a
      tiling 2D texture; precompute once).
    - Split view at the waterline: tint + slight vertical wave warp for the below-water half, and a few lens droplets on cut-in
      (their underwater/above split and lens drops) as a cheap overlay.
    - If we ever want a 3D boat/fish prop: three.js already in tools/props3d; use flat toon shading + ink outline, procedural
      geometry only. No Tidewater models or UI. Poly Haven CC0 textures would be allowed but are not needed.

## Suggested next step (free, no approval needed beyond a report)

Prototype items 1, 3, 4 and 5 as one `scripts/animatic/finish.py` (grain/vignette, spring, glow, iris/wipe), test on one
EP003 block at `draft`, and compare stills side by side with and without. Rule out anything that looks worse after the YouTube
re-encode. No credits, no installs of external code, no copied source.
