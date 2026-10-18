# EP003 Short #1 "The friend who never buys it" · independent design critic · v1 (2026-10-18)

Reviewer: frame-critic (independent; did not build). Artefact: `tools/hyperframes_ep003_short1/renders/EP003_short1_v1_preview720.mp4`
(720x1280, 30 fps, 612 frames, 20.4 s). Reference: `STORYBOARD_v1.md`, `CLAUDE.md`, `docs/style/DESIGN_RUBRIC.md`,
`docs/ep003/PRODUCER_DECISIONS.md`, `docs/PRODUCTION_PLAYBOOK.md` §3.

Method: frames every 0.5 s (41) at full 720p in 4-up sheets; 1/30 s strips over each cut (2.3–2.9, 8.5–9.1, 11.2–12.2,
15.3–16.3) and the loop seam (19.4–20.4); word-highlight strip of the banner 0–2.6 s at 10 fps; full-res crops for scale
and the seam. Builder gates read (not re-run except sfx_audit on the cue list + mix extracted from the MP4).

## VERDICT: FIX (2 concrete defects, both in beat 5; everything else passes)

```
1 Hierarchy ........ PASS  - one focal per beat (hook+Leo / newest chat row / Leo sweat face / the group / TAG YOUR LEO)
2 Overlaps ......... PASS  - no text over faces/text, no ghost/echo or blurred text; every text has a source
3 Safe/legibility .. PASS  - all meaning-carrying text >= 42 px and inside y 9-80 %; small phone chrome is decoration by design
4 Characters ....... FIX   - 11.27-12.3 s Quest cut by the left frame edge, Pixie out of frame; fish scale x3 off in the wide
5 Art fit .......... PASS  - dusk lake, EP003 boat, chat UI = the beat; one style per frame
6 Motion ........... PASS  - cuts clean, masked type reveals, no shot > 4 s without a change
7 Sound ............ PASS  - 6 cues, 18/min, 91 % rest, -14.3 LUFS / -4.6 dBTP; every cue motivated
8 Repeats .......... checked: no repeat, except "person half out of frame" (playbook §3) at 11.27-12.3 s
Automated: lint 0 err (9 warn), frame_critic 0 err / 9 warn (sweep) + 0 err in all 1/30 s windows,
           sfx_audit 0 err / 0 warn, hyperframes check not re-run (per instructions)
Top fix: start the beat-5 wide with all four friends inside the frame and scale the fish down to its beat-1 size.
```

## Fix list (concrete, verifiable)

1. **11.27–12.3 s · person half out of frame (Rubric §4, PLAYBOOK §3 "a person half out of frame").** The cut into the
   wide opens framed on the bow-right: Quest is sliced by the left frame edge (half his body) and Pixie is entirely off
   frame; the move then pans/pulls left and Pixie slides in through the edge (fully in only at ~12.4 s). Storyboard
   beat 5 calls for "the whole group in the rowboat". Fix: start the pull-back from a framing where all four (and the
   bow) are already inside the frame, e.g. the 12.5 s framing pushed in ~10 %, then breathe outward. Verify: every frame
   11.27–12.5 s shows Pixie's and Quest's full upper bodies inside x 0–100 %.
   Evidence: scratch `cut115.jpg` (1/30 s strip), sheet_06 (11.5 s), sheet_07 (12.0 s).
2. **11.27–15.77 s · fish scale inconsistent across shots (CLAUDE.md "Every element sits right": consistent scale).**
   Fish width vs Leo's beanie width: ~0.65x in the close-ups (0–2.6, 8.9–11.3, 19.4–20.4 s), ~1.8x in the wide
   (fish perched on the stern post is bigger than Leo's head and torso). Fix: scale the wide's fish by ~0.35–0.4 so the
   ratio matches the close-up (it can stay perched on the stern post; that placement is fine). Verify: crop at 13.0 s,
   fish width <= ~0.7x Leo's beanie width.
   Evidence: scratch `scale_cmp.png` (left: 0.3 s close-up; right: 13.0 s wide, same pixel scale), `fish13.png`.

## Optional polish (not blockers)

- 11.3–15.8 s: the wide is small (faces ~11 % of frame height; CHAR_SMALL warn at 22–25 % of the asset box). The
  storyboard declares it a wide, so it passes, but Quest is laughing/pointing (acting); a ~1.3x push-in would sell
  the joke and fill the empty lower water. Could be solved together with fix 1.
- 4.17–4.30 s: Quest's "11:43 PM ✓✓" timestamp fades in under Pixie's sticker ~0.15 s before Quest's sticker lands
  (row-insert transient). Barely visible at speed. Also only Quest's sticker carries a timestamp; Pixie's/Max's don't.
- 9.0–15.6 s: burned-in captions sit at y ≈ 230 px of 1280 (~18 %), not the storyboard strip at y 1180–1320/1920
  (61–69 %). They are clear of faces and inside the safe area, so it is fine; just note the storyboard deviation, or
  update the storyboard.
- 17.0 s: the fish lands on top of the "Qu" letters, not on the wordmark's gold bar as boarded. Reads fine.
- Loop audio: on replay the buzz (19.40) is followed 0.63 s later by the frame-0 ping (0.03) while the banner is already
  on screen, i.e. two notification sounds for one banner. Consider dropping the buzz and letting the ping carry the seam,
  or ducking the ping; check by ear on a 2x looped play.
- Beat 1 storyboard says "Leo blinks on 'Just get it.'": no blink seen between 1.8–2.6 s at 1/30 s (he blinks at the
  9.0 s beat). Minor.

## Section notes

**1 Hierarchy.** Frame 0: notification banner (top, 9–13 %), hook "EVERY GROUP HAS THIS FRIEND" (big, yellow), Leo's
side-eye face below; no overlap, two text blocks. Chat 2.6–8.9 s: the phone occupies y 5–78 % (bottom left clear for the
Shorts UI); focal is always the newest row (sticker pop / typing). CLUTTER warning (4 text blocks) is the phone chrome
("11:42", member list, "Message"), decoration by design. End card: TAG YOUR LEO > wordmark > FULL EPISODE ↓, clean.

**2 Overlaps / §4b sources.** Banner = phone notification from the top (source ok, and it is the caption: words light
up in sync, verified at 10 fps: It's 0.7, eight 0.9, dollars 1.1, Just 1.8, get 2.0, it 2.3). Chat text is inside the
phone; "Bought." stickers are chat rows with avatar + name, no loose chips. Leo's "I'll get it later." types word by word
from 7.5 s ("I'll" voiced at 7.62 s), complete by 8.0 s. Burned captions only for "He will not get it later." and h08,
word-lit, over sky, not on faces. No ghost/echo, no motion-blurred text; the cross-dissolve into the chat is one frame
(2.633 s).

**3 Safe/legibility.** "Max · The boat" renders at the 42 px floor (warning is a rounding edge); "FULL EPISODE ↓" 44 px.
SAFE_ZONE warns are "11:42" during the phone slide and the banner while it drops in (19.6 s), both transient chrome.

**4 Characters.** Leo + fish in the boat in all close-ups (fish on the gunwale, oar in hand). In the wide all four are
inside the hull, seated (no repeat of the 2026-10-14 "fuera del bote" defect); defects only as fixes 1–2.

**5 Art fit.** Same dusk lake plate and EP003 boat/characters as the episode; chat UI matches EP003 ChatPhone. Leo's
sweat face for "He will not get it later." fits the line.

**6 Motion.** Cuts at 2.63, 8.87, 11.27, 15.77, 19.40. Masked type reveal for TAG YOUR LEO; wordmark fades, fish drop
at 17.0. Longest unchanged hold: end card 17.5–19.4 s (1.9 s) with FULL EPISODE bob. Chat camera kicks on each sticker.

**7 Sound.** Cues 0.03 ping (banner), 3.24 pop / 4.38 bubble / 5.42 drop (three stickers, three families), 17.00 slime
(fish lands), 19.40 buzzer (loop banner). Fewer than boarded (no key ticks, gull, whoosh): good restraint.

**Loop seam (19.4–20.4 → 0.0): PASS.** 19.40 smash cut to Leo's close-up, banner drops 19.55–19.75, hook slams in at
19.87 and holds. Last frame vs frame 0: best alignment offset (0, 0) px, mean abs diff 1.7/255 (film grain + encode),
same Leo pose, fish pose, banner, hook. Evidence: `seam.jpg`, `cmp.png` (face crop frame 0 | frame 611).

**8 Repeats.** Floating chat card in a scene: no repeat. Loose "Bought." chips: no repeat. Character outside the hull:
no repeat. Ghost/echo/motion-blur title (EP002 Short #2): no repeat. Title over HUD (2026-10-14): no HUD; no repeat.
Unmotivated light bars/streaks: none. Snap-back camera / walk without background motion: none. Person half out of
frame: **repeat at 11.27–12.3 s** (fix 1).

**Taste.** Strong, readable, on-brand Short: frame 0 stops the scroll, the chat beat is the clearest "every text has a
source" execution so far, and the seam is genuinely seamless. The weakest stretch is the wide (11.3–15.8 s): small,
static, starting off-frame, with an oversized fish. Fixing its framing and scale (and pushing in a touch) is the single
change that would raise it most.

Evidence (scratchpad, not in repo): `/tmp/claude-0/-home-user-chatgpt-skills/14b914a9-8dc9-599e-8a45-e7f574c02142/scratchpad/c1/`
(`s/sheet_01..11.jpg` 0.5 s sheets, `seam.jpg`, `cut115.jpg`, `cut156.jpg`, `cut25.jpg`, `cut86.jpg`, `banner.jpg`,
`scale_cmp.png`, `fish13.png`, `cmp.png`, `ts2.jpg`).
