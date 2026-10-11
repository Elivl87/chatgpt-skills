# Deep scout (pass 2): curated "awesome" lists mined for SecondQuest and Tiny Systems

Date: 2026-10-12. Nothing installed. Method: READMEs fetched from raw.githubusercontent.com, plus a few web searches.

Channels: SQ = SecondQuest (2D cartoon, Quest and Pixie, Python frame engine + three.js props, CPU only). TS = Tiny Systems (agent-based sims, 3-ink halftone print look).

Licence tags:
- V = verified this session, either in the list text itself (e.g. "CC0") or by web search.
- M = from memory, NOT verified this session. Check the repo LICENSE before adopting.
- FLAG = restriction or ambiguity that matters for commercial use.

Rule applied: tools may be GPL (we only use their output). Assets must be CC0, CC-BY or permissive. Never NC.

## Lists mined, and what came back

| Requested list | Result |
|---|---|
| terkelg/awesome-creative-coding | Read (57 KB). Mostly JS and learning links. Useful: py5, shoebot, Paper.js, Zdog, lygia (see flag), textmode.js, noise and flow-field tutorials. |
| kosmos / camilleroux awesome-generative-art | Read. Mostly VJ tools and NFT platforms. Little we can use. |
| awesome-animation | The repo that exists (Animatious) is an iOS/Android UI-motion list from 2016. Useless. Use sergey-pimenov/awesome-web-animation and fliptheweb/motion-ui-design instead. Both read. |
| awesome-motion-design | Not found under any name tried. Closest: awesome-motion-design-web (lucasmaiaesilva), not fetched. |
| awesome-procedural-generation, awesome-shaders, awesome-python-graphics, awesome-simulation, awesome-agent-based-modeling | No README found under the names tried. Web search found no dedicated ABM awesome list. Covered through awesome-python (Science > Simulation and Modeling), vanrez-nez/awesome-glsl, awesome-blender, rht/abm_framework_comparisons and mxgmn/WaveFunctionCollapse. |
| awesome-gamedev | Read Calinou/awesome-gamedev (it lists a licence per item, the most useful list here), Kavex/GameDev-Resources and ellisonleao/magictools. |
| awesome-cc0 / awesome-uncopyright | Read madjin/awesome-cc0 and johnjago/awesome-uncopyright. |
| awesome-audio / music / linuxaudio / webaudio | Fetched ciconia/awesome-music, nodiscc/awesome-linuxaudio, faroit/awesome-python-scientific-audio, hwclass/awesome-sound, notthetup/awesome-webaudio. I only mined their gamedev-list and cc0-list equivalents; these were skimmed lightly. |
| awesome-ffmpeg | Read (transitive-bullshit). Small list. |
| awesome-webgl, threejs, blender, design-systems, fonts, icons, dataviz, audio-visualization | All read (sjfricke, AxiomeCG, agmmnn, alexpate, brabadu, notlmn, fasouto, willianjusten). Findings below. |

## Biggest finds and traps (read this first)

1. **Mesa is Apache-2.0, not MIT** (V, PyPI via search). Still permissive. Fine for TS. Correct the brief.
2. **lygia (shader library, listed by terkelg and threejs lists) is FLAG.** It is dual-licensed Prosperity (non-commercial) plus a Patron licence that needs a sponsorship or a merged PR. Its mixbox colour functions have a separate non-commercial licence (V, search). Treat as NC. Do not paste lygia code into shipped shaders unless we sponsor. Write our own noise or use MIT alternatives.
3. **Shadertoy shaders default to CC BY-NC-SA 3.0 (M).** Do not copy them. Same caution for The Book of Shaders text (M, CC BY-NC-ND). Learning only.
4. **awesome-cc0 is the best asset hub**: Kenney, Quaternius, Poly Haven, ambientCG, The Base Mesh, Smithsonian Open Access, Openclipart, FreePD, plus CC0 filters on Freesound and Free Music Archive (V, list text). Several sub-items on those hubs are mixed-licence, so filter to CC0 every time.
5. **Sound tools that make our own SFX are the safest SFX route**: jsfxr (Unlicense), sfxr-sdl and Bfxr (MIT/Expat), rFXGen (zlib), Glasan-FX (MIT) (all V, gamedev list). Output of a generator is ours.
6. **Noto, Inter, and the League of Moveable Type fonts are open fonts (OFL, M)**. Google Fonts files are OFL (V, gamedev list). OFL allows commercial use of video output.
7. **game-icons.net is CC-BY-3.0 (V)**. Needs credit in the video description. OpenMoji is CC BY-SA 4.0 (M, FLAG for share-alike; avoid).
8. **python-lottie is AGPL (M, FLAG)**; the standard lottie-web runtime is MIT (M). We probably do not need Lottie at all.

## 1. Characters and animation (SQ)

| # | Item | Link | Licence | What it gives us | Channel | Verdict |
|---|---|---|---|---|---|---|
| 1 | Synfig Studio | synfig.org | GPLv2+ (V, gamedev list) | Vector 2D animation with bones and tweening. Has a CLI renderer, so it can run headless on CPU. Tool GPL is fine, output is ours. | SQ | TRY (Quest/Pixie cutout rigs) |
| 2 | Blender COA Tools | github.com/ndee85/coa_tools | M (GPL likely) | 2D cutout animation in Blender, like Spine. Renders headless with Blender CLI (CPU Eevee/Workbench). | SQ | TRY |
| 3 | Blender Grease Pencil + GreaseWriter | github.com/doakey3/GreaseWriter | M | Auto-animated hand-drawn strokes and handwriting text. | SQ | TRY |
| 4 | Malt (NPR renderer for Blender) | malt3d.com | M | Non-photorealistic, toon and print-style rendering framework. Strong fit for the halftone look. | TS, SQ | TRY |
| 5 | Pencil2D | pencil2d.org | M (GPL) | Frame-by-frame drawing; backup option for hand-drawn bits. | SQ | SKIP (the Python engine already covers it) |
| 6 | OpenToonz / Tahoma2D | opentoonz.github.io | M (BSD-3 variants) | Deep traditional 2D toolchain. Search could not confirm licences, so unverified. | SQ | SKIP (too heavy for a code-first pipeline) |
| 7 | mannequin.js | boytchev.github.io/mannequin.js | M | Procedural three.js figure with armature. Could stand in for crowd figures. | SQ | SKIP (off-style for Quest/Pixie) |
| 8 | ossos | github.com/sketchpunklabs/ossos | M | Web skinning and animation library for rigged GLB. | SQ | SKIP |
| 9 | Mixamo (via awesome-blender) | mixamo.com | Adobe terms, free for commercial use (M, FLAG: not CC0) | Free humanoid mocap. Our heroes are cartoon, so low value. | SQ | SKIP |
| 10 | GameAsset.net | gameasset.net | Listed as CC0 (magictools text, not verified at source) | 10,000+ CC0 animated character clips as GLB. Usable only as pose reference or background crowd. | SQ | TRY with licence check on each clip |

## 2. Effects and shaders

| # | Item | Link | Licence | What it gives us | Channel | Verdict |
|---|---|---|---|---|---|---|
| 11 | gl-transitions + ffmpeg-gl-transition | gl-transitions.com | M (MIT, per-transition licences vary) | Library of GLSL scene transitions. Needs GL; on CPU we would need software GL (Mesa llvmpipe). | SQ | TRY, check each transition's header |
| 12 | Material Maker | github.com/RodZill4/material-maker | MIT (V, gamedev list) | Procedural texture graph. Can generate halftone, paper and grain textures. | TS, SQ | TRY |
| 13 | Shader Park | shaderpark.com | M | JS raymarched procedural shapes. Needs GPU for speed. | SQ | SKIP |
| 14 | glsl-easings | github.com/glslify/glsl-easings | M (MIT) | Easing curves in GLSL. We can also port to Python in minutes. | SQ | TRY |
| 15 | easings.net cheat sheet | easings.net | formulas are not copyrightable | Reference for the Python tween curves. | SQ | ADOPT as reference |
| 16 | lygia | lygia.xyz | FLAG (Prosperity/Patron, see top) | Large shader library. | both | SKIP |
| 17 | Shadertoy / GLSL Sandbox / ShaderGif | shadertoy.com | FLAG (default CC BY-NC-SA) | Inspiration only. | both | SKIP for code, fine to learn from |
| 18 | Vizzu | github.com/vizzuhq/vizzu-lib | M (Apache-2.0) | Animated chart transitions (morph between chart types). Browser/WASM, so it could be captured headless. | TS | TRY |
| 19 | Zdog | zzz.dog | M (MIT) | Flat pseudo-3D for canvas/SVG. Close to a cartoon 2.5D look. | SQ | TRY |
| 20 | textmode.js | code.textmode.art | M | ASCII/textmode canvas. Novelty only. | TS | SKIP |

## 3. 2.5D and camera

| # | Item | Link | Licence | What it gives us | Channel | Verdict |
|---|---|---|---|---|---|---|
| 21 | three.js | mrdoob/three.js | MIT (M) | Already in use for props. | SQ | ADOPT (already) |
| 22 | camera-controls | github.com/yomotsu/camera-controls | M (MIT) | Damped camera moves for scripted dolly and pan. | SQ | TRY |
| 23 | three-mesh-bvh / three-bvh-csg | github.com/gkjohnson | M (MIT) | CSG for procedural props. | SQ | SKIP unless needed |
| 24 | Matcap library (nidorx/matcaps) | github.com/nidorx/matcaps | FLAG (mixed provenance; repo says check) | Fast toon-ish shading for props without lights. | SQ | TRY only after reading its licence note |
| 25 | glTF-Transform | gltf-transform.dev | M (MIT) | CLI to shrink and optimise GLB props. CPU only. | SQ | ADOPT |
| 26 | Poly Haven HDRIs | polyhaven.com | CC0 (V, awesome-cc0) | Lighting for 3D props. | SQ | ADOPT |

## 4. Assets (textures, models, fonts, icons, SFX, music)

| # | Item | Link | Licence | What it gives us | Channel | Verdict |
|---|---|---|---|---|---|---|
| 27 | Kenney | kenney.nl/assets | CC0 (V, several lists) | 40k+ sprites, UI, icons, sounds. Includes Kenney Game Icons font (CC0, V). | SQ | ADOPT |
| 28 | Quaternius | quaternius.com | CC0 (V, magictools/awesome-cc0) | Low-poly 3D packs and animated characters. | SQ | ADOPT for props |
| 29 | Poly Haven | polyhaven.com | CC0 (V) | Textures, HDRIs, models. | both | ADOPT |
| 30 | ambientCG | ambientcg.com | CC0 (V) | PBR materials; paper and fabric for print look. | both | ADOPT |
| 31 | The Base Mesh | thebasemesh.com | CC0 (V, awesome-cc0) | 900+ blank meshes. | SQ | TRY |
| 32 | Poly Pizza | poly.pizza | CC0 and CC-BY-3.0 mixed (V, gamedev list) | Low-poly models. Must filter per model. | SQ | TRY |
| 33 | Openclipart | openclipart.org | CC0 (V) | Vector clipart. Style likely mismatched with Quest/Pixie. | SQ | SKIP unless filler needed |
| 34 | FreePD | freepd.com | public domain (Kavex list text; M) | Background music. | SQ | TRY |
| 35 | Incompetech (Kevin MacLeod) | incompetech.com | CC-BY-3.0 (V, gamedev list) | Large music catalogue. Needs credit line. | SQ | TRY |
| 36 | CC0 Music (listed in gamedev list) | see Calinou list | CC0 (V) | Smaller CC0 set. | SQ | TRY |
| 37 | Freesound, CC0 filter only | freesound.org | mixed; CC0 filter (V, awesome-cc0) | SFX. Reject CC-BY-NC and sampling+ every time. | both | TRY with strict filter |
| 38 | jsfxr / Bfxr / rFXGen | jfxr.frozenfractal.com | Unlicense, MIT, zlib (V, gamedev list) | Self-generated UI and game-style SFX. Cleanest licence path. | both | ADOPT |
| 39 | Google Fonts, Noto, Inter, League of Moveable Type | fonts.google.com | OFL (V for Google Fonts, M for others) | Titles and captions. | both | ADOPT |
| 40 | AtF Spark | github.com/aftertheflood/sparks | M (OFL) | Font that draws sparklines from numbers. Neat for dataviz captions. | TS | TRY |
| 41 | Game-icons.net | game-icons.net | CC-BY-3.0 (V) | 4000+ SVG icons. Credit needed. | SQ | TRY |
| 42 | Tabler Icons, Lucide, Phosphor | tabler.io/icons | MIT (V for Tabler, awesome-icons text) | Clean UI icons for overlays. | both | ADOPT Tabler |
| 43 | Openmoji | openmoji.org | CC BY-SA 4.0 (M) | FLAG share-alike. | SQ | SKIP |

## 5. Simulation engines (TS)

| # | Item | Link | Licence | What it gives us | Channel | Verdict |
|---|---|---|---|---|---|---|
| 44 | Mesa | github.com/mesa/mesa | Apache-2.0 (V) | Python ABM framework; Mesa 3 has its own browser UI but we only need the model core and a data collector. Pure CPU. | TS | ADOPT |
| 45 | agentpy | agentpy.readthedocs.io | BSD-3 (V, search) | Smaller ABM library with experiment and parameter sweep tools. | TS | TRY (compare with Mesa) |
| 46 | pymunk | pymunk.org | MIT (V, aggregator pages) | 2D rigid bodies (Chipmunk). Collisions, crowds. CPU. | TS, SQ | ADOPT |
| 47 | Taichi | github.com/taichi-dev/taichi | Apache-2.0 (V, mirror only) | Fast fields and particle sims. Has a CPU backend, so it runs in our container. Not confirmed on this machine. | TS | TRY (benchmark CPU first) |
| 48 | SimPy | simpy | MIT (M) | Queue and event simulations; good for "systems" episodes. | TS | TRY |
| 49 | mxgmn WaveFunctionCollapse | github.com/mxgmn/WaveFunctionCollapse | MIT (M; check LICENSE file) | Constraint-based pattern generation for map or tile visuals. | TS | TRY |
| 50 | rht/abm_framework_comparisons | github.com/rht/abm_framework_comparisons | not checked | Benchmarks of Wolf-Sheep, Flocking and Forest Fire in Mesa, NetLogo, MASON, Agents.jl. Good source of episode-ready models. | TS | TRY (read, do not copy code without licence check) |
| 51 | NetLogo models library | ccl.northwestern.edu/netlogo | models are mostly CC BY-NC-SA (M, FLAG) | Great ideas, but model files are NC. Reimplement from the mechanics (rules are not copyrightable); never copy the files. | TS | SKIP files, use as idea source |
| 52 | networkx, shapely, scipy, numba | PyPI | BSD family (M) | Graphs, geometry, speed. | TS | ADOPT |

## 6. Data-viz in motion (TS)

| # | Item | Link | Licence | What it gives us | Channel | Verdict |
|---|---|---|---|---|---|---|
| 53 | matplotlib + Pillow | matplotlib.org | BSD-style (M) | Frame-by-frame static plots; fine for halftone because we post-process. | TS | ADOPT |
| 54 | Datashader | github.com/holoviz/datashader | M (BSD-3) | Rasterise millions of agent points into an image. Good for big swarm frames on CPU. | TS | TRY |
| 55 | Manim Community | manim.community | MIT (V, search) | Maths-style animation engine in Python. Already seen in earlier scouts. | TS, SQ | TRY |
| 56 | Motion Canvas | motioncanvas.io | MIT (V, search) | TypeScript tweened animation, outputs frames. | SQ | TRY |
| 57 | chart.xkcd | github.com/timqian/chart.xkcd | M (MIT) | Hand-drawn chart look, matches a cartoon channel. | SQ | TRY |

## 7. Typography and kinetic type (SQ)

| # | Item | Link | Licence | What it gives us | Channel | Verdict |
|---|---|---|---|---|---|---|
| 58 | Splitting | github.com/shshaw/Splitting | M (MIT) | Per-letter/word spans for headless-browser kinetic titles. | SQ | TRY |
| 59 | Blotter | github.com/bradley/Blotter | M (MIT-like) | Shader text effects (WebGL). | SQ | SKIP (GPU) |
| 60 | NumberFlow | github.com/barvian/number-flow | M (MIT) | Animated counters. | TS | TRY |
| 61 | GreaseWriter | see item 3 | M | Handwriting reveal. | SQ | TRY |

## 8. Pipelines

| # | Item | Link | Licence | What it gives us | Channel | Verdict |
|---|---|---|---|---|---|---|
| 62 | FFmpeg | ffmpeg.org | LGPL/GPL (tool use is fine) | Core encoder. | both | ADOPT (already) |
| 63 | PyAV | github.com/PyAV-Org/PyAV | BSD (M) | Pipe frames straight into encoder with no PNG round trip. | both | ADOPT |
| 64 | MoviePy | github.com/Zulko/moviepy | MIT (M) | Scripted editing. | SQ | TRY |
| 65 | editly | github.com/mifi/editly | MIT (M) | Declarative video editing with transitions. Node and GL. | SQ | SKIP (we have our own engine) |
| 66 | FFmpeg cookbook and cheat sheets (listed in awesome-ffmpeg) | see list | docs, not code | Quick filter recipes (loudnorm, concat, GIF). | both | ADOPT as reference |
| 67 | pyvips | github.com/libvips/pyvips | LGPL (M) | Very fast image resize, useful for batch halftone. | TS | TRY |
| 68 | glTF-Transform | see item 25 | MIT (M) | Pipeline step for props. | SQ | ADOPT |
| 69 | rembg | github.com/danielgatis/rembg | MIT (M); model weights may differ (FLAG) | Background removal. | SQ | SKIP unless needed |

## Gaps (honest)

- Could not locate dedicated awesome lists for motion-design, shaders, procedural generation, ABM, simulation, or python-graphics under the names tried. A further pass could try Awesome Python graphics sub-lists by search.
- The audio and music awesome lists were fetched but only lightly skimmed. A deeper pass may find better CC0 music sources.
- Most M-tagged licences are widely known but were not re-checked on the repos. Do that before adopting any item.
- Nothing was run, so CPU feasibility of Taichi, Synfig CLI and gl-transitions is unconfirmed.

## Suggested next step

1. ADOPT now: Mesa, pymunk, matplotlib/Pillow/PyAV, Kenney, Poly Haven, ambientCG, Google Fonts, jsfxr, Tabler, glTF-Transform.
2. Run quick CPU trials on: Taichi, Datashader, Synfig CLI, Material Maker (for halftone textures).
3. Write a two-line "licence gate" note: lygia, Shadertoy, NetLogo model files, OpenMoji are blocked.
