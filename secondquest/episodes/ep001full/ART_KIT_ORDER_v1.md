# SecondQuest EP001 — Kit de arte por capas (Nivel 3) · encargo v1

**70 archivos nuevos**, repartidos así:

- 20 fondos;
- 20 poses de Quest;
- 2 personajes secundarios;
- 28 props y máquinas.

Los **45 assets aprobados del hook** se reutilizan tal cual y no se vuelven a encargar. El motor pone toda la UI y los textos: contadores, checklists, carteles, precios, notificaciones y comentarios.

## Reglas de entrega (obligatorias)
- 2D SecondQuest editorial cartoon only (Quest Visual Bible): clean outlines, soft shadows, cinematic warm light. No 3D, no photorealism, no anime, no gameplay screenshots.
- One element per file. No sheets, no collages, no storyboard frames.
- NO text, numbers, UI, captions or logos baked in. Signs/boards/screens are blank; the engine writes the text (and localises it).
- Backgrounds: 3840×2160, opaque, no characters; keep the lower third readable for characters.
- Characters/props: transparent PNG, feet/base touching the bottom edge, no drop shadow (the engine adds contact shadows), ~2× on-screen size.
- Swap sets (same canvas, same size, pixel-aligned): crop-state series, day/night living room, drive trio, sitting_back / sitting_back_turn.
- Quest: red hoodie, dark curly hair, approved proportions; same face in every pose. Machines: generic, no real brand logos.
- Deliver with the exact file names/paths below. Dropping a file at its path replaces the current substitute automatically.

## Cómo se usa en el motor

- **Fondos:** la cámara hace push, pan y parallax sobre ellos, a cover-scale sin bordes.
- **Poses y props:** entran, salen, rebotan o cruzan el plano, y hacen swaps de expresión.
  - Las máquinas en vista lateral cruzan los campos (`drift`).
  - La serie de estados del cultivo se cambia en el mismo encuadre: arado → brote → verde → dorado → cosechado.
  - La serie 3 m / 6 m / 12 m crece en pantalla.
- **Anclaje a la narración:** cada archivo se enlaza a los cues de la voz, por lo que la integración consiste en copiar el archivo a su ruta y renderizar.

## Backgrounds / clean plates (20)

| # | Key | File | Size | Used in | Brief | Notes |
|---|---|---|---|---|---|---|
| 1 | `kit.bg_fantasy_doors` | `public/episodes/ep001_farming/kit/backgrounds/fantasy_doors.png` | 3840×2160 | M16 | Dim hall with three large doorways glowing different colours (red crime-city neon, blue war smoke, golden adventure ruins). Doors open, no people. Floor space centre-bottom for Quest (back view). |  |
| 2 | `kit.bg_bank_office` | `public/episodes/ep001_farming/kit/backgrounds/bank_office.png` | 3840×2160 | M17 | Old-fashioned bank loan office: heavy desk front-centre, tall paper stacks, filing cabinets, framed rules on wall (no readable text). Warm, slightly oppressive light. Desk surface empty for props. |  |
| 3 | `kit.bg_home_living_day` | `public/episodes/ep001_farming/kit/backgrounds/home_living_day.png` | 3840×2160 | M25, M26 | Quest's small apartment living room by day: sofa, rug, plants, window light. Lived-in but tidy enough to read. Floor space left-centre. |  |
| 4 | `kit.bg_home_living_night` | `public/episodes/ep001_farming/kit/backgrounds/home_living_night.png` | 3840×2160 | M27, M28, M29 | SAME framing as home_living_day, at night: lamp light, blue window, a desk corner with a router on the right shelf area left EMPTY (router is a prop). | Must align pixel-for-pixel with bg_home_living_day (day→night swap). |
| 5 | `kit.bg_field_plowed` | `public/episodes/ep001_farming/kit/backgrounds/field_state_1_plowed.png` | 3840×2160 | M21, M23, M44 | Mid-shot farm field, rows receding to a distant treeline and barn, soil freshly plowed, bright morning. Horizon at ~40 %. Rows lead the eye centre. | Crop-state series 1/5 — all five share IDENTICAL framing/horizon/barn (swaps). |
| 6 | `kit.bg_field_sprouting` | `public/episodes/ep001_farming/kit/backgrounds/field_state_2_sprouting.png` | 3840×2160 | M21, M23, M44 | SAME framing, tiny green sprouts in every row. | Crop-state series 2/5. |
| 7 | `kit.bg_field_green` | `public/episodes/ep001_farming/kit/backgrounds/field_state_3_green.png` | 3840×2160 | M21, M32, M44 | SAME framing, knee-high lush green crops. | Crop-state series 3/5. |
| 8 | `kit.bg_field_golden` | `public/episodes/ep001_farming/kit/backgrounds/field_state_4_golden.png` | 3840×2160 | M21, M24, M44 | SAME framing, tall golden wheat ready to harvest, late-afternoon light. | Crop-state series 4/5. |
| 9 | `kit.bg_field_harvested` | `public/episodes/ep001_farming/kit/backgrounds/field_state_5_harvested.png` | 3840×2160 | M21, M24 | SAME framing, stubble after harvest, a few straw bales. | Crop-state series 5/5. |
| 10 | `kit.bg_grain_yard` | `public/episodes/ep001_farming/kit/backgrounds/grain_yard.png` | 3840×2160 | M21, M24, M26 | Grain silos and a loading yard with an elevator spout, dusty sunny day. Road across the lower third for a truck prop. |  |
| 11 | `kit.bg_city_traffic` | `public/episodes/ep001_farming/kit/backgrounds/city_traffic.png` | 3840×2160 | M28 | Busy city street in a jam: car rows, taillights, billboards WITHOUT readable text, late-afternoon haze. Seen from driver height. |  |
| 12 | `kit.bg_farm_aerial` | `public/episodes/ep001_farming/kit/backgrounds/farm_aerial.png` | 3840×2160 | M30, M34, M35, M45 | High aerial of a patchwork farm: fields, barn, silos, paths, a lake. Organised and satisfying. Room for small tractor props. |  |
| 13 | `kit.bg_farm_yard` | `public/episodes/ep001_farming/kit/backgrounds/farm_yard.png` | 3840×2160 | M35, M36, M41 | Farmyard mid-shot: barn, silo, animal pen with fence, feed troughs, open dirt space front for animals/props. Warm day. |  |
| 14 | `kit.bg_tractor_cab` | `public/episodes/ep001_farming/kit/backgrounds/tractor_cab.png` | 3840×2160 | M37, M39 | Inside a tractor cab looking out through the windshield at a sunset field; steering wheel lower-centre, seat area left EMPTY for a seated Quest pose. |  |
| 15 | `kit.bg_field_overhead` | `public/episodes/ep001_farming/kit/backgrounds/field_overhead.png` | 3840×2160 | M37 | Straight top-down view of long parallel crop rows filling the frame (for a top-down tractor prop driving back and forth). |  |
| 16 | `kit.bg_real_farm` | `public/episodes/ep001_farming/kit/backgrounds/real_farm.png` | 3840×2160 | M40 | A rough, realistic-leaning (still cartoon) farm: muddy track, worn wooden gate with a BLANK sign board, tired fences, overcast sky. | Sign board blank — "REAL FARMING" is added by the engine. |
| 17 | `kit.bg_farm_storm` | `public/episodes/ep001_farming/kit/backgrounds/farm_storm.png` | 3840×2160 | M41 | Farm fields under a violent storm: dark clouds, rain streaks, lightning far away, flattened crops, puddles. |  |
| 18 | `kit.bg_workshop` | `public/episodes/ep001_farming/kit/backgrounds/workshop.png` | 3840×2160 | M42, M43 | Farm workshop/shed: workbench, tools on pegboard, oil stains, warm work light, open space centre for a broken tractor prop. |  |
| 19 | `kit.bg_riverbank` | `public/episodes/ep001_farming/kit/backgrounds/riverbank.png` | 3840×2160 | M42 | Field edge ending in a river/lake bank, splashable water across the lower half, bright day. |  |
| 20 | `kit.bg_crossroads` | `public/episodes/ep001_farming/kit/backgrounds/crossroads.png` | 3840×2160 | M44, M45 | Farm path splitting in two at golden hour: left path back toward a distant city, right path toward a big farm. A BLANK wooden two-arrow signpost stands in the middle. | Arrow boards blank — labels come from the engine. |

## Quest poses (20)

| # | Key | File | Size | Used in | Brief | Notes |
|---|---|---|---|---|---|---|
| 1 | `quest.worried_seated` | `public/characters/quest/quest_worried_seated.png` | 1500×2000 | M17, M20 | Seated (chair implied, not drawn), chin on fists, wide worried eyes looking screen-left at paperwork. |  |
| 2 | `quest.planning_tablet` | `public/characters/quest/quest_planning_tablet.png` | 1300×2000 | M22, M27 | Standing, holding a tablet, confident small smile, glancing to the viewer. |  |
| 3 | `quest.arms_up_back` | `public/characters/quest/quest_arms_up_back.png` | 1300×2000 | M21, M36 | Back view, both arms raised in victory, facing the field. |  |
| 4 | `quest.broom_bored` | `public/characters/quest/quest_broom_bored.png` | 1300×2000 | M25 | Sweeping with a broom, slumped, bored face. |  |
| 5 | `quest.vacuum` | `public/characters/quest/quest_vacuum.png` | 1500×2000 | M25 | Vacuuming, eyes closed, weirdly content. |  |
| 6 | `quest.pickaxe` | `public/characters/quest/quest_pickaxe.png` | 1500×2000 | M25, M16 | Swinging a pickaxe (blocky-game energy), big grin. |  |
| 7 | `quest.drive_calm` | `public/characters/quest/quest_drive_calm.png` | 1800×1600 | M26, M37 | Seated, front view, both hands on a steering wheel (wheel included), calm focus. | Swap trio — drive_calm / drive_stressed / drive_relaxed share the SAME canvas and wheel position. |
| 8 | `quest.drive_stressed` | `public/characters/quest/quest_drive_stressed.png` | 1800×1600 | M28 | Same seated pose, gripping the wheel, screaming, sweat drops. | Swap trio 2/3. |
| 9 | `quest.drive_relaxed` | `public/characters/quest/quest_drive_relaxed.png` | 1800×1600 | M37, M39 | Same seated pose, eyes closed, peaceful smile, loose hands. | Swap trio 3/3. |
| 10 | `quest.head_in_hands` | `public/characters/quest/quest_head_in_hands.png` | 1500×1700 | M28, M42 | Sitting on the floor, head in hands, defeated. |  |
| 11 | `quest.phone_overwhelmed` | `public/characters/quest/quest_phone_overwhelmed.png` | 1400×2000 | M38 | Holding a phone, shocked face lit by the screen, slight lean back. |  |
| 12 | `quest.holding_tray` | `public/characters/quest/quest_holding_tray.png` | 1600×2000 | M29, M43 | Holding a flat tray at chest height with both hands, gentle smile looking down at it. | Tray empty — the mini-farm diorama is a separate prop placed on it. |
| 13 | `quest.reading_manual` | `public/characters/quest/quest_reading_manual.png` | 1500×2000 | M32 | Holding a huge open manual, sweating, pretending to understand. |  |
| 14 | `quest.carrying_sacks` | `public/characters/quest/quest_carrying_sacks.png` | 1600×2000 | M40 | Straining under two heavy sacks on the shoulders, gritted teeth. | Sacks included. |
| 15 | `quest.rain_huddled` | `public/characters/quest/quest_rain_huddled.png` | 1600×1600 | M41 | Crouched, hugging himself, soaked hoodie, miserable. |  |
| 16 | `quest.wrench_fixing` | `public/characters/quest/quest_wrench_fixing.png` | 1500×2000 | M43 | Kneeling, tightening something with a wrench (wrench included), focused, small proud smile. |  |
| 17 | `quest.walking_back` | `public/characters/quest/quest_walking_back.png` | 1200×2000 | M36, M44 | Back view walking away into the scene, backpack on. |  |
| 18 | `quest.cap_off_sunset` | `public/characters/quest/quest_cap_off.png` | 1200×2000 | M45 | Standing 3/4 back view, farmer cap in hand, looking at the horizon. |  |
| 19 | `quest.sitting_back_turn` | `public/characters/quest/quest_sitting_back_turn.png` | 600×750 | M46 | SAME canvas as quest_sitting_back (hook); head turned over the shoulder toward the viewer, curious smile. | Must overlay quest_sitting_back exactly (swap for the CTA). |
| 20 | `quest.cheering_car` | `public/characters/quest/quest_supercar.png` | 2600×1500 | M16 | Quest in sunglasses driving a red sports car (car included), side-3/4 view, reckless grin. | GTA gag — car included in the cut-out. |

## Secondary cast (2)

| # | Key | File | Size | Used in | Brief | Notes |
|---|---|---|---|---|---|---|
| 1 | `npc.banker` | `public/characters/npc/banker.png` | 1300×2000 | M17 | Stern banker in a dark suit and glasses holding a document (document included, text lines illegible). |  |
| 2 | `progress.presenting` | `public/characters/progress/progress_presenting.png` | 900×1100 | M27, M29, M43 | Progress robot pointing to screen-right like a presenter, cheerful. |  |

## Props & machines (28)

| # | Key | File | Size | Used in | Brief | Notes |
|---|---|---|---|---|---|---|
| 1 | `kit.tractor_small` | `public/episodes/ep001_farming/kit/objects/tractor_small.png` | 1200×900 | M21, M32, M35 | Tiny cheap old green tractor, side view facing left. |  |
| 2 | `kit.seeder` | `public/episodes/ep001_farming/kit/objects/seeder.png` | 2400×1000 | M21, M32, M44 | Tractor pulling a seeder implement, side view facing left. |  |
| 3 | `kit.sprayer` | `public/episodes/ep001_farming/kit/objects/sprayer.png` | 2600×1000 | M21, M32 | Tractor with wide spray booms, mist, side view facing left. |  |
| 4 | `kit.combine` | `public/episodes/ep001_farming/kit/objects/combine.png` | 2400×1500 | M21, M24, M32, M44 | Green combine harvester with header, side view facing left. |  |
| 5 | `kit.grain_truck` | `public/episodes/ep001_farming/kit/objects/grain_truck.png` | 2800×1200 | M21, M26 | Blue semi-truck with a grain trailer, side view facing left. |  |
| 6 | `kit.factory_harvester` | `public/episodes/ep001_farming/kit/objects/factory_harvester.png` | 2600×2200 | M32 | Absurdly huge harvester that looks like a moving factory/building, front-3/4 view. |  |
| 7 | `kit.header_3m` | `public/episodes/ep001_farming/kit/objects/header_3m.png` | 1200×500 | M33 | Small 3 m harvester header, side view. | Width series 1/3 — same style/perspective. |
| 8 | `kit.header_6m` | `public/episodes/ep001_farming/kit/objects/header_6m.png` | 2400×600 | M33 | 6 m header, same view. | Width series 2/3. |
| 9 | `kit.header_12m` | `public/episodes/ep001_farming/kit/objects/header_12m.png` | 4200×700 | M33 | Enormous 12 m header, same view. | Width series 3/3. |
| 10 | `kit.manual_book` | `public/episodes/ep001_farming/kit/objects/manual_book.png` | 1200×1000 | M32 | Gigantic tractor user manual with sticky notes, closed. |  |
| 11 | `kit.printer_avalanche` | `public/episodes/ep001_farming/kit/objects/printer_avalanche.png` | 1600×1800 | M20 | Office printer spitting an avalanche of paper. |  |
| 12 | `kit.calendar_friday` | `public/episodes/ep001_farming/kit/objects/calendar_friday.png` | 800×900 | M20 | Wall calendar page with a smiley face (NO printed word). |  |
| 13 | `kit.router` | `public/episodes/ep001_farming/kit/objects/router.png` | 900×600 | M28 | Home wi-fi router, one red blinking light. |  |
| 14 | `kit.mini_farm` | `public/episodes/ep001_farming/kit/objects/mini_farm_diorama.png` | 1400×900 | M29, M43 | Tabletop miniature farm diorama: tiny fields, barn, tractor. | Sits on quest.holding_tray or a table. |
| 15 | `kit.domino_row` | `public/episodes/ep001_farming/kit/objects/domino_row.png` | 2600×900 | M30 | Row of cards/dominoes showing seed → sprout → tractor → coins icons (no words). |  |
| 16 | `kit.cow` | `public/episodes/ep001_farming/kit/objects/cow.png` | 1400×1000 | M35, M41 | Friendly cartoon cow, side view. |  |
| 17 | `kit.chickens` | `public/episodes/ep001_farming/kit/objects/chickens.png` | 1200×700 | M35 | Group of three chickens pecking. |  |
| 18 | `kit.pig` | `public/episodes/ep001_farming/kit/objects/pig.png` | 1000×700 | M35 | Happy pig, side view. |  |
| 19 | `kit.farm_sign_blank` | `public/episodes/ep001_farming/kit/objects/farm_sign_blank.png` | 1400×1200 | M34 | Wooden farm entrance sign on two posts, BLANK board. | "QUEST FARM" text added by the engine. |
| 20 | `kit.machine_clutter` | `public/episodes/ep001_farming/kit/objects/machine_clutter.png` | 3000×1200 | M36 | Messy pile of parked machines and implements at odd angles. |  |
| 21 | `kit.tractor_topdown` | `public/episodes/ep001_farming/kit/objects/tractor_topdown.png` | 700×1100 | M37 | Green tractor seen straight from above, driving up the frame. |  |
| 22 | `kit.sacks_pile` | `public/episodes/ep001_farming/kit/objects/sacks_pile.png` | 1400×900 | M40 | Pile of heavy fertilizer/feed sacks (no printed text). |  |
| 23 | `kit.broken_tractor` | `public/episodes/ep001_farming/kit/objects/broken_tractor.png` | 2200×1600 | M42, M43 | Green tractor with open hood, smoke puff, a wheel off. |  |
| 24 | `kit.harvester_water` | `public/episodes/ep001_farming/kit/objects/harvester_water.png` | 2600×1500 | M42 | Yellow harvester tipped into water with a big splash. |  |
| 25 | `kit.seedling` | `public/episodes/ep001_farming/kit/objects/seedling.png` | 700×900 | M43, M44 | Single sprout in soil, close-up, glowing morning light. |  |
| 26 | `kit.signpost` | `public/episodes/ep001_farming/kit/objects/signpost_blank.png` | 1000×1600 | M44 | Two-arrow wooden signpost, BLANK arrows. | Labels come from the engine. |
| 27 | `kit.laundry_basket` | `public/episodes/ep001_farming/kit/objects/laundry_basket.png` | 900×700 | M25, M26 | Overflowing laundry basket. |  |
| 28 | `kit.toolbox` | `public/episodes/ep001_farming/kit/objects/toolbox.png` | 900×600 | M43 | Red toolbox, open. |  |

## Aparte del arte (no son imágenes)

- **Música con licencia:** 2–3 temas.
  - Una base principal en bucle (~2–3 min, loopable).
  - Un tema cálido para el atardecer/cierre (~60 s).
  - Opcional: un stinger corto de marca (~3 s).
- **Logo oficial de SecondQuest:** PNG transparente, ≥1600 px de ancho.
