# SecondQuest EP001: paquete de publicación de YouTube

**Vídeo:** `secondquest_ep001_V3_CLEAN_BRAM_FINAL` (1080p30, 9:45, en inglés, voz de Bram)
**Archivos de este paquete** (`docs/publish/EP001/`):
- `EP001_subtitles_en.srt`: subtítulos en inglés, 255 bloques.
- `EP001_subtitles_es.srt`: subtítulos en español, 257 bloques.
- `EP001_chapters.txt`: capítulos.
- Este documento.

Los subtítulos y los capítulos se generan con `python3 scripts/ep001-publish.py` a partir del guion aprobado y de los tiempos reales de la narración.

---

## 1. Título: dos versiones para probar con Test & Compare

Reglas aplicadas:
- **YouTube:** palabras clave al principio, porque a veces solo se ve una parte del título; idealmente unos 50–60 caracteres.
- **Paddy Galloway:** algo familiar con un giro inesperado, que genere curiosidad.
- **MrBeast:** el título y la miniatura se piensan juntos y no repiten la misma idea.

| | Título | Caracteres | Para qué |
|---|---|---|---|
| **A** | Farming Simulator: Why Millions Play a Game About Work | 54 | Búsqueda: "Farming Simulator" va primero, más el giro de "about work" |
| **B** | Farming Simulator Is Just Work… So Why Is It So Fun? | 52 | Curiosidad: la contradicción más directa y extrema |
| C (respaldo) | Why Do Millions of People Play a Game About Farming? | 52 | El título original del episodio |

**Cómo usarlos:** publica con el **A** y activa Test & Compare con el **B** (YouTube Studio en computador → Detalles → *A/B Testing*). YouTube elige al ganador por tiempo de visualización, en unos días a dos semanas.

## 2. Descripción (copiar y pegar en YouTube)

Las dos primeras líneas son las que se ven en la búsqueda y bajo el vídeo, así que llevan la palabra clave y el gancho.

```
Farming Simulator is a game about… going to work. So why do millions of people play it for fun?

Farming Simulator is a game where you wake up, go to work, make money, buy extremely expensive equipment… and go back to work. There are no dragons. No gunfights. No princess to save. And yet millions of people spend their evenings planting crops and getting genuinely excited about a bigger tractor.

So… why?

In this episode of SecondQuest we look at what Farming Simulator is really selling: progress you can see, problems you can solve, a world you can understand, and work you chose to do.

Chapters
0:00 Intro: a game about… work?
0:41 A very strange fantasy
1:26 Everything has a purpose
2:20 The loop
3:01 Chores are fun (somehow)
4:08 Control
5:01 The machines
6:00 The farm becomes yours
6:39 Why slow can feel good
7:32 Why not farm for real?
8:17 The real reason
9:34 Your next quest

What game deserves a "why?" next? Tell me in the comments. Maybe that's our next quest.

SecondQuest explains why we love the games we play.

#FarmingSimulator #GamingExplained #SecondQuest
```

## 3. Etiquetas (tags)

```
farming simulator, farming simulator 25, why do people play farming simulator, farming simulator explained, why is farming simulator fun, simulation games, cozy games, game psychology, why we play games, video essay, gaming video essay, progression systems, game design, tractors, SecondQuest
```

## 4. Subtítulos en YouTube Studio

1. Ve a **Subtítulos → Agregar idioma → Inglés → Subir archivo → Con tiempos** y sube `EP001_subtitles_en.srt`.
2. Repite con **Español** y `EP001_subtitles_es.srt`.

Con los dos, el vídeo llega también al público hispano, y los subtítulos exactos ayudan al SEO.

## 5. Otros ajustes recomendados

| Ajuste | Valor |
|---|---|
| Idioma del vídeo | Inglés |
| Categoría | Gaming |
| ¿Contenido creado para niños? | No |
| Contenido alterado o sintético | Sí: voz e imágenes generadas con IA. YouTube pide declararlo cuando el contenido parece realista; en estilo cartoon no siempre es obligatorio, pero declararlo es lo más seguro. |
| Pantalla final (últimos 5–20 s) | Suscribirse + vídeo recomendado. El cierre de M46 (9:34–9:45) tiene espacio para ponerla. |

## 6. Miniatura (thumbnail): 3 variantes para Test & Compare

**Reglas aplicadas**, de la ayuda oficial de YouTube, MrBeast y la guía en español:
- **Formato:** 1280x720, diseño simple, regla de tercios, legible en el teléfono.
- **Personaje:** una cara expresiva, Quest_v1 con su sudadera roja.
- **Texto:** como máximo 3 palabras, en negrita con sombra, con colores de alto contraste.
- **El texto complementa al título, no lo repite.**

**Escena base de las tres** (para que la prueba mida solo el mensaje): Quest sentado en un tractor verde enorme, en un campo dorado al atardecer, mirando a cámara.

| Variante | Expresión de Quest | Texto | Idea |
|---|---|---|---|
| **1** | Cansado e incrédulo ("¿en serio?") | **THIS IS FUN?** | Contradicción, sin repetir "work" del título A |
| **2** | Muy emocionado, brazos arriba | **BEST DAY EVER** | Ironía: el mejor día… trabajando el campo |
| **3** | Asombrado, señalando el tractor | **$500,000 TRACTOR** | Lo extremo (MrBeast: "cuanto más extremo, mejor") |

**Generación:** se genera la imagen sin texto en Higgsfield (gpt_image_2_5, 16:9, con referencias de cara de Quest_v1), a unos **0,5–1 crédito por imagen**, con un máximo de 2 intentos por imagen. El texto se pone después, de forma programática, con la tipografía del canal; así queda nítido y se puede cambiar gratis.

**Publicado el 2026-10-02:** https://youtu.be/l9f1i0mNt1I. Subtítulos en inglés y en español, título y descripción en español, pantalla final de 9:36 a 9:46, sin estreno.

**Decisión final (2026-10-02):**
- Se publica con la miniatura **3** ("$500,000 TRACTOR") y el título **A**.
- La 1 ("THIS IS FUN?") y la 2 ("BEST DAY EVER") quedan para Test & Compare; el título B, también.
- Los archivos están en `thumbnails/`.

## Short (published 2026-10-03)

- **File:** `renders/secondquest_ep001_short_v2.mp4`, 1080x1920, 40.8 s (the hook, s01–s15).
- **Title:** Farming Simulator is just… work? 🚜
- **Description:** "Why do millions of people play a game about going to work? Full episode on the channel." followed by `#FarmingSimulator #FS25 #FarmingSimulator25 #SecondQuest`.
- **Related video:** EP001.

## 7. Resultados y mejora para el siguiente episodio (revisado el 2026-10-07)

Fuente: YouTube Studio, del 2 al 6 de octubre de 2026 (capturas del Producer). Los porcentajes de retención están leídos a ojo del gráfico y son aproximados.

| Métrica | Valor |
|---|---|
| Visualizaciones | 593 |
| Impresiones de la miniatura | 2.735 |
| CTR de impresiones | 3,5 % |
| Duración media | 1:48 (de 9:46) |
| Porcentaje medio visto | 18,6 % |
| Tiempo de visualización | 3,7 h |
| Suscriptores | 0 |

**Curva de visualizaciones:** casi plana el día 0; sube entre el día 1 y el 3,5 (el Short salió el día 1); se aplana en unas 590 desde el día 4.

**Tráfico:** 95,9 % de *Browse* (recomendaciones de Inicio), 2,4 % de búsqueda y 1,0 % del canal. El análisis completo, con fuentes de tráfico y Shorts, está en `ANALYTICS_D5.md` (rama `claude/secondquest-pilot-hook-4yw8xj`).

**Retención de la audiencia:**

| Momento | Siguen viendo | En el video |
|---|---|---|
| 0:00 | 100 % | Quest dormido: "Farming Simulator is a game where you wake up…" |
| ~0:12 | ~80 % | "…the thing video games were invented to help us escape from." |
| 0:15–0:25 | cae a ~45 % | "There are no dragons. No gunfights. No princess to save…" |
| 0:30 | ~40 % | |
| 1:10 | ~27 % | |
| 3:15 | ~20 % | |
| 5:00 | ~12 % | Primera vez que salen los tractores ("Tractors are cool", 5:07) |
| 9:46 | ~12–15 % | Pequeña subida en la pantalla final |

Después del primer minuto la curva baja suave: el cuerpo del episodio funciona y el problema está en la entrada.

**Causas probables:**
1. **Promesa de la miniatura incumplida:** la miniatura 3 dice "$500,000 TRACTOR", pero el video nunca da esa cifra y los tractores no aparecen hasta el 5:01.
2. **Intro lenta:** empieza con Quest durmiendo y una lista de lo que el juego *no* tiene. La pregunta real ("why do millions…") no llega hasta ~0:25.

**La mejora para EP002 (regla "mejora algo cada vez"):** arreglar los primeros 30 segundos.
- Lo más llamativo, y lo que muestre la miniatura, aparece en los primeros 5 segundos.
- La pregunta del episodio se plantea antes del segundo 10.
- La miniatura no promete nada que el video no cumpla, y lo cumple pronto.
- **Objetivo medible:** más del 60 % de retención a los 30 segundos (EP001: ~40 %).
