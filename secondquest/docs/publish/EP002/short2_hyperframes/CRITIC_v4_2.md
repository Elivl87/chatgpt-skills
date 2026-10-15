# EP002 Short #2 v4.2 "Player Two" (22.0 s): independent critic recheck (after commit 5951412)

The critic did not build this piece and did not edit it.
- **Gates:** re-run in full (lint, frame_critic 0.25 s plus 1/30 s windows 0-1.2, 2-4.4, 7.8-11.5, 12-17.7 and 19-22 s, sfx_audit, check, a luma/cut scan of all 660 frames).
- **Frames:** full-size every 0.5 s, plus 1/30 s frames on the changed intervals and every cut.
- **Flags:** `CRITIC_v4_2_flags.jpg`. It has zoomed crops of the card at 21.30-21.97 s and of the Triforce at 3.4 s and 3.6 s.

## VERDICT: FIX (minor, 1 item: Navi crosses the thumbnail's "EXCEPT YOU")

```
VERDICT: FIX
1 Hierarchy ........ PASS
2 Overlaps ......... FIX   - 21.37-21.55 s Navi's loop passes over the thumbnail text: over the "E" of EXCEPT (21.40) and the "O" of YOU (21.50)
3 Safe/legibility .. PASS  - P2 "0%" meter now clears the HUD (no TEXT_OVER_HUD at 1/30 s, 7.8-11.5 s)
4 Characters ....... PASS  - #2f back pose on "think:" (12.8 s) faces the tree, full figure; tree pull-back small by design
5 Art fit .......... PASS  - Triforce face-on, lit like the plate; no blotches (spark points are tiny, barely visible at 540)
6 Motion ........... PASS  - every cut clean (0.37, 2.10, 3.0, 3.77, 4.07, 5.10, 6.83, 7.97, 8.97, 10.07, 11.17, 12.03-12.4, 12.8, 13.4, 14.53, 15.83, 16.4, 17.57, 19.5, 19.87 s); no black or flicker frames
7 Sound ............ PASS  - 6 onsets, 16/min, 82 % rest, -14.1 LUFS, -4.7 dBTP; Navi = Producer clips only
8 Repeats .......... checked: no ghost/dissolve, no text over the HUD, no text over an acting hand or face, no faked action,
                     no pasted boxes; small overlap on the card text (above)
Automated: lint 0 E / 16 W; frame_critic 0.25 s 0 E / 4 W (TEXT_OVER_CHARACTER on legs/torso only + CHAR_SMALL by design);
           1/30 s windows 0 E; sfx_audit 0/0; hyperframes check ok (0 E)
Top fix: Route Navi's loop around the sign's frame (outside the picture), or over the sky and the boy's hair, never across
         "EXCEPT YOU", and end it top-right as now.
Evidence: CRITIC_v4_2_flags.jpg (21.40 and 21.50 s crops)
```

## Changes in v4.2

| # | Change | Result |
|---|---|---|
| 1 | P2 meter lowered, slam from 1.05 | **Pass.** The 1/30 s sweep over 7.8-11.5 s has 0 errors (TEXT_OVER_HUD is gone). By eye at 10.03-10.07 s the "0%" sits under the HUD and clear of her hand. |
| 2 | Triforce sparks as small points | **Pass.** The blotches are gone. Note: the points are so small that at 540 they barely read. They are optional, and a few brighter 3-4 px points with a short glow would sell "magic". |
| 3 | Navi loop on the end card | **FIX.** The loop clears Pixie's head and the FULL EPISODE text, and rests top-right at the frame edge (21.8-21.97 s). But between 21.37 and 21.55 s it crosses the thumbnail's own title, "EXCEPT YOU", which is the most important text on the card. At 540 she is a small glint (about 8-10 px), readable as Navi only by her colour. |
| 4 | Pixie back pose #2f on "think:" | **Pass.** It is a real pose: she faces the tree, full figure, and her shadow is on the grass. The cut is clean at 12.8 s and again back to the face at 13.4 s. It reads better than the awe pose, because we see what she sees. |

The rest is unchanged from v4.1 and clean.

Sweeps are in `build/critic/short2_v4_2/` (md/json only). All PNG frames were deleted.
