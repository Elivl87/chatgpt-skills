# Dave the Diver · Handoff → next session: shot plan, art quote, narration, animatic (2026-10-18)

**Read first:** `secondquest/CLAUDE.md`, `docs/davethediver/PRODUCER_DECISIONS.md`, this page. Reply in Spanish; balance in
every report (9.25 credits, live-checked 2026-10-18). Branch `claude/secondquest-pilot-hook-4yw8xj`.

## Locked / decided
- Script LOCKED: `scripts/DTD_v1_1_EN.txt` (986 words ≈ 6:40). ES review: `scripts/DTD_v1_1_ES_review.md`.
- Title: must start with "Why" + game name (Producer picks from the options in the last report).
- Companion: air bubble = oxygen left (props3d sphere + EP003 fish eye rig, expression set + size); hook "So, why?" →
  becomes the "o"; end → pops into the gold bar. Cameo: EP003 fish (in the bar's aquarium tank).
- Voices: placeholder = Kokoro fenrir chain (`scripts/ep003-placeholder-narration.py` settings); female quotes = af_heart.
- Research: `RESEARCH.md` (facts + NUMBERS), `RESONANCE.md`, `GAME_VISUAL_REFERENCE.md` (§0 = eyes-on boat, suit, bar,
  HUD from official images; P1/P2/P3 needs list), `COMPANION.md`.

## Next steps (in order)
1. Restore `public/art` (docs/ART_ARCHIVE.md: assets 628750961 + 652367306) + Kokoro files (kokoro-onnx release
   model-files-v1.0) + `pip install kokoro-onnx soundfile imageio-ffmpeg scipy librosa`.
2. `asset_needs.json` + `npm run assets:find` + look at sheets; EP003 props3d reuse (fish2 + expressions, Leo/Max,
   lighthouse, lantern, grill, POV hands). Note the reuse warning (M1, >30 %): new framings per scene.
3. SHOT_PLAN by blocks (A hook … H CTA) + dopamine review (one agent) + companion arc + every-text-has-a-source.
   Visual plan: Quest in his OWN dive costume (identity kept, differs from Dave: no hood, our colours); NEW props3d
   cabin boat (canopy + searchlight family, our name/colours); Bancho-style floating bar under karst cliffs (painted
   plate); underwater fully procedural (gradient, caustics, god rays, bubbles, kelp, marine snow, schools); HUD in code
   (O₂ dial, depth, weight, dive results, bar HUD, phone with Cooksta).
4. NEW_ART quote (Higgsfield, 0.5/1k, 1.0/2k): likely Quest-in-dive-costume pose(s) + bar interior plate + bay
   exterior plate ≈ 1.5–2.5. Wait for the Producer's explicit approval before generating.
5. Placeholder narration (fenrir + heart) → timings → Hyperframes animatic (copy `tools/hyperframes_ep003`), block A
   first at 480p draft via `scene_cache.py`; send only the current block. Critics only on the final round.
