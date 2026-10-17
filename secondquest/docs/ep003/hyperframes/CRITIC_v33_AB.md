# EP003 v3.3 · Independent critic · hook (block A) + block B (+ joins into C)

Critic: frame-critic skill (independent; did not build the piece; nothing in the piece was edited).
Date 2026-10-17. Material: `EP003_full_hyperframes_review.mp4` (720p, 328.4 s), projects
`tools/hyperframes_ep003/hook` (0–40.76 s) and `tools/hyperframes_ep003/blockB` (40.76–61.76 s, local t = episode t − 40.76).
Approved plan judged against: `docs/ep003/SCRIPT_CHANGE_PROPOSAL_02_HOOK.md` §D. Timestamps below are **episode time**
unless marked "B-local".

```
VERDICT: FAIL
1 Hierarchy ........ FIX   - 51.13-51.60: reel holds "00,000,000" (reads as zero) before rolling; 55.00-57.45: empty spotlight 2.4 s, no focal point
2 Overlaps ......... FIX   - every main-boat shot (7.5-11.3, 26.0-37.6): fishing-line loops cross Pixie's eye and Quest's mouth; 26.8-30.8 Leo bubble pasted in the sky; 30.83-30.97 bubble fades across the cut onto the wide shot
3 Safe/legibility .. FIX   - 46.2-55.0 "THEY HOPED" 14 px and 52-55 source line ~13 px (floor 22 px); chat name "Leo" 2.28:1 contrast
4 Characters ....... FAIL  - 57.43-61.30 the four friends are round portrait badges hovering over the hull (CHAR_BADGE error); 32-36.5 fleet "heads" float above the hulls
5 Art fit .......... FIX   - 10.2-11.3 nobody slaps (head-bump lean, no hand); 26-30.8 the empty seat does not read; 61.77-63.8 block C reopens the same chat in another UI skin, with Leo now organising
6 Motion ........... FIX   - 61.60-61.77 the box-to-phone match cut does not land (box goes edge-on at centre, hard cut to a phone top-centre)
7 Sound ............ PASS  - 12 onsets/min (at the ceiling), rest 88 %, -14.5 LUFS / -1.2 dBTP; cut the 39.16 crack (it sits in the "So, why?" silence)
8 Repeats .......... checked: hull rule (main boat ok, fleet repeats it), portrait badge (repeats), motion-blur/ghost text (no repeat), title over HUD (no HUD, no repeat), unmotivated light (no repeat), pasted box (Leo bubble repeats)
Automated: lint 0 err (hook 10 warn, B 4 warn); frame_critic 0.25 s hook 0/43, B 0/13; 1/30 s sweeps hook 0/24, B 1 err (CHAR_BADGE) /15; sfx_audit 0 err/0 warn; check hook layout 9 err + contrast 1 err, B layout 12 err
Top fix: put the four friends in the block B stage boat as full seated figures (the same in-boat layers the hook uses) and rebuild H8 so the empty seat is a visible, lit, empty bench that the others glance at while Leo's bubble lands on it.
Evidence: scratchpad critic_ep003/ (ev_*.jpg, sheet_00..10.jpg, s30_*.jpg, hook025|b025|hook30|b30/critic.md)
```

## Automated gates (rerun by the critic)

| Gate | Hook (A) | Block B | Notes |
|---|---|---|---|
| `hyperframes lint --json` | 0 err, 10 warn | 0 err, 4 warn | warnings: file size / sub-composition structure, one overlapping tween on `dwell/hold` at 33.78 (hook) and `#flipper` at B-local 4.31 |
| `frame_critic.py --step 0.25 --lint` | 0 err, 43 warn | 0 err, 13 warn | warnings are mostly the chat's UI chrome (TINY_TEXT, CLUTTER 13.25-25.75) and entrances crossing title-safe |
| `frame_critic.py` 1/30 s sweep, ±0.5 s around every cut/title/bubble (360 + 341 samples, cold seeks) | 0 err, 24 warn | **1 err**, 15 warn | **CHAR_BADGE B-local 16.67-16.73 (ep 57.43-57.49): `quest_wave.png` inside a round badge.** The 0.25 s sweep stepped over it. By eye the badge problem lasts the whole stage shot (57.43-61.30); the detector only fires during the scale-in |
| `hyperframes check --json --at-transitions` (120 transition samples each) | layout 9 err, contrast 1 err | layout 12 err | hook: `text_occluded` = chat rows sliding under header/input (UI behaviour, accepted) except 21.43-22.27 (real, see §2); contrast error = "Message" placeholder 2.43:1 (decoration: mark it ignored or darken). B: `text_occluded` = box labels behind the gunwale on landing and the reel's hidden digits (designed) |
| `sfx_audit.py build/ep003_sfx_cues_AB.json --mix <0-61.8 s of the review> --kind episode` | 16 cues, 12 onsets, **12/min**, rest 88 %, I -14.5 LUFS, TP -1.2, LRA 4.4 | | 0 err, 0 warn. At the budget ceiling: no room to add anything |

Whole-file scan (blackdetect d=0.03 pix_th=0.08, silencedetect -45 dB/0.8 s, per-frame luma):
- Joins A→B (40.76) and B→C (61.76): no black frames, no audio gap, no flicker.
- Silences: only 105.15-106.02 and 238.42-239.29 (0.87 s each, narration pauses inside D and E, not at joins).
- Near-black 292.73-293.90: end of block F fading into G's night lake (designed).
- One-frame luma dip at **272.233** (inside block F, Y 75→34→80): a single dark frame at a cut. Blocks C-G are out of
  scope and content-unchanged; flag to the builder to confirm it is not a render glitch.
- 116.167 one-frame flash: the photo-flash cut in block D (designed).

## Section notes (by eye, full-size frames every 0.5 s 0-66 s, 1/30 s inside 19 transition windows)

### 1 Hierarchy — FIX
- Hook beats mostly have one focal point: title (1.5-6.3), boat (6.5-11.3), $7.99 tag (11.5-12.8), phone (13-25.8),
  boat + bubble (26-30.8), wide + card (31-37), wordmark (38-40.7). Good.
- 51.13-51.60: the reel lands as "00,000,000" and holds ~0.5 s before rolling; the viewer reads "zero" while Bram says
  "one analytics firm estimated". Start the reel already rolling, or show the leading 1 from the first frame.
- 55.00-57.45: an empty spotlight sweeping on a dark stage for 2.4 s under "Because this is not really a game you play
  alone." If "empty = alone" is the idea, put a lone figure (Quest, full figure) in the light; an empty cone reads as dead air.
- 13.07-25.77: 5 text blocks (chat chrome). Accepted as UI, but the timestamps/"Today 11:41 PM"/"Message" could be
  dimmed further or dropped to keep the bubbles the only text.

### 2 Overlaps — FIX
- **Fishing line over faces** in every main-boat shot (7.5-11.3, 26.0-30.8, 31-37.6): the white line loops pass through
  Pixie's eye and Quest's mouth (see `ev_slap_10.0.jpg`, `ev_H8_emptyseat_28.0.jpg`). Route the loops behind the
  heads or below the shoulders.
- **26.80-30.80 Leo's bubble is a pasted box**: it drops in from the top edge of frame, hangs in the sky, its tail points at
  the water right of the rod; it belongs to no seat and no one. (rubric §2 "enters from where it lives").
- **30.83-30.97** the bubble is still fading when the shot cuts to the wide where Leo is back in the boat: Leo's "I'll get
  it later" ghosts over Leo himself. End the fade before the cut.
- 19.40-19.60 Max's third "Bought." punches in semi-transparent over his avatar and name label (`ev_bought_19.5.jpg`).
- 21.43-22.27 "Leo is typing…" slides under Max's "Bought." while a second Leo row ("I'll" bubble) is already appearing
  under the typing dots: two Leo rows and a hidden label for ~0.8 s (`ev_typing_22.0.jpg`; `hyperframes check` text_occluded 21.43).
- 38.03-38.13 the wordmark is reeled up through the boat and the faces (4 frames). Start it above the horizon.
- 45.07-45.27 the envelope covers Quest's phone hand.
- 61.20-61.60 the four badges cross-fade see-through behind the growing box (see-through people).
- Ghost / motion-blurred text: **none found** (title words enter as single copies 1.47-2.37; every card lands sharp).

### 3 Safe zones and legibility — FIX
- B 46.2-55.0 (B-local 5.75-14.0): "THEY HOPED" label renders 14 px; 52-55 "estimate · Alinea Analytics · early
  October" ~13 px. Both carry meaning (who hoped / source of the 10 M claim): ≥ 22 px or cut.
- Chat: "Leo" name label 2.28:1, "Max" 4.15:1, "Pixie" 4.04:1 on the cream: the speaker names must pass AA (darken the
  hues on cream). "Message" placeholder 2.43:1 is the only contrast *error* in `check`: decoration, mark it ignored.
- Off-safe warnings at 1.47-2.13 (title words flying in), 33.97-34.03 ("To do everything else" slamming in), B-local
  1.07 ($7.99 entering) are entrances, accepted.

### 4 Characters — FAIL
- **57.43-61.30 portrait badges**: Quest, then Pixie, Max, Leo appear as round discs, and the discs "sit" above the hull
  with game boxes in front of them. This is exactly the rubric's "never as a portrait badge / face in a circle", and the
  only automated error left (CHAR_BADGE, `ev_charbadge_B16.70.jpg`). The line is "Everyone in the boat buys their own
  copy": everyone must be *in the boat*, seated, full figure / waist-up (the hook already has these layers:
  `max_sit_*`, `leo_sit_*`, Quest/Pixie in-boat cut-outs).
- **32.0-36.5 fleet**: the grey "heads" of the far boats float a head-height above the gunwales and several boats are
  tilted/airborne over the water (`ev_fleet_34.0_crop.jpg`). Same class of defect as the 2026-10-14 "fuera del bote"
  rejection: crews must sit inside their hulls; chaos can be splashes/rocking, not hovering.
- Main boat (6.5-11.3, 26.0-40.7): all present characters inside the hull, consistent scale across the slap, H8, wide
  and wordmark shots — **checked, no repeat** of 2026-10-14.
- 6.50: Quest is in the boat alone for one 0.5 s sample before the others appear at 7.0 (pop-in); check it is a designed reveal.
- Expressions in H8 (26-30.8) are the slap shot's: Quest laughing and pointing, Pixie laughing. They do not match
  "harder than anything in the game".

### 5 Art fit — FIX
- **H3 slap (10.2-11.3)**: the approved plan says "CROP/PUSH approved art 02 slap revive". The build uses a 3D lean: Max
  tilts into Leo, no hand, no contact point; the SLAP! burst sits in the sky. It reads as a head-bump. Either use art 02
  as approved or give Max a visible open-hand swing that lands on Leo's cheek under the burst.
- **H8 empty seat (25.9-30.6)** — the beat does **not** read as "someone is missing": Leo's place at the stern is
  covered by the rod; no bench is visible; the bubble lands in the sky, not on the seat; nobody looks at the gap. Fix: a
  clear empty bench (camera push or reframe so the stern bench is in the light), Leo's yellow beanie or rod left on it,
  Max/Pixie glancing at it, the bubble's tail planted on the bench, and Leo only rejoining after "And yet,".
- $7.99 tag over the blurred slap shot (11.5-12.8), chat with Max/Leo avatars and yellow "Bought." stickers
  (13-25.8), "millions" fleet + "Together" (31-37), wordmark + unimpressed fish + quiet tail (38-40.7): match the plan.
- Block B: tag swing + strike on "not really a price" (41.8-43.5), envelope "YOU'RE INVITED" with 4 seats (45-46),
  200,000 count over the defocused room (46.2-50.9), strike + 10,000,000+ (50.9-55): good, line-accurate.
- **Join into C (61.77-63.8)**: block C opens on a *second* group chat ("THE BOAT · 4 members online", red Quest
  bubbles, flat "Bought." tags, Leo: "who's in for the lake?", Max: "It's eight dollars. Just get it.") while Bram says
  "Now compare that with the other way adults try to see their friends." Since v3.3 moved this chat into the hook, the
  same conversation now appears twice, 45 s apart, in two different UI skins, and Leo — the friend who "will not get it
  later" — is now the organiser. Block C's content is out of this revision's scope, but the join is not: either restyle C's
  phone to the hook's skin and drop the duplicated lines, or open C on the game box/boat instead.

### 6 Motion — FIX
- Camera breathes on every shot (slow 2-3 % pushes, no snap-backs seen). Title entrance and card slams ease in/out properly.
- **61.60-61.77 the planned "game box flies into block C's phone" does not happen**: the box turns edge-on at frame
  centre (61.73 is a near-empty dark frame with a sliver), then a hard cut to a phone at top-centre, smaller, on a
  different background. Either match position/scale (box face → phone screen in the same rectangle) or cut on the box at full face.
- 51.13-52.30 reel: static zeros, then a roll with half-clipped digits; fine as a roll, but too long static (see §1).
- 26.80 the bubble enters from the top frame edge (no relation to the seat) — make it rise from the seat or pop on it.

### 7 Sound — PASS (with cuts)
Every cue names its on-screen event and lands on it (slap 9.84 with flash/shake, stickers 17.55/19.73, drain 23.92,
bubble 27.52, card 33.98, tag 41.84/41.86, strike 43.28, stamp 52.80, boxes 60.58). Levels -14 to -30 dB under the voice.
- Cut **39.16 crack** (-30): it stacks 10 ms after the 39.15 splash and both sit inside the locked "So, why?" silence.
  Voice ends 38.90; the mix is at ≈ -26/-27 dBFS RMS 39.3-39.5 and only truly quiet 39.5-40.8 (1.3 s). One soft cue or none.
- Consider cutting **34.00 explosion** (-28) under the 33.98 card hit: two onsets 20 ms apart for one event.
- Budget is exactly 12/min; any cue added in fixes must replace one.

### 8 Repeated mistakes — checked
| Item (PRODUCER_DECISIONS / playbook / rubric) | Result |
|---|---|
| 2026-10-14 character outside the hull | main boat: no repeat; **fleet 32-36.5: repeats (heads above hulls)** |
| Portrait badge instead of full figure | **repeats 57.43-61.30** |
| Short #2: motion-blur / ghost copies of the title | no repeat (1/30 s sweep 1.4-2.6, 5.8-6.7, 33.6-34.4, 37.5-39.0) |
| 2026-10-14: title over HUD for 4 frames | no HUD in A/B; no title overlap found at 1/30 s |
| 2026-10-15: unmotivated light bars/streaks | no repeat; spotlight cones 55-61 have an implied stage light; phone glow has its phone |
| Pasted boxes | **repeats: Leo bubble 26.8-30.8** |
| Snap-back camera / walk without background move / half out of frame | no repeat |
| See-through crossfade between character shots | **61.20-61.60 badges see-through under the box** |
| Camera breathing 2-3 % | ok |

## Taste
The hook is much stronger than v3.2: the human problem lands at 13-25 s, the chat beat is crisp and funny ("I'll get it
later" + drain is the best moment), the sound is restrained, and the wordmark tail gives "So, why?" room. It is not yet
spectacular because the two beats the new script was written for are the weakest frames: the slap does not show a slap,
and the empty seat — the emotional turn of the hook — is a speech bubble floating in the sky over a boat whose stern is
hidden by a rod. Block B's numbers are clear, but it ends on four face-in-a-circle stickers, the house style's most
explicit "never". The single change that raises it most: rebuild H8 as a staged shot of a visibly empty, lit bench that
the friends glance at, with Leo's bubble planted on it, then use the same seated in-boat figures (not badges) for
"Everyone in the boat buys their own copy".

## Fix list (builder), in priority order
1. 57.43-61.30 (B-local 16.6-20.5): replace badges with full seated figures in the hull; boxes land in their hands/laps. Removes the CHAR_BADGE error and the 61.2-61.6 see-through crossfade.
2. 25.9-30.6: H8 empty seat staged and readable (bench visible, prop left on it, glances, bubble tail on the bench, bubble rises from the seat, fade ends before 30.83).
3. 32.0-36.5: fleet crews inside their hulls; no airborne boats.
4. 10.2-11.3: a real slap (art 02 per the approved plan, or a visible hand to cheek under the burst).
5. 7.5-37.6: re-route the fishing-line loops off the faces.
6. 61.60-61.77: make the box→phone match cut a true match (same rectangle), and reconcile block C's opening chat with the hook's chat (skin + duplicated lines + Leo's role).
7. 46.2-55.0: "THEY HOPED" and the source line ≥ 22 px; chat speaker names to AA contrast; 51.13 reel starts rolling (no "00,000,000" hold); 55.0-57.45 put a figure in the empty spotlight.
8. Small: 19.4-19.6 opaque punch-in; 21.43-22.27 typing row vs. "I'll" row overlap; 38.03-38.13 wordmark through the faces; 45.07-45.27 envelope over the hand; cut the 39.16 crack (and maybe 34.00 boom).
9. Out of scope, verify: one dark frame at 272.233 (block F).

After fixes: rerun lint, frame_critic 0.25 s + 1/30 s sweeps around 10-11.3, 25.5-31, 32-37, 57-62, sfx_audit, then back to the critic.
