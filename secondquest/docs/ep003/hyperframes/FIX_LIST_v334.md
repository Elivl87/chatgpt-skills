# EP003 v3.3.4 · builder fix list (from CRITIC_FINAL_design.md, director 2026-10-17)

Episode time / block-local time. Block starts: D 105.97, E 163.27, G 293.90. Sources: `tools/hyperframes_ep003/src/block<X>.template.html`
(never edit the built `block<X>/index.html`; `build.py` writes it). Script is LOCKED: no narration/text changes. Art is
never edited: move, re-frame, re-time only. Every move stays keyed to narration words (`{{lNN.wK}}` / `T.*` / `Q.*`).

## Blocking (all six must land)

| # | Window | Element | Fix | Done when |
|---|---|---|---|---|
| 1 | 138.3–139.0 (D 32.3–33.0) | `#badge` "JOB: silence" | Off Quest's face: hang it from the "…" bubble's SIDE (left or right of the bubble, over sky/water), or shrink and pin it to the bubble's top edge. Quest's whole face visible at every frame 138.0–139.4. | HUD_OVER_CHARACTER 0 err in D 31.5–33.5 at 1/30 s; full-size frame 138.5 shows Quest's face clear |
| 2 | 110.1–115.8 (D 4.1–9.8) | `#stamp799` "$7.99 PAID" | On the EMPTY phone background (no message bubble, no timestamp under it), fully inside the phone; the SOLVED disc (`#okStamp`, from 113.2) must not cover it (move the disc or the stamp). **Remove `#stamp799` from the allow-overlap list** (D l.1103 `forEach`). | frame_critic 0 err without the waiver; full-size 110.5 and 113.5 |
| 3 | 208.45–209.25 (E 45.2–46.0) | FAIL ×3 combo card (`hud.combo` at `{{l32.w20+0.06}}`) | Keep it clear of the suspects' heads during the line-up pan: hide it during the pan and bring it back at 210, OR frame the line-up lower (heads below y ≈ 340). | HUD_OVER_CHARACTER 0 err in E 44.5–46.5; frames 208.5, 208.8, 209.1 |
| 4 | 213.0–215.3 (E 49.7–52.0) | hearts pill + eye shot (`G5 = focus(950, 560, 1.55)`) | Hearts pill not on Quest's head (re-frame the crew lower/right, or hide the hearts for the eye close-up) AND Pixie fully in frame or fully out. | HUD_OVER_CHARACTER 0 err; no character box cut by the frame edge; frames 213.1, 213.6, 215.0 |
| 5 | 233.0–234.5 (E 69.7–71.2) | year wheel 2026→2031 (`YR`, `drawYear`, `{{l35.w17}}`) | The roll runs where it ends (right of the phone, empty table) or over an empty area; it never passes over the "$0" polaroid or "dynamite night". | frames 233.2, 233.8, 234.1, 234.4: no text on text |
| 6 | 311.40–311.70 (G 17.5–17.8) | `#tut` TUTORIAL chip | Leaves with HOW TO FISH (opacity 0 by 311.40) and stays 0; find what brings it back / holds it after `Q.l49 - .02` (G l.543; check the `Q.maybe` keyframes at l.530 and any later tween on `#tut` or its parent). | `hyperframes check` G: no `text_occluded #tut`; frame_critic 1/30 s G 17.0–18.4 |

## Cheap, non-blocking (do them; free)

- 127.6–127.85 (D 21.6–21.9): the "…" bubble deflates across Quest's face → pop/shrink in place above the heads.
- 270.0–272.2 (F 30.8–33.0): end of the F out/across move cuts Pixie by the left edge → end ~60 px further right (or let her exit fully).
- 139.0 (D 33.0): the whip to the board → hard cut or short push (blur budget 1–3; keep 144/145 alibi whips).
- 159.70 (D 53.7): NEWEST stamp enters as a 40 % ghost → enter opaque at its landing scale; nudge 30 px right/down off Max's timestamp, inside the phone.
- 181.1–182.3 (E 17.8–19.0): boss "???" bar touches heads → bar 20 px higher or boat 20 px lower.
- 136.5–139 (D 30.5–33): "a reason" tag over the fish's face → hang it beside the fish.
- Characters: add `data-role="character"` to the character `<img>`s you touch (helps the gates).

## Retention polish (optional, free)
- Pad the mix to 328.4 s with the night bed so the end-card splash rings out (`scripts/ep003-sfx.py`).
- Raise the 277.1 clock cue 4–6 dB.

## Rules while fixing
- Fix only these windows; prove the rest unchanged (the scene cache shows which scenes re-render; frames outside the
  changed scenes are byte-identical cached scenes).
- No new `data-critic-allow-overlap` / `data-layout-ignore` on stamps, labels, badges or HUD.
- Iterate with `QUALITY=draft python3 tools/hyperframes_ep003/scene_cache.py <X>`; the critics' pass is the review quality run.
- Never run a render and a heavy check at the same time.
