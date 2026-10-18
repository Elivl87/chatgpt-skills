# Prueba A/B de estilo · «actual» (cine) vs «plano» (flat) · gancho del EP001 (0:00-0:30) · 2026-10-18

**Pregunta del Productor:** ¿qué ganaríamos (y perderíamos) si el canal se dibujara como el competidor plano (contornos
negros gruesos y uniformes, colores planos, sin luz/grano/neblina, edificios de rectángulos, cámara fija, planos largos,
barra de texto arriba, burbujas de pensamiento con iconos)? Para responder con hechos y no con opinión, el MISMO pasaje
(gancho, beats 1-3, de 0:00 hasta la primera palabra del beat 4 = 30,04 s en los tiempos Chatterbox; incluye el cuadro
«¡¿QUIÉN FUE?!» de Eli) se renderizó dos veces con la MISMA narración, los MISMOS tiempos y la MISMA cama «Cine suave»:

- **A · actual** = el bloque A tal cual (14 planos en 30 s, 854x480 borrador, cámara que respira, luz, grano, neblina).
- **B · plano** = modo nuevo `STYLE=flat` (`art/lib/flat.js` + `ep/001/animatic/shots_blockA_flat.js`, escena
  `ep001_Aflat`, `?style=flat`): 3 planos sostenidos, deslizamientos y balanceos simples, fondos de 2-3 tonos, Eli y Mila
  con el mismo diseño pero recortables (ojos ovalados blancos con pupila grande + cejas gruesas, boca simple; solo cambian
  cara y brazos), barra de texto arriba con la frase clave de cada beat, burbuja de pensamiento con iconos para el gag «ni
  choque, ni conos, ni semáforo» (y una con una nota para el que toca el freno), cuadros de texto planos.
  Los autos siguen siendo la simulación S1 real (el arte sigue siendo la piel de la simulación; la píldora ACELERADO ×n
  sigue en pantalla).

Archivos: `ab_flat_vs_cine.mp4` (A arriba, B abajo, 854x960, mismo audio), `ab_contact_small.jpg` (1 cuadro / 2 s),
`build_ab.sh` (reproduce todo), `contact.py`. Lo existente no cambia: el modo plano es código aditivo (un `.js` nuevo en el
kit, un bloque nuevo en el animatic, dos `<script>` en `index.html`); el render de `ep001_A` es idéntico píxel a píxel
(prueba abajo).

## Números (honestos)

| | A · actual | B · plano |
|---|---|---|
| segundos de render por cuadro (854x480, 1 worker Chromium, `nice -n 10`, CPU compartida con el Guardián) | **200 ms/cuadro** (901 cuadros en 180,0 s) | **13 ms/cuadro** (901 cuadros en 12,0 s) |
| factor | 1× | **≈ 15× más rápido** |
| planos en los 30 s | 14 (A01-A13_bird; promedio 2,1 s) | 3 (F01_tap 7,9 s · F02_wave 9,3 s · F03_quien 12,8 s) |
| líneas de lista de planos (solo el pasaje) | 199 líneas de `shots_blockA.js` (hasta el gag del pájaro) + apoyos compartidos `anim_hw.js` (cámara perspectiva, close-up), `props.js` | 144 líneas de `shots_blockA_flat.js` |
| código de kit que lo sostiene | ~6 700 líneas (`art/lib/*.js`, escenas, sims) | 396 líneas nuevas (`flat.js`) sobre el mismo `anim.js`, `sim`, timings |
| auditoría de ojos (faces_check) en los cuadros clave | 2 fallos / 113 ojos en todo el bloque (los 2 están en el pasaje, QC del Guardián en curso) | **0 fallos / 36 ojos auditados** (32 «tiny»: en los planos anchos las caras miden < 3 px de ojo y no se auditan) |
| auditoría de cuerpo (body_check: solapes, cabezas cortadas, colores, flotando) | 0 fallos / 0 avisos (36 cuadros del pasaje) | **0 fallos / 0 avisos** (17 cuadros) |
| auditoría de ropa (clothes_check: colores, trazos sueltos, pops en 1/30 s) | 0 fallos (pasaje) | **0 fallos** (34 dibujos) |
| tamaño del mp4 de 30 s solo (crf 18) | 31,3 MB | 0,97 MB |

Notas sobre las auditorías en B: el log de ojos/cuerpo lo emite `K.flat.cast` con el mismo formato que `K.cast.draw`
(`__faceLog`: ojos en px, caja del personaje, familias de color de la ropa), así que `faces_check.py`, `body_check.py`
y `clothes_check.py` corren sin cambios. Lo que NO mide en B: `thin` (trazos sueltos) no aplica (no hay cordones ni
tirantes finos: todo es recorte grueso) y el audit de texto (`textbox_check.mjs`) no se adaptó al cuadro plano (la cola
es un triángulo que para a 1,3 r de la cabeza, verificado a ojo). Primer pase de B: 30 fallos de pupila (un bug de
altura del párpado tapaba la pupila y hacía que «furioso» leyera como «dormido») -> corregido -> 0.

## Qué se ve (mirado cuadro a cuadro, `Read` de los stills a 480p y 1080p)

- **B lee claro y rápido**: la barra de texto hace el trabajo del ritmo de corte; la ola de luces de freno se entiende en
  UN plano fijo (de hecho mejor que en A, donde la ola está repartida en 3 cortes). Las emociones de Eli y Mila en el
  plano 3 leen a tamaño de teléfono (cejas gruesas + boca grande: enojado, furioso, curioso, neutral, pícara).
- **B pierde**: toda la luz dorada (lo que el Productor eligió el 10-14 como «este tipo de arte»); la profundidad; el
  pájaro y la nota como gag visual son más pobres sin el inserto del pájaro; en los planos anchos Eli y Mila son puntos
  (igual que en A, pero A compensa con el close-up A04/A07 que B no tiene). El fondo de 2-3 tonos se repite: a los 30 s
  ya se ha visto todo lo que el mundo plano puede mostrar. Las manos y brazos de recorte (palitos con guante) se ven
  toscos en el plano cerrado.
- **La diferencia de identidad**: B se parece al competidor (ese es el riesgo: «contenido plantillado»); A no se parece a
  nadie en YouTube ES.

## Estimación de tiempo de producción por episodio (≈ 7 min, 8 bloques, ~200 planos)

Medido en este pasaje y extrapolado:

| fase | A · actual | B · plano |
|---|---|---|
| render borrador 480p (CPU, 2 workers) | ~35-40 min por pasada (≈ 200 ms/cuadro) × 3-5 pasadas de QC = **2-3 h** | ~2-3 min por pasada = **< 15 min** |
| render final 1080p | ~3-4 h (×4-5 px) | ~15-20 min |
| escribir / afinar la lista de planos | ~200 planos keyados a palabras: **2-3 días de agente** (es donde se fue el tiempo del EP001: cámara, continuidad, blends del Guardián) | ~45 planos sostenidos: **1 día** |
| QC del Guardián (ojos/cuerpo/ropa/pops) | 1-2 días (113 dibujos auditados solo en A; 3 pases de fixes) | medio día (17 dibujos por bloque equivalente; un rig de recorte casi no puede fallar) |
| **total estimado** | **≈ 5-7 días de agente + ~6 h de CPU** | **≈ 2 días de agente + < 1 h de CPU** |

O sea: **B ahorra ~60-70 % del tiempo de producción** (sobre todo tiempo de agente en planos y QC; la CPU nunca fue el
cuello de botella real). El coste es la identidad visual y la decisión de arte ya tomada.

## Prueba de que lo existente no cambió

`ep001_A` renderizado con el `index.html` nuevo (con `flat.js` + `shots_blockA_flat.js`) y con una copia sin esas dos
líneas: md5 idénticos cuadro a cuadro (4 cuadros de prueba a 1,0 / 7,1 / 18,5 / 28,9 s, `ImageChops.difference` vacío y md5 iguales; además `highway_golden` (style frame a) renderiza sin error con el kit nuevo cargado). `art/scenes/index.html` (los style frames a-e) no carga `flat.js`.

## Mi opinión como Dirección de Arte

**B no es el estilo de este canal, pero el experimento enseña tres cosas que sí quiero robar para A.**

1. **Lo que B hace mejor es dirección, no dibujo.** La barra de texto arriba y los planos sostenidos hacen que el gancho se
   entienda sin esfuerzo; A corta 14 veces en 30 s y en el ancho la ola de frenos se pierde entre cortes. Propongo para A:
   una **barra de frase clave** opcional (en el papel del canal, no en blanco plano) en los beats explicativos, y
   **menos cortes** en el beat 2 (la ola en UN plano con la cámara quieta, como F02). Esto no toca el arte aprobado.
2. **La burbuja de pensamiento con iconos** (ni choque / ni conos / ni semáforo) es más graciosa y más legible que las tres
   tarjetas que vuelan en A12. Hay que llevarla a A con el panel de papel que ya existe (`K.tbox.panel`).
3. **El ahorro real está en el tiempo de agente (planos + QC), no en la CPU.** Un rig de recorte (solo cara + brazos)
   pasó las tres auditorías a la primera (tras un bug mío de párpado); el rig cinematográfico necesitó tres pases del
   Guardián. Si el Productor quiere publicar más seguido, la palanca es simplificar el *acting* (menos poses, blends
   más largos, menos vistas) manteniendo luz, grano y profundidad, no cambiar de estilo.

**Por qué no B como estilo:** (a) el Productor eligió «este tipo de arte» (luz cinematográfica) el 10-14 y lo cerró el 10-15;
B tira exactamente eso; (b) B se parece al competidor y a cien canales más: el canal perdería lo único que lo distingue a
primera vista en el feed (y roza «contenido plantillado»); (c) a los 30 s el mundo plano ya se agotó visualmente; en
7 minutos cansa. **Recomendación: quedarnos en A, adoptar 1-3 de B.** Si el Productor prefiere B, el modo `style=flat`
queda listo como opción (0,97 MB / 13 ms por cuadro) y se puede extender al bloque B en un día.
