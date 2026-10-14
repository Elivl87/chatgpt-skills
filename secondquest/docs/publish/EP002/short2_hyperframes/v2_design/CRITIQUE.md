# EP002 Short #2 v2: design-gate self-critique (builder pass, before any full render)

Judged against `docs/style/DESIGN_RUBRIC.md` on full-size 1080x1920 snapshots of the real composition
(`tools/hyperframes_ep002_short2/short`, Hyperframes 0.8.147), plus the automated gates. This is the builder's pass;
the independent critic pass (frame-critic skill) runs after the director's go, on the render.

Files: `STORYBOARD.jpg` (26 beats, times and lines), `K1`-`K8` key frames (full size), `../SHOT_LIST_v2.md` (focal
point, art + why, motion and sound per beat).

## The Producer's rejection, item by item (rubric §8: "checked: no repeat")

| Producer's complaint (v2 preview) | Root cause | Fix in v2 | Proof |
|---|---|---|---|
| Title with stacked ghost/echo copies | the Hyperframes motion-blur component on `#title` (8 sub-frame copies) | No motion blur anywhere (component removed from the page). Title = one mask-up line reveal (expo.out 0.34 s, 80 ms stagger), no echo. Same for the l60 callback and the wordmark (crisp scale 1.14 -> 1, no blur filter). | frame_critic: 0 GHOST_TEXT, 0 MOTION_BLUR_ON_TEXT; K1 |
| Title on top of the HUD (hearts, rupees, buttons) | HUD visible from frame 0; the title exit flew through it | The HUD is off while any title is on screen; it fades in only after the title has left (l52). Title zone y 190-420, HUD band y 120-300 never share the screen. | frame_critic: 0 TEXT_OVER_HUD; K1, STORYBOARD A1-A2 |
| Floating boxes (bubble with waveform over the polaroid, badge, panels) | ideas shown as stickers instead of inside the scene | All panels removed (meter, casting card, slider, polaroid, NEW QUEST banner, camera icon/wrench, check/?). Their ideas now happen in the scene: the world upgrades itself (l43-l46), the frame itself is the old camera (viewfinder + rock it clips into, l54), the memory is a real place that gets "improved" (l59). The one balloon left belongs to the hero: its tail ends at his mouth, it is the "space for your imagination", and it pops when Pixie arrives. | rubric §2; STORYBOARD |
| Pixie in a circle | portrait badge | Pixie acts full figure in 9 beats (A3, B1-B2, C1, F1-F2, G1, H1, I1, J2): tunic #2c/#2d/#2e/#2f beside young Quest, kid #6b in 1998, adult library #8 in the night room, library #1 on the end card. Role: the one who has to decide, who looks up at the upgrades, who knew the way in 1998, who doubts ("Probably."), who sends you to the episode. | frame_critic: 0 CHAR_BADGE; K2, K4, K6, K8 |
| Debatable art choices | art picked because it was available | One-line justification per beat in `SHOT_LIST_v2.md`. Fewer, bigger images: 6 backgrounds for 49.6 s (field, field 1998 look, 1998 bedroom, vista, night room, card). | SHOT_LIST_v2.md |
| Sounds: 80 different sounds, busy | "no file twice" picker filling every beat | 14 onsets in 49.6 s INCLUDING Navi and both beds (17/min, budget 18), 75 % of the runtime free of SFX, hand-picked premium CC0 files with a `why` each (`short/assets/sfx_plan.json`); no 8-bit, creature or boing; the comedy sting lands after "Probably.", on her look. Navi: the Producer's clips only (HELLO, SFX_01, LOOK). | sfx_audit: 0 errors, 0 warnings |

## Issues found and fixed during this gate (builder's own passes)

1. Hook: the balloon covered the hero's cap and the title sat on the castle -> title moved into the sky (y 190), hero
   made bigger (low-angle hero shot), balloon re-anchored up-left of his head with a long tail to his mouth.
2. Hook: Pixie had to enter into a reframed shot that pushed the balloon off-screen -> no reframe; the balloon pops on
   "suddenly" and Pixie steps into its place (the action now carries the line).
3. Screen direction: Pixie switched sides between shots -> front shots always Pixie screen-left, back shot (E)
   screen-right (geometrically the same side of Quest).
4. "Probably.": the comedy push cut Quest in half at the frame edge -> push limited (z 1.42 -> 1.66) so both stay whole.
5. 1998 bedroom: kid Pixie's pointing hand was cut by the frame edge and the l60 title sat on her head -> kids
   re-staged a step further into the room (smaller by perspective only, face rule kept), camera holds both whole,
   title clear of them.
6. Vista (l61): opened on a huge crop of the characters and ended with a sliver of Pixie's dress at the edge -> opens
   on both whole, pans to the castle until she is fully out.
7. Navi sat on Quest's face (l53), on Pixie's face (l43) and on Pixie's hair (l58, l61) -> all four paths moved off
   faces.
8. `hyperframes lint` error `gsap_cold_seek_hidden_fromto_missing_reveal` on `#tvLine` (cold render worker could
   encode the CRT switch-off invisible) -> every state set explicitly.
9. `hyperframes check` text_occluded x 9: Navi's full-frame canvas counted as covering every title -> her canvas is now
   sized to her glow + a short trail every frame and routed so it never passes over text (card: down Pixie's side,
   then into the thumbnail under the text).
10. Captions and every text block moved inside the Shorts text-safe column (x 65-918, centre x 491; v2 captions went
    to x 950).
11. CHAR_SMALL on l55-l56 (24 %) -> the "easy" glide ends closer (z 1.3); a 24 % warning remains at 29.75-32.25 s
    because the two walk away up the road (smaller by perspective, seen from behind): accepted, by design.

## Automated gates (2026-10-14, final state of the page)

- `hyperframes lint`: **0 errors**, 19 warnings (15 nested_structure_needs_subcomposition, 3 duplicate_media_discovery_risk,
  1 composition_file_too_large: structure advice, not defects).
- `python3 scripts/frame_critic.py tools/hyperframes_ep002_short2/short --step 0.25 --lint --out build/critic/short2_v3`:
  199 samples, **0 errors**, 2 warnings (CHAR_SMALL 21.25-25.75 s, 18 %: the tiny hero in the "enormous / empty" field,
  intended; 29.75-32.25 s, 24 %: walking away up the road).
- `python3 scripts/sfx_audit.py short/assets/sfx_plan.json --mix short/assets/narration.wav --kind short`:
  14 cues, 14 onsets, 17/min, rest 75 %, -14.1 LUFS, -4.7 dBTP, **0 errors, 0 warnings**.
- `hyperframes check . --json --at-transitions`: **ok** (lint 0 E, runtime 0/0, layout 0 E / 16 W: the camera plates
  are larger than the frame by design (container_overflow / escaped_container), motion 0/0, contrast 0/0).

## Rubric sections (builder's verdict)

| § | Verdict | Notes |
|---|---|---|
| 1 Hierarchy, one focal point | PASS | Focal per beat in SHOT_LIST_v2.md; max 2 text blocks at once (title + captions on A1, G2; card text alone on J2). |
| 2 Nothing overlaps unless designed | PASS | No text on HUD/faces; declared overlaps: the balloon (anchored to the hero), Pixie standing on the thumbnail's edge (end card), captions over legs/ground only. |
| 3 Safe zones, legibility | PASS | All text in x 65-918, y 190-1500; smallest text 74 px captions (floor 42). |
| 4 Characters | PASS (1 note) | Full figure everywhere; Pixie/Quest measured on K6: face 0.92 x his, height 0.97 x his (cut-out incl. her ponytail; ~0.95 to the top of the head). Note: D1-D3 keep the hero small on purpose ("enormous", "empty"; CHAR_SMALL warning, wide establishing beat). |
| 5 Art fits the beat | PASS | One-line why per beat. |
| 6 Motion | PASS (to confirm in render) | One primary move per beat; ease-out in, ease-in out; comedy beat anticipation (the pause) -> hit (pose + push) -> hold (tilt). Real-time motion is checked in the preview pass. |
| 7 Sound restraint | PASS | sfx_audit 0/0; 14 onsets, rest 75 %, -14.1 LUFS, -4.7 dBTP. |
| 8 No repeated mistakes | PASS | Table above. |

## Known limits / open points for the director

- Captions cross the lower bodies of characters in some beats (A1-A3 boots, C1/G1 kid Quest's controller, D/E backs
  of the walking hero): never a face. A caption band higher than y 1340 would sit on faces in the field shots.
- The 1998 look of the field is our processing of plate #11 (blocky, fogged); the characters stay HD in it, as in the
  episode's block G (the point is the world being "upgraded" around the same two people).
- The vista (#17+18) shows adult Quest and princess Pixie (baked into the plate): the only beat where they are adults
  in costume; chosen because it is the episode's "new look" image and the remake line asks for exactly that.
- Not yet done (after the go): the 540x960 preview render, finish pass, contact sheet every 0.5 s, independent critic.

## Independent critic v2 (FIX) -> what changed (builder, 2026-10-14)

Every item of `../CRITIC_v2.md` was applied. The gates now include a 1/30 s frame_critic sweep around every title
entrance/exit, the l60 title, the wordmark and card, and every cut. They are scripted in
`tools/hyperframes_ep002_short2/gates.sh`, which exits 1 on any error.

| # | Critic item | Fix |
|---|---|---|
| 1 | Title fading over the HUD 3.62-3.74 s (repeat) | The title fades out (no move) at l52-0.39 and reaches opacity 0 at 3.50. Its clip ends at 3.55. The HUD starts at l52+0.15 = 3.79. 1/30 s sweep 3.0-4.0: 0 errors. |
| 2 | Balloon touching the title | The balloon is 22 px (plate) lower and the title lines are 10 px tighter: clear sky between them. |
| 3 | "1998" reads as a censor mosaic | New `tools/hyperframes_ep002_short2/n64_look.py`: an N64 skybox gradient above the traced mountain line of #11, flat-shaded low-poly terrain (big facets near, small far, finer on the castle so its silhouette survives), and fog at the horizon. The "More polygons" mid step is a finer low-poly. Used in B1 and D1-D2. |
| 4 | Caption on the tiny hero 22-25.9 s | D2-D3 frame him on the right third (screen x ~ 840-880), clear of the centred captions. A higher placement is impossible at z >= 1 on this plate, because the road sits in the bottom band. |
| 5 | Navi across faces 11.6-11.8 / 12.9-13.1 s | "Polygons": she goes round the outside of Quest and over the heads. "Animation": she orbits above the caps (y 530-630). |
| 6 | "Probably." 2 frames into the cut | build.py ends every caption at the next cut (and when the l60 title enters). |
| 7 | Title + caption with the same words (l60) | The l60 captions are dropped (the title is the caption). The l59 tail also ends when the title enters. The hook keeps its caption, because its words differ from the title. |
| 8 | Pixie gliding 29.6-32.5 s | She walks in Quest's step rhythm: a bob plus a +-1.6 deg sway per step (one-pose walker). |
| 9 | Controllers | Checked at full size. Adult Quest (night room, an N64 on the CRT) held a modern-shaped pad: our 3D N64 pad (`props3d/n64_pad_room.png`) is now in his hands, graded like him, with his fingers repainted over it. Kid Quest (1998 bedroom, block C art) holds a plain grey corded pad with no modern features (approved in block C): left as drawn, because an overlay would sit on top of his fingers. |
| 10 | End card: Pixie on a floating card | The thumbnail is now a wooden signboard (frame + two posts with a contact shadow) planted in Hyrule field. Pixie (#2c tunic, waving, full figure, 26 % of the frame) stands on the grass between its posts. The text sits in the sky above. Navi flies into the sign. The thumbnail is still whole and undistorted. |
| 11 | The reflection reads as a picture | New plate `room_dark` (TV just off, dark glass). The switch-off line plays on it, then the reflection rises over 0.7 s: mirrored, grey-blue, 21 % opacity, with a diagonal glass highlight streak. |
| Sound | Daytime bed at 44.34 s | Replaced by crickets (`lokif_swamp/cricket_2.ogg`, -17 dB within the CRT-off layer). Still 14 onsets; the "lighting" bell stays (no cut needed). |
| Own check | 28-30 s and 35-42 s at full size | 28-30 s: fine. 35-38 s: fine (the scan line reads; faces clear). 41.2 s: the vista pan dragged princess Pixie half out of frame, so it is replaced by a 0.45 s dissolve from the two of them to the castle framing. |
