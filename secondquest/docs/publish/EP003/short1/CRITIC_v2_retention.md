# EP003 Short #1 · retention critic v2 (2026-10-18)

Piece: `tools/hyperframes_ep003_short1/renders/EP003_short1_v2_preview720.mp4` (720x1280, 20.00 s, -14.2 LUFS).
Scope: the windows changed from v1 (0–2.6, 5.8–8.2, 8.0–10.8, 10.6–16.8, the end card 16.0–20.0 and the loop seam), at
1/10 s for the hook, 1/6 s for the card and seam, 1/5–1/4 s elsewhere. I measured audio RMS every 0.25 s and ran
silencedetect at -45 dB. To check the seam I took a pixel diff of the first and last frames. Builds on CRITIC_v1_retention.md.

**Verdict: PASS.** Every v1 fix landed. No second scores 0 and frame 0 now meets all three channel rules. The two
remaining ≤1 stretches are each at most 1.3 s. The end card is 2.6 s, at the limit. Three cheap polish items are
listed below; none of them blocks.

## v1 fixes, checked
| # | v1 fix | v2 result |
|---|---|---|
| 1 | End card ≤ 2.5 s, no silence | Card 16.4–19.0 (2.6 s). Text complete 16.83, wordmark 17.0, fish lands 17.17, FULL EPISODE 17.67. Silencedetect finds no silence anywhere; the bed sits at about -36 dB RMS through the card and the seam. **Fixed.** |
| 2 | h08 cuts between real poses | Wide shot of all four, closer than v1 (11.85), with a slow push on "Getting a few adults", then a pull-back by "boat" (13.0–13.85). A hard cut at about 13.9 to the Leo sweat punch-in with the fish for "harder than anything in the game"; the camera keeps moving (frame diff 5–11 per 0.25 s). It is no longer a dead wide shot. **Fixed.** |
| 3 | Card copy | "TAG THE FRIEND / WHO'LL GET IT / LATER" builds line by line and is readable at feed size. **Fixed.** |
| 4 | Frame 0 conflict readable | The banner is two lines ("It's eight dollars. / Just get it.") and legible at 240 px width. **Fixed.** |
| 5 | Frame 0 emotion | Leo's sweat/wide-eyed face is at 0.0 and on the seam. His blink at 1.9–2.0 on "Just" adds a beat. **Fixed.** |
| 6 | Seam double notification | No buzz: 19.0–20.0 is bed only, and the replay's 0.0 ping is the only notification. **Fixed.** |
| 7 | 6.5–7.5 typing dots | A small push and a pulse on Leo's typing row (6.4–7.4), then "I'll / get / later" type in at 7.6–8.2. **Fixed.** |

**Frame 0 against the rules.** It has a close-up face with a strong emotion (sweat, wide eyes). It has the game's
icon: the rowboat gunwale, the oar and the fish. It has a conflict in readable words: the banner, with "EVERY GROUP
HAS THIS FRIEND" above it. The big text is on screen 0.7 s before the voice starts.

**Loop seam.** The cut to Leo comes at 19.0, the hook text fades in from 19.17 and the banner drops at about 19.67.
The last frame matches frame 0 (mean pixel diff 0.67 out of 255, so effectively identical). The replay opens on the
ping and then "It's eight dollars." The seam is invisible.

## Attention curve (changed windows, 0–3)
| t (s) | What happens | Score |
|---|---|---|
| 0.0–0.7 | Frame 0: sweat face, readable banner, big text, ping | 3 |
| 0.7–2.5 | Words light up in the banner, blink on "Just" | 2 |
| 6.4–7.4 | Push and pulse on Leo's typing row | 2 |
| 7.6–8.2 | "I'll get it later." types in | 3 |
| 8.8–10.6 | Cut to Leo's side-eye; "He will not get it later." | 3 |
| 10.6–11.85 | Hold after the payoff: one blink (11.35), bed only, no cue | **1 (about 1.2 s)** |
| 11.85–13.0 | Wide shot of all four, push, "Getting a few adults" | 2 |
| 13.0–13.85 | Pull-back, "same boat" | 2 |
| 13.9–14.3 | Hard cut to the Leo sweat punch-in, "harder" | 3 |
| 14.3–16.3 | Push, fish, "than anything in the game." | 2 |
| 16.33–16.5 | Empty lake plate before the first card line | 1 |
| 16.5–17.7 | Card builds, wordmark, fish splat, FULL EPISODE | 2 |
| 17.7–19.0 | Static card, bed only | **1 (1.3 s)** |
| 19.0–20.0 | Seam: Leo, hook text, banner | 2 |

## Polish (cheap, not blocking)
1. **10.6–11.85, the hold after the payoff:** it runs 1.25 s with only one blink, and the v1 "dry blink tick" is not
   in the audio. Trim the hold to about 0.6–0.7 s (so the cut comes at about 11.3 and the voice at about 11.45), or put
   the tick and the fish's deadpan turn to camera at about 10.9. I couldn't see the fish's turn in my 240 px sheets, so
   it is worth confirming. The comedy beat gets its hit and the dead air goes.
2. **16.33–16.5:** for about 0.15 s the frame shows only the empty lake before "TAG THE FRIEND" appears. Start the
   first line on the cut.
3. **17.7–19.0:** the card is fully static for 1.3 s. Either cut to the seam about 0.3 s earlier (card 2.3 s, Short
   about 19.7 s; then get the time back from item 1 elsewhere so the Short stays at 20 s or more), or give the fish one
   small settle or blink at about 18.3 so the last stretch scores 2.

## Still open (Producer's call, from v1)
The reorder of the locked lines would put the laugh last, right before the loop ("Bought ×3" → h08 → "I'll get it
later / He will not get it later" → card → seam). It is still the change with the biggest retention upside, but v2
passes without it.
