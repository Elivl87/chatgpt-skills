# Guardián de Eli y Mila · bloque E2 v5 (cierre sin etiqueta) · 2026-10-28

**Veredicto: PASS** (0 defectos) sobre `blockE2_review.mp4` 1280x720 (70,72 s, 2122 fotogramas), renderizado con el kit
tal como está en `HEAD` (piel de Eli `#905a38`, la misma de los bloques A-E1 del piloto; ver nota de continuidad).

**Cómo se hizo este pase.** El agente `guardian-eli-mila` no se pudo lanzar como subagente desde esta sesión (no hay
herramienta para crear subagentes aquí). El pase se hizo siguiendo su especificación (`.claude/agents/guardian-eli-mila.md`)
por el editor, y queda marcado así para que el coordinador decida si quiere además el pase independiente.

## Qué cambió en E2

Solo el final: la parada de bus K01-K07 (y sus ayudantes `buses`, `duo`, `watch`, `cards`, `endShot`, `A.busStop`, `P.bus`)
se quitó. La escena del título al atardecer de J04-J06 se sostiene 20 s tras el lema (K01_hold … K06_fade, una sola cámara
continua), con actuación de reposo. Los planos H01-J05 no cambiaron (PASS v4).

## Automáticos (720p)

| Chequeo | Resultado |
|---|---|
| `body_audit.sh E2` → ojos (`faces_check.py`) | 82 fotogramas clave con Eli / Mila · pupilas 196 OK · **0 fallos** · 16 cerrados (parpadeo / risa declarada) · 4 en fundido |
| cuerpo (`body_check.py`) | **0 fallos**, 0 avisos |
| ropa (`clothes_check.py`) | 158 dibujos · **0 fallos** |
| `pop_check.py` (cada fotograma) | 22 eventos, todos vistos: 18 son los mismos de v4 en H03-J03 (parpadeos, rueda / fondo, ya aceptados); 4 nuevos en K01_hold = las letras y el lema deslizándose al subir la composición (movimiento suave, no un salto de personaje) |
| `face_cross_check.py` | **0** cruces de color ajeno sobre una cara |
| `textbox_check.mjs --blocks E2` | 2 líneas («¿…Quién fue?», «Fuiste tú.»), **0 fallos** |
| `pacing_qc` | PASS (cortes 19,5/min, plano más largo detectado 19,7 s ≤ 25: la espera es una toma continua a propósito; movimiento 0,76); FLAG informativo de ppm (silencio de 5 s + cierre sin voz) |

Primera pasada: 3 «fallos» de ojos de Mila a 70,22 / 70,60 s = el fundido a negro final oscurecía las pupilas. Arreglo:
el fundido se declara (`fade: true` en K06_fade) y `faces_audit.mjs` no muestrea dentro de un fundido declarado, igual que
ya hacía con los fundidos encadenados. No es un defecto del personaje.

## A ojo (recortes de cabeza a pies de cada muestra J04-K05, y fotogramas a 1080p de K01-K05)

- **Cabello / gorro:** coleta y lazo de Mila correctos; la coleta se mece con la brisa (`drag`) sin líneas sueltas; gorro de
  Eli tejido, puño y color correctos.
- **Cara:** pupilas presentes y legibles en cada muestra con ojos abiertos; mirada motivada (se miran, miran al valle,
  sonríen a cámara); expresiones que se leen: feliz, Mila con sonrisa de suficiencia al cruzar los brazos, risa en J06.
- **Cuerpo / manos:** Eli 0,95 / Mila 1,08 sobre la «l» y la «M»; pies apoyados en las letras con sombra de contacto; el
  balanceo de Eli sobre los talones dobla las rodillas sin despegar los pies; brazos cruzados de Mila y mano en la cadera
  de Eli sin atravesar el cuerpo; transiciones de pose de 0,4 s (sin saltos).
- **Ropa:** delantal, camiseta, jeans y botas de Eli; suéter morado, overol mostaza y botas verdes de Mila, colores exactos.
- **Encuadre:** al subir y achicarse la composición, nadie queda cortado; la mitad de abajo queda libre para las tarjetas
  de YouTube; ningún cuadro de texto ni guía cubre a nadie.
- **Continuidad:** sin gafete (M1); el punto bermellón queda en la «i»; misma luz de atardecer que J04-J06.

## Nota de continuidad (importante para el coordinador)

Mientras se hacía este trabajo, otro agente aplicó en el árbol de trabajo (sin commit) la decisión del Productor del
2026-10-29 «Eli con la piel de Mila» (`art/lib/cast_alts.js` `ELI_SKIN = '#d9a66c'`, luego confirmado en el commit 52e9b66). Un primer render de E2 la tomó y
dejaba a Eli con otra piel solo en el final del piloto. **E2 se volvió a renderizar con los archivos del kit de `HEAD`**
(copia en el scratchpad), así que todo el piloto v4.2 tiene la misma piel. Cuando el cambio de piel se confirme habrá que
volver a renderizar los 8 bloques juntos.

Evidencia: `GUARDIAN_REPORT_animatic_v5_E2_small.jpg` (recortes J04-K05), `qc/faces_blockE2_small.jpg`, `qc/pop_E2_small.jpg`,
`qc/faces_E2_after.json`, `qc/body_E2.json`, `qc/clothes_E2.json`, `qc/pop_E2.json`, `qc/facecross_E2.json`.
