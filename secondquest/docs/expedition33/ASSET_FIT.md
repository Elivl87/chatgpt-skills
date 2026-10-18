# Expedition 33 · Asset fit (2026-10-18)

`npm run assets:find -- --needs docs/expedition33/asset_needs.json` (22 needs; sheets in `docs/asset_fit/<id>.jpg`),
plus a hand check of the uncatalogued libraries (Quest library v2, Pixie, EP003 props3d). Each candidate judged against
the beat (era, time of day, mood), not its first look.

**Result:** the library is modern-life + farming/war/fantasy-generic. It covers the **real-life (HUD off) beats**; it
covers **nothing of the Belle Époque painted world** (harbor, Lumière, the Monolith, camp, cliff, opera, manor). Those
are NEW_ART or our 3D/code.

| Need | Verdict | Asset / reason |
|---|---|---|
| U Quest the player (¶07, ¶86, CTA) | **REUSE** | `core.bg.living_room_night_gaming` + `core/quest/gaming_excited`, `head_in_hands`, `looking_up_awe` |
| T Morning after (¶82–87) | **REUSE** | `core.bg.quest_bedroom_morning` (window light, after the credits) + `core/quest/bed_awake`; alt `core.bg.home_living_day` |
| R Room not cleared out (¶51) | **RECOMPOSE** | `core.bg.home_living_night` (lamp, quiet); add closed boxes/coat in code. Bedroom morning is too bright for the line |
| S Two doors (¶65–72) | **RECOMPOSE** | `ep001.bg_fantasy_doors`: 3 doors; crop/mask to two (warm = Maelle's, cold = Verso's). `ep001.bg_crossroads` rejected (farm, sunny, wrong era) |
| B Monolith sky (¶02, ¶15, ¶55) | **RECOMPOSE** | `core.bg.sunset_sky` as the sky plate; the Monolith + sea in props3d. `storm_low_horizon` only for the Gommage (¶45) |
| G Companion (Esquie redraw) | **BUILD 3D** | props3d, 0 credits; expression set (COMPANION.md) |
| L Rock · I Journal · V Trophies · E Ship (prop) | **BUILD 3D/CODE** | props3d / ui code, 0 credits |
| C Petals (Gommage) | **CODE** | particle overlay over cut-outs |
| A Harbor · D Lumière street · F Landing/meadow · H Camp night · J Cliff · K Funeral/grave · M Opera house (full/empty) · N Monolith climb · O Painter's studio + canvas · P Manor fire · Q Dessendre family + Gustave/Sophie/Maelle/Lune/Verso/old man | **NEW_ART** | nothing fits the era/world (castle_rescue/dragon_crag are generic fairy-tale, wrong palette). Quoted in the shot plan |
| Quest in costume (expedition coat) | **NEW_ART** | costume keeps identity (CLAUDE.md); library v2 poses are modern clothes |

Faithful game art is NOT used (the rights request is not being made: Producer decision 2026-10-18), so every
painted-world item is our own design, redrawn from `GAME_VISUAL_REFERENCE.md`.
