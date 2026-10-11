---
name: secondquest-episode
description: Produce a whole SecondQuest episode end to end (topic, script EN + ES-419, packaging, free placeholder narration, animatic with available art and free 3D, MISSING art list, credit quote, then final assets, render, publish package, Shorts, dub, analytics). Use when the Producer asks to start or continue an episode (EP003 and later), or says "haz el capítulo", "empieza el EP00X", "sigue con el episodio".
---

# SecondQuest: full-episode production (autonomous mode)

**Producer decisions, 2026-10-10/11:** Claude makes the whole episode as Creative Director
(`secondquest/docs/direction/*.md`). The Producer approves **two things**: (1) the **script package** (script + title +
thumbnail), chosen among 3 researched alternatives of 6-7 min each, then LOCKED; (2) **spending credits**, with the
available balance in every report. Everything else runs without waiting. Research and script review run as Workflows
(Producer: "Arranca con workflow"), reporting the usage spent.

Always also follow `secondquest/CLAUDE.md` and `secondquest/docs/PRODUCTION_PLAYBOOK.md` (method + lessons). Reply in
Spanish. Report at each milestone (what was done, what it shows, improvements and their cost, balance) and keep going;
the Producer can stop or redirect at any time, and his corrections win.

## Balance (every report)

- Ledger: `python3 secondquest/tools/credits/credits.py report` ("last recorded balance").
- Live: Higgsfield `balance` tool when it is connected; record it in the ledger on the next spend.
- Every quote: item, model, credits, total, balance before and after. Spend only after the Producer's own words
  approve it (`credits.py approve <id> --quote "<his words>"`), then `spend` with the actual cost and job ids.

## Stages

Work in `secondquest/`, episode folder names `ep00N` / `EP00N`. Commit and push after each stage.

### 1. Topic (free)
- Fan out 3-5 research subagents in parallel (Agent tool), one per candidate game, each returning: the "why do we
  play/love it" angle, timeliness (news, remakes, anniversaries, search interest), visual payoff available in the
  first 5 s, IP/monetization risks (`docs/MONETIZATION_SAFETY_STANDARD.md`), reuse of existing art.
- For each candidate, also the **companion detail** (RULE): 3 options of a small recurring companion from the game's
  world (our own design) that accompanies Quest and interacts with the wordmark; after the topic is picked, write
  `docs/<ep>/COMPANION.md` (options, the pick and why, where it appears per block) and plan it in the shot plan.
- Choose using the lessons in the latest `docs/publish/EP00*/ANALYTICS_*.md` (Home traffic, CTR, 30 s retention).
  Record the choice and the runners-up in `docs/<ep>/PRODUCER_DECISIONS.md` (as "Claude decision, autonomous mode").

### 2. Script EN + ES-419 (free)
- Write the English script in the channel's voice (EP001/EP002 scripts as the reference): a "why" video essay,
  6-10 min, hook line in the first seconds, the hook closing on "So, why?"/"Why?" where the wordmark lands and 1.5 s
  of silence follow (narration assembly + hook block, every episode), the thumbnail's promise paid off in the first 5-10 s, a concrete visual
  beat every 60-90 s, the closing callback and the "what game deserves a why next" CTA.
- Review in parallel with 4 reviewer subagents, each with its own brief: (a) hook and first 30 s, (b) retention
  beats and pacing, (c) originality and factual accuracy (sources), (d) IP / monetization safety and title/thumbnail
  promise. Fix, then a second pass on what changed.
- ES-419 version (neutral Latin American, the games' official Spanish names), reviewed by a Spanish-naturalness
  subagent. Lines aligned 1:1 with the English cues.
- Lock the script before the credit gate: once Bram records it, it is used verbatim (CLAUDE.md script rule).

### 3. Packaging (free)
- Titles A (curiosity, game name first) and B (search); 3 thumbnail variants from existing art (`THUMBNAIL_RULES.md`),
  planned now, so the opening matches the thumbnail.

### 4. Placeholder narration (free)
- `tools/tts/placeholder_narration.py` (Kokoro, free) builds a scratch narration and `timings.json`, so the animatic
  can be built with real timing before Bram is paid for.

### 5. Animatic (free)
- Asset fit first (`asset_needs.json`, `npm run assets:find`). The companion detail is built here too: its gags per
  block and its two wordmark moments (hook "Why?" + end), as Navi in EP002. Then block by block in `QUALITY=draft`, design units,
  available art + free 3D (`tools/props3d`) + engine overlays; stand-ins marked MISSING and listed in
  `docs/<ep>/MISSING_ART.md`.
- QC subagent per finished block, in parallel while the next block is built: `scale_check.py`, `framing_qc.py`
  sheet, camera continuity, HUD rule, ui_kit text style, walk rules, the "mistakes not to repeat" list of the
  playbook. Fix what it finds before moving on.
- Full animatic at `QUALITY=review` when all blocks pass; send it to the Producer as a progress report.

### 6. Credit gate (the Producer approves)
One quote package, with the balance: Bram EN narration (~3.2 credits / 1,000 chars), Bram ES dub (optional, same
rate), each MISSING art item (0.5 per image at 1k, 1.0 at 2k), thumbnail art if any. Options ranked by value, the
cheapest viable set marked. Nothing in it is generated until approved; partial approvals are fine.

### 7. After approval
- Generate approved items (anchor image first; Quest/Pixie specs; QC per `QUEST_V1_PROMPT_SPEC.md`).
- Bram narration -> STT QC -> assemble -> `timings.json`; re-render blocks (free); integrate art via `lib.final()`.
- Final 2K render (resumable script), publish package (`docs/publish/<EP>/`), .srt EN/ES, trailer Short,
  Spanish dub (playbook §5), deliveries by Release. Archive the episode's new art (`docs/ART_ARCHIVE.md`).

### 8. After publishing
- Schedule a check-in 48 h after the Producer publishes (send_later) asking for the YouTube Studio screenshots, then
  write `ANALYTICS_48H.md` comparing with the previous episodes, and update the playbook's lessons.

## Subagents and workflows
- Subagents (Agent tool) are part of this mode: research, reviews, QC. Give each a self-contained brief with the
  file paths and the rules it checks; they report findings, Claude decides and edits.
- A multi-agent Workflow is used only when the Producer asks for one ("usa un workflow"): it costs more usage.
