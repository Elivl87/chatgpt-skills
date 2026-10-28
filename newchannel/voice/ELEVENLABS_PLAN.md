# ElevenLabs para el narrador (plan, 2026-10-28)

Pedido del Productor: tener la voz «Bram» de SecondQuest pagando ElevenLabs directamente.

## Hechos verificados
- «Bram» es el nombre de un preset de Higgsfield con motor ElevenLabs (id Higgsfield `549ff70a-3ee7-4f04-a4d9-89a24fab7709`, modelo `text2speech_v2` / `elevenlabs`). No está entre las 21 voces premade públicas de ElevenLabs (consulta del 2026-10-28). Su nombre en ElevenLabs es desconocido.
- La red del entorno llega a `api.elevenlabs.io`. La búsqueda en la biblioteca compartida (`/v1/shared-voices`) exige clave (HTTP 401).
- Terms: usar una voz del catálogo con plan pagado = uso comercial permitido. Clonar o entrenar con audio de Bram = prohibido (ver `secondquest/docs/voice/BRAM_TRAINING_TERMS_2026-10-03.md`). Voces default de ElevenLabs: aviso de vencimiento 2026-12-31.

## Conexión
- Clave guardada por el Productor en la configuración del entorno (Network secrets, o variable de entorno `ELEVENLABS_API_KEY`). Nunca se pide ni se pega en el chat. La toma una sesión nueva.
- Permisos mínimos sugeridos para la clave: Text to Speech, Voices (lectura). Límite de créditos en la clave.

## Pasos al tener la clave (sesión nueva)
1. `GET /v1/user/subscription`: plan, caracteres disponibles, licencia comercial.
2. Buscar Bram: `GET /v1/shared-voices` (search por nombre y por descriptores: male, narrator, warm, deep, english/spanish) + `GET /v1/voices`. Preparar 4-6 candidatas y compararlas por medición (similitud de hablante contra `secondquest/audio/bram/ep002_es/*.mp3`, solo para identificar cuál es la misma voz de catálogo, nunca para clonar) y de oído con el Productor.
3. Prueba: gancho del piloto (beats 1-4, guion v4) con la voz encontrada, `eleven_multilingual_v2` (o el modelo multilingüe vigente), mismas reglas de WER 0, ≤ 1.000 caracteres. A/B contra Ryan v4 y Ryan v5 (estudio de estilo).
4. Si gana: presupuesto por episodio (≈6.000 caracteres + retomas) y decisión del Productor antes de renderizar el episodio completo.
