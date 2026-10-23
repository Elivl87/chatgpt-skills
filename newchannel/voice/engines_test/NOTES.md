# Prueba de motores de voz · Qwen3-TTS · VoxCPM2 · CosyVoice 3 · 2026-10-23

Pedido del Productor: «Quiero escuchar ya a Qwen3-TTS, VoxCPM2 y CosyVoice 3 y poder elegir». Durante el día el criterio
cambió tres veces con su oído (ver «Historia del día»); el entregable final gira alrededor del **timbre «Ryan» de
Qwen3-TTS en registro exclamativo, a ≈150 palabras por minuto**, y de ese mismo timbre pasado por VoxCPM2 y CosyVoice 3.

## Para el Productor

**`ELIGE.mp3`** (≤ 4 min, 48 kbps): el mismo pasaje del episodio 1 (gancho + «vamos más despacio» + remate de la cena),
tres voces, todas con la misma velocidad (≈150 palabras por minuto):

- **1 pitido = Qwen3-TTS**, la voz «Ryan» que te gustó, dirigida frase por frase en el registro de «Entonces, ¿por qué
  hay embotellamientos…? ¡Vamos más despacio!»: exclamativo, proyectado, emocionado, nunca calmado.
- **2 pitidos = VoxCPM2** escuchando a esa misma voz Ryan como referencia (no clona a ninguna persona: es una voz sintética).
- **3 pitidos = CosyVoice 3**, igual: la voz Ryan como referencia + instrucción de energía por frase.

Mi lectura honesta (son medidas, no oído): **la voz 1 (Qwen3-TTS Ryan) es la más viva** —el tono se mueve más que en
cualquier otra toma del día (21 semitonos de recorrido, frente a 16 del tramo que te gustó)— y dice el texto sin un solo
error. Las voces 2 y 3 copian el timbre de Ryan pero cada motor le pone su propio carácter; están aquí para que elijas
con el oído si alguna suena **más natural** que la original manteniendo la energía. Hay que acelerarlas todas: ningún
motor habla rápido de fábrica (Qwen 100-108 ppm, VoxCPM2 y CosyVoice ver tabla); la aceleración es limpia (no cambia el
tono, Whisper entiende lo mismo antes y después).

Las demás pistas por motor (`qwen3tts.mp3`, `voxcpm2.mp3`, `cosyvoice3.mp3`, `chatterbox.mp3`) son para comparar
variantes dentro de cada motor; el orden de pitidos está en la tabla de abajo.

**Recomendación para la voz del canal:** Qwen3-TTS con la voz Ryan, receta de abajo. Es gratis, Apache-2.0 (la voz Ryan
es parte del modelo, no una persona), corre en nuestra CPU (≈4 s de cálculo por segundo de voz; la narración completa de
un episodio de 7 min cuesta ~1 h), tiene control de emoción por texto y no depende de ningún servicio. Si al oído la 2 o
la 3 te suenan más humanas, la receta se cambia sin perder la voz: las tres parten de Ryan.

## Receta reproducible de la voz elegida (pista 1)

- Modelo `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` (bf16, Apache-2.0), motor C `gabriele-mastrapasqua/qwen3-tts` ef339be
  (MIT) compilado `make blas` (OpenBLAS, AVX-512/AMX), servidor `./qwen_tts -d cv17 -j 3 --max-request-seconds 900 --serve 8091`.
  **Sin `--int8`** (en esta máquina el int8 habla al doble de lento y alucina).
- `speaker: ryan`, `language: Spanish`, `temperature 0.9`, `top_k 50`, `top_p 1.0`, `rep_penalty 1.05` (los valores
  oficiales de `generation_config.json`), una llamada por oración (`direction.split_directed`), semillas
  `5000 + 97·línea + 13·oración` y retoma con `+7919` por intento hasta WER 0 (máx. 6).
- Instrucción por oración (`harness.py`, `ET_REGISTER=exclaim`): «Exclamativo y proyectado, emocionado, como contando
  una sorpresa a un amigo, con la energía de una línea de personaje; nunca calmado, nunca plano. Rápido (unas 150
  palabras por minuto), sonriendo, entonación viva.» + matiz por perfil (pregunta real / chiste en la pausa / cita a Eli
  más fuerte y exasperado / cita a Mila más serena). Versión inglesa equivalente en `INSTRUCT`.
- Pausas por puntuación (`cbn.pause_after` × `pscale` del perfil), nivel −20 LUFS por pieza (+2,5 dB Eli, −2 dB Mila),
  −16 LUFS el conjunto.
- Ritmo: `harness.postprocess` → ffmpeg `rubberband=tempo=1.436:pitch=1.0:transients=crisp` hasta 150 ppm medidas en
  habla + `silenceremove` (pausas > 0,45 s recortadas a 0,45 s). Alternativa dentro del motor: campo `rate` 1.3-1.5
  (también conserva el tono; misma inteligibilidad medida).
- Comandos: `ET_REGISTER=exclaim python -I run_qwen.py b --speaker ryan --temperature 0.9 --tries 6 --seed0 5000 --name qwen_ryan_x1`
  y `python -I build_outputs.py qwen3tts elige`.

## Tabla de medidas (todas las tomas, pasaje completo de 162 palabras)

Medidas en la toma **sin acelerar**. WER = palabras mal dichas según Whisper small; «ppm habla» = palabras / segundos
con voz (umbral −35 dB); RTF = segundos de CPU por segundo de voz (tomas buenas / todas las tomas, 2-3 hilos, a menudo
con otro motor corriendo a la vez); similitud = coseno Resemblyzer con la referencia indicada; rango tono = p95−p5 del
f0 en semitonos; melodía = desviación del tono medio por segundo; energía = desviación del nivel (dB).
Objetivo de registro (tramo 0:55-1:15 de `qwen_a`, lo que gustó): rango 16,1 st · melodía 4,5 st · energía 8,9 dB.

| Toma (archivo en `logs/`) | Qué es | WER | Retomas | ppm habla | RTF | Sim. | f0 | Rango st | Melodía st | Energía dB | Seseo |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `qwen_a` | Qwen 1.7B CustomVoice, **Ryan**, sin instrucción | 0,6 % (1) | 22 | 101 | 4,2 / 9,1 | 0,705 (Productor) | 140 | 15,8 | 4,8 | 8,6 | LatAm (−3,8 dB) |
| `qwen_b` | Ryan + instrucción NARRADOR.md (sin pedir energía) | 0 % | 19 | 95 | 4,0 / 8,0 | 0,700 | 130 | 11,8 | 4,5 | 8,1 | LatAm |
| `qwen_ryan_r1` | Ryan + instrucción NARRADOR.md + «rápido, con energía» | 0,6 % | 11 | 108 | ~4 (medido con contención 11,8) | 0,713 | 138 | **24,0** | **6,4** | 6,6 | LatAm |
| **`qwen_ryan_x1`** | **Ryan, registro exclamativo (ELIGE 1)** | **0 %** | 14 | 105 | 7,4 (contención) | 0,707 | 150 | **21,4** | 5,0 | 8,0 | LatAm |
| `qwen_c_m` | Qwen VoiceDesign, voz diseñada ♂ («narrador cálido 35 años») | 0 % | 13 | 145 | 4,6 / 7,8 | 0,748 | 163 | 18,6 | 5,3 | 7,3 | LatAm |
| `qwen_c_f` | Qwen VoiceDesign, voz diseñada ♀ | 0 % | 14 | 150 | 4,8 / 9,2 | 0,626 | 210 | 16,2 | 4,5 | 7,1 | LatAm |
| `cb_builtin_energetic` | Chatterbox V3 voz interna, exag. 0,7-0,9, cfg 0,3 | 0,6 % | 10 | 208 | 14,5 / 21,8 | 0,717 | 149 | 19,8 | 5,5 | 7,4 | LatAm |
| `cb_ref_ryan` | Chatterbox V3 con referencia Ryan (0:55-1:15), exag. 0,6-0,8 (control) | 0 % | 11 | 143 | 11,7 / 16,6 | **0,942 (Ryan)** | 150 | 11,2 | 2,8 | 7,5 | LatAm |
| `vox_ref_ryan` | VoxCPM2 Q8 GGUF con referencia Ryan + guía de estilo (ELIGE 2) | 0,6 % (1: «conos»→«conoz», oído de Whisper) | 8 | 161 | 20 / 36 (incluye recargar el GGUF en cada llamada) | 0,924 (Ryan) | 156 | **25.4** | 5.6 | 8.2 | seseo (0.9 dB) |
| `cosy_ref_ryan` | Fun-CosyVoice3-0.5B con referencia Ryan + instrucción (ELIGE 3) | COSY_WER | COSY_RET | COSY_PPM | COSY_RTF | COSY_SIM | COSY_F0 | COSY_RANGE | COSY_MEL | COSY_ENE | COSY_SESEO |
| `cosy_ref_ryan0` | CosyVoice3 zero-shot (sin instrucción) | COSY0_WER | COSY0_RET | COSY0_PPM | COSY0_RTF | COSY0_SIM | COSY0_F0 | COSY0_RANGE | COSY0_MEL | COSY0_ENE | COSY0_SESEO |
| Control anterior | Chatterbox V3 clon del Productor dirigido (`expressive/`, `A_clone_directed`) | 0 % | 23 | 138 | ~12 | 0,954 (Productor) | — | — | — | — | — |

Aceleración aplicada en los MP3 (`logs/post_*.json`): `qwen_a` ×1,49 (101→150 ppm), `qwen_ryan_r1` ×1,39 (108→154),
`qwen_ryan_x1` ×1,44 (105→149), `cb_ref_ryan` ×1,05 (143→150), `cb_builtin_energetic` ×1,0 (ya iba a 208; no se frena).
`vox_ref_ryan` ×1,0 (161 ppm de fábrica; solo pausas). POST_COSY

**Ranking por energía percibible (medidas: rango tonal × melodía, con WER ≤ 1 %):** 1) `qwen_ryan_r1` (24,0 × 6,4) ·
2) `qwen_ryan_x1` (21,4 × 5,0; el elegido para ELIGE porque además clava el registro exclamativo pedido y tiene WER 0) ·
3) `cb_builtin_energetic` (19,8 × 5,5; pero habla a 208 ppm y suena a otra voz) · 4) `qwen_c_m` (18,6 × 5,3) ·
**0) `vox_ref_ryan` (25,4 × 5,6: por medidas es la más viva de todas, y ya va rápida sin acelerar)** RANK_COSY · último `cb_ref_ryan` (11,2 × 2,8: copia el timbre de Ryan al 0,94 pero lo aplana).

## Pistas por motor

- `qwen3tts.mp3` (4:36): 1 pitido = Ryan sin instrucción (`qwen_a`) · 2 = Ryan + energía (`qwen_ryan_r1`) · 3 = Ryan registro exclamativo (`qwen_ryan_x1`).
- `voxcpm2.mp3`: 1 pitido = referencia Ryan + guía de estilo (`vox_ref_ryan`). Habla a 161 ppm de fábrica: no se aceleró, solo se recortaron las pausas (93→84 s).
- `cosyvoice3.mp3`: 1 pitido = referencia Ryan + instrucción (`cosy_ref_ryan`) · 2 = zero-shot sin instrucción (`cosy_ref_ryan0`). COSY_MP3_NOTE
- `chatterbox.mp3` (2:51): 1 pitido = referencia Ryan (`cb_ref_ryan`) · 2 = voz interna enérgica (`cb_builtin_energetic`).
- Las dos voces diseñadas de Qwen (`qwen_c_m`, `qwen_c_f`) quedaron en la primera versión de `qwen3tts.mp3` (commit `bec87ab`); se oyen con `git show bec87ab:newchannel/voice/engines_test/qwen3tts.mp3`.

## Qué pasó con cada motor (técnico)

**Qwen3-TTS** · Apache-2.0: tarjetas HF «License: apache-2.0» de `Qwen/Qwen3-TTS-12Hz-1.7B-{CustomVoice,VoiceDesign,Base}`
y `LICENSE` Apache 2.0 en `github.com/QwenLM/Qwen3-TTS`; la voz preset **Ryan** es parte de esos pesos (misma licencia,
no es una persona identificable). Motor C MIT (`LICENSE` © 2025 Gabriele Mastrapasqua), RTF 3,8-4,8 en bf16 con 3 hilos
(AVX-512 VNNI/BF16/AMX). `--int8` **descartado** con datos: misma frase y semilla, bf16 8,0 s / int8 12-15 s de audio,
int8 alucinó «hey hey hey» (3 de 5 semillas) donde bf16 dijo el texto. Alucina ~20 % de las tomas en español (el nombre
«Eli» → «Ailey / Él / Lee», a veces frases en inglés); la retoma por WER lo cubre con 11-22 retomas por pasaje. **No
habla rápido de origen**: pedir «muy rápido» en la instrucción empeora (99 ppm); el campo `rate` 1,3 / 1,5 del motor da
139 / 155 ppm con la misma WER que la toma base (prueba de 6 ajustes, misma semilla, en `logs/`… ver tabla de velocidad
abajo). Clonación del Productor (modelo Base, `.qvoice` ICL + x-vector): similitud 0,82 en la frase de prueba; la
variante completa (d) se **abortó** por decisión del Productor (su referencia es plana y el clon reproduce lo plano).
VoiceDesign: las voces diseñadas (c♂, c♀) fueron las más rápidas y expresivas de la primera ronda; las versiones
«locutor joven / grave» (c2) se perdieron al reordenar la cola (dos servidores arrancaron a la vez y se quedaron sin
RAM) y no se repitieron porque el Productor ya había elegido Ryan.

| Velocidad de origen (Ryan, misma frase de 20 palabras, semilla 4242) | ppm habla | WER |
|---|---|---|
| sin instrucción | 108 | 10 % («Él», «delante») |
| instrucción de energía | 117 | 0 % |
| instrucción «habla muy rápido» | 99 | 5 % |
| `rate` 1,3 | 139 | 10 % (los mismos 2 errores que sin instrucción) |
| `rate` 1,5 | 155 | 10 % (ídem) |
| instrucción de energía + `rate` 1,3 | **149** | **0 %** |

**Chatterbox Multilingual V3** (MIT; control): voz interna con exag. 0,7-0,9 / cfg 0,3 = 208 ppm y 19,8 st, muy
enérgica pero atropellada; con la referencia Ryan (exag. 0,6-0,8) copia el timbre (0,94) y pierde la melodía (2,8 st).

**VoxCPM2** · Apache-2.0 (tarjeta: «Released under the Apache-2.0 license, free for commercial use»; `LICENSE` Apache
2.0; GGUF `DennisHuang648/VoxCPM2-GGUF` `license: apache-2.0`, enlazado desde el README oficial). `llama.cpp-omni`
(MIT, © The ggml authors) `voxcpm2-cli` en CPU con dos parches locales (guarda del `F_NOCACHE` de macOS; flag
`--threads`). Habla **rápido de fábrica** (prueba: 14 palabras en 3,9 s = 215 ppm) y su diseño de voz por descripción
funciona en español, pero **cada llamada recarga 3,4 GB de GGUF** (no hay servidor): con la RAM justa cada frase costaba
1-2 min de carga, así que la voz diseñada ♂ se **abortó a los 20 min** (regla del plan) y la toma de ELIGE se hizo por
líneas enteras del guion (13 llamadas) con la referencia Ryan. Resultado: la toma de ELIGE 2 tardó 46 min (RTF 20 contando las 13 recargas; la síntesis pura ronda RTF 12 con 2 hilos), WER 0,6 %, **25,4 st de rango tonal (la toma más melódica del día)**, 161 ppm sin acelerar, similitud 0,92 con Ryan: conserva el timbre con más vida. Para producción haría falta un servidor residente (VoxCPM.cpp o el paquete Python oficial) para no recargar el modelo por frase.

**Fun-CosyVoice3-0.5B** · Apache-2.0 (tarjeta y `LICENSE`; «for academic purposes only» es el aviso de la demo, no la
licencia). PyTorch CPU en un venv que reutiliza el torch de Chatterbox (`.pth`) con transformers 4.51.3; pesos 5,4 GB
(sin `llm.rl.pt` ni los ONNX batch/TensorRT). COSY_TECH

**Orpheus-TTS es/it** (`canopylabs/3b-es_it-ft-research_release`, Apache-2.0): pedido como extra; la tarjeta está
**gated** (acceso con cuenta HF, aunque automático) y no tenemos token → no se pudo descargar. Queda anotado.

## Historia del día (criterios del Productor)

1. Entrega inicial (`bec87ab`): Qwen Ryan / Ryan+instrucción / voz diseñada ♂ / ♀ → «habla muy lento, ¿no puede ser con más ánimo?».
2. Demo de la voz diseñada ♂ acelerada ×1,30 / ×1,45 → «cambia el tono, pero el ritmo estaba mejor» → ritmo fijado en ≈150 ppm.
3. «Habla como desganado…» → prioridad a la energía percibida; se descartan los clones de su propia voz (referencia plana).
4. Oyó Ryan (`qwen_a`) acelerado y le gustó **ese** timbre; en concreto el registro exclamativo del tramo 0:55-1:15 →
   toda la narración se dirige así (`ET_REGISTER=exclaim`) y ese tramo es la referencia de estilo para VoxCPM2 y CosyVoice 3.
5. «Qwen3-TTS, VoxCPM2 y CosyVoice 3. Quiero escuchar a estos» → `ELIGE.mp3` con solo esas tres pistas.

## Archivos

`harness.py` (pasaje congelado del guion v3 bloqueado —el v4 `3773a95` cambia «Vamos más despacio» por «Vamos por
partes»—, retoma por WER, pausas, medidas, `postprocess`, `build_mp3`), `run_qwen.py`, `run_voxcpm.py`,
`run_cosyvoice.py`, `run_chatterbox.py`, `build_outputs.py`, `logs/*.json` (por pieza: semilla, tomas, WER, lo que oyó
Whisper, duración, RTF) y `logs/post_*.json` (aceleración por pista). Pesos y venvs fuera de git en
`/tmp/claude-0/engines/`, borrados al terminar cada motor (salvo lo que se indica).
