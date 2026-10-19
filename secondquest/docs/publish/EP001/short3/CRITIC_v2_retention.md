# EP001 Short #3 "The work loop" · retention critic v2 (2026-10-19)

Critic: independent (`shorts-retention-critic`). Piece: `tools/hyperframes_ep001_short3/renders/EP001_short3_v2_preview720.mp4`
(720x1280, 21.45 s). This pass re-checks the windows the coordinator named: 8.5–11.75, 13.5–17.0, 17.9 to the end,
the loop point, and a spot check of the dealership (7.0 s).
Method: 4 fps strips, full-size key frames, per-frame motion (luma difference) per 0.5 s, audio RMS per 0.1 s plus
peak/RMS per window, and SSIM between the last frame and frame 0.
v1 report: `CRITIC_v1_retention.md` (FIX).

## Verdict: **PASS**
No second scores 0, no stretch of score 1 or lower runs past 1.2 s, the payoff lands on "work.", and the end card is 2.0 s.
The loop now carries sound across the seam.

## v1 fixes, checked
| # | v1 issue | v2 measured | Status |
|---|---|---|---|
| 1 | 1.5 s of dead silence after "expected." | Quiet from 14.45 to 15.35 s (about 0.85 s, about -38 to -43 dB). "and then..." starts at 15.4. | Fixed. It now reads as a deadpan beat, not a dead screen. |
| 2 | Record scratch buried | Scratch at 15.96 s, `rel_db` -2. Window peak -4.7 dBFS (the voice peaks the same); the freeze is hard at about 15.95. | Fixed. The scratch lands on "then...". |
| 3 | FULL EPISODE ↓ unreadable | About 64 px, opaque, centred under the wordmark. Readable at feed size. | Fixed |
| 4 | Silent end card, no audible loop | Bed raised to -22 (card about -32 to -45 dB, never digital silence). Alarm at 20.45 rattles to the last frame (peak -17.7 dBFS). | Fixed. It is quiet but audible. |
| 5 | Card 2.5 s | Card about 18.4–20.4 = 2.0 s, then 1.0 s of seam | Fixed |
| 6 | Static mock-epic hero | Push 1.0→1.12 from "Most" (motion 5–7 per 0.5 s, from about 1.2), hard stop on the lightning at about 10.6 | Fixed. The parody now builds. |
| 7 | Tractor invisible at the end of the pull-out | The tractor speck stays findable through the hold (13.5–15.3) | Fixed |
| — | Dealership | The tractor sits behind the fence; the wallet's shocked face is clear at 7.0 | OK |

## Attention curve (re-checked windows, per 0.5 s)
| t (s) | Score | What happens |
|---|---|---|
| 8.5 | 2 | Cut to the hero in the wheat |
| 9.0 | 2 | Heroic push, "Most of the" |
| 9.5 | 2 | Push, "time," |
| 10.0 | 2 | Push, the sky darkens, "your greatest" |
| 10.5 | 3 | Lightning and thunder on "enemy", hard stop |
| 11.0 | 1 | Hold (0.5 s) |
| 11.5 | 2 | Cut to the field, "is a field" |
| 13.5 | 2 | Pull-out ends, "than you expected." |
| 14.0 | 2 | Settle |
| 14.5 | 1 | Deadpan silence, the tractor visible |
| 15.0 | 1 | Silence ends; cut at about 15.35 |
| 15.5 | 2 | Close on him driving, "and then..." |
| 16.0 | 3 | Freeze + loud scratch |
| 16.5 | 2 | Frozen grey frame, then a hard cut to the desk at about 16.7 |
| 17.0 | 2 | "go back to work." with the snap zoom |
| 17.5 | 1 | Deadpan hold on his face (designed) |
| 18.0 | 2 | Cut to the end card, "YOU ALREADY HAVE A JOB." |
| 18.5 | 3 | "SECOND ONE?" lands; the wordmark and the wallet arrive |
| 19.0 | 2 | FULL EPISODE ↓ |
| 19.5 | 1 | Card holds (about 0.9 s) |
| 20.0 | 2 | The seam: the alarm at 20.45, frame 0 recomposes |
| 20.5 | 3 | The hook regrows: A GAME ABOUT GOING TO WORK? |
| 21.0 | 2 | Last frame ≈ frame 0 (SSIM 0.95), the alarm still ringing |

Stretches of score 1 or lower: 14.45–15.35 (about 0.9 s, designed) and 19.4–20.4 (about 0.9 s, designed); both are under the 1.2 s limit.

## Remaining notes (optional, not blocking)
1. The seam alarm sits about 10 dB under the voice (peak -17.7 vs about -4.7). If the master needs the loop to feel more like a wake-up, raise it 3–4 dB. Keep it under the voice.
2. The bed under the card is still very low (about -35 to -45 dB RMS). That is fine, but 2–3 dB more would make the 19.4–20.4 hold feel less empty.
3. Carried over from v1: keep the close-up on the wallet for its faint (about 8.2) so the reaction reads at phone size.
4. After publishing, compare the stay rate with EP002 Short #2 (16.5 %) and record the gap against this PASS (CHANNEL_STATS rule).
