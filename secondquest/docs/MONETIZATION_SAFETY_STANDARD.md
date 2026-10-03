# SecondQuest: estándar de monetización (YPP) v1

**Fecha:** 2026-10-03.
**Estado:** vinculante, como `PUBLISHING_STANDARD.md`.

**Decisiones del Producer (2026-10-03):**
- EP002 usa la **opción C** (§4).
- **M1–M9 aprobadas e implementadas:**
  - Código: `src/engine/originality.ts`.
  - Comando: `npm run originality`.
  - Configuración: `shared/originality.json`.
  - Registro de Quest: `docs/originality/quest_log.json`.
  - Metadatos por episodio: `docs/publish/<EP>/metadata.json`.
  - Los errores bloquean el render.
- La sección "Acerca de" del canal **no se actualiza** por ahora.

**Fuentes primarias**, leídas el 2026-10-03:
- Políticas de monetización de canales (https://support.google.com/youtube/answer/1311392).
- Requisitos del Programa de Socios (YPP) (https://support.google.com/youtube/answer/72851).
- Novedades del YPP 2027 (https://blog.youtube/news-and-events/youtube-partner-program-updates-2027-new-opportunities-earn/).
- Apelaciones (https://support.google.com/youtube/answer/9564590 y /1727191).
- Divulgación de IA (https://support.google.com/youtube/answer/14328491).
- Contenido para niños (https://support.google.com/youtube/answer/9528076).

Las declaraciones de YouTube vienen de la prensa (TechCrunch, Social Media Today, Search Engine Journal). Lo marcado **(sin verificar)** no tiene fuente primaria.

---

## 1. Lo que dice la política hoy

### 1.1 El estándar general (textual)

> "Your content should be original and authentic… Not be mass-produced, generic, repetitive, or manipulative."

### 1.2 Contenido genérico o repetitivo (sección actual desde julio de 2026)

**No permitido:**
- "Content that looks like it's made with a template, or that may feel repetitive to viewers after watching several videos in a row from the same channel."
- "Channels where content feels interchangeable from video to video."
- "Image slideshows… with minimal or no narrative, commentary, or educational value."
- "Videos where characters are put in the same situation over and over again with the same outcome."
- "AI-generated content made with generic or unoriginal templates giving the impression of mass production without adding the creator's original, authentic insights or perspective."

**Permitido:**
- "Same intro and outro for your videos, but the bulk of your content is different."
- "A series following a set of characters across episodes… in which each video has a distinct storyline, focus, or concept."

### 1.3 Contenido insatisfactorio, también permitido de forma explícita

> "Content that expresses your unique creative voice, like **using AI to visualize a unique character and narrative you invented**."

> "Using AI to edit your video scripts or generate a unique background visual for your content."

> "If you use automated tools or templates… the final product must still demonstrate your creative vision."

**Conclusión: usar IA no es el problema. Lo que se castiga es la uniformidad.** Quest como personaje original encaja casi textualmente en lo permitido.

### 1.4 Contenido reutilizado

- Se evalúa **por canal completo**: "monetization may be removed from your entire channel".
- Prohíbe leer o parafrasear materiales que no son tuyos, como wikis, reseñas o noticias.

### 1.5 Voz con IA

Ninguna fuente primaria la nombra, ni para permitirla ni para prohibirla. YouTube declaró en 2025 que "channels that use AI in their content remain eligible for monetization". El riesgo no es la voz de Bram; es combinar voz de IA con imágenes fijas sin narrativa.

---

## 2. Cómo se revisa un canal

**Qué revisan los revisores humanos (textual):**
- el tema principal;
- los vídeos más vistos;
- los vídeos más recientes;
- los que suman más tiempo de visualización;
- los metadatos (títulos, miniaturas, descripciones);
- la sección "Acerca de".

**Proceso:**
- **La decisión** tarda unas 4 semanas.
- **Tras un rechazo:** se puede apelar en 21 días o volver a solicitar a los 30 días; desde el segundo rechazo, a los 90.
- **Ya dentro del programa:** la revisión es continua. Ante un aviso de suspensión hay 7 días para enviar un vídeo de apelación.

**Umbrales hoy:**
- Ingresos por anuncios: 1.000 suscriptores y 4.000 horas de visualización en 12 meses.
- Nivel de "fans" (membresías, Super Thanks, Shopping): 500 suscriptores, 3 vídeos en 90 días y 3.000 horas.

### ⚠️ Cambio importante: 1 de febrero de 2027

- **Los canales nuevos que soliciten a partir de esa fecha necesitarán 8.000 horas** (o 20 millones de vistas de Shorts en 90 días).
- Los canales que ya estén dentro no se ven afectados.
- **Consecuencia para SecondQuest:** entrar antes del 1-feb-2027, con 4.000 horas, es la mitad de difícil. Es un objetivo con fecha.

---

## 3. Riesgo de SecondQuest, punto por punto

| Elemento | Riesgo | Por qué |
|---|---|---|
| Quest, mascota original con IA | **Bajo** | Es el ejemplo permitido literal |
| Guion propio, con ayuda de IA y aprobado por el Producer | **Bajo** | Permitido ("AI to edit your video scripts") |
| Misma entrada y cierre de marca | **Bajo** | Permitido si el cuerpo del vídeo cambia |
| Voz de Bram (voz de catálogo, no clonada) | **Bajo–medio** | No está prohibida. Junto a imágenes fijas sin narrativa se acerca al "slideshow" |
| Motor con plantillas JSON | **Medio** | El motor no es el problema; **un resultado que parezca intercambiable entre episodios sí lo es** |
| Shorts cortados del episodio | **Medio** | Son reutilización propia (bien), pero muchos iguales pesan en "vídeos recientes" |
| **Arte con IA de personajes de Nintendo** (Link, Zelda, Ganondorf, Navi, Epona, Trifuerza) | **Alto** | Ver la sección 4 |
| Logos o arte oficial en miniaturas | **Alto** | Política de marcas registradas ("likely to cause confusion") |
| Marcar el contenido como "para niños" | **Alto** | Activa reglas de calidad infantil ("mass production", "strange use of children's characters"). **SecondQuest es "No es para niños"** |

---

## 4. El riesgo de propiedad intelectual de Nintendo en EP002 (decisión del Producer)

El Producer aceptó el riesgo de propiedad intelectual de Nintendo. La investigación añade **un ángulo de monetización** que no estaba sobre la mesa:

1. Las pautas de Nintendo para creadores permiten usar **gameplay y capturas** con comentario. **No dan permiso** para dibujar personajes nuevos de Nintendo (https://www.nintendo.co.jp/networkservice_guideline/en/index.html). Nintendo puede retirar contenido a mano, sin Content ID.
2. YouTube (textual): "Videos with… visuals matching third-party content may contribute to monetization suspension on all your related accounts."
3. El canal más grande eliminado en la ola de enero de 2026 (CuentosFacinantes, unos 5,9 millones de suscriptores) era **arte con IA de propiedad intelectual ajena (Dragon Ball)** hecho en serie. SecondQuest no es contenido en serie, pero comparte el factor de "personajes ajenos generados con IA".

**Opciones para EP002** (la decisión es del Producer; el guion no se toca en ninguna):

| Opción | Qué cambia | Riesgo |
|---|---|---|
| **A. Mantener el plan actual** (referencias reconocibles: Héroe del Tiempo, Zelda, Ganondorf, Navi, Epona) | Nada | Alto, ya aceptado por el Producer. Ahora con riesgo también para la monetización del canal entero |
| **B. Evocar sin copiar** | Quest con un atuendo "de aventura" propio (túnica verde inspirada, no copia); un hada luminosa propia en vez de Navi exacta; una princesa y un villano con siluetas o diseños inspirados, no réplicas; un caballo propio; reliquias genéricas (espada, ocarina, triángulos dorados sin el emblema exacto). **Los nombres van en la narración, no en el dibujo** | Medio-bajo. El juego se reconoce por la narración, la ambientación y la paleta, no por copiar diseños |
| **C. Mixta** | Como B en personajes, pero lugares y objetos más reconocibles (campo, templo, árbol) | Medio |

**Recomendación de Claude: B o C.** Protege el objetivo de monetizar sin cambiar el guion. Hay que contrastarlo con la Directiva Creativa ("Ocarina identity non-negotiable"), así que lo decide el Producer.

---

## 5. Protecciones del motor y del proceso

### 5.1 Reglas que el motor comprobará

Son avisos o bloqueos, nunca cambios automáticos al guion.

| # | Comprobación | Nivel |
|---|---|---|
| M1 | **Reutilización de arte entre episodios:** % de fondos y poses de Quest ya usados en episodios anteriores. Avisa si más del 30 % del tiempo en pantalla usa arte ya visto (excepto la marca) | Aviso |
| M2 | **Recetas visuales repetidas:** compara la "huella" de cada escena (tipo de capas, movimiento de cámara, transición, efectos) con los episodios anteriores. Avisa si un episodio repite el mismo orden de recetas que otro | Aviso; bloqueo si la similitud es muy alta |
| M3 | **Variedad dentro del episodio:** ningún tipo de movimiento de cámara en más del 40 % de las escenas; nada de capas idénticas en serie; más de 6 s sin cambio visual es aviso | Aviso |
| M4 | **"Slideshow":** % del tiempo que es solo imagen fija + zoom/paneo, sin elementos explicativos (diagramas, texto, comparaciones, efectos). Avisa si pasa del 60 % | Aviso |
| M5 | **Registro de situaciones de Quest:** cada episodio guarda en qué situación, lugar y arco está Quest. Avisa si repite situación y desenlace de un episodio reciente | Aviso |
| M6 | **Estructura del guion:** compara la secuencia de bloques entre episodios. **Solo informa al Producer**; Claude nunca edita el guion | Informe |
| M7 | **Metadatos:** compara título, descripción y miniatura con los episodios anteriores. Avisa si el título repite la misma fórmula ("Why Do Millions…" / "Why Do We Want…") más de 2 veces seguidas o si las descripciones se parecen demasiado | Aviso |
| M8 | **Propiedad intelectual en miniaturas:** prohibidos los logos y el arte oficial. La ficha de cada asset declara si "evoca" o "replica" un personaje ajeno; "replica" en una miniatura es bloqueo | Bloqueo |
| M9 | **"Para niños":** el paquete de publicación siempre fija "No es para niños" | Bloqueo |

### 5.2 Variar en cada episodio

**Responsabilidad de Claude:**
- **El tratamiento visual:** paleta y gradación, tipo de diagramas, recursos visuales nuevos (EP001: contadores y medidores de dinero; EP002: memoria, tiempo, vidrio), y el papel de Quest.
- **Los recursos de montaje:** transiciones, ritmo de cámara, efectos de sonido. Ningún episodio puede ser "el anterior con otros dibujos".
- **La miniatura y el título:** fórmula distinta, siguiendo las reglas de MrBeast, sin repetir patrón.

**Decisión del Producer, que Claude solo informa:** la estructura del guion.

### 5.3 Prueba de aporte humano (para una apelación)

Mucho ya existe gracias a git; hay que conservarlo:
- historia del guion por episodio, aprobada por el Producer, y decisiones del Producer (`docs/ep00x/PRODUCER_DECISIONS.md`);
- biblia del personaje Quest (`QUEST_V1_PROMPT_SPEC.md`), que prueba que es "un personaje que inventamos";
- escenas JSON distintas por episodio, láminas de revisión, tomas rechazadas, animatics;
- un **kit de apelación** listo, en un vídeo de menos de 5 minutos:
  1. URL del canal en los primeros 30 s;
  2. cita de las secciones de la política;
  3. recorrido por varios episodios mostrando cómo se crean.

### 5.4 Canal y publicación

1. **Sección "Acerca de":** decir que es una serie original de video-ensayos producida por el equipo de SecondQuest, con apoyo de IA en imágenes y narración, con una mascota original, y **sin afiliación con ninguna editora de videojuegos**. Ese "sin afiliación" lo exige la política de suplantación para canales de fans.
2. **Antes de solicitar el YPP:** los vídeos más vistos, más recientes y con más horas deben ser los mejores. Los de prueba débiles se pasan a privado **antes** de solicitar. **Nunca se borran vídeos durante una apelación.**
3. **Calidad antes que volumen:** una cadencia que un equipo humano pueda sostener, por ejemplo 1 episodio cada 1–2 semanas y unos pocos Shorts distintos entre sí.
4. **Nada de afirmaciones inventadas** (citas de desarrolladores, datos sin fuente). El engaño fue la causa de las cancelaciones de canales de tráileres falsos y de true crime.

---

## 6. Incertidumbres

- No hay un umbral numérico publicado para considerar un canal "repetitivo". Los umbrales M1–M7 son nuestros, prudentes, y se calibrarán.
- El texto exacto de los rechazos actuales ("reused" o "inauthentic") está **sin verificar**.
- Las afirmaciones de que el TTS está permitido vienen de blogs de proveedores (**sin verificar**). Lo que sí está verificado es que la política no lo prohíbe.
- No es asesoría legal: propiedad intelectual, marcas y la ley de privacidad infantil de EE. UU. (COPPA) deberían consultarse con un abogado si se usan personajes reconocibles.
