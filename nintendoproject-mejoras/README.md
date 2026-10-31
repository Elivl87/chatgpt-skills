# Nintendo Project — paquete de mejoras

Versión corregida del código **propio** de la portada (scripts y estilos que el sitio
incrustaba en base64 dentro del HTML), más un *mu-plugin* de WordPress que lo instala.

## Qué incluye

```
wp-content/mu-plugins/
├── np-mejoras.php            ← plugin (se activa solo)
└── np-mejoras/
    ├── js/                   ← 24 scripts corregidos, legibles y comentados
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
     (probado sobre la portada: 84 → 58 `<script>`, 1,06 MB → 0,67 MB de HTML);
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
