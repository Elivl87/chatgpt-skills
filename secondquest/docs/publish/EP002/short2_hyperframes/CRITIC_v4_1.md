# EP002 Short #2 v4.1 "Player Two" (22.0 s): independent critic recheck (after commit 3b7d248)

The critic did not build this piece and did not edit it.
- **Reviewed:** the re-rendered `EP002_short2_hf_v4_preview540.mp4` (660 frames).
- **Gates:** re-run (lint, frame_critic 0.25 s plus 1/30 s windows, sfx_audit, check).
- **Frames:** full-size every 0.5 s, and every 1/30 s at 0-0.6, 2.8-3.5, 8.9-11.5, 12.4-14.6, 16.4-17.6 and 19.7-21.97 s.

Flags: `CRITIC_v4_1_flags.jpg`. It has zoomed crops: the HUD and the meter at 9.97-10.13 s, and the Triforce sparks at 3.35 s and 3.50 s.

## VERDICT: FAIL (mechanical: 1 automated error; the fix is one line)

The skill rule is that any automated error that stands is a FAIL. One stands:
- **TEXT_OVER_HUD at 10.03-10.06 s.** On its slam frame, the "0%" meter is still oversized, and its top edge touches the HUD rupee "038" and the hearts bar.
- It is one frame and by eye nearly invisible at full speed, but it is the title-over-HUD family the Producer rejected.
- **Fix:** lower the P2 meter about 30-40 px (1080 scale), or start its slam at a smaller scale (1.15 -> 1). Then rerun the 7.8-11.5 s 1/30 s sweep.

Everything else from CRITIC_v4 is fixed. Once that frame is clean, this is a PASS on design and craft.

```
VERDICT: FAIL (1 automated error; design otherwise PASS)
1 Hierarchy ........ PASS
2 Overlaps ......... FAIL  - 10.03-10.06 s "0%" slam frame over HUD rupee/hearts (TEXT_OVER_HUD, error)
3 Safe/legibility .. PASS
4 Characters ....... PASS  - full figure where acting; Pixie small at the roots 14.7-15.9 s by design (the joke is scale)
5 Art fit .......... PASS (note) - Triforce now face-on, scene-lit gold; sparks at 3.35-3.6 s read as yellow blotches on its face
6 Motion ........... PASS  - split exit is a hard cut (0.37 s); boot 0.2 s with a 5-level palette reads as a console boot
7 Sound ............ PASS  - 6 onsets, 16/min, 82 % rest, -14.1 LUFS, -4.7 dBTP; Navi = Producer clips only
8 Repeats .......... checked: no dissolve ghosts (hard cut 19.87 s), no text over the acting hand, no ghost text, no faked action;
                     title/text over the HUD: 1 frame at 10.03 s (above)
Automated: lint 0 E / 16 W; frame_critic 0.25 s 0 E / 4 W (TEXT_OVER_CHARACTER on legs/body only, CHAR_SMALL by design);
           1/30 s 7.8-11.5 s: 1 E (TEXT_OVER_HUD 10.06) + 1 W; other windows 0 E; sfx_audit 0/0;
           hyperframes check ok (0 E; runtime 5 W, layout 11 W)
Top fix: Lower or shrink the P2 "0%" slam so its first frame clears the HUD.
Evidence: CRITIC_v4_1_flags.jpg (10.033 s crop)
```

## CRITIC_v4 items, verified

| # | Item | Result |
|---|---|---|
| 1 | Vista -> card dissolve ghosts | **Fixed.** Hard cut at 19.87 s: the wordmark keeps its place over the field, then rises to the top (19.97-20.20 s). No frame shows see-through characters. |
| 2 | "0%" counter over Pixie's waving hand | **Fixed** for the hand: the meter sits in the sky band, top-left, clear of her hand and face from 10.07 to 11.1 s. Its slam frame now touches the HUD (above). |
| 3 | Triforce edge-on / early / plastic | **Fixed.** It appears small on "golden" (2.97-3.0 s), rises face-on with a slight turn (no edge-on frame in 2.97-3.5 s at 1/30), and the gold has window-side light and darker edges, so it sits better in the plate. Note: the sparks over its upper triangle at 3.35-3.6 s are soft yellow discs that read as blotches or stains on the gold. Make them small bright points with glow, mostly outside the silhouette. This is not blocking. |
| 4 | P2 meter starts at 100 % | **Fixed.** It slams in at 0 % on "none" (10.03 s), mirroring P1's 100 %. |
| 5 | Busy split exit | **Fixed.** Frame 0 holds the split until a hard cut at 0.37 s to the full P1 frame with PLAYER ONE. Frame 0's labels sit over Quest's legs and Pixie's torso, not faces: OK. |

## New in v4.1

- **Tree beat:** the rise to the face (12.03-12.4 s) is clean. The cut to Pixie #2d (awe, hands at her chest) on "think:" (12.8 s) is a real pose and clean. The cut back to the face at 13.4 s and the pull-back at 14.53-14.73 s are clean. The arc reads as anticipation (her awe), then setup, then punch, then her doubt at 16.4 s.
- **Punch-in on "immediately" (4.07-4.13 s):** clean, with Quest whole.
- **Boot (8.97-9.13 s):** the 5-level palette makes the blocks read as a retro console boot, not as noise or a censor mosaic. "P2 LOADING" stays crisp. It is resolved by 9.13 s.
- **Sound:** the wind bed under the drop and the card adds no onsets (6 total). Rest is 82 %, the master is -14.1 LUFS, and Navi still uses only the Producer's clips.
- **No black or flicker frames** (luma scan of all 660 frames). There are no unmotivated light bars, and the 17.57 s flash covers the whole frame.

Sweeps are in `build/critic/short2_v4_1/` (md/json only). All PNG frames were deleted.
