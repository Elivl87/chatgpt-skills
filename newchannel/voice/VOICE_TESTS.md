# Pruebas de voz A/B · Kokoro-82M · EN + ES-419 · 2026-10-13

Para que el Productor elija la voz del canal. **Escuchar:** `voice/AB_EN.mp3` (5:04, 4,9 MB) y `voice/AB_ES.mp3`
(3:58, 3,7 MB). Cada candidata va precedida de N pitidos (N = número de candidata) y de su letra dicha por una voz de
anuncio que **no** es candidata (EN: `af_nicole`; ES: mezcla 50/50 `ef_dora`+`em_santa`). Cada muestra suelta está en
`voice/samples/`.

**Texto:** gancho del piloto, beats 1-3 palabra por palabra (`pilot/SCRIPT_EN.md` / `pilot/SCRIPT_ES419.md`, borrador
v1), más una línea de prueba de marca tras 0,9 s: *"Ten Thousand Dots. Tiny systems, explained with dots."* /
*"Diez Mil Puntos. Pequeños sistemas, explicados con puntos."* (el beat 4 no tiene narración, así que el nombre se
prueba aparte). Cada beat se sintetiza por separado (100-200 tokens, el rango óptimo de Kokoro) con 0,45 s de aire entre
beats.

**Modelo:** Kokoro-82M v1.0 (hexgrad), `kokoro` 0.9.4 + `misaki` 0.9.4, CPU, 2 hilos. SHA256 de pesos y de las 11 voces
usadas comprobados contra `VOICES.md`. Nunca se clonó una voz: solo voces de fábrica de Kokoro y mezclas de sus tensores.

## Ajuste clave para ES-419

El código de idioma `e` de Kokoro usa espeak-ng `es` = **castellano de España**: "Diez" sale `djˈeθ`, "quince" `kˈinθe`
(con zeta). En las muestras se sustituye el G2P por espeak-ng **`es-419`** (Latinoamérica): `djˈes`, `kˈinse`, `entˈonses`,
y yeísmo `ʝˈeɣan` ("llegan"). **"Diez Mil Puntos" = `djˈes mˈil pˈuntos`**, y Whisper lo transcribe bien con las 5
voces. Una línea en `tools/render.py`:
`p = KPipeline(lang_code='e'); p.g2p = espeak.EspeakG2P(language='es-419')`.

## Candidatas

Velocidad ajustada por voz hasta ~150 ppm (EN) y ~155 ppm (ES), los ritmos que asume el guion. ppm = palabras del
gancho (EN 80, ES 93) / duración del gancho. Todas: recorte de silencios, paso alto de 70 Hz, compresión suave (2,5:1),
loudnorm de dos pasadas a −16 LUFS, MP3 de 128k mono.

### Inglés

| | Voz / receta | Vel. | ppm | Dur. | WER small | WER base | F0 med. | Rango F0 | Notas medidas |
|---|---|---|---|---|---|---|---|---|---|
| **A** | `af_heart` (nota A, la mejor según VOICES.md) | 0,89 | 147,7 | 37,9 s | 0,0 % | 1,1 % | 202 Hz | 8,9 st | base: "our dot" → "are dot" ("Our" sale reducido, `ˌWəɹ`) |
| **B** | `af_bella` (A−, HH horas) | 0,98 | 151,8 | 36,9 s | 0,0 % | 0,0 % | 209 Hz | 7,8 st | La más clara en ASR; la entonación más plana del grupo |
| **C** | `am_michael` (C+) | 1,01 | 148,6 | 37,6 s | 0,0 % | 2,3 % | 115 Hz | 15,5 st | base: "nose"→"knows" (homófono), "explained"→"explain" (la "d" final se pierde) |
| **D** | `am_fenrir` (C+) | 0,87 | 149,8 | 37,1 s | 0,0 % | 1,1 % | 132 Hz | 16,0 st | Solo el homófono "nose/knows". La entonación más viva del grupo |
| **E** | `bm_george` (C, británico, `lang_code='b'`) | 1,00 | 150,5 | 37,4 s | 0,0 % | 0,0 % | 142 Hz | 12,3 st | Inglés británico (`ɹˈuːt`, `dɪzˈɑːstə`) |
| **F** | mezcla `af_heart` 0,6 + `af_bella` 0,4 | 0,93 | 150,6 | 37,2 s | 0,0 % | 1,1 % | 207 Hz | 8,5 st | Igual que A ("our"→"are" en base) |
| **G** | mezcla `af_heart` 0,7 + `ef_dora` 0,3 | 0,84 | 152,6 | 36,9 s | 0,0 %* | 1,1 %* | 193 Hz | 8,7 st | *Errores no reales: "one"→"1" (formato) y "nose/knows" (homófono). **Timbre casi idéntico a ES-D** |

### Español (ES-419, G2P `es-419`)

| | Voz / receta | Vel. | ppm | Dur. | WER small | WER base | F0 med. | Rango F0 | Notas medidas |
|---|---|---|---|---|---|---|---|---|---|
| **A** | `ef_dora` | 0,83 | 157,0 | 40,9 s | 3,0 % | 0,0 % | 173 Hz | 9,1 st | small: "Y de repente" → "Si de repente" (la "Y" tras la pausa sale débil) |
| **B** | `em_alex` | 0,83 | 156,5 | 41,2 s | 3,0 % | 5,9 % | 130 Hz | 9,9 st | Se come la "Y"; base oye "colecteivo" y "Pazan" (la /s/ sale sonora) |
| **C** | `em_santa` | 0,82 | 154,1 | 41,9 s | 2,0 % | 5,0 % | 131 Hz | 12,8 st | base: "Pazan". Por el nombre parece una voz de "Santa Claus": vigilar si suena caricaturesca |
| **D** | mezcla `ef_dora` 0,6 + `af_heart` 0,4 | 0,92 | 157,0 | 41,1 s | 2,0 % | 0,0 % | 184 Hz | 8,8 st | La más limpia: su único error es el homófono "doce paradas" (ver abajo) |
| **E** | mezcla `em_alex` 0,6 + `am_michael` 0,4 | 0,97 | 157,2 | 41,1 s | 5,9 % | 5,0 % | 124 Hz | 10,0 st | small: "y de repente tres" → "23"; base: "Pazan", "buces" ×2. La peor |

Los errores "doce paradas" → "dos separadas" (todas las voces con small, 2 palabras = 2 puntos de WER) y "por qué" →
"porque" son **homofonía o formato, no pronunciación**: con seseo, /ˈdose paˈɾaðas/ y /ˈdos sepaˈɾaðas/ suenan casi igual.
Whisper base sí entiende "doce paradas" con A y D. **Nota para el guionista:** en pantalla se ven las doce paradas, así
que no es grave; si se quiere blindar, una opción es "Doce paradas" → "Tiene doce paradas" (requiere el visto bueno del
Productor, porque el guion se usa palabra por palabra).

**WER corregido** (sin homófonos ni formato de números): EN: todas 0 % con small; con base, A/F 1,1 % ("our"), C 1,1 %
("explained"), el resto 0 %. ES: **D 0 % / 0 %**, A 1 % / 0 %, C 0 % / 1 %, B 1 % / 2 %, E 4 % / 3 %.

### Similitud de timbre EN ↔ ES (coseno de MFCC medios, 1,0 = mismo timbre)

| EN \ ES | A dora | B alex | C santa | **D dora+heart** | E alex+michael |
|---|---|---|---|---|---|
| A heart | 0,971 | 0,927 | 0,875 | 0,986 | 0,898 |
| C michael | 0,932 | 0,969 | 0,975 | 0,918 | **0,987** |
| D fenrir | 0,968 | 0,956 | 0,955 | 0,960 | 0,939 |
| F heart+bella | 0,957 | 0,920 | 0,861 | 0,974 | 0,893 |
| **G heart+dora** | 0,986 | 0,946 | 0,898 | **0,995** | 0,920 |

## Recomendación

**EN = G (mezcla `af_heart` 0,7 + `ef_dora` 0,3, vel. 0,84)** · **ES = D (mezcla `ef_dora` 0,6 + `af_heart` 0,4,
vel. 0,92)**.
- Son el mismo "personaje" en los dos idiomas, construido con los mismos dos tensores en proporciones inversas:
  timbre 0,995 (el par más cercano de toda la prueba), F0 193 / 184 Hz y el mismo rango de entonación (8,7 / 8,8 st).
- Son mezclas propias, así que la voz es del canal: no es la voz de fábrica que usan otros canales hechos con Kokoro.
- ES-D tiene la mejor inteligibilidad del español con los dos modelos de Whisper. EN-G no tiene errores reales.
- Plan B si la mezcla suena rara al oído: EN A `af_heart` (la voz mejor valorada de Kokoro) con ES D.
- Par masculino, si el Productor prefiere voz de hombre: EN C `am_michael` + ES C `em_santa` (timbre 0,975). Con C/D
  en inglés la entonación es más viva (15-16 st frente a ~9 st de las femeninas), pero las voces masculinas en español
  (B, C, E) tienen el defecto de la /s/ sonora ("Pazan") y más errores.

**Límites honestos:** no puedo oír. Naturalidad, calidez y "chispa" están sin juzgar: solo tengo medidas indirectas
(ASR, F0, silencios, picos). Lo que mejor puede reflejar el humor es el rango de F0, y las voces femeninas de Kokoro
miden más planas que las masculinas. Que decida el oído del Productor. No hay recortes (0 muestras ≥ 0 dBFS en ninguna
muestra procesada; los picos del raw estaban entre −2,7 y −8 dBFS). Todas miden −16,5 ±0,1 LUFS y su true peak está
entre −1,7 y −1,9 dBTP. El hueco más largo (1,3-1,9 s) es la pausa intencionada antes de la línea de marca. No hay
silencios raros dentro de las frases.

## Pronunciación revisada (fonemas en el log de render)

- EN: "route" `ɹˈut` (EN-US), "clockwork", "threes", "Nobody": bien. "Our" sale reducido (`ˌWəɹ`): si molesta, en la
  producción se puede marcar con la sintaxis de misaki `[Our](/ˈWəɹ/)`, sin cambiar el texto.
- ES: "guagua" `ɣwˈaɣwa`, "pegaditos", "colectivo" y "Vancouver" (fuera del gancho) sin probar. "reloj" sale `relˈox`, con
  la jota final suave; es válido en ES-419 y Whisper lo entiende. "¿" no está en el vocabulario de Kokoro y se ignora (la
  entonación de pregunta viene del "?"). Se probó "esperando, y de repente…" (coma en vez de punto) para reforzar la
  "Y": no mejoró de forma consistente, así que se mantiene la puntuación original.
- La velocidad de Kokoro no responde de forma lineal (0,85 → 0,80 cambia la duración ~11 %): hay que medir siempre los
  ppm después de cambiarla.

## Reproducir

`voice/tools/`: `texts.py` (texto exacto), `render.py candidates.json OUT` (síntesis), `post.py OUT FINAL`
(procesado + medidas), `wer.py FINAL small|base` (faster-whisper int8, CPU; `WHISPER_DIR` = carpeta del modelo),
`prosody.py` (F0 + timbre), `ab.py FINAL DST` (archivos A/B). Las medidas completas, con las transcripciones, están en
`voice/measurements.json`. Entorno: venv de Python 3.12 (spaCy no compila en 3.13), `torch` CPU, `HF_HOME` en una carpeta
propia de descargas, `OMP_NUM_THREADS=2`.
