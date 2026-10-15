# EP002 Short #2 v3.1 (22.6 s): independent critic recheck (after commit bab5426)

The critic did not build this piece and did not edit it. Reviewed: the re-rendered
`EP002_short2_hf_v3_preview540.mp4` (540x960, 678 frames) and `tools/hyperframes_ep002_short2/short/`. Previous pass:
`CRITIC_v3.md`. Scope: design and craft only (a separate retention critic judges attention). No flags sheet, because
nothing blocks.

## VERDICT: PASS (with 2 non-blocking notes)

All 9 v3 items are fixed or acceptably resolved. I checked them at 1/30 s on every cut and every title/text change.
Cuts were found by frame difference: 0.73, 3.03, 3.63, 5.37, 6.50, 7.43, 8.63, 11.10, 12.23, 13.17, 14.23, 15.13,
17.1-17.4 (pan), 17.70, 18.70, 19.83-19.87 and 20.77 s. There is no ghost text and nothing important is cut off, the
gates are clean, and the 0.5 s pass found nothing new that blocks.

```
1 Hierarchy ........ PASS
2 Overlaps ......... PASS  - title->wordmark is a clean cut (19.83 empty vista, 19.87 wordmark opaque); no text-over-text anywhere
3 Safe/legibility .. PASS
4 Characters ....... PASS  - princess whole (Quest's back cropped left by design); TV + N64 whole after the pan
5 Art fit .......... PASS (note 1) - 1998 tree improved but still mostly texture before "polygons"
6 Motion ........... PASS  - hook now 7 shots/events in 8.6 s; slam opaque from its first frame; pop instant
7 Sound ............ PASS  - unchanged: 6 onsets, 16/min, 83 % rest, -14.2 LUFS, -4.6 dBTP; Navi = Producer clips only
8 Repeats .......... checked: no repeat (ghost/echo text, title over HUD, pasted boxes, badge, cut-off elements, faked actions, busy SFX)
Automated: lint 0 E / 13 W; frame_critic 0.25 s 0 E / 0 W; 1/30 s windows 0-1, 2.9-3.8, 5.2-7.6, 8.5-15.3, 16.9-22.6:
           0 E / 1 W (CHAR_SMALL, one frame at 21.2 s while Pixie fades in); sfx_audit 0 / 0
```

## The 9 v3 items, verified

| # | Item | Result |
|---|---|---|
| 1 | Static hook | **Fixed.** The hook now has 7 events, each a real cut, punch-in or light, with no faked action. Frame 0 is the finished title. Punch-in on "character" (0.73). Balloon glow on "space". Navi's flash plus the HUD at 3.03-3.07. A hard cut to a closer hero at 3.63. Pop and a cut to the two-shot at 5.37. A hard cut to Pixie #2e, waist-down full figure, on "decide" (6.50). Back to the two-shot at 7.43. |
| 2 | Title x wordmark ghost | **Fixed.** At 19.80 the title is opaque; 19.83 is the empty vista; at 19.87 the wordmark is opaque at 1.14x and settles. There is no frame with both. |
| 3 | Princess hem cut | **Fixed.** 17.70-18.67: her whole dress is in frame with a margin, and Quest's back and shield crop on the left (reads as designed). |
| 4 | 1998 tree murk | **Partial, accepted (note 1).** Bigger facets and more contrast: the bark ridges, brow and mouth line read as a gnarled form, and the face resolves at 11.10 on "polygons". |
| 5 | Chevrons / leaves | **Fixed.** No chevrons at 13.17-14.2, and leaves fall on the "animation" shot. |
| 6 | Translucent slam frame | **Fixed.** "THAT IS THE" is opaque at 18.73 and "IMPOSSIBLE JOB" is opaque at 18.77, inside the safe area. 18.67-18.70 is the white flash over the whole frame, not a text copy. |
| 7 | N64 / TV off-frame | **Fixed.** At 17.0-17.4 the camera follows her finger right, she leaves frame at the left edge mid-pan (reads as a pan, not a crop), and at 17.4-17.67 the CRT with its picture and the whole N64 on the floor are in frame. |
| 8 | Pixie through balloon | **Fixed.** At 5.30-5.33 the balloon pops opaque, and the cut at 5.37 shows Pixie already standing there. |
| 9 | No flock on "sound" | **Fixed.** Dark birds cross the canopy at 14.23-15.1 (small at 540 px but visible). |

## Notes (not blocking)

1. **8.63-11.07 s: the 1998 tree is still mostly texture** for about 2.4 s; you read "a big gnarled thing" more than
   "a face". The builder is right that the whole tree cannot fit 9:16 from the 16:9 plate. Free option if time
   allows: a slow 2 % push toward the mouth line so the eye has a direction, or lift the mid-tone contrast on the
   face area only (the plate stays unmodified; this is a grade in the engine).
2. **21.17-21.27 s: card Pixie fades in** (semi-transparent for about 3 frames under the sign). It is a reveal, not a
   faked action, and it is short. A 2-frame cut-in would be crisper.

The last frame (22.57 s) holds the full card: wordmark, FULL EPISODE / ON THE CHANNEL, the whole thumbnail sign and
Pixie waving.

Sweeps: `build/critic/short2_v3b/` (md/json only). All PNG frames were deleted.
