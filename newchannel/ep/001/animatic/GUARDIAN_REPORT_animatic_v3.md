# Guardián de Eli y Mila · informe · animatic v3 (ep001, 8 bloques draft 854x480, narración Chatterbox 8:31)

**Veredicto: PASS** (2026-10-18). Cero defectos abiertos de la punta del cabello a la punta del pie en los 8 bloques
(`block{A,B,C1,C2,D1,D2,E1,E2}_draft.mp4`, 511,3 s = la narración clonada de 511,34 s) y en la vista previa unida
(`ep001_animatic_preview_v3.mp4`, fuera de git: 854x480, 8 min 31 s, 27,9 MB).

## Qué cambió respecto a v2

- Narración nueva (voz clonada del Productor, Chatterbox): todos los bloques se reconstruyeron sobre
  `audio/timings_es.json`; la suma de bloques coincide con el wav (511,3 s) y el ritmo de cada bloque pasa
  (`qc/QC_block<X>.md`: cortes/min >= 12, plano medio <= 5 s, sin congelados > 2 s, 137-143 ppm donde se mide).
- Movimiento fotograma a fotograma (`pop_check.py`, 15 338 fotogramas decodificados) además de los fotogramas clave.

## Resultado automático final (draft)

| Bloque | s | MB | fotogramas clave | ojos | fallos pupila | fallos cuerpo | avisos | dibujos ropa | fallos ropa |
|---|---|---|---|---|---|---|---|---|---|
| A | 46,2 | 5,97 | 60 | 113 | 0 | 0 | 0 | 113 | 0 |
| B | 56,6 | 7,86 | 76 | 138 | 0 | 0 | 0 | 126 | 0 |
| C1 | 46,1 | 3,82 | 26 | 58 | 0 | 0 | 0 | 30 | 0 |
| C2 | 91,2 | 12,31 | 46 | 95 | 0 | 0 | 0 | 83 | 0 |
| D1 | 67,4 | 8,27 | 48 | 111 | 0 | 0 | 0 | 85 | 0 |
| D2 | 75,7 | 9,87 | 89 | 181 | 0 | 0 | 34 (pegatina PROMEDIO junto al auto, mirada: no tapa cara) | 160 | 0 |
| E1 | 54,5 | 6,01 | 22 | 72 | 0 | 0 | 0 | 44 | 0 |
| E2 | 73,7 | 9,55 | 99 | 241 | 0 | 0 | 0 | 192 | 0 |

- Cuadros de texto (`textbox_check.mjs`, 21 líneas): 0 fallos (`qc/textbox_check.json`).
- Laboratorio de ropa: 1170 celdas, 0 fallos (`qc/clothes_lab.json`).
- `pop_check.py` por bloque (todos los fotogramas): cada evento STEP / FLASH revisado a ojo en las hojas; los que quedan
  son cortes de plano, postes y árboles que pasan, golpes de utilería (bandera, balde) y cuadros de texto que entran o
  salen con su slot de voz.

## Defectos encontrados en este pase y arreglados (6)

Tiempos en segundos del bloque. Evidencia: `qc/guardian_v3_evidence_small.jpg` (antes / después).

| # | Bloque / plano / t | Personaje | Parte | Defecto | Arreglo |
|---|---|---|---|---|---|
| 1 | E1 G17 48.7-49.4, C2 D05/D06 17-18 y ola, C2 D16, E2 H03 7.6-8.1, E2 I04 | Eli, Mila, público | brazos / pose | mezclas de pose por valor con banda 0,16 sobre rampas de 0,14-0,35 s = el brazo sube o baja en 1-2 fotogramas (9 sitios `A.pzv`) | la pose sigue todo el recorrido del valor (`A.pzv(v, 0.5, a, b, 1.0)`, ahora el valor por defecto; `A.ez` por valor con d 0,6) |
| 2 | E2 H03 7.9 | Eli | cuerpo / mirada | giro en espejo de 1 fotograma (`dir` binario) dentro de la mezcla manos juntas -> señalar; salto de mirada | gira por la vista de frente, mirada interpolada |
| 3 | E1 G17 48.8 / 49.3-50.2 | Eli | bandera (utilería) | subía con el brazo pero al bajar quedaba horizontal apuntando a Mila | ángulo = f(pulso del brazo), ida y vuelta |
| 4 | E1 G17 50.0 | Eli | ojos | parpadeo en plena toma de sorpresa (cerrado 3 fotogramas -> abierto en 1; chequeo de ropa: salto de blanco 0,056 -> 0,087) | sin parpadeo desde el vítor hasta el final del plano |
| 5 | C2 D05 17.2 | Eli | cara / utilería | el balde de palomitas cruzaba la cara al subir del regazo a la mano | arco lateral por fuera de la cabeza |
| 6 | D2 F04 8.06-8.2 | Eli | cabeza / cuadro de texto | «¡¿Quién fue?!» en dos líneas tocaba la zona de la cabeza en los 2 primeros fotogramas del plano abierto | una línea (maxW 380) a y 150 |

Revisado a ojo y sin defecto: A14 giro de Mila (continuo), D2 F10 «PROMEDIO» (tapa el auto, no a nadie), D2 F12 /
E2 I04 postes que pasan (no son saltos de personaje), E2 K05 levantarse de la banca (continuo), C1 C02 diagrama
(sigue rodando con la frase larga).

## Cómo se inspeccionó

- `body_audit.sh` por bloque: `faces_audit.mjs` (fotogramas clave: inicio / medio / fin de cada plano, cada palabra de
  Eli o Mila, cada golpe de sonido) -> `faces_check.py` (pupilas, encuadre) + `body_check.py` (cuerpo, colores, apoyo,
  escala, rótulos) + `clothes_check.py` (prendas por vista, trazos sueltos, saltos +1/30 s).
- `pop_check.py` sobre el mp4 completo de cada bloque (celdas de 24 px dentro de las cajas de Eli / Mila, STEP / FLASH,
  hoja antes / ahora / después) y recortes fotograma a fotograma de cada evento dudoso (ffmpeg) leídos a ojo.
- `textbox_check.mjs` (ahora con `--blocks` para rechequear un bloque).
- Ritmo: `qc/QC_block<X>.md` (cortes/min, plano medio y más largo, cuota de movimiento, congelados, ppm).
- Disco: un bloque a la vez, `df` antes de cada render, fotogramas borrados tras codificar.

## Evidencia y registro

- `qc/guardian_v3_evidence_small.jpg`; hojas de caras `qc/faces_block<X>_small.jpg`; números `qc/faces_<X>_after.json`,
  `qc/body_<X>.json`, `qc/clothes_<X>.json`, `qc/textbox_check.json`.
- Clases de defecto nuevas: `art/characters/leo_mila/GUARDIAN_LOG.md` (2026-10-18); regla nueva en `CHARACTERS.md`
  («las mezclas por valor siguen todo el recorrido del valor; los giros pasan por la vista de frente»).
