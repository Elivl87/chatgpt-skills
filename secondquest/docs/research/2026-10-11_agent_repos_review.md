# Review: 5 agent repos from a post (agency-agents, Agent-Reach, orca, OpenMontage, codebase-memory-mcp)

Date: 2026-10-11. Method: README + LICENSE of each repo via raw.githubusercontent.com; for OpenMontage also
docs/ARCHITECTURE.md, AGENT_GUIDE.md and docs/PROVIDERS.md. Nothing was installed or run. GitHub API/HTML is blocked,
so star counts, the "307 agents" count and the "3,400 vs 412,000 tokens" figure are NOT independently verified
(the last one is the repo's own claim, see below).

## Table

| Repo | What it is | Licence | Needs (paid / accounts) | Useful for SecondQuest? Where | Verdict |
|---|---|---|---|---|---|
| msitarzewski/agency-agents | Roster of Markdown "agent personality" files (engineering, design, marketing, game dev, etc.), installed into `~/.claude/agents/` by script or desktop app. Includes Video Optimization Specialist (YouTube SEO, chaptering, thumbnails), Narrative Designer, Visual Storyteller, Short-Video Editing Coach | MIT | Nothing paid. Install script writes into `~/.claude/agents/` (config change) | Marginal. They are persona prompts, not tools. Our rules (CLAUDE.md, PUBLISHING_STANDARD, THUMBNAIL_RULES, secondquest-episode skill) are more specific and binding. At most read 2-3 files (video optimization, narrative designer) as raw reading for checklist ideas | SKIP (optionally read 2-3 files by hand, never install) |
| Panniantong/Agent-Reach | Installer/router that gives an agent CLI access to web, YouTube (subtitles + search via yt-dlp), RSS, GitHub, X/Twitter (twitter-cli, OpenCLI fallback), Reddit, Bilibili, etc. `agent-reach doctor` health check | MIT | Free tools. X search/timeline and Reddit need login **cookies** (README itself warns of account-ban risk and says to use a throwaway account); Reddit has no zero-config path (anonymous API blocked); server IPs often blocked, README mentions a ~$1/month proxy. The installer runs `pip install`, `mcporter`, writes `~/.agent-reach/config.yaml` | Partly. YouTube subtitles/search and web/RSS are useful for the research step and trend research, and need no account. X: single posts work with no config, but we already read posts with `api.fxtwitter.com`, which is simpler and cookie-free. Reddit/X search require cookies or desktop Chrome: not suitable for an ephemeral cloud container and a risk to the Producer's accounts | SKIP the install. TRY only the idea: yt-dlp subtitle fetch for reference videos in a throwaway sandbox if the Producer allows (we already have WebSearch/WebFetch + subagents) |
| stablyai/orca | Electron desktop app (macOS/Windows/Linux, mobile companion) to run Codex, Claude Code, OpenCode side by side, each in its own git worktree, with terminal splits, GitHub/Linear panes, SSH worktrees | MIT | Desktop app; uses your own agent subscriptions. No cloud-container use | No. Our production runs in Claude Code cloud sessions, which already isolate per session; the episode work is sequential and gated by the Producer, not parallel code branches. Parallelism we need is done with subagents/Workflows | SKIP |
| calesthio/OpenMontage | Agent-orchestrated video production system: YAML pipeline manifests + Markdown "director skills" + 100+ Python tools; research, proposal, script, scene plan, assets, edit, compose, with approval gates, budget caps and post-render self-review. Renders with Remotion, HyperFrames or FFmpeg | **AGPL-3.0** (strong copyleft: fine for reading and for borrowing ideas; copying its code into our repo would pull our code under AGPL if distributed or served) | Python 3.10+, Node 18+, FFmpeg. Everything optional-paid by API key (fal.ai/Kling, Veo, Runway, ElevenLabs, Suno, Google, OpenAI, xAI, Higgsfield API subscription $15-84/mo, etc.). Free path: Piper TTS, Pexels/Pixabay/Archive.org/NASA/Wikimedia stock, local GPU models | Yes, as a source of ideas, not as a replacement. See deep section | TRY ideas only (no install). Borrow patterns (section below) into our own scripts/docs |
| DeusData/codebase-memory-mcp | Single native binary MCP server that indexes a repo into a knowledge graph (tree-sitter, 162 languages) and answers structural queries (callers, architecture) in under 1 ms; built-in graph UI at localhost:9749. Claim: 5 structural queries ~3,400 tokens vs ~412,000 via file-by-file search | MIT | Free, no API keys. `install` auto-configures detected agents: writes MCP entries, instructions, skills and **lifecycle hooks** into agent config, runs a background daemon; installed via `curl ... | bash` | Low. Our code is a few Python animatic scripts plus a TS engine; our memory is the docs by design, and a session-start re-index in an ephemeral container buys little. The 120x figure compares against an unguided grep-everything baseline, so it overstates the gain for a small repo. Config-changing install conflicts with our rule | SKIP (revisit only if the engine grows to tens of thousands of lines) |

## Security / privacy / container notes

- Agent-Reach is the only one that touches personal accounts: X/Reddit/Instagram/Facebook paths use browser cookies or the
  user's own Chrome session. Its README says script use can get the account flagged or banned and recommends a throwaway
  account. Cookies are stored in plaintext-permission-600 YAML on the host. Do not hand the Producer's accounts to this.
  `api.fxtwitter.com` for single posts remains the right tool.
- codebase-memory-mcp and agency-agents both write into the agent's own configuration (hooks, MCP entries, agents dir).
  Our rule "no installs that change config without the Producer" applies. Neither is needed.
- Orca is a desktop GUI; it cannot run in the cloud container at all.
- OpenMontage is a repo you run, not a service. Its API keys sit in `.env`; no data goes anywhere except the providers you
  enable. Its AGPL licence matters only if we copy code.
- Prompt-injection hygiene: all five are "read this Markdown and obey it" systems (OpenMontage's `AGENT_GUIDE.md` is explicitly
  written to the agent). Reading them is fine; never auto-load their skill files as instructions.

## OpenMontage, in depth

### What it actually is

An "agent-first" framework: there is **no Python orchestrator**. The coding agent reads a pipeline manifest
(`pipeline_defs/*.yaml`, stage list, tools, success gates), then for each stage a Markdown **director skill**
(`skills/pipelines/<pipeline>/<stage>-director.md`), calls Python tools through an auto-discovered registry
(`tools/`, `BaseTool` contract with `capability`, `runtime`, `dependencies`, `fallback_tools`, `resource_profile`,
`cost_usd`), writes a JSON **checkpoint** per stage (resumable, with a decision log and cost snapshot), self-reviews with a
reviewer skill, and stops at human approval gates. Flow in every pipeline: research, proposal, script, scene_plan, assets,
edit, compose. 20+ JSON Schemas validate each artifact (brief, script, scene plan, edit decisions, publish log).
This is the same shape as our own method (script first, gates, playbook as memory), only more formal.

Pipelines: animated explainer, animation, avatar spokesperson, cinematic, clip factory, documentary montage, hybrid,
localization & dub, podcast repurpose, screen demo, talking head, plus a beta `character-animation` (rigged SVG/cartoon
characters, pose library, action timelines, QA) and an "Ink Theater/Ink Puppet" hand-drawn doodle style.

### How it renders

Three runtimes, chosen at proposal and locked in `edit_decisions` (silent swaps are a "governance violation"):
Remotion (React; spring-animated image scenes, word-by-word TikTok captions, fade/slide/wipe/flip transitions, stat
reveals), HyperFrames (HTML/CSS/GSAP, kinetic type, shader transitions, rigged SVG characters, needs Node >= 22) and FFmpeg
(assembly, subtitle burn, LUT colour grade, mux). Platform profiles built in (YouTube 1080p/4K, Shorts, Reels, TikTok, etc.).
When no video-generation provider is set, it generates stills and Remotion animates them (Ken Burns-like motion with springs),
and it has a "slideshow risk" gate to stop that looking like a PowerPoint.

### Models, APIs and costs

- The repo is model-agnostic: ~60 providers behind scored selectors (task fit 30%, quality 20%, control 15%, reliability 15%,
  cost 10%, latency 5%, continuity 5%). Video: Kling, Veo, Runway, Seedance, Grok, MiniMax, Higgsfield (API key + subscription
  $15-84/mo, separate from the MCP credits we use), local WAN/Hunyuan/LTX (needs a GPU). Images: FLUX, GPT Image, Imagen,
  Recraft, local diffusion, stock. TTS: ElevenLabs, Google, OpenAI, Azure, Piper (free, offline). Music: Suno, ElevenLabs, stock.
- Its own showcase costs: 60 s Kling short about **$1.33**, 50 s vertical film about **$4**, 7-world montage about **$5**. Default
  budget cap $10, per-action approval above $0.50, modes observe/warn/cap, estimate-reserve-reconcile around each call.
- For us the cost equation is different: our generated art is paid per Higgsfield credit via the MCP and the Producer approves
  each spend; OpenMontage would add a *second* paid ecosystem (fal.ai/Kling etc.) we do not need. The free path (Piper TTS,
  stock footage) does not match our 2D cartoon look, and its stock "documentary montage" is real footage, not animation.

### Quality of output (honest read)

Published demos are trailers, stylised shorts, product films and a 100 s documentary built on stock footage plus motion graphics.
They are polished for generated-clip montage, but none shows a consistent recurring 2D character (Quest, Pixie) acting under a
6-minute narrated argument. Character consistency there relies on provider references; its `character-animation` is beta. We
could not run it, so output quality is judged only from the README claims and the demo list, not verified.

### What it does better than our pipeline

1. **Formal, machine-checked gates.** Checkpoints refuse "completed" on a gated stage without a recorded approval, superseded
   checkpoints are archived, and every provider/style/fallback decision is logged with alternatives. Ours lives in prose
   (PRODUCTION_PLAYBOOK, PRODUCER_DECISIONS) and discipline.
2. **Budget governance as code.** Estimate, reserve, reconcile, cap. Ours has `tools/credits/credits.py` and `ledger.json`, which
   is close but the "reserve before the call" and "hard cap blocks the call" parts are manual.
3. **Pre-render and post-render automatic QC.** ffprobe validation, frames sampled at 4 positions for black frames/broken overlays,
   audio level check (silence, clipping), subtitle presence, "delivery promise" check, slideshow-risk score. We have
   `scale_check.py`, `framing_qc.py`, STT QC and `CAMERA_JUMP`, but no single post-render gate.
4. **Reference-video analysis** (transcript, pacing, scenes, keyframes, style, then 2-3 concepts with cost before any
   production). We already wrote a "video by reference" note (`2026-10-11_video_by_reference_skill.md`); same idea.
5. **Platform render profiles** as data, and a **music plan** step that is mandatory (we have music off by Producer rule).
6. **Skill hierarchy** (pipeline director, creative, core tool, external knowledge) with a reviewer skill per stage.
7. **Backlot**, a local live storyboard board with scene cards, per-asset cost and takes, replay. Nice but needs a browser/desktop.

### What it does worse than (or cannot do for) our pipeline

- No fit for our house style: 2D cartoon with two fixed characters, spec-driven Quest/Pixie prompts, costume-keeps-identity rule,
  QC against reference sheets. Its character consistency is provider-level; ours is spec- and QC-level.
- Our deterministic Pillow/NumPy frames give exact control (camera continuity enforced by `CAMERA_JUMP`, design units,
  `breeze()`), which its AI-clip approach cannot guarantee and which costs nothing per frame.
- Its default creative mode produces generated clips per scene (paid per second). Our rules forbid spending on sounds and 3D and
  require quotes for art; an auto-selector that picks "the best provider" would fight "minimal spend, Producer approves".
- Heavy: Python + Node + Remotion/HyperFrames + hundreds of skill files (700+). An ephemeral container would need `npm install`
  and `pip install` each session; this is a setup cost and a config change we must not make unilaterally.
- Our Producer-by-timestamp review loop, ES-419 dub, and script lock (SCRIPT CHANGE PROPOSAL) have no equivalent.
- AGPL: we cannot lift code without licence consequences.

### Concrete ideas to borrow (as our own small scripts/docs, no install, no copied code)

1. **`tools/qc/postrender_gate.py` (free, ffmpeg/ffprobe + Pillow):** one command after any render/animatic that checks codec,
   resolution, fps, duration vs timings.json, black frames (ffmpeg `blackdetect`), freeze frames (`freezedetect`), silence and
   clipping (`silencedetect`, `ebur128`/`astats` against our -20 LUFS target), and that subtitles exist (burned frame sample
   shows text where cues say). Emit one JSON report next to the file; fail loudly. This is the biggest direct gain.
2. **Checkpoint file per episode stage** (`docs/<ep>/checkpoint.json`): stage, status (`awaiting_human` / `approved`),
   approval quote and date, artifacts, cost snapshot. The `secondquest-episode` skill checks it at start so a new cloud session
   resumes without re-reading everything, and cannot skip a gate. Fits our "memory = repo docs" rule.
3. **Spend reserve-and-reconcile in `credits.py`:** a quote writes a `reserved` ledger line with the approved ceiling; generation
   refuses to run over it; reconcile writes actual cost and balance. Directly prevents the duplicate-id/quote slips the playbook
   mentions.
4. **Slideshow-risk score for the animatic:** report per block the share of shots with no on-screen motion, repeated background
   more than N times, text-heavy frames. We already forbid unmotivated camera moves, so this is a "reported, not enforced" metric
   for the Producer's review report.
5. **Decision log with alternatives** (one line per choice: option A/B/C, chosen, why) appended to `PRODUCER_DECISIONS.md`
   automatically; matches the A/B/C preview habit in the playbook.
6. **Platform profile table** (Shorts 1080x1920, YouTube 1080p/4K) as a small JSON used by export and the Shorts step.
7. **Remotion-style word-by-word captions** for Shorts only: our faster-whisper word timings already give the data; a Pillow
   caption renderer with a pop/spring scale is a few dozen lines. Check against `docs/PUBLISHING_STANDARD.md` first.
8. **Reviewer-skill pattern:** a short checklist skill the agent must run (and print) before each milestone report: script
   lock intact, no IP copy, credit ledger matches, QC report attached.
9. **Reading list, not code:** its `skills/meta/taste-direction.md` ("could this be any other video? does it reuse a look?")
   is a good question for our distinctness review; read it in a throwaway fetch, do not install.

### Recommendation

Do not adopt OpenMontage. Borrow items 1-3 first (post-render QC gate, per-episode checkpoint, reserve/reconcile in the
credit tool); they are free, small, work in an ephemeral container, and fit the existing repo-as-memory design. Items 4-8 are
optional polish. Each would be proposed to the Producer as a report-only improvement before touching shared scripts.

## Open questions / unverified

- Star counts, "307 agents / 20 areas", and the 120x token figure are repo or post claims, not checked.
- OpenMontage output quality was judged from README text and demo descriptions only; nothing was rendered.
- Agent-Reach's YouTube subtitle route (yt-dlp) may be blocked from the container's proxy or from cloud IPs; untested.

Sources (all via raw.githubusercontent.com HEAD): README.md and LICENSE of each repo; OpenMontage docs/ARCHITECTURE.md,
AGENT_GUIDE.md, docs/PROVIDERS.md.
