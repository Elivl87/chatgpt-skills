# Dave the Diver · Handoff → next session: Hyperframes animatic, block A (2026-10-19)

**Read first:** `secondquest/CLAUDE.md`, `docs/davethediver/PRODUCER_DECISIONS.md`, this page. Reply in Spanish; balance
**1.75 credits** in every report. Branch `claude/secondquest-pilot-hook-4yw8xj`. Token rules: director does small edits,
max one Sonnet builder at a time (Opus if Sonnet fails twice), critics only on the final round, one background waiter, 480p drafts.

## Done (2026-10-19)
- Restore: `bash scripts/dtd_restore.sh <scratch>` (now installs opencv/numpy first). Narration audio is gitignored;
  `timings.json` re-aligned to the restored narration (word shifts ~10-20 ms) and committed.
- **Pink dolphin v3** (Producer: "que sea super fiel al del juego"; reference screenshot described in PRODUCER_DECISIONS):
  props3d `dolphin` / `dolphinNet`; jobs `python3 tools/props3d/render.py dtd_dolphin` (+`DTD_ONLY=`) and `dtd_dolphin_sheet`
  → `docs/davethediver/dolphin_v3.jpg` (v1/v2 kept). 24 cut-outs in `public/art/davethediver/props3d/dolphin_*.png`
  (not in git; re-run the job in a new container, ~10 min): swimSide ×6 expr, swim34 ×4, leap_happy, ring happy/wink,
  tangled_worried, peek (head close-up) ×6, grey_swimSide_neutral, fx_heart_ring, fx_heart_bubble, fx_net.
- Known nits: peek_wink ≈ peek_blink (only near eye visible: use a side view for winks); peek beak a bit short; small
  dark tick at the beak tip on open mouths; side laugh tongue not visible.

## Next (in order)
1. Re-run `dtd_dolphin` if the PNGs are missing (new container).
2. **Animatic**: copy `tools/hyperframes_ep003` → `tools/hyperframes_davethediver`, keyed to `episodes/davethediver/timings.json`
   words; block A (0–32.5 s, p01–p08, hook ends "So, why?" at 32.12 + 1.5 s wordmark hold with the dolphin interacting)
   first at 480p via `scene_cache.py`; shots from `SHOT_PLAN.md` block A, retimed; HUD per GAME_VISUAL_REFERENCE ~l.215.
   Plates: `public/art/davethediver/plates/` (bar_interior_night, bay_exterior_dusk). framing_qc + pacing_qc; send only block A.
