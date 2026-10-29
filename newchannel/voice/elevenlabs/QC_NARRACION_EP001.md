# QC de la narración EP001 (David C) · 2026-10-29

Pista: `ep/001/audio/narration_es.wav` (487,34 s, −16 LUFS). Revisión completa por el director:

1. **Palabra por palabra** (faster-whisper medium + nombres propios como contexto) contra el guion v5: 1103 palabras,
   **0 errores reales**. Diferencias restantes solo de transcriptor: «por ciento» escrito como «%», «béisbol» como
   «baseball», «Eli» como «Ellie», «veintiuno» como «veintiún», y «embotellamientos sin» oído en singular (la /s/ se
   funde con la /s/ de «sin», natural en el habla).
2. **Cortes y clics:** detector de caídas bruscas voz → silencio digital (< 5 ms). Encontró **1 defecto real**: al
   ensanchar el hueco del cuadro «¡Nooo!» (beat 21) el silencio se insertó dentro de «pasan más… autos» (403,09 s) en
   vez de antes de «Pasan». **Corregido**: los 0,60 s de silencio se movieron al hueco real tras «crece» (402,23 s).
   La frase vuelve a ser continua y el cuadro «¡Nooo!» queda en silencio limpio. Tras el arreglo: 0 caídas bruscas.
3. Retoma beat 4 («Mía» → «Mila») ya aplicada; beat 2 «el anterior» ya no aparece como dudoso.

4. v5c (2026-10-29): «una quinta parte» (≈330 s) lo transcribe Whisper medium como «quinta pata» (sesgo por el refrán). El Productor lo escuchó: dice «parte». Sin retoma.
