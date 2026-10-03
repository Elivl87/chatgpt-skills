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
