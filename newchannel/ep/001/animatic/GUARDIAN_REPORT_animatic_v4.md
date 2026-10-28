# Guardián de Eli y Mila · informe · animatic v4 (ep001, 8 bloques review 1280x720, narración Qwen3-TTS Ryan 8:34)

**Veredicto: PASS** (2026-10-24). Cero defectos abiertos de la punta del cabello a la punta del pie en los 8 bloques
(`block{A,B,C1,C2,D1,D2,E1,E2}_review.mp4`, 514,3 s = la pista `audio/narration_es.wav`) y en el piloto unido
`ep001_piloto_v4_720p.mp4` (fuera de git, en el scratchpad de la sesión: 514,33 s, 15 430 fotogramas, 101 MB, −14,0 LUFS / TP −2,0 dBTP; versión 854x480 de 27,0 MB).

Nota de procedimiento: en esta sesión no existía la herramienta Agent para lanzar al subagente `guardian-eli-mila`; el pase
se ejecutó siguiendo al pie de la letra `.claude/agents/guardian-eli-mila.md` (los mismos chequeos automáticos, los mismos
recortes vistos a ojo, el mismo criterio «solo PASS con cero defectos»). Si el director quiere un segundo par de ojos
independiente, el subagente puede repetir el pase sobre los mismos mp4 con los comandos de §«Cómo se inspeccionó».

## Qué cambió respecto a v3

- Narración nueva (Qwen3-TTS Ryan, guion v4, 150-165 ppm; antes Chatterbox 8:31 con guion v3): los 8 bloques se
  reconstruyeron sobre `audio/timings_es.json` (anclas: `qc/ANCHORS_qwen.md`), a **1280x720** por primera vez (v2/v3 eran
  854x480): los chequeos de ojos / cuerpo / ropa corren ahora a 720p, lo que afinó dos encuadres que a 480p pasaban por un
  píxel (ver defectos 2 y 3).
- Dos arreglos de ritmo por la voz (F17_late en «llegue»; G14_off / G16_act2 esperan a que se lean «¡Dale, dale!» y
  «¡Nooo!») y la continuidad del gafete (se queda en la guantera desde H03_back) comprobada en el render de E2.

## Resultado automático final (review 720p)

| Bloque | s | MB | fotogramas clave | ojos | fallos pupila | fallos cuerpo | avisos | dibujos ropa | fallos ropa | pop (eventos / fotogramas) |
|---|---|---|---|---|---|---|---|---|---|---|
| A | 43,6 | 9,6 | 59 | 125 | 0 | 0 | 0 | 113 | 0 | 13 / 1304 |
| B | 54,9 | 12,2 | 77 | 217 | 0 (1 medida en ojo de 3,6 px: ver §tiny) | 0 | 0 | 125 | 0 | 22 / 1643 |
| C1 | 48,7 | 6,0 | 28 | 60 | 0 | 0 | 0 | 31 | 0 | 19 / 1461 |
| C2 | 89,8 | 17,9 | 46 | 107 | 0 | 0 | 0 | 83 | 0 | 70 / 2693 |
| D1 | 71,3 | 13,5 | 47 | 170 | 0 | 0 | 0 | 88 | 0 | 4 / 2139 |
| D2 | 80,8 | 16,9 | 92 | 233 | 0 (1 medida en ojo de 3,0 px: ver §tiny) | 0 | 37 (pegatina PROMEDIO junto al auto, como en v3: no tapa cara) | 166 | 0 | 67 / 2425 |
| E1 | 52,9 | 9,0 | 22 | 76 | 0 | 0 | 0 | 44 | 0 | 8 / 1585 |
| E2 | 72,4 | 15,9 | 96 | 238 | 0 | 0 | 0 | 186 | 0 | 30 / 2167 |

- Cuadros de texto (`textbox_check.mjs --blocks`, 720p, 21 líneas): 0 fallos; cada cuadro cubre su hueco y su tiempo de
  lectura, nunca una cabeza, el borde ni la banda inferior.
- Laboratorio de ropa: sin cambios en `cast.js` / `cast_alts.js` desde el PASS v3 (último cambio 2026-10-18, commit 13d1ea8):
  vale `qc/clothes_lab.json` (1170 celdas, 0 fallos).
- Ritmo (`qc/QC_block<X>.md`): cortes/min 17-28 (≥ 12), plano medio 2,1-3,3 s (≤ 5), sin congelados ni negros, −14,0/−14,1
  LUFS por bloque. FLAG solo en `wpm_overall` (A, D2, E1, E2: pausas largas del guion y los 20 s de pantalla final).
- §tiny: dos muestras de Mila entre los observadores (B08_dial 21,2 s, D2 F02_back 6,0 s) miden el ojo en 3,0-3,6 px (el
  umbral «tiny» del chequeo es < 3 px): el detector cuenta 50 % de pupila oscura frente al 55 % exigido. Recorte ampliado
  ×4 visto a ojo (`scratchpad/qc/fr/B08_crop.png`): ojos entreabiertos de «thinking» con la pupila presente; a tamaño
  teléfono se lee como lo que es. No es defecto; queda anotado para subir el umbral «tiny» a 4 px en 720p.
- `pop_check.py` por bloque (todos los fotogramas, celdas dentro de las cajas de Eli / Mila): cada evento STEP / FLASH
  revisado a ojo en las hojas (`scratchpad/qc/pop_<X>_small.jpg`). Lo que queda: cortes de plano, postes y cerca que pasan
  tras el auto (D2 F10 / F12: 39 «flash» de un fotograma = los postes a ×4), tapacubos que giran (A04, E2 J03), rayas de
  carril (C1 C07), luces de freno de la simulación (B22), luciérnagas de noche (C2 D17-D26), parpadeos de 3 fotogramas
  (A14, C01, E2 K05), el giro escalonado de B06 (7 vistas, cada giro en 0,12 s por el perfil: diseño v3) y el salto al
  levantarse con las palomitas en C2 D05_late (continuo, 4 fotogramas, arco por fuera de la cara: diseño v3).

## Defectos encontrados en este pase y arreglados (3) + 2 errores propios corregidos

Tiempos en segundos del bloque. Evidencia: `qc/guardian_v4_evidence_small.jpg` (antes / después).

| # | Bloque / plano / t | Personaje | Parte | Defecto | Arreglo |
|---|---|---|---|---|---|
| 1 | B · B21_walk 50,6-51,4 (fin del plano) | Mila | cara (encuadre) | con la voz nueva el plano dura más y Mila, caminando con el embotellamiento, llega a la esquina superior derecha **bajo la rama desenfocada** del primer plano: cara tapada por las hojas (0 % pupila, sin blanco) | opción `noBranch` en `art/scenes/ring_field.js` (`E.drawRing`), usada en B21_walk: el plano va sin rama; Mila entera y de cara a cámara hasta el corte |
| 2 | C1 · C08_hat 24,7-27,9 | Mila | cabeza (borde) | a 720p la zona de la cabeza cruzaba el borde izquierdo (x −8) en todo el plano del sombrero: Mila a `toX(auto) − 430` | `− 375` (+55 unidades): cabeza entera con margen, sin tocar el auto de Eli |
| 3 | D1 · E18_one 69,4 (último fotograma del bloque) | Mila | cabeza (borde inferior) + color | entre los observadores de la vista ×1,9 que sigue al auto computadora, Mila quedaba cortada por el borde inferior al final del bloque (solo coleta; «no sweater purple») | el plano no dibuja al dúo entre los observadores (`hero: () => true`): a esa escala eran 60 px y no aportan; el extra del trípode sigue |
| — | unión del piloto (`build_episode.py`) | — | sincronía | los mp4 de bloque se muxeaban con `-shortest` y perdían 1-4 fotogramas finales (cebado AAC): al encadenar los 8 bloques la imagen se iba retrasando hasta 0,3 s en E2 respecto a la mezcla continua | el piloto se une con el vídeo exacto de cada bloque (`<build>/<B>/video.mp4`, 15 430 fotogramas = Σ round(dur·30)) y sin `-shortest`; los 8 mp4 de bloque re-muxeados |
| — | D2 F17_late, E1 G14_off / G16_act2 | — | lista de planos | al re-apuntar las anclas metí comentarios `//` en medio de la línea y se comieron `bg`, `label`, `focus`, `push`, `zBase`, `over` de los 3 planos (primer render de D2 y E1 sin tira superior ni sello ACELERADO) | comentarios `/* */`; los dos bloques se re-renderizaron y pasaron el QC completo |

Revisado a ojo y sin defecto: las 8 hojas de caras (`qc/faces_block<X>_small.jpg`: emoción correcta por beat, pupilas,
cejas sobre la piel, bocas de grito con dientes y lengua, aretes, gorro), E2 H03_pop → J03 (gafete en la guantera, pecho
limpio en los 7 planos), E1 G13 / G15 (cuadros «¡Dale, dale!» y «¡Nooo!» sobre Eli en el puente, cola a la cabeza, Mila
entera), D2 F16 / F17 (las dos tiras con rótulos ELI MANEJA / MILA MANEJA y el resorte), C2 D20 (tarjetas regionales).

## Cómo se inspeccionó

- `CHUNK=600 TMPD=<scratch>/build/<X> ./build_block.sh <X> review` (720p, 2 Chromium, PNG borrados por tramo).
- `OUT=1280x720 TMPD=<scratch>/qc ./body_audit.sh <X>` → `faces_check.py` (pupilas, encuadre) + `body_check.py` (cuerpo,
  colores, apoyo, escala, rótulos) + `clothes_check.py block` (prendas por vista, trazos sueltos, saltos +1/30 s).
- `pop_check.py block<X>_review.mp4 events.json <X> qc --body qc/body_<X>.json --sheet …` (cada fotograma) y recortes
  fotograma a fotograma de cada evento dudoso (ffmpeg) leídos a ojo.
- `textbox_check.mjs --dir … --out 1280x720 --blocks <X>`.
- `qc_block.py` (ritmo, negro / congelado / silencio, sonoridad) en cada mp4.
- Disco: un bloque a la vez, `df` antes de cada render, fotogramas borrados tras codificar cada tramo de 600.

## Evidencia y registro

- `qc/guardian_v4_evidence_small.jpg`; hojas de caras `qc/faces_block<X>_small.jpg`; números `qc/faces_<X>_after.json`,
  `qc/body_<X>.json`, `qc/clothes_<X>.json`, `qc/pop_<X>.json`, `qc/textbox_check.json`, `qc/summary_block<X>.json`.
- Clases nuevas en `art/characters/leo_mila/GUARDIAN_LOG.md` (2026-10-24): cara bajo un elemento de primer plano
  desenfocado; encuadres que pasaban por un píxel a 480p; personajes diminutos entre observadores en el borde del
  último fotograma de un bloque; comentarios de línea en las listas de planos.

## Pase independiente del Guardián (2026-10-24, subagente `guardian-eli-mila`; cierre 2026-10-28)

**Veredicto del pase independiente: PASS** — después de arreglar 2 defectos que el pase del compositor no vio (los dos de la
misma clase: utilería cruzando una cara entre dos fotogramas clave). Antes de los arreglos el veredicto era **BLOCK**.

### Qué se inspeccionó

- Los 8 `block<X>_review.mp4` (1280x720, 514,3 s): fotogramas a **2 fps** (1029) en hojas de contacto, y **cada fotograma (30 fps)**
  alrededor de las **21 líneas** de cuadro de texto (aparición − 0,3 s … desaparición + 0,3 s, con los tiempos v4) y de los
  **6 momentos clave** (A08_yell 17,5 s · B16_shrugs 84,3 · C14_queyoque 145,7 · F19_late 372,4 · G13_dale 429,4 · I07_you 475,4,
  ± 1,2 s); recortes de cabeza a pies vistos a ojo (al tamaño de entrega y de teléfono) de todo lo dudoso.
- Automáticos re-ejecutados a 720p: `body_audit.sh` (ojos + cuerpo + ropa), `pop_check.py` (cada fotograma, eventos con eventos v4
  regenerados), `textbox_check.mjs` (21 líneas) y el **chequeo nuevo `face_cross_check.py`** (ver abajo).
- Continuidad de utilería guion → pantalla: el gafete «SI SE ABRE UN HUECO, CIÉRRALO» está en el pecho de Eli de «¡Mi lema!» (D1
  27,1 s) a H03_pop y **se queda en la guantera desde H03_back** (pecho limpio en H03_back … K06, E2 10,5-72,4 s, incluido «Fuiste
  tú.» 33,2 s); «Vamos por partes.» (C1 C01, 0-1,5 s: Mila, contenta, con el gesto de la palma, sin sello) concuerda con los sellos ACELERADO ×3 de C06-C08 (visto en C08_hat), sin la contradicción «más despacio» (M2); la lupa, la bandera, el
  balde de palomitas y el sándwich siguen su arco.

### Defectos encontrados y arreglados

| # | Bloque / plano / t (bloque · episodio) | Personaje | Parte | Defecto | Arreglo |
|---|---|---|---|---|---|
| 1 | E1 · G17_wave 46,67-46,77 s · 435,8 s | Mila (y Eli) | cara | al bajar el brazo tras la ola, la bandera de Eli (en la mano del lado de Mila) seguía vertical media rampa y luego giraba 180° en 3 fotogramas: **la tela y el asta pasaban por el ojo y la boca de Mila** (46,70-46,73 s); al subir, la tela cruzaba el gorro de Eli (46,27 s) | `shots_blockE1.js`: bandera en la mano lejana (`hands.trail`), inclinada lejos de Mila, gira por el lado libre con k² a lo largo de toda la rampa; asta 230 → 205; los 2 extras de la izquierda 50 px más lejos |
| 2 | C2 · D06_plate 21,87-21,93 s y 22,23 s · 169,0 / 169,3 s | Eli | cara | en el plano ancho, el balde de palomitas subía del regazo a la mano del otro lado de la cabeza: **tapaba el ojo** (21,90 s) y, al bajar, **la mejilla y la boca** (22,23 s) (el arco v3 solo funcionaba en el primer plano D05_late) | `shots_blockC2.js`: el balde va a la mano levantada del lado del regazo; nunca cruza la cabeza en D05_late ni en D06_plate |

Los dos bloques se re-renderizaron a 720p (`build_block.sh … review`) y se re-auditaron completos; el piloto se volvió a unir
(`build_episode.py --reuse-wav`, misma mezcla): `ep001_piloto_v4_720p.mp4` 514,33 s, 101,06 MB, −14,0 LUFS / TP −2,0 dBTP;
`ep001_piloto_v4_480p.mp4` 27,0 MB; `ep001_piloto_v4_small.jpg` 218 KB (scratchpad, fuera de git). Los dos arreglos comprobados en el
piloto unido (435,79 / 435,82 s y 169,02 / 169,35 s). Evidencia antes / después: `qc/guardian_v4_independent_evidence_small.jpg`.

### Resultado automático final (720p, después de los arreglos)

| Bloque | fallos pupila | fallos cuerpo | fallos ropa | cruces de cara (`face_cross_check`) | pop (eventos, todos vistos) | cuadros de texto |
|---|---|---|---|---|---|---|
| A | 0 | 0 | 0 | 1 (A19_bonk 40,4 s: gag del punto del logotipo sobre el gorro, ojos libres — declarado) | 13 | 3/3 |
| B | 0 (1 ojo de 3,6 px, B08 21,2 s, visto: pupila presente) | 0 | 0 | 0 | 22 | 2/2 |
| C1 | 0 | 0 | 0 | 0 | 19 | 2/2 |
| C2 | 0 | 0 | 0 | 0 (antes 2) | 70 | 2/2 |
| D1 | 0 | 0 | 0 | 0 | 4 | 1/1 |
| D2 | 0 (1 ojo de 3,0 px, F02 6,0 s, visto) | 0 (37 avisos: pegatina PROMEDIO junto a las piernas, sin cara) | 0 | 0 | 67 | 6/6 |
| E1 | 0 | 0 | 0 | 0 (antes 2) | 7 | 2/2 |
| E2 | 0 | 0 | 0 | 0 | 30 | 3/3 |

Los eventos del pop check son parpadeos, visemas, aparición de cuadros, extras que ríen, luciérnagas, postes a ×4, tapacubos y
los giros / saltos ya aprobados en v3 (B06, C2 D05_late); ninguno es una prenda, un miembro o una cara que salte.

### Chequeo nuevo (obligatorio desde este pase)

`face_cross_check.py` (CHARACTERS.md §5.15 y §6e): decodifica cada fotograma, interpola los discos de cabeza del registro del
kit entre fotogramas clave y mide el color que una cabeza no puede tener (teal, rojo / bermellón, azul saturado) por encima de
la línea base del plano: los dos defectos de este pase salían en él (y no en los chequeos de fotogramas clave ni en el pop check,
que los leía como «parpadeo»). Jsons: `qc/facecross_<X>.json`.

### Notas honestas

- La primera pasada de recortes densos usó por error el `qc/textbox_check.json` de v3 (voz Chatterbox); se regeneró a 720p con la
  voz v4 (21 líneas, 0 fallos, json actualizado) y las ventanas se volvieron a extraer: lo inspeccionado corresponde a v4.
- El balde de palomitas toca el borde superior en C2 D05_late 19,6-20,3 s (utilería, como en v3); Eli entero.
