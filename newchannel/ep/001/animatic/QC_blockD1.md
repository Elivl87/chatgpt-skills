# QC · Block D1 (Act 3, beats 14-16: how do you fix it · the US experiment · drive at the average) · draft 854x480 · 2026-10-15

**Files:** `blockD1_draft.mp4` (63.37 s = narration 222.62 → 285.99, 7.8 MB) · `blockD1_contact_small.jpg` ·
`qc/QC_blockD1.md`, `qc/shots_blockD1.md`. Rebuild: `build_block.sh D1 draft`.

## How it is built

- **Beat 14:** Eli and Mila think (thought bubbles); rulebook gag (Eli lifts a huge book «PARA TODOS»; it sinks under its weight, he turns worried and sweats);
  little robot cars as the wrong idea, then the true S7 US ring (FollowerStopper) with 21 cars and one smart car
  highlighted («1 / 21» badge). The observer extra with the clipboard on «instrucciones» (smaller now).
- **Beat 15:** crossed vignette card (chasing ↔ drive at the average); badge «¡Mi lema!» on Eli; COMPUTADORA pill on
  the smart car; it does not chase the car ahead (gap breathing in the S7 run), PROMEDIO needles; speed graph of the
  lead vs smart car (E12) where the smart car's line stays flat while the lead oscillates; spring metaphor;
  Mila pulls Eli back by the collar when he wants to floor it.
- **Beat 16:** gauges keyed to the words: −80 % (wave amplitude, «melt» shot), frenazos ≈ 0, combustible hasta −40 %,
  and «1 de 21». Source line: *Stern et al., Transp. Res. C 2018*.
- All ring footage is the real S7 run at ×4 (labelled ACELERADO ×4); the gauges show the figures of the published
  experiment, not numbers produced by our toy sim (stated on the source line).

## Measured

| | |
|---|---|
| Shots / cuts | 24 / 23 → **21.8 cuts/min** (pacing_qc detector: 20.8) |
| Longest shot | 5.05 s (E12_avg speed graph; the pen dot and push 0.05 / drift 0.012 keep it moving) |
| Shots > 4 s | E12_avg 5.05, E10_computer 4.41, E15_80 4.28, E17_40 4.08 (each has an in-shot change: pill / needle / counter) |
| pacing_qc | all PASS (avg 2.75 · motion 0.90 · still 0.9/min · wpm 153) |
| Loudness | −14.1 LUFS, TP −1.1 dBTP · no black / freeze / silence |

## Fixes after looking

- E12 flat graph was flagged as a freeze → added a moving pen dot drawing the line + stronger breathing.
- Observer extra in E06_instr was oversized → scaled down.
- Word picks with lowercase homographs corrected (timeline refuses shots with no duration).

## Weaknesses (honest)

- E12_avg (5.05 s) exceeds the ~4 s guide; it changes inside (graph drawing) but it is one framing.
- The ring shots (S7) look alike: same ring, different zoom; the field side view is reused from Block B.
- Robot-car gag (E03, «$$$$») is simple; the rulebook gag's hold is short.
- Gauges are flat UI over the scene, readable at draft size but plain.
