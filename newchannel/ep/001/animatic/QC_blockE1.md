# QC · Block E1 (Act 4, beats 20-21: a hundred cars · the wave remembers) · draft 854x480 · 2026-10-15

**Files:** `blockE1_draft.mp4` (48.29 s = narration 360.39 → 408.69, 5.2 MB) · `blockE1_contact_small.jpg` ·
`qc/QC_blockE1.md`, `qc/shots_blockE1.md`. Rebuild: `build_block.sh E1 draft`. New world code: `anim_e.js`.

## How it is built

- **New world: the four-lane highway at golden dawn from a crane** (oblique view, fields, tree rows, guardrails, sky
  band with hills). **One lane is the true S10 run** (260 cars, 7 smart + 4 with the system off); the other three lanes
  replay the same run shifted along the road. That is an illustration, and the source line says so on screen:
  «Lee et al., IEEE Control Systems 2025 · 1 carril simulado, 3 ilustrados». The lateral scale is stretched ×2.2-2.8
  so the lanes read at draft size.
- **Beat 20:** crane wide; card «nov. 2022» on «noviembre», «cerca de Nashville» on «Nashville»; badge **100 autos
  inteligentes** on «cien»; small teal halos fade in on «autos» and get lost among hundreds of cars. Footbridge from
  below (new world: low angle, golden sky, railing, girder, cars streaking past in the foreground): Eli squints, then
  points. Close crane on a smart car with an «ACC» chip: «▲ acelerar» / «▼ frenar» on their words.
  **Counting gag:** hands insert where Eli counts halos 1-10 on his fingers (one tick per finger), runs out on
  «complicado», Mila's hands slide in and he goes on to 20. «una gota»: an ink drop falls on the highway on «gota»
  (plop) with a tiny ripple. «No borraron todas las olas»: the tap's brake lights at the head of the queue. He gives
  up: the four hands sag together, then «?». Faces: Eli sheepish (sweat), Mila laughs.
- **Beat 21:** Eli pulls out a teal pennant on «Eli» (pop, sparkle) while Mila shrugs «?» (nobody knows where it came
  from). **The speed line:** a paper panel above the road, x aligned with the road. The red bump is the speed each car
  of the sim lane is losing, read live from S10. Smart cars are teal dots, cars with the system off are grey, each
  tied to its car by a dashed line, with a live readout «bache: N km/h». The camera follows the wave (it travels left,
  backwards). Each stretch has its own mapping so the passes land on the words:
  - car 221 is passed on «achica» (×12): bump 9 → 2 km/h;
  - the last of the four «off» cars is passed on «crece» (×9);
  - car 130 on the second «achica» (×14).

  Each shot carries its ACELERADO label. The two «off / again» shots use «escala ×2,7» because the bump is only
  ~3 km/h there; the panel says so.
  - «¡Dale, dale!»: Eli cheers with the pennant, balloon, mouth synced.
  - «¡Nooo!»: hands up to his face, the pennant droops.
  - On the last «se achica» Eli does the wave on time and the pedestrians on the bridge follow him one after another;
    he is surprised at himself.
  - Mila looks at him, smiling.
  - «la hace crecer o encoger»: the true S10 profile, the bump seen by each car from front to back. It drops at the
    two smart cars, creeps up over the four «off» cars and drops again at the next five.

## Measured

| | |
|---|---|
| Shots / cuts | 20 / 19 → **23.6 cuts/min** (pacing_qc detector: 21.1) |
| Longest shot | 4.36 s (G02_card: the two cards appear inside it) |
| pacing_qc | all PASS (avg 2.69 · motion 0.95 · still 0/min · wpm 146) |
| Loudness | −14.1 LUFS, TP −1.4 dBTP · no black / freeze / silence |

## Fixes after looking

- The highway was a thin strip in a sea of fields, so I raised the scale and stretched the lanes.
- Eli's pointing arm went through Mila, so he now points outwards.
- The pennant crossed Mila in the «¡Nooo!» and wave shots, so it now droops down.
- In the profile, the title was cut (the text alignment leaked from another prop), so I reset it.
- Sound: several cues had missing parameters (the build failed), so I added them.
- The labels crossed the source line, so I moved them.

## Weaknesses (honest)

- The crane wides are still mostly fields. The road band is ~12 % of the frame, so at draft size single cars are specks.
  The halos read, the drivers don't.
- The other three lanes copy the sim lane (shifted), so the wave shows in all four lanes at once. This is stated on
  screen.
- The bump changes after the «off» cars and after the second group of smart cars are small (≈ +0.3 and −0.6 km/h at
  the passes) and need the ×2.7 scale. The profile shot shows them honestly as small.
- The bridge pedestrians are the kit's small round extras and read as children next to Eli and Mila.
- The «ACC» chip and the arrows are illustration (the car does not accelerate at that moment).
