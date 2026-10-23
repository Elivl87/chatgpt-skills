# Scout de voces en español, naturales y gratis · octubre 2026

Pedido del Productor (2026-10-23): «Busca voces en español naturales, gratis. Busca algo en todos lados».
Esto es **solo investigación** (otro agente usa la CPU): nada instalado, nada renderizado. Fecha de corte: 2026-10-23.

Contexto: hoy el narrador es **Chatterbox Multilingual V3** clonando la voz del Productor (`chatterbox_natural/NOTES.md`);
antes fue **Kokoro-82M** (`VOICE_TESTS.md`, `chatterbox_ab/VOICE_AB.md`). Veredicto del Productor: Kokoro = plano;
Chatterbox = «robótico, sin emoción». Buscamos algo con **más vida** (emoción, prosodia) que siga siendo gratis, de
licencia permisiva (MIT / Apache / BSD / CC0 / CC-BY) y que corra en nuestra CPU.

Dónde busqué: Hugging Face (modelos y Spaces), GitHub, arXiv, Reddit (vía buscador), los leaderboards de Artificial
Analysis (Provider Voice, Open Weights, Controlled Voice) y el Open TTS Leaderboard de Hugging Face (30-sep-2026), blogs
comparativos de 2026, y las páginas oficiales de precios de los servicios de pago. Cada licencia se leyó en la **tarjeta
del modelo o el archivo LICENSE**, no en blogs; donde no pude abrir la fuente primaria lo digo.

---

## 0. Resumen ejecutivo

| | Motor | Por qué |
|---|---|---|
| **Mejor apuesta** | **Qwen3-TTS 1.7B** (Alibaba Qwen, ene-2026, **Apache-2.0** código y pesos) | Es el único motor permisivo con **control de emoción y prosodia por instrucción en lenguaje natural** («léelo con asombro, pausado») y **diseño de voz por texto** (una voz nuestra, sin clonar a nadie). Español oficial (10 idiomas). Hay motor C puro MIT que corre en CPU en int8 (0,6B más rápido que tiempo real en 4 hilos; 1,7B ≈ 1,5-2,4× tiempo real). Es el modelo que los blogs de 2026 citan como «el más expresivo» de los abiertos. |
| **Suplente** | **VoxCPM2** (OpenBMB, 2026, **Apache-2.0**) | Diseño de voz por texto + guía de estilo («más rápido, tono alegre») + 48 kHz. En español mide WER 1,44 y similitud 83,1 (mejor que ElevenLabs y Qwen3-TTS en la tabla oficial). Pero pesa 2B y no hay cifras de CPU: riesgo de que sea muy lento. |
| **Control barato** | **Kyutai Pocket TTS** (100M, pesos **CC-BY-4.0**) | 6× más rápido que tiempo real en CPU, clonación permitida, español «no documentado» y con un bug de recorte en frases cortas. Útil para comparar, no para ganar. |
| **Lo que ya tenemos** | Chatterbox Multilingual V3 (+ paquete LatAm), MIT | Sigue siendo legal y decente; su problema es la expresividad y el 12× de CPU. Queda como referencia en la prueba. |

La prueba concreta está en la sección 6: **Qwen3-TTS 1.7B, VoxCPM2 y Fun-CosyVoice3-0.5B** sobre el mismo pasaje de 60 s.

---

## 1. Top-10 de lo que podemos usar legalmente hoy

Criterio de orden: naturalidad/emoción esperable en español × viabilidad en nuestra CPU × riesgo de licencia (todos los de
esta tabla son ✅ en licencia). «RTF» = segundos de cómputo por segundo de audio (menor es mejor; 1 = tiempo real).

| # | Motor (fabricante, fecha) | Licencia código / pesos (fuente) | Español / LatAm | Emoción y prosodia | Clonación | CPU | Problemas conocidos | Veredicto |
|---|---|---|---|---|---|---|---|---|
| 1 | **Qwen3-TTS 1.7B CustomVoice / VoiceDesign** (Qwen, 22-ene-2026) | GitHub «Apache-2.0 license»; tarjeta HF `License: apache-2.0` | 10 idiomas, español oficial. Un blog afirma que «por defecto suena latinoamericano, se controla con el prompt» (sin fuente; a verificar) | **Instrucciones en texto** para timbre, emoción y prosodia (solo 1,7B); 9 voces de fábrica (Vivian, Serena, Ryan, Aiden…); **VoiceDesign**: describe la voz y la crea | Sí (modelo Base, 3 s de referencia) → solo con la voz del Productor | Motor C MIT `gabriele-mastrapasqua/qwen3-tts`: M1 4 hilos, 0,6B int8 RTF 0,69; 1,7B int8 RTF 1,79; ~3 GB / ~8 GB RAM. En 4 vCPU x86, 0,6B int8 RTF ≈ 3 | Pensado para GPU (ejemplos `cuda:0`); emoción «beta», etiquetas `[laugh]` «alfa»; sin datos de alucinación en español | ✅ **probar primero** |
| 2 | **VoxCPM2** (OpenBMB, 2026) | Tarjeta HF: «Released under the Apache-2.0 license, free for commercial use» | 30 idiomas incl. español; tabla oficial español: WER 1,44 / SIM 83,1 (Minimax 1,03 / 76,2; ElevenLabs 1,08 / 61,5; Qwen3-TTS 1,13 / 81,4) | **Diseño de voz** por descripción entre paréntesis; guía de estilo en la clonación («(slightly faster, cheerful tone)») | Sí (básica y «Ultimate» con transcripción) | Sin cifras. Existen VoxCPM.cpp, VoxCPM-ONNX y GGUF para llama.cpp-omni (RTF 1,76 Q8 en M4 Pro/Metal). Requisito oficial: CUDA ≥ 12, ~8 GB VRAM | «Los resultados de diseño/estilo varían entre corridas: generar 1-3 veces»; «entradas muy largas o muy expresivas pueden ser inestables» | ✅ probar |
| 3 | **Fun-CosyVoice3-0.5B-2512** (Alibaba FunAudioLLM, dic-2025) | GitHub Apache-2.0; tarjeta HF `License: apache-2.0` | 9 idiomas incl. español | **Instruct**: emoción, dialecto, velocidad, volumen | Sí, zero-shot | 0,5B (LLM + flow-matching); sin cifras oficiales de CPU; sin ONNX | Tarjeta: «for academic purposes only» (es un *disclaimer*, no la licencia); español sin evaluación publicada | ✅ probar (el más liviano de los expresivos) |
| 4 | **Chatterbox Multilingual V3 + paquete LatAm** (Resemble AI, 2025-26) | MIT (tarjeta y LICENSE); marca de agua Perth MIT | 23 idiomas; finetune dedicado es-419/es-MX | `exaggeration`/`cfg`; sin etiquetas ni instrucciones (Turbo tiene `[laugh]` pero es solo inglés) | Sí | RTF ≈ 12 en 2 hilos (medido) | Alucina en frases cortas; «allá delante»; cola de ruido; **«robótico» al oído del Productor** | ✅ ya en uso; referencia de la prueba |
| 5 | **Kyutai Pocket TTS** (Kyutai, 13-ene-2026) | Pesos `License: cc-by-4.0` (tarjeta HF, con puerta de acceso); código no indica | Tarjeta: «english, french, german, portuguese, italian, spanish»; el español vive en una rama `add_lang_not_documented` | Ninguno (copia la prosodia de la referencia) | Sí, con WAV propio | **~6× más rápido que tiempo real** en 2 núcleos (M4); RTF 2,3-2,5 (es decir 0,4×) en 4 vCPU x86 | Issue #174: en español recorta la primera palabra de frases cortas y «garbles» textos largos; no admite pausas | ⚠️/✅ control barato; CC-BY exige crédito |
| 6 | **MOSS-TTS v1.5 / Local-Transformer 1.7B / Nano 0,1B** (OpenMOSS, feb-jun 2026) | GitHub: «Models in MOSS-TTS Family are licensed under the Apache License 2.0» | v1.5 y Local-Transformer-v1.5: 31 idiomas incl. `es`; Nano: «multilingüe» sin lista (tarjeta cerrada, 401) | Pausas `[pause 3.2s]`, duración; **MOSS-VoiceGenerator** (1,7B) diseña voces por texto; sin control de emoción explícito | Sí | Nano «tiempo real con 4 núcleos»; `cpu-only.yaml` para llama.cpp; 8B cabe en 8 GB GPU | Modelos grandes (4B/8B) fuera de alcance en CPU; español de Nano sin confirmar | ⚠️ segunda ronda |
| 7 | **Orpheus 3B es_it** (`canopylabs/3b-es_it-ft-research_release`, 9-abr-2025) | Tarjeta HF `apache-2.0` (gated) | Español + italiano; voces **javi, sergio, maria** | Etiquetas en español: groan, chuckle, gasp, resoplido, laugh, yawn, cough | Zero-shot limitado | 3B (Llama-3.2) + SNAC; GGUF para llama.cpp existe para el base; sin cifras en CPU | «Beta release»; voces y calidad en español sin evaluación pública | ⚠️ pesado; solo si 1-3 fallan |
| 8 | **Kokoro-82M v1.0** (hexgrad, ene-2025; sin versión nueva en 2026) | Apache-2.0 | `ef_dora`, `em_alex`, `em_santa` (sin grado); G2P `es-419` nuestro | Solo velocidad/tono; mezclas de tensores | No | RTF ≈ 0,9 en 2 hilos | **Plano** (Productor); 7-8 en Arena (Elo 1065, el mejor open-weights de CPU) | ✅ baseline, no sube la calidad |
| 9 | **Piper** voces es (rhasspy, MIT motor) | Motor MIT; **es_MX-claude-high: `License: apache-2.0`**; es_AR-daniela-high: CC BY-SA 4.0 (OpenSLR 61, Google); es_ES-sharvard-medium: CC-BY-3.0; es_ES-davefx-medium, es_ES-carlfm, es_MX-ald: ver tarjeta | 9 voces: es_AR (daniela), es_ES (carlfm, davefx, mls×2, sharvard), es_MX (ald, claude) | Ninguno | No | Muy rápido (< 0,1×) | Robótico; 22 kHz | ✅ legal, pero retrocede en naturalidad |
| 10 | **MeloTTS-Spanish** (MyShell, MIT) y **OpenVoice v2** (MIT, basado en Melo) | MIT | 1 voz española (acento España) | Melo: ninguno; OpenVoice: 6 estilos | OpenVoice: «tone color» | Tiempo real en CPU | Plana; Arena Elo 956 (OpenVoice v2) | ✅ legal, no sube la calidad |

Otros permisivos que no entran al top: **LEMAS-TTS** (CC-BY-4.0 modelo y código; 10 idiomas con español; flow-matching sobre
F5-TTS; sin métricas publicadas; sin ONNX) → ⚠️ probar si sobra tiempo. **Ming-3.0-tts-tiny** (Ant Group, MIT, español,
emoción + instrucción + diseño de voz) pero **7,9B MoE / 9B en disco** y «recomendamos H800» → ⚠️ fuera de CPU.
**Magpie-Multilingual 357M** (NVIDIA, jul-2026, «ready for commercial use» bajo NVIDIA Open Model License; español
CER 0,60 %; GGUF + NeMo-Speech.cpp) → ⚠️ licencia propia, no está en nuestra lista de permisivas; sin clonación; 5 voces inglesas.

---

## 2. Capas gratis de los servicios de pago (voz comercial, ¿sirve para YouTube?)

Leído en las páginas oficiales de precios/términos salvo donde se indica. «Tarjeta» = si hace falta una tarjeta para abrir la cuenta.

| Servicio | Qué es gratis | ¿Uso comercial / YouTube en la capa gratis? | Atribución | Tarjeta | Español LatAm | Veredicto |
|---|---|---|---|---|---|---|
| **Google Cloud Text-to-Speech** | Al mes, recurrente: **Chirp 3 HD 1 M caracteres**, Neural2 1 M, WaveNet 4 M, Standard 4 M (después Chirp 3 HD $30/M). Gemini-TTS e Instant custom voice: sin capa gratis | Sí: los términos de GCP no distinguen uso comercial | No | **Sí** (cuenta de facturación obligatoria) | Chirp 3 HD: **es-ES y es-US** (30 voces, p. ej. Aoede, Puck, Charon, Kore…), **no es-MX**; `speaking_rate`, `[pause]`, IPA; sin control de emoción | ⚠️ 1 M chars/mes ≈ 1,5-2 h de voz, calidad alta; choca con «0 tarjetas» |
| **Gemini API (AI Studio)** TTS: 3.8 Flash TTS, 3.8 Flash-Lite TTS, 3.1 Flash TTS Preview, 2.5 Flash TTS | **«Free of charge»** (2.5 Pro TTS no) | Términos: para «professional or business purposes, not for consumer use»; Google «won't claim ownership» de lo generado. **Ojo:** en la capa gratis «Google uses the content you submit… and any generated responses to provide, improve, and develop» sus productos (revisores humanos) | No | **No** (capa gratis = «Active project or free trial») | 24 idiomas, español sí; **control de estilo por prompt** («di esto con asombro») | ⚠️ la opción comercial gratis **más expresiva y sin tarjeta**; límites diarios bajos (ver en AI Studio) y nuestro guion se usa para entrenar |
| **Azure AI Speech (F0)** | **0,5 M caracteres neurales/mes**, 3000 por archivo; sin HD ni voz custom | Microsoft Q&A (moderador): el uso comercial es «provided you are using a valid standard (paid) pricing tier»; F0 «intended for testing, development» | No | **Sí** (cuenta Azure) | Muchas voces es-MX (Dalia, Jorge…), estilos SSML en algunas | ❌ gratis no es para publicar |
| **Amazon Polly** | **Solo 12 meses**: Neural 1 M/mes, Generative 100 k/mes, Long-form 500 k/mes, Standard 5 M/mes | Sí (términos AWS) | No | **Sí** | **es-MX Mia y Andrés** (neural + generative), es-US Lupe/Pedro | ⚠️ bueno 1 año; tarjeta |
| **ElevenLabs Free** | 10 000 créditos/mes (~10 min) | **No**: «Commercial License» aparece solo desde Starter ($6/mes, hoy $1 el primer mes) | Sí en free (según su centro de ayuda, hoy devolvió 403) | No | Sí, v3 con etiquetas de emoción | ❌ |
| **Cartesia Free** | 20 k créditos/mes | **No** (licencia comercial = Pro $5/mes); sin clonación | — | No | Sí | ❌ |
| **Fish Audio Free** | ~8 000 créditos/mes | **No**: términos = «personal, non-commercial» (página de precios no abrió; coincide con 3 fuentes) | — | No | Sí | ❌ |
| **Inworld TTS On-Demand** | «Up to 70 min TTS included», $0 | **Sí**: el plan On-Demand «includes a commercial license» (página de precios) | No | Solo para clon profesional | «200+ languages» | ✅ **la única capa gratis con licencia comercial explícita**; 70 min es ~8 episodios |
| **Hume Octave** | Sin capa gratis visible en hume.ai/pricing | — | — | — | 50+ idiomas | ❌ no verificable |
| **MiniMax Speech** | Sin capa gratis permanente documentada | — | — | — | Sí | ❌ |
| **OpenAI TTS** | Sin capa gratis (pay-as-you-go; $0,6/M tokens texto + $12/M tokens audio ≈ $0,015/min) | — | — | Sí | Sí | ❌ |
| **Murf / Play.ht / Speechify / Resemble** | Pruebas sin descarga o sin derechos | **No** en free | — | — | — | ❌ |
| **edge-tts** (voces de Edge «Read aloud», no oficial) | Ilimitado | **Riesgo**: Microsoft Q&A: «Commercial use without a valid Azure subscription could be a violation of our terms of service»; bloqueos por abuso | — | No | es-MX Dalia/Jorge | ❌ regla del canal: nada en zona gris |

Lectura: si el Productor acepta **una** excepción a «sin tarjeta», Google Chirp 3 HD (1 M chars/mes para siempre) o Polly
es-MX (12 meses) son voces comerciales muy pulidas gratis. **Sin tarjeta y legal**: Inworld (70 min) y Gemini TTS (gratis
pero nuestro texto entrena a Google). Ninguna de estas es «nuestra»: dependen de un tercero, y el canal prefiere motor local.

---

## 3. Tentadores pero bloqueados (y por qué)

| Motor | Lo que tienta | Por qué no |
|---|---|---|
| **Voxtral TTS** (Mistral, 26-mar-2026, 4B) | 9 idiomas con español; «68,4 % de preferencia frente a ElevenLabs»; Elo 1091 (5.º open-weights) | mistral.ai: «open weights on Hugging Face under **CC BY NC 4.0**» → NC bloqueado (API de pago $0,016/1k chars) |
| **Fish Audio S2 Pro / OpenAudio S1-mini** | S2 Pro: Elo 1112 (4.º), 80+ idiomas, español «Tier 2», 15 000+ etiquetas de emoción | S2 Pro: «Fish Audio Research License… any Commercial use… requires a separate license»; S1-mini: **CC-BY-NC-SA-4.0** |
| **Higgs TTS 3 4B** (Boson AI, jun-2026) | Español «production-quality» (🇪🇸🇲🇽), 21 emociones + estilos + prosodia por etiquetas `<\|emotion:awe\|>`; Elo 1044 | «Boson Higgs TTS 3 Research and Non-Commercial License». Tiene un **Creator Use Grant**: «publishing and monetizing that content on channels You own or control» si se acredita «Boson AI's Higgs Audio» en el audio o en el texto. **No es una licencia de nuestra lista** (MIT/Apache/BSD/CC0/CC-BY): decide el Productor. Además 4-5B, GPU |
| **Higgs Audio v2** (2025) | Muy expresivo | Pesos «Research and Non-Commercial» |
| **OmniVoice** (k2-fsa, abr-2026, 0,6B, 600+ idiomas) | Líder multilingüe del Open TTS Leaderboard; diseño de voz por atributos | «The pre-trained model is licensed under the **CC-BY-NC** due to… Emilia» |
| **F5-Spanish** (jpgallegoar) y F5-TTS base | Finetune español de 218 h | **CC-BY-NC-4.0** (datos Emilia) |
| **LLaSA / Llasa**, **MaskGCT**, **Spark-TTS** | Clonación expresiva | CC-BY-NC(-SA); además LLaSA/Spark son zh/en |
| **XTTS v2** (Coqui) | 17 idiomas, estilo por referencia | Coqui Public Model License = no comercial, y ya no existe quien venda licencia |
| **MMS-TTS spa** (Meta) | Liviano | CC-BY-NC-4.0 |
| **Breeze TTS 2** (Elo 1225, 2.º) | Calidad | Pesos «Research and Non-Commercial»; en/zh |
| **Supertonic 3** (Supertone, 99M, 31 idiomas, CPU muy rápido, `<laugh>`, `<sigh>`) | CPU ideal | Pesos **BigScience Open RAIL-M**: no prohíbe comercial pero impone restricciones de uso (p. ej. (e) no publicar contenido sintético sin declararlo; nosotros ya lo declaramos). **No está en la lista de permisivas**; solo voces preset; constructor de voces de pago; repo «se archivará». ⚠️ si el Productor amplía la lista |
| **IndexTTS-2.5** (Bilibili, 2026, español, vectores de emoción + texto) | Control de emoción separado del timbre | «bilibili Model Use License Agreement»: libre bajo 100 M MAU / RMB 1 000 M, pero prohíbe usarlo «to improve any AI model», ley de la RPC, arbitraje en Shanghái. **Licencia propia, no permisiva** → ⚠️/❌ |
| **NeuTTS Nano Spanish** (Neuphonic, 0,2B, CPU) | Español dedicado, clona en 3 s, CPU | Tarjeta `License: other` tras puerta de acceso; «NeuTTS Open License 1.0» no pude leerla → ❌ hasta leerla (NeuTTS **Air** sí es Apache-2.0, pero inglés) |
| Voces de Kyutai **Expresso** y **EARS** | Muy expresivas | CC-BY-NC-4.0 (las `voice-donations` y `voice-zero` son **CC0**, VCTK CC-BY-4.0) |
| **Chatterbox Turbo / Nano**, **Dia2**, **Sesame CSM-1B**, **Maya1**, **Kani TTS 2**, **VibeVoice**, **Zonos**, **StyleTTS2**, **Parler**, **Soprano/Muyan/KittenTTS**, **Step-Audio-EditX** | Permisivos (MIT/Apache) y expresivos | **Sin español** (Turbo/Dia2/CSM/Maya1/Kani/StyleTTS2/Parler/Soprano/Muyan/Kitten: inglés; VibeVoice y Step-Audio: zh/en; Zonos: en/ja/zh/fr/de). Chatterbox Nano (110M, CPU) está gated: licencia sin confirmar |
| **Bark** (Suno, MIT) | Español, risas | Calidad baja, alucina, «déficits en emociones» (EmergentTTS-Eval); GPU |

Nota sobre leaderboards: Artificial Analysis lanzó Arenas por idioma (incluye español) pero **aún no publica la tabla
española**; su Open-Weights Arena (inglés) va: Fish Drama 3 1248, Breeze 2 1225, Ming-3.0 1190, Fish S2 Pro 1112, Step
EditX 1099, Voxtral 1091, **Kokoro 1065**, Magpie 1063, Maya1 1047, S1-mini 1044, Higgs V3 1044, **Chatterbox 1024**,
Zonos 1000. De los permisivos con español solo aparecen Kokoro, Chatterbox y Ming (que no corre en CPU); Qwen3-TTS y VoxCPM2
no están en la arena. El Open TTS Leaderboard (objetivo: WER/SIM/velocidad) destaca a OmniVoice, S2 Pro y Fun-CosyVoice3
en multilingüe, a Higgs-TTS-3 y VoxCPM2 en clonación y a Pocket TTS en CPU. Qwen-Audio-3.x-TTS-Plus (1.º y 3.º del
Controlled Voice) es la **API cerrada** de Alibaba, no Qwen3-TTS abierto.

---

## 4. Voces y datos comunitarios en español, libres para uso comercial

Sirven como voz de referencia (prompt) para clonadores o para afinar un modelo, sin clonar a una persona identificable
como «voz del canal»:

| Recurso | Licencia (fuente) | Contenido | Uso para nosotros |
|---|---|---|---|
| **Mozilla Common Voice – español** (Scripted Speech 25.0, mar-2026) | **CC0-1.0** (datasheet oficial); prohíbe re-alojar y re-identificar hablantes | 2 275 h grabadas, 593 h validadas, 26 896 hablantes, muchos acentos LatAm | Datos de finetune; referencias cortas anónimas |
| **Google Crowdsourced LatAm Spanish** (OpenSLR 61 AR, 71 CL, 72 CO, 73 PE, 74 PR, 75 VE) | **CC BY-SA 4.0** (OpenSLR) | Alta calidad, varios hablantes por país; «Argentina 5 739 grabaciones» | Referencia LatAm limpia; **SA**: una voz entrenada sobre esto hereda BY-SA (como Piper es_AR-daniela) |
| **CML-TTS español** (OpenSLR 146) | **CC BY 4.0** | Audiolibros LibriVox (dominio público) | Datos; es la base del español de Magpie |
| **Piper voces es** | es_MX-claude-high **Apache-2.0**; es_AR-daniela-high CC BY-SA 4.0; es_ES-sharvard CC-BY-3.0 | Modelos listos | Voz robótica, pero legal |
| **Kokoro ef_dora / em_alex / em_santa** y nuestras mezclas | Apache-2.0 | Voz sintética **nuestra** | Ya la usamos como referencia (A/B de Chatterbox) |
| **Kyutai `voice-donations/`, `voice-zero/`** | **CC0** (tarjeta `kyutai/tts-voices`) | Embeddings de voces donadas | Referencia para Pocket TTS |
| **GianDiego/latam-spanish-speech-orpheus-tts-24khz** (HF) | CC BY-SA 4.0 | Google LatAm re-muestreado a 24 kHz para Orpheus | Finetune Orpheus LatAm |
| **Emilia** (y todo lo entrenado solo con Emilia) | CC-BY-NC | — | ❌ |

Regla intacta: referencia = voz del Productor (consentida) o voz sintética del canal. Nunca una tercera persona.

---

## 5. Fichas (lo esencial de cada candidato verificado)

- **Qwen3-TTS** (`QwenLM/Qwen3-TTS`, HF `Qwen/Qwen3-TTS-12Hz-1.7B-{CustomVoice,VoiceDesign,Base}` y 0,6B; informe arXiv 2601.15621). Licencia Apache-2.0 en GitHub y en las tarjetas. 10 idiomas. CustomVoice: 9 timbres + instrucción; VoiceDesign: voz desde descripción; Base: clon 3 s. Streaming 97 ms. GPU en los ejemplos. Motor C MIT (`gabriele-mastrapasqua/qwen3-tts`): CPU por defecto, int8 recomendado, `-l Spanish`, emociones por `--emotion`/`--instruct` (1,7B). Un comparativo de CPU (ocdevel, jul-2026) lo elige sobre otros 5 runtimes y califica el audio int8 de «increíble» frente a Kokoro «terrible» (juicio de un solo autor).
- **VoxCPM2** (`openbmb/VoxCPM2`, Apache-2.0, 2B, 48 kHz, 30 idiomas, informe arXiv 2606.06928). Diseño de voz y estilo en texto; clonación; LoRA con 5-10 min. RTF 0,30 en RTX 4090. CPU: proyectos VoxCPM.cpp / ONNX / GGUF sin cifras.
- **Fun-CosyVoice3-0.5B-2512** (`FunAudioLLM`, Apache-2.0). 9 idiomas, instruct (emoción, dialecto, velocidad), clonación, streaming 150 ms. Sin cifras CPU.
- **Kyutai Pocket TTS** (`kyutai/pocket-tts`, 100M, pesos CC-BY-4.0, gated). CPU 2 núcleos ≈ 6× tiempo real; clonación con WAV propio; «prohibited: voice impersonation or cloning without explicit and lawful consent»; español no documentado y con fallos (issue #174); no inserta pausas.
- **MOSS-TTS** (`OpenMOSS/MOSS-TTS`, Apache-2.0). Familia 0,1B-8B; v1.5 con 31 idiomas incl. español; Nano CPU 4 núcleos; VoiceGenerator diseña voces. Sin control de emoción explícito.
- **Orpheus es_it** (`canopylabs/3b-es_it-ft-research_release`, Apache-2.0, gated, «beta»). Voces javi/sergio/maria; etiquetas en español (groan, chuckle, gasp, resoplido, laugh, yawn, cough). 3B.
- **Chatterbox** (`ResembleAI/chatterbox`, `Chatterbox-Multilingual-es-mx-latam`, `Chatterbox-Multilingual-es-es`, MIT). V3 «reduce alucinaciones»; LatAm = finetune del paso 138 500. Turbo (350M, `[laugh]`) y Nano (110M, CPU) son solo inglés / gated.
- **Kokoro-82M**: ninguna versión nueva (org hexgrad: Kokoro-82M abr-2025, v1.1-zh, kLegacy, styletts2).
- **Higgs TTS 3**: ver sección 3; licencia leída en `bosonai/higgs-tts-3-4b/LICENSE` (Creator Use Grant II-A).
- **Voxtral TTS**: licencia leída en mistral.ai/news/voxtral-tts («CC BY NC 4.0»).
- **IndexTTS-2.5**, **Supertonic 3**, **Magpie**: licencias leídas en sus LICENSE/tarjetas (sección 3 y 1).

---

## 6. Plan de prueba concreto (siguiente paso, cuando la CPU quede libre)

**Pasaje**: el mismo de `chatterbox_natural/NOTES.md` (beats 1-4 del gancho + beat 9, 125 palabras ≈ 60 s), palabra por
palabra del guion bloqueado. **Referencia de voz**: (a) voz del Productor `voice/producer/producer_reference_clean.flac`
(solo en motores con clonación) y (b) una **voz diseñada por texto** («narrador latinoamericano, 35-45 años, cálido,
curioso, ritmo tranquilo, sonríe al hablar»), que sería una voz 100 % del canal. **Medidas**: las de siempre (`qc.py`:
WER Whisper small, seseo, similitud Resemblyzer, ppm, −16 LUFS) + MP3 con pitidos para el oído del Productor.
Entornos: venvs desechables en `/tmp/claude-0/`, `python -I`, `nice -n 10`, 2 hilos, pesos fuera de git, borrar al terminar.

| Motor | Qué se renderiza | Disco | CPU estimada (2 hilos) para 60 s |
|---|---|---|---|
| **A · Qwen3-TTS 1.7B CustomVoice + VoiceDesign** (motor C, int8) | 3 variantes: voz preset Ryan neutra; misma voz con `--instruct` «cálido y asombrado, pausado»; voz diseñada (b). Más el **0,6B** como variante rápida. Y **Base 1.7B** con la voz del Productor (a) | 1,7B ≈ 3,5 GB + 0,6B ≈ 1,3 GB + Base ≈ 3,5 GB (+1,4 GB de activos de emoción, opcional) ≈ **8-10 GB** | 1,7B int8: RTF ~2-4 en 2 hilos → **2-4 min** por variante; 0,6B: ~1-1,5 min. Total ≈ 15-20 min + compilación (OpenBLAS) |
| **B · VoxCPM2** (GGUF Q8 vía llama.cpp-omni o ONNX; si no, PyTorch CPU) | voz diseñada (b) con estilo «(tono cálido, ritmo pausado)»; clon (a) | ~2,5 GB (Q8) o ~4 GB (bf16) | Desconocido; estimo RTF 5-10 → **5-10 min** por variante. Si pasa de 15 min, se aborta |
| **C · Fun-CosyVoice3-0.5B** (PyTorch CPU) | clon (a) + instrucción «habla con calidez y curiosidad» | ~2 GB | Estimo RTF 3-6 → **3-6 min** por variante |
| Control · **Pocket TTS** y **Chatterbox V3** (ya instalado) | clon (a) | 0,5 GB / 0 (ya está) | 10-15 s / ~12 min |

Presupuesto total: **≈ 15 GB de disco temporales** y **≈ 45-60 min de CPU** a 2 hilos (más descargas ~15 GB). Si la
alucinación aparece, se aplica la misma retoma automática por WER que ya usamos. Lo que decide el ganador es **el oído del
Productor** sobre el MP3; las medidas solo descartan errores. Si gana Qwen3-TTS, el paso siguiente es el modo híbrido ya
previsto (una llamada por oración, pausas por puntuación) con `--instruct` por bloque emocional del guion.

Fuera del plan, para decisión del Productor: (1) ¿ampliar la lista de licencias a **OpenRAIL-M / Higgs Creator Grant /
Bilibili** (abriría Supertonic 3, Higgs TTS 3, IndexTTS-2.5)? Mi recomendación: **no** por ahora; Qwen3-TTS y VoxCPM2 cubren
el mismo terreno sin condiciones. (2) ¿aceptar una capa gratis de nube con tarjeta (Google Chirp 3 HD 1 M chars/mes)?
Recomiendo no: dependencia externa y sin control de emoción.

---

## Fuentes principales

Tarjetas y repositorios: huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign · github.com/QwenLM/Qwen3-TTS ·
github.com/gabriele-mastrapasqua/qwen3-tts · huggingface.co/openbmb/VoxCPM2 · github.com/OpenBMB/VoxCPM ·
huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512 · github.com/FunAudioLLM/CosyVoice · huggingface.co/kyutai/pocket-tts ·
huggingface.co/kyutai/tts-voices · github.com/kyutai-labs/pocket-tts/issues/174 · github.com/OpenMOSS/MOSS-TTS ·
huggingface.co/canopylabs/3b-es_it-ft-research_release · huggingface.co/ResembleAI/chatterbox ·
huggingface.co/ResembleAI/Chatterbox-Multilingual-es-mx-latam · huggingface.co/ResembleAI/chatterbox-turbo ·
huggingface.co/hexgrad · huggingface.co/rhasspy/piper-voices (voices.json y MODEL_CARD de es_MX/claude, es_AR/daniela,
es_ES/sharvard) · huggingface.co/bosonai/higgs-tts-3-4b (+ LICENSE) · mistral.ai/news/voxtral-tts ·
huggingface.co/fishaudio/s2-pro · huggingface.co/k2-fsa/OmniVoice · huggingface.co/IndexTeam/IndexTTS-2.5 (+ LICENSE) ·
huggingface.co/Supertone/supertonic-3 (+ LICENSE) · huggingface.co/nvidia/magpie_tts_multilingual_357m ·
huggingface.co/inclusionAI/Ming-3.0-tts-tiny · huggingface.co/neuphonic/neutts-air · huggingface.co/neuphonic/neutts-nano-spanish ·
huggingface.co/LEMAS-Project/LEMAS-TTS · huggingface.co/nari-labs/Dia2-2B · huggingface.co/SparkAudio/Spark-TTS-0.5B ·
huggingface.co/datasets/Pendrokar/open_tts_tracker.
Leaderboards: artificialanalysis.ai/text-to-speech/leaderboard (provider-voice, open-weights, controlled-voice) ·
huggingface.co/blog/open-tts-leaderboard (30-sep-2026) · ocdevel.com/blog/20260711-quantized-cpu-tts.
Precios y términos: cloud.google.com/text-to-speech/pricing · docs.cloud.google.com/text-to-speech/docs/chirp3-hd ·
ai.google.dev/gemini-api/docs/pricing · ai.google.dev/gemini-api/terms · azure.microsoft.com (Speech pricing) ·
learn.microsoft.com/answers (F0 y uso comercial; edge-tts) · aws.amazon.com/polly/pricing · docs.aws.amazon.com/polly
(available-voices) · elevenlabs.io/pricing · cartesia.ai/pricing · inworld.ai/pricing · hume.ai/pricing.
Datos: datacollective.mozillafoundation.org (Common Voice es 25.0) · openslr.org/61, 71-75, 146.
