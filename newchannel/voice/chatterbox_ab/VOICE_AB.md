# Prueba A/B de voz: Chatterbox Multilingual vs Kokoro (actual) · 2026-10-15

Prueba aprobada por el Productor el 2026-10-15. Las líneas son las del guion bloqueado `ep/001/SCRIPT_ES419.md`,
palabra por palabra. CPU, 2 hilos, `nice -n 10`.

**Para escuchar:** `AB_voces.mp3` (2:45, 2,7 MB, mono 128 kbps). No tiene locutor, solo tonos:

| Señal | Qué suena después |
|---|---|
| dos tonos suaves que suben (sol → re) | **empieza una línea nueva** (orden de la tabla de abajo: N1, N2, E1, E2, E3, M1, M2, M3) |
| 1 pitido corto agudo | **A = Kokoro** (la receta actual de producción) |
| 2 pitidos cortos medios | **B = Chatterbox Multilingual**, exageración 0,5 / cfg 0,5 (los valores por defecto) |
| 3 pitidos cortos medios | **B+ = Chatterbox Multilingual**, exageración 0,8 / cfg 0,3 (más expresivo) |
| 2 pitidos largos graves | **C = Chatterbox, paquete "LatAm Spanish"** (finetune es-419/es-MX), exageración 0,5 / cfg 0,5 |

Todos los clips están recortados con la misma regla y normalizados a **−16 LUFS** (48 kHz). Los gritos muy cortos
llevan un tope de pico de −1 dBFS, así que pueden quedar un poco por debajo.

## Líneas de prueba

| Id | Personaje | Guion (en pantalla) | Texto al TTS (igual que en producción) |
|---|---|---|---|
| N1 | Narradora | Una carretera despejada. Allá adelante, un conductor toca el freno. Una sola vez. | igual |
| N2 | Narradora | Lo que importa es cuántos autos hay en cada tramo de pista: los ingenieros le dicen densidad. | igual |
| E1 | Eli | ¡¿Quién fue?! | igual (Kokoro: +1 st, velocidad 1,05) |
| E2 | Eli | …Fue el viento. | igual (Kokoro: 0,9) |
| E3 | Eli | ¡Hay un hueco! ¡Un hueco enorme! | igual (Kokoro: 1,15) |
| M1 | Mila | Eli… va para atrás. | "Eli. Va para atrás." (el mismo truco que en producción) |
| M2 | Mila | Ese hueco es mi amigo. | igual (Kokoro: 0,92) |
| M3 | Mila | Fuiste tú. | igual (Kokoro: 0,92) |

## Qué se usó

- **A, Kokoro-82M v1.0**: `build_voice.py` tal cual (narradora `ef_dora` 0,6 + `af_heart` 0,4, velocidad 0,92; Eli
  `em_alex`; Mila `ef_dora` 0,65 + `bf_emma` 0,35, +2 st), con las velocidades y semitonos de `OPTS`. Audio crudo
  del TTS, sin el HPF ni la compresión del montaje final (igual que el lado B).
- **B / B+, Chatterbox Multilingual v2**: paquete `chatterbox-tts` 0.1.7 (MIT) con los pesos
  `ResembleAI/chatterbox` `t3_mtl23ls_v2` + `s3gen.pt` (MIT). El paquete de PyPI aún no carga el checkpoint "V3"
  de la tarjeta; V3 queda sin probar. `language_id="es"`, semilla fija por línea.
- **C, paquete LatAm Spanish** (`ResembleAI/Chatterbox-Multilingual-es-mx-latam`, MIT): su T3
  `t3_es_mx_latam.safetensors` entra exacto (strict) en el T3 multilingüe, con el decodificador v2 `s3gen.pt`.
  Su tarjeta lo pensó con `s3gen_v3`, que el paquete 0.1.7 no carga, así que C podría sonar algo mejor con el
  código V3.
- **Audio de referencia (prompt de voz).** Ninguna persona real. No usé la voz de fábrica `conds.pt` (no se sabe
  de quién es). Cada personaje se condicionó con **nuestra propia salida de Kokoro**, una voz sintética que es del canal:

| Personaje | Referencia (24 kHz) | Duración |
|---|---|---|
| Narradora | `ep/001/audio/segments/b07_13_narrator.flac`, los primeros 10 s ("Al principio, todo bien. Luego aparecieron titubeos…") | 10,0 s |
| Eli | `b06_11_eli` + `b13_27_eli` + `b14_29_eli` + `b19_43_eli` + `b10_21_eli` (ninguna es línea de prueba), separados por 0,3 s | 8,2 s |
| Mila | Kokoro nuevo con la receta de Mila leyendo "Esta es la parte favorita de Mila. En otra prueba no hubo computadora…" (Mila casi no tiene líneas fuera de la prueba) | 9,4 s |

## Resultados

**WER** (Whisper small, el mismo normalizador que `build_voice.py`; cuento "Ellie" como "Eli", igual que en
producción). Son 52 palabras por versión:

| Versión | WER | Líneas con palabras inventadas o repetidas |
|---|---|---|
| **A · Kokoro** | **0,0 %** (0/52) | 0/8 |
| B · Chatterbox x0,5 | 9,6 % (5/52) | 2/8: M1 repite "Eli va para…"; M3 añade otro "tú" |
| B+ · Chatterbox x0,8 | 9,6 % (5/52) | 1/8: **M3 "Fuiste tú" + 4 s de balbuceo** ("Alvapor de Alavero Ordes") |
| C · LatAm x0,5 | **26,9 %** (14/52) | 1/8: **E2 "…Fue el viento" + 7 s de frases inventadas** |
| (LatAm x0,8, solo medido) | 9,6 % (5/52) | 2/8: E1 "¿Quién fue? ¿Quién fue?"; E2 "Fue el viento, fue el bien" |

Error común: en N1, Chatterbox dice "Allá **delante**" en 3 de 4 ajustes (se come la "a"). Kokoro dice "adelante".
Las líneas largas de la narradora salen limpias en Chatterbox (N2 0 % en los 4 ajustes). Los fallos se concentran
en las **líneas cortas de personaje**: el modelo autorregresivo no sabe parar y repite o inventa. Además, todas las
salidas crudas de Chatterbox traen ~2 s de cola de ruido bajo (−55 a −65 dBFS) que hay que recortar (B E1 crudo:
3,0 s; recortado: 0,8 s).

**Acento (ES-419 vs España).** Medí el seseo: energía de fricción aguda (4-11 kHz) de las palabras con z/ce/ci
frente a las palabras con /s/; una /θ/ peninsular saldría unos 10-20 dB más baja. Chatterbox: "vez" entre −3 y
+6 dB, "dicen" entre −2 y +1 dB, o sea /s/ en todos los ajustes (seseo, latinoamericano). En Kokoro "dicen" da
−1,7 dB (/s/); "vez" da −12 dB porque la /s/ final queda recortada o apagada al final del enunciado (espeak `es-419`
dice `βˈes`). No vi ninguna /θ/. El acento lo hereda en gran parte de la referencia (es-419 de Kokoro). La única
pista peninsular es "allá delante". **La medición no reemplaza al oído:** el juicio fino de acento y naturalidad
es del Productor con `AB_voces.mp3`.

**Identidad de voz** (Resemblyzer, coseno con la referencia; > ~0,85 = misma persona): narradora 0,90-0,95 en
Chatterbox (la clona bien), Mila 0,75-0,85, Eli 0,66-0,91 (varía con cada grito). Kokoro siempre es la misma voz,
por construcción.

**Velocidad en CPU** (2 hilos, máquina compartida con el render del animatic):

| | Audio generado | Tiempo de síntesis | Factor tiempo real |
|---|---|---|---|
| Kokoro | 20,3 s | 25,7 s (contando el arranque) | **≈ 0,9×** (más rápido que tiempo real en líneas largas: N2 0,7×) |
| Chatterbox Multilingual (B, B+) | 29-32 s | 391-410 s | **≈ 13×** más lento que tiempo real (entre 9,4× y 25,6× por clip) |
| Chatterbox LatAm (C) | 26-30 s | 344-362 s | ≈ 12-13× |

Carga del modelo: 15-19 s. Con 2 hilos, los 8 minutos de narración del piloto costarían unas **1,7 h por pasada**,
sin contar las repeticiones que obligan las alucinaciones. Kokoro tarda unos 7 min.

**Marca de agua Perth** (Resemble AI, MIT). Chatterbox la mete siempre, sin opción. La comprobé con el detector
de `resemble-perth`: **1,0 en todos los clips de Chatterbox**, cruda, tras normalizar a 48 kHz y tras MP3 de 128 kbps.
Kokoro (control) da 0,0. La marca es imperceptible, según el fabricante y según las medidas. No es un problema de
licencia: marca el audio como sintético. Encaja con marcar el vídeo como "contenido alterado o sintético" en YouTube,
pero nunca hay que quitarla.

**Licencias**: código y pesos MIT (multilingüe y LatAm), Perth MIT y dependencias Apache/MIT/BSD/ISC. Una
dependencia que trae el paquete, `pykakasi` (japonés), es GPL-3.0: no se usa para español, vive en un venv
desechable y nada suyo entra en nuestro código. Todo está apuntado en `LICENSES.md`. Los pesos (~3,5 GB) quedaron
fuera de git y se borraron al terminar.

## Recomendación

**Mantener Kokoro para el piloto.** Chatterbox no está listo para nuestro uso, por tres razones medidas:

1. **No es fiable en las líneas cortas de Eli y Mila**, que son el humor del vídeo. En 24 renders cortos de
   personaje (6 líneas × 4 ajustes), 6 salieron con palabras repetidas o inventadas, dos de ellos con 4-7 s de balbuceo. Kokoro tiene 0
   errores con el guion bloqueado, y la regla del canal es palabra por palabra.
2. **Es ~13× más lento que tiempo real** en 2 hilos, frente a ~1× de Kokoro.
3. **Para la narradora sí es un candidato real**: dice bien las frases largas (N2 0 % en los 4 ajustes, solo
   "delante" en N1), mantiene nuestra voz (similitud 0,90-0,95) y la exageración le da más vida a la entonación. Si
   al Productor le gusta más la **B** de N1/N2 al oído, el plan es un modo híbrido: Chatterbox solo para la
   narradora, con retoma automática (otra semilla) cuando Whisper detecte palabras de más o de menos, y Kokoro para
   Eli y Mila. Coste: ~2 h de CPU por episodio.

Pendiente si se quiere seguir: probar el checkpoint **V3** y el paquete LatAm con su `s3gen_v3` cuando el paquete
de PyPI los cargue. La tarjeta promete "menos alucinaciones", justo nuestro problema.

## Archivos

- `AB_voces.mp3`: la escucha.
- `measurements.json`: WER, transcripción, recorte, seseo, similitud, velocidad por clip y detección de marca de agua.
- `build_ab.py`: arma el MP3 a partir de los clips normalizados.
- `scripts/`: `lines.py` (líneas), `kokoro_clips.py` (lado A + referencias, venv de voz), `cb_clips.py` (lado B/C,
  venv de Chatterbox, `python -I`, `HF_HUB_OFFLINE=1`), `qc.py` (recorte, −16 LUFS, WER, seseo, similitud),
  `wm_check.py` (Perth).
