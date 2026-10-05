# Animatic de SecondQuest: cómo se hace, paso a paso

Qué se usa para entregar al Productor cada bloque de animatic: programas, scripts y archivos.
El animatic es un borrador de planificación. El vídeo final lo hace el motor (Remotion) después.

## 0. Dónde corre todo

- En un servidor en la nube (Linux), en la sesión de Claude Code. El teléfono del Productor solo ve el chat y los
  archivos que se le envían; no procesa nada.
- Repositorio: `chatgpt-skills/secondquest`, rama `claude/secondquest-pilot-hook-4yw8xj` (GitHub).

## 1. Material de partida

| Qué | Archivo |
|---|---|
| Guion aprobado (nunca se edita) | `docs/ep002/starter_pack_v2/10_SecondQuest_EP002_SCRIPT_v3_APPROVED.txt`, `episodes/ep002/script.json` |
| Narración de Bram | `public/episodes/ep002/audio/narration.wav` |
| Tiempo de cada palabra | `episodes/ep002/timings.json` |
| Arte de personajes (Higgsfield) | `public/art/core/quest/`, `docs/art_orders/quest/library_v2/results/`, `docs/art_orders/pixie/library/results/`, `docs/art_orders/quest/ep002_tv/results/` |
| Fondos | `public/art/core/backgrounds/` (cuarto, salón) |

Los tiempos por palabra salen de **faster-whisper** (reconocimiento de voz):
`scripts/ep002-bram-assemble.py` y `scripts/ep002-bram-qc.py`.

## 2. Objetos 3D (gratis, hechos por Claude)

- Modelos: `tools/props3d/scene.ts` (TypeScript + **three.js**). N64, cartucho, mando, TV de tubo, ocarina, espada,
  Trifuerza, castillo, bomba, boomerang, caballo provisional, consola tipo Switch 2.
- Render: `tools/props3d/render.py`. Pasos: **esbuild** empaqueta el código, **Chromium** sin pantalla
  (`/opt/pw-browsers/…`) dibuja el 3D y **OpenCV** añade el contorno de tinta del estilo 2D.
- Uso: `python3 tools/props3d/render.py <trabajo>` (por ejemplo `horse`, `horse_rear`, `pad_profile`, `crt`, `castle`).
- Salida: PNG transparentes en `public/art/ep002/props3d/`.

## 3. Kit de animatic (Python 3.11)

Librerías: **Pillow (PIL)** para dibujar, **NumPy** para el cálculo de imágenes e **imageio-ffmpeg**, que trae
**ffmpeg** para montar el vídeo.

| Archivo | Para qué |
|---|---|
| `scripts/animatic/lib.py` | Base común: 1280×720 a 24 fps, `T('l59.w3')` (segundo exacto de una palabra), cámara y recorte, personajes, fondos provisionales, subtítulos de revisión estilo Shorts del EP001 |
| `scripts/animatic/hud.py` | HUD del juego: corazones, barra de magia, rupias, botones B/A/C |
| `scripts/animatic/icons.py` | Icono de cámara (se repite cuando el guion habla de la cámara) y llave inglesa |
| `tools/fx/fairy.py` | Navi (el hada) |
| `tools/fx/pad_swap_q008.py` | Pone el mando N64 3D en las manos del Quest de perfil (archivo derivado; el original no se toca) |
| `scripts/animatic/framing_qc.py` | Control de encuadre: hoja de revisión |

## 4. Un script por bloque

| Bloque | Script |
|---|---|
| Secuencia 01 (cartucho) | `scripts/ep002-cartridge-animatic.py` |
| B | `scripts/ep002-blockB-animatic.py` |
| C | `scripts/ep002-blockC-animatic.py` |
| D | `scripts/ep002-blockD-animatic.py` |
| E | `scripts/ep002-blockE-animatic.py` |
| F (elegida: Hyrule) | `scripts/ep002-blockF-B-animatic.py` (opción A, cuaderno: `scripts/ep002-blockF-animatic.py`) |
| G | `scripts/ep002-blockG-animatic.py` |
| H | `scripts/ep002-blockH-animatic.py` |
| I | `scripts/ep002-blockI-animatic.py` |
| J | `scripts/ep002-blockJ-animatic.py` |
| K | `scripts/ep002-blockK-animatic.py` |
| L | `scripts/ep002-blockL-animatic.py` |
| M | `scripts/ep002-blockM-animatic.py` |
| N | `scripts/ep002-blockN-animatic.py` |
| O | `scripts/ep002-blockO-animatic.py` |
| P | `scripts/ep002-blockP-animatic.py` |
| Q | `scripts/ep002-blockQ-animatic.py` |
| R | `scripts/ep002-blockR-animatic.py` |
| S (elegida: opción A, motor del remake) | `scripts/ep002-blockS-A-animatic.py` (v1, plano técnico: `scripts/ep002-blockS-animatic.py`) |
| T (elegida: opción B, el encuentro en el camino) | `scripts/ep002-blockT-animatic.py` |

Cómo funciona cada script:
1. Fija los momentos clave con `T()` según las palabras de Bram.
2. Para cada fotograma, `render(t)` dibuja por capas: fondo, personajes, objetos 3D, efectos (brillos, apagado de
   la TV, reflejo...), HUD, Navi, etiqueta de planificación y subtítulo.
3. Envía los fotogramas a **ffmpeg** (vídeo H.264 y audio AAC con ese tramo de la narración), que crea
   `docs/ep002/EP002_blockX_animatic_vN.mp4`.
4. Guarda fotos fijas `docs/ep002/blockX_vN_*.jpg`.

Uso: `python3 scripts/ep002-blockH-animatic.py` (vídeo) o `python3 scripts/ep002-blockH-animatic.py --stills` (solo fotos).

## 5. Antes de enviar

1. Control de encuadre (regla del Productor):
   `python3 scripts/animatic/framing_qc.py scripts/ep002-blockH-animatic.py`. Crea
   `docs/ep002/ep002-blockH-animatic_framing.jpg`: un cuadro cada 0.5 s, con zonas seguras y franja de subtítulos.
   Se revisa y se informa al Productor.
2. Las decisiones se apuntan en `docs/ep002/PRODUCER_DECISIONS.md`.
3. **git**: commit y push a la rama.
4. Se envía al Productor solo el clip del bloque, no el vídeo completo, hasta que el animatic esté terminado.

## 6. Solo si hace falta arte nuevo

1. Cotizar y pedir aprobación: `tools/credits/credits.py` (pasos `lint`, `quote`, `approve` con las palabras del
   Productor, `spend`). Queda en `docs/credits/ledger.json`.
2. Generar en **Higgsfield**, modelo **gpt_image_2_5**, con el elemento **Quest-v1-6ref**, siguiendo
   `docs/QUEST_V1_PROMPT_SPEC.md` (Pixie: `docs/characters/PIXIE_V1_PROMPT_SPEC.md`).
3. Control de calidad en un `QC.md` junto a la imagen. Los defectos se informan siempre.

## 7. Lo que NO se usa en el animatic

- **El motor Remotion** (React/TypeScript, el del EP001). Solo para el vídeo final, cuando el animatic esté aprobado.
- **Efectos de sonido y música.** En el animatic solo va la voz de Bram.
- **Subtítulos quemados en el final.** Los del animatic son solo para revisar y editar.
