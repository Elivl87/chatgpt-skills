var NP = window.NP;
(function () {
  "use strict";
  // Punto de corte único compartido con np-menu-movil y np-menu-escritorio.
  var BP =
    window.NPMenuBP ||
    (window.NPMenuBP = {
      desktop: "(min-width: 992px)",
      mobile: "not all and (min-width: 992px)",
    });
  var desktop = window.matchMedia(BP.desktop);
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var nav, bar, trigger, panel, box, controls, preference, storageKey;
  var closingTimer,
    closingReturnFocus = !1,
    inertNodes = [],
    inertObserver = null,
    scrollLocks = [],
    opener = null,
    savedScrollY = null,
    intensityFrame = 0;
  var paintNodes = [],
    paintTimer,
    clearPaintTimer;
  var menuDropTimer,
    panelDropTimer,
    dropNodes = [];
  var coverOpen = !1,
    coverEnterTimer;
  var scroller = null,
    scrollbarUpdate = function () {};
  // Sonido compartido con np-menu-movil (window.NPMenuSound, un solo Audio).
  // Solo suena si el usuario lo activó (NP.soundOn()); se crea en la primera
  // reproducción real, sin precarga.
  function menuSound() {
    var s = window.NPMenuSound;
    if (s && typeof s.play === "function") return s;
    var SRC = NP.u("wp-content/uploads/2026/07/ajustes.mp3");
    var audio = null;
    s = window.NPMenuSound = {
      play: function () {
        if (!NP.soundOn()) return;
        try {
          if (!audio) {
            audio = new Audio(SRC);
            audio.volume = 0.6;
            (window.npAudioReg = window.npAudioReg || []).push(audio);
          }
          audio.currentTime = 0;
          var p = audio.play();
          if (p && p.catch) p.catch(function () {});
        } catch (e) {}
      },
    };
    return s;
  }
  function playOpenSound() {
    menuSound().play();
  }
  var PALETTE_SVG =
    '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
    '<defs><linearGradient id="np3dsIco" x1="0" y1="4" x2="0" y2="30" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0" stop-color="#6fb6f5"/><stop offset="1" stop-color="#2f7fd1"/></linearGradient></defs>' +
    '<path fill="url(#np3dsIco)" d="M13 3.6c.4 0 .8.1 1.1.4l9.6 8.2c.7.6.3 1.8-.7 1.8H21v10.8c0 .9-.7 1.6-1.6 1.6h-3.7v-6.2c0-.6-.4-1-1-1h-3.4c-.6 0-1 .4-1 1v6.2H6.6c-.9 0-1.6-.7-1.6-1.6V14H3c-1 0-1.4-1.2-.7-1.8l9.6-8.2c.3-.3.7-.4 1.1-.4z"/>' +
    '<g transform="translate(13.6 12.6) scale(.76)">' +
    '<path fill="url(#np3dsIco)" stroke="#eceef1" stroke-width="3.6" stroke-linejoin="round" paint-order="stroke" ' +
    'd="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>' +
    "</g></svg>";
  var COVER_ICO =
    '<svg class="np-cover-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<rect x="2.5" y="4" width="15.5" height="12.5" rx="2.6" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M5.5 13.5l3.3-3.4 2.6 2.6 1.7-1.7 2.4 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="13.6" cy="7.9" r="1.4" fill="currentColor"/>' +
    '<path d="M6.5 20h12a3 3 0 0 0 3-3V8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var CHEV_ICO =
    '<svg class="np-cover-chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHECK_ICO =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var LOCK_ICO =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.6" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><circle cx="12" cy="15.6" r="1.6" fill="#fff"/></svg>';
  var themes = {
    mario: "Mario",
    zelda: "Zelda",
    pokemon: "Pokémon",
    samus: "Samus",
    donkey: "Donkey Kong",
    kirby: "Kirby",
    splatoon: "Splatoon",
    animal: "Animal Crossing",
  };
  var artwork = {
    mario: {
      icon: NP.u("wp-content/uploads/2026/02/975b574d5779b0bb4856b20c468b05ff2c0050ece8a57f1d91a799b999d7bde2.webp"),
      L: ["#b8000f", "#e60012", "#e60012", "#8f000b"],
      R: ["#e60012", "#ff3b30", "#e60012", "#b8000f"],
      pill: [["#ff3b30", "#e60012"]],
    },
    zelda: {
      icon: NP.u("wp-content/uploads/2026/09/zelda2.webp"),
      L: ["#0d5c37", "#14834f", "#2ba86d", "#083b23"],
      R: ["#2f7d32", "#47a04a", "#68bd69", "#1d5a20"],
    },
    pokemon: {
      icon: NP.u("wp-content/uploads/2026/09/ASHKETCHUIP.webp"),
      L: ["#1f2a55", "#33437e", "#55a5ff", "#131a38"],
      R: ["#d9a400", "#f5c400", "#ffd94a", "#795800"],
      pill: [["#ffd94a", "#f5c400"]],
    },
    samus: {
      icon: NP.u("wp-content/uploads/2026/09/MDc001.webp"),
      L: ["#5b2ec4", "#7b4ff0", "#9d78f7", "#3f1d91"],
      R: ["#d1490a", "#f56a1e", "#ff8a4f", "#9c3406"],
    },
    donkey: {
      icon: NP.u("wp-content/uploads/2026/09/DKBc053.webp"),
      L: ["#6b3a14", "#a56325", "#cc9044", "#4a260d"],
      R: ["#d49b16", "#f1bb32", "#ffd96a", "#79530a"],
    },
    kirby: {
      icon: NP.u("wp-content/uploads/2026/02/5a258ea9d44361caadaf88344778fe9916bb995f337e91cf88d9a4896a0321fd.webp"),
      L: ["#9e2f78", "#ed5ca8", "#ff9dcd", "#6b1750"],
      R: ["#8b5ad6", "#b58af2", "#d0b1ff", "#5a3598"],
    },
    splatoon: {
      icon: NP.u("wp-content/uploads/2026/02/4102b703dddd126db6fd3a9d6b9ed231421799154a5481e5b5e8ecb6404c2159.webp"),
      L: ["#64a70b", "#a4d90b", "#d2f54a", "#416900"],
      R: ["#5025aa", "#7b3fe4", "#ab79ff", "#31136d"],
      pill: [
        ["#a4d90b", "#64a70b"],
        ["#7b3fe4", "#5025aa"],
      ],
    },
    animal: {
      icon: NP.u("wp-content/uploads/2026/02/29419ee3e6b98083a8714f89b7730f09a96858eb7a88d99fff4875863ebd1df8.webp"),
      L: ["#2f7d32", "#4caf50", "#8bd36a", "#1d5220"],
      R: ["#1b9a8a", "#2cc3ad", "#7fe3d2", "#0f655b"],
      pill: [["#8bd36a", "#4caf50"]],
    },
  };
  var BAR_ART = {
    mario: [
      NP.u("wp-content/uploads/2026/10/mariofondo.webp"),
      NP.u("wp-content/uploads/2026/10/mariete-1.webp"),
      NP.u("wp-content/uploads/2026/10/barquitas.webp"),
    ],
    zelda: [
      NP.u("wp-content/uploads/2026/10/zeldaocarinaultrawide.webp"),
      NP.u("wp-content/uploads/2026/10/tears4k.webp"),
      NP.u("wp-content/uploads/2026/10/zedla2.webp"),
    ],
    pokemon: [
      NP.u("wp-content/uploads/2026/10/anime.webp"),
      NP.u("wp-content/uploads/2026/10/mayazo.webp"),
      NP.u("wp-content/uploads/2026/10/poke.webp"),
    ],
    samus: [
      NP.u("wp-content/uploads/2026/10/metroid3.webp"),
      NP.u("wp-content/uploads/2026/10/samus1.webp"),
      NP.u("wp-content/uploads/2026/10/metroid.webp"),
    ],
    donkey: [
      NP.u("wp-content/uploads/2026/10/donkeyultrawide-1.webp"),
      NP.u("wp-content/uploads/2026/10/konmgito.webp"),
      NP.u("wp-content/uploads/2026/10/RETROWALLPAPER.webp"),
    ],
    kirby: [
      NP.u("wp-content/uploads/2026/10/kirbyultra.webp"),
      NP.u("wp-content/uploads/2026/10/kirbys-2.webp"),
      NP.u("wp-content/uploads/2026/10/cirby.webp"),
    ],
    splatoon: [
      NP.u("wp-content/uploads/2026/10/splatoonultra.webp"),
      NP.u("wp-content/uploads/2026/10/splatoon.webp"),
      NP.u("wp-content/uploads/2026/10/splatoonn.webp"),
    ],
    animal: [
      NP.u("wp-content/uploads/2026/10/crossing9090.webp"),
      NP.u("wp-content/uploads/2026/10/crossing.webp"),
      NP.u("wp-content/uploads/2026/10/crossingss.webp"),
    ],
  };
  var COVER_NAMES = {
    mario: ["Castillo de Peach", "Paseo Nocturno", "Pesca Espacial"],
    zelda: ["Paseo con Epona", "Link en las Alturas", "Link y Zelda"],
    pokemon: ["Fan Art Anime", "Pueblo Aromaflor", "Mundito Pokopia"],
    samus: ["Héroe Espacial", "Samus Fan Art", "Vía Láctea"],
    donkey: ["Donkey Kong Country", "Atardecer con Diddy", "Retro Kong"],
    kirby: ["La Tierra Olvidada", "Cielo Espacial", "Caricatura Kirby"],
    splatoon: ["Spray Amarillo", "Fan Art Splatoon", "Diversión de Pintura"],
    animal: ["Islita Animal Crossing", "Mirada al Mar", "Muro Animal Crossing"],
  };
  function coverName(key, i) {
    return (COVER_NAMES[key] && COVER_NAMES[key][i]) || "Portada " + (i + 1);
  }
  var art,
    artLayers = [],
    artFront = 0,
    artCurrent = null;
  function defaults() {
    return {
      theme: "mario",
      picked: !1,
      paint: !1,
      intensity: 40,
      intensityVersion: 3,
      themeVersion: 8,
      coverVersion: 3,
      covers: {},
    };
  }
  function bounded(value, fallback, min, max, step) {
    if (typeof value !== "number" || !isFinite(value)) return fallback;
    return Math.max(min, Math.min(max, Math.round(value / step) * step));
  }
  function normalize(raw) {
    var value = defaults();
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      if (Object.prototype.hasOwnProperty.call(themes, raw.theme))
        value.theme = raw.theme;
      value.picked = raw.picked === !0;
      value.paint = raw.paint === !0;
      if (raw.themeVersion !== 8 && !value.picked) value.theme = "mario";
      var intensity =
        raw.intensityVersion !== 3 &&
        (raw.intensity === 25 || raw.intensity === 50)
          ? 40
          : raw.intensity;
      value.intensity = bounded(intensity, 40, 10, 100, 1);
      if (
        raw.covers &&
        typeof raw.covers === "object" &&
        !Array.isArray(raw.covers)
      ) {
        Object.keys(BAR_ART).forEach(function (key) {
          var n = raw.covers[key];
          if (typeof n === "number" && isFinite(n))
            value.covers[key] = Math.max(
              0,
              Math.min(BAR_ART[key].length - 1, Math.floor(n)),
            );
        });
        var cv = typeof raw.coverVersion === "number" ? raw.coverVersion : 1;
        function swapFirstTwo(key) {
          if (value.covers[key] === 0 || value.covers[key] === 1)
            value.covers[key] = 1 - value.covers[key];
        }
        if (cv < 2) swapFirstTwo("mario");
        if (cv < 3) {
          swapFirstTwo("donkey");
          swapFirstTwo("kirby");
        }
      }
    }
    return value;
  }
  function coverIndex(key) {
    var list = BAR_ART[key] || [];
    var n = preference && preference.covers ? preference.covers[key] : 0;
    return typeof n === "number" && n >= 0 && n < list.length ? n : 0;
  }
  function readPreference() {
    try {
      return normalize(JSON.parse(window.localStorage.getItem(storageKey)));
    } catch (error) {
      return defaults();
    }
  }
  function persist() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(preference));
      return !0;
    } catch (error) {
      return !1;
    }
  }
  function rgbChannels(hex) {
    var color = parseInt(hex.slice(1), 16);
    return [(color >> 16) & 255, (color >> 8) & 255, color & 255].join(", ");
  }
  function setColors() {
    var theme = artwork[preference.theme];
    [nav, panel].forEach(function (node) {
      [
        "--np-menu-primary-rgb",
        "--np-menu-secondary-rgb",
        "--np-menu-accent",
        "--np-menu-ac-1",
        "--np-menu-ac-2",
        "--np-menu-ac-3",
        "--np-menu-ac-deep",
        "--np-menu-ac-alt",
        "--np-menu-ring-mid",
      ].forEach(function (name) {
        node.style.removeProperty(name);
      });
      if (!theme) return;
      node.style.setProperty("--np-menu-primary-rgb", rgbChannels(theme.L[2]));
      node.style.setProperty(
        "--np-menu-secondary-rgb",
        rgbChannels(theme.R[2]),
      );
      node.style.setProperty("--np-menu-accent", theme.R[3]);
      [
        "--np-menu-ac-1",
        "--np-menu-ac-2",
        "--np-menu-ac-3",
        "--np-menu-ac-deep",
      ].forEach(function (name, index) {
        node.style.setProperty(name, theme.R[index]);
      });
      node.style.setProperty("--np-menu-ac-alt", theme.L[1]);
      node.style.setProperty("--np-menu-ring-mid", theme.R[2]);
    });
    ["", "-alt"].forEach(function (suf) {
      [
        "--np-pill-bg",
        "--np-pill-ink",
        "--np-pill-shadow",
        "--np-pill-top",
        "--np-pill-bot",
        "--np-pill-edge",
      ].forEach(function (name) {
        nav.style.removeProperty(name + suf);
      });
    });
    if (theme) {
      (theme.pill || [[theme.L[1], theme.L[0]]]).forEach(function (pal, i) {
        var suf = i ? "-alt" : "";
        var dark = luminance(pal[0]) > 0.42;
        nav.style.setProperty(
          "--np-pill-bg" + suf,
          "linear-gradient(180deg, rgba(255, 255, 255, .3), rgba(255, 255, 255, 0) 58%), linear-gradient(135deg, " +
            pal[0] +
            ", " +
            pal[1] +
            ")",
        );
        nav.style.setProperty(
          "--np-pill-ink" + suf,
          dark ? "#14240a" : "#ffffff",
        );
        nav.style.setProperty(
          "--np-pill-shadow" + suf,
          dark
            ? "0 1px 0 rgba(255, 255, 255, .45)"
            : "0 1px 2px rgba(0, 0, 0, .4)",
        );
        nav.style.setProperty(
          "--np-pill-top" + suf,
          mixHex(pal[0], "#ffffff", 0.2),
        );
        nav.style.setProperty("--np-pill-bot" + suf, pal[1]);
        nav.style.setProperty(
          "--np-pill-edge" + suf,
          mixHex(pal[1], "#000000", 0.38),
        );
      });
    }
    markPillAlt();
  }
  function markPillAlt() {
    var items = Array.prototype.filter.call(
      nav.querySelectorAll("#holaa_main_menu #menu-main-menu > li"),
      function (li) {
        return li.getClientRects().length > 0;
      },
    );
    var search = nav.querySelector(".np-search-wrap");
    if (search) items.push(search);
    items.forEach(function (el, i) {
      el.classList.toggle("np-pill-alt", i % 2 === 1);
    });
  }
  function mixHex(a, b, t) {
    var x = parseInt(a.slice(1), 16),
      y = parseInt(b.slice(1), 16);
    var r = Math.round(((x >> 16) & 255) * (1 - t) + ((y >> 16) & 255) * t);
    var g = Math.round(((x >> 8) & 255) * (1 - t) + ((y >> 8) & 255) * t);
    var bl = Math.round((x & 255) * (1 - t) + (y & 255) * t);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }
  function luminance(hex) {
    var c = parseInt(hex.slice(1), 16);
    var ch = [(c >> 16) & 255, (c >> 8) & 255, c & 255].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  function currentCover() {
    var list = BAR_ART[preference.theme] || [];
    return list[coverIndex(preference.theme)] || list[0] || "";
  }
  function setArt() {
    if (!art) return;
    var theme = artwork[preference.theme];
    if (theme)
      nav.style.setProperty("--np-bar-deep-rgb", rgbChannels(theme.L[3]));
    var url = currentCover();
    if (url === artCurrent) return;
    artCurrent = url;
    if (!url) {
      art.classList.add("np-bar-art--empty");
      artLayers.forEach(function (layer) {
        layer.classList.remove("is-on");
      });
      return;
    }
    art.classList.remove("np-bar-art--empty");
    var next = artLayers[1 - artFront];
    function show() {
      if (artCurrent !== url) return;
      next.style.backgroundImage = 'url("' + url + '")';
      void next.offsetWidth;
      next.classList.add("is-on");
      artLayers[artFront].classList.remove("is-on");
      artFront = 1 - artFront;
    }
    var probe = new Image();
    probe.decoding = "async";
    try {
      probe.fetchPriority = "high";
    } catch (e) {}
    probe.onload = show;
    probe.onerror = show;
    probe.src = url;
  }
  function loadInto(img, url) {
    if (!img || !url || img.getAttribute("src") === url) return;
    img.classList.remove("is-loaded");
    img.onload = function () {
      if (img.getAttribute("src") === url) img.classList.add("is-loaded");
    };
    img.onerror = img.onload;
    img.setAttribute("src", url);
    if (img.complete && img.naturalWidth) img.classList.add("is-loaded");
  }
  function renderCovers() {
    if (!controls || !controls.coverOptions) return;
    var key = preference.theme;
    var list = BAR_ART[key] || [];
    var idx = coverIndex(key);
    controls.coverTheme.textContent = themes[key];
    controls.coverCurrent.textContent = coverName(key, idx);
    controls.coverCurrent.title = coverName(key, idx);
    loadInto(controls.coverPreview, list[idx] || list[0]);
    controls.coverOptions.forEach(function (button, i) {
      var url = list[i];
      button.hidden = !url;
      var selected = i === idx;
      button.setAttribute("aria-checked", String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.querySelector(".np-cover-name").textContent = coverName(key, i);
      button.setAttribute(
        "aria-label",
        themes[key] +
          ", portada " +
          (i + 1) +
          ": " +
          coverName(key, i) +
          (selected ? " (elegida)" : ""),
      );
      if (coverOpen && url) loadInto(button.querySelector("img"), url);
    });
  }
  function animateCovers() {
    clearTimeout(coverEnterTimer);
    controls.cover.classList.remove("np-cover-entering");
    if (reducedMotion.matches || !coverOpen) return;
    void controls.cover.offsetWidth;
    controls.cover.classList.add("np-cover-entering");
    coverEnterTimer = setTimeout(function () {
      controls.cover.classList.remove("np-cover-entering");
    }, 900);
  }
  function setCoverOpen(open, focusFirst) {
    coverOpen = !!open;
    controls.cover.classList.toggle("is-open", coverOpen);
    controls.coverToggle.setAttribute("aria-expanded", String(coverOpen));
    controls.coverToggle.setAttribute(
      "aria-label",
      coverOpen ? "Ocultar portadas del menú" : "Elegir portada del menú",
    );
    if (coverOpen) {
      controls.coverDrawer.removeAttribute("inert");
      controls.coverDrawer.removeAttribute("aria-hidden");
    } else {
      controls.coverDrawer.setAttribute("inert", "");
      controls.coverDrawer.setAttribute("aria-hidden", "true");
    }
    renderCovers();
    animateCovers();
    if (coverOpen && focusFirst) {
      var selected = controls.coverDrawer.querySelector(
        '.np-cover-option[aria-checked="true"]',
      );
      if (selected)
        setTimeout(function () {
          selected.focus({ preventScroll: !0 });
        }, 60);
    }
    if (coverOpen && scroller) {
      setTimeout(function () {
        var sr = scroller.getBoundingClientRect(),
          cr = controls.cover.getBoundingClientRect();
        var delta = cr.bottom - sr.bottom + 12;
        if (delta > 0) {
          var top = scroller.scrollTop + Math.min(delta, cr.top - sr.top - 12);
          try {
            scroller.scrollTo({
              top: top,
              behavior: reducedMotion.matches ? "auto" : "smooth",
            });
          } catch (e) {
            scroller.scrollTop = top;
          }
        }
      }, 300);
    }
  }
  function chooseCover(index) {
    var key = preference.theme;
    var list = BAR_ART[key] || [];
    if (index < 0 || index >= list.length) return;
    preference.covers[key] = index;
    apply();
    persist();
  }
  function apply() {
    nav.setAttribute("data-np-menu-theme", preference.theme);
    panel.setAttribute("data-np-menu-theme", preference.theme);
    var themeArt = artwork[preference.theme];
    if (themeArt && luminance(themeArt.L[2]) > 0.45)
      panel.setAttribute("data-np-light", "");
    else panel.removeAttribute("data-np-light");
    nav.setAttribute("data-np-pill-mode", preference.paint ? "theme" : "own");
    if (controls && controls.paint) {
      controls.paint.setAttribute("aria-checked", String(preference.paint));
      panel.classList.toggle("np-paint-on", preference.paint);
    }
    nav.style.setProperty(
      "--np-menu-opacity",
      String(preference.intensity / 100),
    );
    var t = Math.max(0, Math.min(1, (preference.intensity - 10) / 90));
    nav.style.setProperty("--np-int-t", t.toFixed(3));
    panel.style.setProperty("--np-int-pct", (t * 100).toFixed(1) + "%");
    setColors();
    setArt();
    controls.choices.forEach(function (button) {
      var selected = button.getAttribute("data-np-theme") === preference.theme;
      button.setAttribute("aria-checked", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    controls.intensity.value = String(preference.intensity);
    controls.intensityValue.textContent = preference.intensity + "%";
    renderCovers();
    trigger.title = "Personalizar menú · " + themes[preference.theme];
  }
  function clearPaint() {
    clearTimeout(paintTimer);
    clearTimeout(clearPaintTimer);
    paintNodes.forEach(function (node) {
      node.remove();
    });
    paintNodes = [];
  }
  function clearMenuEntrance() {
    clearTimeout(menuDropTimer);
    if (nav) nav.classList.remove("np-menu-entering");
    dropNodes.forEach(function (node) {
      node.style.removeProperty("--np-ds-drop-delay");
    });
    dropNodes = [];
  }
  function enterMenu() {
    clearMenuEntrance();
    if (!nav || !desktop.matches || reducedMotion.matches) return;
    dropNodes = Array.prototype.slice.call(
      nav.querySelectorAll("#holaa_main_menu #menu-main-menu > li"),
    );
    var actions = nav.querySelector(".nav-right-part-desktop");
    if (actions) dropNodes.push(actions);
    dropNodes.forEach(function (node, index) {
      node.style.setProperty(
        "--np-ds-drop-delay",
        Math.min(index * 65, 455) + "ms",
      );
    });
    void nav.offsetWidth;
    nav.classList.add("np-menu-entering");
    menuDropTimer = setTimeout(clearMenuEntrance, 1150);
  }
  function clearPanelEntrance() {
    clearTimeout(panelDropTimer);
    if (panel) panel.classList.remove("np-personalizer-entering");
  }
  function enterPanel() {
    clearPanelEntrance();
    if (reducedMotion.matches) return;
    panel.classList.add("np-personalizer-entering");
    panelDropTimer = setTimeout(clearPanelEntrance, 1200);
  }
  function repaint() {
    clearPaint();
    if (reducedMotion.matches || !desktop.matches) return;
    var targets = nav.querySelectorAll(
      "#holaa_main_menu #menu-main-menu > li > a, .np-search-wrap .header_search_btn",
    );
    Array.prototype.forEach.call(targets, function (host, index) {
      var node = document.createElement("span");
      node.className = "np-menu-paint";
      node.setAttribute("aria-hidden", "true");
      node.style.transitionDelay = Math.min(index * 25, 150) + "ms, 0ms";
      host.appendChild(node);
      paintNodes.push(node);
    });
    void nav.offsetWidth;
    paintNodes.forEach(function (node) {
      node.classList.add("np-menu-paint-fill");
    });
    paintTimer = setTimeout(function () {
      paintNodes.forEach(function (node) {
        node.style.transitionDelay = "0ms";
        node.classList.add("np-menu-paint-fade");
      });
    }, 820);
    clearPaintTimer = setTimeout(clearPaint, 1120);
  }
  function makeInert(node) {
    if (
      node.nodeType !== 1 ||
      node === panel ||
      /^(SCRIPT|STYLE|LINK)$/.test(node.tagName) ||
      node.id === "wii-cursor-global" ||
      node.hasAttribute("inert")
    )
      return;
    node.setAttribute("inert", "");
    inertNodes.push(node);
  }
  function lockBackground() {
    inertNodes = [];
    scrollLocks = [];
    Array.prototype.forEach.call(document.body.children, makeInert);
    // Lo que se añada a <body> mientras el panel está abierto también queda inerte.
    if (window.MutationObserver) {
      if (inertObserver) inertObserver.disconnect();
      inertObserver = new MutationObserver(function (records) {
        records.forEach(function (r) {
          Array.prototype.forEach.call(r.addedNodes, function (node) {
            if (node.parentNode === document.body) makeInert(node);
          });
        });
      });
      inertObserver.observe(document.body, { childList: !0 });
    }
    [document.documentElement, document.body].forEach(function (node) {
      if (node.classList.contains("np-menu-scroll-lock")) return;
      node.classList.add("np-menu-scroll-lock");
      scrollLocks.push(node);
    });
  }
  function unlockBackground() {
    if (inertObserver) {
      inertObserver.disconnect();
      inertObserver = null;
    }
    inertNodes.forEach(function (node) {
      node.removeAttribute("inert");
    });
    scrollLocks.forEach(function (node) {
      node.classList.remove("np-menu-scroll-lock");
    });
    inertNodes = [];
    scrollLocks = [];
  }
  function focusSelected() {
    var selected = panel.querySelector('.np-theme-card[aria-checked="true"]');
    if (selected) selected.focus({ preventScroll: !0 });
  }
  function finishClose() {
    clearTimeout(closingTimer);
    clearPanelEntrance();
    panel.hidden = !0;
    panel.classList.remove("np-menu-personalizer-closing");
    if (coverOpen) setCoverOpen(!1);
    unlockBackground();
    if (savedScrollY !== null) {
      var y = savedScrollY;
      savedScrollY = null;
      if (Math.abs(window.pageYOffset - y) > 1) {
        try {
          window.scrollTo({ top: y, left: window.pageXOffset, behavior: "instant" });
        } catch (e) {
          window.scrollTo(window.pageXOffset, y);
        }
      }
    }
    if (closingReturnFocus) {
      if (desktop.matches) {
        if (trigger.isConnected) trigger.focus({ preventScroll: !0 });
      } else {
        // Móvil: vuelve a quien lo abrió o, si ya no se ve (p. ej. el
        // enlace del menú lateral cerrado), al botón hamburguesa.
        var target = focusable(opener)
          ? opener
          : document.getElementById("navigation-button") ||
            document.querySelector(".menu_btn");
        if (focusable(target)) target.focus({ preventScroll: !0 });
      }
    }
    opener = null;
    closingReturnFocus = !1;
  }
  function focusable(el) {
    if (!el || !el.isConnected || el.closest("[inert]")) return !1;
    if (el.closest("#sidebar-menu:not(.show_menu)")) return !1;
    if (!el.getClientRects().length) return !1;
    var cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none";
  }
  function close(returnFocus, immediately) {
    if (!panel || panel.hidden) return;
    clearPanelEntrance();
    closingReturnFocus = returnFocus;
    trigger.setAttribute("aria-expanded", "false");
    if (immediately || reducedMotion.matches) {
      finishClose();
      return;
    }
    if (panel.classList.contains("np-menu-personalizer-closing")) return;
    panel.classList.add("np-menu-personalizer-closing");
    closingTimer = setTimeout(finishClose, 500);
  }
  function placeSheet() {
    if (desktop.matches || !panel) return;
    if (window.pageYOffset > 0) {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } catch (e) {
        window.scrollTo(0, 0);
      }
    }
    var ref = art || bar;
    var bottom = ref ? ref.getBoundingClientRect().bottom : 0;
    panel.style.setProperty(
      "--np-sheet-top",
      Math.max(60, Math.round(bottom + 10)) + "px",
    );
  }
  function open(from) {
    if (!panel || !panel.hidden) return;
    opener =
      from && from.nodeType === 1
        ? from
        : document.activeElement !== document.body
          ? document.activeElement
          : null;
    savedScrollY = window.pageYOffset;
    placeSheet();
    clearTimeout(closingTimer);
    panel.classList.remove("np-menu-personalizer-closing");
    enterPanel();
    panel.hidden = !1;
    trigger.setAttribute("aria-expanded", "true");
    playOpenSound();
    lockBackground();
    renderCovers();
    if (scroller) scroller.scrollTop = 0;
    scrollbarUpdate();
    if (!desktop.matches) {
      var row = panel.querySelector(".np-theme-choices");
      var card = panel.querySelector('.np-theme-card[aria-checked="true"]');
      if (row && card)
        row.scrollLeft =
          card.offsetLeft - (row.clientWidth - card.offsetWidth) / 2;
    }
    focusSelected();
  }
  function choose(button) {
    var next = button.getAttribute("data-np-theme");
    var themeChanged = preference.theme !== next;
    var changed = themeChanged || !preference.picked;
    preference.theme = next;
    preference.picked = !0;
    apply();
    if (changed) repaint();
    if (themeChanged && coverOpen) animateCovers();
    persist();
  }
  function trapFocus(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (coverOpen) {
        setCoverOpen(!1);
        controls.coverToggle.focus();
        return;
      }
      close(!0);
      return;
    }
    if (event.key !== "Tab") return;
    var focusable = Array.prototype.filter.call(
      box.querySelectorAll('button, input, a[href], [tabindex="0"]'),
      function (node) {
        return (
          !node.disabled &&
          !node.hidden &&
          node.tabIndex >= 0 &&
          !node.closest("[inert]") &&
          node.getClientRects().length
        );
      },
    );
    if (!focusable.length) {
      event.preventDefault();
      box.focus();
      return;
    }
    var first = focusable[0],
      last = focusable[focusable.length - 1];
    if (
      event.shiftKey &&
      (document.activeElement === first ||
        !box.contains(document.activeElement))
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last || !box.contains(document.activeElement))
    ) {
      event.preventDefault();
      first.focus();
    }
  }
  function coverMarkup() {
    var logged = document.body.classList.contains("logged-in");
    var options = [0, 1, 2]
      .map(function (i) {
        return (
          '<button type="button" class="np-cover-option" role="radio" aria-checked="false" data-np-cover="' +
          i +
          '" style="--np-cover-delay:' +
          i * 70 +
          'ms">' +
          '<span class="np-cover-thumb"><img loading="lazy" alt="" width="320" height="160" decoding="async" draggable="false"></span>' +
          '<span class="np-cover-num">Portada ' +
          (i + 1) +
          "</span>" +
          '<span class="np-cover-name">' +
          coverName("mario", i) +
          "</span>" +
          '<span class="np-cover-check" aria-hidden="true">' +
          CHECK_ICO +
          "</span></button>"
        );
      })
      .join("");
    var locked = logged
      ? ""
      : '<a class="np-cover-locked" href="' + NP.u("mi-cuenta") + '" style="--np-cover-delay:210ms" aria-label="Más portadas: crea tu cuenta y sube de nivel para desbloquearlas">' +
        '<span class="np-cover-thumb"><span class="np-cover-lock">' +
        LOCK_ICO +
        "</span></span>" +
        '<span class="np-cover-num">Bloqueadas</span>' +
        '<span class="np-cover-name">Más portadas</span>' +
        '<span class="np-cover-sub">Crea tu cuenta</span></a>';
    var note = logged
      ? ""
      : '<p class="np-cover-unlock">' +
        LOCK_ICO +
        "<span>Inicia sesión: en tu cuenta podrás desbloquear más portadas para el menú a medida que subas de nivel.</span></p>";
    return (
      '<div class="np-cover">' +
      '<div class="np-cover-row">' +
      '<span class="np-cover-preview" aria-hidden="true"><img loading="lazy" alt="" width="256" height="92" decoding="async" draggable="false"></span>' +
      '<div class="np-cover-text"><span class="np-cover-title" id="np-cover-title">Portada del menú</span>' +
      '<span class="np-cover-desc">Elige la imagen de fondo de tu barra · <b class="np-cover-theme">Mario</b></span>' +
      '<span class="np-cover-current">' +
      coverName("mario", 0) +
      "</span></div>" +
      '<button type="button" class="np-cover-toggle" aria-expanded="false" aria-controls="np-cover-drawer" aria-label="Elegir portada del menú">' +
      COVER_ICO +
      "<span>Portadas</span>" +
      CHEV_ICO +
      "</button>" +
      "</div>" +
      '<div class="np-cover-drawer" id="np-cover-drawer" inert aria-hidden="true"><div class="np-cover-drawer-inner">' +
      '<div class="np-cover-grid' +
      (logged ? " np-cover-grid--3" : "") +
      '" role="radiogroup" aria-labelledby="np-cover-title">' +
      options +
      locked +
      "</div>" +
      note +
      "</div></div></div>"
    );
  }
  function setupScrollbar() {
    scroller = box.querySelector(".np-personalizer-scroll");
    var rail = box.querySelector(".np-scrollbar");
    var thumb = rail && rail.querySelector(".np-scrollbar-thumb");
    if (!scroller || !rail || !thumb) return function () {};
    var frame = 0;
    function update() {
      frame = 0;
      var sh = scroller.scrollHeight,
        ch = scroller.clientHeight;
      var over = sh - ch > 1;
      box.classList.toggle("np-scroll-on", over);
      if (!over) return;
      var track = rail.clientHeight;
      var h = Math.max(40, Math.round((track * ch) / sh));
      var y = (track - h) * (scroller.scrollTop / (sh - ch));
      thumb.style.height = h + "px";
      thumb.style.transform =
        "translate3d(0," +
        Math.max(0, Math.min(track - h, y)).toFixed(1) +
        "px,0)";
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    scroller.addEventListener("scroll", schedule, { passive: !0 });
    window.addEventListener("resize", schedule);
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(schedule);
      ro.observe(scroller);
      Array.prototype.forEach.call(scroller.children, function (child) {
        ro.observe(child);
      });
    }
    function blockSelect(ev) {
      ev.preventDefault();
    }
    thumb.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      var startY = e.clientY,
        startTop = scroller.scrollTop;
      var ratio =
        (scroller.scrollHeight - scroller.clientHeight) /
        Math.max(1, rail.clientHeight - thumb.offsetHeight);
      var id = e.pointerId;
      try {
        thumb.setPointerCapture(id);
      } catch (err) {}
      rail.classList.add("is-dragging");
      box.classList.add("np-scroll-dragging");
      document.addEventListener("selectstart", blockSelect);
      function move(ev) {
        if (ev.pointerId !== id) return;
        scroller.scrollTop = startTop + (ev.clientY - startY) * ratio;
      }
      function up(ev) {
        if (ev && ev.pointerId !== undefined && ev.pointerId !== id) return;
        rail.classList.remove("is-dragging");
        box.classList.remove("np-scroll-dragging");
        document.removeEventListener("selectstart", blockSelect);
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("pointercancel", up);
        window.removeEventListener("blur", up);
        try {
          thumb.releasePointerCapture(id);
        } catch (err) {}
      }
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
      document.addEventListener("pointercancel", up);
      window.addEventListener("blur", up);
    });
    rail.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });
    rail.addEventListener("pointerdown", function (e) {
      if (e.target !== rail || e.button !== 0) return;
      var r = thumb.getBoundingClientRect();
      var dir = e.clientY < r.top ? -1 : 1;
      var amount = dir * scroller.clientHeight * 0.85;
      try {
        scroller.scrollBy({
          top: amount,
          behavior: reducedMotion.matches ? "auto" : "smooth",
        });
      } catch (err) {
        scroller.scrollTop += amount;
      }
    });
    rail.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        scroller.scrollTop += e.deltaY;
      },
      { passive: !1 },
    );
    schedule();
    return schedule;
  }
  function init() {
    if (trigger) return;
    nav = document.querySelector("nav.np-desktop-glass");
    bar = nav && nav.querySelector(".container.custom-container");
    var list = nav && nav.querySelector("#holaa_main_menu #menu-main-menu");
    if (
      !bar ||
      !list ||
      !document.body ||
      bar.querySelector(":scope > .np-menu-palette-btn")
    )
      return;
    var username =
      typeof window.NP_USUARIO === "string"
        ? window.NP_USUARIO.trim().toLowerCase()
        : "";
    storageKey =
      "np-menu-style:v1:" +
      (username ? "user:" + encodeURIComponent(username) : "guest");
    preference = readPreference();
    trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "np-menu-palette-btn";
    trigger.setAttribute("aria-label", "Ajustes del menú");
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "np-menu-personalizer");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = PALETTE_SVG;
    panel = document.createElement("div");
    panel.id = "np-menu-personalizer";
    panel.className = "np-menu-personalizer";
    panel.hidden = !0;
    var choices = Object.keys(themes)
      .map(function (key, index) {
        var theme = artwork[key];
        var art = theme.icon
          ? '<img loading="lazy" src="' +
            theme.icon +
            '" alt="" width="120" height="120" decoding="async">'
          : '<svg viewBox="-7 -7 38 38" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5" fill="#fff" fill-opacity=".55" stroke="#5a7088" stroke-width="2.2"/><path d="M6.2 17.8 17.8 6.2" stroke="#5a7088" stroke-width="2.2" stroke-linecap="round"/></svg>';
        var background =
          ' style="--np-menu-chip-background:radial-gradient(circle at 28% 12%,rgba(255,255,255,.5),transparent 62%),linear-gradient(145deg,' +
          theme.L[2] +
          " 0%," +
          theme.L[1] +
          " 48%," +
          theme.R[1] +
          ' 100%)"';
        var cardStyle =
          ' style="--np-card-primary-rgb:' +
          rgbChannels(theme.L[2]) +
          ";--np-card-secondary-rgb:" +
          rgbChannels(theme.R[2]) +
          ";--np-card-accent:" +
          theme.R[1] +
          ";--np-card-ink:" +
          theme.R[3] +
          ";--np-card-drop-delay:" +
          index * 55 +
          'ms"';
        var artClass = "np-theme-card-art";
        return (
          '<button type="button" class="np-theme-card np-theme-card--' +
          key +
          '"' +
          cardStyle +
          ' role="radio" aria-checked="false" data-np-theme="' +
          key +
          '"><span class="' +
          artClass +
          '"' +
          background +
          ">" +
          art +
          '</span><span class="np-theme-card-name">' +
          themes[key] +
          '</span><span class="np-theme-card-check" aria-hidden="true">✓</span></button>'
        );
      })
      .join("");
    panel.innerHTML =
      '<div class="np-personalizer-scrim" aria-hidden="true"></div><section class="np-personalizer-box" role="dialog" aria-modal="true" aria-labelledby="np-menu-personalizer-title" aria-describedby="np-menu-personalizer-description" tabindex="-1">' +
      '<div class="np-personalizer-scroll">' +
      '<div class="np-personalizer-heading"><div><h2 id="np-menu-personalizer-title">Personaliza Tu Menú</h2><p id="np-menu-personalizer-description">Elige Tu Temática Favorita</p></div><button type="button" class="np-personalizer-close" aria-label="Cerrar personalización"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.4 7.4l9.2 9.2M16.6 7.4l-9.2 9.2" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3.4" stroke-linecap="round" transform="translate(0 1)"/><path d="M7.4 7.4l9.2 9.2M16.6 7.4l-9.2 9.2" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg></button></div>' +
      '<div class="np-theme-choices" role="radiogroup" aria-label="Temática del menú">' +
      choices +
      "</div>" +
      coverMarkup() +
      '<div class="np-paint"><div class="np-paint-text"><span class="np-paint-title" id="np-paint-title">Pintar botones</span>' +
      '<span class="np-paint-desc" id="np-paint-desc">Pinta todos los botones del menú con el color de la temática</span>' +
      '<span class="np-paint-dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span></div>' +
      '<button type="button" class="np-paint-switch" role="switch" aria-checked="false" aria-labelledby="np-paint-title" aria-describedby="np-paint-desc"><span class="np-paint-knob"></span></button></div>' +
      '<div class="np-personalizer-settings np-personalizer-settings--intensity"><div class="np-intensity">' +
      '<div class="np-intensity-head"><label for="np-menu-intensity">Intensidad del color</label><output id="np-menu-intensity-value" for="np-menu-intensity">40%</output></div>' +
      '<input id="np-menu-intensity" type="range" min="10" max="100" step="1" value="40" aria-describedby="np-menu-intensity-hint">' +
      '<div class="np-intensity-scale" id="np-menu-intensity-hint"><span>Suave · se ve el fondo</span><span>Intenso · color de la temática</span></div>' +
      "</div></div>" +
      '<div class="np-personalizer-footer"><button type="button" class="np-personalizer-done">Listo</button></div>' +
      "</div>" +
      '<div class="np-scrollbar" aria-hidden="true"><span class="np-scrollbar-thumb"></span></div></section>';
    bar.appendChild(trigger);
    art = document.createElement("span");
    art.className = "np-bar-art np-bar-art--empty";
    art.setAttribute("aria-hidden", "true");
    art.innerHTML =
      '<span class="np-bar-art-photo"></span><span class="np-bar-art-photo"></span>';
    artLayers = Array.prototype.slice.call(art.children);
    bar.insertBefore(art, bar.firstChild);
    document.body.appendChild(panel);
    box = panel.querySelector(".np-personalizer-box");
    controls = {
      choices: Array.prototype.slice.call(
        panel.querySelectorAll("[data-np-theme]"),
      ),
      intensity: panel.querySelector("#np-menu-intensity"),
      intensityValue: panel.querySelector("#np-menu-intensity-value"),
      paint: panel.querySelector(".np-paint-switch"),
      cover: panel.querySelector(".np-cover"),
      coverToggle: panel.querySelector(".np-cover-toggle"),
      coverDrawer: panel.querySelector(".np-cover-drawer"),
      coverPreview: panel.querySelector(".np-cover-preview img"),
      coverTheme: panel.querySelector(".np-cover-theme"),
      coverCurrent: panel.querySelector(".np-cover-current"),
      coverOptions: Array.prototype.slice.call(
        panel.querySelectorAll(".np-cover-option"),
      ),
    };
    scrollbarUpdate = setupScrollbar();
    trigger.addEventListener("click", function () {
      open(trigger);
    });
    [
      ".np-personalizer-close",
      ".np-personalizer-done",
      ".np-personalizer-scrim",
    ].forEach(function (selector) {
      panel.querySelector(selector).addEventListener("click", function () {
        close(!0);
      });
    });
    box.addEventListener("animationend", function (event) {
      if (
        event.target === box &&
        (event.animationName === "np-menu-suck" ||
          event.animationName === "npSheetDown") &&
        panel.classList.contains("np-menu-personalizer-closing")
      )
        finishClose();
    });
    controls.choices.forEach(function (button, index) {
      button.addEventListener("click", function () {
        choose(button);
      });
      button.addEventListener("keydown", function (event) {
        var next;
        if (event.key === "ArrowRight" || event.key === "ArrowDown")
          next = (index + 1) % controls.choices.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
          next =
            (index + controls.choices.length - 1) % controls.choices.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = controls.choices.length - 1;
        else return;
        event.preventDefault();
        choose(controls.choices[next]);
        controls.choices[next].focus();
      });
    });
    controls.coverToggle.addEventListener("click", function (event) {
      setCoverOpen(!coverOpen, event.detail === 0);
    });
    controls.cover.addEventListener("click", function (event) {
      if (event.button !== 0) return;
      var target = event.target instanceof Element ? event.target : null;
      if (!target || target.closest(".np-cover-toggle, .np-cover-drawer"))
        return;
      setCoverOpen(!coverOpen, !1);
    });
    controls.coverOptions.forEach(function (button, index) {
      button.addEventListener("click", function () {
        chooseCover(index);
      });
      button.addEventListener("keydown", function (event) {
        var visible = controls.coverOptions.filter(function (b) {
          return !b.hidden;
        });
        var pos = visible.indexOf(button),
          next;
        if (event.key === "ArrowRight" || event.key === "ArrowDown")
          next = (pos + 1) % visible.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
          next = (pos + visible.length - 1) % visible.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = visible.length - 1;
        else return;
        event.preventDefault();
        var target = visible[next];
        chooseCover(controls.coverOptions.indexOf(target));
        target.focus();
      });
    });
    controls.intensity.addEventListener("input", function () {
      clearPaint();
      preference.intensity = Number(this.value);
      // Un solo apply() por frame aunque lleguen muchos "input" seguidos.
      if (!intensityFrame)
        intensityFrame = requestAnimationFrame(function () {
          intensityFrame = 0;
          apply();
        });
    });
    controls.intensity.addEventListener("change", function () {
      if (intensityFrame) {
        cancelAnimationFrame(intensityFrame);
        intensityFrame = 0;
        apply();
      }
      persist();
    });
    controls.paint.addEventListener("click", function () {
      preference.paint = !preference.paint;
      apply();
      repaint();
      persist();
    });
    panel.addEventListener("keydown", trapFocus);
    document.addEventListener("focusin", function (event) {
      if (!panel.hidden && !box.contains(event.target)) focusSelected();
    });
    window.addEventListener("storage", function (event) {
      if (event.key === storageKey || event.key === null) {
        clearPaint();
        preference = readPreference();
        apply();
      }
    });
    apply();
    addMobileEntry();
  }
  function addMobileEntry() {
    var list = document.querySelector(
      "#sidebar-menu .mobile_menu_nav .menu_list",
    );
    if (!list || list.querySelector(".np-menu-personalizar-item")) return;
    var li = document.createElement("li");
    li.className = "menu-item np-menu-personalizar-item";
    var a = document.createElement("a");
    a.href = "#personalizar-menu";
    a.setAttribute("role", "button");
    a.className = "np-menu-personalizar-link";
    a.innerHTML =
      '<span class="np-menu-personalizar-ico" aria-hidden="true">' +
      PALETTE_SVG.replace(/np3dsIco/g, "np3dsIcoM") +
      "</span> PERSONALIZAR MENÚ";
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var menu = document.getElementById("sidebar-menu");
      var wasOpen = menu && menu.classList.contains("show_menu");
      if (wasOpen) {
        var btn = menu.querySelector(
          ".close_button button.close, button.close",
        );
        if (btn) btn.click();
        else menu.classList.remove("show_menu");
        afterSidebarClosed(menu, function () {
          open(a);
        });
      } else open(a);
    });
    // role="button": también se activa con la barra espaciadora.
    a.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        a.click();
      }
    });
    li.appendChild(a);
    list.appendChild(li);
  }
  // Espera al final del fundido de cierre del menú lateral (transitionend de
  // "opacity") con un temporizador de respaldo calculado del propio CSS.
  function afterSidebarClosed(menu, cb) {
    var done = !1,
      timer = 0;
    function finish(e) {
      if (e && e.type === "transitionend" && (e.target !== menu || e.propertyName !== "opacity"))
        return;
      if (done) return;
      done = !0;
      clearTimeout(timer);
      menu.removeEventListener("transitionend", finish);
      cb();
    }
    var ms = 0;
    try {
      var cs = getComputedStyle(menu);
      var dur = String(cs.transitionDuration || "0s").split(","),
        del = String(cs.transitionDelay || "0s").split(",");
      dur.forEach(function (d, i) {
        var t =
          (parseFloat(d) || 0) * (/ms\s*$/.test(d) ? 1 : 1000) +
          (parseFloat(del[i % del.length]) || 0) *
            (/ms\s*$/.test(del[i % del.length]) ? 1 : 1000);
        if (t > ms) ms = t;
      });
    } catch (err) {
      ms = 420;
    }
    if (!ms) {
      cb();
      return;
    }
    menu.addEventListener("transitionend", finish);
    timer = setTimeout(finish, Math.min(ms, 1000) + 50);
  }
  function resize() {
    if (!desktop.matches) {
      clearPaint();
      clearMenuEntrance();
    }
    if (panel && !panel.hidden) {
      placeSheet();
      scrollbarUpdate();
    }
  }
  function motionChange() {
    if (!reducedMotion.matches) return;
    clearPaint();
    clearMenuEntrance();
    clearPanelEntrance();
    if (panel && panel.classList.contains("np-menu-personalizer-closing"))
      finishClose();
  }
  if (desktop.addEventListener) desktop.addEventListener("change", resize);
  else desktop.addListener(resize);
  if (reducedMotion.addEventListener)
    reducedMotion.addEventListener("change", motionChange);
  else reducedMotion.addListener(motionChange);
  init();
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("DOMContentLoaded", function () {
    if (nav && trigger) markPillAlt();
  });
  var INTRO_KEY = "np-menu-intro:v1";
  function reveal() {
    var bar = document.querySelector("nav.np-desktop-glass.np-menu-wait");
    if (!bar) return;
    var first = !0;
    try {
      first = !window.sessionStorage.getItem(INTRO_KEY);
    } catch (error) {}
    bar.classList.remove("np-menu-wait");
    if (nav && trigger) markPillAlt();
    if (first && nav === bar && desktop.matches && !reducedMotion.matches) {
      try {
        window.sessionStorage.setItem(INTRO_KEY, "1");
      } catch (error) {}
      enterMenu();
    }
  }
  if (document.readyState === "complete") reveal();
  else window.addEventListener("load", reveal, { once: !0 });
  setTimeout(reveal, 6000);
})();
