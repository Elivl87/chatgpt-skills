# Deep scout (second pass): 2D animation quality for SecondQuest (2026-10-12)

Scope: tools that raise the *look and motion* of our Pillow/NumPy -> ffmpeg pipeline. Does **not** repeat the first scout
(`2026-10-12_github_scout_production.md`: Depth Anything V2 Small, Rhubarb, claude-motion-design, ffmpeg-skill, opensimplex,
pyloudnorm, jsfxr, whisper captions, rembg/BiRefNet, pytweening). Where an item overlaps (AnimatedDrawings) it adds a new angle.
Nothing was installed or run. Speeds are NOT measured; "est." = my estimate.

**Method / confidence labels.** `V` = licence read in the LICENSE/README/site text this session. `S` = only from a search
snippet or third-party listing. `U` = unverified (fetch 404/403 or silent README); check the LICENSE before adopting.
Rule applied: GPL/AGPL/LGPL tools may be *used* (output is ours); flagged "no copy" if we would lift code. Non-commercial
(NC) assets/models are rejected.

Current problem to solve (STYLE_BIBLE, EP003 v3): 29 % of frames show motion (target >= 50 %, hook >= 90 %), 8.2 cuts/min
(target >= 12), cut-outs do not move, water/sky are still, shots too long.

---

## 1. Cut-out / puppet / rigging runtimes

| # | Tool | What it is | Licence | CPU/headless | Use in SecondQuest | Effort | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | **Inochi2D** (Inochi2D/inochi2d) + Inochi Creator | Open Live2D alternative: layered PSD -> mesh puppet driven by parameters (blink, head turn, mouth). Reference lib in D, C header, Unity/Godot bindings. | BSD-2 (V, repo LICENSE) | Needs an OpenGL 3.1 core context (S). No Python binding or headless mode documented (V: README silent). Mesa llvmpipe + EGL might work: untested. | Quest/Pixie head-turn, blink, breathing from layers. But our art is generated flat stills: it needs a layer split (hair/eyes/mouth/face) = new art or SAM cut-outs, and the editor (Inochi Creator) is a GUI. | L (days + GUI rigging) | **SKIP now**, revisit if we ever get layered character art |
| 2 | **Inox2D** (Inochi2D/inox2d) | Rust port of the Inochi2D renderer with OpenGL and wgpu backends | BSD-2 (S: docs.rs listing) | wgpu could run on SwiftShader/llvmpipe, headless unstated (S). Officially "prototype, not for production". | Only a way to render an .inp puppet without D. | L | **SKIP** |
| 3 | **Rive runtime** (rive-app/rive-runtime) | C++ runtime for `.riv` state-machine animations | **MIT (V, LICENSE file)** | GPU renderers (Metal/Vulkan/GL) listed; headless/CPU not documented; no Python. Authoring needs the Rive editor (web app, closed, plans/terms not checked). | Interactive-UI style assets; nothing our Python can drive. | L | **SKIP** |
| 4 | **Spine runtimes** (EsotericSoftware) | Industry-standard skeletal 2D | Runtimes need every *user* to hold a Spine Editor licence (V: LICENSE says "each user of the Products must obtain their own Spine Editor license") | n/a | Paid editor, closed workflow. | - | **SKIP** |
| 5 | **DragonBones** (DragonBonesJS runtimes) | Skeletal 2D format, JS runtimes for Egret/Pixi/Phaser/Hilo/Cocos | U (README shows only a copyright line) | Would run in headless Chromium via PixiJS; unproven | Editor ecosystem is China-centred and fading (README now points to LoongBones). | M | **SKIP** |
| 6 | **Synfig** (synfig/synfig) | Free 2D vector+bitmap animation with a Skeleton layer, bone rigs, tweening; renders with a CLI (`synfig -t png -o out --time ...`, `--targets`, `-q`) | GPL-3.0 (V, README). Use as a tool = fine; output is ours; do not copy code. | CLI renderer is packaged separately from the GUI (S: Fedora split), so headless is plausible; GUI needed to author. | A skeleton-rigged bitmap puppet (limbs as bitmap layers) rendered to PNG sequences. Real option but heavy to author and our Python already does transforms. | L | **SKIP** (TRY only if we want one hand-built set-piece) |
| 7 | **OpenToonz / Tahoma2D** | Studio Ghibli-lineage 2D software; has bitmap + vector, plastic (mesh) tool | Modified BSD (V OpenToonz README; Tahoma2D BSD-3 S) | CLI renderer (`tcomposer`) not confirmed in any source seen (U) | Hand-drawn / frame-by-frame workflow, not ours. | L | **SKIP** |
| 8 | **Pencil2D** | Hand-drawn animation app | GPL-2 (U: README silent; from memory) | no CLI export confirmed | Not our method. | - | **SKIP** |
| 9 | **Krita** `--export-sequence` | Painting app; headless export of animation PNG sequence from `.kra` (V, docs.krita.org) | GPL-3 (from memory, U) | CLI documented; display-less run untested | Only if the Producer ever supplies hand-drawn animation. | S | **SKIP** |
| 10 | **Blender Grease Pencil headless** (bpy) | Full 2D/3D suite; GP is drawn through OpenGL, so headless needs Mesa/Xvfb | GPL (tool use is fine; output is ours) | Known history of GP breaking on GPU-less render farms (S: Blender bug tracker threads T85035, T85546). Cycles/Workbench on CPU are fine for *meshes*. | If we want true multiplane parallax with perspective camera: textured planes at depths rendered by Cycles CPU is possible, but three.js in headless Chromium already does this for free in our stack (see #28). | L | **SKIP** |
| 11 | **AnimatedDrawings** (facebookresearch) | Extra angle on the first scout: MIT **code, weights and dataset (V)**; headless MP4/GIF via `USE_MESA: True` (V, README); characters defined by `char_cfg.yaml` + `texture.png` + `mask.png`; **BVH motion retargeting** (any BVH) and **ARAP mesh deformation in `animated_drawings/model/arap.py`** (V). TorchServe is needed only for *auto-rigging*; we can hand-write the skeleton yaml. | MIT (V) | CPU + Mesa documented; auto-rig step needs Docker (~16 GB RAM, V) | (a) walk/run/jump cycles for Quest and Pixie from BVH data instead of hand-keyed sine; (b) **port `arap.py` and BVH retarget math into our `lib.py`** (MIT permits copying with notice). Check BVH sources' licences separately (CMU mocap terms: from memory "free for all uses", U; Rokoko/Mixamo: Mixamo has account/terms, skip). | M-L | **TRY** (one 1-day spike: side-view Quest walk) |

Takeaway: no off-the-shelf rig runtime fits "generated flat stills + Python + CPU". The cheap winning path is **our own
mesh warp (OpenCV `remap`/ARAP port) on SAM-cut layers** (items 11, 16, 17).

## 2. Vector/2D rendering engines (better than Pillow)

| # | Tool | What it is | Licence | CPU/headless | Use | Effort | Verdict |
|---|---|---|---|---|---|---|---|
| 12 | **skia-python** (kyamagu) | pybind11 wrapper of Google Skia: AA paths, strokes with caps/joins/dashes, gradients, blur/drop-shadow image filters, blend modes, text | **BSD-3 (V)** (Skia itself BSD-3, from memory) | Raster (CPU) surfaces exist in Skia; wheels for Linux x86_64/aarch64; **Linux needs OpenGL/libEGL/fontconfig packages installed even for CPU use (V, README)**. NumPy interop via buffer protocol (U). | The single best upgrade for **anti-aliased shapes, ink outlines with variable stroke, soft shadows, light wraps, glows, rounded cards, gradient skies, path-based water ripples**. Draw at 1280x720 design units with true AA and `MaskFilter.MakeBlur` instead of Pillow supersampling hacks. | S-M (1-2 days: wrapper in lib.py) | **ADOPT** |
| 13 | **pycairo / cairocffi** | Cairo 2D (paths, gradients, AA, groups/masks) | pycairo LGPL-2.1 or MPL-1.1 (V); **cairocffi BSD-3 (V)** | Image surfaces are pure CPU | Fallback to skia if the wheel/EGL install is a problem; also what Manim/cairosvg use. | S | **TRY as fallback** |
| 14 | **ThorVG** (thorvg/thorvg) | Tiny C++ vector engine, **CPU software renderer with AVX2 SIMD**, SVG + Lottie loaders, partial redraw; Python bindings `thorvg-python` (docs show a software canvas, `LottieAnimation`, `canvas.get_pillow()`; S) | **MIT (V, README badge)**; python binding licence U | Yes, designed for CPU | Render SVG/Lottie props and animated UI icons to Pillow frames; also a fast path for many small vector layers (particles as vector dots). Benchmarks in its README are self-reported on an M2 Pro (V). | S-M | **TRY** |
| 15 | **resvg** (linebender/resvg) | Reference-quality SVG renderer (Rust), pixel-reproducible across platforms | **Apache-2.0 OR MIT (V)**. Python wrappers `resvg` / `resvg-py` exist (S); their own licences U. | Yes | Our 3D-prop ink outlines and icon sets are SVG: deterministic crisp rasterisation at any size (Lucide/Tabler/Phosphor, EP logos, wordmark). Static only (no animation). | S | **TRY** |
| 16 | **Blend2D** | 2D engine with JIT pipelines, very fast | zlib (V, README) | CPU/JIT; **no Python binding confirmed** (V: README points to a bindings page) | Would beat skia on speed only if a binding existed. | - | **SKIP** (revisit if bindings appear) |
| 17 | **vispy** | GPU scientific viz | BSD (V) | Needs GL; redundant with moderngl | - | - | **SKIP** |
| 18 | **Pillow-SIMD** (uploadcare) | Drop-in Pillow fork with SIMD resize/blur/convolve | HPND-style (U: README fetch 404) | Must be compiled with AVX2, replaces Pillow (conflict risk) | Faster `resize`/`GaussianBlur` in `finish.py`, pacing. Gain only matters if Pillow is the bottleneck: measure first. | S | **SKIP until profiled** |
| 19 | **Manim Community** (ManimCommunity/manim) | Python animation engine: Bezier path morphing, `Create`/`Write`/`DrawBorderThenFill` stroke draw-on, `ReplacementTransform`, value trackers, always-redrawers; cairo renderer | **MIT (V)** | Cairo renderer is CPU; LaTeX optional; headless via CLI, display-less run untested | **Draw-on charts, timelines, arrows, hand-drawn-style map routes, number counters** for the "explainer" shots between character scenes: cheap source of *motion in frames that are now static cards*. Render to PNG sequence with transparent bg (`--transparent`) and composite. | M | **TRY** |
| 20 | **Revideo / Motion Canvas** | TS generator-based animation, headless render in a browser | Revideo MIT (S, README badge); Motion Canvas licence U (believed MIT) | Same headless Chromium we already use | Good reference for tween/signal/"flow" API design; we would not add a second renderer. | M | **SKIP** (read-only reference) |

## 3. Motion / animation math, physics, secondary motion

| # | Tool | What it is | Licence | CPU | Use | Effort | Verdict |
|---|---|---|---|---|---|---|---|
| 21 | **pymunk** (viblo/pymunk) | Python Chipmunk/Munk2D rigid-body 2D physics: bodies, springs, joints, constraints, collisions | **MIT (V, README 2007-2026)**; one dep CFFI (S) | Pure CPU, no loop required ("non-intrusive") | The *"launched across the island"* gag: real ballistic arc with bounces, tumbling props, rolling rupees, falling crates, ragdoll chain (pin joints) for Quest being flung, pendulum lanterns. Step at 1/120 s, sample at 24/30 fps, draw sprites at body pose. Export trajectory to JSON so animatic blocks can reuse it. | S (1 day) | **ADOPT** |
| 22 | **pyfabrik** | 2D FABRIK inverse kinematics | MIT (S) | Pure Python, "API very unstable" | Arm reaching for objects, tail/tentacle follow. It is ~40 lines to write ourselves (2-bone analytic IK covers arms/legs). Use as reference only. | S | **SKIP** (write 40 lines) |
| 23 | **pyPBD** (Jan Bender) | Position-based dynamics (cloth, FEM, strain) with Python bindings | MIT (S) | C++ ext; heavy build | Overkill for a cape. Own Verlet+distance-constraint chain (50 lines NumPy) does capes, hair strands, ropes, banners, lantern cords. | M | **SKIP** (write own) |
| 24 | **Harmonica** (charmbracelet, Go) | Reference for Ryan Juckett closed-form damped springs | MIT (S) | n/a | Read-only for the closed-form constants; the first scout already covers the spring helper. | - | **SKIP** (reference) |
| 25 | **Taichi** (taichi-dev) | Python JIT with CPU backend for particle/fluid/PBD kernels | Apache-2.0 (S) | x64/ARM CPU backend (S). Python-version support per release must be checked (listing seen was old). | Dust, sparks, embers, snow, water splashes, thousands of particles. NumPy vectorised particles (with the first scout's noise) are enough up to ~10^4 sprites. Adopt only if NumPy profiling fails. | M | **SKIP** (fallback) |
| 26 | **scikit-image `PiecewiseAffineTransform` / OpenCV `remap`** | Grid mesh warps for squash-and-stretch, breathing, flag/cape waves | scikit-image BSD (U: not retrieved); OpenCV Apache-2.0 (U: from memory) | skimage warp is slow at 720p; `cv2.remap` with a coarse grid is ms (est.) | Already proposed in the first scout (#5); concrete tool pick: **build the displacement map with NumPy on a coarse grid, upscale, `cv2.remap`**; no extra lib needed. | S | **ADOPT (technique)** |
| 27 | **kornia** | PyTorch geometry/filters (`warp_image_tps`, motion blur, gaussian) | Apache-2.0 (V) | Needs PyTorch | Only valuable if PyTorch is already installed for other models. | S | **SKIP** |

Own-build items (no repo needed, high payoff): **ink "line boil"** (re-sample outline displacement every 2-3 frames with
low-freq noise), **hold-and-pop "on twos/threes"** timing for characters (animation feel at no cost), **smear/motion-stretch
frames** on fast moves, **overshoot-and-settle** entrances (the STYLE_BIBLE already lists eased entrances with overshoot).

## 4. Shaders and effects on CPU

| # | Tool | What it is | Licence | CPU/headless | Use | Effort | Verdict |
|---|---|---|---|---|---|---|---|
| 28 | **three.js props in headless Chromium (already ours) + pmndrs/postprocessing** | Chromium headless renders WebGL through **SwiftShader/ANGLE** (the CPU Vulkan implementation below) | postprocessing **zlib (S)** (derived from MIT three.js code) | Already our path | Add `FilmPass`/Noise, ChromaticAberration, Bloom, Vignette, Outline, Depth-of-field, toon/outline shading to the 3D props for the "ink outline" DNA. **Multiplane parallax for plates**: put each cut-out layer on a plane at depth in three.js with a perspective camera = true parallax without depth-map inpainting; needs layer cut-outs (#34). Check per-effect headers for CC-BY pieces (S: a fork notes a CC-BY film effect). | M | **TRY** |
| 29 | **SwiftShader** (google/swiftshader) | CPU Vulkan 1.3; GLES via ANGLE ("SwANGLE") | **Apache-2.0 (V)** | Yes | Not a thing to install; it is what makes headless WebGL work. Knowing it lets us pick `--use-angle=swiftshader` flags deliberately when props render black. | - | **ADOPT (awareness)** |
| 30 | **moderngl** + `glcontext` headless (EGL) + **Mesa llvmpipe** | Python OpenGL 3.3+ wrapper; `create_context(standalone=True, backend='egl')`; `pip install moderngl[headless]` (V, README) | **MIT (V, LICENSE)** | Mesa llvmpipe is a CPU GL (S: documented working in GPU-less Docker; install `libegl1`, `libgl1-mesa-dri`, check renderer string). Speed est. a few fps for heavy shaders at 720p; fine offline. | One shader pass for **light wrap, halation/bloom, chromatic aberration, heat-haze displacement, god rays, water refraction, radial blur, tilt-shift, film grain** with one fragment shader each, and **parallax displacement from a depth map** (we write the 30-line shader ourselves: removes any dependence on DepthFlow's licence). NumPy equivalents exist but slower for blur chains. | M | **ADOPT** |
| 31 | **gl-transitions** (gl-transitions/gl-transitions) | ~100 GLSL transitions, uniform `progress`; JSON with per-transition `license` field | **Per transition (V: README says each file declares its licence, e.g. MIT)** - use only entries whose header says MIT/CC0/public domain; log the choice. Libs repo (gl-transition-libs) has a headless renderer on `headless-gl` (V) but it breaks on newer Node (V). | Runs on our moderngl pass or Chromium | Cuts-per-minute fix: wipes, ink-bleed, page-curl, directional warp between scenes at the right beats. Use moderngl port of 5-8 licence-clean transitions. | S-M | **TRY** |
| 32 | **ffmpeg built-ins** (tool use) | `xfade` (~50 transitions), `tmix`/`tblend` (frame-blend motion blur), `rgbashift`/`chromashift` (chromatic aberration), `gblur`+`blend=screen` (bloom/halation), `noise=alls=..:allf=t` (grain), `vignette`, `lut3d`, `displace`/`remap`, `zoompan`, `lenscorrection` | LGPL/GPL tool, output ours | Yes | Can express the whole `finish.py` and most transitions as one filter graph per scene; cheap A/B against our NumPy code. Note that this pass must obey the existing rule: finish.py last. | S | **ADOPT** |
| 33 | **G'MIC / gmic-py** | 500+ image filters (cartoon, painting, film grain, light leaks, glow, boil) with Python binding | **CeCILL-2.1 (S, PyPI metadata)**, GPL-compatible: fine as a tool, no copying | CPU, Linux x64 wheel (S). Binding docs were removed during a rework (S) | Rich filter library to *try looks* quickly on a still (e.g. ink-wash, posterise), then reimplement the winner in NumPy/skia if a dependency feels fragile. | S | **TRY (look-dev only)** |
| 34 | **MobileSAM** (ChaoningZhang/MobileSAM) | Segment Anything distilled for CPU | **Apache-2.0 (V, LICENSE)** | "~3 s on a Mac i5 CPU" (V, README) | Cut Quest/Pixie/props from a still using box prompts into transparent layers for parallax, mesh warp, and rig. Better than the rejected BiRefNet/rembg on arbitrary objects; weights licence tracks SAM (Apache; U). Generated art stays untouched (we only derive masks). | M | **TRY** |
| 35 | **glslViewer** | CLI GLSL sandbox: headless mode, PNG-sequence export, Shadertoy-compatible | U (README silent; believed BSD-3) | Yes (V: headless in feature list) | Redundant with moderngl. **Warning: Shadertoy shaders default to CC BY-NC-SA 3.0 (from memory, U): never port random Shadertoy code.** | - | **SKIP** |
| 36 | **Film emulation (halation/grain/CA)** | No dedicated Python repo found. Search surfaced ComfyUI-Darkroom (U) only. | n/a | n/a | Implement ourselves: halation = threshold highlights, red-tinted wide blur, screen blend; grain = luminance-weighted noise; CA = per-channel radial scale. All three are 15 lines in NumPy or one moderngl shader. | S | **BUILD** |

## 5. Image-to-motion on CPU

| # | Tool | What it is | Licence | CPU feasibility | Use | Effort | Verdict |
|---|---|---|---|---|---|---|---|
| 37 | **DepthFlow** (BrokenSource/DepthFlow) | GLSL ray-marched parallax from image + depth, loops, supersampling, ffmpeg piping | **U**: LICENSE paths 404; README says "commercial use encouraged" (V) but states no licence; I recall AGPL-3 (U). Tool use would still be fine; do not copy shader code if AGPL. | README targets GPU (8k @ 50 fps on RTX 3060). A GL 3.3+/4.x shader should run on llvmpipe, headless unconfirmed. | Same job as our own #30 parallax shader plus nice loop presets (circle/dolly/zoom). | S if it works | **TRY after licence check**; else rely on #30 |
| 38 | **3d-photo-inpainting** (vt-vl-lab) | Layered depth + inpainted background to give swing/zoom/dolly videos from one photo | **MIT (V)** | CUDA-era code (CUDA 10.1, PyTorch 1.4; V); 2-3 min on GPU. CPU is impractical (est. tens of minutes per plate) and the env is dated | Fixes the disocclusion holes that plain depth displacement shows. Cheaper substitute: dilate foreground mask + `cv2.inpaint` on the background layer, once per plate. | L | **SKIP** (copy idea only) |
| 39 | **MiDaS** (isl-org) | Depth estimator; small model OpenVINO on Intel CPU ~22 fps at 640x480 (V) | **MIT (V)** | Yes | Redundant with Depth Anything V2 Small from the first scout. | - | **SKIP** |
| 40 | **RIFE / Practical-RIFE** (hzwer) | Frame interpolation. v4.25/4.26 recommended; v4.7-4.10 tuned for anime (V) | Code **MIT (V)**; README says model downloads are "under the same MIT license" (V). Trained on Vimeo90K (research dataset terms: U). | README is GPU-only on speed (2080Ti); CPU torch works in principle (U). `rife-ncnn-vulkan` offers `-g -1` for CPU but wants a Vulkan loader (V); its licence U (believed MIT). | Our frames are rendered procedurally, so we *render* in-betweens ourselves; interpolation would smear limited-animation "on twos" and produce cartoon ghosting. Possible use only for slow-motion of a *camera push* at 24 -> 48 fps. | M | **SKIP** |
| 41 | **FILM** (google-research/frame-interpolation) | Large-motion interpolation | **Apache-2.0 (V)** | TF stack built for NVIDIA GPU (V); CPU only for debug | Same objection as RIFE. | M | **SKIP** |
| 42 | **Real-ESRGAN** (xinntao) | Upscaler incl. `realesr-animevideov3` | **BSD-3 (V, LICENSE)** | PyTorch CPU works but slow (est. minutes per 1080p frame); ncnn builds target Vulkan GPUs (V). | If the `final` 2560x1440 export needs sharper generated plates: upscale each *plate once* and cache. **Touches art pixels**: Producer rule says generated art is not modified; propose to the Producer as an output-stage upscale, not an edit. | S per plate | **TRY (needs Producer OK)** |
| 43 | **Anime4K** (bloc97) | GLSL line-thin/denoise/upscale shaders | **MIT (V)** | Port to moderngl | Optional crisp-line upscaling inside #30. | M | **SKIP** (not needed yet) |

Not considered: ToonCrafter/AnimateAnyone/LivePortrait/Wav2Lip/SadTalker class (GPU, and typically non-commercial
weights or datasets); Quest is a cartoon, not a photographic face.

## 6. Compositing / editing headless

| # | Tool | What | Licence | Use | Verdict |
|---|---|---|---|---|---|
| 44 | **MoviePy** | Numpy->ffmpeg editing wrapper | MIT (V); v2 broke the API (V); "slower than ffmpeg directly" (V) | We already pipe frames; adds nothing. | **SKIP** |
| 45 | **MLT / melt** | Multitrack engine behind Shotcut/Kdenlive; XML projects, filters, transitions | LGPL (V, README text) | Alternative assembler for multi-track audio + video with crossfades. Our ffmpeg graph already does this. | **SKIP** |
| 46 | **Natron** | Node compositor, headless batch render, Python scripting | **GPLv2 (V)**, tool use OK | A node graph for light wrap/glow is a real VFX option but the project is old and heavy; moderngl pass beats it for our needs. | **SKIP** |
| 47 | **VapourSynth** | Python frame-server with temporal filters | LGPL-2.1 (U: from memory) | Frame-blending motion blur and denoise; ffmpeg `tmix` covers it. | **SKIP** |
| 48 | **OpenTimelineIO** | Edit-decision interchange (Python) | open source, licence name not shown in README (U; believed Apache-2.0) | Could hold our shot list for pacing QC; our JSON already does. | **SKIP** |
| 49 | **OpenFX** | Plugin API for compositors | BSD (U) | Irrelevant without a host. | **SKIP** |

## 7. Commercial-OK asset sources

| # | Source | Licence verified | Notes / caveats | Use | Verdict |
|---|---|---|---|---|---|
| 50 | **ambientCG** (textures, PBR, HDRIs) | **CC0 (V, docs.ambientcg.com/license)**; no attribution; credit line suggested | Paper, cardboard, fabric, plaster, wood, sand, water-like normal maps | Material maps for `tools/props3d`; paper/fibre overlays for the finish pass | **ADOPT** |
| 51 | **Poly Haven** (HDRIs, textures, models) | **CC0 (V, polyhaven.com/license)** | Terms forbid scraping/mining; API has separate terms (V). Download by hand. Site renders/UI are not CC0. | HDRIs for prop lighting; textures; a few models | **ADOPT** |
| 52 | **Kenney** | **CC0 (V, kenney.nl/support)**; do not use Kenney logo | 2D sprite packs, 3D kits, UI, audio | Prop shapes, UI sprites, SFX (already suggested for audio) | **ADOPT** |
| 53 | **Quaternius** | **CC0 (V, FAQ states all models CC0)** | Low-poly characters, animals, props, rigged/animated GLB | Base meshes to restyle in props3d, or three.js scene dressing | **ADOPT** |
| 54 | **Poly Pizza** | **Mixed per model (S: CC0 and CC-BY 3.0 appear; FAQ returned 403)** | Filter to CC0 only; record author/licence if CC-BY (credit in description) | Occasional prop reference | **TRY, CC0 only** |
| 55 | **Lucide** | **ISC + MIT for Feather-derived icons (V)** | Keep notices in repo licence file | UI/HUD-like icons in cards (not for the game-world HUD) | **ADOPT** |
| 56 | **Tabler Icons** | **MIT (V)** | ~5000 stroke icons | Same | **ADOPT** |
| 57 | **Phosphor Icons** | **MIT (V)** | 6 weights per icon | Same | **ADOPT** |
| 58 | **game-icons.net** | **CC-BY (V, README)** | Attribution required per icon author | Game-flavoured silhouettes; only if we credit in the description | **TRY with credits** |
| 59 | **OFL fonts** (Google Fonts) | OFL/Apache/UFL per family (U: not fetched; from memory) | Check the licence file per family; some are Apache or Ubuntu Font Licence; output rendering is not restricted by OFL | Titles, cards | **ADOPT (per-family check)** |
| 60 | **LUTs** | **Q-DDL 800+ LUTs are CC BY 4.0 (S)**; FreeVisuals packs claim commercial use (S, marketing page); cinecom free pack **forbids commercial use (S)** | No CC0 LUT pack found. We can author our own `.cube` from a few curve and tint lines; our palette is fixed anyway (brown/gold/sky blue) | Warm/dusk/night grades per episode | **BUILD own; Q-DDL only with credit** |
| 61 | **Paper / grain / halftone textures** | Bokobozhanov "5 FREE Paper Textures" **CC0 (S)**; halftone packs found were paid or unlicensed | Halftone is generated in `finish.py` already; ambientCG paper covers the rest | Paper-grain overlay | **ADOPT ambientCG paper; generate halftone** |
| 62 | **Lottie asset marketplaces (LottieFiles, etc.)** | Per-asset licences (U) | Many are non-commercial or require attribution; ThorVG would render them, but do not harvest | - | **SKIP** (legal risk) |
| 63 | **Shadertoy shaders / Mixamo animations** | Shadertoy default CC BY-NC-SA 3.0 (U, from memory); Mixamo is account/Adobe terms (U) | Non-commercial or restricted: avoid | - | **SKIP** |

Tools that need credit lines for output: **game-icons.net (CC-BY), Q-DDL LUTs (CC-BY 4.0), any Poly Pizza CC-BY model**.
Everything else on the ADOPT list needs none (the repo rule still asks for a licence file + `SOURCES.md` entry).

---

## The 8 best (ranked by impact on the "static" problem vs cost)

1. **skia-python (#12)**: real AA/strokes/blur/gradients; BSD-3; the foundation for crisper shapes and soft shadows.
2. **pymunk (#21)**: real flung/tumbling physics for comic gags; MIT; CPU; 1 day.
3. **moderngl + EGL + Mesa (#30)** with our own parallax/light-wrap/halation/transition shaders: CPU GL, MIT.
4. **MobileSAM (#34)**: Apache-2.0, ~3 s per image on CPU; produces the layers that parallax, mesh warp, rigging and multiplane three.js all need.
5. **ffmpeg built-ins (#32)**: xfade, tmix motion blur, rgbashift CA, bloom, grain, vignette as one filter graph; zero new deps.
6. **AnimatedDrawings code (#11)**: MIT; port its ARAP + BVH retarget for walk/jump cycles; headless via Mesa documented.
7. **Manim Community (#19)**: MIT; draw-on diagrams, arrows, chart builds for the many "card" shots that are static today.
8. **ThorVG / resvg (#14, #15)**: CPU vector engines for SVG/Lottie icons and ink-outline props; MIT / Apache-OR-MIT.

Everything on the ADOPT/TRY lists is free and CPU-only. Next most valuable *builds* (no repo): idle-warp module (#26),
Verlet cape/hair/rope, 2-bone IK, line-boil, on-twos timing, halation/grain/CA shader.

## Open licence checks before any adoption
- DepthFlow LICENSE (404 on 3 paths); thorvg-python, resvg-py, Pillow-SIMD, glslViewer, DragonBones, rife-ncnn-vulkan licences.
- Poly Pizza FAQ (403); Google Fonts family licences; per-transition gl-transitions headers; pmndrs per-effect headers.
- skia-python: wheel needs `libEGL`/`libGL`/`fontconfig` packages on the container (V); confirm `import skia` works with no GPU before committing.
- BVH sources: pick one with explicit commercial terms before shipping a retargeted motion.
- Real-ESRGAN upscaling of generated plates: Producer decision (art is not modified).
