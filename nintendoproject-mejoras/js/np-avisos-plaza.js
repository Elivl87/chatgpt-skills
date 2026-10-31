var NP = window.NP;
(function () {
  "use strict";
  var N = 0,
    D = 0,
    DENTRO = !1;
  var VIVO = !1,
    TS = 1793473005,
    CADA = 120 * 1000;
  var URL = NP.u("wp-admin/admin-ajax.php");
  var SEL =
    "#menu-main-menu > li.np-menu-plaza-mii > a, #menu-main-menu > li.np-tile-plaza > a, #menu-main-menu > li.np-desktop-item-plaza > a, a.np-plaza-shortcut, a.np-plaza-btn";
  function icono(a) {
    return a.querySelector(".np-tile-img, .menu-icon, img") || a;
  }
  function colocar(a) {
    var marca = a.querySelector(":scope > .npmp-ma");
    if (!marca) {
      marca = document.createElement("span");
      marca.setAttribute("aria-hidden", "true");
      if (getComputedStyle(a).position === "static")
        a.style.position = "relative";
      a.appendChild(marca);
    }
    if (marca._n !== N) pintar(a, marca);
    var ic = icono(a),
      ra = a.getBoundingClientRect(),
      ri = ic.getBoundingClientRect();
    if (!ri.width || !a.offsetWidth) return;
    var sx = ra.width / a.offsetWidth || 1,
      sy = ra.height / a.offsetHeight || 1;
    var w = marca.offsetWidth || 14;
    marca.style.left = ((ri.right - ra.left) / sx - w * 0.7).toFixed(1) + "px";
    marca.style.top = ((ri.top - ra.top) / sy - w * 0.3).toFixed(1) + "px";
    if (!a._npmpSigue) {
      a._npmpSigue = !0;
      [
        "mouseenter",
        "mouseleave",
        "pointerdown",
        "pointerup",
        "pointercancel",
        "focus",
        "blur",
        "touchstart",
        "touchend",
      ].forEach(function (ev) {
        a.addEventListener(
          ev,
          function () {
            seguir(a);
          },
          { passive: !0 },
        );
      });
    }
  }
  function pintar(a, marca) {
    marca._n = N;
    if (N > 0) {
      marca.className = "npmp-ma npmp-ma-num";
      marca.textContent = N > 98 ? "99+" : String(N);
      a.setAttribute(
        "aria-label",
        "Plaza Mii (" + N + (N === 1 ? " aviso nuevo)" : " avisos nuevos)"),
      );
    } else {
      marca.className = "npmp-ma npmp-ma-dot";
      marca.textContent = "";
      a.removeAttribute("aria-label");
    }
  }
  function seguir(a) {
    var fin = Date.now() + 700;
    if (a._npmpRaf) return void (a._npmpFin = fin);
    a._npmpFin = fin;
    (function paso() {
      colocar(a);
      if (Date.now() < a._npmpFin) a._npmpRaf = requestAnimationFrame(paso);
      else a._npmpRaf = 0;
    })();
  }
  function todo() {
    document.querySelectorAll(SEL).forEach(colocar);
  }
  todo();
  [300, 1000, 2500].forEach(function (ms) {
    setTimeout(todo, ms);
  });
  window.addEventListener("load", todo);
  var t = 0;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(todo, 150);
  });
  document.addEventListener("npplaza:dentro", function () {
    VIVO = !1;
    DENTRO = !0;
    if (N !== D) {
      N = D;
      todo();
    }
  });
  document.addEventListener("npplaza:privados", function (e) {
    var ns = e && e.detail ? +e.detail.personas : NaN;
    if (!DENTRO || isNaN(ns)) return;
    D = Math.min(99, ns);
    if (N !== D) {
      N = D;
      todo();
    }
  });
  if (!VIVO || !window.fetch) return;
  var ultima = Date.now(),
    fin = Date.now() + 30 * 60 * 1000,
    pidiendo = !1;
  function mirar() {
    if (!VIVO || pidiendo || document.hidden || Date.now() > fin) return;
    pidiendo = !0;
    ultima = Date.now();
    fetch(URL + "?action=npmp_menu_avisos", {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (j) {
        if (
          j &&
          j.success &&
          j.data &&
          typeof j.data.n === "number" &&
          j.data.n !== N
        ) {
          N = j.data.n;
          todo();
        }
      })
      .catch(function () {})
      .then(function () {
        pidiendo = !1;
      });
  }
  if (Math.abs(Date.now() / 1000 - TS) > 90) setTimeout(mirar, 1500);
  setInterval(function () {
    if (Date.now() - ultima >= CADA - 1000) mirar();
  }, 15000);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && Date.now() - ultima > 45000) mirar();
  });
})();
