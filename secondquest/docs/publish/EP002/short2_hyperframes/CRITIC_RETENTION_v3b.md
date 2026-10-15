# EP002 Short #2 v3.2: independent RETENTION critic re-check

The critic did not build this piece and did not edit it. This file follows `CRITIC_RETENTION_v3.md`, the pass on the
v3.1 render, whose verdict was FIX.

**What was reviewed:**
- `EP002_short2_hf_v3_preview540.mp4`, the v3.2 render (commit dbd805b), saved at **2026-10-15 00:27:51 UTC**
  (sha1 `2f8c3077…`). It is 540x960, 30 fps and 22.64 s long.
- The builder's answers in `v3_design/CRITIQUE.md`, in the section "Retention critic v3 -> v3.2".

**Method:**
- Every frame (1/30 s) was extracted. Frames were read every 0.25 s, and full size around the hook and the tree.
- Motion was measured as the mean frame difference per 0.5 s.
- Loudness was measured as RMS per 0.25 s, and per 0.1 s around the payoff and the card.

## VERDICT: PASS (with 2 non-blocking notes)

Every PASS criterion is met:
- No half-second scores 0. In v3.1 there were three.
- No stretch scoring 1 or below lasts longer than 1.2 s. The longest are 5.45-6.48 s (1.03 s) and 16.72-17.69 s
  (0.97 s).
- Frame 0 and the hook land.
- The payoff lands.
- The end card runs about 1.7 s (the sign arrives at about 20.9 s). Counting the wordmark from 19.95 s, the ending is
  2.7 s.

```
Frame 0 ........... PASS  - title + hero + empty balloon; reads at feed size; title now held to 1.16 s (readable)
0-2 s hook ........ PASS  - title read (0-1.16), punch-in on "character" (1.17), balloon close-up on "space" (1.83)
Open loop ......... PASS  - "the remake's impossible job?" opened at 0.0 s, closed by the same words at 18.67 s
Escalation ........ PASS  - a change every ~0.5-1.0 s from 1.2 s to 16.7 s; no dip after the hook any more
Payoff ............ PASS  - hard cut + flash + bass drop + title slam on "impossible" (18.67 s), pulse on "job"
End card .......... PASS  - thumbnail sign + FULL EPISODE / ON THE CHANNEL + Navi "Look!" (21.4 s); ~1.7 s
Loop .............. BONUS - card field/dirt road -> frame 0 field/dirt road
Coherence ......... PASS (note) - 1998 tree is soft/blurry; reads as a face only on the 9.13 s punch-in (note 1)
Captions .......... PASS  - one line, word-by-word, never on a face; dropped under the l60 title
Sound beds ........ PASS (note) - riser and card bed exist but sit ~30 dB under the voice on the master (note 2)
```

## Fixes from v3.1, verified on this render

| v3.1 fix | Status | Evidence |
|---|---|---|
| 1. Tree: three shots on "Because / better / measurable" | **Done** | Cut at 8.63, punch-in at 9.13 (frame difference 27), scan line at about 10.0 s, polygons upgrade at 11.08. The 0s are gone. |
| 2. Hook cut on its words | **Done** | Title held to 1.16 s; cuts at 1.17 (punch-in), 1.83 ("space", balloon close-up), 2.57 ("imagination", face), 3.03 (Navi flash and HUD), 3.63 ("Give", wider shot), 4.57 ("voice", balloon punch-in), 5.33-5.40 (pop fills the frame, then Pixie). |
| 3. Sound beds | **Done, quiet** | 17.4-18.1 s now rises from -48 to -39 dB (it was about -53, flat) and cuts into the drop. The card bed measures -42 to -55 dB. |
| Optional: bedroom pan on "familiar" | **Done** | The pan runs 15.42-16.7 s and the CRT and N64 are on screen by 16.0 s, while "familiar is" is said. |

## Attention curve (0 to 3, per 0.5 s)

| t (s) | Words | Picture / event | Motion | Score |
|---|---|---|---|---|
| 0.0 | "A silent…" | Frame 0: title, hero, empty balloon | 0.3 | **3** |
| 0.5 | "…character" | Title held for reading (to 1.16) | 0.2 | 1 |
| 1.0 | "once" | 1.17 title cut out + punch-in | 7.8 | **3** |
| 1.5 | "left space" | 1.83 hard cut, close-up of the empty balloon | 3.4 | **3** |
| 2.0 | "for your" | Balloon close-up holds | 1.3 | 1 |
| 2.5 | "imagination." | 2.57 cut to his face | 3.8 | **3** |
| 3.0 | (Navi "Hello!") | Flash, glint, HUD in | 6.3 | **3** |
| 3.5 | "Give that" | 3.63 cut to a wider hero + balloon | 4.4 | 2 |
| 4.0 | "character" | Hold | 1.4 | 1 |
| 4.5 | "a voice…" | 4.57 punch into the balloon | 8.5 | **3** |
| 5.0 | "and suddenly" | Pop fills the frame, cut to the two-shot, Pixie revealed | 7.1 | **3** |
| 5.5 | "somebody" | Two-shot holds | 0.9 | 1 |
| 6.0 | "has to" | Hold | 0.5 | 1 |
| 6.5 | "decide what" | 6.48 cut to Pixie's close-up, hand on chin | 4.7 | 2 |
| 7.0 | "that" | 7.42 cut back to the two-shot | 4.9 | 2 |
| 7.5 | "silence sounded" | Push into the empty space | 7.4 | 2 |
| 8.0 | "like." | Push continues | 9.0 | 2 |
| 8.5 | (pause) | 8.63 cut to the 1998 tree | 5.9 | **3** |
| 9.0 | "Because better" | 9.13 punch-in to the low-res face | 2.3 | 2 |
| 9.5 | "is" | Slow push | 0.6 | 1 |
| 10.0 | "measurable." | Scan line sweeps the facets | 7.3 | 2 |
| 10.5 | (pause) | Hold | 0.5 | 1 |
| 11.0 | "More polygons." | Face sharpens, punch-in (the reveal) | 4.3 | **3** |
| 11.5 | | Sharp face | 0.6 | 2 |
| 12.0 | "Better lighting." | Whip to the sun, flare | 16.5 | **3** |
| 12.5 | | Sun shot | 0.4 | 1 |
| 13.0 | "Better animation." | Whip to the trunk, leaves fall | 17.1 | **3** |
| 13.5 | | Leaves falling | 0.7 | 2 |
| 14.0 | "Better sound." | Canopy, flock bursts out | 14.4 | **3** |
| 14.5 | | Birds fly | 1.0 | 2 |
| 15.0 | "But" | 15.13 cut to the 1998 bedroom (twist) | 6.3 | **3** |
| 15.5 | "familiar" | Pan follows her finger | 12.2 | 2 |
| 16.0 | "is" | CRT + N64 land in frame (the 1998 object) | 19.7 | **3** |
| 16.5 | "not" | Pan settles | 2.1 | 1 |
| 17.0 | "measurable." | TV holds | 0.3 | 1 |
| 17.5 | (riser) | 17.69 cut to the vista, adult Quest + princess | 4.3 | 2 |
| 18.0 | "That is the" | Vista holds, riser swells | 1.0 | 1 |
| 18.5 | "impossible" | 18.67 hard cut to the castle, flash, drop, title slam | 10.7 | **3** |
| 19.0 | "job." | Pulse on "job" | 1.6 | 2 |
| 19.5 | | Title holds, dims, cut out | 2.5 | 1 |
| 20.0 | (bell) | Wordmark lands | 3.9 | 2 |
| 20.5 | | Navi into the star, wordmark rises | 6.0 | 2 |
| 21.0 | | Card + sign arrive | 2.3 | 2 |
| 21.5 | (Navi "Look!") | Pixie cut-in, Navi into the sign | 0.2 | 2 |
| 22.0 | (field wind) | Still card | 0.2 | 1 |
| 22.5 | (field wind) | Still card, end at 22.64 | 0.2 | 1 |

**Totals:** of the 46 half-seconds, 15 score 3, 17 score 2, 14 score 1 and **none score 0**. In v3.1 it was 14, 15, 14
and 3.

**Shape:** the saw is gone from the first 11 s. There is now a spike every 0.5-1.5 s from 1.17 s on, a short rest after
each (never longer than 1.03 s), and one big spike at the payoff.

## Notes (non-blocking; for the next pass if the Producer wants more)

1. **8.63-11.08 s: the 1998 tree is soft.**
   - The low-res, filtered look is faithful to 1998, but on a phone the wide "Because" shot (8.63-9.13 s) reads as
     out-of-focus moss, not as a tree.
   - The face only becomes recognisable on the punch-in at 9.13 s: blurry eyes, nose and moustache.
   - A first-time viewer may take it for a focus or buffering problem for about 0.5 s.
   - It is no longer a retention hole, because something changes on every word and the sharp face at 11.08 s pays it
     off. It is also the beat that makes "more polygons" land.
   - Optional fix: open "Because" directly on the face framing, with no wide shot.
2. **The beds are very quiet on the master.**
   - The riser from 17.4 to 18.1 s measures -48 to -39 dB, against about -15 dB for the voice.
   - The card bed measures about -42 to -55 dB. The builder's note says -28 dB RMS for the bed; on the mixed master,
     mono RMS reads about 20 dB lower.
   - On phone speakers both may be inaudible, so the 0.6 s before "That is the" can still feel like a dropout.
   - Optional fix: raise the riser about 8 dB at its peak (about 18.0-18.1 s, still well under the voice) and the
     card bed about 6 dB. Neither is a new hit, so the restrained-sound count is unchanged.
