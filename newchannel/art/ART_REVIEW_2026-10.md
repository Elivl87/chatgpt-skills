# Revisión de arte · Diez Mil Puntos · piloto EP001 (octubre 2026)

Director de arte (Claude), 2026-10-28/29. Alcance: todo lo que se ve en los 8 bloques del piloto (8:34, `ep/001/animatic/block*_review.mp4`, 720p),
el kit (`art/lib/*.js`), las escenas (`art/scenes/*.js`) y las listas de planos (`ep/001/animatic/shots_block*.js`, `anim*.js`).
Método: fotogramas a 0,5 fps de cada bloque (257 en total, hojas de 4×4) más fotogramas a resolución completa en cada momento
sospechoso (2-4 fps). Las cifras de motor (ms por fotograma) se midieron aquí. Los arreglos se verificaron con stills del bloque,
la auditoría automática del Guardián y el chequeo de cuadros de texto.

**Mandato ampliado (Productor, 2026-10-29):** «usamos otro tipo de arte tipo cinematográfico que me encanta… Lo que puedas
perfeccionar de todo el escenario, objetos, personajes, todo lo que se ve, estaría bien». El estilo cinematográfico ilustrado está
cerrado y gusta. Toda mejora debe profundizarlo (luz, atmósfera, profundidad, textura, actuación) y nunca acercarlo a lo plano/vectorial.

Evidencias (todas ≤ 400 KB, en `art/review_2026-10/`):
- `audit_small.jpg`: 12 fotogramas, lo mejor y lo más débil del piloto.
- `fixes_1_small.jpg`, `fixes_2_small.jpg`: antes / después de los 8 arreglos de esta revisión.
- Hojas de caras del Guardián tras los cambios (B, C1, C2, D1, D2, E1): regeneradas en el scratch, 0 fallos nuevos (ver §d).
- Pedidos del Productor durante la revisión: `characters/leo_mila/eli_tono_opciones_small.jpg` (tono de piel) y
  `characters/leo_mila/eli_gorro_opciones_small.jpg` (7 opciones de cabeza para Eli).

---

## Para el Productor

- El arte del piloto está en buen nivel: la carretera dorada, el campo del anillo y los close-ups en el auto ya se ven como la referencia.
- Encontré y arreglé 5 errores que se veían: una mancha negra en una esquina, una ventana con muebles saliéndose y la cara del señor
  tapada por la cruz de la ventana, Eli y Mila sentados en el suelo con las botas encima del regazo, la bandera de Eli que desaparecía
  entre dos planos, y unos rótulos cortados por el borde.
- También mejoré las gráficas (ahora son papel iluminado, no un fondo plano) y agrandé las letras pequeñas para que se lean en el teléfono.
- Lo más débil que queda son unos 40 segundos en vista lateral gris (dos carreteras apiladas y la fila de autos numerados) y
  la escena nocturna, donde Eli y Mila salen diminutos. Son los siguientes en mejorar.
- Se repite mucho un mismo encuadre (los dos de pie junto al campo): hay que variar cámara y poses.
- Ya apliqué la piel de Eli igual a la de Mila. La hoja con 7 opciones de gorro está lista. No vuelvo a renderizar los bloques
  hasta que elijas el gorro, así se renderiza una sola vez.
- Hyperframes: no cambiar de motor. Nuestro motor propio hace mejor el estilo cinematográfico.

---

## (a) Veredicto por área (0-10)

| Área | Nota | Evidencia | Resumen |
|---|---|---|---|
| **Personajes (Eli, Mila)** | **7,5** | `audit_small.jpg` (A 0:14), hojas de caras | Construcción sólida y consistente en frente / 3/4 / perfil / espalda. Ojos y pupilas arreglados (0 fallos en 7 bloques). Ropa limpia (0 fallos de ropa). Emociones legibles. Fallos: piernas al sentarse en el suelo (arreglado), poses repetidas (el dúo «de pie, Mila con brazos cruzados o tablilla» sale ~12 veces), botas oscuras sin borde de luz de noche, faldón del delantal colgando bajo las botas al sentarse en el suelo (C2 colina). |
| **Extras** | 6,5 | C2 0:14 (estadio) | Bien en el anillo y el puente. El público del estadio se lee como papel tapiz (caras clonadas, sin profundidad, sin luz). El comensal de la ventana estaba mal encuadrado (arreglado). |
| **Escenarios: carretera dorada** | **9** | A 0:00 | Es el listón: capas, rayos, neblina, reflejos de calor, ramas de primer plano. |
| **Escenarios: campo del anillo** | 8,5 | B 0:06 | Sombras largas, nubes, árboles con balanceo. Algo repetitivo por la cantidad de minutos que ocupa (B, C2, D1, D2). |
| **Escenarios: close-up del auto** | 8 | A 0:14 | Muy bien. Un encuadre abierto dejaba ver el borde del cielo (arreglado en el kit). |
| **Escenarios: línea lateral nublada (C1, tiras de D2)** | **5,5** | C1 0:16, D2 0:50 | Es lo más débil. Receta de mediodía nublado casi sin luz ni profundidad, autos de ~40 px, caras de 5 px en las tiras de D2. Le añadí una pasada de profundidad (neblina en el horizonte, sombras de nubes, aire), pero la puesta en escena sigue pequeña. |
| **Escenarios: estadio / Domo** | 6,5 | C2 0:24-0:56 | Correcto, pero plano: el césped a rayas sin luz, la rejilla del domo como líneas de ordenador, una división de pantalla con una barra negra simple. |
| **Escenarios: noche (colina, granja)** | 6,5 | C2 1:00 | La atmósfera es bonita (estrellas, luciérnagas, la cinta roja), pero los protagonistas miden unos 40 px y se pierden. La ventana estaba rota (arreglada). La granja vista de cerca no tiene casa alrededor: una ventana flotando en azul. |
| **Escenarios: peaje** | 7,5 | D2 1:16 | Bien resuelto, sale poco. |
| **Escenarios: título / logotipo** | 8 | A 0:40 | Buen final. E2 lo está rehaciendo otro agente (escena del título). |
| **Escenarios: parada de bus (E2, se retira)** | 5 | E2 1:04 | Plana, y se ve una **caja punteada de guía** en la mitad derecha (P0 para el agente de E2 si algún plano sobrevive). |
| **Objetos / utilería** | 7 | fixes | Autos burbuja excelentes en todas las vistas. Gafete, perilla, sándwich y palomitas bien. La bandera tenía un fallo de continuidad (arreglado). La bici está a otra escala que Mila (B 0:52). La guantera de E2 es un plano plano color teal. |
| **Tipografía, rótulos, gráficas** | 6 → **7** | `fixes_2_small.jpg` | Los cuadros de texto de papel son excelentes. Las gráficas iban sobre papel crema plano con letras de 22-26 px (ilegibles en el teléfono): arreglado. Los subtítulos de las placas ocupaban 21-25 px: arreglado. Las citas («Stern et al.», 22 px) se dejan, son referencia. |
| **Animación** | 7 | pop_check / Guardian log | Empujes y derivas según la regla, mezclas de pose y de expresión sin saltos (A.seq / A.ez). Plano medio de 2,6 s. Anticipación en los gags (puño, giro de Mila). Falta: desenfoque de movimiento real en los planos rápidos, más variedad de cámara, peso en los aterrizajes (rebote de la bandera, del sándwich). |
| **Color / grano / luz (acabado)** | 8 | todas | Gradación por escena coherente con ART_BIBLE §5, grano vivo, bloom. Las vistas laterales nubladas desentonan con el resto del piloto (casi todo es dorado). |
| **Global** | **7,3** | | Calidad de entrega alta en ~80 % del metraje. El 20 % restante (vistas laterales, noche, estadio) baja la media. |

---

## (b) Lista priorizada de mejoras

Costo de render medido: **~0,40 s por fotograma a 720p por worker** (2 workers ≈ 5 fps), ~2,2× a 1080p. Un bloque de 80 s a
1080p ≈ 2 400 fotogramas ≈ 18 min.

### P0 · defectos (antes del render final)

| # | Dónde | Qué | Estado | Costo / riesgo |
|---|---|---|---|---|
| P0-1 | D2 `F15_one` (≈40-44 s), F10_wheel (franja de 6 px) y E2 línea 88 (z 1,3-1,4) | **Placa oscura arriba a la izquierda**: con encuadres abiertos la cámara del close-up veía más allá del borde izquierdo de la placa del cielo | **Arreglado en el kit** (`art/scenes/mascot_closeup.js`): copias espejadas del cielo a ambos lados. Los píxeles que ya estaban cubiertos no cambian. Lo hereda E2. | 0 ms; riesgo nulo |
| P0-2 | C2 `D23_dinner` / `D25_bite` (≈80-86 s) | La ventana de la granja: **las patas de la mesa salían por debajo del marco**, la cruz de la ventana pasaba por los ojos y la cara del comensal, y la mano del tenedor flotaba sin brazo | **Arreglado** (`anim_c2.js` `A.window`): el interior va recortado a la ventana, el comensal está en el centro del cristal izquierdo, el travesaño sube, el brazo es completo y el foco de D25 se ajustó | 0; extra (no protagonista) |
| P0-3 | B18 (≈42-44 s), C2 colina D17-D26 (≈58-90 s) | **Sentados en el suelo: las botas quedaban sobre el regazo** como cajas (las piernas no se leían) | **Arreglado en el kit** (`cast.js` kneeAt/ankle con `sitGround`): de frente y en 3/4 las rodillas suben y los pies quedan por delante, bajo la línea de la cadera. La espalda no cambia. B18 se reencuadró para no cortar las botas. | 0; afecta a todo `sitGround` (verificado en B, C2; laboratorio de ropa por correr de nuevo) |
| P0-4 | E1 `G18_mila` (≈47,8 s) | **La bandera desaparecía** entre G17 y G18 (continuidad de utilería) | **Arreglado**: G18 la sigue llevando baja en la mano lejana, igual que termina G17, y el puño cercano sube. Al principio la probé levantada, pero cruzaba el gorro, así que se descartó. | 0 |
| P0-5 | D2 `F16_spring`, `F17_late`, `F17_pass` | Rótulos «ELI MANEJA / MILA MANEJA» **cortados por el borde** o ausentes por el zoom, y en la esquina del reloj | **Arreglado**: van en pantalla, fijados a la parte visible de cada tira, a la derecha y bajo la esquina | 0 |
| P0-6 | E2 parada de bus (≈58-70 s) **[E2: otro agente]** | **Caja punteada de guía visible** (rectángulo a la derecha) | Para el agente de E2: no hornear guías de pantalla final; si la parada se retira, desaparece sola | — |
| P0-7 | C2 colina D26 (≈86-90 s) | **El faldón del delantal de Eli cuelga por debajo de las botas** al sentarse en el suelo | Pendiente: en `cast_alts.js` `apronSkirt`, con `B.seated && sitGround` el faldón tiene que terminar sobre los muslos (y1 ≈ cadera + 0,05) | 0; personaje: necesita al Guardián |
| P0-8 | Todo el piloto | **Render único tras elegir el gorro** (la piel nueva ya está en el kit): los bloques actuales llevan la piel antigua | Pendiente de la decisión del Productor | ~1 h de render a 720p; ~2,2 h a 1080p |

### P1 · mejoras claras de calidad

| # | Dónde | Qué | Estado | Costo render | Riesgo |
|---|---|---|---|---|---|
| P1-1 | `A.paper` (nuevo, `anim.js`) → C1 C02/C11-C12, D1 E03/E11-E12, D2 F01_knob, E1 G19 | **Gráficas sobre papel iluminado**: luz cálida arriba a la izquierda, sombra fría abajo, empaste y fibras horneados una vez, y una luz de ventana que deriva despacio (ningún fotograma estático) | **Hecho** | +2 ms/fotograma | bajo |
| P1-2 | Rótulos de ejes y leyendas (C1, D1, E1) y subtítulo de `P.badge` | Letra de 22-28 px al 70 % → **34 px al 85 %**; subtítulos de placa **≥ 40 px** con contorno de tinta | **Hecho** | 0 | bajo (chequeo de cuadros de texto: 20/20 OK) |
| P1-3 | `A.line` (C1 C03-C10, tiras de D2) | **Pasada de profundidad**: el sol escondido en las nubes, neblina en el horizonte, sombras de nubes que derivan sobre campo y carretera (bajo los autos) y aire | **Hecho** | +3 ms | bajo |
| P1-4 | D2 F16-F18 (≈44-70 s, 26 s) | **Repensar las tiras**: hoy son autos de 40 px y caras de 5 px. Propuesta: una sola tira cada vez a pxm 30 (autos de ~110 px, se ve a Eli/Mila al volante), con un corte o barrido entre «Eli maneja» y «Mila maneja»; luz de tarde dorada (`E.PAL.golden`) en vez de nublado, para unificar con el resto del piloto; el resorte más grueso (8 px) | Plan | ±0 | medio (re-temporizar con la voz; los textos del guion no cambian) |
| P1-5 | C2 noche D17-D21 | Protagonistas de ~40 px: acercar el encuadre (z ×1,6 sobre la pareja en D17/D24) y añadir **borde de luz de luna** más ancho en las siluetas (`LIGHT.night.rimW` 0,013 → 0,02) y en las botas oscuras de Eli | Plan | 0 | bajo/medio (Guardián) |
| P1-6 | Dúo de pie junto al anillo (B01-B02, B06, D1 E01, E04, E09, E14-E17, D2 F03-F08, F19, F22) | **Variedad de cámara y actuación**: el mismo encuadre frontal medio sale ~12 veces. Propuesta: alternar contra-plano sobre el hombro (OTS) con el anillo detrás, plano bajo (cámara al ras del pasto con las flores en primer plano desenfocadas), plano de dos caminando (Mila con la tablilla, Eli gesticulando) y un plano cerrado de una sola cara para los remates; Mila con 4-5 poses de base (manos en la cintura, pensar, palma, señalar, apuntar en la tablilla) en vez de brazos cruzados / tablilla | Plan | 0 | medio |
| P1-7 | Estadio C2 D04-D06 | Público con **3 planos de profundidad** (fila del frente nítida y grande, filas medias, filas lejanas como manchas con neblina), luz de reflectores (conos `K.light.shafts` desde los postes), variación de ropa/pelo por persona (ya existe `persona(i)`); césped con viñeta de luz | Plan | +5 ms | bajo |
| P1-8 | Domo C2 D07-D16 | Cambiar la rejilla de líneas por **arcos de estructura con borde de luz**, neblina dentro de la cúpula y la división de pantalla con un marco de papel en vez de la barra negra | Plan | +2 ms | bajo |
| P1-9 | Granja C2 D22-D25 | Exterior de la casa alrededor de la ventana (tablas de madera, alero, luz de la ventana derramándose sobre la pared y el pasto = **light wrap**), polillas frente al cristal | Plan | +2 ms | bajo |
| P1-10 | B21-B22 (Mila camina por la pista con la bici) | Escala: la bici mide la mitad de lo que debe frente a Mila (escala de dibujos animados, pero inconsistente) y Mila pisa la calzada entre autos; subir la bici ×1,6 y llevar a Mila por el borde interior de la pista | Plan | 0 | bajo |
| P1-11 | Acentos de luz en personajes | **Luz de los frenos sobre las caras** en los close-ups (un borde rojo ya existe en el auto: extenderlo al cast con `light.rim` mezclado según `bL`) | Plan | 0 | bajo |
| P1-12 | Planos que siguen un auto rápido (A02, D1 E06_rush, E1 G01) | Desenfoque de movimiento real en el fondo (ya existe en las capas del close-up, `drawTiled` blurPx): portarlo a la vista en perspectiva con 3 sub-muestras de la capa lejana | Plan | +20-30 % en esos planos | bajo |

### P2 · deseables

- Gafete de Eli asomando sobre la puerta del auto en D2 F10-F15 («SI SE ABRE…» cortado): ocultarlo con `noBadge` cuando la puerta lo tapa por encima del 60 %.
- E1 G17: la bandera baja apunta al suelo y se lee como «rota». Mejor que cuelgue con el paño hacia abajo y un leve ondeo.
- Sombra de contacto de Mila sentada en el pasto (B18): una elipse suave bajo la cadera y las botas.
- Guantera E2 (otro agente): interior con textura de plástico granulado, luz cálida que entra por la tapa, papeles y un mapa doblado.
- Grano: dos escalas (fino + medio) en vez de una sola, solo a 1080p.
- Aberración cromática muy sutil (0,5 px) solo en los bordes del cuadro de los planos nocturnos. Opcional: el ART_BIBLE no la pide.

---

## (c) Motor: lo que podemos usar y no usamos, y Hyperframes

### Potencial de nuestro motor (Canvas 2D + Chromium sin cabeza)

Medido: 0,40 s/fotograma a 720p con 1 worker (escena de close-up con 2 personajes). Costo extra estimado por técnica:

| Técnica | Cómo con el kit | Costo extra | Valor para el estilo |
|---|---|---|---|
| Pasadas de luz por plano (key/rim/fill por plano) | `K.cast.LIGHT` con mezcla por plano + `K.light.grade` local (ya parcial) | ~0 | Alto: une personaje y fondo |
| Profundidad de campo (fondo desenfocado en close-ups) | Las capas ya se hornean; `ctx.filter = blur()` sobre una capa cacheada al hornear | 0 si se hornea; 15-40 ms si es en vivo | Alto en close-ups (ya hay árboles medios difuminados) |
| Desenfoque de movimiento en planos rápidos | N copias desplazadas de la capa (como `drawTiled`) | +N × costo de la capa (3 muestras ≈ +25 %) | Medio, solo en 3-4 planos |
| Fotogramas «smear» en gags (puño, giro) | Estirar el brazo/cabeza 1-2 fotogramas en el kit del cast (pose de mezcla con escala) | ~0 | Medio-alto (comedia) |
| Borde de luz ya existe; **light wrap** (la luz del fondo que «muerde» la silueta) | `globalCompositeOperation='source-atop'` sobre el cast con el cielo desenfocado | +5-10 ms | Alto: es lo que hace «pintado» a la referencia |
| Perspectiva atmosférica | Ya en el kit (niebla exponencial); aplicar también a extras lejanos | ~0 | Medio |
| Paralaje con más planos | 1-2 capas más por escena lateral | +2-4 ms | Alto en las vistas laterales (P1-3/P1-4) |
| Texturas animadas (césped, agua, papel) | Desplazar el moteado con t; ya se hace en el campo | ~1 ms | Medio |
| Partículas (polvo, polen, luciérnagas) | `K.particles.motes`, `fireflies` (ya en uso) | ~1 ms | Medio |
| Aberración cromática sutil | 3 dibujos del fotograma con desplazamiento de 0,5 px por canal (post) | +8 ms | Bajo (opcional) |
| Grano en dos escalas | 2 teselas en `K.tex.grain` | +2 ms | Bajo-medio |
| WebGL (sombreadores) | Posible en Chromium sin GPU (SwiftShader), pero lento y rompe la paridad de píxeles | alto | No recomendado |

### Hyperframes (HeyGen)

- **Licencia verificada hoy en su repositorio** (github.com/heygen-com/hyperframes): **Apache-2.0** (permisiva, compatible con
  nuestra regla «nada NC/AGPL»). Requiere Node 22+, FFmpeg y Chrome sin cabeza (Puppeteer). Busca cada fotograma (render determinista),
  anima con GSAP / CSS / Lottie / WAAPI. SecondQuest lo usó (v0.8.147) en `secondquest/tools/hyperframes_ep003`.
- **¿Cambiar de motor?** **No.** Nuestras escenas son simulaciones verdaderas dibujadas en Canvas por fotograma, con caché de capas,
  luz y cast de huesos propios. En Hyperframes serían un `<canvas>` dentro de un HTML, es decir, el mismo código con otra capa de
  orquestación encima, sin ganancia visual y con riesgo de romper la paridad de píxeles, el sistema de auditorías del Guardián
  (que lee `window.__faceLog` de nuestra página) y la sincronía con las palabras de la narración (`A.at`).
- **¿Híbrido (tipografía, gráficas, rótulos con GSAP)?** Ganancia real pequeña: GSAP aporta curvas de suavizado ricas, pero ya
  tenemos `K.ease` y la tipografía en Canvas está horneada al estilo (papel, tinta, luz de escena). Pasarlas a HTML/CSS las volvería
  «motion graphics» limpias, justo lo que el Productor pidió evitar en escenas (2026-10-29). Además añade un segundo pipeline
  (dos renders, composición alfa, sincronía con la voz).
- **Recomendación:** mantener el motor propio. Copiar de Hyperframes solo dos ideas, en nuestro código: (1) un catálogo de curvas
  de suavizado tipo GSAP (`back`, `elastic`, `expo`) dentro de `K.ease` para los pops de rótulos y placas; (2) su práctica de
  **líneas base de regresión** («golden frames»): guardar 1 fotograma por plano y compararlo en cada cambio del kit.
  Costo: 1 día; riesgo: nulo. Hyperframes queda como opción solo para piezas no ilustradas (p. ej., una tarjeta de fuentes al final),
  nunca para las escenas.

---

## (d) Lo que ya arreglé y su verificación

Archivos tocados (sin tocar E2, el guion ni el audio):

| Archivo | Cambio |
|---|---|
| `art/scenes/mascot_closeup.js` | P0-1: copias espejadas del cielo (encuadres abiertos) |
| `ep/001/animatic/anim_c2.js` | P0-2: ventana recortada, comensal recolocado, brazo, travesaño |
| `ep/001/animatic/shots_blockC2.js` | P0-2: foco de D25 |
| `art/lib/cast.js` | P0-3: piernas `sitGround` (de frente y en 3/4; la espalda no cambia) |
| `ep/001/animatic/shots_blockB.js` | P0-3: B18 reencuadrado |
| `ep/001/animatic/shots_blockE1.js` | P0-4: bandera en G18; leyenda de G19 a 34 px; papel |
| `ep/001/animatic/shots_blockD2.js` | P0-5: rótulos de las tiras en pantalla; papel en F01_knob |
| `ep/001/animatic/anim.js` | P1-1: `A.paper` |
| `ep/001/animatic/anim_line.js` | P1-1/2/3: papel, rótulos de 34 px, pasada de profundidad de la línea |
| `ep/001/animatic/shots_blockC1.js`, `shots_blockD1.js` | P1-1/2: papel y rótulos |
| `ep/001/animatic/anim_ring.js` | P1-2: subtítulo de placa ≥ 40 px |
| Pedidos del Productor | `art/lib/cast_alts.js` (piel de Eli = #d9a66c, rubor #f07a5e; `C.ELI_HATS` con 7 opciones, inactivas), `art/scenes/eli_tone_lab.js`, `art/scenes/eli_hat_lab.js`, muestras en `model_sheet.js` / `flat.js`, `CHARACTERS.md` |

Antes / después: `art/review_2026-10/fixes_1_small.jpg` (P0-1, P0-2, P0-3 ×2) y `fixes_2_small.jpg` (P0-4, P0-5, P1-1/2, subtítulo de placa).
Nota: algunos «después» se renderizaron antes de aplicar la piel nueva de Eli y otros después. La diferencia de tono de Eli entre
paneles no forma parte de cada arreglo.

**Verificación automática (después de todos los cambios, piel nueva incluida), bloques B, C1, C2, D1, D2, E1, a 480p con fotogramas clave:**

| Bloque | Ojos (fallos) antes → después | Cuerpo (fallos / avisos) antes → después | Ropa (fallos) |
|---|---|---|---|
| B | 1 → 1 (la misma clase de antes: Mila diminuta con el párpado pesado a 480p; antes en B08, ahora en B04 a 9,38 s. Vista a 1080p: pupila presente, sin defecto) | 0/0 → 0/0 | 0 |
| C1 | 0 → 0 | 0/0 → 0/0 | 0 |
| C2 | 0 → 0 | 0/0 → 0/0 | 0 |
| D1 | 0 → 0 | 0/0 → 0/0 | 0 |
| D2 | 1 → 0 | 0/37 → 0/38 (todos son «PROMEDIO sobre el cuerpo»: la pegatina del tablero, intencional y ya conocida) | 0 |
| E1 | 0 → 0 | 0/0 → 0/0 | 0 |

Cuadros de texto (`textbox_check.mjs`, 720p, 20 líneas): **0 fallos**.
`pop_check.py` y `face_cross_check.py` necesitan el mp4: **pendientes del render único** tras la decisión del gorro (P0-8).
El bloque A no se volvió a renderizar: ninguno de sus encuadres de close-up destapa el borde del cielo (verificado con el cálculo de
encuadre de todos los `frame:` de las listas: solo D2 F10/F15 y E2 línea 88 lo destapaban), y no usa papel, placas ni `sitGround`.

**Guardián:** desde esta sesión no puedo lanzar subagentes (no tengo la herramienta para crearlos), así que no pude invocar
`guardian-eli-mila`. Corrí yo sus chequeos (ojos, cuerpo, ropa y cuadros de texto, arriba) y su pase a ojo sobre los planos
cambiados: B18, la colina C2 (D17 y D26), E1 G17→G18 fotograma a fotograma (47,7 / 47,9 / 48,6 s), D2 F15 y la ventana C2.
Veredicto de esos chequeos: **sin defectos nuevos**. Queda abierto el P0-7 (faldón, ya existía). El coordinador anunció que el
Guardián cerrará la hoja de gorros antes de que la vea el Productor. **El PASS formal del Guardián sobre los bloques llega con el
render único** (P0-8), que además cubre la piel nueva.

Clases de defecto nuevas para `GUARDIAN_LOG.md`: (1) encuadre abierto que destapa el borde de una placa de fondo (chequeo: el
cálculo de borde de `frame:` en todas las listas); (2) objetos de un interior que salen por su marco (recortar los interiores);
(3) estructura de primer plano (marco, travesaño) que cruza una cara; (4) sentados en el suelo: pies por delante y por debajo de la
cadera, nunca en el regazo.

---

## (e) Diseño cerrado (2026-10-29): interruptor canónico y lo que queda en las listas de planos

**El interruptor** (`art/lib/canon.js`, cargado en `art/scenes/index.html`, `ep/001/animatic/index.html` y
`ep/001/thumbnails/v3/src/thumbs.html`): `C.CANON = { eli: { outfit: '3bB', hat: '1a' }, mila: { outfit: 2 } }` redefine
`eli1` / `mila1`, así que todos los bloques usan el diseño nuevo sin editar las listas. El look de taller sigue disponible
como `eli1_taller` / `mila1_taller`. `C.OUTFITS.variant()` parte del look de taller, así que la opción 1 sigue siendo el
delantal. Colores para los dibujos hechos a mano: `K.cast.CANON_COLORS`. Hojas: `characters/leo_mila/model_sheet(_small).jpg`
y `emotion_sheet(_small).jpg` rehechas. `CHARACTERS.md` §0 y `ART_BIBLE` v5 actualizados.

**Ya corregido en el lado del kit/escenas:** el garabato de Eli en C1 (`anim_line.js`, gorro → gorra roja); la cabeza de Eli
vista desde arriba en el Domo (`anim_c2.js`, gorra amarilla → roja); la falda de Mila sentada en el suelo (`outfits.js`,
ahora es una falda corta sobre los muslos levantados); los chequeos `body_check.py` / `clothes_check.py` aceptan los dos looks
(con la clase de color `red` nueva en `cast.js`).

**Para el agente de render / re-temporización (solo listas de planos, no las toqué):**

| Lista / plano | Qué depende del look viejo | Propuesta |
|---|---|---|
| `shots_blockB.js` B01_drag (l. 37-51) | Mila arrastra a Eli «por la correa del delantal»: la correa sale del peto del delantal | que lo arrastre del cuello de la franela (o de la manga); el punto de anclaje pasa a ser el cuello |
| `shots_blockE1.js` G06-G09 manos (l. 86-93) | manga de Eli `#f3ecdd` (playera blanca) y de Mila `#7158b8` (suéter) | Eli `#7a1f2b` (franela, puño `#5e1622`), Mila `#4d6ea6` (mezclilla, puño `#6f8cc0`) |
| `shots_blockA.js` A09/A10/A13 y `shots_blockE1.js` G05 (pose `visor`) | la mano «a la visera del gorro»; con la gorra al revés no hay visera delante | se lee como mano en la frente haciendo visera: sirve tal cual; revisar en el pase del Guardián |
| `shots_blockA.js` A19_bonk + `art/scenes/wordmark_end.js` | el punto rebota en «el gorro» | funciona con la gorra (se aplasta con `hatHit`; verificado a 43,7-44,2 s); solo cambian los comentarios. En 44,0 s el punto pasa por delante de la cara de Eli: es el gag ya declarado, pero hay que revisarlo |
| `shots_blockC1.js` C08_hat (l. 127) | la barra del auto 10 cae «sobre el gorro» | usa la posición de la cabeza: funciona igual |
| Gafete «SI SE ABRE UN HUECO, CIÉRRALO» (`shots_blockD1.js` `badgeCard`, `eliBadge` en D2/E1) | antes iba sobre la playera blanca / el peto del delantal | **propuesta: queda sobre la playera amarilla**, entre los paneles abiertos de la franela (tarjeta blanca sobre amarillo, se lee bien; verificado en D2 F01 y E1). En 3/4 cae sobre el panel cercano de la franela: también se lee |
| `shots_blockC2.js` D17-D26 (colina, `sitGround`) | Mila con falda sentada en el suelo | ya corregido en el kit; pasa por el Guardián en el render |
| `shots_blockE2.js` l. 72 (plano sobre el hombro, «espalda y gorro de Eli») y `anim_e.js` `P.glovebox` (rodilla de Mila `#7158b8`) | el comentario dice gorro; la rodilla morada encaja con la falda | sirve tal cual; si se ve la pierna, usar el color de los leggings `#3d2f63` |
| D2 F16-F18 (tiras) | planas, autos de 40 px | `A.line` acepta ahora `mood: 'golden'` (cielo de tarde, sol, nubes cálidas): pasar `mood: 'golden'` y `pxm: 30` en `strips()` (P1-4) |
| C2 D17 / D24 (noche) | la pareja mide ~40 px | encuadre más cerrado (z ×1,6 sobre la pareja). El borde de luz de luna ya llega al máximo que permite el kit (0,75 × la tinta) (P1-5) |
| Dúo de pie junto al anillo (~12 planos) | mismo encuadre y mismas poses | variar cámara y poses (P1-6) |
| `shots_blockB.js` B21-B22 | bici a otra escala | bici ×1,6 y Mila por el borde interior (P1-10) |

**P1 en el lado del kit/escenas, hechos en esta ronda:** estadio con haces de los reflectores y neblina por filas detrás de
la pareja (P1-7, `anim_c2.js` `A.stadium`); granja con pared de tablas, luz que se derrama y alféizar iluminado (P1-9,
`A.window`); `A.line` con `mood: 'golden'` (lado de escena de P1-4). **Siguen pendientes:** P1-8 (domo), P1-11 (luz de
freno en las caras) y P1-12 (desenfoque de movimiento).
**Aviso para el Guardián:** el chequeo «vermilion on the character» salta en el lado iluminado de la gorra roja `#c62a2f`
cuando le da el borde de luz dorado (unos 20 px; el rojo se va hacia el naranja). La regla de ART_BIBLE es «nada bermellón
salvo el punto de la marca». Opciones: aceptar la gorra como roja (no es el punto de la marca) y excluirla del chequeo, o
enfriar el tono 1a un pelo (≈ `#c4243a`). Lo decide el Productor/Guardián; no cambié el color elegido.
