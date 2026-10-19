# Dave the Diver · "Dopamine" plan (2026-10-19)

Reviewer pass over `SHOT_PLAN.md` (159 shots, ~6:59 estimated; no timings.json yet). Script LOCKED v1.1: no word changes; only visuals, visual timing and free sounds. All moves key off narration words (`pNN@word` triggers), so the real timings re-time everything. Everything is free (GSAP, props3d, procedural UW, our synths). Fixes marked [DF-x] are already applied in SHOT_PLAN.md.

## Rhythm map
| Block | Spikes | Rests | Notes |
|---|---|---|---|
| A Hook (0-40 s) | A05 through-the-TV match cut, A08 harpoon "!" + reel, A09 low-O2 alarm + net cut, A14 odometer slam, A20 wordmark ring | A11-A12 empty room, A21 1.5 s silence hold | 21 shots in 40 s, avg 1.9 s |
| B Meet (60 s) | B02 hero sag, B10 drool + splash, B19-B21 contract stamps (pitch climbs), B25 chair gag | B06 sleepy deck, B27 "Hold on" silence | stamps are the rhythm section |
| C Cozy (44 s) | C05 record scratch, C08 squid vs bus, C10 shark bite hitstop + red flash | C01-C04 cozy music box, C14 sofa | cozy->danger->Monday is an up/down/up shape |
| D Day (64 s) | D03 into the hole, D08 O2 red alarm, D18 overweight RED, D21 fall to 800 m | D10 dive log hush, D22 black + sonar | numbers carried by the HUD, not by cards |
| E Night (74 s) | E05 glasses flash, E09 shark head chord, E13 terrified catfish + dolphin, E16 speed ramp | E04, E25-E28 folders, E34 warm | longest block: three mini-arcs (Bancho, floor, dinner) |
| F Needed (64 s) | F05 "IDOL!!", F14 tile mini-gags, F18 party, F22 seahorse race | F09 thumb hovers, F25-F26 rope | portrait list is the danger zone |
| G Payoff (62 s) | G05 day-bar snap, G12 sun->lamp match cut, G19 empty chest | G14, G25-G27 | quiet by design, 3 events in the last 8 s |
| H CTA (10 s) | H05 leap + splash | none | end screen holds >= 5 s afterwards |

Rule: no shot holds > ~4 s without a change (max 3.9 s); every spike ends on a cut to a rest.

## Comedy beats (anticipation - hit - hold - reaction)
| Beat | Anticipation | Hit | Hold | Reaction |
|---|---|---|---|---|
| B02 hero pose | Dave puffs his chest | sags like a wet sock | 0.4 s | dolphin winks |
| B10 sushi drool | eyes sparkle on the nigiri thought | drool + eyes heart | 1 s | dolphin face-palms = splash |
| B25 empty chair [DF-B] | Quest eyes the chair | chair swivels away, name card falls | 0.4 s | Quest slumps |
| C07 hermit crab | push to a dump truck | crab pops out and honks | 0.3 s | Dave peeks, dolphin eyes wide |
| D18 overweight | box goes on | "9.2/9.0kg" turns RED, Dave sags | 0.5 s | dolphin pushes, strains |
| D24 bigger tank | "bigger" | tank dwarfs Dave | 0.4 s | dolphin laughs bubbles |
| E13 catfish (EP003 fish) | knife glint | fish2 wide -> wince -> sweat | 0.5 s | dolphin face-on at the window, delighted |
| G19 no gauge | Quest checks his chest | nothing there | 0.6 s | "wah" |
| F22 seahorse race | gates open | seahorses trot | - | dolphin referee whistle |

## Callbacks
- **Cobra**: B22 (front neutral, snap push) / B26-B27 (rope, "Hold on to that") -> F24-F27 same framings mirrored, contracts turn into polaroids. B21 contract on the dolphin's fin -> F27 polaroid.
- **Dolphin arc** (tangled A07 -> freed A09 -> follows B-D -> peeks E -> crowd F -> wink G27 -> leap through the "o" H05): one reaction about every 40 s, always in water. Book-end: A20 ring becomes the "o"; H05 leap + splash into the gold bar.
- **Catfish / fish cameo**: tank empty at B11 ("no fish") -> terrified at E13 -> yawns at G23.
- **O2 dial**: A09 (red) -> C10 (bite) -> D08 (runs out) -> D17 (90 -> 480) -> G03/G07 (on a TV; real life has none, G19).
- **Sit Back and Relax** (A19 deflate) -> G25 tiny on the sofa. **Dive Log "one thing"** (D10) -> E33-E34 "A dinner. For someone."

## Weakest moment per block + the free fix (all applied)
| Block | Weakest | Free fix |
|---|---|---|
| A | A14 numbers (3.9 s of a counter) | [DF-A] odometer clicks up with pitch, 0.25 s hitstop + shake on the last digit, then the pull-out to the windows (A15) |
| B | B25 talking-head "meeting you weren't in" (3.6 s) | [DF-B] anticipation-hit-hold-reaction chair gag |
| C | C09 static HUD close-up (2.8 s) | [DF-C] O2 number ticks down in heartbeat rhythm + 1-frame shark eye flash |
| D | D22 black hold at 800 m | [DF-D] sonar ping lights two huge lantern-fish eyes, blink, gone |
| E | E30 diagram "focus on each half" | [DF-E] spotlight swaps every 0.9 s with icon bounce |
| F | F14 portrait tile list (3.7 s) | [DF-F] each tile opens a 1 s mini-gag (Duff cheers, Otto's hat, bubble, bell) |
| G | G27 final quiet hold (3.7 s) | [DF-G] TV-off click + dolphin wink on the last word |
| H | H03 comments (3.1 s) | [DF-H] a reply pops every 0.8 s |

## Top 3 overall
1. D18 overweight-in-red gag (the HUD itself is the joke; numbers 9.2/9.0 -> 185).
2. Dolphin heart-bubble ring -> "o" (A20) with the 1.5 s silence, paid off by the leap (H05).
3. Cobra mirror callback (B22-B27 -> F24-F27) and the sun->lamp match cut (G12).

## Risks / uncertain
- No timings.json: all durations estimated (2.45 w/s + 0.35 s); the placeholder wav is faster (348 s vs ~419 s).
- Bar/bay plates are MISSING (fit <= 1.0): E and C04/G10-12 depend on NEW_ART.
- F is the weakest block structurally (silhouette cast for Duff/Otto/Sea People is code-drawn; check they read as characters).
