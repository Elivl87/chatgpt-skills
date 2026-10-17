# EP003 v3.3.1 · Retention critic · opening 0–66 s (hook h01–h10 + block B b01–b03 + l12 into C)

Critic: independent retention pass. I did not build the piece and edited no file. Skill: `shorts-retention-critic`,
adapted to a long-form opening. The question: does a viewer who clicked from Home ("Why Did Millions Buy a Fishing
Game... and Not Fish?", thumbnail NOT FISHING = friends in a boat + unimpressed fish) stay through the first 60 s?
This is a re-check of `CRITIC_RETENTION_v33_hook.md` (FIX) against the builder's "v3.3 → v3.3.1" notes in
`CRITIC_v33_NOTES.md`.

Input: `EP003_full_hyperframes_review.mp4` (1280x720, 30 fps, 328.4 s), judged 0–66 s.
- Frames: every 0.25 s for 0–66 s; every 1/30 s for 0–3 s; 12 frames at 1/30 s around each detected cut (9.33, 11.40,
  13.07, 25.80, 30.83, 36.57, 40.77, 55.07, 58.37, 61.77, 65.63). Frame 0 viewed at full size and at feed size (270 px).
- Picture motion: mean absolute frame difference per 0.5 s (160x90 luma).
- Words: `episodes/ep003/timings.json` (v3.3).
- Audio: RMS of the review mix per 0.25 s and per 10 ms. The SFX bus was isolated by fitting the mix against
  `audio/narration.wav` and `audio/sfx.wav` (residual 17 dB under the mix).

## Verdict: **FIX (light)**

All three of the v3.3 fixes landed. The opening is now clearly better:
- the mean attention score for 0–66 s rose from 1.75 to 1.94;
- the mean for 0–3 s rose from 1.33 to 1.67;
- the H8 3-second dead stretch is gone;
- the hook ends on a real payoff (Leo drops in on "Together.").

The verdict is still FIX for two reasons, both cheap and both inside existing material:
1. **53.5–58.3 s is still the weakest stretch of the opening, and it falls just after the hook ends.** The 10,000,000+
   hold (53.5–55.0) runs straight into a static Quest in an unchanging spotlight (55.5–58.0). The only event in those
   4.8 s is the cut at 55.07, so there are 2.5 s at a score of 1 or less (the threshold is ~1.5 s).
2. **The bed still has two holes of exact digital zero (−240 dBFS, 100 ms each), at 25.37–25.47 and 54.69–54.79.** They
   fall in narration pauses 0.4 s before the cuts at 25.80 and 55.07. The cause is the looped crickets bed, which has
   zero-sample gaps between chirps (the SFX bus is −240 dBFS at 17.44–17.52 too, where the voice masks it). Through
   headphones they are heard as dropouts right before a cut. This is the exact symptom that fix #2 targeted.

## Re-check of the v3.3 fixes and drop-off stretches

| Item (v3.3) | v3.3.1 result | Status |
|---|---|---|
| **Frame 0 / first 3 s** (empty lake) | Frame 0 shows the four friends laughing in the boat, with "HOW TO FISH" already on screen and the unimpressed fish at the right edge. That is the thumbnail picture, now moving, and the click promise is kept from the first frame. At feed size the title and the fish read, but the faces are small (~12 px); this matters little for long form, where Home shows the thumbnail and not frame 0. Camera moves keyed to words: pull-back on "boat" (3.2), tilt on "rod" (4.26), fish leap on "fish" (5.5–5.8). **Remaining (soft):** 0.5–3.1 s is almost a held frame. Motion is 0.3–0.5 per frame (boat bob, gulls), plus a small title pulse at 2.1 on "Fish". | **Fixed.** One optional polish item. |
| **Slap ~9–11 s** | Hard cut to `02_slap_revive.png` at 9.33 on "slapping" (9.36), with a 3-frame flash (luma 119→165→109), the slap SFX at 9.30 and a slow push-in. A real face with a strong emotion and a real slap; the sticker is gone. 10.5–11.0 is a short hold before the blur. | **Fixed.** |
| **H8 27.5–30.5** | The empty place reads: three friends, Leo's rod lying on the stern rim, a clear gap beside Max. Quest and Pixie are in thinking poses. The "I'll get it later." bubble pops out of the seat at 26.54. A steady push runs from "same boat" (motion 2.3–2.8 per frame for 28.0–29.5), and the bubble greys and is gone before the cut at 30.81. The lowest point is 29.0–29.5 at a score of 1, for 0.5 s. **Small:** the bubble greys gradually and visibly only from ~29.5, not on "harder" (27.96). | **Fixed.** |
| **Leo continuity / fleet** | After 30.83 the wide keeps three friends and the empty place. Fleet boats sit in the water with their heads inside the hull. Leo drops in only on "Together." (36.57), and the hook now has a payoff. **Small:** the fleet starts appearing at ~31.9 ("bought"), about 1.1 s after "millions" (30.81), and it grows gradually with no single beat. This is the reason 31.0–32.0 scores 1. | **Fixed.** One optional item. |
| **b03 55–57.5 empty spotlight** | Quest now stands full figure in the light from 55.25, so the stage is no longer empty. But the shot is static: frame motion is 0.10–0.30 from 55.5 to 57.5. The "light narrows on alone" is barely measurable (cone 53→48 px of 160, about 10 %, at 57.6). Quest also waves and smiles cheerfully under "not really a game you play alone". | **Partly fixed. Still a FIX** (stretch at 1 or less: 55.5–58.0). |
| **10,000,000+ hold 53.5–55.0** | A "slow push" was added. It measures 1–2 % over 1.5 s, which reads as a hold. | **Not effective** (1.5 s at a score of 1). Together with b03 it forms the 53.5–58.3 dip. |
| **Building pan 63.5–65.5** | Unchanged. Buildings only from 64.0 to 65.63, with a steady pan. Under it the audio sits at −60 to −66 dBFS for 0.39 s (65.19–65.58), right before "We should hang out." This is block C (the builder's sound pass covered 0–62 s). | **Not addressed** (was optional). Soft spot. |
| **Sound floor / digital silence** | In 0–66 s, no 0.25 s window is below −40 dBFS except: the "So, why?" rest (39.25–40.25, −50 to −51 dBFS: a faint water bed, no longer digital silence, as the Producer's rule allows); and 65.25 (−60.7, block C, see the building pan). The 60–100 ms dips to −60/−70 inside the chat (14.7–23.5) are the gaps between cricket chirps under a −30 bed, and they read as texture. **Two exceptions:** 100 ms exact-zero holes at 25.37 and 54.69 (see verdict point 2). | **Fixed except the two zero holes.** |
| **Second "Bought." pop** | Present. In the SFX bus the pops sit at about −27 (#1, 17.6), −24 (#2, 18.8) and −29 dBFS (#3, 19.84), each about 18–22 dB under the "Bought." words (peaks −6 to −10). The middle hit is no longer mute. **Small:** #3 is the quietest of the three, so the sound does not escalate the way the picture does (the opaque punch-in on #3). | **Fixed.** One optional item. |

No flash or blank frames at any cut: luma stays steady around 9 of the cuts. The two exceptions are both designed: the
slap flash, and the fade from dark into the spotlight at 55.07 (66→17→39). The B→C cut at 61.77 is now a clean cut
with no crossfade.

## Attention curve (0–3 per 0.5 s)

3 = new and meaningful · 2 = purposeful motion · 1 = ambient only · 0 = nothing / confusion. **Bold** = a stretch at
1 or less that is still a drop-off risk.

| t (s) | +0.0 | +0.5 | +1.0 | +1.5 | what's on screen |
|---|---|---|---|---|---|
| 0–2 | 3 | 2 | 1 | 1 | the promise frame (four friends, title, fish); held; "There is a game called…" |
| 2–4 | 2 | 1 | 2 | 2 | title pulse on "Fish" 2.1; pull-back on "boat" 3.2 |
| 4–6 | 2 | 2 | 1 | 3 | tilt to the rod on "rod"; fish leap on "fish" |
| 6–8 | 2 | 2 | 1 | 2 | title out, reframe on "nobody"; line arc |
| 8–10 | 2 | 1 | 3 | 3 | cut + flash + SFX to the slap art 9.33 |
| 10–12 | 2 | 1 | 2 | 1 | push on the slap; blur out 11.4; blurred lake |
| 12–14 | 3 | 2 | 3 | 1 | $7.99 on "eight"; the phone 13.07; empty chat |
| 14–16 | 1 | 2 | 3 | 1 | typing; "It's eight dollars" |
| 16–18 | 2 | 1 | 2 | 3 | "Just get it."; Bought #1 |
| 18–20 | 1 | 3 | 2 | 3 | Bought #2 (pop); Bought #3 (opaque punch) |
| 20–22 | 1 | 1 | 2 | 2 | Leo typing |
| 22–24 | 3 | 1 | 1 | 2 | "I'll get it later."; still frame 23.0; typing again |
| 24–26 | 3 | 2 | 1 | 3 | the fish peeks; cut to H8 25.8 |
| 26–28 | 1 | 3 | 1 | 2 | the bubble pops out of the empty seat; push on "same boat" |
| 28–30 | 2 | 2 | 1 | 2 | push onto the empty place; bubble greys |
| 30–32 | 2 | 3 | 1 | 1 | "And yet," cut to the wide; three friends + gap |
| 32–34 | 2 | 2 | 2 | 2 | the fleet fills in |
| 34–36 | 3 | 2 | 2 | 1 | TO DO EVERYTHING ELSE; fish swims by |
| 36–38 | 1 | 3 | 2 | 2 | Leo drops in on "Together."; pull back |
| 38–40 | 3 | 2 | 1 | 1 | wordmark on "So, why?"; fish; rest (excused) |
| 40–42 | 1 | 3 | 1 | 2 | rest → shocked Quest 40.77; tag swings in |
| 42–44 | 3 | 2 | 3 | 2 | $7.99; strike on "not" |
| 44–46 | 1 | 3 | 3 | 2 | envelope; YOU'RE INVITED on "invitation"; blur |
| 46–48 | 2 | 2 | 1 | 3 | THEY HOPED; the counter rolls |
| 48–50 | 2 | 1 | 1 | 2 | 200,000 holds; strike |
| 50–52 | 1 | 2 | 2 | 2 | the reel spins |
| 52–54 | 3 | 2 | 3 | **1** | 10,000,000 lands; "+" on "ten million" |
| 54–56 | **1** | **1** | 3 | **1** | 10,000,000+ held (push not visible); cut to Quest in the spotlight 55.07 |
| 56–58 | **1** | **1** | **1** | **1** | static Quest, static light ("…a game you play alone") |
| 58–60 | 3 | 3 | 2 | 2 | 58.37 the four in the boat on "Everyone" |
| 60–62 | 2 | 3 | 2 | 3 | boxes land on "copy"; clean cut to C 61.77 |
| 62–64 | 3 | 2 | 2 | 2 | phone / building split, pan |
| 64–66 | 1 | 1 | 1 | 3 | buildings only (+0.39 s near-silence 65.19); four phones 65.63 |

Mean 0–66 s: **1.94** (v3.3: 1.75). Mean 0–3 s: **1.67** (v3.3: 1.33). There is no second at 0.

**Stretches at a score of 1 or less for more than ~1.2 s:**
- **53.5–55.0 (1.5 s)** and **55.5–58.0 (2.5 s)**: one dip, broken only by the cut at 55.07.
- 64.0–65.5 (1.5 s, block C, soft).
- The rest at 39.0–40.75 is excused (the Producer's 1.5 s of silence).

0.5–3.1 s is not a stretch at 1 or less, but it is the longest hold of the first 10 s. In long form, right after a
click that matches the thumbnail, it is acceptable.

## Remaining fixes (existing material only: camera, light, cut, pose, sound)

1. **53.5–58.3: make the numbers → stage stretch move** (required).
   - b03 (55.07–58.37): run a real slow push-in on Quest from "Because" (55.08) to "alone" (57.48), about 8–10 % scale.
     On "alone", narrow the cone by about half, not 10 %, and dim the stage edges. That gives a visible light event
     keyed to the word.
   - If an existing non-waving pose (standing/idle, hands down) is in the library, use it here. The cheerful wave reads
     against "not a game you play alone". Keep the wave for "Everyone".
   - 10,000,000+ hold (53.5–55.0): make the push visible (about 6–8 % over 1.5 s), or start the dark transition into b03
     about 0.4 s earlier.
2. **Patch the two exact-zero holes in the bed** (required, sound).
   - At 25.37–25.47 and 54.69–54.79, crossfade the crickets loop over its zero-sample gaps, or lay the existing
     room/water bed under it at a low level, so the floor never reaches digital silence between lines.
   - While there, carry a C bed through 65.19–65.58 (−60 to −66 dBFS for 0.39 s before "We should hang out").

**Optional (polish, not blocking):**
- 0–3.1 s: a very slow push-in from frame 0 (a few %) that then reverses into the existing pull-back on "boat". This
  would turn the held promise frame into a moving one, with no change of content.
- Start the fleet pop-in on "millions" (31.0), not on "bought" (31.9).
- Grey Leo's bubble on "harder" (27.96) as noted, not gradually by about 29.5.
- Make the third "Bought." pop the loudest of the three, so the sound escalates with the picture.
- Start the four-phones cut of block C about 0.5 s earlier, into the building-only frame (64.0–65.6).
- Still open from v3.3: put "SO, WHY?" on screen under the wordmark, to close the title → video loop.

## Calibration note

Per LEARNINGS §6, compare this verdict with the EP003 long-form analytics at 72 h:
- the curve at 0:00–0:30: the frame-0 fix predicts no cliff before 0:05;
- 0:50–1:00: this report predicts a visible dip at 0:53–0:58 if fix 1 is not made.
