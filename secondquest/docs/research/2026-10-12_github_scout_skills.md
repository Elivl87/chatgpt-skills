# Skill scout, 2026-10-12

Method: WebSearch + READMEs only (GitHub HTML/API blocked). Nothing installed or run. Items marked UNVERIFIED were seen only on aggregator pages (skills.sh, claudskills.com, vibeindex, tessl); open the SKILL.md and LICENSE before vendoring. Licence rule: vendor only MIT/Apache with attribution header; flag everything else.

## Ranked top 15

| # | Skill / pack | Cat | Licence | Verdict |
|---|---|---|---|---|
| 1 | obra/superpowers: verification-before-completion, writing-plans, subagent-driven-development (two-stage review), dispatching-parallel-agents, systematic-debugging | e | MIT (README) | VENDOR 4-5 of the 15. Best orchestration/QA discipline; maps to render QA ("prove the MP4 plays, audio synced") and episode planning. |
| 2 | mattpocock/skills: research (cited md, background agent), grill-me/grilling, handoff, code-review (parallel subagents), writing-for-agents, retro | d,e | NOT stated in README; check LICENSE | Already known. Re-rank: take research, grilling, handoff, writing-for-agents once LICENSE confirmed MIT. |
| 3 | greensock/gsap-skills (gsap-core, gsap-timeline, gsap-plugins, gsap-performance) | a | MIT; GSAP + SplitText/MorphSVG now free (note: GSAP itself has its own "no-charge" licence, not OSI) | VENDOR gsap-core + gsap-timeline for HTML/SVG motion. Official, specific, maintained by the library authors. |
| 4 | remotion-dev/skills (remotion-markup, -render, -captions, -best-practices; 12 skills) | a | Skills README states no licence. Remotion itself is source-available: free for individuals/small teams, company licence for larger. FLAG. | Excellent if we ever use Remotion (CPU render works, slow). Do not copy text; reference/install-on-demand only. Confirm team-size terms. |
| 5 | ishuagrawal/skills video-by-reference | a | known | Already known; keep top-tier for reference-matching animation style. |
| 6 | anthropics/skills: frontend-design, canvas-design, algorithmic-art, brand-guidelines (as template), skill-creator | c,a | Mixed: many Apache-2.0; docx/pdf/pptx/xlsx are source-available (NOT open). Per-folder check required. | VENDOR frontend-design + canvas-design (Apache if folder LICENSE says so) for thumbnails/brand boards/stills; use brand-guidelines purely as a template for a SecondQuest brand skill. skill-creator for evals of our own skills. |
| 7 | aabrole/claude-video-thumbnail-skill | b | MIT | Good thumbnail-batch pattern (4 concepts + 2x2 grid, 16:9 vs 9:16). Needs paid Gemini key and headshot: do not run. Copy the PROCESS (4 concepts, grid review) into our packaging skill, with our own art pipeline. |
| 8 | jwynia/agent-skills fact-check (claim extraction, per-claim confidence) | d | UNVERIFIED | Candidate for script fact-check pass. |
| 9 | Jamie-BitFlight/claude_skills fact-check (VERIFIED/REFUTED/INCONCLUSIVE; model memory not accepted as evidence; parallel verifier agents) | d,e | UNVERIFIED | Best-designed verdict scheme seen. Adopt the scheme in our own skill rather than vendor. |
| 10 | daymade/claude-code-skills fact-checker | d | UNVERIFIED | Backup to 8/9; propose-correction-with-confirmation flow is useful. |
| 11 | rainlib/ai-storyboard scriptwriter + animator | d,a | UNVERIFIED | Three-act, >=9 beats per episode script; multi-agent storyboard. Mine the beat checklist; reject the rest until read. |
| 12 | majiayu000 claude-skill-registry create-storyboard (screenplay to animatic) | d,a | UNVERIFIED (bulk scraped registry, low curation) | Idea only. Registry is a dump; do not vendor. |
| 13 | notedit/happy-skills gsap-animation (GSAP+Remotion motion graphics) | a | UNVERIFIED | Look at it only if we adopt Remotion. |
| 14 | claudskills.com yt-packaging / youtube-scripts / youtube-thumbnail-design (safe zones, text placement, A/B) | b | UNVERIFIED; one is in Polish | Read for checklists (thumbnail safe zones, hook/pattern interrupt, CTA). Likely thin; write our own. |
| 15 | claudskills.com "filmmaker" (Disney 12 principles) | a,d | UNVERIFIED | Cheap to read; 12 principles as an animation QA checklist is genuinely useful. |

## Rejected
- Generic persona packs ("senior marketing strategist" style) and mass-scraped registries (majiayu000, NeverSight skills_feed): no specificity, unknown licences.
- samuraigpt generative-media-skills (muapi thumbnail) and inference.sh-based thumbnail skills: depend on paid external APIs/accounts.
- OpenMontage: AGPL (known); keep as read-only inspiration, never copy.
- Anthropic docx/pdf/pptx/xlsx: source-available, not open.

## Gaps (no strong open skill found)
- YouTube strategy/analytics (retention, CTR packaging) and channel #2 positioning: nothing credible. Build in-house from our own analytics.
- Motion-design principles beyond GSAP API (timing/easing taste): best to write a short house skill, seeded from #15.
- Search coverage was one pass per category; skills.sh, claude-plugins-official and agentskills.io were not directly browsable. A second pass is worthwhile.

## Recommended vendoring (MIT/Apache, with attribution header and source URL)
1. superpowers: verification-before-completion, writing-plans, subagent-driven-development, dispatching-parallel-agents.
2. gsap-skills: gsap-core, gsap-timeline.
3. anthropics/skills: frontend-design, canvas-design (after per-folder LICENSE check).
4. mattpocock: research, grilling, handoff (after LICENSE check).
Write in-house: fact-check (verdict scheme from #9), packaging checklist (from #7, #14), animation QA (from #15).
