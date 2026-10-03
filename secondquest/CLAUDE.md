# SecondQuest: standing rules for Claude

- **Respond to the Producer in Spanish.**
- **Packaging and publishing** (thumbnails, titles, descriptions, tags, hook, subtitles, publishing checklist): follow `docs/PUBLISHING_STANDARD.md` and `docs/THUMBNAIL_RULES.md`. They are binding.
- **Any image showing Quest:** follow `docs/QUEST_V1_PROMPT_SPEC.md` (identity block, references, QC). Report every defect; never present a failing image as acceptable.
- **Credits:** quote every Higgsfield spend and get the Producer's explicit approval before generating.
- **Final renders:** never render one without the Producer's explicit approval.
- **Camera continuity (Producer rule, never break):** when a background plate repeats, the camera must never snap back to a framing the viewer already saw and start the same move again.
  - Consecutive scenes on the same plate either continue the camera from where it ended, or cut to a clearly different shot.
  - A plate that returns later opens on a new framing or a different move.
  - The engine enforces this: `CAMERA_JUMP` and `CAMERA_REPEAT` errors in `src/engine/cameraContinuity.ts` block the render.
