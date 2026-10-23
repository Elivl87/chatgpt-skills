# Prueba de motores · Qwen3-TTS · VoxCPM2 · CosyVoice 3 (en curso, 2026-10-23)

**Estado:** PARCIAL. Qwen3-TTS variantes (a)-(d) renderizadas; (e) y los otros dos motores siguen en marcha
(`/tmp/claude-0/engines/out/`, cadena `qwen_chain2.sh`). Pasaje = el de `expressive/render_expressive.py`
(guion v3 bloqueado, 162 palabras, beats 1-4 + 9 + remate del 13), congelado en `harness.py`.

`qwen3tts.mp3` (48 kbps): 1 pitido = (a) voz preset Ryan, español, sin instrucción · 2 = (b) Ryan + instrucción por
oración (perfiles de NARRADOR.md) · 3 = (c) voz diseñada masculina (VoiceDesign) · 4 = (c) voz diseñada femenina.

Motor: `gabriele-mastrapasqua/qwen3-tts` (C, MIT, ef339be), bf16, 3 hilos, AVX-512/AMX. **int8 descartado**: en esta
máquina hablaba al doble de lento y alucinaba («hey hey hey») en las mismas semillas; bf16 RTF ≈ 3,8-4,8.
Pesos `Qwen/Qwen3-TTS-12Hz-1.7B-{CustomVoice,VoiceDesign,Base}`: tarjeta HF `License: apache-2.0`; GitHub LICENSE = Apache 2.0.

| Variante | WER | Retomas | ppm | RTF (tomas buenas / total) | Similitud Productor | Rango tono (st) | Melodía (st) | Energía σ (dB) | Seseo (mediana dB) |
|---|---|---|---|---|---|---|---|---|---|
| (a) Ryan | 0,6 % (1/162: «embotellamiento») | 22 | 89 | 4,2 / 9,1 | 0,705 | 15,8 | 4,8 | 8,6 | −3,8 → seseo |
| (b) Ryan + instruct | 0 % | 19 | 95 | 4,0 / 8,0 | 0,700 | 11,8 | 4,5 | 8,1 | −3,2 → seseo |
| (c) diseñada ♂ | 0 % | 13 | 116 | 4,6 / 7,8 | 0,748 | 18,6 | 5,3 | 7,3 | ≈ +2 → seseo |
| (c) diseñada ♀ | 0 % | 14 | 121 | 4,8 / 9,2 | 0,626 | 16,2 | 4,5 | 7,1 | ≈ +2 → seseo |

Control Chatterbox V3 (clon dirigido, mismo pasaje, `A_clone_directed`): WER 0 %, 23 retomas, 138 ppm, similitud 0,954.
Observación: Qwen3-TTS habla **lento** (89-121 ppm frente a 140-150 objetivo) y alucina ~20 % de las tomas (nombre
«Eli» → «Ailey/Él/Lee»; a veces frases en inglés), pero la retoma por WER lo cubre. Las voces diseñadas son las más rápidas y expresivas.
Pendiente: (d) clon Base del Productor, (e) clon + instrucción, VoxCPM2 (GGUF Q8, llama.cpp-omni MIT), Fun-CosyVoice3 (venv listo), `ELIGE.mp3`, ranking final.
