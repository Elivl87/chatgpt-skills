# EP001 Short #3 "The work loop": independent design critic, v2 (2026-10-19)

Critic: frame-critic skill (did not build this). Material: `renders/EP001_short3_v2_preview720.mp4` (720x1280,
640 frames = 21.33 s video, 21.46 s audio). I checked every frame (1/30 s) in the changed windows (2.7–3.8, 6.0–8.7,
10.5–11.0, the card 18.40–20.47 and the seam 20.40–21.33). I also spot-checked the new field timing (13.3–15.3), the
freeze (15.27–16.70) and the office (16.67–18.47) at full 720 size, plus contact sheets every 0.5 s. I did not re-run
the builder's gates. I re-ran sfx_audit and loudness. Evidence:
`/tmp/claude-0/-home-user-chatgpt-skills/14b914a9-8dc9-599e-8a45-e7f574c02142/scratchpad/c4/` (sheet1/2.jpg, strips.jpg,
bed.png, deal.png, bolt_card.png, field_seam.png, fieldtop.png).

## VERDICT: FIX (one small framing item; the four v1 fixes are all verified)

```
1 Hierarchy ........ PASS
2 Overlaps ......... PASS  - bolt clear of the caption by ~50 px (10.73); captions now start on each shot's first frame (3.767, 6.100, 16.667)
3 Safe/legibility .. PASS  - FULL EPISODE at 64 px; all text inside x 6–85 %, y 9–80 %
3b Text source ..... PASS
4 Characters/props . FIX   - 14.0–15.27: the farm buildings on the horizon are sliced by the top edge (fix 1)
5 Art fit .......... PASS
6 Motion ........... PASS
7 Sound ............ PASS  - 5 onsets, 13/min, 63 % rest, -14.3 LUFS, TP -4.7; new OVER_VOICE warning (scratch at -2 dB) sits in a pause, see P2
8 Repeats .......... checked: no repeat
Automated: builder gates 0 errors (reported); sfx_audit 0 err / 4 warn (my run)
```

## v1 fixes: verified
1. **Dealership tractor (6.10–8.70): verified.** At 6.50 it stands on the lot gravel behind the fence, with a shadow
   under its tyres. The wallet is in front on the left. The 7.07 snap lands on the wallet's face, and the tractor stays
   on the ground at the top right (7.07, 8.00).
2. **"wake up..." caption: verified.** It is on from the cut (2.833) to 3.733, with "wake" then "up..." highlighted.
3. **One bed: verified.** The plate now shows the wall, shelf and dresser; only the cut-out bed is in shot (2.833–3.733).
4. **Bolt: verified.** It starts right of the caption and its tip ends on the raised fist (10.733).
- v1 polish taken: the wallet on the wordmark is now readable (~12 % of height) and stands on top of the wordmark.
  Captions start on each shot's first frame.

## Fix list (blocking)
1. **14.0–15.27, the wide field: the farm buildings are sliced by the top edge.** `#cField` now ends at
   `view(1.2, QX, QY)`, a deliberate change to keep the tractor visible. In that end framing the horizon farm (barns,
   silos) is cut along the top edge, roughly the top 15 px at 720 (frames 14.33–15.20). That is a prop half out of
   frame, and the "gigantic field" payoff loses its horizon. Fix: either tilt the end framing down, by raising QY or
   moving the image top, so the horizon line and the farm sit fully inside the frame (keep the tractor at the zoom
   level 1.2, which stays visible at feed size), or push the horizon fully out of the frame.
   - Check: frames 14.67 and 15.20 show no building cut by the frame edge.

## Optional polish
- P1 2.833–3.10, before the snap: the bed's left post ends at ~94 % of frame height above a blurred, colourful
  rug/quilt strip. It sits in the bottom Shorts UI zone and is hard to notice. Lowering the bed ~80 px would put the
  post off frame.
- P2 The record scratch is at -2 dB vs the voice (OVER_VOICE). It lands in the pause right after "then...", so it does
  not mask a word, but -6 dB would match the other hits.
- P3 Audio is 21.46 s and video is 21.33 s (640 frames; DUR 21.45 → 643.5). The seam alarm rings until the audio ends
  at -23 dB. Trim the audio to the last video frame, with a 10–20 ms fade, so the loop restarts cleanly. Frame 0 vs
  the last frame differs by 2.45/255 on average (film grain only).
- P4 sfx_audit still flags the alarm and the scratch as HARSH (thin, high-pitched): add a low body layer (as in v1).

## Spot check (unchanged or retimed windows)
- Freeze 15.27–16.67: desaturated freeze on "then...", the scratch in the pause, then a hard cut to the office with
  the caption on the cut frame.
- Office 16.67–18.47: the snap zoom is clean and the caption is sharp.
- Card 18.47–20.47: lines build in, the wordmark and the wallet land, FULL EPISODE ↓ appears. The card shows 4 text
  blocks (accepted in v1).
- Seam 20.47 → 21.33: frame 0's composition returns and the hook text grows in. The last frame matches frame 0.

## Taste
v2 fixed everything the Producer would have caught first. Only the field's end framing is left: give the dot its
horizon, and the best joke in the Short lands harder. After fix 1 I need to see only frames 14.67 and 15.20; no
full critic round is needed.
