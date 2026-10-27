# Dave the Diver · Handoff → next session: after the full animatic (2026-10-27)

Self-contained. Read ONLY this page, `secondquest/CLAUDE.md`, the tail of `docs/davethediver/PRODUCER_DECISIONS.md` and
`docs/davethediver/CRITIC_animatic_v1.md`. Reply in Spanish, short; balance **1.75 credits** in every report.
**Agent split (Producer, 2026-10-25):** every build/fix/render on Sonnet builders (one at a time); the director (Opus) only
reviews. The Producer said (2026-10-27): "No me preguntes más, continúa; usa Hyperframes y Three al máximo, todo gratis".

## State
- Animatic A-H complete in `tools/hyperframes_davethediver` (templates `src/block<X>.template.html`), placeholder voice
  "Fenrir natural", SFX pass by `dtd_sfx.py` (68 cues, 8 ambience beds, sfx_audit 0/0), master -14.3 LUFS via `join.py`.
- 720p review v2 delivered (draft Release `deliver-dtd-animatic-720p-v2`, 361.1 s) after the critic's 16 fixes (commit 5090567).
  v1 (`deliver-dtd-animatic-720p-v1`) had a CSS band in G/H: obsolete; `cleanup-deliveries.yml` removes it after 7 days.
- Restore in a new container: `bash scripts/dtd_restore.sh <scratch>/dtd`, then `npm ci` in the project; `env.sh` finds
  the browser. Renders: `QUALITY=draft|review python3 scene_cache.py <X>`; delete `renders/scene_cache/block<X>` +
  `renders/fp_block<X>_<q>.json` when only overlays outside clips change (stale-cache gotcha).

## Open items
1. C ~34.5 s (full 129.5-130 s): black strip at the left edge for ~0.5 s during the C19 wipe. Fix + re-render C.
2. B11/B12: the tank now shows the EP003 fish under "SOLD OUT" (critic asked for staging), which softens the line
   "no fish". Producer to choose: dim/empty tank + Pixie/Max, or keep.
3. Missing art drawn as code stand-ins: Duff, Otto, Sea People (F), fisher silhouettes (G). Quote credits only if the
   Producer asks for real art.
4. Bram EN narration (~16.7 credits; balance 1.75): blocked on credits. When available: record, re-align timings.json
   (word tokens re-time everything incl. SFX), re-render, critic pass on changed windows, then final render only with
   the Producer's approval.
