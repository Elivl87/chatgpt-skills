# SecondQuest EP001 — Full Integration Report v1 (FULL PREVIEW)

Episode: **Why Do Millions of People Play a Game About Farming?**
Output: `secondquest_ep001_FULL_PREVIEW_v1.mp4`, English, 1920×1080 @ 30 fps. This is a preview, not the final master.

## NARRATION
- Source: `SecondQuest_EP001_Narration_Master_EN_v2` (`narration_master_en_v2.txt` / `.json`). Both files were read; their 12 sections match verbatim.
- Master v2 was used without rewriting. The script (`episodes/ep001full/script.json`) has 244 lines, one per text line of the master, 1,331 words. The joined script equals the master text (whitespace-normalised check: **identical**). ACT 1 equals the approved hook lines l01–l19 verbatim.
- Voice: Kokoro local, **am_michael**, speed **1.00**, en-us (SecondQuest English Voice v1). No overrides.
- Real duration:
  - generated speech **8:20.07** (500.1 s);
  - narration track **10:12.17** (612.2 s), including pauses.
- Pauses:
  - Master line breaks = short breath (0.15 s); blank lines = paragraph pause (0.45 s); act breaks = 1.0 s. A few punchline set-ups are held longer (0.5–0.7 s).
  - The voice was not sped up or stretched.
  - The ~9:32 target cannot be reached at speed 1.00: the speech alone is 8:20.07, so real pacing gives ~10:12.
- Hook (0:00–0:45.5): narration audio is bit-identical to the approved hook, and every l01–l19 cue matches (Kokoro is deterministic).

| Act | Lines | Starts | Ends |
|---|---|---|---|
| ACT 1 — HOOK | l01–l19 | 0:00.30 | 0:44.23 |
| ACT 2 — A VERY STRANGE FANTASY | l20–l34 | 0:46.08 | 1:29.48 |
| ACT 3 — EVERYTHING HAS A PURPOSE | l35–l62 | 1:30.48 | 2:22.61 |
| ACT 4 — THE LOOP | l63–l83 | 2:23.61 | 3:13.60 |
| ACT 5 — CHORES ARE FUN | l84–l103 | 3:14.60 | 4:18.38 |
| ACT 6 — CONTROL | l104–l126 | 4:19.27 | 5:18.91 |
| ACT 7 — THE MACHINES | l127–l147 | 5:19.81 | 6:19.56 |
| ACT 8 — THE FARM BECOMES YOURS | l148–l165 | 6:20.56 | 7:00.64 |
| ACT 9 — WHY SLOW CAN FEEL GOOD | l166–l191 | 7:01.64 | 8:00.62 |
| ACT 10 — WHY NOT FARM FOR REAL? | l192–l210 | 8:01.62 | 8:47.71 |
| ACT 11 — THE REAL REASON | l211–l240 | 8:48.71 | 10:03.17 |
| M46 — VIEWER INTERACTION / NEXT QUEST | l241–l244 | 10:04.37 | 10:12.17 |

## COMPLETED
- **M01–M15:** the approved hook `secondquest_ep001_hook_FINAL_ART_v2` config (scenes s01–s15), reused verbatim (same assets, timing, cuts, SFX, music).
- **M16–M46:** built from `SecondQuest_EP001_Full_Production_Map_v1_1.json` in map order, acts ACT 2 → ACT 11 + M46. Each master is split into shots with hard cuts, pushes, pans, pull-outs, punches, swaps, prop entrances, parallax and programmatic UI.
- Shots per master: M16 (4), M17 (4), M18 (1), M19 (3), M20 (4), M21 (16), M22 (1), M23 (7), M24 (7), M25 (4), M26 (4), M27 (4), M28 (6), M29 (3), M30 (4), M31 (3), M32 (8), M33 (6), M34 (4), M35 (5), M36 (2), M37 (8), M38 (3), M39 (3), M40 (3), M41 (4), M42 (4), M43 (7), M44 (5), M45 (7), M46 (1).
- In total there are 160 scenes: 15 hook + 145 new shots. All are anchored to narration cues, so the timings derive from the generated audio.
- **M46:** the approved ending patch v2 CTA, verbatim. It keeps the warm sunset, seated Quest, fence parallax and SecondQuest wordmark, plus a clean programmatic comment card:
  - "What game deserves a “why?” next?";
  - an "Add a comment… your next Why?" input bar;
  - a NEXT QUEST ? marker.

  No "like and subscribe".
- **Engine V3:** not modified. `ep001` (hook + ES locale) is untouched: `git diff` on `episodes/ep001` is empty. The full episode is a separate data-only entry, `episodes/ep001full`, registered in `src/episodes/index.ts`, the same registration `npm run new:episode` performs. This was needed because extending ep001's master script would require a mirrored Spanish script (the validator enforces it), and Spanish was out of scope.

## ASSET COVERAGE
- The Production Map v1.1 references **114** unique asset keys:
  - 88 resolved and used as mapped;
  - 18 used via a reported substitution;
  - 7 built programmatically;
  - **1 unresolved** (`ep001.princess_tower`).
- `asset_map_full.json` has 111 keys. Three v1.1 keys are absent from it (`brand.secondquest_wordmark`, `full.cta_comment_bubble`, `full.cta_why_prompt`); they are handled as a substitution and as programmatic UI.
- **Hook keys** (`quest.*`, `wallet.*`, `ep001.*`, …): resolved to the approved FINAL_ART_v2 files. The Full Library's `engine_ready/` hook files are the same Master Library v1 files audited in v2, many of them mis-crops.
- **RECOVERED_PANEL:**
  - Each panel was cleaned: storyboard headers, timecodes, caption bars and collage borders were removed by automatic crop, checked visually, with manual crops for router, green elephant, slow cab, relaxed cab and real-vs-sim.
  - Each was then upscaled locally (Real-ESRGAN anime x4 + x2).
  - They are used as full-frame 16:9 compositions or, when the clean area is small or square, as framed cards over a blurred backdrop of the same art.
- Additional recovered panels in the library that no key maps to were used where they match the narration exactly:
  - fantasy_022 (cultivate/plant/grow) and fantasy_024 (empty/full field);
  - cycle_008/009/010;
  - purpose_030/032/033/036 (START SMALL / WORK→EARN / IMPROVE / REPEAT);
  - chores_043/044/045; machines_075/076/077; rural_089/091/098; ending_115.

## SUBSTITUTIONS
| Asset key | Library status | Used instead | Reason |
|---|---|---|---|
| `full.field_empty` | RECOVERED_PANEL | full.field_empty (fantasy_024 left) | mapped purpose_034 depicts a tractor catalog; EMPTY FIELD half of recovered panel fantasy_024 used |
| `full.field_full` | RECOVERED_PANEL | full.field_full (fantasy_024 right) | mapped purpose_035 depicts the EXPAND aerial (used for M23/M35); FULL FIELD half of fantasy_024 used |
| `full.crop_states` | RECOVERED_PANEL | full.cultivate / plant_strip / grow_strip | mapped file is the loop-sunset panel (no crop states); crop states taken from unmapped recovered panel fantasy_022 (CULTIVATE/PLANT/GROW) |
| `full.machine_tractor` | RECOVERED_PANEL | quest.tractor_side (small, "TINY") | mapped component crop is a 56×108 tyre fragment |
| `full.machine_seeder` | RECOVERED_PANEL | full.plant (cycle_003 seeder) | mapped component crop is a text/border fragment |
| `full.machine_sprayer` | RECOVERED_PANEL | full.care (cycle_004 sprayer) | mapped component crop is a text/border fragment |
| `full.machine_combine` | RECOVERED_PANEL | full.harvest (cycle_005 combine) | mapped component crop is 112×145 fragment |
| `full.width_progression` | RECOVERED_PANEL | full.bigger_header (machines_081) | mapped machines_080 crop is the manual panel; header-size panel 081 used |
| `full.farm_animals` | RECOVERED_PANEL | ep001.bg_farm_panorama + quest.farmer_feeding + hay_roll | mapped machines_084 image area is a cropped-off fragment (caption only) |
| `full.farm_buildings` | RECOVERED_PANEL | ep001.bg_farm_panorama | mapped machines_083 shows a tractor field (used as bg_farm_aerial) |
| `full.production_chain` | RECOVERED_PANEL | programmatic WHEAT → MILL → FLOUR → BAKERY chain | mapped machines_085 is the notification-cloud panel |
| `full.messy_machine_yard` | RECOVERED_PANEL | full.sunset_quest | mapped machines_086 is the tractor-cab panel; no machine-yard art recovered |
| `full.seedling_closeup` | RECOVERED_PANEL | full.sunset_quest / progress.cheering + progress bar | mapped ending_109 contains only a small sunset crop; no seedling close-up recovered |
| `full.quest_fixing_machine` | RECOVERED_PANEL | full.broken + programmatic FIXED ✓ | mapped ending_110 image area is a barn fragment |
| `full.wrench` | RECOVERED_PANEL | full.broken (wrench visible in panel) | mapped ending_110 is not a wrench |
| `full.bg_farm_complete` | RECOVERED_PANEL | full.loop_sunset / hook sunset layers | mapped ending_111 is a 94×102 silo fragment |
| `full.choice_signpost` | RECOVERED_PANEL | full.goals_list + programmatic "WHAT DO YOU WANT TO BUILD?" | mapped ending_112 is a 139×102 sunset fragment; no signpost recovered |
| `brand.secondquest_wordmark` | — | brand.wordmark | key not in asset_map_full; official wordmark key used |
| `ep001.princess_tower` (M09) | RECOVERED | — (layer omitted) | library file is a leg crop and `alternates/princess_correction.png` is a background collage; no princess art exists in any delivered package (same as FINAL_ART_v2) |

## PROGRAMMATIC ELEMENTS (built in Remotion, no raster UI)
| Key / element | Built as |
|---|---|
| `full.loan_agreement` | LOAN APPROVED price tag + debt counter |
| `full.products_sold_ui` | bank counter $12,400 → $48,900 + money particles |
| `full.progress_72_ui` | progress bar 0 → 72 % (M26/M27) |
| `full.price_chart_down` | price/ton counter 260 → 148 over recovered prices panel (rural_098) |
| `full.load_save_ui` | LOAD SAVE button + load-game menu |
| `full.cta_comment_bubble` | comment card + input bar (M46) |
| `full.cta_why_prompt` | "What game deserves a “why?” next?" + NEXT QUEST marker |
| (extra) | MON–THU day chips; meeting/problem stack; unread counter 203 → 348; "Progress 3 %" stuck bar; bank counter; FASTER / TINY / HUGE / PLANTING / SPRAYING / CUTTING / START SMALL markers; "3 things change" checklist; "11:00 PM" chip; $780,000 / $650,000 price tags; "$ / HOUR?"; TRAFFIC / MEETING MOVED / NO INTERNET chips; simulation checklist; WEATHER / ECONOMICS / MACHINERY / TERRIBLE DECISIONS chips; CONTROL marker; "+ BETTER TOOLS"; LEVEL UP pop-up; "+12 M WIDER"; QUEST FARM sign; production chain; debt balance; notification pops (MESSAGES / NOTIFICATIONS / SHORTS / NEWS / VIDEOS / ANOTHER VIDEO); PHYSICAL / EXPENSIVE / RISKY; animal-mood status gag with ??? and rejection stamp; FIXED ✓; WHAT DO YOU WANT TO BUILD?; REALLY EXPENSIVE; rejection-stamp callbacks (boss / invasion / tractor backstory) |

## TIMING
- Final real duration: **10:14.4 (614.4 s, 18,431 frames)** (1920×1080, 30 fps).
- The hook section keeps its approved 45.5 s timing; ACT 2 starts at the hook's own end point.

## AUDIO
- Mastering (V3 `scripts/master.ts`): **-14.2 LUFS integrated, -1.6 dBTP true peak**.
- Hierarchy: narration > SFX > music.
  - Approved V3 mix values: music bed 0.35, narration duck 0.27, SFX duck 0.62, attack 0.15 / release 0.6.
  - The hook music cues are unchanged.
  - The placeholder bed continues through ACT 2–11, and the placeholder sunset cue loops under the ending and M46.
- SFX come from the approved hook library and are placed only on beats (notifications, money, UI completion, impacts, stamps/buzzers, tractor, rumble, wind, crickets, chime). Some punchlines are left in silence.

## ISSUES (still visible / real limitations)
1. **Length:** the target was ~9:32; the real length at speed 1.00 is ~10:12. Tightening further would require cutting narration or speeding the voice, both forbidden.
2. **Recovered panels are small sources (≈130–330 px).** Even after local ESRGAN x8 some shots look soft or painterly at 1080p. This is most visible on plant/grow strips, expand aerial, bigger header and the card panels. Final art for these would improve the master.
3. **No princess art (M09)** and **no clean art** for machine components, animals/buildings, machine yard, seedling close-up, signpost or complete-farm panorama. Substitutes are listed above.
4. **Music** is still the engine's placeholder bed/sunset loop: the 50 s bed repeats across ~8 min. Replace it with licensed tracks for the master.
5. Some recovered panels keep painted-in text that belongs to the art (e.g. "LOAN AGREEMENT", "INBOX (203)", "REAL FARMING", "LOAD SAVE", "EMPTY FIELD"). This is illustration, not storyboard captions.
6. **Wordmark:** the M46 wordmark is the approved keyed logo; the official brand file is still to be supplied.

## OUTPUTS
- `secondquest/renders/secondquest_ep001_FULL_PREVIEW_v1.mp4` (468 MB)
- `secondquest/episodes/ep001full/SecondQuest_EP001_Full_Integration_Report_v1.md`
- Config: `secondquest/episodes/ep001full/{episode,script,timings,scenes,assets}.json`; plates in `secondquest/public/episodes/ep001_farming/full/`; narration in `…/audio/full/narration.wav`.
