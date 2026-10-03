# SecondQuest EP002: real asset audit, production reconstruction and TRUE NEW_ART gap (v1)

**Directive:** `SECONDQUEST_EP002_PRODUCTION_EXECUTION_PROMPT_NO_FULL_STORYBOARD`. No storyboard was made.
**Stage:** REAL ASSET AUDIT → REAL PRODUCTION RECONSTRUCTION → TRUE NEW_ART GAP → **STOP for Producer approval.**
**Spending:** nothing has been generated and no credits have been spent.

**Previews:** in `docs/ep002/audit/`, regenerated with `python3 scripts/ep002-audit-previews.py`.
- They are built only from real FINAL_ART files in `public/art`, plus programmatic layers drawn in code (Navi, Triforce, wireframe, meters, glass).
- Anything the library does not have appears as a dashed red **MISSING** box.
- They are planning images at 960x540 and never enter the video.

**How the audit was done:** I opened and looked at the images in `shared/art_catalog.json`, not just the manifest. Relevant assets examined:

| Asset ID | What it really is | Use in EP002 |
|---|---|---|
| `core.bg.quest_bedroom_morning` | Warm bedroom, window, bed, desk | **Memory Room** base (REUSE) |
| `core.bg.living_room_night_gaming` | Night living room with a modern flat TV | Rejected: a modern TV breaks the 1998 room |
| `quest.default.gaming_excited` | Normal Quest seated with a controller | Seq 01 / 21 (REUSE) |
| `quest.default.sitting_back`, `quest.default.sitting_back_turn` | Normal Quest seated, seen from behind / turning | Seq 26 (REUSE) |
| `quest.default.walking_back` | Normal Quest walking away from camera | Seq 02 / 27, entering the threshold (REUSE) |
| `quest.default.looking_up_awe` | Normal Quest looking up in awe | Seq 01, recognising Navi (REUSE) |
| `ep001.bg_fantasy_doors` | Hall of three doors, centre one blue and luminous | Seq 02 / 27 threshold (REUSE) |
| `genre.fantasy.bg_castle_rescue` | Disney-style blue castle | Not Hyrule: fails "Ocarina identity" |
| `core.bg.storm_low_horizon` | Open grassland under a storm | Weak: no castle and the wrong mood |
| `ep001.bg_crossroads` | Farm road with a city skyline | Wrong world: farm plus city |
| `core.bg.sunset_sky`, `genre.farming.layer.sunset_farm_midground` | Sunset sky, farm midground | Sky reusable as a grade reference only; the midground is farmland |
| `genre.fantasy.princess` | Princess in a purple gown with curly brown hair | Not Zelda-coded |
| `genre.fantasy.quest.knight` | Quest_v1 face as a knight: steel armour, red cape, blue tunic | Not Hero of Time: wrong silhouette and palette |

**Library conclusion:**
- The real-world layer (Memory Room, normal Quest) and the threshold are covered.
- Everything Ocarina-specific is missing: Hyrule, the Temple, Kokiri, Deku, Hero-of-Time Quest, Epona, Saria, Zelda, Ganondorf, the N64, the cartridge, the ocarina and the Master Sword.
- Navi, the Triforce and the whole technical layer are solved in code at zero cost.

---

## Reconstruction by base plate

### A · N64 / MEMORY ROOM (preview `A1`, `A2`)

| Field | |
|---|---|
| **Sequences** | 01, 05, 21, 26, 27 (start) |
| **Script** | "In 1998, Ocarina of Time asked you to save Hyrule… go back." · "It is the game… plus the room… Saturday afternoon…" · "The original game still exists…" · "Nintendo cannot rebuild the room… the friend sitting next to you." |
| **Actual assets** | `core.bg.quest_bedroom_morning`, `quest.default.gaming_excited`, `quest.default.looking_up_awe`, `quest.default.sitting_back`, `quest.default.sitting_back_turn` |
| **Quest** | Normal Quest (adult); a child in normal clothes for seq 05 |
| **Navi** | Comes out of the CRT glow (01), crosses the room towards the screen and leads the way (01 → 02); in 26 she is absent, and in 27 she waits at the screen |
| **Ocarina identity** | Nintendo 64 + grey cartridge with a gold label + CRT |
| **Composition** | FG: N64 + cartridge on the floor/desk · MG: Quest seated · BG: bedroom with window light |
| **Camera** | Medium shot → detail push-in on the cartridge; seq 26 uses the same axis with nobody there |
| **Editorial extraction** | 1. Wide hook · 2. Cartridge insert · 3. CRT detail where Navi is born · 4. Over-shoulder of Quest following Navi · 5. Afternoon light (programmatic grade) for the childhood memory · 6. Child at the TV · 7. Empty friend cushion · 8. Empty room (26) · 9. Screen glow → transition (27) |
| **Method** | REUSE + RECOMPOSE + PROGRAMMATIC (afternoon light, CRT glow, Navi) |
| **Missing** | CRT TV + Nintendo 64 (prop) · Ocarina of Time cartridge (prop) · child Quest in normal clothes, seen from behind |

### B · ENTRY / THRESHOLD (preview `B`)

| Field | |
|---|---|
| **Sequences** | 02, 27 |
| **Script** | "New graphics. An orchestra. Voices. Modern controls. A new camera." · "But it can rebuild Hyrule." |
| **Actual assets** | `ep001.bg_fantasy_doors`, `quest.default.walking_back` |
| **Quest** | Normal Quest crosses → Adult Hero-of-Time Quest on the far side (light-wipe transition) |
| **Navi** | Leads, flies into the blue doorway and is the transition's light source |
| **Ocarina identity** | Comes from what is seen through the doorway (Hyrule Field, plate C) |
| **Composition** | FG: doors · MG: Quest from behind · BG: the blue doorway composited onto the Hyrule plate |
| **Camera** | Push-in through the door; flash + outfit change in the cut |
| **Editorial extraction** | 1. Quest follows Navi · 2. Push through the door · 3. Flash/outfit · 4. Reverse in seq 27 (return) |
| **Method** | REUSE + PROGRAMMATIC (glow, flash, mask) |
| **Missing** | NONE of its own: it uses Adult HoT Quest and Hyrule Field, both covered in C |

### C · HYRULE FIELD / ROAD, the key family (previews `C1`, `C2`, `C3`)

| Field | |
|---|---|
| **Sequences** | 02, 04, 07, 08, 09, 10, 11, 12, 13, 16, 18, 24, 25, 27, 28, 29 |
| **Script** | "You." · "Because you were smaller." · "The castle in the distance… the world might continue forever." · "Better is measurable…" · "One person is looking at Hyrule…" · "Same road. Different person." · "you both grew up." |
| **Actual assets (tested)** | `genre.fantasy.bg_castle_rescue` (C1), `core.bg.storm_low_horizon` (C2), `ep001.bg_crossroads` (C3). **All three fail.** C1 is a Disney castle, not Hyrule; C2 has no castle or road; C3 is a farm and a city. |
| **Quest** | Young HoT (07, 08, 09, 13, 16, 24) · Adult HoT (02, 04, 10, 11, 12, 27, 28) · Adult HoT + Epona (24, 25, 29) |
| **Navi** | Leads along the road (07, 09) · pulls the eye toward the castle (09) · flies foreground → background to show depth (18) · stays when the metrics disappear (11) · connects the young and adult states (24) · rests on the shoulder at the close (29) |
| **Ocarina identity** | Rolling green field, a dirt path, a distant castle with a Hyrule silhouette, Death Mountain on the horizon |
| **Composition** | FG: grass + path start · MG: path leading to the horizon · BG: Hyrule Castle small and distant, mountain, big sky |
| **Camera** | Low, child-height camera; a fixed axis on the road, reused identically for 07 / 24 / 29 |
| **Editorial extraction** (a single plate) | 1. Extreme wide with a tiny Quest (07) · 2. Push toward the castle (09) · 3. Wireframe/specs (08) · 4. Meters on, meters off (11) · 5. Clean vs memory echoes (13 / 16) · 6. Fixed frame → free camera (12 / 18) · 7. Young walks / Adult + Epona on the same axis (24) · 8. Adult dismounted (25) · 9. Sunset version by grade (29) · 10. Night/storm version by grade if needed |
| **Method** | NEW_ART (1 plate) + PROGRAMMATIC (time-of-day grades, overlays, parallax) |
| **Missing** | **Hyrule Field plate (road + castle)** · Young HoT Quest (walking) · Adult HoT Quest (standing) · Adult HoT Quest on Epona · Adult HoT Quest beside Epona |

### D · RELICS (preview `D`)

| Field | |
|---|---|
| **Sequences** | 03, 14, 22 |
| **Script** | "The same ocarina. The same sword. The same Triforce." · "They know what that ocarina means…" · "The ocarina is still there. The Master Sword is still waiting. The Triforce still means…" |
| **Actual assets** | `ep001.bg_fantasy_doors` (dark background, defocused) + programmatic Triforce |
| **Quest** | None (the relics are shown alone) |
| **Navi** | Jumps from relic to relic and lights each one in turn |
| **Ocarina identity** | Blue Ocarina of Time · Master Sword (purple hilt) · Triforce |
| **Composition** | Dark background, one relic per beat, warm-light rim |
| **Camera** | Three slow push-ins; in 22 they are repeated as stable callbacks |
| **Editorial extraction** | 1–3. One relic per beat (03) · 4. Triforce alone for "very bad decision" (14) · 5. Static trio (22) |
| **Method** | PROGRAMMATIC (Triforce, light, darkening) + NEW_ART props |
| **Missing** | Ocarina of Time (prop) · Master Sword (prop; it is also the sword in the pedestal in F) |

### E · KOKIRI / SARIA (preview `E`)

| Field | |
|---|---|
| **Sequences** | 06, 09 (start of the journey), 22 ("The forest is still there"), 23 |
| **Script** | "Plus the friend…" (06) · "You remember the forest." · "The forest is still there." |
| **Actual assets** | None usable: the library has no forest or village plate |
| **Quest** | Young HoT (06, 23) · Adult HoT in the same place (23 callback) |
| **Navi** | Floats between Quest and Saria (the relationship) · leads out of the forest toward the field (09) |
| **Ocarina identity** | Kokiri houses inside tree stumps, light through the canopy, Saria with green hair |
| **Composition** | FG: Young Quest + Saria · MG: Kokiri village · BG: canopy with shafts of light |
| **Camera** | Gentle, brief; 23 repeats the same framing, without Saria and with Adult Quest |
| **Editorial extraction** | 1. Quest + Saria (06) · 2. Empty forest (22) · 3. Forest edge opening onto the field (09) · 4. Callback with Adult Quest alone (23) |
| **Method** | NEW_ART (plate + Saria) + RECOMPOSE (callback without Saria) |
| **Missing** | **Kokiri forest plate** · **Saria** · Young HoT Quest (standing, the same one as F/G) |

### F · TEMPLE OF TIME, major hero moment (preview `F`)

| Field | |
|---|---|
| **Sequences** | 14, 19, 22 |
| **Script** | "They know what happens when Link pulls the Master Sword." · "You were a child. Then you were not. You disappeared… and the world changed without you." |
| **Actual assets** | `ep001.bg_fantasy_doors` was tested: it is not the Temple (no pedestal, no Temple architecture) |
| **Quest** | Young HoT → Adult HoT, **same position, same camera axis** |
| **Navi** | The continuity: she stays in the same place while Quest changes |
| **Ocarina identity** | Temple of Time interior: Triforce symbol on the floor, Pedestal of Time with the Master Sword, light from the windows |
| **Composition** | FG: Quest in the centre, back three-quarters · MG: pedestal + sword · BG: arches and windows of light |
| **Camera** | Fixed, solemn; a programmatic light flash + grade (the world after 7 years) |
| **Editorial extraction** | 1. Wide with the sword in the pedestal (14) · 2. Young Quest before the sword · 3. White flash · 4. Adult Quest on the same axis · 5. "The Master Sword is still waiting" (22) |
| **Method** | NEW_ART (1 plate) + PROGRAMMATIC (flash, grade); the sword is composited from the D prop |
| **Missing** | **Temple of Time plate (with an empty pedestal)** · Young HoT Quest · Adult HoT Quest |

### G · GREAT DEKU TREE (preview `G`)

| Field | |
|---|---|
| **Sequences** | 15 |
| **Script** | "They meet the Great Deku Tree and think: That is an extremely large tree with an extremely personal problem." |
| **Actual assets** | None usable (tested with `core.bg.storm_low_horizon`, empty) |
| **Quest** | Young HoT, tiny |
| **Navi** | Hovers between Quest and the face (scale) |
| **Ocarina identity** | Great Deku Tree with a solemn face and a mouth-entrance |
| **Composition** | Huge tree filling the frame, Quest small at the bottom |
| **Camera** | Slow tilt up the trunk; the joke lands while the camera holds |
| **Editorial extraction** | 1. Tilt to the face · 2. Low shot with Quest small · 3. Clean version after the joke (memory overlays removed) |
| **Method** | NEW_ART (1 plate) |
| **Missing** | **Great Deku Tree plate** |

### H · TECHNICAL / PROGRAMMATIC (previews `H1`, `H2`, `H3`)

| Field | |
|---|---|
| **Sequences** | 08, 10, 11, 12, 17, 18, 20 |
| **Script** | "N64 texture filtering" · "More polygons. Better lighting…" · "But familiar is not measurable." · "Sharper textures… exactly where you remember it." · "But there is a problem." |
| **Actual assets** | Engine layers only: wireframe, meters (`counter`/`progress`), glass (`rect` + `light`), `flash`, `particles`, camera. In the previews the plate is a placeholder; in production it is the C plate. |
| **Quest** | Young HoT (08) · Adult HoT (10–12, 18, 20) |
| **Navi** | The only living thing that moves while everything is "measured"; in 17 she is frozen behind the glass, and in 20 she breaks free |
| **Ocarina identity** | Comes from the Hyrule plate; the overlays only "invade" |
| **Composition** | Overlays on top of the C plate |
| **Camera** | Fixed during measurement; free camera when the glass breaks |
| **Editorial extraction** | 1. Specs invade (08) · 2. Hyrule upgrades in place (10; blur/low-res → sharp) · 3. Meters (11) · 4. Meters removed (11 hero) · 5. Fixed frame → free camera (12C) · 6. Museum glass (17) · 7. Glass breaks (17 / 20) · 8. Flat → depth with parallax (18) |
| **Method** | PROGRAMMATIC |
| **Missing** | NONE |

### I · ZELDA / GANONDORF (preview `I`)

| Field | |
|---|---|
| **Sequences** | 14 |
| **Script** | "They see three golden triangles and immediately understand that somebody is about to make a very bad decision." · "wisdom, power and courage… two different eras." |
| **Actual assets** | `genre.fantasy.princess` was tested: a purple gown and curly brown hair, so it reads as a generic princess, not Zelda |
| **Quest** | None |
| **Navi** | Not needed (mythology chain); at most a light transition |
| **Ocarina identity** | Zelda (blonde, pink/white gown, Triforce emblem) · Ganondorf (red hair, dark armour, green skin) · Triforce |
| **Composition** | Zelda on one side, Ganondorf on the other, Triforce between them (programmatic) |
| **Camera** | Recognition chain: Zelda → Triforce → Ganondorf reaching for it |
| **Editorial extraction** | 1. Zelda · 2. Triforce · 3. Ganondorf "bad decision" · 4. Both with the Triforce ("two eras") |
| **Method** | NEW_ART (2 characters) + PROGRAMMATIC (Triforce, light). Background: the C plate darkened, or the D background. |
| **Missing** | **Zelda** · **Ganondorf** |

### J · EPONA / FINAL HERO IMAGE (preview `J`)

| Field | |
|---|---|
| **Sequences** | 24, 25, 29, 30 (CTA over the same frame) |
| **Script** | "Same road. Different person." · "And this time... you both grew up." · CTA |
| **Actual assets** | `core.bg.sunset_sky` + `genre.farming.layer.sunset_farm_midground`: they **fail** because they are farmland, not the earlier horizon |
| **Quest** | Adult HoT riding Epona (24) · Adult HoT dismounted beside Epona (25, 29) |
| **Navi** | Close to Quest's shoulder, a slow pulse; the only motion in the hold |
| **Ocarina identity** | Epona (chestnut with a white mane) + the same Hyrule horizon as seq 07 |
| **Composition** | **The same C plate with a sunset grade**: FG Quest + Epona · MG road · BG castle + sunset sky |
| **Camera** | The same axis as 07; a very slow push; **hold** on "you both grew up" |
| **Editorial extraction** | 1. Ride across the road (24) · 2. Stop + dismount (25) · 3. Young Quest echo at 15% opacity that fades (25 / 29) · 4. Final hold (29) · 5. CTA with SecondQuest identity rising (30) |
| **Method** | RECOMPOSE (C plate + grade) + NEW_ART (Quest + Epona) |
| **Missing** | Adult HoT Quest on Epona · Adult HoT Quest beside Epona |

---

## Mini-previs (Runway)

**I recommend none for now.** The hero moments already work as planning compositions:
- they share the same C and F plates;
- the camera axes are defined above.

If Eli wants to see the Temple of Time young → adult change or the same road with Epona before spending, those are the two candidates. That needs separate approval, and it would be done in Runway, never in Higgsfield.

---

## TRUE NEW_ART GAP

**Cost basis:**
- Higgsfield `gpt_image_2_5`, medium quality: **1k = 0.5 credits, 2k = 1 credit**.
- Backgrounds are made at 2k to meet the minimum background size of 2304x1296 (1080p × 1.2).
- Characters with Quest's face are made at 2k: they appear large on screen and go through the Quest QC in `docs/QUEST_V1_PROMPT_SPEC.md`.
- Other characters and props are made at 1k.
- One generation is expected per asset; a retry is only made if QC fails, and each retry is quoted first.

| # | Asset | Directed scenes served | Exact reason it is required | Why REUSE fails | Why RECOMPOSE fails | Why PROGRAMMATIC fails | Why DERIVE fails | Expected generations | Est. credits |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Hyrule Field plate** (road + distant castle) | 02, 04, 07–13, 16, 18, 24, 25, 27–29 | The episode's base family, used for the "smaller" scale and the same-road match | `bg_castle_rescue` is a Disney castle; `storm_low_horizon` has no castle or road; `bg_crossroads` is a farm and a city | Combining them produces a farm or a fairy tale, not Hyrule | Code cannot paint a landscape | No Hyrule asset exists to adapt | 1 | 1.0 |
| 2 | **Temple of Time plate** (empty pedestal) | 14, 19, 22 | The young → adult hero moment requires a fixed axis inside the Temple | `fantasy_doors` is not the Temple | Doors plus a sword do not make the Temple | No | No base exists | 1 | 1.0 |
| 3 | **Kokiri forest plate** | 06, 09, 22, 23 | "You remember the forest", plus Saria's world | There is no forest plate | No | No | No | 1 | 1.0 |
| 4 | **Great Deku Tree plate** | 15 | The "extremely large tree" joke needs the recognisable tree | None exists | No | No | No | 1 | 1.0 |
| 5 | **Young HoT Quest**, walking, three-quarter back view | 07, 08, 09, 13, 16, 24, 25 (echo), 29 (echo) | Hero moment "Because you were smaller" | All Quest assets wear the hoodie or the knight outfit | An outfit cannot be swapped by compositing | No | `quest.knight` has armour and a red cape: wrong silhouette, and it would still need a generation | 1 | 1.0 |
| 6 | **Young HoT Quest**, standing front | 06, 15, 19, 23 | Saria, Deku, and Temple (young) | The same reason as #5 | A walking pose does not work standing still in the Temple | No | It is derived from #5 (same character, same session) but needs its own pose | 1 | 1.0 |
| 7 | **Adult HoT Quest**, standing (shield + sword on back) | 02, 04, 10–12, 18, 19, 20, 22, 23, 27, 28 | Temple (adult, same position as #6) and the in-world presence | There is no adult HoT asset | No | No | Derived from #6 with an image reference to keep the face | 1 | 1.0 |
| 8 | **Adult HoT Quest on Epona** (side view) | 24 | "Same road", crossing on horseback | There is no horse | Posing Quest on a horse does not work | No | No | 1 | 1.0 |
| 9 | **Adult HoT Quest beside Epona** (standing, calm) | 25, 29, 30 | The final hero image, the most important frame of the episode | No | #7 + #8 composited does not hold together (a horse with no rider, contact, light) | No | Derived from #8 with a reference to keep Epona the same | 1 | 1.0 |
| 10 | **Child Quest in normal clothes** (seated, from behind, facing the TV) | 05, 26 (as an absence/trace) | "The game… plus the room" with the child present | All normal Quest assets are adults | Scaling an adult does not read as a child | No | No | 1 | 0.5 |
| 11 | **CRT TV + Nintendo 64** | 01, 05, 21, 26, 27 | The real-world proof of 1998 | Only a modern TV exists (`living_room_night_gaming`) | No | A programmatic box does not read as an N64 | No | 1 | 0.5 |
| 12 | **Ocarina of Time cartridge** | 01, 21 | "The cartridge is the physical proof" (Scene Book) | None exists | No | A drawn grey rectangle loses the identity | No | 1 | 0.5 |
| 13 | **Ocarina of Time** (prop) | 03, 14, 22 | Anchor 1 of 3 | None exists | No | Not credible in code | No | 1 | 0.5 |
| 14 | **Master Sword** (prop) | 03, 14, 19, 22 | Anchor 2 of 3, plus the pedestal | Only the generic knight's sword exists | No | No | No | 1 | 0.5 |
| 15 | **Saria** | 06, 23 | Childhood relationships | None exists | No | No | No | 1 | 0.5 |
| 16 | **Zelda** | 14 | Recognition chain | `genre.fantasy.princess` is not Zelda | No | No | Editing it into Zelda costs the same as generating, with a worse result | 1 | 0.5 |
| 17 | **Ganondorf** | 14 | "A very bad decision" | None exists | No | A silhouette weakens the recognition | No | 1 | 0.5 |

**TOTAL NEW ASSETS:** 17 (4 backgrounds, 6 characters with Quest's face, 3 other characters, 4 props). Epona appears inside #8 and #9 rather than as a separate asset.

**TOTAL EXPECTED GENERATIONS:** 17 (one each). If every asset failed QC once, the worst case would be 34, and each retry is quoted first.

**TOTAL ESTIMATED HIGGSFIELD CREDITS:**
- Base: **13.0**. That is 4 backgrounds + 5 HoT Quest characters (#5–#9) at 1.0 each (9.0), plus 8 assets at 0.5 each (4.0).
- Worst case: **26.0**.
- The current balance is about 119 credits, as last checked. The Bram narration (~20 credits) is a separate gate, approved later.
- Cutting out characters with alpha: if Higgsfield's `remove_background` is needed, it is quoted separately before use.

**NEW_ART AVOIDED THROUGH REUSE / RECOMPOSE / PROGRAMMATIC / DERIVE (≈20 assets):**
- **REUSE:**
  - Memory Room (`core.bg.quest_bedroom_morning`);
  - five normal Quest poses (`gaming_excited`, `looking_up_awe`, `sitting_back`, `sitting_back_turn`, `walking_back`);
  - the threshold (`ep001.bg_fantasy_doors`), which also serves as the relics background.
- **PROGRAMMATIC:**
  - Navi (the whole system, in every in-world sequence);
  - the Triforce;
  - the Hylian/Triforce emblem in the Temple, done as light;
  - wireframe and specs (08);
  - meters (11);
  - museum glass and its break (17 / 20);
  - flat → depth (18);
  - fixed → free camera (12);
  - memory echoes and ghosting (13, 16, 25, 28, 29);
  - the time flash (19);
  - afternoon light in the room (05);
  - CRT glow.
- **RECOMPOSE:**
  - the sunset final (29) and any night or storm version of Hyrule: grades on plate #1, with no extra plates;
  - Saria's callback (23): the same forest plate without her;
  - the same road for young and adult (24): the same plate and the same axis;
  - the empty room (26): the same room without the child;
  - the Zelda/Ganondorf background (14): the C plate darkened.
- **DERIVE:** #6 from #5, #7 from #6, and #9 from #8, using image references so face, outfit and Epona stay consistent across states. Without this, each one would be a blind generation with a higher chance of retries.

---

## STOP

No FINAL_ART has been generated and no credits have been spent. **Waiting for Eli's explicit approval** on:
1. this reconstruction; and
2. the 17-asset gap (13 credits base).

Asset names, poses and resolutions are adjusted for free before generating.
