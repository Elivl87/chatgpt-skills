# EP002 Short #2 v3 (22.6 s): independent critic pass

The critic did not build this piece and did not edit it. Reviewed: `EP002_short2_hf_v3_preview540.mp4` (540x960,
30 fps, 22.64 s) and `tools/hyperframes_ep002_short2/short/` at commit 58f10ad. The rubric is
`docs/style/DESIGN_RUBRIC.md`, together with the new Producer rules in `CLAUDE.md`:
- Shorts run 20-25 s, with "hook <= 2 s -> escalation -> payoff -> end card".
- Never fake an action.

Flagged frames are in `CRITIC_v3_flags.jpg`.

## VERDICT: FIX

The new spine is right and much stronger than v2: silent hero, then the world upgrades, then the 1998 twist, then
the princess vista and "That is the impossible job", the wordmark, and the thumbnail. No action is faked, and the
automated gates are clean. But the **first 8.6 s are the slowest part of a 22 s Short**. Two near-identical static shots
take 38 % of the runtime, against the Producer's "hook <= 2 s" and "dopamina". There is also a **ghost frame of text
over text** at the payoff exit. That is the exact family the Producer rejected. Fix both before he sees it.

```
1 Hierarchy ........ FIX   - 8.63-11.0 s the 1998 tree is unreadable brown murk (no focal point for 2.4 s)
2 Overlaps ......... FIX   - 19.87-19.93 s title fades out while the wordmark fades in on the same spot (ghost text over text);
                             13.2-14.3 s white diagonal chevrons over the trunk read as a glitch/watermark
3 Safe/legibility .. PASS  - captions inside x 6-85 %, y <= 80 %; no text on the HUD (1/30 s sweeps)
4 Characters ....... FIX   - 17.67-18.65 s the princess's hem is cut by the right frame edge; 15.1-17.7 s the N64 is half out of frame and the TV she points at is off-frame
5 Art fit .......... PASS (notes) - Deku tree, princess vista and thumbnail sign fit the Producer's picks; "sound" shows leaves, not a flock
6 Motion ........... FIX   - hook 0-8.6 s: two static compositions (5.3 s + 3.3 s); 18.73 s semi-transparent 1.2x slam frame; 5.33 s Pixie seen through the balloon
7 Sound ............ PASS  - 6 onsets (16/min), 83 % rest, -14.2 LUFS, -4.6 dBTP; Navi = Producer clips only (HELLO, SFX_01, LOOK)
8 Repeats .......... ghost/echo text REPEATS at 19.87-19.93 s; others checked: no repeat (list below)
Automated: lint 0 E / 13 W; frame_critic 0.25 s 0 E / 0 W; 1/30 s windows (0-0.6, 3-4, 5-6.3, 8.3-9, 10.8-15.4, 17.4-22.6):
           0 E / 1 W (CHAR_SMALL 21.2 s, one frame as Pixie fades in); sfx_audit 0 / 0; hyperframes check ok (0 E)
Top fix: Re-cut the hook into 4-5 real shots keyed to the words (punch-ins, Navi's flash, cuts between the poses
         that exist), and cut, not cross-fade, from the title to the wordmark.
```

## Issues, most severe first

1. **0-8.6 s: the hook is static for 38 % of the Short.**
   - **What happens now:** 0-5.3 s is one composition (title, Quest, balloon). It changes only by the balloon dots, a
     2-3 % breath, the title leaving and the HUD fading in. Then 5.3-8.6 s is a second static two-shot, with one pose
     swap at about 6.4 s.
   - **The rule:** CLAUDE.md sets "hook <= 2 s -> escalation". The escalation does not start until 8.6 s, and from
     there something changes every 0.6-1.2 s, so the opening is visibly a different, slower video.
   - **Fix, with no fake action (camera, light, Navi and cuts between existing poses only):**
     - 0.0 s: keep frame 0 as the finished title still (good for the feed thumbnail).
     - About 0.6 s ("silent"): the title snaps out (one fast cut, not a fade). Punch in to a medium shot of Quest
       plus the balloon, about 1.0 -> 1.25 over 0.25 s with expo.out. It is a new shot, so camera continuity is fine.
     - About 1.6 s ("space"): hold. The empty balloon pulses once, its outline brightening (a light, not an action).
     - 3.0 s (Navi "Hello!"): Navi bursts in with a small white flash and a lens glint over the field. This is the first
       spike, and the HUD comes in on her flash.
     - About 3.7 s ("Give that character a voice..."): cut to a low-angle hero framing (waist-up, a different crop of
       the same art), balloon in frame.
     - 5.3 s ("suddenly"): the balloon pops (scale 1 -> 1.15 -> 0 in 3 frames, no cross-fade). Hard cut to the wide
       two-shot with Pixie already there in #2c.
     - About 6.4 s ("decide"): hard cut to a waist-up of Pixie in #2e (hand on chin): her real pose, framed for her.
     - About 7.6 s ("silence sounded like"): cut back to the two-shot, or slowly push in on the empty space where the
       balloon was.

     That gives 6-7 events in 8.6 s instead of 2, all from existing art.
   - **Optional (the Producer would decide):** shorten the hook by starting the Short at l53 or l42. That changes
     which approved lines are used, so it goes to him as a proposal, not as a change.
2. **19.87-19.93 s: the title and the wordmark cross-fade on the same spot.**
   - **What happens:** "THAT IS THE / IMPOSSIBLE JOB" fades out while "SecondQuest" fades in over the same area. For 2-3
     frames, two semi-transparent texts sit on each other.
   - **Why it matters:** this is the ghost/echo-text defect the Producer rejected.
   - **Fix:** a hard cut. Title off, then the wordmark lands on the next frame (or after 2 frames of the empty vista).
     Never cross-fade two text layers.
3. **17.67-18.65 s: the princess's hem is cut by the right frame edge**, which breaks "nothing cut". The builder knows
   about it. **Fix**, choose one:
   - (a) A deliberate waist-up two-shot of the two of them (allowed by rubric §4). The crop then reads as intended.
   - (b) Frame on the princess (her whole dress in, about 3 % margin) and let Quest be cut by the left edge. His back
     and shield read even when cropped, so this framing is clearly designed.
   - (c) A slow 1 s pan from Quest to the princess that ends with her whole.
4. **8.63-11.0 s: the 1998 tree reads as murk.**
   - **What happens:** the low-poly pass on an extreme close-up of bark gives 2.4 s of brown and green noise, with Navi
     as the only readable thing. The viewer cannot tell it is a tree or a face until the upgrade at 11.1 s.
   - **Fix:** open on the whole giant tree in its N64 look (silhouette, face and canopy readable, big facets). Do the
     punch-in to the face *on* "More polygons", so the upgrade lands on a face the viewer has already seen.
5. **13.2-14.3 s ("Better animation"): white translucent diagonal chevrons over the trunk.** They read as a
   watermark or a render glitch. "Animation" is also not visible: there are no leaves falling in this shot (they fall
   in the lighting shot before it). **Fix:** remove the chevrons. Put the falling-leaves layer on this shot, so the word
   has its event.
6. **18.73 s: the first slam frame of "IMPOSSIBLE JOB" is semi-transparent at 1.2x** and runs past both frame edges
   (zoomed crop). It is one frame, but it is a blurry text copy. **Fix:** the slam starts opaque (scale 1.2 -> 1, opacity
   1 from frame 1), or the text appears on the frame after the flash peaks.
7. **15.1-17.7 s (1998 bedroom): the N64 console is half out of frame** at the bottom right, and the CRT kid Pixie is
   pointing at is entirely off-frame. She points at nothing, which weakens the twist ("familiar" = this TV, this
   Saturday). **Fix:** reframe one step right/wider so the CRT edge and the whole console are in, or crop the console
   fully out.
8. **5.33-5.37 s: Pixie shows through the popping balloon** (a 2-frame cross-fade). **Fix:** make the pop instant
   (the same fix as item 1).
9. **14.23-15.1 s ("Better sound"): the plan says "a flock bursts out of the canopy"**, but on screen there are only
   falling leaves; no birds read at 540 px. The birdsong cue has no picture. **Fix:** a visible flock (6-10 birds lifting
   across the canopy, as in v2's B2), or a brighter bird group.

## Faked actions (Producer's new rule): checked, none

- Pixie is revealed by the pop, not walked in.
- Her two poses (#2c waving, #2e hand on chin) are swapped by a cut, with no bob or glide.
- Quest never moves. The kids are static, and so are the vista and the card Pixie (she fades in standing).
- All movement is camera, light, Navi, leaves and cuts.
- Caveat: the 0.15 s "settle" on Pixie's reveal is a scale settle, not a step. Acceptable.

## Arc coherence

The spine reads: a silent hero → "better is measurable" with the world upgrading word by word on the Deku tree →
"but familiar is not" in the 1998 bedroom (twist) → the remake's new look (princess vista) → "That is the impossible
job" → wordmark → thumbnail "EXCEPT YOU". Each part is one place and one idea.

Two weak links:
- **The hook is long** (item 1).
- **The twist's object is off-frame** (item 7).

The payoff works: a hard cut on "impossible" to the castle in the sun, one impact, and the title. The end card follows
the Producer's brief: it ends on the thumbnail, whole, on a sign with Pixie under it, and Navi says "Look!".

## Past rejections, item by item

| Item | Result |
|---|---|
| Title ghost/echo | **REPEAT** at 19.87-19.93 s (title x wordmark cross-fade, item 2). Item 6 is a related one-frame ghost. |
| Title over the HUD | Checked: no repeat. Frame 0 is the title with no HUD. The HUD comes in after the title exit; the payoff is HUD-off. |
| Pasted floating boxes | Checked: no repeat. The balloon's tail is anchored to Quest, and the sign stands on posts in the field. |
| Pixie as a badge | Checked: no repeat (full figure, 0 CHAR_BADGE). |
| Debatable art | The Deku tree, princess vista and thumbnail follow the Producer's own picks. The murky 1998 tree (item 4) will be debated. |
| Busy/cheap sounds | Checked: no repeat. There are 6 onsets, and the "lighting" bell was cut. |
| Every element sits right / nothing cut (EP003 boat, lantern; playbook) | **Repeats:** the hem cut by the edge (item 3) and the N64 half out of frame (item 7). Otherwise the characters stand on the ground, the kids sit on the floor, and the sign has posts with contact shadows. |
| Faked actions (new) | Checked: none. |

## Sound (from the plan and audit; not listened to)

| Time | Cue |
|---|---|
| 3.02 | NAVI_HELLO |
| 11.11 | polygons swell |
| 14.23 | birds |
| 18.65 | punch + soft heavy impact (the one bass drop, -7 dB, in line with CLAUDE.md "~7 dB under the voice") |
| 19.92 | bell + NAVI_SFX_01 |
| 21.34 | NAVI_LOOK |

- 16/min, 83 % rest, -14.2 LUFS, -4.6 dBTP.
- Every cue has a reason, and Navi is only the Producer's clips.
- The rate is at the 18/min budget for 22.6 s (about 6.8 onsets), so the hook fix should add *picture* energy, not
  cues.
- If the Producer asks for "explosive", the one swap worth making is a short low riser into the 18.65 s cut (counted as
  part of that cue's layer).

## What was looked at

- 0.5 s frames over the whole runtime.
- 1/30 s frames on every cut, found by frame difference: 5.33, 8.63, 12.23, 13.2, 14.23, 15.13, 17.7, 18.7 and 20.77 s.
- The payoff slam (18.6-19.8 s), the title-to-wordmark exit (19.77-20.03 s), the card build (20.67-22.6 s) and
  frame 0.
- Zoomed crops: the chevrons, the bedroom edge, the hem and the slam frame.
- Sweeps are in `build/critic/short2_v3/` (md/json only; the PNG frames were deleted).
