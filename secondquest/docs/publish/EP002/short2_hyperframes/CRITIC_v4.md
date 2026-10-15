# EP002 Short #2 v4 "Player Two" (22.0 s): independent critic pass

The critic did not build this piece and did not edit it.
- **Reviewed:** `EP002_short2_hf_v4_preview540.mp4` (540x960, 660 frames) and `tools/hyperframes_ep002_short2/short/` at commit 7c0befe.
- **Rubric:** `docs/style/DESIGN_RUBRIC.md`, the CLAUDE.md Shorts rules and every past rejection.
- **Flagged frames:** `CRITIC_v4_flags.jpg`.

## VERDICT: FIX

The script works as a comedy mini-arc:
- P1 knows everything, the Triforce, "bad decision";
- then "Player two?", the boot, she knows none of it;
- then the Deku Tree, "extremely personal problem", and her doubt;
- then the co-op vista, the wordmark and the sign.

The new techniques are used with purpose. There are no black or flicker frames (no frame averages below 25/255), and the automated gates are clean. Three craft defects must go before the Producer sees it, and two of them are repeats of things he rejected:
- a ghost dissolve;
- text over an acting hand;
- a one-frame 3D glitch.

```
1 Hierarchy ........ PASS  - one focal per beat; player-select and counters are each the beat's focal
2 Overlaps ......... FIX   - 19.90-20.17 s vista->field cross-dissolve leaves see-through Quest + princess over the field (ghost characters, repeat of v2b);
                             10.07-11.13 s the "0%/KNOWS IT ALL" counter overlaps Pixie's waving hand
3 Safe/legibility .. PASS  - text inside the Shorts safe column; captions 2.2 %+; HUD P1/P2 tags readable
4 Characters ....... PASS (note) - full figure where they act; Pixie tiny at the roots 14.2-15.8 s by design (CHAR_SMALL, the joke is scale)
5 Art fit .......... FIX   - 2.90 s the 3D Triforce shows edge-on as a thin gold bar (reads as a glitch); its flat plastic shading sits below the painted art
6 Motion ........... PASS (notes) - boot reads as a designed game transition (0.2 s of big blocks + P2 LOADING); split exit at 0.27-0.57 s is busy
7 Sound ............ PASS  - 6 onsets, 16/min, 85 % rest, -14.1 LUFS, -4.7 dBTP; Navi = Producer clips only (HELLO, SFX_01, LOOK)
8 Repeats .......... REPEAT: dissolve ghosts (v2b 41.0 s); text over an acting hand (rubric §2). Others checked: no repeat
Automated: lint 0 E / 16 W; frame_critic 0.25 s 0 E / 6 W (TEXT_OVER_CHARACTER x5 -> 1 real, see item 2; CHAR_SMALL by design);
           sfx_audit 0 / 0; no black/flicker frames (mean luma scan of all 660 frames)
Top fix: Hard-cut from the vista to the card field. Put the P2 counter in the sky above her raised hand, or on the other side.
         Hide the Triforce until it is past edge-on (or start it face-on), and give it a painted-light pass.
```

## Issues, most severe first

1. **19.90-20.17 s: ghost characters.** The vista cross-dissolves into the card field while the wordmark moves up. For about 8 frames, adult Quest and the princess are half-transparent over the field. This is the same "dissolve ghosts" the critic flagged in v2b (41.0 s), which the builder then fixed with a hard cut.
   **Fix:** after the wordmark settles, hard-cut to the field. The wordmark can keep its own move. Never dissolve between two shots that contain characters.
2. **10.07-11.13 s: the "0% KNOWS IT ALL" counter sits on Pixie's waving hand.** Her hand is the acting gesture of the beat ("delighted anyway"). frame_critic warns about this at 10.25 and 10.75-11.0 s, and by eye the digits overlap the raised hand and its wrist.
   **Fix:** move the counter up into the sky band (y about 300-420 at 1080) or to the screen-right of her head, clear of the hand. Keep it the same size as P1's counter for the callback.
3. **2.70-2.97 s: the 3D Triforce.**
   - **(a) The bug.** At 2.90 s it is caught edge-on: a single thin gold bar floating over the pedestal. It reads as a rendering glitch.
   - **(b) Timing.** It appears on "three" (2.70 s, tiny), before "golden triangles" (3.0 s).
   - **(c) The look (taste).** Face-on (3.0-3.7 s) it is a clean, flat-shaded, bevelled gold mesh with an even colour. Next to the painted temple, with its warm rim light and texture, it reads as a plastic 3D asset, not as part of the painting.
   - **Fix:**
     - Start the reveal on "golden" (3.0 s) and keep the spin's edge-on angle hidden (reveal at 30° past edge, or rise face-on with a small tilt).
     - Match it to the plate: key light from the window side (the light shafts come from upper right), a warm rim, a soft bloom, a faint painted-texture overlay or matcap with gold variation, and a contact glow on the pedestal top.
   - This is the beat where "Hyperframes al máximo" should look premium.
4. **10.03 s: the P2 meter starts at 100 %, then drains on "none".** A new player never "knew it all", so starting her at 100 % muddies the joke.
   **Fix (taste):** P2's meter slams in at 0 % on "none" (one hit, with a small shake or blink). This is cleaner and funnier as a mirror of P1's climb to 100 %.
5. **0.27-0.57 s: the split-screen exit.** The VETERAN and NEW PLAYER labels vanish on the first frame. Then the P2 half slides down in steps while the P1 half re-frames, and Pixie's panel is cut at varying heights for 9 frames. It reads busy rather than "slam".
   **Fix:** one move. The P2 panel exits down in 0.15-0.2 s (expo.in) while P1 holds, then PLAYER ONE slams. Or hard-cut to the full P1 frame on "one".

## Judgments asked for

- **Boot (8.97-9.13 s): reads as designed.** The big colour blocks last only about 4-5 frames, under a crisp "P2 LOADING" UI label. They resolve through finer pixels with a chroma fringe into the forest, landing on the "Player two" caption. With the select screen just before it, it reads as a game loading the second player, not as a censor mosaic. The optional polish: blocks aligned to an 8-px-style grid with a palette limit, not random RGB noise, so it reads as "retro console" rather than "corrupted video".
- **3D Triforce: not yet premium** (item 3). The idea and placement (rising over the empty pedestal, villain behind it, red flicker on "bad decision") are good.
- **Faked actions: none.** Characters only change by cutting between real poses (#01 smug, then #02 scared; Pixie #2c/#2d/#2e). Every other motion is camera, rack focus, UI, the Triforce and Navi.
- **The ending he loved:** kept. The co-op tags (P1 at top-left above Quest, P2 above the princess) and PRESS START read as designed. Only the exit dissolve is wrong (item 1).

## Past rejections, item by item

| Item | Result |
|---|---|
| Title ghost/echo copies | Checked: none. PLAYER ONE and PLAYER TWO? are opaque single layers; the wordmark is a cut. |
| Title over the HUD | Checked: none. The HUD comes in after PLAYER ONE (1.1 s); the select screen and the vista are HUD-off. |
| Pasted floating boxes | Checked: the player-select ports are a full-screen UI, not boxes over art, and the counters are HUD-style labels. OK. |
| Pixie as a badge | Checked: none. She is full figure in every beat. |
| Debatable art | The young Quest as "veteran" (builder's open point 1) reads through pose and the 100 % meter. Acceptable. |
| Busy/cheap sound | Checked: none (6 onsets). |
| Every element sits right | The Triforce floats over the pedestal by design (a relic). Pixie stands on the grass, and the sign stands on posts. OK. |
| Ghost dissolves / translucent characters | **REPEAT** at 19.90-20.17 s (item 1). The 17.57 s flash is a whole-frame flash, not a dissolve: OK. |
| Text over an acting face/hand | **REPEAT** at 10.07-11.13 s (item 2). |

## What was looked at

- **0.5 s frames:** the whole runtime.
- **1/30 s frames:** frame 0, the split exit (0.23-0.6 s), every detected cut (0.27, 2.10, 3.00, 3.77, 5.10, 6.83, 7.97, 8.97, 10.07, 11.17, 12.03-12.4, 14.17, 15.87, 16.40, 17.57 and 19.50 s), the 3D window (2.3-4.23 s), the shader window (8.93-9.4 s), the punchline hold (16.37-17.53 s), and the wordmark-to-card exit (19.4-20.6 s).
- **Sweeps:** `build/critic/short2_v4/` (md/json only). All PNG frames were deleted.
