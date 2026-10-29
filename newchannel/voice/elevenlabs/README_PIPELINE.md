# EP001 · Narración con David (ElevenLabs) · orden de ejecución

Guion: `ep/001/SCRIPT_ES419.md` v5 (bloqueado). Dirección: su sección «Dirección del narrador · David», con la regla del
2026-10-29: **ningún `[whispers]` salvo el «¿…Quién fue?» final del beat 23**; Mila serena o maravillada a volumen normal.
Motor: `eleven_v4`, voz David C – Viral Storytelling (`qRUgOhnxGASxirG4fKjv`), **una toma por llamada**.
El gancho ya aprobado (`gancho_david_v5.mp3`, beats 1-4 en una llamada) queda solo como referencia: los beats 1-4 se
regeneran con la pasada completa.

Todo lo de esta carpeta es local y gratis; **solo el paso 2 gasta créditos** y lo ejecuta el director.

Entorno de los scripts (faster-whisper, pyloudnorm, ffmpeg):
`TQDM_DISABLE=1 OMP_NUM_THREADS=2 nice -n 10 /tmp/claude-0/cbnat/venv/bin/python -I <script>` desde la raíz del repo.

## Presupuesto

| | Caracteres ≈ créditos |
|---|---|
| Pasada completa: **23 prompts** (beats 1-4 y 6-24; el 5 no tiene narración), etiquetas incluidas | **6.897** |
| + retomas 15 % | ≈ 7.930 |
| + retomas 25 % | ≈ 8.620 |

Se cobra 1 crédito por carácter del `prompt` con las etiquetas (gancho v5: 592 caracteres = 592 créditos). El prompt más
largo tiene 502 caracteres (beat 19), así que ningún beat se partió (límite 600). Plan Creator: 121.000/mes → la pasada
con retomas es ≈ 7 % del mes.

## Los 5 pasos

1. **Aprobación del gasto (Productor).** Se le muestra el presupuesto de arriba. Sin su sí no se genera nada
   (`voice/ELEVENLABS_CREDITOS.md`).

2. **Generar, un beat por llamada (director).** Para cada entrada de `ep001_prompts.json`, en orden: texto = `prompt`
   tal cual (con sus etiquetas y las citas entre «»), `eleven_v4`, voz `qRUgOhnxGASxirG4fKjv`, `generations_count: 1`.
   Anotar cada llamada en la tabla de gasto de `ELEVENLABS_CREDITOS.md`. Las líneas `[solo cuadro]` no están en los
   prompts; las pausas largas (pajarito, hombros, 5 s del beat 23…) tampoco: las pone el montaje.

3. **QC de cada toma (gratis).**
   `.../python -I newchannel/voice/elevenlabs/qc_take.py <URL o archivo> <beat>`
   Descarga la URL a `takes/ep001_bNN.mp3` (una toma anterior queda como `_prevK.mp3`, nunca se pierde una toma pagada),
   transcribe con faster-whisper, WER contra `script_text`, ppm, duración, LUFS y pico, y escribe `<toma>.qc.json`.
   - **PASS**: WER 0, ritmo 125-175 ppm, pico ≤ −1 dBTP.
   - **CHECK**: solo confusiones conocidas del ASR (ni/mi, el/la ante vocal, plural -s, a/ha, y/e, dos palabras pegadas
     como «autofrena»), o ritmo/pico fuera de rango: **escuchar** y decidir. El gancho v5 da CHECK por eso mismo.
   - **FAIL**: palabra distinta, etiqueta leída en voz alta o ritmo < 100 / > 200 ppm → retoma de ese beat solo.
   Escuchar además cada toma: que ninguna etiqueta suene, que Mila no susurre y que el único susurro sea el del beat 23.
   Una retoma puede cambiar una etiqueta (las descriptivas tienen su reemplazo en la dirección) o la puntuación, **nunca
   las palabras**; si una palabra suena mal (Nashville, Tennessee), grafía solo para el motor con visto bueno del
   director. Una toma que cubra varios beats seguidos se nombra `ep001_bNN-MM.mp3` y se revisa con `qc_take.py … NN-MM`.

4. **Montaje (gratis).**
   `.../python -I newchannel/voice/elevenlabs/assemble_david.py --check` (plan de pausas + tomas presentes y aprobadas), luego
   `.../python -I newchannel/voice/elevenlabs/assemble_david.py`
   Recorta silencios, alinea palabra por palabra con faster-whisper, alarga (nunca acorta) los huecos del plan de pausas
   dentro de cada toma, corta «¡¿Quién f…?» en la /f/, deja los huecos de las líneas `[solo cuadro]`, une los beats con
   las pausas de la hoja (5 s tras la pregunta del gancho, 5 s del beat 23, 3 s tras «Esto es Diez Mil Puntos.» + 20 s de
   la escena del título) y deja el stem a −16 LUFS / ≤ −2 dBTP. Escribe `ep/001/audio/narration_es.wav` (fuera de git),
   `timings_es.json` y `segments_es.json` con el mismo esquema de siempre; antes guarda los de Qwen como `*_qwen.json`
   (y `narration_es_qwen.wav`) sin pisar nunca una copia existente. Ensayo sin tocar el episodio:
   `--beats 01-04 --out <carpeta>`. Ritmo de las pausas cortas: `--pause-scale 0.85` (sin regenerar nada).

5. **Animatic y mezcla (gratis).** Re-apuntar las anclas que cambia v5 (`ep/001/animatic/qc/ANCHORS_v4.md` → nota v5:
   punch-up #1-#16, «Adivina quién» en lugar de «Eli va en el diez», C1-C7), prueba en seco de los 8 bloques contra el
   nuevo `timings_es.json`, `pacing_qc.py`, mezcla a −14 LUFS y escucha completa antes de entregar.

## Archivos

- `ep001_prompts.json`: un prompt por beat (`beat`, `prompt`, `script_text` = el prompt sin etiquetas, para QC,
  `chars_billable`, `tags`, `note` si hace falta) y el total.
- `qc_take.py`: QC de una toma (paso 3).
- `assemble_david.py`: montaje (paso 4); las pausas viven en sus tablas `AFTER` / `BREAKS` / `NUMBER_PRE`.
- `takes/`: tomas aceptadas y sus informes `.qc.json`.
