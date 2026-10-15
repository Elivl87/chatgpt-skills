# QC · Block E2 (Act 5 + finale + end screen: beats 22-24, end card) · draft 854x480 · 2026-10-15

**Files:** `blockE2_draft.mp4` (70.47 s = narration 408.69 → 479.15, the end of the episode, 9.2 MB) ·
`blockE2_contact_small.jpg` · `qc/QC_blockE2.md`, `qc/shots_blockE2.md`. Rebuild: `build_block.sh E2 draft`.

## How it is built

- **S11 on the golden road of the hook** (same framing, same light, the same tap as S1, Eli keeps a safe gap; true sim).
  Before the run's own start (sim < 0) the cars cruise in the run's steady state (x0 + v·t), which is exact because the
  run starts in equilibrium. That lets beat 22 play at ×1 on the same clock that later lands the tap on «freno».
- **Beat 22:**
  - Same wide as A01, plate «TÚ TAMBIÉN» on «tú».
  - Over the shoulder: the ink spring of the gap on «espacio», plate DEJA UN ESPACIO SEGURO, pills «✓ seguro / ✗ enorme»
    on their words.
  - **Glovebox gag:** Eli takes off his badge «SI SE ABRE UN HUECO, CIÉRRALO» and stores it (clonc). Insert: the glovebox
    pops open and the badge jumps out (boink), hold, then Mila's knee slams it shut (clonc). Close: Eli is surprised, then
    sheepish; Mila, smug and eyes on the road, hands the badge back (it is on his chest again).
  - Plate MANEJA AL PROMEDIO on «velocidad».
  - Fingers drum («tap tap»), a deep breath (puff), calm. «No llegas más tarde»: both smile. Crane with the badges
    «= distancia», «= tiempo», «− frenazos» on their words.
- **Beat 23 (ACELERADO ×3, like the hook):**
  - Same wide; tele on the tapper with the ring on «freno».
  - Over the shoulder with the spring: brake ticks approach (S11 `brake_onset` of cars 23, 22).
  - The leader brakes (`leader_brake_onset`, falls inside the 5 s with no narration). Eli eases off and never stops: the
    sim's minimum speed for him is > 20 km/h and S11 has **zero brake lights behind him** (states.js claims S11.nobrake /
    S11.nostop).
  - Looking back over his shoulder: the road flows, no red light, silence plus a chirp.
  - «¿…quién fue?» said softly (mouth gain 0.6); «Fuiste tú.» balloon, Mila points at him (the accusing finger as
    praise); Eli sheepish → laughing.
  - The bird on the wire raises one wing (new `wing` option on the bird prop) + «pío».
- **Beat 24:**
  - The crane rises; then a high look back with «¿embotellamiento?» on «nunca»: the road behind them flows.
  - Plates UN EMBOTELLAMIENTO NO ES UN LUGAR. / ES UNA OLA. on their words. Calm close in the car on «Un solo conductor
    paciente».
  - **Wordmark payoff** (new kit option `opt.catch` in `E.drawWordmark`): Mila flicks the dot and Eli **catches it on
    time** at the end of «Puntos». Close-up of the catch (awe), then he places it on the i himself («tin»), fist bump,
    tagline.
- **End screen (20 s):**
  - Our own bus stop (shelter, pictogram sign, no brands). Eli impatient, with a thought balloon holding a ticking clock.
  - **Three buses arrive together** on «tres» (three «pshh»), badge «3 de a tres». Eli on the bench «¡¿QUIÉN FUE?!»
    (mouth synced). Mila shrugs to camera.
  - Then they sit on the left while the right 55 % stays clear for the YouTube end-screen elements (dashed placeholders,
    animatic only). The buses leave; a fourth bus goes by without stopping (Eli jumps up waving, then sits back
    sheepish). The bird lands on the stop sign and raises a wing. Both laugh.

## Measured

| | |
|---|---|
| Shots / cuts | 30 / 29 → **24.7 cuts/min** (pacing_qc detector: 22.1) |
| Longest shot | 4.00 s (K04_sit / K05_late, end-screen shots) |
| pacing_qc | PASS except **wpm 101 (FLAG, informational)**: the 5 s of planned silence plus a 20 s end screen with 6 words |
| pacing_qc longest (detector) | 14.5 s: the four end-screen shots share one background and framing, so the detector does not see the cuts; the action changes every ~2-4 s |
| Loudness | −14.1 LUFS, TP −1.4 dBTP, LRA 15.3 LU (the silence and the quiet end) · no black / freeze / undeclared silence |

## Kit changes (additive, smoke-tested)

- `art/scenes/wordmark_end.js`: `opt.catch` (the dot is caught in Eli's hand, carried, placed). Default renders at t =
  0.5 / 1.2 / 1.5 / 2.0 / 3.0 s are **pixel-identical** to HEAD.
- `animatic/anim_hw.js` (`A._hwR`, another run on the same road) and `props.js` (`bird.wing`). Block A stills at 2 / 20.5
  / 22 / 26 s are pixel-identical to HEAD.

## Fixes after looking

- Mila pointed away from Eli, so she now points at him.
- The badge was hidden behind the car door, so it is now drawn on his chest in screen space.
- The glovebox door didn't read, so it is now a hanging trapezoid with a handle.
- The crane up was aimed at empty road, so it is now re-aimed.
- I08_bird was 0.67 s, so I extended it to 1.57 s (the gag needs a hold).
- Two long shots (5.3 s and 4.4 s) were split.
- Added the fourth-bus gag so the end screen doesn't sit still.
- Two sound cues were missing parameters (the build failed), so I added them.

## Weaknesses (honest)

- I05_back (looking back over Eli's shoulder) shows mostly the back of his beanie; his incredulous turn is only readable
  in the next shot.
- The fist bump in the wide wordmark is small (both characters are tiny on the letters).
- The end-screen characters sitting on the bench read slightly «standing behind the bench».
- The glovebox insert is a flat graphic panel, simpler than the painted worlds. The dashed end-card placeholders must be
  removed for the final.
- At ×3 in beat 23 the brake ticks follow the sim, but only cars 23, 22 and 21 light up in S11 (the tap is gentle). The
  «cascade» before the leader is short.
