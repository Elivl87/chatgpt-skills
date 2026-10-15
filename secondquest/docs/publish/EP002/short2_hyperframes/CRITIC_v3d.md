# EP002 Short #2 v3.3 (22.6 s): independent critic recheck (after commit 495d9e2)

The critic did not build this piece and did not edit it. Scope: design and craft. I checked 8.6-11.3, 17.4-18.7 and
20.6-22.6 s by eye at 1/30 s, made a whole 0.5 s pass looking for any streak or bar, and ran the sound audit on the
new mix.

## VERDICT: PASS (ready for the Producer on design/craft)

| Window | Result |
|---|---|
| 8.6-11.3 s, 1998 tree | **Pass.** The cut at 8.63 opens on the face. No light bar or streak on any frame: the warm light on the face swells once on "measurable" (about 9.9-10.5) and settles. The face sharpens on "polygons" at 11.1-11.2. Note: the N64 face is soft and low-contrast for about 2 s; it reads as a face, but it is the least punchy picture in the Short. |
| 17.4-18.7 s, bedroom to vista | **Pass.** The CRT and the whole N64 are in frame at 17.40. Hard cut at 17.70 to the vista: the princess's dress is whole and Quest is cropped left by design. 18.67 is the whole-frame flash into the payoff. |
| 20.6-22.6 s, wordmark to card | **Pass.** The wordmark is opaque over the vista. Cut at 20.77 to the field with the wordmark moving to the top. FULL EPISODE / ON THE CHANNEL cuts in opaque at 21.00. The sign cuts in opaque at 21.07, and Pixie cuts in opaque at 21.17, standing between the posts. No translucent frames. The last frame holds the full card. |
| Whole 0.5 s pass | **Pass.** No streak, bar or chevron anywhere. No ghost text. Nothing important cut off. No faked action. |

```
Automated: lint 0 E / 13 W; frame_critic 0.25 s 0 E / 0 W; 1/30 s windows 8.6-11.3, 17.4-18.8, 20.6-22.6: 0 E / 1 W
           (CHAR_SMALL, one frame at 21.2 s, Pixie at 25 % on the wide card, intended)
sfx_audit (new mix from the preview's audio): 6 cues, 6 onsets, 16/min, 89 % rest, -14.1 LUFS, -4.7 dBTP: 0 errors, 0 warnings
```

The sound is judged from the audit; I did not listen to it. The raised beds are layered inside existing cues: the
riser at about -36 dB into the drop, and the field wind at about -30 dB under the card. They add no onsets, and the
master stays at -14.1 LUFS. Navi uses only the Producer's clips.

Sweeps are in `build/critic/short2_v3d/` (md/json only). All PNG frames were deleted. There is no flags sheet:
nothing is flagged.
