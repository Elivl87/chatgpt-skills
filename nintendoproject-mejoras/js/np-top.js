var NP = window.NP;
(function () {
  "use strict";
  var root = document.getElementById("np-top");
  if (!root || root.getAttribute("data-ready")) return;
  root.setAttribute("data-ready", "1");
  // Los datos (consolas y juegos) ya no van incrustados en el JS: se cargan
  // desde un JSON cacheable cuando #np-top se acerca a la pantalla.
  // URL configurable con data-src="..." en #np-top o window.NP_TOP_DATA_URL.
  // Formato: ver datos/np-top-data.ejemplo.json
  var DATA_URL =
    root.getAttribute("data-src") ||
    window.NP_TOP_DATA_URL ||
    "/wp-content/uploads/np-top/np-top-data.json";
  // --- Saneado de los datos externos (JSON) antes de usarlos en href/src/style.
  // URL: solo http(s) o relativas; se rechaza javascript:, data:, etc.
  function safeUrl(u) {
    if (typeof u !== "string") return "";
    var s = u.trim();
    if (!s) return "";
    // Los navegadores ignoran tabs/saltos/controles dentro del esquema.
    var probe = s.replace(/[\u0000-\u0020\u007f]+/g, "");
    if (/^https?:/i.test(probe)) return /^https?:\/\//i.test(probe) ? s : "";
    if (/^[a-z][a-z0-9+.\-]*:/i.test(probe)) return "";
    return s;
  }
  function urlList(a) {
    return Array.isArray(a) ? a.map(safeUrl).filter(Boolean) : a;
  }
  function isColor(c) {
    return typeof c === "string" && /^#[0-9a-f]{3,8}$/i.test(c);
  }
  // Valor CSS para style/background: sin url(), comentarios, ni rupturas.
  function safeCssVal(v) {
    return (
      typeof v === "string" &&
      v.length < 400 &&
      !/url\s*\(|expression|@import|\/\*|[<>{}\\;"'`]/i.test(v)
    );
  }
  // c.style: solo propiedades personalizadas (--x: valor) con valores seguros.
  function safeStyle(st) {
    if (typeof st !== "string") return "";
    var out = [];
    st.split(";").forEach(function (d) {
      var i = d.indexOf(":");
      if (i < 0) return;
      var k = d.slice(0, i).trim(),
        v = d.slice(i + 1).trim();
      if (/^--[a-z0-9-]{1,40}$/i.test(k) && v && safeCssVal(v))
        out.push(k + ":" + v);
    });
    return out.join(";");
  }
  function safeTheme(th) {
    return th && typeof th === "object" && safeCssVal(th.bg) ? th : null;
  }
  function sanitize(c) {
    if (!c || typeof c !== "object") return c;
    ["icon", "url", "char", "card"].forEach(function (f) {
      if (f in c) c[f] = safeUrl(c[f]);
    });
    if (!c.url) c.url = "#";
    if (Array.isArray(c.stops)) c.stops = c.stops.filter(isColor);
    c.style = safeStyle(c.style);
    c.th = safeTheme(c.th);
    if (Array.isArray(c.games))
      c.games = c.games.filter(function (g) {
        if (!g || typeof g !== "object") return !1;
        g.img = safeUrl(g.img);
        g.shots = urlList(g.shots);
        g.shotsMobile = urlList(g.shotsMobile);
        return !0;
      });
    return c;
  }
  function validConsole(c) {
    return (
      !!c &&
      typeof c.k === "string" &&
      typeof c.name === "string" &&
      Array.isArray(c.games) &&
      c.games.length > 0 &&
      Array.isArray(c.stops) &&
      c.stops.length >= 2
    );
  }
  function boot(DATA) {
    if (!DATA || !Array.isArray(DATA.consoles)) return;
    DATA.intro = safeTheme(DATA.intro) || { bg: "#0a0a0c" };
    DATA.consoles = DATA.consoles.filter(function (c) {
      return validConsole(sanitize(c));
    });
    if (!DATA.consoles.length) return;
    DATA.consoles.forEach(function (c, i) {
      c.i = i;
      c.short = c.short || c.name;
      c.label = c.label || c.short;
      c.wm = c.wm || c.short.toUpperCase();
      c.th = c.th || DATA.intro;
    });
    try {
      start(DATA);
    } catch (e) {
      if (window.console) console.error("np-top:", e);
    }
  }
  function load() {
    if (window.NP_TOP_DATA) return boot(window.NP_TOP_DATA);
    if (!window.fetch) return;
    fetch(DATA_URL, { credentials: "omit" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(boot)
      .catch(function (e) {
        if (window.console)
          console.warn("np-top: no se pudieron cargar los datos", e);
      });
  }
  function whenNear() {
    if (!("IntersectionObserver" in window)) return load();
    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            io.disconnect();
            load();
            return;
          }
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(root);
  }
  function start(DATA) {
  // Movimiento reducido: prefers-reduced-motion o preferencia "anim" del widget.
  var RM = !NP.motionOn();
  var CONS = DATA.consoles;
  var ICO = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h5v-6h4v6h5V9"/></svg>',
  };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }
  function heroList(g) {
    var mob = window.matchMedia && matchMedia("(max-width: 767px)").matches;
    if (mob && Array.isArray(g.shotsMobile) && g.shotsMobile.length)
      return g.shotsMobile.slice();
    return Array.isArray(g.shots) ? g.shots.slice() : [];
  }
  function loadChain(img, list, onOk, onFail) {
    var i = 0;
    function next() {
      if (i >= list.length) {
        img.onload = img.onerror = null;
        if (onFail) onFail(img);
        return;
      }
      img.src = list[i++];
    }
    img.onload = function () {
      if (img.naturalWidth && img.naturalWidth <= 120) {
        next();
        return;
      }
      img.onload = img.onerror = null;
      img.classList.add("ok");
      if (onOk) onOk(img);
    };
    img.onerror = next;
    next();
  }
  function coverFallback(img) {
    img.onerror = function () {
      if (img.src.indexOf("library_600x900") > -1) {
        img.src = img.src.replace("library_600x900.jpg", "header.jpg");
        return;
      }
      img.onerror = null;
    };
  }
  function platLabel(c) {
    var h =
      '<img src="' +
      esc(c.icon) +
      '" alt="" width="22" height="22" loading="lazy" decoding="async" aria-hidden="true">';
    if (c.k === "switch")
      return (
        h +
        '<span class="p-nintendo">Nintendo</span><span class="p-switch">Switch</span>'
      );
    if (c.k === "switch2")
      return (
        h +
        '<span class="p-nintendo">Nintendo</span><span class="p-switch">Switch 2</span>'
      );
    return h + esc(c.label);
  }
  function numStops(c) {
    var st = c.stops,
      n = st.length - 1;
    return st
      .map(function (col, i) {
        return (
          '<stop offset="' +
          Math.round((i / n) * 100) +
          '%" stop-color="' +
          col +
          '"/>'
        );
      })
      .join("");
  }
  function numSVG(c, gi) {
    var id = "tgn-" + esc(c.k) + "-" + gi,
      n = gi + 1,
      x = gi === 0 ? 82 : 104;
    var t = function (cls, extra) {
      return (
        '<text class="' +
        cls +
        '" x="' +
        x +
        '" y="124" text-anchor="end"' +
        extra +
        ">" +
        n +
        "</text>"
      );
    };
    return (
      '<defs><linearGradient id="' +
      id +
      '" x1="0" y1="0" x2="1" y2="1">' +
      numStops(c) +
      "</linearGradient>" +
      '<linearGradient id="' +
      id +
      's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
      t(
        "tg-n-x",
        ' transform="translate(5 6)" fill="url(#' +
          id +
          ')" stroke="url(#' +
          id +
          ')"',
      ) +
      t("tg-n-o", ' stroke="url(#' + id + ')"') +
      t("tg-n-f", ' fill="url(#' + id + ')" stroke="url(#' + id + ')"') +
      t("tg-n-s", ' fill="url(#' + id + 's)" stroke="url(#' + id + 's)"')
    );
  }
  function tileHTML(c, g, ci, gi) {
    return (
      '<div class="tg-rank-item" role="listitem" data-a="tile" style="--d:' +
      gi * 110 +
      'ms"><svg class="tg-big-num" viewBox="0 0 110 130" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">' +
      numSVG(c, gi) +
      "</svg>" +
      '<button type="button" class="tg-tile" data-feat="' +
      gi +
      '" aria-pressed="' +
      (gi === 0) +
      '" aria-label="Número ' +
      (gi + 1) +
      ": mostrar " +
      esc(g.t) +
      ' en destacado">' +
      '<span class="tg-tile-in">' +
      '<img class="tg-tile-img" src="' +
      esc(g.img) +
      '" alt="' +
      esc(g.t) +
      '" width="280" height="280" loading="lazy" decoding="async">' +
      '<span class="tg-tile-top" aria-hidden="true"><small>TOP</small><b>' +
      (gi + 1) +
      "</b></span>" +
      '<span class="tg-title"><span class="tg-plat ' +
      esc(c.k) +
      '">' +
      platLabel(c) +
      '</span><span class="tg-gname">' +
      esc(g.t) +
      "</span></span>" +
      "</span></button></div>"
    );
  }
  function heroInfoHTML(c, g, gi) {
    return (
      '<div class="tg-chips"><span class="tg-chip hl">' +
      esc(g.g) +
      '</span><span class="tg-chip">' +
      esc(c.short) +
      "</span></div>" +
      '<h3 class="tg-hero-title">' +
      esc(g.t) +
      "</h3>" +
      '<div class="tg-hero-meta">' +
      esc(g.y) +
      " · " +
      esc(g.d) +
      "</div>" +
      '<p class="tg-hero-desc">' +
      esc(g.s) +
      "</p>"
    );
  }
  function sectionHTML(c, ci) {
    var g0 = c.games[0],
      list = "",
      tiles = "";
    c.games.forEach(function (g, gi) {
      list +=
        '<button type="button" class="tg-li' +
        (gi === 0 ? " on" : "") +
        '" data-a="left" style="--d:' +
        (150 + gi * 70) +
        'ms" data-feat="' +
        gi +
        '" aria-pressed="' +
        (gi === 0) +
        '">' +
        '<img src="' +
        esc(g.img) +
        '" alt="" width="62" height="62" loading="lazy" decoding="async">' +
        "<span><b>#" +
        (gi + 1) +
        " TOP</b><strong>" +
        esc(g.t) +
        "</strong><small>" +
        esc(g.g) +
        " · " +
        esc(g.y) +
        '</small></span><i class="tg-prog"></i></button>';
      tiles += tileHTML(c, g, ci, gi);
    });
    return (
      "" +
      '<section class="tg-con" id="top-' +
      esc(c.k) +
      '" data-ci="' +
      ci +
      '" tabindex="-1" style="outline:none;' +
      esc(c.style) +
      '" aria-label="Top juegos de ' +
      esc(c.name) +
      '">' +
      '<div class="tg-con-bg" aria-hidden="true"><div class="tg-wm" data-par="-0.5">' +
      esc(c.wm) +
      "</div></div>" +
      '<div class="tg-wrap">' +
      '<header class="tg-con-head">' +
      '<div class="tg-con-eyebrow" data-a="up">' +
      '<img class="tg-con-icon" src="' +
      esc(c.icon) +
      '" alt="" width="64" height="64" loading="lazy" decoding="async">' +
      (c.cta
        ? ""
        : '<a class="tg-tag" href="' + esc(c.url) + '">Catálogo completo</a>') +
      (c.badge ? '<span class="tg-tag hot">' + esc(c.badge) + "</span>" : "") +
      (c.hideMaker
        ? ""
        : '<span class="tg-tag ghost">' +
          esc(c.maker) +
          (c.year ? " · " + esc(c.year) : "") +
          "</span>") +
      "</div>" +
      '<h2 class="tg-con-name" data-a="up" style="--d:90ms">' +
      esc(c.name) +
      "</h2>" +
      '<p class="tg-con-desc" data-a="up" style="--d:170ms">' +
      esc(c.tag) +
      "</p>" +
      (c.char
        ? '<div class="tg-char-par" data-par="-0.22" aria-hidden="true"><img class="tg-char" data-a="char" style="--d:120ms" src="' +
          esc(c.char) +
          '" alt="" loading="lazy" decoding="async"></div>'
        : "") +
      "</header>" +
      '<div class="tg-collection-action" data-a="up">' +
      (c.cta
        ? '<a class="tg-btn tg-btn-main tg-btn-col" href="' +
          esc(c.url) +
          '" aria-label="' +
          esc(c.cta) +
          " para " +
          esc(c.name) +
          '">' +
          '<span class="tg-collection-face"><img class="tg-collection-icon" src="' +
          esc(c.icon) +
          '" alt="" width="28" height="28" loading="lazy" decoding="async" aria-hidden="true">' +
          "<span>" +
          esc(c.cta) +
          "</span></span></a>"
        : '<a class="tg-btn tg-btn-main tg-btn-col" href="' +
          esc(c.url) +
          '" aria-label="Ver catálogo completo de ' +
          esc(c.name) +
          ", " +
          esc(c.size) +
          '">' +
          '<span class="tg-collection-face"><img class="tg-collection-icon" src="' +
          esc(c.icon) +
          '" alt="" width="28" height="28" loading="lazy" decoding="async" aria-hidden="true">' +
          '<span>VER CATÁLOGO<span class="tg-col-full"> COMPLETO</span> - <span class="tg-collection-size">' +
          esc(c.size) +
          "</span></span></span></a>") +
      "</div>" +
      '<div class="tg-feature">' +
      '<aside class="tg-list" aria-label="Top ' +
      c.games.length +
      " de " +
      esc(c.name) +
      '"><div class="tg-list-h" data-a="left">Top ' +
      c.games.length +
      " · " +
      esc(c.short) +
      "</div>" +
      list +
      "</aside>" +
      '<div class="tg-hero" data-a="mask" style="--d:60ms">' +
      '<div class="tg-hero-par" data-par="0.12"></div>' +
      '<div class="tg-hero-shade"></div>' +
      '<div class="tg-hero-rank"><em>#<span class="tg-rk">1</span></em> EN ' +
      esc(c.short.toUpperCase()) +
      "</div>" +
      '<button type="button" class="np-autoplay-toggle tg-auto-pos" aria-pressed="' +
      RM +
      '">Pausar rotación</button>' +
      '<div class="tg-hero-soon"' +
      (g0.soon ? "" : " hidden") +
      ">" +
      esc(g0.soon || "") +
      "</div>" +
      '<div class="tg-hero-info">' +
      heroInfoHTML(c, g0, 0) +
      "</div>" +
      "</div>" +
      "</div>" +
      '<h3 class="tg-row-h up" data-a="up"><span class="tg-top-badge">Top</span>Biblioteca <small>' +
      (c.k === "switch2"
        ? '<span class="tg-s2-red">Nintendo Switch</span> <span class="tg-s2-blue">2</span>'
        : esc(c.name)) +
      "</small></h3>" +
      '<div class="tg-grid" role="list">' +
      tiles +
      "</div>" +
      "</div>" +
      "</section>"
    );
  }
  var html =
    // Solo posición del botón de pausa; su aspecto viene de la hoja compartida.
    "<style>#np-top .tg-auto-pos{position:absolute;z-index:7;top:30px;right:46px}" +
    "@media (max-width:767px){#np-top .tg-auto-pos{top:22px;right:16px}}</style>" +
    CONS.map(sectionHTML).join("") +
    '<footer class="tg-end">' +
    '<button type="button" class="tg-btn tg-btn-ghost" data-a="up" data-go="-1">Volver arriba ↑</button>' +
    "</footer>";
  root.innerHTML = html;
  var portal = document.getElementById("np-top-portal");
  if (!portal) {
    portal = document.createElement("div");
    portal.id = "np-top-portal";
    document.body.appendChild(portal);
  }
  portal.innerHTML =
    "" +
    '<div class="tg-backdrop" aria-hidden="true"><i class="tg-bg-a"></i><i class="tg-bg-b"></i><i class="tg-bg-shade"></i></div>' +
    '<nav class="tg-nav" aria-label="Home y consolas" style="--tg-nav-count:' +
    (CONS.length + 1) +
    '">' +
    '<button type="button" class="tg-nav-home" data-go="-1" aria-label="Home: volver arriba del todo">' +
    ICO.home +
    "<span>Home</span></button>" +
    CONS.map(function (c, i) {
      return (
        '<button type="button" data-go="' +
        i +
        '" aria-label="' +
        esc(c.name) +
        '"><img src="' +
        esc(c.icon) +
        '" alt="" width="22" height="22" loading="lazy" decoding="async"><span>' +
        esc(c.name) +
        "</span></button>"
      );
    }).join("") +
    "</nav>";
  document.body.classList.add("tg-on");
  var bgLayers = portal.querySelectorAll(".tg-bg-a, .tg-bg-b");
  var nav = portal.querySelector(".tg-nav");
  var navLinks = nav.querySelectorAll("button");
  // Oculta (solo opacidad/transform) => inert para que no reciba foco.
  nav.setAttribute("inert", "");
  nav.inert = !0;
  function syncNavInert() {
    var off = !nav.classList.contains("show") || nav.classList.contains("hide");
    nav.inert = off;
    if (off) nav.setAttribute("inert", "");
    else nav.removeAttribute("inert");
  }
  nav.addEventListener("focusin", function () {
    if (nav.classList.contains("hide")) {
      nav.classList.remove("hide");
      syncNavInert();
    }
  });
  var home = document.getElementById("npHome");
  var sections = [].slice.call(root.querySelectorAll(".tg-con"));
  document.querySelectorAll("#np-top img").forEach(function (img) {
    if (img.classList.contains("tg-tile-img") || img.closest(".tg-li"))
      coverFallback(img);
  });
  function setVW() {
    root.style.setProperty(
      "--tg-vw",
      document.documentElement.clientWidth + "px",
    );
  }
  setVW();
  var S = sections.map(function (el, ci) {
    return {
      el: el,
      c: CONS[ci],
      gi: 0,
      hyd: !1,
      vis: !1,
      hero: el.querySelector(".tg-hero"),
      media: el.querySelector(".tg-hero-par"),
      info: el.querySelector(".tg-hero-info"),
      rk: el.querySelector(".tg-rk"),
      items: [].slice.call(el.querySelectorAll(".tg-li")),
      list: el.querySelector(".tg-list"),
      tiles: [].slice.call(el.querySelectorAll(".tg-tile")),
      par: [].slice.call(el.querySelectorAll("[data-par]")).map(function (n) {
        return { n: n, k: parseFloat(n.getAttribute("data-par")) };
      }),
      top: 0,
      h: 0,
    };
  });
  function setHeroImage(s, g) {
    var token = (s.imageToken = (s.imageToken || 0) + 1);
    var img = document.createElement("img");
    img.className = "tg-hero-img";
    img.alt = "";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    if (g.shotScreen) img.setAttribute("data-screen", g.shotScreen);
    var old = s.media.querySelectorAll(".tg-hero-img");
    s.media.appendChild(img);
    function discard() {
      img.onload = img.onerror = null;
      if (img.parentNode) img.parentNode.removeChild(img);
    }
    function removeOld() {
      for (var i = 0; i < old.length; i++) {
        old[i].onload = old[i].onerror = null;
        if (old[i].parentNode) old[i].parentNode.removeChild(old[i]);
      }
    }
    function reveal() {
      if (token !== s.imageToken) {
        discard();
        return;
      }
      requestAnimationFrame(function () {
        if (token !== s.imageToken) {
          discard();
          return;
        }
        img.classList.add("show");
        setTimeout(removeOld, 950);
      });
    }
    loadChain(img, heroList(g), reveal, function () {
      if (token !== s.imageToken) {
        discard();
        return;
      }
      img.removeAttribute("data-screen");
      img.style.objectPosition = "center 30%";
      loadChain(img, g.img ? [g.img] : [], reveal, function () {
        if (token === s.imageToken) removeOld();
        discard();
      });
    });
  }
  function hydrate(s) {
    if (s.hyd) return;
    s.hyd = !0;
    setHeroImage(s, s.c.games[s.gi]);
  }
  function feature(s, gi, fromUser) {
    if (gi === s.gi && s.hyd) {
      if (fromUser) restartProg(s);
      return;
    }
    var g = s.c.games[gi],
      c = s.c;
    s.gi = gi;
    s.items.concat(s.tiles).forEach(function (it) {
      var selected = +it.getAttribute("data-feat") === gi;
      it.classList.toggle("on", selected);
      it.setAttribute("aria-pressed", String(selected));
    });
    if (fromUser && s.list.scrollWidth > s.list.clientWidth) {
      var it = s.items[gi];
      s.list.scrollTo({
        left: it.offsetLeft - 10,
        behavior: RM ? "auto" : "smooth",
      });
    }
    s.hero.classList.add("swap");
    // Un solo temporizador por sección: los clics rápidos cancelan el anterior.
    clearTimeout(s.swapT);
    s.swapT = setTimeout(
      function () {
        s.swapT = 0;
        s.info.innerHTML = heroInfoHTML(c, g, gi);
        s.rk.textContent = gi + 1;
        var soon = s.hero.querySelector(".tg-hero-soon");
        if (soon) {
          soon.textContent = g.soon || "";
          soon.hidden = !g.soon;
        }
        s.hero.classList.remove("swap");
      },
      RM ? 0 : 280,
    );
    setHeroImage(s, g);
    restartProg(s);
  }
  // Rotación automática: desactivada si el movimiento está reducido; el
  // usuario puede pausarla/reanudarla con el botón .np-autoplay-toggle.
  var autoPaused = RM;
  function restartProg(s) {
    s.el.classList.remove("run");
    if (autoPaused) return;
    void s.el.offsetWidth;
    s.el.classList.add("run");
  }
  // hold = ratón encima || foco dentro || toque reciente || pestaña oculta.
  var docHidden = !!document.hidden;
  function syncHold(s) {
    s.el.classList.toggle(
      "hold",
      !!(s.hover || s.focus || s.touch || docHidden),
    );
  }
  function setAutoPaused(p) {
    autoPaused = !!p;
    [].forEach.call(root.querySelectorAll(".np-autoplay-toggle"), function (b) {
      b.setAttribute("aria-pressed", String(autoPaused));
    });
    S.forEach(function (s) {
      if (autoPaused) s.el.classList.remove("run");
      else if (s.vis || !HAS_IO) restartProg(s);
    });
  }
  root.addEventListener("animationend", function (e) {
    if (e.animationName !== "tg-prog") return;
    var sec = e.target.closest(".tg-con");
    if (!sec) return;
    var s = S[+sec.getAttribute("data-ci")];
    feature(s, (s.gi + 1) % s.c.games.length, !1);
  });
  sections.forEach(function (sec, ci) {
    var s = S[ci];
    var feat = sec.querySelector(".tg-feature");
    feat.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") {
        s.hover = !0;
        syncHold(s);
      }
    });
    feat.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") {
        s.hover = !1;
        syncHold(s);
      }
    });
    feat.addEventListener("focusin", function () {
      s.focus = !0;
      syncHold(s);
    });
    feat.addEventListener("focusout", function (e) {
      if (e.relatedTarget && feat.contains(e.relatedTarget)) return;
      s.focus = !1;
      syncHold(s);
    });
    // El toque mantiene la pausa mientras dura y un poco después.
    feat.addEventListener(
      "touchstart",
      function () {
        clearTimeout(s.touchT);
        s.touch = !0;
        syncHold(s);
      },
      { passive: !0 },
    );
    function touchOff() {
      clearTimeout(s.touchT);
      s.touchT = setTimeout(function () {
        s.touch = !1;
        syncHold(s);
      }, 1500);
    }
    feat.addEventListener("touchend", touchOff, { passive: !0 });
    feat.addEventListener("touchcancel", touchOff, { passive: !0 });
  });
  var HAS_IO = "IntersectionObserver" in window;
  var animEls = root.querySelectorAll("[data-a]");
  if (RM || !HAS_IO) {
    for (var a = 0; a < animEls.length; a++) animEls[a].classList.add("in");
  }
  if (!HAS_IO) {
    // Sin IntersectionObserver: solo la primera; el resto se hidrata por
    // proximidad desde update() (scroll).
    if (S[0]) hydrate(S[0]);
  } else {
    if (!RM) {
      var watch = new Map();
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            (watch.get(en.target) || []).forEach(function (el) {
              el.classList.add("in");
            });
            watch.delete(en.target);
            io.unobserve(en.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );
      for (var b = 0; b < animEls.length; b++) {
        var el = animEls[b],
          node = el.getAttribute("data-a") === "mask" ? el.parentNode : el;
        var l = watch.get(node);
        if (!l) {
          l = [];
          watch.set(node, l);
          io.observe(node);
        }
        l.push(el);
      }
    }
    // Hidratación por proximidad también con movimiento reducido.
    var near = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var s = S[+en.target.getAttribute("data-ci")];
          if (en.isIntersecting) hydrate(s);
        });
      },
      { rootMargin: "900px 0px 900px 0px" },
    );
    var vis = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var s = S[+en.target.getAttribute("data-ci")];
          s.vis = en.isIntersecting;
          s.el.classList.toggle("vis", s.vis);
          if (s.vis) {
            if (!s.el.classList.contains("run")) restartProg(s);
          } else s.el.classList.remove("run");
        });
      },
      { threshold: 0.25 },
    );
    sections.forEach(function (sec) {
      near.observe(sec);
      vis.observe(sec);
    });
  }
  var CSS_PAR = !!(
    window.CSS &&
    CSS.supports &&
    CSS.supports("animation-timeline: view()")
  );
  var JS_PAR =
    !RM &&
    !CSS_PAR &&
    window.matchMedia &&
    matchMedia("(hover: hover) and (pointer: fine)").matches;
  var vh = innerHeight,
    introBottom = 0,
    ticking = !1,
    activeIdx = -2,
    navShown = !1,
    lastY = 0,
    bgFlip = 0;
  function measure() {
    vh = innerHeight;
    var sy = scrollY || pageYOffset;
    S.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      s.top = r.top + sy;
      s.h = r.height;
    });
    var hr = (home || root).getBoundingClientRect();
    introBottom = (home ? hr.bottom : hr.top) + sy;
  }
  function setBg(idx) {
    var th = idx >= 0 ? CONS[idx].th : DATA.intro;
    var next = bgLayers[(bgFlip ^= 1)],
      prev = bgLayers[bgFlip ^ 1];
    next.style.background = th.bg;
    next.classList.add("on");
    prev.classList.remove("on");
  }
  function update() {
    ticking = !1;
    var sy = scrollY || pageYOffset,
      mid = sy + vh * 0.5;
    var idx = -1;
    for (var i = 0; i < S.length; i++) {
      if (mid >= S[i].top) idx = i;
      else break;
    }
    if (idx !== activeIdx) {
      activeIdx = idx;
      setBg(idx);
      var activeLink = null;
      for (var n = 0; n < navLinks.length; n++) {
        var selected = +navLinks[n].getAttribute("data-go") === idx;
        navLinks[n].classList.toggle("on", selected);
        if (selected) {
          navLinks[n].setAttribute("aria-current", "location");
          activeLink = navLinks[n];
        } else navLinks[n].removeAttribute("aria-current");
      }
      if (activeLink && nav.scrollWidth > nav.clientWidth) {
        nav.scrollTo({
          left:
            activeLink.offsetLeft -
            nav.clientWidth / 2 +
            activeLink.offsetWidth / 2,
          behavior: RM ? "auto" : "smooth",
        });
      }
    }
    var showNav = sy + vh * 0.35 > introBottom;
    if (showNav !== navShown) {
      nav.classList.toggle("show", showNav);
      navShown = showNav;
    }
    if (innerWidth <= 1100) {
      if (sy > lastY + 6) {
        // No se esconde mientras tenga el foco del teclado.
        if (!nav.contains(document.activeElement)) nav.classList.add("hide");
      } else if (sy < lastY - 6) nav.classList.remove("hide");
    } else nav.classList.remove("hide");
    syncNavInert();
    lastY = sy;
    if (!HAS_IO) {
      // Hidratación por proximidad sin IntersectionObserver.
      for (var hq = 0; hq < S.length; hq++) {
        var hs = S[hq];
        if (!hs.hyd && hs.top < sy + vh * 2 && hs.top + hs.h > sy - vh)
          hydrate(hs);
      }
    }
    if (!JS_PAR) return;
    for (var k = 0; k < S.length; k++) {
      var s = S[k];
      if (s.top + s.h < sy - 100 || s.top > sy + vh + 100) continue;
      var p = (s.top + s.h * 0.5 - mid) / vh;
      for (var q = 0; q < s.par.length; q++) {
        s.par[q].n.style.transform =
          "translate3d(0," + (p * s.par[q].k * 220).toFixed(1) + "px,0)";
      }
    }
  }
  function onScroll() {
    if (!ticking) {
      ticking = !0;
      requestAnimationFrame(update);
    }
  }
  var rzT = 0;
  function onResize() {
    clearTimeout(rzT);
    rzT = setTimeout(function () {
      setVW();
      measure();
      onScroll();
    }, 120);
  }
  measure();
  update();
  addEventListener("scroll", onScroll, { passive: !0 });
  addEventListener("resize", onResize, { passive: !0 });
  addEventListener("load", function () {
    measure();
    onScroll();
  });
  if ("ResizeObserver" in window) {
    var roT = 0;
    var ro = new ResizeObserver(function () {
      clearTimeout(roT);
      roT = setTimeout(function () {
        measure();
        onScroll();
      }, 80);
    });
    ro.observe(root);
    if (home) ro.observe(home);
  }
  window.npTopHomeHidden = !1;
  if (home && "IntersectionObserver" in window) {
    var paused = [];
    new IntersectionObserver(
      function (en) {
        var vis = en[0].isIntersecting;
        window.npTopHomeHidden = !vis;
        if (!vis) {
          paused = [].filter.call(home.querySelectorAll("video"), function (v) {
            return !v.paused;
          });
          paused.forEach(function (v) {
            try {
              v.pause();
            } catch (e) {}
          });
        } else {
          paused.forEach(function (v) {
            var p = v.play && v.play();
            if (p && p.catch) p.catch(function () {});
          });
          paused = [];
        }
      },
      { threshold: 0 },
    ).observe(home);
  }
  function headH() {
    var h = document.getElementById("np-nav");
    if (h) {
      var r = h.getBoundingClientRect();
      if (r.bottom > 0 && r.bottom < innerHeight * 0.4) return r.bottom;
    }
    return 0;
  }
  var goTok = 0;
  function targetY(i) {
    return i < 0 ? 0 : S[i].top - headH() + (innerWidth <= 767 ? 10 : 24);
  }
  var goCancel = null;
  var SCROLL_KEYS = /^(Arrow(Up|Down)|Page(Up|Down)|Home|End| |Spacebar)$/;
  function focusSection(i) {
    var el = i < 0 ? home : S[i] && S[i].el;
    if (!el) return;
    if (!el.hasAttribute("tabindex")) {
      el.setAttribute("tabindex", "-1");
      el.style.outline = "none";
    }
    try {
      el.focus({ preventScroll: !0 });
    } catch (e) {}
  }
  // Salto suave a una sección. Un nuevo goTo o cualquier scroll del usuario
  // (rueda, toque, teclas de desplazamiento) cancela la corrección pendiente.
  function goTo(i) {
    if (goCancel) goCancel();
    var tok = ++goTok;
    measure();
    var y0 = targetY(i);
    var HAS_END = "onscrollend" in window;
    var fixT = 0;
    var opt = { passive: !0, capture: !0 };
    function cleanup() {
      clearTimeout(fixT);
      if (HAS_END) removeEventListener("scrollend", fix);
      removeEventListener("wheel", onUser, opt);
      removeEventListener("touchstart", onUser, opt);
      removeEventListener("keydown", onUser, opt);
      if (goCancel === cleanup) goCancel = null;
    }
    function onUser(e) {
      if (e.type === "keydown" && !SCROLL_KEYS.test(e.key)) return;
      if (tok === goTok) goTok++;
      cleanup();
    }
    function fix() {
      if (tok !== goTok) return cleanup();
      cleanup();
      measure();
      var y = targetY(i);
      if (Math.abs((scrollY || pageYOffset) - y) > 6)
        scrollTo({ top: y, behavior: "auto" });
      focusSection(i);
    }
    if (Math.abs((scrollY || pageYOffset) - y0) <= 6) {
      // Ya estamos en destino: no hay scroll ni scrollend que esperar.
      focusSection(i);
      return;
    }
    goCancel = cleanup;
    scrollTo({ top: y0, behavior: RM ? "auto" : "smooth" });
    if (HAS_END) addEventListener("scrollend", fix);
    addEventListener("wheel", onUser, opt);
    addEventListener("touchstart", onUser, opt);
    addEventListener("keydown", onUser, opt);
    fixT = setTimeout(fix, RM ? 60 : 1400);
  }
  var ALIAS = { "coleccion-de-juegos-para-nintendo-switch": "switch" };
  function slug(u) {
    return String(u || "")
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/[?#].*$/, "")
      .replace(/^\/+|\/+$/g, "")
      .toLowerCase();
  }
  window.npTopJump = function (url) {
    var sl = slug(url),
      k = ALIAS[sl];
    for (var i = 0; i < CONS.length; i++) {
      if (slug(CONS[i].url) === sl || CONS[i].k === k) {
        goTo(i);
        return !0;
      }
    }
    return !1;
  };
  (function () {
    var curHidden = !1,
      cursorEl = null;
    function cur() {
      return cursorEl && cursorEl.isConnected
        ? cursorEl
        : (cursorEl = document.getElementById("wii-cursor-global"));
    }
    function hideCur() {
      var c = cur();
      if (c && !curHidden) {
        c.style.visibility = "hidden";
        curHidden = !0;
      }
    }
    function showCur() {
      if (curHidden) {
        var c = cur();
        if (c) c.style.visibility = "";
        curHidden = !1;
      }
    }
    function onScrollbar(x, y, t) {
      var de = document.documentElement;
      if (x >= de.clientWidth || y >= de.clientHeight) return !0;
      if (!t || t.nodeType !== 1 || t === de || t === document.body) return !1;
      var cw = t.clientWidth,
        ch = t.clientHeight;
      var sv = cw && t.scrollHeight > ch,
        sh = ch && t.scrollWidth > cw;
      if (!sv && !sh) return !1;
      // Equivale a offsetX/offsetY (desde el borde de relleno).
      var r = t.getBoundingClientRect(),
        ox = x - r.left - t.clientLeft,
        oy = y - r.top - t.clientTop;
      return !!((sv && ox > cw) || (sh && oy > ch));
    }
    // mousemove: como mucho una lectura de layout por frame.
    var mmRaf = 0,
      mmX = 0,
      mmY = 0,
      mmT = null;
    document.addEventListener(
      "mousemove",
      function (e) {
        mmX = e.clientX;
        mmY = e.clientY;
        mmT = e.target;
        if (mmRaf) return;
        mmRaf = requestAnimationFrame(function () {
          mmRaf = 0;
          var t = mmT;
          mmT = null;
          if (onScrollbar(mmX, mmY, t)) hideCur();
          else showCur();
        });
      },
      { passive: !0, capture: !0 },
    );
    document.addEventListener(
      "mousedown",
      function (e) {
        if (onScrollbar(e.clientX, e.clientY, e.target)) hideCur();
      },
      { passive: !0, capture: !0 },
    );
    document.addEventListener(
      "mouseover",
      function (e) {
        if (e.target && e.target.tagName === "IFRAME") hideCur();
      },
      { passive: !0, capture: !0 },
    );
    document.documentElement.addEventListener("mouseleave", hideCur);
    addEventListener("blur", hideCur);
  })();
  root.addEventListener("click", function (e) {
    var t;
    if (e.target.closest(".np-autoplay-toggle")) {
      setAutoPaused(!autoPaused);
      return;
    }
    if ((t = e.target.closest("[data-feat]"))) {
      var s = S[+t.closest(".tg-con").getAttribute("data-ci")];
      feature(s, +t.getAttribute("data-feat"), !0);
      return;
    }
    if ((t = e.target.closest("[data-go]"))) {
      e.preventDefault();
      goTo(+t.getAttribute("data-go"));
    }
  });
  nav.addEventListener("click", function (e) {
    var t = e.target.closest("[data-go]");
    if (t) {
      e.preventDefault();
      goTo(+t.getAttribute("data-go"));
    }
  });
  // La pestaña oculta pausa sin borrar el estado de ratón/foco/toque.
  document.addEventListener("visibilitychange", function () {
    docHidden = !!document.hidden;
    S.forEach(syncHold);
  });
  if (location.hash && location.hash.indexOf("#top-") === 0) {
    var k = location.hash.slice(5);
    for (var h = 0; h < CONS.length; h++)
      if (CONS[h].k === k) {
        var hi = h;
        setTimeout(function () {
          measure();
          goTo(hi);
        }, 400);
        break;
      }
  }
  }
  whenNear();
})();

