# EP001 · Narración con Chatterbox · QC · 2026-10-16

Narrador = **voz clonada del Productor** (su propia grabación, con su consentimiento; variante A de
`voice/chatterbox_natural/NOTES.md`). **Eli y Mila no tienen voz**: sus 21 líneas son silencios del mismo largo que
tenían en la pista de Kokoro, para que los cuadros de texto conserven su tiempo de lectura. Guion v3 bloqueado, palabra
por palabra (`script_parse.py` → `build_voice.plan()`, mismos segmentos, mismas pausas de gag y mismo aire `after`).

**Para escuchar:** `chatterbox/narration_es_preview.mp3` (8:31, 80 kbps, 4,9 MB) · `chatterbox/short_es_preview.mp3` (0:40).

## Resumen

| | Chatterbox (clon) | Kokoro (antes) | Objetivo |
|---|---|---|---|
| Duración total (con pantalla final de 20 s) | **8:31,3** (511,34 s) | 7:59,1 | 7:30-8:00 → **31 s por encima** (ver nota) |
| Pregunta del gancho termina ("…aparente?") | 0:41,1 | 0:36,9 | ~0:31-0:34 |
| Fin del beat 24 ("…Diez Mil Puntos.") | 8:07,9 | 7:35,8 | ≈ 7:36 |
| Ritmo del narrador (dentro de sus líneas) | **144 ppm** | 157 ppm | 155 ppm |
| Sonoridad / pico | **−18,0 LUFS · TP −2,1 dBTP** · LRA 3,5 | −18,0 · −2,1 | −18 LUFS, TP ≤ −2 ✔ |
| WER de la pista completa (Whisper small, mismo normalizador) | **0,58 %** (6/1030 palabras), ver abajo: todo es del ASR | 1,56 % (incluía personajes) | 0 de pronunciación |
| Trozos sintetizados / retomas | 51 trozos · **16 retomas** (46 salieron bien a la primera) | — | — |
| Short `short_es.wav` | **40,4 s** · −18,0 LUFS · TP −2,1 · **WER 0 %** · 0 retomas · 142 ppm | 37,35 s | 30-45 s ✔ (meta 35-40: +0,4 s) |

**Nota de duración:** el clon lee a su ritmo natural (144 ppm frente a 157 de Kokoro), así que la voz ocupa ~30 s más.
Si se necesita volver a ~8:00, se puede acelerar todo un 6 % en el montaje (`CB_VOICE` → `"speed": 1.06`, sin volver a
sintetizar: el tempo se aplica al ensamblar, la caché guarda los trozos crudos). No lo apliqué: la naturalidad era la
prioridad.

## Ajustes

Chatterbox **Multilingual V3** (código de GitHub @ 5de7a54, MIT; pesos `t3_mtl23ls_v3` + `s3gen.pt`, MIT), referencia
`voice/producer/producer_reference_clean.flac` (19,6 s), exageración 0,45 · cfg 0,4 · temperatura 0,75, **por trozos**
(cada línea en una llamada, o en grupos de oraciones de ≤ 200 caracteres; cortes en los `[pause x]` del guion), sin cambio
de velocidad. Sin las grafías de Kokoro (Náshvil, Tenesí, corrras): Chatterbox dijo bien "Nashville", "Tennessee" y
"corras" con la ortografía normal. Regla de retoma: Whisper sobre cada trozo, hasta 6 tomas con otra semilla si WER > 0
o si la toma se alarga (balbuceo); se guarda la mejor. Marca de agua Perth en todo (imperceptible).

## Por beat (inicio y largo del tramo, frente a Kokoro)

| Beat | Inicio | Tramo | Kokoro inicio | Kokoro tramo | WER | Retomas |
|---|---|---|---|---|---|---|
| 01 | 0:00,3 | 7,7 s | 0:00,3 | 8,1 s | 0 % | 0 |
| 02 | 0:08,0 | 10,3 | 0:08,4 | 9,1 | 0 % | 0 |
| 03 | 0:18,2 | 11,9 | 0:17,5 | 10,7 | 0 % | 0 |
| 04 (+ sello del 5) | 0:30,1 | 16,1 | 0:28,2 | 13,8 | 0 % | 0 |
| 06 | 0:46,2 | 26,1 | 0:42,0 | 24,8 | 0 % | 0 |
| 07 | 1:12,3 | 19,4 | 1:06,8 | 17,0 | 0 % | 0 |
| 08 | 1:31,7 | 11,1 | 1:23,8 | 11,6 | 0 % | 0 |
| 09 | 1:42,8 | 23,8 | 1:35,4 | 23,1 | 0 % | 4 |
| 10 | 2:06,6 | 22,3 | 1:58,5 | 20,1 | 0 % | 0 |
| 11 | 2:28,9 | 22,9 | 2:18,6 | 21,0 | 0 % | 0 |
| 12 | 2:51,8 | 36,2 | 2:39,6 | 32,7 | 1,4 % | 0 |
| 13 | 3:28,0 | 32,1 | 3:12,3 | 30,3 | 0 % | 0 |
| 14 | 4:00,0 | 26,9 | 3:42,6 | 24,8 | 0 % | 0 |
| 15 | 4:26,9 | 22,5 | 4:07,4 | 20,9 | 0 % | 0 |
| 16 | 4:49,4 | 18,1 | 4:28,3 | 17,7 | 0 % | 0 |
| 17 | 5:07,5 | 17,5 | 4:46,0 | 15,3 | 0 % | 0 |
| 18 | 5:25,0 | 23,3 | 5:01,3 | 24,4 | 0 % | 0 |
| 19 | 5:48,2 | 35,0 | 5:25,7 | 34,6 | 3,6 % | 5 |
| 20 | 6:23,2 | 29,0 | 6:00,4 | 26,0 | 0 % | 0 |
| 21 | 6:52,3 | 25,4 | 6:26,4 | 22,2 | 0 % | 2 |
| 22 | 7:17,7 | 21,2 | 6:48,7 | 19,7 | 0 % | 0 |
| 23 | 7:38,8 | 15,9 | 7:08,3 | 14,8 | 12,5 % | 5 |
| 24 | 7:54,7 | 16,6 | 7:23,1 | 16,0 | 0 % | 0 |
| final | 8:11,3 | 5,6 (+ pantalla de 20 s) | 7:39,1 | 4,4 | 0 % | 0 |

## Las 6 "palabras con error" (ninguna parece de pronunciación; **escuchar para confirmar**)

| Dónde | Guion | Whisper oye | Lectura |
|---|---|---|---|
| beat 23, 7:46 aprox. | "esta vez, **Eli deja** el espacio" | "él y deja" (en las 6 tomas igual) | "Eli" con acento en la E, como debe ser, + "deja": Whisper lo parte. Kokoro tenía el mismo caso ("Eli está" → "Él está") |
| beat 19, 5:50 aprox. | "El **auto paciente**" | "autopaciente" | formato: las mismas palabras juntas (igual que con Kokoro) |
| beat 19, final | "ningún conductor **puede** absorber eso" | "pueda" | solo en la pista completa; el trozo aislado se oyó "puede" ✔. Vocal final floja |
| beat 12 | "repitió" | "repicio" | solo en la pista completa; el trozo aislado pasó ✔ |

**WER de pronunciación ≈ 0-0,2 %.** Ningún trozo inventó, repitió ni balbuceó (V3 cumple lo de "menos alucinaciones":
46 de 51 trozos salieron perfectos a la primera).

## Huecos de los personajes (silencios con su tiempo de lectura)

Las 21 líneas de Eli y Mila duran en total 22,0 s; cada una conserva el largo de su voz de Kokoro + el mismo aire
después. Están en `chatterbox/segments_es.json` (`"voiced": false`, `start`, `dur`) y en los timings: sus palabras van
repartidas por longitud dentro del hueco, con `speaker: "eli"/"mila"`, `voiced: false` y `slot: [inicio, fin]`
(en minúscula, como espera `anim.js`). Las palabras del narrador llevan `voiced: true`.

## Archivos

| Archivo | Qué | En git |
|---|---|---|
| `timings_es.json`, `timings_short_es.json`, `segments_es.json`, `segments_short_es.json` | **ahora Chatterbox** (copias de `chatterbox/`); mismo formato, mismas 1089 / 92 palabras en el mismo orden | sí |
| `*_kokoro.json`, `short_es_kokoro.wav`, `narration_es_kokoro.wav` | la versión Kokoro, guardada | sí (salvo el wav largo) |
| `narration_es.wav`, `short_es.wav` | ahora Chatterbox (48 kHz, 24 bit) | `short_es.wav` sí; `narration_es.wav` no (como antes) |
| `chatterbox/build_voice_cb.py` | el proceso (`render`, `assemble`, `align`, `qc`) | sí |
| `chatterbox/segments/*.flac` (33) · `segments_short/` | líneas del narrador, 24 kHz 16 bit | sí |
| `chatterbox/qc_es.json`, `asr_es.json` (+ short) | las medidas de este informe, con cada toma | sí |

Volver a Kokoro: copiar los `*_kokoro.json` / `*_kokoro.wav` sobre los nombres principales. Ojo: `build_voice.py`
(Kokoro) escribe los nombres principales si se vuelve a correr.

```bash
CB_VOICE='{"ref": "newchannel/voice/producer/producer_reference_clean.flac", "model": "v3", "s3gen": "base", "mode": "chunk",
  "exaggeration": 0.45, "cfg_weight": 0.4, "temperature": 0.75, "speed": 1.0, "speed_jitter": 0, "pause_jitter": 0, "ex_jitter": 0}' \
TQDM_DISABLE=1 OMP_NUM_THREADS=2 nice -n 10 /tmp/claude-0/cbnat/venv/bin/python -I \
  newchannel/ep/001/audio/chatterbox/build_voice_cb.py all both     # ~2,5 h de CPU desde cero; caché en /tmp/claude-0/cbnat/cache
```

**El animatic usa estos timings nuevos**: los bloques ya renderizados con Kokoro quedan desfasados hasta volver a
renderizarlos (la voz es ~30 s más larga). Al oído no puedo juzgar: todo lo de arriba son medidas.
