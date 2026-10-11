# EP003 · Hyperframes "dopamine" plan (2026-10-12)

Producer: "el EP003 pasa a Hyperframe… revisa con tus agentes si se puede cambiar alguna escena, mejorarla, darle vida y
dinamismo. dopamina para el espectador". Three review agents read every block (A–C, D–E, F–G); this is the merged plan.
Script LOCKED v3.2: no word changes; only visuals, visual timing and free sounds. All moves key off the narration words
(`W('l07.w2')`, staged from timings.json), so the v3 voice or Bram re-times everything automatically. Everything is free
(GSAP 3.14 + DrawSVG/CustomBounce/CustomWiggle shipped with Hyperframes, our props3d, CC0/our synths).

## Rhythm map
- **Spikes:** hook (0–36 s) · "Bought ×3" (l10) · failure montage + slap (l32–l33) · one phone → millions (l43).
- **Rests:** the silent boat (l24) · blue hour (l39) · the payoff (l44–l50).
- Every spike ends on a hard cut to the water/crickets bed. Rule: no shot holds > ~4 s without a change (framing, whip/match
  cut, scale punch, split screen, fish cutaway); quiet shots get an idle event (blink, ripple, drip) every ≤ 6 s.

## The 9 highest-impact changes (all adopted; Director's call, Producer can veto any)
| # | Block | Change | Trigger |
|---|---|---|---|
| 1 | A7 | Wordmark "The catch" in Hyperframes + the whole SFX bed ported (the sample is voice-only) | l07 "So,"/"why" |
| 2 | A4 | The 10 s numbers hold → three whip-panned shots; 10,000,000+ breaks the frame | l04 "eight"/"hoped"/"October"/"million" |
| 3 | C4+C6 | Type-and-delete: silence on "asking", "want to hang o…" backspaced on "admitting", then "It's eight dollars. Just get it." sends itself on "removes" | l18, l20 |
| 4 | D4 | The 13.9 s boat hold → 5 calm cuts; POV into the water: the fish looks back up at them | l24 |
| 5 | D5 | Evidence corkboard: whip pans golf → poker → garage, red X stamps in rhythm, strings to an empty 4th pin (the chat) | l25–l26 |
| 6 | E6 | Failure montage as a game run: "FAIL ×N" HUD counter, whip loop of pointing fingers, launch with speed ramp + reverse reveal | l32 |
| 7 | E7 | The slap with comic timing: wind-up in the pause, whip, 2-frame flash, 3-frame hitstop, shake (callback to the hook's slap) | l33 "slapping" |
| 8 | F8→G1 | One phone tiles to 256 phones, all "Bought.", counter to 10,000,000+, then a hard cut to silence and the black lake | l43 → l44 |
| 9 | G4+G5 | "I miss you" typed, deleted, replaced by "boat tonight?" → sent → "Bought."; end: the fish's heavy lid opens for once on "quest." (impressed), it dives, the splash lights NEXT QUEST | l50, l52 |

## The fish's arc (one reaction per appearance, at the frame edge, in pauses, ~every 40 s)
stare (A) → blink at "later" (B) → slow-blink at the dead chat (C) → looks up from the water (D) → list on its head,
sweat, wince at the slap (E) → rises from the trash can (F2) → chin on the rod, yawning (F5) → ignored, sinks (G2, the
one sad beat) → impressed, leaps (G5).

## Callbacks
Chat thread B "Just get it" → C cursor → E "remember the fish night?" → F5 Tuesday ping → F8 grid → G4 box ·
HOW TO FISH title type hook → G3 · the $7.99 swinging tag hook → F1 · number wheel hook → F6 clock → F8 ·
seats 4 (hook) → 2 (D/G) → ghost silhouettes (CTA) · book-end: a catch at the start, a rise at the end.

## Every other beat (per-block detail from the reviews)
- **A:** title punch on "Fish."; freeze 0.25 s on "nobody" then fast pull-back; speed-ramped slap; scope lock on
  "rifle"; continuous zoom-out to hundreds of boats on "Millions"; fish peeks on "Together".
- **B:** $7.99 struck on "not", card flips to a wax-seal invitation; one avatar alone in a spotlight, the rest slide in;
  game-box rain → match cut to the phone; scale punch + camera kick on each "Bought" (bigger each time, notify pitched up);
  0.6 s dead still after "later."; typing dots appear and vanish.
- **C:** split screen loud chat vs silent window; four phones side by side (no repeated phone framing); heart deflates on
  "three weeks"; calendar speed-ramp, thermometer, shake on "noise", chat flatlines on "dies"; doorway: door swings
  open with light, "Want to play?" handwrites, letters scatter on "lost", door slams on "Nobody".
- **D:** bobber + kinetic WHY FISHING?, slot reel of icons stops on a fish; split screen chat ✓ vs empty seats "?";
  polaroid flip + rack focus on the offended fish, faces circled one by one; phone pinned as the NEWEST alibi, the boat
  shrinks into the phone screen.
- **E:** tick punches; the list's anticipation then YEET overboard, the fish surfaces wearing it; inventory HUD with
  empty slots + crickets, guns/dynamite slam in, coin counter, slot reel to 0, Wallet faints (finally built), boss shadow
  with rumble; Steam quote as kinetic type ("(no real money)" small and late); GOAL struck → ALIBI stamp; FAILURE with
  silence then a desaturate hit; handprint overlay layer on Quest (art untouched); years wheel 2026→2031, lone message
  "THE SLAP", "???" + "seen" (callback to B).
- **F:** tag swings in and flips to FRIENDSLOP, FRIEND rises gold / SLOP drips, three stickers; the lid flips off on a
  spring, the four squeeze around the can; calendar pages tear off, "#1" sticker, sun match-cuts to F4 dusk; blue hour +
  crickets; Tuesday chat banner, "☐ FISH" checkbox repeat gag; clock number-wheel accelerating 1:00 → 1:47 → 3:12;
  founders in three page-turns (heart doodle, sales line crashes, line bounces up into a fishing line, stick-figure slap).
- **G:** the l44 question as a reflection in the water broken by one drip; fish hops hopefully, rack focus, sinks; the
  hook's title slam reused small and slow, FISH falls into the lake with a splash; crane-out (the only big move in G);
  CTA wide with the boat low-left (clear of the wordmark's path), ghost friends pop into the seats on "boat?", the wordmark
  rises from open water with the fish under the gold bar; CONTINUE? keeps ≥ 5 s (end screen).

## Defects found (fixed now, or fixed in the build)
- Sparkle cues left at l51 → removed from `scripts/ep003-sfx.py`. ✔
- F5 "always" marker keyed on the wrong word (l40.w23 "The") → l40.w26. ✔
- The Hyperframes hook still had the fish diving into the star → replaced by "The catch" in the build.
- F1 lid pop was a stub; G5 seat glows read as smudges; G5 wordmark rose through the boat → handled by the changes above.
- l44 "So..."/"why" shared one timestamp in the v2 alignment → re-checked with the v3 voice.
- HUD: ON for the in-game montage (E3/E6/E7), as the shot plan says (the block E docstring said off).

## Build order
1. Narration v3 lands → STT check → timings.json → `stage_assets.py` (words.js, mix with SFX).
2. One Hyperframes composition per block (A…G), shared components (chat, tag, number wheel, fish, boat, HUD, wordmarks).
3. Each block: render 720p, `framing_qc`, `style_bible` + `pacing_qc`, send the block clip (block-by-block rule).
4. Join, full review render; the final only with the Producer's approval.
