# EP003 v3.3.1 · Independent critic · hook (block A) + block B (+ join into C)

Critic: frame-critic skill (independent; did not build the piece; nothing in the piece was edited).
Date 2026-10-17. Material: `EP003_full_hyperframes_review.mp4` (720p), projects `tools/hyperframes_ep003/hook`
(0–40.76 s), `tools/hyperframes_ep003/blockB` (40.76–61.77 s, B-local = episode − 40.76) and the opening of
`tools/hyperframes_ep003/blockC` (61.77–66 s). Previous verdict: `CRITIC_v33_AB.md` (FAIL). Builder's claims:
`CRITIC_v33_NOTES.md` § "v3.3 → v3.3.1". Timestamps are **episode time** unless marked B-local / C-local.

```
VERDICT: FAIL (one automated gate does not complete; design is at FIX level, short list below)
1 Hierarchy ........ PASS  - one focal point per beat; frame 0 = four friends + HOW TO FISH + fish; reel starts rolling; Quest in the spotlight 55.07-58.4
2 Overlaps ......... FIX   - 7.5-9.3 and 36.6-40.7: Leo's rod shaft cuts across his face/eye; 60.53-60.90: falling game boxes sweep across Pixie's, Quest's and Max's faces (2-3 frames each)
3 Safe/legibility .. PASS  - "THEY HOPED" 24 px (22 px after the 0.92 shrink), source line ~22-26 px, chat names AA (5.8-6.9:1); remaining TINY_TEXT = phone chrome + a sampler artefact (see notes)
4 Characters ....... PASS  - badges gone (57.4-61.7 full figures seated in the hull); fleet crews inside hulls, no airborne boats; everyone in every boat shot is inside the hull
5 Art fit .......... FIX   - 61.77-66: block C still replays the hook's chat (Max's "It's eight dollars. Just get it." verbatim, Leo now the organiser) and its avatars read "Q P A B" (Max = A, Leo = B); H8 reads, but only just
6 Motion ........... PASS  - B→C is now a clean cut on the held boat shot; bubble rises out of Leo's place and is gone 0.2 s before the 30.83 cut; wordmark never crosses the boat
7 Sound ............ PASS  - 12 onsets/min (ceiling), rest 88 %, -14.6 LUFS / -1.1 dBTP; crack + boom cut; no dead air outside the "So, why?" rest
8 Repeats .......... checked: hull rule (no repeat), portrait badge (no repeat), pasted box (no repeat), ghost/motion-blur text (no repeat), title over HUD (n/a), **unmotivated light: REPEATS 45.05-45.30 (envelope sheen escapes the envelope)**
Automated: lint 0 err (hook 9 / B 5 / C 16 warn); frame_critic 0.25 s hook 0/41w, B 0/9w; 1/30 s sweeps hook 0 err/578, B 0/286, C 0/50; sfx_audit 0 err/3 warn; check B layout 44 err (all designed/transient, reviewed), **check hook: does not complete (browser "Target closed", 3 attempts, even with 10 explicit samples)**
Top fix: clip the envelope sheen to the envelope (45.05-45.30) and make `hyperframes check` run on the hook; then move the rod off Leo's face and fix C1's avatar letters and duplicated lines.
Evidence: scratchpad critic_v331/ (ev/*.jpg, ws_*.jpg window sheets, sheet_00..08.jpg, hook30|b30|c30|hook025|b025/critic.md, check_blockB.json)
```

## Verification of the builder's claimed fixes (v3.3 fix list)

| # | Previous finding | Claimed | Verified by the critic |
|---|---|---|---|
| 1 | 57.43-61.30 portrait badges (CHAR_BADGE) + 61.2-61.6 see-through crossfade | full figures in the hull | **Fixed.** 58.4-61.77 the four friends sit in the two-pass boat, full figure, consistent scale; no badge, no crossfade; 1/30 s sweep 0 CHAR_BADGE. New minor issue: see §2 (boxes falling across faces) |
| 2 | H8 empty seat does not read; bubble in the sky; fade crosses the cut | rod on the rim, thinking poses, glances, bubble from his place, push-in | **Mostly fixed.** Bubble now grows out of the stern rim at 26.57 (tail on the rim), greys out, gone by 30.60 (cut 30.83). The push (27.2-30.8) opens a clear gap behind Max with Leo's rod lying on the rim. Judgement in §5 |
| 3 | Fleet heads float above hulls; airborne boats | two-pass side boats | **Fixed.** 32-36.5 crews are grey heads behind the near rim; no tilted or airborne hulls (crop at 34.0, 35.0) |
| 4 | Slap reads as a head-bump | approved art 02 on "slapping" | **Fixed.** 9.33 hard cut to art 02, flash + shake on the cut, slap cue at 9.311 (one frame early, fine). Hand on cheek is unmistakable |
| 5 | Fishing-line loops across faces | one clean arc behind the stern | **Fixed** for the line (7.5-9.3, 31-40.7). The **rod** itself now crosses Leo's face (§2) |
| 6 | Frame 0 / empty lake (retention) | four friends + HOW TO FISH + fish at frame 0 | **Fixed.** 0.00 shows all four in the boat, the title and the unimpressed fish at the bow edge |
| 7 | Small text: THEY HOPED 14 px, source line 13 px | 22 px / 26 px | **Fixed by eye.** Measured on the 720p frame: THEY HOPED cap height ≈ 18-19 px (24 px font), ≈ 22 px after the shrink; source line ≈ 22 px. frame_critic still prints "13-14 px": the sampler divides by the label's `offsetHeight`, which includes its 13 px padding + border (text rect 29 px / box 48 px × 24 px ≈ 14). Sampler artefact, not a defect |
| 8 | Chat names below AA | darker hues | **Fixed.** #a8241c 5.8:1, #0b5a60 6.5:1, #5a3fa6 6.3:1, #7a4f00 5.8:1 on the cream |
| 9 | Reel holds "00,000,000" | starts rolling | **Fixed.** 50.85-52.4 the reel is moving from its first frame; lands 52.5 |
| 10 | Empty spotlight 55.0-57.45 | Quest in the light | **Fixed.** 55.07-58.4 Quest full figure in the cone, cone source above frame (motivated) |
| 11 | Box→phone match cut fails; C reopens the chat in another skin | clean cut; C1 in the hook's skin | **Cut fixed** (61.75 boat held → 61.78 phone, no mid-turn sliver). **Skin partly fixed, content not** (§5) |
| 12 | Overlap 19.40-19.60 third "Bought." see-through | opaque punch-in | **Fixed.** 1/30 s: 2 frames of fade (19.57-19.60) as it scales in, opaque from 19.63; it briefly covers the fading typing row (designed punch, accepted) |
| 13 | 21.43-22.27 typing row under "I'll" | typing row leaves first | **Fixed.** Typing row gone 21.97, Leo's bubble lands 22.17; never two Leo rows |
| 14 | 38.03-38.13 wordmark through faces | reeled from under its place | **Fixed.** 38.03 fades in at its spot above the horizon |
| 15 | 45.07-45.27 envelope over Quest's hand | lands clear | **Fixed** for the hand. **New:** the envelope's sheen leaks out of the envelope (§8) |
| 16 | 39.16 crack / 34.00 boom | cut | **Fixed.** Neither in the cue list; 39.0-40.5 only a -50 dB water bed |
| 17 | 272.233 dark frame (block F) | render gap closed | Not re-checked in depth (out of scope); blackdetect 0-66 s clean |

## Automated gates (rerun by the critic)

| Gate | Hook (A) | Block B | Block C 0-4.3 / 4.4-5.4 | Notes |
|---|---|---|---|---|
| `hyperframes lint --json` | 0 err, 9 warn | 0 err, 5 warn | 0 err, 16 warn | structure/size warnings; one overlapping tween each (`dwell/hold` 33.78, `#flipper` B-local 4.31) |
| `frame_critic.py --step 0.25 --lint` | 0 err / 164 samples, 41 warn | 0 err / 84, 9 warn | — | warnings = phone chrome (timestamps, header subtitle), entrances crossing title-safe, the THEY HOPED sampler artefact, box art text "$7.99" on the game boxes |
| `frame_critic.py` 1/30 s, ±0.5 s around every cut/title/bubble (cold seeks) | **0 err / 578**, 22 warn | **0 err / 286**, 11 warn | **0 err / 50**, 19 warn | windows: 0-0.5, 1.2-3.5, 5.8-6.8, 8.8-11.9, 12.6-13.6, 17.2-17.9, 19.1-19.9, 21.1-22.6, 23.5-24.2, 25.3-27.8, 30.3-31.3, 33.5-34.5, 36.0-37.1, 37.5-38.6, 40.26-40.76; B-local 0-0.5, 0.8-1.4, 2.2-2.9, 4.0-4.9, 5.2-6.3, 9.9-10.9, 11.8-12.4, 13.8-14.8, 16.2-17.3, 19.3-21.0; C-local 0-0.6, 4.37-5.37 |
| `hyperframes check --json --at-transitions` | **does not complete**: `check_runtime_failure` "Target closed" after the timeout, 3 attempts (full transitions 1200 s; 90 samples 900 s; 10 explicit `--at` samples 580 s). v3.3 completed this gate (critic run of 2026-10-17 early). | layout 44 err, contrast 3 warn | — | B errors reviewed: `#reel` hidden digits (designed), `$7.99` at B-local 1.1 (tag entering), TONIGHT/YOU'RE INVITED at 5.23 (card inside the envelope flap), `200,000` at 10.085 (under its strike), box "FISH"/"$7.99" at 19.78-20.32 (boxes landing on top of each other). All transient/designed |
| `sfx_audit.py build/ep003_sfx_cues_AB.json --mix <0-61.77 s of the review> --kind episode` | 14 cues, 12 onsets, 12/min, rest 88 %, I -14.6 LUFS, TP -1.1, LRA 4.2 | | | 0 err, 3 warn: HARSH Money_37 (19.73) and BookFlip2 (43.28); SOUNDALIKE stamp 52.8 / stamp 60.58 |

Whole-span scan 0-66 s: blackdetect (d 0.03, pix 0.08) none; 0.25 s RMS below -40 dBFS only 39.0-40.5 (the "So, why?"
rest, -42 to -52). Cuts found: 9.33, 11.40, 13.07, 25.80, 30.83, 36.57, 40.77, 55.07, 61.77, 65.63.

## Section notes (by eye: full-size frames every 0.5 s 0-66 s; 1/30 s in 10 transition windows)

### 1 Hierarchy — PASS
Frame 0 delivers the click: four friends, HOW TO FISH, the fish (0.00). One focal point per beat: title → boat →
slap (9.33) → $7.99 (11.4) → phone (13.07-25.8) → H8 boat + bubble (25.8-30.8) → fleet + card (30.83-36.5) → reunited
boat (36.57) → wordmark (38.03) → B: tag, strike, envelope, count, reel, spotlight, boat with boxes. The phone's chrome
(timestamps, "Today 11:41 PM") still adds 4 text blocks (CLUTTER warning 13-25.8): accepted as UI.

### 2 Overlaps — FIX
- **Rod across Leo's face**: 7.5-9.3 and 36.6-40.7 (most visible 37.2, 38.5, 40.5) the rod shaft runs diagonally
  over Leo's eye/cheek. The line fix worked; the rod now does what the line did. House rule 2026-10-14: no object
  "cut through by another object". Move the rod grip ~20-30 px toward the stern (or Leo ~20 px toward the bow) so the
  shaft passes beside his head, as it does at 0.00-6.5.
- **Game boxes fall through faces**: 60.53-60.90 each box drops from above frame and passes over Pixie's face
  (60.57), Quest's head (60.70), Max's face (60.83) before landing. 2-3 frames each. Bring them in from below/the sides,
  or drop them behind the heads and pop them forward on landing.
- 19.57-19.67 third "Bought." punch-in covers the fading typing row for 4 frames: designed punch, accepted.
- 61.0-61.77 the boxes rest on the gunwale and hang over the outside of the hull (bottom edges below the rim).
  Acceptable; slightly better if they sit lower in the hull (rim in front of them, the two-pass rule).

### 3 Safe zones and legibility — PASS
THEY HOPED 24 px (22 px after shrink), source line ≈ 22 px, chat names AA. Off-safe warnings are entrances
(titles 1.5-2.1, "To do everything else" 33.97-34.03, $7.99 B-local 1.07). 54.0-55.0 the push brings THEY HOPED to
~48 px from the top edge: still inside.

### 4 Characters — PASS
All acting characters are full figures and inside their hulls in every boat shot (0-9.3, 25.8-40.7, 58.4-61.77),
fleet included. Leo is absent 25.8-36.5 by design and rises into his seat on "Together." (36.57-36.70). Expressions
match: laughing in the title shot, thinking poses in H8, Max's side-eye.

### 5 Art fit — FIX
- **H8 (25.8-30.8) — does it read "someone is missing"?** Yes, but only just. What carries it: the bubble now grows
  out of the stern rim (26.57) right after the chat where Leo said the line, and the push (27.2-30.8) opens a clear
  stretch of empty hull behind Max with Leo's rod lying across it. What is still weak: no bench or seat is visible (the
  side view hides it), so the gap reads as "the end of the boat" until the push; Pixie and Quest look **up** at the
  bubble, not down at the place; Max looks ahead. Not blocking. Cheap free improvement: Leo's yellow beanie on the rim
  next to the rod (it is his silhouette), and turn the Pixie/Quest eyes down-right toward the rim during the push.
- **Slap (9.33-11.4)**: art 02 is on a beach, not in the boat, so the location jumps for 2 s. It is the approved
  art for H3 (PRODUCER_DECISIONS 2026-10-13 / proposal 02 §D) and the gag reads instantly: accepted.
- 30.83-36.5: in H8 Leo's rod lies on the rim; on the wide it stands upright in the stern with the line out. A small
  continuity break nobody will see at that size; note only.
- **Join into C (61.77-66)** — still open from the v3.3 list (item 6):
  - C1 now wears the hook's skin, so it reads as **the same chat** coming back 36 s later: Max repeats "It's eight
    dollars. Just get it." word for word, and **Leo** — the friend who "will get it later" — is now the one asking
    "who's in for the lake?" and "bringing chips!!". Either rewrite C1's lines so it is clearly a later evening of the
    same group (no repeated line; Leo can be the late one again: "ok ok. bought."), or give C1 a different chat.
  - **Avatar letters are wrong**: C1's header shows discs "Q P A B" (and the 65.63 phones' labels "A MAX", "B LEO"):
    the internal keys A/B leak onto screen. Max should be M, Leo L (as in the block C notifications, `nfKid`/`nfCar`).
  - The hook's header uses the friends' face avatars; C1 uses letter discs, and the backdrop changes from the dark room
    to purple confetti. Fine if C1 is a different evening; not "the hook's skin" as claimed.

### 6 Motion — PASS
Camera breathes on every shot, no snap-backs. Bubble grows from its anchor (26.57-26.70). Leo rises into the boat on
"Together." (36.57-36.70). Wordmark fades in place (38.03-38.17). B→C is a clean cut on a held frame (61.75 → 61.78).

### 7 Sound — PASS
Every cue names its on-screen event and lands on it (fish leap 5.04, slap 9.31 on the 9.33 cut, stickers 17.55 /
18.69 / 19.73, drain 23.92, bubble 26.54, card 33.98, tag 41.84/41.86, strike 43.28, reel 52.8, boxes 60.58). The
budget stays at 12/min. Optional: the two HARSH cues (Money_37, BookFlip2) could take a darker take; the 60.58 box land
could use a different family from the 52.8 stamp (SOUNDALIKE). No cue to add.

### 8 Repeated mistakes — checked
| Item (PRODUCER_DECISIONS / playbook / rubric) | Result |
|---|---|
| 2026-10-14 character outside the hull (every boat shot, 0.5 s) | checked: no repeat (main boat, fleet, stage boat) |
| Portrait badge instead of full figure | checked: no repeat (CHAR_BADGE 0 in every sweep) |
| Pasted floating box | checked: no repeat (Leo's bubble now anchored to his place) |
| Short #2 motion-blur / ghost text | checked: no repeat (0 GHOST/MOTION_BLUR in 914 cold-seek samples) |
| 2026-10-14 title over HUD | n/a (no HUD in A/B) |
| **2026-10-15 unmotivated light** | **REPEATS 45.05-45.30**: `#envShine` (blockB `index.html` l.52, tween l.600) slides x -300 → +300 with no clip, so its white diagonal band leaves the envelope and crosses the room/TV shelf (clear at 45.08-45.22). Clip it to the envelope (overflow hidden on `#env` or a clip-path on the shine) |
| Object cut through by another object (2026-10-14) | **repeats**: rod through Leo's face (7.5-9.3, 36.6-40.7) |
| See-through crossfade between character shots | checked: no repeat |
| Snap-back camera / fake walk / half out of frame | checked: no repeat |

## Taste
This is now a good hook. Frame 0 sells the click, the slap is a real slap, the chat is still the best minute of the
episode, and H8 finally has a place for the joke to land. Block B's numbers are clean and it ends on four friends in a
boat holding their copies — the right image for "everyone in the boat buys their own copy". What keeps it from
spectacular is small and fixable: a light streak that looks like a glitch, a rod across a face, boxes that fall through
heads, and a block C that replays the hook's conversation with the wrong letters on the avatars. The single change that
raises it most: make C1 a clearly *later* chat (no repeated line, Leo still the late one, M/L avatars) so the hook's
running joke pays off instead of being contradicted.

## Fix list (builder), in priority order
1. **Gate**: make `hyperframes check` complete on the hook (3 attempts here end in "Target closed", even with 10
   `--at` samples; blockB completes in the same environment). Report its layout/contrast result.
2. **45.05-45.30** (B-local 4.29-4.54): clip `#envShine` to the envelope (unmotivated-light repeat).
3. **7.5-9.3 and 36.6-40.7**: rod shaft off Leo's face (shift grip or Leo ~20-30 px).
4. **61.77-66** (block C opening): avatar letters M/L instead of A/B (header and the 65.63 four-phone labels);
   rewrite C1 so it does not repeat Max's hook line and does not make Leo the organiser.
5. **60.53-60.90**: game boxes must not pass over faces on their way in.
6. Optional, free: H8 beanie on the rim + Pixie/Quest eyes toward the place (27.2-30.8); boxes seated lower in the
   hull 61.0-61.77; darker takes for the two HARSH cues.

After fixes: rerun lint, frame_critic 1/30 s sweeps around 7-9.5, 36-41, 44.9-45.5, 60.4-61.8, C-local 0-5.4,
`hyperframes check` on hook and B, sfx_audit; then back to the critic.
