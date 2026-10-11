# GitHub scout: new channel, "Claude as master brain" (2026-10-12)

Scope: brand-by-code, code-generated video on CPU, free/clean audio, faceless pipelines.
Method: web search plus README/LICENSE fetches. Nothing installed or run.
Confidence tags: [V] verified from the repo file this session; [S] from search snippets only; [M] from my memory, verify before relying.

## Ranking (best 13)

| # | Candidate | Role | Licence | CPU-OK | Verdict |
|---|-----------|------|---------|--------|---------|
| 1 | heygen-com/hyperframes | HTML/CSS/GSAP/Lottie/Three.js to MP4, 21 agent skills (faceless explainer, captions, music-driven, motion graphics, frame.md design system to video) | Apache-2.0 [V] | Yes: headless Chrome frame-seek plus FFmpeg, deterministic, no GPU needed | Top pick for the render engine. No revenue/headcount thresholds. Premium look comes from our design, not the tool. Young project, check release cadence. |
| 2 | fatihaydost/brand-identity-skill | Claude skill: logo + type + palette as one system; 3 options board; SVG/PNG logo set, favicon, tokens (CSS/Tailwind/DTCG), 8-13 page guideline PDF; checks WCAG, colour-blind sim, font licences, 16/32px renders | MIT [V] | Yes | Best brand-kit fit. Only ~69 stars, security scan pending [S]: read SKILL.md and scripts before use. Output still needs Claude's taste pass. |
| 3 | Kokoro (hexgrad/kokoro) | TTS, 82M, EN/ES/FR/IT/PT-BR/JP/ZH/HI | Apache-2.0 weights [V] | Yes, near real-time on CPU [S] | Already in use. Has Spanish (`e`), relevant for ES-419 dub. Ceiling: good but a little flat; fix with script pacing and SSML-like punctuation. |
| 4 | Manim Community (ManimCommunity/manim) | Math/diagram/explainer animation, Cairo render on CPU | MIT [V] | Yes (slow, but fine) | Highest "looks like a real channel" ceiling for explainers (3Blue1Brown look). Needs LaTeX for maths text. |
| 5 | redotvideo/revideo | TypeScript generator-based animation, headless render, forked from Motion Canvas | MIT [V] | Yes (headless browser) | Strong second engine if we prefer code-timelines synced to narration. Maintenance not confirmed. |
| 6 | motion-canvas/motion-canvas | Vector animation library plus editor, built for voice-over-synced explainers | MIT [V] | Yes | Great aesthetics; editor is manual, so use revideo for headless. Maintenance uncertain. |
| 7 | remotion-dev/remotion plus remotion-dev/skills | React video; 12 official skills incl. captions, maps, render | Source-available "Remotion License" [V]: free for individuals and for-profit with 3 or fewer employees; paid above; 5.0 changes licence | Yes | Biggest ecosystem and best captions/maps skills. Free for us today, but not OSI-open, so keep a HyperFrames escape route. Skills repo licence not seen. |
| 8 | anthropics/skills (algorithmic-art, canvas-design, brand-guidelines, theme-factory) | p5.js seeded generative art, poster/PNG design, brand and theme application | Many Apache-2.0; docx/pdf/pptx/xlsx source-available [V] | Yes | Already installed here. Good for logo exploration, thumbnails, generative interstitials (render p5 frames via headless Chrome into HyperFrames/ffmpeg). |
| 9 | Chatterbox (resemble-ai/chatterbox), Turbo/Nano | More expressive TTS with [laugh] tags, 23+ languages; Nano 110M runs about 3x realtime on 8 CPU cores [V] | Believed MIT [S, conflicting] confirm LICENSE | Nano yes; Turbo/full slow on CPU | Optional second voice. Every file carries the Perth watermark [V]: acceptable, but note it. Voice cloning of real people is a policy risk, do not use. |
| 10 | Procedural music: Tone.js (MIT [M]), Sonic Pi (MIT [M]), EngineLaMusique (MIT, pure synthesis, no samples [S]), gb-synth (MIT [S]) | Code-composed music or synth stems, rendered offline | MIT | Yes | Safe to monetise since Claude writes the score and we own the output. Quality ceiling: ambient pads, plucks, drones, lo-fi, chiptune. Not orchestral. Recommend a synthesised signature motif plus drones rather than "AI pop". Render offline to WAV (Tone.js via headless Chrome OfflineAudioContext, or numpy/scipy). |
| 11 | MIDI to audio: FluidSynth (LGPL [M], call as a separate binary) plus a permissive SoundFont (GeneralUser GS or similar, custom permissive licence [M]) | Claude writes MIDI (mido/pretty_midi, MIT [M]), renders with SoundFont | Check each SoundFont's text | Yes | More natural instruments than pure synth. Verify the SoundFont licence explicitly allows use in monetised video. Avoid GPL-only fonts. |
| 12 | CC0 SFX: Kenney.nl audio packs (CC0 [M]), OpenGameArt CC0-filtered, Freesound CC0 filter (per-file, check each), plus self-synthesised whooshes/clicks via numpy | SFX | CC0 | n/a | Free and clean. Log source URL and licence per file. Prefer synthesising SFX ourselves; zero risk and a consistent sound identity. Do not use Pixabay/YouTube Audio Library assumptions without reading terms. |
| 13 | yashaiguy-dev/faceless-youtube-agents ("YT Video Factory") | Claude-Code-friendly pipeline: style scrape, script, images, TTS, FFmpeg, thumbnail, private draft upload | MIT [V] | FFmpeg yes, but requires two paid Gathos API keys [V] | Borrow the structure (draft upload via YouTube API, thumbnail step); do not adopt. "Scrape top videos' viral DNA" pushes toward derivative, template content, the exact thing the policy targets. |

## Rejected or caution

- Piper: current repo is OHF-Voice/piper1-gpl, i.e. GPL [S/M], and seeks maintainers [V]. Individual voices carry their own licences. Skip unless the GPL is acceptable for a subprocess. Kokoro is simpler.
- Strudel (live-coding, AGPL-3.0 [M]; development moved to codeberg.org/uzu/strudel [V]), TidalCycles, SuperCollider (GPL), FoxDot: GPL/AGPL. Our generated music is not automatically encumbered, but keep them out of the shipped toolchain. Flag only.
- Orpheus TTS: Llama-licence conflict in sources [S]. Skip.
- Generative.fm packages: depend on sample repos with separate terms [S]. Skip.
- Slop pipelines: rushindrasinha/youtube-shorts-pipeline (ElevenLabs paid, stock/AI imagery, about $0.11 per video [S]), imsv1301/FreakyBits (Edge TTS = unofficial Microsoft endpoint, Pexels stock, cron Shorts [S]), naqashafzal/AI-Content-Studio, collij22/yt-faceless-automation (archived [S]), sasharun/awesome-faceless (list). These optimise volume. Edge TTS is not a licensed commercial API.
- Stock-footage montage and "reused content" generators: demonetisation bait.
- brand-guidelines (alirezarezvani/claude-skills), oakoss/brand-designer, luongnv89/logo-designer, arenukvern/repo-brand-identity: [S] only; useful as extra prompts, none beats #2. Not read.

## YouTube policy facts (verified, support.google.com/youtube/answer/1311392)

- Since 15 Jul 2025 "repetitious content" is "inauthentic content": mass-produced or templated, repetitive across videos, slideshows or scrolling text with little narrative, generic-template AI content is not monetisable.
- Allowed: shared intro/outro, series where each video has a distinct storyline/concept. AI tools are allowed if the result shows creative vision and value.
- Reused content (clips, compilations without substantive change) not monetisable even with permission.
- AI personas posing as human experts on health, legal, finance, politics: not monetisable.
- Not seen on that page: synthetic/altered-content disclosure rules (the YouTube "altered or synthetic content" toggle). Check the separate help article before upload [M].

Design implication: a fixed brand and format is fine (series branding), but each episode needs a real script with a distinct thesis, original visuals and varied structure. Mass-produced identical layouts with swapped text are the risk. Keep cadence modest and visibly human-directed (Producer picks topics, Claude's editorial voice).

## Recommended stack

1. Brand: brand-identity-skill (3 options, Claude chooses) + anthropics canvas-design/algorithmic-art for the mark and thumbnails; fonts OFL only (Google Fonts); tokens as DTCG/CSS shared with the video engine.
2. Video: HyperFrames primary (Apache-2.0, deterministic, agent skills), Manim for maths/diagram segments, p5.js generative interludes; Remotion only if a specific skill is needed and licence still fits.
3. Voice: Kokoro (EN + ES `e`), script written for speech; Chatterbox Nano optional.
4. Sound: synthesised/MIDI+SoundFont score with a signature motif (or no music plus tasteful sound design), self-made SFX plus CC0 packs; keep an `AUDIO_LICENSES.md` ledger.
5. Captions: Whisper-style word timing (openai-whisper MIT [M]) feeding HyperFrames/Remotion captions skill.
6. Upload: YouTube Data API as private draft (pattern from #13), Producer publishes.

## Open items to verify before committing

- HyperFrames release cadence and a real CPU render time for 1080p/10 min (not tested).
- Revideo and Motion Canvas last-commit dates.
- SoundFont licence text; Chatterbox LICENSE file; Remotion skills repo licence.
- Quality ceiling of Kokoro over 8-10 minute narration (listener fatigue); consider shorter videos (3-6 min) and strong pacing.
- Paid image credits: spend on key art, backgrounds and thumbnails only; keep everything else procedural.
