/*!
 * np-core.js — utilidades compartidas por todos los scripts de Nintendo Project.
 * Debe cargarse ANTES que cualquier otro np-*.js (el mu-plugin lo encola así).
 *
 * - NP.u(ruta)        URL absoluta a partir de la base del sitio (sin dominio fijo).
 * - NP.page(clave)    URL de una página configurable (NP_CONFIG.pages); "#" si no existe.
 * - NP.prefs()        Preferencias del usuario (localStorage "np-widget-prefs"), leídas una vez.
 * - NP.soundOn()      ¿Puede sonar algo? Solo si el usuario lo activó explícitamente.
 * - NP.motionOn()     ¿Se permiten animaciones? Respeta prefers-reduced-motion y la preferencia.
 * - NP.has(o, k)      hasOwnProperty seguro (evita claves como "constructor").
 * - NP.safe(fn, tag)  Ejecuta fn capturando excepciones para que un fallo no tumbe la página.
 */
(function () {
  "use strict";
  if (window.NP && window.NP.__core) return;

  var CFG = window.NP_CONFIG || {};
  var BASE = String(CFG.base || location.origin + "/");
  if (BASE.slice(-1) !== "/") BASE += "/";
  var PAGES = CFG.pages || {};
  var PREF_KEY = "np-widget-prefs";

  function has(o, k) {
    return o != null && Object.prototype.hasOwnProperty.call(o, k);
  }

  function u(path) {
    path = String(path == null ? "" : path);
    if (/^(https?:)?\/\//i.test(path) || path.indexOf("data:") === 0) return path;
    return BASE + path.replace(/^\/+/, "");
  }

  function page(key) {
    return has(PAGES, key) && PAGES[key] ? u(PAGES[key]) : "#";
  }

  var cache = null;
  function readPrefs() {
    var p = null;
    try {
      p = JSON.parse(localStorage.getItem(PREF_KEY) || "null");
    } catch (e) {}
    return p && typeof p === "object" ? p : {};
  }
  function prefs() {
    if (window.npPrefs && typeof window.npPrefs === "object") return window.npPrefs;
    if (!cache) cache = readPrefs();
    return cache;
  }
  window.addEventListener("storage", function (e) {
    if (!e.key || e.key === PREF_KEY) cache = null;
  });

  // El sonido queda DESACTIVADO por defecto: solo suena si el usuario lo activó.
  // Versiones anteriores guardaban sound:true por defecto; por eso además se
  // exige soundOptIn (solo lo pone el interruptor de sonido del panel).
  function soundOn() {
    var p = prefs();
    return p.sound === true && p.soundOptIn === true;
  }

  var RM = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function motionOn() {
    if (RM && RM.matches) return false;
    var a = prefs().anim;
    return !(a === false || a === "off");
  }

  function safe(fn, tag) {
    try {
      return fn();
    } catch (e) {
      if (window.console) console.error("[NP" + (tag ? ":" + tag : "") + "]", e);
    }
  }

  window.NP = {
    __core: true,
    base: BASE,
    u: u,
    page: page,
    prefs: prefs,
    soundOn: soundOn,
    motionOn: motionOn,
    has: has,
    safe: safe,
  };
})();
