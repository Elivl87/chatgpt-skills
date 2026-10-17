# EP003 v3.3.2 · Retention critic · opening 0–66 s (hook h01–h10 + block B b01–b03 + l12 into C)

Critic: independent retention pass. I did not build the piece and edited no file. This re-checks
`CRITIC_RETENTION_v331_hook.md` (FIX light) against the builder's "Retention FIX (light), folded in" notes in
`CRITIC_v33_NOTES.md`.

Input: `EP003_full_hyperframes_review.mp4` at HEAD `e221673` (md5 `18a9c7c3…`, 1280x720, 30 fps, 328.4 s), judged
0–66 s. Baseline for A/B: the v3.3.1 review cut from `4fc6c26` (the cut the v3.3.1 report judged).
- Frames: every 0.25 s for 0–66 s. Every 1/30 s for 0–3.3, 27.3–30.9, 30.7–33.1 and 53.3–60.7 s, in both cuts.
- Picture: mean absolute frame difference per frame (160x90 luma), old vs new per frame, and luma at the 11 cuts.
- Scale: ECC affine registration (zoom), the gold bounding box of the 10,000,000+ number, the cone width at 3 fixed
  rows, and the red figure box of Quest.
- Words: `episodes/ep003/timings.json` (unchanged).
- Audio: review mix RMS per 10 ms and per 0.25 s, exact-zero test, both cuts. Pops are measured on the SFX stem
  (`audio/sfx.wav`); `mix.wav` = 1.000 x narration + 1.000 x sfx (residual −115 dB), so the stem is exactly what goes in.

## Verdict: **PASS**

Both required fixes landed, and they did more than was asked:
- **The 53.5–58.3 dip is gone.** There is a visible push on the number. Quest has a real push and a new pose. The
  cone halves on "alone".
- **The bed has no digital silence left.** There are 0 exact-zero windows in 0–66 s (v3.3.1 had 8 x 10 ms). The
  only gaps are the first 60 ms and the excused "So, why?" rest.

Three of the five optional items also landed. No regression was found in 0–66 s.

Two optional items did not move: the fleet onset, and the 64.0–65.6 block C pictures. Neither blocks.

## Builder claims, measured

| Claim | Measurement | Status |
|---|---|---|
| **8 % push on the 10,000,000+ hold** | Number box 825→878 px wide (+6.4 %) and 165→176 px tall (+6.7 %) over 53.4–54.9 s. The rest of the 8 % is in 53.06–53.4. In v3.3.1, the same window measures +4.1 % / +3.6 %. The fastest part of the push falls in the hold (≈1.5 px/frame at the edges). It ends slowing into the cut (54.4–54.9: +12 px). It reads as a push, not a hold. | **Met** |
| **≈10 % push on Quest from "Because" to "alone"** | Cone width at row 400: 536 px (55.4) → 578 px (57.4), **+7.8 % by "alone"**. Quest's figure width: 156 → 176 px (+12.8 %) by the cut at 58.37, because the camera keeps pushing after "alone" (1.23 → 1.28). The ease is sine.inOut, so the push is fastest at 56.0–56.8 and almost stalls by 57.0–57.4 (+2 px). In v3.3.1 the cone was flat at 534–539 px. | **Met** (a little under 10 % at "alone", over it by the cut) |
| **Light cone halves on "alone"** | Cone at row 400: 578 → 421 (57.8) → 294 px (58.0), a 49 % drop. The floor pool (row 620): 533 → 263 px (−51 %). The narrowing starts at 57.6 ("alone" is 57.48) and ends at 58.0. That leaves 0.37 s of a narrow, lonely frame before "Everyone" (58.38). Frame luma drops from 49.5 to 40.4, and the stage edges stay dark (≈24). In v3.3.1 the cone narrowed ~10 %, starting late, at 57.6–58.3. | **Met.** This is the best beat of the fix. |
| **Quest holds his game instead of waving** | `quest_cartridge.png` is on screen from 55.07 to 58.37: two hands on the cartridge, eyes on it, a small smile. Under "not really a game you play alone", the picture now says *he plays it by himself*. The wave is kept for "Everyone". | **Met** |
| **Gapless room tone (dropouts at 25.37 / 54.69 / 65.2 gone)** | **25.37: −32.3 dBFS** (was −240, exact zero). **54.69: −32.1** (was −240). **65.2–65.5: −34 to −38** (was −59 to −64 for 0.4 s). There are 0 exact-zero 10 ms windows in 0–66 s (v3.3.1: 8). In 0–66 s, every 10 ms window under −45 dBFS falls in only two places: 0.00–0.06 (the first 60 ms, before the bed opens) and 39.07–40.63 (the excused "So, why?" rest, a continuous water bed at −50 to −54). The chirp gaps that used to fall to −60/−66 in the chat (14.2–24.9) are gone too. The bed is now −28 to −36 between lines, with no step at the room-tone boundaries (12.4–13.2, 25.3–26.3, 54.5–55.3, 60.8–62.0 all checked at 0.1 s). | **Met** |
| **Slow push from frame 0** | Zoom 1.000 → 1.038 over 0–3.0 s (v3.3.1: 1.008). It is fastest at ~1.0–2.2 s (≈1.9 %/s), then hands off to the pull-back on "boat" at 3.2. It is subtle, but the promise frame is no longer a held frame. | **Met** |
| **Fleet pops on "millions"** | No measurable change in the onset. In both cuts, the first boats show at **31.47–31.6** (pixel count off a post-cut baseline: 1122 / 1160 at 31.47, rising sharply from 31.53). That is ~0.7 s after "millions" (30.81), on "of"/"people". What changed is that the fill now completes by ~32.6, not ~33.0. *Correction to my v3.3.1 report:* I gave the onset there as ~31.9; it was ~31.5 then too. | **Not met** (optional, minor) |
| **Bubble greys on "harder"** | Leo's name loses its colour at ~28.0–28.1, and the white of the bubble turns grey at 28.25–28.6. "harder" is 27.96. It keeps darkening until it goes at 30.25. *Correction to my v3.3.1 report:* the v3.3.1 cut measures the same (the hook source has no change here). My "visibly only from ~29.5" was wrong: the main step was already at 28.3. | **Met** (it already was) |
| **Third "Bought." loudest** | SFX stem peak: **B1 −24.0 · B2 −23.4 · B3 −9.6 dBFS**. The loudest 30 ms RMS: −33.0 / −31.7 / −22.8. The bed under them is ≈−36. B3 is now ~14 dB (peak) / ~9 dB (RMS) over #1 and #2. It still sits ~11–13 dB under the word itself (the RMS of the word is −9 to −12), so it lands as a kick and does not mask the voice. The sound escalates with the opaque punch-in. #1 and #2 are near equal, a step and then a jump. | **Met** |

## Regression check (0–66 s, old vs new per frame)

The picture differs only where the claims say it should: 0–3.2, 25.8–37 (the hook's H8/H9 edits), 53.0–64 (B) and the
block C opening. Everything else matches v3.3.1 to within encode noise (≤1.2 mean diff).

- **Cut luma:** identical at all 11 cuts (9.33, 11.40, 13.07, 25.80, 30.83, 36.57, 40.77, 55.07, 58.37, 61.77,
  65.63).
  - The only designed dips are the slap flash (120→166) and the fade into the spotlight at 55.07 (59→17→31), as in
    v3.3.1.
  - The one-frame mixes at 11.40 (119) and 13.07 (40) are unchanged from v3.3.1.
- **H8 edits (not in the claims list):**
  - Quest and Pixie lean toward the empty place.
  - Leo's beanie sits on the rim for the H8 cut.
  - The rod is moved 25 px off Leo's eye.
  - All three strengthen the empty place and do not distract.
- **"Their own copy" (60.28–61.0):** the boxes now pop *up* out of the hull into each friend's hands (back.out). They
  no longer fall across the faces, the sound is a cardboard "place" instead of an impact, and the beat reads cleaner.
- **58.4–60.3 (the "Everyone" wide):**
  - v3.3.1 had a whole-frame alternating judder here: every other frame differed by ~16 (of 255), decaying from
    58.4 to 60.3. My v3.3.1 report did not flag it.
  - v3.3.2 has a single camera kick (58.40–58.53), then the same slow push as before (+3.7 % to 60.3) with the bob
    and breathing.
  - The raw motion number dropped from ~8 to ~0.3, but this is the removal of a judder, not a loss of content.
  - I re-score 58.5 from 3 to 2 (see below). Not a stretch at ≤1.
- **Block C 61.77–66:** unchanged in picture. The 65.19–65.58 near-silence is now room tone (−34 to −38).

## Attention curve (0–3 per 0.5 s)

3 = new and meaningful · 2 = purposeful motion (including a push of about 1.5 %/s or more) · 1 = ambient only ·
0 = nothing / confusion. Rows that changed vs v3.3.1 are marked †.

| t (s) | +0.0 | +0.5 | +1.0 | +1.5 | what's on screen |
|---|---|---|---|---|---|
| 0–2 † | 3 | 2 | 2 | 2 | promise frame, now with a slow push from frame 0 (was 3 2 1 1) |
| 2–4 | 2 | 1 | 2 | 2 | title pulse on "Fish"; push slows; pull-back on "boat" 3.2 |
| 4–6 | 2 | 2 | 1 | 3 | tilt to the rod; fish leap |
| 6–8 | 2 | 2 | 1 | 2 | title out, reframe on "nobody"; line arc |
| 8–10 | 2 | 1 | 3 | 3 | cut + flash + SFX to the slap 9.33 |
| 10–12 | 2 | 1 | 2 | 1 | push on the slap; blur out 11.4 |
| 12–14 | 3 | 2 | 3 | 1 | $7.99; phone 13.07; empty chat |
| 14–16 | 1 | 2 | 3 | 1 | typing; "It's eight dollars" (bed now steady, no chirp holes) |
| 16–18 | 2 | 1 | 2 | 3 | "Just get it."; Bought #1 |
| 18–20 | 1 | 3 | 2 | 3 | Bought #2; Bought #3 (opaque punch + the loudest pop) |
| 20–22 | 1 | 1 | 2 | 2 | Leo typing |
| 22–24 | 3 | 1 | 1 | 2 | "I'll get it later."; hold; typing |
| 24–26 | 3 | 2 | 1 | 3 | fish peeks; cut to H8 25.8 (no zero hole at 25.37 any more) |
| 26–28 | 1 | 3 | 1 | 2 | bubble pops out of the seat; lean to the gap; push on "same boat" |
| 28–30 | 2 | 2 | 1 | 2 | bubble greys from 28.25; push onto the empty place |
| 30–32 † | 2 | 3 | 1 | 2 | "And yet,"; cut to the wide; first fleet boats at ~31.5 (was 1) |
| 32–34 | 2 | 2 | 2 | 2 | the fleet fills (done by ~32.6) |
| 34–36 | 3 | 2 | 2 | 1 | TO DO EVERYTHING ELSE; fish |
| 36–38 | 1 | 3 | 2 | 2 | Leo drops in on "Together." |
| 38–40 | 3 | 2 | 1 | 1 | wordmark on "So, why?"; rest (excused) |
| 40–42 | 1 | 3 | 1 | 2 | rest → shocked Quest 40.77 |
| 42–44 | 3 | 2 | 3 | 2 | $7.99; strike on "not" |
| 44–46 | 1 | 3 | 3 | 2 | envelope; YOU'RE INVITED |
| 46–48 | 2 | 2 | 1 | 3 | THEY HOPED; counter rolls |
| 48–50 | 2 | 1 | 1 | 2 | 200,000 holds; strike |
| 50–52 | 1 | 2 | 2 | 2 | reel spins |
| 52–54 † | 3 | 2 | 3 | 2 | 10,000,000 lands; "+"; a visible push on the hold (was 3 2 3 1) |
| 54–56 † | 2 | 1 | 3 | 2 | push continues, slowing; cut to Quest with his game 55.07; pool slides in (was 1 1 3 1) |
| 56–58 † | 2 | 2 | 1 | 3 | push on Quest (fastest 56.0–56.8), stalls 57.0–57.4; **cone halves on "alone"** (was 1 1 1 1) |
| 58–60 † | 3 | 2 | 2 | 2 | narrow cone, then "Everyone": the four in the boat; kick; slow push (was 3 3 2 2) |
| 60–62 | 2 | 3 | 2 | 3 | boxes pop up into their hands on "copy"; clean cut to C 61.77 |
| 62–64 | 3 | 2 | 2 | 2 | phone / building split, pan |
| 64–66 | 1 | 1 | 1 | 3 | buildings only (now over room tone, not silence); four phones 65.63 |

**Mean 0–66 s: 1.98** (v3.3.1: 1.91 recomputed from its own table on the same 132 bins; the v3.3.1 report printed
1.94). **Mean 0–3 s: 2.00** (v3.3.1: 1.67). There is no bin at 0.

**Stretches at ≤1 for 1.5 s or more:**
- 39.0–40.75: excused (the Producer's rest).
- 64.0–65.5 (1.5 s, block C, soft; now with a sound floor under it).

**The 53.5–58.3 dip is gone.** The longest run at ≤1 in that stretch is now a single 0.5 s bin (54.5 and 57.0, each
on its own).

## Remaining notes (optional, not blocking)

1. **Fleet onset:** the first boats still show at ~31.5, ~0.7 s after "millions". If wanted, start the nearest boats
   at hook-local −0.6 s (or put one mid-ground boat pop right on 30.81). The `dist * 1.5` stagger seems to leave the
   first visible boat ~0.7 s in.
2. **b03 ease:** the sine.inOut push nearly stalls at 57.0–57.4, just before "alone". A power1.in or linear ease into
   "alone" would keep the frame moving right up to the cone beat. This is cosmetic: the cone event covers it.
3. **64.0–65.6, block C:** the buildings-only pan is unchanged. Start the four-phones cut ~0.5 s earlier, as noted in
   v3.3.1. The audio hole there is fixed.
4. Still open from v3.3: "SO, WHY?" on screen under the wordmark.

## Calibration note

Per LEARNINGS §6, compare this verdict with the 72 h analytics:
- **0:00–0:30:** expect no cliff before 0:05.
- **0:50–1:00:** this report now predicts no visible dip at 0:53–0:58, the stretch that v3.3.1 flagged. If the curve
  still dips there, the push and the cone were not enough, and the fix is a cut.
