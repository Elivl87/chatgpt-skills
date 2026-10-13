# Tiny Systems / Pequeños Sistemas · README del canal (para abrir en una sesión nueva)

Este documento es todo lo que una sesión nueva de Claude necesita para crear y llevar el segundo canal de YouTube
del Productor (Eli) **sin depender de la sesión de SecondQuest**. Léelo entero antes de hacer nada.

> **Arranque rápido (pegar en la sesión nueva):**
> "Lee `newchannel/README.md` y `newchannel/CLAUDE.md`. Eres el cerebro de Tiny Systems: director creativo,
> productor y ejecutor, autónomo y 100 % gratis. Retoma el estado de la sección 11 y sigue."

---

## 1 · Qué es el canal

- **Concepto aprobado por el Productor (2026-10-12):** "Tiny Systems / Pequeños Sistemas". Claude y sus agentes lo
  diseñan y lo llevan con libertad: concepto, marca, logo, wordmark, guiones, sonido, duración.
- **Formato:** cada vídeo responde UNA pregunta "¿por qué pasa esto?" con una **simulación programada para ese
  vídeo** (por qué un atasco aparece de la nada, por qué la otra fila avanza más rápido, cómo se propaga un rumor, por
  qué las ciudades crecen en círculos). El espectador ve el sistema "romperse" y después lo entiende.
- **Duración:** 6-8 min el vídeo largo; de cada simulación sale un Short de 40-60 s.
- **Idiomas:** EN primero + versión ES-419 (menos competencia en español).
- **Ventaja:** el arte es código. Cada vídeo es un experimento original: imposible de copiar o de plantillar.
- **Coste por vídeo:** 0 créditos, 0 dinero.

## 2 · Quién decide qué

| Decide el Productor | Decide y ejecuta Claude (autónomo, informa en cada hito) |
|---|---|
| El nombre del canal (entre las opciones de Claude) | Todo lo demás: investigación, guion, simulación, arte, voz, sonido, montaje, QC, empaquetado |
| El paquete de cada vídeo: tema + guion + título + miniatura (elige entre alternativas; después queda BLOQUEADO) | Mejoras gratis que suban la calidad: se aplican sin preguntar y se listan en el informe |
| Publicar (Claude deja el vídeo listo; el Productor sube o aprueba la subida) | Reparto de trabajo entre agentes, orden, ritmo |

- **Nunca se gasta dinero ni créditos** en este canal. Si algo solo se puede hacer pagando, no se hace: se busca la
  alternativa gratis o se informa.
- **Autonomía (regla del Productor):** no te pares a preguntar lo que puedes decidir tú. Encadena el trabajo. Si un
  agente se atasca más de unos minutos, revisa por qué y continúalo tú o pásalo a otro agente: "nada puede quedarse
  parado". Pregunta solo lo que es del Productor (tabla de arriba).
- **Responde al Productor siempre en español.** Los documentos de trabajo pueden ir en inglés.

## 3 · Reglas fijas (no se rompen)

1. **Todo gratis y con licencia permisiva** (MIT, Apache-2.0, BSD, CC0, OFL). Cada recurso de terceros se apunta en
   `LICENSES.md` (qué, de dónde, licencia, URL). Nada NC (no comercial), nada AGPL/GPL copiado dentro de nuestro código.
2. **Nada de propiedad intelectual ajena:** ni marcas, ni logos, ni capturas, ni música, ni clips de terceros.
3. **Voz propia del canal**, de un modelo abierto con licencia comercial. **Nunca clonar la voz de una persona real.**
4. **Política de YouTube (desde el 15-07-2025, "contenido no auténtico"):** nada producido en masa ni plantillado. La
   marca y el formato pueden repetirse, pero **cada vídeo necesita tesis propia, guion real, visuales originales y
   estructura variada**. Nada de diapositivas con texto ni vídeos idénticos con texto cambiado. Ritmo de publicación
   moderado. Marcar "contenido alterado o sintético" cuando YouTube lo pida.
5. **Calidad espectacular, cero errores, que el espectador quiera seguir viendo.** Nunca se entrega algo con un
   defecto conocido; los defectos se informan, nunca se presentan como aceptables.
6. **Verificar antes de dar algo por terminado:** mirar los fotogramas (hoja de contactos), medir sonido, pasar QC.
7. **Datos verificados:** cada cifra o afirmación del guion con su fuente; si no se puede verificar, se reformula o se
   quita. Nada de personas reales retratadas.
8. **El guion bloqueado se usa palabra por palabra.** Cualquier cambio posterior se propone al Productor.
9. **Commit y push de todo** en la rama de trabajo (ver sección 9). Los vídeos > 30 MB van por Release (sección 9).

## 4 · Herramientas (todas gratis)

| Para qué | Herramienta | Licencia | Notas |
|---|---|---|---|
| Simulación | **numpy**, **Mesa** (agentes), **pymunk** (física 2D) | BSD / Apache-2.0 / MIT | Una simulación nueva por vídeo, con semilla fija (determinista) |
| Dibujo | **Pillow**, **skia-python**, numpy | HPND / BSD | Estilo de marca: 3 tintas + papel + halftone + grano |
| Motor de vídeo | **Hyperframes** (heygen, HTML/CSS/GSAP → MP4 en Chromium sin GPU) | Apache-2.0 | Plantilla probada en `secondquest/tools/hyperframes_ep003` (se puede copiar la estructura) |
| Diagramas/matemáticas | **Manim Community** (+ manim_skill) | MIT | Solo para segmentos de diagrama |
| Arte generativo | p5.js (skill `algorithmic-art`), skill `canvas-design` | Apache-2.0 | Interludios, miniaturas, marca |
| Marca | brand-identity-skill (fatihaydost) | MIT | Leer SKILL.md y scripts antes de usar; la decisión final es de Claude |
| Tipografías | Google Fonts | OFL | Iconos: Tabler / Lucide / Phosphor (MIT/ISC) |
| Voz EN + ES | **Kokoro** (hexgrad, 82M) | Apache-2.0 | Corre en CPU; tiene español (`e`). Opcional: Chatterbox Nano (MIT, lleva marca de agua Perth) |
| Música en código | **mido / pretty_midi + FluidSynth + FluidR3_GM** (SoundFont), music21, síntesis numpy | MIT / LGPL (binario aparte) / MIT / BSD | Motivo sonoro propio del canal; las simulaciones "suenan" (cada evento = un tic musical) |
| Efectos de sonido | Sintetizados por nosotros (numpy) + packs CC0 (Kenney) | CC0 | Apuntar cada archivo en `LICENSES.md` |
| Subtítulos / tiempos | faster-whisper (palabra a palabra) | MIT | Alinear guion ↔ audio; Shorts con subtítulos quemados |
| Audio/vídeo | ffmpeg (el de Hyperframes: `HYPERFRAMES_FFMPEG_PATH`) | LGPL | Loudness −14 LUFS, pico ≤ −1 dBTP |
| QC de ritmo | `secondquest/scripts/style_bible.py` + `pacing_qc.py` | nuestro | Mide cortes/min, plano medio, movimiento, quietud |
| Acabado | `secondquest/scripts/animatic/finish.py` | nuestro | Grano de papel, viñeta, halftone en sombras (adaptar a la paleta del canal) |
| Analítica | `secondquest/scripts/retention_read.py` | nuestro | Lee el CSV de retención de YouTube Studio |
| Navegador | Chromium preinstalado (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`) | — | No ejecutar `playwright install` |

**Bloqueado (no usar nunca):** código de lygia/Shadertoy (NC), modelos NetLogo (casi todos NC), F5-TTS y Coqui XTTS
(NC), OpenMoji (share-alike), código AGPL como copia (OpenMontage, klaket…), Depth Anything Base/Large (NC), Edge TTS
(endpoint no licenciado), pipelines "faceless" de stock/IA en masa, cualquier API de pago.

## 5 · Los agentes (equipo de Claude)

Claude es el director: reparte, revisa y decide. Cada agente trabaja en segundo plano con un encargo preciso
(entrada, salida, criterio de calidad) y devuelve un informe. Claude revisa lo entregado mirando los archivos.

| Agente | Hace | Entrega |
|---|---|---|
| **Explorador** | Busca temas: preguntas con curiosidad real, outliers (vistas ÷ mediana del canal) en temas parecidos, qué se busca | `ep/<n>/TOPICS.md` (5 candidatos, 1 recomendado) |
| **Verificador** | Comprueba cada dato con fuentes primarias | `ep/<n>/FACTS.md` (dato → fuente → estado) |
| **Guionista** | Guion EN con gancho que termina en la pregunta; cada concepto se explica antes de usarse; versión ES-419 | `ep/<n>/SCRIPT_EN.md`, `SCRIPT_ES419.md` |
| **Simulador** | Programa la simulación (determinista, con semilla) y sus momentos clave ("se rompe", "se entiende") | `ep/<n>/sim/` + clips de prueba |
| **Director de arte** | Escenas en el estilo de marca, mapa de ritmo, transiciones, miniatura | `ep/<n>/SHOT_PLAN.md`, plantillas |
| **Voz** | Narración con la voz del canal, tiempos por palabra | `ep/<n>/audio/narration.wav` + `timings.json` |
| **Sonido** | Motivo musical, sonificación de la simulación, efectos, mezcla a −14 LUFS | `ep/<n>/audio/mix.wav` |
| **Montaje/Render** | Bloques en Hyperframes, cada movimiento atado a palabras de la narración, acabado | `ep/<n>/renders/` |
| **QC** | Hoja de contactos, encuadre, ritmo, sonido, errores; bloquea la entrega si algo falla | `ep/<n>/QC.md` |
| **Empaquetado** | Títulos (3), miniaturas (3 para Test & Compare), descripción, capítulos, subtítulos EN/ES, Short | `ep/<n>/publish/` |
| **Analista** | A las 48 h y a los 7 días: CTR, retención a 30 s, fuentes de tráfico → una mejora para el siguiente | `ep/<n>/ANALYTICS.md` |

Cómo encargar: brief completo (contexto, reglas de la sección 3, archivos de entrada, entregables exactos, criterio de
calidad, límites de máquina, cómo hacer commit), en segundo plano, y seguir trabajando mientras tanto. Agentes que
tocan los mismos archivos no trabajan a la vez.

## 6 · Pipeline de cada vídeo

1. **Tema** (Explorador): 5 preguntas candidatas → Claude recomienda una.
2. **Datos** (Verificador): todo con fuente.
3. **Guion** (Guionista): EN + ES-419, 6-8 min. Gancho de 20-40 s que muestra la simulación rota y termina en la
   pregunta + aparición del wordmark (el punto mascota aterriza en la "i") + 1 s de silencio.
4. **Paquete al Productor:** tema + guion + 3 títulos + 3 miniaturas. Elige → queda BLOQUEADO.
5. **Simulación** (Simulador) y **plan de planos** (Director de arte) en paralelo.
6. **Voz** con el guion bloqueado → tiempos por palabra.
7. **Animatic** en baja (854x480) con todo atado a palabras → QC de ritmo (`pacing_qc.py` debe pasar).
8. **Sonido**: motivo, sonificación, efectos, mezcla −14 LUFS.
9. **Render final** 1080p (o 1440p si la máquina lo permite) + acabado → QC final (hoja de contactos, loudness,
   negro/congelado/silencio).
10. **Entrega** al Productor: revisión 480p en el chat, final por Release; paquete de publicación; Short (vertical,
    subtítulos EN quemados); versión ES-419 (voz ES + subtítulos).
11. **Analítica** a las 48 h y 7 días → una mejora concreta para el siguiente vídeo.

## 7 · Estándares de calidad (aprendidos en SecondQuest)

- **Ritmo:** ningún plano > ~4 s sin un cambio; ≥ 12 cortes/min; plano medio ≤ 5 s; mapa de picos y descansos;
  callbacks; cada gag con anticipación, golpe, pausa, reacción.
- **Cámara que respira:** empuje lento 2-3 %, deriva ≤ 1,5 %, cada plano con su fase; movimientos grandes solo cuando el
  guion los pide. Nunca reiniciar el encuadre entre dos planos con el mismo fondo.
- **Todo atado a la narración** (palabras, no segundos escritos a mano).
- **La mascota** (el punto con carita) tiene su arco en cada vídeo e interactúa con el wordmark en el gancho y al final.
- **Encuadre:** todo lo importante dentro de la zona segura; nada tapa caras ni datos clave.
- **Sonido:** efectos audibles en un móvil (~7 dB bajo la voz), repeticiones variadas, sin música de stock; master
  −14 LUFS, pico ≤ −1 dBTP.
- **Legible en móvil:** textos grandes, 1-3 palabras en miniaturas, cara/sujeto claro a 168x94 px.
- **Sin subtítulos quemados en el vídeo largo** (van como .srt EN/ES); los Shorts sí los llevan.
- **Miniaturas:** un sujeto claro que paga el gancho, emoción o contraste extremo, 1-3 palabras, alto contraste; 3
  variantes para Test & Compare (misma escena, cambia el mensaje).
- **Títulos:** curiosidad + palabra buscable; el texto de la miniatura no repite el título.

## 8 · Estructura de carpetas

```
newchannel/
  README.md            este documento
  CLAUDE.md            reglas cortas que la sesión carga sola
  CONCEPTS_v1.md       los tres conceptos (A aprobado)
  NAME_CHECK.md        comprobación de nombre (en preparación)
  LICENSES.md          registro de cada recurso de terceros
  PRODUCER_DECISIONS.md  cada decisión del Productor, con fecha y sus palabras
  brand/               logo, wordmark, paleta, tipografías, icono, banner, BRAND.md
  pilot/               temas, guion EN/ES, prueba de simulación
  engine/              código común: estilo, simulaciones base, acabado, mezcla, QC
  ep/<NNN>/            un vídeo: TOPICS, FACTS, SCRIPT, sim/, audio/, renders/, publish/, QC.md, ANALYTICS.md
```

## 9 · Máquina, repositorio y entregas

- **Repositorio:** `elivl87/chatgpt-skills`, carpeta `newchannel/`. Rama de trabajo actual:
  `claude/secondquest-pilot-hook-4yw8xj` (si la sesión nueva tiene otra rama asignada, usar esa y avisar).
- **Commit y push siempre** (`git add` de rutas concretas, nunca un vídeo que se está escribiendo). Push:
  `git push -u origin <rama>`, reintentar si falla la red. El hook de parada exige que no quede nada sin subir.
- **Máquina en la nube:** 4 CPU, **sin GPU**, disco justo (~1-2 GB libres): borrar los temporales propios, nunca
  arte. `rm` con variables de shell está bloqueado: usar rutas literales. Renders largos en segundo plano con log.
  Si la máquina se reinicia, los procesos en marcha mueren: comprobar el estado, limpiar archivos a medias y relanzar.
- **Entregas:** archivos ≤ 30 MB se envían en el chat. Más grandes: Release en borrador con
  `.github/workflows/publish-file.yml` (las partes van DENTRO de una carpeta `deliver/` en la rama temporal
  `deliver/<tag>`, con su `.sha256`; tag `deliver-<nombre>`); `cleanup-deliveries.yml` las borra a los 7 días.
- **Nunca pedir al Productor contraseñas, tokens ni claves.** Si algo necesita una credencial, se busca otro camino.
- **Código descargado = no confiable:** cada descarga en su propia carpeta vacía, Python con `-I`, leer antes de usar.
- **Panel de agentes** (opcional): el artefacto "Sala de Agentes" de SecondQuest
  (https://claude.ai/artifact/FLVZLpp3mogQhTqdPkLvM4) se puede reutilizar con su base de datos
  (`agents/<id>`, `status/now`) o duplicarse para este canal.

## 10 · Lecciones de SecondQuest que aplican aquí

- El gancho debe pagar en los primeros 5 s lo que promete la miniatura.
- Un CTR alto no sirve si nadie ve el vídeo: al principio la búsqueda es la puerta (títulos con lo que la gente escribe)
  y hay que sembrar el vídeo fuera de YouTube (comunidades del tema).
- El 40 % de la audiencia de SecondQuest venía en español: ES-419 desde el primer día.
- Un agente que espera sin avanzar es tiempo perdido: vigilar y relevar.
- Los archivos que se escriben en vivo (renders) no se suben hasta que terminan.
- Medir antes de entregar (estilo, ritmo, loudness, hoja de contactos) evitó todos los reenvíos.

## 11 · Estado actual (2026-10-13) y siguientes pasos

- Hecho: concepto A aprobado; investigación de herramientas (`secondquest/docs/research/2026-10-12_*`, sobre todo
  `SCOUT_SYNTHESIS_v2.md` §3 y `github_scout_new_channel.md`).
- **Arranque detenido el 2026-10-13 por orden del Productor** ("aquí no hagas nada más que no sea SecondQuest"): se
  continúa en la sesión nueva. Ya hecho: `NAME_CHECK.md`, fuentes en `brand/fonts/`, `engine/style.py` (inicio).
  Falta:
  1. `NAME_CHECK.md`: disponibilidad de Tiny Systems / Pequeños Sistemas y alternativas, con recomendación.
  2. `brand/`: logo (el punto), wordmark (la "i" con el punto vivo), paleta de 3 tintas + papel, tipografías OFL,
     icono, banner, expresiones de la mascota.
  3. `pilot/`: 5 temas, uno recomendado, guion completo EN + ES-419.
  4. `pilot/sim_test.mp4`: prueba de 20 s del estilo.
- Pendiente del Productor: elegir el **nombre** y el **tema del piloto** (y aprobar su guion).
- Después: elegir la voz del canal (Kokoro EN/ES, pruebas A/B al Productor antes de usarla), motivo sonoro, motor
  común en `engine/`, piloto completo, Short, ES-419, crear el canal (lo hace el Productor) y publicar.
