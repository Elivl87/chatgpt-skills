# Nintendo Project — paquete de mejoras

Versión corregida del código **propio** de la portada (scripts y estilos que el sitio
incrustaba en base64 dentro del HTML), más un *mu-plugin* de WordPress que lo instala.

## Qué incluye

```
wp-content/mu-plugins/
├── np-mejoras.php            ← plugin (se activa solo)
└── np-mejoras/
    ├── js/                   ← 24 scripts corregidos (np-core.js primero), legibles
    └── css/np-mejoras.css    ← foco visible, movimiento reducido, botones nuevos
datos/np-top-data.ejemplo.json ← formato de datos para la sección #np-top
```

## Qué NO incluye (a propósito)

- **El contenido de terceros**: ni ROMs, ni enlaces de descarga, ni el script de
  contraseñas de carpetas, ni imágenes de juegos/personajes. Los datos de `#np-top`
  ya no van dentro del JS; el ejemplo trae solo marcadores de posición.
- **Las páginas de descargas**: los enlaces a esas secciones pasan por `NP.page("…")` y
  apuntan a `#` mientras no las configures.
- **El script "anti-inspección"** (bloqueo de F12, Ctrl+U, clic derecho en toda la página):
  eliminado, no protegía nada y molestaba.

## Instalación

> Hazlo primero en tu copia local (LocalWP). Ten una copia de seguridad.

1. Copia `wp-content/mu-plugins/np-mejoras.php` y la carpeta
   `wp-content/mu-plugins/np-mejoras/` a la misma ruta de tu WordPress.
2. Recarga la portada. El plugin:
   - encola `np-core.js` y los demás scripts como archivos externos con `defer`
     (cacheables, ~30 % menos peso que en base64);
   - **retira del HTML los 26 scripts antiguos** reconociéndolos por una firma única
     (probado sobre la portada tal como sale de WordPress, antes de LiteSpeed:
     84 → 58 `<script>`, 1,06 MB → 0,67 MB de HTML);
   - quita las precargas duplicadas (19 → 5) y las metas `generator`;
   - envía cabeceras de seguridad, desactiva XML-RPC;
   - en la portada, deja de cargar la suite de Ultimate Member (no hay formularios).
3. **Lo ideal** es borrar los scripts antiguos en su origen y desactivar la retirada
   automática (`define('NP_MEJORAS_QUITAR_INLINE', false);`). Para localizarlos en tu
   copia: busca estas cadenas en la base de datos (`wp_options`, `wp_posts`, `wp_postmeta`)
   y en el tema/plugins de snippets (WPCode, Code Snippets, widgets HTML de Elementor):
   `npSw2Welcome`, `npHome`, `np-top`, `NPMenuPokemon`, `link-sound`, `wii-cursor-global`,
   `npGofilePasswords`, `__npProtect`.
4. **Datos de `#np-top`**: sube tu JSON (mismo formato que `datos/np-top-data.ejemplo.json`)
   a `wp-content/uploads/np-top/np-top-data.json`, o indica otra ruta con
   `data-src="…"` en el contenedor `#np-top`.
5. **Páginas enlazables** (opcional), en el `functions.php` del tema hijo:
   ```php
   add_filter('np_mejoras_paginas', function ($p) {
       $p['mi-cuenta'] = 'mi-cuenta/';
       return $p;
   });
   ```

### Constantes (wp-config.php)

| Constante | Por defecto | Efecto |
|---|---|---|
| `NP_MEJORAS_SCRIPTS` | `true` | Encolar los scripts corregidos |
| `NP_MEJORAS_QUITAR_INLINE` | `true` | Retirar los scripts antiguos del HTML |
| `NP_MEJORAS_CABECERAS` | `true` | Cabeceras `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` |
| `NP_MEJORAS_HSTS` | `false` | HSTS (actívalo solo si todo el sitio va por HTTPS) |
| `NP_MEJORAS_ADELGAZAR_HOME` | `true` | No cargar Ultimate Member en la portada |
| `NP_MEJORAS_PRECARGAS_MAX` | `2` | Precargas de imagen sin `media` permitidas |

## Cambios manuales recomendados (no se pueden hacer desde código)

- **LiteSpeed Cache → Optimización de página → JS**: desactiva "Cargar JS diferido en línea"
  para que no vuelva a convertir scripts en `data:base64`. Excluye `mu-plugins/np-mejoras/`.
- **Elementor**: añade un `<h1>` a la portada (puede ir oculto con la clase `np-sr-only`).
- **Medios**: rellena el texto alternativo de las imágenes (80 de 106 no tenían `alt`).
- **Fuentes**: se cargan 7 familias y Dosis dos veces; deja 2–3.
- **CSS adicional del Personalizador** (162 KB): pásalo a un archivo del tema hijo.
- **Imágenes de `#np-top`**: súbelas a tu servidor en WebP en lugar de enlazarlas de terceros.
- **Breakpoint del menú**: los scripts usan ahora un único corte, `992px` (como `d-lg-none`
  del botón hamburguesa). Las reglas CSS del menú lateral con `max-width: 768px` deben pasar a
  `max-width: 991.98px`.

## Cambios de comportamiento que vas a notar

- **Sin sonido por defecto.** Música, jingle de bienvenida, sonido de enlaces y del menú solo
  suenan si se activa el interruptor de sonido del panel (marca `soundOptIn`). Quien lo tenía
  guardado con la versión anterior tendrá que activarlo una vez.
- **Bienvenida**: botón «Saltar» y Esc siempre permiten entrar (el test se completa con valores
  por defecto). Si algo falla, a los 15 s se sale sola en vez de dejar la página en blanco.
- **«25 CONSOLAS»** se calcula con los enlaces reales del menú (hoy son 23).
- **Chat de la Plaza**: se actualiza cada 20 s (antes 6 s) y no consulta con la pestaña oculta.
- **Avatares de otros dominios** (p. ej. Gravatar): se muestra el avatar por defecto.
- **Rueda sobre la fila de consolas**: la desplaza en horizontal; en los extremos baja la página.
- **Panel de personalización**: abre al terminar la animación del menú lateral (~600 ms).
- **`#np-top`**: botón «Pausar rotación» por sección; con movimiento reducido arranca en pausa.

## Pruebas realizadas

- `node --check` en los 24 scripts y `php -l` en el plugin: sin errores.
- Filtro del plugin sobre la portada real (sin LiteSpeed): retira los 26 scripts antiguos,
  el estilo de contraseñas y las metas `generator`; precargas 19 → 5 (se conservan las de
  móvil/escritorio).
- Chromium sin red, a 1366 px y 390 px: Esc durante la intro responde al instante y quita
  `nsw-cover` (antes congelaba la pestaña); `#np-top` se pinta con el JSON de ejemplo y su botón
  de pausa; queda un solo `#wii-cursor-global` y el puntero no se oculta si la imagen no carga.
  Los únicos errores son de jQuery/`wp.i18n` y `admin-ajax`, que no cargan sin red.
- No probado: el cierre real del menú lateral con el JS del tema, y la nav lateral de
  `#np-top` perdiendo `inert` al hacer scroll (Chromium sin pantalla no ejecutó
  requestAnimationFrame).

## Registro de cambios

### Común
- **`np-core.js` (nuevo)**: base del sitio sin dominio fijo (`NP.u`), páginas configurables
  (`NP.page`), preferencias leídas una vez (`NP.prefs`), **sonido desactivado por defecto**
  (`NP.soundOn`), movimiento reducido (`NP.motionOn`), `NP.has` y `NP.safe`.
- 243 URLs con `https://nintendoproject.com/` fijo → relativas a la base del sitio.

### Scripts pequeños
- **`np-sonido-enlaces.js`**: ya no intercepta la navegación (antes `preventDefault` en todos los
  enlaces + 75 ms de espera, rompía Ctrl/Cmd/clic central y anclas). Solo suena si el usuario lo activó.
- **`np-videos.js`**: solo reproduce vídeos con `autoplay`/`data-np-autoplay`, nunca con movimiento reducido.
- **`np-cursor-wii.js`**: une los dos scripts; elimina el `id` duplicado; oculta el puntero del sistema
  solo si la imagen cargó; ya no borra el `transform` en cada cambio del DOM; Esc lo desactiva para la sesión.
- **`np-nivel.js`**: fuera el bloque anti-inspección; valida `dias`, `ultimoDia` y `primerDia`
  (un valor corrupto ya no tumba `#npHome`).
- **`np-top.js`**: los ~127 KB de datos incrustados se cargan como JSON cuando la sección se acerca
  a la pantalla; se descartan consolas mal formadas en lugar de romper todas.
- Eliminados: script de contraseñas, redirección muerta (`umlg-redirect-trigger`).

### `np-home.js` (`#npHome`)
- `renderMe`: `primerDia` validado; el arranque va paso a paso con `NP.safe` (un fallo ya no
  tumba el widget).
- `plazaOn` declarado arriba: un solo `npmp_init`. `refreshMsgs`: cada 20 s y en pausa con la
  pestaña oculta.
- Sonido: `DEF.sound` apagado, sin arranque de música con la primera tecla/toque; `stopMusic`
  al apagar o restablecer.
- `applyBg`/`showVideo`: turno por cambio (`bgGen`), sin temporizadores huérfanos, se libera el
  vídeo anterior, `onerror` vuelve a la imagen, imagen en ≤768 px o con movimiento reducido.
- Movimiento reducido en carrusel de avatares, «¿quién será?», vídeo y scroll suave.
- Rueda horizontal nativa; arrastre con `setPointerCapture` y `pointercancel`.
- `NP.has` en `PK`, `FONDOS`, `HOUSES`, `SAGA_AV`, `TEMA`, `FONDOS_MII` y el chat;
  `__proto__` ignorado en preferencias.
- «Ayer» con `setDate`; evoluciones por encima de Nv. 100 ignoradas.
- Panel de ajustes: `inert` cerrado, foco atrapado abierto, Esc cierra y devuelve el foco.
- `gradOk` rechaza `url(`/`var(`/`image(`…; `safeUrl` solo mismo origen o `uploads/`.
- `aria-pressed` en tema/acento/fondo; `PZ_CHAT_RANKS` reutiliza `RANGOS`; fuera `POKE_SUM`.

### `np-bienvenida.js`
- **Bucle infinito con Esc eliminado**: `skipAll()` completa el test con `quizDefaults()` y entra.
- Salvavidas: `try/catch` + `bail()`, `watchdog()` a los 15 s, `hardExit()`; `markSeen()` solo
  tras pintar.
- `role="dialog"` + `aria-modal`; botón «Saltar» (`.np-btn-saltar`); «Pulsa 3 veces» es `<button>`.
- Audio solo con `NP.soundOn()` y tras gesto; preferencias vía `NP.prefs()`.
- `SAGA` validado; colores saneados (`hexColor`); `esc2` escapa `'`; `np-welcome-closed` una vez.

### `np-top.js` (`#np-top`)
- `goTo`: se cancela si el usuario hace scroll o salta otra vez; el foco va a la sección.
- Pausa del autoplay (`syncHold`): ratón, foco, toque (se libera 1,5 s tras soltar) y pestaña
  oculta por separado; botón `.np-autoplay-toggle` con `aria-pressed`.
- Hidratación por proximidad también con movimiento reducido; `feature()` sin timers cruzados.
- Nav lateral con `inert` mientras está oculta.
- `sanitize()`: URLs solo http(s)/relativas, colores validados, `c.style` limitado a `--variables`.
- Eliminados manejadores de elementos inexistentes, atajo «a», `LOGO`, `loading` duplicado;
  `mousemove` por `requestAnimationFrame`.

### Menús
- **Breakpoint único** (`window.NPMenuBP`, 992 px) en los tres scripts.
- Sonido `ajustes.mp3`: una sola instancia (`window.NPMenuSound`), creada al primer uso real.
- `np-menu-movil.js`: avatar con `cloneNode` y firma; fuera el intervalo de 1 s (eventos +
  respaldo de 15 s solo con el menú abierto); `safeImg()`; `init()` por pasos; Plaza Mii vuelve
  a su sitio en escritorio.
- `np-menu-escritorio.js`: sin `stopPropagation()` (el clic llega al resto de oyentes);
  `countConsoles()`; flechas, Inicio/Fin y Escape en submenús con `aria-expanded`; ciclo de
  consolas en pausa si no se ve; colores en caché validados.
- `np-personalizador-menu.js`: devuelve foco y scroll al cerrar en móvil; Espacio en
  `role="button"`; slider por `requestAnimationFrame`; `inert` para nodos añadidos;
  `transitionend` en vez de `setTimeout(420)`.
