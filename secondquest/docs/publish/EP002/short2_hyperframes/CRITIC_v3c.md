# EP002 Short #2 v3.2 (22.6 s): independent critic recheck (after commit dbd805b)

The critic did not build this piece and did not edit it. Scope: design and craft. I checked the changed windows at
1/30 s by eye (0-5.6, 8.4-11.3, 15.0-17.7, 17.3-18.8 and 20.9-22.64 s) and made a quick 0.5 s pass over the whole
Short. Flagged frames are in `CRITIC_v3c_flags.jpg`.

## VERDICT: FIX (one small item; everything else passes)

**9.97-10.43 s: a pale cyan diagonal bar sweeps across the 1998 tree shot** (on "is measurable"). It is about 40 px
wide, it enters from the left, crosses the face and exits right. One more trace of it shows at the left edge at
9.10 s. It is cool-coloured over a warm, blurred N64 picture, it is not motivated by anything in the frame, and it reads
as a render glitch or a scratched-film line. Removed light streaks were flagged twice before: the "lighting" streak in
the builder's own v3 pass and the chevrons in CRITIC_v3.
**Fix:** remove it, or, if it is meant as a "measuring" scan, make it a warm, soft-edged horizontal scan line
that moves with the camera (the l49 rebuild-scan language from v2). Either way, one pass only. All other windows are clean.

```
1 Hierarchy ........ PASS
2 Overlaps ......... PASS  - no ghost text, no text over text, no text on the HUD (1/30 s)
3 Safe/legibility .. PASS
4 Characters ....... PASS  - close-ups cropped by design (waist-up / face); nothing important cut by accident
5 Art fit .......... FIX   - 9.97-10.43 s cyan bar over the tree reads as a glitch
6 Motion ........... PASS  - hook cut on the words; pop fills frame then hard cut; card Pixie cuts in opaque
7 Sound ............ PASS  - 6 onsets, 16/min, 89 % rest, -14.1 LUFS, -4.6 dBTP; wind riser into the drop, wind bed under the card; Navi = Producer clips only
8 Repeats .......... checked: no repeat (ghost text, title on the HUD, pasted boxes, badge, cut-off elements,
                     faked actions, busy SFX); the stray-streak family repeats (above)
Automated: lint 0 E / 13 W; frame_critic 0.25 s 0 E / 0 W; 1/30 s windows 0-5.6, 8.4-11.3, 15.0-18.8, 20.9-22.6: 0 E / 0 W;
           sfx_audit 0 / 0
```

## Changed windows

| Window | Result |
|---|---|
| 0-5.6 s, hook re-cut | **Pass.** Frame 0 is the finished title. The title holds to 1.13 and cuts out cleanly at 1.17 (no ghost). Balloon close-up on "space" (1.83). Face close-up on "imagination" (2.57). Navi's white flash plus the HUD at 3.03-3.07 (a whole-frame flash, not a text copy). Wider shot at 3.63. Balloon punch-in on "voice" (4.57). The pop swells at 5.27-5.30, shrinks at 5.33, and hard-cuts at 5.37 to the two-shot with Pixie. No translucent characters, and no faked action: Quest never moves, and every change is a cut, punch-in, light or the balloon. |
| Balloon tail off-frame (1.83-2.53, 4.57-5.30 s) | **Accepted.** In the close-ups the tail runs off the right edge toward Quest, who was just on screen in the wider shot to its right. It is classic comic framing for a speaker off-panel: it reads as anchored, not pasted. Keep the box fully inside the frame, as it is now. Text-free, so the right action rail does not matter. |
| 8.4-11.3 s, 1998 tree | **Pass except the bar.** The new N64 look (blurred texture, big flat triangles) now reads as a face from 9.13: brow, nose, moustache and mouth line. The cut at 9.13 and the sharpen on "polygons" (11.13-11.3) are clean. |
| 15.0-17.7 s, bedroom pan | **Pass.** Hard cut at 15.13 (both kids whole). The pan starts at 15.42, follows her finger, and passes kid Quest and Pixie off the left (reads as camera travel). From 16.2 it rests on the CRT with its picture and the whole N64. The cut to the vista is at 17.70. |
| 17.3-18.8 s, vista and drop | **Pass.** The princess's dress is whole, and Quest's back is cropped left by design. 18.67-18.70 is the whole-frame flash. "THAT IS THE" is opaque at 18.73 and "IMPOSSIBLE JOB" is opaque at 18.77. |
| 20.9-22.64 s, card | **Pass (note).** The text and sign fade in over 21.0-21.17 (a single layer each, not duplicates), and Pixie cuts in opaque at 21.20, standing on the grass between the posts. The last frame holds the full card. Note: a 2-3 frame cut-in for the sign too would match Pixie's, but this is not a defect. |

Whole 0.5 s pass: nothing else new. The escalation, the payoff, the wordmark and the card are as in v3.1.

Sweeps are in `build/critic/short2_v3c/` (md/json only). All PNG frames were deleted.
