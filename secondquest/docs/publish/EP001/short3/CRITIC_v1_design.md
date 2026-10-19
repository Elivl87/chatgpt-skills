# EP001 Short #3 "The work loop": independent design critic, v1 (2026-10-19)

Critic: frame-critic skill (did not build this). Material: `tools/hyperframes_ep001_short3/renders/EP001_short3_v1_preview720.mp4`
(720x1280, 678 frames = 22.60 s video, 22.65 s audio), the project `short/index.html` (source read for cue/caption
times only), storyboard `SHORT3_STORYBOARD_v2.md`, builder gates `build/critic/ep001_short3_gates/` (not re-run, as asked).
Frames: every 0.5 s (2 contact sheets), every frame 1/30 s around all 10 cuts, the snap zooms (3.1, 4.25, 18.13),
the slam (6.3–6.5), the bolt (10.67–10.87), the pull-out dissolve (13.2–14.1) and the seam (21.6–22.57); key frames at
full 720 size. Evidence: `/tmp/claude-0/-home-user-chatgpt-skills/14b914a9-8dc9-599e-8a45-e7f574c02142/scratchpad/c3/`
(sheet1/2.jpg, strip0/1/2.jpg, p_dealer.png, p_wake.png, bolt.png, seam_pair.png).

## VERDICT: FIX

```
1 Hierarchy ........ PASS  - one focal per beat; end card has 4 text blocks 20.75–21.65 (title stack + wordmark + CTA), hierarchy still reads (warning only)
2 Overlaps ......... FIX   - 10.73–10.90: lightning bolt touches the caption "greatest" (right edge), see fix 4
3 Safe/legibility .. PASS  - captions y 250 px (13 %) and 1390 px (bottom ~77 %), x within 6–85 %; CTA 44 px >= 42 px floor
3b Text source ..... PASS  - only narrator captions + narrator titles; no bubbles, no chat cards
4 Characters ....... FIX   - 6.10–8.70: the huge tractor is parked ON the fence top rail (fix 1); 2.82–3.74: two beds (fix 3)
5 Art fit .......... PASS  - every beat matches its line; seated-Quest composite reads as seated (seat, wheel, pedals)
6 Motion ........... PASS  - snaps clean, no blur on text, freeze + desat 16.67, 1.3 s silent hold verified (-44 dB)
7 Sound ............ PASS  - 5 onsets, 12/min, 65 % rest, -14.2 LUFS, TP -4.6 dBFS; 3 HARSH warnings (polish)
8 Repeats .......... checked (list below); one caption defect at 2.82–3.74 (fix 2)
Automated (builder's run, read not re-run): lint 0 err/13 warn, frame_critic 0 err/6 warn (sweep) + 0 err in all 11 1/30 s windows, sfx_audit 0 err/3 warn (my re-run on the cue list agrees)
Top fix: put the dealership tractor on the ground (fix 1) - it is the comedy slam and right now it lands on a fence rail.
```

## Fix list (blocking; each one checkable)

1. **6.10–8.70 s, dealership: the tractor sits on the fence.** `#trHuge` (top 760, h 570 → base y≈1330) and its
   shadow `#trSh` (top 1290) put the tyres exactly on the fence's top rail; nothing under the wheels is ground.
   Obvious at 6.43 (wide, after the slam) and at 7.07/8.23 (snap), where the tyres hang above the post.
   Fix: land the tractor on ground, either in front of the fence on the gravel (tyre bottoms ≥ y≈1700 at 1080 wide,
   shadow under them, wallet moved so it is not covered) or behind the fence in the lot (base ≈ y 1000–1050, scaled
   ~0.7, fence rails in front visually reading as foreground). Re-aim the 7.0 snap so the wallet's face stays the
   focal. Check: frames 6.43, 7.07, 8.23 – tyre bottoms and shadow touch gravel/lot, not a rail.
2. **2.82–3.74 s: no caption while "wake up..." is said.** Caption group 3 is `a 2.67, e 2.819` (it shows "you wake
   up..." on frame 0 for 0.15 s *before* the words), then the bed shot plays "wake" 2.87–3.09 and "up..." 3.09–3.49 with
   no caption at all. Fix: from the cut (2.82) show "wake up..." at the top strip (top 250), word-highlighted, until
   ≈3.70 (keep "you" alone at 1390 for 2.67–2.82, or let the group run through 3.70 and jump to top 250 at the cut).
   Check: frames 2.90, 3.20, 3.45 carry the caption with "wake" / "up..." highlighted; frame 2.80 does not yet
   highlight "wake".
3. **2.82–3.74 s, bed: two beds.** The `q_bed.png` cut-out (its own bed) is laid directly over `bedroom.jpg`'s own
   blurred bed and pillows; at 2.87 (before the snap) it reads as a small bed parked in front of a big bed, and the
   cut-out's legs end in the air over that bed. Fix (art untouched): reframe/scale the plate so its bed is out of frame
   or hidden (e.g. the dresser/lamp side only), and give the cut-out's legs a floor shadow. Check: frame 2.87 and 3.20
   show one bed, legs on the floor.
4. **10.73–10.90 s: bolt kisses the caption.** The bolt's top segment passes within a few px of "greatest" (caption
   right edge, y≈250–330) and ends in mid-air between Quest's hair and his fist. Fix: shift the bolt ≥ 30 px clear of
   the caption box and end it on the raised fist (the comedy target the pose sets up). Check: frame 10.73 at full size,
   bolt clear of caption, tip on the fist.

## Optional polish (not blocking)

- P1 Captions enter 1 frame before three hard cuts (3.733, 6.067, 17.333: the new line sits over the old shot for one
  frame). Start those groups on the cut frame.
- P2 End card 20.2–21.65: the wallet on the wordmark is ~5 % of frame height, the companion payoff is hard to see on a
  phone; ~10–12 % would read. (Companion interacts with the wordmark: yes.)
- P3 sfx_audit HARSH on alarm (2.85, 22.10) and scratch (16.66): add a low body layer (thump under the alarm bell,
  a vinyl drag under the scratch).
- P4 Bolt style: a flat cream stroke on a painted plate; a soft glow/bloom would sit it in the storm.
- P5 Master: video 22.60 s (678 f) vs audio 22.65 s; trim audio to the last video frame so the loop length is exact
  (tail is -49 dB, no click today).
- P6 End card shows 4 text blocks 20.75–21.65 (frame_critic CLUTTER warning); acceptable as title + wordmark + CTA.

## What I verified as correct

- **Frame 0 / loop:** frame 0 = big hook "A GAME ABOUT GOING TO WORK?" before any voice (voice at 0.55). Last frame
  (22.567) vs frame 0: mean abs difference 2.45/255 (grain/breath only), visually identical; audio both ends at
  -45/-49 dB, the seam alarm (offset 1.1 s into the take, not the same slice as 2.85) leads into "…where you wake up".
- **Frame-0 TEXT_OVER_CHARACTER warnings (0–2.75, 21.9–22.6):** rejected on the face: "WORK?" ends above the hair, face clear.
- **CHAR_SMALL warnings:** 11.6–15.95 the "dot" on the field is the designed joke (storyboard 7); 6.1–6.9 the wallet is
  small in the wide but the slam is the focal and the snap at 7.0 makes it big.
- **Seated Quest on tractor (11.6–17.3):** on the seat, hands on the wheel, boots on the footplate; costume identity
  kept (hoodie + overalls, same as the hero shot).
- **Pull-out 13.3–14.1:** continuous dissolve, tractor stays on the same spot, no ghost copy.
- **Snap zooms 3.1 / 4.25 / 18.13, slam 6.3, freeze 16.67:** captions sit outside the camera, no blur or echo on text.
- **Camera continuity:** office (3.77) → paycheck (4.97) on the same plate is a clearly different, closer shot (scale
  1.35, other region); the office returns at 17.37 later in the video (allowed).
- **Pacing:** longest shot 11.63–15.97 (4.3 s) changes inside (pull-out + dissolve + designed silence); end card 2.5 s.
- **Sound:** 5 cues each tied to an on-screen event (alarm/clock, slam, bolt, freeze, seam alarm); 14.6–15.95 silent
  as designed; no cue over the end card.

## Repeats checked

- Short #2 "ni está encima de un tractor": checked, Quest sits in/on the tractor at 11.6–17.3. **But the dealership
  tractor itself does not sit on the ground (fix 1): same family of mistake ("every element sits right").**
- Ghost/echo/motion-blurred text (Short #2 v2): checked, no repeat.
- Title over HUD (2026-10-14): no HUD in this Short; title/caption over faces: checked, no repeat.
- Pasted boxes / text with no source (2026-10-18): checked, no repeat.
- Unmotivated light effects: bolt has its source (storm sky darkens first): no repeat (style polish P4).
- Black band / 16:9 crop in 9:16 (Short #2 v2): checked, no repeat.
- Snap-back on the same background: checked, no repeat.
- Person half out of frame: only the designed close at 15.97–17.34 (tractor nose cut on the left, Quest whole): no repeat.

## Taste

The idea lands: the loop "…go back to work. / A game about going to work?" is clean, the pull-out to the dot plus
1.3 s of silence is the best beat, and the freeze-frame scratch is a good dunkey beat. What holds it back from
looking spectacular is craft at the contact points: a tractor balanced on a fence and a bed parked in front of a bed
are exactly what the Producer spots first. Fix 1–4 (all small, no new art, no credits) and it is ready for the
Producer; the single biggest lift is fix 1, because the slam is the Short's main physical gag.
