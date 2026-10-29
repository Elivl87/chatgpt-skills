# Música nueva · 5 opciones para elegir (EP001, 2026-10-29)

Pediste cambiar la música («No me gusta la que tiene»). La de ahora usaba instrumentos de un banco General MIDI
(suenan a teclado barato) y un fondo bastante quieto. Estas 5 opciones usan **instrumentos reales grabados**
(orquesta, piano de cola, palmas…) bajo licencia **CC0** (dominio público: gratis, uso comercial, sin crédito obligatorio).

**Cómo escucharlas:** `musica_opciones.mp3` (4 min 14 s). Antes de cada opción suenan pitidos: 1 pitido = opción 1,
2 pitidos = opción 2… Cada opción es el **gancho completo del episodio (0–47 s)** con la voz de David encima, el
ambiente y los efectos del episodio, tal como sonaría en el vídeo. También están sueltas: `opcion_1.mp3` … `opcion_5.mp3`.

En las 5 la música sigue la historia: se frena con el auto («…quieto: Eli.»), da un golpe de sorpresa en «¡¿Quién fue?!»,
se calla en «Pero allá no hay nada» con tres toquecitos en «ni choque, ni conos, ni semáforo», un trino en
«el pajarito tampoco», sube cuando Mila mira atrás hasta «¿Qué?», deja la pregunta en el aire y remata con el
**sting del logo** (las 3 notas del canal, re–la–sol, en los instrumentos de cada opción). La voz siempre se oye clara
(la música baja sola cuando David habla). Volumen final −14 LUFS, picos ≤ −1,5 dB.

| # | Nombre | Estilo | Instrumentos |
|---|---|---|---|
| 1 | **Pizzicato curioso** | El clásico de "explicador": juguetón, cuerdas punteadas, ligero | violines, violas y chelos en pizzicato; clarinete staccato; shaker y bloque de madera; glockenspiel |
| 2 | **Acústico de madera** | Cálido, folk, de carretera y buen humor | strumstick (cuerda pulsada tipo ukelele) punteado; chelo pizzicato de bajo; palmas, cajón y shaker; arpa |
| 3 | **Lo-fi de estudio** | Relajado, moderno, "lofi beats" con swing | piano eléctrico FM con acordes de 7.ª/9.ª; bajo grave; bombo suave, cajón y hi-hat; textura de cinta y vinilo |
| 4 | **Orquesta de cuento** | Caprichoso, de cuento ilustrado | flauta, oboe y clarinete con la melodía; fagot staccato de bajo; arpa; vibráfono y glockenspiel (en lugar de celesta); triángulo |
| 5 | **Piano y cuerdas de cine** | Cinematográfico, emotivo, con pulso suave | piano de cola Steinway con ostinato; secciones de violines, violas y chelos; pulso de chelo pizzicato y bombo suave |

## De dónde salen los sonidos (licencias)

| Fuente | Qué usamos | Licencia | URL |
|---|---|---|---|
| **VSCO-2 Community Edition** (Versilian Studios) | cuerdas (pizzicato y sostenidas), arpa, flauta, clarinete, oboe, fagot | **CC0 1.0** (archivo `LICENSE` del repo; commit `4403009`) | https://github.com/sgossner/VSCO-2-CE |
| **Versilian Community Sample Library (VCSL)** | piano de cola Steinway B, piano eléctrico FM (TX81Z, patches propios de Versilian), strumstick, vibráfono, glockenspiel, palmas, cajón, shaker, bloque, hi-hat, bombo, triángulo | **CC0 1.0** (archivo `LICENSE`; commit `c1ea7bc`) | https://github.com/sgossner/VCSL |
| Nuestro código | composición, sampler (afinación, dinámica), reverb, efecto lo-fi (cinta, vinilo), mezcla | nuestro | `compose_options.py`, `engine/cine_suave.py` |

Nada NC, nada CC-BY, nada con copyright de terceros. (Versilian *pide* amablemente un crédito aunque no es obligatorio;
proponemos una línea en la descripción: «Instrumentos: VSCO-2 CE y VCSL de Versilian Studios (CC0)».)
Las muestras no se suben al repo: se descargan de esas URLs a `/tmp/claude-0/music_libs/` (ver cabecera del script).

## Cómo se extendería a los 8 minutos

Igual que la partitura actual: cada sección arranca en la primera palabra de cada beat del guion (`timings_es.json`),
así que si cambia la voz, la música se reajusta sola. Con la opción elegida:

- **Gancho y pregunta (0–47 s):** esto que escuchas.
- **Actos 1–2 (curiosidad, experimento):** el mismo estilo con 3–4 variaciones que rotan (otro acorde, otro instrumento
  con la melodía) para que el fondo **no se quede quieto**; pausas cortas en los momentos de sorpresa.
- **Noche (beat 13):** versión lenta y suave (solo piano/arpa/cuerdas o la versión sin batería en la opción 3).
- **Actos 3–5:** vuelve el tema principal, más lleno en el acto 4 y más íntimo en el 5.
- **Final:** el tema completo y cierre en sol con el sting del logo.
- Mismas reglas de mezcla: la voz siempre encima, la música baja cuando David habla, −14 LUFS.

**Lo que necesitamos de ti:** dime el número (o "la 2 pero más lenta", "la 5 con las palmas de la 2", etc.).
