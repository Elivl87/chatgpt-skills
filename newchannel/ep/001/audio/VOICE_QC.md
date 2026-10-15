# EP001 · Voz ES-419 · QC · 2026-10-15

Pista de voz del piloto ("¿Por qué hay embotellamientos sin razón aparente?") y del Short, hecha con el guion
**v3 APROBADO Y BLOQUEADO** palabra por palabra. El texto se lee directamente de `SCRIPT_ES419.md`
(`script_parse.py`); la narración extraída coincide al 100 % con el bloque "SOLO NARRACIÓN" (1030 palabras). Las
grafías fonéticas y las pausas viven **solo** en el texto que recibe el TTS (`build_voice.py`, `RESPELL` y `OPTS`).
Un `assert` comprueba que cada texto de TTS dice las mismas palabras que el guion. Los timings siempre llevan la
ortografía del guion.

**Para escuchar:** `narration_es_preview.mp3` (7:59, 112 kbps, 6,7 MB) · `short_es_preview.mp3` (0:37, 0,5 MB).

## Resumen

| | Real | Guion / objetivo |
|---|---|---|
| Duración total `narration_es.wav` (con la pantalla final de 20 s) | **7:59,1** (479,13 s) | ≈ 7:56; objetivo 7:30-8:00 ✔ |
| Fin del beat 24 ("…Diez Mil Puntos.") | **7:36,1** | ≈ 7:36 ✔ |
| Pregunta del gancho ("…sin razón aparente?") termina en | 0:36,9 | ~0:31-0:34 (+3 s, por las pausas de gag del beat 3) |
| Sello (beat 5, sin voz) | 0:37,5-0:42,0 (4,5 s = sello 3,5 s + 1 s de silencio) | 0:34-0:38 + 1 s de silencio |
| Silencio del final (beat 23) | 5,06 s | 5 s ✔ |
| Ritmo de la narradora (dentro de sus líneas) | 156,6 ppm | 155 ppm ✔ |
| Sonoridad / pico | **−18,0 LUFS integrado · TP −2,1 dBTP** · LRA 2,2 LU | −18 LUFS, TP ≤ −2 dBTP ✔ |
| WER (Whisper small, sin homófonos ni formato de números) | **1,56 %** global (raw 2,02 %), 1088 palabras | ver tabla: los errores restantes son casi todos del ASR, no de pronunciación |
| Short `short_es.wav` | **37,35 s** · −18,0 LUFS · TP −2,1 dBTP · WER 2,2 % | 35-40 s ✔ (el guion estimaba 39,0 s) |

## Voces

| Papel | Receta Kokoro-82M (es-419 espeak) | Velocidad | Tono | F0 mediana |
|---|---|---|---|---|
| **Narradora** | ES-D: `ef_dora` 0,6 + `af_heart` 0,4 | 0,92 | — | 185 Hz |
| **Eli** | `em_alex` solo (sus líneas no tienen /s/) | según las notas: 1,0 base; 1,05 gritos; 1,1 "¡Ya entendí!"; 1,15 "¡Hay un hueco!"; 0,95 "¿Ni un perdón?"; 0,9 "…Fue el viento." y el susurro final | gritos "¡¿Quién fue?!", "¡¿Que yo qué?!", "¡Mi lema!": +1 semitono ("un poco más agudo, indignado") | 141 Hz |
| **Mila** | **`ef_dora` 0,65 + `bf_emma` 0,35** | 0,95 (0,92 en "Ese hueco es mi amigo" y "Fuiste tú") | **+2 semitonos** (remuestreo con la duración intacta) | 204 Hz |

**Por qué Mila no es `ef_dora` sola.** Similitud de hablante (codificador Resemblyzer, coseno; > ~0,85 = suena a la
misma persona) medida sobre el mismo pasaje:

| Candidata Mila | vs. narradora | vs. Eli | Notas |
|---|---|---|---|
| `ef_dora` sola (la nota del guion) | **0,928** | 0,784 | Indistinguible de la narradora (dora es el 60 % de su mezcla) |
| dora +1 st (la sugerencia del guion) | 0,946 | — | Subir un semitono no la separa |
| dora +2 st | 0,880 | 0,720 | Todavía cerca |
| dora −1,5 st / dora 0,8 + `em_santa` 0,2 −1 st | 0,765 / 0,759 | **0,892 / 0,930** | Bajar el tono la acerca a Eli: descartado |
| dora +3 st | 0,782 | 0,660 | Buena alternativa (plan B) |
| **dora 0,65 + `bf_emma` 0,35, +2 st (elegida)** | **0,794** | **0,624** | La más lejos de los dos con menos desplazamiento de tono; Whisper la entiende igual de bien |

En la pista final (todas las líneas de cada personaje): narradora↔Mila **0,801**, narradora↔Eli 0,761, Eli↔Mila
0,704. Mila queda tan separada de la narradora como Eli. Sigue siendo "pariente" de la narradora (la base es dora).
Costo: el desplazamiento de +2 st por remuestreo sube también los formantes, así que Mila puede sonar algo más joven
o pequeña que "alta y tranquila". Si al oído molesta, el plan B es dora sola a +3 st (casi la misma distancia).
Ninguna voz es clonada: solo tensores de fábrica de Kokoro (Apache-2.0) y mezclas suyas.

## Pronunciación (palabras difíciles, comprobadas con Whisper small)

| Palabra | Tiempo | Resultado | Arreglo (solo en el texto del TTS) |
|---|---|---|---|
| Nashville | 6:05,5 | espeak la destroza: `naʃβˈijje` | **"Náshvil"** → `nˈaʃβil`; Whisper oye "Nashville" ✔ |
| Tennessee | 6:06,2 | espeak: `tˌennessˈee` | **"Tenesí"** → `tˌenesˈi`; Whisper oye "Tennessee" ✔ |
| ni conos | 0:24,9 | `nˈi kˈonos`; Whisper oye "ni choque, ni conos, ni semáforo" ✔ | ninguno (no hace falta "ni obras en la vía") |
| el Domo de Nagoya | 2:46,5 | `naɣˈoʝa` ✔ | ninguno |
| trescientos catorce | 2:48,3 | Whisper "314 metros" ✔ | ninguno |
| veintiún / veintiuno | 3:55,2 / 4:44,7 | "con 21 autos" ✔ / "de veintiuno" ✔ | ninguno |
| veinticinco / veintiocho | 2:50,4 / 2:53,3 | "Con 25 autos… Con 28 o más" ✔ | "Con veintiocho o más**,** [pausa 0,3 s] embotellamiento" (la pausa corta que pide el guion) |
| kilómetros por hora | 1:04,9 · 1:30,8 · 3:18,4 · 3:20,6 | ✔ las cuatro | ninguno |
| corras | 6:55,3 | la vibrante sale simple: Whisper oye "No **coras** a cerrarlo" | **"corrras"** → `kˈorɾas`; Whisper oye "corras" ✔ |
| Diez Mil Puntos | 7:35,4 | `djˈes mˈil pˈuntos`; Whisper escribe "10.000 puntos" (formato) ✔ | ninguno |
| Eli / Mila | — | `ˈeli` / `mˈila` ✔ (Whisper a veces escribe "Ellie": misma pronunciación) | ninguno |

**Líneas cortas de personaje.** Kokoro genera una cola de respiración al final de los enunciados muy cortos, y aislados
Whisper la oye como una /s/: "¿Qué?" → "¡Que es!", "Eli…" → "Elis", "¡Nooo!" → "No lo hago", "¡Mi lema!" →
"Mi lima", "¿…Quién fue?" → "Aquí en fuego". Probé variantes con el mismo código de producción y quedaron:

| Línea (guion, igual en pantalla) | Texto del TTS | Whisper (aislada) |
|---|---|---|
| MILA "Eli… va para atrás." | "Eli. Va para atrás." (punto en lugar de puntos suspensivos; el hueco de 0,28 s hace de "…") | "Eli, va para atrás." ✔ |
| ELI "¿Qué?" | "¿Qué…?" | "¿Qué?" ✔ |
| ELI "No… no… ¡no!" | el mismo texto en **una sola llamada** (separada en tres, cada "no" salía "nos") | "No, no, no." ✔ |
| ELI "¡Mi lema!" | igual, +1 st (como los otros gritos) | "¡Mi lemma!" ✔ |
| ELI "¡Nooo!" | "¡Noo!" | "No." ✔ |
| ELI "¿…Quién fue?" (susurro) | "¿Quién fue?" a 0,9 | "¿Quién fue?" ✔ |
| ELI "¡¿Quién f…?" | se sintetiza "¡¿Quién fue?!" y se corta al 80 % de la /f/ con las duraciones de fonema de Kokoro (`pred_dur`) + 25 ms de fundido | Whisper completa "¿Quién fue?" (adivina; la /we/ no está en el audio, 0,55 s frente a 0,71 s) |

## Por beat

Tiempos reales del montaje frente a los del guion. "Voz" = del primer al último sonido del beat; "Hueco" = incluye
el aire de después (pausas de gag). WER con Whisper small sobre cada beat, normalizando acentos, números y "Ellie".

| Beat | Real | Guion | Voz | Hueco | Palabras | WER | Lo que queda (y por qué no es pronunciación) |
|---|---|---|---|---|---|---|---|
| 1 | 0:00,25 | 0:00 | 7,61 s | 8,11 s | 16 | 0 % | |
| 2 | 0:08,36 | 0:07 | 8,67 | 9,12 | 22 | 0 % | |
| 3 | 0:17,47 | 0:16 | 8,72 | 10,72 | 22 | 4,5 % | "Eli está" → "Él está" en contexto (vocales juntas *Eli‿está*). Aislada se oye "Eli está" ✔. **Escuchar 0:18,6** |
| 4 | 0:28,19 | 0:26 | 8,82 | 13,82 | 18 | 5,6 % | "embotellamientos sin" → "embotellamiento sin": las dos /s/ se funden, normal en el habla |
| 5 | 0:37,51 | 0:34 | — | 4,50 | — | — | sello: 3,5 s + 1 s de silencio total |
| 6 | 0:42,01 | 0:39 | 24,15 | 24,75 | 60 | 0 % | |
| 7 | 1:06,75 | 1:04 | 14,52 | 17,02 | 33 | 0 % | pausa de 2,5 s para la ola de hombros |
| 8 | 1:23,78 | 1:19 | 10,96 | 11,61 | 31 | 0 % | |
| 9 | 1:35,38 | 1:33 | 22,48 | 23,13 | 57 | 0 % | |
| 10 | 1:58,52 | 1:55 | 19,42 | 20,07 | 50 | 6,0 % | Whisper omite "¡¿Que yo qué?!" en el beat (tras la pausa de 1 s); aislada la oye bien: "¿Qué yo qué?" ✔ |
| 11 | 2:18,59 | 2:16 | 20,35 | 21,00 | 55 | 0 % | pausa de 1,2 s antes de "Un embotellamiento no es un lugar" (Eli se levanta tarde en la ola) |
| 12 | 2:39,59 | 2:38 | 32,08 | 32,73 | 75 | 4,1 % | "embotellamiento" tras la pausa → "en botellamiento" (Whisper parte la palabra); "+fue": completa el corte de Eli |
| 13 | 3:12,32 | 3:09 | 29,27 | 30,27 | 78 | 0 % | "trancón, taco o tráfico" ✔ |
| 14 | 3:42,59 | 3:41 | 24,02 | 24,82 | 64 | 3,1 % | "AutosRobot" (formato) |
| 15 | 4:07,41 | 4:07 | 20,24 | 20,89 | 54 | 0 % | |
| 16 | 4:28,31 | 4:29 | 17,01 | 17,66 | 43 | 0 % | "ochenta / cuarenta por ciento" ✔ |
| 17 | 4:45,97 | 4:47 | 14,69 | 15,34 | 30 | 6,7 % | "promedio. La ola" → "…Slaola": posible respiración audible al final de "promedio.". **Escuchar 4:50,3** |
| 18 | 5:01,31 | 5:01 | 23,78 | 24,43 | 56 | 0 % | |
| 19 | 5:25,74 | 5:24 | 33,98 | 34,63 | 88 | 2,2 % | "autopaciente" (formato) |
| 20 | 6:00,37 | 5:59 | 25,39 | 26,04 | 63 | 3,2 % | "Cien autos" → "si en autos": homófono exacto con seseo |
| 21 | 6:26,41 | 6:25 | 21,24 | 22,24 | 55 | 1,8 % | "Nooo" → "No" (formato) |
| 22 | 6:48,66 | 6:47 | 19,03 | 19,68 | 55 | 0 % | pausa de 0,8 s tras "No corras a cerrarlo." (gag de la guantera) |
| 23 | 7:08,34 | 7:10 | 13,76 | 14,76 | 20 | 0 % | 5 s sin narración antes de "¿…Quién fue?" |
| 24 | 7:23,10 | 7:24 | 13,04 | 16,04 | 31 | 0 % | 0,5 s antes de "Esto es Diez Mil Puntos."; 3 s de aire para el sello final |
| final | 7:39,13 | 7:37 | 4,43 | 20 s | 13 | 0 % | "La próxima vez…" + "¡¿Quién fue?!" (etiqueta), y silencio hasta los 20 s |

Errores que pueden ser **reales**: 2 de 1088 palabras (beat 3 "Eli está" y la posible respiración del beat 17); los
dos se oyen bien con el audio aislado. **WER de pronunciación ≈ 0,2 %.**

## Silencios

- Más largo: 15,6 s al final (la pantalla final de 20 s, a propósito). Luego, los de diseño: 5,06 s (beat 23),
  5,05 s (sello del beat 5), 3,07 s (sello del beat 24), 2,55 s (beat 7), 2,06 s (beat 3), 1,5 s (beats 12 y 18).
- Más largo **dentro de una línea**: 1,26 s (2:34,2, la pausa de 1,2 s del beat 11, de diseño), 0,85 s (6:56,5,
  pausa de la guantera, de diseño), 0,65 s (6:12,5: "¿El resultado?… Es complicado.", la pausa que hace Kokoro tras la
  pregunta; queda bien como golpe). Ningún hueco raro dentro de las frases.

## Archivos (`ep/001/audio/`)

| Archivo | Qué | En git |
|---|---|---|
| `narration_es.wav` | pista completa, 48 kHz mono 24 bit, −18 LUFS, TP −2,1 dBTP (69 MB) | **no** (`.gitignore`); se regenera, ver abajo |
| `segments/*.flac` (54) | una por línea (narradora por beat, cada línea de Eli y Mila), cortadas del master, 24 kHz 16 bit (la banda nativa de Kokoro), 12 MB | sí |
| `segments_es.json` | manifiesto: inicio, duración, aire, ganancia, velocidad, tono, texto del guion y texto del TTS de cada línea | sí |
| `timings_es.json` | 1089 palabras `{word, start, end, beat, speaker, text, conf, line}` en segundos de la pista; ortografía del guion | sí |
| `short_es.wav` (5,4 MB) · `segments_short/` · `segments_short_es.json` · `timings_short_es.json` (92 palabras) | el Short | sí |
| `narration_es_preview.mp3` · `short_es_preview.mp3` | copias de escucha, 112 kbps mono | sí |
| `qc_es.json` · `qc_short_es.json` | las medidas de este informe, con las transcripciones | sí |
| `build_voice.py` · `script_parse.py` | el proceso completo | sí |

**Timings:** palabras de faster-whisper (small, int8) alineadas por beat al texto del guion (el aligner de
`engine/voice.py`), con los inicios afinados sobre la forma de onda. Toda palabra queda dentro de su propia línea y en
orden. `conf: 0` (16 palabras: las que Whisper no oyó o escribió distinto, como "Cien", "Mil", "AutosRobot",
"¡¿Que yo qué?!") = interpoladas por longitud **solo sobre los tramos con voz de su línea**, nunca dentro de una pausa.
`line` = el nombre del FLAC de esa línea.

## Regenerar

```bash
bash newchannel/engine/setup_voice_env.sh            # una vez (venv en /tmp/claude-0/ttdenv; pesos fuera de git)
cd newchannel/ep/001/audio
# sin TTS, desde los FLAC (residuo −54 dB frente al master):
OMP_NUM_THREADS=2 /tmp/claude-0/ttdenv/venv/bin/python build_voice.py from-flac
# todo desde cero (síntesis determinista con semilla, ~15 min con 2 hilos):
OMP_NUM_THREADS=2 VOICE_TMP=/tmp/claude-0/ep001_voice /tmp/claude-0/ttdenv/venv/bin/python build_voice.py all
```

Para el QC de similitud de hablante se instaló Resemblyzer (Apache-2.0) en el venv. Solo mide; no toca el audio
publicado. Registrado en `LICENSES.md`, junto con `bf_emma`.

## Para escuchar (no puedo oír: todo lo de arriba son medidas)

1. **Mila** (0:30,4 · 4:53,9 · 5:13,8 · 7:21,2): ¿suena a otra persona y no a una narradora acelerada? ¿Los +2 st la
   hacen sonar demasiado joven? Plan B: dora +3 st.
2. **"¡¿Quién f…?"** (2:58,4): ¿se oye como un grito cortado y no como un fallo de audio?
3. **"No… no… ¡no!"** (1:54,3): sale en 0,9 s. El guion pedía un "no" por barra; separados, Kokoro les pegaba una "s".
   Si hace falta más espacio, se puede ajustar con el montaje.
4. **Respiraciones** al final de frase: 4:50,3 ("promedio.") y las líneas cortas de Eli.
5. **Gritos de Eli:** Kokoro no "grita" de verdad. El enojo se lo dan los signos, la velocidad y +1 st; la actuación
   la tiene que cargar el dibujo (globo, marca de ira).
6. **Los "¡Dale, dale!" / "¡Noo!"** del beat 21 van 6 dB por debajo de la narración, como pide el guion.
