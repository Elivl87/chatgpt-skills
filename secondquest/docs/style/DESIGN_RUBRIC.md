# SecondQuest house design rubric (binding, 2026-10-14)

Every frame, beat and cue is judged against this sheet twice: by the builder before showing anything, and by an
**independent critic** (a separate agent that did not build it, see `.claude/skills/frame-critic/SKILL.md`). The
Producer should never be the first one to see a defect on this list. It distils the vendored craft skills
(`shot-composition`, `animation-principles`, `motion-art-direction`, `kinetic-typography`, `motion-design`,
`hyperframes-creative`, `hyperframes-animation`); where they disagree with this sheet, this sheet wins.

Scoring: each section is PASS / FIX / FAIL. Any FAIL, or any automated error, blocks sending. "Automated" names the
script that checks it; everything else is checked by eye on full-size frames (never only on a contact sheet).

## 1. Hierarchy and one focal point
- Each beat has ONE thing the viewer must look at; write it down in the storyboard ("focal: Pixie's face").
- Hierarchy order: size > contrast > colour > position. The focal element wins all four or is clearly the biggest.
- Max 3 separate text blocks on screen (captions count as one). Automated: `frame_critic.py` CLUTTER.
- Negative space is a design element. A beat that fills every corner is a FIX.

## 2. Nothing overlaps unless designed
- No text over text, over the HUD, or over a face/hand that is acting. Automated: TEXT_OVERLAP, TEXT_OVER_HUD
  (errors), TEXT_OVER_CHARACTER (warning: check the face).
- No ghost/echo copies of words. Readable text is never motion-blurred and never duplicated as an "echo" layer.
  Automated: GHOST_TEXT, MOTION_BLUR_ON_TEXT. (Short #2 v2 failed this at 0-2.7 s: 9 motion-blur copies of the
  title, then the title flying through the hearts/buttons on exit.)
- No pasted boxes. A panel, bubble or card belongs to something: it has a tail, an anchor, a shadow consistent with
  the scene, and it enters from where it lives. A box floating over the art with no relation to it is a FAIL.
- Deliberate overlaps are declared in the HTML (`data-critic-allow-overlap` / `data-layout-allow-overlap`) and named
  in the storyboard. Undeclared = defect.

## 3. Safe zones and legibility
- Shorts (9:16): keep text inside x 6-85 %, y 9-80 % (right action rail and bottom title/channel UI cover the rest).
  16:9: title-safe 5 %. Automated: SAFE_ZONE (captions: error).
- Text size floor: 2.2 % of frame height on 9:16 (42 px at 1920), 3 % on 16:9. Labels in the art (HUD, meters) are
  at least that size or they are decoration and must not carry meaning. Automated: TINY_TEXT.
- Contrast: WCAG AA on text (`hyperframes check` contrast pass), outline/shadow consistent with the house type style.

## 4. Characters
- A character who speaks, reacts or acts is shown **full figure or at least waist-up, at readable size** (largest
  character >= 25 % of frame height on 9:16). Never as a portrait badge / face in a circle. Automated: CHAR_BADGE
  (error), CHAR_SMALL (warning; wide establishing shots may be small on purpose: say so in the storyboard).
- Everything sits where it belongs: inside the boat, on the seat, in the hand; never floating, never cut by another
  object; consistent scale across shots; lit like the scene (CLAUDE.md "Every element sits right").
- Costume changes keep identity (CLAUDE.md). Expression matches the line being said.

## 5. Art choice fits the beat
- For every beat the storyboard names the art and **why it is the best available for this exact moment** (era, time
  of day, mood, who is speaking, what the line says). "It was in the library" is not a reason.
- One visual idea per beat; no mixing of styles inside a frame (painted plate + flat vector + pixel art) unless the
  joke is the contrast.
- Generated art is never modified (CLAUDE.md); if nothing fits, list it as MISSING with a quote instead of forcing it.

## 6. Motion
- Every move has a purpose (enter, emphasise, connect, exit) and ONE primary motion at a time; ambient motion stays
  low-contrast. 1/3 rule: no unbroken travel > 1/3 of the frame; at most 1/3 of the elements moving at once.
- Ease-out entrances, ease-in exits, no linear spatial moves; anticipation -> action -> settle on every comedy hit.
- Text lands sharp and holds long enough to read twice (>= 0.3 s per word for display text).
- Motion blur only on snaps (slam, whip, spin), 1-3 per video, never on readable text (`hyperframes-animation/references/motion-blur.md`).
- No shot holds > ~4 s without a change (CLAUDE.md). Automated: `pacing_qc.py`, `hyperframes check` (motion).

## 7. Sound restraint
- Fewer, better cues. Budget: Shorts <= 18 onsets/min, episodes <= 12/min; never more than 3 onsets in 2 s; at least
  35 % of the runtime free of SFX. Automated: `scripts/sfx_audit.py` DENSITY, BURST, NO_REST.
- Every cue names the on-screen event it serves (`why`). A cue without a reason is cut.
- One family (whoosh, pop, click...) at most 4 times per Short; vary the gesture, not only the file
  (CATEGORY_FATIGUE, SOUNDALIKE). Prefer body + transient layers over thin high-frequency clicks (HARSH).
- Hits sit 8-12 dB under the voice; the voice always wins. Master -14 LUFS integrated, <= -1 dBTP (LOUDNESS).
- Silence before a big hit makes the hit; music stays off unless the Producer asks.

## 8. Consistency and repeated mistakes
- Before building, read the "mistakes not to repeat" in `docs/PRODUCTION_PLAYBOOK.md` and the last rejection in
  `docs/<ep>/PRODUCER_DECISIONS.md`; the critic checks each listed mistake explicitly and reports "checked: no repeat".
- Same interaction = same motion and same sound family across the video (consistency), different files (variety).
- No unmotivated light effects (lesson 2026-10-15, three times in EP002 Short #2): no diagonal light bars, scan
  streaks, chevrons or flare lines that a viewer could read as a glitch, watermark or scratched film. Any light effect
  must have a visible source in the scene, match its colour temperature and move with the camera.

## Gate order (every block / Short)
1. Storyboard + key frames at full size, each with focal point, art justification and sound cues -> director review.
2. Build. Builder runs: `hyperframes lint` (0 errors), `python3 scripts/frame_critic.py <project> --lint` (0 errors),
   `python3 scripts/sfx_audit.py <cues> --mix <mix>` (0 errors), framing/pacing QC.
3. Independent critic agent (`frame-critic` skill): reruns the tools, reviews the flagged frames and a full-size frame
   every 0.5 s against sections 1-8, returns PASS/FIX/FAIL per section with timestamps.
4. Fix only what was flagged, rerun 2-3, then send to the Producer with the critic's verdict attached.
