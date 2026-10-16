# Ep 001 animatic · eyes QC (2026-10-16)

Producer: «Quiero que te centres en las expresiones de Eli y Mila, los ojos, el punto de los ojos no está funcionando
muchas veces». Evidence: `art/characters/leo_mila/bug_pupils_animatic_A14.png` (block A ~14 s: a big white disc with a
thin dark crescent in every eye, so the surprise read as closed / sleepy rings).

## Root causes (in `art/lib/cast.js`, `drawEye`)

1. **`K.circle` clamps every radius to >= 0.01.** That is harmless in px, but the face is drawn in head units (eye
   radius ~0.035, pupil ~0.010-0.013): every catchlight (meant to be 0.003-0.005) was drawn at 0.01, i.e. **as big as the
   pupil itself** (0.75-1.0x), at every size. Only a crescent of the pupil was left. The 2026-10-15 detail pass had
   already set the catchlight to 0.3x the pupil, but this clamp silently overrode it, so the fix never showed.
2. A second floor on the catchlight, `max(pr * ck, lw * 0.9)`, made it 0.47-0.63x the pupil even without the clamp.
3. The pupil did not grow with the emotion's eye scale: surprise (eye 1.24x, pupil 0.82x) had a pupil only **0.24x** the
   eye, so at draft scale (eye radius 8-15 px) it was 2-3 px, the catchlight covered it and AA / grain / bloom finished it.
4. Heavy lids (Mila's sleepy bias 0.36 + annoyed / smug / thinking) closed the eye to a slit with the pupil under the lid.
5. (Acting / framing, found by the new audit) the magnifier glass tint + specular streak veiled Eli's eye; a speed badge
   covered Mila's face (B21); faces at the frame edge (D2 F06, D2 F10, B07); E2's look-back showed only the beanie.

## Fixes

- `disc()` (true radius) for pupils and catchlights; `K.circle` is never used for eye details again.
- `K.cast.EYE = { lidMax 0.58, pupilMin 0.36, pupilPx 1.7, catch 0.28, catchMax 0.32, smallPx 9, microPx 4.5 }`:
  pupil >= 0.36x the eye (grows with the eye scale) and >= 1.7 px on screen; catchlight <= 0.32x the pupil, fully inside
  it, dropped when < 0.7 px; eyes < 9 px radius are simplified (pupil + one catchlight, no awe second sparkle, no iris
  ring, one lash); eyes < 4.5 px are a plain dot; the pupil is kept >= 0.85x its radius inside the lid opening (0.6x for
  the declared lid-cover emotions smug / sly, annoyed, grumpy); a non-blink lid is capped at 0.58.
- Magnifier: clear glass (tint 0.14), the specular arc moved to the rim. `ring_field`: Eli plays detective only when his
  eye is >= 7 px on screen (otherwise hand at the chin, curious), so wide shots never hide his face behind the lens.
- Shot lists: B07 Eli moved into frame (was a sliver at the left edge); B21 «≈20 km/h ←» badge moved off Mila's walking
  path to the middle of the oval; D2 F06 Mila moved into frame (was half out) and given acting (annoyed at Eli's «fue el
  viento», then smug as she turns the knob down); D2 F10 car close-up reframed (Eli was cut by the left edge); E2 I05
  look-back: Eli turned round in his seat, 3/4 to camera, curious -> incredulous double take (was a back view).
- New mandatory QC: `faces_audit.sh` (`faces_audit.mjs` + `faces_check.py`), see CHARACTERS.md §6b.

## Automated eye check: failures before -> after (draft 854x480, key acting frames)

| Block | frames audited | eyes audited (before) | failures before | of which no visible pupil (pixels) | eyes audited (after) | failures after | closed / covered / fading (declared) | crowd-scale (not audited) |
|---|---|---|---|---|---|---|---|---|
| A | 58 | 122 | 122 | 83 | 118 | **0** | 0 / 4 / 4 | 0 |
| B | 79 | 139 | 139 | 94 | 139 | **0** | 10 / 0 / 0 | 99 |
| C1 | 26 | 58 | 58 | 45 | 58 | **0** | 0 / 0 / 0 | 2 |
| C2 | 48 | 99 | 99 | 90 | 99 | **0** | 8 / 0 / 0 | 13 |
| D1 | 50 | 129 | 129 | 115 | 121 | **0** | 0 / 0 / 0 | 57 |
| D2 | 101 | 214 | 214 | 176 | 214 | **0** | 0 / 0 / 0 | 143 |
| E1 | 21 | 68 | 68 | 68 | 68 | **0** | 16 / 0 / 0 | 0 |
| E2 | 97 | 244 | 244 | 200 | 244 | **0** | 26 / 0 / 4 | 0 |
| **total** | | | **1073** | **871** | 1061 | **0** | | |

«before» = the kit and shot lists at commit 7d8196b (with the log hook added only to measure); every audited eye failed
the geometry rule (catchlight > 0.36x pupil, drawn at the clamped 0.01 radius) and the «pixel» column counts the eyes
whose final pixels showed no dark pupil blob (the visible bug). «tiny» eyes (< 3 px radius, crowd scale in the widest
ring / field shots) are not audited; at final 1080p they are 2.25x bigger.

## Looked at by eye (face sheets `faces_block<X>_small.jpg`)

- Expressions match the beats: A07 determined -> surprised -> worried -> annoyed on the brake; A08 furious yell with Mila
  annoyed under the ponytail flop (declared gag); A14 Mila curious -> awe; B06 the finger gag ends sheepish; C1 C07 «¡no!»
  worried/surprised; D2 F04-F05 Mila annoyed stare at Eli; E1 G15 «¡nooo!» worried; E2 I05 incredulous double take,
  I06 «¿…quién fue?» curious, I07 Mila happy «fuiste tú»; K03 Eli furious «¿quién fue?» at the bus stop.
- Mouths: talk visemes alternate on every Eli / Mila line in the sheets (tagged «talk»).
- Eyes look at something motivated (the road, the other character, the laptop, the knob).
- Fixed after the first audit pass (framing check added to `faces_check.py`: a face whose head box crosses the frame
  edge is a «framing warning»): D1 E10_computer / E10_nochase had Eli + Mila cut by the frame top / right edge in the
  tight shots that follow the computer car; they are left out of those two shots. 0 framing warnings in all 8 blocks.
- Remaining (minor, honest): crowd-scale Eli / Mila in the widest ring / field shots are 10-20 px tall at draft (their
  eyes are < 3 px and not audited; at final 1080p they are 2.25x bigger). In B07 the «RECREACIÓN ILUSTRADA» pill touches
  the top of Eli's beanie (back view). Outputs: re-rendered `block<X>_draft.mp4` (all 8), face sheets
  `qc/faces_block<X>_small.jpg`, `qc/faces_<X>_before.json` / `faces_<X>_after.json`,
  `art/characters/leo_mila/eyes_before_after_small.jpg`, emotion / model sheets re-rendered. Joined preview (not in git):
  `ep001_animatic_preview_v2.mp4` (7:59, 854x480, 25.7 MB).
