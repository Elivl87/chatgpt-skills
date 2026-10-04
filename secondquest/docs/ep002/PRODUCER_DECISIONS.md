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

## 2026-10-03: all 3D is built in-house, free
- The Producer rejected the reference-profile ocarina (v1) and rejected spending credits on image-to-3D: "Todo lo 3D lo haces tú gratis."
- Rule added to CLAUDE.md. Ocarina v2 is rebuilt in `tools/props3d/scene.ts` from measurements of the Producer's reference (`docs/ep002/source/ocarina_reference_producer.jpg`); comparison sheet `docs/ep002/ocarina_vs_reference.jpg`. Pending approval.
- The "So, why?" moment uses the SecondQuest wordmark with its gold bar, exactly as EP001 (engine WordmarkLayerView twin in the block B animatic).

## 2026-10-03: block B approved (v3)
- Approved: `docs/ep002/EP002_seq01_blockB_v3.mp4` (approved ocarina, sword, Triforce plates, EP001 wordmark on "why?").
- Deferred improvements (Producer: "para más adelante"): Navi clear of the wordmark on the close; a soft free sparkle on the wordmark; ocarina tilt during the spin matched to the reference.

## 2026-10-03: Quest/Pixie proportions
- Keep the current rule: Pixie's face = 0.90 x Quest's (Pixie ~95% of his height); added to both character specs.

## 2026-10-03: review subtitles
- Animatics carry review subtitles in the EP001 Shorts caption style (Inter heavy, white, ink outline + drop, short
  phrases that pop in): `scripts/animatic/lib.py` `subtitle()`. They are for review and editing only.
- Final renders carry NO burned-in subtitles (Producer).
- Seq 01 re-rendered as v11 (subtitles only; v10 stays the approved picture/mix reference); block B v4 (subtitles only).

## 2026-10-03: block C approved; framing rule
- Block C approved, with one fix: the seq-01 insert showed the console cut at the bottom and the cartridge cut at the top.
  The insert was re-rendered wider (`job_n64_insert`, camera 840 mm, target y 92): cartridge start and console now sit
  inside title-safe -> seq 01 v12.
- New rule (CLAUDE.md): framing QC sheet (`scripts/animatic/framing_qc.py`) checked before sending every block.
  It also caught in block C: Quest held half cut on "Plus the television" and Pixie's head on the top edge -> fixed (C v5).

## 2026-10-03: idea for the art list: a real walk cycle
- Producer idea: a second walking pose for Quest (the other foot forward, arms swinging the opposite way) so the two
  can alternate and he truly walks. Reusable for any walking scene later (Hero outfit, young version, Pixie too).
- Options to decide at the end with the MISSING art list: generate the opposite step (~0.5 credit per pose at 1k), or
  a mirrored copy of the current back view (free, but it changes approved art: needs the Producer's OK).

## 2026-10-04: blocks D and E approved; 3D Hyrule Castle
- Block D approved (then v3/v4: path between the child and his adult outline; verified N64 spec callouts; N64 grass).
- Block E approved. Own 3D Hyrule Castle built from the Producer's references (`docs/ep002/source/castle_refs/`) and
  refined (upper tier, battlements, tighter tower cluster); used in the field plate from block D on.

## 2026-10-04: block F = option B (Hyrule), with the photo + heart bar
- Producer prefers option B (each "better" applied live to Hyrule). Option A (notebook, v2 with the DANGER stamp) is kept.
- "But familiar is not measurable": the kids' afternoon photo + the FAMILIAR bar full at first, slowly draining, with a
  heart blinking at its tip (no blurred memory window).

## 2026-10-04: block F approved; in-game HUD in Hyrule
- Block F (option B, v5) approved.
- Producer idea: whenever Quest is in Hyrule, an in-game HUD (own drawing, `scripts/animatic/hud.py`): hearts + green
  magic bar top-left, rupee counter bottom-left, action buttons top-right (B sword, A "Attack", three C buttons: bomb,
  boomerang, our ocarina). Shown in blocks B (field), D (field/forest), E (rebuilt Hyrule) and F; hidden in real-life
  shots (rooms) and on the "actual size" tile; faded out before the wordmark.
- "Familiar is not measurable": the hearts lose half a heart at a time (5 -> 2.5).


## 2026-10-04: block G approved; the game-camera icon; block-only previews
- Block G approved. "Fix it...": a steel combination wrench taps the camera icon once (v4), then a small green check
  badge sits on it; on "Which is good." that small check hops off the camera and lands big (v5), then tilts into "?".
- The game-camera icon (classic movie camera: two reels, lens, blinking REC; `scripts/animatic/icons.py`) repeats wherever
  the script talks about the game's camera: B "A new camera." (pops in and leads the flight into the TV, B v6),
  E "Modernized controls and camera movement." (orbits the pad, E v5) and G.
- Producer rule: while we work block by block, send only that block's seconds. The full joined video is sent only once
  the whole animatic is complete (block scripts no longer build joined previews).

## 2026-10-04: block H ending = split screen 1998 | TODAY + the CRT switching off
- H v1 not approved: the faint "1998 memory" next to Quest read as smoke, not as the old game.
- Chosen (option A + Claude's improvement): on "without making people wonder" the frame splits 1998 | TODAY with the
  same year tags as block G; on "where" the 1998 half shrinks into our 90s CRT; on "game went" the CRT switches off
  (bright line, dot, dark glass). Quest stays at the seam, hand on chin, "?".
- Producer asks Claude to keep bringing this kind of creative idea, not only fixes.

## 2026-10-04: block H ending, take 3 (Producer's idea, worked up by Claude)
- v2 (split screen + small CRT) not approved: TODAY stayed stuck on screen, the small TV told nothing.
- v3: night, Quest's room; our big CRT plays 1998 Hyrule (blocky) while Quest watches from behind. On "where" the TV
  switches off (line, dot, dark glass); his reflection shows for a moment; black. Out of the black, today's Hyrule,
  golden and moving, and Quest gallops through on his own horse; the HUD comes back. The slider leaves before the cut.
- The horse: final art from Higgsfield (art plan #13, Quest on his own horse, about 1.0 credit; quoted with the MISSING
  list at the end). In the animatic a free 3D stand-in built by Claude (`tools/props3d`, job `horse`: dapple grey,
  charcoal mane, blue saddle cloth, 8-frame gallop), never Epona's look.
- v3 not approved ("hay idea, pero mal ejecutada"). v4 execution: the CRT big and front on in his room at night, a
  clear 1998 picture (chunky pixels, small palette, pixel hearts); Quest whole, standing, from behind; his face clear in
  the dark glass; today's Hyrule seen from behind as Quest rides away towards the castle (3D horse rendered from the
  rear, job `horse_rear`); the gallop runs under l63, so block I starts on l64.
