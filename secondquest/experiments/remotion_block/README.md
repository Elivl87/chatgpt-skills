# Prueba Remotion: un bloque de EP002 con todo el potencial (2026-10-08)

**Estado:** experimento. **El motor no se ha tocado**: es un proyecto aparte, con la misma versión de Remotion que el motor (4.0.530). El Productor decide qué se adopta.

**Pregunta que responde:** ¿se puede conseguir con Remotion la calidad del animatic de Python de EP002, o mejor?

## La escena

Es la misma de la prueba HyperFrames #3, para comparar las tres versiones:
- EP002, l12–l16;
- del 34,32 s al 49,19 s del episodio (14,87 s);
- *"It is the game... plus the room. Plus the television. Plus the friend who somehow knew where to go. Plus an entire Saturday afternoon where nobody could reach you because smartphones had not yet ruined that particular miracle."*

## Qué usa de Remotion (y qué aporta)

| Herramienta | Dónde | Qué aporta frente al animatic de Python |
|---|---|---|
| `CameraMotionBlur` (`@remotion/motion-blur`) | Al salir de la tele, al empujar hacia la tele y al volver | **Desenfoque de movimiento real** en la cámara: el movimiento deja de parecer un pase de diapositivas |
| `Trail` (`@remotion/motion-blur`) | Navi | Estela de luz real, calculada de sus posiciones anteriores |
| `barrelDistortion` + `chromaticAberration` + `scanlines` (`@remotion/effects`, shaders de GPU) | El juego dentro de la tele | Pantalla CRT de verdad: curvatura, separación de color, líneas de barrido |
| `outline` + `dropShadow` | Los niños | **Contorno de tinta** del estilo de la casa y **sombra de contacto**: los personajes se apoyan en el suelo, no flotan |
| `whiteBalance` + `exposure` | Fondo y personajes, a la vez | **La misma lámina pasa de mañana a tarde dorada** (punto 1.2 del plan de evolución del motor) |
| `lightLeak` | Al salir de la pantalla | Fuga de luz de película |
| `noise` + viñeta | Desde "Saturday" | Grano de película y bordes cálidos: tratamiento de recuerdo |
| `paper` + `dropShadow` + `<Freeze>` + `spring` | Final | **Polaroid** con textura de papel real; el plano se congela y la foto cae con física |
| `evolvePath` (`@remotion/paths`) | La flecha de Pixie y el tachón del móvil | Trazos que se dibujan solos |
| `noise2D` (`@remotion/noise`) | Polvo en el rayo de sol, parpadeo de la tele | Movimiento orgánico, nunca lineal |
| `@remotion/captions` | Subtítulos | **Palabra a palabra con los tiempos de Bram** (el motor de EP001 los calculaba y los tiraba) |
| `<Audio>` con curvas de volumen | Sonido | **Diseño de sonido completo**, ver abajo |
| Render a escala 4/3 | Salida | **2560×1440** desde un diseño de 1920×1080 |

**Los personajes respiran:** escala vertical de ±1,2 % cada 3,1 s, anclada a los pies. Entran con muelle (spring) y Pixie hace un pequeño salto al sentarse.

**Componentes reutilizables** (`src/components/`), listos para llevar al motor si se aprueban:
- `FlapClock`: reloj de paletas con giro real de media tarjeta y clic en cada cambio.
- `Polaroid`.
- `Navi`.
- `Captions`.

## Sonido (todo gratis, regla del canal)

- **Bram:** la narración original del episodio, el tramo exacto.
- **Del motor:** `fairy_shimmer` y `fairy_flutter` (Navi) y `tv_on`.
- **CC0 (Kenney):**
  - estática de la tele al empezar;
  - clic de cada paleta del reloj;
  - rotulador (flecha y tachón).
- **Síntesis propia (`prepare.sh`):**
  - tono de habitación;
  - zumbido de CRT, que baja al salir de la pantalla;
  - whoosh del movimiento de cámara;
  - vibración del móvil;
  - obturador de la Polaroid.

El animatic actual de este bloque solo tiene a Bram.

## Arte (aprobado, sin modificar)

- Cuarto: `quest_bedroom_morning`, descargado de Higgsfield, sin gastar créditos.
- Niños: arte final #6a, #6b y #6c.
- El juego: arte final #11 y #3.

`prepare.sh` hace copias **para el render**:
- tamaño ajustado (los niños nunca se ven a más de ~800 px);
- **alfa limpiado** (`alpha < 128 → 0`): el arte trae un halo casi invisible que el contorno de tinta convertía en manchas.

Los PNG originales no se tocan.

**Fuera del guion:** el pie de foto "Saturday afternoon · 1998" no lo dice Bram. Es solo para la prueba.

## Archivos y cómo regenerarlo

```bash
./prepare.sh                  # public/ (no está en git)
node render.mjs stills 1.5,6.3   # fotogramas sueltos (a media escala) para revisar
node render.mjs video         # out/remotion_block_1440p.mp4
./compare.sh                  # out/comparison_3way.mp4: Python / HyperFrames / Remotion
```

El render usa Chromium sin pantalla con WebGL por software (SwiftShader), sin GPU.

## Lo aprendido

RENDER_NOTES
