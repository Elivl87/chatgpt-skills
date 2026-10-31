(function () {
  if (window.__npProtect) return;
  window.__npProtect = !0;
  var html = document.documentElement;
  html.classList.add("np-protect");
  function editable(t) {
    return !!(
      t &&
      t.closest &&
      t.closest(
        'input, textarea, select, [contenteditable=""], [contenteditable="true"]',
      )
    );
  }
  document.addEventListener(
    "contextmenu",
    function (e) {
      if (!editable(e.target)) e.preventDefault();
    },
    !0,
  );
  document.addEventListener(
    "dragstart",
    function (e) {
      var t = e.target;
      if (
        t &&
        (t.tagName === "IMG" || t.tagName === "VIDEO" || t.tagName === "svg")
      )
        e.preventDefault();
    },
    !0,
  );
  document.addEventListener(
    "keydown",
    function (e) {
      var k = (e.key || "").toLowerCase(),
        mod = e.ctrlKey || e.metaKey;
      if (
        e.key === "F12" ||
        (mod &&
          e.shiftKey &&
          (k === "i" || k === "j" || k === "c" || k === "k")) ||
        (e.metaKey &&
          e.altKey &&
          (k === "i" || k === "j" || k === "c" || k === "u")) ||
        (mod && !e.shiftKey && (k === "u" || k === "s"))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    !0,
  );
  function lockVideos(root) {
    [].forEach.call((root || document).querySelectorAll("video"), function (v) {
      v.setAttribute(
        "controlslist",
        "nodownload noplaybackrate noremoteplayback",
      );
      v.setAttribute("disablepictureinpicture", "");
    });
  }
  lockVideos();
  if ("MutationObserver" in window)
    new MutationObserver(function (m) {
      for (var i = 0; i < m.length; i++)
        for (var j = 0; j < m[i].addedNodes.length; j++) {
          var n = m[i].addedNodes[j];
          if (n.nodeType === 1) {
            if (n.tagName === "VIDEO") lockVideos(n.parentNode);
            else if (n.querySelector && n.querySelector("video")) lockVideos(n);
          }
        }
    }).observe(document.documentElement, { childList: !0, subtree: !0 });
})();
(function () {
  if (window.NPNivel) return;
  var PREFIX = "np-nivel-v1:";
  var MAX = 100;
  var cache = {};
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function hoy() {
    var d = new Date();
    return (
      d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate())
    );
  }
  function limpiar(raw) {
    var u = String(raw == null ? "" : raw).trim();
    if (!u || /^\[.*\]$/.test(u)) return "";
    return u.toLowerCase();
  }
  function normalizar(raw) {
    var canon = limpiar(window.NP_USUARIO);
    if (canon) return canon;
    return limpiar(raw) || "invitado";
  }
  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(36);
  }
  function valido(o) {
    return !!(
      o &&
      typeof o.dias === "number" &&
      o.dias >= 1 &&
      typeof o.ultimoDia === "string"
    );
  }
  function leerLS(u) {
    try {
      var o = JSON.parse(localStorage.getItem(PREFIX + u) || "null");
      return valido(o) ? o : null;
    } catch (e) {
      return null;
    }
  }
  function leerCookie(u) {
    try {
      var m = document.cookie.match(
        new RegExp("(?:^|; )npnv1_" + hash(u) + "=([^;]*)"),
      );
      if (!m) return null;
      var o = JSON.parse(decodeURIComponent(m[1]));
      return valido(o) ? o : null;
    } catch (e) {
      return null;
    }
  }
  function leer(u) {
    var a = leerLS(u),
      b = leerCookie(u);
    if (a && b) return a.dias >= b.dias ? a : b;
    return a || b;
  }
  function guardar(u, o) {
    var s = JSON.stringify(o);
    try {
      localStorage.setItem(PREFIX + u, s);
    } catch (e) {}
    try {
      document.cookie =
        "npnv1_" +
        hash(u) +
        "=" +
        encodeURIComponent(s) +
        "; max-age=34560000; path=/; SameSite=Lax" +
        (location.protocol === "https:" ? "; Secure" : "");
    } catch (e) {}
  }
  function fusionar(o, alias, u) {
    if (!alias || alias === u) return o;
    var b = leer(alias);
    if (!b) return o;
    if (!o)
      return {
        v: 1,
        dias: b.dias,
        primerDia: b.primerDia || b.ultimoDia,
        ultimoDia: b.ultimoDia,
      };
    if (b.dias > o.dias) o.dias = b.dias;
    if (b.ultimoDia > o.ultimoDia) o.ultimoDia = b.ultimoDia;
    if (b.primerDia && (!o.primerDia || b.primerDia < o.primerDia))
      o.primerDia = b.primerDia;
    return o;
  }
  function nivelDe(o) {
    return Math.max(1, Math.min(MAX, o ? o.dias : 1));
  }
  function emitir(r) {
    try {
      window.dispatchEvent(new CustomEvent("np:nivel", { detail: r }));
    } catch (e) {}
  }
  var fusionados = {};
  function registrar(raw) {
    var u = normalizar(raw);
    var alias = limpiar(raw);
    if (cache[u] && (!alias || alias === u || fusionados[u + "|" + alias]))
      return cache[u];
    if (alias && alias !== u) fusionados[u + "|" + alias] = 1;
    if (cache[u] && !leer(alias)) return cache[u];
    delete cache[u];
    var o = fusionar(leer(u), alias, u);
    var t = hoy(),
      antes = o ? nivelDe(o) : 0,
      cambio = !1;
    if (!o) {
      o = { v: 1, dias: 1, primerDia: t, ultimoDia: t };
      cambio = !0;
    } else if (t > o.ultimoDia) {
      o.dias = Math.min(o.dias + 1, 9999);
      o.ultimoDia = t;
      cambio = !0;
    }
    guardar(u, o);
    var r = {
      usuario: u,
      nivel: nivelDe(o),
      max: MAX,
      dias: o.dias,
      primerDia: o.primerDia,
      ultimoDia: o.ultimoDia,
      nivelAnterior: antes,
      subioHoy: cambio && antes > 0,
    };
    cache[u] = r;
    try {
      if (navigator.storage && navigator.storage.persist)
        navigator.storage.persist().catch(function () {});
    } catch (e) {}
    return r;
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) return;
    Object.keys(cache).forEach(function (u) {
      if (cache[u].ultimoDia !== hoy()) {
        delete cache[u];
        emitir(registrar(u));
      }
    });
  });
  window.addEventListener("storage", function (e) {
    if (!e.key || e.key.indexOf(PREFIX) !== 0) return;
    var u = e.key.slice(PREFIX.length);
    if (cache[u]) {
      delete cache[u];
      emitir(registrar(u));
    }
  });
  window.NPNivel = {
    registrar: registrar,
    normalizar: normalizar,
    hoy: hoy,
    MAX: MAX,
  };
})();
