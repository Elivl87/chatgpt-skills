# EP002 Short #2 v4.2 "Player Two": independent RETENTION critic re-check

The critic did not build this piece and did not edit it. This file follows `CRITIC_RETENTION_v4_1.md`, whose verdict
was PASS with 2 optional notes.

**What was reviewed:**
- `EP002_short2_hf_v4_preview540.mp4`, the v4.2 render (commit 5951412), saved at **2026-10-15 03:15:19 UTC**
  (sha1 `f62d887f…`). It is 540x960, 30 fps and 22.00 s long.

**Method:**
- Every frame (1/30 s) was extracted.
- Frames were read every 0.25 s for 9.5-14.5 s and 19.5-22.0 s; every 0.1 s for 3.0-3.8 s (the sparks) and
  20.6-22.0 s (Navi's loop); and every 1/30 s around the "think:" cut (12.77-13.30 s).
- Motion was measured as the mean frame difference per 0.5 s, for the whole Short.
- Loudness was measured as RMS per 0.25 s.

## VERDICT: PASS

Nothing regressed:
- The motion profile is identical to v4.1 within 0.4 everywhere, except in the windows the builder changed.
- The cut list is the same. 0.37, 2.10, 3.03, 3.77, 4.10, 5.10, 6.83, 7.97, 8.97, 10.07, 11.17, 12.10-12.30 (rack
  focus), 12.80, 13.40, 15.83, 16.40, 17.57 and 19.87 s are all where they were.
- The loudness curve is identical. There is no dead air, and the minimum is -43 dB at the natural pause at 2.0 s.

## The changed beats

| Change | Retention effect | Score |
|---|---|---|
| **"think:" at 12.80 s now cuts to Pixie's back (#2f), facing the tree** | It still reads as a new beat, and arguably a better one. The cut is hard (motion 45), and the size and angle change completely, from a close-up of the face to a full-figure back view. The over-the-shoulder look at what she sees says "what follows is her thought" better than a second awe face. It holds 0.6 s, then cuts back to the face at 13.40 s, so there is no time to miss her face. Her back is mostly against grass and bark, and the tree's bark at the top right gives the eye-line. No repeated pose any more. | 12.5 = 2, 13.0 = 1 (same as v4.1) |
| **The 0 % meter slams in smaller and lower (about 10.07 s)** | The slam on "none" is intact (motion 34 at 10.07 s). It reads clearly in the sky band, clear of the HUD and her hand, and it mirrors P1's 100 %. The joke beat is unchanged. | 10.0 = 3 |
| **Triforce sparks reworked (3.3-3.7 s)** | Not visible as a separate event at phone size. The reveal on "golden" (3.0-3.4 s) still carries the beat, and nothing got worse. | 3.0 = 3, 3.5 = 3 |
| **Navi loops once around the sign, 20.6-22.0 s** | The last second is no longer frozen: motion went from 0.17-0.20 to 0.25-0.41. Navi is a small glint at 540 px, so this is ambient motion (score 1), not a new beat. It gives the eye a moving point on the thumbnail, which helps the replay. | 21.0 = 1, 21.5 = 1 |

## Attention curve (0 to 3, per 0.5 s)

The curve is unchanged from v4.1 except where noted.

| t (s) | Score | t (s) | Score | t (s) | Score | t (s) | Score |
|---|---|---|---|---|---|---|---|
| 0.0 | **3** | 5.5 | 2 | 11.0 | 2 | 16.5 | 2 |
| 0.5 | 2 | 6.0 | 2 | 11.5 | 1 | 17.0 | 2 |
| 1.0 | 2 | 6.5 | **3** | 12.0 | **3** | 17.5 | **3** |
| 1.5 | **3** | 7.0 | 1 | 12.5 | 2 (back-view cut) | 18.0 | 2 |
| 2.0 | 2 | 7.5 | 2 | 13.0 | 1 | 18.5 | 1 |
| 2.5 | 1 | 8.0 | 2 | 13.5 | 2 | 19.0 | 2 |
| 3.0 | **3** | 8.5 | 2 | 14.0 | **3** | 19.5 | 2 |
| 3.5 | **3** | 9.0 | **3** | 14.5 | 2 | 20.0 | 2 |
| 4.0 | 2 | 9.5 | 1 | 15.0 | 1 | 20.5 | 2 |
| 4.5 | 1 | 10.0 | **3** (smaller 0 %) | 15.5 | **3** | 21.0 | 1 (Navi loop) |
| 5.0 | **3** | 10.5 | 1 | 16.0 | **3** | 21.5 | 1 (Navi loop) |

**Totals:** of 44 half-seconds, 13 score 3, 20 score 2, 11 score 1 and none score 0. This is the same as v4.1.

**Holds:**
- Before the card, no stretch scoring 1 or below lasts longer than 0.97 s.
- Frame 0 (the VS split screen), the 2 s hook, the punchline chain (16.40 s, hold, 17.57 s) and the card (2.13 s from
  the hard cut at 19.87 s) all hold.

## Notes (optional, non-blocking)

- **Navi's loop is small at 540 px.** At 1080 it will read better. If the loop is meant to pull the eye, a slightly
  brighter trail on her pass across the sign's face (about 21.0-21.5 s) would make it count. Light only.
