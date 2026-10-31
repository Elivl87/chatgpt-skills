/*!
 * np-videos.js — reproducción automática SOLO de los vídeos marcados para ello.
 * Antes: forzaba muted + play() en todos los <video> de la página.
 * Ahora: solo vídeos con atributo autoplay o data-np-autoplay, y nunca si
 * el usuario prefiere movimiento reducido.
 */
(function () {
  "use strict";
  var NP = window.NP;
  function init() {
    var vids = document.querySelectorAll("video[autoplay], video[data-np-autoplay]");
    Array.prototype.forEach.call(vids, function (v) {
      if (NP && !NP.motionOn()) {
        v.removeAttribute("autoplay");
        try {
          v.pause();
        } catch (e) {}
        return;
      }
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
