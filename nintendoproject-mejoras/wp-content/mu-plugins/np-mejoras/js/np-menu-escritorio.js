var NP = window.NP;
(function () {
  // Punto de corte único compartido con np-menu-movil y np-personalizador-menu.
  var BP =
    window.NPMenuBP ||
    (window.NPMenuBP = {
      desktop: "(min-width: 992px)",
      mobile: "not all and (min-width: 992px)",
    });
  var desktop = window.matchMedia(BP.desktop);
  var root,
    menus = [],
    desktopNames = [],
    categoriesReady = !1,
    tilesReady = !1;
  var NP_ICONOS = {
    home: NP.u("wp-content/uploads/2026/10/home.webp"),
    consolas:
      NP.u("wp-content/uploads/2026/10/all-games-1.png"),
    switch:
      NP.u("wp-content/uploads/2026/10/switchv.webp"),
    mig: NP.u("wp-content/uploads/2026/10/migswitchv.webp"),
    contacto:
      NP.u("wp-content/uploads/2026/10/agenda.webp"),
    plaza:
      NP.u("wp-content/uploads/2026/10/NINTENDOPROJECTPLAZAMII.png"),
  };
  var NP_BURBUJAS = {
    contacto: {
      img: NP.u("wp-content/uploads/2026/10/agenda.webp"),
      color: "orange",
    },
    online: {
      img: NP.u("wp-content/uploads/2026/10/jugar-1.webp"),
      color: "n64",
    },
  };
  var CYCLE_MS = 1900;
  var CY_PREFIX = "np-cy-col:",
    CY_NEUTRAL = "#7d8ea3",
    cyCache = {};
  function hexOf(r, g, b) {
    return (
      "#" +
      ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b))
        .toString(16)
        .slice(1)
    );
  }
  function iconColor(img) {
    var src = img.getAttribute("src") || "";
    if (cyCache[src]) return cyCache[src];
    try {
      var saved = window.localStorage.getItem(CY_PREFIX + src);
      if (saved && /^#[0-9a-f]{6}$/i.test(saved)) return (cyCache[src] = saved);
    } catch (e) {}
    var col = CY_NEUTRAL;
    try {
      var S = 24,
        cv = document.createElement("canvas");
      cv.width = cv.height = S;
      var cx = cv.getContext("2d", { willReadFrequently: !0 });
      cx.drawImage(img, 0, 0, S, S);
      var d = cx.getImageData(0, 0, S, S).data,
        bins = [];
      for (var i = 0; i < d.length; i += 4) {
        var r = d[i],
          g = d[i + 1],
          b = d[i + 2],
          a = d[i + 3];
        if (a < 128) continue;
        var mx = Math.max(r, g, b),
          mn = Math.min(r, g, b);
        if (mx < 45) continue;
        var sat = (mx - mn) / mx;
        if (sat < 0.32) continue;
        var h =
          mx === r
            ? ((g - b) / (mx - mn) + 6) % 6
            : mx === g
              ? (b - r) / (mx - mn) + 2
              : (r - g) / (mx - mn) + 4;
        var k = Math.floor(h * 4) % 24,
          bin = bins[k] || (bins[k] = { w: 0, r: 0, g: 0, b: 0 });
        bin.w += sat;
        bin.r += r * sat;
        bin.g += g * sat;
        bin.b += b * sat;
      }
      var best = null;
      bins.forEach(function (bn) {
        if (bn && (!best || bn.w > best.w)) best = bn;
      });
      if (best && best.w > 4)
        col = hexOf(best.r / best.w, best.g / best.w, best.b / best.w);
      try {
        window.localStorage.setItem(CY_PREFIX + src, col);
      } catch (e) {}
    } catch (e) {}
    return (cyCache[src] = col);
  }
  function mixCol(a, b, t) {
    var x = parseInt(a.slice(1), 16),
      y = parseInt(b.slice(1), 16);
    return hexOf(
      ((x >> 16) & 255) * (1 - t) + ((y >> 16) & 255) * t,
      ((x >> 8) & 255) * (1 - t) + ((y >> 8) & 255) * t,
      (x & 255) * (1 - t) + (y & 255) * t,
    );
  }
  function paintCycle(li, img) {
    var c = iconColor(img),
      n = parseInt(c.slice(1), 16);
    var lum =
      (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) /
      1000;
    li.style.setProperty("--np-cs-top", mixCol(c, "#ffffff", 0.78));
    li.style.setProperty("--np-cs-mid", mixCol(c, "#ffffff", 0.55));
    li.style.setProperty("--np-cs-bot", mixCol(c, "#ffffff", 0.28));
    li.style.setProperty("--np-cs-ptop", mixCol(c, "#ffffff", 0.25));
    li.style.setProperty("--np-cs-pbot", c);
    li.style.setProperty("--np-cs-pedge", mixCol(c, "#000000", 0.42));
    li.style.setProperty("--np-cs-ink", lum > 165 ? "#14202e" : "#ffffff");
    li.style.setProperty(
      "--np-cs-shadow",
      lum > 165
        ? "0 1px 0 rgba(255, 255, 255, .5)"
        : "0 1px 2px rgba(0, 0, 0, .4)",
    );
    li.classList.add("np-cy-ready");
  }
  function buildConsolasCycle(link, li) {
    var items = [];
    function realSrc(im) {
      if (!im) return "";
      var c = [
        im.getAttribute("data-src"),
        im.getAttribute("data-lazy-src"),
        im.getAttribute("data-litespeed-src"),
        im.getAttribute("data-original"),
        im.currentSrc,
        im.getAttribute("src"),
      ];
      for (var i = 0; i < c.length; i++)
        if (c[i] && !/^data:/i.test(c[i])) return c[i];
      var ss =
        im.getAttribute("data-srcset") ||
        im.getAttribute("data-lazy-srcset") ||
        im.getAttribute("srcset") ||
        "";
      var first = ss.split(",")[0].trim().split(/\s+/)[0];
      return first && !/^data:/i.test(first) ? first : "";
    }
    li.querySelectorAll(
      ":scope > .sub-menu > li:not(.np-oculto-pc) > a",
    ).forEach(function (a) {
      var im = a.querySelector("img");
      var s = realSrc(im);
      if (
        !s ||
        items.some(function (it) {
          return it.src === s;
        })
      )
        return;
      items.push({
        src: s,
        text: a.textContent.replace(/\s+/g, " ").trim().toUpperCase(),
        href: a.getAttribute("href") || "",
      });
    });
    var start = -1;
    items.forEach(function (it, i) {
      if (start < 0 && it.text === "NINTENDO DS") start = i;
    });
    if (start < 0)
      items.forEach(function (it, i) {
        if (start < 0 && /coleccion-completa-nintendo-ds\/?$/.test(it.href))
          start = i;
      });
    if (start > 0) items = items.slice(start).concat(items.slice(0, start));
    var srcs = items.map(function (it) {
      return it.src;
    });
    if (!srcs.length) srcs.push(NP_ICONOS.consolas);
    var bubble = document.createElement("span");
    bubble.className = "menu-icon np-tile-bubble np-cycle";
    bubble.setAttribute("aria-hidden", "true");
    var bg = document.createElement("span");
    bg.className = "np-cycle-bg";
    bubble.appendChild(bg);
    function makeImg(cls) {
      var im = document.createElement("img");
      im.className = cls;
      im.alt = "";
      im.width = 96;
      im.height = 96;
      im.decoding = "async";
      im.draggable = !1;
      bubble.appendChild(im);
      return im;
    }
    var cur = makeImg("np-cycle-img is-on");
    var nxt = makeImg("np-cycle-img");
    cur.src = srcs[0];
    link.insertBefore(bubble, link.firstChild);
    li.classList.add(
      "np-tile-bubble-item",
      "np-tile-bubble-cycle",
      "np-tile-consolas",
    );
    if (cur.complete && cur.naturalWidth) paintCycle(li, cur);
    else
      cur.addEventListener(
        "load",
        function () {
          paintCycle(li, cur);
        },
        { once: !0 },
      );
    if (srcs.length < 2) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var idx = 0,
      timer = 0,
      swapFrame = 0,
      inView = !0;
    var cycleNav = li.closest("#np-nav");
    var cycleHtml = document.documentElement;
    // Sin reflow forzado (antes: void offsetWidth). La imagen entrante se
    // "encaja" sin transición en un frame y la transición arranca en el
    // siguiente (doble requestAnimationFrame), así el navegador calcula los
    // estilos en su ciclo normal.
    function swap(n) {
      var incoming = nxt,
        outgoing = cur;
      incoming.classList.add("np-cycle-snap");
      incoming.classList.remove("is-out", "is-on");
      cur = incoming;
      nxt = outgoing;
      idx = n;
      cancelAnimationFrame(swapFrame);
      swapFrame = requestAnimationFrame(function () {
        swapFrame = requestAnimationFrame(function () {
          swapFrame = 0;
          incoming.classList.remove("np-cycle-snap");
          outgoing.classList.remove("is-on");
          outgoing.classList.add("is-out");
          incoming.classList.add("is-on");
          paintCycle(li, incoming);
        });
      });
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = 0;
      }
      nxt.onload = nxt.onerror = null;
    }
    function step() {
      if (document.hidden || !inView) {
        stop();
        return;
      }
      var n = (idx + 1) % srcs.length;
      nxt.onload = nxt.onerror = null;
      if (nxt.getAttribute("src") !== srcs[n]) nxt.src = srcs[n];
      if (nxt.complete && nxt.naturalWidth) {
        swap(n);
        return;
      }
      nxt.onload = function () {
        nxt.onload = null;
        swap(n);
      };
      nxt.onerror = function () {
        nxt.onerror = null;
        idx = n;
      };
    }
    function welcomeActive() {
      return (
        cycleHtml.classList.contains("nsw-on") ||
        cycleHtml.classList.contains("nsw-cover")
      );
    }
    var retryT = 0,
      retries = 0;
    function sync(fromRetry) {
      clearTimeout(retryT);
      retryT = 0;
      if (fromRetry !== !0) retries = 0;
      var can =
          !document.hidden &&
          !welcomeActive() &&
          !reduce.matches &&
          desktop.matches,
        on = can;
      if (on) {
        var rect = li.getBoundingClientRect();
        var css = getComputedStyle(li);
        on =
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth &&
          css.visibility !== "hidden" &&
          css.visibility !== "collapse";
        if (!on && retries < 12) {
          retries++;
          retryT = setTimeout(function () {
            sync(!0);
          }, 900);
        }
      }
      if (on) inView = !0;
      if (on && !timer) timer = setInterval(step, CYCLE_MS);
      else if (!on) stop();
    }
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pageshow", sync);
    window.addEventListener("np-welcome-closed", sync);
    window.addEventListener("load", sync);
    if (reduce.addEventListener) reduce.addEventListener("change", sync);
    else reduce.addListener(sync);
    if (desktop.addEventListener) desktop.addEventListener("change", sync);
    else desktop.addListener(sync);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var e = entries[entries.length - 1];
        if (e) inView = e.isIntersecting;
        sync();
      }).observe(li);
    }
    if ("MutationObserver" in window) {
      var welcomeState = "";
      new MutationObserver(function () {
        var state =
          String(welcomeActive()) +
          ":" +
          cycleHtml.classList.contains("nsw-nav-drop");
        if (state === welcomeState) return;
        welcomeState = state;
        sync();
      }).observe(cycleHtml, { attributes: !0, attributeFilter: ["class"] });
    }
    if (cycleNav) {
      function afterWelcomeDrop(e) {
        if (
          (e.target === cycleNav && e.animationName === "nswNavDrop") ||
          (e.target === li && e.animationName === "nswItemDrop")
        )
          sync();
      }
      cycleNav.addEventListener("animationend", afterWelcomeDrop);
      cycleNav.addEventListener("animationcancel", afterWelcomeDrop);
    }
    sync();
  }
  function iconKey(link, title) {
    var href = (link.getAttribute("href") || "")
      .replace(/[?#].*$/, "")
      .replace(/\/+$/, "")
      .toLowerCase();
    var li = link.parentElement;
    if (
      /\bCONSOLAS\b/.test(title) ||
      li.querySelector('.sub-menu a[href*="coleccion-completa-nintendo-ds"]')
    )
      return "consolas";
    if (
      /^SWITCH(?:\s+\d+)?$/.test(title) ||
      li.querySelector('.sub-menu a[href*="roms-para-switch-torrent"]')
    )
      return "switch";
    if (/roms-para-mig-switch/.test(href) || /^MIG\s*SWITCH$/.test(title))
      return "mig";
    if (/\/contacto$/.test(href) || /^CONTACTO$/.test(title)) return "contacto";
    if (/\/plaza-mii$/.test(href) || /^PLAZA MII$/.test(title)) return "plaza";
    if (/\/consolas-navegador$/.test(href) || /^JUGAR$/.test(title))
      return "online";
    if (
      /^https?:\/\/(?:www\.)?nintendoproject\.com$/.test(href) ||
      (href === "" && link.hasAttribute("href")) ||
      /^(?:HOME|INICIO)$/.test(title)
    )
      return "home";
    return "";
  }
  var MIG_URL = NP.page("roms-para-mig-switch");
  function placeMigSwitch() {
    var list = root.querySelector("#menu-main-menu");
    if (!list) return;
    var sw = null;
    list.querySelectorAll(":scope > li").forEach(function (li) {
      var a = li.querySelector(":scope > a");
      var t = a ? a.textContent.replace(/\s+/g, " ").trim().toUpperCase() : "";
      if (
        !sw &&
        (li.querySelector('.sub-menu a[href*="roms-para-switch-torrent"]') ||
          /^SWITCH(?:\s+\d+)?$/.test(t))
      )
        sw = li;
    });
    if (!sw) return;
    sw.querySelectorAll(".sub-menu > li").forEach(function (li) {
      var a = li.querySelector(":scope > a");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      var txt = a.textContent.replace(/\s+/g, " ").trim().toUpperCase();
      if (/roms-para-mig-switch/i.test(href) || /^MIG\s*SWITCH$/.test(txt))
        li.classList.add("np-oculto-pc");
    });
    var link = list.querySelector(
      ':scope > li > a[href*="roms-para-mig-switch"]',
    );
    var mig;
    if (link) {
      mig = link.parentElement;
      mig.classList.remove("menu-movil-only");
    } else {
      mig = document.createElement("li");
      mig.className = "menu-item np-menu-mig";
      var a = document.createElement("a");
      a.href = MIG_URL;
      a.textContent = "MIG SWITCH";
      mig.appendChild(a);
      if (/^\/roms-para-mig-switch\/?$/.test(window.location.pathname))
        mig.classList.add("current-menu-item");
    }
    if (sw.nextElementSibling !== mig)
      list.insertBefore(mig, sw.nextElementSibling);
  }
  var PC_URL = NP.page("multi-nintendo-project-juegos-pc");
  var PC_ICON =
    NP.u("wp-content/uploads/2026/10/PCGAMES.webp");
  function placePcGames() {
    var list = root.querySelector("#menu-main-menu");
    if (!list) return;
    var consolas = null;
    list.querySelectorAll(":scope > li").forEach(function (li) {
      var a = li.querySelector(":scope > a");
      if (!a) return;
      var t = a.textContent.replace(/\s+/g, " ").trim().toUpperCase();
      var href = (a.getAttribute("href") || "").toLowerCase();
      if (
        !consolas &&
        (li.querySelector(
          ':scope > .sub-menu a[href*="coleccion-completa-nintendo-ds"]',
        ) ||
          /\bCONSOLAS\b/.test(t))
      ) {
        consolas = li;
        return;
      }
      if (/juegos-pc/.test(href) || /^(?:JUEGOS(?: DE)? PC|PC)$/.test(t))
        li.classList.add("np-oculto-pc-top");
    });
    var sub = consolas && consolas.querySelector(":scope > .sub-menu");
    if (!sub || sub.querySelector('a[href*="juegos-pc"]')) return;
    var item = document.createElement("li");
    item.className = "menu-item np-menu-pc-consolas";
    var link = document.createElement("a");
    link.href = PC_URL;
    var img = document.createElement("img");
    img.className = "menu-icon";
    img.src = PC_ICON;
    img.alt = "";
    img.width = 44;
    img.height = 44;
    img.decoding = "async";
    img.draggable = !1;
    link.appendChild(img);
    link.appendChild(document.createTextNode(" JUEGOS DE PC"));
    item.appendChild(link);
    if (
      /^\/multi-nintendo-project-juegos-pc\/?$/.test(window.location.pathname)
    ) {
      item.classList.add("current-menu-item");
      consolas.classList.add("current-menu-ancestor");
    }
    sub.appendChild(item);
  }
  var SWITCH_EXTRAS = [
    {
      key: "mediafire",
      url: NP.page("roms-para-switch-mediafire"),
      slug: "roms-para-switch-mediafire",
      icon: NP.u("wp-content/uploads/2026/10/ARCEUSFIRE.webp"),
      label: "MEDIAFIRE",
    },
    {
      key: "torrent",
      url: NP.page("roms-para-switch-torrent"),
      slug: "roms-para-switch-torrent",
      icon: NP.u("wp-content/uploads/2026/10/citotorrentvip.webp"),
      label: "TORRENT",
    },
  ];
  function placeSwitchExtras() {
    var list = root.querySelector("#menu-main-menu");
    if (!list) return;
    var migLink = list.querySelector(
      ':scope > li > a[href*="roms-para-mig-switch"]',
    );
    var after = migLink ? migLink.parentElement : null;
    if (!after) {
      list.querySelectorAll(":scope > li").forEach(function (li) {
        if (
          !after &&
          li.querySelector(
            ':scope > .sub-menu a[href*="roms-para-switch-torrent"]',
          )
        )
          after = li;
      });
    }
    SWITCH_EXTRAS.forEach(function (x) {
      if (list.querySelector(":scope > li.np-switch-extra.np-tile-" + x.key))
        return;
      list
        .querySelectorAll(':scope > li > a[href*="' + x.slug + '"]')
        .forEach(function (a) {
          a.parentElement.classList.add("np-oculto-pc-top");
        });
      var li = document.createElement("li");
      li.className = "menu-item np-switch-extra np-has-tile np-tile-" + x.key;
      var a = document.createElement("a");
      a.href = x.url;
      a.setAttribute(
        "aria-label",
        x.label.charAt(0) + x.label.slice(1).toLowerCase(),
      );
      var img = document.createElement("img");
      img.className = "np-tile-img";
      img.src = x.icon;
      img.alt = "";
      img.width = 132;
      img.height = 132;
      img.decoding = "async";
      img.draggable = !1;
      a.appendChild(img);
      a.appendChild(document.createTextNode(x.label));
      li.appendChild(a);
      if (new RegExp("^/" + x.slug + "/?$").test(window.location.pathname))
        li.classList.add("current-menu-item");
      if (after && after.parentElement === list)
        list.insertBefore(li, after.nextElementSibling);
      else list.appendChild(li);
      after = li;
    });
  }
  var ONLINE = {
    url: NP.page("consolas-navegador"),
    label: "JUGAR",
  };
  function placeOnline() {
    var list = root.querySelector("#menu-main-menu");
    if (!list || list.querySelector(":scope > li.np-menu-online-pc")) return;
    var contacto = null,
      plaza = null;
    list.querySelectorAll(":scope > li").forEach(function (li) {
      var a = li.querySelector(":scope > a");
      if (!a) return;
      var href = (a.getAttribute("href") || "")
        .replace(/[?#].*$/, "")
        .replace(/\/+$/, "")
        .toLowerCase();
      var t = a.textContent.replace(/\s+/g, " ").trim().toUpperCase();
      if (
        !contacto &&
        (li.classList.contains("np-menu-contacto") ||
          /\/contacto$/.test(href) ||
          t === "CONTACTO")
      )
        contacto = li;
      if (
        !plaza &&
        (li.classList.contains("np-menu-plaza-mii") ||
          /\/plaza-mii$/.test(href) ||
          t === "PLAZA MII")
      )
        plaza = li;
    });
    var li = document.createElement("li");
    li.className = "menu-item np-menu-online-pc";
    var a = document.createElement("a");
    a.href = ONLINE.url;
    a.setAttribute("aria-label", "Jugar en el navegador");
    a.appendChild(document.createTextNode(ONLINE.label));
    li.appendChild(a);
    if (/^\/consolas-navegador\/?$/.test(window.location.pathname))
      li.classList.add("current-menu-item");
    if (document.body.classList.contains("logged-in")) {
      if (contacto) {
        list.insertBefore(li, contacto);
        contacto.classList.add("np-oculto-pc-top");
      } else if (plaza) list.insertBefore(li, plaza);
      else list.appendChild(li);
      placeCine(list, null);
    } else {
      if (plaza) list.insertBefore(li, plaza);
      else if (contacto) list.insertBefore(li, contacto);
      else list.appendChild(li);
      if (contacto) list.appendChild(contacto);
      placeCine(list, contacto);
    }
  }
  function placeCine(list, contacto) {
    if (list.querySelector(":scope > li.np-tile-cine")) return;
    var li = document.createElement("li");
    li.className = "menu-item np-has-tile np-tile-cine";
    var a = document.createElement("a");
    a.href = NP.page("multi-cine");
    a.setAttribute("aria-label", "Cine");
    var img = document.createElement("img");
    img.className = "np-tile-img";
    img.src =
      NP.u("wp-content/uploads/2026/10/palomitas.webp");
    img.alt = "";
    img.width = 132;
    img.height = 132;
    img.decoding = "async";
    img.draggable = !1;
    a.appendChild(img);
    a.appendChild(document.createTextNode("CINE"));
    li.appendChild(a);
    if (/^\/multi-cine\/?$/.test(window.location.pathname))
      li.classList.add("current-menu-item");
    if (contacto && contacto.parentElement === list)
      list.insertBefore(li, contacto);
    else list.appendChild(li);
  }
  function setupTiles() {
    if (tilesReady || !desktop.matches) return;
    tilesReady = !0;
    placeMigSwitch();
    placeSwitchExtras();
    placePcGames();
    placeOnline();
    root.querySelectorAll("#menu-main-menu > li > a").forEach(function (link) {
      var li = link.parentElement;
      if (li.classList.contains("np-oculto-pc-top")) return;
      var title = link.textContent.replace(/\s+/g, " ").trim().toUpperCase();
      var key = iconKey(link, title);
      if (link.querySelector(":scope > .np-tile-img")) {
        li.classList.add("np-has-tile");
      } else if (key === "consolas") {
        buildConsolasCycle(link, li);
      } else if (key && NP_BURBUJAS[key]) {
        var bubble = document.createElement("span");
        bubble.className = "menu-icon np-tile-bubble";
        bubble.setAttribute("aria-hidden", "true");
        var bimg = document.createElement("img");
        bimg.src = NP_BURBUJAS[key].img;
        bimg.alt = "";
        bimg.width = 96;
        bimg.height = 96;
        bimg.decoding = "async";
        bimg.draggable = !1;
        bubble.appendChild(bimg);
        link.insertBefore(bubble, link.firstChild);
        li.classList.add(
          "np-tile-bubble-item",
          "np-tile-bubble-" + NP_BURBUJAS[key].color,
          "np-tile-" + key,
        );
      } else if (key) {
        var img = document.createElement("img");
        img.className = "np-tile-img";
        img.src = NP_ICONOS[key];
        img.alt = "";
        img.width = 132;
        img.height = 132;
        img.decoding = "async";
        link.insertBefore(img, link.firstChild);
        li.classList.add("np-has-tile", "np-tile-" + key);
      } else {
        li.classList.add("np-tile-css");
        if (!link.querySelector(".menu-icon")) {
          var fallback = document.createElement("span");
          fallback.className = "menu-icon np-tile-fallback";
          fallback.setAttribute("aria-hidden", "true");
          fallback.textContent = title.replace(/^[\d\s]+/, "").charAt(0) || "★";
          link.insertBefore(fallback, link.firstChild);
        }
      }
      if (!link.querySelector(":scope > .np-tile-label")) {
        var label = document.createElement("span");
        label.className = "np-tile-label";
        Array.prototype.slice.call(link.childNodes).forEach(function (n) {
          if (
            n.nodeType === 3 ||
            (n.nodeType === 1 &&
              !n.matches(
                ".menu-icon, .np-tile-img, .np-menu-paint, .npmp-ma-dot, .npmp-ma-num",
              ))
          )
            label.appendChild(n);
        });
        link.appendChild(label);
      }
      link
        .querySelectorAll(".np-tile-label :is(.npmp-ma-dot, .npmp-ma-num)")
        .forEach(function (b) {
          b.remove();
        });
    });
  }
  function styleDesktopItems() {
    if (!categoriesReady) {
      root
        .querySelectorAll("#menu-main-menu > li > a")
        .forEach(function (link) {
          var title = link.textContent
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();
          var key = /\bCONSOLAS\b/.test(title)
            ? "consolas"
            : /^SWITCH(?:\s+\d+)?$/.test(title)
              ? "switch"
              : /^(?:JUEGOS(?: DE)? PC|PC)$/.test(title)
                ? "pc"
                : /^CONTACTO$/.test(title)
                  ? "contacto"
                  : /^PLAZA MII$/.test(title)
                    ? "plaza"
                    : "";
          if (key) link.parentElement.classList.add("np-desktop-item-" + key);
          if (key === "consolas") {
            var walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT),
              node;
            while ((node = walker.nextNode())) {
              if (/\b\d+\s+CONSOLAS\b/i.test(node.nodeValue))
                desktopNames.push({
                  node: node,
                  original: node.nodeValue,
                  li: link.parentElement,
                });
            }
          }
        });
      categoriesReady = !0;
    }
    desktopNames.forEach(function (item) {
      var n = desktop.matches ? countConsoles(item.li) : 0;
      item.node.nodeValue = n
        ? item.original.replace(/\b\d+\s+CONSOLAS\b/i, n + " CONSOLAS")
        : item.original;
    });
  }
  // Nº real de consolas del submenú (enlaces visibles en PC, sin "Juegos de PC").
  // 0 = no se pudo contar → se deja el texto original del menú.
  function countConsoles(li) {
    if (!li) return 0;
    var seen = {},
      n = 0;
    li.querySelectorAll(
      ":scope > .sub-menu > li:not(.np-oculto-pc):not(.np-menu-pc-consolas) > a[href]",
    ).forEach(function (a) {
      var href = (a.getAttribute("href") || "").replace(/[?#].*$/, "").replace(/\/+$/, "");
      if (!href || href === "#" || /juegos-pc/i.test(href) || seen[href]) return;
      seen[href] = 1;
      n++;
    });
    return n;
  }
  function cleanPanel(panel) {
    if (!panel || !desktop.matches) return;
    if (window.jQuery) {
      try {
        window.jQuery(panel).stop(!0, !0);
      } catch (e) {}
    }
    [
      "display",
      "height",
      "overflow",
      "padding-top",
      "padding-bottom",
      "margin-top",
      "margin-bottom",
    ].forEach(function (p) {
      if (panel.style.getPropertyValue(p)) panel.style.removeProperty(p);
    });
  }
  function sync() {
    root = document.querySelector("nav.np-desktop-glass #holaa_main_menu");
    if (!root) return;
    styleDesktopItems();
    setupTiles();
    if (!menus.length) {
      root
        .querySelectorAll("#menu-main-menu > li.menu-item-has-children")
        .forEach(function (li) {
          var button = li.querySelector(":scope > a");
          var panel = li.querySelector(":scope > .sub-menu");
          if (!button || !panel) return;
          var original = {};
          ["tabindex", "role", "aria-haspopup", "aria-expanded"].forEach(
            function (name) {
              original[name] = button.getAttribute(name);
            },
          );
          menus.push({ li: li, button: button, original: original });
          function state() {
            if (desktop.matches)
              button.setAttribute(
                "aria-expanded",
                String(
                  !li.classList.contains("np-desktop-dismissed") &&
                    (li.matches(":hover") ||
                      li.contains(document.activeElement)),
                ),
              );
          }
          li.addEventListener("mouseenter", function () {
            if (desktop.matches) {
              li.classList.remove("np-desktop-dismissed");
              state();
            }
          });
          li.addEventListener("mouseleave", function () {
            var a = document.activeElement;
            if (desktop.matches && a && a !== document.body && li.contains(a)) {
              var keyboard = !1;
              try {
                keyboard = a.matches(":focus-visible");
              } catch (err) {}
              if (!keyboard) a.blur();
            }
            state();
          });
          li.addEventListener("focusin", state);
          li.addEventListener("focusout", function () {
            setTimeout(state, 0);
          });
          li.addEventListener(
            "click",
            function (e) {
              if (!desktop.matches) return;
              if (e.target.closest(".sub-menu")) return;
              // Ya no se corta la propagación: otros oyentes (sonido,
              // analítica, scripts propios) siguen recibiendo el clic. Lo
              // único que hacía el tema aquí era desplegar/plegar el panel
              // con jQuery (slideToggle → estilos inline display/height/
              // overflow…); cleanPanel lo anula (jQuery.stop + MutationObserver
              // sobre "style") y se repite tras el resto de oyentes del clic.
              var href = (button.getAttribute("href") || "").trim();
              if (!href || href === "#" || /^javascript:/i.test(href))
                e.preventDefault();
              li.classList.remove("np-desktop-dismissed");
              cleanPanel(panel);
              state();
              setTimeout(function () {
                cleanPanel(panel);
                state();
              }, 0);
            },
            !0,
          );
          new MutationObserver(function () {
            if (desktop.matches) cleanPanel(panel);
          }).observe(panel, { attributes: !0, attributeFilter: ["style"] });
          cleanPanel(panel);
          function panelLinks() {
            var all = panel.querySelectorAll("li:not(.np-oculto-pc) > a[href]");
            var shown = Array.prototype.filter.call(all, function (a) {
              return a.getClientRects().length > 0;
            });
            return shown.length ? shown : Array.prototype.slice.call(all);
          }
          li.addEventListener("keydown", function (e) {
            if (!desktop.matches) return;
            var inPanel = panel.contains(e.target);
            if (e.key === "Escape") {
              e.preventDefault();
              li.classList.add("np-desktop-dismissed");
              button.focus();
              button.setAttribute("aria-expanded", "false");
            } else if (
              inPanel &&
              (e.key === "ArrowDown" ||
                e.key === "ArrowUp" ||
                e.key === "Home" ||
                e.key === "End")
            ) {
              var links = panelLinks();
              if (!links.length) return;
              e.preventDefault();
              var i = links.indexOf(e.target.closest("a"));
              if (e.key === "Home") i = 0;
              else if (e.key === "End") i = links.length - 1;
              else if (e.key === "ArrowDown") i = (i + 1) % links.length;
              else if (i <= 0) {
                // Flecha arriba en el primero: vuelve al enlace padre.
                button.focus();
                state();
                return;
              } else i--;
              links[i].focus();
            } else if (
              e.target === button &&
              (e.key === "ArrowDown" ||
                (!button.getAttribute("href") &&
                  (e.key === "Enter" || e.key === " ")))
            ) {
              e.preventDefault();
              li.classList.remove("np-desktop-dismissed");
              var first = panelLinks()[0];
              if (first) first.focus();
              state();
            }
          });
        });
    }
    menus.forEach(function (m) {
      if (desktop.matches) {
        // tabindex solo hace falta en <a> sin href (no enfocables de serie).
        if (!m.button.hasAttribute("href"))
          m.button.setAttribute("tabindex", "0");
        else if (m.original.tabindex === null)
          m.button.removeAttribute("tabindex");
        if (!m.button.getAttribute("href"))
          m.button.setAttribute("role", "button");
        m.button.setAttribute("aria-haspopup", "true");
        m.button.setAttribute("aria-expanded", "false");
      } else {
        m.li.classList.remove("np-desktop-dismissed");
        Object.keys(m.original).forEach(function (name) {
          if (m.original[name] === null) m.button.removeAttribute(name);
          else m.button.setAttribute(name, m.original[name]);
        });
      }
    });
  }
  if (desktop.addEventListener) desktop.addEventListener("change", sync);
  else desktop.addListener(sync);
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", sync);
  else sync();
})();
