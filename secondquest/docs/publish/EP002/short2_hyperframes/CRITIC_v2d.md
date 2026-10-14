# EP002 Short #2 v2.3: independent critic, FINAL verdict (after commit 7eba50c)

The critic did not build this piece and did not edit it. Reviewed: the re-rendered
`EP002_short2_hf_v2_preview540.mp4` (540x960). Previous passes: `CRITIC_v2.md` (FIX, 11 items), `CRITIC_v2b.md`
(FIX, 3 polish items) and `CRITIC_v2c.md` (FIX, reflection).

## VERDICT: PASS (ready to send to the Producer)

- **Last item, the CRT reflection (44.5-46.5 s, checked by eye at 1/30 s plus 100 % crops at 45.4, 46.0 and 46.3 s):**
  fixed. The whole head (hair, eye, nose, chin, hand at the chin) sits in the upper part of the glass, is not cut by
  the bezel, is grey-blue at about 30 %, is mirrored, and keeps the glass streak.
  - **Sequence:** switch-off line at 44.5 s, dark glass at 44.67-44.83 s, the reflection rises 45.0-45.33 s and holds
    to 46.4 s, then the wordmark lands at 46.5 s.
  - It reads as a reflection, not a picture, and the line "where their game went" now has its image.
- **Nothing else changed.** The diff since my last pass touches only the reflection staging (`stage_assets.py`), the
  gate script, the builder's notes and the preview. A 0.5 s pass over the whole 49.6 s shows every other beat as in v2.2:
  - frame 0 shows the finished title;
  - the HUD only comes in after the title has gone;
  - the N64 field and its pull-out work;
  - the E1 camera clip plays as before;
  - the "Probably." caption ends at the cut;
  - the "That is the impossible job" title is alone on screen;
  - the vista has a hard cut at 41.47 s;
  - the signboard end card builds after the wordmark.

```
1 Hierarchy ........ PASS
2 Overlaps ......... PASS
3 Safe/legibility .. PASS
4 Characters ....... PASS
5 Art fit .......... PASS  - reflection readable (fixed in v2.3)
6 Motion ........... PASS
7 Sound ............ PASS  - 14 onsets, 17/min, 74 % rest, -14.1 LUFS, -4.6 dBTP; Navi = Producer's original clips only
8 Repeats .......... checked: no repeat
   - title over HUD, ghost/echo text, pasted floating boxes;
   - Pixie as a badge, debatable art, busy SFX;
   - EP003 "every element sits right";
   - modern pad in the 1998 story: our N64 pad in the night room; kid pad is generic, period-plausible block C art.
Automated: lint 0 E / 20 W; frame_critic 1/30 s 44.5-46.5 s 0 E / 0 W (earlier 0.25 s full sweep and 1/30 s windows
           of v2.2: 0 E); sfx_audit 0 / 0 on the new preview's audio
```

Notes for the Producer's package. These are not defects:
- The kid's controller in the 1998 bedroom is the approved block C art: a plain grey corded pad, not N64-shaped.
- The adults on the vista (40.2-41.5 s) are baked into the episode's final plate #17+18.

Sweeps: `build/critic/short2_v2d/` (md/json only). All PNG frames were deleted. No flags sheet: nothing is flagged.
