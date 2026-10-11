# EP003 · Asset fit (How to Fish, script LOCKED v3)

Read-only on art. Needs: `docs/ep003/asset_needs.json` (12 needs). Finder run: `npm run assets:find -- --needs docs/ep003/asset_needs.json`
-> candidate sheets in `docs/asset_fit/<id>.jpg|json` (viewed). The finder only searches `shared/art_catalog.json`
(137 entries); Quest library v2, the Pixie library and the ep002 costume/final art are NOT catalogued, so they were
inventoried by hand (below). Candidates were judged against the moment, not the first impression.

Classes: REUSE (exact file) · RECOMPOSE (existing art combined) · PROGRAMMATIC (engine / `ui_kit` / `tools/props3d`, free)
· DERIVE (grade/crop of existing art, original untouched) · NEW_ART (credits).

## 0. Inventory (what exists)

| Group | Files | Relevant for EP003 |
|---|---|---|
| Quest, core | `public/art/core/quest/*.png` (23): phone_overwhelmed, exhausted_slumped, head_in_hands, gaming_excited, desk_typing, drive_calm/relaxed/stressed, wrench_fixing, worried_seated, sitting_back(_turn) (back view on a fence), looking_up_awe, bed_awake/sleeping, arms_up_back... | adult life, chat, night gaming, garage |
| Quest, library v2 | `docs/art_orders/quest/library_v2/results/` 01 wave, 02 laughing_pointing, 03 thinking_chin, 04 surprised_shocked, 05 nostalgic_smile, 06 determined_fist, 07 floor_gaming (cross-legged, generic pad), 08 holding_cartridge (DEFECT, N64 only) | boat reactions, chaos reactions. 688x1024: full-body only, no face close-ups |
| Quest, ep002 | `ep002_costume/` 03b young tunic (kid, Hyrule costume), 06a kid_playing_seated (1998 pad), 04b/05 backs; `ep002_tv/` floor_profile_tv | tunic ones are the wrong world; 06a is 1998 |
| Pixie | `docs/art_orders/pixie/library/results/` 01 wave, 02 gaming_excited (pad), 03 awe, 04 laughing_pointing, 05 thinking, 06 walking_back, 07 surprised (hands on cheeks), 08 hug_knees, 09 determined_fists, 10 sitting_relaxed; `ep002_costume/` 2a impatient arms crossed, 2b bored "watch", 6b pointing | boat companion, chat, chaos reactions |
| Backgrounds | `core/backgrounds/` home_living_day/night, living_room_night_gaming, quest_bedroom_morning, city_traffic, city_apartments_evening, office_openplan, sunset_sky, storm_low_horizon; `genre.farming.bg_riverbank`, `bg_workshop`, `bg_field_green`; ep001 crossroads; `docs/art_orders/ep002_final/15_adult_room_night.png` (bedroom, night, city window), `11_field` | see families |
| Props 2D | `core/objects/` calendar_friday, window_lit, toolbox, alarm_clock, router, fence_foreground...; `ep002/props3d/desk_phone.png` (magenta screen = screen-key), desk_headphones, switch2_room (green screen-key) | phone, calendar, toolbox |
| Mascots | `core/cast/` Wallet (happy, fainted, price_shock), Progress, Grind, Fear | Wallet could play "the fish money"; off-brand for this episode, use sparingly |
| 3D (`tools/props3d/scene.ts`) | n64, cartridge, pad, crt, ocarina, sword, shield, bomb, boomerang, horse, castle, triforce, scabbard, switch2, **phone, mug, headphones, gamebox** | none is fishing-related; the renderer (`toon` material, `roundedRect`, `slab`, `box`, `cyl`, ink outline via OpenCV) is easy to extend |
| UI kit | `scripts/animatic/ui_kit.py`: sq_box/sq_panel/sq_banner/sq_tag, wood_sign, signpost, parchment_list, marker, pixel_text, area_title/era_tag, Inter/Anton fonts, sparkle, fade. **No chat bubbles exist**; `ep002-bubble-proposals.py` has thought-bubble code only | chat bubbles are new but trivial in Pillow |

New 3D props (tools/props3d), effort: **easy**: rowboat (hull = lathe/extruded rounded slab + 2 benches + oars/oarlocks), fishing rod (cylinder + reel + curved line), fish (squashed ellipsoid + tail fins + big eyes), golf club/ball/flag, playing cards/poker chips (flat slabs), slot-machine-ish box, trash can, rifle silhouette (boxes + cylinders, cartoon), harpoon/spear. **Medium**: tangled line around several bodies, splash/water ripples (better as 2D FX in Pillow), a car with a hood up. **Hard / skip**: anything that needs faces, hands holding props, people.

## 1. Scene families

### F1 · Boat on the water (hook, thumbnail, "In a boat nobody has to look at each other", Tuesday-night boat, "nobody came for the fish", CTA)
Background: calm lake/river, dusk for the payoff. Characters: Quest, Pixie, two friends, crammed, laughing, tangled rod, one unimpressed fish.

| Need | Class | File(s) | Note |
|---|---|---|---|
| Hero: Quest + Pixie + 2 friends in a rowboat, tangled rod, fish staring | NEW_ART | none | Thumbnail and opening frame. Cannot be recomposed: 2 of 4 people do not exist, laughing faces, shared tangle |
| Lake plate (empty water + far shore, dusk, calm) | NEW_ART | closest: `genre.farming.bg_riverbank` | Rejected: it is a muddy farm bank, grass in the foreground, overcast daylight, no horizon of open water; reads "farm", wrong mood for dusk. Fine only as a quick placeholder in the animatic |
| Night/1 a.m. version of the lake plate | DERIVE | from the new lake plate | grade + stars; original untouched |
| Rowboat (side, 3/4, empty) | PROGRAMMATIC | new job in `tools/props3d` | easy; lets Quest/Pixie sit in it via RECOMPOSE for wide shots |
| Fishing rod (+ line, hook) | PROGRAMMATIC | new job | easy |
| Fish (unimpressed) | PROGRAMMATIC | new job | 3D fish with big flat eyes and a half-lidded stare is feasible; inside the hero image it comes from NEW_ART |
| Quest seated/reacting in boat (wide shots) | RECOMPOSE | `library_v2/07_floor_gaming` (cross-legged, holds a pad: wrong prop) , `03_thinking_chin`, `05_nostalgic_smile` | standing poses cannot sit in a boat; only the cross-legged one could, and it holds a controller. Needs seated-in-boat art |
| Pixie seated | RECOMPOSE | `pixie/library/results/10_sitting_relaxed`, `08_nostalgic_hug_knees` | usable calm-boat Pixie, identity safe |
| Sunset / sky for CTA | REUSE | `core/backgrounds/sunset_sky.png` | sky only, pairs with a DERIVE crop above the new lake plate. `storm_low_horizon` rejected (storm) |

### F2 · Group chat on a phone ("It's eight dollars. Just get it." / Bought x3 / "I'll get it later" / "We should hang out" exchange)
| Need | Class | File(s) | Note |
|---|---|---|---|
| Phone frame with screen | PROGRAMMATIC | `ep002/props3d/desk_phone.png` (screen-key magenta) or draw in Pillow | no brand UI (script rule: our own bubbles) |
| Chat bubbles, "Bought." stickers, typing dots, avatars as initials/silhouettes | PROGRAMMATIC | new `ui_kit.chat_bubble()` | easy; the finder found nothing |
| Quest looking at phone | REUSE | `core/quest/phone_overwhelmed.png` | fits tone for "plan quietly dies" (overwhelmed); for the eight-dollar beat use `library_v2/02_laughing_pointing` |
| The friend who "will get it later" | NEW_ART | none | can be avatar-only (silhouette) in chat; a face is only needed if cut to him |

### F3 · Quest alone gaming at night (buying the game, "the plan was to fish", 1 a.m. "last round")
| Need | Class | File(s) | Note |
|---|---|---|---|
| Night living room with TV glow | REUSE | `core.bg.living_room_night_gaming` | lamp + TV glow, messy, reads late. Best fit (finder #1). Not a pure "night window": no dark window, so 1 a.m. is carried by grade |
| 1 a.m. feel | DERIVE | grade of the above, add clock overlay | `home_living_night` has dusk-blue window but is tidy/empty; `home_living_day` rejected (day) |
| Alt room, night, bedroom desk | REUSE | `docs/art_orders/ep002_final/15_adult_room_night.png` | moonlit, city window, desk lamp; good for "Tuesday night" calm |
| Quest playing | REUSE | `core/quest/gaming_excited.png`, `library_v2/07_floor_gaming` | "last round, never the last round": gaming_excited fits; add `core.prop.alarm_clock` / 1:00 clock overlay |
| Clock "1:00 AM" | PROGRAMMATIC | `ui_kit` text / `alarm_clock.png` | easy |
| Pad/Switch/screen glow | REUSE | `ep002/props3d/switch2_room.png` | in-world is OK (generic console, no Nintendo logo to verify before use) |
| Voices of friends joining | PROGRAMMATIC | headphone icon / avatar tiles | no art needed |

### F4 · Adult-life montage (sick kid, car making a noise, plan dies)
| Need | Class | File(s) | Note |
|---|---|---|---|
| Calendar "in three weeks" | REUSE | `core.prop.calendar_friday` | smiley on Friday = cheerful; ok for "Three weeks works" |
| Sick kid | NEW_ART (optional) / PROGRAMMATIC | none | tasteful alternative: thermometer + bed icon + Quest `exhausted_slumped` on `home_living_night`; no child on screen needed |
| Car with a new noise | RECOMPOSE | `core/quest/drive_stressed.png` + `core.bg.city_traffic` | traffic night is dramatic, over the top for "a new noise" but stress fits; sound words as text |
| Plan dies in a chat | PROGRAMMATIC | F2 chat greying out | |
| Quest deflated | REUSE | `core/quest/exhausted_slumped.png`, `head_in_hands.png` | |
| Apartments at evening (adult life exterior) | REUSE | `core.bg.city_apartments_evening` | good establishing shot |

### F5 · Kids at the door "Want to play?"
| Need | Class | File(s) | Note |
|---|---|---|---|
| A kid at the door, warm afternoon | NEW_ART | none | no door/porch/house exterior exists. Rejected: `quest_bedroom_morning` (indoors), ep001 doors (fantasy), kid-Quest tunic (Hyrule costume) |
| Kid Quest (hoodie) as the kid | REUSE (weak) | `ep002_costume/06a_kid_playing_seated` | 1998 pad in his hands, seated: not "at a door" |
| Pixie "Want to play?" pointing | REUSE | `pixie/library/results/04_laughing_pointing`, `ep002_costume/6b_kid_pointing` | adult Pixie, not a child; works as a joke only if a door exists |
| Door frame as foreground | PROGRAMMATIC | Pillow door frame over a blurred plate (`home_living_day`) | cheap option; kid silhouette stays absent: "the sentence we lost" can be told with an empty door + text |

### F6 · Alibis: golf, poker, garage
| Need | Class | File(s) | Note |
|---|---|---|---|
| Garage / car afternoon | RECOMPOSE | `genre.farming.bg_workshop` + `core/quest/wrench_fixing.png` + `core.prop.toolbox` | wood barn workshop, not a suburban garage; acceptable for 2 s; car = 3D hood-up car (medium) |
| Golf course | RECOMPOSE | `genre.farming.bg_field_green` + 3D golf club/flag | field is farmland; flag + ball sell it |
| Poker night | PROGRAMMATIC | 3D cards/chips on a dark table (`ui_kit` vignette) | easy |
| "Nobody is there for the golf/cards/car" | PROGRAMMATIC | text/marker overlays | |

### F7 · Chaos montage (falls in the water, weapon not meant for fish, gambling the fish money, launched across the island, slap revive)
| Need | Class | File(s) | Note |
|---|---|---|---|
| Falls in the water | RECOMPOSE | `library_v2/04_surprised_shocked` + 2D splash FX + lake plate | |
| Weapon (sniper/harpoon, cartoon) | PROGRAMMATIC | 3D rifle/harpoon in `props3d` + `library_v2/06_determined_fist` | easy; generic, no Peak/Lethal Company look |
| Gambling the fish money | RECOMPOSE | `core/cast/wallet/happy|fainted` (Wallet mascot) + 3D chips/cards or slot | Wallet reads as "fish money" gag; Pixie `07_surprised` as the witness |
| Launched across the island | NEW_ART | none | ragdoll in an arc needs a body pose that does not exist; PROGRAMMATIC fallback: Quest `arms_up_back` shrinking along an arc with motion lines (usable placeholder) |
| Slap revive (pick up and slap) | NEW_ART | none | two people, hand to face: cannot be composed from single-character cut-outs. Fallback: Quest `exhausted_slumped` + big "SLAP" comic hit mark (placeholder) |
| Island | NEW_ART or REUSE | rolled into the lake plate (ask for a small island in the far field) | keeps one image |

### F8 · Friendslop genre card
| Need | Class | File(s) | Note |
|---|---|---|---|
| Genre card "FRIENDSLOP", trash-can gag | PROGRAMMATIC | `ui_kit.sq_banner`/`area_title` + 3D trash can | finder returned only farm animals: nothing suitable. Existing genre cards (`public/art/genres/*`) are the series pattern: reuse the style, not art |
| Friends invited to it | RECOMPOSE | Quest `01_wave_happy` + Pixie `01_wave_happy` | |

### F9 · Studio founders in high school
| Need | Class | File(s) | Note |
|---|---|---|---|
| Two teens, school, first game | NEW_ART (low priority) | none | finder nothing. Safe alternative: yearbook-style card, initials/silhouettes, no faces (PROGRAMMATIC); never present real people |
| "First paid game did not do well" | PROGRAMMATIC | text card, sad chart/`wallet.fainted` | careful with facts per script notes |

### F10 · Payoff + CTA ("I miss you", "Who would you put in your boat?")
| Need | Class | File(s) | Note |
|---|---|---|---|
| Return to the boat at night | DERIVE | night grade of F1 hero/plate | the thumbnail image reused as the book-end |
| "I miss you" beat | REUSE | `pixie/10_sitting_relaxed` + `library_v2/05_nostalgic_smile` over the night lake | quiet two-shot, recomposed |
| CTA close | REUSE + DERIVE | `core.bg.sunset_sky` + F1 boat crop; brand `secondquest_wordmark`, `q_mark` | |

## 2. NEW_ART shortlist (ranked by screen time covered per image)

Pricing basis: library v2 cost 4.0 credits per 1k image (Q007). Last balance in `docs/credits/ledger.json`: **28.25** (after Q042; confirm the live balance with the quote). Every image follows `QUEST_V1_PROMPT_SPEC.md` / `PIXIE_V1_PROMPT_SPEC.md`, identity always kept; friends need their own spec/refs first (Quest/Pixie references must not leak onto them).

| # | Image | Covers | Priority |
|---|---|---|---|
| 1 | **Boat hero**: Quest, Pixie, 2 friends in a rowboat, tangled rod, unimpressed fish (the thumbnail frame; 2k advised, may need a retry) | thumbnail, 0:00 hook, boat/"look at the water", Tuesday-night boat, "nobody came for the fish", CTA (~35% of the video via crops and pans) | Tier 1 |
| 2 | **Lake plate**, calm, dusk, with a small island on the far shore | everything on the water (F1, F7 water/island, night derive for payoff, CTA) | Tier 1 |
| 3 | **Friend A**, laughing-pointing / pad-in-hand, seated-capable | chat cut-aways, boat shots, chaos | Tier 1 |
| 4 | **Friend B**, "I'll get it later" shrug/phone | the late friend beat, boat shots | Tier 1 |
| 5 | Friend A second pose (falls/panics) | chaos montage | Tier 1 |
| 6 | Friend B second pose (smug, holding cards) | gambling beat, alibis | Tier 1 |
| 7 | **Slap revive** (two characters) | the single biggest recognisable gag | Tier 2 |
| 8 | **Launched across the island** (ragdoll arc) | chaos finale | Tier 2 |
| 9 | **Kid at the door** "Want to play?" | the emotional hinge ("we lost that sentence") | Tier 2 |
| 10 | Unimpressed fish close-up (if the 3D fish is not enough) | recurring gag, thumbnail echo | Tier 2, may be PROGRAMMATIC |
| 11 | Two teen founders at a PC | studio founders (~10 s) | Tier 3, skippable |

**Count: 11 images; minimum viable 6 (Tier 1); recommended 10 (Tier 1 + 2, fish done in 3D).** At ~4 credits each: Tier 1 ~24 (+~4 for a 2k hero), 10 images ~40-44: more than the last known balance, so Tier 1 first, and a quote before anything is generated. Everything else is REUSE / RECOMPOSE / PROGRAMMATIC / DERIVE, listed above.

## 3. Free work to queue (no credits)
1. `tools/props3d` jobs: rowboat, fishing rod, fish, golf club + flag, cards/chips, trash can, rifle/harpoon (all easy).
2. `ui_kit.chat_bubble()` + phone chat sequence (F2).
3. Pillow FX: water splash/ripples, SLAP hit mark, motion lines, 1:00 AM clock, night grade (DERIVE).
4. Animatic placeholders for NEW_ART frames use the closest existing art with the "MISSING" label already used in EP002 (`lib._miss_label`).

## 4. Risks / notes
- The finder is blind to library v2, Pixie and ep002 art; extend `shared/art_catalog.json` with them (catalog only, no art touched) so future fit passes see them.
- `library_v2/08_holding_cartridge` has a QC defect; do not use it.
- `ep002_costume/03b` Quest is in a Hyrule tunic: wrong world for EP003. Core Quest is always the red hoodie.
- Closest-match traps rejected: `bg_riverbank` (farm, overcast), `home_living_day` (day), `storm_low_horizon` (storm), `city_traffic` for "a car noise" (over-dramatic).
