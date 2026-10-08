# Prueba HyperFrames #2: los tres anclajes en 3D en vivo (2026-10-08)

**Estado:** experimento. No forma parte del motor y no ha entrado en ningún episodio. El Productor decide si se usa.

## La escena

EP002, l04–l06: *"The same ocarina. The same sword. The same Triforce."*
- **Momento:** del 13,32 s al 17,36 s del episodio (4,04 s), desde el blanco de "A new camera." hasta el corte a Hyrule (l07).
- **Bloque:** B3 del bloque B.

**Por qué esta escena:** es la que más puede ganar con HyperFrames.
- Hoy cada reliquia es una secuencia de fotogramas renderizada aparte (tools/props3d → Python), sobre un fondo de estrellas plano.
- Aquí las mismas reliquias se dibujan en **3D en vivo** dentro de la composición: cámara, luces y partículas se animan juntas y en sincronía con la voz de Bram.

## Qué es igual y qué es nuevo

**Igual (no se ha tocado):**
- La geometría aprobada de la ocarina, la espada y la Trifuerza.
- `src/relics.ts` se extrae sin cambios de `tools/props3d/scene.ts` con `./extract_relics.sh`.
- El guion y la voz.

**Nuevo (solo para la prueba):**

| | Actual (animatic v15) | Nuevo (HyperFrames) |
|---|---|---|
| Composición | Una reliquia a la vez, centrada, en negro | **Tres casillas de objeto** doradas en arco, como la miniatura "EXCEPT YOU", que se van llenando |
| Cámara | Fija por reliquia | **Cámara 3D** que se acerca a la ocarina, se desplaza a la espada y luego a la Trifuerza, y al final se aleja para mostrar las tres |
| Ocarina / espada | Giran (fotogramas pre-renderizados) | Giran en vivo con luz clave fría y contraluz cálido. Un **brillo recorre la hoja** de la espada en "sword" |
| Trifuerza | Placas grabadas que se juntan | Las **tres piezas 3D llegan desde los lados** y encajan justo en "Triforce", con un destello |
| Casillas | — | Se **iluminan en cada palabra** y quedan las tres encendidas en el plano final |
| Texto | Sin texto | Panel de la familia A aprobada (cristal tinta, doble filete dorado, diamantes): "THE SAME" + OCARINA / SWORD / TRIFORCE en su palabra |
| Navi | Destello 2D | **Luz de hada 3D con estela**, que guía la mirada de casilla en casilla |
| Fondo | Estrellas planas | **1.400 estrellas a tres profundidades** (paralaje real con la cámara) y nebulosas suaves |
| Contorno | Tinta (pase de normales en Python) | Tinta con **casco invertido** en el shader, en vivo |

## Archivos

- `index.html`: la composición y la línea de tiempo GSAP con los tiempos de Bram (t = 0 es el 13,32 s del episodio).
- `src/scene.ts`: la escena three.js (casillas, estrellas, hada, luces y contorno). Es determinista: GSAP anima `state` y llama a `draw(t)` en cada fotograma.
- `src/relics.ts`: las reliquias aprobadas, extraídas sin cambios.
- `build.sh`: copia las fuentes (Anton, Inter 800) y empaqueta three.js + escena → `vendor/anchors.bundle.js`.
- `renders/anchors_3d.mp4`: la escena nueva, 1920×1080, 24 fps.
- `renders/anchors_3d_comparison.mp4`: comparación de 19 s con la voz de Bram en todo momento.
  1. ACTUAL (animatic v15, bloque B 3,6–10,0 s);
  2. NUEVO (el mismo tramo con la escena de HyperFrames en medio);
  3. los dos a la vez, lado a lado.
  - El animatic actual está a 720p y se ha escalado a 1080p.

## Cómo regenerarlo

```bash
./build.sh
npx --yes hyperframes@0.8.141 check
npx --yes hyperframes@0.8.141 render --quality high -o renders/anchors_3d.mp4
```

En este contenedor (4 núcleos, sin GPU, WebGL por software), el render tarda unos 25 s.

## Qué demuestra de HyperFrames

- **three.js dentro del video**, sincronizado con GSAP y renderizado fotograma a fotograma sin saltos, incluso con 2 procesos en paralelo. Con GPU por software también funciona.
- **Las piezas 3D del canal se pueden reutilizar tal cual.** No hace falta pre-renderizar secuencias de PNG: la cámara y la luz se deciden en la composición.
- **Texto, 3D y efectos en una sola línea de tiempo**, sincronizados con las palabras de Bram.
- `check` y `snapshot` sirven para revisar fotogramas concretos antes de renderizar.

## Límites vistos

- Las reliquias salen **más pequeñas** que en el plano actual, porque comparten pantalla con las casillas. Si se usa, conviene un primer plano más cerrado en cada palabra.
- El contorno de casco invertido es más fino e irregular que el pase de tinta del motor en piezas finas, como la hoja de la espada.
- Sin GPU no hay postprocesado pesado (bloom real, desenfoque de movimiento). El destello es un degradado de CSS.
