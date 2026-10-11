# Review: "28 Things to Install into Claude for motion graphics" (Producer image, 2026-10-11)

Method: repo check (package.json, node_modules, tools/, scripts/, docs) + raw.githubusercontent LICENSE/README
(GitHub API/HTML blocked; star counts NOT verified). Nothing was installed. Items marked (mem) were not verifiable
this session and come from memory.

## What we already use
three.js (^0.186.1, devDependency, `tools/props3d/scene.ts`, headless Chromium + OpenCV outlines), ffmpeg
(imageio-ffmpeg, all Python animatic blocks), remotion 4.0.530 (EP001 engine, `src/`, now secondary), whisper
(faster-whisper 1.2.1), elevenlabs (Bram, paid, via API; not the "skills" repo). Everything else: not present
(grep finds only a "no Lottie/SVG layers" rule in docs/ENGINE_EVOLUTION_PLAN_v1.md).

## Table

| Tool | We use it? | Could help? Where | Cost / licence | Verdict |
|---|---|---|---|---|
| three.js | YES (props3d) | Already our 3D prop path | MIT | ADOPT (already) |
| anime.js | no | Browser-DOM tweening; our frames are Pillow/NumPy, no DOM | MIT (mem) | SKIP |
| motion (motion.dev) | no | React/DOM animation; only useful inside Remotion/HTML | MIT (verified) | SKIP |
| react-three-fiber | no | React wrapper for three; our scene.ts is plain three in a static page; no gain | MIT (verified) | SKIP |
| lottie-web | no | Needs After Effects authored JSON; our rule is "no Lottie"; style = our own Pillow cards | MIT (verified) | SKIP |
| gsap | no | Timeline easing in browser; we have our own easing in lib.py | Free "no-charge" licence since Webflow (mem; LICENSE not fetched); not OSI | SKIP |
| ffmpeg | YES | Core | LGPL/GPL | ADOPT (already) |
| remotion | YES (EP001, `src/`) | Legacy engine; animatic pipeline replaced it | Free for individuals/small cos, company licence above a size (verified LICENSE.md) | Keep as is |
| hyperframes (heygen-com) | no | HTML -> video for agents, 21 skills, Node>=22; would be a 3rd render engine next to Python + Remotion. Possible only for one-off animated chart/diagram cards rendered to PNG/alpha | Apache-2.0 (verified) | TRY (sandbox only, low priority) |
| manim (Community) | no | Maths/diagram animation; our topics are game-design essays; its look is 3Blue1Brown, not our style. Maybe an occasional graph/curve explainer shot, exported as alpha frames | MIT (verified), needs Cairo/LaTeX | SKIP (revisit if an episode needs real maths) |
| motion-canvas | no | TS canvas animations to video, editor GUI; overlaps Remotion | MIT (verified) | SKIP |
| revideo | no | Fork of motion-canvas for headless rendering; overlaps Remotion | MIT (verified) | SKIP |
| shadcn/ui | no | Web app UI, not video | MIT (mem) | SKIP |
| react-bits | no | Web UI effects | MIT + Commons Clause variants (mem) | SKIP |
| magicui | no | Web landing-page components | MIT (mem) | SKIP |
| motion-primitives | no | Web UI | MIT (mem) | SKIP |
| magic-mcp (21st.dev) | no | Generates web UI components | Service, account/credits | SKIP |
| whisper | YES (faster-whisper) | Word timings | MIT | ADOPT (already) |
| tone.js | no | Browser synth; sounds are CC0/own, music OFF, and we render audio in Python | MIT (mem) | SKIP |
| wavesurfer.js | no | Browser waveform UI; review is by timestamp with ffmpeg stills | BSD-3 (mem) | SKIP |
| elevenlabs/skills | partly (we use the API for Bram) | Docs for the API we already call; marginal | MIT (mem) | SKIP (optional read) |
| anthropics/skills | partly (our own skills dir; this session has anthropic-skills) | Reference for skill structure; docx/pptx/pdf not needed | Mixed: some Apache-2.0, document skills source-available (README) | SKIP |
| mcp-for-blender (ahujasid) | no | Drives a local Blender from Claude. Would give real modelling (booleans, bevels, curves), Cycles/EEVEE toon. But Producer rule: all 3D by Claude, free, in our renderer; Blender is free, so rule is compatible only if approved. Costs: install Blender (~400 MB) in an ephemeral cloud container, MCP needs a live Blender socket (headless is awkward), plus the Poly Haven/Hyper3D/Sketchfab add-ons that call paid or third-party assets (must stay OFF: no paid 3D, no IP). Better route: scripted `blender -b -P` without MCP | MIT (verified) | TRY only if a prop proves too complex for three.js; otherwise SKIP |
| threejs-skills (CloudAI-X) | no | 10 knowledge files (geometry, materials, lighting, toon/shaders, post). Might improve how Claude writes `scene.ts` props (LatheGeometry, ExtrudeGeometry, instancing). Caveats: README clone URL points at a different repo (pinkforest/threejs-playground); no LICENSE file found at CloudAI-X; content is generic. Cheap to read, so review manually and copy only what helps | licence unclear | TRY (read, do not install blindly) |
| remotion/skills (remotion-dev) | no | Best-practices skill for Remotion projects. Only matters if we write new Remotion code; EP002+ are Python | Repo has no LICENSE.md at main (404); Remotion itself see above | SKIP (revisit if Remotion returns) |
| gsap-skills | no | Teaches GSAP; we do not use GSAP | n/a | SKIP |
| after-effects-mcp | no | Needs Adobe After Effects (paid, desktop) | Adobe subscription | SKIP |
| motion-graphics-skills | no | Generic; no concrete repo verified; we have our own style and ui_kit | unverified | SKIP |

## Honest read
Of 28, we already use 5 (three.js, ffmpeg, remotion, whisper, ElevenLabs API). About 20 are web-UI, browser-animation
or Adobe tools that do not fit a Pillow/NumPy -> ffmpeg pipeline with our own art. Style is the real constraint:
Lottie/GSAP/manim bring their own look and break the "our own style, text cards in ui_kit" rule.

## Top candidates to try (none urgent)
1. **threejs-skills**: free, 10 minutes to read; may make prop code better (organic shapes, instancing). Review first.
2. **mcp-for-blender**: only if a future prop (organic, curved, many bevels) is too hard in three.js. Prefer scripted
   headless Blender over the MCP; keep all asset-download add-ons off.
3. **hyperframes**: sandbox test to see whether HTML/CSS cards (charts, kinetic type) rendered to PNG beat our Pillow
   cards. Likely only a gain for data charts. Node>=22 needed (check `node -v`).

## Task 2: "R-CAD" skill
Not found. Searches tried (WebSearch standard + extended, 4 queries: "R-CAD skill", "rcad", "R-CAD SKILL.md Claude
Code", with Replicad/R-language variants). No repo or skill named R-CAD/rcad exists in the indexed results; the
name may be spelled differently or be new. Closest real matches:
- earthtojake/text-to-cad (MIT, verified LICENSE; build123d + OpenCASCADE; outputs STEP/STL/3MF/GLB; engineering
  drawings, DFM checks): the most mature "CAD skill".
- flowful-ai/cad-skill (CadQuery), cyberchitta/cad-khana (build123d), rawwerks/VibeCAD, iancanderson/openscad-agent,
  brepjs-cad (npm; JS BREP, closest to Replicad).
Value for SecondQuest: low. These are engineering CAD (precise solids for printing/machining). Our props are stylised
toon shapes that need silhouettes and ink outlines, which three.js already does. A GLB from build123d could be loaded
in scene.ts for hard-surface objects (console shell, cartridge), but filleting/curves are already done in code, with
no real gain. Verdict: SKIP; if the Producer has the exact link, send it and I will review it.
