# EP004 · Hyperframes "dopamine" plan (2026-10-18)

Review of `SHOT_PLAN.md` against script A v2.3 (`scripts/A_v2_3_EN.txt`, treated as LOCKED: no word changes; only
visuals, visual timing and free sounds). Every move keys off narration words (`W('lNN.wK')` from timings.json). All
changes are free: GSAP/Hyperframes code, our props3d, our silhouettes, CC0 or synth SFX. No new paid art is added.

## Rhythm map
- **Spikes:** painted 33 (A ¶02) · "Not if. When." (C ¶21) · the cliff (D ¶31) · "You beat her" → silence (E ¶42–44)
  · pull-back to the canvas (E ¶47) · **new:** fight → hands match cut (F ¶53) · **new:** ribbon → burned ribbon,
  Maelle = Alicia (G ¶60) · petals flow back / the erasing (H ¶67, ¶70).
- **Rests:** ¶22 · journal ¶28 · funeral ¶35 · the uncleared room ¶51 · ¶63b · ¶78 · the morning ¶82 · ¶87–89.
- **Comedy (anticipation / hit / hold / reaction):** W "Probably" · ¶17 poster · ¶24 Napping · ¶37–39 rock/"Debatable"
  · ¶58 VILLAIN label (dry). None inside ¶20, ¶31–35, ¶48–51, ¶70–71, ¶85–89.
- Weak zone: F–G (4:33–6:49) had no spike in the plan; the two new spikes above fix it. Rule kept: no shot > ~4 s
  without a change; quiet shots get one idle event (rain, ember, page lift, blink) every ≤ 4–5 s.

## The 10 highest-impact changes (Director's call; Producer can veto any)
| # | Block | Change | Trigger ¶ |
|---|---|---|---|
| 1 | K | Motto is NOT a gold title card on black (reads as fan service). The journal page from ¶27 returns at dawn, Gustave's ink line small and sourced; on "after" the page turns to a blank next page. Silence, no sting | ¶89 "after" |
| 2 | D | Cliff staged by light and pose cuts: pose A (apart) / lightning cut / pose B (Gustave in front, arms out); cut away before the blow. "Doesn't get back up" = him lying, Maelle's ribbon kneeling, rain. ¶32 bubble only while he is visible, tail on him, small. Empty-spot hold ≤ 2.5 s with rain change | ¶31 "steps", "up"; ¶32 |
| 3 | D→F | ¶33 bubble split in two panels ("You won't yet understand." / "But this is a kindness…"). On ¶34 it tears off its tail and becomes a pinned paper slip (narration object, no tail). ¶52: the slip flies back and regrows its tail onto the old man, Aline appears behind him | ¶33, ¶34 "that", ¶52 "husband" |
| 4 | E | ¶46 replays A ¶02's exact brush framing: the hand was pushing back a black tide; it lets go and the tide is the ¶45 emptying seen from above (A→E callback, fixes "brush AWAY" staging) | ¶46 "holding it back" |
| 5 | C | Landing (¶20) is grief: HUD OFF; no sliding cut-outs. Rim lights go out one by one, ash/petals rise from each gap; Gustave cut to his knees on "falls apart" | ¶20 "gone", "apart" |
| 6 | G | G is the low-change block (8–11 s paragraphs). ¶60 ribbon match cut as a spike (1 frame white, silence hit); ¶61 wipe split on "In here"; ¶63 thread pulses on "soul" then cut; ¶64/¶65 one cut per sentence | ¶60 "Alicia", ¶61, ¶63 |
| 7 | F | ¶54 (15.8 s) in four beats: Renoir pose cut on "real father" / his bubble / one erase stroke on "erases" / the tower number ticks down on "every year…less". ¶55 harbor, Sophie's red scarf (callback) | ¶54, ¶55 |
| 8 | H | ¶67 petals re-form into named silhouettes, accent lights on each name: brass glint "Gustave.", red scarf "Sophie."; ¶70 one erasing stroke per name/noun (Lune, Sciel, Monoco, camp, song) | ¶67, ¶70 |
| 9 | H | ¶73 arguing comments only inside Quest's phone screen (our UI, no usernames) or as a narration tug-bar MAELLE ◀▶ VERSO; never a floating chat card | ¶73 "argue" |
| 10 | W | 13.8 s card → 4 states, one per sentence (FULL SPOILERS / "Never played it? Stay." / "Still playing?" pause icon / wait). Companion settles on "We'll wait", hit = lies down on "Probably", hold 0.8 s, reaction: one eye opens | ¶09 "wait", "Probably" |

## Per-block beat notes
- **A:** frame 0 = thumbnail; push through the eye on "goodbye". ¶02 stroke per syllable of "thirty-three". ¶03 petals
  on "petals", crowd at frame edge only. ¶04 hard stop + 1.2 s silent hold (breathing light only). ¶05 tutorial box is a
  generic in-world prompt (no console glyph), wiped on "goodbye". ¶06 three generic trophies (no award logos) on
  "Again"/"again"/"million", source label small and late. ¶08 companion flop = beaming, 1.5 s silence kept.
- **B:** lamps on "Iron/Cafés/coats" (3 framings). ¶11 pan stops on the one empty chair on "grey". ¶12 oldest figure's
  rim light dies on "next one to go". ¶13 cut back to the A harbor framing on "The woman is Sophie". ¶15 crosshair on
  "Kill her". ¶17: poster unfurls on "Which is" (anticipation), stamp thunks on "poster" (hit), hold 0.6 s, reaction =
  cut to Quest's deadpan close glance (free reuse of #7 framing or his silhouette).
- **C:** ¶18 Gustave's age as a number wheel "32" over him (not a luggage tag). ¶21 "Not if. When." stays INSIDE Lune's
  bubble ("if" struck inside it). ¶23 reveal: Quest silhouette, then the hill rises = Esquie (scale gag). ¶24 he dozes
  on the "..." and a snore puff lands on "Napping"; hold, Quest's look. ¶25 pen foley; ¶28 9.3 s: push + ember, page
  corner lifts, cut to the fire on "I don't need to live forever".
- **D:** ¶29 three 1.5 s appearances, nearer each time. ¶35 funeral: Lune's bubble (same shape as ¶21, callback);
  companion's hand AFTER the line; ≥ 1 s silence before ¶37. ¶37–39 two-shot Esquie + Verso, tails on each; "but…" =
  anticipation, "cool too" = hit; "Debatable." pops 0.5 s late, hold 1 s, Esquie puzzled blink. ¶40 stamp. ¶41 piano by
  two pose cuts; opera house drawn in sparks on "opera house" (plant for ¶69/¶71).
- **E:** ¶42 two hit-stops on "him"/"her"; ¶43 crack spreads on "worked"; ¶44 hard cut to silence on "takes it back";
  ¶47 pull-back on "actual painting"; ¶48 portrait, fire glow on "fire", stillness on "died"; ¶48b streak drains on
  "beside you". Companion absent; only the child's sketch by the easel.
- **F:** ¶49 Aline enters by light pour + cut (no glide). ¶50 strokes form son on "A son", husband on "A husband". ¶51
  the room, HUD off, no companion, no music swell. ¶53 match cut on "marriage" (spike). ¶57 split frame. ¶58 VILLAIN
  label hovers, finds nobody, falls out of frame quietly on "A villain."
- **G:** see change 6; ¶63b slow push on Quest (4.5 s + breath, one blink). ¶65 warm/cold back-to-back on "Both".
- **H:** ¶66 companion sits between doors AFTER "you choose". ¶69 ribbon crack on "costs her". ¶71 one lamp, empty
  opera (callback ¶41). ¶74 replay of D bubbles, but slower, at the empty camp at night, no stamp: bittersweet, not a gag.
- **J:** ¶75 sentence written, ¶76 smudged on "saving". ¶81 split hands on "person"/"promise". ¶82 three mornings, one
  per name; Quest waking = callback to his sofa in ¶07. ¶84 one object per noun. ¶85: he picks up the rock in the pause
  after ¶84, and steps out of frame on "disappear" (never during the line's words as a reaction).
- **K:** ¶88 opening harbor from the opposite angle; Maelle leaves by 3 cuts, smaller each time, swallowed by dawn
  light (no walking glide). ¶89 = change 1. ¶91 "o" returned, end screen ≥ 5 s.

## Companion arc check
A beaming → W yawn/sleep → C reveal, asleep → D wet-eyed (¶35) then puzzled (¶39) → E sketch only → F: **drop "asleep
beside the canvas"** (grief block; the sketch is enough) → G absent → H between the doors → J keeps the rock, leaves →
K returns the "o", leaves. Gap ¶40→¶66 (~3 min) is deliberate restraint through the reveal; keep it.

## Callbacks
Harbor ¶01 → ¶13 → ¶55 → ¶88 · brush ¶02 → reversed ¶46 · tower number ¶02 → ticks ¶54 · petals out ¶03/¶45 → back ¶67 ·
"Tomorrow comes" ¶14 → ¶83 · Lune's bubble ¶21 → ¶35 · journal ¶27 → ¶75 → ¶80 → ¶89 (blank page) · pinned slip ¶34 →
¶52 · rock ¶38 → ¶74 → ¶84/¶85 · opera sparks ¶41 → ¶69 → ¶71 · red ribbon ¶31 → ¶60 → ¶69 → ¶88 · Quest's sofa ¶07 → ¶82 ·
the "o" filled (A) → empty/returned (K).

## Defects found
- Script header still reads "MASTER CANDIDATE v2.3 — NOT LOCKED" while the plan calls it LOCKED: lock or relabel.
- Lore: ¶16 board counts DOWN (32, 31, 30); past expeditions had HIGHER numbers (34, 35, 36…). The "32" luggage tag will
  read as an expedition number.
- 4b: ¶32 bubble after the cut-away has no visible speaker; ¶34 pinned bubble floats detached; ¶73 comment counter is a
  floating chat UI; ¶21 kinetic quote outside Lune's bubble. All fixed above.
- Fake actions (gliding poses): ¶20 falling silhouettes, ¶31 step, ¶49 step-in, ¶88 walking away → pose cuts or light.
- Cast list lacks Sciel and Monoco (needed ¶70, never introduced): generic free silhouettes, no Gestral likeness.
- Timing: block lengths equal pure word time at 148 wpm (A 25.9, W 13.8 … K 34.5 s); planned silences (¶04, ¶08, D hold,
  rests, K) are not included → starts drift +15–25 s, runtime ~9:40. Long single beats needing changes: ¶54 15.8 s,
  ¶31 13.8, ¶41/¶52/¶70 12.2, ¶69 11.4, ¶48/¶63 10.9, ¶88/¶90 10.1, ¶28/¶33 9.3.
- Spoilers: A/W are premise-only (OK); keep Verso, Maelle, Aline, studio and portrait out of A/W and the thumbnail.
- IP: generic trophies, no award/console logos; do not push Esquie "closer" to the game model; OST Content ID risk stands.
- C ¶18 "Quest beside him" depends on tier-2 #9: fallback = our free Quest coat silhouette.
