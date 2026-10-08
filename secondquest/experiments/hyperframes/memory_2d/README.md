# Prueba HyperFrames #3: "la ecuación del recuerdo", solo arte 2D (2026-10-08)

**Estado:** experimento. No forma parte del motor y no ha entrado en ningún episodio. El Productor decide si se usa.

## Opinión del Productor (2026-10-08)

Le gustan **el reloj de paletas** ("Saturday", de 12:00 a 6:00 PM) y **la Polaroid** del final.

## La escena

EP002, l12–l16 (Acto 1), del 34,32 s al 49,19 s del episodio (14,87 s):

*"It is the game... plus the room. Plus the television. Plus the friend who somehow knew where to go. Plus an entire
Saturday afternoon where nobody could reach you because smartphones had not yet ruined that particular miracle."*

**Por qué esta escena:**
- Es la más "gráfica" del episodio: el guion es literalmente una suma (+ + + +), y habla de un recuerdo.
- Permite enseñar lo que HyperFrames hace sin 3D: cámara sobre ilustraciones, tipografía, dibujos hechos por código, máscaras, grano, tratamiento de color y montaje sincronizado con cada palabra de Bram.

## Arte usado (aprobado, sin modificar)

- Cuarto: `core.bg.quest_bedroom_morning`. Se descarga de Higgsfield (job b690a476…) con `prepare.sh`; descargarlo no gasta créditos.
- Niños: arte final #6a (Quest jugando), #6b (Pixie señalando) y #6c (Pixie sentada).
- Imagen del juego: arte final #11 (Hyrule) + #3 (Quest joven de espaldas).
- **Dibujado por código (sin imagen):**
  - la tele CRT con líneas de barrido y cristal;
  - el móvil;
  - el reloj de paletas;
  - la flecha;
  - el tachón en rojo;
  - las etiquetas;
  - la Polaroid.

## Qué hace, palabra a palabra

| Bram dice | Actual (animatic v9) | Nuevo (HyperFrames) |
|---|---|---|
| "It is the game..." | La tele 3D de frente | **Dentro de la tele**: el juego llena la pantalla, con líneas de barrido y curvatura de CRT. Etiqueta **THE GAME** |
| "plus the room." | Fundido al cuarto | La cámara **sale de la pantalla** y descubre la tele sobre la mesilla y el cuarto. **+ THE ROOM**. Entra un rayo de sol |
| "Plus the television." | Empuje hacia la tele | Empuje hacia la tele, **su luz se derrama** por el cuarto. **+ THE TV** |
| "Plus the friend who somehow knew where to go." | Paneo a los niños, Navi | Los niños **entran deslizándose**, Pixie señala y en "knew where to go" **se dibuja una flecha** a mano hasta la pantalla. **+ THE FRIEND** |
| "Plus an entire Saturday afternoon..." | La luz pasa a la tarde | **Reloj de paletas** de 12:00 a 6:00 PM, la luz se vuelve dorada, el rayo de sol recorre el cuarto con **motas de polvo**, Pixie se sienta, aparece el grano de película. **+ SATURDAY** |
| "...because smartphones had not yet ruined..." | Un móvil entra y se tacha | Un móvil **cae vibrando** con su notificación y se **tacha con rotulador rojo** (círculo + barra dibujados en el tiempo) |
| "...that particular miracle." | — | **Flash de cámara**: el momento se convierte en una **Polaroid** ("Saturday afternoon · 1998") |

Las etiquetas usan la familia C aprobada: rotulador dorado con borde de tinta.

**Fuera del guion:** el pie de foto "Saturday afternoon · 1998" es texto en pantalla que no dice Bram. Es solo para la prueba.

## Archivos

- `index.html`: la composición entera (GSAP). La cámara, las motas y el grano son funciones del tiempo, así que se puede saltar a cualquier fotograma.
- `prepare.sh`: copia las fuentes y el arte a `assets/` (no está en git).
- `renders/memory_2d.mp4`: la escena nueva, 1920×1080, 24 fps.
- `renders/memory_2d_comparison.mp4`: comparación de 48 s con la voz de Bram en todo momento.
  1. ACTUAL (animatic v9, bloque C 4,1–20,0 s);
  2. NUEVO;
  3. los dos lado a lado.
  - El animatic actual está a 720p y se ha escalado a 1080p.

## Cómo regenerarlo

```bash
./prepare.sh
npx --yes hyperframes@0.8.141 check
npx --yes hyperframes@0.8.141 render --quality high -o renders/memory_2d.mp4
```

En este contenedor (4 núcleos, sin GPU), el render tarda alrededor de 1 minuto.
