# EP002 Short #2 v4 "Player Two": design gate + builder critique

Producer, 2026-10-14:
- "El final sí me encantó. La parte del guión no me convenció."
- He chose option B, "Player Two" (comedy).
- "Métele Hyperframes al máximo."
- PLAYER ONE = the VETERAN, PLAYER TWO = the NEW PLAYER, explicit on screen.

v3.3 is kept: git tag `short2-v3.3`, its files untouched.

## Script (Bram's EP002 lines, verbatim; every cut inside a measured pause)

- **l66** "Player one already knows everything." Cut at 165.90-168.00, inside the pauses 165.53-166.05 and 167.74-168.23.
- **l69** "They see three golden triangles and immediately understand that somebody is about to make a very bad decision." Cut at 172.70-178.55, inside 172.50-172.91 and 178.29-178.76.
- **l71-l74** "Player two?" / "Player two knows none of this." / "They meet the Great Deku Tree and think:" / "That is an extremely large tree with an extremely personal problem." Cut at 185.60-194.75, inside 185.49-185.77 and 194.50-194.98.
- Voice 17.1 s, plus the punchline hold, the vista, the wordmark and the card: **22.0 s**.
- l67/l68 (ocarina, Master Sword) are left out. They would add 4 s and push the Short past 25 s, and the arc already has its P1 proof (the Triforce).

## Casting

- **P1 VETERAN** = Quest #01 (tunic, hand on hip, confident) in the temple (#13).
  - "Already knows everything" is his posture.
  - On "very bad decision" he cuts to #02 (scared): he knows exactly what the villain is about to do.
  - The villain (#8, claw toward the Triforce) is the literal "somebody".
- **P2 NEW PLAYER** = forest-friend Pixie (#2e thinking in the split, #2c delighted at 0 %, #2d awe at the tree, #2e doubt on "problem").
  - Young Quest would also fit, but Pixie gives the two players two different faces at a glance.
  - Her doubt is the reaction the punchline needs.
- **The ending he loved** (princess Pixie + adult Quest on the outcrop) becomes **co-op**: P1 and P2 tags over the two of them, plus PRESS START. The veteran and the new player play together. It lands on a hard cut with a flash and the one bass drop, then the same wordmark, Navi and thumbnail sign.

## Beats (see STORYBOARD.jpg; every move keyed to a word)

| t (s) | Line | Picture | Technique |
|---|---|---|---|
| 0.0 | - | **Frame 0:** split screen, P1 VETERAN (temple) vs P2 NEW PLAYER (forest), VS seam | split layout |
| 0.26 | "Player one" | The P2 half drops away and P1 takes the screen; PLAYER ONE slams in (no caption: the title is the caption) | kinetic slam |
| 1.1-1.6 | "already knows everything." | The KNOWS IT ALL meter counts 0 → 100 % and locks on "everything"; the HUD (with a P1 tag) comes in under it, never under a title | counter |
| 2.1 | "They see three" | Cut to the empty pedestal | |
| 3.0 | "golden triangles" | Punch-in: the **3D Triforce** rises out of the pedestal with one turn, the glow blooms, and sparks burst out of it | three.js, particles |
| 3.8 | "immediately understand" | Cut to the veteran, smug | |
| 5.1 | "that somebody" | Cut: the villain behind the pedestal, a slow push toward its claw and the Triforce | |
| 7.2 | "bad decision." | Hard cut: the veteran, scared (#02); the Triforce flickers red; a shake | |
| 7.95 | "Player two?" | **Player select:** P1 VETERAN READY / P2 NEW PLAYER "?" lights on "two?"; the title wobbles with Bram's voice; Navi's "Hello!" pops out of the P2 port | audio-reactive |
| 8.8 | "Player two knows none of this." | Pixel **boot shader** into the forest; P2 Pixie waves; the meter drains 100 → 0 % on "none" (the joke: she is delighted anyway) | GLSL |
| 11.0 | "They meet the Great Deku Tree" | Pixie looks up (#2d); **rack focus** and a rise to the tree's face | DoF |
| 13.4 | "That is an extremely large tree" | A full pull-back: the whole tree, Pixie tiny at its roots | camera |
| 15.8 | "extremely personal" | Punch into the face | |
| 16.4 | "problem." | Hard cut: Pixie #2e, hand on chin. The **hold** is her doubt (the comedy beat: anticipation is the pull-back, the hit is the punch-in, the reaction is her) | |
| 17.55 | - | The hold breathes (a wind swell), then a **hard cut + flash + the one bass drop**: the co-op vista, P1 + P2 tags, PRESS START blinks | |
| 19.3 | - | Wordmark, Navi into the star, then the thumbnail sign with Pixie and Navi's "Look!" (unchanged from v3.3) | |

**Sound:** 6 onsets including Navi (the Producer's clips: HELLO, SFX_01, LOOK), premium CC0:
- a magical swell under the Triforce;
- a switch on the player select;
- the wind swell cut dead into the one bass drop;
- the wordmark bell with the trail and the card bed.

-14.1 LUFS.

## Builder critique (on these frames)

- **Fixed in this pass:**
  - Frame 0's top half opened on the pedestal with Quest cropped; the P1 tag sat on his face.
  - The three.js canvas rendered opaque black before the Triforce appeared (now cleared transparent).
  - The Triforce read as a thin edge mid-spin (now one turn, then face-on).
  - P-tags sat away from their titles.
  - Pixie was half out of frame at the tree's roots.
  - PRESS START was translucent (now a hard blink).
- **Open, for the director:**
  1. Quest #01 is drawn young; he reads as the veteran through pose and the 100 % meter, not age.
  2. The village plate (#12) is used only for P2's world (frame 0 and 8.8-11 s).
  3. The temple's empty pedestal hosts our 3D Triforce. It is our own geometry; the risk note is the same as the thumbnail relics (Triforce shape).
  4. The vista tags label the adults P1/P2 (the same two people, now co-op).
- **Gates:** `hyperframes lint` 0 errors. The full gate run (frame_critic sweeps incl. 1/30 s, sfx_audit, check) runs after the go, on the build.
