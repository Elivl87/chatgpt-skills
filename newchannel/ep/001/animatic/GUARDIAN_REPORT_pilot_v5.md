# Guardian report · pilot v5 720p (8 blocks, 485.8 s) · 2026-10-29

**Verdict: PASS after fixes.** I found 3 defect classes (4 places). I fixed all of them in the kit and shot lists, re-rendered
blocks A, B, C2 and D1 (review, CHUNK 600), re-inspected the fixed frames, and re-joined the episode. `build_episode.py --reuse-wav` was not usable: `scratchpad/build/episode.wav` (512.66 s) and the events for C1/D2/E1/E2 there were stale. So I losslessly concatenated the 8 block videos and copied the v5 audio stream across unchanged (video-only fixes). Result: 485.80 s, 14 574 frames, the same as before. The 480p version was re-encoded at CRF 30.
Design checked against `art/lib/canon.js`: skin #d9a66c; Eli in the wine flannel 3bB, yellow tee, cargo pants and red backwards cap #c4243a;
Mila in denim outfit 2 with the purple skirt. Evidence (before / after): `GUARDIAN_REPORT_pilot_v5_small.jpg`.

Episode time = block time + offset (A 0 · B 47.10 · C1 102.97 · C2 147.13 · D1 223.20 · D2 289.85 · E1 363.68 · E2 412.49).

## Defects (all fixed)

| # | Where | Who / part | Defect | Fix |
|---|---|---|---|---|
| 1 | A19_bonk, A 43.88-43.95 s (2 frames) | Eli, eye | The brand dot bounced off the cap and covered Eli's screen-left eye. The gag read, but the eyes did not stay clear. | `art/scenes/wordmark_end.js` `dotPose`: on the bounce, x now eases out (1-(1-u)²) and the arc is 90 (was 45), so the dot goes sideways and up, never across the face. It still lands on the i. |
| 2 | D26_perdon, C2 72.75-76.05 s (ep 219.9-223.2) | Mila, skirt seated | The purple skirt, seated on the ground in 3/4, twisted into a bow-tie across the knee and shin. | `art/lib/outfits.js` `lap()`, knees-up branch: the skirt is now a band along the hip→knee thigh axis, with its top edge at the waist. |
| 3 | B18_mila, B 45.05-47.17 s (ep 92.2-94.3) | Mila, skirt seated | Same as #2. | Same fix. |
| 4 | E17_40, D1 57.43-61.30 s (ep 280.6-284.5) | overlay | The "hasta −40 %" box covered the RECREACIÓN ILUSTRADA label. | `shots_blockD1.js`: gauge moved from [800,120] to [920,120]. It is clear of the label, the cap and the ponytail. |

## Checked, no defect
- **Visor pose with the backwards cap (A09, A10, A13, G05):** the hand sits at the forehead or strap, the brows and pupils are free, and the look is motivated. A10_sure: smug/crossed arms read as intended.
- **B01_drag / B01_heels:** Mila pulls him by the flannel collar and the cloth stretches to her fist. Eli's expressions are right.
- **B22 / B21:** Mila walks the inner edge with her feet on the grass. The cars further along the arc sit behind her, which is correct occlusion. The bike sits on the inner edge, further back along the curve, so it is higher on screen. That is consistent, not floating.
- **D17 / D24 (back view, night):** the cap's visor hangs toward the camera and is readable at 3x. The ponytail and seated poses are fine.
- **E01, E15, E18:** the badge droop is the declared gag ("Pobre lema"). Faces and hands are clear.
- **F01_ring, F19_pat, F23_mila** (Mila's car is ringed), **G06_result, G20_ontime, H01_you, J03_eli:** no defects.
- **D2 strips:** the faces are ~15 px, the scale is golden, and nothing is wrong at that size.
- **Sweep:** I extracted first, middle and last frames of all 196 shots (606 frames) and looked at them as per-block sheets and in close-ups.

## Notes outside the character scope (for the art pass)
- B22: the parked bike's pedal crank turns (`P.bike(..., t * 9, ...)`) and the bike has no contact shadow. This is a prop issue, not Eli or Mila.
- `clothes_check.py` lab mode is still calibrated for the old look.
