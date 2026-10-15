# EP002 Short #2 v4.1 "Player Two": independent RETENTION critic re-check

The critic did not build this piece and did not edit it. This file follows `CRITIC_RETENTION_v4.md`, the pass on v4,
whose verdict was FIX.

**What was reviewed:**
- `EP002_short2_hf_v4_preview540.mp4`, the v4.1 render (commit 3b7d248), saved at **2026-10-15 02:55:30 UTC**
  (sha1 `bca57941…`). It is 540x960, 30 fps and 22.00 s long.
- The builder's answers in `v4_design/CRITIQUE.md`, in the section "Critics v4 -> v4.1".

**Method:**
- Every frame (1/30 s) was extracted.
- Frames were read every 0.25 s for the whole Short, and every 1/30 s for 0-0.67 s, 3.0-3.3 s (the Triforce),
  4.03-4.17 s (the punch-in), 12.70-13.43 s (the tree cuts) and 19.80-20.03 s (the cut to the card).
- Motion was measured as the mean frame difference per 0.5 s.
- Loudness was measured as RMS per 0.25 s.

## VERDICT: PASS (2 non-blocking notes)

All three retention fixes from v4 are in the render and work:

| v4 item | Status on v4.1 | Evidence |
|---|---|---|
| 1. Still tree face, 12.45-14.10 s (1.65 s scoring 1) | **Fixed** | Face 12.43-12.80 s; cut on "think:" to Pixie looking up at 12.80 s; cut back to the face from lower at 13.40 s with a slow push (motion 6.9); pull-back on "large" from 14.1 s. The longest still shot here is now 0.6 s. |
| 2. Digital silence after the drop, 18.05-19.0 s | **Fixed** | The master now reads -33, -35, -36 and -40 dB across 18.0-19.0 s (it was -90 dB). The wind bed runs under the card at -28 to -31 dB. There is no dead air anywhere from 0 to 22.0 s. |
| 3. Smug veteran hold, 3.90-5.10 s | **Fixed** | A punch-in on "immediately" at 4.07-4.13 s (motion 38). The longest hold is now 4.35-5.10 s (0.75 s). |
| Design fixes that also help attention | **Confirmed** | Hard cut out of the split screen at 0.37 s (no double exposure); Triforce revealed on "golden" (3.0 s), face-on and never edge-on; P2 meter slams in at 0 % on "none" (10.07 s), mirroring P1's 100 %; hard cut from the vista to the card at 19.87 s. |

Every PASS criterion is met:
- No half-second scores 0.
- No stretch scoring 1 or below lasts longer than 1.2 s before the end card.
- Frame 0 and the hook land.
- The punchline lands.
- The end card runs 2.13 s from the hard cut at 19.87 s. Counting the wordmark from 19.25 s, the ending is 2.75 s.

```
Frame 0 ........... PASS  - split VS screen (PLAYER ONE/VETERAN vs PLAYER TWO/NEW PLAYER), two faces, readable at feed size;
                            shown 0.37 s in play, then a clean hard cut (no ghost frames)
0-2 s hook ........ PASS  - "Player one already knows everything" + meter locks at 100 % on "everything" (1.5-1.9 s);
                            the VS frame promises the other half -> comedy setup clear by 2 s
Open loop ......... PASS  - "and player two?" opened at frame 0, answered 7.97-17.55 s
Escalation ........ PASS  - a change every 0.4-1.0 s from 0.37 to 17.6 s; no hold scoring <=1 longer than 0.97 s
Punchline ......... PASS  - "large" pull-back (14.1) -> "personal" punch-in (15.83) -> hard cut to Pixie's doubt on
                            "problem." (16.40) -> 1.15 s hold with the wind swell -> hard cut + drop (17.57)
End card .......... PASS  - hard cut 19.87, sign + Pixie + Navi "Look!" (20.75), wind bed to 22.0 (2.13 s)
Loop .............. weak  - card field -> split screen (bonus only)
Coherence ......... PASS  - every picture matches its line; no faked action
Captions .......... PASS  - one line, word-by-word, the spoken word in gold; never on a face
Sound ............. PASS  - no dead air (minimum -43 dB at the natural 2.0 s line pause); bed under vista and card
```

## Attention curve (0 to 3, per 0.5 s)

| t (s) | Words | Picture / event | Motion | Score |
|---|---|---|---|---|
| 0.0 | "Player one" | Frame 0: split VS screen; 0.37 hard cut to P1's temple + PLAYER ONE slam | 7.7 | **3** |
| 0.5 | "already" | Title settles, the veteran in the temple | 3.6 | 2 |
| 1.0 | "knows" | KNOWS IT ALL meter counts 3 -> 53 %, HUD with P1 tag | 4.2 | 2 |
| 1.5 | "everything." | Meter locks at 100 % | 3.4 | **3** |
| 2.0 | "They see" | 2.10 cut to the empty pedestal | 6.5 | 2 |
| 2.5 | "three" | Pedestal holds (0.9 s), light rays | 3.5 | 1 |
| 3.0 | "golden triangles" | Triforce revealed on "golden", rises, blooms | 9.8 | **3** |
| 3.5 | "and" | Triforce face-on; 3.77 cut to the smug veteran | 5.0 | **3** |
| 4.0 | "immediately" | 4.07-4.13 punch-in on his smug face | 8.0 | 2 |
| 4.5 | "understand that" | Hold (0.75 s) | 2.0 | 1 |
| 5.0 | "somebody" | 5.10 cut: the villain's claw toward the Triforce | 6.9 | **3** |
| 5.5 | "is about to" | Push toward the claw | 7.9 | 2 |
| 6.0 | "make a" | Push continues | 8.0 | 2 |
| 6.5 | "very bad" | 6.83 hard cut: the veteran, scared; shake | 9.2 | **3** |
| 7.0 | "decision." | Reaction hold (0.97 s) | 0.5 | 1 |
| 7.5 | | 7.97 cut to the player select | 5.5 | 2 |
| 8.0 | "Player two?" | Select screen, P2 port dark | 1.9 | 2 |
| 8.5 | (Navi "Hello!") | NEW PLAYER port lights | 5.6 | 2 |
| 9.0 | "Player two knows" | Pixel boot, P2 LOADING, forest, Pixie waves | 9.9 | **3** |
| 9.5 | | Waving hold | 3.5 | 1 |
| 10.0 | "none of this." | 0 % slams in on "none" | 9.4 | **3** |
| 10.5 | (pause) | Hold (0.77 s) | 0.5 | 1 |
| 11.0 | "They meet the" | 11.17 cut: Pixie in awe, shallow depth of field | 3.6 | 2 |
| 11.5 | "Great" | Hold | 2.6 | 1 |
| 12.0 | "Deku Tree" | Rack focus and a rise to the face | 28.8 | **3** |
| 12.5 | "and think:" | 12.80 cut to Pixie looking up | 8.7 | 2 |
| 13.0 | (pause) | Pixie looking up (0.6 s) | 3.9 | 1 |
| 13.5 | "That is an extremely" | 13.40 cut back to the face from lower, slow push | 6.9 | 2 |
| 14.0 | "large" | Pull-back begins on "large" | 9.8 | **3** |
| 14.5 | "tree with an" | Pull-back lands: the whole tree, Pixie tiny (the scale gag) | 20.8 | 2 |
| 15.0 | | Wide hold | 0.8 | 1 |
| 15.5 | "extremely personal" | 15.83 punch into the face | 8.6 | **3** |
| 16.0 | "problem." | 16.40 hard cut: Pixie's doubt | 3.6 | **3** |
| 16.5 | | Reaction hold (the laugh beat) | 1.0 | 2 |
| 17.0 | (wind swell) | Hold | 1.1 | 2 |
| 17.5 | (bass drop) | 17.57 hard cut + flash: co-op vista | 14.0 | **3** |
| 18.0 | (drop tail, wind) | P1/P2 tags, PRESS START appears | 1.2 | 2 |
| 18.5 | (wind) | PRESS START blinks | 1.0 | 1 |
| 19.0 | (bell) | Wordmark lands at 19.25 | 5.1 | 2 |
| 19.5 | | Navi into the star; 19.87 hard cut to the card's field | 5.3 | 2 |
| 20.0 | | Wordmark rises; sign + Pixie arrive | 4.0 | 2 |
| 20.5 | (Navi "Look!") | Navi into the sign | 0.4 | 2 |
| 21.0 | (wind bed) | Still card | 0.2 | 1 |
| 21.5 | (wind bed) | Still card, end at 22.00 | 0.2 | 1 |

**Totals:** of 44 half-seconds, 13 score 3, 20 score 2, 11 score 1 and none score 0. In v4 it was 14, 16, 14 and 0.

**Shape:** the 1s are now all short reaction or settle holds of 0.6-0.97 s, each followed by a cut on the next word.

## Non-blocking notes

1. **The end card is still for about 1.4 s (20.6-22.0 s).**
   - After Navi lands in the sign, nothing moves.
   - At the very end this costs little: the viewer has already reached the card.
   - Optional, for the next pass: one small light event in the last second (a glint across the sign) or Navi's trail
     circling it once. That would give the eye a reason to stay to 22.0 s and help the replay.
2. **Pixie's awe pose (#2d) appears twice in 1.6 s,** at 11.17 s and 12.80 s.
   - It works, because the second time it is her point of view before her thought.
   - If another real pose exists (for example a wide-eyed look up), the second cut would read as a new beat rather than
     a return.
