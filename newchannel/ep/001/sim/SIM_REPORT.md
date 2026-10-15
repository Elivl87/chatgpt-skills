# Ep 001 · SIM_REPORT (generado por `validate.mjs`; no editar a mano)

Guion: `SCRIPT_ES419.md` v3 (bloqueado). Estados: 17. Afirmaciones verificadas: **59 / 59 pasan**.

**Las simulaciones son ilustraciones, no reproducciones** de los experimentos (Sugiyama 2008, Tadaki 2013, Stern 2018,
Lee 2025). Los números en pantalla salen de los artículos (`FACTS.md`); el sim tiene que ir en la misma dirección y ser
honesto. Todo en unidades reales (m, s); el sello **ACELERADO ×N** es `timeScale` (t_sim = simT0 + t_video × N).

Motor: `engine.js` (extiende el IDM del kit `art/lib/sim.js`: conductores por auto, tiempo de reacción, ruido con semilla,
FollowerStopper, conductor paciente, peaje). Interfaz idéntica a `K.sim.ring` (`run.at(t)`, `run.brake(i,t)`, `run.onsets(i)`),
más `run.roles`, `run.events`, `run.metrics`. Luz de freno = fórmula del kit (se enciende con a < −0,25 m/s² o v < 1 m/s).

Comprobación cruzada con el kit: con parámetros homogéneos y sin retraso, `engine.js` reproduce `K.sim.ring` (22 autos, 230 m, mismo toque) con diferencia máx. de posición **1.5e-5 m** en 20 s.

## Calibraciones de conductores (IDM: a, b, T, s0, v0, δ=4; tau = tiempo de reacción)

| Nombre | Parámetros | Uso |
|---|---|---|
| `RING_JP` (idm) | a=1.5, b=3, T=0.6, s0=1.2, v0=14, delta=4, noise=0.2, noiseTc=2 | S2, S5 |
| `HUMAN` (idm) | a=1, b=2, T=1, s0=2, v0=14, delta=4, tau=1 | S1, S3, S4, S11, peaje |
| `ELI_CLOSER` (idm) | a=2, b=2, T=0.4, s0=2, v0=14, delta=4, tau=1, panicThr=0.8, panicDecel=3, panicHold=2.5, holdAfterStop=10 | S1, S19 arriba |
| `PATIENT` (spring) | gref=34, kp=0.000064, kd=0.014400000000000001, ema=8, bsoft=0.25, amax=0.3; kin smin=2.5 m, ttc=2 s | S11, S19 abajo |
| `CLOSER_US` (idm) | a=1, b=1.5, T=0.8, s0=2, v0=12, delta=4, noise=0.2, noiseTc=2 | S7-S9 |
| `FS` (fs) | Usrc=avgAll, Uwin=60, kp=0.6, amax=1, bmax=3; dx0=4.5/5.25/6 m, d=1.5/1/0.5 | S7, S8, S5 (40) |
| `MILA_HUMAN` (human_patient) | Usrc=prevLap, lag=1.5, wobble=0.35, wobbleP=11, amax=1, bmax=2.5, follow=0.435; safety IDM a=1, b=2, T=0.5, s0=2, v0=30, delta=4 | S9 |
| `HWY` (idm) | a=1, b=1.5, T=1, s0=2, v0=30, delta=4 | S6, S10 |
| `SMART` (spring) | gref=45, kp=0.0009, kd=0.054, ema=15, bsoft=0.6, amax=0.5; kin smin=4 m, ttc=undefined s | S10 |

Valores físicamente razonables: a 0,5-2 m/s², b 1,5-3 m/s², T 0,4-1,2 s, s0 1-2,5 m (Treiber & Kesting, *Traffic Flow Dynamics*). Coche de 4,5 m.

## Resumen

| Estado | Beats | ACELERADO | Semilla | Afirmaciones |
|---|---|---|---|---|
| S1 | 1-4, 23 (referencia), Short | ×3 | 1 | 6 / 6 PASA |
| S2 | 6-8, Short | ×10 | 13 | 6 / 6 PASA |
| S3 | 9 (y 19 de fondo) | ×2 | 1 | 4 / 4 PASA |
| S3B_ELI | 19 | ×2 | 1 | 2 / 2 PASA |
| S3B_MILA | 19 | ×2 | 1 | 3 / 3 PASA |
| S4 | 10 | ×2 | 1 | 2 / 2 PASA |
| S5_25 | 12 | ×10 | 33 | 2 / 2 PASA |
| S5_28 | 12 | ×10 | 33 | 2 / 2 PASA |
| S5_40 | 19 | ×10 | 33 | 1 / 1 PASA |
| S6 | 13, Short | ×120 | 1 | 4 / 4 PASA |
| S7 | 14-16, Short | ×4 | 14 | 7 / 7 PASA |
| S8 | 17 | ×4 | 14 | 2 / 2 PASA |
| S9 | 18 | ×4 | 14 | 3 / 3 PASA |
| S10 | 20-21 | ×6 | 1 | 4 / 4 PASA |
| S11 | 22-23, Short | ×3 | 1 | 5 / 5 PASA |
| TOLL | 19 | ×4 | 21 | 2 / 2 PASA |
| SH | Short | ×1 | — | 4 / 4 PASA |

## S1 · Carretera dorada: un toque, Eli (6.º detrás) se queda quieto

- Beats: 1-4, 23 (referencia), Short · ACELERADO ×3 · simT0 = 7 s · semilla 1 · 30 autos · carril abierto · dt 0.02 s · cálculo 158 ms
- Roles: `{"tapper":26,"eli":20,"eliLeader":21,"behindEli":"[20 autos]","frontCar":29,"carsBehindTapper":[25,24,23,22,21,20]}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S1.mono | Detrás, cada auto frena un poco más fuerte que el anterior (pico de deceleración, del que toca al 6.º = Eli) | 0.50 → 0.51 → 0.56 → 0.64 → 0.71 → 0.82 → 3.00 m/s² | estrictamente creciente | PASA |
| S1.eli | …hasta que alguien se queda quieto: Eli (el primero en pararse es el 6.º detrás del que toca) | primer auto parado: 6.º detrás | 6.º detrás (Eli) | PASA |
| S1.tap | El toque es "apenas un poquito" (pico 0,5 m/s², luz de freno tenue) | pico 0.50 m/s², caída 7.2 km/h, luz 0.33 | ≤ 0,6 m/s² | PASA |
| S1.timing | La cascada llega a Eli en ~6 s de video (toque en 0:01, frenazo de Eli hacia 0:07) con ACELERADO ×3 | frenazo 6.55 s, parado 7.29 s (video) | 6-8 s | PASA |
| S1.behind | La ola sigue hacia atrás detrás de Eli (autos detrás que también se paran, de los 10 primeros) | 10 / 10 | ≥ 5 | PASA |
| S1.safe | Sin choques (hueco mínimo > 0) | 0.64 m | > 0,3 m | PASA |

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `tap_start` t = 1 s (t_sim 10 s) · auto 26 · el conductor toca el freno
- `tap_end` t = 3.667 s (t_sim 18 s) · auto 26
- `leader_brake_onset` t = 5.987 s (t_sim 24.96 s) · auto 21 · el auto de adelante frena
- `eli_brake_onset` t = 6.347 s (t_sim 26.04 s) · auto 20 · la ola llega a Eli
- `eli_hard_brake` t = 6.547 s (t_sim 26.64 s) · auto 20
- `eli_stop` t = 7.287 s (t_sim 28.86 s) · auto 20
- `eli_restart` t = 10.727 s (t_sim 39.18 s) · auto 20
- inicios de frenado (24): #3@4.747s, #4@5.347s, #5@5.987s, #6@6.347s, #7@6.747s, #8@7.147s, #9@7.527s, #10@7.927s, #11@8.347s, #12@8.767s, #13@9.167s, #14@9.587s, #15@10.007s, #16@10.427s …

## S2 · Anillo 2008: 22 autos en 230 m, sin toque

- Beats: 6-8, Short · ACELERADO ×10 · simT0 = 0 s · semilla 13 · 22 autos · anillo 230 m · periódico · dt 0.05 s · cálculo 96 ms
- Roles: `{"L":230,"marked":3}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S2.free | Al principio, todo bien (flujo libre 1-2 min de sim, nadie parado) | primer auto parado a 143.5 s | ≥ 90 s | PASA |
| S2.five | A los tres minutos, más o menos, cinco autos completamente parados (v < 0,3 m/s) | a 3:00: 5 parados (2:50-3:10: 5-7) | 5 (±1) a 3:00 | PASA |
| S2.wave | El embotellamiento se desliza hacia atrás a unos 20 km/h | -18.8 km/h (ajuste lineal, 947 muestras) | −16 a −24 km/h | PASA |
| S2.speed | Velocidad del flujo libre cerca de lo pedido (~30 km/h) | 26.7 km/h | 24-32 km/h | PASA |
| S2.moving | Todos los autos siguen avanzando (cada auto da vueltas) | vueltas por auto en 7 min: 10.0 | > 3 | PASA |
| S2.safe | Sin choques | 0.92 m | > 0,3 m | PASA |

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `first_wobble` t = 2.25 s (t_sim 22.5 s) · primer titubeo visible
- `first_stop` t = 14.35 s (t_sim 143.5 s) · primer auto parado
- `five_stopped` t = 15.1 s (t_sim 151 s) · 5 autos parados
- `clock_3min` t = 18 s (t_sim 180 s) · reloj 3:00
- `marked_enters_jam` t = 20.35 s (t_sim 203.5 s) · auto 3
- `marked_leaves_jam` t = 21.2 s (t_sim 212 s) · auto 3

## S3 · Fila recta (nublado): el auto 1 frena, el 10 (Eli) se para

- Beats: 9 (y 19 de fondo) · ACELERADO ×2 · simT0 = 3 s · semilla 1 · 12 autos · carril abierto · dt 0.02 s · cálculo 80 ms
- Roles: `{"tapper":11,"eli":2,"behindEli":[1,0]}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S3.mono | El segundo frena un poco más fuerte que el primero; el tercero, más todavía (barras crecientes 1 → 10) | 0.50 · 0.51 · 0.56 · 0.64 · 0.73 · 0.86 · 1.04 · 1.34 · 1.86 · 2.20 m/s² | estrictamente creciente | PASA |
| S3.ten | Para el auto número diez: alto total (el 10 es el primero que se para) | primer auto parado: n.º 10; el 9 baja a 3.7 km/h | n.º 10 | PASA |
| S3.late | El segundo lo nota un instante tarde; en ese instante el hueco se achica | retraso 2.40 s (tiempo de reacción del modelo 1 s); hueco 10.25 → 8.00 m | retraso ≈ 1 s, hueco menor | PASA |
| S3.time | Duración del plano (del toque al alto del 10) | 27.0 s de sim = 13.5 s de video con ACELERADO ×2 | cabe en 1:37 → 1:53 (16 s) | PASA |

> S3.time: A velocidad real el alto llega a ~28 s: el guion dice "S3 a velocidad real"; usar el sello ACELERADO ×2.

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `tap_start` t = 1 s (t_sim 5 s) · auto 11
- `car2_reaction_window` t = 2.82 s (t_sim 8.64 s) · relojito de arena + regla
- inicios de frenado (12): n.º1@2.82s, n.º2@4.02s, n.º3@5.07s, n.º4@6.12s, n.º5@7.14s, n.º6@8.16s, n.º7@9.18s, n.º8@10.2s, n.º9@11.19s, n.º10@12.18s, n.º11@12.99s, n.º12@13.68s

## S3B_ELI · Beat 19 arriba: Eli maneja (se pega, frena hasta parar, todos detrás frenan)

- Beats: 19 · ACELERADO ×2 · simT0 = 8 s · semilla 1 · 15 autos · carril abierto · dt 0.02 s · cálculo 74 ms
- Roles: `{"tapper":11,"eli":5,"eliLeader":6,"behindEli":[4,3,2,1,0],"frontCar":14,"carsBehindTapper":[10,9,8,7,6,5]}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S19.top.stop | Arriba: Eli frena hasta parar | vel. mín. 0.0 km/h | < 1 km/h | PASA |
| S19.top.behind | Arriba: todos detrás frenan | 5 / 5 con luz de freno fuerte | todos | PASA |

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `tap_start` t = 1 s (t_sim 10 s) · auto 11 · el conductor toca el freno
- `tap_end` t = 5 s (t_sim 18 s) · auto 11
- `leader_brake_onset` t = 8.48 s (t_sim 24.96 s) · auto 6 · el auto de adelante frena
- `eli_brake_onset` t = 9.02 s (t_sim 26.04 s) · auto 5 · Eli frena
- `eli_hard_brake` t = 9.32 s (t_sim 26.64 s) · auto 5
- `eli_stop` t = 10.43 s (t_sim 28.86 s) · auto 5
- `eli_restart` t = 15.59 s (t_sim 39.18 s) · auto 5
- inicios de frenado (9): #3@6.62s, #4@7.52s, #5@8.48s, #6@9.02s, #7@9.62s, #8@10.22s, #9@10.79s, #10@11.39s, #11@12.02s

## S3B_MILA · Beat 19 abajo: Mila maneja (llega tarde, pasa sin detenerse, detrás nadie frena)

- Beats: 19 · ACELERADO ×2 · simT0 = 8 s · semilla 1 · 15 autos · carril abierto · dt 0.02 s · cálculo 81 ms
- Roles: `{"tapper":11,"eli":5,"eliLeader":6,"behindEli":[4,3,2,1,0],"frontCar":14,"carsBehindTapper":[10,9,8,7,6,5],"mila":5}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S19.bot.nostop | Abajo: Mila pasa sin detenerse | vel. mín. 29.1 km/h | > 20 km/h | PASA |
| S19.bot.behind | Abajo: detrás nadie frena | luz de freno máx. detrás 0.00 | 0 | PASA |
| S19.bot.late | El auto paciente llega tarde al embotellamiento (su punto más lento es después que el del auto de adelante) | de adelante: 19.2 s; Mila: 30.3 s tras el toque | Mila después | PASA |

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `tap_start` t = 1 s (t_sim 10 s) · auto 11 · el conductor toca el freno
- `tap_end` t = 5 s (t_sim 18 s) · auto 11
- `leader_brake_onset` t = 8.48 s (t_sim 24.96 s) · auto 6 · el auto de adelante frena
- inicios de frenado (3): #3@6.62s, #4@7.52s, #5@8.48s

## S4 · Inestabilidad de cadena: la misma joroba, cadena estable (arriba) vs inestable (abajo)

- Beats: 10 · ACELERADO ×2 · simT0 = 3 s · semilla 1 · 12 autos · carril abierto · dt 0.02 s · cálculo 110 ms

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S4.stable | Si la cadena es estable, el titubeo se va apagando mientras viaja hacia atrás | bache de velocidad por auto: 6.5 · 4.9 · 4.1 · 3.6 · 3.3 · 3.1 · 2.9 · 2.8 · 2.7 · 2.6 km/h | decreciente | PASA |
| S4.unstable | Si es inestable, cada conductor le suma un poquito | bache por auto: 6.5 · 6.7 · 7.2 · 8.1 · 9.2 · 10.6 · 12.4 · 14.7 · 17.9 · 22.4 km/h | creciente | PASA |

## S5_25 · Domo 314 m, 25 autos: los titubeos se apagan

- Beats: 12 · ACELERADO ×10 · simT0 = 0 s · semilla 33 · 25 autos · anillo 314 m · periódico · dt 0.05 s · cálculo 138 ms
- Roles: `{"L":314}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S5.25 | Con veinticinco autos, el tráfico fluyó (10 min de sim: ningún auto parado) | nadie se para; desv. de velocidad 0.31 m/s | nadie parado | PASA |
| S5.25d | Densidad | 0.080 /m | 0,080 (artículo) | PASA |

## S5_28 · Domo 314 m, 28 autos (los mismos 25 + 3, Eli uno de ellos): embotellamiento

- Beats: 12 · ACELERADO ×10 · simT0 = 0 s · semilla 33 · 28 autos · anillo 314 m · periódico · dt 0.05 s · cálculo 116 ms
- Roles: `{"L":314,"added":[9,18,27],"eli":18}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S5.28 | Con veintiocho o más: embotellamiento (se forma en el plano, ACELERADO ×10) | primer parado a 172.8 s de sim (17.3 s de video) | < 300 s de sim | PASA |
| S5.thr | Umbral de densidad entre 25 y 28 (criterio lineal de estabilidad del IDM) | hueco crítico 7.50 m → entre 26.2 autos; densidad crítica 0.08 /m | 25 < N* < 28; 0,08-0,09 /m | PASA |

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `first_stop` t = 17.275 s (t_sim 172.75 s) · aparece el embotellamiento

## S5_40 · Domo sobrellenado: 40 autos, con y sin auto paciente (no es magia)

- Beats: 19 · ACELERADO ×10 · simT0 = 0 s · semilla 33 · 40 autos · anillo 314 m · periódico · dt 0.05 s · cálculo 429 ms
- Roles: `{"L":314,"av":0}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S5.40 | Si la vía está simplemente repleta, ningún conductor puede absorber eso (40 autos: el auto paciente no mejora la velocidad) | vel. media sin 8.0 km/h, con 8.3 km/h (×1.03); con 25 autos 34.9 km/h | con/sin ≤ 1,05 y ≪ flujo de 25 | PASA |

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `first_stop` t = 4.05 s (t_sim 40.5 s) · aparece el embotellamiento

## S6 · Colina de noche: una ola viaja más de 10 km hacia atrás

- Beats: 13, Short · ACELERADO ×120 · simT0 = -180 s · semilla 1 · 1778 autos · anillo 40000 m · periódico · dt 0.1 s · cálculo 13435 ms
- Roles: `{"L":40000,"tapCar":1334,"tapX":30011.24859392576}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S6.speed | Una ola viaja hacia atrás a quince o veinte kilómetros por hora | -19.7 km/h | −15 a −21 km/h | PASA |
| S6.10km | Más de diez kilómetros | 10 km a los 32.7 min; recorrido total 12.4 km | ≥ 10 km | PASA |
| S6.clock | Reloj 0:00 → 0:30 en 10 km ("un frenazo de hace media hora") | 0:00 → 0:33 | 28-36 min | PASA |
| S6.stopgo | Es un embotellamiento de verdad (autos casi parados dentro de la ola) | vel. mín. dentro de la ola 0.0 km/h; flujo 55.3 km/h | < 15 km/h | PASA |

> S6.clock: El frente tarda unos minutos en formarse; la ola cubre 10 km en 32.7 min desde el frenazo: el reloj en pantalla debe decir 0:00 → 0:33 (o la marca de 10 km va donde esté la ola a los 30 min).

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `tap_start` t = 2 s (t_sim 60 s) · auto 1334 · el frenazo de hace media hora
- `wave_10km` t = 18.35 s (t_sim 2022 s) · la ola ya recorrió 10 km hacia atrás

## S7 · Anillo EE. UU.: 20 cierra-huecos + 1 auto paciente (FollowerStopper) que se activa con la ola ya formada

- Beats: 14-16, Short · ACELERADO ×4 · simT0 = 240 s · semilla 14 · 21 autos · anillo 260 m · periódico · dt 0.05 s · cálculo 232 ms
- Roles: `{"L":260,"av":0}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S7.wave | Antes del control hay ola (stop-and-go) | hasta 9 autos parados a la vez; desv. 3.74 m/s | ≥ 3 parados | PASA |
| S7.melt | La ola se derritió (en ~1-2 vueltas del auto paciente) | 53.3 s tras activar = 0.7 vueltas | ≤ 3 vueltas | PASA |
| S7.std | Los cambios de velocidad bajaron cerca de un 80 % (artículo: −80,8 %) | −88.4 % | −60 a −95 % | PASA |
| S7.hb | Los frenazos fuertes casi desaparecieron (decel. > 1 m/s²; artículo 8,58 → 0,12 por veh·km) | 8.14 → 0.00 por veh·km (−100.0 %) | ≥ −90 % | PASA |
| S7.fuel | Hasta un cuarenta por ciento menos de gasolina (artículo: −42,5 % en el mejor tramo) | índice de gasolina −30.8 % (modelo de potencia simple) | −15 a −50 % (misma dirección) | PASA |
| S7.one | Todo eso, con un solo auto de veintiuno | 1 controlado / 21 | 1 / 21 | PASA |
| S7.safe | Sin choques | 1.38 m | > 0,3 m | PASA |

> S7.fuel: El −40 % en pantalla es del artículo; nuestro índice es indicativo.

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `control_on` t = 15 s (t_sim 300 s) · auto 0 · se activa la computadora
- `wave_melted` t = 28.313 s (t_sim 353.25 s) · la ola se derritió

## S8 · La perilla: el auto paciente un poquito más rápido que el promedio (+7 %): la ola vuelve; al bajarla, se apaga

- Beats: 17 · ACELERADO ×4 · simT0 = 560 s · semilla 14 · 21 autos · anillo 260 m · periódico · dt 0.05 s · cálculo 357 ms
- Roles: `{"L":260,"av":0}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S8.back | Programaron la computadora un poquito más rápido que el promedio: la ola volvió | desv. 0.40 → 3.35 m/s; grupo rojo a los 51.0 s de sim (12.8 s de video) | desv. ×2 o más | PASA |
| S8.off | Al regresar la aguja al promedio, se apaga | desv. 3.35 → 0.38 m/s | ≤ la mitad | PASA |

> S8.back: Modelo: con un objetivo por encima de lo que el tráfico puede ir, el auto queda pegado al de adelante y lo persigue (misma ley que los humanos). No es emergente del FollowerStopper en nuestro anillo.

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `knob_up` t = 10 s (t_sim 600 s) · auto 0 · clic: perilla arriba (+7 %)
- `wave_back` t = 22.75 s (t_sim 651 s) · vuelve a formarse un grupo rojo
- `knob_down` t = 40 s (t_sim 720 s) · auto 0 · clic: perilla abajo (promedio)

## S9 · Mila al volante: una persona paciente con un solo número (promedio de la vuelta anterior)

- Beats: 18 · ACELERADO ×4 · simT0 = 240 s · semilla 14 · 21 autos · anillo 260 m · periódico · dt 0.05 s · cálculo 224 ms
- Roles: `{"L":260,"av":0,"mila":0}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S9.half | Los cambios de velocidad bajaron casi a la mitad (artículo: −49,5 %) | −55.3 % | −30 a −70 % | PASA |
| S9.fuel | La gasolina, más o menos una quinta parte (artículo: −22,1 %) | índice −43.1 % | −5 a −50 % (misma dirección) | PASA |
| S9.notgone | La ola se reduce, sin desaparecer del todo (menos que con la computadora) | computadora −88.4 %, Mila −55.3 %; desv. con Mila 1.67 m/s | Mila < computadora | PASA |

> S9.fuel: El −22 % en pantalla es del artículo; nuestro índice sale más alto que el de la computadora: no mostrar el índice del sim en este beat.

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `mila_takes_wheel` t = 15 s (t_sim 300 s) · auto 0 · el halo salta al auto teal: Mila maneja

## S10 · Autopista de 4 carriles (1 simulado): la ola pasa 2 activos → 4 apagados → varios activos

- Beats: 20-21 · ACELERADO ×6 · simT0 = 8 s · semilla 1 · 260 autos · carril abierto · dt 0.05 s · cálculo 586 ms
- Roles: `{"tap":257,"active":[227,221,132,130,128,126,124],"inactive":[187,181,175,169],"act1":[227,221],"act2":[132,130,128,126,124],"front":259,"penetration":0.04230769230769231}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S10.a1 | Pasan dos autos inteligentes, y se achica | bache 9.1 → 2.4 km/h | baja | PASA |
| S10.in | Pasan cuatro con el sistema apagado, y crece | bache 2.8 → 3.1 km/h (y crece desde los activos: 2.4 → 3.8) | sube | PASA |
| S10.a2 | Pasan más autos inteligentes, y se achica otra vez | bache 3.8 → 3.2 km/h | baja | PASA |
| S10.pen | Pocos autos inteligentes entre cientos | 11 de 260 en el carril simulado (4.2 %; ~1.1 % si se dibuja como 4 carriles) | ~1-2 % visibles | PASA |

Eventos clave (t = segundos de video, t_sim = segundos de simulación):


## S11 · Carretera dorada: el mismo toque, Eli deja el espacio y la ola muere

- Beats: 22-23, Short · ACELERADO ×3 · simT0 = 7 s · semilla 1 · 30 autos · carril abierto · dt 0.02 s · cálculo 85 ms
- Roles: `{"tapper":26,"eli":20,"eliLeader":21,"behindEli":"[20 autos]","frontCar":29,"carsBehindTapper":[25,24,23,22,21,20]}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| S11.same | Repetición exacta de S1 delante de Eli (mismo toque, mismo instante) | diferencia máx. de desplazamiento 9.2e-5 m (registro float32) | < 1 mm | PASA |
| S11.nobrake | Detrás de Eli, NINGUNA luz de freno se enciende (los 20 autos de atrás, toda la corrida de 90 s) | luz máx. 0.00 (fórmula del kit: se enciende si a < −0,25 m/s²); deceleración máx. detrás 0.19 m/s² | luz = 0 | PASA |
| S11.nostop | El auto de Eli baja suave, sin detenerse | vel. mín. de Eli 29.1 km/h (de 30.0); decel. máx. 0.03 m/s² | > 20 km/h y < 0,3 m/s² | PASA |
| S11.wave | La cascada sí llega al auto de adelante (igual que en el gancho) | el de adelante baja a 16.9 km/h | < 22 km/h | PASA |
| S11.gap | El hueco: "uno seguro, no uno enorme"; el resorte se encoge y se vuelve a estirar | hueco de crucero 34 m (4.1 s a 30 km/h), mínimo 8.8 m | mín. > 2 m | PASA |

> S11.gap: Con conductores inestables detrás, el hueco tiene que tragarse casi todo el bache: 30 m (3,6 s) es lo mínimo que encontramos con cero luces de freno.

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `tap_start` t = 1 s (t_sim 10 s) · auto 26 · el conductor toca el freno
- `tap_end` t = 3.667 s (t_sim 18 s) · auto 26
- `leader_brake_onset` t = 5.987 s (t_sim 24.96 s) · auto 21 · el auto de adelante frena
- `eli_gap_min` t = 9.407 s (t_sim 35.22 s) · auto 20 · el resorte del hueco se encoge al máximo
- inicios de frenado (3): #3@4.747s, #4@5.347s, #5@5.987s

## TOLL · Peaje nublado: llegan más autos de los que la caseta atiende; el hueco de Eli no arregla nada (y se le meten)

- Beats: 19 · ACELERADO ×4 · simT0 = 0 s · semilla 21 · 60 autos · carril abierto · dt 0.05 s · cálculo 380 ms
- Roles: `{"eli":12,"booth":25}`

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| TOLL.grow | Cola larga: llegan más autos de los que la caseta atiende (la cola crece) | autos en cola a 60 s: 29, a 140 s: 42 (llegan ~1909.8 veh/h, la caseta atiende ~720) | crece | PASA |
| TOLL.patience | Esto no lo arregla nadie con paciencia: con Eli dejando un hueco, la caseta atiende los mismos autos | atendidos en 140 s: 11 sin hueco, 11 con hueco; cola 42 vs 42 | con hueco ≤ sin hueco | PASA |

Eventos clave (t = segundos de video, t_sim = segundos de simulación):

- `eli_leaves_gap` t = 5 s (t_sim 20 s) · Eli deja un espacio enorme en la cola (variante paciente)

## SH · Short 9:16: recortes de S1, S2, S6, S7, S11 con sus sellos ACELERADO

- Beats: Short · ACELERADO ×1 · simT0 = 0 s · semilla — · 0 autos · dt — s · cálculo 3 ms

| | Afirmación (guion) | Medido en el sim | Objetivo | |
|---|---|---|---|---|
| SH.tap | "Alguien tocó el freno, apenas, y cada auto de atrás frenó un poco más fuerte" (S1) | S1.mono pasa | pasa | PASA |
| SH.wave | "Va hacia atrás, a unos veinte kilómetros por hora" (S6, la colina de noche) | -19.7 km/h | ≈ −20 (15-21) | PASA |
| SH.brakes | "Los frenazos casi desaparecieron" (S7) | S7.hb pasa | pasa | PASA |
| SH.nobody | "Nadie detrás de ti lo va a notar" (S11: ninguna luz de freno detrás de Eli) | S11.nobrake pasa | pasa | PASA |

| Short (s) | Fuente | t0 en la fuente (video) | Sello | Nota |
|---|---|---|---|---|
| 0-1.3 | S1 | 6.15 | ACELERADO ×3 | cuadro 0 en plena ruptura; frenazo de Eli |
| 4.6-10.6 | S1 | 0.60 | ACELERADO ×3 | rebobinado al toque (0:01) y cascada hasta Eli |
| 10.6-18.3 | S6 | 2.00 | ACELERADO ×120 | la mancha roja se aleja hacia atrás |
| 22.5-31.2 | S7 | 30.00 | ACELERADO ×4 | auto con halo; las luces se apagan |
| 31.2-36.2 | S11 | 4.99 | ACELERADO ×3 | la ola muere frente a Eli; nadie detrás frena |
