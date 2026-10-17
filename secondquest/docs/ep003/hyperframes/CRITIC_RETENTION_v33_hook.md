# EP003 v3.3 · Retention critic · opening 0–66 s (hook h01–h10 + block B b01–b03 + l12 into C)

Critic: independent retention pass (did not build the piece; no file edited). Skill: `shorts-retention-critic`, adapted
to a long-form opening. The question: does a viewer who clicked from Home ("Why Did Millions Buy a Fishing Game... and
Not Fish?", thumbnail NOT FISHING = friends in a boat + unimpressed fish) stay through the first 60 s?

Input: `EP003_full_hyperframes_review.mp4` (1280x720, 30 fps, 328.4 s), judged 0–66 s. Frames every 0.25 s for 0–66 s,
every 1/30 s for 0–3 s and ±0.13 s around each of the 10 detected cuts (9.87, 11.43, 13.07, 25.80, 30.83, 36.57, 40.77,
55.07, 61.77, 65.63), frame 0 at full size and at feed size. Transcript from `episodes/ep003/timings.json` (v3.3),
SFX cue list from `scripts/ep003-sfx.py`, audio RMS per 0.25 s from the review mix. Approved intent:
`SCRIPT_CHANGE_PROPOSAL_02_HOOK.md`. Channel lessons: `docs/publish/LEARNINGS_EP001_EP002.md` §5–6.

## Verdict: **FIX**

The structure is right and mostly well timed: picture events land on their words (boat on "boat" 3.2, rod on "rod" 4.3,
fish on "fish" 5.3, friends on "nobody" 6.6, $7.99 on "eight dollars", the three "Bought." on their words, the strike on
"not" 43.3, the invitation on "invitation" 44.8). The chat sequence (13–25 s) is the strongest stretch, and the
unimpressed fish peeking in at 24.3 s is a good beat. There are no confusing frames and no flash or blank frames at any
cut. The verdict is still FIX, for three reasons:

1. **The first 3 s break the channel rule and the thumbnail promise.** Frame 0 to 3.2 s shows an empty sunset lake.
   It has no character, no face, no conflict, and no boat until 3.25 s. The friends only appear at 6.75 s. A viewer who
   clicked on "friends in a boat, NOT FISHING" sees a screensaver for 3 s, which is the same pattern that lost EP002
   Short #1 at 1.5–5 s.
2. **The sound has dead air.** The beds sit at about −60 dBFS RMS, which is inaudible on a phone, so every gap between
   lines is digital silence (see the sound section below).
3. **There are two stretches of 2 s or more at an attention score of 1 or less:** H8 (27.5–30.5 s) and the empty
   spotlight in b03 (55.5–57.5 s).

All three can be fixed with existing material.

## Retention beats (long-form adaptation)

| Check | Result |
|---|---|
| Frame 0 delivers the click promise (face with emotion + game icon + conflict) | **FAIL.** Empty lake plate; no face, no title, no conflict. The game's title arrives at 1.5–2.6 s. |
| First 3 s | **FAIL.** Plate plus a typed title. The voice says "There is a game called How to Fish" (neutral first line, acceptable in long form only if the picture carries the conflict). |
| Recognition → contradiction → human problem by ~20 s | **Mostly.** Recognition 0–6.5; contradiction "nobody fishing / slapping" 6.6–10.9 and "$8" 11.5; human situation readable from 13 s (group chat) and clear by 22.3 s ("I'll get it later"). It is named explicitly only at 25.9–30.6 (H8), about 6–8 s later than intended, and that line is the weakest picture of the hook (see R3). |
| H3 "slapping each other in the face" | **Weak.** The picture shows the friends laughing and pointing, with a SLAP! sticker on top; nobody is slapped. The proposal (D, H3) planned to "CROP/PUSH approved art 02 slap revive". That art exists (`docs/art_orders/ep003/new_art_v1/02_slap_revive.png`, used in block E) but the hook doesn't use it. |
| "So, why?" + wordmark | **Lands.** The SecondQuest wordmark is reeled up on "So," (38.0) with the bobber SFX, and the fish peeks at 38.5. The 1.5 s rest after it (39.5–40.75) is intended. Two weaknesses: the rest is true digital silence (−67 to −75 dBFS), and the question in the title is never put on screen. |
| Block B keeps momentum into C | **Yes, with two dips.** The cut to shocked Quest (40.77; a face with emotion), tag, strike and invitation are good. The number section is 9 s of blurred room (46–55) with holds at 48.5–49.75 and 53.25–55.0. The b03 empty spotlight (55.25–57.45) is the weakest 2 s of the opening. The l12 hand-off (61.8 phone → building pan → four phones at 65.6) works; the building-only frame from 64.0 to 65.6 s is a soft spot. |
| Coherence | (a) At 30.83 the cut back to the 4-seat boat puts Leo (who "will not get it later") back in the boat 0.2 s after H8 showed his seat empty, which undercuts the joke. (b) H8's "empty seat" doesn't read: the stern is cropped and taken by the rod, so it looks like a 3-person boat, not a missing friend. (c) The 10,000,000 lands at 52.5, 0.55 s before "ten million" (53.06); the stamp is on the word, so it is acceptable. |
| Captions / on-screen text | Readable in one glance. The chat bubbles are large and on the word. |

## Attention curve (0–3 per 0.5 s)

3 = new and meaningful · 2 = purposeful motion · 1 = ambient only · 0 = nothing / confusion. **Bold** = drop-off risk.

| t (s) | +0.0 | +0.5 | +1.0 | +1.5 | what's on screen |
|---|---|---|---|---|---|
| 0–2 | **1** | **1** | **1** | 2 | empty sunset plate, gulls; "HOW" slams 1.5 |
| 2–4 | 2 | 1 | 2 | 1 | TO FISH; empty boat on "boat" 3.25 |
| 4–6 | 1 | 2 | 1 | 3 | rod 4.5; fish jump on "lot of fish" 5.5 |
| 6–8 | 2 | 2 | 3 | 2 | title out; friends appear on "nobody" 6.75; line whips |
| 8–10 | 2 | 2 | 2 | 3 | fish stares; punch-in 9.25; flash + SLAP! 9.87 |
| 10–12 | 2 | 2 | 1 | 2 | slap SFX 10.62 on a laughing (not slapping) pose; blur |
| 12–14 | 3 | 2 | 2 | 1 | $7.99 swings in; cut to the phone (13.07), empty chat |
| 14–16 | 1 | 2 | 2 | 2 | typing dots 14.5; "It's eight dollars. Just get it." |
| 16–18 | 2 | 1 | 2 | 3 | Bought #1 + pop 17.5 |
| 18–20 | 1 | 2 | 1 | 3 | Bought #2 (**silent**) 18.75; Bought #3 + coins 19.75 |
| 20–22 | 1 | 1 | 2 | 1 | Leo typing 21.25 |
| 22–24 | 3 | 1 | 1 | 2 | "I'll get it later." 22.25; typing again 23.75 |
| 24–26 | 2 | 2 | 1 | 2 | the fish peeks, unimpressed (24.25); cut to boat 25.8 |
| 26–28 | 1 | 2 | 2 | **1** | Leo's bubble drifts in 26.75; pop on "boat" 27.52 |
| 28–30 | **1** | **1** | **1** | **1** | H8: static boat, bubble hangs — "harder than anything in the game" |
| 30–32 | **1** | 2 | 2 | 2 | "And yet," cut to the 4-seat boat (Leo is back), zoom out |
| 32–34 | 3 | 2 | 2 | 2 | the fleet multiplies on "millions" |
| 34–36 | 3 | 2 | 2 | 1 | TO DO EVERYTHING ELSE card slams; fish |
| 36–38 | 1 | 2 | 1 | 2 | "Together." punch-in 36.57; pull back |
| 38–40 | 3 | 3 | 2 | 1 | wordmark reeled up on "So, why?"; fish peeks |
| 40–42 | 1 | 2 | 3 | 3 | (rest, digital silence) → cut to shocked Quest 40.77; tag swings in 41.75 |
| 42–44 | 2 | 1 | 3 | 1 | strike on "not" 43.25 |
| 44–46 | 1 | 2 | 3 | 2 | tag flips → invitation opens 45.0 |
| 46–48 | 1 | 2 | 1 | 2 | blur; THEY HOPED; counter rolls |
| 48–50 | 2 | 1 | 1 | 2 | 200,000 holds; strike 49.75 |
| 50–52 | 1 | 1 | 2 | 2 | struck number drifts; reel spins |
| 52–54 | 2 | 3 | 2 | 1 | 10,000,000 lands 52.5 / stamp 53.06; "+" |
| 54–56 | 1 | 1 | 2 | **1** | number holds; cut to empty spotlight 55.07 |
| 56–58 | **1** | **1** | **1** | 3 | spotlight sweeps an empty stage; Quest alone on "alone" 57.5 |
| 58–60 | 2 | 3 | 2 | 2 | friends slide in on "Everyone"; boat |
| 60–62 | 2 | 3 | 2 | 2 | boxes land in the boat; box to camera; phone + confetti 61.77 |
| 62–64 | 2 | 2 | 2 | 1 | split: phone vs. building pan |
| 64–66 | 1 | 1 | 1 | 3 | buildings only; four phones (block C) 65.63 |

Mean 0–66 s: 1.75. Mean for 0–3 s: 1.33, the lowest 3 s window of the opening and the most expensive one.

**Stretches at a score of 1 or less for more than ~1.5 s:** 0.0–1.5 (frame 0), **27.5–30.5 (3.0 s, H8)**,
**55.5–57.5 (2.0 s, b03)**, 63.5–65.5 (2.0 s, a slow pan, soft), 53.5–55.0 (1.5 s). The 39.5–40.75 rest is the Producer's
1.5 s wordmark silence and is excused. There is no second at 0.

## Sound (12 onsets in 62 s)

The count is right and inside the rubric (hook 8: title wood 2.1, slap 10.62, Bought #1 17.55, Bought #3 19.73, drain
23.92, pop 27.52, card slam ~34.0, wordmark 39.15; B 4: tag 41.5, strike 43.28, stamp 53.06, boxes ~60.4). The problem is
the floor under them. The beds measure **about −60 dBFS RMS**, which is inaudible against −14 LUFS voice. Every pause is
heard as digital silence:

2.75, 3.75, 4.75, 12.75, 14.75, 17.0, **18.0–18.25, 19.0–19.25**, 20.0, 23.0–23.25, 25.5, 36.25, 37.25–37.5,
**40.25–40.5 (−68 to −75 dBFS)**, 61.25–61.5, 65.25.

The worst spots:

- **Bought #2 (18.53) has no sound.** In the "Bought ×3" rhythm the middle hit is mute, so the escalation reads as
  1 · nothing · 3.
- **The "So, why?" rest** is total silence over a static frame. The silence is a Producer rule and stays. It is
  listed here only because it is the one place where a viewer can't tell a pause from a dropout; the Producer decides
  whether a faint water tail is allowed.
- **11.4–12.3 (blur to the tag) and 25.4–25.9 (the cut into H8)** are cuts that arrive in silence and feel like a gap
  in the edit.

The density then jumps at 61.8 (block C: notify / whoosh / pop ×6 in 2 s), which makes the hook feel even barer by
contrast.

## The 3 most valuable fixes (existing material only: camera, cut, pose, sound, text layout)

1. **0–6.5 s: open on the promise, not on an empty plate.** (Biggest drop risk: the click → first 3 s.)
   - Frame 0 = the existing four-friends boat layer at the 9.25 s punch-in framing (faces readable at feed size), the
     "HOW TO FISH" title already composited (not typed in), and the existing unimpressed fish sprite at the lower-right
     edge, looking at them. That is the thumbnail's picture, now moving.
   - Keep the word sync as camera moves on that shot instead of building an empty lake: "A boat" small pull-back,
     "A rod" tilt to the rod tip, "A lot of fish" fish pops at the edge (existing jump).
   - On "slapping" (9.36), cut to **`02_slap_revive.png`** (approved, already in block E) with a push-in, the existing
     2-frame flash and the existing slap SFX on 10.62. This is the H3 plan in the approved proposal, and it gives the
     opening a real face with strong emotion and an actual slap instead of a sticker over laughter.
   - The empty lake plate can stay as a 0.5 s background plate under the title only if a character is in frame.
2. **Sound floor and the missing "Bought" hit.**
   - Raise the lake/room beds to about −30 to −34 dBFS RMS (≈ 16–20 dB under the voice, audible on a phone) so no pause
     in 0–62 s drops below about −40 dBFS. The 39.5–40.75 rest is a Producer rule ("1.5 s of silence"), so leave it
     as it is unless the Producer chooses to let only the water bed tail through it.
   - Give Bought #2 (h06.w2 + .16) its pop, pitched between #1 and #3. To stay inside 12/min, drop the fleet explosion
     layer (it sits under the card slam and doesn't add an onset of its own) or the "drain" at 23.92.
   - Carry the room tone across the 11.4 and 25.8 cuts (an L-cut of the next bed by about 0.3 s).
3. **Kill the two long low stretches (H8 and b03), and fix the Leo continuity.**
   - **H8 (25.8–30.7):** frame the stern so the empty seat is visible. On "same boat" (27.52) push in slowly onto the
     empty seat while Leo's "I'll get it later." bubble greys out over it. On "harder than anything in the game"
     (27.96–29.5), rack or zoom out to the three friends looking at the empty seat (pose / head-turn layer if the
     in-boat layers allow it; otherwise the camera move alone).
   - For "And yet, millions" (30.83), keep the 3-friends-plus-empty-seat boat at the centre of the fleet zoom-out (the
     layers exist) and only fill the fourth seat on "Together." (36.57), so Leo's arrival becomes the payoff of the
     hook instead of a continuity slip.
   - **b03 (55.07–57.45):** bring Quest's avatar into the spotlight on "Because" / "this" (55.1–55.4) instead of on
     "alone" (57.5), and keep the swing of the light as the move. On "alone" have the light narrow on him, then the
     others slide in on "Everyone" as now.

**Smaller, optional:**
- Put the question on screen as text layout at "So, why?". The title's question ("…and not fish?") is never written in
  the opening; a small "SO, WHY?" under the wordmark, or the existing "WHY FISHING?" kinetic style, would close the
  title → video loop.
- Trim the 53.5–55.0 hold on 10,000,000+ by about 0.7 s, or give it a slow push.
- Start the four-phones wipe of block C about 0.5 s earlier into the building-only frame at 64–65.6.

## Calibration note

Per LEARNINGS §6, this verdict should be compared with real data: the long-form retention curve at 0:00–0:30 and the
0–60 s drop on the EP003 analytics (72 h). If the 0–3 s fix is not made and the curve drops more than ~15 % before 0:05,
this report's frame-0 rule is confirmed for long form too.
