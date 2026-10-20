# EP001 Short #3 "The work loop" · retention critic v3 (2026-10-20)

Critic: independent (`shorts-retention-critic`). Piece: `tools/hyperframes_ep001_short3/renders/EP001_short3_v3_preview720.mp4`
(720x1280; the container reads 20.6 s). It now uses Bram's real EP001 narration, re-timed to his take.
This was a quick pass over the whole cut: 4 fps strips, per-frame motion per 0.5 s, audio RMS per 0.1 s, peaks per
window, and SSIM between the last frame and frame 0. Previous reports: `CRITIC_v1_retention.md` (FIX) and
`CRITIC_v2_retention.md` (PASS).

## Verdict: **PASS**
Bram's take makes the comedy stronger. His own pauses give the deadpan beats that v2 had to fake with silence.
- No second scores 0.
- No stretch scoring 1 or lower runs past 1.2 s.
- Every gag still lands on its word.
- The end card is 2.0 s, and the loop seam carries sound.

## Beat timing (voice from the energy track)
| t (s) | Voice | Picture / sound | Lands? |
|---|---|---|---|
| 0.0–0.6 | — (bed only) | Frame 0: hook, tired face, tractor | Yes. Text is on screen before the voice. |
| 0.6–2.2 | "Farming Simulator is a game where you" | Frame 0 holds (ambient motion only; 2.2 s, carried by the text) | Yes |
| 2.25 / 2.33 | "wake up..." (about 2.4–2.8) | Hard cut to the bed 0.1 s before the word; the alarm rings at 2.33; snap at about 2.75 | Yes |
| 2.9–3.5 | his pause | Close on his face in bed (0.6 s) | Yes, deadpan |
| 3.5 / 3.9 | "go to work..." | Cut to the office at 3.5; snap on "work" | Yes |
| 4.1–4.7 | pause | The snap holds still (0.5 s) | Yes, deadpan |
| 4.75 | "make money..." | Paycheck, the wallet pops in | Yes |
| 6.0 / 6.23 | "buy extremely" | Dealership; the slam on "buy", the tractor behind the fence | Yes |
| 6.75 | "expensive" | Snap onto the wallet's shocked face | Yes |
| 7.25–7.9 | "equipment..." | The wallet faints in the close-up (about 7.75) and holds through his pause to 8.5 | Yes. Better than v1/v2: it now reads at phone size. |
| 8.5–10.3 | "Most of the time, your greatest enemy..." | Heroic push-in; lightning at 10.27 on "enemy" | Yes |
| 10.4–11.0 | 0.3 s pause + thunder tail | Lightning hold | Yes |
| 11.0 | "is a field" | Hard cut to the field on the word | Yes |
| 12.5–13.5 | "slightly larger than you expected." | Pull-out; the tractor shrinks to a speck that stays visible | Yes |
| 13.75–14.75 | silence (about -35 to -42 dB) | Still field, speck visible (about 1.0–1.1 s) | Yes. At the limit (see note 1). |
| 14.75–15.8 | "and then..." | Close on him driving; hard freeze plus scratch at 15.5/15.6 on "then" (peak -4.9 dBFS, at the voice's level) | Yes |
| 15.9–16.25 | his 0.4 s pause | Frozen grey frame (0.75 s in all) | Yes. This is the dunkey beat. |
| 16.25 / 17.0 | "go back to work." | Hard cut to the desk; snap on "work." | Yes, the best button |
| 17.0–17.75 | — | Deadpan hold on his face | Yes |
| 17.75–19.75 | — (bed about -35 dB) | End card: YOU ALREADY HAVE A JOB. / WHY GET A / SECOND ONE? + wordmark + wallet + FULL EPISODE ↓ (from about 18.75). Still from about 18.5 to 19.5. | Yes. 2.0 s. |
| 19.7–20.6 | alarm (peak -15.9 dBFS) | Seam: frame 0 recomposes, the hook is back by 20.0; last frame ≈ frame 0 (SSIM 0.95) | Yes. Alarm → "Farming Simulator is a game where you… wake up" |

## Attention curve (per 0.5 s)
| From (s) | 0.0 | 0.5 | 1.0 | 1.5 | 2.0 | 2.5 | 3.0 | 3.5 | 4.0 | 4.5 | 5.0 | 5.5 | 6.0 | 6.5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Score | 3 | 2 | 2 | 1 | 3 | 2 | 2 | 3 | 1 | 2 | 2 | 1 | 3 | 3 |

| From (s) | 7.0 | 7.5 | 8.0 | 8.5 | 9.0 | 9.5 | 10.0 | 10.5 | 11.0 | 11.5 | 12.0 | 12.5 | 13.0 | 13.5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Score | 2 | 3 | 1 | 2 | 2 | 2 | 3 | 2 | 3 | 1 | 2 | 2 | 2 | 1 |

| From (s) | 14.0 | 14.5 | 15.0 | 15.5 | 16.0 | 16.5 | 17.0 | 17.5 | 18.0 | 18.5 | 19.0 | 19.5 | 20.0 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Score | 1 | 2 | 2 | 3 | 2 | 2 | 3 | 1 | 3 | 1 | 2 | 2 | 3 |

The longest stretch scoring 1 or lower is 13.75–14.75 (about 1.0 s, designed). No 0s.

## Notes (optional, not blocking)
1. **13.75–14.75:** the silence after "expected." is now about 1.0–1.1 s, up from about 0.85 s in v2. That is still under the 1.2 s limit and still reads as deadpan. If the master wants it tighter, trimming 0.2–0.3 s is free.
2. **19.7:** the seam alarm peaks at -15.9 dBFS, about 11 dB under the voice. That is fine; 2–3 dB more would make the wake-up joke at the loop point land harder.
3. After publishing, compare the stay rate with EP002 Short #2 (16.5 %) and record the gap (CHANNEL_STATS rule).
