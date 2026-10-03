# SecondQuest: standing rules for Claude

- **Respond to the Producer in Spanish.**
- **Packaging and publishing** (thumbnails, titles, descriptions, tags, hook, subtitles, publishing checklist): follow `docs/PUBLISHING_STANDARD.md` and `docs/THUMBNAIL_RULES.md`. They are binding.
- **Any image showing Quest:** follow `docs/QUEST_V1_PROMPT_SPEC.md` (identity block, references, QC). Report every defect; never present a failing image as acceptable.
- **Credits:** quote every Higgsfield spend and get the Producer's explicit approval before generating.
- **Final renders:** never render one without the Producer's explicit approval.
- **Camera continuity (Producer rule, never break):** when two consecutive scenes use the same background, the second must not snap back to the opening framing and start again (it looks cropped).
  - It either continues the camera from where the previous scene ended, or cuts to a clearly different shot.
  - A background that returns later in the video is fine.
  - Camera moves are used only where the script calls for them, for dynamism. Not every shot moves.
  - The engine enforces this with a `CAMERA_JUMP` error (`src/engine/cameraContinuity.ts`) that blocks the render.
- **Always improve (Producer rule):** blocking a defect is not enough.
  - Before executing any stage, and in every report, recommend concrete improvements: what could be better, how, and what it costs.
  - The Producer decides which improvements go in.
- **Scripts are never edited by Claude (Producer rule):** the approved script is used verbatim.
  - Any check on a script (originality, structure, length) only reports to the Producer; it never rewrites.
- **EP001 is published and final (Producer rule):** never re-render, regenerate or publish another version of it. EP001 is only research and test material for the engine.
- **Generated art is not modified (Producer rule):** improve the engine, never edit approved art.
  - Quality checks never remove, reject or block art; they only give the Producer recommendations.
