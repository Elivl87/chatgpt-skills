# EP001 · Narración con Qwen3-TTS «Ryan» · QC · 2026-10-24

Guion v4 bloqueado, palabra por palabra; dirección oración por oración de `DIRECCION_NARRADOR_v4.md` (registro exclamativo aprobado por el Productor). Las citas de Eli y Mila las dice el narrador; «¿Qué?», «¡Dale, dale!» y «¡Nooo!» son solo cuadro (hueco de silencio).

**Para escuchar:** `qwen/preview_narracion_es.mp3` (8:34.3, 48 kbps, 3.1 MB).

## Resumen

| | Qwen3-TTS Ryan (esta pista) | Objetivo |
|---|---|---|
| Duración total (con pantalla final de 20 s) | **8:34.3** (514.28 s) | 7:30-8:00 |
| Palabras locutadas | 1074 | 1074 (guion) |
| Ritmo (palabras / segundos con voz) | **172.4 ppm** · dentro de las oraciones 156.1 ppm | 145-155 ppm |
| Sonoridad / pico (stem) | **-16.0 LUFS · TP -2.1 dBTP** · LRA 3.1 | −16 LUFS, TP ≤ −2 (la mezcla final lleva a −14) |
| WER por oración (Whisper small, normalizador de producción) | **0 errores en 127 oraciones** | 0 |
| WER de la pista completa por beat (re-escucha del montaje) | 10: 6.0%, 12: 4.2%, 13: 1.4%, 14: 1.6%, 19: 4.8%, 20: 1.6%, 22: 2.0% | informativo |
| Tomas generadas / retomas | 513 tomas para 127 oraciones · **386 retomas** (tomas extra por WER o por energía) | ≥ 2-3 correctas por oración |
| Ajuste de ritmo en montaje (tempo con tono intacto) | 98 oraciones llevadas a 150-165 ppm: 64 aceleradas (máx. ×1.30), 34 frenadas (mín. ×0.85); pausas entre oraciones ×0.85 | ritmo 145-155 (Productor) · 135-170 por beat (coordinador) |
| Tiempo de render | CPU de síntesis 5.66 h (3 hilos, RTF ≈ 9.8) | ~1-1,5 h previstas |

**Condición de entrega** (WER 0 en las 127 oraciones · 7:00-8:00 · 135-170 ppm por beat): **NO PASA** — WER 0: True · duración: False · beats fuera de 135-170 ppm: ninguno.

## Duración: por qué no cabe en 8:00 a este ritmo

- Voz (las 127 oraciones, con sus pausas internas): **413 s** → 156 ppm medidos sobre la voz.
- Respiraciones antes de las citas y de las cifras: 13 s · pausas entre oraciones (< 1 s, ya ×0.85): 44 s · pausas del guion (gags, sello 5 s, silencio de 5 s del beat 23, 3 s antes de la pantalla final): 29 s · pantalla final: 20 s.
- Fin del beat 24 en 8:14.3; total 8:34.3. El propio guion v4 estimaba ≈ 8:08-8:27 con pausas (SCRIPT_ES419.md, cabecera). Para terminar en 8:00 haría falta la voz a ≈ 170 ppm con estas pausas, o recortar las pausas entre oraciones a ~0,25 s (×0,6) y subir la voz a ≈ 165 ppm: las dos cosas chocan con el ritmo que aprobó el Productor (≈150 ppm, «el ritmo estaba mejor») y con la biblia (el chiste vive en la pausa).
- Mando: `QWEN_PACE=lo-hi` (ventana de ppm por oración) y `QWEN_PAUSE_SCALE=x` en `build_voice_qwen.py assemble` re-montan sin volver a sintetizar (≈ 1 min). Decisión pendiente del director/Productor: 8:34 a 150-165 ppm (esta pista) o 8:00 a ~170 ppm.

## Energía frente a la referencia que gustó

Referencia: /tmp/claude-0/engines/out/qwen_a.wav 55.0-75.0s → rango tonal 15.62 st · melodía 3.68 st · energía 8.5 dB. Rango = p95−p5 del f0 en semitonos; melodía = desviación del tono medio por segundo; energía = desviación del nivel RMS (dB).

**Pista completa:** rango **13.6 st** · melodía **3.93 st** · energía **6.67 dB** · f0 mediana 139.4 Hz · 243 pausas (media 0.47 s).

| Beat | Inicio | Tramo | ppm | Rango st | Melodía st | Energía dB | WER | Retomas | Oraciones con WER > 0 |
|---|---|---|---|---|---|---|---|---|---|
| 01 | 0:00.2 | 8.03 s | 147.4 | 9.48 | 2.28 | 7.53 | 0.0 | 11 | — |
| 02 | 0:08.3 | 9.48 s | 150.0 | 12.35 | 3.62 | 6.87 | 0.0 | 6 | — |
| 03 | 0:18.0 | 11.73 s | 158.1 | 15.88 | 4.23 | 5.64 | 0.0 | 10 | — |
| 04 | 0:29.8 | 13.8 s | 149.8 | 10.83 | 2.31 | 6.28 | 0.0 | 13 | — |
| 06 | 0:43.5 | 24.62 s | 163.4 | 14.6 | 4.74 | 7.32 | 0.0 | 17 | — |
| 07 | 1:08.2 | 17.83 s | 154.8 | 16.05 | 4.94 | 8.29 | 0.0 | 19 | — |
| 08 | 1:26.0 | 12.4 s | 156.7 | 10.96 | 2.0 | 7.07 | 0.0 | 3 | — |
| 09 | 1:38.4 | 27.97 s | 154.1 | 11.4 | 2.87 | 7.09 | 0.0 | 25 | — |
| 10 | 2:06.4 | 20.73 s | 168.0 | 15.2 | 5.17 | 6.59 | 0.06 | 16 | — |
| 11 | 2:27.1 | 24.92 s | 155.7 | 13.1 | 2.95 | 7.46 | 0.0 | 20 | — |
| 12 | 2:52.0 | 33.86 s | 155.9 | 11.12 | 3.44 | 7.92 | 0.0423 | 23 | — |
| 13 | 3:25.9 | 31.05 s | 167.3 | 12.1 | 3.33 | 7.81 | 0.0135 | 11 | — |
| 14 | 3:56.9 | 29.01 s | 151.2 | 11.9 | 2.79 | 7.16 | 0.0156 | 21 | — |
| 15 | 4:25.9 | 22.02 s | 158.9 | 11.0 | 3.07 | 6.56 | 0.0 | 9 | — |
| 16 | 4:47.9 | 20.29 s | 150.0 | 10.8 | 2.93 | 5.98 | 0.0 | 11 | — |
| 17 | 5:08.2 | 17.49 s | 147.3 | 14.8 | 4.23 | 6.21 | 0.0 | 25 | — |
| 18 | 5:25.7 | 27.29 s | 151.6 | 12.19 | 3.24 | 6.12 | 0.0 | 24 | — |
| 19 | 5:53.0 | 36.05 s | 155.7 | 13.86 | 4.61 | 6.69 | 0.0476 | 30 | — |
| 20 | 6:29.1 | 29.61 s | 144.3 | 10.3 | 2.38 | 6.44 | 0.0159 | 20 | — |
| 21 | 6:58.7 | 23.26 s | 155.4 | 12.07 | 3.45 | 7.0 | 0.0 | 17 | — |
| 22 | 7:21.9 | 19.61 s | 169.9 | 11.17 | 3.08 | 6.75 | 0.0204 | 17 | — |
| 23 | 7:41.5 | 15.58 s | 151.9 | 11.9 | 3.32 | 6.33 | 0.0 | 15 | — |
| 24 | 7:57.1 | 17.16 s | 154.5 | 14.38 | 4.0 | 6.18 | 0.0 | 17 | — |
| end | 8:14.3 | 5.39 s | 168.8 | 20.91 | 7.01 | 6.17 | 0.0 | 6 | — |

## Por oración (toma conservada)

| # | Beat | Quién | Texto | Tomas (correctas) | Semilla | ppm | Energía (score) | Rango st | Instrucción (matiz) | Oído por Whisper |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 01 | narrator | Una carretera despejada. | 4 (2) | 5000 | 102.9→124.1 (×1.15) | 0.574 | 11.61 | arranque | Una carretera despejada. |
| 2 | 01 | narrator | Allá adelante, un conductor toca el freno. | 3 (3) | 13016 | 168.0 | 1.648 | 9.41 | senalar | Allá adelante, un conductor toca el freno. |
| 3 | 01 | narrator | Una sola vez. | 3 (3) | 5194 | 180.0 | 1.13 | 7.15 | seco_asombro | Una sola vez. |
| 4 | 01 | narrator | Apenas un poquito. | 5 (2) | 13210 | 80.0→92.3 (×1.15) | 0.512 | 10.8 | secreto | apenas un poquito |
| 5 | 02 | narrator | Detrás, cada auto frena un poco más fuerte que el anterior. | 5 (3) | 29145 | 145.1 | 1.628 | 9.48 | escalera | Detrás, cada auto frena un poco más fuerte que el anterior. |
| 6 | 02 | narrator | Más fuerte. Más fuerte… hasta que alguien se queda quieto: Eli. | 3 (2) | 5485 | 203.1 | 2.465 | 24.1 | climax_eli | Más fuerte, más fuerte, hasta que alguien se queda quieto. ¡Eli! |
| 7 | 03 | eli | ¡¿Quién fue?! | 3 (3) | 21420 | 266.7 | 2.081 | 19.49 | eli_indignado | ¡Quien fue! |
| 8 | 03 | narrator | Eli está seguro: alguien allá adelante tiene la culpa. | 4 (2) | 21517 | 142.1 | 1.38 | 8.33 | ironia_carino | Ellie está seguro. Alguien allá adelante tiene la culpa. |
| 9 | 03 | narrator | Pero allá no hay nada. | 3 (3) | 21614 | 162.2 | 1.826 | 10.93 | sorpresa | Pero... allá no hay nada. |
| 10 | 03 | narrator | Ni choque, ni conos, ni semáforo. | 4 (3) | 21711 | 135.8→144.0 (×1.031) | 1.685 | 11.0 | lista_tres | Ni choque, ni conos, ni semáforo. |
| 11 | 04 | narrator | Mila, su amiga, mira atrás. | 3 (3) | 21808 | 150.0 | 1.751 | 8.0 | presentar | Mila, su amiga, mira atrás. |
| 12 | 04 | mila | Eli… va para atrás. | 6 (2) | 37743 | 165.5 | 1.325 | 4.88 | mila_maravilla | Eli, va para atrás. |
| 14 | 04 | narrator | Entonces, ¿por qué hay embotellamientos sin razón aparente? | 7 (2) | 45856 | 152.4 | 1.445 | 10.28 | pregunta_gancho | Entonces, ¿por qué hay embotellamientos sin razón aparente? |
| 15 | 06 | narrator | Mila arrastra a Eli a un experimento de verdad. | 8 (1) | 53872 | 216.0 | 1.469 | 7.76 | arranque_acto | Mila arrastra a Ellie a un experimento de verdad. |
| 16 | 06 | eli | ¡Ya entendí! ¡Fue el de adelante! | 5 (3) | 38131 | 232.3 | 1.61 | 10.7 | eli_seguro | Ya entendí, fue el de adelante. |
| 17 | 06 | narrator | En dos mil ocho, un equipo de físicos en Japón puso veintidós autos en una pista circular de doscientos treinta metros. | 3 (3) | 6552 | 171.4 | 1.498 | 8.4 | dato_claro | En 2008, un equipo de físicos en Japón puso 22 autos en una pista circular de 230 metros. |
| 18 | 06 | narrator | Problema: en un círculo, todos tienen a alguien adelante. | 3 (3) | 22487 | 196.4 | 1.867 | 12.83 | remate_sonrisa | Problema, en un círculo, todos tienen a alguien adelante. |
| 19 | 06 | narrator | Los conductores tenían una sola tarea: manejar con cuidado, a unos treinta kilómetros por hora. | 3 (1) | 14665 | 140.6 | 2.563 | 25.48 | consigna | Los conductores tenían una sola tarea, manejar con cuidado a unos 30 kilómetros por hora. |
| 20 | 07 | narrator | Al principio, todo bien. | 5 (3) | 14762 | 150.0 | 2.625 | 25.55 | antes_del_golpe | Al principio, todo bien. |
| 21 | 07 | narrator | Luego aparecieron titubeos: un hueco por aquí, un apretón por allá. | 8 (2) | 62373 | 129.4→143.5 (×1.082) | 1.34 | 9.39 | jugueton | Luego aparecieron titubeos, un hueco por aquí, un apretón por allá. |
| 22 | 07 | narrator | A los tres minutos, más o menos, cinco autos estaban completamente parados. | 4 (2) | 22875 | 133.3→139.8 (×1.05) | 0.961 | 6.68 | dato_asombro | A los tres minutos más o menos cinco autos estaban completamente parados. |
| 23 | 07 | narrator | En una pista vacía. | 4 (3) | 30891 | 184.6 | 1.278 | 8.0 | remate_seco | en una pista vacía. |
| 24 | 07 | eli | ¡¿Quién fue?! | 3 (3) | 15150 | 240.0 | 1.731 | 10.26 | eli_indignado | ¿Quién fue? |
| 25 | 08 | narrator | Lo que a Mila le encanta: los autos siempre avanzan, y el embotellamiento se desliza hacia atrás, a unos veinte por hora. | 2 (1) | 7328 | 152.6 | 1.606 | 9.4 | mira_esto | Lo que a Mila le encanta, los autos siempre avanzan y el embotellamiento se desliza hacia atrás, a unos 20 por hora. |
| 26 | 08 | narrator | Más o menos lo que va una bicicleta. | 3 (3) | 7425 | 213.3 | 1.775 | 14.04 | comparacion | más o menos lo que va una bicicleta. |
| 27 | 09 | narrator | Vamos por partes. | 3 (3) | 7522 | 200.0 | 2.002 | 14.96 | aja_entrada | Vamos por partes. |
| 28 | 09 | narrator | Estiremos el círculo hasta volverlo una línea recta. | 3 (2) | 15538 | 117.1→129.7 (×1.15) | 0.912 | 11.62 | invitar | Estiremos el círculo hasta volverlo una línea recta. |
| 29 | 09 | narrator | El primer conductor toca el freno. | 3 (2) | 7716 | 116.1→130.9 (×1.15) | 0.921 | 10.98 | paso1 | El primer conductor toca el freno. |
| 30 | 09 | narrator | El segundo lo nota un instante tarde. | 4 (2) | 15732 | 152.7 | 1.647 | 9.53 | clave_claro | El segundo lo nota un instante tarde. |
| 31 | 09 | narrator | En ese instante ya se acercó, así que tiene que frenar un poco más fuerte. | 3 (3) | 7910 | 173.1 | 1.717 | 8.21 | encadena | En ese instante ya se acercó, así que tiene que frenar un poco más fuerte. |
| 32 | 09 | narrator | El tercero, más tarde y más fuerte todavía. | 4 (3) | 31764 | 141.2 | 1.508 | 9.39 | escalera | El tercero más tarde y más fuerte todavía. |
| 33 | 09 | narrator | Eli va en el diez: | 6 (2) | 39780 | 133.3→139.5 (×1.05) | 1.365 | 12.6 | marco_suspenso | Ellie va en el 10 |
| 34 | 09 | eli | No… no… ¡no! | 3 (3) | 16120 | 138.5→138.5 (×1.011) | 0.867 | 4.13 | eli_tres_no | No, no, no. |
| 35 | 09 | narrator | Para el auto número diez: alto total. | 5 (3) | 8298 | 135.5→152.7 (×1.033) | 1.684 | 7.4 | remate_golpe | Para el auto número 10, alto total. |
| 36 | 10 | narrator | Los ingenieros le llaman inestabilidad de cadena. | 4 (2) | 16314 | 164.7 | 1.744 | 12.8 | nombre_tecnico | Los ingenieros le llaman inestabilidad de cadena. |
| 37 | 10 | narrator | La cadena es simplemente la fila de autos. | 4 (3) | 24330 | 171.4 | 1.784 | 11.79 | traducir | La cadena es simplemente la fila de autos. |
| 38 | 10 | narrator | Si es estable, un titubeo se va apagando mientras viaja hacia atrás. | 5 (3) | 40265 | 194.6 | 1.819 | 13.45 | contraste_a | Si es estable, un titubeo se va apagando mientras viaja hacia atrás. |
| 39 | 10 | narrator | Si es inestable, cada conductor le suma un poquito, como un chisme que crece cada vez que alguien lo cuenta. | 2 (1) | 8686 | 198.3 | 1.398 | 8.46 | contraste_b_chisme | Si es inestable, cada conductor le suma un poquito, como un chisme que crece cada vez que alguien lo cuenta. |
| 40 | 10 | eli | ¡¿Que yo qué?! | 6 (3) | 40459 | 327.3 | 1.406 | 5.49 | eli_ofendido | que yo que |
| 41 | 11 | narrator | El embotellamiento no es un grupo fijo de autos: los autos entran por detrás, avanzan despacito y salen por delante. | 4 (3) | 24718 | 149.1 | 1.442 | 8.58 | idea_visual | El embotellamiento no es un grupo fijo de autos, los autos entran por detrás, avanzan despacito y salen por delante. |
| 42 | 11 | narrator | Los autos se van; el embotellamiento se queda. | 7 (2) | 16896 | 160.0 | 1.603 | 10.76 | paradoja | Los autos se van, el embotellamiento se queda. |
| 43 | 11 | narrator | Es como la ola en un estadio: nadie se cambia de asiento, pero la ola le da la vuelta entera. | 3 (3) | 24912 | 189.0 | 1.828 | 14.3 | analogia_estadio | Es como la ola en un estadio, nadie se cambia de asiento, pero la ola le da la vuelta entera. |
| 44 | 11 | narrator | Un embotellamiento no es un lugar. | 6 (3) | 48766 | 153.2 | 1.586 | 8.47 | lema | Un embotellamiento no es un lugar. |
| 45 | 11 | narrator | Es una ola. | 5 (2) | 33025 | 171.4 | 1.758 | 13.25 | lema_remate | Es una ola. |
| 46 | 12 | narrator | Pero no todos los círculos se atascan. | 4 (3) | 17284 | 164.7 | 1.587 | 9.26 | giro | Pero no todos los círculos se atascan. |
| 47 | 12 | narrator | El mismo equipo repitió el experimento en un estadio de béisbol, el Domo de Nagoya, con una pista de trescientos catorce metros. | 4 (2) | 17381 | 162.0 | 1.44 | 7.38 | dato_claro | El mismo equipo repitió el experimento en un estadio de béisbol, el domo de Nagoya, con una pista de 314 metros. |
| 48 | 12 | narrator | Con veinticinco autos, el tráfico fluyó. | 6 (2) | 41235 | 88.9→102.9 (×1.15) | 0.533 | 18.3 | ladoA | Con 25 autos, el tráfico fluyó. |
| 49 | 12 | narrator | Con veintiocho o más: embotellamiento. | 3 (3) | 17575 | 127.7→157.9 (×1.096) | 1.32 | 5.27 | ladoB | con 28 o más embotellamiento |
| 50 | 12 | narrator | Tres autos de más. | 3 (2) | 9753 | 111.6→133.3 (×1.15) | 1.365 | 24.9 | remate_seco | ¡Tres Autos de más! |
| 51 | 12 | eli | ¡¿Quién f…? | 3 (3) | 9850 | 600.0 | 1.417 | 9.8 | eli_indignado | ¡Quien fue! |
| 52 | 12 | narrator | Lo que importa es cuántos autos hay en cada tramo de pista: la densidad. | 3 (2) | 17866 | 182.6 | 1.849 | 12.66 | palabra_clave | Lo que importa es cuántos autos hay en cada tramo de pista, la densidad. |
| 53 | 12 | narrator | Por debajo de cierta densidad, los titubeos se apagan. | 3 (3) | 25882 | 186.2 | 1.458 | 8.49 | contraste_a | Por debajo de cierta densidad, los titubeos se apagan. |
| 54 | 12 | narrator | Por encima, crecen. | 3 (3) | 18060 | 133.3→144.0 (×1.05) | 1.706 | 12.03 | corto_ominoso | Por encima, crecen. |
| 55 | 13 | narrator | Ahora llévalo a una autopista en hora pico. | 3 (3) | 18157 | 218.2 | 1.678 | 9.86 | invitar | Ahora, llévalo a una autopista en hora pico. |
| 56 | 13 | narrator | Ahí, una sola ola puede viajar hacia atrás más de diez kilómetros, a quince o veinte por hora. | 3 (2) | 18254 | 162.4 | 1.524 | 7.14 | dato_asombro | Ahí, una sola ola puede viajar hacia atrás más de 10 kilómetros, a 15 o 20 por hora. |
| 57 | 13 | narrator | O sea que el embotellamiento en el que estás ahora mismo, llámalo trancón, taco o tráfico, pudo empezar con un frenazo de hace media hora. | 3 (1) | 18351 | 170.5 | 1.352 | 5.55 | tu_complice | O sea que el embotellamiento en el que estás ahora mismo, llámalo trancon, taco o tráfico, pudo empezar con un frenazo de hace media hora. |
| 58 | 13 | narrator | Ese conductor ya llegó a su casa. | 3 (2) | 10529 | 247.1 | 1.475 | 8.36 | prep_chiste | Ese conductor ya llegó a su casa. |
| 59 | 13 | narrator | Por eso no ves ninguna razón: la razón ya se fue a cenar. | 2 (1) | 10626 | 175.3 | 1.532 | 8.48 | remate_seco_cena | Por eso no ves ninguna razón. La razón ya se fue a cenar. |
| 60 | 13 | eli | ¿Ni un perdón? | 3 (3) | 18642 | 163.6 | 1.84 | 14.19 | eli_dolido | Ni un perdón. |
| 61 | 14 | narrator | Entonces, ¿cómo se detiene una ola? | 3 (3) | 10820 | 130.9→153.2 (×1.07) | 2.376 | 24.25 | pregunta_real | Entonces, ¿cómo se detiene una ola? |
| 62 | 14 | narrator | ¿Hay que cambiar a todos los conductores? | 3 (3) | 10917 | 158.5 | 1.888 | 12.8 | pregunta_opcion | ¿Hay que cambiar a todos los conductores? |
| 63 | 14 | narrator | ¿Llenar la autopista de autos robot? | 4 (2) | 11014 | 130.9→138.5 (×1.07) | 1.549 | 8.7 | pregunta_opcion2 | ¿Llenar la autopista de autos robot? |
| 64 | 14 | narrator | Unos años después, un equipo en Estados Unidos armó otra vez el círculo, con veintiún autos. | 3 (3) | 19030 | 171.4 | 1.454 | 8.1 | dato_claro | Unos años después, un equipo en Estados Unidos armó otra vez el círculo con 21 autos. |
| 65 | 14 | narrator | A los conductores les dieron una instrucción, para que no arreglaran las olas por su cuenta: manejen como en hora pico. | 3 (3) | 19127 | 143.2 | 1.733 | 9.58 | instruccion_cita | a los conductores les dieron una instrucción para que no arreglaran las olas por su cuenta, manejen como en hora pico |
| 66 | 14 | narrator | Si se abre un hueco, ciérrenlo. | 4 (3) | 27143 | 133.3→144.0 (×1.05) | 1.411 | 8.43 | orden | Si se abre un hueco, cierrenlo. |
| 67 | 14 | eli | ¡Mi lema! | 8 (1) | 19321 | 88.9→104.3 (×1.15) | 0.366 | 11.86 | eli_orgullo | ¡Mi lema! |
| 68 | 15 | narrator | Pero uno de esos autos era distinto. | 3 (3) | 27337 | 164.7 | 1.848 | 13.27 | giro_misterio | Pero uno de esos autos era distinto. |
| 69 | 15 | narrator | Una computadora controlaba su velocidad, con una idea muy simple: no perseguir al de adelante. | 3 (2) | 19515 | 138.5→138.5 (×1.011) | 1.418 | 8.94 | idea_simple | Una computadora controlaba su velocidad con una idea muy simple, no perseguir al de adelante. |
| 70 | 15 | narrator | Ir a la velocidad promedio del tráfico, o sea, a lo que de verdad avanzan todos, contando frenadas y arrancones. | 2 (1) | 11693 | 205.1 | 1.382 | 5.93 | traducir | Ir a la velocidad promedio del tráfico, o sea, a lo que de verdad avanzan todos, contando frenadas y arrancones. |
| 71 | 15 | narrator | El espacio de adelante se estira y se encoge, como un resorte. | 5 (3) | 27628 | 165.5 | 1.579 | 9.16 | jugueton | El espacio de adelante se estira y se encoge como un resorte. |
| 72 | 16 | narrator | La ola se derritió. | 3 (2) | 19806 | 154.8 | 1.676 | 11.43 | alivio | La ola se derritió. |
| 73 | 16 | narrator | Los cambios de velocidad bajaron cerca de un ochenta por ciento. | 3 (3) | 11984 | 116.8→133.3 (×1.15) | 0.794 | 9.17 | dato_asombro | Los cambios de velocidad bajaron cerca de un 80%. |
| 74 | 16 | narrator | Los frenazos fuertes casi desaparecieron. | 4 (3) | 35838 | 111.1→130.4 (×1.15) | 0.681 | 11.05 | resultado | Los frenazos fuertes casi desaparecieron. |
| 75 | 16 | narrator | En esa pista chiquita, los autos gastaron hasta un cuarenta por ciento menos de gasolina. | 3 (2) | 20097 | 137.4→137.4 (×1.019) | 1.415 | 6.16 | dato_asombro | En esa pista chiquita, los autos gastaron hasta un 40 % menos de gasolina. |
| 76 | 16 | narrator | Todo eso, con un solo auto de veintiuno. | 3 (2) | 20194 | 162.7 | 2.113 | 14.22 | remate_cifra | Todo eso con un solo auto de 21. |
| 77 | 17 | narrator | Después, programaron la computadora un poquito más rápido que el promedio. | 3 (3) | 28210 | 143.5 | 1.664 | 10.93 | travesura | Después, programaron la computadora un poquito más rápido que el promedio. |
| 78 | 17 | narrator | La ola volvió. | 5 (2) | 12469 | 156.5 | 0.713 | 3.61 | sorpresa_corta | La ola volvió |
| 79 | 17 | eli | ¡¿Quién fue?! | 3 (3) | 12566 | 133.3→141.2 (×1.05) | 2.458 | 26.0 | eli_pulmon | ¿Quién fue? |
| 80 | 17 | mila | Eli. | 8 (1) | 52258 | 66.7→75.0 (×1.15) | 0.608 | 23.25 | mila_seca | ¡Eli! |
| 81 | 17 | eli | …Fue el viento. | 7 (2) | 52355 | 180.0 | 1.077 | 3.24 | eli_viento | Fue el viento |
| 82 | 17 | narrator | Ser paciente no es ir lento. | 3 (3) | 20776 | 138.5→138.5 (×1.011) | 1.203 | 6.54 | aja | Ser paciente no es ir lento. |
| 83 | 17 | narrator | Es ir al promedio. | 3 (3) | 12954 | 184.6 | 1.55 | 14.0 | aja_remate | es ir al promedio |
| 84 | 18 | narrator | Esta es la parte favorita de Mila. | 5 (3) | 28889 | 190.9 | 1.544 | 10.9 | confidencia | Esta es la parte favorita de Mila. |
| 85 | 18 | narrator | En otra prueba no hubo computadora. | 3 (3) | 21067 | 156.5 | 1.463 | 8.91 | giro | En otra prueba, no hubo computadora. |
| 86 | 18 | narrator | Solo un conductor entrenado, con un único número: la velocidad promedio. | 8 (1) | 44921 | 136.1→137.5 (×1.029) | 1.395 | 11.98 | palabra_clave | solo un conductor entrenado con un único número la velocidad promedio |
| 87 | 18 | eli | ¡Hay un hueco! ¡Un hueco enorme! | 3 (3) | 21261 | 141.2 | 1.913 | 13.71 | eli_panico | Hay un hueco, un hueco enorme. |
| 88 | 18 | mila | Ese hueco es mi amigo. | 3 (3) | 29277 | 157.9 | 1.108 | 4.68 | mila_serena | Ese hueco es mi amigo. |
| 89 | 18 | narrator | Los cambios de velocidad bajaron casi a la mitad. | 3 (3) | 29374 | 136.7→135.0 (×1.024) | 1.334 | 9.23 | dato_asombro | Los cambios de velocidad bajaron casi a la mitad. |
| 90 | 18 | narrator | La gasolina, más o menos una quinta parte. | 4 (3) | 13633 | 124.7→145.5 (×1.123) | 1.012 | 5.84 | resultado | La gasolina, más o menos una quinta parte. |
| 91 | 18 | narrator | Una sola persona paciente. | 3 (2) | 21649 | 120.0→141.2 (×1.15) | 0.839 | 6.7 | remate_intimo | Una sola persona paciente. |
| 92 | 19 | narrator | ¿Por qué funciona? | 3 (3) | 29665 | 225.0 | 1.568 | 14.18 | pregunta_real | ¿Por qué funciona? |
| 93 | 19 | narrator | Porque un espacio libre es un amortiguador: se come el frenazo antes de que llegue a los demás. | 6 (1) | 45600 | 130.9→145.0 (×1.07) | 1.324 | 8.2 | idea_visual | Porque un espacio libre es un amortiguador. Se come el frenazo antes de que llegue a los demás. |
| 94 | 19 | narrator | El auto paciente llega tarde al embotellamiento, cuando ya se está despejando, así que nunca tiene que detenerse. | 4 (1) | 29859 | 157.7 | 1.35 | 8.5 | encadena | El auto paciente llega tarde al embotellamiento cuando ya se está despejando así que nunca tiene que detenerse. |
| 95 | 19 | narrator | Los de atrás ni sienten la ola. | 3 (3) | 14118 | 280.0 | 1.642 | 10.3 | resultado | Los de atrás ni sienten la ola. |
| 96 | 19 | narrator | Por una vez, llegar tarde es la jugada. | 3 (3) | 14215 | 162.7 | 1.707 | 11.63 | remate_guino | Por una vez, llegar tarde es la jugada. |
| 97 | 19 | eli | ¡Yo llego tarde a todo! | 3 (3) | 30150 | 181.8 | 1.885 | 11.4 | eli_orgullo | Yo llego tarde a todo. |
| 98 | 19 | narrator | En Japón esto tiene nombre: manejo que absorbe embotellamientos. | 4 (2) | 14409 | 125.6→142.1 (×1.115) | 1.402 | 14.6 | nombre_tecnico | En Japón, esto tiene nombre, manejo que absorbe embotellamientos. |
| 99 | 19 | narrator | Ojo: no es magia. | 8 (1) | 14506 | 102.1→114.3 (×1.15) | 0.523 | 9.05 | honesto | ¡Ojo! ¡No es magia! |
| 100 | 19 | narrator | Si la vía está simplemente repleta, ningún conductor puede absorber eso. | 5 (3) | 46279 | 117.9→141.9 (×1.15) | 1.703 | 26.2 | honesto_cierre | Si la vía está simplemente repleta, ningún conductor puede absorber eso. |
| 101 | 20 | narrator | ¿Funciona en una autopista de verdad? | 3 (3) | 22619 | 126.3→138.5 (×1.108) | 1.318 | 14.1 | pregunta_real | ¿Funciona en una autopista de verdad? |
| 102 | 20 | narrator | En noviembre de dos mil veintidós, cerca de Nashville, en Tennessee. | 3 (3) | 14797 | 148.3 | 2.538 | 23.3 | dato_claro | en noviembre de 2022, cerca de Nashville, en Tennessee. |
| 103 | 20 | narrator | Un equipo metió cien autos al tráfico de hora pico con un control de crucero inteligente: un programa que decide cuándo acelerar y cuándo frenar. | 6 (3) | 46570 | 138.9→140.8 (×1.008) | 1.388 | 7.8 | idea_visual | Un equipo metió 100 autos al tráfico de hora pico, con un control de crucero inteligente. Un programa que decide cuándo acelerar y cuándo frenar. |
| 104 | 20 | narrator | ¿El resultado? Es complicado. | 8 (0) | 14991 | 75.0→85.7 (×1.15) | 0.0 | None | resultado_complicado | El resultado es complicado. |
| 105 | 20 | narrator | Cien autos son una gota en una autopista. | 3 (2) | 15088 | 115.7→139.1 (×1.15) | 0.91 | 6.15 | comparacion | 100 autos son una gota en una autopista. |
| 106 | 20 | narrator | No borraron todas las olas, y tampoco esperaban hacerlo. | 3 (3) | 23104 | 180.0 | 1.764 | 12.67 | honesto_cierre | No borraron todas las olas y tampoco esperaban hacerlo. |
| 107 | 21 | narrator | Pero hay un momento que Eli no deja de repetir. | 5 (3) | 46958 | 134.8→146.3 (×1.039) | 1.687 | 10.33 | mira_esto | Pero hay un momento que Ellie no deja de repetir. |
| 108 | 21 | narrator | Una ola viaja hacia atrás por la autopista. | 3 (3) | 31217 | 213.3 | 1.294 | 7.06 | paso1 | Una ola viaja hacia atrás por la autopista. |
| 109 | 21 | narrator | Pasan dos autos inteligentes, y se achica. | 5 (2) | 15476 | 171.4 | 1.598 | 10.04 | relato_deportivo | Pasan dos autos inteligentes y se achica. |
| 111 | 21 | narrator | Pasan cuatro con el sistema apagado, y crece. | 3 (2) | 15670 | 165.5 | 1.347 | 7.5 | relato_deportivo_b | Pasan cuatro con el sistema apagado y crece. |
| 113 | 21 | narrator | Pasan más autos inteligentes, y se achica otra vez. | 4 (3) | 31702 | 144.0 | 1.554 | 9.46 | relato_deportivo | Pasan más autos inteligentes y se achica otra vez. |
| 114 | 21 | narrator | Cada auto que la cruza la hace crecer o encoger. | 3 (3) | 31799 | 139.5→141.2 (×1.004) | 1.813 | 10.96 | conclusion | Cada auto que la cruza la hace crecer o encoger. |
| 115 | 22 | narrator | O sea que tú también eres parte de la ola. | 6 (2) | 23977 | 315.8 | 1.281 | 5.2 | tu_directo | O sea que tú también eres parte de la ola. |
| 116 | 22 | narrator | Así que deja un espacio: uno seguro, no uno enorme. | 3 (3) | 24074 | 157.9 | 1.598 | 10.67 | consejo | Así que deja un espacio. Uno seguro, no uno enorme. |
| 117 | 22 | narrator | No corras a cerrarlo. | 5 (3) | 47928 | 165.5 | 1.253 | 7.15 | consejo_corto | No corras a cerrarlo. |
| 118 | 22 | narrator | Maneja a la velocidad real del tráfico, no a la que te gustaría. | 2 (1) | 16349 | 115.6→130.0 (×1.15) | 0.848 | 8.14 | consejo | Maneja a la velocidad real del tráfico, no a la que te gustaría. |
| 119 | 22 | narrator | No llegas más tarde: la misma distancia, el mismo tiempo, menos frenazos. | 6 (2) | 48122 | 211.8 | 1.545 | 10.7 | lista_tres_calma | No llegas más tarde, la misma distancia, el mismo tiempo, menos frenazos. |
| 120 | 23 | narrator | Mismo camino. Mismo toque de freno, allá adelante. | 3 (3) | 32381 | 157.4 | 1.648 | 9.72 | eco_gancho | Mismo camino, mismo toque de freno, allá adelante. |
| 121 | 23 | narrator | Solo que esta vez, Eli sí deja el espacio. | 5 (2) | 24559 | 177.0 | 1.536 | 9.99 | pago | Solo que esta vez, Ellie sí deja el espacio. |
| 122 | 23 | eli | ¿…Quién fue? | 3 (3) | 32575 | 141.2 | 2.129 | 17.87 | eli_susurro | ¿Quién fue? |
| 123 | 23 | mila | Fuiste tú. | 8 (3) | 64348 | 141.2 | 1.372 | 6.7 | mila_sonrie | Fuiste tú. |
| 124 | 24 | narrator | En algún lugar detrás de ellos, un embotellamiento que nunca pasó. | 4 (2) | 32769 | 129.4→141.9 (×1.082) | 1.221 | 9.39 | secreto | En algún lugar detrás de ellos, un embotellamiento que nunca pasó. |
| 125 | 24 | narrator | Un embotellamiento no es un lugar. | 5 (2) | 40785 | 171.4 | 1.81 | 10.38 | lema | Un embotellamiento no es un lugar. |
| 126 | 24 | narrator | Es una ola. | 6 (2) | 48801 | 211.8 | 0.974 | 2.54 | lema_remate | ¡Es una ola! |
| 127 | 24 | narrator | Un solo conductor paciente puede absorberla. | 3 (2) | 25141 | 141.2 | 1.438 | 9.15 | cierre_calido | Un solo conductor paciente puede absorberla. |
| 128 | 24 | narrator | Esto es Diez Mil Puntos. | 4 (3) | 41076 | 150.0 | 1.903 | 15.87 | firma | Esto es 10 .000 puntos. |
| 129 | end | narrator | La próxima vez: ¿por qué los buses llegan de a tres? | 3 (3) | 33254 | 191.3 | 2.011 | 13.74 | teaser | La próxima vez. ¿Por qué los buses llegan de A3? |
| 130 | end | eli | ¡¿Quién fue?! | 5 (3) | 49189 | 200.0 | 1.404 | 5.55 | eli_indignado | ¿Quién fue? |

## Notas

- Todas las oraciones tienen WER 0 en su toma conservada.
- Aceleradas en montaje (rubberband, tono intacto): «Una carretera despejada.» ×1.495; «Apenas un poquito.» ×1.495; «Detrás, cada auto frena un poco más fuerte que el anterior.» ×1.164; «Más fuerte. Más fuerte… hasta que alguien se queda quieto: Eli.» ×1.038; «Eli está seguro: alguien allá adelante tiene la culpa.» ×1.061; «Ni choque, ni conos, ni semáforo.» ×1.157; «Mila, su amiga, mira atrás.» ×1.004; «Eli… va para atrás.» ×1.055; «Entonces, ¿por qué hay embotellamientos sin razón aparente?» ×1.201; «Los conductores tenían una sola tarea: manejar con cuidado, a unos treinta kilómetros por hora.» ×1.184; «Al principio, todo bien.» ×1.228; «Luego aparecieron titubeos: un hueco por aquí, un apretón por allá.» ×1.324; «A los tres minutos, más o menos, cinco autos estaban completamente parados.» ×1.134; «Lo que a Mila le encanta: los autos siempre avanzan, y el embotellamiento se desliza hacia atrás, a unos veinte por hora.» ×1.132; «Estiremos el círculo hasta volverlo una línea recta.» ×1.388; «El primer conductor toca el freno.» ×1.325; «El segundo lo nota un instante tarde.» ×1.007; «El tercero, más tarde y más fuerte todavía.» ×1.107; «Eli va en el diez:» ×1.174; «No… no… ¡no!» ×1.122; «Para el auto número diez: alto total.» ×1.296; «El embotellamiento no es un grupo fijo de autos: los autos entran por detrás, avanzan despacito y salen por delante.» ×1.177; «Los autos se van; el embotellamiento se queda.» ×1.061; «Un embotellamiento no es un lugar.» ×1.041; «El mismo equipo repitió el experimento en un estadio de béisbol, el Domo de Nagoya, con una pista de trescientos catorce metros.» ×1.023; «Con veinticinco autos, el tráfico fluyó.» ×1.495; «Con veintiocho o más: embotellamiento.» ×1.217; «Tres autos de más.» ×1.402; «Por encima, crecen.» ×1.157; «Entonces, ¿cómo se detiene una ola?» ×1.158; «¿Llenar la autopista de autos robot?» ×1.166; «A los conductores les dieron una instrucción, para que no arreglaran las olas por su cuenta: manejen como en hora pico.» ×1.054; «Si se abre un hueco, ciérrenlo.» ×1.138; «¡Mi lema!» ×1.15; «Una computadora controlaba su velocidad, con una idea muy simple: no perseguir al de adelante.» ×1.194; «Los cambios de velocidad bajaron cerca de un ochenta por ciento.» ×1.435; «Los frenazos fuertes casi desaparecieron.» ×1.429; «En esa pista chiquita, los autos gastaron hasta un cuarenta por ciento menos de gasolina.» ×1.113; «Todo eso, con un solo auto de veintiuno.» ×1.3; «Después, programaron la computadora un poquito más rápido que el promedio.» ×1.087; «¡¿Quién fue?!» ×1.05; «Eli.» ×1.15; «Ser paciente no es ir lento.» ×1.104; «Solo un conductor entrenado, con un único número: la velocidad promedio.» ×1.305; «¡Hay un hueco! ¡Un hueco enorme!» ×1.094; «Los cambios de velocidad bajaron casi a la mitad.» ×1.331; «La gasolina, más o menos una quinta parte.» ×1.315; «Una sola persona paciente.» ×1.255; «Porque un espacio libre es un amortiguador: se come el frenazo antes de que llegue a los demás.» ×1.278; «Por una vez, llegar tarde es la jugada.» ×1.034; «En Japón esto tiene nombre: manejo que absorbe embotellamientos.» ×1.199; «Ojo: no es magia.» ×1.495; «Si la vía está simplemente repleta, ningún conductor puede absorber eso.» ×1.336; «¿Funciona en una autopista de verdad?» ×1.21; «En noviembre de dos mil veintidós, cerca de Nashville, en Tennessee.» ×1.111; «Un equipo metió cien autos al tráfico de hora pico con un control de crucero inteligente: un programa que decide cuándo acelerar y cuándo frenar.» ×1.27; «¿El resultado? Es complicado.» ×1.495; «Cien autos son una gota en una autopista.» ×1.367; «Pero hay un momento que Eli no deja de repetir.» ×1.131; «Pasan más autos inteligentes, y se achica otra vez.» ×1.281; «Cada auto que la cruza la hace crecer o encoger.» ×1.078; «Así que deja un espacio: uno seguro, no uno enorme.» ×1.281; «Maneja a la velocidad real del tráfico, no a la que te gustaría.» ×1.432; «Mismo camino. Mismo toque de freno, allá adelante.» ×1.028; «En algún lugar detrás de ellos, un embotellamiento que nunca pasó.» ×1.252; «Un solo conductor paciente puede absorberla.» ×1.086; «Esto es Diez Mil Puntos.» ×1.036
- Selección de toma: entre las correctas, la de mayor puntuación de energía = rango tonal / 15.62 + variación RMS / 8.5, ponderada por ritmo (peso completo desde 140 ppm, 30 % a ≤ 100 ppm): una toma arrastrada mide mucho rango pero es justo lo que el Productor rechazó.
- Re-escucha de la pista completa (Whisper sobre cada beat del montaje, informativo): las diferencias son del ASR en citas gritadas y muy cortas («¡¿Que yo qué?!» 0,6 s no se transcribe), en «embotellamiento» y en el arranque de «El auto paciente…» (oye «ehhh»); cada oración por separado dio WER 0.
- Tomas correctas por oración: 72 oraciones con ≥ 3, 40 con 2, 15 con 1 (se agotaron las 8 llamadas por alucinaciones; la toma conservada tiene WER 0). Regla aplicada: 3 tomas correctas en oraciones de ≤ 12 palabras, 2 en las largas salvo que ambas midieran menos energía que la referencia (entonces una 3.ª).
- Servidor: `qwen_tts -d cv17 -j 3 --max-request-seconds 900 --serve 8091` (bf16, sin int8), motor C recompilado en esta máquina (AVX-512 VNNI, sin AMX/BF16: RTF ≈ 9-12 frente a 4-7 en la máquina de la prueba de motores).
