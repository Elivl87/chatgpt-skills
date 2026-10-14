# EP002 Short #2 v2.2: independent critic, final pass (after commit 792d853)

The critic did not build this piece and did not edit it. Reviewed: the re-rendered
`EP002_short2_hf_v2_preview540.mp4` and `tools/hyperframes_ep002_short2/short/`. Previous passes:
`CRITIC_v2.md` and `CRITIC_v2b.md`. Frame sheet: `CRITIC_v2c_flags.jpg`.

## VERDICT: FIX (one item: the CRT reflection now reads as a smudge)

All three v2b items are fixed, the automated gates are clean, and the 0.5 s pass found no new defects. One beat lost
its idea in the last change. After the reflection was shrunk to about 60 %, it moved so low in the glass that only a
dark curve shows at the bottom edge of the screen. There is no face and no readable head (44.9-46.4 s; sheet: full
frame and the glass at 100 %). On a phone it reads as a smudge or artefact on a dark TV with a highlight streak. The
picture for "where their game went" is gone. Everything else is ready.

**Fix (no new art, a few minutes):** place the whole head inside the glass: face, hair and chin, about 35-45 % of
the screen height, its top in the upper third of the screen, not cut by the bezel. Raise it to about 28-32 % opacity
with the same grey-blue, mirroring and streak, so the eyes and nose read at 540 px. Check it at 46.0 s at 100 % crop.

```
1 Hierarchy ........ PASS
2 Overlaps ......... PASS  - 41.47 s hard cut (no ghost dissolve); card text ~48.05 s, sign ~48.11 s, after the wordmark settles
3 Safe/legibility .. PASS
4 Characters ....... PASS
5 Art fit .......... FIX   - 44.9-46.4 s reflection unreadable (cropped low in the glass, too faint)
6 Motion ........... PASS  - frame 0 = finished title + balloon; no reveal slices
7 Sound ............ PASS  - 14 onsets, 17/min, 74 % rest, -14.1 LUFS, -4.6 dBTP; Navi = Producer clips only
8 Repeats .......... checked: no repeat (title/HUD, ghost/echo text, pasted boxes, badge, floating elements, busy SFX)
Automated: lint 0 E / 20 W; frame_critic 0.25 s 0 E / 2 W (CHAR_SMALL, intended wides);
           frame_critic 1/30 s on 0-0.6, 40.9-41.8, 44.5-46.5, 47.5-49.6: 0 E / 0 W; sfx_audit 0 / 0
```

## v2b items, verified at 1/30 s

| Item | Result |
|---|---|
| Frame 0 sliced title | **Fixed.** 0.00, 0.03, 0.07 and 0.10 s show the finished title and the balloon; the first caption comes in at about 0.2 s. |
| 41.0 s dissolve ghosts | **Fixed.** The two of them stay solid through 41.43; at 41.47 there is a clean cut to the castle; no transparent frames. |
| Wordmark over the sign | **Fixed.** The wordmark reaches its small top position by 47.87; the text fades in at 48.07, the sign at 48.13 (below the text, no overlap), Pixie at 48.27. |
| Reflection size | Smaller, but now unreadable (see FIX above). |

## Final 0.5 s pass (0-49.5 s)

There are no new defects. The hook, Pixie's entrance and the polygons/lighting/animation/sound beats are clean. The
N64 field and its pull-out work, the hero stays clear of the captions, and the E1 camera clip and the "Fix it" snap
read well. On "Probably." the caption ends at the cut. The memory scan, the l60 title alone, the vista cut, the night
room with the N64 pad, the wordmark and the signboard card are all fine.

Sweeps: `build/critic/short2_v2c/` (md/json only). All PNG frames were deleted.
