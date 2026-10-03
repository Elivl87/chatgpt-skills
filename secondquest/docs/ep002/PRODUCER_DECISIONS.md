# EP002 — Producer decisions log

| Date | Decision | Notes |
|---|---|---|
| 2026-10-03 | Storyboard via Runway, option A | Claude supplies the prompts (`RUNWAY_STORYBOARD_PROMPTS_v1.md`); the Producer runs Runway and returns the images. |
| 2026-10-03 | Nintendo IP risk accepted by the Producer | Recognizable Ocarina elements are used as the package directs. |

**Mitigations kept by default**
- All art is SecondQuest's own interpretation in SecondQuest_2D_v1. Nothing is traced or copied from official art.
- No official gameplay footage, screenshots, music or sound effects.
- The official logo/title stays optional. It is used only if the Producer asks for it and an approved source exists.

## 2026-10-03: Option C for third-party characters (monetization safety)

- **Decision:** option C from `docs/MONETIZATION_SAFETY_STANDARD.md` §4. The script is unchanged.
- **Characters are evoked, not replicated:**
  - Quest in his own adventure tunic inspired by the Hero of Time, never a copy of Link.
  - His own glowing fairy instead of an exact Navi.
  - A princess and a villain inspired by the originals, not replicas.
  - His own horse.
- **Places and objects may be more recognisable:** Hyrule-style field, temple with a sword pedestal, giant tree, ocarina, sword, golden triangles.
- **Never:** Nintendo logos, official key art, box art or screenshots, in the video or in thumbnails.

## 2026-10-03: Official game logo on the cartridge (Producer decision)

- The opening shows a **Nintendo 64** console. Quest holds the *Ocarina of Time* cartridge and inserts it.
- **The cartridge carries the official game logo.**
  - Source: Wikimedia Commons "File:The Legend of Zelda Ocarina of Time.svg". The licence is marked *Public domain*, restricted as *trademarked*.
  - Archived in `docs/ep002/source/` (SVG plus a 2450 px transparent PNG).
- **How it is used:** the cartridge is generated with a blank label, and the engine composites the exact logo on top. The logo is never drawn by AI.
- **Risk accepted by the Producer:** trademark use in the video.
- **Still in force:** M8 keeps logos out of thumbnails.

## 2026-10-03: Quest_v1 reference element

- Higgsfield reference element **Quest_v1** `89051d04-514d-404a-bcff-7dbe6347eb6f` created with the Producer's approval. It is built from job `ab2219a6` (default outfit).
- Job `f42c30bd` shows the farming outfit with brown boots. It is no longer a default-outfit reference (`QUEST_V1_PROMPT_SPEC.md` corrected).

## 2026-10-03: Higgsfield reference elements tests

- The 24 approved Quest_v1 default-outfit images were uploaded (media ids in `docs/ep002/source/higgsfield_quest_uploads.json`).
- `Quest-limit-test-24` (`7388757c-7065-483f-a6fa-a11cfdd6833e`): one element with 24 images was accepted with no error.
- `Quest-sheet-test` (`aea0e473-e44f-49c1-854c-ba6a84385b53`): one element made from a single 24-pose sheet image was accepted.
- How many images each model actually reads at generation time is not documented; it can only be measured with a paid generation.
- Pending: the Producer chooses the final set.

## 2026-10-03: Final Quest reference element

- **Quest-v1-6ref** `755771c5-9283-4473-a037-a4a983c75238`: the Producer chose the 6 recommended images ("vamos por lo seguro").
- The other three elements are superseded or test elements; the Producer may delete them in Higgsfield.

## Navi original audio (2026-10-03)
- The Producer supplied `SecondQuest_EP002_Navi_Original_SFX_Extract_v1.zip` (original Navi clips extracted from a source he
  provided), installed in `public/episodes/ep002/sfx/navi_original/` with its README and cue sheet.
- Direction for Navi's first appearance: `NAVI_HELLO.wav` as she starts to emerge from the TV, then `NAVI_SFX_01.wav` tight on
  the end of the voice as she flies away (one continuous entrance). Both kept under Bram's level.
- Note: the pack README says `NAVI_HEY.wav` for the first appearance; the Producer's later direction (HELLO) wins.
- Risk (informed, same category as the official logo on the cartridge): this is Nintendo audio; a claim or a copyright strike
  is possible and a strike counts against the whole channel. The pack README also states clearance is a separate production
  decision. Final use is confirmed at the final-render approval.

## Cartridge sequence animatic v9 APPROVED (2026-10-03)
`docs/ep002/EP002_cartridge_animatic_v9.mp4` (`scripts/ep002-cartridge-animatic.py`) is the approved plan for sequence 01 (l01-l02 + l03 "New graphics."):
- S1 living room push-in, N64 "classic" 3D prop on the rug facing the sofa, N64 controller cabled to it, Quest holding the cartridge (Quest pose still NEW_ART).
- S2 3D insert: cartridge (mock v4 / label v2) slides into the slot, flaps fold in, seats on "back" with a short shake and flash.
- S3 new framing on the TV: screen flare, the fairy (engine actor) emerges and flies towards camera, leaving frame over "New graphics.".
- Mix: Bram; cartridge click = G single click (CC0 derived) at 0.7; slide and TV silent; NAVI_HELLO at 0.16 (~9 dB under Bram); NAVI_SFX_01 at 0.14 (~14 dB under Bram), tight on the end of the voice.

## 2026-10-03: art direction decisions (after art plan v2)
- **Quest as the Hero of Time:** mandatory. Green tunic and cap similar to Link's, with details, **similar but not equal**:
  the viewer must read "Link is you", i.e. Quest, i.e. the viewer. Refines option C for Quest (closer than "own tunic").
  Quest keeps his own face and human ears (no elf): see the costume rule below.
- **New recurring channel character: Quest's female friend** (name to be chosen). She is part of the channel from now on
  whenever a girl, friend or companion is needed. In EP002 she plays the Saria-like forest friend and the princess
  (costume variants). Spec: `docs/characters/PIXIE_V1_PROMPT_SPEC.md`.
- **Villain:** Ganondorf-like, imposing and intimidating. Brief: `docs/characters/VILLAIN_V1_BRIEF.md`.
- **Official OoT logo** on the end card (30) and on the TV screen (2): approved, to be adjusted at the end. Never in thumbnails (M8).
- **Credits for the 18-asset list:** decided last, after the characters are defined.
- **CRT TV:** the present-day living room works as is; a 1998 tube TV is only for the childhood bedroom scenes (11, 27), free in 3D.

## 2026-10-03: Pixie and the costume rule
- Quest's friend is named **Pixie**: look of direction A (long black high ponytail, teal oversized hoodie, black leggings,
  white sneakers) with the personality of direction B (warm, curious). Spec: `docs/characters/PIXIE_V1_PROMPT_SPEC.md`.
- **Costume rule (Quest and Pixie, all episodes):** changing outfit never changes their appearance. In EP002 they are not
  elves: they are Quest and Pixie in different outfits.

## 2026-10-03: Pixie design B; Quest's undershirt; animatic-first workflow
- **Pixie_v1 design: option B** (job 9526ebfd). Its sneaker stripe is a known defect never to be repeated.
- **Quest's dark undershirt** at the neckline is part of his established look (present in every approved asset).
- **Workflow:** the whole video is first built as a free animatic (draft video with the real narration, cameras,
  sounds and MISSING boxes), approved by the Producer, and only then built in the engine for the final render.

## 2026-10-03: Triforce plates, crest, Pixie's roles, full animatic first
- Engraved Triforce plates (tools/fx/triforce_plates.py): **approved** ("me encanta").
- **Centre plate: the Producer wants a faithful copy of the royal crest.** Done at the end with the missing art.
  Risk (same category as the cartridge logo): Nintendo emblem/trademark in the video; never in thumbnails (M8).
- **Pixie plays the princess and every female role** that may appear in the video.
- **Workflow:** the whole EP002 is built as an animatic with the assets available today; designs and missing art come
  at the end, from the animatic's MISSING list.
