# Deep scout · ENGINE architecture (2026-10-12, second pass)

Scope: which render/compositing architecture raises quality and speed for SecondQuest on a CPU-only Linux container (the
dev box has 4 cores, 15 GB RAM). Nothing installed or run. Not repeated from earlier scouts: Hyperframes/Revideo/Motion
Canvas/blender-mcp basics (see `2026-10-11_motion_tools_review.md`, `2026-10-12_github_scout_new_channel.md`); here
only what they did not measure or decide.

Evidence tags: **[V]** read this session from README/docs/search result; **[M]** from memory, verify before relying;
**[?]** unknown, needs our own test. No speed number below was measured by us; claimed numbers are labelled.

## 0. Findings that change the plan

1. **Our bottleneck is probably not the library, it is the number of frames we compute.** EP003 v3 has only 29 % of frames
   with visible motion (style bible). A 6.5 min video at 24 fps is 9,360 frames; most are plate + camera drift + subtitle.
   Cheapest big win: do not recompute identical frames (hash the per-frame inputs, repeat via ffmpeg `-r`/dup), cache the
   static composite of each shot (already done in `layers`), and split work per shot across 4 processes. This is
   architecture, not a new engine.
2. **Per-frame costs that matter at 2560x1440**: camera crop+resize of a 2688x1512 plate, alpha compositing of movers,
   warps (breeze/idle), finish pass (grain, vignette, halftone), pipe to ffmpeg. All are array ops: OpenCV
   (`warpAffine`, `remap`, `resize INTER_AREA/LINEAR`, `addWeighted`) is SIMD/threaded in C++ and the OpenCV tutorial
   says `addWeighted` is about 2x a NumPy expression [V]. Pillow-SIMD (AVX2 alpha composite, resize) is reported by its
   own author to beat Skia on resize [V, self-reported], but it replaces Pillow and is a build risk. Caveat [V]: OpenCV
   does not do straight-alpha "over" correctly on its own; use premultiplied float/uint16 or `cv2.multiply` recipes, and
   keep Pillow's `alpha_composite` as the reference in a test.
3. **Chromium on CPU: use llvmpipe, not SwiftShader.** Microlink measured a heavy WebGL scene at ~24 s with SwiftShader vs
   ~6 s isolated / 7-14 s under load with Mesa llvmpipe via ANGLE (`--use-angle=gl`, no `--disable-gpu`, Xvfb,
   `LIBGL_ALWAYS_SOFTWARE=1`) [V, vendor-reported]. For our three.js props (rendered once per prop to PNG with alpha),
   this is irrelevant to the video time; it only matters if we ever drive three.js per frame.
4. **Godot movie mode is a real option but is unproven on CPU.** `--write-movie` renders deterministically at a fixed fps
   regardless of hardware speed, outputs MJPEG AVI or PNG sequence + WAV [V]. Whether it runs headless without a GPU
   (needs `--rendering-driver opengl3`/Mesa llvmpipe or lavapipe, and `--headless` uses a dummy renderer that draws
   nothing) is **[?]**: search found no confirmation. Test cost: 2 h.
5. **Blender**: Cycles CPU works headless, no display [V]. EEVEE needs OpenGL even headless (llvmpipe possible, slow) and
   Grease Pencil headless render without a GPU/display is a documented failure area [V: bug reports]. So Blender is only
   viable as an offline Cycles CPU sprite/prop baker, never as the frame engine.
6. **Timeline interchange is nearly free**: OpenTimelineIO (Apache-2.0 [M], ASWF) writes CMX 3600 EDL and FCP X XML via
   adapter plugins (`OpenTimelineIO-Plugins` package; core is 3.9-3.12 Python) [V]; Premiere takes FCP7 XML [V]. A human
   editor can open our cut in Resolve/Premiere/Final Cut. Caveat: EDL has no frame rate (pass `rate=24`) [V].

## 1. Candidate table (28)

Licence: P = permissive, C = copyleft (GPL/LGPL, fine to USE as a tool), S = source-available/other.
CPU = feasible without GPU in this container.

| # | Repo / tool | Licence | CPU | Speed (claimed / found) | Fit for SecondQuest | Verdict |
|---|---|---|---|---|---|---|
| 1 | opencv-python (opencv/opencv) | Apache-2.0 [M] | Yes, SIMD+threads | `addWeighted` ~2x NumPy [V]; load 3x Pillow [V, blog] | Camera warp, remap (idle motion), resize, finish pass, blur. Already a dependency of props3d | **ADOPT** for hot path |
| 2 | kyamagu/skia-python | BSD-3 [M]; README states none | Yes (raster surface, `Surface.MakeRasterN32Premul`) [M]; Linux needs libEGL+fontconfig [V] | Skia is Chrome's rasterizer; no benchmark [V: none given] | Anti-aliased vector shapes, rounded cards, blur/shadow, text shaping with better kerning than Pillow, paths for ink-outline effects, SkSL runtime shaders on CPU | **ADOPT selectively** for ui_kit cards only; not for plate compositing |
| 3 | treeform/pixie-python | MIT [M] | Yes, SIMD [V] | "Many operations SIMD" [V], no numbers | Pillow-like drawing with blend modes, masks, shadows, SVG read | **WATCH**; overlaps skia, smaller community |
| 4 | python-pillow/Pillow (current) | HPND | Yes | single core; `reducing_gap` resize | Keep for loading, text, one-off cards | **KEEP**, demote from per-frame hot path |
| 5 | uploadcare/Pillow-SIMD | HPND [M] | Yes (AVX2) | Author: 4-16x resize, faster alpha composite [V, self-reported] | Drop-in speed-up, but replaces Pillow wheel, needs build | **TEST** only if profile shows Pillow resize dominant |
| 6 | libvips/pyvips | LGPL-2.1 [M] | Yes, streaming, threaded | 3x ImageMagick, 5x less memory [V, generic] | Great for big stills/plates tiling; per-frame Python overhead high | **SKIP** for frames; maybe plate prep |
| 7 | numba/numba | BSD-2 [M] | Yes, `prange` | LLVM JIT [V] | Custom per-pixel kernels (halftone, grain, depth parallax warp) not in OpenCV | **ADOPT if needed** after OpenCV; adds JIT warm-up (cache=True) |
| 8 | pyav (PyAV-Org/PyAV) | BSD-3 [M] | Yes, wheels bundle FFmpeg [V]; Python>=3.12 in latest [V] | Avoids ffmpeg pipe copy; threaded encode | Encode from NumPy frames in-process, exact frame timing, no stdin pipe stalls | **OPTIONAL**; ffmpeg pipe is fine until proven slow. Note Python 3.12 requirement vs our 3.11 [V] |
| 9 | cairo / pycairo | LGPL/MPL; pycairo LGPL [M] | Yes | Slower than Skia generally [M] | Manim CE uses it | **SKIP** (Skia supersedes) |
| 10 | ManimCommunity/manim | MIT [V] | Cairo renderer yes; OpenGL renderer needs GL (llvmpipe) [M] | Cairo renderer slow, many Python calls [M] | Diagram/maths cards only (already in earlier scout) | **SKIP for engine**, use for specific explainer cards |
| 11 | godotengine/godot | MIT [V] | **[?]** `--write-movie` deterministic [V]; GPU-less needs software GL/Vulkan | Faster-than-realtime if vsync off [V] | Real 2.5D scene graph, parallax, particles, shaders, tweens, Spine-like skeleton; strong for the "world" shots | **PROTOTYPE** 1 shot (see roadmap); not before |
| 12 | Godot MCP servers: Erodenn/godot-runtime-mcp, koltyakov/godot-mcp, tugcantopaloglu/godot-mcp, PiMPStudios/Claude-GoDot-MCP | mixed, unverified | Headless scene/GDScript editing for first two [V, listing text] | n/a | Only matters if Godot adopted | **DEFER**; pick after Godot test; check licence+last commit |
| 13 | blender/blender (+ bpy wheel) | GPL tool, outputs ours | Cycles CPU headless yes [V]; EEVEE no without GL [V]; Grease Pencil headless fragile [V] | no 1080p CPU benchmark found [V] | Offline sprite baker for hard 3D props (organic/bevelled) | **DEFER**; three.js props suffice today |
| 14 | ahujasid/blender-mcp | MIT [V] | Needs a running Blender GUI addon; 9 tools incl. `execute_blender_code`, `look` [V] | n/a | Third-party asset/AI-generation tools conflict with Producer rule (no paid 3D) | **SKIP** (earlier verdict stands) |
| 15 | panda3d/panda3d | BSD [V] | Offscreen buffer + RAM texture readback works [V forum]; tinydisplay software renderer reported "woefully inadequate" [V forum] | n/a | 2.5D scene graph in Python | **SKIP** (needs GL anyway, Godot/three.js cover it) |
| 16 | heygen-com/hyperframes | Apache-2.0 [V] | Seeks each frame in headless Chrome + FFmpeg; deterministic; Lambda path [V]; no speed claims [V] | none published | HTML/CSS/GSAP cards, captions; Node 22 [V] | **SIDE TOOL** for alpha cards; not engine core |
| 17 | redotvideo/revideo | MIT [earlier scout V] | headless browser | none | Code timelines, same CPU-Chrome cost model | **SKIP** (overlaps) |
| 18 | motion-canvas/motion-canvas | MIT [earlier V] | editor-centric; headless is revideo's job [V] | none | Generator-based animation synced to voice-over [V] | **SKIP** |
| 19 | remotion-dev/remotion (legacy `src/`) | Source-available Remotion License (company-size terms) [earlier V] | Yes; `--gl` angle/swangle/vulkan options, default concurrency half of threads [V] | Docs: `npx remotion gpu`, `benchmark` to tune [V] | Legacy EP001 engine | **FREEZE** (EP001 final); no new work; licence risk is the reason |
| 20 | theatre-js/theatre | `@theatre/core` Apache-2.0, `@theatre/studio` AGPL-3.0 [V] | browser | none | Keyframe editor UI; we author in Python | **SKIP** |
| 21 | pixijs/pixijs | MIT [V] | WebGL/WebGPU only [V] -> SwiftShader/llvmpipe | none | 2D scene graph in Chromium; same per-frame cost problem | **SKIP** (no gain over OpenCV) |
| 22 | tungs/timesnap (+timecut) | licence not shown [V]; MIT [M] | Virtualizes Date/rAF/setTimeout so each frame completes; screenshot mode slower than canvas mode; CSS animations not virtualized [V] | slower than real time by design [V] | Only for browser pages | **SKIP** (Hyperframes/Remotion already do this) |
| 23 | puppeteer-capture (azettl) | URL gave 404 [V] | uses CDP `HeadlessExperimental.beginFrame` [M]; BeginFrame needs `--run-all-compositor-stages-before-draw`, can fail on screenshot [V] | none | Deterministic Chromium capture | **SKIP** unless we drive three.js per frame |
| 24 | Mesa llvmpipe / lavapipe | MIT [M] | Yes (CPU OpenGL 4.5, Vulkan) [V: Ogre note says GL 4.5 since Mesa 20.3] | Microlink 4x vs SwiftShader [V] | Backend for moderngl/Godot/Chromium with no GPU | **USE** if any GL path is added |
| 25 | moderngl (+ glcontext EGL) | MIT [M] | `create_context(standalone=True, backend='egl')` with llvmpipe [V docs] | none | Fragment-shader post (grain, bloom, depth parallax) on CPU GL. 1440p llvmpipe throughput **[?]** | **TEST** as an alternative to numba |
| 26 | OpenTimelineIO + OpenTimelineIO-Plugins | Apache-2.0 [M] | n/a | n/a | Export cut as EDL/FCPXML/.otio from `lib.py` shot list; human editor can open it. EDL needs `rate` [V] | **ADOPT** (0.5-1 day) |
| 27 | mltframework/mlt (melt, Shotcut/Kdenlive engine) | LGPL [V] | Yes, multithreaded C engine [M] | none | XML project -> melt render; heavy new dependency | **SKIP**; ffmpeg+OTIO enough |
| 28 | airbnb/lottie-web / rlottie / Rive | MIT/ LGPL-2.1 / MIT [M, licence not stated in README] | browser or C lib | none | Vector animated stingers (logo, Navi) if authored in After Effects; we have no AE | **SKIP** |
| 29 | pygame-ce / pyglet / arcade / Kivy / vispy / pythreejs | LGPL / BSD / MIT / MIT / BSD / BSD [M] | pygame SDL dummy driver is CPU; others need GL | pygame surface blits are CPU C but no float/AA quality | Nothing they add beats OpenCV+Skia for our shots | **SKIP** (README for pygame returned 404; not verified) |
| 30 | ffmpeg `filter_complex` / libass for subtitles | LGPL/GPL tool | Yes | fast C | Final concatenation, burned Shorts captions (libass), loudness | **KEEP** |

(30 rows, 6 are "skip, listed for completeness".)

## 2. Orchestration and agent tooling

- **Shot-level parallelism (biggest, cheapest):** each block script already renders independent shots. Use
  `concurrent.futures.ProcessPoolExecutor(4)` over shot ranges, each worker writes a segment (`.mkv` or PNG-to-pipe), then
  `ffmpeg -f concat -c copy`. Existing `ep002-render-final.sh` runs blocks 2 at a time and heavy ones alone "for memory";
  per-shot workers with a plate cache shared by `fork` (copy-on-write) cut memory. Expect near-linear up to 4 cores **[?]**.
- **Cross-container farm:** the repo already uses GitHub Actions for delivery. A matrix job per block (each 4 vCPU runner)
  plus artifact upload and a final concat job is a free render farm for `final` quality. Note the Producer rule "final
  renders only with approval" still applies. Effort 1 day; limits: Actions runner time and 14 GB disk per job [M].
- **Subtitle formats:** SRT already shipped. Add WebVTT (trivial) and let OTIO carry markers. pysubs2 (MIT [M]) optional.
- **Agent skills for the engine:** `scale_check.py`, `framing_qc.py` and `pacing_qc.py` are already agent-friendly. Add one
  `render_profile.py` that prints per-layer milliseconds per frame, so Claude can see where time goes before choosing
  libraries. Godot MCPs and blender-mcp are only useful if those engines are adopted (see roadmap gate).

## 3. ENGINE ROADMAP (recommended)

Principle: **keep the Python shot-list engine, make it faster and richer; do not add a second engine until a 1-shot
prototype proves a gain.** The quality gap in the style bible (motion 29 % vs 56 %, cuts/min 8 vs 14) is mostly content
and motion design, not the rasterizer.

| Phase | What | Why | Effort | Gate |
|---|---|---|---|---|
| E0 | `render_profile.py`: time each stage (plate crop/resize, movers, fx, finish, subtitle, pipe) on one EP003 shot at `review` and `final` | Decide with numbers; none of the speeds above are ours | 0.5 day | none |
| E1 | **Frame dedupe + shot caching**: hash inputs, reuse identical frames; render static holds once | 70 % of frames are near-static; likely 2x with no quality loss | 1 day | E0 shows >40 % static |
| E2 | **Parallel shots** (ProcessPool x4) + concat; resumable per shot (extend `clip_ok.py`) | 3-3.5x on 4 cores [?] | 1-1.5 days | E0 |
| E3 | Port hot path to **OpenCV**: camera `warpAffine`, `remap` for breeze/idle warps, premultiplied-alpha over, finish pass (grain/vignette) in float32 with `cv2`; keep Pillow `alpha_composite` as golden test (pixel diff < 1 LSB) | 2-5x on image math [?], frees time for richer effects | 2-3 days | E0 shows Pillow dominant |
| E4 | `numba` kernels only where OpenCV has no primitive: halftone, depth-parallax (Depth Anything map from earlier scout), simplex noise water | Enables the "make it move" fixes the style bible asks for at 1440p | 1-2 days | E3 |
| E5 | **OTIO export**: shot list -> `.otio` + CMX3600 EDL + FCPXML, with clip names, narration audio track, markers at hook/"So, why?" | Producer or editor can open and trim the cut; also a durable record of edit decisions | 0.5-1 day | none; do it early |
| E6 | **skia-python for `ui_kit` cards** (rounded boxes, shadows, text shaping, SkSL shader for paper texture) rendered to premultiplied NumPy | Crisper vector UI at 2560x1440, resolution independent (replaces S()/F() juggling for cards) | 3-4 days | optional; only if card quality is a complaint |
| E7 | **Godot 4 prototype**: one 6 s shot (parallax plate + 2 cut-outs + particle + camera dolly) via `--write-movie`, PNG sequence, with `--rendering-driver opengl3` over llvmpipe; measure s/frame at 1440p | Real 2.5D (layered depth, lights, shaders) would solve "static" better than Python warps | 0.5 day test, 1-2 weeks to integrate if good | Only proceed if <= 3 s/frame at 1440p **and** works headless |
| E8 | Blender Cycles CPU sprite baking | only for a prop three.js cannot model; 1 prop = 0.5-1 day | on demand | Producer rule: Claude builds all 3D, free; scripted bpy, not the MCP |
| E9 | Actions matrix farm for `final` renders | 4 vCPU x N blocks in parallel; unattended after approval | 1 day | after E2 |
| Freeze | Remotion `src/`: no new work; Hyperframes only as a side tool for alpha cards | licence + three engines is too many | 0 | |

Total core path (E0-E5): about 6-8 working days. Most likely outcome of E1+E2+E3: final-quality render time cut to
roughly a third **[estimate, unmeasured]**. Do not rewrite the 21 EP002 block scripts; migrate behind `lib.py` functions
(`final()`, `place()`, camera) so old scripts keep working, and gate with `scale_check.py` plus a pixel-diff test.

## 4. Risks and open questions (need our own test)

- Godot `--write-movie` on CPU-only container (driver availability, 1440p s/frame). Mesa packages in the container: unknown.
- Whether `chrome-headless-shell` supports BeginFrameControl (not found in search).
- Python version: PyAV latest wants >=3.12 [V], OTIO binding 3.9-3.12 [V], we run 3.11: pin older PyAV or upgrade Python.
- Licences stated from memory [M] for OpenCV, skia-python (README states none; PyPI says BSD), numba, pyav: verify LICENSE
  files before vendoring. Theatre.js studio AGPL and Remotion are the only copyleft/source-available flags here.
- OpenCV alpha pitfalls [V]: transparent pixels handled wrongly if composited naively; write the golden test first.
- Depth Anything (earlier scout) + OpenCV remap is the cheapest route to 2.5D without Godot; try it before E7.

## Sources

- skia-python README https://raw.githubusercontent.com/kyamagu/skia-python/HEAD/README.md
- pixie-python README https://raw.githubusercontent.com/treeform/pixie-python/HEAD/README.md
- OpenTimelineIO README https://raw.githubusercontent.com/AcademySoftwareFoundation/OpenTimelineIO/HEAD/README.md and adapters docs https://opentimelineio.readthedocs.io/en/v0.15/tutorials/adapters.html
- Godot README / Movie Maker article https://godotengine.org/article/movie-maker-mode-arrives-in-godot-4
- Microlink llvmpipe vs SwiftShader https://microlink.io/blog/webgl-without-a-gpu
- Hyperframes README https://raw.githubusercontent.com/heygen-com/hyperframes/HEAD/README.md
- Panda3D README https://raw.githubusercontent.com/panda3d/panda3d/HEAD/README.md ; forum threads on offscreen/tinydisplay https://discourse.panda3d.org/t/running-headless/23665
- Blender headless threads https://devtalk.blender.org/t/blender-2-8-unable-to-open-a-display-by-the-rendering-on-the-background-cycles/8607 ; Grease Pencil bug https://projects.blender.org/blender/blender/issues/75952
- blender-mcp https://raw.githubusercontent.com/ahujasid/blender-mcp/HEAD/README.md
- Godot MCP listings (Erodenn, koltyakov, tugcantopaloglu, PiMPStudios) via search
- timesnap https://raw.githubusercontent.com/tungs/timesnap/HEAD/README.md
- CDP HeadlessExperimental https://cdpstatus.reactnative.dev/devtools-protocol/tot/HeadlessExperimental
- Remotion chromium flags / GPU https://www.remotion.dev/docs/chromium-flags
- Pillow performance https://python-pillow.org/pillow-perf/ ; OpenCV adding images https://docs.opencv.org/4.10.0/d5/dc4/tutorial_adding_images.html
- moderngl headless https://moderngl.readthedocs.io/en/5.8.2/techniques/headless_ubuntu_18_server.html
- Theatre.js licence split via npm @theatre/studio / @theatre/core README
- Manim, MLT, PixiJS, PyAV, numba READMEs (raw.githubusercontent.com)
