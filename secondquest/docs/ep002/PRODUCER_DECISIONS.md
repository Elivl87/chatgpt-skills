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
