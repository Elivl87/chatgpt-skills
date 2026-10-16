# Guardián de Eli y Mila · informe · animatic v2 (ep001, 8 bloques draft 854x480)

**Veredicto: PASS** (2026-10-16). Cero defectos abiertos de la punta del cabello a la punta del pie en los 8 bloques
(`block{A,B,C1,C2,D1,D2,E1,E2}_draft.mp4`) y en la vista previa unida (fuera de git, reconstruida desde estos bloques).

## Cómo se inspeccionó

- **Una sola pasada de render** de los fotogramas clave de actuación (inicio / medio / fin de cada plano, cada palabra de
  Eli o Mila, cada golpe de sonido): `body_audit.sh` → `faces_audit.mjs` (ahora también registra la caja ajustada de los
  píxeles propios de cada personaje, colores del vestuario, punto de apoyo, extras y todos los rótulos / globos) →
  `faces_check.py` (ojos) + `body_check.py` (cuerpo, nuevo). 466 fotogramas, ~1 000 recortes de personaje.
- **A ojo**: páginas de cuerpo completo (fotograma a tamaño teléfono con cajas + recortes de cabeza a pies) a draft y a
  1920x1080, todas leídas: pelo/gorro, cara, ojos, cejas, boca y sincronía, emoción contra el guion, brazos, manos,
  postura, cada prenda y color, pies/suelo, luz de borde, encuadre, rótulos, continuidad de utilería y extras.
  Planos lejanos (Eli/Mila de 10-20 px): siluetas y colores revisados (amarillo / morado legibles, sin bermellón).
- Laboratorio para reproducir poses: `art/scenes/guardian_lab.js`.

## Resultado automático final (draft)

| Bloque | fotogramas | ojos auditados | fallos de pupila | fallos de cuerpo | avisos (mirados) |
|---|---|---|---|---|---|
| A | 58 | 118 | 0 | 0 | 0 |
| B | 79 | 139 | 0 | 0 | 0 |
| C1 | 26 | 58 | 0 | 0 | 0 |
| C2 | 48 | 99 | 0 | 0 | 0 |
| D1 | 45 | 107 | 0 | 0 | 0 |
| D2 | 92 | 191 | 0 | 0 | 40 (regla «m» y pegatina PROMEDIO junto al auto: no tapan a nadie) |
| E1 | 21 | 68 | 0 | 0 | 0 |
| E2 | 97 | 244 | 0 | 0 | 0 |

Antes de los arreglos el chequeo de cuerpo daba 98 fallos de cuerpo y 170 avisos (A 4, B 4, C1 4, C2 6, D1 24, D2 7,
E1 37, E2 12 + los que solo se ven a ojo).

## Defectos encontrados y arreglados (28)

Tiempos en segundos del bloque. «kit» = arreglo en `art/lib` / `art/scenes` (vale para todo lo futuro).

| # | Bloque / plano / t | Personaje | Parte | Defecto | Arreglo |
|---|---|---|---|---|---|
| 1 | A14_turn 28.4-31.0 (y A12/A13) | Eli | mano | de espaldas, el puño de la visera pintado sobre la nuca | kit: en vistas de espaldas las manos delante de cara/pecho (visera, lupa, mentón, brazos cruzados, aplauso, regazo, portapapeles) quedan detrás del cuerpo |
| 2 | A15_back 31.3-32.5 | Mila | brazo | de espaldas 3/4, antebrazo cruzado dibujado sobre la espalda | kit (mismo arreglo) |
| 3 | A14_turn | Eli | espalda/gorro | un cable eléctrico cruzaba en zigzag su espalda y gorro | kit `highway_golden`: los vanos de cable detrás del auto del dúo se dibujan antes que él |
| 4 | A14_turn | Eli | gorro | gorro cortado por el borde superior | encuadre: punto de mira y 520 → 600 |
| 5 | A09_visor 16.8-18.2 (y E1 G04) | Eli | cejas | el puño de la visera tapaba ambas cejas | kit: `visor` al ala del gorro / nacimiento del pelo |
| 6 | A08/A09, D2 F03, E1, E2 (globos) | Eli/Mila | cara | la cola del globo cruzaba gorro, ojos y cara hasta la boca | kit `bubble`: la cola termina al lado de la cabeza |
| 7 | B06_finger 14.2-18.4 | Eli | proporción | Eli tan alto como Mila lado a lado (u 640 vs 560) | u 580: alturas 0.95 / 1.08 |
| 8 | B07_drivers 18.7-20.5 | Eli | gorro | el rótulo «RECREACIÓN ILUSTRADA» tocaba el gorro (pendiente conocido) | Eli bajado (y 1010 → 1048), el rótulo queda libre |
| 9 | B23_scratch 52.8-53.3 (toda pose «scratch» / avergonzado) | Eli/Mila | mano/cejas | el puño de rascarse sobre la ceja y el ojo | kit: `nape` en el borde de atrás de la cabeza a la altura de la sien (de frente: a un lado del gorro) |
| 10 | C1 C01_slow 0-1.5 | Mila | cola de caballo | cabeza cortada por el borde superior | encuadre y 600 → 552 |
| 11 | C2 D05_late / D06_plate 15.6-20.8 | Eli | utilería | el balde de palomitas desaparecía al pararse y en D06 | el balde va con Eli: en el regazo sentado, en la mano al pararse |
| 12 | C2 D13_upsi 41.3-42.2 | Eli | puesta en escena | de pie sobre el césped en pose de manejar sin auto (es uno de los 3 autos que cayeron) + banda oscura arriba | Eli sentado en su auto turquesa, sorpresa → avergonzado; encuadre corregido |
| 13 | C2 D18_wave 60.7 | Eli+Mila | cabezas | la placa «10 km» encima de los dos en la colina | placa a la mitad de la regla, sobre la carretera |
| 14 | D1 E06_instr 17.0 | Mila | brazo | la placa «¡NO ARREGLEN NADA!» rozaba su brazo | placa 30 px a la izquierda |
| 15 | D1 E06_waves 17.4-18.2, E09_distinct 25-27 | Eli+Mila | encuadre | cortados en la esquina, bajo la línea de fuente (la cámara sigue la ola / la computadora) | fuera de esos planos (el auto es el sujeto) |
| 16 | D1 E09-E18 (anillo) | Eli | utilería | el gafete «SI SE ABRE UN HUECO» desaparecía en los planos del anillo | `heroAfter` en `ring_field`: el gafete sigue puesto |
| 17 | D1 E15_80 50.1-51.3, E17_40 58-60 | Eli/Mila | gorro/coleta | el medidor «−80 %» / «hasta −40 %» tocaba el gorro y la coleta | medidores reubicados |
| 18 | D1 E15/E17 | Eli | gafete | con brazos cruzados el gafete quedaba sobre los antebrazos | gafete alto en el peto cuando cruza los brazos |
| 19 | D2 F10_sticker 22-25 | Eli+Mila | gorro/coleta | cortados por el borde superior | encuadre z 2.6 → 2.5, wy 700 → 664 |
| 20 | D2 F12_friend 30.7 | Eli | emoción | se gira enfurruñado pero con marcas de sorpresa | «grumpy» todo el giro |
| 21 | D2 F09/F13/F14 31-35.6 | Eli+Mila | continuidad/encuadre | dibujados también como observadores del anillo mientras van dentro del auto (Mila maneja); cortados en la esquina | ocultos desde que Mila toma el volante |
| 22 | D2 (todo), E1 (todo), E2 I05 | Eli | utilería | el gafete faltaba entre «¡Mi lema!» (D1) y la guantera (E2) | `def.eliBadge`: gafete en todo Eli de frente / 3/4 (la puerta del auto lo tapa cuando toca); el gafete muestra su texto cuando es legible (igual que en la guantera) |
| 23 | E1 G13_dale 35.3-36.2, G15_nooo 39.7-40.4 | Mila | cabeza | el globo de Eli tapaba la cabeza de Mila | globo arriba a la izquierda (`side: -1`) |
| 24 | E1 G15_nooo 40.0-40.4, G18_mila 44.5-45.4 | Mila | coleta/cabeza | cortada por el borde superior | personajes más chicos en cuadro (u 820 → 740, 880 → 760) |
| 25 | E2 H01_same 0.7-1.3 | Eli+Mila | auto | la placa «TÚ TAMBIÉN» tapaba el auto del dúo | placa al cielo (y 300) |
| 26 | E2 H02_gap, H05_same, I03_ots | Eli | gorro/espalda | el resorte del hueco cruzaba el gorro y la espalda | resorte en la capa del suelo (bajo autos y personajes) |
| 27 | E2 H04_breathe 12.3-13.6 | Eli | cara | las marcas «tap» flotaban junto a la cara | bajadas al volante |
| 28 | E2 I07_you 32.5-33.0 | Eli | cara | el dedo de Mila tapaba nariz y boca de Eli | Mila señala más bajo, al gafete |

## Revisado y correcto (sin cambio)

Ojos en todos los planos (0 fallos); bocas con visemas alternos en cada línea; emociones contra cada beat del guion;
ropa y colores exactos (gorro 7 costillas + puño, delantal con tirantes planos y bolsillo, botas; jersey, peto, botones,
botas verdes, aretes colgando fuera de la cabeza); pies en el suelo y sombras de contacto; luz de borde solo del lado
iluminado; extras con emociones legibles y sin tapar a los protagonistas; planos lejanos (anillo, estadio, carretera,
pantalla dividida) con siluetas y colores legibles. Pruebas del kit: hoja de modelo y fotogramas a, c idénticos al píxel;
cambios esperados y revisados en b (cola del globo), d (orden de cables), e (brazo de espaldas), hoja de emociones
(columna avergonzado: mano al gorro).

## Evidencia

- `qc/guardian_evidence_small.jpg`: antes (commit 612da06) / después de los arreglos principales.
- Hojas de caras `qc/faces_block<X>_small.jpg`; números `qc/faces_<X>_after.json`, `qc/body_<X>.json`.
- Registro de clases de defecto: `art/characters/leo_mila/GUARDIAN_LOG.md`; reglas nuevas: `CHARACTERS.md` §6c.
