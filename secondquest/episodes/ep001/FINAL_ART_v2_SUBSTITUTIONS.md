# EP001 hook FINAL_ART_v2 — asset resolution

Source of truth: SecondQuest Master Asset Library v1 (`scene_map.json` → `asset_map.json`).
Every key was resolved scene → key → mapped file. A mapped file was used as-is whenever it depicts its key.

- **LIBRARY**: the mapped library file, used directly.
- **REMAP**: the mapped file depicts something else; a different library file that depicts this key was used.
- **V1_FALLBACK**: no library file depicts this key; the verified FINAL_ART_v1 cut-out from the approved 2D sheets was used.
- **NEW_LAYER**: an extra prop layer from the approved Additional_2D_Assets sheet (s13 chore props).
- **MISSING**: no art for this key exists in any delivered package; the layer is omitted.

| Key | Decision | Library status | File used | Reason |
|---|---|---|---|---|
| fear.peeking | LIBRARY | READY | library:engine_ready/public/characters/fear/fear_peeking.png |  |
| grind.wheel | LIBRARY | READY_VARIATION | library:engine_ready/public/characters/grind/grind_wheel.png |  |
| progress.cheering | LIBRARY | READY | library:engine_ready/public/characters/progress/progress_cheering.png |  |
| wallet.happy | LIBRARY | READY | library:engine_ready/public/characters/wallet/wallet_happy.png |  |
| wallet.worried | LIBRARY | READY | library:engine_ready/public/characters/wallet/wallet_worried.png |  |
| wallet.fainted | LIBRARY | READY | library:engine_ready/public/characters/wallet/wallet_fainted.png |  |
| quest.desk_typing | LIBRARY | READY_VARIATION | library:engine_ready/public/characters/quest/quest_desk_typing.png |  |
| quest.holding_paycheck | LIBRARY | READY_VARIATION | library:engine_ready/public/characters/quest/quest_holding_paycheck.png |  |
| quest.exhausted_slumped | LIBRARY | RECOVERED_VARIATION | library:engine_ready/public/characters/quest/quest_exhausted_slumped.png |  |
| ep001.dragon | LIBRARY | READY | library:engine_ready/public/episodes/ep001_farming/objects/dragon.png |  |
| ep001.tractor_huge | LIBRARY | READY | library:engine_ready/public/episodes/ep001_farming/objects/tractor_huge.png |  |
| ep001.tractor_bigger | LIBRARY | READY_VARIATION | library:engine_ready/public/episodes/ep001_farming/objects/tractor_bigger.png |  |
| ep001.bg_farm_panorama | LIBRARY | RECOVERED | library(upscaled):up_up_farm_panorama.png | library file, upscaled x2 (ESRGAN) for the 2.2x chore zoom |
| ep001.bg_office | REMAP | RECOVERED | library(upscaled):up_up_living_room_evening.png | mapped office.png depicts a bedroom; the office illustration is the file mapped to ep001.bg_living_room |
| ep001.bg_living_room | REMAP | RECOVERED | library(upscaled):up_up_farm_ingame_day.png | mapped living_room_evening.png depicts an office; the home gaming room is the file mapped to ep001.bg_farm_ingame |
| ep001.bg_fantasy | REMAP | RECOVERED | library(upscaled):up_up_field_enormous.png | mapped fantasy_crag.png depicts a lantern stairway; the lava crag is the file mapped to ep001.bg_field_huge |
| ep001.bg_action | REMAP | RECOVERED | library(upscaled):up_up_storm_sky.png | mapped action_street.png depicts a mountain stairway; the city street is the file mapped to ep001.bg_storm |
| ep001.bg_bedroom | V1_FALLBACK | READY | v1:episodes/ep001_farming/backgrounds/bedroom_dawn.png | mapped bedroom_dawn.png contains its own bed (double-bed problem flagged in v1 review); v1 bedroom with the bed painted out |
| quest.bed_sleeping | V1_FALLBACK | READY | v1:characters/quest/quest_bed_sleeping.png | library bed_sleeping is fine, but its pair bed_awake is a mis-crop; the swap needs a pixel-aligned pair |
| quest.bed_awake | V1_FALLBACK | RECOVERED | v1:characters/quest/quest_bed_awake.png | library file is a mis-crop (face fragment) |
| ep001.alarm_clock | V1_FALLBACK | RECOVERED | v1:episodes/ep001_farming/objects/alarm_clock.png | library file is a sheet-header crop (text), not a clock |
| ep001.email_icon | V1_FALLBACK | RECOVERED | v1:episodes/ep001_farming/objects/email_icon.png | library file is a sheet-header crop (text) |
| ep001.paper_stack | V1_FALLBACK | RECOVERED | v1:episodes/ep001_farming/objects/paper_stack.png | library file is a sheet-header crop (text) |
| quest.looking_up_awe | V1_FALLBACK | RECOVERED | v1:characters/quest/quest_looking_up_awe.png | library file is a mis-crop (face fragment) |
| quest.farmer_gaming | V1_FALLBACK | RECOVERED | v1:characters/quest/quest_farmer_gaming.png | library file is a mis-crop (arms up, cut at edges, no gamepad) |
| quest.tractor_side | V1_FALLBACK | RECOVERED | v1:characters/quest/quest_tractor_side.png | library file is a mis-crop (Quest torso, no tractor) |
| quest.action_hero | V1_FALLBACK | RECOVERED | v1:characters/quest/quest_action_hero.png | library file is a mis-crop (legs only) |
| quest.knight | V1_FALLBACK | RECOVERED | v1:characters/quest/quest_knight.png | library file is a mis-crop (legs only) |
| quest.tractor_heroic | V1_FALLBACK | RECOVERED_VARIATION | v1:characters/quest/quest_tractor_heroic.png | library file is a mis-crop (Quest torso, no tractor) |
| quest.excited | V1_FALLBACK | RECOVERED | v1:characters/quest/quest_excited.png | library file is a mis-crop (wallet/progress fragment) |
| quest.farmer_planting | V1_FALLBACK | RECOVERED | v1:characters/quest/quest_farmer_planting.png | library file and its alternate are mis-crops (wallet fragment / props collage) |
| quest.farmer_fertilizer | V1_FALLBACK | RECOVERED | v1:characters/quest/quest_farmer_fertilizer.png | library file is a props-board crop (toolboxes), no Quest |
| quest.farmer_feeding | V1_FALLBACK | RECOVERED | v1:characters/quest/quest_farmer_feeding.png | library file is a sheet-header crop (text) |
| quest.sitting_back | V1_FALLBACK | RECOVERED | v1:characters/quest/quest_sitting_back.png | library file is a mis-crop (a table) |
| ep001.window_lit | V1_FALLBACK | RECOVERED | v1:episodes/ep001_farming/objects/window_lit.png | library file is a background strip (no window) |
| brand.wordmark | V1_FALLBACK | TEMP_BRAND_ASSET | v1:shared/brand/secondquest_wordmark.png | library file is TEMP_BRAND_ASSET plain text; v1 is the official logo keyed from the Quest Visual Bible |
| ep001.bg_dealership | V1_FALLBACK | RECOVERED | v1:episodes/ep001_farming/backgrounds/tractor_dealership.png | mapped file depicts a cabin signpost; no dealership plate in the library |
| ep001.bg_farm_ingame | V1_FALLBACK | RECOVERED | v1:episodes/ep001_farming/backgrounds/farm_ingame_day.png | mapped file depicts a gaming room (used for bg_living_room) |
| ep001.bg_castle | V1_FALLBACK | RECOVERED | v1:episodes/ep001_farming/backgrounds/castle_tower.png | mapped castle file has five baked-in characters incl. a second Quest in front of the castle |
| ep001.bg_storm | V1_FALLBACK | RECOVERED_VARIATION | v1:episodes/ep001_farming/backgrounds/storm_sky.png | mapped file depicts a sunny city street (used for bg_action) |
| ep001.bg_field_huge | V1_FALLBACK | RECOVERED | v1:episodes/ep001_farming/backgrounds/field_enormous.png | mapped file depicts a lava crag (used for bg_fantasy) |
| ep001.bg_city_evening | V1_FALLBACK | RECOVERED | v1:episodes/ep001_farming/backgrounds/apartments_evening.png | mapped file depicts a desk interior |
| ep001.bg_sunset_sky | V1_FALLBACK | RECOVERED | v1:episodes/ep001_farming/backgrounds/sunset_sky.png | library sky/midground/fence come from different sunset images and do not register; v1 layers are split from one image |
| ep001.mg_sunset_farm | V1_FALLBACK | REFERENCE_LAYER | v1:episodes/ep001_farming/backgrounds/sunset_farm_midground.png | library midground is opaque (REFERENCE_LAYER) and from a different image than the sky |
| ep001.fg_fence | V1_FALLBACK | RECOVERED_LAYER | v1:episodes/ep001_farming/backgrounds/fg_fence.png | must register with the v1 sunset layers and seated Quest |
| ep001.princess_tower | MISSING |  | — | library file is a mis-crop (legs); alternate princess_correction.png is a background collage; no princess exists in any delivered sheet |
| ep001.trailer_cargo | NEW_LAYER |  | v1:objects/trailer_cargo.png | s13 fertilizer transport prop, from Additional_2D_Assets sheet (REMOLQUE) |
| ep001.hay_roll | NEW_LAYER |  | v1:objects/hay_roll.png | s13 animal-feed prop, from Additional_2D_Assets sheet (ROLLO HENO) |
