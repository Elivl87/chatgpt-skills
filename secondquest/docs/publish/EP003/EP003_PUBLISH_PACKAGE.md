# SecondQuest EP003 "How to Fish": paquete de publicación de YouTube

**Estado:** borrador listo para subir en Privado cuando exista el máster (ver "Pendiente" al final). Gratis: 0 créditos gastados.

**Vídeo:** `EP003_master_1080p.mp4` (**pendiente**: aún no existe; se renderiza solo con aprobación del Productor, `final1080`). Duración objetivo **5:28.4** (328.4 s).

**Archivos de este paquete** (`docs/publish/EP003/`):
- `EP003_subtitles_en.srt`: subtítulos en inglés, 111 bloques, el texto tal cual se narra.
- `EP003_subtitles_es.srt`: subtítulos en español (ES-419), 111 bloques con los mismos tiempos, texto del guion ES-419 aprobado (v3.3).
- `EP003_chapters.txt`: los 11 capítulos.
- `thumbnails/EP003_thumb_A.png`, `thumbnails/EP003_thumb_B.png` (1280x720), `thumbnails/EP003_thumb_check_sheet.png` (vista de móvil) y `thumbnails/make_thumbs.py` (regenera las tres).

Normas: `docs/PUBLISHING_STANDARD.md` y `docs/THUMBNAIL_RULES.md`. Paquete de guion aprobado: `docs/ep003/EP003_PAQUETES_GUION.md` (B) y `docs/ep003/scripts/B_HowToFish.md` (LOCKED v3.3).

## Mapa de tiempos usado (el vídeo final es un empalme)

| Tramo del vídeo | Fuente de las marcas de voz |
|---|---|
| 0:00.00 a 1:01.76 | `episodes/ep003/timings.json` actual (h01–h10, b01–b03), tiempos tal cual. Tras "So, why?" (h10) hay 1.5 s de silencio con el wordmark |
| 1:01.76 a 5:28.40 | `timings.json` del commit 717b244d (l12–l52) con **todos los tiempos desplazados −3.60 s** (65.36 s antiguo = 61.76 s nuevo) |

Comprobación hecha: los tiempos desplazados de l12–l52 coinciden con los del `timings.json` actual al centésimo, y el texto de cada línea l12–l52 del corte base es **idéntico** al guion EN v3.3. La última palabra se dice a 5:25.9 y el vídeo acaba a 5:28.4.

## 1. Título: dos versiones para Test & Compare

| | Título | Caracteres | Para qué |
|---|---|---|---|
| **A, APROBADO, se publica con este** | **Why Did Millions Buy a Fishing Game... and Not Fish?** | 52 | Título del paquete B aprobado por el Productor. Curiosidad: una contradicción que se entiende en una lectura y una pregunta que solo responde el ensayo |
| B, para la prueba (alternativa del paquete B) | How to Fish: The Game That Isn't About Fishing | 46 | Buscable: el nombre del juego va primero (§3.1 del estándar) |
| (reserva, alternativa 3 del paquete) | Nobody Is Fishing in How to Fish | 32 | Solo si se quiere una tercera prueba |

Notas contra el estándar (§3):
- El título aprobado **no empieza por el nombre del juego** (§3.1). El paquete ya lo decidió así: el nombre del juego va en la descripción, en las etiquetas y en pantalla a 0:00. El título B cumple la regla de palabra clave primero.
- El A tiene 52 caracteres (el estándar apunta a 50–60); el B tiene 46, un poco corto.
- "..." en el A es parte del título aprobado; sin emoji y sin mayúsculas.

Cada uno se cumple pronto en el vídeo:
- **El A:** la contradicción se muestra en los primeros 9 s ("almost nobody seems to be fishing", 0:06; "slapping each other in the face", 0:09) y la pregunta se plantea en 0:37 ("So, why?"); se responde en 4:54–5:02 ("Because nobody in that boat came for the fish").
- **El B:** el nombre del juego se dice en 0:01 y la idea de "tutorial que no es de pescar" se paga en 5:06 a 5:13.

## 2. Miniatura (versión GRATIS: nuestro bote 3D + recortes, sin generar imágenes)

Escena base de las variantes: Quest y Pixie en nuestro bote de remos 3D (dos pasadas, casco cercano delante), atardecer del lago, el pez deadpan v2 al borde del cuadro mirando a cámara. Quest grande a la izquierda (cara ≈ 40 % de la altura del cuadro), una emoción extrema. Las variantes cambian solo la emoción y las palabras.

| Variante | Quest | Texto | Archivo |
|---|---|---|---|
| **C, se publica con esta (elegida por el Productor, 2026-10-17)** | ríe a carcajadas; a lo lejos una gaviota se lleva a Max | **NOT FISHING** | `thumbnails/EP003_thumb_C.png` |
| A (Test & Compare) | ríe a carcajadas | NOT FISHING | `thumbnails/EP003_thumb_A.png` |
| B (Test & Compare) | grita de incredulidad | WHY?! | `thumbnails/EP003_thumb_B.png` |

Cómo está hecha (todo arte existente, solo colocado y escalado, sin editar):
- Fondo: `docs/art_orders/ep003/new_art_v1/derived/lake_dusk.png` (recorte con zoom 1.18, más un degradado oscuro suave a la izquierda para que resalte la sudadera roja).
- Bote: `rowboat_side_back.png` + `rowboat_side_front.png`; pez: `fish2_34_deadpan.png` (espejado, mira hacia Quest y la cámara); Quest `quest/library_v2/results/02_laughing_pointing.png` (A) y `04_surprised_shocked.png` (B); Pixie `pixie/library/results/04_laughing_pointing.png`.
- Los recortes de Quest y Pixie quedan recortados por el casco (nadie asoma por debajo de la quilla).
- Texto: Fredoka Bold, blanco y amarillo #FFD600, contorno oscuro grueso y sombra suave, en la zona despejada arriba a la derecha, sin tapar ninguna cara. No repite el título.
- Sin logos, sin arte ni lettering del juego.

QC (revisado a ojo en la hoja `EP003_thumb_check_sheet.png`, 640x360, 246x138 y 168x94):
- Legible a 168x94: las palabras y la cara de Quest se leen en las dos variantes.
- Identidad de Quest: sudadera roja con cordones blancos, vaqueros, pelo y cara tal cual el recorte aprobado. Los pies (zapatillas rojas) no salen en cuadro: los tapa el casco. Pixie, sudadera verde azulada, tal cual su recorte.
- Aviso: el recorte de Quest es 688x1024 y se escala ×1.25 (alturas 1280 px); se ve ligeramente más suave que el resto. Si el Productor quiere la miniatura "premium", un recorte nuevo de Quest de mayor resolución costaría créditos (no se pide).
- Exportar a JPG de menos de 2 MB al subir (los PNG pesan ≈ 0.9 MB, ya valen).

## 3. Descripción (copiar y pegar en YouTube)

Las dos primeras líneas son las que se ven en la búsqueda y bajo el vídeo.

```
How to Fish is a fishing game where almost nobody fishes. Millions of people bought it anyway, for about eight dollars, to do everything else. Together. Why?

There is a game called How to Fish: a boat, a rod, a lot of fish. And yet its players are gambling the fish money, blowing things up and picking each other up just to slap each other awake. In this episode of SecondQuest we look at why adults who can't seem to ask a friend to hang out will say yes to an eight-dollar invitation, why fishing is the oldest excuse there is, and what a silly co-op game teaches us about how to say "I miss you" without having to say it.

Chapters
0:00 Intro: a fishing game where nobody fishes
0:41 Start with the price
1:02 The hard part is asking
1:46 But why fishing?
2:19 Every generation has an alibi
2:43 A boat, a rod and a goal
3:17 Mostly failure
3:59 Friendslop
4:15 Is it just a summer hit?
4:54 Nobody came for the fish
5:06 A tutorial after all

Facts and sources
- Price about eight dollars (list price $7.99), released Aug 20, 2026. Steam store page: https://store.steampowered.com/app/4001890/How_to_Fish/
- The developers' own content descriptor on Steam: "cartoon violence towards fish and gambling with fish (no real money)." Same Steam page.
- The makers hoped to sell around 200,000 copies; the two founders of Dazed Games met in high school; their first paid game, Out of Hand: Deluxe, sold below expectations. Sweden Game Arena: https://swedengamearena.com/en/news/dazed-games-hits-one-million-copies-sold-just-two-days/
- "More than ten million" is an estimate by Alinea Analytics (10.1M copies, Oct 1, 2026), not a developer figure: https://alineaanalytics.substack.com/p/steams-top-september-2026-games
- Teammates revive each other by picking them up and slapping them in the face. GamingOnLinux: http://www.gamingonlinux.com/2026/08/how-to-fish-is-another-brilliantly-funny-online-co-op-game
- "Friendslop": cheap, chaotic co-op games built for playing with friends. https://en.wikipedia.org/wiki/Friendslop and https://knowyourmeme.com/memes/friendslop
All art, 3D props and animation in this video are original SecondQuest work. No game footage, screenshots, logos or assets are used. SecondQuest is not affiliated with the developers or publishers of How to Fish.

So who would you put in your boat? And what game deserves a "why?" next? Tell me in the comments. Maybe that's our next quest.

Subscribe and join the quest.

SecondQuest explains why we love the games we play.

#HowToFish #Friendslop #SecondQuest
```

Notas:
- Las frases del gancho y del resumen salen del guion LOCKED v3.3 o lo resumen; nada que el vídeo no diga. "Dazed Games" y "Out of Hand: Deluxe" no se dicen en el vídeo: salen de la fuente de Sweden Game Arena (`research/04_lock_factcheck.json`) y solo van en la sección de fuentes.
- La sección de fuentes incluye solo hechos del guion con su fuente en `docs/ep003/research/04_lock_factcheck.json`.
- Hashtags: 3 como máximo (§4.6), del más específico al de marca.
- Pie (suscripción, lema y correo de negocio): el correo de negocio lo pone el valor por defecto de subida del canal, no está en el repo; el resto sigue el modelo del EP002 (no hay enlaces extra de canal en el EP002).

## 4. Traducción al español (YouTube Studio → Idiomas → Agregar traducción)

**Título A (ES):** ¿Por qué millones compraron un juego de pesca... y no pescaron?

**Título B (ES), si gana el B en la prueba:** How to Fish: el juego que no trata de pescar

```
How to Fish es un juego de pesca donde casi nadie pesca. Millones de personas lo compraron igual, por unos ocho dólares, para hacer todo lo demás. Juntos. ¿Por qué?

Hay un juego que se llama How to Fish: un bote, una caña, muchos peces. Y aun así, sus jugadores apuestan el dinero de los peces, hacen explotar cosas y se levantan unos a otros solo para despertarse a cachetadas. En este episodio de SecondQuest vemos por qué los adultos que no se atreven a pedirle a un amigo que se vean dicen que sí a una invitación de ocho dólares, por qué la pesca es la excusa más vieja que existe, y qué nos enseña un juego cooperativo tonto sobre cómo decir "te extraño" sin tener que decirlo.

Capítulos
0:00 Intro: un juego de pesca donde nadie pesca
0:41 Empecemos por el precio
1:02 Lo difícil es pedirlo
1:46 Pero ¿por qué pescar?
2:19 Cada generación tiene su coartada
2:43 Un bote, una caña y un objetivo
3:17 Casi puro fracaso
3:59 Friendslop
4:15 ¿Será solo el éxito del verano?
4:54 Nadie vino por los peces
5:06 Un tutorial, después de todo

Hechos y fuentes
- Precio de unos ocho dólares (precio de lista 7,99 USD), lanzado el 20 de agosto de 2026. Página de Steam: https://store.steampowered.com/app/4001890/How_to_Fish/
- El descriptor de contenido de los propios desarrolladores en Steam: "violencia caricaturesca contra peces y apuestas con peces (sin dinero real)". Misma página de Steam.
- Los creadores esperaban vender unas 200.000 copias; los dos fundadores de Dazed Games se conocieron en la escuela; su primer juego de pago, Out of Hand: Deluxe, vendió menos de lo esperado. Sweden Game Arena: https://swedengamearena.com/en/news/dazed-games-hits-one-million-copies-sold-just-two-days/
- "Más de diez millones" es una estimación de Alinea Analytics (10,1 M de copias, 1 de octubre de 2026), no una cifra de los desarrolladores: https://alineaanalytics.substack.com/p/steams-top-september-2026-games
- Los compañeros se reviven levantándolos y dándoles cachetadas. GamingOnLinux: http://www.gamingonlinux.com/2026/08/how-to-fish-is-another-brilliantly-funny-online-co-op-game
- "Friendslop": juegos cooperativos, baratos y caóticos, hechos para jugar con amigos. https://en.wikipedia.org/wiki/Friendslop y https://knowyourmeme.com/memes/friendslop
Todo el arte, los props 3D y la animación de este vídeo son obra original de SecondQuest. No se usa metraje, capturas, logos ni recursos del juego. SecondQuest no tiene relación con los desarrolladores ni los editores de How to Fish.

Entonces, ¿a quién subirías a tu bote? ¿Y qué juego merece ser nuestro próximo "por qué"? Dímelo en los comentarios. Quizá esa sea nuestra próxima quest.

Suscríbete y únete a la quest.

SecondQuest explica por qué amamos los juegos que jugamos.

#HowToFish #Friendslop #SecondQuest
```

## 5. Etiquetas (tags)

Pesan poco (YouTube). Nombre del juego y tres o cuatro temas que el vídeo trata (§5); ningún canal ajeno, ningún tema que no se toque.

```
how to fish, how to fish game, how to fish steam, how to fish co-op, friendslop, friendslop games, co-op games, steam games 2026, adult friendship, why we play games, gaming video essay, video essay, SecondQuest
```

## 6. Subtítulos en YouTube Studio

1. **Subtítulos → Agregar idioma → Inglés → Subir archivo → Con tiempos** → sube `EP003_subtitles_en.srt`.
2. Repite con **Español (Latinoamérica)** → sube `EP003_subtitles_es.srt`.

Cómo están hechos:
- Los tiempos salen de las marcas palabra a palabra de la voz de Bram sobre el mapa de arriba; cada subtítulo dura de 1 a 6 s, tiene un máximo de 2 líneas de 42 caracteres y nace en la primera palabra que se dice (cola de 0.2 a 0.6 s; las cuatro réplicas del diálogo de 1:05 a 1:10 duran 1.0 s por la regla mínima).
- El texto EN es la narración tal cual se dice (comillas rectas).
- El ES usa el texto aprobado del guion ES-419 v3.3 (`docs/ep003/EP003_SCRIPT_v33_ES419.md`), repartido en los mismos bloques de tiempo. Solo se separan frases para el reparto; no se cambia ninguna palabra. El ES va ligeramente más rápido de leer que el EN (unos pocos bloques pasan de 22 caracteres por segundo: en h08, l19, l29, l32 y l40) porque sigue los tiempos de la narración en inglés.
- **Líneas donde el texto del corte base difiere del guion v3.3 EN: ninguna.** Las 41 líneas l12–l52 del corte base (commit 717b244d) tienen el mismo texto que el guion EN v3.3, así que todas usan la redacción ES-419 aprobada y no hubo que traducir nada aparte.
- Si se sube el doblaje al español de Bram, **los subtítulos ES deben re-temporizarse con los tiempos del doblaje** (la duración y las pausas serán otras).

## 7. Otros ajustes

| Ajuste | Valor |
|---|---|
| Visibilidad al subir | **Privado** (checklist §7). Se pasa a Público cuando esté todo revisado |
| Idioma del vídeo | Inglés |
| Categoría | Gaming |
| ¿Creado para niños? | No |
| Contenido alterado o sintético ("Uso de IA") | **No**: animación 2D/3D no realista, y la voz de Bram es una voz de catálogo con licencia que no imita a nadie real (§9). Si dudas, "Sí" no penaliza |
| Pantalla final | Suscribirse + vídeo recomendado (EP002, el episodio anterior), sobre los últimos segundos limpios. **Propuesta: 5:18 a 5:28** (10 s, sobre la frase final "So who would you put in your boat?"). Pendiente de verlo en el máster: hay solo 2.5 s de cola tras la última palabra, así que hay que comprobar que el plano final deja libres las zonas de los elementos; si no, hace falta una cola más larga (re-render con aprobación del Productor) |
| Tarjetas (opcional) | Una tarjeta de vídeo al EP002 en **4:54**, cuando se responde la pregunta, o ninguna: no es obligatoria en el estándar |
| Test & Compare | Títulos A/B y las miniaturas (A, B y la tercera) en cuanto esté disponible |
| Comentario fijado | Ver abajo |

**Comentario fijado (EN):**
> So who would you put in your boat? And be honest: who is the friend who says "I'll get it later"? 🎣
> What game deserves a "why?" next? Tell me below. Maybe that's our next quest.

**Comentario fijado (ES):**
> ¿A quién subirías a tu bote? Y sé sincero: ¿quién es el amigo que dice "después lo compro"?
> ¿Qué juego merece nuestro próximo "por qué"? Dímelo abajo. Quizá esa sea nuestra próxima quest.

(El emoji del comentario fijado es opcional y se puede quitar; el estándar pide moderación.)

## 8. Checklist de publicación (PUBLISHING_STANDARD §7)

- [ ] Subido como **Privado**. Máster listo: `EP003_master_1080p.mp4` (1920×1080, 5:28.4, −14.1 LUFS) en el Release borrador `deliver-ep003-master-1080p-v34` (se borra a los 7 días: descargarlo antes).
- [ ] Miniatura puesta: **C** (`thumbnails/EP003_thumb_C.png`); A y B listas para Test & Compare.
- [ ] Título A (curiosidad, aprobado) puesto; título B (búsqueda) listo para Test & Compare. *Textos definidos arriba; se pegan al subir.*
- [ ] Descripción con gancho, capítulos, CTA, pie y 3 hashtags. *Lista arriba; antes de subir, revisar las cifras (ver "Pendiente").*
- [ ] Subtítulos en inglés y en español subidos. *Archivos listos; se suben con el vídeo.*
- [ ] Pista de audio doblada al español subida (si se hace), título y descripción en español añadidos. *Traducción de título y descripción lista; doblaje de Bram ES pendiente de aprobación del Productor (si no, doblaje automático de YouTube).*
- [ ] "Uso de IA" / contenido alterado: **No** (§9), animación no realista.
- [ ] Audiencia: no es para niños.
- [ ] Pantalla final: suscripción + EP002 sobre los últimos segundos limpios. *Propuesta 5:18 a 5:28, pendiente de comprobar sobre el máster.*
- [ ] Solo entonces: pasar a **Público** y empezar Test & Compare cuando esté disponible.

## 9. Pendiente antes de subir (abierto)

1. **Máster**: hecho (5:28.4, mismo mapa de empalme que los subtítulos y capítulos). Pantalla final: el plano final (5:18–5:28) es el logo con CONTINUE? / NEXT QUEST / JOIN THE PARTY, pensado para colocar encima los elementos de YouTube (suscribirse sobre JOIN THE PARTY, vídeo sobre NEXT QUEST).
2. **Recheck de hechos antes de publicar** (`docs/ep003/research/04_lock_factcheck.json`):
   - "More than ten million" = Alinea Analytics del 1-oct (10.1 M). Su actualización de octubre sale a principios de noviembre y puede superarla; "by early October" sigue siendo cierto, pero mirar la cifra nueva.
   - El precio (7.99 USD) puede bajar por rebajas; "about eight dollars" aguanta.
   - "Everyone in the boat buys their own copy": quedó marcado RISK (sin Friend Pass / Remote Play Together confirmado a ojo). La decisión del Productor del 2026-10-11 pide comprobarlo en la página de Steam; confirmar y anotar el resultado antes de publicar.
   - "Someone gets launched across the island" se quedó como exageración cómica (decisión del Productor, dibujo propio, sin metraje).
3. Miniaturas: C elegida; A y B para Test & Compare.
4. **Pantalla final**: comprobar el plano final del máster (hay 2.5 s de cola tras la última palabra) y fijar los tiempos.
5. **Doblaje ES de Bram** (opcional): aprobación del Productor; si se hace, re-temporizar el .srt ES con los tiempos del doblaje.
6. **Subtítulos**: el texto EN sale del `timings.json`; si Bram re-graba alguna línea o cambia un corte, regenerar.
7. **Short(s) tráiler**: no incluidos en este paquete (estándar §10: 1 o 2 por episodio, con el episodio como vídeo relacionado).
8. Tras publicar: a las 24–48 h, CTR, retención a los 30 s y fuentes de tráfico; escribir **una** mejora para el EP004 (`scripts/retention_read.py`).

## 10. Orden para publicar

1. Subir `EP003_master_1080p.mp4` en **Privado**; título A, descripción (con la traducción al español), etiquetas y miniatura A; subtítulos EN y ES; idioma inglés, Gaming, no es para niños, "Uso de IA: No"; pantalla final.
2. Revisarlo en privado: entero en el móvil, comprobando subtítulos y capítulos.
3. **Pasarlo a Público.**
4. Activar **Test & Compare** en cuanto esté disponible.
5. Subir el Short (si se hace) con el episodio como **vídeo relacionado**.
6. A las 24–48 h, capturas de YouTube Studio para las lecciones del EP003.
