# Narrador expresivo · pruebas A / A2 / B · 2026-10-23

Veredicto del Productor sobre la narración actual (Chatterbox V3, su voz clonada, exageración 0,45 fija): *"muy robótica,
sin empatía, sin emoción; no mantendrá a nadie viendo"*. La animación está aprobada; cambia solo la voz. Persona objetivo:
`voice/NARRADOR.md` (el amigo curioso que ya sabe cómo termina la historia).

## Para escuchar

- **`samples_expresivos.mp3`** (4:27, 2,7 MB) · **1 pitido = A** (clon, dirigido por frase) · **2 = A2** (clon con
  referencia "más viva", recorte de 12 s) · **3 = B** (misma dirección, voz de fábrica del modelo, sin clonar). Los huecos
  largos del guion (pajarito 2 s, wordmark 5 s) están recortados a 1,5 s solo para escuchar.
- **`comparacion_dialogo.mp3`** (1:08, 0,8 MB) · beats 3-4, dos veces: **1 pitido = cuadros de texto mudos** (como el
  animatic rechazado) · **2 pitidos = el narrador lee las líneas de Eli y Mila** (pedido del Productor 2026-10-23).
- No hay **C**: ningún otro motor pasó licencia + español + disco (abajo). Qwen3-TTS / VoxCPM2 / CosyVoice3 van en una prueba aparte.

Pasaje (palabra por palabra del guion bloqueado): beats 1-4 completos (narración + «¡¿Quién fue?!», «Eli… va para atrás.»,
«¿Qué?»), beat 9 (con «No… no… ¡no!») y el remate del beat 13 («Ese conductor ya llegó a su casa… la razón ya se fue a cenar.»
+ «¿Ni un perdón?»). 162 palabras, 26 llamadas.

## Diagnóstico (confirmado con medidas)

1. **La referencia manda.** El clon copia la *forma de decir* de la toma: la del Productor está leída con calma y bajito
   (−32 LUFS, melodía por segundo 3,3 st). Con el mismo texto y la misma dirección, cambiar solo la referencia mueve las
   cifras: recorte más vivo de su misma toma (A2) → +1,3 st de rango tonal y +0,8 st de desviación frente a A; voz de fábrica
   (B) → el doble de rango (21 st). La exageración y la dirección ayudan, pero **la referencia es la palanca grande**.
2. **Exageración 0,45 fija** se eligió por estabilidad (0 retomas). Con 0,5-0,9 por frase la variedad sube y las retomas
   también (A: 23 retomas en 26 trozos, WER final 0 %).
3. **Un solo ajuste para todo** hace que cada frase suene igual: la toma rechazada tiene 16 pausas casi idénticas
   (desv. 0,11 s); la dirigida, 39 pausas con desviación 0,83 s (remates con silencio antes, cadenas sin aire).

## Dirección por frase (`direction.py`)

Cada frase es una llamada con su **perfil**: exageración / cfg / temperatura de Chatterbox + velocidad (atempo) + pausa antes
+ escala de la pausa después + ganancia. El perfil sale de las notas del guion, la puntuación y la persona de `NARRADOR.md`:

| Perfil | exag. | cfg | temp. | vel. | pausa antes | Dónde (NARRADOR.md) |
|---|---|---|---|---|---|---|
| calm | 0,50 | 0,50 | 0,70 | 0,95 | — | explicación nítida ("Vamos más despacio.") |
| curious | 0,60 | 0,40 | 0,80 | 0,98 | — | curiosidad en voz alta (por defecto) |
| warm | 0,60 | 0,45 | 0,75 | 0,95 | — | cariño por Eli y Mila ("Eli está seguro…") |
| building | 0,70 | 0,35 | 0,80 | 1,00 | — | la ola crece (pausas cortas, 0,85×) |
| surprised | 0,80 | 0,30 | 0,85 | 1,00 | 0,1 s | asombro real ("Pero allá no hay nada.") |
| urgent | 0,85 | 0,30 | 0,80 | 1,03 | — | "Más fuerte. Más fuerte…" |
| deadpan | 0,55 | 0,50 | 0,70 | 0,92 | 0,45 s | chistes secos: la pausa hace la gracia ("…la razón ya se fue a cenar.") |
| question | 0,65 | 0,40 | 0,80 | 0,95 | 0,15 s | la pregunta del gancho, hecha de verdad |
| intimate | 0,55 | 0,50 | 0,70 | 0,92 | 0,2 s, −1 dB | confidencia ("Apenas un poquito.", final) |
| eli | 0,90 | 0,30 | 0,85 | 1,03 | respiro 0,3 s antes y después, +2,5 dB | cita de Eli: más rápido e impaciente |
| eli_hurt | 0,75 | 0,40 | 0,80 | 0,93 | respiro, +1 dB | Eli dolido / seco («¿Qué?», «¿Ni un perdón?») |
| mila | 0,45 | 0,55 | 0,70 | 0,92 | respiro, −2 dB | cita de Mila: serena, más suave |

Reglas extra: frases con **números** → pausa previa ≥ 0,6 s y velocidad ≤ 0,95 (NARRADOR.md); pausas por puntuación
(. 0,42 s · ? 0,55 · ! 0,45 · … 0,6 · : 0,38) escaladas por perfil; las frases de < 3 palabras se pegan a la siguiente
("Más fuerte. Más fuerte… hasta que alguien se queda quieto: Eli." es una sola llamada: el modelo alucina con entradas
diminutas); las líneas de personaje nunca se partan. Mapa por beat (`BEAT_DEFAULT`) + anulaciones por frase (`OVERRIDES`,
todos los remates del episodio) + heurística por puntuación para el resto. Regla de retoma: Whisper WER = 0, hasta **10**
semillas (antes 6), se queda la mejor.

## Medidas (mismo pasaje; la toma rechazada son los trozos reales de `ep/001/audio/chatterbox/segments/`)

| Toma | Dur. | Rango tonal p5-p95 (st) | Desv. tono (st) | Melodía por segundo (st) | Desv. energía (dB) | Pausas n / media / desv. (s) | Ritmo (ppm, en voz) | WER | Retomas | Similitud con el Productor |
|---|---|---|---|---|---|---|---|---|---|---|
| **rechazada** (ep001, exag. 0,45 fija, sin líneas de personaje) | 84,0 s | 10,3 | 3,18 | 2,42 | 7,55 | 16 / 0,35 / **0,11** | 158 | 0 % | 4 | 0,947 |
| **A** · clon, dirigido por frase | 96,6 s | 11,1 | 3,82 | 2,98 | **8,59** | 39 / 0,78 / 0,83 | 138 | 0 % | 23 | **0,954** |
| **A2** · clon, referencia viva (12 s) | 95,6 s | 12,4 | 4,64 | 3,11 | 8,25 | 42 / 0,76 / 0,81 | 140 | 0 % | 16 | 0,941 |
| **B** · voz de fábrica, dirigida | 79,0 s | **21,0** | **7,04** | **5,37** | 7,38 | 32 / 0,91 / 0,88 | **184** (atropellada) | 0 % | 19 | 0,718 (otra voz) |

Lectura: la dirección sola (A) sube la variedad de pausas y energía y algo el tono (+0,6 st de desviación) sin perder
identidad (similitud 0,954, la más alta). La referencia viva (A2) suma +0,8 st de desviación tonal y necesitó menos retomas
(16), a costa de 0,013 de similitud. B demuestra que el modelo *puede* dar el doble de melodía: la planicie viene de la
referencia, no de Chatterbox. Ritmos: A/A2 140 ppm (NARRADOR.md pide 140-150 en la explicación; el gancho va más rápido
por perfil). Los perfiles caros en retomas: `urgent` (5 tomas por trozo), `mila` (9 en A: Whisper oye "Eli" de mil formas),
`question` en A2 (8). Todo con WER 0 % final. Al oído no puedo juzgar: todo esto son medidas.

Referencia A2: `producer_reference_clean.flac` de 4,9 s a 16,9 s, el tramo de 12 s donde su tono se mueve más (rango 9,7 st,
desviación 3,5 st; la toma entera: 10,9 / 3,6; medido con pyin). Es un recorte de su propia grabación, nada ajeno.

## Diálogo: cuadros mudos vs narrador que cita (`comparacion_dialogo.mp3`)

Con las líneas habladas, el tramo de los beats 3-4 pasa de 30,4 s a 33,7 s: los huecos crecen («¡¿Quién fue?!» 0,71 → 1,84 s
con respiros; «Eli… va para atrás.» 1,93 → 3,01 s; «¿Qué?» 0,50 → 1,60 s). Las ranuras se exportan con `voiced: true` y
`speaker` conservado (`logs/*_segments.json`), y `build_voice_cb.py --voice-characters` hace lo mismo para el episodio
completo (timings con `slot` para los cuadros).

## Licencias revisadas para una variante C (ninguna instalada; registradas en `LICENSES.md`)

| Motor | Código / pesos | Español | Veredicto |
|---|---|---|---|
| CosyVoice 3 (`Fun-CosyVoice3-0.5B-2512`) | Apache-2.0 / Apache-2.0 | ✔ (9 idiomas, instrucciones de emoción) | pesos mínimos ≈ 5,4 GB (llm 2,0 + flow 1,3 + tokenizer 1,0 + LLM de texto 1,0) + otro venv → supera la regla de 3 GB con 4,3 GB libres. **No instalado**; queda para la prueba aparte |
| Higgs Audio v2 (Boson) | Apache-2.0 / **"Boson Higgs Audio 2 Community License"** (términos Llama 3: aviso de atribución, cláusula de 100 k usuarios) | 4 idiomas, sin confirmar | **bloqueado** por licencia (y 6B parámetros) |
| Orpheus es/it (`canopylabs/3b-es_it-ft-research_release`) | Apache-2.0 | ✔ | 3B en F32 (~12 GB), con puerta de acceso, beta → **demasiado grande** |
| Zonos v0.1 | Apache-2.0 | ✘ (en/ja/zh/fr/de) | **no** |
| IndexTTS-2 | pesos sin licencia permisiva clara | ✘ (en/zh) | **bloqueado** |
| Fish / OpenAudio S1 | CC-BY-NC-SA | — | **bloqueado** |
| XTTS v2 | Coqui CPML (no comercial) | — | **bloqueado** |
| F5-TTS | MIT / pesos CC-BY-NC | — | **bloqueado** |

## Recomendación

1. **Grabar la nueva referencia** (`BRIEF_GRABACION.md`: 60-90 s contados con ganas + 3 clips de ánimo de 15 s). Es la
   palanca que más mueve las cifras y la única que da "empatía" de verdad; la dirección por frase ya está lista para
   aprovecharla (y permite elegir referencia por tramo: entusiasmado en el gancho, tranquilo en la explicación).
2. Mientras llega: **A2 + dirección** es la mejor versión posible con la toma actual (más melodía, menos retomas,
   similitud 0,941 todavía alta). Si el Productor prefiere máxima fidelidad, A.
3. **El narrador cita a Eli y Mila** (2 pitidos de `comparacion_dialogo.mp3`): `--voice-characters`.
4. Rehacer el episodio: `build_voice_cb.py all both --direction --voice-characters` con `CB_VOICE` apuntando a la
   referencia elegida (~2,5-3 h de CPU: más llamadas y hasta 10 tomas). Probado en seco (plan, perfiles, flags); el
   render completo queda para cuando el Productor escoja.

## Archivos

`direction.py` (perfiles + mapa), `render_expressive.py` (pasaje con dirección, 10 tomas), `measure.py` (rango tonal,
energía, pausas, similitud), `summarize.py` (tabla), `assemble_variant.py`, `dialog_comparison.py`, `logs/*.json`
(cada trozo: perfil, ajustes, semilla, WER, tomas, lo que oyó Whisper; `*_segments.json`: ranuras). Pesos y wavs
intermedios fuera de git (`/tmp/claude-0/cbnat/expr`). Whisper small se volvió a bajar (su caché había desaparecido).

```bash
TQDM_DISABLE=1 OMP_NUM_THREADS=2 CB_OUT=/tmp/claude-0/cbnat/expr/out nice -n 10 /tmp/claude-0/cbnat/venv/bin/python -I \
  newchannel/voice/expressive/render_expressive.py A_clone_directed --ref newchannel/voice/producer/producer_reference_clean.flac --tries 10
```
