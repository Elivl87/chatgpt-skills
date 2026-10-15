# EP002 Short #2 v4 "Player Two": independent RETENTION critic pass

The critic did not build this piece and did not edit it. It judges attention only; layout and craft belong to the
design critic.

**What was reviewed:**
- `EP002_short2_hf_v4_preview540.mp4`, saved at **2026-10-15 02:32:03 UTC** (commit 7c0befe, sha1 `e23bcbd0…`). It is
  540x960, 30 fps and 22.00 s long.
- `v4_design/CRITIQUE.md`, which includes the beat table.
- The caption timings in `tools/hyperframes_ep002_short2/short/index.html`.

**Lines (Bram, verbatim):**
- l66: "Player one already knows everything."
- l69: "They see three golden triangles and immediately understand that somebody is about to make a very bad decision."
- l71-l74: "Player two? Player two knows none of this. They meet the Great Deku Tree and think: That is an extremely large
  tree with an extremely personal problem."

**Method:**
- Every frame (1/30 s) was extracted. Frames were read every 0.25 s, every frame from 0 to 1 s, and full size at the
  hook, the face hold and the punchline.
- Motion was measured as the mean frame difference per 0.5 s.
- Loudness was measured as RMS per 0.25 s.

## VERDICT: FIX (two small, fixable risks; the concept holds)

This is the strongest Short #2 so far for retention:
- Frame 0 is a format everyone knows: a split screen, VETERAN vs NEW PLAYER.
- The setup is clear by 2 s.
- Each half of the comparison gets a visual proof: the 0→100 % meter and the 3D Triforce, then the 100→0 % meter.
- The punchline is built properly. The pull-back on "large" is the setup, the punch-in on "personal" sets up the hit,
  and the cut to Pixie's doubt on "problem." is the payoff, followed by the hold.

Two things block a PASS:
1. **12.45-14.10 s:** 1.65 s on the still, closed-eyed tree face. It scores 1, and the limit is 1.2 s.
2. **18.05-19.0 s:** after the bass drop, the master goes to **digital silence (-90 dB) for about 0.9 s** under the vista.

Both can be fixed with a cut or a sound change only.

```
Frame 0 ........... PASS  - split VS frame, two faces, PLAYER ONE/VETERAN vs PLAYER TWO/NEW PLAYER; reads at 120 px
0-2 s hook ........ PASS  - "Player one already knows everything" + meter 0->100 % locks on "everything" (1.5-1.9 s);
                            the VS frame promises the other half -> comedy setup clear by 2 s
Open loop ......... PASS  - "and player two?" opened at frame 0, answered 7.97-17.55 s
Escalation ........ PASS (1 dip) - spike every ~1 s; one 1.65 s hold on the tree face (12.45-14.10)
Payoff/punchline .. PASS  - "extremely personal" punch-in (15.83) -> hard cut to Pixie's doubt on "problem." (16.40),
                            hold 1.15 s on the shot (0.6 s after the word), wind swell, hard cut + drop at 17.55
Ending ............ FIX   - 18.05-19.0 s digital silence under the vista (PRESS START blinks in silence)
End card .......... PASS  - wordmark 19.25, card ~20.25-22.0 (~1.75 s; 2.75 s incl. wordmark), Navi "Look!" 20.75
Loop .............. weak  - card field -> split screen (not required)
Coherence ......... PASS  - every picture matches its line; the villain is the literal "somebody"; no faked actions
Captions .......... PASS  - one line, word-by-word; the PLAYER ONE title stands in for the caption at 0.27-0.66 s
Stretches <=1 >1.2 s: 12.45-14.10 (1.65 s). Borderline: 3.90-5.10 (1.2 s, smug veteran hold)
```

## Attention curve (0 to 3, per 0.5 s)

| t (s) | Words | Picture / event | Motion | Score |
|---|---|---|---|---|
| 0.0 | (boot) "Player one" | Frame 0: split VS screen; 0.27 s: P2 half drops away, PLAYER ONE slams | 13.8 | **3** |
| 0.5 | | P1 takes the full screen (temple, pedestal) | 11.3 | **3** |
| 1.0 | "already knows" | KNOWS IT ALL meter counts 3 -> 53 %, HUD with P1 tag | 4.5 | 2 |
| 1.5 | "everything." | Meter locks at 100 % | 3.9 | **3** |
| 2.0 | "They see" | 2.10 cut to the empty pedestal | 6.6 | 2 |
| 2.5 | "three" | Pedestal holds, light rays, a small triangle begins | 3.9 | 1 |
| 3.0 | "golden triangles" | 3D Triforce rises, turns and blooms | 9.2 | **3** |
| 3.5 | "and" | Triforce face-on; 3.77 cut to the smug veteran | 5.3 | **3** |
| 4.0 | "immediately" | Smug hold, slow push | 3.3 | 1 |
| 4.5 | "understand that" | Same | 2.8 | 1 |
| 5.0 | "somebody" | 5.10 cut: the villain's claw toward the Triforce | 6.8 | **3** |
| 5.5 | "is about to" | Push toward the claw | 7.9 | 2 |
| 6.0 | "make a" | Push continues | 8.1 | 2 |
| 6.5 | "very bad" | 6.83 hard cut: the veteran, scared; shake | 9.4 | **3** |
| 7.0 | "decision." | Scared hold | 0.5 | 1 |
| 7.5 | | 7.97 cut to the player select | 5.5 | 2 |
| 8.0 | "Player two?" | Select screen, P2 port dark with "?" | 1.9 | 2 |
| 8.5 | (Navi "Hello!") | NEW PLAYER port lights | 5.5 | 2 |
| 9.0 | "Player two knows" | Pixel boot, P2 LOADING, forest, Pixie waves | 9.0 | **3** |
| 9.5 | | Pixie waving, hold | 3.5 | 1 |
| 10.0 | "none of this." | Meter drains 84 -> 0 % on "none" (the joke's first beat) | 9.5 | **3** |
| 10.5 | (pause) | 0 % hold | 1.0 | 1 |
| 11.0 | "They meet the" | 11.17 cut: Pixie in awe, shallow depth of field | 3.6 | 2 |
| 11.5 | "Great" | Hold | 2.6 | 1 |
| 12.0 | "Deku Tree" | Rack focus and a rise to the tree's face | 28.7 | **3** |
| 12.5 | "and think:" | Still face, eyes closed | 4.3 | 1 |
| 13.0 | (pause) | Same | 2.6 | 1 |
| 13.5 | "That is an extremely" | Same | 3.6 | 1 |
| 14.0 | "large" | Full pull-back: the whole tree, Pixie tiny at its roots | 23.4 | **3** |
| 14.5 | "tree with an" | Wide shot; the scale gag reads | 3.3 | 2 |
| 15.0 | | Wide hold | 0.8 | 1 |
| 15.5 | "extremely personal" | 15.83 punch into the face | 8.6 | **3** |
| 16.0 | "problem." | 16.40 hard cut: Pixie's doubt, hand on chin | 3.7 | **3** |
| 16.5 | | Reaction hold (the laugh beat) | 1.0 | 2 |
| 17.0 | (wind swell) | Hold | 1.1 | 2 |
| 17.5 | (bass drop) | 17.57 hard cut + flash: co-op vista | 14.0 | **3** |
| 18.0 | (**silence**) | P1/P2 tags and PRESS START appear | 1.2 | 2 |
| 18.5 | (**silence**) | PRESS START blinks | 1.0 | 1 |
| 19.0 | (bell) | Wordmark lands at 19.25 | 5.0 | 2 |
| 19.5 | | Navi into the star, vista dims | 2.8 | 2 |
| 20.0 | | Card fades in | 6.6 | 2 |
| 20.5 | (Navi "Look!") | Sign with the thumbnail, Pixie under it | 0.5 | 2 |
| 21.0 | (card bed) | Still card | 0.2 | 1 |
| 21.5 | (card bed) | Still card, end at 22.00 | 0.2 | 1 |

**Totals:** of 44 half-seconds, 14 score 3, 16 score 2, 14 score 1 and none score 0.

**Shape:** a spike every 0.5-1.5 s. Every rest is a reaction hold of 1.2 s or less, except the tree face.

## Drop-off risks, most damaging first

1. **12.45-14.10 s (1.65 s, scores 1): the face hold on "and think: … That is an extremely".**
   - The rack focus lands on the face at about 12.4 s. Then the shot sits still for 1.65 s on closed eyes, with only
     Navi moving.
   - It is the setup of the punchline, but it is too long and has nothing new in it. It also comes on the slowest words
     of the Short ("and think:" plus a 0.4 s pause).
   - A viewer who doesn't know the line is coming has no reason to wait here.
2. **18.05-19.0 s: digital silence (-90 dB) under the vista.**
   - The bass drop decays to nothing by 18.05 s, and nothing sounds until the wordmark bell at 19.0 s.
   - Right after the biggest impact, the phone goes silent. That reads as "over", and the swipe comes before the
     wordmark and the card.
   - PRESS START blinking in silence feels like a stalled screen.
3. **3.90-5.10 s (1.2 s, borderline): the smug veteran holds on "immediately understand that".** It is a slow push
   only. It is saved by the villain cut at 5.10 s.
4. **0.27-0.57 s (note): the split's drop-away.**
   - For about 0.3 s both halves are semi-transparent, and the big PLAYER ONE sits over Quest's head and hat.
   - It is the first motion after frame 0, and a double exposure can read as a glitch. This is mainly a design-critic
     matter.

## Top 3 fixes (only camera, light, cut, pose and sound; no faked action)

1. **Break up the tree-face hold (12.45-14.10 s) with a cut on "think:".**
   - At about 12.77 s, cut to Pixie looking up at the tree. Her awe pose #2d exists. It is her point of view, and it
     sets up that what follows is her thought.
   - At "That is an" (13.41 s), cut back to the face from lower, with a slow push.
   - Keep the pull-back exactly on "large" (14.1 s).
   - This turns 1.65 s of 1s into three beats and makes the joke clearly Pixie's thought.
2. **No dead air after the drop (18.05-19.0 s).**
   - Let the bass drop ring out longer, about 0.8 s. Run the vista's ambient or wind bed from 17.57 s straight into the
     card bed.
   - Optionally add one soft game-UI blip on PRESS START's first blink, as the only new onset, varied from the catalog.
   - Alternative, cut-timing only: bring the wordmark forward to about 18.6 s, so the vista lasts about 1.0 s.
3. **Punch in on the smug veteran at "immediately" (about 4.10 s).**
   - A hard punch-in from about 1.0 to 1.3, to his face and hand on hip, gives the "already knows" smugness a second
     beat. The 3.90-5.10 hold then never builds up.
   - Optional, in the same spirit for the hook: make the drop-away at 0.27 s a hard cut to the full P1 frame instead of
     the 0.3 s double exposure.

With fixes 1 and 2 this should PASS. Fix 3 is a margin improvement.
