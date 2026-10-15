# Eli + Mila · 5 diseños alternativos (2026-10-15)

Brief del Productor (vía coordinador): revisar a la pareja desde cero (apariencia, ropa, todo) y elegir entre
**5 alternativas** de verdad distintas. El personaje masculino ahora se llama **Eli** (antes Leo); ella sigue siendo
**Mila**. La estatura queda abierta: cada alternativa prueba una proporción distinta (están en cada tablero y en el
resumen). Todo está dibujado 100 % en código (Canvas 2D), con la luz, el grano y la paleta del estilo v2 aprobado. El
mundo no se tocó.

**Para el celular:** `alternatives_overview_small.jpg` (las 5 escenas + las 5 estaturas, 353 KB) y, por alternativa,
`alt_N_small.jpg` (tablero) y `alt_N_scene_small.jpg` (escena). Todos pesan menos de 180 KB.

## Las cinco

| | Nombre | Estaturas (Eli / Mila) | Cabezas · ojos | Ropa y época | Colores firma |
|---|---|---|---|---|---|
| **Alt 1** | **Taller** (los de ahora, pulidos) | 0,95 / 1,08 (ella 14 % más alta) | cápsula · saltones con párpado | ropa de trabajo: gorro, delantal / suéter, overol | amarillo `#f2c230` / morado `#7158b8` |
| **Alt 2** | **Carretera 70** (road trip retro) | 1,00 / 1,02 (casi iguales) | cápsula · saltones | años 70: afro, aviadores, playera ringer, pantalón acampanado de pana / pelo largo, diadema tejida, margarita, chaleco de flecos, cuello alto | cobalto `#3557c9` / frambuesa `#c2386f` |
| **Alt 3** | **Barrio** (streetwear, más jóvenes) | 0,94 / 1,07 (ella 14 % más alta) | huevo (chibi) · ojos punto con cejas | gorra al revés, sudadera lima, audífonos, pecas / chongo alto rizado, chamarra varsity con «M» | lima `#a6d23a` / cobalto `#2f55c8` |
| **Alt 4** | **Ruta verde** (aire libre, **Eli el alto**) | 1,08 / 0,98 (él 10 % más alto) | baldosa / píldora · ojos con iris y cejas | excursionistas de 30: gorro de pompón, barba, franela de cuadros, tirantes de mochila / trenza pelirroja, impermeable celeste, binoculares, botas de lluvia | vino `#a3324a` / celeste `#4b9fe0` |
| **Alt 5** | **Laboratorio** (científicos, 40s) | 0,92 / 1,06 (ella 15 % más alta) | píldora · ojos punto (ella con lentes enormes) | él con overol naranja, goggles, bigote canoso, cinturón de herramientas / ella con bata, cuello alto marino, bob con mechón gris, gafete | mandarina `#ef8a24` / marino `#26305e` + crema |

Conceptos en una línea (también en cada tablero):

1. **Taller:** los Max & Leo adaptados y pulidos: cabezas cápsula, ojos saltones, ropa de trabajo; amarillo y morado.
2. **Carretera 70:** road trip de los 70: afro y aviadores, pantalón acampanado de pana; ella con cabello largo, diadema
   tejida y chaleco de flecos; cobalto y frambuesa.
3. **Barrio:** más jóvenes y chibi: cabezas de huevo, ojos punto con cejas; él con gorra al revés, sudadera lima, pecas y
   audífonos; ella con chongo alto rizado, aretes de botón y chamarra varsity cobalto.
4. **Ruta verde:** excursionistas de 30: él alto, barbudo, con franela de cuadros y gorro de pompón; ella con trenza
   pelirroja, impermeable celeste y binoculares.
5. **Laboratorio:** científicos excéntricos de 40: él con overol naranja, goggles y bigote canoso; ella alta, con bata,
   cuello alto marino, lentes enormes y bob con mechón gris.

## Archivos (en esta carpeta)

| Archivo | Qué es |
|---|---|
| `alt_N.png` (1920×1080) | Tablero: frente / 3/4 / perfil, 6 expresiones (neutral, risa, sorpresa, furia gritando, preocupado, pícaro), 3 poses (señala, hombros, en el auto), estatura junto a un extra de cabeza redonda (1,00), muestras de color con hex, concepto y la escena |
| `alt_N_scene.png` (1920×1080) | La **misma** escena para las 5: carretera dorada, toma cerrada del auto teal (los personajes ocupan la mitad del cuadro): Eli grita «¡¿Quién fue?!» al volante con el puño en alto; Mila voltea hacia atrás, curiosa |
| `alt_N_small.jpg`, `alt_N_scene_small.jpg` | Versiones ligeras para el celular (≤ 180 KB) |
| `alternatives_overview_small.jpg` | Las 5 escenas + las 5 estaturas, con etiquetas Alt 1 a Alt 5 (353 KB) |

Código: `art/lib/cast.js` (motor v2), `art/lib/cast_alts.js` (las 10 figuras, ids `eli1..eli5`, `mila1..mila5`; alias
`eli` → `eli1`), `art/scenes/alt_board.js` (tablero, escena, estatura, laboratorio). Reconstruir todo (2 Chromium a la
vez, ~90 s): `TMPD=<tmp> art/render/build_alternatives.sh [1 2 3 4 5]`.

## Lo que se arregló en el motor (vale para las 5)

- **Borde de luz:** ahora empieza justo donde termina la línea de tinta (antes quedaba una franja del color de relleno
  entre ambos y se leía como doble línea); además su grosor tiene tope en píxeles para las tomas cerradas.
- **Brazos:** cada brazo es una sola curva suave por el codo (nunca quebrada); de pie cuelgan con una leve flexión, se
  mecen un poco y terminan en una mano relajada (manopla con pulgar). La pose de manos en la cintura usa anclas en la
  cadera con el codo hacia afuera (se acabó el codo doblado hacia atrás en 3/4).
- **Aretes de Mila (Alt 1):** ya no son aros pegados a la cabeza (parecían tornillos); ahora son un botón en el borde y
  una gota dorada que cuelga **fuera** de la silueta y se mece.
- **Boca de perfil:** las bocas abiertas son una cuña en el borde de la cara (con dientes y lengua) y las cerradas una
  curva que sale del borde, así se leen de lado.
- **Expresiones nuevas:** risa (ojos cerrados en arco), **furia gritando** (boca grande con las comisuras hacia abajo y las
  dos filas de dientes, marca de enojo), pícaro, asombro, pensativo, apenado, decidido y molesto, además de las de
  antes (15 en total + parpadeo + boca de habla).
- **Nitidez en acercamientos:** los personajes se redibujan al tamaño real en pantalla cuando la cámara hace zoom (antes
  se ampliaba una imagen pequeña).
- **Pose en el auto:** Eli maneja con una mano y agita el puño hacia atrás (por fuera de su cara); Mila lleva las manos en
  el regazo y puede voltear la cabeza completa hacia atrás.

## Mi ranking honesto

1. **Alt 1 · Taller.** La más terminada y la que ya tiene el cariño del Productor; las cápsulas con ojos saltones son
   únicas frente a los extras de cabeza redonda, y amarillo + morado se separan a cualquier tamaño, de día y de noche.
   Con los arreglos ya no tiene los defectos conocidos.
2. **Alt 2 · Carretera 70.** La dirección nueva con más encanto y la que mejor cuenta "viaje por carretera" (el tema del
   piloto). Conserva el lenguaje cápsula; cobalto y frambuesa contrastan muy bien con la luz dorada. Estaturas casi
   iguales: funciona porque las siluetas (afro / pelo largo) ya las separan.
3. **Alt 3 · Barrio.** Las caras más expresivas y las más fáciles de animar (ojos punto con cejas); se sienten jóvenes y
   simpáticos. Riesgo: la cabeza de huevo chata de Eli es la más cercana a los extras redondos (la gorra lima lo salva).
4. **Alt 4 · Ruta verde.** Buena pareja y la única con Eli más alto (un impaciente grandote también es gracioso). Riesgo:
   la barba le resta lectura a la boca de Eli en tamaño chico y los ojos con iris se leen más pequeños que los saltones.
5. **Alt 5 · Laboratorio.** El concepto encaja con un canal de ciencia y Eli (goggles + bigote) es divertido, pero Mila es
   la figura más floja de las diez: el bob negro con lentes grandes pesa mucho y de perfil (escena) se lee casi como un
   casco.

## Defectos conocidos (honestos)

- **Alt 5, Mila:** el bob y los lentes se leen pesados; de perfil, volteando hacia atrás, la cara queda angosta. Necesita
  otra pasada si el Productor la elige.
- **Mila volteando hacia atrás (todas):** el perfil es correcto pero la cara queda más chica que la de Eli de 3/4; la
  emoción de Mila se lee menos que el grito de Eli.
- El globo «¡¿Quién fue?!» es un apoyo para el tablero; los globos de texto aún no están en el ART_BIBLE.
- En los tableros, las celdas de expresiones recortan el gorro o el peinado (son bustos); la pose "en el auto" es pequeña
  por el tamaño del panel (la escena muestra el auto en grande).
- Los tableros viejos de candidatos (`characters/candidates/`) no se regeneraron; si se reconstruyen, usarán el motor
  nuevo y se verán distintos a los PNG guardados.
- Quedan en pausa, por indicación del coordinador: la hoja de modelo final, `CHARACTERS.md`, la actualización del
  ART_BIBLE, los cuadros de estilo v4 y el video de prueba v4. Se retoman con la alternativa elegida.
