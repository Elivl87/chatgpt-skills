# Prueba HyperFrames #1: el sello "So, why?" (2026-10-08)

**Estado:** experimento. No forma parte del motor y no ha entrado en ningún episodio. El Productor decide si se usa.

## Opinión del Productor (2026-10-08)

Le gustan tres cosas:
- cómo sale el logo (la revelación de izquierda a derecha);
- cómo brilla la estrella de la "o";
- cómo se ilumina la palabra "Quest" (el destello).

Pendiente de decidir: el sonido, y si se integra en el motor.
- **Sonido v1 (`prepare.sh`): no convenció al Productor.**
- Alternativas generadas con `sting_variants.sh` (A "Mágico", B "Firma", C "Juego"): síntesis propia, gratis, todas con pico de -7 dBFS.
- Están **en pausa**: el Productor pasó a la prueba #2 antes de escucharlas.

## Qué es

El momento de identidad del canal, en el que el logo aparece en "why?", rehecho con [HyperFrames](https://github.com/heygen-com/hyperframes) (HeyGen, Apache-2.0).

El motor de Remotion no cambia. HyperFrames genera una pieza suelta con **fondo transparente**, y esa pieza se pone encima del plano como cualquier otro clip.

| | Actual (motor) | Nuevo (esta prueba) |
|---|---|---|
| Logo | Aparece de golpe: escala, desenfoque y una ligera inclinación | Se revela de izquierda a derecha con un borde de luz, más la misma escala de entrada |
| Barra dorada | Crece desde el centro | Igual (520 × 8, #ffc83d) |
| Brillo | No | Un destello de luz cruza las letras |
| Estrella de la "o" | Fija | Centellea a los 0,90 s con 8 chispas y vuelve a su tamaño |
| Sonido | Silencio | Sonido propio sintetizado: un brillo suave al aparecer el logo y dos notas cuando centellea la estrella, ~9 dB por debajo de Bram |
| Duración | Hasta el corte al Acto 1 | 3,1 s: de "why?" a l11 en EP002 |

El tamaño y la posición son los mismos que en el motor: 180 px de alto a 1080p, centrado, con la barra debajo.

## Archivos

- `index.html`: la composición (GSAP). t = 0 es la palabra "why?".
- `prepare.sh`: copia el logo desde `public/shared/brand/` y genera `assets/sting.wav`. `assets/` no está en git.
- `vendor/gsap.min.js`: GSAP 3.14.2, en local. El Chrome del contenedor no puede cargar la CDN a través del proxy. Licencia: https://gsap.com/standard-license
- `renders/ident_so_why.webm`: el sello, 1920×1080, 24 fps, VP9 **con transparencia**, con el sonido incluido.
- `renders/ident_so_why_AB_preview.mp4`: comparación sobre el bloque B de EP002 (v15, 720p): primero **ACTUAL** y después **NUEVO**, con la voz de Bram.
  - En el NUEVO, el fondo se congela en el último fotograma antes del logo, porque el render del bloque ya trae el logo antiguo.
  - En el episodio real, Quest seguiría caminando.

## Cómo regenerarlo

```bash
./prepare.sh
npx --yes hyperframes@0.8.141 check        # lint + validación en Chrome
npx --yes hyperframes@0.8.141 render --format webm -o renders/ident_so_why.webm
```

En este contenedor (4 núcleos, sin GPU), el render tarda unos 17 s.

## Qué hemos aprendido de HyperFrames

- Se instala y renderiza sin problemas en el contenedor, solo con CPU.
- Su `check` detecta errores reales de animación antes de renderizar: transforms de CSS que GSAP sobrescribe, propiedades que tiemblan al buscar fotograma a fotograma, y animaciones que se solapan.
- Exporta con transparencia (WebM/MOV), así que sus piezas se pueden superponer en Remotion sin tocar el motor.
- Por defecto envía datos de uso anónimos. En esta prueba se desactivó con `hyperframes telemetry disable`.

## Si se aprueba

Para usarlo en un episodio:
1. Llevar `ident_so_why.webm` (o un MOV ProRes 4444) a los recursos compartidos.
2. Que el motor lo coloque en el momento de "why?" en lugar de su capa de logo.

Es un cambio pequeño en el motor, y solo se hace si el Productor lo aprueba.
