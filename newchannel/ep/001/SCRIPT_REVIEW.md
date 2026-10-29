# Ep 001 · Revisión independiente del guion maestro ES-419 · 2026-10-15

Revisor: Script Editor (agente independiente de Claude). Regla del Productor (2026-10-15): el guion lo aprueban Claude y
sus agentes, juzgado por lo que es el canal: **todo guion explica con claridad y siempre tiene humor**; al aprobarse queda
bloqueado y se lee palabra por palabra.

- Versión revisada: **v2** → copiada sin cambios como `SCRIPT_ES419_v2_prereview.md` (las referencias "L…" de la sección
  1 son líneas de ese archivo).
- Versión resultante: **v3** = `SCRIPT_ES419.md` (las referencias de la sección 3 son beats y tiempos de v3).
- Fuentes de las reglas: `CLAUDE.md`, `PRODUCER_DECISIONS.md` (filas del 2026-10-15), `README.md` §1, §3, §7,
  `art/characters/leo_mila/CHARACTERS.md`, `art/ART_BIBLE.md`, `FACTS.md`.

---

## 1 · Auditoría de v2 (antes de editar)

| Criterio | Nota | Resumen |
|---|---|---|
| Claridad | **8** | El mecanismo está bien ordenado, pero hay tres frases que confunden y un "por qué" que falta. |
| Humor | **6** | Buenos gags visuales en las acotaciones, pero la narración es seca, los personajes casi no hablan y hay huecos de 30-60 s sin un golpe. |
| Gancho | **8** | Quiebre en 0:01 y pregunta en ~0:31; el descubrimiento de Mila se narra en vez de actuarse. |
| Ritmo | **7** | Beats de 20-32 s con un solo plano descrito; no hay plan de cambios cada ≤ 4 s. |
| Datos | **8** | Todo trazado a FACTS, pero hay cuatro frases que se pasan de lo que dice la fuente y una línea del Short que no se sostiene. |
| Voz (TTS) | **8** | Buenas notas de Kokoro; falta una regla para las líneas de Eli (problema con la /s/) si se le dan más. |
| Duración | **9** | ≈ 7:35 + 20 s de pantalla final. |
| Final | **8** | El remate "¿…Quién fue?" / "Fuiste tú." es fuerte; el enlace al siguiente video es vago y no usa el título fijado. |
| Short | **7** | 38,5 s, bien; humor flojo y la línea "Nadie detrás de ti lo va a notar." no es exacta. |

### 1.1 Claridad (8/10)

Lo que funciona: cada concepto se presenta antes de usarse ("inestabilidad de cadena" se define en la misma frase, L179;
"densidad" se presenta como "qué tan apretados van" antes del nombre, L202); la analogía del estadio (L189) es perfecta
para alguien de 14 años; el "ajá" (la ola va hacia atrás) se ve en pantalla en los beats 4, 8 y 11.

Problemas:
1. **L189 "No está hecho de autos"**: así, literalmente, es falso (el embotellamiento *sí* son autos parados) y confunde.
   Lo que se quiere decir: no es un grupo *fijo* de autos.
2. **L169/L379 "como ya tiene menos espacio, frena un poco más fuerte"**: falta el eslabón causal (el retraso de reacción
   → en ese instante se acerca → tiene que frenar más). Es justo el mecanismo de todo el video.
3. **L232/L396 "manejen como en hora pico. Si se abre un hueco, ciérrenlo"**: no dice *por qué* les dieron esa orden; un
   espectador puede pensar que los investigadores querían el embotellamiento por gusto. La razón está en la fuente
   (evitar que los humanos suavizaran las olas por su cuenta).
4. **L310/L416 "La ola recuerda cómo manejó cada quien"**: la metáfora tapa la idea. Mejor decirla llana.
5. **L154 + L214**: el beat 8 dice "la misma velocidad que en autopistas" (20) y el beat 13 dice "quince o veinte": dos
   cifras para lo mismo en un minuto.
6. Menor: la densidad se describe como "apretados" sin decir *qué* se cuenta (autos por tramo de pista).

### 1.2 Humor (6/10)

Conteo de golpes (risa o sonrisa) en v2, por tiempo:

| Tramo | Golpes | Hueco más largo |
|---|---|---|
| 0:00-0:37 gancho | Eli pegado al de adelante; "¡¿Quién fue?!"; boink del punto | ~12 s |
| 0:37-1:32 acto 1 | arrastrado por los talones; se encoge de hombros (L148); caminar en sentidos opuestos (L158) | **~28 s** (0:37-1:05: solo datos) |
| 1:32-3:38 acto 2 | globo gigante (L185); ola tardía (L196); "¿yo?" (L209); sándwich (L223) | ~25 s |
| 3:38-5:45 acto 3 | gafete (L237); gafete doblado (L255); perilla (L265); mano en el volante (L276) | **~32 s** (beat 19, L282-293: solo una palmadita) |
| 5:45-6:36 acto 4 | banderita de fan (L314) | **~45 s** (5:13-6:15 casi sin golpes: el beat 20 no tiene gag; la gota de tinta no es chiste) |
| 6:36-7:35 acto 5 | "¿…Quién fue?" / "Fuiste tú." | ~25 s |

- **Densidad:** ~16 golpes en 7:35 = uno cada ~28 s de media, pero con tres huecos de 28-45 s. Objetivo: uno cada 20-30 s
  *siempre*.
- **Comedia de personajes:** el contraste Eli (impaciente, en negación) / Mila (calma, curiosa) está en las acotaciones,
  pero **los personajes no hablan salvo tres líneas** (L41: "Los personajes no hablan en ningún otro momento"). Mila, el
  personaje del remate seco, no tiene ni una frase hasta el final. La narración nunca juega con ellos.
- **Gag recurrente:** "¡¿Quién fue?!" aparece solo al principio y al final; no escala en medio, así que el remate no
  tiene la carga de un chiste repetido. El gafete es el único objeto recurrente (bien).
- **Estructura de gag:** casi todos tienen golpe y reacción, pero sin preparación ni pausa marcadas (README §7 lo pide:
  anticipación, golpe, pausa, reacción).
- **Pago:** "Fuiste tú." es un gran remate (doble sentido: él la borró). El punto atrapado al final es bonito pero no
  paga nada (Eli nunca había fallado en atrapar algo).
- **Amabilidad:** bien. Nadie real es objeto de burla; el conductor que cena es genérico; las bromas sobre Eli son
  cariñosas.

### 1.3 Gancho (8/10)

- Quiebre: luces de freno en **0:01**, frenazo de Eli hacia 0:05 (bien, < 5 s).
- Pregunta: "¿por qué hay embotellamientos sin razón aparente?" en ~**0:31** (bien, ~30 s).
- Débil: L109 "Mila, su amiga, mira hacia atrás: las luces de freno se mueven… para atrás" lo *cuenta* la narradora; es
  el momento perfecto para que Mila lo diga y Eli lo ignore (comedia + ajá). El beat 3 tiene ~8 s de narración sin un
  gag (solo las tachaduras).

### 1.4 Ritmo (7/10)

- Beats largos con un solo plano descrito: beat 6 (21 s), 12 (28 s), 13 (33 s), 19 (32 s), 20 (30 s). README §7 pide
  ningún plano > ~4 s sin cambio y ≥ 12 cortes/min; el guion no da al montaje una lista de cambios, así que el riesgo de
  planos quietos de 8-10 s es alto.
- La narración sí varía el ritmo (frases cortas "Más fuerte. Más fuerte…", pausas), pero la voz es lo único que cambia
  en los tramos de datos.

### 1.5 Datos (8/10)

Todo número está en `FACTS.md` (22, 230 m, ~30 km/h, 3 min, 5, ~20 km/h, 314 m, 25/28, >10 km, 15-20 km/h, 21, ~80 %,
hasta 40 %, +14 %, ~mitad, ~quinta parte, 100, nov. 2022). Problemas:
1. **L154 "Es la misma velocidad que se ha medido en … autopistas de verdad"**: [SUG] dice "the common value"; FACTS #16
   da 15 ± 5 km/h para autopistas. "La misma" es demasiado fuerte y choca con el beat 13.
2. **L61/L274 "−50 %"** en pantalla para un −49,5 %: debe ser "≈ −50 %" (la narración ya dice "casi a la mitad").
3. **L469 (Short) "En Estados Unidos, un solo auto manejó…"**: falta "en una pista"; suena a autopista real, y en la
   autopista (100 autos) no hubo ese resultado (#30).
4. **L472 (Short) "Nadie detrás de ti lo va a notar."**: ambigua (¿no notan tu hueco? ¿no notan la ola?) y, como
   afirmación general, no se sostiene. Lo verdadero y verificable es condicional: si el hueco se come el frenazo, los de
   atrás no tienen que frenar (así muere la ola).
5. `FACTS.md` #34 todavía habla de "Quest y Pixie" (personajes descartados); debe decir Eli y Mila.
6. L420 "No vas a llegar más tarde": aceptable ([STERN] p.6: "covers the same distance in the same amount of time"),
   mejor sin el futuro categórico.

### 1.6 Voz / TTS (8/10)

- Bien: números en letras, sin siglas, "hora pico", "Domo de Nagoya", nada de "Y" inicial tras pausa, aviso de
  "Nashville/Tennessee" y "ni conos".
- Riesgo: `em_alex` sonoriza la /s/ (L37). Si Eli gana líneas, todas deben ir **sin /s/** (ni s, ni z, ni ce/ci).
- Sin trabalenguas ni trampas de homófonos graves ("ola/hola" y "casa/caza" se resuelven por contexto).

### 1.7 Duración (9/10)

1095 palabras declaradas (1100 contadas) → ≈ 7:35 + 20 s de pantalla final ≈ 7:55. Dentro de 6-8 min, sin margen para
añadir humor sin recortar.

### 1.8 Final (8/10)

- Callback fuerte: mismo camino, mismo toque, misma toma, sonido espejo, "¿…Quién fue?" / "Fuiste tú." (L333-347).
- Débil: L424 "el mismo circuito, pero con buses" es vago (los buses no van en un circuito cerrado) y no usa el título
  fijado de ep/002 ("¿Por qué los buses llegan de a tres?"); no hay chiste en el enlace.

### 1.9 Short (7/10)

- Duración 38,5 s (bien). Bucle "¡¿Quién fue?!" ↔ "Fuiste tú." (bien).
- Humor: grito, ola tardía, gente que canta, remate. Entre 1,3 s y 18 s no hay ningún golpe.
- Datos: ver 1.5 puntos 3 y 4.

### 1.10 Errores de continuidad (arte / personaje)

- L139 "Mila lo jala de la manga del suéter": Eli lleva **camiseta blanca y delantal**, no suéter (CHARACTERS §1).
- L94 "se sujeta el sombrero imaginario": Mila no lleva sombrero; su rasgo es la **coleta**.
- L122 "disco crema": el punto del wordmark es el **disco bermellón** de marca (ART_BIBLE v4 §4, §6).
- L83/L330 "pies en el tablero": mal ejemplo en un video que enseña a manejar mejor.
- L5 "borrador para el Productor": regla vieja; ahora aprueban Claude y sus agentes.

---

## 2 · Cambios hechos en v3

### 2.1 Humor

- **Comedia de personajes con voz:** 20 líneas cortas + la etiqueta (antes 3). Eli: impaciente y en negación ("¡Ya entendí! ¡Fue el de
  adelante!", "No… no… ¡no!", "¡¿Que yo qué?!", "¿Ni un perdón?", "¡Mi lema!", "…Fue el viento.", "¡Hay un hueco! ¡Un
  hueco enorme!", "¡Yo llego tarde a todo!"). Mila: remates secos y tranquilos ("Eli… va para atrás.", "Eli.", "Ese
  hueco es mi amigo.", "Fuiste tú.").
- **Cinco gags recurrentes con escalada y pago** (tabla en el guion):
  1. **"¡¿Quién fue?!"** 0:16 → 1:12 (la pista entera se encoge de hombros, en ola hacia atrás) → 2:59 se corta a media
     palabra al verse entre los "tres autos de más" → 4:52 lo grita después de subir él la perilla y todos lo miran →
     7:21 lo susurra → "Fuiste tú." → etiqueta de buses.
  2. **Eli llega tarde:** ola del estadio (2:31) → "¡Yo llego tarde a todo!" cuando "llegar tarde es la jugada" (5:42) →
     hace la ola **a tiempo** (6:41) → atrapa el punto **a tiempo** (7:31; ahora el punto final sí paga algo).
  3. **El dedo acusador:** da la vuelta al círculo y termina señalando su propia espalda (0:57) → lo baja ante el que
     cena (3:38) → Mila lo señala a él (7:22).
  4. **El gafete:** "¡Mi lema!" → se dobla → la guantera lo escupe (6:56).
  5. **El pajarito del cable:** sospechoso que se encoge de alas (0:24) → levanta un ala, aprobado (7:22).
- **Gags nuevos en los huecos:** coleta en la cara (0:11), lupa hacia el lado equivocado (0:29), surcos de talones (0:42),
  barra de freno como sombrero (1:53), globo-chisme con el dibujito de Eli (2:13), manos estiradas para "cerrar" el hueco
  y jalón del delantal (4:24), gafete sostenido con un dedo (4:41), hojita en el silencio colectivo (4:56), el auto que se
  mete en el hueco del peaje (5:54), contar 100 halos con los dedos de Mila (6:15), guantera (6:56), tres buses (7:40).
- **Cada gag principal marcado con preparación → golpe → pausa → reacción** en el guion (*(pausa)* en la narración donde
  la narradora calla).

### 2.2 Claridad

- Beat 9: "El segundo lo nota un instante tarde. En ese instante ya se acercó, así que tiene que frenar un poco más
  fuerte." + relojito de arena y regla del hueco que se achica en pantalla.
- Beat 11: "No está hecho de autos" → "No es un grupo fijo de autos".
- Beat 12: densidad = "cuántos autos hay en cada tramo de pista", con un tramo resaltado y los autos contados.
- Beat 14: "…les dieron una instrucción, para que no arreglaran las olas por su cuenta" (verificado en [STERN], FACTS #38).
- Beat 15: gráfico de la línea de velocidad que sube y baja con su promedio recto, en "contando frenadas y arrancones".
- Beat 6: "en un círculo, todos tienen a alguien adelante" explica por qué no hay "culpable de adelante" en una pista
  cerrada (y es chiste a la vez).
- Beat 21: "La ola recuerda…" → "Cada auto que la cruza la hace crecer o encoger."
- Beat 4: Mila *dice* el ajá ("Eli… va para atrás.") con flechas teal (autos adelante, luces atrás) en pantalla.

### 2.3 Datos

- Quitado "Es la misma velocidad que…" del beat 8 (la velocidad en autopistas queda solo en el beat 13, "quince o
  veinte"; FACTS #41). "≈ −50 %" en pantalla. "No llegas más tarde" (sin futuro categórico). "+14 %" quitado (frase
  recortada por duración; FACTS #36). Short: "En una pista de Estados Unidos…".
- **Short, línea decidida:** "Nadie detrás de ti lo va a notar." **se quita**. Nueva: **"Si tu espacio se come el
  frenazo, los de atrás no tienen que frenar."** Es condicional y por eso exacta; se apoya en [NISHI] (slow-in), [STERN]
  (Exp B: frenazos −76,2 % con un solo conductor), y nuestra `S11` (ninguna luz de freno detrás de Eli). FACTS #37.
- `FACTS.md`: #34 corregido (Eli y Mila en lugar de Quest y Pixie); nuevos #37-#43. Se volvió a leer el preprint de
  [STERN] (arXiv 1705.01693) el 2026-10-15: confirma los **21 autos** de los experimentos A y B (lo que sostiene "1 / 21")
  y la razón de la instrucción "cierren el hueco". **Ninguna cifra nueva** entra al guion.

### 2.4 Ritmo, voz, final, continuidad

- **Ritmo:** cada beat lleva su lista **Ritmo** con un cambio cada ≤ 4 s (cortes, gestos, gráficos, eventos del sim),
  para el montaje y `pacing_qc.py`.
- **Voz:** regla escrita: las líneas de Eli no tienen ningún sonido /s/ (comprobado con un script: 0 casos). Tabla de
  voces por línea. Pausa marcada en "Con veintiocho o más: embotellamiento."
- **Final:** se mantiene el callback; el enlace pasa a ser el título fijado de ep/002, "La próxima vez: ¿por qué los
  buses llegan de a tres?", con una etiqueta chistosa dentro de la pantalla final (llegan tres buses juntos; Eli:
  "¡¿Quién fue?!"; Mila se encoge de hombros a cámara).
- **Continuidad:** tira del delantal (no manga del suéter); coleta (no sombrero); disco bermellón; nadie con los pies en
  el tablero; Eli solo se para en el asiento con el auto detenido; estado del guion según la regla nueva.
- **Duración:** se recortaron ~90 palabras de narración (frases duplicadas o de relleno) para pagar las líneas de
  personaje y las pausas de los gags.

---

## 3 · Nueva puntuación (v3)

| Criterio | v2 | **v3** | Por qué |
|---|---|---|---|
| Claridad | 8 | **9** | Los seis problemas de 1.1 resueltos; la cadena causal (retraso → se acerca → frena más) se dice y se ve; cada término (cadena, densidad, promedio, absorber) se presenta antes de nombrarlo; el ajá se ve en los beats 4, 8, 11 y 19. No es 10 porque "inestabilidad de cadena" sigue siendo un término técnico (definido en la misma frase y con imagen). |
| Humor | 6 | **9** | ~38 golpes en 7:36 (uno cada ~12 s de media); el hueco más largo es de ~22 s (2:34-2:56, la presentación del Domo de Nagoya, que termina en el gag de los tres autos), dentro del objetivo de 20-30 s. Cinco gags recurrentes con escalada y pago, comedia de personajes con voz (Eli en negación, Mila seca), gags visuales y un remate doble ("Fuiste tú." + el punto atrapado a tiempo). Humor amable: nadie real, nadie humillado. |
| Gancho | 8 | **9** | Quiebre en 0:01, frenazo hacia 0:07, primer chiste en 0:03, grito en 0:16, pajarito en 0:24, Mila dice el ajá en 0:27, pregunta en ~0:31, sello en 0:34. |
| Ritmo | 7 | **9** | Lista de cambios ≤ 4 s en los 24 beats y la pantalla final; tramos de datos alternados con gags cortos; picos (gritos, gags) y descansos (colina de noche, beat 23 en silencio). El cumplimiento real lo confirma `pacing_qc.py` sobre el animatic. |
| Datos | 8 | **10** | Cada número trazado a `FACTS.md` con su matiz ("unos", "más o menos", "hasta", "en esa pista chiquita", "pudo", "≈"); frases exageradas corregidas; línea del Short reescrita como condicional verificable; FACTS #34 al día y #37-#43 nuevos; 21 autos y la razón de la instrucción verificados en la fuente primaria. |
| Voz (TTS) | 8 | **9** | Líneas de Eli sin /s/ (0 casos), frases cortas, números en letras, sin trabalenguas; quedan por confirmar en la prueba de voz "Nashville", "Tennessee" y "ni conos" (ya tienen alternativa escrita). |
| Duración | 9 | **9** | 1019 palabras de narración + 57 de personajes ≈ 7:36 + 20 s de pantalla final ≈ 7:56. Dentro de 6-8 min, con poco margen (la voz real puede variar ±10 s; si se pasa, se recorta aire de las pausas, no texto). |
| Final | 8 | **10** | Mismo camino, mismo toque, misma toma, sonido espejo; los cinco gags recurrentes pagan en los últimos 20 s; "Fuiste tú." cambia de acusación a elogio; enlace con el título fijado de ep/002 y una etiqueta que repite el gag con un misterio nuevo. |
| Short | 7 | **9** | 92 palabras, ≈ 39,0 s; un golpe cada ~5-7 s (grito, pajarito, timbre, ola tardía, manos de Eli, gente que canta, remate); bucle que funciona como chiste ("Fuiste tú." → "¡¿Quién fue?!"); línea dudosa sustituida por una exacta. |

**Mínimo: 9. Todos los criterios ≥ 9.**

## 4 · Veredicto

**APROBADO.** El guion v3 explica con claridad y tiene humor constante, de personajes y visual, con callbacks y pago.
Queda **bloqueado**: `SCRIPT_ES419.md` lleva el sello "ESTADO: APROBADO Y BLOQUEADO por Claude + revisor (2026-10-15)" y se
usa palabra por palabra (voz, subtítulos, montaje). Cualquier cambio posterior va como propuesta formal.

Avisos para los pasos siguientes (no bloquean la aprobación):
- **Prueba de voz:** confirmar "Nashville", "Tennessee", "ni conos" y que `ef_dora` sola se distinga de la narradora
  (alternativas ya escritas en las notas de voz). Las grafías fonéticas van solo en el texto del TTS.
- **Duración real:** medir con la voz real; si pasa de 8:00 con la pantalla final, se recorta aire de las pausas.
- **Ritmo:** pasar `pacing_qc.py` sobre el animatic contra las listas **Ritmo** de cada beat.
- `SCRIPT_EN.md` sigue desactualizado (secundario por decisión del 2026-10-14).

---

## 5 · Auditoría frente al narrador y al animatic (2026-10-23) → v4

Fuente: `SCRIPT_AUDIT_NARRADOR.md` (Script Editor, solo lectura sobre v3). Pregunta del Productor: ¿el guion es el correcto
para lo que debe decir el narrador (`voice/NARRADOR.md`) y para la animación ya hecha? Veredicto: sí; 13 cambios mínimos +
un arreglo del animatic. Claude, como director (regla del Productor 2026-10-15), aprobó y aplicó **P1-P14** y los **recortes
de nivel A** (no el nivel B) el 2026-10-23 → **v4 = `SCRIPT_ES419.md`**, bloqueado; v3 queda en `SCRIPT_ES419_v3.md`.

| Criterio (auditoría) | v3 | **v4** | Por qué |
|---|---|---|---|
| Narración vs la biblia del narrador | 8 | **9** | Las dos frases difíciles de decir (beats 13 y 20) reordenadas o partidas (P2, P4); "a la que… a la que" (P5) y "Eli deja" (P6) resueltos; "Vamos por partes" (P14). Las cuatro frases de datos siguen siendo datos: se salvan con la pausa previa a cada número (dirección, no texto). |
| Líneas de personaje citadas por el narrador | 7 | **9** | Regla general escrita (P10): el narrador las dice todas, actitud sin voz; 3 líneas solo en cuadro (P8); la única cita sin dueño tiene marco, "Eli va en el diez:" (P7); "¡¿Quién f…?" con corte de audio (P9). Queda por confirmar en la prueba de voz "¡Hay un hueco!" (marco opcional ya escrito). |
| Guion vs animación | 9 | **10** | M1 (el gafete) arreglado en `animatic/shots_blockE2.js` y hecho explícito en el guion; M2 con "Vamos por partes."; M3 con el marco de P7; M8 (reloj 0:33) sincronizado en TEXTOS EN PANTALLA. Anclas re-apuntadas y probadas en seco (`animatic/qc/ANCHORS_v4.md`). |
| Duración | 6 | **7** | Nivel A sobre la toma actual re-cronometrada: ≈ −4 s de texto (≈ 8:27 con pantalla final; la auditoría estimó más porque contó las palabras movidas como quitadas) y ≈ 8:08 con el +4 % de tempo del ensamblaje. Sigue por encima de 8:00: el nivel B (≈ 7-11 s) queda en reserva si la voz nueva no baja sola. La cifra real la da la narración expresiva nueva. |
| TTS / decibilidad | 8 | **9** | "Eli sí deja", "¡¿Quién f…?" cortado en montaje, "Nooo" fuera de la voz; "repitió" se deja (una palabra, sin cambiar más de lo necesario). |

Lo que v4 **no** toca (decisión del director): el silencio de 5 s del beat 23, el beat 24, los cuatro nombres regionales
del beat 13, "y tampoco esperaban hacerlo" (beat 20), ningún dato ni número (cada frase tocada se cotejó con `FACTS.md`),
el Short (92 palabras, ≈ 39 s, dentro de 35-40 s). El +4 % de tempo es un ajuste de ensamblaje, no del guion. Las
puntuaciones de la sección 3 (claridad 9, humor 9, datos 10…) siguen vigentes: v4 no cambia tesis, gags ni cifras.

**Veredicto v4: APROBADO Y BLOQUEADO (Claude, 2026-10-23).** Se usa palabra por palabra para la voz nueva, los cuadros de
texto y el animatic; cualquier cambio posterior va como propuesta formal.

## 6 · v5: humor hablado 6 → 8,5 (propuesta independiente), aprobado por Claude (2026-10-28)

Fuente: `HUMOR_PUNCHUP.md` (revisor de comedia independiente, sobre v4). Pregunta del Productor: «quiero que le dé risa a
la gente, que lo disfrute mientras aprende… aprovechemos a nuestro narrador». Diagnóstico: lo visual 9/10, lo que se OYE
6/10 (el narrador casi nunca reacciona; huecos sin chiste hablado de hasta ≈ 100 s entre 5:42 y 7:21). Claude, como
director, aprobó y aplicó el 2026-10-28 → **v5 = `SCRIPT_ES419.md`**, bloqueado; v4 queda en `SCRIPT_ES419_v4.md`:

- **Los 16 punch-ups (#1-#16)**: apartes de 1-9 palabras que señalan gags ya animados, callbacks hablados de «siempre» y
  «tarde», «En nuestra versión, alguien la sube silbando» (quien solo escucha ahora sabe que Eli subió la perilla) y
  «Hasta Eli» como última sonrisa ahora que no hay etiqueta. 14 de 16 funcionan con los ojos cerrados.
- **Recortes C1, C2, C3, C4, C5, C7** tal cual. **C6 no** como estaba escrito: se conserva la explicación del control de
  crucero, corta («…con un control de crucero inteligente, que acelera y frena solo.»), y por eso #3, #5 y #12 van completos.
- En la misma versión: el final sin etiqueta (decisión del Productor del 2026-10-28: los episodios no anuncian el
  siguiente; termina en la escena del título sostenida 20 s) y «Mila, su pareja».
- La dirección de David (eleven_v4, una etiqueta por remate; curva emocional por beat) quedó en el guion, sección
  «Dirección del narrador · David».

| Criterio | v4 | **v5** | Por qué |
|---|---|---|---|
| Humor hablado | 6 | **8,5** | Un chiste hablado cada ≈ 15-30 s; hueco más largo ≈ 36 s (2:59 → 3:35), limpio a propósito porque termina en «la razón ya se fue a cenar». No llega a 9 porque el ajá central (beats 12-16) sigue siendo explicación limpia, y está bien. |
| Humor visual | 9 | **9** | Sin arte nuevo; se percibe más porque la voz lo señala. Solo cambia el cuadro de #9 («¡Cabe una casa!»). |
| Claridad | 9 | **9** | Los apartes van después de cada ajá (#7 tras el resorte), nunca dentro. C1/C4 quitan redundancias. |
| Datos | 10 | **10** | Ningún número, fuente ni matiz cambia; cada frase tocada cotejada con `FACTS.md` (#44). C4 quita una frase que era más fuerte que la fuente. |
| Duración | 7 | **7** | +42 palabras netas (1008 → 1050), seis apartes caen en pausas que hoy son silencio: ≈ +9-11 s de pista, compensados en parte por la etiqueta que se va (≈ 5 s). Estimación ≈ 8:40-8:45 al ritmo Qwen; la cifra real la da David. |

**Veredicto v5: APROBADO Y BLOQUEADO (Claude, 2026-10-28).** Se usa palabra por palabra para la voz de David (ElevenLabs,
tras la aprobación del gasto por el Productor), los cuadros de texto y el animatic. La narración Qwen de la vista previa
sigue en v4 sin la etiqueta (sin punch-up y con «su amiga»): se reemplaza con el render de David.
