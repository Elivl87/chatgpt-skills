# EP003 Short #1 · independent design critic · v2 (2026-10-18)

Reviewer: frame-critic (independent; did not build). Artefact: `tools/hyperframes_ep003_short1/renders/EP003_short1_v2_preview720.mp4`
(720x1280, 30 fps, 600 frames, 20.0 s). Scope: the changed windows (0–2.6, 6.5–7.5, 8.85–11.8, 11.8–14.1, 14.1–16.4,
16.4–19.0, 19.0–20.0) at 1/30–1/10 s, plus full 0.5 s sheets (40 frames) as a spot check. v1 report: `CRITIC_v1_design.md`.

## VERDICT: FIX (1 blocker: the fish floats beside the stern in the new wide; 1 small overlap in the typing row)

```
1 Hierarchy ........ PASS
2 Overlaps ......... FIX   - 6.70-6.77 s typing bubble pulse covers the bottom of "Leo is typing..."
3 Safe/legibility .. PASS  - banner 60 px two lines, hook 140 px; only phone chrome small (by design)
4 Characters ....... FIX   - 11.85-14.0 s fish hangs in the air off the stern post; cut by the right frame edge ~12.3-13.0 s
5 Art fit .......... PASS
6 Motion ........... PASS
7 Sound ............ PASS  - 5 cues, 15/min, 93 % rest, -14.2 LUFS / -4.6 dBTP; buzz removed as stated
8 Repeats .......... checked: "element floating / not sitting where it belongs" repeats at 11.85-14.0 s; others no repeat
Automated: lint 0 err; frame_critic sweep 0 err / 7 warn + windows 0 err; sfx_audit 0 err / 0 warn (re-run on the v2 mix)
Loop seam: PASS. Frames 598/599 vs frame 0: offset (0, 0) px, mean diff 1.7-2.0/255 (grain + encode)
Top fix: put the wide's fish ON the stern post (belly on the post tip) and keep it inside the frame for the whole push.
```

## v1 fixes: status
- v1 fix 1 (people half out of frame in the wide): **resolved.** At 11.85 s all four are framed (Pixie, Quest, Max,
  Leo fully inside), the slow push then pulls back to the wide by ~13.8 s. No person touches a frame edge.
- v1 fix 2 (fish scale): **scale resolved, placement regressed.** Fish/beanie width is now ~0.75x in the wide (close-ups
  ~0.65x), so the scale is consistent. But see fix 1 below.

## Fix list (concrete, verifiable)

1. **11.85–14.0 s · the fish floats in the air next to the stern post, and is cut by the frame edge (CLAUDE.md "Every
   element sits right"; Rubric §4).** After the resize to 32x24, `#fishW` (index.html line 118, `left: 612px; top: -2px`)
   no longer touches the post: the fish hangs to the right of and above the post tip with a clear gap of sky between
   them in every frame of the wide (11.95, 12.9, 13.5 s crops). During the tighter framing (~12.3–13.0 s) its tail is also
   cut by the right frame edge. Fix: move the fish so its belly rests on the post tip (shift left/down by roughly its own
   half-width and height), and check that it is fully inside x < 100 % at the tightest point of the push. Verify:
   crops at 11.9 / 12.5 / 13.0 / 13.5 s show the fish touching the post and fully in frame.
   Evidence: scratch `c2/fe.png` (11.95 | 12.9 | 13.5 s), `c2/fishedge.png` (12.5 s).
2. **6.70–6.77 s · the typing-bubble pulse covers its own label (Rubric §2: no undeclared overlap on text).** The new
   pulse (`dB.bub` scale 1.18, `transformOrigin: "0% 100%"`, line 494) grows the bubble upward, over the bottom third of
   "Leo is typing…" for ~3 frames. Fix: origin `0% 0%` (grow down/right) or a peak scale ≤ ~1.08. Verify: 1/30 s strip
   6.6–6.9 s shows the label fully clear.
   Evidence: scratch `c2/typ2.jpg` (frames 6.70–6.77 s), `c2/typ.jpg`.

## Optional polish
- 14.0–16.4 s (punch-in): the oar's top edge sits a few px under Leo's mouth (it does not cover it). If the push is
  re-keyed, a few px more headroom between oar and mouth would read cleaner.
- The stale v1 window folders in `build/critic/ep003_short1_gates/` (`w_15.5` and `w_19.2`, which reference times past
  20.0 s) still sit next to the v2 ones. Remove them, or re-run them for v2, so the gate folder matches this cut.

## Changed windows: what I checked
- **Frame 0 (0–2.6 s): PASS.** Two-line banner ("Max · The boat" / "It's eight dollars. / Just get it.") at the top edge,
  words light in sync, hook "EVERY GROUP HAS THIS FRIEND" below it with no overlap. Leo's sweat (guilty) face is a
  stronger frame-0 read than the side-eye. All text is inside the safe area.
- **6.5–7.5 s:** small push and pulse on Leo's typing row. Fine apart from fix 2. Typing follows the voice ("I'll" ~7.6 s).
- **8.85–11.8 s: PASS.** Blink on "He", then side-eye; the 1 s hold (~10.8–11.8) lands the beat. Captions sit at the top,
  clear of the face.
- **11.85–14.0 s:** people PASS; fish FAIL (fix 1). The pull-back is smooth; the caption stays at the top.
- **14.0–16.4 s: PASS.** A clean cut to the sweat punch-in, which is a clearly different shot from the 8.85 s close-up
  (sweat face, tighter). The fish is at close-up scale on the gunwale. "in the game." holds to ~16.3.
- **16.4–19.0 s: PASS.** "TAG THE FRIEND / WHO'LL GET IT / LATER" with a masked reveal. The wordmark fades in. The fish
  drops and lands on top of the "Qu" at ~17.4 with the slime cue at 17.40. "FULL EPISODE ↓" fades in at 17.5.
- **19.0–20.0 seam: PASS.** Cut at ~18.98 to the sweat close-up. The hook fades and settles by ~19.3. The banner slides in
  19.52–19.75 and lands. The last frame equals frame 0 (pose, banner, hook). The first ping on replay is now the banner's
  only sound, as designed.

**Taste.** v2 is clearly better: the frame 0 reads at feed size, the punch-in gives the h08 line a face, and the end card
copy is the joke. Once the fish sits on its post, this is ready for the retention pass and the Producer.

Evidence (scratchpad, not in repo): `/tmp/claude-0/-home-user-chatgpt-skills/14b914a9-8dc9-599e-8a45-e7f574c02142/scratchpad/c2/`
(`s/sheet_01..10.jpg`, `wide.jpg`, `fe.png`, `fishedge.png`, `typ.jpg`, `typ2.jpg`, `seam.jpg`, `oar14.png`).
