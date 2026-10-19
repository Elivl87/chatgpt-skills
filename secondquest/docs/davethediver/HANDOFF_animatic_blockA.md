# Dave the Diver · Handoff → next session: Hyperframes animatic, block A (2026-10-19)

Self-contained: everything needed for block A is on this page. **Read ONLY:** this page, `secondquest/CLAUDE.md`,
`docs/davethediver/SHOT_PLAN.md` lines 21-57 (HUD spec, dolphin arc, block A table), `tools/hyperframes_ep003/BLOCK_BUILD_GUIDE.md`
(41 lines). Everything else by grep/line range only. Do NOT re-read the script, research, PRODUCER_DECISIONS or other blocks.

**Rules:** reply in Spanish; balance **1.75 credits** in every report (no spend without a quote + explicit "sí").
Branch `claude/secondquest-pilot-hook-4yw8xj` (work and push there). Director does small edits; max one builder agent
at a time (Sonnet; Opus if Sonnet fails twice); critics only on the final round; one background waiter, no polling; 480p drafts.

## 1. Restore (background, ~5 min, one waiter)
`cd secondquest && bash scripts/dtd_restore.sh <scratchpad>/dtd > <scratchpad>/restore.log 2>&1` → wait for "restore done".
It pulls the art archives (incl. `archive-art-dtd-2026-10-19`, asset 655958405: plates, pixel sprites, props3d cast,
**pink dolphin v3** — no re-render), installs opencv/Kokoro, regenerates `public/episodes/davethediver/audio/narration.wav`
(gitignored). If `episodes/davethediver/timings.json` changes by a few ms after that, commit it (it must match the wav).

## 2. Assets available (all in `public/art/davethediver/`)
- `plates/bar_interior_night.png`, `plates/bay_exterior_dusk.png` (max-fidelity plates, approved).
- `pixel/*.png` Quest/Dave pixel poses (p01/p02 swim, p03 aim, p04 dive ready, p05 big fish, p10 tray run …).
- `props3d/`: leo_cobra_*, max_bar_*, bar_stool_34, bubble_* (FX only), and the dolphin:
  `dolphin_{swimSide}_{neutral,happy,worried,sleepy,laugh,blink}`, `dolphin_swim34_{neutral,happy,worried,blink}`,
  `dolphin_leap_happy`, `dolphin_ring_{happy,wink}`, `dolphin_tangled_worried`, `dolphin_peek_{neutral,happy,laugh,sleepy,wink,blink}`
  (head close-up for window/tank shots), `dolphin_grey_swimSide_neutral`, FX `dolphin_fx_heart_ring`, `dolphin_fx_heart_bubble`, `dolphin_fx_net`.
  Sheet: `docs/davethediver/dolphin_v3.jpg`. Nits: peek_wink ≈ peek_blink (use side views for winks).
- Real-life rooms/city: core library plates named in the SHOT_PLAN table (office_openplan, city_apartments_evening,
  living_room_night_gaming); Quest real-life library poses.

## 3. Block A timing (from timings.json `cues`, seconds; key every move to words, never typed seconds)
p01 0.30-2.51 "You finish work. You get home. You sit down." · p02 2.96-4.40 "And you start a second job." ·
p03 4.85-14.20 (dive / spear / oxygen runs out / By night … sushi) · p04 14.65-16.61 "Nobody pays you. Nobody makes you." ·
p05 17.06-21.95 "…sold more than ten million copies…" · p06 22.40-25.33 "Ten million people... clocking in. After clocking out." ·
p07 25.78-31.32 "…2023, Steam … 'Sit Back and Relax.'" · p08 32.12-32.84 **"So, why?"** → wordmark + **1.5 s silent hold**
(block A ends ≈ 34.3 s; p09 starts 34.34). SHOT_PLAN durations were estimated at 2.45 w/s: retime every shot to these words.

## 4. Build
1. Copy `tools/hyperframes_ep003` → `tools/hyperframes_davethediver` (skip `renders/`, `node_modules`; reuse via symlink/npm ci).
   Point it at `episodes/davethediver/timings.json` + narration.wav. Block A = the EP003 `hook` block pattern.
2. Shots A01-A21 per SHOT_PLAN. Code-made (free): cabin boat (simple, A06), underwater scene (gradient, god rays, caustics,
   kelp), HUD (O₂ dial bottom-left, 3 slanted slots bottom-right, struggle arc), odometer 10,000,000, punch-clock card, wordmark.
   Dolphin arc in A: A07 tangled in net → A09 freed (happy) → A10 peek at the bar window → A13 surfaces by the boat →
   A20 blows the heart ring that becomes the "o" of SecondQuest → A21 idles beside the "o" with a blink.
3. Render block A at **draft 480p** via `scene_cache.py`; run `framing_qc.py`, `pacing_qc.py`, finish pass; look at a contact
   sheet (every 0.5 s); fix; then send ONLY block A's clip + 3-line report. Missing art → placeholder card, listed in the report.
4. If the session grows long: 1-page handoff for block B and propose a new session.
