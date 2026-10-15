# Diez Mil Puntos · candidatos de personajes (2026-10-15)

Brief del Productor (PRODUCER_DECISIONS, 2026-10-15): le gustan **Max & Leo** adaptados al estilo del canal, pero **uno
debe ser mujer**; el punto **no se descarta**; diseñar 1-2 personajes nacidos en este estilo que mejoren el punto; traer
3-4 candidatos. Todo está dibujado 100 % en código (Canvas 2D, kit del canal, luz y grano del estilo v2 aprobado; el
ART_BIBLE no se tocó).

## Archivos

| Archivo | Qué es |
|---|---|
| `candidates_overview.jpg` | Las cuatro escenas de prueba (A, B, C, D) + las cuatro estaturas, para elegir de un vistazo (cuadrícula 2 × 2) |
| `cand_A.png`, `cand_A2.png`, `cand_B.png`, `cand_C.png`, `cand_D.png` | Tablero 1920×1080: giro (frente / 3/4 / perfil), 6 expresiones, 4 poses (de pie, señala, hombros, maneja en el auto teal de dos plazas), estatura, colores, nombre y personalidad, y la escena de prueba |
| `cand_*_scene.png` | La misma escena de prueba para todos, a 1920×1080: carretera dorada, toma cercana lateral (composición del cuadro b v2), el impaciente gruñón al volante y el otro reaccionando |

Código: `art/lib/cast.js` (motor: capas, luz, cara, IK de brazos, poses, expresiones), `art/lib/cast_specs.js` (los
personajes), `art/scenes/cast_board.js` (tableros, escena, estatura, laboratorio). Reconstruir:
`TMPD=<tmp> art/render/build_candidates.sh [A B C D A2]` (2 Chromium a la vez, ~25 s todo).
Uso en una escena: `K.cast.draw(ctx, 'mila', x, y, u, { view: 'q', dir: 1, pose: 'point', expr: 'smug', t, light: K.cast.LIGHT.golden, seated })`.
Vistas `front | q | side`; poses `stand point shrug drive crossed fist wave cheer hips palm`; expresiones
`neutral happy surprised grumpy worried smug` (+ `annoyed curious talk`), parpadeo `blink`, labios `talk 0..1`.
Respiración, coleta, trenzas, flama y bufanda se mueven con `t` (nada queda congelado).

Escena de prueba, arreglos sobre el cuadro b (aplicados en `scenes/mascot_closeup.js`, que ahora acepta un `crew`):
los postes ya no son pálidos ni borrosos (oscuros, nítidos, desenfoque de movimiento opaco y limitado) y el pasto del
primer plano es un talud opaco de hojas oscuras con puntas a contraluz (ya no se ve el asfalto a través).

---

## A · Max & Leo, adaptados: **Leo + Mila** (recomendado)

- **Leo** (se queda igual): bajito, cabeza cápsula ancha, piel café oscuro, gorro amarillo acanalado, playera blanca,
  delantal café, jeans, botas negras, ojos saltones con pupilas que no se ponen de acuerdo, sonrisa enorme.
  **En el piloto: el impaciente** que cierra cada hueco y grita «¡¿Quién fue?!» (beats 1-3, 22-23).
- **Mila** (Max convertido en mujer, con cambios mínimos): misma cápsula alta, mismos párpados de sueño, mismo suéter
  morado, overol mostaza y botas verdes. Lectura femenina con: coleta alta con liga mostaza (se mece), flequillo de lado,
  pestañas, labios color vino y aros dorados. **En el piloto: la paciente y curiosa** que mira hacia atrás, descubre la
  ola y dice «Fuiste tú.»
- Nombres para ella (decide el Productor): **Mila** (propuesto), Maxi, Malva (malva = morado, su color).
- Por qué funciona: es lo que al Productor ya le gusta; los roles calzan solos (Max ya era el calmado, Leo el ruidoso);
  siluetas opuestas (alta y delgada / bajito y ancho) y colores firma (morado / amarillo) que se leen a tamaño de
  celular; la cara de párpados de sueño es perfecta para el «Fuiste tú.» seco del final.
- Riesgos: la cabeza cápsula sin orejas hace que los aros parezcan un poco "tornillos" en vista de frente; los ojos
  saltones con párpado pueden leerse como lentes en tamaño chico; el diseño viene de un estilo inspirado en un juego
  (ver `FRIENDS_MAX_LEO.md`, la distancia está documentada: nada copiado).

**A2 · el otro cambio: Lía + Max.** Leo se vuelve **Lía** (trenzas bajo el gorro, pestañas, aros) y Max se queda.
Funciona igual en roles (la impaciente al volante), pero la lectura femenina es más débil a tamaño chico (el gorro tapa
casi todo el pelo) y Max ya es muy reconocible como el calmado. Por eso A gana sobre A2. Otros nombres: Lea, Leona.

## B · Pareja nueva nacida en este estilo: **Toño + Paz**

- **Toño**: bajito y redondo, cabeza de círculo (un punto), copete negro hacia adelante, cejas gruesas de tormenta, nariz
  de bola, chamarra deportiva cobalto con franjas blancas, tenis naranjas. **El impaciente.** Otros nombres: Beto, Rayo.
- **Paz**: alta, serena, lentes redondos, moño alto (otro punto), abrigo rosa con tres botones redondos (puntos), mallas
  ciruela, tenis crema con suela teal. **La paciente y curiosa** (su nombre es literalmente la lección del episodio).
  Otros nombres: Lupe, Ada.
- Por qué funciona: nacen del kit del canal (cabeza = círculo con la construcción de cara de marca: ojos punto con
  brillo, cejas, rubor), así que son los más fáciles de animar y combinan con la gente genérica del mundo; todo en ellos
  son puntos (cabezas, moño, botones, lentes). Distintos de Max & Leo (sin cápsulas ni ojos saltones) y de los blobs de
  Primer (tienen cuerpo, ropa y manos). Las expresiones de Toño son las que mejor se leen de todos los candidatos.
- Riesgos: son personajes nuevos sin la historia/cariño que el Productor ya tiene por Max & Leo; con lentes, los ojos
  de Paz son pequeños y sus expresiones se leen menos; al voltear la cabeza (escena), los lentes quedan en el borde.

## C · Mascota nueva: **Chispa**

- Un punto ámbar con patitas, tenis teal, ojos grandes con brillo y una flamita de dos lenguas que actúa (crece y se pone
  roja cuando se enoja, se encoge cuando se preocupa). Brilla de verdad (resplandor propio): de noche es una luz más.
- Rol: compañera de cada episodio y **el punto de la «i» de Mil** (panel del tablero); en la escena viaja en el cofre
  del auto, preocupada por el berrinche de Leo. Puede vivir sola o junto a la pareja. Otros nombres: Tilde, Pepa.
- Por qué funciona: mucho más expresiva que el punto liso; la luz es el personaje principal del estilo y ella es luz;
  silueta única (círculo + flama) que se lee aunque mida 40 px.
- Riesgos: se acerca al territorio "emoji / mascota genérica"; el ámbar compite un poco con el sol y el gorro de Leo en
  la escena dorada; los brazos son cortos y caídos (poca gesticulación en reposo).

## D · El punto, mejorado: **Punto**

- El disco bermellón de marca, sin contorno (regla del ART_BIBLE), con luz de escena (borde y sombra plana), ahora con
  cejas, brillo en los ojos, bufanda teal tejida con flecos que ondean, brazos y piernas de tinta más gruesos con manos
  redondas y tenis teal.
- Rol: mascota y punto de la «i»; en la escena reacciona en el cofre (manos en la cintura, molesto). Otros nombres: Don
  Punto, Puntito.
- Por qué funciona: conserva la marca tal cual (bermellón + teal) y gana mucha más cara y actitud.
- Riesgos: sigue siendo el mismo concepto que el Productor dijo que no le gusta; la bufanda le da una "cintura" que a
  ratos se lee como falda; las piernas de tinta son finas al lado de la pareja.

---

## Mi recomendación

**A (Leo + Mila) como pareja del canal**, con **C (Chispa)** como compañera opcional para el gancho y el sello (aterriza
como el punto de la «i»). A respeta lo que el Productor eligió, cumple "uno debe ser mujer" con cambios mínimos, y los
roles del piloto calzan sin forzar nada. Si el Productor prefiere personajes 100 % propios del canal, **B (Toño + Paz)**
es la alternativa más fácil de animar y la que mejor actúa. El nombre de ella (Mila / Maxi / Malva) lo decide el
Productor.

## Defectos conocidos (honestos)

- El borde de luz va justo dentro del contorno y en algunos tamaños se ve como doble línea.
- Brazos rígidos en "de pie" (casi rectos); en "señala" de 3/4, el brazo de la cintura de Mila dobla el codo hacia atrás
  de forma rara.
- En perfil, la boca se aplana a una rayita (como en los Max & Leo 3D originales).
- Los aros de Mila y Lía se leen como "tornillos" de frente; los lentes de Paz quedan en el borde al voltear.
- En el auto solo se ven torso y cabeza (el talud de pasto y la puerta tapan el resto, a propósito).
- La escena de prueba es un cuadro fijo (t = 12,7 s del sim); los personajes no están ligados todavía al sim como lo
  estaban Quest y Pixie (las expresiones de la escena están puestas a mano para la comparación).
- Los PNG pesan ~4-5 MB cada uno por el grano.
