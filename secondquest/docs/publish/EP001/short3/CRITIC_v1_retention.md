# EP001 Short #3 "The work loop" · retention critic v1 (2026-10-19)

Critic: independent (`shorts-retention-critic`, did not build). Piece: `tools/hyperframes_ep001_short3/renders/EP001_short3_v1_preview720.mp4`
(720x1280, 30 fps, 22.65 s). Evidence: 4 fps timeline sheets, full-size key frames, a feed-size (270 px) frame 0,
per-frame luma difference (motion) per 0.5 s, audio RMS per 0.1 s, `sfx_plan.json`, storyboard v2, CHANNEL_STATS_2026-10-15.

## Verdict: **FIX**
The concept and frame 0 hold. Two dead stretches and a silent tail cost viewers right where the jokes should land:
1. **14.5–15.9 s:** an empty dark field, picture still and sound at about -45 dB. Two seconds score 0.
2. **18.3–22.1 s:** 3.8 s with no voice and no cue. Add the 0.6 s before the narration starts at frame 0, and
   **about 4.4 s pass across the loop seam with no voice**.

Nothing needs a new pose or a faked action. Every fix is a timing, camera, mix or size change.

## Frame 0 and hook (0–2.8 s)
- Frame 0 passes all three tests at 270 px wide. It shows Quest's face, slumped and sad, low on the left; the green tractor, which is the game's icon; and a conflict in words, **A GAME ABOUT GOING TO WORK?** All of it reads.
  - The weakest of the three is the emotion. It reads as mildly glum, not strong.
- The text arrives before the voice: frame 0 has no caption, and the voice starts at about 0.6 s. That complies with CLAUDE.md.
- The hook lands by 2 s. A stranger knows the topic: a farming game that is just a job.
- Risk: the picture barely moves from 0 to 2.75 s (mean frame difference about 1.2, ambient only). Only the captions change. From 1.5 to 2.75 s it scores 1 (see fix 5).

## Attention curve (per 0.5 s; 3 = new/meaningful, 2 = purposeful motion, 1 = ambient, 0 = nothing/confusing)
| t (s) | Score | What happens |
|---|---|---|
| 0.0 | 3 | Frame 0: hook text, tired face, tractor |
| 0.5 | 2 | Voice starts: "Farming Simulator is" |
| 1.0 | 2 | Caption changes; picture still |
| 1.5 | 1 | "a game where": picture still |
| 2.0 | 1 | Picture still |
| 2.5 | 3 | Hard cut to the bed at 2.75, alarm |
| 3.0 | 2 | Push in on his face, "wake up" |
| 3.5 | 2 | Cut to the office at 3.74 |
| 4.0 | 3 | Snap zoom on "work" |
| 4.5 | 2 | Deadpan typing |
| 5.0 | 2 | Paycheck; the wallet pops in (small) |
| 5.5 | 1 | Held (only 1 s, OK) |
| 6.0 | 3 | The tractor slams down (6.3) |
| 6.5 | 2 | The wallet bounces |
| 7.0 | 3 | Snap onto the wallet's shocked face, "expensive" |
| 7.5 | 1 | Deadpan hold on the shock (designed, 0.5 s, OK) |
| 8.0 | 3 | The wallet faints (wide shot) |
| 8.5 | 2 | Cut to the heroic wheat field |
| 9.0 | 1 | Static hero, "Most of the" |
| 9.5 | 1 | Static hero, "time," |
| 10.0 | 1 | The sky darkens slowly, "your greatest" |
| 10.5 | 3 | Lightning and thunder on "enemy" |
| 11.0 | 1 | Hold |
| 11.5 | 2 | Cut to the field with the small tractor, "is a field" |
| 12.0 | 1 | Near still |
| 12.5 | 2 | The pull-out starts |
| 13.0 | 2 | Pull-out, "slightly larger" |
| 13.5 | 2 | Pull-out, "than you expected." |
| 14.0 | 2 | The pull-out ends at about 14.4; the tractor is now a speck |
| **14.5** | **0** | Silence (-45 dB), still, the tractor invisible at feed size |
| **15.0** | **0** | The same |
| 15.5 | 1 | The same until the cut at 15.95 |
| 16.0 | 2 | Close on him driving, "and then..." |
| 16.5 | 3 | Freeze + record scratch at 16.66 (the freeze is hard; the scratch is too quiet) |
| 17.0 | 2 | Frozen grey frame, then a hard cut to the office at 17.34 |
| 17.5 | 1 | "go back to" |
| 18.0 | 3 | Snap zoom on the face on "work." (18.2) |
| 18.5 | 1 | Deadpan hold on the face (designed, 0.65 s, OK) |
| 19.0 | 2 | The end card builds, in silence |
| 19.5 | 2 | "SECOND ONE?" lands, in silence |
| 20.0 | 2 | The wordmark and the wallet's hop |
| **20.5** | **1** | Still, silent; FULL EPISODE too small to read |
| **21.0** | **1** | Still, silent |
| 21.5 | 2 | The seam: frame 0 recomposes |
| 22.0 | 2 | Alarm at 22.1 (0.3 s), last frame ≈ frame 0 (SSIM 0.95) |

## Drop-off risks, most damaging first
1. **14.45–15.95: the "awkward silence" is 1.5 s long and shows nothing.** The pull-out ends with the tractor about 10 px wide at 720p, about 4 px in the feed. The gag only works when the viewer can find the tiny tractor and feel the silence. Here the screen is an empty brown field, and that looks like a dead video. A dunkey hold is about 0.6–0.9 s. Score 0 for about 1.5 s.
2. **18.3–22.1: a silent tail (about -40 to -50 dB).** The deadpan hold after "work." (0.85 s) is good. The end card that follows has no sound at all. Its last 1.2 s (20.4–21.6) are still, and the alarm returns only at 22.1. On a replay the voice resumes at 0.6 s. The loop's joke is "go back to work" falling into "you wake up", and it is lost in the gap.
3. **16.66: the record scratch is buried.** The scratch window is about -25 dB RMS against the voice at about -14. The freeze is frame-accurate, but without a loud scratch it reads as a glitch, not a joke.
4. **9.0–10.5: the mock-epic beat is static for about 1.6 s.** The same framing is held, and only the sky darkens. The parody needs a heroic camera move to read as parody before the lightning.
5. **1.5–2.75: the picture barely moves under the hook.** This is acceptable, because the text is doing the work, but it is the softest moment of the opening.
6. **End card copy size:** "FULL EPISODE ↓" is about 10 px tall at 720p, so it cannot be read in the feed. "YOU ALREADY HAVE A JOB. / WHY GET A / SECOND ONE?" works well: it is the pun on the channel name and a callback to the hook. Keep it.

## Comedy timing (per joke)
| Joke | Lands? | Note |
|---|---|---|
| Alarm cut on "wake up" (2.75/2.85) | Yes | The cut is 0.1 s before the cue. Good. |
| Snap zoom on "work" (4.0) | Yes | |
| Tractor slam (6.32) | Yes | It lands on "extremely" and the snap to the wallet comes on "expensive": a good two-step. |
| Wallet faints (8.25) | Half | It happens after "equipment", which is good timing, but in a wide shot where the wallet is small. It reads as a tumble, not a faint. |
| Lightning on "enemy" (10.61) | Yes | It needs the build-up in front of it (risk 4). |
| Pull-out to the giant field (12.5–14.4) | Yes | It is the best visual joke. |
| Awkward silence (14.45–15.95) | **No** | Too long, and nothing to look at (risk 1). |
| Freeze + scratch on "then..." (16.66) | Half | The freeze is right; the scratch is too quiet (risk 3). |
| Hard cut to the desk, snap on "work." (17.34/18.2) | Yes | Strongest button; the deadpan hold is the right length. |
| End card pun | Yes, as copy | Delivered in dead silence (risk 2). |

## Fix list (cheap first)
1. **14.45–15.95 → trim the silence to 0.7–0.8 s.** Cut to "and then..." at about 15.2 and pull everything after it forward by about 0.75 s. Total length becomes about 21.9 s, still inside 20–25 s.
2. **16.66: raise the scratch about 6 dB** (rel_db -8 → about -2), so it peaks at or above the voice. Keep the hard freeze.
3. **End card: make "FULL EPISODE ↓" at least 2× larger** (about 22+ px at 720p, about 45+ px at 1080p) and give it full opacity.
4. **End-card audio: start the seam alarm about 0.6–0.8 s earlier** (about 21.4 in the current timing) and let it ring through the cut into frame 0. Lift the outdoor bed about 4–6 dB under the card so it is never digital silence. This closes the loop audibly: "go back to work." → alarm → "A GAME ABOUT GOING TO WORK?" → "…wake up".
5. **End card length: shorten it from 2.5 to about 2.0 s.** Trim the still 20.5–21.5 window; the wordmark and the wallet's hop already finish by 20.4.
6. **9.0–10.6: add a slow, low heroic push-in** (camera only, about 8–12 % scale) from "Most" to "enemy", then a hard stop on the lightning.
7. **14.4: end the pull-out about 15–20 % tighter**, or add a 1–2 px ring around the speck, so the tractor is still visible at feed size during the hold (camera only; nothing moves him).

## Optional ideas (not required for a PASS)
- 1.2–2.75: a slow push-in on his face under the hook, ending on the cut to the bed, so frame 0 still leads into motion.
- 8.0–8.5: keep the close-up on the wallet for the faint instead of cutting to the wide, so the reaction reads at phone size.
- Frame 0 emotion: if a stronger exhausted or dead-eyed head pose exists, it would raise the stop rate. Do not fake one.
- After publishing, compare the stay rate with EP002 Short #2 (16.5 %). Frame 0 meets the new rule, so a low number would point at the hook copy.

## Gate status
- PASS conditions not yet met: a 0-score stretch at 14.5–15.9, and a ≤1 stretch longer than 1.2 s at 9.0–10.5 if the
  slow sky change is counted as ambient.
- Met: frame 0, a hook by 2 s, payoff on the word, end card ≤ 2.5 s (exactly at the limit), visual loop
  (last frame vs frame 0 SSIM 0.95).
- After fixes 1–4 (plus 6), re-check only 8.7–11.6, 14.0–17.5 and 19.0–end, plus the seam.
