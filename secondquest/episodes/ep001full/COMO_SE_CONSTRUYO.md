# SecondQuest EP001: cómo se construyó el preview completo

Este documento explica cómo se usaron el guion, el audio, las imágenes y la UI con el **SecondQuest Production Engine V3** para producir `secondquest_ep001_FULL_PREVIEW_v1.mp4`, y cómo interactúan entre sí.

La idea clave: **el motor no "monta un vídeo", interpreta datos**. Todo el episodio son archivos JSON que el motor lee. El guion genera el audio, el audio genera los tiempos, y los tiempos mueven las imágenes.

```
Narration Master v2 ──► script.json ──► Kokoro (am_michael 1.00) ──► narration.wav + timings.json
                                                                           │
Production Map v1.1 ──► scenes.json (M01–M46, anclado a los cues) ◄────────┘
                               │
asset_map_full.json ──► assets.json ──► archivos PNG en public/
                               │
                         Remotion (Engine V3) ──► render ──► master.ts (−14 LUFS) ──► MP4
```

---

## 1. El guion (Narration Master EN v2)

- **Fuente única de lo que se dice:** `narration_master_en_v2.txt` / `.json`. Comprobé que ambos archivos son idénticos entre sí antes de usarlos.
- Se convirtió en `episodes/ep001full/script.json`: **244 líneas**, una por cada línea de texto del Master, con ids `l01` … `l244`.
  - No se reescribió, resumió ni añadió nada.
  - Verificación automática: el texto unido de las 244 líneas es idéntico al del Master (1.331 palabras).
- **Acto 1** (`l01`–`l19`) coincide palabra por palabra con el guion del hook aprobado, así que el hook se pudo reutilizar sin cambios.
- `script.json` también guarda:
  - **los actos**: qué rango de líneas ocupa cada acto (ACT 1 → ACT 11 + M46);
  - **`pauseAfter`**: la pausa después de cada línea.
    - Salto de línea del Master = respiración corta (0,15 s).
    - Línea en blanco = pausa de párrafo (0,45 s).
    - Cambio de acto = 1,0 s.
    - Remates cómicos = pausa algo más larga (0,5–0,7 s), para que el chiste respire.

**Interacción:** el guion es el punto de partida de todo. Cada línea recibe un id, y ese id es lo que después usan las imágenes, la UI y los efectos para saber cuándo aparecer.

---

## 2. El audio de narración (Kokoro local)

- Generado con la herramienta del motor `tools/tts/placeholder_narration.py`, con los ajustes oficiales de `shared/production.json`:
  - Kokoro local (`kokoro-v1.0.int8.onnx` + `voices-v1.0.bin`), sin APIs de pago;
  - voz **am_michael**, velocidad **1.00**, en-us.
- Cada línea se sintetiza por separado, se recortan los silencios y se une todo con las pausas de `script.json`. El resultado:
  - `public/episodes/ep001_farming/audio/full/narration.wav` (la pista de voz);
  - `episodes/ep001full/timings.json`: el **inicio y fin exacto de cada una de las 244 líneas** (los *cues*).
- Duración real:
  - **8:20 de voz pura**;
  - **10:12 de pista** con las pausas;
  - **10:14 de vídeo** al sumar el cierre de M46.

  No se forzó la voz para llegar a 9:32.
- Los primeros 45,5 s son **idénticos bit a bit** al audio del hook aprobado, porque Kokoro es determinista con el mismo texto y la misma voz.

**Interacción:** `timings.json` es el "reloj" del episodio. Nada en el vídeo usa segundos fijos: todo se ancla a un cue (`l37`, `l103.end`, `l240+0.4`…). Si mañana se cambia la voz por una grabación real, basta con regenerar `timings.json` y todo el montaje se re-sincroniza solo.

---

## 3. La estructura visual (Production Map v1.1 → scenes.json)

- `SecondQuest_EP001_Full_Production_Map_v1_1.json` define **M01–M46**: el orden, el acto, la intención visual y las asset keys de cada composición maestra.
- Sus tiempos (0:45, 0:59, …) se tomaron como **guía editorial**. Los tiempos finales salen de la narración: cada composición empieza en la línea del guion que le corresponde.
- Se tradujo a `episodes/ep001full/scenes.json`:
  - **s01–s15:** el hook aprobado (FINAL_ART_v2), copiado tal cual.
  - **m16a … m46_cta:** **145 planos nuevos** para M16–M46. Cada composición maestra se divide en varios planos, uno por beat de la narración.

    Por ejemplo, M21 tiene 16 planos: cultivar → plantar → crecer → cosechar → vender → banco → máquina → "faster" → "brain happy"…
- En total son **160 escenas**. Transiciones:
  - 136 cortes secos, para el ritmo de comedia;
  - 15 fundidos, en cambios de acto y momentos reflexivos;
  - 5 *dips*, 3 *whips* y 1 *flash*.
- Cada escena define:
  - `start`: un cue, por ejemplo `"l44-0.08"`, que arranca 0,08 s antes de que se diga la línea 44;
  - `camera`: *push-in*, *pull-out*, *pan*, *punch* o *move_to*, sin repetir siempre el mismo movimiento (evita el "slideshow"). Los momentos lentos (Acto 9) usan movimientos lentos y lineales;
  - `layers`: fondos, personajes, props, UI y luces, con sus animaciones;
  - `sfx`: efectos anclados a cues.

**Interacción:** la escena "escucha" la narración. Por ejemplo, en M17 el cartel "LOAN APPROVED" aparece exactamente en `l25` ("a loan."), y el contador de deuda arranca en `l30` ("Your fantasy is agricultural debt.").

---

## 4. Las imágenes (asset_map_full.json → assets.json → PNG)

Ruta obligatoria: **composición maestra → asset key → archivo** (`asset_map_full.json`). Nunca por parecido.

### 4.1 Assets del hook (Quest, Wallet, Progress, tractores, fondos del hook)
- Se usaron los archivos del **hook FINAL_ART_v2 aprobado**, que ya estaban en `public/`.
- La carpeta `engine_ready/` de la Full Library contiene los mismos archivos de la Master Library v1, que en la auditoría de v2 tenían muchos recortes erróneos. Por eso se mantuvieron los aprobados.

### 4.2 Paneles recuperados del storyboard (RECOVERED_PANEL)
Son ilustraciones 2D planas recortadas de los storyboards anteriores, de solo **130–330 px**. Para cada uno:

1. **Limpieza:** detección automática del área de imagen y eliminación de cabeceras, timecodes, barras de "NARRATION" y bordes del collage.
   - Se revisó visualmente cada uno, y cinco se recortaron a mano (router, green elephant, cabina lenta, cabina relajada, real vs simulator).
2. **Escalado local:** Real-ESRGAN anime x4 + x2 (ncnn, CPU), sin generar arte nuevo.
3. **Uso según su forma** (en total, 64 placas en `public/episodes/ep001_farming/full/`):
   - **Fondo 16:9 completo** si el recorte lo permite: la cámara hace pan, push o zoom sobre la composición.
   - **Tarjeta enmarcada**, si el recorte es pequeño o cuadrado: marco crema y sombra, sobre un fondo desenfocado de la misma ilustración. Por ejemplo START SMALL, IMPROVE, REPEAT, el manual o la fábrica sobre ruedas.
4. No se separó ningún personaje de estos paneles: un recorte destructivo se vería mal. Se animan como composición completa.

### 4.3 Catálogo
- `episodes/ep001full/assets.json` registra cada placa como `full.<nombre>`, con su tipo (fondo u objeto), su proporción y su anclaje.
- Las escenas solo mencionan estos ids; el motor resuelve el archivo.

### 4.4 Cobertura
- 114 asset keys en el Production Map:
  - 88 usadas según el mapa;
  - 18 con sustitución documentada;
  - 7 hechas como UI programática;
  - 1 sin arte: la princesa.
- El detalle está en `SecondQuest_EP001_Full_Integration_Report_v1.md`.

**Interacción:** el catálogo separa "qué se ve" de "dónde está el archivo". Si mañana llega arte final para una clave, por ejemplo la princesa o las máquinas, basta con dejar el PNG en su ruta y volver a renderizar, sin tocar las escenas.

---

## 5. UI programática (construida en Remotion, no son imágenes)

La UI se hizo con las capas del motor (`text`, `counter`, `progress`, `rect`, `stamp`, `wordmark`), así que es nítida a cualquier resolución y se anima con la narración:

- **contadores:** deuda del préstamo, banco, emails 203 → 348, precio por tonelada;
- **barras de progreso:** "Work that makes sense", "Dirt removed", la tarea al 72 %, "Progress you can see";
- **checklists:** las 3 cosas que cambian, las reglas de la simulación;
- **chips y etiquetas:** reuniones, notificaciones, WEATHER / ECONOMICS…, PHYSICAL / EXPENSIVE / RISKY;
- **elementos de juego:** LOAD SAVE y el menú de partidas, LEVEL UP, la cadena de producción, el cartel QUEST FARM, los sellos de rechazo (callback del hook);
- **M46:** la tarjeta de comentario "What game deserves a “why?” next?", la barra "Add a comment…" y NEXT QUEST ?, sobre el atardecer con Quest y el wordmark.

Cada elemento tiene `show` / `hide` y animaciones anclados a cues. Por ejemplo, cada notificación de M38 aparece justo cuando la voz dice "Messages", "Notifications", "Shorts"…

---

## 6. Música y SFX

- **Jerarquía:** narración > SFX > música, con los valores aprobados de V3:
  - música base a **0,35**;
  - la música baja a **0,27** cuando hay voz;
  - con SFX baja a **0,62**;
  - ataque 0,15 s y liberación 0,6 s.
- **Ducking:** el motor analiza los cues de `timings.json` para saber cuándo hay voz y baja la música automáticamente. No hay volúmenes escritos a mano.
- **Música** (4 cues en `episode.json`):
  - hook: *bed* y *sunset* originales, sin cambios;
  - `bed_main`: la base continúa del Acto 2 al 11 (en bucle);
  - `sunset_end`: el tema cálido del atardecer, en bucle, bajo el final y M46.

  Son los placeholders del motor y hay que sustituirlos por música con licencia para el master.
- **SFX:** 208 eventos de la librería aprobada del hook (notify, money, ui_complete, impact, stamp, buzzer, tractor, rumble, wind, crickets, chime…).
  - Se pusieron solo en beats con sentido, anclados a cues.
  - Algunos remates se dejan en silencio a propósito.
- **Mastering:** `scripts/master.ts` del motor normaliza a **−14,2 LUFS** con pico **−1,6 dBTP**, sin clipping.

---

## 7. Por qué hay un episodio `ep001full` separado del hook `ep001`

- `ep001` tiene el hook aprobado **y** la versión en español. El validador del motor exige que el guion en español tenga las mismas líneas que el inglés.
- Ampliar `ep001` a 244 líneas habría obligado a escribir guion en español, que no estaba pedido.
- Por eso el episodio completo es una entrada de datos aparte, `episodes/ep001full`:
  - registrada en `src/episodes/index.ts`, igual que hace `npm run new:episode`;
  - comparte la carpeta de arte `public/episodes/ep001_farming/`;
  - no cambia nada del motor ni del hook.

---

## 8. Cómo reproducirlo

```bash
cd secondquest
npm run validate -- ep001full                       # comprueba guion, cues, assets, escenas
npm run stills   -- ep001full full                  # fotogramas de revisión por escena
npm run render   -- ep001full full --version FULL_PREVIEW_v1   # render + mastering → renders/
```

**Nube:** GitHub → Actions → "SecondQuest render":
- episode `ep001full`;
- cut `full`;
- locale `en`.

Publica el MP4 como Release descargable.

### Archivos clave
| Archivo | Papel |
|---|---|
| `episodes/ep001full/script.json` | Guion (Master v2, literal) + actos + pausas |
| `episodes/ep001full/timings.json` | Cues reales de cada línea (el reloj del episodio) |
| `public/episodes/ep001_farming/audio/full/narration.wav` | Voz am_michael 1.00 |
| `episodes/ep001full/scenes.json` | 160 escenas: hook + M16–M46, cámara, capas, UI, SFX |
| `episodes/ep001full/assets.json` | asset key → archivo (hook + 64 placas recuperadas) |
| `episodes/ep001full/episode.json` | Formato, narración, música y ducking, cut `full` |
| `public/episodes/ep001_farming/full/` | Placas recuperadas limpias y escaladas |
| `SecondQuest_EP001_Full_Integration_Report_v1.md` | Cobertura, sustituciones, audio, problemas pendientes |
