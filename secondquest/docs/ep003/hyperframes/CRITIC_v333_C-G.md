# EP003 v3.3.2 · Independent design critic · blocks C–G (61.76–328.4 s)

Critic: frame-critic skill. This is an independent review: the critic did not build the piece and edited nothing in it.
Date: 2026-10-17. Commit reviewed: 7c0e4b3.

**Material**
- Review render: `EP003_full_hyperframes_review.mp4` (720p, 328.4 s).
- Projects: `tools/hyperframes_ep003/blockC` (61.76–105.97), `blockD` (105.97–163.27), `blockE` (163.27–239.24),
  `blockF` (239.24–293.90), `blockG` (293.90–328.40). Local time = episode time − block start.
- Builder's claims: `CRITIC_v33_NOTES.md`, sections "v3.3.2 · the redesign list" and "v3.3.2 · design critic FAIL on block C".
- Cue lists: `build/ep003_sfx_cues_{C..G,all}.json`. Mix: the review MP4's own audio track.

All timestamps below are episode time unless marked "local".

```
__VERDICT__
```

## 1. Block C: the 9 items from `CRITIC_v332_0-110.md`

| # | Item | Verified |
|---|---|---|
| 1 | Sound (108 onsets, no "why") | **Fixed.** 9 cues / 8 onsets in 44.2 s = 11/min, 91 % rest, every cue has a "why", −13.7 LUFS / −1.5 dBTP, 0 errors. 2 HARSH warnings stand (metalLatch 75.92, centroid 8.0 kHz; doorClose_2 100.62, 6.4 kHz): swap for darker takes when convenient, not blocking. |
| 2 | Kid see-through crossfade ~95.7 | **Fixed.** 1/30 s over 95.5–96.0: the hallway holds to the door's full swing, then a hard cut to the kid under a white bloom (first kid frame washed, no hallway visible through him), clean by ~95.9. |
| 3 | MARCH → OCTOBER | **Fixed.** All four phones read "OCTOBER" (66.0 full size). |
| 4 | Clock NOT IT opaque | **Fixed.** 87.2 full size: cream fill, the hands and numerals do not show through the letters. |
| 5 | Map NOT IT dropped | **Fixed.** 1/30 s over 85.3–85.8: pins meet, straight cut to the clock, no stamp. |
| 6 | "Message" placeholder contrast | **Fixed by eye** (#99948c reads clearly at 89.5 / 105.0); the `hyperframes check` contrast pass on C is in §5. |
| 7 | ASKING chip under $7.99 | **Fixed.** 104.6: the chip is mid-pop (a sliver of "A" for ~2 frames); 105.0: gone. Accepted. |
| 8 | Header titles vs avatar stack | **Fixed.** Clear gap between the Q P M L discs and "The boat" / "THE GROUP" (62.5, 66.0). |
| 9 | D 106–110: old phone + WHY ghost | **Phone fixed** (hook ChatPhone with portrait avatars at 109.5–115). **WHY ghost fixed** (opaque from its first frame). **New defect in the same beat:** 106.37–106.57, "FISHING?" slams in at ~1.9× directly over "WHY" ("wFISHING?" at 106.43, full size) and runs off the right edge; frame_critic does not see it (transforms are not in the DOM box), so it passed the 1/30 s sweep. See D-1. |

## 2. Blocks D–G, reviewed in full for the first time

Method: 2 fps sheets of 104–328.4 s (38 sheets), 5–30 fps window sheets around every cut, title and stamp, and full-size
frames for every finding (paths in Evidence).

### Beat map (short)

| Time | Beat |
|---|---|
| 105.97 | D1 WHY FISHING? over the dusk lake, slot reel lands on three fish |
| 109.4 | D2 split: hook ChatPhone (Max / Bought ×3 / Leo) + $7.99 PAID stamp | empty boat; 1 HOW TO MEET ✓ SOLVED, 2 WHAT TO DO THERE? |
| 116.2 | D3 polaroid develops on the cabin table: "the lake · that summer", red circles on who was in the boat |
| 122.9 | D4 Pixie and Quest in the boat, close singles, "…" bubble, underwater fish, oar foreground, "a reason" tag, "JOB: silence" |
| 139.1 | D5 ALIBIS board: golf, poker night, the garage (whip pans into each), X'd, "?" slot |
| 158.0 | D6 board phone (hook skin) pinned into the slot, NEWEST, lake photo bubble, Pixie "tonight?" |
| 163.3 | E1 4-up boat, "Alibi props" checklist, fish yeets it, game HUD, shop board, pistol/shotgun/dynamite, SELL, roulette + wallet, boss shadow |
| 182.5 | E2 Steam quote over blurred lake |
| 190.9 | E3 GOAL: catch fish → ALIBI stamp; FAILURE. grey frame |
| 200.9 | E4 fails: Quest falls in, Pixie + dynamite, roulette ALL IN, suspects line-up, launched across the island, rewind to the eye ("boop"), downed → Pick up → SLAP close-up → REVIVED! |
| 222.7 | E5 "feelings." on the hull |
| 226.3 | E6 "perfect day" polaroid greys out; the fail polaroids; 2026→2031 YEARS LATER; years-later phone (hook skin), Sam "???" |
| 239.2 | F1 blank tag → FRIENDSLOP sign, trash can under a spot, CHEAP/CHAOTIC/CO-OP, four friends pop up, hop into place around the can (fish inside) |
| 254.9 | F2 PLAYTIME bar drains, calendar JUNE→AUGUST #1 |
| 258.7 | F3 dusk→night boat with lantern, "Leo: on?" Tue 9:00 PM notification, □ FISH post |
| 272.2 | F4 living room, 12:41→3:12 AM, LAST ROUND struck |
| 279.0 | F5 yearbook founders (faceless hoodies), "first paid game" chart dives, the line becomes the rod → stick-figure boat |
| 289.7 | F6 hero phone (hook skin) → wall of chats → 10,000,000+ ; designed fade to black 292.73–293.97 |
| 293.9 | G night lake: question as a water reflection, drop breaks it; FISH-O-DEX; "fishing tuesday?"; HOW TO ~~FISH~~; Message… "I miss you" typed and deleted, "boat tonight?" sent, Pixie "Bought."; all four in the boat; SecondQuest end card |

### What works (keep)
- Every boat shot D–G has everyone inside the hull, including the 2026-10-14 G night wide (322–328: all four in, Leo
  at the stern inside). Quest standing / falling in the boat (200.9–202) reads as a gag, not a placement error.
- The three chat phones requested (109–115, 158–163, 234–239, 289–292) now share the hook's ChatPhone skin, portrait
  avatars, AA name colours and chrome. The D6 phone hangs from the red pin of the alibi string: anchored, not pasted.
- E fish vs roulette (5 fps over 178.6–181.8): the fish ducks at ~179.2 as the wheel drops, and is back only at
  ~181.0 after the wheel has gone. **Fixed** as claimed.
- F friends (247.5–253.5): four full figures, feet on the stage floor, ≈ 25–30 % of frame height, then a hop into place
  around the can. No discs, no badges. **Fixed** as claimed.
- F→G fade: blackdetect finds one black run, 292.73–293.97 (1.23 s), then G fades up under "So…". Designed, clean.
- Art fits the lines almost everywhere: polaroid memory for "they remember who was in the boat", underwater fish for
  "the fish gives the afternoon a reason", the Steam quote, the slap, "feelings." on the hull, the 2031 group chat, the
  founders as faceless silhouettes (no real-person likeness), the chart becoming the rod. Light effects (lantern glow,
  stage spot, door light) all have visible sources.

### Findings

**D-1 · 106.37–106.57 · "FISHING?" lands on top of "WHY" (text over text).** At 106.43 (full size) the 1.9× "FISHING?"
covers "WHY" ("wFISHING?") and exits the right edge; then the pair settles touching ("WHYFISHING?" for a few frames
at ~106.55). Fix: let FISHING? slam to its own slot to the right / below WHY at its final scale (scale from 1.3 at most),
or push WHY left first. Also extend frame_critic to use transformed bounds (`getBoundingClientRect` after GSAP scale) —
this is the second gate miss on a scaled title.

**D-2 · 110.1–115.8 · the $7.99 PAID stamp still crosses text.** It no longer covers Max's message, but it now lies on
Quest's "Bought." sticker, its timestamp and the top of Max's "Bought." (111.0 full size; "PAID" runs through the
second sticker). Text over text on the beat's main object. Fix: stamp it on the empty phone background to the right of
the stickers (there is ~120 px free at x ≈ 380–450, y ≈ 440–520 at 720p), or stamp it on the boat half of the split.
The ✓ SOLVED disc (113.6–115.8) also sits over the phone's right edge and the stamp; acceptable once the stamp moves.

**D-3 · 138.0–138.9 · "JOB: silence" badge is a pasted box.** It pops in the sky between Quest's head and the sun with
no anchor (138.4 full size). Fix: clip it to the "…" bubble (hanging from its tail or corner), the way "a reason" hangs
from the line on the fish.

**D-4 · 158.17–158.27 · ghost phone over the polaroids.** The board phone flies in large and semi-transparent: for
~3 frames its rows ("dollars. Just get it", "Bought.") show through "poker night" (5/15 fps sheet). Fix: enter opaque
(no opacity tween) and from below the string, not across the polaroids.

**E-1 · 164.5–171 · "Alibi props" checklist pinned to the sky.** Two red pins into nothing (166.5 full size). It is
the joke's object, so it is acceptable as a "note", but by the rubric it is a box with no anchor. Cheapest fix: clip
it to Max's rod or hold it on a clipboard in Quest's hand; or accept and declare it in the storyboard.

**E-2 · 202.4–203.6 · FAIL ×1 panel covers Max's face and the top of Leo's head** (202.6 full size: the panel sits on
Max's googly eyes; Leo's beanie is under its lower edge). HUD over acting faces. Fix: drop the panel ~60 px lower is
not enough; move it to the left (over the empty lake left of Pixie) or shrink the shot so the crew sits below y ≈ 330.

**E-3 · 213.0–215.0 · hearts HUD over Max's face** in the rewind / eye shot (213.6 full size): the boat is cropped
top-left and Max's head sits under the hearts pill. Fix: frame the boat 80–100 px lower or to the right of the pill.

**E-4 · 233.0–239.0 · "2031" stamped on the "$0" polaroid.** 2026→2031 rolls directly over the "$0" headline, and when
it settles left the two read together as "2031 $0" (237.6). Declared as designed, but it is text over text on the
beat's title. Fix: put the year on the empty table area (upper right) or over the greyed "perfect day" photo, never on
a polaroid with its own big text.

**E-5 · motion blur budget.** Motion-blurred snaps in D–E: whip pans 140.5 and 141.5 (alibi plates), the line-up
whip ~208.5 and the line-up tumble 209.7–210.2 (Max and Leo spin with heavy blur). That is 4 in 70 s against "1–3 per
video". No readable text is blurred, so this is a FIX, not a FAIL: keep the two alibi whips, drop the blur on the
line-up (a hard cut or a shake is enough).

**F-1 · 263–272 · the "Leo: on?" notification banner.** An OS banner over a non-phone scene; it enters from the top,
which is where a banner lives, and Tue 9:00 PM matches the line, so it is accepted. Note only: Leo opening the chat
here sits slightly against the running joke (Leo the late one); the builder removed "on?" from the hero phone for that
reason. Consider "Max: on?".

**G-1 · 294.0–299.5 · the episode's question is only an upside-down, wobbling reflection.** The line "So… why did
millions of people buy a fishing game and not fish?" is rendered only as `#refl` (scaleY −0.8, 62 % opacity, wobble),
with no upright text. Flipped, "SO..." reads as **"20···"** (296–298 full size), and the rest is hard to read even
when you know it. It is the thesis question; it either has to be legible or it is decoration. Fix: set the line
upright and sharp above the water (where the sky is empty) with the reflection beneath it as the echo, and let the
drop break only the reflection. The doubled layers when the drop hits (298.5–299.4) then read as water, not as ghost
text.

**G-5 · 311.5–311.8 · the "Message…" field lands on top of "HOW TO".** `hyperframes check` G: 4 `text_occluded`
errors (#tw1 HOW, #tw2 TO, #tw3 FISH, #tut TUTORIAL, local 17.61–17.78). At 311.6 (full size) the white field sits
over the half-faded title while the struck "FISH" tumbles over the moon's reflection: a box pasted on text. Fix: the
title exits completely (FISH falls, HOW TO drops out) before the field enters, or the field rises from the bottom
(where it lives at 314+), not at the title's height.

**G-2 · 304.6–305.6 · the fish fades out see-through** next to the boat ("fishing tuesday?"). A character dissolving
in place is the see-through pattern the Producer rejected. Fix: let it dive (ripple), as it does in E.

**G-3 · 317.8–319.0 · Pixie's "Bought." carries a "P" letter disc**, not her portrait avatar (318.2). Letter avatars
were rejected in v3.3.1 (A/B); the hook's phones now use portraits. Fix: the hook's Pixie avatar crop.

**G-4 · 326.3–326.9 · the fish leaps through the SecondQuest wordmark** and covers the "Q" (326.6). If it is the
end-card gag, declare it; otherwise let it jump between the wordmark and CONTINUE?.

**Minor, noted (no action required):** 116.0 the polaroid caption changes from "aug. · the lake" (developing) to "the
lake · that summer"; 136.5 the "a reason" tag covers half the fish's eye; 179.2 the roulette enters over the money HUD
for a few frames; 221.5–222 the SLAP! burst touches Leo's chin/shoulder (not his face); 140–158 golf and poker plates
are empty and the garage shows Quest (a kid) for an adult alibi; the "Message" placeholder on the phones is small but
it is chrome.

## 3. Sound

| Block | Cues / onsets | Rate | Rest | Mix (review audio) | Result |
|---|---|---|---|---|---|
| C | 9 / 8 | 11/min | 91 % | −13.7 LUFS / −1.5 dBTP | 0 err, 2 warn (HARSH 75.92 metalLatch, 100.62 doorClose_2) |
| D | 12 / 11 | 12/min | 92 % | −14.2 / −1.6 | 0 err, 0 warn |
| E | 17 / 15 | 12/min | 84 % | −13.8 / −1.4 | 0 err, 1 warn (HARSH whip 171.41) |
| F | 10 / 10 | 11/min | 94 % | −14.5 / −1.7 | 0 err, 1 warn (HARSH whip 254.49) |
| G | 5 / 5 | 9/min | 90 % | −14.9 / −1.9 | 0 err, 0 warn |
| Whole mix | 67 / 61 | 11/min | 90 % | −14.2 / −1.4 | 0 err, 7 warn (4 HARSH above + CATEGORY_FATIGUE stamp 10×, impact 7×, notify 7×) |

- Claimed onsets (C 8, D 11, E 15, F 10, G 5, whole 11/min) **confirmed**. Every C–G cue has a "why".
- The cue lists match the actual mix: a narration-subtracted envelope onset scan of the review audio after 61 s finds
  48 transients against 53 listed cues, and only 7 transients not within 0.35 s of a cue (79.08, 181.34, 181.82,
  202.2, 211.86, 322.16, 322.56) — bed swells / fish and boss foley in the beds, no click trains. The old machine-gun
  runs are gone.
- Cut or swap (fewer, better): the two `whip.wav` (171.41 fish yeets the list; 254.49) are the thinnest cues in the
  episode — swap for a cloth/air swish with body. Stamps are 10× across the episode: keep the ones on words that matter
  (LATER, NOT IT, $7.99, ALIBI, FAILURE.) and let the rest land silent or on a soft paper thump.

## 4. Repeated mistakes: checked

| Item | Result |
|---|---|
| Character outside the hull (2026-10-14, G night wide) | checked: no repeat (every boat shot 109–328 at 2 fps; 322–328 all four inside) |
| Portrait badge instead of full figure | checked: no repeat (F discs gone, friends full figure 247.5–253.5; CHAR_BADGE 0) |
| Pasted floating box | **repeats**: "JOB: silence" 138.0–138.9 (D-3); "Alibi props" note pinned to sky 164.5–171 (E-1, borderline) |
| Motion-blur / ghost text | **repeats** visually: ghost phone 158.17–158.27 (D-4); the upside-down reflection text 294–299.5 (G-1). 0 GHOST/MOTION_BLUR flags in the gates |
| Text / title over HUD or faces | **repeats**: FAIL panel over Max 202.4–203.6 (E-2), hearts over Max 213.0–215.0 (E-3) |
| See-through crossfade on a character | C kid fixed; **repeats** on the fish 304.6–305.6 (G-2) |
| Object cut through by another object / text over text | **repeats**: FISHING? over WHY 106.37–106.57 (D-1), $7.99 PAID over "Bought." (D-2), 2031 over $0 (E-4) |
| Unmotivated light (2026-10-15) | checked: no repeat (lantern, spot, door light, moon all sourced) |
| Snap-back camera / fake walk / half out of frame | checked: no repeat (cropped boats at 211–215 and 220–222 are deliberate close framings) |
| Letter avatars (v3.3.1) | **repeats** once: "P" on Pixie's Bought. 317.8–319.0 (G-3) |

## 5. Automated gates

__GATES__

## 6. Taste
__TASTE__

## Evidence
Scratch (not committed): `critic_v333/` in the session scratchpad — `sh/s_01..38.jpg` (2 fps sheets from 104 s;
sheet n starts at 104 + 6(n−1) s), `ev/f_<t>.jpg` full-size frames, `ev/w_<t>.jpg` window sheets,
`fc025_<B>/critic.md`, `fc30/<B>_<t>/critic.md`, `check_<B>.json`, `sfx_<B>.json`, `sfx_all.json`, `lint_<B>.json`.
