# Ep 001 · Anclas del animatic sobre la voz de David C (guion v5) · 2026-10-29

Narración oficial: ElevenLabs David C, `audio/narration_es.wav` (485,8 s con los 20 s de cierre), `audio/timings_es.json`
(1107 palabras, 54 líneas), `audio/segments_es.json`. Los tiempos Qwen quedan como `*_qwen.json`. **Sin renders finales**: el
diseño de Eli (gorro) sigue abierto y otro agente tocará `art/lib/*`; aquí solo cambian las listas de planos, `anim.js`, la
partitura (MIDI + plan) y este informe.

## 0 · Resultado

- Los 8 bloques cargan contra `timings_es.json`: **0 errores de ancla, 0 planos sin duración, 0 huecos** (cada `t1` = `t0` del
  siguiente). Episodio 0 → 484,25 s (= «Puntos» fin + 1,9 s + 20 s), **202 planos, 24,9 cortes/min** (Qwen: 192 planos, 22,5).
- `A.LINES`: 20 ids re-numerados; `linesMissing = []` en los 8 bloques.
- Las 16 frases nuevas caen sobre su gag visual (tabla §3); 11 planos nuevos sin arte nuevo (encuadres o poses del kit).
- Beat 12: el corte «¡¿Quién f…?» cae en el /f/ (§4). Partitura re-cronometrada (§5).

## 1 · Herramienta nueva de prueba en seco (`anim.js`)

`?anchors=1` añade a `events()` la lista de cada búsqueda de palabra (`word`, `n`, `beat`, `speaker`, índice, línea, tiempo y
contexto ±3 palabras) y `linesMissing` (ids de `A.LINES` que el archivo de palabras no tiene). Con eso se compararon **todas** las
anclas de Qwen contra David por contexto, no solo las que lanzan error: así aparecieron tres anclas que *no* fallaban pero
apuntaban a otra frase (`La`#2 b17, `a`#2 b13, `Una`#1 b18). Sin `?anchors=1` la salida no cambia.

Comando por bloque (CPU baja): `nice node art/render/render.mjs --page ep/001/animatic/index.html --scene ep001_<B> --query
"out=854x480&anchors=1" --events ev_<B>.json --still 0 --png still.png`, más fotogramas sueltos (`--still t1,t2,…`) a mitad de
cada plano nuevo o cambiado: 23 fotogramas, sin errores de página; revisados a ojo (B01_heels se re-encuadró para no cortar el gorro).

## 2 · Anclas re-apuntadas (antes → después)

| Bloque · plano / uso | Antes (Qwen v4) | Después (David v5) | Motivo |
|---|---|---|---|
| C1 · `C07_no` | `Eli`#1 b09 (narrador) − 0,1 | `Adivina`#1 b09 − 0,1 | #5 «Adivina quién va en el diez:» |
| C2 · `D03_stays` (`tLos2`) | `Los`#2 b11 − 0,1 | `salen` b11 − 0,1 | C1 quita «Los autos se van; el embotellamiento se queda.»: el plano abierto del anillo abre en «y salen por delante» (D02 2,9 s · D03 1,4 s) |
| C2 · anillos de autos parados (`tQueda`) | `queda`#1 b11 | `delante` b11 | ídem; `tVan` borrado (no se usaba) |
| C2 · `D18_wave` + reloj S6 (`tAhi`, `N6`) | `Ahí`#1 b13 | `sola`#1 b13 − 0,16 (= «una sola») | C2 |
| C2 · `D19_speed` (`tA13`) | `a`#2 b13 | `a`#1 b13 | «llévalo a una» desaparece: `a`#2 sería «llegó **a** su casa» (no lanzaba error) |
| C2 · `D13_screen` | `f` fin + 0,05 | `f` fin | §4 |
| C2 · Eli se para tarde (`lateUp`) | `entera` fin + 0,15 | `Eli`#1 b11 − 0,35; sostiene 1,2 s (antes 0,76) | #6 |
| D1 · `E13_pull` (paso + tirón) | paso en `como`, tirón en `resorte` fin | manos `open` y paso en «**A** Eli…» (`Eli` b15 − 0,17), tirón en `manos` fin − 0,15 | #7 |
| D2 · `F02_back` (`tLa`) | `La`#2 b17 | `La`#3 b17 | #15 mete «la sube»: `La`#2 sería «alguien **la** sube» (no lanzaba error) |
| D2 · perilla (`knob`, sim `K8u`, click) | `rápido` | `sube` b17 | #15: la perilla sube en «alguien la **sube** silbando» |
| D2 · `F01_knob` | `rápido` − 0,35 | `En`#1 b17 − 0,1 | #15 |
| D2 · silbido | F01_laptop, T0 + 0,2 → `rápido` | F01_knob, `En` + 0,3 → `silbando` fin + 0,3 | #15 |
| D2 · `F08_fav` + `mila_theme` | `Esta`#1 b18 | `La`#1 b18 | C3 «La parte favorita de Mila:» |
| D2 · `F15_one` | `Una`#1 b18 | `Una`#2 b18 narrador | **Error previo**: `Una`#1 era «una quinta parte»: en Qwen F15 abría 2 s antes y escondía el −22 % de F14 |
| D2 · `F18_behind` | `Los`#2 b19 | `nunca` b19 − 0,1 | C4 quita «Los de atrás ni sienten la ola.». `Por`#2 («Por una vez») ya es F19_late: el plano abierto de las dos franjas va en «nunca tiene que detenerse» (F17_pass 2,0 · F18 2,0 s). (La propuesta decía `Por`#1, pero `Por`#1 es «Por qué funciona».) |
| D2 · palmadita de Mila | `todo` fin | `Mila` b19 − 0,2 (+ cara `smug`) | #10 |
| D2 · `F06_wind` | `Fue`#2 − 0,35 | máx(ídem, Mila «Eli» + 0,55) | F05 quedaba en 0,53 s con el «¿Eli?» de 0,3 s; ahora 0,75 s |
| E1 · `G05_chip` + pastillas | `programa` / `acelerar` / `frenar` | `que`#1 / `acelera` / `frena` b20 (pastillas «▲ acelera» / «▼ frena») | C6′ |
| E1 · conteo con los dedos (`G06_count`) | `resultado` → `Cien`#2 | 1-10 de «**A** Eli» a `dedos` fin; manos de Mila en `Ni` − 0,25; 11-20 hasta `El` − 0,25 | #12 |
| E2 · — | — | sin anclas rotas | — |
| todos · `A.LINES` + `say` de D2 | ids Qwen | ids David | #2 y #4 son segmentos nuevos del narrador |

`A.LINES` (Qwen → David): b04_06_mila → b04_07_mila · b04_07_eli → b04_08_eli · b06_11_eli → b06_12_eli · b07_14_eli →
b07_15_eli · b09_18_eli → b09_20_eli · b10_21_eli → b10_23_eli · b12_24_eli → b12_26_eli · b13_27_eli → b13_29_eli ·
b14_29_eli → b14_31_eli · b17_33_eli → b17_35_eli (también el `say` de `F04_stare`) · b17_35_mila → b17_37_mila · b17_36_eli →
b17_38_eli · b18_39_eli → b18_41_eli · b18_40_mila → b18_42_mila · b19_43_eli → b19_45_eli · b21_47_eli → b21_49_eli ·
b21_49_eli → b21_51_eli · b23_54_eli → b23_56_eli · b23_55_mila → b23_57_mila (b03_02_eli igual).

Todas las demás anclas (≈ 380 búsquedas) se compararon por contexto Qwen ↔ David y apuntan a la misma frase.

## 3 · Las 16 frases nuevas: dónde cae el gag (tiempos de episodio, s)

| # | Frase | Plano(s) | Cómo cae |
|---|---|---|---|
| 1 | «Eli siempre está seguro.» 21,99 | **A10_sure** nuevo 21,89-23,95 (A10_point 19,44-21,89) | primer plano de A09: Eli cruza los brazos, asiente con suficiencia en «seguro»; Mila pone los ojos en blanco en «siempre». A10_point medía 4,5 s |
| 2 | «No, Eli. El pajarito tampoco.» 29,68 | A13_squint / A13_bird (sin cambio) | «No, Eli» mientras Eli mira el cable; corte al pájaro en 30,60, «El pajarito» 30,73; el pájaro se encoge de alas 31,80 (después de «tampoco») y «pío» 31,90 |
| 3 | «Literalmente.» 50,31 | **B01_heels** nuevo 50,22-51,46 | corte a encuadre cercano del arrastre (mismo movimiento continuo, surcos de los talones). B01_drag 3,1 s |
| 4 | «Respuesta corta: todos. La larga: este video.» 87,08 | B16_shrugs 86,31-89,62 · B17_eli_shrug 89,62-92,13 | «todos» (88,35) cae cuando la ola de hombros termina; B17 pasó de inserto de 0,65 s a plano de 2,5 s en «La larga»: el puño baja al encogimiento, mira a cámara en «video» |
| 5 | «Adivina quién va en el diez:» 119,86 | C07_no 119,76 | el plano sobre Eli abre en «Adivina» |
| 6 | «Eli llega tarde. Como siempre.» 161,12 | D05_late 160,42-163,69 | Eli ya está de pie, solo, en «Eli llega tarde» y sigue arriba (avergonzado) hasta «Como siempre» |
| 7 | «A Eli le pican las manos.» 267,90 | E13_pull 266,55-270,62 | las manos se abren y avanzan en «A Eli», Mila tira del tirante al terminar «manos» |
| 8 | «Pobre lema de Eli.» 287,61 | **E18_lema** nuevo 287,50-289,80 (E18_one 3,1 s) | vuelve a Eli sosteniendo el gafete con un dedo; lo suelta en «Pobre», el gafete se dobla en «lema» |
| 9 | «¡Hay un hueco! ¡Cabe una casa!» (cuadro) 317,98 | F11_gap 317,73-320,04 | solo cambia el texto; el cuadro dura 2,2 s (lectura) y entra 0,26 s en F12, donde Eli sigue en cuadro |
| 10 | «Mila lo sabe.» 350,07 | **F19_pat** nuevo 349,77-351,51 | plano más cerrado; la palmadita entra en «Mila», cara de «ya sé». F19_late bajó de 6,5 a 4,75 s |
| 11 | «Ni siquiera Mila.» 361,79 | **F23_mila** nuevo 361,69-363,62 | acercamiento al auto paciente (halo) atascado en el domo lleno, mismo reloj de simulación |
| 12 | «A Eli no le alcanzaron los dedos. Ni prestados.» 376,71 | G06_count 376,41-380,96 + **G06_result** nuevo 380,96-383,56 | el conteo cae bajo la frase (ver §2); «¿El resultado? Es complicado.» en el puente: Eli pensativo → preocupado, Mila con cara de «ya sé» |
| 13 | «Mira quién hizo la ola a tiempo.» 408,25 | **G20_ontime** nuevo 408,15-410,92 (G19_profile 2,2 s) | vuelta al puente: Eli con el banderín arriba, orgulloso, ríe en «tiempo» (ding); Mila con cara de «ya sé» |
| 14 | «Sí, tú. No el de adelante.» 413,87 | **H01_you** nuevo 413,77-416,97 (H01_same 2,9 s) | en el auto: Eli oye su propia excusa y se avergüenza en «No»; Mila se gira, con cara de «ya sé», en «adelante». Gafete todavía puesto (va a la guantera en «cerrarlo») |
| 15 | «En nuestra versión, alguien la sube silbando.» 295,27 | **F01_ring** nuevo 291,98-295,18 · F01_knob 295,18-298,17 | primer plano de la laptop en «En nuestra versión»; silbido; Eli sube la perilla en «sube» (click + mapa de sim S8 en «sube») |
| 16 | «Hasta Eli.» 459,12 | **J03_eli** nuevo 459,02-460,29 (J03_calm 3,6 s) | más cerrado sobre la pareja: la mano de Mila al hombro, Eli sonríe → ríe. Sin gafete (M1) |

**Cuadros `[solo cuadro]`** (sin voz; la pista de David deja 0,3-0,5 s): el cuadro siempre se muestra `máx(hueco, 0,4 s + 0,06 s/carácter)`.

| Línea | Hueco | Cuadro visible | Plano que lo sostiene | Encima del narrador |
|---|---|---|---|---|
| b04_08_eli «¿Qué?» | 0,50 s | 37,68-38,50 | A16_lens 37,56-38,48 | 0 s |
| b21_49_eli «¡Dale, dale!» | 0,30 s | 397,72-398,96 | G13_dale 397,57-**399,02** (se sostiene hasta leerlo) | 0,72 s sobre «Pasan cuatro con…» |
| b21_51_eli «¡Nooo!» | 0,31 s | 401,06-401,94 | G15_nooo 400,87-**402,01** | 0,38 s sobre «Pasan más…» |

Los dos solapes del beat 21 **no se pueden resolver en la lista de planos**: el narrador entra 0,2 s después del hueco en la
pista (retoque de audio: abrir 0,8 s / 0,5 s en `assemble_david.py` BREAKS del beat 21). El plano ya se sostiene hasta que el cuadro
se lee, en vez de cortar con el narrador.

## 4 · Beat 12 · «¡¿Quién f…?»

`timings_es.json`: `Quién` 185,435-185,73, `f` 185,73-**185,82** (`conf 0`, hueco de lectura 185,435-185,82). En la onda: el /f/
(fricción, muchos cruces por cero) empieza en ≈ 185,75 y la señal llega a silencio digital en 185,815-185,82: el ensamblador lo
cortó ≈ 70-90 ms dentro del /f/, tal como dice `assemble_david.py` (`cut_f`). El corte de imagen `D13_quienf` → `D13_screen` iba
en `f` fin + 0,05 (fotograma 5577 = 185,90 s, 2-3 fotogramas tarde); ahora va en `f` fin: **fotograma 5575 = 185,833 s**, en el
mismo fotograma que el corte de audio. D13_quienf 0,69 s · D13_screen 0,75 s.

## 5 · Partitura

`python3 audio/music/compose_score.py` sobre `timings_es.json` (solo MIDI + plan, sin render): 24 secciones, fin 484,25 s (=
`t1` de E2); hook 0-16,12 · hush 16,12-38,33 · ask 38,33-42,22 · sting 42,22 (= A18_wordmark) · … · beat 24 446,49-464,85 ·
end 464,85-484,25. `score_es.mid` y `score_es_plan.json` actualizados; `ensure_score()` lo vuelve a sintetizar (hash de los
tiempos) cuando `build_episode.py` mezcle.

## 6 · Ritmo por bloque (desde `events()`; sin video, así que sin `motion_share` / `still_2s`)

| Bloque | t0 → t1 (s) | Dur. | Planos | Cortes/min | Prom. (s) | Máx. (s) | ppm narración+cuadros |
|---|---|---|---|---|---|---|---|
| A | 0,00 → 47,09 | 47,09 | 22 | 26,8 | 2,14 | 3,74 | 111 |
| B | 47,09 → 102,94 | 55,85 | 24 | 24,7 | 2,33 | 4,59 B06_finger | 141 |
| C1 | 102,94 → 147,10 | 44,16 | 15 | 19,0 | 2,94 | 4,53 C07_no | 151 |
| C2 | 147,10 → 223,15 | 76,05 | 31 | 23,7 | 2,45 | 4,94 D20_names | 156 |
| D1 | 223,15 → 289,80 | 66,65 | 25 | 21,6 | 2,67 | 4,66 E12_avg | 154 |
| D2 | 289,80 → 363,62 | 73,82 | 32 | 25,2 | 2,31 | 4,75 F19_late | 141 |
| E1 | 363,62 → 410,92 | 47,30 | 22 | 26,6 | 2,15 | 4,55 G06_count | 161 |
| E2 | 410,92 → 484,25 | 73,33 | 31 | 24,5 | 2,37 | 5,00 K04_breeze (pantalla final) | 89 |

Todos ≥ 12 cortes/min. Planos > 4,05 s (todos con cambio interno ≤ 4 s): B06_finger 4,59 (giro en 7 vistas), C07_no 4,52 (tres
barras), C11_stable 4,34 (gráfica), D06_plate 4,06, D20_names 4,94 (tarjeta por nombre; mayor tramo sin cambio 2,6 s),
E10_computer 4,40, E12_avg 4,66, E13_pull 4,07 (paso 1,3 s + tirón), F19_late 4,75 (ding 1,0 s · señalarse 3,0 s), G02_card
4,08 (dos pastillas), G06_count 4,55 (conteo continuo), H05_same 4,43, K04_breeze 5,0 (cierre de 20 s). Todos existían con Qwen y
eran más largos (E12 5,2 · D20 6,2 · F19 6,2 · G05 5,4 · H01 6,1). Único plano < 0,7 s: D13_quienf 0,69 (el corte del grito,
intencional). La respiración de cámara no cambia (cada plano nuevo: push 0,03-0,035 con dirección propia, drift por defecto).

## 7 · Pendiente / fuera de las listas de planos

1. Render de los 8 bloques (después del cambio de gorro): `build_block.sh <B> review` → `qc_block.py` (pacing_qc con video:
   `motion_share`, `still_2s`), `textbox_check.mjs --blocks`, Guardián sobre los 11 planos nuevos (sobre todo F23_mila: el auto con
   halo queda fuera del centro por el `clampView`; J03_eli / H01_you: la mano de Mila y la cara de Eli con el gorro nuevo).
2. Beat 21: abrir el hueco de «¡Dale, dale!» / «¡Nooo!» en la pista si se quiere el cuadro sin narrador encima (§3).
3. `sound_block.py` / `build_episode.py` no necesitan cambios (leen `events.json`; el silbido de D2 ahora está en F01_knob).
