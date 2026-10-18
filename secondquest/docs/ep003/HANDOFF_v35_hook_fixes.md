# EP003 v3.5 · hook fixes (Producer, 2026-10-18) · handoff for a fresh session

Branch `claude/secondquest-pilot-hook-4yw8xj`. Sources: hook = `tools/hyperframes_ep003/src/index.template.html`
(+ `src/components/chat.html`). Master recipe: `docs/ep003/v34/README.md` (C–G come from the 717b244d worktree +
`base_717b244d_CDEG_v34.patch`; only the hook changes here, so only block A re-renders, then `assemble_master.sh`).

1. **0:28 (H7, "I'll get it later.")**: Leo is not visible (only his yellow beanie shows in the boat) and the speech
   bubble's tail points at the empty bow; Max is half hidden behind Quest. Fix: Leo seated and visible in his own seat
   (side-eye face), bubble tail pointing at him; Max not covered by Quest. Check the whole hook for anyone hidden or a
   bubble that does not point at its speaker.
2. **Group chat (0:13–0:26)**: every message has the sender's avatar except Quest's own "Bought." (right side).
   Give Quest's own messages his avatar too (ChatPhone `sticker(..., { name: true })` → also an avatar; e.g. an
   `opt.avatar` that appends `avatar(who, pad)` after the bubble on `.out` rows), consistent with the others.
3. Optional, same pass if cheap: block D chat (≈1:50) Quest's red "Bought." has no name (base cut, 717b244d worktree).

Then: re-render A with `scene_cache.py A` (changed scenes only), check frames at 0:13–0:30, rebuild the master with
`docs/ep003/v34/assemble_master.sh` (inputs: A/B from this repo's renders, C–G from the base worktree; re-create the
worktree + patch if the container is new), deliver as a new draft Release `deliver-ep003-master-1080p-v35`. 0 credits.
