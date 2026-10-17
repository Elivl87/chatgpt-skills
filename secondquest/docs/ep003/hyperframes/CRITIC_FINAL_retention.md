# EP003 v3.3.3 · Retention critic · FINAL check (0–328 s)

Critic: independent retention pass (long-form adaptation of `.claude/skills/shorts-retention-critic`). I did not build
the piece and edited nothing in it. This re-checks the FIX list in `CRITIC_RETENTION_v333_full.md` against the new cut.

Input:
- `EP003_full_hyperframes_review.mp4` at `246960a` (md5 `acc90682…`, 1280x720, 30 fps, picture 328.4 s, audio 327.06 s).
  The block re-renders committed afterwards in `ed1089f` are the ones this review was joined from (10:37–10:53 vs 11:03).

Method:
- **Sound:**
  - RMS per 10 ms of the review audio.
  - "Gap floor" = mix level while the narration stem (`audio/narration.wav`) is below −50 dBFS.
  - The review audio is `audio/mix.wav` (cross-correlation 0.99–0.998 at 50/150/270/310 s, lag 1 ms), so the SFX stem and `build/ep003_sfx_cues_all.json` are valid evidence for single cues.
- **Picture:**
  - Per-frame mean difference at 160x90 for all 9,852 frames, both inside this cut and against the `7c0e4b3` cut I reviewed last time. That shows exactly which seconds changed.
  - Contact sheets at 0.5 s for every changed region (116–123, 130–137, 144.5–151.5, 181.5–188.5, 257–271, 291–300.5, 233.5–241) and at 1 s for 201–217, 272–293 and 304–328.4.
  - Luma per frame for the F→G black.
- **0–66 s:** A/B per frame and per 0.1 s audio against `e221673`, the cut `CRITIC_RETENTION_v332_hook.md` passed.

## Verdict: **PASS**

Both required fixes are in and they measure right. Every recommended item that was claimed is on screen at the claimed word.
- The body now sits on the same bed as the hook.
- The false ending is broken.
- No stretch scores ≤1 for more than ~4 s anywhere in 66–328.
- The mean of 66–328 rises from 2.08 to **2.18**.

Two small polish notes for the master are below. Neither blocks.

## 0–66 s regression check: none

- **Picture vs `e221673`:** max per-frame mean difference **2.1/255** (mean 0.8).
  - Nothing is above 1.7 except encoder noise.
  - Block C's opening (63.9–65.9) is at 1.5–1.7, the C design fixes already seen last round.
- **Sound vs `e221673`:**
  - Per 0.1 s: mean |Δ| 0.09 dB, and only two windows differ by more than 1 dB. Both are at C's head:
    - 64.6: −3.0 dB
    - 65.5: −8.6 dB (−30.0 → −38.6, still bed level)
  - 0 exact-zero windows.
  - Under −45 dBFS: only the first 0.1 s and the designed "So, why?" rest (39.07–39.3+).
- **Status:** the opening still PASSES.

## Builder claims, verified

| Claim | Measured / seen | Status |
|---|---|---|
| C–G beds continuous, gaps −34 to −38 dBFS | Gap-floor median 60–328 s **−37.6** (p10 −41.2). C −37.6 · D −38.0 · E −37.7 · F −38.0 · G −36.5 (A −34.8, B −35.0). Every 2 s bin −28 to −42. | ✔ |
| Nothing below −45 | Gap windows < −45 in 60–328: **9 of 5,294**. One is at 230.65 (a single 10 ms window). The other eight are at 326.81–327.05, the fade into the audio end (see note 1). | ✔ (except the tail) |
| No digital silence 60–328 | **0** exact-zero 10 ms windows in the whole file. Joins (±0.8 s) bottom out at −40 to −44.5 dBFS: 61.8, 66, 105.3, 106, 162.6, 163.3, 238.6, 239.3, 292.6, 294. | ✔ |
| F "end too" punch-in | 259.0–260.0 wide → **260.5 crew clearly larger** (punch-in), word at 260.02. | ✔ |
| F move on "never what they were for" | 261.5–262.5 the frame slides out and across while the light drops. | ✔ |
| F night by "Some games" | Blue night at **262.5–263.0**, stars and moon up before "Some" (263.54). | ✔ |
| "Max: on?" banner on "same boat" | Banner first visible at **266.0**, notify cue 265.92 ("same" 266.02). Reads "The boat · Max: on?". | ✔ |
| Cue at 277.1 (clock roll) | In the stem at 277.12: −36.5 dBFS against a −43 bed, +6.5 dB. In the mix it sits ~20 dB under "never". On a phone it is felt more than heard, which is fine for a texture cue. | ✔ (subtle) |
| Cue at 285.3 ("oof." drain) | Stem −32.9 against a −45.2 bed. It lands in the breath after "well." (285.16), so it is clearly audible: the mix goes from −37 bed to −27.5. | ✔ |
| Polaroid push from "Most" | The polaroid grows from 119.5 to 122.0. The red circles land at the end of the move (122.0). | ✔ |
| Bobber cut ~1 s earlier, fish on "fish" | Oar → bobber cut between 132.0 and 132.5 (was 133.6). The fish breaks the surface at **134.0** with its splash cue ("fish" 134.25). The "a reason" tag follows at 136.5. | ✔ |
| Garage clock push | 146.5–148.0 push in to the wall clock; 148.5 back out; 149 board. | ✔ |
| Steam quote mark on "Steam" | The label is at 183.0 and the **“ mark lands at 183.5** ("Steam" 183.67). | ✔ |
| G question upright in the sky | From 294.0 "SO… WHY DID MILLIONS OF PEOPLE / BUY A FISHING GAME / AND NOT FISH?" builds upright above the moon line, word by word. The mirrored copy is its dimmer reflection. The drip (298.5) breaks only the reflection. Readable at phone size. | ✔ |
| F→G black ≤0.55 s | Luma 7 from **292.73 to 293.37 (0.63 s)**, then the lake fades up (293.4–294.0), on the bed. That is 0.08 s over the claim and inside my ≤0.7 s ask. | ✔ |

Also seen: the E design fixes (FAIL ×1 top-left, eye shot, the line-up hard cuts, 2031 right of the phone) and the G fixes (the title fades in place, Pixie's avatar, the fish's low dive under the wordmark). They change design, not pacing.

## Sound beds C–G (measured)

| Block | Time | Gap floor median (prev) | p10 | min |
|---|---|---|---|---|
| A hook | 0–40.8 | −34.8 (−35.1) | −51.0* | |
| B | 40.8–61.8 | −35.0 (−35.2) | −38.7 | −43.5 |
| C | 61.8–106.0 | **−37.6** (−61.3) | −40.4 | −44.9 |
| D | 106.0–163.3 | **−38.0** (−59.5) | −41.5 | −44.5 |
| E | 163.3–239.3 | **−37.7** (−57.9) | −41.4 | −45.3 |
| F | 239.3–294.0 | **−38.0** (−57.1) | −41.3 | −44.3 |
| G | 294.0–328.4 | **−36.5** (−54.7) | −40.6 | −58.8 (tail) |

\* A's p10 comes from the opening 0.1 s and the designed "So, why?" rest. Both are unchanged.

- The 1:06 cliff is gone: 62–64 −40.4 → 64–66 −37.6 → 66–68 −37.4 → 70–72 −37.5. The step is ~2 dB, not 25.
- The body is ~2–3 dB under the hook's bed. That is a sensible "settle" after the hook, not a drop.
- SFX: 49 cues after 60 s, 12.4/min C–G, on budget. The cue gaps over 10 s are now on an audible bed, so they no longer read as dead air:
  - 113.8–134.0
  - 144.8–158.3
  - 181.0–199.6
  - 221.5–235.5
  - 265.9–277.1 (was 266.8–288.4, 21.6 s)
  - 298.5–311.6

## Attention curve, 66–328 s (0–3 per 2 s)

Key:
- **3** = new and meaningful
- **2** = purposeful motion keyed to the words
- **1** = ambient only, or a hold
- **0** = nothing or confusion

The gap floor is the mix level in the narration gaps of that bin. "—" means the bin had no narration gap of ≥50 ms.

Bins whose picture did not change against `7c0e4b3` keep last round's picture score: the per-second max difference there is ≤2/255. "[was n]" marks a changed score.

| t (s) | score | gap floor (dBFS) | on screen |
|---|---|---|---|
| 66–68 | 3 | -37.4 | "Yes! Definitely." / "I'm free in three weeks" pop in sync |
| 68–70 | 3 | -37.2 | 3 WKS tags; four phones |
| 70–72 | 3 | -37.5 | calendar flips to 3 WEEKS LATER (71.5) |
| 72–74 | 3 | -37.5 | thermometer, "sorry, kid's sick" |
| 74–76 | 3 | -37.7 | fever 102.4; car CLUNK (75.9) |
| 76–78 | 2 | -37.8 | chat recap |
| 78–80 | 2 | -29.0 | ECG flatline (78.2); fish past the phone |
| 80–82 | 2 | -38.3 | phone scrolls back, greyed |
| 82–84 | 2 | -37.4 | map, two pins; THE HARD PART? (83) |
| 84–86 | 1 | -38.2 | map holds; dashed path |
| 86–88 | 3 | -37.3 | clock; NOT IT stamp (86.5) |
| 88–90 | 2 | -37.9 | Message bar, ASKING, typing |
| 90–92 | 2 | -39.7 | "want to hang o", deleted |
| 92–94 | 1 | -37.0 | bar empties; door (92.5) |
| 94–96 | 1 | -41.4 | closed door, light under it |
| 96–98 | 3 | -37.7 | door opens (95.3): "Want to play?" |
| 98–100 | 1 | -37.9 | hold on the kid |
| 100–102 | 2 | -37.9 | desaturates; door slams (100.6) |
| 102–104 | 2 | -38.1 | "It's eight dollars. Just get it." typed |
| 104–106 | 2 | -37.1 | $7.99 stamps (104.6); join on bed now, no digital silence |
| 106–108 | 3 | -37.1 | D: WHY FISHING? (106.5) |
| 108–110 | 3 | -36.0 | slot reels stop on fish (108.8) |
| 110–112 | 2 | -40.5 | split chat / empty boat; $7.99 PAID (110.2) |
| 112–114 | 2 | -37.5 | SOLVED check (113.2) |
| 114–116 | 2 | -39.2 | WHAT TO DO THERE? "?" (113.8) |
| 116–118 | 2 | -37.1 | polaroid develops |
| 118–120 | 2 | -37.9 | photo appears; push starts on "Most" (119.5) [was 1] |
| 120–122 | 2 | -37.3 | push continues onto the faces [was 1] |
| 122–124 | 3 | -37.3 | red circles land at the end of the push; cut to boat (123) |
| 124–126 | 2 | -36.2 | split close-ups |
| 126–128 | 2 | -36.9 | boat, "..." bubble |
| 128–130 | 2 | -37.7 | underwater fish (129) |
| 130–132 | 2 | -37.6 | fish blinks; boat behind the oar (130.8) |
| 132–134 | 2 | -40.5 | cut to the bobber on "fine" (~132.3) [was 1] |
| 134–136 | 3 | -39.0 | fish surfaces on "fish" (134.0) + splash [was 1] |
| 136–138 | 3 | -38.0 | "a reason" tag (136.5) |
| 138–140 | 3 | -38.0 | JOB badge (138.2); board whips in |
| 140–142 | 3 | — | ALIBIS slaps (140.7) |
| 142–144 | 2 | -38.5 | golf |
| 144–146 | 2 | -37.1 | poker, chips topple (144.8) |
| 146–148 | 2 | -41.4 | garage; camera pushes to the wall clock (146-148) [was 1] |
| 148–150 | 2 | -37.5 | pulls back out; cut to the board (149) [was 1] |
| 150–152 | 1 | -38.4 | board holds |
| 152–154 | 2 | -38.0 | red Xs |
| 154–156 | 2 | -41.2 | "?" slot opens |
| 156–158 | 1 | -38.6 | slot holds |
| 158–160 | 3 | -41.9 | phone slams in (158.3); NEWEST |
| 160–162 | 2 | -38.5 | photo flies in |
| 162–164 | 2 | -38.5 | ping (162.0); join on bed |
| 164–166 | 1 | -37.2 | E: crew wide holds |
| 166–168 | 2 | -36.8 | "Alibi props" list, ticks |
| 168–170 | 2 | -36.9 | ticks |
| 170–172 | 2 | -36.5 | fish surfaces |
| 172–174 | 3 | -38.9 | fish yeets the list, splash; HUD |
| 174–176 | 2 | -37.0 | seashell slot |
| 176–178 | 3 | -37.6 | DYNAMITE slam (176.8) |
| 178–180 | 3 | -32.0 | SELL, +$1,250 |
| 180–182 | 3 | -28.3 | roulette, wallet faints, boss shadow |
| 182–184 | 1 | -37.4 | blur out; label (183.0); quote mark on "Steam" (183.5) |
| 184–186 | 1 | -36.9 | blurred plate, label + quote mark only |
| 186–188 | 2 | -39.2 | quote types word by word |
| 188–190 | 2 | -39.3 | quote |
| 190–192 | 2 | -40.5 | cut to GOAL sign (190.9) |
| 192–194 | 2 | -38.6 | sign settles; fish |
| 194–196 | 2 | -38.3 | GOAL struck |
| 196–198 | 3 | -37.8 | ALIBI stamp; fish dives; cut wide |
| 198–200 | 1 | -40.3 | wide boat, gull |
| 200–202 | 3 | -37.0 | FAILURE. (199.6) |
| 202–204 | 3 | -34.5 | falls in, FAIL x1 card top-left |
| 204–206 | 3 | -37.6 | dynamite in hand |
| 206–208 | 3 | -38.1 | roulette ALL IN |
| 208–210 | 3 | -38.2 | -$3,480; line-up hard cut |
| 210–212 | 2 | -38.1 | "?" line-up; fish |
| 212–214 | 3 | -40.9 | launched across the island |
| 214–216 | 2 | -36.6 | giant eye |
| 216–218 | 2 | -37.6 | boat, teammate down |
| 218–220 | 2 | -40.6 | "Pick up" prompt |
| 220–222 | 3 | -40.7 | THE SLAP (220.8) |
| 222–224 | 3 | -36.5 | REVIVED! |
| 224–226 | 1 | — | pan off to empty water |
| 226–228 | 2 | -36.6 | cut to the photo (226.3) |
| 228–230 | 1 | -39.6 | "perfect day" photo greys |
| 230–232 | 3 | -41.0 | photos fly in |
| 232–234 | 3 | -37.8 | 2031 rolls in |
| 234–236 | 2 | -42.0 | phone slides in |
| 236–238 | 2 | -41.6 | THE SLAP posts (235.5); typing |
| 238–240 | 2 | -38.7 | "???" (237.4) holds; F sign swings in (239.3), on bed |
| 240–242 | 1 | -38.9 | blank yellow sign swings |
| 242–244 | 2 | -38.2 | FRIENDSLOP lands (242.4) |
| 244–246 | 2 | -37.8 | FRIEND/SLOP restyle |
| 246–248 | 2 | -41.2 | CHEAP / CHAOTIC / CO-OP |
| 248–250 | 3 | -39.0 | four friends pop up (247.5) |
| 250–252 | 2 | -41.5 | pan |
| 252–254 | 3 | -37.9 | lid flips (251.4) |
| 254–256 | 2 | -36.8 | PLAYTIME bar |
| 256–258 | 2 | -32.8 | JUNE calendar, pages fly |
| 258–260 | 3 | -39.1 | #1 stamps (258.2); cut to boat (258.8) |
| 260–262 | 2 | -37.3 | punch-in on the crew on "end too" (260.0) [was 1] |
| 262–264 | 2 | -36.0 | move out/across on "never"; night is down by 263 [was 1] |
| 264–266 | 1 | — | night drift, lantern; notify + banner at 265.9 [was 1] |
| 266–268 | 2 | -39.2 | "Max: on?" banner on "same boat" |
| 268–270 | 2 | -36.5 | arms up; FISH sign |
| 270–272 | 2 | -38.2 | fish leaps past the sign |
| 272–274 | 2 | -36.4 | living room; clock 12:41 |
| 274–276 | 1 | -37.3 | clock holds at 1:00 |
| 276–278 | 3 | -37.8 | LAST ROUND; clock races with the roll (277.1) |
| 278–280 | 3 | -37.9 | 3:12, cans; yearbook (279) |
| 280–282 | 2 | -38.3 | founders |
| 282–284 | 2 | -38.4 | heart; graph page |
| 284–286 | 3 | -30.4 | line rises, crashes "oof." with drain (285.3) [was 2] |
| 286–288 | 2 | — | doodle boat draws [was 3; the crash sits in the bin before] |
| 288–290 | 2 | -37.3 | doodle slap (288.4) |
| 290–292 | 3 | -41.0 | phone -> wall of phones -> counter |
| 292–294 | 1 | -40.0 | 10,000,000+ (292.0); 0.63 s black on bed, night lake fades up (293.4) |
| 294–296 | 2 | -34.7 | G: question builds UPRIGHT in the sky, word by word [was 1] |
| 296–298 | 2 | -37.8 | question completes; reflection below |
| 298–300 | 3 | -35.2 | drip breaks the reflection (298.5); "Because nobody..." (299.3) [was 2] |
| 300–302 | 2 | -39.7 | fish surfaces |
| 302–304 | 2 | -37.6 | FISH-O-DEX |
| 304–306 | 2 | -35.1 | "fishing tuesday?" bubble |
| 306–308 | 2 | -39.3 | HOW TO FISH title |
| 308–310 | 1 | -34.9 | TUTORIAL tag; title holds |
| 310–312 | 2 | -37.4 | FISH struck, splash (311.6); title fades in place |
| 312–314 | 1 | -35.9 | empty message bar, cursor (designed suspense) |
| 314–316 | 2 | -34.8 | "I miss" (315.0) |
| 316–318 | 3 | -35.6 | "I miss you" deleted -> "boat tonight?" |
| 318–320 | 3 | -35.9 | sent; "Bought." (318.0) |
| 320–322 | 2 | -36.2 | lake; crew in the boat |
| 322–324 | 3 | -36.7 | SecondQuest wordmark rises (321.6-322) |
| 324–326 | 2 | -35.5 | end card (CONTINUE? / NEXT QUEST / JOIN THE PARTY) |
| 326–328 | 2 | -36.6 | fish jumps, dives (326.9); audio ends 327.06, picture 328.4 |

**Means:**
- 66–328: **2.18** (was 2.08).
- By block: C 2.15 · D **2.21** (1.97) · E 2.24 · F **2.11** (2.00) · G **2.12** (2.00).
- 0 bins at 0. There are 18 bins at 1 (was 27).

All of these holds now sit on a −36 to −41 dBFS bed, so the ones that remain read as breaths, not drops.

## Stretches at ≤1 longer than ~4 s: **none**

The low-motion detector (frame difference < 0.25 for ≥ 2 s, 66–328) finds only **312.2–314.8**, the designed cursor wait before "I miss". Keep it.

| Last round | Now |
|---|---|
| 258.8–267.0 dusk drift (8.2 s) | Gone. The punch-in 260.0, the move 261.8, night by 263 and the banner 265.9 leave at most ~2.4 s of night drift (263.5–265.9). |
| 145.3–151.3 garage / board (6.0 s) | Gone. The clock push and the pull-out run 146.5–148.5; the board holds 149–152 (3 s). |
| 131.0–135.5 oar / bobber (4.5 s) | Gone. The cut moved to ~132.3 and the fish is up at 134.0. |
| 117.8–121.9 polaroid (4.1 s) | Gone. The push runs 119.5–122. |

The remaining near-misses (3–4 s, not blocking):
- **182.3–186.1 (3.8 s)**, the blurred plate before the Steam quote. The “ mark at 183.5 now splits it into 1.2 s + 2.6 s. Acceptable.
- 92.5–95.3 (2.8 s), the closed door. It is the set-up for the door opening; keep it.
- 292.73–293.37 black (0.63 s) + the lake fade-up. A designed rest, on the bed.

## Re-hooks

The main loop "So, why?" opens at 38.9 and closes at 299.3.
- The longest gap between 3-beats is still F, **258.2 → 276.0**.
- That stretch is now 2s throughout: punch-in, move, nightfall, banner, the FISH sign, the fish leap, the clock. It is no longer a false ending.
- Every other block keeps its 60–90 s re-hook cadence from last round.

## Payoff and end card

- **The question (294–298.6)** is now readable upright, word by word, and the drip lands on "fish?". The answer starts on the next beat (299.3). This was a near-miss last round; it is now the clean re-statement the payoff needs.
- **"I miss you" → "boat tonight?" → "Bought."** is unchanged and still the strongest beat of the episode:
  - an empty bar (312–315)
  - "I miss yo" typed by 315.0
  - deleted by 316–317
  - "boat tonight?" sent; "Bought." returns at 318.0 with the single notify (317.9)
- **"Who would you put in your boat?"** The crew is back in the boat from 319. A quiet, earned image.
- **End card.**
  - The wordmark rises at 321.6–322, and CONTINUE? / NEXT QUEST / JOIN THE PARTY hold to 328.4 (~6 s). That is enough for the YouTube end-screen elements.
  - The fish peeks at 323, pops its "!" at 326 and dives at 326.9.
  - It does not drag. PASS.

## Remaining notes (polish, non-blocking)

1. **The audio ends 1.34 s before the picture: 327.06 vs 328.4.**
   - This is the same in `e221673`, in `7c0e4b3` and in the master `EP003_full_hyperframes.mp4`, so it is not a regression.
   - Its effect is that the end-card fish dive's splash cue (326.9) gets only ~0.16 s before the stream stops. The mix there is −36.7 → −52 dBFS, so the last gag is nearly silent and the last ~1.3 s is hard silence.
   - Fix for the publish master: pad the mix to 328.4 with the night bed (crickets/water) and let the splash ring out. Or end the picture with the audio.
2. **The 277.1 clock roll is very quiet** (~20 dB under the voice on "never"). The race reads visually anyway. Optional: +4–6 dB.
3. The "a reason" tag vs the fish's eye at 136.5 is a design item the builder already listed as not done. It does not affect retention.

## Calibration (LEARNINGS §6)

Predictions for the 72 h curve:
- No cliff before 0:05.
- **No step at ~1:06.** The bed is now continuous.
- No dip at 4:15–4:30. The false ending is broken.
- At most a mild sag around 2:00–2:15.
- A flat line or a small bump from 4:59 to the end.

If a step at 1:06 or a dip at 4:20 still shows, the cause is the content of those passages, not the sound floor or the camera. The rubric should then weight writing over mix and coverage.
