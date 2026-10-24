# Dave the Diver · Handoff → next session: Hyperframes animatic, block C (2026-10-24)

Self-contained. **Read ONLY:** this page, `secondquest/CLAUDE.md`, `docs/davethediver/SHOT_PLAN.md` lines 21-31 (HUD spec,
dolphin arc) and 90-113 (block C table), the tail of `docs/davethediver/PRODUCER_DECISIONS.md` (from "Block A animatic v1
review" on). Everything else by grep/line range. The script is LOCKED: `docs/davethediver/scripts/DTD_v1_2_EN.txt`.

**Rules:** reply in Spanish, short; balance **1.75 credits** in every report (no spend without a quote + explicit "sí").
Branch `claude/secondquest-pilot-hook-4yw8xj` (another session also pushes there: `git pull --no-rebase` before push,
never rebase). Director does small edits; max one builder at a time (Sonnet; never Fable); critics only on the final
round of the full animatic; one background waiter, no polling; 480p drafts; send ONLY block C's clip.
**Budget:** Claude usage < 60 % of the weekly plan: one block per session, ask the Producer for the current % in the
report, end with a block D handoff. No Bram until the end (placeholder "Fenrir natural").

## 1. Restore (background, ~6 min, one waiter)
`cd secondquest && bash scripts/dtd_restore.sh <scratchpad>/dtd > <scratchpad>/restore.log 2>&1` → "restore done: 662 art
files". Then `cd tools/hyperframes_davethediver && npm ci` (node_modules is not restored). `env.sh` now finds whichever
chromium headless shell is installed. Commit `episodes/davethediver/timings.json` if it moves by a few ms.

## 2. Project
`tools/hyperframes_davethediver/` — same method as A/B: word tokens relative to the block start (`{{p17.w2}}`, `{{DUR}}`);
block C = p17..p20 (`blocks.py span('C')`). Build: `source ./env.sh && python3 stage_assets.py --block C && python3
build.py --block C`; render `QUALITY=draft python3 scene_cache.py C` → `renders/blocks/DTD_blockC_480p.mp4`. Commit
`src/blockC.template.html`, `src/blockC.assets.json` and the `blockC/` skeleton (blockA/B are tracked; their
assets/renders are gitignored). References: `src/blockA.template.html` (sea, boat 3D layers, under+HUD, bar, living
room, dolphin set) and `src/blockB.template.html` (deck props, Leo/Cobra shots, contract cards, office, dock at dusk).

## 3. Producer's staging rules (apply everywhere)
Boat = props3d SECOND WIND 02, Quest ON the deck between back/front layers · bar: Pixie chef inside the counter,
aquarium = EP003 fish (never the dolphin), customers at the counter (Max + Leo + re-dyed worm people, no clones), food
never on top of a character, tray-run sprite 240 px · living room: Quest on the rug facing the TV (`07_floor_gaming`),
TV = our DTD title screen · pink dolphin always in water; a second dolphin is grey · recolours = palette swap only ·
nothing half out of frame at the end of a camera move · camera breathes, no snap back on a shared background.

## 4. Block B status (v1 sent 2026-10-24, waiting for the Producer's notes)
55.1 s, 27 shots, all real art (no placeholders). Known weak spots to fix if the Producer agrees: Quest small in
B01-B03 (wide boat), patchy "emptied" aquarium B11, folded deckchair stripe B09-B10, small nigiri icon, thin rope and
"HOLD ON TO THAT" over the funnel B26-B27, dolphin partly behind the dock B26-B27. Apply his block-B notes first.

## 5. Build block C
Shots per the SHOT_PLAN table (lines 90-113), retimed to the words; missing art → placeholder card, listed. Render 480p,
contact sheet every 0.5 s, look at a few full-size frames, fix, send ONLY block C + a 3-line report + block D handoff.
