# Dirección del narrador · EP001 · guion v4 (bloqueado) · Qwen3-TTS «Ryan» · 2026-10-24

**Para el Productor.** Esta es la instrucción, oración por oración, con la que se renderiza toda la narración del
episodio 1 con la voz que elegiste (Qwen3-TTS, voz «Ryan», Apache-2.0) en el registro que te gustó: **exclamativo,
proyectado, emocionado, «nunca calmado»**, el de «Entonces, ¿por qué hay embotellamientos sin razón aparente? ¡Vamos
más despacio!». Ritmo objetivo ≈ 145-155 palabras por minuto. Fuente única: `direction_v4.py` (esta hoja se genera de
ahí y el render `build_voice_qwen.py` lee lo mismo; el texto se comprueba palabra por palabra contra el guion bloqueado).

## 0 · Cómo leer la hoja

- **Texto**: el guion v4 literal. Cuando el motor recibe otra puntuación (nunca otras palabras) se indica *(motor: «…»)*.
  Las líneas `[solo cuadro]` («¿Qué?», «¡Dale, dale!», «¡Nooo!») no se locutan: quedan como hueco de silencio corto
  (0,5 s / 0,3 s / 0,3 s) y la narración sigue.
- **Las citas de Eli y Mila las dice el narrador** (misma voz, actitud mínima): Eli más fuerte y exasperado (+2,5 dB),
  Mila más serena pero viva (−2 dB). Una respiración (0,3 s) antes de cada cita (columna «pausa antes»).
- **Instrucción exacta al motor** = `BASE` + matiz de la fila. `BASE` (idéntica en las 127 oraciones locutadas):
  > *Exclamative and projected, excited, like telling a friend a surprise, with the energy of a character's line; never
  > calm, never flat. Smiling, lively intonation, neutral Latin American Spanish accent.*
  **Idioma de la instrucción: inglés.** Prueba A/B del 2026-10-24 (3 oraciones × 2 semillas, misma voz, `rate` 1,3):
  en inglés el tono se mueve más (rango 13,3 semitonos frente a 7,4 en español) y la energía (desviación RMS) es
  parecida (7,6 frente a 9,3 dB); el inglés dio 3/6 tomas con un error de texto y el español 2/6, pero los errores los
  cubre la retoma automática (Whisper, WER 0 obligatorio). La pista 1 de `ELIGE.mp3` que te gustó también iba con la
  instrucción en inglés. La versión española de cada matiz existe en `direction_v4.py` (`TAGS`) por si se prefiere.
- **`rate`**: campo nativo del motor (tempo que conserva el tono). Calibración de hoy en esta máquina: con esta
  instrucción Ryan habla a ~90-100 ppm en `rate` 1,0; por eso la hoja lleva 1,5 como «normal» (≈150 ppm), 1,55-1,6 en
  gancho y citas de Eli, 1,35-1,4 en cifras, remates y el «ajá», 1,25-1,3 en las citas de Mila y los susurros. Si una
  toma queda por debajo de 140 ppm, en el montaje se acelera ≤ 1,15× (rubberband, sin cambiar el tono); se anota en el QC.
- **Pausa antes / después** (segundos): las pone el montaje, no el motor. Incluyen las pausas de gag del guion
  (pajarito 2 s, hombros 2,5 s, globo 1 s, Eli tarde 1,2 s, tenedor 1,2 s, todos lo miran 1,2 s, hojita 1 s, guantera
  0,8 s), el sello tras la pregunta (5 s), los **5 s de silencio del beat 23** y los 3 s antes de la pantalla final.
  Las cifras llevan 0,6 s de aire antes (biblia); los remates, 0,3-0,45 s (el chiste está en la pausa).
- **Energía**: `high` / `mid` / `low`. **`low` nunca es calma**: es íntimo-emocionado, como un secreto que no puedes
  guardar (menos volumen, no menos ganas).
- **Reglas que cumple la hoja** (verificadas por código): nunca tres oraciones seguidas con la misma instrucción
  (91 matices distintos para 130 filas); toda pregunta se pregunta de verdad; pausa antes de cada remate; suspenso
  antes de cada «¿Quién fue?»; cifras más lentas y claras; el silencio del beat 23 y las pausas del 24 como en el guion.
- **Render**: una llamada al motor por fila, ≥ 3 tomas correctas por oración (WER 0 contra el guion), y de ellas se
  conserva la **más enérgica** (rango tonal en semitonos + variación RMS, `measure.py`), nunca la más plana.
  Semillas `5000 + 97·fila + 7919·toma`. Volumen por oración −20 LUFS (+2,5 Eli, −2 Mila), pista −16 LUFS.

## 1 · Curva del episodio (resumen)

| Tramo | Beats | Energía | Qué hace la voz |
|---|---|---|---|
| Gancho | 1-4 | alta | Arranca con intriga, sube en escalera hasta «Eli», sorpresa real en «no hay nada», LA pregunta de verdad y 5 s de aire. |
| El círculo | 6-8 | media-alta | Cifras claras (2008, 22, 230 m, 30, 3 min, 5, 20), sonrisa en «Problema:» y «En una pista vacía.», el «mira esto» de la paradoja. |
| El ajá chico | 9-10 | media | Baja el ritmo, no el ánimo: la cadena paso a paso, escalera de «más fuerte», golpe en «alto total», «chisme» con sonrisa. |
| Vuelve el asombro | 11-13 | alta | Paradoja, ola del estadio, lema con peso, «Tres autos de más.» seco, «la razón ya se fue a cenar» seco y sin voz graciosa. |
| La solución | 14-17 | media | Preguntas reales, cita de la instrucción, alivio en «La ola se derritió.», travesura, y **el ajá** («Ser paciente no es ir lento. Es ir al promedio.») lo más lento del episodio, íntimo-emocionado. |
| Mila | 18-19 | media (cálida) | Confidencia, Mila serena al volante, «Por una vez, llegar tarde es la jugada.» con guiño, «Ojo: no es magia.» honesto. |
| La autopista | 20-21 | alta | Pregunta real, cifras claras, «¿El resultado?… Es complicado.», relato deportivo de la ola. |
| Tú y el final | 22-24 | baja (íntima) | Consejos de amigo, eco del gancho, 5 s de silencio, susurro «¿…Quién fue?», «Fuiste tú.» sonriendo, el lema otra vez, firma del canal. |

## 2 · Hoja oración por oración

### Beat 01

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 1 | Narrador | Una carretera despejada. | Calma engañosa con chispa: el amigo empieza el cuento. | BASE + «Open the story with intrigue: a 'you won't believe this' tone.» | 1.5 | 0.0 | 0.42 | mid |
| 2 | Narrador | Allá adelante, un conductor toca el freno. | El detalle minúsculo que lo desata todo; «freno» como quien lo ve. | BASE + «Point at the detail; the surprise lands on the last word.» | 1.5 | 0.0 | 0.42 | high |
| 3 | Narrador | Una sola vez. | Subraya lo pequeño del gesto. | BASE + «Short and dry, with contained wonder: each word separate.» | 1.4 | 0.0 | 0.45 | mid |
| 4 | Narrador | Apenas un poquito. | Casi un secreto: lo mínimo causa lo máximo. | BASE + «Intimate but excited, like a secret you cannot keep; low in volume, not in energy.» | 1.3 | 0.0 | 0.5 | low |

### Beat 02

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 5 | Narrador | Detrás, cada auto frena un poco más fuerte que el anterior. | La ola se arma: la energía sube paso a paso. | BASE + «Like a staircase: tension and pitch rise word by word, faster and faster.» | 1.5 | 0.0 | 0.35 | high |
| 6 | Narrador | Más fuerte. Más fuerte… hasta que alguien se queda quieto: Eli. | Clímax del gancho; cae sobre Eli (la música se corta en «quieto»). | BASE + «Climax: each 'más fuerte' higher and faster, and the final word, the name, drops like a punchline.» | 1.5 | 0.0 | 0.45 | high |

### Beat 03

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 7 | **ELI** (cita) | ¡¿Quién fue?! | Indignación cómica; el running gag nace aquí (con energía, no a gritos). | BASE + «Quoting an impatient, indignant friend: louder, exasperated, incredulous; the narrator's own voice, no cartoon.» | 1.55 | 0.3 | 0.4 | high |
| 8 | Narrador | Eli está seguro: alguien allá adelante tiene la culpa. | El narrador sonríe ante la certeza de Eli. | BASE + «With fond irony: you smile at the friend's absurd certainty.» | 1.5 | 0.3 | 0.42 | mid |
| 9 | Narrador | Pero allá no hay nada. | Giro: sorpresa real; el espectador mira adelante con Eli. | BASE + «Real surprise, as if you just discovered it: wide eyes.» | 1.45 | 0.0 | 0.5 | high |
| 10 | Narrador | Ni choque, ni conos, ni semáforo. <br>*(motor: «Ni choque… ni conos… ni semáforo.»)* | Tres tachas rítmicas; luego la pausa del pajarito (2 s). | BASE + «A list of three, crossing options out one by one, a micro pause between them; amused.» | 1.4 | 0.0 | 2.0 | mid |

### Beat 04

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 11 | Narrador | Mila, su amiga, mira atrás. | Presenta a Mila: la que mira donde nadie mira. | BASE + «Introducing someone fondly, with complicity; the focus of the scene shifts.» | 1.5 | 0.0 | 0.35 | mid |
| 12 | **MILA** (cita) | Eli… va para atrás. <br>*(motor: «Eli. Va para atrás.»)* | Maravilla bajita: encontró el misterio. | BASE + «Quoting a serene friend who just saw something amazing: soft, wondering, but alive and smiling; never dull.» | 1.3 | 0.3 | 0.35 | low |
| 13 | **ELI** (cita) | ¿Qué? | Solo cuadro (sin voz): el gag es la lupa; el narrador respira y entra con «Entonces…». | *(sin voz: solo cuadro; hueco de 0.5 s)* | — | — | 0.45 | — |
| 14 | Narrador | Entonces, ¿por qué hay embotellamientos sin razón aparente? | LA pregunta, hecha de verdad; intriga que queda en el aire 5 s (wordmark). | BASE + «THE question of the episode: a real, intrigued question, pitch truly rising at the end and hanging in the air.» | 1.45 | 0.3 | 5.0 | high |

### Beat 06

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 15 | Narrador | Mila arrastra a Eli a un experimento de verdad. | Arranca el acto 1: divertido, con impulso. | BASE + «A new act starts: fun, with momentum, like saying 'and now, watch this'.» | 1.5 | 0.0 | 0.3 | mid |
| 16 | **ELI** (cita) | ¡Ya entendí! ¡Fue el de adelante! | Seguridad absurda: en un círculo todos tienen a alguien adelante. | BASE + «Quoting a friend who thinks he has it all figured out: fast, triumphant, overconfident.» | 1.6 | 0.3 | 0.4 | high |
| 17 | Narrador | En dos mil ocho, un equipo de físicos en Japón puso veintidós autos en una pista circular de doscientos treinta metros. | Datos claros (2008, 22 autos, 230 m) con la emoción de «mira lo que hicieron». | BASE + «Facts with figures: a little slower and very clear on the numbers, but with the thrill of 'look what they did'.» | 1.3 | 0.6 | 0.42 | mid |
| 18 | Narrador | Problema: en un círculo, todos tienen a alguien adelante. | Sonrisa en «Problema»; el chiste del dedo de Eli se cuenta solo. | BASE + «Logical punchline with a smile: the first word with a wink, the rest as an amusing obviousness.» | 1.5 | 0.0 | 0.42 | mid |
| 19 | Narrador | Los conductores tenían una sola tarea: manejar con cuidado, a unos treinta kilómetros por hora. | La consigna del experimento; «treinta» nítido. | BASE + «As if reading the instruction they were given; clear, the number at the end very crisp.» | 1.4 | 0.0 | 0.6 | mid |

### Beat 07

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 20 | Narrador | Al principio, todo bien. | Falsa calma: se huele el «luego». | BASE + «False calm before the blow: cheerful, brief, with a hidden 'but'.» | 1.45 | 0.0 | 0.42 | mid |
| 21 | Narrador | Luego aparecieron titubeos: un hueco por aquí, un apretón por allá. | Visual y juguetón: los huecos se abren y cierran en pantalla. | BASE + «Playful and visual, narrating moving drawings: small pitch jumps.» | 1.5 | 0.0 | 0.42 | mid |
| 22 | Narrador | A los tres minutos, más o menos, cinco autos estaban completamente parados. | Dato con asombro: «tres minutos», «cinco» claros. | BASE + «A fact with wonder: numbers clear and slightly slower, the ending with surprise.» | 1.4 | 0.6 | 0.45 | high |
| 23 | Narrador | En una pista vacía. | Remate seco: pausa antes, sonrisa escondida. | BASE + «Dry punchline: short, almost flat, a hidden smile; the joke is in the pause before it.» | 1.4 | 0.45 | 0.35 | mid |
| 24 | **ELI** (cita) | ¡¿Quién fue?! | Eco del gag: ahora culpa a 22 personas; luego la pausa de los hombros (2,5 s). | BASE + «Quoting an impatient, indignant friend: louder, exasperated, incredulous; the narrator's own voice, no cartoon.» | 1.55 | 0.3 | 2.5 | high |

### Beat 08

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 25 | Narrador | Lo que a Mila le encanta: los autos siempre avanzan, y el embotellamiento se desliza hacia atrás, a unos veinte por hora. | El «mira esto» de la biblia: la paradoja; «veinte» claro. | BASE + «Like saying 'look at this': growing enthusiasm, sharing a paradox.» | 1.45 | 0.0 | 0.42 | high |
| 26 | Narrador | Más o menos lo que va una bicicleta. | Comparación cotidiana con ternura (timbre de bici en la mezcla). | BASE + «An everyday comparison, with a smile and a little tenderness.» | 1.45 | 0.0 | 0.65 | mid |

### Beat 09

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 27 | Narrador | Vamos por partes. | Entrada al ajá chico: baja el ritmo, no el ánimo. | BASE + «Entering the 'aha': a bit slower, very clear, same eagerness; inviting a close look.» | 1.4 | 0.0 | 0.45 | mid |
| 28 | Narrador | Estiremos el círculo hasta volverlo una línea recta. | Invita a imaginar: el anillo se estira en pantalla. | BASE + «Inviting to imagine the scene: visual, with momentum, as if drawing it in the air.» | 1.45 | 0.0 | 0.42 | mid |
| 29 | Narrador | El primer conductor toca el freno. | Primer eslabón de la cadena. | BASE + «First step of a chain: clear and crisp, setting up what follows.» | 1.45 | 0.0 | 0.42 | mid |
| 30 | Narrador | El segundo lo nota un instante tarde. | El detalle clave del episodio: «tarde». | BASE + «The key detail: very clear, slightly slower, stress on the time word.» | 1.4 | 0.0 | 0.42 | mid |
| 31 | Narrador | En ese instante ya se acercó, así que tiene que frenar un poco más fuerte. | La lógica encadena y la energía sube. | BASE + «The logic chains: each part pushes the next, energy rising toward the end.» | 1.45 | 0.0 | 0.42 | mid |
| 32 | Narrador | El tercero, más tarde y más fuerte todavía. | Escalera: las barras crecen. | BASE + «Like a staircase: tension and pitch rise word by word, faster and faster.» | 1.5 | 0.0 | 0.42 | high |
| 33 | Narrador | Eli va en el diez: | Marco de la cita: suspenso, respiración tras los dos puntos. | BASE + «Frame for a quote, with suspense: pitch left hanging after the colon.» | 1.45 | 0.0 | 0.35 | high |
| 34 | **ELI** (cita) | No… no… ¡no! | Tres «no» que suben de tono: ve venir las barras. | BASE + «Quoting a friend watching disaster arrive: three 'no' rising in pitch and volume, the last almost a shout.» | 1.45 | 0.3 | 0.35 | high |
| 35 | Narrador | Para el auto número diez: alto total. | Remate con golpe (golpe del auto 10 en la mezcla). | BASE + «Punchline with impact: pause at the colon, the last two words short and firm, like a slammed door.» | 1.4 | 0.3 | 0.65 | high |

### Beat 10

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 36 | Narrador | Los ingenieros le llaman inestabilidad de cadena. | Nombre técnico presentado como hallazgo (lámina en pantalla). | BASE + «Introducing a technical name as a discovery, with pride and clarity.» | 1.45 | 0.0 | 0.42 | mid |
| 37 | Narrador | La cadena es simplemente la fila de autos. | Traducción amable. | BASE + «Translating into kitchen-table language: friendly, clear, spirits still high.» | 1.5 | 0.0 | 0.42 | mid |
| 38 | Narrador | Si es estable, un titubeo se va apagando mientras viaja hacia atrás. | Contraste A: se apaga (joroba que baja). | BASE + «First half of a contrast: pitch dropping and fading, energy still contained.» | 1.45 | 0.0 | 0.42 | mid |
| 39 | Narrador | Si es inestable, cada conductor le suma un poquito, como un chisme que crece cada vez que alguien lo cuenta. | Contraste B: crece; «chisme» con sonrisa; luego Eli lee el globo (1 s). | BASE + «Second half of the contrast: growing and growing; the final comparison with a gossip's grin.» | 1.5 | 0.0 | 1.0 | high |
| 40 | **ELI** (cita) | ¡¿Que yo qué?! | Ofendidísimo: el chisme llegó a él. | BASE + «Quoting a deeply offended friend: loud, high, exasperated, in the narrator's own voice.» | 1.55 | 0.3 | 0.65 | high |

### Beat 11

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 41 | Narrador | El embotellamiento no es un grupo fijo de autos: los autos entran por detrás, avanzan despacito y salen por delante. | La idea central, visual: el auto marcado cruza el grupo. | BASE + «The central idea, visual: describing movement with energy, each clause a gesture.» | 1.45 | 0.0 | 0.42 | mid |
| 42 | Narrador | Los autos se van; el embotellamiento se queda. | Paradoja en dos mitades. | BASE + «A paradox in two halves: a pause in the middle, the second half with wonder.» | 1.4 | 0.0 | 0.5 | high |
| 43 | Narrador | Es como la ola en un estadio: nadie se cambia de asiento, pero la ola le da la vuelta entera. | Analogía del estadio; luego el gag de Eli que se levanta tarde (1,2 s). | BASE + «Fun stadium analogy: a fan's energy, the ending like the wave going all the way around.» | 1.5 | 0.0 | 1.2 | high |
| 44 | Narrador | Un embotellamiento no es un lugar. | La frase lema, primera vez: con peso. | BASE + «The episode's motto line: with weight, every word matters, pitch left in the air.» | 1.3 | 0.0 | 0.5 | mid |
| 45 | Narrador | Es una ola. | Remate del lema: corto y con brillo. | BASE + «The motto's payoff: three words, short, bright, with a smile.» | 1.3 | 0.0 | 0.65 | high |

### Beat 12

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 46 | Narrador | Pero no todos los círculos se atascan. | Giro: «espera». | BASE + «Unexpected turn: a 'wait' in the voice, energy changes direction.» | 1.5 | 0.0 | 0.42 | mid |
| 47 | Narrador | El mismo equipo repitió el experimento en un estadio de béisbol, el Domo de Nagoya, con una pista de trescientos catorce metros. | Dato claro; «trescientos catorce» nítido. | BASE + «Facts with figures: a little slower and very clear on the numbers, but with the thrill of 'look what they did'.» | 1.3 | 0.6 | 0.42 | mid |
| 48 | Narrador | Con veinticinco autos, el tráfico fluyó. | Lado A: alivio. | BASE + «Side A of a comparison: relief, it flows.» | 1.4 | 0.6 | 0.42 | mid |
| 49 | Narrador | Con veintiocho o más: embotellamiento. <br>*(motor: «Con veintiocho o más… embotellamiento.»)* | Lado B: pausa corta en los dos puntos y golpe en «embotellamiento». | BASE + «Side B of the comparison: a pause before the last word, and the last word as a blow.» | 1.4 | 0.0 | 0.42 | high |
| 50 | Narrador | Tres autos de más. | Remate seco, incrédulo; pausa antes. | BASE + «Dry punchline: short, almost flat, a hidden smile; the joke is in the pause before it.» | 1.3 | 0.45 | 0.35 | mid |
| 51 | **ELI** (cita) | ¡¿Quién f…? <br>*(motor: «¡¿Quién fue?!»)* | Se sintetiza «¡¿Quién fue?!» y el audio se corta en la /f/ al verse entre los tres (cue record_scratch); 1,5 s de pausa. | BASE + «Quoting an impatient, indignant friend: louder, exasperated, incredulous; the narrator's own voice, no cartoon.» | 1.55 | 0.3 | 1.5 | high |
| 52 | Narrador | Lo que importa es cuántos autos hay en cada tramo de pista: la densidad. | La palabra clave, presentada al final. | BASE + «Presenting the key word: the sentence rises to the final word and lets it ring.» | 1.45 | 0.0 | 0.42 | mid |
| 53 | Narrador | Por debajo de cierta densidad, los titubeos se apagan. | Contraste A: se apagan. | BASE + «First half of a contrast: pitch dropping and fading, energy still contained.» | 1.45 | 0.0 | 0.42 | mid |
| 54 | Narrador | Por encima, crecen. | Corto y ominoso; la música pasa a menor. | BASE + «Short and ominous, yet excited: almost a projected whisper.» | 1.3 | 0.0 | 0.65 | high |

### Beat 13

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 55 | Narrador | Ahora llévalo a una autopista en hora pico. | Cambio de escala: invita (colina de noche). | BASE + «Inviting to imagine the scene: visual, with momentum, as if drawing it in the air.» | 1.5 | 0.0 | 0.42 | mid |
| 56 | Narrador | Ahí, una sola ola puede viajar hacia atrás más de diez kilómetros, a quince o veinte por hora. | Asombro por la magnitud; números claros. | BASE + «A fact with wonder: numbers clear and slightly slower, the ending with surprise.» | 1.4 | 0.6 | 0.45 | high |
| 57 | Narrador | O sea que el embotellamiento en el que estás ahora mismo, llámalo trancón, taco o tráfico, pudo empezar con un frenazo de hace media hora. | Habla contigo: complicidad; la lista regional con sonrisa; «media hora» con asombro. | BASE + «Talking straight to the viewer, with complicity; the regional list with a smile; the ending with wonder.» | 1.5 | 0.0 | 0.45 | high |
| 58 | Narrador | Ese conductor ya llegó a su casa. | Preparación del chiste, dicha como dato. | BASE + «Setup of a joke delivered as a plain fact, with a hidden smile.» | 1.45 | 0.0 | 0.5 | mid |
| 59 | Narrador | Por eso no ves ninguna razón: la razón ya se fue a cenar. | Remate seco del episodio; sin voz graciosa; luego el tenedor y el dedo que baja (1,2 s). | BASE + «Dry punchline: pause at the colon, second half flat and smiling, no funny voice.» | 1.4 | 0.0 | 1.2 | mid |
| 60 | **ELI** (cita) | ¿Ni un perdón? | Dolido, lento: baja el dedo acusador. | BASE + «Quoting a hurt, sheepish friend: softer and slower, a little whiny, but alive.» | 1.25 | 0.3 | 1.0 | low |

### Beat 14

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 61 | Narrador | Entonces, ¿cómo se detiene una ola? | Pregunta real que abre el acto 3. | BASE + «A real, intrigued question, truly asked to the viewer, pitch rising at the end.» | 1.45 | 0.0 | 0.45 | high |
| 62 | Narrador | ¿Hay que cambiar a todos los conductores? | Opción 1, un poco absurda (burbuja del reglamento). | BASE + «A question proposing a slightly absurd option: quick, eyebrow raised.» | 1.5 | 0.0 | 0.4 | mid |
| 63 | Narrador | ¿Llenar la autopista de autos robot? | Opción 2, más absurda (burbuja de robots). | BASE + «A question proposing the most absurd option of all: even quicker, amused.» | 1.5 | 0.0 | 0.55 | mid |
| 64 | Narrador | Unos años después, un equipo en Estados Unidos armó otra vez el círculo, con veintiún autos. | Dato claro: «veintiún» nítido. | BASE + «Facts with figures: a little slower and very clear on the numbers, but with the thrill of 'look what they did'.» | 1.4 | 0.6 | 0.42 | mid |
| 65 | Narrador | A los conductores les dieron una instrucción, para que no arreglaran las olas por su cuenta: manejen como en hora pico. | La instrucción como cita (pausa en los dos puntos). | BASE + «Narrate, then quote the instruction they were given: pause at the colon, the quote in a commanding tone.» | 1.45 | 0.0 | 0.38 | mid |
| 66 | Narrador | Si se abre un hueco, ciérrenlo. | Orden corta y divertida: es exactamente lo que Eli hace siempre. | BASE + «A short, amusing order, like a bumper-sticker motto.» | 1.45 | 0.0 | 0.35 | high |
| 67 | **ELI** (cita) | ¡Mi lema! | Orgulloso: se prende el gafete. | BASE + «Quoting a suddenly proud friend: loud, cheerful, chest puffed out.» | 1.5 | 0.3 | 0.8 | high |

### Beat 15

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 68 | Narrador | Pero uno de esos autos era distinto. | «Pero» de misterio: el halo. | BASE + «A 'but' of mystery: volume a little lower, intrigue higher.» | 1.45 | 0.0 | 0.42 | mid |
| 69 | Narrador | Una computadora controlaba su velocidad, con una idea muy simple: no perseguir al de adelante. | La idea simple; «no perseguir» con énfasis. | BASE + «A very simple idea: pause at the colon, final words stressed, almost syllable by syllable.» | 1.45 | 0.0 | 0.42 | mid |
| 70 | Narrador | Ir a la velocidad promedio del tráfico, o sea, a lo que de verdad avanzan todos, contando frenadas y arrancones. | Traducción cálida de «promedio». | BASE + «Translating into kitchen-table language: friendly, clear, spirits still high.» | 1.45 | 0.0 | 0.42 | mid |
| 71 | Narrador | El espacio de adelante se estira y se encoge, como un resorte. | Imagen física juguetona (resorte en pantalla). | BASE + «Playful and visual, narrating moving drawings: small pitch jumps.» | 1.5 | 0.0 | 0.65 | mid |

### Beat 16

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 72 | Narrador | La ola se derritió. | Alivio y sorpresa feliz. | BASE + «Relief and happy surprise: exhaling the sentence with a smile.» | 1.4 | 0.0 | 0.5 | high |
| 73 | Narrador | Los cambios de velocidad bajaron cerca de un ochenta por ciento. | Dato con asombro: «ochenta» claro. | BASE + «A fact with wonder: numbers clear and slightly slower, the ending with surprise.» | 1.4 | 0.6 | 0.42 | high |
| 74 | Narrador | Los frenazos fuertes casi desaparecieron. | Resultado afirmativo (gafete que se dobla). | BASE + «A result told with calm enthusiasm, clear, affirmative.» | 1.45 | 0.0 | 0.42 | mid |
| 75 | Narrador | En esa pista chiquita, los autos gastaron hasta un cuarenta por ciento menos de gasolina. | Dato con asombro: «cuarenta» claro. | BASE + «A fact with wonder: numbers clear and slightly slower, the ending with surprise.» | 1.4 | 0.6 | 0.45 | high |
| 76 | Narrador | Todo eso, con un solo auto de veintiuno. | La cifra que importa: pausa antes de «un solo». | BASE + «The number that matters: pause before 'un solo' and stress on it, with wonder.» | 1.3 | 0.0 | 0.65 | mid |

### Beat 17

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 77 | Narrador | Después, programaron la computadora un poquito más rápido que el promedio. | Travesura: Eli sube la perilla silbando. | BASE + «Mischief: told as if already smelling the disaster, with a sly smile.» | 1.5 | 0.0 | 0.42 | mid |
| 78 | Narrador | La ola volvió. | Corto: «¿ves?». | BASE + «A very short line of amused surprise: 'see?'.» | 1.3 | 0.0 | 0.3 | high |
| 79 | **ELI** (cita) | ¡¿Quién fue?! | Automático, a todo pulmón; luego todos lo miran (1,2 s). | BASE + «Quoting a friend shouting on reflex, full lungs, before realizing it was him.» | 1.55 | 0.3 | 1.2 | high |
| 80 | **MILA** (cita) | Eli. | Plano y seco: una palabra que lo dice todo. | BASE + «Quoting a serene friend staring at him: one word, flat, dry, with a smile; alive, not dull.» | 1.25 | 0.3 | 0.45 | low |
| 81 | **ELI** (cita) | …Fue el viento. <br>*(motor: «Fue el viento.»)* | Excusa lenta y avergonzada (silbido antes y después en la mezcla); 1 s de hojita. | BASE + «Quoting a friend inventing a slow, sheepish excuse, eyes to the sky; alive.» | 1.25 | 0.3 | 1.0 | low |
| 82 | Narrador | Ser paciente no es ir lento. | EL ajá del episodio: lo más lento, íntimo y emocionado. | BASE + «THE aha of the episode: the slowest and clearest, intimate and excited at once, every word with weight.» | 1.25 | 0.4 | 0.5 | low |
| 83 | Narrador | Es ir al promedio. | Remate del ajá: corto y firme. | BASE + «Payoff of the aha: short, firm, bright; let it ring.» | 1.25 | 0.0 | 0.65 | low |

### Beat 18

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 84 | Narrador | Esta es la parte favorita de Mila. | Confidencia cariñosa. | BASE + «A fond confidence: lower volume, closer voice, still sparkling.» | 1.45 | 0.0 | 0.42 | low |
| 85 | Narrador | En otra prueba no hubo computadora. | Giro: «y ahora sin red». | BASE + «Unexpected turn: a 'wait' in the voice, energy changes direction.» | 1.5 | 0.0 | 0.42 | mid |
| 86 | Narrador | Solo un conductor entrenado, con un único número: la velocidad promedio. | La clave repetida al final. | BASE + «Presenting the key word: the sentence rises to the final word and lets it ring.» | 1.4 | 0.0 | 0.35 | mid |
| 87 | **ELI** (cita) | ¡Hay un hueco! ¡Un hueco enorme! | Pánico rápido de copiloto. | BASE + «Quoting a panicking friend: very fast, high, two chained exclamations.» | 1.6 | 0.3 | 0.35 | high |
| 88 | **MILA** (cita) | Ese hueco es mi amigo. | Serena al volante, sonriendo; luego le baja la mano (1,5 s). | BASE + «Quoting a serene, happy friend at the wheel: soft, unhurried, smiling; alive, never dull.» | 1.3 | 0.3 | 1.5 | low |
| 89 | Narrador | Los cambios de velocidad bajaron casi a la mitad. | Dato con asombro: «mitad». | BASE + «A fact with wonder: numbers clear and slightly slower, the ending with surprise.» | 1.4 | 0.3 | 0.42 | mid |
| 90 | Narrador | La gasolina, más o menos una quinta parte. | Resultado afirmativo. | BASE + «A result told with calm enthusiasm, clear, affirmative.» | 1.4 | 0.0 | 0.45 | mid |
| 91 | Narrador | Una sola persona paciente. | Remate íntimo, con admiración. | BASE + «An intimate payoff: short, low in volume, admiring.» | 1.3 | 0.3 | 0.65 | low |

### Beat 19

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 92 | Narrador | ¿Por qué funciona? | Pregunta real. | BASE + «A real, intrigued question, truly asked to the viewer, pitch rising at the end.» | 1.45 | 0.0 | 0.45 | high |
| 93 | Narrador | Porque un espacio libre es un amortiguador: se come el frenazo antes de que llegue a los demás. | La idea visual: el resorte se come el frenazo. | BASE + «The central idea, visual: describing movement with energy, each clause a gesture.» | 1.45 | 0.0 | 0.42 | mid |
| 94 | Narrador | El auto paciente llega tarde al embotellamiento, cuando ya se está despejando, así que nunca tiene que detenerse. | La lógica encadena. | BASE + «The logic chains: each part pushes the next, energy rising toward the end.» | 1.45 | 0.0 | 0.42 | mid |
| 95 | Narrador | Los de atrás ni sienten la ola. | Resultado: nadie frena. | BASE + «A result told with calm enthusiasm, clear, affirmative.» | 1.45 | 0.0 | 0.45 | mid |
| 96 | Narrador | Por una vez, llegar tarde es la jugada. | Remate con guiño a Eli (pausa antes). | BASE + «Punchline with a wink at the friend: pause before, last word with a smile.» | 1.4 | 0.3 | 0.35 | high |
| 97 | **ELI** (cita) | ¡Yo llego tarde a todo! | Orgullo repentino, pulgares a sí mismo. | BASE + «Quoting a suddenly proud friend: loud, cheerful, chest puffed out.» | 1.55 | 0.3 | 0.6 | high |
| 98 | Narrador | En Japón esto tiene nombre: manejo que absorbe embotellamientos. | Nombre técnico como hallazgo. | BASE + «Introducing a technical name as a discovery, with pride and clarity.» | 1.45 | 0.0 | 0.42 | mid |
| 99 | Narrador | Ojo: no es magia. | Honesto, dedo levantado. | BASE + «Honest and direct, like raising a finger: 'careful'.» | 1.4 | 0.0 | 0.42 | mid |
| 100 | Narrador | Si la vía está simplemente repleta, ningún conductor puede absorber eso. | Cierre honesto (gag del peaje). | BASE + «Honest closing: clear, firm, spirits intact.» | 1.45 | 0.0 | 0.65 | mid |

### Beat 20

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 101 | Narrador | ¿Funciona en una autopista de verdad? | Pregunta real que abre el acto 4. | BASE + «A real, intrigued question, truly asked to the viewer, pitch rising at the end.» | 1.45 | 0.0 | 0.45 | high |
| 102 | Narrador | En noviembre de dos mil veintidós, cerca de Nashville, en Tennessee. | Dato claro: fecha y lugar nítidos. | BASE + «Facts with figures: a little slower and very clear on the numbers, but with the thrill of 'look what they did'.» | 1.3 | 0.6 | 0.42 | mid |
| 103 | Narrador | Un equipo metió cien autos al tráfico de hora pico con un control de crucero inteligente: un programa que decide cuándo acelerar y cuándo frenar. | La idea visual: 100 halos; «cien» claro. | BASE + «The central idea, visual: describing movement with energy, each clause a gesture.» | 1.45 | 0.3 | 0.42 | mid |
| 104 | Narrador | ¿El resultado? Es complicado. <br>*(motor: «¿El resultado?… Es complicado.»)* | Pregunta corta, pausa, respuesta honesta con media sonrisa. | BASE + «A short question and an honest answer after a pause: the answer with half a smile.» | 1.4 | 0.3 | 0.45 | mid |
| 105 | Narrador | Cien autos son una gota en una autopista. | Comparación con ternura. | BASE + «An everyday comparison, with a smile and a little tenderness.» | 1.45 | 0.0 | 0.42 | mid |
| 106 | Narrador | No borraron todas las olas, y tampoco esperaban hacerlo. | Cierre honesto. | BASE + «Honest closing: clear, firm, spirits intact.» | 1.45 | 0.0 | 0.65 | mid |

### Beat 21

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 107 | Narrador | Pero hay un momento que Eli no deja de repetir. | El segundo «mira esto» de la biblia. | BASE + «Like saying 'look at this': growing enthusiasm, sharing a paradox.» | 1.5 | 0.0 | 0.42 | high |
| 108 | Narrador | Una ola viaja hacia atrás por la autopista. | Primer paso del relato. | BASE + «First step of a chain: clear and crisp, setting up what follows.» | 1.45 | 0.0 | 0.42 | mid |
| 109 | Narrador | Pasan dos autos inteligentes, y se achica. | Relato deportivo: el equipo gana. | BASE + «Live sports commentary: fast, excitement rising, cheerful ending.» | 1.5 | 0.0 | 0.3 | high |
| 110 | **ELI** (cita) | ¡Dale, dale! | Solo cuadro (sin voz): porra de estadio; la narración no se interrumpe (respiración). | *(sin voz: solo cuadro; hueco de 0.3 s)* | — | — | 0.0 | — |
| 111 | Narrador | Pasan cuatro con el sistema apagado, y crece. | Relato deportivo: pierde terreno. | BASE + «Live sports commentary, but the team loses ground: fast, the ending with comic disappointment.» | 1.5 | 0.0 | 0.3 | high |
| 112 | **ELI** (cita) | ¡Nooo! | Solo cuadro (sin voz): la bandera cae; la narración sigue. | *(sin voz: solo cuadro; hueco de 0.3 s)* | — | — | 0.0 | — |
| 113 | Narrador | Pasan más autos inteligentes, y se achica otra vez. | Relato deportivo: remonta; Eli hace la ola a tiempo. | BASE + «Live sports commentary: fast, excitement rising, cheerful ending.» | 1.5 | 0.0 | 0.42 | high |
| 114 | Narrador | Cada auto que la cruza la hace crecer o encoger. | Conclusión clara; luego 1 s (Eli hace la ola a tiempo). | BASE + «Clear conclusion: a bit slower, each half of the sentence with its weight.» | 1.4 | 0.0 | 1.0 | mid |

### Beat 22

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 115 | Narrador | O sea que tú también eres parte de la ola. | Directo a ti: te incluye. | BASE + «Straight to you, warm and excited: you're part of the story now.» | 1.45 | 0.0 | 0.42 | mid |
| 116 | Narrador | Así que deja un espacio: uno seguro, no uno enorme. | Consejo 1 (tarjeta en pantalla). | BASE + «Practical advice from a friend: clear and close, with conviction.» | 1.4 | 0.0 | 0.42 | mid |
| 117 | Narrador | No corras a cerrarlo. | Consejo corto, cómplice; pausa de 0,8 s (gafete a la guantera). | BASE + «Short advice, almost an energetic whisper: complicit.» | 1.4 | 0.0 | 0.8 | mid |
| 118 | Narrador | Maneja a la velocidad real del tráfico, no a la que te gustaría. | Consejo 2. | BASE + «Practical advice from a friend: clear and close, with conviction.» | 1.4 | 0.0 | 0.42 | mid |
| 119 | Narrador | No llegas más tarde: la misma distancia, el mismo tiempo, menos frenazos. | Lista de tres que tranquiliza. | BASE + «A reassuring list of three: even rhythm, the last item with a smile.» | 1.4 | 0.0 | 0.65 | mid |

### Beat 23

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 120 | Narrador | Mismo camino. Mismo toque de freno, allá adelante. | Eco del gancho: bajito, emocionado. | BASE + «Echo of the episode's opening: soft and excited, recognizing the place.» | 1.4 | 0.0 | 0.42 | low |
| 121 | Narrador | Solo que esta vez, Eli sí deja el espacio. | El pago; «sí» subrayado; luego 5 s de silencio (la ola muere). | BASE + «The story's payoff: slow, clear, stress on 'sí'; the sentence opens into the silence.» | 1.3 | 0.0 | 5.0 | low |
| 122 | **ELI** (cita) | ¿…Quién fue? <br>*(motor: «¿Quién fue?»)* | Susurro, casi para sí, tras el silencio. | BASE + «Quoting a friend asking softly, almost to himself, confused and moved.» | 1.25 | 0.3 | 0.5 | low |
| 123 | **MILA** (cita) | Fuiste tú. | Sonriendo: esta vez es un elogio; 1 s (risa). | BASE + «Quoting a friend saying it with a proud smile: two soft, luminous words.» | 1.25 | 0.3 | 1.0 | low |

### Beat 24

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 124 | Narrador | En algún lugar detrás de ellos, un embotellamiento que nunca pasó. | Lo más bajo del episodio, pero con brillo: un secreto. | BASE + «Intimate but excited, like a secret you cannot keep; low in volume, not in energy.» | 1.3 | 0.0 | 0.5 | low |
| 125 | Narrador | Un embotellamiento no es un lugar. | El lema, segunda vez: con peso. | BASE + «The episode's motto line: with weight, every word matters, pitch left in the air.» | 1.3 | 0.0 | 0.5 | low |
| 126 | Narrador | Es una ola. | Remate del lema. | BASE + «The motto's payoff: three words, short, bright, with a smile.» | 1.3 | 0.0 | 0.5 | mid |
| 127 | Narrador | Un solo conductor paciente puede absorberla. | Cierre cálido y esperanzador. | BASE + «Warm closing: clear, hopeful, slightly slower.» | 1.4 | 0.0 | 0.5 | mid |
| 128 | Narrador | Esto es Diez Mil Puntos. | Firma del canal (wordmark 2); 3 s hasta la pantalla final. | BASE + «The channel's signature: proud, projected, each word separate, like a stamp.» | 1.4 | 0.5 | 3.0 | high |

### Beat end

| # | Quién | Texto (guion v4, literal) | Intención (qué debe sentir/entender el público) | Instrucción exacta al motor | `rate` | Pausa antes | Pausa después | Energía |
|---|---|---|---|---|---|---|---|---|
| 129 | Narrador | La próxima vez: ¿por qué los buses llegan de a tres? | Teaser: intriga juguetona, pregunta real. | BASE + «Teaser for the next episode: playful intrigue, the question truly asked.» | 1.5 | 0.0 | 0.6 | high |
| 130 | **ELI** (cita) | ¡¿Quién fue?! | Etiqueta: el gag cierra el episodio. | BASE + «Quoting an impatient, indignant friend: louder, exasperated, incredulous; the narrator's own voice, no cartoon.» | 1.55 | 0.3 | 0.0 | high |

## 3 · Lo que en el guion le cuesta al registro (para el director)

- **Los remates secos** («En una pista vacía.», «Tres autos de más.», «la razón ya se fue a cenar.», «Es ir al
  promedio.») piden lo contrario del registro «nunca calmado»: aquí la instrucción baja la velocidad (`rate` 1,35-1,4)
  y pide «sonrisa escondida» en vez de calma, y la gracia se confía a la pausa anterior (0,3-0,45 s). Si al oído suenan
  demasiado «arriba», la alternativa es bajar solo esas filas a la instrucción de energía sin «exclamative».
- **El ajá (beat 17) y el cierre (beats 22-24)** son «lo más bajo del episodio» en la biblia; en este registro se
  resuelven como íntimo-emocionado (`low`), no como calma. Es la tensión principal entre la biblia y el gusto del
  Productor: vale la pena escuchar esas 12 filas con atención.
- **Cifras** («dos mil ocho», «doscientos treinta», «trescientos catorce», «veintiún», «ochenta», «cuarenta»): el
  motor acelerado tiende a comérselas; van a `rate` 1,35-1,4 con 0,6 s de aire antes y la retoma por WER las vigila.
- **Nombres**: «Eli» (Whisper lo oye «Ellie»; normalizado) y «Nashville / Tennessee» (grafía inglesa; se comprueba).
- **«¡¿Quién f…?»** se sintetiza entero y se corta en la /f/ al montar (cue `record_scratch`).
