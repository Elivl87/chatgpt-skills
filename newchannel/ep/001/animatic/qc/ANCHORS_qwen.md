# Ep 001 · Anclas del animatic sobre la voz nueva (Qwen3-TTS «Ryan», 8:34) · 2026-10-24

La narración oficial es ahora `audio/narration_es.wav` + `audio/timings_es.json` (Qwen3-TTS Ryan, guion v4 palabra por
palabra, 150-165 ppm dentro de las oraciones; `audio/qwen/VOICE_QC_qwen.md`). Todos los planos arrancan en una palabra
(`A.at(word, n, { beat })`); esta nota recoge la prueba en seco de los 8 bloques sobre los tiempos reales, lo que el ritmo
nuevo rompió y cómo se arregló dentro de las listas de planos. Las 11 anclas re-apuntadas para el guion v4 (`ANCHORS_v4.md`)
siguen válidas: **0 anclas sin palabra, 0 planos sin duración**, los 8 bloques encajan sin huecos (t1 de cada uno = t0 del
siguiente), total **514,31 s** (8:34,3 = la pista; antes 507,4 s provisional / 511,3 s Chatterbox).

## 1 · Prueba en seco (eventos de la línea de tiempo, sin render)

| Bloque | t0 → t1 (s) | Dur. | Planos | Cortes/min | Más largo | Planos > 4 s (todos con cambio interno) | Planos < 0,7 s |
|---|---|---|---|---|---|---|---|
| A | 0,00 → 43,56 | 43,56 | 21 | 27,5 | 4,29 (A05_crane) | A05_crane 4,29 | — |
| B | 43,56 → 98,42 | 54,85 | 23 | 24,1 | 4,30 (B06_finger) | B06_finger 4,30 | B17_eli_shrug 0,65 (ya en v3) |
| C1 | 98,42 → 147,12 | 48,70 | 15 | 17,2 | 4,72 (C11_stable) | C07_no 4,28 · C11_stable 4,72 · C13_gossip 4,56 | — |
| C2 | 147,12 → 236,94 | 89,83 | 31 | 20,0 | 6,15 (D20_names) | D02_through 5,01 · D06_plate 4,46 · D18_wave 4,96 · D20_names 6,15 | D13_quienf 0,59 · D13_screen 0,70 (ya en v3) |
| D1 | 236,94 → 308,25 | 71,31 | 24 | 19,4 | 5,22 (E12_avg) | E12_avg 5,22 · E15_80 4,76 · E17_40 5,22 | — |
| D2 | 308,25 → 389,08 | 80,83 | 29 | 20,8 | 6,19 (F19_late) | F15_one 4,35 · F16_spring 4,18 · F17_late 4,68 · F17_pass 4,59 · F19_late 6,19 | — |
| E1 | 389,08 → 441,94 | 52,86 | 20 | 21,6 | 5,44 (G05_chip) | G02_card 5,24 · G05_chip 5,44 · G10_flag 4,36 | — |
| E2 | 441,94 → 514,31 | 72,37 | 30 | 24,0 | 4,40 (H02_gap) | H02_gap 4,40 · J02_plate 4,08 | — |

Ritmo: todos los bloques ≥ 17 cortes/min (regla ≥ 12), plano medio 2,1-3,2 s. Los planos > 4 s cambian por dentro
(simulación acelerada, placas y pastillas que entran, actuación): el hueco mayor sin cambio visible es `D20_names`
(tarjeta «embotellamiento» en 0,6 s → «trancón» en 3,8 s = 3,2 s) y `F19_late` (pensar → sorpresa en 1,2 s → señalarse en
4,1 s). `qc/QC_block<X>.md` (pacing_qc) pasa en los 8; el único FLAG es `wpm_overall` en A (108: los 5 s de silencio de la
marca) y es informativo.

## 2 · Lo que el ritmo nuevo rompió y el arreglo (listas de planos)

| Bloque · plano | Con la voz nueva | Arreglo | Ancla |
|---|---|---|---|
| D2 · F16_spring → F17_late | la frase «se come el frenazo antes de que llegue a los demás» es más lenta y hay 1,4 s de pausa antes de «El auto paciente»: F16_spring duraba **6,9 s** (v3: 4,9) y F17_late 2,0 s | la tira de arriba (Eli) abre en «llegue a los demás» (donde el frenazo llega a los otros): F16_spring 4,18 s, F17_late 4,68 s | `start: w('llegue', 1, '19') - 0.1` (antes `tEl - 0.1`) |
| E1 · G13_dale / G14_off | el hueco de silencio de la línea solo-cuadro «¡Dale, dale!» es **0,30 s** (Chatterbox: ≈ 1 s): el plano del grito duraba 0,40 s y el cuadro (1,12 s de lectura) seguía abierto, sin cabeza, sobre el plano siguiente | G14_off espera a que el cuadro se haya leído: G13_dale 1,45 s, G14_off 2,26 s (la narración «Pasan cuatro…» empieza 0,96 s antes del corte; aceptable: describe la simulación que viene) | `start: Math.max(tPasan2 - 0.08, tDale + 1.3)` |
| E1 · G15_nooo / G16_act2 | ídem «¡Nooo!»: hueco 0,30 s, plano 0,44 s | G15_nooo 1,15 s, G16_act2 1,47 s | `start: Math.max(tPasan3 - 0.08, tNooo + 0.95)` |
| A · A16_lens («¿Qué?») | hueco 0,50 s; el cuadro necesita 0,64 s + 0,12 | sin cambio: A17 arranca en «Entonces» − 0,15 (35,22 s) y el cuadro cierra en 34,96 s | — |

Las dos continuidades del guion v4 siguen: **gafete en la guantera** desde `H03_back` hasta el final (`badge: 0` en los
7 planos, sin `gloveBadge` en I05; comprobado en el render de E2) y **«Vamos por partes.»** (beat 09, 98,42 s) abre el
bloque C1 en `C01_slow` (Mila, ×1) y los sellos ACELERADO ×2/×3 siguen en C03 y C06-C08 (P14/M2: ya no hay contradicción
con «más despacio»).

## 3 · Lo que el ritmo nuevo deja y no se arregla en las listas de planos (decisión del director)

1. **Huecos de las líneas solo-cuadro** (`¿Qué?` 0,50 s, `¡Dale, dale!` 0,30 s, `¡Nooo!` 0,30 s): la voz Qwen deja menos
   silencio que la lectura mínima del cuadro (0,4 s + 0,06 s/carácter). Se sostiene el plano del gag y el narrador entra
   mientras el cuadro sigue en pantalla. Si molesta, la toma puede volver a montarse con `QWEN_PAUSE_SCALE` o un hueco
   fijo de 0,9 s en esas tres líneas (`build_voice_qwen.py assemble`, ≈ 1 min, sin re-sintetizar).
2. **Duración 8:34** frente al objetivo 7:30-8:00: aceptada por el director el 2026-10-24 (ritmo ≈ 150-165 ppm). Los
   recortes nivel B del guion (beat 6 «Una sola tarea:», beat 15 «contando frenadas y arrancones», beat 20 «un programa
   que decide…») siguen en reserva; cada uno mueve una ancla (`B07`, `E12`, `G05`).
3. **`wpm_while_speaking` 187-202** en los QC de bloque: la métrica cuenta palabras sobre el tiempo con voz del bloque y
   la pista nueva tiene pausas más cortas; informativo (la voz mide 156 ppm dentro de las oraciones).

## 4 · Render de revisión (1280x720) y QC

- `build_block.sh <B> review` con `CHUNK=600` (nuevo: renderiza y codifica 600 fotogramas por vez; los PNG de 720p son
  ≈ 2 MB cada uno y los 8 bloques no caben en el disco a la vez), 2 Chromium, `nice`.
- Sonido por bloque (`sound_block.py --sound cine_suave`) y, para el piloto entero, `build_episode.py` (una sola mezcla
  Cine suave sobre los 8 bloques: partitura re-cronometrada de `compose_score.py`, ambiente por escena, ducking bajo la
  narración, ranuras de Eli/Mila silenciadas; master −14 LUFS / TP ≤ −1,5).
- QC automático por bloque: `body_audit.sh` (ojos, cuerpo, ropa en 720p), `pop_check.py` (cada fotograma),
  `textbox_check.mjs --blocks`, `qc_block.py` (ritmo, negro/congelado/silencio, sonoridad). Resultado y arreglos del pase:
  `GUARDIAN_REPORT_animatic_v4.md`.
