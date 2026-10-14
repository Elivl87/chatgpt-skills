# EP002 Short #2 v2: independent critic pass ("The remake's impossible job", 49.6 s, 9:16)

The critic did not build this piece and did not edit it. Reviewed artefact: `EP002_short2_hf_v2_preview540.mp4`
(540x960, 30 fps) and the composition `tools/hyperframes_ep002_short2/short/` at commit 637ef2b. The rubric used is
`docs/style/DESIGN_RUBRIC.md`. The flagged frames are in `CRITIC_v2_flags.jpg`; every timestamp there comes from an
exact seek.

## VERDICT: FIX (not ready for the Producer)

One automated error that the builder's 0.25 s sweep missed: the title is drawn over the HUD at 3.62-3.74 s. That is a
repeat of the exact defect the Producer rejected. There are also several taste and staging defects a demanding viewer
would notice. The redesign itself is a big step up. The panels are gone, Pixie is full figure, the world upgrades live
and sound is restrained. None of the fixes below needs new art or credits.

```
1 Hierarchy ........ FIX   - 22.0-25.9 s caption sits on the tiny hero (the focal point); 38.0-38.6 s title + caption say the same words
2 Overlaps ......... FAIL  - 3.62-3.74 s title fading over HUD (TEXT_OVER_HUD, error); 0.0-3.5 s balloon touches the title; Navi crosses faces 11.6-11.8 / 12.9-13.1 s
3 Safe/legibility .. PASS  - captions 74 px, inside x 6-85 %, y <= 80 %; HUD labels ("Attack", "038") are decoration only
4 Characters ....... FIX   - 30-32.5 s Pixie glides in a single pose (no walk); 43.0 s kid Quest holds a modern pad next to the N64; end card Pixie stands on a floating card
5 Art fit .......... FIX   - 17.6-22.5 s "1998" reads as a mosaic/censor blur, not N64 geometry; 44.3-46 s "reflection" reads as a picture on the TV
6 Motion ........... FIX   - 34.40-34.47 s "Probably." caption stays 2 frames into the bedroom cut; 17.6-21.2 s static mosaic + walk-in-place; title exit timing
7 Sound ............ PASS (with 2 notes) - 14 onsets, 17/min, 75 % rest, -14.1 LUFS, -4.6 dBTP; Navi = Producer clips only
8 Repeats .......... REPEAT at 3.62-3.74 s (title over HUD); others checked: no repeat (list below)
Automated: lint 0 err / 20 warn; frame_critic 0.25 s: 0 err / 2 warn, 0.033 s title sweep: 2 err (TEXT_OVER_HUD) + 1 warn;
           sfx_audit 0 err / 0 warn; check ok (0 err, 17 layout warn = oversized camera plates by design)
Top fix: Fade the HUD in only after the title is completely gone, and gate the title with a 1/30 s sweep.
Evidence: CRITIC_v2_flags.jpg; build/critic/short2_v2_independent*/ (flag PNGs)
```

## Issues, most severe first (timestamp, what, fix)

1. **3.62-3.74 s: title over the HUD (repeated Producer defect, automated ERROR).** In `index.html` the title fades
   out with `tl.to("#ttl1", {opacity:0, y:-24, duration:.25}, 3.46)`, so it is still visible until 3.71. The HUD,
   however, starts at `HUDON[0][0] = 3.62` with a 0.2 s ramp, and the clip `#ttl1Clip` runs until 3.74. For about 4 frames,
   "THE REMAKE'S / IMPOSSIBLE JOB" sits half-transparent under and over the hearts and buttons. On a phone this reads
   as the same ghost-over-HUD the Producer rejected. The builder's 0.25 s sweep stepped over it. A
   `--step 0.0333 --t0 0 --t1 3.9` sweep catches it (2 x TEXT_OVER_HUD). **Fix:** end the title exit by 3.55 at the
   latest, and start the HUD at >= 3.75, or end `#ttl1Clip` at the moment the title reaches opacity 0. Add a 1/30 s
   frame_critic sweep around every title in and out to the builder's gate.
2. **0.0-3.5 s: the empty balloon touches the title's lower edge** ("IMPOSSIBLE JOB" baseline rests on the balloon
   outline, at 0.3 s and 2.0 s and up to 3.47 s). It is declared as an allowed overlap, but it reads as two boxes
   colliding in the hook's single most important frame. **Fix:** lower the balloon about 40 px (1080 scale) or tighten the
   title's line gap so there is clear sky between them. The balloon must not compete with the title for the first focal point.
3. **17.6-22.5 s: the "1998 field" reads as a censor mosaic, not as an N64 world.** Big flat squares of blurred colour,
   with no horizon, no geometry and no landmark. Pixelation is a 2D/NES idea. N64 is low-poly with flat-shaded triangles,
   fog and blurry textures, exactly like the rock in E1, which is good. Inside the TV, with "An empty field in 1998 could
   feel enormous", the viewer needs to see a *field*. **Fix (free):** build the 1998 look from the same processing as
   the E1 rock: a low-poly flat-shaded terrain with distance fog and a horizon line. Keep the castle silhouette, also at
   B1 (8.6-11 s), which uses the same mosaic.
4. **22.0-25.9 s: the caption sits on the hero.** In the "rebuild"/"empty" beats the walking hero is at y ~ 690-800
   (of 960). Frames 22.0, 22.5, 23.5, 24.0, 24.5 and 25.0 show "Rebuild it too", "literally today..." and "and it might just"
   written across his body. He *is* the focal point ("how small he is"). **Fix:** for D2-D3 frame the hero higher
   (walk on the path's middle third, y <= 1250 at 1080x1920) or pull the camera so he sits above the caption band.
   Do not move the caption band.
5. **11.6-11.8 s and 12.9-13.1 s: Navi flies across faces.** The builder fixed four of these, but two remain. On
   "polygons" her glow sits on Pixie's mouth/chin (11.7 s), and on "animation" it sits on Quest's cheek and eye
   (13.0 s). **Fix:** move those two path keys 60-80 px off the heads (behind the shoulders or above the caps).
6. **34.40-34.47 s: "Probably." stays on screen 2 frames into the bedroom cut,** now written over kid Quest's
   chest. **Fix:** end the caption at the cut (34.40), or cut 2 frames later. The comedy sting (34.18) is fine.
7. **38.0-38.6 s: the title and caption say the same words at once** ("THAT IS THE / IMPOSSIBLE JOB" plus caption
   "That is the"). Two text blocks fight and one is redundant. **Fix:** hide captions while the l60 title is up (the
   title *is* the caption), as the hook should do too.
8. **29.6-32.5 s: Pixie glides up the road in one pose** (from-behind cut-out, sliding; no step cycle, no bob).
   Quest at least bobs. Seen from behind at 24 % height it is forgivable, but it is the last "game" image before the
   comedy beat. **Fix:** add the same 2-frame bob/step offset used for Quest to Pixie, or let them stand and let the camera glide.
9. **43.0 s (and 34.4-40 s in the 1998 room): kid Quest holds a modern Xbox/GameCube-style pad** (four colour face
   buttons, two sticks), not our N64 pad, next to our N64. PRODUCTION_PLAYBOOK §3 lists this exact mistake ("A modern
   controller in the 1998 story: our 3D N64 pad is composited over it"). In the night room this is the adult today, so it
   can pass. In the **1998 bedroom (15.1-17.6 s, 34.4-40.2 s)** check the controller in his hands at full size; if it is
   not the N64 pad, composite ours over it as block C did.
10. **47.6-49.6 s: on the end card Pixie stands on top of the thumbnail card,** which floats over a blurred
   background. She is anchored to the card, but the card itself is anchored to nothing, and a girl balancing on a
   floating rectangle is close to the "pasted box" the Producer dislikes. **Fix:** put the thumbnail on a surface
   (a shelf or the TV from the previous beat) or let Pixie stand beside it on the ground line and point at it.
11. **44.3-46.0 s: the CRT "reflection" reads as a picture shown on the TV,** not a reflection: a lit, coloured
   Quest portrait inside a dark screen, with a white bar across the middle at 44.6 (the switch-off line). The idea
   ("where the game went") is strong, but it needs to read as glass. **Fix:** darken it to 15-25 % opacity, desaturate it,
   mirror it, add a glass highlight streak, and keep the switch-off line before the reflection rises.

## The Producer's past rejections, item by item (rubric §8)

| Item | Result |
|---|---|
| Title ghost/echo copies | checked: no motion-blur copies (no GHOST_TEXT / MOTION_BLUR_ON_TEXT; 0.1 s and 1/30 s frames clean). |
| Title over the HUD | **REPEAT at 3.62-3.74 s** (issue 1). |
| Floating pasted boxes (speech box over the polaroid) | checked: panels gone. The balloon is anchored by a tail to the hero's mouth (pass), but it collides with the title (issue 2). The end-card thumbnail is a floating card with Pixie on it (issue 10: borderline). |
| Pixie only as a circular badge | checked: no repeat. Full figure in every beat she acts (0 CHAR_BADGE). |
| Debatable art choices | partly: the mosaic "1998" (issue 3) and the "reflection" (issue 11) will be debated; field, bedroom and night room fit their lines. |
| Busy / cheap sounds | checked: no repeat (14 onsets, 75 % rest). |
| EP003: character outside the boat / floating lantern ("every element sits right") | checked: everyone stands on the ground or path with a contact shadow, the kids sit on the floor, the N64 is on the floor, the CRT is on the table. Exceptions: issue 10 (Pixie on a floating card) and Navi, who floats by design. |
| Playbook §3: snap-back camera, person half out of frame, modern controller in 1998 | no snap-back seen (D1-D3 continue the move). E1: the rock covers Pixie for 0.7 s by design. Modern-looking pad: issue 9. |

## Sound (judged from plan + audit; not listened to)

- 14 onsets / 49.6 s = 17/min (budget 18), no 2 s burst > 3, 75 % of the runtime free of SFX, the loudest family
  "magical" x3 (same interaction, different files: correct consistency). Hits at -9 to -15 dB under Bram, beds at
  -24/-25. Master -14.1 LUFS, -4.6 dBTP (the MP4 audio was re-measured). Every cue has a `why` tied to an on-screen event.
- Navi uses only the Producer's original clips (HELLO 3.02, SFX_01 46.4, LOOK 48.2). No other Navi sounds.
- Note 1: the 44.34 "night outside" bed is `kresiek_outside/amb_outdoor1_loop` (spectral centroid 2.8 kHz, 50 % of
  the energy in 2-8 kHz, likely daytime birds). Over a moonlit night room, daytime birdsong contradicts the picture.
  Use a night bed (crickets/wind) or drop it and let the switch-off ring into silence.
- Note 2: at the budget limit, if anything is cut, cut the 12.21 bell ("lighting") before anything else. The beams
  carry it, and that leaves room after the sting.

## What was looked at

Full frames every 0.5 s over the whole runtime (3-up grids at 540x960). Every 0.1 s around the title (0-3.2), the
title exit (1/30 s, 3.4-3.9), each cut (8.2-9.0, 14.8-15.4, 16.4-17.8, 39.8-40.4, 42.6-43.2, 44.0-44.8), E1
(26.4-29.2), "Probably." (32.2-35.0) and the end card (46.0-49.6). Zoomed crops: balloon, Navi path 11.2-12.0, the
caption carry-over at the cut, both controllers. Some grid views were limited by the viewer, so before the next
critic pass the builder must re-check by eye at full 1080x1920: **35-42 s (memory scan and the vista pan with the
adults on the outcrop)** and **28-30 s (the "Fix it" snap)**. This critic did not approve those stretches.

## Taste, plainly

This is now a real short: one idea per beat, a character who acts, and sound with space. What keeps it from looking
spectacular is that the *game* half looks cheaper than the *life* half. The 1998 mosaic and the tiny hero walking
under the caption are the least designed 8 seconds, and they sit right after the strongest beat (the world upgrading
around them). The single biggest raise: rebuild the 1998 world as real low-poly N64 geometry (the E1 rock proves the
look works) and frame the hero above the captions.
