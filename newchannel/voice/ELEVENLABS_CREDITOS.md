# ElevenLabs · política de créditos (Diez Mil Puntos)

Plan: Creator mensual, 121.000 créditos/mes. Narrador: David C – Viral Storytelling (`qRUgOhnxGASxirG4fKjv`).
Regla del Productor (2026-10-28): **ninguna generación sin su aprobación previa**, con el costo estimado delante.

## Costo medido
- `eleven_v4`: ≈ 1 crédito por carácter (gancho EP001: 458 caracteres = 458 créditos, 2026-10-28).
- Narración completa EP001 (guion v4.1, partes locutadas): **6.112 caracteres ≈ 6.100 créditos por pasada** (5 % del plan).

## Cómo se ahorra
1. **Prueba barata primero:** solo el gancho (≈ 460) antes de cualquier episodio completo con una voz nueva o un ajuste grande.
2. **Una toma por llamada** (`generations_count: 1`). Nunca las 2 tomas por defecto.
3. **Bloques por beat** (24 llamadas, máx. ≈ 480 caracteres): el modelo tiene contexto de párrafo y suena natural; si falla algo, se rehace solo ese beat, nunca el episodio.
4. **Control de calidad gratis en local:** Whisper compara cada beat con el guion (WER 0) y medimos ritmo y energía antes de aceptar. Solo se regenera lo que falla.
5. **Arreglos sin regenerar cuando se pueda:** pausas, ritmo fino, volumen y cortes se hacen en el montaje (0 créditos).
6. **Pronunciación por texto, no por retomas:** si una palabra suena mal, se corrige la grafía enviada al motor (nunca las palabras del guion) y se rehace ese beat una sola vez.
7. **`estimate_only` antes de cada lote** y registro en `voice/elevenlabs_gasto.csv` (fecha, qué, créditos).
8. **Muestras gratis del catálogo** para elegir voces; nunca generar para "ver cómo suena" sin aprobación.

## Naturalidad (sin gastar más)
- Etiquetas de interpretación de `eleven_v4` por beat (p. ej. `[excited]`, `[curious]`, `[whispers]`, `[laughs softly]`), sacadas de la hoja de dirección; no se pronuncian ni cambian el guion.
- Puntuación de respiración (comas, puntos suspensivos) donde la hoja marca pausa corta; las pausas largas las pone el montaje.

## Presupuesto EP001
| Paso | Créditos |
|---|---|
| Gancho de prueba con David | ≈ 460 |
| Narración completa, una pasada | ≈ 6.100 |
| Retomas de beats que fallen (estimado 15-25 %) | ≈ 900-1.500 |
| **Total estimado** | **≈ 7.500-8.000 (6-7 % del mes)** |

## Gasto registrado
| Fecha | Qué | Créditos |
|---|---|---|
| 2026-10-28 | Gancho EP001 ×3 voces (Eric, Martin Alvarez, Fernando Martinez), antes de la regla | 1.374 |
| 2026-10-29 | Gancho EP001 v5 con David C (aprobado por el Productor) | 592 |
