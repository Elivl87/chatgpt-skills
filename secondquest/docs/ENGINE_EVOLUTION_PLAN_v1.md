# SecondQuest: plan de evolución del motor v1

**Fecha:** 2026-10-03.
**Estado:** propuesta. Cada fase necesita la aprobación del Producer.
**Principio:** el motor y Claude mejoran siempre (CLAUDE.md, "Always improve").

## Fuentes

Seis análisis hechos el 2026-10-03:
1. Auditoría del código del motor.
2. Historia de producción de EP001 y EP002 (commits y conversación).
3. Ecosistema Remotion y estado del arte en 2025-2026.
4. Animación 2D y profundidad desde una sola imagen. Incluye una prueba real en esta máquina.
5. Sonido, subtítulos y retención.
6. Control de calidad automático, generación gratis y optimización de créditos. Incluye precios consultados en vivo en Higgsfield.

Las afirmaciones sin fuente primaria van marcadas **(sin verificar)**.

---

## 1. Diagnóstico

### 1.1 Lo que EP001 enseñó

**Lo que funcionó:**
- **La narración como reloj del vídeo:** cambiar la voz re-sincroniza todo gratis.
- **La compuerta FINAL_ART del render.**
- **Las correcciones sin créditos:** muchas se resolvieron solo con datos de la escena (#99, #103, #138, el sello, la escala en el Short).
- **El parche de transparencia determinista,** que corrigió 14 assets sin coste.
- **La verificación palabra por palabra de la voz.**
- **Las hojas de 160 láminas,** que dieron al Producer un vocabulario preciso para pedir cambios.
- **El Short hecho con el motor** a partir del episodio, por 0 créditos.

**Los 25 defectos registrados, por causa:**

| Causa | Ejemplos | ¿Se pudo detectar solo? |
|---|---|---|
| Arte generado | Fondo blanco o cuadriculado en recortes (reloj, valla), botas marrones, la cara de Quest perdida, una escena entregada como objeto | **Sí:** control de calidad al recibir el arte (transparencia, halo, color, identidad) |
| Composición | Cama sobre cama, Quest en el suelo, herramientas sobre la valla | **En parte:** anotar el suelo y el horizonte de cada fondo |
| Cámara | Zoom que se reinicia sobre el mismo fondo | **Ya está** (`CAMERA_JUMP`) |
| Escala y formato | Sello enorme y Quest pequeño en el Short | **Sí:** proporciones mínimas y máximas por formato |
| Texto | "Night" escrito sobre un atardecer | **Sí:** etiquetar la hora del día de cada fondo |
| Proceso | Créditos gastados sin cotizar, hoja de revisión con fotogramas viejos, el render cayó al 60 %, disco lleno | **Sí:** registro de créditos, validación completa, comprobaciones previas |

### 1.2 Lo que EP002 exige y EP001 no tuvo

- **Navi como sistema:** vuela por trayectorias, brilla, deja estela, se posa en el hombro y se congela tras el vidrio.
- **Transformación niño → adulto** en el mismo eje de cámara.
- **Ecos de memoria:** una figura translúcida que aparece y se va.
- **Capas técnicas:** malla y datos técnicos, medidores, vidrio de museo, imagen plana que gana profundidad.
- **Un mismo fondo con distinta hora del día.**
- **Epona a caballo.**
- **Disolvencias espaciales**, como cuarto → Hyrule.

### 1.3 El motor hoy

**Fuerte en:**
- datos (escenas anclada a la voz);
- validación (contrato de arte, zoom seguro, resolución);
- capas gráficas (contadores, partículas, textos);
- cámara con paralaje;
- mezcla a −14 LUFS.

**Débil en:**
- **Personajes:** son recortes rígidos, sin parpadeo, sin respiración y sin cabeza.
- **Sin capas de vídeo, Lottie ni SVG.**
- **Subtítulos:** solo por línea; los tiempos por palabra se calculan y se tiran.
- **Escenas largas y repetitivas:** cada una ocupa unas 70 líneas de JSON. Hay 80 viñetas idénticas y 92 animaciones de entrada idénticas.
- **Scripts por episodio** (`ep001-*.py`).
- **Sonido:** las 21 muestras son de prueba y no hay canal de ambiente.
- **Control visual manual.**
- **Render lento:** unos 35 minutos por cada 10 de vídeo.
- **La validación está en rojo hoy:** EP001 marca 26 `CAMERA_JUMP`.

### 1.4 Dos restricciones antes de cualquier herramienta

1. **Política de YouTube sobre "contenido inauténtico"** (desde el 15 de julio de 2025). Quita la monetización a contenido de IA hecho "con plantillas genéricas que dan impresión de producción en masa". https://support.google.com/youtube/answer/1311392
   - Las plantillas del motor deben servir para *variar* (composición, movimiento, dirección de arte), nunca para repetir el mismo episodio con otro juego.
2. **Licencias.** No usar en un canal monetizado:

| Categoría | Herramientas excluidas |
|---|---|
| Profundidad | Depth Anything V2 Base/Large/Giant, 3d-ken-burns, Apple SHARP |
| Recorte | BRIA RMBG-2.0, RobustVideoMatting |
| Generación de imagen | FLUX.1 [dev] y Kontext [dev] |
| Mejora de resolución | 4x-AnimeSharp |
| Audio | AudioGen/MusicGen, MMAudio, TangoFlux |
| Voz | XTTS-v2, pesos de F5-TTS |
| Sonidos | BBC RemArc |

---

## 2. Precios reales de Higgsfield

Consultados en vivo, sin generar.

| Modelo | Calidad / resolución | Créditos |
|---|---|---|
| GPT Image 2.5 (actual) | baja 1k | **0,25** |
| GPT Image 2.5 | baja 2k | 0,50 |
| GPT Image 2.5 | media 1k | 0,50 |
| GPT Image 2.5 | media 2k (nuestro estándar de fondos) | 1,00 |
| GPT Image 2.5 | alta 2k | 2,75 |
| Seedream 5.0 Flash | 2k | **0,50** (la mitad que nuestro 2k) |
| Z Image | — | **0,15** |
| Nano Banana | — | 1,00 |
| Nano Banana 2 | 1k / 2k | 1,50 / 2,00 |
| Nano Banana Pro | 2k | 2,00 |
| FLUX 3 | 2k | 3,00 |
| Bram (voz) | — | unos 3,1 créditos por cada 1.000 caracteres (EP001 y EP002 medidos) |

**Herramientas de Higgsfield que no usábamos** (falta consultar su precio con una imagen nuestra):
- `image_decompose`: separa una imagen en capas, útil para dar profundidad.
- `image_background_remover`: quita fondos.
- `bytedance_image_upscale`: aumenta la resolución.
- `nano_banana_2` con máscara: retoca solo una zona.
- `autosprite`: anima un personaje como hoja de fotogramas.

**El ahorro real está en los reintentos, no en el precio por imagen.** Higgsfield ya es más barato que la API directa de OpenAI para GPT Image (≈ $0,017–0,035 frente a ≈ $0,053 por imagen media 1k; los precios de los planes de Higgsfield son **sin verificar**).

---

## 3. Plan por fases

**Esfuerzo:** S (≤ 1 día), M (2–5 días), L (más de 1 semana) de trabajo de Claude. El desarrollo **no gasta créditos**, salvo donde se indica.

### Fase 0: cimientos y control de calidad

Antes del arte final de EP002. Todo a 0 créditos.

| # | Mejora | Qué resuelve | Esfuerzo |
|---|---|---|---|
| 0.1 | **Cámara "continue"** (`camera.start: "continue"`) y una corrección automática de los `CAMERA_JUMP` | Deja de repetir el defecto y deja EP001 listo para re-renderizar si se decide | S |
| 0.2 | **Tiempos por palabra en `timings.json`**: la verificación ya los calcula con faster-whisper; se añade alineación contra el guion con stable-ts (MIT) | Base para subtítulos, texto en pantalla sincronizado, sonidos y bajada de volumen precisa | M |
| 0.3 | **Paquete de publicación genérico** (`npm run publish -- ep002`): SRT en inglés y español con reglas de lectura (2 líneas × 42 caracteres, ≤ 20 caracteres por segundo), capítulos declarados en el guion y descripción | Acaba con los scripts por episodio y con errores de subida | S |
| 0.4 | **Control de calidad al recibir arte**: transparencia real, bordes con halo, cuadriculado, "escena entregada como objeto", relleno sobrante, resolución frente al uso real; color de las zapatillas y la sudadera de Quest (ΔE); parecido de la cara con DINOv2/SigLIP; y la IA como segunda opinión solo si algo salta | Los defectos de arte que más créditos y enfados costaron | M |
| 0.5 | **Validación completa del esquema** (cada capa con sus parámetros obligatorios) y **prueba previa del render** (primer y último fotograma de cada escena, imágenes demasiado grandes, espacio en disco) | Evita fallos como el del 60 % y los de disco lleno | S |
| 0.6 | **`npm run review`**: hoja de láminas automática con número, tiempo, línea del guion, marca de "cambiado desde la versión anterior" y versión a tamaño de móvil | Las revisiones del Producer, sin hojas armadas a mano | S |
| 0.7 | **Registro de créditos**: cotizar, aprobar, generar y anotar, con saldo. Más un **control previo de cada prompt**: bloque de identidad de Quest, referencias adjuntas, fondo transparente, sin palabras de "escena" en un objeto | Cumple la regla de créditos sin depender de la memoria y baja los reintentos | S |
| 0.8 | **Progreso y tiempo restante del render**, y copias de entrega automáticas a 30 MB y 500 MB | Las preguntas "¿cuánto falta?" y las re-codificaciones manuales | S |

### Fase 1: lo que EP002 necesita para lucir

Mayormente 0 créditos.

| # | Mejora | Detalle | Esfuerzo | Créditos |
|---|---|---|---|---|
| 1.1 | **Navi como personaje del motor** | Recorrido por curvas con profundidad, brillo con pulso, estela, posarse sobre un punto (el hombro), congelarse y liberarse. Reutilizable como "guía" en otros episodios | M | 0 |
| 1.2 | **Efectos visuales con `@remotion/effects`** (2026, versión fija) | Gradación por hora del día (LUT), textura de papel, sombra y contorno de recortes, desenfoque por distancia. **Así sale el atardecer del final del mismo fondo de Hyrule** | M | 0 |
| 1.3 | **Desenfoque de movimiento** en movimientos de cámara (`@remotion/motion-blur`) y **más transiciones** (`@remotion/transitions`: dissolve, cross-zoom, film-burn; `@remotion/light-leaks`) | El movimiento deja de parecer pase de diapositivas | S | 0 |
| 1.4 | **Biblioteca de efectos de EP002** | Eco de memoria (figura translúcida que entra y sale), destello de transformación con cambio de imagen en el mismo eje, brillo y líneas de CRT, malla técnica y etiquetas, medidores que se vacían, vidrio de museo que se rompe | M | 0 |
| 1.5 | **Personajes vivos (`LivingCutout`)** | Respiración, balanceo e inclinación de cabeza con una deformación del recorte (three.js), con semilla fija para que cada render salga igual. Parpadeo con una variante "ojos cerrados" fundida solo en la zona de los ojos | M | **Parpadeo:** ~0,25–0,5 por personaje (edición GPT Image), opcional |
| 1.6 | **Profundidad real (`plate3d`)**, solo en escenas elegidas | 1) Mapa de profundidad con Depth Anything V2 Small (Apache-2.0); **probado aquí: 1,6 s por fondo, en CPU, gratis**. 2) Separar el fondo en 3–5 capas cortando por los contornos gruesos de nuestro estilo. 3) Rellenar lo oculto con LaMa (Apache-2.0, CPU). 4) Render en three.js con neblina y desenfoque por distancia. Los personajes pueden ir *entre* capas. Riesgo: tiempo de render sin GPU; se mide con una prueba antes de adoptarlo | L | 0 |
| 1.7 | **Sonido sin música** | Biblioteca etiquetada con licencia por archivo: Sonniss GDC (sin atribución), Kenney (CC0), Biblioteca de Audio de YouTube (sin reclamos de Content ID), Freesound solo CC0. Canal de **ambiente** por familia de fondo, con fundidos de 500 ms. **Reglas automáticas**: whoosh en cortes, pop en textos, golpe solo en revelaciones, máximo 3 usos por minuto del mismo archivo, variantes rotativas. Nada encima del inicio de una frase | M | 0 (Sonniss, Kenney, Freesound y la Biblioteca de YouTube son gratis) |
| 1.8 | **Plantillas de escena (beats) y valores por defecto** | `reveal_character`, `split_compare`, `memory_echo`… se expanden a capas, cámara y sonido. Reducen el JSON un 40–60 % y obligan a variar (por la política de YouTube) | M | 0 |
| 1.9 | **Revisor de retención** (aviso, no bloqueo) | Gancho en ≤ 15 s; más de 6 s sin cambio visual (aviso) o más de 10 s (error); un re-gancho cada 60–90 s; capítulos de ≥ 10 s; zona de pantalla final libre; nada de más de 2 s de silencio que no sea intencional | S | 0 |

### Fase 2: después de EP002

| # | Mejora | Esfuerzo | Créditos |
|---|---|---|---|
| 2.1 | **Shorts dentro del motor**: reencuadre 9:16 por escena con un punto de foco, escala del personaje conservada, subtítulos palabra a palabra (1–3 palabras) en la zona segura y primer fotograma con el gancho | M | 0 |
| 2.2 | **Capa de vídeo** (`@remotion/media`), para planos clave animados por IA (Kling o Seedance en Higgsfield a partir de nuestra imagen exacta, sobre verde para recortar, mudos) | M | **~7 por cada 5 s (sin verificar)**; 2–4 por episodio, cada uno cotizado |
| 2.3 | **Diagramas que se dibujan solos** (`@remotion/paths`, `@remotion/rough-notation`): círculos, subrayados y flechas sincronizados con la palabra | M | 0 |
| 2.4 | **Miniaturas en el motor**: composición 1280x720 con las reglas de `THUMBNAIL_RULES.md`, 3 variantes para Test & Compare y control de texto frente a escena | S–M | 0 (el arte base se cotiza aparte) |
| 2.5 | **Pantalla final**: zonas reservadas para los elementos de YouTube en los últimos 5–20 s | S | 0 |
| 2.6 | **Render más rápido**: medir núcleos y formato de fotograma, renderizar por actos y solo re-renderizar el acto cambiado. Opción en la nube: Remotion Lambda, ~$0,10 por episodio (necesita cuenta de AWS) | M | 0 |
| 2.7 | **Registro del render** (git, hashes, validación, LUFS) escrito automáticamente | S | 0 |
| 2.8 | **Episodios registrados solos** y un único script de narración (`narration:assemble <ep>`) con estimación de duración antes de generar la voz | S | 0 |

### Fase 3: a evaluar más adelante

- **Generación gratis o casi gratis en nuestro estilo.**
  - Qué: un LoRA (entrenamiento con nuestras ~140 imágenes) sobre un modelo de licencia comercial (Z-Image-Turbo o Qwen-Image, Apache-2.0), con GPU alquilada (~$1–3 por entrenamiento, ~$0,001–0,005 por imagen).
  - **Antes de hacerlo:** revisar si los términos de OpenAI y Higgsfield permiten entrenar con sus salidas. El estilo saldría bien; la identidad exacta de Quest probablemente seguiría necesitando referencias.
- **Rig de Rive** (`@remotion/rive`, $9 al mes) para una pose de Quest que se repita mucho.
- **Sincronía de labios (Rhubarb, MIT)**, solo si algún día un personaje habla. Quest no habla; en su lugar se apuesta por la **actuación de reacción**: variantes de expresión mezcladas solo en la cabeza y micro-movimientos.
- **Probar Depth Anything 3** (versiones Apache) frente a la V2 Small.

---

## 4. Manual de ahorro de créditos

Ordenado por ahorro esperado.

1. **Control previo de cada prompt** (0.7): el gasto más caro es el reintento.
2. **Fondo transparente nativo** (`background: transparent`) en todos los objetos y personajes, más control de halo y limpieza de bordes automáticos.
3. **Resolución según el uso real.** Se calcula tamaño en pantalla × zoom máximo de la línea de tiempo:
   - Objetos pequeños: 1k.
   - Fondos con cámara y primeros planos: 2k.
   - Si hace falta más resolución, se aumenta gratis con Real-ESRGAN anime_6B (BSD-3).
4. **Hojas de varios assets** en una sola generación, separados automáticamente por transparencia (el plan de 8–9 créditos de EP002).
5. **Corregir antes que regenerar:**
   1. Recolorear o borrar gratis (máscara + cambio de tono, LaMa).
   2. Retoque con máscara en Higgsfield.
   3. Regenerar, como último recurso.
6. **Borradores baratos:** GPT Image calidad baja 1k (0,25) o Z Image (0,15) para probar composición, y la calidad media solo en la versión elegida.
7. **Probar Seedream 5.0 Flash para fondos 2k** (0,5 frente a 1,0): una prueba de estilo de 0,5 créditos. Si mantiene SecondQuest_2D_v1, los fondos cuestan la mitad.
8. **Paquete fijo de referencias de Quest** (frente, tres cuartos, cuerpo entero con zapatillas rojas) en cada generación de personaje.
9. **Límite de 2 reintentos por asset**; después se cambia de método.
10. **Planificar el gasto antes de la renovación del plan**, porque los créditos de suscripción no se acumulan.

---

## 5. Recomendación

**Hacer ya:**
- **Fase 0 completa.** Unos 5–7 días de trabajo, 0 créditos.
- **De la fase 1, lo que EP002 usa:** 1.1 (Navi), 1.2 (gradación), 1.3 (desenfoque y transiciones), 1.4 (efectos), 1.7 (sonido) y 1.9 (retención).

**Hacer como prueba:**
- 1.5 (personajes vivos) y 1.6 (profundidad), con una prueba corta de rendimiento antes de adoptarlos.

**En paralelo:** el arte de EP002 se puede generar mientras tanto; no depende de estas mejoras.

**Siguiente paso:** el Producer aprueba fases o puntos sueltos.
