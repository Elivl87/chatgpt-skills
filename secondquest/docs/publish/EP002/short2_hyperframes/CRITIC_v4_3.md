# EP002 Short #2 v4.3 "Player Two" (22.0 s): independent critic recheck (after commit b9227a0)

The critic did not build this piece and did not edit it.

**Gates re-run:**
- `hyperframes lint`;
- frame_critic: the 0.25 s sweep, plus 1/30 s windows at 2.0-4.4, 7.8-11.5 and 19.0-22.0 s;
- `sfx_audit` on the preview's own audio.

**Checked by eye:** all 66 frames from 19.8 s to 22.0 s at 1/30 s (Navi is a canvas, so the DOM checks are blind here). Plus zoomed crops of Navi near the wordmark (19.93-20.10 s) and of the Triforce at 3.45 s and 3.6 s.

## VERDICT: PASS (design/craft; ready to send)

```
VERDICT: PASS
1 Hierarchy ........ PASS
2 Overlaps ......... PASS  - Navi never touches the wordmark, card text, thumbnail text or a face in 19.8-22.0 s (66 frames)
3 Safe/legibility .. PASS
4 Characters ....... PASS
5 Art fit .......... PASS  - Triforce face-on, lit like the plate (note: brighter spark points still hard to see at 540)
6 Motion ........... PASS
7 Sound ............ PASS  - 6 onsets, 16/min, 82 % rest, -14.1 LUFS, -4.7 dBTP; Navi = Producer clips only
8 Repeats .......... checked: no ghost text or dissolve ghosts, no text over the HUD, no text over an acting hand or face,
                     no faked action, no pasted boxes, nothing crossing the thumbnail's text
Automated: lint 0 E / 16 W; frame_critic 0.25 s 0 E / 4 W (text over legs/torso only + CHAR_SMALL by design);
           1/30 s windows 0 E; sfx_audit 0/0
Top fix: none blocking. Optional: make the Triforce spark points read at phone size.
Evidence: build/critic/short2_v4_3/ (md/json)
```

## Navi's path on the end card, frame by frame

1. **19.87-20.03 s:** she crosses the sky above the wordmark. The glow stays clear of the letters by about 30 px or more.
2. **20.07-20.27 s:** she flies to the right of the wordmark as it rises to the top, never on it.
3. **20.37-20.6 s:** she reaches the sign's right edge before the card text and the sign are fully in.
4. **20.6-21.7 s:** she loops outside the sign frame, along the right side and around the lower-right corner over the grass, right of the post. She is never over the picture, "EXCEPT YOU" or Pixie.
5. **21.7-22.0 s:** she rests at the top-right, outside the sign.

At 540 px she now reads as a glowing fairy with a trail, not a speck.

## Note (not blocking)

- **3.3-3.7 s:** the brighter spark points around the Triforce are still barely visible in the 540 preview. They may read better in the 1080 master.

Sweeps: `build/critic/short2_v4_3/` (md/json only). All PNG frames were deleted. No flags sheet, because nothing blocks.
