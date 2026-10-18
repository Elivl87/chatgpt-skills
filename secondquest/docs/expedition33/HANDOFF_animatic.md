# EP004 · Handoff → next session: placeholder voice + animatic (2026-10-18)

**Read first:** `secondquest/CLAUDE.md`, `docs/expedition33/PRODUCER_DECISIONS.md`, this page. Reply in Spanish; balance
in every report (live 9.25 on 2026-10-18). No rights request (Producer decision). Branch `claude/secondquest-pilot-hook-4yw8xj`.

## Done (session 2026-10-18)
- `OFFICIAL_ES_TERMS.md` + ES review updated (monolito, "Por aquellos que vendrán después", "Cuando uno cae, seguimos").
- `GAME_VISUAL_REFERENCE.md`, `asset_needs.json`, `ASSET_FIT.md` (library covers only real-life beats).
- `SHOT_PLAN.md` (paper-theatre silhouettes for the cast, Quest as the face, companion arc, music map, NEW_ART quote:
  tier 1 = 7.0, full = 9.0) + `DOPAMINE_PLAN.md` (all changes adopted).
- Voice A/B samples: `voice_test/A_fenrir_EP003_0.94.mp3`, `B_fenrir_lento_0.88.mp3` (`scripts/ep004-voice-samples.py`).

## Waiting on the Producer
1. NEW_ART approval (which tier / items). Record with `tools/credits/credits.py approve … --quote "<his words>"`.
2. Voice A or B. Then: full placeholder narration (adapt `scripts/ep003-placeholder-narration.py` to ep004:
   episodes/ep004/script.json from A_v2_3_EN.txt, HOOK_END = ¶08, chosen speed) → timings.json.
3. Music: OST (Producer supplies files, Content ID risk) or our own beds.

## Next steps (in order)
1. Environment: restore `public/art` (docs/ART_ARCHIVE.md: assets 628750961 + 652367306); Kokoro model files from
   kokoro-onnx release model-files-v1.0; `pip install kokoro-onnx soundfile imageio-ffmpeg scipy faster-whisper`.
2. Narration + STT check → `episodes/ep004/timings.json`.
3. Copy `tools/hyperframes_ep003` → `tools/hyperframes_ep004`; shared components: silhouette cut-out, speech bubble
   (tail on speaker), expedition HUD, petals, painted 33, journal, companion (props3d + expression set).
4. Block A first at 480p draft via `scene_cache.py`; builder self-checks (lint, frame_critic, framing_qc, pacing_qc);
   send ONLY block A. Then block by block. Stand-ins for unapproved NEW_ART marked MISSING (`MISSING_ART.md`).
5. Critics only on the final round. One Sonnet builder max; no polling during renders.
