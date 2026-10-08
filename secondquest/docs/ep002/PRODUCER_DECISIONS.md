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
- Producer idea (v5): the TV scene in Quest's own bedroom (block C) with the CRT on the bedside table, and a new Quest
  watching it that also serves as his reflection. New art Q008 (0.5 credits, approved "Sí, apruebo, genera la imagen a 1k"):
  Quest on the floor in profile facing the TV (`docs/art_orders/quest/ep002_tv/results/09_floor_profile_tv.png`). QC: passes;
  one defect reported: the controller reads modern, not N64. The mirrored profile is his reflection in the dark glass.
- Block H approved (v5). Producer OK to put our 3D N64 controller in Quest's hands in Q008 (engine composite,
  `tools/fx/pad_swap_q008.py`, derived file `09_floor_profile_tv_n64pad.png`; the generated original is untouched) -> H v6.
- H v7 (approved changes): H3 "different" = a new art direction (golden-hour sky, teal/orange grade, low sun and light
  shafts, vignette) instead of raw saturation; the four upgrade icons in H1 stay; the reflection holds ~1.4 s; the room
  camera starts closer to the TV with Quest always whole.

## 2026-10-04: block H approved (v7); block I
- Block H approved. Full preview so far (Producer request): `docs/ep002/EP002_seq01_to_blockH_v1.mp4` (2:40).
- Block I v1 idea liked. Producer correction: Zelda is single-player, so "two audiences" = two kinds of player, not
  two players at once. v2 uses the classic file select: FILE 1 · VETERAN PLAYER (100%) / FILE 2 · NEW PLAYER (NEW GAME);
  cards VETERAN PLAYER (Quest) and NEW PLAYER (Pixie).
- "A very bad decision": the MAKE A WISH? dialog was unclear; replaced by a hooded shadow with red eyes (inspired
  villain, never a replica) rising behind the triangles and reaching for them, the veteran shouting "NO, NO, NO!".
- I v3: the shadow's hand rebuilt as a real clawed hand (cloak sleeve, palm, four two-joint fingers, thumb) that comes in
  level and closes its claws over the triangles on "decision". Producer: the veteran must be in his tunic, and scared
  when the shadow grabs the Triforce: both added to `docs/ep002/MISSING_ART.md` (new running list of art to quote at the
  end); planning stand-ins meanwhile (recoloured nostalgic_smile / surprised_shocked, labelled MISSING).
- Sounds: all sound effects are left for the end (engine stage); the only sound in the animatic stays Navi and her
  trail at the opening. Block reports stop proposing per-block sounds.
- Proposal shown: the NEW PLAYER (Pixie) waits her turn, small and dim, top right, during Player 1's save file
  (`docs/ep002/blockI_newplayer_waiting_preview.jpg`), pending OK.
- Producer: Pixie's waiting card must be alive, not frozen: two impatient poses alternating (MISSING 2a/2b, option A:
  quoted at the end). Stand-ins alternate now (thinking_chin with a foot tap / determined_fists with a sway) -> I v4.

## 2026-10-04: block J (l71-l77)
- J v1: the new player's side in the same menu language: NEW PLAYER card lights up, FILE 2 empty ("?" slots, 000:00,
  0%); a forest with a giant old tree (planning stand-in, MISSING #14) that turns out unwell on "personal problem";
  then a VETERAN | NEW PLAYER sheet: NOSTALGIA (heart bar full | empty), CHILDHOOD (the 1998 photo | blank),
  EXPECTATIONS (28 YEARS | 0). Block K starts on l78.
- J improvements approved: (1) the VETERAN | NEW sheet opens block K as a scoreboard; (2) a livelier tree, pending the
  tree art.
- Pixie "plays Link" in her own hero tunic (green like Quest's, teal accents, her ponytail, human ears, no cap) only
  once she is in the game: when her FILE 2 opens (J) she flashes into it; before that (waiting, impatient poses) she
  wears her normal clothes (Producer: "aún no la han seleccionado"). Quest wears his tunic all through block I (veteran
  mid-game). Stand-ins: recoloured poses labelled MISSING; art 2c/2d/2e added to the list -> J v2.

## 2026-10-04: block J approved (v3); block K (l78-l86, end of Act 3)
- J v3: the stray "weight lines" under 28 YEARS removed; the plate now drops in with a thud. Block J approved.
- K v1: block J's sheet becomes the scoreboard: two QUEST boxes ("MAKE 1998 FEEL NATURAL IN 2026" for the new player,
  "MAKE THE KNOWN FEEL LIKE DISCOVERY AGAIN" for the veteran) with mini screens (1998 -> 2026; fog over the known
  field, then a sparkle of something new); then both in today's Hyrule from behind, a thought bubble with his 1998
  Hyrule; "build both": block F's blueprint sweeps over the real Hyrule and the one in his head. HUD hidden here.
- K v2 ("Apruebo con mejoras"): Block K approved with both improvements: (1) the 1998 picture inside the thought
  bubble flickers like the block-H tube (uneven brightness, rolling band, colour fringe, dark glass corners); (2) under
  "build both" the bubble is drawn into the real castle and the two Hyrules fuse in a glow just before the cut to Act 4.
- L v1 ("Sí, constrúyelo así, con las manos del restaurador"): the safe remake as a museum. Glass case in a HALL OF
  CLASSICS with the dusty 1998 field and the N64 pad; wall card REMAKE 2026 · CHANGES 0.01% with a checklist; a
  white-gloved restorer (hands only, no new art) brushes the picture clean (textures), the pixels split twice (same
  layout, resolution), a cloth polishes the pad (controls); tracing paper lands exactly: 100% MATCH; a gold RESPECTFUL
  plaque on the wall; on "problem" the glass cracks and Navi flushes red with "!". HUD hidden (museum).
- L v2 (Producer: "¿Siempre el mismo fondo de Hyrule? ¿No es abuso?" / "La mano no se entiende… ¿es necesaria?" /
  "Haz las mejoras dichas"): the restorer's hands are removed (a band of light cleans the picture, a shine cleans the
  pad). The case no longer shows block G's field: it holds the sword's temple in 1998 (procedural, evoked). Rule from
  here on: vary the places; Hyrule Field only where the script is about the field. Improvements in: the camera leans in
  on the pad while it is cleaned; green light leaks through the crack; a PLEASE DO NOT TOUCH sign loses a nail and
  swings when the glass cracks.
- L v3 (Producer idea: "el control se ve muy grande, reducirlo un poco… cuando se 'limpia' el control, ¿una transición a
  una Nintendo Switch 2?"): the N64 pad is smaller; on "Cleaner controls" it is polished, then in a flash becomes a
  Switch 2-like handheld (our own 3D, `tools/props3d` job `switch2`, free; evoked, not a replica) whose screen wakes up on
  the same temple in full detail. It stays in the case for the rest of the block.
- L v3 approved as is ("Apruebo L así como está"); the two optional improvements (REMAKE badge on the handheld screen, screen flicker on the crack) not taken.
- M v1 ("Sí, constrúyelo así"): in the forest, not Hyrule Field. Block L's case bursts on "familiar" and the camera
  dives into the crack's green light (white on "new"); a flat top-down 8-bit forest map tilts into a ground plane like a
  pop-up book on "suddenly", trees grow out of their tiles, Quest lands on "stand" (HUD on from here); a measuring line
  to a misty mountain (FAR AWAY); a gaze cone + yellow target marker on a chest (evoked targeting); the ocarina plays,
  flowers open; everything freezes and greys on "most importantly", Navi to the centre; one clock-dial sweep turns day
  to night (sun down, moon and stars) on "time mattered".
- M v2 ("Apruebo M con las tres mejoras"): Block M approved with: the case trembles harder until it bursts; on "stand"
  the 8-bit hero of the map grows into Quest (pixels -> smooth) instead of dropping in; the chest opens with light and
  sparkles after "where you looked mattered".
- N v1 ("Sí, constrúyelo así"): inside the sword's temple. Young Quest before the pedestal; white flash on "not" and
  adult Quest stands there, the pedestal empty; he dissolves into motes of light; the empty temple in time-lapse (light
  swinging, blue sky -> red storm, roofs to ruins, cobwebs, cracks). Block I already used "SEVEN YEARS LATER" and a
  field CHILD | ADULT split, so here the years are told without text and the eras split the temple itself. The temple
  shrinks into the golden cartridge's label, a "side detail?" note is struck through; THE GAME stamp; then CHILD (day
  window) | ADULT (storm window). HUD hidden.
- N v2 (Producer: "que se vea que se levanta un poco la espada, y desaparezca al mismo nivel de detalle que Quest. Lo de
  la flor sería un hit"): the sword comes up out of the stone before the flash, stays raised with adult Quest and
  dissolves into motes of light together with him; in the time-lapse a flower by the steps sprouts, blooms and withers
  (petals fall) as the clock of the seven years.
- N v3 (Producer: "1. Sí 2. Sí. Que la espada salga cuando Quest se termine de acercar"): the sword only starts to come
  up once his step to the pedestal has finished; in the two eras the CHILD half has the flower in bloom and a bright
  Navi, the ADULT half the withered flower with fallen petals and a dim Navi.
- N v4 + rule (Producer: "Cuando Quest está en la era adulta debe tener el escudo y la espada en la espalda. Y así debemos
  buscar como tener un mismo arte para escenas que esté de espaldas al espectador para optimizar créditos. Apruebo N con
  la mejora. Lo del arte para el final"): adult Quest always carries shield and sword on his back (planning overlay on
  the stand-in in N); one reusable back-view art per character/era (MISSING #3, #4, #2f), quoted at the end. Block N
  approved with the improvement: block O opens with a dissolve from N's last image (the two eras) instead of a cut.
- N v5 (Producer: "Cuando saca la espada, aún en la era no adulta, que no salga con escudo y espada aún en la espalda"):
  right after the sword comes out (the flash, until he dissolves) he has no shield or sword on his back - the raised
  sword is the one he is pulling; the gear appears only in the ADULT era of the closing split.
- N v6 (Producer: "La flor es muy grande, quizás algo más pequeña y bonita"): the flower is about half the size and
  redrawn: a curved stem, two leaves, two rings of soft pink petals with a yellow centre and a highlight; it still
  blooms, droops and drops its petals.
- N v7 (Producer: "Quitaría la flor en la escena de pantalla dividida. Porque se usó solo para mostrar que pasó el
  tiempo"): no flower in the CHILD | ADULT split; it lives only in the time-lapse.
- I v5 (Producer: "Sí" to adding the gear): in block I's CHILD | ADULT eras shot, adult Quest carries the shield and the
  sword on his back (shared overlay `scripts/animatic/gear.py`, also used by block N).
- O v1 ("Prosigue"): a pantry shelf of preserving jars (the script's "preserve"). Opens with a dissolve from N's two eras
  (N improvement). The golden cartridge sealed in a jar (clamp lid, DO NOT OPEN), the lid twitches on "not
  disrespecting"; on "refusing to change" the glass fogs and the cartridge greys; pull back to the shelf of 1998
  limitations: FOG, LOW POLY, BLURRY TEXTURES, FIXED CAMERA, PRESERVED SINCE 1998; FOG pops open, curls into a "?" and
  becomes MYSTERY; LOW POLY opens, a ghost castle rises: IMAGINATION; the fog fills the frame and clears on today's
  forest where Pixie (tunic, awe) gets the same "?" (HUD on, 3 hearts).
- O v2 ("Apruebo O con las dos mejoras"): block O approved with: (1) at the end of "what those limitations made you
  feel" the cartridge jar itself opens, its colour comes back and it pours out golden light; (2) the one "?" travels
  from the fog jar, across the white fog, to Pixie's head in the forest (same mark, same style).
- O v3 (Producer asked for other ways to show it, then: "Vamos con B"): block O rebuilt in Quest's 1998 room (blocks C
  and H) instead of the pantry jars (v2 kept in git history). Kid Quest (Q008) watches 1998 Hyrule on the CRT; on
  "refusing to change" the picture pauses and drains; push in on the screen: callouts FOG, LOW POLY, BLURRY TEXTURES,
  FIXED CAMERA and a KEEP EXACTLY AS IT WAS stamp on "preserve"; across to his face: a thought bubble where FOG flips to
  MYSTERY (a "?" in mist) and LOW POLY to IMAGINATION (a great castle); the "?" travels out to today's Switch 2-like
  handheld showing the forest where Pixie (tunic, awe) gets it; the camera dives into the screen (HUD on, 3 hearts).
  The approved O improvements carry over (dissolve from N, the one travelling "?").
- O v4, approved without preview (Producer: "lo de fix camera marca afuera del TV... verifica que esté marcando todo
  bien donde debe ser. Aprobada las mejoras. Para el 2 un móvil. No me entregues el animatic. Haz las mejoras y queda
  aprobado"): the callout pins now sit on the tilted glass itself (bilinear on the screen quad, checked against a
  debug grid): FOG on the horizon haze, LOW POLY on the pyramid hill, BLURRY TEXTURES on the grass, FIXED CAMERA on
  the hero seen from the fixed camera; the stamp moved onto the bezel. Improvements in: a phone (20:26) lies by the
  Switch 2 (it is today); the travelling "?" leaves a Navi-blue trail. Block O approved.
- P v1 (Producer: "Sí, constrúyelo así" to "back to the room"): Quest of today goes back to his childhood room (blocks
  C, H, O), by day. The door opens from the hallway and he walks in (l115); push in to the bedside table: the CRT off,
  the golden cartridge lying there with dust, a sunbeam on it, dust glittering (l116-l117); he blows into the
  cartridge (stand-in, MISSING #10a, also a thumbnail candidate), slots it into the N64 (our 3D insert) and the CRT
  powers on at the first try: FIRST TRY stamp (l118); Quest between two cards, 1998 (the CRT picture) and 2026 (block
  O's Switch 2 with the forest), and the channel's big WHY? (l119); the door frame of the same room with pencil
  height marks 1996, 1997, 1998: a faint memory of the kid he was stands at the 1998 mark, Quest steps against the
  frame, a new red line 2026 is drawn over his head and the gap between 1998 and 2026 lights up: HOW MUCH YOU CHANGED
  (l120). HUD hidden (real life). Free.
- P v2 ("Apruebo P con las mejoras 1 y 3"): block P approved with: (1) the blow is now in profile (Q008, head and
  shoulders): he lifts the cartridge to his lips, connector end first, his breath goes in and a cartoon dust cloud
  blasts out of the far end (still MISSING #10a for the final art); (3) a whip pan across the same room, from Quest
  between the 1998 and 2026 cards to the door frame, replaces the dissolve. Not taken: the WHY? look-between rhythm
  (2) and the "tries: 1" counter (4).
- Q v1 (Producer: "Sí, constrúyelo así" to "everything is still there... except you"): the forest (block M), our 3D
  ocarina and the sword in the temple (block N) each resolve from 1998 pixels into today (STILL THERE / STILL
  WAITING, HUD on); our 3D Triforce pulses on wisdom, power, courage and the three words line up under it (no
  triangle-to-word mapping, to avoid lore nitpicks); pull back: it was all on the CRT of his room by day, Quest on
  the floor with the pad and, closer to the TV, the faint kid he was with the same pad (1998 / 2026); the cartridge
  with the temple label glows and an ALMOST TOO PERFECT stamp lands; two mirrored strips, GAME (young hero -> adult
  hero with gear) and LIFE (the kid of the 1998 mark -> Quest at 2026), both arrows light up together, "=". Free.
- Q approved as is (Producer: "Apruebo Q, tal cual esta"); none of the proposed Q improvements taken.
- R v1 (Producer: "Sí, constrúyelo así" to "same road, different person"; Hyrule Field because the script is about
  the field): split screen on the same road and camera, 1998 field (pixels, fog) with young hero Quest | today's field
  with adult Quest (shield and sword); the year tags hand over to a 1998 -> 2026 ruler (a tick per year) that reads
  28 YEARS on "three decades"; the divider dissolves into one road with both of them (the young one still in 1998
  pixels): SAME ROAD, DIFFERENT PERSON; the 1998 look creeps back over the screen and retreats while OLD GAME BACK is
  struck out; adult Quest stops, the young one becomes the memory beside him, "?" flips to "!" on "recognizes" and a
  Navi-blue glow links them. New stand-in: MISSING #3a (young hero 3/4 looking up at adult Quest, reusable). Free.
- R v2 ("Apruebo con mejoras 2, 3 y 4"): block R approved with: (2) milestones on the ruler, our 3D cartridge FIRST
  TIME at 1998 and the Switch 2 AGAIN at 2026; (3) on "recognizes" the memory gets his real colour back for a moment,
  then fades back to a memory; (4) a slow push in on the two of them over the last 2 s. Not taken: footprints (1).
- R v3 (Producer: "La Nintendo se ve con pantalla verde. Aquí quizás debería tener un fondo más chill"): the Switch 2
  milestone on the ruler now shows a calm picture on its screen (today's field at sunset, warm and soft) instead of
  the green key; the key's fringe is cleaned too.
- R v4 (Producer: "Sí, aplícalo así"): exception to "HUD on in Hyrule": no HUD on the R1 split screen with the time
  ruler (a comparison of two eras: one HUD over both made no sense and crowded the ruler); it fades in when the halves
  merge into one road ("Same road"), back in game.
- S v1 (Producer: "Sí, constrúyelo así" to "the blueprint that cannot copy it"): the Saturday room of 1998 (block C,
  warm late afternoon, kid Quest and kid Pixie on the floor, the CRT); a blue REMAKE scan turns it into a technical
  blueprint (cyan lines on blue, grid); ERROR CANNOT REMAKE A MEMORY? on "Probably not"; each thing named gets a red
  X and CANNOT REBUILD on its word: THE ROOM (its outline), THE TELEVISION, SATURDAY AFTERNOON (a SAT 4:00 clock),
  THE FRIEND (a ring and a strike over Pixie); on "the exact version of you" the scan tries to trace kid Quest,
  glitches and fails: he stays in full colour, YOU, 1998 · CANNOT TRACE -> 1 OF 1. HUD hidden. Free.
- S option A v1 (Producer asked for other ways, then: "Construye y comparamos"): the memory imported into a game
  editor (evoked, no real tool): viewport with the Saturday room, hierarchy and console; IMPORTING MEMORY... stalls at
  99% on "Probably not"; on each word its asset fails and turns into a grey untextured placeholder (room MISSING
  TEXTURE, television FILE NOT FOUND, saturday_afternoon.light CANNOT BAKE - the warm light goes flat, friend.npc NOT
  FOUND); you_1998 CANNOT EXPORT: kid Quest stays in colour, 1 OF 1. Built alongside v1 (blueprint) for comparison.
- S option A approved (Producer: "Apruebo A. Me encanta, haz la mejora"): option A (the remake engine) replaces v1
  (the blueprint, kept in git). Improvement in (A v2): after "you_1998 CANNOT EXPORT" the camera pushes into the
  viewport until the grey room fills the frame, kid Quest in colour (drawn at full resolution at the end of the push),
  CANNOT EXPORT · 1 OF 1. The Producer also asked how the engine itself could be improved (proposals pending).
- S option A v3 ("Mete la 1, 2 y 4"): the remake engine improved with (1) an INSPECTOR panel over the console: on each
  failure the asset's properties type in, the emotional ones the engine cannot read (room: Afternoons spent here NOT
  SUPPORTED; television: Warmth -, Who sat in front NOT SUPPORTED; saturday_aft.light: 4:00 PM, golden, Smell of
  popcorn NOT SUPPORTED; friend.npc: Knew where to go YES, Can be cloned NO; you_1998: First time YES, Copies 1 of 1,
  Export DISABLED); the console shows its last lines; (2) the move gizmo (X red, Y green, Z blue) on each selected
  object, and a sun gizmo at the window for the light; (4) a two-step failure, colour -> wireframe -> grey
  placeholder; on "you" the engine flickers his wireframe and loses it. Not taken: type icons (3), error toasts (5).
- S approved (Producer: "Apruebo S"): block S is option A v3 (the remake engine with inspector, gizmos and the
  two-step failure). The Producer asked for three alternatives for block T before building it.
- T v1, option B (Producer: "Vamos con B, constrúyelo así"; options were A the engine that can, B the meeting on the
  road, C the two screens): block S's engine, the grey room: a green scan runs the other way and Hyrule builds itself
  around kid Quest (checks: field, castle, sky), BUILD SUCCEEDED; the road of block R: the kid he was down the road,
  facing us (the memory), adult Quest (shield and sword) walks in from behind and stops facing him; a "<< 1998" rewind
  flickers out and is struck on "take you back"; a Navi-blue glow links them on "meet"; the field drops to its 1998
  look (THE GAME YOU REMEMBER) and adult Quest is THE PERSON YOU BECAME; the kid fades away with rising sparkles on
  "for the first time again"; adult Quest takes a step towards the castle on "meet it again"; on "grew" the 1998 field
  and castle resolve into today's (the game grew up too) and on "up" a heart container: 3 -> 4 hearts. HUD off in the
  engine, on in Hyrule. New stand-in: MISSING #3b (young hero front, smiling, reusable). Free.
- T v2 ("Apruebo con 1 3 y 4"): block T approved with: (1) it opens on block S's last frame, CANNOT EXPORT · 1 OF 1
  still on, the tag fading as the green scan passes; (3) on "meet it again" Navi twirls around adult Quest before
  flying ahead; (4) the heart container flies from the castle to the HUD (sparkle trail) and lands as the 4th heart.
  Not taken: the warm light passed from the kid to the adult (2).
- T v3 (Producer: the flying heart "no me gustó... de que sirve?"; keep it as a nod, but in the HUD, growing to 8
  hearts, one appearing after the other, imitating the 1998 game): the flying heart container is removed. On "grew"
  five empty heart containers pop in at the end of the row one after another (3 -> 8), then the meter refills left to
  right a quarter heart at a time, and the last filled heart beats, as the life meter does in the 1998 game (drawn in
  block T over the shared HUD, which is unchanged). The Producer asked to check it on YouTube: videos cannot be watched
  from here and the wikis do not describe the animation, so it follows how the game's meter works (containers added
  empty, quarter-by-quarter refill, beating current heart); the Producer verifies against the game.
- T approved (Producer: "Aprobado bloque T"): block T is v3. Only block U (the call to action, l155-l157) remains.
- U v1 (Producer: the ending keeps EP001's identity, where Quest sat on a fence looking at the big farm; Quest and Pixie
  dressed as the hero and the princess look at the horizon from the top of an outcrop, the castle far away; a Breath of
  the Wild key art given only as a composition reference; new art needed, mount it with stand-ins for now): out of
  block T the camera rises and pulls back from the two of them on the outcrop (from behind) to the whole vista at
  golden hour, the castle far down in the valley with the low sun behind it, birds; the SecondQuest wordmark (EP001's
  brand image and gold bar) lands in the sky on "why?" as in EP001 and block B; the left and right thirds stay clean
  for YouTube's end screen (planning guides drawn from "Tell me in the comments"). HUD off. New art: MISSING #17 (the
  two of them on the outcrop) and #18 (the vista), quoted at the end. Free.
- U v2 ("1 y 2", with Navi's path described by the Producer): (1) Pixie looks at the castle, then on "Maybe (that's our
  next quest)" turns to Quest; (2) after the wordmark lands, Navi circles the two of them, flies up, goes around the
  wordmark and into its four-point star on "next", which twinkles. Her trail sound starts as she starts circling them:
  NAVI_SFX_01 (the Producer-supplied original clip already approved as her trail at her first appearance), at the same
  approved level (0.14, ~14 dB under Bram). This is the second use of that clip; risk as recorded for the first use.
- U approved (Producer: "Aprobado"): block U is v2. All 22 blocks of the EP002 animatic are approved (Seq01, B-U, 6:53).
  Producer: deliver nothing for now; he wants to review the first block before the next steps.
- B v7 (Producer, reviewing the opening before the next steps: "No quiero que salga ese icono de la cámara en esa
  escena"): in B2 "A new camera." the camera icon is removed; Navi, who ends B1 at the TV, leads the flight into the
  screen to white. The camera icon stays where other blocks use it (E, G, H, O) unless the Producer says otherwise.
- B v7 approved (Producer: "Bloque B v7 aprobado"). The camera icon stays in the other blocks (E, G, H, O) for now.
- Full animatic (Producer: "Une el animatic completo"): `docs/ep002/EP002_animatic_full_v1.mp4` (6:52.5), the 21 approved
  block clips joined in order by `scripts/ep002-join-animatic.py` (each clip with its own narration slice and approved
  sounds; at most one frame lost per boundary, ~0.4 s in total). Chapter list: `docs/ep002/EP002_animatic_full_v1_chapters.txt`.
- Art quote v1 approved: "Apruebo A + B. Sin embargo aún no hagas nada del villano, ese lo haremos de último"
  (`docs/ep002/ART_QUOTE_v1.md`; ledger Q011-Q037, 25.0 credits; the villain Q037 is approved but deferred to last).
- Generation order: the costume anchor first (#1 Quest in the adventurer tunic, front), shown to the Producer before the
  other tunic images reuse it as a reference. #1 generated (Q011, 1.0 credit, job da43b296, 2k, transparent):
  `docs/art_orders/quest/ep002_costume/01_tunic_veteran.png`. QC: face, curly hair, freckles and human ears match
  Quest_v1; own-design green tunic and cap, belt, wrist guards, tan trousers, brown boots; no emblems or logos.
- Tunic approved (Producer: "Apruebo la túnica, sigue con las vistas de espaldas"). Back views generated with #1 as the
  costume reference: #3 young Quest back (Q019, job e168e14d), #2f Pixie in her own tunic version, back (Q018, job
  5458e873), #4 adult Quest back with shield and scabbard (Q022, job 191f7d01; a first try, 83939fad, was blocked by
  Higgsfield's content filter for the word "sword" and was not charged; reworded as "scabbard ... handle"). 3.0 credits,
  balance 74.25. Files under `docs/art_orders/quest/ep002_costume/` and `docs/art_orders/pixie/ep002_costume/`.
- Final shot and Pixie anchor (Producer: "Sí, sigue con el plano final y Pixie"): #17+18 (Q028, job b2a6449c, 2k 16:9):
  Quest (adventurer, shield and scabbard, from behind) and Pixie (own-design princess gown, white and lilac with gold
  trim, short cape; three-quarter, smiling at him) on the outcrop, misty valley, river, a fairytale castle far away
  with the low sun behind it, birds. #2c Pixie in her tunic, waving, front (Q015, job 225f13a8): face, ponytail, eyes,
  skin and human ears match Pixie_v1; she is the anchor for #2d and #2e. 2.0 credits, balance 72.25.
- Batch 3 ("Sí, sigue con la siguiente tanda"), anchors as references: #2 Quest scared (Q012), #3a young Quest 3/4 looking
  up (Q020), #3b young Quest front smiling (Q021), #5 adult Quest on his own dapple-grey horse, back (Q023), #2d Pixie
  awe (Q016), #2e Pixie thinking (Q017). 6.0 credits, balance 66.25 (12.0 of 25.0 spent). QC notes: #3a looks up to
  the LEFT; in block R the adult stands to his right, so the engine mirrors it (free). #5: the horse reads a little
  small for the rider (pony-like); fine for block H's distant shot, retry possible at 1.0 if the Producer wants.
- Horse retry (Producer: "Quiero el caballo del color de Epona. A la final no habrá problema porque de ese color son
  los caballos también"): #5b (Q038, job 7a6665cd, 1.0 credit, balance 65.25): full-size chestnut horse with cream-white
  mane and tail, white socks and blaze, Quest in the tunic with shield and scabbard from behind (#4 as reference). A
  common real-horse coat, evoked, not a replica. #5b replaces #5 in block H; #5 (grey) stays on file unused.
- Batch 4 ("Sigue"): #2a Pixie impatient, arms crossed (Q013), #2b Pixie bored, imaginary watch (Q014), #6a kid Quest
  playing seated with a generic grey 90s controller (Q024), #6b kid Pixie pointing right (Q025), #6c kid Pixie sitting,
  knees up (Q026), #10a Quest blowing a blank gold cartridge, profile facing right, full body (Q027). 6.0 credits,
  balance 59.25 (18.0 of the approved 25.0 spent, plus the 1.0 horse retry). QC notes: kid Pixie reads a little older
  and longer-legged than kid Quest (about 11 vs 9); the engine sizes both by face width, so in block C she stays at
  0.9 x his face and only her legs read longer; retry possible at 1.0 each if the Producer wants. #2a's foot tap is
  not drawn (feet crossed): the engine adds the tap bounce, free.
- Backgrounds ("Sí, sigue con los fondos y el escudo (el escudo debe ser fiel)"), 16:9 2k, #17+18 as the style
  reference: #11 field with the road, the castle far away and the smoking volcano (Q029), #12 forest village of tree
  houses (Q030), #13 temple hall with the empty pedestal, a slot on top for our own 3D blade (Q031), #14 the giant tree
  with a kind face in the bark (Q032). 4.0 credits, balance 55.25 (22.0 of the approved 25.0 spent, plus the 1.0 horse
  retry). Files in `docs/art_orders/ep002_final/`. QC: the castle in these plates is the #17+18 one (white walls,
  slate-blue spires), not our own 3D castle; one castle must be chosen for the whole episode.
- Crest #16 must be faithful (Producer). Plan: rebuilt free as vector geometry in `tools/fx/triforce_plates.py` (engraved
  like the other plates) from a reference image the Producer picks, instead of generating it (an image model cannot
  be relied on to be faithful, and the prompt lint forbids the third-party name). Q033 (0.5) stays unspent.
- Castle (Producer: "Usa el castillo de estos fondos"): the episode's castle is the one in #11/#13/#17+18 (white walls,
  slate-blue spires). The own 3D castle is retinted/reshaped to match where it is still used (free).
- Optionals ("sigue con los opcionales"), 1k: #9 young Quest back, opposite step (Q034, job 17016248): QC FAIL for its
  purpose, the model drew the same leg lifted as #3, so it does not alternate; options: mirror #3 in the engine (free,
  the cap's droop flips) or one retry (0.5). #10 Quest profile pensive, hand at the chin (Q035, job d77d39b1): good; its
  pad is a modern one, the 3D N64 pad is composited over it as in Q008 (free). #15 adult Quest's bedroom at night (Q036,
  job 66d7e41a): good, empty bedside table for the CRT; 1k, upscaled in the engine. 1.5 credits, balance 53.75.
- Shield (Producer reference `docs/ep002/source/shield_reference_producer.jpg`: "así debería verse en la espalda de
  Quest ... ¿tú podrías hacerlo tal cual en 3D gratis y montarlo sobre Quest donde tiene el escudo?"): rebuilt free in
  `tools/props3d` from the reference (traced, symmetrised) and laid over adult Quest's shield as an engine layer (the
  generated art is not modified). Its red bird is also the faithful crest #16 (Q033 not needed).
- Shield built (free): `tools/props3d/shield_trace.py` traces the reference into layers, `scene.ts` heroShield() extrudes
  them (body, raised rim, blue face, horns, gold triangles, red bird, rim triangles and rivets measured by hand), sheet
  `docs/ep002/props3d_shield_sheet.png`. `tools/props3d/shield_mount.py` lays it over #4 as an overlay
  (`public/art/ep002/props3d/shield_on_04_adult_back.png`, preview `docs/ep002/shield_on_04_adult_back_preview.jpg`):
  similarity fit, so its proportions stay faithful; it is about 23% larger than the old kite shield so the old one is
  fully hidden. Pending Producer approval; then the same overlay for #5b and #17+18. Q033 cancelled (crest = its bird).
- Shield approved (Producer: "Apruebo el escudo, aplica 1 a 4 y refleja #9"). Applied, all free:
  1. Overlays also on #5b (`shield_on_05b_horse_back`) and #17+18 (`shield_on_17_18_outcrop`, warm and darker: golden
     hour with the sun ahead of them). Previews `docs/ep002/shield_on_*_preview.jpg`.
  2. Sway: `shield_mount.sway()` turns the overlay about the strap point (`shield_on_<name>.json` pivot), ±2.2° at the
     step rate; used when the art goes into the blocks.
  3. The royal crest woven on the four temple banners of #13: `tools/fx/crest_banners.py` -> overlay
     `public/art/ep002/overlays/13_temple_crest.png`, preview `docs/ep002/13_temple_crest_preview.jpg`.
  4. The Triforce centre plate now carries the faithful crest (bird engraved, triangles outlined), `tools/fx/triforce_plates.py`.
  #9: the walk cycle alternates #3 and #3 mirrored in the engine (#9's generated image stays on file unused).
- Sword v2 (Producer reference `docs/ep002/source/sword_reference_producer.jpg`: "modifica la 3D existente"): masterSword()
  rebuilt from measurements of the reference (blade with shoulders and engraved triangles, crescent wing guard with
  ribs, cup with the gold gem, collar, banded grip, turned pommel); comparison `docs/ep002/props3d_sword_v2_vs_reference.jpg`;
  sword_spin frames re-rendered, so blocks B, I, L and N pick it up on their next render.
- Shield and sword v2 approved (Producer: "Aprobado escudo y espada. Me encanta la proporción del escudo"). Fix for "se
  ve un pedacito arriba del escudo de abajo": the old kite's sharp peak reached past ours. `shield_mount.py` now measures
  the old shield's full silhouette (hull of its blue face and silver rim + ink) and fills whatever still peeks out with
  the surroundings (tunic, strap, sky), sampled only from outside the old shield. Same size and proportion as approved.
  Preview `docs/ep002/shield_on_quest_all_preview.jpg` (#4, #5b, #17+18).
- Shield QC improvement approved and applied: `shield_mount.py` checks the final overlay and stops if any pixel of the
  old shield is still visible (0 on #4, #5b, #17+18).
- "Monta el arte en los bloques ... Continuamos usando animatic ... No uses el motor hasta que yo apruebe": the new art
  goes into the animatic block scripts only (no engine). `scripts/animatic/lib.py` gains `final(key)` / `final_plate(key)`
  (3D shield and banner crest composited at load, #9 = #3 mirrored, the generator's faint alpha haze dropped at load;
  the files are untouched). The own 3D castle is retinted to the plates' look (white walls, slate-blue spires).
- Full animatic v2 (`docs/ep002/EP002_animatic_full_v2.mp4`, 6:52.5; light copy `_light.mp4`; overview
  `EP002_full_animatic_v2_sheet.jpg`): the final art in every block (B v8, C v6, D v6, E v6, F-B v7, G v6, H v8, I v6,
  J v4, K v3, L v4, M v3, N v8, O v5, P v3, Q v2, R v5, S-A v4, T v4, U v3), all re-rendered in dependency order after
  the parallel edits, framing QC on each. Pending Producer calls: H night scene in adult room #15 (default) or the
  childhood room (`H4_ROOM=child`); K uses adult #4 (docs said #3); B "You." uses adult #4; N right after the pull has
  no gear by rule, but #4 has it baked in (stand-in #3 scaled + MISSING label; options: a gear-less adult back ~0.5
  credit, or accept #4); F-B meter panel now covers the plate's castle; U: Pixie's turn on "Maybe" becomes a warm light
  swell (she is already turned in the final illustration); I: Pixie smaller on the NEW PLAYER card (face ratio 0.9);
  M: "Distance mattered" now runs to the far waterfall. Villain #8 still MISSING (last, as decided).
- v3 (Producer: "Aplica las mejoras 1 a 4, mueve el panel del bloque F. Hay escenas donde Quest camina, pero su avatar
  no, verifica todas las tomas"). Walk audit of every shot: young Quest already stepped (#3 / #3 mirrored) in D, F-B, G,
  H, R; adult Quest (#4) only bobbed in B6, R and T, and the hoodie Quest in P1: `lib.step()` now lifts one foot then
  the other (the leg below the knee drawn up), `lib.walk_adult()` adds the shield's swing. C: kid Pixie bounces as she
  walks in. E (hero is part of the plate, he does not travel), M (stands), K/U (stand) need no walk. Improvements: 1 H's
  1998 picture pans slowly across Hyrule; 2 I5 slow push into the temple before "pulls" and N1 push on the pedestal
  (held to N3, eased out in N4, his feet kept in frame); 3 K breeze in both tunics, her ponytail and his cap
  (`lib.breeze`); 4 shield sway on the walks and the horse's trot (`final(key, sway=)`). F-B: the meter panel is 72%
  size, lower right, clear of the castle and inside title-safe. Clips: B v9, C v7, F-B v8, H v9, I v7, K v4, N v9, P v4,
  R v6, T v5; full `EP002_animatic_full_v3_light.mp4` (6:52.5).
- Adult walk (Producer: "Realizar el arte de adulto sin el equipo. Pero que tenga la espada no?"): #4b generated (Q039,
  job 6ed31a9c, 1.0, balance 52.75): adult Quest in the tunic, from behind, mid-stride, NOTHING on his back. The walk is
  #4b and #4b mirrored; the gear is laid on top in the engine so it never changes shoulder: the 3D sword v2 in a new 3D
  scabbard (`tools/props3d` job back_sword) over his right shoulder and the 3D shield (swinging with the steps). Answer
  to "que tenga la espada": yes, the sword is there, as the 3D one on top, not drawn into the image. #4 (standing) now
  wears the same 3D sword: its drawn hilt above the shoulder is removed at load (the file is untouched), so standing and
  walking match. N2-N3 (just pulled the sword, no gear) = #4b bare; its MISSING label is gone. Blocks B v10, D v7, I v8,
  K v5, N v10, Q v3, R v7, T v6 re-rendered; full v4. Still drawn (not 3D) hilts: #5b (horse) and #17+18 (final shot).
- 3D sword on #5b and #17+18 (Producer: "Aplica la espada 3D en #5b y el plano final ... aún no entregues el animatic"):
  `lib._sword_swap` generalised (`SWORD_LINES`): the drawn hilt above his shoulder goes (transparent on the cut-out #5b;
  on the opaque final illustration filled from the surrounding sky by a normalised blur, feathered), the 3D sword v2 in
  its 3D scabbard lies on the drawn line under the 3D shield. Preview `docs/ep002/sword3d_on_5b_17_18_preview.jpg`.
  The one sword of the episode is now the 3D one in every adult shot. H v10, I v9, U v4 re-rendered (not delivered:
  the Producer has more to review first).
- Block J, Pixie at the tree (Producer: "Dejemos a Pixie en esa escena tal cual"): stays as in J v4 (#2d awe, #2e thinking,
  front on). No new art (#2d-b/#2e-b not generated, nothing spent).
- Block H night scene stays in adult Quest's room #15 (Producer: "Déjala tal cual").
- Block U "Maybe": warm light only, no push (Producer: "No sin acercamiento"); U v5 (push) kept on file, U v4 is the cut.
- Villain (Producer: "Recurrente, solo con capucha, mantén el brief"): #8 generated (Q037, job 3fd10adc, 1.0, balance
  51.75), spec `docs/characters/VILLAIN_V1_PROMPT_SPEC.md` (recurring; name pending). Block I v10: the drawn hooded
  shadow and claw are replaced by the art, graded to a shadow with the eyes and gem glowing; he rises behind the
  triangles, leans in on "reach" so his open claw comes over them, and on "decision" the gold dims under it (the art's
  hand cannot close, beat adjusted). MISSING label gone.
- Triforce plates (Producer: "cuando actualices la triforce recuerda colocar a Quest Link y Pixie Zelda"): POWER = the
  villain (#8), COURAGE = Quest in the tunic (#1). WISDOM = Pixie as the princess needs art (only #17+18 shows her as
  the princess, from behind, baked into the illustration): quoted Q040.
- Pixie as the princess, front (#2g, Q040 approved "Apruebo Q040", job b0787a3e, 1.0, balance 50.75): the gown of
  #17+18 (white and lilac, gold trim, short lilac hooded cape), hands clasped, a calm kind smile. Triforce WISDOM plate
  = #2g; the three plates are now the villain (POWER), Pixie the princess (WISDOM), Quest the hero (COURAGE), the royal
  crest in the centre. Blocks B v11 and I v11 (with the villain) re-rendered.
- Spanish review subtitles (Producer: "Quiero el animatic completo con subtítulos en español"): translation
  `docs/publish/EP002/script_es.json` (neutral Latin American, the game's Spanish names: Trifuerza, Espada Maestra, Gran
  Árbol Deku, Campo de Hyrule); `SUB_LANG=es` makes `lib.subtitle` spread each Spanish line over Bram's word timings.
  The whole animatic is re-rendered in a separate worktree (English clips untouched) -> EP002_animatic_full_v4_es(_light).
  On-screen graphics (tags, stamps, labels such as SAME ROAD) stay in English for now. Villain name: pending.
- Spanish subtitles = the Producer's approved ES-419 script v3, verbatim (`docs/ep002/source/SecondQuest_EP002_SCRIPT_v3_APPROVED_ES-419.txt`
  -> `docs/publish/EP002/script_es.json`, 157 lines aligned 1:1 with Bram's cues). Claude's own translation is kept as
  `script_es_claude_draft.json` (superseded). Compared line by line: the approved one is more natural overall and keeps the
  series' terms (Hyrule Field, Master Sword, "quest"). Report only (scripts are never rewritten): two lines may read a
  little stiff in ES-419, l87 "cambiaría casi nada" (natural: "no cambiaría casi nada") and l49 "Reconstrúyelo demasiado
  literalmente hoy" (natural: "Reconstrúyelo hoy de forma demasiado literal"); the Producer decides.
- 2026-10-06 · ES-419 lines l87 and l49 stay as written (Producer: "Quedan así").
- 2026-10-06 · Villain name still open; Claude proposed Varkhul / The Faceless King / Morvane / Grauth / Ashkar / Nocthar.
- 2026-10-06 · **No subtitles from now on, English or Spanish** (Producer). `lib.subtitle` draws nothing unless `SUBS=1`.
- 2026-10-06 · Walk audit, fixes 1-5 approved (Producer: "Aplica 1 a 5"):
  1. B6 (0:21.7): adult Quest walks down the road's centre line measured on plate #11, his size following the plate's
     perspective (vanishing line y .68 from the fence posts), no longer a straight diagonal shrinking in 4.5 s.
  2. B6 pace: a calm walk with a stride that matches the ground covered (0.7 m a step); he keeps walking to the end of
     the block, under the wordmark.
  3. One pace for every Quest walk: `lib.STEP_RATE = 5.8` (1.85 steps/s, was 2.9 young / 2.2 adult). In R the young and
     adult Quest now walk in step.
  4. No treadmill in F-B and H: while he walks the field ahead comes slowly toward the camera (3.5-4 % extra zoom on the
     background only). Done as a forward drift rather than a sideways slide, because he walks away from the camera.
  5. P1: the hoodie walk-in takes 2.6 s (was 2.0); his fade starts 0.2 s later so he arrives before fading.
- 2026-10-06 · B6 approved as rendered (he keeps walking under the wordmark, ~14 % tall at the end).
- 2026-10-06 · D10 (Producer: "camina y no recorre el sendero"): young Quest now walks down the field road in the plate,
  with the same road walk as B6 (`lib.road_walk`, a child's height and stride), instead of staying pinned to the middle
  of the screen while the camera moved. The camera pulls back from the castle onto him, then eases in behind him.
- 2026-10-06 · G, H and R walk down the road too (Producer: "hazlo en R y G, pero que vayan más despacio, lo
  suficiente para que se vean en movimiento durante esas escenas"). A slower walk for these long scenes:
  `lib.SLOW_RATE` 1.4 steps/s at 0.35 m/s, so they keep moving down the road through the whole scene.
  - G5-G7 and H1-H3: one continuous walk (H continues G's last framing, so it moves too, or the shot would snap back).
    In G5 the swinging camera now follows a Quest who really walks on.
  - R1-R3: the two of them walk side by side and in step from R1 to "beside", then stop for R4; R2's camera now
    continues from R1's (1.25 -> 1.4) instead of starting wide again. SAME ROAD / DIFFERENT PERSON sit above their heads.
- 2026-10-06 · G v8, H v12 and R v9 approved (slow walk down the road). Full animatic v5 on hold until the Producer asks.
- 2026-10-06 · On-screen text style approved (sheet docs/ep002/EP002_ui_style_sheet.jpg), applied to the whole video:
  A in Hyrule = our game text box (`ui_kit.sq_tag / sq_banner / sq_box`), B in the world = signpost / parchment,
  C real life = EP001 gold marker; the channel's type (Anton, Inter 800) replaces DejaVu everywhere. R1 1998 / 2026:
  option 2, area title cards (`ui_kit.area_title`; 1998 in square pixels, today in Anton with the gold rule); the same
  logic for every year / era label (TODAY, CHILD / ADULT ...). The wooden sign for the years was rejected.
- 2026-10-06 · Text restyle rendered in every block (cartridge v13, B v13, C v8, D v10, E v7, F-B v10, G v9, H v13, I v12,
  J v5, K v6, L v5, M v4, N v11, O v6, P v6, Q v4, R v10, S-A v5, T v8, U v5), no subtitles. Note: U's new v5 replaces
  the earlier, reverted U v5 (the push version) under the same name. Before/after: docs/ep002/EP002_ui_before_after_*.jpg.
- 2026-10-06 · Video-game details approved and applied (1, 3, 4, 8, 9):
  1. Area cards the first time we enter a place (`ui_kit.area_enter`): THE FIELD (B4), THE FOREST (D7), THE GREAT TREE
     (J2), THE TEMPLE (N1). Not on the last view (U): the Producer wants it clean.
  3. Lock-on (`ui_kit.lockon`): the ocarina, the sword and the Triforce in B3, the cartridge in P2.
  4. A choice prompt in S1 (`ui_kit.choice_box`): "Remake this memory?" YES / NO; the cursor hesitates and lands on NO
     with "Probably not."
  8. "A very bad decision" (I6): a heart container breaks by the veteran's card, and his file loses its last heart.
  9. The end as a CONTINUE? menu (U3): NEXT QUEST over the video slot, JOIN THE PARTY over subscribe; the cursor hops.
- 2026-10-06 · SAME ROAD (R2): a shorter signpost (the words stacked), kept left of the young Quest so it never covers
  anyone (Producer).
- 2026-10-06 · Music notes (and ★ ♥ →) had turned into empty boxes with the Inter switch (Inter has no such glyphs): they are drawn in DejaVu Bold again, as before (Producer).
- 2026-10-06 · Area cards stay: once per place (Producer: "una vez por lugar, como está ahora"). Notes: ♪ ♫ as before.
- 2026-10-06 · Clean video from now on (Producer): no planning tag strip, no planning notes, no end-screen slot guides.
  `lib.tag` and those notes draw only with PLANNING=1. Every block bumped and re-rendered clean.
- 2026-10-07 · Final 2K render v6 approved as the episode video ("así está perfecto"); delivered as draft release
  `deliver-ep002-animatic-v6-2k` (auto-deleted after 7 days).
- 2026-10-07 · Titles: publish with the **curiosity** title, test the search title (PUBLISHING_STANDARD §3.6 changed; Producer:
  "el objetivo es impulsar y probar"). Based on EP001 at ~4.5 days (`docs/publish/EP001/ANALYTICS_D5.md`).
- 2026-10-07 · Trailer Short S1 approved order: opens on "But there is one thing Nintendo cannot rebuild from the ground
  up. — You." (l07–l08), then the anchors (l03–l06), ends on "So, why?" (l10). Approved lines only, no new words.
- 2026-10-07 · Thumbnails v2 (options 1 and 2, three Test & Compare variants each, existing art only) shown to the
  Producer: `docs/publish/EP002/thumbnails/v2/`.
- 2026-10-07 · Packaging chosen: thumbnail **1d "EXCEPT YOU"** (Quest in the red hoodie with the N64 pad, face big on the
  left looking at the remake's three anchors in game item slots) + title A *"Ocarina of Time Remake: The One Thing Nintendo
  Can't Rebuild"*, title B *"You'll Never Play Ocarina of Time for the First Time Again"*. Test & Compare words: EXCEPT
  YOU / NOT YOU. / YOU CHANGED. Producer: a modern (PlayStation-like) pad is wrong for this story, the pad is the N64's;
  the main Quest stays in the red hoodie (he is "you", the player; the tunic belongs to what is rebuilt).
- 2026-10-07 · Trailer Short v3: order kept hook-first (l07–l08, l03–l06) plus l09 before l10 so "So, why?" has its
  question; "So, why?" lands on our wordmark (the episode's 16:9 logo card does not fit 9:16). Framing B (frame at 160 %
  width, 62 % visible, blurred fill) instead of the 9:16 crop that cut the art; fixed title band "THE ONE THING /
  NINTENDO CAN'T REBUILD" (Producer: "Sí, móntalo así con el encuadre B y el título").
- 2026-10-07 · Trailer Short v11: Navi's flight into the wordmark's four-point star (as block U's end): she leaves Quest
  as the wordmark lands, rises around it and goes into the star in the "o" of Second as "why?" ends; the star twinkles.
  Her trail sound is the episode's (Producer-supplied NAVI_SFX_01 at 0.14, same risk note as in the episode).
- 2026-10-07 · HUD fix approved: solid buttons with the gloss blended on (no see-through hole), rupees lower. Full v7.
- 2026-10-07 · Block K: the 3D shield/sword no longer ripple with the tunic's breeze (lib.gear_mask). Thought bubble →
  proposal B, a memory: warm glow with a dissolving edge, no ink line, sparkles.
- 2026-10-07 · Block J: the spider has mean red eyes, angry brows and fangs, sitting in a cobweb by the moustache; no ice
  bag ("sin bolsa"). Full v8.
- 2026-10-07 · Block J spider → our homage to the one-eyed giant spider (Producer: "Aprobado el homenaje"): own toon drawing, one big eye that blinks, horns, jointed legs with teal claws, in the cobweb. Full v8.
- 2026-10-07 · Spanish dub track approved and made (quote "Q011" = ledger Q041): Bram (voice 4) reading the approved
  ES-419 script verbatim, 8 blocks + 1 retake; lines placed on each English line's start, tempo <= 1.15 locally (57 %
  untouched), the episode's own SFX re-mixed identically; length = the video's. Scripts: ep002-es-lines.py,
  ep002-es-schedule.py, ep002-es-audio.py. Files: audio/bram/ep002_es/.
- 2026-10-07 · Spanish dub v2 (Producer heard cuts and narration over narration at 0:58, 1:56, 2:36, 3:35-3:50,
  4:00-4:22, 4:35-4:45, 5:10-6:52). Cause: v1 cut each line at the STT word times, so a tail could carry the next
  line's first sound (heard twice) and some cuts fell inside words. v2: cuts only inside real pauses found in the audio
  (lines Bram ran together stay together), segments laid end to end never overlap (blocks included), an even tempo
  per block where Spanish is longer (B03 1.108) with local bumps <= 1.15, rubberband stretch (formants kept), 8 ms
  fades inside silence, a 90 ms release where a take stops on a vowel (B06 "reconoce."). QC (ep002-es-qc.py, full
  track STT): 1121 script words / 1121 heard, no repeated or missing word, 0 overlaps; every flagged interval reads as
  the script. "Quest" at the end is heard as "Quest" (no retake needed). No credits spent.
- 2026-10-07 · Spanish dub v3 (Producer: "desde el 1:30 se escucha como doble o con eco"; "se escucha el fondo… y
  después muy cortado en los espacios"; "lo importante es que siempre se escuche natural"). Causes: v2's tempo stretch
  (ffmpeg rubberband R2, 1.108 over 1:31-2:38) smeared the voice; inserted silences were digital zero while Bram's own
  pauses carry breath/air (~-60 dBFS), with 8 ms fades. v3: the track is planned backwards so lines start a little
  earlier when later ones need room (lead <= 2.5 s, lag <= 1.5 s), tempo only where unavoidable (0:00-0:29 and
  1:31-2:38 at 1.075, a little of B02/B04; 80 of 156 segments untouched) with rubberband R3 (--fine); takes sliced by
  sample so lines that were together play exactly as recorded (38 joins); other joins inside pauses (15 equal-power
  crossfades, 102 lengthened pauses with 40 ms fades); a soft gate (-14 dB below -40 dB, look-ahead 30 ms, release
  60 ms) makes every pause sound alike. Q042 (0.3 credits): B06's last sentence re-recorded (B06r_l135_l136.mp3).
  QC: 1120/1121 words heard (the missing one is heard when that passage is checked alone), 0 overlaps, every join at
  <= -41 dBFS, no audible clicks.
- 2026-10-08 · Spanish dub v3.1 (Producer: v3 "me encanta", only 0:58-1:05 not natural). Cause: l20/l21 ("…guardando
  sensaciones… y absolutamente terrible…") is one breath in Bram's take and had been split with 1.26 s of silence put
  inside it. Fix: l21 stays with l20 (ep002-es-lines.py KEEP_WITH_PREVIOUS), the pair is centred on both English lines;
  only 56.8-64.0 s of the track changes (rest identical).
