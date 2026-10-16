# QC · clothes + text boxes (animatic, 2026-10-16)

Producer (2026-10-16): «Las ropas a veces tienen desperfectos» · «no quiero que tengan voces los personajes (solo en
cuadro de texto que estén más acorde al arte)» · Eli «algo más claro». Design unchanged: Alt 1 «Taller».

Evidence: `art/characters/leo_mila/clothes_before_after_small.jpg` (before / after, 8 defect classes),
`art/textboxes/textbox_sheet_small.jpg` (text boxes in 3 scenes + the 4 variants), block contact sheets
`block<X>_contact_small.jpg`, face sheets `qc/faces_block<X>_small.jpg`, numbers `qc/clothes_lab.json`,
`qc/clothes_<X>.json`, `qc/body_<X>.json`, `qc/faces_<X>_after.json`, `qc/textbox_check.json`.

## 1 · Clothing — what was found and fixed (kit: `art/lib/cast.js`, `art/lib/cast_alts.js`)

Found in the new clothes lab (`art/scenes/clothes_lab.js`: every pose the animatic uses — 22 standing, 11 in the car,
6 on the ground — × front / 3/4 / profile / back / back 3/4 × golden / dusk / night / noon, rendered at draft 854×480
and 1080p, inspected at 4-8× crops) and in the blocks:

| # | Class | Where it showed | Root cause | Fix |
|---|---|---|---|---|
| 1 | **Double ink weight** on garment pieces (thick black bars beside Mila's bib, heavy apron bib / skirt edges) | every front / 3/4 / profile shot | pieces drawn over the body were filled then stroked (full 2 lw ink visible) | stroke first, then fill (one ink weight, like every silhouette) |
| 2 | **Sleeve bulge**: white crescent of tee below the hem line | Eli, every pose with a visible sleeve | round-capped sleeve part ended 0.05 arm-lengths before the hem, its cap radius was longer | round part stops one cap radius before the hem |
| 3 | **Stray knobs** at the ends of the sleeve hem line | Eli | round caps on the hem line poked past the outline | butt caps, line ends on the outer ink |
| 4 | **Colour patch**: shade rectangle on the apron hem between the legs (and Mila's seat) | Eli / Mila standing, front & 3/4 | shade crescent computed from the silhouette treated the leg slot as an edge | leg slot is solid for the shade test |
| 5 | **Arm stump across the apron** (detective, front) | animatic A (Eli standing in the car, magnifier) | the hand-behind-the-back arm was drawn in front with a hidden hand | drawn behind the torso; a relaxed hand, never a stump |
| 6 | **Back view**: apron bow + ties cut by the torso; neck strap a thin cord (flat band in front) | back views | bow inside the torso clip; different drawing | ties hang free (seated: rest); same flat band |
| 7 | **Parts missing from behind**: crossed arms / visor / clipboard / chin from the back = armless torso (then stubs) | back & back 3/4 | arms with the hand in front of the chest hidden entirely | upper arm + elbow at the side of the back, continuous with blends |
| 8 | **Parts missing in back 3/4**: Eli's apron vanished; Mila's back panel didn't turn | back 3/4 | no far-side piece; panel centred | skirt edge peeks past the body; Mila's panel turns with the torso |
| 9 | **Parts missing seated**: apron waist band + skirt gone when sitting | ground (C2 hill) | early `return` when seated | short skirt flap over the lap + waist band |
| 10 | **Pale buttons / jewels**: Mila's brass buttons read white, earring highlights covered the drop | Mila front / 3/4 | `K.circle` clamps r >= 0.01 → highlight as big as the button (same bug class as the old eye catchlights) | true-radius `disc()` |
| 11 | **Popping**: elbow flipped side mid-blend; back-view arm appeared / vanished at k = 0.5; clipboard / lens popped in; walk knee snapped | pose blends, walks | blended elbow pole crossed zero; binary switches | both poses solved and joints blended; continuous arm shortening; prop fades; knee eases in |
| 12 | **Popping in the shot lists**: 29 hard pose switches (`pose: t > T ? 'b' : 'a'`), Mila's 3/4→front turn (E2 K03) | A, B, C1, C2, D1, D2, E1, E2 | one-frame pose change = sleeves / straps jump | `A.pz` / `A.pzv` blend over 0.2 s; K03 turns through numeric views |
| 13 | Pose `lapPoint` (front) pointed across the face | lab | inward front direction | points out and up |
| 14 | Magnifier painted on the back of the head in back 3/4 | lab | lens drawn whenever not full back | hidden in every back view |

Eli's skin: `#7a4d32` → **`#905a38`** (warm medium brown) in the kit and in the three animatic drawings that copied it;
contrast with the tee, Mila's tan `#d9a66c` and the extras kept; eyes re-checked at every size (face audit below).

**Clothing checks (now mandatory, CHARACTERS.md §6d):** lab = parts present per view (exact colours, interior pixels),
stray thin strokes (morphological opening, outside head / hands), popping over 20 idle frames and every pose blend;
blocks = garment colour families on the character's own pixels, thin strokes, popping between the key frame and the
frame 1/30 s later.

## 2 · Text boxes (`art/lib/textbox.js`, ART_BIBLE §3c)

Hand-cut paper (seeded wobble, tooth + fibres, scene glow), variable-width ink brush outline with dry-brush breaks,
tail = the same brush flick stopping beside the head, shadow in the scene's shadow colour away from the light,
**Shantell Sans** (OFL, static instances Speech / Shout / Soft; LICENSES.md). Variants: speech, shout (capitals,
painterly jagged edge, shake), whisper (dotted, translucent), thought (cloud + dots). Pop-in 0.2 s with overshoot,
pop-out 0.16 s. On screen for max(slot, 0.4 s + 0.06 s/char). Placed beside the speaker on the open side, never over a
head, the label pill, the bottom 12 % or the duration-chip corner; two boxes never overlap; crowded frames fall back to
the free upper grid. Wired automatically: `A.drawLines` draws all **21** Eli / Mila lines from the word timings (same
slots the voice agent keeps); old balloons, the duplicate «¿…quién fue?» caption (E2 I06) removed; Mila's «upsi» (C2)
and the D1 thought cloud use the same paper + brush.

Character voices are muted in the animatic sound bed (`sound_block.py` silences the character slots of the narration
track; `KEEP_CHAR_VOICES=1` restores them), so the preview plays narration + sound only.

## 3 · Audits after the re-render (draft 854×480, all 8 blocks)

| Block | Duration | Draft mp4 | Eye failures | Body failures | Clothing failures |
|---|---|---|---|---|---|
| A | 42.0 s | 5.43 MB | 0 | 0 (0 warn) | 0 (110 draws) |
| B | 53.4 s | 7.76 MB | 0 | 0 (0 warn) | 0 (129 draws) |
| C1 | 43.2 s | 3.58 MB | 0 | 0 (0 warn) | 0 (29 draws) |
| C2 | 84.0 s | 11.52 MB | 0 | 0 (0 warn) | 0 (84 draws) |
| D1 | 63.4 s | 7.95 MB | 0 | 0 (0 warn) | 0 (82 draws) |
| D2 | 74.4 s | 9.92 MB | 0 | 0 (40 warn) | 0 (166 draws) |
| E1 | 48.3 s | 5.26 MB | 0 | 0 (0 warn) | 0 (42 draws) |
| E2 | 70.5 s | 9.19 MB | 0 | 0 (0 warn) | 0 (189 draws) |

- **Clothes lab:** 1170 cell renders (2 characters × 4 sets × 5 views, big + 1080 + draft, 20 idle frames and 21-step
  pose blends per set): **0 failures** (`qc/clothes_lab.json`); 32 contact sheets (4 lights × 2 sizes) inspected by eye.
- **Text boxes** (`textbox_check.mjs`): **21 lines, 0 failures**: each box on screen over the whole
  voice slot and for max(slot, read time), never over a head, inside the safe area (`qc/textbox_check.json`).
- Body warnings left: D2 F10-F12 «PROMEDIO» laptop prop over the bodies (pre-existing prop placement, looked at: it
  stands in front of the legs by design, no face covered).
- **Preview:** `ep001_animatic_preview_v3.mp4` (scratchpad, not in git): 854×480, 7 min 59 s, 27.6 MB (26.3 MiB),
  narration + sound; character slots muted in the bed (≈ −31 dB there vs ≈ −18 dB under narration).

## 4 · Honest notes

- Expression changes in the shot lists are still cuts (a face may change in one frame); poses no longer are.
- The stadium wave (C2) stands the pair up from their seats on a threshold by design (the "jump" of the wave).
- `upsi` is not in the word timings (no voice line), so its box is timed by the shot (0.6 s ≥ its 0.64 s read time).
