# GitHub scout · synthesis (2026-10-12)

Four scouts ran in parallel. Full reports: `2026-10-12_github_scout_{production,reverse_engineering,new_channel,skills}.md`.
Nothing installed. Licences marked "verified" were read from LICENSE/README; the rest are flagged in each report.

## A · Adopt for SecondQuest (all free, CPU, permissive)
| # | What | Licence | Fixes | Effort |
|---|---|---|---|---|
| 1 | **Depth Anything V2 Small** (ONNX, CPU): one depth map per plate, cached -> 2.5D parallax camera drift | Apache-2.0 (Small only; Base/Large are NC) | "static" (style bible: motion 29 % vs 56 %) | 1 day |
| 2 | **Idle-motion warp** (own code, coarse-grid OpenCV remap; Meta AnimatedDrawings `arap.py` MIT as reading) | ours | breathing, sway, squash on existing cut-outs, no new art | 1 day |
| 3 | **Springs, subframe motion blur, log-zoom** (ported ideas from howseen-ai/claude-motion-design) | MIT | stiff entrances, the fish leap | half day |
| 4 | **opensimplex** noise for water, clouds, light | MIT | the lake and skies stop being still | half day |
| 5 | **Post-render QC**: black/frozen/silent stretches + EBU R128 loudness (logic from kajisho5/ffmpeg-skill) next to pacing_qc | MIT | catches render faults before you see them | half day |
| 6 | **Rhubarb Lip Sync**: mouth cues from audio for talking shots | MIT | Quest/Pixie can speak on screen (needs a mouth set, procedural first) | 1-2 days, later |
| 7 | **obra/superpowers** discipline (verification-before-completion, two-stage review) vendored as skills | MIT | fewer misses like the "So, why?" one | 1 h |

## B · Reverse engineering (what works on YouTube)
| # | What | Needs | Use |
|---|---|---|---|
| 1 | **Outlier research** (AdesiaHQ/bangermap `youtube-outlier-research`: views ÷ channel median of last 30 uploads) | a **free YouTube Data API key** (Producer adds it as an environment secret) | pick topics/titles from real outliers in our niche, every episode |
| 2 | **yt-dlp metadata + captions only**, low rate, public, never cookies | — | hooks and titles of the outliers |
| 3 | **PySceneDetect + faster-whisper** on reference videos | BSD-3 / MIT | cuts/min, wpm, first-30-s hook structure of the outliers (same metrics as our style bible) |
| 4 | **AgriciDaniel/claude-youtube** prompts (hook variants, thumbnail A/B briefs, analytics diagnosis) | MIT, copy method only | packaging for EP001 relaunch and EP003 |
No open thumbnail scorer or retention-curve analyser exists: we build thin scripts (OCR, face/emotion, contrast) if needed.

## C · For a new channel run by Claude
Best stack found: **Hyperframes** (Apache-2.0, HTML/CSS/GSAP/three.js -> MP4 on CPU, 21 agent skills) or our own
Pillow pipeline; **brand-identity-skill** (MIT, SVG logo + palette + type + contrast checks; young, read first);
**Kokoro** voice (Apache-2.0, EN + ES); **music composed in code** (pretty_midi/Tone.js, MIT) + CC0 SFX (Kenney) with a
licence ledger; **Manim** (MIT) for diagram-heavy formats. Rejected: faceless "volume" pipelines (YouTube's
inauthentic-content policy demonetizes templated mass production; every video needs its own thesis and original visuals).
Remotion is source-available (company-size terms): fine for us today, not the base of a new channel.
