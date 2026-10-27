# Dave the Diver animatic v1 · independent frame-critic report (2026-10-27)

Piece: `tools/hyperframes_davethediver/renders/DTD_animatic_full_720p.mp4` (1280x720, 361.1 s, blocks A-H).
Critic did not build it; nothing was edited. Timestamps are seconds in the full video (block offsets: A 0, B 40.08,
C 95.14, D 130.52, E 182.17, F 246.66, G 300.06, H 350.74).

## VERDICT: FAIL (one blocking defect in G+H; the rest is FIX-level)

| Block | Verdict | Main reason |
|---|---|---|
| A 0-40 | FIX | shot ends on empty sofa 21.3-21.7; dolphin vertical in net 14.5 |
| B 40-95 | FIX | dolphin cut by frame bottom 60.0-60.5; empty bar without Pixie/customers 62-65; jump cut 56.5/56.6 |
| C 95-131 | FIX | pink dolphin in the bar shot, half out of frame, 129.5-130.5 |
| D 131-182 | PASS (minor) | balloon text overlap 175.0; 0.4 s empty frame 134.9-135.2 is the designed blue-hole dive |
| E 182-247 | FIX | SERVED badge over Quest's head 206.5-212; NIGHT SCORE panel hides Pixie, S stamp crosses the panel 214.7-216 |
| F 247-300 | FIX | 0.3 s empty navy frame 273.2-273.4; "Customers" card clipped 270 |
| G 300-351 | FAIL | stray CSS rendered as text in a 35 px black band on top of every frame |
| H 351-361 | FAIL | same CSS band (H shares G's template) |

## Fix list (by severity)

1. **300.06-361.1 (G and H, every frame) · BLOCKER.** In `src/blockG.template.html` and `src/blockH.template.html`
   lines 85-86 (`#qt {...}` and `#wipe {...}`) sit AFTER `</style>`, so the browser renders them as body text: a black
   ~35 px band at the top with readable CSS ("#qt { position: absolute; left: 0; ... z-index: 60; }"), the whole
   composition pushed down (bottom ~35 px cut), and `#qt`/`#wipe` lose their styles (likely the stray black vertical bar
   at 302.0 is the unstyled wipe). Fix: move both lines inside `<style>`, rebuild + re-render G and H, rejoin, then
   re-sample 300-361 for the wipe and the quote card. Gate gap: frame_critic did not catch it; add a top-band /
   body-text-node check.
2. **129.5-130.5 (C, bar tray-run "why?").** Pink dolphin in the bottom-right corner of the bar shot, half out of frame.
   Breaks "dolphin never in the bar" and "whole body in frame". Fix: remove it from this shot (it already has the bay
   exteriors).
3. **62.0-65.0 (B, bar "SOLD OUT").** 3 s of an empty bar: no Pixie behind the counter, no customers, aquarium hidden
   by the sign. Breaks bar staging. Fix: Pixie behind the counter (bored/arms crossed) + Max on his stool, sign moved
   off the aquarium so the EP003 fish shows.
4. **60.0-60.5 (B, boat, dolphin leap).** Dolphin cut by the bottom frame edge. Fix: raise the leap arc so the whole
   body stays above y 690.
5. **206.5-212.0 (E, tray-run).** The "SERVED 0" HUD box sits on Quest's hat/head (full-size 209.0). Fix: move the
   SERVED/order HUD to the top-right or start Quest's run lower; head must stay clear.
6. **214.7-216.0 (E, NIGHT SCORE).** Panel covers Pixie completely (chef must stay visible) and the "S" rank stamp
   overflows the panel, overlapping "COMBO x9" and the frame border (frame_critic: HUD_OVER_CHARACTER, TEXT_OVERLAP).
   Fix: panel to the left over the empty stools, S inside the RANK slot.
7. **21.3-21.7 (A, living room pan).** Shot ends on the empty sofa with Quest pushed out of the right edge. Fix: end the
   pan with Quest whole in frame, or cut at 21.2.
8. **56.5/56.6 then 56.9-57.1 (B, boat).** Hard jump cut on the same boat background, then a blur whip back to the
   wide opening framing: the camera-continuity rule. Fix: one continuous pull-out from the thought-bubble close-up.
   Also 347.9 -> 348.0 (G, living room): hard cut from the close framing back to the wide A framing. Fix: slow push-out.
9. **175.0 (D, "PROMOTION" balloon).** A white triangle (balloon knot/arrow) sits on the "O" ("PROM^TION"). Fix: move
   the mark off the word.
10. **273.2-273.4 (F).** 0.3 s empty navy frame between the bar and the avatar grid. Fix: start the grid on the cut.
11. **14.5 (A, dolphin in net).** Dolphin turned nose-up, near vertical: not the clear side profile the Producer asked
    for. Fix: keep it horizontal while it struggles (wiggle, not rotate > 20 deg).
12. **343.0-344.0 (G, "Thanks, Quest!").** Bubble tail ends on Max's face and covers it. Fix: bubble higher, tail to
    the edge of his head.
13. **270.0 (F, cards).** "Customers" card 15 % outside title-safe at the right edge. Fix: tighten card spacing.
14. **70.5 (B).** "The shortest supply chain in the world." in quote marks with no attribution, while every other quote
    has one. Fix: add "— the developers" chip (or drop the quote marks).
15. **47.5-50.5 (B).** "Body not typical for a diver / say the developers" renders ~12-17 px (floor 22 px). Fix: scale
    the banner ~1.4x.
16. **0.0-2.5 (A, opening bar).** Left customer cut at the left edge; 3 s static. Fix: shift the plate so the
    customer is whole, add a slow push.

## Producer rules checked
- Dolphin always in water, never in the bar: **repeat at 129.5-130.5** (fix 2); every other appearance is sea/bay.
- Dolphin clear side profile, whole body in frame: repeats at 14.5 (rotation), 60.0-60.5 and 130 (cut).
- Quest readable size: checked, no repeat (smallest is the deliberate 200-800 m depth shots 172-174).
- Bar staging: Pixie behind counter, EP003 fish in aquarium, customers, geta between customers: checked OK at 1, 188,
  191, 241, 273, 313, 343; **repeat at 62-65** (empty bar) and 214.7-216 (Pixie hidden by panel).
- Every text has a source: checked; chips "PER THE GAME", "THE DIRECTOR", "— the director", phone banners and phone
  screens all fine; one unattributed quote at 70.5.
- No clipped text / half-out end framings: G/H CSS band; 21.3-21.7; 270.
- No dead/near-empty/black frames: 273.2-273.4 (fix); 134.9-135.2 accepted as the blue-hole dive.
- No floating pasted boxes: NIGHT SCORE panel is the closest (fix 6); order cards and quote cards are anchored chips.
- No camera snap-back on same background: 56.6/57.0 and 348.0 (fix 8); 41-47 boat moves are continuous (checked at 10 fps).
- Hook: "So, why?" 37.86-38.63, wordmark from 37.0, gold bar ~38.0, held to 40.08 (1.45 s after the line): OK.
- Companion and wordmark: hook, dolphin dives through the "o" with heart bubbles (38.5-40); end, dolphin swims under
  the wordmark (351-352) and through the "o" (357.5): OK.
- No planning tags: no tags, but the CSS leak in G/H is worse (fix 1).
- Sound restrained, no identical repeats: 68 cues, 11/min, 85 % rest; stamp.wav used 4x (29.88, 77.32, 78.82, 80.12:
  the B triple stamp is a designed escalation, A16 should use a different file), drain.wav 2x (26.3, 273.42): swap one.

## Rubric
```
1 Hierarchy ........ PASS  - one focal per beat; HUD clutter (7-8 blocks) is the game HUD by design
2 Overlaps ......... FIX   - 206.5-212 SERVED on Quest's head; 214.7-216 panel over Pixie + S over x9; 175 balloon; 343 bubble on face
3 Safe/legibility .. FAIL  - 300-361 CSS text band + content pushed 35 px down; 47.5 small banner; 270 card clipped
4 Characters ....... FIX   - 62-65 bar without Pixie/customers; 21.3-21.7 Quest leaves frame; 0-2.5 customer cut
5 Art fit .......... PASS  - consistent house style; flat-vector inserts are clearly montage beats
6 Motion ........... FIX   - 56.6/57.0 and 348.0 snap-backs; 273.2 dead frame
7 Sound ............ PASS  - 0 err / 0 warn; swap the A16 stamp and one drain.wav
8 Repeats .......... FIX   - dolphin in bar (130), dolphin cut (60, 130), dolphin rotation (14.5), empty bar (62-65), snap-back (57, 348)
Automated: lint 0 err (A-H; 1-5 warnings each); frame_critic A 11 / B 10 / C 13 / D 64 err are all the HUD's own
"O2" label over its dial (false positives, checked at full size); real ones: E 3 (HUD_OVER_CHARACTER x2, TEXT_OVERLAP),
D "99+" ghost and F "16" ghost are legit duplicates (badges, Sep 16/Nov 16), E "followed you" is list rows; G/H
RUNTIME = WebGL context in the sampler (environment). sfx_audit 0 err / 0 warn (-14.3 LUFS, -2.2 dBTP).
hyperframes check: skipped (time budget).
Top fix: move the two CSS lines into <style> in blocks G and H and re-render.
```

## Taste
Blocks A-F already read like a real channel episode: the bar plate, the pixel Quest and the HUD sell the game, and the
hook lands cleanly on the wordmark. What drags it below "spectacular" is not style but discipline: one broken minute at
the end (G/H) and a handful of rule breaks the Producer has already rejected (dolphin near the bar, empty bar, snap-backs).
Fix 1 alone moves this from FAIL to FIX; fixes 2-8 make it sendable.

Evidence (scratch): `/tmp/claude-0/-home-user-chatgpt-skills/475a8b3c-96eb-5a30-96f5-75522eb03dfc/scratchpad/critic/`
(sheet_*.jpg contact sheets, zg_*.jpg full-size grids, tops.png CSS band, strips.jpg 10 fps cut checks, fc_*/critic.md).
