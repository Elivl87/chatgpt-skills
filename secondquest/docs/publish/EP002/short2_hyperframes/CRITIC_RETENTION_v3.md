# EP002 Short #2 v3.1: independent RETENTION critic pass

The critic did not build this piece and did not edit it. It judges attention only; layout and craft belong to the
design critic (`CRITIC_v3.md`).

**What was reviewed:**
- `EP002_short2_hf_v3_preview540.mp4`, the builder's final v3.1 render, saved at 2026-10-15 00:06:01 UTC (commit
  bab5426, sha1 `9a201160…`). It is 540x960, 30 fps and 22.64 s long.
- The earlier 00:00:51 render (sha1 `d1388cf0…`) was also checked. Its frame-difference profile is identical except
  for 3.5-5.0 s, where the 3.62 s cut is now a milder push to a closer full figure rather than a waist-up shot.
  Every finding below holds for both.
- `v3_design/` and the design critic's `CRITIC_v3.md`.
- The caption timings and camera cues in `tools/hyperframes_ep002_short2/short/index.html`, from the working tree.
- The Producer's Short history in `docs/ep002/PRODUCER_DECISIONS.md`.

**Method:**
- Frames were read every 0.25 s across the whole Short, and every frame (1/30 s) from 0 to 2 s and around every cut.
- Motion was measured as the mean frame difference per 0.5 s.
- Loudness was measured as RMS per 0.25 s.

## VERDICT: FIX

**What works:** v3.1 is much better than v3.
- Frame 0 is a finished title still.
- The title now leaves with a cut and a punch-in at 0.7 s.
- The Pixie reveal at 5.3 s is a real spike.
- The escalation from 11.1 to 15.1 s is the best stretch the Short has had: a new picture on every word.
- The payoff cut at 18.67 s lands with a single impact.

**What still has to change:**
- **8.63 to 11.08 s is a 2.45 s hole.** It scores 0. The N64 tree is unreadable brown murk on screen, the camera barely
  moves (1.00 to 1.04) and the only motion is Navi. It falls on the abstract line "Because better is measurable".
  That is a confusion beat at the point where a Short loses the most viewers, right after the hook.
- **The hook has two flat stretches of 1.6 to 2 s each.** They are at 1.0 to 3.0 s and 3.65 to 5.3 s.
- **There is dead air before the payoff, and the end card goes silent.**

Fix those three and this is a PASS.

```
Frame 0 ........... PASS  - title + hero + empty balloon; reads at feed size (120 px), one focal column, curiosity in the title
0-2 s hook ........ WEAK  - promise is in the title only and the title is gone at 0.70 s; the spoken words never say "remake"
                            until... never (l60 says "That is the impossible job"); 1.0-2.0 s is nearly static
Open loop ......... PASS  - "the remake's impossible job?" opened at 0.0 s, closed by the same words at 18.67 s
Escalation ........ FIX   - 8.7-11.1 s goes DOWN (0) right after the hook; 11.1-15.1 s is excellent (a change every ~1.0 s)
Payoff ............ PASS  - hard cut + one bass drop + title slam on "impossible" (18.67 s), pulse on "job" (19.11 s)
End card .......... PASS (note) - card 20.54-22.64 s = 2.1 s (wordmark + card 2.7 s); last 0.9 s silent and still
Loop .............. BONUS - last frame (field, dirt road, Pixie) flows back to frame 0 (same field, dirt road, Quest)
Coherence ......... PASS (note) - nobody fakes an action; the 1998 twist only reads once the CRT/N64 shows at 17.2 s
Captions .......... PASS  - one line, word-by-word, gold on the spoken word, never on a face; dropped under the l60 title
Stretches <=1 >1.2 s: 1.0-3.0 (2.0 s), 3.65-5.3 (1.6 s), 8.7-11.1 (2.4 s, includes 0s)
```

## Attention curve (0 to 3, per 0.5 s)

The curve uses the rubric in the skill:
- **3:** something new and meaningful.
- **2:** purposeful motion.
- **1:** ambient motion only.
- **0:** nothing changes, or the viewer is confused.

"Motion" is the measured mean frame difference for that window.

| t (s) | Words (Bram) | Picture / event | Motion | Score |
|---|---|---|---|---|
| 0.0 | "A silent…" | Frame 0: title THE REMAKE'S IMPOSSIBLE JOB, Quest, empty balloon | 0.3 | **3** |
| 0.5 | "…character" | 0.70 title cut out + punch-in 1.58 -> 1.95 (expo) on hero + balloon | 6.5 | **3** |
| 1.0 | "once left" | Same shot, 2 % drift, balloon dots pulse | 0.7 | 1 |
| 1.5 | "space for" | Balloon outline glows once (1.80), barely visible at phone size | 1.0 | 1 |
| 2.0 | "your" | Same shot | 1.3 | 1 |
| 2.5 | "imagination." | Dots turn gold (2.51), small | 1.0 | 1 |
| 3.0 | (Navi "Hello!") | White flash, HUD fades in, Navi glint | 5.5 | **3** |
| 3.5 | "Give that" | 3.62 cut to a closer full-figure hero + balloon (mild: diff 26) | 2.4 | 2 |
| 4.0 | "character" | Same shot, slow push | 1.1 | 1 |
| 4.5 | "a voice…" | Same shot | 0.9 | 1 |
| 5.0 | "and suddenly" | 5.28 balloon pops, 5.38 cut to two-shot, Pixie revealed + flash | 5.9 | **3** |
| 5.5 | "somebody" | Static two-shot (Pixie waving pose) | 0.9 | 1 |
| 6.0 | "has to" | Same | 0.5 | 1 |
| 6.5 | "decide what" | 6.48 hard cut, Pixie close-up, hand on chin | 4.7 | 2 |
| 7.0 | "that" | 7.42 cut back to two-shot | 4.9 | 2 |
| 7.5 | "silence sounded" | Push-in into the space where the balloon was | 7.4 | 2 |
| 8.0 | "like." | Push-in continues | 9.0 | 2 |
| 8.5 | (pause) | 8.63 hard cut to a new world: the N64 tree | 6.6 | **3** |
| 9.0 | "Because better" | Brown low-poly murk; no readable tree or face; only Navi moves | 0.8 | **0** |
| 9.5 | "is" | Same | 0.9 | **0** |
| 10.0 | "measurable." | Same | 0.8 | **0** |
| 10.5 | (pause) | Same, 0.36 s silence | 0.7 | 1 |
| 11.0 | "More polygons." | 11.08 punch-in on the face as it sharpens (best reveal in the piece) | 7.6 | **3** |
| 11.5 | | Face resolves | 0.6 | 2 |
| 12.0 | "Better lighting." | Whip to the sun, flare, flash | 16.5 | **3** |
| 12.5 | | Sun shot, leaves drift | 0.4 | 1 |
| 13.0 | "Better animation." | Whip back to the trunk, leaves fall | 17.1 | **3** |
| 13.5 | | Leaves falling | 0.7 | 2 |
| 14.0 | "Better sound." | Up into the canopy, flock bursts out | 14.4 | **3** |
| 14.5 | | Birds fly off | 1.0 | 2 |
| 15.0 | "But" | 15.13 cut: real-life bedroom, kids (the twist) | 4.6 | **3** |
| 15.5 | "familiar" | Reading the new scene | 1.0 | 2 |
| 16.0 | "is" | Slow drift (z 1.0) | 1.2 | 1 |
| 16.5 | "not measurable." | Same, then 16.88 pan along her finger | 1.2 | 1 |
| 17.0 | | Pan lands on the CRT + N64 | 23.1 | 2 |
| 17.5 | (silence -50 dB) | 17.69 cut to the vista, adult Quest + princess | 5.3 | 2 |
| 18.0 | "That is the" | Vista holds (0.67 s) | 1.0 | 1 |
| 18.5 | "impossible" | 18.67 HARD CUT castle, bass drop, flash, shake, title slam | 10.7 | **3** |
| 19.0 | "job." | Pulse on "job" (19.11), push into castle | 1.6 | 2 |
| 19.5 | | Title holds, dims, cut out at 19.82 | 2.5 | 1 |
| 20.0 | (bell) | Wordmark lands opaque, underline | 3.9 | 2 |
| 20.5 | | Navi into the star, card begins at 20.54 | 6.0 | 2 |
| 21.0 | (Navi "Look!") | Sign with the thumbnail + Pixie arrive | 2.3 | 2 |
| 21.5 | (silence) | Pixie's small wave, otherwise still | 0.2 | 1 |
| 22.0 | (silence) | Still card | 0.2 | 1 |
| 22.5 | (silence) | Still card (end 22.64) | 0.2 | 1 |

**Summary:**
- Of the 46 half-seconds, 14 score 3, 15 score 2, 14 score 1 and 3 score 0.
- The 3 zeros fall together at 9.0 to 10.5 s.
- The curve has the right shape from 11 s on: a spike every ~1 s, then the payoff.
- From 1 to 11 s it is a saw that keeps sagging. Each spike (0.7, 3.0, 5.3, 8.6) is followed by 1.0 to 2.4 s of hold.

## Drop-off risks, most damaging first

1. **8.63 to 11.08 s (2.45 s, scores 0): the N64 tree.**
   - A viewer who just got the Pixie payoff is cut into an unreadable texture.
   - The picture has no face, no silhouette and no focal point; only the 1 cm Navi moves.
   - The line is the most abstract one in the Short ("Because better is measurable").
   - The camera move is 1.00 to 1.04 over 2.4 s, which is invisible.
   - This is where a swipe happens. Everything good at 11 to 15 s is behind this wall.
2. **1.0 to 3.0 s (2.0 s, scores 1): the hook goes still the moment the title leaves.**
   - The 0 to 2 s window decides whether the viewer stays. Here the hook shows one medium shot of a smiling boy with a
     speech balloon, and the only changes are dots pulsing, a glow at 1.80 s that is invisible at phone size, and dots
     turning gold at 2.51 s.
   - The promise ("the remake's impossible job") was on screen for only 0.70 s, and no spoken word carries it.
   - Someone who never saw the episode hears "A silent character once left space for your imagination". They get a
     mood, not a question.
   - **Is "the remake's impossible job" clear by 2 s?** Only for viewers who read the title in its 0.7 s. That is
     4 words at a glance, which is borderline. For everyone else it becomes clear at 18.67 s.
3. **3.65 to 5.28 s (1.6 s, scores 1): "character a voice…" on a static, closer full-figure shot.** The 3.62 s cut
   changes the size of the shot so little that it barely registers as a new shot.
   - It is saved by the pop at 5.28 s. But the pop is a payoff with no build: the balloon is small and off-centre when
     it pops.
4. **17.36 to 18.0 s, dead air (about -50 dB for 0.6 s) at the vista cut.**
   - Right before the payoff, the sound drops out entirely and the vista appears in silence.
   - On a phone, a sudden silence reads as "it's over" or "it buffered". Some viewers swipe right before the best
     moment.
   - A held breath before an impact works only if something holds it, such as a riser, wind or a tone.
5. **21.5 to 22.64 s, the card is silent and still for 1.1 s.**
   - It is short enough not to hurt watch time much, and the end-card length is fine.
   - But the last second is dead, and the loop back to frame 0 would land better on a sound tail.
6. **5.5 to 6.48 s (1.0 s, scores 1): the static two-shot after the reveal.** It is under the 1.2 s threshold, so it is
   noted only.
7. **15.9 to 16.88 s (1.0 s, scores 1): the bedroom drift.**
   - It is under the threshold.
   - There is a coherence note: "familiar" lands on a generic modern-looking bedroom. Nothing says 1998 until the
     CRT/N64 appears at 17.2 s, after the words "not measurable" are already spoken.

## Top 3 fixes (only camera, light, cut, pose and sound; no faked action)

1. **Rebuild 8.63 to 11.08 s as three shots on the words, with a readable tree.**
   - **8.63 s, "Because":** open on a wide shot where the tree reads, either with more exposure or a cool rim light
     behind the silhouette so its outline separates from the background. If the N64 look cannot read whole, frame the
     face, not the trunk.
   - **9.14 s, "better":** a hard punch-in to the low-poly face, about 1.0 to 1.35 over 0.25 s with expo.out.
   - **9.9 s, "measurable":** one light event, for example a bright scan line sweeping across the facets top to bottom
     in about 0.3 s, like a measuring pass. Pair it with one dry tick on the scan. That is a light change, not an action.
   - Keep the polygons upgrade exactly at 11.08 to 11.16 s. With this change no stretch of the Short scores 0, and the
     escalation starts at 8.6 s instead of 11 s.
2. **Cut the hook on its words, and keep the promise on screen until it is read.**
   - Hold the frame-0 title until the end of "character" (about 1.15 s) instead of 0.70 s. This is a cut-timing change
     only; the punch-in still happens on the cut.
   - Then add cuts between the shots that already exist:
     - **1.84 s, "space":** a hard cut to a close-up of the empty balloon with its outline lit (the glow, made big
       enough to see).
     - **2.56 s, "imagination":** a cut back to the hero's face as the dots turn gold.
     - **3.02 s:** keep Navi's flash and the HUD.
     - **4.58 s, "voice":** a hard punch to a close-up of the balloon, so that the pop at 5.28 s fills the frame and pays
       off the build. Then cut to the two-shot at 5.38 s as now.
   - This removes the 2.0 s and 1.6 s flat stretches and makes the balloon the visual thread of the hook.
3. **Sound under the two gaps: before the payoff and on the card.**
   - **17.36 to 18.67 s:** run a low, quiet riser or wind bed, rising and cut dead at the bass drop at 18.67 s. The
     silence then becomes a held breath and the impact hits harder. This adds no new SFX onset for the Producer's
     "restrained sound" count, because the bed has no attack.
   - **The card:** let the vista's ambient or wind continue under the card to 22.64 s, at about -30 dB, so the last
     second is not dead air and the loop back to frame 0's field sounds continuous.
   - Optional, also cut-timing only: start the bedroom's pan to the CRT on "familiar" (15.42 s) instead of 16.88 s, so
     the 1998 object, and with it the twist, reads while the word is said.

## Notes for the Producer's brief

- **"Dinamismo, dopamina, impacto":** met from 11 s to the end; not yet met from 1 to 11 s (see fixes 1 and 2).
- **"Con coherencia":** met. Every picture matches its line, and no action is faked. The balloon, then Pixie deciding,
  then the "better" tree, then the childhood bedroom, then the epic remake vista, then "impossible job" is a clear chain.
- **End on the thumbnail:** met. The whole thumbnail is on the sign, with FULL EPISODE / ON THE CHANNEL and Navi's
  "Look!". It is a clear send-off to the episode.
- **20 to 25 s:** met (22.64 s).
