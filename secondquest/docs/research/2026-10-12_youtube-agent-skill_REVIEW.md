# Review · Jakeschincariol/youtube-agent-skill (commit a2feb21, MIT) — 2026-10-12

Read-only review (cloned, every file read, no code run). Producer asked for a deep review.

**What it is:** 11 prompt skills + 6 stdlib Python tools (yt-script/hookscore, yt-package/title, yt-retention,
yt-chapters, yt-edit/deadair, yt-viral/swipe; shorts/seo/comment/plan/audit prompts). No API keys, no network, no
installs, never publishes. Security clean. Licence MIT (vendor with notice).

**"tu voz" = the WRITING voice:** `templates/voice.md` (who I talk to · how I talk = transcripts of my 3 best videos ·
words I never use · words I use · what I will not claim · my format), read by every skill. No TTS, no voice cloning.

**Weak spots:** English-only regex (useless on ES-419); hookscore tuned to self-help "you/lose/stop" hooks (our
third-person "why" essays score low by design; its own README admits weak accuracy); title.py penalises titles without
a digit; retention cliffs include the natural start drop.

## Adopt (re-implemented as ours, free)
1. `docs/style/VOICE.md` (EN + ES-419) built from the locked EP001/EP002 scripts: the six sections + the hook contract
   ("So, why?"), never-claim rules, read by stage 2 and the script reviewers. Guides drafting only; locked scripts stay verbatim.
2. `scripts/retention_read.py`: Studio retention CSV + timings.json → hook leak, cliffs mapped to script blocks (skip
   first 3 s), ONE fix. Fills the gap found in the 2026-10-12 scouting; plugs into stage 8 (ANALYTICS_48H).
3. Chapter-rule assert (00:00, ≥ 3, ≥ 10 s) in the publish script; boundaries from our blocks.
4. Title/thumbnail check against PUBLISHING_STANDARD (game name counts as concrete; no digit penalty).
5. Outlier multiple (views ÷ channel median) in topic research — both channels, Tiny Systems especially.
6. Optional: trimmed hooks reference (essay-fit formulas + "fails_when" notes) with the MIT notice.

## Skip
hookscore as a gate · deadair (would flag our deliberate 1.5 s silence) · comment/plan/seo/audit (covered) · installing the plugin.
