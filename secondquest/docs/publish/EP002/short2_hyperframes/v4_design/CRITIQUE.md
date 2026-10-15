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

## After the director's GO (build v4.0)

- **Boot (note 1):** 0.36 s long. The big blocks appear only in the first frames (the mosaic shrinks cubically to 1 px). A hard-cut "P2 LOADING" UI flash sits over its first 0.22 s and is gone before the picture resolves.
- **Punchline (note 2):** the cut to Pixie's doubt is at 16.39 s, "problem." ends at 16.95 s, and the impact into the vista lands at 17.55 s. That gives a 0.6 s hold after the word (1.16 s on the shot), with a wind swell under it, cut dead into the drop.
- **Gate fixes:** each split-screen title and its role are now one block ("PLAYER ONE / VETERAN"); the redundant P-tags are removed. The player-select ports carry one label each. The select clip now ends exactly at the boot. The HUD P-tags and PRESS START sit inside the safe area, and PRESS START no longer blinks past the wordmark cut.
- **gates.sh: PASS.**
  - lint: 0 E.
  - frame_critic: 0.25 s sweep + 1/30 s windows (0-1, 1-2.2, 2-3.4, 3.7-5.3, 7-9.4, 10.8-11.4, 13.3-14.3, 15.7-17.8, 19-22 s), 0 errors. Warnings: CHAR_SMALL on the pull-back (by design); TEXT_OVER_CHARACTER on legs and torso only (no face), checked by eye.
  - sfx_audit: 0/0.
  - check: ok. Runtime warnings are only the three.js deprecation and GL ReadPixels notes.
- **By eye on the rendered MP4 (2 render workers, cold seeks):** the Triforce frames at 3.1-4.2 s show no black frames and no flicker; the boot reads as a short game load; the vista, wordmark and card are clean.

## Critics v4 (design + retention) -> what changed (v4.1)

| # | Item | Fix |
|---|---|---|
| 1 | The vista dissolved into the card (see-through characters, 19.90-20.17 s) | The card is now a hard cut. **New automated rule `CROSSFADE_CHARACTERS`** (error) in `scripts/frame_critic.py` + `scripts/qa/dom_sampler.cjs`: it flags any sample where two full-frame shots (clips holding a plate image of at least 50 % of the frame) are visible together, one is mid-fade (opacity 0.05-0.95), and either holds a character. Tested on the v4 build: it caught `#shV@1.00*, #card@0.10` at 19.97-20.17 s. After the fix: 0. |
| 2 | "0 %" on her waving hand | The P2 meter now sits in the sky band (top 345 px), clear of her hand and of the HUD rupee. |
| 3 | Triforce edge-on / too early / flat | It is revealed on "golden" (3.0 s) and never turns more than ~35° (no edge-on frame). Our own lighting: a key from the sunlit window side, a warm rim behind it, PBR reflections of an environment matched to the painting (PMREM), three slightly different golds, a bloom, and a contact glow on the pedestal. |
| 4 | The P2 meter drained | It slams in at 0 % on "none", mirroring P1's climb to 100 %. |
| 5 | Busy split exit | A hard cut to P1's world on "one", then the PLAYER ONE slam. |
| 6 | Still tree face 12.45-14.10 s | "think:" cuts to Pixie looking up (#2d). "That is an" cuts back to the face from lower, with a slow push. The pull-back starts at 14.1 s ("large"). |
| 7 | Silence after the drop | The drop rings out into a vista wind bed that runs straight under the card (about -35 dB RMS at 18-19 s, -25 to -30 dB under the card). Still 6 onsets. |
| 8 | "immediately" | Punch in on the smug veteran (expo, 0.25 s). |
| opt. | Boot noise | While the picture is blocky, the boot blocks are quantised to a 5-level retro palette. |

gates.sh: PASS (0 errors). This includes the new crossfade rule and the 1/30 s windows, now including 12.6-14.6 s. Checked by eye on the MP4: the Triforce reads as bright, varied gold; the "think" cut works; the card is a hard cut.

## v4.1 -> v4.2

| # | Item | Fix |
|---|---|---|
| 1 | TEXT_OVER_HUD on the first "0%" frame (10.03-10.06 s) | The P2 meter is 40 px lower (top 385) and slams in from scale 1.05 (was 1.4). The 1/30 s sweep at 7.8-11.5 s gives 0 errors. |
| 2 | The sparks read as blotches | They are now small bright points (1.4-3 px), born at the triangle's silhouette edge and flying outward. |
| 3 | Static end card | Navi makes one slow loop around the signboard (clear of the text above and Pixie's head below), then rests by the sign's top-right corner before 22.0 s. No glint, no new sound. |
| 4 | "think:" reused #2d | The cut now uses her real back pose (#2f): she faces the giant tree. "That is an" returns to #2d. There is no other tunic pose; #2e is kept for "problem." |

gates.sh: PASS. That covers lint 0 E; frame_critic 0 E, including CROSSFADE_CHARACTERS and the 1/30 s windows (0-1, 1-2.2, 2-3.6, 3.7-5.3, 7-9.4, 7.8-11.5, 12.6-14.6, 15.7-17.8, 19-22 s); sfx_audit 0/0 with 6 onsets; and check ok. The MP4 was rendered first and the contact sheet was written after it. Checked by eye on MP4 frames at 3.4, 3.55, 10.04, 12.9 and 20.8-21.95 s.

## v4.2 -> v4.3

| # | Item | Fix |
|---|---|---|
| 1 | Navi crossed "EXCEPT YOU" (21.37-21.55 s) | After the star she goes straight to the sign's right edge, before the card text appears. She loops around the sign's lower-right corner, **outside its frame**: (1015,650) → (1040,860) → (1010,1085) → (900,1140), under the frame, right of the post and of Pixie → (1030,980) → (1035,740). She then rests top-right (985,585). She is bigger on the card (r 28, was 22) and her trail is brighter (alpha .75, was .55). She is never over the card text, the thumbnail's text, or a face. Navi is a canvas and the thumbnail text is baked into its image, so DOM boxes cannot check this. It was checked by eye on every 1/15 s frame of the rendered MP4 from 19.8 to 22.0 s (tile sheet), plus the 1/30 s DOM sweep 19-22 s (0 errors). |
| 2 (opt.) | Sparks | Every 6th spark is a brighter 3-4 px point with a short soft glow. They are still born at the Triforce's edge and fly outward. |

gates.sh: PASS (lint 0 E, frame_critic 0 E incl. CROSSFADE_CHARACTERS and every 1/30 s window, sfx_audit 0/0, check ok). The MP4 was rendered first; the contact sheet was written after it.
