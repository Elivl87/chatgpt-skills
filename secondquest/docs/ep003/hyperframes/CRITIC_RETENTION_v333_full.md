# EP003 v3.3.2 · Retention critic · full episode (0–328 s)

Critic: independent retention pass, adapted from `.claude/skills/shorts-retention-critic` to long form. I did not
build the piece and edited no file. The question: would a viewer who clicked from Home stay to the end?

Input:
- `EP003_full_hyperframes_review.mp4` at `7c0e4b3` (md5 `5a67bc39…`, 1280x720, 30 fps, 328.4 s).
- Block E was re-rendered after that, in `b08114c`. Its picture matches the review (mean diff 0.9/255 at 2 fps, max 1.6), so this verdict covers it too.

Method:
- **Picture:** frames every 0.5 s for 66–328 s, viewed as labelled contact sheets. Full-size stills at 183.8, 264.0, 298.1 and 320.5. Per-frame mean absolute difference at 160x90 for all 9,852 frames, which gives the cuts, the freezes and the low-motion runs. Luma per frame (1/30 s) at the 10 biggest cuts and the 4 block joins.
- **Words:** `episodes/ep003/timings.json`.
- **Sound:**
  - RMS per 10 ms of the review audio. The "gap floor" is the mix level while the narration stem is below −50 dBFS.
  - The SFX stem (`public/episodes/ep003/audio/sfx.wav`) and `build/ep003_sfx_cues_all.json`.
- **0–66 s:** A/B per frame and per 0.1 s audio against the `e221673` cut that `CRITIC_RETENTION_v332_hook.md` passed.

Channel bar (`LEARNINGS_EP001_EP002.md`): EP002 kept 55 % at 6:53 and EP001 kept 19 % at 9:46. This cut is 5:28, inside the
target. Length is not the risk. The risks are the sound floor and one soft stretch before the answer.

## Verdict: **FIX**

The structure holds. The picture holds too: the mean of 66–328 s is **2.08** on the 0–3 scale, against 1.98 for the
opening the last report passed. The blocks re-hook roughly every 30–60 s. The slap callback (220.8) and the payoff
(314–318) both land.

Two problems keep it from passing:
1. **The bed disappears at 1:06.** From 66 s to the end, the gaps between lines sit at −55 to −62 dBFS. In 0–66 s they sat at −34 to −38. So for 4 min 22 s it is dry voice over near-silence. There is also 0.7 s of digital zero at three block joins.
2. **One 8 s stretch at ≤1 at 258.8–267.0.** It is a slow dusk drift on a wide boat, with no SFX and no audible bed. It sits inside the most "ending-like" part of the episode (block F), 35 s before the answer.

Both can be fixed with existing material only.

## 0–66 s regression check: none

- **Picture vs `e221673`:** the per-frame mean difference is ≤1.5/255 everywhere except one-frame blips at the slap flash (9.37–9.43, 3.2) and 45.8 (1.7). Block C's opening at 63.9–65.9 differs by up to 2.2, which is the C design fixes; that stretch is the same buildings pan as before.
- **Sound vs `e221673`:**
  - The 0.1 s levels match within 1 dB except at 65.4: the gap there is now −39.5 dBFS (was −32.4).
  - There are still 0 exact-zero 10 ms windows in 0–66 s.
  - The only windows under −45 dBFS are the first 0.1 s, the excused "So, why?" rest, and a single 10 ms window each at 16.89 and 65.61.
- **Status:** the opening still PASSES as reported in v3.3.2.

## The bed: where it stops (measured)

Mix level while Bram is silent (median of the 10 ms windows with narration < −50 dBFS):

| Block | Time | Gap floor (median) | SFX stem in the gaps | SFX onsets / min |
|---|---|---|---|---|
| A hook | 0–40.8 | **−35.1** | −39 (bed present) | 12 (A+B) |
| B | 40.8–61.8 | **−35.2** | −40 (bed present) | |
| C | 61.8–106.0 | **−61.3** (p10 −87) | **digital zero** | 10.9 |
| D | 106.0–163.3 | **−59.5** | −71 | 11.5 |
| E | 163.3–239.3 | **−57.9** | −70 | 11.8 |
| F | 239.3–294.0 | **−57.1** | −79 | 11.0 |
| G | 294.0–328.4 | **−54.7** | −62 | 8.7 |

- **The cliff at 1:06.** The gap floor per 2 s goes −40.5 (62–64) → −38.6 (64–66) → **−61.9 (66–68)**. It reaches **−85 (70–72)**. This happens exactly where the viewer leaves the hook and the body starts.
- **The beds in D–G are not audible.** The cue sheet says "the beds carry the rest", but in D–G the beds are at −70 to −79 dBFS. That is ~50 dB under the voice, inaudible on a phone or a TV. In C there is no bed at all.
- **The block joins are holes.**
  - Exact digital zero at **105.28–105.97, 162.58–163.27, 238.56–239.24** (0.7 s each, picture held).
  - Near-zero at **292.6–293.96** (−77 to −91, 1.4 s over a black frame).
  - Single 10–20 ms zero windows at 68.20 and 92.20.
- **SFX density is on budget.** There are 62 distinct onsets in 328 s (11.3/min); C–G run 8.7–11.8/min. That rate is fine. Without a bed, though, each of the six cue gaps longer than 12 s is voice only:
  - **113.8–135.6 (21.8 s)**, the photo / "in a boat" passage
  - 144.8–158.3 (13.5 s)
  - 181.0–199.6 (18.6 s), the Steam quote
  - 221.5–235.5 (14.0 s)
  - **266.8–288.4 (21.6 s)**, the late night / founders passage: the clock racing to 3:12, the cans piling up and the "oof." graph crash are silent
  - 298.5–311.6 (13.1 s)
- **Dead air outside the designed rests.** Every inter-phrase gap in C–G is effectively dead air (it reads −55 to −65 on a phone speaker). The only designed rests are the "So, why?" rest at 39–40.7 and, by intent, the black before G. The rest of 66–328 is undesigned.

## Attention curve, 66–328 s (0–3 per 2 s)

Key:
- **3** = new and meaningful
- **2** = purposeful motion keyed to the words
- **1** = ambient only, or a hold
- **0** = nothing or confusion

The "gap floor" column is the mix level in the narration gaps of that bin. In A/B the same measure was −34 to −38.

| t (s) | score | gap floor (dBFS) | on screen |
|---|---|---|---|
| 66–68 | 3 | -62 | "Yes! Definitely." / "I'm free in three weeks" pop in sync |
| 68–70 | 3 | -63 | 3 WKS tags; four phones, "Three weeks works" |
| 70–72 | 3 | -85 | four phones; calendar flips to 3 WEEKS LATER (71.5) |
| 72–74 | 3 | -57 | thermometer, "sorry, kid's sick" |
| 74–76 | 3 | -66 | fever 102.4; cut to the driver, car CLUNK (75.9) |
| 76–78 | 2 | -62 | chat recap |
| 78–80 | 2 | -30 | ECG flatline (78.2); fish swims past the blurred phone |
| 80–82 | 2 | -63 | phone scrolls back, greyed |
| 82–84 | 2 | -57 | map, two pins; THE HARD PART? (83) |
| 84–86 | 1 | -57 | map holds; dashed path |
| 86–88 | 3 | -63 | clock; NOT IT stamp (86.5) |
| 88–90 | 2 | -62 | Message bar, ASKING, typing "want" |
| 90–92 | 2 | -61 | "want to hang o", deleted |
| 92–94 | 1 | -62 | bar empties; door (92.5) static |
| 94–96 | 1 | -52 | door static (light under the door only) |
| 96–98 | 3 | -55 | door opens (95.3): kid, "Want to play?" |
| 98–100 | 1 | -58 | hold on the kid |
| 100–102 | 2 | -64 | desaturates; door closes, slam (100.6) |
| 102–104 | 2 | -63 | dark door; "It's eight dollars. Just get it." typed |
| 104–106 | 2 | -120 | $7.99 stamps (104.6); hold + 0.7 s digital silence 105.3-106.0 |
| 106–108 | 3 | -60 | D: WHY FISHING? slams (106.5) |
| 108–110 | 3 | -49 | slot reels stop on fish (108.8) |
| 110–112 | 2 | -48 | split: chat / empty boat; $7.99 PAID (110.2) |
| 112–114 | 2 | -59 | hold; SOLVED check (113.2) |
| 114–116 | 2 | -57 | WHAT TO DO THERE? "?" (113.8) |
| 116–118 | 2 | -62 | polaroid develops |
| 118–120 | 1 | -57 | polaroid holds (slow drift) |
| 120–122 | 1 | -60 | polaroid holds |
| 122–124 | 3 | -57 | red circles on the faces "who was in the boat"; cut to the boat (123) |
| 124–126 | 2 | -51 | split close-ups, both look ahead |
| 126–128 | 2 | -52 | boat, "..." bubble |
| 128–130 | 2 | -60 | bubble pops; underwater fish (129) |
| 130–132 | 2 | -56 | fish blinks; boat behind the oar (130.8) |
| 132–134 | 1 | -62 | boat holds behind the oar |
| 134–136 | 1 | -54 | bobber + Pixie, holds |
| 136–138 | 3 | -61 | fish surfaces (135.6); "a reason" tag |
| 138–140 | 3 | -64 | JOB: silence (138.2); board whips in (139) |
| 140–142 | 3 | — | ALIBIS header slaps (140.7) |
| 142–144 | 2 | -64 | golf |
| 144–146 | 2 | -52 | poker, chips topple (144.8) |
| 146–148 | 1 | -52 | garage holds, slow desaturation |
| 148–150 | 1 | -60 | garage; cut to the board (149) |
| 150–152 | 1 | -59 | board holds |
| 152–154 | 2 | -61 | red Xs cross out the three |
| 154–156 | 2 | -51 | "?" slot opens |
| 156–158 | 1 | -63 | slot holds |
| 158–160 | 3 | -55 | phone slams in (158.3); NEWEST |
| 160–162 | 2 | -63 | photo flies in |
| 162–164 | 2 | -120 | ping (162.0); 0.7 s digital silence 162.6-163.3 |
| 164–166 | 1 | -56 | E: crew wide, holds |
| 166–168 | 2 | -60 | "Alibi props" list, tick |
| 168–170 | 2 | -63 | ticks |
| 170–172 | 2 | -60 | fish surfaces |
| 172–174 | 3 | -57 | fish yeets the list, splash; game HUD appears |
| 174–176 | 2 | -58 | seashell slot |
| 176–178 | 3 | -61 | pistol, shotgun, DYNAMITE slam (176.8) |
| 178–180 | 3 | -33 | SELL, +$1,250 |
| 180–182 | 3 | -29 | roulette, wallet faints, boss shadow (181) |
| 182–184 | 1 | -51 | everything blurs out |
| 184–186 | 1 | -63 | blurred plate + small label only (182.3-185.9) |
| 186–188 | 2 | -51 | Steam quote types word by word |
| 188–190 | 2 | -57 | quote |
| 190–192 | 2 | -64 | quote ends; cut to GOAL sign (190.9) |
| 192–194 | 2 | -58 | sign settles; fish |
| 194–196 | 2 | -53 | GOAL struck |
| 196–198 | 3 | -62 | ALIBI stamp; fish dives; cut wide (196.8) |
| 198–200 | 1 | -57 | wide boat, gull |
| 200–202 | 3 | -62 | FAILURE. (199.6) in grey, then colour |
| 202–204 | 3 | -40 | Quest falls in, FAIL x1 |
| 204–206 | 3 | -57 | dynamite in hand |
| 206–208 | 3 | -56 | roulette ALL IN |
| 208–210 | 3 | -55 | -$3,480; the crew flies |
| 210–212 | 2 | -61 | "?" lineup; fish |
| 212–214 | 3 | -50 | launched across the island |
| 214–216 | 2 | -61 | giant eye |
| 216–218 | 2 | -58 | boat, a teammate down |
| 218–220 | 2 | -51 | "Pick up" prompt |
| 220–222 | 3 | -54 | "Slap"; THE SLAP close-up (220.8) |
| 222–224 | 3 | -45 | REVIVED! |
| 224–226 | 1 | -50 | pan off to empty water, boat holds |
| 226–228 | 2 | -62 | "feelings."; cut to the photo (226.3) |
| 228–230 | 1 | -53 | "perfect day" photo holds, greys |
| 230–232 | 3 | -56 | photos fly in: splash, dynamite night, savings, island |
| 232–234 | 3 | -64 | 2031 rolls in |
| 234–236 | 2 | -54 | phone slides in |
| 236–238 | 2 | — | THE SLAP posts (235.5); "Sam is typing" |
| 238–240 | 2 | -120 | "???" (237.4); 0.7 s digital silence 238.6-239.2 |
| 240–242 | 1 | -60 | F: a blank yellow sign swings |
| 242–244 | 2 | -62 | FRIENDSLOP lands (242.6); spotlight, can |
| 244–246 | 2 | -59 | FRIEND/SLOP restyle |
| 246–248 | 2 | -50 | CHEAP / CHAOTIC / CO-OP tags |
| 248–250 | 3 | -58 | the four friends pop up (247.5) |
| 250–252 | 2 | -53 | pan |
| 252–254 | 3 | -65 | lid flips (251.4); the fish is in the can |
| 254–256 | 2 | -42 | squeeze; whip to summer (254.5) |
| 256–258 | 2 | -37 | PLAYTIME bar drains; JUNE calendar |
| 258–260 | 3 | -59 | #1 stamps (258.2); cut to the boat (258.8) |
| 260–262 | 1 | -60 | boat wide, slow drift |
| 262–264 | 1 | -52 | drift, the light dims |
| 264–266 | 1 | — | drift to dusk |
| 266–268 | 1 | -56 | night; banner (267.0) |
| 268–270 | 2 | -54 | "Leo: on?" banner; arms up; FISH checkbox sign |
| 270–272 | 2 | -52 | fish leaps past the sign |
| 272–274 | 2 | -54 | living room (272.3); clock 12:41 |
| 274–276 | 1 | -49 | clock holds at 1:00 |
| 276–278 | 3 | -49 | LAST ROUND tag; the clock races |
| 278–280 | 3 | -61 | 3:12, cans pile up, LAST ROUND struck; yearbook (279) |
| 280–282 | 2 | -63 | founders |
| 282–284 | 2 | -62 | heart; graph page |
| 284–286 | 2 | -62 | sales line rises |
| 286–288 | 3 | -48 | line crashes, "oof."; doodle boat draws |
| 288–290 | 2 | -63 | doodle slap (288.4), hearts |
| 290–292 | 3 | -51 | phone -> wall of phones -> counter |
| 292–294 | 1 | -75 | 10,000,000+ lands (292.0); black 292.6-294.0 |
| 294–296 | 1 | -56 | G: dark lake, mirrored question starts |
| 296–298 | 2 | -57 | mirrored question builds word by word |
| 298–300 | 2 | -54 | drip breaks the text (298.5); push in |
| 300–302 | 2 | -53 | fish surfaces |
| 302–304 | 2 | -53 | FISH-O-DEX "SEEN: ALWAYS. CAUGHT: NEVER." then holds |
| 304–306 | 2 | -53 | "fishing tuesday?" bubble (304.5) |
| 306–308 | 2 | -54 | HOW TO FISH title |
| 308–310 | 1 | -56 | TUTORIAL tag; title holds |
| 310–312 | 2 | -55 | FISH struck (311) |
| 312–314 | 1 | -53 | empty message bar, cursor only |
| 314–316 | 2 | -55 | cursor... "I miss" (315.0) |
| 316–318 | 3 | -53 | "I miss you" deleted -> "boat tonight?" |
| 318–320 | 3 | -51 | sent; "Bought." comes back (318.0) |
| 320–322 | 2 | -58 | lake; Leo and Max are in the boat now |
| 322–324 | 3 | -48 | SecondQuest wordmark rises (322.0) |
| 324–326 | 2 | -54 | end card holds (NEXT QUEST / JOIN THE PARTY) |
| 326–328 | 2 | -61 | fish jumps, dives (326.9); ends 328.4 |

**Means:** 66–328 = **2.08**. C 2.15 · D 1.97 · E 2.24 · F 2.00 · G 2.00. There are no bins at 0.

## Stretches at ≤1 longer than ~4 s

| Stretch | Length | What | Line |
|---|---|---|---|
| **258.8–267.0** | **8.2 s** | One wide shot of the boat; the sun sets slowly. No SFX from 258.2 to 266.8, no audible bed. | l39 "But fishing trips end too. That was never what they were for." + l40 up to "Tuesday" |
| 145.3–151.3 | 6.0 s (one cut, 149.0, back to an already-seen board) | Garage holds and greys slowly; then the board holds until the first X | l25 "…the car that needs one more afternoon in the garage. Nobody in those places…" |
| 131.0–135.5 | 4.5 s (one soft cut, 133.6) | Boat behind the oar, then the bobber | l24 "Or you don't, and that is fine too. The fish gives…" |
| 117.8–121.9 | 4.1 s | The "the lake · that summer" polaroid holds before the circles | l23 "…last fishing trip. Most don't remember." |

Near-misses (3–4 s):
- 182.3–185.9: a blurred plate with only the "THE DEVELOPERS' OWN DESCRIPTION" label, before the quote starts typing at 186.1.
- 292.6–296: black for 1.4 s, then a dark lake with the question only as a mirrored reflection.
- 92.5–95.3: the closed door.
- 306.6–310.6: the HOW TO FISH title holds; only the TUTORIAL tag moves.
- 312.0–314.9: an empty message bar with a blinking cursor. This is designed suspense before "I miss", and it works: keep it.

## The 3 biggest drop-off risks

1. **1:06 onward: the sound floor falls away (whole body, 66–328 s).**
   - What changes: the opening the viewer just watched had a continuous bed at −35. At 66 s it drops ~25 dB, and the body plays as dry voice over silence.
   - The holes: digital-zero holes at 105.3, 162.6 and 238.6, and a near-zero hole at 292.6–294.0.
   - Why it matters for retention: the viewer feels the energy fall right after the hook. Every hold above (the polaroid, the oar, the garage, the dusk) reads emptier than its picture, because nothing under it moves. This is the most likely cause of a steeper slope after 1:00 than EP002's.
2. **4:19–4:27 (258.8–267.0): the false ending.**
   - Block F changes the mood: a "this year's summer hit", then "fishing trips end too", then the sun going down over a wide boat with no sound events.
   - The picture and the words both say "we are wrapping up", but the answer only comes at 4:59.
   - Home viewers leave at false endings. Here they would leave right before the payoff, which is the part that makes them subscribe.
   - This is the longest ≤1 stretch in the episode (8.2 s). The next soft beat, the 1:00 clock hold (273.5–275.7), follows within 6 s.
3. **1:57–2:16 (116–136): the lyrical "in a boat" passage.**
   - What it is: 20 s of slow, gentle picture: the polaroid hold (117.8–121.9), split faces, the boat, the oar (131–133.6), the bobber (133.6–135.5).
   - There are no cues from 113.8 to 135.6 and no audible bed.
   - The writing is the heart of the thesis and the images are right. But at ~2:00, where long-form curves are most fragile, it is the flattest 20 s in the video (D mean 1.97).
   - It re-hooks at 135.6: the fish surfaces, then "a reason", then "JOB: silence".

## Re-hooks (open loop / pivot / payoff every 60–90 s)

The main loop "So, why?" opens at 38.9 and closes at 299.3. Each block re-opens a sub-question and pays it off:

| Block | Opens / pivots | Pays off | Longest gap between 3-beats |
|---|---|---|---|
| C 61.8–106 | "compare that with the other way" (61.8); "not distance… not even time… It's asking" (82–91) | "Eight dollars removes the asking" + the $7.99 stamp (104.6), a call-back to the hook | 86.5 → 95.3 (9 s) |
| D 106–163 | "But why fishing?" + slot (106.5); "what to do once you're there" (113.8); "not the only alibi" (139–140.7) | "How to Fish is just the newest one" + NEWEST (158.3) | 108.8 → 122.0 (13 s) |
| E 163–239 | "gets rid of it almost immediately" (171.4 yeet); Steam quote (laugh); "the goal is the alibi" (195.5) | FAILURE (199.6) → fail run → **THE SLAP (220.8)**, the hook's slap paid off → 2031 retelling | 180.0 → 196.0 (16 s) |
| F 239–294 | "a name for games like this" (blank sign → FRIENDSLOP 242.6); "Some say it's short" (254.5); "the two friends who founded…?" (279) | "millions answered the same group chat" → 10,000,000+ (290–292), a call-back to B | **258.2 → 276.0 (18 s)** |
| G 294–328 | the question restated (294–298) | "nobody came for the fish" (299–301); **"I miss you" → "boat tonight?" → "Bought." (315–318)** | 304.5 → 315.0 (10 s) |

- Every block re-hooks within 60–90 s.
- The weak link is F: between the #1 stamp (258.2) and LAST ROUND (276.0), nothing new happens for 18 s, and that is where the false ending sits.

## Payoff and end card

- **"How to say 'I miss you'… without ever having to say it."** It lands. The setup:
  - an empty bar with a cursor (312–314.9)
  - "I miss" typed on "miss" (315.0)
  - "I miss you" (315.5)
  - deleted on "without" (316.0)
  - "boat tonight?" typed and sent on "say it" (317.2–317.5)
  - "Bought." back at 318.0, a call-back to h06

  Showing the line instead of illustrating it is the strongest beat of G. The one sound is the notify on "Bought." (317.9): one impact, on the right word. Keep it exactly as it is.
- **"Who would you put in your boat?"** Leo and Max are back in the boat at ~319.5–320. It is a quiet, earned image.
- **End card.**
  - The wordmark rises at 322.0, CONTINUE? / NEXT QUEST / JOIN THE PARTY sit on screen from 322.5 to 328.4 (5.9 s), and the fish jumps at 326.
  - That is long enough for YouTube end-screen elements (5 s minimum), and it does not drag.
  - l52 "Maybe that's our next quest" (324.4–325.9) sits inside it.
  - The last 2.5 s after the voice are the fish dive and room tone. Fine.
- **Mirrored question at the top of G (294–298).**
  - Restating the thesis question is the right move.
  - On screen, though, it exists only as an upside-down reflection in a dark frame (luma ~32–37). Read bottom-up, it is hard to parse at TV/phone size.
  - Combined with the 1.4 s black before it, the episode's central question is the least readable text in the video. This is a near-miss, not a blocker.

## Top fixes (existing material only: camera / cut / pose / sound / text layout)

1. **Sound (required). Run the A/B bed under C–G at the same level as the hook (gaps −34 to −38 dBFS).**
   - Use the hook's existing room tone / lake water bed. Switch to the night-water variant for G, if that one is in the bed set already.
   - Make it continuous across the block joins, with no level step at 61.8/66.
   - Replace the 0.7 s digital zeros at 105.3, 162.6 and 238.6 with bed. Bridge the joins with a short bed crossfade instead of the held frame + silence.
   - Keep 292.6–294.0 as a rest, but at bed level, not −80. Shorten its black to ≤0.7 s.
   - Gate: 0 exact-zero 10 ms windows in 66–328, and every gap ≥ −45 dBFS except a designed rest.
   - This alone should move the body from "podcast over silence" to the hook's feel.
2. **Break the 258.8–267.0 dusk drift (required).** Same art, with camera and cuts only:
   - Punch in on the crew/lantern on "end too" (260.0).
   - Push or drift the other way on "never what they were for" (261.8–262.7).
   - Compress the sunset so night has fallen by "Some games" (263.5).
   - Bring the "Leo: on?" banner and its notify forward to "same boat" (266.0–266.3); it now lands on "Tuesday".
   - Also: put the existing `drain.wav` or a soft impact on the "oof." graph crash (285.3–285.6), and a quiet cue on the clock starting to race on "never" (277.1). These are the two silent sight gags in the 21.6 s cue gap.
3. **Tighten the three soft holds (recommended).**
   - **Polaroid 117.8–121.9:** a slow push from "Most don't remember" (119.5) onto the faces, so the circles at 122 arrive at the end of a move.
   - **Oar 131.0–133.6:** cut ~1 s earlier, to the bobber on "that is fine too" (132.2). Let the fish break the surface on "fish" (134.25), not at 135.6.
   - **Garage 145.3–149:** run the desaturation faster, or add a small push to the clock on the wall on "one more afternoon" (146.1).
   - Also, by layout: keep the boat less blurred until "word for word" (184.8), or start the opening “ quote mark at 183.7 ("Steam"). Either way the plate is not dead for 3.6 s.
   - In G, show the restated question upright, above the waterline, with the mirrored copy kept as its reflection.

## Calibration (LEARNINGS §6)

Predictions to compare with the 72 h curve:
- **No cliff before 0:05** (opening, unchanged).
- **A slope that steepens after ~1:06.** If the bed is fixed first, this should flatten.
- **A visible dip around 4:15–4:30** (the false ending).
- **A mild dip around 2:00–2:15.**
- **A small bump or flat line from 4:59 to the end** (people who reach the answer stay for the payoff).

If the curve shows no step at 1:06 and no dip at 4:20, then this critic is over-weighting the sound floor and the false ending, and the rubric should say so.
