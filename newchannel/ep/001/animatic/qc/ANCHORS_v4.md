# Ep 001 · Anclas del animatic re-apuntadas para el guion v4 · 2026-10-23

El guion v4 (`ep/001/SCRIPT_ES419.md`, aprobado y bloqueado por Claude el 2026-10-23) aplica P1-P14 y los recortes de nivel A
de `SCRIPT_AUDIT_NARRADOR.md`. Cada plano del animatic arranca en una palabra (`A.at(word, n, { beat })`, `anim.js`); si la
palabra desaparece o cambia de orden, la línea de tiempo rechaza el plano. Esta tabla recoge **cada ancla tocada** y la prueba
en seco de los 8 bloques.

## 1 · Anclas re-apuntadas (11) y su motivo

| Bloque · plano / uso | Antes (v3) | Después (v4) | Propuesta | Por qué esa palabra |
|---|---|---|---|---|
| C1 · `t1` del bloque (fin) + ambiente | `No`#1 beat 11 | `El`#1 beat 11 | P1 | El beat 11 ahora abre con "El embotellamiento no es…"; «no» sigue existiendo (sería un arranque 0,6 s tarde, no un error): se apunta a la primera palabra de verdad. |
| C2 · `t0` del bloque + ambiente (`music_light`, `wind_grass`) | `No`#1 beat 11 | `El`#1 beat 11 | P1 | Ídem. |
| C1 · `C07_no` (Eli ve venir las barras) | 1.er «no» de Eli − 0,22 s | `Eli`#1 beat 09 (narrador) − 0,1 s | P7 | El marco nuevo "Eli va en el diez:" nombra a Eli: el plano sobre él abre con su nombre y la cita cae dentro. Ancla sugerida por la auditoría. |
| C2 · `D15_densidad` (`tLos12`) | `los`#2 beat 12 ("los ingenieros") − 0,1 s | `densidad`#1 beat 12 − 0,3 s | P13 | "los ingenieros le dicen" se quita; `los`#2 pasaría a ser "los titubeos" (plano equivocado). La lámina DENSIDAD sigue en `densidad`. |
| C2 · `D21_halfhour` (`tEn13`) | `en`#2 beat 13 ("en el que") − 0,1 s | `pudo`#1 beat 13 − 0,1 s | P2 | "en el que estás ahora mismo" va ahora **antes** de los nombres regionales: anclado en `en`#2 cortaría las tarjetas de `D20_names`. Las cuatro tarjetas siguen cambiando en `embotellamiento` / `trancón` / `taco` / `tráfico` (anclas conservadas). |
| C2 · `D22_farm` (`tEse`) | `Ese`#2 beat 13 ("Ese conductor") | `Ese`#1 beat 13 | P2 | "ese embotellamiento" → "el embotellamiento": "Ese conductor" pasa a ser el primer «Ese». Sin cambio: `Ese`#2 ya no existiría → error. |
| C2 · `D22_farm` (fin del zoom) | `Seguro` | `casa` − 0,1 s | P3 | El zoom a la ventana termina cuando se dice "casa". |
| C2 · `D23_dinner` (inicio) | `Seguro` − 0,1 s | `casa` − 0,1 s | P3 | La auditoría proponía `casa`(fin) + 0,3 s; con "Seguro ya está cenando" fuera, ese plano duraría **0,15 s** hasta "Por eso". La ventana abre en "casa" (1,8 s). |
| C2 · `D23_dinner` tenedor + cue `cutlery` | `Seguro` + 0,4 s | `casa`(fin) + 0,2 s | P3 | El tenedor sube justo después de la palabra. |
| C2 · `D24_finger` (inicio) | `Por`#2 beat 13 ("Por eso") − 0,1 s | `ninguna`#1 beat 13 − 0,1 s | P3 | Deja respirar la ventana (1,8 s) y Eli baja el dedo sobre "ninguna razón: la razón…" (`D25_bite` sigue en `razón`#2). |
| E2 · acotación del guion ↔ `H03_back` … `J03` | gafete vuelve al pecho | gafete en la guantera (ver §3) | M1 | No es un ancla de palabra, pero es el otro cambio de la lista de planos. |

Anclas que las propuestas tocan y **sobreviven sin cambio** (verificadas una por una en `timings_es_v4_provisional.json`):
`Vamos` (P14), `El`#2/#4/#5, `En`#1, `Para`, `alto`, `total` (beat 09, P7: el "el" nuevo cae después del 5.º y antes de "Para
el auto", que no se usa); `Los`#2, `Es`#2/#3, `Un`#3, `ola`#3, `entran`, `salen`, `van`, `queda`, `nadie`, `pero`, `entera`
(beat 11, P1); `a`#2, `veinte`, `y`, `los`, `avanzan`, `atrás`, `Más`, `bicicleta` (beat 08, P11); `Ahora`, `Ahí`, `O`#2,
`a`#2, `diez`, `embotellamiento`, `trancón`, `taco`, `tráfico`, `pudo`, `media`, `casa`, `Por`#2, `razón`#2, `cenar`,
`Ni`/`perdón` (beat 13, P2/P3/P11); `Por`#1/#2, `densidad`, `crecen`, `Lo`, `tramo`, `El`, `con`, `Con`#2/#3, `Tres`,
`embotellamiento`, `Quién`/`f` (beat 12, P13); `En`#1, `manejo`, `Los`#2, `Por`#1/#2, `El`#2, `Ojo`, `Si`, `ningún`,
`llegar`, `Yo`/`todo` (beat 19, P12); `noviembre`, `Nashville`, `equipo`, `cien`, `con`, `inteligente`, `programa`,
`acelerar`, `frenar`, `resultado`, `complicado`, `Cien`#2, `gota`, `borraron`, `tampoco`, `hacerlo` (beat 20, P4); `Maneja`,
`velocidad`, `tráfico`, `gustaría`, `llegas`, `misma`, `mismo`, `menos`, `frenazos`, `tú` (beat 22, P5); `Eli` (narrador),
`espacio`, `Mismo`#1/#2, `freno`, `Solo`, `Quién`/`fue`, `Fuiste`/`tú` (beat 23, P6); `Qué` beat 04, `Dale`/`dale`/`Nooo`
beat 21 (P8: las tres líneas siguen en los tiempos como palabras `voiced: false` con su `slot` de lectura; los cuadros de
texto y los planos A16, G13, G15 no cambian; sus ids de línea `b04_07_eli`, `b21_47_eli`, `b21_49_eli` siguen iguales).

Ids de línea: v4 **no** cambia el número de segmentos (el marco "Eli va en el diez:" va dentro del mismo segmento de
narración que "El tercero…"; las tres líneas `[solo cuadro]` siguen siendo segmentos, con `voiced: false` en
`script_parse.py`), así que `A.LINES` (`anim.js`) y el `say: { b17_33_eli … }` de D2 siguen válidos cuando llegue la voz nueva.

## 2 · Prueba en seco (sin render de video)

- `audio/timings_es_v4_provisional.json`: el texto v4 re-cronometrado sobre la toma actual (Chatterbox 8:31): las palabras
  iguales conservan su tiempo 1:1 (desplazadas por lo quitado/añadido antes), las quitadas restan su tramo, las nuevas
  entran a 0,42 s por palabra (144 ppm). 1089 → 1078 palabras; la narración termina 4,0 s antes (487,4 s de inicio de la
  pantalla final → **≈ 8:27** con los 20 s; v3: 8:31). **Solo sirve para esta prueba**; `timings_es.json` no se tocó y la
  voz nueva lo sustituirá. (Método: `scratchpad/retime_v4.py` de la sesión; `difflib` por segmento.)
- `anim.js`: `A.load(src)` acepta `?timings=<ruta>` (opción de `K.stage`); sin ella sigue leyendo `../audio/timings_es.json`.
- Comando por bloque (una imagen fija del cuadro 0 + `events()` de la línea de tiempo, CPU mínima; otro agente renderizaba
  voces en paralelo): `node art/render/render.mjs --page ep/001/animatic/index.html --scene ep001_<B> --query
  "out=854x480&timings=../audio/timings_es_v4_provisional.json" --events ev_<B>.json --still 0 --png still_<B>.png`.

| Bloque | t0 → t1 (s) | Duración | Planos | Resultado |
|---|---|---|---|---|
| A | 0,00 → 46,21 | 46,21 | 21 | carga, 0 errores |
| B | 46,21 → 102,22 | 56,01 | 23 | carga, 0 errores |
| C1 | 102,22 → 149,91 | 47,69 | 15 | carga, 0 errores · `C07_no` 120,42-123,67 (abre en "Eli va en el diez:", 120,53) |
| C2 | 149,91 → 238,57 | 88,66 | 31 | carga, 0 errores · `D15_densidad` 199,72 (`densidad` 200,12) · `D20_names` 218,00-224,57 · `D21_halfhour` 224,57 (`pudo` 224,77) · `D22_farm` 227,80 (`Ese` 227,90) · `D23_dinner` 229,58-231,41 (`casa` 229,68; `cutlery` 230,14) · `D24_finger` 231,41 (`ninguna` 231,51) · `D25_bite` 233,29 |
| D1 | 238,57 → 306,01 | 67,44 | 24 | carga, 0 errores |
| D2 | 306,01 → 379,97 | 73,96 | 29 | carga, 0 errores |
| E1 | 379,97 → 434,44 | 54,47 | 20 | carga, 0 errores |
| E2 | 434,44 → 507,38 | 72,94 | 30 | carga, 0 errores · guantera: `clonc` 443,0 · `boink` 443,55 · `clonc` 444,65; sin gafete de `H03_back` (444,95) en adelante |

Los 8 bloques encajan sin huecos (`t1` de cada uno = `t0` del siguiente); total 507,4 s. **0 anclas sin palabra, 0 planos
sin duración.** Planos < 0,7 s: solo los que ya existían en v3 (B17 0,65, B23 0,68, D2 F04 0,70). Aviso de ritmo: con
`D21_halfhour` esperando a `pudo`, `D20_names` dura 6,6 s, pero cambia de tarjeta en cada nombre regional (219,2 · 223,1 ·
223,7 · 224,3 s); el hueco mayor sin cambio es 3,9 s, dentro de la regla. Volver a pasar `pacing_qc.py` con la voz real.

## 3 · Continuidad M1 · el gafete (bloque E2)

Guion (beats 22-24): el gafete "SI SE ABRE UN HUECO, CIÉRRALO" va a la guantera, la guantera lo escupe, Mila lo devuelve y la
cierra con la rodilla; Eli abandona su lema y deja el espacio. Animatic v3: tras el brinco el gafete volvía al pecho
(`badge: A.ramp(t, tKnee + 0.9)` en `H03_back`, `badge: 1` en `H04_breathe`, `H05_calm`, `I04_ease`, `I06_who`, `I07_you`,
`J03_calm` y un `P.gloveBadge` dibujado a mano en `I05_back`), y Mila lo señalaba en "Fuiste tú.".

Arreglo (opción a de la auditoría, la más clara: el gafete **se queda en la guantera**): `badge: 0` en los siete planos,
`gloveBadge` quitado de `I05_back`, el dedo de Mila en `I07_you` señala a él (misma pose corta). El guion v4 lo dice en la
acotación del beat 22 y 23. Clase nueva en `art/characters/leo_mila/GUARDIAN_LOG.md`: **continuidad de utilería guion →
pantalla**. Comprobación visual pendiente en el próximo render de E2 (con la voz nueva).

## 4 · Qué queda para cuando llegue la voz nueva

1. `script_parse.py` ya lee v4 (`[solo cuadro]` → `voiced: false`); regenerar segmentos → voz → `timings_es.json` real.
2. Correr los 8 bloques con los tiempos reales (`build_block.sh`), `pacing_qc.py`, `textbox_check.mjs --blocks`, Guardián
   (incluida la clase nueva: el gafete no vuelve).
3. Si la duración total pasa de 8:00 con el +4 % de tempo: nivel B de la auditoría (§4), por este orden: beat 6 "Una sola
   tarea:" (mover B07 de `Los` a `Una`), beat 15 "contando frenadas y arrancones" (E12), beat 20 "un programa que decide…"
   (G05). Decisión del director, no automática.
4. Borrar `timings_es_v4_provisional.json` cuando exista el real.
