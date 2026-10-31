/*!
 * np-sonido-enlaces.js — sonido opcional al pulsar enlaces.
 * Antes: preventDefault() en TODOS los enlaces + navegación a los 75 ms.
 * Rompía Ctrl/Cmd/Mayús/clic central, anclas (#) y añadía retraso a cada clic.
 * Ahora: no se intercepta la navegación nunca; solo suena si el usuario
 * activó el sonido (NP.soundOn()) y el clic es un clic normal.
 */
(function () {
  "use strict";
  var NP = window.NP;
  var audio = null;
  function sound() {
    if (audio) return audio;
    audio = document.getElementById("link-sound");
    if (audio) audio.preload = "none";
    return audio;
  }
  document.addEventListener(
    "click",
    function (e) {
      if (!NP || !NP.soundOn()) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!a || a.hasAttribute("download")) return;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#" || /^javascript:/i.test(href)) return;
      var s = sound();
      if (!s) return;
      try {
        s.currentTime = 0;
        var p = s.play();
        if (p && p.catch) p.catch(function () {});
      } catch (err) {}
    },
    true,
  );
})();
