# EP001 hook — final art mapping (FINAL_ART_v1)

Source package: `SecondQuest_EP001_Hook_Art_Package_FOR_CLAUDE.zip` (approved 2D sheets + official references).
Every file below was cut from those sheets. Nothing was redrawn; no 3D art was used.

Processing: sheet crop → transparency cleanup (alpha from the sheet, or background keyed / traced) →
upscale with Real-ESRGAN x4plus-anime (local, CPU). Backgrounds were cropped to 16:9; thumbnail-sized
sources got two x4 passes.

**Part1** = `SecondQuest_EP001_Approved_Assets_Part1.zip` (approved individual assets, used as-is, only trimmed).

Sheet abbreviations: **QP** Quest_Poses · **CO** Characters_Objects · **HE** Hook_Environments ·
**AD** Additional_2D_Assets · **OR** Organized_2D_Art · **PM** Props_Machinery · **QVB** Quest_Visual_Bible (official reference).

Status: **EXACT** means the element matches the manifest brief. **SUBST** means the closest approved art
was used because the sheets do not contain the brief's exact drawing. **MISSING** means there is no source
art; the layer was removed.

| Key | Status | Source | Note |
|---|---|---|---|
| quest.bed_sleeping | EXACT | QP r1c1 (mirrored) | Swap pair shares its canvas with bed_awake (pixel-aligned). |
| quest.bed_awake | EXACT | QP r1c2 + bed foot from r1c1 | The nightstand and clock were removed from the cut-out; the alarm is its own layer. |
| quest.desk_typing | EXACT | QP r2c4 (desk + chair + laptop) | Laptop instead of a monitor. |
| quest.holding_paycheck | EXACT | **Part1** quest_money_celebration | Paycheck + cash (replaces the QP r1c4 cut-out). |
| quest.looking_up_awe | EXACT | QP r2c1 (Quest separated from the tractor) | |
| quest.exhausted_slumped | SUBST | **Part1** quest_exhausted_desk | Exhausted at a desk (no couch). Swap pair shares its canvas with farmer_gaming. |
| quest.farmer_gaming | SUBST | **Part1** quest_excited_gamer | Gamepad, eyes bright; no farmer cap. |
| quest.tractor_side | SUBST | CO green tractor (mirrored) | No "Quest driving" drawing; driver not visible. |
| quest.tractor_heroic | SUBST | **Part1** tractor_heroic | Approved heroic low-angle tractor, grille dominant; Quest not visible in the cab. |
| quest.action_hero | SUBST | QVB outfit "Soldier" | Official outfit variant; no blaster. |
| quest.knight | SUBST | QVB outfit "RPG" | Official outfit variant (sword + cape). |
| quest.farmer_planting | EXACT | QP r3c1 (digging) | |
| quest.farmer_fertilizer | SUBST | QP r2c3 (pitchfork farmer) | No wheelbarrow drawing. |
| quest.farmer_feeding | SUBST | QVB outfit "Farmer" | No chickens/bucket drawing. |
| quest.excited | EXACT | OR Q03_Emocionado | Red hoodie, not a farmer cap. |
| quest.sitting_back | EXACT | HE panel 6 (separated from the plate) | |
| wallet.happy / wallet.worried | EXACT | CO r1c1 / r1c2 | Swap pair shares its canvas. |
| wallet.fainted | EXACT | **Part1** wallet_exhausted | |
| progress.cheering | EXACT | **Part1** progress_triumphant | |
| grind.wheel | EXACT | **Part1** grind_hamster_wheel | Wheel with stand and hamster; `spin` became `wobble` (full rotation would turn the stand upside down). |
| fear.peeking | EXACT | **Part1** fear_shadow | |
| brand.wordmark | EXACT | QVB header logo (keyed) | |
| ep001.alarm_clock | EXACT | HE panel 1 (cut from the plate) | Face shows ~11:00. |
| ep001.email_icon | EXACT | CO paper pile (envelope + badge cut out) | |
| ep001.paper_stack | EXACT | CO paper pile | |
| ep001.tractor_huge | EXACT | CO green tractor | |
| ep001.tractor_bigger | SUBST | PM main tractor (yellow) | Same 2D style, larger wheels; not green, no bow. |
| ep001.dragon | SUBST (stand-in) | CO large Fear | **No dragon art in the package.** Drop `objects/dragon.png` in to replace it. |
| ep001.princess_tower | MISSING | — | No princess art. The s09 layer was removed (the joke "No princess to save" still reads). |
| ep001.window_lit | SUBST | HE panel 3 (Quest gaming at night) framed as a window | Brief asked for a silhouette at a window. |
| ep001.bg_bedroom | EXACT | AD "Habitación (noche)" | Thumbnail source (x16). |
| ep001.bg_office | EXACT | HE panel 2, right part | Left part contains a baked-in Quest; crop avoids it. |
| ep001.bg_dealership | SUBST | AD "Granja (entrada)" | No dealership plate. |
| ep001.bg_living_room | SUBST | HE panel 3, right part (gaming desk, farm game on screen) | Night room, not a living room with TV. |
| ep001.bg_farm_ingame | EXACT | HE panel 4 | |
| ep001.bg_farm_panorama | SUBST | HE panel 4 (other crop) | No wide barn/shed/pen panorama. |
| ep001.bg_field_huge | EXACT | HE panel 5 | The baked tiny tractor was inpainted; the engine's tractor layer replaces it. |
| ep001.bg_fantasy | SUBST | OR F09 (mountain stairs) + V3 lava glow | No fantasy crag. |
| ep001.bg_action | SUBST | OR F05 (sunset road) + V3 explosion glow | No action street. |
| ep001.bg_castle | SUBST | PM header (castle on hill) | No tower-window close-up. |
| ep001.bg_storm | SUBST | AD "Camino (transición)" sky + V3 storm grade | No storm plate. |
| ep001.bg_city_evening | SUBST | OR F07 city skyline at dusk | Not a flat apartment facade. |
| ep001.bg_sunset_sky | EXACT | HE panel 6, far layer (inpainted behind the midground) | |
| ep001.mg_sunset_farm | EXACT | HE panel 6, midground layer | |
| ep001.fg_fence | EXACT | HE panel 6, fence layer | |

## Layout changes (scenes.json)

Only position, scale, anchor and visual layers were changed. Timings, cues, cuts, transitions, camera moves, swaps,
SFX, music, ducking, mastering and voice are identical to V3.

- s06: the Grind `spin` became `wobble` (same start time).
- s09: the princess layer was removed (MISSING).
- s15: the midground, Quest and fence layers are aligned to the sunset plate at mid-shot, so the V3 parallax
  (0.45) moves them around the original composition.

## Part1 assets not used

- `quest_sleeping.png`: its bed differs from `quest_bed_awake`, so the s01 swap would not overlay. The pixel-aligned sheet pair was kept.
- `wallet_stressed.png`: its proportions differ from `wallet_happy`, so the s04 swap would not overlay. The aligned sheet pair was kept.
