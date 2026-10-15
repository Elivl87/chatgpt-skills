# QC · Block D2 (Act 3, beats 17-19: too eager · a patient person · the shock absorber) · draft 854x480 · 2026-10-15

**Files:** `blockD2_draft.mp4` (74.41 s = narration 285.99 → 360.39, 9.8 MB) · `blockD2_contact_small.jpg` ·
`qc/QC_blockD2.md`, `qc/shots_blockD2.md`. Rebuild: `build_block.sh D2 draft`.

## How it is built

- **Beat 17 (S8, the knob):** Eli, smug, turns the knob on the observers' generic laptop to «un poquito más rápido»
  (`knob_up` on «rápido»); the wave comes back in the S8 ring (`wave_back` on «volvió», ×4); the big «¡¿QUIÉN FUE?!»
  balloon; silence hit, everybody (observers, Mila) turns and stares (hold); Mila «Eli…»; Eli whistles «…fue el viento»
  while a leaf crosses, Mila turns the knob back down with one finger (`knob_down` on «lento»). Plate PACIENTE = PROMEDIO.
- **Beat 18 (S9, Mila at the wheel):** Mila's favourite part (awe); ring S9 with the pill «Mila hace de conductora»
  (`mila_takes_wheel` on «computadora»); side close-ups in the car: a PROMEDIO sticker on the dash, Eli worried
  pointing at the gap (live ruler from the S9 gap), Mila «Ese es mi amigo», the paper's figures only: ≈ −50 % speed
  changes, −22 % fuel (badges on «mitad» / «quinta»).
- **Beat 19 (S3B_ELI vs S3B_MILA):** two timelines, same road, same lead car: top Eli tailgates and stops
  (`eli_stop` on «embotellamiento»), everybody behind brakes; bottom Mila keeps the gap (ink spring) and passes without
  stopping; Eli «¡Yo llego tarde a todo!» (thumb at himself) and Mila pats him; plate MANEJO QUE ABSORBE
  EMBOTELLAMIENTOS (*Nishi et al., Transp. Res. B 2013*); «Ojo»: Mila points; «repleta»: the toll plaza (staged
  queue, ×4) and the overfull dome S5_40 (40 cars, the patient car cannot absorb it, ×10).

## Measured

| | |
|---|---|
| Shots / cuts | 29 / 28 → **22.6 cuts/min** (pacing_qc detector: 26.6) |
| Longest shot | 4.90 s (F19_late: Eli's realisation, the pose and expression change twice inside) |
| Shots > 4 s | F19_late 4.90, F16_spring 4.46, F17_pass 4.23 (the strips move at ×2 and the spring breathes) |
| pacing_qc | all PASS (avg 2.19 · motion 1.00 · still 0/min · wpm 140) |
| Loudness | −14.1 LUFS, TP −1.4 dBTP · no black / freeze / silence |

## Fixes after looking

- Two-timeline strips showed no road (translate) → fixed to `k*540 − 480`; labels moved to the right; car scale raised.
- New insert F10_sticker so the PROMEDIO sticker reads; word picks with lowercase homographs corrected.

## Weaknesses (honest)

- The two-timeline section is long (≈ 16 s of strips across 6 shots plus 2 later); framing changes (wide / top / bottom
  / zoom) keep it moving but it is the plainest stretch of the episode. In the zoomed strip shots the ELI MANEJA /
  MILA MANEJA pills are partly cropped by the zoom.
- The toll plaza queue is staged on top of a queue sim (PRODUCTION_NOTES 7), stated here.
- Ring shots of S8/S9 again look like the D1 ring shots (same field ring).
