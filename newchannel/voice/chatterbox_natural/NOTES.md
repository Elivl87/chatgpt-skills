# Narrador con Chatterbox, más natural · notas · 2026-10-16

Decisión del Productor (2026-10-16): narrador con **Chatterbox, más natural** (reemplaza a Kokoro). **Eli y Mila no
tienen voz**: sus líneas van solo en cuadros de texto. Aquí solo se sintetiza la narración. Después el Productor
mandó **su propia voz** para clonarla como narrador (único caso permitido: es su voz y dio su consentimiento).

Pasaje de prueba (el mismo en todas las versiones, palabra por palabra del guion bloqueado): narración de los
beats 1-4 del gancho + beat 9 ("Vamos más despacio… Para el auto número diez: alto total."). 125 palabras.

## Para escuchar

- **`clone_vs_best.mp3`** (1:58, 1,4 MB): **1 pitido = A, la voz clonada del Productor** · **2 pitidos = B, la
  mejor versión sin clonar** (Chatterbox con la voz sintética del canal como referencia).
- `samples_narrador.mp3`: las 3 variantes de la fase 1 (1, 2 y 3 pitidos). Ver la tabla de abajo.

## Qué se instaló (y qué se logró cargar)

| Pieza | Estado |
|---|---|
| Código Chatterbox desde **GitHub** (`resemble-ai/chatterbox` @ 5de7a54, junio 2026), MIT | ✔ instalado desde la fuente: trae `t3_model="v3"` (el paquete de PyPI que probó el agente anterior no lo tenía) |
| **Multilingual V3** (`t3_mtl23ls_v3.safetensors`), MIT | ✔ **cargado y en uso** en todas las muestras. Con el decodificador `s3gen.pt` (así lo carga el código oficial) |
| Paquete **LatAm** (`t3_es_mx_latam` + `s3gen_v3.pt`), MIT, sha256 verificado | ✔ descargado y carga (`strict`); probado después, ver abajo |
| Entorno | venv propio `/tmp/claude-0/cbnat/venv` (Python 3.12, PyTorch 2.6.0 **CPU**, sin CUDA), pesos en `/tmp/claude-0/cbnat/w`, nada en git. 2 hilos, `nice -n 10` |
| Whisper | faster-whisper small (el de producción), normalizador de `ep/001/audio/build_voice.py` |

Todo MIT/Apache/BSD (ver `LICENSES.md`). La marca de agua Perth (MIT) va en todas las salidas, imperceptible; no se quita.

## Regla de retoma automática

Cada trozo se sintetiza, se le recorta la cola de ruido (marcos > pico −30 dB; islas < 0,3 s tras ≥ 0,35 s de silencio
al final se descartan) y se transcribe con Whisper. Si el texto oído difiere del guion (WER > 0 tras normalizar), o si
la toma dura demasiado (balbuceo), se repite con otra semilla, hasta 6 veces, y se queda la mejor. Todo queda en
`logs/*.json` (cada toma: semilla, WER, lo que oyó Whisper, duración, velocidad de síntesis).

## Resultados

| Versión | Referencia | Ajustes | WER final | Retomas | Ritmo | Similitud con la referencia | Duración |
|---|---|---|---|---|---|---|---|
| **A · clon del Productor** | `voice/producer/producer_reference_clean.flac` (19,6 s) | V3, exag. 0,45 · cfg 0,4 · temp. 0,75, por trozos | **0 %** (0/125) | **0** | 132 ppm (su ritmo natural al leer: ~126) | **0,949** | 61,8 s |
| (a) voz del canal | 12 s de la narradora de Kokoro (`ep/001/audio/segments/b07_13_narrator.flac`): voz sintética nuestra | V3, 0,5 · 0,4 · 0,75, por trozos | 1,6 % (2/125) | 10 | 161 ppm | 0,966 | 51,5 s |
| (b) voz de fábrica | `conds.pt` (la voz por defecto del modelo) | V3, 0,5 · 0,4 · 0,75, por trozos | 0 % | 8 | **183 ppm** (atropellada) | — | 46,0 s |
| (c) prosodia | (pendiente) | | | | | | |

Errores que quedan en (a), los dos tras 6 tomas: "se **queda** quieto" → Whisper oye "se quiera / se quede";
"hasta **volverlo** una línea" → "volverle". Son vocales finales flojas, no palabras inventadas.

**Prueba de referencia del clon** (beats 1-3, 58 palabras; similitud medida siempre contra la toma limpia completa):

| Recorte de la toma | WER | Retomas | Ritmo | Similitud |
|---|---|---|---|---|
| **completa, 19,6 s** (elegida) | 0 % | 0 | 130 ppm | **0,943** |
| primeros 14 s | 0 % | 2 | 124 ppm | 0,942 |
| últimos 13,7 s | 1,7 % | 2 | 145 ppm | 0,930 |

Limpieza de la toma del Productor: AAC estéreo 48 kHz, −32 LUFS. Pasada a mono; se quitaron los primeros 2,85 s
(ruiditos y respiración, pico −33 dB) y la cola de silencio; paso alto a 70 Hz; −18 LUFS. **Sin reducción de ruido**:
no hace falta (la grabación trae una puerta de ruido: los silencios son digitales). No se tocaron las pausas.

**Velocidad en CPU** (2 hilos): ~11-13× más lento que tiempo real (un trozo de 10 s tarda ~2 min). Carga del modelo
14-26 s. La narración completa (~7 min de voz) cuesta ~1,5-2 h por pasada.

## Cómo grabar la referencia de voz del Productor (la mejor para clonar)

Chatterbox clona "en cero disparos": no se entrena, escucha un trozo de referencia en cada uso. Usa **los primeros
~6 s** para el ritmo y el estilo, **los primeros ~10 s** para el timbre y toda la toma para la huella de la voz. Por eso
importan sobre todo los primeros 10 s.

| Qué | Mejor | Aceptable | Evitar |
|---|---|---|---|
| Duración | **15-25 s de voz continua**; los primeros 10 s son los mejores | 10-15 s | menos de 6 s; más de 30 s no ayuda |
| Formato | **WAV o FLAC, 48 kHz (o 44,1), 24 bit, mono** | M4A/AAC o MP3 de 192 kbps o más (como la toma actual) | notas de voz de WhatsApp (muy comprimidas), Bluetooth |
| Nivel | picos en −12 a −6 dBFS (la toma actual llega a −14 dBFS: quedó baja, pero sirve) | | saturar o grabar muy bajo |
| Cuarto | **habitación chica con cosas blandas** (cortinas, sofá, ropa en el clóset), puertas cerradas, sin eco | | baño, cocina, cuarto vacío; ventilador, aire acondicionado, nevera, calle |
| Micrófono | a **un palmo** (15-20 cm) de la boca, un poco de lado para que no golpeen las "p" | el micrófono del celular a 20 cm, en un soporte | moverse mientras se habla, tocar el teléfono |
| Procesado | **ninguno**: sin reducción de ruido, sin "modo voz", sin puerta de ruido, sin música | | filtros del celular o de la app (la toma actual trae una puerta de ruido) |
| Cómo leer | **como le contarías algo curioso a un amigo**, con calma: tu ritmo normal, sonrisa leve, frases completas | | leer "de locutor", muy rápido o monótono; susurrar o gritar |
| Texto | un trozo de narración del canal (la voz copia el estilo de lo que oye): el gancho o el beat 9 | | listas, números sueltos, otro idioma |
| Pausas | pausas naturales cortas (0,2-0,6 s); sin silencios largos al inicio | | toses, risas, respiraciones fuertes, "ehh" (todo eso se copia) |

Truco: grabar 2-3 tomas de 20 s y quedarse con la más tranquila. Lo que más mejora el clon es **una toma limpia y
relajada**, no la duración.

**Regla:** solo la voz del propio Productor, con su consentimiento (dado el 2026-10-16, transmitido por el director).
Nunca la voz de otra persona.

## Archivos

- `cbn.py`: carga del modelo (V3 / LatAm), referencia (ruta o `builtin`), recorte de colas, retoma con Whisper, ayudas de prosodia.
- `render_passage.py`: renderiza el pasaje con un ajuste (`--ref RUTA|builtin`, `--mode chunk|sentence`, …).
- `build_samples.py`: une las variantes con pitidos en un MP3.
- `logs/*.json`: medidas por trozo y por toma.

```bash
TQDM_DISABLE=1 OMP_NUM_THREADS=2 nice -n 10 /tmp/claude-0/cbnat/venv/bin/python -I \
  newchannel/voice/chatterbox_natural/render_passage.py A_clone \
  --ref newchannel/voice/producer/producer_reference_clean.flac --ex 0.45 --cfg 0.4 --temp 0.75
```
