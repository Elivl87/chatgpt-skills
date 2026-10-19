# Dave the Diver · Handoff → next session: dolphin build + Hyperframes animatic (2026-10-19)

**Read first:** `secondquest/CLAUDE.md`, `docs/davethediver/PRODUCER_DECISIONS.md` (2026-10-19 entry), this page. Reply in
Spanish; balance **1.75 credits** in every report. Branch `claude/secondquest-pilot-hook-4yw8xj`. Producer token rules:
director does small edits, max one Sonnet builder at a time, critics only on the final round, one background waiter, 480p drafts.

## Done (2026-10-19)
- Script JSON: `episodes/davethediver/script.json` (p01..p54, block A–H, hookEnd p08) from the LOCKED v1.1.
- Placeholder narration (Kokoro am_fenrir chain, no female quotes in v1.1 → no af_heart):
  `public/episodes/davethediver/audio/narration.wav` (NOT in git, regenerate below) + `episodes/davethediver/timings.json`
  (348 s; A 32.5 · B 52.1 · C 35.4 · D 50.5 · E 62.4 · F 52.2 · G 49.5 · H 7.7 s; p08 "So, why?" 32.12 → 1.5 s hold).
- props3d cast (job `python3 tools/props3d/render.py dtd_cast`, sheet `docs/davethediver/props3d_cast_v1.jpg`):
  Leo-Cobra (9 poses incl. armsCrossed), Max on bar stool w/ chopsticks, bar stool, bubble set (now only FX).
  Known nits: Cobra side-eye subtle behind shades; pop droplets shard-like; Max boots near stool ring.
- Companion changed by the Producer → **pink dolphin** (our design). Oxygen = game HUD only (bottom-left O₂ dial, depth
  + red overweight panel, bottom-right 3 slots, harpoon struggle arc) — `GAME_VISUAL_REFERENCE.md` line ~215.
- `SHOT_PLAN.md` (186 shots, built on a 2.45 w/s estimate: retime to timings.json, the real read is ~17 % faster) +
  `DOPAMINE_PLAN.md` + `asset_needs.json` + `docs/asset_fit/*`. Block F is the weakest (silhouettes for Duff/Otto/Sea People).

## Restore in a new container (one command, ~10 min, run in background with one waiter)
`cd secondquest && bash scripts/dtd_restore.sh <scratchpad dir>` → public/art (archives), pixel sprites, plates (Higgsfield
URLs), props3d cast, Kokoro + narration.wav (timings.json is already in git). Do not re-run anything it already did.

## Next steps (in order)
1. **Pink dolphin in props3d** (one Sonnet builder; spec in SHOT_PLAN.md "Dolphin build spec"; fish2 eye/lid rig;
   expressions + poses incl. bubble-ring and leap) → sheet `docs/davethediver/dolphin_v1.jpg` → report.
2. **Plates DONE** (2.0 cr, balance 1.75): `public/art/davethediver/plates/` bar_interior_night + bay_exterior_dusk; QC `docs/art_orders/davethediver/plates/QC.md`. Restore by re-downloading the job URLs if the container is new (job ids in QC.md).
   optional Quest dive poses +0.5 each. Do not generate before an explicit "sí".
3. **Animatic**: copy `tools/hyperframes_ep003` → `tools/hyperframes_davethediver`, keyed to timings.json words; block A
   first at 480p via `scene_cache.py`; framing_qc + pacing_qc; send only block A. Placeholder plates where NEW_ART is pending.
