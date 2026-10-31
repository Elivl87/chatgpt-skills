(function () {
  "use strict";
  var COOKIE_NOMBRE = "np_welcome_from";
  var SS_KEY = "npw_welcome_from";
  var RETRASO_MS = 450;
  var mostrado = !1;
  function leerCookie(nombre) {
    var esc = nombre.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1");
    var m = document.cookie.match("(?:^|; )" + esc + "=([^;]*)");
    if (!m) return null;
    try {
      return decodeURIComponent(m[1]);
    } catch (e) {
      return m[1];
    }
  }
  function borrarCookie(nombre) {
    var caducada = "; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = nombre + "=" + caducada;
    try {
      var host = location.hostname.replace(/^www\./, "");
      document.cookie = nombre + "=" + caducada + "; domain=." + host;
      document.cookie =
        nombre + "=" + caducada + "; domain=" + location.hostname;
    } catch (e) {}
  }
  function estaLogueado() {
    return /(?:^|;\s*)wordpress_logged_in_[^=]+=/.test(document.cookie);
  }
  function leerParametro(nombre) {
    try {
      return new URLSearchParams(location.search).get(nombre);
    } catch (e) {
      var m = location.search.match(new RegExp("[?&]" + nombre + "=([^&]*)"));
      return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
    }
  }
  function limpiarUrl() {
    if (!location.search || !window.history || !history.replaceState) return;
    try {
      var u = new URL(location.href);
      u.searchParams.delete("ref_by");
      u.searchParams.delete("ref");
      history.replaceState({}, "", u.pathname + u.search + u.hash);
    } catch (e) {}
  }
  function obtenerNombre() {
    var n = leerParametro("ref_by");
    if (!n) n = leerCookie(COOKIE_NOMBRE);
    if (!n) {
      try {
        n = sessionStorage.getItem(SS_KEY);
      } catch (e) {}
    }
    if (!n) return null;
    n = String(n).replace(/[<>]/g, "").trim();
    if (!n) return null;
    return n.length > 40 ? n.slice(0, 40) : n;
  }
  function mostrar(nombre) {
    if (mostrado) return !1;
    var plantilla = document.getElementById("npw-welcome-template");
    if (!plantilla || !plantilla.content) return !1;
    mostrado = !0;
    borrarCookie(COOKIE_NOMBRE);
    try {
      sessionStorage.removeItem(SS_KEY);
    } catch (e) {}
    document.body.appendChild(plantilla.content.cloneNode(!0));
    var overlay = document.getElementById("nprWelcomeOverlay");
    if (!overlay) return !1;
    var nameEl = document.getElementById("nprWelcomeName");
    if (nameEl) nameEl.textContent = nombre;
    function cerrar() {
      overlay.classList.remove("npw-popup-show");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
    }
    var cierres = overlay.querySelectorAll(".npw-popup-close, .npw-popup-cta");
    for (var i = 0; i < cierres.length; i++) {
      cierres[i].addEventListener("click", cerrar);
    }
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) cerrar();
    });
    document.addEventListener("keydown", function (e) {
      if (
        (e.key === "Escape" || e.keyCode === 27) &&
        overlay.classList.contains("npw-popup-show")
      ) {
        cerrar();
      }
    });
    void overlay.offsetWidth;
    overlay.classList.add("npw-popup-show");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return !0;
  }
  function iniciar() {
    var nombre = obtenerNombre();
    limpiarUrl();
    if (!nombre) return;
    if (estaLogueado()) {
      borrarCookie(COOKIE_NOMBRE);
      return;
    }
    setTimeout(function () {
      mostrar(nombre);
    }, RETRASO_MS);
  }
  window.npwShowWelcome = function () {
    var nombre = obtenerNombre();
    if (!nombre) return !1;
    return mostrar(nombre);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
