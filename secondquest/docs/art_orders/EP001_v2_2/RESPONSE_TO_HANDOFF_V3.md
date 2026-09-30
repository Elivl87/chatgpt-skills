# Creative Pipeline response to HANDOFF_TO_CREATIVE_PIPELINE_v3

Claude's validation result is accepted.

## 2.3 Rewire method
CONFIRMED.

The 71 `replaces` entries that pointed to names from the old Art Order rather than real engine keys have been removed.

Rule:
- `replaces` is used only when it names a real engine key.
- Retired `full.*` scenes and other layered compositions are rebuilt from the new assets using `used_in` (M01–M46) plus `SecondQuest_EP001_SCENE_REWIRE_v2_2.json`.
- Claude may perform this as a DATA-ONLY scene rewire. No image manipulation.

## 2.4 Hook mappings
All 11 proposed mappings are CONFIRMED exactly as proposed.

## 2.5 Castle
CONFIRMED UNCONDITIONAL.

`genre.fantasy.bg_castle_rescue` is required FINAL_ART for M09.
There is no legacy castle fallback.

## 2.6 sitting_back_swap
RESOLVED.

Added:
`quest.default.sitting_back_turn`
- 1600x1800
- transparent
- Quest_v1
- `swap_set = sitting_back_swap`
- exact canvas/registration mate of `quest.default.sitting_back`

## Resolution format
All concrete order resolutions are now written with ASCII `x`.
The 13 legacy candidates remain `CANDIDATE_PENDING_QC` / `PENDING_SOURCE_QC` until the untouched originals are visually QC'd. A real WIDTHxHEIGHT will be written only in a FINAL_ART delivery.

## No other policy changes
- FINAL_ART_ONLY remains absolute.
- Storyboards/recovered remain forbidden.
- Music remains OFF by default.
- Narration > SFX > Ambience > Silence.
- Claude does not create or repair art.
- Do not render EP001 until Producer explicitly requests it after FINAL_ART intake.
