# EP003 handoff → new session (2026-10-17)

Producer: Eli. Reply in Spanish. Read `secondquest/CLAUDE.md` first (all rules; newest at the bottom: agent model tiers,
resources and rounds). Branch `claude/secondquest-pilot-hook-4yw8xj`. Credits: **9.25** (report in every update).
The Producer decides what runs next: after this handoff, do ONLY what is listed under "Do now", report, and wait.

## UPDATE 2026-10-17 (end of session 2): read this first
The Producer's uploaded cut is now the base: `docs/ep003/EP003_BASE_PRODUCER.mp4` (see PRODUCER_DECISIONS.md,
"The base is the Producer's cut, improve only"). Start by identifying which version produced it and restore it; then
only improve it. Session 2 built a scene render cache (`tools/hyperframes_ep003/scene_cache.py`, SCENE_CACHE.md), the
HUD_OVER_CHARACTER gate and G seek-safety fixes (pushed); its D/E fix edits were stopped unfinished and not pushed.
Env note: `public/art` is not in git: restore it from the `archive-art-2026-10-10` Release; EP003 3D is re-rendered
with `python3 tools/props3d/render.py ep003_props ep003_gameworld fish2 friends friends_talk friends_sitflat friends_boat`
(one job per call, ~20 min); then `npm ci` at secondquest/ and in tools/hyperframes_ep003, `pip install opencv-python-headless imageio-ffmpeg`.

## Where EP003 is
- Script LOCKED v3.3 (new hook approved; Bram audio approved, 0.3 credits for line H8). `docs/ep003/EP003_SCRIPT_v33_EN.md` / `_ES419.md`.
- Hyperframes project: `tools/hyperframes_ep003/` (blocks hook/A, B, C, D, E, F, G; `render_block.sh`, `join_episode.py`,
  `build.py`, `scripts/ep003-sfx.py` for the mix). Review cut: `docs/ep003/hyperframes/EP003_full_hyperframes_review.mp4`
  (720p, 328.4 s, −14.3 LUFS). Builder notes: `docs/ep003/hyperframes/CRITIC_v33_NOTES.md` (all rounds).
- **Retention critic: PASS** on the full episode (`CRITIC_FINAL_retention.md`).
- **Design critic: FIX** (`CRITIC_FINAL_design.md`). A, B, C are clean and unchanged; everyone is inside every boat.

## Do now (Producer approved items 1, 2 and 4 of the optimisation plan)
1. **Item 2, faster rendering (build first, keep it small, ≤ 1 h):** scene-level render cache in
   `tools/hyperframes_ep003` (split each block into its scenes, hash each scene's inputs, re-render only changed scenes,
   concat), plus a draft quality switch (480p / lower fps) for iteration rounds. Prove it on one block.
2. **Fix the 6 blocking design items** (episode time / block-local time), then re-render only the changed scenes:
   1. 138.3–139.0 (D 32.3–33.0): "JOB: silence" badge covers Quest's face → move it off the face.
   2. 110.1–115.8 (D 4.1–9.8): $7.99 PAID still on Max's "Bought." + 11:43 → put it on the empty phone background,
      SOLVED disc clear of it. Remove its `data-critic-allow-overlap`.
   3. 208.45–209.25 (E 45.2–46.0): FAIL ×3 card over the suspects' heads → keep it clear.
   4. 213.0–215.3 (E 49.7–52.0): hearts pill on Quest's head, Pixie cut by the frame edge → move hearts; Pixie fully in or out.
   5. 233.0–234.5 (E 69.7–71.2): 2026→2031 roll passes over the "$0" polaroid → roll away from it.
   6. 311.40–311.70 (G 17.5–17.8): orphan TUTORIAL chip → it leaves with HOW TO FISH (clears the G check error).
   Cheap non-blocking: 127.6 bubble across Quest's face; 270.0–272.2 Pixie cut by the frame edge; 139.0 whip → cut
   (blur budget); 159.70 NEWEST stamp ghost + on Max's timestamp; 181.1–182.3 boss bar touching heads; 136.5–139 "a
   reason" tag over the fish's face.
   Retention optional polish: pad the mix to 328.4 s with the night bed so the end-card splash rings out; raise the
   277.1 clock cue 4–6 dB.
3. Add a `HUD_OVER_CHARACTER` check to `scripts/frame_critic.py` (HUD/cards/stamps over a `data-role="character"`).
4. Builder pre-critic gates (CLAUDE.md), then ONE design critic (Opus, frame-critic skill) on the changed windows only.
5. If PASS: send the Producer the 720p review (it is < 30 MB, send directly) and STOP. The final master render needs
   his explicit approval.

## Model tiers
Director: Opus. Critics: Opus. Builder for this fix list: Sonnet (move up to Opus if it fails twice). Mechanical: Haiku.

## Other open items (not now; for the Producer to schedule)
- EP003: thumbnail (free version: our boat 3D + cut-outs, NOT FISHING), publish package, Shorts with the new frame-0
  rule, ES dub (credits).
- Expedition 33 (EP004/EP005): script LOCKED v2.3 (`docs/expedition33/scripts/A_v2_3_EN.txt`); pending Bram quote
  (~24 credits), rights permission request, official ES-419 terms copied from the game.
- EP002: Short #2 published 2026-10-15; analytics read pending (`docs/publish/CHANNEL_STATS_2026-10-15.md`).
