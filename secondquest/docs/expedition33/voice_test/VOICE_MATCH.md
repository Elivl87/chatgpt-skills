# EP004 · Placeholder voice closer to Bram's timbre (2026-10-18)
Producer: "Quiero que tenga más parecido a Bram en cuánto a su timbre de voz."
Method (`scripts/ep004-voice-match.py`, free, Kokoro): reference = Bram's real EP002 + EP003 narration (~9 min);
candidates = am_fenrir blended with 6 other Kokoro voices (20/35/50/65 %), pitch −1..+3 st, formant shifted/preserved,
each through the EQ-to-Bram step; score = timbre distance on voiced frames (MFCC mean/spread + brightness + pitch;
lower = closer). 58 candidates (the run was cut by a container restart at 48; the santa zone was then refined).
| Variant | Distance |
|---|---|
| EP003 approved chain (fenrir, +1 st) | 1.314 |
| fenrir 65 % + santa 35 %, +3 st (**D**) | 0.693 |
| fenrir 50 % + santa 50 %, +2 st (**C**, best) | 0.676 |
| fenrir + adam / lewis / puck / michael / liam | 1.16–1.34 |
Samples (v3.1 hook): `r2_0_BRAM_referencia.mp3` (Bram, EP002, internal reference only), `r2_A_fenrir_EP003.mp3`,
`r2_C_fenrir50_santa50_+2.mp3`, `r2_D_fenrir65_santa35_+3.mp3`. The number guides; the Producer's ear decides.
