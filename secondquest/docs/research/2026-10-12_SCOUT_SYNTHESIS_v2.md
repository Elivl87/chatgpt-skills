# Deep scout · consolidated plan v2 (2026-10-12)

Second pass, 5 agents, ~270 items reviewed. Reports: `2026-10-12_deep_scout_{animation,sound,engine,claude_skills_mcp,awesome_lists}.md`
(first pass: `2026-10-12_github_scout_*.md`). Nothing installed yet. Licences: V = verified this session; others are
flagged in each report and get checked (LICENSE file) before anything is adopted.

## 1 · SecondQuest, adopt now (free, CPU, permissive) — in this order
| Step | What | Licence | Fixes |
|---|---|---|---|
| E0-E2 | Profile the renderer; reuse identical frames + cache static shots; render shots in parallel on the 4 cores | ours | render time (finals at 1440p) |
| A1 | **Parallax 2.5D**: Depth Anything V2 Small (ONNX CPU) depth per plate + our own parallax (OpenCV / moderngl+llvmpipe shader) | Apache-2.0 (Small only) V | static plates |
| A2 | **Idle motion** on cut-outs: coarse-grid warp (ideas from AnimatedDrawings `arap.py`, MIT V) — breathing, sway, squash | ours | static characters |
| A3 | **Springs, motion blur (subframes / ffmpeg tmix), log-zoom, eased entrances** (ideas from claude-motion-design MIT V, lottiefiles motion-design-skill MIT) | ours | stiff motion |
| A4 | **Procedural water/sky/light**: opensimplex (MIT) | MIT | still lake and skies |
| A5 | **pymunk** physics for comic gags (launched across the island, tumbling props) | MIT V | fake-looking gags |
| A6 | **ffmpeg built-ins**: xfade transitions, grain/vignette in the finish pass, rgbashift for impacts | LGPL tool | transitions |
| A7 | **Post-render QC**: black/frozen/silent stretches + EBU R128 (ffmpeg-skill logic MIT V, loudcheck) | MIT | faults before the Producer sees them |
| S1 | **Free SFX**: OpenGameArt CC0 water/splash pack, OwlishMedia CC0, ETTiNGRiNDER CC0, BigSoundBank (CC0/WTFPL); whooshes, slaps and the wordmark sting synthesized with ffmpeg/sox; jsfxr/rFXGen for UI | CC0 | splashes, slaps, pops (music stays OFF) |
| C1 | **Skills to vendor (copies with attribution)**: obra/superpowers (verification-before-completion, plans, subagent review), lottiefiles motion-design-skill, AgriciDaniel/claude-youtube (packaging; our standards win), an in-house fact-check skill (VERIFIED/REFUTED/INCONCLUSIVE), mattpocock writing-beats, jwynia joke-engineering, hookify (turn the Producer's rules into automatic checks) | MIT / Apache | quality + discipline |
Later: skia-python for ui_kit cards (needs libEGL/fontconfig), MobileSAM layer separation (derived layers, originals untouched), OpenTimelineIO export so a human editor can open our cut.

## 2 · Needs the Producer's decision
- **Real-ESRGAN** (BSD-3) upscaling of generated plates for the 1440p final: changes the art's pixels (rule: generated art is not modified).
- **Sonniss GDC bundles**: huge pro SFX library, royalty-free for monetized YouTube, but an EULA (not CC0) and bans AI training.
- Licences that need a credit line (game-icons.net, Incompetech): only if credited in descriptions.

## 3 · Tiny Systems (new channel) stack, all free
Simulation: **Mesa** (Apache-2.0), **pymunk** (MIT), numpy. Drawing: skia-python / Pillow + our finish pass; **Manim**
(MIT, with adithya-s-k/manim_skill) for diagrams. Voice: Kokoro (Apache), Piper es_MX "claude" (Apache) / es_ES davefx
(CC0) after model-card check, Chatterbox (MIT, watermarks output). Music in code: **mido + FluidSynth + FluidR3_GM (MIT)**,
music21 (BSD), sirruf/music-gen-skill (MIT) as the pipeline model. Brand: brand-identity-skill (MIT), anthropics
canvas-design/theme-factory (Apache). Fonts: Google Fonts (OFL); icons Tabler/Lucide/Phosphor.

## 4 · Blocked (never use)
lygia & Shadertoy code (non-commercial), Mixamo, NetLogo models (mostly NC), F5-TTS weights (NC), Coqui XTTS (NC),
TubeCLIP (NC), OpenMoji (share-alike), Spine (editor licence), AGPL code (OpenMontage, klaket, basic-memory, Theatre
Studio) as code to copy, Depth Anything Base/Large (NC), Blender MCP (needs GUI; clashes with our free-3D rule).
