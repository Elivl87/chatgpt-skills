# Dave the Diver · Shot plan (animatic) — "Why Dave the Diver Feels Better Than Your Real Job"

Script LOCKED v1.1 (`episodes/davethediver/script.json`, ids p01..p54, verbatim). **Timing: `timings.json` does NOT exist yet**, so every
duration is ESTIMATED at 2.45 words/s + 0.35 s per line (the placeholder `public/episodes/davethediver/audio/narration.wav` is 348 s, i.e.
faster than the estimate; re-time all shots from `timings.json` when it lands: triggers are words, not seconds). Estimated runtime
**419.4 s = 6:59** (186 shots; includes the 1.5 s silence hold after p08). Producer decision 2026-10-19: companion = **pink dolphin**; oxygen = the game's HUD, no character.

## Rules applied
- HUD (our own drawing in the game's layout) ON only in the game world (dive, boat dive start, bar service). Real-life shots never show a HUD (G03 and G17 show it ON A TV SCREEN).
- Every on-screen text has a source (DESIGN_RUBRIC §4b): speech bubble (visible speaker, tail to head), phone screen / top notification banner, physical sign, in-world game UI, or narrator label/stamp/quote. No floating chat cards. No game footage/art/logo/font.
- Trigger column: `pNN@word` is the ONE owning trigger of that line (first shot); `pNN+word` are later cut points inside the same line. Every id p01..p54 (incl. p20b) owns exactly one `@`.
- No hold > 4 s without a change (max shot here is 3.9 s and each carries an internal event). Quiet shots get an idle event (blink, ripple, tail flick) every <= 4 s.
- **Camera-continuity rule**: each shot starts with the motion/screen direction the previous one ended on (push->push, exit R -> enter from L, match cut on shape/glow). Breathing push/drift (2-4 %) is the default; big moves only where the script calls: A05 (through the TV), A14 (odometer whip), A15 (pull-out to the city), C08 (squid reveal), D03 (into the Blue Hole), D21 (fall to 800 m).
- Camera shorthand: push = slow 3 % push-in; drift = 2 % lateral; whip = 6-frame blur pan; hitstop = 3-frame freeze.

## Plate / asset legend (asset_fit picks from `docs/asset_fit/*.json`; jpgs not opened, token budget)
- **LR** `core.bg.living_room_night_gaming` (A_present_room 5.0, B_sofa_phone_gaming 4.0, C_quest_night_gaming 4.0: top pick) · **HL** `core.bg.home_living_night` (3.0, D14 bed/phone) · **OFF** `core.bg.office_openplan` (C_office_late 2.5) · **CITY** `core.bg.city_apartments_evening` (D_adult_life 3.0) · **BR** `core.bg.quest_bedroom_morning`. Real-life Quest poses: `quest.default.*` library (arms_up_back, bed_awake, bed_sleeping, broom_bored, holding_tray + sofa/laptop/phone poses to pick at build; if one is not in the library -> NEW_ART optional).
- **Bar interior / bay exterior**: asset_fit top is 1.0 / 0.5 (not a fit) -> MISSING -> NEW_ART plates.
- **BOAT**: NEW props3d cabin boat (code) on procedural water. **UW** = procedural underwater (gradient, caustics, god rays, kelp, marine snow, schools). Pixel poses in `public/art/davethediver/pixel/` (p01..p10b); Leo/Cobra and Max from `public/art/davethediver/props3d/`; fish cameo from `public/art/ep003/props3d/fish2_34_*`; POV hands `fp_hands_pov*`. `bubble_*` = small air-bubble FX only.

## HUD spec (VERIFIED from the Producer's gameplay screenshot, 2026-10-19; our own drawing in that layout)
- **Bottom-left**: round O2 dial (dark navy disc, thick blue ring that empties as oxygen drops, small "O2" label, big white number in BAR e.g. 40); flashes RED and beeps when low; drains on every hit. To its right a small dark panel: "Normal Depth" text on top (turns red past the suit limit), below it a cargo-box icon + weight "9.2/9.0kg", RED when overweight.
- **Bottom-right**: three slanted equipment slots (knife, gun with ammo, harpoon "Lv.1" highlighted orange/yellow), each with a small button prompt above.
- **Harpoon struggle**: curved arc meter (orange to yellow fill, small button icon on top) beside Dave; "!" pops over the fish; harpoon line = thin black line from gun to fish.
- Overweight-in-red gag is used at D18 (p26 cargo box); struggle arc at A08, B16.
- Bar HUD (E14-E18): order-ticket strip, served counter, timer bar, end-of-night score card; Cooksta = phone-screen app in our generic UI.

## Dolphin arc (companion; always in water: sea, tank window, bay outside the bar)
Tangled in a net in the Blue Hole shallows (A07) -> freed by Dave as his oxygen runs out (A09, "Nobody makes you") -> follows him, appears roughly every 40 s with one reaction (B01 wave, B06 sleeping, B10 facepalm splash, B21 contract on fin, B27 worried; C05 hides, C17 pushes the shift ticket; D01 sunrise leap, D21 turns back at depth; D24 laughs) -> peeks at the bar from the bay and through the aquarium window at night (A10, E01, E13, E24, E34, G09) -> with the Sea People crowd (F11) and laughing at the party window (F18) -> polaroid friend with the contract (F27, callback to B21) -> G27 wink -> wordmark: p08 blows a heart-tinged bubble ring that becomes the "o" (A20), hold 1.5 s, and H05 leaps through the "o" and splashes into the gold bar. Never on land, never in the bar.


## Block A · Hook  (21 shots, ~39.9 s, starts ~0 s)

| Shot | Trigger | Dur s | Background | Characters / pose | Camera | HUD | Dolphin | On-screen text (source) | SFX |
|---|---|---|---|---|---|---|---|---|---|
| A01 | p01@"finish" | 1.3 | OFF core.bg.office_openplan (fit 2.5) | Quest real-life lib pose (shuts laptop) | static, snap zoom-out on "finish" | - | - | - | laptop clap |
| A02 | p01+"home" | 1.3 | CITY core.bg.city_apartments_evening (fit 2.0) | Quest lib pose, keys in door | drift R (exit R) | - | - | - | door+keys |
| A03 | p01+"sit" | 1.4 | LR core.bg.living_room_night_gaming (fit 5.0, top pick) | Quest lib sofa pose, soda glass on table | enters from L, slow push | - | - | - | sofa sigh |
| A04 | p02@"second" | 1.4 | LR (same plate) | Quest lib pose picks up controller | push toward TV | - | - | - | controller click, TV hum |
| A05 | p02+"job" | 1.4 | TV screen -> dive boat dawn (match cut on glow) | none (TV glow wipes to boat) | continues push THROUGH the screen | - | - | - | power-on chime, whoosh |
| A06 | p03@"dive" | 2.4 | BOAT props3d cabin boat (NEW code) + procedural dawn sea | Quest pixel p04 dive ready on stern | low angle, push; follows him off the stern | depth panel only (0 m) | - | - | splash |
| A07 | p03+"hole" | 2.6 | UW procedural: gradient, god rays, caustics, kelp | Quest pixel p01/p02 swim cycle (A/B alternated) | descending drift, parallax | HUD ON: O2 dial bottom-left (number in bar), Normal Depth panel + weight, 3 slots bottom-right | far background: pink dolphin TANGLED in a net, worried, tail flicks (setup) | - | bubbles, low drone |
| A08 | p03+"spear" | 2.6 | UW | Quest pixel p03 aim, harpoon gun; fish | push to the fish; harpoon = thin black line from gun | harpoon slot highlighted, struggle arc meter (orange->yellow) beside Dave, "!" over fish | - | - | harpoon thunk, "!" ping, reel |
| A09 | p03+"oxygen runs out" | 2.0 | UW darker | Quest p03 then turns to the net, knife | quick cut-in; shake on low O2 | O2 dial drains, flashes RED, beep | Quest cuts the net: dolphin FREE, happy loop around Dave (follows him from now on) | - | low-O2 beep, net snip, whoosh |
| A10 | p03+"By night" | 2.2 | H bar interior (NEW_ART plate) | Quest pixel p10 tray run | whip from sea to bar, settle push | bar HUD: order tickets strip + night clock | dolphin face at the bar window (peeks, tiny, in the bay glass) | - | bar chatter, sizzle |
| A11 | p04@"Nobody" | 1.4 | LR | Quest lib pose, relaxed, grinning at TV | pull back (reveals empty room: nobody) | - | - | - | room tone |
| A12 | p04+"makes" | 1.4 | LR door | empty doorway, no boss | drift L to the empty door | - | - | - | clock tick stops |
| A13 | p05@"Dave" | 2.2 | BOAT sunrise surface | Quest pixel p05 big fish | push | depth 0 m | surfaces beside the boat, nose up | - | splash, gull |
| A14 | p05+"ten million" | 3.9 | dark void + sun-lit wheel | number odometer, digits click up to 10,000,000+, slams to the frame edge | continuous push; whip at the last digit; 0.25 s hitstop + screen shake on the final digit [DF-A] | - | - | narration label "10,000,000+ copies" (narrator; tiny source line "studio figure, Nexon") | digit ticks pitched up, thump |
| A15 | p06@"Ten" | 1.8 | CITY evening, windows lit; each window = a tiny TV glow | none | pull back, huge (rows of windows) | - | - | - | rising choir swell |
| A16 | p06+"clocking in" | 1.8 | punch-clock card on dark wood (code) | none | snap in; stamp thump | - | - | narration stamp IN / OUT (narrator) | stamp thump x2 |
| A17 | p07@"2023" | 2.0 | LR | Quest lib pose, sitting back | static + push | - | - | narration label "2023 . Steam Awards" (narrator, small) | award chime |
| A18 | p07+"Sit Back" | 2.6 | LR | Quest leans back into cushion, soda glass | push | - | - | narration quote "Sit Back and Relax" (letters recline; source: Steam Awards category) | cushion sink |
| A19 | p07+"Relax" | 1.5 | LR | Quest deflates, controller on chest | slow push | - | - | - | sigh, hush before the water |
| A20 | p08@"So" | 1.2 | UW deep navy, light shaft | none | still, centre | none | dolphin faces camera, blows a HEART-TINGED bubble RING that scales into the "o" of SecondQuest | wordmark "SecondQuest" (brand title card: source = channel brand) | bubble ring pop-in, heart sparkle |
| A21 | p08+"why" (hold) | 1.5 | UW deep navy | wordmark | static; gold bar lands under it | none | dolphin idles beside the "o", blink | wordmark | 1.5 s SILENCE hold, gold bar clink |

## Block B · Meet Dave and Cobra  (27 shots, ~60.0 s, starts ~40 s)

| Shot | Trigger | Dur s | Background | Characters / pose | Camera | HUD | Dolphin | On-screen text (source) | SFX |
|---|---|---|---|---|---|---|---|---|---|
| B01 | p09@"Meet" | 2.4 | BOAT deck sunrise | Quest pixel p04 dive ready, centre | low angle, push | - | pops up at the bow, waves a fin | narration label "DAVE" with pixel arrow (narrator) | pop, ukulele sting |
| B02 | p09+"hero" | 2.4 | BOAT | Quest p04 tries a hero pose, sags | snap push on face; slump | - | - | - | cartoon sag, trombone slide |
| B03 | p09+"Round. Easygoing." | 2.4 | BOAT | Quest p04 + outline traced around his round body | two cuts: front outline, side shrug | - | dolphin wink, nudges his belly | - | boing x2 |
| B04 | p09+"wetsuit" | 2.0 | BOAT detail close-up | Quest p04 crop on suit patches | push to the patches | - | - | - | cloth creak |
| B05 | p09+"developers" | 2.2 | BOAT | Quest p04 | pull back | - | - | narration label "body not typical for a diver, say the developers" (narrator) | soft stamp |
| B06 | p10@"vacation" | 2.0 | BOAT deck, parasol + deckchair (code) | Quest p04 reclined, sunglasses (code overlay) | drift R | - | floats on its back beside the boat, SLEEPY | - | waves, ukulele |
| B07 | p10+"Cobra calls" | 2.2 | BOAT cabin interior (code) | Leo/Cobra leo_cobra_34_phone_laugh | push, rack focus | - | - | speech bubble from Cobra: "Sushi. Tonight." (tail to Cobra, visible speaker) | phone ring |
| B08 | p10+"promise of sushi" | 2.3 | BOAT | Quest p04 ears perk, thought bubble nigiri (tail to Quest) | snap zoom to face | - | - | thought bubble: pixel nigiri (Quest, visible) | sparkle ding |
| B09 | p11@"ends" | 2.0 | BOAT | parasol snaps shut, Quest p04 locks into place | whip + speed ramp | - | wakes with a splash | - | whoosh, parasol snap |
| B10 | p11+"likes sushi" | 2.8 | BOAT | Quest p04 drool/eyes sparkle, pixel nigiri thought | push, hold 1 s | - | face-palm fin slap = splash (comic) | - | slurp, splash |
| B11 | p12@"no fish" | 2.2 | H bar interior (NEW plate), empty plates, empty aquarium (EP003 fish absent) | none | push to the empty tank | - | - | - | cricket, wind-chime |
| B12 | p12+"fish supply" | 2.0 | bar | Leo pointing (leo_cobra_34_point_neutral) at Quest p04 | cut to two-shot, point | - | - | - | finger-point stinger |
| B13 | p12+"Dave is" | 1.9 | UW | Quest p01/p02 swim, net sack | drift | HUD ON | swims alongside | - | bubbles |
| B14 | p13@"One player" | 2.0 | UW dark teal | chain of icons ocean-Dave-plate collapses | push | - | - | narration quote "the shortest supply chain in the world" (narrator quote, attribution "a player") | chain clank |
| B15 | p13+"one guy" | 2.6 | UW | Quest p03 alone, aiming at camera | push; line of fish behind him | - | - | - | harpoon charge |
| B16 | p13+"harpoon" | 2.7 | UW | Quest p03 + fish, harpoon thin black line | push to fish | harpoon slot (Lv.1 orange), struggle arc, "!" over fish | - | - | reel, ping |
| B17 | p14@"worse" | 1.8 | BOAT dock dusk | Leo cobra front sideeye | push on his face | - | - | - | ominous sting |
| B18 | p14+"contracts" | 1.8 | BOAT | Leo signs paper (leo_cobra_34_point), contract flies | snap | - | - | contract paper (prop, code) | pen scratch |
| B19 | p14+"archaeologist" | 1.5 | paper card on wood | archaeologist icon contract stamp | cut | - | - | contract card "Archaeologist" (prop paper, narrator voice) | stamp thump |
| B20 | p14+"weapons nerd" | 1.5 | paper card | gun/wrench icon contract | cut (continuity: slide R->L) | - | - | contract card "Weapons" | stamp thump pitch+ |
| B21 | p14+"reporter" | 1.5 | paper card | mic icon contract, Cobra bobs behind it | cut | - | a contract is stuck on its fin; shakes it, it sticks (callback seed) | contract card "Reporter" | stamp thump pitch++, "without asking" mute |
| B22 | p15@"Cobra" | 2.2 | CITY evening (apartment door) | Leo cobra front neutral | snap push to camera | - | - | - | sting |
| B23 | p15+"told everyone" | 3.0 | CITY | Leo 34 armsCrossed | drift L | - | - | speech bubble from Leo: "He is totally helping me move." (tail to Leo) | smug horn |
| B24 | p15+"boss" | 3.0 | OFF office | Quest lib desk pose; laptop | static + push | - | - | top notification banner "Calendar: You accepted Q3 Planning (3 h)" (phone OS banner) | calendar ping |
| B25 | p15+"meeting" | 3.6 | OFF (meeting-room corner) empty chair with Quest name card | Quest lib pose staring | drift to empty chair, push on face; [DF-B] anticipation: Quest eyes the chair, HIT: chair swivels away and the name card falls, HOLD 0.4 s, REACTION: Quest slumps | - | - | - | empty room hum, sad trombone |
| B26 | p16@"leave" | 2.0 | BOAT dock dusk | Quest p04 at the mooring rope | static+push | - | worried, watches him | - | rope creak |
| B27 | p16+"Hold on" | 2.0 | BOAT | Quest holds the rope, then lets it be | hold 1.2 s on his hand on rope, push | - | sleepy-worried face, tail still | narration stamp "HOLD ON TO THAT" (narrator) | soft chord, silence beat |

## Block C · Cozy is not the answer  (19 shots, ~44.3 s, starts ~100 s)

| Shot | Trigger | Dur s | Background | Characters / pose | Camera | HUD | Dolphin | On-screen text (source) | SFX |
|---|---|---|---|---|---|---|---|---|---|
| C01 | p17@"easy answer" | 1.8 | BOAT calm dusk | Quest p04 shrug | static | - | - | narration stamp "cozy?" (narrator) | warm chord |
| C02 | p17+"Pixel art" | 1.9 | pixel zoom on Quest sprite | Quest p01 zoomed to pixel grid | snap zoom in/out | - | - | - | 8-bit blip |
| C03 | p17+"Gentle music" | 1.8 | dusk sea | music-note particles, eq bars (code) | drift | - | bobs to the beat | - | soft music box |
| C04 | p17+"sushi bar" | 2.2 | G bay exterior dusk with karst cliffs, floating bar (NEW plate, fit 0.5 so MISSING) | none | push, lanterns glow | none | swims along the bar, surfaces, wink | - | water lap, lanterns |
| C05 | p18@"isn't only cozy" | 1.9 | bay darkens | none | music stops (record scratch), push down into the water | none | ears back, worried | - | record scratch |
| C06 | p18+"sharks" | 2.5 | UW dark | Quest p01/p02 swim, shark silhouette crosses | drift, shark crosses L->R | HUD: O2 dial full | hides behind Dave | - | shark theme two notes |
| C07 | p18+"hermit crab" | 2.6 | UW seabed | hermit crab in a dump truck (our drawing, code) | push to crab, pop-out reaction | HUD depth | peeks | - | truck honk |
| C08 | p18+"squid" | 2.8 | UW deep | giant squid silhouette; school-bus outline overlay for scale (narrator diagram) | pull way back | - | tiny dolphin eyes wide | - | low drone, bus horn |
| C09 | p18+"oxygen" | 2.8 | UW | Quest p02 | cut-in to HUD, O2 dial big number; [DF-C] number ticks down in heartbeat rhythm, 1-frame shark eye flash as anticipation | O2 dial bottom-left, ring full, number 40 | - | - | tank hiss |
| C10 | p18+"Get bitten" | 3.3 | UW | shark bite from edge, Quest p03 | HITSTOP 3 frames, shake, then settle | O2 dial ring drops, flashes RED, beep | dolphin flinches | - | chomp, beep |
| C11 | p19@"Danger below" | 1.9 | split screen, lower half UW | Quest p02 | static split | - | - | - | low drone |
| C12 | p19+"Rice above" | 1.9 | upper half bar interior warm (NEW plate) | rice bowl steam | split slides open | - | - | - | steam, bell |
| C13 | p19+"Mondays" | 1.9 | OFF office, Monday sign | Quest lib slump; calendar prop | snap in | - | - | calendar page "MON" (prop) | alarm, groan |
| C14 | p20@"cozy alone" | 2.2 | LR | Quest lib pose, relaxed | push | - | - | - | lo-fi hum |
| C15 | p20+"Plenty of games" | 2.8 | quick cuts 0.9 s: hammock, tea, cat (our drawn props) | none | 3 whips L->R | - | - | - | 3 chimes |
| C16 | p20+"quit the office" | 2.8 | OFF | Quest lib pose walks out with a box | drift R, exits R (continuity) | - | - | - | door, birds |
| C17 | p20+"better shift" | 2.8 | BOAT dusk | Quest p05 holds a glowing shift ticket (prop) | push | none | pushes the ticket to him with its nose | - | ding |
| C18 | p20b@"So why" | 2.2 | split screen LR / bar | left: Quest dozing on sofa; right: Quest p10 tray run | static split, zzz vs sizzle | - | - | - | zzz, sizzle |
| C19 | p20b+"nap" | 2.2 | split | right side wipes over; "?" pops | push | - | peeks from the right edge at the bar | - | question ping |

## Block D · The day (the dive)  (26 shots, ~64.1 s, starts ~144 s)

| Shot | Trigger | Dur s | Background | Characters / pose | Camera | HUD | Dolphin | On-screen text (source) | SFX |
|---|---|---|---|---|---|---|---|---|---|
| D01 | p21@"Start" | 2.0 | BOAT sunrise | none | low sun rising, push | depth 0 m | leaps across the frame at sunrise | - | sun chime, splash |
| D02 | p22@"Every day" | 1.8 | BOAT stern | Quest p04 | follow him off the stern | - | follows | - | splash |
| D03 | p22+"Blue Hole" | 2.4 | top-down procedural Blue Hole (radial teal -> black) | none | dive INTO the hole | - | circles the rim | - | whoosh down |
| D04 | p22+"different" | 2.0 | 3 procedural layouts: wipes | Quest p01 in each | 3 wipes, continuity R->L | O2 dial | tags along | - | 3 swooshes |
| D05 | p22+"New fish" | 1.9 | UW | fish silhouettes; shark fin; "!" over Quest | push | O2 dial | - | - | ping |
| D06 | p23@"ending" | 2.6 | UW | Quest p01/p02 | drift | O2 dial full, number 90 | swims ahead, glances back | - | bubbles |
| D07 | p23+"gauge" | 2.4 | UW | cut-in on HUD | tilt/push into the dial ring | O2 dial big | - | - | tick tick |
| D08 | p23+"oxygen runs out" | 2.4 | UW | Quest p02 | vignette closes | ring empties, flashes RED, 0 | worried | - | alarm, heartbeat |
| D09 | p23+"pull you up" | 2.0 | UW | Quest hoisted up on a rope, bubbles | tilt up, speed ramp | HUD fades out as he rises | accompanies him up | - | rope pull, whoosh |
| D10 | p23+"one thing" | 1.6 | dive log card in-game (our drawing) | none | static, hold | - | - | dive log card rows fade except ONE item pink (game UI, in-world) | ding, hush |
| D11 | p24@"workday" | 2.4 | OFF | Quest lib at laptop | push | - | - | - | keyboard |
| D12 | p24+"last end" | 2.4 | OFF wall clock | clock hands spin | snap zoom to clock | - | - | - | tick spin |
| D13 | p24+"Actually end" | 2.3 | OFF | clock hits 17:00, passes, 18:00 ... Quest still there | dolly push | - | - | narration stamp "END OF DAY is not THE END" (narrator) | bell, stamp |
| D14 | p24+"ten at night" | 3.5 | HL core.bg.home_living_night (fit 3.0) | Quest lib bed/phone pose | push on phone, banner drops | - | - | top notification banner "Mail: Quick thing for tomorrow? 22:04" (phone OS) | buzz, sigh |
| D15 | p25@"clock you can see" | 2.9 | UW | Quest p02 beside the O2 dial | drift | O2 dial counting down | dolphin tail-taps the gauge | - | tick |
| D16 | p25+"phone" | 2.8 | real-life phone close-up | phone 99+ badges | shake, hard cut out | - | - | phone screen badges (phone UI) | buzz x5 |
| D17 | p26@"air tank" | 3.6 | UW | Quest p01/p02 with yellow tank growing | push | O2 dial number rolls 90 -> 480, ring thickens | cheers | - | counter rolls, ding |
| D18 | p26+"cargo box" | 2.6 | UW | Quest p02 slowed, squished | push | weight panel "9.2/9.0kg" RED overweight, flashes | tries to push him, strains | - | creak, red buzz |
| D19 | p26+"hundred and eighty-five" | 2.8 | UW | Quest straightens, big box | pull back | weight rolls 9 -> 185 kg, white | claps tail | - | roll, pop |
| D20 | p26+"suit" | 2.4 | UW descent | Quest | tilt down | depth panel "Normal Depth" 40 m, ticks | - | - | ticks |
| D21 | p26+"forty meters" | 3.0 | UW through zones: lit -> dark | Quest tiny | falls with him, light fades | depth 40 -> 800 m | stays behind at the light's edge, waves | - | pressure creak |
| D22 | p26+"eight hundred" | 3.1 | UW black, lamp only | Quest tiny with lamp | hold 1 s then push; [DF-D] sonar ping lights two huge lantern-fish eyes in the dark (hit), blink, gone | depth 800 m | far above: pink glow, thumbs-up fin | - | sonar ping |
| D23 | p27@"promotion" | 2.2 | UW lit | Quest p05 with balloon "PROMOTION" (prop) that pops | static | - | - | balloon label "PROMOTION" (prop) | pop |
| D24 | p27+"bigger tank" | 2.2 | UW | giant tank dwarfs Quest | pull back | - | laughs, bubbles from its blowhole | - | clang, boing |
| D25 | p28@"Out here" | 2.4 | OFF | Quest lib at desk, paper stack (core.prop.paper_stack) | push | - | - | - | paper |
| D26 | p28+"more job" | 2.4 | OFF | stack towers over Quest | tilt up | - | - | narration kinetic "more JOB" (JOB grows; narrator) | tower creak |

## Block E · The night (Bancho Sushi)  (34 shots, ~74.2 s, starts ~208 s)

| Shot | Trigger | Dur s | Background | Characters / pose | Camera | HUD | Dolphin | On-screen text (source) | SFX |
|---|---|---|---|---|---|---|---|---|---|
| E01 | p29@"sun goes down" | 2.2 | G bay exterior dusk (NEW plate) | none | sun drops, push | - | surfaces in the bay, ogles the bar | - | cicadas |
| E02 | p29+"second half" | 1.5 | bay | none | push toward bar | - | - | - | lamps tick on |
| E03 | p29+"Bancho Sushi" | 1.5 | bar facade with neon sign (our sign, physical) | sign "BANCHO SUSHI" lights | push, sign flickers on | - | - | physical neon sign on the building (source = the sign) | neon buzz |
| E04 | p30@"Bancho is the chef" | 2.4 | H bar interior | Pixie p09 behind counter | push | - | - | - | knife on board |
| E05 | p30+"so serious" | 2.8 | bar dark void | Pixie p08 glasses flash | snap zoom | - | - | - | flash stinger |
| E06 | p30+"according to the game" | 1.6 | bar | Pixie p09 | static | - | - | narration tag "per the game" (narrator, small) | paper tick |
| E07 | p30+"five-star hotel" | 2.8 | hotel icon + 5 stars (code) | Pixie p09 small walking out with a box | stars pop 1-5 then fall | - | - | - | star dings |
| E08 | p30+"food critic" | 2.0 | critic silhouette with notepad (code) | none | cut | - | - | - | pen scribble |
| E09 | p30+"shark head" | 2.2 | platter with a roasted shark head (code) | Pixie p08 glasses flash | rack focus, hit | - | - | - | dramatic chord |
| E10 | p31@"anime cutscenes" | 1.8 | cutscene void, smoke, light streaks | Pixie p06 slice profile | whip in; streaks | - | - | - | cutscene whoosh |
| E11 | p31+"Knives flash" | 1.6 | void | Pixie p08 | flash frame | - | - | - | steel ring |
| E12 | p31+"petal falls" | 1.8 | void | petal (code) sliced by p07 nigiri hero | slow-mo, push | - | - | - | slow shimmer |
| E13 | p31+"catfish terrified" | 2.1 | bar aquarium on the right end (NEW plate window) | EP003 fish2_34_wide, then wince, then sweat | snap to tank, rack focus | none | face-on peeking through the tank window from the bay, delighted | - | gasp, squeak |
| E14 | p32@"runs the floor" | 2.0 | bar | Quest p10 tray run | push, tracking L->R | bar HUD: order tickets, timer bar | window: sleepy | - | bell |
| E15 | p32+"Tea. Wasabi." | 3.0 | bar | three icon pops: tea, wasabi, plates | cuts on each word | tick marks | - | - | 3 pops |
| E16 | p32+"Faster" | 2.6 | bar | Quest p10 | speed ramp, whip | served counter rolls, timer red | - | - | tempo up |
| E17 | p32+"Until closing" | 2.0 | bar | clock 21:59 -> 22:00; CLOSED sign flips | push | - | - | physical sign CLOSED | bell |
| E18 | p32+"score for the night" | 2.6 | bar HUD | end-of-night score card S (game UI, our drawing) | snap, static | - | - | score card (in-world game UI) | fanfare |
| E19 | p32+"phone has an app" | 2.2 | bar counter | phone in hand (lib), Cooksta app | push to phone | - | - | phone screen "Cooksta" (our generic UI) | phone tap |
| E20 | p32+"followers" | 2.3 | phone screen | follower list: customer avatars tick up | push | - | - | Cooksta feed (phone screen) | follow pings |
| E21 | p33@"part that matters" | 2.0 | BOAT noon | Quest p05 surfacing | push | depth 0 | - | - | sun chime |
| E22 | p33+"speared at noon" | 2.2 | BOAT noon | Quest p05 fish up | static | - | - | HUD clock 12:00 | clink |
| E23 | p33+"plate at eight" | 2.4 | match cut: fish -> plate on bar counter | plate with nigiri | match cut on fish silhouette | - | - | HUD clock 20:00 | sizzle |
| E24 | p33+"somebody eats it" | 2.3 | bar counter | Max bar neutral eating (max_bar_34_neutral) | push, hold 1.1 s on smile | - | window: heart bubble | - | chew, mmm |
| E25 | p34@"nobody sees" | 2.4 | OFF | Quest lib typing | push | - | - | - | keyboard |
| E26 | p34+"report" | 2.0 | OFF laptop screen | file "Report_final_v7" into folder | zoom into screen | - | - | laptop screen (screen UI) | click |
| E27 | p34+"folder" | 2.4 | folder recursion | folders inside folders | tunnel zoom | - | - | folder labels (screen UI) | whoosh |
| E28 | p34+"another folder" | 1.7 | folder | shrinks to a dot | stop dead | - | - | - | thud |
| E29 | p35@"director" | 2.6 | diagram, dark paper | day bar splits sun / moon | snap cut | - | - | narration diagram + tag "the director" (narrator) | chop |
| E30 | p35+"focus on each half" | 2.8 | diagram | left lit, right dim, swap every 0.9 s with sun/moon icon bounce [DF-E] | push | - | - | - | swap ticks |
| E31 | p35+"preparing dinner" | 3.0 | bar | Pixie p09 presents plate | push | - | peeks at the plate | narration quote "preparing dinner for customers" (narrator, attribution "the director") | bell |
| E32 | p35+"customers" | 2.2 | bar | plate slides to Max (bar_34_laugh) | follow slide | - | - | - | slide |
| E33 | p36@"Not a task" | 1.4 | paper | checkbox crossed out | snap | - | - | narration strike "task" (narrator) | strike |
| E34 | p36+"A dinner" | 1.8 | bar | plate reaches Max, warm light | push, hold 1 s | none | heart-bubble ring outside the window pops | - | ding, warm chord |

## Block F · Who is waiting (being needed)  (27 shots, ~64.1 s, starts ~282 s)

| Shot | Trigger | Dur s | Background | Characters / pose | Camera | HUD | Dolphin | On-screen text (source) | SFX |
|---|---|---|---|---|---|---|---|---|---|
| F01 | p37@"customers" | 1.8 | bar door, outside, night | silhouettes at the door | push | - | - | - | door chime |
| F02 | p37+"waiting" | 1.8 | bay at the bar entrance | queue silhouettes | drift R | none | taps fin on the water, waiting | - | water tap |
| F03 | p38@"Duff" | 2.0 | bar door | Duff silhouette (our drawn stocky goggles) | snap | - | - | - | sting |
| F04 | p38+"anime idols" | 2.9 | bar | idol poster (our drawing) glows, glow sticks | push | - | - | - | idol jingle |
| F05 | p38+"louder" | 2.8 | bar | Duff silhouette shouting | shake with volume | - | - | speech bubble from Duff silhouette: "IDOL!!" (tail to him) | shout |
| F06 | p39@"Otto" | 2.2 | bar door | Otto silhouette in straw hat | push | - | - | - | wind |
| F07 | p39+"long time" | 2.8 | calendar pages fly | Otto sil. | whip | - | - | - | pages |
| F08 | p39+"fix his life" | 2.6 | phone | phone Contact Home | push | - | - | phone screen "Home" (phone UI) | tone |
| F09 | p39+"before he calls" | 3.0 | phone | thumb hovers | push, hold 0.8 s | - | - | - | heart |
| F10 | p40@"deep under" | 2.0 | UW descent | none | dive | - | leads the way | - | whoosh |
| F11 | p40+"Sea People" | 3.0 | procedural village of glowing houses | silhouette crowd | wide, drift | none | swims into the crowd; they cheer, heart bubbles | - | crowd murmur |
| F12 | p40+"need Dave" | 1.9 | UW village | Quest p01 swims in, crowd turns | push | - | - | - | cheer |
| F13 | p41@"Every one" | 2.0 | tile board dark | 4 portrait tiles light up | push | - | - | - | ding x4 |
| F14 | p41+"the one thing" | 3.7 | tile board | each tile opens into a 1 s mini-gag: Duff cheers, Otto waves his hat, Sea People bubble, customer taps the bell [DF-F] | cuts every 1.2 s | - | - | - | pulse |
| F15 | p42@"four thousand" | 3.0 | avatar grid fills | 4,000 counter | pull back | - | - | narration counter "4,000" (narrator) | fill |
| F16 | p42+"job" | 2.2 | stamp | JOB stamp | thud | - | - | - | stamp |
| F17 | p42+"family" | 2.2 | stamp | plus one more figure, FAMILY stamp | push | - | - | - | hug |
| F18 | p42+"sushi bar" | 2.3 | bar party | Quest p10b with Leo cheer, Max laugh | pop in, camera bounce | none | window: laughing, tail slap | - | party horn, laugh |
| F19 | p43@"chores" | 2.4 | bar | sticky notes slap on Quest p10 | shake each | - | - | - | slap |
| F20 | p43+"fish farm" | 2.2 | icon | fish farm (our drawing) | cut | - | - | - | pen |
| F21 | p43+"rice paddy" | 2.0 | icon | paddy | cut | - | - | - | pen |
| F22 | p43+"Seahorse" | 2.2 | water | seahorse race | tracking | - | referee whistle | - | trot |
| F23 | p43+"Fair" | 2.2 | bar | Quest p10 holds notes, nods | push | - | - | - | ok sound |
| F24 | p44@"Cobra" | 2.2 | CITY | Leo front neutral (mirror of B22) | mirror push | - | - | - | sting |
| F25 | p44+"could leave" | 1.8 | BOAT dock | Quest p04 + rope (mirror of B26) | mirror of B26 | - | watches, calm | - | rope |
| F26 | p44+"never" | 1.6 | BOAT | he steps back | push | - | - | - | step |
| F27 | p44+"friends" | 3.3 | wood | polaroids: Cobra, Max, Pixie, dolphin | tilt, push | - | polaroid shows it with the contract (callback B21) | - | camera shutter |

## Block G · Why it works (payoff)  (27 shots, ~62.3 s, starts ~347 s)

| Shot | Trigger | Dur s | Background | Characters / pose | Camera | HUD | Dolphin | On-screen text (source) | SFX |
|---|---|---|---|---|---|---|---|---|---|
| G01 | p45@"millions" | 2.4 | CITY evening towers | none | push | - | - | - | city hum |
| G02 | p45+"come home" | 1.8 | CITY door | Quest lib | drift | - | - | - | door |
| G03 | p45+"two jobs" | 1.9 | LR; TV shows O2 dial | Quest lib sofa | push to TV | O2 dial on the TV screen (in-game) | - | - | power-on |
| G04 | p46@"working more" | 2.4 | dark paper | clock face overflows; MORE struck | push | - | - | - | strike |
| G05 | p46+"fits in a day" | 2.8 | paper | day bar sun->moon, snaps to a perfect fit | snap | - | - | - | click |
| G06 | p46+"day" | 1.7 | paper | bar locks | hold | - | - | - | lock |
| G07 | p47@"ends" | 1.4 | UW | O2 dial hits 0 gently | static | O2 dial | - | - | calm |
| G08 | p47+"can see" | 1.8 | UW | gauge full frame | push | O2 dial | - | - | tick |
| G09 | p47+"glad" | 2.0 | bar | Max smiles | push | none | window heart bubble pops | - | warm chime |
| G10 | p48@"Jeju" | 2.6 | bay dawn (NEW plate) | island silhouette stamp | push | - | leaps in morning light | narration stamp "Jeju Island, South Korea" (narrator) | gulls |
| G11 | p48+"morning" | 3.0 | bay dawn | fisher silhouette in boat | drift | - | - | - | oar |
| G12 | p48+"dinner" | 3.0 | bay dusk | same, lamps | match cut sun -> lamp | - | yawns | - | lamp |
| G13 | p48+"owner caught fish" | 3.6 | bar plate | plate | push | - | - | narration quote "the owner caught fish in the morning, and cooked them for dinner" (narrator, attribution "the director") | chime |
| G14 | p49@"One person" | 1.5 | bay | lone fisher | static | - | - | - | quiet |
| G15 | p49+"One day" | 1.5 | bay timelapse | sun arc | speed ramp | - | - | - | swoosh |
| G16 | p49+"hold in your hands" | 2.2 | EP003 fp_hands_pov holding nigiri | hands | push | - | - | - | soft |
| G17 | p50@"controller down" | 2.4 | LR | Quest lib sets controller; TV HUD fades | push | - | - | - | click |
| G18 | p50+"real job" | 2.6 | BR morning | alarm | snap | - | - | - | alarm |
| G19 | p50+"oxygen gauge" | 2.4 | OFF | Quest checks chest where the tank would be: nothing | push | - | - | - | wah |
| G20 | p50+"closing time" | 2.3 | OFF door 20:00 | no score card | pull | - | - | - | silence |
| G21 | p51@"tonight" | 2.4 | LR | Quest lib, TV glow | push | - | - | - | warm |
| G22 | p51+"clock out" | 2.2 | BOAT | Quest p01 surfaces | match cut | - | dozes | - | splash |
| G23 | p51+"closing time" | 2.0 | bar | CLOSED flip, lamps dim; EP003 fish yawns in the tank (cameo callback to E13) | push | - | - | - | bell |
| G24 | p51+"glad you came" | 1.9 | bar | Max waves (max_bar_34_laugh) | push | - | - | speech bubble from Max: "Thanks, Quest!" (tail to Max) | warm |
| G25 | p52@"Maybe" | 2.8 | LR | Quest tiny on sofa | pull back | - | - | - | warm |
| G26 | p52+"Not a second job" | 2.0 | LR | label struck | hold | - | - | narration stamp "second job" struck (narrator) | strike |
| G27 | p52+"first one" | 3.7 | bay night, moon | TV-off click then the bay at night | slow push; [DF-G] wink on the last word | none | smiles at the moon, winks at camera | - | quiet chord |

## Block H · CTA  (5 shots, ~10.5 s, starts ~409 s)

| Shot | Trigger | Dur s | Background | Characters / pose | Camera | HUD | Dolphin | On-screen text (source) | SFX |
|---|---|---|---|---|---|---|---|---|---|
| H01 | p53@"second shift" | 2.4 | UW night, wordmark | none | static | - | circles the "o" | wordmark | bubbles |
| H02 | p53+"deserves a why" | 2.6 | UW | controller silhouette + ? | pop | - | - | narration "why?" (narrator) | pop |
| H03 | p53+"comments" | 3.1 | phone comment box | typing dots, a reply pops every 0.8 s [DF-H] | push | - | - | phone screen comments (phone UI) | type, ping |
| H04 | p54@"Maybe" | 1.2 | UW wordmark with o + gold bar | wordmark | static | none | leaps from the water | - | rise |
| H05 | p54+"next quest" | 1.2 | UW | wordmark | static | none | leaps through the "o", splashes into the gold bar; NEXT QUEST lights | wordmark + NEXT QUEST end card | splash, chord |

## Dolphin build spec (props3d builder; our own design, never the game's art)
- **Look**: stylised bubblegum-pink bottlenose dolphin, toon shading + ink outline in the EP003 props3d house style; lighter pink belly, darker rose dorsal fin/flukes, soft round rostrum, small friendly proportions (head larger than real, chunky body). No resemblance to the game's dolphin sprite: our silhouette, our palette.
- **Face rig**: EP003 `fish2` eye/lid rig (lid 0..1, look [x,y], pupil highlight, sweat drop), eyes on the sides of the head but readable 3/4 and face-on; mouth line along the rostrum (smile/o/flat); blowhole puff on top.
- **Expressions (6)**: neutral, happy, worried, laugh, sleepy, wink.
- **Poses (6)**: swim side, swim 3/4, leap arc, blowing bubble ring (rostrum up, ring leaving the blowhole/mouth, heart-tinged), tangled in net (net wrapped around fin + tail, worried), peeking face-on (for tank/window shots, rostrum cropped by glass).
- **Output naming**: `public/art/davethediver/props3d/dolphin_<pose>_<expr>.png` (transparent, 1k; blink variant for each like `fish2_*`); extra FX: heart-tinged bubble ring sprite, net sprite, splash sprite (reuse EP003 blast/splash if present).
- **Needed combos**: swim side x neutral/happy/worried/sleepy/laugh; swim 3/4 x neutral/happy/worried; leap arc x happy; ring x happy/wink; tangled x worried; peeking x neutral/happy/laugh/sleepy/wink.
- **Rule**: water only; compositor adds waterline, ripples and refraction.

## NEW_ART (nothing generated; Producer approval before any credit is spent)
1. **Bar interior plate** (Higgsfield ~0.5-1.0): night, long wooden counter, globe lamps, neon, a large aquarium window at the right end. Our own design, no game art. Used B11, C12, E04-E32, F18, G09, G23.
2. **Bay exterior plate** (~0.5-1.0): dusk/dawn bay, limestone karst cliffs, calm water foreground for the dolphin, floating bar with lanterns. Used C04, E01-E03, G10-G12, G27.
3. **Quest in his own dive costume, extra poses** (optional, 0.5 each, pixel pass after): (a) front/3-4 startled "!" reaction (A09, D05); (b) seated/reclined on deck with sunglasses (B06) (can be faked with p04 + code overlay).
4. **Quest restaurant costume, extra pose** (optional, 0.5): serving a plate to a customer (E34, G24) (p10 tray run can substitute).
5. **Real-life Quest poses** only if missing in `quest.default.*`: laptop-typing, sitting on the bed with phone, checking chest (G19). Reuse first.
6. **Free, in code (no credits)**: dolphin (props3d), cabin boat (props3d), underwater scene, Blue Hole top-down, HUD, hermit crab in dump truck, Duff/Otto/Sea People silhouettes, village, punch-clock card, props, wordmark.

Supporting estimate: 1+2 at 1k = about 1.0-2.0 credits; with optional 3-4 up to 3.0 (balance 3.75 per handoff).

O2 HUD look VERIFIED from Producer screenshot 2026-10-19
