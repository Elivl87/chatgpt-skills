# EP001 · miniaturas v3 con Eli + Mila (2026-10-15)

Título bloqueado: **«¿Por qué hay embotellamientos sin razón aparente?»**. Ningún texto de miniatura lo repite.
Estado: **propuestas**. Solo el Productor aprueba la miniatura; el arte del canal ya está cerrado.

| Archivo | Qué es |
|---|---|
| `thumb_A.png` / `thumb_A_small.jpg` | A · «¿QUIÉN FUE?», 1280x720, 1,41 MB / 218 KB |
| `thumb_B.png` / `thumb_B_small.jpg` | B · «FUE ÉL.», 1,34 MB / 192 KB |
| `thumb_C.png` / `thumb_C_small.jpg` | C · «¡VA HACIA ATRÁS!», 1,39 MB / 208 KB |
| `preview_sheet_small.jpg` | las 3 al 50 % y cada una a 168x94 en un feed blanco y uno oscuro (#0F0F0F), entre tarjetas neutras, con barras grises y chip de duración (289 KB) |
| `src/` | generador: `TMPD=<tmp> ./build.sh` (1 Chromium, unos 10 s). `thumbs_v3.js` (escenas con el kit `art/lib` + el mundo ep001, sin tocarlos), `thumbs.html`, `render.mjs`, `finish.py` (numpy/Pillow). Determinista: dos builds dan los mismos md5. |

## Pase de detalle (2026-10-15, tras «los detalles son raros … sus ojos de sorpresa estaban mal diseñados»)

Mismas composiciones; A sigue siendo la elegida. Re-render con el kit corregido (`art/characters/leo_mila/DETAIL_AUDIT.md`,
30 detalles): **C** ahora lee asombro claro (blancos abiertos sin sombra gris, pupilas centradas mirando al valle con
brillo, cejas arqueadas, gorro de Eli que salta); manos dibujadas (puño, mano que señala, palmas, manos juntas); cuello y
tirantes limpios; luz de borde fina por dentro de la línea (ya no doble contorno rojo/crema); en A el grito muestra las
dos filas de dientes y la lengua por encima del cuello. Antes / después: `art/characters/leo_mila/detail_before_after_small.jpg`.

## Las tres (distintas a propósito: texto, valor del fondo y escala cambian en cada una)

| | A · ¿QUIÉN FUE? | B · FUE ÉL. | C · ¡VA HACIA ATRÁS! |
|---|---|---|---|
| Emoción | Eli **furioso gritando** (la expresión más fuerte del sistema), puño arriba, marca de ira | Mila **pícara** (párpado caído, ceja arriba, sonrisa con dientes) señala; Eli **atrapado** (ojos de plato, cejas preocupadas, boca temblorosa, sudor, rubor) | los dos **asombrados**, caras teñidas de rojo por la autopista, destellos teal |
| Escena | hora dorada a contraluz, cámara baja detrás del auto teal detenido: la cola de luces de freno va hasta el sol | clave alta: sol estallado entre los dos, bokeh de luces de freno, fondo desenfocado | colina de noche, luna, la cinta de luces cruzando el valle con la ola roja; flecha teal gruesa siguiendo la ola **hacia atrás** (hacia nosotros) |
| Texto | arriba a la izquierda, crema sobre el cielo violeta | en el centro, tinta sobre luz; el punto final es el **punto de marca bermellón**, un círculo perfecto apoyado en la punta del dedo de Mila | arriba a la derecha, tres líneas, crema sobre el cielo nocturno |
| Valor | medio: centro brillante, marco oscuro | claro | oscuro |
| Escala | Eli enorme (la cabeza ocupa ~70 % de la altura), Mila pequeña mirando hacia atrás | dos caras grandes, una por lado | dos caras grandes abajo a la izquierda |

Las tres cumplen: personajes ≥ 40-50 % del cuadro, 1-3 palabras en Martian Mono 800, todos los puntos de ¿?¡!. son
círculos verdaderos, grano y textura del mundo aprobado, esquina inferior derecha (chip de duración) sin caras ni texto.
Para que la emoción se lea a 168x94 la actuación va un punto más allá que en el episodio (variantes solo de miniatura,
definidas en `thumbs_v3.js`): boca de Eli un 30 % más ancha al gritar, sonrisa de Mila con dientes, ojos de plato.
Mismos diseños, colores y vestuario.

## Orden recomendado para Test & Compare

1. **A · ¿QUIÉN FUE?** — la más inmediata a 168x94: una sola cara enorme, emoción inconfundible, frase que todos
   hemos gritado en un atasco, y la cola de luces explica el tema sin palabras. Es la de control.
2. **B · FUE ÉL.** — la más ingeniosa y la de marca (el punto bermellón en el dedo de Mila); acusa al espectador por
   persona interpuesta. Puede ganar en CTR si el público ya conoce a los personajes; arriesga que «FUE ÉL.» sin
   contexto se lea como chisme y no como tráfico.
3. **C · ¡VA HACIA ATRÁS!** — el dato más contraintuitivo y la que más se distingue en un feed (noche, rojo y teal
   frente a todo lo dorado), pero es la que más se apoya en el texto y la emoción (asombro) es más suave que la furia.

Cambio frente al guion (que recomendaba B primero): con los personajes ya dibujados, A es la que mejor pasa la prueba
de 168x94, por eso la pongo primero; B sigue siendo la favorita si se prioriza la firma del canal.

## Debilidades (honestas)

- **A:** el texto y Mila comparten el lado izquierdo; a 168x94 Mila es pequeña (detalle para quien mira dos veces, no
  carga la lectura). El borde del auto abajo es una banda plana. Es la más "esperable" de las tres.
- **B:** el fondo es de clave alta y en el feed blanco pierde algo de borde (lo salva la viñeta cálida); la boca
  temblorosa de Eli se pierde a 168 px y lo "atrapado" lo cargan los ojos, las cejas y el sudor. Es la que menos
  dice "tráfico": el bokeh rojo es la única pista.
- **C:** la flecha es recta y gráfica (más señal que pincel); las caras con luz roja se ven algo apagadas, y el ojo de
  Eli del lado en sombra queda oscuro. Tres líneas de texto: al límite de "1-3 palabras".
- Las tres: pensadas en ES; una versión EN necesitaría rehacer el texto (no hecho).
