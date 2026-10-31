/*!
 * np-cursor-wii.js — cursor decorativo (une los dos scripts anteriores).
 * Correcciones:
 *  - El HTML tenía DOS elementos con id="wii-cursor-global": se usa el primero
 *    y se eliminan los duplicados.
 *  - El modo cursor (que oculta el puntero del sistema) solo se activa cuando
 *    la imagen YA cargó; si falla, el usuario conserva su puntero.
 *  - El MutationObserver anterior reescribía style.cssText en cada cambio del
 *    body y borraba el transform (el cursor saltaba a 0,0). Eliminado.
 *  - Solo en dispositivos con puntero fino y hover; Esc lo desactiva y se
 *    recuerda durante la sesión.
 */
(function () {
  "use strict";
  var OFF_KEY = "np-wii-cursor-off";
  function init() {
    var all = document.querySelectorAll("#wii-cursor-global");
    var cursor = all[0];
    for (var i = 1; i < all.length; i++) all[i].parentNode.removeChild(all[i]);
    if (!cursor) return;
    var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
    var off = false;
    try {
      off = sessionStorage.getItem(OFF_KEY) === "1";
    } catch (e) {}
    if (!fine || off) {
      cursor.style.display = "none";
      return;
    }
    var body = document.body;
    var x = -100,
      y = -100,
      queued = false,
      active = false;
    function disable(remember) {
      active = false;
      body.classList.remove("wii-mode-active");
      cursor.style.display = "none";
      if (remember)
        try {
          sessionStorage.setItem(OFF_KEY, "1");
        } catch (e) {}
    }
    function enable() {
      if (active) return;
      active = true;
      cursor.style.display = "block";
      body.classList.add("wii-mode-active");
    }
    function paint() {
      queued = false;
      cursor.style.transform = "translate3d(" + (x - 12) + "px," + (y - 5) + "px,0)";
    }
    cursor.addEventListener("error", function () {
      disable(false);
    });
    if (cursor.complete && cursor.naturalWidth > 0) enable();
    else if (cursor.complete) disable(false);
    else cursor.addEventListener("load", enable, { once: true });
    document.addEventListener(
      "mousemove",
      function (e) {
        if (!active) return;
        x = e.clientX;
        y = e.clientY;
        cursor.style.opacity = "1";
        if (!queued) {
          queued = true;
          requestAnimationFrame(paint);
        }
      },
      { passive: true },
    );
    document.documentElement.addEventListener("mouseleave", function () {
      cursor.style.opacity = "0";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && active) disable(true);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
