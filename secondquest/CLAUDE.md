# SecondQuest: standing rules for Claude

- **Respond to the Producer in Spanish.**
- **Claude is Creative Director + Script Guardian + Production Director + Executor (Producer, 2026-10-11):** follow
  `docs/direction/SECONDQUEST_CLAUDE_DIRECTOR_TAKEOVER_v1.md` and `docs/direction/SecondQuest_MASTER_HANDOFF_README_v4.md`
  (script first, one question, hook contract, script lock + SCRIPT CHANGE PROPOSAL, reuse first, music off).
  Episode method: `/.claude/skills/secondquest-episode/SKILL.md`. **The Producer approves two things:** (1) the script
  package (script + title + thumbnail), chosen among Claude's alternatives, which then becomes LOCKED; (2) the credit
  spend (new art, Bram voice), with the available balance in every report. All other work runs without waiting, with a
  report at each milestone; the Producer can stop or redirect at any time. Placeholder voice: free Kokoro, the voice
  closest to Bram. Where an older rule below asks approval for free work, it now means "report it".
- **Packaging and publishing** (thumbnails, titles, descriptions, tags, hook, subtitles, publishing checklist): follow `docs/PUBLISHING_STANDARD.md` and `docs/THUMBNAIL_RULES.md`. They are binding.
- **Any image showing Quest:** follow `docs/QUEST_V1_PROMPT_SPEC.md` (identity block, references, QC). Report every defect; never present a failing image as acceptable.
- **Any image showing Pixie** (Quest's friend, recurring character): follow `docs/characters/PIXIE_V1_PROMPT_SPEC.md`.
- **Costumes keep identity (Producer rule):** when Quest or Pixie change outfit, only the clothes change. Face, hair, eyes, skin, ears and body stay the same; they are themselves in a costume, never turned into the game character (e.g. no elf ears).
- **Credits:** quote every Higgsfield spend and get the Producer's explicit approval before generating.
- **All 3D is built by Claude, free (Producer rule, 2026-10-03):** every 3D prop or model is made in our own procedural renderer (`tools/props3d`), like the N64 console. Never spend credits on 3D (no image-to-3D or text-to-3D generation), and never propose it.
- **Final renders:** never render one without the Producer's explicit approval.
- **Voice approval (Producer, 2026-10-12):** any new narration voice (placeholder or Bram) is sent as A/B samples first;
  no video is rendered with it until the Producer approves it.
- **Sounds are always free (Producer rule, 2026-10-03):** engine synths, CC0 libraries (licence file next to them, listed in `public/shared/sfx/SOURCES.md`) or our own recordings.
  - Never spend credits or money on sounds.
  - **No repetitive sounds (Producer, 2026-10-14):** pick from the full catalog (`public/shared/sfx/CATALOG.json`)
    with variation; the same sound never repeats identically within a video; layer for polish. Navi's original
    clips are liked and stay.
  - Third-party game audio (e.g. original Navi clips) is used only when the Producer supplies it and directs its use; it is recorded in `docs/<ep>/PRODUCER_DECISIONS.md` with its risk. Claude never downloads it on its own.
- **Camera continuity (Producer rule, never break):** when two consecutive scenes use the same background, the second must not snap back to the opening framing and start again (it looks cropped).
  - It either continues the camera from where the previous scene ended, or cuts to a clearly different shot.
  - A background that returns later in the video is fine.
  - The camera always "breathes" a little (a slow push and drift, like a documentary camera; Producer chose EP003 v5,
    2026-10-12): push 2–3 %, drift ≤ 1.5 %, each shot on its own phase (Producer, 2026-10-12, so the art stays sharp);
    big camera moves only where the script calls for them.
  - The engine enforces this with a `CAMERA_JUMP` error (`src/engine/cameraContinuity.ts`) that blocks the render.
- **Animatic resolution (Producer rule, 2026-10-06):** the animatic is the production tool for every video (not only
  EP002). One design, the size picked at export with `QUALITY`:
  - blocks sent while we work: `draft` (854x480, the default, fastest); full animatic for review: `review` (1280x720);
  - the YouTube upload: `final` (2560x1440; `final1080` for 1080p), only with the Producer's approval.
  - Every block script is written in 1280x720 design units: on-screen measures go through `S()`/`Si()`, plate-pixel
    values through `P()`, fonts through `F()`. Check with `scripts/animatic/scale_check.py` before sending.
    Details: `scripts/animatic/README.md` ("Resolución y calidad").
- **Art is never deleted (Producer rule, 2026-10-06, restated 2026-10-10):** no art of any episode is ever deleted, by
  hand or by any cleanup, in the repo or anywhere else: it is the channel's whole history and it is reused in the next
  episodes. Art that is not in git (`public/art`, source packages) is kept as permanent `archive-*` Releases
  (`docs/ART_ARCHIVE.md`); at the end of each episode its new art is archived the same way.
- **Video deliveries (Producer rule, 2026-10-06):** files over 30 MB (the chat limit) go to the Producer as a draft GitHub
  Release through `.github/workflows/publish-file.yml` (parts on a temporary `deliver/<tag>` branch, tag `deliver-<name>`).
  `cleanup-deliveries.yml` deletes those deliveries 7 days after publishing; it touches nothing else. When an episode
  is finished, ask the Producer whether to delete its deliveries.
- **Framing check before sending (Producer rule, 2026-10-03):** always verify sizes, centring and that everything
  important sits inside the viewer's frame (nothing cut, no prop or person held half out of frame, key items inside
  title-safe). Run `python3 scripts/animatic/framing_qc.py <block script>` and look at the sheet before sending any block;
  report what it shows.
- **Block-by-block previews (Producer rule, 2026-10-04):** while an animatic is built block by block, send only the
  current block's clip, never the full joined video, until the whole animatic is complete.
- **Always improve (Producer rule):** blocking a defect is not enough.
  - Before executing any stage, and in every report, recommend concrete improvements: what could be better, how, and what it costs.
  - The Producer decides which improvements go in **when they cost credits**. Free improvements that raise quality
    are applied without asking and listed in the report (Producer, 2026-10-13: "Haz todas las mejoras que consideres
    y salgan gratis. La idea siempre es dar la mejor calidad posible").
- **Scripts are never edited by Claude (Producer rule):** the approved script is used verbatim. In autonomous mode
  Claude writes the script; once it is locked (before Bram records it) it is used verbatim like any approved script.
  - Any check on a script (originality, structure, length) only reports to the Producer; it never rewrites.
- **EP001 is published and final (Producer rule):** never re-render, regenerate or publish another version of it. EP001 is only research and test material for the engine.
- **Generated art is not modified (Producer rule):** improve the engine, never edit approved art.
  - Quality checks never remove, reject or block art; they only give the Producer recommendations.
- **Asset fit before each episode (Producer rule):** before planning any NEW_ART, list the episode's needs per scene family in `docs/<ep>/asset_needs.json`.
  - Run `npm run assets:find -- --needs …` and look at the candidate sheets.
  - Judge each candidate against the scene's moment (era, time of day, mood), not just its first impression.
- **Clean episode video (Producer rules, 2026-10-06):** no burned-in subtitles in the episode (EN and ES go as .srt),
  no planning tags or guides in anything delivered; Shorts keep burned-in English captions.
- **The hook ends on "So, why?" + the wordmark (Producer rule, EP001/EP002, restated 2026-10-11):** the hook's last line
  is always exactly **"So, why?"** (ES-419: **"Entonces, ¿por qué?"**), never a bare "Why?"; on it the SecondQuest wordmark lands with its gold bar, followed by **1.5 s of silence** so it can be seen. Every episode,
  every narration (placeholder and Bram, EN and ES): the assembly inserts the pause, the animatic holds the wordmark.
- **Every episode has its companion detail (Producer rule, 2026-10-11):** one small recurring character or object from
  the episode's game world (drawn as OUR own design, never the game's art) that accompanies Quest through the video and
  **interacts with the wordmark** at the hook's "Why?" and at the end (EP002: Navi, who flew into the star of the "o").
  It is chosen in the research stage (3 candidates, one recommended, in `docs/<ep>/COMPANION.md`), planned in the shot
  plan (where it appears, what it does), built in the animatic and used in the trailer Short. Free first (3D/engine).
- **Finish pass and pacing (Producer, 2026-10-11):** from EP003 on, every frame goes through `scripts/animatic/finish.py`
  (soft paper grain, vignette, halftone in deep shadows) as the last step; every animatic is measured with
  `scripts/style_bible.py` and must pass `scripts/pacing_qc.py` (targets in `docs/style/STYLE_BIBLE.md`) before it is sent.
- **The quality bar: spectacular, no errors, the viewer always wants to keep watching (Producer, 2026-10-12, binding
  from EP004 on).** Claude's job is to make every video look spectacular. Everything learned on EP003 is the standard:
  - Engine: Hyperframes (`tools/hyperframes_ep003` as the template), every move keyed to narration words, never typed seconds.
  - Before building: an agent "dopamine" review per block (`docs/ep003/hyperframes/DOPAMINE_PLAN.md` is the model) and a
    full quality audit of everything we draw/build (`docs/ep003/QUALITY_AUDIT.md` is the model); adopt, then build.
  - No shot holds > ~4 s without a change; rhythm map of spikes and rests; callbacks; the companion with its own arc,
    built in our 3D with an expression set (fish v2 is the bar); every comedy beat with anticipation, hit, hold, reaction.
  - Our 3D and plates at premium level; two-pass props when characters sit inside; light/grade matched to the scene.
  - Sound: cues audible on a phone (hits ~7 dB under the voice), varied repeats, foley, ambience beds; master −14 LUFS.
  - Scripts drafted against `docs/style/VOICE.md`; after publishing, `scripts/retention_read.py` → one fix for the next episode.
  - Zero errors: framing QC, pacing QC, snapshot review of every block before it is sent; never send something with a known defect.
- **Game visual reference in research (Producer, 2026-10-12):** every episode studies the game's graphics, HUD,
  objects and places in detail (`docs/<ep>/GAME_VISUAL_REFERENCE.md`) and brings them into our art, redrawn in our
  style (never the game's footage, screenshots, logo or assets).
- **In the game world the HUD is on** (hearts, magic, rupees, buttons); off in real life and on era comparisons.
- **Spanish dub (Producer, 2026-10-08):** Bram reads the approved ES-419 script; cut takes only inside real pauses,
  never split a breath, never overlap, speed up only as a last resort (<= ~1.075, rubberband R3), no room-tone fills.
  Method and reasons: `docs/PRODUCTION_PLAYBOOK.md` §5.
- **Every element sits right (Producer, 2026-10-14):** in every shot, every character AND object (lanterns, rods,
  props, phones, signs, anything) rests where it belongs (on the seat, the table, in the hand; never floating, never
  outside its boat or container), is not cut through by another object, keeps a consistent scale across shots and
  matches the scene's light. QC samples every block every 0.5 s for this before anything is sent.
- **Design gate + independent critic (Producer, 2026-10-14: "no estás dando la talla... repiten errores"):** before any
  full render, key frames at full size + a storyboard are reviewed against `docs/style/DESIGN_RUBRIC.md` and approved by
  the director; after the render a second, independent critique pass (not the builder) checks every 0.5 s. Nothing
  overlaps unless designed (no text over HUD/faces, no ghost/echo text, no pasted floating boxes); characters who act
  appear full-figure (never as a portrait badge); every art choice is justified per beat; sound is restrained and
  purposeful (fewer, better cues).
- **Shorts are 20–25 s (Producer, 2026-10-14):** 20 s target, 25 s max including the end card: dynamism, dopamine,
  impact, but always one coherent mini-arc (hook ≤ 2 s → escalation → payoff → end card).
- **Never fake an action the art can't do (Producer, 2026-10-14):** no gliding/bobbing a static pose to fake walking
  or running; move the camera or cut between real poses instead.
- **Review by timestamp:** when the Producer flags an interval, fix only that interval and prove the rest is unchanged.
- **Agent models (Producer, 2026-10-17: spread the load without losing quality):** judgment stays on the strongest
  model, execution goes down a tier. Director (main session) and both critics (`frame-critic`,
  `shorts-retention-critic`): Opus (or Fable when the session runs on it); they are the quality gate and never move
  down. Builders: Opus for a new design (storyboard, key frames, first build); Sonnet for executing a written fix list,
  renders, masters, deliveries. Haiku for mechanical work with a checkable result: running gates, frame extraction,
  contact sheets, file moves, reading analytics screenshots into tables. A cheaper agent's output always passes the
  same gates and critics; if a tier fails twice on a task, that task moves up a tier.
- **Resources and rounds (Producer, 2026-10-17: "optimizar recursos, renderizar más rápido"):**
  - **Git:** never commit intermediate audio/video (mix.wav, sfx.wav, block MP4s). Commit media only once per round,
    when the render is verified (each 60 MB wav commit cost ~120 MB of disk). Sources and docs are committed freely.
  - **Builder pre-critic:** before handing to the critics, the builder runs the critics' own gates (lint,
    frame_critic 0.25 s + 1/30 s around every changed cut/title, sfx_audit, hyperframes check on changed blocks only)
    and looks at full-size frames of every changed window. The critic reviews the changed windows plus a spot check.
  - **No overlap waivers on stamps, labels, badges or HUD** that sit on text or faces: `data-critic-allow-overlap` /
    `data-layout-ignore` only for genuinely designed overlaps listed in the storyboard; the critic re-checks each one.
  - **Never render and run a heavy check at the same time** (4 CPUs). `hyperframes check` capped at 20 min per block;
    renders first, checks after.
  - **Draft first:** iteration rounds render at draft quality; 720p only for the critics' final pass, 1080p/1440p only
    for the approved master.
  - **One session per episode:** start each episode (or a long fix phase) in a fresh session from a handoff doc
    (`docs/<ep>/HANDOFF_*.md`); long sessions cost more per turn and fill the disk.
- **Token budget (Producer, 2026-10-17: "va un 30 % del plan semanal y no han pasado 24 h"):** the main session is
  the expensive part (every turn re-reads its whole context), not the renders.
  - **One short session per task** ("fix these boxes", "publish package", "render the master"), started from a handoff
    of ≤ 1 page; end it when the task is delivered. Never run a whole episode in one session.
  - **Director does small edits itself** (≤ ~30 lines, known file). **At most one builder agent at a time**, Sonnet, only
    for a large self-contained chunk, with a precise brief (file, lines, windows, done-when) so it does not re-read the repo.
  - **Critics only on the final round** of a deliverable, on the changed windows only; never per iteration.
  - **No polling:** one background waiter that notifies at the end; no status checks while a render runs. Long render
    chains go in one queued script (flock), started once.
  - **Renders stay out of git until verified:** `scene_cache.py` writes blocks to `tools/hyperframes_ep003/renders/blocks/`
    (ignored); only the verified deliverable is copied/committed, once per round. Delivered masters go to Releases.
  - Read big files with targeted greps/line ranges, not whole; contact sheets of frames instead of many single frames.
- **Every text has a source (Producer, 2026-10-18, a repeated error in every episode and Short):** speech bubbles only
  from a visible speaker with the tail on them (no name header); chat messages only inside a phone or as a notification
  banner from the top; never a chat card floating in a scene. Rubric §4b; the critic checks every bubble/message for it.
