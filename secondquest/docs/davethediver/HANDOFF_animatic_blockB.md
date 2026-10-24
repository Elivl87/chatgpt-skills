# Dave the Diver · Handoff → next session: Hyperframes animatic, block B (2026-10-24)

Self-contained. **Read ONLY:** this page, `secondquest/CLAUDE.md`, `docs/davethediver/SHOT_PLAN.md` lines 21-31 (HUD spec,
dolphin arc) and 58-89 (block B table), the tail of `docs/davethediver/PRODUCER_DECISIONS.md` (from "Block A animatic v1
review" on). Everything else by grep/line range. The script is LOCKED: `docs/davethediver/scripts/DTD_v1_2_EN.txt`.

**Rules:** reply in Spanish, short; balance **1.75 credits** in every report (no spend without a quote + explicit "sí").
Branch `claude/secondquest-pilot-hook-4yw8xj` (another session also pushes EP001 work there: `git pull` before push,
merge, never rebase). Director does small edits; max one builder at a time (Sonnet; Opus for a new 3D model); critics
only on the final round; one background waiter, no polling; 480p drafts; send ONLY block B's clip.

## 1. Restore (background, ~8 min, one waiter)
`cd secondquest && bash scripts/dtd_restore.sh <scratchpad>/dtd > <scratchpad>/restore.log 2>&1` → "restore done".
It pulls the art archives, installs deps and regenerates `narration.wav` with the APPROVED voice "Fenrir natural"
(Kokoro am_fenrir, full model, sentence breaths, 0.92, no EQ/pitch). If `episodes/davethediver/timings.json` moves by a
few ms, commit it. The art made while building block A (dive boat SECOND WIND 02, grey dolphin leap, blue-suit swim pose) is in
`archive-art-dtd-2026-10-24` (asset 672866345) and the restore pulls it; nothing to re-render.

## 2. Project
`tools/hyperframes_davethediver/` — every block is authored on the current narration with word tokens relative to the
block start (`{{p09.w2}}`, `{{p09.w2.end}}`, `{{DUR}}`). Spans (`blocks.py`): **B = p09..p16, 40.08 → 95.14 s (55.1 s)**.
Build: `source ./env.sh && python3 stage_assets.py --block B && python3 build.py --block B` (creates `blockB/` from the
`hook/` skeleton). Render: `QUALITY=draft python3 scene_cache.py B` → `renders/blocks/DTD_blockB_480p.mp4`.
`src/blockA.template.html` is the reference: `rig/focus/camTo/breathe`, `buildSea(day|dawn|sunrise)` + the 3D boat
back/front layers, `buildUnder` + `buildHud`, `buildBar(host, opts)` (Pixie chef, EP003 fish tank, Max + customers),
`floorQ` + `tvTitle` (living room), `splash` (seeded), the dolphin set. Copy what you need into `src/blockB.template.html`.

## 3. What the Producer taught us on block A (apply everywhere)
- Boat = our props3d SECOND WIND 02 (never a code-drawn boat); Quest stands ON the deck between the back/front layers.
- Bar: Pixie is the chef INSIDE the counter (customers' counter hides her below the waist); the aquarium holds the
  EP003 fish, never the dolphin; customers at the counter (Max on his stool + Leo + re-dyed worm people, no clones);
  **food/plates never sit on top of a character**; Quest's tray-run sprite at 240 px.
- Real-life living room: Quest sits on the rug facing the TV (`07_floor_gaming`), never on the sofa; the TV shows our
  DTD title screen (official cover only if the Producer supplies it).
- Second dolphin in a shot = a normal grey dolphin; ours stays pink. Dolphin always in water.
- Recolours change ONLY the asked colour (palette swap), never gloves/mask details.
- Nothing half out of frame at the end of a camera move; check every framing of a multi-cut shot.

## 4. Build block B
Shots B01-B27 per the SHOT_PLAN table, retimed to the words. Missing art → placeholder card, listed in the report.
Render 480p, contact sheet every 0.5 s, fix, then send ONLY block B + a 3-line report. If the session grows long:
a 1-page handoff for block C and propose a new session.
