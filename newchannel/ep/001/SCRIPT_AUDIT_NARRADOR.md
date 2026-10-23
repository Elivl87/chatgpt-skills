# Ep 001 · Auditoría del guion v3 frente a la biblia del narrador y al animatic v3 · 2026-10-23

Script Editor (agente independiente). **Solo lectura:** `SCRIPT_ES419.md` v3 sigue bloqueado; todo cambio va en la
**PROPUESTA DE CAMBIO** del final, para que la aprueben el Productor y Claude.

Pregunta del Productor (2026-10-23): *"¿El guion es el correcto para lo que debe decir el narrador (NARRADOR.md) y para
la animación ya hecha?"*

Fuentes leídas: `CLAUDE.md`, `PRODUCER_DECISIONS.md` (filas del 2026-10-23: personajes mudos, el narrador los cita, voz
expresiva), `voice/NARRADOR.md` (v1), `SCRIPT_ES419.md` (v3) + `SCRIPT_REVIEW.md`, los 8 `animatic/shots_block*.js`
(cada corte, rótulo, utilería y evento del sim), `animatic/QC_block*.md`, `animatic/qc/textbox_check.json`,
`animatic/GUARDIAN_REPORT_animatic_v3.md`, `audio/timings_es.json` y `audio/VOICE_QC_chatterbox.md` (toma de 8:31).

---

## 0 · Resumen y puntuaciones

| Criterio | Nota | En una línea |
|---|---|---|
| 1. Narración vs la biblia del narrador | **8** | Casi todo es "el amigo curioso que ya sabe el final": frases cortas, segunda persona, chistes secos. Cuatro frases de datos suenan a informe y dos son difíciles de decir de un tirón (beats 13 y 20). Falta algún "mira" en voz alta. |
| 2. Líneas de personaje citadas por el narrador | **7** | De las 21 líneas, **16 funcionan tal cual** como cita, **3 deben quedar solo en cuadro de texto** ("¿Qué?", "¡Dale, dale!", "¡Nooo!"), **1 necesita un marco** ("No… no… ¡no!") y **1 necesita un corte de audio** ("¡¿Quién f…?"). El trío del beat 17 se sostiene. |
| 3. Guion vs animación | **9** | Cada número, rótulo, sello y utilería que la narración nombra está en pantalla, ligado a la palabra. **Un desacuerdo de fondo:** el gafete "CIÉRRALO" vuelve al pecho de Eli después de la guantera y lo lleva puesto mientras deja el hueco. Un roce menor: "Vamos más despacio" bajo el sello ACELERADO ×3. |
| 4. Duración | **6** | 8:31 con pantalla final (meta 7:30-8:00). Recortables sin tocar la tesis: **≈ 12 s** de texto seguro + **≈ 11 s** opcionales; con un 4 % de tempo (144 → 150 ppm, dentro de la biblia) se llega a **≈ 7:50**. |
| (TTS / decibilidad) | 8 | Sin trabalenguas ni homófonos graves; cuidar "Eli deja" (Whisper oyó "él y deja"), "repitió" y el corte de "¡¿Quién f…?". |

**Veredicto corto:** el guion **sí** es el correcto para este narrador y para esta animación; no hay que reescribirlo.
Hacen falta **13 cambios mínimos** (abajo), de los cuales 5 son de texto, 5 de "quién habla / qué se dice en voz" y 3 de
duración; y **un arreglo en el animatic** (el gafete), que no es del guion.

---

## 1 · Narración frente a la biblia (beat por beat)

Criterios de `NARRADOR.md`: conversacional (tú, frases cortas, nunca da clase), curioso en voz alta, sorpresa real en el
gancho, "ajá" claro y lento, chistes secos, final cálido y bajo. Nunca: locutor, cuentacuentos, youtuber a gritos,
sarcasmo hacia el que mira, monotonía.

| Beat | Veredicto | Comentario |
|---|---|---|
| 1 Un toque | ✔ | "Una sola vez. Apenas un poquito." Frases de una respiración; tono de quien ya sabe lo que viene. |
| 2 Se rompe | ✔ | "Más fuerte. Más fuerte… hasta que alguien se queda quieto: Eli." Escalera natural para la voz. |
| 3 ¿Quién fue? | ✔ | "Pero allá no hay nada. Ni choque, ni conos, ni semáforo." Seco, visual. Confirmar "ni conos" al oído (ya previsto). |
| 4 La pregunta | ✔ | "Mila, su amiga, mira atrás." presenta a Mila sin dar clase. La pregunta final es el título: debe sonar a pregunta de verdad, no a rótulo. |
| 6 El círculo | ⚠ informe | "En dos mil ocho, un equipo de físicos en Japón puso veintidós autos en una pista circular de doscientos treinta metros." Es la frase de datos más "locutor" del guion (fecha + equipo + número + medida en una sola oración). Se salva con la pausa antes de cada número que pide la biblia. Opción mínima en la propuesta (P12). "Problema: en un círculo, todos tienen a alguien adelante." es exactamente el humor seco que pide la biblia. |
| 7 Titubeos | ✔ | "un hueco por aquí, un apretón por allá" / "En una pista vacía." Perfecto. |
| 8 Para atrás | ✔ | "Lo que a Mila le encanta:" es el narrador-amigo. Ahí cabe el único "mira" en voz alta del episodio (nota de lectura, no cambio). |
| 9 Estirar | ✔ (⚠ ver §3) | La cadena causal (lo nota tarde → ya se acercó → frena más) es el "ajá" chico: bajar ritmo. "Estiremos" es un "nosotros" de amigo, no de profesor: pasa. |
| 10 Inestabilidad | ⚠ clase | "Los ingenieros le llaman… Si es estable… Si es inestable…": definición + dos condicionales. Es el beat más cerca de la clase; lo rescata el chisme. Decirlo lento y con sonrisa en "chisme"; no cambiar texto. |
| 11 Una ola | ⚠ referente | "No es un grupo fijo de autos" llega justo después de "¡¿Que yo qué?!" de Eli: en voz, el oyente no sabe de qué es "No es". Falta el sujeto (**P1**). El resto ("Los autos se van; el embotellamiento se queda.", "Un embotellamiento no es un lugar. Es una ola.") es la tesis bien dicha. |
| 12 Tres autos | ⚠ informe | "El mismo equipo repitió el experimento en un estadio de béisbol, el Domo de Nagoya, con una pista de trescientos catorce metros." Larga; Whisper oyó "repicio" en la pista completa. "Con veinticinco… Con veintiocho o más: embotellamiento. Tres autos de más." es oro para la voz. |
| 13 Media hora | ✖ difícil de decir | "O sea que ese embotellamiento, trancón, taco o tráfico, en el que estás ahora mismo, pudo empezar…": una lista y una relativa metidas entre comas dentro del sujeto; en voz se pierde el verbo. **P2** la reordena sin perder los cuatro nombres regionales (las tarjetas siguen en pantalla). "la razón ya se fue a cenar" = el chiste seco modelo. "Seguro ya está cenando." duplica lo que la ventana ya muestra (**P3**). |
| 14 Cierra el hueco | ✔ | Tres preguntas retóricas con gag cada una. La instrucción "manejen como en hora pico. Si se abre un hueco, ciérrenlo." es una cita: pausa antes y "voz de instrucción", no de narrador (nota de lectura). |
| 15 El auto distinto | ✔ | "no perseguir al de adelante" + resorte. "o sea, a lo que de verdad avanzan todos" es la glosa conversacional correcta. |
| 16 Se derrite | ✔ | "La ola se derritió." Números con pausa previa (biblia). "Todo eso, con un solo auto de veintiuno." |
| 17 Demasiado ansioso | ✔ | "Ser paciente no es ir lento. Es ir al promedio." El "ajá" grande: bajar y aclarar. |
| 18 Persona paciente | ✔ | "Esta es la parte favorita de Mila." Confidencia de amigo. |
| 19 Amortiguador | ✔ | "¿Por qué funciona? Porque…" en segunda persona implícita; "Ojo: no es magia." honesto y seco. |
| 20 Cien autos | ✖ difícil de decir | 31 palabras sin punto: "En noviembre de dos mil veintidós, cerca de Nashville, en Tennessee, un equipo metió cien autos al tráfico de hora pico, con un control de crucero inteligente: un programa que decide cuándo acelerar y cuándo frenar." Un punto la arregla (**P4**). "¿El resultado? Es complicado." es exactamente el tono. |
| 21 La ola recuerda | ✔ | "Pero hay un momento que Eli no deja de repetir." El narrador conoce a Eli. |
| 22 Sé el espacio | ⚠ larga | "Maneja a la velocidad a la que de verdad se mueve el tráfico, no a la que te gustaría." Dos "a la que" seguidas: se traba. **P5**. El resto es el consejo dicho con calma (biblia §final). |
| 23 El mismo toque | ⚠ TTS | "Solo que esta vez, Eli deja el espacio.": Whisper oyó "él y deja" en las 6 tomas. Un "sí" lo separa y además subraya el pago (**P6**). |
| 24 Despedida | ✔ | "En algún lugar detrás de ellos, un embotellamiento que nunca pasó." Final cálido y bajo, como pide la biblia. |
| Etiqueta | ✔ | "La próxima vez: ¿por qué los buses llegan de a tres?" |

**Lo que falta respecto a la biblia (no es error, es matiz):** casi no hay "curiosidad en voz alta" ("mira esto", "un
momento…"). El episodio la lleva implícita en "Lo que a Mila le encanta:", "¿El resultado? Es complicado.", "Ojo:". No
propongo añadir palabras (estamos largos); propongo **dirección de voz**: el "mira" va en la entonación de "Lo que a Mila
le encanta:" (beat 8) y en "Pero hay un momento…" (beat 21).

**Trampas de TTS detectadas:** "Eli deja" (→ P6); "repitió" (→ opcional "volvió a hacer el experimento", no incluido por
no tocar más de lo necesario); "¡¿Quién f…?" no se puede sintetizar cortado (→ P9); "¡Nooo!" podría leerse letra por
letra (→ queda solo en cuadro, P8). "ola/hola", "casa/caza", "taco" se resuelven por contexto y por pantalla.

---

## 2 · Las 21 líneas de personaje, ahora citadas por el narrador

Regla nueva (Productor 2026-10-23 + biblia): Eli y Mila son mudos; el narrador lee sus frases con la misma voz y un
cambio mínimo de actitud (Eli más rápido e impaciente, Mila más serena), una respiración antes y después, mientras el
cuadro de texto sigue en pantalla. Criterios: ¿se entiende quién habla sin voz distinta?, ¿es corta?, ¿no van tres
seguidas sin aire?, ¿el gag es visual y no necesita voz?

| # | Beat · t (toma 8:31) | Quién | Línea | ¿Se entiende quién habla? | **Veredicto** |
|---|---|---|---|---|---|
| 1 | 3 · 0:18 | Eli | ¡¿Quién fue?! | Sí: el narrador acaba de decir "…se queda quieto: Eli." y el globo está sobre su cabeza. | **Cita tal cual** (enérgica, no a gritos). |
| 2 | 4 · 0:33 | Mila | Eli… va para atrás. | Sí: "Mila, su amiga, mira atrás." la presenta. | **Cita tal cual** (maravillada, bajito). |
| 3 | 4 · 0:35 | Eli | ¿Qué? | **No**: una palabra, misma voz, pegada a la frase de Mila: suena a que Mila sigue ("¿qué?"). El gag es la lupa (visual). | **Solo cuadro de texto.** El narrador respira ahí y entra con "Entonces, ¿por qué…". |
| 4 | 6 · 0:50 | Eli | ¡Ya entendí! ¡Fue el de adelante! | Sí por contenido (es la tesis de Eli) y por el plano B02 (Eli señalando). | **Cita tal cual** (muy seguro). |
| 5 | 7 · 1:28 | Eli | ¡¿Quién fue?! | Sí (gag recurrente, siempre Eli). | **Cita tal cual.** |
| 6 | 9 · 2:01 | Eli | No… no… ¡no! | **Dudoso**: tras "El tercero, más tarde y más fuerte todavía." un "no… no… ¡no!" se oye como el narrador negando. Además la narración nunca dice que Eli es el auto diez (lo dice solo la imagen). | **Añadir marco:** "Eli va en el diez:" (4 palabras, ≈ 1,7 s) antes de la cita. Arregla las dos cosas. |
| 7 | 10 · 2:27 | Eli | ¡¿Que yo qué?! | Sí si hay respiración y cambio de actitud: el globo gigante con su dibujito llega a Eli. | **Cita tal cual** (ofendidísimo). |
| 8 | 12 · 3:12 | Eli | ¡¿Quién f…? | Sí (gag recurrente), pero el TTS no corta a media palabra. | **Cita con corte de audio:** sintetizar "¡¿Quién fue?!" y cortar el audio en la /f/ en el montaje (el cue `record_scratch` ya existe en D13); el cuadro sigue diciendo "¡¿Quién f…?". |
| 9 | 13 · 3:58 | Eli | ¿Ni un perdón? | Sí; y si alguien lo oye como pregunta del narrador, sigue siendo chiste. | **Cita tal cual** (dolido). |
| 10 | 14 · 4:25 | Eli | ¡Mi lema! | Sí: nadie más reclamaría ese lema; Eli se prende el gafete en pantalla. | **Cita tal cual** (orgulloso). |
| 11 | 17 · 5:14 | Eli | ¡¿Quién fue?! | Sí. | **Cita tal cual** (automático, a todo pulmón). |
| 12 | 17 · 5:16 | Mila | Eli. | Sí, por la pausa de la mirada colectiva y porque un "Eli." plano funciona incluso oído como voz del narrador. | **Cita tal cual** (plano). Son tres líneas seguidas (11-13), pero es el gag grande del medio y las separan el silencio y la hojita: se mantiene. |
| 13 | 17 · 5:17 | Eli | …Fue el viento. | Sí (silbido antes). | **Cita tal cual** (vel. 0,9). |
| 14 | 18 · 5:35 | Eli | ¡Hay un hueco! ¡Un hueco enorme! | Casi: viene tras una frase explicativa ("con un único número: la velocidad promedio."). La salva el pánico en la voz y Eli señalando el hueco con la regla. | **Cita tal cual** (pánico, rápida). Si en la prueba de voz se confunde: marco "Eli, de copiloto:" (opcional). |
| 15 | 18 · 5:37 | Mila | Ese hueco es mi amigo. | Sí: contraste pánico → calma. | **Cita tal cual** (serena). |
| 16 | 19 · 6:09 | Eli | ¡Yo llego tarde a todo! | Sí por los pulgares de Eli; oído como confesión del narrador también hace gracia. | **Cita tal cual** (orgullo repentino). |
| 17 | 21 · 7:03 | Eli | ¡Dale, dale! | **No aplica**: el guion la quería *debajo* de la narración (−6 dB), imposible si el narrador es la única voz. Es porra de estadio: la bandera y el cuadro la cuentan. | **Solo cuadro de texto.** |
| 18 | 21 · 7:08 | Eli | ¡Nooo! | Igual que la 17, y "Nooo" es trampa de TTS. | **Solo cuadro de texto.** |
| 19 | 23 · 7:51 | Eli | ¿…Quién fue? | Sí: tras 5 s de silencio, bajito. | **Cita tal cual** (casi para sí). |
| 20 | 23 · 7:53 | Mila | Fuiste tú. | Sí: alternancia y sonrisa en la voz. | **Cita tal cual** (sonriendo). |
| 21 | Etiqueta · 8:16 | Eli | ¡¿Quién fue?! | Sí. | **Cita tal cual.** |

**Totales:** 16 citas tal cual · **1 con marco** (#6) · 1 con corte de audio (#8) · **3 solo cuadro** (#3, #17, #18) ·
(0 reescritas a narración). "upsi" (beat 12) ya es solo cuadro: correcto.

**Regla de lectura para la voz** (va a la nota de voz del guion): una respiración antes y después de cada cita; en
las citas el narrador **no imita** a Eli ni a Mila: cambia la actitud, no la voz (biblia). Las citas se sintetizan como
trozos aparte (`speaker: eli/mila` en `script_parse.py` ya los separa), con exageración un punto más alta que la
narración, y conservan los `slot` de lectura del cuadro de texto (`textbox_check`: 0,4 s + 0,06 s/carácter).

---

## 3 · Guion vs animación (lo que se dice vs lo que se ve)

Revisé los 8 bloques plano por plano (`shots_block*.js`). **Todo lo que la narración afirma se ve, atado a su palabra:**
el toque en "freno" (A02); la cascada y el alto de Eli en "quieto"; las tres viñetas tachadas; el pajarito; la flecha
hacia atrás en "atrás"; 230 m, 22, ~30 km/h (aguja = media real del sim, 27 km/h); el reloj ×10 y 3:00 en "minutos";
los 5 parados; ≈20 km/h ← (medido −18,8) y la bici; barras, relojito de arena, regla, el diez; lámina INESTABILIDAD DE
CADENA, eslabones, dos jorobas (×6/×8), chisme; auto marcado, gradas, lámina UNA OLA; 314 m, 25/28, tres autos que caen,
pantalla "ÉL", DENSIDAD, tramo contado, medidor; regla 10 km, reloj hasta 0:33, cuatro nombres regionales, granja,
tenedor en "cenar", sándwich; reglamento, robots "$$$$", 21, tarjeta, gafete; halo, COMPUTADORA, PROMEDIO, agujas,
gráfico, resorte, jalón del delantal; −80 %, frenazos ≈ 0, hasta −40 %, 1 / 21, gafete que se dobla; laptop y perilla,
mirada colectiva, hojita, PACIENTE = PROMEDIO; "Mila hace de conductora", pegatina PROMEDIO, regla del hueco, ≈ −50 %,
−22 %; dos líneas de tiempo ELI/MILA MANEJA, resorte, pulgares, lámina de Nishi, peaje, anillo de 40; Nashville/nov.
2022, 100, halos, chip ACC, cuenta con los dedos, gota; bandera, línea de velocidad con pasadas en "achica"/"crece",
ola a tiempo, perfil por auto; TÚ TAMBIÉN, DEJA UN ESPACIO SEGURO, ✓/✗, guantera, MANEJA AL PROMEDIO, tap-tap,
= distancia / = tiempo / − frenazos; mismo toque ×3, resorte, nadie frena detrás, dedo, pajarito con el ala; grúa,
"¿embotellamiento?", láminas finales, el punto atrapado a tiempo, choque de puños; parada, tres buses, "3 de a tres".

### Desacuerdos (de mayor a menor)

| # | Dónde | Guion dice | Animación hace | Gravedad · arreglo |
|---|---|---|---|---|
| M1 | Beat 22-24 · E2 H03_back → J03 (y I05, I07) | El gafete "SI SE ABRE UN HUECO, CIÉRRALO" va a la guantera; la guantera lo escupe; **Mila lo devuelve a la guantera** y la cierra con la rodilla. Pago: Eli abandona su lema. | Tras el brinco, el gafete **vuelve al pecho de Eli** (`badge: A.ramp(t, tKnee + 0.9…)`, Guardián: "continuidad H04-J03") y lo lleva puesto mientras deja el hueco, mientras Mila lo señala en "Fuiste tú." y en el plano final. | **Alta (tesis):** la imagen dice "cierra el hueco" mientras la voz dice "deja un espacio". **No es del guion: arreglo del animatic.** Opción a: el gafete se queda en la guantera (Mila la cierra con la rodilla y ya) y Eli va sin gafete de H03_back en adelante. Opción b (mejor pago): Mila lo devuelve **al revés**: el dorso en blanco, o lo voltea y dice "DEJA UN ESPACIO" (la tarjeta de pantalla del beat 22). |
| M2 | Beat 9 · C03, C06-C08 | "Vamos más despacio." | Sello **ACELERADO ×2 / ×3** en esos planos (honesto: a ×2 el tercero no cae en "tercero"). Los primeros planos C04-C05 sí van a ×1. | **Baja:** el oyente entiende "más despacio" como ritmo del relato, pero la contradicción está en pantalla. Opción de texto que conserva el ancla `Vamos`: "Vamos por partes." (P13, opcional). |
| M3 | Beat 9 · C07-C08 | Eli **es** el auto 10 (acotación). | Se ve (auto teal con el 10), pero la **narración nunca lo dice**; sin voz de Eli, "No… no… ¡no!" queda sin dueño. | **Media:** la resuelve el marco de P7 ("Eli va en el diez:"). |
| M4 | Beat 18 · D2 F12 | "A Eli se le van las manos al volante; Mila se las baja con suavidad. Luego mira atrás: los autos ya no frenan tanto." | Eli agarra el volante (pose `drive`) y se da la vuelta cruzado de brazos; no hay "bajar la mano" ni mirada atrás; siguen los medidores. | **Baja:** la narración no lo afirma; el gag de la calma de Mila se lee igual. Sin cambio. |
| M5 | Beat 19 · D2 F23_toll | Gag del peaje: Eli deja un hueco enorme y el de al lado se mete. | Peaje genérico (`E.drawToll`), sin Eli ni Mila. | **Baja:** la narración ("Si la vía está simplemente repleta…") se sostiene con el peaje y el anillo de 40. Sin cambio; se anota como gag perdido. |
| M6 | Beat 6 · B06 | El dedo termina señalando "su propia espalda". | Termina señalándose el pecho (`pointSelf`, QC B). | **Cosmética.** |
| M7 | Beat 21 · E1 G14 | "Pasan cuatro con el sistema apagado, **y crece**." | El bache crece ≈ +0,3 km/h: hace falta "escala ×2,7" en pantalla (QC E1); el perfil G19 lo muestra honesto, pequeño. | **Baja (honestidad):** la palabra "crece" promete más que la imagen. Opción (+2 palabras): "y crece un poco." (P14, opcional). |
| M8 | Beat 13 · D18-D21 | Reloj "0:00 → 0:30". | Reloj hasta **0:33** (10 km a la velocidad medida); pastilla "hace 0:33". | **Ninguna:** la narración dice "hace media hora" con "pudo"; el reloj es más honesto que el guion. Actualizar la lista TEXTOS EN PANTALLA cuando se abra el guion. |
| M9 | Beat 4 · A14-A15 | Mila "barbilla en el respaldo". | Brazos cruzados girada en el asiento (QC A). | **Cosmética.** |

**Gags que la animación añadió y que la narración sí sostiene** (no requieren texto): lámina "¡NO ARREGLEN NADA!"
(glosa de "para que no arreglaran las olas por su cuenta"; conviene que no parezca cita literal de los investigadores:
sin signos de exclamación, o en letra de "nota nuestra"), pastilla COMPUTADORA, chip "ACC" con ▲ acelerar / ▼ frenar,
lámina TÚ TAMBIÉN, "¿embotellamiento?" en "nunca", medallas = distancia / = tiempo / − frenazos, "3 de a tres", el cuarto
bus que no para, el pajarito en el letrero. Ninguno contradice una palabra del guion.

---

## 4 · Duración: qué se puede recortar

Medido en `timings_es.json` (Chatterbox, 144 ppm dentro de las líneas): narración + huecos de personaje terminan en
8:17 (496,9 s); con los 20 s de pantalla final (la etiqueta va dentro), **8:31**. Meta: 7:30-8:00. Hay que quitar
**31-61 s**. Al pasar las 21 líneas a voz del narrador el total puede crecer ≈ 2 s (57 palabras a 144 ppm ≈ 24 s frente
a los 22 s de hueco que hoy ocupan), menos lo que se ahorra dejando tres solo en cuadro.

Cálculo: 0,42 s por palabra (144 ppm) + 0,35 s por frase que desaparece. Cada recorte indica qué **ancla de palabra**
del animatic hay que mover (los planos se atan a palabras: si la palabra desaparece, el plano queda sin duración y la
línea de tiempo lo rechaza).

### Nivel A · seguros (no tocan tesis, datos ni gags) · ≈ 12 s

| Beat | Recorte | Ahorro | Anclas del animatic |
|---|---|---|---|
| 13 | Quitar "Seguro ya está cenando." (la ventana ya lo muestra y "la razón ya se fue a cenar" lo remata) | ≈ 2,0 s | C2 `D23_dinner` arranca en `Seguro` → mover a `casa`+0,3 s; cue `cutlery` idem. |
| 22 | "Maneja a la velocidad a la que de verdad se mueve el tráfico, no a la que te gustaría." → "Maneja a la velocidad real del tráfico, no a la que te gustaría." | ≈ 2,1 s | `velocidad`, `tráfico`, `gustaría` se conservan. |
| 8 y 13 | "kilómetros por hora" → "por hora" en la 2.ª y 3.ª vez (beat 8 "a unos veinte por hora", beat 13 "a quince o veinte por hora"); en el beat 6 se dice completo una vez. Así se habla en ES-419. | ≈ 1,7 s | `veinte` (beat 8) y `a`#2 (beat 13) se conservan. |
| 19 | "En Japón le pusieron a esto un nombre muy literal: manejo que absorbe embotellamientos." → "En Japón esto tiene nombre: manejo que absorbe embotellamientos." | ≈ 2,1 s | `En`#1 y `manejo` (F21_japan / F21_plate) se conservan. |
| 12 | "Lo que importa es cuántos autos hay en cada tramo de pista: los ingenieros le dicen densidad." → "…en cada tramo de pista: la densidad." (ya dijimos "los ingenieros le llaman" en el beat 10) | ≈ 1,7 s | C2 `D15_densidad` arranca en `los`#2 → mover a `densidad`−0,3 s. |
| 4, 21 | Tres líneas solo en cuadro (#3, #17, #18): se quita su voz; el cuadro conserva su tiempo de lectura bajo la narración o la respiración. | ≈ 1,5 s neto | Los `slot` de `A.drawLines` se conservan; `A.talk('eli')` en A16, G13, G15 deja de mover la boca (ya es `talk: 0` donde no hay voz). |
| 9 | (Coste, no ahorro) marco "Eli va en el diez:" | **+1,7 s** | nueva ancla posible para C07 (`Eli`, narrador, beat 09). |
| | **Total nivel A** | **≈ 11-12 s** | |

### Nivel B · opcionales (pierden un matiz o un plano, no la tesis) · ≈ 11 s

| Beat | Recorte | Ahorro | Qué se pierde |
|---|---|---|---|
| 20 | Quitar "un programa que decide cuándo acelerar y cuándo frenar" | ≈ 4,1 s | La glosa de "control de crucero inteligente" y el plano del chip ACC (G05, anclas `programa`, `acelerar`, `frenar`). Para un espectador de 14 años la glosa ayuda: cortar solo si hace falta. |
| 15 | Quitar "contando frenadas y arrancones" | ≈ 2,0 s | El gráfico E12 (5,8 s, el plano más plano del bloque D1, ancla `contando`); las agujas de E11 ya muestran el promedio. |
| 19 | Si además se quiere, "En Japón esto tiene nombre: manejo que absorbe embotellamientos." completo | ≈ 3,7 s más | La lámina y la fuente Nishi en pantalla; el verbo "absorber" llega sin presentación al beat 24. **No recomendado.** |
| 6 | "Los conductores tenían una sola tarea:" → "Una sola tarea:" | ≈ 1,3 s | Nada; mover B07 de `Los` a `Una`. |
| | **Total nivel B** | **≈ 7-11 s** | |

### Tempo

`VOICE_QC_chatterbox.md` ya deja prevista la aceleración al ensamblar (`"speed"`), sin resintetizar. **+4 %** lleva el
narrador de 144 a 150 ppm, el tope del rango "tranquilo" de la biblia (140-150), y ahorra ≈ 19 s sobre 8:11. No subir
más: a 157 ppm (Kokoro) la voz dejó de sonar natural, y la biblia pide los números más lentos, no más rápidos. Las pausas
largas (sello, 5 s del beat 23) no se tocan.

### Resultado

| Paquete | Duración total (con pantalla final 20 s) |
|---|---|
| Hoy | 8:31 |
| Nivel A | ≈ 8:20 |
| Nivel A + tempo 4 % | ≈ 8:01 |
| Nivel A + B + tempo 4 % | **≈ 7:50** |

Recomendación: **nivel A + tempo 4 %** ahora (8:01, con 3 líneas menos de voz) y nivel B solo si la prueba de voz nueva
vuelve a crecer. No cortar el beat 23 (5 s de silencio), el beat 24, los nombres regionales del beat 13 ni "y tampoco
esperaban hacerlo" (beat 20): son la tesis, el final y la honestidad del canal.

---

## 5 · Guía de lectura para la voz (dirección, no texto)

Para la nueva síntesis expresiva, por tramo (biblia §curva de energía):

| Tramo | Energía | Notas |
|---|---|---|
| Beats 1-4 (0:00-0:41) | Alta, rápida, asombro | "Más fuerte. Más fuerte…" en escalera; "¡¿Quién fue?!" citado con energía, no gritado; "Eli… va para atrás." bajito, con asombro; la pregunta final **de verdad**, con intriga y 1 s de aire. |
| Beats 6-8 | Tranquila, nítida | Pausa de 0,6-1 s antes de "dos mil ocho", "veintidós", "doscientos treinta", "treinta", "tres minutos", "cinco", "veinte". Sonrisa en "Problema:" y en "En una pista vacía." |
| Beats 9-10 | Lenta, clara (ajá chico) | "lo nota un instante tarde. En ese instante ya se acercó" muy claro; "chisme" con sonrisa. |
| Beats 11-13 | Vuelve el asombro | "Un embotellamiento no es un lugar. Es una ola." con pausa en el punto; "Tres autos de más." seco; "la razón ya se fue a cenar." seco, sin "voz graciosa". |
| Beats 14-17 | Tranquila | La instrucción "manejen como en hora pico…" como cita (pausa antes). "La ola se derritió." con alivio. "Ser paciente no es ir lento. Es ir al promedio." = **el ajá**: lo más lento del episodio. |
| Beats 18-19 | Cálida (tema de Mila) | "Esta es la parte favorita de Mila." como confidencia. "Ojo: no es magia." honesto. |
| Beats 20-21 | Asombro otra vez | "¿El resultado? Es complicado." con pausa antes de "complicado". |
| Beats 22-24 | Baja, cálida, casi confidencia | El consejo con calma; 5 s de silencio; "¿…Quién fue?" casi para sí; "Fuiste tú." sonriendo; "En algún lugar detrás de ellos…" lo más bajo del episodio. |

---

## 6 · PROPUESTA DE CAMBIO DEL GUION (para aprobar: Productor + Claude)

Mínima, numerada, **antes → después**. Nada más del guion cambia. Al aprobarse: v3 → **v3.1**, se actualiza la tabla
"Líneas de personaje" (columna Voz), la nota de voz y TEXTOS EN PANTALLA, y se vuelve a correr `script_parse.py` →
voz → animatic (solo las anclas marcadas).

### A · Texto de la narración (claridad / decibilidad)

**P1 · Beat 11, sujeto perdido tras la cita de Eli**
- Antes: `No es un grupo fijo de autos: los autos entran por detrás, avanzan despacito y salen por delante.`
- Después: `El embotellamiento no es un grupo fijo de autos: los autos entran por detrás, avanzan despacito y salen por delante.`
- Anclas: bloque C2 `t0` y C1 `t1` = `No`#1 del beat 11 → pasan a `El`#1 del beat 11.

**P2 · Beat 13, la frase larga con lista y relativa**
- Antes: `O sea que ese embotellamiento, trancón, taco o tráfico, en el que estás ahora mismo, pudo empezar con un frenazo de hace media hora.`
- Después: `O sea que el embotellamiento en el que estás ahora mismo, llámalo trancón, taco o tráfico, pudo empezar con un frenazo de hace media hora.`
- Anclas: `embotellamiento`, `trancón`, `taco`, `tráfico`, `pudo`, `media` se conservan (las tarjetas regionales siguen cambiando en cada nombre). Ojo: `en`#2 ("en el que") queda ahora **antes** de los nombres, así que `D21_halfhour` (que arranca en `en`#2) debe pasar a `pudo` − 0,1 s para no cortar las tarjetas de `D20_names`.

**P3 · Beat 13, frase duplicada (recorte A)**
- Antes: `Ese conductor ya llegó a su casa. Seguro ya está cenando. Por eso no ves ninguna razón: la razón ya se fue a cenar.`
- Después: `Ese conductor ya llegó a su casa. Por eso no ves ninguna razón: la razón ya se fue a cenar.`
- Anclas: `D23_dinner` y cue `cutlery` pasan de `Seguro` a `casa` (fin) + 0,3 s.

**P4 · Beat 20, un punto en la frase de 31 palabras**
- Antes: `En noviembre de dos mil veintidós, cerca de Nashville, en Tennessee, un equipo metió cien autos al tráfico de hora pico, con un control de crucero inteligente: un programa que decide cuándo acelerar y cuándo frenar.`
- Después: `En noviembre de dos mil veintidós, cerca de Nashville, en Tennessee. Un equipo metió cien autos al tráfico de hora pico con un control de crucero inteligente: un programa que decide cuándo acelerar y cuándo frenar.`
- Anclas: todas se conservan (`noviembre`, `Nashville`, `equipo`, `cien`, `con`, `inteligente`, `programa`, `acelerar`, `frenar`).

**P5 · Beat 22, dos "a la que" seguidas (recorte A)**
- Antes: `Maneja a la velocidad a la que de verdad se mueve el tráfico, no a la que te gustaría.`
- Después: `Maneja a la velocidad real del tráfico, no a la que te gustaría.`
- Anclas: `velocidad`, `tráfico`, `gustaría` se conservan.

**P6 · Beat 23, "Eli deja" (TTS) y énfasis del pago**
- Antes: `Solo que esta vez, Eli deja el espacio.`
- Después: `Solo que esta vez, Eli sí deja el espacio.`
- Anclas: `Eli` (narrador) y `espacio` (fin) se conservan.

### B · Quién habla y qué va en voz

**P7 · Beat 9, marco para la única línea sin dueño**
- Antes: `El tercero, más tarde y más fuerte todavía. [9]` / `**ELI:** No… no… ¡no!`
- Después: `El tercero, más tarde y más fuerte todavía. [9]` / `Eli va en el diez:` / `**ELI:** No… no… ¡no!`
- Nota de voz: respiración después de "diez:"; la cita sube de tono en cada "no". Ancla nueva disponible para C07: `Eli` (narrador, beat 09).

**P8 · Tres líneas pasan a "solo cuadro de texto" (sin voz)**
- Beat 4 `**ELI:** ¿Qué?` · Beat 21 `**ELI:** ¡Dale, dale!` · Beat 21 `**ELI:** ¡Nooo!`
- Antes (tabla de líneas, columna Voz): voz de personaje / "bajo la narración (−6 dB)".
- Después: **"solo cuadro (sin voz)"**; `script_parse.py` las marca `voiced: false` con su `slot` de lectura (0,4 s + 0,06 s/carácter), como hoy. El narrador respira en el hueco de "¿Qué?" y sigue con "Entonces…"; en el beat 21 la narración no se interrumpe.

**P9 · Beat 12, "¡¿Quién f…?"**
- Texto en pantalla: sin cambio (`¡¿Quién f…?`).
- Nota de voz (nueva): se sintetiza `¡¿Quién fue?!` y se **corta el audio en la /f/** al ensamblar (cue `record_scratch` de D13_quienf en ese instante).

**P10 · Regla general de citas (sustituye la tabla "Voz (propuesta)" de Kokoro)**
- Antes: voces `em_alex` / `ef_dora` por línea; "Regla de voz de Eli: sin /s/".
- Después: "**Todas las líneas las dice el narrador** (misma voz, actitud mínima: Eli más rápido e impaciente, Mila más serena; sin caricatura). Una respiración antes y después. El cuadro de texto queda en pantalla mientras. La regla de la /s/ de Eli deja de aplicar." Se conserva la columna de actitud por línea (indignado, maravillada, seco, etc.).

### C · Duración (recortes A restantes)

**P11 · Beats 8 y 13, "kilómetros por hora" la 2.ª y 3.ª vez**
- Beat 8 antes: `…se desliza hacia atrás, a unos veinte kilómetros por hora.` → después: `…se desliza hacia atrás, a unos veinte por hora.`
- Beat 13 antes: `…más de diez kilómetros, a quince o veinte kilómetros por hora.` → después: `…más de diez kilómetros, a quince o veinte por hora.`
- Beat 6 se queda completo ("a unos treinta kilómetros por hora"). Anclas conservadas.

**P12 · Beat 19, la presentación del nombre japonés**
- Antes: `En Japón le pusieron a esto un nombre muy literal: manejo que absorbe embotellamientos.`
- Después: `En Japón esto tiene nombre: manejo que absorbe embotellamientos.`
- Anclas: `En`#1, `manejo` se conservan; la lámina y la fuente Nishi siguen.

**P13 · Beat 12, "los ingenieros" la segunda vez**
- Antes: `Lo que importa es cuántos autos hay en cada tramo de pista: los ingenieros le dicen densidad.`
- Después: `Lo que importa es cuántos autos hay en cada tramo de pista: la densidad.`
- Anclas: `D15_densidad` pasa de `los`#2 a `densidad` − 0,3 s.

### D · Opcionales (no entran si no se aprueban aparte)

- **P14 · Beat 9** `Vamos más despacio.` → `Vamos por partes.` (quita la contradicción con ACELERADO ×2/×3; conserva el ancla `Vamos`).
- **P15 · Beat 21** `Pasan cuatro con el sistema apagado, y crece.` → `Pasan cuatro con el sistema apagado, y crece un poco.` (honestidad con el +0,3 km/h medido; ancla `crece` se conserva).
- **P16 · Beat 6** `En dos mil ocho, un equipo de físicos en Japón puso…` → `En dos mil ocho, en Japón, un equipo de físicos puso…` (ritmo hablado; anclas `En`, `puso`, `veintidós` se conservan).
- **Nivel B de recortes** (§4) solo si la voz nueva vuelve a pasar de 8:00.

### E · Fuera del guion (para el animatic)

- **M1 · El gafete** (E2, H03_back en adelante): que **no** vuelva al pecho de Eli; se queda en la guantera, o Mila lo devuelve volteado / cambiado por "DEJA UN ESPACIO". Afecta `badge:` en H03_back, H04, H05, I04, I06, I07, J03 y el `gloveBadge` de I05; el dedo de Mila en I07 señala a Eli, no al gafete.
- Lámina "¡NO ARREGLEN NADA!" (D1 E06_instr): presentarla como glosa nuestra (sin exclamaciones o en letra de nota), no como cita de los investigadores.
- TEXTOS EN PANTALLA del guion: reloj del beat 13 "0:00 → 0:33" (lo que de verdad muestra el sim).

---

**Cierre.** Con P1-P13 el guion sigue siendo el mismo episodio, palabra por palabra salvo 9 frases, y queda listo para
el narrador que describe `NARRADOR.md`: habla con el espectador, cita a Eli y a Mila sin confundir a nadie, dice lo que
la pantalla muestra y cabe en ≈ 8:00 con la pantalla final. El único choque de fondo entre palabra e imagen (el gafete)
se arregla en el animatic, no en el texto.
