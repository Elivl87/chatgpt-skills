<?php
/**
 * Plugin Name: Nintendo Project — Mejoras
 * Description: Carga los scripts propios corregidos como archivos externos (cacheables),
 *              retira las versiones antiguas incrustadas, añade cabeceras de seguridad
 *              y aligera la portada. Cada bloque se puede desactivar con una constante.
 * Version:     1.0.0
 *
 * Instalación: copia este archivo y la carpeta "np-mejoras/" (con js/ y css/) en
 * wp-content/mu-plugins/. Los mu-plugins se activan solos.
 *
 * Constantes opcionales (en wp-config.php, antes de "That's all, stop editing"):
 *   define('NP_MEJORAS_SCRIPTS', false);        // no encolar los scripts nuevos
 *   define('NP_MEJORAS_QUITAR_INLINE', false);  // no retirar los scripts antiguos del HTML
 *   define('NP_MEJORAS_CABECERAS', false);      // no enviar cabeceras de seguridad
 *   define('NP_MEJORAS_HSTS', true);            // enviar HSTS (solo si TODO el sitio va por HTTPS)
 *   define('NP_MEJORAS_ADELGAZAR_HOME', false); // no desencolar Ultimate Member & cía. en la portada
 *   define('NP_MEJORAS_PRECARGAS_MAX', 2);      // nº máximo de <link rel=preload as=image>
 */

if (!defined('ABSPATH')) {
    exit;
}

function np_mejoras_on($const, $default = true)
{
    return defined($const) ? (bool) constant($const) : $default;
}

define('NP_MEJORAS_VER', '1.0.0');
define('NP_MEJORAS_URL', content_url('mu-plugins/np-mejoras/'));
define('NP_MEJORAS_DIR', WPMU_PLUGIN_DIR . '/np-mejoras/');

/* -------------------------------------------------------------------------
 * 1. Scripts propios como archivos externos, en el orden original.
 * ---------------------------------------------------------------------- */
function np_mejoras_scripts()
{
    return array(
        'np-core',                  // utilidades compartidas: SIEMPRE el primero
        'np-nav-intro',
        'np-menu-movil',
        'np-menu-pokemon-card',
        'np-ir-a-pokemon',
        'np-espaciado-post',
        'np-menu-escritorio',
        'np-submenus-largos',
        'np-personalizador-menu',
        'np-avatar-espaciado',
        'np-clic-derecho',
        'np-cabecera-movil',
        'np-colores-invitado',
        'np-proteccion-imagenes-menu',
        'np-avisos-plaza',
        'np-nivel',
        'np-home',
        'np-bienvenida',
        'np-top',
        'np-bienvenida-referido',
        'np-carruseles-lazy',
        'np-sonido-enlaces',
        'np-videos',
        'np-cursor-wii',
    );
}

add_action('wp_enqueue_scripts', function () {
    if (!np_mejoras_on('NP_MEJORAS_SCRIPTS')) {
        return;
    }
    $prev = array();
    foreach (np_mejoras_scripts() as $handle) {
        $file = NP_MEJORAS_DIR . 'js/' . $handle . '.js';
        if (!file_exists($file)) {
            continue;
        }
        $ver = NP_MEJORAS_VER . '.' . filemtime($file);
        wp_enqueue_script($handle, NP_MEJORAS_URL . 'js/' . $handle . '.js', $prev, $ver, array(
            'in_footer' => true,
            'strategy'  => 'defer',
        ));
        $prev = array($handle);
    }

    // Configuración para np-core.js: base del sitio y páginas enlazables.
    // Las páginas no configuradas apuntan a "#". Puedes rellenarlas con el filtro
    // 'np_mejoras_paginas', p. ej.: ['mi-cuenta' => 'mi-cuenta/'].
    $config = array(
        'base'  => trailingslashit(home_url('/')),
        'pages' => apply_filters('np_mejoras_paginas', array()),
    );
    wp_add_inline_script('np-core', 'window.NP_CONFIG=' . wp_json_encode($config) . ';', 'before');

    $css = NP_MEJORAS_DIR . 'css/np-mejoras.css';
    if (file_exists($css)) {
        wp_enqueue_style('np-mejoras', NP_MEJORAS_URL . 'css/np-mejoras.css', array(), NP_MEJORAS_VER . '.' . filemtime($css));
    }
}, 20);

// LiteSpeed: no volver a incrustar/combinar nuestros archivos (se cachean solos).
add_filter('litespeed_optm_js_defer_exc', function ($exc) {
    $exc = (array) $exc;
    $exc[] = 'mu-plugins/np-mejoras/';
    return $exc;
});

/* -------------------------------------------------------------------------
 * 2. Limpieza del HTML final: retira los scripts antiguos incrustados,
 *    el script/estilo de contraseñas, metas "generator" y precargas duplicadas.
 *    Se ejecuta ANTES que la optimización de LiteSpeed (buffer más interno).
 * ---------------------------------------------------------------------- */
function np_mejoras_firmas()
{
    // Un fragmento único de cada script antiguo (comprobado que no se repite).
    return array(
        'np-img-ok',
        'function organizeMobileSections',
        'window.NPMenuPokemon)return;var badge',
        'window.NPGoPokemon',
        'np-espacio-movido',
        'var NP_ICONOS=',
        'window.NPLongSubmenus',
        'var OPEN_SOUND=',
        'window.NPAvatarSpacing',
        'window.NPNoRightPress',
        'window.NPMobileHeader',
        'window.NPGuestColors',
        'window.NPMenuImageProtection',
        'npmp_menu_avisos',
        'window.__npProtect',
        "getElementById('npHome');if(!root||root.getAttribute('data-ready'))",
        'window.__nswWelcome',
        "getElementById('np-top');if(!root||root.getAttribute('data-ready'))",
        'window.npGofilePasswords',
        'umlg-redirect-trigger',
        'function FORCE(){var wii',
        'np_welcome_from',
        'El primero (above the fold)',
        "getElementById('link-sound')",
        'v.muted=!0;v.play().catch',
        'Wii Cursor: Error cargando imagen',
    );
}

function np_mejoras_limpiar_html($html)
{
    if (stripos($html, '<html') === false) {
        return $html; // no es una página HTML (feeds, JSON…)
    }

    if (np_mejoras_on('NP_MEJORAS_QUITAR_INLINE') && np_mejoras_on('NP_MEJORAS_SCRIPTS')) {
        $firmas = np_mejoras_firmas();
        $html = preg_replace_callback('#<script\b(?![^>]*\bsrc=)[^>]*>.*?</script>#is', function ($m) use ($firmas) {
            foreach ($firmas as $f) {
                if (strpos($m[0], $f) !== false) {
                    return '';
                }
            }
            return $m[0];
        }, $html);
        // Estilo del antiguo sistema de contraseñas.
        $html = preg_replace('#<style\b[^>]*>\s*\.np-gofile-pass\b.*?</style>#is', '', $html);
    }

    // Metas que revelan versiones (WordPress, Elementor…).
    $html = preg_replace('#<meta\s+name=["\']generator["\'][^>]*>\s*#i', '', $html);

    // Precargas de imagen: sin duplicados y como mucho N con prioridad alta.
    $max = defined('NP_MEJORAS_PRECARGAS_MAX') ? (int) NP_MEJORAS_PRECARGAS_MAX : 2;
    $vistas = array();
    $n = 0;
    $html = preg_replace_callback('#<link\b[^>]*\brel=["\']preload["\'][^>]*>#i', function ($m) use (&$vistas, &$n, $max) {
        $tag = $m[0];
        if (!preg_match('#\bas=["\']image["\']#i', $tag) || !preg_match('#\bhref=["\']([^"\']+)#i', $tag, $h)) {
            return $tag;
        }
        $media = preg_match('#\bmedia=["\']([^"\']+)#i', $tag, $mm) ? $mm[1] : '';
        $key = $h[1] . '|' . $media;
        if (isset($vistas[$key])) {
            return ''; // duplicada
        }
        $vistas[$key] = true;
        if ($media !== '') {
            return $tag; // precarga condicional (móvil/escritorio): se conserva
        }
        $n++;
        if ($n > $max) {
            return ''; // demasiadas precargas compiten con la imagen principal
        }
        return $tag;
    }, $html);

    return $html;
}

add_action('template_redirect', function () {
    if (is_admin() || wp_doing_ajax() || (defined('REST_REQUEST') && REST_REQUEST) || is_feed()) {
        return;
    }
    if (isset($_GET['elementor-preview'])) {
        return; // no tocar el editor de Elementor
    }
    ob_start('np_mejoras_limpiar_html');
}, 0);

/* -------------------------------------------------------------------------
 * 3. Cabeceras de seguridad y superficie de ataque.
 * ---------------------------------------------------------------------- */
add_action('send_headers', function () {
    if (!np_mejoras_on('NP_MEJORAS_CABECERAS') || headers_sent()) {
        return;
    }
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('X-Frame-Options: SAMEORIGIN');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
    if (np_mejoras_on('NP_MEJORAS_HSTS', false) && is_ssl()) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }
});

remove_action('wp_head', 'wp_generator');
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
add_filter('the_generator', '__return_empty_string');
add_filter('xmlrpc_enabled', '__return_false');
add_filter('wp_headers', function ($h) {
    unset($h['X-Pingback']);
    return $h;
});

/* -------------------------------------------------------------------------
 * 4. Portada más ligera: la home no tiene formularios de Ultimate Member,
 *    así que no hace falta cargar toda su suite (fechas, subida, recorte…).
 * ---------------------------------------------------------------------- */
add_action('wp_enqueue_scripts', function () {
    if (!np_mejoras_on('NP_MEJORAS_ADELGAZAR_HOME') || !is_front_page()) {
        return;
    }
    $scripts = array(
        'um_gdpr', 'um_tipsy', 'um_confirm', 'um_notice', 'um_datetime', 'um_datetime_date',
        'um_datetime_time', 'um_datetime_locale', 'um_common', 'um_crop', 'um_frontend_common',
        'um_modal', 'um_jquery_form', 'um_fileupload', 'um_functions', 'um_responsive',
        'um_conditional', 'select2', 'um_select2_locale', 'um_raty', 'um_scripts', 'um_profile',
        'um_account',
    );
    foreach ($scripts as $h) {
        wp_dequeue_script($h);
    }
    foreach (array('um_modal', 'um_responsive', 'um_default_css', 'select2') as $h) {
        wp_dequeue_style($h);
    }
    // Hoja del tema vacía (su nombre optimizado es el MD5 de un archivo vacío).
    wp_dequeue_style('holaa-style');
}, 100);
