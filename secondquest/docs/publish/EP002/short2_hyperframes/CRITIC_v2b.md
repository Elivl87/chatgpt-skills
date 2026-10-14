# EP002 Short #2 v2.1: independent critic recheck (after commit 62cde01)

The critic did not build this piece and did not edit it. Reviewed artefact: the re-rendered
`EP002_short2_hf_v2_preview540.mp4` (540x960, 30 fps) and `tools/hyperframes_ep002_short2/short/`. The rubric
is `docs/style/DESIGN_RUBRIC.md`. The frame sheet is `CRITIC_v2b_flags.jpg`: the top row shows the open notes,
the bottom row shows fixes verified. The previous pass is `CRITIC_v2.md`.

## VERDICT: FIX (minor: 3 small polish items, no redesign; all 11 previous items are fixed)

The piece is close. Every defect from the last pass is fixed and verified at full size. The automated gates are
clean. What remains: one transition makes the characters look like ghosts, the wordmark sits over the end-card sign
for a few frames, and frame 0 shows a sliced title. All three belong to the "ghost / text over" family the Producer
watches for, so they should be fixed before he sees it. Each one is a single small timing change.

```
1 Hierarchy ........ PASS  - one focal point per beat; l60 title alone; captions clear of the hero in D
2 Overlaps ......... FIX   - 47.73-47.87 s wordmark passes over the sign/thumbnail; 41.03-41.27 s dissolve shows see-through characters
3 Safe/legibility .. PASS  - captions 74 px inside x 6-85 %, y <= 80 %; no TEXT_OVER_HUD at 1/30 s anywhere
4 Characters ....... PASS  - full figure throughout; Pixie walks (bob + sway); N64 pad in adult Quest's hands; sign has posts on the ground
5 Art fit .......... PASS  - N64 low-poly field reads as 1998; dark-glass reflection reads as glass (note: large)
6 Motion ........... FIX   - frame 0.00-0.07 s: title in mid-reveal (sliced strips) as the opening frame
7 Sound ............ PASS  - 14 onsets, 17/min, 74 % rest, -14.1 LUFS, -4.6 dBTP; crickets bed now; Navi = Producer clips only
8 Repeats .......... checked: no repeat (title/HUD, ghost text, pasted boxes, badge, sticker art, busy SFX, floating elements)
Automated: lint 0 E / 20 W; frame_critic 0.25 s 0 E / 2 W (CHAR_SMALL, intended wides);
           frame_critic 1/30 s on 15 windows (titles, every cut, HUD fades, dissolve, card): 0 E;
           sfx_audit 0 E / 0 W (plan + the MP4's own audio); hyperframes check ok (0 E; 18 layout W = oversized plates)
Top fix: Replace the 41.0 s dissolve with a cut or pan, and finish the wordmark exit before the sign rises.
```

## Open items (most severe first)

1. **41.03-41.27 s: the dissolve turns adult Quest and the princess into see-through ghosts** over the castle
   (sheet, 41.10 s). It is half-opacity double exposure of the acting characters, which is the "ghost" look the Producer
   rejected, and it lasts about 8 frames. **Fix:** hard-cut on "justify" (41.45 s) to the castle framing; it is a clearly
   different shot, so the camera-continuity rule is fine. Or keep the pan but stop it before Pixie's edge.
2. **47.73-47.87 s: the full-size wordmark sits over the rising sign**, across the thumbnail boy's hair and next to
   "EXCEPT YOU" (sheet, 47.80 s). For 4-5 frames it is text over a text-carrying image. **Fix:** fade the wordmark out
   (or move it to its small top position) before the sign enters, or start the sign 0.15 s later. frame_critic does
   not flag it because both layers are partly transparent, so check it by eye.
3. **0.00-0.07 s: the first frame shows the title as sliced strips** (the mask reveal starting on frame 0). On Shorts
   the first frame is often what the feed shows as a still. **Fix:** start the reveal at 0.10 s so frame 0 is the
   clean hero shot, or make frame 0 the finished title.

## Taste notes (not blocking)

- 44.9-46.4 s: the reflection works now (dark glass, desaturated, highlight streak). It is very large, though: a head
  that fills the screen, for someone sitting across the room. At about 60 % of the current size it would read even
  more as a reflection.
- 30.2-30.7 s: the two-line caption "and the game / becomes" crosses both walking backs; no faces are covered. It is
  acceptable, and a one-line split would be cleaner.
- Kid Quest's pad (1998 bedroom, 15.1-17.6 / 34.4-40.2 s): a plain grey corded bar with no sticks, no modern
  shape and no colour buttons. It is period-plausible as a generic 90s pad, but it is not N64-shaped while the N64
  sits on the floor. Leaving it as drawn is acceptable (block C art, the Producer approved it). It only matters if someone looks for it.

## Previous items, verified

| # | Item (CRITIC_v2) | Result |
|---|---|---|
| 1 | Title over HUD 3.62-3.74 s | **Fixed.** At 1/30 s the title fades in place and is gone by 3.50. The HUD starts about 3.80. 0 errors in the 3.0-4.0 sweep. |
| 2 | Balloon touching the title | **Fixed.** There is clear sky between them in every 0.5 s frame from 0.5 to 3.5 s. |
| 3 | "1998" mosaic | **Fixed.** Flat-shaded low-poly terrain, skybox, fog, and a low-poly castle silhouette in B1. It reads as N64 (8.6-11, 17.6-22 s). |
| 4 | Caption on the tiny hero | **Fixed.** The hero walks on the right third (22-25.9 s), with the caption's right edge about 30-40 px clear of him. |
| 5 | Navi across faces | **Fixed.** 11.5-11.8 and 12.9-13.2 s: the glow passes outside or above the heads (zoomed crops). |
| 6 | "Probably." past the cut | **Fixed.** The caption ends at 34.40; the bedroom frame 34.43 is clean. |
| 7 | Title + caption echo (l60) | **Fixed.** The title is alone on 38.0-40.2 s. |
| 8 | Pixie gliding | **Fixed.** She has a bob and a ±1.6° sway per step (30.0-30.7 s at 0.1 s). |
| 9 | Modern controller | **Fixed** for adult Quest: our N64 pad (three prongs, grey) is in his hand at 43-44 s. Kid pad: see the note above. |
| 10 | Pixie on a floating card | **Fixed.** A wooden signboard on two posts stands in the field; Pixie stands on the grass between the posts, feet level with the post bases. |
| 11 | Reflection reads as a picture | **Fixed.** The TV goes dark, the switch-off line plays, then a grey, desaturated reflection with a glass streak appears (44.5-46.4 s). |
| S | Daytime birds over the night room | **Fixed.** Crickets (`lokif_swamp/cricket_2.ogg`). |

## What was looked at

- 0.5 s frames over the whole runtime, including **28-30 s** (the "Fix it" snap: the brackets turn gold, the frame
  levels, no artefacts) and **35-42 s** (the memory scan line at 35.5-36.5 s with faces clear; the vista and the
  dissolve).
- 1/30 s frames at the title exit (3.37-3.83 s), frame 0, the "Probably." cut (34.37-34.43 s), the dissolve
  (40.9-41.7 s) and the wordmark-to-card transition (47.73-48.1 s).
- 0.1 s frames of the D1 pull-out (21.0-22.1 s).
- Zoomed crops: Navi near the heads, both controllers, and Pixie's walk.
- Sweeps are in `build/critic/short2_v2_recheck/` (md and json only; the PNG frames were deleted).
